// js/core/Player.js

import { DeckManager } from './DeckManager.js';
import { Artifact } from './Artifact.js';
import { Card } from './Card.js'; // Needed for potential effects/status cards
import * as Data from '../../data.js'; // For default deck/attunements
import { getStatusEffectDefinition } from '../combat/StatusEffects.js'; // Needed for checking status properties


// --- Constants ---
const BASE_FOCUS = 3;
const BASE_INTEGRITY = 70;

/**
 * Represents the player character during a run.
 * Manages stats, status effects, artifacts, and deck interactions.
 */
export class Player {
    constructor(playerData = {}, metaProgression = null) {
        console.log("Creating Player instance...");
        this.gameStateRef = null; // Set by GameState after creation

        // --- Core Identity ---
        this.name = playerData?.name || "Alchemist";

        // --- Meta Progression Bonuses ---
        const startingIntegrityBonus = metaProgression?.getStartingBonus('maxIntegrityBonus') || 0;
        const baseIntegrity = metaProgression?.getStartingBonus('baseIntegrity') || BASE_INTEGRITY;
        const baseFocus = metaProgression?.getStartingBonus('baseFocus') || BASE_FOCUS;
        const focusSlotsBonus = metaProgression?.getStartingBonus('focusSlotsBonus') || 0;
        const startingInsightBonus = metaProgression?.getStartingBonus('startingInsightBonus') || 0;

        // --- Attunements ---
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
        // Override with specific playerData attunements if provided
        if (playerData?.attunements) {
            this.attunements = { ...this.attunements, ...playerData.attunements };
        }
        // --- DYNAMIC ATTUNEMENT PLACEHOLDER ---
        // Now integrated into playCard and adjustAttunement

        // --- Calculate Derived Stats ---
        this.maxIntegrity = baseIntegrity + startingIntegrityBonus;
        this.currentIntegrity = this.maxIntegrity;
        const finalStartingCog = this.attunements.Cognitive || 5;
        this.maxFocus = baseFocus + focusSlotsBonus + Math.floor(finalStartingCog / 3);
        this.currentFocus = this.maxFocus;

        // --- Deck ---
        const startingDeckIds = playerData?.startingDeck || this.getDefaultDeckIds();
        this.deckManager = new DeckManager(startingDeckIds); // PlayerRef set later

        // --- Run Progress ---
        this.insightThisRun = startingInsightBonus;

        // --- Combat State ---
        this.currentBlock = 0;
        this.activeStatusEffects = [];

        // --- Artifacts ---
        const startingArtifactIds = playerData?.startingArtifacts || [];
        this.artifacts = startingArtifactIds
            .map(artId => { try { return new Artifact(artId); } catch (error) { console.error(`Failed artifact ${artId}:`, error); return null; } })
            .filter(a => a && a.id !== 'error_artifact');

        console.log(`Player created: ${this.name}`);
        console.log(` > Integrity: ${this.currentIntegrity}/${this.maxIntegrity}`);
        console.log(` > Focus: ${this.currentFocus}/${this.maxFocus}`);
        console.log(` > Attunements:`, this.attunements);
        console.log(` > Starting Deck Size: ${this.deckManager.masterDeck.length}`);
        console.log(` > Starting Artifacts: ${this.artifacts.map(a=>a.name).join(', ') || 'None'}`);
    }

    /** Links this player instance back to the main GameState. */
    setGameState(gameState) {
        if (!gameState) { console.error("Player Error: Attempted to set invalid GameState reference."); return; }
        this.gameStateRef = gameState;
    }

    /** Adjusts attunement scores. Called internally or by GameState */
    adjustAttunement(elementKey, amount) {
        if (this.attunements.hasOwnProperty(elementKey) && typeof amount === 'number') {
            const currentVal = this.attunements[elementKey];
            // Consider adding bounds or diminishing returns? For now, simple addition.
            this.attunements[elementKey] = Math.max(0, currentVal + amount); // Ensure non-negative
            console.log(`Attunement Adjusted: ${elementKey} ${currentVal.toFixed(1)} -> ${this.attunements[elementKey].toFixed(1)} (Change: ${amount.toFixed(1)})`);
            // Trigger milestone check after adjustment
            this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef);
            // Update UI if relevant (e.g., map info bar)
            this.gameStateRef?.uiManager?.updatePlayerMapInfo(this, this.gameStateRef?.currentFloor);
        } else {
            console.warn(`Player.adjustAttunement: Invalid key '${elementKey}' or amount '${amount}'.`);
        }
    }

    // --- Combat Lifecycle ---

    /** Prepares the player for combat. */
    startCombat() {
        console.log("Player: Starting Combat...");
        this.currentBlock = 0;
        this.activeStatusEffects = []; // Clear statuses
        this.deckManager.resetForCombat(); // Reset deck piles
        this.triggerArtifacts('onCombatStart'); // Trigger artifacts BEFORE focus/draw
        this.gainFocus(this.maxFocus); // Gain focus (will trigger UI update via gainFocus)
        this.drawInitialHand(); // Draw initial hand (triggers draw artifacts)
        console.log("Player combat setup complete.");
    }

    /** Starts the player's turn. */
    startTurn() {
        console.log(`Player: Starting Turn ${this.gameStateRef?.combatManager?.turnNumber || '?'}`);
        this.currentBlock = 0; // Reset block (UI updated at end of method)
        this.triggerArtifacts('onTurnStart'); // Trigger start of turn artifacts
        this.gainFocus(this.maxFocus); // Gain base focus (UI updated by gainFocus)
        this.tickStatusEffects('start'); // Tick statuses (Poison, Burn, FocusNextTurn etc.)
        if (this.currentIntegrity <= 0) { console.log("Player died from start-of-turn effects."); this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); return; } // Check death, update UI
        this.drawCards(5); // Draw standard hand size
        // Update UI once after all start-of-turn actions
        this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this);
    }

    /** Ends the player's turn. */
    endTurn() {
        console.log("Player: Ending Turn...");
        this.triggerArtifacts('onTurnEnd'); // Trigger end-of-turn artifacts
        this.tickStatusEffects('end'); // Tick end-of-turn statuses (Regen, Intangible, Durations)

        // Handle Ethereal cards
        const handAtTurnEnd = [...this.deckManager.hand];
        let etherealExhausted = false;
        handAtTurnEnd.forEach(card => {
             if (card.isEthereal && this.deckManager.hand.includes(card)) {
                 console.log(`Exhausting ethereal card: ${card.name}`);
                 this.triggerArtifacts('onCardExhaust', { card: card, reason: 'ethereal' });
                 this.deckManager.exhaustCardFromHand(card); // Deck manager handles exhaust pile count update
                 etherealExhausted = true;
             }
        });
        // Render hand *only if* ethereal cards were exhausted
        if (etherealExhausted && this.gameStateRef?.uiManager?.combatUI) {
             this.gameStateRef.uiManager.combatUI.renderHand(this.deckManager.hand, false); // Re-render hand (passing false as it's end of turn)
        }

        // Check High Block Milestone
        if (this.currentBlock >= 30) {
             this.gameStateRef?.triggerMilestoneAction('endTurnHighBlock', this.currentBlock);
        }

        // Discard remaining hand
        this.deckManager.discardHand(); // Triggers discard artifacts internally
        // Deck counts are updated by the DeckManager calls within discardHand/exhaustCardFromHand

        // Update player info UI after all end-of-turn effects/discard
        this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this);
    }

    // --- Combat Actions ---

    /** Attempts to play a card from hand. */
    playCard(card, target = null, enemies = []) {
        if (!card || !(card instanceof Card)) { console.error("Player.playCard: Invalid card object."); return false; }
        if (card.cost === null) { console.warn(`Player: Cannot play unplayable card ${card.name}.`); this.gameStateRef?.uiManager?.showActionFeedback("Cannot play this card!", "warning"); return false; }

        const modifiedCost = Math.max(0, this.applyModifiers('cardCost', card.cost));

        if (this.currentFocus >= modifiedCost) {
            this.spendFocus(modifiedCost); // Spend focus first (triggers UI update via spendFocus)
            console.log(`Player: Playing ${card.name} (Cost: ${modifiedCost}) targeting ${target?.name || 'self/none'}`);

            // --- DYNAMIC ATTUNEMENT CHANGE ---
            if (card.primaryElement && this.attunements.hasOwnProperty(card.primaryElement)) {
                const attunementGain = 0.1; // Base gain for primary element
                this.adjustAttunement(card.primaryElement, attunementGain);
                // Optional: Add smaller gain for secondary elements based on card.elementScores
            }

            const eventData = { card: card, target: target }; // Data for triggers
            card.executeEffect(this, target, enemies); // Execute effect
            this.triggerArtifacts('onCardPlay', eventData); // Trigger AFTER effect

            // --- Milestone Check for Card Play ---
            const turnState = this.gameStateRef?.combatManager?.getTurnState();
            if(turnState?.cardsPlayedThisTurn >= 8) { // Check value AFTER increment in CombatManager
                this.gameStateRef?.triggerMilestoneAction('playManyCardsTurn', turnState.cardsPlayedThisTurn);
            }


            // Move Card After Play
            if (card.exhausts) {
                this.triggerArtifacts('onCardExhaust', { card: card, reason: 'played' });
                this.deckManager.exhaustCardFromHand(card); // Updates exhaust count UI
            } else {
                 this.deckManager.discardCardFromHand(card); // Updates discard count UI
            }

            // Explicitly update player info UI if status effects might have changed
            // This is somewhat redundant if applyStatus updates UI, but safe.
            this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this);

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
        const drawn = this.deckManager.draw(num); // DeckManager handles reshuffle UI count updates
        if (drawn.length > 0) { this.triggerArtifacts('onCardsDrawn', { cards: drawn, count: drawn.length }); }
        // Hand rendering is typically handled by CombatManager after calling this during startTurn
    }

    /** Draws the initial hand at combat start. */
     drawInitialHand(num = 5) {
        if (!this.deckManager) return;
        const drawn = this.deckManager.draw(num); // DeckManager handles reshuffle UI count updates
        if (drawn.length > 0) { this.triggerArtifacts('onCardsDrawn', { cards: drawn, count: drawn.length, initial: true }); }
        // Hand rendering is handled by CombatManager after calling this during startCombat
    }

    // --- Stat Interactions ---

    /** Gains block, applying modifiers, triggering artifacts, and showing floating number. */
    gainBlock(amount) {
        if (amount <= 0) return;
        const modifiedAmount = this.applyModifiers('blockGain', amount);
        if (modifiedAmount <= 0) return;

        const previousBlock = this.currentBlock;
        this.currentBlock += modifiedAmount;

        // --- Floating Number ---
        let modifiersText = [];
        if(this.hasStatus('Dexterity')) modifiersText.push(`+${this.getStatusAmount('Dexterity')} Dex`);
        if(this.hasStatus('Frail')) modifiersText.push(`-25% Frail`);
        // Add other artifact sources here if needed
        this.gameStateRef?.uiManager?.showFloatingNumber(
            this.gameStateRef?.uiManager?.playerArea, // Target element
            `+${modifiedAmount}`, // Text
            'block', // Type
            modifiersText.join(', ') // Modifiers description
        );
        // ---------------------

        this.triggerArtifacts('onGainBlock', { amount: modifiedAmount, previousBlock: previousBlock });
        this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); // Update UI
    }

    /** Takes damage, applying modifiers, block, triggering artifacts, and showing floating number. */
    takeDamage(amount, damageSource = null) {
        if (amount <= 0 || this.currentIntegrity <= 0) return 0;
        const initialAmount = amount;
        let modifiedAmount = amount;
        let modifiersText = [];

        // Apply Intangible first
        const wasIntangible = this.hasStatus('Intangible');
        if (wasIntangible) {
            modifiedAmount = Math.max(1, modifiedAmount > 0 ? 1 : 0);
            modifiersText.push('Intangible!');
            console.log("Player Intangible reduced damage!");
        }

        // Apply Vulnerable BEFORE other damage mods
        const wasVulnerable = this.hasStatus('Vulnerable');
        if (wasVulnerable) {
            modifiedAmount = Math.floor(modifiedAmount * 1.5);
            modifiersText.push('x1.5 Vuln!');
        }

        // Apply standard damageTaken modifiers (e.g., potential future resistance statuses)
        modifiedAmount = this.applyModifiers('damageTaken', modifiedAmount);
        modifiedAmount = Math.max(0, modifiedAmount);

        if (modifiedAmount <= 0) {
            console.log("Player: Damage negated.");
            // --- Floating Number (Negated) ---
            this.gameStateRef?.uiManager?.showFloatingNumber(
                this.gameStateRef?.uiManager?.playerArea, `Negated!`, 'negate', modifiersText.join(', ')
            );
            // -----------------------------
            this.triggerArtifacts('onDamageNegated', { initialAmount: initialAmount, source: damageSource });
            // Update UI just in case block was used for negation (though unlikely)
            this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this);
            return 0;
        }

        const blockConsumed = Math.min(this.currentBlock, modifiedAmount);
        const damageAfterBlock = modifiedAmount - blockConsumed;
        const previousIntegrity = this.currentIntegrity;

        // --- Floating Number (Damage/Block) ---
        if (blockConsumed > 0) {
             this.gameStateRef?.uiManager?.showFloatingNumber(
                 this.gameStateRef?.uiManager?.playerArea, `-${blockConsumed}`, 'blocked', `Blocked ${modifiedAmount}`
             );
        }
        if (damageAfterBlock > 0) {
             this.gameStateRef?.uiManager?.showFloatingNumber(
                 this.gameStateRef?.uiManager?.playerArea, `-${damageAfterBlock}`, 'damage', modifiersText.join(', ')
             );
        }
        // ------------------------------------

        if (blockConsumed > 0) {
            this.currentBlock -= blockConsumed;
            this.triggerArtifacts('onBlockBroken', { amountBlocked: blockConsumed, initialDamage: modifiedAmount, source: damageSource });
        }
        if (damageAfterBlock > 0) {
            this.currentIntegrity -= damageAfterBlock;
            this.triggerArtifacts('onDamageTaken', { amount: damageAfterBlock, initialAmount: initialAmount, source: damageSource });
            // --- Milestone Check for Damage Taken ---
             // Check if damage source is enemy for relevant milestones
             if(this.gameStateRef?.combatManager?.enemies.some(e => e.enemyType === damageSource || e.id === damageSource)) {
                  // Add milestones like 'takeXdamageCombat', 'takeXdamageUnblocked' here if needed
             }
        }

        if (this.currentIntegrity <= 0 && previousIntegrity > 0) {
            this.currentIntegrity = 0;
            console.log("Player: Integrity depleted!");
            this.triggerArtifacts('onDeath', { source: damageSource });
        }

        this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); // Update UI after all effects
        return damageAfterBlock; // Return actual HP damage dealt
    }


    /** Heals the player, respecting max Integrity, triggering artifacts, and showing floating number. */
    heal(amount) {
        if (amount <= 0 || this.currentIntegrity >= this.maxIntegrity) return 0;
        const previousIntegrity = this.currentIntegrity;
        const actualHeal = Math.min(amount, this.maxIntegrity - this.currentIntegrity);
        if (actualHeal <= 0) return 0;

        this.currentIntegrity += actualHeal;

        // --- Floating Number ---
         this.gameStateRef?.uiManager?.showFloatingNumber(
             this.gameStateRef?.uiManager?.playerArea, `+${actualHeal}`, 'heal'
         );
         // ---------------------

        this.triggerArtifacts('onHeal', { amount: actualHeal, previousIntegrity: previousIntegrity });
        this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); // Update UI
        return actualHeal;
    }


    /** Spends focus, triggering artifacts and updating UI. */
    spendFocus(amount) {
        if (amount <= 0) return;
        const previousFocus = this.currentFocus;
        const spentAmount = Math.min(amount, this.currentFocus);
        if (spentAmount <= 0) return;
        this.currentFocus -= spentAmount;
        this.triggerArtifacts('onFocusSpent', { amount: spentAmount, previousFocus: previousFocus });
        this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); // Update UI
    }

    /** Gains focus, respecting max Focus, triggering artifacts and updating UI. */
    gainFocus(amount) {
        if (amount <= 0) return;
        const previousFocus = this.currentFocus;
        this.currentFocus = Math.min(this.maxFocus, this.currentFocus + amount);
        const actualGain = this.currentFocus - previousFocus;
        if (actualGain > 0) {
            this.triggerArtifacts('onFocusGained', { amount: actualGain, previousFocus: previousFocus });
            this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); // Update UI
        }
    }

    // --- Status Effects ---

    /** Applies a status effect to the player. */
    applyStatus(statusId, duration, amount = 1, source = null) {
        if (!statusId) { console.warn("Player.applyStatus: Null/undefined ID."); return; }

        // Define statuses that might affect UI immediately even if amount/duration is 0 (like refreshing Weak)
        const uiAffectingStatuses = ['Weak', 'Vulnerable', 'Frail', 'Strength', 'Dexterity', 'Entangle'];
        const canBeZero = uiAffectingStatuses.includes(statusId);

        if (!canBeZero && duration <= 0 && amount <= 0 && !['Strength', 'Dexterity'].includes(statusId)) return; // Allow adding 0 duration Str/Dex if amount > 0

        const definition = getStatusEffectDefinition(statusId); // Get definition to check properties
        const existingStatus = this.activeStatusEffects.find(s => s.id === statusId);
        let statusAppliedOrUpdated = false;
        let previousAmount = 0;
        let previousDuration = 0;
        const sourceId = source?.id || (typeof source === 'string' ? source : 'Unknown');

        if (existingStatus) {
            previousAmount = existingStatus.amount || 0;
            previousDuration = existingStatus.duration || 0;

            if (definition?.stacking) { // Use definition for stacking behavior
                 existingStatus.amount = (existingStatus.amount || 0) + amount;
            }
            if (existingStatus.duration !== 99) { // Don't overwrite infinite duration
                existingStatus.duration = Math.max(existingStatus.duration, duration);
            }
            existingStatus.source = sourceId; // Update source
            statusAppliedOrUpdated = true;
            console.log(`Player status updated: ${statusId}. Amt: ${existingStatus.amount}, Dur: ${existingStatus.duration}`);
        } else {
             // Use definition for stacking check
             let initialAmount = definition?.stacking ? amount : 1;

             // Prevent adding invalid initial amounts
             if (initialAmount <= 0 && duration <= 0 && !canBeZero) return;

             this.activeStatusEffects.push({ id: statusId, duration: duration, source: sourceId, amount: initialAmount });
             statusAppliedOrUpdated = true;
             console.log(`Player status applied: ${statusId}. Amt: ${initialAmount}, Dur: ${duration}`);
        }
        if (statusAppliedOrUpdated) {
            const currentStatus = this.activeStatusEffects.find(s => s.id === statusId);
            this.triggerArtifacts('onStatusAppliedToPlayer', { status: { ...currentStatus }, amountApplied: amount, durationApplied: duration, previousAmount: previousAmount, previousDuration: previousDuration });
            // Update Combat UI immediately after applying/updating a status
            this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this);
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
             // Update Combat UI immediately after removing a status
             this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this);
             return true;
        }
        return false;
    }

    hasStatus(statusId) { return this.activeStatusEffects.some(s => s.id === statusId); }
    getStatusAmount(statusId) { const status = this.activeStatusEffects.find(s => s.id === statusId); return status ? (status.amount || (status.duration > 0 ? 1 : 0)) : 0; }

    /** Process status effects at start/end of turn, updating UI if changes occur */
    tickStatusEffects(phase) {
        const effectsToRemove = [];
        const statusesAtStartOfTick = [...this.activeStatusEffects];
        let uiNeedsUpdate = false; // Flag if any visual status changed

        statusesAtStartOfTick.forEach(effect => {
            if (!this.activeStatusEffects.includes(effect)) return; // Skip if removed mid-tick
            let removeEffectAfterTick = false;
            const initialAmount = effect.amount; // Store initial amount for comparison
            const initialDuration = effect.duration;

            // --- Start of Turn Effects ---
             if (phase === 'start') {
                 switch(effect.id) {
                     case 'Poison':
                         if (effect.amount > 0) {
                             console.log(`Player taking ${effect.amount} Poison.`);
                             // Call takeDamage which handles floating number and UI update
                             this.takeDamage(effect.amount, 'Poison');
                             // Check if still alive before modifying effect
                             if(this.currentIntegrity > 0 && this.activeStatusEffects.includes(effect)) {
                                 effect.amount--;
                                 if (effect.amount <= 0) {
                                     removeEffectAfterTick = true;
                                     console.log(`Player's Poison wore off.`);
                                 }
                             } else { // Died or effect removed by damage trigger
                                 removeEffectAfterTick = true;
                             }
                         } else { removeEffectAfterTick = true; }
                         break;
                     case 'Burn':
                         if (effect.amount > 0) {
                             console.log(`Player taking ${effect.amount} Burn.`);
                             // Call takeDamage which handles floating number and UI update
                             this.takeDamage(effect.amount, 'Burn');
                         }
                         break;
                     case 'Confusion':
                         if (this.deckManager.hand.length > 0) {
                             const index = Math.floor(Math.random() * this.deckManager.hand.length);
                             const card = this.deckManager.hand[index];
                             if (card) {
                                 console.log(`Confusion discard: ${card.name}`);
                                 this.deckManager.discardCardFromHand(card); // Updates discard UI count
                             }
                         }
                         removeEffectAfterTick = true; // Confusion removed after triggering
                         break;
                     case 'FocusNextTurn':
                         if (effect.amount > 0) {
                             console.log(`Gaining ${effect.amount} Focus.`);
                             this.gainFocus(effect.amount); // Handles UI update
                         }
                         removeEffectAfterTick = true; // Status removed after granting focus
                         break;
                     // Add other start-of-turn effects here
                 }
             } // --- End Start Phase ---

             // --- End of Turn Effects & Duration Ticking ---
             if (phase === 'end') {
                  switch(effect.id) {
                     case 'Regen':
                         if (effect.amount > 0) {
                             console.log(`Player regenerating ${effect.amount} HP.`);
                             this.heal(effect.amount); // Handles floating num and UI update
                         }
                         break;
                     case 'Metallicize':
                         if (effect.amount > 0) {
                             console.log(`Player gaining ${effect.amount} Block from Metallicize.`);
                             this.gainBlock(effect.amount); // Handles floating num and UI update
                         }
                         break;
                     case 'Intangible':
                         removeEffectAfterTick = true; // Intangible fades at end of turn
                          console.log(`Player's Intangible wore off.`);
                         break;
                     // Add other end-of-turn effects here
                 }

                 // --- Decrement Duration ---
                 const definition = getStatusEffectDefinition(effect.id);
                 // Only tick duration if it's duration-based, not permanent, and not tied to amount (like Poison)
                 const tickDuration = definition?.durationBased && effect.duration !== 99 && effect.id !== 'Poison';

                 if (tickDuration && this.activeStatusEffects.includes(effect)) { // Check if still present
                     effect.duration--;
                     if (effect.duration <= 0) {
                          removeEffectAfterTick = true;
                          console.log(`Player status expired: ${effect.id}`);
                     }
                 }
             } // --- End End Phase ---

             // Check if state changed for UI update
             if (effect.amount !== initialAmount || effect.duration !== initialDuration || removeEffectAfterTick) {
                 uiNeedsUpdate = true;
             }

             if (removeEffectAfterTick && !effectsToRemove.includes(effect.id)) {
                 effectsToRemove.push(effect.id);
             }
        }); // End forEach effect

        // Remove expired effects
        if (effectsToRemove.length > 0) {
            this.activeStatusEffects = this.activeStatusEffects.filter(e => !effectsToRemove.includes(e.id));
            uiNeedsUpdate = true; // Removal requires UI update
        }

        // Update UI once at the end if any status changed visually
        if (uiNeedsUpdate) {
             this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this);
        }
     }


    // --- Modifiers ---
     /** Applies player-based modifiers (statuses) to a value. */
     applyModifiers(modifierType, baseValue) {
         let modifiedValue = baseValue;
         // Apply relevant status effects
         switch (modifierType) {
            case 'damageDealt': if (this.hasStatus('Weak')) modifiedValue = Math.floor(modifiedValue * 0.75); if (this.hasStatus('Strength')) modifiedValue += this.getStatusAmount('Strength'); break;
            case 'damageTaken': if (this.hasStatus('Vulnerable')) modifiedValue = Math.floor(modifiedValue * 1.5); break;
            case 'blockGain': if (this.hasStatus('Dexterity')) modifiedValue += this.getStatusAmount('Dexterity'); if (this.hasStatus('Frail')) modifiedValue = Math.floor(modifiedValue * 0.75); if (this.hasStatus('ProtocolActive')) modifiedValue += this.getStatusAmount('ProtocolActive'); break;
            case 'cardCost': if (this.hasStatus('Entangle')) modifiedValue += this.getStatusAmount('Entangle'); break;
         }

         // Apply artifact passive modifications
         this.artifacts.forEach(artifact => {
             if (artifact.isPassive && artifact.trigger === 'modifyValue' && artifact._condition(this, this.gameStateRef, { valueType: modifierType })) {
                 // Pass value by reference or handle return value
                 // This requires artifact definitions to handle value modification
                 // Example: artifact._effect might return the new value
                 // modifiedValue = artifact._effect(this, this.gameStateRef, { valueType: modifierType, currentValue: modifiedValue });
                 // For simplicity, let's assume passive effects are rare for now
             }
         });

         return Math.max(0, Math.floor(modifiedValue)); // Ensure non-negative integer
     }


    // --- Artifacts ---
    /** Adds an artifact instance to the player. */
    addArtifact(artifactId) {
        if (!artifactId) { console.warn("Player.addArtifact: Invalid artifactId."); return; }
        // Check if artifact already exists (important for non-stacking artifacts)
        if (this.artifacts.some(a => a.id === artifactId)) {
             console.log(`Player already has artifact: ${artifactId}. Cannot add duplicate.`);
             // Optionally show feedback to the player
             this.gameStateRef?.uiManager?.showNotification(`Already possess: ${ARTIFACT_TEMPLATES[artifactId]?.name || artifactId}`);
             return;
        }
        try {
             const newArtifact = new Artifact(artifactId);
             if (newArtifact.id !== 'error_artifact') {
                 this.artifacts.push(newArtifact);
                 console.log(`Player Added artifact: ${newArtifact.name}`);
                 newArtifact.handleEvent('onPickup', this, this.gameStateRef); // Trigger pickup event immediately

                 // Update relevant UI elements after adding artifact
                 this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); // Update combat statuses if visible
                 this.gameStateRef?.uiManager?.updatePlayerMapInfo(this, this.gameStateRef?.currentFloor); // Update map info (e.g., if showing artifacts)
             }
        } catch (error) { console.error(`Error adding artifact ${artifactId}:`, error); }
    }

    /** Calls handleEvent on all artifacts for a given trigger phase. */
    triggerArtifacts(triggerPhase, data = null) {
        if (!this.gameStateRef || !this.artifacts || this.artifacts.length === 0) { return; }
        // Iterate over a copy in case an artifact removes itself during its effect
        [...this.artifacts].forEach(artifact => {
             // Ensure artifact still exists in the player's list before triggering
             if (this.artifacts.includes(artifact)) {
                 try {
                     artifact.handleEvent(triggerPhase, this, this.gameStateRef, data);
                 } catch (error) {
                     console.error(`Error triggering artifact ${artifact.name} (ID: ${artifact.id}) for ${triggerPhase}:`, error);
                 }
             }
        });
    }


    // --- Deck Manipulation (Delegates to DeckManager, adds triggers) ---
    /** Adds a card to the master deck. */
    addCardToDeck(cardOrId) {
        const cardAdded = this.deckManager.addCardToMasterDeck(cardOrId);
        if(cardAdded){
            this.triggerArtifacts('onCardAdded', { card: cardAdded });
            this.gameStateRef?.triggerMilestoneAction('collectCard', 1, { rarity: cardAdded.rarity });
            this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef); // Check state milestones
            this.gameStateRef?.uiManager?.updateDeckDiscardCounts(this.deckManager); // Update counts if visible
        }
        return cardAdded;
    }
    /** Removes a card from the master deck. */
    removeCardFromDeck(cardToRemove) {
        const cardDataCopy = { id: cardToRemove?.id, name: cardToRemove?.name, rarity: cardToRemove?.rarity };
        const removed = this.deckManager.removeCardFromMasterDeck(cardToRemove);
        if (removed) {
            this.triggerArtifacts('onCardRemove', { card: cardDataCopy });
            this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef); // Check state milestones
            this.gameStateRef?.uiManager?.updateDeckDiscardCounts(this.deckManager); // Update counts if visible
            return true;
        }
        return false;
    }

    // --- Utility ---
    /** Gets default starting deck IDs using defined starter concepts. */
    getDefaultDeckIds() {
        const strikeId = 10001; const defendId = 10002;
        if (!Data?.concepts?.some(c => c.id === strikeId) || !Data?.concepts?.some(c => c.id === defendId)) { console.warn(`Player.getDefaultDeckIds: Starter concept IDs missing!`); return []; }
        console.log(`Using default starter deck: 5x ${strikeId}, 5x ${defendId}`);
        return Array(5).fill(strikeId).concat(Array(5).fill(defendId));
     }
    /** Gets default base attunements. */
     getDefaultAttunements() { return { Attraction: 5, Interaction: 5, Sensory: 5, Psychological: 5, Cognitive: 5, Relational: 5, RoleFocus: 5 }; }

    // --- End of Combat Cleanup ---
    /** Removes temporary status effects at the end of combat. */
    cleanupCombatStatuses() {
        const initialLength = this.activeStatusEffects.length;
        const effectsToRemove = [];
        const tempHPEffect = this.activeStatusEffects.find(effect => effect.id === 'TempMaxHP');

        // --- Temp HP Handling ---
        if (tempHPEffect) {
             const hpLoss = tempHPEffect.amount || 0;
             console.log(`Removing Temporary HP bonus: -${hpLoss} Max HP`);
             // Reduce max HP first
             this.maxIntegrity = Math.max(1, this.maxIntegrity - hpLoss);
             // Clamp current HP to new max
             this.currentIntegrity = Math.min(this.currentIntegrity, this.maxIntegrity);
             // Mark for removal
             effectsToRemove.push('TempMaxHP');
        }
        // -----------------------

        this.activeStatusEffects = this.activeStatusEffects.filter(effect => {
            // Define statuses that persist between fights (should be very rare for player)
            const persist = [/*'PermanentBlessing'*/].includes(effect.id);
            // Remove internal flags like MirrorShieldUsed
            if (effect.id === 'MirrorShieldUsed' && !effectsToRemove.includes(effect.id)) { effectsToRemove.push(effect.id); }
            // Mark non-persistent effects for removal
            if (!persist && !effectsToRemove.includes(effect.id)) { effectsToRemove.push(effect.id); }
            return persist; // Keep only persistent effects
        });

        if (effectsToRemove.length > 0) {
            console.log(`Player cleaning up end-of-combat effects: ${effectsToRemove.join(', ')}`);
            this.triggerArtifacts('onCombatStatusCleanup', { removed: effectsToRemove });
            // No UI update needed here as combat screen is closing
        }
    }

} // End Player Class
