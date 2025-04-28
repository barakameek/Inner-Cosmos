// js/ui/UIManager.js

import { Card } from '../core/Card.js';
import { Artifact } from '../core/Artifact.js';
import { MetaProgression } from '../meta/MetaProgression.js';
import * as Data from '../../data.js';
import { ARTIFACT_TEMPLATES } from '../core/ArtifactDefinitions.js';

// Import Child UI Managers
import { CombatUI } from './CombatUI.js';

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

        // Ensure gameContainer has relative positioning for absolute children positioning
        if (getComputedStyle(this.gameContainer).position === 'static') {
            this.gameContainer.style.position = 'relative';
            console.warn("UIManager: Game container position was static, set to relative.");
        }


        // References to be set later
        this.gameState = null;
        this.metaProgression = null;

        // Screen management
        this.screens = {};
        this.currentScreen = null;

        // --- Child UI Managers ---
        this.combatUI = null;
        // this.mapUI = null;

        // --- References to screen divs ---
        this.mainMenuScreen = document.getElementById('mainMenuScreen');
        this.mapScreen = document.getElementById('mapScreen');
        this.combatScreen = document.getElementById('combatScreen');
        this.eventScreen = document.getElementById('eventScreen');
        this.shopScreen = document.getElementById('shopScreen');
        this.restSiteScreen = document.getElementById('restSiteScreen');
        this.rewardScreen = document.getElementById('rewardScreen');
        this.metaScreen = document.getElementById('metaScreen');
        this._collectScreens();

         // --- References to specific elements within screens ---
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
         this.combatLogElement = document.getElementById('combatLog'); // <<< NEW: Combat Log Element
         this.floatingTextContainer = null; // Container for floating numbers, created dynamically

         // Map Screen
         this.mapArea = document.getElementById('mapArea');
         this.playerInfoMap = document.getElementById('playerInfoMap');
         // Combat Screen
         this.enemyArea = document.getElementById('enemyArea');
         this.playerArea = document.getElementById('playerArea');
         this.handArea = document.getElementById('handArea');
         this.deckInfoArea = document.getElementById('deckInfo');
         this.deckCountElement = document.getElementById('deckCount'); // Corrected ID based on previous files? Check index.html
         this.discardCountElement = document.getElementById('discardCount'); // Corrected ID?
         this.exhaustCountElement = document.getElementById('exhaustCount'); // Corrected ID?
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

        // --- Initialization ---
        this._ensureOverlayAreasExist(); // Renamed to include combat log + floating text container
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

        try {
             this.combatUI = new CombatUI(this, this.gameState);
             // this.mapUI = new MapUI(this, this.gameState);
             console.log("UIManager references set, child managers initialized.");
        } catch (error) { console.error("Error initializing child UI managers:", error); }
    }

    /** Finds and stores references to all screen elements */
    _collectScreens() {
        const screenElements = this.gameContainer?.querySelectorAll('.screen');
        if (!screenElements) { console.error("UIManager Error: Could not query for screens."); return; }
        screenElements.forEach(screen => {
            if (screen.id) {
                this.screens[screen.id] = screen;
                screen.classList.remove('active'); screen.style.opacity = '0'; screen.style.pointerEvents = 'none';
            } else { console.warn("Found screen element without an ID:", screen); }
        });
        const coreScreens = ['mainMenuScreen', 'mapScreen', 'combatScreen'];
        coreScreens.forEach(id => { if (!this.screens[id]) console.error(`UIManager FATAL: Core screen #${id} not found! Check index.html.`); });
    }

     /** Ensures feedback/overlay areas exist in the DOM, creating them if necessary. */
     _ensureOverlayAreasExist() {
        if (!this.notificationArea) {
             this.notificationArea = this._createFeedbackArea('notificationArea', 'bottom', 'right');
             console.log("Created notificationArea.");
        }
        if (!this.actionFeedbackArea) {
             this.actionFeedbackArea = this._createFeedbackArea('actionFeedbackArea', 'top', 'center');
             console.log("Created actionFeedbackArea.");
        }
        if (!this.combatLogElement) {
            this.combatLogElement = this._createCombatLogArea('combatLog');
            console.log("Created combatLogElement.");
        }
        if (!this.floatingTextContainer) {
             this.floatingTextContainer = this._createFloatingTextContainer('floatingTextContainer');
             console.log("Created floatingTextContainer.");
        }
     }

     /** Creates a styled container div for notifications or action feedback. */
     _createFeedbackArea(id, vAlign = 'bottom', hAlign = 'right') {
         const area = document.createElement('div');
         area.id = id;
         Object.assign(area.style, {
             position: 'absolute', zIndex: '150', pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: '5px', padding: '10px', maxWidth: '350px', width: '90%'
         });
         if (vAlign === 'top') area.style.top = '15px'; else area.style.bottom = '15px';
         if (hAlign === 'center') { area.style.left = '50%'; area.style.transform = 'translateX(-50%)'; area.style.alignItems = 'center'; }
         else if (hAlign === 'left') { area.style.left = '15px'; area.style.alignItems = 'flex-start'; }
         else { area.style.right = '15px'; area.style.alignItems = 'flex-end'; }
         this.gameContainer.appendChild(area); return area;
     }

     /** Creates the container for floating combat numbers */
     _createFloatingTextContainer(id) {
         const container = document.createElement('div');
         container.id = id;
         Object.assign(container.style, {
             position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', pointerEvents: 'none', // Ignore clicks
             overflow: 'hidden', // Prevent numbers spilling out
             zIndex: '140' // Above combat elements, below feedback/modals
         });
         this.gameContainer.appendChild(container);
         return container;
     }

     /** Creates the container for the combat log */
      _createCombatLogArea(id) {
          const area = document.createElement('div');
          area.id = id;
          area.setAttribute('aria-live', 'polite');
          Object.assign(area.style, {
              position: 'absolute', bottom: '80px', // Position above deck area
              left: '10px', width: '250px', maxHeight: '150px', overflowY: 'auto', // Scrollable
              backgroundColor: 'rgba(30, 40, 50, 0.8)', // Semi-transparent dark
              border: '1px solid var(--color-border)', borderRadius: '5px', padding: '8px', fontSize: '0.85em', color: 'var(--color-text-medium)', zIndex: '130', // Below floating text
              opacity: '0.7', transition: 'opacity 0.3s ease', pointerEvents: 'auto' // Allow scrolling
          });
          // Hide/show on hover maybe?
          area.style.opacity = '0.3'; // Start faded
          area.onmouseenter = () => area.style.opacity = '0.9';
          area.onmouseleave = () => area.style.opacity = '0.3';

          // Initial placeholder message
          const placeholder = document.createElement('p');
          placeholder.textContent = 'Combat Log';
          placeholder.style.fontStyle = 'italic';
          placeholder.style.textAlign = 'center';
          area.appendChild(placeholder);

          this.gameContainer.appendChild(area);
          return area;
      }

    /** Sets up listeners for common UI elements like modal close buttons. */
    _setupCommonListeners() {
        if (this.modalCloseButton) { this.modalCloseButton.onclick = () => this.hideModal(); }
        else { console.warn("Modal close button not found."); }
        window.addEventListener('click', (event) => {
            if (this.modalPopup && event.target == this.modalPopup && this.modalPopup.style.display === 'block') { this.hideModal(); }
            if (this.cardSelectionModal && event.target == this.cardSelectionModal && this.cardSelectionModal.style.display === 'block') { this.hideCardSelectionModal(true); }
        });
         if (this.cardSelectionCancelButton) { this.cardSelectionCancelButton.onclick = () => this.hideCardSelectionModal(true); }
         else { console.warn("Card Selection Cancel button not found."); }
    }

    /** Sets up listeners for buttons on specific node screens (Shop, Rest). */
     _setupNodeActionListeners() {
         if (this.leaveShopButton) { this.leaveShopButton.onclick = () => this.gameState?.leaveShop(); }
         else { console.warn("Leave Shop button not found."); }
         if (this.restHealButton) { this.restHealButton.onclick = () => this.gameState?.handleRestSiteAction('heal'); }
         else { console.warn("Rest Heal button not found."); }
         if (this.restMeditateButton) { this.restMeditateButton.onclick = () => this.gameState?.handleRestSiteAction('upgrade'); }
         else { console.warn("Rest Meditate button not found."); }
         if (this.restJournalButton) { this.restJournalButton.onclick = () => this.gameState?.handleRestSiteAction('remove'); }
         else { console.warn("Rest Journal button not found."); }
         if (this.leaveRestSiteButton) { this.leaveRestSiteButton.onclick = () => this.gameState?.leaveRestSite(); }
         else { console.warn("Leave Rest Site button not found."); }
     }

    /** Shows a specific screen and hides the current one with fade effect. */
    showScreen(screenId) {
        if (this.currentScreen && this.currentScreen.id === screenId) { return; }
        if (this.currentScreen) {
             this.currentScreen.classList.remove('active'); this.currentScreen.style.opacity = '0'; this.currentScreen.style.pointerEvents = 'none';
        }
        const nextScreen = this.screens[screenId];
        if (nextScreen) {
            this.currentScreen = nextScreen; this.currentScreen.classList.add('active'); void this.currentScreen.offsetWidth;
            this.currentScreen.style.opacity = '1'; this.currentScreen.style.pointerEvents = 'auto'; console.log(`UIManager: Showing screen: ${screenId}`);
            if (screenId === 'metaScreen') this.renderMetaScreen();
            if (screenId === 'mapScreen') this.gameState?.mapManager?.renderMap();
            if (this.currentScreen.id !== 'combatScreen') { this.gameState?.combatManager?.setSelectedTarget(null); this.clearCombatLog(); } // Clear target/log when leaving combat
             if (screenId === 'combatScreen' && this.combatLogElement && this.combatLogElement.children.length <= 1) { // Clear placeholder on combat start
                  this.clearCombatLog(true); // Add initial log message
             }
        } else { console.error(`UIManager Error: Screen ID "${screenId}" not found!`); this.showScreen('mainMenuScreen'); }
    }

    // --- DELEGATED Update Methods ---

    /** Delegates combat UI update to CombatUI */
    updateCombatUI(player, enemies, isPlayerTurn) {
        if (!this.combatUI) { console.error("CombatUI not initialized, cannot update."); return; }
        this.combatUI.update(player, enemies, isPlayerTurn); // CombatUI now handles internal updates/styling
    }

    /** Updates deck/discard counts (can be called from anywhere) */
    updateDeckDiscardCounts(deckManager) {
        if (!deckManager || !this.combatUI) return;
        this.combatUI.updateDeckDiscardCounts(deckManager); // Delegate to CombatUI
    }

    // --- MAP Rendering (Managed here for now) ---
    /** Renders the map nodes and connections. */
    renderMap(nodes, currentNodeId, connections) {
        const mapContainer = this.mapArea; if (!mapContainer) { console.error("UIManager Error: Map area element not found."); return; }
        if (!this.gameState || !this.gameState.mapManager) { console.warn("UIManager Warning: GameState or MapManager missing for map render."); return; }
        if (!nodes || Object.keys(nodes).length === 0) { mapContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Map Error: No nodes found.</p>'; return; }
        mapContainer.innerHTML = ''; const svgNS = "http://www.w3.org/2000/svg"; const mapSvg = document.createElementNS(svgNS, "svg");
        mapSvg.setAttribute('width', '100%'); mapSvg.setAttribute('height', '100%'); mapSvg.style.backgroundColor = 'var(--color-bg-dark)'; // Use CSS var
        const defs = document.createElementNS(svgNS, 'defs'); const marker = document.createElementNS(svgNS, 'marker'); marker.setAttribute('id', 'arrowhead'); marker.setAttribute('markerWidth', '10'); marker.setAttribute('markerHeight', '7'); marker.setAttribute('refX', '0'); marker.setAttribute('refY', '3.5'); marker.setAttribute('orient', 'auto');
        const polygon = document.createElementNS(svgNS, 'polygon'); polygon.setAttribute('points', '0 0, 10 3.5, 0 7'); polygon.setAttribute('fill', '#6c7a89');
        marker.appendChild(polygon); defs.appendChild(marker); mapSvg.appendChild(defs);
        connections?.forEach(conn => {
            const fromNode = nodes[conn.from]; const toNode = nodes[conn.to]; if (fromNode && toNode) {
                const line = document.createElementNS(svgNS, "line"); line.setAttribute('x1', fromNode.position.x); line.setAttribute('y1', fromNode.position.y); line.setAttribute('x2', toNode.position.x); line.setAttribute('y2', toNode.position.y);
                line.setAttribute('stroke', fromNode.visited ? '#566573' : '#6c7a89'); line.setAttribute('stroke-width', '3'); mapSvg.appendChild(line);
            }
        });
        Object.values(nodes).forEach(node => {
             const isCurrent = node.id === currentNodeId; const isAvailable = nodes[currentNodeId]?.connections.includes(node.id); const nodeGroup = document.createElementNS(svgNS, "g"); nodeGroup.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`); nodeGroup.dataset.nodeId = node.id;
             const circle = document.createElementNS(svgNS, "circle"); circle.setAttribute('r', '20'); circle.setAttribute('fill', this.getNodeColor(node.type)); circle.setAttribute('stroke', isCurrent ? 'var(--color-accent-tertiary)' : (node.visited ? '#555' : '#ecf0f1')); circle.setAttribute('stroke-width', isCurrent ? '4' : '2');
             const iconText = document.createElementNS(svgNS, "text"); iconText.setAttribute('font-family', '"Font Awesome 6 Free"'); iconText.style.fontWeight = 900; iconText.setAttribute('font-size', '20px'); iconText.setAttribute('fill', node.visited && !isCurrent ? '#999' : '#fff'); iconText.setAttribute('text-anchor', 'middle'); iconText.setAttribute('dominant-baseline', 'central'); iconText.textContent = this.getNodeIcon(node.type);
             nodeGroup.appendChild(circle); nodeGroup.appendChild(iconText);
             if (isAvailable && !isCurrent) {
                 nodeGroup.style.cursor = 'pointer'; nodeGroup.classList.add('map-node-available'); nodeGroup.onclick = () => this.gameState?.mapManager?.moveToNode(node.id);
                 // Removed direct style manipulation, rely on CSS :hover for feedback
             } else { nodeGroup.style.cursor = 'default'; if (!isCurrent && !node.visited && !isAvailable) { nodeGroup.style.opacity = 0.4; } else { nodeGroup.style.opacity = node.visited && !isCurrent ? 0.6 : 1.0; } }
             let tooltipText = `${node.type.toUpperCase()}`; if (node.data?.eventId) { const prompt = Data.reflectionPrompts?.[node.data.eventId]; const dilemma = Data.elementalDilemmas?.find(d => d.id === node.data.eventId); tooltipText += ` (${prompt?.text?.substring(0,20)+'...' || dilemma?.situation?.substring(0,20)+'...' || node.data.eventId})`; }
             if (isCurrent) tooltipText += " (Current)"; else if (node.visited) tooltipText += " (Visited)"; else if (!isAvailable) tooltipText += " (Unavailable)";
             const titleElement = document.createElementNS(svgNS, "title"); titleElement.textContent = tooltipText; nodeGroup.appendChild(titleElement); node.element = nodeGroup; mapSvg.appendChild(nodeGroup);
        });
        mapContainer.appendChild(mapSvg);
    }

    /** Updates player info display on the map screen */
     updatePlayerMapInfo(player, floor) {
        const infoEl = this.playerInfoMap; if (!infoEl) { console.warn("Player info map element not found."); return; }
        if (!player || !player.deckManager) { infoEl.innerHTML = "Loading player info..."; return; };
         infoEl.innerHTML = `
             <span>Floor: ${floor || '?'}</span><span class="info-divider">|</span>
             <span>Integrity: ${player.currentIntegrity} / ${player.maxIntegrity}</span><span class="info-divider">|</span>
             <span>Insight (Run): ${player.insightThisRun} <i class='fas fa-brain insight-icon'></i></span><span class="info-divider">|</span>
             <span>Deck: ${player.deckManager.getMasterDeck().length}</span>
             `;
         // Add Attunements Display (Optional)
         let attunementStr = Object.entries(player.attunements || {}).map(([key, val]) => `${key}:${val?.toFixed(1)}`).join(' ');
         infoEl.innerHTML += `<span class="info-divider">|</span><span title="Attunements">Att: ${attunementStr}</span>`;
     }

    // --- Methods specific to UIManager (Feedback, Modals, Global state) ---

    /** Creates a card DOM element (used by CombatUI, RewardScreen etc.) */
    createCardElement(card) {
        if (!card || card.conceptId === -1) { const errorDiv = document.createElement('div'); errorDiv.className = 'card error-card'; errorDiv.textContent = 'Error'; return errorDiv; }
        const cardDiv = document.createElement('div'); cardDiv.className = `card rarity-${card.rarity} type-${card.cardType.toLowerCase().split('/')[0]}`; cardDiv.dataset.cardId = card.id; cardDiv.dataset.conceptId = card.conceptId;
        const cost = document.createElement('div'); cost.className = 'card-cost'; cost.textContent = card.cost === null ? 'X' : card.cost;
        const name = document.createElement('div'); name.className = 'card-name'; name.textContent = card.name;
        const description = document.createElement('div'); description.className = 'card-description'; description.innerHTML = card.getEffectDescriptionHtml();
        const type = document.createElement('div'); type.className = 'card-type'; type.textContent = card.cardType;
        cardDiv.appendChild(cost); cardDiv.appendChild(name); cardDiv.appendChild(description); cardDiv.appendChild(type);
        cardDiv.addEventListener('mouseover', (event) => this.showTooltip(card.getTooltipHtml(), event.clientX, event.clientY));
        cardDiv.addEventListener('mouseout', () => this.hideTooltip()); cardDiv.addEventListener('mousemove', (event) => this.updateTooltipPosition(event.clientX, event.clientY));
        // Apply resonance highlight if needed (moved from CombatUI to centralize card creation logic)
        if (this.gameState?.player) {
             const attunements = this.gameState.player.attunements;
             const sortedAttunements = Object.entries(attunements).sort(([,a], [,b]) => b - a);
             const highestScore = sortedAttunements[0]?.[1] || 0;
             // Highlight if card element matches any attunement within 1 point of the highest
             if (highestScore > 0 && card.primaryElement && sortedAttunements.some(([key, score]) => key === card.primaryElement && score >= highestScore - 1)) {
                 cardDiv.classList.add('resonant-choice');
             }
        }
        return cardDiv;
    }


    /** Shows a persistent notification message. */
    showNotification(message, duration = 3500) {
        if (!this.notificationArea) { console.log("Notify:", message); return; } const el = document.createElement('div'); el.className = 'notification-message'; el.innerHTML = message;
        this.notificationArea.appendChild(el); setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 500); }, duration);
    }

    /** Shows temporary action feedback (e.g., "Not enough Focus!"). */
    showActionFeedback(message, type = 'info', duration = 1800) {
        if (!this.actionFeedbackArea) { console.log(`Feedback (${type}):`, message); return; } const el = document.createElement('div'); el.className = `action-feedback feedback-${type}`; el.textContent = message;
        this.actionFeedbackArea.prepend(el); if (this.actionFeedbackArea.children.length > 4) { this.actionFeedbackArea.lastChild?.remove(); }
        setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(-15px)'; setTimeout(() => el.remove(), 500); }, duration);
    }

    /** Clears all enemy highlights and targeting styles. */
    clearEnemyHighlights() { this.combatUI?.clearEnemyHighlights(); }
    /** Highlights or removes highlight from an enemy (called by CombatUI). */
    highlightEnemy(enemyInstanceId, highlighted = true) { this.combatUI?.highlightEnemy(enemyInstanceId, highlighted); }

    // --- Tooltip Methods ---
    showTooltip(content, x, y) { if (!this.tooltipElement) return; this.tooltipElement.innerHTML = content; this.tooltipElement.style.display = 'block'; this.updateTooltipPosition(x, y); }
    hideTooltip() { if (!this.tooltipElement) return; this.tooltipElement.style.display = 'none'; }
    updateTooltipPosition(x, y) {
        if (!this.tooltipElement || this.tooltipElement.style.display === 'none') return; const offsetX = 15; const offsetY = 10;
        const tooltipRect = this.tooltipElement.getBoundingClientRect(); const containerRect = this.gameContainer.getBoundingClientRect(); let top = y + offsetY; let left = x + offsetX;
        if (left + tooltipRect.width > containerRect.right - 10) { left = x - tooltipRect.width - offsetX; } if (top + tooltipRect.height > containerRect.bottom - 10) { top = y - tooltipRect.height - offsetY; } if (left < containerRect.left + 10) left = containerRect.left + 10; if (top < containerRect.top + 10) top = containerRect.top + 10;
        this.tooltipElement.style.left = `${left}px`; this.tooltipElement.style.top = `${top}px`;
    }

    // --- Modal Methods ---
    showModal(text, choices = []) {
         if (!this.modalPopup || !this.modalText || !this.modalChoices) { console.error("Cannot show modal, elements missing."); alert(text.replace(/<[^>]*>?/gm, '')); return; }
         this.modalText.innerHTML = text; this.modalChoices.innerHTML = '';
         if (choices.length === 0) { const okBtn = document.createElement('button'); okBtn.textContent = 'OK'; okBtn.onclick = () => this.hideModal(); this.modalChoices.appendChild(okBtn); }
         else { choices.forEach(choice => { const btn = document.createElement('button'); btn.textContent = choice.text; btn.onclick = () => { this.hideModal(); if (choice.callback) choice.callback(); }; if (choice.disabled) btn.disabled = true; this.modalChoices.appendChild(btn); }); }
         this.modalPopup.style.display = 'block';
    }
    hideModal() { if (!this.modalPopup) return; this.modalPopup.style.display = 'none'; this.modalText.innerHTML = ''; this.modalChoices.innerHTML = ''; }

    // --- Card Selection Modal ---
    showCardSelectionModal(cardsToShow, onSelectCallback, title = "Select a Card") {
        if (!this.cardSelectionModal || !this.cardSelectionGrid || !this.cardSelectionTitle || !this.gameState) { console.error("Cannot show card selection modal."); if (onSelectCallback) onSelectCallback(null); return; }
        this._currentCardSelectionCallback = onSelectCallback; this.cardSelectionTitle.textContent = title; this.cardSelectionGrid.innerHTML = '';
        if (!Array.isArray(cardsToShow) || cardsToShow.length === 0) { this.cardSelectionGrid.innerHTML = '<p>No options available.</p>'; }
        else { cardsToShow.forEach(card => { const cardElement = this.createCardElement(card); if (cardElement) { cardElement.style.cursor = 'pointer'; cardElement.onclick = () => this.hideCardSelectionModal(false, card); this.cardSelectionGrid.appendChild(cardElement); } }); }
        this.cardSelectionModal.style.display = 'block';
    }
    hideCardSelectionModal(cancelled = true, selectedCard = null) {
        if (!this.cardSelectionModal) return; this.cardSelectionModal.style.display = 'none';
        if (this._currentCardSelectionCallback) { try { this._currentCardSelectionCallback(cancelled ? null : selectedCard); } catch (error) { console.error("Error executing card selection callback:", error); } } this._currentCardSelectionCallback = null;
    }

    // --- Floating Combat Text ---
     /**
      * Displays a floating number/text near a target element.
      * @param {HTMLElement} targetElement - The Player or Enemy element.
      * @param {string} text - The text/number to display (e.g., "-10", "+5", "Blocked!").
      * @param {string} type - Type for styling ('damage', 'heal', 'block', 'blocked', 'buff', 'debuff', 'negate', 'info').
      * @param {string} [modifiersText=''] - Optional text describing modifiers (e.g., "Weak!", "x1.5 Vuln").
      */
     showFloatingNumber(targetElement, text, type, modifiersText = '') {
         if (!targetElement || !this.floatingTextContainer || !this.gameContainer) {
             // console.warn("Cannot show floating number: Target or container missing.", { targetElement, container: this.floatingTextContainer });
             return;
         }

         const numberElement = document.createElement('div');
         numberElement.className = `floating-number type-${type}`; // Base class + type class
         numberElement.textContent = text;

         // Add modifier text if provided (optional styling)
         if (modifiersText) {
             const modifierSpan = document.createElement('span');
             modifierSpan.className = 'floating-number-modifier';
             modifierSpan.textContent = ` (${modifiersText})`;
             numberElement.appendChild(modifierSpan);
         }

         // --- Positioning ---
         const targetRect = targetElement.getBoundingClientRect();
         const containerRect = this.gameContainer.getBoundingClientRect();

         // Calculate position relative to the game container
         const targetTopInContainer = targetRect.top - containerRect.top;
         const targetLeftInContainer = targetRect.left - containerRect.left;

         // Position near the top-center of the target, with random horizontal offset
         const randomOffsetX = (Math.random() - 0.5) * targetRect.width * 0.4; // Randomness within 40% of width
         const startYOffset = -20; // Start slightly above the target

         numberElement.style.position = 'absolute';
         numberElement.style.left = `${targetLeftInContainer + targetRect.width / 2 + randomOffsetX}px`;
         numberElement.style.top = `${targetTopInContainer + startYOffset}px`;
         numberElement.style.transform = 'translateX(-50%)'; // Center horizontally

         // --- Animation & Cleanup ---
         this.floatingTextContainer.appendChild(numberElement);

         // CSS animation handles movement and fade-out (defined in style.css)
         // Remove element after animation finishes
         numberElement.addEventListener('animationend', () => {
             numberElement.remove();
         });
     }

    // --- Combat Log ---
     /**
      * Adds a message to the combat log.
      * @param {string} message - The message to log (can include simple HTML).
      * @param {string} [type='info'] - Type for potential styling ('info', 'player', 'enemy', 'warning', 'status').
      */
     logCombatEvent(message, type = 'info') {
         if (!this.combatLogElement || !this.gameContainer) {
             console.log(`Combat Log (${type}): ${message.replace(/<[^>]*>?/gm, '')}`); // Fallback log
             return;
         }
          // Remove placeholder if still present
         const placeholder = this.combatLogElement.querySelector('.log-placeholder');
         if (placeholder) placeholder.remove();

         const logEntry = document.createElement('div');
         logEntry.className = `log-entry log-${type}`;
         logEntry.innerHTML = message; // Allow basic HTML like icons

         this.combatLogElement.appendChild(logEntry);

         // Auto-scroll to the bottom
         this.combatLogElement.scrollTop = this.combatLogElement.scrollHeight;

         // Optional: Limit log length
         const maxLogEntries = 50;
         while (this.combatLogElement.children.length > maxLogEntries) {
             this.combatLogElement.firstChild?.remove();
         }
     }

     /** Clears the combat log */
     clearCombatLog(addStartMessage = false) {
         if (this.combatLogElement) {
             this.combatLogElement.innerHTML = '';
             if(addStartMessage) {
                 const startMsg = document.createElement('p');
                 startMsg.className = 'log-entry log-info log-placeholder'; // Use placeholder class
                 startMsg.textContent = `Combat Started - Turn ${this.gameState?.combatManager?.turnNumber || 1}`;
                 startMsg.style.fontStyle = 'italic';
                 this.combatLogElement.appendChild(startMsg);
             }
         }
     }


    // --- Node Screen Rendering (Reward, Shop, Rest) ---
    // (Keep existing methods for showRewardScreen, renderShop, renderRestSite)
    // ...
     showRewardScreen(rewards) { /* ... No changes needed here unless adding resonance highlight */ }
     renderShop(shopInventory, playerInsight) { /* ... No changes needed ... */ }
     renderRestSite(restSiteState, player) { /* ... No changes needed ... */ }


    // --- Meta Screen Rendering ---
    renderMetaScreen() { /* ... Keep existing method ... */ }

    // --- Node Color/Icon Helpers (Map Rendering) ---
    getNodeColor(type) { /* ... Keep existing method ... */ }
    getNodeIcon(type) { /* ... Keep existing method ... */ }

} // End of UIManager class
