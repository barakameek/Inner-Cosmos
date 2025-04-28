// js/ui/UIManager.js

// Import classes needed for rendering data or type checking
import { Card } from '../core/Card.js';
import { Artifact } from '../core/Artifact.js';
import { MetaProgression } from '../meta/MetaProgression.js'; // Needed for renderMetaScreen
import * as Data from '../../data.js'; // Needed for meta screen counts, node icons etc. Correct path.
import { ARTIFACT_TEMPLATES } from '../core/ArtifactDefinitions.js'; // Needed for meta screen count. Correct path.
import { ENEMY_TEMPLATES } from '../combat/Enemy.js'; // Needed for reward generation etc.

// Import Child UI Managers
import { CombatUI } from './CombatUI.js'; // Correct path
// Placeholder for future MapUI class
// import { MapUI } from './MapUI.js';
// Import QuizManager TYPE for hinting if using TS/JSDoc
// import { QuizManager } from '../core/QuizManager.js';

/**
 * Manages UI updates, screen transitions, global UI elements (modals, tooltips, feedback),
 * and coordinates child UI managers (CombatUI, MapUI).
 */
export class UIManager {
    constructor(gameContainerId = 'gameContainer') {
        this.gameContainer = document.getElementById(gameContainerId);
        if (!this.gameContainer) {
            throw new Error(`UIManager Error: Game container with ID "${gameContainerId}" not found!`);
        }

        // References to be set later
        this.gameState = null;
        this.metaProgression = null;

        // Screen management
        this.screens = {}; // Stores references to screen divs
        this.currentScreen = null;

        // --- Child UI Managers ---
        this.combatUI = null; // Instantiated in setReferences
        // this.mapUI = null; // Instantiated in setReferences (when MapUI class is created)

        // --- References to screen divs (managed by UIManager for showing/hiding) ---
        this.mainMenuScreen = document.getElementById('mainMenuScreen');
        this.mirrorQuizScreen = document.getElementById('mirrorQuizScreen'); // NEW
        this.mapScreen = document.getElementById('mapScreen');
        this.combatScreen = document.getElementById('combatScreen');
        this.eventScreen = document.getElementById('eventScreen');
        this.shopScreen = document.getElementById('shopScreen');
        this.restSiteScreen = document.getElementById('restSiteScreen');
        this.rewardScreen = document.getElementById('rewardScreen');
        this.metaScreen = document.getElementById('metaScreen');
        this._collectScreens(); // Populate this.screens

         // --- References to specific elements within screens (for direct access) ---
         // Global Overlays
         this.tooltipElement = document.getElementById('tooltip');
         this.modalPopup = document.getElementById('modalPopup');
         this.modalText = document.getElementById('modalText');
         this.modalChoices = document.getElementById('modalChoices');
         this.modalCloseButton = this.modalPopup?.querySelector('.close-button');
         this.cardSelectionModal = document.getElementById('cardSelectionModal');
         this.cardSelectionGrid = document.getElementById('cardSelectionGrid');
         this.cardSelectionTitle = document.getElementById('cardSelectionTitle');
         this.cardSelectionCancelButton = document.getElementById('cardSelectionCancel');
         this.notificationArea = document.getElementById('notificationArea');
         this.actionFeedbackArea = document.getElementById('actionFeedbackArea');
         // Mirror Quiz Screen Elements (NEW)
         this.quizProgressEl = document.getElementById('quizProgress');
         this.quizQuestionTextEl = document.getElementById('quizQuestionText');
         this.quizChoicesEl = document.getElementById('quizChoices');
         // Map Screen
         this.mapArea = document.getElementById('mapArea');
         this.playerInfoMap = document.getElementById('playerInfoMap');
         this.attunementMeterMap = document.querySelector('#mapScreen #attunementMeter'); // NEW
         this.deckChartCanvas = document.getElementById('deckChart'); // NEW
         // Combat Screen (Main containers, specific stats handled by CombatUI)
         this.enemyArea = document.getElementById('enemyArea');
         this.playerArea = document.getElementById('playerArea');
         this.handArea = document.getElementById('handArea');
         this.deckInfoArea = document.getElementById('deckInfo');
         this.deckCountElement = document.getElementById('deckCountElement');
         this.discardCountElement = document.getElementById('discardCountElement');
         this.exhaustCountElement = document.getElementById('exhaustCountElement');
         this.attunementMeterCombat = document.querySelector('#combatScreen #attunementMeter'); // NEW
         // Reward Screen
         this.rewardCardsArea = document.getElementById('rewardCards');
         this.rewardArtifactsArea = document.getElementById('rewardArtifacts');
         this.rewardInsightText = document.getElementById('rewardInsight');
         this.rewardSkipButton = document.getElementById('rewardSkipButton');
         // Shop Screen
         this.shopCards = document.getElementById('shopCards');
         this.shopArtifacts = document.getElementById('shopArtifacts');
         this.shopRemoveService = document.getElementById('shopRemoveService');
         this.shopInsightDisplay = document.getElementById('shopInsightDisplay');
         this.leaveShopButton = document.getElementById('leaveShopButton');
         // Rest Site
         this.restUsedIndicator = document.getElementById('restUsedIndicator');
         this.restHealButton = document.getElementById('restHealButton');
         this.restMeditateButton = document.getElementById('restMeditateButton');
         this.restJournalButton = document.getElementById('restJournalButton');
         this.leaveRestSiteButton = document.getElementById('leaveRestSiteButton');
         // Meta Screen
         this.metaContent = document.getElementById('metaContent');
         this.backToMenuButton = document.getElementById('backToMenuButton');
         // Main Menu Buttons
         this.startGameButton = document.getElementById('startGameButton');
         this.loadGameButton = document.getElementById('loadGameButton');
         this.metaProgressionButton = document.getElementById('metaProgressionButton');
         this.settingsButton = document.getElementById('settingsButton');

        // --- State ---
        this.draggedCard = null;
        this.draggedCardElement = null;
        this._currentCardSelectionCallback = null;
        this._quizManagerInstance = null; // NEW: Store current quiz instance
        this._quizCompletionCallback = null; // NEW: Store quiz completion callback

        // --- Initialization ---
        this._ensureFeedbackAreasExist();
        this._setupCommonListeners();
        this._setupNodeActionListeners();

        console.log("UIManager initialized.");
    }

    /** Stores references to GameState/MetaProgression and initializes child UI managers */
    setReferences(gameState, metaProgression) {
        // ... (existing code) ...
        this.gameState = gameState;
        this.metaProgression = metaProgression;

        try {
             this.combatUI = new CombatUI(this, this.gameState);
             console.log("UIManager references set, child managers initialized.");
        } catch (error) {
             console.error("Error initializing child UI managers:", error);
        }
    }

    /** Finds and stores references to all screen elements with class="screen" */
    _collectScreens() {
        // ... (existing code finding other screens) ...
        const screenElements = this.gameContainer?.querySelectorAll('.screen');
        if (!screenElements) {
            console.error("UIManager Error: Could not query for screens within game container.");
            return;
        }
        screenElements.forEach(screen => {
            if (screen.id) {
                this.screens[screen.id] = screen;
                screen.classList.remove('active'); // Ensure all start hidden
                screen.style.opacity = '0';
                screen.style.pointerEvents = 'none';
            } else {
                 console.warn("Found screen element without an ID:", screen);
            }
        });

        // Find Mirror Quiz Screen specifically
        if (this.mirrorQuizScreen) {
             this.screens['mirrorQuizScreen'] = this.mirrorQuizScreen;
             this.mirrorQuizScreen.classList.remove('active');
             this.mirrorQuizScreen.style.opacity = '0';
             this.mirrorQuizScreen.style.pointerEvents = 'none';
        } else {
             console.warn("Mirror Quiz screen element (#mirrorQuizScreen) not found.");
        }

        // Verify core screens were found
        const coreScreens = ['mainMenuScreen', 'mapScreen', 'combatScreen'];
        coreScreens.forEach(id => {
            if (!this.screens[id]) console.error(`UIManager FATAL: Core screen #${id} not found! Check index.html.`);
        })
    }

     /** Ensures feedback areas exist in the DOM, creating them if necessary. */
     _ensureFeedbackAreasExist() {
        // ... (existing code) ...
     }

     /** Creates a styled container div for notifications or action feedback. */
     _createFeedbackArea(id, vAlign = 'bottom', hAlign = 'right') {
        // ... (existing code) ...
     }

    /** Sets up listeners for common UI elements like modal close buttons. */
    _setupCommonListeners() {
        // ... (existing code for modals) ...
    }

    /** Sets up listeners for buttons on specific node screens (Shop, Rest). */
     _setupNodeActionListeners() {
        // ... (existing code for shop/rest) ...
     }

    /** Shows a specific screen and hides the current one with fade effect. */
    showScreen(screenId) {
        // ... (existing screen transition logic) ...
        if (this.currentScreen && this.currentScreen.id === screenId) {
             console.log(`Screen ${screenId} is already active.`); return;
        }
        if (this.currentScreen) {
             this.currentScreen.classList.remove('active');
             this.currentScreen.style.opacity = '0';
             this.currentScreen.style.pointerEvents = 'none';
        }
        const nextScreen = this.screens[screenId];
        if (nextScreen) {
            this.currentScreen = nextScreen;
            this.currentScreen.classList.add('active');
            void this.currentScreen.offsetWidth;
            this.currentScreen.style.opacity = '1';
            this.currentScreen.style.pointerEvents = 'auto';
            console.log(`UIManager: Showing screen: ${screenId}`);

            // Special actions
            if (screenId === 'metaScreen') this.renderMetaScreen();
            if (screenId === 'mapScreen') {
                this.gameState?.mapManager?.renderMap();
                // Update map screen HUD elements if player exists
                if (this.gameState?.player) {
                    this.updateAttunementMeter(this.gameState.player);
                    this.renderDeckPortrait(this.gameState.player.deckManager);
                }
            }
             if (screenId === 'combatScreen' && this.gameState?.player) {
                  this.updateAttunementMeter(this.gameState.player); // Update combat meter too
             }
            if (this.currentScreen.id !== 'combatScreen') {
                 this.gameState?.combatManager?.setSelectedTarget(null);
            }

        } else {
            console.error(`UIManager Error: Screen ID "${screenId}" not found! Cannot show.`);
            this.showScreen('mainMenuScreen');
        }
    }

    // --- DELEGATED Update Methods ---
    /** Delegates combat UI update to CombatUI */
    updateCombatUI(player, enemies, isPlayerTurn) {
        // ... (existing code) ...
        this.combatUI?.update(player, enemies, isPlayerTurn);
        // Also update combat attunement meter here
        if(player) this.updateAttunementMeter(player);
    }
    /** Updates deck/discard counts (can be called from anywhere) */
    updateDeckDiscardCounts(deckManager) {
        // ... (existing code) ...
        this.combatUI?.updateDeckDiscardCounts(deckManager);
        // Update deck portrait if map screen is visible (or always?)
        // if(this.currentScreen?.id === 'mapScreen') { // Option: only update if visible
            this.renderDeckPortrait(deckManager);
        // }
    }

    // --- MAP Rendering (TODO: Move to MapUI) ---
    renderMap(nodes, currentNodeId, connections) {
        // ... (existing map rendering logic) ...
    }

    /** Updates player info display on the map screen */
    updatePlayerMapInfo(player, floor) {
        const infoEl = this.playerInfoMap;
        if (!infoEl) { console.warn("Player info map element not found."); return; }
        const statsContainer = infoEl.querySelector('.player-map-stats'); // Target the specific container
        if (!statsContainer) { console.error("Player map stats container not found in #playerInfoMap"); return; }
        if (!player || !player.deckManager) { statsContainer.innerHTML = "Loading player info..."; return; };

        // Update only the stats part, leave attunement meter alone
        statsContainer.innerHTML = `
             <span>Floor: ${floor || '?'}</span><span class="info-divider">|</span>
             <span>Integrity: ${player.currentIntegrity} / ${player.maxIntegrity}</span><span class="info-divider">|</span>
             <span>Insight (Run): ${player.insightThisRun} <i class='fas fa-brain insight-icon'></i></span><span class="info-divider">|</span>
             <span>Deck: ${player.deckManager.getMasterDeck().length}</span>
        `;
        // Update the attunement meter separately
        this.updateAttunementMeter(player);
        // Update the deck portrait separately
        this.renderDeckPortrait(player.deckManager);
    }

    // --- Methods specific to UIManager (Feedback, Modals, Global state) ---
    /** Creates a card DOM element (used by CombatUI, RewardScreen etc.) */
    createCardElement(card) {
        // ... (existing card element creation logic) ...
    }
    /** Shows a persistent notification message. */
    showNotification(message, duration = 3500) {
        // ... (existing notification logic) ...
    }
    /** Shows temporary action feedback (e.g., "Not enough Focus!"). */
    showActionFeedback(message, type = 'info', duration = 1800) {
        // ... (existing feedback logic) ...
    }
    /** Clears all enemy highlights and targeting styles. */
    clearEnemyHighlights() {
        this.combatUI?.clearEnemyHighlights();
    }
    /** Highlights or removes highlight from an enemy (called by CombatUI). */
    highlightEnemy(enemyInstanceId, highlighted = true) {
        this.combatUI?.highlightEnemy(enemyInstanceId, highlighted);
    }

    // --- Tooltip Methods ---
    showTooltip(content, x, y) { /* ... existing ... */ }
    hideTooltip() { /* ... existing ... */ }
    updateTooltipPosition(x, y) { /* ... existing ... */ }

    // --- Modal Methods ---
    showModal(text, choices = []) { /* ... existing ... */ }
    hideModal() { /* ... existing ... */ }

    // --- Card Selection Modal ---
    showCardSelectionModal(cardsToShow, onSelectCallback, title = "Select a Card") { /* ... existing ... */ }
    hideCardSelectionModal(cancelled = true, selectedCard = null) { /* ... existing ... */ }

    // --- Node Screen Rendering (Reward, Shop, Rest) ---
    showRewardScreen(rewards) { /* ... existing ... */ }
    renderShop(shopInventory, playerInsight) { /* ... existing ... */ }
    renderRestSite(restSiteState, player) { /* ... existing ... */ }

    // --- Meta Screen Rendering ---
    renderMetaScreen() { /* ... existing ... */ }

    // --- Node Color/Icon Helpers (Map Rendering) ---
    getNodeColor(type) { /* ... existing ... */ }
    getNodeIcon(type) { /* ... existing ... */ }

    // --- NEW: Mirror Quiz UI Methods ---
    /**
     * Displays the Mirror Quiz screen and initializes the quiz flow.
     * @param {QuizManager} quizManagerInstance - The instance managing the quiz logic.
     * @param {function} onCompleteCallback - Function to call with the quiz result when finished.
     */
    showMirrorQuiz(quizManagerInstance, onCompleteCallback) {
        if (!this.mirrorQuizScreen || !quizManagerInstance) {
            console.error("Cannot show mirror quiz: Missing screen element or QuizManager instance.");
            if (onCompleteCallback) onCompleteCallback(null); // Callback with error/null
            return;
        }
        console.log("Showing Mirror Quiz...");
        this._quizManagerInstance = quizManagerInstance;
        this._quizCompletionCallback = onCompleteCallback;
        this.renderQuizQuestion(); // Render the first question
        this.showScreen('mirrorQuizScreen');
    }

    /** Renders the current question and choices for the Mirror Quiz. */
    renderQuizQuestion() {
        if (!this._quizManagerInstance || !this.mirrorQuizScreen) return;

        const question = this._quizManagerInstance.getCurrentQuestion();
        if (!question) { // Should not happen if isComplete is checked before calling
             console.error("RenderQuizQuestion called but quiz instance has no current question.");
             // Potentially auto-complete if somehow stuck here?
             if (this._quizCompletionCallback) this._quizCompletionCallback(null);
             return;
        }

        // Use the stored references
        if (!this.quizQuestionTextEl || !this.quizChoicesEl || !this.quizProgressEl) {
            console.error("Quiz screen HTML elements missing! Cannot render question."); return;
        }

        this.quizQuestionTextEl.textContent = question.text;
        this.quizChoicesEl.innerHTML = ''; // Clear previous choices

        question.choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice.text;
             button.classList.add('button-secondary'); // Style choices consistently
            button.onclick = () => {
                this._quizManagerInstance.answerCurrentQuestion(choice.value);
                if (this._quizManagerInstance.isComplete()) {
                    // Quiz finished, call the completion callback
                    console.log("Quiz complete, calculating result...");
                    const result = this._quizManagerInstance.getDraftResult();
                    if (this._quizCompletionCallback) {
                        this._quizCompletionCallback(result); // Pass results back to main.js logic
                    }
                    // Cleanup quiz state in UIManager
                    this._quizManagerInstance = null;
                    this._quizCompletionCallback = null;
                     // Automatically hide quiz screen? Or let main.js handle next screen? Let main.js handle it.
                } else {
                    // Render next question
                    this.renderQuizQuestion();
                }
            };
            this.quizChoicesEl.appendChild(button);
        });

        this.quizProgressEl.textContent = `Question ${this._quizManagerInstance.currentIndex + 1} / ${this._quizManagerInstance.questions.length}`;
    }

    // --- NEW: Attunement Meter Update ---
    /**
     * Updates the visual representation of the player's attunements on the HUD.
     * @param {Player} player - The player object containing attunement data.
     */
     updateAttunementMeter(player) {
        const meters = [this.attunementMeterMap, this.attunementMeterCombat];
        if (!player || !player.attunements) {
             // console.warn("Cannot update attunement meter: Player or attunements missing.");
             return;
        }

        meters.forEach(meter => {
            if (!meter) return; // Skip if meter element not found (e.g., not on current screen)
            const pips = meter.querySelectorAll('.attunement-pip');
            if (pips.length !== 7) { console.warn("Attunement meter HTML structure incorrect (needs 7 .attunement-pip elements)."); return; }

            const elementOrder = ['A', 'I', 'S', 'P', 'C', 'R', 'RF']; // Consistent order
            pips.forEach((pip, index) => {
                if (!pip) return;
                const key = elementOrder[index];
                const value = player.attunements[key] || 0;
                const fullName = Data.elementKeyToFullName[key] || key;

                // Apply classes based on thresholds (e.g., for tier 1 passive)
                pip.classList.toggle('filled-tier1', value >= 10);
                // Add more tiers if needed: pip.classList.toggle('filled-tier2', value >= 20);

                // Set tooltip for hover info
                pip.title = `${fullName}: ${value}`;

                // Optional: Style based on value (e.g., brightness, border)
                // pip.style.opacity = 0.5 + (value / 20); // Example: fade in
            });
        });
     }

     // --- NEW: Dual-Path Upgrade Modal ---
     /**
      * Shows a modal for selecting an upgrade path for a specific card.
      * @param {Card} card - The card instance to be upgraded.
      * @param {function} onUpgradeChoiceCallback - Callback function accepting 'refine', 'transmute', or null (for cancel).
      */
     showCardUpgradeModal(card, onUpgradeChoiceCallback) {
         if (!this.cardSelectionModal || !this.cardSelectionGrid || !this.cardSelectionTitle || !card) {
              console.error("Cannot show card upgrade modal: Missing elements or card.");
              if (onUpgradeChoiceCallback) onUpgradeChoiceCallback(null); // Callback null on error
              return;
         }
         // Clear any existing card selection callback
         this._currentCardSelectionCallback = null;

         this.cardSelectionTitle.textContent = `Upgrade: ${card.name}`;
         this.cardSelectionGrid.innerHTML = ''; // Clear previous grid

         const cardElement = this.createCardElement(card);
         if(cardElement) {
             cardElement.style.cursor = 'default';
             this.cardSelectionGrid.appendChild(cardElement);
         } else {
              this.cardSelectionGrid.innerHTML = '<p>Error displaying card.</p>';
         }


         // Remove previous upgrade buttons if they exist
         const existingOptions = this.cardSelectionModal.querySelector('.upgrade-options');
         if (existingOptions) existingOptions.remove();

         // Add Container for Upgrade Buttons
         const upgradeOptionsDiv = document.createElement('div');
         upgradeOptionsDiv.className = 'upgrade-options'; // Add class for potential styling/removal
         upgradeOptionsDiv.style.textAlign = 'center';
         upgradeOptionsDiv.style.marginTop = '20px'; // More space
         upgradeOptionsDiv.style.display = 'flex';
         upgradeOptionsDiv.style.gap = '15px'; // More gap
         upgradeOptionsDiv.style.justifyContent = 'center';

         // --- Refine Button ---
         const refineButton = document.createElement('button');
         refineButton.textContent = "Refine";
         refineButton.classList.add('button-confirm'); // Use confirm style
         // Tooltip generation (simplified - Card method needed for full preview)
         const refinePreviewText = card.getUpgradePreviewHtml ? card.getUpgradePreviewHtml('refine') : "Hone existing strengths.";
         refineButton.title = refinePreviewText;
         refineButton.onmouseover = (e) => this.showTooltip(refinePreviewText, e.clientX, e.clientY);
         refineButton.onmouseout = () => this.hideTooltip();
         refineButton.onmousemove = (e) => this.updateTooltipPosition(e.clientX, e.clientY);
         refineButton.onclick = () => {
              this.hideCardSelectionModal(true); // Hide modal (marks as cancelled internally for generic modals)
              if (onUpgradeChoiceCallback) onUpgradeChoiceCallback('refine'); // Pass choice back
         };
         upgradeOptionsDiv.appendChild(refineButton);

         // --- Transmute Button ---
         const transmuteButton = document.createElement('button');
         transmuteButton.textContent = "Transmute";
         transmuteButton.classList.add('button-secondary'); // Use secondary style
         // Tooltip generation (simplified)
         const transmutePreviewText = card.getUpgradePreviewHtml ? card.getUpgradePreviewHtml('transmute') : "Shift its core essence.";
         transmuteButton.title = transmutePreviewText;
         transmuteButton.onmouseover = (e) => this.showTooltip(transmutePreviewText, e.clientX, e.clientY);
         transmuteButton.onmouseout = () => this.hideTooltip();
         transmuteButton.onmousemove = (e) => this.updateTooltipPosition(e.clientX, e.clientY);
         transmuteButton.onclick = () => {
              this.hideCardSelectionModal(true);
              if (onUpgradeChoiceCallback) onUpgradeChoiceCallback('transmute');
         };
         upgradeOptionsDiv.appendChild(transmuteButton);

         // Append options div into the modal content, before the cancel button
         const modalContent = this.cardSelectionModal.querySelector('.modal-content');
         const cancelButton = modalContent?.querySelector('#cardSelectionCancel');
         if (modalContent && cancelButton) {
              modalContent.insertBefore(upgradeOptionsDiv, cancelButton);
         } else if (modalContent) {
              modalContent.appendChild(upgradeOptionsDiv); // Fallback append
         }

         // Temporarily repurpose the cancel button as a way to close without choosing
         if(this.cardSelectionCancelButton) {
              this.cardSelectionCancelButton.textContent = "Cancel Upgrade";
              this.cardSelectionCancelButton.style.display = 'block'; // Ensure it's visible
              // Make sure clicking cancel calls the callback with null
              this.cardSelectionCancelButton.onclick = () => {
                   this.hideCardSelectionModal(true); // Hides the modal
                   if (onUpgradeChoiceCallback) onUpgradeChoiceCallback(null); // Explicitly signal cancellation
              }
         }

         this.cardSelectionModal.style.display = 'block';
         // Note: Click outside to close logic is handled by _setupCommonListeners
         // We might need to ensure it also calls onUpgradeChoiceCallback(null)
    }

    // --- NEW: Deck Portrait Methods ---
    /** Renders the deck composition chart. */
    renderDeckPortrait(deckManager) {
         if (!this.deckChartCanvas || !deckManager || typeof deckManager.getMasterDeck !== 'function') {
             // console.warn("Cannot render deck portrait: Canvas or DeckManager missing/invalid.");
             return;
         }

         const masterDeck = deckManager.getMasterDeck();
         const elementCounts = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0, RF: 0 };
         masterDeck.forEach(card => {
             if (card && card.primaryElement && elementCounts.hasOwnProperty(card.primaryElement)) {
                 elementCounts[card.primaryElement]++;
             }
         });
         const totalCards = masterDeck.length;
         if (totalCards === 0) {
             // Optional: Draw an empty state or hide the canvas
             const ctx = this.deckChartCanvas.getContext('2d');
             ctx.clearRect(0, 0, this.deckChartCanvas.width, this.deckChartCanvas.height);
             ctx.textAlign = 'center';
             ctx.fillStyle = '#7f8c8d';
             ctx.font = '10px sans-serif';
             ctx.fillText("Empty Deck", this.deckChartCanvas.width / 2, this.deckChartCanvas.height / 2);
             return;
         }

         // --- Canvas Drawing Example (Simple Pie Chart) ---
         const ctx = this.deckChartCanvas.getContext('2d');
         const { width, height } = this.deckChartCanvas;
         const centerX = width / 2;
         const centerY = height / 2;
         const radius = Math.min(centerX, centerY) * 0.9; // Use 90% of smallest dimension's half

         ctx.clearRect(0, 0, width, height); // Clear previous drawing

         let currentAngle = -0.5 * Math.PI; // Start at 12 o'clock

         const elementOrder = ['A', 'I', 'S', 'P', 'C', 'R', 'RF']; // Consistent order
         // Using slightly adjusted/brighter colors for chart clarity
         const elementColors = {
             A: '#F39C12', I: '#3498DB', S: '#E74C3C', P: '#9B59B6',
             C: '#F1C40F', R: '#2ECC71', RF: '#95A5A6' // Lighter grey for RF
         };

         elementOrder.forEach(key => {
             const count = elementCounts[key];
             if (count === 0) return; // Skip empty slices

             const sliceAngle = (count / totalCards) * 2 * Math.PI;
             const endAngle = currentAngle + sliceAngle;

             ctx.beginPath();
             ctx.moveTo(centerX, centerY);
             ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
             ctx.closePath();

             ctx.fillStyle = elementColors[key] || '#7f8c8d'; // Use defined color or fallback
             ctx.fill();
             // Optional: Add a subtle border
             // ctx.strokeStyle = '#1a2530';
             // ctx.lineWidth = 0.5;
             // ctx.stroke();

             // TODO: Add click detection logic here if using Canvas
             // This is complex, involving checking if click coordinates are within a segment's bounds.
             // Using SVG or a library is recommended for easier interactivity.

             currentAngle = endAngle;
         });
         // --- End Canvas Example ---

         // Add click listener to the CANVAS (less precise than SVG elements)
         this.deckChartCanvas.onclick = (event) => {
              // Calculate angle from click coordinates (complex)
              // Determine which segment corresponds to the angle
              // For now, just log and maybe trigger a default element
              const rect = this.deckChartCanvas.getBoundingClientRect();
              const x = event.clientX - rect.left - centerX;
              const y = event.clientY - rect.top - centerY;
              let angle = Math.atan2(y, x);
              if (angle < -Math.PI / 2) angle += 2 * Math.PI; // Adjust range to match drawing start

              let checkAngle = -0.5 * Math.PI;
              let clickedElement = null;
              for(const key of elementOrder) {
                  const count = elementCounts[key]; if (count === 0) continue;
                  const sliceAngle = (count / totalCards) * 2 * Math.PI;
                  const endAngle = checkAngle + sliceAngle;
                  if (angle >= checkAngle && angle < endAngle) { clickedElement = key; break; }
                  checkAngle = endAngle;
              }

              if (clickedElement) {
                   console.log(`Deck chart clicked. Element: ${clickedElement}`);
                   this.showCardListForElement(clickedElement, deckManager);
              } else {
                   console.log("Deck chart clicked (missed segment).");
              }
         };
         this.deckChartCanvas.style.cursor = 'pointer'; // Indicate clickable
     }

     /** Shows a modal listing cards of a specific element from the deck. */
     showCardListForElement(elementKey, deckManager) {
         if (!elementKey || !deckManager || !this.gameState || !this.gameState.player) {
            console.error("Cannot show card list: Missing data."); return;
         }

         const cardsOfElement = deckManager.getMasterDeck().filter(card => card?.primaryElement === elementKey);
         const title = `Concepts (${Data.elementKeyToFullName[elementKey] || elementKey})`;

         if (!this.cardSelectionModal || !this.cardSelectionGrid || !this.cardSelectionTitle) {
             console.error("Card Selection Modal elements not found."); return;
         }
         this._currentCardSelectionCallback = null;

         this.cardSelectionTitle.textContent = title;
         this.cardSelectionGrid.innerHTML = ''; // Clear previous grid

         if (cardsOfElement.length === 0) {
             this.cardSelectionGrid.innerHTML = '<p>None found in deck.</p>';
         } else {
             cardsOfElement.sort((a,b) => (a.cost ?? 99) - (b.cost ?? 99) || a.name.localeCompare(b.name)); // Sort by cost, then name
             cardsOfElement.forEach(card => {
                 const cardElement = this.createCardElement(card);
                 if (cardElement) {
                     cardElement.style.cursor = 'default';
                     this.cardSelectionGrid.appendChild(cardElement);
                 }
             });
         }

          // Add Synergy Hints
          const modalContent = this.cardSelectionModal.querySelector('.modal-content');
          // Remove previous hints if they exist
          const existingHints = modalContent?.querySelector('.synergy-hints');
          if(existingHints) existingHints.remove();

          const synergyDiv = document.createElement('div');
          synergyDiv.className = 'synergy-hints'; // Add class for removal/styling
          synergyDiv.style.marginTop = '15px'; synergyDiv.style.paddingTop = '10px'; synergyDiv.style.borderTop = '1px dashed #566573';
          synergyDiv.style.textAlign = 'left'; synergyDiv.style.fontSize = '0.9em';
          synergyDiv.innerHTML = `<h4>Synergy Hints:</h4><p>${this.generateSynergyHint(elementKey, cardsOfElement)}</p>`;

           // Append hints before the cancel button
          const cancelButton = modalContent?.querySelector('#cardSelectionCancel');
          if (modalContent && cancelButton) {
               modalContent.insertBefore(synergyDiv, cancelButton);
          } else if (modalContent) {
               modalContent.appendChild(synergyDiv);
          }


         // Configure and show modal
         if (this.cardSelectionCancelButton) {
             this.cardSelectionCancelButton.textContent = "Close";
             this.cardSelectionCancelButton.onclick = () => this.hideCardSelectionModal(true); // Just close
             this.cardSelectionCancelButton.style.display = 'block';
         }
         this.cardSelectionModal.style.display = 'block';
     }

     /** Generates simple synergy hints based on card keywords. */
     generateSynergyHint(elementKey, cards) {
         let hints = [];
         const attackCount = cards.filter(c => c?.cardType === 'Attack').length;
         const blockCards = cards.filter(c => c?.keywords.includes('Block'));
         const drawCount = cards.filter(c => c?.keywords.includes('Draw')).length;
         const debuffCards = cards.filter(c => c?.keywords.includes('Debuff') || c?.keywords.includes('Weak') || c?.keywords.includes('Vulnerable') || c?.keywords.includes('Frail'));
         const focusCount = cards.filter(c => c?.keywords.includes('Focus') || c?.keywords.includes('GainFocus')).length;
         const exhaustCount = cards.filter(c => c?.keywords.includes('Exhaust')).length;

         if (attackCount >= 3) hints.push("Strong attack presence.");
         if (blockCards.length >= 3) hints.push("Solid defensive core.");
         if (drawCount >= 2) hints.push("Good card flow potential.");
         if (debuffCards.length >= 2) hints.push("Applies multiple debuffs.");
         if (focusCount >= 1 && drawCount >=1) hints.push("Synergy between Focus gain and Card Draw.");
         if (exhaustCount >= 2) hints.push("Utilizes powerful, single-use Exhaust effects.");
         if (cards.length > 5 && hints.length === 0) hints.push("Diverse set of effects.");

         // Element specific hints
         switch(elementKey) {
            case 'I': if(attackCount > 0 && debuffCards.length > 0) hints.push("Combines direct interaction with weakening effects."); break;
            case 'P': if(blockCards.length > 0 && cards.some(c => c.keywords.includes('Heal'))) hints.push("Focuses on psychological resilience (Block/Heal)."); break;
            case 'C': if(drawCount > 0 && focusCount > 0) hints.push("Strong cognitive engine (Draw/Focus)."); break;
            // Add more specific hints...
         }

         return hints.length > 0 ? `• ${hints.join('<br>• ')}` : "This element provides a unique foundation. Explore combinations!";
     }

} // End of UIManager class
