// js/core/GameState.js

import { Player } from './Player.js';
import { MapManager } from '../map/MapManager.js';
import { CombatManager } from '../combat/CombatManager.js';
import { UIManager } from '../ui/UIManager.js';
import { Card } from './Card.js';
import { Artifact } from './Artifact.js';
// --- CORRECTED PATH FOR data.js ---
// Go up from 'core' to 'js', then up from 'js' to the root directory
import * as Data from '../../data.js';
// --- END CORRECTION ---
import { ARTIFACT_TEMPLATES } from './ArtifactDefinitions.js'; // Correct path
import { ENEMY_TEMPLATES } from '../combat/Enemy.js'; // Correct path

/**
 * Manages the state for a single game run, acting as the central hub.
 */
export class GameState {
    constructor(playerData = null, metaProgression = null, uiManager = null) {
        console.log("Initializing GameState for a new run...");

        // Core components - initialized in startRun
        this.player = null;
        this.mapManager = null;
        this.combatManager = null;
        this.uiManager = uiManager; // Store the UIManager reference passed in
        this.metaProgression = metaProgression; // Store metaProgression reference

        // Run state
        this.currentFloor = 0;
        this.currentRunSeed = Date.now(); // Simple seed for now
        this.runActive = false;

        // State for current interaction nodes
        this.currentEvent = null; // Can store event state if needed across interactions
        this.currentShop = null; // Stores generated shop inventory
        this.currentRestSite = null; // Stores rest site state (e.g., if option used)

        console.log(`GameState created with seed: ${this.currentRunSeed}`);
        // TODO: Implement seeding logic for RNG if needed later
    }

    /** Starts a new game run. */
    startRun(playerData, metaProgression, uiManager) {
        console.log("GameState: Starting new run...");
        if (this.runActive) {
            console.warn("GameState: Cannot start a new run while one is active.");
            return;
        }

        // --- Ensure Core References ---
        // Use provided instances or fallback to stored ones (e.g., if restarting run)
        this.uiManager = uiManager || this.uiManager;
        this.metaProgression = metaProgression || this.metaProgression;
        if (!this.uiManager || !this.metaProgression) {
            console.error("GameState FATAL: Missing UIManager or MetaProgression reference to start run.");
            alert("Critical Error: Cannot start run. Missing core managers.");
            return;
        }

        this.runActive = true;
        this.currentFloor = 1; // Start at floor 1

        // --- Player Initialization ---
        // Pass metaProgression for applying starting bonuses
        this.player = new Player(playerData, this.metaProgression);
        // **Crucially, give Player access back to this GameState instance**
        this.player.setGameState(this); // Use the dedicated method

        console.log("Player Initialized:", this.player.name);

        // --- Deck Manager Initialization (Already done inside Player constructor) ---
        // Pass the player reference to DeckManager *after* player is created
        this.player.deckManager.setPlayerReference(this.player);

        // --- Map Initialization ---
        // Pass 'this' (GameState) and uiManager
        this.mapManager = new MapManager(this, this.uiManager);
        this.mapManager.generateFloor(this.currentFloor); // Generates nodes and calls initial render via UIManager

        // --- Combat Initialization ---
        // Pass 'this' (GameState) and uiManager
        this.combatManager = new CombatManager(this, this.uiManager);

        console.log("Run Started. Player at node:", this.mapManager.currentNodeId);
        // Initial UI update for map info via UIManager
        this.uiManager?.updatePlayerMapInfo(this.player, this.currentFloor);
        // Show the map screen
        this.uiManager?.showScreen('mapScreen');
    }

    /** Ends the current run (victory or defeat). */
    endRun(victory) {
        if (!this.runActive) return; // Prevent double execution

        const runInsight = this.player?.insightThisRun || 0;
        const finalFloor = this.currentFloor;
        const nodeTypeAtEnd = this.mapManager?.getCurrentNode()?.type || 'unknown';
        const currentAscension = this.metaProgression?.currentAscension || 0;

        console.log(`GameState: Ending run. Victory: ${victory}. Floor: ${finalFloor}. Insight: ${runInsight}. Ascension: ${currentAscension}`);
        this.runActive = false; // Set inactive flag immediately

        // --- Award Meta-Progression (Insight) ---
        if (this.metaProgression && runInsight > 0) {
            console.log(`Adding ${runInsight} insight to meta progression.`);
            this.metaProgression.addInsight(runInsight); // addInsight handles saving internally
        }

        // --- Check & Update Milestones based on final state ---
        if (this.metaProgression) {
            // Check general state milestones (like total insight)
            this.metaProgression.checkStateBasedMilestones(this);

            // Update specific run outcome milestones
            this.metaProgression.updateMilestoneProgress('runCompleted', 1);
            if (victory) {
                this.metaProgression.updateMilestoneProgress('runVictory', 1);
                this.metaProgression.updateMilestoneProgress(`victory_floor_${finalFloor}`, 1); // Track win on specific floor
                 // Update highest ascension beaten
                 if (this.metaProgression.highestAscensionBeat < currentAscension) {
                     this.metaProgression.highestAscensionBeat = currentAscension;
                     console.log(`New highest Ascension beaten: ${currentAscension}`);
                     // TODO: Unlock next ascension level logic?
                     // this.metaProgression.unlockAscension(currentAscension + 1);
                 }
            } else {
                 this.metaProgression.updateMilestoneProgress('runDefeat', 1);
                 this.metaProgression.updateMilestoneProgress(`defeat_in_${nodeTypeAtEnd}`, 1);
                 this.metaProgression.updateMilestoneProgress(`defeat_on_floor_${finalFloor}`, 1);
            }
            // Save again if milestones potentially changed something *other* than insight
            this.metaProgression.save();
        }

        // --- Show End Screen via UIManager ---
        if (this.uiManager) {
            const message = `<h2>Run Ended</h2>
                             <p><strong>${victory ? 'Victory!' : 'Defeat...'}</strong></p>
                             <p>Floor Reached: ${finalFloor}</p>
                             ${currentAscension > 0 ? `<p>Ascension Level: ${currentAscension}</p>` : ''}
                             <p>Insight Gained This Run: ${runInsight} <i class='fas fa-brain insight-icon'></i></p>
                             <hr>
                             <p>Total Insight: ${this.metaProgression?.totalInsight || 0} <i class='fas fa-brain insight-icon'></i></p>`;
             this.uiManager.showModal(message, [{ text: 'Return to Menu', callback: () => {
                 this.cleanupRun();
                 this.uiManager.showScreen('mainMenuScreen');
             } }]);
        } else {
            // Fallback alert if UI manager fails
            alert(`Run Ended. Victory: ${victory}. Insight: ${runInsight}. Total Insight: ${this.metaProgression?.totalInsight || 0}.`);
            this.cleanupRun();
             // Manually attempt to show main menu (less reliable)
             document.getElementById('mapScreen')?.classList.remove('active');
             document.getElementById('combatScreen')?.classList.remove('active');
             document.getElementById('mainMenuScreen')?.classList.add('active');
        }
    }

    /** Cleans up volatile run state. */
    cleanupRun() {
        console.log("Cleaning up run state...");
        this.player = null;
        this.mapManager = null;
        this.combatManager = null;
        this.currentEvent = null;
        this.currentShop = null;
        this.currentRestSite = null;
        this.runActive = false; // Ensure flag is false
    }

    /** Handles logic when the player enters a map node. */
    handleNodeEntry(node) {
        if (!node || !this.runActive || !this.player) {
             console.warn("Cannot handle node entry: Node invalid, run inactive, or player missing.");
             // Attempt to recover if possible, e.g., force back to map or end run
             this.uiManager?.showScreen('mapScreen');
             this.mapManager?.renderMap();
             return;
        };
        console.log(`GameState: Entering node ${node.id} (Type: ${node.type}, Floor: ${this.currentFloor})`);

        switch (node.type) {
            case 'combat':
            case 'elite':
            case 'boss':
                if (node.data.enemies && node.data.enemies.length > 0) {
                    if (node.type === 'boss') console.log("Approaching the Boss!");
                    this.enterCombat(node.data.enemies); // Handles UI screen change internally
                } else {
                    console.warn(`Node ${node.id} is ${node.type} but has no enemy data! Completing node as victory.`);
                    // Treat as an empty combat node - give small reward? Or just complete?
                    this.completeNode(node.id, { warning: "Missing enemy data" });
                    // If node was meant to have combat but failed, return to map
                    this.uiManager?.showScreen('mapScreen');
                    this.mapManager?.renderMap();
                }
                break;
            case 'event':
                 if (node.data.eventId) {
                    this.triggerEvent(node.data.eventId); // Handles UI screen change internally
                 } else {
                     console.warn(`Node ${node.id} is event but has no event ID! Completing node.`);
                     this.completeNode(node.id, { warning: "Missing event ID" });
                      this.uiManager?.showScreen('mapScreen');
                      this.mapManager?.renderMap();
                 }
                break;
            case 'shop':
                this.enterShop(); // Changes screen internally via UIManager
                break;
            case 'rest':
                this.enterRestSite(); // Changes screen internally via UIManager
                break;
            case 'start':
                console.log("At start node.");
                 this.completeNode(node.id); // Complete immediately, no reward usually
                  // Stay on map screen
                 this.mapManager?.renderMap(); // Re-render to show available moves
                break;
            default:
                console.warn(`Unknown node type encountered: ${node.type}. Completing node.`);
                 this.completeNode(node.id, { warning: `Unknown node type: ${node.type}` });
                  this.uiManager?.showScreen('mapScreen');
                  this.mapManager?.renderMap();
        }
    }

    /** Initiates combat. */
    enterCombat(enemyList) {
        if (!this.combatManager) {
             console.error("Cannot enter combat: CombatManager is missing!");
             this.completeNode(this.mapManager?.currentNodeId, { error: "Combat failed to start (manager missing)" });
             this.uiManager?.showScreen('mapScreen');
             return;
        }
        if (this.combatManager.isActive) {
             console.warn("Cannot enter combat: Combat is already active.");
             return; // Don't start a new one
        }
        // CombatManager.startCombat handles its own state and UI screen change
        this.combatManager.startCombat(enemyList);
    }

    /** Handles the outcome of combat. */
     handleCombatEnd(victory) {
        if (!this.runActive || !this.player) return;
        console.log(`GameState: Handling combat end. Victory: ${victory}`);

        // Player cleanup (remove temporary combat statuses)
        this.player.cleanupCombatStatuses();

        const currentNode = this.mapManager?.getCurrentNode();
        const nodeType = currentNode?.type;

        if (!victory) {
            // Milestone handled in endRun
            this.endRun(false); // Trigger run end on defeat
            return;
        }

        // --- Victory Tracking & Rewards ---
        this.metaProgression?.updateMilestoneProgress(`victory_${nodeType || 'combat'}`, 1);
        if (nodeType === 'combat') this.metaProgression?.updateMilestoneProgress('winCombat', 1);
        else if (nodeType === 'elite') this.metaProgression?.updateMilestoneProgress('winElite', 1);
        else if (nodeType === 'boss') this.metaProgression?.updateMilestoneProgress('winBoss', 1);

        let insightReward = 0;
        let cardChoices = [];
        let artifactChoices = []; // Changed to array for potential multi-artifact rewards

        console.log(`Generating rewards for beating ${nodeType} node...`);
        try {
            const baseInsight = { combat: 10, elite: 25, boss: 75 };
            insightReward = Math.floor((baseInsight[nodeType] || 5) * (1 + Math.random() * 0.5)); // Base + up to 50% variance

            // Card Rewards
             if (nodeType === 'combat' && Math.random() < 0.75) cardChoices = this.generateCardReward(false, 3, true); // Common mostly
             else if (nodeType === 'elite') cardChoices = this.generateCardReward(true, 3, true); // Allow rare
             else if (nodeType === 'boss') cardChoices = this.generateCardReward(true, 3, false); // Allow rare, no common

             // Artifact Rewards
             if (nodeType === 'elite' && Math.random() < 0.6) {
                 const artifactId = this.generateArtifactReward(false); // Allow uncommon
                 if (artifactId) artifactChoices.push(artifactId);
             } else if (nodeType === 'boss') {
                 const artifactId = this.generateArtifactReward(true); // Guarantee at least uncommon/rare
                 if (artifactId) artifactChoices.push(artifactId);
             }

            // Handle Boss specific onDeathAction
            if (nodeType === 'boss') {
                const bossEnemyId = currentNode?.data?.enemies[0]; // Assuming single boss ID
                const bossTemplate = ENEMY_TEMPLATES[bossEnemyId];
                 if (bossTemplate?.onDeathAction?.type === 'reward') {
                     if (bossTemplate.onDeathAction.insight) insightReward += bossTemplate.onDeathAction.insight;
                     // Add specific artifact drop if defined and unlocked
                     if (bossTemplate.onDeathAction.artifactId && this.metaProgression?.isArtifactUnlocked(bossTemplate.onDeathAction.artifactId)) {
                         // Add artifact directly instead of choice? Or add to choices? Let's add to choices.
                         if (!artifactChoices.includes(bossTemplate.onDeathAction.artifactId)) {
                             artifactChoices.push(bossTemplate.onDeathAction.artifactId);
                              console.log(`Added boss drop artifact ${bossTemplate.onDeathAction.artifactId} to choices.`);
                         }
                     } else if (bossTemplate.onDeathAction.artifactId) {
                         console.log(`Boss drop artifact ${bossTemplate.onDeathAction.artifactId} not unlocked or already offered.`);
                     }
                 }
            }

            // Apply Insight Reward
             if (insightReward > 0) {
                this.player.insightThisRun += insightReward;
                 console.log(`Awarded ${insightReward} insight.`);
            }

        } catch (error) {
            console.error("Error generating combat rewards:", error);
            if (insightReward === 0) insightReward = 5; // Default small reward on error
            if (this.player) this.player.insightThisRun += insightReward;
        }

        // --- Show Reward Screen via UIManager ---
        if (this.uiManager) {
            this.uiManager.showRewardScreen({
                insight: insightReward,
                cardChoices: cardChoices || [],
                artifactChoices: artifactChoices || [],
                onComplete: () => {
                    console.log("Reward screen completed.");
                    this.completeNode(currentNode?.id); // Complete node AFTER rewards are processed/skipped
                    // Check for floor advancement AFTER completing node
                    if (nodeType === 'boss') {
                        this.advanceFloor(); // Handles screen change
                    } else {
                        this.uiManager.showScreen('mapScreen'); // Return to map
                        this.mapManager?.renderMap(); // Re-render map
                    }
                }
            });
        } else {
            // Fallback if UI manager fails
            console.error("UIManager missing! Cannot show reward screen.");
            this.completeNode(currentNode?.id); // Complete node anyway
            if (nodeType === 'boss') this.advanceFloor();
            else this.uiManager?.showScreen('mapScreen'); // Attempt to return to map
        }
     }

    /** Triggers a specific event or dilemma. */
     triggerEvent(eventId) {
         console.log(`GameState: Triggering event/dilemma ${eventId}`);
         if (!Data || !this.uiManager || !this.player) {
             console.error("Cannot trigger event: Missing Data, UIManager, or Player.");
              this.completeNode(this.mapManager?.currentNodeId, { error: "Event trigger failed (missing components)" });
             this.uiManager?.showScreen('mapScreen');
             return;
         }

         let eventData = null;
         let eventType = 'unknown';
         let sourceKey = null; // For reflection category tracking

         // --- Find Event Data ---
         // Check Reflections first
         for (const key in Data.reflectionPrompts) {
             const source = Data.reflectionPrompts[key];
             if (Array.isArray(source)) {
                 const found = source.find(p => p.id === eventId);
                 if (found) { eventData = found; eventType = 'reflection'; sourceKey = key; break; }
             } else if (typeof source === 'object' && source !== null) {
                 // Handle nested objects like 'Guided'
                 if (source[eventId]) { eventData = source[eventId]; eventType = 'reflection'; sourceKey = key; break; }
                 for (const subKey in source) {
                      if(Array.isArray(source[subKey])) {
                           const found = source[subKey].find(p => p.id === eventId);
                           if (found) { eventData = found; eventType = 'reflection'; sourceKey = key; break; }
                      }
                 }
             }
             if (eventData) break; // Exit outer loop if found
         }
         // Check Dilemmas if not found in reflections
         if (!eventData) {
             const foundDilemma = Data.elementalDilemmas.find(d => d.id === eventId);
             if (foundDilemma) { eventData = foundDilemma; eventType = 'dilemma'; }
         }

         // --- Execute Event ---
         const currentNodeId = this.mapManager?.currentNodeId;
         if (eventData) {
             if (eventType === 'reflection') {
                let rewardText = ""; const insightGain = 5; // Basic insight for reflection
                 this.player.insightThisRun += insightGain; rewardText = `<br><br><i>(+${insightGain} <i class='fas fa-brain insight-icon'></i> Insight)</i>`;
                 // Track milestone
                 this.metaProgression?.updateMilestoneProgress('completeReflection', 1, { eventId: eventId });
                 if (sourceKey === 'Dissonance') this.metaProgression?.updateMilestoneProgress('completeReflectionDissonance', 1);
                 // Show modal
                 this.uiManager.showModal(eventData.text + rewardText, [{ text: 'Ponder...', callback: () => {
                     this.completeNode(currentNodeId); this.uiManager.showScreen('mapScreen'); this.mapManager?.renderMap();
                 }}]);
             } else if (eventType === 'dilemma') {
                 // Track milestone (completion tracked in resolveDilemma)
                  this.metaProgression?.updateMilestoneProgress('encounterDilemma', 1);
                  // Show modal with choices
                  this.uiManager.showModal( `<strong>Dilemma:</strong> ${eventData.situation}<hr>${eventData.question}`, [
                         { text: eventData.sliderMinLabel || 'Choice 1', callback: () => this.resolveDilemma(eventId, 'min', currentNodeId) },
                         { text: eventData.sliderMaxLabel || 'Choice 2', callback: () => this.resolveDilemma(eventId, 'max', currentNodeId) }
                     ] );
             } else {
                 console.warn(`Event ${eventId} found but type is unknown: ${eventType}`);
                 this.completeNode(currentNodeId, { warning: `Unknown event type: ${eventType}` });
                 this.uiManager?.showScreen('mapScreen');
                 this.mapManager?.renderMap();
             }
         } else {
             console.error(`Event/Dilemma with ID ${eventId} not found in Data.js!`);
             this.completeNode(currentNodeId, { error: "Event data not found" });
             this.uiManager?.showScreen('mapScreen');
             this.mapManager?.renderMap();
         }
     }

    /** Resolves the outcome of a dilemma choice. */
     resolveDilemma(dilemmaId, choice, nodeIdToComplete) {
         console.log(`Resolving dilemma ${dilemmaId} with choice: ${choice}`);
         const dilemmaData = Data.elementalDilemmas?.find(d => d.id === dilemmaId);
         if (!dilemmaData || !this.player || !this.uiManager || !this.metaProgression) {
              console.error("Cannot resolve dilemma: Missing data, player, UI manager, or meta progression.");
               this.completeNode(nodeIdToComplete); this.uiManager.showScreen('mapScreen'); this.mapManager?.renderMap();
               return;
         }

         let insightGain = 10; // Base insight for resolving
         const chosenElement = (choice === 'min') ? dilemmaData.elementKeyMin : dilemmaData.elementKeyMax;
         let outcomeText = `Leaned towards ${chosenElement}. Gained ${insightGain} <i class='fas fa-brain insight-icon'></i> Insight.`;
         let cardRewardText = "";

         // --- Potential Card Reward based on Choice ---
         // Find a relevant common, unlocked concept matching the chosen element
         const potentialCard = Data.concepts?.find(c =>
             c.primaryElement === chosenElement &&
             c.rarity === 'common' &&
             this.metaProgression.isConceptUnlocked(c.id)
         );

         if (potentialCard) {
             // Use player method which triggers artifacts and handles deck management
             const addedCard = this.player.addCardToDeck(potentialCard.id);
             if (addedCard) { // Check if card was actually added (e.g., not prevented by an artifact)
                 cardRewardText = `<br>Gained Concept: ${addedCard.name}`;
                 this.metaProgression.updateMilestoneProgress('gainCardFromEvent', 1);
             } else {
                  cardRewardText = "<br>A concept resonated, but couldn't be grasped."; // Feedback if adding failed
             }
         } else {
             cardRewardText = "<br>No relevant common concept resonated from this choice.";
         }

         // --- Apply Insight & Track Milestones ---
         this.player.insightThisRun += insightGain;
         this.metaProgression.updateMilestoneProgress('resolveDilemma', 1, { dilemmaId: dilemmaId, choice: choice });

         // --- Show Outcome ---
         this.uiManager.showModal(outcomeText + cardRewardText, [{ text: 'Continue', callback: () => {
              this.completeNode(nodeIdToComplete); // Complete node AFTER resolving dilemma
              this.uiManager.showScreen('mapScreen');
              this.mapManager?.renderMap();
         }}]);
     }

    /** Enters the shop node. */
    enterShop() {
         if (!this.player || !this.uiManager) {
            console.error("Cannot enter shop: Player or UIManager missing.");
            this.completeNode(this.mapManager?.currentNodeId, { error: "Shop entry failed" });
            this.uiManager?.showScreen('mapScreen');
            return;
         }
         try {
            const shopInventory = this.generateShopInventory();
            this.currentShop = shopInventory; // Store inventory state
            this.uiManager.showScreen('shopScreen');
            this.uiManager.renderShop(shopInventory, this.player.insightThisRun); // Pass current insight for display/checks
         } catch (error) {
             console.error("Error generating or rendering shop:", error);
             this.completeNode(this.mapManager?.currentNodeId, { error: "Shop generation failed" });
             this.uiManager?.showScreen('mapScreen');
         }
    }

    /** Generates the inventory for the shop based on floor and meta progression. */
     generateShopInventory() {
         if (!this.player || !this.metaProgression || !Data?.concepts || !ARTIFACT_TEMPLATES) {
              throw new Error("Missing player, metaProgression, concepts, or artifact templates for shop generation.");
         }
         const cardOptions = [];
         const numCardChoices = 3 + (this.metaProgression.getStartingBonus('cardRewardChoicesBonus') || 0);
         const generatedCardIds = new Set();

         // Generate Card Choices
         for (let i = 0; i < numCardChoices && generatedCardIds.size < 10; i++) { // Limit attempts
             const allowRareShop = this.currentFloor > 1 && Math.random() < 0.25; // Slightly higher chance for rare on floor 2+
             // Generate 1 choice at a time
             const cardChoices = this.generateCardReward(allowRareShop, 1, true); // Allow common
             if (cardChoices?.length > 0 && !generatedCardIds.has(cardChoices[0])) {
                 generatedCardIds.add(cardChoices[0]);
                 cardOptions.push(cardChoices[0]);
             } else {
                 // Retry if no card generated or duplicate found
                 i--;
             }
         }

         // Generate Artifact Choices
         const artifactOptions = [];
         const numArtifactChoices = 1 + (this.metaProgression.getStartingBonus('shopArtifactChoicesBonus') || 0);
         const generatedArtifactIds = new Set();
         for (let i = 0; i < numArtifactChoices && generatedArtifactIds.size < 5; i++) { // Limit attempts
             const allowRareArtifact = this.currentFloor > 1 && Math.random() < 0.35; // Chance for rare artifact
             const artifactId = this.generateArtifactReward(allowRareArtifact); // Allow uncommon/rare
             if (artifactId && !generatedArtifactIds.has(artifactId)) {
                 generatedArtifactIds.add(artifactId);
                 artifactOptions.push(artifactId);
             } else if (artifactId) {
                 // Retry if duplicate generated
                 i--;
             }
         }

         const baseRemovalCost = 75;
         // Add meta progression modifier if it exists
         const removalCost = baseRemovalCost + (this.metaProgression.getStartingBonus('shopRemovalCostIncrease') || 0);

         return {
             cards: cardOptions.map(id => ({ cardId: id, cost: this.getCardCost(id), purchased: false })),
             artifacts: artifactOptions.map(id => ({ artifactId: id, cost: this.getArtifactCost(id), purchased: false })),
             removalAvailable: true, // Card removal service
             removalCost: Math.max(10, removalCost) // Ensure cost doesn't go below 10
         };
      }

    /** Calculates the cost of a card in the shop. */
     getCardCost(cardId) {
        const concept = Data.concepts?.find(c => c.id === cardId);
        if (!concept) return 999; // Fallback high cost
        let baseCost = 50; // Common cost
        if (concept.rarity === 'uncommon') baseCost = 80; // Adjusted uncommon cost
        else if (concept.rarity === 'rare') baseCost = 140; // Adjusted rare cost

        // TODO: Apply cost modifiers from meta progression or game effects?
        // baseCost *= (1 + (this.metaProgression.getBonus('shopCostModifier') || 0));

        return Math.max(10, Math.round(baseCost)); // Ensure minimum cost
      }

    /** Calculates the cost of an artifact in the shop. */
     getArtifactCost(artifactId) {
         const template = ARTIFACT_TEMPLATES ? ARTIFACT_TEMPLATES[artifactId] : null;
         if (!template) return 999; // Fallback high cost
         let baseCost = 120; // Common artifact cost
         if (template.rarity === 'uncommon') baseCost = 175;
         else if (template.rarity === 'rare') baseCost = 250;
         else if (template.rarity === 'boss') baseCost = 400; // Example boss artifact cost

         // TODO: Apply cost modifiers?
         // baseCost *= (1 + (this.metaProgression.getBonus('shopCostModifier') || 0));

         return Math.max(25, Math.round(baseCost)); // Ensure minimum cost
      }

    /** Handles a purchase attempt in the shop. */
     handleShopPurchase(itemType, itemId) {
         if (!this.currentShop || !this.player || !this.uiManager || !this.metaProgression) {
             console.error("Shop purchase failed: Missing shop state, player, UI, or meta progression.");
             return;
         }
         let itemCost = 0;
         let purchasedItem = null;
         let needsUIUpdate = false;

         if (itemType === 'card') {
             const item = this.currentShop.cards.find(i => i.cardId === itemId && !i.purchased);
             if (item && this.player.insightThisRun >= item.cost) {
                 itemCost = item.cost;
                 // Use player method to add card - triggers artifacts, checks deck limits etc.
                 if (this.player.addCardToDeck(item.cardId)) {
                     item.purchased = true; purchasedItem = item;
                     this.player.insightThisRun -= itemCost; // Deduct cost AFTER successful add
                     this.metaProgression.updateMilestoneProgress('buyCard', 1);
                     needsUIUpdate = true;
                 } else {
                     console.error("Failed to add card to deck during shop purchase.");
                     this.uiManager.showActionFeedback("Could not add card!", "error");
                     return; // Abort if adding failed
                 }
             } else if (!item) { console.warn("Shop item (card) not found or already purchased."); return; }
             else { this.uiManager.showActionFeedback("Not enough Insight!", "warning"); return; }

         } else if (itemType === 'artifact') {
             const item = this.currentShop.artifacts.find(i => i.artifactId === itemId && !i.purchased);
             if (item && this.player.insightThisRun >= item.cost) {
                 itemCost = item.cost;
                 // Add artifact via player method - triggers onPickup etc.
                 this.player.addArtifact(item.artifactId);
                 item.purchased = true; purchasedItem = item;
                 this.player.insightThisRun -= itemCost; // Deduct cost
                 this.metaProgression.updateMilestoneProgress('buyArtifact', 1);
                 needsUIUpdate = true;
             } else if (!item) { console.warn("Shop item (artifact) not found or already purchased."); return; }
             else { this.uiManager.showActionFeedback("Not enough Insight!", "warning"); return; }

         } else if (itemType === 'remove') {
              const removalCost = this.currentShop.removalCost;
              if (this.currentShop.removalAvailable && this.player.insightThisRun >= removalCost) {
                   // Check deck size *before* showing modal
                   if (this.player.deckManager.masterDeck.length <= 5) { // Example minimum deck size
                       this.uiManager.showActionFeedback("Deck too small to remove!", "warning");
                       return;
                   }
                   // Show card selection modal
                   this.uiManager.showCardSelectionModal(
                       this.player.deckManager.getMasterDeck(), // Show full deck
                       (selectedCard) => { // Callback function
                           if (selectedCard) {
                               // Use player method to remove - triggers artifacts
                               if (this.player.removeCardFromDeck(selectedCard)) {
                                   this.player.insightThisRun -= removalCost; // Deduct cost AFTER successful removal
                                   this.currentShop.removalAvailable = false; // Mark service as used
                                   this.metaProgression.updateMilestoneProgress('removeCard', 1);
                                   this.uiManager.renderShop(this.currentShop, this.player.insightThisRun); // Update shop UI
                                   this.uiManager.showNotification(`Removed: ${selectedCard.name}`);
                               } else {
                                   console.error("Failed to remove selected card during shop service.");
                                   this.uiManager.showActionFeedback("Failed to remove card.", "error");
                               }
                           } else {
                               console.log("Card removal cancelled by player.");
                           }
                       },
                       `Choose Concept to Remove (${removalCost} Insight)` // Modal Title
                   );
                   // Don't need UI update here, it's handled by the modal callback
                   return; // Exit early as modal handles the flow now
              } else {
                  this.uiManager.showActionFeedback(this.currentShop.removalAvailable ? "Not enough Insight!" : "Removal already used.", "warning");
                  return;
              }
         }

         // Update shop UI if a card/artifact was purchased
         if (purchasedItem) {
             console.log(`Purchased ${itemType} ${itemId} for ${itemCost}. Insight remaining: ${this.player.insightThisRun}`);
             this.uiManager.renderShop(this.currentShop, this.player.insightThisRun);
         } else if (itemType !== 'remove') { // Avoid logging failure for removal (handled above)
             console.log(`Could not purchase ${itemType} ${itemId}.`);
         }
      }

    /** Leaves the shop node. */
     leaveShop() {
         const nodeId = this.mapManager?.currentNodeId;
         this.currentShop = null; // Clear shop state
         this.completeNode(nodeId); // Mark node as complete
         this.uiManager?.showScreen('mapScreen'); // Return to map
         this.mapManager?.renderMap(); // Re-render map
      }

    /** Enters the rest site node. */
    enterRestSite() {
         if (!this.player || !this.uiManager) {
            console.error("Cannot enter rest site: Player or UIManager missing.");
            this.completeNode(this.mapManager?.currentNodeId, { error: "Rest site entry failed" });
            this.uiManager?.showScreen('mapScreen');
            return;
         }
         this.currentRestSite = { usedOption: false }; // Reset rest site state
         this.uiManager.showScreen('restSiteScreen');
         this.uiManager.renderRestSite(this.currentRestSite, this.player); // Pass player for checks
    }

    /** Handles actions taken at the rest site. */
     handleRestSiteAction(action) {
        if (!this.currentRestSite || !this.player || !this.uiManager || !this.metaProgression) {
             console.error("Cannot perform rest site action: Missing state, player, UI, or meta progression.");
             return;
        }
        if (this.currentRestSite.usedOption) {
             this.uiManager.showActionFeedback("Already acted here.", "info"); return;
        }

         const currentNodeId = this.mapManager?.currentNodeId;
         let actionTaken = false;

         switch (action) {
             case 'heal':
                 const healAmount = Math.floor(this.player.maxIntegrity * 0.3); // Heal 30%
                 if (this.player.currentIntegrity >= this.player.maxIntegrity) {
                     this.uiManager.showActionFeedback("Already at full Integrity!", "info"); return;
                 }
                 // Player.heal triggers 'onHeal' artifacts
                 const actualHeal = this.player.heal(healAmount);
                 // Trigger specific rest site heal artifact AFTER base heal
                 this.player.triggerArtifacts('onRestSiteHeal', { baseHeal: actualHeal });
                 this.currentRestSite.usedOption = true; actionTaken = true;
                 this.metaProgression.updateMilestoneProgress('restHeal', 1);
                 this.uiManager.showNotification(`Restored ${actualHeal} Integrity.`);
                 break;

             case 'upgrade':
                 const upgradable = this.player.deckManager.getMasterDeck().filter(c => !c.upgraded);
                 if (upgradable.length === 0) {
                     this.uiManager.showActionFeedback("No concepts left to upgrade!", "info"); return;
                 }
                 this.uiManager.showCardSelectionModal(upgradable, (card) => {
                     if (card) {
                         // Find the actual card instance in the master deck to upgrade
                         const cardInDeck = this.player.deckManager.masterDeck.find(c => c.id === card.id);
                         if (cardInDeck && !cardInDeck.upgraded) {
                             cardInDeck.upgrade(); // Upgrade the instance
                             this.currentRestSite.usedOption = true;
                             this.metaProgression.updateMilestoneProgress('restUpgrade', 1);
                             // Trigger artifact AFTER successful upgrade
                             this.player.triggerArtifacts('onCardUpgrade', { card: cardInDeck });
                             this.uiManager.showNotification(`Upgraded: ${cardInDeck.name}.`);
                             this.leaveRestSite(); // Leave after selection
                         } else {
                             console.error("Selected card for upgrade not found in deck or already upgraded.");
                              this.uiManager.showActionFeedback("Upgrade failed.", "error");
                         }
                     } else {
                         console.log("Upgrade cancelled."); // Stay at rest site if cancelled
                     }
                 }, "Meditate (Upgrade Concept)");
                  // Don't mark actionTaken yet, modal callback handles it
                 break;

             case 'remove':
                 if (this.player.deckManager.masterDeck.length <= 5) { // Check min deck size
                     this.uiManager.showActionFeedback("Deck too small!", "warning"); return;
                 }
                 this.uiManager.showCardSelectionModal(this.player.deckManager.getMasterDeck(), (card) => {
                     if (card) {
                          const removedCard = {...card}; // Create copy for trigger data BEFORE removal
                         // Use player method which handles DeckManager interaction & triggers
                         if (this.player.removeCardFromDeck(card)) {
                             this.currentRestSite.usedOption = true;
                             this.metaProgression.updateMilestoneProgress('restRemove', 1);
                             // Artifact trigger 'onCardRemove' is handled inside Player.removeCardFromDeck
                             this.uiManager.showNotification(`Removed: ${removedCard.name}.`);
                             this.leaveRestSite(); // Leave after selection
                         } else {
                             console.error("Failed to remove selected card at rest site.");
                              this.uiManager.showActionFeedback("Removal failed.", "error");
                         }
                     } else {
                         console.log("Removal cancelled."); // Stay at rest site if cancelled
                     }
                 }, "Let Go (Remove Concept)");
                 // Don't mark actionTaken yet, modal callback handles it
                 break;

              default:
                 console.warn("Unknown rest site action:", action);
                 return; // Do nothing if action unknown
         }

         // If an action was taken immediately (like heal), leave the site.
         // Upgrade/Remove leave via their callbacks.
         if (actionTaken) {
             this.leaveRestSite();
         } else {
             // Update UI if still at rest site (e.g., after failed action)
             this.uiManager.renderRestSite(this.currentRestSite, this.player);
         }
     }

    /** Leaves the rest site node. */
     leaveRestSite() {
         const nodeId = this.mapManager?.currentNodeId;
         this.currentRestSite = null; // Clear rest site state
         this.completeNode(nodeId); // Mark node as complete
         this.uiManager?.showScreen('mapScreen'); // Return to map
         this.mapManager?.renderMap(); // Re-render map
     }

    /** Marks a node as completed and updates UI. */
    completeNode(nodeId, options = {}) {
        // Basic completion logic, might be expanded later
        console.log(`GameState: Completing node ${nodeId}`, options);
        const node = this.mapManager?.nodes[nodeId];
        if(node) node.visited = true; // Ensure visited flag is set

        // Trigger artifacts associated with completing a node
        if(this.player && node) {
             this.player.triggerArtifacts('onNodeComplete', { nodeType: node.type, floor: this.currentFloor });
        }

        // Update player info display (HP, Insight, Deck count might change)
        this.uiManager?.updatePlayerMapInfo(this.player, this.currentFloor);

        // IMPORTANT: Map rendering/screen changes are usually handled by the function
        // that *calls* completeNode (e.g., leaveShop, handleCombatEnd reward callback)
        // to ensure the correct screen is shown AFTER completion.
    }

    /** Advances the player to the next floor. */
     advanceFloor() {
         if (!this.runActive || !this.player || !this.mapManager || !this.uiManager) {
              console.error("Cannot advance floor: Missing active run components.");
              return;
         }
         const oldFloor = this.currentFloor;
         console.log(`GameState: Advancing from floor ${oldFloor}...`);
         this.currentFloor++;

         // --- Check for Run End ---
         // TODO: Make MAX_FLOORS configurable
         const MAX_FLOORS = 3;
         if (this.currentFloor > MAX_FLOORS) {
             console.log(`Reached floor ${this.currentFloor}, exceeding max ${MAX_FLOORS}. Triggering victory.`);
             this.endRun(true); // Victory condition met
             return;
         }

         // --- Trigger Floor Start Artifacts ---
         this.player.triggerArtifacts('onFloorStart', { floor: this.currentFloor });

         // --- Optional: Between-Floor Healing/Events ---
         const healPercent = 0.15; // Heal 15% between floors?
         const healAmount = Math.floor(this.player.maxIntegrity * healPercent);
         this.player.heal(healAmount);
         this.uiManager.showNotification(`Reached Floor ${this.currentFloor}. Healed ${healAmount} Integrity.`);
         // Could add a chance for a specific between-floor event here

         // --- Generate New Floor Map ---
         this.mapManager.generateFloor(this.currentFloor);
         // currentNodeId is set by generateFloor

         // --- Update UI ---
         this.uiManager.showScreen('mapScreen'); // Ensure map is shown
         this.uiManager.updatePlayerMapInfo(this.player, this.currentFloor); // Update floor display etc.
     }

     // --- Reward Generation Helpers ---

    /** Generates card reward choices, respecting unlocked concepts. */
     generateCardReward(allowRare = false, numChoices = 3, allowCommon = false) {
         if (!this.player || !this.metaProgression || !Data?.concepts) return [];
         const availableConcepts = Data.concepts.filter(c =>
             this.metaProgression.isConceptUnlocked(c.id) &&
             (allowCommon || c.rarity !== 'common') &&
             (allowRare || c.rarity !== 'rare') &&
             c.cardType !== 'Status' && c.cardType !== 'Curse' // Exclude non-reward types
         );
          if (availableConcepts.length === 0) { console.warn("No available concepts for card reward generation!"); return []; }

          // Shuffle and pick unique choices
          this._fallbackShuffle(availableConcepts);
          const choices = []; const chosenIds = new Set();
          for (const concept of availableConcepts) {
              if (choices.length >= numChoices) break;
              if (!chosenIds.has(concept.id)) {
                  choices.push(concept.id);
                  chosenIds.add(concept.id);
              }
          }
          return choices;
     }

    /** Generates a single artifact reward choice, respecting unlocked artifacts. */
     generateArtifactReward(guaranteeRareOrBetter = false) {
         if (!this.player || !this.metaProgression || !ARTIFACT_TEMPLATES) return null;

         const availableArtifactIds = Object.keys(ARTIFACT_TEMPLATES).filter(id =>
             this.metaProgression.isArtifactUnlocked(id) &&
             ARTIFACT_TEMPLATES[id].rarity !== 'boss' // Exclude boss artifacts from random drops maybe?
         );
         if (availableArtifactIds.length === 0) { console.warn("No available artifacts for reward generation!"); return null; }

         let potentialChoices = availableArtifactIds;
         // Filter by rarity if needed
         if (guaranteeRareOrBetter) {
              potentialChoices = availableArtifactIds.filter(id => ['uncommon', 'rare'].includes(ARTIFACT_TEMPLATES[id].rarity));
              if (potentialChoices.length === 0) potentialChoices = availableArtifactIds; // Fallback if no rare+ unlocked
         }

          this._fallbackShuffle(potentialChoices);
          return potentialChoices.length > 0 ? potentialChoices[0] : null; // Return first unique ID or null
     }

    /** Basic shuffle for reward generation if needed */
     _fallbackShuffle(array) { return array.sort(() => Math.random() - 0.5); }

    // --- Utility Methods ---
    // These seem less used now Player class handles defaults
    // getDefaultDeckIds() { return [1,1,1,1,1, 2,2,2,2,2]; } // Example IDs
    // getDefaultAttunements() { return { A:5, I:5, S:5, P:5, C:5, R:5, RF:5 }; }

    getCurrentNode() { return this.mapManager?.getCurrentNode(); }

    /** Adds a status card (like Dazed, Confused) to player's deck */
    addStatusCardToPlayerDeck(statusCardConceptId, destination = 'discard') {
         if (!this.player || !this.player.deckManager || !this.uiManager) {
             console.error("Cannot add status card: Missing player, deck manager, or UI manager.");
             return;
         }
         // Validate conceptId exists and is a status card?
         const concept = Data.concepts?.find(c => c.id === statusCardConceptId);
         if (!concept || concept.cardType !== 'Status') {
              console.warn(`Attempted to add invalid or non-Status concept as status card: ID ${statusCardConceptId}`);
              return;
         }

         console.log(`Adding status card ${concept.name} (${statusCardConceptId}) to ${destination} pile.`);
         let statusCard;
         try {
             statusCard = new Card(statusCardConceptId);
             if (statusCard.conceptId === -1) throw new Error("Card creation failed."); // Check error card
         } catch (error) {
             console.error(`Failed to create status card instance for ID ${statusCardConceptId}:`, error);
             return;
         }

         // Add to the specified pile
         if (destination === 'draw') {
             this.player.deckManager.drawPile.unshift(statusCard); // Add to top of draw pile
         } else if (destination === 'hand') {
             if (this.player.deckManager.hand.length < this.player.deckManager.maxHandSize) {
                 this.player.deckManager.hand.push(statusCard);
                 // Update hand UI immediately if adding to hand
                 this.uiManager.combatUI?.renderHand(this.player.deckManager.hand, this.combatManager?.playerTurn);
             } else {
                 this.player.deckManager.discardPile.push(statusCard); // Add to discard if hand full
                  this.uiManager.showActionFeedback("Hand full! Status added to discard.", "info");
             }
         } else { // Default to discard
             this.player.deckManager.discardPile.push(statusCard);
         }

         // Update UI counts (always update counts regardless of destination)
         this.uiManager.updateDeckDiscardCounts(this.player.deckManager);
         // Trigger artifact for adding status?
         this.player.triggerArtifacts('onStatusCardAdded', { card: statusCard, destination: destination });
    }

} // End of GameState class
