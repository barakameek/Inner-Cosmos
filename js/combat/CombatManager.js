// js/combat/CombatManager.js

import { Enemy } from './Enemy.js';
import { Player } from '../core/Player.js'; // Needed for type checks/casting if necessary

/**
 * Manages the state and flow of a single combat encounter.
 */
export class CombatManager {
    constructor(gameState, uiManager) {
        if (!gameState) throw new Error("CombatManager requires a GameState instance.");
        if (!uiManager) throw new Error("CombatManager requires a UIManager instance.");

        this.gameState = gameState;
        this.uiManager = uiManager;
        this.enemies = []; // Array of Enemy instances
        this.playerTurn = true; // Start with player turn
        this.turnNumber = 0;
        this.isActive = false;
        this.currentTarget = null; // Currently selected enemy target by player

        // State tracking for the current turn (reset each player turn)
        this.turnState = {
            attacksPlayedThisTurn: 0, // Example existing state
            cardsPlayedThisTurn: 0,   // Example existing state
            lastCardPlayedType: null, // NEW: Track type of last card for potential combos/sequences
            // Add other turn-specific flags as needed (e.g., energySpentThisTurn)
        };

        console.log("CombatManager initialized.");
    }

    /** Starts a new combat encounter. */
    startCombat(enemyIds) {
        if (this.isActive) {
            console.warn("CombatManager: Cannot start combat, one is already active.");
            return;
        }
        if (!this.gameState || !this.gameState.player) {
             console.error("CombatManager Error: GameState or Player not available to start combat.");
             return;
        }
         if (!Array.isArray(enemyIds) || enemyIds.length === 0) {
             console.error("CombatManager Error: Invalid or empty enemyIds array provided.");
              this.gameState.handleCombatEnd(true); // End immediately with victory? Or error state?
              this.uiManager.showActionFeedback("Combat setup error!", "error");
             return;
         }

        console.log(`CombatManager: Starting combat against: ${enemyIds.join(', ')}`);
        this.isActive = true;
        this.playerTurn = true;
        this.turnNumber = 1;
        this.enemies = [];
        this.currentTarget = null;
        this.turnState = { attacksPlayedThisTurn: 0, cardsPlayedThisTurn: 0, lastCardPlayedType: null }; // Reset turn state

        // --- Spawn Enemies ---
        enemyIds.forEach((id, index) => {
            try {
                const enemyInstance = new Enemy(id, index); // Create new instance
                this.enemies.push(enemyInstance);
                this.gameState.player?.triggerArtifacts('onEnemySpawn', { enemy: enemyInstance });
            } catch (error) {
                 console.error(`CombatManager: Failed to spawn enemy with ID ${id}:`, error);
            }
        });

         // If no enemies were successfully spawned, end combat immediately
         if (this.enemies.length === 0) {
             console.error("CombatManager Error: No enemies successfully spawned. Ending combat.");
             this.gameState.handleCombatEnd(true); // Victory by default if no enemies
             this.uiManager.showActionFeedback("No foes appeared?", "info");
             return;
         }

        // --- Player Combat Setup ---
        this.gameState.player.startCombat();

        // --- Initial UI Setup ---
        this.uiManager.showScreen('combatScreen');
        this.beginPlayerTurn(); // Set up first player turn state
        console.log(`--- Combat Start --- Floor ${this.gameState.currentFloor}, Turn ${this.turnNumber}`);
    }

    /** Ends the current combat. */
    endCombat(victory) {
        if (!this.isActive) return; // Prevent double execution
        console.log(`CombatManager: Ending combat. Victory: ${victory}`);
        const wasActive = this.isActive;
        this.isActive = false; // Set flag immediately

        // --- Player/Enemy Cleanup & Artifacts ---
        if (wasActive) {
            this.gameState.player?.triggerArtifacts('onCombatEnd', { victory: victory });
            if (victory) { this.gameState.player?.triggerArtifacts('onVictory', { floor: this.gameState.currentFloor }); }
            this.gameState.player?.cleanupCombatStatuses();
            this.enemies.forEach(enemy => enemy.cleanupCombatStatuses());
        }

        // Clear combat state
        this.enemies = [];
        this.currentTarget = null;
        this.turnState = { attacksPlayedThisTurn: 0, cardsPlayedThisTurn: 0, lastCardPlayedType: null }; // Reset turn state

        // Delegate back to GameState
        this.gameState.handleCombatEnd(victory);
    }

    /** Sets up the player's turn. */
    beginPlayerTurn() {
        if (!this.isActive || !this.gameState?.player) return;
        console.log(`--- Player Turn ${this.turnNumber} Start ---`);
        this.playerTurn = true;
        this.currentTarget = null; // Clear target at start of turn
        this.uiManager.clearEnemyHighlights();

         // Reset turn-specific state (including lastCardPlayedType)
         this.turnState = {
            attacksPlayedThisTurn: 0,
            cardsPlayedThisTurn: 0,
            lastCardPlayedType: null,
         };

        try {
             // Player method handles gaining focus, ticking start statuses, drawing cards, artifacts, core traits
             this.gameState.player.startTurn();
        } catch (error) {
             console.error("Error during player startTurn sequence:", error);
        }

        // Update UI AFTER player turn setup
        this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);
        this.checkCombatEndCondition(); // Check if enemies died from start-of-turn effects
    }

    /** Ends the player's turn and transitions to enemy turn. */
    endPlayerTurn() {
        if (!this.isActive || !this.playerTurn || !this.gameState?.player) return;
        console.log("--- Player Turn End ---");
        this.playerTurn = false;
        this.currentTarget = null; // Ensure target is cleared
        // Do NOT reset turnState here, it resets at the start of the *next* player turn

        try {
             // Player method handles 'onTurnEnd' artifacts, ticking end statuses, discarding hand, core traits
             this.gameState.player.endTurn();
        } catch (error) {
             console.error("Error during player endTurn sequence:", error);
        }

        this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);
        this.checkCombatEndCondition(); // Check if player died from end-of-turn effects

        if (this.isActive) { // Only proceed if combat didn't end
            this.beginEnemyTurn();
        }
    }

    /** Starts the enemy turn sequence. */
    beginEnemyTurn() {
        if (!this.isActive || this.playerTurn) return;
        console.log("--- Enemy Turn Start ---");

        // Determine intents for all living enemies BEFORE any actions resolve
        this.enemies.forEach(enemy => {
            if (enemy.currentHp > 0) {
                enemy.determineNextIntent(this.gameState.player);
            }
        });

        // Update UI to show enemy intents
        this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);

        // Execute enemy actions sequentially with delays
        this.executeEnemyActionsSequentially(0);
    }

    /** Executes enemy actions one by one with delays for visual clarity. */
    async executeEnemyActionsSequentially(enemyIndex) {
        if (!this.isActive || this.playerTurn || enemyIndex >= this.enemies.length) {
            // End of enemy actions for this turn
            if (this.isActive) {
                console.log("--- Enemy Turn End ---");
                this.turnNumber++;
                this.beginPlayerTurn(); // Start next player turn
            }
            return;
        }

        const enemy = this.enemies[enemyIndex];
        let delayMs = 0;

        if (enemy && enemy.currentHp > 0) { // Check enemy exists and is alive
            console.log(`Enemy action: ${enemy.name} (${enemy.currentIntent?.description || 'No Intent'})`);
            this.uiManager.combatUI?.highlightEnemy(enemy.id, true); // Highlight acting enemy

            try {
                enemy.executeTurn(this.gameState.player, this.gameState);
                delayMs = 600;
            } catch (error) {
                 console.error(`Error during ${enemy.name}'s turn execution:`, error);
                 delayMs = 100;
            }

            // Update UI immediately after action
            this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);
            this.checkCombatEndCondition(); // Check if player died

             // Wait only if combat is still active
             if (this.isActive) {
                await this.delay(delayMs);
                this.uiManager.combatUI?.highlightEnemy(enemy.id, false); // Unhighlight after delay
             } else {
                 return; // Stop sequence if combat ended
             }

        } else { // Enemy is dead or doesn't exist
            delayMs = 50;
            await this.delay(delayMs);
        }

        // Proceed to the next enemy if combat still active
        if (this.isActive) {
            this.executeEnemyActionsSequentially(enemyIndex + 1);
        }
    }

    /** Helper for async delay */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /** Handles the player attempting to play a card (MODIFIED to update turn state). */
    handlePlayerCardPlay(card, droppedTarget = null) {
        if (!this.isActive || !this.playerTurn || !this.gameState?.player || !card) {
            console.warn("handlePlayerCardPlay called in invalid state.");
            return;
        }

        const finalTarget = this.currentTarget || droppedTarget;
        const validatedTarget = this.validateTarget(card, finalTarget);

        if (card.requiresTarget && !validatedTarget) {
            this.uiManager.showActionFeedback("Invalid target for card.", "warning");
            this.currentTarget = null;
            this.uiManager.clearEnemyHighlights();
            return; // Abort play
        }

        // Player.playCard handles cost check, effect execution, artifact triggers, status effects, core traits
        const playedSuccessfully = this.gameState.player.playCard(card, validatedTarget, this.enemies);

        // --- Update Combat State & UI ---
        if (playedSuccessfully) {
             // Increment turn state counters AFTER successful play
             this.turnState.cardsPlayedThisTurn++;
             if (card.cardType === 'Attack') { // Use cardType for consistency
                  this.turnState.attacksPlayedThisTurn++;
             }
             // Record the type of the card just played
             this.turnState.lastCardPlayedType = card.cardType;

             console.log(`Combat Turn State Updated: Cards=${this.turnState.cardsPlayedThisTurn}, Attacks=${this.turnState.attacksPlayedThisTurn}, LastType=${this.turnState.lastCardPlayedType}`);

            this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);
            this.checkCombatEndCondition(); // Check if combat ended after card effect
        } else {
            // Feedback handled within Player.playCard / UIManager
            console.log(`Card play failed: ${card.name}`);
        }

        // Clear target selection AFTER the play attempt resolves
        this.currentTarget = null;
        this.uiManager.clearEnemyHighlights();
    }

    /** Sets the currently selected enemy target. */
    setSelectedTarget(enemy) {
        if (!this.playerTurn) return; // Can only target on player turn
        if (enemy && enemy.currentHp > 0) {
            if (this.currentTarget === enemy) {
                 // Clicking the same target again deselects it
                 this.currentTarget = null;
                 console.log(`Deselected target: ${enemy.name}`);
            } else {
                 this.currentTarget = enemy;
                 console.log(`Selected target: ${enemy.name}`);
            }
            // UI highlighting is handled by the renderEnemies call in CombatUI.update or directly
            this.uiManager.combatUI?.renderEnemies(this.enemies, this.playerTurn); // Re-render to show/clear highlight
        } else if (enemy === null) { // Explicitly clearing target
             this.currentTarget = null;
             this.uiManager.combatUI?.renderEnemies(this.enemies, this.playerTurn); // Re-render to clear highlight
        }
        // Ignore clicks on dead enemies
    }

    /** Validates if the chosen target is appropriate for the card. */
    validateTarget(card, target) {
        if (!card) return null;

        if (!card.requiresTarget) { return null; } // No target needed
        if (card.targetType === 'self') { return this.gameState.player; } // Target self

        if (card.targetType === 'enemy') {
            // Check if target exists, is an enemy, is alive, and is in the current enemy list
            if (target && target instanceof Enemy && target.currentHp > 0 && this.enemies.includes(target)) {
                 return target; // Valid enemy target
             } else {
                 return null; // Invalid enemy target
             }
        }
        console.warn(`Card ${card.name} requires target, but targetType unclear or target invalid.`);
        return null;
    }

    /** Checks if combat should end (all enemies defeated or player defeated). */
    checkCombatEndCondition() {
        if (!this.isActive) return;

        const livingEnemies = this.getActiveEnemies();
        if (livingEnemies.length === 0) {
            console.log("All enemies defeated!");
            this.endCombat(true); // Victory
        } else if (this.gameState.player && this.gameState.player.currentIntegrity <= 0) {
            console.log("Player defeated!");
            this.endCombat(false); // Defeat
        }
    }

    /** Returns an array of enemies currently alive. */
    getActiveEnemies() {
        return this.enemies.filter(enemy => enemy && enemy.currentHp > 0);
    }

    /** Getter for the current turn state (used by artifacts etc.) */
    getTurnState() {
        return { ...this.turnState }; // Return a copy
    }

} // End CombatManager class
