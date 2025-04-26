// js/ui/UIManager.js

// Import Card potentially needed for rendering hints
import { Card } from '../core/Card.js'; // Assuming path is correct
// Import Artifact potentially needed
import { Artifact } from '../core/Artifact.js'; // Assuming path is correct


/**
 * Manages UI updates and interactions with the DOM.
 */
export class UIManager {
     // Keep existing constructor and properties...
     constructor(gameContainerId = 'gameContainer') {
        this.gameContainer = document.getElementById(gameContainerId);
        if (!this.gameContainer) {
            throw new Error(`UIManager Error: Game container with ID "${gameContainerId}" not found!`);
        }

        // Store gameState reference when available
        this.gameState = null;

        this.screens = {};
        this.currentScreen = null;

        // --- Specific UI Element References ---
        // ... (keep all existing references) ...
        this.rewardScreen = document.getElementById('rewardScreen'); // Needs adding to index.html
        this.rewardCardsArea = document.getElementById('rewardCards'); // Needs adding
        this.rewardArtifactsArea = document.getElementById('rewardArtifacts'); // Needs adding
        this.rewardInsightText = document.getElementById('rewardInsight'); // Needs adding
        this.rewardSkipButton = document.getElementById('rewardSkipButton'); // Needs adding

        this.shopCards = document.getElementById('shopCards');
        this.shopArtifacts = document.getElementById('shopArtifacts');
        this.shopRemoveService = document.getElementById('shopRemoveService'); // Needs adding
        this.leaveShopButton = document.getElementById('leaveShopButton');

        this.restHealButton = document.getElementById('restHealButton');
        this.restMeditateButton = document.getElementById('restMeditateButton');
        this.restJournalButton = document.getElementById('restJournalButton');
        this.leaveRestSiteButton = document.getElementById('leaveRestSiteButton');

        this.cardSelectionModal = document.getElementById('cardSelectionModal'); // Needs adding
        this.cardSelectionGrid = document.getElementById('cardSelectionGrid'); // Needs adding
        this.cardSelectionTitle = document.getElementById('cardSelectionTitle'); // Needs adding
        this.cardSelectionCancelButton = document.getElementById('cardSelectionCancel'); // Needs adding

        // Combat Screen elements (ensure these exist or use placeholders)
        this.enemyArea = document.getElementById('enemyArea');
        this.playerArea = document.getElementById('playerArea');
        this.handArea = document.getElementById('handArea');
        this.deckCountElement = document.getElementById('deckCountElement') || this._createPlaceholderSpan(this.gameContainer, 'deckCountElement', 'Deck: '); // Use existing placeholder creator
        this.discardCountElement = document.getElementById('discardCountElement') || this._createPlaceholderSpan(this.gameContainer, 'discardCountElement', 'Discard: ');
        this.endTurnButton = document.getElementById('endTurnButton');
        // ... (other refs)

        // Overlays
        this.tooltipElement = document.getElementById('tooltip');
        this.modalPopup = document.getElementById('modalPopup');
        this.modalText = document.getElementById('modalText');
        this.modalChoices = document.getElementById('modalChoices');
        this.modalCloseButton = this.modalPopup ? this.modalPopup.querySelector('.close-button') : null;

        // Card Drag State
        this.draggedCard = null;
        this.draggedCardElement = null;
        this.currentTarget = null; // Store targeted enemy

        this._collectScreens();
        this._setupCommonListeners();
        this._setupNodeActionListeners(); // Add listeners for shop/rest buttons
        console.log("UIManager initialized.");
    }

    // --- NEW ---
    /**
     * Stores a reference to the GameState for callbacks.
     * Should be called after GameState is initialized.
     */
    setGameState(gameState) {
        this.gameState = gameState;
         // Assign gameState reference to subordinate managers if they exist and need it
         // e.g., this.mapManager?.setGameState(gameState);
    }
    // --- END NEW ---

    // Keep _collectScreens, _setupCommonListeners, showScreen...

     _collectScreens() {
        const screenElements = this.gameContainer.querySelectorAll('.screen');
        screenElements.forEach(screen => {
            this.screens[screen.id] = screen;
            screen.classList.remove('active'); // Ensure all hidden initially
            // Find specific reward/selection elements if needed
             if (screen.id === 'rewardScreen') {
                this.rewardCardsArea = screen.querySelector('#rewardCards') || this.rewardCardsArea;
                this.rewardArtifactsArea = screen.querySelector('#rewardArtifacts') || this.rewardArtifactsArea;
                this.rewardInsightText = screen.querySelector('#rewardInsight') || this.rewardInsightText;
                this.rewardSkipButton = screen.querySelector('#rewardSkipButton') || this.rewardSkipButton;
            }
             if (screen.id === 'shopScreen') {
                 this.shopCards = screen.querySelector('#shopCards') || this.shopCards;
                 this.shopArtifacts = screen.querySelector('#shopArtifacts') || this.shopArtifacts;
                 this.shopRemoveService = screen.querySelector('#shopRemoveService') || this.shopRemoveService;
                 this.leaveShopButton = screen.querySelector('#leaveShopButton') || this.leaveShopButton;
            }
             if (screen.id === 'cardSelectionModal') { // Treat modal like a screen for logic? Or handle differently?
                 this.cardSelectionModal = screen; // Reference the modal itself
                 this.cardSelectionGrid = screen.querySelector('#cardSelectionGrid') || this.cardSelectionGrid;
                 this.cardSelectionTitle = screen.querySelector('#cardSelectionTitle') || this.cardSelectionTitle;
                 this.cardSelectionCancelButton = screen.querySelector('#cardSelectionCancel') || this.cardSelectionCancelButton;
            }
        });
        console.log("UIManager: Found screens:", Object.keys(this.screens));
    }

     _setupCommonListeners() {
        if (this.modalCloseButton) {
            this.modalCloseButton.onclick = () => this.hideModal();
        }
        window.onclick = (event) => {
            if (event.target == this.modalPopup && this.modalPopup.style.display === 'block') {
                 this.hideModal();
            }
             // Close card selection modal if clicking outside?
             if (event.target == this.cardSelectionModal && this.cardSelectionModal.style.display === 'block') {
                this.hideCardSelectionModal(true); // Pass true to indicate cancellation
             }
        };
        // Tooltips...
    }

     _setupNodeActionListeners() {
         // Shop Listeners
         if (this.leaveShopButton) {
             this.leaveShopButton.onclick = () => this.gameState?.leaveShop();
         }
         // Add listeners for buying cards/artifacts dynamically when rendering shop

         // Rest Site Listeners
         if (this.restHealButton) {
             this.restHealButton.onclick = () => this.gameState?.handleRestSiteAction('heal');
         }
          if (this.restMeditateButton) {
              this.restMeditateButton.onclick = () => this.gameState?.handleRestSiteAction('upgrade');
         }
          if (this.restJournalButton) {
              this.restJournalButton.onclick = () => this.gameState?.handleRestSiteAction('remove');
         }
         if (this.leaveRestSiteButton) {
              this.leaveRestSiteButton.onclick = () => this.gameState?.leaveRestSite();
         }

         // Card Selection Modal Cancel Button
         if (this.cardSelectionCancelButton) {
             this.cardSelectionCancelButton.onclick = () => this.hideCardSelectionModal(true); // Cancel
         }
     }

    // Keep updateCombatUI, updatePlayerCombatInfo, updateDeckDiscardCounts, renderEnemies, getIntentText...
    // Keep renderHand, _setupDropZones, createCardElement, enablePlayerInput...
    // Keep Tooltip methods...
    // Keep Modal methods...

    // --- NEW UI Rendering Methods ---

    /**
     * Displays the post-combat reward screen.
     * @param {object} rewards - Object containing reward details { insight, cardChoices[], artifactChoice[], onComplete }
     */
    showRewardScreen(rewards) {
        if (!this.rewardScreen || !this.gameState) {
             console.error("Reward screen element or gameState not found, cannot show rewards.");
             // Fallback: just give insight and complete node?
             if (rewards.insight && this.gameState.player) this.gameState.player.insightThisRun += rewards.insight;
             rewards.onComplete(); // Call completion callback immediately
             return;
        }
        console.log("Showing Reward Screen:", rewards);

        // Display Insight Gain
        if (this.rewardInsightText) {
            this.rewardInsightText.textContent = `Insight Gained: ${rewards.insight || 0}`;
        }

        // Display Card Choices
        if (this.rewardCardsArea) {
            this.rewardCardsArea.innerHTML = '<h3>Choose a Concept:</h3>';
            if (rewards.cardChoices && rewards.cardChoices.length > 0) {
                rewards.cardChoices.forEach(cardId => {
                    const card = new Card(cardId); // Create temporary card instance for display
                    if (card.conceptId !== -1) {
                        const cardElement = this.createCardElement(card); // Use existing card renderer
                        cardElement.onclick = () => {
                            console.log(`Selected card reward: ${card.name}`);
                            this.gameState.player.addCardToDeck(cardId);
                             // TODO: Add visual confirmation, disable other choices
                            this.rewardCardsArea.innerHTML = `<p>Acquired: ${card.name}</p>`; // Simple feedback
                            // Potentially call onComplete only after ALL choices made? Or immediately? Design choice.
                        };
                        this.rewardCardsArea.appendChild(cardElement);
                    }
                });
            } else {
                 this.rewardCardsArea.innerHTML += '<p>No concepts resonated...</p>';
            }
        }

        // Display Artifact Choice
        if (this.rewardArtifactsArea) {
             this.rewardArtifactsArea.innerHTML = '<h3>Choose a Relic:</h3>';
             if (rewards.artifactChoice && rewards.artifactChoice.length > 0) {
                  rewards.artifactChoice.forEach(artifactId => {
                      const artifact = new Artifact(artifactId); // Create temporary artifact instance
                      if (artifact.id !== 'error_artifact') {
                          const artifactElement = document.createElement('div');
                          artifactElement.innerHTML = artifact.getDisplayHtml(); // Use artifact display method
                          artifactElement.style.border = '1px solid #ccc';
                          artifactElement.style.padding = '5px';
                          artifactElement.style.margin = '5px';
                          artifactElement.style.cursor = 'pointer';
                          artifactElement.onclick = () => {
                              console.log(`Selected artifact reward: ${artifact.name}`);
                              this.gameState.player.addArtifact(artifactId);
                               // TODO: Add visual confirmation
                              this.rewardArtifactsArea.innerHTML = `<p>Acquired: ${artifact.name}</p>`;
                           };
                          this.rewardArtifactsArea.appendChild(artifactElement);
                      }
                  });
             } else {
                  this.rewardArtifactsArea.innerHTML += '<p>No relics found...</p>';
             }
        }


        // Setup Skip/Continue Button
        if (this.rewardSkipButton) {
            this.rewardSkipButton.textContent = 'Continue'; // Or 'Skip All' if choices exist
            this.rewardSkipButton.onclick = () => {
                 console.log("Skipping / Continuing from rewards...");
                 rewards.onComplete(); // Call the completion callback provided by GameState
            };
        }

        this.showScreen('rewardScreen');
    }

    /**
     * Renders the shop interface.
     * @param {object} shopInventory - The inventory object from GameState.
     * @param {number} playerInsight - Current player insight for display.
     */
     renderShop(shopInventory, playerInsight) {
         if (!this.shopCards || !this.shopArtifacts || !this.shopRemoveService || !this.gameState) return;
         console.log("Rendering Shop:", shopInventory);

          // Update player insight display somewhere (e.g., in a header)
          const insightDisplay = document.getElementById('shopInsightDisplay') || this._createPlaceholderSpan(this.screens['shopScreen'], 'shopInsightDisplay', 'Insight: ');
          insightDisplay.innerHTML = `Insight: ${playerInsight} <i class='fas fa-brain insight-icon'></i>`;


         // Render Cards
         this.shopCards.innerHTML = '<h3>Concepts for Sale:</h3>';
         shopInventory.cards.forEach((item, index) => {
            const card = new Card(item.cardId);
             if (card.conceptId === -1) return;

             const shopItemDiv = document.createElement('div');
             shopItemDiv.className = 'shop-item card-item';
             const cardElement = this.createCardElement(card); // Reuse card rendering
             shopItemDiv.appendChild(cardElement);

             const priceButton = document.createElement('button');
             priceButton.textContent = `Buy (${item.cost} Insight)`;
             priceButton.disabled = item.purchased || playerInsight < item.cost;
             priceButton.onclick = () => {
                  this.gameState.handleShopPurchase('card', item.cardId);
             };

             shopItemDiv.appendChild(priceButton);
             this.shopCards.appendChild(shopItemDiv);
         });

          // Render Artifacts
          this.shopArtifacts.innerHTML = '<h3>Relics for Sale:</h3>';
          shopInventory.artifacts.forEach((item, index) => {
               const artifact = new Artifact(item.artifactId);
               if (artifact.id === 'error_artifact') return;

              const shopItemDiv = document.createElement('div');
              shopItemDiv.className = 'shop-item artifact-item';
              shopItemDiv.style.border = '1px solid #ccc';
              shopItemDiv.style.padding = '5px';
              shopItemDiv.style.margin = '5px';
              shopItemDiv.innerHTML = artifact.getDisplayHtml();


              const priceButton = document.createElement('button');
              priceButton.textContent = `Buy (${item.cost} Insight)`;
              priceButton.style.marginLeft = '10px';
              priceButton.disabled = item.purchased || playerInsight < item.cost;
              priceButton.onclick = () => {
                   this.gameState.handleShopPurchase('artifact', item.artifactId);
              };

              shopItemDiv.appendChild(priceButton);
              this.shopArtifacts.appendChild(shopItemDiv);
          });

          // Render Card Removal Service
          this.shopRemoveService.innerHTML = '<h3>Refinement Service:</h3>';
          const removeButton = document.createElement('button');
          removeButton.textContent = `Let Go of a Concept (${shopInventory.removalCost} Insight)`;
          removeButton.disabled = !shopInventory.removalAvailable || playerInsight < shopInventory.removalCost;
          removeButton.onclick = () => {
               this.gameState.handleShopPurchase('remove');
          };
          this.shopRemoveService.appendChild(removeButton);
          if (!shopInventory.removalAvailable) {
              const usedText = document.createElement('span');
              usedText.textContent = ' (Service Used)';
              usedText.style.fontStyle = 'italic';
              this.shopRemoveService.appendChild(usedText);
          }
     }

    /**
     * Updates the display of the rest site buttons.
     * @param {object} restSiteState - State object { usedOption: boolean }
     */
     renderRestSite(restSiteState) {
         if (!this.restHealButton || !this.restMeditateButton || !this.restJournalButton) return;
         const used = restSiteState.usedOption;
         this.restHealButton.disabled = used;
         this.restMeditateButton.disabled = used;
         this.restJournalButton.disabled = used;
         this.leaveRestSiteButton.textContent = used ? "Continue" : "Leave";

         // Add visual cue that an option was used?
         const usedIndicator = this.screens['restSiteScreen']?.querySelector('#restUsedIndicator') || this._createPlaceholderSpan(this.screens['restSiteScreen'], 'restUsedIndicator');
         usedIndicator.textContent = used ? "You feel rested. Time to move on." : "Choose one action:";
     }

    /**
     * Shows a modal for selecting a card from a list.
     * @param {Card[]} cardsToShow - Array of Card objects to display.
     * @param {function} onSelectCallback - Function to call with the selected Card object (or null if cancelled).
     * @param {string} title - Optional title for the modal.
     */
     showCardSelectionModal(cardsToShow, onSelectCallback, title = "Select a Card") {
         if (!this.cardSelectionModal || !this.cardSelectionGrid || !this.cardSelectionTitle || !this.gameState) {
             console.error("Card selection modal elements or gameState not found.");
             onSelectCallback(null); // Callback with null indicating failure/cancel
             return;
         }

          // Store callback for later use
          this._currentCardSelectionCallback = onSelectCallback;

         this.cardSelectionTitle.textContent = title;
         this.cardSelectionGrid.innerHTML = ''; // Clear previous cards

         if (cardsToShow.length === 0) {
             this.cardSelectionGrid.innerHTML = '<p>No options available.</p>';
             // Optionally disable cancel button if needed, or just let it close
         } else {
             cardsToShow.forEach(card => {
                 const cardElement = this.createCardElement(card); // Reuse card renderer
                 cardElement.style.margin = '5px'; // Add some spacing
                 cardElement.onclick = () => {
                     this.hideCardSelectionModal(false, card); // Pass false (not cancelled) and selected card
                 };
                 this.cardSelectionGrid.appendChild(cardElement);
             });
         }

         this.cardSelectionModal.style.display = 'block'; // Show the modal
     }

     /**
      * Hides the card selection modal and triggers the callback.
      * @param {boolean} cancelled - Whether the selection was cancelled by the user.
      * @param {Card | null} selectedCard - The card that was selected, or null if cancelled.
      */
     hideCardSelectionModal(cancelled = true, selectedCard = null) {
         if (!this.cardSelectionModal) return;

         this.cardSelectionModal.style.display = 'none'; // Hide the modal

         // Trigger the stored callback
         if (this._currentCardSelectionCallback && typeof this._currentCardSelectionCallback === 'function') {
             if (cancelled) {
                 console.log("Card selection cancelled.");
                 this._currentCardSelectionCallback(null); // Callback with null for cancellation
             } else {
                 console.log(`Card selected: ${selectedCard?.name}`);
                 this._currentCardSelectionCallback(selectedCard); // Callback with the chosen card
             }
         }
         this._currentCardSelectionCallback = null; // Clear the callback
     }

     // --- Add Map Rendering Methods from MapManager.js Example ---
     // (Copied from previous response's example snippet for completeness)
      renderMap(nodes, currentNodeId, connections) {
         const mapContainer = this.mapArea; // Use the reference stored in constructor
         if (!mapContainer || !this.gameState || !this.gameState.mapManager) {
             console.error("Cannot render map: Map area or managers not found.");
             return;
         }
         mapContainer.innerHTML = ''; // Clear previous map
         const mapSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
         mapSvg.setAttribute('width', '100%');
         mapSvg.setAttribute('height', '100%');
         mapSvg.style.backgroundColor = '#34495e';

         // Render Connections (Lines) first
         connections.forEach(conn => {
             const fromNode = nodes[conn.from];
             const toNode = nodes[conn.to];
             if (fromNode && toNode) {
                 const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                 line.setAttribute('x1', fromNode.position.x);
                 line.setAttribute('y1', fromNode.position.y);
                 line.setAttribute('x2', toNode.position.x);
                 line.setAttribute('y2', toNode.position.y);
                 line.setAttribute('stroke', fromNode.visited ? '#bdc3c7' : '#7f8c8d');
                 line.setAttribute('stroke-width', '2');
                 mapSvg.appendChild(line);
             }
         });

         // Render Nodes (Circles/Icons) second
         Object.values(nodes).forEach(node => {
              const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
              nodeGroup.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);

             const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
             circle.setAttribute('r', '15');
             circle.setAttribute('fill', this.getNodeColor(node.type));
             circle.setAttribute('stroke', node.id === currentNodeId ? '#f1c40f' : (node.visited ? '#555' : '#ecf0f1'));
             circle.setAttribute('stroke-width', node.id === currentNodeId ? '3' : '2');

             const iconText = document.createElementNS("http://www.w3.org/2000/svg", "text");
             iconText.setAttribute('font-family', 'FontAwesome');
             iconText.setAttribute('font-size', '16px');
             iconText.setAttribute('fill', '#fff');
             iconText.setAttribute('text-anchor', 'middle');
             iconText.setAttribute('dominant-baseline', 'central');
             iconText.textContent = this.getNodeIcon(node.type);


             nodeGroup.appendChild(circle);
             nodeGroup.appendChild(iconText);

             // Make clickable only if it's a valid next move
             const isAvailableMove = nodes[currentNodeId]?.connections.includes(node.id);
             if (isAvailableMove) {
                 nodeGroup.style.cursor = 'pointer';
                 nodeGroup.addEventListener('click', () => {
                       this.gameState.mapManager.moveToNode(node.id);
                 });
             } else {
                  nodeGroup.style.cursor = 'default';
                  nodeGroup.style.opacity = (node.id !== currentNodeId && !node.visited) ? 0.6 : 1; // Dim non-visited, non-current, non-available nodes
             }


             // Add tooltip listener
             nodeGroup.addEventListener('mouseover', (event) => {
                  let tooltipText = `Node: ${node.type.toUpperCase()}${node.visited ? ' (Visited)' : ''}`;
                  if(node.id === currentNodeId) tooltipText += " (Current)";
                  else if (!isAvailableMove && !node.visited) tooltipText += " (Unavailable)";
                  this.showTooltip(tooltipText, event.clientX, event.clientY);
             });
              nodeGroup.addEventListener('mouseout', () => {
                  this.hideTooltip();
              });
               nodeGroup.addEventListener('mousemove', (event) => {
                   this.updateTooltipPosition(event.clientX, event.clientY);
               });

              node.element = nodeGroup;
              mapSvg.appendChild(nodeGroup);
         });

         mapContainer.appendChild(mapSvg);
     }

      getNodeColor(type) { /* ... keep this method ... */
         switch (type) {
             case 'combat': return '#c0392b'; // Red
             case 'elite': return '#8e44ad'; // Purple
             case 'event': return '#2980b9'; // Blue
             case 'rest': return '#27ae60'; // Green
             case 'shop': return '#f39c12'; // Orange
             case 'boss': return '#e74c3c'; // Darker Red
             case 'start': return '#bdc3c7'; // Grey
             default: return '#7f8c8d';
         }
      }
       getNodeIcon(type) { /* ... keep this method ... */
           // Font Awesome unicode characters
          switch (type) {
              case 'combat': return '\uf06d'; // fa-fire (better than meh?)
              case 'elite': return '\uf005'; // fa-star
              case 'event': return '\uf059'; // fa-question-circle
              case 'rest': return '\uf183'; // fa-sun (placeholder for campfire/moon?)
              case 'shop': return '\uf07a'; // fa-shopping-cart
              case 'boss': return '\uf188'; // fa-skull
              case 'start': return '\uf007'; // fa-user
              default: return '?';
          }
       }

     updatePlayerMapInfo(player, floor) {
         // Ensure playerInfoMap element exists
         const infoEl = document.getElementById('playerInfoMap') || this._createPlaceholderDiv(this.gameContainer, 'playerInfoMap');
         if (!player || !player.deckManager) {
             infoEl.innerHTML = "Loading player data...";
             return;
         };

         infoEl.innerHTML = `
             <span>Floor: ${floor}</span> |
             <span>Integrity: ${player.currentIntegrity} / ${player.maxIntegrity}</span> |
             <span>Insight (Run): ${player.insightThisRun} <i class='fas fa-brain insight-icon'></i></span> |
             <span>Deck: ${player.deckManager.getMasterDeck().length}</span>
         `;
     }


    // Keep placeholder helpers _createPlaceholderSpan, _createPlaceholderDiv...
     _createPlaceholderSpan(parent, id, prefix = '') { /* ... keep ... */
          console.warn(`Creating placeholder span for missing element #${id}`);
         const span = document.createElement('span');
         span.id = id;
         span.textContent = prefix + '...';
         if(parent) parent.appendChild(span);
         else document.body.appendChild(span); // Append to body as last resort
         return span;
      }
      _createPlaceholderDiv(parent, id, prefix = '') { /* ... keep ... */
          console.warn(`Creating placeholder div for missing element #${id}`);
         const div = document.createElement('div');
         div.id = id;
         div.textContent = prefix + '...';
          if(parent) parent.appendChild(div);
          else document.body.appendChild(div);
         return div;
      }


} // End of UIManager class
