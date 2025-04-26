// js/ui/UIManager.js

// Import Card potentially needed for rendering hints
// import { Card } from '../core/Card.js';

/**
 * Manages UI updates and interactions with the DOM.
 */
export class UIManager {
    constructor(gameContainerId = 'gameContainer') {
        this.gameContainer = document.getElementById(gameContainerId);
        if (!this.gameContainer) {
            throw new Error(`UIManager Error: Game container with ID "${gameContainerId}" not found!`);
        }

        this.screens = {}; // Store screen elements { screenId: element }
        this.currentScreen = null; // Currently active screen element

        // --- Specific UI Element References ---
        // Main Menu
        this.startGameButton = document.getElementById('startGameButton');
        this.loadGameButton = document.getElementById('loadGameButton');
        this.metaProgressionButton = document.getElementById('metaProgressionButton');
        this.settingsButton = document.getElementById('settingsButton');

        // Map Screen
        this.mapArea = document.getElementById('mapArea');
        this.playerInfoMap = document.getElementById('playerInfoMap');

        // Combat Screen
        this.enemyArea = document.getElementById('enemyArea');
        this.playerArea = document.getElementById('playerArea');
        this.handArea = document.getElementById('handArea');
        this.deckCountElement = document.getElementById('deckCount'); // Assumes an element with this ID exists
        this.discardCountElement = document.getElementById('discardCount'); // Assumes an element with this ID exists
        this.endTurnButton = document.getElementById('endTurnButton');
        this.playerHPElement = document.getElementById('playerHP'); // Assume exists in playerArea
        this.playerFocusElement = document.getElementById('playerFocus'); // Assume exists in playerArea
        this.playerBlockElement = document.getElementById('playerBlock'); // Assume exists in playerArea

        // Event Screen
        this.eventText = document.getElementById('eventText');
        this.eventChoices = document.getElementById('eventChoices');

        // Shop Screen
        this.shopCards = document.getElementById('shopCards');
        this.shopArtifacts = document.getElementById('shopArtifacts');
        this.leaveShopButton = document.getElementById('leaveShopButton');

        // Rest Site Screen
        this.restHealButton = document.getElementById('restHealButton');
        this.restMeditateButton = document.getElementById('restMeditateButton');
        this.restJournalButton = document.getElementById('restJournalButton');
        this.leaveRestSiteButton = document.getElementById('leaveRestSiteButton');

         // Meta Screen
         this.backToMenuButton = document.getElementById('backToMenuButton');

        // Overlays
        this.tooltipElement = document.getElementById('tooltip');
        this.modalPopup = document.getElementById('modalPopup');
        this.modalText = document.getElementById('modalText');
        this.modalChoices = document.getElementById('modalChoices');
        this.modalCloseButton = this.modalPopup ? this.modalPopup.querySelector('.close-button') : null;

        // Card Drag State
        this.draggedCard = null;
        this.draggedCardElement = null;

        this._collectScreens();
        this._setupCommonListeners(); // Setup listeners for things like modals and tooltips
        console.log("UIManager initialized.");
    }

    /**
     * Finds and stores references to all screen elements.
     */
    _collectScreens() {
        const screenElements = this.gameContainer.querySelectorAll('.screen');
        screenElements.forEach(screen => {
            this.screens[screen.id] = screen;
            screen.classList.remove('active'); // Ensure all hidden initially
        });
        console.log("UIManager: Found screens:", Object.keys(this.screens));
    }

    /**
     * Sets up listeners for common UI elements like modal close buttons.
     */
    _setupCommonListeners() {
        if (this.modalCloseButton) {
            this.modalCloseButton.onclick = () => this.hideModal();
        }
        // Close modal if clicking outside the content
        window.onclick = (event) => {
            if (event.target == this.modalPopup) {
                this.hideModal();
            }
        };

        // Tooltip listeners (handled globally or per element?)
        // We might attach these dynamically when rendering cards/enemies.
    }

    /**
     * Shows a specific screen and hides the current one.
     * @param {string} screenId - The ID of the screen div to show.
     */
    showScreen(screenId) {
        if (this.currentScreen) {
            this.currentScreen.classList.remove('active');
        }
        if (this.screens[screenId]) {
            this.currentScreen = this.screens[screenId];
            this.currentScreen.classList.add('active');
            console.log(`UIManager: Showing screen: ${screenId}`);
        } else {
            console.error(`UIManager: Screen ID "${screenId}" not found!`);
        }
    }

    // --- Update Methods ---

    /**
     * Updates the entire combat UI based on the current state.
     * @param {Player} player - The player object.
     * @param {Enemy[]} enemies - Array of current enemy objects.
     * @param {boolean} isPlayerTurn - Flag indicating whose turn it is.
     */
    updateCombatUI(player, enemies, isPlayerTurn) {
        console.log("UIManager: Updating Combat UI...");
        this.updatePlayerCombatInfo(player);
        this.renderEnemies(enemies);
        this.renderHand(player.deckManager.hand); // Assumes Player has DeckManager instance
        this.updateDeckDiscardCounts(player.deckManager);

        // Indicate turn
        this.endTurnButton.disabled = !isPlayerTurn;
        // Maybe add visual indicator like border color change?
        this.playerArea.style.borderColor = isPlayerTurn ? '#3498db' : '#7f8c8d'; // Blue for player turn
        this.enemyArea.style.borderColor = !isPlayerTurn ? '#e74c3c' : '#7f8c8d'; // Red for enemy turn
    }

    /**
     * Updates the player's stats display in combat.
     */
    updatePlayerCombatInfo(player) {
        // TODO: Find specific elements within playerArea if not already referenced
        const hpDisplay = this.playerArea.querySelector('#playerHP') || this._createPlaceholderSpan(this.playerArea, 'playerHP', 'HP: ');
        const focusDisplay = this.playerArea.querySelector('#playerFocus') || this._createPlaceholderSpan(this.playerArea, 'playerFocus', 'Focus: ');
        const blockDisplay = this.playerArea.querySelector('#playerBlock') || this._createPlaceholderSpan(this.playerArea, 'playerBlock', 'Block: ');
        const statusDisplay = this.playerArea.querySelector('#playerStatuses') || this._createPlaceholderDiv(this.playerArea, 'playerStatuses', 'Statuses: '); // Needs a div

        hpDisplay.textContent = `HP: ${player.currentIntegrity} / ${player.maxIntegrity}`;
        focusDisplay.textContent = `Focus: ${player.currentFocus} / ${player.maxFocus}`;
        blockDisplay.textContent = `Block: ${player.currentBlock}`;

        // Update Status Effects display
        statusDisplay.innerHTML = 'Statuses: '; // Clear previous
        player.activeStatusEffects.forEach(effect => {
            const effectSpan = document.createElement('span');
            effectSpan.textContent = ` ${effect.id}(${effect.duration || effect.amount || ''}) `; // Display ID and duration/amount
            effectSpan.className = 'status-effect player-status'; // Add class for styling
            // TODO: Add tooltip with status description
            statusDisplay.appendChild(effectSpan);
        });
         if (player.activeStatusEffects.length === 0) statusDisplay.textContent += " None";
    }

     /**
     * Updates the deck and discard pile counts.
     */
     updateDeckDiscardCounts(deckManager) {
        const deckEl = document.getElementById('deckCountElement') || this._createPlaceholderSpan(this.gameContainer, 'deckCountElement', 'Deck: ');
        const discardEl = document.getElementById('discardCountElement') || this._createPlaceholderSpan(this.gameContainer, 'discardCountElement', 'Discard: ');

         deckEl.textContent = `Deck: ${deckManager.getDrawPileCount()}`;
         discardEl.textContent = `Discard: ${deckManager.getDiscardPileCount()}`;
         // TODO: Add tooltips showing top card or full list?
     }


    /**
     * Renders the current enemies in the enemy area.
     */
    renderEnemies(enemies) {
        this.enemyArea.innerHTML = ''; // Clear previous enemies

        enemies.forEach((enemy, index) => {
            const enemyDiv = document.createElement('div');
            enemyDiv.className = 'enemy-display';
            enemyDiv.dataset.enemyId = enemy.id; // Store unique ID for targeting
            enemyDiv.style.border = '1px solid #ccc'; // Basic visual separation
            enemyDiv.style.padding = '10px';
            enemyDiv.style.textAlign = 'center';
             enemyDiv.style.opacity = enemy.currentHp <= 0 ? 0.5 : 1; // Dim defeated enemies

            const name = document.createElement('div');
            name.textContent = enemy.name;
            name.style.fontWeight = 'bold';

            const hp = document.createElement('div');
            hp.textContent = `HP: ${enemy.currentHp} / ${enemy.maxHp}`;
            hp.id = `enemyHP_${enemy.id}`; // ID for easy updates

             const block = document.createElement('div');
             block.textContent = `Block: ${enemy.currentBlock}`;
             block.id = `enemyBlock_${enemy.id}`;

            const intent = document.createElement('div');
            intent.className = 'enemy-intent';
            intent.id = `enemyIntent_${enemy.id}`;
            intent.textContent = this.getIntentText(enemy.currentIntent, enemy); // Display next action
             intent.style.marginTop = '5px';
             intent.style.fontStyle = 'italic';
             intent.style.color = '#f39c12'; // Orange intent color


            const statuses = document.createElement('div');
            statuses.className = 'enemy-statuses';
            statuses.id = `enemyStatuses_${enemy.id}`;
            statuses.innerHTML = 'Statuses: ';
             enemy.activeStatusEffects.forEach(effect => {
                const effectSpan = document.createElement('span');
                effectSpan.textContent = ` ${effect.id}(${effect.duration || effect.amount || ''}) `;
                effectSpan.className = 'status-effect enemy-status';
                statuses.appendChild(effectSpan);
            });
             if(enemy.activeStatusEffects.length === 0) statuses.textContent += " None";


            enemyDiv.appendChild(name);
            enemyDiv.appendChild(hp);
             enemyDiv.appendChild(block);
            enemyDiv.appendChild(intent);
            enemyDiv.appendChild(statuses);


            // Add click listener for targeting (if enemy is alive)
             if (enemy.currentHp > 0) {
                enemyDiv.addEventListener('click', () => {
                     // TODO: Implement targeting logic - maybe set a 'currentTarget' in CombatManager?
                     console.log(`Targeting enemy: ${enemy.name} (ID: ${enemy.id})`);
                     // Visually indicate target?
                     document.querySelectorAll('.enemy-display').forEach(el => el.style.borderColor = '#ccc');
                     enemyDiv.style.borderColor = '#f1c40f'; // Highlight target yellow
                     this.currentTarget = enemy; // Store target ref (needs CombatManager integration)
                 });
             }

            this.enemyArea.appendChild(enemyDiv);
        });
    }

    /**
     * Generates descriptive text for an enemy's intent.
     */
    getIntentText(intent, enemy) {
        if (!intent || enemy.currentHp <= 0 || enemy.hasStatus('Stunned')) {
            return '???'; // No intent shown if stunned or defeated
        }
        let text = '';
         let baseValue = intent.baseValue || 0;
         // Apply *visible* modifiers like Strength/Weak for prediction
         let predictedValue = enemy.applyModifiers('damageDealt', baseValue);


        switch (intent.type) {
            case 'attack':
                text = `Attack ${predictedValue}`;
                 if(intent.status) text += ` (Applies ${intent.status})`;
                break;
            case 'multi_attack':
                predictedValue = enemy.applyModifiers('damageDealt', baseValue);
                 text = `Attack ${predictedValue} x ${intent.count || '?'}`;
                 break;
            case 'block':
                predictedValue = enemy.applyModifiers('blockGain', baseValue);
                text = `Block ${predictedValue}`;
                break;
            case 'attack_block':
                const attackVal = enemy.applyModifiers('damageDealt', intent.attackValue || 0);
                const blockVal = enemy.applyModifiers('blockGain', intent.blockValue || 0);
                text = `Attack ${attackVal}, Block ${blockVal}`;
                break;
            case 'debuff':
                text = `Debuff (${intent.status || '???'})`;
                break;
            case 'buff':
                text = `Buff Self (${intent.status || '???'})`;
                break;
             case 'power_up':
                 text = `Power Up (${intent.status || '???'})`;
                 break;
            case 'special':
                text = intent.description || `Special Ability (${intent.id})`;
                break;
            default:
                text = 'Unknown Action';
        }
        return `Intent: ${text}`;
    }


    /**
     * Renders the player's hand.
     */
    renderHand(handCards) {
        this.handArea.innerHTML = ''; // Clear previous hand
        handCards.forEach((card, index) => {
            const cardElement = this.createCardElement(card);
            cardElement.dataset.handIndex = index; // Store index for potential play logic

             // --- Drag and Drop Implementation (Basic) ---
             cardElement.draggable = true;
             cardElement.addEventListener('dragstart', (event) => {
                this.draggedCard = card; // Store the Card object being dragged
                this.draggedCardElement = cardElement;
                 event.dataTransfer.setData('text/plain', card.id); // Can transfer card ID
                 event.dataTransfer.effectAllowed = 'move';
                 cardElement.style.opacity = '0.5'; // Visual feedback
                 console.log("Drag Start:", card.name);
             });

             cardElement.addEventListener('dragend', (event) => {
                cardElement.style.opacity = '1'; // Restore opacity
                this.draggedCard = null;
                this.draggedCardElement = null;
                // Clear target highlighting?
                 document.querySelectorAll('.enemy-display').forEach(el => el.style.borderColor = '#ccc');
                 this.currentTarget = null;
                 console.log("Drag End");
             });

            this.handArea.appendChild(cardElement);
        });

         // Add drop zone listeners to potential targets (enemies, player area for self-target)
         this._setupDropZones();
    }

     _setupDropZones() {
         // Drop listener on enemy area (or individual enemies)
         this.enemyArea.ondragover = (event) => {
             event.preventDefault(); // Allow drop
             event.dataTransfer.dropEffect = 'move';
         };
         this.enemyArea.ondrop = (event) => {
            event.preventDefault();
             if (this.draggedCard && this.currentTarget && this.currentTarget.currentHp > 0) {
                 console.log(`Dropped ${this.draggedCard.name} onto ${this.currentTarget.name}`);
                 // Trigger card play through CombatManager
                 this.gameState.combatManager.handlePlayerCardPlay(this.draggedCard, this.currentTarget);
             } else if (this.draggedCard && !this.draggedCard.requiresTarget) {
                 // Allow dropping cards that don't need a target anywhere (or specific zone?)
                 console.log(`Dropped ${this.draggedCard.name} (no target needed)`);
                 this.gameState.combatManager.handlePlayerCardPlay(this.draggedCard, null);
             }
             this.draggedCard = null; // Clear drag state
             this.draggedCardElement = null;
             this.currentTarget = null;
         };

         // Drop listener on player area (for self-targeted cards)
         this.playerArea.ondragover = (event) => {
             event.preventDefault();
             event.dataTransfer.dropEffect = 'move';
         };
          this.playerArea.ondrop = (event) => {
              event.preventDefault();
              if (this.draggedCard && !this.draggedCard.requiresTarget) { // Or specifically check for self-target flag
                  console.log(`Dropped ${this.draggedCard.name} onto Player Area`);
                  this.gameState.combatManager.handlePlayerCardPlay(this.draggedCard, null); // Null target usually means self or no target
              }
              this.draggedCard = null;
              this.draggedCardElement = null;
               this.currentTarget = null;
          };
     }

    /**
     * Creates a DOM element representing a card.
     * @param {Card} card - The card object.
     * @returns {HTMLElement} The card div element.
     */
    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card'; // Use the CSS class
        cardDiv.dataset.cardId = card.id; // Store unique instance ID

        // Basic card structure from CSS example
        const cost = document.createElement('div');
        cost.className = 'card-cost';
        cost.textContent = card.cost;

        const name = document.createElement('div');
        name.className = 'card-name';
        name.textContent = card.name;

        const description = document.createElement('div');
        description.className = 'card-description';
        // Use the description generation method from the Card class
        description.innerHTML = card.getEffectDescriptionHtml(); // Use innerHTML if description contains simple tags

        const type = document.createElement('div');
        type.className = 'card-type';
        type.textContent = card.cardType;


        cardDiv.appendChild(cost);
        cardDiv.appendChild(name);
        cardDiv.appendChild(description);
        cardDiv.appendChild(type);

        // Add tooltip listener
        cardDiv.addEventListener('mouseover', (event) => {
            this.showTooltip(card.getTooltipHtml(), event.clientX, event.clientY);
        });
        cardDiv.addEventListener('mouseout', () => {
            this.hideTooltip();
        });
         cardDiv.addEventListener('mousemove', (event) => {
             this.updateTooltipPosition(event.clientX, event.clientY);
         });


        return cardDiv;
    }


    /**
     * Enables or disables player input controls (hand interaction, end turn button).
     */
    enablePlayerInput(enabled) {
        this.endTurnButton.disabled = !enabled;
        // Make cards clickable/draggable only if input is enabled
        this.handArea.querySelectorAll('.card').forEach(cardEl => {
            cardEl.style.pointerEvents = enabled ? 'auto' : 'none';
            cardEl.style.cursor = enabled ? 'grab' : 'default';
             cardEl.draggable = enabled;
        });
        // Might need visual cue, like dimming hand area when disabled
        this.handArea.style.opacity = enabled ? 1 : 0.6;
    }


    // --- Tooltip Methods ---
    showTooltip(content, x, y) {
        if (!this.tooltipElement) return;
        this.tooltipElement.innerHTML = content;
        this.tooltipElement.style.display = 'block';
        this.updateTooltipPosition(x, y); // Initial position
    }

    hideTooltip() {
        if (!this.tooltipElement) return;
        this.tooltipElement.style.display = 'none';
    }

    updateTooltipPosition(x, y) {
        if (!this.tooltipElement || this.tooltipElement.style.display === 'none') return;
         // Position tooltip slightly offset from the mouse cursor
         // Add boundary checks to prevent it going off-screen
         const offsetX = 15;
         const offsetY = 15;
         const tooltipRect = this.tooltipElement.getBoundingClientRect();
         const containerRect = this.gameContainer.getBoundingClientRect();

         let top = y + offsetY;
         let left = x + offsetX;

         // Adjust if tooltip goes beyond right edge
         if (left + tooltipRect.width > containerRect.right) {
             left = x - tooltipRect.width - offsetX;
         }
         // Adjust if tooltip goes beyond bottom edge
         if (top + tooltipRect.height > containerRect.bottom) {
             top = y - tooltipRect.height - offsetY;
         }
          // Adjust if tooltip goes beyond left edge (less likely with offset)
         if (left < containerRect.left) {
              left = containerRect.left + 5;
         }
         // Adjust if tooltip goes beyond top edge (less likely with offset)
         if (top < containerRect.top) {
             top = containerRect.top + 5;
         }


        this.tooltipElement.style.left = `${left}px`;
        this.tooltipElement.style.top = `${top}px`;
    }


    // --- Modal Methods ---
    showModal(text, choices = []) { // choices = [{ text: 'OK', callback: () => {} }]
        if (!this.modalPopup) return;
        this.modalText.innerHTML = text; // Use innerHTML to allow basic formatting
        this.modalChoices.innerHTML = ''; // Clear previous choices

        if (choices.length === 0) {
            // If no choices, add a default OK button that just closes the modal
            const okButton = document.createElement('button');
            okButton.textContent = 'OK';
            okButton.onclick = () => this.hideModal();
            this.modalChoices.appendChild(okButton);
        } else {
            choices.forEach(choice => {
                const button = document.createElement('button');
                button.textContent = choice.text;
                button.onclick = () => {
                    this.hideModal(); // Close modal first
                    if (choice.callback && typeof choice.callback === 'function') {
                        choice.callback(); // Execute the choice's action
                    }
                };
                this.modalChoices.appendChild(button);
            });
        }

        this.modalPopup.style.display = 'block';
    }

    hideModal() {
        if (!this.modalPopup) return;
        this.modalPopup.style.display = 'none';
        this.modalText.innerHTML = '';
        this.modalChoices.innerHTML = '';
    }


    // --- Placeholder Helpers for Missing Elements ---
    _createPlaceholderSpan(parent, id, prefix = '') {
        console.warn(`Creating placeholder span for missing element #${id}`);
        const span = document.createElement('span');
        span.id = id;
        span.textContent = prefix + '...';
        parent.appendChild(span);
        return span;
    }
     _createPlaceholderDiv(parent, id, prefix = '') {
        console.warn(`Creating placeholder div for missing element #${id}`);
        const div = document.createElement('div');
        div.id = id;
        div.textContent = prefix + '...';
        parent.appendChild(div);
        return div;
    }

} // End of UIManager class
