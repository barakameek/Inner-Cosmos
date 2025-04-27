// js/ui/CombatUI.js

// Import base classes if needed (usually not for UI rendering)
// import { Card } from '../core/Card.js';
// import { Enemy } from '../combat/Enemy.js';
// import { Player } from '../core/Player.js';

// Import status definitions for tooltips/icons
import { getStatusEffectDefinition } from '../combat/StatusEffects.js'; // Correct path if StatusEffects is in js/combat

/**
 * Manages rendering and interactions specifically for the Combat Screen UI.
 */
export class CombatUI {
    constructor(uiManager, gameState) {
        if (!uiManager) throw new Error("CombatUI requires a UIManager instance.");
        if (!gameState) throw new Error("CombatUI requires a GameState instance.");

        this.uiManager = uiManager;
        this.gameState = gameState;

        // Get references to specific combat screen elements managed by UIManager
        this.combatScreen = document.getElementById('combatScreen');
        this.enemyArea = document.getElementById('enemyArea');
        this.playerArea = document.getElementById('playerArea');
        this.handArea = document.getElementById('handArea');
        this.deckCountElement = document.getElementById('deckCountElement');
        this.discardCountElement = document.getElementById('discardCountElement');
        this.exhaustCountElement = document.getElementById('exhaustCountElement'); // Ensure this exists in HTML if used
        this.endTurnButton = document.getElementById('endTurnButton');

        // Player Stats Elements
        this.playerHPElement = document.getElementById('playerHP');
        this.playerFocusElement = document.getElementById('playerFocus');
        this.playerBlockElement = document.getElementById('playerBlock');
        this.playerStatusesElement = document.getElementById('playerStatusesCombat');

        if (!this.combatScreen || !this.enemyArea || !this.playerArea || !this.handArea || !this.endTurnButton || !this.playerHPElement || !this.playerFocusElement || !this.playerBlockElement || !this.playerStatusesElement || !this.deckCountElement || !this.discardCountElement) {
            console.error("CombatUI Error: One or more required combat screen elements not found in the DOM.");
        }

        this._setupCombatListeners();
        console.log("CombatUI initialized.");
    }

    /** Setup listeners specific to combat elements */
    _setupCombatListeners() {
        if (this.endTurnButton) {
            this.endTurnButton.onclick = () => {
                if (!this.gameState?.combatManager?.playerTurn) return; // Prevent clicks when not player turn
                this.gameState?.combatManager?.endPlayerTurn();
            };
        }
        // Drag/Drop listeners are setup dynamically in renderHand/_setupDropZones
    }

    /**
     * Updates the entire combat UI based on the current GameState.
     * @param {Player} player - The current player object.
     * @param {Enemy[]} enemies - Array of current enemy objects.
     * @param {boolean} isPlayerTurn - Indicates if it's the player's turn.
     */
    update(player, enemies, isPlayerTurn) {
        if (!this.combatScreen || !player || !enemies) {
             console.error("CombatUI Update failed: Missing screen, player, or enemies.");
             return;
        }
        // console.log("CombatUI: Updating..."); // Noisy

        this.updatePlayerInfo(player);
        this.renderEnemies(enemies, isPlayerTurn);
        this.renderHand(player.deckManager.hand, isPlayerTurn);
        this.updateDeckDiscardCounts(player.deckManager);
        this.updateEndTurnButton(isPlayerTurn);
        this.styleTurnIndicator(isPlayerTurn);

        // Ensure drop zones are updated after rendering enemies/player area
        this._setupDropZones();
    }

    /** Updates player HP, Focus, Block, Statuses */
    updatePlayerInfo(player) {
        if (!player) return;
        if (this.playerHPElement) this.playerHPElement.textContent = `HP: ${player.currentIntegrity} / ${player.maxIntegrity}`;
        if (this.playerFocusElement) this.playerFocusElement.textContent = `Focus: ${player.currentFocus} / ${player.maxFocus}`;
        if (this.playerBlockElement) this.playerBlockElement.textContent = `Block: ${player.currentBlock}`;
        if (this.playerStatusesElement) {
            this.renderStatuses(player.activeStatusEffects, this.playerStatusesElement, 'player');
        }
    }

    /** Updates Deck/Discard/Exhaust counts */
    updateDeckDiscardCounts(deckManager) {
        if (!deckManager) return;
        if (this.deckCountElement) this.deckCountElement.textContent = `Deck: ${deckManager.getDrawPileCount()}`;
        if (this.discardCountElement) this.discardCountElement.textContent = `Discard: ${deckManager.getDiscardPileCount()}`;
        if (this.exhaustCountElement) { // Check if element exists
            this.exhaustCountElement.textContent = `Exhaust: ${deckManager.getExhaustPileCount()}`;
        } else {
             // console.warn("Exhaust count element not found.");
        }
    }

    /** Updates End Turn button state */
    updateEndTurnButton(isPlayerTurn) {
        if (this.endTurnButton) this.endTurnButton.disabled = !isPlayerTurn;
    }

    /** Styles elements based on whose turn it is */
    styleTurnIndicator(isPlayerTurn) {
        if (this.playerArea) this.playerArea.style.borderColor = isPlayerTurn ? '#3498db' : '#566573'; // Adjusted inactive color
        if (this.enemyArea) this.enemyArea.style.borderColor = !isPlayerTurn ? '#e74c3c' : '#566573'; // Adjusted inactive color
    }

    /** Renders all current enemies */
    renderEnemies(enemies, isPlayerTurn) {
        if (!this.enemyArea) return;
        this.enemyArea.innerHTML = ''; // Clear previous

        enemies.forEach((enemy) => {
            if (!enemy) return; // Skip if enemy data is somehow null

            const enemyDiv = document.createElement('div');
            enemyDiv.className = 'enemy-display';
            enemyDiv.dataset.enemyId = enemy.id; // Use unique instance ID
            enemyDiv.style.opacity = enemy.currentHp <= 0 ? 0.4 : 1;

            // Highlight based on CombatManager's target state (accessed via gameState)
            const currentTargetId = this.gameState?.combatManager?.currentTarget?.id;
            const isTargeted = currentTargetId === enemy.id;
             enemyDiv.style.borderColor = isTargeted ? '#f1c40f' : '#ccc';
             if (isTargeted) enemyDiv.classList.add('targeted');


            // --- Create Sub-Elements ---
            const name = document.createElement('div'); name.className = 'enemy-name'; name.textContent = enemy.name;

            // --- HP Bar ---
             const hpBarOuter = document.createElement('div');
             hpBarOuter.className = 'enemy-hp-bar-outer';
             const hpBarInner = document.createElement('div');
             hpBarInner.className = 'enemy-hp-bar-inner';
             hpBarInner.style.width = `${Math.max(0, (enemy.currentHp / enemy.maxHp) * 100)}%`;
             const hpText = document.createElement('div'); // Separate text element overlay
             hpText.className = 'enemy-hp-text';
             hpText.textContent = `${enemy.currentHp} / ${enemy.maxHp}`;
             hpBarOuter.appendChild(hpBarInner);
             hpBarOuter.appendChild(hpText); // Text on top

            const block = document.createElement('div'); block.className = 'enemy-block'; block.textContent = enemy.currentBlock > 0 ? `Block: ${enemy.currentBlock}` : ''; block.style.minHeight = '1.2em'; // Prevent layout shift

            const intent = document.createElement('div'); intent.className = 'enemy-intent'; intent.innerHTML = this.getIntentText(enemy.currentIntent, enemy); intent.style.minHeight = '1.2em';

            const statuses = document.createElement('div'); statuses.className = 'enemy-statuses'; statuses.style.minHeight = '1.5em'; // Space for statuses
            this.renderStatuses(enemy.activeStatusEffects, statuses, 'enemy');

            // Append elements (Intent at top makes sense)
            enemyDiv.appendChild(intent);
            enemyDiv.appendChild(name);
            enemyDiv.appendChild(hpBarOuter);
            enemyDiv.appendChild(block);
            enemyDiv.appendChild(statuses);

             // Add tooltip listener using main UIManager
             enemyDiv.addEventListener('mouseover', (event) => { let ttText = `${enemy.name} | HP: ${enemy.currentHp}/${enemy.maxHp}`; if (enemy.currentBlock > 0) ttText += ` | Block: ${enemy.currentBlock}`; this.uiManager.showTooltip(ttText, event.clientX, event.clientY); });
             enemyDiv.addEventListener('mouseout', () => this.uiManager.hideTooltip());
             enemyDiv.addEventListener('mousemove', (event) => this.uiManager.updateTooltipPosition(event.clientX, event.clientY));


            // Click listener for targeting (only if alive and player's turn)
             if (enemy.currentHp > 0 && isPlayerTurn) {
                 enemyDiv.style.cursor = 'crosshair';
                 enemyDiv.addEventListener('click', (e) => {
                      e.stopPropagation(); // Prevent potential event bubbling issues
                     this.gameState?.combatManager?.setSelectedTarget(enemy);
                     // Note: setSelectedTarget now triggers re-render in CombatManager via CombatUI call
                 });
             } else {
                 enemyDiv.style.cursor = 'default';
             }

            this.enemyArea.appendChild(enemyDiv);
        });
    }

    /** Renders status effects into a container element */
    renderStatuses(activeEffects, containerElement, targetType = 'player') {
        if (!containerElement) return;
        containerElement.innerHTML = ''; // Clear previous content
        const statusLabel = document.createElement('span');
        statusLabel.textContent = 'Statuses: ';
        containerElement.appendChild(statusLabel);

        if (activeEffects && activeEffects.length > 0) {
             activeEffects.forEach(effect => {
                 const definition = getStatusEffectDefinition(effect.id);
                 if (!definition) { // Handle unknown statuses gracefully
                      console.warn(`Status definition not found for ID: ${effect.id}`);
                      const effectSpan = document.createElement('span');
                      effectSpan.className = `status-effect ${targetType}-status status-unknown`;
                      effectSpan.innerHTML = `<i class="fa-solid fa-question-circle"></i> ${effect.id}`;
                      effectSpan.title = `Unknown Status: ${effect.id}`;
                      containerElement.appendChild(effectSpan);
                      return;
                 }

                 const effectSpan = document.createElement('span');
                 effectSpan.className = `status-effect ${targetType}-status status-${effect.id.toLowerCase()}`;

                 // Determine display value (amount for stacking, duration otherwise if > 1 and not 99)
                 let displayValue = "";
                 const isStacking = definition.stacking;
                 const isDurationBased = definition.durationBased;
                 if (isStacking && effect.amount > 1) displayValue = effect.amount;
                 else if (isDurationBased && effect.duration > 1 && effect.duration !== 99) displayValue = effect.duration;

                 // Use Icon + Value/Duration
                 effectSpan.innerHTML = `<i class="${definition.icon || 'fa-solid fa-circle-question'}"></i>${displayValue ? ` ${displayValue}` : ''}`;
                 // Basic tooltip via title attribute
                 effectSpan.title = `${definition.name}: ${definition.description}`;

                 // TODO: Add advanced tooltip listener using main UIManager?
                 // effectSpan.addEventListener('mouseover', (e) => this.uiManager.showTooltip(...));
                 // effectSpan.addEventListener('mouseout', () => this.uiManager.hideTooltip());

                 containerElement.appendChild(effectSpan);
             });
        } else {
            const noStatusSpan = document.createElement('span');
            noStatusSpan.className = 'no-statuses';
            noStatusSpan.textContent = 'None';
            containerElement.appendChild(noStatusSpan);
        }
    }


    /** Generates descriptive text/HTML for an enemy's intent. */
    getIntentText(intent, enemy) {
        if (!intent || !enemy || enemy.currentHp <= 0 || enemy.hasStatus('Stunned')) {
            return '<i class="fas fa-question"></i> ???'; // Default unknown/stunned intent
        }

        let text = ''; // Additional text like status effect names
        let icon = 'fa-solid fa-question'; // Default icon
        let value = ''; // Numerical value or main description part

        // Calculate predicted values including enemy's Strength/Weak for damage/block
        // IMPORTANT: Use the BASE value from the intent object, NOT the pre-calculated one
        // because buffs/debuffs on the enemy might change between intent determination and execution.
        // We show the *potential* effect based on *current* enemy stats.
        const baseIntentValue = intent.baseValue ?? intent.attackValue ?? intent.blockValue ?? 0;
        let predictedValue = baseIntentValue; // Start with base

        try {
            if (intent.type.includes('attack')) {
                 predictedValue = enemy.applyModifiers('damageDealt', baseIntentValue); // Calculate damage with current buffs/debuffs
                 icon = 'fa-solid fa-gavel'; // Sword/Attack icon
                 value = predictedValue;
                 if(intent.status) text += ` + ${intent.status}`; // Append status info if attack applies one
            } else if (intent.type.includes('block')) {
                 predictedValue = enemy.applyModifiers('blockGain', baseIntentValue); // Calculate block with current buffs/debuffs
                 icon = 'fa-solid fa-shield-halved'; // Shield icon
                 value = predictedValue;
            } else {
                 // Handle non-damage/block intents
                 switch (intent.type) {
                     case 'multi_attack':
                         predictedValue = enemy.applyModifiers('damageDealt', baseIntentValue);
                         icon = 'fa-solid fa-gavel'; value = `${predictedValue} x ${intent.count || '?'}`;
                         if(intent.status && intent.applyStatusOnce) text += ` + ${intent.status}`;
                         break;
                     case 'attack_block':
                         const attackVal = enemy.applyModifiers('damageDealt', intent.attackValue || 0);
                         const blockVal = enemy.applyModifiers('blockGain', intent.blockValue || 0);
                         icon = 'fa-solid fa-gavel'; value = `${attackVal} & <i class="fas fa-shield-halved"></i> ${blockVal}`; // Embed second icon
                         break;
                     case 'debuff':
                         icon = 'fa-solid fa-arrow-down'; value = intent.status || 'Debuff'; text = ` (${intent.duration || 1}t)`; // Show duration
                         break;
                     case 'buff': case 'power_up':
                         icon = 'fa-solid fa-arrow-up'; value = intent.status || 'Buff';
                          // Show amount if > 1 for stacking buffs
                          if (intent.amount > 1 && ['Strength', 'Dexterity'].includes(intent.status)) text = ` +${intent.amount}`;
                         break;
                     case 'special':
                         icon = 'fa-solid fa-star'; value = intent.description || intent.id || 'Special';
                         break;
                     case 'none':
                         icon = 'fa-solid fa-circle-minus'; value = intent.description || 'Waiting';
                         break;
                     default: value = 'Unknown Action';
                 }
            }
        } catch (error) {
             console.error(`Error calculating intent text for ${enemy.name}:`, error, intent);
             return '<i class="fas fa-exclamation-triangle"></i> Error';
        }

        return `<i class="${icon}"></i> ${value}${text}`;
    }


    /** Renders the player's hand with fanning layout */
    renderHand(handCards, isPlayerTurn) {
        if (!this.handArea) return;
        this.handArea.innerHTML = ''; // Clear previous

        const numCards = handCards.length;
        if (numCards === 0) return; // Nothing to render

        const containerWidth = this.handArea.clientWidth;
        const cardWidth = 120; // From CSS
        const cardHeight = 180; // From CSS

        // --- Calculate Overlap and Spacing ---
        // Aim for less overlap with fewer cards, more with many
        const maxOverlapRatio = 0.6; // Max 60% overlap
        const minOverlapRatio = 0.1; // Min 10% overlap (max 90% visible)
        const overlapThreshold = 6; // Start significant overlapping after this many cards
        const overlapRatio = numCards > overlapThreshold
            ? minOverlapRatio + (maxOverlapRatio - minOverlapRatio) * Math.min(1, (numCards - overlapThreshold) / 5) // Gradually increase overlap
            : minOverlapRatio;
        const overlapPixels = cardWidth * overlapRatio;
        const cardSpacing = cardWidth - overlapPixels;

        const totalHandWidth = cardWidth + (numCards - 1) * cardSpacing;
        const maxRenderWidth = containerWidth * 0.95; // Use 95% of width to avoid edge clipping

        let finalSpacing = cardSpacing;
        let finalTotalWidth = totalHandWidth;

        // If the calculated width exceeds the container, compress spacing
        if (totalHandWidth > maxRenderWidth) {
            finalSpacing = (maxRenderWidth - cardWidth) / (numCards - 1 || 1); // Avoid division by zero if only 1 card
            finalTotalWidth = maxRenderWidth;
        }

        const startX = (containerWidth - finalTotalWidth) / 2; // Center the hand horizontally

        // --- Calculate Arc/Fan ---
        const maxAngle = 30; // Max total arc angle
        const anglePerCard = numCards > 1 ? Math.min(maxAngle / (numCards - 1), 8) : 0; // Limit angle per card
        const startAngle = numCards > 1 ? - (numCards - 1) * anglePerCard / 2 : 0;
        const arcRadius = finalTotalWidth * 1.5; // Adjust for desired arc flatness
        const arcLift = 30; // How much the center lifts compared to edges

        // --- Render Cards ---
        handCards.forEach((card, index) => {
            const cardElement = this.uiManager.createCardElement(card); // Use main UIManager's creator
            if (!cardElement) return; // Skip if card creation failed
            cardElement.dataset.handIndex = index;

            // Calculate position and rotation for fan
            const currentAngle = startAngle + index * anglePerCard;
            const rotation = currentAngle;
             // Calculate y-offset for arc (simple parabola)
            const normalizedIndex = numCards > 1 ? (index / (numCards - 1)) - 0.5 : 0; // -0.5 to 0.5
            const yOffset = arcLift * (1 - (normalizedIndex * 2)**2); // Parabolic lift, max at center

            cardElement.style.position = 'absolute';
            cardElement.style.left = `${startX + index * finalSpacing}px`;
            cardElement.style.bottom = `${10 + yOffset}px`; // Base position + arc lift
            cardElement.style.transform = `rotate(${rotation}deg)`;
            cardElement.style.zIndex = 10 + index; // Basic stacking
             // Add hover effect adjustments (ensure hover style handles this)
             cardElement.addEventListener('mouseenter', () => cardElement.style.zIndex = 100);
             cardElement.addEventListener('mouseleave', () => cardElement.style.zIndex = 10 + index);


             // Attach drag listeners IF it's player turn AND card is playable
             if (isPlayerTurn && card.cost !== null) { // Check if playable cost
                this._attachCardDragListeners(cardElement, card);
             } else {
                cardElement.draggable = false;
                cardElement.style.cursor = 'default';
                 if (card.cost !== null && player.currentFocus < card.cost) {
                      cardElement.style.filter = 'grayscale(70%) brightness(0.8)'; // Dim unplayable cards
                 }
             }

            this.handArea.appendChild(cardElement);
        });
    }

     /** Attaches drag listeners to a card element */
     _attachCardDragListeners(cardElement, card) {
        if (!cardElement || !card) return;
         cardElement.draggable = true;
         cardElement.style.cursor = 'grab';

         cardElement.ondragstart = (event) => {
             // Double-check turn state and playability (e.g., focus cost)
             if (!this.gameState?.combatManager?.playerTurn || (card.cost !== null && this.gameState.player.currentFocus < card.cost)) {
                  event.preventDefault(); return;
             }
             this.uiManager.draggedCard = card;
             this.uiManager.draggedCardElement = cardElement;
             event.dataTransfer.setData('text/plain', card.id); // Use unique instance ID
             event.dataTransfer.effectAllowed = 'move';
             cardElement.style.opacity = '0.5';
             cardElement.style.cursor = 'grabbing';
             // Optional: Add a class for global dragging styles
             document.body.classList.add('dragging-card');
         };

         cardElement.ondragend = (event) => {
             if (this.uiManager.draggedCardElement) {
                 this.uiManager.draggedCardElement.style.opacity = '1';
                 this.uiManager.draggedCardElement.style.cursor = 'grab'; // Reset cursor
             }
             this.uiManager.draggedCard = null;
             this.uiManager.draggedCardElement = null;
             this.uiManager.clearEnemyHighlights(); // Clear any lingering highlights
             document.body.classList.remove('dragging-card'); // Remove global class
         };
     }

    /** Sets up drop zones on enemies/player area */
     _setupDropZones() {
        if (!this.enemyArea || !this.playerArea || !this.gameState?.combatManager || !this.uiManager) return;

         const combatManager = this.gameState.combatManager;
         const uiManager = this.uiManager; // Use reference

         const dropHandler = (event, target = null) => { // Target can be Enemy or Player instance
             event.preventDefault();
             event.currentTarget.classList.remove('drag-over');
             const draggedCard = uiManager.draggedCard; // Get from main manager
             if (draggedCard) {
                 // Pass card and specific target (Enemy instance or null for player area drop)
                 combatManager.handlePlayerCardPlay(draggedCard, target instanceof Enemy ? target : null);
             }
              // Clear drag state regardless of success, handled in handlePlayerCardPlay
              // uiManager.draggedCard = null;
              // uiManager.draggedCardElement = null;
              // uiManager.clearEnemyHighlights(); // Done in handlePlayerCardPlay
         };

         const dragOverHandler = (event) => {
             event.preventDefault();
             if (uiManager.draggedCard) {
                 const card = uiManager.draggedCard;
                 const currentTargetElement = event.currentTarget;
                 const targetIsPlayerArea = currentTargetElement === this.playerArea;
                 let isValidTarget = false;

                 if (targetIsPlayerArea) {
                      // Valid to drop on player area if card doesn't require enemy target
                      isValidTarget = !card.requiresTarget || card.targetType === 'self';
                 } else { // Dropping on enemy
                      // Valid if card requires enemy target
                      isValidTarget = card.requiresTarget && card.targetType === 'enemy';
                 }

                 if (isValidTarget) {
                     event.dataTransfer.dropEffect = 'move';
                     currentTargetElement.classList.add('drag-over');
                     // Optionally highlight specific enemy if dropping on it
                     if (!targetIsPlayerArea) uiManager.highlightEnemy(currentTargetElement.dataset.enemyId, true);
                 } else {
                     event.dataTransfer.dropEffect = 'none'; // Indicate invalid drop
                     currentTargetElement.classList.remove('drag-over');
                 }
             } else {
                  event.dataTransfer.dropEffect = 'none';
             }
         };

         const dragLeaveHandler = (event) => {
             event.currentTarget.classList.remove('drag-over');
              // Optionally clear specific enemy highlight if leaving it
             const targetIsPlayerArea = event.currentTarget === this.playerArea;
              if (!targetIsPlayerArea) uiManager.highlightEnemy(event.currentTarget.dataset.enemyId, false);
         };

         // Apply to individual living enemy elements
         this.enemyArea.querySelectorAll('.enemy-display').forEach(enemyEl => {
             const enemyId = enemyEl.dataset.enemyId;
             const enemy = combatManager.enemies.find(e => e.id === enemyId);
             if (enemy && enemy.currentHp > 0) {
                 enemyEl.ondragover = dragOverHandler;
                 enemyEl.ondrop = (event) => dropHandler(event, enemy); // Pass enemy instance
                 enemyEl.ondragleave = dragLeaveHandler;
             } else { // Clear listeners on dead enemies
                  enemyEl.ondragover = null; enemyEl.ondrop = null; enemyEl.ondragleave = null;
             }
         });

         // Apply to player area (for self/non-targeted)
         this.playerArea.ondragover = dragOverHandler;
         this.playerArea.ondrop = (event) => dropHandler(event, this.gameState.player); // Pass player for self-target validation? Or null? Null is safer.
         this.playerArea.ondragleave = dragLeaveHandler;
     }

     /** Clear highlighting class from enemies */
     clearEnemyHighlights() {
        this.enemyArea?.querySelectorAll('.enemy-display').forEach(el => {
             el.classList.remove('targeted'); // Remove target selection class
             el.classList.remove('highlighted-enemy'); // Remove acting highlight class
             el.style.borderColor = '#ccc'; // Reset border
         });
     }

      /** Add/Remove highlight for acting enemy */
      highlightEnemy(enemyInstanceId, highlighted = true) {
        // console.log(`Highlighting enemy ${enemyInstanceId}: ${highlighted}`); // Debug
        // Don't clear other highlights here, allow selection highlight to persist
        // this.clearEnemyHighlights();
        const enemyElement = this.enemyArea?.querySelector(`.enemy-display[data-enemy-id="${enemyInstanceId}"]`);
        if (enemyElement) {
            if (highlighted) {
                enemyElement.classList.add('highlighted-enemy'); // Add specific class for acting highlight
            } else {
                enemyElement.classList.remove('highlighted-enemy');
            }
        }
     }

} // End of CombatUI class

