// js/core/Player.js

import { DeckManager } from './DeckManager.js'; // Import the actual DeckManager
import { Artifact } from './Artifact.js'; // Import the actual Artifact class
// Assuming ArtifactDefinitions.js is accessible if needed directly, but Artifact class handles it
// import * as Data from '../data.js'; // Maybe not needed directly here anymore

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

        // --- Core Stats ---
        this.name = playerData?.name || "Alchemist";
        // Apply meta bonuses if metaProgression object is provided
        const startingIntegrityBonus = metaProgression?.getStartingBonus('maxIntegrityBonus') || 0;
        const baseIntegrity = metaProgression?.getStartingBonus('baseIntegrity') || BASE_INTEGRITY;
        this.maxIntegrity = baseIntegrity + startingIntegrityBonus;
        this.currentIntegrity = this.maxIntegrity;

        // Apply meta bonuses and Cognitive scaling for focus
        const baseFocus = metaProgression?.getStartingBonus('baseFocus') || BASE_FOCUS;
        const focusSlotsBonus = metaProgression?.getStartingBonus('focusSlots') || 0; // From milestones
        this.maxFocus = baseFocus + focusSlotsBonus + Math.floor((playerData?.attunements?.Cognitive || 5) / 3); // Adjusted scaling example
        this.currentFocus = this.maxFocus;

        // --- Attunements ---
        // Apply meta bonuses to base attunements
        const baseAttunements = this.getDefaultAttunements();
        this.attunements = { ...baseAttunements };
        if (metaProgression) {
            for (const key in this.attunements) {
                 const bonus = metaProgression.getStartingBonus(`attunement_${key}`); // e.g., 'attunement_Sensory'
                 if (bonus) {
                     this.attunements[key] += bonus;
                 }
            }
             // Apply 'All' attunement bonus if it exists
             const allBonus = metaProgression.getStartingBonus('attunement_All');
             if (allBonus) {
                 for (const key in this.attunements) {
                      this.attunements[key] += allBonus;
                 }
             }
        }
        // Merge provided playerData attunements (e.g., from archetype selection) over calculated base+bonus
        if (playerData?.attunements) {
             this.attunements = { ...this.attunements, ...playerData.attunements };
        }


        // --- Deck & Hand ---
        // Instantiate the actual DeckManager
        this.deckManager = new DeckManager(playerData?.startingDeck || this.getDefaultDeckIds());

        // --- Run-Specific Progress ---
        this.insightThisRun = 0;

        // --- Combat State ---
        this.currentBlock = 0;
        this.activeStatusEffects = []; // Array of { id: 'weak', duration: 2, amount: 1, source: 'enemyX' }

        // --- Artifacts ---
        // Instantiate Artifact objects properly
        this.artifacts = (playerData?.startingArtifacts || []).map(artId => new Artifact(artId));
         // Apply meta-unlocked starting artifacts?
         // Example: if (metaProgression?.isArtifactUnlocked('starting_relic_id')) this.addArtifact('starting_relic_id');

        console.log("Player created:", this.name, "Integrity:", this.currentIntegrity, "/", this.maxIntegrity, "Focus:", this.maxFocus);
        console.log("Player Attunements:", this.attunements);
        console.log(`Starting Deck Size: ${this.deckManager.masterDeck.length}`);
        console.log("Starting Artifacts:", this.artifacts.map(a=>a.name));
    }

    // --- Combat Actions ---

    startCombat() {
        console.log("Player: Starting Combat...");
        this.currentBlock = 0;
        this.activeStatusEffects = []; // Clear statuses from previous fight
        // DeckManager's resetForCombat should be called externally or handled by GameState ideally
        // this.deckManager.resetForCombat(); // Let GameState or CombatManager handle this if needed
        this.deckManager.hand = []; // Ensure hand is clear
        this.deckManager.discardPile = []; // Ensure discard is clear
        this.deckManager.exhaustPile = []; // Ensure exhaust is clear
        this.drawInitialHand();
        this.gainFocus(this.maxFocus); // Gain starting focus
        this.triggerArtifacts('onCombatStart'); // Trigger artifacts
    }

    startTurn() {
        console.log("Player: Starting Turn...");
        this.currentBlock = 0; // Block resets each turn
        this.gainFocus(this.maxFocus); // Gain focus for the turn (Could be modified by statuses/artifacts)
        this.triggerArtifacts('onTurnStart'); // Trigger artifacts BEFORE status ticks/draw
        this.tickStatusEffects('start'); // Apply start-of-turn effects and decrement durations AFTER artifact triggers
        this.drawCards(5); // Draw standard hand size AFTER artifact triggers
    }

    endTurn() {
        console.log("Player: Ending Turn...");
        this.triggerArtifacts('onTurnEnd'); // Trigger artifacts BEFORE status ticks/discard
        this.tickStatusEffects('end'); // Apply end-of-turn effects and decrement durations
        this.deckManager.discardHand(); // Discard hand AFTER triggers/ticks
    }

    playCard(card, target = null, enemies = []) { // Pass enemies array from CombatManager
        if (!card || !(card instanceof Card)) {
             console.error("Player.playCard: Invalid card object provided.");
             return false;
        }
        if (this.currentFocus >= card.cost) {
            this.spendFocus(card.cost);
            console.log(`Player: Playing card ${card.name} (Cost: ${card.cost}) targeting ${target?.name || 'self/none'}`);

            // --- Execute Card Effect ---
            // Pass player (this), target, and enemies array to the card's effect logic
            card.executeEffect(this, target, enemies);

            // --- Move Card After Play ---
            if (card.exhausts) {
                this.deckManager.exhaustCardFromHand(card);
            } else {
                 this.deckManager.discardCardFromHand(card);
            }

            // --- Trigger Artifacts ---
            this.triggerArtifacts('onCardPlay', { card: card }); // Pass card data
            return true; // Card played successfully
        } else {
            console.log(`Player: Not enough Focus to play ${card.name} (cost ${card.cost}, have ${this.currentFocus})`);
             // Optionally trigger UI feedback via uiManager?
            return false; // Not enough focus
        }
    }

    drawCards(num) {
        const drawn = this.deckManager.draw(num);
        this.triggerArtifacts('onCardsDrawn', { cards: drawn }); // Trigger after drawing
        // UI update should be handled by UIManager called from CombatManager/GameState
    }

     drawInitialHand(num = 5) {
        const drawn = this.deckManager.draw(num);
        this.triggerArtifacts('onCardsDrawn', { cards: drawn });
        // UI update...
    }

    gainBlock(amount) {
        if (amount <= 0) return;
        const modifiedAmount = this.applyModifiers('blockGain', amount);
        if (modifiedAmount <= 0) {
            console.log("Player: Block gain negated by modifiers.");
            return;
        };
        this.currentBlock += modifiedAmount;
        console.log(`Player: Gained ${modifiedAmount} Block. Total: ${this.currentBlock}`);
        this.triggerArtifacts('onGainBlock', { amount: modifiedAmount });
        // UI update...
    }

    takeDamage(amount) {
        if (amount <= 0) return;
        const modifiedAmount = this.applyModifiers('damageTaken', amount);
        if (modifiedAmount <= 0) {
            console.log("Player: Damage negated by modifiers.");
            return;
        }
        console.log(`Player: Attempting to take ${modifiedAmount} damage...`);

        const blockConsumed = Math.min(this.currentBlock, modifiedAmount);
        const damageAfterBlock = modifiedAmount - blockConsumed;

        if (blockConsumed > 0) {
            this.currentBlock -= blockConsumed;
            console.log(`Player: Block absorbed ${blockConsumed}.`);
             this.triggerArtifacts('onBlockBroken', { amount: blockConsumed }); // Trigger if block took hit
        }

        if (damageAfterBlock > 0) {
            this.currentIntegrity -= damageAfterBlock;
            console.log(`Player: Took ${damageAfterBlock} Integrity damage.`);
             this.triggerArtifacts('onDamageTaken', { amount: damageAfterBlock }); // Trigger AFTER taking HP damage
        }

        console.log(`Player: Integrity: ${this.currentIntegrity}/${this.maxIntegrity}, Block: ${this.currentBlock}`);

        if (this.currentIntegrity <= 0) {
            this.currentIntegrity = 0;
            console.log("Player: Integrity depleted!");
             this.triggerArtifacts('onDeath'); // Or maybe before setting to 0?
            // Game over logic handled by GameState/CombatManager checking HP
        }
        // UI update...
    }

    heal(amount) {
        if (amount <= 0) return;
        const actualHeal = Math.min(amount, this.maxIntegrity - this.currentIntegrity);
        if (actualHeal <= 0) return; // Already full health

        this.currentIntegrity += actualHeal;
        console.log(`Player: Healed ${actualHeal} Integrity. Total: ${this.currentIntegrity}/${this.maxIntegrity}`);
        this.triggerArtifacts('onHeal', { amount: actualHeal });
        // UI update...
    }

    // Keep spendFocus, gainFocus...
    spendFocus(amount) {
        this.currentFocus = Math.max(0, this.currentFocus - amount);
        console.log(`Player: Spent ${amount} Focus. Remaining: ${this.currentFocus}`);
        // UI update...
    }

    gainFocus(amount) {
        if (amount <= 0) return;
        const actualGain = Math.min(amount, this.maxFocus - this.currentFocus); // Can't exceed max
        this.currentFocus += actualGain;
         console.log(`Player: Gained ${actualGain} Focus. Total: ${this.currentFocus}`);
        // UI update...
    }

    // --- Status Effects ---
    applyStatus(statusId, duration, amount = 1, source = null) { // Added amount parameter
        if (duration <= 0 && amount <= 0) return; // Don't apply zero-effect status

        // TODO: Add check for status immunity (e.g., Artifact grants Debuff immunity)
        // if (this.hasStatusImmunity(statusId)) return;

        console.log(`Player attempting to apply status: ${statusId}, Duration: ${duration}, Amount: ${amount}, Source: ${source}`);

        const existingStatus = this.activeStatusEffects.find(s => s.id === statusId);
        let statusAppliedOrUpdated = false;

        if (existingStatus) {
            // Stack duration and amount (specific stacking logic might depend on status)
            existingStatus.duration = Math.max(existingStatus.duration, duration); // Example: Take max duration
            existingStatus.amount = (existingStatus.amount || 0) + amount;
            console.log(`Player: Refreshed status ${statusId} to duration ${existingStatus.duration}, amount ${existingStatus.amount}`);
             statusAppliedOrUpdated = true;
        } else {
             // Use duration unless it's a stacking passive like Strength/Dexterity
             let initialAmount = (['Strength', 'Dexterity'].includes(statusId)) ? amount : 1; // Start stack at amount, others at 1?
             this.activeStatusEffects.push({ id: statusId, duration: duration, source: source, amount: initialAmount });
            console.log(`Player: Applied status ${statusId} for ${duration} turns, amount ${initialAmount}`);
             statusAppliedOrUpdated = true;
        }

        if(statusAppliedOrUpdated) {
            // Trigger artifacts AFTER status is actually applied/updated
            this.triggerArtifacts('onStatusAppliedToPlayer', { status: { id: statusId, duration, amount, source } });
             // UI update... (Needs UIManager reference or event system)
            this.gameStateRef?.uiManager?.updatePlayerCombatInfo(this); // Direct call if ref exists
        }
    }

     removeStatus(statusId) {
         const initialLength = this.activeStatusEffects.length;
        this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId);
         if (this.activeStatusEffects.length < initialLength) {
            console.log(`Player: Removed status ${statusId}`);
            this.triggerArtifacts('onStatusRemoved', { statusId: statusId });
             // UI update...
             this.gameStateRef?.uiManager?.updatePlayerCombatInfo(this);
        }
    }

    hasStatus(statusId) {
        return this.activeStatusEffects.some(s => s.id === statusId);
    }

    // Modified to handle amount
    getStatusAmount(statusId) {
        const status = this.activeStatusEffects.find(s => s.id === statusId);
        // Return amount if it exists and is > 0, otherwise check duration for non-stacking effects
        return status ? (status.amount || (status.duration > 0 ? 1 : 0)) : 0;
    }


    tickStatusEffects(phase) { // phase = 'start' or 'end'
        console.log(`Player: Ticking ${phase}-of-turn status effects...`);
        const effectsToRemove = [];
        const statusesAtStartOfTick = [...this.activeStatusEffects]; // Copy array as effects might modify it

        statusesAtStartOfTick.forEach(effect => {
            // Check if effect still exists (might have been removed by another tick)
            if (!this.activeStatusEffects.some(s => s.id === effect.id && s.duration === effect.duration && s.amount === effect.amount)) return;

            // --- Apply Status Logic based on Phase ---
             if (effect.id === 'Poison' && phase === 'start') { // Example: Poison damage at start
                 console.log(`Poison ticks for ${effect.amount} damage.`);
                 this.takeDamage(effect.amount); // Take damage equal to stack amount
                 effect.amount--; // Reduce stack amount
                 if (effect.amount <= 0) effectsToRemove.push(effect.id);
             }
            if (effect.id === 'Regen' && phase === 'end') { // Example: Regen at end
                console.log(`Regen ticks for ${effect.amount} healing.`);
                this.heal(effect.amount);
                // Regen doesn't typically reduce stack, just duration
            }


            // --- Decrement Duration (Usually at End of Turn) ---
             // Don't decrement duration for passive stackable buffs like Strength/Dexterity?
             const isPassiveStack = ['Strength', 'Dexterity'].includes(effect.id);

             if (phase === 'end' && effect.duration !== 99 && !isPassiveStack) { // Check for pseudo-permanent (99) or passive stacks
                 effect.duration--;
                 if (effect.duration <= 0 && !effectsToRemove.includes(effect.id)) {
                     effectsToRemove.push(effect.id);
                 }
             }
        });

        if (effectsToRemove.length > 0) {
            console.log(`   - Removing expired effects on Player: ${effectsToRemove.join(', ')}`);
            this.activeStatusEffects = this.activeStatusEffects.filter(
                effect => !effectsToRemove.includes(effect.id)
            );
        }
        // UI update...
        this.gameStateRef?.uiManager?.updatePlayerCombatInfo(this);
    }


    // --- Modifiers ---
     applyModifiers(modifierType, baseValue) {
         let modifiedValue = baseValue;
         // Apply player status effects
         if (modifierType === 'damageDealt' && this.hasStatus('Weak')) {
             modifiedValue = Math.floor(modifiedValue * 0.75);
         }
         if (modifierType === 'damageTaken' && this.hasStatus('Vulnerable')) {
             modifiedValue = Math.floor(modifiedValue * 1.5);
         }
         if (modifierType === 'damageDealt' && this.hasStatus('Strength')) {
             modifiedValue += this.getStatusAmount('Strength');
         }
         if (modifierType === 'blockGain' && this.hasStatus('Dexterity')) {
             modifiedValue += this.getStatusAmount('Dexterity');
         }
         if (modifierType === 'blockGain' && this.hasStatus('Frail')) { // Example negative status
             modifiedValue = Math.floor(modifiedValue * 0.75);
         }

        // Apply artifact modifiers
        this.artifacts.forEach(artifact => {
            // Artifacts might have specific methods or data for modifiers
            // Example: artifact might have a property artifact.modifiers = { damageDealt: 1.1 };
            // Or a method: modifiedValue = artifact.applyModifier(modifierType, modifiedValue);
            // Placeholder: Assume artifacts modify via their triggered effects for now.
        });

         return Math.max(0, Math.floor(modifiedValue)); // Ensure non-negative result
     }


    // --- Artifacts ---
    addArtifact(artifactId) {
        // Ensure artifact isn't already present (usually checked by reward generation)
        if (this.artifacts.some(a => a.id === artifactId)) {
            console.warn(`Player already has artifact: ${artifactId}`);
            return;
        }
        const newArtifact = new Artifact(artifactId);
        if (newArtifact.id !== 'error_artifact') {
             this.artifacts.push(newArtifact);
             console.log(`Player: Added artifact ${newArtifact.name}`);
             // Trigger immediate onPickup effects if defined
             newArtifact.handleEvent('onPickup', this, this.gameStateRef);
             // Update relevant UI if needed
        }
    }

    /**
     * Calls handleEvent on all held artifacts for the specified trigger.
     * @param {string} triggerPhase - The event name (e.g., 'onTurnStart').
     * @param {object | null} data - Optional event data.
     */
    triggerArtifacts(triggerPhase, data = null) {
        if (!this.gameStateRef) {
            // console.warn("Player cannot trigger artifacts: gameStateRef not set.");
            // Silently fail if gameStateRef not available yet (e.g. during constructor)
            return;
        }
        // console.log(`Player: Triggering artifacts for phase: ${triggerPhase}`); // Can be noisy
        // Iterate over a copy in case an artifact effect modifies the artifacts array? Unlikely but safer.
        [...this.artifacts].forEach(artifact => {
            artifact.handleEvent(triggerPhase, this, this.gameStateRef, data);
        });
    }


    // --- Deck Manipulation (Relies on DeckManager) ---
    addCardToDeck(cardId) {
        this.deckManager.addCardToMasterDeck(cardId);
        // Update UI? (Deck count handled elsewhere)
        this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef); // Check deck size milestones
    }

    removeCardFromDeck(cardToRemove) {
        if (this.deckManager.removeCardFromMasterDeck(cardToRemove)) {
            // Update UI?
            this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef); // Check deck size milestones
            return true;
        }
        return false;
    }

    // --- Utility ---
    getDefaultDeckIds() { /* ... keep updated version ... */
        const vanilla = Data.concepts.find(c => c.name === "Vanilla Sex")?.id || 1;
        const touch = Data.concepts.find(c => c.name === "Sensual Touch")?.id || 2;
        return [ vanilla, vanilla, vanilla, vanilla, vanilla, touch, touch, touch, touch, touch ];
     }
     getDefaultAttunements() { /* ... keep ... */
         return { Attraction: 5, Interaction: 5, Sensory: 5, Psychological: 5, Cognitive: 5, Relational: 5, RoleFocus: 5 };
      }

} // End Player Class
