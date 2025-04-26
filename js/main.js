// js/main.js

// --- Imports ---
import { GameState } from './core/GameState.js';
import { Player } from './core/Player.js'; // Although GameState creates Player
import { UIManager } from './ui/UIManager.js';
import { MetaProgression } from './meta/MetaProgression.js';
import * as Data from './data.js';

// --- Global Variables & Constants ---
const gameContainer = document.getElementById('gameContainer');
let uiManager = null; // Will hold the UIManager instance
let metaProgression = null; // Will hold the MetaProgression instance
let currentGameState = null; // Will hold the active GameState instance for the run

// --- Game Initialization ---
function initializeGame() {
    console.log("Initializing Persona Labyrinth...");

    // 1. Initialize Meta Progression (Loads save data)
    metaProgression = new MetaProgression();

    // 2. Initialize UI Manager
    uiManager = new UIManager('gameContainer'); // Pass container ID

    // 3. Setup initial event listeners (now using uiManager potentially)
    setupMainMenuListeners();

    // 4. Show the main menu initially
    uiManager.showScreen('mainMenuScreen');

    console.log("Game Initialized. Welcome, Alchemist.");
    // Verify data load (optional)
    // console.log("Concepts Loaded:", Data.concepts.length);
    // console.log("Initial Meta Insight:", metaProgression.totalInsight);
}

// --- UI Management ---
// We now rely on the UIManager instance, so these functions are less needed here
// function showScreen(screenId) { uiManager?.showScreen(screenId); } // Example delegation

// --- Event Listeners Setup ---
function setupMainMenuListeners() {
    // Use uiManager references if available, otherwise query DOM directly as fallback
    const startButton = uiManager?.startGameButton || document.getElementById('startGameButton');
    const loadButton = uiManager?.loadGameButton || document.getElementById('loadGameButton');
    const metaButton = uiManager?.metaProgressionButton || document.getElementById('metaProgressionButton');
    const settingsButton = uiManager?.settingsButton || document.getElementById('settingsButton');
    const backToMenuButton = uiManager?.backToMenuButton || document.getElementById('backToMenuButton'); // From meta screen

    if (startButton) {
        startButton.addEventListener('click', startNewRun); // Keep reference to function
    } else {
        console.error("Start Game button not found!");
    }

    if (loadButton) loadButton.addEventListener('click', () => alert("Load Game functionality not implemented yet."));

    if (metaButton) {
         metaButton.addEventListener('click', () => {
             // TODO: Render meta progression screen using uiManager and metaProgression data
             console.log("TODO: Render meta screen with unlocks/insight.");
             uiManager?.showScreen('metaScreen');
         });
     }
     if (backToMenuButton) { // Listener for button ON the meta screen
          backToMenuButton.addEventListener('click', () => uiManager?.showScreen('mainMenuScreen'));
     }

    if (settingsButton) settingsButton.addEventListener('click', () => alert("Settings functionality not implemented yet."));
}

// --- Game Flow Functions ---
function startNewRun() {
    console.log("Starting new run via main.js...");

    // --- Get Starting Player Data ---
    // TODO: Implement logic to select starting persona/deck based on meta unlocks
    const startingPlayerData = {
        // Example: Load base stats + permanent upgrades from metaProgression
        maxIntegrity: (metaProgression?.getStartingBonus('baseIntegrity') || 70) + (metaProgression?.getStartingBonus('maxIntegrityBonus') || 0),
        // Add other starting bonuses (focus, specific cards, artifacts?)
        // attunements could be loaded from a saved Persona Lab profile or chosen archetype
        attunements: metaProgression?.getDefaultAttunements(), // Using default for now
        startingDeck: metaProgression?.getDefaultDeckIds() // Using default for now
    };

    // 1. Create a new GameState instance for this run
    // Pass references to metaProgression and uiManager
    currentGameState = new GameState(startingPlayerData, metaProgression, uiManager);

    // 2. Tell GameState to initialize the run internals (Player, Map, Combat Managers)
    // This now happens inside GameState's constructor or a dedicated start method
    currentGameState.startRun(startingPlayerData, metaProgression, uiManager); // Pass refs again just in case

    // 3. Tell UIManager which GameState to use for callbacks
    uiManager?.setGameState(currentGameState);

    // 4. Transition to Map Screen (GameState.startRun now handles MapManager generation & initial render)
    uiManager?.showScreen('mapScreen');

    // 5. Check initial state-based milestones
    metaProgression?.checkStateBasedMilestones(currentGameState);
}

// --- Main Execution ---
document.addEventListener('DOMContentLoaded', initializeGame);

// --- Optional: Make core objects globally accessible for debugging ---
// window.uiManager = uiManager;
// window.metaProgression = metaProgression;
// window.currentGameState = currentGameState;
// window.Data = Data; // Expose Data for easy console access
