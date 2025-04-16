// js/state.js - Manages Application State and Persistence (Enhanced v4)
import * as Config from './config.js';
import { elementNames, concepts } from '../data.js'; // concepts needed for loading enrichment
import { formatTimestamp } from './utils.js'; // For Insight Log timestamp

console.log("state.js loading... (Enhanced v4 - Onboarding, Insight Log)");

// Default game state structure (now includes onboarding, insight log)
const createInitialGameState = () => {
    const initial = {
        // Scores (includes RF, default 5)
        userScores: { A: 5, I: 5, S: 5, P: 5, C: 5, R: 5, RF: 5 },
        userAnswers: {}, // Populated below for all elements
        discoveredConcepts: new Map(),
        focusedConcepts: new Set(),
        focusSlotsTotal: Config.INITIAL_FOCUS_SLOTS,
        userInsight: Config.INITIAL_INSIGHT,
        // Attunement (includes RF, default 0)
        elementAttunement: { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0, RF: 0 },
        // Deep Dive Levels (includes RF, default 0)
        unlockedDeepDiveLevels: { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0, RF: 0 },
        achievedMilestones: new Set(),
        completedRituals: { daily: {}, weekly: {} }, // Weekly placeholder
        lastLoginDate: null,
        freeResearchAvailableToday: false, // Reset daily
        initialFreeResearchRemaining: Config.INITIAL_FREE_RESEARCH_COUNT,
        grimoireFirstVisitDone: false,
        seenPrompts: new Set(),
        currentElementIndex: -1,
        questionnaireCompleted: false,
        cardsAddedSinceLastPrompt: 0,
        promptCooldownActive: false,
        discoveredRepositoryItems: { scenes: new Set(), experiments: new Set(), insights: new Set() },
        pendingRarePrompts: [],
        unlockedFocusItems: new Set(),
        currentFocusSetHash: '', // Cache for tapestry calculation
        contemplationCooldownEnd: null,
        insightBoostCooldownEnd: null,
        // NEW STATE PROPERTIES v4
        onboardingPhase: 0, // Current phase of the onboarding tutorial
        onboardingComplete: false, // Has the user finished/skipped onboarding?
        insightLog: [], // Array of recent { timestamp, amount, source, newTotal } objects
    };
    // Initialize userAnswers structure for all elements
    elementNames.forEach(name => {
        initial.userAnswers[name] = {};
    });
    return initial;
};

let gameState = createInitialGameState();

// --- Internal Helper ---
function _calculateFocusSetHash() {
    if (!gameState.focusedConcepts || gameState.focusedConcepts.size === 0) { return ''; }
    const sortedIds = Array.from(gameState.focusedConcepts).sort((a, b) => a - b);
    return sortedIds.join(',');
}

// --- Saving & Loading ---
let saveTimeout = null;
const SAVE_DELAY = 1000; // Delay saving slightly to batch updates

function _triggerSave() {
     const saveIndicator = document.getElementById('saveIndicator');
     if(saveIndicator) saveIndicator.classList.remove('hidden');
     if (saveTimeout) clearTimeout(saveTimeout);
     saveTimeout = setTimeout(() => {
         try {
             // Prepare state for saving (convert Sets/Maps to Arrays/plain objects)
             const stateToSave = {
                 ...gameState, // Spread existing state
                 discoveredConcepts: Array.from(gameState.discoveredConcepts.entries()).map(([id, data]) => [id, {
                    discoveredTime: data.discoveredTime,
                    notes: data.notes,
                    unlockedLoreLevel: data.unlockedLoreLevel,
                    userCategory: data.userCategory,
                    newLoreAvailable: data.newLoreAvailable // Only save metadata, not full concept object
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
                 // insightLog is already an array of simple objects, safe to save directly
             };
             localStorage.setItem(Config.SAVE_KEY, JSON.stringify(stateToSave));
             // console.log("Game state saved."); // Reduce console noise
         } catch (error) { console.error("Error saving game state:", error); }
         finally { if(saveIndicator) saveIndicator.classList.add('hidden'); saveTimeout = null; }
     }, SAVE_DELAY);
}

export function saveGameState() { _triggerSave(); }

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
            const mergeWithDefault = (target, source, defaultValue) => {
                if (typeof source === 'object' && source !== null) {
                    target = { ...target, ...source };
                    // Ensure RF key exists, using provided default if missing in save
                    if (target.RF === undefined && defaultValue !== undefined) {
                        target.RF = defaultValue;
                    }
                }
                return target;
            };
            gameState.userScores = mergeWithDefault(gameState.userScores, loadedState.userScores, 5);
            gameState.elementAttunement = mergeWithDefault(gameState.elementAttunement, loadedState.elementAttunement, 0);
            gameState.unlockedDeepDiveLevels = mergeWithDefault(gameState.unlockedDeepDiveLevels, loadedState.unlockedDeepDiveLevels, 0);

            // --- Merge User Answers ---
             if (typeof loadedState.userAnswers === 'object' && loadedState.userAnswers !== null) {
                gameState.userAnswers = loadedState.userAnswers;
                // Ensure all element keys exist, including RF
                elementNames.forEach(name => { if (!gameState.userAnswers[name]) gameState.userAnswers[name] = {}; });
            }

            // --- Restore Collections (Maps & Sets) ---
            if (Array.isArray(loadedState.discoveredConcepts)) {
                gameState.discoveredConcepts = new Map(loadedState.discoveredConcepts.map(([id, savedConceptData]) => {
                    const conceptDataFromSource = concepts.find(c => c.id === id);
                    if (!conceptDataFromSource) { console.warn(`Load Error: Concept data for ID ${id} not found in data.js. Skipping.`); return null; }
                    // Rehydrate with full concept data + saved metadata
                    return [id, {
                       concept: conceptDataFromSource, // Link back to full data.js object
                       discoveredTime: savedConceptData.discoveredTime || Date.now(),
                       notes: savedConceptData.notes || "",
                       unlockedLoreLevel: savedConceptData.unlockedLoreLevel || 0,
                       userCategory: savedConceptData.userCategory || 'uncategorized',
                       newLoreAvailable: savedConceptData.newLoreAvailable || false
                   }];
                }).filter(entry => entry !== null));
            }
            const restoreSet = (key, defaultSet = new Set()) => Array.isArray(loadedState[key]) ? new Set(loadedState[key]) : defaultSet;
            gameState.focusedConcepts = restoreSet('focusedConcepts', gameState.focusedConcepts);
            gameState.achievedMilestones = restoreSet('achievedMilestones', gameState.achievedMilestones);
            gameState.seenPrompts = restoreSet('seenPrompts', gameState.seenPrompts);
            gameState.unlockedFocusItems = restoreSet('unlockedFocusItems', gameState.unlockedFocusItems);

            // Restore Repository Items
            gameState.discoveredRepositoryItems = { scenes: new Set(), experiments: new Set(), insights: new Set() };
            if (typeof loadedState.discoveredRepositoryItems === 'object' && loadedState.discoveredRepositoryItems !== null) {
                gameState.discoveredRepositoryItems.scenes = restoreSet('scenes', gameState.discoveredRepositoryItems.scenes, loadedState.discoveredRepositoryItems);
                gameState.discoveredRepositoryItems.experiments = restoreSet('experiments', gameState.discoveredRepositoryItems.experiments, loadedState.discoveredRepositoryItems);
                gameState.discoveredRepositoryItems.insights = restoreSet('insights', gameState.discoveredRepositoryItems.insights, loadedState.discoveredRepositoryItems);
            }

            // --- Merge Primitive/Simple Object Types (with defaults) ---
            const mergeSimple = (key, defaultValue) => loadedState[key] !== undefined ? loadedState[key] : defaultValue;
            gameState.focusSlotsTotal = mergeSimple('focusSlotsTotal', Config.INITIAL_FOCUS_SLOTS);
            gameState.userInsight = mergeSimple('userInsight', Config.INITIAL_INSIGHT);
            gameState.completedRituals = mergeSimple('completedRituals', { daily: {}, weekly: {} });
            gameState.lastLoginDate = mergeSimple('lastLoginDate', null);
            gameState.freeResearchAvailableToday = mergeSimple('freeResearchAvailableToday', false);
            gameState.initialFreeResearchRemaining = mergeSimple('initialFreeResearchRemaining', Config.INITIAL_FREE_RESEARCH_COUNT);
            gameState.grimoireFirstVisitDone = mergeSimple('grimoireFirstVisitDone', false);
            gameState.currentElementIndex = mergeSimple('currentElementIndex', -1);
            gameState.questionnaireCompleted = mergeSimple('questionnaireCompleted', false);
            gameState.cardsAddedSinceLastPrompt = mergeSimple('cardsAddedSinceLastPrompt', 0);
            gameState.promptCooldownActive = mergeSimple('promptCooldownActive', false);
            gameState.contemplationCooldownEnd = mergeSimple('contemplationCooldownEnd', null);
            gameState.insightBoostCooldownEnd = mergeSimple('insightBoostCooldownEnd', null);
            gameState.pendingRarePrompts = mergeSimple('pendingRarePrompts', []);
            // New state properties
            gameState.onboardingPhase = mergeSimple('onboardingPhase', 0);
            gameState.onboardingComplete = mergeSimple('onboardingComplete', gameState.questionnaireCompleted); // If questionnaire done, assume onboarding done in old saves
            gameState.insightLog = mergeSimple('insightLog', []);

            // Ensure log length doesn't exceed max from old saves
             gameState.insightLog = gameState.insightLog.slice(-Config.INSIGHT_LOG_MAX_ENTRIES);

             gameState.currentFocusSetHash = _calculateFocusSetHash(); // Calculate hash after loading focus

             console.log("Game state loaded successfully.");
            return true;
        } catch (error) {
            console.error("Error loading or parsing game state:", error);
            // Avoid clearing if the error was minor during merge? Or clear to be safe? Clearing is safer.
            clearGameState(); // Reset to default on error
            return false;
        }
    } else {
        console.log("No saved game state found.");
        gameState = createInitialGameState(); // Start fresh
        // Check if onboarding should start automatically
        if (Config.ONBOARDING_ENABLED) {
            gameState.onboardingPhase = 1; // Set to phase 1 to trigger start
            // Don't save here, let the first user action trigger the save
        }
        return false;
    }
}

export function clearGameState() {
     localStorage.removeItem(Config.SAVE_KEY);
     gameState = createInitialGameState(); // Reset runtime state
     // Trigger onboarding on reset if enabled
     if (Config.ONBOARDING_ENABLED) {
         gameState.onboardingPhase = 1;
     }
     console.log("Game state cleared and reset.");
     // Potentially trigger a page reload or UI reset function here if needed
     // window.location.reload(); // Or a softer UI reset
}

// --- Getters ---
// Basic getters remain largely the same
export function getState() { return gameState; }
export function getScores() { return gameState.userScores; }
export function getAttunement() { return gameState.elementAttunement; }
export function getInsight() { return gameState.userInsight; }
export function getDiscoveredConcepts() { return gameState.discoveredConcepts; }
export function getDiscoveredConceptData(conceptId) { return gameState.discoveredConcepts.get(conceptId); }
export function getFocusedConcepts() { return gameState.focusedConcepts; }
export function getFocusSlots() { return gameState.focusSlotsTotal; }
export function getRepositoryItems() { return gameState.discoveredRepositoryItems; }
export function getUnlockedFocusItems() { return gameState.unlockedFocusItems; }
export function getContemplationCooldownEnd() { return gameState.contemplationCooldownEnd; }
export function getInsightBoostCooldownEnd() { return gameState.insightBoostCooldownEnd; }
export function isFreeResearchAvailable() { return gameState.freeResearchAvailableToday; }
export function getInitialFreeResearchRemaining() { return gameState.initialFreeResearchRemaining; }
export function getSeenPrompts() { return gameState.seenPrompts; }
export function getCardCategory(conceptId) { const data = gameState.discoveredConcepts.get(conceptId); return data?.userCategory || 'uncategorized'; }
export function getUnlockedLoreLevel(conceptId) { const data = gameState.discoveredConcepts.get(conceptId); return data?.unlockedLoreLevel || 0; }
export function isNewLoreAvailable(conceptId) { const data = gameState.discoveredConcepts.get(conceptId); return data?.newLoreAvailable || false; }
// New Getters
export function getOnboardingPhase() { return gameState.onboardingPhase; }
export function isOnboardingComplete() { return gameState.onboardingComplete; }
export function getInsightLog() { return gameState.insightLog; }


// --- Setters / Updaters ---
// Scores, Answers, Questionnaire Flow
export function updateScores(newScores) { gameState.userScores = { ...gameState.userScores, ...newScores }; saveGameState(); return true; }
export function saveAllAnswers(allAnswers) { gameState.userAnswers = JSON.parse(JSON.stringify(allAnswers)); saveGameState(); }
export function updateAnswers(elementName, answersForElement) { if (!gameState.userAnswers) gameState.userAnswers = {}; if (!gameState.userAnswers[elementName]) gameState.userAnswers[elementName] = {}; gameState.userAnswers[elementName] = { ...answersForElement }; /* No save here - Questionnaire flow saves */ }
export function updateElementIndex(index) { gameState.currentElementIndex = index; /* No save here - Questionnaire flow saves */ }
export function setQuestionnaireComplete() { gameState.currentElementIndex = elementNames.length; if (!gameState.questionnaireCompleted) { gameState.questionnaireCompleted = true; // If onboarding isn't explicitly marked complete, mark it now
            if (!gameState.onboardingComplete) { gameState.onboardingComplete = true; gameState.onboardingPhase = Config.MAX_ONBOARDING_PHASE + 1; } saveGameState(); } return true; }

// Insight & Related Cooldowns/Features
export function changeInsight(amount, source = "Unknown") {
    const previousInsight = gameState.userInsight;
    gameState.userInsight = Math.max(0, previousInsight + amount);
    const actualChange = gameState.userInsight - previousInsight; // Calculate actual change after Math.max(0,...)
    if (actualChange !== 0) {
        addInsightLogEntry(actualChange, source, gameState.userInsight); // Log the actual change
        saveGameState();
        return true;
    }
    return false;
}
export function setInsightBoostCooldown(endTime) { gameState.insightBoostCooldownEnd = endTime; saveGameState(); }
export function setContemplationCooldown(endTime) { gameState.contemplationCooldownEnd = endTime; saveGameState(); }

// Research & Rituals
export function useInitialFreeResearch() { if (gameState.initialFreeResearchRemaining > 0) { gameState.initialFreeResearchRemaining--; saveGameState(); return true; } return false; }
export function setFreeResearchUsed() { gameState.freeResearchAvailableToday = false; saveGameState(); }
export function resetDailyRituals() { gameState.completedRituals.daily = {}; gameState.freeResearchAvailableToday = true; gameState.lastLoginDate = new Date().toDateString(); saveGameState(); }
export function completeRitualProgress(ritualId, period = 'daily') { if (!gameState.completedRituals[period]) gameState.completedRituals[period] = {}; if (!gameState.completedRituals[period][ritualId]) gameState.completedRituals[period][ritualId] = { completed: false, progress: 0 }; if (!gameState.completedRituals[period][ritualId].completed) { gameState.completedRituals[period][ritualId].progress += 1; saveGameState(); return gameState.completedRituals[period][ritualId].progress; } return gameState.completedRituals[period][ritualId].progress; }
export function markRitualComplete(ritualId, period = 'daily') { if (!gameState.completedRituals[period]?.[ritualId]) { if (!gameState.completedRituals[period]) gameState.completedRituals[period] = {}; gameState.completedRituals[period][ritualId] = { completed: false, progress: 0 }; } if (gameState.completedRituals[period]?.[ritualId]) { gameState.completedRituals[period][ritualId].completed = true; saveGameState(); } }

// Attunement & Deep Dive
export function updateAttunement(elementKey, amount) { // Handles RF key automatically
    if (gameState.elementAttunement.hasOwnProperty(elementKey)) {
        const current = gameState.elementAttunement[elementKey];
        const newValue = Math.min(Config.MAX_ATTUNEMENT, Math.max(0, current + amount));
        if (newValue !== current) { gameState.elementAttunement[elementKey] = newValue; saveGameState(); return true; }
    }
    return false;
}
export function unlockLibraryLevel(elementKey, level) { // Handles RF key automatically
    if (gameState.unlockedDeepDiveLevels.hasOwnProperty(elementKey)) {
        const currentLevel = gameState.unlockedDeepDiveLevels[elementKey] || 0;
        if (level === currentLevel + 1) { gameState.unlockedDeepDiveLevels[elementKey] = level; saveGameState(); return true; }
    }
    return false;
}

// Concept Management (Discovered, Focus, Notes, Lore, Category)
export function addDiscoveredConcept(conceptId, conceptData) {
    if (!(gameState.discoveredConcepts instanceof Map)) { console.error("CRITICAL ERROR: gameState.discoveredConcepts is not a Map!"); return false; }
    if (!gameState.discoveredConcepts.has(conceptId)) {
        gameState.discoveredConcepts.set(conceptId, {
            concept: conceptData, // Store full concept data at runtime
            discoveredTime: Date.now(),
            notes: "",
            unlockedLoreLevel: 0,
            userCategory: 'uncategorized',
            newLoreAvailable: false
        });
        saveGameState();
        return true;
    }
    return false;
}
export function removeDiscoveredConcept(conceptId) {
    if (!(gameState.discoveredConcepts instanceof Map)) { console.error("CRITICAL ERROR: gameState.discoveredConcepts is not a Map!"); return false; }
    if (gameState.discoveredConcepts.has(conceptId)) {
        gameState.discoveredConcepts.delete(conceptId);
        // Ensure focus is also removed if the concept is deleted
        if (gameState.focusedConcepts.has(conceptId)) {
             gameState.focusedConcepts.delete(conceptId);
             gameState.currentFocusSetHash = _calculateFocusSetHash(); // Update hash
        }
        saveGameState();
        return true;
    }
    return false;
}
export function toggleFocusConcept(conceptId) {
     if (!(gameState.discoveredConcepts instanceof Map)) { console.error("CRITICAL ERROR: gameState.discoveredConcepts is not a Map!"); return 'not_discovered'; }
    if (!gameState.discoveredConcepts.has(conceptId)) return 'not_discovered';
    let result;
    if (gameState.focusedConcepts.has(conceptId)) {
        gameState.focusedConcepts.delete(conceptId);
        result = 'removed';
    }
    else {
        if (gameState.focusedConcepts.size >= gameState.focusSlotsTotal) { return 'slots_full'; }
        gameState.focusedConcepts.add(conceptId);
        result = 'added';
    }
    gameState.currentFocusSetHash = _calculateFocusSetHash(); // Update hash
    saveGameState();
    return result;
}
export function increaseFocusSlots(amount = 1) { const newSlots = Math.min(Config.MAX_FOCUS_SLOTS, gameState.focusSlotsTotal + amount); if (newSlots > gameState.focusSlotsTotal) { gameState.focusSlotsTotal = newSlots; saveGameState(); return true; } return false; }
export function updateNotes(conceptId, notes) { if (!(gameState.discoveredConcepts instanceof Map)) { console.error("CRITICAL ERROR: gameState.discoveredConcepts is not a Map!"); return false; } const data = gameState.discoveredConcepts.get(conceptId); if (data) { data.notes = notes; gameState.discoveredConcepts.set(conceptId, data); saveGameState(); return true; } return false; }
export function setCardCategory(conceptId, categoryId) { if (!(gameState.discoveredConcepts instanceof Map)) { console.error("Cannot set category: discoveredConcepts is not a Map!"); return false; } const data = gameState.discoveredConcepts.get(conceptId); if (data) { if (data.userCategory !== categoryId) { data.userCategory = categoryId || 'uncategorized'; gameState.discoveredConcepts.set(conceptId, data); saveGameState(); return true; } } else { console.warn(`Cannot set category for unknown conceptId: ${conceptId}`); } return false; }
export function unlockLoreLevel(conceptId, level) { if (!(gameState.discoveredConcepts instanceof Map)) { console.error("Cannot unlock lore: discoveredConcepts is not a Map!"); return false; } const data = gameState.discoveredConcepts.get(conceptId); if (data) { const currentLevel = data.unlockedLoreLevel || 0; if (level > currentLevel) { data.unlockedLoreLevel = level; data.newLoreAvailable = true; gameState.discoveredConcepts.set(conceptId, data); saveGameState(); return true; } } else { console.warn(`Cannot unlock lore for unknown conceptId: ${conceptId}`); } return false; }
export function markLoreAsSeen(conceptId) { if (!(gameState.discoveredConcepts instanceof Map)) { return false; } const data = gameState.discoveredConcepts.get(conceptId); if (data && data.newLoreAvailable) { data.newLoreAvailable = false; gameState.discoveredConcepts.set(conceptId, data); saveGameState(); return true; } return false; }

// Reflection & Repository Management
export function addSeenPrompt(promptId) { if (!(gameState.seenPrompts instanceof Set)) { console.error("CRITICAL ERROR: gameState.seenPrompts is not a Set!"); gameState.seenPrompts = new Set();} gameState.seenPrompts.add(promptId); saveGameState(); }
export function incrementReflectionTrigger() { gameState.cardsAddedSinceLastPrompt++; /* No save here - part of flow */ }
export function resetReflectionTrigger(startCooldown = false) { gameState.cardsAddedSinceLastPrompt = 0; if (startCooldown) setPromptCooldownActive(true); /* Cooldown save handled by setPromptCooldownActive */ }
export function setPromptCooldownActive(isActive) { gameState.promptCooldownActive = isActive; saveGameState(); }
export function clearReflectionCooldown() { gameState.promptCooldownActive = false; saveGameState(); }
export function addRepositoryItem(itemType, itemId) { if (!gameState.discoveredRepositoryItems || typeof gameState.discoveredRepositoryItems !== 'object') { console.error(`CRITICAL ERROR: gameState.discoveredRepositoryItems is not an object!`); gameState.discoveredRepositoryItems = { scenes: new Set(), experiments: new Set(), insights: new Set() };} if (!gameState.discoveredRepositoryItems[itemType] || !(gameState.discoveredRepositoryItems[itemType] instanceof Set)) { console.error(`CRITICAL ERROR: gameState.discoveredRepositoryItems.${itemType} is not a Set!`); gameState.discoveredRepositoryItems[itemType] = new Set();} if (gameState.discoveredRepositoryItems[itemType] && !gameState.discoveredRepositoryItems[itemType].has(itemId)) { gameState.discoveredRepositoryItems[itemType].add(itemId); saveGameState(); return true; } return false; }
export function addPendingRarePrompt(promptId) { if (!Array.isArray(gameState.pendingRarePrompts)) {console.error("CRITICAL ERROR: gameState.pendingRarePrompts is not an Array!"); gameState.pendingRarePrompts = [];} if (!gameState.pendingRarePrompts.includes(promptId)) { gameState.pendingRarePrompts.push(promptId); saveGameState(); return true; } return false; }
export function getNextRarePrompt() { if (!Array.isArray(gameState.pendingRarePrompts)) {console.error("CRITICAL ERROR: gameState.pendingRarePrompts is not an Array!"); gameState.pendingRarePrompts = []; return null;} if (gameState.pendingRarePrompts.length > 0) { const promptId = gameState.pendingRarePrompts.shift(); saveGameState(); return promptId; } return null; }
export function addUnlockedFocusItem(unlockId) { if (!(gameState.unlockedFocusItems instanceof Set)) { console.error("CRITICAL ERROR: gameState.unlockedFocusItems is not a Set!"); gameState.unlockedFocusItems = new Set();} if (!gameState.unlockedFocusItems.has(unlockId)) { gameState.unlockedFocusItems.add(unlockId); saveGameState(); return true; } return false; }

// Milestones & Misc
export function addAchievedMilestone(milestoneId) { if (!(gameState.achievedMilestones instanceof Set)) { console.error("CRITICAL ERROR: gameState.achievedMilestones is not a Set!"); gameState.achievedMilestones = new Set();} if (!gameState.achievedMilestones.has(milestoneId)) { gameState.achievedMilestones.add(milestoneId); saveGameState(); return true; } return false; }
export function markGrimoireVisited() { if (!gameState.grimoireFirstVisitDone) { gameState.grimoireFirstVisitDone = true; saveGameState(); console.log("Marked Grimoire as visited for the first time."); } }

// --- New State Functions ---
export function advanceOnboardingPhase() {
    if (!gameState.onboardingComplete) {
        gameState.onboardingPhase++;
        console.log(`Advanced onboarding to phase ${gameState.onboardingPhase}`);
        if (gameState.onboardingPhase > Config.MAX_ONBOARDING_PHASE) {
            markOnboardingComplete();
        }
        saveGameState();
        return gameState.onboardingPhase;
    }
    return gameState.onboardingPhase;
}

export function markOnboardingComplete() {
    if (!gameState.onboardingComplete) {
        gameState.onboardingComplete = true;
        gameState.onboardingPhase = Config.MAX_ONBOARDING_PHASE + 1; // Ensure phase is marked as done
        console.log("Onboarding marked as complete.");
        saveGameState();
    }
}

export function addInsightLogEntry(amount, source, newTotal) {
    if (!Array.isArray(gameState.insightLog)) {
        console.error("Insight log is not an array! Reinitializing.");
        gameState.insightLog = [];
    }
    const timestamp = Date.now();
    const entry = {
        timestamp: formatTimestamp(timestamp),
        amount: parseFloat(amount.toFixed(1)), // Store as number
        source: source,
        newTotal: parseFloat(newTotal.toFixed(1)) // Store as number
    };
    gameState.insightLog.push(entry);
    // Keep log trimmed to max size
    if (gameState.insightLog.length > Config.INSIGHT_LOG_MAX_ENTRIES) {
        gameState.insightLog.shift(); // Remove the oldest entry
    }
    // Note: Saving is handled by the calling function (changeInsight)
}


console.log("state.js loaded.");
// --- END OF FILE state.js ---
