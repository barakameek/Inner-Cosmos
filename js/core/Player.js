// js/core/Player.js

import { DeckManager } from './DeckManager.js';
import { Artifact } from './Artifact.js';
import { Card } from './Card.js'; // Needed for status cards, potentially artifact effects
import * as Data from '../../data.js'; // For default deck/attunements

// --- Constants ---
const BASE_FOCUS = 3;
const BASE_INTEGRITY = 70;

/**
 * Represents the player character during a run.
 */
export class Player {
    constructor(playerData = {}, metaProgression = null) {
        console.log("Creating Player instance...");
        this.gameStateRef = null; // Will be set by GameState after creation

        // --- Core Identity ---
        this.name = playerData?.name || "Alchemist"; // Use provided name or default

        // --- Meta Progression Bonuses ---
        // Fetch bonuses first before calculating base stats
        const startingIntegrityBonus = metaProgression?.getStartingBonus('maxIntegrityBonus') || 0;
        const baseIntegrity = metaProgression?.getStartingBonus('baseIntegrity') || BASE_INTEGRITY;
        const baseFocus = metaProgression?.getStartingBonus('baseFocus') || BASE_FOCUS;
        const focusSlotsBonus = metaProgression?.getStartingBonus('focusSlotsBonus') || 0;
        const startingInsightBonus = metaProgression?.getStartingBonus('startingInsightBonus') || 0;

        // --- Attunements ---
        // Start with defaults, apply meta bonuses, then apply specific playerData
        const baseAttunements = this.getDefaultAttunements();
        this.attunements = { ...baseAttunements };

        if (metaProgression) {
            // Apply specific element bonuses
            for (const key in this.attunements) {
                if (this.attunements.hasOwnProperty(key)) {
                    const bonus = metaProgression.getStartingBonus(`attunementBonus.${key}`);
                    if (bonus) this.attunements[key] += bonus;
                }
            }
            // Apply 'All' bonus
            const allBonus = metaProgression.getStartingBonus('attunementBonus.All');
            if (allBonus) {
                for (const key in this.attunements) {
                    if (this.attunements.hasOwnProperty(key)) this.attunements[key] += allBonus;
                }
            }
        }
        // Override with specific playerData attunements if provided (e.g., from archetype selection)
        if (playerData?.attunements) {
            this.attunements = { ...this.attunements, ...playerData.attunements };
        }

        // --- Calculate Derived Stats AFTER Attunements are Finalized ---
        this.maxIntegrity = baseIntegrity + startingIntegrityBonus;
        this.currentIntegrity = this.maxIntegrity; // Start at full health

        const finalStartingCog = this.attunements.Cognitive || 5; // Use the final calculated attunement
        this.maxFocus = baseFocus + focusSlotsBonus + Math.floor(finalStartingCog / 3); // Example scaling: +1 Max Focus per 3 Cognitive
        this.currentFocus = this.maxFocus; // Start at full focus

        // --- Deck & Hand ---
        // DeckManager is instantiated here but needs playerRef later
        const startingDeckIds = playerData?.startingDeck || this.getDefaultDeckIds();
        this.deckManager = new DeckManager(startingDeckIds);
        // Player reference will be set by GameState using deckManager.setPlayerReference(this)

        // --- Run-Specific Progress ---
        this.insightThisRun = startingInsightBonus; // Start with bonus insight

        // --- Combat State ---
        this.currentBlock = 0;
        this.activeStatusEffects = []; // Array of { id, duration, amount, source }

        // --- Artifacts ---
        // Ensure starting artifacts are valid and create Artifact instances
        const startingArtifactIds = playerData?.startingArtifacts || [];
        this.artifacts = startingArtifactIds
            .map(artId => {
                try { return new Artifact(artId); }
                catch (error) { console.error(`Failed to create starting artifact ${artId}:`, error); return null; }
            })
            .filter(a => a && a.id !== 'error_artifact'); // Filter out errors

        // TODO: Add starting artifacts from meta progression unlocks if applicable

        console.log(`Player created: ${this.name}`);
        console.log(` > Integrity: ${this.currentIntegrity}/${this.maxIntegrity}`);
        console.log(` > Focus: ${this.currentFocus}/${this.maxFocus}`);
        console.log(` > Attunements:`, this.attunements);
        console.log(` > Starting Deck Size: ${this.deckManager.masterDeck.length}`);
        console.log(` > Starting Artifacts: ${this.artifacts.map(a=>a.name).join(', ') || 'None'}`);
    }

    /** Links this player instance back to the main GameState. Called by GameState. */
    setGameState(gameState) {
        if (!gameState) {
            console.error("Player Error: Attempted to set invalid GameState reference.");
            return;
        }
        this.gameStateRef = gameState;
    }

    // --- Combat Lifecycle ---

    /** Prepares the player for combat. Called by CombatManager. */
    startCombat() {
        console.log("Player: Starting Combat...");
        this.currentBlock = 0;
        this.activeStatusEffects = []; // Clear statuses from previous fight

        this.deckManager.resetForCombat(); // Reset deck piles FIRST

        // --- Trigger onCombatStart BEFORE gaining focus/drawing hand ---
        this.triggerArtifacts('onCombatStart');
        // --- End Trigger ---

        this.gainFocus(this.maxFocus); // Gain focus AFTER combat start triggers
        this.drawInitialHand(); // Draws hand AND triggers onCardsDrawn AFTER focus gain

        console.log("Player combat setup complete.");
    }

    /** Starts the player's turn. Called by CombatManager. */
    startTurn() {
        console.log(`Player: Starting Turn ${this.gameStateRef?.combatManager?.turnNumber || '?'}`);
        this.currentBlock = 0; // Block resets each turn

        // --- Trigger onTurnStart BEFORE other turn actions ---
        this.triggerArtifacts('onTurnStart');
        // --- End Trigger ---

        this.gainFocus(this.maxFocus); // Gain focus AFTER turn start triggers

        this.tickStatusEffects('start'); // Tick start-of-turn statuses AFTER focus gain

        // Check if player died from start-of-turn effects before drawing
        if (this.currentIntegrity <= 0) {
             console.log("Player died from start-of-turn effects.");
             // Combat end condition will be checked by CombatManager
             return;
        }

        this.drawCards(5); // Draw standard hand size AFTER ticking start effects & focus gain
    }

    /** Ends the player's turn. Called by CombatManager. */
    endTurn() {
        console.log("Player: Ending Turn...");
        // --- Trigger onTurnEnd BEFORE ticking end statuses/discarding ---
        this.triggerArtifacts('onTurnEnd');
        // --- End Trigger ---

        this.tickStatusEffects('end'); // Tick end-of-turn statuses BEFORE discarding

        // --- Handle Ethereal cards ---
        // Create a copy as exhaustCardFromHand modifies the hand array during iteration
        const handAtTurnEnd = [...this.deckManager.hand];
        let etherealExhausted = false;
        handAtTurnEnd.forEach(card => {
             // Check if the card still exists in the actual hand (might have been discarded by effects)
             if (card.isEthereal && this.deckManager.hand.includes(card)) {
                 console.log(`Exhausting ethereal card: ${card.name}`);
                 // Trigger exhaust artifact FIRST
                 this.triggerArtifacts('onCardExhaust', { card: card, reason: 'ethereal' });
                 // DeckManager handles moving the card instance
                 this.deckManager.exhaustCardFromHand(card);
                 etherealExhausted = true;
             }
        });
        // Update hand UI if ethereal cards were removed before full discard
        if (etherealExhausted && this.gameStateRef?.uiManager?.combatUI) {
             this.gameStateRef.uiManager.combatUI.renderHand(this.deckManager.hand, true); // Update hand display
        }
        // --- End Ethereal ---

        // Discard remaining hand (triggers discard artifacts internally via DeckManager)
        this.deckManager.discardHand();
    }

    // --- Combat Actions ---

    /** Attempts to play a card from hand. */
    playCard(card, target = null, enemies = []) {
        if (!card || !(card instanceof Card)) {
             console.error("Player.playCard: Invalid card object provided.");
             return false;
        }
         if (card.cost === null) { // Check for unplayable cards
             console.warn(`Player: Cannot play unplayable card ${card.name}.`);
             this.gameStateRef?.uiManager?.showActionFeedback("Cannot play this card!", "warning");
             return false;
         }

        // Check cost modifier status effects BEFORE checking focus
        const modifiedCost = Math.max(0, this.applyModifiers('cardCost', card.cost));

        if (this.currentFocus >= modifiedCost) {
            this.spendFocus(modifiedCost); // Spend the modified cost
            console.log(`Player: Playing card ${card.name} (Cost: ${modifiedCost}) targeting ${target?.name || 'self/none'}`);

            // Prepare event data *before* executing effects
            const eventData = { card: card, target: target };

            // Execute Card Effect (logic is within Card instance)
            card.executeEffect(this, target, enemies);

            // Trigger onCardPlay AFTER effect resolves BUT before moving card
            this.triggerArtifacts('onCardPlay', eventData);

            // Move Card After Play & Triggers
            if (card.exhausts) {
                // Trigger onCardExhaust BEFORE it leaves the hand
                this.triggerArtifacts('onCardExhaust', { card: card, reason: 'played' });
                this.deckManager.exhaustCardFromHand(card); // Moves card
            } else {
                 // discardCardFromHand triggers 'onCardDiscard' internally
                 this.deckManager.discardCardFromHand(card);
            }
            return true; // Success
        } else {
            console.log(`Player: Not enough Focus for ${card.name} (cost ${card.cost} -> ${modifiedCost}, have ${this.currentFocus})`);
            this.gameStateRef?.uiManager?.showActionFeedback("Not enough Focus!", "error");
            return false; // Failure
        }
    }

    /** Draws cards using DeckManager. */
    drawCards(num) {
        if (!this.deckManager || num <= 0) return;
        const drawn = this.deckManager.draw(num); // DeckManager handles draw logic & artifacts
        // Trigger artifact AFTER cards are drawn and in hand
        if (drawn.length > 0) {
            this.triggerArtifacts('onCardsDrawn', { cards: drawn, count: drawn.length });
        }
        // UI update handled by CombatManager/CombatUI calling update()
    }

    /** Draws the initial hand at combat start. */
     drawInitialHand(num = 5) { // Use default value from config?
        if (!this.deckManager) return;
        const drawn = this.deckManager.draw(num); // DeckManager handles draw logic & artifacts
        if (drawn.length > 0) {
            this.triggerArtifacts('onCardsDrawn', { cards: drawn, count: drawn.length, initial: true }); // Add context flag
        }
        // UI update handled by CombatManager/CombatUI calling update()
    }

    // --- Stat Interactions ---

    /** Gains block, applying modifiers and triggering artifacts. */
    gainBlock(amount) {
        if (amount <= 0) return;
        const modifiedAmount = this.applyModifiers('blockGain', amount);
        if (modifiedAmount <= 0) return; // Don't trigger if no actual block gained due to Frail etc.

        const previousBlock = this.currentBlock;
        this.currentBlock += modifiedAmount;
        this.triggerArtifacts('onGainBlock', { amount: modifiedAmount, previousBlock: previousBlock });
    }

    /** Takes damage, applying modifiers, block, and triggering artifacts. */
    takeDamage(amount, damageSource = null) { // source could be enemy instance or string like 'Poison'
        if (amount <= 0 || this.currentIntegrity <= 0) return 0; // No damage or already dead

        const initialAmount = amount;
        let modifiedAmount = amount;

        // Apply INTANGIBLE first (reduces damage to 1)
        if (this.hasStatus('Intangible')) {
            modifiedAmount = Math.max(1, modifiedAmount > 0 ? 1 : 0);
            console.log("Player Intangible reduced incoming damage!");
        }

        // Apply VULNERABLE (takes more damage) AFTER Intangible check
        modifiedAmount = this.applyModifiers('damageTaken', modifiedAmount);

        // Ensure damage is at least 0 after vulnerability etc.
        modifiedAmount = Math.max(0, modifiedAmount);
        if (modifiedAmount <= 0) {
             console.log("Player: Damage negated by modifiers/effects.");
             this.triggerArtifacts('onDamageNegated', { initialAmount: initialAmount, source: damageSource });
             return 0;
        }

        const blockConsumed = Math.min(this.currentBlock, modifiedAmount);
        const damageAfterBlock = modifiedAmount - blockConsumed;
        const previousBlock = this.currentBlock;
        const previousIntegrity = this.currentIntegrity;
        const sourceId = damageSource?.id || (typeof damageSource === 'string' ? damageSource : 'Unknown');

        if (blockConsumed > 0) {
            this.currentBlock -= blockConsumed;
            this.triggerArtifacts('onBlockBroken', { amountBlocked: blockConsumed, initialDamage: modifiedAmount, source: damageSource });
        }

        if (damageAfterBlock > 0) {
            this.currentIntegrity -= damageAfterBlock;
             // Trigger artifact BEFORE checking for death
            this.triggerArtifacts('onDamageTaken', {
                amount: damageAfterBlock, // Actual HP lost
                initialAmount: initialAmount, // Original damage number before mods/block
                source: damageSource // Pass the source (Enemy instance or status string)
            });
        }

        // Check for death AFTER applying damage and triggering artifacts
        if (this.currentIntegrity <= 0 && previousIntegrity > 0) {
            this.currentIntegrity = 0;
            console.log("Player: Integrity depleted!");
            this.triggerArtifacts('onDeath', { source: damageSource });
            // Game end logic is handled by CombatManager.checkCombatEndCondition -> GameState.endRun
        }
        return damageAfterBlock; // Return actual HP lost
    }

    /** Heals the player, respecting max Integrity and triggering artifacts. */
    heal(amount) {
        if (amount <= 0 || this.currentIntegrity >= this.maxIntegrity) return 0;

        const previousIntegrity = this.currentIntegrity;
        const actualHeal = Math.min(amount, this.maxIntegrity - this.currentIntegrity);

        if (actualHeal <= 0) return 0;

        this.currentIntegrity += actualHeal;
        // Trigger artifact AFTER health is updated
        this.triggerArtifacts('onHeal', { amount: actualHeal, previousIntegrity: previousIntegrity });
        return actualHeal; // Return amount actually healed
    }

    /** Spends focus, triggering artifacts. */
    spendFocus(amount) {
        if (amount <= 0) return;
        const previousFocus = this.currentFocus;
        const spentAmount = Math.min(amount, this.currentFocus); // Can't spend more than available
        if (spentAmount <= 0) return;

        this.currentFocus -= spentAmount;
        this.triggerArtifacts('onFocusSpent', { amount: spentAmount, previousFocus: previousFocus });
    }

    /** Gains focus, respecting max Focus and triggering artifacts. */
    gainFocus(amount) {
        if (amount <= 0) return;
        const previousFocus = this.currentFocus;
        this.currentFocus = Math.min(this.maxFocus, this.currentFocus + amount);
        const actualGain = this.currentFocus - previousFocus;
        if (actualGain > 0) {
             this.triggerArtifacts('onFocusGained', { amount: actualGain, previousFocus: previousFocus });
        }
    }

    // --- Status Effects ---

    /** Applies a status effect to the player. */
    applyStatus(statusId, duration, amount = 1, source = null) { // source can be enemy instance, 'Artifact', 'Card', etc.
        if (!statusId) { console.warn("Player.applyStatus: Attempted to apply status with null/undefined ID."); return; }
        if (duration <= 0 && amount <= 0) return; // Don't apply ineffective statuses

        // TODO: Implement Status Immunity check if needed
        // if (this.hasStatusImmunity(statusId)) return;

        const existingStatus = this.activeStatusEffects.find(s => s.id === statusId);
        let statusAppliedOrUpdated = false;
        let previousAmount = 0;
        let previousDuration = 0;
        const sourceId = source?.id || (typeof source === 'string' ? source : 'Unknown');

        if (existingStatus) {
            previousAmount = existingStatus.amount || 0;
            previousDuration = existingStatus.duration || 0;

            // Stacking logic for amount-based statuses
            const stackableAmount = ['Strength', 'Dexterity', 'Poison', 'Regen', 'Metallicize', 'Thorns', 'FocusNextTurn', 'TempMaxHP', 'Entangle', 'ProtocolActive', 'Burn'];
            if (stackableAmount.includes(statusId)) {
                 existingStatus.amount = (existingStatus.amount || 0) + amount;
            } else {
                 // For non-stacking amount statuses, maybe take the max? Or just refresh duration?
                 // Let's default to refreshing duration only for non-stacking amount.
            }

            // Duration Refresh/Overwrite (usually take the max, don't overwrite 99)
            if (existingStatus.duration !== 99) {
                existingStatus.duration = Math.max(existingStatus.duration, duration);
            }
            existingStatus.source = sourceId; // Update source potentially
            statusAppliedOrUpdated = true;
             console.log(`Player status updated: ${statusId}. Amt: ${existingStatus.amount}, Dur: ${existingStatus.duration}`);

        } else {
             // Determine initial amount based on stacking nature
             const stackableAmount = ['Strength', 'Dexterity', 'Poison', 'Regen', 'Metallicize', 'Thorns', 'FocusNextTurn', 'TempMaxHP', 'Entangle', 'ProtocolActive', 'Burn'];
             let initialAmount = stackableAmount.includes(statusId) ? amount : 1; // Default 1 for non-stacking amount

             // Avoid adding status if initial state is ineffective
             if (initialAmount <= 0 && duration <= 0) return;

            this.activeStatusEffects.push({ id: statusId, duration: duration, source: sourceId, amount: initialAmount });
            statusAppliedOrUpdated = true;
            console.log(`Player status applied: ${statusId}. Amt: ${initialAmount}, Dur: ${duration}`);
        }

        // Trigger artifact and update UI if change occurred
        if (statusAppliedOrUpdated) {
            const currentStatus = this.activeStatusEffects.find(s => s.id === statusId); // Get final state
            this.triggerArtifacts('onStatusAppliedToPlayer', {
                status: { ...currentStatus }, // Pass copy
                amountApplied: amount, // Original amount attempted
                durationApplied: duration, // Original duration attempted
                previousAmount: previousAmount,
                previousDuration: previousDuration
            });
            this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); // Update UI
        }
    }

    /** Removes a status effect instance by ID. */
    removeStatus(statusId) {
        const initialLength = this.activeStatusEffects.length;
        const removedEffect = this.activeStatusEffects.find(s => s.id === statusId);
        this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId);
        if (this.activeStatusEffects.length < initialLength) {
             console.log(`Player status removed: ${statusId}`);
             this.triggerArtifacts('onStatusRemoved', { statusId: statusId, removedEffect: removedEffect });
             this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); // Update UI
             return true;
        }
        return false;
    }

    hasStatus(statusId) {
        return this.activeStatusEffects.some(s => s.id === statusId);
    }

    getStatusAmount(statusId) {
        const status = this.activeStatusEffects.find(s => s.id === statusId);
        // Amount is primary for stacking effects, fallback to 1 if duration exists > 0
        return status ? (status.amount || (status.duration > 0 ? 1 : 0)) : 0;
    }

    /** Process status effects at start/end of turn */
    tickStatusEffects(phase) { // phase = 'start' or 'end'
        const effectsToRemove = [];
        // Iterate over a copy in case effects modify the array during iteration
        const statusesAtStartOfTick = [...this.activeStatusEffects];

        statusesAtStartOfTick.forEach(effect => {
            // Re-check if the effect still exists in the primary array
            if (!this.activeStatusEffects.includes(effect)) return;

            let removeEffectAfterTick = false;
            switch (effect.id) {
                // --- Start Phase Effects ---
                case 'Poison':
                    if (phase === 'start' && effect.amount > 0) {
                        console.log(`Player taking ${effect.amount} Poison damage.`);
                        this.takeDamage(effect.amount, 'Poison');
                        effect.amount--;
                        if (effect.amount <= 0) effectsToRemove.push(effect.id);
                    } else if (phase === 'start' && effect.amount <= 0) {
                        effectsToRemove.push(effect.id); // Remove if poison somehow reached 0 amount
                    }
                    break;
                case 'Burn':
                     if (phase === 'start' && effect.amount > 0) {
                        console.log(`Player taking ${effect.amount} Burn damage.`);
                        this.takeDamage(effect.amount, 'Burn');
                         // Burn amount doesn't decrease, duration ticks at end
                     }
                     break;
                case 'Confusion':
                    if (phase === 'start') {
                        if (this.deckManager.hand.length > 0) {
                            const index = Math.floor(Math.random() * this.deckManager.hand.length);
                            const cardToDiscard = this.deckManager.hand[index];
                            if (cardToDiscard) {
                                 console.log(`Confusion discarding: ${cardToDiscard.name}`);
                                 // Use DeckManager method to handle discard triggers etc.
                                 this.deckManager.discardCardFromHand(cardToDiscard);
                            }
                        }
                        removeEffectAfterTick = true; // Confusion usually lasts 1 turn
                    }
                    break;
                 case 'FocusNextTurn':
                     if (phase === 'start' && effect.amount > 0) {
                         console.log(`Gaining ${effect.amount} Focus from artifact.`);
                         this.gainFocus(effect.amount);
                         removeEffectAfterTick = true; // Remove after applying
                     } else if (phase === 'start') {
                          removeEffectAfterTick = true; // Remove if amount is 0 for some reason
                     }
                     break;

                // --- End Phase Effects ---
                case 'Regen':
                    if (phase === 'end' && effect.amount > 0) {
                         console.log(`Player regenerating ${effect.amount} HP.`);
                         this.heal(effect.amount);
                    }
                    break;
                case 'Metallicize':
                    if (phase === 'end' && effect.amount > 0) {
                         console.log(`Player gaining ${effect.amount} Block from Metallicize.`);
                         this.gainBlock(effect.amount);
                    }
                    break;
                case 'Intangible':
                     if (phase === 'end') removeEffectAfterTick = true; // Fades EOT
                     break;

                 // --- Other statuses just tick duration ---
                 default: break;
            }

            // --- Decrement Duration (at end of turn) ---
            if (phase === 'end') {
                 const isPassiveStack = ['Strength', 'Dexterity', 'ProtocolActive', 'TempMaxHP', 'Metallicize', 'Thorns'].includes(effect.id);
                 const isInfiniteDuration = effect.duration === 99;
                 const tickDuration = !isPassiveStack && !isInfiniteDuration && effect.id !== 'Poison'; // Poison duration tied to amount

                 if (tickDuration) {
                     effect.duration--;
                     if (effect.duration <= 0 && !effectsToRemove.includes(effect.id)) {
                         console.log(`Player status expired (duration): ${effect.id}`);
                         effectsToRemove.push(effect.id);
                     }
                 }
            }

             if (removeEffectAfterTick && !effectsToRemove.includes(effect.id)) {
                 effectsToRemove.push(effect.id);
             }
        }); // End forEach status

        // Remove effects marked for removal
        if (effectsToRemove.length > 0) {
            this.activeStatusEffects = this.activeStatusEffects.filter(effect => !effectsToRemove.includes(effect.id));
        }
        // UI update handled by CombatManager after calling this
    }


    // --- Modifiers ---
     /** Applies player-based modifiers (statuses) to a value. */
     applyModifiers(modifierType, baseValue) {
         let modifiedValue = baseValue;

         switch (modifierType) {
            case 'damageDealt':
                if (this.hasStatus('Weak')) modifiedValue = Math.floor(modifiedValue * 0.75);
                if (this.hasStatus('Strength')) modifiedValue += this.getStatusAmount('Strength');
                break;
            case 'damageTaken':
                // Note: Intangible handled directly in takeDamage method due to its priority
                if (this.hasStatus('Vulnerable')) modifiedValue = Math.floor(modifiedValue * 1.5);
                break;
            case 'blockGain':
                if (this.hasStatus('Dexterity')) modifiedValue += this.getStatusAmount('Dexterity');
                if (this.hasStatus('Frail')) modifiedValue = Math.floor(modifiedValue * 0.75);
                if (this.hasStatus('ProtocolActive')) modifiedValue += this.getStatusAmount('ProtocolActive'); // Example custom status
                break;
            case 'cardCost':
                if (this.hasStatus('Entangle')) modifiedValue += this.getStatusAmount('Entangle');
                // Example: if (this.hasStatus('FlowState')) modifiedValue = Math.max(0, modifiedValue - 1);
                break;
            // Add cases for 'healTaken', 'focusGained', etc. if needed
         }

         // --- Apply Artifact Modifiers ---
         // While most artifacts trigger on events, some might provide passive modifications.
         // This requires a more complex system, likely iterating artifacts here.
         // Example placeholder:
         // this.artifacts.forEach(artifact => {
         //    if (artifact.modifies === modifierType) {
         //        modifiedValue = artifact.applyModification(modifiedValue, this, this.gameStateRef);
         //    }
         // });

         return Math.max(0, Math.floor(modifiedValue)); // Ensure non-negative integer
     }


    // --- Artifacts ---

    /** Adds an artifact instance to the player. */
    addArtifact(artifactId) {
        if (!artifactId) { console.warn("Player.addArtifact: Invalid artifactId provided."); return; }
        // Prevent duplicates
        if (this.artifacts.some(a => a.id === artifactId)) {
             console.log(`Player already has artifact: ${artifactId}. Skipping.`);
             return;
        }

        try {
            const newArtifact = new Artifact(artifactId);
            if (newArtifact.id !== 'error_artifact') {
                 this.artifacts.push(newArtifact);
                 console.log(`Player Added artifact: ${newArtifact.name}`);
                 // Trigger its onPickup effect immediately
                 newArtifact.handleEvent('onPickup', this, this.gameStateRef);
                 // Update relevant UI (e.g., passive stats, combat info display)
                 this.gameStateRef?.uiManager?.updatePlayerCombatInfo(this); // Generic update
                 this.gameStateRef?.uiManager?.updatePlayerMapInfo(this.player, this.gameStateRef.currentFloor); // Update map display too
            }
        } catch (error) {
             console.error(`Error adding artifact ${artifactId}:`, error);
        }
    }

    /** Calls handleEvent on all artifacts for a given trigger phase. */
    triggerArtifacts(triggerPhase, data = null) {
        // Avoid triggering if critical references are missing
        if (!this.gameStateRef || !this.artifacts || this.artifacts.length === 0) {
            return;
        }
        // console.log(`Player Trigger: ${triggerPhase}`, data); // VERY noisy, disable generally

        // Iterate over a copy in case an artifact removes itself or another artifact during trigger
        [...this.artifacts].forEach(artifact => {
             // Check if the artifact still exists in the main array before handling
             if (this.artifacts.includes(artifact)) {
                 try {
                     artifact.handleEvent(triggerPhase, this, this.gameStateRef, data);
                 } catch (error) {
                     console.error(`Error triggering artifact ${artifact.name} (ID: ${artifact.id}) for event ${triggerPhase}:`, error);
                 }
             }
        });
    }


    // --- Deck Manipulation (Delegates to DeckManager, adds triggers) ---

    /** Adds a card to the master deck via DeckManager and triggers artifacts. */
    addCardToDeck(cardOrId) {
        // DeckManager handles creation/addition to masterDeck
        const cardAdded = this.deckManager.addCardToMasterDeck(cardOrId);
        if(cardAdded){
            this.triggerArtifacts('onCardAdded', { card: cardAdded }); // Trigger AFTER adding
            // Check milestones related to deck composition or size
            this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef);
        }
        return cardAdded; // Return the instance or null
    }

    /** Removes a card from the master deck via DeckManager and triggers artifacts. */
    removeCardFromDeck(cardToRemove) {
        // DeckManager handles removal from masterDeck
        const removed = this.deckManager.removeCardFromMasterDeck(cardToRemove);
        if (removed) {
             this.triggerArtifacts('onCardRemove', { card: cardToRemove }); // Trigger AFTER removing
            // Check milestones
            this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef);
            return true;
        }
        return false;
    }

    // --- Utility ---

    /** Gets default starting deck IDs from Data.js */
    getDefaultDeckIds() {
         // Example: 5 Strikes, 5 Defends
         const strikeId = Data.concepts?.find(c => c.name === "Strike")?.id || 'starter_strike'; // Use cardData ID if concept missing
         const defendId = Data.concepts?.find(c => c.name === "Defend")?.id || 'starter_defend';
         // Ensure IDs are numbers if Card constructor expects numbers
         const parseId = (id) => typeof id === 'string' ? (parseInt(id.split('_')[1]) || id) : id;

         return Array(5).fill(parseId(strikeId)).concat(Array(5).fill(parseId(defendId)));
     }

    /** Gets default base attunements. */
     getDefaultAttunements() {
         // Consistent with Data.js defaults
         return { Attraction: 5, Interaction: 5, Sensory: 5, Psychological: 5, Cognitive: 5, Relational: 5, RoleFocus: 5 };
      }

    // --- End of Combat Cleanup ---
    /** Removes temporary status effects at the end of combat. Called by GameState/CombatManager. */
    cleanupCombatStatuses() {
        const initialLength = this.activeStatusEffects.length;
        const effectsToRemove = [];

        this.activeStatusEffects = this.activeStatusEffects.filter(effect => {
            // Define statuses that PERSIST between combats (usually none for player)
            const persist = [/*'PermanentBlessing'*/].includes(effect.id);

            // Special handling for TempMaxHP needs to be implemented if used
            if (effect.id === 'TempMaxHP') {
                console.warn("TempMaxHP removal logic needs full implementation (adjusting max/current HP). Removing status tag only.");
                effectsToRemove.push(effect.id);
                return false; // Remove the status tag
            }
             // Special handling for MirrorShieldUsed flag
             if (effect.id === 'MirrorShieldUsed') {
                  effectsToRemove.push(effect.id);
                  return false;
             }

            if (!persist) {
                effectsToRemove.push(effect.id);
                return false; // Remove non-persistent effects
            }
            return true; // Keep persistent statuses
        });

        if (effectsToRemove.length > 0) {
            console.log(`Player cleaning up end-of-combat effects: ${effectsToRemove.join(', ')}`);
            this.triggerArtifacts('onCombatStatusCleanup', { removed: effectsToRemove });
            // Update UI if needed (though combat screen is usually hidden now)
            // this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this);
        }
    }

} // End Player Class
