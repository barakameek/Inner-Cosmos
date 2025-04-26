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

        // Deck related - Stores Card instances
        this.masterDeck = []; // Holds all Card instances owned in the run
        this.drawPile = [];
        this.hand = [];
        this.discardPile = [];
        this.exhaustPile = [];

        // Combat State
        this.statusEffects = {}; // e.g., { [StatusEffects.GUARD]: 10, [StatusEffects.VULNERABLE]: 1 }
        this.powers = {}; // Store active Power card effects { powerId: { definition: CardDefinition, stacks: 1, duration: Infinity } }
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
            // Neutral doesn't typically have resonance, but maybe needed for effects? Add if required.
            // For now, only track the 5 core elements.
            if (element !== Elements.NEUTRAL) {
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
        this.drawPile = [];
        this.hand = [];
        this.discardPile = [];
        this.exhaustPile = []; // Ensure all piles are clear

        cardIds.forEach(id => {
            const definition = getCardDefinition(id);
            if (definition) {
                // Create a new Card instance using the Card class
                const cardInstance = new Card(definition);
                this.masterDeck.push(cardInstance);
            } else {
                console.warn(`Could not find card definition for ID '${id}' during deck initialization.`);
            }
        });
        this.drawPile = [...this.masterDeck]; // Populate draw pile with instances
        shuffleArray(this.drawPile);
        console.log(`Player deck initialized with ${this.masterDeck.length} cards.`);
    }

    /**
     * Adds a specific card instance to the master deck (e.g., from rewards).
     * The card is usually added to the specified pile.
     * @param {Card} cardInstance - The Card instance to add.
     * @param {string} [pile='discard'] - Which pile to add to ('discard', 'draw', 'hand').
     */
    addCardToDeck(cardInstance, pile = 'discard') {
        if (!cardInstance || !(cardInstance instanceof Card)) {
            console.error("Attempted to add invalid/null card instance to deck.");
            return;
        }
        // Add to master list if not already there (e.g., adding a newly created card)
        // If transforming a card, it might already be in masterDeck, handle that case if needed.
        if (!this.masterDeck.some(c => c.instanceId === cardInstance.instanceId)) {
             this.masterDeck.push(cardInstance);
        }

        switch (pile) {
            case 'draw':
                // Add to top or bottom? Usually bottom/random. Let's shuffle in.
                this.drawPile.push(cardInstance);
                shuffleArray(this.drawPile); // Shuffle after adding? Or just add to bottom? Add to bottom for now.
                // this.drawPile.unshift(cardInstance); // Add to top
                break;
            case 'hand':
                // Check hand size limits if implemented?
                this.hand.push(cardInstance);
                 // Trigger onDraw effects if any
                 this.triggerEffects('onCardDraw', null, { card: cardInstance }); // Pass null for gameManager if unavailable contextually? Risky.
                break;
            case 'discard':
            default:
                this.discardPile.push(cardInstance);
                break;
        }
        console.log(`Added card '${cardInstance.name}' to ${pile} pile. Master deck size: ${this.masterDeck.length}`);
    }

    /**
     * Removes a specific card instance from the master deck and all active piles.
     * @param {Card} cardInstanceToRemove - The specific Card instance to remove.
     * @returns {boolean} True if the card was successfully removed, false otherwise.
     */
    removeCardFromDeck(cardInstanceToRemove) {
        if (!cardInstanceToRemove || !cardInstanceToRemove.instanceId) return false;
        const instanceId = cardInstanceToRemove.instanceId;
        let foundAndRemoved = false;

        // Remove from master list
        const masterIndex = this.masterDeck.findIndex(card => card.instanceId === instanceId);
        if (masterIndex > -1) {
            this.masterDeck.splice(masterIndex, 1);
            foundAndRemoved = true; // Found in master list
        } else {
            // If not in master list, it shouldn't be anywhere else, but check anyway.
            console.warn(`Card instance ${instanceId} ('${cardInstanceToRemove.name}') not found in master deck during removal.`);
        }

        // Remove from active piles (draw, hand, discard)
        [this.drawPile, this.hand, this.discardPile].forEach(pile => {
            const pileIndex = pile.findIndex(card => card.instanceId === instanceId);
            if (pileIndex > -1) {
                pile.splice(pileIndex, 1);
                foundAndRemoved = true; // Found in at least one pile
            }
        });
        // Don't remove from exhaust pile - exhausted cards are out of the deck cycle.

        if (foundAndRemoved) {
             console.log(`Removed card '${cardInstanceToRemove.name}' (Instance ID: ${instanceId}). Master deck size: ${this.masterDeck.length}`);
        } else {
             console.warn(`Could not find card '${cardInstanceToRemove.name}' (Instance ID: ${instanceId}) in any active pile during removal.`);
        }

        return foundAndRemoved;
    }


    // --- Combat Turn Management ---

    startTurn(gameManager) { // Pass gameManager to access relics
        this.resetTemporaryStatuses(); // Reset guard first
        this.updateStatusDurations(); // Then decrement durations
        this.decayResonance();

        // Calculate insight *after* status updates (e.g., InsightDown debuff)
        this.currentInsight = this.calculateTurnInsightGain(gameManager);
        this.cardsPlayedThisTurn = 0; // Reset card play counter

        // Trigger start-of-turn effects (Relics, Powers)
        this.triggerEffects('onTurnStart', gameManager);

        this.drawCards(CARDS_PER_TURN_DRAW); // Use constant for draw amount
    }

    endTurn(gameManager) {
         // Trigger end-of-turn effects (Relics, Powers) before discard
         this.triggerEffects('onTurnEnd', gameManager);

        this.discardHand();
        this.resetMomentum(); // Reset momentum at end of turn

        // Reset temporary card mods after discarding
        [...this.drawPile, ...this.hand, ...this.discardPile, ...this.exhaustPile].forEach(card => card.resetTemporaryMods());
    }

    calculateTurnInsightGain(gameManager) {
        let insightGain = this.baseInsight;

        // Check for effects modifying base insight (e.g., from powers/relics)
        // 1. Check Relics
        gameManager.currentRelics.forEach(relic => {
             if (relic.effects?.modifyStat?.stat === 'baseInsight') {
                  insightGain += relic.effects.modifyStat.value;
             }
        });
        // 2. Check Powers
        Object.values(this.powers).forEach(powerData => {
            // Look for a specific power effect or a generic trigger
            // Example: if (powerData.definition.id === 'some_insight_power') insightGain += powerData.stacks;
        });

        // Check for debuffs reducing insight gain (e.g., Heavy Heart curse in hand)
        this.hand.forEach(card => {
            if (card.effects?.passiveInHand?.effectId === 'reduceInsightGain') {
                insightGain -= card.effects.passiveInHand.value || 1;
            }
        });
         // Check statuses on player (e.g., InsightDown)
         if (this.hasStatus('InsightDown')) {
              insightGain -= this.getStatus('InsightDown');
         }


        return Math.max(0, insightGain); // Ensure insight gain isn't negative
    }

    resetTemporaryStatuses() {
        // Reset Guard at start of turn (unless a power/relic prevents it)
        // TODO: Check for a hypothetical 'Retain Guard' status/power if needed
        this.statusEffects[StatusEffects.GUARD] = 0;

        // Reset card play limit status
        delete this.statusEffects['CardPlayLimit'];
    }

    updateStatusDurations() {
        for (const key in this.statusEffects) {
            // Check if status value is an object with a duration property
            if (this.statusEffects[key] && typeof this.statusEffects[key] === 'object' && this.statusEffects[key].duration !== undefined) {
                const status = this.statusEffects[key];
                if (status.duration !== Infinity) {
                    status.duration--;
                    if (status.duration <= 0) {
                        console.log(`Player status effect '${key}' expired.`);
                        delete this.statusEffects[key];
                    }
                }
            }
             // Simple numeric statuses (like Guard) don't have durations managed here
             // Add specific duration logic for other statuses if needed (e.g., Freeze_Element)
             if (key.startsWith(StatusEffects.FREEZE + '_')) {
                  const freezeStatus = this.statusEffects[key];
                  if (freezeStatus && freezeStatus.duration !== Infinity) {
                       freezeStatus.duration--;
                        if (freezeStatus.duration <= 0) {
                           console.log(`Player status effect '${key}' expired.`);
                           delete this.statusEffects[key];
                        }
                  }
             }
        }
        // Also update power durations if they aren't permanent
         for (const powerId in this.powers) {
             const power = this.powers[powerId];
             if (power && power.duration !== undefined && power.duration !== Infinity) {
                 power.duration--;
                 if (power.duration <= 0) {
                     console.log(`Power effect '${powerId}' expired.`);
                     delete this.powers[powerId];
                     // Potentially trigger onExpire effects if defined in power triggers
                     // this.triggerEffects('onPowerExpire', gameManager, { powerId: powerId });
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
                const card = this.drawPile.pop(); // Take from end (top) of draw pile
                if (card) { // Ensure card is valid
                     this.hand.push(card);
                     drawnCards.push(card);
                     // Trigger onDraw effects if any
                     // Pass gameManager if possible, needed for context (relics etc)
                     // this.triggerEffects('onCardDraw', gameManager, { card: card });
                } else {
                    console.warn("Popped undefined card from draw pile after shuffle check?");
                }
            }
        }
        console.log(`Drew ${drawnCards.length} cards. Hand size: ${this.hand.length}`);
        // Check for hand size limit? StS doesn't have one, usually.
        return drawnCards;
    }

    discardHand() {
        const cardsToDiscard = [];
        const cardsToKeep = [];

        // Iterate backwards to allow removal while iterating
        for (let i = this.hand.length - 1; i >= 0; i--) {
             const card = this.hand[i];
             if (card.hasKeyword(StatusEffects.RETAIN)) {
                  cardsToKeep.push(card);
             } else {
                  cardsToDiscard.push(card);
                  this.discardPile.push(card); // Add to discard
             }
        }
        // Reset hand to only retained cards
        this.hand = cardsToKeep.reverse(); // Keep original order?

        console.log(`Discarded ${cardsToDiscard.length} cards. Kept ${cardsToKeep.length}. Discard size: ${this.discardPile.length}`);

        // Handle Ethereal cards that were *kept* (retained) - they exhaust at end of turn
        // Iterate backwards again for safe removal
         for (let i = this.hand.length - 1; i >= 0; i--) {
              const card = this.hand[i];
              if (card.hasKeyword(StatusEffects.ETHEREAL)) {
                   this.exhaustCard(card, 'hand'); // Specify source pile
                   console.log(`Ethereal card '${card.name}' exhausted from hand.`);
              }
         }
    }

    /**
     * Moves a specific card instance from hand to a target pile.
     * @param {Card} cardInstance - The card instance in hand.
     * @param {Card[]} destinationPile - The array representing the target pile (e.g., this.discardPile, this.exhaustPile).
     * @returns {boolean} True if successful.
     */
    moveCardFromHand(cardInstance, destinationPile) {
        const index = this.hand.findIndex(card => card.instanceId === cardInstance.instanceId);
        if (index > -1) {
            const card = this.hand.splice(index, 1)[0];
            destinationPile.push(card);
            // console.log(`Moved card '${card.name}' from hand to destination pile.`);
            return true;
        }
        console.warn(`Card '${cardInstance.name}' not found in hand for moving.`);
        return false;
    }

    /**
     * Moves a specific card instance from its current pile (hand, draw, discard) to the exhaust pile.
     * @param {Card} cardInstance - The card instance to exhaust.
     * @param {string} [sourceHint=null] - Optional: 'hand', 'draw', 'discard' to optimize search.
     * @returns {boolean} True if successful.
     */
    exhaustCard(cardInstance, sourceHint = null) {
        let found = false;
        const instanceId = cardInstance.instanceId;

        // Try removing from hint source first
        if (sourceHint === 'hand') {
            found = this.moveCardFromHand(cardInstance, this.exhaustPile);
        } else if (sourceHint === 'draw') {
            const index = this.drawPile.findIndex(card => card.instanceId === instanceId);
            if (index > -1) { const card = this.drawPile.splice(index, 1)[0]; this.exhaustPile.push(card); found = true; }
        } else if (sourceHint === 'discard') {
            const index = this.discardPile.findIndex(card => card.instanceId === instanceId);
            if (index > -1) { const card = this.discardPile.splice(index, 1)[0]; this.exhaustPile.push(card); found = true; }
        }

        // If not found via hint, search all piles
        if (!found) {
            if (this.moveCardFromHand(cardInstance, this.exhaustPile)) found = true;
        }
        if (!found) {
             const drawIndex = this.drawPile.findIndex(card => card.instanceId === instanceId);
             if (drawIndex > -1) { const card = this.drawPile.splice(drawIndex, 1)[0]; this.exhaustPile.push(card); found = true; }
        }
         if (!found) {
              const discardIndex = this.discardPile.findIndex(card => card.instanceId === instanceId);
              if (discardIndex > -1) { const card = this.discardPile.splice(discardIndex, 1)[0]; this.exhaustPile.push(card); found = true; }
         }

         if (found) {
              console.log(`Exhausted card '${cardInstance.name}' (Instance ID: ${instanceId}).`);
         } else {
              console.warn(`Card '${cardInstance.name}' not found for exhaustion.`);
         }
         return found;
    }

    shuffleDiscardIntoDraw() {
        console.log(`Shuffling ${this.discardPile.length} cards into draw pile.`);
        this.drawPile.push(...this.discardPile); // Add discard pile contents to draw pile
        this.discardPile = []; // Empty the discard pile
        shuffleArray(this.drawPile);
    }

    // --- Resource Management (Insight) ---

    canAfford(cost) {
        // Cost should be a number, handle null for safety (treat as 0 cost?)
        const effectiveCost = (cost === null) ? 0 : cost;
        return this.currentInsight >= effectiveCost;
    }

    spendInsight(amount) {
         const effectiveAmount = (amount === null) ? 0 : amount;
        if (this.canAfford(effectiveAmount)) {
            this.currentInsight -= effectiveAmount;
            return true;
        }
        return false;
    }

    gainInsight(amount) {
        if (amount <= 0) return;
        this.currentInsight = Math.min(this.maxInsight, this.currentInsight + amount);
        console.log(`Gained ${amount} Insight. Current: ${this.currentInsight}`);
    }

    loseInsight(amount) {
         if (amount <= 0) return;
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
        if (amount <= 0) return 0;
        let damageToTake = amount;

        // Apply Vulnerable (if present) - Check object structure
        if (this.hasStatus(StatusEffects.VULNERABLE)) {
            damageToTake = Math.floor(damageToTake * VULNERABLE_MULTIPLIER);
            console.log(`Player Vulnerable increased incoming Bruise to ${damageToTake}`);
        }

        // Apply Guard
        const guard = this.getStatus(StatusEffects.GUARD); // Guard is a simple number
        if (guard > 0) {
            const blockedAmount = Math.min(guard, damageToTake);
            this.statusEffects[StatusEffects.GUARD] -= blockedAmount; // Directly modify guard
            damageToTake -= blockedAmount;
            console.log(`Player blocked ${blockedAmount} Bruise with Guard. Remaining Guard: ${this.getStatus(StatusEffects.GUARD)}`);
        }

        // Apply damage to HP
        if (damageToTake > 0) {
            const actualHpLoss = Math.min(damageToTake, this.currentHp);
            this.currentHp -= actualHpLoss;
            console.log(`Player took ${actualHpLoss} Bruise. Current HP: ${this.currentHp}/${this.maxHp}`);
            // Trigger onHpLoss effects if any needed for player
            // this.triggerEffects('onHpLoss', gameManager, { amount: actualHpLoss });
            return actualHpLoss;
        }
        return 0; // No HP lost
    }

    /**
     * Direct HP loss, bypasses Guard.
     * @param {number} amount - Amount of HP to lose.
     */
    loseHp(amount) {
         if (amount <= 0) return;
         const actualHpLoss = Math.min(amount, this.currentHp);
         this.currentHp -= actualHpLoss;
         console.log(`Player lost ${actualHpLoss} HP directly. Current HP: ${this.currentHp}`);
         // Trigger onHpLoss effects?
         // this.triggerEffects('onHpLoss', gameManager, { amount: actualHpLoss });
    }

    heal(amount) {
        if (amount <= 0) return;
        const maxHeal = this.maxHp - this.currentHp;
        const healedAmount = Math.min(amount, maxHeal); // Cannot heal above max
        this.currentHp += healedAmount;
        if (healedAmount > 0) {
             console.log(`Player healed ${healedAmount} HP. Current HP: ${this.currentHp}/${this.maxHp}`);
        }
        return healedAmount;
    }

    gainGuard(amount) {
        if (amount <= 0) return;
        // Guard is stored as a simple number
        if (!this.statusEffects[StatusEffects.GUARD]) {
            this.statusEffects[StatusEffects.GUARD] = 0;
        }
        this.statusEffects[StatusEffects.GUARD] += amount;
        console.log(`Player gained ${amount} Guard. Total: ${this.statusEffects[StatusEffects.GUARD]}`);
    }

    // --- Status Effect & Power Management ---

    /**
     * Applies a status effect (buff or debuff).
     * @param {string} effectId - The StatusEffects constant or custom ID.
     * @param {number} amount - Stacks or value of the effect.
     * @param {number} [duration=Infinity] - Turns the effect lasts (Infinity for permanent until removed).
     */
    applyStatus(effectId, amount, duration = Infinity) {
        if (!effectId) return;
        // Handle simple numeric, stackable statuses
        if (effectId === StatusEffects.GUARD || effectId === StatusEffects.STRENGTH /* add others */) {
            if (!this.statusEffects[effectId]) this.statusEffects[effectId] = 0;
            this.statusEffects[effectId] += amount;
            // Clamp Guard if it went negative (e.g. from direct reduction effect)
            if (effectId === StatusEffects.GUARD) this.statusEffects[effectId] = Math.max(0, this.statusEffects[effectId]);
        }
        // Handle duration-based statuses (replace or update)
        else if (duration > 0 || duration === Infinity) {
            // Check if status already exists
            const existingStatus = this.statusEffects[effectId];
            if (existingStatus && typeof existingStatus === 'object') {
                // If exists, add amount and maybe take longer duration? Or just replace? Replace is simpler.
                 existingStatus.amount += amount;
                 existingStatus.duration = duration; // Replace duration
                 // Ensure amount doesn't go below 1? Or allow 0 to mark for removal? Let's keep >= 1
                 if (existingStatus.amount <= 0) delete this.statusEffects[effectId];

            } else if (amount > 0) {
                 // If not existing or was simple number, create/replace with object
                 this.statusEffects[effectId] = { amount: amount, duration: duration };
            }
        } else {
            // If duration is 0 or less, remove the status if it exists
            delete this.statusEffects[effectId];
        }
        console.log(`Player applied status: ${effectId}, Amount: ${amount}, Duration: ${duration}. Current value: ${this.getStatus(effectId)}`);
    }

    /**
     * Gets the current value or amount of a status effect.
     * @param {string} effectId - The StatusEffects constant or custom ID.
     * @returns {number} The value/stacks, or 0 if not present or inactive.
     */
    getStatus(effectId) {
        const status = this.statusEffects[effectId];
        if (!status) return 0;
        // Handle simple numeric values (like Guard, Strength)
        if (typeof status === 'number') return status;
        // Handle object-based statuses (Vulnerable, Weak)
        if (typeof status === 'object' && status.amount !== undefined) {
            // Check duration if it's not infinite
             if (status.duration === Infinity || status.duration > 0) {
                  return status.amount;
             } else {
                  return 0; // Expired duration
             }
        }
        return 0; // Default if structure is unexpected or inactive
    }

    /**
     * Checks if the player has a specific status effect active.
     * @param {string} effectId - The StatusEffects constant or custom ID.
     * @returns {boolean} True if the status effect is present and has amount > 0 and duration > 0 (or infinite).
     */
    hasStatus(effectId) {
         // Just check if getStatus returns a positive value
         return this.getStatus(effectId) > 0;
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
             console.log(`Added new power: ${powerId}`);
         } else {
              console.log(`Updating existing power: ${powerId}`);
         }
         this.powers[powerId].stacks += stacks;
         // Update duration only if the new duration is longer or permanent? Or always replace? Let's replace.
         if (duration === Infinity || (this.powers[powerId].duration !== Infinity && duration > this.powers[powerId].duration)) {
              this.powers[powerId].duration = duration;
         }
         console.log(`Power ${powerId} updated. Stacks: ${this.powers[powerId].stacks}, Duration: ${this.powers[powerId].duration}`);
    }

     hasPower(powerId) {
         return this.powers.hasOwnProperty(powerId) && this.powers[powerId].stacks > 0 && (this.powers[powerId].duration === Infinity || this.powers[powerId].duration > 0);
     }

     getPowerStacks(powerId) {
         return this.hasPower(powerId) ? this.powers[powerId].stacks : 0;
     }


    // --- Momentum & Resonance ---

    generateMomentum(cardElement, gameManager) {
        if (cardElement === Elements.NEUTRAL) {
            // Playing neutral card might reset momentum or just not add to it? Reset seems harsher. Let's just not add.
            // this.resetMomentum();
            console.log("Played Neutral card, momentum unchanged.");
            return;
        }

        let momentumGain = 1;
        // Check relics/powers for bonus momentum gain
        gameManager.currentRelics.forEach(relic => {
             if (relic.effects?.modifyMechanic?.mechanic === 'momentumGain') {
                 // Check if element matches or if it's a global momentum boost
                 if (!relic.effects.modifyMechanic.element || relic.effects.modifyMechanic.element === cardElement) {
                      momentumGain += relic.effects.modifyMechanic.value || 0;
                 }
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
        if (this.resonance.hasOwnProperty(element) && amount > 0) {
            this.resonance[element] += amount;
            console.log(`Player gained ${amount} Resonance for ${element}. Total: ${this.resonance[element]}`);
        }
    }

    getResonance(element) {
        return this.resonance[element] || 0;
    }


    // --- Stat Modification ---

    /**
     * Modifies a base player stat (like maxHp, baseInsight). Usually from relics or events.
     * @param {string} statName - The name of the stat to modify ('maxHp', 'baseInsight', 'maxInsight', 'maxCardsPerTurn').
     * @param {number} value - The amount to add (can be negative).
     */
    modifyStat(statName, value) {
        switch (statName) {
            case 'maxHp':
                const oldMaxHp = this.maxHp;
                this.maxHp = Math.max(1, this.maxHp + value); // Ensure maxHP doesn't go below 1
                // Adjust current HP proportionally, or heal/damage? Heal seems more player-friendly.
                if (value > 0) {
                     this.heal(value); // Heal by the amount max HP increased
                } else {
                    // If max HP decreased, clamp current HP
                    this.currentHp = Math.min(this.currentHp, this.maxHp);
                }
                console.log(`Modified maxHp by ${value}. New maxHp: ${this.maxHp}`);
                break;
            case 'baseInsight':
                this.baseInsight = Math.max(0, this.baseInsight + value); // Ensure base insight isn't negative
                console.log(`Modified baseInsight by ${value}. New baseInsight: ${this.baseInsight}`);
                // Also ensure maxInsight is at least baseInsight
                this.maxInsight = Math.max(this.baseInsight, this.maxInsight);
                break;
            case 'maxInsight':
                 this.maxInsight = Math.max(this.baseInsight, this.maxInsight + value); // Max insight shouldn't be less than base gain
                 console.log(`Modified maxInsight by ${value}. New maxInsight: ${this.maxInsight}`);
                 break;
             case 'maxCardsPerTurn':
                 this.maxCardsPerTurn = Math.max(1, this.maxCardsPerTurn + value);
                 console.log(`Modified maxCardsPerTurn by ${value}. New limit: ${this.maxCardsPerTurn}`);
                 break;
            // Add other modifiable stats if needed (e.g., starting hand size?)
            default:
                console.warn(`Attempted to modify unknown player stat: ${statName}`);
        }
        // Clamp current values just in case they went out of bounds indirectly
        this.currentHp = clamp(this.currentHp, 0, this.maxHp);
        this.currentInsight = clamp(this.currentInsight, 0, this.maxInsight);
    }

     // --- Effect Triggering ---
     // Helper to consolidate triggering effects from relics and powers
     // Context might include { card, target, amount, etc. }
     triggerEffects(triggerType, gameManager, context = {}) {
         if (!gameManager) {
              console.warn(`Cannot trigger effects for '${triggerType}': Missing gameManager reference.`);
              return;
         }

         // 1. Trigger Relic Effects
         gameManager.currentRelics.forEach(relic => {
             // Check simple triggerEffect structure
             if (relic.effects?.triggerEffect?.trigger === triggerType) {
                 // Check condition if present
                 let conditionMet = true;
                 if (relic.effects.triggerEffect.condition) {
                      // Implement condition checks (e.g., 'victory')
                      // This might need info from context or combatManager
                      if (relic.effects.triggerEffect.condition === 'victory' && context.victory !== true) {
                          conditionMet = false;
                      }
                 }
                 if (conditionMet) {
                      this.executeEffect(relic.effects.triggerEffect, 'relic', gameManager, context);
                 }
             }
              // Check for other potential effect structures on relics (e.g., modifyMechanic is handled elsewhere)
         });

         // 2. Trigger Power Effects
         Object.values(this.powers).forEach(powerData => {
             // Power definitions need a standardized way to declare triggers
             const powerTriggers = powerData.definition?.triggers?.[triggerType];
             if (powerTriggers && this.hasPower(powerData.definition.id)) { // Check if power is still active
                 // Execute the effects associated with this trigger
                  console.log(`Triggering power '${powerData.definition.id}' on ${triggerType}`);
                  // Execute associated effects - assumes 'effects' is the standard structure
                   if (powerTriggers.effects) {
                       this.executeEffect({ ...powerTriggers, action: 'applyEffectsObject', effectsObject: powerTriggers.effects }, 'power', gameManager, { ...context, powerStacks: powerData.stacks });
                   }
                   // Handle custom effect IDs if needed
                   else if (powerTriggers.effectId) {
                        // Handle specific hardcoded power logic based on ID
                        this.handleCustomPowerTrigger(powerTriggers.effectId, gameManager, context, powerData);
                   }
             }
         });
     }

    // Helper to execute a specific effect action described in a relic/power trigger
    executeEffect(effect, sourceType, gameManager, context) {
        // console.log(`Executing ${sourceType} effect for trigger '${effect.trigger || 'direct'}': Action '${effect.action}'`); // Can be noisy
        const targetPlayer = this; // Most effects target player unless specified otherwise
        let targetEnemy = context?.target; // Get target enemy from context if available

        switch (effect.action) {
            case 'gainGuard': targetPlayer.gainGuard(effect.value); break;
            case 'gainInsight': targetPlayer.gainInsight(effect.value); break;
            case 'drawCards': targetPlayer.drawCards(effect.value); break;
            case 'gainResonance': targetPlayer.triggerResonance(effect.element, effect.value); break;
            case 'gainCurrency':
                 if (effect.currency === Currency.INSIGHT_SHARDS) {
                     gameManager.gainInsightShards(effect.value);
                 } // Add other currencies later
                 break;
            case 'applyStatus': // Apply status to player by default
                 targetPlayer.applyStatus(effect.status, effect.value || 1, effect.duration || Infinity);
                 break;
             case 'applyStatusToEnemy': // Specific action for applying to enemy target from context
                  if (targetEnemy && targetEnemy.currentHp > 0) {
                       targetEnemy.applyStatus(effect.status, effect.value || 1, effect.duration || Infinity);
                  } else {
                       console.warn(`Effect action 'applyStatusToEnemy' failed: No valid enemy target in context.`);
                  }
                  break;
             case 'applyStatusToRandomEnemy':
                 const livingEnemies = gameManager.combatManager?.enemies.filter(e => e.currentHp > 0) || [];
                 if (livingEnemies.length > 0) {
                      const randomEnemy = getRandomElement(livingEnemies);
                      randomEnemy.applyStatus(effect.status, effect.value || 1, effect.duration || Infinity);
                 }
                 break;
             case 'addCardToDrawPile':
             case 'addCardToDiscard':
             case 'addCardToHand':
                 const cardDef = getCardDefinition(effect.cardId);
                 if (cardDef) {
                     const count = effect.count || 1;
                     for(let i=0; i<count; i++) {
                        const newCard = new Card(cardDef); // Create new instance
                        const pile = effect.action.includes('Draw') ? 'draw' : effect.action.includes('Hand') ? 'hand' : 'discard';
                        targetPlayer.addCardToDeck(newCard, pile); // Add to player's deck
                     }
                 } else {
                      console.warn(`Could not find card definition for '${effect.cardId}' needed by effect action '${effect.action}'.`);
                 }
                 break;
             case 'applyEffectsObject': // Action to execute a nested effects object (used by power triggers)
                  console.log("Executing nested effects object from power trigger...");
                  this.executeCardEffects({ effects: effect.effectsObject }, targetEnemy, false, context?.powerStacks || 1); // Pass power stacks?
                  break;
            // Add more effect actions as needed (e.g., modifyStat, dealDamage, heal)
            default: console.warn(`Unhandled effect action in Player.executeEffect: ${effect.action}`);
        }
    }

    // Handle specific power triggers that aren't simple effects
    handleCustomPowerTrigger(effectId, gameManager, context, powerData) {
        switch (effectId) {
             case 'first_card_free_setup': // From Relationship Anarchy
                  // Mark that the first card should be free this turn
                   console.log("Power Trigger: Setting up 'First Card Free'");
                   this.applyStatus('FirstCardFree', 1, 1); // Apply temporary status for 1 turn
                  break;
             // Add other custom power IDs here
             default:
                  console.warn(`Unhandled custom power trigger ID: ${effectId}`);
        }
    }

     // Simplified version for card effects (might merge with executeEffect later)
     // Context here is card play context
     executeCardEffects(cardEffectsObject, targetEnemy, selfTarget, powerStacksContext = 1) {
         const effects = cardEffectsObject.effects;
         if (!effects) {
             console.warn("executeCardEffects called with object lacking 'effects' property:", cardEffectsObject);
             return;
         }

         const playerTarget = selfTarget ? this.player : null; // Determine player target

         // --- Primary Effects ---
         if (effects.dealBruise) {
             const effect = effects.dealBruise;
              // Scale damage by power stacks? Only if effect specifies. Example: { amount: 2, scaleWithPower: true }
             let baseAmount = effect.amount //* (effect.scaleWithPower ? powerStacksContext : 1);
             baseAmount += this.getStatus(StatusEffects.STRENGTH); // Add player Strength ONLY IF effect targets enemy? Needs clarity.

             let target = (effect.target === 'enemy' && targetEnemy) ? targetEnemy : null;
             if (target) {
                 gameManager.combatManager.applyDamageToEnemy(target, baseAmount, cardEffectsObject.element || Elements.NEUTRAL); // Use CombatManager's helper
             } else if (effect.target === 'all_enemies') {
                  gameManager.combatManager.enemies.forEach(enemy => {
                       if (enemy.currentHp > 0) gameManager.combatManager.applyDamageToEnemy(enemy, baseAmount, cardEffectsObject.element || Elements.NEUTRAL);
                  });
             } else if (effect.target === 'player') {
                  // Should player take Bruise directly or use loseHp? Use takeBruise for consistency.
                  this.takeBruise(baseAmount);
             }
         }
         if (effects.gainGuard) {
              const effect = effects.gainGuard;
              let amount = effect.amount; // + potential buffs based on resonance/momentum?
              // Check context for resonance/momentum bonuses if needed
              this.gainGuard(amount);
         }
         if (effects.drawCards) {
              this.drawCards(effects.drawCards);
         }
          if (effects.gainInsight) {
              this.gainInsight(effects.gainInsight);
          }
          if (effects.applyStatus) {
              const effect = effects.applyStatus;
              let target = (effect.target === 'enemy' && targetEnemy) ? targetEnemy : (effect.target === 'player' || selfTarget) ? this : null;

              if (target) {
                   target.applyStatus(effect.status, effect.amount || 1, effect.duration || 1);
              } else if (effect.target === 'all_enemies') {
                   gameManager.combatManager.enemies.forEach(enemy => {
                       if(enemy.currentHp > 0) enemy.applyStatus(effect.status, effect.amount || 1, effect.duration || 1);
                   });
              } else if (effect.target === 'random_enemy') {
                   const livingEnemies = gameManager.combatManager?.enemies.filter(e => e.currentHp > 0) || [];
                   if (livingEnemies.length > 0) {
                        const randomEnemy = getRandomElement(livingEnemies);
                        randomEnemy.applyStatus(effect.status, effect.amount || 1, effect.duration || 1);
                   }
              }
          }
          if (effects.applyPower) {
               // Assume power card definition is available in context if needed, or use the played card's def
               const powerDef = cardEffectsObject.baseDefinition || this.powers[effects.applyPower.effectId]?.definition;
               if (powerDef) {
                    this.addPower(powerDef, effects.applyPower.stacks || 1, effects.applyPower.permanent ? Infinity : effects.applyPower.duration || Infinity);
               } else {
                    console.warn(`Cannot apply power: Definition not found for effectId '${effects.applyPower.effectId}'`);
               }
          }
           // Add handlers for other effects like addCardToDiscard, heal, loseHp etc.
            if (effects.addCardToDiscard || effects.addCardToHand || effects.addCardToDrawPile) {
                const effect = effects.addCardToDiscard || effects.addCardToHand || effects.addCardToDrawPile;
                const pile = effects.addCardToDrawPile ? 'draw' : effects.addCardToHand ? 'hand' : 'discard';
                 const cardDef = getCardDefinition(effect.cardId);
                 if (cardDef) {
                     const count = effect.count || 1;
                     for(let i=0; i<count; i++) {
                        const newCard = new Card(cardDef); // Create new instance
                        this.addCardToDeck(newCard, pile); // Add to player's deck
                     }
                 } else {
                      console.warn(`Could not find card definition for '${effect.cardId}' needed by card effect.`);
                 }
            }
            if (effects.heal) {
                 this.heal(effects.heal.amount);
            }

     }

}
