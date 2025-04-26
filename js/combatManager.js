// js/combatManager.js

// Define combat states
const CombatState = {
    INIT: 'Init',                       // Initial state before combat starts
    PLAYER_TURN_START: 'PlayerTurnStart', // Start of player's turn setup
    PLAYER_CHOOSE_ACTION: 'PlayerChooseAction', // Waiting for player card play or end turn
    PLAYER_SELECT_TARGET: 'PlayerSelectTarget', // Player selected a card needing a target
    PLAYER_ANIMATING: 'PlayerAnimating',       // Visual feedback for player action (Placeholder)
    ENEMY_TURN_START: 'EnemyTurnStart',       // Enemies choose intents
    ENEMY_ACTING: 'EnemyActing',             // Enemies performing their actions sequentially
    ENEMY_ANIMATING: 'EnemyAnimating',         // Visual feedback for enemy action (Placeholder)
    DILEMMA: 'Dilemma',                   // Waiting for player choice on a Dilemma
    GAME_OVER: 'GameOver',                 // Combat has ended (victory or defeat)
};

class CombatManager {
    /**
     * @param {Player} player - Reference to the player instance.
     * @param {string[]} enemyIds - Array of enemy definition IDs for this combat.
     * @param {GameManager} gameManager - Reference to the main game manager.
     */
    constructor(player, enemyIds, gameManager) {
        console.log("CombatManager initializing...");
        if (!player || !enemyIds || enemyIds.length === 0 || !gameManager) {
             console.error("CombatManager constructor missing required arguments!");
             // Handle this error gracefully, perhaps throw or set an error state
             this.isCombatOver = true; // Prevent updates/renders if setup failed
             this.playerWon = false;
             this.combatState = CombatState.GAME_OVER;
             this.enemies = [];
             return;
        }

        this.player = player;
        this.gameManager = gameManager;
        this.enemies = this.setupEnemies(enemyIds);

        this.currentTurnOwner = 'player'; // 'player' or 'enemy'
        this.turnCount = 0;
        this.combatState = CombatState.INIT;

        // UI/Input State
        this.selectedCardIndex = -1; // Index of card selected in hand
        this.selectedCardNeedsTarget = false;
        this.hoveredCardIndex = -1;
        this.hoveredEnemyIndex = -1;
        this.hoveredPile = null; // 'draw', 'discard', 'exhaust'
        this.endTurnButton = { x: CANVAS_WIDTH - 150, y: CANVAS_HEIGHT - 100, width: 120, height: 40, text: "End Turn", isHovered: false };

        // Combat Flow State
        this.isCombatOver = false;
        this.playerWon = false;
        // Rewards are primarily calculated post-combat by GameManager based on node type,
        // but we can track things earned mid-combat if needed.
        this.pendingRewards = { insightShards: 0, cardChoices: [], relicChoice: null };

        this.activeDilemma = null; // Stores dilemma data { id, text, choices: [{ text, effects }], sourceEnemy: enemyInstance }
        this.dilemmaChoiceButtons = []; // Stores bounding boxes + index for dilemma choices

        // Queue for sequential actions (currently just enemy turns)
        this.actionQueue = [];

        console.log(`Combat starting against: ${this.enemies.map(e => e.name).join(', ')}`);
    }

    setupEnemies(enemyIds) {
        const enemies = [];
        const enemyCount = enemyIds.length;
        // Simple positioning logic: Spread enemies horizontally, slightly offset based on count
        const spacing = 180; // Space between enemy centers
        const totalWidth = (enemyCount - 1) * spacing;
        let startX = CANVAS_WIDTH / 2 - totalWidth / 2;
        // Ensure single enemy is centered
        if (enemyCount === 1) startX = CANVAS_WIDTH * 0.5; // Center single enemy? Or offset slightly? Let's center.
        else if (enemyCount === 2) startX = CANVAS_WIDTH / 2 - spacing / 2; // Center the pair
        // Position enemies higher up
        const yPos = CANVAS_HEIGHT * 0.4;

        enemyIds.forEach((id, index) => {
            const xPos = startX + index * spacing;
            const enemyInstance = new Enemy(id, xPos, yPos);
            enemies.push(enemyInstance);
        });
        return enemies;
    }

    startCombat() {
        this.combatState = CombatState.PLAYER_TURN_START; // Initial state transition
        this.turnCount = 1;
        console.log(`--- Combat Turn ${this.turnCount} (Player Start) ---`);

        // Reset player combat state (Guard, statuses might persist based on duration)
        // Note: Some statuses might reset here if they are 'until end of combat'
        this.player.resetMomentum();
        // Do NOT reset Insight here, that happens in startPlayerTurn

        // Trigger start-of-combat effects AFTER basic setup
        this.player.triggerEffects('onCombatStart', this.gameManager);
        this.enemies.forEach(enemy => {
            // Reset enemy state (remove guard, temp effects)
            enemy.statusEffects = {}; // Clear statuses at combat start? Or let durations handle? Clear seems safer.
            enemy.currentMove = null;
             // Trigger enemy start-of-combat effects (e.g., initial buffs) if defined
             if (enemy.definition.specialMechanics?.onCombatStart) {
                  // Execute actions defined in specialMechanics
             }
        });

        // Start player's first turn properly
        this.startPlayerTurn(); // Changes state to PLAYER_CHOOSE_ACTION
    }

    // --- Main Loop Functions ---

    update(deltaTime) {
        if (this.isCombatOver || this.combatState === CombatState.INIT) return;

        // Update hover states based on mouse position from GameManager
        this.updateHoverStates();

        // State machine logic
        switch (this.combatState) {
            case CombatState.PLAYER_CHOOSE_ACTION:
            case CombatState.PLAYER_SELECT_TARGET:
            case CombatState.DILEMMA:
                // Primarily waiting for input handled via handleInput
                break;

            case CombatState.ENEMY_TURN_START:
                // Transition state after a brief delay or instantly
                // For simplicity, transition instantly for now
                this.startEnemyActions();
                break;

            case CombatState.ENEMY_ACTING:
                // Process enemy actions sequentially
                this.processEnemyActions(deltaTime);
                break;

            // Add PLAYER_ANIMATING / ENEMY_ANIMATING states later if needed
            // These would block further input/actions until animation completes.
            // case CombatState.PLAYER_ANIMATING:
            //     if (this.animationTimer > 0) this.animationTimer -= deltaTime;
            //     else this.changeState(CombatState.PLAYER_CHOOSE_ACTION); // Or next logical state
            //     break;

            case CombatState.GAME_OVER:
                 // Do nothing, wait for GameManager to handle transition
                 break;
        }
    }

    changeState(newState) {
         if (this.combatState === newState) return;
         // console.log(`Combat State: ${this.combatState} -> ${newState}`); // Can be noisy
         // Add exit logic for previous state if needed
         // switch(this.combatState) { ... }

         this.combatState = newState;

         // Add entry logic for new state if needed
         // switch(newState) { ... }
    }


    render(ctx) {
        // Rendering order matters (back to front)
        // 1. Background / Arena (Optional)

        // 2. Enemies
        this.renderEnemies(ctx);

        // 3. Player Representation? (Optional character sprite)

        // 4. Targeting Line (if active) - Drawn below hand/UI but above enemies/player?
         if (this.combatState === CombatState.PLAYER_SELECT_TARGET && this.selectedCardIndex !== -1) {
              this.renderTargetingLine(ctx);
         }

        // 5. Player HUD (HP, Insight, Statuses)
        this.renderPlayerHUD(ctx); // Specific combat HUD elements

        // 6. Deck Piles (Draw, Discard, Exhaust)
        this.renderDeckPiles(ctx);

        // 7. Hand
        this.renderHand(ctx);

        // 8. Combat UI (End Turn Button)
        this.renderCombatUI(ctx);

         // 9. Dilemma Box (if active) - Drawn on top
         if (this.combatState === CombatState.DILEMMA && this.activeDilemma) {
             this.renderDilemmaBox(ctx);
         }

         // Debug: Render current state
         // ctx.fillStyle = '#FFF'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left';
         // ctx.fillText(`Combat State: ${this.combatState}`, 10, 30);
    }

    // --- Input Handling ---

    handleInput(clickPos) {
        if (this.isCombatOver) return;
        // console.log(`Combat Input @ (${clickPos.x}, ${clickPos.y}), State: ${this.combatState}`);

        // Handle input based on the current state
        switch (this.combatState) {
            case CombatState.PLAYER_CHOOSE_ACTION:
                this.handlePlayerActionInput(clickPos);
                break;
            case CombatState.PLAYER_SELECT_TARGET:
                this.handlePlayerTargetInput(clickPos);
                break;
            case CombatState.DILEMMA:
                this.handleDilemmaInput(clickPos);
                break;
            // Ignore input in other states for now
        }
    }

    handlePlayerActionInput(clickPos) {
        // Check click on End Turn Button
        if (this.isPointInRect(clickPos, this.endTurnButton)) {
            this.endPlayerTurn();
            return; // Input handled
        }

        // Check click on Hand Cards
        for (let i = 0; i < this.player.hand.length; i++) {
            const cardBounds = this.getCardBoundsInHand(i);
            if (this.isPointInRect(clickPos, cardBounds)) {
                 this.trySelectCard(i);
                 return; // Input handled
            }
        }

        // Clicked elsewhere (e.g., empty space, deck piles) - deselect card if one was selected
        if (this.selectedCardIndex !== -1) {
             // console.log("Clicked outside hand, deselecting card.");
             this.deselectCard();
             this.changeState(CombatState.PLAYER_CHOOSE_ACTION);
        }
    }

    handlePlayerTargetInput(clickPos) {
        // Check click on Enemies
        for (let i = 0; i < this.enemies.length; i++) {
             if (this.enemies[i].currentHp > 0) { // Can only target living enemies
                 const enemyBounds = this.getEnemyBounds(this.enemies[i]);
                 if (this.isPointInRect(clickPos, enemyBounds)) {
                      console.log(`Target selected: ${this.enemies[i].name}`);
                      this.playSelectedCard(i); // Play card on enemy index i
                      return; // Input handled
                 }
             }
        }

        // Check click on Player (for self-targeting cards)?
        // Define player clickable area if needed
        // const playerBounds = { x: ..., y: ..., width: ..., height: ... };
        // if (this.isPointInRect(clickPos, playerBounds)) {
        //     // Check if the selected card *can* target player
        //     const card = this.player.hand[this.selectedCardIndex];
        //     if (card && this.cardCanTargetPlayer(card)) { // Need cardCanTargetPlayer helper
        //          this.playSelectedCard(null, true); // Play card on self
        //          return; // Input handled
        //     }
        // }

        // Clicked outside valid targets - cancel targeting and return to action choice
        console.log("Clicked outside valid targets, cancelling targeting.");
        this.deselectCard();
        this.changeState(CombatState.PLAYER_CHOOSE_ACTION);
    }

     handleDilemmaInput(clickPos) {
          if (!this.activeDilemma) return;
          let choiceMade = false;
          this.dilemmaChoiceButtons.forEach((button, index) => {
               if (this.isPointInRect(clickPos, button.bounds)) {
                    console.log(`Dilemma choice ${index + 1} selected.`);
                    this.resolveDilemmaChoice(index);
                    choiceMade = true;
               }
          });
          // Could add a cancel/close button for dilemmas if needed
     }

     updateHoverStates() {
         // Use mouse position stored in GameManager (requires GameManager to update it)
         const mousePos = this.gameManager.lastInputPos;
         if (!mousePos) return; // No position data available

         const mouseX = mousePos.x;
         const mouseY = mousePos.y;

         // --- Hand Card Hover ---
         this.hoveredCardIndex = -1;
         // Only check hover if waiting for player action (not targeting or dilemma)
         if (this.combatState === CombatState.PLAYER_CHOOSE_ACTION) {
            // Iterate backwards to correctly handle overlapping cards (if rendered overlapped)
            for (let i = this.player.hand.length - 1; i >= 0; i--) {
                 const cardBounds = this.getCardBoundsInHand(i); // Use adjusted bounds if cards are offset when hovered
                 if (this.isPointInRect({x: mouseX, y: mouseY}, cardBounds)) {
                      // Check if the mouse is *truly* over this card vs an underlying one
                      // If cards don't overlap significantly, simple check is fine
                      this.hoveredCardIndex = i;
                      break; // Found the topmost card
                 }
            }
         }

         // --- Enemy Hover ---
         this.hoveredEnemyIndex = -1;
         for (let i = 0; i < this.enemies.length; i++) {
             if (this.enemies[i].currentHp > 0) {
                  const enemyBounds = this.getEnemyBounds(this.enemies[i]);
                  if (this.isPointInRect({x: mouseX, y: mouseY}, enemyBounds)) {
                       this.hoveredEnemyIndex = i;
                       break; // Assume enemies don't overlap significantly
                  }
             }
         }
         // Update enemy hover state directly
         this.enemies.forEach((enemy, index) => enemy.isHovered = (index === this.hoveredEnemyIndex));

          // --- Deck/Discard Pile Hover ---
          this.hoveredPile = null;
          if (this.isMouseOverDeckPiles(mouseX, mouseY)) {
               // Determine which pile specifically is hovered if needed for tooltip
               // For now, just mark that *a* pile is hovered
               this.hoveredPile = 'deck_piles'; // Use the identifier UIManager checks for
          }

           // --- End Turn Button Hover ---
           this.endTurnButton.isHovered = this.isPointInRect({x: mouseX, y: mouseY}, this.endTurnButton);

           // --- Dilemma Choice Hover ---
           if (this.combatState === CombatState.DILEMMA) {
                this.dilemmaChoiceButtons.forEach(button => {
                     button.isHovered = this.isPointInRect({x: mouseX, y: mouseY}, button.bounds);
                });
           } else {
                // Clear dilemma hover state if not in dilemma
                 this.dilemmaChoiceButtons.forEach(button => button.isHovered = false);
           }
     }

    // --- Turn Management ---

    nextTurn() {
        if (this.isCombatOver) return;

        if (this.currentTurnOwner === 'player') {
            this.startEnemyTurn();
        } else {
            this.turnCount++;
            this.startPlayerTurn();
        }
    }

    startPlayerTurn() {
        this.currentTurnOwner = 'player';
        console.log(`--- Combat Turn ${this.turnCount} (Player) ---`);
        this.player.startTurn(this.gameManager); // Draws cards, gains insight, updates statuses
        this.deselectCard();
        this.changeState(CombatState.PLAYER_CHOOSE_ACTION);
    }

    endPlayerTurn() {
         // Allow ending turn only from action choice state
         if (this.combatState !== CombatState.PLAYER_CHOOSE_ACTION && this.combatState !== CombatState.PLAYER_SELECT_TARGET) return;

        console.log("Player ends turn.");
        this.player.endTurn(this.gameManager); // Discards hand, resets momentum, etc.
        this.deselectCard();
        this.nextTurn(); // Transition to enemy turn
    }

    startEnemyTurn() {
        this.currentTurnOwner = 'enemy';
        console.log(`--- Combat Turn ${this.turnCount} (Enemy) ---`);
        // Player momentum resets before enemy turn fully starts (part of player end turn)

        // Enemies choose their moves (set intents)
        this.enemies.forEach(enemy => {
            if (enemy.currentHp > 0) {
                enemy.startTurn(this); // Update enemy statuses/cooldowns
                enemy.chooseNextMove(this.turnCount); // Choose intent for this turn
            }
        });

        this.changeState(CombatState.ENEMY_TURN_START);
        // Optional: Add delay before ENEMY_ACTING
    }

    startEnemyActions() {
         // Create action queue for enemies based on current intents
         this.actionQueue = this.enemies
             .filter(e => e.currentHp > 0 && e.currentMove)
             .map(e => e.instanceId); // Queue up instances that have an action

         if (this.actionQueue.length > 0) {
              this.changeState(CombatState.ENEMY_ACTING);
         } else {
              console.log("No enemies have actions this turn.");
              this.endEnemyTurn(); // Skip directly to end if no actions
         }
    }

    processEnemyActions(deltaTime) {
         // Simple sequential execution (no animation delays yet)
         while (this.actionQueue.length > 0) {
              if (this.isCombatOver) return; // Stop processing if combat ended mid-queue

              const enemyInstanceId = this.actionQueue.shift(); // Get next enemy
              const enemy = this.getEnemyInstanceById(enemyInstanceId);

              if (enemy && enemy.currentHp > 0 && enemy.currentMove) {
                   enemy.executeMove(this.player, this);
                   if (this.checkPlayerDefeat()) return; // Check if player died
              }
         }

         // If queue is empty, the enemy turn is finished
         if (this.actionQueue.length === 0) {
             this.endEnemyTurn();
         }
    }


    endEnemyTurn() {
         this.enemies.forEach(enemy => {
             if(enemy.currentHp > 0) enemy.endTurn?.(this); // Enemy end-of-turn logic
         });
         this.nextTurn(); // Start player's next turn
    }

    // --- Player Card Play ---

    trySelectCard(index) {
         const card = this.player.hand[index];
         if (!card) return; // Should not happen

         // Check if playable (cost, type)
         if (!card.isPlayable()) {
              console.log(`Cannot select card ${card.name}: Not playable (Curse/Status).`);
              return;
         }
         // Check play limit
         if (this.player.cardsPlayedThisTurn >= this.player.maxCardsPerTurn) {
              console.log(`Cannot select card ${card.name}: Max cards per turn (${this.player.maxCardsPerTurn}) reached.`);
              // TODO: Add visual feedback (shake card?)
              return;
         }
         // Check Insight cost
         // Check cost *after* potential cost reduction effects (e.g., First Card Free)
          let currentCost = card.cost;
          if (this.player.cardsPlayedThisTurn === 0 && this.player.hasStatus('FirstCardFree')) {
              currentCost = 0;
               console.log(`Applying 'First Card Free' to ${card.name}.`);
          }
         if (!this.player.canAfford(currentCost)) {
              console.log(`Cannot select card ${card.name}: Costs ${currentCost}, Player has ${this.player.currentInsight}.`);
              // TODO: Add visual feedback (red tint?)
              return;
         }

         // --- Card is selectable ---
         if (index === this.selectedCardIndex) {
              // Clicked already selected card
              if (!this.cardNeedsTargeting(card)) {
                   this.playSelectedCard(null); // Play non-targeted card immediately
              } else {
                  // Card needs target, stay selected, ensure state is correct
                   this.changeState(CombatState.PLAYER_SELECT_TARGET);
              }
              return;
         }

         // Select the new card
         this.deselectCard(); // Deselect previous if any
         this.selectedCardIndex = index;
         this.selectedCardNeedsTarget = this.cardNeedsTargeting(card);
         console.log(`Selected card: ${card.name} (Needs Target: ${this.selectedCardNeedsTarget})`);

         if (this.selectedCardNeedsTarget) {
             this.changeState(CombatState.PLAYER_SELECT_TARGET);
         } else {
              // Card selected, but doesn't need target. Stay in CHOOSE_ACTION state.
              // Player might want to hover over enemies/self before deciding to play.
              // Could add logic here to play immediately if desired.
              this.changeState(CombatState.PLAYER_CHOOSE_ACTION);
         }
    }

    cardNeedsTargeting(card) {
        // Check if any effect explicitly targets 'enemy' or 'all_enemies' or 'random_enemy'
        const effects = card.effects;
        if (!effects) return false;
        if (effects.dealBruise?.target === 'enemy' || effects.dealBruise?.target === 'all_enemies' || effects.dealBruise?.target === 'random_enemy') return true;
        if (effects.applyStatus?.target === 'enemy' || effects.applyStatus?.target === 'all_enemies' || effects.applyStatus?.target === 'random_enemy') return true;
        // Add checks for other enemy-targeted effects
        return false;
    }

     cardCanTargetPlayer(card) {
          // Check if any effect targets 'player'
           const effects = card.effects;
           if (!effects) return false;
           if (effects.gainGuard?.target === 'player') return true;
           if (effects.heal?.target === 'player') return true;
            if (effects.applyStatus?.target === 'player') return true;
            // Add others...
            return false;
     }

    deselectCard() {
        this.selectedCardIndex = -1;
        this.selectedCardNeedsTarget = false;
    }

    /**
     * Plays the currently selected card. Assumes checks (cost, limit, target) passed.
     * @param {number | null} targetEnemyIndex - Index of the target enemy, or null if no target or self-target.
     * @param {boolean} [selfTarget=false] - Whether the target is explicitly the player.
     */
    playSelectedCard(targetEnemyIndex = null, selfTarget = false) {
        if (this.selectedCardIndex < 0 || this.selectedCardIndex >= this.player.hand.length) return;

        const card = this.player.hand[this.selectedCardIndex]; // Get the Card instance
        if (!card) return;

        let targetEnemy = null;
        if (targetEnemyIndex !== null && targetEnemyIndex >= 0 && targetEnemyIndex < this.enemies.length) {
            targetEnemy = this.enemies[targetEnemyIndex];
            if (targetEnemy.currentHp <= 0) {
                console.log("Cannot target defeated enemy.");
                this.changeState(CombatState.PLAYER_SELECT_TARGET); // Stay in targeting mode
                return;
            }
        }

        // --- Final Pre-Play Checks ---
        // Check cost again, considering modifications
        let currentCost = card.cost;
        const firstCardFreeActive = this.player.hasStatus('FirstCardFree');
        if (this.player.cardsPlayedThisTurn === 0 && firstCardFreeActive) {
            currentCost = 0;
        }
        if (!card.isPlayable() || !this.player.canAfford(currentCost) || this.player.cardsPlayedThisTurn >= this.player.maxCardsPerTurn) {
             console.warn(`Cannot play card ${card.name}: Condition failed before execution (Affordability/Limit/Playable).`);
             this.deselectCard();
             this.changeState(CombatState.PLAYER_CHOOSE_ACTION);
             return;
        }
        if (this.selectedCardNeedsTarget && !targetEnemy) {
             console.warn(`Cannot play card ${card.name}: Requires enemy target, none provided/valid.`);
             this.changeState(CombatState.PLAYER_SELECT_TARGET); // Stay targeting
             return;
        }

        // --- Conditions Met - Play the Card ---
        const cardName = card.name; // Store name before card leaves hand
        const cardElement = card.element; // Store element
        const requiresExhaust = card.hasKeyword(StatusEffects.EXHAUST); // Check keyword
        const playedCardInstance = this.player.hand[this.selectedCardIndex]; // Get instance before splice

        console.log(`Playing card: ${cardName}` + (targetEnemy ? ` on ${targetEnemy.name}` : '') + (selfTarget ? ` on self` : ''));

        // 1. Remove card from hand IMMEDIATELY (prevents loops with draw effects)
        this.player.hand.splice(this.selectedCardIndex, 1);

        // 2. Spend Insight
        this.player.spendInsight(currentCost);
         // Consume 'First Card Free' status if it was used
         if (this.player.cardsPlayedThisTurn === 0 && firstCardFreeActive) {
              this.player.applyStatus('FirstCardFree', -1, 0); // Remove the status
         }

        // 3. Increment play counter
        this.player.cardsPlayedThisTurn++;

        // 4. Generate Momentum
        this.player.generateMomentum(cardElement, this.gameManager);

        // 5. Execute Card Effects
        // Pass targetEnemy instance, selfTarget flag
        this.player.executeCardEffects(playedCardInstance, targetEnemy, selfTarget);

        // 6. Trigger 'onPlayCard' effects (Powers, Relics) - Pass context
         const triggerContext = { card: playedCardInstance.baseDefinition, target: targetEnemy }; // Use base definition for triggers
         this.player.triggerEffects('onPlayCard', this.gameManager, triggerContext);
         if (cardElement === Elements.INTERACTION) { // Specific trigger example
             this.player.triggerEffects('onPlayInteractionCard', this.gameManager, triggerContext);
         }

        // 7. Move played card instance to appropriate pile (discard or exhaust)
        if (requiresExhaust) {
            this.player.exhaustPile.push(playedCardInstance);
            console.log(`Card '${cardName}' exhausted.`);
        } else {
            this.player.discardPile.push(playedCardInstance);
        }

        // 8. Reset selection state
        this.deselectCard();

        // 9. Check for enemy/player defeat after effects resolve
        if(this.checkCombatEnd()) return; // Stop if combat ended

        // 10. Return to choosing action state
        this.changeState(CombatState.PLAYER_CHOOSE_ACTION);

         // 11. Check if max cards played - UI should reflect this maybe?
         if (this.player.cardsPlayedThisTurn >= this.player.maxCardsPerTurn) {
              console.log("Max cards played this turn.");
         }
    }

    /** Applies damage to an enemy and handles resonance/dissonance triggers */
    applyDamageToEnemy(enemy, amount, element) {
         const damageResult = enemy.takeBruise(amount, element);

         // Handle Resonance Gain on Weakness Hit
         if (damageResult.isWeaknessHit) {
              this.player.triggerResonance(element, 1); // Gain 1 Resonance
               // Also trigger 'onResonanceTrigger' effects from player relics/powers
               this.player.triggerEffects('onResonanceTrigger', this.gameManager, { element: element, target: enemy });
         }
         // Handle Dissonance Gain on Resistance Hit
         if (damageResult.isResistanceHit) {
              const penalty = RESISTANCE_DISSONANCE_PENALTY;
               console.log(`Hit Resistance. Adding ${penalty} Static to discard.`);
               for (let i=0; i < penalty; i++) {
                   const staticDef = getCardDefinition('status_static');
                   if (staticDef) {
                       this.player.addCardToDeck(new Card(staticDef), 'discard');
                   }
               }
         }
    }


    // --- Dilemma Handling ---
    triggerDilemma(dilemmaData, sourceEnemy) {
         console.log(`Dilemma Triggered: ${dilemmaData.id} - ${dilemmaData.text} by ${sourceEnemy.name}`);
         this.activeDilemma = { ...dilemmaData, sourceEnemy: sourceEnemy }; // Store source enemy
         this.calculateDilemmaButtonBounds(); // Calculate bounds when triggered
         this.changeState(CombatState.DILEMMA);
    }

     resolveDilemmaChoice(choiceIndex) {
         if (!this.activeDilemma || choiceIndex < 0 || choiceIndex >= this.activeDilemma.choices.length) return;
         if (this.combatState !== CombatState.DILEMMA) return; // Ensure correct state

         const chosenOption = this.activeDilemma.choices[choiceIndex];
         const sourceEnemy = this.activeDilemma.sourceEnemy; // Get the enemy who triggered it
         console.log(`Resolving Dilemma: Chose "${chosenOption.text}"`);

         // Execute effects of the choice
         if (chosenOption.effects) {
              // Create context for effect execution
              const context = { sourceEnemy: sourceEnemy }; // Pass source enemy in context
              // Use a temporary structure to pass effects to player's execution logic
               this.player.executeEffect({
                    action: 'applyEffectsObject', // Special action to handle nested effects
                    effectsObject: chosenOption.effects
               }, 'dilemma', this.gameManager, context);
         }

         this.activeDilemma = null; // Clear the dilemma
         this.dilemmaChoiceButtons = []; // Clear buttons
         this.changeState(CombatState.PLAYER_CHOOSE_ACTION); // Return control to player

         // Check for combat end after resolving choice effects
         this.checkCombatEnd();
     }

     calculateDilemmaButtonBounds() {
           if (!this.activeDilemma) return;
           this.dilemmaChoiceButtons = []; // Clear previous bounds

           const boxWidth = 500; // Match rendering values
           const boxHeight = 250;
           const boxX = CANVAS_WIDTH / 2 - boxWidth / 2;
           const boxY = CANVAS_HEIGHT / 2 - boxHeight / 2;
           const choiceButtonHeight = 40;
           const choiceSpacing = 15;
           const choiceWidth = boxWidth * 0.8;
           const choiceStartX = boxX + boxWidth * 0.1;
           let currentChoiceY = boxY + boxHeight - (choiceButtonHeight + choiceSpacing) * this.activeDilemma.choices.length; // Start from bottom up

           this.activeDilemma.choices.forEach((choice, index) => {
                const btnBounds = {
                    x: choiceStartX,
                    y: currentChoiceY,
                    width: choiceWidth,
                    height: choiceButtonHeight
                };
                this.dilemmaChoiceButtons.push({ bounds: btnBounds, index: index, isHovered: false }); // Store bounds and index
                currentChoiceY += choiceButtonHeight + choiceSpacing;
           });
      }


    // --- Combat End Checks ---

    checkPlayerDefeat() {
        if (!this.isCombatOver && this.player.currentHp <= 0) {
            console.log("Player defeated!");
            this.endCombat(false);
            return true;
        }
        return false;
    }

    checkEnemyDefeat() {
        if (this.isCombatOver) return false; // Already ended
        const allEnemiesDefeated = this.enemies.every(enemy => enemy.currentHp <= 0);
        if (allEnemiesDefeated) {
            console.log("All enemies defeated!");
            this.endCombat(true);
            return true;
        }
        return false;
    }

    /** Checks both player and enemy defeat conditions. Returns true if combat ended. */
    checkCombatEnd() {
         if (this.isCombatOver) return true;
         // Check player first, then enemies
         return this.checkPlayerDefeat() || this.checkEnemyDefeat();
    }

    endCombat(playerVictory) {
        if (this.isCombatOver) return; // Prevent double-ending

        console.log(`Combat ending. Player Victory: ${playerVictory}`);
        this.isCombatOver = true;
        this.playerWon = playerVictory;
        this.changeState(CombatState.GAME_OVER);

        // Trigger end-of-combat effects (before reward calculation)
        const context = { victory: playerVictory };
        this.player.triggerEffects('onCombatEnd', this.gameManager, context);
        // Enemy end-of-combat effects? Less common.

        // Reward calculation is now primarily handled by GameManager post-combat
        // Just set the flags here. GameManager will check playerWon and handle rewards/transition.
        this.pendingRewards = { insightShards: 0, cardChoices: [], relicChoice: null }; // Reset any mid-combat rewards

        // Clean up temporary player states? (e.g., some statuses might clear end-of-combat)
        // Depends on status design.
    }

    // --- Helpers ---

    getEnemyInstanceById(instanceId) {
        return this.enemies.find(e => e.instanceId === instanceId);
    }

    isPointInRect(point, rect) {
        if (!point || !rect) return false;
        return point.x >= rect.x && point.x <= rect.x + rect.width &&
               point.y >= rect.y && point.y <= rect.y + rect.height;
    }

    // --- Rendering Functions --- (Most are placeholders needing specific layout/assets)

     renderPlayerHUD(ctx) {
          const hudX = 20;
          let hudY = CANVAS_HEIGHT - 180; // Position higher up

          // Player HP
          const hpBarWidth = 200;
          const hpBarHeight = 20;
          const hpPercent = Math.max(0, this.player.currentHp / this.player.maxHp);
          ctx.fillStyle = '#500'; ctx.fillRect(hudX, hudY, hpBarWidth, hpBarHeight);
          ctx.fillStyle = '#D9534F'; ctx.fillRect(hudX, hudY, hpBarWidth * hpPercent, hpBarHeight);
          ctx.fillStyle = '#FFF'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(`${this.player.currentHp} / ${this.player.maxHp}`, hudX + hpBarWidth / 2, hudY + hpBarHeight / 2);
           hudY += hpBarHeight + 5;
          // Player Guard
          const guard = this.player.getStatus(StatusEffects.GUARD);
          if (guard > 0) {
               ctx.fillStyle = '#428BCA'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
               ctx.fillText(`🛡️ ${guard}`, hudX, hudY + 10);
                hudY += 25; // Add space if guard present
          }

          // Insight
          ctx.fillStyle = '#6495ED'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          ctx.fillText(`💡 ${this.player.currentInsight} / ${this.player.maxInsight}`, hudX, hudY);
          hudY += 25;

          // Momentum
          ctx.fillStyle = '#FFD700'; ctx.font = '16px sans-serif';
          ctx.fillText(`Momentum (${this.player.lastElementPlayed}): ${this.player.momentum}`, hudX, hudY);
          hudY += 20;

          // Resonance (Compact)
          let resonanceText = "Resonance: ";
          let hasResonance = false;
           Object.entries(this.player.resonance).forEach(([element, value]) => {
              if (value > 0) {
                   resonanceText += ` ${element[0]}:${value}`; // Abbreviate element
                   hasResonance = true;
              }
           });
          if (hasResonance) {
              ctx.fillStyle = '#AFEEEE'; ctx.font = '14px sans-serif';
              ctx.fillText(resonanceText, hudX, hudY);
              hudY += 18;
          }

          // Player Statuses Icons (Below HP/Insight)
          let statusIconX = hudX;
          const statusIconY = hudY + 5;
          const iconSize = 16;
           Object.entries(this.player.statusEffects).forEach(([key, status]) => {
               if (key === StatusEffects.GUARD || key === 'FirstCardFree') return; // Guard shown separately, FirstCardFree is internal state

               let amount = 0; let durationInfo = ''; let color = '#FFF';
               if (typeof status === 'number') amount = status;
               else if (typeof status === 'object') { amount = status.amount; if(status.duration !== Infinity && status.duration > 0) durationInfo = `(${status.duration}t)`; }
               if(amount <= 0) return;

               let icon = '?';
               switch(key) {
                   case StatusEffects.VULNERABLE: icon = '💥'; color = '#FF8C00'; break;
                   case StatusEffects.WEAK: icon = '💧'; color = '#ADD8E6'; break;
                   case StatusEffects.STRENGTH: icon = '💪'; color = '#FF6347'; break;
                    case 'InsightDown': icon = '💡⬇️'; color = '#AAA'; break; // Custom status example
                    case 'CardPlayLimit': icon = '🚫🃏'; color = '#AAA'; break; // Custom status example
                   // Handle Freeze_ELEMENT keys
                   default: if (key.startsWith(StatusEffects.FREEZE)) { icon = '❄️'; color = '#ADD8E6'; amount = key.split('_')[1][0]; durationInfo=''; } break; // Show element initial
               }
                const textToDraw = `${icon}${amount}${durationInfo}`;
                ctx.fillStyle = color; ctx.font = `bold ${iconSize}px sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
                ctx.fillText(textToDraw, statusIconX, statusIconY);
                statusIconX += ctx.measureText(textToDraw).width + 6;
           });
     }

     renderEnemies(ctx) {
          this.enemies.forEach((enemy, index) => {
               if (enemy.currentHp > 0) {
                   enemy.render(ctx); // Enemy draws itself (HP, intent, statuses)
                   // Targeting highlight is drawn by the enemy render now via isHovered state
               }
               else {
                   // Render defeated state (e.g., greyed out, fade)
                   ctx.globalAlpha = 0.5;
                   enemy.render(ctx); // Render faded version
                   ctx.globalAlpha = 1.0;
               }
          });
     }

     renderHand(ctx) {
          const hand = this.player.hand;
          const handSize = hand.length;
          if (handSize === 0) return;

          // --- Card Layout Calculation ---
          const baseCardWidth = 100;
          const baseCardHeight = 140;
          const handAreaWidth = CANVAS_WIDTH * 0.7; // Max width for the hand display
          const baseSpacing = 10; // Base space between cards
          const overlapFactor = 0.6; // How much cards overlap (0 = no overlap, 1 = total overlap)

          let cardWidth = baseCardWidth;
          let cardHeight = baseCardHeight;
          let spacing = baseSpacing;

          // Calculate total width needed without overlap
          const totalNaturalWidth = handSize * cardWidth + (handSize - 1) * spacing;

          // If width exceeds allowed area, calculate overlap/spacing needed
          if (totalNaturalWidth > handAreaWidth) {
               // Calculate how much width needs to be reduced
               const overflowWidth = totalNaturalWidth - handAreaWidth;
               // Distribute the reduction across the spaces between cards
               const spaceReduction = overflowWidth / (handSize - 1);
               spacing = Math.max(-cardWidth * overlapFactor, baseSpacing - spaceReduction); // Allow overlap up to overlapFactor
               // Recalculate card width if still too wide (or scale height too)? Scale for simplicity
               const finalHandWidth = handSize * cardWidth + (handSize - 1) * spacing;
               if (finalHandWidth > handAreaWidth) {
                    const scale = handAreaWidth / finalHandWidth;
                    cardWidth *= scale;
                    cardHeight *= scale;
                    spacing *= scale;
               }
          }

          const finalHandWidth = handSize * cardWidth + (handSize - 1) * spacing;
          const startX = (CANVAS_WIDTH / 2) - (finalHandWidth / 2);
          const baseY = CANVAS_HEIGHT - cardHeight - 20; // Base Y position (bottom edge)
          const hoverYOffset = -30; // How much card moves up when hovered/selected
          const fanAngle = handSize > 5 ? 5 : 0; // Degrees of fan per card

          // --- Draw Cards ---
          hand.forEach((card, index) => {
              const isHovered = (index === this.hoveredCardIndex);
              const isSelected = (index === this.selectedCardIndex);
              const currentY = baseY + (isHovered || isSelected ? hoverYOffset : 0);
              const currentX = startX + index * (cardWidth + spacing);
              const currentRotation = handSize > 1 ? (index - (handSize - 1) / 2) * fanAngle : 0; // Calculate rotation angle

              // Save context state for rotation/translation
              ctx.save();
              // Translate to the card's center pivot point for rotation
              ctx.translate(currentX + cardWidth / 2, currentY + cardHeight / 2);
              ctx.rotate(currentRotation * Math.PI / 180); // Convert degrees to radians
              // Translate back to draw position (relative to the new pivot)
              ctx.translate(-(currentX + cardWidth / 2), -(currentY + cardHeight / 2));

              // --- Render Card ---
              const cardBounds = { x: currentX, y: currentY, width: cardWidth, height: cardHeight }; // Store bounds in current coords

              // Background
              ctx.fillStyle = '#444';
              ctx.strokeStyle = isSelected ? '#FFFF00' : (isHovered ? '#FFF' : (ElementColors[card.element] || '#888'));
              ctx.lineWidth = isSelected ? 3 : 2;
              ctx.fillRect(cardBounds.x, cardBounds.y, cardBounds.width, cardBounds.height);
              ctx.strokeRect(cardBounds.x, cardBounds.y, cardBounds.width, cardBounds.height);

              // Cost
              let currentCost = card.cost;
              if (this.player.cardsPlayedThisTurn === 0 && this.player.hasStatus('FirstCardFree')) currentCost = 0;
              if (currentCost !== null) {
                   ctx.fillStyle = this.player.canAfford(currentCost) ? '#FFF' : '#F88'; // Red if cannot afford
                   ctx.font = `bold ${Math.floor(cardHeight * 0.15)}px sans-serif`; // Scale font
                   ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                   ctx.beginPath(); ctx.arc(cardBounds.x + cardWidth * 0.15, cardBounds.y + cardHeight * 0.15, cardHeight * 0.12, 0, Math.PI*2); ctx.fill(); // Cost circle
                   ctx.fillStyle = '#000'; ctx.fillText(currentCost.toString(), cardBounds.x + cardWidth * 0.15, cardBounds.y + cardHeight * 0.15); // Cost text
              }

              // Name
              ctx.fillStyle = '#FFF'; ctx.font = `${Math.floor(cardHeight * 0.1)}px sans-serif`;
              ctx.textAlign = 'center'; ctx.textBaseline = 'top';
              this.wrapText(ctx, card.name, cardBounds.x + cardWidth / 2, cardBounds.y + cardHeight * 0.3, cardWidth * 0.9, cardHeight * 0.12);

               // Description (Smaller font)
               ctx.font = `${Math.floor(cardHeight * 0.08)}px sans-serif`;
               ctx.textBaseline = 'bottom';
               this.wrapText(ctx, card.description, cardBounds.x + cardWidth / 2, cardBounds.y + cardHeight - 5, cardWidth * 0.9, cardHeight * 0.1);

              // Restore context state
              ctx.restore();
          });
     }

     // Utility to wrap text
     wrapText(context, text, x, y, maxWidth, lineHeight) {
         if (!text) return;
         const words = text.split(' ');
         let line = '';
         let lines = [];
         const initialY = y; // Store original bottom Y

         for (let n = 0; n < words.length; n++) {
             const testLine = line + words[n] + ' ';
             const metrics = context.measureText(testLine);
             const testWidth = metrics.width;
             if (testWidth > maxWidth && n > 0) {
                 lines.push(line);
                 line = words[n] + ' ';
             } else {
                 line = testLine;
             }
         }
         lines.push(line);

          // Adjust Y position based on number of lines to draw bottom-up
          y = initialY - (lines.length - 1) * lineHeight;

         // Draw lines from top down, adjusting y
         for (let k = 0; k < lines.length; k++) {
             context.fillText(lines[k].trim(), x, y + k * lineHeight);
         }
     }


     // Get card bounds adjusted for current layout (needed for interaction)
     getCardBoundsInHand(index) {
         // Recalculate layout parameters (same logic as in renderHand)
         const hand = this.player.hand;
         const handSize = hand.length;
         if (index < 0 || index >= handSize) return null; // Invalid index

         const baseCardWidth = 100;
         const baseCardHeight = 140;
         const handAreaWidth = CANVAS_WIDTH * 0.7;
         const baseSpacing = 10;
         const overlapFactor = 0.6;

         let cardWidth = baseCardWidth;
         let cardHeight = baseCardHeight;
         let spacing = baseSpacing;
         const totalNaturalWidth = handSize * cardWidth + (handSize - 1) * spacing;
         if (totalNaturalWidth > handAreaWidth) {
               const overflowWidth = totalNaturalWidth - handAreaWidth;
               const spaceReduction = overflowWidth / (handSize - 1);
               spacing = Math.max(-cardWidth * overlapFactor, baseSpacing - spaceReduction);
               const finalHandWidth = handSize * cardWidth + (handSize - 1) * spacing;
               if (finalHandWidth > handAreaWidth) {
                    const scale = handAreaWidth / finalHandWidth;
                    cardWidth *= scale; cardHeight *= scale; spacing *= scale;
               }
         }
         const finalHandWidth = handSize * cardWidth + (handSize - 1) * spacing;
         const startX = (CANVAS_WIDTH / 2) - (finalHandWidth / 2);
         const baseY = CANVAS_HEIGHT - cardHeight - 20;
         const hoverYOffset = -30;
         const isHovered = (index === this.hoveredCardIndex);
         const isSelected = (index === this.selectedCardIndex);
         const currentY = baseY + (isHovered || isSelected ? hoverYOffset : 0);
         const currentX = startX + index * (cardWidth + spacing);

         // Note: This doesn't account for rotation. Click detection might be simpler if done BEFORE rotation in render loop.
         // Or, use more complex polygon collision detection if rotation is significant.
         // For small fan angles, rectangular bounds are usually sufficient approximation.
         return { x: currentX, y: currentY, width: cardWidth, height: cardHeight };
     }

     getEnemyBounds(enemy) {
          // Base position is center-bottom
          const baseX = enemy.position.x;
          const baseY = enemy.position.y;
          const bodyWidth = enemy.width * 0.8;
          const bodyHeight = enemy.height * 0.9;
          // Return bounds relative to top-left corner for rect checks
          return {
              x: baseX - bodyWidth / 2,
              y: baseY - bodyHeight, // Top Y coordinate
              width: bodyWidth,
              height: bodyHeight
          };
     }


     renderDeckPiles(ctx) {
          const pileWidth = 50;
          const pileHeight = 70;
          const pileX = CANVAS_WIDTH - 80; // Right side
          let pileY = CANVAS_HEIGHT - 250; // Position higher, near middle right

          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Draw Pile
           const drawBounds = { x: pileX - pileWidth / 2, y: pileY - pileHeight / 2, width: pileWidth, height: pileHeight };
           ctx.fillStyle = this.hoveredPile === 'deck_piles' ? '#A46A40' : '#8B4513'; // Lighter Brown on hover
           ctx.fillRect(drawBounds.x, drawBounds.y, drawBounds.width, drawBounds.height);
           ctx.strokeStyle = '#FFF'; ctx.lineWidth=1; ctx.strokeRect(drawBounds.x, drawBounds.y, drawBounds.width, drawBounds.height);
           ctx.fillStyle = '#FFF';
           ctx.fillText(`${this.player.drawPile.length}`, pileX, pileY - 10); // Count above
           ctx.fillText(`Draw`, pileX, pileY + 10); // Label below

          pileY += 100; // Move down for discard

          // Discard Pile
           const discardBounds = { x: pileX - pileWidth / 2, y: pileY - pileHeight / 2, width: pileWidth, height: pileHeight };
           ctx.fillStyle = this.hoveredPile === 'deck_piles' ? '#777' : '#555'; // Lighter Grey on hover
           ctx.fillRect(discardBounds.x, discardBounds.y, discardBounds.width, discardBounds.height);
            ctx.strokeStyle = '#FFF'; ctx.lineWidth=1; ctx.strokeRect(discardBounds.x, discardBounds.y, discardBounds.width, discardBounds.height);
           ctx.fillStyle = '#FFF';
           ctx.fillText(`${this.player.discardPile.length}`, pileX, pileY - 10);
           ctx.fillText(`Discard`, pileX, pileY + 10);

           // Store bounds if needed elsewhere (e.g., for UIManager detailed tooltip)
           this.drawPileBounds = drawBounds;
           this.discardPileBounds = discardBounds;
     }

     renderCombatUI(ctx) {
          // End Turn Button
          const btn = this.endTurnButton;
           const canEndTurn = this.combatState === CombatState.PLAYER_CHOOSE_ACTION || this.combatState === CombatState.PLAYER_SELECT_TARGET;
          ctx.fillStyle = btn.isHovered && canEndTurn ? '#F54E5C' : (canEndTurn ? '#DC3545' : '#888'); // Active/Hover/Disabled colors
          ctx.fillRect(btn.x, btn.y, btn.width, btn.height);
          ctx.strokeStyle = '#FFF'; ctx.lineWidth=1; ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);
          ctx.fillStyle = '#FFF';
          ctx.font = 'bold 18px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2);
     }

      renderDilemmaBox(ctx) {
           if (!this.activeDilemma) return;

           const boxWidth = 500;
           const boxHeight = 250;
           const boxX = CANVAS_WIDTH / 2 - boxWidth / 2;
           const boxY = CANVAS_HEIGHT / 2 - boxHeight / 2;

           // Dim background slightly?
           ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
           ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

           // Background box
           ctx.fillStyle = 'rgba(30, 30, 30, 0.95)';
           ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
           ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2;
           ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

           // Dilemma Text
           ctx.fillStyle = '#FFF'; ctx.font = '18px sans-serif';
           ctx.textAlign = 'center'; ctx.textBaseline = 'top';
           this.wrapText(ctx, this.activeDilemma.text, boxX + boxWidth / 2, boxY + 20, boxWidth - 40, 22);

           // Choices (Uses pre-calculated bounds)
           this.dilemmaChoiceButtons.forEach(button => {
                const bounds = button.bounds;
                const choice = this.activeDilemma.choices[button.index];
                // Draw button background (highlight if hovered)
                ctx.fillStyle = button.isHovered ? '#777' : '#555';
                ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
                ctx.strokeStyle = '#AAA'; ctx.lineWidth = 1;
                ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
                // Draw choice text
                 ctx.fillStyle = '#FFF'; ctx.font = '16px sans-serif';
                 ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                 this.wrapText(ctx, choice.text, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, bounds.width - 10, 18); // Wrap choice text
           });
      }

       renderTargetingLine(ctx) {
           if (this.selectedCardIndex === -1 || !this.gameManager.lastInputPos) return;

           const bounds = this.getCardBoundsInHand(this.selectedCardIndex);
           if (!bounds) return; // Card might have been removed?

           const startX = bounds.x + bounds.width / 2;
           const startY = bounds.y; // From top-middle of card

           const endX = this.gameManager.lastInputPos.x;
           const endY = this.gameManager.lastInputPos.y;

           // Line
           ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
           ctx.lineWidth = 3;
           ctx.setLineDash([10, 5]); // Dashed line
           ctx.beginPath();
           ctx.moveTo(startX, startY);
           ctx.lineTo(endX, endY);
           ctx.stroke();
           ctx.setLineDash([]); // Reset line dash

           // Target circle at mouse cursor
           ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
           ctx.beginPath();
           ctx.arc(endX, endY, 15, 0, Math.PI * 2);
           ctx.fill();
       }

      // Utility for checking mouse over deck piles for UIManager
      isMouseOverDeckPiles(mouseX, mouseY) {
           // Ensure bounds are calculated if needed (they are calculated in renderDeckPiles)
           if (!this.drawPileBounds || !this.discardPileBounds) return false;
           return this.isPointInRect({x: mouseX, y: mouseY}, this.drawPileBounds) ||
                  this.isPointInRect({x: mouseX, y: mouseY}, this.discardPileBounds);
       }


} // End CombatManager Class
