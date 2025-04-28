// js/ui/CombatUI.js

// Import base classes if needed for type hinting or static methods
import { Enemy } from '../combat/Enemy.js';
import { Player } from '../core/Player.js'; // May not be needed if player object is always passed in
// Import status definitions for tooltips/icons
import { getStatusEffectDefinition } from '../combat/StatusEffects.js';

// Import constants if needed (e.g., threshold from Player.js, though better passed in)
// Defined directly here for simplicity, or could be imported/passed
const ROLE_FOCUS_THRESHOLD = 10;


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
        this.playerArea = document.getElementById('playerArea'); // Container for player stats/statuses/meter
        this.handArea = document.getElementById('handArea');
        this.deckInfoArea = document.getElementById('deckInfo'); // Container for deck/discard/exhaust counts
        this.deckCountElement = document.getElementById('deckCountElement');
        this.discardCountElement = document.getElementById('discardCountElement');
        this.exhaustCountElement = document.getElementById('exhaustCountElement'); // Reference added
        this.endTurnButton = document.getElementById('endTurnButton');

        // Player Stats Elements (within #playerArea)
        this.playerHPElement = document.getElementById('playerHP');
        this.playerFocusElement = document.getElementById('playerFocus');
        this.playerBlockElement = document.getElementById('playerBlock');
        this.playerStatusesElement = document.getElementById('playerStatusesCombat'); // Within #playerArea

        // Validate required elements
        if (!this.combatScreen || !this.enemyArea || !this.playerArea || !this.handArea || !this.endTurnButton ||
            !this.playerHPElement || !this.playerFocusElement || !this.playerBlockElement || !this.playerStatusesElement ||
            !this.deckCountElement || !this.discardCountElement || !this.exhaustCountElement || !this.deckInfoArea) {
            console.error("CombatUI Error: One or more required combat screen elements not found in the DOM. Check IDs in index.html.");
            // Depending on severity, could throw error or just log warning
        }

        this._setupCombatListeners();
        console.log("CombatUI initialized.");
    }

    /** Setup listeners specific to combat elements */
    _setupCombatListeners() {
        if (this.endTurnButton) {
            this.endTurnButton.onclick = () => {
                // Prevent clicking if not player's turn or combat inactive
                if (!this.gameState?.combatManager?.playerTurn || !this.gameState?.combatManager?.isActive) return;
                this.gameState?.combatManager?.endPlayerTurn();
            };
        }
         // Add listener to clear target if clicking outside an enemy
         if (this.combatScreen) {
              this.combatScreen.addEventListener('click', (event) => {
                   // Check if the click target is NOT an enemy display or something inside it
                   if (this.gameState?.combatManager?.playerTurn && !event.target.closest('.enemy-display')) {
                        // console.log("Clicked outside enemy, clearing target."); // Can be noisy
                        this.gameState?.combatManager?.setSelectedTarget(null); // Clear target
                        this.clearEnemyHighlights(); // Visually clear highlights
                   }
              }, true); // Use capture phase to potentially catch clicks earlier if needed
         }
    }

    /**
     * Updates the entire combat UI based on the current GameState.
     * Called by UIManager.
     * @param {Player} player
     * @param {Enemy[]} enemies
     * @param {boolean} isPlayerTurn
     */
    update(player, enemies, isPlayerTurn) {
        if (!this.combatScreen || !player || !enemies) {
             console.error("CombatUI Update failed: Missing screen, player, or enemies.");
             return;
        }
        // Update player stats and statuses
        this.updatePlayerInfo(player);
        // Render enemies and their intents/statuses
        this.renderEnemies(enemies, isPlayerTurn);
        // Render the player's hand (Passing player needed for RF check)
        this.renderHand(player.deckManager.hand, isPlayerTurn, player);
        // Update deck/discard/exhaust counts
        this.updateDeckDiscardCounts(player.deckManager);
        // Enable/disable end turn button
        this.updateEndTurnButton(isPlayerTurn);
        // Style turn indicator borders
        this.styleTurnIndicator(isPlayerTurn);
        // Re-setup drop zones AFTER rendering enemies/player area
        this._setupDropZones();
        // Note: Attunement meter update is handled by UIManager calling its own method.
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
        // Note: Attunement meter update is handled by UIManager
    }

    /** Updates Deck/Discard/Exhaust counts */
    updateDeckDiscardCounts(deckManager) {
        if (!deckManager) return;
        if (this.deckCountElement) this.deckCountElement.textContent = `Deck: ${deckManager.getDrawPileCount()}`;
        if (this.discardCountElement) this.discardCountElement.textContent = `Discard: ${deckManager.getDiscardPileCount()}`;
        if (this.exhaustCountElement) {
            // Ensure the exhaust count element is updated
            this.exhaustCountElement.textContent = `Exhaust: ${deckManager.getExhaustPileCount()}`;
        }
    }

    /** Updates End Turn button state */
    updateEndTurnButton(isPlayerTurn) {
        if (this.endTurnButton) {
            // Disable if not player turn OR if combat is not active
            this.endTurnButton.disabled = !isPlayerTurn || !this.gameState?.combatManager?.isActive;
        }
    }

    /** Styles elements based on whose turn it is */
    styleTurnIndicator(isPlayerTurn) {
        const playerBorderColor = isPlayerTurn ? 'var(--color-accent-blue)' : 'var(--color-border)';
        const enemyBorderColor = !isPlayerTurn ? 'var(--color-accent-primary)' : 'var(--color-border)';

        if (this.playerArea) this.playerArea.style.borderColor = playerBorderColor;
        if (this.enemyArea) this.enemyArea.style.borderColor = enemyBorderColor;
    }

    /** Renders all current enemies */
    renderEnemies(enemies, isPlayerTurn) {
        if (!this.enemyArea) return;
        this.enemyArea.innerHTML = ''; // Clear previous

        const currentTargetId = this.gameState?.combatManager?.currentTarget?.id;

        enemies.forEach((enemy) => {
            if (!enemy) return;

            const enemyDiv = document.createElement('div');
            enemyDiv.className = 'enemy-display';
            enemyDiv.dataset.enemyId = enemy.id; // Use instance ID
            enemyDiv.style.opacity = enemy.currentHp <= 0 ? 0.4 : 1;
            enemyDiv.style.cursor = (enemy.currentHp > 0 && isPlayerTurn) ? 'crosshair' : 'default';

            // Highlighting for Targeting
            const isTargeted = currentTargetId === enemy.id;
             if (isTargeted) {
                 enemyDiv.classList.add('targeted'); // Add class for specific target styling
             } else {
                  enemyDiv.classList.remove('targeted');
             }

            const intent = document.createElement('div'); intent.className = 'enemy-intent'; intent.innerHTML = this.getIntentText(enemy.currentIntent, enemy); intent.style.minHeight = '1.2em';
            const name = document.createElement('div'); name.className = 'enemy-name'; name.textContent = enemy.name;
            const hpBarOuter = document.createElement('div'); hpBarOuter.className = 'enemy-hp-bar-outer';
            const hpBarInner = document.createElement('div'); hpBarInner.className = 'enemy-hp-bar-inner';
            hpBarInner.style.width = `${Math.max(0, (enemy.currentHp / enemy.maxHp) * 100)}%`;
            const hpText = document.createElement('div'); hpText.className = 'enemy-hp-text';
            hpText.textContent = `${enemy.currentHp} / ${enemy.maxHp}`;
            hpBarOuter.appendChild(hpBarInner); hpBarOuter.appendChild(hpText);
            const block = document.createElement('div'); block.className = 'enemy-block'; block.textContent = enemy.currentBlock > 0 ? `Block: ${enemy.currentBlock}` : ''; block.style.minHeight = '1.2em';
            const statuses = document.createElement('div'); statuses.className = 'enemy-statuses'; statuses.style.minHeight = '1.5em';
            this.renderStatuses(enemy.activeStatusEffects, statuses, 'enemy');

            enemyDiv.appendChild(intent); // Intent on top
            enemyDiv.appendChild(name);
            enemyDiv.appendChild(hpBarOuter);
            enemyDiv.appendChild(block);
            enemyDiv.appendChild(statuses);

            // Tooltip Listener
            enemyDiv.addEventListener('mouseover', (event) => { let ttText = `${enemy.name} | HP: ${enemy.currentHp}/${enemy.maxHp}`; if (enemy.currentBlock > 0) ttText += ` | Block: ${enemy.currentBlock}`; this.uiManager.showTooltip(ttText, event.clientX, event.clientY); });
            enemyDiv.addEventListener('mouseout', () => this.uiManager.hideTooltip());
            enemyDiv.addEventListener('mousemove', (event) => this.uiManager.updateTooltipPosition(event.clientX, event.clientY));

            // Click Listener for Targeting (only if alive and player's turn)
            if (enemy.currentHp > 0 && isPlayerTurn) {
                 enemyDiv.addEventListener('click', (e) => {
                      e.stopPropagation(); // Prevent click bubbling to combatScreen listener
                     this.gameState?.combatManager?.setSelectedTarget(enemy);
                     // Re-render enemies immediately to show target highlight change
                     // Note: Calling renderEnemies directly might be slightly inefficient, but ensures immediate feedback
                     this.renderEnemies(this.gameState?.combatManager?.enemies || [], true);
                 });
             }

            this.enemyArea.appendChild(enemyDiv);
        });
    }

    /** Renders status effects into a container element */
    renderStatuses(activeEffects, containerElement, targetType = 'player') {
        if (!containerElement) return;
        containerElement.innerHTML = ''; // Clear previous content

        if (activeEffects && activeEffects.length > 0) {
             activeEffects.forEach(effect => {
                 // Skip internal flags like Core Traits
                 if (effect.id.startsWith('CoreTrait_')) return;

                 const definition = getStatusEffectDefinition(effect.id);
                 if (!definition) { /* ... handle unknown status ... */ console.warn(`Status definition missing for ID: ${effect.id}`); const effectSpan = document.createElement('span'); effectSpan.className = `status-effect ${targetType}-status status-unknown`; effectSpan.innerHTML = `<i class="fa-solid fa-question-circle"></i> ${effect.id}`; effectSpan.title = `Unknown Status: ${effect.id}`; containerElement.appendChild(effectSpan); return; }
                 const effectSpan = document.createElement('span');
                 effectSpan.className = `status-effect ${targetType}-status status-${effect.id.toLowerCase()}`;
                 let displayValue = ""; const isStacking = definition.stacking; const isDurationBased = definition.durationBased; const isInfinite = effect.duration === 99;
                 if (isStacking && effect.amount > 1) { displayValue = effect.amount; }
                 else if (!isStacking && isDurationBased && !isInfinite && effect.duration > 0) { displayValue = effect.duration; }
                 effectSpan.innerHTML = `<i class="${definition.icon || 'fa-solid fa-circle-question'}"></i>${displayValue ? ` ${displayValue}` : ''}`;
                 effectSpan.title = `${definition.name}: ${definition.description}`; // Tooltip
                 containerElement.appendChild(effectSpan);
             });
        }
        // Optional: Display 'None' if no statuses (removed for cleaner look)
    }

    /** Generates descriptive text/HTML for an enemy's intent. */
    getIntentText(intent, enemy) {
        if (!intent || !enemy || enemy.currentHp <= 0 || enemy.hasStatus('Stunned')) { return '<i class="fas fa-question"></i> ???'; }
        let text = ''; let icon = 'fa-solid fa-question'; let value = '';
        const baseIntentValue = intent.baseValue ?? intent.attackValue ?? intent.blockValue ?? 0;
        let predictedValue = baseIntentValue;
        try { if (intent.type.includes('attack')) { predictedValue = enemy.applyModifiers('damageDealt', baseIntentValue); icon = 'fa-solid fa-gavel'; value = predictedValue; if(intent.status && intent.statusDuration > 0) text += ` (+${intent.status})`; } else if (intent.type.includes('block')) { predictedValue = enemy.applyModifiers('blockGain', baseIntentValue); icon = 'fa-solid fa-shield-halved'; value = predictedValue; } else { switch (intent.type) { case 'multi_attack': predictedValue = enemy.applyModifiers('damageDealt', baseIntentValue); icon = 'fa-solid fa-gavel'; value = `${predictedValue} x ${intent.count || '?'}`; if(intent.status && intent.applyStatusOnce) text += ` (+${intent.status})`; break; case 'attack_block': const attackVal = enemy.applyModifiers('damageDealt', intent.attackValue || 0); const blockVal = enemy.applyModifiers('blockGain', intent.blockValue || 0); icon = 'fa-solid fa-gavel'; value = `${attackVal} & <i class="fas fa-shield-halved"></i> ${blockVal}`; break; case 'debuff': icon = 'fa-solid fa-arrow-down'; value = intent.status || 'Debuff'; text = ` (${intent.duration || 1}t)`; break; case 'buff': case 'power_up': icon = 'fa-solid fa-arrow-up'; value = intent.status || 'Buff'; if (intent.amount > 1 && ['Strength', 'Dexterity'].includes(intent.status)) text = ` +${intent.amount}`; break; case 'special': icon = 'fa-solid fa-star'; value = intent.description || intent.id || 'Special'; break; case 'none': icon = 'fa-solid fa-circle-minus'; value = intent.description || 'Waiting'; break; default: value = 'Unknown Action'; } } } catch (error) { console.error(`Error calculating intent text for ${enemy.name}:`, error, intent); return '<i class="fas fa-exclamation-triangle"></i> Error'; }
        return `<i class="${icon}"></i> ${value}${text}`;
    }


    /** Renders the player's hand with fanning layout (MODIFIED for RF Limelight) */
    renderHand(handCards, isPlayerTurn, player) { // Added player parameter
        if (!this.handArea || !this.uiManager || !player) { // Ensure player is available
             console.error("Cannot render hand: Missing elements or player data.");
             return;
        }
        this.handArea.innerHTML = ''; // Clear previous hand
        // const player = this.gameState.player; // Get player reference directly
        const currentFocus = player.currentFocus ?? 0;
        const playerRF = player.attunements?.RoleFocus ?? 0; // Get player RoleFocus

        const numCards = handCards.length; if (numCards === 0) return; // Exit if no cards
        // --- Layout Calculation Logic ---
        const containerWidth = this.handArea.clientWidth; const cardWidth = 125; // Use card width from CSS potentially
        const maxOverlapRatio = 0.6; const minOverlapRatio = 0.1; const overlapThreshold = 6;
        const overlapRatio = numCards > overlapThreshold ? minOverlapRatio + (maxOverlapRatio - minOverlapRatio) * Math.min(1, (numCards - overlapThreshold) / 5) : minOverlapRatio;
        const overlapPixels = cardWidth * overlapRatio; const cardSpacing = cardWidth - overlapPixels;
        const totalHandWidth = cardWidth + (numCards - 1) * cardSpacing; const maxRenderWidth = containerWidth * 0.95;
        let finalSpacing = cardSpacing; let finalTotalWidth = totalHandWidth;
        if (totalHandWidth > maxRenderWidth) { finalSpacing = (maxRenderWidth - cardWidth) / (numCards - 1 || 1); finalTotalWidth = maxRenderWidth; }
        const startX = (containerWidth - finalTotalWidth) / 2;
        const maxAngle = 30; const anglePerCard = numCards > 1 ? Math.min(maxAngle / (numCards - 1), 8) : 0;
        const startAngle = numCards > 1 ? - (numCards - 1) * anglePerCard / 2 : 0;
        const arcLift = 30; // How much cards lift in the center
        // --- End Layout Calculation ---

        handCards.forEach((card, index) => {
            if (!card) { console.warn("renderHand encountered undefined card at index", index); return; }
            const cardElement = this.uiManager.createCardElement(card); // Use UIManager to create element
            if (!cardElement) return; // Skip if card element failed creation
            cardElement.dataset.handIndex = index; // Store index if needed

            // --- Positioning Logic ---
            const currentAngle = startAngle + index * anglePerCard; const rotation = currentAngle;
            const normalizedIndex = numCards > 1 ? (index / (numCards - 1)) - 0.5 : 0; // -0.5 to 0.5
            const yOffset = arcLift * (1 - Math.abs(normalizedIndex * 2)); // Adjust lift calculation slightly for smoother arc
            cardElement.style.position = 'absolute';
            cardElement.style.left = `${startX + index * finalSpacing}px`;
            cardElement.style.bottom = `${10 + yOffset}px`; // Base position + lift
            cardElement.style.transform = `rotate(${rotation}deg)`;
            cardElement.style.zIndex = 10 + index; // Base Z-index
            // --- End Positioning Logic ---

            // Hover effects managed by CSS (#handArea .card:hover)

            // Draggability and affordability check
             let canPlay = false;
             if (isPlayerTurn && card.cost !== null) { // Check if card is potentially playable
                 const cardCost = card.cost; // Base cost for affordability check
                 if (currentFocus >= cardCost) {
                      canPlay = true;
                      this._attachCardDragListeners(cardElement, card);
                      cardElement.style.filter = 'none';
                      cardElement.style.cursor = 'grab';
                 } else {
                      cardElement.style.filter = 'grayscale(70%) brightness(0.8)';
                      cardElement.style.cursor = 'not-allowed';
                      cardElement.draggable = false;
                 }
             } else { // Not player turn or unplayable card (cost null)
                cardElement.draggable = false;
                cardElement.style.cursor = 'default';
                if (!isPlayerTurn && card.cost !== null) {
                     cardElement.style.filter = 'grayscale(70%) brightness(0.8)';
                } else {
                     cardElement.style.filter = 'none'; // Keep unplayable cards undimmed unless enemy turn
                }
             }

             // --- Add RF Limelight Visual ---
             // Check if player meets threshold AND the card is a Power card
             if (isPlayerTurn && card.cardType === 'Power' && playerRF >= ROLE_FOCUS_THRESHOLD) {
                 cardElement.classList.add('rf-limelight-active'); // Add class for CSS styling
                 cardElement.title += " (RoleFocus Limelight)"; // Add indicator to tooltip
             } else {
                  cardElement.classList.remove('rf-limelight-active'); // Ensure class is removed otherwise
             }
             // --- End RF Limelight Visual ---

            this.handArea.appendChild(cardElement);
        });
    }


     /** Attaches drag listeners to a card element */
     _attachCardDragListeners(cardElement, card) {
         if (!cardElement || !card) return;
         cardElement.draggable = true; // Already checked affordability before calling this

         cardElement.ondragstart = (event) => {
             if (!this.gameState?.combatManager?.playerTurn || (card.cost !== null && (this.gameState?.player?.currentFocus ?? 0) < card.cost)) { event.preventDefault(); return; }
             this.uiManager.draggedCard = card; this.uiManager.draggedCardElement = cardElement; try { event.dataTransfer.setData('text/plain', card.id); event.dataTransfer.effectAllowed = 'move'; } catch (e) { console.error("Error setting drag data:", e); }
             cardElement.style.opacity = '0.5'; cardElement.style.cursor = 'grabbing'; document.body.classList.add('dragging-card');
         };
         cardElement.ondragend = (event) => {
             if (this.uiManager.draggedCardElement) { this.uiManager.draggedCardElement.style.opacity = '1'; this.uiManager.draggedCardElement.style.cursor = 'grab'; }
             this.uiManager.draggedCard = null; this.uiManager.draggedCardElement = null; this.clearDropZoneHighlights(); document.body.classList.remove('dragging-card');
         };
     }

    /** Sets up drop zones on enemies/player area */
     _setupDropZones() {
        if (!this.enemyArea || !this.playerArea || !this.gameState?.combatManager || !this.uiManager) return;
         const combatManager = this.gameState.combatManager; const uiManager = this.uiManager;
        const dropHandler = (event, target = null) => { event.preventDefault(); event.currentTarget.classList.remove('drag-over'); this.clearDropZoneHighlights(event.currentTarget); const draggedCard = uiManager.draggedCard; if (draggedCard) { combatManager.handlePlayerCardPlay(draggedCard, target instanceof Enemy ? target : null); } uiManager.draggedCard = null; uiManager.draggedCardElement = null; };
        const dragOverHandler = (event) => { event.preventDefault(); const draggedCard = uiManager.draggedCard; if (!draggedCard) { event.dataTransfer.dropEffect = 'none'; return; } const currentTargetElement = event.currentTarget; const targetIsPlayerArea = currentTargetElement === this.playerArea; let enemyTarget = null; if (!targetIsPlayerArea) { const enemyId = currentTargetElement.dataset.enemyId; enemyTarget = combatManager.enemies.find(e => e.id === enemyId); } let isValidTarget = false; if (targetIsPlayerArea) { isValidTarget = !draggedCard.requiresTarget || draggedCard.targetType === 'self'; } else if (enemyTarget) { isValidTarget = draggedCard.requiresTarget && draggedCard.targetType === 'enemy' && enemyTarget.currentHp > 0; } if (isValidTarget) { event.dataTransfer.dropEffect = 'move'; currentTargetElement.classList.add('drag-over'); if (enemyTarget) uiManager.highlightEnemy(enemyTarget.id, true); } else { event.dataTransfer.dropEffect = 'none'; currentTargetElement.classList.remove('drag-over'); if (enemyTarget) uiManager.highlightEnemy(enemyTarget.id, false); } };
        const dragLeaveHandler = (event) => { event.currentTarget.classList.remove('drag-over'); const targetIsPlayerArea = event.currentTarget === this.playerArea; if (!targetIsPlayerArea) { const enemyId = event.currentTarget.dataset.enemyId; uiManager.highlightEnemy(enemyId, false); } };
        this.enemyArea.querySelectorAll('.enemy-display').forEach(enemyEl => { const enemyId = enemyEl.dataset.enemyId; const enemy = combatManager.enemies.find(e => e.id === enemyId); if (enemy && enemy.currentHp > 0) { enemyEl.ondragover = dragOverHandler; enemyEl.ondrop = (event) => dropHandler(event, enemy); enemyEl.ondragleave = dragLeaveHandler; } else { enemyEl.ondragover = null; enemyEl.ondrop = null; enemyEl.ondragleave = null; } });
        this.playerArea.ondragover = dragOverHandler; this.playerArea.ondrop = (event) => dropHandler(event, null); this.playerArea.ondragleave = dragLeaveHandler;
     }

     /** Clear highlighting class from drop zones */
     clearDropZoneHighlights(excludeElement = null) {
         this.playerArea?.classList.remove('drag-over');
         this.enemyArea?.querySelectorAll('.enemy-display.drag-over').forEach(el => { if (el !== excludeElement) { el.classList.remove('drag-over'); } });
         if (!this.gameState?.combatManager?.currentTarget) { this.clearEnemyHighlights(); }
     }

     /** Clear ONLY target highlighting class from enemies */
     clearEnemyHighlights() {
        this.enemyArea?.querySelectorAll('.enemy-display').forEach(el => { el.classList.remove('targeted', 'highlighted-enemy'); });
     }

      /** Add/Remove highlight for acting enemy */
      highlightEnemy(enemyInstanceId, highlighted = true) {
        this.enemyArea?.querySelectorAll('.highlighted-enemy').forEach(el => el.classList.remove('highlighted-enemy'));
        const enemyElement = this.enemyArea?.querySelector(`.enemy-display[data-enemy-id="${enemyInstanceId}"]`);
        if (enemyElement) { if (highlighted) enemyElement.classList.add('highlighted-enemy'); }
     }

} // End of CombatUI class
