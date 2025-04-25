// --- START OF FILE config.js ---


// --- START OF FILE config.js ---


// --- START OF FILE config.js ---

// js/config.js - Constants and Configuration (Inner Cosmos Theme - 7 Elements + Enhancements v4.1 - Fixed)
// NOTE: This config is for the ORIGINAL Persona Alchemy Lab.
// A roguelite game would likely need ADDITIONAL configuration constants.

console.log("config.js loading... (Acknowledging 7 Elements + Enhancements v4.1)");

// --- Core Settings (Persona Lab) ---
export const SAVE_KEY = 'innerCosmosSaveData_v2'; // Key for saving the main lab progress
export const MAX_ATTUNEMENT = 100; // Max attunement level per element (Applies to all 7, including RF)
export const INITIAL_INSIGHT = 15; // Starting Insight in the Lab
export const INITIAL_FOCUS_SLOTS = 6; // Starting focus slots in the Lab
export const MAX_FOCUS_SLOTS = 12; // Maximum focus slots achievable in the Lab
export const INITIAL_FREE_RESEARCH_COUNT = 3; // Number of free researches after questionnaire

// --- Onboarding/Tutorial (Persona Lab) ---
export const ONBOARDING_ENABLED = true; // Toggle for the onboarding tutorial
export const MAX_ONBOARDING_PHASE = 8; // Total number of phases to match tasks in data.js (Original)
// *** NOTE: Onboarding would need redesign for the roguelite game ***

// --- Action Costs (Persona Lab) ---
export const BASE_RESEARCH_COST = 15;
export const GUIDED_REFLECTION_COST = 12;
export const SCENE_MEDITATION_BASE_COST = 8;
export const EXPERIMENT_BASE_COST = 30;
export const ART_EVOLVE_COST = 25; // Kept for potential future use
export const SCENE_SUGGESTION_COST = 12;
export const CONTEMPLATION_COST = 5;
export const LORE_UNLOCK_COSTS = { level1: 3, level2: 7, level3: 15 };
export const INSIGHT_BOOST_AMOUNT = 40;
export const INSIGHT_BOOST_COOLDOWN = 5 * 60 * 1000; // 5 minutes

// --- Gameplay Modifiers (Persona Lab) ---
export const DISSONANCE_THRESHOLD = 6.5; // Score distance triggering Dissonance Reflection
export const SCORE_NUDGE_AMOUNT = 0.15; // How much scores shift during Dissonance/Dilemma
export const SELL_INSIGHT_FACTOR = 0.4; // % of discovery value gained when selling
export const SYNERGY_INSIGHT_BONUS = 1.5; // Insight bonus for adding related concept
export const SYNERGY_DISCOVERY_CHANCE = 0.18; // Chance to auto-discover linked concept
export const REFLECTION_TRIGGER_THRESHOLD = 3; // Concepts added to trigger reflection
export const REFLECTION_COOLDOWN = 2.5 * 60 * 1000; // 2.5 minutes cooldown
export const CONTEMPLATION_COOLDOWN = 3 * 60 * 1000; // 3 minutes cooldown

// --- Concept Discovery Insight Values (Persona Lab) ---
export const CONCEPT_DISCOVERY_INSIGHT = {
    common: 2.0,
    uncommon: 4.0,
    rare: 8.0,
    default: 2.0
};

// --- UI Settings (Persona Lab) ---
export const TOAST_DURATION = 3000;
export const MILESTONE_ALERT_DURATION = 5000;
export const INSIGHT_LOG_MAX_ENTRIES = 15;

// --- Deprecated/Review Items ---
export const UNLOCKED_ART_EXTENSION = '.jpg'; // Still used for image loading

// ==============================================
// --- NEW CONFIG FOR ROGUELITE GAME (Example) ---
// These would likely go in a separate file or be merged carefully.
// ==============================================
/*
export const ROGUELITE_SAVE_KEY = 'personaRogueliteSaveData_v1'; // Separate save for game progress
export const STARTING_DECK_SIZE = 10;
export const MAX_HAND_SIZE = 10;
export const INITIAL_DRAW = 5;
export const BASE_TURN_INSIGHT = 3; // Starting energy per turn
export const MAX_INSIGHT = 10;     // Max energy player can hold
export const PLAYER_STARTING_HEALTH = 50; // Example HP
export const DRAFT_POOL_SIZE = 30; // How many cards selected from Grimoire for run draft
export const DRAFT_CHOICES = 3;    // How many cards offered after combat
export const MAP_LAYERS = 3;
export const NODES_PER_LAYER_MIN = 12;
export const NODES_PER_LAYER_MAX = 16;
// etc... Many more needed for game balance and mechanics
*/

console.log("config.js loaded successfully. (v4.1 - Fixed)");
// --- END OF FILE config.js ---
