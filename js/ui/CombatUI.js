// js/ui/CombatUI.js

import { Enemy } from '../combat/Enemy.js';
import { Player } from '../core/Player.js';
// Import status definitions and the NEW tooltip generator
import { getStatusEffectDefinition, getStatusTooltipHtml } from '../combat/StatusEffects.js';

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

        // Player Stats Elements (Ensure these spans wrap the *value* for easier styling)
        // Example modification in index.html needed: <span id="playerHP">HP: <span class="stat-value">.../...</span></span>
        this.playerHPElement = document.getElementById('playerHP')?.querySelector('.stat-value') || document.getElementById('playerHP');
        this.playerFocusElement = document.getElementById('playerFocus')?.querySelector('.stat-value') || document.getElementById('playerFocus');
        this.playerBlockElement = document.getElementById('playerBlock')?.querySelector('.stat-value') || document.getElementById('playerBlock');
        this.playerStatusesElement = document.getElementById('playerStatusesCombat');

        // Find the containers for stats if using the wrapper approach
        this.playerHPContainer = document.getElementById('playerHP');
        this.playerFocusContainer = document.getElementById('playerFocus');
        this.playerBlockContainer = document.getElementById('playerBlock');


        if (!this.combatScreen || !this.enemyArea || !this.playerArea || !this.handArea || !this.endTurnButton || !this.playerHPElement || !this.playerFocusElement || !this.playerBlockElement || !this.playerStatusesElement || !this.deckCountElement || !this.discardCountElement) {
            console.error("CombatUI Error: One or more required combat screen elements not found in the DOM. Check IDs and structure (e.g., stat-value spans).");
            // Fallback references if stat-value spans don't exist
             if (!this.playerHPElement) this.playerHPElement = document.getElementById('playerHP');
             if (!this.playerFocusElement) this.playerFocusElement = document.getElementById('playerFocus');
             if (!this.playerBlockElement) this.playerBlockElement = document.getElementById('playerBlock');
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
        this.updatePlayerInfo(player); // Includes status effect styling for player stats
        this.renderEnemies(enemies, isPlayerTurn); // Includes status effect styling for enemy intent/stats
        this.renderHand(player.deckManager.hand, isPlayerTurn);
        this.updateDeckDiscardCounts(player.deckManager);
        this.updateEndTurnButton(isPlayerTurn);
        this.styleTurnIndicator(isPlayerTurn);
        this._setupDropZones(); // Re-setup drop zones after rendering enemies
    }

    /** Updates player HP, Focus, Block, Statuses, and applies visual feedback */
    updatePlayerInfo(player) {
        if (!player) return;

        // Update Text Content
        if (this.playerHPElement) this.playerHPElement.textContent = `${player.currentIntegrity} / ${player.maxIntegrity}`;
        if (this.playerFocusElement) this.playerFocusElement.textContent = `${player.currentFocus} / ${player.maxFocus}`;
        if (this.playerBlockElement) this.playerBlockElement.textContent = `${player.currentBlock}`;

        // Update Player Status Icons
        if (this.playerStatusesElement) {
            this.renderStatuses(player.activeStatusEffects, this.playerStatusesElement, 'player');
        }

        // Apply Visual Feedback based on Statuses (to the container or value span)
        this._applyStatHighlight(this.playerHPContainer, player.hasStatus('Vulnerable'), 'debuff'); // Example: Vulnerable affects HP indirectly
        this._applyStatHighlight(this.playerBlockContainer, player.hasStatus('Dexterity') || player.hasStatus('Frail'), player.hasStatus('Dexterity') ? 'buff' : (player.hasStatus('Frail') ? 'debuff' : null));
        // Focus doesn't have a direct modifying status in the base set yet

    }

    /** Helper to add/remove highlight classes to stat containers */
    _applyStatHighlight(element, condition, type = 'buff') { // type: 'buff', 'debuff'
        if (!element) return;
        element.classList.remove('stat-buffed', 'stat-debuffed'); // Clear previous
        if (condition && type === 'buff') {
            element.classList.add('stat-buffed');
        } else if (condition && type === 'debuff') {
            element.classList.add('stat-debuffed');
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
        if (this.playerArea) this.playerArea.style.borderColor = isPlayerTurn ? 'var(--color-accent-blue)' : 'var(--color-border)'; // Use accent for player turn
        if (this.enemyArea) this.enemyArea.style.borderColor = !isPlayerTurn ? 'var(--color-accent-primary)' : 'var(--color-border)'; // Use accent for enemy turn
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

            // --- Targeting Highlight ---
            const currentTargetId = this.gameState?.combatManager?.currentTarget?.id;
            const isTargeted = currentTargetId === enemy.id;
             enemyDiv.classList.toggle('targeted', isTargeted); // Use class for styling

            // --- Vulnerable Highlight (on HP bar) ---
             const hpBarOuter = document.createElement('div'); hpBarOuter.className = 'enemy-hp-bar-outer';
             hpBarOuter.classList.toggle('status-affected-vulnerable', enemy.hasStatus('Vulnerable')); // Add class if vulnerable

             const hpBarInner = document.createElement('div'); hpBarInner.className = 'enemy-hp-bar-inner';
             hpBarInner.style.width = `${Math.max(0, (enemy.currentHp / enemy.maxHp) * 100)}%`;
             const hpText = document.createElement('div'); hpText.className = 'enemy-hp-text';
             hpText.textContent = `${enemy.currentHp} / ${enemy.maxHp}`;
             hpBarOuter.appendChild(hpBarInner); hpBarOuter.appendChild(hpText);

             // --- Block Display (Highlight if Player Frail?) - Decided against direct highlight for now
             const block = document.createElement('div'); block.className = 'enemy-block'; block.textContent = enemy.currentBlock > 0 ? `Block: ${enemy.currentBlock}` : ''; block.style.minHeight = '1.2em';

             // --- Intent Display (with modifications) ---
             const intent = document.createElement('div'); intent.className = 'enemy-intent';
             intent.innerHTML = this.getIntentText(enemy.currentIntent, enemy); // Function now adds styling
             intent.style.minHeight = '1.2em';

             // --- Name & Statuses ---
             const name = document.createElement('div'); name.className = 'enemy-name'; name.textContent = enemy.name;
             const statuses = document.createElement('div'); statuses.className = 'enemy-statuses'; statuses.style.minHeight = '1.5em';
             this.renderStatuses(enemy.activeStatusEffects, statuses, 'enemy'); // Uses enhanced tooltips now

            // Append elements in order
            enemyDiv.appendChild(intent); // Intent top
            enemyDiv.appendChild(name);
            enemyDiv.appendChild(hpBarOuter);
            enemyDiv.appendChild(block);
            enemyDiv.appendChild(statuses); // Statuses bottom

            // --- Tooltip for Enemy Frame (Basic Info) ---
             enemyDiv.addEventListener('mouseover', (event) => { let ttText = `${enemy.name} | HP: ${enemy.currentHp}/${enemy.maxHp}`; if (enemy.currentBlock > 0) ttText += ` | Block: ${enemy.currentBlock}`; this.uiManager.showTooltip(ttText, event.clientX, event.clientY); });
             enemyDiv.addEventListener('mouseout', () => this.uiManager.hideTooltip());
             enemyDiv.addEventListener('mousemove', (event) => this.uiManager.updateTooltipPosition(event.clientX, event.clientY));

             // --- Click Listener for Targeting ---
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

    /** Renders status effects into a container element with enhanced tooltips */
    renderStatuses(activeEffects, containerElement, targetType = 'player') {
        if (!containerElement) return;
        containerElement.innerHTML = ''; // Clear previous content

        // Find or create the label span
        let statusLabel = containerElement.querySelector('.status-label');
        if (!statusLabel) {
             statusLabel = document.createElement('span');
             statusLabel.className = 'status-label'; // Add class for styling if needed
             statusLabel.textContent = 'Statuses: ';
             containerElement.appendChild(statusLabel);
        }

        if (activeEffects && activeEffects.length > 0) {
             activeEffects.forEach(effect => {
                 const definition = getStatusEffectDefinition(effect.id);
                 if (!definition || definition.type === 'internal') { // Skip internal statuses
                     // Optionally log warning for non-internal missing defs
                     if (definition?.type !== 'internal') console.warn(`Status definition missing for ID: ${effect.id}`);
                     return;
                 }

                 const effectSpan = document.createElement('span');
                 effectSpan.className = `status-effect ${targetType}-status status-${effect.id.toLowerCase()}`;

                 let displayValue = "";
                 const isStacking = definition.stacking;
                 const isDurationBased = definition.durationBased;

                 // Show amount for stacking, duration for timed (if > 1 and not infinite)
                 if (isStacking && effect.amount > 1) {
                     displayValue = effect.amount;
                 } else if (isDurationBased && effect.duration > 1 && effect.duration !== 99) {
                     displayValue = effect.duration;
                 }

                 effectSpan.innerHTML = `<i class="${definition.icon || 'fa-solid fa-circle-question'}"></i>${displayValue ? ` ${displayValue}` : ''}`;

                 // --- Enhanced Tooltip Implementation ---
                 effectSpan.addEventListener('mouseover', (event) => {
                     const tooltipContent = getStatusTooltipHtml(effect); // Use the new utility function
                     this.uiManager.showTooltip(tooltipContent, event.clientX, event.clientY);
                 });
                 effectSpan.addEventListener('mouseout', () => {
                     this.uiManager.hideTooltip();
                 });
                 effectSpan.addEventListener('mousemove', (event) => {
                     this.uiManager.updateTooltipPosition(event.clientX, event.clientY);
                 });
                 // ----------------------------------------

                 containerElement.appendChild(effectSpan);
             });
        } else {
            // Find or create the 'None' span
            let noStatusSpan = containerElement.querySelector('.no-statuses');
            if (!noStatusSpan) {
                 noStatusSpan = document.createElement('span');
                 noStatusSpan.className = 'no-statuses';
                 noStatusSpan.textContent = 'None';
                 containerElement.appendChild(noStatusSpan);
            } else {
                 noStatusSpan.textContent = 'None'; // Ensure text is correct
            }
        }
    }

    /** Generates descriptive text/HTML for an enemy's intent, now with visual feedback. */
    getIntentText(intent, enemy) {
        if (!intent || !enemy || enemy.currentHp <= 0 || enemy.hasStatus('Stunned')) {
             return '<i class="fas fa-question"></i> ???'; // Stunned or dead
        }

        let text = ''; // Additional text like '+ Weak'
        let icon = 'fa-solid fa-question';
        let valueStr = ''; // The numerical part or main description
        let baseValue = intent.baseValue ?? intent.attackValue ?? intent.blockValue ?? 0; // Get base numeric value if applicable
        let predictedValue = baseValue;
        let modifierDesc = ""; // Description for tooltip
        let valueClass = ""; // CSS class for styling

        try {
            if (intent.type.includes('attack')) {
                icon = 'fa-solid fa-gavel';
                predictedValue = enemy.applyModifiers('damageDealt', baseValue);
                valueStr = predictedValue.toString();
                if (predictedValue < baseValue) {
                    valueClass = "intent-debuffed"; modifierDesc = ` (Base ${baseValue}, Weak!)`;
                } else if (predictedValue > baseValue) {
                    valueClass = "intent-buffed"; modifierDesc = ` (Base ${baseValue}, Strength!)`;
                }
                if(intent.status) text += ` + ${intent.status}`;
            }
            else if (intent.type.includes('block')) {
                icon = 'fa-solid fa-shield-halved';
                predictedValue = enemy.applyModifiers('blockGain', baseValue);
                valueStr = predictedValue.toString();
                 if (predictedValue < baseValue) { // Frail doesn't apply to enemy block gain usually, but check anyway
                     valueClass = "intent-debuffed"; modifierDesc = ` (Base ${baseValue}, Frail?)`;
                 } else if (predictedValue > baseValue) { // Dexterity
                     valueClass = "intent-buffed"; modifierDesc = ` (Base ${baseValue}, Dexterity!)`;
                 }
            }
             else if (intent.type === 'multi_attack') {
                 icon = 'fa-solid fa-gavel';
                 predictedValue = enemy.applyModifiers('damageDealt', baseValue); // Damage per hit
                 valueStr = `${predictedValue} x ${intent.count || '?'}`;
                 if (predictedValue < baseValue) {
                     valueClass = "intent-debuffed"; modifierDesc = ` (Base ${baseValue} per hit, Weak!)`;
                 } else if (predictedValue > baseValue) {
                     valueClass = "intent-buffed"; modifierDesc = ` (Base ${baseValue} per hit, Strength!)`;
                 }
                 if(intent.status && intent.applyStatusOnce) text += ` + ${intent.status}`;
            }
            else if (intent.type === 'attack_block') {
                icon = 'fa-solid fa-gavel';
                const attackBase = intent.attackValue || 0;
                const blockBase = intent.blockValue || 0;
                const attackPred = enemy.applyModifiers('damageDealt', attackBase);
                const blockPred = enemy.applyModifiers('blockGain', blockBase);
                let attackModClass = "", blockModClass = "";
                let attackModDesc = "", blockModDesc = "";

                if (attackPred < attackBase) { attackModClass = "intent-debuffed"; attackModDesc = ` (Base ${attackBase}, Weak!)`; }
                else if (attackPred > attackBase) { attackModClass = "intent-buffed"; attackModDesc = ` (Base ${attackBase}, Str!)`; }

                if (blockPred < blockBase) { blockModClass = "intent-debuffed"; blockModDesc = ` (Base ${blockBase}, Frail?)`; }
                else if (blockPred > blockBase) { blockModClass = "intent-buffed"; blockModDesc = ` (Base ${blockBase}, Dex!)`; }

                // Combine values and classes carefully
                 valueStr = `<span class="${attackModClass}">${attackPred}</span> & <i class="fas fa-shield-halved"></i> <span class="${blockModClass}">${blockPred}</span>`;
                 modifierDesc = `${attackModDesc}${blockModDesc}`; // Combine tooltips
            }
             else { // Non-numeric intents
                 switch (intent.type) {
                     case 'debuff': icon = 'fa-solid fa-arrow-down'; valueStr = intent.status || 'Debuff'; text = ` (${intent.duration || 1}t)`; break;
                     case 'buff': case 'power_up': icon = 'fa-solid fa-arrow-up'; valueStr = intent.status || 'Buff'; if (intent.amount > 1 && ['Strength', 'Dexterity'].includes(intent.status)) text = ` +${intent.amount}`; break;
                     case 'special': icon = 'fa-solid fa-star'; valueStr = intent.description || intent.id || 'Special'; break;
                     case 'none': icon = 'fa-solid fa-circle-minus'; valueStr = intent.description || 'Waiting'; break;
                     default: valueStr = 'Unknown Action';
                 }
            }
        } catch (error) { console.error(`Error calculating intent text for ${enemy.name}:`, error, intent); return '<i class="fas fa-exclamation-triangle"></i> Error'; }

        // Construct final HTML, adding the class to the value part if modified
        const finalValueHtml = (valueClass && intent.type !== 'attack_block') ? `<span class="${valueClass}">${valueStr}</span>` : valueStr;
        const tooltipTitle = modifierDesc ? ` title="${intent.description || intent.type}${modifierDesc}"` : ` title="${intent.description || intent.type}"`;

        return `<span ${tooltipTitle}><i class="${icon}"></i> ${finalValueHtml}${text}</span>`;
    }


    /** Renders the player's hand with fanning layout */
    renderHand(handCards, isPlayerTurn) {
        if (!this.handArea) return;
        this.handArea.innerHTML = '';
        const numCards = handCards.length; if (numCards === 0) return;
        const containerWidth = this.handArea.clientWidth; const cardWidth = 125; // Use card base width from CSS
        // Use values from CSS for consistency if possible, otherwise define here
        const overlapThreshold = 6; // Cards before max overlap applies
        const maxOverlapRatio = 0.65; // Max overlap percentage
        const minOverlapRatio = 0.1; // Min overlap (applies below threshold)

        let overlapRatio;
        if (numCards <= overlapThreshold) {
            overlapRatio = minOverlapRatio + ((maxOverlapRatio - minOverlapRatio) / overlapThreshold) * numCards;
        } else {
            overlapRatio = maxOverlapRatio; // Max overlap for many cards
        }

        const cardSpacing = cardWidth * (1 - overlapRatio);
        const totalHandWidth = cardWidth + (numCards - 1) * cardSpacing;
        const maxRenderWidth = containerWidth * 0.95; // Leave some padding

        let finalSpacing = cardSpacing;
        let finalTotalWidth = totalHandWidth;
        if (totalHandWidth > maxRenderWidth) {
            // If calculated width exceeds max, recalculate spacing to fit
            finalSpacing = (maxRenderWidth - cardWidth) / (numCards - 1 || 1);
            finalTotalWidth = maxRenderWidth;
        }

        const startX = (containerWidth - finalTotalWidth) / 2;
        const maxAngle = 25; // Max total arc angle
        const anglePerCard = numCards > 1 ? Math.min(maxAngle / (numCards - 1), 6) : 0; // Angle step per card, limit step size
        const startAngle = numCards > 1 ? - (numCards - 1) * anglePerCard / 2 : 0;
        const arcLift = 35; // How high the arc lifts cards in the middle

        handCards.forEach((card, index) => {
            const cardElement = this.uiManager.createCardElement(card);
            if (!cardElement) return;
            cardElement.dataset.handIndex = index;
            const currentAngle = startAngle + index * anglePerCard; const rotation = currentAngle;
            // Calculate Y offset based on position in arc (0 = center, 1 = edges)
            const normalizedIndex = numCards > 1 ? Math.abs(index - (numCards - 1) / 2) / ((numCards - 1) / 2) : 0;
            const yOffset = arcLift * (1 - normalizedIndex); // Lift higher in center

            cardElement.style.position = 'absolute';
            cardElement.style.left = `${startX + index * finalSpacing}px`;
            cardElement.style.bottom = `${10 + yOffset}px`; // Base position + arc lift
            cardElement.style.transform = `rotate(${rotation}deg)`;
            cardElement.style.zIndex = 10 + index;

            // Hover effect managed primarily by CSS (:hover) now, but z-index override helps
            cardElement.addEventListener('mouseenter', () => cardElement.style.zIndex = 100);
            cardElement.addEventListener('mouseleave', () => cardElement.style.zIndex = 10 + index);

             if (isPlayerTurn && card.cost !== null) {
                 // Check affordability
                 const affordable = this.gameState?.player?.currentFocus >= (card.cost ?? 0);
                 this._attachCardDragListeners(cardElement, card, affordable);

                 if (!affordable) {
                      cardElement.style.filter = 'grayscale(70%) brightness(0.8)';
                      cardElement.style.cursor = 'not-allowed'; // Indicate cannot play
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
     _attachCardDragListeners(cardElement, card, isAffordable) {
        if (!cardElement || !card) return;
         cardElement.draggable = isAffordable; // Only draggable if affordable
         cardElement.style.cursor = isAffordable ? 'grab' : 'not-allowed';

         cardElement.ondragstart = (event) => {
             if (!this.gameState?.combatManager?.playerTurn || !isAffordable) { event.preventDefault(); return; }
             this.uiManager.draggedCard = card; this.uiManager.draggedCardElement = cardElement;
             event.dataTransfer.setData('text/plain', card.id); event.dataTransfer.effectAllowed = 'move';
             cardElement.style.opacity = '0.5'; cardElement.style.cursor = 'grabbing';
             document.body.classList.add('dragging-card');
         };
         cardElement.ondragend = (event) => {
             if (this.uiManager.draggedCardElement) { this.uiManager.draggedCardElement.style.opacity = '1'; this.uiManager.draggedCardElement.style.cursor = 'grab'; }
             this.uiManager.draggedCard = null; this.uiManager.draggedCardElement = null;
             this.clearEnemyHighlights(); // Clear highlights on drag end (includes target border)
             this.enemyArea?.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over')); // Clear drag-over explicitly
             this.playerArea?.classList.remove('drag-over');
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
             this.clearEnemyHighlights();
         };
         const dragOverHandler = (event) => {
             event.preventDefault();
             if (uiManager.draggedCard) {
                 const card = uiManager.draggedCard; const currentTargetElement = event.currentTarget;
                 const targetIsPlayerArea = currentTargetElement === this.playerArea;
                 let isValidTarget = false;
                 if (targetIsPlayerArea) { isValidTarget = !card.requiresTarget || card.targetType === 'self'; }
                 else { isValidTarget = card.requiresTarget && card.targetType === 'enemy'; }

                 if (isValidTarget) { event.dataTransfer.dropEffect = 'move'; currentTargetElement.classList.add('drag-over'); if (!targetIsPlayerArea) this.highlightEnemyTarget(currentTargetElement.dataset.enemyId, true); // Use specific targeting highlight
                 }
                 else { event.dataTransfer.dropEffect = 'none'; currentTargetElement.classList.remove('drag-over'); if (!targetIsPlayerArea) this.highlightEnemyTarget(currentTargetElement.dataset.enemyId, false); }
             } else { event.dataTransfer.dropEffect = 'none'; }
         };
         const dragLeaveHandler = (event) => {
             event.currentTarget.classList.remove('drag-over');
             const targetIsPlayerArea = event.currentTarget === this.playerArea;
             if (!targetIsPlayerArea) this.highlightEnemyTarget(event.currentTarget.dataset.enemyId, false); // Clear targeting highlight
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

     /** Clear highlighting classes from enemies (acting and targeted) */
     clearEnemyHighlights() {
        this.enemyArea?.querySelectorAll('.enemy-display').forEach(el => {
             el.classList.remove('targeted', 'highlighted-enemy', 'drag-over');
             // Reset border if needed, but targeting class should handle it
             // el.style.borderColor = 'var(--color-border)'; // Reset border if needed
         });
     }

      /** Add/Remove highlight for ACTING enemy */
      highlightEnemy(enemyInstanceId, highlighted = true) {
        // This highlights the enemy taking its turn
        this.enemyArea?.querySelectorAll('.highlighted-enemy').forEach(el => el.classList.remove('highlighted-enemy'));
        const enemyElement = this.enemyArea?.querySelector(`.enemy-display[data-enemy-id="${enemyInstanceId}"]`);
        if (enemyElement) {
            enemyElement.classList.toggle('highlighted-enemy', highlighted);
        }
     }

     /** Add/Remove highlight for TARGETED enemy */
      highlightEnemyTarget(enemyInstanceId, highlighted = true) {
        // This highlights the enemy being targeted by player click or drag-over
        const enemyElement = this.enemyArea?.querySelector(`.enemy-display[data-enemy-id="${enemyInstanceId}"]`);
        if (enemyElement) {
            enemyElement.classList.toggle('targeted', highlighted); // Use targeted class
        }
      }

} // End of CombatUI class
