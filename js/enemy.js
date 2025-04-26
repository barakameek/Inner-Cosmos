// js/enemy.js

class Enemy {
    /**
     * Creates an instance of an enemy for combat.
     * @param {string} enemyId - The ID of the enemy definition from enemyData.js.
     * @param {number} positionX - X coordinate for rendering center base.
     * @param {number} positionY - Y coordinate for rendering center base.
     */
    constructor(enemyId, positionX, positionY) {
        this.definition = getEnemyDefinition(enemyId);
        if (!this.definition) {
            console.error(`Definition missing for ID '${enemyId}'. Fallback.`);
            // Create a minimal fallback definition
            this.definition = new EnemyDefinition({
                id: 'fallback_error',
                name: 'Error Foe',
                archetype: EnemyArchetype.DOUBT, // Need a valid archetype for weakness/resistance lookup
                maxHp: 10,
                moveSet: [{ id: 'fallback_attack', intentType: 'Attack', damage: 1, description: "Attack for 1 Bruise", weight: 1 }]
            });
             // Ensure fallback has weakness/resistance derived
             if (!this.definition.weakness) this.definition.weakness = getElementWeakness(this.definition.archetype);
             if (!this.definition.resistance) this.definition.resistance = getElementResistance(this.definition.archetype);
        }

        this.instanceId = uuidv4(); // Unique ID for this specific instance
        this.id = this.definition.id; // Base definition ID
        this.name = this.definition.name;
        this.archetype = this.definition.archetype;
        this.maxHp = this.definition.maxHp;
        this.currentHp = this.maxHp;
        this.weakness = this.definition.weakness;
        this.resistance = this.definition.resistance;

        this.position = { x: positionX, y: positionY }; // Center-bottom position

        // Combat State
        this.statusEffects = {}; // e.g., { [StatusEffects.GUARD]: 0, [StatusEffects.VULNERABLE]: {amount:1, duration:1}, Strength: 2 }
        this.currentMove = null; // The EnemyMove object chosen for the current turn (intent)
        this.moveHistory = []; // Track recent move IDs for AI patterns/cooldowns
        this.moveCooldowns = {}; // Track cooldowns for specific move IDs { moveId: turnsRemaining }
        this.currentPhase = 1; // For multi-phase bosses
        // Store the original moveset for phase resets if needed (though phase change logic currently replaces definition.moveSet)
        this.originalMoveSet = [...this.definition.moveSet];

        // --- Rendering properties ---
        this.width = 100; // Example dimensions, adjust based on art
        this.height = 150;
        this.intentIcon = null; // Stores the icon string for the current intent
        this.intentValue = null; // Stores damage/block value for intent display
        this.isHovered = false; // For UI feedback

        console.log(`Enemy instance: ${this.name} (ID: ${this.id}, Instance: ${this.instanceId.substring(0,4)})`);
    }

    // --- Combat Turn Management ---
    startTurn(combatManager) {
        // Called at the START of the enemy's turn (before acting)
        this.updateStatusDurations();
        this.updateCooldowns();
        // Reset Guard at start of turn? Usually keep until broken.
        // this.statusEffects[StatusEffects.GUARD] = 0;

        // Trigger start-of-turn effects (if any defined in specialMechanics)
        if (this.definition.specialMechanics?.onTurnStart) {
            // Execute defined actions
             console.log(`${this.name} triggering onTurnStart effects (Not Implemented)`);
        }
    }
    endTurn(combatManager) {
         // Called at the END of the enemy's turn (after acting)
         // Usually less common for enemies to have end-of-turn effects
         if (this.definition.specialMechanics?.onTurnEnd) {
            console.log(`${this.name} triggering onTurnEnd effects (Not Implemented)`);
             // Execute defined actions
         }
    }


    /**
     * Choose the next move based on the move set, weights, cooldowns, and HP thresholds.
     * This determines the *intent* for the next turn. Called BEFORE the enemy acts.
     */
    chooseNextMove(turnCount) { // Pass turn count for initial cooldown checks
        let currentMoveSet = this.definition.moveSet; // Use the active moveset (might change by phase)

        let availableMoves = currentMoveSet.filter(move => {
            // Check HP thresholds
            const hpPercent = this.currentHp / this.maxHp * 100;
            if (move.minHpThreshold !== undefined && hpPercent >= move.minHpThreshold) return false; // Use >= for "below threshold"
            if (move.maxHpThreshold !== undefined && hpPercent < move.maxHpThreshold) return false; // Use < for "above threshold"

            // Check cooldowns
            if (this.moveCooldowns[move.id] && this.moveCooldowns[move.id] > 0) return false;

            // Check initial cooldown (only applies on turn 1)
            if (move.initialCooldown && turnCount === 1) return false;

            // Add other conditions (e.g., require player debuff, require self buff) if needed later

            return true;
        });

        if (availableMoves.length === 0) {
            console.warn(`Enemy ${this.name} has no available moves! Fallback.`);
            // Use a basic attack or defend as fallback
            const fallbackAttack = currentMoveSet.find(m => m.intentType === 'Attack');
            if (fallbackAttack) {
                 availableMoves.push(fallbackAttack);
            } else {
                 // Absolute fallback: Wait/Defend weakly
                 availableMoves.push({ id: 'fb_wait', intentType: 'Defend', block: 1, description: "Waiting...", weight: 1 });
            }
        }

        // Calculate total weight
        const totalWeight = availableMoves.reduce((sum, move) => sum + (move.weight || 1), 0);
        // Handle zero total weight case
        if (totalWeight <= 0) {
             console.warn(`Enemy ${this.name} available moves have zero total weight. Choosing first available.`);
             this.currentMove = availableMoves[0];
        } else {
            let randomRoll = Math.random() * totalWeight;
            // Select move based on weight
            let chosenMove = availableMoves[availableMoves.length - 1]; // Default to last if roll somehow fails
            for (const move of availableMoves) {
                const weight = move.weight || 1;
                if (randomRoll < weight) {
                    chosenMove = move;
                    break;
                }
                randomRoll -= weight;
            }
            this.currentMove = chosenMove;
        }


        this.moveHistory.push(this.currentMove.id); // Track history
        // Limit history size if needed: if (this.moveHistory.length > 5) this.moveHistory.shift();
        this.setIntentDisplay(); // Update display values for UI
        // console.log(`${this.name} intends to use: ${this.currentMove.id} (${this.currentMove.intentType})`);
    }

    /** Updates intent icon and value based on the currentMove */
    setIntentDisplay() {
        if (!this.currentMove) { this.intentIcon = null; this.intentValue = null; return; }
        const move = this.currentMove; this.intentValue = null;
        switch (move.intentType) { case 'Attack': this.intentIcon = '⚔️'; this.intentValue = this.calculateIntentDamage(); break; case 'Defend': this.intentIcon = '🛡️'; this.intentValue = move.block || null; break; case 'Debuff': this.intentIcon = '⬇️'; if (move.applyStatus?.amount > 1) this.intentValue = move.applyStatus.amount; break; case 'Buff': this.intentIcon = '⬆️'; if (move.applyStatus?.amount > 1) this.intentValue = move.applyStatus.amount; break; case 'Dilemma': this.intentIcon = '❓'; break; case 'AttackDebuff': this.intentIcon = '⚔️⬇️'; this.intentValue = this.calculateIntentDamage(); break; default: this.intentIcon = '✨'; break; }
    }

    calculateIntentDamage() {
        if (!this.currentMove || !this.currentMove.damage) return 0; let dmg = this.currentMove.damage; dmg += this.getStatus(StatusEffects.STRENGTH);
        if (this.currentMove.effectsModifiers?.condition === 'hp_below_50' && (this.currentHp / this.maxHp) < 0.5) { dmg += this.currentMove.effectsModifiers.damageBonus || 0; } return Math.max(0, Math.floor(dmg));
    }

    executeMove(player, combatManager) { // --- Executes the CURRENT selected move ---
        if (!this.currentMove) { console.log(`${this.name} skips turn.`); return; }
        const move = this.currentMove; console.log(`${this.name} executes: ${move.id} (${move.intentType})`);
        // --- Damage ---
        const dealDamage = this.calculateIntentDamage(); if (dealDamage > 0) { let finalDamage = dealDamage; if (player.hasStatus(StatusEffects.WEAK)) { finalDamage = Math.floor(finalDamage * WEAK_MULTIPLIER); console.log(`Player Weak -> ${finalDamage} incoming`); } player.takeBruise(finalDamage); }
        // --- Block ---
        if (move.block) { this.applyStatus(StatusEffects.GUARD, move.block); }
        // --- Apply Status ---
        if (move.applyStatus) { const sInfo = move.applyStatus; const target = (sInfo.target === 'player') ? player : this; if (target) { if(sInfo.status === StatusEffects.FREEZE && sInfo.element) { target.applyStatus(sInfo.status + '_' + sInfo.element, sInfo.amount || 1, sInfo.duration || 1); } else { target.applyStatus(sInfo.status, sInfo.amount || 1, sInfo.duration || 1); } } }
        // --- Trigger Dilemma ---
        if (move.intentType === 'Dilemma' && move.dilemma) { combatManager.triggerDilemma(move.dilemma, this); }
        // --- Special Effects ---
        if (move.effects?.addCardToDrawPile || move.effects?.addCardToDiscard || move.effects?.addCardToHand) { const effect = move.effects.addCardToDrawPile || move.effects.addCardToDiscard || move.effects.addCardToHand; const pile = move.effects.addCardToDrawPile ? 'draw' : move.effects.addCardToHand ? 'hand' : 'discard'; const cardDef = getCardDefinition(effect.cardId); if (cardDef) { const count = effect.count || 1; console.log(`Adding ${count}x '${effect.cardId}' to player's ${pile}.`); for(let i=0; i<count; i++) { player.addCardToDeck(new Card(cardDef), pile); } } else { console.warn(`Card def missing for '${effect.cardId}'`); } }
        // --- Set Cooldown ---
        if (move.cooldown) { this.moveCooldowns[move.id] = move.cooldown + 1; } // +1 because it decrements at start of next turn
        // --- Clear Executed Move ---
        this.currentMove = null; this.intentIcon = null; this.intentValue = null;
    }

    updateCooldowns() { for (const moveId in this.moveCooldowns) { if (this.moveCooldowns[moveId] > 0) { this.moveCooldowns[moveId]--; } } }

    // --- Health & Status ---
    takeBruise(amount, sourceElement = Elements.NEUTRAL) {
        if (amount <= 0) return { actualHpLoss: 0, isWeaknessHit: false, isResistanceHit: false, sourceElement: sourceElement };
        let damage = amount; let weaknessHit = false; let resistanceHit = false;
        if (sourceElement !== Elements.NEUTRAL) { if (sourceElement === this.weakness) { damage = Math.floor(damage * WEAKNESS_MULTIPLIER); weaknessHit = true; } else if (sourceElement === this.resistance) { damage = Math.floor(damage * RESISTANCE_MULTIPLIER); resistanceHit = true; } }
        if (this.hasStatus(StatusEffects.VULNERABLE)) { damage = Math.floor(damage * VULNERABLE_MULTIPLIER); }
        const guard = this.getStatus(StatusEffects.GUARD); if (guard > 0) { const blocked = Math.min(guard, damage); this.applyStatus(StatusEffects.GUARD, -blocked); damage -= blocked; }
        let hpLoss = 0; if (damage > 0) { hpLoss = Math.min(damage, this.currentHp); this.currentHp -= hpLoss; console.log(`${this.name} took ${hpLoss} Bruise. HP: ${this.currentHp}/${this.maxHp}`); if (this.definition.specialMechanics?.onHpLoss) { const m = this.definition.specialMechanics.onHpLoss; if(m.action === 'applyStatusToSelf') { this.applyStatus(m.status, m.amount || 1, m.duration || Infinity); } } this.checkPhaseChange(); }
        return { actualHpLoss: hpLoss, isWeaknessHit: weaknessHit, isResistanceHit: resistanceHit, sourceElement: sourceElement };
    }
    applyStatus(effectId, amount, duration = Infinity) {
        if (!effectId) return; if (effectId === StatusEffects.GUARD || effectId === StatusEffects.STRENGTH) { if (!this.statusEffects[effectId]) this.statusEffects[effectId] = 0; this.statusEffects[effectId] += amount; if (effectId === StatusEffects.GUARD) this.statusEffects[effectId] = Math.max(0, this.statusEffects[effectId]); } else if (duration > 0 || duration === Infinity) { const existing = this.statusEffects[effectId]; if (existing && typeof existing === 'object') { existing.amount += amount; existing.duration = duration; if (existing.amount <= 0) delete this.statusEffects[effectId]; } else if (amount > 0) { this.statusEffects[effectId] = { amount: amount, duration: duration }; } } else { delete this.statusEffects[effectId]; }
    }
    getStatus(effectId) { const s = this.statusEffects[effectId]; if (!s) return 0; if (typeof s === 'number') return s; if (typeof s === 'object' && s.amount !== undefined) { return (s.duration === Infinity || s.duration > 0) ? s.amount : 0; } return 0; }
    hasStatus(effectId) { return this.getStatus(effectId) > 0; }
    updateStatusDurations() { for (const key in this.statusEffects) { if (this.statusEffects[key] && typeof this.statusEffects[key] === 'object' && this.statusEffects[key].duration !== undefined) { const status = this.statusEffects[key]; if (status.duration !== Infinity) { status.duration--; if (status.duration <= 0) { delete this.statusEffects[key]; } } } } }

    // --- Phase Management ---
    checkPhaseChange() {
        if (!this.definition.specialMechanics?.phaseChangeThresholds) return; const hpP = this.currentHp / this.maxHp * 100; const thresholds = this.definition.specialMechanics.phaseChangeThresholds; let newPhase = 1;
        for (let i = 0; i < thresholds.length; i++) { if (hpP <= thresholds[i]) { newPhase = i + 2; } else { break; } }
        if (newPhase > this.currentPhase) { console.log(`${this.name} entering Phase ${newPhase}!`); this.currentPhase = newPhase; const phaseActions = this.definition.specialMechanics.onPhaseChange?.filter(a => a.phase === newPhase) || []; phaseActions.forEach(pAction => { if (pAction.action === 'changeMoveSet' && this.definition.moveSetDefinitions?.[pAction.newMoveSetId]) { console.log(`${this.name} changing moveset to ${pAction.newMoveSetId}`); this.definition.moveSet = this.definition.moveSetDefinitions[pAction.newMoveSetId]; this.moveCooldowns = {}; this.moveHistory = []; } else if (pAction.action === 'applyStatusToSelf') { this.applyStatus(pAction.status, pAction.amount || 1, pAction.duration || Infinity); } }); this.currentMove = null; this.intentIcon = null; this.intentValue = null; }
    }

    // --- Rendering ---
    render(ctx) {
         const baseX = this.position.x; const baseY = this.position.y; const bodyW = this.width * 0.8; const bodyH = this.height * 0.9;
         ctx.fillStyle = '#A0522D'; ctx.strokeStyle = this.isHovered ? '#FFFF00' : '#333'; ctx.lineWidth = this.isHovered ? 3 : 2; ctx.fillRect(baseX - bodyW / 2, baseY - bodyH, bodyW, bodyH); ctx.strokeRect(baseX - bodyW / 2, baseY - bodyH, bodyW, bodyH);
         ctx.fillStyle = '#FFF'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(this.name, baseX, baseY - bodyH - 45);
         if (this.currentMove) { const iY = baseY - bodyH - 25; ctx.fillStyle = '#FFF'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; let iText = this.intentIcon || '?'; if (this.intentValue !== null) { iText += `${this.intentValue}`; } ctx.fillText(iText, baseX, iY); }
         const hpBW = this.width * 0.8; const hpBH = 10; const hpBX = baseX - hpBW / 2; const hpBY = baseY - bodyH - 15; const hpP = Math.max(0, this.currentHp / this.maxHp); ctx.fillStyle = '#555'; ctx.fillRect(hpBX, hpBY, hpBW, hpBH); ctx.fillStyle = '#D9534F'; ctx.fillRect(hpBX, hpBY, hpBW * hpP, hpBH); ctx.fillStyle = '#FFF'; ctx.font = '10px sans-serif'; ctx.textBaseline = 'middle'; ctx.fillText(`${this.currentHp}/${this.maxHp}`, baseX, hpBY + hpBH / 2);
         const guard = this.getStatus(StatusEffects.GUARD); if (guard > 0) { const gIX = hpBX - 5; const gIY = hpBY + hpBH / 2; ctx.fillStyle = '#428BCA'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'right'; ctx.fillText(`🛡️${guard}`, gIX, gIY); }
         let sIX = baseX - bodyW / 2; const sIY = baseY + 15; const iconS = 16; Object.entries(this.statusEffects).forEach(([key, value]) => { if (key === StatusEffects.GUARD) return; let amount = 0; let durInfo = ''; let color = '#FFF'; if (typeof value === 'number') amount = value; else if (typeof value === 'object') { amount = value.amount; if(value.duration !== Infinity && value.duration > 0) durInfo = `(${value.duration}t)`; } if (amount <= 0) return; let icon = '?'; switch (key) { case StatusEffects.VULNERABLE: icon = '💥'; color = '#FF8C00'; break; case StatusEffects.WEAK: icon = '💧'; color = '#ADD8E6'; break; case StatusEffects.STRENGTH: icon = '💪'; color = '#FF6347'; break; default: if (key.startsWith(StatusEffects.FREEZE)) { icon = '❄️'; color = '#ADD8E6'; amount = key.split('_')[1]?.[0] || '?'; durInfo=''; } break; } const text = `${icon}${amount}${durInfo}`; ctx.fillStyle = color; ctx.font = `bold ${iconS}px sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, sIX, sIY); sIX += ctx.measureText(text).width + 6; });
    }
} // End Enemy Class
