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

        // NEW: State tracking for the current turn (reset each player turn)
        this.turnState = {
            attacksPlayedThisTurn: 0,
            cardsPlayedThisTurn: 0,
            // Add other turn-specific flags as needed
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

        // --- Spawn Enemies ---
        enemyIds.forEach((id, index) => {
            try {
                const enemyInstance = new Enemy(id, index); // Create new instance
                this.enemies.push(enemyInstance);
                // --- Trigger for Enemy Spawn ---
                this.gameState.player?.triggerArtifacts('onEnemySpawn', { enemy: enemyInstance });
            } catch (error) {
                 console.error(`CombatManager: Failed to spawn enemy with ID ${id}:`, error);
                 // Maybe replace with a placeholder or skip? Skipping is safer.
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
        // Player.startCombat handles deck reset, status clear, drawing initial hand, and 'onCombatStart' artifacts
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
            // Trigger player artifacts BEFORE cleaning statuses
            this.gameState.player?.triggerArtifacts('onCombatEnd', { victory: victory });
            // Trigger general victory artifact if applicable
            if (victory) {
                 this.gameState.player?.triggerArtifacts('onVictory', { floor: this.gameState.currentFloor });
            }
            // Clean temporary statuses from player and living enemies
            this.gameState.player?.cleanupCombatStatuses();
            this.enemies.forEach(enemy => enemy.cleanupCombatStatuses());
        }

        // Clear combat state
        this.enemies = [];
        this.currentTarget = null;
        this.turnState = { attacksPlayedThisTurn: 0, cardsPlayedThisTurn: 0 }; // Reset turn state

        // Clear UI elements specific to this combat if necessary (often handled by UIManager switching screens)
        // this.uiManager?.enemyArea?.replaceChildren(); // Let GameState handling do this via screen change

        // Delegate back to GameState (handles rewards, screen changes, etc.)
        this.gameState.handleCombatEnd(victory);
    }

    /** Sets up the player's turn. */
    beginPlayerTurn() {
        if (!this.isActive || !this.gameState?.player) return;
        console.log(`--- Player Turn ${this.turnNumber} Start ---`);
        this.playerTurn = true;
        this.currentTarget = null; // Clear target at start of turn
        this.uiManager.clearEnemyHighlights();

         // Reset turn-specific state
         this.turnState = { attacksPlayedThisTurn: 0, cardsPlayedThisTurn: 0 };

        try {
             // Player method handles gaining focus, ticking start statuses, drawing cards, and 'onTurnStart' artifacts
             this.gameState.player.startTurn();
        } catch (error) {
             console.error("Error during player startTurn sequence:", error);
             // Potentially handle game-breaking error here
        }

        // Update UI AFTER player turn setup (including draw)
        this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);
        this.checkCombatEndCondition(); // Check if enemies died from start-of-turn effects
    }

    /** Ends the player's turn and transitions to enemy turn. */
    endPlayerTurn() {
        if (!this.isActive || !this.playerTurn || !this.gameState?.player) return;
        console.log("--- Player Turn End ---");
        this.playerTurn = false;
        this.currentTarget = null; // Ensure target is cleared

        try {
             // Player method handles 'onTurnEnd' artifacts, ticking end statuses, discarding hand
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
                enemy.determineNextIntent(this.gameState.player); // Determine intent based on current player state
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
            if (this.isActive) { // Check again if combat ended mid-turn
                console.log("--- Enemy Turn End ---");
                this.turnNumber++;
                this.beginPlayerTurn();
            }
            return;
        }

        const enemy = this.enemies[enemyIndex];
        let delayMs = 0; // Default delay

        if (enemy.currentHp > 0) {
            console.log(`Enemy action: ${enemy.name} (${enemy.currentIntent?.description || 'No Intent'})`);
            this.uiManager.combatUI.highlightEnemy(enemy.id, true); // Highlight acting enemy

            try {
                enemy.executeTurn(this.gameState.player, this.gameState);
                delayMs = 600; // Delay after successful action
            } catch (error) {
                 console.error(`Error during ${enemy.name}'s turn execution:`, error);
                 delayMs = 100; // Shorter delay on error
            }

            // Update UI immediately after action to show results
            this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);
            this.checkCombatEndCondition(); // Check if player died

             // Wait only if combat is still active
             if (this.isActive) {
                await this.delay(delayMs);
                this.uiManager.combatUI.highlightEnemy(enemy.id, false); // Unhighlight after delay
             } else {
                 return; // Stop sequence if combat ended
             }

        } else {
            delayMs = 50; // Shorter delay for dead enemies
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

    /** Handles the player attempting to play a card (e.g., via drag-drop). */
    handlePlayerCardPlay(card, droppedTarget = null) {
        if (!this.isActive || !this.playerTurn || !this.gameState?.player || !card) {
            console.warn("handlePlayerCardPlay called in invalid state.");
            return;
        }

        // Use the currently selected target OR the target the card was dropped onto
        const finalTarget = this.currentTarget || droppedTarget;
        const validatedTarget = this.validateTarget(card, finalTarget);

        // Check if targeting is required and if the target is valid
        if (card.requiresTarget && !validatedTarget) {
            this.uiManager.showActionFeedback("Invalid target for card.", "warning");
            this.currentTarget = null; // Clear selection if invalid
            this.uiManager.clearEnemyHighlights();
            return; // Abort play
        }

        // Prepare event data for artifact triggers
        const eventData = { card: card, target: validatedTarget };

        // Attempt to play the card via Player class
        // Player.playCard handles cost check, effect execution, artifact triggers (onCardPlay, onCardExhaust), and moving card to discard/exhaust
        const playedSuccessfully = this.gameState.player.playCard(card, validatedTarget, this.enemies);

        // --- Update Combat State & UI ---
        if (playedSuccessfully) {
             // Increment turn state counters AFTER successful play
             this.turnState.cardsPlayedThisTurn++;
             if (card.keywords.includes('Attack')) {
                  this.turnState.attacksPlayedThisTurn++;
             }

            this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);
            this.checkCombatEndCondition(); // Check if combat ended after card effect
        } else {
            // Feedback for failure (e.g., not enough focus) is handled within Player.playCard or UIManager
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
            this.currentTarget = enemy;
            console.log(`Selected target: ${enemy.name}`);
            // UI highlighting is handled by the renderEnemies call in CombatUI.update or directly
            this.uiManager.combatUI.renderEnemies(this.enemies, this.playerTurn); // Re-render to show highlight
        } else {
            this.currentTarget = null;
             this.uiManager.combatUI.renderEnemies(this.enemies, this.playerTurn); // Re-render to clear highlight
        }
    }

    /** Validates if the chosen target is appropriate for the card. */
    validateTarget(card, target) {
        if (!card) return null; // Should not happen

        if (!card.requiresTarget) {
            return null; // Card doesn't need a target
        }
        if (card.targetType === 'self') {
             // If card targets self, ensure no enemy target is accidentally passed
             return this.gameState.player; // Always return player for self-target
        }
        if (card.targetType === 'enemy') {
             // Check if target exists, is an enemy instance, and is alive
            if (target && target instanceof Enemy && target.currentHp > 0 && this.enemies.includes(target)) {
                 return target; // Valid enemy target
             } else {
                 return null; // Invalid enemy target
             }
        }
        // Default case if targetType is somehow invalid or not set when required
        console.warn(`Card ${card.name} requires target, but targetType is unclear or target invalid.`);
        return null;
    }

    /** Checks if combat should end (all enemies defeated or player defeated). */
    checkCombatEndCondition() {
        if (!this.isActive) return; // Don't check if already ending

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
        return { ...this.turnState }; // Return a copy to prevent direct modification
    }

} // End CombatManager class
