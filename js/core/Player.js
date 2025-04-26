// js/core/Player.js

import { DeckManager } from './DeckManager.js';
import { Artifact } from './Artifact.js';
import { Card } from './Card.js'; // Needed if status adds cards

// --- Constants ---
const BASE_FOCUS = 3;
const BASE_INTEGRITY = 70;

/**
 * Represents the player character during a run.
 */
export class Player {
    // Keep constructor and existing properties...
    constructor(playerData = {}, metaProgression = null) {
        // ... (constructor remains the same as File 18) ...
        console.log("Creating Player instance...");
        this.gameStateRef = null;
        this.name = playerData?.name || "Alchemist";
        const startingIntegrityBonus = metaProgression?.getStartingBonus('maxIntegrityBonus') || 0;
        const baseIntegrity = metaProgression?.getStartingBonus('baseIntegrity') || BASE_INTEGRITY;
        this.maxIntegrity = baseIntegrity + startingIntegrityBonus;
        this.currentIntegrity = this.maxIntegrity;
        const baseFocus = metaProgression?.getStartingBonus('baseFocus') || BASE_FOCUS;
        const focusSlotsBonus = metaProgression?.getStartingBonus('focusSlots') || 0;
        this.maxFocus = baseFocus + focusSlotsBonus + Math.floor((playerData?.attunements?.Cognitive || 5) / 3);
        this.currentFocus = this.maxFocus;
        const baseAttunements = this.getDefaultAttunements();
        this.attunements = { ...baseAttunements };
        if (metaProgression) { /* Apply meta attunement bonuses */
            for (const key in this.attunements) {
                 const bonus = metaProgression.getStartingBonus(`attunementBonus.${key}`);
                 if (bonus) this.attunements[key] += bonus;
            }
             const allBonus = metaProgression.getStartingBonus('attunementBonus.All');
             if (allBonus) { for (const key in this.attunements) this.attunements[key] += allBonus;}
        }
        if (playerData?.attunements) this.attunements = { ...this.attunements, ...playerData.attunements };
        this.deckManager = new DeckManager(playerData?.startingDeck || this.getDefaultDeckIds());
        this.insightThisRun = metaProgression?.getStartingBonus('startingInsightBonus') || 0; // Apply starting insight bonus
        this.currentBlock = 0;
        this.activeStatusEffects = [];
        this.artifacts = (playerData?.startingArtifacts || []).map(artId => new Artifact(artId));
        // Add starting artifacts from meta?
        // if(metaProgression?.getStartingBonus('hasStartingArtifactX')) this.addArtifact('artifactX_id');

        console.log("Player created:", this.name, "Integrity:", this.currentIntegrity, "/", this.maxIntegrity, "Focus:", this.maxFocus);
    }

    // Keep Combat Actions (startCombat, startTurn, endTurn, playCard, drawCards, drawInitialHand)...
    // Keep Stat Interactions (gainBlock, takeDamage, heal, spendFocus, gainFocus)...

    // --- Status Effects (Refined) ---

    applyStatus(statusId, duration, amount = 1, source = null) {
        if (duration <= 0 && amount <= 0) return; // Don't apply zero-effect

        // Check for immunity (e.g., Artifact grants immunity to Weak)
        // if (this.hasStatusImmunity(statusId)) {
        //     console.log(`Player has immunity to ${statusId}.`);
        //     // Optionally show feedback: this.gameStateRef?.uiManager?.showActionFeedback("Immune!", "info");
        //     return;
        // }

        console.log(`Player attempting to apply status: ${statusId}, Duration: ${duration}, Amount: ${amount}, Source: ${source}`);
        const existingStatus = this.activeStatusEffects.find(s => s.id === statusId);
        let statusAppliedOrUpdated = false;

        if (existingStatus) {
            // Stacking logic: Add amounts, refresh/extend duration?
            existingStatus.amount = (existingStatus.amount || 0) + amount;
            existingStatus.duration = Math.max(existingStatus.duration, duration); // Refresh to max duration generally
            console.log(`Player: Refreshed status ${statusId} to duration ${existingStatus.duration}, amount ${existingStatus.amount}`);
            statusAppliedOrUpdated = true;
        } else {
            // Amount only used for stacking effects initially
            let initialAmount = (['Strength', 'Dexterity', 'Poison', 'Regen', 'ProtocolActive' /* Add others */].includes(statusId)) ? amount : 1;
             if (initialAmount <= 0) return; // Don't add status with 0 amount unless it has duration > 0
             if (duration <= 0 && initialAmount <= 0) return; // Double check validity

            this.activeStatusEffects.push({
                id: statusId,
                duration: duration,
                source: source, // Store source ID (enemy ID, card ID?)
                amount: initialAmount
            });
            console.log(`Player: Applied status ${statusId} for ${duration} turns, amount ${initialAmount}`);
            statusAppliedOrUpdated = true;
        }

        if (statusAppliedOrUpdated) {
            // Trigger artifacts AFTER status is applied/updated
            this.triggerArtifacts('onStatusAppliedToPlayer', { status: { id: statusId, duration, amount, source } });
            // Request UI update via GameState reference
            this.gameStateRef?.uiManager?.updatePlayerCombatInfo(this);
        }
    }

    removeStatus(statusId) {
        const initialLength = this.activeStatusEffects.length;
        this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId);
        if (this.activeStatusEffects.length < initialLength) {
            console.log(`Player: Removed status ${statusId}`);
            this.triggerArtifacts('onStatusRemoved', { statusId: statusId });
            this.gameStateRef?.uiManager?.updatePlayerCombatInfo(this);
        }
    }

    hasStatus(statusId) {
        return this.activeStatusEffects.some(s => s.id === statusId);
    }

    getStatusAmount(statusId) {
        const status = this.activeStatusEffects.find(s => s.id === statusId);
        return status ? (status.amount || (status.duration > 0 ? 1 : 0)) : 0;
    }

    /** Process status effects at start/end of turn */
    tickStatusEffects(phase) { // phase = 'start' or 'end'
        console.log(`Player: Ticking ${phase}-of-turn status effects...`);
        const effectsToRemove = [];
        const statusesAtStartOfTick = [...this.activeStatusEffects]; // Iterate over copy

        statusesAtStartOfTick.forEach(effect => {
            if (!this.activeStatusEffects.includes(effect)) return; // Skip if removed by another effect's tick

            // --- Apply Status Logic ---
            switch (effect.id) {
                case 'Poison':
                    if (phase === 'start' && effect.amount > 0) {
                        console.log(`Player takes ${effect.amount} poison damage.`);
                        this.takeDamage(effect.amount); // Poison ignores block usually
                        effect.amount--; // Poison reduces stack
                        if (effect.amount <= 0) effectsToRemove.push(effect.id);
                    }
                    break;
                case 'Regen':
                    if (phase === 'end' && effect.amount > 0) { // Regen at end of turn
                        console.log(`Player heals ${effect.amount} from Regen.`);
                        this.heal(effect.amount);
                        // Regen often doesn't decrease stack, just duration (handled below)
                    }
                    break;
                case 'Confusion': // Example effect
                    if (phase === 'start') {
                         console.log("Player is Confused!");
                         // Implement Confusion effect (e.g., play random card? Discard random? Skip turn?)
                         // For simplicity, let's say it forces a random discard
                         if (this.deckManager.hand.length > 0) {
                             const randomIndex = Math.floor(Math.random() * this.deckManager.hand.length);
                             const cardToDiscard = this.deckManager.hand[randomIndex];
                              console.log(`Confusion forces discard of: ${cardToDiscard?.name}`);
                             if(cardToDiscard) this.deckManager.discardCardFromHand(cardToDiscard);
                              this.gameStateRef?.uiManager?.renderHand(this.deckManager.hand); // Update UI
                         }
                    }
                    break;
                // Add cases for other statuses: Burn, Frail, Intangible, ProtocolActive (might modify other actions)
            }

            // --- Decrement Duration ---
            const isPassiveStack = ['Strength', 'Dexterity', 'ProtocolActive' /* Add others? */ ].includes(effect.id);
            // Decrement duration at the END of the turn, unless it's a passive stack or permanent (99)
            if (phase === 'end' && effect.duration !== 99 && !isPassiveStack) {
                effect.duration--;
                console.log(`   - Status ${effect.id} duration now ${effect.duration}`);
                if (effect.duration <= 0 && !effectsToRemove.includes(effect.id)) {
                    // Check if amount still > 0 for stacking effects like poison? No, poison removed when amount=0.
                    effectsToRemove.push(effect.id);
                }
            }
        });

        // Remove effects marked for removal
        if (effectsToRemove.length > 0) {
            console.log(`   - Removing expired Player effects: ${effectsToRemove.join(', ')}`);
            this.activeStatusEffects = this.activeStatusEffects.filter(
                effect => !effectsToRemove.includes(effect.id)
            );
        }

        // Final UI Update after all ticks
        this.gameStateRef?.uiManager?.updatePlayerCombatInfo(this);
    }


    // --- Modifiers ---
     applyModifiers(modifierType, baseValue) {
         let modifiedValue = baseValue;

         // Apply relevant status effects
         if (modifierType === 'damageDealt') {
             if (this.hasStatus('Weak')) modifiedValue = Math.floor(modifiedValue * 0.75);
             if (this.hasStatus('Strength')) modifiedValue += this.getStatusAmount('Strength');
         } else if (modifierType === 'damageTaken') {
             if (this.hasStatus('Vulnerable')) modifiedValue = Math.floor(modifiedValue * 1.5);
              if (this.hasStatus('Intangible')) modifiedValue = Math.max(1, modifiedValue > 0 ? 1 : 0); // Damage becomes 1 if > 0
         } else if (modifierType === 'blockGain') {
             if (this.hasStatus('Dexterity')) modifiedValue += this.getStatusAmount('Dexterity');
             if (this.hasStatus('Frail')) modifiedValue = Math.floor(modifiedValue * 0.75);
         }
          // Add modifier checks for other statuses as needed (e.g., ProtocolActive might increase block)
           if (modifierType === 'blockGain' && this.hasStatus('ProtocolActive')) {
               modifiedValue += this.getStatusAmount('ProtocolActive'); // Example: Protocol adds block
           }

         // Apply artifact modifiers by triggering a specific artifact event type?
         // Or iterate here? Iterating here might be simpler if modifiers are common.
         // Example artifact check:
         // this.artifacts.forEach(artifact => {
         //    if (artifact.modifies === modifierType) { // Assuming artifact has this property
         //        modifiedValue = artifact.applyModification(modifiedValue); // Assuming method exists
         //    }
         // });
         // Sticking to triggered effects via handleEvent is cleaner for now.

         return Math.max(0, Math.floor(modifiedValue)); // Ensure non-negative integer
     }


    // --- Artifacts ---
    addArtifact(artifactId) { /* ... keep existing ... */
        if (this.artifacts.some(a => a.id === artifactId)) { console.warn(`Player already has artifact: ${artifactId}`); return; }
        const newArtifact = new Artifact(artifactId);
        if (newArtifact.id !== 'error_artifact') {
             this.artifacts.push(newArtifact); console.log(`Player: Added artifact ${newArtifact.name}`);
             newArtifact.handleEvent('onPickup', this, this.gameStateRef);
             // Update UI if needed (e.g., artifact display area)
        }
    }
    triggerArtifacts(triggerPhase, data = null) { /* ... keep existing ... */
        if (!this.gameStateRef) { return; }
        [...this.artifacts].forEach(artifact => { // Iterate copy
            artifact.handleEvent(triggerPhase, this, this.gameStateRef, data);
        });
    }

    // --- Deck Manipulation ---
    addCardToDeck(cardId) { /* ... keep existing ... */
        this.deckManager.addCardToMasterDeck(cardId);
        this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef);
    }
    removeCardFromDeck(cardToRemove) { /* ... keep existing ... */
        if (this.deckManager.removeCardFromMasterDeck(cardToRemove)) {
            this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef);
            return true;
        } return false;
    }

    // --- Utility ---
    getDefaultDeckIds() { /* ... keep existing ... */
         const vanilla = Data.concepts.find(c => c.name === "Vanilla Sex")?.id || 1;
         const touch = Data.concepts.find(c => c.name === "Sensual Touch")?.id || 2;
         return [ vanilla, vanilla, vanilla, vanilla, vanilla, touch, touch, touch, touch, touch ];
     }
     getDefaultAttunements() { /* ... keep existing ... */
         return { Attraction: 5, Interaction: 5, Sensory: 5, Psychological: 5, Cognitive: 5, Relational: 5, RoleFocus: 5 };
      }

} // End Player Class
