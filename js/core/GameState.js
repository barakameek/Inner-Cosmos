// js/core/GameState.js

import { Player } from './Player.js';
import { MapManager } from '../map/MapManager.js';
import { CombatManager } from '../combat/CombatManager.js';
import { UIManager } from '../ui/UIManager.js'; // Now assumed to exist
import { Card } from './Card.js'; // Needed for reward generation/display
import { Artifact } from './Artifact.js'; // Needed for reward generation/display
import * as Data from '../data.js';
import { ARTIFACT_TEMPLATES } from './ArtifactDefinitions.js'; // Import definitions


/**
 * Manages the state for a single game run.
 */
export class GameState {
    // constructor(playerData = null, metaProgression = null, uiManager = null) { // Keep this constructor signature
    //     // ... (keep existing constructor properties) ...
    //     this.player = null;
    //     this.mapManager = null;
    //     this.combatManager = null;
    //     this.uiManager = uiManager; // Store the UIManager reference
    //     this.metaProgression = metaProgression; // Store metaProgression reference
    //     // ... (rest of constructor) ...
    // }
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
        this.currentEvent = null;
        this.currentShop = null;
        this.currentRestSite = null;

        console.log(`GameState created with seed: ${this.currentRunSeed}`);
    }


    // startRun(playerData, metaProgression, uiManager) { // Keep this signature
    //     // ... (keep existing startRun logic, including player creation, manager instantiation) ...
    //     this.player.gameStateRef = this; // Ensure player has reference back
    //     // ... (rest of startRun) ...
    // }
    startRun(playerData, metaProgression, uiManager) { // Accept uiManager
        console.log("GameState: Starting new run...");
        this.runActive = true;
        this.currentFloor = 1;
        this.uiManager = uiManager || this.uiManager; // Store UIManager if passed
        this.metaProgression = metaProgression || this.metaProgression; // Store MetaProgression

        // --- Player Initialization ---
        this.player = new Player(playerData, this.metaProgression);
        this.player.gameStateRef = this; // Give player access back to gameState

        console.log("Player Initialized:", this.player.name);

        // --- Map Initialization ---
        this.mapManager = new MapManager(this, this.uiManager);
        this.mapManager.generateFloor(this.currentFloor); // MapManager calls uiManager.renderMap

        // --- Combat Initialization ---
        this.combatManager = new CombatManager(this, this.uiManager);

        console.log("Run Started. Player at node:", this.mapManager.currentNodeId);
        // Initial UI update for map info via UIManager
        this.uiManager?.updatePlayerMapInfo(this.player, this.currentFloor);
    }


    // Refine endRun to use UIManager and MetaProgression properly
    endRun(victory) {
        if (!this.runActive) return;

        const runInsight = this.player?.insightThisRun || 0; // Get insight before clearing player potentially
        console.log(`GameState: Ending run. Victory: ${victory}. Insight this run: ${runInsight}`);
        this.runActive = false;


        // Award meta-progression (Insight)
        if (this.metaProgression && runInsight > 0) {
            console.log(`Adding ${runInsight} insight to meta progression.`);
            // Add insight BEFORE checking milestones that might depend on total insight
            this.metaProgression.addInsight(runInsight);
        }

        // --- Check & Update Milestones ---
        // Check action-based milestones accumulated during the run (might need better tracking system)
        // Check state-based milestones based on the final state of the run
        this.metaProgression?.checkStateBasedMilestones(this); // Pass final GameState
        if (victory) {
             // Specific tracking for victory/floor completion
             this.metaProgression?.updateMilestoneProgress('runVictory', 1);
             if (this.currentFloor >= 3) { // Example: Beat floor 3 boss
                this.metaProgression?.updateMilestoneProgress('beatFloor3', 1);
             }
             // TODO: Potentially unlock next Ascension level
             // this.metaProgression?.unlockAscension(this.metaProgression.currentAscension + 1);
        }
        this.metaProgression?.updateMilestoneProgress('runCompleted', 1); // Track any completed run

        // Save meta-progression AFTER potentially completing milestones
        this.metaProgression?.save();

        // --- Show End Screen via UIManager ---
        if (this.uiManager) {
            const message = `<h2>Run Ended</h2>
                             <p>${victory ? 'Victory!' : 'Defeat...'}</p>
                             <p>Floor Reached: ${this.currentFloor}</p>
                             <p>Insight Gained: ${runInsight} <i class='fas fa-brain insight-icon'></i></p>
                             <p>Total Insight: ${this.metaProgression?.totalInsight || 0} <i class='fas fa-brain insight-icon'></i></p>`;
             this.uiManager.showModal(message, [{ text: 'Return to Menu', callback: () => {
                 this.cleanupRun(); // Clean up run state
                 this.uiManager.showScreen('mainMenuScreen');
             } }]);
        } else {
            alert(`Run Ended. Victory: ${victory}. Insight: ${runInsight}. Total Insight: ${this.metaProgression?.totalInsight || 0}.`);
            this.cleanupRun();
            // Manually attempt to show main menu if UI manager failed
             document.getElementById('mainMenuScreen')?.classList.add('active');
             document.getElementById('mapScreen')?.classList.remove('active');
             document.getElementById('combatScreen')?.classList.remove('active');
        }

         // Optional: Nullify references after run ends? Or wait for new GameState creation?
         // this.player = null; this.mapManager = null; this.combatManager = null; // Controversial - might break things if UI references linger
    }

    cleanupRun() {
        console.log("Cleaning up run state...");
        // Reset any run-specific variables if necessary
        // Helps ensure a clean slate for the next run, though creating a new GameState instance usually handles this.
        this.player = null;
        this.mapManager = null;
        this.combatManager = null;
        // Keep references to uiManager and metaProgression as they persist between runs
    }

    // Keep handleNodeEntry - it correctly delegates now...
     handleNodeEntry(node) {
        if (!node || !this.runActive) return;
        console.log(`GameState: Entering node ${node.id} (Type: ${node.type})`);
        switch (node.type) {
            case 'combat':
            case 'elite':
            case 'boss': // Consolidate combat start logic
                if (node.data.enemies && node.data.enemies.length > 0) {
                    if (node.type === 'boss') console.log("Approaching the Boss!");
                    this.enterCombat(node.data.enemies);
                } else {
                    console.warn(`Node ${node.id} is ${node.type} but has no enemy data! Completing node.`);
                    this.completeNode(node.id);
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
            case 'start':
                console.log("At start node.");
                // Potentially allow some action at start node on revisit? Unlikely.
                 this.completeNode(node.id); // Immediately complete the start node again if re-entered?
                break;
            default:
                console.warn(`Unknown node type encountered: ${node.type}. Completing node.`);
                 this.completeNode(node.id);
        }
    }


    // Keep enterCombat - it correctly delegates now...
     enterCombat(enemyList) {
        if (this.combatManager && !this.combatManager.isActive) {
            this.combatManager.startCombat(enemyList);
            // UI transition should be handled within combatManager.startCombat via uiManager
        } else {
            console.error("Cannot enter combat: CombatManager not ready or already active.");
        }
    }

    // Refine handleCombatEnd to use UIManager and MetaProgression
     handleCombatEnd(victory) {
        if (!this.runActive) return;
         console.log(`GameState: Handling combat end. Victory: ${victory}`);

         const currentNode = this.mapManager?.getCurrentNode(); // Use optional chaining
         const nodeType = currentNode?.type;

         if (!victory) {
             this.metaProgression?.updateMilestoneProgress(`defeat_in_${nodeType || 'combat'}`, 1); // Track defeat type
             this.endRun(false);
             return;
         }

         // --- Victory Tracking & Rewards ---
         this.metaProgression?.updateMilestoneProgress(`victory_${nodeType || 'combat'}`, 1); // Track victory type

         let insightReward = 0;
         let cardChoices = []; // Expecting IDs
         let artifactChoices = []; // Expecting IDs

         if (nodeType) {
             console.log(`Generating rewards for beating ${nodeType} node...`);
             switch (nodeType) {
                 case 'combat':
                     insightReward = Math.floor(Math.random() * 10) + 5;
                     if (Math.random() < 0.65) cardChoices = this.generateCardReward(false, 3, true); // 65% for 3 common/uncommon choices
                     this.metaProgression?.updateMilestoneProgress('winCombat', 1);
                     break;
                 case 'elite':
                     insightReward = Math.floor(Math.random() * 20) + 15;
                     cardChoices = this.generateCardReward(true, 3, true); // Guaranteed 3 choices, allows rare
                     if (Math.random() < 0.6) artifactChoices = [this.generateArtifactReward()]; // 60% for 1 artifact choice
                     this.metaProgression?.updateMilestoneProgress('winElite', 1);
                     break;
                 case 'boss':
                      insightReward = Math.floor(Math.random() * 50) + 50;
                      cardChoices = this.generateCardReward(true, 3, false); // Guaranteed 3 choices, uncommon/rare only?
                      artifactChoices = [this.generateArtifactReward(true)]; // Guaranteed rare artifact choice?

                      // Check for specific boss drop defined in enemy template
                      const bossEnemyId = currentNode?.data?.enemies[0]; // Assuming single boss ID
                      // Find enemy template data (needs access, maybe move templates to Data.js?)
                      // Example check (needs enemy definitions accessible):
                      // const bossTemplate = ENEMY_TEMPLATES[bossEnemyId]; // If templates are here
                      // if(bossTemplate?.onDeathAction?.artifactId) { artifactChoices = [bossTemplate.onDeathAction.artifactId]; }
                      // if(bossTemplate?.onDeathAction?.insight) { insightReward += bossTemplate.onDeathAction.insight; }

                      this.metaProgression?.updateMilestoneProgress('winBoss', 1);
                      break;
             }
         }

         // Award Insight (add to player's run total)
         if (insightReward > 0) {
             this.player.insightThisRun += insightReward;
             console.log(`Awarded ${insightReward} Insight. Run total: ${this.player.insightThisRun}`);
         }

         // --- Show Reward Screen via UIManager ---
         if (this.uiManager) {
             this.uiManager.showRewardScreen({
                 insight: insightReward,
                 cardChoices: cardChoices || [], // Ensure it's an array
                 artifactChoices: artifactChoices || [], // Ensure it's an array
                 onComplete: () => { // Callback when player makes choices / leaves screen
                      console.log("Reward screen completed.");
                      this.completeNode(currentNode?.id); // Mark node as done AFTER rewards
                       // Check if it was the boss node
                       if (nodeType === 'boss') {
                           this.advanceFloor(); // Move to next floor or end run victoriously
                       } else {
                            this.uiManager.showScreen('mapScreen'); // Return to map
                            this.mapManager?.renderMap(); // Ensure map UI updates available moves
                       }
                 }
             });
         } else {
             console.error("UIManager not found, cannot show rewards!");
             // Fallback: Auto-complete node and try to return to map
             this.completeNode(currentNode?.id);
              if (nodeType === 'boss') this.advanceFloor();
         }
     }


    // Refine triggerEvent to use UIManager and MetaProgression
     triggerEvent(eventId) {
         console.log(`GameState: Triggering event ${eventId}`);
         let eventData = null;
         let eventType = 'unknown';
         let sourceKey = null; // To find the source array/object in Data.reflectionPrompts

         // Find event data and its source key
         for (const key in Data.reflectionPrompts) {
             const source = Data.reflectionPrompts[key];
             if (Array.isArray(source)) {
                 const found = source.find(p => p.id === eventId);
                 if (found) { eventData = found; eventType = 'reflection'; sourceKey = key; break; }
             } else if (typeof source === 'object' && source !== null) { // Handle nested objects
                 if (source[eventId]) {
                    eventData = source[eventId];
                    eventType = 'reflection'; // Still treat as reflection
                    sourceKey = key; // e.g., 'RareConcept' or 'Guided'
                    break;
                 }
             }
         }
          if (!eventData) {
             const foundDilemma = Data.elementalDilemmas.find(d => d.id === eventId);
             if (foundDilemma) { eventData = foundDilemma; eventType = 'dilemma'; }
         }

         if (eventData && this.uiManager) {
             const currentNodeId = this.mapManager?.currentNodeId; // Capture current node ID

             if (eventType === 'reflection') {
                // Reflection: show text, grant reward, complete node
                let rewardText = "";
                const insightGain = 5; // Standard insight for reflection
                 this.player.insightThisRun += insightGain;
                 rewardText = `<br><br><i>(Gained ${insightGain} <i class='fas fa-brain insight-icon'></i> Insight for introspection.)</i>`;

                 // Track milestone completion for this specific reflection action
                 this.metaProgression?.updateMilestoneProgress('completeReflection', 1, { eventId: eventId });
                  // Check if it's a Dissonance reflection
                  if (sourceKey === 'Dissonance') {
                      this.metaProgression?.updateMilestoneProgress('completeReflectionDissonance', 1);
                  }


                 this.uiManager.showModal(eventData.text + rewardText, [{ text: 'Ponder...', callback: () => {
                     this.completeNode(currentNodeId); // Use captured ID
                     this.uiManager.showScreen('mapScreen');
                     this.mapManager?.renderMap();
                 }}]);

             } else if (eventType === 'dilemma') {
                 // Dilemma: show text, present choices calling resolveDilemma
                  this.uiManager.showModal(
                     `<strong>Dilemma:</strong> ${eventData.situation}<hr>${eventData.question}`, // Added separator
                     [ // Choices call resolveDilemma with the node ID for completion later
                         { text: eventData.sliderMinLabel || 'Choice 1', callback: () => this.resolveDilemma(eventId, 'min', currentNodeId) },
                         { text: eventData.sliderMaxLabel || 'Choice 2', callback: () => this.resolveDilemma(eventId, 'max', currentNodeId) }
                     ]
                 );
             } else {
                  console.error(`Event type ${eventType} not fully handled for ID: ${eventId}`);
                   this.completeNode(currentNodeId);
                  this.uiManager?.showScreen('mapScreen');
             }
         } else {
             console.error(`Event data not found for ID: ${eventId} or UIManager missing.`);
              this.completeNode(this.mapManager?.currentNodeId);
             this.uiManager?.showScreen('mapScreen');
         }
     }

    // Refine resolveDilemma to use MetaProgression and complete the node
     resolveDilemma(dilemmaId, choice, nodeIdToComplete) {
         console.log(`Resolving dilemma ${dilemmaId} with choice: ${choice}`);
         const dilemmaData = Data.elementalDilemmas.find(d => d.id === dilemmaId);
         if (!dilemmaData) return;

         // --- Apply Consequences ---
         let insightGain = 8;
         let outcomeText = "";

         // Example: Award insight, maybe temporarily nudge attunement? Add a card? Status effect?
         const chosenElement = (choice === 'min') ? dilemmaData.elementKeyMin : dilemmaData.elementKeyMax;
         const opposingElement = (choice === 'min') ? dilemmaData.elementKeyMax : dilemmaData.elementKeyMin;

         // Add small insight bonus for making a choice
         insightGain += 2;
         outcomeText = `Leaned towards ${chosenElement}.`;

         // Potential future effect: Apply temporary Attunement shift for the run?
         // Example: this.player.applyTemporaryAttunementShift(chosenElement, 1);
         // Example: this.player.applyTemporaryAttunementShift(opposingElement, -1);
         console.log(`TODO: Apply effects for choosing ${chosenElement} over ${opposingElement}`);


         this.player.insightThisRun += insightGain;
         console.log(`Gained ${insightGain} Insight from dilemma.`);

         // Track milestone
         this.metaProgression?.updateMilestoneProgress('resolveDilemma', 1);
         // Could add tracking for specific elements chosen:
         // this.metaProgression?.updateMilestoneProgress(`chose_${chosenElement}_in_dilemma`, 1);

         // Use UIManager to show outcome before completing? Optional.
         // this.uiManager?.showModal(`Outcome: ${outcomeText}<br>Gained ${insightGain} Insight.`, [{ text: 'Continue', callback: () => { ... }}]);

         // Complete the node now that the dilemma is resolved
         this.completeNode(nodeIdToComplete); // Use the passed node ID
         this.uiManager?.showScreen('mapScreen');
         this.mapManager?.renderMap();
     }


    // Refine Shop/Rest logic to use UIManager for modals if needed
     handleShopPurchase(itemType, itemId) { // Keep existing logic but rely on UI modals if needed (like remove)
          if (!this.currentShop || !this.gameState || !this.uiManager) return false;

          // ... (keep existing purchase logic for card/artifact) ...
          if (itemType === 'card') {
             const item = this.currentShop.cards.find(i => i.cardId === itemId && !i.purchased);
             if (item && this.player.insightThisRun >= item.cost) {
                  this.player.insightThisRun -= item.cost;
                 this.player.addCardToDeck(item.cardId);
                 item.purchased = true;
                 console.log(`Purchased card ${item.cardId} for ${item.cost}. Insight left: ${this.player.insightThisRun}`);
                 this.uiManager.renderShop(this.currentShop, this.player.insightThisRun); // Update shop UI
                 this.metaProgression?.updateMilestoneProgress('buyCard', 1); // Track milestone
             } else { /* ... log failure ... */ }
         } else if (itemType === 'artifact') {
              const item = this.currentShop.artifacts.find(i => i.artifactId === itemId && !i.purchased);
              if (item && this.player.insightThisRun >= item.cost) {
                   this.player.insightThisRun -= item.cost;
                 this.player.addArtifact(item.artifactId);
                 item.purchased = true;
                   console.log(`Purchased artifact ${item.artifactId} for ${item.cost}. Insight left: ${this.player.insightThisRun}`);
                  this.uiManager.renderShop(this.currentShop, this.player.insightThisRun); // Update shop UI
                 this.metaProgression?.updateMilestoneProgress('buyArtifact', 1); // Track milestone
              } else { /* ... log failure ... */ }
         } else if (itemType === 'remove') {
             if (this.currentShop.removalAvailable && this.player.insightThisRun >= this.currentShop.removalCost) {
                  // Use UIManager to show card selection
                 this.uiManager.showCardSelectionModal(
                     this.player.deckManager.getMasterDeck(), // Show full deck
                     (selectedCard) => { // Callback function
                         if (selectedCard) {
                              // Attempt removal via DeckManager
                              if (this.player.deckManager.removeCardFromMasterDeck(selectedCard)) {
                                 this.player.insightThisRun -= this.currentShop.removalCost;
                                 this.currentShop.removalAvailable = false; // Only one removal per shop visit
                                 console.log(`Purchased card removal for ${this.currentShop.removalCost}. Insight left: ${this.player.insightThisRun}`);
                                  this.metaProgression?.updateMilestoneProgress('removeCard', 1); // Track milestone
                                 this.uiManager?.renderShop(this.currentShop, this.player.insightThisRun); // Update shop UI
                              } else {
                                  console.warn("Failed to remove selected card from deck manager.");
                                  // Optionally show feedback to user via modal
                              }
                         } else {
                              console.log("Card removal cancelled by user.");
                         }
                     },
                     `Choose a Concept to Remove (${this.currentShop.removalCost} Insight)` // Modal title
                 );
             } else {
                 console.log("Cannot afford card removal or already used.");
                  this.uiManager?.showModal("Cannot afford card removal or service already used.", [{ text: 'OK' }]); // UI feedback
             }
         }
     }

     handleRestSiteAction(action) { // Keep existing logic but use UIManager modals
         if (!this.currentRestSite || this.currentRestSite.usedOption || !this.uiManager || !this.gameState) {
             console.warn("Rest site option already used, not available, or managers missing.");
             return;
         }
          const currentNodeId = this.mapManager?.currentNodeId; // Capture current node ID

         switch (action) {
             case 'heal':
                 const healAmount = Math.floor(this.player.maxIntegrity * 0.3); // Heal 30%
                 this.player.heal(healAmount);
                 console.log(`Rested: Healed ${healAmount} Integrity.`);
                 this.currentRestSite.usedOption = true;
                 this.metaProgression?.updateMilestoneProgress('restHeal', 1);
                  this.leaveRestSite(); // Leave immediately after healing
                 break;
             case 'upgrade':
                  this.uiManager.showCardSelectionModal(
                      this.player.deckManager.getMasterDeck().filter(card => !card.upgraded),
                      (selectedCard) => {
                         if (selectedCard) {
                             const cardInDeck = this.player.deckManager.masterDeck.find(c => c.id === selectedCard.id);
                             if(cardInDeck && !cardInDeck.upgraded) {
                                 cardInDeck.upgrade();
                                 console.log(`Rested: Upgraded ${cardInDeck.name}.`);
                                 this.currentRestSite.usedOption = true;
                                 this.metaProgression?.updateMilestoneProgress('restUpgrade', 1);
                                  this.leaveRestSite(); // Leave after selection is confirmed
                             } else { console.warn("Selected card not found or already upgraded."); }
                         } else { console.log("Upgrade cancelled."); }
                      },
                      "Choose a Card to Meditate Upon (Upgrade)"
                  );
                  // Don't leave immediately, wait for modal callback
                 break;
             case 'remove':
                 this.uiManager.showCardSelectionModal(
                     this.player.deckManager.getMasterDeck(),
                     (selectedCard) => {
                         if (selectedCard) {
                             if (this.player.deckManager.removeCardFromMasterDeck(selectedCard)) {
                                 console.log(`Journaled: Removed ${selectedCard.name}.`);
                                 this.currentRestSite.usedOption = true;
                                  this.metaProgression?.updateMilestoneProgress('restRemove', 1);
                                  this.leaveRestSite(); // Leave after selection is confirmed
                             } else { console.warn("Failed to remove selected card."); }
                         } else { console.log("Removal cancelled."); }
                     },
                     "Choose a Concept to Let Go Of (Remove)"
                 );
                  // Don't leave immediately, wait for modal callback
                 break;
              default:
                  console.warn("Unknown rest site action:", action);
         }

          // Update rest site UI if an action was taken that didn't immediately leave
          if (this.currentRestSite.usedOption && action !== 'upgrade' && action !== 'remove') {
              // This check is redundant now as heal leaves immediately
               // this.uiManager?.renderRestSite(this.currentRestSite);
          }
     }

    // Keep leaveShop, leaveRestSite, completeNode, advanceFloor...
     leaveShop() { /* ... keep ... */
         console.log("GameState: Leaving Shop.");
        this.currentShop = null;
        this.completeNode(this.mapManager?.currentNodeId);
        this.uiManager?.showScreen('mapScreen');
        this.mapManager?.renderMap();
      }
      leaveRestSite() { /* ... keep ... */
         console.log("GameState: Leaving Rest Site.");
        this.currentRestSite = null;
        this.completeNode(this.mapManager?.currentNodeId);
        this.uiManager?.showScreen('mapScreen');
        this.mapManager?.renderMap();
      }
     completeNode(nodeId) { /* ... keep ... */
         console.log(`GameState: Completing node ${nodeId}`);
         // Ensure map info is up-to-date after completing node
         this.uiManager?.updatePlayerMapInfo(this.player, this.currentFloor);
         this.mapManager?.renderMap(); // Re-render map to enable next moves
     }
     advanceFloor() { /* ... keep ... */
         if (!this.runActive) return;
         console.log(`GameState: Advancing from floor ${this.currentFloor}...`);
         this.currentFloor++;
         // Check floor limit
          const MAX_FLOORS = 3; // Example
          if (this.currentFloor > MAX_FLOORS) {
             console.log("Final floor boss defeated! Overall Victory!");
             this.endRun(true); // Final victory
             return;
         }
          // Generate next floor
          this.mapManager?.generateFloor(this.currentFloor);
          this.currentNodeId = this.mapManager?.startNodeId; // Ensure player is at the start
          this.uiManager?.showScreen('mapScreen');
          // Map is rendered by generateFloor now
          this.uiManager?.updatePlayerMapInfo(this.player, this.currentFloor);
     }

    // Refine reward generation slightly
     generateCardReward(allowRare = false, numChoices = 3, allowCommon = false) {
         const availableConcepts = Data.concepts.filter(c => {
             // Filter based on meta unlocks FIRST
             if (!this.metaProgression?.isConceptUnlocked(c.id)) {
                 return false; // Can't offer cards not unlocked in meta
             }
              // Filter by rarity
              if (!allowRare && c.rarity === 'rare') return false;
              if (!allowCommon && c.rarity === 'common' && allowRare) return false; // Only show uncommon if allowRare=true but allowCommon=false
              if (!allowCommon && c.rarity === 'common') return false; // Only show uncommon/rare if allowCommon=false
              return true;
         });

         if (availableConcepts.length === 0) {
             console.warn("No available concepts found for card reward generation.");
             return [];
         }

          // Slightly weight against already having many copies? Optional.
          // Consider weighting based on rarity if not guaranteeing specific types.

         const choices = [];
         const shuffled = this.mapManager.shuffleArray([...availableConcepts]);
         for(let i=0; i<Math.min(numChoices, shuffled.length); i++) {
             choices.push(shuffled[i].id);
         }
         console.log("Generated card choices:", choices);
         return choices;
     }

     generateArtifactReward(guaranteeRare = false) {
         // Use ARTIFACT_TEMPLATES from ArtifactDefinitions.js (imported)
          const possibleArtifacts = Object.values(ARTIFACT_TEMPLATES).filter(a => {
             // Filter by meta unlocks
             if (!this.metaProgression?.isArtifactUnlocked(a.id)) {
                 return false;
             }
              // Filter out already held artifacts this run? Requires player artifact tracking
              if (this.player?.artifacts.some(art => art.id === a.id)) {
                  return false; // Don't offer duplicates in one run
              }
              if (guaranteeRare && a.rarity !== 'rare') return false;
              return true;
          });

           if (possibleArtifacts.length === 0) {
               console.warn("No available artifacts found for reward generation.");
               return null; // Return null if none available
           }

          const randomIndex = Math.floor(Math.random() * possibleArtifacts.length);
          console.log("Generated artifact choice:", possibleArtifacts[randomIndex].id);
          return possibleArtifacts[randomIndex].id;
     }

    // Keep utility methods...
     getDefaultDeckIds() { /* ... keep updated version ... */
        const vanilla = Data.concepts.find(c => c.name === "Vanilla Sex")?.id || 1;
        const touch = Data.concepts.find(c => c.name === "Sensual Touch")?.id || 2;
        return [ vanilla, vanilla, vanilla, vanilla, vanilla, touch, touch, touch, touch, touch ];
      }
      getDefaultAttunements() { /* ... keep ... */
        return { Attraction: 5, Interaction: 5, Sensory: 5, Psychological: 5, Cognitive: 5, Relational: 5, RoleFocus: 5 };
       }
      getCurrentNode() { /* ... keep ... */
        return this.mapManager?.currentNode;
      }

} // End of GameState class
