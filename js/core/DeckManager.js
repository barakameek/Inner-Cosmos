// js/core/DeckManager.js

import { Card } from './Card.js';
import * as Data from '../data.js';

/**
 * Manages the player's deck, hand, discard, and exhaust piles.
 */
export class DeckManager {
    // --- NEW: Add reference to Player ---
    constructor(startingDeckIds = [], playerRef = null) {
        this.playerRef = playerRef; // Store reference to player for triggering artifacts
        // --- End NEW ---

        this.masterDeck = this.createCardArray(startingDeckIds);
        this.drawPile = [];
        this.hand = [];
        this.discardPile = [];
        this.exhaustPile = [];
        this.maxHandSize = 10;

        console.log(`DeckManager initialized with ${this.masterDeck.length} master cards.`);
        this.resetForCombat();
    }

     // --- NEW: Method to set player reference after initialization ---
     setPlayerReference(player) {
        this.playerRef = player;
    }

    // Keep createCardArray, resetForCombat, shuffle, draw...

    /** Moves a specific card from the hand to the discard pile. */
    discardCardFromHand(card) {
        const index = this.hand.findIndex(c => c.id === card.id);
        if (index > -1) {
            const [discardedCard] = this.hand.splice(index, 1);
            this.discardPile.push(discardedCard);
            // --- NEW: Trigger onCardDiscard ---
            this.playerRef?.triggerArtifacts('onCardDiscard', { card: discardedCard });
            // --- End NEW ---
            // console.log(`DeckManager: Discarded ${discardedCard.name}...`);
        } else { /* ... warn ... */ }
    }

    /** Moves all cards currently in the hand to the discard pile. */
    discardHand() {
        if (this.hand.length === 0) return;
        const cardsDiscarded = [...this.hand]; // Copy cards before clearing
        // console.log(`DeckManager: Discarding entire hand (${this.hand.length} cards).`);
        this.discardPile.push(...this.hand);
        this.hand = [];
        // --- NEW: Trigger for each card discarded ---
        cardsDiscarded.forEach(card => {
             this.playerRef?.triggerArtifacts('onCardDiscard', { card: card, endOfTurn: true }); // Add context flag
        });
         // --- End NEW ---
        // console.log(`DeckManager: Hand size: ${this.hand.length}. Discard pile: ${this.discardPile.length}.`);
    }

    /** Moves a specific card from the hand to the exhaust pile. */
    exhaustCardFromHand(card) {
        const index = this.hand.findIndex(c => c.id === card.id);
        if (index > -1) {
            const [exhaustedCard] = this.hand.splice(index, 1);
            this.exhaustPile.push(exhaustedCard);
            // --- NOTE: onCardExhaust trigger moved to Player.playCard BEFORE this call ---
            // console.log(`DeckManager: Exhausted ${exhaustedCard.name}...`);
        } else { /* ... warn ... */ }
    }

    /** Adds a card instance to the player's master deck. Returns card if successful */
     addCardToMasterDeck(cardOrId) {
         let newCard;
         if (cardOrId instanceof Card) { newCard = cardOrId; }
         else if (typeof cardOrId === 'number') { newCard = new Card(cardOrId); }
         else { /* ... error ... */ return null; }
         if (newCard.conceptId === -1) { /* ... error ... */ return null; }

         this.masterDeck.push(newCard);
         console.log(`DeckManager: Added '${newCard.name}' to master deck.`);
         // --- NOTE: onCardAdded trigger moved to Player.addCardToDeck AFTER this call ---
         return newCard; // Return the added card instance
     }

    /** Removes a specific card instance from the master deck. */
    removeCardFromMasterDeck(cardToRemove) { /* ... keep existing logic ... */
         if (!cardToRemove || !cardToRemove.id) return false;
         const index = this.masterDeck.findIndex(c => c.id === cardToRemove.id);
         if (index > -1) {
             const [removedCard] = this.masterDeck.splice(index, 1);
              // --- NOTE: onCardRemove trigger moved to Player.removeCardFromDeck AFTER this call ---
             console.log(`DeckManager: Removed '${removedCard.name}' (ID: ${removedCard.id}).`);
             return true;
         } else { /* ... warn ... */ return false; }
     }

    // Keep getMasterDeck, Getters for counts...

} // End DeckManager class
