// js/combat/CombatManager.js

import { Enemy } from './Enemy.js';
// No longer need direct Player/GameState imports if accessed via this.gameState
// import { GameState } from '../core/GameState.js';
// import { Player } from '../core/Player.js';
// import { Card } from '../core/Card.js';

/**
 * Manages the state and flow of a single combat encounter.
 */
export class CombatManager {
    constructor(gameState, uiManager) {
        if (!gameState) throw new Error("CombatManager requires a GameState instance.");
        if (!uiManager) throw new Error("CombatManager requires a UIManager instance.");

        this.gameState = gameState; // Reference to the main game state
        this.uiManager = uiManager; // Reference to the UI manager for updates
        this.isActive = false;
        this.enemies = [];
        this.playerTurn = true;
        this.turnNumber = 0;
        this.currentRewardData = null; // Store pending rewards if needed between states

        // Combat queue/timing variables (optional)
        this.actionQueue = [];
        this.processingQueue = false;

        console.log("CombatManager initialized.");
    }

    /**
     * Starts a new combat encounter.
     * @param {string[]} enemyIds - An array of enemy template IDs to spawn.
     */
    startCombat(enemyIds) {
        if (this.isActive) {
            console.warn("CombatManager: Cannot start combat, already active.");
            return;
        }
        console.log("CombatManager: Starting combat...");
        this.isActive = true;
        this.turnNumber = 1;
        this.playerTurn = true;
        this.currentRewardData = null; // Clear any previous reward data

        // --- Spawn Enemies ---
        this.enemies = enemyIds.map((id, index) => new Enemy(id, index));
        if (this.enemies.some(e => e.enemyType === 'error')) {
            console.error("CombatManager: Error creating one or more enemies. Aborting combat start.");
            this.isActive = false;
            this.enemies = [];
            // TODO: Handle this error (e.g., tell GameState to complete the node with an error state?)
            this.gameState.completeNode(this.gameState.mapManager?.currentNodeId, { error: "Enemy spawn failed" });
            this.uiManager.showScreen('mapScreen'); // Go back to map
            return;
        }
        console.log("Enemies spawned:", this.enemies.map(e => e.name));

        // --- Player Combat Setup ---
        // Ensure player exists before calling startCombat
        if (!this.gameState.player) {
             console.error("CombatManager: Player object not found in GameState!");
             this.isActive = false;
             this.enemies = [];
             return;
        }
        this.gameState.player.startCombat(); // Resets block, draws initial hand, gains focus, triggers artifacts

        // --- UI Setup ---
        this.uiManager.showScreen('combatScreen');
        // Initial UI update is now triggered by beginPlayerTurn
        // this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);

        console.log(`--- Combat Start --- Floor ${this.gameState.currentFloor}, Turn ${this.turnNumber}`);
        this.beginPlayerTurn(); // Start the first player turn
    }

    /**
     * Ends the current combat encounter.
     * Clean state and delegate back to GameState for rewards/progression.
     * @param {boolean} victory - Whether the player won the combat.
     */
    endCombat(victory) {
        if (!this.isActive) return;
        console.log(`CombatManager: Ending combat. Victory: ${victory}`);
        this.isActive = false;

        // Player end-of-combat artifact triggers
        this.gameState.player?.triggerArtifacts('onCombatEnd', { victory: victory });

        // Clear enemy references and UI elements potentially associated with them
        this.enemies = [];
        this.uiManager?.enemyArea?.replaceChildren(); // Clear enemy display explicitly


        // Delegate back to GameState to handle post-combat logic (rewards, map state)
        // This is crucial - CombatManager shouldn't handle rewards directly.
        this.gameState.handleCombatEnd(victory);
    }

    /**
     * Initiates the player's turn sequence.
     */
    beginPlayerTurn() {
        if (!this.isActive || !this.playerTurn) return;
        console.log(`--- Player Turn ${this.turnNumber} ---`);

        // Player start-of-turn logic (block reset, focus gain, draw, status ticks, artifacts)
        // This is already called within player.startTurn()
        this.gameState.player.startTurn();

        // Update UI AFTER player startTurn logic has resolved
        this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);
        this.uiManager.enablePlayerInput(true);
    }

    /**
     * Ends the player's turn and transitions to the enemy turn.
     * Called by UI (End Turn Button) or potentially automatically.
     */
    endPlayerTurn() {
        if (!this.isActive || !this.playerTurn) return;
        console.log("CombatManager: Ending player turn.");
        this.uiManager.enablePlayerInput(false);

        // Player end-of-turn logic (artifacts, status ticks, discard hand)
        // This is already called within player.endTurn()
        this.gameState.player.endTurn();

        // Check if combat ended due to player actions (e.g., end-of-turn damage/effects)
        if (this.checkCombatEndCondition()) {
             return; // endCombat will handle the rest
        }

        this.playerTurn = false;
        this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn); // Show it's enemy turn

        // Use setTimeout for a slight delay before enemies act for better pacing
        setTimeout(() => {
             // Double check combat didn't end during the delay (e.g., player disconnected)
             if (this.isActive) {
                 this.beginEnemyTurn();
             }
        }, 600); // Adjust delay as needed (e.g., 600ms)
    }

    /**
     * Initiates the enemy turn sequence.
     */
    beginEnemyTurn() {
        if (!this.isActive || this.playerTurn) return;
        console.log(`--- Enemy Turn ${this.turnNumber} ---`);

        // Process enemy actions (can add delays between actions here if desired)
        this.executeEnemyActionsSequentially(); // Changed to sequential execution
    }

    /**
     * Executes actions for all active enemies one by one with delays.
     */
    async executeEnemyActionsSequentially() {
        const activeEnemies = this.enemies.filter(enemy => enemy.currentHp > 0);
        for (const enemy of activeEnemies) {
            if (!this.isActive) break; // Stop if combat ended mid-turn

            console.log(`CombatManager: ${enemy.name} is acting...`);
            // Optional: Add UI highlight for acting enemy
            this.uiManager.highlightEnemy(enemy.id, true);

            enemy.executeTurn(this.gameState.player, this.gameState); // Enemy performs its action

            // Update UI after each enemy action to show damage/status changes immediately
             this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);


            // Check if combat ended after this enemy's action
            if (this.checkCombatEndCondition()) {
                this.uiManager.highlightEnemy(enemy.id, false); // Remove highlight
                return; // Exit loop if combat ended
            }

             // Optional: Remove highlight after action + delay
             await this.delay(500); // Wait 0.5s before next enemy acts (adjust delay)
             this.uiManager.highlightEnemy(enemy.id, false);

        }

        // If loop completes and combat is still active, end the enemy turn
        if (this.isActive) {
             console.log("CombatManager: All enemies acted.");
             this.endEnemyTurn();
        }
    }

     /** Async delay helper */
     delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
     }


    /**
     * Ends the enemy turn and transitions back to the player turn.
     */
    endEnemyTurn() {
        if (!this.isActive || this.playerTurn) return;
        console.log("CombatManager: Ending enemy turn.");

        this.turnNumber++;
        this.playerTurn = true;

        // Check if combat ended (e.g., all enemies defeated via statuses after their turn)
        if (this.checkCombatEndCondition()) {
             return; // endCombat will handle the rest
        }

        // Use setTimeout for a slight delay before player turn starts
        setTimeout(() => {
             if (this.isActive) {
                this.beginPlayerTurn();
             }
        }, 600); // Adjust delay
    }

    /**
     * Handles the player attempting to play a card via UIManager interaction (e.g., drop).
     * @param {Card} card - The card object being played.
     * @param {Enemy | null} target - The chosen enemy target, if any.
     */
    handlePlayerCardPlay(card, target = null) {
        if (!this.isActive || !this.playerTurn) {
            console.warn("Cannot play card: Not player's turn or combat inactive.");
            this.uiManager.showActionFeedback("Not your turn!", "error"); // Added UI feedback
            return;
        }
        if (!card) {
            console.error("handlePlayerCardPlay: Invalid card provided.");
            return;
        }

        // Validate target based on card requirements and target health
        const actualTarget = this.validateTarget(card, target);
        if (card.requiresTarget && !actualTarget) {
             // validateTarget logs the specific warning
             this.uiManager.showActionFeedback("Invalid target selected.", "warning"); // Added UI feedback
             return; // Stop if required target is invalid
        }


        const player = this.gameState.player;

        // Attempt to play the card via Player class
        // Player.playCard now handles focus check, effect execution, artifact triggers, discard/exhaust
        const playedSuccessfully = player.playCard(card, actualTarget, this.enemies);

        if (playedSuccessfully) {
            console.log(`CombatManager: Player successfully played: ${card.name}`);

            // Update UI AFTER card resolution (Player/Enemy stats, hand)
            // Use a slight delay for effects to visually register before UI snaps back? Optional.
            // setTimeout(() => {
                 this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);
                 // Check if combat ended immediately after card play
                 this.checkCombatEndCondition();
            // }, 100); // Small delay e.g., 100ms


        } else {
            console.log(`Failed to play card: ${card.name} (likely due to insufficient Focus).`);
            this.uiManager.showActionFeedback("Not enough Focus!", "error"); // Added UI feedback
        }
    }

     /**
      * Validates if the chosen target is appropriate for the card.
      * @param {Card} card
      * @param {Enemy | null} target
      * @returns {Enemy | null} The validated target or null if invalid.
      */
      validateTarget(card, target) {
         if (!card.requiresTarget) {
             return null; // No target needed, validation passes
         }
         if (!target) {
              console.warn(`Card ${card.name} requires a target, but none provided.`);
             return null;
         }
         if (target.currentHp <= 0) {
              console.warn(`Cannot target defeated enemy ${target.name}.`);
              return null;
         }
         // TODO: Add checks if card targets allies vs enemies, if relevant later
         return target; // Target is valid
     }

    /**
      * Checks if the combat should end and calls endCombat if necessary.
      * Now checks isActive flag first.
      * @returns {boolean} True if combat ended, false otherwise.
      */
     checkCombatEndCondition() {
         if (!this.isActive) {
            // console.log("Combat Check: Already inactive.");
            return true; // Already ended, don't call endCombat again
         }

         // Check player defeat
         if (this.gameState.player && this.gameState.player.currentIntegrity <= 0) {
             console.log("Combat Check: Player Defeated!");
             this.endCombat(false); // Player lost
             return true;
         }

         // Check enemy defeat (ensure enemies array exists)
         if (this.enemies && this.enemies.length > 0 && this.enemies.every(enemy => enemy.currentHp <= 0)) {
             console.log("Combat Check: All Enemies Defeated!");
             this.endCombat(true); // Player won
             return true;
         }

         return false; // Combat continues
     }

    // --- Getters ---
    getActiveEnemies() {
        return this.enemies.filter(enemy => enemy.currentHp > 0);
    }

} // End of CombatManager class
