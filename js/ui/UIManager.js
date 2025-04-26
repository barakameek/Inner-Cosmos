// js/ui/UIManager.js

// Import classes needed for rendering data or type checking
import { Card } from '../core/Card.js';
import { Artifact } from '../core/Artifact.js';
import { MetaProgression } from '../meta/MetaProgression.js'; // Needed for renderMetaScreen
import * as Data from '../../data.js'; // Needed for meta screen counts, node icons etc.
import { ARTIFACT_TEMPLATES } from '../core/ArtifactDefinitions.js'; // Needed for meta screen count

// Import Child UI Managers
import { CombatUI } from './CombatUI.js';
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

        this.gameState = null;
        this.metaProgression = null;
        this.screens = {};
        this.currentScreen = null;

        // --- Child UI Managers ---
        this.combatUI = null; // Instantiated in setReferences
        // this.mapUI = null; // Instantiated in setReferences (when created)

        // --- References to screen divs (managed by UIManager for showing/hiding) ---
        this.mainMenuScreen = document.getElementById('mainMenuScreen');
        this.mapScreen = document.getElementById('mapScreen');
        this.combatScreen = document.getElementById('combatScreen');
        this.eventScreen = document.getElementById('eventScreen');
        this.shopScreen = document.getElementById('shopScreen');
        this.restSiteScreen = document.getElementById('restSiteScreen');
        this.rewardScreen = document.getElementById('rewardScreen');
        this.metaScreen = document.getElementById('metaScreen');

         // --- References to specific elements within screens (for convenience/access) ---
         // Map Screen Elements (Potentially passed to MapUI later)
         this.mapArea = document.getElementById('mapArea');
         this.playerInfoMap = document.getElementById('playerInfoMap');
         // Combat Screen Elements (Needed to pass to CombatUI or for global access like drop zones)
         this.enemyArea = document.getElementById('enemyArea');
         this.playerArea = document.getElementById('playerArea');
         this.handArea = document.getElementById('handArea');
         // Reward Screen Elements
         this.rewardCardsArea = document.getElementById('rewardCards');
         this.rewardArtifactsArea = document.getElementById('rewardArtifacts');
         this.rewardInsightText = document.getElementById('rewardInsight');
         this.rewardSkipButton = document.getElementById('rewardSkipButton');
         // Shop Screen Elements
         this.shopCards = document.getElementById('shopCards');
         this.shopArtifacts = document.getElementById('shopArtifacts');
         this.shopRemoveService = document.getElementById('shopRemoveService');
         this.shopInsightDisplay = document.getElementById('shopInsightDisplay');
         this.leaveShopButton = document.getElementById('leaveShopButton');
         // Rest Site Elements
         this.restUsedIndicator = document.getElementById('restUsedIndicator');
         this.restHealButton = document.getElementById('restHealButton');
         this.restMeditateButton = document.getElementById('restMeditateButton');
         this.restJournalButton = document.getElementById('restJournalButton');
         this.leaveRestSiteButton = document.getElementById('leaveRestSiteButton');
         // Meta Screen Elements
         this.metaContent = document.getElementById('metaContent');
         this.backToMenuButton = document.getElementById('backToMenuButton');
         // Main Menu Buttons (for attaching listeners initially)
         this.startGameButton = document.getElementById('startGameButton');
         this.loadGameButton = document.getElementById('loadGameButton');
         this.metaProgressionButton = document.getElementById('metaProgressionButton');
         this.settingsButton = document.getElementById('settingsButton');

         // --- References for Global Overlays ---
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

        // Card Drag State (Managed globally for drops between areas)
        this.draggedCard = null;
        this.draggedCardElement = null;
        // Note: Current Target state is managed by CombatManager

        // Initialization steps
        this._collectScreens(); // Find screen divs
        this._ensureFeedbackAreasExist(); // Create feedback divs if missing
        this._setupCommonListeners(); // Setup modal closing etc.
        this._setupNodeActionListeners(); // Setup shop/rest buttons

        console.log("UIManager initialized.");
    }

    /** Stores references and initializes child UI managers */
    setReferences(gameState, metaProgression) {
        this.gameState = gameState;
        this.metaProgression = metaProgression;
        // Initialize Child UI Managers, passing necessary references
        this.combatUI = new CombatUI(this, this.gameState);
        // this.mapUI = new MapUI(this, this.gameState); // When MapUI class is created
        console.log("UIManager references set, child managers initialized.");
    }

    /** Finds and stores references to all screen elements by ID */
    _collectScreens() {
        const screenElements = this.gameContainer?.querySelectorAll('.screen'); // Check container exists
        screenElements?.forEach(screen => {
            if (screen.id) {
                this.screens[screen.id] = screen;
                screen.classList.remove('active');
                // Specific element finding within screens, done in constructor now
            }
        });
         // Verify core screens were found
         const coreScreens = ['mainMenuScreen', 'mapScreen', 'combatScreen'];
         coreScreens.forEach(id => {
            if (!this.screens[id]) console.error(`UIManager Error: Core screen #${id} not found!`);
         })
        console.log("UIManager: Found screens:", Object.keys(this.screens));
    }

     /** Ensures feedback areas exist, creating them if necessary. */
     _ensureFeedbackAreasExist() {
        if (!this.notificationArea) { this.notificationArea = this._createFeedbackArea('notificationArea', 'bottom', 'right'); }
        if (!this.actionFeedbackArea) { this.actionFeedbackArea = this._createFeedbackArea('actionFeedbackArea', 'top', 'center'); }
     }

     /** Creates a container div for notifications or action feedback. */
     _createFeedbackArea(id, vAlign = 'bottom', hAlign = 'right') {
         console.warn(`Creating placeholder div for missing feedback area #${id}`);
         const area = document.createElement('div'); area.id = id; area.style.position = 'absolute'; area.style.zIndex = '150'; area.style.pointerEvents = 'none'; area.style.display = 'flex'; area.style.flexDirection = 'column'; area.style.gap = '5px';
         if (vAlign === 'top') area.style.top = '20px'; else area.style.bottom = '20px';
         if (hAlign === 'center') { area.style.left = '50%'; area.style.transform = 'translateX(-50%)'; area.style.alignItems = 'center'; area.style.width = '60%'; area.style.maxWidth = '500px'; }
         else if (hAlign === 'left') { area.style.left = '20px'; area.style.alignItems = 'flex-start'; }
         else { area.style.right = '20px'; area.style.alignItems = 'flex-end'; }
         this.gameContainer.appendChild(area); return area; // Append inside game container
     }

    /** Sets up listeners for common UI elements like modal close buttons. */
    _setupCommonListeners() {
        if (this.modalCloseButton) { this.modalCloseButton.onclick = () => this.hideModal(); }
        // Close modals if clicking outside content area
        window.addEventListener('click', (event) => {
            if (event.target == this.modalPopup && this.modalPopup.style.display === 'block') { this.hideModal(); }
            if (event.target == this.cardSelectionModal && this.cardSelectionModal.style.display === 'block') { this.hideCardSelectionModal(true); } // Cancel
        });
    }

    /** Sets up listeners for buttons on specific node screens (Shop, Rest). */
     _setupNodeActionListeners() {
         // Shop Listeners (Buy buttons added dynamically, Leave button is static)
         if (this.leaveShopButton) { this.leaveShopButton.onclick = () => this.gameState?.leaveShop(); }
         else { console.warn("Leave Shop button not found."); }

         // Rest Site Listeners
         if (this.restHealButton) { this.restHealButton.onclick = () => this.gameState?.handleRestSiteAction('heal'); }
         else { console.warn("Rest Heal button not found."); }
         if (this.restMeditateButton) { this.restMeditateButton.onclick = () => this.gameState?.handleRestSiteAction('upgrade'); }
         else { console.warn("Rest Meditate button not found."); }
         if (this.restJournalButton) { this.restJournalButton.onclick = () => this.gameState?.handleRestSiteAction('remove'); }
         else { console.warn("Rest Journal button not found."); }
         if (this.leaveRestSiteButton) { this.leaveRestSiteButton.onclick = () => this.gameState?.leaveRestSite(); }
         else { console.warn("Leave Rest Site button not found."); }

         // Card Selection Modal Cancel Button
         if (this.cardSelectionCancelButton) { this.cardSelectionCancelButton.onclick = () => this.hideCardSelectionModal(true); } // Cancel
         else { console.warn("Card Selection Cancel button not found."); }
     }

    /** Shows a specific screen and hides the current one. */
    showScreen(screenId) {
        if (this.currentScreen) { this.currentScreen.classList.remove('active'); }
        if (this.screens[screenId]) {
            this.currentScreen = this.screens[screenId];
            this.currentScreen.classList.add('active');
            console.log(`UIManager: Showing screen: ${screenId}`);
             // Render meta screen content when shown
             if (screenId === 'metaScreen') { this.renderMetaScreen(); }
             // If showing map, ensure it renders (in case returning after combat/event)
              if (screenId === 'mapScreen') { this.gameState?.mapManager?.renderMap(); }
        } else { console.error(`UIManager: Screen ID "${screenId}" not found!`); }
    }

    // --- DELEGATED Update Methods ---

    /** Delegates combat UI update to CombatUI */
    updateCombatUI(player, enemies, isPlayerTurn) {
        // Delegate update logic to the dedicated CombatUI manager
        this.combatUI?.update(player, enemies, isPlayerTurn); // Use optional chaining
    }

    /** Renders the map (Currently here, TODO: move to MapUI) */
    renderMap(nodes, currentNodeId, connections) {
        const mapContainer = this.mapArea;
        if (!mapContainer) { console.error("UIManager: Map area element not found."); return; }
        if (!this.gameState || !this.gameState.mapManager) { console.warn("UIManager: GameState or MapManager missing for map render."); return; }
        if (!nodes || Object.keys(nodes).length === 0) { mapContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Map Error: No nodes generated.</p>'; return; }

        // console.log("UIManager: renderMap called."); // Noisy log removed
        mapContainer.innerHTML = ''; // Clear previous map
        const mapSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        mapSvg.setAttribute('width', '100%'); mapSvg.setAttribute('height', '100%'); mapSvg.style.backgroundColor = '#34495e';

        // Render Connections
        connections?.forEach(conn => {
            const fromNode = nodes[conn.from]; const toNode = nodes[conn.to];
            if (fromNode && toNode) {
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute('x1', fromNode.position.x); line.setAttribute('y1', fromNode.position.y); line.setAttribute('x2', toNode.position.x); line.setAttribute('y2', toNode.position.y);
                line.setAttribute('stroke', fromNode.visited ? '#95a5a6' : '#6c7a89'); // Dimmer lines
                line.setAttribute('stroke-width', '3'); // Thicker lines
                mapSvg.appendChild(line);
            }
        });

        // Render Nodes
        Object.values(nodes).forEach(node => {
             const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
             nodeGroup.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);
             const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle"); circle.setAttribute('r', '18'); // Slightly larger radius
             circle.setAttribute('fill', this.getNodeColor(node.type));
             circle.setAttribute('stroke', node.id === currentNodeId ? '#f1c40f' : (node.visited ? '#555' : '#ecf0f1'));
             circle.setAttribute('stroke-width', node.id === currentNodeId ? '4' : '2'); // Thicker current border
             const iconText = document.createElementNS("http://www.w3.org/2000/svg", "text"); iconText.setAttribute('font-family', '"Font Awesome 6 Free"'); iconText.style.fontWeight = 900; // Needed for solid icons
             iconText.setAttribute('font-size', '18px'); iconText.setAttribute('fill', '#fff'); iconText.setAttribute('text-anchor', 'middle');
             iconText.setAttribute('dominant-baseline', 'central'); iconText.textContent = this.getNodeIcon(node.type);
             nodeGroup.appendChild(circle); nodeGroup.appendChild(iconText); nodeGroup.dataset.nodeId = node.id;
             const isAvailableMove = nodes[currentNodeId]?.connections.includes(node.id);
             if (isAvailableMove && node.id !== currentNodeId) {
                 nodeGroup.style.cursor = 'pointer';
                 nodeGroup.classList.add('map-node-available'); // Add class for potential hover effects via CSS
                 nodeGroup.addEventListener('click', () => this.gameState?.mapManager?.moveToNode(node.id));
             } else {
                 nodeGroup.style.cursor = 'default';
                 if (node.id !== currentNodeId && !node.visited) { nodeGroup.style.opacity = 0.5; } // Dim future unavailable nodes
                 else { nodeGroup.style.opacity = 1; }
             }
             // Tooltips
             nodeGroup.addEventListener('mouseover', (event) => { let tt = `${node.type.toUpperCase()}${node.visited ? ' (Visited)' : ''}`; if(node.id === currentNodeId) tt += " (Current)"; else if (!isAvailableMove && !node.visited) tt += " (Unavailable)"; this.showTooltip(tt, event.clientX, event.clientY); });
             nodeGroup.addEventListener('mouseout', () => this.hideTooltip());
             nodeGroup.addEventListener('mousemove', (event) => this.updateTooltipPosition(event.clientX, event.clientY));
             mapSvg.appendChild(nodeGroup);
        });
        mapContainer.appendChild(mapSvg);
    }

     /** Updates player info on the map screen */
     updatePlayerMapInfo(player, floor) {
        const infoEl = this.playerInfoMap; if (!infoEl) return; if (!player || !player.deckManager) { infoEl.innerHTML = "Loading..."; return; };
         // Use innerHTML with spans for easier styling
         infoEl.innerHTML = `
             <span>Floor: ${floor}</span><span class="info-divider">|</span>
             <span>Integrity: ${player.currentIntegrity} / ${player.maxIntegrity}</span><span class="info-divider">|</span>
             <span>Insight (Run): ${player.insightThisRun} <i class='fas fa-brain insight-icon'></i></span><span class="info-divider">|</span>
             <span>Deck: ${player.deckManager.getMasterDeck().length}</span>`;
     }

    // --- Methods specific to UIManager (Feedback, Modals, Global state) ---

    /** Creates a card DOM element (used by CombatUI, RewardScreen etc.) */
    createCardElement(card) {
        if (!card) return null;
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card'; cardDiv.dataset.cardId = card.id; cardDiv.dataset.conceptId = card.conceptId;
        const cost = document.createElement('div'); cost.className = 'card-cost'; cost.textContent = card.cost;
        const name = document.createElement('div'); name.className = 'card-name'; name.textContent = card.name;
        const description = document.createElement('div'); description.className = 'card-description'; description.innerHTML = card.getEffectDescriptionHtml();
        const type = document.createElement('div'); type.className = 'card-type'; type.textContent = card.cardType;
        cardDiv.appendChild(cost); cardDiv.appendChild(name); cardDiv.appendChild(description); cardDiv.appendChild(type);
        // Add tooltip listener using this (UIManager) instance
        cardDiv.addEventListener('mouseover', (event) => this.showTooltip(card.getTooltipHtml(), event.clientX, event.clientY));
        cardDiv.addEventListener('mouseout', () => this.hideTooltip());
        cardDiv.addEventListener('mousemove', (event) => this.updateTooltipPosition(event.clientX, event.clientY));
        return cardDiv;
    }

    /** Shows notification */
    showNotification(message, duration = 3000) {
        if (!this.notificationArea) { console.log("Notify:", message); return; }
        const el = document.createElement('div'); el.className = 'notification-message'; el.innerHTML = message;
        this.notificationArea.appendChild(el); setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 500); }, duration);
    }

    /** Shows action feedback */
    showActionFeedback(message, type = 'info', duration = 1500) {
        if (!this.actionFeedbackArea) { console.log(`Feedback (${type}):`, message); return; }
        const el = document.createElement('div'); el.className = `action-feedback feedback-${type}`; el.textContent = message;
        this.actionFeedbackArea.prepend(el); if (this.actionFeedbackArea.children.length > 3) { this.actionFeedbackArea.lastChild.remove(); }
        setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 500); }, duration);
    }

    /** Highlights or removes highlight from an enemy (called by CombatUI). */
    highlightEnemy(enemyInstanceId, highlighted = true) {
        this.enemyArea?.querySelectorAll('.enemy-display').forEach(el => {
             if (el.dataset.enemyId === enemyInstanceId) {
                 if(highlighted) el.classList.add('highlighted-enemy');
                 else el.classList.remove('highlighted-enemy');
             }
         });
    }

    /** Clears all enemy highlights and targeting styles. */
    clearEnemyHighlights() {
        this.enemyArea?.querySelectorAll('.enemy-display').forEach(el => {
            el.classList.remove('highlighted-enemy', 'targeted');
            el.style.borderColor = '#ccc'; // Reset border
        });
    }

    // --- Tooltip Methods ---
    showTooltip(content, x, y) { if (!this.tooltipElement) return; this.tooltipElement.innerHTML = content; this.tooltipElement.style.display = 'block'; this.updateTooltipPosition(x, y); }
    hideTooltip() { if (!this.tooltipElement) return; this.tooltipElement.style.display = 'none'; }
    updateTooltipPosition(x, y) { /* ... keep boundary check logic ... */
         if (!this.tooltipElement || this.tooltipElement.style.display === 'none') return; const offsetX = 15; const offsetY = 15;
         const tooltipRect = this.tooltipElement.getBoundingClientRect(); const containerRect = this.gameContainer.getBoundingClientRect(); let top = y + offsetY; let left = x + offsetX;
         // Adjust position to stay within window bounds
         if (left + tooltipRect.width > window.innerWidth - 10) left = x - tooltipRect.width - offsetX;
         if (top + tooltipRect.height > window.innerHeight - 10) top = y - tooltipRect.height - offsetY;
         if (left < 10) left = 10; if (top < 10) top = 10;
         this.tooltipElement.style.left = `${left}px`; this.tooltipElement.style.top = `${top}px`;
    }

    // --- Modal Methods ---
    showModal(text, choices = []) { if (!this.modalPopup) return; this.modalText.innerHTML = text; this.modalChoices.innerHTML = ''; if (choices.length === 0) { const okBtn = document.createElement('button'); okBtn.textContent = 'OK'; okBtn.onclick = () => this.hideModal(); this.modalChoices.appendChild(okBtn); } else { choices.forEach(choice => { const btn = document.createElement('button'); btn.textContent = choice.text; btn.onclick = () => { this.hideModal(); if (choice.callback) choice.callback(); }; this.modalChoices.appendChild(btn); }); } this.modalPopup.style.display = 'block'; }
    hideModal() { if (!this.modalPopup) return; this.modalPopup.style.display = 'none'; this.modalText.innerHTML = ''; this.modalChoices.innerHTML = ''; }

    // --- Card Selection Modal ---
    showCardSelectionModal(cardsToShow, onSelectCallback, title = "Select a Card") {
        if (!this.cardSelectionModal || !this.cardSelectionGrid || !this.cardSelectionTitle || !this.gameState) { onSelectCallback(null); return; }
        this._currentCardSelectionCallback = onSelectCallback; this.cardSelectionTitle.textContent = title; this.cardSelectionGrid.innerHTML = '';
        if (cardsToShow.length === 0) { this.cardSelectionGrid.innerHTML = '<p>No options available.</p>'; }
        else { cardsToShow.forEach(card => { const cardElement = this.createCardElement(card); cardElement.style.margin = '5px'; cardElement.onclick = () => this.hideCardSelectionModal(false, card); this.cardSelectionGrid.appendChild(cardElement); }); }
        this.cardSelectionModal.style.display = 'block';
    }
    hideCardSelectionModal(cancelled = true, selectedCard = null) {
        if (!this.cardSelectionModal) return; this.cardSelectionModal.style.display = 'none';
        if (this._currentCardSelectionCallback) { if (cancelled) { this._currentCardSelectionCallback(null); } else { this._currentCardSelectionCallback(selectedCard); } }
        this._currentCardSelectionCallback = null;
    }

    // --- Node Screen Rendering (Reward, Shop, Rest) ---
    showRewardScreen(rewards) {
        if (!this.rewardScreen || !this.gameState || !this.gameState.player) { if (rewards.onComplete) rewards.onComplete(); return; }
        if (this.rewardInsightText) this.rewardInsightText.innerHTML = `Insight Gained: ${rewards.insight || 0} <i class='fas fa-brain insight-icon'></i>`;
        let choicesExist = false;
        // Card Choices
        if (this.rewardCardsArea) {
            this.rewardCardsArea.innerHTML = '<h3>Choose a Concept:</h3>';
            if (rewards.cardChoices?.length > 0) {
                 choicesExist = true;
                 rewards.cardChoices.forEach(cardId => { const card = new Card(cardId); if (card.conceptId !== -1) { const el = this.createCardElement(card); el.onclick = () => { this.gameState.player.addCardToDeck(cardId); this.rewardCardsArea.innerHTML = `<p>Acquired: ${card.name}</p>`; this.rewardArtifactsArea.innerHTML = ''; if(this.rewardSkipButton) this.rewardSkipButton.textContent = 'Continue'; }; this.rewardCardsArea.appendChild(el); } });
            } else { this.rewardCardsArea.innerHTML += '<p>None found.</p>'; }
        }
        // Artifact Choices (Show only if no cards offered?) Let's allow both for now.
        if (this.rewardArtifactsArea) {
             this.rewardArtifactsArea.innerHTML = '<h3>Choose a Relic:</h3>';
             if (rewards.artifactChoices?.length > 0) {
                  choicesExist = true;
                  rewards.artifactChoices.forEach(artifactId => { const artifact = new Artifact(artifactId); if (artifact.id !== 'error_artifact') { const el = document.createElement('div'); el.innerHTML = artifact.getDisplayHtml(); el.classList.add('artifact-display', 'clickable-reward'); el.onclick = () => { this.gameState.player.addArtifact(artifactId); this.rewardArtifactsArea.innerHTML = `<p>Acquired: ${artifact.name}</p>`; /* Clear card choices too? Maybe not. */ if(this.rewardSkipButton) this.rewardSkipButton.textContent = 'Continue'; }; this.rewardArtifactsArea.appendChild(el); } });
             } else { this.rewardArtifactsArea.innerHTML += '<p>None found.</p>'; }
        }
        // Skip/Continue Button
        if (this.rewardSkipButton) { this.rewardSkipButton.textContent = choicesExist ? 'Skip / Continue' : 'Continue'; this.rewardSkipButton.onclick = () => rewards.onComplete(); }
        this.showScreen('rewardScreen');
    }
    renderShop(shopInventory, playerInsight) {
         if (!this.shopScreen || !this.gameState?.player) return;
         if(this.shopInsightDisplay) this.shopInsightDisplay.innerHTML = `Insight: ${playerInsight} <i class='fas fa-brain insight-icon'></i>`;
         // Cards
         if(this.shopCards) { /* ... keep card rendering logic ... */
             this.shopCards.innerHTML = '<h3>Concepts:</h3>'; if (shopInventory.cards.length === 0) this.shopCards.innerHTML += "<p>Sold out!</p>";
             shopInventory.cards.forEach((item) => { const card = new Card(item.cardId); if (card.conceptId === -1) return; const shopItemDiv = document.createElement('div'); shopItemDiv.className = 'shop-item card-item'; shopItemDiv.appendChild(this.createCardElement(card)); const priceButton = document.createElement('button'); priceButton.textContent = `Buy (${item.cost})`; priceButton.disabled = item.purchased || playerInsight < item.cost; if(!item.purchased) priceButton.onclick = () => this.gameState.handleShopPurchase('card', item.cardId); else priceButton.textContent = "Bought"; shopItemDiv.appendChild(priceButton); this.shopCards.appendChild(shopItemDiv); });
         }
         // Artifacts
         if(this.shopArtifacts){ /* ... keep artifact rendering logic ... */
             this.shopArtifacts.innerHTML = '<h3>Relics:</h3>'; if (shopInventory.artifacts.length === 0) this.shopArtifacts.innerHTML += "<p>Sold out!</p>";
              shopInventory.artifacts.forEach((item) => { const artifact = new Artifact(item.artifactId); if (artifact.id === 'error_artifact') return; const shopItemDiv = document.createElement('div'); shopItemDiv.className = 'shop-item artifact-item'; const artifactEl = document.createElement('div'); artifactEl.innerHTML = artifact.getDisplayHtml(); shopItemDiv.appendChild(artifactEl); const priceButton = document.createElement('button'); priceButton.textContent = `Buy (${item.cost})`; priceButton.style.marginLeft = '10px'; priceButton.disabled = item.purchased || playerInsight < item.cost; if (!item.purchased) priceButton.onclick = () => this.gameState.handleShopPurchase('artifact', item.artifactId); else priceButton.textContent = "Bought"; shopItemDiv.appendChild(priceButton); this.shopArtifacts.appendChild(shopItemDiv); });
         }
         // Removal
         if(this.shopRemoveService){ /* ... keep removal rendering logic ... */
              this.shopRemoveService.innerHTML = '<h3>Refinement:</h3>'; const removeButton = document.createElement('button'); removeButton.textContent = `Let Go (${shopInventory.removalCost})`; removeButton.disabled = !shopInventory.removalAvailable || playerInsight < shopInventory.removalCost || (this.gameState.player.deckManager?.masterDeck.length <= 5); if(this.gameState.player.deckManager?.masterDeck.length <= 5) removeButton.title = "Deck too small"; removeButton.onclick = () => this.gameState.handleShopPurchase('remove'); this.shopRemoveService.appendChild(removeButton); if (!shopInventory.removalAvailable) { const usedText = document.createElement('span'); usedText.textContent = ' (Used)'; this.shopRemoveService.appendChild(usedText); }
         }
     }
    renderRestSite(restSiteState, player) {
         if (!this.restSiteScreen || !player) return;
         const used = restSiteState.usedOption;
         if (this.restHealButton) this.restHealButton.disabled = used || player.currentIntegrity >= player.maxIntegrity;
         if (this.restMeditateButton) this.restMeditateButton.disabled = used || !player.deckManager.getMasterDeck().some(c => !c.upgraded);
         if (this.restJournalButton) this.restJournalButton.disabled = used || player.deckManager.masterDeck.length <= 5;
         if (this.leaveRestSiteButton) this.leaveRestSiteButton.textContent = used ? "Continue" : "Leave";
         if (this.restUsedIndicator) this.restUsedIndicator.textContent = used ? "You feel rested." : "Choose one action:";
     }

    // --- Meta Screen Rendering ---
    renderMetaScreen() {
        if (!this.metaContent || !this.metaProgression) { if(this.metaContent) this.metaContent.innerHTML = "<p>Loading...</p>"; return; }
        const mp = this.metaProgression; let html = `<h3>Meta Progress</h3>`;
        html += `<p>Total Insight: ${mp.totalInsight} <i class='fas fa-brain insight-icon'></i></p>`;
        html += `<p>Highest Ascension Beaten: ${mp.highestAscensionBeat < 0 ? 'None' : mp.highestAscensionBeat}</p>`;
        // Safely access lengths, default to 0 if data not loaded
        const totalConcepts = Data?.concepts?.length || 0;
        const totalArtifacts = ARTIFACT_TEMPLATES ? Object.keys(ARTIFACT_TEMPLATES).length : 0;
        html += `<p>Concepts Unlocked: ${mp.unlockedConceptIds.size} / ${totalConcepts}</p>`;
        html += `<p>Artifacts Unlocked: ${mp.unlockedArtifactIds.size} / ${totalArtifacts}</p>`;
        html += `<h4>Permanent Upgrades:</h4><ul>`; let upgradesFound = false;
        // Safely iterate upgrades
        const upgrades = mp.permanentUpgrades || mp.getDefaultUpgrades();
        for (const key in upgrades) { if (key === 'attunementBonus') { for (const elemKey in upgrades.attunementBonus) { const bonus = upgrades.attunementBonus[elemKey]; if (bonus > 0) { html += `<li>+${bonus} ${elemKey} Attunement</li>`; upgradesFound = true; } } } else { const bonus = upgrades[key]; if (bonus > 0) { const readableKey = key.replace(/([A-Z])/g, ' $1').replace(/Bonus$/, '').trim(); html += `<li>+${bonus} ${readableKey}</li>`; upgradesFound = true; } } }
        if (!upgradesFound) html += `<li>None yet!</li>`; html += `</ul>`;
        html += `<hr><h4>Actions:</h4>`;
        html += `<button id="resetMetaButton">Reset ALL Progress</button>`; // Add reset button
        this.metaContent.innerHTML = html;
        // Add listener for reset button dynamically
        const resetButton = this.metaContent.querySelector('#resetMetaButton');
        if (resetButton) { resetButton.onclick = () => this.metaProgression?.resetProgress(); }
    }

    // --- Node Color/Icon Helpers ---
     getNodeColor(type) { switch (type) { case 'combat': return '#c0392b'; case 'elite': return '#8e44ad'; case 'event': return '#2980b9'; case 'rest': return '#27ae60'; case 'shop': return '#f39c12'; case 'boss': return '#e74c3c'; case 'start': return '#bdc3c7'; default: return '#7f8c8d'; } }
     getNodeIcon(type) { switch (type) { case 'combat': return '\uf06d'; case 'elite': return '\uf005'; case 'event': return '\uf059'; case 'rest': return '\uf183'; case 'shop': return '\uf07a'; case 'boss': return '\uf188'; case 'start': return '\uf007'; default: return '?'; } }

} // End of UIManager class
