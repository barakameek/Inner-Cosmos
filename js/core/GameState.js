// js/core/GameState.js

import { Player } from './Player.js';
import { MapManager } from '../map/MapManager.js';
import { CombatManager } from '../combat/CombatManager.js';
import { UIManager } from '../ui/UIManager.js';
import { Card } from './Card.js';
import { Artifact } from './Artifact.js';
import * as Data from '../../data.js'; // Correct path
import { ARTIFACT_TEMPLATES } from './ArtifactDefinitions.js';
import { ENEMY_TEMPLATES } from '../combat/Enemy.js';

/**
 * Manages the state for a single game run, acting as the central hub.
 */
export class GameState {
    constructor(playerData = {}, metaProgression = null, uiManager = null) { // Accept playerData here
        console.log("Initializing GameState for a new run...");
        // Log if quiz data seems present in playerData
        if (playerData?.startingDeck || playerData?.attunements) {
            console.log("GameState Constructor received playerData potentially containing Quiz results.");
        } else {
            console.log("GameState Constructor received default/empty playerData.");
        }

        this.player = null; // Player is created in startRun
        this.mapManager = null;
        this.combatManager = null;
        this.uiManager = uiManager; // Store references passed in
        this.metaProgression = metaProgression;
        this.currentFloor = 0;
        this.currentRunSeed = Date.now(); // Use a seed for potential reproducibility
        this.runActive = false;
        this.currentEvent = null;
        this.currentShop = null;
        this.currentRestSite = null;

        // Validate core components passed to constructor
        if (!this.uiManager) console.warn("GameState Warning: UIManager reference not provided during construction.");
        if (!this.metaProgression) console.warn("GameState Warning: MetaProgression reference not provided during construction.");

        console.log(`GameState created with seed: ${this.currentRunSeed}`);
    }

    /**
     * Initializes the components for a new game run using provided data.
     * Called by main.js after potentially showing the Mirror Quiz.
     */
    startRun(playerData, metaProgression, uiManager) { // Keep parameters for clarity, even if stored in `this`
        console.log("GameState: Starting run setup...");
        if (this.runActive) { console.warn("GameState: Cannot start a new run while one is active."); return; }
        // Ensure core managers are available (might be redundant if check done in main.js, but good safeguard)
        this.uiManager = uiManager || this.uiManager;
        this.metaProgression = metaProgression || this.metaProgression;
        if (!this.uiManager || !this.metaProgression) {
            console.error("GameState FATAL: UIManager or MetaProgression missing. Cannot start run.");
            this.uiManager?.showModal("Critical Error: Missing core manager. Cannot start run.", [{text: 'OK', callback: () => this.uiManager?.showScreen('mainMenuScreen')}]);
            return;
        }

        this.runActive = true;
        this.currentFloor = 1;

        try {
            // 1. Create the Player instance, passing the playerData (which might have quiz results)
            this.player = new Player(playerData, this.metaProgression);
            this.player.setGameState(this);
             if (this.player.deckManager) {
                 this.player.deckManager.setPlayerReference(this.player);
             } else {
                 console.error("GameState FATAL: Player DeckManager failed to initialize!");
                 throw new Error("DeckManager initialization failed.");
             }
            console.log("GameState: Player instance created.");

            // 2. Create MapManager and generate the first floor
            this.mapManager = new MapManager(this, this.uiManager);
            this.mapManager.generateFloor(this.currentFloor);
            console.log("GameState: MapManager initialized, Floor 1 generated.");

            // 3. Create CombatManager
            this.combatManager = new CombatManager(this, this.uiManager);
            console.log("GameState: CombatManager initialized.");

            // 4. Initial UI setup
            console.log("Run Started. Player at node:", this.mapManager.currentNodeId);
            this.uiManager.updatePlayerMapInfo(this.player, this.currentFloor); // Update map HUD
            this.uiManager.showScreen('mapScreen'); // Show the map

            this.triggerMilestoneAction('startRun');

        } catch (error) {
            console.error("CRITICAL ERROR during GameState run initialization:", error);
            this.uiManager.showModal(`Run Initialization Error: ${error.message}<br><br>Returning to menu.`, [{text: 'OK', callback: () => this.uiManager?.showScreen('mainMenuScreen')}]);
            this.cleanupRun();
        }
    }

    /** Ends the current run (victory or defeat). */
    endRun(victory) {
        if (!this.runActive) return;
        const runInsight = this.player?.insightThisRun || 0;
        const finalFloor = this.currentFloor;
        const nodeTypeAtEnd = this.mapManager?.getCurrentNode()?.type || 'unknown';
        const currentAscension = this.metaProgression?.currentAscension || 0;
        console.log(`GameState: Ending run. Victory: ${victory}. Floor: ${finalFloor}. Insight: ${runInsight}. Ascension: ${currentAscension}`);
        this.runActive = false;

        // Award Insight
        if (this.metaProgression && runInsight > 0) {
            this.metaProgression.addInsight(runInsight); // Saves internally
        }

        // --- Update Milestones ---
        if (this.metaProgression) {
            this.triggerMilestoneAction('runCompleted');
            if (victory) {
                this.triggerMilestoneAction('runVictory');
                this.triggerMilestoneAction(`victory_floor_${finalFloor}`);
                if (currentAscension >= 0) {
                    this.triggerMilestoneAction('winAscension', 1, { value: currentAscension });
                }
                 if (this.metaProgression.highestAscensionBeat < currentAscension) {
                     this.metaProgression.highestAscensionBeat = currentAscension;
                     console.log(`New highest Ascension beaten: ${currentAscension}`);
                 }
            } else {
                 this.triggerMilestoneAction('runDefeat');
                 this.triggerMilestoneAction(`defeat_in_${nodeTypeAtEnd}`);
                 this.triggerMilestoneAction(`defeat_on_floor_${finalFloor}`);
            }
            // Check state milestones after potential changes
            this.metaProgression.checkStateBasedMilestones(this);
            this.metaProgression.save(); // Save any non-insight changes from milestones
        }

        // Show End Screen
        if (this.uiManager) {
            const message = `<h2>Run Ended</h2><p><strong>${victory ? 'Victory!' : 'Defeat...'}</strong></p><p>Floor Reached: ${finalFloor}</p>${currentAscension > 0 ? `<p>Ascension Level: ${currentAscension}</p>` : ''}<p>Insight Gained This Run: ${runInsight} <i class='fas fa-brain insight-icon'></i></p><hr><p>Total Insight: ${this.metaProgression?.totalInsight || 0} <i class='fas fa-brain insight-icon'></i></p>`;
             this.uiManager.showModal(message, [{ text: 'Return to Menu', callback: () => { this.cleanupRun(); this.uiManager.showScreen('mainMenuScreen'); } }]);
        } else {
            // Fallback if UI manager isn't available for some reason
            alert(`Run Ended. Victory: ${victory}. Insight: ${runInsight}. Total Insight: ${this.metaProgression?.totalInsight || 0}.`);
            this.cleanupRun();
            document.getElementById('mainMenuScreen')?.classList.add('active'); // Try to show main menu directly
        }
    }

    /** Cleans up volatile run state. */
    cleanupRun() {
        console.log("Cleaning up run state...");
        this.player = null;
        this.mapManager = null;
        this.combatManager = null;
        // Keep uiManager and metaProgression references as they persist between runs
        this.currentEvent = null;
        this.currentShop = null;
        this.currentRestSite = null;
        this.runActive = false;
        this.currentFloor = 0; // Reset floor
        console.log("Run state cleaned.");
    }

    /** Handles logic when the player enters a map node. */
    handleNodeEntry(node) {
        if (!node || !this.runActive || !this.player) {
            console.warn("Cannot handle node entry: Invalid state.");
            // Ensure player is returned to map safely if state is invalid
            this.uiManager?.showScreen('mapScreen');
            this.mapManager?.renderMap(); // Re-render map to reflect current state
            return;
        };

        console.log(`GameState: Entering node ${node.id} (Type: ${node.type}, Floor: ${this.currentFloor})`);
        this.player.triggerArtifacts('onNodeEnter', { nodeType: node.type, floor: this.currentFloor }); // Trigger BEFORE node action

        switch (node.type) {
            case 'combat':
            case 'elite':
            case 'boss':
                if (node.data.enemies && node.data.enemies.length > 0) {
                    this.enterCombat(node.data.enemies);
                } else {
                    console.warn(`Node ${node.id} (${node.type}) has no enemy data! Completing node.`);
                    this.completeNode(node.id, { warning: "Missing enemy data" });
                    this.uiManager?.showScreen('mapScreen'); // Go back to map
                    this.mapManager?.renderMap();
                }
                break;
            case 'event':
                 if (node.data.eventId) {
                     this.triggerEvent(node.data.eventId);
                 } else {
                     console.warn(`Node ${node.id} (event) has no event ID! Completing node.`);
                     this.completeNode(node.id, { warning: "Missing event ID" });
                     this.uiManager?.showScreen('mapScreen');
                     this.mapManager?.renderMap();
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
                this.completeNode(node.id); // Mark start node as visited (already done in MapManager, but safe to call again)
                this.mapManager?.renderMap(); // Re-render to show available moves
                // Note: We stay on the map screen after 'completing' the start node.
                break;
            default:
                console.warn(`Unknown node type: ${node.type}. Completing node.`);
                this.completeNode(node.id, { warning: `Unknown node type: ${node.type}` });
                this.uiManager?.showScreen('mapScreen'); // Go back to map
                this.mapManager?.renderMap();
        }
    }

    /** Initiates combat. */
    enterCombat(enemyList) {
        if (!this.combatManager) {
            console.error("Cannot enter combat: CombatManager missing!");
            this.completeNode(this.mapManager?.currentNodeId, { error: "Combat failed (manager missing)" });
            this.uiManager?.showScreen('mapScreen');
            return;
        }
        if (this.combatManager.isActive) {
            console.warn("Cannot enter combat: Already active.");
            return;
        }
        // startCombat handles switching to combatScreen via UIManager
        this.combatManager.startCombat(enemyList);
    }

    /** Handles the outcome of combat. */
     handleCombatEnd(victory) {
        if (!this.runActive || !this.player) {
            console.warn("handleCombatEnd called but run is not active or player missing.");
            return;
        }
        console.log(`GameState: Handling combat end. Victory: ${victory}`);

        // Allow combat manager to clear its internal state first if needed
        // this.combatManager.cleanupCombat(); // If CombatManager needs internal cleanup beyond ending

        this.player.cleanupCombatStatuses(); // Cleanup player temp statuses

        const currentNode = this.mapManager?.getCurrentNode();
        const nodeType = currentNode?.type;

        if (!victory) {
            this.endRun(false); // Defeat ends the run
            return;
        }

        // --- Victory Path ---
        // Trigger Victory Milestones
        this.triggerMilestoneAction(`victory_${nodeType || 'combat'}`);
        if (nodeType === 'combat') this.triggerMilestoneAction('winCombat');
        else if (nodeType === 'elite') this.triggerMilestoneAction('winElite');
        else if (nodeType === 'boss') this.triggerMilestoneAction('winBoss');
        // TODO: Add checks for Flawless/Debuff milestones here or in CombatManager before calling this

        // Generate Rewards
        let insightReward = 0;
        let cardChoices = [];
        let artifactChoices = [];
        console.log(`Generating rewards for beating ${nodeType} node...`);
        try {
            const baseInsight = { combat: 10, elite: 25, boss: 75 };
            insightReward = Math.floor((baseInsight[nodeType] || 5) * (1 + Math.random() * 0.5)); // Add some variance

            // Card Reward Logic
            const cardRewardChance = { combat: 0.75, elite: 1.0, boss: 1.0 };
            if (Math.random() < (cardRewardChance[nodeType] || 0)) {
                 cardChoices = this.generateCardReward(this.player, (nodeType !== 'combat'), 3, true); // Allow rare/uncommon from elite/boss, common allowed
            }

            // Artifact Reward Logic
            const artifactRewardChance = { elite: 0.6, boss: 1.0 };
             if (nodeType !== 'combat' && Math.random() < (artifactRewardChance[nodeType] || 0)) {
                  const art = this.generateArtifactReward(nodeType === 'boss'); // Guarantee rare+ for boss
                  if (art) artifactChoices.push(art);
             }

            // Handle Boss specific onDeathAction reward from template
            if (nodeType === 'boss') {
                const bossEnemyId = currentNode?.data?.enemies[0]; // Assuming single boss ID
                const bossTemplate = ENEMY_TEMPLATES[bossEnemyId];
                 if (bossTemplate?.onDeathAction?.type === 'reward') {
                     if (bossTemplate.onDeathAction.insight) {
                         insightReward += bossTemplate.onDeathAction.insight;
                     }
                     // Ensure artifact is unlocked before adding to choices
                     if (bossTemplate.onDeathAction.artifactId && this.metaProgression?.isArtifactUnlocked(bossTemplate.onDeathAction.artifactId)) {
                          if (!artifactChoices.includes(bossTemplate.onDeathAction.artifactId)) {
                              artifactChoices.push(bossTemplate.onDeathAction.artifactId);
                          }
                     } else if (bossTemplate.onDeathAction.artifactId) {
                         console.log(`Boss drop artifact ${bossTemplate.onDeathAction.artifactId} not unlocked.`);
                     }
                 }
            }

             // Apply insight gain
             if (insightReward > 0) {
                 this.player.insightThisRun += insightReward;
                 console.log(`Awarded ${insightReward} insight.`);
                 this.metaProgression?.checkStateBasedMilestones(this); // Check if insight gain triggers milestone
             }
        } catch (error) {
            console.error("Error generating combat rewards:", error);
            // Fallback reward?
            if (insightReward <= 0 && this.player) {
                 this.player.insightThisRun += 5; // Give minimal insight on error
                 insightReward = 5;
            }
        }

        // Define what happens after reward screen
        const afterRewardCallback = () => {
            console.log("Reward screen completed.");
            this.completeNode(currentNode?.id); // Mark the node as done
            if (nodeType === 'boss') {
                this.advanceFloor(); // Move to next floor after boss
            } else {
                this.uiManager.showScreen('mapScreen'); // Return to map
                this.mapManager?.renderMap(); // Re-render map
            }
        };

        // Show Reward Screen only if there's something to show
        if (insightReward > 0 || cardChoices.length > 0 || artifactChoices.length > 0) {
            if (this.uiManager) {
                this.uiManager.showRewardScreen({
                    insight: insightReward,
                    cardChoices: cardChoices || [],
                    artifactChoices: artifactChoices || [],
                    onComplete: afterRewardCallback
                });
            } else {
                console.error("UIManager missing, cannot show reward screen!");
                afterRewardCallback(); // Proceed without showing rewards if UI fails
            }
        } else {
            console.log("No rewards generated after combat.");
            afterRewardCallback(); // Proceed directly if no rewards
        }
     }

    /** Triggers a specific event or dilemma. */
     triggerEvent(eventId) {
         console.log(`GameState: Triggering event/dilemma ${eventId}`);
         if (!Data || !this.uiManager || !this.player) {
             console.error("Cannot trigger event: Missing components (Data, UIManager, Player).");
             this.completeNode(this.mapManager?.currentNodeId, { error: "Event trigger failed" });
             this.uiManager?.showScreen('mapScreen'); // Ensure return to map
             return;
         }

         let eventData = null;
         let eventType = 'unknown';
         let sourceKey = null; // To track which category it came from

         // --- Find Event Data (Improved Search) ---
         for (const categoryKey in Data.reflectionPrompts) { const source = Data.reflectionPrompts[categoryKey]; if (!source) continue; if (Array.isArray(source)) { const found = source.find(p => p.id === eventId); if (found) { eventData = found; eventType = 'reflection'; sourceKey = categoryKey; break; } } else if (typeof source === 'object' && source !== null) { if (source[eventId]) { eventData = source[eventId]; eventType = 'reflection'; sourceKey = categoryKey; break; } for (const subKey in source) { if(Array.isArray(source[subKey])) { const found = source[subKey].find(p => p.id === eventId); if (found) { eventData = found; eventType = 'reflection'; sourceKey = categoryKey; break; } } } } if (eventData) break; }
         if (!eventData) { const foundDilemma = Data.elementalDilemmas.find(d => d.id === eventId); if (foundDilemma) { eventData = foundDilemma; eventType = 'dilemma'; } }
         // --- End Find Event Data ---

         const currentNodeId = this.mapManager?.currentNodeId; // Get current node ID before showing modal

         if (eventData) {
             this.currentEvent = { id: eventId, type: eventType, data: eventData }; // Store current event info

             if (eventType === 'reflection') {
                let rewardText = ""; const insightGain = 5; if (this.player) { this.player.insightThisRun += insightGain; } rewardText = `<br><br><i>(+${insightGain} <i class='fas fa-brain insight-icon'></i> Insight)</i>`; this.triggerMilestoneAction('completeReflection', 1, { eventId: eventId }); if (sourceKey === 'Dissonance') { this.triggerMilestoneAction('completeReflectionDissonance', 1); }
                 this.uiManager.showModal( eventData.text + rewardText, [{ text: 'Ponder...', callback: () => { this.completeNode(currentNodeId); this.currentEvent = null; this.uiManager.showScreen('mapScreen'); this.mapManager?.renderMap(); }}]);
             } else if (eventType === 'dilemma') {
                  this.triggerMilestoneAction('encounterDilemma', 1);
                  this.uiManager.showModal( `<strong>Dilemma:</strong> ${eventData.situation}<hr>${eventData.question}`, [ { text: eventData.sliderMinLabel || 'Choice 1', callback: () => this.resolveDilemma(eventId, 'min', currentNodeId, eventData) }, { text: eventData.sliderMaxLabel || 'Choice 2', callback: () => this.resolveDilemma(eventId, 'max', currentNodeId, eventData) } ]);
             } else {
                 console.warn(`Event ${eventId} type unknown: ${eventType}`); this.completeNode(currentNodeId, { warning: `Unknown event type: ${eventType}` }); this.currentEvent = null; this.uiManager?.showScreen('mapScreen'); this.mapManager?.renderMap();
             }
         } else {
             console.error(`Event/Dilemma ID ${eventId} not found in data.js!`); this.completeNode(currentNodeId, { error: "Event data not found" }); this.currentEvent = null; this.uiManager?.showScreen('mapScreen'); this.mapManager?.renderMap();
         }
     }

    /** Resolves the outcome of a dilemma choice, including attunement shifts. */
     resolveDilemma(dilemmaId, choice, nodeIdToComplete, dilemmaData) {
         console.log(`Resolving dilemma ${dilemmaId} with choice: ${choice}`);
         if (!dilemmaData || !this.player || !this.uiManager || !this.metaProgression) { console.error("Cannot resolve dilemma: Missing components."); this.completeNode(nodeIdToComplete); this.uiManager.showScreen('mapScreen'); this.mapManager?.renderMap(); return; }
         this.currentEvent = null; // Clear current event state

         let insightGain = 10; this.player.insightThisRun += insightGain; this.triggerMilestoneAction('resolveDilemma', 1, { dilemmaId: dilemmaId, choice: choice });
         const chosenElement = (choice === 'min') ? dilemmaData.elementKeyMin : dilemmaData.elementKeyMax; const otherElement = (choice === 'min') ? dilemmaData.elementKeyMax : dilemmaData.elementKeyMin; let attunementShiftText = "";
         if (chosenElement && this.player.attunements.hasOwnProperty(chosenElement)) { this.player.modifyAttunement(chosenElement, 1); attunementShiftText += ` (+1 ${chosenElement})`; }
         if (otherElement && this.player.attunements.hasOwnProperty(otherElement)) { this.player.modifyAttunement(otherElement, -1); attunementShiftText += ` (-1 ${otherElement})`; }
         let outcomeText = `Leaned towards ${chosenElement}.${attunementShiftText} Gained ${insightGain} <i class='fas fa-brain insight-icon'></i> Insight.`; let cardRewardText = "";
         let specificCardRewardId = null; const rewardPoolKey = (choice === 'min') ? dilemmaData.rewardPoolKeyMin : dilemmaData.rewardPoolKeyMax; if (choice === 'min' && dilemmaData.rewardConceptIdMin) specificCardRewardId = dilemmaData.rewardConceptIdMin; else if (choice === 'max' && dilemmaData.rewardConceptIdMax) specificCardRewardId = dilemmaData.rewardConceptIdMax;
         let addedCard = null; if (specificCardRewardId && this.metaProgression.isConceptUnlocked(specificCardRewardId)) { addedCard = this.player.addCardToDeck(specificCardRewardId); } else if (rewardPoolKey && Data.cardPools?.[rewardPoolKey]) { const poolChoices = this.generateCardReward(this.player, true, 1, true, Data.cardPools[rewardPoolKey]); if (poolChoices.length > 0) { addedCard = this.player.addCardToDeck(poolChoices[0]); } } else { const potentialCard = Data.concepts?.find(c => c.primaryElement === chosenElement && c.rarity === 'common' && this.metaProgression.isConceptUnlocked(c.id)); if (potentialCard) { addedCard = this.player.addCardToDeck(potentialCard.id); } }
         if (addedCard) { cardRewardText = `<br>Gained Concept: ${addedCard.name}`; this.triggerMilestoneAction('gainCardFromEvent'); } else if (specificCardRewardId || rewardPoolKey) { cardRewardText = "<br>A relevant concept resonated, but couldn't be grasped."; } else { cardRewardText = "<br>No specific concept resonated from this choice."; }
         this.uiManager.showModal( outcomeText + cardRewardText, [{ text: 'Continue', callback: () => { this.completeNode(nodeIdToComplete); this.uiManager.showScreen('mapScreen'); this.mapManager?.renderMap(); }}]);
     }

    /** Enters the shop node. */
    enterShop() {
         if (!this.player || !this.uiManager) { console.error("Cannot enter shop: Player or UIManager missing."); this.completeNode(this.mapManager?.currentNodeId, { error: "Shop entry failed" }); this.uiManager?.showScreen('mapScreen'); return; }
         try { const shopInventory = this.generateShopInventory(); this.currentShop = shopInventory; this.uiManager.showScreen('shopScreen'); this.uiManager.renderShop(shopInventory, this.player.insightThisRun); }
         catch (error) { console.error("Error generating/rendering shop:", error); this.completeNode(this.mapManager?.currentNodeId, { error: "Shop generation failed" }); this.uiManager?.showScreen('mapScreen'); }
    }

    /**
     * Generates the inventory for the shop, weighted by player attunements.
     * (MODIFIED for Adaptive Shopkeeper)
     */
    generateShopInventory() {
        if (!this.player || !this.metaProgression || !Data?.concepts || !ARTIFACT_TEMPLATES) {
            throw new Error("Missing data for shop generation.");
        }

        const numCardChoices = 3 + (this.metaProgression.getStartingBonus('cardRewardChoicesBonus') || 0);
        const cardOptions = [];
        const generatedCardIds = new Set();
        let attempts = 0;

        // --- Adaptive Card Selection Logic ---
        const sortedAttunements = Object.entries(this.player.attunements || {}) .sort(([,a], [,b]) => b - a);
        const topElement = sortedAttunements[0] ? sortedAttunements[0][0] : null;
        const secondElement = sortedAttunements[1] ? sortedAttunements[1][0] : null;
        console.log(`Shop Generation: Top Attunements: ${topElement}, ${secondElement}`);
        const topElemChance = 0.50; const secondElemChance = 0.25;
        let baseCardPool = Data.concepts.filter(concept => concept && this.metaProgression.isConceptUnlocked(concept.id) && !['Status', 'Curse', 'starter'].includes(concept.rarity) );
         if (baseCardPool.length === 0) { console.warn("Shop Generation: No unlocked concepts available in base pool!"); }

        while (cardOptions.length < numCardChoices && attempts < numCardChoices * 5 && baseCardPool.length > 0) {
            attempts++; let chosenConcept = null; const rand = Math.random();
            if (topElement && rand < topElemChance) { const topPool = baseCardPool.filter(c => c.primaryElement === topElement && !generatedCardIds.has(c.id)); if (topPool.length > 0) chosenConcept = topPool[Math.floor(Math.random() * topPool.length)]; }
            if (!chosenConcept && secondElement && rand >= topElemChance && rand < topElemChance + secondElemChance) { const secondPool = baseCardPool.filter(c => c.primaryElement === secondElement && !generatedCardIds.has(c.id)); if (secondPool.length > 0) chosenConcept = secondPool[Math.floor(Math.random() * secondPool.length)]; }
            if (!chosenConcept) { const randomPool = baseCardPool.filter(c => !generatedCardIds.has(c.id)); if (randomPool.length > 0) chosenConcept = randomPool[Math.floor(Math.random() * randomPool.length)]; }
            if (chosenConcept && !generatedCardIds.has(chosenConcept.id)) { generatedCardIds.add(chosenConcept.id); cardOptions.push(chosenConcept.id); }
            else if (chosenConcept) { /* Skipped duplicate */ }
        }
         if (cardOptions.length < numCardChoices) console.warn(`Shop Generation: Only generated ${cardOptions.length}/${numCardChoices} unique card options.`);
        // --- End Adaptive Card Selection ---

        // --- Artifact Selection Logic ---
        const artifactOptions = []; const numArtifactChoices = 1 + (this.metaProgression.getStartingBonus('shopArtifactChoicesBonus') || 0); const generatedArtifactIds = new Set(); const ownedArtifactIds = new Set(this.player.artifacts.map(a => a.id)); attempts = 0;
        let baseArtifactPool = Object.keys(ARTIFACT_TEMPLATES) .filter(id => this.metaProgression.isArtifactUnlocked(id) && ARTIFACT_TEMPLATES[id].rarity !== 'boss' && ARTIFACT_TEMPLATES[id].id !== 'error_artifact' && !ownedArtifactIds.has(id) );
        while (artifactOptions.length < numArtifactChoices && attempts < numArtifactChoices * 10 && baseArtifactPool.length > 0) {
            attempts++; const randomIndex = Math.floor(Math.random() * baseArtifactPool.length); const artifactId = baseArtifactPool[randomIndex];
            if (artifactId && !generatedArtifactIds.has(artifactId)) { generatedArtifactIds.add(artifactId); artifactOptions.push(artifactId); baseArtifactPool.splice(randomIndex, 1); }
            else if (artifactId) { /* Skip duplicate */ } else { console.warn("Artifact selection: Random index issue?"); break; }
        }
         if (artifactOptions.length < numArtifactChoices) console.warn(`Shop Generation: Only generated ${artifactOptions.length}/${numArtifactChoices} unique artifact options.`);
        // --- End Artifact Selection ---

        // Calculate Removal Cost
        const baseRemovalCost = 75; const removalCostIncrease = this.metaProgression.getStartingBonus('shopRemovalCostIncrease') || 0; const removalCost = Math.max(10, baseRemovalCost + removalCostIncrease);
        // Construct inventory object
        return { cards: cardOptions.map(id => ({ cardId: id, cost: this.getCardCost(id), purchased: false })), artifacts: artifactOptions.map(id => ({ artifactId: id, cost: this.getArtifactCost(id), purchased: false })), removalAvailable: true, removalCost: removalCost };
    }

    /** Calculates the cost of a card in the shop. */
    getCardCost(cardId) {
         const concept = Data.concepts?.find(c => c.id === cardId); if (!concept) return 999; let baseCost = 50; if (concept.rarity === 'uncommon') baseCost = 80; else if (concept.rarity === 'rare') baseCost = 140; return Math.max(10, Math.round(baseCost));
    }
    /** Calculates the cost of an artifact in the shop. */
    getArtifactCost(artifactId) {
          const template = ARTIFACT_TEMPLATES ? ARTIFACT_TEMPLATES[artifactId] : null; if (!template) return 999; let baseCost = 120; if (template.rarity === 'uncommon') baseCost = 175; else if (template.rarity === 'rare') baseCost = 250; else if (template.rarity === 'boss') baseCost = 400; return Math.max(25, Math.round(baseCost));
     }
    /** Handles a purchase attempt in the shop. */
    handleShopPurchase(itemType, itemId) {
        if (!this.currentShop || !this.player || !this.uiManager || !this.metaProgression) { console.error("Cannot handle shop purchase: Missing state."); return; }
        let itemCost = 0; let purchasedItem = null; let purchaseSuccessful = false;
        if (itemType === 'card') { const item = this.currentShop.cards.find(i => i.cardId === itemId && !i.purchased); if (!item) { console.warn("Shop card not found or already purchased."); this.uiManager.showActionFeedback("Item unavailable", "warning"); return; } if (this.player.insightThisRun >= item.cost) { itemCost = item.cost; if(this.player.addCardToDeck(item.cardId)){ item.purchased = true; purchasedItem = item; purchaseSuccessful = true; } else { console.error("Failed to add purchased card to deck."); this.uiManager.showActionFeedback("Error adding card!", "error"); return; } } else { this.uiManager.showActionFeedback("Not enough Insight!", "warning"); return; } }
        else if (itemType === 'artifact') { const item = this.currentShop.artifacts.find(i => i.artifactId === itemId && !i.purchased); if (!item) { console.warn("Shop artifact not found or already purchased."); this.uiManager.showActionFeedback("Item unavailable", "warning"); return; } if (this.player.artifacts.some(a => a.id === item.artifactId)) { console.warn("Player already has this artifact."); this.uiManager.showActionFeedback("Relic already owned!", "info"); item.purchased = true; this.uiManager.renderShop(this.currentShop, this.player.insightThisRun); return; } if (this.player.insightThisRun >= item.cost) { itemCost = item.cost; this.player.addArtifact(item.artifactId); item.purchased = true; purchasedItem = item; purchaseSuccessful = true; } else { this.uiManager.showActionFeedback("Not enough Insight!", "warning"); return; } }
        else if (itemType === 'remove') { const removalCost = this.currentShop.removalCost; if (!this.currentShop.removalAvailable) { this.uiManager.showActionFeedback("Removal service used.", "info"); return; } if (this.player.insightThisRun < removalCost) { this.uiManager.showActionFeedback("Not enough Insight!", "warning"); return; } if (this.player.deckManager.masterDeck.length <= 5) { this.uiManager.showActionFeedback("Deck too small!", "warning"); return; } this.uiManager.showCardSelectionModal( this.player.deckManager.getMasterDeck(), (selectedCard) => { if (selectedCard) { if (this.player.removeCardFromDeck(selectedCard)) { this.player.insightThisRun -= removalCost; this.currentShop.removalAvailable = false; this.triggerMilestoneAction('removeCard'); this.triggerMilestoneAction('buyAnyShopItem'); this.uiManager?.renderShop(this.currentShop, this.player.insightThisRun); this.uiManager.showNotification(`Removed: ${selectedCard.name}`); } else { this.uiManager.showActionFeedback("Removal failed.", "error"); this.uiManager?.renderShop(this.currentShop, this.player.insightThisRun); } } else { console.log("Card removal cancelled."); } }, `Choose Concept to Remove (${removalCost} Insight)` ); return; }
        if (purchaseSuccessful && purchasedItem) { this.player.insightThisRun -= itemCost; console.log(`Purchased ${itemType} ${itemId} for ${itemCost}. Insight remaining: ${this.player.insightThisRun}`); this.triggerMilestoneAction(`buy${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`); this.triggerMilestoneAction('buyAnyShopItem'); this.uiManager.renderShop(this.currentShop, this.player.insightThisRun); this.uiManager.updatePlayerMapInfo(this.player, this.currentFloor); }
     }
    /** Leaves the shop node. */
    leaveShop() {
         const nodeId = this.mapManager?.currentNodeId; console.log("Leaving shop."); this.currentShop = null; this.completeNode(nodeId); this.uiManager?.showScreen('mapScreen'); this.mapManager?.renderMap();
      }

    /** Enters the rest site node. */
    enterRestSite() {
         if (!this.player || !this.uiManager) { console.error("Cannot enter rest site: Player or UIManager missing."); this.completeNode(this.mapManager?.currentNodeId, { error: "Rest site failed" }); this.uiManager?.showScreen('mapScreen'); return; } this.currentRestSite = { usedOption: false }; this.uiManager.showScreen('restSiteScreen'); this.uiManager.renderRestSite(this.currentRestSite, this.player);
    }
    /** Handles actions taken at the rest site. */
    handleRestSiteAction(action) {
        if (!this.currentRestSite || !this.player || !this.uiManager || !this.metaProgression) { console.error("Cannot handle rest site action: Missing state."); return; } if (this.currentRestSite.usedOption) { this.uiManager.showActionFeedback("Already rested.", "info"); return; } let actionTakenImmediately = false;
        switch (action) {
             case 'heal': const healAmount = Math.floor(this.player.maxIntegrity * 0.3); if (this.player.currentIntegrity >= this.player.maxIntegrity) { this.uiManager.showActionFeedback("Integrity full!", "info"); return; } const actualHeal = this.player.heal(healAmount); this.player.triggerArtifacts('onRestSiteHeal', { baseHeal: actualHeal }); this.currentRestSite.usedOption = true; actionTakenImmediately = true; this.triggerMilestoneAction('restHeal'); this.triggerMilestoneAction('useAnyRestAction'); this.uiManager.showNotification(`Restored ${actualHeal} Integrity.`); break;
             case 'upgrade': const upgradableCards = this.player.deckManager.getMasterDeck().filter(c => c && !c.upgraded); if (upgradableCards.length === 0) { this.uiManager.showActionFeedback("No concepts to upgrade!", "info"); return; } this.uiManager.showCardUpgradeModal(upgradableCards, (chosenCard, chosenBranch) => { this.handleRestSiteUpgradeChoice(chosenCard, chosenBranch); }); break;
             case 'remove': const removableCards = this.player.deckManager.getMasterDeck(); if (removableCards.length <= 5) { this.uiManager.showActionFeedback("Deck too small!", "warning"); return; } this.uiManager.showCardSelectionModal( removableCards, (selectedCard) => { if (selectedCard) { const removedCardCopy = { name: selectedCard.name, id: selectedCard.id }; if (this.player.removeCardFromDeck(selectedCard)) { this.currentRestSite.usedOption = true; this.triggerMilestoneAction('restRemove'); this.triggerMilestoneAction('removeCard'); this.triggerMilestoneAction('useAnyRestAction'); this.uiManager.showNotification(`Removed: ${removedCardCopy.name}.`); this.leaveRestSite(); } else { this.uiManager.showActionFeedback("Removal failed.", "error"); this.leaveRestSite(); } } else { console.log("Card removal cancelled."); this.uiManager.renderRestSite(this.currentRestSite, this.player); } }, "Let Go (Remove Concept)" ); break;
             default: console.warn("Unknown rest action:", action); return;
        }
        if (actionTakenImmediately) { this.leaveRestSite(); }
     }
    /** Handles the choice made in the upgrade modal at a rest site. */
    handleRestSiteUpgradeChoice(cardToUpgrade, branch) {
        if (!this.currentRestSite || this.currentRestSite.usedOption || !branch || !cardToUpgrade) { console.warn("Invalid upgrade choice received or rest site already used."); this.uiManager.renderRestSite(this.currentRestSite || { usedOption: false }, this.player); return; } const cardInstanceInDeck = this.player?.deckManager?.masterDeck.find(c => c.id === cardToUpgrade.id); if (!cardInstanceInDeck) { console.error("Card selected for upgrade not found in master deck!"); this.uiManager.showActionFeedback("Error finding card to upgrade.", "error"); this.leaveRestSite(); return; } if (cardInstanceInDeck.upgraded) { console.warn("Attempted to upgrade an already upgraded card:", cardInstanceInDeck.name); this.uiManager.showActionFeedback("Card already upgraded.", "info"); this.leaveRestSite(); return; } console.log(`Attempting to upgrade ${cardInstanceInDeck.name} via ${branch}`); if (this.player.upgradeCard(cardInstanceInDeck, branch)) { this.currentRestSite.usedOption = true; this.triggerMilestoneAction('restUpgrade'); this.triggerMilestoneAction('useAnyRestAction'); this.uiManager.showNotification(`Upgraded: ${cardInstanceInDeck.name}.`); this.leaveRestSite(); } else { this.uiManager.showActionFeedback("Upgrade failed.", "error"); this.leaveRestSite(); }
     }
    /** Leaves the rest site node. */
    leaveRestSite() {
         const nodeId = this.mapManager?.currentNodeId; console.log("Leaving rest site."); this.currentRestSite = null; this.completeNode(nodeId); this.uiManager?.showScreen('mapScreen'); this.mapManager?.renderMap();
      }

    /** Marks a node as completed and updates UI. */
    completeNode(nodeId, options = {}) {
        console.log(`GameState: Completing node ${nodeId}`, options); const node = this.mapManager?.nodes[nodeId]; if(node) { node.visited = true; } else { console.warn(`Node ${nodeId} not found in MapManager when completing.`); } if(this.player && node) { this.player.triggerArtifacts('onNodeComplete', { nodeType: node.type, floor: this.currentFloor }); } this.uiManager?.updatePlayerMapInfo(this.player, this.currentFloor);
    }

    /** Advances the player to the next floor. */
    advanceFloor() {
        if (!this.runActive || !this.player || !this.mapManager || !this.uiManager) { console.error("Cannot advance floor: Invalid state."); return; } const oldFloor = this.currentFloor; console.log(`GameState: Advancing from floor ${oldFloor}...`); this.currentFloor++; const MAX_FLOORS = 3; if (this.currentFloor > MAX_FLOORS) { console.log("Maximum floor reached. Ending run with victory."); this.endRun(true); return; } this.triggerMilestoneAction('reachFloor', 1, { value: this.currentFloor }); this.player.triggerArtifacts('onFloorStart', { floor: this.currentFloor }); const healPercent = 0.15; const healAmount = Math.floor(this.player.maxIntegrity * healPercent); const actualHeal = this.player.heal(healAmount); if (actualHeal > 0) { this.uiManager.showNotification(`Reached Floor ${this.currentFloor}. Healed ${actualHeal} Integrity.`); } else { this.uiManager.showNotification(`Reached Floor ${this.currentFloor}.`); } this.mapManager.generateFloor(this.currentFloor); this.uiManager.showScreen('mapScreen'); this.uiManager.updatePlayerMapInfo(this.player, this.currentFloor);
     }

     // --- Reward Generation Helpers ---
    generateCardReward(player, allowRare = false, numChoices = 3, allowCommon = false, specificPoolIds = null) {
        if (!player || !this.metaProgression || !Data?.concepts) { console.error("Cannot generate card reward: Missing Player, MetaProgression, or Concept data."); return []; } let basePool = Data.concepts.filter(concept => concept && this.metaProgression.isConceptUnlocked(concept.id) && (allowCommon || concept.rarity !== 'common') && (allowRare || concept.rarity !== 'rare') && !['Status', 'Curse', 'starter'].includes(concept.rarity) && (!specificPoolIds || specificPoolIds.includes(concept.id)) ); if (basePool.length === 0) { console.warn("No available concepts for card reward generation after filtering."); if (!allowCommon && specificPoolIds === null) { console.log("Falling back to include common concepts for reward."); basePool = Data.concepts.filter(c => c && this.metaProgression.isConceptUnlocked(c.id) && !['Status', 'Curse', 'starter'].includes(c.rarity)); } if (basePool.length === 0) return []; }
        const weightedPool = basePool.map(concept => { let resonanceScore = 1.0; const cardScores = concept.elementScores || {}; const playerAttunements = player.attunements || {}; for (const elem in playerAttunements) { if (playerAttunements.hasOwnProperty(elem) && cardScores.hasOwnProperty(elem)) { resonanceScore += (playerAttunements[elem] / 5) * (cardScores[elem] / 5); } } if (concept.primaryElement && playerAttunements[concept.primaryElement]) { resonanceScore += (playerAttunements[concept.primaryElement] / 5) * 1.5; } const weight = Math.max(1, resonanceScore); return { concept, weight }; }).filter(item => item.weight > 0);
        if (weightedPool.length === 0) { console.warn("Card reward pool has zero total weight after resonance calculation. Using fallback shuffle."); basePool = basePool.filter(c => !['Status', 'Curse', 'starter'].includes(c.rarity)); this._fallbackShuffle(basePool); return basePool.slice(0, numChoices).map(c => c.id); }
        const choices = []; const chosenIds = new Set(); let totalWeight = weightedPool.reduce((sum, item) => sum + item.weight, 0); let attempts = 0;
        while (choices.length < numChoices && weightedPool.length > 0 && attempts < numChoices * 5) { if (totalWeight <= 0) { console.warn("Total weight became zero during selection."); break; } let randomNum = Math.random() * totalWeight; let chosenItem = null; let chosenIndex = -1; for(let j=0; j < weightedPool.length; j++) { randomNum -= weightedPool[j].weight; if (randomNum <= 0) { chosenItem = weightedPool[j]; chosenIndex = j; break; } } if (chosenItem && !chosenIds.has(chosenItem.concept.id)) { choices.push(chosenItem.concept.id); chosenIds.add(chosenItem.concept.id); totalWeight -= chosenItem.weight; weightedPool.splice(chosenIndex, 1); } else if (chosenItem) { totalWeight -= chosenItem.weight; weightedPool.splice(chosenIndex, 1); } else { console.warn("Weighted selection failed to pick an item."); break; } attempts++; }
        if (choices.length < numChoices) { console.log(`Filling remaining ${numChoices - choices.length} card reward slots randomly.`); const remainingPool = basePool.filter(c => !chosenIds.has(c.id)); this._fallbackShuffle(remainingPool); for (let i = 0; i < remainingPool.length && choices.length < numChoices; i++) { choices.push(remainingPool[i].id); } } return choices;
    }
    generateArtifactReward(guaranteeRareOrBetter = false) {
        if (!this.player || !this.metaProgression || !ARTIFACT_TEMPLATES) { console.error("Cannot generate artifact reward: Missing Player, MetaProgression, or Artifact data."); return null; } const ownedArtifactIds = new Set(this.player.artifacts.map(a => a.id)); let availableArtifactPool = Object.keys(ARTIFACT_TEMPLATES) .filter(id => this.metaProgression.isArtifactUnlocked(id) && ARTIFACT_TEMPLATES[id].rarity !== 'boss' && ARTIFACT_TEMPLATES[id].id !== 'error_artifact' && !ownedArtifactIds.has(id) ); if (availableArtifactPool.length === 0) { console.warn("No available artifacts for reward generation."); return null; } if (guaranteeRareOrBetter) { const rareOrBetterPool = availableArtifactPool.filter(id => ['uncommon', 'rare'].includes(ARTIFACT_TEMPLATES[id]?.rarity)); if (rareOrBetterPool.length > 0) { availableArtifactPool = rareOrBetterPool; } else { console.log("Could not guarantee rare+ artifact, falling back to any available."); } } this._fallbackShuffle(availableArtifactPool); return availableArtifactPool[0];
    }
    _fallbackShuffle(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; }

    // --- Milestone Trigger Helper ---
    triggerMilestoneAction(actionName, value = 1, context = null) { if (!this.metaProgression) { console.warn("Cannot trigger milestone action: MetaProgression reference missing."); return; } this.metaProgression.updateMilestoneProgress(actionName, value, context); }
    getPlayerStateForMilestones() { if (!this.player) return null; return { maxFocus: this.player.maxFocus, maxIntegrity: this.player.maxIntegrity, attunements: { ...this.player.attunements } }; }

    // --- Utility ---
    getCurrentNode() { return this.mapManager?.getCurrentNode(); }
    addStatusCardToPlayerDeck(statusCardConceptId, destination = 'discard') { if (!this.player || !this.player.deckManager || !this.uiManager) { console.error("Cannot add status card: Missing Player, DeckManager, or UIManager."); return; } const concept = Data.concepts?.find(c => c.id === statusCardConceptId); if (!concept || (concept.cardType !== 'Status' && concept.cardType !== 'Curse')) { console.warn(`Attempted to add invalid status/curse card: ID ${statusCardConceptId}`); return; } console.log(`Adding ${concept.cardType} card '${concept.name}' (${statusCardConceptId}) to ${destination} pile.`); let newCardInstance; try { newCardInstance = new Card(statusCardConceptId); if (newCardInstance.conceptId === -1) throw new Error("Card creation failed."); } catch (error) { console.error(`Failed to create status/curse card instance ${statusCardConceptId}:`, error); return; } if (destination === 'draw') { this.player.deckManager.drawPile.unshift(newCardInstance); } else if (destination === 'hand') { if (this.player.deckManager.hand.length < this.player.deckManager.maxHandSize) { this.player.deckManager.hand.push(newCardInstance); this.uiManager.combatUI?.renderHand(this.player.deckManager.hand, this.combatManager?.playerTurn); } else { this.player.deckManager.discardPile.push(newCardInstance); this.uiManager.showActionFeedback("Hand full! Status card added to Discard.", "info"); destination = 'discard'; } } else { this.player.deckManager.discardPile.push(newCardInstance); } this.uiManager.updateDeckDiscardCounts(this.player.deckManager); this.player.triggerArtifacts('onStatusCardAdded', { card: newCardInstance, destination: destination }); }

} // End of GameState class
