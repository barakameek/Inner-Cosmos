// js/ui/CombatUI.js

// Import base classes if needed for type hinting or static methods
// import { Card } from '../core/Card.js'; // Not strictly needed here if UIManager handles creation
import { Enemy } from '../combat/Enemy.js'; // <-- **** ADDED IMPORT ****
import { Player } from '../core/Player.js'; // May not be needed if player object is always passed in
// Import status definitions for tooltips/icons
import { getStatusEffectDefinition } from '../combat/StatusEffects.js';

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
        this.exhaustCountElement = document.getElementById('exhaustCountElement');
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
                if (!this.gameState?.combatManager?.playerTurn) return;
                this.gameState?.combatManager?.endPlayerTurn();
            };
        }
    }

    /**
     * Updates the entire combat UI based on the current GameState.
     * @param {Player} player
     * @param {Enemy[]} enemies
     * @param {boolean} isPlayerTurn
     */
    update(player, enemies, isPlayerTurn) {
        if (!this.combatScreen || !player || !enemies) {
             console.error("CombatUI Update failed: Missing screen, player, or enemies.");
             return;
        }
        this.updatePlayerInfo(player);
        this.renderEnemies(enemies, isPlayerTurn);
        this.renderHand(player.deckManager.hand, isPlayerTurn);
        this.updateDeckDiscardCounts(player.deckManager);
        this.updateEndTurnButton(isPlayerTurn);
        this.styleTurnIndicator(isPlayerTurn);
        this._setupDropZones(); // Re-setup drop zones after rendering enemies
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
        if (this.exhaustCountElement) {
            this.exhaustCountElement.textContent = `Exhaust: ${deckManager.getExhaustPileCount()}`;
        }
    }

    /** Updates End Turn button state */
    updateEndTurnButton(isPlayerTurn) {
        if (this.endTurnButton) this.endTurnButton.disabled = !isPlayerTurn;
    }

    /** Styles elements based on whose turn it is */
    styleTurnIndicator(isPlayerTurn) {
        if (this.playerArea) this.playerArea.style.borderColor = isPlayerTurn ? '#3498db' : '#566573';
        if (this.enemyArea) this.enemyArea.style.borderColor = !isPlayerTurn ? '#e74c3c' : '#566573';
    }

    /** Renders all current enemies */
    renderEnemies(enemies, isPlayerTurn) {
        if (!this.enemyArea) return;
        this.enemyArea.innerHTML = ''; // Clear previous

        enemies.forEach((enemy) => {
            if (!enemy) return;

            const enemyDiv = document.createElement('div');
            enemyDiv.className = 'enemy-display';
            enemyDiv.dataset.enemyId = enemy.id;
            enemyDiv.style.opacity = enemy.currentHp <= 0 ? 0.4 : 1;

            const currentTargetId = this.gameState?.combatManager?.currentTarget?.id;
            const isTargeted = currentTargetId === enemy.id;
             enemyDiv.style.borderColor = isTargeted ? '#f1c40f' : '#ccc';
             if (isTargeted) enemyDiv.classList.add('targeted');

            const name = document.createElement('div'); name.className = 'enemy-name'; name.textContent = enemy.name;
            const hpBarOuter = document.createElement('div'); hpBarOuter.className = 'enemy-hp-bar-outer';
            const hpBarInner = document.createElement('div'); hpBarInner.className = 'enemy-hp-bar-inner';
            hpBarInner.style.width = `${Math.max(0, (enemy.currentHp / enemy.maxHp) * 100)}%`;
            const hpText = document.createElement('div'); hpText.className = 'enemy-hp-text';
            hpText.textContent = `${enemy.currentHp} / ${enemy.maxHp}`;
            hpBarOuter.appendChild(hpBarInner); hpBarOuter.appendChild(hpText);
            const block = document.createElement('div'); block.className = 'enemy-block'; block.textContent = enemy.currentBlock > 0 ? `Block: ${enemy.currentBlock}` : ''; block.style.minHeight = '1.2em';
            const intent = document.createElement('div'); intent.className = 'enemy-intent'; intent.innerHTML = this.getIntentText(enemy.currentIntent, enemy); intent.style.minHeight = '1.2em';
            const statuses = document.createElement('div'); statuses.className = 'enemy-statuses'; statuses.style.minHeight = '1.5em';
            this.renderStatuses(enemy.activeStatusEffects, statuses, 'enemy');

            enemyDiv.appendChild(intent); enemyDiv.appendChild(name); enemyDiv.appendChild(hpBarOuter); enemyDiv.appendChild(block); enemyDiv.appendChild(statuses);

            enemyDiv.addEventListener('mouseover', (event) => { let ttText = `${enemy.name} | HP: ${enemy.currentHp}/${enemy.maxHp}`; if (enemy.currentBlock > 0) ttText += ` | Block: ${enemy.currentBlock}`; this.uiManager.showTooltip(ttText, event.clientX, event.clientY); });
            enemyDiv.addEventListener('mouseout', () => this.uiManager.hideTooltip());
            enemyDiv.addEventListener('mousemove', (event) => this.uiManager.updateTooltipPosition(event.clientX, event.clientY));

             if (enemy.currentHp > 0 && isPlayerTurn) {
                 enemyDiv.style.cursor = 'crosshair';
                 enemyDiv.addEventListener('click', (e) => {
                      e.stopPropagation();
                     this.gameState?.combatManager?.setSelectedTarget(enemy);
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
        containerElement.innerHTML = '';
        const statusLabel = document.createElement('span'); statusLabel.textContent = 'Statuses: '; containerElement.appendChild(statusLabel);
        if (activeEffects && activeEffects.length > 0) {
             activeEffects.forEach(effect => {
                 const definition = getStatusEffectDefinition(effect.id);
                 if (!definition) {
                      console.warn(`Status definition missing for ID: ${effect.id}`);
                      const effectSpan = document.createElement('span');
                      effectSpan.className = `status-effect ${targetType}-status status-unknown`;
                      effectSpan.innerHTML = `<i class="fa-solid fa-question-circle"></i> ${effect.id}`;
                      effectSpan.title = `Unknown Status: ${effect.id}`; containerElement.appendChild(effectSpan); return;
                 }
                 const effectSpan = document.createElement('span'); effectSpan.className = `status-effect ${targetType}-status status-${effect.id.toLowerCase()}`;
                 let displayValue = ""; const isStacking = definition.stacking; const isDurationBased = definition.durationBased;
                 if (isStacking && effect.amount > 1) displayValue = effect.amount;
                 else if (isDurationBased && effect.duration > 1 && effect.duration !== 99) displayValue = effect.duration;
                 effectSpan.innerHTML = `<i class="${definition.icon || 'fa-solid fa-circle-question'}"></i>${displayValue ? ` ${displayValue}` : ''}`;
                 effectSpan.title = `${definition.name}: ${definition.description}`;
                 containerElement.appendChild(effectSpan);
             });
        } else { const noStatusSpan = document.createElement('span'); noStatusSpan.className = 'no-statuses'; noStatusSpan.textContent = 'None'; containerElement.appendChild(noStatusSpan); }
    }

    /** Generates descriptive text/HTML for an enemy's intent. */
    getIntentText(intent, enemy) {
        if (!intent || !enemy || enemy.currentHp <= 0 || enemy.hasStatus('Stunned')) { return '<i class="fas fa-question"></i> ???'; }
        let text = ''; let icon = 'fa-solid fa-question'; let value = '';
        const baseIntentValue = intent.baseValue ?? intent.attackValue ?? intent.blockValue ?? 0;
        let predictedValue = baseIntentValue;

        try {
            if (intent.type.includes('attack')) { predictedValue = enemy.applyModifiers('damageDealt', baseIntentValue); icon = 'fa-solid fa-gavel'; value = predictedValue; if(intent.status) text += ` + ${intent.status}`; }
            else if (intent.type.includes('block')) { predictedValue = enemy.applyModifiers('blockGain', baseIntentValue); icon = 'fa-solid fa-shield-halved'; value = predictedValue; }
            else {
                 switch (intent.type) {
                     case 'multi_attack': predictedValue = enemy.applyModifiers('damageDealt', baseIntentValue); icon = 'fa-solid fa-gavel'; value = `${predictedValue} x ${intent.count || '?'}`; if(intent.status && intent.applyStatusOnce) text += ` + ${intent.status}`; break;
                     case 'attack_block': const attackVal = enemy.applyModifiers('damageDealt', intent.attackValue || 0); const blockVal = enemy.applyModifiers('blockGain', intent.blockValue || 0); icon = 'fa-solid fa-gavel'; value = `${attackVal} & <i class="fas fa-shield-halved"></i> ${blockVal}`; break;
                     case 'debuff': icon = 'fa-solid fa-arrow-down'; value = intent.status || 'Debuff'; text = ` (${intent.duration || 1}t)`; break;
                     case 'buff': case 'power_up': icon = 'fa-solid fa-arrow-up'; value = intent.status || 'Buff'; if (intent.amount > 1 && ['Strength', 'Dexterity'].includes(intent.status)) text = ` +${intent.amount}`; break;
                     case 'special': icon = 'fa-solid fa-star'; value = intent.description || intent.id || 'Special'; break;
                     case 'none': icon = 'fa-solid fa-circle-minus'; value = intent.description || 'Waiting'; break;
                     default: value = 'Unknown Action';
                 }
            }
        } catch (error) { console.error(`Error calculating intent text for ${enemy.name}:`, error, intent); return '<i class="fas fa-exclamation-triangle"></i> Error'; }
        return `<i class="${icon}"></i> ${value}${text}`;
    }


    /** Renders the player's hand with fanning layout */
    renderHand(handCards, isPlayerTurn) {
        if (!this.handArea) return;
        this.handArea.innerHTML = '';
        const numCards = handCards.length; if (numCards === 0) return;
        const containerWidth = this.handArea.clientWidth; const cardWidth = 120; const cardHeight = 180;
        const maxOverlapRatio = 0.6; const minOverlapRatio = 0.1; const overlapThreshold = 6;
        const overlapRatio = numCards > overlapThreshold ? minOverlapRatio + (maxOverlapRatio - minOverlapRatio) * Math.min(1, (numCards - overlapThreshold) / 5) : minOverlapRatio;
        const overlapPixels = cardWidth * overlapRatio; const cardSpacing = cardWidth - overlapPixels;
        const totalHandWidth = cardWidth + (numCards - 1) * cardSpacing; const maxRenderWidth = containerWidth * 0.95;
        let finalSpacing = cardSpacing; let finalTotalWidth = totalHandWidth;
        if (totalHandWidth > maxRenderWidth) { finalSpacing = (maxRenderWidth - cardWidth) / (numCards - 1 || 1); finalTotalWidth = maxRenderWidth; }
        const startX = (containerWidth - finalTotalWidth) / 2;
        const maxAngle = 30; const anglePerCard = numCards > 1 ? Math.min(maxAngle / (numCards - 1), 8) : 0;
        const startAngle = numCards > 1 ? - (numCards - 1) * anglePerCard / 2 : 0;
        const arcLift = 30;

        handCards.forEach((card, index) => {
            const cardElement = this.uiManager.createCardElement(card);
            if (!cardElement) return;
            cardElement.dataset.handIndex = index;
            const currentAngle = startAngle + index * anglePerCard; const rotation = currentAngle;
            const normalizedIndex = numCards > 1 ? (index / (numCards - 1)) - 0.5 : 0;
            const yOffset = arcLift * (1 - (normalizedIndex * 2)**2);
            cardElement.style.position = 'absolute';
            cardElement.style.left = `${startX + index * finalSpacing}px`;
            cardElement.style.bottom = `${10 + yOffset}px`;
            cardElement.style.transform = `rotate(${rotation}deg)`;
            cardElement.style.zIndex = 10 + index;
            cardElement.addEventListener('mouseenter', () => cardElement.style.zIndex = 100);
            cardElement.addEventListener('mouseleave', () => cardElement.style.zIndex = 10 + index);

             if (isPlayerTurn && card.cost !== null) {
                this._attachCardDragListeners(cardElement, card);
                // Dim card if player cannot afford it
                 if (this.gameState?.player?.currentFocus < card.cost) {
                      cardElement.style.filter = 'grayscale(70%) brightness(0.8)';
                      cardElement.style.cursor = 'not-allowed'; // Indicate cannot play
                      cardElement.draggable = false; // Prevent dragging unaffordable cards
                 } else {
                      cardElement.style.filter = 'none';
                 }
             } else {
                cardElement.draggable = false;
                cardElement.style.cursor = 'default';
                cardElement.style.filter = 'grayscale(70%) brightness(0.8)'; // Dim all cards on enemy turn
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
             if (!this.gameState?.combatManager?.playerTurn || (card.cost !== null && this.gameState.player.currentFocus < card.cost)) { event.preventDefault(); return; }
             this.uiManager.draggedCard = card; this.uiManager.draggedCardElement = cardElement;
             event.dataTransfer.setData('text/plain', card.id); event.dataTransfer.effectAllowed = 'move';
             cardElement.style.opacity = '0.5'; cardElement.style.cursor = 'grabbing';
             document.body.classList.add('dragging-card');
         };
         cardElement.ondragend = (event) => {
             if (this.uiManager.draggedCardElement) { this.uiManager.draggedCardElement.style.opacity = '1'; this.uiManager.draggedCardElement.style.cursor = 'grab'; }
             this.uiManager.draggedCard = null; this.uiManager.draggedCardElement = null;
             this.uiManager.clearEnemyHighlights(); // Clear highlights on drag end
             document.body.classList.remove('dragging-card');
         };
     }

    /** Sets up drop zones on enemies/player area */
     _setupDropZones() {
        if (!this.enemyArea || !this.playerArea || !this.gameState?.combatManager || !this.uiManager) return;
         const combatManager = this.gameState.combatManager; const uiManager = this.uiManager;

         const dropHandler = (event, target = null) => {
             event.preventDefault();
             event.currentTarget.classList.remove('drag-over');
             const draggedCard = uiManager.draggedCard;
             if (draggedCard) {
                 // Pass Enemy instance if target is enemy, otherwise null
                 combatManager.handlePlayerCardPlay(draggedCard, target instanceof Enemy ? target : null);
             }
             // Clear drag state in UIManager (handlePlayerCardPlay should also clear target)
             uiManager.draggedCard = null; uiManager.draggedCardElement = null;
             // Clear visual highlights immediately
             uiManager.clearEnemyHighlights();
         };
         const dragOverHandler = (event) => {
             event.preventDefault();
             if (uiManager.draggedCard) {
                 const card = uiManager.draggedCard; const currentTargetElement = event.currentTarget;
                 const targetIsPlayerArea = currentTargetElement === this.playerArea;
                 let isValidTarget = false;
                 if (targetIsPlayerArea) { isValidTarget = !card.requiresTarget || card.targetType === 'self'; }
                 else { isValidTarget = card.requiresTarget && card.targetType === 'enemy'; }

                 if (isValidTarget) { event.dataTransfer.dropEffect = 'move'; currentTargetElement.classList.add('drag-over'); if (!targetIsPlayerArea) uiManager.highlightEnemy(currentTargetElement.dataset.enemyId, true); }
                 else { event.dataTransfer.dropEffect = 'none'; currentTargetElement.classList.remove('drag-over'); }
             } else { event.dataTransfer.dropEffect = 'none'; }
         };
         const dragLeaveHandler = (event) => {
             event.currentTarget.classList.remove('drag-over');
             const targetIsPlayerArea = event.currentTarget === this.playerArea;
             if (!targetIsPlayerArea) uiManager.highlightEnemy(event.currentTarget.dataset.enemyId, false); // Clear highlight on leave enemy
         };

         // Apply to individual living enemy elements
         this.enemyArea.querySelectorAll('.enemy-display').forEach(enemyEl => {
             const enemyId = enemyEl.dataset.enemyId; const enemy = combatManager.enemies.find(e => e.id === enemyId);
             if (enemy && enemy.currentHp > 0) { enemyEl.ondragover = dragOverHandler; enemyEl.ondrop = (event) => dropHandler(event, enemy); enemyEl.ondragleave = dragLeaveHandler; }
             else { enemyEl.ondragover = null; enemyEl.ondrop = null; enemyEl.ondragleave = null; }
         });
         // Apply to player area
         this.playerArea.ondragover = dragOverHandler; this.playerArea.ondrop = (event) => dropHandler(event, null); // Drop on player area passes null target
         this.playerArea.ondragleave = dragLeaveHandler;
     }

     /** Clear highlighting class from enemies */
     clearEnemyHighlights() {
        this.enemyArea?.querySelectorAll('.enemy-display').forEach(el => {
             el.classList.remove('targeted', 'highlighted-enemy');
             el.style.borderColor = '#ccc';
         });
     }

      /** Add/Remove highlight for acting enemy */
      highlightEnemy(enemyInstanceId, highlighted = true) {
        // Don't clear target highlight here, only acting highlight
        this.enemyArea?.querySelectorAll('.highlighted-enemy').forEach(el => el.classList.remove('highlighted-enemy'));
        const enemyElement = this.enemyArea?.querySelector(`.enemy-display[data-enemy-id="${enemyInstanceId}"]`);
        if (enemyElement) {
            if (highlighted) enemyElement.classList.add('highlighted-enemy');
        }
     }

} // End of CombatUI class
