// js/core/Player.js

import { DeckManager } from './DeckManager.js';
import { Artifact } from './Artifact.js';
import { Card } from './Card.js'; // Needed if status adds cards
import * as Data from '../../data.js'; // Correct path from js/core/ to root


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
        const startingIntegrityBonus = metaProgression?.getStartingBonus('maxIntegrityBonus') || 0;
        const baseIntegrity = metaProgression?.getStartingBonus('baseIntegrity') || BASE_INTEGRITY; // Use meta base if available
        this.maxIntegrity = baseIntegrity + startingIntegrityBonus;
        this.currentIntegrity = this.maxIntegrity;

        const baseFocus = metaProgression?.getStartingBonus('baseFocus') || BASE_FOCUS; // Use meta base if available
        const focusSlotsBonus = metaProgression?.getStartingBonus('focusSlotsBonus') || 0;

        // --- Attunements (Calculate AFTER potential meta bonuses) ---
        const baseAttunements = this.getDefaultAttunements();
        this.attunements = { ...baseAttunements }; // Start with defaults

        // Apply meta progression bonuses to attunements
        if (metaProgression) {
            for (const key in this.attunements) {
                 // Access nested attunementBonus correctly using the key
                 const bonus = metaProgression.getStartingBonus(`attunementBonus.${key}`);
                 if (bonus) {
                     this.attunements[key] += bonus;
                 }
            } // <-- Added missing closing brace for for loop
            // Apply 'All' attunement bonus if it exists
            const allBonus = metaProgression.getStartingBonus('attunementBonus.All');
            if (allBonus) {
                for (const key in this.attunements) {
                     this.attunements[key] += allBonus;
                }
            }
        } // <-- Added missing closing brace for if(metaProgression)

        // Merge provided playerData attunements AFTER applying meta bonuses to defaults
        // This allows archetypes/choices to override the base+bonus calculation
        if (playerData?.attunements) {
             this.attunements = { ...this.attunements, ...playerData.attunements };
        }

        // Now calculate maxFocus using the FINAL starting Cognitive attunement
        const finalStartingCog = this.attunements.Cognitive || 5; // Use the calculated attunement
        this.maxFocus = baseFocus + focusSlotsBonus + Math.floor(finalStartingCog / 3); // Example scaling
        this.currentFocus = this.maxFocus;


        // --- Deck & Hand ---
        // Instantiate the actual DeckManager, pass self reference
        this.deckManager = new DeckManager(playerData?.startingDeck || this.getDefaultDeckIds(), this);

        // --- Run-Specific Progress ---
        this.insightThisRun = metaProgression?.getStartingBonus('startingInsightBonus') || 0; // Apply starting insight bonus

        // --- Combat State ---
        this.currentBlock = 0;
        this.activeStatusEffects = []; // Array of { id: 'weak', duration: 2, amount: 1, source: 'enemyX' }

        // --- Artifacts ---
        // Instantiate Artifact objects properly & filter errors
        this.artifacts = (playerData?.startingArtifacts || [])
            .map(artId => new Artifact(artId))
            .filter(a => a && a.id !== 'error_artifact');

         // Add starting artifacts from meta? Example check:
         // const startingArtifactMeta = metaProgression?.getStartingBonus('startingArtifactId');
         // if (startingArtifactMeta && metaProgression?.isArtifactUnlocked(startingArtifactMeta) && !this.artifacts.some(a => a.id === startingArtifactMeta)) {
         //     this.addArtifact(startingArtifactMeta);
         // }

        console.log("Player created:", this.name, "Integrity:", this.currentIntegrity, "/", this.maxIntegrity, "Focus:", this.maxFocus);
        console.log("Player Attunements:", this.attunements);
        console.log(`Starting Deck Size: ${this.deckManager.masterDeck.length}`);
        console.log("Starting Artifacts:", this.artifacts.map(a=>a.name).join(', ') || 'None');
    }

    // Method to be called by GameState after player is created
    setGameState(gameState) {
        this.gameStateRef = gameState;
    }

    // --- Combat Actions ---

    startCombat() {
        console.log("Player: Starting Combat...");
        this.currentBlock = 0;
        this.activeStatusEffects = []; // Clear statuses from previous fight
        this.deckManager.resetForCombat(); // Reset deck FIRST
        // --- Trigger onCombatStart BEFORE drawing hand ---
        this.triggerArtifacts('onCombatStart');
        // --- End Trigger ---
        this.gainFocus(this.maxFocus); // Gain focus first
        this.drawInitialHand(); // Draws hand AND triggers onCardsDrawn
        console.log("Player combat setup complete.");
    }

    startTurn() {
        console.log("Player: Starting Turn...");
        this.currentBlock = 0; // Block resets each turn
        // --- Trigger onTurnStart BEFORE other turn actions ---
        this.triggerArtifacts('onTurnStart');
        // --- End Trigger ---
        this.gainFocus(this.maxFocus); // Gain focus AFTER turn start triggers
        this.tickStatusEffects('start'); // Tick start-of-turn statuses AFTER turn start triggers
        this.drawCards(5); // Draw standard hand size AFTER ticking start effects
    }

    endTurn() {
        console.log("Player: Ending Turn...");
        // --- Trigger onTurnEnd BEFORE ticking end statuses/discarding ---
        this.triggerArtifacts('onTurnEnd');
        // --- End Trigger ---
        this.tickStatusEffects('end'); // Tick end-of-turn statuses BEFORE discarding

        // --- Handle Ethereal cards ---
        const etherealCards = this.deckManager.hand.filter(card => card.isEthereal);
        if (etherealCards.length > 0) {
             console.log(`Exhausting ethereal cards: ${etherealCards.map(c=>c.name).join(', ')}`);
             // Create a copy to iterate over as exhaustCardFromHand modifies the hand array
             [...etherealCards].forEach(card => {
                 // Trigger exhaust artifact FIRST
                 this.triggerArtifacts('onCardExhaust', { card: card, reason: 'ethereal' });
                 this.deckManager.exhaustCardFromHand(card); // Move to exhaust pile
             });
             // Update hand UI maybe? Less critical as discardHand clears it next.
             this.gameStateRef?.uiManager?.renderHand(this.deckManager.hand);
        }
        // --- End Ethereal ---

        this.deckManager.discardHand(); // Discard remaining hand (triggers discard artifacts)
    }

    playCard(card, target = null, enemies = []) {
        if (!card || !(card instanceof Card)) {
             console.error("Player.playCard: Invalid card object provided.");
             return false;
        }
        // Check cost modifier status effects BEFORE checking focus
        const modifiedCost = Math.max(0, this.applyModifiers('cardCost', card.cost));

        if (this.currentFocus >= modifiedCost) {
            this.spendFocus(modifiedCost); // Spend the modified cost
            console.log(`Player: Playing card ${card.name} (Cost: ${modifiedCost}) targeting ${target?.name || 'self/none'}`);

            // Execute Card Effect
            card.executeEffect(this, target, enemies);

            // Trigger onCardPlay AFTER effect resolves
            this.triggerArtifacts('onCardPlay', { card: card });

            // Move Card After Play & Triggers
            if (card.exhausts) {
                // Trigger onCardExhaust BEFORE it leaves the hand
                this.triggerArtifacts('onCardExhaust', { card: card });
                this.deckManager.exhaustCardFromHand(card);
            } else {
                 this.deckManager.discardCardFromHand(card); // Discard trigger happens in DeckManager
            }
            return true;
        } else {
            console.log(`Player: Not enough Focus for ${card.name} (cost ${card.cost} -> ${modifiedCost}, have ${this.currentFocus})`);
             this.gameStateRef?.uiManager?.showActionFeedback("Not enough Focus!", "error"); // UI Feedback
            return false;
        }
    }

    drawCards(num) {
        if (!this.deckManager) return; // Safety check
        const drawn = this.deckManager.draw(num);
        // --- Trigger onCardsDrawn AFTER cards are in hand ---
        if (drawn.length > 0) {
            this.triggerArtifacts('onCardsDrawn', { cards: drawn, count: drawn.length });
        }
        // UI update handled elsewhere
    }

     drawInitialHand(num = 5) {
        if (!this.deckManager) return; // Safety check
        const drawn = this.deckManager.draw(num);
         if (drawn.length > 0) {
            this.triggerArtifacts('onCardsDrawn', { cards: drawn, count: drawn.length, initial: true }); // Add context flag
        }
        // UI update handled elsewhere
    }

    // --- Stat Interactions ---

    gainBlock(amount) {
        if (amount <= 0) return;
        const modifiedAmount = this.applyModifiers('blockGain', amount);
        if (modifiedAmount <= 0) { return; } // Don't trigger if no actual block gained
        this.currentBlock += modifiedAmount;
        this.triggerArtifacts('onGainBlock', { amount: modifiedAmount });
    }

    takeDamage(amount, damageSourceElement = null) {
        if (amount <= 0) return;
        const initialAmount = amount;

        // Apply INTANGIBLE check first
        let dmgAmount = amount;
        if (this.hasStatus('Intangible')) {
            dmgAmount = Math.max(1, dmgAmount > 0 ? 1 : 0);
            console.log("Player Intangible reduced incoming damage!");
        }

        const modifiedAmount = this.applyModifiers('damageTaken', dmgAmount);
        if (modifiedAmount <= 0) { console.log("Player: Damage negated by modifiers/effects."); return; }

        const blockConsumed = Math.min(this.currentBlock, modifiedAmount);
        const damageAfterBlock = modifiedAmount - blockConsumed;
        const previousBlock = this.currentBlock;
        const previousIntegrity = this.currentIntegrity;

        if (blockConsumed > 0) {
            this.currentBlock -= blockConsumed;
            this.triggerArtifacts('onBlockBroken', { amountBlocked: blockConsumed, initialBlock: previousBlock });
        }
        if (damageAfterBlock > 0) {
            this.currentIntegrity -= damageAfterBlock;
            this.triggerArtifacts('onDamageTaken', { amount: damageAfterBlock, initialIntegrity: previousIntegrity });
        }

        if (this.currentIntegrity <= 0 && previousIntegrity > 0) {
            this.currentIntegrity = 0;
            console.log("Player: Integrity depleted!");
            this.triggerArtifacts('onDeath');
        }
    }

    heal(amount) {
        if (amount <= 0) return;
        const actualHeal = Math.min(amount, this.maxIntegrity - this.currentIntegrity);
        if (actualHeal <= 0) return;
        this.currentIntegrity += actualHeal;
        this.triggerArtifacts('onHeal', { amount: actualHeal });
    }

    spendFocus(amount) {
        if (amount <= 0) return;
        const spentAmount = Math.min(amount, this.currentFocus); // Can't spend more than you have
        this.currentFocus -= spentAmount;
        if (spentAmount > 0) {
            this.triggerArtifacts('onFocusSpent', { amount: spentAmount });
        }
    }

    gainFocus(amount) {
        if (amount <= 0) return;
        const previousFocus = this.currentFocus;
        this.currentFocus = Math.min(this.maxFocus, this.currentFocus + amount);
        const actualGain = this.currentFocus - previousFocus;
        if (actualGain > 0) {
             this.triggerArtifacts('onFocusGained', { amount: actualGain });
        }
    }

    // --- Status Effects ---

    applyStatus(statusId, duration, amount = 1, source = null) {
        if (duration <= 0 && amount <= 0) return;
        // if (this.hasStatusImmunity(statusId)) return; // Placeholder

        const existingStatus = this.activeStatusEffects.find(s => s.id === statusId);
        let statusAppliedOrUpdated = false;
        let previousAmount = 0;

        if (existingStatus) {
            previousAmount = existingStatus.amount || 0;
            // Stacking logic
            if (['Strength', 'Dexterity', 'Poison', 'Regen', 'Metallicize', 'Thorns', 'FocusNextTurn', 'TempMaxHP', 'Entangle', 'ProtocolActive'].includes(statusId)) {
                 existingStatus.amount = (existingStatus.amount || 0) + amount;
            }
            // Duration Refresh
            existingStatus.duration = Math.max(existingStatus.duration, duration);
            statusAppliedOrUpdated = true;
        } else {
             let initialAmount = amount; // Use provided amount directly
             if (initialAmount <= 0 && duration <= 0) return; // Don't add ineffective status

            this.activeStatusEffects.push({ id: statusId, duration: duration, source: source, amount: initialAmount });
            statusAppliedOrUpdated = true;
        }

        if (statusAppliedOrUpdated) {
            const currentStatus = this.activeStatusEffects.find(s => s.id === statusId);
            this.triggerArtifacts('onStatusAppliedToPlayer', {
                status: { ...currentStatus }, // Pass copy
                amountApplied: amount, previousAmount: previousAmount
            });
            this.gameStateRef?.uiManager?.updatePlayerCombatInfo(this);
        }
    }

    removeStatus(statusId) {
        const initialLength = this.activeStatusEffects.length;
        this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId);
        if (this.activeStatusEffects.length < initialLength) {
             this.triggerArtifacts('onStatusRemoved', { statusId: statusId });
             this.gameStateRef?.uiManager?.updatePlayerCombatInfo(this);
        }
    }

    hasStatus(statusId) {
        return this.activeStatusEffects.some(s => s.id === statusId);
    }

    getStatusAmount(statusId) {
        const status = this.activeStatusEffects.find(s => s.id === statusId);
        // Amount is primary for stacking effects, fallback to 1 if duration exists
        return status ? (status.amount || (status.duration > 0 ? 1 : 0)) : 0;
    }

    /** Process status effects at start/end of turn */
    tickStatusEffects(phase) { // phase = 'start' or 'end'
        const effectsToRemove = [];
        const statusesAtStartOfTick = [...this.activeStatusEffects];

        statusesAtStartOfTick.forEach(effect => {
            if (!this.activeStatusEffects.includes(effect)) return;

            let removeEffectAfterTick = false;
            switch (effect.id) {
                case 'Poison':
                    if (phase === 'start' && effect.amount > 0) { this.takeDamage(effect.amount, 'Poison'); effect.amount--; if (effect.amount <= 0) effectsToRemove.push(effect.id); } break;
                case 'Regen':
                    if (phase === 'end' && effect.amount > 0) this.heal(effect.amount); break;
                case 'Burn':
                     if (phase === 'start' && effect.amount > 0) this.takeDamage(effect.amount, 'Burn'); break; // Duration ticks below
                case 'Confusion':
                    if (phase === 'start') { if (this.deckManager.hand.length > 0) { const idx = Math.floor(Math.random() * this.deckManager.hand.length); const card = this.deckManager.hand[idx]; console.log(`Confusion discards: ${card?.name}`); if(card) this.deckManager.discardCardFromHand(card); } removeEffectAfterTick = true; } break;
                 case 'FocusNextTurn':
                     if (phase === 'start' && effect.amount > 0) { this.gainFocus(effect.amount); removeEffectAfterTick = true; } break;
                 case 'Intangible':
                     if (phase === 'end') removeEffectAfterTick = true; break; // Fades EOT
                 case 'TempMaxHP': case 'Frail': case 'Entangle': case 'Strength':
                 case 'Dexterity': case 'ProtocolActive': break; // Passives, duration handled below
                 default: break;
            }

            // Decrement Duration
            const isPassiveStack = ['Strength', 'Dexterity', 'ProtocolActive', 'TempMaxHP'].includes(effect.id);
            if (phase === 'end' && effect.duration !== 99 && !isPassiveStack) {
                effect.duration--;
                if (effect.duration <= 0 && !effectsToRemove.includes(effect.id)) { effectsToRemove.push(effect.id); }
            }
             if (removeEffectAfterTick && !effectsToRemove.includes(effect.id)) { effectsToRemove.push(effect.id); }
        });

        if (effectsToRemove.length > 0) {
            this.activeStatusEffects = this.activeStatusEffects.filter(effect => !effectsToRemove.includes(effect.id));
        }
        // UI update handled by CombatManager
    }


    // --- Modifiers ---
     applyModifiers(modifierType, baseValue) {
         let modifiedValue = baseValue;
         // Apply player status effects
         if (modifierType === 'damageDealt') {
             if (this.hasStatus('Weak')) modifiedValue = Math.floor(modifiedValue * 0.75);
             if (this.hasStatus('Strength')) modifiedValue += this.getStatusAmount('Strength');
         } else if (modifierType === 'damageTaken') {
             // Note: Intangible handled in takeDamage directly
             if (this.hasStatus('Vulnerable')) modifiedValue = Math.floor(modifiedValue * 1.5);
         } else if (modifierType === 'blockGain') {
             if (this.hasStatus('Dexterity')) modifiedValue += this.getStatusAmount('Dexterity');
             if (this.hasStatus('Frail')) modifiedValue = Math.floor(modifiedValue * 0.75);
             if (this.hasStatus('ProtocolActive')) modifiedValue += this.getStatusAmount('ProtocolActive');
         } else if (modifierType === 'cardCost') {
              if (this.hasStatus('Entangle')) modifiedValue += this.getStatusAmount('Entangle');
              // Example: if (this.hasStatus('FlowState')) modifiedValue = Math.max(0, modifiedValue - 1);
         }
         // Artifacts apply modifiers via triggered effects mostly

         return Math.max(0, Math.floor(modifiedValue)); // Ensure non-negative integer
     }


    // --- Artifacts ---
    addArtifact(artifactId) {
        if (this.artifacts.some(a => a.id === artifactId)) { return; } // Ignore duplicates
        const newArtifact = new Artifact(artifactId);
        if (newArtifact.id !== 'error_artifact') {
             this.artifacts.push(newArtifact); console.log(`Player Added artifact: ${newArtifact.name}`);
             newArtifact.handleEvent('onPickup', this, this.gameStateRef);
             this.gameStateRef?.uiManager?.updatePlayerCombatInfo(this); // Update UI potentially
        }
    }

    /** Calls handleEvent on all artifacts. */
    triggerArtifacts(triggerPhase, data = null) {
        if (!this.gameStateRef || !this.artifacts || this.artifacts.length === 0) { return; }
        // console.log(`Player Trigger: ${triggerPhase}`, data); // VERY noisy
        [...this.artifacts].forEach(artifact => {
             try { artifact.handleEvent(triggerPhase, this, this.gameStateRef, data); }
             catch (error) { console.error(`Error triggering artifact ${artifact.name} for event ${triggerPhase}:`, error); }
        });
    }


    // --- Deck Manipulation ---
    addCardToDeck(cardId) {
        const cardAdded = this.deckManager.addCardToMasterDeck(cardId); // DeckManager adds to masterDeck
        if(cardAdded){
            this.triggerArtifacts('onCardAdded', { card: cardAdded }); // Trigger after adding
            this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef);
        }
        return cardAdded;
    }

    removeCardFromDeck(cardToRemove) {
        const removed = this.deckManager.removeCardFromMasterDeck(cardToRemove); // DeckManager removes from masterDeck
        if (removed) {
             this.triggerArtifacts('onCardRemove', { card: cardToRemove }); // Trigger after removing
            this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef);
            return true;
        }
        return false;
    }

    // --- Utility ---
    getDefaultDeckIds() {
         const vanilla = Data.concepts.find(c => c.name === "Vanilla Sex")?.id || 1;
         const touch = Data.concepts.find(c => c.name === "Sensual Touch")?.id || 2;
         return [ vanilla, vanilla, vanilla, vanilla, vanilla, touch, touch, touch, touch, touch ];
     }
     getDefaultAttunements() {
         return { Attraction: 5, Interaction: 5, Sensory: 5, Psychological: 5, Cognitive: 5, Relational: 5, RoleFocus: 5 };
      }

    // --- End of Combat Cleanup ---
    /** Called by GameState or CombatManager when combat ends */
    cleanupCombatStatuses() {
        const initialLength = this.activeStatusEffects.length;
        const effectsToRemove = [];
         // Identify statuses that should *not* persist between combats
         this.activeStatusEffects = this.activeStatusEffects.filter(effect => {
              const persist = ['Strength', 'Dexterity', 'ProtocolActive', 'Regen' /* Add others? */ ].includes(effect.id);
              // Special handling for TempMaxHP (reset max HP, ensure current HP <= new max)
              if (effect.id === 'TempMaxHP') {
                   console.warn("TempMaxHP removal logic is simplified - not adjusting HP down.");
                   effectsToRemove.push(effect.id);
                   return false; // Remove the status tag
              }
              if (!persist) {
                  effectsToRemove.push(effect.id);
                  return false; // Remove if not persistent
              }
              return true; // Keep persistent statuses
         });

         if (effectsToRemove.length > 0) {
            console.log(`Player cleaning up end-of-combat effects: ${effectsToRemove.join(', ')}`);
            this.triggerArtifacts('onCombatStatusCleanup', { removed: effectsToRemove });
            this.gameStateRef?.uiManager?.updatePlayerCombatInfo(this);
        }
    }

} // End Player Class
