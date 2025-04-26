// js/main.js

// --- Imports ---
// Import all necessary classes for initialization and potential debugging access
import { GameState } from './core/GameState.js';
// Player is created by GameState, but might be useful for type checking if needed
// import { Player } from './core/Player.js';
import { UIManager } from './ui/UIManager.js';
import { MetaProgression } from './meta/MetaProgression.js';
// Import data - useful for debugging or potentially selecting starting elements
import * as Data from './data.js';
// Import definitions if needed globally (usually not, handled by specific classes)
// import { ARTIFACT_TEMPLATES } from './core/ArtifactDefinitions.js';
// import { ENEMY_TEMPLATES } from './combat/Enemy.js';

// --- Global Variables (Module Scope) ---
let uiManager = null;
let metaProgression = null;
let currentGameState = null; // Holds the GameState for the ACTIVE run

// --- Game Initialization ---
function initializeGame() {
    console.log("===============================");
    console.log("Initializing Persona Labyrinth...");
    console.log("===============================");

    try {
        // 1. Initialize Meta Progression (Loads save data)
        console.log("Initializing MetaProgression...");
        metaProgression = new MetaProgression();
        console.log(`MetaProgression loaded. Total Insight: ${metaProgression.totalInsight}`);

        // 2. Initialize UI Manager
        console.log("Initializing UIManager...");
        // Ensure the gameContainer exists before proceeding
        const gameContainer = document.getElementById('gameContainer');
        if (!gameContainer) {
            throw new Error("Fatal Error: #gameContainer element not found in HTML!");
        }
        uiManager = new UIManager('gameContainer');

        // 3. Setup initial event listeners using UIManager references
        console.log("Setting up Main Menu Listeners...");
        setupMainMenuListeners();

        // 4. Show the main menu initially
        uiManager.showScreen('mainMenuScreen');

        // --- Optional: Make core objects globally accessible for debugging ---
        window.personaLab = {
            uiManager,
            metaProgression,
            getGameState: () => currentGameState, // Use function to get potentially null state
            Data, // Expose Data object
            // Add helper functions for debugging?
            startGame: startNewRun,
            resetMeta: () => { if(confirm("Reset ALL meta progress?")) metaProgression?.resetProgress(); },
            addInsight: (amount = 100) => metaProgression?.addInsight(amount)
        };
        // --- End Debugging ---

        console.log("===============================");
        console.log("Game Initialized. Welcome!");
        console.log("Access debug tools via `window.personaLab` in console.");
        console.log("===============================");


    } catch (error) {
        console.error("FATAL ERROR during game initialization:", error);
        // Display error to the user if possible
        const body = document.querySelector('body');
        if (body) {
            body.innerHTML = `<div style="color: red; padding: 30px; font-family: sans-serif;">
                <h1>Initialization Error</h1>
                <p>Persona Labyrinth could not start.</p>
                <pre>${error.message}\n${error.stack}</pre>
                <p>Please check the console for details.</p>
            </div>`;
        }
    }
}

// --- Event Listeners Setup ---
function setupMainMenuListeners() {
    if (!uiManager) return; // Should not happen if init order is correct

    // Use direct references from UIManager instance
    if (uiManager.startGameButton) {
        uiManager.startGameButton.onclick = startNewRun; // Assign function directly
    } else { console.error("Start Game button not found in UIManager!"); }

    if (uiManager.loadGameButton) {
        uiManager.loadGameButton.onclick = () => {
            uiManager.showActionFeedback("Load Game not implemented yet.", "info");
            console.log("Load Game Clicked (Not Implemented)");
        };
    }

    if (uiManager.metaProgressionButton) {
         uiManager.metaProgressionButton.onclick = () => {
             console.log("Showing Meta Screen...");
             // UIManager now handles rendering the content within showScreen
             uiManager.showScreen('metaScreen');
         };
     } else { console.error("Meta Progression button not found in UIManager!"); }

     if (uiManager.backToMenuButton) { // Listener for button ON the meta screen
          uiManager.backToMenuButton.onclick = () => uiManager.showScreen('mainMenuScreen');
     } else { console.warn("Meta screen 'Back' button not found in UIManager!"); }


    if (uiManager.settingsButton) {
        uiManager.settingsButton.onclick = () => {
             uiManager.showActionFeedback("Settings not implemented yet.", "info");
             console.log("Settings Clicked (Not Implemented)");
        };
    }
}

// --- Game Flow Functions ---
function startNewRun() {
    console.log(">>> Starting New Run <<<");

    // Cleanup previous run state if it exists
    if (currentGameState && currentGameState.runActive) {
        console.warn("Ending previous active run before starting new one.");
        // Silently end without showing end screen? Or prompt user?
        currentGameState.cleanupRun(); // Clean up references
    }
    currentGameState = null; // Ensure it's clear

    if (!metaProgression || !uiManager) {
        console.error("Cannot start run: MetaProgression or UIManager not initialized!");
        alert("Error: Core systems not ready. Cannot start run.");
        return;
    }

    // --- Get Starting Player Data ---
    // Incorporate meta bonuses and potentially chosen archetype/loadout later
    const startingPlayerData = {
        name: "The Alchemist", // Default or allow input later
        maxIntegrity: metaProgression.getStartingBonus('baseIntegrity') + metaProgression.getStartingBonus('maxIntegrityBonus'),
        attunements: metaProgression.getDefaultAttunements(), // Apply bonuses inside Player constructor now
        startingDeck: metaProgression.getDefaultDeckIds(), // Get default starter deck IDs
        startingArtifacts: [], // Add starting artifacts based on meta unlocks?
         // Example: if (metaProgression.isArtifactUnlocked('starting_relic_id')) startingPlayerData.startingArtifacts.push('starting_relic_id');
    };

    try {
        // 1. Create & Initialize GameState for the new run
        currentGameState = new GameState(startingPlayerData, metaProgression, uiManager);
        // Pass references again to startRun, ensuring they are set within GameState
        currentGameState.startRun(startingPlayerData, metaProgression, uiManager);

        // 2. Link UIManager back to GameState for callbacks
        uiManager.setReferences(currentGameState, metaProgression);

        // 3. Transition to Map Screen (already handled by GameState.startRun -> MapManager.generateFloor -> UIManager.renderMap)
        uiManager.showScreen('mapScreen');

        // 4. Check initial state-based milestones
        metaProgression.checkStateBasedMilestones(currentGameState);

        console.log(">>> New Run Successfully Started <<<");

    } catch (error) {
        console.error("Error during run start:", error);
        uiManager.showModal(`<h2>Run Start Error</h2><p>Failed to initialize the run.</p><pre>${error.message}</pre>`, [{ text: 'Return to Menu', callback: () => uiManager.showScreen('mainMenuScreen') }]);
        currentGameState = null; // Clear broken game state
    }
}

// --- Main Execution ---
// Use DOMContentLoaded to ensure HTML is ready before running JS
document.addEventListener('DOMContentLoaded', initializeGame);
