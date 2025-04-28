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
        if (!gameState || !metaProgression) {
            console.error("UIManager Error: Attempted to set invalid GameState or MetaProgression reference.");
            return;
        }
        this.gameState = gameState;
        this.metaProgression = metaProgression;

        // Initialize Child UI Managers, passing necessary references
        try {
             this.combatUI = new CombatUI(this, this.gameState);
             // this.mapUI = new MapUI(this, this.gameState); // When MapUI class is created
             console.log("UIManager references set, child managers initialized.");
        } catch (error) {
             console.error("Error initializing child UI managers:", error);
             // Handle error appropriately, maybe disable parts of the UI
        }
    }

    /** Finds and stores references to all screen elements with class="screen" */
    _collectScreens() {
        const screenElements = this.gameContainer?.querySelectorAll('.screen');
        if (!screenElements) {
            console.error("UIManager Error: Could not query for screens within game container.");
            return;
        }
        screenElements.forEach(screen => {
            if (screen.id) {
                this.screens[screen.id] = screen;
                screen.classList.remove('active'); // Ensure all start hidden
                screen.style.opacity = '0'; // Ensure correct initial state for transitions
                screen.style.pointerEvents = 'none';
            } else {
                 console.warn("Found screen element without an ID:", screen);
            }
        });

        // Find Mirror Quiz Screen specifically - This ensures it's in the this.screens object
        if (this.mirrorQuizScreen) {
             this.screens['mirrorQuizScreen'] = this.mirrorQuizScreen;
              // Ensure initial state matches others
             this.mirrorQuizScreen.classList.remove('active');
             this.mirrorQuizScreen.style.opacity = '0';
             this.mirrorQuizScreen.style.pointerEvents = 'none';
        } else {
             console.warn("Mirror Quiz screen element (#mirrorQuizScreen) not found.");
        }

         // Verify core screens were found
         const coreScreens = ['mainMenuScreen', 'mapScreen', 'combatScreen']; // Add others as needed
         coreScreens.forEach(id => {
            if (!this.screens[id]) console.error(`UIManager FATAL: Core screen #${id} not found! Check index.html.`);
         })
    }

     /** Ensures feedback areas exist in the DOM, creating them if necessary. */
     _ensureFeedbackAreasExist() {
        if (!this.notificationArea) {
             this.notificationArea = this._createFeedbackArea('notificationArea', 'bottom', 'right');
             console.log("Created notificationArea.");
        }
        if (!this.actionFeedbackArea) {
             this.actionFeedbackArea = this._createFeedbackArea('actionFeedbackArea', 'top', 'center');
             console.log("Created actionFeedbackArea.");
        }
     }

     /** Creates a styled container div for notifications or action feedback. */
     _createFeedbackArea(id, vAlign = 'bottom', hAlign = 'right') {
         console.warn(`Creating placeholder DOM element for missing feedback area #${id}`);
         const area = document.createElement('div');
         area.id = id;
         Object.assign(area.style, {
             position: 'absolute', zIndex: '150', pointerEvents: 'none', display: 'flex',
             flexDirection: 'column', gap: '5px', padding: '10px', maxWidth: '350px', width: '90%'
         });
         if (vAlign === 'top') area.style.top = '15px'; else area.style.bottom = '15px';
         if (hAlign === 'center') { area.style.left = '50%'; area.style.transform = 'translateX(-50%)'; area.style.alignItems = 'center'; }
         else if (hAlign === 'left') { area.style.left = '15px'; area.style.alignItems = 'flex-start'; }
         else { area.style.right = '15px'; area.style.alignItems = 'flex-end'; }
         this.gameContainer.appendChild(area);
         return area;
     }

    /** Sets up listeners for common UI elements like modal close buttons. */
    _setupCommonListeners() {
        // Modal Close Button
        if (this.modalCloseButton) {
             this.modalCloseButton.onclick = () => this.hideModal();
        } else { console.warn("Modal close button not found."); }

        // Click outside modal content to close
        window.addEventListener('click', (event) => {
            // Close general modal
            if (this.modalPopup && event.target == this.modalPopup && this.modalPopup.style.display === 'block') {
                 this.hideModal();
            }
            // Close card selection modal (including upgrade modal variant)
            if (this.cardSelectionModal && event.target == this.cardSelectionModal && this.cardSelectionModal.style.display === 'block') {
                 // Check if it was the upgrade modal specifically based on title or presence of upgrade buttons?
                 // For now, assume clicking outside always cancels any selection/upgrade process
                 this.hideCardSelectionModal(true); // Cancel if clicked outside
                 // If an upgrade was pending, the callback needs to be handled
                 // The specificCloseHandler in showCardUpgradeModal might need adjustment
                 // Or, rely on hideCardSelectionModal to call the callback with null if it exists.
            }
        });

         // Card Selection Modal Cancel Button (General Case)
         if (this.cardSelectionCancelButton) {
             this.cardSelectionCancelButton.onclick = () => this.hideCardSelectionModal(true); // Explicit cancel
         } else { console.warn("Card Selection Cancel button not found."); }
    }

    /** Sets up listeners for buttons on specific node screens (Shop, Rest). */
     _setupNodeActionListeners() {
         // Shop
         if (this.leaveShopButton) {
              this.leaveShopButton.onclick = () => this.gameState?.leaveShop();
         } else { console.warn("Leave Shop button not found."); }

         // Rest Site
         if (this.restHealButton) this.restHealButton.onclick = () => this.gameState?.handleRestSiteAction('heal');
         else console.warn("Rest Heal button not found.");
         if (this.restMeditateButton) this.restMeditateButton.onclick = () => this.gameState?.handleRestSiteAction('upgrade');
         else console.warn("Rest Meditate button not found.");
         if (this.restJournalButton) this.restJournalButton.onclick = () => this.gameState?.handleRestSiteAction('remove');
         else console.warn("Rest Journal button not found.");
         if (this.leaveRestSiteButton) this.leaveRestSiteButton.onclick = () => this.gameState?.leaveRestSite();
         else console.warn("Leave Rest Site button not found.");
     }

    /** Shows a specific screen and hides the current one with fade effect. */
    showScreen(screenId) {
        if (this.currentScreen && this.currentScreen.id === screenId) {
             // console.log(`Screen ${screenId} is already active.`); // Can be noisy
             return; // Already showing
        }

        // Hide current screen
        if (this.currentScreen) {
             this.currentScreen.classList.remove('active');
             this.currentScreen.style.opacity = '0';
             this.currentScreen.style.pointerEvents = 'none';
        }

        // Show new screen
        const nextScreen = this.screens[screenId];
        if (nextScreen) {
            this.currentScreen = nextScreen;
            this.currentScreen.classList.add('active');
            // Force reflow before changing opacity for transition
            void this.currentScreen.offsetWidth;
            this.currentScreen.style.opacity = '1';
            this.currentScreen.style.pointerEvents = 'auto';
            console.log(`UIManager: Showing screen: ${screenId}`);

            // --- Special actions on showing certain screens ---
            if (screenId === 'metaScreen') this.renderMetaScreen();
            // Re-render map and update HUD if returning to mapScreen
            if (screenId === 'mapScreen') {
                 this.gameState?.mapManager?.renderMap();
                 if (this.gameState?.player) {
                     this.updatePlayerMapInfo(this.gameState.player, this.gameState.currentFloor);
                      // Ensure deck portrait updates on map show
                     this.renderDeckPortrait(this.gameState.player.deckManager);
                 }
            }
            // Update combat HUD when showing combat screen
             if (screenId === 'combatScreen' && this.gameState?.player) {
                  this.updateAttunementMeter(this.gameState.player);
             }
            // Clear combat target when leaving combat
            if (this.currentScreen.id !== 'combatScreen') {
                 this.gameState?.combatManager?.setSelectedTarget(null); // Clear target
            }

        } else {
            console.error(`UIManager Error: Screen ID "${screenId}" not found! Cannot show.`);
            // Show main menu as fallback?
            this.showScreen('mainMenuScreen');
        }
    }

    // --- DELEGATED Update Methods ---

    /** Delegates combat UI update to CombatUI */
    updateCombatUI(player, enemies, isPlayerTurn) {
        if (!this.combatUI) { console.error("CombatUI not initialized, cannot update."); return; }
        this.combatUI.update(player, enemies, isPlayerTurn);
        // Also update combat attunement meter here
        if(player) this.updateAttunementMeter(player);
    }

    /** Updates deck/discard counts (can be called from anywhere) */
    updateDeckDiscardCounts(deckManager) {
        if (!deckManager) return;
        this.combatUI?.updateDeckDiscardCounts(deckManager); // Update counts in combat UI
        // Update deck portrait regardless of current screen? Or only if map is visible? Let's do always for now.
        this.renderDeckPortrait(deckManager);
    }

    // --- MAP Rendering (with logging for debugging) ---
    renderMap(nodes, currentNodeId, connections) {
        const mapContainer = this.mapArea;
        if (!mapContainer) { console.error("UIManager Error: Map area element not found."); return; }
        if (!this.gameState || !this.gameState.mapManager) { console.warn("UIManager Warning: GameState or MapManager missing for map render."); return; }
        if (!nodes || Object.keys(nodes).length === 0) { mapContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Map Error: No nodes found.</p>'; return; }

        console.log(`UIManager: Rendering Map with ${Object.keys(nodes).length} nodes and ${connections?.length || 0} connections. Current Node: ${currentNodeId}`); // Log counts
        mapContainer.innerHTML = ''; // Clear previous map content
        const svgNS = "http://www.w3.org/2000/svg";
        const mapSvg = document.createElementNS(svgNS, "svg");
        mapSvg.setAttribute('width', '100%');
        mapSvg.setAttribute('height', '100%');
        mapSvg.style.backgroundColor = 'var(--color-bg-dark)'; // Use theme variable

        // Define marker (optional)
        const defs = document.createElementNS(svgNS, 'defs');
        const marker = document.createElementNS(svgNS, 'marker');
        marker.setAttribute('id', 'arrowhead'); marker.setAttribute('markerWidth', '10'); marker.setAttribute('markerHeight', '7'); marker.setAttribute('refX', '0'); marker.setAttribute('refY', '3.5'); marker.setAttribute('orient', 'auto');
        const polygon = document.createElementNS(svgNS, 'polygon'); polygon.setAttribute('points', '0 0, 10 3.5, 0 7'); polygon.setAttribute('fill', '#6c7a89'); // Arrow color
        marker.appendChild(polygon); defs.appendChild(marker); mapSvg.appendChild(defs);


        // --- Render Connections ---
        try { // Added try/catch for connections
            console.log("UIManager: Rendering connections...");
            connections?.forEach((conn, index) => {
                const fromNode = nodes[conn.from];
                const toNode = nodes[conn.to];
                // Add checks for node existence AND valid positions
                if (fromNode && toNode && fromNode.position && typeof fromNode.position.x === 'number' && typeof fromNode.position.y === 'number' && toNode.position && typeof toNode.position.x === 'number' && typeof toNode.position.y === 'number') {
                    const line = document.createElementNS(svgNS, "line");
                    line.setAttribute('x1', fromNode.position.x);
                    line.setAttribute('y1', fromNode.position.y);
                    line.setAttribute('x2', toNode.position.x);
                    line.setAttribute('y2', toNode.position.y);
                    line.setAttribute('stroke', fromNode.visited ? '#566573' : '#6c7a89'); // Dim visited
                    line.setAttribute('stroke-width', '3');
                    // line.setAttribute('marker-end', 'url(#arrowhead)'); // Optional arrows
                    mapSvg.appendChild(line);
                    // if (index < 5) console.log(` -> Line from ${conn.from} (${fromNode.position.x},${fromNode.position.y}) to ${conn.to} (${toNode.position.x},${toNode.position.y})`); // Log first few lines
                } else {
                    console.warn(`Skipping connection render: Invalid node data or position for conn ${conn.from} -> ${conn.to}`);
                }
            });
             console.log("UIManager: Finished rendering connections.");
        } catch (error) {
             console.error("Error rendering map connections:", error);
        }

        // --- Render Nodes ---
         try { // Added try/catch for nodes
             console.log("UIManager: Rendering nodes...");
             Object.values(nodes).forEach((node, index) => {
                // Robust check for valid node and position data
                if (!node || !node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
                    console.warn(`Skipping node render: Invalid node data or position for node ID ${node?.id || 'UNKNOWN'}`);
                    return; // Skip this node if data is bad
                }

                 const isCurrent = node.id === currentNodeId;
                 const currentNodeData = nodes[currentNodeId]; // Cache current node data
                 const isAvailable = currentNodeData?.connections?.includes(node.id); // Safer access to connections

                 const nodeGroup = document.createElementNS(svgNS, "g");
                 nodeGroup.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);
                 nodeGroup.dataset.nodeId = node.id; // Store ID for clicks/tooltips

                 const circle = document.createElementNS(svgNS, "circle");
                 circle.setAttribute('r', '20'); // Slightly larger radius
                 circle.setAttribute('fill', this.getNodeColor(node.type));
                 circle.setAttribute('stroke', isCurrent ? 'var(--color-accent-tertiary)' : (node.visited ? '#555' : '#ecf0f1')); // Use CSS var for current
                 circle.setAttribute('stroke-width', isCurrent ? '4' : '2');

                 const iconChar = this.getNodeIcon(node.type);
                 const iconText = document.createElementNS(svgNS, "text");
                 iconText.setAttribute('font-family', '"Font Awesome 6 Free"'); // Ensure correct font family name
                 iconText.style.fontWeight = 900; // Font Awesome solid style weight
                 iconText.setAttribute('font-size', '20px'); // Match radius roughly
                 iconText.setAttribute('fill', node.visited && !isCurrent ? '#999' : '#fff'); // Dim icon if visited
                 iconText.setAttribute('text-anchor', 'middle');
                 iconText.setAttribute('dominant-baseline', 'central'); // Center icon vertically/horizontally
                 iconText.textContent = iconChar; // Get icon character

                 nodeGroup.appendChild(circle);
                 nodeGroup.appendChild(iconText);

                 // Interactivity and Styling
                 if (isAvailable && !isCurrent) {
                     nodeGroup.style.cursor = 'pointer';
                     nodeGroup.classList.add('map-node-available'); // For potential CSS hover effects
                     // Ensure click listener is properly attached
                     nodeGroup.onclick = () => this.gameState?.mapManager?.moveToNode(node.id); // Use onclick for SVG elements
                     // Add hover visual feedback via JS (CSS :hover might be better)
                     nodeGroup.onmouseenter = () => { circle.setAttribute('stroke', '#fff'); circle.setAttribute('stroke-width', '3'); };
                     nodeGroup.onmouseleave = () => { circle.setAttribute('stroke', '#ecf0f1'); circle.setAttribute('stroke-width', '2'); };
                 } else {
                     nodeGroup.style.cursor = 'default';
                     // Dim future, unavailable nodes significantly - Refined logic
                     let isReachableLater = false;
                     if (currentNodeData?.connections) {
                          // Check if any *available* node connects to this one
                          isReachableLater = currentNodeData.connections.some(nextId => nodes[nextId]?.connections?.includes(node.id));
                     }
                     if (!isCurrent && !node.visited && !isAvailable && !isReachableLater) {
                         nodeGroup.style.opacity = 0.4; // Dim distant nodes more
                     } else {
                          nodeGroup.style.opacity = node.visited && !isCurrent ? 0.6 : 1.0; // Slightly dim visited
                     }
                 }

                 // Tooltips (SVG standard title element)
                 let tooltipText = `${node.type.toUpperCase()}`;
                 if (node.data?.eventId) {
                     const eventDetails = Data.reflectionPrompts[node.data.eventId] // Check reflection first
                         || Object.values(Data.reflectionPrompts).reduce((found, category) => { // Check inside categories
                              if (found) return found;
                              if (Array.isArray(category)) return category.find(p => p.id === node.data.eventId);
                              if (typeof category === 'object') return category[node.data.eventId]; // Check rare concepts etc.
                              return null;
                          }, null)
                         || Data.elementalDilemmas.find(d => d.id === node.data.eventId); // Then check dilemmas
                     tooltipText += ` (${eventDetails?.name || eventDetails?.situation?.substring(0,20)+'...' || node.data.eventId})`;
                 }
                 if (isCurrent) tooltipText += " (Current)";
                 else if (node.visited) tooltipText += " (Visited)";
                 else if (!isAvailable) tooltipText += " (Unavailable)";
                 const titleElement = document.createElementNS(svgNS, "title");
                 titleElement.textContent = tooltipText;
                 nodeGroup.appendChild(titleElement); // Add title to group

                 // Store DOM element reference on the node object (optional)
                 node.element = nodeGroup;
                 mapSvg.appendChild(nodeGroup);

                // if (index < 5) console.log(` -> Node ${node.id} (${node.type}) at (${node.position.x},${node.position.y}), Icon: ${iconChar}`); // Log first few nodes

             });
              console.log("UIManager: Finished rendering nodes.");
         } catch (error) {
              console.error("Error rendering map nodes:", error);
         }

        // Final append to DOM
        try {
             console.log("UIManager: Appending SVG to map area...");
             mapContainer.appendChild(mapSvg);
             console.log("UIManager: SVG appended successfully.");
        } catch(error) {
            console.error("Error appending SVG to map area:", error);
             mapContainer.innerHTML = '<p style="color:red; text-align:center; padding: 20px;">Error displaying map!</p>'; // Show error in map area
        }
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
     }

    // --- Methods specific to UIManager (Feedback, Modals, Global state) ---
    /** Creates a card DOM element (used by CombatUI, RewardScreen etc.) */
    createCardElement(card) {
        if (!card || card.conceptId === -1) { console.warn("Attempted to create card element for invalid card:", card); const errorDiv = document.createElement('div'); errorDiv.className = 'card error-card'; errorDiv.textContent = 'Error'; return errorDiv; }
        const cardDiv = document.createElement('div'); cardDiv.className = `card rarity-${card.rarity} type-${card.cardType.toLowerCase().split('/')[0]}`; cardDiv.dataset.cardId = card.id; cardDiv.dataset.conceptId = card.conceptId;
        const cost = document.createElement('div'); cost.className = 'card-cost'; cost.textContent = card.cost === null ? 'X' : card.cost;
        const name = document.createElement('div'); name.className = 'card-name'; name.textContent = card.name;
        const description = document.createElement('div'); description.className = 'card-description'; description.innerHTML = card.getEffectDescriptionHtml();
        const type = document.createElement('div'); type.className = 'card-type'; type.textContent = card.cardType;
        cardDiv.appendChild(cost); cardDiv.appendChild(name); cardDiv.appendChild(description); cardDiv.appendChild(type);
        // Add tooltip listener using *this* UIManager instance
        cardDiv.addEventListener('mouseover', (event) => this.showTooltip(card.getTooltipHtml(), event.clientX, event.clientY));
        cardDiv.addEventListener('mouseout', () => this.hideTooltip());
        cardDiv.addEventListener('mousemove', (event) => this.updateTooltipPosition(event.clientX, event.clientY));
        return cardDiv;
    }
    /** Shows a persistent notification message. */
    showNotification(message, duration = 3500) {
        if (!this.notificationArea) { console.log("Notify:", message); return; } const el = document.createElement('div'); el.className = 'notification-message'; el.innerHTML = message; this.notificationArea.appendChild(el); setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 500); }, duration);
    }
    /** Shows temporary action feedback (e.g., "Not enough Focus!"). */
    showActionFeedback(message, type = 'info', duration = 1800) {
        if (!this.actionFeedbackArea) { console.log(`Feedback (${type}):`, message); return; } const el = document.createElement('div'); el.className = `action-feedback feedback-${type}`; el.textContent = message; this.actionFeedbackArea.prepend(el); if (this.actionFeedbackArea.children.length > 4) { this.actionFeedbackArea.lastChild?.remove(); } setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(-15px)'; setTimeout(() => el.remove(), 500); }, duration);
    }
    /** Clears all enemy highlights and targeting styles. */
    clearEnemyHighlights() { this.combatUI?.clearEnemyHighlights(); }
    /** Highlights or removes highlight from an enemy (called by CombatUI). */
    highlightEnemy(enemyInstanceId, highlighted = true) { this.combatUI?.highlightEnemy(enemyInstanceId, highlighted); }

    // --- Tooltip Methods ---
    showTooltip(content, x, y) { if (!this.tooltipElement) return; this.tooltipElement.innerHTML = content; this.tooltipElement.style.display = 'block'; this.updateTooltipPosition(x, y); }
    hideTooltip() { if (!this.tooltipElement) return; this.tooltipElement.style.display = 'none'; }
    updateTooltipPosition(x, y) { if (!this.tooltipElement || this.tooltipElement.style.display === 'none') return; const offsetX = 15; const offsetY = 10; const tooltipRect = this.tooltipElement.getBoundingClientRect(); const containerRect = this.gameContainer.getBoundingClientRect(); let top = y + offsetY; let left = x + offsetX; if (left + tooltipRect.width > containerRect.right - 10) { left = x - tooltipRect.width - offsetX; } if (top + tooltipRect.height > containerRect.bottom - 10) { top = y - tooltipRect.height - offsetY; } if (left < containerRect.left + 10) left = containerRect.left + 10; if (top < containerRect.top + 10) top = containerRect.top + 10; this.tooltipElement.style.left = `${left}px`; this.tooltipElement.style.top = `${top}px`; }

    // --- Modal Methods ---
    showModal(text, choices = []) { if (!this.modalPopup || !this.modalText || !this.modalChoices) { console.error("Cannot show modal, elements missing."); alert(text.replace(/<[^>]*>?/gm, '')); return; } this.modalText.innerHTML = text; this.modalChoices.innerHTML = ''; if (choices.length === 0) { const okBtn = document.createElement('button'); okBtn.textContent = 'OK'; okBtn.onclick = () => this.hideModal(); this.modalChoices.appendChild(okBtn); } else { choices.forEach(choice => { const btn = document.createElement('button'); btn.textContent = choice.text; btn.onclick = () => { this.hideModal(); if (choice.callback && typeof choice.callback === 'function') { choice.callback(); } }; if (choice.disabled) btn.disabled = true; this.modalChoices.appendChild(btn); }); } this.modalPopup.style.display = 'block'; }
    hideModal() { if (!this.modalPopup) return; this.modalPopup.style.display = 'none'; this.modalText.innerHTML = ''; this.modalChoices.innerHTML = ''; }

    // --- Card Selection Modal ---
    showCardSelectionModal(cardsToShow, onSelectCallback, title = "Select a Card") { if (!this.cardSelectionModal || !this.cardSelectionGrid || !this.cardSelectionTitle || !this.gameState) { console.error("Cannot show card selection modal: Elements missing or GameState unavailable."); if (onSelectCallback) onSelectCallback(null); return; } this._currentCardSelectionCallback = onSelectCallback; this.cardSelectionTitle.textContent = title; this.cardSelectionGrid.innerHTML = ''; if (!Array.isArray(cardsToShow) || cardsToShow.length === 0) { this.cardSelectionGrid.innerHTML = '<p>No options available.</p>'; } else { cardsToShow.forEach(card => { const cardElement = this.createCardElement(card); if (cardElement) { cardElement.style.cursor = 'pointer'; cardElement.onclick = () => this.hideCardSelectionModal(false, card); this.cardSelectionGrid.appendChild(cardElement); } }); } /* Clear potential upgrade buttons */ const existingOptions = this.cardSelectionModal.querySelector('.upgrade-options'); if (existingOptions) existingOptions.remove(); if(this.cardSelectionCancelButton) { this.cardSelectionCancelButton.textContent = "Cancel"; this.cardSelectionCancelButton.onclick = () => this.hideCardSelectionModal(true); this.cardSelectionCancelButton.style.display = 'block'; } this.cardSelectionModal.style.display = 'block'; }
    hideCardSelectionModal(cancelled = true, selectedCard = null) { if (!this.cardSelectionModal) return; this.cardSelectionModal.style.display = 'none'; if (this._currentCardSelectionCallback && typeof this._currentCardSelectionCallback === 'function') { try { this._currentCardSelectionCallback(cancelled ? null : selectedCard); } catch (error) { console.error("Error executing card selection callback:", error); } } this._currentCardSelectionCallback = null; /* Remove dynamic upgrade buttons if they exist */ const existingOptions = this.cardSelectionModal.querySelector('.upgrade-options'); if (existingOptions) existingOptions.remove(); }

    // --- Node Screen Rendering (Reward, Shop, Rest) ---
    showRewardScreen(rewards) { if (!this.rewardScreen || !this.gameState || !this.gameState.player || !rewards) { console.error("Cannot show reward screen: Missing elements, game state, player, or rewards data."); if (rewards?.onComplete) rewards.onComplete(); return; } if (this.rewardInsightText) { this.rewardInsightText.innerHTML = `Insight Gained: ${rewards.insight || 0} <i class='fas fa-brain insight-icon'></i>`; } let cardChoiceMade = false; let artifactChoiceMade = false; let choicesAvailable = false; if (this.rewardCardsArea) { this.rewardCardsArea.innerHTML = '<h3>Choose a Concept:</h3>'; if (rewards.cardChoices?.length > 0) { choicesAvailable = true; rewards.cardChoices.forEach(cardId => { try { const card = new Card(cardId); if (card.conceptId !== -1) { const el = this.createCardElement(card); el.classList.add('clickable-reward'); el.onclick = () => { if (cardChoiceMade) return; cardChoiceMade = true; this.gameState.player.addCardToDeck(cardId); this.rewardCardsArea.innerHTML = `<p class="reward-chosen">Acquired: ${card.name}</p>`; if(this.rewardSkipButton) this.rewardSkipButton.textContent = 'Continue'; }; this.rewardCardsArea.appendChild(el); } } catch (error) { console.error(`Error creating reward card element for ID ${cardId}:`, error); } }); } else { this.rewardCardsArea.innerHTML += '<p>None found.</p>'; } } if (this.rewardArtifactsArea) { this.rewardArtifactsArea.innerHTML = '<h3>Choose a Relic:</h3>'; if (rewards.artifactChoices?.length > 0) { choicesAvailable = true; rewards.artifactChoices.forEach(artifactId => { try { const artifact = new Artifact(artifactId); if (artifact.id !== 'error_artifact') { const el = document.createElement('div'); el.innerHTML = artifact.getDisplayHtml(); el.classList.add('artifact-display', 'clickable-reward'); el.addEventListener('mouseover', (event) => this.showTooltip(artifact.getTooltipHtml(), event.clientX, event.clientY)); el.addEventListener('mouseout', () => this.hideTooltip()); el.addEventListener('mousemove', (event) => this.updateTooltipPosition(event.clientX, event.clientY)); el.onclick = () => { if (artifactChoiceMade) return; artifactChoiceMade = true; this.gameState.player.addArtifact(artifactId); this.rewardArtifactsArea.innerHTML = `<p class="reward-chosen">Acquired: ${artifact.name}</p>`; if(this.rewardSkipButton) this.rewardSkipButton.textContent = 'Continue'; }; this.rewardArtifactsArea.appendChild(el); } } catch(error) { console.error(`Error creating reward artifact element for ID ${artifactId}:`, error); } }); } else { this.rewardArtifactsArea.innerHTML += '<p>None found.</p>'; } } if (this.rewardSkipButton) { this.rewardSkipButton.textContent = choicesAvailable ? 'Skip Choices / Continue' : 'Continue'; this.rewardSkipButton.onclick = rewards.onComplete; } else { console.error("Reward Skip/Continue button not found!"); if (rewards.onComplete) rewards.onComplete(); } this.showScreen('rewardScreen'); }
    renderShop(shopInventory, playerInsight) { if (!this.shopScreen || !this.gameState?.player || !shopInventory) { console.error("Cannot render shop: Missing elements, player, or inventory data."); return; } if(this.shopInsightDisplay) this.shopInsightDisplay.innerHTML = `Insight: ${playerInsight} <i class='fas fa-brain insight-icon'></i>`; if(this.shopCards) { this.shopCards.innerHTML = '<h3>Concepts:</h3>'; if (!shopInventory.cards || shopInventory.cards.length === 0) { this.shopCards.innerHTML += "<p>Sold out!</p>"; } else { shopInventory.cards.forEach((item) => { try { const card = new Card(item.cardId); if (card.conceptId === -1) throw new Error("Invalid card ID"); const shopItemDiv = document.createElement('div'); shopItemDiv.className = 'shop-item card-item'; shopItemDiv.appendChild(this.createCardElement(card)); const priceButton = document.createElement('button'); priceButton.textContent = `Buy (${item.cost} Insight)`; priceButton.disabled = item.purchased || playerInsight < item.cost; priceButton.title = item.purchased ? "Already purchased" : (playerInsight < item.cost ? "Not enough Insight" : `Purchase ${card.name}`); if(!item.purchased) { priceButton.onclick = () => this.gameState.handleShopPurchase('card', item.cardId); } else { priceButton.textContent = "Purchased"; } shopItemDiv.appendChild(priceButton); this.shopCards.appendChild(shopItemDiv); } catch(error) { console.error(`Error rendering shop card ${item.cardId}:`, error); } }); } } if(this.shopArtifacts){ this.shopArtifacts.innerHTML = '<h3>Relics:</h3>'; if (!shopInventory.artifacts || shopInventory.artifacts.length === 0) { this.shopArtifacts.innerHTML += "<p>Sold out!</p>"; } else { shopInventory.artifacts.forEach((item) => { try { const artifact = new Artifact(item.artifactId); if (artifact.id === 'error_artifact') throw new Error("Invalid artifact ID"); const shopItemDiv = document.createElement('div'); shopItemDiv.className = 'shop-item artifact-item'; const artifactEl = document.createElement('div'); artifactEl.innerHTML = artifact.getDisplayHtml(); artifactEl.addEventListener('mouseover', (event) => this.showTooltip(artifact.getTooltipHtml(), event.clientX, event.clientY)); artifactEl.addEventListener('mouseout', () => this.hideTooltip()); artifactEl.addEventListener('mousemove', (event) => this.updateTooltipPosition(event.clientX, event.clientY)); shopItemDiv.appendChild(artifactEl); const priceButton = document.createElement('button'); priceButton.textContent = `Buy (${item.cost} Insight)`; priceButton.disabled = item.purchased || playerInsight < item.cost || this.gameState.player.artifacts.some(a => a.id === item.artifactId); priceButton.title = item.purchased ? "Already purchased" : (this.gameState.player.artifacts.some(a => a.id === item.artifactId) ? "Already owned" : (playerInsight < item.cost ? "Not enough Insight" : `Purchase ${artifact.name}`)); if (!item.purchased && !this.gameState.player.artifacts.some(a => a.id === item.artifactId)) { priceButton.onclick = () => this.gameState.handleShopPurchase('artifact', item.artifactId); } else if(item.purchased || this.gameState.player.artifacts.some(a => a.id === item.artifactId)){ priceButton.textContent = item.purchased ? "Purchased" : "Owned"; } shopItemDiv.appendChild(priceButton); this.shopArtifacts.appendChild(shopItemDiv); } catch(error) { console.error(`Error rendering shop artifact ${item.artifactId}:`, error); } }); } } if(this.shopRemoveService){ this.shopRemoveService.innerHTML = '<h3>Refinement:</h3>'; const removeButton = document.createElement('button'); const removalCost = shopInventory.removalCost; const canAfford = playerInsight >= removalCost; const deckSmall = this.gameState.player.deckManager?.masterDeck.length <= 5; removeButton.textContent = `Let Go (${removalCost} Insight)`; removeButton.disabled = !shopInventory.removalAvailable || !canAfford || deckSmall; if (!shopInventory.removalAvailable) removeButton.title = "Removal service already used."; else if (deckSmall) removeButton.title = "Deck is too small to remove concepts."; else if (!canAfford) removeButton.title = "Not enough Insight."; else removeButton.title = "Choose a Concept to remove from your deck."; removeButton.onclick = () => this.gameState.handleShopPurchase('remove'); this.shopRemoveService.appendChild(removeButton); if (!shopInventory.removalAvailable) { const usedText = document.createElement('span'); usedText.textContent = ' (Used)'; this.shopRemoveService.appendChild(usedText); } } }
    renderRestSite(restSiteState, player) { if (!this.restSiteScreen || !player || !restSiteState) { console.error("Cannot render rest site: Missing elements, player, or state."); return; } const used = restSiteState.usedOption; if (this.restHealButton) { this.restHealButton.disabled = used || player.currentIntegrity >= player.maxIntegrity; this.restHealButton.title = used ? "Already rested." : (player.currentIntegrity >= player.maxIntegrity ? "Integrity is full." : "Restore 30% Integrity."); } if (this.restMeditateButton) { const canUpgrade = player.deckManager.getMasterDeck().some(c => c && !c.upgraded); this.restMeditateButton.disabled = used || !canUpgrade; this.restMeditateButton.title = used ? "Already rested." : (!canUpgrade ? "No Concepts available to upgrade." : "Upgrade a Concept in your deck."); } if (this.restJournalButton) { const canRemove = player.deckManager.masterDeck.length > 5; this.restJournalButton.disabled = used || !canRemove; this.restJournalButton.title = used ? "Already rested." : (!canRemove ? "Deck is too small to remove." : "Remove a Concept from your deck."); } if (this.leaveRestSiteButton) { this.leaveRestSiteButton.textContent = used ? "Continue Journey" : "Leave"; } if (this.restUsedIndicator) { this.restUsedIndicator.textContent = used ? "You feel somewhat restored." : "Choose one action:"; } }

    // --- Meta Screen Rendering ---
    renderMetaScreen() { if (!this.metaContent || !this.metaProgression) { if(this.metaContent) this.metaContent.innerHTML = "<p>Loading Meta Progression...</p>"; console.warn("Cannot render meta screen: Element or MetaProgression missing."); return; } const mp = this.metaProgression; let html = `<h3>Meta Progress</h3>`; html += `<div class="meta-section">`; html += `<p><strong>Total Insight Earned:</strong> ${mp.totalInsight} <i class='fas fa-brain insight-icon'></i></p>`; html += `<p><strong>Highest Ascension Beaten:</strong> ${mp.highestAscensionBeat < 0 ? 'None' : mp.highestAscensionBeat}</p>`; const totalConcepts = Data?.concepts?.length || 0; const totalArtifacts = ARTIFACT_TEMPLATES ? Object.keys(ARTIFACT_TEMPLATES).length : 0; html += `<p><strong>Concepts Unlocked:</strong> ${mp.unlockedConceptIds.size} / ${totalConcepts}</p>`; html += `<p><strong>Relics Unlocked:</strong> ${mp.unlockedArtifactIds.size} / ${totalArtifacts}</p>`; html += `</div><hr>`; html += `<div class="meta-section"><h4>Permanent Upgrades:</h4><ul>`; let upgradesFound = false; const upgrades = mp.permanentUpgrades || mp.getDefaultUpgrades(); const formatUpgradeKey = (key) => key.replace(/([A-Z])/g, ' $1').replace(/Bonus$/, '').replace(/^./, str => str.toUpperCase()).trim(); for (const key in upgrades) { if (key === 'attunementBonus') continue; const bonus = upgrades[key]; if (typeof bonus === 'number' && bonus > 0) { html += `<li>+${bonus} ${formatUpgradeKey(key)}</li>`; upgradesFound = true; } } if (upgrades.attunementBonus) { for (const elemKey in upgrades.attunementBonus) { const bonus = upgrades.attunementBonus[elemKey]; if (typeof bonus === 'number' && bonus > 0) { html += `<li>+${bonus} ${elemKey === 'All' ? 'All Elements' : elemKey} Attunement</li>`; upgradesFound = true; } } } if (!upgradesFound) html += `<li>None yet!</li>`; html += `</ul></div><hr>`; html += `<div class="meta-section"><h4>Completed Milestones:</h4>`; if (mp.completedMilestoneIds.size > 0) { html += `<ul>`; mp.completedMilestoneIds.forEach(msId => { const milestoneData = Data.milestones?.find(m => m.id === msId); html += `<li>${milestoneData?.description || msId}</li>`; }); html += `</ul>`; } else { html += `<p>None yet.</p>`; } html += `</div><hr>`; html += `<div class="meta-section meta-actions"><h4>Actions:</h4>`; html += `<button id="resetMetaButton">Reset ALL Progress</button>`; html += `</div>`; this.metaContent.innerHTML = html; const resetButton = this.metaContent.querySelector('#resetMetaButton'); if (resetButton) { resetButton.onclick = () => this.metaProgression?.resetProgress(); } }

    // --- Node Color/Icon Helpers (Map Rendering) ---
    getNodeColor(type) { switch (type) { case 'combat': return '#c0392b'; case 'elite': return '#8e44ad'; case 'event': return '#2980b9'; case 'rest': return '#27ae60'; case 'shop': return '#f39c12'; case 'boss': return '#e74c3c'; case 'start': return '#bdc3c7'; default: return '#7f8c8d'; } }
    getNodeIcon(type) { switch (type) { case 'combat': return '\uf06d'; case 'elite': return '\uf005'; case 'event': return '\uf059'; case 'rest': return '\uf54b'; case 'shop': return '\uf07a'; case 'boss': return '\uf188'; case 'start': return '\uf007'; default: return '?'; } }

    // --- NEW: Mirror Quiz UI Methods ---
    showMirrorQuiz(quizManagerInstance, onCompleteCallback) { if (!this.mirrorQuizScreen || !quizManagerInstance) { console.error("Cannot show mirror quiz: Missing screen element or QuizManager instance."); if (onCompleteCallback) onCompleteCallback(null); return; } console.log("Showing Mirror Quiz..."); this._quizManagerInstance = quizManagerInstance; this._quizCompletionCallback = onCompleteCallback; this.renderQuizQuestion(); this.showScreen('mirrorQuizScreen'); }
    renderQuizQuestion() { if (!this._quizManagerInstance || !this.mirrorQuizScreen) return; const question = this._quizManagerInstance.getCurrentQuestion(); if (!question) { console.error("RenderQuizQuestion called but quiz instance has no current question."); if (this._quizCompletionCallback) this._quizCompletionCallback(null); return; } if (!this.quizQuestionTextEl || !this.quizChoicesEl || !this.quizProgressEl) { console.error("Quiz screen HTML elements missing! Cannot render question."); return; } this.quizQuestionTextEl.textContent = question.text; this.quizChoicesEl.innerHTML = ''; question.choices.forEach(choice => { const button = document.createElement('button'); button.textContent = choice.text; button.classList.add('button-secondary'); button.onclick = () => { this._quizManagerInstance.answerCurrentQuestion(choice.value); if (this._quizManagerInstance.isComplete()) { console.log("Quiz complete, calculating result..."); const result = this._quizManagerInstance.getDraftResult(); if (this._quizCompletionCallback) { this._quizCompletionCallback(result); } this._quizManagerInstance = null; this._quizCompletionCallback = null; } else { this.renderQuizQuestion(); } }; this.quizChoicesEl.appendChild(button); }); this.quizProgressEl.textContent = `Question ${this._quizManagerInstance.currentIndex + 1} / ${this._quizManagerInstance.questions.length}`; }

    // --- NEW: Attunement Meter Update ---
    updateAttunementMeter(player) { const meters = [this.attunementMeterMap, this.attunementMeterCombat]; if (!player || !player.attunements) { return; } meters.forEach(meter => { if (!meter) return; const pips = meter.querySelectorAll('.attunement-pip'); if (pips.length !== 7) { console.warn("Attunement meter HTML structure incorrect (needs 7 .attunement-pip elements)."); return; } const elementOrder = ['A', 'I', 'S', 'P', 'C', 'R', 'RF']; pips.forEach((pip, index) => { if (!pip) return; const key = elementOrder[index]; const value = player.attunements[key] || 0; const fullName = Data.elementKeyToFullName[key] || key; pip.classList.toggle('filled-tier1', value >= CORE_TRAIT_THRESHOLD); pip.title = `${fullName}: ${value}`; }); }); } // Added constant reference

    // --- NEW: Dual-Path Upgrade Modal ---
    showCardUpgradeModal(cardsToDisplay, onUpgradeChoiceCallback) { // Modified to accept array and handle selection first if needed
        if (!this.cardSelectionModal || !this.cardSelectionGrid || !this.cardSelectionTitle) { console.error("Cannot show card upgrade modal: Missing elements."); if (onUpgradeChoiceCallback) onUpgradeChoiceCallback(null, null); return; }
        this._currentCardSelectionCallback = null; // Clear any standard selection callback

        const showOptionsForCard = (card) => {
            this.cardSelectionTitle.textContent = `Upgrade: ${card.name}`;
            this.cardSelectionGrid.innerHTML = ''; // Clear grid
            const cardElement = this.createCardElement(card);
            if(cardElement) { cardElement.style.cursor = 'default'; this.cardSelectionGrid.appendChild(cardElement); }
            else { this.cardSelectionGrid.innerHTML = '<p>Error displaying card.</p>'; }

            const existingOptions = this.cardSelectionModal.querySelector('.upgrade-options'); if (existingOptions) existingOptions.remove();
            const upgradeOptionsDiv = document.createElement('div'); upgradeOptionsDiv.className = 'upgrade-options'; upgradeOptionsDiv.style.textAlign = 'center'; upgradeOptionsDiv.style.marginTop = '20px'; upgradeOptionsDiv.style.display = 'flex'; upgradeOptionsDiv.style.gap = '15px'; upgradeOptionsDiv.style.justifyContent = 'center';
            const refineButton = document.createElement('button'); refineButton.textContent = "Refine"; refineButton.classList.add('button-confirm'); const refinePreviewText = card.getUpgradePreviewHtml ? card.getUpgradePreviewHtml('refine') : "Hone existing strengths."; refineButton.title = refinePreviewText; refineButton.onmouseover = (e) => this.showTooltip(refinePreviewText, e.clientX, e.clientY); refineButton.onmouseout = () => this.hideTooltip(); refineButton.onmousemove = (e) => this.updateTooltipPosition(e.clientX, e.clientY); refineButton.onclick = () => { this.hideCardSelectionModal(true); if (onUpgradeChoiceCallback) onUpgradeChoiceCallback(card, 'refine'); }; upgradeOptionsDiv.appendChild(refineButton);
            const transmuteButton = document.createElement('button'); transmuteButton.textContent = "Transmute"; transmuteButton.classList.add('button-secondary'); const transmutePreviewText = card.getUpgradePreviewHtml ? card.getUpgradePreviewHtml('transmute') : "Shift its core essence."; transmuteButton.title = transmutePreviewText; transmuteButton.onmouseover = (e) => this.showTooltip(transmutePreviewText, e.clientX, e.clientY); transmuteButton.onmouseout = () => this.hideTooltip(); transmuteButton.onmousemove = (e) => this.updateTooltipPosition(e.clientX, e.clientY); transmuteButton.onclick = () => { this.hideCardSelectionModal(true); if (onUpgradeChoiceCallback) onUpgradeChoiceCallback(card, 'transmute'); }; upgradeOptionsDiv.appendChild(transmuteButton);
            const modalContent = this.cardSelectionModal.querySelector('.modal-content'); const cancelButton = modalContent?.querySelector('#cardSelectionCancel'); if (modalContent && cancelButton) { modalContent.insertBefore(upgradeOptionsDiv, cancelButton); } else if (modalContent) { modalContent.appendChild(upgradeOptionsDiv); }
            if(this.cardSelectionCancelButton) { this.cardSelectionCancelButton.textContent = "Cancel Upgrade"; this.cardSelectionCancelButton.onclick = () => { this.hideCardSelectionModal(true); if (onUpgradeChoiceCallback) onUpgradeChoiceCallback(null, null); }; this.cardSelectionCancelButton.style.display = 'block'; }
            this.cardSelectionModal.style.display = 'block';
        };

        // If multiple cards, show selection first. If only one, show options directly.
        if (cardsToDisplay.length === 1) {
             showOptionsForCard(cardsToDisplay[0]);
        } else {
            // Use standard selection modal, but the callback will then call showOptionsForCard
             this.showCardSelectionModal(cardsToDisplay, (selectedCard) => {
                 if (selectedCard) {
                      showOptionsForCard(selectedCard); // Show upgrade options for the selected card
                 } else {
                     // Selection was cancelled
                     if (onUpgradeChoiceCallback) onUpgradeChoiceCallback(null, null); // Signal cancellation
                 }
             }, "Select Concept to Upgrade");
        }
     }

    // --- NEW: Deck Portrait Methods ---
    renderDeckPortrait(deckManager) { if (!this.deckChartCanvas || !deckManager || typeof deckManager.getMasterDeck !== 'function') { return; } const masterDeck = deckManager.getMasterDeck(); const elementCounts = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0, RF: 0 }; masterDeck.forEach(card => { if (card && card.primaryElement && elementCounts.hasOwnProperty(card.primaryElement)) { elementCounts[card.primaryElement]++; } }); const totalCards = masterDeck.length; const ctx = this.deckChartCanvas.getContext('2d'); const { width, height } = this.deckChartCanvas; const centerX = width / 2; const centerY = height / 2; ctx.clearRect(0, 0, width, height); if (totalCards === 0) { ctx.textAlign = 'center'; ctx.fillStyle = '#7f8c8d'; ctx.font = '10px sans-serif'; ctx.fillText("Empty Deck", centerX, centerY); return; } const radius = Math.min(centerX, centerY) * 0.9; let currentAngle = -0.5 * Math.PI; const elementOrder = ['A', 'I', 'S', 'P', 'C', 'R', 'RF']; const elementColors = { A: '#F39C12', I: '#3498DB', S: '#E74C3C', P: '#9B59B6', C: '#F1C40F', R: '#2ECC71', RF: '#95A5A6' }; elementOrder.forEach(key => { const count = elementCounts[key]; if (count === 0) return; const sliceAngle = (count / totalCards) * 2 * Math.PI; const endAngle = currentAngle + sliceAngle; ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.arc(centerX, centerY, radius, currentAngle, endAngle); ctx.closePath(); ctx.fillStyle = elementColors[key] || '#7f8c8d'; ctx.fill(); currentAngle = endAngle; }); this.deckChartCanvas.onclick = (event) => { const rect = this.deckChartCanvas.getBoundingClientRect(); const x = event.clientX - rect.left - centerX; const y = event.clientY - rect.top - centerY; let angle = Math.atan2(y, x); if (angle < -Math.PI / 2) angle += 2 * Math.PI; let checkAngle = -0.5 * Math.PI; let clickedElement = null; for(const key of elementOrder) { const count = elementCounts[key]; if (count === 0) continue; const sliceAngle = (count / totalCards) * 2 * Math.PI; const endAngle = checkAngle + sliceAngle; if (angle >= checkAngle && angle < endAngle) { clickedElement = key; break; } checkAngle = endAngle; } if (clickedElement) { console.log(`Deck chart clicked. Element: ${clickedElement}`); this.showCardListForElement(clickedElement, deckManager); } else { console.log("Deck chart clicked (missed segment)."); } }; this.deckChartCanvas.style.cursor = 'pointer'; }
    showCardListForElement(elementKey, deckManager) { if (!elementKey || !deckManager || !this.gameState || !this.gameState.player) { console.error("Cannot show card list: Missing data."); return; } const cardsOfElement = deckManager.getMasterDeck().filter(card => card?.primaryElement === elementKey); const title = `Concepts (${Data.elementKeyToFullName[elementKey] || elementKey})`; if (!this.cardSelectionModal || !this.cardSelectionGrid || !this.cardSelectionTitle) { console.error("Card Selection Modal elements not found."); return; } this._currentCardSelectionCallback = null; this.cardSelectionTitle.textContent = title; this.cardSelectionGrid.innerHTML = ''; if (cardsOfElement.length === 0) { this.cardSelectionGrid.innerHTML = '<p>None found in deck.</p>'; } else { cardsOfElement.sort((a,b) => (a.cost ?? 99) - (b.cost ?? 99) || a.name.localeCompare(b.name)); cardsOfElement.forEach(card => { const cardElement = this.createCardElement(card); if (cardElement) { cardElement.style.cursor = 'default'; this.cardSelectionGrid.appendChild(cardElement); } }); } const modalContent = this.cardSelectionModal.querySelector('.modal-content'); const existingHints = modalContent?.querySelector('.synergy-hints'); if(existingHints) existingHints.remove(); const synergyDiv = document.createElement('div'); synergyDiv.className = 'synergy-hints'; synergyDiv.style.marginTop = '15px'; synergyDiv.style.paddingTop = '10px'; synergyDiv.style.borderTop = '1px dashed #566573'; synergyDiv.style.textAlign = 'left'; synergyDiv.style.fontSize = '0.9em'; synergyDiv.innerHTML = `<h4>Synergy Hints:</h4><p>${this.generateSynergyHint(elementKey, cardsOfElement)}</p>`; const cancelButton = modalContent?.querySelector('#cardSelectionCancel'); if (modalContent && cancelButton) { modalContent.insertBefore(synergyDiv, cancelButton); } else if (modalContent) { modalContent.appendChild(synergyDiv); } if (this.cardSelectionCancelButton) { this.cardSelectionCancelButton.textContent = "Close"; this.cardSelectionCancelButton.onclick = () => this.hideCardSelectionModal(true); this.cardSelectionCancelButton.style.display = 'block'; } this.cardSelectionModal.style.display = 'block'; }
    generateSynergyHint(elementKey, cards) { let hints = []; const attackCount = cards.filter(c => c?.cardType === 'Attack').length; const blockCards = cards.filter(c => c?.keywords.includes('Block')); const drawCount = cards.filter(c => c?.keywords.includes('Draw')).length; const debuffCards = cards.filter(c => c?.keywords.includes('Debuff') || c?.keywords.includes('Weak') || c?.keywords.includes('Vulnerable') || c?.keywords.includes('Frail')); const focusCount = cards.filter(c => c?.keywords.includes('Focus') || c?.keywords.includes('GainFocus')).length; const exhaustCount = cards.filter(c => c?.keywords.includes('Exhaust')).length; if (attackCount >= 3) hints.push("Strong attack presence."); if (blockCards.length >= 3) hints.push("Solid defensive core."); if (drawCount >= 2) hints.push("Good card flow potential."); if (debuffCards.length >= 2) hints.push("Applies multiple debuffs."); if (focusCount >= 1 && drawCount >=1) hints.push("Synergy between Focus gain and Card Draw."); if (exhaustCount >= 2) hints.push("Utilizes powerful, single-use Exhaust effects."); if (cards.length > 5 && hints.length === 0) hints.push("Diverse set of effects."); switch(elementKey) { case 'I': if(attackCount > 0 && debuffCards.length > 0) hints.push("Combines direct interaction with weakening effects."); break; case 'P': if(blockCards.length > 0 && cards.some(c => c.keywords.includes('Heal'))) hints.push("Focuses on psychological resilience (Block/Heal)."); break; case 'C': if(drawCount > 0 && focusCount > 0) hints.push("Strong cognitive engine (Draw/Focus)."); break; } return hints.length > 0 ? `• ${hints.join('<br>• ')}` : "This element provides a unique foundation. Explore combinations!"; }


} // End of UIManager class

// Add CORE_TRAIT_THRESHOLD constant needed by updateAttunementMeter
const CORE_TRAIT_THRESHOLD = 10;
