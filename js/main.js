// --- Imports ---
// We'll import specific classes/functions as we create them
// For now, let's anticipate needing these modules:
// import { GameState } from './core/GameState.js';
// import { Player } from './core/Player.js';
// import { MapManager } from './map/MapManager.js';
// import { CombatManager } from './combat/CombatManager.js';
// import { UIManager } from './ui/UIManager.js';
// import { MetaProgression } from './meta/MetaProgression.js';

// Import data directly (it exports named objects)
import * as Data from './data.js'; // Use 'as Data' to namespace the imports

// --- Global Variables & Constants ---
// (We'll add more as needed)
const gameContainer = document.getElementById('gameContainer');
let currentScreen = null; // Track the currently active screen element

// --- Game Initialization ---
function initializeGame() {
    console.log("Initializing Persona Labyrinth...");

    // TODO: Load Meta Progression / Save Data
    // const metaProgress = new MetaProgression();
    // metaProgress.load(); // Load saved unlocks, insight, etc.

    // TODO: Initialize GameState
    // const gameState = new GameState();

    // Setup UI Manager (simplified for now)
    setupUIManager();

    // Show the main menu initially
    showScreen('mainMenuScreen');

    // Setup initial event listeners
    setupMainMenuListeners();

    console.log("Game Initialized. Welcome, Alchemist.");
    // --- TEMPORARY ---
    // Log loaded data to verify import
    console.log("Element Details Loaded:", Data.elementDetails);
    console.log("Concepts Loaded:", Data.concepts.length);
    // --- END TEMPORARY ---
}

// --- UI Management (Simplified) ---
// (This will likely become a dedicated UIManager class later)
const screens = {};

function setupUIManager() {
    // Find all screen elements and store them
    const screenElements = gameContainer.querySelectorAll('.screen');
    screenElements.forEach(screen => {
        screens[screen.id] = screen;
        screen.classList.remove('active'); // Ensure all are hidden initially
    });
    console.log("UI Manager initialized, found screens:", Object.keys(screens));
}

function showScreen(screenId) {
    if (currentScreen) {
        currentScreen.classList.remove('active');
        // Optional: Add fade-out transition later
    }
    if (screens[screenId]) {
        currentScreen = screens[screenId];
        currentScreen.classList.add('active');
        console.log(`Showing screen: ${screenId}`);
        // Optional: Add fade-in transition later
    } else {
        console.error(`Screen ID "${screenId}" not found!`);
    }
}

// --- Event Listeners Setup ---
function setupMainMenuListeners() {
    const startButton = document.getElementById('startGameButton');
    // Add other main menu button listeners here (Load, Meta, Settings)

    if (startButton) {
        startButton.addEventListener('click', () => {
            console.log("Start Game button clicked");
            startNewRun();
        });
    } else {
        console.error("Start Game button not found!");
    }

    // Placeholder listeners for other buttons
    const loadButton = document.getElementById('loadGameButton');
    if (loadButton) loadButton.addEventListener('click', () => alert("Load Game functionality not implemented yet."));

    const metaButton = document.getElementById('metaProgressionButton');
     if (metaButton) {
         // Example of switching to another screen
         const backButton = document.getElementById('backToMenuButton'); // Get the back button from meta screen
         metaButton.addEventListener('click', () => showScreen('metaScreen'));
         if(backButton) backButton.addEventListener('click', () => showScreen('mainMenuScreen'));
     }


    const settingsButton = document.getElementById('settingsButton');
    if (settingsButton) settingsButton.addEventListener('click', () => alert("Settings functionality not implemented yet."));
}

// --- Game Flow Functions ---
function startNewRun() {
    console.log("Starting new run...");

    // --- Placeholder Steps ---
    // 1. Reset or Initialize Run-Specific Game State
    //    - Create Player instance (using Lab data or default)
    //    - Build initial deck
    //    - Reset floor number, etc.
    console.log("TODO: Initialize Player, Deck, Run State...");

    // 2. Generate Map for Floor 1
    //    - const mapManager = new MapManager();
    //    - mapManager.generateFloor(1);
    console.log("TODO: Generate Map for Floor 1...");

    // 3. Transition to Map Screen
    showScreen('mapScreen');

    // 4. Update Map UI & Player Info UI
    console.log("TODO: Render Map UI & Player Info...");
    // --- End Placeholders ---
}

// --- Main Execution ---
// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeGame);

// --- Exports (if needed later by other modules) ---
// export { showScreen }; // Example export
