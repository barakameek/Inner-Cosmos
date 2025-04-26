// js/core/GameState.js

// Import necessary classes (Placeholders for now, ensure paths are correct later)
import { Player } from './Player.js';
import { MapManager } from '../map/MapManager.js';
import { CombatManager } from '../combat/CombatManager.js';
import { UIManager } from '../ui/UIManager.js'; // Assuming UIManager is needed for events/shops
import * as Data from '../data.js';

/**
 * Manages the state for a single game run.
 */
export class GameState {
    // Keep existing constructor and other methods...
    constructor(playerData = null, metaProgression = null, uiManager = null) { // Add uiManager reference
        console.log("Initializing GameState for a new run...");

        this.player = null;
        this.mapManager = null;
        this.combatManager = null;
        this.uiManager = uiManager; // Store the UIManager reference
        this.metaProgression = metaProgression; // Store metaProgression reference

        this.currentFloor = 0;
        this.currentRunSeed = Date.now();
        this.runActive = false;
        this.currentEvent = null;
        this.currentShop = null;
        this.currentRestSite = null;

        console.log(`GameState created with seed: ${this.currentRunSeed}`);
    }

    startRun(playerData, metaProgression, uiManager) { // Accept uiManager
        console.log("GameState: Starting new run...");
        this.runActive = true;
        this.currentFloor = 1;
        this.uiManager = uiManager || this.uiManager; // Store UIManager if passed
        this.metaProgression = metaProgression || this.metaProgression; // Store MetaProgression

        // --- Player Initialization ---
        // Use the actual Player class now
        this.player = new Player(playerData, this.metaProgression);
        // Assign gameState reference to player AFTER player is created
        this.player.gameStateRef = this; // Give player access back to gameState if needed for artifacts

        console.log("Player Initialized:", this.player.name);

        // --- Map Initialization ---
        // Use the actual MapManager class
        this.mapManager = new MapManager(this, this.uiManager);
        this.mapManager.generateFloor(this.currentFloor);

        // --- Combat Initialization ---
        // Use the actual CombatManager class
        this.combatManager = new CombatManager(this, this.uiManager);


        // Make sure player instance is available when combat starts
        // Ready for the player to interact with the map
        console.log("Run Started. Player at node:", this.mapManager.currentNodeId);
         // Initial UI update for map info
        this.uiManager.updatePlayerMapInfo(this.player, this.currentFloor); // Ensure UI manager is ready
    }

    // Keep endRun method...
     endRun(victory) {
        if (!this.runActive) return;

        console.log(`GameState: Ending run. Victory: ${victory}`);
        this.runActive = false;

        // Award meta-progression (Insight) based on run performance
        if (this.metaProgression && this.player.insightThisRun > 0) {
            console.log(`Adding ${this.player.insightThisRun} insight to meta progression.`);
            this.metaProgression.addInsight(this.player.insightThisRun);
        }
         // TODO: Record stats, unlock milestones based on victory/floor etc.
         if (victory) {
             // Track boss kill milestone? Floor completion?
             this.metaProgression?.updateMilestoneProgress('bossKilled', 1); // Example track call
         }
         this.metaProgression?.updateMilestoneProgress('runCompleted', 1);


        // Save meta-progression
        this.metaProgression?.save();

        // Transition back to the main menu or show a run summary screen
        // Use uiManager if available
        if (this.uiManager) {
            const message = `Run Ended. ${victory ? 'Victory!' : 'Defeat...'}\nInsight Gained: ${this.player.insightThisRun}`;
             this.uiManager.showModal(message, [{ text: 'Main Menu', callback: () => this.uiManager.showScreen('mainMenuScreen') }]);
        } else {
            alert(`Run Ended. Victory: ${victory}. You gained ${this.player.insightThisRun} Insight this run.`);
            // Manually show main menu if UI manager isn't robustly handling this yet
            document.getElementById('mainMenuScreen')?.classList.add('active');
            document.getElementById('mapScreen')?.classList.remove('active'); // Hide map screen
             document.getElementById('combatScreen')?.classList.remove('active'); // Hide combat screen

        }
    }


    // --- NEW METHODS ---

    /**
     * Handles the logic when the player enters a new map node.
     * Called by MapManager.moveToNode().
     * @param {MapNode} node - The node the player just entered.
     */
    handleNodeEntry(node) {
        if (!node || !this.runActive) return;

        console.log(`GameState: Entering node ${node.id} (Type: ${node.type})`);

        // --- Trigger Actions Based on Node Type ---
        switch (node.type) {
            case 'combat':
            case 'elite':
                if (node.data.enemies && node.data.enemies.length > 0) {
                    this.enterCombat(node.data.enemies);
                } else {
                    console.warn(`Node ${node.id} is combat/elite but has no enemy data! Completing node.`);
                    this.completeNode(node.id); // Treat as completed if no enemies
                }
                break;

            case 'event':
                this.triggerEvent(node.data.eventId);
                break;

            case 'shop':
                this.enterShop();
                break;

            case 'rest':
                this.enterRestSite();
                break;

            case 'boss':
                 if (node.data.enemies && node.data.enemies.length > 0) {
                     console.log("Approaching the Boss!");
                     // Maybe show a pre-boss confirmation?
                     this.enterCombat(node.data.enemies); // Start boss fight
                 } else {
                    console.error(`Boss node ${node.id} has no enemy data!`);
                    this.completeNode(node.id);
                 }
                break;

            case 'start':
                // Usually no action needed upon re-entering start node (shouldn't happen?)
                console.log("At start node.");
                break;

            default:
                console.warn(`Unknown node type encountered: ${node.type}. Completing node.`);
                 this.completeNode(node.id); // Default to completing unknown nodes
        }
    }

    /**
     * Initiates combat.
     * @param {string[]} enemyList - Array of enemy IDs for this combat.
     */
    enterCombat(enemyList) {
        if (this.combatManager && !this.combatManager.isActive) {
            // Now handled by CombatManager's startCombat method
            this.combatManager.startCombat(enemyList);
            // UI transition is handled by CombatManager calling UIManager
        } else {
            console.error("Cannot enter combat: CombatManager not ready or already active.");
        }
    }

     /**
      * Handles the end of a combat encounter.
      * Called by CombatManager.endCombat().
      * @param {boolean} victory - Whether the player won.
      */
     handleCombatEnd(victory) {
        if (!this.runActive) return; // Don't process if run already ended
         console.log(`GameState: Handling combat end. Victory: ${victory}`);

         if (!victory) {
             // Player lost the run
             this.endRun(false);
             return; // Stop further processing
         }

         // --- Victory Rewards ---
         // TODO: Implement reward generation logic
         const currentNode = this.mapManager.getCurrentNode();
         let insightReward = 0;
         let cardReward = null; // Or array of card choices
         let artifactReward = null;

         if (currentNode) {
             console.log(`Generating rewards for beating ${currentNode.type} node...`);
             switch (currentNode.type) {
                 case 'combat':
                     insightReward = Math.floor(Math.random() * 10) + 5; // 5-14 insight
                     if (Math.random() < 0.75) cardReward = this.generateCardReward(); // 75% chance
                     break;
                 case 'elite':
                     insightReward = Math.floor(Math.random() * 20) + 15; // 15-34 insight
                     cardReward = this.generateCardReward(true); // Higher chance of uncommon/rare?
                     if (Math.random() < 0.5) artifactReward = this.generateArtifactReward(); // 50% chance
                     break;
                 case 'boss':
                      insightReward = Math.floor(Math.random() * 50) + 50; // 50-99 insight
                      cardReward = this.generateCardReward(true, 3); // Offer 3 rare choices?
                      artifactReward = this.generateArtifactReward(true); // Guaranteed rare artifact?
                      // Check for onDeathAction from enemy data
                      const bossEnemyTemplate = Data.enemies?.find(e => e.id === currentNode.data?.enemies[0]); // Find boss template (assuming single boss)
                       if(bossEnemyTemplate?.onDeathAction?.type === 'reward' && bossEnemyTemplate.onDeathAction.insight) {
                            insightReward += bossEnemyTemplate.onDeathAction.insight;
                       }
                       if(bossEnemyTemplate?.onDeathAction?.type === 'reward' && bossEnemyTemplate.onDeathAction.artifactId) {
                            // Maybe add specific artifact instead of random rare one?
                            artifactReward = bossEnemyTemplate.onDeathAction.artifactId; // Override random artifact
                       }
                      break;
             }
         }

         // Award Insight
         if (insightReward > 0) {
             this.player.insightThisRun += insightReward;
             console.log(`Awarded ${insightReward} Insight. Run total: ${this.player.insightThisRun}`);
         }

         // --- Show Reward Screen ---
         // Use UIManager to present choices
         this.uiManager.showRewardScreen({
             insight: insightReward,
             cardChoices: cardReward ? (Array.isArray(cardReward) ? cardReward : [cardReward]) : [], // Ensure it's an array
             artifactChoice: artifactReward ? [artifactReward] : [], // Present as choice even if only one
             onComplete: () => { // Callback when player makes choices / leaves screen
                  console.log("Reward screen completed.");
                  this.completeNode(currentNode?.id);
                   // Check if it was the boss node
                   if (currentNode?.type === 'boss') {
                       this.advanceFloor(); // Move to next floor or end run victoriously
                   } else {
                        this.uiManager.showScreen('mapScreen'); // Return to map
                        this.mapManager.renderMap(); // Ensure map UI updates available moves
                   }
             }
         });
     }

    /**
     * Triggers an event based on its ID.
     * @param {string} eventId - The ID from data.js (e.g., reflection or dilemma ID).
     */
    triggerEvent(eventId) {
         console.log(`GameState: Triggering event ${eventId}`);
         // Find event data (could be reflection or dilemma)
         let eventData = null;
         let eventType = 'unknown';

         // Check reflections first
         for (const key in Data.reflectionPrompts) {
             if (Array.isArray(Data.reflectionPrompts[key])) {
                  const found = Data.reflectionPrompts[key].find(p => p.id === eventId);
                  if (found) {
                     eventData = found;
                     eventType = 'reflection';
                     break;
                  }
             } else if (Data.reflectionPrompts[key][eventId]) { // Handle nested objects like Guided/RareConcept
                  eventData = Data.reflectionPrompts[key][eventId];
                  eventType = 'reflection'; // Treat as reflection for simplicity
                   break;
             }
         }

         // If not found, check dilemmas
         if (!eventData) {
             const foundDilemma = Data.elementalDilemmas.find(d => d.id === eventId);
             if (foundDilemma) {
                 eventData = foundDilemma;
                 eventType = 'dilemma';
             }
         }


         if (eventData && this.uiManager) {
             if (eventType === 'reflection') {
                // Simple modal for reflections - just text and an OK button
                this.uiManager.showModal(eventData.text, [{ text: 'Ponder...', callback: () => {
                    // Award insight for completing reflection?
                    const insightGain = 5; // Example
                    this.player.insightThisRun += insightGain;
                     console.log(`Gained ${insightGain} Insight from reflection.`);
                     this.metaProgression?.updateMilestoneProgress('completeReflection', 1); // Track milestone
                    this.completeNode(this.mapManager.currentNodeId);
                    this.uiManager.showScreen('mapScreen'); // Return to map
                    this.mapManager.renderMap();
                }}]);
             } else if (eventType === 'dilemma') {
                 // Dilemmas need choices - more complex modal or dedicated screen
                 // TODO: Implement dilemma presentation and outcome logic
                 console.log("TODO: Implement Dilemma UI and logic for:", eventData);
                 // Example: Show text and two buttons linked to outcomes
                 this.uiManager.showModal(
                     `<strong>Dilemma:</strong> ${eventData.situation}<br><br>${eventData.question}`,
                     [
                         { text: eventData.sliderMinLabel || 'Choice 1', callback: () => this.resolveDilemma(eventId, 'min') },
                         { text: eventData.sliderMaxLabel || 'Choice 2', callback: () => this.resolveDilemma(eventId, 'max') }
                     ]
                 );
             }
         } else {
             console.error(`Event data not found for ID: ${eventId} or UIManager missing.`);
              this.completeNode(this.mapManager.currentNodeId); // Complete node anyway
             this.uiManager.showScreen('mapScreen');
         }
    }

     resolveDilemma(dilemmaId, choice) { // choice = 'min' or 'max'
         console.log(`Resolving dilemma ${dilemmaId} with choice: ${choice}`);
          const dilemmaData = Data.elementalDilemmas.find(d => d.id === dilemmaId);
         if (!dilemmaData) return;

         // --- Apply Consequences ---
         // Example: Award insight, maybe temporarily nudge attunement? Add a card? Status effect?
         let insightGain = 8; // Base insight for facing dilemma
         // Give bonus insight based on choice?
         if (choice === 'min') {
             console.log(`Outcome leaned towards ${dilemmaData.elementKeyMin}`);
             // player.applyStatus('Inspired_' + dilemmaData.elementKeyMin, 3); // Temp buff?
         } else {
             console.log(`Outcome leaned towards ${dilemmaData.elementKeyMax}`);
             // player.applyStatus('Inspired_' + dilemmaData.elementKeyMax, 3); // Temp buff?
         }

         this.player.insightThisRun += insightGain;
         console.log(`Gained ${insightGain} Insight from dilemma.`);

          this.completeNode(this.mapManager.currentNodeId);
          this.uiManager.showScreen('mapScreen');
          this.mapManager.renderMap();
     }

    /**
     * Enters the shop node.
     */
    enterShop() {
         console.log("GameState: Entering Shop...");
         // TODO: Generate shop inventory (cards, artifacts, remove service)
         const shopInventory = this.generateShopInventory();
         this.currentShop = shopInventory; // Store current shop state
         this.uiManager.showScreen('shopScreen');
         this.uiManager.renderShop(shopInventory, this.player.insightThisRun); // Pass player insight for pricing display
    }

     generateShopInventory() {
         // Select 3-5 cards to sell (considering rarity)
         const cardOptions = [];
         for (let i=0; i<4; i++) {
             cardOptions.push(this.generateCardReward(false, 1, true)); // Allow common?
         }
         // Select 1-2 artifacts?
         const artifactOptions = [];
         for (let i=0; i<2; i++) {
             artifactOptions.push(this.generateArtifactReward());
         }
         // Offer card removal service?
         const removalCost = 75; // Example cost

         return {
             cards: cardOptions.map(cardId => ({ cardId: cardId, cost: this.getCardCost(cardId) })), // Add costs
             artifacts: artifactOptions.map(artifactId => ({ artifactId: artifactId, cost: this.getArtifactCost(artifactId)})),
             removalAvailable: true,
             removalCost: removalCost
         };
     }

     getCardCost(cardId) {
        const concept = Data.concepts.find(c => c.id === cardId);
        if (!concept) return 999;
        if (concept.rarity === 'rare') return 150;
        if (concept.rarity === 'uncommon') return 100;
        return 50; // Common cost
     }
      getArtifactCost(artifactId) {
        // Find artifact rarity from definitions
         const template = Data.ARTIFACT_TEMPLATES[artifactId]; // Assumes definitions imported as Data
        if (!template) return 999;
         if (template.rarity === 'rare') return 250;
         if (template.rarity === 'uncommon') return 175;
         return 125; // Common artifact cost
     }


     handleShopPurchase(itemType, itemId) {
         if (!this.currentShop) return false;
         let itemCost = 0;
         let purchased = false;

         if (itemType === 'card') {
             const item = this.currentShop.cards.find(i => i.cardId === itemId && !i.purchased);
             if (item && this.player.insightThisRun >= item.cost) {
                 itemCost = item.cost;
                 this.player.addCardToDeck(item.cardId); // Add card to master deck
                 item.purchased = true; // Mark as purchased in UI
                 purchased = true;
             }
         } else if (itemType === 'artifact') {
              const item = this.currentShop.artifacts.find(i => i.artifactId === itemId && !i.purchased);
              if (item && this.player.insightThisRun >= item.cost) {
                 itemCost = item.cost;
                 this.player.addArtifact(item.artifactId);
                 item.purchased = true;
                 purchased = true;
              }
         } else if (itemType === 'remove') {
             if (this.currentShop.removalAvailable && this.player.insightThisRun >= this.currentShop.removalCost) {
                 // Need UI flow to select card to remove
                 this.uiManager.showCardSelectionModal(this.player.deckManager.getMasterDeck(), (selectedCard) => {
                     if (selectedCard && this.player.deckManager.removeCardFromMasterDeck(selectedCard)) {
                         this.player.insightThisRun -= this.currentShop.removalCost;
                         this.currentShop.removalAvailable = false; // Only one removal per shop visit
                         console.log(`Purchased card removal for ${this.currentShop.removalCost} Insight.`);
                         this.uiManager.renderShop(this.currentShop, this.player.insightThisRun); // Update shop UI
                     }
                 });
                 return; // Return early as removal is asynchronous via modal
             } else {
                 console.log("Cannot afford card removal or already used.");
             }
         }

         if (purchased) {
             this.player.insightThisRun -= itemCost;
             console.log(`Purchased ${itemType} ${itemId} for ${itemCost} Insight.`);
             this.uiManager.renderShop(this.currentShop, this.player.insightThisRun); // Update UI
         } else {
             console.log(`Could not purchase ${itemType} ${itemId}. Not found, already purchased, or insufficient Insight.`);
         }
     }

     leaveShop() {
        console.log("GameState: Leaving Shop.");
        this.currentShop = null;
        this.completeNode(this.mapManager.currentNodeId);
        this.uiManager.showScreen('mapScreen');
        this.mapManager.renderMap();
     }


    /**
     * Enters the rest site node.
     */
    enterRestSite() {
        console.log("GameState: Entering Rest Site...");
        this.currentRestSite = { usedOption: false }; // Track if an option was used
        this.uiManager.showScreen('restSiteScreen');
        this.uiManager.renderRestSite(this.currentRestSite);
    }

     handleRestSiteAction(action) { // action = 'heal', 'upgrade', 'remove'
        if (!this.currentRestSite || this.currentRestSite.usedOption) {
            console.warn("Rest site option already used or not available.");
            return;
        }

        switch (action) {
            case 'heal':
                const healAmount = Math.floor(this.player.maxIntegrity * 0.3); // Heal 30%
                this.player.heal(healAmount);
                console.log(`Rested: Healed ${healAmount} Integrity.`);
                this.currentRestSite.usedOption = true;
                break;
            case 'upgrade':
                 // Need UI flow to select card to upgrade
                 console.log("Activating card upgrade selection...");
                 this.uiManager.showCardSelectionModal(
                     this.player.deckManager.getMasterDeck().filter(card => !card.upgraded), // Only show upgradable cards
                     (selectedCard) => {
                        if (selectedCard) {
                            const cardInDeck = this.player.deckManager.masterDeck.find(c => c.id === selectedCard.id);
                            if(cardInDeck && !cardInDeck.upgraded) {
                                cardInDeck.upgrade(); // Upgrade the card in the master deck
                                console.log(`Rested: Upgraded ${cardInDeck.name}.`);
                                this.currentRestSite.usedOption = true;
                                this.leaveRestSite(); // Automatically leave after selection
                            } else {
                                 console.warn("Selected card not found in deck or already upgraded.");
                            }
                        } else {
                             console.log("Upgrade cancelled.");
                        }
                     },
                     "Choose a Card to Meditate Upon (Upgrade)" // Modal title
                 );
                 return; // Return early, action completes asynchronously via modal
            case 'remove': // Let's call it 'journal' to fit theme
                // Need UI flow to select card to remove
                 console.log("Activating card removal selection...");
                this.uiManager.showCardSelectionModal(
                    this.player.deckManager.getMasterDeck(),
                    (selectedCard) => {
                        if (selectedCard && this.player.deckManager.removeCardFromMasterDeck(selectedCard)) {
                            console.log(`Journaled: Removed ${selectedCard.name}.`);
                            this.currentRestSite.usedOption = true;
                             this.leaveRestSite(); // Automatically leave after selection
                        } else {
                             console.log("Removal cancelled or failed.");
                        }
                    },
                    "Choose a Concept to Let Go Of (Remove)" // Modal title
                );
                return; // Return early, action completes asynchronously via modal
             default:
                 console.warn("Unknown rest site action:", action);
                 return; // Don't mark as used if action is invalid
        }

        // If an action other than modal-based ones was used, leave immediately
        if (this.currentRestSite.usedOption) {
             this.leaveRestSite();
        }
     }

     leaveRestSite() {
        console.log("GameState: Leaving Rest Site.");
        this.currentRestSite = null;
        this.completeNode(this.mapManager.currentNodeId);
        this.uiManager.showScreen('mapScreen');
        this.mapManager.renderMap();
     }

    /**
     * Marks the current node as complete.
     * @param {string} nodeId - The ID of the node being completed.
     */
    completeNode(nodeId) {
        console.log(`GameState: Completing node ${nodeId}`);
        // Logic after successfully finishing a node interaction (e.g., event resolved, shop left)
        // Could award minor passive rewards here if needed.
        // Crucially, the UI should now allow selecting the next node on the map.
        this.uiManager.updatePlayerMapInfo(this.player, this.currentFloor); // Update info in case insight changed
         this.mapManager.renderMap(); // Re-render map to enable next moves potentially
    }

     advanceFloor() {
        if (!this.runActive) return;
         console.log(`GameState: Advancing from floor ${this.currentFloor}...`);
         this.currentFloor++;
         // TODO: Check if this floor exceeds the total number of floors for the run
         if (this.currentFloor > 3) { // Example: 3 floors total
             console.log("Final floor boss defeated!");
             this.endRun(true); // End run victoriously
             return;
         }

         // Generate the next floor
         this.mapManager.generateFloor(this.currentFloor);
         // Player state persists (HP, deck, artifacts) but combat state resets via map manager setting start node
         this.currentNodeId = this.mapManager.startNodeId; // Ensure player is at the start
          this.uiManager.showScreen('mapScreen');
          this.mapManager.renderMap(); // Render the new floor
         this.uiManager.updatePlayerMapInfo(this.player, this.currentFloor);

     }

     // --- Reward Generation Helpers ---
     generateCardReward(allowRare = false, numChoices = 3, allowCommon = false) {
        const possibleConcepts = Data.concepts.filter(c => {
             // Filter out concepts player already has multiple copies of? (Max 2-3?)
             // const currentCount = this.player.deckManager.masterDeck.filter(card => card.conceptId === c.id).length;
             // if (currentCount >= 3) return false;

             // Filter by rarity
             if (!allowRare && c.rarity === 'rare') return false;
             if (!allowCommon && c.rarity === 'common' && !allowRare) return false; // Allow common only if specifically requested or if allowing rare
             return true; // Include common, uncommon, (rare if allowed)
        });

        if (possibleConcepts.length === 0) return null;

         const choices = [];
         const shuffled = this.mapManager.shuffleArray([...possibleConcepts]); // Use map manager shuffle
         for(let i=0; i<Math.min(numChoices, shuffled.length); i++) {
             choices.push(shuffled[i].id); // Return array of concept IDs
         }
        return choices;
     }

     generateArtifactReward(guaranteeRare = false) {
         const possibleArtifacts = Object.values(Data.ARTIFACT_TEMPLATES).filter(a => { // Assumes definitions are in Data
             // Filter out artifacts player already has?
             // if (this.player.artifacts.some(art => art.id === a.id)) return false;
              if (guaranteeRare && a.rarity !== 'rare') return false;
             return true;
         });

          if (possibleArtifacts.length === 0) return null;

         const randomIndex = Math.floor(Math.random() * possibleArtifacts.length);
         return possibleArtifacts[randomIndex].id; // Return artifact ID
     }


    // Keep utility methods like getDefaultDeck, getDefaultAttunements...
    // Make sure they reference Data.concepts now maybe?
    getDefaultDeckIds() { // Updated to find actual IDs if possible
        const vanilla = Data.concepts.find(c => c.name === "Vanilla Sex")?.id || 1;
        const touch = Data.concepts.find(c => c.name === "Sensual Touch")?.id || 2;
        // Add more robust basic card finding logic if needed
        return [
            vanilla, vanilla, vanilla, vanilla, vanilla,
            touch, touch, touch, touch, touch,
        ];
    }

    getDefaultAttunements() {
        return {
            Attraction: 5, Interaction: 5, Sensory: 5, Psychological: 5,
            Cognitive: 5, Relational: 5, RoleFocus: 5
        };
    }

    getCurrentNode() {
        return this.mapManager?.currentNode;
    }


} // End of GameState class
