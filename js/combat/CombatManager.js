// js/combat/CombatManager.js

// Import necessary classes
import { Enemy } from './Enemy.js';
// Assume GameState provides access to Player and DeckManager if needed
// import { GameState } from '../core/GameState.js';
// import { Player } from '../core/Player.js'; // Likely accessed via GameState
// import { Card } from '../core/Card.js'; // Needed for type checking potentially

/**
 * Manages the state and flow of a single combat encounter.
 */
export class CombatManager {
    constructor(gameState, uiManager) {
        this.gameState = gameState; // Reference to the main game state
        this.uiManager = uiManager; // Reference to the UI manager for updates
        this.isActive = false;
        this.enemies = []; // Array of Enemy instances
        this.playerTurn = true; // Start with player's turn
        this.turnNumber = 0;

        // Combat queue/timing variables (optional for animations/delays)
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
        this.playerTurn = true; // Player always goes first?

        // --- Spawn Enemies ---
        this.enemies = enemyIds.map((id, index) => new Enemy(id, index)); // Create Enemy instances
        if (this.enemies.some(e => e.enemyType === 'error')) {
            console.error("CombatManager: Error creating one or more enemies. Aborting combat start.");
            this.isActive = false;
            this.enemies = [];
            // TODO: Handle this error more gracefully (return to map?)
            return;
        }
        console.log("Enemies spawned:", this.enemies.map(e => e.name));

        // --- Player Combat Setup ---
        this.gameState.player.startCombat(); // Resets block, draws initial hand, gains focus

        // --- UI Setup ---
        this.uiManager.showScreen('combatScreen');
        this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);

        console.log(`--- Combat Start --- Floor ${this.gameState.currentFloor}, Turn ${this.turnNumber}`);
        this.beginPlayerTurn();
    }

    /**
     * Ends the current combat encounter.
     * @param {boolean} victory - Whether the player won the combat.
     */
    endCombat(victory) {
        if (!this.isActive) return;
        console.log(`CombatManager: Ending combat. Victory: ${victory}`);
        this.isActive = false;

        // Clear enemy references
        this.enemies = [];

        // TODO: Player end-of-combat cleanup (remove temporary statuses?)

        // Trigger GameState to handle post-combat (rewards, map progression)
        this.gameState.handleCombatEnd(victory); // Need to add this method to GameState
    }

    /**
     * Initiates the player's turn sequence.
     */
    beginPlayerTurn() {
        if (!this.isActive || !this.playerTurn) return;
        console.log(`--- Player Turn ${this.turnNumber} ---`);

        // Player start-of-turn logic (block reset, focus gain, draw, status ticks)
        this.gameState.player.startTurn();

        // Update UI to reflect player turn, new hand, stats, enemy intents
        this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);
        this.uiManager.enablePlayerInput(true); // Allow card playing
    }

    /**
     * Ends the player's turn and transitions to the enemy turn.
     */
    endPlayerTurn() {
        if (!this.isActive || !this.playerTurn) return;
        console.log("CombatManager: Ending player turn.");
        this.uiManager.enablePlayerInput(false); // Disable card playing

        // Player end-of-turn logic (discard hand, status ticks)
        this.gameState.player.endTurn();

        // Check if combat ended due to player actions (e.g., self-damage defeat)
        if (this.checkCombatEndCondition()) {
             return; // endCombat will be called by checkCombatEndCondition
        }


        this.playerTurn = false;
        this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn); // Show it's enemy turn

        // Small delay before enemies act?
        setTimeout(() => {
             this.beginEnemyTurn();
        }, 500); // 0.5 second delay
    }

    /**
     * Initiates the enemy turn sequence.
     */
    beginEnemyTurn() {
        if (!this.isActive || this.playerTurn) return;
        console.log(`--- Enemy Turn ${this.turnNumber} ---`);

        // Process enemy actions sequentially
        this.executeEnemyActions();
    }

    /**
     * Executes actions for all active enemies.
     * Could be implemented with delays for visual pacing.
     */
    executeEnemyActions() {
        // Simple immediate execution for now
        this.enemies.forEach(enemy => {
            if (enemy.currentHp > 0 && this.isActive) { // Check if enemy is alive and combat is still active
                 enemy.executeTurn(this.gameState.player, this.gameState);
                 // Check if player was defeated after this enemy's action
                 if (this.checkCombatEndCondition()) {
                      return; // Stop processing further enemy actions if combat ended
                 }
            }
        });

         // Check if combat ended (e.g., player defeated) before proceeding
        if (!this.isActive) return;

         console.log("CombatManager: All enemies acted.");
        this.endEnemyTurn();
    }

    /**
     * Ends the enemy turn and transitions back to the player turn.
     */
    endEnemyTurn() {
        if (!this.isActive || this.playerTurn) return;
        console.log("CombatManager: Ending enemy turn.");

        this.turnNumber++;
        this.playerTurn = true;


        // Check if combat ended (e.g., all enemies defeated after their turn)
        if (this.checkCombatEndCondition()) {
             return; // endCombat will be called
        }


        // Small delay before player turn starts?
        setTimeout(() => {
            this.beginPlayerTurn();
        }, 500);
    }

    /**
     * Handles the player attempting to play a card.
     * @param {Card} card - The card object being played.
     * @param {Enemy | null} target - The chosen enemy target, if any.
     */
    handlePlayerCardPlay(card, target = null) {
        if (!this.isActive || !this.playerTurn) {
            console.warn("Cannot play card: Not player's turn or combat inactive.");
            return;
        }
        if (!card) {
            console.error("handlePlayerCardPlay: Invalid card provided.");
            return;
        }
        if (card.requiresTarget && !target) {
            console.warn(`Card ${card.name} requires a target, but none selected.`);
             // TODO: Add UI feedback to prompt target selection
            return;
        }
        if (card.requiresTarget && target?.currentHp <= 0) {
             console.warn(`Cannot target defeated enemy ${target.name}.`);
             return;
        }

        const player = this.gameState.player;

        // Attempt to play the card via Player class (checks focus)
        const playedSuccessfully = player.playCard(card, target, this.enemies); // Pass enemies for AOE logic

        if (playedSuccessfully) {
            console.log(`Player successfully played: ${card.name}`);
            // Card effect execution happens within player.playCard() calling card.executeEffect()

            // Update UI after card resolution
            this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);

            // Check if combat ended immediately after card play (e.g., last enemy defeated)
            this.checkCombatEndCondition();

        } else {
            console.log(`Failed to play card: ${card.name} (likely due to insufficient Focus).`);
            // TODO: Provide UI feedback (e.g., shake card, red flash)
        }
    }

     /**
      * Checks if the combat should end (player defeat or all enemies defeat).
      * Calls endCombat if conditions are met.
      * @returns {boolean} True if combat ended, false otherwise.
      */
     checkCombatEndCondition() {
         if (!this.isActive) return false; // Already ended

         // Check player defeat
         if (this.gameState.player.currentIntegrity <= 0) {
             console.log("Combat Check: Player Defeated!");
             this.endCombat(false); // Player lost
             return true;
         }

         // Check enemy defeat
         const allEnemiesDefeated = this.enemies.every(enemy => enemy.currentHp <= 0);
         if (allEnemiesDefeated) {
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
