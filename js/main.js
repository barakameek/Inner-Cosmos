// js/main.js - Main Game Initialization and Flow (v5.1 - Mirror Quiz Integration)

// --- Core Imports ---
import { GameState } from './core/GameState.js';
import { MetaProgression } from './meta/MetaProgression.js';
import { UIManager } from './ui/UIManager.js';
import { QuizManager } from './core/QuizManager.js'; // NEW: Import QuizManager

// Import data - Needed early for defaults maybe, or passed down
import * as Data from '../data.js'; // Correct path: up from js/ to root

// --- Global Game Object (for state management and debugging) ---
const personaLabyrinth = {
    gameState: null,
    uiManager: null,
    metaProgression: null,
    quizManager: null, // Optional: Keep reference if needed outside run start
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
        const container = document.getElementById('gameContainer');
        if (container) {
            container.innerHTML = `<div style="padding: 30px; text-align: center; color: red;">
                <h1>Initialization Error</h1>
                <p>Persona Labyrinth could not start. Please check the console (F12) for details.</p>
                <p>${error.message}</p>
            </div>`;
        }
        document.getElementById('mainMenuScreen')?.classList?.add('active');
    }
}

// --- Game Start Function (Modified for Mirror Quiz) ---
function startNewRun() {
    console.log("Attempting to start new run...");
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
         personaLabyrinth.gameState.cleanupRun(); // Clean up the old state
         personaLabyrinth.gameState = null; // Clear reference
    }

    // --- Mirror Quiz Logic ---
    // Create a QuizManager instance for this run attempt
    const quizManager = new QuizManager();
    personaLabyrinth.quizManager = quizManager; // Store globally if needed for debugging

    // Define the function that proceeds *after* the quiz is done (or skipped)
    const proceedToRun = (quizResult) => {
        console.log("Proceeding to start run...");
        let playerData = {}; // Base player data for GameState

        // Apply quiz results if they exist
        if (quizResult) {
            console.log("Applying Quiz Result to Player Data for GameState:", quizResult);
            // These will be used by the Player constructor via GameState
            playerData.startingDeck = quizResult.startingDeckIds;
            playerData.attunements = quizResult.attunementBonus;
        } else {
            console.log("Starting run without quiz results (skipped or error). Using defaults.");
            // Player constructor will use defaults if playerData lacks these keys
        }

        const selectedAscension = personaLabyrinth.metaProgression.currentAscension || 0;
        // Note: Ascension level isn't passed directly to GameState/Player constructor currently,
        // MetaProgression holds it, and Player/MapManager read from MetaProgression instance.

        try {
            // 1. Create a NEW GameState instance for this run, passing merged player data
            personaLabyrinth.gameState = new GameState(
                playerData, // Contains quiz results (deck, attunements) if completed
                personaLabyrinth.metaProgression,
                personaLabyrinth.uiManager
            );

            // 2. Set references AFTER all core objects are created
            // Link GameState to UI/Meta (already done), link UI back to GameState
            personaLabyrinth.uiManager.setReferences(personaLabyrinth.gameState, personaLabyrinth.metaProgression);

            // 3. Start the run process within GameState
            // This handles Player creation (using playerData), Map generation, UI updates, etc.
            personaLabyrinth.gameState.startRun(playerData, personaLabyrinth.metaProgression, personaLabyrinth.uiManager);

            console.log("Run successfully started.");

        } catch (error) {
             console.error("CRITICAL ERROR during GameState creation or startRun:", error);
             alert("Error starting the run. Please check console and refresh.");
             // Attempt to return to main menu safely
             personaLabyrinth.uiManager?.showScreen('mainMenuScreen');
             personaLabyrinth.gameState?.cleanupRun(); // Clean up potentially partial state
             personaLabyrinth.gameState = null;
        }
    };

    // Show the quiz screen via UIManager, providing the quiz instance and the callback
    console.log("Showing Mirror Quiz...");
    try {
        personaLabyrinth.uiManager.showMirrorQuiz(quizManager, (result) => {
            // This callback function is executed by UIManager when the quiz is finished or cancelled
            proceedToRun(result); // Pass the quiz result (or null if cancelled)
        });
    } catch (error) {
        console.error("Error trying to show Mirror Quiz:", error);
        alert("Could not start the initial reflection quiz. Starting with defaults.");
        proceedToRun(null); // Proceed with default start if quiz fails to show
    }
    // --- End Mirror Quiz Logic ---

    // Note: The actual creation of GameState and starting the run
    // now happens *inside* the `proceedToRun` callback function.
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
    } else { console.warn("Load Game button not found."); }

    if (ui.metaProgressionButton) {
        ui.metaProgressionButton.onclick = showMetaScreen;
    } else { console.warn("Meta Progression button not found."); }

    if (ui.settingsButton) {
        ui.settingsButton.onclick = showSettingsScreen;
         ui.settingsButton.disabled = true; // Disable until implemented
    } else { console.warn("Settings button not found."); }

    if (ui.backToMenuButton) {
        ui.backToMenuButton.onclick = () => ui.showScreen('mainMenuScreen');
    } else { console.warn("Back to Menu button (Meta Screen) not found."); }
}


// --- Wait for DOM Load & Start Game ---
document.addEventListener('DOMContentLoaded', initGame);
