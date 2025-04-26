// js/core/Player.js

// Import needed components (will be created later)
// import { DeckManager } from './DeckManager.js';
// import { Artifact } from './Artifact.js';
// import * as Data from '../data.js'; // Assuming data.js is one level up

// --- Constants ---
const BASE_FOCUS = 3;
const BASE_INTEGRITY = 70; // Example base value

/**
 * Represents the player character during a run.
 */
export class Player {
    constructor(playerData = {}, metaProgression = null) {
        console.log("Creating Player instance...");

        // --- Core Stats ---
        this.name = playerData?.name || "Alchemist";
        // Base integrity can be modified by meta-progression or starting choices
        this.maxIntegrity = playerData?.maxIntegrity || (metaProgression?.getStartingBonus('maxIntegrity') || BASE_INTEGRITY);
        this.currentIntegrity = this.maxIntegrity; // Start at full health

        // Base focus modified by Cognitive Attunement and meta-progression
        this.maxFocus = BASE_FOCUS + Math.floor((playerData?.attunements?.Cognitive || 5) / 2); // Example scaling
        this.currentFocus = this.maxFocus; // Start combat with full focus

        // --- Attunements ---
        // Use provided attunements or defaults
        this.attunements = { ...this.getDefaultAttunements(), ...(playerData?.attunements || {}) };

        // --- Deck & Hand ---
        // TODO: Instantiate DeckManager properly
        // this.deckManager = new DeckManager(playerData?.startingDeck || this.getDefaultDeckIds());
        // Simple placeholder for now:
        this.deckManager = {
            drawPile: [...(playerData?.startingDeck || this.getDefaultDeckIds())],
            hand: [],
            discardPile: [],
            exhaustPile: [], // Cards removed for the rest of combat
            draw: (num) => {
                const drawn = [];
                for (let i = 0; i < num; i++) {
                    if (this.deckManager.drawPile.length === 0) {
                        if (this.deckManager.discardPile.length === 0) break; // No cards left anywhere
                        // Reshuffle discard into draw
                        console.log("Reshuffling discard into draw pile...");
                        this.deckManager.drawPile = this.shuffle([...this.deckManager.discardPile]);
                        this.deckManager.discardPile = [];
                    }
                    if (this.deckManager.drawPile.length > 0) {
                         // TODO: Actually create Card objects from IDs
                        const cardId = this.deckManager.drawPile.pop();
                        const cardData = { id: cardId, name: `Card ${cardId}` }; // Placeholder card data
                        drawn.push(cardData); // Push placeholder card object
                    }
                }
                this.deckManager.hand.push(...drawn);
                console.log(`Placeholder DeckManager: Drew ${drawn.length} cards. Hand size: ${this.deckManager.hand.length}`);
                return drawn;
            },
            discardHand: () => {
                console.log(`Placeholder DeckManager: Discarding hand (${this.deckManager.hand.length} cards)`);
                this.deckManager.discardPile.push(...this.deckManager.hand);
                this.deckManager.hand = [];
            },
            discardCard: (card) => {
                 const index = this.deckManager.hand.findIndex(c => c.id === card.id); // Find by unique identifier if possible
                 if (index > -1) {
                     this.deckManager.discardPile.push(...this.deckManager.hand.splice(index, 1));
                     console.log(`Placeholder DeckManager: Discarded ${card.name}. Hand size: ${this.deckManager.hand.length}`);
                 }
            },
             exhaustCard: (card) => {
                const index = this.deckManager.hand.findIndex(c => c.id === card.id); // Find by unique identifier if possible
                 if (index > -1) {
                     this.deckManager.exhaustPile.push(...this.deckManager.hand.splice(index, 1));
                     console.log(`Placeholder DeckManager: Exhausted ${card.name}. Hand size: ${this.deckManager.hand.length}`);
                 }
            },
            // Simple shuffle utility (Fisher-Yates)
            shuffle: (array) => {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            }
        };
        this.deckManager.shuffle(this.deckManager.drawPile); // Shuffle initial deck

        // --- Run-Specific Progress ---
        this.insightThisRun = 0; // Track insight gained during this specific run

        // --- Combat State ---
        this.currentBlock = 0;
        this.activeStatusEffects = []; // Array of { id: 'weak', duration: 2, source: 'enemyX' }

        // --- Artifacts ---
        // TODO: Instantiate Artifact objects properly
        this.artifacts = (playerData?.startingArtifacts || []).map(artId => ({ id: artId, name: `Artifact ${artId}` })); // Placeholder

        console.log("Player created:", this.name, "Integrity:", this.currentIntegrity, "Focus:", this.maxFocus);
        // console.log("Attunements:", this.attunements);
        // console.log("Deck:", this.deckManager.drawPile);
    }

    // --- Combat Actions ---

    startCombat() {
        console.log("Player: Starting Combat...");
        this.currentBlock = 0;
        this.activeStatusEffects = [];
        // Reset hand/discard (usually handled by DeckManager)
        this.deckManager.discardPile.push(...this.deckManager.hand);
        this.deckManager.hand = [];
        // Combine draw and discard for start of combat shuffle? Or just draw initial hand?
        // Let's assume deck is ready to draw from drawPile
        this.drawInitialHand();
        this.gainFocus(this.maxFocus); // Gain starting focus
    }

    startTurn() {
        console.log("Player: Starting Turn...");
        this.currentBlock = 0; // Block usually resets each turn
        this.gainFocus(this.maxFocus); // Gain focus for the turn
        this.tickStatusEffects('start'); // Apply start-of-turn effects and decrement durations
        this.drawCards(5); // Draw standard hand size
        // Trigger start-of-turn artifact effects
        this.triggerArtifacts('onTurnStart');
    }

    endTurn() {
        console.log("Player: Ending Turn...");
        // Trigger end-of-turn artifact effects
        this.triggerArtifacts('onTurnEnd');
        this.tickStatusEffects('end'); // Apply end-of-turn effects and decrement durations
        this.deckManager.discardHand();
    }

    playCard(card, target = null) {
        if (this.currentFocus >= card.cost) {
            this.spendFocus(card.cost);
            console.log(`Player: Playing card ${card.name} targeting ${target?.id || 'self/none'}`);
            // TODO: Execute card effect logic (needs Card class and effect engine)
            card.executeEffect(this, target); // Assuming card object has this method

            // Move card from hand to discard (or exhaust if applicable)
            if (card.exhausts) {
                this.deckManager.exhaustCard(card);
            } else {
                 this.deckManager.discardCard(card);
            }

            // Trigger artifacts related to playing cards
            this.triggerArtifacts('onCardPlay', card);
            return true; // Card played successfully
        } else {
            console.log(`Player: Not enough Focus to play ${card.name} (cost ${card.cost}, have ${this.currentFocus})`);
            return false; // Not enough focus
        }
    }

    drawCards(num) {
        // Delegate to DeckManager
        this.deckManager.draw(num);
        // TODO: Update Hand UI
    }

     drawInitialHand(num = 5) {
        this.deckManager.draw(num);
         // TODO: Update Hand UI
    }

    gainBlock(amount) {
        if (amount <= 0) return;
        // Consider status effects like 'Numbness'/'Fragile' here
        const modifiedAmount = this.applyModifiers('blockGain', amount);
        this.currentBlock += modifiedAmount;
        console.log(`Player: Gained ${modifiedAmount} Block. Total: ${this.currentBlock}`);
        // TODO: Update Player UI
    }

    takeDamage(amount) {
        if (amount <= 0) return;
        // Consider status effects like 'Vulnerable'
        const modifiedAmount = this.applyModifiers('damageTaken', amount);
        console.log(`Player: Attempting to take ${modifiedAmount} damage...`);

        const damageAfterBlock = Math.max(0, modifiedAmount - this.currentBlock);
        const blockConsumed = modifiedAmount - damageAfterBlock;

        this.currentBlock -= blockConsumed;
        this.currentIntegrity -= damageAfterBlock;

        console.log(`Player: Block absorbed ${blockConsumed}. Took ${damageAfterBlock} Integrity damage.`);
        console.log(`Player: Integrity: ${this.currentIntegrity}/${this.maxIntegrity}, Block: ${this.currentBlock}`);

        if (this.currentIntegrity <= 0) {
            this.currentIntegrity = 0;
            console.log("Player: Integrity depleted!");
            // Game over logic will be handled by GameState or CombatManager
        }
        // TODO: Update Player UI
    }

    heal(amount) {
        if (amount <= 0) return;
        const finalHeal = Math.min(amount, this.maxIntegrity - this.currentIntegrity);
        this.currentIntegrity += finalHeal;
        console.log(`Player: Healed ${finalHeal} Integrity. Total: ${this.currentIntegrity}/${this.maxIntegrity}`);
        // TODO: Update Player UI
    }

    spendFocus(amount) {
        this.currentFocus = Math.max(0, this.currentFocus - amount);
        console.log(`Player: Spent ${amount} Focus. Remaining: ${this.currentFocus}`);
        // TODO: Update Player UI
    }

    gainFocus(amount) {
        this.currentFocus = Math.min(this.maxFocus, this.currentFocus + amount);
         console.log(`Player: Gained ${amount} Focus. Total: ${this.currentFocus}`);
        // TODO: Update Player UI
    }

    // --- Status Effects ---

    applyStatus(statusId, duration, source = null) {
         // TODO: Implement proper Status Effect handling
        const existingStatus = this.activeStatusEffects.find(s => s.id === statusId);
        if (existingStatus) {
            existingStatus.duration += duration; // Stack duration? Or take max? Depends on effect.
            console.log(`Player: Refreshed status ${statusId} to duration ${existingStatus.duration}`);
        } else {
            this.activeStatusEffects.push({ id: statusId, duration: duration, source: source });
            console.log(`Player: Applied status ${statusId} for ${duration} turns`);
        }
         // TODO: Update Player Status UI
    }

    removeStatus(statusId) {
        this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId);
        console.log(`Player: Removed status ${statusId}`);
         // TODO: Update Player Status UI
    }

    hasStatus(statusId) {
        return this.activeStatusEffects.some(s => s.id === statusId);
    }

    tickStatusEffects(phase) { // phase = 'start' or 'end'
        console.log(`Player: Ticking ${phase}-of-turn status effects...`);
        const effectsToRemove = [];
        this.activeStatusEffects.forEach(effect => {
            // TODO: Apply actual effect logic based on statusId and phase
            // Example: If effect.id === 'poison' && phase === 'start', takeDamage(effect.potency)
             console.log(`   - Ticking ${effect.id} (Duration ${effect.duration})`);

            // Decrement duration (usually at end of turn)
            if (phase === 'end') {
                 effect.duration--;
                 if (effect.duration <= 0) {
                     effectsToRemove.push(effect.id);
                 }
            }
        });

        if (effectsToRemove.length > 0) {
            console.log(`   - Removing expired effects: ${effectsToRemove.join(', ')}`);
            this.activeStatusEffects = this.activeStatusEffects.filter(
                effect => effect.duration > 0
            );
        }
        // TODO: Update Player Status UI
    }

     // --- Modifiers (Placeholder) ---
     applyModifiers(modifierType, baseValue) {
         let modifiedValue = baseValue;
         // Check status effects
         if (modifierType === 'damageTaken' && this.hasStatus('Vulnerable')) {
             modifiedValue = Math.floor(modifiedValue * 1.5); // Example: 50% more damage
         }
         if (modifierType === 'damageDealt' && this.hasStatus('Weak')) {
             modifiedValue = Math.floor(modifiedValue * 0.75); // Example: 25% less damage
         }
          if (modifierType === 'damageDealt' && this.hasStatus('Strength')) {
             const strengthAmount = this.getStatusAmount('Strength'); // Need helper
             modifiedValue += strengthAmount;
         }
          if (modifierType === 'blockGain' && this.hasStatus('Dexterity')) {
             const dexAmount = this.getStatusAmount('Dexterity'); // Need helper
             modifiedValue += dexAmount;
         }
         // TODO: Check artifacts for relevant modifiers
         // this.artifacts.forEach(artifact => {
         //     modifiedValue = artifact.applyModifier(modifierType, modifiedValue);
         // });
         return modifiedValue;
     }

     getStatusAmount(statusId) {
         // Helper to get the stack count or potency if status effects have amounts
         // Placeholder - assumes duration IS the amount for simple Strength/Dex
         const status = this.activeStatusEffects.find(s => s.id === statusId);
         return status ? status.duration : 0;
     }


    // --- Artifacts ---
    addArtifact(artifactId) {
        // TODO: Create Artifact object from ID and add to this.artifacts
         const artifactData = { id: artifactId, name: `Artifact ${artifactId}` }; // Placeholder
         this.artifacts.push(artifactData);
        console.log(`Player: Added artifact ${artifactData.name}`);
        // artifact.onPickup(this); // Trigger immediate effects if any
    }

    triggerArtifacts(triggerPhase, data = null) {
        // console.log(`Player: Triggering artifacts for phase: ${triggerPhase}`);
        // TODO: Loop through this.artifacts and call their trigger methods
        // this.artifacts.forEach(artifact => {
        //     artifact.trigger(triggerPhase, this, data);
        // });
    }

    // --- Deck Manipulation (Outside Combat) ---
    addCardToDeck(cardId) {
        // TODO: Add actual card object or just ID? Needs DeckManager refinement
        this.deckManager.drawPile.push(cardId); // Add to draw pile for now
        this.deckManager.shuffle(this.deckManager.drawPile); // Reshuffle maybe? Or add to bottom?
        console.log(`Player: Added Card ID ${cardId} to deck.`);
    }

    removeCardFromDeck(cardToRemove) { // Pass in specific card instance/ID to remove
         // TODO: Needs robust DeckManager to search draw, discard, hand
        let found = false;
        ['drawPile', 'discardPile', 'hand'].forEach(pileName => {
            if (found) return;
            const index = this.deckManager[pileName].findIndex(c => c.id === cardToRemove.id); // Assuming cards have unique IDs
            if (index > -1) {
                this.deckManager[pileName].splice(index, 1);
                console.log(`Player: Removed ${cardToRemove.name} from ${pileName}.`);
                found = true;
            }
        });
        if (!found) {
            console.warn(`Player: Could not find card ${cardToRemove.name} to remove.`);
        }
    }

    // --- Utility ---
    getDefaultDeckIds() {
        // Find basic concepts from Data
        // Example: Look for 'Vanilla Sex', 'Sensual Touch', maybe basic 'Attack'/'Defend' analogs if needed
        const basicAttackId = 1; // Placeholder for 'Vanilla Sex' or similar
        const basicDefendId = 2; // Placeholder for 'Sensual Touch' or block equivalent
        return [
            basicAttackId, basicAttackId, basicAttackId, basicAttackId, basicAttackId,
            basicDefendId, basicDefendId, basicDefendId, basicDefendId, basicDefendId,
        ]; // Standard Slay the Spire style starter
    }

    getDefaultAttunements() {
        // Matches GameState default for consistency
        return {
            Attraction: 5, Interaction: 5, Sensory: 5, Psychological: 5,
            Cognitive: 5, Relational: 5, RoleFocus: 5
        };
    }
}
