// js/config.js - Constants and Configuration (Inner Cosmos Theme)

console.log("config.js loading...");

// --- Core Settings ---
export const SAVE_KEY = 'innerCosmosSaveData_v1'; // Updated key for new theme/version
export const MAX_ATTUNEMENT = 100; // Max Force Strength
export const INITIAL_INSIGHT = 15; // Starting Insight (Slightly increased?)
export const INITIAL_FOCUS_SLOTS = 3; // Start with fewer alignment slots?
export const MAX_FOCUS_SLOTS = 9; // Max Alignment Slots (Reduced max?)

// --- Action Costs ---
export const BASE_RESEARCH_COST = 15; // Scan Sector Base Cost
export const GUIDED_REFLECTION_COST = 10; // Deep Scan Signal Cost
export const SCENE_MEDITATION_BASE_COST = 8; // Nebula Blueprint Meditation Base Cost
export const EXPERIMENT_BASE_COST = 30; // Stabilize Orbit Base Cost
export const ART_EVOLVE_COST = 25; // Evolve Star Cost (Increased?)
export const SCENE_SUGGESTION_COST = 12; // Suggest Blueprint Cost
export const CONTEMPLATION_COST = 5; // Constellation Deep Dive Contemplation Cost (Increased?)

// --- Gameplay Modifiers ---
export const DISSONANCE_THRESHOLD = 6.5; // Threshold for triggering reflection on cataloging dissonant Star
export const SCORE_NUDGE_AMOUNT = 0.15; // How much scores shift during dissonance reflection
export const SELL_INSIGHT_FACTOR = 0.4; // Gain 40% of discovery value when Analyzing Signal (Reduced?)
export const SYNERGY_INSIGHT_BONUS = 1.5; // Insight bonus for cataloging linked Star (Increased?)
export const SYNERGY_DISCOVERY_CHANCE = 0.18; // Chance to auto-discover linked Star (Slightly increased?)
export const CONTEMPLATION_COOLDOWN = 3 * 60 * 1000; // 3 minutes cooldown for Constellation Contemplation

// --- Onboarding Phases ---
// These still represent functional unlocks, even with the interactive tutorial overlaying them.
export const ONBOARDING_PHASE = {
    START: 0, // Charting Phase (Questionnaire)
    PERSONA_GRIMOIRE: 1, // View Constellation Map / Star Catalog / Align Stars Unlocked
    STUDY_INSIGHT: 2, // Unlock Observatory / Scanning / Insight Usage / Signal Analysis (Sell)
    REFLECTION_RITUALS: 3, // Unlock Reflection Prompts / Stellar Harmonics (Rituals)
    ADVANCED: 4 // Unlock Cartography / Star Evolution / Force Insights
};

// --- Star (Concept) Discovery Insight Values ---
// Value gained when *first* cataloging a Star. Also used for Signal Analysis value calculation.
export const CONCEPT_DISCOVERY_INSIGHT = { // Keep internal name for now
    common: 2.0,
    uncommon: 4.0,
    rare: 8.0,
    default: 2.0
};

console.log("config.js loaded.");
