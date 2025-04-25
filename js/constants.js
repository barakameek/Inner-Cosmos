// js/constants.js

// --- Game Setup ---
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

// --- Core Gameplay ---
const MAX_LAYERS = 3; // Number of map layers per run
const MIN_NODES_PER_LAYER = 8;
const MAX_NODES_PER_LAYER = 12;
const STARTING_DECK_DRAFT_POOL_SIZE = 30; // Ideal size from Grimoire
const STARTING_DECK_SIZE = 10; // Cards player drafts
const INITIAL_INSIGHT_SHARDS = 50; // Starting run currency

// --- Card System ---
const CardType = {
    ATTACK: 'Attack',
    SKILL: 'Skill',
    POWER: 'Power',
    CURSE: 'Curse',
    STATUS: 'Status' // For things like Daze/Static added to deck
};

const CardRarity = {
    STARTER: 'Starter', // Not draftable, basic starting cards if needed
    COMMON: 'Common',
    UNCOMMON: 'Uncommon',
    RARE: 'Rare',
    SPECIAL: 'Special' // For curses or specific event rewards
};

const Elements = {
    COGNITIVE: 'Cognitive',       // Thinking, Logic
    RELATIONAL: 'Relational',     // Connection, Empathy
    SENSORY: 'Sensory',         // Physicality, Sensation
    PSYCHOLOGICAL: 'Psychological', // Inner State, Emotion
    INTERACTION: 'Interaction',   // Social Dynamics, Influence
    NEUTRAL: 'Neutral'          // No specific element
};

// Optional: Map elements to colors for UI/VFX
const ElementColors = {
    [Elements.COGNITIVE]: '#4a90e2',     // Blue
    [Elements.RELATIONAL]: '#f5a623',    // Orange
    [Elements.SENSORY]: '#bd10e0',       // Purple/Magenta
    [Elements.PSYCHOLOGICAL]: '#7ed321', // Green
    [Elements.INTERACTION]: '#d0021b',   // Red
    [Elements.NEUTRAL]: '#cccccc'       // Grey
};

// --- Combat ---
const BASE_PLAYER_HP = 80; // Or "Composure"
const BASE_PLAYER_INSIGHT = 3; // Energy per turn
const MAX_PLAYER_INSIGHT = 10;
const STARTING_HAND_SIZE = 5;
const CARDS_PER_TURN_DRAW = 5;
const MAX_CARDS_PER_TURN_PLAY = 3; // Specific hook from design doc
const MAX_RELIC_SLOTS = 3; // Initial value
const BASE_MOMENTUM_RESET_THRESHOLD = 0; // Resets when chain broken
const RESONANCE_DECAY_PER_TURN = 1; // How much resonance fades

// --- Keywords / Status Effects ---
// Using simple strings, could be objects if they need more data later
const StatusEffects = {
    BRUISE: 'Bruise',         // Damage over time
    GUARD: 'Guard',           // Temporary HP
    VULNERABLE: 'Vulnerable', // Takes more damage
    WEAK: 'Weak',             // Deals less damage
    GLOW: 'Glow',             // Next card of element is stronger
    FREEZE: 'Freeze',         // Cannot play cards of element
    RETAIN: 'Retain',         // Card stays in hand
    EXHAUST: 'Exhaust',       // Card removed from combat
    ETHEREAL: 'Ethereal',     // Card exhausts if not played
    STATIC: 'Static',         // Unplayable curse card
    DISSONANCE: 'Dissonance', // Debuff/Curse effect base name
    RESONANCE: 'Resonance'    // Buff for hitting weakness
};

// --- Node Types (Map) ---
const NodeType = {
    START: 'Start',
    ENCOUNTER: 'Encounter',
    ELITE_ENCOUNTER: 'Elite Encounter',
    RESPITE: 'Respite',
    SHOP: 'Shop',
    EVENT: 'Event',
    BOSS: 'Boss',
    UNKNOWN: 'Unknown' // Could be used before revealing node type
};

// --- Enemy Archetypes ---
const EnemyArchetype = {
    DOUBT: 'Doubt',     // Cognitive Lean
    SHAME: 'Shame',     // Relational Lean
    FEAR: 'Fear',       // Sensory Lean
    DESPAIR: 'Despair',   // Psychological Lean
    ANGER: 'Anger',     // Interaction Lean
    // Elites/Bosses might combine these or have unique identifiers
};

// --- Currencies ---
const Currency = {
    INSIGHT_SHARDS: 'Insight Shards', // Run-specific
    INTEGRATION_POINTS: 'Integration Points' // Meta-currency
};

// --- Game States ---
// Useful for controlling game flow and UI
const GameState = {
    LOADING: 'Loading',
    MAIN_MENU: 'MainMenu',
    PERSONA_LAB_SYNC: 'PersonaLabSync', // Placeholder for loading data
    RUN_SETUP: 'RunSetup', // Drafting, relic choice
    MAP: 'Map',
    COMBAT: 'Combat',
    EVENT: 'Event',
    SHOP: 'Shop',
    RESPITE: 'Respite',
    REWARD_SCREEN: 'RewardScreen',
    RUN_OVER: 'RunOver'
};

// --- Persona Lab Data ---
// Key used to access Persona Lab save data in localStorage
const PERSONA_LAB_SAVE_KEY = 'innerCosmosSaveData_v2';
// Default values if no Persona Lab data found
const DEFAULT_PLAYER_ATTUNEMENT = {
    [Elements.COGNITIVE]: 0,
    [Elements.RELATIONAL]: 0,
    [Elements.SENSORY]: 0,
    [Elements.PSYCHOLOGICAL]: 0,
    [Elements.INTERACTION]: 0,
    // RoleFocus isn't an element here based on design doc
};

// --- Technical ---
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;

// --- Misc ---
const VULNERABLE_MULTIPLIER = 1.5; // Takes 50% more damage
const WEAK_MULTIPLIER = 0.75;      // Deals 25% less damage (adjust as needed)
const WEAKNESS_MULTIPLIER = 1.5;   // Deals 50% more damage on weakness hit
const RESISTANCE_MULTIPLIER = 0.75; // Deals 25% less damage on resistance hit
const RESISTANCE_DISSONANCE_PENALTY = 1; // Add 1 Static card on hit

// Make constants globally accessible (or use module system later)
// For simplicity now, we'll assume they are available globally after this script loads.
// Example: console.log(CANVAS_WIDTH);
