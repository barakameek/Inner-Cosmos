// js/uiManager.js

class UIManager {
    /**
     * @param {CanvasRenderingContext2D} ctx - The main rendering context.
     * @param {GameManager} gameManager - Reference to the game manager for state info.
     */
    constructor(ctx, gameManager) {
        if (!ctx || !gameManager) {
            console.error("UIManager requires ctx and gameManager references!");
            // Handle error appropriately
            return;
        }
        this.ctx = ctx;
        this.gameManager = gameManager; // To access player, map, combat state etc.

        // --- Tooltip State ---
        this.tooltip = {
            visible: false,
            text: '',
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            targetElement: null // e.g., MapNode, Card, Enemy, 'deck_piles', 'end_turn' etc.
        };

        // --- Other UI States ---
        // e.g., confirmationDialog = { visible: false, message: '', onConfirm: null, onCancel: null }

        console.log("UIManager initialized.");
    }

    // --- Core Loop Functions ---

    update(deltaTime) {
        // Update UI elements based on game state and hover info
        // Primarily updates the tooltip state based on what's hovered
        this.updateTooltipState();

        // Update other managed UI elements (e.g., timers for notifications)
    }

    render() {
        // Draw UI elements managed by this class (drawn on top)
        this.renderTooltip();
        // Render other elements like popups, notifications, etc.
        // e.g., this.renderConfirmationDialog();
    }

    // --- Tooltip Management ---

    updateTooltipState() {
        let newTooltipTarget = null;
        let tooltipText = '';
        let tooltipPos = { x: 0, y: 0 };
        const mousePos = this.gameManager.lastInputPos; // Get current mouse position

        if (!mousePos) return; // Cannot determine tooltips without mouse position

        // Check tooltips based on the current game state
        switch (this.gameManager.currentState) {
            case GameState.MAP:
                if (this.gameManager.currentMap?.hoveredNode) { // Check for hoveredNode stored by map's updateHover
                    const hoveredNode = this.gameManager.currentMap.hoveredNode;
                    if (hoveredNode.isVisible) { // Only show tooltip for visible nodes
                         newTooltipTarget = hoveredNode;
                         tooltipText = this.getNodeTooltipText(hoveredNode);
                         tooltipPos = { x: mousePos.x + 15, y: mousePos.y };
                    }
                }
                break;

            case GameState.COMBAT:
                const combatMgr = this.gameManager.combatManager;
                if (combatMgr) {
                    // --- Check Combat Hovers (Order matters for priority) ---
                    // 1. Card Hover
                    if (combatMgr.hoveredCardIndex !== -1 && combatMgr.hoveredCardIndex < this.gameManager.player.hand.length) {
                         const card = this.gameManager.player.hand[combatMgr.hoveredCardIndex];
                         if (card) {
                              newTooltipTarget = card;
                              tooltipText = this.getCardTooltipText(card);
                              // Position tooltip above the card's location in hand
                              const cardBounds = combatMgr.getCardBoundsInHand(combatMgr.hoveredCardIndex);
                              tooltipPos = { x: cardBounds.x + cardBounds.width / 2, y: cardBounds.y - 10 }; // Centered above card
                         }
                    }
                    // 2. Enemy Hover
                    else if (combatMgr.hoveredEnemyIndex !== -1) {
                         const enemy = combatMgr.enemies[combatMgr.hoveredEnemyIndex];
                         if (enemy && enemy.currentHp > 0) { // Only show for living enemies
                             newTooltipTarget = enemy;
                             tooltipText = this.getEnemyTooltipText(enemy);
                             tooltipPos = { x: mousePos.x + 15, y: mousePos.y }; // Next to mouse
                         }
                    }
                    // 3. Deck/Discard Pile Hover
                     else if (combatMgr.hoveredPile === 'deck_piles') { // Check state set by CombatManager hover update
                         newTooltipTarget = 'deck_piles';
                          tooltipText = `Draw: ${this.gameManager.player.drawPile.length}\nDiscard: ${this.gameManager.player.discardPile.length}\nExhaust: ${this.gameManager.player.exhaustPile.length}`;
                         tooltipPos = { x: mousePos.x - 150, y: mousePos.y }; // Position left of mouse
                     }
                     // 4. End Turn Button Hover
                     else if (combatMgr.endTurnButton.isHovered) { // Check state set by CombatManager hover update
                         newTooltipTarget = 'end_turn';
                         tooltipText = "End your current turn.";
                         tooltipPos = { x: mousePos.x - 100, y: mousePos.y - 30 }; // Above mouse
                     }
                     // 5. Relic Hover (If relics are drawn interactively in combat)
                     // 6. Status Effect Icon Hover (If icons are drawn interactively)
                }
                break;

             case GameState.RESPITE:
                  // Check hover on Respite options or Refine cards/buttons
                  if (this.gameManager.refineModeActive) {
                      // Check hover on Refine UI buttons (pagination, cancel)
                       if(this.gameManager.refinePaginationButtons.prev?.isHovered) {
                           newTooltipTarget = 'refine_prev'; tooltipText = "Previous Page"; tooltipPos = { x: mousePos.x, y: mousePos.y - 30 };
                       } else if(this.gameManager.refinePaginationButtons.next?.isHovered) {
                            newTooltipTarget = 'refine_next'; tooltipText = "Next Page"; tooltipPos = { x: mousePos.x, y: mousePos.y - 30 };
                       } else if(this.gameManager.refinePaginationButtons.cancel?.isHovered) {
                            newTooltipTarget = 'refine_cancel'; tooltipText = "Cancel Refine"; tooltipPos = { x: mousePos.x + 15, y: mousePos.y };
                       } else {
                           // Check hover on cards displayed for refinement
                           const cardBoundsData = this.gameManager.calculateRefineCardBounds(this.gameManager.getRefineCardsForCurrentPage());
                            for (const boundsData of cardBoundsData) {
                                if (this.gameManager.isPointInRect(mousePos, boundsData.bounds)) {
                                     newTooltipTarget = boundsData.card;
                                     tooltipText = this.getCardTooltipText(boundsData.card);
                                     tooltipPos = { x: boundsData.bounds.x + boundsData.bounds.width / 2, y: boundsData.bounds.y - 10 }; // Above card
                                     break; // Found hovered card
                                }
                            }
                       }
                  } else {
                      // Check hover on initial Respite options (Heal/Refine buttons)
                       this.gameManager.respiteOptions.forEach(opt => {
                           if (opt.isHovered) {
                               newTooltipTarget = opt.id;
                               tooltipText = this.getRespiteOptionTooltip(opt.id);
                               tooltipPos = { x: mousePos.x + 15, y: mousePos.y };
                           }
                       });
                  }
                  break;

            case GameState.REWARD_SCREEN:
                 // Check hover on reward buttons (cards, relic, skip)
                 this.gameManager.rewardCardButtons?.forEach(btn => {
                     if (btn.isHovered) {
                          const cardDef = getCardDefinition(btn.id);
                          if(cardDef) {
                              newTooltipTarget = cardDef;
                              tooltipText = this.getCardTooltipText(new Card(cardDef)); // Create temp Card for tooltip formatting
                              tooltipPos = { x: btn.bounds.x + btn.bounds.width / 2, y: btn.bounds.y - 10 };
                          }
                     }
                 });
                 if(this.gameManager.rewardRelicButton?.isHovered) {
                     const relicDef = getRelicDefinition(this.gameManager.rewardRelicButton.id);
                      if(relicDef) {
                          newTooltipTarget = relicDef;
                          tooltipText = this.getRelicTooltipText(relicDef);
                          tooltipPos = { x: this.gameManager.rewardRelicButton.bounds.x + this.gameManager.rewardRelicButton.bounds.width / 2, y: this.gameManager.rewardRelicButton.bounds.y - 10 };
                      }
                 }
                 if(this.gameManager.rewardSkipButton?.isHovered) {
                     newTooltipTarget = 'skip_reward';
                     tooltipText = "Skip rewards and continue.";
                      tooltipPos = { x: mousePos.x, y: mousePos.y - 30 };
                 }
                 break;

             // Add cases for other states (Shop, Event, Main Menu) if they have tooltips
        }

        // Update tooltip visibility and position
        if (newTooltipTarget) {
            // Only show if the target changed or text changed (to avoid flicker)
            // Or always update position if target is the same? Always update position.
            this.showTooltip(tooltipText, tooltipPos.x, tooltipPos.y, newTooltipTarget);
        } else {
            this.hideTooltip();
        }
    }

    showTooltip(text, x, y, targetElement = null) {
        this.tooltip.text = text;
        this.tooltip.targetElement = targetElement;
        this.tooltip.visible = true;

        // Calculate tooltip dimensions based on text content
        this.ctx.font = '13px sans-serif'; // Font used for rendering tooltip text
        const lines = text.split('\n');
        let maxWidth = 0;
        lines.forEach(line => {
            maxWidth = Math.max(maxWidth, this.ctx.measureText(line).width);
        });
        const paddingX = 10;
        const paddingY = 5;
        const lineHeight = 16; // Estimated height per line
        this.tooltip.width = maxWidth + 2 * paddingX;
        this.tooltip.height = lines.length * lineHeight + 2 * paddingY;

        // Adjust position to keep tooltip fully on screen
        const canvasPadding = 5; // Small padding from canvas edge
        // Adjust X position
        if (x + this.tooltip.width > CANVAS_WIDTH - canvasPadding) {
            x = x - this.tooltip.width - 15; // Move left of cursor if too far right
             if (x < canvasPadding) x = canvasPadding; // Clamp to left edge if still too far
        } else {
             x = x + 15; // Default: Right of cursor
        }
        // Adjust Y position
        if (y + this.tooltip.height > CANVAS_HEIGHT - canvasPadding) {
            y = y - this.tooltip.height - 10; // Move above cursor if too low
        } else {
             y = y + 10; // Default: Below cursor
        }
         if (y < canvasPadding) {
            y = canvasPadding; // Clamp to top edge
        }


        this.tooltip.x = Math.round(x);
        this.tooltip.y = Math.round(y);
    }

    hideTooltip() {
        if (this.tooltip.visible) {
             this.tooltip.visible = false;
             this.tooltip.targetElement = null;
             this.tooltip.text = ''; // Clear text
        }
    }

    renderTooltip() {
        if (!this.tooltip.visible || !this.tooltip.text) return;

        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(this.tooltip.x, this.tooltip.y, this.tooltip.width, this.tooltip.height);

        // Border
        this.ctx.strokeStyle = '#CCC';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(this.tooltip.x, this.tooltip.y, this.tooltip.width, this.tooltip.height);

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
            this.ctx.fillText(line, this.tooltip.x + paddingX, this.tooltip.y + paddingY + index * lineHeight);
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
                        text += `\nEnemies: ${enemyNames}`;
                   } else { text += `\nEnemies: ???`; }
                   break;
              case NodeType.RESPITE: text += "\nHeal or Remove Card"; break;
              case NodeType.SHOP: text += "\nBuy Cards / Relics"; break;
              case NodeType.EVENT: text += "\nA chance encounter..."; break;
         }
         if (!node.isReachable && !node.isCurrent) {
              text += "\n(Not Reachable)";
         }
         return text;
    }

    getCardTooltipText(card) {
         if (!card || !(card instanceof Card)) return "Invalid Card";
         // Include cost, element, type, name, keywords, description
         let text = `${card.name} (${card.cost ?? 'N/A'} ${card.element})`; // Name, Cost, Element
         text += `\n[${card.type}]`; // Type
         if (card.rarity !== CardRarity.STARTER && card.rarity !== CardRarity.SPECIAL) {
              text += ` [${card.rarity}]`; // Rarity (optional)
         }
         if (card.keywords.length > 0) {
             text += `\nKeywords: ${card.keywords.join(', ')}`;
         }
         text += `\n---------------------\n${card.description}`; // Separator and Description
         return text;
    }

    getEnemyTooltipText(enemy) {
         if (!enemy || !(enemy instanceof Enemy)) return "Invalid Enemy";
         let text = `${enemy.name}\nHP: ${enemy.currentHp} / ${enemy.maxHp}`;
         text += `\nWeak: ${enemy.weakness || 'None'} | Resist: ${enemy.resistance || 'None'}`;
         // List current statuses (formatted)
         let statuses = [];
         Object.entries(enemy.statusEffects).forEach(([key, value]) => {
             let amount = 0; let durationInfo = '';
             if (typeof value === 'number') amount = value;
             else if (typeof value === 'object') { amount = value.amount; if(value.duration !== Infinity && value.duration > 0) durationInfo = ` (${value.duration}t)`; }
             if (amount > 0) statuses.push(`${key}${amount > 1 ? ':'+amount : ''}${durationInfo}`); // Show amount only if > 1 for buffs/debuffs?
         });
         if (statuses.length > 0) {
              text += `\nStatuses: ${statuses.join(', ')}`;
         }
         // Show upcoming Intent details
         if (enemy.currentMove) {
              text += `\n---------------------\nIntent: ${enemy.currentMove.description || enemy.currentMove.intentType}`;
              if (enemy.intentValue !== null) {
                  if(enemy.currentMove.intentType.includes('Attack')) text += ` (Deals ${enemy.intentValue} Bruise)`;
                  else if(enemy.currentMove.intentType.includes('Defend')) text += ` (Gains ${enemy.intentValue} Guard)`;
              }
         }
         return text;
    }

     getRelicTooltipText(relicDef) {
          if (!relicDef) return "Invalid Relic";
          let text = `${relicDef.name} [${relicDef.rarity}]`;
          text += `\n---------------------\n${relicDef.description}`;
          if (relicDef.flavorText) {
               text += `\n\n"${relicDef.flavorText}"`;
          }
          return text;
     }

      getRespiteOptionTooltip(optionId) {
          switch (optionId) {
               case 'heal': return "Restore 25% of your maximum Composure (HP).";
               case 'refine': return "Permanently remove a card from your deck for this run.";
               default: return "Unknown option.";
          }
     }

    // --- Other UI Rendering ---
    // e.g., renderConfirmationDialog(ctx) { if (this.confirmationDialog.visible) { ... } }

} // End UIManager Class
