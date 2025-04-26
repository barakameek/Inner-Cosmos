// js/core/Player.js

// ... (keep imports: DeckManager, Artifact, Card) ...
import { DeckManager } from './DeckManager.js';
import { Artifact } from './Artifact.js';
import { Card } from './Card.js';
import * as Data from '../data.js'; // Keep for defaults if needed


/**
 * Represents the player character during a run.
 */
export class Player {
    // ... (keep constructor as refined in File 28) ...
    constructor(playerData = {}, metaProgression = null) { /* ... keep ... */ }

    startCombat() {
        console.log("Player: Starting Combat...");
        this.currentBlock = 0;
        this.activeStatusEffects = [];
        this.deckManager.hand = [];
        this.deckManager.discardPile = [];
        this.deckManager.exhaustPile = [];
        // --- NEW: Trigger onCombatStart BEFORE drawing hand ---
        this.triggerArtifacts('onCombatStart');
        // --- End NEW ---
        this.drawInitialHand(); // Draws hand AND triggers onCardsDrawn
        this.gainFocus(this.maxFocus); // Gain starting focus AFTER drawing potentially? Or before? Before seems safer.
    }

    startTurn() {
        console.log("Player: Starting Turn...");
        this.currentBlock = 0;
        // --- NEW: Trigger onTurnStart BEFORE gaining focus/drawing ---
        this.triggerArtifacts('onTurnStart');
        // --- End NEW ---
        this.gainFocus(this.maxFocus); // Gain focus AFTER turn start triggers
        this.tickStatusEffects('start'); // Tick statuses AFTER turn start triggers
        this.drawCards(5); // Draw cards AFTER ticking start effects
    }

    endTurn() {
        console.log("Player: Ending Turn...");
        // --- NEW: Trigger onTurnEnd BEFORE ticking statuses/discarding ---
        this.triggerArtifacts('onTurnEnd');
        // --- End NEW ---
        this.tickStatusEffects('end'); // Tick statuses AFTER end turn triggers
        this.deckManager.discardHand(); // Discard hand last
    }

    playCard(card, target = null, enemies = []) {
        if (!card || !(card instanceof Card)) { /* ... error ... */ return false; }
        if (this.currentFocus >= card.cost) {
            this.spendFocus(card.cost);
            // --- NEW: Trigger onCardPlayAttempt? (Optional, maybe too granular) ---
            // this.triggerArtifacts('onCardPlayAttempt', { card: card });
            // --- End NEW ---
            console.log(`Player: Playing card ${card.name}...`);
            card.executeEffect(this, target, enemies); // Execute effect

            // --- Trigger onCardPlay AFTER effect resolves ---
            this.triggerArtifacts('onCardPlay', { card: card });
            // --- End NEW ---

            // Move Card After Play & Triggers
            if (card.exhausts) {
                // --- NEW: Trigger onCardExhaust ---
                // We need to trigger BEFORE it leaves the hand/is moved in DeckManager
                this.triggerArtifacts('onCardExhaust', { card: card });
                this.deckManager.exhaustCardFromHand(card);
                // --- End NEW ---
            } else {
                 this.deckManager.discardCardFromHand(card);
            }
            return true;
        } else { /* ... handle insufficient focus ... */ return false; }
    }

    drawCards(num) {
        const drawn = this.deckManager.draw(num);
        // --- NEW: Trigger onCardsDrawn AFTER cards are in hand ---
        if (drawn.length > 0) {
            this.triggerArtifacts('onCardsDrawn', { cards: drawn, count: drawn.length });
        }
        // --- End NEW ---
    }

     drawInitialHand(num = 5) { // Renamed for clarity
        const drawn = this.deckManager.draw(num);
         if (drawn.length > 0) {
            this.triggerArtifacts('onCardsDrawn', { cards: drawn, count: drawn.length, initial: true }); // Add context
        }
    }

    gainBlock(amount) {
        if (amount <= 0) return;
        const modifiedAmount = this.applyModifiers('blockGain', amount);
        if (modifiedAmount <= 0) { /* ... log ... */ return; };
        this.currentBlock += modifiedAmount;
        // --- NEW: Trigger onGainBlock AFTER block is added ---
        this.triggerArtifacts('onGainBlock', { amount: modifiedAmount });
        // --- End NEW ---
        // console.log(`Player: Gained ${modifiedAmount} Block. Total: ${this.currentBlock}`);
    }

    takeDamage(amount) {
        if (amount <= 0) return;
        // --- NEW: Trigger for damage attempt? (Optional) ---
        // this.triggerArtifacts('onDamageAttempted', { amount: amount });
        // --- End NEW ---
        const modifiedAmount = this.applyModifiers('damageTaken', amount);
        if (modifiedAmount <= 0) { /* ... log ... */ return; }
        // console.log(`Player: Attempting to take ${modifiedAmount} damage...`);

        const blockConsumed = Math.min(this.currentBlock, modifiedAmount);
        const damageAfterBlock = modifiedAmount - blockConsumed;

        if (blockConsumed > 0) {
            const previousBlock = this.currentBlock;
            this.currentBlock -= blockConsumed;
            // --- NEW: Trigger onBlockBroken AFTER block changes ---
            this.triggerArtifacts('onBlockBroken', { amountBlocked: blockConsumed, initialBlock: previousBlock });
            // --- End NEW ---
            // console.log(`Player: Block absorbed ${blockConsumed}.`);
        }

        if (damageAfterBlock > 0) {
            const previousIntegrity = this.currentIntegrity;
            this.currentIntegrity -= damageAfterBlock;
            // --- NEW: Trigger onDamageTaken AFTER HP changes ---
            this.triggerArtifacts('onDamageTaken', { amount: damageAfterBlock, initialIntegrity: previousIntegrity });
            // --- End NEW ---
            // console.log(`Player: Took ${damageAfterBlock} Integrity damage.`);
        }

        // console.log(`Player: Integrity: ${this.currentIntegrity}/${this.maxIntegrity}, Block: ${this.currentBlock}`);

        if (this.currentIntegrity <= 0 && previousIntegrity > 0) { // Check previous integrity to only trigger once
            this.currentIntegrity = 0;
            console.log("Player: Integrity depleted!");
            // --- NEW: Trigger onDeath ---
            this.triggerArtifacts('onDeath');
            // --- End NEW ---
            // Game over logic handled by GameState/CombatManager checking HP
        }
    }

    heal(amount) {
        if (amount <= 0) return;
        const actualHeal = Math.min(amount, this.maxIntegrity - this.currentIntegrity);
        if (actualHeal <= 0) return;
        this.currentIntegrity += actualHeal;
        // --- NEW: Trigger onHeal AFTER HP changes ---
        this.triggerArtifacts('onHeal', { amount: actualHeal });
        // --- End NEW ---
        // console.log(`Player: Healed ${actualHeal} Integrity.`);
    }

    // Keep spendFocus, gainFocus...

    applyStatus(statusId, duration, amount = 1, source = null) {
        // ... (keep status application logic from File 28) ...
        if (duration <= 0 && amount <= 0) return;
        // if (this.hasStatusImmunity(statusId)) return; // Immunity check placeholder
        const existingStatus = this.activeStatusEffects.find(s => s.id === statusId);
        let statusAppliedOrUpdated = false;
        let previousAmount = 0; // Track previous amount for trigger data

        if (existingStatus) {
            previousAmount = existingStatus.amount || 0;
            existingStatus.amount = (existingStatus.amount || 0) + amount;
            existingStatus.duration = Math.max(existingStatus.duration, duration);
            statusAppliedOrUpdated = true;
        } else {
            let initialAmount = (['Strength', 'Dexterity', 'Poison', 'Regen', 'ProtocolActive'].includes(statusId)) ? amount : 1;
            if (initialAmount <= 0 && duration <= 0) return;
            this.activeStatusEffects.push({ id: statusId, duration: duration, source: source, amount: initialAmount });
            statusAppliedOrUpdated = true;
        }

        if (statusAppliedOrUpdated) {
            const currentStatus = this.activeStatusEffects.find(s => s.id === statusId); // Get final state
            // --- NEW: Trigger onStatusAppliedToPlayer AFTER status is added/updated ---
            this.triggerArtifacts('onStatusAppliedToPlayer', {
                status: { id: statusId, duration: currentStatus.duration, amount: currentStatus.amount, source },
                amountApplied: amount, // Pass the amount *attempted* to apply
                previousAmount: previousAmount // Pass previous stack amount
            });
            // --- End NEW ---
            this.gameStateRef?.uiManager?.updatePlayerCombatInfo(this);
        }
    }

    removeStatus(statusId) {
        const initialLength = this.activeStatusEffects.length;
        this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId);
        if (this.activeStatusEffects.length < initialLength) {
             // --- NEW: Trigger onStatusRemoved AFTER status is removed ---
             this.triggerArtifacts('onStatusRemoved', { statusId: statusId });
             // --- End NEW ---
            // console.log(`Player: Removed status ${statusId}`);
            this.gameStateRef?.uiManager?.updatePlayerCombatInfo(this);
        }
    }

    // Keep hasStatus, getStatusAmount, tickStatusEffects, applyModifiers...
    // Keep addArtifact, triggerArtifacts (implementation is key)...
    // Keep addCardToDeck, removeCardFromDeck (add triggers here)...

     addCardToDeck(cardId) {
        const cardAdded = this.deckManager.addCardToMasterDeck(cardId); // addCardToMasterDeck returns the card obj now? Assume yes.
        if(cardAdded){
            // --- NEW: Trigger onCardAdded ---
            this.triggerArtifacts('onCardAdded', { card: cardAdded });
            // --- End NEW ---
            this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef);
        }
    }

    removeCardFromDeck(cardToRemove) {
        const removed = this.deckManager.removeCardFromMasterDeck(cardToRemove);
        if (removed) {
            // --- NEW: Trigger onCardRemove ---
             this.triggerArtifacts('onCardRemove', { card: cardToRemove }); // Pass the removed card data
             // --- End NEW ---
            this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef);
            return true;
        }
        return false;
    }

    // Keep Utility methods...

} // End Player Class
