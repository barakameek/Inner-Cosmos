// js/ui/UIManager.js

import { Card } from '../core/Card.js';
import { Artifact } from '../core/Artifact.js';
// Need MetaProgression to display its data
import { MetaProgression } from '../meta/MetaProgression.js'; // Adjust path as needed


/**
 * Manages UI updates and interactions with the DOM.
 */
export class UIManager {
    constructor(gameContainerId = 'gameContainer') {
        this.gameContainer = document.getElementById(gameContainerId);
        if (!this.gameContainer) {
            throw new Error(`UIManager Error: Game container with ID "${gameContainerId}" not found!`);
        }
        this.gameState = null;
        this.metaProgression = null; // Add reference for meta screen
        this.screens = {};
        this.currentScreen = null;

        // --- References ---
        this.startGameButton = document.getElementById('startGameButton');
        this.loadGameButton = document.getElementById('loadGameButton');
        this.metaProgressionButton = document.getElementById('metaProgressionButton');
        this.settingsButton = document.getElementById('settingsButton');
        this.mapArea = document.getElementById('mapArea');
        this.playerInfoMap = document.getElementById('playerInfoMap');
        this.enemyArea = document.getElementById('enemyArea');
        this.playerArea = document.getElementById('playerArea');
        this.handArea = document.getElementById('handArea');
        this.deckCountElement = document.getElementById('deckCountElement');
        this.discardCountElement = document.getElementById('discardCountElement');
        this.endTurnButton = document.getElementById('endTurnButton');
        this.playerHPElement = document.getElementById('playerHP');
        this.playerFocusElement = document.getElementById('playerFocus');
        this.playerBlockElement = document.getElementById('playerBlock');
        this.eventText = document.getElementById('eventText');
        this.eventChoices = document.getElementById('eventChoices');
        this.rewardScreen = document.getElementById('rewardScreen');
        this.rewardCardsArea = document.getElementById('rewardCards');
        this.rewardArtifactsArea = document.getElementById('rewardArtifacts');
        this.rewardInsightText = document.getElementById('rewardInsight');
        this.rewardSkipButton = document.getElementById('rewardSkipButton');
        this.shopScreen = document.getElementById('shopScreen'); // Get ref to screen itself
        this.shopCards = document.getElementById('shopCards');
        this.shopArtifacts = document.getElementById('shopArtifacts');
        this.shopRemoveService = document.getElementById('shopRemoveService');
        this.shopInsightDisplay = document.getElementById('shopInsightDisplay'); // Ref for shop insight
        this.leaveShopButton = document.getElementById('leaveShopButton');
        this.restSiteScreen = document.getElementById('restSiteScreen'); // Get ref to screen itself
        this.restUsedIndicator = document.getElementById('restUsedIndicator'); // Ref for rest site indicator
        this.restHealButton = document.getElementById('restHealButton');
        this.restMeditateButton = document.getElementById('restMeditateButton');
        this.restJournalButton = document.getElementById('restJournalButton');
        this.leaveRestSiteButton = document.getElementById('leaveRestSiteButton');
        this.metaScreen = document.getElementById('metaScreen'); // Get ref to screen itself
        this.metaContent = document.getElementById('metaContent'); // Area to display meta info
        this.backToMenuButton = document.getElementById('backToMenuButton');
        this.tooltipElement = document.getElementById('tooltip');
        this.modalPopup = document.getElementById('modalPopup');
        this.modalText = document.getElementById('modalText');
        this.modalChoices = document.getElementById('modalChoices');
        this.modalCloseButton = this.modalPopup ? this.modalPopup.querySelector('.close-button') : null;
        this.cardSelectionModal = document.getElementById('cardSelectionModal');
        this.cardSelectionGrid = document.getElementById('cardSelectionGrid');
        this.cardSelectionTitle = document.getElementById('cardSelectionTitle');
        this.cardSelectionCancelButton = document.getElementById('cardSelectionCancel');
        this.notificationArea = document.getElementById('notificationArea');
        this.actionFeedbackArea = document.getElementById('actionFeedbackArea');

        // Card Drag State
        this.draggedCard = null;
        this.draggedCardElement = null;
        this.currentTarget = null; // Store targeted enemy (set by CombatManager)

        this._collectScreens(); // Collect screen elements by ID
        this._ensureFeedbackAreasExist(); // Ensure feedback divs are present
        this._setupCommonListeners();
        this._setupNodeActionListeners();
        console.log("UIManager initialized.");
    }

    /** Stores references to GameState and MetaProgression. */
    setReferences(gameState, metaProgression) {
        this.gameState = gameState;
        this.metaProgression = metaProgression;
    }

    /** Finds and stores references to all screen elements. */
    _collectScreens() {
        const screenElements = this.gameContainer.querySelectorAll('.screen');
        screenElements.forEach(screen => {
            if (screen.id) { // Only collect screens with IDs
                this.screens[screen.id] = screen;
                screen.classList.remove('active');
            }
        });
         // Ensure core screens are found
         if(!this.screens['mainMenuScreen']) console.error("UIManager Error: Main menu screen not found!");
         if(!this.screens['mapScreen']) console.error("UIManager Error: Map screen not found!");
         if(!this.screens['combatScreen']) console.error("UIManager Error: Combat screen not found!");
        console.log("UIManager: Found screens:", Object.keys(this.screens));
    }

     /** Ensures feedback areas exist, creating them if necessary. */
     _ensureFeedbackAreasExist() {
        if (!this.notificationArea) {
             this.notificationArea = this._createFeedbackArea('notificationArea', 'bottom', 'right');
        }
         if (!this.actionFeedbackArea) {
             this.actionFeedbackArea = this._createFeedbackArea('actionFeedbackArea', 'top', 'center');
         }
     }

     /** Creates a container div for notifications or action feedback. */
     _createFeedbackArea(id, vAlign = 'bottom', hAlign = 'right') {
         console.warn(`Creating placeholder div for missing feedback area #${id}`);
         const area = document.createElement('div');
         area.id = id;
         area.style.position = 'absolute'; // Position relative to gameContainer
         area.style.zIndex = '150';
         area.style.pointerEvents = 'none';
         area.style.display = 'flex';
         area.style.flexDirection = 'column';
         area.style.gap = '5px'; // Space out messages

         if (vAlign === 'top') area.style.top = '20px';
         else area.style.bottom = '20px'; // Default bottom

         if (hAlign === 'center') {
             area.style.left = '50%';
             area.style.transform = 'translateX(-50%)';
             area.style.alignItems = 'center';
             area.style.width = '60%'; // Limit width for centering
             area.style.maxWidth = '500px';
         } else if (hAlign === 'left') {
             area.style.left = '20px';
             area.style.alignItems = 'flex-start';
         } else { // Default right
             area.style.right = '20px';
             area.style.alignItems = 'flex-end';
         }

         this.gameContainer.appendChild(area); // Append inside game container
         return area;
     }

    /** Sets up listeners for common UI elements like modal close buttons. */
    _setupCommonListeners() { /* ... keep existing ... */
         if (this.modalCloseButton) {
            this.modalCloseButton.onclick = () => this.hideModal();
        }
        window.onclick = (event) => {
            if (event.target == this.modalPopup && this.modalPopup.style.display === 'block') {
                 this.hideModal();
            }
             if (event.target == this.cardSelectionModal && this.cardSelectionModal.style.display === 'block') {
                this.hideCardSelectionModal(true); // Cancel if clicked outside content
             }
        };
    }

    /** Sets up listeners for buttons on specific node screens. */
     _setupNodeActionListeners() { /* ... keep existing ... */
        // Shop Listeners
         if (this.leaveShopButton) {
             this.leaveShopButton.onclick = () => this.gameState?.leaveShop();
         }
         // Rest Site Listeners
         if (this.restHealButton) {
             this.restHealButton.onclick = () => this.gameState?.handleRestSiteAction('heal');
         }
          if (this.restMeditateButton) {
              this.restMeditateButton.onclick = () => this.gameState?.handleRestSiteAction('upgrade');
         }
          if (this.restJournalButton) {
              this.restJournalButton.onclick = () => this.gameState?.handleRestSiteAction('remove');
         }
         if (this.leaveRestSiteButton) {
              this.leaveRestSiteButton.onclick = () => this.gameState?.leaveRestSite();
         }
         // Card Selection Modal Cancel Button
         if (this.cardSelectionCancelButton) {
             this.cardSelectionCancelButton.onclick = () => this.hideCardSelectionModal(true);
         }
          // Meta Screen Back Button (listener added in main.js)
     }

    /** Shows a specific screen and hides the current one. */
    showScreen(screenId) { /* ... keep existing ... */
        if (this.currentScreen) {
            this.currentScreen.classList.remove('active');
        }
        if (this.screens[screenId]) {
            this.currentScreen = this.screens[screenId];
            this.currentScreen.classList.add('active');
            console.log(`UIManager: Showing screen: ${screenId}`);
             // If showing meta screen, render its content
             if (screenId === 'metaScreen') {
                 this.renderMetaScreen();
             }
        } else {
            console.error(`UIManager: Screen ID "${screenId}" not found!`);
        }
    }

    // --- Update Methods ---

    /** Updates the entire combat UI. */
    updateCombatUI(player, enemies, isPlayerTurn) { /* ... keep existing ... */
        if (!player || !enemies) {
             console.warn("UIManager: Cannot update Combat UI - Player or Enemies missing.");
             return;
        }
        // console.log("UIManager: Updating Combat UI..."); // Can be noisy
        this.updatePlayerCombatInfo(player);
        this.renderEnemies(enemies); // Re-renders enemies with updated HP/Intents/Statuses
        this.renderHand(player.deckManager.hand);
        this.updateDeckDiscardCounts(player.deckManager);
        this.endTurnButton.disabled = !isPlayerTurn;
        // Turn indication styling
        this.playerArea.style.borderColor = isPlayerTurn ? '#3498db' : '#567'; // Use neutral color when not active turn
        this.enemyArea.style.borderColor = !isPlayerTurn ? '#e74c3c' : '#567';
    }

    /** Updates player combat stats display. */
    updatePlayerCombatInfo(player) { /* ... keep existing ... */
        if (!this.playerArea || !player) return;
        const hpDisplay = this.playerArea.querySelector('#playerHP') || this._createPlaceholderSpan(this.playerArea, 'playerHP', 'HP: ');
        const focusDisplay = this.playerArea.querySelector('#playerFocus') || this._createPlaceholderSpan(this.playerArea, 'playerFocus', 'Focus: ');
        const blockDisplay = this.playerArea.querySelector('#playerBlock') || this._createPlaceholderSpan(this.playerArea, 'playerBlock', 'Block: ');
        const statusDisplay = this.playerArea.querySelector('#playerStatusesCombat') || this._createPlaceholderDiv(this.playerArea, 'playerStatusesCombat', 'Statuses: ');

        hpDisplay.textContent = `HP: ${player.currentIntegrity} / ${player.maxIntegrity}`;
        focusDisplay.textContent = `Focus: ${player.currentFocus} / ${player.maxFocus}`;
        blockDisplay.textContent = `Block: ${player.currentBlock}`;

        statusDisplay.innerHTML = 'Statuses: ';
        if (player.activeStatusEffects.length > 0) {
             player.activeStatusEffects.forEach(effect => {
                 const effectSpan = document.createElement('span');
                 // Determine display value (amount for stacking, duration otherwise, hide if 0/irrelevant)
                 let displayValue = "";
                 if (effect.amount && effect.amount > 1 && ['Strength', 'Dexterity', 'Poison', /* other stacking effects */].includes(effect.id)) {
                     displayValue = effect.amount;
                 } else if (effect.duration !== 99 && effect.duration > 0) { // Don't show duration for permanent effects
                     displayValue = effect.duration;
                 }
                 effectSpan.textContent = ` ${effect.id}${displayValue ? `(${displayValue})` : ''} `;
                 effectSpan.className = 'status-effect player-status';
                 // TODO: Add tooltip with status description on hover
                 statusDisplay.appendChild(effectSpan);
             });
        } else {
            statusDisplay.innerHTML += " <span style='font-style: italic; color: #95a5a6;'>None</span>"; // Indicate no statuses
        }
    }

     /** Updates deck/discard counts. */
     updateDeckDiscardCounts(deckManager) { /* ... keep existing ... */
         const deckEl = document.getElementById('deckCountElement') || this._createPlaceholderSpan(this.gameContainer, 'deckCountElement', 'Deck: ');
         const discardEl = document.getElementById('discardCountElement') || this._createPlaceholderSpan(this.gameContainer, 'discardCountElement', 'Discard: ');
         deckEl.textContent = `Deck: ${deckManager.getDrawPileCount()}`;
         discardEl.textContent = `Discard: ${deckManager.getDiscardPileCount()}`;
     }


    /** Renders enemies with HP, block, intent, statuses, and targeting click listener. */
    renderEnemies(enemies) { /* ... keep existing, ensure click listener calls combatManager.setSelectedTarget ... */
        if (!this.enemyArea) return;
        this.enemyArea.innerHTML = ''; // Clear previous

        enemies.forEach((enemy) => {
            const enemyDiv = document.createElement('div');
            enemyDiv.className = 'enemy-display';
            enemyDiv.dataset.enemyId = enemy.id;
            enemyDiv.style.opacity = enemy.currentHp <= 0 ? 0.5 : 1;
            enemyDiv.style.borderColor = (this.gameState?.combatManager?.currentTarget?.id === enemy.id) ? '#f1c40f' : '#ccc'; // Use combatManager state

            // Name, HP, Block divs...
            const name = document.createElement('div'); name.textContent = enemy.name; name.style.fontWeight = 'bold';
            const hp = document.createElement('div'); hp.textContent = `HP: ${enemy.currentHp} / ${enemy.maxHp}`; hp.id = `enemyHP_${enemy.id}`;
            const block = document.createElement('div'); block.textContent = `Block: ${enemy.currentBlock}`; block.id = `enemyBlock_${enemy.id}`;

            // Intent display
            const intent = document.createElement('div');
            intent.className = 'enemy-intent';
            intent.id = `enemyIntent_${enemy.id}`;
            intent.innerHTML = this.getIntentText(enemy.currentIntent, enemy); // Use innerHTML for potential icons
             intent.style.marginTop = '5px'; intent.style.fontStyle = 'italic'; intent.style.color = '#f39c12';
             intent.style.minHeight = '1.2em';

            // Statuses display
            const statuses = document.createElement('div');
            statuses.className = 'enemy-statuses';
            statuses.id = `enemyStatuses_${enemy.id}`;
            statuses.innerHTML = 'Statuses: ';
             if (enemy.activeStatusEffects.length > 0) {
                 enemy.activeStatusEffects.forEach(effect => {
                     const effectSpan = document.createElement('span');
                      let displayValue = "";
                      if (effect.amount && effect.amount > 1 && ['Strength', 'Dexterity', 'Poison'].includes(effect.id)) { displayValue = effect.amount; }
                      else if (effect.duration !== 99 && effect.duration > 0) { displayValue = effect.duration; }
                     effectSpan.textContent = ` ${effect.id}${displayValue ? `(${displayValue})` : ''} `;
                     effectSpan.className = 'status-effect enemy-status';
                     statuses.appendChild(effectSpan);
                 });
             } else { statuses.innerHTML += " <span style='font-style: italic; color: #95a5a6;'>None</span>"; }


            enemyDiv.appendChild(name); enemyDiv.appendChild(hp); enemyDiv.appendChild(block);
            enemyDiv.appendChild(intent); enemyDiv.appendChild(statuses);

            // Click listener for targeting (only if alive and player's turn)
             if (enemy.currentHp > 0) {
                 enemyDiv.addEventListener('click', () => {
                     if (this.gameState?.combatManager?.playerTurn) {
                         this.gameState.combatManager.setSelectedTarget(enemy); // Inform CombatManager
                          // CombatManager now handles highlighting via updateCombatUI call potentially, or we do it directly:
                          document.querySelectorAll('.enemy-display').forEach(el => el.style.borderColor = '#ccc'); // Clear others
                          enemyDiv.style.borderColor = '#f1c40f'; // Highlight clicked one
                     }
                 });
             } else {
                 enemyDiv.style.cursor = 'default'; // Not clickable if dead
             }

            this.enemyArea.appendChild(enemyDiv);
        });
    }

    /** Generates intent text. */
    getIntentText(intent, enemy) { /* ... keep existing (or enhance with icons) ... */
        if (!intent || enemy.currentHp <= 0 || enemy.hasStatus('Stunned')) {
            return '<i class="fas fa-question"></i> ???'; // Use icon
        }
        let text = '';
        let baseValue = intent.baseValue || 0;
        let modifiedValue = enemy.applyModifiers('damageDealt', baseValue); // Always calculate potential damage

        switch (intent.type) {
            case 'attack':
                text = `<i class="fas fa-gavel"></i> Attack ${modifiedValue}`; // Example icon
                 if(intent.status) text += ` (Applies ${intent.status})`;
                break;
            case 'multi_attack':
                modifiedValue = enemy.applyModifiers('damageDealt', baseValue);
                 text = `<i class="fas fa-gavel"></i> Attack ${modifiedValue} x ${intent.count || '?'}`;
                 break;
            case 'block':
                modifiedValue = enemy.applyModifiers('blockGain', baseValue);
                text = `<i class="fas fa-shield-alt"></i> Block ${modifiedValue}`; // Example icon
                break;
            case 'attack_block':
                const attackVal = enemy.applyModifiers('damageDealt', intent.attackValue || 0);
                const blockVal = enemy.applyModifiers('blockGain', intent.blockValue || 0);
                text = `<i class="fas fa-gavel"></i> ${attackVal} & <i class="fas fa-shield-alt"></i> ${blockVal}`;
                break;
            case 'debuff':
                text = `<i class="fas fa-arrow-down"></i> Debuff (${intent.status || '???'})`; // Example icon
                break;
            case 'buff':
            case 'power_up':
                 text = `<i class="fas fa-arrow-up"></i> Buff (${intent.status || '???'})`; // Example icon
                 break;
            case 'special':
                text = `<i class="fas fa-star"></i> ${intent.description || `Special`}`; // Example icon
                break;
            default:
                text = '<i class="fas fa-question"></i> Unknown Action';
        }
        return text; // Return HTML string now
    }


    /** Renders player's hand with drag listeners. */
    renderHand(handCards) { /* ... keep existing ... */
         if (!this.handArea || !this.gameState || !this.gameState.combatManager) return;
         this.handArea.innerHTML = ''; // Clear previous hand
         handCards.forEach((card, index) => {
            const cardElement = this.createCardElement(card);
            cardElement.dataset.handIndex = index;

             // Drag and Drop Listeners
             cardElement.draggable = true;
             cardElement.addEventListener('dragstart', (event) => {
                 if (!this.gameState.combatManager.playerTurn) { event.preventDefault(); return; } // Prevent drag if not player turn
                 this.draggedCard = card;
                 this.draggedCardElement = cardElement;
                 event.dataTransfer.setData('text/plain', card.id);
                 event.dataTransfer.effectAllowed = 'move';
                 cardElement.style.opacity = '0.5';
                 // console.log("Drag Start:", card.name);
             });
             cardElement.addEventListener('dragend', (event) => {
                 if (this.draggedCardElement) this.draggedCardElement.style.opacity = '1';
                 this.draggedCard = null;
                 this.draggedCardElement = null;
                 this.clearEnemyHighlights(); // Clear highlights on drag end
                 // We don't reset combatManager.currentTarget here, drop handles it
                 // console.log("Drag End");
             });

            this.handArea.appendChild(cardElement);
        });
         // Setup drop zones AFTER rendering hand
         this._setupDropZones();
    }

    /** Sets up drop zones on enemies/player area. */
     _setupDropZones() { /* ... keep existing, ensure it calls combatManager.handlePlayerCardPlay ... */
        if (!this.enemyArea || !this.playerArea || !this.gameState || !this.gameState.combatManager) return;

         // Clear previous listeners maybe? Or rely on element replacement clearing them? Safest to have flag or remove first?
         // Simple approach: just re-add. Modern browsers might handle detached listeners okay.

         const dropHandler = (event, targetEnemy = null) => {
             event.preventDefault();
             if (this.draggedCard) {
                  console.log(`Dropped ${this.draggedCard.name} onto ${targetEnemy ? targetEnemy.name : 'Player Area'}`);
                  // Use the target passed to the handler (specific enemy) or null (player area)
                  this.gameState.combatManager.handlePlayerCardPlay(this.draggedCard, targetEnemy);
             }
             this.draggedCard = null; // Always clear drag state after drop attempt
             this.draggedCardElement = null;
             this.clearEnemyHighlights();
              // Remove drag-over styling if applied
             if(event.currentTarget.classList) event.currentTarget.classList.remove('drag-over');
         };

         const dragOverHandler = (event) => {
             event.preventDefault();
             event.dataTransfer.dropEffect = 'move';
              // Add visual feedback for valid drop zone (optional)
              if(event.currentTarget.classList) event.currentTarget.classList.add('drag-over');
         };

         const dragLeaveHandler = (event) => {
              // Remove visual feedback (optional)
             if(event.currentTarget.classList) event.currentTarget.classList.remove('drag-over');
         };

         // Apply to individual enemy elements for specific targeting
         this.enemyArea.querySelectorAll('.enemy-display').forEach(enemyEl => {
             const enemyId = enemyEl.dataset.enemyId;
             const enemy = this.gameState.combatManager.enemies.find(e => e.id === enemyId);
             if (enemy && enemy.currentHp > 0) { // Only make living enemies drop targets
                 enemyEl.ondragover = dragOverHandler;
                 enemyEl.ondrop = (event) => dropHandler(event, enemy); // Pass the specific enemy
                 enemyEl.ondragleave = dragLeaveHandler;
             } else {
                  // Clear listeners from dead enemies if they linger?
                  enemyEl.ondragover = null;
                  enemyEl.ondrop = null;
                  enemyEl.ondragleave = null;
             }
         });

         // Apply to player area for self-targeted or non-targeted cards
         this.playerArea.ondragover = dragOverHandler;
         this.playerArea.ondrop = (event) => dropHandler(event, null); // Null target for player area drop
          this.playerArea.ondragleave = dragLeaveHandler;
     }

    /** Creates a card DOM element. */
    createCardElement(card) { /* ... keep existing ... */
         const cardDiv = document.createElement('div');
         cardDiv.className = 'card';
         cardDiv.dataset.cardId = card.id; // Unique instance ID
         cardDiv.dataset.conceptId = card.conceptId; // Original concept ID

         const cost = document.createElement('div'); cost.className = 'card-cost'; cost.textContent = card.cost;
         const name = document.createElement('div'); name.className = 'card-name'; name.textContent = card.name;
         const description = document.createElement('div'); description.className = 'card-description'; description.innerHTML = card.getEffectDescriptionHtml();
         const type = document.createElement('div'); type.className = 'card-type'; type.textContent = card.cardType;

         cardDiv.appendChild(cost); cardDiv.appendChild(name); cardDiv.appendChild(description); cardDiv.appendChild(type);

         // Tooltip Listeners
         cardDiv.addEventListener('mouseover', (event) => this.showTooltip(card.getTooltipHtml(), event.clientX, event.clientY));
         cardDiv.addEventListener('mouseout', () => this.hideTooltip());
         cardDiv.addEventListener('mousemove', (event) => this.updateTooltipPosition(event.clientX, event.clientY));

         return cardDiv;
     }

    /** Enables/disables player input. */
    enablePlayerInput(enabled) { /* ... keep existing ... */
        if(!this.endTurnButton || !this.handArea) return;
         this.endTurnButton.disabled = !enabled;
         this.handArea.querySelectorAll('.card').forEach(cardEl => {
            cardEl.style.pointerEvents = enabled ? 'auto' : 'none';
            cardEl.style.cursor = enabled ? 'grab' : 'default';
             cardEl.draggable = enabled;
        });
        this.handArea.style.opacity = enabled ? 1 : 0.7; // Make slightly more opaque when disabled
    }

    // --- NEW Feedback Methods Implementation ---

    /** Displays a short-lived notification message. */
    showNotification(message, duration = 3000) {
        if (!this.notificationArea) { console.log("Notification:", message); return; }
        const notificationElement = document.createElement('div');
        notificationElement.className = 'notification-message';
        notificationElement.innerHTML = message;
        this.notificationArea.appendChild(notificationElement);
        setTimeout(() => {
            notificationElement.style.opacity = '0';
            setTimeout(() => notificationElement.remove(), 500);
        }, duration);
    }

    /** Displays brief action feedback. */
    showActionFeedback(message, type = 'info', duration = 1500) {
        if (!this.actionFeedbackArea) { console.log(`ActionFeedback (${type}):`, message); return; }
        const feedbackElement = document.createElement('div');
        feedbackElement.className = `action-feedback feedback-${type}`;
        feedbackElement.textContent = message;
        this.actionFeedbackArea.prepend(feedbackElement);
        if (this.actionFeedbackArea.children.length > 3) {
             this.actionFeedbackArea.lastChild.remove();
        }
        setTimeout(() => {
             feedbackElement.style.opacity = '0';
             // Apply transformation for fade-up effect (add to CSS if desired)
             // feedbackElement.style.transform = 'translateY(-20px)';
             setTimeout(() => feedbackElement.remove(), 500);
        }, duration);
    }

    /** Highlights or removes highlight from an enemy. */
    highlightEnemy(enemyInstanceId, highlighted = true) {
        const enemyElement = this.enemyArea?.querySelector(`.enemy-display[data-enemy-id="${enemyInstanceId}"]`);
        if (enemyElement) {
            if (highlighted) enemyElement.classList.add('highlighted-enemy');
            else enemyElement.classList.remove('highlighted-enemy');
        }
    }

    /** Removes highlight from all enemies. */
    clearEnemyHighlights() {
        this.enemyArea?.querySelectorAll('.enemy-display.highlighted-enemy').forEach(el => {
            el.classList.remove('highlighted-enemy');
             el.style.borderColor = '#ccc'; // Reset border explicitly if needed
        });
    }

    // --- Tooltip Methods --- (Keep existing implementations)
    showTooltip(content, x, y) { /* ... keep ... */
         if (!this.tooltipElement) return;
        this.tooltipElement.innerHTML = content;
        this.tooltipElement.style.display = 'block';
        this.updateTooltipPosition(x, y);
    }
    hideTooltip() { /* ... keep ... */
        if (!this.tooltipElement) return;
        this.tooltipElement.style.display = 'none';
    }
    updateTooltipPosition(x, y) { /* ... keep boundary check logic ... */
         if (!this.tooltipElement || this.tooltipElement.style.display === 'none') return;
         const offsetX = 15; const offsetY = 15;
         const tooltipRect = this.tooltipElement.getBoundingClientRect();
         const containerRect = this.gameContainer.getBoundingClientRect();
         let top = y + offsetY; let left = x + offsetX;
         if (left + tooltipRect.width > window.innerWidth - 10) left = x - tooltipRect.width - offsetX; // Check against window edge
         if (top + tooltipRect.height > window.innerHeight - 10) top = y - tooltipRect.height - offsetY;
         if (left < 10) left = 10; // Prevent going off left
         if (top < 10) top = 10; // Prevent going off top
         this.tooltipElement.style.left = `${left}px`; this.tooltipElement.style.top = `${top}px`;
    }

    // --- Modal Methods --- (Keep existing implementations)
    showModal(text, choices = []) { /* ... keep ... */
        if (!this.modalPopup) return;
        this.modalText.innerHTML = text;
        this.modalChoices.innerHTML = '';
        if (choices.length === 0) {
            const okButton = document.createElement('button'); okButton.textContent = 'OK';
            okButton.onclick = () => this.hideModal(); this.modalChoices.appendChild(okButton);
        } else {
            choices.forEach(choice => {
                const button = document.createElement('button'); button.textContent = choice.text;
                button.onclick = () => { this.hideModal(); if (choice.callback) choice.callback(); };
                this.modalChoices.appendChild(button);
            });
        }
        this.modalPopup.style.display = 'block';
    }
    hideModal() { /* ... keep ... */
        if (!this.modalPopup) return;
        this.modalPopup.style.display = 'none';
        this.modalText.innerHTML = ''; this.modalChoices.innerHTML = '';
    }

    // --- Reward/Shop/Rest/Selection Methods --- (Keep existing implementations)
    showRewardScreen(rewards) { /* ... keep existing ... */
        if (!this.rewardScreen || !this.gameState || !this.player) { /*...*/ return; } // Added player check
        console.log("Showing Reward Screen:", rewards);
        if (this.rewardInsightText) this.rewardInsightText.innerHTML = `Insight Gained: ${rewards.insight || 0} <i class='fas fa-brain insight-icon'></i>`;
        // Card Choices
        if (this.rewardCardsArea) {
            this.rewardCardsArea.innerHTML = '<h3>Choose a Concept:</h3>';
            if (rewards.cardChoices && rewards.cardChoices.length > 0) {
                 rewards.cardChoices.forEach(cardId => {
                    const card = new Card(cardId);
                    if (card.conceptId !== -1) {
                         const cardElement = this.createCardElement(card);
                         cardElement.onclick = () => {
                            console.log(`Selected card reward: ${card.name}`);
                            this.gameState.player.addCardToDeck(cardId);
                             this.rewardCardsArea.innerHTML = `<p style="text-align: center; padding: 10px;">Acquired: ${card.name}</p>`;
                             this.rewardArtifactsArea.innerHTML = ''; // Clear artifact choices if card taken? Or allow both? Assume card OR artifact for now.
                             this.rewardSkipButton.textContent = 'Continue'; // Change button text
                         };
                         this.rewardCardsArea.appendChild(cardElement);
                    }
                });
            } else { this.rewardCardsArea.innerHTML += '<p>No concepts resonated...</p>'; }
        }
        // Artifact Choices (Only show if NO card choices offered, or adjust logic)
         if (this.rewardArtifactsArea && (!rewards.cardChoices || rewards.cardChoices.length === 0)) {
              this.rewardArtifactsArea.innerHTML = '<h3>Choose a Relic:</h3>';
              if (rewards.artifactChoices && rewards.artifactChoices.length > 0) {
                   rewards.artifactChoices.forEach(artifactId => {
                       const artifact = new Artifact(artifactId);
                       if (artifact.id !== 'error_artifact') {
                           const artifactElement = document.createElement('div');
                           artifactElement.innerHTML = artifact.getDisplayHtml();
                           artifactElement.classList.add('artifact-display', 'clickable-reward'); // Add class for styling/cursor
                           artifactElement.onclick = () => {
                               console.log(`Selected artifact reward: ${artifact.name}`);
                               this.gameState.player.addArtifact(artifactId);
                               this.rewardArtifactsArea.innerHTML = `<p style="text-align: center; padding: 10px;">Acquired: ${artifact.name}</p>`;
                               this.rewardCardsArea.innerHTML = ''; // Clear card choices
                               this.rewardSkipButton.textContent = 'Continue';
                            };
                           this.rewardArtifactsArea.appendChild(artifactElement);
                       }
                   });
              } else { this.rewardArtifactsArea.innerHTML += '<p>No relics found...</p>'; }
         } else if (this.rewardArtifactsArea) { this.rewardArtifactsArea.innerHTML = '';} // Hide if cards offered

        // Skip/Continue Button
        if (this.rewardSkipButton) {
             // Enable button only if NO choices were presented or after a choice is made? Let's enable always.
             this.rewardSkipButton.textContent = (rewards.cardChoices?.length > 0 || rewards.artifactChoices?.length > 0) ? 'Skip / Continue' : 'Continue';
             this.rewardSkipButton.onclick = () => {
                 console.log("Leaving rewards...");
                 rewards.onComplete();
             };
        }
        this.showScreen('rewardScreen');
    }
    renderShop(shopInventory, playerInsight) { /* ... keep existing ... */
         if (!this.shopScreen || !this.player) return; // Ensure screen/player exists
         console.log("Rendering Shop:", shopInventory);
         if(this.shopInsightDisplay) this.shopInsightDisplay.innerHTML = `Insight: ${playerInsight} <i class='fas fa-brain insight-icon'></i>`;
         // Cards
         if(this.shopCards) {
             this.shopCards.innerHTML = '<h3>Concepts for Sale:</h3>';
             if (shopInventory.cards.length === 0) this.shopCards.innerHTML += "<p>Sold out!</p>";
             shopInventory.cards.forEach((item) => {
                 const card = new Card(item.cardId); if (card.conceptId === -1) return;
                 const shopItemDiv = document.createElement('div'); shopItemDiv.className = 'shop-item card-item';
                 shopItemDiv.appendChild(this.createCardElement(card));
                 const priceButton = document.createElement('button'); priceButton.textContent = `Buy (${item.cost} Insight)`;
                 priceButton.disabled = item.purchased || playerInsight < item.cost;
                 if(!item.purchased) priceButton.onclick = () => this.gameState?.handleShopPurchase('card', item.cardId);
                 else priceButton.textContent = "Purchased";
                 shopItemDiv.appendChild(priceButton); this.shopCards.appendChild(shopItemDiv);
             });
         }
         // Artifacts
         if(this.shopArtifacts){
             this.shopArtifacts.innerHTML = '<h3>Relics for Sale:</h3>';
             if (shopInventory.artifacts.length === 0) this.shopArtifacts.innerHTML += "<p>Sold out!</p>";
              shopInventory.artifacts.forEach((item) => {
                   const artifact = new Artifact(item.artifactId); if (artifact.id === 'error_artifact') return;
                  const shopItemDiv = document.createElement('div'); shopItemDiv.className = 'shop-item artifact-item'; shopItemDiv.style.margin = '5px';
                  const artifactEl = document.createElement('div'); artifactEl.innerHTML = artifact.getDisplayHtml(); shopItemDiv.appendChild(artifactEl); // Wrap artifact html
                  const priceButton = document.createElement('button'); priceButton.textContent = `Buy (${item.cost} Insight)`; priceButton.style.marginLeft = '10px';
                  priceButton.disabled = item.purchased || playerInsight < item.cost;
                  if (!item.purchased) priceButton.onclick = () => this.gameState?.handleShopPurchase('artifact', item.artifactId);
                  else priceButton.textContent = "Purchased";
                  shopItemDiv.appendChild(priceButton); this.shopArtifacts.appendChild(shopItemDiv);
              });
         }
         // Removal
         if(this.shopRemoveService){
              this.shopRemoveService.innerHTML = '<h3>Refinement Service:</h3>';
              const removeButton = document.createElement('button'); removeButton.textContent = `Let Go of a Concept (${shopInventory.removalCost} Insight)`;
              removeButton.disabled = !shopInventory.removalAvailable || playerInsight < shopInventory.removalCost || (this.player.deckManager?.masterDeck.length <= 5); // Add min deck check display
               if(this.player.deckManager?.masterDeck.length <= 5) removeButton.title = "Deck is too small"; // Tooltip for disabled reason
              removeButton.onclick = () => this.gameState?.handleShopPurchase('remove');
              this.shopRemoveService.appendChild(removeButton);
              if (!shopInventory.removalAvailable) {
                  const usedText = document.createElement('span'); usedText.textContent = ' (Service Used)'; usedText.style.fontStyle = 'italic';
                  this.shopRemoveService.appendChild(usedText);
              }
         }
     }
    renderRestSite(restSiteState) { /* ... keep existing ... */
         if (!this.restSiteScreen) return;
         const used = restSiteState.usedOption;
         if (this.restHealButton) this.restHealButton.disabled = used || (this.player && this.player.currentIntegrity >= this.player.maxIntegrity); // Disable heal if full
         if (this.restMeditateButton) this.restMeditateButton.disabled = used || !this.player?.deckManager.getMasterDeck().some(c => !c.upgraded); // Disable if no cards upgradable
         if (this.restJournalButton) this.restJournalButton.disabled = used || (this.player && this.player.deckManager.masterDeck.length <= 5); // Disable remove if deck too small
         if (this.leaveRestSiteButton) this.leaveRestSiteButton.textContent = used ? "Continue" : "Leave";
         if (this.restUsedIndicator) this.restUsedIndicator.textContent = used ? "You feel rested. Time to move on." : "Choose one action:";
     }
    showCardSelectionModal(cardsToShow, onSelectCallback, title = "Select a Card") { /* ... keep existing ... */
         if (!this.cardSelectionModal || !this.cardSelectionGrid || !this.cardSelectionTitle || !this.gameState) { /* Error handling */ onSelectCallback(null); return; }
          this._currentCardSelectionCallback = onSelectCallback;
         this.cardSelectionTitle.textContent = title;
         this.cardSelectionGrid.innerHTML = '';
         if (cardsToShow.length === 0) {
             this.cardSelectionGrid.innerHTML = '<p>No options available.</p>';
         } else {
             cardsToShow.forEach(card => {
                 const cardElement = this.createCardElement(card);
                 cardElement.style.margin = '5px';
                 cardElement.onclick = () => this.hideCardSelectionModal(false, card);
                 this.cardSelectionGrid.appendChild(cardElement);
             });
         }
         this.cardSelectionModal.style.display = 'block';
     }
    hideCardSelectionModal(cancelled = true, selectedCard = null) { /* ... keep existing ... */
         if (!this.cardSelectionModal) return;
         this.cardSelectionModal.style.display = 'none';
         if (this._currentCardSelectionCallback) {
             if (cancelled) { console.log("Card selection cancelled."); this._currentCardSelectionCallback(null); }
             else { console.log(`Card selected: ${selectedCard?.name}`); this._currentCardSelectionCallback(selectedCard); }
         }
         this._currentCardSelectionCallback = null;
     }

    // --- Map Rendering Methods --- (Keep existing implementations)
  renderMap(nodes, currentNodeId, connections) {
    console.log("UIManager:renderMap - STARTING execution."); // <<< ADD THIS
    const mapContainer = this.mapArea; // Use the reference stored in constructor

    if (!mapContainer) {
        console.error("UIManager:renderMap - FAILED: mapArea element not found."); // <<< ADD THIS
        return; // Stop if container missing
    }
    if (!this.gameState || !this.gameState.mapManager) {
        console.error("UIManager:renderMap - FAILED: GameState or MapManager missing."); // <<< ADD THIS
        return;
    }
    if (!nodes || Object.keys(nodes).length === 0) {
         console.warn("UIManager:renderMap - WARNING: No nodes received to render."); // <<< ADD THIS
         // Still clear the loading text even if no nodes
         mapContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Map Generated (No Nodes?).</p>';
         return;
    }
    console.log(`UIManager:renderMap - Rendering ${Object.keys(nodes).length} nodes. Current: ${currentNodeId}`); // <<< ADD THIS

    // Clear previous map content (including "Loading Map...")
    console.log("UIManager:renderMap - Clearing mapArea innerHTML."); // <<< ADD THIS
    mapContainer.innerHTML = '';

    // Create SVG element
    console.log("UIManager:renderMap - Creating SVG element."); // <<< ADD THIS
    const mapSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    mapSvg.setAttribute('width', '100%');
    mapSvg.setAttribute('height', '100%');
    mapSvg.style.backgroundColor = '#34495e'; // Set background directly for testing

    // Render Connections (Lines) first
    console.log(`UIManager:renderMap - Rendering ${connections?.length || 0} connections.`); // <<< ADD THIS
    connections?.forEach(conn => { // Add null check for connections
        const fromNode = nodes[conn.from];
        const toNode = nodes[conn.to];
        if (fromNode && toNode) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            // ... (keep line attribute setting logic) ...
             line.setAttribute('x1', fromNode.position.x); line.setAttribute('y1', fromNode.position.y);
             line.setAttribute('x2', toNode.position.x); line.setAttribute('y2', toNode.position.y);
             line.setAttribute('stroke', fromNode.visited ? '#bdc3c7' : '#7f8c8d'); line.setAttribute('stroke-width', '2');
            mapSvg.appendChild(line);
        }
    });

    // Render Nodes (Circles/Icons) second
    console.log("UIManager:renderMap - Rendering node elements..."); // <<< ADD THIS
    Object.values(nodes).forEach(node => {
         // ... (keep node group, circle, icon text creation logic) ...
          const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
          nodeGroup.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);
         const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle"); circle.setAttribute('r', '15');
         circle.setAttribute('fill', this.getNodeColor(node.type));
         circle.setAttribute('stroke', node.id === currentNodeId ? '#f1c40f' : (node.visited ? '#555' : '#ecf0f1'));
         circle.setAttribute('stroke-width', node.id === currentNodeId ? '3' : '2');
         const iconText = document.createElementNS("http://www.w3.org/2000/svg", "text"); /* ... icon attributes ... */ iconText.textContent = this.getNodeIcon(node.type);
         nodeGroup.appendChild(circle); nodeGroup.appendChild(iconText); nodeGroup.dataset.nodeId = node.id;

        const isAvailableMove = nodes[currentNodeId]?.connections.includes(node.id);
         if (isAvailableMove && node.id !== currentNodeId) {
             nodeGroup.style.cursor = 'pointer';
             // Ensure gameState and mapManager exist before adding listener
             nodeGroup.addEventListener('click', () => {
                 if (this.gameState && this.gameState.mapManager) {
                     this.gameState.mapManager.moveToNode(node.id);
                 } else { console.error("Cannot move node: GameState or MapManager missing in UIManager listener."); }
             });
         } else { /* ... set default cursor/opacity ... */ }
         // Tooltip listeners...
         nodeGroup.addEventListener('mouseover', (event) => { /* ... show tooltip ... */ });
         nodeGroup.addEventListener('mouseout', () => this.hideTooltip());
         nodeGroup.addEventListener('mousemove', (event) => this.updateTooltipPosition(event.clientX, event.clientY));

         node.element = nodeGroup; // Store reference
         mapSvg.appendChild(nodeGroup);
    });

    // Append the SVG to the container
    console.log("UIManager:renderMap - Appending SVG to mapArea."); // <<< ADD THIS
    mapContainer.appendChild(mapSvg);
    console.log("UIManager:renderMap - FINISHED execution."); // <<< ADD THIS
}
        // Render Nodes
        Object.values(nodes).forEach(node => { /* ... circle/icon/listener logic ... */
             const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
             nodeGroup.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);
             const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle"); circle.setAttribute('r', '15');
             circle.setAttribute('fill', this.getNodeColor(node.type));
             circle.setAttribute('stroke', node.id === currentNodeId ? '#f1c40f' : (node.visited ? '#555' : '#ecf0f1'));
             circle.setAttribute('stroke-width', node.id === currentNodeId ? '3' : '2');
             const iconText = document.createElementNS("http://www.w3.org/2000/svg", "text"); iconText.setAttribute('font-family', 'FontAwesome');
             iconText.setAttribute('font-size', '16px'); iconText.setAttribute('fill', '#fff'); iconText.setAttribute('text-anchor', 'middle');
             iconText.setAttribute('dominant-baseline', 'central'); iconText.textContent = this.getNodeIcon(node.type);
             nodeGroup.appendChild(circle); nodeGroup.appendChild(iconText); nodeGroup.dataset.nodeId = node.id;
             const isAvailableMove = nodes[currentNodeId]?.connections.includes(node.id);
             if (isAvailableMove && node.id !== currentNodeId) { // Ensure not current node for click
                 nodeGroup.style.cursor = 'pointer';
                 nodeGroup.addEventListener('click', () => this.gameState?.mapManager?.moveToNode(node.id));
             } else { nodeGroup.style.cursor = 'default'; nodeGroup.style.opacity = (node.id !== currentNodeId && !node.visited) ? 0.6 : 1; }
             // Tooltip listeners
             nodeGroup.addEventListener('mouseover', (event) => { /* ... show tooltip ... */
                  let tooltipText = `${node.type.toUpperCase()}${node.visited ? ' (Visited)' : ''}`;
                  if(node.id === currentNodeId) tooltipText += " (Current)";
                  else if (!isAvailableMove && !node.visited) tooltipText += " (Unavailable)";
                  this.showTooltip(tooltipText, event.clientX, event.clientY);
             });
             nodeGroup.addEventListener('mouseout', () => this.hideTooltip());
             nodeGroup.addEventListener('mousemove', (event) => this.updateTooltipPosition(event.clientX, event.clientY));
             node.element = nodeGroup; mapSvg.appendChild(nodeGroup);
        });
        mapContainer.appendChild(mapSvg);
    }
    getNodeColor(type) { /* ... keep ... */
        switch (type) { case 'combat': return '#c0392b'; case 'elite': return '#8e44ad'; case 'event': return '#2980b9'; case 'rest': return '#27ae60'; case 'shop': return '#f39c12'; case 'boss': return '#e74c3c'; case 'start': return '#bdc3c7'; default: return '#7f8c8d'; }
    }
    getNodeIcon(type) { /* ... keep ... */
        switch (type) { case 'combat': return '\uf06d'; case 'elite': return '\uf005'; case 'event': return '\uf059'; case 'rest': return '\uf183'; case 'shop': return '\uf07a'; case 'boss': return '\uf188'; case 'start': return '\uf007'; default: return '?'; }
    }
    updatePlayerMapInfo(player, floor) { /* ... keep existing ... */
         const infoEl = this.playerInfoMap; // Use direct reference
         if (!infoEl) return;
         if (!player || !player.deckManager) { infoEl.innerHTML = "Loading player data..."; return; };
         infoEl.innerHTML = `
             <span>Floor: ${floor}</span> |
             <span>Integrity: ${player.currentIntegrity} / ${player.maxIntegrity}</span> |
             <span>Insight (Run): ${player.insightThisRun} <i class='fas fa-brain insight-icon'></i></span> |
             <span>Deck: ${player.deckManager.getMasterDeck().length}</span>
         `;
     }

    // --- NEW ---
    /** Renders the content of the meta progression screen */
    renderMetaScreen() {
        if (!this.metaContent || !this.metaProgression) {
             if(this.metaContent) this.metaContent.innerHTML = "<p>Error loading meta progression.</p>";
            return;
        }
        const mp = this.metaProgression;
        let html = `<h3>Meta Progress</h3>`;
        html += `<p>Total Insight: ${mp.totalInsight} <i class='fas fa-brain insight-icon'></i></p>`;
        html += `<p>Highest Ascension Beaten: ${mp.highestAscensionBeat}</p>`;
        html += `<p>Concepts Unlocked: ${mp.unlockedConceptIds.size} / ${Data.concepts.length}</p>`;
        html += `<p>Artifacts Unlocked: ${mp.unlockedArtifactIds.size} / ${Object.keys(ARTIFACT_TEMPLATES).length}</p>`;

        html += `<h4>Permanent Upgrades:</h4><ul>`;
         // Iterate through permanent upgrades and display non-zero ones
         let upgradesFound = false;
         for (const key in mp.permanentUpgrades) {
             if (key === 'attunementBonus') {
                 for (const elemKey in mp.permanentUpgrades.attunementBonus) {
                      const bonus = mp.permanentUpgrades.attunementBonus[elemKey];
                      if (bonus > 0) {
                          html += `<li>+${bonus} ${elemKey} Attunement</li>`;
                          upgradesFound = true;
                      }
                 }
             } else {
                 const bonus = mp.permanentUpgrades[key];
                 if (bonus > 0) {
                      // Make key more readable
                      const readableKey = key.replace(/([A-Z])/g, ' $1').replace(/Bonus$/, '').trim();
                      html += `<li>+${bonus} ${readableKey}</li>`;
                      upgradesFound = true;
                 }
             }
         }
         if (!upgradesFound) html += `<li>None yet!</li>`;
         html += `</ul>`;

         // TODO: Add section for spending Insight on unlocks/upgrades

         this.metaContent.innerHTML = html;
    }


} // End of UIManager class
