// js/main.js

// --- Global Variables ---
let canvas = null;
let ctx = null; // Canvas rendering context 2D
let gameManager = null;
let uiManager = null; // Will be initialized later if needed for complex UI
let lastTimestamp = 0;
let deltaTime = 0;

// --- Initialization ---

/**
 * Initializes the game environment.
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

    // Set Canvas Size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Load Persona Lab Data
    const personaLabData = getPersonaLabData(); // From utils.js

    // Initialize Card Pool from Persona Lab Data (or defaults)
    // Ensure starter cards are added even if lab data is null
    addStarterCardsToBasePool(); // Helper function defined below
    loadCardsFromPersonaLabData(personaLabData); // From cardData.js

    // Initialize Relic Pool (Relics might be unlocked later)
    initializeRelicPool(); // From relicData.js (currently loads all examples)

    // Initialize Enemy Pool
    initializeEnemyPool(); // From enemyData.js (currently loads all examples)


    // Initialize Managers
    // We need GameManager first as it holds the overall state
    gameManager = new GameManager(personaLabData); // Pass Lab data for meta-progression checks

    // UIManager could be initialized here if needed for global UI elements
    // uiManager = new UIManager(ctx);

    console.log("Initialization Complete.");

    // Set initial game state (e.g., show main menu or start run setup)
    // For now, let's jump directly into setting up a run for testing
    gameManager.changeState(GameState.RUN_SETUP);

    // Start the game loop
    lastTimestamp = performance.now();
    requestAnimationFrame(gameLoop);
}

/**
 * Helper function to ensure starter cards are defined.
 * Call this before attempting to load from Persona Lab data
 * to guarantee they exist even if the Lab data is empty or invalid.
 */
function addStarterCardsToBasePool() {
    // Check if already defined (e.g., directly in cardData.js)
    if (!getCardDefinition('starter_strike')) {
        addCardDefinition(new CardDefinition({ /* ... full definition from cardData.js ... */
            id: 'starter_strike', name: 'Strike', type: CardType.ATTACK, element: Elements.NEUTRAL, cost: 1, rarity: CardRarity.STARTER, description: "Deal 6 Bruise.", effects: { dealBruise: { amount: 6, target: 'enemy', duration: 1 } }, upgrade: { cost: 1, description: "Deal 9 Bruise.", effects: { dealBruise: { amount: 9, target: 'enemy', duration: 1 } }, }, artId: 'starter_strike'
        }));
    }
     if (!getCardDefinition('starter_defend')) {
        addCardDefinition(new CardDefinition({ /* ... full definition from cardData.js ... */
            id: 'starter_defend', name: 'Defend', type: CardType.SKILL, element: Elements.NEUTRAL, cost: 1, rarity: CardRarity.STARTER, description: "Gain 5 Guard.", effects: { gainGuard: { amount: 5, target: 'player' } }, upgrade: { cost: 1, description: "Gain 8 Guard.", effects: { gainGuard: { amount: 8, target: 'player' } }, }, artId: 'starter_defend'
        }));
    }
    if (!getCardDefinition('starter_doubt')) {
        addCardDefinition(new CardDefinition({ /* ... full definition from cardData.js ... */
             id: 'starter_doubt', name: 'Lingering Doubt', type: CardType.CURSE, element: Elements.NEUTRAL, cost: null, rarity: CardRarity.SPECIAL, description: "Unplayable. Ethereal.", keywords: [StatusEffects.ETHEREAL], effects: {}, artId: 'starter_doubt'
        }));
    }
    if (!getCardDefinition('status_static')) { // Ensure Static card is defined for relics/enemies
        addCardDefinition(new CardDefinition({
            id: 'status_static', name: 'Static', type: CardType.STATUS, element: Elements.NEUTRAL, cost: null, rarity: CardRarity.SPECIAL, description: "Unplayable.", keywords: [], effects: {}, artId: 'status_static'
        }));
    }
     if (!getCardDefinition('curse_heavy_heart')) { // Ensure Heavy Heart is defined
        addCardDefinition(new CardDefinition({
            id: 'curse_heavy_heart', name: 'Heavy Heart', type: CardType.CURSE, element: Elements.NEUTRAL, cost: null, rarity: CardRarity.SPECIAL, description: "Unplayable. Reduces Insight gain by 1 while in hand.", keywords: [], effects: { passiveInHand: { effectId: 'reduceInsightGain', value: 1 } }, artId: 'curse_heavy_heart'
        }));
    }
    // Add other necessary status/curse cards here if needed
}


// --- Game Loop ---

/**
 * The main game loop, called repeatedly via requestAnimationFrame.
 * @param {DOMHighResTimeStamp} timestamp - The current time provided by requestAnimationFrame.
 */
function gameLoop(timestamp) {
    // Calculate time elapsed since the last frame
    deltaTime = (timestamp - lastTimestamp) / 1000; // Delta time in seconds
    lastTimestamp = timestamp;

    // Cap delta time to prevent large jumps if the tab loses focus
    deltaTime = Math.min(deltaTime, 1 / 15); // Cap at 15 FPS equivalent minimum

    // --- Input Handling (Placeholder) ---
    // processInput(); // Would handle mouse clicks, keyboard presses

    // --- Update Game State ---
    if (gameManager) {
        gameManager.update(deltaTime);
    }

    // --- Rendering ---
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set a background color (redundant if CSS sets it, but good practice)
    ctx.fillStyle = '#333'; // Match CSS background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render game elements based on state
    if (gameManager) {
        gameManager.render(ctx);
    }

    // Render global UI elements (if using a dedicated UIManager)
    // if (uiManager) {
    //     uiManager.render(ctx);
    // }

    // Request the next frame
    requestAnimationFrame(gameLoop);
}

// --- Input Processing (Placeholder) ---
function processInput() {
    // TODO: Implement input listeners (mouse clicks, keyboard)
    // Store input state in a way that gameManager can access it during update.
    // Example: Check for clicks on specific UI regions or map nodes.
}

// --- Start the Game ---
// Wait for the DOM to be fully loaded before initializing
window.addEventListener('load', init);

// --- Add Input Listeners (Example) ---
// Need to be added after init typically, or reference global variables correctly.
// canvas.addEventListener('click', (event) => {
//     if (gameManager) {
//         const rect = canvas.getBoundingClientRect();
//         const mouseX = event.clientX - rect.left;
//         const mouseY = event.clientY - rect.top;
//         gameManager.handleInput({ type: 'click', x: mouseX, y: mouseY });
//     }
// });
