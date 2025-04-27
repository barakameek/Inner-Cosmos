// js/core/DeckManager.js

// Import the Card class
import { Card } from './Card.js';
// NOTE: No direct need for Data.js here typically.

/**
 * Manages the player's deck, hand, discard, and exhaust piles.
 */
export class DeckManager {
    constructor(startingDeckIds = [], playerRef = null) {
        this.playerRef = playerRef; // Store reference to player for triggering artifacts

        // Ensure startingDeckIds is an array before processing
        if (!Array.isArray(startingDeckIds)) {
            console.error("DeckManager Error: startingDeckIds must be an array. Using empty deck.");
            startingDeckIds = [];
        }
        this.masterDeck = this.createCardArray(startingDeckIds); // Holds all cards the player owns this run

        this.drawPile = [];
        this.hand = [];
        this.discardPile = [];
        this.exhaustPile = []; // Cards removed for the rest of combat

        this.maxHandSize = 10; // Configurable maximum hand size (Consider moving to Player or Config if needed globally)

        console.log(`DeckManager initialized with ${this.masterDeck.length} master cards.`);
        // Initialize draw pile for the first combat
        this.resetForCombat();
    }

    /** Allows setting the player reference after DeckManager is instantiated. */
    setPlayerReference(player) {
        if (!player) {
            console.warn("DeckManager: Attempted to set an invalid player reference.");
            return;
        }
        this.playerRef = player;
    }

    /**
     * Converts an array of concept IDs into an array of Card objects.
     * Ensures card data exists and filters out any potential errors.
     * @param {number[]} conceptIds - Array of concept IDs.
     * @returns {Card[]} Array of valid Card objects.
     */
    createCardArray(conceptIds) {
        return conceptIds
            .map(id => {
                try {
                    return new Card(id); // Create Card instances
                } catch (error) {
                    console.error(`DeckManager Error: Failed to create card with ID ${id}:`, error);
                    return null; // Return null on error during card creation
                }
            })
            .filter(card => card && card.conceptId !== -1); // Filter out null/error cards
    }

    /**
     * Prepares the deck for the start of a new combat.
     * Creates the draw pile from the master deck and shuffles it.
     * Clears hand, discard, and exhaust piles.
     */
    resetForCombat() {
        console.log("DeckManager: Resetting piles for combat.");
        // Create fresh copies for the draw pile by mapping over the masterDeck
        // This ensures that if Cards ever have state, we get new instances.
        this.drawPile = this.masterDeck.map(card => new Card(card.conceptId)); // Recreate cards from conceptId
        this.shuffle(this.drawPile);

        this.hand = [];
        this.discardPile = [];
        this.exhaustPile = [];

        // Initial UI update might be needed here or handled by caller (GameState/CombatManager)
        this.playerRef?.gameStateRef?.uiManager?.updateDeckDiscardCounts(this);
    }

    /**
     * Shuffles an array in place using Fisher-Yates algorithm.
     * @param {Array<Card>} array - The array of Card objects to shuffle.
     */
    shuffle(array) {
        // console.log(`DeckManager: Shuffling pile of ${array.length} cards.`); // Can be noisy
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
        // console.log(`DeckManager: Attempting to draw ${numToDraw} cards...`); // Noisy

        for (let i = 0; i < numToDraw; i++) {
            if (this.hand.length >= this.maxHandSize) {
                console.log("DeckManager: Hand is full.");
                this.playerRef?.triggerArtifacts('onHandFull'); // Trigger artifact
                break; // Stop drawing
            }

            if (this.drawPile.length === 0) {
                if (this.discardPile.length === 0) {
                    // console.log("DeckManager: No cards left in draw or discard."); // Noisy
                    break; // No more cards available
                }
                // Reshuffle discard into draw pile
                console.log(`DeckManager: Reshuffling ${this.discardPile.length} cards from discard.`);
                this.playerRef?.triggerArtifacts('onReshuffle', { count: this.discardPile.length }); // Trigger artifact BEFORE shuffle
                this.drawPile = this.shuffle([...this.discardPile]);
                this.discardPile = [];
                // Update UI after reshuffle
                this.playerRef?.gameStateRef?.uiManager?.updateDeckDiscardCounts(this);
            }

            // Draw one card instance from the draw pile
            const drawnCard = this.drawPile.pop();
            if (drawnCard) {
                this.hand.push(drawnCard);
                drawnCards.push(drawnCard);
                // Trigger artifact for individual card draw
                this.playerRef?.triggerArtifacts('onCardDrawnSingle', { card: drawnCard });
            } else {
                // This case should ideally not happen if reshuffle logic is correct
                console.warn("DeckManager: drawPile.pop() returned undefined despite checks.");
            }
        }

        // console.log(`DeckManager: Drew ${drawnCards.length} cards. Hand: ${this.hand.length}, Draw: ${this.drawPile.length}, Discard: ${this.discardPile.length}.`); // Noisy
        // Player class triggers 'onCardsDrawn' (plural) AFTER calling this draw method.
        // UI updates for hand/counts handled by caller (e.g., Player/CombatManager)

        return drawnCards; // Return the cards added to hand this call
    }

    /**
     * Moves a specific card instance from the hand to the discard pile.
     * Uses the unique card instance ID for accuracy.
     * @param {Card} card - The specific card instance to discard.
     */
    discardCardFromHand(card) {
        if (!card || !card.id) {
             console.warn("DeckManager: Attempted to discard invalid card object.", card);
             return;
        }
        const index = this.hand.findIndex(c => c.id === card.id); // Use the unique instance ID
        if (index > -1) {
            const [discardedCard] = this.hand.splice(index, 1);
            this.discardPile.push(discardedCard);
            // Trigger artifact AFTER card is in discard pile
            this.playerRef?.triggerArtifacts('onCardDiscard', { card: discardedCard });
            // console.log(`DeckManager: Discarded ${discardedCard.name} from hand.`); // Noisy
            // UI updates handled by caller (e.g., Player.playCard -> CombatManager -> UIManager)
        } else {
            // Log current hand IDs for easier debugging if card not found
            const currentHandIds = this.hand.map(c => `${c.name}(${c.id})`).join(', ');
            console.warn(`DeckManager: Card ${card.name} (ID: ${card.id}) not found in hand to discard. Current hand: [${currentHandIds}]`);
        }
    }

    /**
     * Moves all cards currently in the hand to the discard pile.
     * Typically called at the end of the player's turn.
     */
    discardHand() {
        if (this.hand.length === 0) return;

        const cardsBeingDiscarded = [...this.hand]; // Copy for trigger data before modifying
        // console.log(`DeckManager: Discarding entire hand (${this.hand.length} cards).`); // Noisy

        this.discardPile.push(...this.hand); // Move all cards to discard
        this.hand = []; // Clear hand

        // Trigger artifact for each card AFTER they are moved
        cardsBeingDiscarded.forEach(card => {
             this.playerRef?.triggerArtifacts('onCardDiscard', { card: card, endOfTurn: true });
        });
        // UI updates handled by caller (Player.endTurn -> CombatManager -> UIManager)
    }

    /**
     * Moves a specific card instance from the hand to the exhaust pile.
     * Uses the unique card instance ID for accuracy.
     * NOTE: onCardExhaust trigger is handled in Player.playCard BEFORE this call.
     * @param {Card} card - The specific card instance to exhaust.
     */
    exhaustCardFromHand(card) {
        if (!card || !card.id) {
            console.warn("DeckManager: Attempted to exhaust invalid card object.", card);
            return;
        }
        const index = this.hand.findIndex(c => c.id === card.id);
        if (index > -1) {
            const [exhaustedCard] = this.hand.splice(index, 1);
            this.exhaustPile.push(exhaustedCard);
            // console.log(`DeckManager: Exhausted ${exhaustedCard.name}. Exhaust pile: ${this.exhaustPile.length}.`); // Noisy
            // UI updates handled by caller (e.g., Player.playCard -> CombatManager -> UIManager)
            this.playerRef?.gameStateRef?.uiManager?.updateDeckDiscardCounts(this); // Update exhaust count display
        } else {
            const currentHandIds = this.hand.map(c => `${c.name}(${c.id})`).join(', ');
            console.warn(`DeckManager: Card ${card.name} (ID: ${card.id}) not found in hand to exhaust. Current hand: [${currentHandIds}]`);
        }
    }

     /**
      * Adds a card instance to the player's master deck (used outside combat).
      * Creates a new Card instance if an ID is provided.
      * @param {Card | number} cardOrId - Either a Card object or a concept ID.
      * @returns {Card | null} The added Card instance or null on failure.
      */
     addCardToMasterDeck(cardOrId) {
         let newCard;
         try {
             if (cardOrId instanceof Card) {
                 newCard = cardOrId; // Assume it's a valid instance already
                 // Optionally, recreate from conceptId to ensure clean state?
                 // newCard = new Card(cardOrId.conceptId);
             } else if (typeof cardOrId === 'number') {
                 newCard = new Card(cardOrId);
                 if (newCard.conceptId === -1) { // Check for error card from constructor
                     console.error(`DeckManager: Failed to create valid card from concept ID ${cardOrId}`);
                     return null;
                 }
             } else {
                 console.error("DeckManager: Invalid argument to addCardToMasterDeck. Must be Card instance or concept ID.");
                 return null;
             }
         } catch (error) {
             console.error(`DeckManager Error: Failed during card creation/addition for ${cardOrId}:`, error);
             return null;
         }


         this.masterDeck.push(newCard);
         console.log(`DeckManager: Added '${newCard.name}' (ID: ${newCard.id}) to master deck. Total: ${this.masterDeck.length}.`);
         // Note: Does not add to draw/discard pile immediately during combat.
         // 'onCardAdded' trigger is handled by the Player class AFTER calling this.
         return newCard; // Return instance
     }

    /**
     * Removes a specific card instance from the master deck (used outside combat).
     * @param {Card} cardToRemove - The specific card instance to remove (must have unique ID).
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
            console.log(`DeckManager: Removed '${removedCard.name}' (ID: ${removedCard.id}) from master deck. Total: ${this.masterDeck.length}.`);
             // 'onCardRemove' trigger handled by Player class AFTER calling this.
            return true;
        } else {
            // It might be useful to log the current master deck IDs here for debugging
            const currentMasterIds = this.masterDeck.map(c => `${c.name}(${c.id})`).join(', ');
            console.warn(`DeckManager: Card '${cardToRemove.name}' (ID: ${cardToRemove.id}) not found in master deck for removal. Current master deck: [${currentMasterIds}]`);
            return false;
        }
    }

     /**
      * Retrieves a full list of cards in the master deck.
      * @returns {Card[]} A copy of the master deck array.
      */
     getMasterDeck() {
         // Return a shallow copy to prevent external modification of the original array
         return [...this.masterDeck];
     }

    // --- Getters for pile counts ---
    getDrawPileCount() { return this.drawPile.length; }
    getDiscardPileCount() { return this.discardPile.length; }
    getHandCount() { return this.hand.length; }
    getExhaustPileCount() { return this.exhaustPile.length; } // Added getter

} // End of DeckManager class
