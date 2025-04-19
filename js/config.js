// --- START OF config.js ---

// js/config.js - Constants and Configuration (Inner Cosmos Theme)

console.log("config.js loading...");

// --- Core Settings ---
export const SAVE_KEY = 'innerCosmosSaveData_v1'; // Keep version consistent
export const MAX_ATTUNEMENT = 100; // Max attunement level per element
export const INITIAL_INSIGHT = 15; // Starting Insight
export const INITIAL_FOCUS_SLOTS = 6; // Starting focus slots
export const MAX_FOCUS_SLOTS = 9; // Maximum focus slots achievable
export const INITIAL_FREE_RESEARCH_COUNT = 3; // Number of free researches after questionnaire

// --- Action Costs ---
export const BASE_RESEARCH_COST = 15; // Standard cost after initial free/discounted
export const GUIDED_REFLECTION_COST = 10; // Cost to trigger a guided reflection
export const SCENE_MEDITATION_BASE_COST = 8; // Base cost to meditate on a scene
export const EXPERIMENT_BASE_COST = 30; // Base cost to attempt an experiment
export const ART_EVOLVE_COST = 25; // Cost to unlock enhanced art (NOTE: art unlocking was removed from state save, ensure this is still relevant)
export const SCENE_SUGGESTION_COST = 12; // Cost to suggest a scene based on focus
export const CONTEMPLATION_COST = 5; // Cost for Tapestry Deep Dive contemplation
export const LORE_UNLOCK_COSTS = {
    level1: 3,
    level2: 7,
    level3: 15,
};
export const INSIGHT_BOOST_AMOUNT = 40; // How much insight the boost gives (Added)
export const INSIGHT_BOOST_COOLDOWN = 4 * 60 * 1000; // 4 minutes in milliseconds (Added)

// --- Gameplay Modifiers ---
export const DISSONANCE_THRESHOLD = 6.5; // Score distance triggering Dissonance Reflection
export const SCORE_NUDGE_AMOUNT = 0.15; // How much scores shift during Dissonance Reflection nudge
export const SELL_INSIGHT_FACTOR = 0.4; // % of discovery value gained when selling
export const SYNERGY_INSIGHT_BONUS = 1.5; // Insight bonus for adding related concept
export const SYNERGY_DISCOVERY_CHANCE = 0.18; // Chance to auto-discover linked concept during research
export const CONTEMPLATION_COOLDOWN = 3 * 60 * 1000; // 3 minutes cooldown for Tapestry Deep Dive

// --- Concept Discovery Insight Values ---
export const CONCEPT_DISCOVERY_INSIGHT = {
    common: 2.0,
    uncommon: 4.0,
    rare: 8.0,
    default: 2.0
};
export const UNLOCKED_ART_EXTENSION = '.jpg'; // Note: Art state was removed from save/load

console.log("config.js loaded.");
// --- END OF config.js ---
