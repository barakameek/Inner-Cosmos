// js/combatManager.js

// Define combat states (Ensure this is the ONLY place this is defined)
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
        enemyIds.forEach((id, i) => { const x = startX + i * spacing; enemies.push(new Enemy(id, x, yPos)); }); // This line caused the ReferenceError if Enemy class not loaded
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

    // --- Rendering Functions --- (Shortened placeholders - use full code from previous responses)
    renderPlayerHUD(ctx) { /* Draw HP, Guard, Insight, Statuses */ }
    renderEnemies(ctx) { /* Loop enemies, call enemy.render */ }
    renderHand(ctx) { /* Calculate layout, draw cards with state */ }
    wrapText(context, text, x, y, maxWidth, lineHeight) { /* Utility */ }
    getCardBoundsInHand(index) { /* Calculate layout and return bounds */ return null; } // Needs full implementation
    getEnemyBounds(enemy) { /* Return enemy rect bounds */ return {x:0,y:0,width:0,height:0}; } // Needs full implementation
    renderDeckPiles(ctx) { /* Draw Draw/Discard piles + counts */ }
    renderCombatUI(ctx) { /* Draw End Turn button */ }
    renderDilemmaBox(ctx) { /* Draw dilemma prompt and choices */ }
    renderTargetingLine(ctx) { /* Draw line from selected card to mouse */ }
    isMouseOverDeckPiles(mouseX, mouseY) { /* Check if mouse over pile areas */ return false; }

} // End CombatManager Class
