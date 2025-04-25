// js/card.js

/**
 * Represents a specific instance of a card in the game.
 * It holds a reference to its base definition and tracks its current state (e.g., upgraded).
 */
class Card {
    /**
     * Creates an instance of a card.
     * @param {CardDefinition} definition - The base definition from cardData.js.
     * @param {boolean} [isUpgraded=false] - Whether this instance starts as upgraded.
     */
    constructor(definition, isUpgraded = false) {
        if (!definition) {
            console.error("Cannot create Card instance without a valid definition!");
            // Handle this error appropriately, maybe throw or return null?
            // For now, log error and create a placeholder to avoid immediate crashes downstream.
            this.instanceId = uuidv4();
            this.baseDefinition = { id: 'error_card', name: 'Error Card', type: CardType.STATUS, cost: null, description: 'Invalid definition', effects: {}, keywords:[] };
            this.isUpgraded = false;
            this.currentDefinition = this.baseDefinition;
            this.temporaryMods = { cost: null };
            return;
        }

        // Generate unique ID for this specific instance
        this.instanceId = uuidv4(); // From utils.js

        // Store the base definition (never changes for this instance)
        this.baseDefinition = definition;

        // Track upgrade status
        this.isUpgraded = isUpgraded && !!definition.upgrade; // Can only be upgraded if upgrade exists

        // Store temporary modifications (e.g., cost changes for one turn/combat)
        this.temporaryMods = {
            cost: null, // null means use definition cost
            // Add other potential mods: damageBonus, blockBonus etc. if needed later
        };

        // Reference to the definition currently in use (base or upgraded)
        this.currentDefinition = this.isUpgraded ? definition.upgrade : definition;

        // --- Sanity check ---
        if (this.isUpgraded && !definition.upgrade) {
             console.warn(`Card '${definition.name}' created as upgraded, but base definition lacks an upgrade path. Reverting to base.`);
             this.isUpgraded = false;
             this.currentDefinition = definition;
        }
    }

    // --- Getters to access current properties easily ---
    // These getters automatically refer to the correct definition (base or upgraded)
    // and consider temporary modifications where applicable.

    /** Gets the definition object currently representing the card's state (base or upgrade). */
    get definition() {
        return this.currentDefinition;
    }

    /** Gets the base ID of the card concept (never changes). */
    get id() {
        return this.baseDefinition.id;
    }

    /** Gets the display name of the card. Adds "+" if upgraded. */
    get name() {
        return this.baseDefinition.name + (this.isUpgraded ? "+" : "");
    }

    /** Gets the card type (Attack, Skill, Power, etc.). */
    get type() {
        return this.definition.type;
    }

    /** Gets the card's element. */
    get element() {
        return this.definition.element;
    }

    /** Gets the card's rarity. */
    get rarity() {
        // Rarity typically comes from the base definition, but check current just in case
        return this.definition.rarity || this.baseDefinition.rarity;
    }

    /**
     * Gets the current Insight cost to play the card.
     * Considers temporary modifications and handles unplayable cards.
     * Returns null if the card is unplayable (e.g., Curse, Status).
     */
    get cost() {
        // Unplayable cards always have null cost
        if (this.definition.cost === null || this.type === CardType.CURSE || this.type === CardType.STATUS) {
            return null;
        }
        // Check for temporary cost modification
        if (this.temporaryMods.cost !== null) {
            return Math.max(0, this.temporaryMods.cost); // Ensure cost isn't negative
        }
        // Otherwise, return the cost from the current definition (base or upgraded)
        return this.definition.cost;
    }

    /** Gets the text description of the card's effects. */
    get description() {
        // Ensure description exists, fallback to base if needed (though shouldn't happen often)
        return this.definition.description || this.baseDefinition.description || "";
    }

    /** Gets the structured effects object for the card. */
    get effects() {
        return this.definition.effects || this.baseDefinition.effects || {};
    }

    /** Gets the structured Momentum bonus effect object, if any. */
    get momentumEffect() {
        // Check current def first, then base def as fallback
        return this.definition.momentumEffect || this.baseDefinition.momentumEffect || null;
     }

     /** Gets the structured Resonance bonus effect object, if any. */
     get resonanceEffect() {
          return this.definition.resonanceEffect || this.baseDefinition.resonanceEffect || null;
     }

    /** Gets the list of keywords associated with the card (e.g., Exhaust, Retain). Combines base and upgrade keywords. */
    get keywords() {
        // Upgrades might add or remove keywords. Let's use only the current definition's keywords.
        // If upgrade definition doesn't specify keywords, inherit from base? Let's assume upgrade definition is complete.
        return this.definition.keywords || [];
    }

    /** Gets the art identifier, usually tied to the base card concept. */
    get artId() {
         return this.baseDefinition.artId || this.baseDefinition.id;
     }

    // --- Utility Methods ---

    /**
     * Checks if the card currently has a specific keyword.
     * @param {string} keyword - The keyword to check for (e.g., StatusEffects.EXHAUST).
     * @returns {boolean} True if the keyword is present.
     */
    hasKeyword(keyword) {
        return this.keywords.includes(keyword);
    }

    /**
     * Checks if the card is playable (has a non-null cost and isn't a Curse/Status).
     * @returns {boolean} True if the card can be played.
     */
    isPlayable() {
        return this.cost !== null && this.type !== CardType.CURSE && this.type !== CardType.STATUS;
    }

    // --- Modification Methods ---

    /**
     * Upgrades this card instance if possible.
     * @returns {boolean} True if the upgrade was successful, false otherwise.
     */
    upgrade() {
        if (!this.isUpgraded && this.baseDefinition.upgrade) {
            this.isUpgraded = true;
            // Update the current definition to the upgrade definition
            this.currentDefinition = this.baseDefinition.upgrade;
            console.log(`Card '${this.baseDefinition.name}' (Instance: ${this.instanceId}) upgraded.`);
            return true;
        } else if (this.isUpgraded) {
            // console.warn(`Card '${this.baseDefinition.name}' (Instance: ${this.instanceId}) is already upgraded.`);
            return false;
        } else {
             console.warn(`Card '${this.baseDefinition.name}' (Instance: ${this.instanceId}) has no upgrade definition.`);
             return false;
        }
    }

    /**
     * Sets a temporary cost modification for this card instance.
     * Set to null to revert to the definition's cost.
     * @param {number | null} newCost - The temporary cost, or null to reset.
     */
    setTemporaryCost(newCost) {
         if (newCost !== null && newCost < 0) {
              this.temporaryMods.cost = 0;
         } else {
              this.temporaryMods.cost = newCost;
         }
    }

    /**
     * Resets all temporary modifications on this card instance.
     */
    resetTemporaryMods() {
        this.temporaryMods.cost = null;
        // Reset other mods if added later
    }

    // --- String Representation (for debugging) ---
    toString() {
        return `${this.name} [${this.instanceId.substring(0, 4)}] (Cost: ${this.cost ?? 'N/A'}, Type: ${this.type}, Element: ${this.element})`;
    }
}
