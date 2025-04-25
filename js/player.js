// js/player.js

class Player {
    /**
     * @param {number} maxHp - Initial maximum HP (Composure).
     * @param {number} baseInsight - Initial Insight gain per turn.
     * @param {object} attunement - Base attunement levels from meta-progression.
     */
    constructor(maxHp, baseInsight, attunement) {
        this.maxHp = maxHp;
        this.currentHp = maxHp;
        this.baseInsight = baseInsight; // Insight gained per turn
        this.maxInsight = MAX_PLAYER_INSIGHT; // Max Insight cap
        this.currentInsight = 0; // Current energy pool for the turn
        this.attunement = { ...DEFAULT_PLAYER_ATTUNEMENT, ...attunement }; // Copy attunement data

        // Deck related
        this.masterDeck = []; // Holds all Card instances owned in the run
        this.drawPile = [];
        this.hand = [];
        this.discardPile = [];
        this.exhaustPile = [];

        // Combat State
        this.statusEffects = {}; // e.g., { [StatusEffects.GUARD]: 10, [StatusEffects.VULNERABLE]: 1 }
        this.powers = {}; // Store active Power card effects { powerId: { definition: CardDefinition, stacks: 1 } }
        this.momentum = 0;
        this.lastElementPlayed = Elements.NEUTRAL;
        this.resonance = this.initializeResonance(); // e.g., { [Elements.COGNITIVE]: 0, ... }

        this.cardsPlayedThisTurn = 0;
        this.maxCardsPerTurn = MAX_CARDS_PER_TURN_PLAY; // Can be modified by relics/powers

        console.log(`Player initialized. HP: ${this.currentHp}/${this.maxHp}, Base Insight: ${this.baseInsight}`);
    }

    initializeResonance() {
        const res = {};
        Object.values(Elements).forEach(element => {
            if (element !== Elements.NEUTRAL) { // Neutral doesn't typically have resonance
                res[element] = 0;
            }
        });
        return res;
    }

    // --- Deck Initialization ---

    /**
     * Creates Card instances from IDs and populates the master deck and draw pile.
     * @param {string[]} cardIds - Array of card definition IDs for the starting deck.
     */
    initializeDeck(cardIds) {
        this.masterDeck = [];
        cardIds.forEach(id => {
            const definition = getCardDefinition(id);
            if (definition) {
                // Assumes a Card class exists: new Card(definition)
                // Placeholder: Store definition directly for now, needs Card class later
                const cardInstance = new Card(definition); // *** Requires Card class definition ***
                this.masterDeck.push(cardInstance);
            } else {
                console.warn(`Could not find card definition for ID '${id}' during deck initialization.`);
            }
        });
        this.drawPile = [...this.masterDeck];
        shuffleArray(this.drawPile);
        console.log(`Player deck initialized with ${this.masterDeck.length} cards.`);
    }

    /**
     * Adds a specific card instance to the master deck (e.g., from rewards).
     * The card is usually added to the discard pile by default.
     * @param {Card} cardInstance - The Card instance to add. // *** Requires Card class definition ***
     * @param {string} [pile='discard'] - Which pile to add to ('discard', 'draw', 'hand').
     */
    addCardToDeck(cardInstance, pile = 'discard') {
        if (!cardInstance) {
            console.error("Attempted to add null/undefined card instance to deck.");
            return;
        }
        this.masterDeck.push(cardInstance);
        switch (pile) {
            case 'draw': this.drawPile.push(cardInstance); break;
            case 'hand': this.hand.push(cardInstance); break; // Careful with hand size limits
            case 'discard':
            default: this.discardPile.push(cardInstance); break;
        }
        console.log(`Added card '${cardInstance.name}' to ${pile} pile. Master deck size: ${this.masterDeck.length}`);
    }

    /**
     * Removes a specific card instance from the master deck (e.g., at Respite).
     * @param {Card} cardInstanceToRemove - The specific Card instance to remove. // *** Requires Card class definition ***
     */
    removeCardFromDeck(cardInstanceToRemove) {
        if (!cardInstanceToRemove) return false;
        const instanceId = cardInstanceToRemove.instanceId; // *** Assumes Card instance has unique instanceId ***

        // Remove from master list
        const masterIndex = this.masterDeck.findIndex(card => card.instanceId === instanceId);
        if (masterIndex > -1) {
            this.masterDeck.splice(masterIndex, 1);
        } else {
            console.warn(`Card instance ${instanceId} not found in master deck during removal.`);
            return false; // Indicate failure
        }

        // Remove from active piles (draw, hand, discard) - Exhaust pile is usually kept separate
        [this.drawPile, this.hand, this.discardPile].forEach(pile => {
            const pileIndex = pile.findIndex(card => card.instanceId === instanceId);
            if (pileIndex > -1) {
                pile.splice(pileIndex, 1);
            }
        });

        console.log(`Removed card '${cardInstanceToRemove.name}' (Instance ID: ${instanceId}). Master deck size: ${this.masterDeck.length}`);
        return true; // Indicate success
    }


    // --- Combat Turn Management ---

    startTurn(gameManager) { // Pass gameManager to access relics
        this.currentInsight = this.calculateTurnInsightGain(gameManager);
        this.cardsPlayedThisTurn = 0;
        this.resetTemporaryStatuses();
        this.updateStatusDurations(); // Decrement durations
        this.decayResonance();

        // Trigger start-of-turn effects (Relics, Powers)
        this.triggerEffects('onTurnStart', gameManager);

        this.drawCards(CARDS_PER_TURN_DRAW); // Use constant for draw amount
    }

    endTurn(gameManager) {
         // Trigger end-of-turn effects (Relics, Powers) before discard
         this.triggerEffects('onTurnEnd', gameManager);

        this.discardHand();
        this.resetMomentum(); // Reset momentum at end of turn
        // Note: Some statuses might expire here based on updateStatusDurations
    }

    calculateTurnInsightGain(gameManager) {
        let insightGain = this.baseInsight;

        // Check for effects modifying base insight (e.g., from powers/relics)
        // Example check (needs structured effect system):
        // if (this.powers['some_insight_power']) insightGain += this.powers['some_insight_power'].value;
        // if (gameManager.currentRelics.some(r => r.id === 'shadow_core')) insightGain += 1; // Example direct check

        // Check for debuffs reducing insight gain (e.g., Heavy Heart curse in hand)
        this.hand.forEach(card => {
            if (card.definition.effects?.passiveInHand?.effectId === 'reduceInsightGain') {
                insightGain -= card.definition.effects.passiveInHand.value;
            }
        });

        return Math.max(0, insightGain); // Ensure insight gain isn't negative
    }

    resetTemporaryStatuses() {
        // Reset Guard at start of turn (unless a power/relic prevents it)
        if (!this.hasStatus(StatusEffects.RETAIN_GUARD)) { // Check for a hypothetical status
            this.statusEffects[StatusEffects.GUARD] = 0;
        }
        // Other statuses might reset here if needed
    }

    updateStatusDurations() {
        for (const key in this.statusEffects) {
            const status = this.statusEffects[key];
            if (status && typeof status === 'object' && status.duration !== undefined && status.duration !== Infinity) {
                status.duration--;
                if (status.duration <= 0) {
                    console.log(`Status effect '${key}' expired.`);
                    delete this.statusEffects[key];
                }
            }
        }
        // Also update power durations if they aren't permanent
         for (const key in this.powers) {
             const power = this.powers[key];
             if (power && power.duration !== undefined && power.duration !== Infinity) {
                 power.duration--;
                 if (power.duration <= 0) {
                     console.log(`Power effect '${key}' expired.`);
                     delete this.powers[key];
                     // Potentially trigger onExpire effects
                 }
             }
         }
    }

    decayResonance() {
        for(const element in this.resonance) {
            if (this.resonance[element] > 0) {
                 this.resonance[element] = Math.max(0, this.resonance[element] - RESONANCE_DECAY_PER_TURN);
            }
        }
    }

    // --- Card Manipulation ---

    drawCards(amount) {
        const drawnCards = [];
        for (let i = 0; i < amount; i++) {
            if (this.drawPile.length === 0) {
                if (this.discardPile.length === 0) {
                    console.log("No cards left in draw or discard pile.");
                    break; // No more cards to draw
                }
                this.shuffleDiscardIntoDraw();
            }
            // After shuffle, check draw pile again
            if (this.drawPile.length > 0) {
                const card = this.drawPile.pop();
                this.hand.push(card);
                drawnCards.push(card);
                 // Trigger onDraw effects if any
            }
        }
        console.log(`Drew ${drawnCards.length} cards. Hand size: ${this.hand.length}`);
        // Check for hand size limit? StS doesn't have one, usually.
        return drawnCards;
    }

    discardHand() {
        const cardsToDiscard = this.hand.filter(card => !card.hasKeyword(StatusEffects.RETAIN)); // *** Assumes card.hasKeyword method ***
        const cardsToKeep = this.hand.filter(card => card.hasKeyword(StatusEffects.RETAIN));

        cardsToDiscard.forEach(card => this.discardPile.push(card));
        this.hand = cardsToKeep; // Keep only retained cards

        console.log(`Discarded ${cardsToDiscard.length} cards. Kept ${cardsToKeep.length}. Discard size: ${this.discardPile.length}`);

        // Handle Ethereal cards left in hand (they exhaust)
         cardsToKeep.forEach((card, index) => {
             if (card.hasKeyword(StatusEffects.ETHEREAL)) {
                 this.exhaustCard(card);
                 this.hand.splice(index, 1); // Remove from hand after processing
                  console.log(`Ethereal card '${card.name}' exhausted from hand.`);
             }
         });
    }

    discardCard(cardInstance, destinationPile = this.discardPile) {
        const index = this.hand.findIndex(card => card.instanceId === cardInstance.instanceId); // *** Assumes instanceId ***
        if (index > -1) {
            const card = this.hand.splice(index, 1)[0];
            destinationPile.push(card);
            console.log(`Discarded card '${card.name}' from hand.`);
            return true;
        }
        console.warn(`Card '${cardInstance.name}' not found in hand for discarding.`);
        return false;
    }

    exhaustCard(cardInstance) {
         // Try removing from hand first
         const handIndex = this.hand.findIndex(card => card.instanceId === cardInstance.instanceId);
         if (handIndex > -1) {
             const card = this.hand.splice(handIndex, 1)[0];
             this.exhaustPile.push(card);
             console.log(`Exhausted card '${card.name}' from hand.`);
             return true;
         }
          // Try removing from draw pile
         const drawIndex = this.drawPile.findIndex(card => card.instanceId === cardInstance.instanceId);
          if (drawIndex > -1) {
             const card = this.drawPile.splice(drawIndex, 1)[0];
             this.exhaustPile.push(card);
             console.log(`Exhausted card '${card.name}' from draw pile.`);
             return true;
         }
         // Try removing from discard pile
         const discardIndex = this.discardPile.findIndex(card => card.instanceId === cardInstance.instanceId);
          if (discardIndex > -1) {
             const card = this.discardPile.splice(discardIndex, 1)[0];
             this.exhaustPile.push(card);
             console.log(`Exhausted card '${card.name}' from discard pile.`);
             return true;
         }
         console.warn(`Card '${cardInstance.name}' not found for exhaustion.`);
         return false;
    }

    shuffleDiscardIntoDraw() {
        console.log(`Shuffling ${this.discardPile.length} cards into draw pile.`);
        this.drawPile = [...this.drawPile, ...this.discardPile]; // Combine first
        this.discardPile = [];
        shuffleArray(this.drawPile);
    }

    // --- Resource Management (Insight) ---

    canAfford(cost) {
        return this.currentInsight >= cost;
    }

    spendInsight(amount) {
        if (this.canAfford(amount)) {
            this.currentInsight -= amount;
            return true;
        }
        return false;
    }

    gainInsight(amount) {
        this.currentInsight = Math.min(this.maxInsight, this.currentInsight + amount);
        console.log(`Gained ${amount} Insight. Current: ${this.currentInsight}`);
    }

    loseInsight(amount) {
         this.currentInsight = Math.max(0, this.currentInsight - amount);
         console.log(`Lost ${amount} Insight. Current: ${this.currentInsight}`);
    }

    // --- Health & Guard Management ---

    /**
     * Takes Bruise damage, considering Guard and Vulnerable status.
     * @param {number} amount - The amount of incoming Bruise.
     * @returns {number} The actual HP lost.
     */
    takeBruise(amount) {
        let damageToTake = amount;

        // Apply Vulnerable (if present)
        if (this.hasStatus(StatusEffects.VULNERABLE)) {
            damageToTake = Math.floor(damageToTake * VULNERABLE_MULTIPLIER);
            console.log(`Vulnerable increased incoming Bruise to ${damageToTake}`);
        }

        // Apply Guard
        const guard = this.getStatus(StatusEffects.GUARD);
        if (guard > 0) {
            const blockedAmount = Math.min(guard, damageToTake);
            this.statusEffects[StatusEffects.GUARD] -= blockedAmount;
            damageToTake -= blockedAmount;
            console.log(`Blocked ${blockedAmount} Bruise with Guard. Remaining Guard: ${this.getStatus(StatusEffects.GUARD)}`);
        }

        // Apply damage to HP
        if (damageToTake > 0) {
            this.currentHp = Math.max(0, this.currentHp - damageToTake);
            console.log(`Took ${damageToTake} Bruise. Current HP: ${this.currentHp}`);
            // Trigger onHpLoss effects?
            return damageToTake;
        }
        return 0; // No HP lost
    }

    /**
     * Direct HP loss, bypasses Guard.
     * @param {number} amount - Amount of HP to lose.
     */
    loseHp(amount) {
         if (amount <= 0) return;
         this.currentHp = Math.max(0, this.currentHp - amount);
         console.log(`Lost ${amount} HP directly. Current HP: ${this.currentHp}`);
         // Trigger onHpLoss effects?
    }

    heal(amount) {
        if (amount <= 0) return;
        const healedAmount = Math.min(amount, this.maxHp - this.currentHp); // Cannot heal above max
        this.currentHp += healedAmount;
        if (healedAmount > 0) {
             console.log(`Healed ${healedAmount} HP. Current HP: ${this.currentHp}`);
        }
        return healedAmount;
    }

    gainGuard(amount) {
        if (amount <= 0) return;
        if (!this.statusEffects[StatusEffects.GUARD]) {
            this.statusEffects[StatusEffects.GUARD] = 0;
        }
        this.statusEffects[StatusEffects.GUARD] += amount;
        console.log(`Gained ${amount} Guard. Total: ${this.statusEffects[StatusEffects.GUARD]}`);
    }

    // --- Status Effect & Power Management ---

    /**
     * Applies a status effect (buff or debuff).
     * @param {string} effectId - The StatusEffects constant.
     * @param {number} amount - Stacks or value of the effect.
     * @param {number} [duration=Infinity] - Turns the effect lasts (Infinity for permanent until removed).
     */
    applyStatus(effectId, amount, duration = Infinity) {
         // Handle stackable vs non-stackable statuses
         if (effectId === StatusEffects.GUARD || effectId === StatusEffects.RESONANCE || /* add other stackable value types */) {
             if (!this.statusEffects[effectId]) this.statusEffects[effectId] = 0;
             this.statusEffects[effectId] += amount;
         } else {
             // For duration-based statuses, usually replace or update duration/amount
             this.statusEffects[effectId] = { amount: amount, duration: duration };
         }
         console.log(`Applied status: ${effectId}, Amount: ${amount}, Duration: ${duration}`);
    }

    /**
     * Gets the current value or amount of a status effect.
     * @param {string} effectId - The StatusEffects constant.
     * @returns {number} The value/stacks, or 0 if not present.
     */
    getStatus(effectId) {
        const status = this.statusEffects[effectId];
        if (!status) return 0;
        // Handle simple numeric values (like Guard) vs objects with amount
        if (typeof status === 'number') return status;
        if (typeof status === 'object' && status.amount !== undefined) return status.amount;
        return 0; // Default if structure is unexpected
    }

    /**
     * Checks if the player has a specific status effect active.
     * @param {string} effectId - The StatusEffects constant.
     * @returns {boolean} True if the status effect is present and has amount > 0 or duration > 0.
     */
    hasStatus(effectId) {
         const status = this.statusEffects[effectId];
         if (!status) return false;
         if (typeof status === 'number') return status > 0;
         if (typeof status === 'object') return status.amount > 0 && status.duration > 0;
         return false; // Should not happen with current structure
    }

    /**
     * Adds or updates an active power.
     * @param {CardDefinition} powerDefinition - The definition of the power card.
     * @param {number} [stacks=1] - Number of stacks (for stackable powers).
     * @param {number} [duration=Infinity] - Duration if the power is temporary.
     */
    addPower(powerDefinition, stacks = 1, duration = Infinity) {
         const powerId = powerDefinition.id;
         if (!this.powers[powerId]) {
             this.powers[powerId] = { definition: powerDefinition, stacks: 0, duration: duration };
         }
         this.powers[powerId].stacks += stacks;
         // Update duration only if the new duration is longer or permanent? Or always replace? Let's replace for now.
         this.powers[powerId].duration = duration;
         console.log(`Added/updated power: ${powerId}, Stacks: ${this.powers[powerId].stacks}`);
    }

     hasPower(powerId) {
         return this.powers.hasOwnProperty(powerId) && this.powers[powerId].stacks > 0;
     }

     getPowerStacks(powerId) {
         return this.hasPower(powerId) ? this.powers[powerId].stacks : 0;
     }


    // --- Momentum & Resonance ---

    generateMomentum(cardElement, gameManager) {
        if (cardElement === Elements.NEUTRAL) {
            this.resetMomentum();
            return;
        }

        let momentumGain = 1;
        // Check relics/powers for bonus momentum gain
        gameManager.currentRelics.forEach(relic => {
             if (relic.effects?.modifyMechanic?.mechanic === 'momentumGain' && relic.effects.modifyMechanic.element === cardElement) {
                 momentumGain += relic.effects.modifyMechanic.value;
             }
        });
        // Check powers too

        if (this.lastElementPlayed === cardElement) {
            this.momentum += momentumGain;
            console.log(`Increased Momentum for ${cardElement}: ${this.momentum} (+${momentumGain})`);
        } else {
            this.momentum = momentumGain; // Start new chain
            console.log(`Started new Momentum chain for ${cardElement}: ${this.momentum} (+${momentumGain})`);
        }
        this.lastElementPlayed = cardElement;
    }

    resetMomentum() {
        if (this.momentum > BASE_MOMENTUM_RESET_THRESHOLD) {
            // console.log("Momentum reset."); // Can be noisy
        }
        this.momentum = 0;
        this.lastElementPlayed = Elements.NEUTRAL;
    }

    triggerResonance(element, amount) {
        if (this.resonance.hasOwnProperty(element)) {
            this.resonance[element] += amount;
            console.log(`Gained ${amount} Resonance for ${element}. Total: ${this.resonance[element]}`);
        }
    }

    getResonance(element) {
        return this.resonance[element] || 0;
    }


    // --- Stat Modification ---

    modifyStat(statName, value) {
        switch (statName) {
            case 'maxHp':
                const hpDiff = this.maxHp - this.currentHp;
                this.maxHp = Math.max(1, this.maxHp + value); // Ensure maxHP doesn't go below 1
                this.currentHp = this.maxHp - hpDiff; // Maintain current HP deficit/surplus relative to max
                console.log(`Modified maxHp by ${value}. New maxHp: ${this.maxHp}`);
                break;
            case 'baseInsight':
                this.baseInsight = Math.max(0, this.baseInsight + value); // Ensure base insight isn't negative
                console.log(`Modified baseInsight by ${value}. New baseInsight: ${this.baseInsight}`);
                break;
            case 'maxInsight':
                 this.maxInsight = Math.max(this.baseInsight, this.maxInsight + value); // Max insight shouldn't be less than base gain
                 console.log(`Modified maxInsight by ${value}. New maxInsight: ${this.maxInsight}`);
                 break;
             case 'maxCardsPerTurn':
                 this.maxCardsPerTurn = Math.max(1, this.maxCardsPerTurn + value);
                 console.log(`Modified maxCardsPerTurn by ${value}. New limit: ${this.maxCardsPerTurn}`);
                 break;
            // Add other modifiable stats if needed
            default:
                console.warn(`Attempted to modify unknown stat: ${statName}`);
        }
        // Clamp current values just in case
        this.currentHp = clamp(this.currentHp, 0, this.maxHp);
        this.currentInsight = clamp(this.currentInsight, 0, this.maxInsight);
    }

     // --- Effect Triggering ---
     // Helper to consolidate triggering effects from relics and powers
     triggerEffects(triggerType, gameManager, context = {}) {
         // 1. Trigger Relic Effects
         gameManager.currentRelics.forEach(relic => {
             if (relic.effects?.triggerEffect?.trigger === triggerType) {
                 this.executeEffect(relic.effects.triggerEffect, 'relic', gameManager, context);
             }
              // Check for other potential effect structures on relics
         });

         // 2. Trigger Power Effects
         Object.values(this.powers).forEach(powerData => {
             // Power definitions need a standardized way to declare triggers
             // Example: powerData.definition.triggers?.[triggerType]
             const powerTriggers = powerData.definition?.triggers?.[triggerType]; // Hypothetical structure
             if (powerTriggers) {
                 // Execute the effects associated with this trigger
                  console.log(`Triggering power '${powerData.definition.id}' on ${triggerType}`);
                  // Need effect execution logic here based on powerTriggers structure
             }
             // Handle specific hardcoded power triggers if needed (less ideal)
             if (triggerType === 'onPlayInteractionCard' && powerData.definition.id === 'dominance_psych') {
                  if (context.card?.element === Elements.INTERACTION) { // Check context passed from playCard
                      // Apply vulnerable effect (likely needs target from context)
                       if(context.target) {
                           context.target.applyStatus(StatusEffects.VULNERABLE, powerData.stacks); // Assuming power stacks affect amount
                           console.log(`Dominance (Psych) triggered: Applied ${powerData.stacks} Vulnerable`);
                       }
                  }
             }
         });
     }

    // Helper to execute a specific effect action
    executeEffect(effect, sourceType, gameManager, context) {
        console.log(`Executing ${sourceType} effect for trigger '${effect.trigger}': Action '${effect.action}'`);
        switch (effect.action) {
            case 'gainGuard': this.gainGuard(effect.value); break;
            case 'gainInsight': this.gainInsight(effect.value); break;
            case 'drawCards': this.drawCards(effect.value); break;
            case 'gainResonance': this.triggerResonance(effect.element, effect.value); break;
            case 'applyStatus':
                 // Target needs to be determined (usually player for defensive effects)
                 this.applyStatus(effect.status, effect.value, effect.duration || Infinity);
                 break;
             case 'addCardToDrawPile':
             case 'addCardToDiscard':
             case 'addCardToHand':
                 const cardDef = getCardDefinition(effect.cardId);
                 if (cardDef) {
                     const count = effect.count || 1;
                     for(let i=0; i<count; i++) {
                        const newCard = new Card(cardDef); // *** Requires Card class ***
                        const pile = effect.action.includes('Draw') ? 'draw' : effect.action.includes('Hand') ? 'hand' : 'discard';
                        this.addCardToDeck(newCard, pile);
                     }
                 } else {
                      console.warn(`Could not find card definition for '${effect.cardId}' needed by effect.`);
                 }
                 break;
            // Add more effect actions as needed
            default: console.warn(`Unhandled effect action: ${effect.action}`);
        }
    }
}
