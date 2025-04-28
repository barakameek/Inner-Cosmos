// js/ui/CombatUI.js

// Import base classes if needed for type hinting or static methods
import { Enemy } from '../combat/Enemy.js';
import { Player } from '../core/Player.js';
// Import status definitions for tooltips/icons
import { getStatusEffectDefinition } from '../combat/StatusEffects.js';

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
        // Render the player's hand
        this.renderHand(player.deckManager.hand, isPlayerTurn);
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

        // Optional: Add a label prefix
        // const statusLabel = document.createElement('span'); statusLabel.textContent = 'Statuses: '; containerElement.appendChild(statusLabel);

        if (activeEffects && activeEffects.length > 0) {
             activeEffects.forEach(effect => {
                 // Skip internal flags like Core Traits
                 if (effect.id.startsWith('CoreTrait_')) return;

                 const definition = getStatusEffectDefinition(effect.id);
                 if (!definition) {
                      console.warn(`Status definition missing for ID: ${effect.id}`);
                      const effectSpan = document.createElement('span');
                      effectSpan.className = `status-effect ${targetType}-status status-unknown`;
                      effectSpan.innerHTML = `<i class="fa-solid fa-question-circle"></i> ${effect.id}`;
                      effectSpan.title = `Unknown Status: ${effect.id}`; containerElement.appendChild(effectSpan); return;
                 }
                 const effectSpan = document.createElement('span');
                 effectSpan.className = `status-effect ${targetType}-status status-${effect.id.toLowerCase()}`;
                 // Determine display value (amount or duration)
                 let displayValue = "";
                 const isStacking = definition.stacking;
                 const isDurationBased = definition.durationBased;
                 const isInfinite = effect.duration === 99;
                 // Prioritize amount for stacking effects if > 1
                 if (isStacking && effect.amount > 1) {
                     displayValue = effect.amount;
                 }
                 // Show duration for non-stacking or duration-based effects, unless infinite
                 else if (!isStacking && isDurationBased && !isInfinite && effect.duration > 0) {
                      displayValue = effect.duration;
                 }
                 // No display value needed for non-stacking, non-duration (like Weak 1 turn) or infinite duration single stacks

                 effectSpan.innerHTML = `<i class="${definition.icon || 'fa-solid fa-circle-question'}"></i>${displayValue ? ` ${displayValue}` : ''}`;
                 effectSpan.title = `${definition.name}: ${definition.description}`; // Tooltip
                 containerElement.appendChild(effectSpan);
             });
        } else {
            // Optional: Display 'None' if no statuses
            // const noStatusSpan = document.createElement('span'); noStatusSpan.className = 'no-statuses'; noStatusSpan.textContent = 'None'; containerElement.appendChild(noStatusSpan);
        }
    }

    /** Generates descriptive text/HTML for an enemy's intent. */
    getIntentText(intent, enemy) {
        // ... (Keep existing getIntentText logic) ...
        if (!intent || !enemy || enemy.currentHp <= 0 || enemy.hasStatus('Stunned')) { return '<i class="fas fa-question"></i> ???'; }
        let text = ''; let icon = 'fa-solid fa-question'; let value = '';
        const baseIntentValue = intent.baseValue ?? intent.attackValue ?? intent.blockValue ?? 0;
        let predictedValue = baseIntentValue;

        try {
            if (intent.type.includes('attack')) { predictedValue = enemy.applyModifiers('damageDealt', baseIntentValue); icon = 'fa-solid fa-gavel'; value = predictedValue; if(intent.status && intent.statusDuration > 0) text += ` (+${intent.status})`; } // Simplified status text
            else if (intent.type.includes('block')) { predictedValue = enemy.applyModifiers('blockGain', baseIntentValue); icon = 'fa-solid fa-shield-halved'; value = predictedValue; }
            else {
                 switch (intent.type) {
                     case 'multi_attack': predictedValue = enemy.applyModifiers('damageDealt', baseIntentValue); icon = 'fa-solid fa-gavel'; value = `${predictedValue} x ${intent.count || '?'}`; if(intent.status && intent.applyStatusOnce) text += ` (+${intent.status})`; break;
                     case 'attack_block': const attackVal = enemy.applyModifiers('damageDealt', intent.attackValue || 0); const blockVal = enemy.applyModifiers('blockGain', intent.blockValue || 0); icon = 'fa-solid fa-gavel'; value = `${attackVal} & <i class="fas fa-shield-halved"></i> ${blockVal}`; break;
                     case 'debuff': icon = 'fa-solid fa-arrow-down'; value = intent.status || 'Debuff'; text = ` (${intent.duration || 1}t)`; break;
                     case 'buff': case 'power_up': icon = 'fa-solid fa-arrow-up'; value = intent.status || 'Buff'; if (intent.amount > 1 && ['Strength', 'Dexterity'].includes(intent.status)) text = ` +${intent.amount}`; break;
                     case 'special': icon = 'fa-solid fa-star'; value = intent.description || intent.id || 'Special'; break;
                     case 'none': icon = 'fa-solid fa-circle-minus'; value = intent.description || 'Waiting'; break;
                     default: value = 'Unknown Action';
                 }
            }
        } catch (error) { console.error(`Error calculating intent text for ${enemy.name}:`, error, intent); return '<i class="fas fa-exclamation-triangle"></i> Error'; }
        // Add vulnerable icon if player has vulnerable status applied by this intent
        // This requires slightly more complex logic checking intent.status vs player statuses
        return `<i class="${icon}"></i> ${value}${text}`;
    }


    /** Renders the player's hand with fanning layout */
    renderHand(handCards, isPlayerTurn) {
        // ... (Keep existing renderHand logic for fanning/drag listeners) ...
        // Important: ensure createCardElement used here is from this.uiManager
        if (!this.handArea || !this.uiManager) return;
        this.handArea.innerHTML = '';
        const numCards = handCards.length; if (numCards === 0) return;
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

        handCards.forEach((card, index) => {
            if (!card) { console.warn("renderHand encountered undefined card at index", index); return; } // Add check
            const cardElement = this.uiManager.createCardElement(card); // Use UIManager to create element
            if (!cardElement) return;
            cardElement.dataset.handIndex = index; // Store index if needed
            const currentAngle = startAngle + index * anglePerCard; const rotation = currentAngle;
            const normalizedIndex = numCards > 1 ? (index / (numCards - 1)) - 0.5 : 0; // -0.5 to 0.5
            const yOffset = arcLift * (1 - (normalizedIndex * 2)**2); // Parabolic lift
            cardElement.style.position = 'absolute';
            cardElement.style.left = `${startX + index * finalSpacing}px`;
            cardElement.style.bottom = `${10 + yOffset}px`; // Base position + lift
            cardElement.style.transform = `rotate(${rotation}deg)`;
            cardElement.style.zIndex = 10 + index; // Base Z-index

            // Hover effects managed by CSS now (#handArea .card:hover)
            // cardElement.addEventListener('mouseenter', () => cardElement.style.zIndex = 100);
            // cardElement.addEventListener('mouseleave', () => cardElement.style.zIndex = 10 + index);

             // Draggability and affordability check
             if (isPlayerTurn && card.cost !== null) { // Check if card is playable
                 const currentFocus = this.gameState?.player?.currentFocus ?? 0;
                 const cardCost = card.cost; // Use card's base cost for check, actual play uses modified

                 if (currentFocus >= cardCost) {
                      this._attachCardDragListeners(cardElement, card); // Attach drag only if affordable
                      cardElement.style.filter = 'none'; // Ensure not dimmed
                      cardElement.style.cursor = 'grab';
                 } else {
                      cardElement.style.filter = 'grayscale(70%) brightness(0.8)'; // Dim unaffordable
                      cardElement.style.cursor = 'not-allowed';
                      cardElement.draggable = false;
                 }
             } else { // Not player turn or unplayable card
                cardElement.draggable = false;
                cardElement.style.cursor = 'default';
                if (!isPlayerTurn) {
                     cardElement.style.filter = 'grayscale(70%) brightness(0.8)'; // Dim all on enemy turn
                } else {
                     cardElement.style.filter = 'none'; // Ensure playable cards aren't dimmed if cost is null
                }
             }
            this.handArea.appendChild(cardElement);
        });
    }

     /** Attaches drag listeners to a card element */
     _attachCardDragListeners(cardElement, card) {
         // ... (Keep existing _attachCardDragListeners logic) ...
         if (!cardElement || !card) return;
         cardElement.draggable = true; // Already checked affordability before calling this

         cardElement.ondragstart = (event) => {
             // Double check conditions just in case state changed rapidly
             if (!this.gameState?.combatManager?.playerTurn || (card.cost !== null && (this.gameState?.player?.currentFocus ?? 0) < card.cost)) {
                 event.preventDefault();
                 return;
             }
             // Set drag data
             this.uiManager.draggedCard = card;
             this.uiManager.draggedCardElement = cardElement;
             try {
                 event.dataTransfer.setData('text/plain', card.id); // Use card instance ID
                 event.dataTransfer.effectAllowed = 'move';
             } catch (e) { console.error("Error setting drag data:", e); } // Catch potential errors

             // Visual feedback
             cardElement.style.opacity = '0.5';
             cardElement.style.cursor = 'grabbing';
             document.body.classList.add('dragging-card'); // Global cursor change
         };

         cardElement.ondragend = (event) => {
             if (this.uiManager.draggedCardElement) { // Restore appearance
                 this.uiManager.draggedCardElement.style.opacity = '1';
                 this.uiManager.draggedCardElement.style.cursor = 'grab';
             }
             // Clear drag state
             this.uiManager.draggedCard = null;
             this.uiManager.draggedCardElement = null;
             // Clear any lingering dropzone highlights
             this.clearDropZoneHighlights();
             document.body.classList.remove('dragging-card'); // Restore global cursor
         };
     }

    /** Sets up drop zones on enemies/player area */
     _setupDropZones() {
         // ... (Keep existing _setupDropZones logic) ...
         // Ensure it uses the most up-to-date references and checks enemy HP
        if (!this.enemyArea || !this.playerArea || !this.gameState?.combatManager || !this.uiManager) return;
         const combatManager = this.gameState.combatManager; const uiManager = this.uiManager;

         const dropHandler = (event, target = null) => {
             event.preventDefault();
             event.currentTarget.classList.remove('drag-over');
             this.clearDropZoneHighlights(event.currentTarget); // Clear specific highlight
             const draggedCard = uiManager.draggedCard;
             if (draggedCard) {
                 // Pass Enemy instance if target is enemy, otherwise null (implies self/player target)
                 combatManager.handlePlayerCardPlay(draggedCard, target instanceof Enemy ? target : null);
             }
             // Clear global drag state AFTER handling play attempt
             uiManager.draggedCard = null; uiManager.draggedCardElement = null;
         };
         const dragOverHandler = (event) => {
             event.preventDefault();
             const draggedCard = uiManager.draggedCard;
             if (!draggedCard) { event.dataTransfer.dropEffect = 'none'; return; }

             const currentTargetElement = event.currentTarget;
             const targetIsPlayerArea = currentTargetElement === this.playerArea;
             let enemyTarget = null;
             if (!targetIsPlayerArea) {
                 const enemyId = currentTargetElement.dataset.enemyId;
                 enemyTarget = combatManager.enemies.find(e => e.id === enemyId);
             }

             // Determine if the drop is valid based on card targeting requirements
             let isValidTarget = false;
             if (targetIsPlayerArea) {
                 // Valid if card requires NO target, or specifically targets SELF
                 isValidTarget = !draggedCard.requiresTarget || draggedCard.targetType === 'self';
             } else if (enemyTarget) {
                 // Valid if card requires a target AND targets enemies AND this enemy is alive
                 isValidTarget = draggedCard.requiresTarget && draggedCard.targetType === 'enemy' && enemyTarget.currentHp > 0;
             }

             // Provide visual feedback
             if (isValidTarget) {
                 event.dataTransfer.dropEffect = 'move';
                 currentTargetElement.classList.add('drag-over');
                 // Highlight enemy specifically if it's the target
                 if (enemyTarget) uiManager.highlightEnemy(enemyTarget.id, true);
             } else {
                 event.dataTransfer.dropEffect = 'none';
                 currentTargetElement.classList.remove('drag-over');
                 if (enemyTarget) uiManager.highlightEnemy(enemyTarget.id, false); // Ensure unhighlighted if invalid
             }
         };
         const dragLeaveHandler = (event) => {
             event.currentTarget.classList.remove('drag-over');
             const targetIsPlayerArea = event.currentTarget === this.playerArea;
             // Only unhighlight enemy if leaving that specific enemy element
             if (!targetIsPlayerArea) {
                 const enemyId = event.currentTarget.dataset.enemyId;
                 uiManager.highlightEnemy(enemyId, false);
             }
         };

         // Apply to individual living enemy elements
         this.enemyArea.querySelectorAll('.enemy-display').forEach(enemyEl => {
             const enemyId = enemyEl.dataset.enemyId; const enemy = combatManager.enemies.find(e => e.id === enemyId);
             // Only attach listeners to living enemies
             if (enemy && enemy.currentHp > 0) {
                 enemyEl.ondragover = dragOverHandler;
                 enemyEl.ondrop = (event) => dropHandler(event, enemy); // Pass the specific enemy object
                 enemyEl.ondragleave = dragLeaveHandler;
             } else {
                 // Remove listeners from dead enemies to prevent interaction
                 enemyEl.ondragover = null; enemyEl.ondrop = null; enemyEl.ondragleave = null;
             }
         });
         // Apply to player area
         this.playerArea.ondragover = dragOverHandler;
         this.playerArea.ondrop = (event) => dropHandler(event, null); // Drop on player area passes null target (handled by validateTarget)
         this.playerArea.ondragleave = dragLeaveHandler;
     }

     /** Clear highlighting classes from drop zones */
     clearDropZoneHighlights(excludeElement = null) {
         this.playerArea?.classList.remove('drag-over');
         this.enemyArea?.querySelectorAll('.enemy-display.drag-over').forEach(el => {
            if (el !== excludeElement) {
                 el.classList.remove('drag-over');
            }
         });
         // Also clear general enemy highlights unless the target is being set
         if (!this.gameState?.combatManager?.currentTarget) {
             this.clearEnemyHighlights();
         }
     }

     /** Clear ONLY target highlighting class from enemies */
     clearEnemyHighlights() {
        this.enemyArea?.querySelectorAll('.enemy-display').forEach(el => {
             el.classList.remove('targeted', 'highlighted-enemy'); // Remove both targeting and acting highlights
             // Reset border to default (might need adjustment based on other states)
             // el.style.borderColor = 'var(--color-border)'; // Or get default from CSS
         });
     }

      /** Add/Remove highlight for acting enemy */
      highlightEnemy(enemyInstanceId, highlighted = true) {
        // Clear previous acting highlights first
        this.enemyArea?.querySelectorAll('.highlighted-enemy').forEach(el => el.classList.remove('highlighted-enemy'));
        // Find the specific enemy element
        const enemyElement = this.enemyArea?.querySelector(`.enemy-display[data-enemy-id="${enemyInstanceId}"]`);
        if (enemyElement) {
            if (highlighted) {
                enemyElement.classList.add('highlighted-enemy'); // Apply acting highlight
            }
            // Note: This doesn't affect the 'targeted' class, which is handled separately in renderEnemies
        }
     }

} // End of CombatUI class
