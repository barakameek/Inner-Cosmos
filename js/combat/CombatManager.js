// js/combat/CombatManager.js

import { Enemy } from './Enemy.js';
// No direct imports needed if GameState and UIManager are passed in constructor

/**
 * Manages the state and flow of a single combat encounter.
 */
export class CombatManager {
    constructor(gameState, uiManager) {
        if (!gameState) throw new Error("CombatManager requires a GameState instance.");
        if (!uiManager) throw new Error("CombatManager requires a UIManager instance.");

        this.gameState = gameState;
        this.uiManager = uiManager;
        this.isActive = false;
        this.enemies = [];
        this.playerTurn = true;
        this.turnNumber = 0;
        this.currentTarget = null; // Store the currently selected enemy target

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
        if (!this.gameState || !this.uiManager || !this.gameState.player) {
             console.error("CombatManager: Cannot start combat - GameState, UIManager, or Player missing.");
             return;
        }

        console.log("CombatManager: Starting combat...");
        this.isActive = true;
        this.turnNumber = 1;
        this.playerTurn = true;
        this.currentTarget = null; // Reset target at combat start

        // Spawn Enemies
        this.enemies = enemyIds.map((id, index) => new Enemy(id, index));
        if (this.enemies.some(e => e.enemyType === 'error')) {
            console.error("CombatManager: Error creating enemies. Aborting combat.");
            this.isActive = false;
            this.enemies = [];
            this.gameState.completeNode(this.gameState.mapManager?.currentNodeId, { error: "Enemy spawn failed" });
            this.uiManager.showScreen('mapScreen');
            return;
        }
        console.log("Enemies spawned:", this.enemies.map(e => e.name));

        // Player Combat Setup (triggers artifacts, draws hand, etc.)
        this.gameState.player.startCombat();

        // UI Setup - Show screen FIRST, then start turn which updates UI
        this.uiManager.showScreen('combatScreen');
        this.beginPlayerTurn(); // Start the first player turn (which calls updateCombatUI)

        console.log(`--- Combat Start --- Floor ${this.gameState.currentFloor}, Turn ${this.turnNumber}`);
    }

    /**
     * Ends the current combat encounter.
     * @param {boolean} victory - Whether the player won the combat.
     */
    endCombat(victory) {
        if (!this.isActive) return; // Prevent double execution
        console.log(`CombatManager: Ending combat. Victory: ${victory}`);
        const wasActive = this.isActive; // Store state before setting false
        this.isActive = false; // Set inactive flag

        // Player end-of-combat artifact triggers (only if combat was actually active)
        if (wasActive) {
            this.gameState.player?.triggerArtifacts('onCombatEnd', { victory: victory });
        }

        this.enemies = []; // Clear enemy array
        this.currentTarget = null; // Clear target

        // Clear enemy display in UI
        this.uiManager?.enemyArea?.replaceChildren(); // Use replaceChildren for modern browsers

        // Delegate back to GameState for rewards/progression AFTER cleanup
        this.gameState.handleCombatEnd(victory);
    }

    /**
     * Initiates the player's turn sequence.
     */
    beginPlayerTurn() {
        if (!this.isActive || !this.playerTurn || !this.gameState.player) return;
        console.log(`--- Player Turn ${this.turnNumber} ---`);
        this.currentTarget = null; // Reset target selection each turn

        // Player start-of-turn logic is handled within player.startTurn()
        this.gameState.player.startTurn();

        // Update UI AFTER player logic (stats, hand, enemy intents might have changed)
        this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);
        this.uiManager.enablePlayerInput(true); // Enable card playing etc.
        this.uiManager.clearEnemyHighlights(); // Clear any lingering highlights
    }

    /**
     * Ends the player's turn and transitions to the enemy turn.
     */
    endPlayerTurn() {
        if (!this.isActive || !this.playerTurn || !this.gameState.player) return;
        console.log("CombatManager: Ending player turn.");
        this.uiManager.enablePlayerInput(false); // Disable player actions
        this.currentTarget = null; // Clear target

        // Player end-of-turn logic handled within player.endTurn()
        this.gameState.player.endTurn();

        // Check immediately if combat ended from player's end-of-turn effects
        if (this.checkCombatEndCondition()) return;

        this.playerTurn = false;
        // Update UI to show enemy turn (disables buttons, shows intents clearly)
        this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);

        setTimeout(() => {
             if (this.isActive) this.beginEnemyTurn(); // Check isActive again
        }, 600);
    }

    /**
     * Initiates the enemy turn sequence.
     */
    beginEnemyTurn() {
        if (!this.isActive || this.playerTurn) return;
        console.log(`--- Enemy Turn ${this.turnNumber} ---`);
        this.executeEnemyActionsSequentially();
    }

    /**
     * Executes actions for all active enemies sequentially with delays.
     */
    async executeEnemyActionsSequentially() {
        const activeEnemies = this.enemies.filter(enemy => enemy.currentHp > 0);
        for (const enemy of activeEnemies) {
            if (!this.isActive) break; // Stop if combat ended mid-turn

            console.log(`CombatManager: ${enemy.name} acting...`);
            this.uiManager.highlightEnemy(enemy.id, true); // Highlight acting enemy

            // Execute enemy action (which includes determining next intent *after* acting)
            enemy.executeTurn(this.gameState.player, this.gameState);

            // Update UI immediately after the action to show results
            this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);

            // Check end condition immediately after action + UI update
            if (this.checkCombatEndCondition()) {
                this.uiManager.highlightEnemy(enemy.id, false); // Ensure highlight is removed
                return; // Stop the loop
            }

            // Delay before next enemy acts
            await this.delay(700); // Slightly longer delay?
            this.uiManager.highlightEnemy(enemy.id, false); // Remove highlight
        }

        // If loop completes and combat is still active
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

        // Check if combat ended via end-of-turn effects (e.g., poison killing last enemy)
        // Note: Enemy determines its *next* intent at the end of its executeTurn action.
        if (this.checkCombatEndCondition()) return;

        setTimeout(() => {
             if (this.isActive) this.beginPlayerTurn(); // Check isActive again
        }, 600);
    }

    /**
     * Handles the player attempting to play a card via UIManager interaction.
     * Incorporates target selection state.
     * @param {Card} card - The card object being played.
     * @param {Enemy | null} droppedTarget - The enemy the card was dropped on (if any).
     */
    handlePlayerCardPlay(card, droppedTarget = null) {
        if (!this.isActive || !this.playerTurn || !this.gameState.player) {
            console.warn("Cannot play card: Not player's turn or combat inactive/player missing.");
            this.uiManager.showActionFeedback("Not your turn!", "error");
            this.currentTarget = null; // Clear dangling target ref
            this.uiManager.clearEnemyHighlights();
            return;
        }
        if (!card) {
            console.error("handlePlayerCardPlay: Invalid card provided.");
            return;
        }

        // Use the target stored from the click/drag interaction if available,
        // otherwise use the target the card was dropped on (redundant but safe)
        const finalTarget = this.currentTarget || droppedTarget;

        // Validate target based on card requirements
        const validatedTarget = this.validateTarget(card, finalTarget);
        if (card.requiresTarget && !validatedTarget) {
             // validateTarget logs the warning
             this.uiManager.showActionFeedback("Invalid target selected.", "warning");
             this.currentTarget = null; // Clear invalid target
             this.uiManager.clearEnemyHighlights();
             return; // Stop if required target is invalid
        }

        // Attempt to play the card via Player class
        const playedSuccessfully = this.gameState.player.playCard(card, validatedTarget, this.enemies);

        // Clear targeting state AFTER attempting play
        this.currentTarget = null;
        this.uiManager.clearEnemyHighlights(); // Always clear highlights after play attempt

        if (playedSuccessfully) {
            console.log(`CombatManager: Player successfully played: ${card.name}`);
            // Update UI AFTER card resolution
            this.uiManager.updateCombatUI(this.gameState.player, this.enemies, this.playerTurn);
            // Check end condition immediately
            this.checkCombatEndCondition();
        } else {
            console.log(`Failed to play card: ${card.name}`);
            // Feedback provided by Player.playCard failure or here
            // this.uiManager.showActionFeedback("Not enough Focus!", "error"); // Example feedback
        }
    }

    /**
     * Sets the currently selected enemy target (called by UI click listener).
     * @param {Enemy | null} enemy - The enemy object that was clicked, or null to clear.
     */
    setSelectedTarget(enemy) {
         if (!this.playerTurn || !this.isActive) return; // Can only target on player turn

         this.currentTarget = enemy;
         console.log(`CombatManager: Target set to ${enemy ? enemy.name : 'None'}`);

         // Update UI to visually indicate the selected target
         this.uiManager.clearEnemyHighlights(); // Clear previous highlights
         if (enemy && enemy.currentHp > 0) {
            this.uiManager.highlightEnemy(enemy.id, true);
         }
    }


     /** Validates if the chosen target is appropriate for the card. */
      validateTarget(card, target) {
         if (!card.requiresTarget) {
             return null; // No target needed
         }
         if (!target) {
              console.warn(`Card ${card.name} requires a target, but none provided or selected.`);
             return null;
         }
          // Check if the target object is actually one of the current enemies
          if (!this.enemies.some(e => e.id === target.id)) {
               console.warn(`Target ${target.name} is not a valid enemy in this combat.`);
               return null;
          }
         if (target.currentHp <= 0) {
              console.warn(`Cannot target defeated enemy ${target.name}.`);
              return null;
         }
         return target; // Target is valid
     }

    /** Checks if the combat should end and calls endCombat if necessary. */
     checkCombatEndCondition() {
         if (!this.isActive) return true; // Already ended

         // Check player defeat
         if (this.gameState.player && this.gameState.player.currentIntegrity <= 0) {
             console.log("Combat Check: Player Defeated!");
             this.endCombat(false);
             return true;
         }

         // Check enemy defeat
         if (this.enemies && this.enemies.length > 0 && this.enemies.every(enemy => enemy.currentHp <= 0)) {
             console.log("Combat Check: All Enemies Defeated!");
             this.endCombat(true);
             return true;
         }

         return false; // Combat continues
     }

    // --- Getters ---
    getActiveEnemies() {
        return this.enemies.filter(enemy => enemy.currentHp > 0);
    }

} // End of CombatManager class
