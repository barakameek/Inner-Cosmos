// js/main.js

// --- Imports ---
import { GameState } from './core/GameState.js';
import { UIManager } from './ui/UIManager.js';
import { MetaProgression } from './meta/MetaProgression.js';
import * as Data from './data.js'; // Assuming data.js is in root, correct path from main.js

// --- Global Variables (Module Scope) ---
let uiManager = null;
let metaProgression = null;
let currentGameState = null;

// --- Game Initialization ---
function initializeGame() {
    console.log("===============================");
    console.log("Initializing Persona Labyrinth...");
    console.log("===============================");
    try {
        console.log("Initializing MetaProgression...");
        metaProgression = new MetaProgression(); // Handles loading/defaults
        console.log(`MetaProgression loaded. Total Insight: ${metaProgression.totalInsight}`);

        console.log("Initializing UIManager...");
        const gameContainer = document.getElementById('gameContainer');
        if (!gameContainer) throw new Error("Fatal Error: #gameContainer element not found!");
        uiManager = new UIManager('gameContainer');

        console.log("Setting up Main Menu Listeners...");
        setupMainMenuListeners();

        uiManager.showScreen('mainMenuScreen'); // Show main menu

        // --- Debugging ---
        window.personaLab = { uiManager, metaProgression, getGameState: () => currentGameState, Data, startGame: startNewRun, resetMeta: () => { if(confirm("Reset ALL meta progress?")) metaProgression?.resetProgress(); }, addInsight: (amount = 100) => metaProgression?.addInsight(amount) };
        // --- End Debugging ---

        console.log("===============================");
        console.log("Game Initialized. Welcome!");
        console.log("Access debug tools via `window.personaLab` in console.");
        console.log("===============================");
    } catch (error) { /* ... keep error handling ... */
         console.error("FATAL ERROR during game initialization:", error);
         const body = document.querySelector('body');
         if (body) body.innerHTML = `<div style="color: red; padding: 30px; font-family: sans-serif;"><h1>Initialization Error</h1><p>Persona Labyrinth could not start.</p><pre>${error.message}\n${error.stack}</pre><p>Please check the console for details.</p></div>`;
    }
}

// --- Event Listeners Setup ---
function setupMainMenuListeners() {
    if (!uiManager) return;
    if (uiManager.startGameButton) uiManager.startGameButton.onclick = startNewRun;
    else console.error("Start Game button not found!");
    if (uiManager.loadGameButton) uiManager.loadGameButton.onclick = () => uiManager.showActionFeedback("Load Game not implemented.", "info");
    if (uiManager.metaProgressionButton) uiManager.metaProgressionButton.onclick = () => uiManager.showScreen('metaScreen');
    else console.error("Meta Progression button not found!");
    if (uiManager.backToMenuButton) uiManager.backToMenuButton.onclick = () => uiManager.showScreen('mainMenuScreen');
    else console.warn("Meta screen 'Back' button not found!");
    if (uiManager.settingsButton) uiManager.settingsButton.onclick = () => uiManager.showActionFeedback("Settings not implemented.", "info");
}

// --- Game Flow Functions ---
function startNewRun() {
    console.log(">>> Starting New Run <<<");

    if (currentGameState && currentGameState.runActive) {
        console.warn("Ending previous active run before starting new one.");
        currentGameState.cleanupRun();
    }
    currentGameState = null;

    if (!metaProgression || !uiManager) {
        console.error("Cannot start run: MetaProgression or UIManager not initialized!");
        alert("Error: Core systems not ready. Cannot start run.");
        return;
    }

    // --- Get Starting Player Data ---
    // Pass metaProgression bonuses directly. Player constructor handles defaults.
    const startingPlayerData = {
        name: "The Alchemist", // Or from selection later
        // Player constructor will apply these bonuses to its internal defaults
        maxIntegrityBonus: metaProgression.getStartingBonus('maxIntegrityBonus'),
        // Attunements: Let Player constructor handle applying meta bonuses to defaults
        // startingDeck: Let Player constructor handle defaults
        // startingArtifacts: Add any meta-unlocked starting artifacts here
        // startingArtifacts: metaProgression.getStartingBonus('startingArtifacts') || [], // Example
    };

    try {
        // 1. Create & Initialize GameState
        // Pass startingPlayerData which mainly contains meta bonuses now.
        currentGameState = new GameState(startingPlayerData, metaProgression, uiManager);
        // startRun initializes Player (using playerData), MapManager, CombatManager
        currentGameState.startRun(startingPlayerData, metaProgression, uiManager); // startRun defined in GameState

        // 2. Link UIManager back to GameState
        uiManager.setReferences(currentGameState, metaProgression); // Pass both references

        // 3. Transition to Map Screen (Handled by GameState.startRun -> MapManager.generateFloor -> UIManager.renderMap)
        uiManager.showScreen('mapScreen');

        // 4. Check initial state-based milestones
        metaProgression.checkStateBasedMilestones(currentGameState);

        console.log(">>> New Run Successfully Started <<<");

    } catch (error) {
        console.error("Error during run start:", error);
        uiManager.showModal(`<h2>Run Start Error</h2><p>Failed to initialize the run.</p><pre>${error.message}</pre>`, [{ text: 'Return to Menu', callback: () => uiManager.showScreen('mainMenuScreen') }]);
        currentGameState = null;
    }
}

// --- Main Execution ---
document.addEventListener('DOMContentLoaded', initializeGame);
