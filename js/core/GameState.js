// js/core/GameState.js

// Import necessary classes (will be created later)
// import { Player } from './Player.js';
// import { MapManager } from '../map/MapManager.js';
// import { CombatManager } from '../combat/CombatManager.js';
// import * as Data from '../data.js'; // Assuming data.js is one level up

/**
 * Manages the state for a single game run.
 */
export class GameState {
    constructor(playerData = null, metaProgression = null) {
        console.log("Initializing GameState for a new run...");

        this.player = null; // Placeholder for the Player object
        // this.player = new Player(playerData, metaProgression); // Example instantiation

        // this.mapManager = new MapManager(this); // Manages map generation and current node
        this.mapManager = null; // Placeholder

        // this.combatManager = new CombatManager(this); // Manages active combat
        this.combatManager = null; // Placeholder

        this.currentFloor = 0;
        this.currentRunSeed = Date.now(); // Simple seed for potential procedural generation consistency
        this.runActive = false;
        this.currentEvent = null; // Holds data for the active non-combat node event
        this.currentShop = null; // Holds data for the active shop node
        this.currentRestSite = null; // Holds data for the active rest site node

        // Potential future state variables:
        // this.activeEffects = []; // Run-wide status effects (e.g., from map hazards)
        // this.ascensionLevel = metaProgression ? metaProgression.currentAscension : 0;

        console.log(`GameState created with seed: ${this.currentRunSeed}`);
    }

    startRun(playerData, metaProgression) {
        console.log("GameState: Starting new run...");
        this.runActive = true;
        this.currentFloor = 1; // Start on floor 1

        // --- Player Initialization ---
        // TODO: Replace placeholder with actual Player class instantiation
        // For now, create a simple placeholder object
        this.player = {
            name: playerData?.name || "Alchemist",
            integrity: playerData?.integrity || 100,
            maxIntegrity: playerData?.maxIntegrity || 100,
            focus: playerData?.focus || 3,
            maxFocus: playerData?.maxFocus || 3,
            insight: 0, // Insight gained during the run
            deck: [...(playerData?.startingDeck || this.getDefaultDeck())], // Copy starting deck
            hand: [],
            discard: [],
            artifacts: [...(playerData?.startingArtifacts || [])],
            attunements: { ... (playerData?.attunements || this.getDefaultAttunements()) },
            // Placeholder methods needed by other systems
            drawCards: (num) => console.log(`Placeholder: Draw ${num} cards`),
            gainBlock: (amount) => console.log(`Placeholder: Gain ${amount} block`),
            takeDamage: (amount) => {
                console.log(`Placeholder: Player takes ${amount} damage`);
                this.player.integrity -= amount;
                if (this.player.integrity <= 0) {
                    console.log("Placeholder: Player defeated!");
                    this.endRun(false); // Player lost
                }
            },
            heal: (amount) => {
                console.log(`Placeholder: Player heals ${amount} integrity`);
                this.player.integrity = Math.min(this.player.maxIntegrity, this.player.integrity + amount);
            },
             getStatus: (statusId) => null, // Placeholder
             applyStatus: (statusId, duration) => console.log(`Placeholder: Apply status ${statusId} for ${duration} turns`),
             removeStatus: (statusId) => console.log(`Placeholder: Remove status ${statusId}`),

        };
        console.log("Player Initialized:", this.player);

        // --- Map Initialization ---
        // TODO: Replace placeholder with actual MapManager instantiation
        this.mapManager = {
            currentFloor: 1,
            currentNode: null,
            mapData: null, // Will hold generated map structure
            generateFloor: (floorNum) => {
                console.log(`Placeholder MapManager: Generating floor ${floorNum}...`);
                // TODO: Implement actual map generation logic
                this.mapManager.mapData = { nodes: [], connections: [] }; // Minimal structure
                // Set starting node?
                return this.mapManager.mapData;
            },
            moveToNode: (nodeId) => {
                console.log(`Placeholder MapManager: Moving to node ${nodeId}...`);
                // TODO: Implement node transition logic
                this.mapManager.currentNode = { id: nodeId, type: 'placeholder' }; // Update current node
                // Trigger node interaction (combat, event, etc.)
            }
        };
        this.mapManager.generateFloor(this.currentFloor);

        // --- Combat Initialization ---
        // TODO: Replace placeholder with actual CombatManager instantiation
         this.combatManager = {
            isActive: false,
            enemies: [],
            playerTurn: true,
            startCombat: (enemies) => {
                console.log(`Placeholder CombatManager: Starting combat with enemies:`, enemies);
                this.combatManager.isActive = true;
                this.combatManager.enemies = enemies; // Assume enemies are passed in
                this.combatManager.playerTurn = true;
                // Trigger start-of-combat effects, draw initial hand etc.
            },
            endCombat: (victory) => {
                console.log(`Placeholder CombatManager: Ending combat. Victory: ${victory}`);
                this.combatManager.isActive = false;
                this.combatManager.enemies = [];
                // Handle rewards or game over
            }
        };


        // Ready for the player to interact with the map
    }

    endRun(victory) {
        if (!this.runActive) return; // Prevent ending twice

        console.log(`GameState: Ending run. Victory: ${victory}`);
        this.runActive = false;

        // TODO: Award meta-progression (Insight) based on run performance
        // Example: metaProgression.addInsight(this.player.insight);
        // TODO: Record stats, unlock milestones
        // TODO: Save meta-progression
        // metaProgression.save();

        // TODO: Transition back to the main menu or show a run summary screen
        // showScreen('mainMenuScreen'); // Needs access to showScreen function
        alert(`Run Ended. Victory: ${victory}. You gained ${this.player.insight} Insight this run (placeholder).`);
    }

    // --- Utility Methods ---

    // Placeholder for getting default starter deck if no player data
    getDefaultDeck() {
        // TODO: Select a few basic cards from Data.concepts
        // Example: Find 'Vanilla Sex', 'Sensual Touch' IDs
        return [1, 2, /* ... more basic card IDs */];
    }

    // Placeholder for default attunements
    getDefaultAttunements() {
        return {
            Attraction: 5, Interaction: 5, Sensory: 5, Psychological: 5,
            Cognitive: 5, Relational: 5, RoleFocus: 5
        };
    }

    getCurrentNode() {
        return this.mapManager?.currentNode;
    }

    // Add more methods as needed to manage transitions between states (map -> combat, combat -> rewards, etc.)
    enterCombat(enemyList) {
        if (this.combatManager && !this.combatManager.isActive) {
            // TODO: Define how enemyList is structured (e.g., array of enemy IDs or configurations)
            const enemies = enemyList.map(enemyId => ({ id: enemyId, hp: 50, /* other stats */ })); // Placeholder enemy creation
             this.combatManager.startCombat(enemies);
             // TODO: Transition UI to combat screen
             // showScreen('combatScreen');
             // TODO: Update Combat UI
        }
    }

     completeNode(nodeId) {
        console.log(`GameState: Completing node ${nodeId}`);
        // Award standard node completion rewards?
        // Ready for player to select next node on map
         // TODO: Update Map UI to show completed node and available next steps
     }

}
