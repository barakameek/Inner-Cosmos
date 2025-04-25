// js/combatManager.js

const CombatState = {
    PLAYER_CHOOSE_ACTION: 'PlayerChooseAction', // Waiting for player card play or end turn
    PLAYER_SELECT_TARGET: 'PlayerSelectTarget', // Player selected a card needing a target
    PLAYER_ANIMATING: 'PlayerAnimating',       // Visual feedback for player action (optional)
    ENEMY_ANIMATING: 'EnemyAnimating',         // Visual feedback for enemy action
    ENEMY_TURN_START: 'EnemyTurnStart',       // Brief phase before enemies act
    ENEMY_ACTING: 'EnemyActing',             // Enemies performing their actions sequentially
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
        this.player = player;
        this.gameManager = gameManager; // To access relics, trigger effects, end combat
        this.enemies = this.setupEnemies(enemyIds);

        this.currentTurn = 'player'; // Player always starts first?
        this.turnCount = 0;
        this.combatState = CombatState.PLAYER_CHOOSE_ACTION;

        // UI/Input State
        this.selectedCardIndex = -1; // Index of card selected in hand
        this.selectedCardNeedsTarget = false;
        this.hoveredCardIndex = -1;
        this.hoveredEnemyIndex = -1;
        this.endTurnButton = { x: CANVAS_WIDTH - 150, y: CANVAS_HEIGHT - 100, width: 120, height: 40, text: "End Turn" };

        // Combat Flow State
        this.isCombatOver = false;
        this.playerWon = false;
        this.pendingRewards = { insightShards: 0, cardChoices: [], relicChoice: null }; // Rewards accumulated *during* combat (if any, mostly post-combat)

        this.activeDilemma = null; // Stores dilemma data when active { id, text, choices: [{ text, effects }] }
        this.dilemmaChoiceButtons = []; // Stores bounding boxes for dilemma choices

        // Queue for animations or sequential actions
        this.actionQueue = [];

        console.log(`Combat starting against: ${this.enemies.map(e => e.name).join(', ')}`);
    }

    setupEnemies(enemyIds) {
        const enemies = [];
        const enemyCount = enemyIds.length;
        // Simple positioning logic: Spread enemies horizontally
        const totalWidth = (enemyCount - 1) * 200; // Approx width needed
        const startX = CANVAS_WIDTH / 2 - totalWidth / 2;
        const yPos = CANVAS_HEIGHT * 0.4; // Position enemies higher up

        enemyIds.forEach((id, index) => {
            const xPos = startX + index * 200;
            const enemyInstance = new Enemy(id, xPos, yPos);
            enemies.push(enemyInstance);
        });
        return enemies;
    }

    startCombat() {
        this.turnCount = 1;
        console.log(`--- Combat Turn ${this.turnCount} (Player) ---`);
        this.player.triggerEffects('onCombatStart', this.gameManager); // Player start-of-combat effects
        this.enemies.forEach(enemy => enemy.triggerEffects?.('onCombatStart', this)); // Enemy start-of-combat effects

        // Start player's first turn
        this.startPlayerTurn();
        this.combatState = CombatState.PLAYER_CHOOSE_ACTION;
    }

    // --- Main Loop Functions ---

    update(deltaTime) {
        if (this.isCombatOver) return;

        this.updateHoverStates(); // Update hover based on current mouse pos (from gameManager?)

        switch (this.combatState) {
            case CombatState.PLAYER_CHOOSE_ACTION:
                // Waiting for input via handleInput
                break;
            case CombatState.PLAYER_SELECT_TARGET:
                // Waiting for input via handleInput (click on enemy)
                break;
            case CombatState.ENEMY_TURN_START:
                // Short delay maybe? Then proceed.
                this.startEnemyActions();
                break;
            case CombatState.ENEMY_ACTING:
                this.processEnemyActions(deltaTime);
                break;
             case CombatState.DILEMMA:
                 // Waiting for input via handleInput (click on choice)
                 break;
            // Add PLAYER_ANIMATING / ENEMY_ANIMATING states if complex animations are needed
        }
    }

    render(ctx) {
        // 1. Render Background / Arena elements? (Optional)

        // 2. Render Enemies
        this.renderEnemies(ctx);

        // 3. Render Player Representation? (Maybe just HUD)

        // 4. Render Player HUD (HP, Insight, Statuses - potentially part of global HUD)
        this.renderPlayerHUD(ctx); // Specific combat HUD elements

        // 5. Render Deck Piles (Counts)
        this.renderDeckPiles(ctx);

        // 6. Render Hand
        this.renderHand(ctx);

        // 7. Render Combat UI (End Turn Button)
        this.renderCombatUI(ctx);

         // 8. Render Dilemma Box (if active)
         if (this.combatState === CombatState.DILEMMA && this.activeDilemma) {
             this.renderDilemmaBox(ctx);
         }

         // 9. Render Targeting Line (if selecting target)
         if (this.combatState === CombatState.PLAYER_SELECT_TARGET && this.selectedCardIndex !== -1) {
              this.renderTargetingLine(ctx);
         }
    }

    // --- Input Handling ---

    handleInput(clickPos) {
        if (this.isCombatOver) return;
        // console.log(`Combat Input @ (${clickPos.x}, ${clickPos.y}), State: ${this.combatState}`);

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
        }
    }

    handlePlayerActionInput(clickPos) {
        // Check click on End Turn Button
        if (this.isPointInRect(clickPos, this.endTurnButton)) {
            console.log("End Turn button clicked.");
            this.endPlayerTurn();
            return;
        }

        // Check click on Hand Cards
        for (let i = 0; i < this.player.hand.length; i++) {
            const cardBounds = this.getCardBoundsInHand(i);
            if (this.isPointInRect(clickPos, cardBounds)) {
                 this.trySelectCard(i);
                 return; // Stop checking cards
            }
        }

        // If clicked elsewhere, maybe deselect card?
        if (this.selectedCardIndex !== -1) {
             console.log("Clicked outside hand, deselecting card.");
             this.deselectCard();
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
                      return;
                 }
             }
        }

        // Check click on Player (for self-targeting cards)?
        // const playerBounds = { x: ..., y: ..., width: ..., height: ... }; // Define player area
        // if (this.isPointInRect(clickPos, playerBounds)) {
        //     this.playSelectedCard(null, true); // Play card on self
        //     return;
        // }

        // Clicked outside valid targets - cancel targeting
        console.log("Clicked outside valid targets, cancelling targeting.");
        this.deselectCard();
        this.combatState = CombatState.PLAYER_CHOOSE_ACTION;
    }

     handleDilemmaInput(clickPos) {
          if (!this.activeDilemma) return;
          this.dilemmaChoiceButtons.forEach((button, index) => {
               if (this.isPointInRect(clickPos, button)) {
                    console.log(`Dilemma choice ${index + 1} selected.`);
                    this.resolveDilemmaChoice(index);
               }
          });
     }

     updateHoverStates() {
         if (!this.gameManager.lastInputPos) return; // Assumes GameManager stores last mouse position
         const mouseX = this.gameManager.lastInputPos.x;
         const mouseY = this.gameManager.lastInputPos.y;

          // Hand hover
          this.hoveredCardIndex = -1;
          if (this.combatState === CombatState.PLAYER_CHOOSE_ACTION) {
             for (let i = 0; i < this.player.hand.length; i++) {
                  const cardBounds = this.getCardBoundsInHand(i);
                  if (this.isPointInRect({x: mouseX, y: mouseY}, cardBounds)) {
                       this.hoveredCardIndex = i;
                       break;
                  }
             }
          }

          // Enemy hover (for targeting or info)
          this.hoveredEnemyIndex = -1;
          for (let i = 0; i < this.enemies.length; i++) {
              if (this.enemies[i].currentHp > 0) {
                   const enemyBounds = this.getEnemyBounds(this.enemies[i]);
                   if (this.isPointInRect({x: mouseX, y: mouseY}, enemyBounds)) {
                        this.hoveredEnemyIndex = i;
                        break;
                   }
              }
          }
          // Update enemy hover state
          this.enemies.forEach((enemy, index) => enemy.isHovered = (index === this.hoveredEnemyIndex));
     }

    // --- Turn Management ---

    nextTurn() {
        if (this.isCombatOver) return;

        if (this.currentTurn === 'player') {
            this.startEnemyTurn();
        } else {
            this.turnCount++;
            console.log(`--- Combat Turn ${this.turnCount} (Player) ---`);
            this.startPlayerTurn();
        }
    }

    startPlayerTurn() {
        this.currentTurn = 'player';
        this.player.startTurn(this.gameManager);
        this.deselectCard();
        this.combatState = CombatState.PLAYER_CHOOSE_ACTION;
        // Check for Dilemma triggers at start of player turn?
    }

    endPlayerTurn() {
         if (this.combatState !== CombatState.PLAYER_CHOOSE_ACTION) return; // Prevent ending turn mid-action

        this.player.endTurn(this.gameManager);
        this.deselectCard();
        this.nextTurn();
    }

    startEnemyTurn() {
        this.currentTurn = 'enemy';
        console.log(`--- Combat Turn ${this.turnCount} (Enemy) ---`);
        this.player.resetMomentum(); // Momentum definitely resets before enemy turn

        // Enemies choose their moves (set intents)
        this.enemies.forEach(enemy => {
            if (enemy.currentHp > 0) {
                enemy.startTurn(this);
                enemy.chooseNextMove();
            }
        });

        this.combatState = CombatState.ENEMY_TURN_START; // Move to brief pause before acting
        // Optional: Add a slight delay before enemies act using setTimeout or animation queue
        // setTimeout(() => this.startEnemyActions(), 500);
    }

    startEnemyActions() {
         // Create action queue for enemies
         this.actionQueue = this.enemies.filter(e => e.currentHp > 0 && e.currentMove).map(e => e.instanceId);
         if (this.actionQueue.length > 0) {
              this.combatState = CombatState.ENEMY_ACTING;
         } else {
              console.log("No enemies have actions this turn.");
              this.endEnemyTurn(); // Skip directly to end if no actions
         }
    }

    processEnemyActions(deltaTime) {
         // For now, execute all actions instantly sequentially
         // Later, this could handle animations with delays
         if (this.actionQueue.length > 0) {
              const enemyInstanceId = this.actionQueue.shift(); // Get next enemy to act
              const enemy = this.getEnemyInstanceById(enemyInstanceId);
              if (enemy && enemy.currentHp > 0 && enemy.currentMove) {
                   enemy.executeMove(this.player, this);
                   this.checkPlayerDefeat(); // Check if player died mid-turn
                   if (this.isCombatOver) return;
              }

              // If queue empty after this action, end the turn
              if (this.actionQueue.length === 0) {
                  this.endEnemyTurn();
              }
         } else {
              // Should not happen if logic is correct, but safety check
              this.endEnemyTurn();
         }
    }


    endEnemyTurn() {
         this.enemies.forEach(enemy => {
             if(enemy.currentHp > 0) enemy.endTurn?.(this); // Optional enemy end-of-turn logic
         });
         this.nextTurn(); // Start player's next turn
    }

    // --- Player Card Play ---

    trySelectCard(index) {
         const card = this.player.hand[index];
         if (!card || !card.isPlayable()) {
              console.log(`Cannot play card ${card?.name}: Not playable (Curse/Status).`);
              return;
         }
         if (this.player.cardsPlayedThisTurn >= this.player.maxCardsPerTurn) {
              console.log(`Cannot play card ${card.name}: Max cards per turn (${this.player.maxCardsPerTurn}) reached.`);
              // TODO: Add visual feedback (shake card?)
              return;
         }

         if (!this.player.canAfford(card.cost)) {
              console.log(`Cannot play card ${card.name}: Costs ${card.cost}, Player has ${this.player.currentInsight}.`);
              // TODO: Add visual feedback (red tint?)
              return;
         }

         // If already selected, try to play it immediately (if no target needed)
         if (index === this.selectedCardIndex) {
             if (!this.cardNeedsTargeting(card)) {
                  this.playSelectedCard(null); // Play on default target (null usually means no specific enemy)
             } else {
                 // Card needs target, stay selected
                  console.log(`Card ${card.name} requires a target.`);
                  this.combatState = CombatState.PLAYER_SELECT_TARGET;
             }
             return;
         }

         // Select the new card
         this.deselectCard(); // Deselect previous if any
         this.selectedCardIndex = index;
         this.selectedCardNeedsTarget = this.cardNeedsTargeting(card);
          console.log(`Selected card: ${card.name} (Needs Target: ${this.selectedCardNeedsTarget})`);


         if (this.selectedCardNeedsTarget) {
             this.combatState = CombatState.PLAYER_SELECT_TARGET;
         } else {
             // Optional: If preference is to play immediately on select for non-target cards:
             // this.playSelectedCard(null);
             // Or require explicit second click / drag-to-play later. Keep selection for now.
         }
    }

    cardNeedsTargeting(card) {
        // Simple check: Does the card deal damage or apply a debuff listed in effects?
        // More complex cards might need explicit flags in their definitions.
        const effects = card.effects;
        if (effects.dealBruise?.target === 'enemy') return true;
        if (effects.applyStatus?.target === 'enemy') return true;
        // Add checks for other enemy-targeted effects
        return false;
    }

    deselectCard() {
        this.selectedCardIndex = -1;
        this.selectedCardNeedsTarget = false;
         if(this.combatState === CombatState.PLAYER_SELECT_TARGET) {
             this.combatState = CombatState.PLAYER_CHOOSE_ACTION;
         }
    }

    /**
     * Plays the currently selected card.
     * @param {number | null} targetEnemyIndex - Index of the target enemy, or null if no target or self-target.
     * @param {boolean} [selfTarget=false] - Whether the target is explicitly the player.
     */
    playSelectedCard(targetEnemyIndex = null, selfTarget = false) {
        if (this.selectedCardIndex < 0 || this.selectedCardIndex >= this.player.hand.length) {
            console.error("Attempted to play card with invalid selected index.");
            return;
        }
        const card = this.player.hand[this.selectedCardIndex];
        let targetEnemy = null;

        if (targetEnemyIndex !== null && targetEnemyIndex >= 0 && targetEnemyIndex < this.enemies.length) {
            targetEnemy = this.enemies[targetEnemyIndex];
            if (targetEnemy.currentHp <= 0) {
                console.log("Cannot target defeated enemy.");
                return; // Don't play card if target is invalid
            }
        }

        // Check if targeting requirements met
        if (this.selectedCardNeedsTarget && !targetEnemy) {
            console.log("Card requires an enemy target, but none was provided or valid.");
            this.combatState = CombatState.PLAYER_SELECT_TARGET; // Stay in targeting mode
            return;
        }
        // TODO: Add checks for self-targeting cards requiring explicit self-click?

        // Check affordability and play limit again (safety check)
        if (!card.isPlayable() || !this.player.canAfford(card.cost) || this.player.cardsPlayedThisTurn >= this.player.maxCardsPerTurn) {
             console.warn(`Cannot play card ${card.name}: Condition failed (Affordability/Limit/Playable).`);
             this.deselectCard();
             this.combatState = CombatState.PLAYER_CHOOSE_ACTION;
             return;
        }

        // --- Conditions Met - Play the Card ---
        console.log(`Playing card: ${card.name}` + (targetEnemy ? ` on ${targetEnemy.name}` : ''));

        // 1. Spend Insight
        this.player.spendInsight(card.cost);

        // 2. Increment play counter
        this.player.cardsPlayedThisTurn++;

        // 3. Generate Momentum
        this.player.generateMomentum(card.element, this.gameManager);

        // 4. Execute Card Effects
        this.executeCardEffects(card, targetEnemy, selfTarget); // Pass target instance

        // 5. Trigger 'onPlayCard' effects (Powers, Relics)
         this.player.triggerEffects('onPlayCard', this.gameManager, { card: card.definition, target: targetEnemy });
         if (card.element === Elements.INTERACTION) { // Specific trigger for Dominance(Psych) example
             this.player.triggerEffects('onPlayInteractionCard', this.gameManager, { card: card.definition, target: targetEnemy });
         }


        // 6. Move card from hand to appropriate pile (discard or exhaust)
        // Remove card from hand FIRST
        const playedCardInstance = this.player.hand.splice(this.selectedCardIndex, 1)[0];

        if (card.hasKeyword(StatusEffects.EXHAUST)) {
            this.player.exhaustPile.push(playedCardInstance);
            console.log(`Card '${playedCardInstance.name}' exhausted.`);
        } else {
            this.player.discardPile.push(playedCardInstance);
            // console.log(`Card '${playedCardInstance.name}' discarded.`);
        }

        // 7. Reset selection state
        this.deselectCard();
        this.combatState = CombatState.PLAYER_CHOOSE_ACTION; // Return to choosing action

        // 8. Check for enemy defeat after effects resolve
        this.checkEnemyDefeat();
        if(this.checkCombatEnd()) return; // Don't continue if combat ended

         // 9. Check if max cards played
         if (this.player.cardsPlayedThisTurn >= this.player.maxCardsPerTurn) {
             // Optional: Automatically end turn? Or just prevent further plays? Let's prevent.
              console.log("Max cards played this turn.");
         }
    }

    executeCardEffects(card, targetEnemy, selfTarget) {
        const effects = card.effects;
        const playerTarget = selfTarget ? this.player : null; // Determine player target

        // --- Primary Effects ---
        if (effects.dealBruise) {
            const effect = effects.dealBruise;
            const baseAmount = effect.amount + this.player.getStatus('Strength'); // Add player Strength
            let target = (effect.target === 'enemy' && targetEnemy) ? targetEnemy : null; // Only target if specified and exists
            if (target) {
                this.applyDamageToEnemy(target, baseAmount, card.element);
            } else if (effect.target === 'all_enemies') {
                 this.enemies.forEach(enemy => {
                      if (enemy.currentHp > 0) this.applyDamageToEnemy(enemy, baseAmount, card.element);
                 });
            }
             // Handle player damage if target === 'player'
        }
        if (effects.gainGuard) {
             const effect = effects.gainGuard;
             const amount = effect.amount; // + potential buffs based on resonance/momentum?
             this.player.gainGuard(amount);
        }
        if (effects.drawCards) {
             this.player.drawCards(effects.drawCards);
        }
         if (effects.gainInsight) {
             this.player.gainInsight(effects.gainInsight);
         }
         if (effects.applyStatus) {
             const effect = effects.applyStatus;
             let target = (effect.target === 'enemy' && targetEnemy) ? targetEnemy : (effect.target === 'player' ? this.player : null);
             if (target) {
                  target.applyStatus(effect.status, effect.amount || 1, effect.duration || 1);
             } else if (effect.target === 'all_enemies') {
                  this.enemies.forEach(enemy => {
                      if(enemy.currentHp > 0) enemy.applyStatus(effect.status, effect.amount || 1, effect.duration || 1);
                  });
             }
         }
         if (effects.applyPower) {
              // Apply power to player
              this.player.addPower(card.baseDefinition, effects.applyPower.stacks || 1, effects.applyPower.permanent ? Infinity : effects.applyPower.duration || Infinity);
         }
          // Add handlers for other effects like addCardToDiscard, etc.

        // --- Momentum Effects ---
        if (card.momentumEffect && this.player.momentum >= card.momentumEffect.threshold) {
            console.log(`Triggering Momentum effect for ${card.name}`);
            this.executeCardEffects(card.momentumEffect, targetEnemy, selfTarget); // Recurse with sub-effects object
        }

        // --- Resonance Effects ---
         // Check if *this* card's element matches an element with resonance
        if (card.element !== Elements.NEUTRAL && this.player.getResonance(card.element) > 0) {
              // Basic resonance bonus: Maybe +X damage/block? Needs design.
              // Example: Add +2 damage per resonance stack
              // if (effects.dealBruise) {
              //    const bonusDamage = this.player.getResonance(card.element) * 2;
              //    console.log(`Resonance Bonus: +${bonusDamage} Bruise`);
              //    // Apply bonus damage... needs careful target handling
              // }
              console.log(`Card matches element ${card.element} with Resonance ${this.player.getResonance(card.element)} (Bonus effect needed)`);
        }
         // Check if the card has a specific resonance bonus effect structure
         if (card.resonanceEffect) {
              // Check if the *required* element for the bonus has resonance
              const requiredElement = card.resonanceEffect.element;
              if (this.player.getResonance(requiredElement) > 0) {
                  console.log(`Triggering Resonance bonus effect for ${card.name} (requires ${requiredElement})`);
                   this.executeCardEffects(card.resonanceEffect, targetEnemy, selfTarget);
              }
         }
    }


    applyDamageToEnemy(enemy, amount, element) {
         const damageResult = enemy.takeBruise(amount, element);

         // Handle Resonance Gain on Weakness Hit
         if (damageResult.isWeaknessHit) {
              this.player.triggerResonance(element, 1); // Gain 1 Resonance for hitting weakness
               // Also trigger 'onResonanceTrigger' effects
               this.player.triggerEffects('onResonanceTrigger', this.gameManager, { element: element, target: enemy });
         }
         // Handle Dissonance Gain on Resistance Hit
         if (damageResult.isResistanceHit) {
              const penalty = RESISTANCE_DISSONANCE_PENALTY; // From constants.js
               console.log(`Hit Resistance. Adding ${penalty} Static to discard.`);
               for (let i=0; i < penalty; i++) {
                   const staticCard = getCardDefinition('status_static');
                   if (staticCard) {
                       this.player.addCardToDeck(new Card(staticCard), 'discard');
                   }
               }
         }
    }


    // --- Dilemma Handling ---
    triggerDilemma(dilemmaData) {
         console.log(`Dilemma Triggered: ${dilemmaData.id} - ${dilemmaData.text}`);
         this.activeDilemma = dilemmaData;
         this.combatState = CombatState.DILEMMA;
         // UI needs to render the box and choices based on activeDilemma
    }

     resolveDilemmaChoice(choiceIndex) {
         if (!this.activeDilemma || choiceIndex < 0 || choiceIndex >= this.activeDilemma.choices.length) {
             console.error("Invalid dilemma choice index.");
             return;
         }
          if (this.combatState !== CombatState.DILEMMA) return; // Prevent resolving outside dilemma state

         const chosenOption = this.activeDilemma.choices[choiceIndex];
         console.log(`Resolving Dilemma: Chose "${chosenOption.text}"`);

         // Execute effects of the choice
         if (chosenOption.effects) {
              // Use a temporary card-like structure to reuse effect execution logic
              this.executeCardEffects({ effects: chosenOption.effects }, null, true); // Assume effects target player unless specified
               // Need to enhance executeCardEffects to handle enemy targets from dilemma choice effects
               // Example: chosenOption.effects: { applyStatusToEnemy: { status: 'Strength', amount: 3 } }
         }

         this.activeDilemma = null; // Clear the dilemma
         this.combatState = CombatState.PLAYER_CHOOSE_ACTION; // Return control to player
     }

    // --- Combat End Checks ---

    checkPlayerDefeat() {
        if (this.player.currentHp <= 0) {
            console.log("Player defeated!");
            this.endCombat(false);
            return true;
        }
        return false;
    }

    checkEnemyDefeat() {
        const allEnemiesDefeated = this.enemies.every(enemy => enemy.currentHp <= 0);
        if (allEnemiesDefeated) {
            console.log("All enemies defeated!");
            this.endCombat(true);
            return true;
        }
        return false;
    }

    /** Checks both player and enemy defeat conditions. */
    checkCombatEnd() {
         if (this.isCombatOver) return true; // Already ended
         return this.checkPlayerDefeat() || this.checkEnemyDefeat();
    }

    endCombat(playerVictory) {
        if (this.isCombatOver) return; // Prevent double-ending

        console.log(`Combat ending. Player Victory: ${playerVictory}`);
        this.isCombatOver = true;
        this.playerWon = playerVictory;
        this.combatState = CombatState.GAME_OVER;

        if (playerVictory) {
            // --- Calculate Rewards ---
            let totalShards = 0;
            let cardRewardPool = []; // Potential card choices
            let offeredRelicId = null;

            this.enemies.forEach(enemy => {
                 // Accumulate base shards (Maybe from enemy definition later?)
                 totalShards += getRandomInt(5, 15);
                 if (enemy.definition.isElite) totalShards += getRandomInt(25, 40);
                 if (enemy.definition.isBoss) totalShards += getRandomInt(80, 120);

                 // Add potential card rewards based on enemy? (Simpler: generate post-combat)
            });

             this.pendingRewards.insightShards = totalShards;

             // Generate card/relic rewards based on the *last* encounter type (from GameManager node info)
             const encounterType = this.gameManager.currentNode.type; // Assumes GameManager tracks current node
              this.pendingRewards.cardChoices = this.gameManager.generateCardRewards(encounterType);
              if (encounterType === NodeType.ELITE_ENCOUNTER || encounterType === NodeType.BOSS) {
                   this.pendingRewards.relicChoice = this.gameManager.generateRelicReward(encounterType);
              }

             console.log("Calculated Rewards:", this.pendingRewards);
        } else {
            // Handle player defeat - usually minimal/no rewards
            this.pendingRewards = { insightShards: 0, cardChoices: [], relicChoice: null };
        }

        // Signal GameManager that combat is over
        // GameManager's update loop will detect this via combatManager.isCombatOver()
        // and handle the transition to RewardScreen or RunOver screen.
    }

    // --- Helpers ---

    getEnemyInstanceById(instanceId) {
        return this.enemies.find(e => e.instanceId === instanceId);
    }

    isPointInRect(point, rect) {
        return point.x >= rect.x && point.x <= rect.x + rect.width &&
               point.y >= rect.y && point.y <= rect.y + rect.height;
    }

    // --- Rendering Functions (Placeholders - Need proper layout) ---

     renderPlayerHUD(ctx) {
          // Display Insight, Momentum, Resonance, Statuses relevant to combat
          const hudX = 20;
          let hudY = CANVAS_HEIGHT - 150; // Bottom left area

          // Insight
          ctx.fillStyle = '#6495ED'; // Cornflower Blue
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(`Insight: ${this.player.currentInsight} / ${this.player.maxInsight}`, hudX, hudY);
          hudY += 30;

          // Momentum
          ctx.fillStyle = '#FFD700'; // Gold
          ctx.font = '18px sans-serif';
          ctx.fillText(`Momentum (${this.player.lastElementPlayed}): ${this.player.momentum}`, hudX, hudY);
          hudY += 25;

          // Resonance
          Object.entries(this.player.resonance).forEach(([element, value]) => {
              if (value > 0) {
                   ctx.fillStyle = ElementColors[element] || '#CCC';
                   ctx.fillText(`Resonance (${element}): ${value}`, hudX, hudY);
                   hudY += 20;
              }
          });

          // Player Statuses (Simplified list)
          hudY += 10; // Gap before statuses
           Object.entries(this.player.statusEffects).forEach(([key, status]) => {
               let amount = 0;
               if (typeof status === 'number') amount = status;
               else if (typeof status === 'object') amount = status.amount;
               if(amount <= 0) return; // Skip empty

               let icon = '?';
               let text = `${key}: ${amount}`;
               switch(key) {
                   case StatusEffects.GUARD: icon = '🛡️'; text = `${icon} ${amount}`; break;
                   case StatusEffects.VULNERABLE: icon = '💥'; text = `${icon} Vulnerable ${amount}t`; break; // Assuming duration stored
                   case StatusEffects.WEAK: icon = '💧'; text = `${icon} Weak ${amount}t`; break;
                    // Add more...
               }
                ctx.fillStyle = '#FFF';
                ctx.font = '14px sans-serif';
                ctx.fillText(text, hudX, hudY);
                hudY += 18;
           });
     }

     renderEnemies(ctx) {
          this.enemies.forEach((enemy, index) => {
               if (enemy.currentHp > 0) {
                   enemy.render(ctx); // Enemy draws itself (HP, intent, statuses)

                    // Draw targeting highlight if needed
                    if (this.combatState === CombatState.PLAYER_SELECT_TARGET) {
                         const bounds = this.getEnemyBounds(enemy);
                         ctx.strokeStyle = '#FF0000'; // Red target highlight
                         ctx.lineWidth = 2;
                         ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
                    } else if (index === this.hoveredEnemyIndex) {
                         const bounds = this.getEnemyBounds(enemy);
                         ctx.strokeStyle = '#FFFF00'; // Yellow hover highlight
                         ctx.lineWidth = 2;
                         ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
                    }
               }
               // Else: Render defeated state? (Optional)
          });
     }

     renderHand(ctx) {
          const hand = this.player.hand;
          const handSize = hand.length;
          if (handSize === 0) return;

          const cardWidth = 100;
          const cardHeight = 140;
          const handWidth = handSize * (cardWidth + 10) - 10; // Total width including spacing
          const startX = (CANVAS_WIDTH / 2) - (handWidth / 2);
          let cardY = CANVAS_HEIGHT - cardHeight - 20; // Base Y position

          // Draw cards
          hand.forEach((card, index) => {
              let currentY = cardY;
              const cardBounds = this.getCardBoundsInHand(index); // Get calculated bounds

              // Hover effect: Move card up slightly
              if (index === this.hoveredCardIndex || index === this.selectedCardIndex) {
                  currentY -= 20;
                  cardBounds.y -= 20; // Adjust bounds for hover state if needed for interaction checks
              }

              // Basic Card Background
               ctx.fillStyle = '#444';
               ctx.strokeStyle = (index === this.selectedCardIndex) ? '#FFFF00' : ElementColors[card.element] || '#888'; // Highlight selected / Element color border
               ctx.lineWidth = (index === this.selectedCardIndex) ? 3 : 2;
               ctx.fillRect(cardBounds.x, currentY, cardBounds.width, cardBounds.height);
               ctx.strokeRect(cardBounds.x, currentY, cardBounds.width, cardBounds.height);

               // Card Text (Basic)
               ctx.fillStyle = '#FFF';
               ctx.textAlign = 'center';
               // Name
               ctx.font = '14px sans-serif';
               ctx.textBaseline = 'top';
               ctx.fillText(card.name, cardBounds.x + cardBounds.width / 2, currentY + 5);
               // Cost
               if (card.cost !== null) {
                    ctx.font = 'bold 18px sans-serif';
                    ctx.fillStyle = this.player.canAfford(card.cost) ? '#FFF' : '#F88'; // Red if too expensive
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'top';
                    ctx.fillText(card.cost.toString(), cardBounds.x + 5, currentY + 5);
               }
                // Description (simplified)
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                this.wrapText(ctx, card.description, cardBounds.x + cardBounds.width / 2, currentY + cardBounds.height - 5, cardBounds.width - 10, 12);

          });
     }

     // Utility to wrap text within card bounds
     wrapText(context, text, x, y, maxWidth, lineHeight) {
         const words = text.split(' ');
         let line = '';
         let lines = [];

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

         // Draw lines from bottom up
         for (let k = lines.length - 1; k >= 0; k--) {
             context.fillText(lines[k].trim(), x, y - (lines.length - 1 - k) * lineHeight);
         }
     }


     getCardBoundsInHand(index) {
         const hand = this.player.hand;
         const handSize = hand.length;
         const cardWidth = 100;
         const cardHeight = 140;
         const spacing = 10;
         const handWidth = handSize * (cardWidth + spacing) - spacing;
         const startX = (CANVAS_WIDTH / 2) - (handWidth / 2);
         let cardY = CANVAS_HEIGHT - cardHeight - 20; // Base Y

         // Card position (adjust Y if hovered/selected later)
         const cardX = startX + index * (cardWidth + spacing);

         return { x: cardX, y: cardY, width: cardWidth, height: cardHeight };
     }

     getEnemyBounds(enemy) {
          // Based on enemy rendering properties
          return {
              x: enemy.position.x - enemy.width / 2,
              y: enemy.position.y - enemy.height,
              width: enemy.width,
              height: enemy.height
          };
     }


     renderDeckPiles(ctx) {
          const pileX = CANVAS_WIDTH - 80; // Right side
          let pileY = CANVAS_HEIGHT / 2 - 50;

          ctx.fillStyle = '#FFF';
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Draw Pile
          ctx.fillStyle = '#8B4513'; // Brown
          ctx.fillRect(pileX - 25, pileY - 35, 50, 70);
          ctx.fillStyle = '#FFF';
          ctx.fillText(`${this.player.drawPile.length}`, pileX, pileY);
          ctx.fillText(`Draw`, pileX, pileY + 15);

          pileY += 100; // Move down for discard

          // Discard Pile
          ctx.fillStyle = '#555'; // Grey
           ctx.fillRect(pileX - 25, pileY - 35, 50, 70);
           ctx.fillStyle = '#FFF';
          ctx.fillText(`${this.player.discardPile.length}`, pileX, pileY);
          ctx.fillText(`Discard`, pileX, pileY + 15);

           // Exhaust Pile (Optional display)
           // pileY += 100;
           // ctx.fillStyle = '#222'; // Dark
           // ctx.fillRect(pileX - 25, pileY - 35, 50, 70);
           // ctx.fillStyle = '#AAA';
           // ctx.fillText(`${this.player.exhaustPile.length}`, pileX, pileY);
           // ctx.fillText(`Exhaust`, pileX, pileY + 15);
     }

     renderCombatUI(ctx) {
          // End Turn Button
          const btn = this.endTurnButton;
          ctx.fillStyle = (this.combatState === CombatState.PLAYER_CHOOSE_ACTION) ? '#DC3545' : '#888'; // Red when active, grey otherwise
          ctx.fillRect(btn.x, btn.y, btn.width, btn.height);
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

           // Background box
           ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
           ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
           ctx.strokeStyle = '#FFF';
           ctx.lineWidth = 2;
           ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

           // Dilemma Text
           ctx.fillStyle = '#FFF';
           ctx.font = '18px sans-serif';
           ctx.textAlign = 'center';
           ctx.textBaseline = 'top';
           this.wrapText(ctx, this.activeDilemma.text, boxX + boxWidth / 2, boxY + 20, boxWidth - 40, 22);

           // Choices
           const choiceButtonHeight = 40;
           const choiceSpacing = 15;
           const choiceWidth = boxWidth * 0.8;
           const choiceStartX = boxX + boxWidth * 0.1;
           let choiceY = boxY + boxHeight - (choiceButtonHeight + choiceSpacing) * this.activeDilemma.choices.length; // Start from bottom up

           this.dilemmaChoiceButtons = []; // Clear previous bounds

           this.activeDilemma.choices.forEach((choice, index) => {
                const btnBounds = {
                    x: choiceStartX,
                    y: choiceY,
                    width: choiceWidth,
                    height: choiceButtonHeight
                };
                this.dilemmaChoiceButtons.push(btnBounds);

                // Draw button
                ctx.fillStyle = '#555';
                ctx.fillRect(btnBounds.x, btnBounds.y, btnBounds.width, btnBounds.height);
                ctx.strokeStyle = '#AAA';
                ctx.lineWidth = 1;
                ctx.strokeRect(btnBounds.x, btnBounds.y, btnBounds.width, btnBounds.height);

                // Draw choice text
                 ctx.fillStyle = '#FFF';
                 ctx.font = '16px sans-serif';
                 ctx.textAlign = 'center';
                 ctx.textBaseline = 'middle';
                 ctx.fillText(choice.text, btnBounds.x + btnBounds.width / 2, btnBounds.y + btnBounds.height / 2);

                choiceY += choiceButtonHeight + choiceSpacing;
           });
      }

       renderTargetingLine(ctx) {
           if (this.selectedCardIndex === -1 || !this.gameManager.lastInputPos) return;

           const handCardBounds = this.getCardBoundsInHand(this.selectedCardIndex);
           const startX = handCardBounds.x + handCardBounds.width / 2;
           const startY = handCardBounds.y; // From top-middle of card in hand (adjust if needed)

           const endX = this.gameManager.lastInputPos.x;
           const endY = this.gameManager.lastInputPos.y;

           ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)'; // Semi-transparent red
           ctx.lineWidth = 3;
           ctx.beginPath();
           ctx.moveTo(startX, startY);
           ctx.lineTo(endX, endY);
           ctx.stroke();

           // Optional: Draw target circle at mouse cursor
           ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
           ctx.beginPath();
           ctx.arc(endX, endY, 15, 0, Math.PI * 2);
           ctx.fill();
       }

}
