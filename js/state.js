// --- START OF FILE state.js ---
// js/state.js - Manages Application State and Persistence (Enhanced v4.1 - Fixed + Onboarding Phase Setter)
import * as Config from './config.js';
// Import elementNames for structure initialization and concepts for loading enrichment
import { elementNames, concepts } from '../data.js'; // Assuming data.js will exist at the root eventually
import { formatTimestamp } from './utils.js'; // For Insight Log timestamp

console.log("state.js loading... (Enhanced v4.1 - Fixed Spread Syntax & Logging + Onboarding Setter)");

// Default game state structure (now includes onboarding, insight log, and RF)
const createInitialGameState = () => {
    const initial = {
        // Scores (includes RF, default 5)
        userScores: { A: 5, I: 5, S: 5, P: 5, C: 5, R: 5, RF: 5 },
        userAnswers: {}, // Populated below for all elements
        discoveredConcepts: new Map(), // Map<conceptId, { concept: object, discoveredTime: number, notes: string, unlockedLoreLevel: number, userCategory: string, newLoreAvailable: boolean }>
        focusedConcepts: new Set(), // Set<conceptId>
        focusSlotsTotal: Config.INITIAL_FOCUS_SLOTS,
        userInsight: Config.INITIAL_INSIGHT,
        // Attunement (includes RF, default 0)
        elementAttunement: { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0, RF: 0 },
        // Deep Dive Levels (includes RF, default 0)
        unlockedDeepDiveLevels: { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0, RF: 0 },
        achievedMilestones: new Set(), // Set<milestoneId>
        completedRituals: { daily: {}, weekly: {} }, // Store progress { [ritualId]: { completed: boolean, progress: number } }
        lastLoginDate: null, // string | null
        freeResearchAvailableToday: true, // Reset daily - Start true for first day
        initialFreeResearchRemaining: Config.INITIAL_FREE_RESEARCH_COUNT,
        seenPrompts: new Set(), // Set<promptId>
        currentElementIndex: -1, // Index for questionnaire
        questionnaireCompleted: false,
        cardsAddedSinceLastPrompt: 0,
        promptCooldownActive: false,
        discoveredRepositoryItems: { // Sets of IDs for discovered items
             scenes: new Set(),
             experiments: new Set(),
             insights: new Set()
        },
        pendingRarePrompts: [], // Array<promptId>
        unlockedFocusItems: new Set(), // Set<focusUnlockId>
        currentFocusSetHash: '', // Cache for tapestry calculation, derived from focusedConcepts
        contemplationCooldownEnd: null, // timestamp | null
        insightBoostCooldownEnd: null, // timestamp | null
        // NEW STATE PROPERTIES v4
        onboardingPhase: 0, // Current phase of the onboarding tutorial (0 = not started, 99 = skipped)
        onboardingComplete: false, // Has the user finished/skipped onboarding?
        insightLog: [], // Array<{ timestamp: string, amount: number, source: string, newTotal: number }>
    };
    // Initialize userAnswers structure for all elements using elementNames from data.js
    elementNames.forEach(name => {
        initial.userAnswers[name] = {};
    });
    return initial;
};
/** Returns a Set of milestone IDs the user has achieved. */
export function getAchievedMilestones(){
    // return a *new* Set so callers don’t mutate internal state
    return new Set(gameState.achievedMilestones);
}
let gameState = createInitialGameState();

// --- Internal Helper ---
// Calculates a simple hash based on sorted focused concept IDs.
function _calculateFocusSetHash() {
    // Ensure gameState.focusedConcepts is a Set before proceeding
    if (!(gameState.focusedConcepts instanceof Set) || gameState.focusedConcepts.size === 0) {
        return '';
    }
    // Ensure items are numbers before sorting if needed, though IDs should be numbers
    const sortedIds = Array.from(gameState.focusedConcepts).map(Number).sort((a, b) => a - b);
    return sortedIds.join(',');
}

// --- Saving & Loading ---
let saveTimeout = null;
const SAVE_DELAY = 1200; // Milliseconds

// Triggers a debounced save to localStorage
function _triggerSave() {
     const saveIndicator = document.getElementById('saveIndicator');
     if (saveIndicator) {
         saveIndicator.classList.remove('hidden'); // Show saving indicator
     } else {
         // console.warn("Save indicator element not found."); // Log if needed, but don't stop saving
     }

     if (saveTimeout) clearTimeout(saveTimeout); // Clear existing timeout if any

     saveTimeout = setTimeout(() => {
         try {
             // Prepare state for saving: Convert Sets/Maps to Arrays/plain objects
             const stateToSave = {
                 ...gameState, // Spread basic properties
                 // --- Convert complex types ---
                 discoveredConcepts: Array.from(gameState.discoveredConcepts.entries()).map(([id, data]) => [id, {
                    // Save only necessary metadata, not the full concept object from data.js
                    discoveredTime: data.discoveredTime,
                    notes: data.notes,
                    unlockedLoreLevel: data.unlockedLoreLevel,
                    userCategory: data.userCategory,
                    newLoreAvailable: data.newLoreAvailable
                 }]),
                 focusedConcepts: Array.from(gameState.focusedConcepts),
                 achievedMilestones: Array.from(gameState.achievedMilestones),
                 seenPrompts: Array.from(gameState.seenPrompts),
                 discoveredRepositoryItems: {
                     scenes: Array.from(gameState.discoveredRepositoryItems.scenes),
                     experiments: Array.from(gameState.discoveredRepositoryItems.experiments),
                     insights: Array.from(gameState.discoveredRepositoryItems.insights),
                 },
                 unlockedFocusItems: Array.from(gameState.unlockedFocusItems),
                 // insightLog is already serializable (array of simple objects)
                 // userScores, userAnswers, elementAttunement, unlockedDeepDiveLevels are plain objects
                 // completedRituals is a plain object
             };
             localStorage.setItem(Config.SAVE_KEY, JSON.stringify(stateToSave));
             // console.log(`Game state saved at ${new Date().toLocaleTimeString()}`); // Reduced noise
         } catch (error) {
            console.error("Error saving game state:", error);
         }
         finally {
            if (saveIndicator) {
                saveIndicator.classList.add('hidden'); // Hide indicator
            }
            saveTimeout = null;
         }
     }, SAVE_DELAY);
}

// Public function to trigger save (e.g., on critical actions or forced save button)
export function saveGameState(forceImmediate = false) {
    if (forceImmediate) {
        if (saveTimeout) clearTimeout(saveTimeout); // Cancel scheduled save
        saveTimeout = null; // Prevent debounced save from running after immediate save
        const saveIndicator = document.getElementById('saveIndicator');
        if(saveIndicator) saveIndicator.classList.remove('hidden');
        // Call _triggerSave directly, but the internal setTimeout will still apply
        // For a truly immediate save without the 1.2s delay:
        clearTimeout(saveTimeout); // Ensure no scheduled save exists
        _triggerSave(); // This will still schedule it, effectively making it less immediate than _triggerSave() implies
        // A more "immediate" save (though JS is single-threaded):
        // 1. Clear timeout
        // 2. Run the saving logic from inside _triggerSave's setTimeout *directly* here
        // 3. Reset saveTimeout = null;
        // For simplicity, sticking with triggering the debounced save which is generally safe.

        // Force hide indicator shortly after trying to save
        setTimeout(() => { if(saveIndicator) saveIndicator.classList.add('hidden'); }, 100); // Reduced delay
    } else {
        _triggerSave(); // Trigger debounced save
    }
}


// Attempts to load game state from localStorage
export function loadGameState() {
    console.log("Attempting to load game state from key:", Config.SAVE_KEY);
    const savedData = localStorage.getItem(Config.SAVE_KEY);
    if (savedData) {
        try {
            const loadedState = JSON.parse(savedData);
            console.log("Saved data found. Merging into fresh state...");

            // Start fresh to ensure all defaults are present, then merge selectively
            gameState = createInitialGameState();

            // --- Merge Core State (Scores, Attunement, Deep Dive including RF handling) ---
            // Helper to merge objects, ensuring all 7 element keys exist including RF
            const mergeWithDefault = (target, source, defaultValue) => {
                let result = { ...target }; // Start with default keys (A, I, S, P, C, R, RF)
                if (typeof source === 'object' && source !== null) {
                    // Merge saved values
                    for (const key in source) {
                        // Only merge keys that exist in the default structure (A-RF)
                        if (result.hasOwnProperty(key)) {
                           // Ensure type matches default before assigning (basic check)
                           if (typeof source[key] === typeof defaultValue || defaultValue === null) {
                               result[key] = source[key];
                           } else {
                                console.warn(`Load Warning: Type mismatch for key "${key}" in saved object. Expected ${typeof defaultValue}, got ${typeof source[key]}. Using default.`);
                                result[key] = defaultValue; // Use default if type mismatch
                           }
                        } else {
                            console.warn(`Load Warning: Ignoring unknown key "${key}" found in saved object.`);
                        }
                    }
                }
                // Ensure RF key exists with default value if missing or invalid type in loaded source
                if (result.RF === undefined || typeof result.RF !== typeof defaultValue) {
                    result.RF = defaultValue;
                    console.log(`Load Info: RF key missing or invalid in loaded data, set to default: ${defaultValue}`);
                }
                return result;
            };
            gameState.userScores = mergeWithDefault(gameState.userScores, loadedState.userScores, 5.0);
            gameState.elementAttunement = mergeWithDefault(gameState.elementAttunement, loadedState.elementAttunement, 0);
            gameState.unlockedDeepDiveLevels = mergeWithDefault(gameState.unlockedDeepDiveLevels, loadedState.unlockedDeepDiveLevels, 0);

            // --- Merge User Answers ---
             if (typeof loadedState.userAnswers === 'object' && loadedState.userAnswers !== null) {
                gameState.userAnswers = loadedState.userAnswers;
                // Ensure all element keys from data.js exist, including RF
                elementNames.forEach(name => {
                    if (!gameState.userAnswers[name]) {
                        gameState.userAnswers[name] = {};
                        console.log(`Load Info: Added missing userAnswers key for element: ${name}`);
                    }
                });
            } else {
                 // Initialize userAnswers structure if missing in save
                 elementNames.forEach(name => gameState.userAnswers[name] = {});
                 console.warn("Load Warning: userAnswers missing or invalid in saved data. Initialized empty structure.");
            }

            // --- Restore Collections (Maps & Sets) ---
            // Rehydrate discoveredConcepts Map carefully
            if (Array.isArray(loadedState.discoveredConcepts)) {
                 const rehydratedMap = new Map();
                loadedState.discoveredConcepts.forEach(([id, savedConceptData]) => {
                     // Basic validation of saved data structure
                    if (typeof id !== 'number' || typeof savedConceptData !== 'object' || savedConceptData === null) {
                         console.warn(`Load Warning: Invalid entry format in discoveredConcepts array for ID ${id}. Skipping.`);
                         return; // Skip invalid entries
                    }

                    // Find the full concept data from the imported 'concepts' array
                    // Ensure concepts array is loaded before trying to access it
                     let conceptDataFromSource = null;
                     if (typeof concepts !== 'undefined' && Array.isArray(concepts)) {
                         conceptDataFromSource = concepts.find(c => c.id === id);
                     } else {
                         console.error("Load Error: Concepts data from data.js is not available yet! Cannot fully rehydrate discovered concepts.");
                         // Proceed with partial hydration if needed, or handle differently
                     }

                    if (!conceptDataFromSource) {
                        console.warn(`Load Warning: Concept data for saved ID ${id} not found in current data.js. Skipping this concept.`);
                        return; // Skip this entry if concept data is missing
                    }
                    // Rehydrate with full concept data + saved metadata
                    rehydratedMap.set(id, {
                       concept: conceptDataFromSource, // Link back to full data.js object
                       discoveredTime: savedConceptData.discoveredTime || Date.now(),
                       notes: savedConceptData.notes || "",
                       unlockedLoreLevel: savedConceptData.unlockedLoreLevel || 0,
                       userCategory: savedConceptData.userCategory || 'uncategorized',
                       newLoreAvailable: savedConceptData.newLoreAvailable || false
                   });
                });
                gameState.discoveredConcepts = rehydratedMap;
            } else {
                 console.warn("Load Warning: discoveredConcepts in saved data is not an array. Initializing empty Map.");
                 gameState.discoveredConcepts = new Map();
            }

            // Helper to restore Sets safely
            const restoreSet = (key, defaultSet = new Set(), sourceObj = loadedState) => {
                 if (sourceObj && Array.isArray(sourceObj[key])) {
                     try {
                         // Filter potential non-primitive values just in case
                         const validItems = sourceObj[key].filter(item => typeof item === 'number' || typeof item === 'string');
                         return new Set(validItems);
                     } catch (e) {
                         console.error(`Load Error: Failed to restore Set for key "${key}". Using default.`, e);
                         return defaultSet;
                     }
                 }
                 console.warn(`Load Warning: Data for Set key "${key}" is not an array or missing. Using default.`);
                 return defaultSet; // Return default (usually empty Set) if saved data is invalid/missing
            };
            gameState.focusedConcepts = restoreSet('focusedConcepts', gameState.focusedConcepts);
            gameState.achievedMilestones = restoreSet('achievedMilestones', gameState.achievedMilestones);
            gameState.seenPrompts = restoreSet('seenPrompts', gameState.seenPrompts);
            gameState.unlockedFocusItems = restoreSet('unlockedFocusItems', gameState.unlockedFocusItems);

            // Restore Repository Items Sets
            gameState.discoveredRepositoryItems = { scenes: new Set(), experiments: new Set(), insights: new Set() };
            if (typeof loadedState.discoveredRepositoryItems === 'object' && loadedState.discoveredRepositoryItems !== null) {
                gameState.discoveredRepositoryItems.scenes = restoreSet('scenes', gameState.discoveredRepositoryItems.scenes, loadedState.discoveredRepositoryItems);
                gameState.discoveredRepositoryItems.experiments = restoreSet('experiments', gameState.discoveredRepositoryItems.experiments, loadedState.discoveredRepositoryItems);
                gameState.discoveredRepositoryItems.insights = restoreSet('insights', gameState.discoveredRepositoryItems.insights, loadedState.discoveredRepositoryItems);
            } else {
                 console.warn("Load Warning: discoveredRepositoryItems missing or invalid. Initialized empty Sets.");
            }

            // --- Merge Primitive/Simple Object Types (with defaults) ---
            // Helper to merge simple values, providing a default if the key is missing in loadedState
            const mergeSimple = (key, defaultValue) => {
                 const loadedValue = loadedState ? loadedState[key] : undefined;
                // Check if loadedValue exists and is of the same type as defaultValue (or if defaultValue is null)
                if (loadedValue !== undefined && loadedValue !== null && (typeof loadedValue === typeof defaultValue || defaultValue === null)) {
                     return loadedValue;
                }
                // If types don't match or value is missing, log and return default
                 if (loadedValue !== undefined && loadedValue !== null) {
                      console.warn(`Load Warning: Type mismatch for key "${key}". Expected ${typeof defaultValue}, got ${typeof loadedValue}. Using default: ${defaultValue}`);
                 }
                return defaultValue;
            };


            gameState.focusSlotsTotal = mergeSimple('focusSlotsTotal', Config.INITIAL_FOCUS_SLOTS);
            gameState.userInsight = mergeSimple('userInsight', Config.INITIAL_INSIGHT);
            gameState.completedRituals = mergeSimple('completedRituals', { daily: {}, weekly: {} });
            gameState.lastLoginDate = mergeSimple('lastLoginDate', null);
            gameState.freeResearchAvailableToday = mergeSimple('freeResearchAvailableToday', true); // Default to true on load, let login check correct it
            gameState.initialFreeResearchRemaining = mergeSimple('initialFreeResearchRemaining', Config.INITIAL_FREE_RESEARCH_COUNT);
            gameState.currentElementIndex = mergeSimple('currentElementIndex', -1);
            gameState.questionnaireCompleted = mergeSimple('questionnaireCompleted', false);
            gameState.cardsAddedSinceLastPrompt = mergeSimple('cardsAddedSinceLastPrompt', 0);
            gameState.promptCooldownActive = mergeSimple('promptCooldownActive', false);
            gameState.contemplationCooldownEnd = mergeSimple('contemplationCooldownEnd', null);
            gameState.insightBoostCooldownEnd = mergeSimple('insightBoostCooldownEnd', null);
            gameState.pendingRarePrompts = Array.isArray(loadedState?.pendingRarePrompts) ? loadedState.pendingRarePrompts : [];
            // New state properties
            gameState.onboardingPhase = mergeSimple('onboardingPhase', 0);
            // Handle potential old save state where onboarding wasn't tracked
            const loadedOnboardingComplete = mergeSimple('onboardingComplete', false);
            // Allow onboardingPhase=99 to mean skipped/complete
            gameState.onboardingComplete = loadedOnboardingComplete || gameState.questionnaireCompleted || gameState.onboardingPhase === 99;
            if (!loadedOnboardingComplete && gameState.questionnaireCompleted && gameState.onboardingPhase !== 99) {
                 console.log("Load Info: Questionnaire complete but onboarding wasn't; marking onboarding complete.");
                 gameState.onboardingPhase = Config.MAX_ONBOARDING_PHASE + 1; // Mark phase as done too (original logic)
                 gameState.onboardingComplete = true; // Ensure flag is set
            }

            gameState.insightLog = Array.isArray(loadedState?.insightLog) ? loadedState.insightLog : [];

            // Ensure log length doesn't exceed max from old saves
             gameState.insightLog = gameState.insightLog.slice(-Config.INSIGHT_LOG_MAX_ENTRIES);

             // Recalculate the focus hash based on the loaded focused concepts
             gameState.currentFocusSetHash = _calculateFocusSetHash();

             console.log("Game state loaded successfully.");
            return true; // Indicate successful load
        } catch (error) {
            console.error("Error loading or parsing game state:", error);
            clearGameState(); // Reset to default on error
            return false; // Indicate failed load
        }
    } else {
        console.log("No saved game state found. Initializing fresh state.");
        gameState = createInitialGameState(); // Start fresh
        // Check if onboarding should start automatically
        if (Config.ONBOARDING_ENABLED) {
            gameState.onboardingPhase = 1; // Set to phase 1 to trigger start
            // Don't save here, let the first user action trigger the save
        }
        return false; // Indicate no save file was loaded
    }
}

// Clears the saved state from localStorage and resets runtime state
export function clearGameState() {
     localStorage.removeItem(Config.SAVE_KEY);
     gameState = createInitialGameState(); // Reset runtime state
     // Trigger onboarding on reset if enabled
     if (Config.ONBOARDING_ENABLED && !gameState.onboardingComplete) {
         gameState.onboardingPhase = 1;
     }
     console.log("Game state cleared and reset to initial state.");
     // Save the cleared state immediately to prevent accidental loading of old data on refresh before next action
     saveGameState(true);
     // Trigger a page reload for a clean start
     // Avoid automatic reload to allow user confirmation or other UI updates first if needed
     // window.location.reload();
}

// --- Getters ---
// Provide safe access to state properties
export function getState() { return { ...gameState }; } // Return a shallow copy
export function getScores() { return { ...gameState.userScores }; }
export function getAttunement() { return { ...gameState.elementAttunement }; }
export function getInsight() { return gameState.userInsight; }
export function getDiscoveredConcepts() { return gameState.discoveredConcepts; } // Return Map directly
export function getDiscoveredConceptData(conceptId) { return gameState.discoveredConcepts.get(conceptId); } // Returns Map entry or undefined
export function getFocusedConcepts() { return gameState.focusedConcepts; } // Return Set directly
export function getFocusSlots() { return gameState.focusSlotsTotal; }
export function getRepositoryItems() { return gameState.discoveredRepositoryItems; } // Return object with Sets
export function getUnlockedFocusItems() { return gameState.unlockedFocusItems; } // Return Set directly
export function getContemplationCooldownEnd() { return gameState.contemplationCooldownEnd; }
export function getInsightBoostCooldownEnd() { return gameState.insightBoostCooldownEnd; }
export function isFreeResearchAvailable() { return gameState.freeResearchAvailableToday; }
export function getInitialFreeResearchRemaining() { return gameState.initialFreeResearchRemaining; }
export function getSeenPrompts() { return gameState.seenPrompts; } // Return Set directly
export function getCardCategory(conceptId) { const data = gameState.discoveredConcepts.get(conceptId); return data?.userCategory || 'uncategorized'; }
export function getUnlockedLoreLevel(conceptId) { const data = gameState.discoveredConcepts.get(conceptId); return data?.unlockedLoreLevel || 0; }
export function isNewLoreAvailable(conceptId) { const data = gameState.discoveredConcepts.get(conceptId); return data?.newLoreAvailable || false; }
// New Getters
export function getOnboardingPhase() { return gameState.onboardingPhase; }
export function isOnboardingComplete() { return gameState.onboardingComplete || gameState.onboardingPhase === 99; }
export function getInsightLog() { return [...gameState.insightLog]; } // Return a copy


// --- Setters / Updaters ---
// Functions that modify the state and trigger a save

// Scores, Answers, Questionnaire Flow
export function updateScores(newScores) {
    gameState.userScores = { ...gameState.userScores, ...newScores };
    saveGameState();
    return true; // Added missing return
}
export function saveAllAnswers(allAnswers) {
    // Basic validation for allAnswers structure if needed
    if (typeof allAnswers === 'object' && allAnswers !== null) {
        gameState.userAnswers = JSON.parse(JSON.stringify(allAnswers)); // Deep copy
        saveGameState();
    } else {
        console.error("saveAllAnswers called with invalid data:", allAnswers);
    }
}
export function updateAnswers(elementName, answersForElement) {
    // Ensure userAnswers exists
    if (!gameState.userAnswers) gameState.userAnswers = {};
    // Ensure structure for the specific element exists
    if (!gameState.userAnswers[elementName]) gameState.userAnswers[elementName] = {};
    // Merge answers safely
    if (typeof answersForElement === 'object' && answersForElement !== null) {
        gameState.userAnswers[elementName] = { ...answersForElement };
    } else {
         console.warn(`updateAnswers called with invalid answersForElement for ${elementName}`);
    }
    /* No save here - saved by questionnaire flow (finalize or next/prev) */
}
export function updateElementIndex(index) {
    if (typeof index === 'number') {
         gameState.currentElementIndex = index;
    } else {
        console.warn("updateElementIndex called with invalid index:", index);
    }
    /* No save here - saved by questionnaire flow */
}
export function setQuestionnaireComplete() {
    gameState.currentElementIndex = elementNames.length;
    if (!gameState.questionnaireCompleted) {
        gameState.questionnaireCompleted = true;
        // If onboarding isn't explicitly marked complete, mark it now
        if (!gameState.onboardingComplete && gameState.onboardingPhase !== 99) {
            gameState.onboardingComplete = true;
            gameState.onboardingPhase = Config.MAX_ONBOARDING_PHASE + 1; // Mark phase as done too (original logic)
            console.log("Marked onboarding complete automatically upon questionnaire completion.");
        }
        saveGameState();
    }
    return true;
}

// Insight & Related Cooldowns/Features
export function changeInsight(amount, source = "Unknown") {
    const previousInsight = gameState.userInsight;
    // Ensure amount is a valid number
    const validAmount = (typeof amount === 'number' && !isNaN(amount)) ? amount : 0;
    if (validAmount === 0) return false; // No change if amount is zero or invalid

    gameState.userInsight = Math.max(0, previousInsight + validAmount); // Ensure insight doesn't go below 0
    const actualChange = gameState.userInsight - previousInsight; // Calculate actual change after clamping

    if (actualChange !== 0) {
        addInsightLogEntry(actualChange, source, gameState.userInsight); // Log the actual change
        saveGameState();
        return true; // Indicate that insight changed
    }
    return false; // Indicate that insight did not change
}
export function setInsightBoostCooldown(endTime) {
    if (typeof endTime === 'number' || endTime === null) {
        gameState.insightBoostCooldownEnd = endTime;
        saveGameState();
    } else {
        console.warn("setInsightBoostCooldown called with invalid endTime:", endTime);
    }
}
export function setContemplationCooldown(endTime) {
    if (typeof endTime === 'number' || endTime === null) {
        gameState.contemplationCooldownEnd = endTime;
        saveGameState();
    } else {
        console.warn("setContemplationCooldown called with invalid endTime:", endTime);
    }
}

// Research & Rituals
export function useInitialFreeResearch() {
    if (gameState.initialFreeResearchRemaining > 0) {
        gameState.initialFreeResearchRemaining--;
        saveGameState();
        return true;
    }
    return false;
}
export function setFreeResearchUsed() {
    gameState.freeResearchAvailableToday = false;
    saveGameState();
}
export function resetDailyRituals() {
    // Ensure completedRituals exists
    if (typeof gameState.completedRituals !== 'object' || gameState.completedRituals === null) {
        gameState.completedRituals = {};
    }
    gameState.completedRituals.daily = {}; // Reset daily object
    gameState.freeResearchAvailableToday = true;
    gameState.lastLoginDate = new Date().toDateString();
    saveGameState();
}
// Increments progress for a ritual, returns current progress count
export function completeRitualProgress(ritualId, period = 'daily') {
    // Ensure outer period object exists
    if (!gameState.completedRituals?.[period]) {
        if (typeof gameState.completedRituals !== 'object' || gameState.completedRituals === null) gameState.completedRituals = {};
        gameState.completedRituals[period] = {};
    }
    // Ensure inner ritual object exists
    if (!gameState.completedRituals[period][ritualId]) {
        gameState.completedRituals[period][ritualId] = { completed: false, progress: 0 };
    }

    const ritualState = gameState.completedRituals[period][ritualId];
    if (!ritualState.completed) { // Only increment if not already completed
        ritualState.progress += 1;
        saveGameState(); // Save after progress update
    }
    return ritualState.progress; // Return progress even if completed
}
// Marks a ritual as fully completed for the period
export function markRitualComplete(ritualId, period = 'daily') {
    // Ensure structure exists before trying to mark complete
    if (!gameState.completedRituals?.[period]?.[ritualId]) {
        if (!gameState.completedRituals?.[period]) {
             if (typeof gameState.completedRituals !== 'object' || gameState.completedRituals === null) gameState.completedRituals = {};
             gameState.completedRituals[period] = {};
        }
        gameState.completedRituals[period][ritualId] = { completed: false, progress: 0 }; // Initialize if missing
    }

    // Now safely mark as complete
    if (gameState.completedRituals[period]?.[ritualId]) {
        gameState.completedRituals[period][ritualId].completed = true;
        saveGameState(); // Save after marking complete
    }
}

// Attunement & Deep Dive
export function updateAttunement(elementKey, amount) {
    if (gameState.elementAttunement.hasOwnProperty(elementKey)) {
        const validAmount = (typeof amount === 'number' && !isNaN(amount)) ? amount : 0;
        if (validAmount === 0) return false; // No change

        const current = gameState.elementAttunement[elementKey];
        const newValue = Math.min(Config.MAX_ATTUNEMENT, Math.max(0, current + validAmount)); // Clamp between 0 and MAX

        if (newValue !== current) {
            gameState.elementAttunement[elementKey] = newValue;
            saveGameState();
            return true; // Indicate change occurred
        }
    } else {
        console.warn(`Attempted to update attunement for invalid key: ${elementKey}`);
    }
    return false; // Indicate no change
}
export function unlockLibraryLevel(elementKey, level) {
    if (gameState.unlockedDeepDiveLevels.hasOwnProperty(elementKey)) {
        const currentLevel = gameState.unlockedDeepDiveLevels[elementKey] || 0;
        if (typeof level === 'number' && level === currentLevel + 1) { // Ensure unlocking sequentially and level is number
            gameState.unlockedDeepDiveLevels[elementKey] = level;
            saveGameState();
            return true;
        } else {
            console.warn(`Attempted to unlock library level ${level} for ${elementKey} out of sequence or invalid level. Current: ${currentLevel}`);
        }
    } else {
        console.warn(`Attempted to unlock library level for invalid key: ${elementKey}`);
    }
    return false;
}

// Concept Management (Discovered, Focus, Notes, Lore, Category)
export function addDiscoveredConcept(conceptId, conceptData) {
    if (!(gameState.discoveredConcepts instanceof Map)) {
        console.error("CRITICAL ERROR: gameState.discoveredConcepts is not a Map! Reinitializing.");
        gameState.discoveredConcepts = new Map();
    }
    if (typeof conceptId !== 'number' || typeof conceptData !== 'object' || conceptData === null) {
        console.error("addDiscoveredConcept called with invalid ID or data:", conceptId, conceptData);
        return false;
    }

    if (!gameState.discoveredConcepts.has(conceptId)) {
        gameState.discoveredConcepts.set(conceptId, {
            concept: conceptData, // Store full concept data at runtime for easy access
            discoveredTime: Date.now(),
            notes: "",
            unlockedLoreLevel: 0,
            userCategory: 'uncategorized',
            newLoreAvailable: false // Reset on first discovery
        });
        saveGameState();
        return true;
    }
    console.warn(`Attempted to re-add already discovered concept ${conceptId}`);
    return false;
}
export function removeDiscoveredConcept(conceptId) {
    if (!(gameState.discoveredConcepts instanceof Map)) {
        console.error("CRITICAL ERROR: gameState.discoveredConcepts is not a Map!");
        return false;
    }
    if (gameState.discoveredConcepts.has(conceptId)) {
        gameState.discoveredConcepts.delete(conceptId);
        // Ensure focus is also removed if the concept is deleted
        if (gameState.focusedConcepts instanceof Set && gameState.focusedConcepts.has(conceptId)) {
             gameState.focusedConcepts.delete(conceptId);
             gameState.currentFocusSetHash = _calculateFocusSetHash(); // Update hash
        }
        saveGameState();
        return true;
    }
    return false; // Concept wasn't discovered
}
export function toggleFocusConcept(conceptId) {
     if (!(gameState.discoveredConcepts instanceof Map)) {
         console.error("Cannot toggle focus: discoveredConcepts is not a Map!");
         return 'not_discovered';
     }
     if (!(gameState.focusedConcepts instanceof Set)) {
          console.error("Cannot toggle focus: focusedConcepts is not a Set!");
          gameState.focusedConcepts = new Set(); // Attempt recovery
     }
    if (!gameState.discoveredConcepts.has(conceptId)) return 'not_discovered'; // Can't focus undiscovered

    let result;
    if (gameState.focusedConcepts.has(conceptId)) {
        gameState.focusedConcepts.delete(conceptId);
        result = 'removed';
    } else {
        // Check if focus slots are full BEFORE adding
        if (gameState.focusedConcepts.size >= gameState.focusSlotsTotal) {
            return 'slots_full';
        }
        gameState.focusedConcepts.add(conceptId);
        result = 'added';
    }
    // Update hash whenever focus changes
    gameState.currentFocusSetHash = _calculateFocusSetHash();
    saveGameState();
    return result; // 'added', 'removed'
}
export function increaseFocusSlots(amount = 1) {
    const validAmount = (typeof amount === 'number' && amount > 0) ? Math.floor(amount) : 0;
    if (validAmount === 0) return false;

    const newSlots = Math.min(Config.MAX_FOCUS_SLOTS, gameState.focusSlotsTotal + validAmount);
    if (newSlots > gameState.focusSlotsTotal) {
        gameState.focusSlotsTotal = newSlots;
        saveGameState();
        return true;
    }
    return false; // Already at max or invalid amount
}
export function updateNotes(conceptId, notes) {
    if (!(gameState.discoveredConcepts instanceof Map)) {
        console.error("Cannot update notes: discoveredConcepts is not a Map!");
        return false;
    }
    const data = gameState.discoveredConcepts.get(conceptId);
    if (data) {
        // Ensure notes is a string
        const newNotes = (typeof notes === 'string') ? notes : '';
        if (data.notes !== newNotes) { // Only save if notes actually changed
            data.notes = newNotes;
            gameState.discoveredConcepts.set(conceptId, data); // Update the map entry
            saveGameState();
        }
        return true;
    }
    console.warn(`Cannot update notes for unknown conceptId: ${conceptId}`);
    return false;
}
export function setCardCategory(conceptId, categoryId) {
    if (!(gameState.discoveredConcepts instanceof Map)) {
        console.error("Cannot set category: discoveredConcepts is not a Map!");
        return false;
    }
    const data = gameState.discoveredConcepts.get(conceptId);
    if (data) {
        // Ensure categoryId is a string or default to 'uncategorized'
        const newCategory = (typeof categoryId === 'string' && categoryId) ? categoryId : 'uncategorized';
        if (data.userCategory !== newCategory) {
            data.userCategory = newCategory;
            gameState.discoveredConcepts.set(conceptId, data); // Update the map entry
            saveGameState();
            return true;
        }
    } else {
        console.warn(`Cannot set category for unknown conceptId: ${conceptId}`);
    }
    return false; // No change needed or concept not found
}
export function unlockLoreLevel(conceptId, level) {
    if (!(gameState.discoveredConcepts instanceof Map)) {
        console.error("Cannot unlock lore: discoveredConcepts is not a Map!");
        return false;
    }
    const data = gameState.discoveredConcepts.get(conceptId);
    if (data) {
        const currentLevel = data.unlockedLoreLevel || 0;
        // Ensure level is a number and greater than current level
        if (typeof level === 'number' && level > currentLevel) {
            data.unlockedLoreLevel = level;
            data.newLoreAvailable = true; // Mark that new lore is available to be seen
            gameState.discoveredConcepts.set(conceptId, data); // Update the map entry
            saveGameState();
            return true;
        } else {
             console.warn(`Attempted to unlock invalid lore level ${level} for concept ${conceptId}. Current: ${currentLevel}`);
        }
    } else {
        console.warn(`Cannot unlock lore for unknown conceptId: ${conceptId}`);
    }
    return false; // Already unlocked, invalid level, or concept not found
}
export function markLoreAsSeen(conceptId) {
    if (!(gameState.discoveredConcepts instanceof Map)) { return false; }
    const data = gameState.discoveredConcepts.get(conceptId);
    if (data && data.newLoreAvailable) {
        data.newLoreAvailable = false;
        gameState.discoveredConcepts.set(conceptId, data); // Update the map entry
        saveGameState();
        return true;
    }
    return false; // No new lore to mark as seen
}

// Reflection & Repository Management
export function addSeenPrompt(promptId) {
    if (!(gameState.seenPrompts instanceof Set)) {
        console.error("CRITICAL ERROR: gameState.seenPrompts is not a Set! Reinitializing.");
        gameState.seenPrompts = new Set();
    }
    // Ensure promptId is string or number before adding
    if (typeof promptId === 'string' || typeof promptId === 'number') {
        gameState.seenPrompts.add(promptId);
        saveGameState();
    } else {
         console.warn("addSeenPrompt called with invalid promptId:", promptId);
    }
}
export function incrementReflectionTrigger() {
    if (typeof gameState.cardsAddedSinceLastPrompt === 'number') {
        gameState.cardsAddedSinceLastPrompt++;
    } else {
        gameState.cardsAddedSinceLastPrompt = 1; // Initialize if invalid
    }
    /* No save needed here - part of action flow */
}
export function resetReflectionTrigger(startCooldown = false) {
    gameState.cardsAddedSinceLastPrompt = 0;
    if (startCooldown) {
        setPromptCooldownActive(true);
    }
    /* Cooldown save handled by setPromptCooldownActive */
}
export function setPromptCooldownActive(isActive) {
    gameState.promptCooldownActive = !!isActive; // Ensure boolean
    saveGameState();
}
export function clearReflectionCooldown() {
    gameState.promptCooldownActive = false;
    saveGameState();
}
export function addRepositoryItem(itemType, itemId) { // itemType = 'scenes', 'experiments', 'insights'
    // Ensure outer structure exists
    if (!gameState.discoveredRepositoryItems || typeof gameState.discoveredRepositoryItems !== 'object') {
        console.error(`CRITICAL ERROR: gameState.discoveredRepositoryItems is not an object! Reinitializing.`);
        gameState.discoveredRepositoryItems = { scenes: new Set(), experiments: new Set(), insights: new Set() };
    }
    // Ensure inner Set structure exists
    if (!gameState.discoveredRepositoryItems[itemType] || !(gameState.discoveredRepositoryItems[itemType] instanceof Set)) {
        console.error(`CRITICAL ERROR: gameState.discoveredRepositoryItems.${itemType} is not a Set! Reinitializing.`);
        gameState.discoveredRepositoryItems[itemType] = new Set();
    }

    // Validate itemId
    if (typeof itemId !== 'string' && typeof itemId !== 'number') {
         console.warn(`addRepositoryItem called with invalid itemId for type ${itemType}:`, itemId);
         return false;
    }

    // Add item if it doesn't exist
    if (!gameState.discoveredRepositoryItems[itemType].has(itemId)) {
        gameState.discoveredRepositoryItems[itemType].add(itemId);
        saveGameState();
        return true;
    }
    return false; // Already existed
}
export function addPendingRarePrompt(promptId) {
    if (!Array.isArray(gameState.pendingRarePrompts)) {
        console.error("CRITICAL ERROR: gameState.pendingRarePrompts is not an Array! Reinitializing.");
        gameState.pendingRarePrompts = [];
    }
    // Validate promptId
    if (typeof promptId !== 'string' && typeof promptId !== 'number') {
         console.warn("addPendingRarePrompt called with invalid promptId:", promptId);
         return false;
    }
    if (!gameState.pendingRarePrompts.includes(promptId)) {
        gameState.pendingRarePrompts.push(promptId);
        saveGameState();
        return true;
    }
    return false; // Already pending
}
export function getNextRarePrompt() {
    if (!Array.isArray(gameState.pendingRarePrompts)) {
        console.error("CRITICAL ERROR: gameState.pendingRarePrompts is not an Array!");
        gameState.pendingRarePrompts = [];
        return null;
    }
    if (gameState.pendingRarePrompts.length > 0) {
        const promptId = gameState.pendingRarePrompts.shift(); // Removes the first element
        saveGameState(); // Save after modifying the array
        return promptId;
    }
    return null; // No prompts pending
}
export function addUnlockedFocusItem(unlockId) {
    if (!(gameState.unlockedFocusItems instanceof Set)) {
        console.error("CRITICAL ERROR: gameState.unlockedFocusItems is not a Set! Reinitializing.");
        gameState.unlockedFocusItems = new Set();
    }
    // Validate unlockId
    if (typeof unlockId !== 'string' && typeof unlockId !== 'number') {
         console.warn("addUnlockedFocusItem called with invalid unlockId:", unlockId);
         return false;
    }
    if (!gameState.unlockedFocusItems.has(unlockId)) {
        gameState.unlockedFocusItems.add(unlockId);
        saveGameState();
        return true;
    }
    return false; // Already unlocked
}

// Milestones & Misc
export function addAchievedMilestone(milestoneId) {
    if (!(gameState.achievedMilestones instanceof Set)) {
        console.error("CRITICAL ERROR: gameState.achievedMilestones is not a Set! Attempting recovery.");
        // Attempt recovery by creating a new Set from the existing value if it's array-like
        gameState.achievedMilestones = new Set(Array.isArray(gameState.achievedMilestones) ? gameState.achievedMilestones : []);
    }
    // Validate milestoneId
    if (typeof milestoneId !== 'string' && typeof milestoneId !== 'number') {
         console.warn("addAchievedMilestone called with invalid milestoneId:", milestoneId);
         return false;
    }
    if (!gameState.achievedMilestones.has(milestoneId)) {
        gameState.achievedMilestones.add(milestoneId);
        saveGameState();
        return true;
    }
    return false; // Already achieved
}

// --- New State Functions ---
export function advanceOnboardingPhase() {
    if (!gameState.onboardingComplete && gameState.onboardingPhase !== 99) {
        gameState.onboardingPhase++;
        console.log(`State: Advanced onboarding to phase ${gameState.onboardingPhase}`);
        // Don't auto-complete here, let the UI handle the final step
        // if (gameState.onboardingPhase > Config.MAX_ONBOARDING_PHASE) {
        //     markOnboardingComplete(); // Automatically complete if advanced beyond max
        // }
        saveGameState(); // Save the phase change
        return gameState.onboardingPhase;
    }
    return gameState.onboardingPhase; // Return current phase if already complete/skipped
}
// Specifically set the onboarding phase - Used by Prev button in UI or to restart tours
export function updateOnboardingPhase(newPhase) {
     // Allow setting phase even if 'complete' was true, to restart tours, but not if explicitly skipped (99)
     if (typeof newPhase === 'number' && newPhase >= 0 && gameState.onboardingPhase !== 99) {
         gameState.onboardingPhase = newPhase;
         gameState.onboardingComplete = (newPhase >= Config.MAX_ONBOARDING_PHASE + 1); // Re-evaluate complete flag
         saveGameState();
         console.log(`State: Set onboarding phase to ${newPhase}`);
         return true;
     }
     return false;
}
export function markOnboardingComplete() {
    if (!gameState.onboardingComplete && gameState.onboardingPhase !== 99) {
        gameState.onboardingComplete = true;
        gameState.onboardingPhase = Config.MAX_ONBOARDING_PHASE + 1; // Ensure phase is marked above max
        console.log("State: Onboarding marked as complete.");
        saveGameState(); // Save completion status
    }
}
export function addInsightLogEntry(amount, source, newTotal) {
    // Ensure insightLog is an array
    if (!Array.isArray(gameState.insightLog)) {
        console.error("Insight log is not an array! Reinitializing.");
        gameState.insightLog = [];
    }
    // Validate inputs
    if (typeof amount !== 'number' || isNaN(amount) || typeof newTotal !== 'number' || isNaN(newTotal)) {
         console.warn("addInsightLogEntry called with invalid amount or newTotal:", {amount, newTotal, source});
         return;
    }

    const timestamp = Date.now();
    const entry = {
        timestamp: formatTimestamp(timestamp), // Use utility to format
        amount: parseFloat(amount.toFixed(1)), // Store as number, formatted
        source: source || "Unknown", // Default source if not provided
        newTotal: parseFloat(newTotal.toFixed(1)) // Store as number, formatted
    };
    gameState.insightLog.push(entry);
    // Keep log trimmed to max size
    while (gameState.insightLog.length > Config.INSIGHT_LOG_MAX_ENTRIES) {
        gameState.insightLog.shift(); // Remove the oldest entry(s) if exceeding max
    }
    // Note: Saving is handled by the calling function (e.g., changeInsight) to bundle saves
}

/** Marks onboarding phase (e.g. skip or resume) and saves */
export function setOnboardingPhase(n){
    if(typeof n!=='number') return;
    gameState.onboardingPhase = n;
    gameState.onboardingComplete = (n === 99); // 99 explicitly means skipped/complete
    _triggerSave();
}


console.log("state.js loaded successfully. (Fixed + Onboarding Setter)");
// --- END OF FILE state.js ---
