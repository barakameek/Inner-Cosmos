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
        if (!definition || typeof definition !== 'object' || !definition.id) {
            console.error("Cannot create Card instance without a valid definition object!", definition);
            // Create a fallback error card to prevent downstream crashes
            this.instanceId = uuidv4();
            this.baseDefinition = new CardDefinition({ id: 'error_card', name: 'Error Card', type: CardType.STATUS, cost: null, rarity: CardRarity.SPECIAL, description: 'Invalid definition passed to constructor.' });
            this.isUpgraded = false;
             // Deep copy the definition to avoid modifying the base pool accidentally if fallback is used.
             // However, the main definition reference should NOT be a deep copy.
            this.currentDefinition = deepCopy(this.baseDefinition); // Fallback uses copy
            this.temporaryMods = { cost: null };
            console.error(`Created fallback error card instance: ${this.instanceId}`);
            return;
        }

        // Generate unique ID for this specific instance
        this.instanceId = uuidv4(); // From utils.js

        // Store the base definition (reference, DO NOT DEEP COPY - allows checking base props)
        this.baseDefinition = definition;

        // Track upgrade status
        // Can only be upgraded if an upgrade path exists in the base definition
        this.isUpgraded = isUpgraded && !!this.baseDefinition.upgrade;

        // Store temporary modifications (e.g., cost changes for one turn/combat)
        this.temporaryMods = {
            cost: null, // null means use definition cost
            // Add other potential mods: damageBonus, blockBonus etc. if needed later
        };

        // Reference to the definition currently in use (base or upgraded)
        // This should reference the actual sub-object (baseDefinition or baseDefinition.upgrade)
        this.currentDefinition = this.isUpgraded ? this.baseDefinition.upgrade : this.baseDefinition;

        // --- Sanity check ---
        if (isUpgraded && !this.baseDefinition.upgrade) {
             console.warn(`Card '${this.baseDefinition.name}' created as upgraded, but base definition lacks an upgrade path. Reverting to base.`);
             this.isUpgraded = false;
             this.currentDefinition = this.baseDefinition; // Point back to base
        }
    }

    // --- Getters to access current properties easily ---
    // These getters automatically refer to the correct definition (base or upgraded)
    // and consider temporary modifications where applicable.

    /**
     * Gets the definition object currently representing the card's state.
     * IMPORTANT: For accessing current effects/cost/description etc., use the direct getters below.
     * This getter is mainly for internal reference or complex checks.
     */
    get definition() {
        // If the currentDefinition isn't properly referencing base/upgrade, fix it.
        // This guards against potential issues if the reference was lost.
        if (this.isUpgraded && this.baseDefinition.upgrade) {
            return this.baseDefinition.upgrade;
        }
        return this.baseDefinition;
    }

    /** Gets the base ID of the card concept (never changes). */
    get id() {
        return this.baseDefinition.id;
    }

    /** Gets the display name of the card. Adds "+" if upgraded. */
    get name() {
        return this.baseDefinition.name + (this.isUpgraded ? "+" : "");
    }

    /** Gets the card type (Attack, Skill, Power, etc.). Uses base type, assumes type doesn't change on upgrade. */
    get type() {
        return this.baseDefinition.type;
    }

    /** Gets the card's element. Uses base element, assumes element doesn't change. */
    get element() {
        return this.baseDefinition.element;
    }

    /** Gets the card's rarity. Uses base rarity. */
    get rarity() {
        return this.baseDefinition.rarity;
    }

    /**
     * Gets the current Insight cost to play the card.
     * Considers temporary modifications and handles unplayable cards.
     * Returns null if the card is unplayable (e.g., Curse, Status).
     */
    get cost() {
        // Unplayable cards always have null cost
        if (this.baseDefinition.type === CardType.CURSE || this.baseDefinition.type === CardType.STATUS) {
            return null;
        }
        // Check for temporary cost modification
        if (this.temporaryMods.cost !== null) {
            return Math.max(0, this.temporaryMods.cost); // Ensure cost isn't negative
        }
        // Otherwise, return the cost from the current definition (base or upgraded)
        const currentCost = this.isUpgraded && this.baseDefinition.upgrade
                           ? (this.baseDefinition.upgrade.cost ?? this.baseDefinition.cost) // Upgrade inherits cost if not specified
                           : this.baseDefinition.cost;

        // Check if cost is explicitly null (might be valid for some playable cards?)
        if (currentCost === null && this.isPlayable()) {
             console.warn(`Card '${this.name}' is playable but has null cost in definition.`);
             return 0; // Default to 0 if playable but cost is null? Or keep null? Let's use 0.
        }

        return currentCost;
    }

    /** Gets the text description of the card's effects based on current state (upgraded or not). */
    get description() {
        const currentDef = this.isUpgraded && this.baseDefinition.upgrade ? this.baseDefinition.upgrade : this.baseDefinition;
        return currentDef.description || this.baseDefinition.description || ""; // Fallback to base description
    }

    /** Gets the structured effects object for the card based on current state. */
    get effects() {
         const currentDef = this.isUpgraded && this.baseDefinition.upgrade ? this.baseDefinition.upgrade : this.baseDefinition;
        return currentDef.effects || this.baseDefinition.effects || {}; // Fallback to base effects
    }

    /** Gets the structured Momentum bonus effect object, if any, based on current state. */
    get momentumEffect() {
         const currentDef = this.isUpgraded && this.baseDefinition.upgrade ? this.baseDefinition.upgrade : this.baseDefinition;
        return currentDef.momentumEffect || this.baseDefinition.momentumEffect || null;
     }

     /** Gets the structured Resonance bonus effect object, if any, based on current state. */
     get resonanceEffect() {
          const currentDef = this.isUpgraded && this.baseDefinition.upgrade ? this.baseDefinition.upgrade : this.baseDefinition;
         return currentDef.resonanceEffect || this.baseDefinition.resonanceEffect || null;
     }

    /** Gets the list of keywords associated with the card based on current state. */
    get keywords() {
        // Use keywords from the specific definition (base or upgrade)
         const currentDef = this.isUpgraded && this.baseDefinition.upgrade ? this.baseDefinition.upgrade : this.baseDefinition;
        // If upgrade doesn't define keywords, inherit from base? Let's assume definition is complete.
        return currentDef.keywords || [];
    }

    /** Gets the triggers object associated with the card based on current state (mainly for Powers). */
    get triggers() {
         const currentDef = this.isUpgraded && this.baseDefinition.upgrade ? this.baseDefinition.upgrade : this.baseDefinition;
        return currentDef.triggers || this.baseDefinition.triggers || null;
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
        // Use the getter `this.cost` which handles null for Curse/Status already
        return this.cost !== null;
    }

    // --- Modification Methods ---

    /**
     * Upgrades this card instance if possible.
     * @returns {boolean} True if the upgrade was successful, false otherwise.
     */
    upgrade() {
        if (!this.isUpgraded && this.baseDefinition.upgrade) {
            this.isUpgraded = true;
            // No need to change currentDefinition reference here, getters handle it.
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
