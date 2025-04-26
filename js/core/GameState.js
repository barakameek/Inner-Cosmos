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
import { ARTIFACT_TEMPLATES } from './ArtifactDefinitions.js';
// Assuming ENEMY_TEMPLATES are defined in Enemy.js which is ../combat/Enemy.js
// We might need to import it here if handleCombatEnd needs direct template access
import { ENEMY_TEMPLATES } from '../combat/Enemy.js'; // Path goes up from 'core', then down into 'combat'


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
            // Add insight BEFORE checking milestones that might depend on total insight
            this.metaProgression.addInsight(runInsight);
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
        this.player = null;
        this.mapManager = null;
        this.combatManager = null;
        this.currentEvent = null;
        this.currentShop = null;
        this.currentRestSite = null;
        this.runActive = false;
    }

    handleNodeEntry(node) {
        if (!node || !this.runActive || !this.player) {
             console.warn("Cannot handle node entry: Node invalid, run inactive, or player missing.");
             return;
        };
        console.log(`GameState: Entering node ${node.id} (Type: ${node.type})`);

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
                     // If node was meant to have combat but failed, return to map
                     this.uiManager?.showScreen('mapScreen');
                     this.mapManager?.renderMap();
                }
                break;
            case 'event':
                 if (node.data.eventId) {
                    this.triggerEvent(node.data.eventId);
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
                 this.completeNode(node.id); // Complete immediately
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

    enterCombat(enemyList) {
        if (this.combatManager && !this.combatManager.isActive) {
            this.combatManager.startCombat(enemyList); // Handles UI screen change
        } else {
            console.error("Cannot enter combat: CombatManager not ready or already active.");
             this.completeNode(this.mapManager?.currentNodeId, { error: "Combat failed to start" });
             this.uiManager?.showScreen('mapScreen');
        }
    }

     handleCombatEnd(victory) {
        if (!this.runActive) return;
         console.log(`GameState: Handling combat end. Victory: ${victory}`);

         // --- Player Cleanup ---
         this.player?.cleanupCombatStatuses(); // Remove temporary statuses

         const currentNode = this.mapManager?.getCurrentNode();
         const nodeType = currentNode?.type;

         if (!victory) {
             this.metaProgression?.updateMilestoneProgress(`defeat_in_${nodeType || 'combat'}`, 1);
             this.endRun(false);
             return;
         }

         // --- Victory Tracking & Rewards ---
         this.metaProgression?.updateMilestoneProgress(`victory_${nodeType || 'combat'}`, 1);

         let insightReward = 0;
         let cardChoices = [];
         let artifactChoices = [];

         if (nodeType && this.player) {
             console.log(`Generating rewards for beating ${nodeType} node...`);
             try {
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
                          const bossEnemyId = currentNode?.data?.enemies[0];
                          const bossTemplate = ENEMY_TEMPLATES[bossEnemyId];
                           if(bossTemplate?.onDeathAction?.type === 'reward') {
                               if(bossTemplate.onDeathAction.insight) insightReward += bossTemplate.onDeathAction.insight;
                               if(bossTemplate.onDeathAction.artifactId && this.metaProgression?.isArtifactUnlocked(bossTemplate.onDeathAction.artifactId)) {
                                   artifactChoices = [bossTemplate.onDeathAction.artifactId];
                               } else if (bossTemplate.onDeathAction.artifactId) { console.log(`Boss drop artifact ${bossTemplate.onDeathAction.artifactId} not unlocked.`); }
                           }
                          this.metaProgression?.updateMilestoneProgress('winBoss', 1);
                          break;
                     default: console.warn(`No specific reward defined for node type: ${nodeType}`); insightReward = 3; // Default small reward
                 }
             } catch (error) { console.error("Error generating rewards:", error); insightReward = insightReward || 5; }
             if (insightReward > 0) this.player.insightThisRun += insightReward;
         } else { console.warn("Cannot generate rewards: Node type or player missing."); insightReward = 1; }

         // --- Show Reward Screen via UIManager ---
         if (this.uiManager) {
             this.uiManager.showRewardScreen({
                 insight: insightReward, cardChoices: cardChoices || [], artifactChoices: artifactChoices || [],
                 onComplete: () => {
                      console.log("Reward screen completed.");
                      this.completeNode(currentNode?.id); // Complete node AFTER rewards
                       if (nodeType === 'boss') { this.advanceFloor(); }
                       else { this.uiManager.showScreen('mapScreen'); this.mapManager?.renderMap(); }
                 }
             });
         } else { /* Fallback */ console.error("UIManager missing!"); this.completeNode(currentNode?.id); if (nodeType === 'boss') this.advanceFloor(); }
     }

     triggerEvent(eventId) {
         console.log(`GameState: Triggering event ${eventId}`);
         let eventData = null; let eventType = 'unknown'; let sourceKey = null;
         // Find event data logic...
          for (const key in Data.reflectionPrompts) { /* ... find reflection ... */
             const source = Data.reflectionPrompts[key];
             if (Array.isArray(source)) { const found = source.find(p => p.id === eventId); if (found) { eventData = found; eventType = 'reflection'; sourceKey = key; break; } }
             else if (typeof source === 'object' && source !== null) { if (source[eventId]) { eventData = source[eventId]; eventType = 'reflection'; sourceKey = key; break; } }
          }
          if (!eventData) { const foundDilemma = Data.elementalDilemmas.find(d => d.id === eventId); if (foundDilemma) { eventData = foundDilemma; eventType = 'dilemma'; } }

         if (eventData && this.uiManager && this.player) {
             const currentNodeId = this.mapManager?.currentNodeId;
             if (eventType === 'reflection') {
                let rewardText = ""; const insightGain = 5;
                 this.player.insightThisRun += insightGain; rewardText = `<br><br><i>(+${insightGain} <i class='fas fa-brain insight-icon'></i>)</i>`;
                 this.metaProgression?.updateMilestoneProgress('completeReflection', 1, { eventId: eventId });
                  if (sourceKey === 'Dissonance') this.metaProgression?.updateMilestoneProgress('completeReflectionDissonance', 1);
                 this.uiManager.showModal(eventData.text + rewardText, [{ text: 'Ponder...', callback: () => {
                     this.completeNode(currentNodeId); this.uiManager.showScreen('mapScreen'); this.mapManager?.renderMap();
                 }}]);
             } else if (eventType === 'dilemma') {
                  this.uiManager.showModal( `<strong>Dilemma:</strong> ${eventData.situation}<hr>${eventData.question}`, [
                         { text: eventData.sliderMinLabel || 'Choice 1', callback: () => this.resolveDilemma(eventId, 'min', currentNodeId) },
                         { text: eventData.sliderMaxLabel || 'Choice 2', callback: () => this.resolveDilemma(eventId, 'max', currentNodeId) }
                     ] );
             } else { /* Error handling */ this.completeNode(currentNodeId); this.uiManager?.showScreen('mapScreen'); }
         } else { /* Error handling */ this.completeNode(this.mapManager?.currentNodeId); this.uiManager?.showScreen('mapScreen'); }
     }

     resolveDilemma(dilemmaId, choice, nodeIdToComplete) {
         console.log(`Resolving dilemma ${dilemmaId} with choice: ${choice}`);
         const dilemmaData = Data.elementalDilemmas.find(d => d.id === dilemmaId);
         if (!dilemmaData || !this.player || !this.uiManager) return;

         let insightGain = 10;
         const chosenElement = (choice === 'min') ? dilemmaData.elementKeyMin : dilemmaData.elementKeyMax;
         let outcomeText = `Leaned towards ${chosenElement}. Gained ${insightGain} <i class='fas fa-brain insight-icon'></i> Insight.`;
         let cardRewardText = "";

         const potentialCard = Data.concepts.find(c => c.primaryElement === chosenElement && c.rarity === 'common' && this.metaProgression?.isConceptUnlocked(c.id));
         if (potentialCard) {
             const addedCard = this.player.addCardToDeck(potentialCard.id); // Use player method which triggers artifacts
             if(addedCard) { // Check if card was actually added
                 cardRewardText = `<br>Gained Concept: ${addedCard.name}`;
                 this.metaProgression?.updateMilestoneProgress('gainCardFromEvent', 1);
             }
         } else { cardRewardText = "<br>No relevant concept resonated."; }

         this.player.insightThisRun += insightGain;
         this.metaProgression?.updateMilestoneProgress('resolveDilemma', 1);

         this.uiManager.showModal(outcomeText + cardRewardText, [{ text: 'Continue', callback: () => {
              this.completeNode(nodeIdToComplete); this.uiManager.showScreen('mapScreen'); this.mapManager?.renderMap();
         }}]);
     }

    enterShop() {
         if (!this.player || !this.uiManager) { /* Error Handling */ this.completeNode(this.mapManager?.currentNodeId); this.uiManager?.showScreen('mapScreen'); return; }
         const shopInventory = this.generateShopInventory(); this.currentShop = shopInventory;
         this.uiManager.showScreen('shopScreen'); this.uiManager.renderShop(shopInventory, this.player.insightThisRun);
    }

     generateShopInventory() { /* ... keep refined version from File 17 ... */
         const cardOptions = []; const numCardChoices = 3 + (this.metaProgression?.getStartingBonus('cardRewardChoicesBonus') || 0); const generatedIds = new Set();
          for (let i=0; i < numCardChoices; i++) { const allowRareShop = this.currentFloor > 1 && Math.random() < 0.2; const choices = this.generateCardReward(allowRareShop, 1, true); if (choices?.length > 0 && !generatedIds.has(choices[0])) { generatedIds.add(choices[0]); cardOptions.push(choices[0]); } else { i--; } }
         const artifactOptions = []; const numArtifactChoices = 1 + (this.metaProgression?.getStartingBonus('shopArtifactChoicesBonus') || 0);
          for (let i=0; i < numArtifactChoices; i++) { const allowRareArtifact = this.currentFloor > 1 && Math.random() < 0.3; const artifactId = this.generateArtifactReward(allowRareArtifact); if (artifactId && !generatedIds.has(artifactId)) { generatedIds.add(artifactId); artifactOptions.push(artifactId); } else if (artifactId) { i--; } }
         const baseRemovalCost = 75; const removalCost = baseRemovalCost + (this.metaProgression?.getStartingBonus('shopRemovalCostIncrease') || 0);
         return { cards: cardOptions.map(id => ({ cardId: id, cost: this.getCardCost(id), purchased: false })), artifacts: artifactOptions.map(id => ({ artifactId: id, cost: this.getArtifactCost(id), purchased: false })), removalAvailable: true, removalCost: removalCost };
      }
     getCardCost(cardId) { /* ... keep refined version ... */
        const concept = Data.concepts.find(c => c.id === cardId); if (!concept) return 999; let baseCost = 50; if (concept.rarity === 'uncommon') baseCost = 100; else if (concept.rarity === 'rare') baseCost = 150; return Math.round(baseCost);
      }
     getArtifactCost(artifactId) { /* ... keep refined version ... */
         const template = ARTIFACT_TEMPLATES[artifactId]; if (!template) return 999; let baseCost = 125; if (template.rarity === 'uncommon') baseCost = 175; else if (template.rarity === 'rare') baseCost = 250; return Math.round(baseCost);
      }

     handleShopPurchase(itemType, itemId) { /* ... keep refined version from File 17, ensure player.addCard/addArtifact called ... */
         if (!this.currentShop || !this.player || !this.uiManager) return false; let itemCost = 0; let purchasedItem = null;
         if (itemType === 'card') { const item = this.currentShop.cards.find(i => i.cardId === itemId && !i.purchased); if (item && this.player.insightThisRun >= item.cost) { itemCost = item.cost; if(this.player.addCardToDeck(item.cardId)){ item.purchased = true; purchasedItem = item; this.metaProgression?.updateMilestoneProgress('buyCard', 1); } else { console.error("Failed to add card to deck"); return; } } else if (!item) { console.warn("Shop item not found/purchased."); return; } else { this.uiManager.showActionFeedback("Not enough Insight!", "warning"); return; } }
         else if (itemType === 'artifact') { const item = this.currentShop.artifacts.find(i => i.artifactId === itemId && !i.purchased); if (item && this.player.insightThisRun >= item.cost) { itemCost = item.cost; this.player.addArtifact(item.artifactId); item.purchased = true; purchasedItem = item; this.metaProgression?.updateMilestoneProgress('buyArtifact', 1); } else if (!item) { console.warn("Shop item not found/purchased."); return; } else { this.uiManager.showActionFeedback("Not enough Insight!", "warning"); return; } }
         else if (itemType === 'remove') { if (this.currentShop.removalAvailable && this.player.insightThisRun >= this.currentShop.removalCost) { if (this.player.deckManager.masterDeck.length <= 5) { this.uiManager.showActionFeedback("Deck too small!", "warning"); return; } this.uiManager.showCardSelectionModal( this.player.deckManager.getMasterDeck(), (selectedCard) => { if (selectedCard) { if (this.player.removeCardFromDeck(selectedCard)) { this.player.insightThisRun -= this.currentShop.removalCost; this.currentShop.removalAvailable = false; this.metaProgression?.updateMilestoneProgress('removeCard', 1); this.uiManager?.renderShop(this.currentShop, this.player.insightThisRun); } else { this.uiManager.showActionFeedback("Failed to remove card.", "error"); } } else { console.log("Removal cancelled."); } }, `Choose Concept to Remove (${this.currentShop.removalCost} Insight)` ); } else { this.uiManager?.showActionFeedback("Cannot afford removal or used", "warning"); } return; }
         if (purchasedItem) { this.player.insightThisRun -= itemCost; console.log(`Purchased ${itemType} ${itemId} for ${itemCost}.`); this.uiManager.renderShop(this.currentShop, this.player.insightThisRun); } else if (itemType !== 'remove') { console.log(`Could not purchase ${itemType} ${itemId}.`); }
      }
     leaveShop() { /* ... keep existing logic ... */
         const nodeId = this.mapManager?.currentNodeId; this.currentShop = null; this.completeNode(nodeId); this.uiManager?.showScreen('mapScreen'); this.mapManager?.renderMap();
      }

    enterRestSite() { /* ... keep existing logic ... */
         if (!this.player || !this.uiManager) { /* Error Handling */ this.completeNode(this.mapManager?.currentNodeId); this.uiManager?.showScreen('mapScreen'); return; }
         this.currentRestSite = { usedOption: false }; this.uiManager.showScreen('restSiteScreen'); this.uiManager.renderRestSite(this.currentRestSite, this.player); // Pass player for checks
    }

     handleRestSiteAction(action) { /* ... keep refined version from File 17 ... */
        if (!this.currentRestSite || this.currentRestSite.usedOption || !this.uiManager || !this.player) { if (this.currentRestSite?.usedOption) this.uiManager?.showActionFeedback("Already acted here.", "info"); return; }
          const currentNodeId = this.mapManager?.currentNodeId;
         switch (action) {
             case 'heal': const healAmount = Math.floor(this.player.maxIntegrity * 0.3); if (this.player.currentIntegrity >= this.player.maxIntegrity) { this.uiManager.showActionFeedback("Already full!", "info"); return; } this.player.heal(healAmount); this.player.triggerArtifacts('onRestSiteHeal', { baseHeal: healAmount }); this.currentRestSite.usedOption = true; this.metaProgression?.updateMilestoneProgress('restHeal', 1); this.uiManager.showNotification(`Healed ${healAmount} Integrity.`); this.leaveRestSite(); break;
             case 'upgrade': const upgradable = this.player.deckManager.getMasterDeck().filter(c => !c.upgraded); if(upgradable.length === 0) { this.uiManager.showActionFeedback("No cards to upgrade!", "info"); return; } this.uiManager.showCardSelectionModal(upgradable, (card) => { if (card) { const cardInDeck = this.player.deckManager.masterDeck.find(c => c.id === card.id); if(cardInDeck && !cardInDeck.upgraded) { cardInDeck.upgrade(); this.currentRestSite.usedOption = true; this.metaProgression?.updateMilestoneProgress('restUpgrade', 1); this.player.triggerArtifacts('onCardUpgrade', { card: cardInDeck }); this.uiManager.showNotification(`Upgraded: ${cardInDeck.name}.`); this.leaveRestSite(); } else { /* Error feedback */ } } else { console.log("Upgrade cancelled."); } }, "Meditate (Upgrade)"); break;
             case 'remove': if (this.player.deckManager.masterDeck.length <= 5) { this.uiManager.showActionFeedback("Deck too small!", "warning"); return; } this.uiManager.showCardSelectionModal(this.player.deckManager.getMasterDeck(), (card) => { if (card) { const removedCard = {...card}; if (this.player.removeCardFromDeck(card)) { this.currentRestSite.usedOption = true; this.metaProgression?.updateMilestoneProgress('restRemove', 1); this.player.triggerArtifacts('onCardRemove', { card: removedCard }); this.uiManager.showNotification(`Removed: ${removedCard.name}.`); this.leaveRestSite(); } else { /* Error feedback */ } } else { console.log("Removal cancelled."); } }, "Let Go (Remove)"); break;
              default: console.warn("Unknown rest site action:", action);
         }
     }
     leaveRestSite() { /* ... keep existing logic ... */
         const nodeId = this.mapManager?.currentNodeId; this.currentRestSite = null; this.completeNode(nodeId); this.uiManager?.showScreen('mapScreen'); this.mapManager?.renderMap();
     }

    completeNode(nodeId, options = {}) {
        console.log(`GameState: Completing node ${nodeId}`, options);
         if(this.player) this.player.triggerArtifacts('onNodeComplete', { nodeType: this.mapManager?.nodes[nodeId]?.type, floor: this.currentFloor });
        this.uiManager?.updatePlayerMapInfo(this.player, this.currentFloor);
        // Map rendering/screen change handled by the function that *calls* completeNode (e.g., leaveShop, reward callback)
    }

     advanceFloor() {
         if (!this.runActive || !this.player || !this.mapManager || !this.uiManager) return;
         const oldFloor = this.currentFloor; console.log(`GameState: Advancing from floor ${oldFloor}...`); this.currentFloor++;
         const MAX_FLOORS = 3;
         if (this.currentFloor > MAX_FLOORS) { this.endRun(true); return; }
         this.player.triggerArtifacts('onFloorStart', { floor: this.currentFloor });
         // Heal between floors?
         // this.player.heal(Math.floor(this.player.maxIntegrity * 0.2)); // Heal 20% maybe
         // this.uiManager.showNotification(`Reached Floor ${this.currentFloor}. Healed slightly.`);
         this.mapManager.generateFloor(this.currentFloor);
         this.currentNodeId = this.mapManager.startNodeId; // Should be set by generateFloor
         this.uiManager.showScreen('mapScreen');
         this.uiManager.updatePlayerMapInfo(this.player, this.currentFloor);
     }

     // --- Reward Generation Helpers ---
     generateCardReward(allowRare = false, numChoices = 3, allowCommon = false) { /* ... keep refined version from File 17 ... */ }
     generateArtifactReward(guaranteeRare = false) { /* ... keep refined version from File 17 ... */ }
     _fallbackShuffle(array) { return array.sort(() => Math.random() - 0.5); }

    // --- Utility Methods ---
    getDefaultDeckIds() { /* ... keep ... */ }
    getDefaultAttunements() { /* ... keep ... */ }
    getCurrentNode() { return this.mapManager?.getCurrentNode(); }

    // --- NEW Helper for Status Cards ---
    /** Adds a status card (like Dazed, Confused) to player's deck */
    addStatusCardToPlayerDeck(statusCardConceptId, destination = 'discard') {
         if (!this.player || !this.player.deckManager) return;
         // Validate conceptId exists and is a status card? Optional.
         console.log(`Adding status card ${statusCardConceptId} to ${destination} pile.`);
         const statusCard = new Card(statusCardConceptId);
         if (statusCard.conceptId === -1) {
             console.error(`Failed to create status card instance for ID ${statusCardConceptId}`);
             return;
         }
         if (destination === 'draw') {
             this.player.deckManager.drawPile.unshift(statusCard); // Add to top of draw pile
             // Optionally shuffle draw pile after adding? Usually not for status cards.
         } else if (destination === 'hand') {
             if (this.player.deckManager.hand.length < this.player.deckManager.maxHandSize) {
                 this.player.deckManager.hand.push(statusCard);
                 // Trigger UI update for hand? (Handled by combat manager update usually)
             } else {
                 this.player.deckManager.discardPile.push(statusCard); // Add to discard if hand full
             }
         }
         else { // Default to discard
             this.player.deckManager.discardPile.push(statusCard);
         }
         // Update UI counts
         this.uiManager?.updateDeckDiscardCounts(this.player.deckManager);
    }

} // End of GameState class
