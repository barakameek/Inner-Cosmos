// js/combat/CombatManager.js

import { Enemy } from './Enemy.js';

/**
 * Manages the state and flow of a single combat encounter.
 */
export class CombatManager {
    // ... (keep constructor and existing properties) ...
    constructor(gameState, uiManager) { /* ... keep ... */ }

    startCombat(enemyIds) {
        // ... (keep setup logic) ...
        if (!this.isActive || !this.gameState?.player) return; // Check player exists

        console.log("CombatManager: Starting combat...");
        // ... (spawn enemies) ...

        // --- Player Combat Setup ---
        // Player.startCombat triggers 'onCombatStart' artifacts internally now
        this.gameState.player.startCombat();

        // --- NEW: Trigger for Enemy Spawn ---
         this.enemies.forEach(enemy => {
             this.gameState.player.triggerArtifacts('onEnemySpawn', { enemy: enemy });
         });
         // --- End NEW ---

        this.uiManager.showScreen('combatScreen');
        this.beginPlayerTurn();
        console.log(`--- Combat Start --- Floor ${this.gameState.currentFloor}, Turn ${this.turnNumber}`);
    }

    endCombat(victory) {
        if (!this.isActive) return;
        console.log(`CombatManager: Ending combat. Victory: ${victory}`);
        const wasActive = this.isActive;
        this.isActive = false;

        if (wasActive) {
            // --- Player end-of-combat artifact triggers ---
            this.gameState.player?.triggerArtifacts('onCombatEnd', { victory: victory });
            // --- NEW: Trigger for enemy defeat (if victory) ---
            if (victory) {
                // We need the original enemy list before clearing if we want to trigger per enemy
                // Let's assume we trigger a general victory event instead for simplicity here
                 this.gameState.player?.triggerArtifacts('onVictory', { floor: this.gameState.currentFloor });
            }
            // --- End NEW ---
        }

        this.enemies = [];
        this.currentTarget = null;
        this.uiManager?.enemyArea?.replaceChildren();

        // Delegate back to GameState (handles rewards/etc.)
        this.gameState.handleCombatEnd(victory);
    }

    // Keep beginPlayerTurn, endPlayerTurn, beginEnemyTurn, executeEnemyActionsSequentially, delay...

    handlePlayerCardPlay(card, droppedTarget = null) {
        // ... (keep validation logic) ...
        if (!this.isActive || !this.playerTurn || !this.gameState.player || !card) return;

        const finalTarget = this.currentTarget || droppedTarget;
        const validatedTarget = this.validateTarget(card, finalTarget);
        if (card.requiresTarget && !validatedTarget) {
            this.uiManager.showActionFeedback("Invalid target selected.", "warning");
            this.currentTarget = null; this.uiManager.clearEnemyHighlights();
            return;
        }

        // Player.playCard handles effect, triggers 'onCardPlay', 'onCardExhaust'
        const playedSuccessfully = this.gameState.player.playCard(card, validatedTarget, this.enemies);

        this.currentTarget = null; // Clear target AFTER play attempt
        this.uiManager.clearEnemyHighlights();

        if (playedSuccessfully) {
            // ... (update UI, check end condition) ...
            this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);
            this.checkCombatEndCondition();
        } else {
            // ... (handle failure - feedback shown by Player.playCard or UIManager) ...
        }
    }

    // Keep setSelectedTarget, validateTarget, checkCombatEndCondition, getActiveEnemies...

} // End CombatManager class
