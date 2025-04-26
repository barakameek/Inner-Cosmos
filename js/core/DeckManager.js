// js/core/DeckManager.js

// Import the Card class (assuming it's in the same directory)
import { Card } from './Card.js';
// Import concept data if needed for card creation confirmation
import * as Data from '../data.js';

/**
 * Manages the player's deck, hand, discard, and exhaust piles.
 */
export class DeckManager {
    constructor(startingDeckIds = []) {
        this.masterDeck = this.createCardArray(startingDeckIds); // Holds all cards the player owns this run

        this.drawPile = [];
        this.hand = [];
        this.discardPile = [];
        this.exhaustPile = []; // Cards removed for the rest of combat

        this.maxHandSize = 10; // Configurable maximum hand size

        console.log(`DeckManager initialized with ${this.masterDeck.length} master cards.`);
        // Initialize draw pile for the first combat
        this.resetForCombat();
    }

    /**
     * Converts an array of concept IDs into an array of Card objects.
     */
    createCardArray(conceptIds) {
        return conceptIds.map(id => new Card(id)).filter(card => card.conceptId !== -1); // Filter out error cards
    }

    /**
     * Prepares the deck for the start of a new combat.
     * Creates the draw pile from the master deck and shuffles it.
     * Clears hand, discard, and exhaust piles.
     */
    resetForCombat() {
        console.log("DeckManager: Resetting piles for combat.");
        this.drawPile = [...this.masterDeck]; // Create fresh copies for the combat draw pile
        this.shuffle(this.drawPile);
        this.hand = [];
        this.discardPile = [];
        this.exhaustPile = [];
    }

    /**
     * Shuffles an array in place using Fisher-Yates algorithm.
     */
    shuffle(array) {
        console.log(`DeckManager: Shuffling pile of ${array.length} cards.`);
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array; // Return shuffled array (optional)
    }

    /**
     * Draws a specified number of cards into the hand.
     * Handles reshuffling the discard pile if the draw pile is empty.
     * Respects maximum hand size.
     * @param {number} numToDraw - The number of cards to attempt to draw.
     * @returns {Card[]} An array of the cards actually drawn and added to the hand.
     */
    draw(numToDraw) {
        const drawnCards = [];
        console.log(`DeckManager: Attempting to draw ${numToDraw} cards...`);

        for (let i = 0; i < numToDraw; i++) {
            if (this.hand.length >= this.maxHandSize) {
                console.log("DeckManager: Hand is full.");
                // Optional: Trigger "hand full" event or notification
                break; // Stop drawing if hand is full
            }

            if (this.drawPile.length === 0) {
                if (this.discardPile.length === 0) {
                    console.log("DeckManager: No cards left in draw or discard.");
                    break; // No more cards available anywhere
                }
                // Reshuffle discard into draw pile
                console.log(`DeckManager: Reshuffling ${this.discardPile.length} cards from discard.`);
                this.drawPile = this.shuffle([...this.discardPile]);
                this.discardPile = [];
            }

            // Draw one card from the draw pile
            const drawnCard = this.drawPile.pop();
            if (drawnCard) {
                this.hand.push(drawnCard);
                drawnCards.push(drawnCard);
            }
        }

        console.log(`DeckManager: Drew ${drawnCards.length} cards. Hand size: ${this.hand.length}. Draw pile: ${this.drawPile.length}. Discard pile: ${this.discardPile.length}.`);
        // TODO: Trigger UI update for hand, draw pile count, discard pile count
        return drawnCards;
    }

    /**
     * Moves a specific card from the hand to the discard pile.
     * @param {Card} card - The specific card instance to discard.
     */
    discardCardFromHand(card) {
        const index = this.hand.findIndex(c => c.id === card.id); // Use the unique instance ID
        if (index > -1) {
            const [discardedCard] = this.hand.splice(index, 1);
            this.discardPile.push(discardedCard);
            console.log(`DeckManager: Discarded ${discardedCard.name} from hand. Hand size: ${this.hand.length}. Discard pile: ${this.discardPile.length}.`);
            // TODO: Trigger UI update
        } else {
            console.warn(`DeckManager: Card ${card?.name || 'undefined'} not found in hand to discard.`);
        }
    }

    /**
     * Moves all cards currently in the hand to the discard pile.
     */
    discardHand() {
        if (this.hand.length === 0) return;
        console.log(`DeckManager: Discarding entire hand (${this.hand.length} cards).`);
        this.discardPile.push(...this.hand);
        this.hand = [];
        // TODO: Trigger UI update
        console.log(`DeckManager: Hand size: ${this.hand.length}. Discard pile: ${this.discardPile.length}.`);
    }

    /**
     * Moves a specific card from the hand to the exhaust pile.
     * @param {Card} card - The specific card instance to exhaust.
     */
    exhaustCardFromHand(card) {
        const index = this.hand.findIndex(c => c.id === card.id);
        if (index > -1) {
            const [exhaustedCard] = this.hand.splice(index, 1);
            this.exhaustPile.push(exhaustedCard);
            console.log(`DeckManager: Exhausted ${exhaustedCard.name} from hand. Hand size: ${this.hand.length}. Exhaust pile: ${this.exhaustPile.length}.`);
            // TODO: Trigger UI update
        } else {
            console.warn(`DeckManager: Card ${card?.name || 'undefined'} not found in hand to exhaust.`);
        }
    }

     /**
     * Adds a card instance to the player's master deck (used outside combat).
     * @param {Card | number} cardOrId - Either a Card object or a concept ID to create a new card from.
     */
     addCardToMasterDeck(cardOrId) {
         let newCard;
         if (cardOrId instanceof Card) {
             newCard = cardOrId; // Assume it's already a valid Card instance
         } else if (typeof cardOrId === 'number') {
             newCard = new Card(cardOrId); // Create a new card from ID
             if (newCard.conceptId === -1) {
                 console.error(`DeckManager: Failed to add card - invalid concept ID ${cardOrId}`);
                 return; // Don't add error cards
             }
         } else {
             console.error("DeckManager: Invalid argument passed to addCardToMasterDeck. Must be Card instance or concept ID.");
             return;
         }

         this.masterDeck.push(newCard);
         console.log(`DeckManager: Added '${newCard.name}' to master deck. Total master cards: ${this.masterDeck.length}.`);
         // Note: This doesn't immediately affect the current combat draw/discard unless resetForCombat is called.
     }

    /**
     * Removes a specific card instance from the master deck (used outside combat).
     * Important: This searches the master list, not the current combat piles.
     * @param {Card} cardToRemove - The specific card instance to remove. Needs a unique ID.
     * @returns {boolean} True if the card was found and removed, false otherwise.
     */
    removeCardFromMasterDeck(cardToRemove) {
        if (!cardToRemove || !cardToRemove.id) {
            console.error("DeckManager: Invalid card instance provided for removal.");
            return false;
        }
        const index = this.masterDeck.findIndex(c => c.id === cardToRemove.id);
        if (index > -1) {
            const [removedCard] = this.masterDeck.splice(index, 1);
            console.log(`DeckManager: Removed '${removedCard.name}' (ID: ${removedCard.id}) from master deck. Total master cards: ${this.masterDeck.length}.`);
            return true;
        } else {
            console.warn(`DeckManager: Card '${cardToRemove.name}' (ID: ${cardToRemove.id}) not found in master deck for removal.`);
            return false;
        }
    }

     /**
      * Retrieves a full list of cards in the master deck.
      * Useful for deck viewing screens.
      * @returns {Card[]} A copy of the master deck array.
      */
     getMasterDeck() {
         return [...this.masterDeck]; // Return a copy to prevent direct modification
     }

    // --- Getters for pile counts (useful for UI) ---
    getDrawPileCount() {
        return this.drawPile.length;
    }

    getDiscardPileCount() {
        return this.discardPile.length;
    }

    getHandCount() {
        return this.hand.length;
    }

     getExhaustPileCount() {
         return this.exhaustPile.length;
     }

} // End of DeckManager class
