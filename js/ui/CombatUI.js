// js/ui/CombatUI.js

// Import base classes if needed for type hinting or static methods (usually not needed for UI rendering)
import { Card } from '../core/Card.js';
import { Enemy } from '../combat/Enemy.js';
import { Player } from '../core/Player.js';
// Import status definitions for tooltips/icons
import { getStatusEffectDefinition } from '../combat/StatusEffects.js';

/**
 * Manages rendering and interactions specifically for the Combat Screen UI.
 */
export class CombatUI {
    constructor(uiManager, gameState) {
        this.uiManager = uiManager; // Reference back to the main UIManager
        this.gameState = gameState; // Reference to the game state for data access

        // Get references to specific combat screen elements managed by UIManager
        this.combatScreen = document.getElementById('combatScreen');
        this.enemyArea = document.getElementById('enemyArea');
        this.playerArea = document.getElementById('playerArea');
        this.handArea = document.getElementById('handArea');
        this.deckCountElement = document.getElementById('deckCountElement');
        this.discardCountElement = document.getElementById('discardCountElement');
        this.exhaustCountElement = document.getElementById('exhaustCountElement'); // Add if you track exhaust count
        this.endTurnButton = document.getElementById('endTurnButton');

        // Player Stats Elements (ensure these IDs exist within #playerArea in index.html)
        this.playerHPElement = document.getElementById('playerHP');
        this.playerFocusElement = document.getElementById('playerFocus');
        this.playerBlockElement = document.getElementById('playerBlock');
        this.playerStatusesElement = document.getElementById('playerStatusesCombat'); // Ensure specific ID

        // Targeting State (managed by CombatManager, accessed via gameState)
        // this.currentTarget = null; // No need to store target here, get from CombatManager via GameState

        this._setupCombatListeners();
        console.log("CombatUI initialized.");
    }

    /** Setup listeners specific to combat elements */
    _setupCombatListeners() {
        if (this.endTurnButton) {
            this.endTurnButton.onclick = () => {
                // Call end turn logic on the CombatManager via GameState
                this.gameState?.combatManager?.endPlayerTurn();
            };
        }
        // Drag/Drop listeners are setup dynamically in renderHand/_setupDropZones
    }

    /**
     * Updates the entire combat UI. Called by UIManager or CombatManager.
     * @param {Player} player
     * @param {Enemy[]} enemies
     * @param {boolean} isPlayerTurn
     */
    update(player, enemies, isPlayerTurn) {
        if (!this.combatScreen || !player || !enemies) {
             console.error("CombatUI Update failed: Missing screen, player, or enemies.");
             return;
        }
        // console.log("CombatUI: Updating..."); // Can be noisy
        this.updatePlayerInfo(player);
        this.renderEnemies(enemies, isPlayerTurn); // Pass turn state for potential UI changes
        this.renderHand(player.deckManager.hand, isPlayerTurn); // Pass turn state
        this.updateDeckDiscardCounts(player.deckManager);
        this.updateEndTurnButton(isPlayerTurn);
        this.styleTurnIndicator(isPlayerTurn); // Update visual turn indication
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
        if (this.exhaustCountElement) this.exhaustCountElement.textContent = `Exhaust: ${deckManager.getExhaustPileCount()}`;
    }

    /** Updates End Turn button state */
    updateEndTurnButton(isPlayerTurn) {
        if (this.endTurnButton) this.endTurnButton.disabled = !isPlayerTurn;
    }

    /** Styles elements based on whose turn it is */
    styleTurnIndicator(isPlayerTurn) {
        if (this.playerArea) this.playerArea.style.borderColor = isPlayerTurn ? '#3498db' : '#567';
        if (this.enemyArea) this.enemyArea.style.borderColor = !isPlayerTurn ? '#e74c3c' : '#567';
    }

    /** Renders all current enemies */
    renderEnemies(enemies, isPlayerTurn) {
        if (!this.enemyArea) return;
        this.enemyArea.innerHTML = ''; // Clear previous

        enemies.forEach((enemy) => {
            const enemyDiv = document.createElement('div');
            enemyDiv.className = 'enemy-display';
            enemyDiv.dataset.enemyId = enemy.id;
            enemyDiv.style.opacity = enemy.currentHp <= 0 ? 0.4 : 1; // More opacity for dead
             // Highlight based on CombatManager's target state
             const isTargeted = this.gameState?.combatManager?.currentTarget?.id === enemy.id;
             enemyDiv.style.borderColor = isTargeted ? '#f1c40f' : '#ccc';
             if (isTargeted) enemyDiv.classList.add('targeted'); // Add class for potential CSS animation/glow

            // --- Create Sub-Elements ---
            const name = document.createElement('div'); name.className = 'enemy-name'; name.textContent = enemy.name;
            const hpBarOuter = document.createElement('div'); hpBarOuter.className = 'enemy-hp-bar-outer';
            const hpBarInner = document.createElement('div'); hpBarInner.className = 'enemy-hp-bar-inner';
            const hpText = document.createElement('div'); hpText.className = 'enemy-hp-text';
             hpBarInner.style.width = `${Math.max(0, (enemy.currentHp / enemy.maxHp) * 100)}%`;
             hpText.textContent = `${enemy.currentHp} / ${enemy.maxHp}`;
             hpBarOuter.appendChild(hpBarInner); hpBarOuter.appendChild(hpText);

            const block = document.createElement('div'); block.className = 'enemy-block'; block.textContent = enemy.currentBlock > 0 ? `Block: ${enemy.currentBlock}` : '';
            const intent = document.createElement('div'); intent.className = 'enemy-intent'; intent.innerHTML = this.getIntentText(enemy.currentIntent, enemy); // Use innerHTML for icons
            const statuses = document.createElement('div'); statuses.className = 'enemy-statuses';
            this.renderStatuses(enemy.activeStatusEffects, statuses, 'enemy'); // Use helper

            // Append elements
            enemyDiv.appendChild(intent); // Intent at top?
            enemyDiv.appendChild(name);
            enemyDiv.appendChild(hpBarOuter);
            enemyDiv.appendChild(block);
            enemyDiv.appendChild(statuses);

            // Click listener for targeting
             if (enemy.currentHp > 0) {
                 enemyDiv.style.cursor = 'crosshair'; // Indicate targetable
                 enemyDiv.addEventListener('click', () => {
                     if (this.gameState?.combatManager?.playerTurn) {
                         this.gameState.combatManager.setSelectedTarget(enemy);
                         // Re-render enemies to update highlighting immediately
                         this.renderEnemies(this.gameState.combatManager.enemies, true);
                     }
                 });
             } else { enemyDiv.style.cursor = 'default'; }

            this.enemyArea.appendChild(enemyDiv);
        });
    }

    /** Renders status effects into a container element */
    renderStatuses(activeEffects, containerElement, targetType = 'player') { // targetType for styling
        containerElement.innerHTML = 'Statuses: '; // Clear previous
        if (activeEffects && activeEffects.length > 0) {
             activeEffects.forEach(effect => {
                 const definition = getStatusEffectDefinition(effect.id);
                 const effectSpan = document.createElement('span');
                 effectSpan.className = `status-effect ${targetType}-status status-${effect.id.toLowerCase()}`;

                 // Determine display value
                 let displayValue = "";
                 if (definition?.stacking && effect.amount > 1) displayValue = effect.amount;
                 else if (definition?.durationBased && effect.duration > 1 && effect.duration !== 99) displayValue = effect.duration;

                 // Use Icon + Value/Duration
                 effectSpan.innerHTML = `<i class="${definition?.icon || 'fa-solid fa-question-circle'}"></i>${displayValue ? ` ${displayValue}` : ''}`;
                 effectSpan.title = `${definition?.name || effect.id}: ${definition?.description || 'Unknown effect.'}`; // Basic tooltip via title attribute

                 // Add advanced tooltip listener using main UIManager? Optional.
                 // effectSpan.addEventListener('mouseover', (e) => this.uiManager.showTooltip(...));
                 // effectSpan.addEventListener('mouseout', () => this.uiManager.hideTooltip());

                 containerElement.appendChild(effectSpan);
             });
        } else {
            containerElement.innerHTML += " <span class='no-statuses'>None</span>";
        }
    }


    /** Generates descriptive text/HTML for an enemy's intent. */
    getIntentText(intent, enemy) {
        if (!intent || enemy.currentHp <= 0 || enemy.hasStatus('Stunned')) {
            return '<i class="fas fa-question"></i> ???';
        }
        let text = ''; let icon = 'fa-solid fa-question'; let value = '';

        // Calculate predicted values including enemy's Strength/Weak for damage/block
        const intentValue = intent.baseValue || intent.attackValue || intent.blockValue || 0;
        let predictedValue = intentValue;
         if (intent.type.includes('attack')) predictedValue = enemy.applyModifiers('damageDealt', intentValue);
         else if (intent.type.includes('block')) predictedValue = enemy.applyModifiers('blockGain', intentValue);


        switch (intent.type) {
            case 'attack':
                icon = 'fa-solid fa-gavel'; value = predictedValue;
                 if(intent.status) text += ` + ${intent.status}`; // Append status info
                break;
            case 'multi_attack':
                icon = 'fa-solid fa-gavel'; value = `${predictedValue} x ${intent.count || '?'}`;
                 if(intent.status && intent.applyStatusOnce) text += ` + ${intent.status}`;
                 break;
            case 'block':
                icon = 'fa-solid fa-shield-alt'; value = predictedValue;
                break;
            case 'attack_block':
                const attackVal = enemy.applyModifiers('damageDealt', intent.attackValue || 0);
                const blockVal = enemy.applyModifiers('blockGain', intent.blockValue || 0);
                icon = 'fa-solid fa-gavel'; value = `${attackVal} & <i class="fas fa-shield-alt"></i> ${blockVal}`; // Embed second icon
                break;
            case 'debuff':
                icon = 'fa-solid fa-arrow-down'; value = intent.status || 'Debuff';
                break;
            case 'buff': case 'power_up':
                 icon = 'fa-solid fa-arrow-up'; value = intent.status || 'Buff';
                 break;
            case 'special':
                icon = 'fa-solid fa-star'; value = intent.description || intent.id || 'Special';
                break;
             case 'none':
                  icon = 'fa-solid fa-minus-circle'; value = intent.description || 'Waiting';
                  break;
            default: value = 'Unknown';
        }
        return `<i class="${icon}"></i> ${value}${text}`;
    }


    /** Renders the player's hand */
    renderHand(handCards, isPlayerTurn) {
        if (!this.handArea) return;
        this.handArea.innerHTML = ''; // Clear previous

        // --- Calculate Card Positions for Fanning ---
         const numCards = handCards.length;
         const maxWidth = this.handArea.clientWidth * 0.9; // Use 90% of width
         const cardWidth = 120; // From CSS
         const overlap = numCards > 6 ? Math.min(60, cardWidth * 0.6) : 20; // Overlap more if many cards, min 20px gap
         const totalWidth = cardWidth + (numCards - 1) * (cardWidth - overlap);
         let startX = (this.handArea.clientWidth - Math.min(totalWidth, maxWidth)) / 2; // Center the hand
         let cardSpacing = cardWidth - overlap;

         // Adjust spacing if total width exceeds max width
         if (totalWidth > maxWidth) {
             cardSpacing = (maxWidth - cardWidth) / (numCards - 1 || 1);
         }

        handCards.forEach((card, index) => {
            const cardElement = this.uiManager.createCardElement(card); // Use main UIManager's creator
            cardElement.dataset.handIndex = index;

            // Apply positioning for fanning effect
            cardElement.style.position = 'absolute';
            cardElement.style.left = `${startX + index * cardSpacing}px`;
            cardElement.style.bottom = `10px`; // Position near bottom
            // Optional: Add slight rotation/vertical offset for arc
             const angleRange = 20; // Max angle deviation
             const angle = numCards > 1 ? ((index / (numCards - 1)) - 0.5) * angleRange : 0; // Angle from -range/2 to +range/2
             const yOffset = Math.abs(angle) * 0.5; // Lift edges slightly
             cardElement.style.transform = `rotate(${angle}deg) translateY(-${yOffset}px)`;
             cardElement.style.zIndex = 10 + index; // Ensure stacking order is reasonable


             // Re-attach drag listeners IF it's player turn
             if (isPlayerTurn) {
                this._attachCardDragListeners(cardElement, card);
             } else {
                cardElement.draggable = false;
                cardElement.style.cursor = 'default';
             }

            this.handArea.appendChild(cardElement);
        });

        // Re-setup drop zones (might be redundant if called elsewhere, but safe)
        this._setupDropZones();
    }

     /** Attaches drag listeners to a card element */
     _attachCardDragListeners(cardElement, card) {
         cardElement.draggable = true;
         cardElement.style.cursor = 'grab';

         cardElement.ondragstart = (event) => {
             if (!this.gameState?.combatManager?.playerTurn) { event.preventDefault(); return; }
             this.uiManager.draggedCard = card; // Set on main UIManager
             this.uiManager.draggedCardElement = cardElement;
             event.dataTransfer.setData('text/plain', card.id);
             event.dataTransfer.effectAllowed = 'move';
             cardElement.style.opacity = '0.5';
             cardElement.style.cursor = 'grabbing';
         };

         cardElement.ondragend = (event) => {
             if (this.uiManager.draggedCardElement) this.uiManager.draggedCardElement.style.opacity = '1';
             this.uiManager.draggedCard = null;
             this.uiManager.draggedCardElement = null;
             this.uiManager.clearEnemyHighlights(); // Use main UIManager method
             cardElement.style.cursor = 'grab';
         };
     }

    /** Sets up drop zones on enemies/player area */
     _setupDropZones() {
        if (!this.enemyArea || !this.playerArea || !this.gameState || !this.gameState.combatManager || !this.uiManager) return;

         const combatManager = this.gameState.combatManager;
         const uiManager = this.uiManager; // Use reference

         const dropHandler = (event, targetEnemy = null) => {
             event.preventDefault();
             event.currentTarget.classList.remove('drag-over'); // Remove highlight on drop
             if (uiManager.draggedCard) {
                  // Pass card and specific target (or null) to CombatManager
                  combatManager.handlePlayerCardPlay(uiManager.draggedCard, targetEnemy);
             }
             uiManager.draggedCard = null; // Clear drag state on main UIManager
             uiManager.draggedCardElement = null;
             uiManager.clearEnemyHighlights();
         };

         const dragOverHandler = (event) => {
             event.preventDefault();
             event.dataTransfer.dropEffect = 'move';
             event.currentTarget.classList.add('drag-over'); // Add highlight
         };

         const dragLeaveHandler = (event) => {
             event.currentTarget.classList.remove('drag-over'); // Remove highlight
         };

         // Apply to individual living enemy elements
         this.enemyArea.querySelectorAll('.enemy-display').forEach(enemyEl => {
             const enemyId = enemyEl.dataset.enemyId;
             const enemy = combatManager.enemies.find(e => e.id === enemyId);
             if (enemy && enemy.currentHp > 0) {
                 enemyEl.ondragover = dragOverHandler;
                 enemyEl.ondrop = (event) => dropHandler(event, enemy);
                 enemyEl.ondragleave = dragLeaveHandler;
             } else { // Clear listeners on dead enemies
                  enemyEl.ondragover = null; enemyEl.ondrop = null; enemyEl.ondragleave = null;
             }
         });

         // Apply to player area (for self/non-targeted)
         this.playerArea.ondragover = dragOverHandler;
         this.playerArea.ondrop = (event) => dropHandler(event, null);
         this.playerArea.ondragleave = dragLeaveHandler;
     }

     /** Clear highlighting class from enemies */
     clearEnemyHighlights() {
        this.enemyArea?.querySelectorAll('.enemy-display').forEach(el => {
             el.classList.remove('targeted'); // Remove target class
             el.classList.remove('highlighted-enemy'); // Remove acting highlight class
             el.style.borderColor = '#ccc'; // Reset border
         });
     }

      /** Add/Remove highlight for acting enemy */
      highlightEnemy(enemyInstanceId, highlighted = true) {
        this.clearEnemyHighlights(); // Clear previous highlights first
        const enemyElement = this.enemyArea?.querySelector(`.enemy-display[data-enemy-id="${enemyInstanceId}"]`);
        if (enemyElement) {
            if (highlighted) enemyElement.classList.add('highlighted-enemy');
            // Don't remove here, clearEnemyHighlights handles removal
        }
     }

} // End of CombatUI class
