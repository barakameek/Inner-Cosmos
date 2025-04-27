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
    constructor(playerData = null, metaProgression = null, uiManager = null) {
        console.log("Initializing GameState for a new run...");
        this.player = null;
        this.mapManager = null;
        this.combatManager = null;
        this.uiManager = uiManager;
        this.metaProgression = metaProgression;
        this.currentFloor = 0;
        this.currentRunSeed = Date.now();
        this.runActive = false;
        this.currentEvent = null;
        this.currentShop = null;
        this.currentRestSite = null;
        console.log(`GameState created with seed: ${this.currentRunSeed}`);
    }

    /** Starts a new game run. */
    startRun(playerData, metaProgression, uiManager) {
        console.log("GameState: Starting new run...");
        if (this.runActive) { console.warn("GameState: Cannot start a new run while one is active."); return; }
        this.uiManager = uiManager || this.uiManager;
        this.metaProgression = metaProgression || this.metaProgression;
        if (!this.uiManager || !this.metaProgression) { console.error("GameState FATAL: Missing UIManager or MetaProgression reference."); alert("Critical Error: Cannot start run."); return; }

        this.runActive = true;
        this.currentFloor = 1;

        this.player = new Player(playerData, this.metaProgression);
        this.player.setGameState(this); // Link player back to state
        this.player.deckManager.setPlayerReference(this.player); // Link player to deck manager

        this.mapManager = new MapManager(this, this.uiManager);
        this.mapManager.generateFloor(this.currentFloor); // Includes initial render

        this.combatManager = new CombatManager(this, this.uiManager);

        console.log("Run Started. Player at node:", this.mapManager.currentNodeId);
        this.uiManager?.updatePlayerMapInfo(this.player, this.currentFloor);
        this.uiManager?.showScreen('mapScreen');

        // Trigger start run milestone
        this.triggerMilestoneAction('startRun');
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
            alert(`Run Ended. Victory: ${victory}. Insight: ${runInsight}. Total Insight: ${this.metaProgression?.totalInsight || 0}.`); this.cleanupRun(); document.getElementById('mainMenuScreen')?.classList.add('active');
        }
    }

    /** Cleans up volatile run state. */
    cleanupRun() {
        console.log("Cleaning up run state...");
        this.player = null; this.mapManager = null; this.combatManager = null;
        this.currentEvent = null; this.currentShop = null; this.currentRestSite = null;
        this.runActive = false;
    }

    /** Handles logic when the player enters a map node. */
    handleNodeEntry(node) {
        if (!node || !this.runActive || !this.player) { console.warn("Cannot handle node entry: Invalid state."); this.uiManager?.showScreen('mapScreen'); this.mapManager?.renderMap(); return; };
        console.log(`GameState: Entering node ${node.id} (Type: ${node.type}, Floor: ${this.currentFloor})`);
        switch (node.type) {
            case 'combat': case 'elite': case 'boss':
                if (node.data.enemies && node.data.enemies.length > 0) { this.enterCombat(node.data.enemies); }
                else { console.warn(`Node ${node.id} (${node.type}) has no enemy data! Completing node.`); this.completeNode(node.id, { warning: "Missing enemy data" }); this.uiManager?.showScreen('mapScreen'); this.mapManager?.renderMap(); } break;
            case 'event':
                 if (node.data.eventId) { this.triggerEvent(node.data.eventId); }
                 else { console.warn(`Node ${node.id} (event) has no event ID! Completing node.`); this.completeNode(node.id, { warning: "Missing event ID" }); this.uiManager?.showScreen('mapScreen'); this.mapManager?.renderMap(); } break;
            case 'shop': this.enterShop(); break;
            case 'rest': this.enterRestSite(); break;
            case 'start': console.log("At start node."); this.completeNode(node.id); this.mapManager?.renderMap(); break;
            default: console.warn(`Unknown node type: ${node.type}. Completing node.`); this.completeNode(node.id, { warning: `Unknown node type: ${node.type}` }); this.uiManager?.showScreen('mapScreen'); this.mapManager?.renderMap();
        }
    }

    /** Initiates combat. */
    enterCombat(enemyList) {
        if (!this.combatManager) { console.error("Cannot enter combat: CombatManager missing!"); this.completeNode(this.mapManager?.currentNodeId, { error: "Combat failed (manager missing)" }); this.uiManager?.showScreen('mapScreen'); return; }
        if (this.combatManager.isActive) { console.warn("Cannot enter combat: Already active."); return; }
        this.combatManager.startCombat(enemyList); // Handles UI change
    }

    /** Handles the outcome of combat. */
     handleCombatEnd(victory) {
        if (!this.runActive || !this.player) return;
        console.log(`GameState: Handling combat end. Victory: ${victory}`);
        this.player.cleanupCombatStatuses(); // Cleanup player first
        const currentNode = this.mapManager?.getCurrentNode();
        const nodeType = currentNode?.type;

        if (!victory) { this.endRun(false); return; } // Defeat ends run

        // Trigger Victory Milestones
        this.triggerMilestoneAction(`victory_${nodeType || 'combat'}`);
        if (nodeType === 'combat') this.triggerMilestoneAction('winCombat');
        else if (nodeType === 'elite') this.triggerMilestoneAction('winElite');
        else if (nodeType === 'boss') this.triggerMilestoneAction('winBoss');
        // Flawless/Debuff milestones need checks inside CombatManager during combat end

        // Generate Rewards
        let insightReward = 0; let cardChoices = []; let artifactChoices = [];
        console.log(`Generating rewards for beating ${nodeType} node...`);
        try {
            const baseInsight = { combat: 10, elite: 25, boss: 75 };
            insightReward = Math.floor((baseInsight[nodeType] || 5) * (1 + Math.random() * 0.5));
            if (nodeType === 'combat' && Math.random() < 0.75) cardChoices = this.generateCardReward(this.player, false, 3, true);
            else if (nodeType === 'elite') cardChoices = this.generateCardReward(this.player, true, 3, true);
            else if (nodeType === 'boss') cardChoices = this.generateCardReward(this.player, true, 3, false);
            if (nodeType === 'elite' && Math.random() < 0.6) { const art = this.generateArtifactReward(false); if (art) artifactChoices.push(art); }
            else if (nodeType === 'boss') { const art = this.generateArtifactReward(true); if (art) artifactChoices.push(art); }
            // Handle Boss specific onDeathAction reward
            if (nodeType === 'boss') {
                const bossEnemyId = currentNode?.data?.enemies[0]; const bossTemplate = ENEMY_TEMPLATES[bossEnemyId];
                 if (bossTemplate?.onDeathAction?.type === 'reward') {
                     if (bossTemplate.onDeathAction.insight) insightReward += bossTemplate.onDeathAction.insight;
                     if (bossTemplate.onDeathAction.artifactId && this.metaProgression?.isArtifactUnlocked(bossTemplate.onDeathAction.artifactId)) {
                          if (!artifactChoices.includes(bossTemplate.onDeathAction.artifactId)) { artifactChoices.push(bossTemplate.onDeathAction.artifactId); }
                     } else if (bossTemplate.onDeathAction.artifactId) { console.log(`Boss drop artifact ${bossTemplate.onDeathAction.artifactId} not unlocked.`); }
                 }
            }
             if (insightReward > 0) { this.player.insightThisRun += insightReward; console.log(`Awarded ${insightReward} insight.`); this.metaProgression?.checkStateBasedMilestones(this); }
        } catch (error) { console.error("Error generating combat rewards:", error); if (insightReward === 0 && this.player) this.player.insightThisRun += 5; }

        // Show Reward Screen
        if (this.uiManager) { this.uiManager.showRewardScreen({ insight: insightReward, cardChoices: cardChoices || [], artifactChoices: artifactChoices || [], onComplete: () => { console.log("Reward screen completed."); this.completeNode(currentNode?.id); if (nodeType === 'boss') { this.advanceFloor(); } else { this.uiManager.showScreen('mapScreen'); this.mapManager?.renderMap(); } } }); }
        else { console.error("UIManager missing!"); this.completeNode(currentNode?.id); if (nodeType === 'boss') this.advanceFloor(); }
     }

    /** Triggers a specific event or dilemma. */
     triggerEvent(eventId) {
         console.log(`GameState: Triggering event/dilemma ${eventId}`);
         if (!Data || !this.uiManager || !this.player) { console.error("Cannot trigger event: Missing components."); this.completeNode(this.mapManager?.currentNodeId, { error: "Event trigger failed" }); this.uiManager?.showScreen('mapScreen'); return; }
         let eventData = null; let eventType = 'unknown'; let sourceKey = null;
         // Find Event Data
         for (const key in Data.reflectionPrompts) { const source = Data.reflectionPrompts[key]; if (Array.isArray(source)) { const found = source.find(p => p.id === eventId); if (found) { eventData = found; eventType = 'reflection'; sourceKey = key; break; } } else if (typeof source === 'object' && source !== null) { if (source[eventId]) { eventData = source[eventId]; eventType = 'reflection'; sourceKey = key; break; } for (const subKey in source) { if(Array.isArray(source[subKey])) { const found = source[subKey].find(p => p.id === eventId); if (found) { eventData = found; eventType = 'reflection'; sourceKey = key; break; } } } } if (eventData) break; }
         if (!eventData) { const foundDilemma = Data.elementalDilemmas.find(d => d.id === eventId); if (foundDilemma) { eventData = foundDilemma; eventType = 'dilemma'; } }

         const currentNodeId = this.mapManager?.currentNodeId;
         if (eventData) {
             if (eventType === 'reflection') {
                let rewardText = ""; const insightGain = 5; this.player.insightThisRun += insightGain; rewardText = `<br><br><i>(+${insightGain} <i class='fas fa-brain insight-icon'></i> Insight)</i>`;
                this.triggerMilestoneAction('completeReflection', 1, { eventId: eventId });
                 if (sourceKey === 'Dissonance') this.triggerMilestoneAction('completeReflectionDissonance', 1);
                 this.uiManager.showModal(eventData.text + rewardText, [{ text: 'Ponder...', callback: () => { this.completeNode(currentNodeId); this.uiManager.showScreen('mapScreen'); this.mapManager?.renderMap(); }}]);
             } else if (eventType === 'dilemma') {
                  this.triggerMilestoneAction('encounterDilemma', 1);
                  this.uiManager.showModal( `<strong>Dilemma:</strong> ${eventData.situation}<hr>${eventData.question}`, [ { text: eventData.sliderMinLabel || 'Choice 1', callback: () => this.resolveDilemma(eventId, 'min', currentNodeId, eventData) }, { text: eventData.sliderMaxLabel || 'Choice 2', callback: () => this.resolveDilemma(eventId, 'max', currentNodeId, eventData) } ]);
             } else { console.warn(`Event ${eventId} type unknown: ${eventType}`); this.completeNode(currentNodeId, { warning: `Unknown event type: ${eventType}` }); this.uiManager?.showScreen('mapScreen'); this.mapManager?.renderMap(); }
         } else { console.error(`Event/Dilemma ID ${eventId} not found!`); this.completeNode(currentNodeId, { error: "Event data not found" }); this.uiManager?.showScreen('mapScreen'); this.mapManager?.renderMap(); }
     }

    /** Resolves the outcome of a dilemma choice, potentially offering specific rewards. */
     resolveDilemma(dilemmaId, choice, nodeIdToComplete, dilemmaData) {
         console.log(`Resolving dilemma ${dilemmaId} with choice: ${choice}`);
         if (!dilemmaData || !this.player || !this.uiManager || !this.metaProgression) { console.error("Cannot resolve dilemma: Missing components."); this.completeNode(nodeIdToComplete); this.uiManager.showScreen('mapScreen'); this.mapManager?.renderMap(); return; }

         let insightGain = 10; this.player.insightThisRun += insightGain;
         this.triggerMilestoneAction('resolveDilemma', 1, { dilemmaId: dilemmaId, choice: choice });
         const chosenElement = (choice === 'min') ? dilemmaData.elementKeyMin : dilemmaData.elementKeyMax;
         let outcomeText = `Leaned towards ${chosenElement}. Gained ${insightGain} <i class='fas fa-brain insight-icon'></i> Insight.`;
         let cardRewardText = "";
         let specificCardRewardId = null;
         const rewardPoolKey = (choice === 'min') ? dilemmaData.rewardPoolKeyMin : dilemmaData.rewardPoolKeyMax;
         if (choice === 'min' && dilemmaData.rewardConceptIdMin) specificCardRewardId = dilemmaData.rewardConceptIdMin;
         else if (choice === 'max' && dilemmaData.rewardConceptIdMax) specificCardRewardId = dilemmaData.rewardConceptIdMax;

         if (specificCardRewardId && this.metaProgression.isConceptUnlocked(specificCardRewardId)) {
             const addedCard = this.player.addCardToDeck(specificCardRewardId);
             if(addedCard) { cardRewardText = `<br>Gained Concept: ${addedCard.name}`; this.triggerMilestoneAction('gainCardFromEvent'); }
             else { cardRewardText = "<br>A concept resonated, but couldn't be grasped."; }
         } else if (rewardPoolKey && Data.cardPools?.[rewardPoolKey]) {
              const poolChoices = this.generateCardReward(this.player, true, 1, true, Data.cardPools[rewardPoolKey]);
              if (poolChoices.length > 0) { const addedCard = this.player.addCardToDeck(poolChoices[0]); if(addedCard) { cardRewardText = `<br>Gained Concept: ${addedCard.name}`; this.triggerMilestoneAction('gainCardFromEvent'); } else { cardRewardText = "<br>A concept resonated, but couldn't be grasped."; } }
              else { cardRewardText = "<br>No relevant concept resonated from this pool."; }
         } else {
             const potentialCard = Data.concepts?.find(c => c.primaryElement === chosenElement && c.rarity === 'common' && this.metaProgression.isConceptUnlocked(c.id));
             if (potentialCard) { const addedCard = this.player.addCardToDeck(potentialCard.id); if(addedCard) { cardRewardText = `<br>Gained Concept: ${addedCard.name}`; this.triggerMilestoneAction('gainCardFromEvent'); } else { cardRewardText = "<br>A concept resonated, but couldn't be grasped."; } }
             else { cardRewardText = "<br>No relevant common concept resonated."; }
         }

         this.uiManager.showModal(outcomeText + cardRewardText, [{ text: 'Continue', callback: () => { this.completeNode(nodeIdToComplete); this.uiManager.showScreen('mapScreen'); this.mapManager?.renderMap(); }}]);
     }

    /** Enters the shop node. */
    enterShop() {
        if (!this.player || !this.uiManager) { console.error("Cannot enter shop."); this.completeNode(this.mapManager?.currentNodeId, { error: "Shop entry failed" }); this.uiManager?.showScreen('mapScreen'); return; }
        try { const shopInventory = this.generateShopInventory(); this.currentShop = shopInventory; this.uiManager.showScreen('shopScreen'); this.uiManager.renderShop(shopInventory, this.player.insightThisRun); }
        catch (error) { console.error("Error generating/rendering shop:", error); this.completeNode(this.mapManager?.currentNodeId, { error: "Shop generation failed" }); this.uiManager?.showScreen('mapScreen'); }
    }

    /** Generates the inventory for the shop. */
    generateShopInventory() {
        if (!this.player || !this.metaProgression || !Data?.concepts || !ARTIFACT_TEMPLATES) throw new Error("Missing data for shop generation.");
        const cardOptions = []; const numCardChoices = 3 + (this.metaProgression.getStartingBonus('cardRewardChoicesBonus') || 0); const generatedCardIds = new Set();
        for (let i = 0; i < numCardChoices && generatedCardIds.size < 10; i++) { const allowRareShop = this.currentFloor > 1 && Math.random() < 0.25; const cardChoices = this.generateCardReward(this.player, allowRareShop, 1, true); if (cardChoices?.length > 0 && !generatedCardIds.has(cardChoices[0])) { generatedCardIds.add(cardChoices[0]); cardOptions.push(cardChoices[0]); } else { i--; } }
        const artifactOptions = []; const numArtifactChoices = 1 + (this.metaProgression.getStartingBonus('shopArtifactChoicesBonus') || 0); const generatedArtifactIds = new Set();
        for (let i = 0; i < numArtifactChoices && generatedArtifactIds.size < 5; i++) { const allowRareArtifact = this.currentFloor > 1 && Math.random() < 0.35; const artifactId = this.generateArtifactReward(allowRareArtifact); if (artifactId && !generatedArtifactIds.has(artifactId)) { generatedArtifactIds.add(artifactId); artifactOptions.push(artifactId); } else if (artifactId) { i--; } }
        const baseRemovalCost = 75; const removalCost = baseRemovalCost + (this.metaProgression.getStartingBonus('shopRemovalCostIncrease') || 0);
        return { cards: cardOptions.map(id => ({ cardId: id, cost: this.getCardCost(id), purchased: false })), artifacts: artifactOptions.map(id => ({ artifactId: id, cost: this.getArtifactCost(id), purchased: false })), removalAvailable: true, removalCost: Math.max(10, removalCost) };
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
         if (!this.currentShop || !this.player || !this.uiManager || !this.metaProgression) return;
         let itemCost = 0; let purchasedItem = null;

         if (itemType === 'card') {
             const item = this.currentShop.cards.find(i => i.cardId === itemId && !i.purchased);
             if (item && this.player.insightThisRun >= item.cost) {
                 itemCost = item.cost;
                 if(this.player.addCardToDeck(item.cardId)){ // Player method handles triggers
                     item.purchased = true; purchasedItem = item;
                     this.player.insightThisRun -= itemCost;
                     this.triggerMilestoneAction('buyCard');
                     this.triggerMilestoneAction('buyAnyShopItem');
                 } else { console.error("Failed add card"); this.uiManager.showActionFeedback("Error adding card!", "error"); return; }
             } else if (!item) { console.warn("Shop card not found/purchased."); return; }
             else { this.uiManager.showActionFeedback("Not enough Insight!", "warning"); return; }
         }
         else if (itemType === 'artifact') {
             const item = this.currentShop.artifacts.find(i => i.artifactId === itemId && !i.purchased);
             if (item && this.player.insightThisRun >= item.cost) {
                 itemCost = item.cost;
                 this.player.addArtifact(item.artifactId); // Player method handles triggers
                 item.purchased = true; purchasedItem = item;
                 this.player.insightThisRun -= itemCost;
                 this.triggerMilestoneAction('buyArtifact');
                 this.triggerMilestoneAction('buyAnyShopItem');
             } else if (!item) { console.warn("Shop artifact not found/purchased."); return; }
             else { this.uiManager.showActionFeedback("Not enough Insight!", "warning"); return; }
         }
         else if (itemType === 'remove') {
              const removalCost = this.currentShop.removalCost;
              if (this.currentShop.removalAvailable && this.player.insightThisRun >= removalCost) {
                   if (this.player.deckManager.masterDeck.length <= 5) { this.uiManager.showActionFeedback("Deck too small!", "warning"); return; }
                   this.uiManager.showCardSelectionModal( this.player.deckManager.getMasterDeck(), (selectedCard) => {
                       if (selectedCard) {
                           if (this.player.removeCardFromDeck(selectedCard)) { // Player method handles triggers
                               this.player.insightThisRun -= removalCost;
                               this.currentShop.removalAvailable = false;
                               this.triggerMilestoneAction('removeCard');
                               this.uiManager?.renderShop(this.currentShop, this.player.insightThisRun);
                               this.uiManager.showNotification(`Removed: ${selectedCard.name}`);
                           } else { this.uiManager.showActionFeedback("Removal failed.", "error"); }
                       } // else: Cancellation handled by modal closing
                   }, `Choose Concept to Remove (${removalCost} Insight)` );
              } else { this.uiManager?.showActionFeedback(this.currentShop.removalAvailable ? "Not enough Insight!" : "Used/Unavailable", "warning"); }
              return; // Exit early as modal handles the flow
         }

         if (purchasedItem) {
             console.log(`Purchased ${itemType} ${itemId} for ${itemCost}. Insight remaining: ${this.player.insightThisRun}`);
             this.uiManager.renderShop(this.currentShop, this.player.insightThisRun); // Update UI after purchase
         }
      }

    /** Leaves the shop node. */
     leaveShop() {
         const nodeId = this.mapManager?.currentNodeId;
         this.currentShop = null;
         this.completeNode(nodeId);
         this.uiManager?.showScreen('mapScreen');
         this.mapManager?.renderMap();
      }

    /** Enters the rest site node. */
    enterRestSite() {
         if (!this.player || !this.uiManager) { console.error("Cannot enter rest site."); this.completeNode(this.mapManager?.currentNodeId, { error: "Rest site failed" }); this.uiManager?.showScreen('mapScreen'); return; }
         this.currentRestSite = { usedOption: false };
         this.uiManager.showScreen('restSiteScreen');
         this.uiManager.renderRestSite(this.currentRestSite, this.player);
    }

    /** Handles actions taken at the rest site. */
     handleRestSiteAction(action) {
        if (!this.currentRestSite || !this.player || !this.uiManager || !this.metaProgression) return;
        if (this.currentRestSite.usedOption) { this.uiManager.showActionFeedback("Already rested.", "info"); return; }
        const currentNodeId = this.mapManager?.currentNodeId; let actionTaken = false;
        switch (action) {
             case 'heal':
                 const healAmount = Math.floor(this.player.maxIntegrity * 0.3);
                 if (this.player.currentIntegrity >= this.player.maxIntegrity) { this.uiManager.showActionFeedback("Integrity full!", "info"); return; }
                 const actualHeal = this.player.heal(healAmount); // Player.heal triggers 'onHeal'
                 this.player.triggerArtifacts('onRestSiteHeal', { baseHeal: actualHeal }); // Specific rest site trigger
                 this.currentRestSite.usedOption = true; actionTaken = true;
                 this.triggerMilestoneAction('restHeal'); this.triggerMilestoneAction('useAnyRestAction');
                 this.uiManager.showNotification(`Restored ${actualHeal} Integrity.`); break;
             case 'upgrade':
                 const upgradable = this.player.deckManager.getMasterDeck().filter(c => !c.upgraded);
                 if (upgradable.length === 0) { this.uiManager.showActionFeedback("No concepts to upgrade!", "info"); return; }
                 this.uiManager.showCardSelectionModal(upgradable, (card) => { if (card) { const cardInDeck = this.player.deckManager.masterDeck.find(c => c.id === card.id); if(cardInDeck && !cardInDeck.upgraded) { cardInDeck.upgrade(); this.currentRestSite.usedOption = true; this.triggerMilestoneAction('restUpgrade'); this.triggerMilestoneAction('useAnyRestAction'); this.player.triggerArtifacts('onCardUpgrade', { card: cardInDeck }); this.uiManager.showNotification(`Upgraded: ${cardInDeck.name}.`); this.leaveRestSite(); } else { this.uiManager.showActionFeedback("Upgrade failed.", "error"); } } }, "Meditate (Upgrade Concept)"); break;
             case 'remove':
                 if (this.player.deckManager.masterDeck.length <= 5) { this.uiManager.showActionFeedback("Deck too small!", "warning"); return; }
                 this.uiManager.showCardSelectionModal(this.player.deckManager.getMasterDeck(), (card) => { if (card) { const removedCard = {...card}; if (this.player.removeCardFromDeck(card)) { this.currentRestSite.usedOption = true; this.triggerMilestoneAction('restRemove'); this.triggerMilestoneAction('removeCard'); this.triggerMilestoneAction('useAnyRestAction'); this.uiManager.showNotification(`Removed: ${removedCard.name}.`); this.leaveRestSite(); } else { this.uiManager.showActionFeedback("Removal failed.", "error"); } } }, "Let Go (Remove Concept)"); break;
             default: console.warn("Unknown rest action:", action); return;
        }
         if (actionTaken) { this.leaveRestSite(); } else { this.uiManager.renderRestSite(this.currentRestSite, this.player); }
     }

    /** Leaves the rest site node. */
     leaveRestSite() {
         const nodeId = this.mapManager?.currentNodeId;
         this.currentRestSite = null;
         this.completeNode(nodeId);
         this.uiManager?.showScreen('mapScreen');
         this.mapManager?.renderMap();
     }

    /** Marks a node as completed and updates UI. */
    completeNode(nodeId, options = {}) {
        console.log(`GameState: Completing node ${nodeId}`, options);
        const node = this.mapManager?.nodes[nodeId];
        if(node) node.visited = true;
        if(this.player && node) { this.player.triggerArtifacts('onNodeComplete', { nodeType: node.type, floor: this.currentFloor }); }
        this.uiManager?.updatePlayerMapInfo(this.player, this.currentFloor);
    }

    /** Advances the player to the next floor. */
     advanceFloor() {
         if (!this.runActive || !this.player || !this.mapManager || !this.uiManager) { console.error("Cannot advance floor."); return; }
         const oldFloor = this.currentFloor; console.log(`GameState: Advancing from floor ${oldFloor}...`); this.currentFloor++;
         this.triggerMilestoneAction('reachFloor', 1, { value: this.currentFloor }); // Trigger milestone
         const MAX_FLOORS = 3; if (this.currentFloor > MAX_FLOORS) { this.endRun(true); return; }
         this.player.triggerArtifacts('onFloorStart', { floor: this.currentFloor });
         const healAmount = Math.floor(this.player.maxIntegrity * 0.15); this.player.heal(healAmount); this.uiManager.showNotification(`Reached Floor ${this.currentFloor}. Healed ${healAmount} Integrity.`);
         this.mapManager.generateFloor(this.currentFloor);
         this.uiManager.showScreen('mapScreen'); this.uiManager.updatePlayerMapInfo(this.player, this.currentFloor);
     }

     // --- Reward Generation Helpers ---

    /** Generates card reward choices, weighted by player attunements. */
     generateCardReward(player, allowRare = false, numChoices = 3, allowCommon = false, specificPoolIds = null) {
         if (!player || !this.metaProgression || !Data?.concepts) return [];
         let basePool = Data.concepts.filter(c => this.metaProgression.isConceptUnlocked(c.id) && (allowCommon || c.rarity !== 'common') && (allowRare || c.rarity !== 'rare') && !['Status', 'Curse', 'starter'].includes(c.rarity) && (!specificPoolIds || specificPoolIds.includes(c.id)));
         if (basePool.length === 0) { console.warn("No available concepts for card reward generation."); return []; }

         const weightedPool = basePool.map(concept => {
             let resonanceScore = 1.0; const cardScores = concept.elementScores || {}; const playerAttunements = player.attunements || {};
             for (const elem in playerAttunements) { resonanceScore += (playerAttunements[elem] || 0) * (cardScores[elem] || 0); }
             const weight = Math.max(1, Math.exp((resonanceScore + 0.1) / 50.0)); // Exp weighting, ensure min 1
             return { concept, weight };
         });

         const choices = []; const chosenIds = new Set(); let totalWeight = weightedPool.reduce((sum, item) => sum + item.weight, 0);
         for (let i = 0; i < numChoices && weightedPool.length > 0; i++) {
              if (totalWeight <= 0) break; let randomNum = Math.random() * totalWeight; let chosenItem = null; let chosenIndex = -1;
              for(let j=0; j < weightedPool.length; j++) { randomNum -= weightedPool[j].weight; if (randomNum <= 0) { chosenItem = weightedPool[j]; chosenIndex = j; break; } }
              if (chosenItem && !chosenIds.has(chosenItem.concept.id)) { choices.push(chosenItem.concept.id); chosenIds.add(chosenItem.concept.id); totalWeight -= chosenItem.weight; weightedPool.splice(chosenIndex, 1); }
              else if (chosenItem) { totalWeight -= chosenItem.weight; weightedPool.splice(chosenIndex, 1); i--; } // Duplicate, retry
              else { console.warn("Weighted selection failed."); break; }
         }
         if (choices.length < numChoices) { const remainingPool = basePool.filter(c => !chosenIds.has(c.id)); this._fallbackShuffle(remainingPool); for (let i = 0; i < remainingPool.length && choices.length < numChoices; i++) { choices.push(remainingPool[i].id); } }
         return choices;
     }

    /** Generates a single artifact reward choice. */
     generateArtifactReward(guaranteeRareOrBetter = false) {
        if (!this.player || !this.metaProgression || !ARTIFACT_TEMPLATES) return null;
         const availableArtifactIds = Object.keys(ARTIFACT_TEMPLATES).filter(id => this.metaProgression.isArtifactUnlocked(id) && ARTIFACT_TEMPLATES[id].rarity !== 'boss');
         if (availableArtifactIds.length === 0) return null;
         let potentialChoices = availableArtifactIds;
         if (guaranteeRareOrBetter) { potentialChoices = availableArtifactIds.filter(id => ['uncommon', 'rare'].includes(ARTIFACT_TEMPLATES[id].rarity)); if (potentialChoices.length === 0) potentialChoices = availableArtifactIds; }
         this._fallbackShuffle(potentialChoices); return potentialChoices.length > 0 ? potentialChoices[0] : null;
     }
    _fallbackShuffle(array) { return array.sort(() => Math.random() - 0.5); }

    // --- Milestone Trigger Helper ---
    /** Centralized method to trigger milestone actions */
    triggerMilestoneAction(actionName, value = 1, context = null) {
        this.metaProgression?.updateMilestoneProgress(actionName, value, context);
    }

    /** Provides player state snapshot for milestone checks */
    getPlayerStateForMilestones() {
         if (!this.player) return null;
         return { maxFocus: this.player.maxFocus, maxIntegrity: this.player.maxIntegrity, attunements: { ...this.player.attunements } };
    }

    // --- Utility ---
    getCurrentNode() { return this.mapManager?.getCurrentNode(); }
    /** Adds a status card (like Dazed) to player's deck */
    addStatusCardToPlayerDeck(statusCardConceptId, destination = 'discard') {
         if (!this.player || !this.player.deckManager || !this.uiManager) { console.error("Cannot add status card: Missing components."); return; }
         const concept = Data.concepts?.find(c => c.id === statusCardConceptId); if (!concept || concept.rarity !== 'special' || concept.cardType !== 'Status') { console.warn(`Attempted to add invalid status card: ID ${statusCardConceptId}`); return; }
         console.log(`Adding status card ${concept.name} (${statusCardConceptId}) to ${destination} pile.`); let statusCard;
         try { statusCard = new Card(statusCardConceptId); if (statusCard.conceptId === -1) throw new Error("Card creation failed."); } catch (error) { console.error(`Failed status card instance ${statusCardConceptId}:`, error); return; }
         if (destination === 'draw') { this.player.deckManager.drawPile.unshift(statusCard); }
         else if (destination === 'hand') { if (this.player.deckManager.hand.length < this.player.deckManager.maxHandSize) { this.player.deckManager.hand.push(statusCard); this.uiManager.combatUI?.renderHand(this.player.deckManager.hand, this.combatManager?.playerTurn); } else { this.player.deckManager.discardPile.push(statusCard); this.uiManager.showActionFeedback("Hand full! Status->Discard.", "info"); } }
         else { this.player.deckManager.discardPile.push(statusCard); }
         this.uiManager.updateDeckDiscardCounts(this.player.deckManager); this.player.triggerArtifacts('onStatusCardAdded', { card: statusCard, destination: destination });
     }

} // End of GameState class
