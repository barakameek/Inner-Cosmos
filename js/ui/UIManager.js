// js/ui/UIManager.js

// Import classes needed for rendering data or type checking
import { Card } from '../core/Card.js';
import { Artifact } from '../core/Artifact.js';
import { MetaProgression } from '../meta/MetaProgression.js'; // Needed for renderMetaScreen
import * as Data from '../../data.js'; // Needed for meta screen counts, node icons etc. Correct path.
import { ARTIFACT_TEMPLATES } from '../core/ArtifactDefinitions.js'; // Needed for meta screen count. Correct path.

// Import Child UI Managers
import { CombatUI } from './CombatUI.js'; // Correct path
// Placeholder for future MapUI class
// import { MapUI } from './MapUI.js';

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
         // Map Screen
         this.mapArea = document.getElementById('mapArea');
         this.playerInfoMap = document.getElementById('playerInfoMap');
         // Combat Screen (Main containers, specific stats handled by CombatUI)
         this.enemyArea = document.getElementById('enemyArea');
         this.playerArea = document.getElementById('playerArea');
         this.handArea = document.getElementById('handArea');
         this.deckInfoArea = document.getElementById('deckInfo'); // Container for counts
         this.deckCountElement = document.getElementById('deckCountElement');
         this.discardCountElement = document.getElementById('discardCountElement');
         this.exhaustCountElement = document.getElementById('exhaustCountElement'); // Add if tracking
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
        this.draggedCard = null; // Stores the Card instance being dragged
        this.draggedCardElement = null; // Stores the DOM element being dragged
        this._currentCardSelectionCallback = null; // Stores callback for card selection modal

        // --- Initialization ---
        this._ensureFeedbackAreasExist();
        this._setupCommonListeners();
        this._setupNodeActionListeners(); // Setup shop/rest/etc button listeners

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
         // Verify core screens were found
         const coreScreens = ['mainMenuScreen', 'mapScreen', 'combatScreen']; // Add others as needed
         coreScreens.forEach(id => {
            if (!this.screens[id]) console.error(`UIManager FATAL: Core screen #${id} not found! Check index.html.`);
         })
        // console.log("UIManager: Found screens:", Object.keys(this.screens)); // Less noisy log
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
         // Apply styles directly - could also add a class and define in CSS
         Object.assign(area.style, {
             position: 'absolute',
             zIndex: '150', // Above most screens but below modals
             pointerEvents: 'none', // Allow clicks through
             display: 'flex',
             flexDirection: 'column',
             gap: '5px', // Space between messages
             padding: '10px', // Padding around the area
             maxWidth: '350px', // Limit width
             width: '90%' // Responsive width
         });
         // Positioning
         if (vAlign === 'top') area.style.top = '15px'; else area.style.bottom = '15px';
         if (hAlign === 'center') { area.style.left = '50%'; area.style.transform = 'translateX(-50%)'; area.style.alignItems = 'center'; }
         else if (hAlign === 'left') { area.style.left = '15px'; area.style.alignItems = 'flex-start'; }
         else { area.style.right = '15px'; area.style.alignItems = 'flex-end'; } // Default right

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
            // Close card selection modal
            if (this.cardSelectionModal && event.target == this.cardSelectionModal && this.cardSelectionModal.style.display === 'block') {
                 this.hideCardSelectionModal(true); // Cancel if clicked outside
            }
        });

         // Card Selection Modal Cancel Button
         if (this.cardSelectionCancelButton) {
             this.cardSelectionCancelButton.onclick = () => this.hideCardSelectionModal(true); // Explicit cancel
         } else { console.warn("Card Selection Cancel button not found."); }
    }

    /** Sets up listeners for buttons on specific node screens (Shop, Rest). */
     _setupNodeActionListeners() {
         // Shop (Buy buttons added dynamically, Leave button is static)
         if (this.leaveShopButton) {
              this.leaveShopButton.onclick = () => {
                    if (!this.gameState) { console.error("Cannot leave shop: GameState missing."); return; }
                    this.gameState.leaveShop();
              };
         } else { console.warn("Leave Shop button not found."); }

         // Rest Site
         if (this.restHealButton) {
             this.restHealButton.onclick = () => this.gameState?.handleRestSiteAction('heal');
         } else { console.warn("Rest Heal button not found."); }
         if (this.restMeditateButton) {
             this.restMeditateButton.onclick = () => this.gameState?.handleRestSiteAction('upgrade');
         } else { console.warn("Rest Meditate button not found."); }
         if (this.restJournalButton) {
             this.restJournalButton.onclick = () => this.gameState?.handleRestSiteAction('remove');
         } else { console.warn("Rest Journal button not found."); }
         if (this.leaveRestSiteButton) {
             this.leaveRestSiteButton.onclick = () => this.gameState?.leaveRestSite();
         } else { console.warn("Leave Rest Site button not found."); }
     }

    /** Shows a specific screen and hides the current one with fade effect. */
    showScreen(screenId) {
        if (this.currentScreen && this.currentScreen.id === screenId) {
             console.log(`Screen ${screenId} is already active.`); return; // Already showing
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
            // Re-render map if returning to it
            if (screenId === 'mapScreen') this.gameState?.mapManager?.renderMap();
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
    }

    /** Updates deck/discard counts (can be called from anywhere) */
    updateDeckDiscardCounts(deckManager) {
        if (!deckManager || !this.combatUI) return; // Requires CombatUI reference
        this.combatUI.updateDeckDiscardCounts(deckManager);
    }

    // --- MAP Rendering (TODO: Move to MapUI) ---
    /** Renders the map nodes and connections. */
    renderMap(nodes, currentNodeId, connections) {
        const mapContainer = this.mapArea;
        if (!mapContainer) { console.error("UIManager Error: Map area element not found."); return; }
        if (!this.gameState || !this.gameState.mapManager) { console.warn("UIManager Warning: GameState or MapManager missing for map render."); return; }
        if (!nodes || Object.keys(nodes).length === 0) { mapContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Map Error: No nodes found.</p>'; return; }

        // console.log("UIManager: Rendering Map..."); // Noisy
        mapContainer.innerHTML = ''; // Clear previous map content
        const svgNS = "http://www.w3.org/2000/svg";
        const mapSvg = document.createElementNS(svgNS, "svg");
        mapSvg.setAttribute('width', '100%');
        mapSvg.setAttribute('height', '100%');
        mapSvg.style.backgroundColor = '#2c3e50'; // Match theme

        // Define marker for arrowheads (optional)
        const defs = document.createElementNS(svgNS, 'defs');
        const marker = document.createElementNS(svgNS, 'marker');
        marker.setAttribute('id', 'arrowhead'); marker.setAttribute('markerWidth', '10'); marker.setAttribute('markerHeight', '7'); marker.setAttribute('refX', '0'); marker.setAttribute('refY', '3.5'); marker.setAttribute('orient', 'auto');
        const polygon = document.createElementNS(svgNS, 'polygon'); polygon.setAttribute('points', '0 0, 10 3.5, 0 7'); polygon.setAttribute('fill', '#6c7a89'); // Arrow color
        marker.appendChild(polygon); defs.appendChild(marker); mapSvg.appendChild(defs);


        // --- Render Connections ---
        connections?.forEach(conn => {
            const fromNode = nodes[conn.from];
            const toNode = nodes[conn.to];
            if (fromNode && toNode) {
                const line = document.createElementNS(svgNS, "line");
                line.setAttribute('x1', fromNode.position.x);
                line.setAttribute('y1', fromNode.position.y);
                line.setAttribute('x2', toNode.position.x);
                line.setAttribute('y2', toNode.position.y);
                // Dim visited lines, slightly thicker
                line.setAttribute('stroke', fromNode.visited ? '#566573' : '#6c7a89');
                line.setAttribute('stroke-width', '3');
                // line.setAttribute('marker-end', 'url(#arrowhead)'); // Add arrowheads (optional)
                mapSvg.appendChild(line);
            }
        });

        // --- Render Nodes ---
        Object.values(nodes).forEach(node => {
             const isCurrent = node.id === currentNodeId;
             const isAvailable = nodes[currentNodeId]?.connections.includes(node.id);

             const nodeGroup = document.createElementNS(svgNS, "g");
             nodeGroup.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);
             nodeGroup.dataset.nodeId = node.id; // Store ID for clicks/tooltips

             const circle = document.createElementNS(svgNS, "circle");
             circle.setAttribute('r', '20'); // Slightly larger radius
             circle.setAttribute('fill', this.getNodeColor(node.type));
             circle.setAttribute('stroke', isCurrent ? '#f1c40f' : (node.visited ? '#555' : '#ecf0f1'));
             circle.setAttribute('stroke-width', isCurrent ? '4' : '2');

             const iconText = document.createElementNS(svgNS, "text");
             iconText.setAttribute('font-family', '"Font Awesome 6 Free"'); // Use correct font family
             iconText.style.fontWeight = 900; // Font Awesome solid style weight
             iconText.setAttribute('font-size', '20px'); // Match radius roughly
             iconText.setAttribute('fill', node.visited && !isCurrent ? '#999' : '#fff'); // Dim icon if visited
             iconText.setAttribute('text-anchor', 'middle');
             iconText.setAttribute('dominant-baseline', 'central'); // Center icon vertically/horizontally
             iconText.textContent = this.getNodeIcon(node.type); // Get icon character

             nodeGroup.appendChild(circle);
             nodeGroup.appendChild(iconText);

             // Interactivity and Styling
             if (isAvailable && !isCurrent) {
                 nodeGroup.style.cursor = 'pointer';
                 nodeGroup.classList.add('map-node-available'); // For potential CSS hover effects
                 nodeGroup.addEventListener('click', () => this.gameState?.mapManager?.moveToNode(node.id));
                 // Add hover visual feedback
                 nodeGroup.addEventListener('mouseenter', () => { circle.setAttribute('stroke', '#fff'); circle.setAttribute('stroke-width', '3'); });
                 nodeGroup.addEventListener('mouseleave', () => { circle.setAttribute('stroke', '#ecf0f1'); circle.setAttribute('stroke-width', '2'); });
             } else {
                 nodeGroup.style.cursor = 'default';
                 // Dim future, unavailable nodes significantly
                 if (!isCurrent && !node.visited && !isAvailable) {
                     nodeGroup.style.opacity = 0.4;
                 } else {
                      nodeGroup.style.opacity = node.visited && !isCurrent ? 0.6 : 1.0; // Slightly dim visited
                 }
             }

             // Tooltips (using title attribute for simplicity, enhance if needed)
             let tooltipText = `${node.type.toUpperCase()}`;
             if (node.data?.eventId) tooltipText += ` (${Data.reflectionPrompts[node.data.eventId]?.name || Data.elementalDilemmas.find(d => d.id === node.data.eventId)?.situation?.substring(0,20)+'...' || node.data.eventId})`;
             if (isCurrent) tooltipText += " (Current)";
             else if (node.visited) tooltipText += " (Visited)";
             else if (!isAvailable) tooltipText += " (Unavailable)";
             const titleElement = document.createElementNS(svgNS, "title");
             titleElement.textContent = tooltipText;
             nodeGroup.appendChild(titleElement); // SVG standard for tooltips

             // Store DOM element reference on the node object (optional, but can be useful)
             node.element = nodeGroup;
             mapSvg.appendChild(nodeGroup);
        });
        mapContainer.appendChild(mapSvg);
    }


    /** Updates player info display on the map screen */
     updatePlayerMapInfo(player, floor) {
        const infoEl = this.playerInfoMap;
        if (!infoEl) { console.warn("Player info map element not found."); return; }
        if (!player || !player.deckManager) { infoEl.innerHTML = "Loading player info..."; return; };

         infoEl.innerHTML = `
             <span>Floor: ${floor || '?'}</span><span class="info-divider">|</span>
             <span>Integrity: ${player.currentIntegrity} / ${player.maxIntegrity}</span><span class="info-divider">|</span>
             <span>Insight (Run): ${player.insightThisRun} <i class='fas fa-brain insight-icon'></i></span><span class="info-divider">|</span>
             <span>Deck: ${player.deckManager.getMasterDeck().length}</span>
             `;
             // Add Artifact icons display?
             // <span class="info-divider">|</span>
             // <span>Relics: ${player.artifacts.map(a => `<i class="..." title="${a.name}"></i>`).join('')}</span>
     }

    // --- Methods specific to UIManager (Feedback, Modals, Global state) ---

    /** Creates a card DOM element (used by CombatUI, RewardScreen etc.) */
    createCardElement(card) {
        if (!card || card.conceptId === -1) {
             console.warn("Attempted to create card element for invalid card:", card);
             // Return a placeholder or null?
             const errorDiv = document.createElement('div');
             errorDiv.className = 'card error-card';
             errorDiv.textContent = 'Error';
             return errorDiv;
        }
        const cardDiv = document.createElement('div');
        cardDiv.className = `card rarity-${card.rarity} type-${card.cardType.toLowerCase().split('/')[0]}`; // Add classes for styling
        cardDiv.dataset.cardId = card.id;
        cardDiv.dataset.conceptId = card.conceptId;

        const cost = document.createElement('div');
        cost.className = 'card-cost';
        cost.textContent = card.cost === null ? 'X' : card.cost; // Display 'X' for unplayable

        const name = document.createElement('div');
        name.className = 'card-name';
        name.textContent = card.name; // Assumes name includes '+' if upgraded

        const description = document.createElement('div');
        description.className = 'card-description';
        description.innerHTML = card.getEffectDescriptionHtml(); // Use HTML for potential icons

        const type = document.createElement('div');
        type.className = 'card-type';
        type.textContent = card.cardType;

        cardDiv.appendChild(cost);
        cardDiv.appendChild(name);
        cardDiv.appendChild(description);
        cardDiv.appendChild(type);

        // Add tooltip listener using *this* UIManager instance
        cardDiv.addEventListener('mouseover', (event) => this.showTooltip(card.getTooltipHtml(), event.clientX, event.clientY));
        cardDiv.addEventListener('mouseout', () => this.hideTooltip());
        cardDiv.addEventListener('mousemove', (event) => this.updateTooltipPosition(event.clientX, event.clientY));

        return cardDiv;
    }

    /** Shows a persistent notification message. */
    showNotification(message, duration = 3500) { // Slightly longer duration
        if (!this.notificationArea) { console.log("Notify:", message); return; }
        const el = document.createElement('div');
        el.className = 'notification-message'; // Use class for styling
        el.innerHTML = message; // Allow HTML in message for icons etc.
        this.notificationArea.appendChild(el);
        // Fade out and remove
        setTimeout(() => {
             el.style.opacity = '0';
             setTimeout(() => el.remove(), 500); // Remove from DOM after fade
        }, duration);
    }

    /** Shows temporary action feedback (e.g., "Not enough Focus!"). */
    showActionFeedback(message, type = 'info', duration = 1800) { // Slightly longer duration
        if (!this.actionFeedbackArea) { console.log(`Feedback (${type}):`, message); return; }
        const el = document.createElement('div');
        el.className = `action-feedback feedback-${type}`; // Use classes for styling
        el.textContent = message;
        // Prepend so newest message is at the top
        this.actionFeedbackArea.prepend(el);
        // Limit number of messages displayed
        if (this.actionFeedbackArea.children.length > 4) {
            this.actionFeedbackArea.lastChild?.remove(); // Safely remove oldest
        }
        // Fade out and remove
        setTimeout(() => {
             el.style.opacity = '0';
             el.style.transform = 'translateY(-15px)'; // Move up slightly on fade
             setTimeout(() => el.remove(), 500); // Remove from DOM after fade
        }, duration);
    }

    /** Clears all enemy highlights and targeting styles. */
    clearEnemyHighlights() {
        // Delegate to CombatUI if it exists
        this.combatUI?.clearEnemyHighlights();
    }

    /** Highlights or removes highlight from an enemy (called by CombatUI). */
    highlightEnemy(enemyInstanceId, highlighted = true) {
        // Delegate to CombatUI
        this.combatUI?.highlightEnemy(enemyInstanceId, highlighted);
    }

    // --- Tooltip Methods ---
    showTooltip(content, x, y) {
         if (!this.tooltipElement) return;
         this.tooltipElement.innerHTML = content; // Allow HTML content
         this.tooltipElement.style.display = 'block';
         this.updateTooltipPosition(x, y); // Position immediately
    }
    hideTooltip() {
         if (!this.tooltipElement) return;
         this.tooltipElement.style.display = 'none';
    }
    updateTooltipPosition(x, y) {
         if (!this.tooltipElement || this.tooltipElement.style.display === 'none') return;
         const offsetX = 15; const offsetY = 10; // Adjust offset as needed
         const tooltipRect = this.tooltipElement.getBoundingClientRect();
         // Use game container bounds for positioning relative to game area
         const containerRect = this.gameContainer.getBoundingClientRect();

         let top = y + offsetY;
         let left = x + offsetX;

         // Keep within game container viewport (adjust based on containerRect)
         if (left + tooltipRect.width > containerRect.right - 10) {
             left = x - tooltipRect.width - offsetX; // Flip to left
         }
          if (top + tooltipRect.height > containerRect.bottom - 10) {
             top = y - tooltipRect.height - offsetY; // Flip to top
         }
          if (left < containerRect.left + 10) left = containerRect.left + 10; // Prevent going off left
          if (top < containerRect.top + 10) top = containerRect.top + 10; // Prevent going off top

         // Convert window coordinates to be relative to the game container's position if needed
         // Or ensure tooltip is positioned absolutely within the window itself
         this.tooltipElement.style.left = `${left}px`;
         this.tooltipElement.style.top = `${top}px`;
    }

    // --- Modal Methods ---
    showModal(text, choices = []) {
         if (!this.modalPopup || !this.modalText || !this.modalChoices) {
             console.error("Cannot show modal, elements missing.");
             // Fallback alert?
             alert(text.replace(/<[^>]*>?/gm, '')); // Strip HTML for alert
             return;
         }
         this.modalText.innerHTML = text; // Allow HTML content
         this.modalChoices.innerHTML = ''; // Clear previous choices

         if (choices.length === 0) {
             // Add a default "OK" button if no choices provided
             const okBtn = document.createElement('button');
             okBtn.textContent = 'OK';
             okBtn.onclick = () => this.hideModal();
             this.modalChoices.appendChild(okBtn);
         } else {
             choices.forEach(choice => {
                 const btn = document.createElement('button');
                 btn.textContent = choice.text;
                 btn.onclick = () => {
                     this.hideModal(); // Hide modal first
                     if (choice.callback && typeof choice.callback === 'function') {
                         choice.callback(); // Execute callback after hiding
                     }
                 };
                  if (choice.disabled) btn.disabled = true; // Add disabled state
                 this.modalChoices.appendChild(btn);
             });
         }
         this.modalPopup.style.display = 'block';
    }

    hideModal() {
         if (!this.modalPopup) return;
         this.modalPopup.style.display = 'none';
         this.modalText.innerHTML = ''; // Clear content
         this.modalChoices.innerHTML = ''; // Clear choices
    }

    // --- Card Selection Modal ---
    /** Shows a modal for selecting one card from a list. */
    showCardSelectionModal(cardsToShow, onSelectCallback, title = "Select a Card") {
        if (!this.cardSelectionModal || !this.cardSelectionGrid || !this.cardSelectionTitle || !this.gameState) {
             console.error("Cannot show card selection modal: Elements missing or GameState unavailable.");
             if (onSelectCallback) onSelectCallback(null); // Callback with null if cannot show
             return;
        }

        this._currentCardSelectionCallback = onSelectCallback; // Store callback
        this.cardSelectionTitle.textContent = title;
        this.cardSelectionGrid.innerHTML = ''; // Clear previous grid

        if (!Array.isArray(cardsToShow) || cardsToShow.length === 0) {
            this.cardSelectionGrid.innerHTML = '<p>No options available.</p>';
        } else {
            cardsToShow.forEach(card => {
                const cardElement = this.createCardElement(card);
                if (cardElement) {
                     cardElement.style.cursor = 'pointer'; // Indicate clickable
                     cardElement.onclick = () => this.hideCardSelectionModal(false, card); // Pass selected card
                     this.cardSelectionGrid.appendChild(cardElement);
                }
            });
        }
        this.cardSelectionModal.style.display = 'block';
    }

    /** Hides the card selection modal and triggers the callback. */
    hideCardSelectionModal(cancelled = true, selectedCard = null) {
        if (!this.cardSelectionModal) return;
        this.cardSelectionModal.style.display = 'none';

        // Execute the stored callback
        if (this._currentCardSelectionCallback && typeof this._currentCardSelectionCallback === 'function') {
            try {
                this._currentCardSelectionCallback(cancelled ? null : selectedCard);
            } catch (error) {
                 console.error("Error executing card selection callback:", error);
            }
        }
        this._currentCardSelectionCallback = null; // Clear callback reference
    }

    // --- Node Screen Rendering (Reward, Shop, Rest) ---

    /** Displays the reward screen after combat. */
    showRewardScreen(rewards) {
        if (!this.rewardScreen || !this.gameState || !this.gameState.player || !rewards) {
             console.error("Cannot show reward screen: Missing elements, game state, player, or rewards data.");
             if (rewards?.onComplete) rewards.onComplete(); // Ensure callback is called even on error
             return;
        }

        // Display Insight Reward
        if (this.rewardInsightText) {
            this.rewardInsightText.innerHTML = `Insight Gained: ${rewards.insight || 0} <i class='fas fa-brain insight-icon'></i>`;
        }

        let cardChoiceMade = false;
        let artifactChoiceMade = false;
        let choicesAvailable = false;

        // --- Render Card Choices ---
        if (this.rewardCardsArea) {
            this.rewardCardsArea.innerHTML = '<h3>Choose a Concept:</h3>'; // Reset area
            if (rewards.cardChoices?.length > 0) {
                 choicesAvailable = true;
                 rewards.cardChoices.forEach(cardId => {
                     try {
                         const card = new Card(cardId);
                         if (card.conceptId !== -1) {
                             const el = this.createCardElement(card);
                             el.classList.add('clickable-reward');
                             el.onclick = () => {
                                 if (cardChoiceMade) return; // Prevent choosing multiple cards
                                 cardChoiceMade = true;
                                 this.gameState.player.addCardToDeck(cardId); // Add selected card
                                 this.rewardCardsArea.innerHTML = `<p class="reward-chosen">Acquired: ${card.name}</p>`;
                                 // Disable artifact choices once a card is taken? Or allow both? Allow both for now.
                                 // this.rewardArtifactsArea.innerHTML = ''; // Clear artifact choices
                                 if(this.rewardSkipButton) this.rewardSkipButton.textContent = 'Continue';
                             };
                             this.rewardCardsArea.appendChild(el);
                         }
                     } catch (error) { console.error(`Error creating reward card element for ID ${cardId}:`, error); }
                 });
            } else {
                this.rewardCardsArea.innerHTML += '<p>None found.</p>';
            }
        }

        // --- Render Artifact Choices ---
        if (this.rewardArtifactsArea) {
             this.rewardArtifactsArea.innerHTML = '<h3>Choose a Relic:</h3>'; // Reset area
             if (rewards.artifactChoices?.length > 0) {
                  choicesAvailable = true;
                  rewards.artifactChoices.forEach(artifactId => {
                      try {
                          const artifact = new Artifact(artifactId);
                          if (artifact.id !== 'error_artifact') {
                              const el = document.createElement('div');
                              el.innerHTML = artifact.getDisplayHtml(); // Use artifact's display method
                              el.classList.add('artifact-display', 'clickable-reward'); // Add class for potential styling
                               // Add tooltip listener
                              el.addEventListener('mouseover', (event) => this.showTooltip(artifact.getTooltipHtml(), event.clientX, event.clientY));
                              el.addEventListener('mouseout', () => this.hideTooltip());
                              el.addEventListener('mousemove', (event) => this.updateTooltipPosition(event.clientX, event.clientY));
                              el.onclick = () => {
                                  if (artifactChoiceMade) return; // Prevent choosing multiple artifacts
                                  artifactChoiceMade = true;
                                  this.gameState.player.addArtifact(artifactId); // Add selected artifact
                                  this.rewardArtifactsArea.innerHTML = `<p class="reward-chosen">Acquired: ${artifact.name}</p>`;
                                  // Disable card choices once artifact is taken?
                                  // this.rewardCardsArea.innerHTML = ''; // Clear card choices
                                  if(this.rewardSkipButton) this.rewardSkipButton.textContent = 'Continue';
                              };
                              this.rewardArtifactsArea.appendChild(el);
                          }
                      } catch(error) { console.error(`Error creating reward artifact element for ID ${artifactId}:`, error); }
                  });
             } else {
                 this.rewardArtifactsArea.innerHTML += '<p>None found.</p>';
             }
        }

        // --- Skip/Continue Button ---
        if (this.rewardSkipButton) {
            this.rewardSkipButton.textContent = choicesAvailable ? 'Skip Choices / Continue' : 'Continue';
            // Ensure the callback is attached correctly
            this.rewardSkipButton.onclick = rewards.onComplete; // Execute the completion callback
        } else { console.error("Reward Skip/Continue button not found!"); if (rewards.onComplete) rewards.onComplete(); } // Call complete anyway

        this.showScreen('rewardScreen');
    }

    /** Renders the shop interface. */
    renderShop(shopInventory, playerInsight) {
         if (!this.shopScreen || !this.gameState?.player || !shopInventory) {
             console.error("Cannot render shop: Missing elements, player, or inventory data.");
             return;
         }
         // Display Insight
         if(this.shopInsightDisplay) this.shopInsightDisplay.innerHTML = `Insight: ${playerInsight} <i class='fas fa-brain insight-icon'></i>`;

         // --- Render Cards for Sale ---
         if(this.shopCards) {
             this.shopCards.innerHTML = '<h3>Concepts:</h3>'; // Clear previous
             if (!shopInventory.cards || shopInventory.cards.length === 0) { this.shopCards.innerHTML += "<p>Sold out!</p>"; }
             else {
                 shopInventory.cards.forEach((item) => {
                      try {
                         const card = new Card(item.cardId);
                         if (card.conceptId === -1) throw new Error("Invalid card ID");

                         const shopItemDiv = document.createElement('div');
                         shopItemDiv.className = 'shop-item card-item'; // Class for layout
                         shopItemDiv.appendChild(this.createCardElement(card)); // Render card

                         const priceButton = document.createElement('button');
                         priceButton.textContent = `Buy (${item.cost} Insight)`;
                         priceButton.disabled = item.purchased || playerInsight < item.cost;
                         priceButton.title = item.purchased ? "Already purchased" : (playerInsight < item.cost ? "Not enough Insight" : `Purchase ${card.name}`);

                         if(!item.purchased) {
                              priceButton.onclick = () => this.gameState.handleShopPurchase('card', item.cardId);
                         } else {
                              priceButton.textContent = "Purchased";
                         }
                         shopItemDiv.appendChild(priceButton);
                         this.shopCards.appendChild(shopItemDiv);
                      } catch(error) { console.error(`Error rendering shop card ${item.cardId}:`, error); }
                 });
             }
         }

         // --- Render Artifacts for Sale ---
         if(this.shopArtifacts){
             this.shopArtifacts.innerHTML = '<h3>Relics:</h3>'; // Clear previous
             if (!shopInventory.artifacts || shopInventory.artifacts.length === 0) { this.shopArtifacts.innerHTML += "<p>Sold out!</p>"; }
             else {
                  shopInventory.artifacts.forEach((item) => {
                      try {
                         const artifact = new Artifact(item.artifactId);
                         if (artifact.id === 'error_artifact') throw new Error("Invalid artifact ID");

                         const shopItemDiv = document.createElement('div');
                         shopItemDiv.className = 'shop-item artifact-item'; // Class for layout

                         const artifactEl = document.createElement('div');
                         artifactEl.innerHTML = artifact.getDisplayHtml(); // Use artifact's display method
                         // Add tooltip listener
                         artifactEl.addEventListener('mouseover', (event) => this.showTooltip(artifact.getTooltipHtml(), event.clientX, event.clientY));
                         artifactEl.addEventListener('mouseout', () => this.hideTooltip());
                         artifactEl.addEventListener('mousemove', (event) => this.updateTooltipPosition(event.clientX, event.clientY));
                         shopItemDiv.appendChild(artifactEl);

                         const priceButton = document.createElement('button');
                         priceButton.textContent = `Buy (${item.cost} Insight)`;
                         priceButton.disabled = item.purchased || playerInsight < item.cost;
                         priceButton.title = item.purchased ? "Already purchased" : (playerInsight < item.cost ? "Not enough Insight" : `Purchase ${artifact.name}`);

                         if (!item.purchased) {
                              priceButton.onclick = () => this.gameState.handleShopPurchase('artifact', item.artifactId);
                         } else {
                             priceButton.textContent = "Purchased";
                         }
                         shopItemDiv.appendChild(priceButton);
                         this.shopArtifacts.appendChild(shopItemDiv);
                       } catch(error) { console.error(`Error rendering shop artifact ${item.artifactId}:`, error); }
                  });
             }
         }

         // --- Render Removal Service ---
         if(this.shopRemoveService){
              this.shopRemoveService.innerHTML = '<h3>Refinement:</h3>'; // Clear previous
              const removeButton = document.createElement('button');
              const removalCost = shopInventory.removalCost;
              const canAfford = playerInsight >= removalCost;
              const deckSmall = this.gameState.player.deckManager?.masterDeck.length <= 5; // Check min deck size

              removeButton.textContent = `Let Go (${removalCost} Insight)`;
              removeButton.disabled = !shopInventory.removalAvailable || !canAfford || deckSmall;
              if (!shopInventory.removalAvailable) removeButton.title = "Removal service already used.";
              else if (deckSmall) removeButton.title = "Deck is too small to remove concepts.";
              else if (!canAfford) removeButton.title = "Not enough Insight.";
              else removeButton.title = "Choose a Concept to remove from your deck.";

              removeButton.onclick = () => this.gameState.handleShopPurchase('remove');
              this.shopRemoveService.appendChild(removeButton);

              if (!shopInventory.removalAvailable) {
                   const usedText = document.createElement('span'); usedText.textContent = ' (Used)'; this.shopRemoveService.appendChild(usedText);
              }
         }
     }

    /** Renders the rest site interface. */
    renderRestSite(restSiteState, player) {
         if (!this.restSiteScreen || !player || !restSiteState) {
              console.error("Cannot render rest site: Missing elements, player, or state.");
              return;
         }
         const used = restSiteState.usedOption;

         // Update button states based on whether an option was used and player state
         if (this.restHealButton) {
             this.restHealButton.disabled = used || player.currentIntegrity >= player.maxIntegrity;
             this.restHealButton.title = used ? "Already rested." : (player.currentIntegrity >= player.maxIntegrity ? "Integrity is full." : "Restore 30% Integrity.");
         }
         if (this.restMeditateButton) {
             const canUpgrade = player.deckManager.getMasterDeck().some(c => !c.upgraded);
             this.restMeditateButton.disabled = used || !canUpgrade;
             this.restMeditateButton.title = used ? "Already rested." : (!canUpgrade ? "No Concepts available to upgrade." : "Upgrade a Concept in your deck.");
         }
         if (this.restJournalButton) {
             const canRemove = player.deckManager.masterDeck.length > 5; // Example min deck size
             this.restJournalButton.disabled = used || !canRemove;
             this.restJournalButton.title = used ? "Already rested." : (!canRemove ? "Deck is too small to remove." : "Remove a Concept from your deck.");
         }

         // Update Leave button text
         if (this.leaveRestSiteButton) {
             this.leaveRestSiteButton.textContent = used ? "Continue Journey" : "Leave";
         }
         // Update indicator text
         if (this.restUsedIndicator) {
             this.restUsedIndicator.textContent = used ? "You feel somewhat restored." : "Choose one action:";
         }
     }

    // --- Meta Screen Rendering ---
    /** Renders the content of the Meta Progression screen. */
    renderMetaScreen() {
        if (!this.metaContent || !this.metaProgression) {
             if(this.metaContent) this.metaContent.innerHTML = "<p>Loading Meta Progression...</p>";
             console.warn("Cannot render meta screen: Element or MetaProgression missing.");
             return;
        }
        const mp = this.metaProgression;
        let html = `<h3>Meta Progress</h3>`;

        // --- Core Stats ---
        html += `<div class="meta-section">`;
        html += `<p><strong>Total Insight Earned:</strong> ${mp.totalInsight} <i class='fas fa-brain insight-icon'></i></p>`;
        html += `<p><strong>Highest Ascension Beaten:</strong> ${mp.highestAscensionBeat < 0 ? 'None' : mp.highestAscensionBeat}</p>`;
        // Safely access lengths, default to 0 if data not loaded
        const totalConcepts = Data?.concepts?.length || 0;
        const totalArtifacts = ARTIFACT_TEMPLATES ? Object.keys(ARTIFACT_TEMPLATES).length : 0;
        html += `<p><strong>Concepts Unlocked:</strong> ${mp.unlockedConceptIds.size} / ${totalConcepts}</p>`;
        html += `<p><strong>Relics Unlocked:</strong> ${mp.unlockedArtifactIds.size} / ${totalArtifacts}</p>`;
        html += `</div><hr>`;

        // --- Permanent Upgrades ---
        html += `<div class="meta-section"><h4>Permanent Upgrades:</h4><ul>`;
        let upgradesFound = false;
        const upgrades = mp.permanentUpgrades || mp.getDefaultUpgrades(); // Ensure upgrades object exists

        // Helper function to format upgrade keys nicely
        const formatUpgradeKey = (key) => key.replace(/([A-Z])/g, ' $1').replace(/Bonus$/, '').replace(/^./, str => str.toUpperCase()).trim();

        // Iterate through top-level upgrades
        for (const key in upgrades) {
            if (key === 'attunementBonus') continue; // Handle attunements separately
            const bonus = upgrades[key];
            if (typeof bonus === 'number' && bonus > 0) {
                 html += `<li>+${bonus} ${formatUpgradeKey(key)}</li>`;
                 upgradesFound = true;
            }
        }
        // Handle attunement bonuses
        if (upgrades.attunementBonus) {
            for (const elemKey in upgrades.attunementBonus) {
                 const bonus = upgrades.attunementBonus[elemKey];
                 if (typeof bonus === 'number' && bonus > 0) {
                      html += `<li>+${bonus} ${elemKey === 'All' ? 'All Elements' : elemKey} Attunement</li>`;
                      upgradesFound = true;
                 }
            }
        }
        if (!upgradesFound) html += `<li>None yet! Spend Insight to unlock upgrades (Not Implemented).</li>`;
        html += `</ul></div><hr>`;

        // --- Milestones (Optional Display) ---
         html += `<div class="meta-section"><h4>Completed Milestones:</h4>`;
         if (mp.completedMilestoneIds.size > 0) {
              html += `<ul>`;
              mp.completedMilestoneIds.forEach(msId => {
                   const milestoneData = Data.milestones?.find(m => m.id === msId);
                   html += `<li>${milestoneData?.description || msId}</li>`;
              });
              html += `</ul>`;
         } else {
              html += `<p>None yet.</p>`;
         }
         html += `</div><hr>`;


        // --- Actions ---
        html += `<div class="meta-section meta-actions"><h4>Actions:</h4>`;
        // TODO: Add buttons for spending insight on upgrades when implemented
        // html += `<button id="upgradeIntegrityButton" ${mp.totalInsight < 100 ? 'disabled' : ''}>Upgrade Max Integrity (100 Insight)</button>`;
        html += `<button id="resetMetaButton">Reset ALL Progress</button>`; // Add reset button
        html += `</div>`;

        this.metaContent.innerHTML = html;

        // Add listener for reset button dynamically AFTER rendering
        const resetButton = this.metaContent.querySelector('#resetMetaButton');
        if (resetButton) {
            resetButton.onclick = () => this.metaProgression?.resetProgress(); // Calls reset on the instance
        }
    }

    // --- Node Color/Icon Helpers (Map Rendering) ---
    getNodeColor(type) {
        switch (type) {
            case 'combat': return '#c0392b'; // Red
            case 'elite': return '#8e44ad'; // Purple
            case 'event': return '#2980b9'; // Blue
            case 'rest': return '#27ae60'; // Green
            case 'shop': return '#f39c12'; // Orange
            case 'boss': return '#e74c3c'; // Bright Red
            case 'start': return '#bdc3c7'; // Light Grey
            default: return '#7f8c8d'; // Medium Grey
        }
    }
    getNodeIcon(type) {
        // Using Font Awesome Unicode characters
        switch (type) {
            case 'combat': return '\uf06d'; // fas fa-fire or fa-swords? using fire for intensity
            case 'elite': return '\uf005'; // fas fa-star (Common for elite)
            case 'event': return '\uf059'; // fas fa-question-circle
            case 'rest': return '\uf54b'; // fas fa-bed or fa-campfire? Using bed
            case 'shop': return '\uf07a'; // fas fa-shopping-cart
            case 'boss': return '\uf188'; // fas fa-skull or fa-crown? using skull
            case 'start': return '\uf007'; // fas fa-user (player start)
            default: return '?'; // Default fallback
        }
        // Ensure Font Awesome 6 Free font-family is correctly applied in CSS/SVG
    }

} // End of UIManager class
