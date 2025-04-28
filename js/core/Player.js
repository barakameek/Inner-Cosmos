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
        this.gainFocus(this.maxFocus); // Gain focus (logs gain)
        this.drawInitialHand(); // Draw initial hand (logs draw)
        this.gameStateRef?.uiManager?.logCombatEvent("Combat Started.", "info"); // Log combat start
        console.log("Player combat setup complete.");
    }

    /** Starts the player's turn. */
    startTurn() {
        const turnNum = this.gameStateRef?.combatManager?.turnNumber || '?';
        console.log(`Player: Starting Turn ${turnNum}`);
        this.gameStateRef?.uiManager?.logCombatEvent(`--- Player Turn ${turnNum} ---`, "info");
        this.currentBlock = 0; // Reset block
        this.triggerArtifacts('onTurnStart'); // Trigger start of turn artifacts
        this.gainFocus(this.maxFocus); // Gain base focus (logs gain)
        this.tickStatusEffects('start'); // Status effects log themselves
        if (this.currentIntegrity <= 0) { console.log("Player died from start-of-turn effects."); this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); return; } // Check death, update UI
        this.drawCards(5); // Draw standard hand size (logs draw)
        this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); // Update UI once after all start-of-turn actions
    }

    /** Ends the player's turn. */
    endTurn() {
        console.log("Player: Ending Turn...");
        this.triggerArtifacts('onTurnEnd'); // Trigger end-of-turn artifacts
        this.tickStatusEffects('end'); // Status effects log themselves

        // Log Ethereal Exhaust
        const handAtTurnEnd = [...this.deckManager.hand];
        let etherealExhausted = false;
        handAtTurnEnd.forEach(card => {
             if (card.isEthereal && this.deckManager.hand.includes(card)) {
                 // Log before exhausting
                 this.gameStateRef?.uiManager?.logCombatEvent(`${card.name} exhausted (Ethereal).`, "card");
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

        // Log Hand Discard
        const handSize = this.deckManager.hand.length;
        if (handSize > 0) {
            this.gameStateRef?.uiManager?.logCombatEvent(`Discarded ${handSize} card${handSize > 1 ? 's' : ''}.`, "info");
        }
        this.deckManager.discardHand(); // Triggers discard artifacts internally

        this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); // Update player info UI after all end-of-turn effects/discard
        this.gameStateRef?.uiManager?.logCombatEvent(`--- End Player Turn ---`, "info");
    }

    // --- Combat Actions ---

    /** Attempts to play a card from hand. */
    playCard(card, target = null, enemies = []) {
        if (!card || !(card instanceof Card)) { console.error("Player.playCard: Invalid card object."); return false; }
        if (card.cost === null) { console.warn(`Player: Cannot play unplayable card ${card.name}.`); this.gameStateRef?.uiManager?.showActionFeedback("Cannot play this card!", "warning"); return false; }

        const modifiedCost = Math.max(0, this.applyModifiers('cardCost', card.cost));
        const targetName = target ? target.name : (card.targetType === 'self' ? 'Self' : 'None');

        if (this.currentFocus >= modifiedCost) {
            this.spendFocus(modifiedCost); // Logs focus spent

            // Log card play BEFORE effect execution for clarity
            this.gameStateRef?.uiManager?.logCombatEvent(`Played ${card.name} (${modifiedCost} <i class='fa-solid fa-bolt'></i>) -> ${targetName}`, "player");

            // --- DYNAMIC ATTUNEMENT CHANGE ---
            if (card.primaryElement && this.attunements.hasOwnProperty(card.primaryElement)) {
                const attunementGain = 0.1; // Base gain for primary element
                this.adjustAttunement(card.primaryElement, attunementGain);
                // Optional: Add smaller gain for secondary elements based on card.elementScores
            }

            const eventData = { card: card, target: target }; // Data for triggers
            card.executeEffect(this, target, enemies); // Execute effect (might log more specific actions)
            this.triggerArtifacts('onCardPlay', eventData); // Trigger AFTER effect

            // --- Milestone Check for Card Play ---
            const turnState = this.gameStateRef?.combatManager?.getTurnState();
            // Check value AFTER increment in CombatManager (or pass current count)
            // Assuming CombatManager increments BEFORE calling this (or adjust logic)
            if(turnState?.cardsPlayedThisTurn >= 8) {
                this.gameStateRef?.triggerMilestoneAction('playManyCardsTurn', turnState.cardsPlayedThisTurn);
            }


            // Move Card After Play
            if (card.exhausts) {
                this.gameStateRef?.uiManager?.logCombatEvent(`${card.name} exhausted.`, "card"); // Log exhaust
                this.triggerArtifacts('onCardExhaust', { card: card, reason: 'played' });
                this.deckManager.exhaustCardFromHand(card); // Updates exhaust count UI
            } else {
                 // Discard logging handled by discardCardFromHand if needed, but maybe too verbose.
                 // Log here if desired: this.gameStateRef?.uiManager?.logCombatEvent(`${card.name} discarded.`, "card");
                 this.deckManager.discardCardFromHand(card); // Updates discard count UI
            }

            // Explicitly update player info UI if status effects might have changed during execution
            this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this);

            return true; // Success
        } else {
            console.log(`Player: Not enough Focus for ${card.name} (cost ${card.cost} -> ${modifiedCost}, have ${this.currentFocus})`);
            this.gameStateRef?.uiManager?.showActionFeedback("Not enough Focus!", "error");
            // Log failed attempt? Optional.
            // this.gameStateRef?.uiManager?.logCombatEvent(`Failed to play ${card.name} (Cost: ${modifiedCost}).`, "warning");
            return false; // Failure
        }
    }


    /** Draws cards using DeckManager. */
    drawCards(num) {
        if (!this.deckManager || num <= 0) return;
        const drawn = this.deckManager.draw(num); // DeckManager handles reshuffle UI count updates
        if (drawn.length > 0) {
            this.triggerArtifacts('onCardsDrawn', { cards: drawn, count: drawn.length });
            // Log card draw
            this.gameStateRef?.uiManager?.logCombatEvent(`Drew ${drawn.length} card${drawn.length > 1 ? 's' : ''}.`, "info");
        } else if (this.deckManager.getDrawPileCount() === 0 && this.deckManager.getDiscardPileCount() === 0){
             // Only log if truly out of cards
             this.gameStateRef?.uiManager?.logCombatEvent(`Attempted draw, no cards left.`, "warning");
        }
        // Hand rendering is typically handled by CombatManager after calling this during startTurn
    }

    /** Draws the initial hand at combat start. */
     drawInitialHand(num = 5) {
        if (!this.deckManager) return;
        const drawn = this.deckManager.draw(num); // DeckManager handles reshuffle UI count updates
        if (drawn.length > 0) {
             this.triggerArtifacts('onCardsDrawn', { cards: drawn, count: drawn.length, initial: true });
             // Log initial draw
             this.gameStateRef?.uiManager?.logCombatEvent(`Drew initial hand (${drawn.length}).`, "info");
        }
        // Hand rendering is handled by CombatManager after calling this during startCombat
    }

    // --- Stat Interactions ---

    /** Gains block, applying modifiers, triggering artifacts, and showing floating number. */
    gainBlock(amount) {
        if (amount <= 0) return;
        const modifiedAmount = this.applyModifiers('blockGain', amount); // Modifiers might log themselves
        if (modifiedAmount <= 0) {
             this.gameStateRef?.uiManager?.logCombatEvent(`Block gain negated.`, "info"); // Log negation
             return;
        }

        const previousBlock = this.currentBlock;
        this.currentBlock += modifiedAmount;

        // --- Floating Number ---
        let modifiersText = [];
        let modifierLog = "";
        if(this.hasStatus('Dexterity')) {
             const dexAmt = this.getStatusAmount('Dexterity');
             if (dexAmt > 0) { modifiersText.push(`+${dexAmt} Dex`); modifierLog += ` (+${dexAmt} Dex)`; }
        }
        if(this.hasStatus('Frail')) {
            modifiersText.push(`-25% Frail`); modifierLog += ` (Frail!)`;
        }
        // Add artifact modifiers here if needed
        this.gameStateRef?.uiManager?.showFloatingNumber(
            this.gameStateRef?.uiManager?.playerArea, // Target element
            `+${modifiedAmount}`, // Text
            'block', // Type
            modifiersText.join(', ') // Modifiers description
        );
        // ---------------------
        this.gameStateRef?.uiManager?.logCombatEvent(`Gained ${modifiedAmount} Block${modifierLog}.`, "block"); // Log gain

        this.triggerArtifacts('onGainBlock', { amount: modifiedAmount, previousBlock: previousBlock });
        this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); // Update UI
    }

    /** Takes damage, applying modifiers, block, triggering artifacts, and showing floating number. */
    takeDamage(amount, damageSource = null) {
        if (amount <= 0 || this.currentIntegrity <= 0) return 0;
        const initialAmount = amount;
        let modifiedAmount = amount;
        let modifiersText = [];
        // Use source name if it's an object, otherwise use the string
        const sourceName = damageSource?.name || (typeof damageSource === 'string' ? damageSource : 'Unknown Source');
        let logText = `Takes ${initialAmount} damage from ${sourceName}`;
        let damageType = 'damage'; // For floating number

        // Apply Intangible first
        const wasIntangible = this.hasStatus('Intangible');
        if (wasIntangible) {
            modifiedAmount = Math.max(1, modifiedAmount > 0 ? 1 : 0);
            modifiersText.push('Intangible!');
            logText += ` (Intangible!)`;
        }

        // Apply Vulnerable BEFORE other damage mods
        const wasVulnerable = this.hasStatus('Vulnerable');
        if (wasVulnerable) {
            const preVuln = modifiedAmount;
            modifiedAmount = Math.floor(modifiedAmount * 1.5);
            modifiersText.push('x1.5 Vuln!');
            logText += ` (x1.5 Vuln: ${preVuln} -> ${modifiedAmount})`;
        }

        // Apply standard damageTaken modifiers (e.g., potential future resistance statuses)
        modifiedAmount = this.applyModifiers('damageTaken', modifiedAmount); // Modifiers might log themselves
        modifiedAmount = Math.max(0, modifiedAmount);

        if (modifiedAmount <= 0) {
            this.gameStateRef?.uiManager?.showFloatingNumber(this.gameStateRef?.uiManager?.playerArea, `Negated!`, 'negate', modifiersText.join(', '));
            // Include source in log if possible
            this.gameStateRef?.uiManager?.logCombatEvent(`Damage from ${sourceName} negated${logText.includes('(') ? logText.substring(logText.indexOf('(')) : ''}.`, "info");
            this.triggerArtifacts('onDamageNegated', { initialAmount: initialAmount, source: damageSource });
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
             logText += ` (${blockConsumed} blocked)`;
        }
        if (damageAfterBlock > 0) {
             this.gameStateRef?.uiManager?.showFloatingNumber(
                 this.gameStateRef?.uiManager?.playerArea, `-${damageAfterBlock}`, 'damage', modifiersText.join(', ')
             );
             damageType = 'damage'; // Confirm it's HP damage
        } else {
             damageType = 'blocked'; // If all was blocked
        }
        // ------------------------------------

        // Log damage/block AFTER calculating values
        this.gameStateRef?.uiManager?.logCombatEvent(`${logText}.`, damageType);

        if (blockConsumed > 0) {
            this.currentBlock -= blockConsumed;
            this.triggerArtifacts('onBlockBroken', { amountBlocked: blockConsumed, initialDamage: modifiedAmount, source: damageSource });
        }
        if (damageAfterBlock > 0) {
            this.currentIntegrity -= damageAfterBlock;
            this.triggerArtifacts('onDamageTaken', { amount: damageAfterBlock, initialAmount: initialAmount, source: damageSource });
            // --- Milestone Check for Damage Taken ---
             // Check if damage source is enemy for relevant milestones
             const sourceIsEnemy = this.gameStateRef?.combatManager?.enemies.some(e => e.enemyType === damageSource || e.id === damageSource || e.name === sourceName);
             if(sourceIsEnemy) {
                  // Add milestones like 'takeXdamageCombat', 'takeXdamageUnblocked' here if needed
                  // Example: this.gameStateRef?.triggerMilestoneAction('takeDamage', damageAfterBlock);
             }
        }

        if (this.currentIntegrity <= 0 && previousIntegrity > 0) {
            this.currentIntegrity = 0;
            this.gameStateRef?.uiManager?.logCombatEvent(`Integrity depleted!`, "warning"); // Log death
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
        this.gameStateRef?.uiManager?.logCombatEvent(`Healed ${actualHeal} Integrity.`, "heal"); // Log heal

        this.triggerArtifacts('onHeal', { amount: actualHeal, previousIntegrity: previousIntegrity });
        this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); // Update UI
        return actualHeal;
    }


    /** Spends focus, triggering artifacts and updating UI. */
    spendFocus(amount) {
        if (amount <= 0) return;
        const previousFocus = this.currentFocus;
        const spentAmount = Math.min(amount, this.currentFocus);
        if (spentAmount <= 0) return; // Do nothing if trying to spend 0 or negative focus

        this.currentFocus -= spentAmount;
        this.gameStateRef?.uiManager?.logCombatEvent(`Spent ${spentAmount} Focus.`, "resource"); // Log focus spent
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
            this.gameStateRef?.uiManager?.logCombatEvent(`Gained ${actualGain} Focus.`, "resource"); // Log focus gained
            this.triggerArtifacts('onFocusGained', { amount: actualGain, previousFocus: previousFocus });
            this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); // Update UI
        }
    }


    // --- Status Effects ---

    /** Applies a status effect to the player. */
    applyStatus(statusId, duration, amount = 1, source = null) {
        if (!statusId) { console.warn("Player.applyStatus: Null/undefined ID."); return; }

        const definition = getStatusEffectDefinition(statusId);
        if (!definition) { console.warn(`Player.applyStatus: No definition for ${statusId}`); return; }

        const uiAffectingStatuses = ['Weak', 'Vulnerable', 'Frail', 'Strength', 'Dexterity', 'Entangle'];
        const canBeZero = uiAffectingStatuses.includes(statusId); // Allow applying 0 duration/amount for refresh checks

        // Prevent adding useless non-stacking statuses with 0 duration/amount unless specified
        if (!canBeZero && duration <= 0 && amount <= 0 && !definition.stacking) return;
        // Allow adding stackable statuses even if amount is 0 initially if duration > 0
        if (!canBeZero && duration <= 0 && amount <= 0 && definition.stacking && initialAmount <= 0) return;

        const existingStatus = this.activeStatusEffects.find(s => s.id === statusId);
        let statusAppliedOrUpdated = false;
        let logMsg = "";
        let previousAmount = 0;
        let previousDuration = 0;
        const sourceName = source?.name || (typeof source === 'string' ? source : 'Unknown');

        if (existingStatus) {
            previousAmount = existingStatus.amount || 0;
            previousDuration = existingStatus.duration || 0;
            let amtChanged = false;
            let durChanged = false;

            if (definition.stacking) {
                const oldAmt = existingStatus.amount || 0;
                existingStatus.amount = oldAmt + amount;
                if(existingStatus.amount !== oldAmt) amtChanged = true;
            }
            if (existingStatus.duration !== 99) { // Don't overwrite infinite duration
                const oldDur = existingStatus.duration;
                // If new duration is 0 or less, don't reduce existing duration unless it was already 0 or less
                const newEffectiveDuration = duration > 0 ? Math.max(existingStatus.duration, duration) : existingStatus.duration;
                existingStatus.duration = newEffectiveDuration;
                if(existingStatus.duration !== oldDur) durChanged = true;
            }
            existingStatus.source = sourceName; // Update source
            if (amtChanged || durChanged) {
                 logMsg = `Status Updated: ${statusId} (Amt: ${existingStatus.amount}, Dur: ${existingStatus.duration})`;
                 statusAppliedOrUpdated = true;
            }
        } else {
             let initialAmount = definition.stacking ? amount : 1;
             // Ensure initial amount isn't negative unless intended (e.g. Str debuff)
             // if (!allowNegativeStacks && initialAmount < 0) initialAmount = 0;

             // Prevent adding statuses that start at 0 amount and 0 duration unless needed
             if (initialAmount <= 0 && duration <= 0 && !canBeZero) return;

             this.activeStatusEffects.push({ id: statusId, duration: duration, source: sourceName, amount: initialAmount });
             logMsg = `Applied Status: ${statusId} (Amt: ${initialAmount}, Dur: ${duration}) from ${sourceName}`;
             statusAppliedOrUpdated = true;
        }

        if (statusAppliedOrUpdated) {
            this.gameStateRef?.uiManager?.logCombatEvent(logMsg, "status"); // Log status change
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
             this.gameStateRef?.uiManager?.logCombatEvent(`Status Removed: ${statusId}.`, "status"); // Log removal
             this.triggerArtifacts('onStatusRemoved', { statusId: statusId, removedEffect: removedEffect });
             // Update Combat UI immediately after removing a status
             this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this);
             return true;
        }
        return false;
    }

    /** Checks if the player has a specific status. */
    hasStatus(statusId) { return this.activeStatusEffects.some(s => s.id === statusId); }

    /** Gets the amount associated with a status (for stacking statuses). */
    getStatusAmount(statusId) { const status = this.activeStatusEffects.find(s => s.id === statusId); return status ? (status.amount || (status.duration > 0 ? 1 : 0)) : 0; }

    /** Process status effects at start/end of turn, updating UI if changes occur */
    tickStatusEffects(phase) {
        const effectsToRemove = [];
        // Iterate backwards to allow safe removal during iteration
        for (let i = this.activeStatusEffects.length - 1; i >= 0; i--) {
            const effect = this.activeStatusEffects[i];
            if (!effect) continue; // Should not happen, but safety check

            let removeEffectAfterTick = false;
            const initialAmount = effect.amount;
            const initialDuration = effect.duration;
            const definition = getStatusEffectDefinition(effect.id);
            let stateChanged = false; // Track if this specific effect changed

            // Start of Turn
             if (phase === 'start') {
                 switch(effect.id) {
                     case 'Poison':
                         if (effect.amount > 0) {
                             this.gameStateRef?.uiManager?.logCombatEvent(`Takes ${effect.amount} damage (Poison).`, "damage");
                             this.takeDamage(effect.amount, 'Poison'); // Handles its own logging/UI
                             if (this.currentIntegrity > 0 && this.activeStatusEffects.includes(effect)) {
                                 effect.amount--;
                                 if (effect.amount <= 0) removeEffectAfterTick = true;
                                 stateChanged = true;
                             } else { removeEffectAfterTick = true; stateChanged = true;}
                         } else { removeEffectAfterTick = true; stateChanged = true;}
                         break;
                     case 'Burn':
                         if (effect.amount > 0) {
                              this.gameStateRef?.uiManager?.logCombatEvent(`Takes ${effect.amount} damage (Burn).`, "damage");
                             this.takeDamage(effect.amount, 'Burn'); // Handles its own logging/UI
                             // Duration ticks at end of turn
                         }
                         break;
                     case 'Confusion':
                         if (this.deckManager.hand.length > 0) {
                             const index = Math.floor(Math.random() * this.deckManager.hand.length);
                             const card = this.deckManager.hand[index];
                             if (card) {
                                 this.gameStateRef?.uiManager?.logCombatEvent(`Discarded ${card.name} (Confusion).`, "card");
                                 this.deckManager.discardCardFromHand(card);
                             }
                         }
                         removeEffectAfterTick = true; stateChanged = true;
                         break;
                     case 'FocusNextTurn':
                         if (effect.amount > 0) { this.gainFocus(effect.amount); } // Gain focus logs itself
                         removeEffectAfterTick = true; stateChanged = true;
                         break;
                 }
             }

             // End of Turn
             if (phase === 'end') {
                  switch(effect.id) {
                     case 'Regen': if (effect.amount > 0) { this.heal(effect.amount); } break; // Heal logs itself
                     case 'Metallicize': if (effect.amount > 0) { this.gainBlock(effect.amount); } break; // Block logs itself
                     case 'Intangible': removeEffectAfterTick = true; this.gameStateRef?.uiManager?.logCombatEvent(`Intangible wore off.`, "status"); stateChanged = true; break;
                 }
                 // Duration Ticking
                 const tickDuration = definition?.durationBased && effect.duration !== 99 && effect.id !== 'Poison';
                 if (tickDuration && this.activeStatusEffects.includes(effect)) {
                     effect.duration--;
                     if (effect.duration <= 0) {
                          this.gameStateRef?.uiManager?.logCombatEvent(`${effect.id} expired.`, "status");
                          removeEffectAfterTick = true;
                     }
                     stateChanged = true;
                 }
             }

             if (removeEffectAfterTick) {
                 this.activeStatusEffects.splice(i, 1); // Remove the effect directly
             }
        } // End loop

        // Update UI once at the end if any status changed or was removed
        // This might be redundant if individual actions updated UI, but ensures consistency
        this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this);
     }


    // --- Modifiers ---
     /** Applies player-based modifiers (statuses) to a value. */
     applyModifiers(modifierType, baseValue) {
         let modifiedValue = baseValue;
         let logParts = []; // For logging changes

         switch (modifierType) {
            case 'damageDealt':
                if (this.hasStatus('Weak')) { const newVal = Math.floor(modifiedValue * 0.75); if(newVal < modifiedValue) logParts.push("Weak!"); modifiedValue = newVal; }
                if (this.hasStatus('Strength')) { const strAmt = this.getStatusAmount('Strength'); if(strAmt !== 0) logParts.push(`+${strAmt} Str`); modifiedValue += strAmt; }
                break;
            case 'damageTaken': // Only Vulnerable affects damage taken directly here
                // Intangible handled directly in takeDamage
                if (this.hasStatus('Vulnerable')) { const newVal = Math.floor(modifiedValue * 1.5); if(newVal > modifiedValue) logParts.push("Vulnerable!"); modifiedValue = newVal; }
                break;
            case 'blockGain':
                if (this.hasStatus('Dexterity')) { const dexAmt = this.getStatusAmount('Dexterity'); if(dexAmt !== 0) logParts.push(`+${dexAmt} Dex`); modifiedValue += dexAmt; }
                if (this.hasStatus('Frail')) { const newVal = Math.floor(modifiedValue * 0.75); if(newVal < modifiedValue) logParts.push("Frail!"); modifiedValue = newVal; }
                if (this.hasStatus('ProtocolActive')) { const protAmt = this.getStatusAmount('ProtocolActive'); if(protAmt !== 0) logParts.push(`+${protAmt} Proto`); modifiedValue += protAmt; }
                break;
            case 'cardCost':
                if (this.hasStatus('Entangle')) { const entAmt = this.getStatusAmount('Entangle'); if(entAmt !== 0) logParts.push(`+${entAmt} Entangle`); modifiedValue += entAmt; }
                break;
         }

         // Apply artifact passive modifications (placeholder for future implementation)
         this.artifacts.forEach(artifact => {
             if (artifact.isPassive && artifact.trigger === 'modifyValue' && artifact._condition(this, this.gameStateRef, { valueType: modifierType })) {
                 // Example: modifiedValue = artifact._effect(this, this.gameStateRef, { valueType: modifierType, currentValue: modifiedValue });
             }
         });

         modifiedValue = Math.max(0, Math.floor(modifiedValue));

         // Log modification (Optional, can be verbose)
         // if(logParts.length > 0 && modifiedValue !== baseValue) {
         //     // Find source element based on type for log clarity
         //     let element = this.gameStateRef?.uiManager?.playerArea; // Default to player
         //     if(modifierType === 'damageDealt') element = null; // Or find target?
         //     this.gameStateRef?.uiManager?.logCombatEvent(`Value modified: ${baseValue} -> ${modifiedValue} (${logParts.join(', ')})`, "info");
         // }

         return modifiedValue;
     }


    // --- Artifacts ---
    /** Adds an artifact instance to the player. */
    addArtifact(artifactId) {
        if (!artifactId) { console.warn("Player.addArtifact: Invalid artifactId."); return; }
        // Check if artifact already exists
        if (this.artifacts.some(a => a.id === artifactId)) {
             const existingArtifactName = ARTIFACT_TEMPLATES[artifactId]?.name || artifactId;
             this.gameStateRef?.uiManager?.showNotification(`Already possess: ${existingArtifactName}`);
             console.log(`Player already has artifact: ${artifactId}. Cannot add duplicate.`);
             return; // Don't add duplicates
        }
        try {
             const newArtifact = new Artifact(artifactId);
             if (newArtifact.id !== 'error_artifact') {
                 this.artifacts.push(newArtifact);
                 console.log(`Player Added artifact: ${newArtifact.name}`);
                 // Log artifact gain
                 this.gameStateRef?.uiManager?.logCombatEvent(`Acquired Relic: ${newArtifact.name}`, "info");
                 newArtifact.handleEvent('onPickup', this, this.gameStateRef); // Trigger pickup event immediately

                 // Update relevant UI elements after adding artifact
                 this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); // Update combat statuses if visible
                 this.gameStateRef?.uiManager?.updatePlayerMapInfo(this, this.gameStateRef?.currentFloor); // Update map info
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
                     // Maybe log artifact triggers? Can be very verbose.
                     // console.log(`Triggering ${artifact.name} for ${triggerPhase}`);
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
        const strikeId = 10001; const defendId = 10002; const clarityId = 10003; // Add clarity ID
        if (!Data?.concepts?.some(c => c.id === strikeId) || !Data?.concepts?.some(c => c.id === defendId) || !Data?.concepts?.some(c => c.id === clarityId) ) {
            console.warn(`Player.getDefaultDeckIds: Starter concept IDs missing!`);
            return [];
        }
        // Adjust starter deck composition slightly
        const strikes = Array(4).fill(strikeId);
        const defends = Array(4).fill(defendId);
        const clarities = Array(2).fill(clarityId);
        console.log(`Using default starter deck: 4x Strike, 4x Defend, 2x Clarity`);
        return [...strikes, ...defends, ...clarities];
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
             this.gameStateRef?.uiManager?.logCombatEvent(`Temporary HP (-${hpLoss}) removed.`, "info"); // Log removal
             this.maxIntegrity = Math.max(1, this.maxIntegrity - hpLoss);
             this.currentIntegrity = Math.min(this.currentIntegrity, this.maxIntegrity);
             effectsToRemove.push('TempMaxHP');
        }
        // -----------------------

        this.activeStatusEffects = this.activeStatusEffects.filter(effect => {
            const persist = [/*'PermanentBlessing'*/].includes(effect.id);
            if (effect.id === 'MirrorShieldUsed' && !effectsToRemove.includes(effect.id)) { effectsToRemove.push(effect.id); }
            if (!persist && !effectsToRemove.includes(effect.id)) { effectsToRemove.push(effect.id); }
            return persist;
        });

        if (effectsToRemove.length > 0) {
            console.log(`Player cleaning up end-of-combat effects: ${effectsToRemove.join(', ')}`);
            this.triggerArtifacts('onCombatStatusCleanup', { removed: effectsToRemove });
            // No UI update needed here as combat screen is closing
        }
    }

} // End Player Class
