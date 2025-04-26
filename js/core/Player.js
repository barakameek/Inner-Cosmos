

// js/core/Player.js

import { DeckManager } from './DeckManager.js';
import (unements) {
                 // Access nested attunementBonus correctly
                 const bonus = metaProgression.getStartingBonus(`attunementBonus.${key}`);
                 if (bonus) {
                     this.attunements[key] += Artifact } from './Artifact.js';
import { Card } from './Card.js'; // Needed if status adds cards
import * as Data from '../../data.js'; // Keep for defaults if needed


// --- Constants ---
const BASE_FOCUS bonus;
                 }
            }
             // Apply 'All' attunement bonus if it exists
             const allBonus = metaProgression.getStartingBonus('attunementBonus.All');
             if (allBonus) {
                 for (const key in this.attunements) {
                      this.attunements = 3;
const BASE_INTEGRITY = 70;

/**
 * Represents the player character during a run.
 */
export class Player {
    constructor(playerData = {}, metaProgression = null) {
        console.log("Creating Player instance...");
        this.gameStateRef = null; // Will be set by Game[key] += allBonus;
                 }
             }
        }
        // Merge provided playerData attunements (e.g., from archetype selection) over calculated base+bonus
        if (playerData?.attunements) {
             this.attunements = { ...this.attunements, ...playerData.attunements };
        State after creation

        // --- Core Stats ---
        this.name = playerData?.name || "Alchemist";
        const startingIntegrityBonus = metaProgression?.getStartingBonus('maxIntegrityBonus') || 0;
        const}


        // --- Deck & Hand ---
        // Instantiate the actual DeckManager
        // Pass player reference ' baseIntegrity = metaProgression?.getStartingBonus('baseIntegrity') || BASE_INTEGRITY;
        this.maxIntegrity = baseIntegrity + startingIntegrityBonus;
        this.currentIntegrity = this.maxIntegrity;

        const baseFocus = metaProgression?.getStartingBonus('baseFocus') || BASE_this' to DeckManager constructor if needed, or set later
        this.deckManager = new DeckManager(playerData?.startingFOCUS;
        const focusSlotsBonus = metaProgression?.getStartingBonus('focusSlots') || 0;Deck || this.getDefaultDeckIds());
        this.deckManager.setPlayerReference(this); // Ensure DeckManager has player ref


        // --- Run-Specific Progress ---
        this.insightThisRun = metaProgression?.getStartingBonus('startingInsightBonus') || 0; // Apply starting insight bonus

        // --- Combat State ---
        this.currentBlock = 0;
        this.activeStatusEffects = []; // Array of { id: '
        // Use Cognitive Attunement from playerData IF provided, otherwise use default base (5) before potential meta bonuses
        const startingCog = playerData?.attunements?.Cognitive !== undefined ? playerData.attunements.Cognitive : (this.getDefaultAttunements().Cognitive + (metaProgression?.getStartingBonus('attunementBonus.weak', duration: 2, amount: 1, source: 'enemyX' }

        // --- Artifacts ---
        // Instantiate Artifact objects properly
        this.artifacts = (playerData?.startingArtifacts || []).map(artId => new Artifact(artId)).filter(a => a.id !== 'error_artifact'); // FilterCognitive') || 0) + (metaProgression?.getStartingBonus('attunementBonus.All') || 0));
        this.maxFocus = baseFocus + focusSlotsBonus + Math.floor(startingCog / 3); // Example scaling using final starting Cog
        this.currentFocus = this.maxFocus;

        // errors
         // Add starting artifacts from meta?
         // Example: if (metaProgression?.isArtifactUnlocked('starting_relic_id')) this.addArtifact('starting_relic_id');

        console.log("Player created:", this.name, "Integrity:", this.currentIntegrity, "/", this.maxIntegrity, "Focus:", this.maxFocus);
        // console.log("Player Attunements:", this.attunements); // --- Attunements ---
        const baseAttunements = this.getDefaultAttunements();
        this.attunements Less noisy log
        // console.log(`Starting Deck Size: ${this.deckManager.masterDeck.length}`);
        // console.log("Starting Artifacts:", this.artifacts.map(a=>a.name));
    }

    // Method to be called by GameState after player is created
    setGameState(gameState) {
        this.gameState = { ...baseAttunements };
        if (metaProgression) {
            for (const key in this.attunements) {
                 const bonus = metaProgression.getStartingBonus(`attunementBonus.${key}`); // Note the structure change here
                 if (bonus) this.attunements[key] += bonus;
            }
             const allBonus = metaProgression.getStartingBonus('attunementBonus.All');
             if (allBonus) { for (const key in this.attunements) this.attunements[key] += allBonus; }
        }
        // Merge provided playerData attunements AFTER applying metaRef = gameState;
    }

    // --- Combat Actions ---

    startCombat() {
        console.log("Player: Starting Combat...");
        this.currentBlock = 0;
        this.activeStatusEffects = []; bonuses to defaults
        if (playerData?.attunements) {
             this.attunements = { ...this.attunements, ...playerData.attunements };
        }


        // --- Deck & Hand ---
        this.deckManager = new DeckManager(playerData?.startingDeck || this.getDefaultDeckIds(), this); // Clear statuses from previous fight
        this.deckManager.resetForCombat(); // Reset deck FIRST
        // --- Trigger onCombatStart BEFORE drawing hand ---
        this.triggerArtifacts('onCombatStart');
        // --- End Trigger ---
        this.drawInitialHand(); // Draws hand AND triggers onCardsDrawn
        this.gainFocus(this.maxFocus); // Gain starting focus AFTER potential artifact effects
    }

    startTurn() {
        console.log("Player // Pass self reference

        // --- Run-Specific Progress ---
        this.insightThisRun = metaProgression?.getStartingBonus('startingInsightBonus') || 0;

        // --- Combat State ---
        this.currentBlock = 0;: Starting Turn...");
        this.currentBlock = 0; // Block resets each turn
        // --- Trigger onTurnStart BEFORE gaining focus/drawing ---
        this.triggerArtifacts('onTurnStart');
        // --- End Trigger ---
        this.gainFocus(this.maxFocus); // Gain focus AFTER turn start triggers
        
        this.activeStatusEffects = [];

        // --- Artifacts ---
        this.artifacts = (playerData?.startingArtifacts || []).map(artId => new Artifact(artId));
         // Add starting artifacts from meta? Example check:
         // const startingArtifactMeta = metaProgression?.getStartingBonus('startingArtifactId');
         // if (startingArtifactMeta && !this.artifacts.some(a => a.id === startingArtifactMeta))this.tickStatusEffects('start'); // Tick statuses AFTER turn start triggers
        this.drawCards(5); // Draw standard hand size AFTER ticking start effects
    }

    endTurn() {
        console.log("Player: Ending Turn...");
        // --- Trigger onTurnEnd BEFORE ticking statuses/discarding ---
        this.triggerArtifacts('onTurnEnd');
        // --- End Trigger ---
        this.tickStatusEffects('end'); // Tick statuses AFTER end turn triggers
         {
         //     this.addArtifact(startingArtifactMeta);
         // }

        console.log("Player created:", this.name, "Integrity:", this.currentIntegrity, "/", this.maxIntegrity, "Focus:", this.maxFocus);
        console.log("Player Attunements:", this.attunements);
        console.log(`Starting Deck Size: ${this.deckManager.masterDeck.length}`);
        console.log("Starting Artifacts:", this.artifacts.map(a=>a.name));
    }

    // Methodthis.deckManager.discardHand(); // Discard hand last (triggers discard artifacts)
    }

    playCard(card, target = null, enemies = []) {
        if (!card || !(card instanceof Card)) {
             console.error("Player.playCard: Invalid card object provided.");
             return false;
        }
        // --- NEW: Check Card Cost with Modifiers ---
         let currentCost = card.cost;
         // Apply to set GameState reference after creation
    setGameState(gameState) {
        this.gameStateRef = gameState;
    }

    // --- Combat Actions ---

    startCombat() {
        console.log("Player: Starting Combat...");
        this.currentBlock = 0;
        this.activeStatusEffects = []; // Clear statuses from previous fight

        // Reset DeckManager state (should already be reset by its own constructor or a dedicated GameState call cost modifiers from player statuses
         currentCost = this.applyModifiers('cardCost', currentCost);
         currentCost = Math.max(0, currentCost); // Cost cannot be negative

        if (this.currentFocus >= currentCost) {
        // --- End NEW ---
            this.spendFocus(currentCost); // Spend modified cost
            // --- Trigger onCardPlayAttempt? (Optional) ---
            // this.triggerArtifacts('onCardPlay)
        this.deckManager.resetForCombat(); // Ensure piles are reset

        // Trigger onCombatStart BEFORE drawing hand
        this.triggerArtifacts('onCombatStart');

        // Draw initial hand and gain focus
        this.gainFocus(this.maxFocus); // Gain focus first
        this.drawInitialHand(); // Draws hand AND triggers onCardsDrawn

        console.log("Player combat setup complete.");
    }

    startAttempt', { card: card });
            // --- End Trigger ---
            console.log(`Player: Playing card ${card.name} (Cost: ${currentCost}) targeting ${target?.name || 'self/none'}`);

            //Turn() {
        console.log("Player: Starting Turn...");
        this.currentBlock = 0;

        // Trigger onTurnStart BEFORE other turn actions
        this.triggerArtifacts('onTurnStart');

        this --- Execute Card Effect ---
            card.executeEffect(this, target, enemies); // Pass correct references

            // --- Trigger onCardPlay AFTER effect resolves ---
            this.triggerArtifacts('onCardPlay', { card: card });
            // --- End Trigger ---

            // --- Move Card After Play & Triggers ---
            if (card.exhausts).gainFocus(this.maxFocus); // Gain focus
        this.tickStatusEffects('start'); // Tick {
                // --- Trigger onCardExhaust BEFORE moving ---
                this.triggerArtifacts('onCardExhaust', { card: card });
                this.deckManager.exhaustCardFromHand(card); // Use DeckManager method
                 start-of-turn statuses
        this.drawCards(5); // Draw hand
    }

    endTurn() {
        console.log("Player: Ending Turn...");

        // Trigger onTurnEnd BEFORE ticking end statuses/discarding
        this.triggerArtifacts('onTurnEnd');

        this.tickStatusEffects('end'); // Tick end-// --- End Trigger ---
            } else {
                 this.deckManager.discardCardFromHand(card);of-turn statuses
        this.deckManager.discardHand(); // Discard hand (triggers discard artifacts)
    } // Use DeckManager method (triggers discard artifact)
            }
            return true; // Card played successfully
        } else {
            console.log(`Player: Not enough Focus to play ${card.name} (cost ${currentCost}, have ${

    playCard(card, target = null, enemies = []) {
        if (!card || !(card instanceof Card)) {
             console.error("Player.playCard: Invalid card object provided.");
             return false;
        }
        this.currentFocus})`);
            this.gameStateRef?.uiManager?.showActionFeedback("Not enough Focus!", "error"); // UI Feedback
            return false; // Not enough focus
        }
    }

    drawCards(num) {
        const drawn = this.deckManager.draw(num); // Use DeckManager method
        // --- Trigger onCardsDrawn// Check cost modifier status effects BEFORE checking focus
        const modifiedCost = this.applyModifiers('cardCost', card.cost);

        if (this.currentFocus >= modifiedCost) {
            this.spendFocus(modifiedCost); // Spend the modified cost
            console.log(`Player: Playing card ${card.name} (Cost: ${modifiedCost AFTER cards are in hand ---
        if (drawn.length > 0) {
            this.triggerArtifacts('onCardsDrawn', { cards: drawn, count: drawn.length });
        }
        //}) targeting ${target?.name || 'self/none'}`);

            // Execute Card Effect
            card.executeEffect(this, target, enemies);

            // Trigger onCardPlay AFTER effect resolves
            this.triggerArtifacts('onCardPlay', { card: card });

            // Move Card After Play & Triggers
            if (card. --- End Trigger ---
        // UI update handled elsewhere
    }

     drawInitialHand(num = 5) {
        const drawn = this.deckManager.draw(num); // Use DeckManager method
         if (drawn.length > 0) {
            this.triggerArtifacts('onCardsDrawn', { cards: drawn, count: drawn.length, initial: true }); // Add context flag
        }
        // UI update handled elsewhere
    }exhausts) {
                // Trigger onCardExhaust BEFORE it leaves the hand
                this.triggerArtifacts('on

    // --- Stat Interactions ---

    gainBlock(amount) {
        if (amount <= 0) return;
        const modifiedAmount = this.applyModifiers('blockGain', amount);
        if (modifiedAmount <= 0) {
            // console.log("Player: Block gain negated by modifiers.");
            return; //CardExhaust', { card: card });
                this.deckManager.exhaustCardFromHand(card);
            } else {
                 this.deckManager.discardCardFromHand(card); // Discard trigger happens in DeckManager
            }
            return true;
        } else {
            console.log(`Player: Not enough Focus for ${card.name} (cost ${card.cost} -> ${modifiedCost}, have ${this.currentFocus})`);
             this.gameStateRef Don't trigger if no actual block gained
        };
        this.currentBlock += modifiedAmount;
        // --- Trigger?.uiManager?.showActionFeedback("Not enough Focus!", "error"); // UI Feedback
            return false;
        }
    }

    drawCards(num) {
        if (!this.deckManager) return; // Safety check
        const drawn = this.deckManager.draw(num);
        if (drawn.length >  onGainBlock AFTER block is added ---
        this.triggerArtifacts('onGainBlock', { amount: modifiedAmount });
        // --- End Trigger ---
        // console.log(`Player: Gained ${modifiedAmount} Block. Total: ${this.currentBlock}`); // Noisy
        // UI update handled elsewhere
    }

    takeDamage(0) {
            this.triggerArtifacts('onCardsDrawn', { cards: drawn, count: drawn.length });
        }
    }

     drawInitialHand(num = 5) {
        if (!this.amount) {
        if (amount <= 0) return;
        const initialAmount = amount; // Store initial amount for trigger
        // --- Trigger for damage attempt (Optional, before modifiers/block) ---
        // this.triggerArtifacts('onDamageAttempted', { amount: initialAmount });
        // --- End Trigger ---

        const modifiedAmount = this.applyModifiers('damageTaken', amount);
        if (modifiedAmount <= 0) {
            deckManager) return; // Safety check
        const drawn = this.deckManager.draw(num);
         if (drawn.length > 0) {
            this.triggerArtifacts('onCardsDrawn', { cards: drawn, count: drawn.length, initial: true });
        }
    }

    // --- Stat Interactions ---

    gainBlock(amount) {
        if (amount <= 0) return;
        const modifiedAmount =console.log("Player: Damage negated by modifiers/effects.");
            // Trigger onDamageNegated? Optional.
            // this.triggerArtifacts('onDamageNegated', { initialAmount: initialAmount });
            return;
        }
        // console.log(`Player: Attempting to take ${modifiedAmount} damage...`); // Noisy

         this.applyModifiers('blockGain', amount);
        if (modifiedAmount <= 0) {
            console.log("Player: Block gain negated by modifiers.");
            return;
        };
        this.currentBlock += modifiedAmount;
        this.triggerArtifacts('onGainBlock', { amount: modifiedAmount });
        //const blockConsumed = Math.min(this.currentBlock, modifiedAmount);
        const damageAfterBlock = modifiedAmount - blockConsumed;
        const previousBlock = this.currentBlock; // Store block before change
        const previous console.log(`Player: Gained ${modifiedAmount} Block. Total: ${this.currentBlock}`);
    }

    takeDamage(amount) {
        if (amount <= 0) return;
        const modifiedAmount = this.applyModifiers('damageTaken', amount);
        if (modifiedAmount <= 0) {
Integrity = this.currentIntegrity; // Store HP before change

        if (blockConsumed > 0) {
            this.currentBlock -= blockConsumed;
            // --- Trigger onBlockBroken AFTER block changes ---
            this            console.log("Player: Damage negated by modifiers (e.g., Intangible).");
            return;
        }
        // console.log(`Player: Attempting to take ${modifiedAmount} damage...`);

        const.triggerArtifacts('onBlockBroken', { amountBlocked: blockConsumed, initialBlock: previousBlock });
            // --- End Trigger ---
            // console.log(`Player: Block absorbed ${blockConsumed}.`);
        }

        if (damageAfterBlock > 0) {
            this.currentIntegrity -= damageAfterBlock;
            // blockConsumed = Math.min(this.currentBlock, modifiedAmount);
        const damageAfterBlock = modifiedAmount --- Trigger onDamageTaken AFTER HP changes ---
            this.triggerArtifacts('onDamageTaken', { amount: damageAfterBlock, initialIntegrity: previousIntegrity });
            // --- End Trigger ---
            // console.log(`Player: Took ${damageAfterBlock} Integrity damage.`); // Noisy
        }

        // console.log(`Player: Integrity: ${this.currentIntegrity}/${this.maxIntegrity}, Block: ${this.currentBlock}`); // Noisy

         - blockConsumed;
        const previousBlock = this.currentBlock;
        const previousIntegrity = this.currentIntegrity;

        if (blockConsumed > 0) {
            this.currentBlock -= blockConsumed;
            this.triggerArtifacts('onBlockBroken', { amountBlocked: blockConsumed, initialBlock: previousBlock });
            // console.log(`Player: Block absorbed ${blockConsumed}.`);
        }

        if (damageAfterBlock > 0) {
            this.currentIntegrity -= damageAfterBlock;
            console.log(`Player: Took ${damageAfterBlock} Integrity damage.`);
            this.triggerArtifacts('onDamageTaken', { amountif (this.currentIntegrity <= 0 && previousIntegrity > 0) { // Check previous integrity
: damageAfterBlock, initialIntegrity: previousIntegrity });
        }

        // console.log(`Player: Integrity: ${this.currentIntegrity}/${this.maxIntegrity}, Block: ${this.currentBlock}`);

        if (this.currentIntegrity <= 0 && previousIntegrity > 0) {
            this.currentIntegr            this.currentIntegrity = 0;
            console.log("Player: Integrity depleted!");
            // --- Trigger onDeath ---
            this.triggerArtifacts('onDeath');
            // --- End Trigger ---
            // Game over logic handled by GameState/CombatManager
        }
        // UI update handled elsewhere
    }

    heal(amount) {
        if (amount <= 0) return;
        const actualHeal = Math.min(amount, this.maxIntegrity - this.currentIntegrity);
        if (actualHeal <= 0) return;
        this.currentIntegrity += actualHeal;
        // ---ity = 0;
            console.log("Player: Integrity depleted!");
            this.triggerArtifacts('onDeath');
            // Game over check handled by CombatManager
        }
    }

    heal(amount) {
        if Trigger onHeal AFTER HP changes ---
        this.triggerArtifacts('onHeal', { amount: actualHeal });
        // --- End Trigger ---
        // console.log(`Player: Healed ${actualHeal} Integrity.`); // Noisy
        // UI update handled elsewhere
    }

    spendFocus(amount) {
        if (amount <= 0) return;
        this.currentFocus = Math.max(0, this.currentFocus - (amount <= 0) return;
        const actualHeal = Math.min(amount, this.maxIntegrity - this.currentIntegrity);
        if (actualHeal <= 0) return; // Already full health
        this.currentIntegrity += actualHeal;
        this.triggerArtifacts('onHeal', { amount: actualHeal });
        // console.log(`Player: Healed ${actualHeal} Integrity. Total: ${this.currentIntegrity}/${this.maxIntegrity}`);
    }

    spendFocus(amount) {
        if (amount <= 0) return;
        this.currentFocus = Math.max(0, this.currentFocus - amount);
        // console.log(`Player: Spent ${amount} Focus. amount);
        // console.log(`Player: Spent ${amount} Focus. Remaining: ${this.currentFocus}`); // Noisy
        // --- NEW: Trigger onFocusSpent ---
         this.triggerArtifacts('onFocus Remaining: ${this.currentFocus}`);
    }

    gainFocus(amount) {
        if (amount <= 0) return;
        // Apply focus gain modifiers first? Optional.
        // const modifiedGain = this.applyModifiers('focusGain', amount);
        const modifiedGain = amount; // Keep it simple for now
        const actualGain = Math.min(modifiedGain, this.maxFocus - this.currentFocus);
        if (actualGain <= Spent', { amount: amount });
        // --- End NEW ---
        // UI update handled elsewhere
    }

    gainFocus(amount) {
        if (amount <= 0) return;
        const previousFocus = this.currentFocus;
        this.currentFocus = Math.min(this.maxFocus, this.currentFocus + amount);
        const actualGain = this.currentFocus - previousFocus;
        if (actualGain > 0) {
             // --- NEW: Trigger onFocusGained ---
             this.triggerArtifacts('onFocusGained', { amount: actualGain });
             // --- End NEW ---
        }
        // console.log(`Player: Gained ${actualGain} Focus. Total: ${this.currentFocus}`); // Noisy
        // UI update handled elsewhere
    }

    // --- Status Effects ---

    applyStatus(statusId, duration, amount = 0) return;
        this.currentFocus += actualGain;
         // console.log(`Player: Gained ${actualGain} Focus. Total: ${this.currentFocus}`);
    }

    // --- Status Effects1, source = null) {
        if (duration <= 0 && amount <= 0) return;
        // if (this.hasStatusImmunity(statusId)) return; // Placeholder

        // console.log(`Player apply: ${statusId}(${amount}) Dur:${duration}`); // Noisy
        const existingStatus = this.activeStatusEffects.find(s => s.id === statusId);
        let statusAppliedOrUpdated = false; (Refined) ---

    applyStatus(statusId, duration, amount = 1, source = null) {
        if (duration <= 0 && amount <= 0) return;

        // Check immunity placeholder
        // if (this.hasStatusImmunity(statusId)) { return; }

        // console.log(`Player apply status: ${statusId}, Dur: ${duration}, Amt: ${amount}`); // Noisy
        const existingStatus = this.activeStatusEffects.find(s => s.id === statusId);
        let statusAppliedOrUpdated = false;
        let previousAmount = 0;

        if (existingStatus) {
            previousAmount = existingStatus.amount || 0;
            // Stacking logic varies by status type
            if (['Strength',
        let previousAmount = 0;

        if (existingStatus) {
            previousAmount = existingStatus.amount || 0;
            // Specific stacking logic
            if (['Strength', 'Dexterity', 'Poison', ' 'Dexterity', 'Poison', 'Regen', 'Metallicize', 'Thorns', 'FocusNextTurn', 'TempMaxHP' /* etc */].includes(statusId)) {
                 existingStatus.amount = (existingStatus.amount || 0) + amount; // Stack amount
            }
             // Duration usually refreshes, doesn't stack (Regen', 'FocusNextTurn', 'TempMaxHP', /* etc */].includes(statusId)) {
                existingStatus.amount = (existingStatus.amount || 0) + amount; // Stack amount
            }
            // Duration Refresh Logic (generally take max, but maybe depends on status?)
            existingStatus.duration = Math.max(existingunless specified otherwise)
             existingStatus.duration = Math.max(existingStatus.duration, duration);
             // console.log(`Player: Refreshed ${statusId} -> Dur: ${existingStatus.duration}, Amt: ${existingStatus.duration, duration);
            // console.log(`Refreshed ${statusId} to Dur:${existingStatus.duration}, Amt:${existingStatus.amount}`); // Noisy
            statusAppliedOrUpdated = true;
        } else {
            let initialAmount = (['Strength', 'Dexterity', 'Poison', 'Regen', 'TempMaxHP'].includes(statusId)) ? amount : 1;
             if (initialAmount <= 0 && duration <=Status.amount}`);
             statusAppliedOrUpdated = true;
        } else {
            // Use amount directly for stacking effects, default to 1 otherwise? Or always use amount? Use amount.
             let initialAmount = amount;
             if (initialAmount <= 0 && duration <= 0) return; // Don't add 0/0 status

            this.activeStatusEffects.push({
                id: statusId, duration: duration 0) return; // Don't add ineffective status

            this.activeStatusEffects.push({ id: statusId,, source: source, amount: initialAmount
            });
             // console.log(`Player: Applied ${statusId}(${initialAmount}) for ${duration} turns.`);
             statusAppliedOrUpdated = true;
        }

        if duration: duration, source: source, amount: initialAmount });
            // console.log(`Applied ${statusId}(${initialAmount}) for ${duration} turns`); // Noisy
            statusAppliedOrUpdated = true;
        }

         (statusAppliedOrUpdated) {
            const currentStatus = this.activeStatusEffects.find(s => s.id === statusId);
            this.triggerArtifacts('onStatusAppliedToPlayer', {
                status: { ...if (statusAppliedOrUpdated) {
            const currentStatus = this.activeStatusEffects.find(s => s.id === statusId);
            // --- Trigger onStatusAppliedToPlayer AFTER status is added/updated ---
            this.triggerArtifacts('onStatusAppliedToPlayer', {
                status: { id: statusId,currentStatus }, // Pass copy
                amountApplied: amount,
                previousAmount: previousAmount
            });
            this.gameStateRef?.uiManager?.updatePlayerCombatInfo(this); // Request UI update
        }
    }

    removeStatus(statusId) {
        const initialLength = this.activeStatusEffects.length;
 duration: currentStatus?.duration, amount: currentStatus?.amount, source },
                amountApplied: amount,
                previousAmount: previousAmount
            });
            // --- End Trigger ---
            this.gameStateRef?.uiManager?.updatePlayerCombatInfo(this); // Request UI update
        }
    }

    removeStatus(statusId) {
        const        this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId);
        if (this.activeStatusEffects.length < initialLength) {
             this.triggerArtifacts('onStatusRemoved', { statusId: statusId });
             // console.log(`Player: Removed status ${statusId}`);
             this. initialLength = this.activeStatusEffects.length;
        this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId);
        if (this.activeStatusEffects.length < initialLength) {
             // --- Trigger onStatusRemoved AFTER status is removed ---
             this.triggerArtifacts('ongameStateRef?.uiManager?.updatePlayerCombatInfo(this);
        }
    }

    hasStatus(statusId) {
        return this.activeStatusEffects.some(s => s.id === statusId);
    }

    getStatusAmount(statusId) {
        const status = this.activeStatusEffects.findStatusRemoved', { statusId: statusId });
             // --- End Trigger ---
            // console.log(`Player: Removed status ${statusId}`); // Noisy
            this.gameStateRef?.uiManager?.updatePlayerCombatInfo(this); // Request UI update
        }
    }

    hasStatus(statusId) {
        return this.activeStatusEffects.some(s => s.id === statusId);
    }

    getStatusAmount(statusId(s => s.id === statusId);
        // Return amount if it exists and > 0, otherwise default to 1 if duration exists and > 0
        return status ? (status.amount || (status.duration > 0 ? 1 : 0)) : 0;
    }

    /** Process status effects at start) {
        const status = this.activeStatusEffects.find(s => s.id === statusId);
        return status ? (status.amount || (status.duration > 0 ? 1 : 0)) : 0;
    }

    /** Process status effects at start/end of turn */
    tickStatusEffects(phase/end of turn */
    tickStatusEffects(phase) {
        // console.log(`Player: Ticking ${phase}-of-turn effects...`); // Noisy
        const effectsToRemove = [];
        const statusesAtStartOfTick = [...this.activeStatusEffects];

        statusesAtStartOfTick.forEach(effect => {
            if (!) { // phase = 'start' or 'end'
        // console.log(`Player: Ticking ${phase}-of-turn status effects...`); // Noisy
        const effectsToRemove = [];
        const statusesAtStartOfTick = [...this.activeStatusEffects];

        statusesAtStartOfTick.forEach(effect => {
            if (!this.this.activeStatusEffects.includes(effect)) return; // Already removed

            let removeEffectAfterTick = false;
            switch (effect.id) {
                case 'Poison':
                    if (phase === 'start' && effect.amount > 0) {
                        this.takeDamage(effect.amount, 'Poison');
                        effect.amount--;
                        if (effect.amount <= 0) effectsToRemove.push(effect.id);
activeStatusEffects.includes(effect)) return;

            let removeEffectAfterTick = false;
            switch (effect.id) {
                case 'Poison':
                    if (phase === 'start' && effect.amount > 0) {
                        // console.log(`Player takes ${effect.amount} poison damage.`); // Noisy
                        this.takeDamage                    }
                    break;
                case 'Regen':
                    if (phase === 'end' && effect.amount > 0) this.heal(effect.amount);
                    break;
                case 'Burn':
                     if (phase === 'start' && effect.amount > 0) this.takeDamage(effect.amount,(effect.amount, 'Poison');
                        effect.amount--;
                        if (effect.amount <= 0) effectsToRemove.push(effect.id);
                    }
                    break;
                case 'Regen':
                    if (phase === 'end' && effect.amount > 0) {
                        // console.log(` 'Burn');
                     // Burn typically only uses duration, amount doesn't decrease
                     break;
                case 'Confusion':
                    if (phase === 'start') {
                         if (this.deckManager.hand.length > 0Player heals ${effect.amount} from Regen.`); // Noisy
                        this.heal(effect.amount);
                    }
                    break;
                 case 'Burn':
                      if (phase === 'start' && effect.amount > ) {
                             const idx = Math.floor(Math.random() * this.deckManager.hand.length);
0) {
                           // console.log(`Player takes ${effect.amount} burn damage.`); // Noisy
                           this.takeDamage(effect.amount, 'Burn');
                           // Burn does not decrease amount usually, only duration
                                                   const card = this.deckManager.hand[idx];
                              console.log(`Confusion discards: ${card?.name}`);
                             if(card) this.deckManager.discardCardFromHand(card);
                         }
                         removeEffectAfterTick = true; // Confusion usually lasts 1 turn
                    }
                    break;
                 case '}
                      break;
                case 'Confusion':
                    if (phase === 'start') {
                         console.log("Player is Confused!");
                         if (this.deckManager.hand.length > 0) {
                             const randomIndex = Math.floor(Math.random() * this.deckManager.hand.length);
                             constFocusNextTurn':
                     if (phase === 'start' && effect.amount > 0) {
                         this.gainFocus(effect.amount);
                         removeEffectAfterTick = true;
                     }
                     break;
                 // Add other status tick logic...
            }

            // Decrement Duration
            const isPassiveStack = ['Strength', cardToDiscard = this.deckManager.hand[randomIndex];
                              console.log(`Confusion forces discard of: ${cardToDiscard?.name}`);
                             if(cardToDiscard) this.deckManager.discardCardFromHand(cardToDiscard); // Triggers discard artifact
                         }
                         removeEffectAfterTick = true; // Typically 'Dexterity', 'ProtocolActive', 'TempMaxHP', 'Metallicize', 'Thorns' /* etc */ ].includes(effect.id);
            if (phase === 'end' && effect.duration !== 99 && !isPassiveStack) {
                effect.duration--;
                if (effect.duration <= 0 && ! 1 turn effect
                    }
                    break;
                 case 'FocusNextTurn':
                     if (phase === 'start' && effect.amount > 0) {
                         console.log(`Gaining ${effect.amount} focus from artifact.`);
                         this.gainFocus(effect.amount);
                         removeEffectAfterTick =effectsToRemove.includes(effect.id)) {
                    effectsToRemove.push(effect.id);
                }
            }
             if (removeEffectAfterTick && !effectsToRemove.includes(effect.id)) {
 true;
                     }
                     break;
                 case 'TempMaxHP': /* Handled passively or at end of combat                effectsToRemove.push(effect.id);
            }
        });

        if (effectsToRemove.length > 0) {
            // console.log(`   - Removing expired Player effects: ${effectsToRemove.join */ break;
                 case 'Entangle': /* Passive effect checked elsewhere */ break;
                 case 'Frail': /* Passive effect checked elsewhere */ break;
                 case 'Intangible': /* Passive effect checked elsewhere */ break;
                 case '(', ')}`);
            this.activeStatusEffects = this.activeStatusEffects.filter(
                effect => !effectsToRemove.includes(effect.id)
            );
        }
        // Don't call UIProtocolActive': /* Passive effect checked elsewhere */ break;
                 // Add cases for other statuses...
            }

            // --- Decrement Duration ---
            const isPassiveStack = ['Strength', 'Dexterity', 'Protocol update here - let CombatManager handle it after ticks
    }


    // --- Modifiers ---
     applyModifiers(modifierType, baseValue) {
         let modifiedValue = baseValue;

         // Apply player status effects
         if (modifierType === 'damageDealt') {
             if (this.hasStatus('Weak')) modifiedValueActive', 'TempMaxHP', 'Metallicize', 'Thorns'].includes(effect.id);
            if (phase === 'end' && effect.duration !== 99 && !isPassiveStack) {
                effect.duration--;
                if (effect.duration <= 0 && !effectsToRemove.includes(effect.id)) { = Math.floor(modifiedValue * 0.75);
             if (this.hasStatus('Strength')) modifiedValue += this.getStatusAmount('Strength');
         } else if (modifierType === 'damageTaken') {
             if (this.hasStatus('Vulnerable')) modifiedValue = Math.floor(modifiedValue * 
                    effectsToRemove.push(effect.id);
                }
            }
             if (removeEffectAfterTick && !effectsToRemove.includes(effect.id)) {
                effectsToRemove.push(effect.id);
            }
        });

        // Remove effects
        if (effectsToRemove.length > 0) {
            //1.5);
             if (this.hasStatus('Intangible')) modifiedValue = Math.max(1, modifiedValue > 0 ? 1 : 0);
         } else if (modifierType === 'blockGain') {
             if (this.hasStatus('Dexterity')) modifiedValue += this.getStatusAmount('Dexterity');
             if (this.hasStatus('Frail')) modifiedValue = Math.floor( console.log(`   - Removing expired Player effects: ${effectsToRemove.join(', ')}`); // Noisy
            this.activeStatusEffects = this.activeStatusEffects.filter(
                effect => !effectsToRemove.includes(effect.id)
            );
        }
        // UI update handled by calling function (e.g., end of turn update)
    }

    // --- Modifiers ---
     applyModifiers(modifierType, baseValue) {
modifiedValue * 0.75);
             if (this.hasStatus('ProtocolActive')) modifiedValue += this.getStatusAmount('ProtocolActive');
         } else if (modifierType === 'cardCost') {
              if (this.hasStatus('Entangle')) modifiedValue += this.getStatusAmount('Entangle');
              // Add cost reduction statuses? Example: if (this.hasStatus('FlowState')) modifiedValue = Math.max(         let modifiedValue = baseValue;
         // Apply player status effects that modify actions
         if (modifierType === 'damageDealt') {
             if (this.hasStatus('Weak')) modifiedValue = Math.floor(modifiedValue * 0.75);
             if (this.hasStatus('Strength')) modifiedValue += this.getStatusAmount('Strength');
         } else if (modifierType === 'damageTaken') {
             if (this.hasStatus('Vulnerable')) modifiedValue = Math.floor(modifiedValue * 1.5);0, modifiedValue - 1);
         }

         // Trigger artifacts that modify values? (Less common than triggered effects)
         // Example: modifiedValue = this.triggerArtifacts('modifyDamageDealt', { value: modifiedValue });
         // For now, rely on triggered effects (like gaining block on attack) rather than direct modification hooks.

         return Math.max(0, Math.floor(modifiedValue)); // Ensure non-negative integer
     }


    // --- Artifact
             if (this.hasStatus('Intangible')) modifiedValue = Math.max(1, modifiedValue > 0 ? 1 : 0);
         } else if (modifierType === 'blockGain') {
             if (this.hasStatus('Dexterity')) modifiedValue += this.getStatusAmount('Dexterity');
             if (this.hasStatus('Frail')) modifiedValue = Math.floor(modifiedValue * s ---
    addArtifact(artifactId) {
        if (this.artifacts.some(a => a.id === artifactId)) { return; }
        const newArtifact = new Artifact(artifactId);
        if (newArtifact.id !== 'error_artifact') {
             this.artifacts.push(newArtifact);
             console.log(`Player: Added artifact ${newArtifact.name}`);
             newArtifact.handleEvent('onPickup', this, this.gameStateRef);0.75);
             if (this.hasStatus('ProtocolActive')) modifiedValue += this.getStatusAmount('ProtocolActive');
         } else if (modifierType === 'cardCost') {
              if (this.hasStatus('Entangle')) modifiedValue += this.getStatusAmount('Entangle');
         }
         // Artifacts apply modifiers
             // TODO: Update Artifact UI display
        }
    }

    /** Calls handleEvent on all artifacts. */
    triggerArtifacts(triggerPhase, data = null) {
        if (!this.gameStateRef) { return; }
        // console.log(`Player: Triggering artifacts for phase: ${triggerPhase}`); // Noisy
 via triggered effects generally

         return Math.max(0, Math.floor(modifiedValue)); // Ensure non-negative integer
     }

    // --- Artifacts ---
    addArtifact(artifactId) {
        if (this.artifacts.some(a => a.id === artifactId)) { return; } // Silently ignore duplicates
        const newArtifact = new Artifact(artifactId);
        if (newArtifact.id !== 'error_artifact') {
             this.artifacts.push(newArtifact);
             console.log(`Player: Added artifact ${newArtifact.name}`);
                     [...this.artifacts].forEach(artifact => { // Iterate copy
            artifact.handleEvent(triggerPhase, this, this.gameStateRef, data);
        });
    }


    // --- Deck Manipulation ---
    addCardToDeck(cardId) {
        const cardAdded = this.deckManager.addCardToMasterDeck(cardId);
        if(cardAdded){
            this.triggerArtifacts('onCardAdded', { card: cardnewArtifact.handleEvent('onPickup', this, this.gameStateRef);
        }
    }

    /** Calls handleEvent on all artifacts. */
    triggerArtifacts(triggerPhase, data = null) {
        if (!this.gameStateRef) return; // Need game state context
        // console.log(`Player Trigger: ${triggerPhase}`, data); // VERY noisy, enable for debugging
        [...this.artifacts].forEach(artifact => { // IterateAdded });
            this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef);
        }
    }

    removeCardFromDeck(cardToRemove) {
        const removed = this.deckManager.removeCardFromMasterDeck(cardToRemove);
        if (removed) {
             this.triggerArtifacts('onCardRemove', { card: cardToRemove });
            this.gameStateRef?.metaProgression?.checkStateBased copy
            artifact.handleEvent(triggerPhase, this, this.gameStateRef, data);
        });
    }

    // --- Deck Manipulation ---
    addCardToDeck(cardId) {
        const cardAdded = this.deckManager.addCardToMasterDeck(cardId);
        if(cardAdded){
            this.triggerArtifacts('onCardAdded', { card: cardAdded });
            this.gameStateRef?.metaProgression?.Milestones(this.gameStateRef);
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
     getDefaultAttcheckStateBasedMilestones(this.gameStateRef);
        }
        return cardAdded; // Return the card instance or null
    }

    removeCardFromDeck(cardToRemove) {
        const removed = this.deckManager.removeCardFromMasterDeck(cardToRemove);
        if (removed) {
             this.triggerArtifacts('onCardRemove', { card: cardToRemove });
            this.gameStateRef?.metaProgression?.checkStateBasedunements() {
         return { Attraction: 5, Interaction: 5, Sensory: 5, Psychological: 5, Cognitive: 5, Relational: 5, RoleFocus: 5 };
      }

} // End Player Class
