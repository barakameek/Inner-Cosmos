// js/main.js

// --- Global Variables ---
let canvas = null;
let ctx = null; // Canvas rendering context 2D
let gameManager = null;
let uiManager = null; // UI Manager instance
let lastTimestamp = 0;
let deltaTime = 0;

// --- Initialization ---

/**
 * Initializes the game environment. Called once the window is loaded.
 */
function init() {
    console.log("Initializing Grimoire Roguelite...");

    // Get Canvas and Context
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Fatal: Canvas element not found!");
        return;
    }
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Fatal: Could not get 2D rendering context!");
        return;
    }

    // Set Canvas Size from constants
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // --- Load Data and Initialize Pools ---
    // Persona Lab data is loaded first if available
    const personaLabData = getPersonaLabData(); // From utils.js

    // Initialize base card pool (Starters, required Status/Curses, examples)
    // This happens in cardData.js now when the script loads.
    // initializeBaseCardPool(); // No longer needed here

    // Load cards based on Persona Lab data (will overwrite examples if IDs match)
    const cardsLoadedFromLab = loadCardsFromPersonaLabData(personaLabData); // From cardData.js
    console.log(`Total cards available after loading: ${Object.keys(BASE_CARD_POOL).length}`);

    // Initialize Relic Pool (definitions loaded in relicData.js)
    // initializeRelicPool(); // Logging happens in relicData.js

    // Initialize Enemy Pool (definitions loaded in enemyData.js)
    // initializeEnemyPool(); // Logging happens in enemyData.js


    // --- Initialize Managers ---
    // GameManager holds the overall state and references other managers/data
    gameManager = new GameManager(personaLabData);

    // UIManager handles rendering specific UI elements like tooltips
    uiManager = new UIManager(ctx, gameManager);
    gameManager.uiManager = uiManager; // Give GameManager a reference if needed, though UIManager usually reads from GM

    console.log("Initialization Complete.");

    // --- Setup Input Listeners ---
    setupInputListeners();

    // --- Set Initial Game State ---
    // Start with the Main Menu (or jump to run setup for testing)
    gameManager.changeState(GameState.MAIN_MENU);
    // gameManager.changeState(GameState.RUN_SETUP); // <-- Use this to skip main menu for testing

    // --- Start the Game Loop ---
    lastTimestamp = performance.now();
    requestAnimationFrame(gameLoop); // Use requestAnimationFrame for smooth looping
}

// --- Game Loop ---

/**
 * The main game loop, called repeatedly via requestAnimationFrame.
 * @param {DOMHighResTimeStamp} timestamp - The current time provided by requestAnimationFrame.
 */
function gameLoop(timestamp) {
    // Calculate delta time (time elapsed since the last frame)
    deltaTime = (timestamp - lastTimestamp) / 1000; // Convert milliseconds to seconds
    lastTimestamp = timestamp;

    // Cap delta time to prevent large jumps if the tab loses focus or lags
    const maxDeltaTime = 1 / 15; // Equivalent to a minimum of 15 FPS
    deltaTime = Math.min(deltaTime, maxDeltaTime);

    // --- Update Game State ---
    // Order matters: Update game logic first
    if (gameManager) {
        gameManager.update(deltaTime);
    }
    // Update UI elements (like tooltips based on new game state/hover)
    if (uiManager) {
        uiManager.update(deltaTime);
    }

    // --- Rendering ---
    // Clear the canvas for the new frame
    // Note: GameManager or individual state renders might handle clearing/backgrounds
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.fillStyle = '#333'; // Default background
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render game elements based on state (handled by GameManager)
    if (gameManager) {
        gameManager.render(ctx);
    }

    // Render UI elements on top (handled by UIManager)
    // if (uiManager) {
    //     uiManager.render(); // UIManager render is called within GameManager.render for layering control
    // }

    // Request the next frame
    requestAnimationFrame(gameLoop);
}

// --- Input Setup ---

/**
 * Sets up event listeners for user input (mouse clicks, movement).
 */
function setupInputListeners() {
    if (!canvas) return;

    // Mouse Movement Listener (for hover effects, targeting lines)
    canvas.addEventListener('mousemove', (event) => {
        if (gameManager) {
            gameManager.updateMousePos(event); // Pass the event to GameManager
        }
    });

    // Mouse Click Listener
    canvas.addEventListener('click', (event) => {
        if (gameManager) {
            gameManager.registerClick(); // Tell GameManager a click happened at the current mouse pos
        }
    });

    // Prevent right-click context menu on the canvas
    canvas.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    // Keyboard Listeners (Optional - Add if needed for shortcuts, etc.)
    // window.addEventListener('keydown', (event) => {
    //     if (gameManager) {
    //         gameManager.handleKeyboardInput(event.key, event.code);
    //     }
    // });
}


// --- Start the Game ---
// Wait for the DOM and all scripts to be fully loaded before initializing
window.addEventListener('load', init);
