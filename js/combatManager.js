// js/combatManager.js

// Define combat states (ONLY ONCE at the top)
const CombatState = {
    INIT: 'Init',
    PLAYER_TURN_START: 'PlayerTurnStart',
    PLAYER_CHOOSE_ACTION: 'PlayerChooseAction',
    PLAYER_SELECT_TARGET: 'PlayerSelectTarget',
    PLAYER_ANIMATING: 'PlayerAnimating', // Placeholder
    ENEMY_TURN_START: 'EnemyTurnStart',
    ENEMY_ACTING: 'EnemyActing',
    ENEMY_ANIMATING: 'EnemyAnimating', // Placeholder
    DILEMMA: 'Dilemma',
    GAME_OVER: 'GameOver',
};
class CombatManager {
    /**
     * @param {Player} player - Reference to the player instance.
     * @param {string[]} enemyIds - Array of enemy definition IDs for this combat.
     * @param {GameManager} gameManager - Reference to the main game manager.
     */
    constructor(player, enemyIds, gameManager) {
        console.log("CombatManager initializing...");
        if (!player || !enemyIds || enemyIds.length === 0 || !gameManager) { console.error("CombatManager missing args!"); this.isCombatOver = true; this.playerWon = false; this.combatState = CombatState.GAME_OVER; this.enemies = []; return; }
        this.player = player; this.gameManager = gameManager; this.enemies = this.setupEnemies(enemyIds);
        this.currentTurnOwner = 'player'; this.turnCount = 0; this.combatState = CombatState.INIT;
        this.selectedCardIndex = -1; this.selectedCardNeedsTarget = false; this.hoveredCardIndex = -1;
        this.hoveredEnemyIndex = -1; this.hoveredPile = null;
        this.endTurnButton = { x: CANVAS_WIDTH - 150, y: CANVAS_HEIGHT - 100, width: 120, height: 40, text: "End Turn", isHovered: false };
        this.isCombatOver = false; this.playerWon = false;
        this.pendingRewards = { insightShards: 0, cardChoices: [], relicChoice: null };
        this.activeDilemma = null; this.dilemmaChoiceButtons = [];
        this.actionQueue = [];
        console.log(`Combat starting vs: ${this.enemies.map(e => e.name).join(', ')}`);
    }

    setupEnemies(enemyIds) {
        const enemies = []; const count = enemyIds.length; const spacing = 180; const totalW = (count - 1) * spacing;
        let startX = CANVAS_WIDTH / 2 - totalW / 2; const yPos = CANVAS_HEIGHT * 0.4;
        if (count === 1) startX = CANVAS_WIDTH * 0.5; else if (count === 2) startX = CANVAS_WIDTH / 2 - spacing / 2;
        // This line requires the Enemy class to be defined already!
        enemyIds.forEach((id, i) => { const x = startX + i * spacing; enemies.push(new Enemy(id, x, yPos)); });
        return enemies;
    }

    startCombat() {
        this.changeState(CombatState.PLAYER_TURN_START); this.turnCount = 1;
        console.log(`--- Combat Turn ${this.turnCount} (Player Start) ---`);
        this.player.resetMomentum();
        this.player.triggerEffects('onCombatStart', this.gameManager);
        this.enemies.forEach(e => { e.statusEffects = {}; e.currentMove = null; /* trigger enemy onCombatStart effects */ });
        this.startPlayerTurn();
    }

    update(deltaTime) {
        if (this.isCombatOver || this.combatState === CombatState.INIT) return;
        this.updateHoverStates();
        switch (this.combatState) {
            case CombatState.ENEMY_TURN_START: this.startEnemyActions(); break;
            case CombatState.ENEMY_ACTING: this.processEnemyActions(deltaTime); break;
            // Other states wait for input or animation timers
        }
    }

    changeState(newState) { if (this.combatState === newState) return; this.combatState = newState; }

    render(ctx) {
        this.renderEnemies(ctx);
        if (this.combatState === CombatState.PLAYER_SELECT_TARGET && this.selectedCardIndex !== -1) { this.renderTargetingLine(ctx); }
        this.renderPlayerHUD(ctx); this.renderDeckPiles(ctx); this.renderHand(ctx); this.renderCombatUI(ctx);
        if (this.combatState === CombatState.DILEMMA && this.activeDilemma) { this.renderDilemmaBox(ctx); }
    }

    handleInput(clickPos) {
        if (this.isCombatOver) return;
        switch (this.combatState) {
            case CombatState.PLAYER_CHOOSE_ACTION: this.handlePlayerActionInput(clickPos); break;
            case CombatState.PLAYER_SELECT_TARGET: this.handlePlayerTargetInput(clickPos); break;
            case CombatState.DILEMMA: this.handleDilemmaInput(clickPos); break;
        }
    }

    handlePlayerActionInput(clickPos) {
        if (this.isPointInRect(clickPos, this.endTurnButton)) { this.endPlayerTurn(); return; }
        for (let i = 0; i < this.player.hand.length; i++) { const bounds = this.getCardBoundsInHand(i); if (bounds && this.isPointInRect(clickPos, bounds)) { this.trySelectCard(i); return; } }
        if (this.selectedCardIndex !== -1) { this.deselectCard(); this.changeState(CombatState.PLAYER_CHOOSE_ACTION); }
    }

    handlePlayerTargetInput(clickPos) {
        for (let i = 0; i < this.enemies.length; i++) { if (this.enemies[i].currentHp > 0) { const bounds = this.getEnemyBounds(this.enemies[i]); if (this.isPointInRect(clickPos, bounds)) { this.playSelectedCard(i); return; } } }
        console.log("Clicked outside targets, cancelling."); this.deselectCard(); this.changeState(CombatState.PLAYER_CHOOSE_ACTION);
    }

     handleDilemmaInput(clickPos) {
          if (!this.activeDilemma) return; let choiceMade = false;
          this.dilemmaChoiceButtons.forEach((button) => { if (this.isPointInRect(clickPos, button.bounds)) { this.resolveDilemmaChoice(button.index); choiceMade = true; } });
     }

     updateHoverStates() {
         const mousePos = this.gameManager.lastInputPos; if (!mousePos) return; const mX = mousePos.x; const mY = mousePos.y;
         this.hoveredCardIndex = -1; this.hoveredEnemyIndex = -1; this.hoveredPile = null; this.endTurnButton.isHovered = false;
         if (this.combatState === CombatState.PLAYER_CHOOSE_ACTION || this.combatState === CombatState.PLAYER_SELECT_TARGET) {
            for (let i = this.player.hand.length - 1; i >= 0; i--) { const bounds = this.getCardBoundsInHand(i); if (bounds && this.isPointInRect({x: mX, y: mY}, bounds)) { this.hoveredCardIndex = i; break; } }
            for (let i = 0; i < this.enemies.length; i++) { if (this.enemies[i].currentHp > 0) { const bounds = this.getEnemyBounds(this.enemies[i]); if (this.isPointInRect({x: mX, y: mY}, bounds)) { this.hoveredEnemyIndex = i; break; } } }
            this.enemies.forEach((e, i) => e.isHovered = (i === this.hoveredEnemyIndex));
            if (this.isMouseOverDeckPiles(mX, mY)) { this.hoveredPile = 'deck_piles'; }
            this.endTurnButton.isHovered = this.isPointInRect({x: mX, y: mY}, this.endTurnButton);
         }
         if (this.combatState === CombatState.DILEMMA) { this.dilemmaChoiceButtons.forEach(b => b.isHovered = this.isPointInRect({x: mX, y: mY}, b.bounds)); }
         else { this.dilemmaChoiceButtons.forEach(b => b.isHovered = false); }
     }

    nextTurn() { if (this.isCombatOver) return; if (this.currentTurnOwner === 'player') { this.startEnemyTurn(); } else { this.turnCount++; this.startPlayerTurn(); } }
    startPlayerTurn() { this.currentTurnOwner = 'player'; console.log(`--- Combat Turn ${this.turnCount} (Player) ---`); this.player.startTurn(this.gameManager); this.deselectCard(); this.changeState(CombatState.PLAYER_CHOOSE_ACTION); }
    endPlayerTurn() { if (this.combatState !== CombatState.PLAYER_CHOOSE_ACTION && this.combatState !== CombatState.PLAYER_SELECT_TARGET) return; console.log("Player ends turn."); this.player.endTurn(this.gameManager); this.deselectCard(); this.nextTurn(); }
    startEnemyTurn() { this.currentTurnOwner = 'enemy'; console.log(`--- Combat Turn ${this.turnCount} (Enemy) ---`); this.enemies.forEach(e => { if (e.currentHp > 0) { e.startTurn(this); e.chooseNextMove(this.turnCount); } }); this.changeState(CombatState.ENEMY_TURN_START); }
    startEnemyActions() { this.actionQueue = this.enemies.filter(e => e.currentHp > 0 && e.currentMove).map(e => e.instanceId); if (this.actionQueue.length > 0) { this.changeState(CombatState.ENEMY_ACTING); } else { console.log("No enemy actions."); this.endEnemyTurn(); } }
    processEnemyActions(deltaTime) { while (this.actionQueue.length > 0) { if (this.isCombatOver) return; const eId = this.actionQueue.shift(); const enemy = this.getEnemyInstanceById(eId); if (enemy?.currentHp > 0 && enemy.currentMove) { enemy.executeMove(this.player, this); if (this.checkPlayerDefeat()) return; } } if (this.actionQueue.length === 0) { this.endEnemyTurn(); } }
    endEnemyTurn() { this.enemies.forEach(e => { if(e.currentHp > 0) e.endTurn?.(this); }); this.nextTurn(); }

    trySelectCard(index) {
         const card = this.player.hand[index]; if (!card) return;
         if (!card.isPlayable()) { console.log(`Cannot select ${card.name}: Not playable.`); return; }
         if (this.player.cardsPlayedThisTurn >= this.player.maxCardsPerTurn) { console.log(`Cannot select ${card.name}: Max cards played.`); return; }
         let currentCost = card.cost; if (this.player.cardsPlayedThisTurn === 0 && this.player.hasStatus('FirstCardFree')) { currentCost = 0; }
         if (!this.player.canAfford(currentCost)) { console.log(`Cannot select ${card.name}: Cost ${currentCost}, Have ${this.player.currentInsight}.`); return; }

         if (index === this.selectedCardIndex) { if (!this.cardNeedsTargeting(card)) { this.playSelectedCard(null); } else { this.changeState(CombatState.PLAYER_SELECT_TARGET); } return; }
         this.deselectCard(); this.selectedCardIndex = index; this.selectedCardNeedsTarget = this.cardNeedsTargeting(card); console.log(`Selected: ${card.name} (Target? ${this.selectedCardNeedsTarget})`);
         if (this.selectedCardNeedsTarget) { this.changeState(CombatState.PLAYER_SELECT_TARGET); } else { this.changeState(CombatState.PLAYER_CHOOSE_ACTION); }
    }

    cardNeedsTargeting(card) { const e = card.effects; return !!(e.dealBruise?.target === 'enemy' || e.applyStatus?.target === 'enemy' || e.applyStatus?.target === 'all_enemies' || e.applyStatus?.target === 'random_enemy'); }
    cardCanTargetPlayer(card) { const e = card.effects; return !!(e.gainGuard?.target === 'player' || e.heal?.target === 'player' || e.applyStatus?.target === 'player'); }
    deselectCard() { this.selectedCardIndex = -1; this.selectedCardNeedsTarget = false; }

    playSelectedCard(targetEnemyIndex = null, selfTarget = false) {
        if (this.selectedCardIndex < 0 || this.selectedCardIndex >= this.player.hand.length) return;
        const card = this.player.hand[this.selectedCardIndex]; if (!card) return;
        let targetEnemy = null;
        if (targetEnemyIndex !== null && targetEnemyIndex >= 0 && targetEnemyIndex < this.enemies.length) { targetEnemy = this.enemies[targetEnemyIndex]; if (targetEnemy.currentHp <= 0) { console.log("Invalid target."); this.changeState(CombatState.PLAYER_SELECT_TARGET); return; } }
        let currentCost = card.cost; const firstCardFree = this.player.hasStatus('FirstCardFree'); if (this.player.cardsPlayedThisTurn === 0 && firstCardFree) { currentCost = 0; }
        if (!card.isPlayable() || !this.player.canAfford(currentCost) || this.player.cardsPlayedThisTurn >= this.player.maxCardsPerTurn) { console.warn("Cannot play card: Pre-play check failed."); this.deselectCard(); this.changeState(CombatState.PLAYER_CHOOSE_ACTION); return; }
        if (this.selectedCardNeedsTarget && !targetEnemy) { console.warn("Cannot play card: Needs target."); this.changeState(CombatState.PLAYER_SELECT_TARGET); return; }

        const cardName = card.name; const cardElement = card.element; const requiresExhaust = card.hasKeyword(StatusEffects.EXHAUST);
        const playedCardInstance = this.player.hand[this.selectedCardIndex];

        console.log(`Playing: ${cardName}` + (targetEnemy ? ` on ${targetEnemy.name}` : '') + (selfTarget ? ` on self` : ''));
        this.player.hand.splice(this.selectedCardIndex, 1);
        this.player.spendInsight(currentCost); if (this.player.cardsPlayedThisTurn === 0 && firstCardFree) { this.player.applyStatus('FirstCardFree', -1, 0); }
        this.player.cardsPlayedThisTurn++;
        this.player.generateMomentum(cardElement, this.gameManager);
        this.player.executeCardEffects(playedCardInstance, targetEnemy, selfTarget, this.gameManager); // Pass GM
        const triggerContext = { card: playedCardInstance.baseDefinition, target: targetEnemy };
        this.player.triggerEffects('onPlayCard', this.gameManager, triggerContext); if (cardElement === Elements.INTERACTION) { this.player.triggerEffects('onPlayInteractionCard', this.gameManager, triggerContext); }
        if (requiresExhaust) { this.player.exhaustPile.push(playedCardInstance); console.log(`Card '${cardName}' exhausted.`); } else { this.player.discardPile.push(playedCardInstance); }
        this.deselectCard();
        if(this.checkCombatEnd()) return;
        this.changeState(CombatState.PLAYER_CHOOSE_ACTION);
        if (this.player.cardsPlayedThisTurn >= this.player.maxCardsPerTurn) { console.log("Max cards played."); }
    }

    applyDamageToEnemy(enemy, amount, element) { const result = enemy.takeBruise(amount, element); if (result.isWeaknessHit) { this.player.triggerResonance(element, 1); this.player.triggerEffects('onResonanceTrigger', this.gameManager, { element: element, target: enemy }); } if (result.isResistanceHit) { const penalty = RESISTANCE_DISSONANCE_PENALTY; console.log(`Hit Resist. Add ${penalty} Static.`); for (let i=0; i < penalty; i++) { const staticDef = getCardDefinition('status_static'); if (staticDef) this.player.addCardToDeck(new Card(staticDef), 'discard'); } } }

    triggerDilemma(dilemmaData, sourceEnemy) { console.log(`Dilemma: ${dilemmaData.id} by ${sourceEnemy.name}`); this.activeDilemma = { ...dilemmaData, sourceEnemy: sourceEnemy }; this.calculateDilemmaButtonBounds(); this.changeState(CombatState.DILEMMA); }
    resolveDilemmaChoice(choiceIndex) { if (!this.activeDilemma || choiceIndex < 0 || choiceIndex >= this.activeDilemma.choices.length) return; if (this.combatState !== CombatState.DILEMMA) return; const choice = this.activeDilemma.choices[choiceIndex]; const sourceEnemy = this.activeDilemma.sourceEnemy; console.log(`Resolving Dilemma: Chose "${choice.text}"`); if (choice.effects) { const context = { sourceEnemy: sourceEnemy }; this.player.executeEffect({ action: 'applyEffectsObject', effectsObject: choice.effects }, 'dilemma', this.gameManager, context); } this.activeDilemma = null; this.dilemmaChoiceButtons = []; this.changeState(CombatState.PLAYER_CHOOSE_ACTION); this.checkCombatEnd(); }
    calculateDilemmaButtonBounds() { if (!this.activeDilemma) return; this.dilemmaChoiceButtons = []; const boxW=500, boxH=250, boxX=CANVAS_WIDTH/2-boxW/2, boxY=CANVAS_HEIGHT/2-boxH/2; const btnH=40, spacing=15, btnW=boxW*0.8, startX=boxX+boxW*0.1; let choiceY = boxY+boxH-(btnH+spacing)*this.activeDilemma.choices.length; this.activeDilemma.choices.forEach((choice, index) => { const bounds = { x: startX, y: choiceY, width: btnW, height: btnH }; this.dilemmaChoiceButtons.push({ bounds: bounds, index: index, isHovered: false }); choiceY += btnH + spacing; }); }

    checkPlayerDefeat() { if (!this.isCombatOver && this.player.currentHp <= 0) { console.log("Player defeated!"); this.endCombat(false); return true; } return false; }
    checkEnemyDefeat() { if (this.isCombatOver) return false; const allDefeated = this.enemies.every(e => e.currentHp <= 0); if (allDefeated) { console.log("All enemies defeated!"); this.endCombat(true); return true; } return false; }
    checkCombatEnd() { if (this.isCombatOver) return true; return this.checkPlayerDefeat() || this.checkEnemyDefeat(); }
    endCombat(playerVictory) { if (this.isCombatOver) return; console.log(`Combat ending. Victory: ${playerVictory}`); this.isCombatOver = true; this.playerWon = playerVictory; this.changeState(CombatState.GAME_OVER); const context = { victory: playerVictory }; this.player.triggerEffects('onCombatEnd', this.gameManager, context); this.pendingRewards = { insightShards: 0, cardChoices: [], relicChoice: null }; }

    getEnemyInstanceById(instanceId) { return this.enemies.find(e => e.instanceId === instanceId); }
    isPointInRect(point, rect) { if (!point || !rect) return false; return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height; }

    // --- Rendering Functions ---
    renderPlayerHUD(ctx) {
        const hudX = 20; let hudY = CANVAS_HEIGHT - 180; const hpBarWidth = 200; const hpBarHeight = 20; const hpPercent = Math.max(0, this.player.currentHp / this.player.maxHp); ctx.fillStyle = '#500'; ctx.fillRect(hudX, hudY, hpBarWidth, hpBarHeight); ctx.fillStyle = '#D9534F'; ctx.fillRect(hudX, hudY, hpBarWidth * hpPercent, hpBarHeight); ctx.fillStyle = '#FFF'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`${this.player.currentHp} / ${this.player.maxHp}`, hudX + hpBarWidth / 2, hudY + hpBarHeight / 2); hudY += hpBarHeight + 5; const guard = this.player.getStatus(StatusEffects.GUARD); if (guard > 0) { ctx.fillStyle = '#428BCA'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(`🛡️ ${guard}`, hudX, hudY + 10); hudY += 25; } ctx.fillStyle = '#6495ED'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(`💡 ${this.player.currentInsight} / ${this.player.maxInsight}`, hudX, hudY); hudY += 25; ctx.fillStyle = '#FFD700'; ctx.font = '16px sans-serif'; ctx.fillText(`Momentum (${this.player.lastElementPlayed}): ${this.player.momentum}`, hudX, hudY); hudY += 20; let resonanceText = "Resonance: "; let hasResonance = false; Object.entries(this.player.resonance).forEach(([element, value]) => { if (value > 0) { resonanceText += ` ${element[0]}:${value}`; hasResonance = true; } }); if (hasResonance) { ctx.fillStyle = '#AFEEEE'; ctx.font = '14px sans-serif'; ctx.fillText(resonanceText, hudX, hudY); hudY += 18; }
        let statusIconX = hudX; const statusIconY = hudY + 5; const iconSize = 16; Object.entries(this.player.statusEffects).forEach(([key, status]) => { if (key === StatusEffects.GUARD || key === 'FirstCardFree') return; let amount = 0; let durationInfo = ''; let color = '#FFF'; if (typeof status === 'number') amount = status; else if (typeof status === 'object') { amount = status.amount; if(status.duration !== Infinity && status.duration > 0) durationInfo = `(${status.duration}t)`; } if(amount <= 0) return; let icon = '?'; switch(key) { case StatusEffects.VULNERABLE: icon = '💥'; color = '#FF8C00'; break; case StatusEffects.WEAK: icon = '💧'; color = '#ADD8E6'; break; case StatusEffects.STRENGTH: icon = '💪'; color = '#FF6347'; break; case 'InsightDown': icon = '💡⬇️'; color = '#AAA'; break; case 'CardPlayLimit': icon = '🚫🃏'; color = '#AAA'; break; default: if (key.startsWith(StatusEffects.FREEZE)) { icon = '❄️'; color = '#ADD8E6'; amount = key.split('_')[1]?.[0] || '?'; durationInfo=''; } break; } const textToDraw = `${icon}${amount}${durationInfo}`; ctx.fillStyle = color; ctx.font = `bold ${iconSize}px sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(textToDraw, statusIconX, statusIconY); statusIconX += ctx.measureText(textToDraw).width + 6; });
     }
    renderEnemies(ctx) {
        this.enemies.forEach((enemy, index) => { if (enemy.currentHp > 0) { enemy.render(ctx); /* Draw highlights */ } else { ctx.globalAlpha = 0.5; enemy.render(ctx); ctx.globalAlpha = 1.0; } });
     }
    renderHand(ctx) {
        const hand = this.player.hand; const handSize = hand.length; if (handSize === 0) return; const baseCardW=100, baseCardH=140, areaW = CANVAS_WIDTH*0.7, baseSpace=10, overlap=0.6; let cardW=baseCardW, cardH=baseCardH, spacing=baseSpace; const naturalW=handSize*cardW+(handSize-1)*spacing; if(naturalW > areaW){ const overflow=naturalW-areaW; const spaceReduce=overflow/(handSize-1); spacing=Math.max(-cardW*overlap, baseSpace-spaceReduce); const finalW=handSize*cardW+(handSize-1)*spacing; if(finalW > areaW){ const scale = areaW/finalW; cardW*=scale; cardH*=scale; spacing*=scale;} } const finalHandW=handSize*cardW+(handSize-1)*spacing; const startX=(CANVAS_WIDTH/2)-(finalHandW/2); const baseY=CANVAS_HEIGHT-cardH-20; const hoverYOff=-30; const fanAngle=handSize>5?5:0;
        hand.forEach((card, index) => { const isHover = (index === this.hoveredCardIndex); const isSelect = (index === this.selectedCardIndex); const cY = baseY + (isHover || isSelect ? hoverYOff : 0); const cX = startX + index * (cardW + spacing); const rot = handSize>1?(index - (handSize - 1) / 2) * fanAngle : 0; ctx.save(); ctx.translate(cX + cardW / 2, cY + cardH / 2); ctx.rotate(rot * Math.PI / 180); ctx.translate(-(cX + cardW / 2), -(cY + cardH / 2)); const bounds = { x: cX, y: cY, width: cardW, height: cardH }; ctx.fillStyle = '#444'; ctx.strokeStyle = isSelect ? '#FFFF00' : (isHover ? '#FFF' : (ElementColors[card.element] || '#888')); ctx.lineWidth = isSelect ? 3 : 2; ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height); ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        let currentCost = card.cost; if (this.player.cardsPlayedThisTurn === 0 && this.player.hasStatus('FirstCardFree')) currentCost = 0; if (currentCost !== null) { ctx.fillStyle = this.player.canAfford(currentCost) ? '#FFF' : '#F88'; ctx.font = `bold ${Math.floor(cardH * 0.15)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.beginPath(); ctx.arc(bounds.x + cardW * 0.15, bounds.y + cardH * 0.15, cardH * 0.12, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#000'; ctx.fillText(currentCost.toString(), bounds.x + cardW * 0.15, bounds.y + cardH * 0.15); }
        ctx.fillStyle = '#FFF'; ctx.font = `${Math.floor(cardH * 0.1)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; this.wrapText(ctx, card.name, bounds.x + cardW / 2, bounds.y + cardH * 0.3, cardW * 0.9, cardH * 0.12); ctx.font = `${Math.floor(cardH * 0.08)}px sans-serif`; ctx.textBaseline = 'bottom'; this.wrapText(ctx, card.description, bounds.x + cardW / 2, bounds.y + cardH - 5, cardW * 0.9, cardH * 0.1); ctx.restore(); });
     }
    wrapText(context, text, x, y, maxWidth, lineHeight) { if (!text) return; const words = text.split(' '); let line = ''; let lines = []; const initialY = y; for (let n = 0; n < words.length; n++) { const testLine = line + words[n] + ' '; const metrics = context.measureText(testLine); const testWidth = metrics.width; if (testWidth > maxWidth && n > 0) { lines.push(line); line = words[n] + ' '; } else { line = testLine; } } lines.push(line); y = initialY - (lines.length - 1) * lineHeight; for (let k = 0; k < lines.length; k++) { context.fillText(lines[k].trim(), x, y + k * lineHeight); } }
    getCardBoundsInHand(index) { const hand = this.player.hand; const handSize = hand.length; if (index < 0 || index >= handSize) return null; const baseCardW=100, baseCardH=140, areaW = CANVAS_WIDTH*0.7, baseSpace=10, overlap=0.6; let cardW=baseCardW, cardH=baseCardH, spacing=baseSpace; const naturalW=handSize*cardW+(handSize-1)*spacing; if(naturalW > areaW){ const overflow=naturalW-areaW; const spaceReduce=overflow/(handSize-1); spacing=Math.max(-cardW*overlap, baseSpace-spaceReduce); const finalW=handSize*cardW+(handSize-1)*spacing; if(finalW > areaW){ const scale = areaW/finalW; cardW*=scale; cardH*=scale; spacing*=scale;} } const finalHandW=handSize*cardW+(handSize-1)*spacing; const startX=(CANVAS_WIDTH/2)-(finalHandW/2); const baseY=CANVAS_HEIGHT-cardH-20; const hoverYOff=-30; const isHover = (index === this.hoveredCardIndex); const isSelect = (index === this.selectedCardIndex); const cY = baseY + (isHover || isSelect ? hoverYOff : 0); const cX = startX + index * (cardW + spacing); return { x: cX, y: cY, width: cardW, height: cardH }; }
    getEnemyBounds(enemy) { const baseX = enemy.position.x; const baseY = enemy.position.y; const bodyW = enemy.width*0.8; const bodyH = enemy.height*0.9; return { x: baseX-bodyW/2, y: baseY-bodyH, width: bodyW, height: bodyH }; }
    renderDeckPiles(ctx) { const pW=50, pH=70, pX=CANVAS_WIDTH-80; let pY=CANVAS_HEIGHT-250; ctx.font='14px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; const drawB={x:pX-pW/2,y:pY-pH/2,width:pW,height:pH}; ctx.fillStyle=this.hoveredPile==='deck_piles'?'#A46A40':'#8B4513'; ctx.fillRect(drawB.x,drawB.y,drawB.width,drawB.height); ctx.strokeStyle='#FFF'; ctx.lineWidth=1; ctx.strokeRect(drawB.x,drawB.y,drawB.width,drawB.height); ctx.fillStyle='#FFF'; ctx.fillText(`${this.player.drawPile.length}`,pX,pY-10); ctx.fillText(`Draw`,pX,pY+10); pY+=100; const discB={x:pX-pW/2,y:pY-pH/2,width:pW,height:pH}; ctx.fillStyle=this.hoveredPile==='deck_piles'?'#777':'#555'; ctx.fillRect(discB.x,discB.y,discB.width,discB.height); ctx.strokeStyle='#FFF'; ctx.lineWidth=1; ctx.strokeRect(discB.x,discB.y,discB.width,discB.height); ctx.fillStyle='#FFF'; ctx.fillText(`${this.player.discardPile.length}`,pX,pY-10); ctx.fillText(`Discard`,pX,pY+10); this.drawPileBounds = drawB; this.discardPileBounds = discB; }
    renderCombatUI(ctx) { const btn=this.endTurnButton; const canEnd=this.combatState===CombatState.PLAYER_CHOOSE_ACTION||this.combatState===CombatState.PLAYER_SELECT_TARGET; ctx.fillStyle=btn.isHovered&&canEnd?'#F54E5C':(canEnd?'#DC3545':'#888'); ctx.fillRect(btn.x,btn.y,btn.width,btn.height); ctx.strokeStyle='#FFF'; ctx.lineWidth=1; ctx.strokeRect(btn.x,btn.y,btn.width,btn.height); ctx.fillStyle='#FFF'; ctx.font='bold 18px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(btn.text,btn.x+btn.width/2,btn.y+btn.height/2); }
    renderDilemmaBox(ctx) { if (!this.activeDilemma) return; const boxW=500, boxH=250, boxX=CANVAS_WIDTH/2-boxW/2, boxY=CANVAS_HEIGHT/2-boxH/2; ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT); ctx.fillStyle='rgba(30,30,30,0.95)'; ctx.fillRect(boxX,boxY,boxW,boxH); ctx.strokeStyle='#FFF'; ctx.lineWidth=2; ctx.strokeRect(boxX,boxY,boxW,boxH); ctx.fillStyle='#FFF'; ctx.font='18px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top'; this.wrapText(ctx, this.activeDilemma.text, boxX+boxW/2, boxY+20, boxW-40, 22); this.dilemmaChoiceButtons.forEach(button => { const bounds = button.bounds; const choice = this.activeDilemma.choices[button.index]; ctx.fillStyle = button.isHovered ? '#777' : '#555'; ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height); ctx.strokeStyle = '#AAA'; ctx.lineWidth = 1; ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height); ctx.fillStyle = '#FFF'; ctx.font = '16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; this.wrapText(ctx, choice.text, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, bounds.width - 10, 18); }); }
    renderTargetingLine(ctx) { if (this.selectedCardIndex === -1 || !this.gameManager.lastInputPos) return; const bounds = this.getCardBoundsInHand(this.selectedCardIndex); if (!bounds) return; const startX = bounds.x + bounds.width / 2; const startY = bounds.y; const endX = this.gameManager.lastInputPos.x; const endY = this.gameManager.lastInputPos.y; ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)'; ctx.lineWidth = 3; ctx.setLineDash([10, 5]); ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; ctx.beginPath(); ctx.arc(endX, endY, 15, 0, Math.PI * 2); ctx.fill(); }
    isMouseOverDeckPiles(mouseX, mouseY) { if (!this.drawPileBounds || !this.discardPileBounds) return false; return this.isPointInRect({x: mouseX, y: mouseY}, this.drawPileBounds) || this.isPointInRect({x: mouseX, y: mouseY}, this.discardPileBounds); }
