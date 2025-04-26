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
        this.statusEffects = {}; // e.g., { [StatusEffects.GUARD]: 10, [StatusEffects.VULNERABLE]: {amount:1, duration:1}, Strength: 0 }
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
            if (element !== Elements.NEUTRAL) { res[element] = 0; }
        });
        return res;
    }

    // --- Deck Initialization ---
    initializeDeck(cardIds) {
        this.masterDeck = []; this.drawPile = []; this.hand = []; this.discardPile = []; this.exhaustPile = [];
        cardIds.forEach(id => {
            const definition = getCardDefinition(id);
            if (definition) { this.masterDeck.push(new Card(definition)); }
            else { console.warn(`Card definition missing for ID '${id}' during deck init.`); }
        });
        this.drawPile = [...this.masterDeck]; shuffleArray(this.drawPile);
        console.log(`Player deck initialized with ${this.masterDeck.length} cards.`);
    }

    addCardToDeck(cardInstance, pile = 'discard') {
        if (!cardInstance || !(cardInstance instanceof Card)) { console.error("Invalid card instance added."); return; }
        if (!this.masterDeck.some(c => c.instanceId === cardInstance.instanceId)) { this.masterDeck.push(cardInstance); }
        switch (pile) {
            case 'draw': this.drawPile.push(cardInstance); shuffleArray(this.drawPile); break; // Shuffle in? Or add bottom? Add bottom is simpler: // this.drawPile.unshift(cardInstance);
            case 'hand': this.hand.push(cardInstance); this.triggerEffects('onCardDraw', null, { card: cardInstance }); break;
            default: this.discardPile.push(cardInstance); break;
        }
        // console.log(`Added card '${cardInstance.name}' to ${pile}. Master: ${this.masterDeck.length}`);
    }

    removeCardFromDeck(cardInstanceToRemove) {
        if (!cardInstanceToRemove || !cardInstanceToRemove.instanceId) return false;
        const instanceId = cardInstanceToRemove.instanceId; let foundAndRemoved = false;
        const masterIndex = this.masterDeck.findIndex(card => card.instanceId === instanceId);
        if (masterIndex > -1) { this.masterDeck.splice(masterIndex, 1); foundAndRemoved = true; }
        else { console.warn(`Card instance ${instanceId} not in master deck.`); }
        [this.drawPile, this.hand, this.discardPile].forEach(pile => {
            const pileIndex = pile.findIndex(card => card.instanceId === instanceId);
            if (pileIndex > -1) { pile.splice(pileIndex, 1); foundAndRemoved = true; } });
        if (foundAndRemoved) { console.log(`Removed card '${cardInstanceToRemove.name}'. Master: ${this.masterDeck.length}`); }
        else { console.warn(`Could not find card '${cardInstanceToRemove.name}' in active piles.`); }
        return foundAndRemoved;
    }

    // --- Combat Turn Management ---
    startTurn(gameManager) {
        this.resetTemporaryStatuses(); this.updateStatusDurations(); this.decayResonance();
        this.currentInsight = this.calculateTurnInsightGain(gameManager);
        this.cardsPlayedThisTurn = 0;
        this.triggerEffects('onTurnStart', gameManager);
        this.drawCards(CARDS_PER_TURN_DRAW);
    }

    endTurn(gameManager) {
        this.triggerEffects('onTurnEnd', gameManager);
        this.discardHand(); this.resetMomentum();
        [...this.drawPile, ...this.hand, ...this.discardPile, ...this.exhaustPile].forEach(card => card.resetTemporaryMods());
    }

    calculateTurnInsightGain(gameManager) {
        let insightGain = this.baseInsight;
        gameManager?.currentRelics.forEach(relic => { if (relic.effects?.modifyStat?.stat === 'baseInsight') { insightGain += relic.effects.modifyStat.value; } });
        // Check Powers (add specific power logic here if needed)
        this.hand.forEach(card => { if (card.effects?.passiveInHand?.effectId === 'reduceInsightGain') { insightGain -= card.effects.passiveInHand.value || 1; } });
        if (this.hasStatus('InsightDown')) { insightGain -= this.getStatus('InsightDown'); }
        return Math.max(0, insightGain);
    }

    resetTemporaryStatuses() {
        this.statusEffects[StatusEffects.GUARD] = 0;
        delete this.statusEffects['CardPlayLimit'];
        delete this.statusEffects['FirstCardFree']; // Clear this status
    }

    updateStatusDurations() {
        for (const key in this.statusEffects) {
            if (this.statusEffects[key] && typeof this.statusEffects[key] === 'object' && this.statusEffects[key].duration !== undefined) {
                const status = this.statusEffects[key];
                if (status.duration !== Infinity) { status.duration--; if (status.duration <= 0) { console.log(`Player status '${key}' expired.`); delete this.statusEffects[key]; } } }
             else if (key.startsWith(StatusEffects.FREEZE + '_')) { // Handle specific freeze logic
                  const freezeStatus = this.statusEffects[key];
                  if (freezeStatus && freezeStatus.duration !== Infinity) { freezeStatus.duration--; if (freezeStatus.duration <= 0) { console.log(`Player status '${key}' expired.`); delete this.statusEffects[key]; } } } }
        for (const powerId in this.powers) {
             const power = this.powers[powerId];
             if (power && power.duration !== undefined && power.duration !== Infinity) { power.duration--; if (power.duration <= 0) { console.log(`Power '${powerId}' expired.`); delete this.powers[powerId]; } } }
    }

    decayResonance() { for(const element in this.resonance) { if (this.resonance[element] > 0) { this.resonance[element] = Math.max(0, this.resonance[element] - RESONANCE_DECAY_PER_TURN); } } }

    // --- Card Manipulation ---
    drawCards(amount) {
        const drawnCards = [];
        for (let i = 0; i < amount; i++) {
            if (this.drawPile.length === 0) { if (this.discardPile.length === 0) break; this.shuffleDiscardIntoDraw(); }
            if (this.drawPile.length > 0) {
                const card = this.drawPile.pop();
                if (card) { this.hand.push(card); drawnCards.push(card); }
                else { console.warn("Popped undefined card?"); } } }
        console.log(`Drew ${drawnCards.length}. Hand: ${this.hand.length}`); return drawnCards;
    }

    discardHand() {
        const toDiscard = []; const toKeep = [];
        for (let i = this.hand.length - 1; i >= 0; i--) {
             const card = this.hand[i];
             if (card.hasKeyword(StatusEffects.RETAIN)) { toKeep.push(card); }
             else { toDiscard.push(card); this.discardPile.push(card); } }
        this.hand = toKeep.reverse();
        console.log(`Discarded ${toDiscard.length}. Kept ${toKeep.length}. Discard: ${this.discardPile.length}`);
        for (let i = this.hand.length - 1; i >= 0; i--) {
              const card = this.hand[i];
              if (card.hasKeyword(StatusEffects.ETHEREAL)) { this.exhaustCard(card, 'hand'); console.log(`Ethereal '${card.name}' exhausted.`); } }
    }

    moveCardFromHand(cardInstance, destinationPile) {
        const index = this.hand.findIndex(card => card.instanceId === cardInstance.instanceId);
        if (index > -1) { const card = this.hand.splice(index, 1)[0]; destinationPile.push(card); return true; }
        console.warn(`Card '${cardInstance.name}' not in hand.`); return false;
    }

    exhaustCard(cardInstance, sourceHint = null) {
        let found = false; const instanceId = cardInstance.instanceId;
        if (sourceHint === 'hand') { found = this.moveCardFromHand(cardInstance, this.exhaustPile); }
        else if (sourceHint === 'draw') { const i = this.drawPile.findIndex(c => c.instanceId === instanceId); if (i > -1) { this.exhaustPile.push(this.drawPile.splice(i, 1)[0]); found = true; } }
        else if (sourceHint === 'discard') { const i = this.discardPile.findIndex(c => c.instanceId === instanceId); if (i > -1) { this.exhaustPile.push(this.discardPile.splice(i, 1)[0]); found = true; } }
        if (!found) { if (this.moveCardFromHand(cardInstance, this.exhaustPile)) found = true; }
        if (!found) { const i = this.drawPile.findIndex(c => c.instanceId === instanceId); if (i > -1) { this.exhaustPile.push(this.drawPile.splice(i, 1)[0]); found = true; } }
        if (!found) { const i = this.discardPile.findIndex(c => c.instanceId === instanceId); if (i > -1) { this.exhaustPile.push(this.discardPile.splice(i, 1)[0]); found = true; } }
        if (found) { console.log(`Exhausted '${cardInstance.name}'.`); } else { console.warn(`Card '${cardInstance.name}' not found for exhaust.`); } return found;
    }

    shuffleDiscardIntoDraw() {
        console.log(`Shuffling ${this.discardPile.length} cards into draw.`);
        this.drawPile.push(...this.discardPile); this.discardPile = []; shuffleArray(this.drawPile);
    }

    // --- Resource Management ---
    canAfford(cost) { const c = (cost === null) ? 0 : cost; return this.currentInsight >= c; }
    spendInsight(amount) { const a = (amount === null) ? 0 : amount; if (this.canAfford(a)) { this.currentInsight -= a; return true; } return false; }
    gainInsight(amount) { if(amount <= 0) return; this.currentInsight = Math.min(this.maxInsight, this.currentInsight + amount); console.log(`Gained ${amount} Insight. Current: ${this.currentInsight}`); }
    loseInsight(amount) { if(amount <= 0) return; this.currentInsight = Math.max(0, this.currentInsight - amount); console.log(`Lost ${amount} Insight. Current: ${this.currentInsight}`); }

    // --- Health & Guard ---
    takeBruise(amount) {
        if (amount <= 0) return 0; let damage = amount;
        if (this.hasStatus(StatusEffects.VULNERABLE)) { damage = Math.floor(damage * VULNERABLE_MULTIPLIER); console.log(`Player Vulnerable -> ${damage} incoming`); }
        const guard = this.getStatus(StatusEffects.GUARD);
        if (guard > 0) { const blocked = Math.min(guard, damage); this.statusEffects[StatusEffects.GUARD] -= blocked; damage -= blocked; console.log(`Player blocked ${blocked}. Guard: ${this.getStatus(StatusEffects.GUARD)}`); }
        if (damage > 0) { const hpLoss = Math.min(damage, this.currentHp); this.currentHp -= hpLoss; console.log(`Player took ${hpLoss} Bruise. HP: ${this.currentHp}/${this.maxHp}`); return hpLoss; }
        return 0;
    }
    loseHp(amount) { if (amount <= 0) return; const hpLoss = Math.min(amount, this.currentHp); this.currentHp -= hpLoss; console.log(`Player lost ${hpLoss} HP. HP: ${this.currentHp}/${this.maxHp}`); }
    heal(amount) { if (amount <= 0) return 0; const maxHeal = this.maxHp - this.currentHp; const healed = Math.min(amount, maxHeal); this.currentHp += healed; if (healed > 0) console.log(`Player healed ${healed} HP. HP: ${this.currentHp}/${this.maxHp}`); return healed; }
    gainGuard(amount) { if (amount <= 0) return; if (!this.statusEffects[StatusEffects.GUARD]) { this.statusEffects[StatusEffects.GUARD] = 0; } this.statusEffects[StatusEffects.GUARD] += amount; console.log(`Player gained ${amount} Guard. Total: ${this.statusEffects[StatusEffects.GUARD]}`); }

    // --- Status Effect & Power Management ---
    applyStatus(effectId, amount, duration = Infinity) {
        if (!effectId) return;
        if (effectId === StatusEffects.GUARD || effectId === StatusEffects.STRENGTH) { // Simple numeric statuses
            if (!this.statusEffects[effectId]) this.statusEffects[effectId] = 0;
            this.statusEffects[effectId] += amount;
            if (effectId === StatusEffects.GUARD) this.statusEffects[effectId] = Math.max(0, this.statusEffects[effectId]);
        } else if (duration > 0 || duration === Infinity) { // Duration-based statuses
            const existing = this.statusEffects[effectId];
            if (existing && typeof existing === 'object') {
                 existing.amount += amount; existing.duration = duration; // Replace/update existing
                 if (existing.amount <= 0) delete this.statusEffects[effectId]; // Remove if amount drops to 0
            } else if (amount > 0) {
                 this.statusEffects[effectId] = { amount: amount, duration: duration }; // Create new
            }
        } else { delete this.statusEffects[effectId]; } // Remove if duration <= 0
        // console.log(`Player status ${effectId}: ${amount} (${duration}t). Current: ${this.getStatus(effectId)}`);
    }

    getStatus(effectId) {
        const status = this.statusEffects[effectId]; if (!status) return 0;
        if (typeof status === 'number') return status;
        if (typeof status === 'object' && status.amount !== undefined) { return (status.duration === Infinity || status.duration > 0) ? status.amount : 0; } return 0;
    }
    hasStatus(effectId) { return this.getStatus(effectId) > 0; }

    addPower(powerDef, stacks = 1, duration = Infinity) {
        const powerId = powerDef.id;
        if (!this.powers[powerId]) { this.powers[powerId] = { definition: powerDef, stacks: 0, duration: duration }; }
        this.powers[powerId].stacks += stacks;
        if (duration === Infinity || (this.powers[powerId].duration !== Infinity && duration > this.powers[powerId].duration)) { this.powers[powerId].duration = duration; }
        console.log(`Power ${powerId} updated. Stacks: ${this.powers[powerId].stacks}`);
    }
    hasPower(powerId) { return this.powers.hasOwnProperty(powerId) && this.powers[powerId].stacks > 0 && (this.powers[powerId].duration === Infinity || this.powers[powerId].duration > 0); }
    getPowerStacks(powerId) { return this.hasPower(powerId) ? this.powers[powerId].stacks : 0; }

    // --- Momentum & Resonance ---
    generateMomentum(cardElement, gameManager) {
        if (cardElement === Elements.NEUTRAL) { /* console.log("Neutral card, momentum unchanged."); */ return; }
        let gain = 1;
        gameManager?.currentRelics.forEach(relic => { if (relic.effects?.modifyMechanic?.mechanic === 'momentumGain' && (!relic.effects.modifyMechanic.element || relic.effects.modifyMechanic.element === cardElement)) { gain += relic.effects.modifyMechanic.value || 0; } });
        if (this.lastElementPlayed === cardElement) { this.momentum += gain; } else { this.momentum = gain; }
        console.log(`Momentum (${cardElement}): ${this.momentum} (+${gain})`); this.lastElementPlayed = cardElement;
    }
    resetMomentum() { this.momentum = 0; this.lastElementPlayed = Elements.NEUTRAL; }
    triggerResonance(element, amount) { if (this.resonance.hasOwnProperty(element) && amount > 0) { this.resonance[element] += amount; console.log(`Player Res(${element}): ${this.resonance[element]} (+${amount})`); } }
    getResonance(element) { return this.resonance[element] || 0; }

    // --- Stat Modification ---
    modifyStat(statName, value) {
        switch (statName) {
            case 'maxHp': const oldMax = this.maxHp; this.maxHp = Math.max(1, this.maxHp + value); if (value > 0) { this.heal(value); } else { this.currentHp = Math.min(this.currentHp, this.maxHp); } console.log(`maxHp ${oldMax} -> ${this.maxHp}`); break;
            case 'baseInsight': this.baseInsight = Math.max(0, this.baseInsight + value); this.maxInsight = Math.max(this.baseInsight, this.maxInsight); console.log(`baseInsight -> ${this.baseInsight}`); break;
            case 'maxInsight': this.maxInsight = Math.max(this.baseInsight, this.maxInsight + value); console.log(`maxInsight -> ${this.maxInsight}`); break;
            case 'maxCardsPerTurn': this.maxCardsPerTurn = Math.max(1, this.maxCardsPerTurn + value); console.log(`maxCardsPerTurn -> ${this.maxCardsPerTurn}`); break;
            default: console.warn(`Unknown stat modify: ${statName}`);
        }
        this.currentHp = clamp(this.currentHp, 0, this.maxHp); this.currentInsight = clamp(this.currentInsight, 0, this.maxInsight);
    }

     // --- Effect Triggering ---
     triggerEffects(triggerType, gameManager, context = {}) {
         if (!gameManager) { console.warn(`Cannot trigger effects for '${triggerType}': Missing gameManager.`); return; }
         // 1. Relic Effects
         gameManager.currentRelics.forEach(relic => { if (relic.effects?.triggerEffect?.trigger === triggerType) { let conditionMet = true; if (relic.effects.triggerEffect.condition) { /* Implement condition checks */ if (relic.effects.triggerEffect.condition === 'victory' && context.victory !== true) conditionMet = false; } if (conditionMet) { this.executeEffect(relic.effects.triggerEffect, 'relic', gameManager, context); } } });
         // 2. Power Effects
         Object.values(this.powers).forEach(powerData => { const triggers = powerData.definition?.triggers?.[triggerType]; if (triggers && this.hasPower(powerData.definition.id)) { /* console.log(`Triggering power '${powerData.definition.id}' on ${triggerType}`); */ if (triggers.effects) { this.executeEffect({ ...triggers, action: 'applyEffectsObject', effectsObject: triggers.effects }, 'power', gameManager, { ...context, powerStacks: powerData.stacks }); } else if (triggers.effectId) { this.handleCustomPowerTrigger(triggers.effectId, gameManager, context, powerData); } } });
     }

    executeEffect(effect, sourceType, gameManager, context) {
        const targetPlayer = this; let targetEnemy = context?.target;
        switch (effect.action) {
            case 'gainGuard': targetPlayer.gainGuard(effect.value); break;
            case 'gainInsight': targetPlayer.gainInsight(effect.value); break;
            case 'drawCards': targetPlayer.drawCards(effect.value); break;
            case 'gainResonance': targetPlayer.triggerResonance(effect.element, effect.value); break;
            case 'gainCurrency': if (effect.currency === Currency.INSIGHT_SHARDS) { gameManager.gainInsightShards(effect.value); } break;
            case 'applyStatus': targetPlayer.applyStatus(effect.status, effect.value || 1, effect.duration || Infinity); break;
            case 'applyStatusToEnemy': if (targetEnemy?.currentHp > 0) { targetEnemy.applyStatus(effect.status, effect.value || 1, effect.duration || Infinity); } break;
            case 'applyStatusToRandomEnemy': const living = gameManager.combatManager?.enemies.filter(e => e.currentHp > 0) || []; if (living.length > 0) { getRandomElement(living).applyStatus(effect.status, effect.value || 1, effect.duration || Infinity); } break;
            case 'addCardToDrawPile': case 'addCardToDiscard': case 'addCardToHand':
                 const cardDef = getCardDefinition(effect.cardId); if (cardDef) { const count = effect.count || 1; const pile = effect.action.includes('Draw') ? 'draw' : effect.action.includes('Hand') ? 'hand' : 'discard'; for(let i=0; i<count; i++) { targetPlayer.addCardToDeck(new Card(cardDef), pile); } } else { console.warn(`Def missing for '${effect.cardId}'`); } break;
            case 'applyEffectsObject': console.log("Executing nested effects..."); this.executeCardEffects({ effects: effect.effectsObject }, targetEnemy, false, context?.powerStacks || 1, gameManager); break; // Pass gameManager here
            default: console.warn(`Unhandled effect action: ${effect.action}`);
        }
    }

    handleCustomPowerTrigger(effectId, gameManager, context, powerData) {
        switch (effectId) { case 'first_card_free_setup': this.applyStatus('FirstCardFree', 1, 1); break; default: console.warn(`Unhandled custom power trigger ID: ${effectId}`); }
    }

     // Execute effects specifically from a played card
     executeCardEffects(cardInstance, targetEnemy, selfTarget, gameManager) { // Added gameManager param
         if (!cardInstance || !cardInstance.effects) return;
         const effects = cardInstance.effects; // Use effects from the potentially upgraded card instance
         const playerTarget = selfTarget ? this : null;
         const element = cardInstance.element; // Get element from the instance

         // --- Primary Effects ---
         if (effects.dealBruise) {
             const effect = effects.dealBruise;
             let baseAmount = effect.amount + this.getStatus(StatusEffects.STRENGTH); // Add player strength
             let target = (effect.target === 'enemy' && targetEnemy) ? targetEnemy : null;
             if (target) { gameManager.combatManager.applyDamageToEnemy(target, baseAmount, element); } // Use combatManager helper
             else if (effect.target === 'all_enemies') { gameManager.combatManager.enemies.forEach(e => { if (e.currentHp > 0) gameManager.combatManager.applyDamageToEnemy(e, baseAmount, element); }); }
             else if (effect.target === 'player') { this.takeBruise(baseAmount); }
         }
         if (effects.gainGuard) { this.gainGuard(effects.gainGuard.amount); }
         if (effects.drawCards) { this.drawCards(effects.drawCards); }
         if (effects.gainInsight) { this.gainInsight(effects.gainInsight); }
         if (effects.applyStatus) {
             const effect = effects.applyStatus; let target = (effect.target === 'enemy' && targetEnemy) ? targetEnemy : (effect.target === 'player' || selfTarget) ? this : null;
             if (target) { target.applyStatus(effect.status, effect.amount || 1, effect.duration || 1); }
             else if (effect.target === 'all_enemies') { gameManager.combatManager.enemies.forEach(e => { if(e.currentHp > 0) e.applyStatus(effect.status, effect.amount || 1, effect.duration || 1); }); }
             else if (effect.target === 'random_enemy') { const living = gameManager.combatManager?.enemies.filter(e => e.currentHp > 0) || []; if (living.length > 0) { getRandomElement(living).applyStatus(effect.status, effect.amount || 1, effect.duration || 1); } }
         }
         if (effects.applyPower) {
             const powerDef = cardInstance.baseDefinition; // Power effects applied based on the *base* card definition
             if (powerDef) { this.addPower(powerDef, effects.applyPower.stacks || 1, effects.applyPower.permanent ? Infinity : effects.applyPower.duration || Infinity); }
             else { console.warn(`Cannot apply power: Definition not found for effectId '${effects.applyPower.effectId}'`); }
         }
         if (effects.addCardToDiscard || effects.addCardToHand || effects.addCardToDrawPile) {
             const effect = effects.addCardToDiscard || effects.addCardToHand || effects.addCardToDrawPile;
             const pile = effects.addCardToDrawPile ? 'draw' : effects.addCardToHand ? 'hand' : 'discard';
             const cardDef = getCardDefinition(effect.cardId); if (cardDef) { const count = effect.count || 1; for(let i=0; i<count; i++) { this.addCardToDeck(new Card(cardDef), pile); } } else { console.warn(`Card def missing for '${effect.cardId}'`); }
         }
         if (effects.heal) { this.heal(effects.heal.amount); }

        // --- Momentum Effects ---
        if (cardInstance.momentumEffect && this.momentum >= cardInstance.momentumEffect.threshold) {
            console.log(`Triggering Momentum effect for ${cardInstance.name}`);
            this.executeCardEffects({ effects: cardInstance.momentumEffect.effects, element: element }, targetEnemy, selfTarget, gameManager); // Pass element
        }
        // --- Resonance Effects ---
        if (cardInstance.resonanceEffect) {
             const requiredElement = cardInstance.resonanceEffect.element;
             if (this.getResonance(requiredElement) > 0) {
                 console.log(`Triggering Resonance bonus effect for ${cardInstance.name} (requires ${requiredElement})`);
                  this.executeCardEffects({ effects: cardInstance.resonanceEffect.effects, element: element }, targetEnemy, selfTarget, gameManager); // Pass element
             }
        }
     }

} // End Player Class
