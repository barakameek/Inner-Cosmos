// js/config.js - Constants and Configuration (Inner Cosmos Theme - 7 Elements + Enhancements v4.1)

console.log("config.js loading... (Acknowledging 7 Elements + Enhancements v4.1)");

// --- Core Settings ---
export const SAVE_KEY = 'innerCosmosSaveData_v2'; // Bumped version due to RF score addition and state changes
export const MAX_ATTUNEMENT = 100; // Max attunement level per element (Applies to all 7, including RF)
export const INITIAL_INSIGHT = 15; // Starting Insight
export const INITIAL_FOCUS_SLOTS = 6; // Starting focus slots
export const MAX_FOCUS_SLOTS = 12; // Maximum focus slots achievable (Increased slightly for 7 elements + complexity)
export const INITIAL_FREE_RESEARCH_COUNT = 3; // Number of free researches after questionnaire

// --- Onboarding/Tutorial ---
export const ONBOARDING_ENABLED = true; // Toggle for the onboarding tutorial
export const MAX_ONBOARDING_PHASE = 8; // CORRECTED: Total number of phases to match tasks in data.js

// --- Action Costs ---
export const BASE_RESEARCH_COST = 15; // Standard cost (applies to researching RoleFocus too)
export const GUIDED_REFLECTION_COST = 12; // Cost to trigger a guided reflection (Slightly increased)
export const SCENE_MEDITATION_BASE_COST = 8; // Base cost to meditate on a scene
export const EXPERIMENT_BASE_COST = 30; // Base cost to attempt an experiment
export const ART_EVOLVE_COST = 25; // Cost to unlock enhanced art (NOTE: art unlocking was removed, keep for potential future use or remove?) - Keeping for now.
export const SCENE_SUGGESTION_COST = 12; // Cost to suggest a scene based on focus
export const CONTEMPLATION_COST = 5; // Cost for Tapestry Deep Dive contemplation
export const LORE_UNLOCK_COSTS = { // Applies to Concept Lore levels
    level1: 3,
    level2: 7,
    level3: 15,
};
// Note: Element Deep Dive Insight costs are defined directly in data.js -> elementDeepDive
export const INSIGHT_BOOST_AMOUNT = 40; // How much insight the boost gives
export const INSIGHT_BOOST_COOLDOWN = 5 * 60 * 1000; // 5 minutes in milliseconds (Slightly increased)

// --- Gameplay Modifiers ---
export const DISSONANCE_THRESHOLD = 6.5; // Score distance triggering Dissonance Reflection (Evaluate if RF inclusion warrants change)
export const SCORE_NUDGE_AMOUNT = 0.15; // How much scores shift during Dissonance/Dilemma Reflection nudge (Applies to all 7 scores if nudged)
export const SELL_INSIGHT_FACTOR = 0.4; // % of discovery value gained when selling
export const SYNERGY_INSIGHT_BONUS = 1.5; // Insight bonus for adding related concept
export const SYNERGY_DISCOVERY_CHANCE = 0.18; // Chance to auto-discover linked concept during research
export const REFLECTION_TRIGGER_THRESHOLD = 3; // Number of concepts added to trigger a standard reflection
export const REFLECTION_COOLDOWN = 2.5 * 60 * 1000; // 2.5 minutes cooldown for standard/rare reflections
export const CONTEMPLATION_COOLDOWN = 3 * 60 * 1000; // 3 minutes cooldown for Tapestry Deep Dive

// --- Concept Discovery Insight Values ---
// Based on rarity, unchanged by number of elements
export const CONCEPT_DISCOVERY_INSIGHT = {
    common: 2.0,
    uncommon: 4.0,
    rare: 8.0,
    default: 2.0
};

// --- UI Settings ---
export const TOAST_DURATION = 3000; // Default duration for toast messages
export const MILESTONE_ALERT_DURATION = 5000; // Duration for milestone popups
export const INSIGHT_LOG_MAX_ENTRIES = 15; // How many recent Insight changes to show

// --- Deprecated/Review Items ---
export const UNLOCKED_ART_EXTENSION = '.jpg'; // Note: Art state was removed from save/load - Keep for now

console.log("config.js loaded. (v4.1)");
// --- END OF CORRECTED config.js (v4.1) ---
