// js/core/GameState.js

// ... (keep imports: Player, MapManager, CombatManager, UIManager, Card, Artifact, Data, ARTIFACT_TEMPLATES, ENEMY_TEMPLATES) ...
import { Player } from './Player.js';
import { MapManager } from '../map/MapManager.js';
import { CombatManager } from '../combat/CombatManager.js';
import { UIManager } from '../ui/UIManager.js';
import { Card } from './Card.js';
import { Artifact } from './Artifact.js';
import * as Data from '.../data.js';
import { ARTIFACT_TEMPLATES } from './ArtifactDefinitions.js';
// Assuming ENEMY_TEMPLATES are accessible, e.g., imported or part of Data
import { ENEMY_TEMPLATES } from '../combat/Enemy.js';


/**
 * Manages the state for a single game run.
 */
export class GameState {
    // ... (keep constructor and startRun) ...
    constructor(playerData = null, metaProgression = null, uiManager = null) { /* ... keep ... */ }
    startRun(playerData, metaProgression, uiManager) { /* ... keep ... */ }

    // Keep endRun, cleanupRun, handleNodeEntry, enterCombat...

     handleCombatEnd(victory) {
        if (!this.runActive) return;
         console.log(`GameState: Handling combat end. Victory: ${victory}`);

         const currentNode = this.mapManager?.getCurrentNode();
         const nodeType = currentNode?.type;

         // Player end-of-combat artifact triggers HAPPENED in CombatManager before this call

         if (!victory) {
             this.metaProgression?.updateMilestoneProgress(`defeat_in_${nodeType || 'combat'}`, 1);
             this.endRun(false); // Handles meta saving and UI
             return;
         }

         // --- Victory Tracking & Rewards ---
         // ... (keep reward generation logic) ...
         this.metaProgression?.updateMilestoneProgress(`victory_${nodeType || 'combat'}`, 1);
         let insightReward = 0; let cardChoices = []; let artifactChoices = [];
          if (nodeType && this.player) {
              // ... (switch statement for rewards based on nodeType) ...
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
                               }
                           }
                          this.metaProgression?.updateMilestoneProgress('winBoss', 1);
                          break;
                 }
             } catch (error) { console.error("Error generating rewards:", error); insightReward = insightReward || 5; }
              if (insightReward > 0) this.player.insightThisRun += insightReward;
         } else { console.warn("Cannot generate rewards: Node type or player missing."); }

         // --- Show Reward Screen via UIManager ---
         if (this.uiManager) {
             this.uiManager.showRewardScreen({
                 insight: insightReward, cardChoices: cardChoices || [], artifactChoices: artifactChoices || [],
                 onComplete: () => {
                      this.completeNode(currentNode?.id);
                       if (nodeType === 'boss') this.advanceFloor();
                       else { this.uiManager.showScreen('mapScreen'); this.mapManager?.renderMap(); }
                 }
             });
         } else { /* ... keep fallback ... */ }
     }

    // Keep triggerEvent, resolveDilemma, enterShop, generateShopInventory, getCardCost, getArtifactCost...
    // Keep handleShopPurchase, leaveShop, enterRestSite...

     handleRestSiteAction(action) {
        if (!this.currentRestSite || this.currentRestSite.usedOption || !this.uiManager || !this.player) {
             if (this.currentRestSite?.usedOption) this.uiManager?.showActionFeedback("You already took action here.", "info");
             return;
         }
          const currentNodeId = this.mapManager?.currentNodeId;

         switch (action) {
             case 'heal':
                 const healAmount = Math.floor(this.player.maxIntegrity * 0.3);
                 if (this.player.currentIntegrity >= this.player.maxIntegrity) { /* ... show feedback ... */ return; }
                 this.player.heal(healAmount); // Player.heal triggers 'onHeal' artifacts internally
                 // --- NEW: Specific trigger for rest site heal bonus ---
                 this.player.triggerArtifacts('onRestSiteHeal', { baseHeal: healAmount });
                 // --- End NEW ---
                 this.currentRestSite.usedOption = true;
                 this.metaProgression?.updateMilestoneProgress('restHeal', 1);
                 this.uiManager.showNotification(`Healed ${healAmount} Integrity.`); // Initial heal amount
                 this.leaveRestSite();
                 break;
             case 'upgrade':
                  const upgradableCards = this.player.deckManager.getMasterDeck().filter(card => !card.upgraded);
                  if(upgradableCards.length === 0) { /* ... show feedback ... */ return; }
                  this.uiManager.showCardSelectionModal(upgradableCards, (selectedCard) => {
                         if (selectedCard) {
                             const cardInDeck = this.player.deckManager.masterDeck.find(c => c.id === selectedCard.id);
                             if(cardInDeck && !cardInDeck.upgraded) {
                                 cardInDeck.upgrade();
                                 this.currentRestSite.usedOption = true;
                                 this.metaProgression?.updateMilestoneProgress('restUpgrade', 1);
                                 // --- NEW: Trigger for card upgrade ---
                                 this.player.triggerArtifacts('onCardUpgrade', { card: cardInDeck });
                                 // --- End NEW ---
                                 this.uiManager.showNotification(`Meditated: Upgraded ${cardInDeck.name}.`);
                                 this.leaveRestSite();
                             } else { /* ... show feedback ... */ }
                         } else { console.log("Upgrade cancelled."); }
                      }, "Choose a Card to Meditate Upon (Upgrade)" );
                 break; // Wait for modal
             case 'remove':
                   if (this.player.deckManager.masterDeck.length <= 5) { /* ... show feedback ... */ return; }
                 this.uiManager.showCardSelectionModal( this.player.deckManager.getMasterDeck(), (selectedCard) => {
                         if (selectedCard) {
                             const removedCard = {...selectedCard}; // Copy data before removing
                             if (this.player.removeCardFromDeck(selectedCard)) { // removeCardFromDeck triggers milestones now
                                 this.currentRestSite.usedOption = true;
                                 this.metaProgression?.updateMilestoneProgress('restRemove', 1);
                                 // --- NEW: Trigger for card removal ---
                                 this.player.triggerArtifacts('onCardRemove', { card: removedCard });
                                 // --- End NEW ---
                                 this.uiManager.showNotification(`Journaled: Removed ${removedCard.name}.`);
                                 this.leaveRestSite();
                             } else { /* ... show feedback ... */ }
                         } else { console.log("Removal cancelled."); }
                     }, "Choose a Concept to Let Go Of (Remove)" );
                 break; // Wait for modal
              default: console.warn("Unknown rest site action:", action);
         }
     }

     // Keep leaveRestSite...

    completeNode(nodeId, options = {}) {
        console.log(`GameState: Completing node ${nodeId}`, options);
         // --- NEW: Trigger for node completion ---
         const node = this.mapManager?.nodes[nodeId];
         if (node && this.player) {
            this.player.triggerArtifacts('onNodeComplete', { nodeType: node.type, floor: this.currentFloor });
         }
         // --- End NEW ---
        this.uiManager?.updatePlayerMapInfo(this.player, this.currentFloor);
        // Map rendering happens when UI shows map screen again
    }

     advanceFloor() {
         if (!this.runActive || !this.player || !this.mapManager || !this.uiManager) return;
         const oldFloor = this.currentFloor;
         console.log(`GameState: Advancing from floor ${oldFloor}...`);
         this.currentFloor++;

         const MAX_FLOORS = 3;
         if (this.currentFloor > MAX_FLOORS) {
             console.log("Final floor boss defeated! Overall Victory!");
             this.endRun(true);
             return;
         }

         // --- NEW: Trigger for starting a new floor ---
         this.player.triggerArtifacts('onFloorStart', { floor: this.currentFloor });
         // --- End NEW ---

         // Full heal between floors? Optional.
         // this.player.heal(this.player.maxIntegrity);
         // this.uiManager.showNotification(`Reached Floor ${this.currentFloor}! Integrity restored.`);

         this.mapManager.generateFloor(this.currentFloor);
         this.currentNodeId = this.mapManager.startNodeId; // Set player to start
         this.uiManager.showScreen('mapScreen');
         this.uiManager.updatePlayerMapInfo(this.player, this.currentFloor);
     }

     // Keep generateCardReward, generateArtifactReward, _fallbackShuffle...
     // Keep getDefaultDeckIds, getDefaultAttunements, getCurrentNode...

} // End of GameState class
