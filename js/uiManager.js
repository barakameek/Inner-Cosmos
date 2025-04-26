// js/uiManager.js

class UIManager {
    /**
     * @param {CanvasRenderingContext2D} ctx - The main rendering context.
     * @param {GameManager} gameManager - Reference to the game manager for state info.
     */
    constructor(ctx, gameManager) {
        if (!ctx || !gameManager) {
            console.error("UIManager requires ctx and gameManager references!");
            return; // Prevent initialization if references are missing
        }
        this.ctx = ctx;
        this.gameManager = gameManager;

        // Tooltip State
        this.tooltip = {
            visible: false,
            text: '',
            x: 0, y: 0,
            width: 0, height: 0,
            targetElement: null // Reference to the element triggering the tooltip
        };

        // Other UI elements (e.g., dialogs, notifications) can be managed here
        // this.confirmationDialog = { visible: false, ... };

        console.log("UIManager initialized.");
    }

    // --- Core Loop Functions ---

    update(deltaTime) {
        // Update managed UI elements (e.g., animation timers)
        // Update tooltips based on current hover states
        this.updateTooltipState();
    }

    render() {
        // Render UI elements managed by this class (drawn last/on top)
        this.renderTooltip();
        // this.renderConfirmationDialog();
    }

    // --- Tooltip Management ---

    updateTooltipState() {
        let newTooltipTarget = null;
        let tooltipText = '';
        let tooltipPos = { x: 0, y: 0 };
        const mousePos = this.gameManager.lastInputPos;

        if (!mousePos) return; // Need mouse position

        // Determine potential tooltip target based on game state and hover flags
        switch (this.gameManager.currentState) {
            case GameState.MAP:
                const hoveredNode = this.gameManager.currentMap?.hoveredNode; // Check map's hover state
                if (hoveredNode && hoveredNode.isVisible) {
                    newTooltipTarget = hoveredNode;
                    tooltipText = this.getNodeTooltipText(hoveredNode);
                    tooltipPos = { x: mousePos.x + 15, y: mousePos.y + 5 }; // Position slightly offset from mouse
                }
                break;

            case GameState.COMBAT:
                const combatMgr = this.gameManager.combatManager;
                if (combatMgr) {
                    // Check Card Hover (Priority 1)
                    if (combatMgr.hoveredCardIndex !== -1 && combatMgr.hoveredCardIndex < this.gameManager.player.hand.length) {
                        const card = this.gameManager.player.hand[combatMgr.hoveredCardIndex];
                        if (card) {
                            newTooltipTarget = card;
                            tooltipText = this.getCardTooltipText(card);
                            const cardBounds = combatMgr.getCardBoundsInHand(combatMgr.hoveredCardIndex); // Get bounds for positioning
                            // Position tooltip above the card, centered horizontally
                            tooltipPos = { x: cardBounds.x + cardBounds.width / 2, y: cardBounds.y - 10 };
                        }
                    }
                    // Check Enemy Hover (Priority 2)
                    else if (combatMgr.hoveredEnemyIndex !== -1) {
                        const enemy = combatMgr.enemies[combatMgr.hoveredEnemyIndex];
                        if (enemy && enemy.currentHp > 0) {
                            newTooltipTarget = enemy;
                            tooltipText = this.getEnemyTooltipText(enemy);
                            tooltipPos = { x: mousePos.x + 15, y: mousePos.y + 5 };
                        }
                    }
                    // Check Deck/Discard Hover (Priority 3)
                    else if (combatMgr.hoveredPile === 'deck_piles') {
                        newTooltipTarget = 'deck_piles';
                        tooltipText = `Draw: ${this.gameManager.player.drawPile.length}\nDiscard: ${this.gameManager.player.discardPile.length}\nExhaust: ${this.gameManager.player.exhaustPile.length}`;
                        // Position left of mouse, centered vertically?
                        tooltipPos = { x: mousePos.x - 150, y: mousePos.y - 20 };
                    }
                    // Check End Turn Button Hover (Priority 4)
                    else if (combatMgr.endTurnButton.isHovered) {
                        newTooltipTarget = 'end_turn';
                        tooltipText = "End your current turn.";
                        tooltipPos = { x: mousePos.x - 100, y: mousePos.y - 30 }; // Above mouse
                    }
                    // Check Relic/Status Icon Hovers here if they become interactive elements
                }
                break;

             case GameState.RESPITE:
                 // Check hover on Respite elements using flags set in GameManager.updateHoverStates
                 if (this.gameManager.refineModeActive) {
                     // Check Refine UI buttons first
                     if(this.gameManager.refinePaginationButtons.prev?.isHovered) {
                         newTooltipTarget = 'refine_prev'; tooltipText = "Previous Page"; tooltipPos = { x: mousePos.x, y: mousePos.y - 30 };
                     } else if(this.gameManager.refinePaginationButtons.next?.isHovered) {
                         newTooltipTarget = 'refine_next'; tooltipText = "Next Page"; tooltipPos = { x: mousePos.x, y: mousePos.y - 30 };
                     } else if(this.gameManager.refinePaginationButtons.cancel?.isHovered) {
                         newTooltipTarget = 'refine_cancel'; tooltipText = "Cancel Refine"; tooltipPos = { x: mousePos.x + 15, y: mousePos.y };
                     } else {
                         // Check hover on cards displayed for refinement
                         // Requires bounds calculation or direct hover check on card data
                         const cardBoundsData = this.gameManager.calculateRefineCardBounds(this.gameManager.getRefineCardsForCurrentPage());
                         for (const boundsData of cardBoundsData) {
                             if (this.gameManager.isPointInRect(mousePos, boundsData.bounds)) {
                                 newTooltipTarget = boundsData.card;
                                 tooltipText = this.getCardTooltipText(boundsData.card);
                                 tooltipPos = { x: boundsData.bounds.x + boundsData.bounds.width / 2, y: boundsData.bounds.y - 10 };
                                 break; // Found hovered card
                             }
                         }
                     }
                 } else {
                     // Check hover on initial Respite options
                     this.gameManager.respiteOptions.forEach(opt => {
                         if (opt.isHovered) {
                             newTooltipTarget = opt.id;
                             tooltipText = this.getRespiteOptionTooltip(opt.id);
                             tooltipPos = { x: mousePos.x + 15, y: mousePos.y + 5 };
                         }
                     });
                 }
                 break;

            case GameState.REWARD_SCREEN:
                // Check hover on reward buttons using flags set in GameManager
                let foundRewardHover = false;
                this.gameManager.rewardCardButtons?.forEach(btn => {
                    if (btn.isHovered) {
                        const cardDef = getCardDefinition(btn.id);
                        if(cardDef) {
                            newTooltipTarget = cardDef;
                            tooltipText = this.getCardTooltipText(new Card(cardDef));
                            tooltipPos = { x: btn.bounds.x + btn.bounds.width / 2, y: btn.bounds.y - 10 }; // Above button
                            foundRewardHover = true;
                        }
                    }
                });
                if(!foundRewardHover && this.gameManager.rewardRelicButton?.isHovered) {
                    const relicDef = getRelicDefinition(this.gameManager.rewardRelicButton.id);
                    if(relicDef) {
                        newTooltipTarget = relicDef;
                        tooltipText = this.getRelicTooltipText(relicDef);
                        tooltipPos = { x: this.gameManager.rewardRelicButton.bounds.x + this.gameManager.rewardRelicButton.bounds.width / 2, y: this.gameManager.rewardRelicButton.bounds.y - 10 }; // Above button
                        foundRewardHover = true;
                    }
                }
                if(!foundRewardHover && this.gameManager.rewardSkipButton?.isHovered) {
                    newTooltipTarget = 'skip_reward';
                    tooltipText = "Skip rewards and continue.";
                    tooltipPos = { x: mousePos.x, y: mousePos.y - 30 }; // Above mouse
                }
                break;

            // Add cases for SHOP, EVENT, MAIN_MENU if tooltips are needed there
        }

        // Show or hide tooltip based on whether a target was found
        if (newTooltipTarget) {
            this.showTooltip(tooltipText, tooltipPos.x, tooltipPos.y, newTooltipTarget);
        } else {
            this.hideTooltip();
        }
    }

    showTooltip(text, x, y, targetElement = null) {
        this.tooltip.text = text;
        this.tooltip.targetElement = targetElement; // Store reference if needed
        this.tooltip.visible = true;

        // Calculate dimensions based on text lines and max width
        this.ctx.font = '13px sans-serif'; // Ensure context has correct font for measurement
        const lines = text.split('\n');
        let maxWidth = 0;
        lines.forEach(line => {
            maxWidth = Math.max(maxWidth, this.ctx.measureText(line).width);
        });
        const paddingX = 10;
        const paddingY = 5;
        const lineHeight = 16;
        this.tooltip.width = maxWidth + 2 * paddingX;
        this.tooltip.height = lines.length * lineHeight + 2 * paddingY;

        // Adjust position to keep tooltip on screen
        const canvasPadding = 5;
        let adjustedX = x;
        let adjustedY = y;

        // If tooltip goes off right edge, reposition to the left of the cursor/element
        if (adjustedX + this.tooltip.width > CANVAS_WIDTH - canvasPadding) {
            adjustedX = x - this.tooltip.width - 15; // Move left
        }
        // If tooltip goes off left edge (after potential reposition), clamp it
        if (adjustedX < canvasPadding) {
            adjustedX = canvasPadding;
        }
        // If tooltip goes off bottom edge, reposition above the cursor/element
        if (adjustedY + this.tooltip.height > CANVAS_HEIGHT - canvasPadding) {
            adjustedY = y - this.tooltip.height - 10; // Move above
        }
        // If tooltip goes off top edge (after potential reposition), clamp it
        if (adjustedY < canvasPadding) {
            adjustedY = canvasPadding;
        }

        this.tooltip.x = Math.round(adjustedX);
        this.tooltip.y = Math.round(adjustedY);
    }

    hideTooltip() {
        if (this.tooltip.visible) {
            this.tooltip.visible = false;
            this.tooltip.targetElement = null;
            this.tooltip.text = '';
        }
    }

    renderTooltip() {
        if (!this.tooltip.visible || !this.tooltip.text) return;

        const x = this.tooltip.x;
        const y = this.tooltip.y;
        const width = this.tooltip.width;
        const height = this.tooltip.height;

        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(x, y, width, height);

        // Border
        this.ctx.strokeStyle = '#CCC';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);

        // Text
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '13px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        const lines = this.tooltip.text.split('\n');
        const paddingX = 10;
        const paddingY = 5;
        const lineHeight = 16;
        lines.forEach((line, index) => {
            this.ctx.fillText(line, x + paddingX, y + paddingY + index * lineHeight);
        });
    }

    // --- Tooltip Text Generation Helpers ---

    getNodeTooltipText(node) {
        let text = `${node.type}`;
        if (node.isVisited) text += " (Visited)";
        switch (node.type) {
             case NodeType.ENCOUNTER:
             case NodeType.ELITE_ENCOUNTER:
             case NodeType.BOSS:
                  if (node.data.enemies && node.data.enemies.length > 0) {
                       const enemyNames = node.data.enemies.map(id => getEnemyDefinition(id)?.name || 'Unknown').join(', ');
                       text += `\nEnemies: ${enemyNames}`; } else { text += `\nEnemies: ???`; } break;
             case NodeType.RESPITE: text += "\nHeal or Remove Card"; break;
             case NodeType.SHOP: text += "\nBuy Cards / Relics"; break;
             case NodeType.EVENT: text += "\nA chance encounter..."; break;
        }
        if (!node.isReachable && !node.isCurrent) text += "\n(Not Reachable)";
        return text;
   }

   getCardTooltipText(card) {
        if (!card || !(card instanceof Card)) return "Invalid Card";
        let text = `${card.name} (${card.cost ?? 'N/A'} ${card.element})`;
        text += `\n[${card.type}]`;
        if (card.rarity !== CardRarity.STARTER && card.rarity !== CardRarity.SPECIAL) text += ` [${card.rarity}]`;
        if (card.keywords.length > 0) text += `\nKeywords: ${card.keywords.join(', ')}`;
        text += `\n---------------------\n${card.description}`;
        return text;
   }

   getEnemyTooltipText(enemy) {
        if (!enemy || !(enemy instanceof Enemy)) return "Invalid Enemy";
        let text = `${enemy.name}\nHP: ${enemy.currentHp} / ${enemy.maxHp}`;
        text += `\nWeak: ${enemy.weakness || 'None'} | Resist: ${enemy.resistance || 'None'}`;
        let statuses = [];
        Object.entries(enemy.statusEffects).forEach(([key, value]) => {
            let amount = 0; let durationInfo = '';
            if (typeof value === 'number') amount = value;
            else if (typeof value === 'object') { amount = value.amount; if(value.duration !== Infinity && value.duration > 0) durationInfo = `(${value.duration}t)`; }
            if (amount > 0) statuses.push(`${key}${amount > 1 ? ':'+amount : ''}${durationInfo}`);
        });
        if (statuses.length > 0) text += `\nStatuses: ${statuses.join(', ')}`;
        if (enemy.currentMove) {
             text += `\n---------------------\nIntent: ${enemy.currentMove.description || enemy.currentMove.intentType}`;
             if (enemy.intentValue !== null) {
                  if(enemy.currentMove.intentType.includes('Attack')) text += ` (Deals ~${enemy.intentValue} Bruise)`; // Indicate estimate
                  else if(enemy.currentMove.intentType.includes('Defend')) text += ` (Gains ${enemy.intentValue} Guard)`;
             }
        }
        return text;
   }

    getRelicTooltipText(relicDef) {
         if (!relicDef) return "Invalid Relic";
         let text = `${relicDef.name} [${relicDef.rarity}]`;
         text += `\n---------------------\n${relicDef.description}`;
         if (relicDef.flavorText) text += `\n\n"${relicDef.flavorText}"`;
         return text;
    }

     getRespiteOptionTooltip(optionId) {
         switch (optionId) {
              case 'heal': return "Restore 25% of your maximum Composure (HP).";
              case 'refine': return "Permanently remove a card from your deck for this run.";
              default: return "Unknown option.";
         }
    }

    // --- Other UI Rendering/Helpers ---
    // isMouseOverElement(elementBounds) { ... }
    // renderConfirmationDialog(ctx) { ... }

} // End UIManager Class
