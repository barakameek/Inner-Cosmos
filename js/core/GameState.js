// js/core/GameState.js

import { Player } from './Player.js';
import { MapManager } from '../map/MapManager.js';
import { CombatManager } from '../combat/CombatManager.js';
import { UIManager } from '../ui/UIManager.js'; // Now assumed to exist
import { Card } from './Card.js'; // Needed for reward generation/display
import { Artifact } from './Artifact.js'; // Needed for reward generation/display
import * as Data from '../data.js';
// Import artifact definitions - ensure path is correct if you moved it
import { ARTIFACT_TEMPLATES } from './ArtifactDefinitions.js';
// Import enemy definitions if needed for boss drops etc. - ensure path correct
// Assuming Enemy.js exports templates or they are in Data.js
// Let's assume ENEMY_TEMPLATES are defined in Data.js or imported separately for now
// Example: const { ENEMY_TEMPLATES } = await import('../combat/EnemyDefs.js'); // If in separate file


/**
 * Manages the state for a single game run.
 */
export class GameState {
    constructor(playerData = null, metaProgression = null, uiManager = null) {
        console.log("Initializing GameState for a new run...");

        this.player = null;
        this.mapManager = null;
        this.combatManager = null;
        this.uiManager = uiManager; // Store the UIManager reference
        this.metaProgression = metaProgression; // Store metaProgression reference

        this.currentFloor = 0;
        this.currentRunSeed = Date.now();
        this.runActive = false;
        this.currentEvent = null; // Can store event state if needed across interactions
        this.currentShop = null; // Stores generated shop inventory
        this.currentRestSite = null; // Stores rest site state (e.g., if option used)

        console.log(`GameState created with seed: ${this.currentRunSeed}`);
    }

    startRun(playerData, metaProgression, uiManager) {
        console.log("GameState: Starting new run...");
        if (this.runActive) {
            console.warn("GameState: Cannot start a new run while one is active.");
            return;
        }
        this.runActive = true;
        this.currentFloor = 1;
        this.uiManager = uiManager || this.uiManager; // Ensure references are set
        this.metaProgression = metaProgression || this.metaProgression;

        // --- Player Initialization ---
        this.player = new Player(playerData, this.metaProgression);
        // Give player access back to this GameState instance AFTER it's created
        this.player.gameStateRef = this;

        console.log("Player Initialized:", this.player.name);

        // --- Map Initialization ---
        this.mapManager = new MapManager(this, this.uiManager);
        this.mapManager.generateFloor(this.currentFloor); // Includes initial render call via UIManager

        // --- Combat Initialization ---
        this.combatManager = new CombatManager(this, this.uiManager);

        console.log("Run Started. Player at node:", this.mapManager.currentNodeId);
        // Initial UI update for map info via UIManager
        this.uiManager?.updatePlayerMapInfo(this.player, this.currentFloor);
    }

    endRun(victory) {
        if (!this.runActive) return; // Prevent double execution

        const runInsight = this.player?.insightThisRun || 0;
        const finalFloor = this.currentFloor;
        const nodeTypeAtEnd = this.mapManager?.getCurrentNode()?.type || 'unknown';

        console.log(`GameState: Ending run. Victory: ${victory}. Floor: ${finalFloor}. Insight: ${runInsight}`);
        this.runActive = false; // Set inactive flag immediately

        // Award meta-progression (Insight) first
        if (this.metaProgression && runInsight > 0) {
            console.log(`Adding ${runInsight} insight to meta progression.`);
            this.metaProgression.addInsight(runInsight); // This calls save internally
        }

        // --- Check & Update Milestones based on final state ---
        if (this.metaProgression) {
            // Check state milestones using 'this' (the final GameState)
             this.metaProgression.checkStateBasedMilestones(this);

            // Track overall run milestones
            if (victory) {
                 this.metaProgression.updateMilestoneProgress('runVictory', 1);
                 // Check ascension win condition
                 const currentAsc = this.metaProgression.currentAscension || 0;
                 if (this.metaProgression.highestAscensionBeat < currentAsc) {
                     this.metaProgression.highestAscensionBeat = currentAsc;
                     console.log(`New highest Ascension beaten: ${currentAsc}`);
                     // TODO: Unlock next ascension level logic?
                     // this.metaProgression.unlockAscension(currentAsc + 1);
                 }
                 // Check floor specific wins
                 if (finalFloor >= 1) this.metaProgression.updateMilestoneProgress('beatFloor1', 1);
                 if (finalFloor >= 2) this.metaProgression.updateMilestoneProgress('beatFloor2', 1);
                 if (finalFloor >= 3) this.metaProgression.updateMilestoneProgress('beatFloor3', 1);

            } else {
                 // Track defeat type milestone
                 this.metaProgression.updateMilestoneProgress(`defeat_in_${nodeTypeAtEnd}`, 1);
                 this.metaProgression.updateMilestoneProgress(`defeat_on_floor_${finalFloor}`, 1);
            }
            this.metaProgression.updateMilestoneProgress('runCompleted', 1);

             // Save again IF milestones potentially changed something other than insight
             this.metaProgression.save();
        }


        // --- Show End Screen via UIManager ---
        if (this.uiManager) {
            const message = `<h2>Run Ended</h2>
                             <p>${victory ? 'Victory!' : 'Defeat...'}</p>
                             <p>Floor Reached: ${finalFloor}</p>
                             <p>Insight Gained: ${runInsight} <i class='fas fa-brain insight-icon'></i></p>
                             <p>Total Insight: ${this.metaProgression?.totalInsight || 0} <i class='fas fa-brain insight-icon'></i></p>`;
             this.uiManager.showModal(message, [{ text: 'Return to Menu', callback: () => {
                 this.cleanupRun();
                 this.uiManager.showScreen('mainMenuScreen');
             } }]);
        } else {
            // Fallback alert if UI manager fails
            alert(`Run Ended. Victory: ${victory}. Insight: ${runInsight}. Total Insight: ${this.metaProgression?.totalInsight || 0}.`);
            this.cleanupRun();
             // Manually attempt to show main menu
             document.getElementById('mapScreen')?.classList.remove('active');
             document.getElementById('combatScreen')?.classList.remove('active');
             document.getElementById('mainMenuScreen')?.classList.add('active');
        }
    }

    cleanupRun() {
        console.log("Cleaning up run state...");
        // Nullify references to run-specific objects
        this.player = null;
        this.mapManager = null;
        this.combatManager = null;
        this.currentEvent = null;
        this.currentShop = null;
        this.currentRestSite = null;
        this.runActive = false; // Ensure flag is false
    }

    handleNodeEntry(node) {
        if (!node || !this.runActive || !this.player) {
             console.warn("Cannot handle node entry: Node invalid, run inactive, or player missing.");
             return;
        };
        console.log(`GameState: Entering node ${node.id} (Type: ${node.type})`);
        // Minor player heal on entering non-combat nodes? Optional mechanic.
        // if (!['combat', 'elite', 'boss'].includes(node.type)) this.player?.heal(1);

        switch (node.type) {
            case 'combat':
            case 'elite':
            case 'boss':
                if (node.data.enemies && node.data.enemies.length > 0) {
                    if (node.type === 'boss') console.log("Approaching the Boss!");
                    this.enterCombat(node.data.enemies);
                } else {
                    console.warn(`Node ${node.id} is ${node.type} but has no enemy data! Completing node.`);
                    this.completeNode(node.id, { warning: "Missing enemy data" });
                }
                break;
            case 'event':
                 if (node.data.eventId) {
                    this.triggerEvent(node.data.eventId);
                 } else {
                     console.warn(`Node ${node.id} is event but has no event ID! Completing node.`);
                     this.completeNode(node.id, { warning: "Missing event ID" });
                 }
                break;
            case 'shop':
                this.enterShop();
                break;
            case 'rest':
                this.enterRestSite();
                break;
            case 'start':
                console.log("At start node.");
                 this.completeNode(node.id); // Immediately complete if re-entered
                break;
            default:
                console.warn(`Unknown node type encountered: ${node.type}. Completing node.`);
                 this.completeNode(node.id, { warning: `Unknown node type: ${node.type}` });
        }
    }

    enterCombat(enemyList) {
        if (this.combatManager && !this.combatManager.isActive) {
            this.combatManager.startCombat(enemyList);
            // UI transition should be handled within combatManager.startCombat via uiManager
        } else {
            console.error("Cannot enter combat: CombatManager not ready or already active.");
             // Potentially force completion of the node if combat can't start
             this.completeNode(this.mapManager?.currentNodeId, { error: "Combat failed to start" });
             this.uiManager?.showScreen('mapScreen'); // Go back to map screen
        }
    }

     handleCombatEnd(victory) {
        if (!this.runActive) return; // Check if run ended prematurely
         console.log(`GameState: Handling combat end. Victory: ${victory}`);

         const currentNode = this.mapManager?.getCurrentNode();
         const nodeType = currentNode?.type;

         // If player was defeated, endRun handles everything
         if (!victory) {
             this.metaProgression?.updateMilestoneProgress(`defeat_in_${nodeType || 'combat'}`, 1);
             this.endRun(false);
             return;
         }

         // --- Victory Tracking & Rewards ---
         this.metaProgression?.updateMilestoneProgress(`victory_${nodeType || 'combat'}`, 1);

         let insightReward = 0;
         let cardChoices = []; // Expecting IDs
         let artifactChoices = []; // Expecting IDs

         if (nodeType && this.player) { // Ensure player exists for rewards
             console.log(`Generating rewards for beating ${nodeType} node...`);
             try { // Wrap reward generation in try-catch
                 switch (nodeType) {
                     case 'combat':
                         insightReward = Math.floor(Math.random() * 10) + 5;
                         if (Math.random() < 0.65) cardChoices = this.generateCardReward(false, 3, true);
                         this.metaProgression?.updateMilestoneProgress('winCombat', 1);
                         break;
                     case 'elite':
                         insightReward = Math.floor(Math.random() * 20) + 15;
                         cardChoices = this.generateCardReward(true, 3, true);
                         if (Math.random() < 0.6) artifactChoices = [this.generateArtifactReward()].filter(a => a !== null);
                         this.metaProgression?.updateMilestoneProgress('winElite', 1);
                         break;
                     case 'boss':
                          insightReward = Math.floor(Math.random() * 50) + 50;
                          cardChoices = this.generateCardReward(true, 3, false);
                          artifactChoices = [this.generateArtifactReward(true)].filter(a => a !== null);

                          // Check for specific boss drop
                          const bossEnemyId = currentNode?.data?.enemies[0];
                           // Import ENEMY_TEMPLATES at top of file or ensure it's in Data
                           const bossTemplate = ENEMY_TEMPLATES[bossEnemyId]; // Adjust if definitions are elsewhere
                           if(bossTemplate?.onDeathAction?.type === 'reward' && bossTemplate.onDeathAction.insight) {
                                insightReward += bossTemplate.onDeathAction.insight;
                           }
                           if(bossTemplate?.onDeathAction?.type === 'reward' && bossTemplate.onDeathAction.artifactId) {
                                if(this.metaProgression?.isArtifactUnlocked(bossTemplate.onDeathAction.artifactId)) {
                                    artifactChoices = [bossTemplate.onDeathAction.artifactId];
                                    console.log(`Awarding specific boss drop artifact: ${bossTemplate.onDeathAction.artifactId}`);
                                } else {
                                    console.log(`Boss drop artifact ${bossTemplate.onDeathAction.artifactId} not unlocked yet.`);
                                }
                           }
                          this.metaProgression?.updateMilestoneProgress('winBoss', 1);
                          break;
                     default:
                          console.warn(`No specific reward defined for node type: ${nodeType}`);
                 }
             } catch (error) {
                 console.error("Error generating rewards:", error);
                 // Ensure basic insight is still awarded?
                 insightReward = insightReward || 5;
             }

             // Award Insight
             if (insightReward > 0) {
                 this.player.insightThisRun += insightReward;
                 console.log(`Awarded ${insightReward} Insight. Run total: ${this.player.insightThisRun}`);
             }
         } else {
              console.warn("Cannot generate rewards: Node type or player missing.");
         }


         // --- Show Reward Screen via UIManager ---
         if (this.uiManager) {
             this.uiManager.showRewardScreen({
                 insight: insightReward,
                 cardChoices: cardChoices || [],
                 artifactChoices: artifactChoices || [],
                 onComplete: () => {
                      console.log("Reward screen completed.");
                      // Complete the node AFTER rewards are handled
                      this.completeNode(currentNode?.id);
                       if (nodeType === 'boss') {
                           this.advanceFloor(); // Move to next floor or end run
                       } else {
                            // Return to map screen
                            this.uiManager.showScreen('mapScreen');
                            this.mapManager?.renderMap(); // Update map display
                       }
                 }
             });
         } else {
             console.error("UIManager not found, cannot show rewards!");
             // Fallback: Silently complete node and advance if boss
              this.completeNode(currentNode?.id);
              if (nodeType === 'boss') this.advanceFloor();
              else this.uiManager?.showScreen('mapScreen'); // Try to show map anyway
         }
     }

     triggerEvent(eventId) {
         console.log(`GameState: Triggering event ${eventId}`);
         let eventData = null;
         let eventType = 'unknown';
         let sourceKey = null;

         // Find event data
         for (const key in Data.reflectionPrompts) {
             const source = Data.reflectionPrompts[key];
             if (Array.isArray(source)) {
                 const found = source.find(p => p.id === eventId);
                 if (found) { eventData = found; eventType = 'reflection'; sourceKey = key; break; }
             } else if (typeof source === 'object' && source !== null) {
                 if (source[eventId]) {
                    eventData = source[eventId]; eventType = 'reflection'; sourceKey = key; break;
                 }
             }
         }
          if (!eventData) {
             const foundDilemma = Data.elementalDilemmas.find(d => d.id === eventId);
             if (foundDilemma) { eventData = foundDilemma; eventType = 'dilemma'; }
         }

         if (eventData && this.uiManager && this.player) {
             const currentNodeId = this.mapManager?.currentNodeId;

             if (eventType === 'reflection') {
                let rewardText = "";
                const insightGain = 5;
                 this.player.insightThisRun += insightGain;
                 rewardText = `<br><br><i>(Gained ${insightGain} <i class='fas fa-brain insight-icon'></i> Insight)</i>`;
                 this.metaProgression?.updateMilestoneProgress('completeReflection', 1, { eventId: eventId });
                  if (sourceKey === 'Dissonance') {
                      this.metaProgression?.updateMilestoneProgress('completeReflectionDissonance', 1);
                  }
                 this.uiManager.showModal(eventData.text + rewardText, [{ text: 'Ponder...', callback: () => {
                     this.completeNode(currentNodeId);
                     this.uiManager.showScreen('mapScreen');
                     this.mapManager?.renderMap();
                 }}]);
             } else if (eventType === 'dilemma') {
                  this.uiManager.showModal(
                     `<strong>Dilemma:</strong> ${eventData.situation}<hr>${eventData.question}`,
                     [
                         { text: eventData.sliderMinLabel || 'Choice 1', callback: () => this.resolveDilemma(eventId, 'min', currentNodeId) },
                         { text: eventData.sliderMaxLabel || 'Choice 2', callback: () => this.resolveDilemma(eventId, 'max', currentNodeId) }
                     ]
                 );
             } else {
                  console.error(`Event type ${eventType} not handled for ID: ${eventId}`);
                   this.completeNode(currentNodeId);
                  this.uiManager?.showScreen('mapScreen');
             }
         } else {
             console.error(`Event data for ${eventId}, UIManager, or Player missing.`);
              this.completeNode(this.mapManager?.currentNodeId);
             this.uiManager?.showScreen('mapScreen');
         }
     }

     resolveDilemma(dilemmaId, choice, nodeIdToComplete) {
         console.log(`Resolving dilemma ${dilemmaId} with choice: ${choice}`);
         const dilemmaData = Data.elementalDilemmas.find(d => d.id === dilemmaId);
         if (!dilemmaData || !this.player || !this.uiManager) return;

         let insightGain = 10;
         const chosenElement = (choice === 'min') ? dilemmaData.elementKeyMin : dilemmaData.elementKeyMax;
         let outcomeText = `Leaned towards ${chosenElement}. Gained ${insightGain} <i class='fas fa-brain insight-icon'></i> Insight.`;

         // Find a related common card based on the chosen element's focus
         const potentialCard = Data.concepts.find(c =>
             c.primaryElement === chosenElement &&
             c.rarity === 'common' &&
             this.metaProgression?.isConceptUnlocked(c.id) // Check if unlocked
         );

         if (potentialCard) {
             this.player.addCardToDeck(potentialCard.id);
             outcomeText += `<br>Gained Concept: ${potentialCard.name}`;
             console.log(`Added card ${potentialCard.id} (${potentialCard.name}) from dilemma choice.`);
              this.metaProgression?.updateMilestoneProgress('gainCardFromEvent', 1);
         } else {
              console.log(`No suitable common card found/unlocked for element ${chosenElement}.`);
               // Maybe give a small integrity heal or temp block instead?
               // this.player.heal(5); outcomeText += "<br>Felt slightly reassured.";
         }


         this.player.insightThisRun += insightGain;
         console.log(`Gained ${insightGain} Insight from dilemma.`);
         this.metaProgression?.updateMilestoneProgress('resolveDilemma', 1);

         // Show outcome briefly before completing node
         this.uiManager.showModal(outcomeText, [{ text: 'Continue', callback: () => {
              this.completeNode(nodeIdToComplete);
              this.uiManager.showScreen('mapScreen');
              this.mapManager?.renderMap();
         }}]);
     }

    enterShop() {
         console.log("GameState: Entering Shop...");
         if (!this.player || !this.uiManager) {
              console.error("Cannot enter shop: Player or UIManager missing.");
              this.completeNode(this.mapManager?.currentNodeId, {error: "Shop failed to load"});
              this.uiManager?.showScreen('mapScreen');
              return;
         }
         const shopInventory = this.generateShopInventory();
         this.currentShop = shopInventory;
         this.uiManager.showScreen('shopScreen');
         this.uiManager.renderShop(shopInventory, this.player.insightThisRun);
    }

     generateShopInventory() {
         const cardOptions = [];
         const numCardChoices = 3 + (this.metaProgression?.getStartingBonus('shopCardChoicesBonus') || 0);
         const generatedIds = new Set(); // Prevent duplicates in this specific shop instance

          for (let i=0; i < numCardChoices; i++) {
             const allowRareShop = this.currentFloor > 1 && Math.random() < 0.2;
             const choices = this.generateCardReward(allowRareShop, 1, true); // Generate one potential card ID
             if (choices && choices.length > 0 && !generatedIds.has(choices[0])) {
                 generatedIds.add(choices[0]);
                 cardOptions.push(choices[0]);
             } else {
                 i--; // Try again if no card generated or it was a duplicate
             }
         }

         const artifactOptions = [];
         const numArtifactChoices = 1 + (this.metaProgression?.getStartingBonus('shopArtifactChoicesBonus') || 0);
          for (let i=0; i < numArtifactChoices; i++) {
                const allowRareArtifact = this.currentFloor > 1 && Math.random() < 0.3;
                const artifactId = this.generateArtifactReward(allowRareArtifact);
                 // Prevent duplicate artifacts *in the same shop instance*
                if (artifactId && !generatedIds.has(artifactId)) {
                     generatedIds.add(artifactId);
                     artifactOptions.push(artifactId);
                } else if (artifactId) {
                     i--; // Try again if duplicate generated
                }
          }

         const baseRemovalCost = 75;
         const removalCost = baseRemovalCost + (this.metaProgression?.getStartingBonus('shopRemovalCostIncrease') || 0);

         return {
             cards: cardOptions.map(cardId => ({ cardId: cardId, cost: this.getCardCost(cardId), purchased: false })),
             artifacts: artifactOptions.map(artifactId => ({ artifactId: artifactId, cost: this.getArtifactCost(artifactId), purchased: false })),
             removalAvailable: true,
             removalCost: removalCost
         };
     }

     getCardCost(cardId) {
        const concept = Data.concepts.find(c => c.id === cardId);
        if (!concept) return 999;
         let baseCost = 50;
         if (concept.rarity === 'uncommon') baseCost = 100;
         else if (concept.rarity === 'rare') baseCost = 150;
        return Math.round(baseCost);
     }
      getArtifactCost(artifactId) {
         const template = ARTIFACT_TEMPLATES[artifactId]; // Use imported defs
         if (!template) return 999;
         let baseCost = 125;
         if (template.rarity === 'uncommon') baseCost = 175;
         else if (template.rarity === 'rare') baseCost = 250;
         return Math.round(baseCost);
     }

     handleShopPurchase(itemType, itemId) {
         if (!this.currentShop || !this.player || !this.uiManager) return false;
         let itemCost = 0;
         let purchasedItem = null;

         if (itemType === 'card') {
             const item = this.currentShop.cards.find(i => i.cardId === itemId && !i.purchased);
             if (item && this.player.insightThisRun >= item.cost) {
                 itemCost = item.cost;
                 this.player.addCardToDeck(item.cardId); // Add card to master deck
                 item.purchased = true; // Mark as purchased in UI
                 purchasedItem = item;
                 this.metaProgression?.updateMilestoneProgress('buyCard', 1); // Track milestone
             } else if (!item) { console.warn("Shop item not found or already purchased.");}
               else { this.uiManager.showActionFeedback("Not enough Insight!", "warning"); return; } // Insufficient funds
         } else if (itemType === 'artifact') {
              const item = this.currentShop.artifacts.find(i => i.artifactId === itemId && !i.purchased);
              if (item && this.player.insightThisRun >= item.cost) {
                 itemCost = item.cost;
                 this.player.addArtifact(item.artifactId); // Player handles artifact creation
                 item.purchased = true;
                 purchasedItem = item;
                 this.metaProgression?.updateMilestoneProgress('buyArtifact', 1); // Track milestone
              } else if (!item) { console.warn("Shop item not found or already purchased.");}
                else { this.uiManager.showActionFeedback("Not enough Insight!", "warning"); return; } // Insufficient funds
         } else if (itemType === 'remove') {
             if (this.currentShop.removalAvailable && this.player.insightThisRun >= this.currentShop.removalCost) {
                   if (this.player.deckManager.masterDeck.length <= 5) { // Min deck size check
                       this.uiManager.showActionFeedback("Deck too small to remove cards!", "warning");
                       return; // Prevent removal
                   }
                  // Use UIManager to show card selection
                 this.uiManager.showCardSelectionModal(
                     this.player.deckManager.getMasterDeck(), // Show full deck
                     (selectedCard) => { // Callback function
                         if (selectedCard) {
                              // Attempt removal via Player -> DeckManager
                              if (this.player.removeCardFromDeck(selectedCard)) { // Use player method now
                                 this.player.insightThisRun -= this.currentShop.removalCost;
                                 this.currentShop.removalAvailable = false; // Only one removal per shop visit
                                 console.log(`Purchased card removal for ${this.currentShop.removalCost}. Insight left: ${this.player.insightThisRun}`);
                                  this.metaProgression?.updateMilestoneProgress('removeCard', 1); // Track milestone
                                 this.uiManager?.renderShop(this.currentShop, this.player.insightThisRun); // Update shop UI
                              } else {
                                  console.warn("Failed to remove selected card from deck manager.");
                                   this.uiManager.showActionFeedback("Failed to remove card.", "error");
                              }
                         } else {
                              console.log("Card removal cancelled by user.");
                         }
                     },
                     `Choose a Concept to Remove (${this.currentShop.removalCost} <i class='fas fa-brain insight-icon'></i>)` // Modal title
                 );
             } else {
                 console.log("Cannot afford card removal or already used.");
                  this.uiManager?.showActionFeedback("Cannot afford removal or service used", "warning");
             }
             return; // Return early as removal is asynchronous
         }

         if (purchasedItem) {
             this.player.insightThisRun -= itemCost;
             console.log(`Purchased ${itemType} ${itemId} for ${itemCost}. Insight left: ${this.player.insightThisRun}`);
             this.uiManager.renderShop(this.currentShop, this.player.insightThisRun); // Update UI
         } else if (itemType !== 'remove') { // Don't log failure again if it was removal attempt
             console.log(`Could not purchase ${itemType} ${itemId}.`);
             // UI Feedback for insufficient funds handled above
         }
     }

     leaveShop() {
        console.log("GameState: Leaving Shop.");
        const currentNodeId = this.mapManager?.currentNodeId; // Get ID before resetting shop
        this.currentShop = null;
        this.completeNode(currentNodeId); // Complete the node
        this.uiManager?.showScreen('mapScreen'); // Show map
        this.mapManager?.renderMap(); // Re-render map
     }


    enterRestSite() {
        console.log("GameState: Entering Rest Site...");
         if (!this.player || !this.uiManager) {
              console.error("Cannot enter rest site: Player or UIManager missing.");
               this.completeNode(this.mapManager?.currentNodeId, {error: "Rest site failed to load"});
               this.uiManager?.showScreen('mapScreen');
              return;
         }
        this.currentRestSite = { usedOption: false };
        this.uiManager.showScreen('restSiteScreen');
        this.uiManager.renderRestSite(this.currentRestSite);
    }

     handleRestSiteAction(action) {
        if (!this.currentRestSite || this.currentRestSite.usedOption || !this.uiManager || !this.player) {
             console.warn("Rest site option already used, not available, or managers missing.");
             // Provide feedback if player clicks disabled button
             if (this.currentRestSite?.usedOption) this.uiManager?.showActionFeedback("You already took action here.", "info");
             return;
         }
          const currentNodeId = this.mapManager?.currentNodeId; // Capture node ID

         switch (action) {
             case 'heal':
                 const healAmount = Math.floor(this.player.maxIntegrity * 0.3);
                  if (this.player.currentIntegrity >= this.player.maxIntegrity) {
                      this.uiManager.showActionFeedback("Already at full Integrity!", "info");
                      return; // Don't use action if already full
                  }
                 this.player.heal(healAmount);
                 this.currentRestSite.usedOption = true;
                 this.metaProgression?.updateMilestoneProgress('restHeal', 1);
                  this.uiManager.showNotification(`Healed ${healAmount} Integrity.`);
                  this.leaveRestSite(); // Leave immediately
                 break;
             case 'upgrade':
                  const upgradableCards = this.player.deckManager.getMasterDeck().filter(card => !card.upgraded);
                  if(upgradableCards.length === 0) {
                      this.uiManager.showActionFeedback("No cards available to upgrade!", "info");
                      return;
                  }
                  this.uiManager.showCardSelectionModal(
                      upgradableCards,
                      (selectedCard) => {
                         if (selectedCard) {
                             // Find the actual card instance in the master deck by its unique ID
                             const cardInDeck = this.player.deckManager.masterDeck.find(c => c.id === selectedCard.id);
                             if(cardInDeck && !cardInDeck.upgraded) {
                                 cardInDeck.upgrade();
                                 this.currentRestSite.usedOption = true;
                                 this.metaProgression?.updateMilestoneProgress('restUpgrade', 1);
                                  this.uiManager.showNotification(`Meditated: Upgraded ${cardInDeck.name}.`);
                                  this.leaveRestSite();
                             } else { this.uiManager.showActionFeedback("Upgrade failed (card not found or already upgraded).", "error"); }
                         } else { console.log("Upgrade cancelled."); }
                      },
                      "Choose a Card to Meditate Upon (Upgrade)"
                  );
                 break; // Wait for modal callback
             case 'remove':
                   if (this.player.deckManager.masterDeck.length <= 5) {
                      this.uiManager.showActionFeedback("Deck too small to remove cards!", "warning");
                      return;
                   }
                 this.uiManager.showCardSelectionModal(
                     this.player.deckManager.getMasterDeck(),
                     (selectedCard) => {
                         if (selectedCard) {
                             if (this.player.removeCardFromDeck(selectedCard)) { // Use Player method
                                 this.currentRestSite.usedOption = true;
                                 this.metaProgression?.updateMilestoneProgress('restRemove', 1);
                                 this.uiManager.showNotification(`Journaled: Removed ${selectedCard.name}.`);
                                 this.leaveRestSite();
                             } else { this.uiManager.showActionFeedback("Removal failed.", "error"); }
                         } else { console.log("Removal cancelled."); }
                     },
                     "Choose a Concept to Let Go Of (Remove)"
                 );
                 break; // Wait for modal callback
              default:
                  console.warn("Unknown rest site action:", action);
         }
     }

     leaveRestSite() {
        console.log("GameState: Leaving Rest Site.");
         const currentNodeId = this.mapManager?.currentNodeId;
        this.currentRestSite = null;
        this.completeNode(currentNodeId);
        this.uiManager?.showScreen('mapScreen');
        this.mapManager?.renderMap();
     }

    completeNode(nodeId, options = {}) {
        console.log(`GameState: Completing node ${nodeId}`, options);
        // Update player info AFTER node completed (insight, health might change)
        this.uiManager?.updatePlayerMapInfo(this.player, this.currentFloor);
        // Re-render map AFTER interaction completes fully, allowing next move.
        // This is now primarily handled by the functions that return to the map screen
        // (leaveShop, leaveRestSite, reward callback, event callback).
        // We *could* force a render here, but it might be redundant.
        // this.mapManager?.renderMap();
    }

     advanceFloor() {
         if (!this.runActive || !this.player || !this.mapManager || !this.uiManager) return;
         console.log(`GameState: Advancing from floor ${this.currentFloor}...`);
         this.currentFloor++;

         const MAX_FLOORS = 3; // Define max floors for the run
         if (this.currentFloor > MAX_FLOORS) {
             console.log("Final floor boss defeated! Overall Victory!");
             this.endRun(true); // Final victory
             return;
         }

         // --- Prepare for Next Floor ---
         // Full heal between floors? Optional mechanic.
         // this.player?.heal(this.player.maxIntegrity);
         // this.uiManager?.showNotification(`Reached Floor ${this.currentFloor}! Integrity restored.`);

         this.mapManager.generateFloor(this.currentFloor);
         // generateFloor sets currentNodeId to start node and calls renderMap
         this.uiManager.showScreen('mapScreen'); // Ensure map is shown
         this.uiManager.updatePlayerMapInfo(this.player, this.currentFloor);
     }

     // --- Reward Generation Helpers ---
     generateCardReward(allowRare = false, numChoices = 3, allowCommon = false) {
         if (!this.metaProgression) return []; // Need meta progression for unlocks
         const availableConcepts = Data.concepts.filter(c => {
             if (!this.metaProgression.isConceptUnlocked(c.id)) return false;
              if (!allowRare && c.rarity === 'rare') return false;
              if (!allowCommon && c.rarity === 'common') return false;
              // Add other filters? E.g., prevent offering cards already maxed out in deck?
              return true;
         });
         if (availableConcepts.length === 0) { console.warn("No available concepts found for card reward."); return []; }

         const choices = [];
         const shuffled = this.mapManager?.shuffleArray([...availableConcepts]) || this._fallbackShuffle([...availableConcepts]);
         for(let i=0; i<Math.min(numChoices, shuffled.length); i++) {
             choices.push(shuffled[i].id);
         }
         console.log("Generated card choices:", choices);
         return choices;
     }

     generateArtifactReward(guaranteeRare = false) {
          if (!this.metaProgression || !this.player) return null;
          // Use imported ARTIFACT_TEMPLATES
           const possibleArtifacts = Object.values(ARTIFACT_TEMPLATES).filter(a => {
             if (!this.metaProgression.isArtifactUnlocked(a.id)) return false;
              if (this.player.artifacts.some(art => art.id === a.id)) return false;
              if (guaranteeRare && a.rarity !== 'rare') return false;
              return true;
          });
           if (possibleArtifacts.length === 0) { console.warn("No available artifacts found for reward."); return null; }

          const randomIndex = Math.floor(Math.random() * possibleArtifacts.length);
          const chosenId = possibleArtifacts[randomIndex].id;
           console.log("Generated artifact choice:", chosenId);
          return chosenId;
     }

     _fallbackShuffle(array) { // Simple shuffle if mapManager isn't available
         return array.sort(() => Math.random() - 0.5);
     }

    // --- Utility Methods ---
    getDefaultDeckIds() {
        const vanilla = Data.concepts.find(c => c.name === "Vanilla Sex")?.id || 1;
        const touch = Data.concepts.find(c => c.name === "Sensual Touch")?.id || 2;
        return [ vanilla, vanilla, vanilla, vanilla, vanilla, touch, touch, touch, touch, touch ];
     }
     getDefaultAttunements() {
         return { Attraction: 5, Interaction: 5, Sensory: 5, Psychological: 5, Cognitive: 5, Relational: 5, RoleFocus: 5 };
      }
     getCurrentNode() {
        return this.mapManager?.getCurrentNode();
     }

} // End of GameState class
