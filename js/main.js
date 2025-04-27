// js/main.js - Main Game Initialization and Flow

// --- Core Imports ---
import { GameState } from './core/GameState.js';
import { MetaProgression } from './meta/MetaProgression.js';
import { UIManager } from './ui/UIManager.js';

// Import data - Needed early for defaults maybe, or passed down
import * as Data from '../data.js'; // Correct path: up from js/ to root

// --- Global Game Object (for state management and debugging) ---
const personaLabyrinth = {
    gameState: null,
    uiManager: null,
    metaProgression: null,
};
window.personaLabyrinth = personaLabyrinth; // Make accessible in browser console

// --- Initialization Function ---
function initGame() {
    console.log("Persona Labyrinth: Initializing Game...");

    try {
        // 1. Initialize Meta Progression (Loads saved data or sets defaults)
        personaLabyrinth.metaProgression = new MetaProgression();

        // 2. Initialize UI Manager (Finds elements, sets up common listeners)
        personaLabyrinth.uiManager = new UIManager('gameContainer');

        // 3. Setup Main Menu Listeners (Done AFTER UIManager is created)
        setupMainMenuListeners();

        // 4. Show Main Menu initially
        personaLabyrinth.uiManager.showScreen('mainMenuScreen');

        console.log("Persona Labyrinth: Initialization Complete. Ready.");

    } catch (error) {
        console.error("FATAL ERROR during game initialization:", error);
        // Display a user-friendly error message on the page?
        const container = document.getElementById('gameContainer');
        if (container) {
            container.innerHTML = `<div style="padding: 30px; text-align: center; color: red;">
                <h1>Initialization Error</h1>
                <p>Persona Labyrinth could not start. Please check the console (F12) for details.</p>
                <p>${error.message}</p>
            </div>`;
        }
        // Attempt to show main menu even on error, might fail if UI manager failed
        document.getElementById('mainMenuScreen')?.classList?.add('active');
    }
}

// --- Game Start Function ---
function startNewRun() {
    console.log("Starting new run...");
    if (!personaLabyrinth.uiManager || !personaLabyrinth.metaProgression) {
        console.error("Cannot start run: UIManager or MetaProgression not initialized.");
        alert("Error: Core managers not ready. Cannot start run.");
        return;
    }
    if (personaLabyrinth.gameState && personaLabyrinth.gameState.runActive) {
         if (!confirm("A run is currently active. Starting a new run will abandon the current one. Continue?")) {
              return; // Abort if user cancels
         }
         console.warn("Abandoning active run to start a new one.");
         // Optionally call cleanup or endRun(false) on the old gameState?
         personaLabyrinth.gameState.cleanupRun(); // Clean up the old state
    }

    // TODO: Add logic for selecting player archetype/starting deck/ascension level here
    const playerData = {}; // Placeholder for selected archetype/deck data
    const selectedAscension = personaLabyrinth.metaProgression.currentAscension || 0; // Get selected ascension

    // 1. Create a NEW GameState instance for this run
    personaLabyrinth.gameState = new GameState(
        playerData,
        personaLabyrinth.metaProgression,
        personaLabyrinth.uiManager
    );

    // 2. Set references *after* all core objects are created
    // Link the new GameState to the existing UI and Meta managers
    personaLabyrinth.uiManager.setReferences(personaLabyrinth.gameState, personaLabyrinth.metaProgression);
    // Note: Player reference is set within GameState.startRun

    // 3. Start the run process within GameState
    // This handles player creation, map generation, initial UI updates, and shows the map screen
    personaLabyrinth.gameState.startRun(playerData, personaLabyrinth.metaProgression, personaLabyrinth.uiManager);

}

// --- Load Game Function (Placeholder) ---
function loadSavedRun() {
    console.log("Load Game button clicked - Functionality not implemented yet.");
    personaLabyrinth.uiManager?.showActionFeedback("Load Game Not Implemented", "warning");
    // TODO: Implement loading saved GameState data from localStorage
}

// --- Show Meta Screen ---
function showMetaScreen() {
    if (!personaLabyrinth.uiManager) return;
    console.log("Showing Meta Progression Screen...");
    personaLabyrinth.uiManager.showScreen('metaScreen'); // UIManager handles rendering content
}

// --- Show Settings Screen (Placeholder) ---
function showSettingsScreen() {
    console.log("Settings button clicked - Functionality not implemented yet.");
    personaLabyrinth.uiManager?.showActionFeedback("Settings Not Implemented", "warning");
    // TODO: Implement settings screen UI and logic
}

// --- Setup Main Menu Event Listeners ---
function setupMainMenuListeners() {
    const ui = personaLabyrinth.uiManager;
    if (!ui) return;

    if (ui.startGameButton) {
        ui.startGameButton.onclick = startNewRun;
    } else { console.warn("Start Game button not found."); }

    if (ui.loadGameButton) {
        ui.loadGameButton.onclick = loadSavedRun;
        // Disable load button initially if no save exists?
        // ui.loadGameButton.disabled = !checkIfSaveExists(); // Need save/load mechanism
    } else { console.warn("Load Game button not found."); }

    if (ui.metaProgressionButton) {
        ui.metaProgressionButton.onclick = showMetaScreen;
    } else { console.warn("Meta Progression button not found."); }

    if (ui.settingsButton) {
        ui.settingsButton.onclick = showSettingsScreen;
         ui.settingsButton.disabled = true; // Disable until implemented
    } else { console.warn("Settings button not found."); }

    // Add listener for the 'Back to Menu' button on the Meta screen
    if (ui.backToMenuButton) {
        ui.backToMenuButton.onclick = () => ui.showScreen('mainMenuScreen');
    } else { console.warn("Back to Menu button (Meta Screen) not found."); }
}


// --- Wait for DOM Load & Start Game ---
document.addEventListener('DOMContentLoaded', initGame);
