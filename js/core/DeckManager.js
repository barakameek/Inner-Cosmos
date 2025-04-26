// js/core/DeckManager.js

// Import the Card class (assuming it's in the same directory)
import { Card } from './Card.js';
// Import concept data if needed for card creation confirmation (usually not needed here)
// import * as Data from '../data.js';

/**
 * Manages the player's deck, hand, discard, and exhaust piles.
 */
export class DeckManager {
    // --- NEW: Add reference to Player ---
    constructor(startingDeckIds = [], playerRef = null) {
        this.playerRef = playerRef; // Store reference to player for triggering artifacts
        // --- End NEW ---

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

    // --- NEW: Method to set player reference after initialization ---
    // This allows GameState to link the Player instance after both are created.
    setPlayerReference(player) {
        this.playerRef = player;
    }
    // --- End NEW ---

    /**
     * Converts an array of concept IDs into an array of Card objects.
     * Ensures card data exists and filters out any potential errors.
     */
    createCardArray(conceptIds) {
        if (!Array.isArray(conceptIds)) {
             console.error("DeckManager Error: startingDeckIds must be an array.");
             return [];
        }
        return conceptIds
            .map(id => new Card(id)) // Create Card instances
            .filter(card => card && card.conceptId !== -1); // Filter out null/error cards
    }

    /**
     * Prepares the deck for the start of a new combat.
     * Creates the draw pile from the master deck and shuffles it.
     * Clears hand, discard, and exhaust piles.
     */
    resetForCombat() {
        console.log("DeckManager: Resetting piles for combat.");
        // Create fresh copies for the draw pile using map to ensure new instances if Card constructor did complex setup
        // Although currently Card is mostly data-driven, copying instances might be safer if state is added later.
        // For now, spreading masterDeck (containing Card instances) is sufficient.
        this.drawPile = [...this.masterDeck];
        this.shuffle(this.drawPile);
        this.hand = [];
        this.discardPile = [];
        this.exhaustPile = [];
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
                // TODO: Optional: Trigger "hand full" event or notification via playerRef/UIManager
                this.playerRef?.triggerArtifacts('onHandFull');
                break; // Stop drawing
            }

            if (this.drawPile.length === 0) {
                if (this.discardPile.length === 0) {
                    // console.log("DeckManager: No cards left in draw or discard."); // Noisy
                    break; // No more cards available
                }
                // Reshuffle discard into draw pile
                console.log(`DeckManager: Reshuffling ${this.discardPile.length} cards from discard.`);
                 // --- NEW: Trigger for reshuffle ---
                 this.playerRef?.triggerArtifacts('onReshuffle', { count: this.discardPile.length });
                 // --- End NEW ---
                this.drawPile = this.shuffle([...this.discardPile]);
                this.discardPile = [];
                // TODO: UIManager Update discard count UI
                 this.playerRef?.gameStateRef?.uiManager?.updateDeckDiscardCounts(this);
            }

            // Draw one card instance from the draw pile
            const drawnCard = this.drawPile.pop();
            if (drawnCard) {
                this.hand.push(drawnCard);
                drawnCards.push(drawnCard);
                // --- NEW: Trigger for individual card draw ---
                 this.playerRef?.triggerArtifacts('onCardDrawnSingle', { card: drawnCard });
                 // --- End NEW ---
            }
        }

        // console.log(`DeckManager: Drew ${drawnCards.length} cards. Hand: ${this.hand.length}, Draw: ${this.drawPile.length}, Discard: ${this.discardPile.length}.`); // Noisy
        // Player class triggers 'onCardsDrawn' AFTER calling this draw method.
        // TODO: UIManager update hand, draw count, discard count UI (triggered by Player/CombatManager)
        return drawnCards; // Return the cards added to hand this call
    }

    /**
     * Moves a specific card instance from the hand to the discard pile.
     * @param {Card} card - The specific card instance to discard.
     */
    discardCardFromHand(card) {
        if (!card || !card.id) {
             console.warn("DeckManager: Attempted to discard invalid card object.");
             return;
        }
        const index = this.hand.findIndex(c => c.id === card.id); // Use the unique instance ID
        if (index > -1) {
            const [discardedCard] = this.hand.splice(index, 1);
            this.discardPile.push(discardedCard);
            // --- Trigger onCardDiscard ---
            this.playerRef?.triggerArtifacts('onCardDiscard', { card: discardedCard });
            // --- End Trigger ---
            // console.log(`DeckManager: Discarded ${discardedCard.name} from hand.`); // Noisy
            // UI updates handled by caller (e.g., Player.playCard -> CombatManager -> UIManager)
        } else {
            console.warn(`DeckManager: Card ${card.name} (ID: ${card.id}) not found in hand to discard.`);
        }
    }

    /**
     * Moves all cards currently in the hand to the discard pile.
     * Typically called at the end of the player's turn.
     */
    discardHand() {
        if (this.hand.length === 0) return;
        const cardsDiscarded = [...this.hand]; // Copy for trigger data
        // console.log(`DeckManager: Discarding entire hand (${this.hand.length} cards).`); // Noisy
        this.discardPile.push(...this.hand);
        this.hand = [];
        // --- Trigger for each card discarded at end of turn ---
        cardsDiscarded.forEach(card => {
             this.playerRef?.triggerArtifacts('onCardDiscard', { card: card, endOfTurn: true });
        });
         // --- End Trigger ---
        // UI updates handled by caller (Player.endTurn -> CombatManager -> UIManager)
    }

    /**
     * Moves a specific card instance from the hand to the exhaust pile.
     * @param {Card} card - The specific card instance to exhaust.
     */
    exhaustCardFromHand(card) {
         if (!card || !card.id) {
              console.warn("DeckManager: Attempted to exhaust invalid card object.");
              return;
         }
        const index = this.hand.findIndex(c => c.id === card.id);
        if (index > -1) {
            const [exhaustedCard] = this.hand.splice(index, 1);
            this.exhaustPile.push(exhaustedCard);
            // --- NOTE: onCardExhaust trigger is now handled in Player.playCard BEFORE this call ---
            // console.log(`DeckManager: Exhausted ${exhaustedCard.name}. Exhaust pile: ${this.exhaustPile.length}.`); // Noisy
            // UI updates handled by caller
        } else {
            console.warn(`DeckManager: Card ${card.name} (ID: ${card.id}) not found in hand to exhaust.`);
        }
    }

     /**
      * Adds a card instance to the player's master deck (used outside combat).
      * @param {Card | number} cardOrId - Either a Card object or a concept ID.
      * @returns {Card | null} The added Card instance or null on failure.
      */
     addCardToMasterDeck(cardOrId) {
         let newCard;
         if (cardOrId instanceof Card) {
             newCard = cardOrId;
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

         this.masterDeck.push(newCard);
         console.log(`DeckManager: Added '${newCard.name}' to master deck. Total: ${this.masterDeck.length}.`);
         // Note: Does not add to draw/discard pile immediately during combat.
         // 'onCardAdded' trigger is handled by the Player class after calling this.
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
             // 'onCardRemove' trigger handled by Player class after calling this.
            return true;
        } else {
            // It might be useful to log the current master deck IDs here for debugging
            // console.warn(`Card '${cardToRemove.name}' (ID: ${cardToRemove.id}) not found in master deck. Current IDs: ${this.masterDeck.map(c => c.id).join(', ')}`);
            console.warn(`DeckManager: Card '${cardToRemove.name}' (ID: ${cardToRemove.id}) not found in master deck for removal.`);
            return false;
        }
    }

     /**
      * Retrieves a full list of cards in the master deck.
      * @returns {Card[]} A copy of the master deck array.
      */
     getMasterDeck() {
         return [...this.masterDeck]; // Return shallow copy
     }

    // --- Getters for pile counts ---
    getDrawPileCount() { return this.drawPile.length; }
    getDiscardPileCount() { return this.discardPile.length; }
    getHandCount() { return this.hand.length; }
    getExhaustPileCount() { return this.exhaustPile.length; }

} // End of DeckManager class
