// js/state.js - Manages Application State and Persistence (Inner Cosmos Theme)
import * as Config from './config.js';
import { elementNames } from '../data.js'; // Still using original element names internally

console.log("state.js loading...");

// Default game state structure
const createInitialGameState = () => {
    const initial = {
        // Core user profile - maps to "Forces" in UI
        userScores: { A: 5, I: 5, S: 5, P: 5, C: 5, R: 5 },
        userAnswers: {}, // Stores answers from the "Charting" (Questionnaire) phase

        // Discovered "Stars" (Concepts) - Map<ID, StarData>
        // StarData: { concept: ConceptObject, discoveredTime: timestamp, artUnlocked: boolean, notes: string }
        discoveredConcepts: new Map(),

        // "Aligned" Stars (Focused Concepts) - Set<ID>
        focusedConcepts: new Set(),
        focusSlotsTotal: Config.INITIAL_FOCUS_SLOTS, // Max number of stars user can align

        userInsight: Config.INITIAL_INSIGHT, // Core currency

        // User's affinity/strength with core "Forces" (Elements)
        elementAttunement: { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 },

        // Unlocked deeper knowledge about Forces (Element Deep Dive)
        unlockedDeepDiveLevels: { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 },

        // "Legendary Alignments" (Milestones) achieved - Set<ID>
        achievedMilestones: new Set(),

        // Completed "Stellar Harmonics" (Rituals)
        completedRituals: { daily: {}, weekly: {} }, // Keep structure for now
        lastLoginDate: null,
        freeResearchAvailableToday: false, // Renamed to "Daily Calibration Scan" in UI

        // Reflection prompt tracking
        seenPrompts: new Set(),
        cardsAddedSinceLastPrompt: 0, // Tracks "Stars Cataloged" for reflection trigger
        promptCooldownActive: false,

        // Discovered "Cartography" items (Repository)
        discoveredRepositoryItems: {
            scenes: new Set(), // Nebula Blueprints
            experiments: new Set(), // Stable Orbits (Completed)
            insights: new Set() // Cosmic Whispers
        },
        pendingRarePrompts: [], // Queued special reflection prompts

        // Items unlocked by specific "Alignments" (Focus Unlocks) - Set<ID>
        unlockedFocusItems: new Set(),

        // Hashing aligned stars for cache invalidation
        currentFocusSetHash: '',

        // Deep Dive Contemplation cooldown
        contemplationCooldownEnd: null,

        // --- Onboarding ---
        onboardingPhase: Config.ONBOARDING_PHASE.START, // Tracks overall progression
        onboardingTutorialStep: 'start', // Tracks specific tutorial step (NEW)
        // Redundant boolean flags removed, handled by tutorialStep now
        // hasSeenResultsModal: false,
        // hasSeenGrimoireTutorial: false,
        // hasSeenFocusTutorial: false,
        // hasSeenStudyTutorial: false,
        // hasSeenReflectionIntro: false,
        questionnaireCompleted: false, // Tracks if charting/questionnaire is done
        currentElementIndex: -1, // Tracks progress within charting/questionnaire

    };
    // Explicitly initialize userAnswers sub-objects
    elementNames.forEach(name => {
        initial.userAnswers[name] = {};
    });
    return initial;
};

// Initialize current state using the function
let gameState = createInitialGameState();

// --- Internal Helper ---
function _calculateFocusSetHash() {
    // Calculates a unique string based on currently aligned stars (focused concepts)
    if (!gameState.focusedConcepts || gameState.focusedConcepts.size === 0) { return ''; }
    const sortedIds = Array.from(gameState.focusedConcepts).sort((a, b) => a - b);
    return sortedIds.join(',');
}

// --- Saving & Loading ---
let saveTimeout = null;
const SAVE_DELAY = 1000; // ms delay before saving after a change

function _triggerSave() {
     const saveIndicator = document.getElementById('saveIndicator');
     if(saveIndicator) saveIndicator.classList.remove('hidden');
     if (saveTimeout) clearTimeout(saveTimeout);
     saveTimeout = setTimeout(() => {
         try {
             // Serialize the current gameState
             const stateToSave = {
                 ...gameState, // Copies all top-level properties including primitives like onboardingTutorialStep
                 // Convert Sets and Maps to Arrays for JSON compatibility
                 discoveredConcepts: Array.from(gameState.discoveredConcepts.entries()),
                 focusedConcepts: Array.from(gameState.focusedConcepts),
                 achievedMilestones: Array.from(gameState.achievedMilestones),
                 seenPrompts: Array.from(gameState.seenPrompts),
                 discoveredRepositoryItems: {
                     scenes: Array.from(gameState.discoveredRepositoryItems.scenes),
                     experiments: Array.from(gameState.discoveredRepositoryItems.experiments),
                     insights: Array.from(gameState.discoveredRepositoryItems.insights),
                 },
                 unlockedFocusItems: Array.from(gameState.unlockedFocusItems)
             };
             localStorage.setItem(Config.SAVE_KEY, JSON.stringify(stateToSave));
             // console.log("Game state saved."); // Optional: for debugging
         } catch (error) { console.error("Error saving game state:", error); }
         finally { if(saveIndicator) saveIndicator.classList.add('hidden'); saveTimeout = null; }
     }, SAVE_DELAY);
}

export function saveGameState() { _triggerSave(); }

export function loadGameState() {
    console.log("Attempting to load game state...");
    const savedData = localStorage.getItem(Config.SAVE_KEY);
    if (savedData) {
        try {
            const loadedState = JSON.parse(savedData);
            console.log("Saved data found.");
            // Reset to initial state first to ensure all properties exist
            gameState = createInitialGameState();

            // Carefully merge loaded data, providing defaults if properties are missing
            gameState.userScores = typeof loadedState.userScores === 'object' && loadedState.userScores !== null ? { ...gameState.userScores, ...loadedState.userScores } : gameState.userScores;
            gameState.userAnswers = typeof loadedState.userAnswers === 'object' && loadedState.userAnswers !== null ? loadedState.userAnswers : {};
            elementNames.forEach(name => { if (!gameState.userAnswers[name]) gameState.userAnswers[name] = {}; }); // Ensure all element keys exist
            gameState.discoveredConcepts = new Map(Array.isArray(loadedState.discoveredConcepts) ? loadedState.discoveredConcepts : []);
            gameState.focusedConcepts = new Set(Array.isArray(loadedState.focusedConcepts) ? loadedState.focusedConcepts : []);
            gameState.focusSlotsTotal = typeof loadedState.focusSlotsTotal === 'number' ? loadedState.focusSlotsTotal : gameState.focusSlotsTotal;
            gameState.userInsight = typeof loadedState.userInsight === 'number' ? loadedState.userInsight : gameState.userInsight;
            gameState.elementAttunement = typeof loadedState.elementAttunement === 'object' && loadedState.elementAttunement !== null ? { ...gameState.elementAttunement, ...loadedState.elementAttunement } : gameState.elementAttunement;
            gameState.unlockedDeepDiveLevels = typeof loadedState.unlockedDeepDiveLevels === 'object' && loadedState.unlockedDeepDiveLevels !== null ? { ...gameState.unlockedDeepDiveLevels, ...loadedState.unlockedDeepDiveLevels } : gameState.unlockedDeepDiveLevels;
            gameState.achievedMilestones = new Set(Array.isArray(loadedState.achievedMilestones) ? loadedState.achievedMilestones : []);
            gameState.completedRituals = typeof loadedState.completedRituals === 'object' && loadedState.completedRituals !== null ? loadedState.completedRituals : gameState.completedRituals;
            gameState.lastLoginDate = typeof loadedState.lastLoginDate === 'string' ? loadedState.lastLoginDate : gameState.lastLoginDate;
            gameState.freeResearchAvailableToday = typeof loadedState.freeResearchAvailableToday === 'boolean' ? loadedState.freeResearchAvailableToday : gameState.freeResearchAvailableToday;
            gameState.seenPrompts = new Set(Array.isArray(loadedState.seenPrompts) ? loadedState.seenPrompts : []);
            gameState.currentElementIndex = typeof loadedState.currentElementIndex === 'number' ? loadedState.currentElementIndex : gameState.currentElementIndex;
            gameState.questionnaireCompleted = typeof loadedState.questionnaireCompleted === 'boolean' ? loadedState.questionnaireCompleted : gameState.questionnaireCompleted;
            gameState.cardsAddedSinceLastPrompt = typeof loadedState.cardsAddedSinceLastPrompt === 'number' ? loadedState.cardsAddedSinceLastPrompt : gameState.cardsAddedSinceLastPrompt;
            gameState.promptCooldownActive = typeof loadedState.promptCooldownActive === 'boolean' ? loadedState.promptCooldownActive : gameState.promptCooldownActive;
            // Load repository items safely
            gameState.discoveredRepositoryItems = {
                scenes: new Set(Array.isArray(loadedState.discoveredRepositoryItems?.scenes) ? loadedState.discoveredRepositoryItems.scenes : []),
                experiments: new Set(Array.isArray(loadedState.discoveredRepositoryItems?.experiments) ? loadedState.discoveredRepositoryItems.experiments : []),
                insights: new Set(Array.isArray(loadedState.discoveredRepositoryItems?.insights) ? loadedState.discoveredRepositoryItems.insights : []),
            };
            gameState.pendingRarePrompts = Array.isArray(loadedState.pendingRarePrompts) ? loadedState.pendingRarePrompts : gameState.pendingRarePrompts;
            gameState.unlockedFocusItems = new Set(Array.isArray(loadedState.unlockedFocusItems) ? loadedState.unlockedFocusItems : []);
            gameState.contemplationCooldownEnd = typeof loadedState.contemplationCooldownEnd === 'number' ? loadedState.contemplationCooldownEnd : gameState.contemplationCooldownEnd;

            // Load onboarding phase and tutorial step
            gameState.onboardingPhase = typeof loadedState.onboardingPhase === 'number' ? loadedState.onboardingPhase : Config.ONBOARDING_PHASE.START;
            gameState.onboardingTutorialStep = typeof loadedState.onboardingTutorialStep === 'string' ? loadedState.onboardingTutorialStep : 'start';

            // If loading an older save where tutorialStep didn't exist, try to infer it
            // Or simply mark as 'complete' if questionnaire is done.
            if (typeof loadedState.onboardingTutorialStep === 'undefined' && gameState.questionnaireCompleted) {
                console.log("Older save detected, marking tutorial as complete.");
                gameState.onboardingTutorialStep = 'complete';
            }

            gameState.currentFocusSetHash = _calculateFocusSetHash();

            console.log("Game state loaded successfully.");
            return true;
        } catch (error) {
            console.error("Error loading or parsing game state:", error);
            localStorage.removeItem(Config.SAVE_KEY); // Clear potentially corrupted data
            gameState = createInitialGameState(); // Reset to default
            return false;
        }
    } else {
        console.log("No saved game state found.");
        gameState = createInitialGameState(); // Ensure default state
        return false;
    }
}

export function clearGameState() {
    localStorage.removeItem(Config.SAVE_KEY);
    gameState = createInitialGameState(); // Reset to default using the function
    console.log("Game state cleared and reset.");
}

// --- Getters ---
export function getState() { return gameState; }
export function getScores() { return gameState.userScores; } // Core Forces
export function getAttunement() { return gameState.elementAttunement; } // Force Strength
export function getInsight() { return gameState.userInsight; }
export function getDiscoveredConcepts() { return gameState.discoveredConcepts; } // Discovered Stars
export function getDiscoveredConceptData(conceptId) { return gameState.discoveredConcepts.get(conceptId); } // Star Data
export function getFocusedConcepts() { return gameState.focusedConcepts; } // Aligned Stars
export function getFocusSlots() { return gameState.focusSlotsTotal; } // Alignment Slots
export function getRepositoryItems() { return gameState.discoveredRepositoryItems; } // Cartography Items
export function getUnlockedFocusItems() { return gameState.unlockedFocusItems; } // Synergy Unlocks
export function getCurrentFocusSetHash() { return gameState.currentFocusSetHash; }
export function getContemplationCooldownEnd() { return gameState.contemplationCooldownEnd; }
export function getOnboardingPhase() { return gameState.onboardingPhase; }
export function getOnboardingTutorialStep() { return gameState.onboardingTutorialStep; } // NEW Getter
export function isFreeResearchAvailable() { return gameState.freeResearchAvailableToday; } // Daily Scan

// --- Setters / Updaters (Trigger Save) ---
export function updateScores(newScores) {
    gameState.userScores = { ...newScores };
    saveGameState();
    return true;
}
export function saveAllAnswers(allAnswers) {
    gameState.userAnswers = JSON.parse(JSON.stringify(allAnswers));
    saveGameState();
}
export function updateAnswers(elementName, answersForElement) {
    if (!gameState.userAnswers) { gameState.userAnswers = {}; }
    if (!gameState.userAnswers[elementName]) { gameState.userAnswers[elementName] = {}; }
    gameState.userAnswers[elementName] = { ...answersForElement };
    // No save here, saved implicitly by other actions during questionnaire
}
export function updateElementIndex(index) {
    gameState.currentElementIndex = index;
    // No save here, part of transient questionnaire state
}
export function setQuestionnaireComplete() {
    gameState.currentElementIndex = elementNames.length; // Mark finished index
    if (!gameState.questionnaireCompleted) {
        gameState.questionnaireCompleted = true;
        // Onboarding phase advancement is now handled AFTER the results modal
    }
    // Actual save triggered later in finalizeQuestionnaire
    return true;
}
export function advanceOnboardingPhase(targetPhase) {
    if (targetPhase > gameState.onboardingPhase) {
        console.log(`Advancing onboarding phase from ${gameState.onboardingPhase} to ${targetPhase}`);
        gameState.onboardingPhase = targetPhase;
        saveGameState(); // Save phase change
        return true;
    }
    return false;
}
// NEW Setter for tutorial step
export function setOnboardingTutorialStep(step) {
    if (typeof step === 'string' && gameState.onboardingTutorialStep !== step) {
        console.log(`Setting tutorial step to: ${step}`);
        gameState.onboardingTutorialStep = step;
        saveGameState(); // Save tutorial progress
    }
}
export function changeInsight(amount) {
    const previousInsight = gameState.userInsight;
    gameState.userInsight = Math.max(0, previousInsight + amount);
    if (gameState.userInsight !== previousInsight) { saveGameState(); return true; }
    return false;
}
export function updateAttunement(elementKey, amount) { // Force Strength
    if (gameState.elementAttunement.hasOwnProperty(elementKey)) {
        const current = gameState.elementAttunement[elementKey];
        const newValue = Math.min(Config.MAX_ATTUNEMENT, Math.max(0, current + amount));
        if (newValue !== current) { gameState.elementAttunement[elementKey] = newValue; saveGameState(); return true; }
    }
    return false;
}
export function addDiscoveredConcept(conceptId, conceptData) { // Catalog Star
    if (!(gameState.discoveredConcepts instanceof Map)) { console.error("CRITICAL ERROR: gameState.discoveredConcepts is not a Map!"); gameState.discoveredConcepts = new Map(); }
    if (!gameState.discoveredConcepts.has(conceptId)) {
        gameState.discoveredConcepts.set(conceptId, { concept: conceptData, discoveredTime: Date.now(), artUnlocked: false, notes: "" });
        // Phase advancement handled by core game loop milestones/actions now
        saveGameState();
        return true;
    }
    return false;
}
export function removeDiscoveredConcept(conceptId) { // Remove Star from Catalog
    if (!(gameState.discoveredConcepts instanceof Map)) { console.error("CRITICAL ERROR: gameState.discoveredConcepts is not a Map!"); return false; }
    if (gameState.discoveredConcepts.has(conceptId)) {
        gameState.discoveredConcepts.delete(conceptId);
        // If it was aligned, unalign it
        if (gameState.focusedConcepts.has(conceptId)) { gameState.focusedConcepts.delete(conceptId); gameState.currentFocusSetHash = _calculateFocusSetHash(); }
        saveGameState();
        return true;
    }
    return false;
}
export function toggleFocusConcept(conceptId) { // Align/Unalign Star
     if (!(gameState.discoveredConcepts instanceof Map)) { console.error("CRITICAL ERROR: gameState.discoveredConcepts is not a Map!"); return 'not_discovered'; }
    if (!gameState.discoveredConcepts.has(conceptId)) return 'not_discovered'; // Not in catalog
    let result;
    if (gameState.focusedConcepts.has(conceptId)) { // If aligned, unalign
        gameState.focusedConcepts.delete(conceptId); result = 'removed';
    }
    else { // If not aligned, try to align
        if (gameState.focusedConcepts.size >= gameState.focusSlotsTotal) { return 'slots_full'; } // Check slots
        gameState.focusedConcepts.add(conceptId); result = 'added';
        // Advance phase only if needed and first focus concept added
        // Let's tie this to seeing the tutorial step instead
        // if (gameState.onboardingPhase < Config.ONBOARDING_PHASE.STUDY_INSIGHT && gameState.focusedConcepts.size === 1) {
        //      advanceOnboardingPhase(Config.ONBOARDING_PHASE.STUDY_INSIGHT);
        // }
    }
    gameState.currentFocusSetHash = _calculateFocusSetHash(); // Update hash for tapestry cache
    saveGameState();
    return result;
}
export function increaseFocusSlots(amount = 1) { // Increase Alignment Capacity
    const newSlots = Math.min(Config.MAX_FOCUS_SLOTS, gameState.focusSlotsTotal + amount);
    if (newSlots > gameState.focusSlotsTotal) { gameState.focusSlotsTotal = newSlots; saveGameState(); return true; }
    return false;
}
export function updateNotes(conceptId, notes) { // Update Star Logbook
     if (!(gameState.discoveredConcepts instanceof Map)) { console.error("CRITICAL ERROR: gameState.discoveredConcepts is not a Map!"); return false; }
    const data = gameState.discoveredConcepts.get(conceptId);
    if (data) { data.notes = notes; gameState.discoveredConcepts.set(conceptId, data); saveGameState(); return true; }
    return false;
}
export function unlockArt(conceptId) { // Evolve Star
     if (!(gameState.discoveredConcepts instanceof Map)) { console.error("CRITICAL ERROR: gameState.discoveredConcepts is not a Map!"); return false; }
    const data = gameState.discoveredConcepts.get(conceptId);
    if (data && !data.artUnlocked) {
        data.artUnlocked = true; gameState.discoveredConcepts.set(conceptId, data);
        if (gameState.onboardingPhase < Config.ONBOARDING_PHASE.ADVANCED) { advanceOnboardingPhase(Config.ONBOARDING_PHASE.ADVANCED); } // Evolving implies advanced stage
        saveGameState();
        return true;
    }
    return false;
}
export function unlockLibraryLevel(elementKey, level) { // Deepen Force Understanding
    if (gameState.unlockedDeepDiveLevels.hasOwnProperty(elementKey)) {
        const currentLevel = gameState.unlockedDeepDiveLevels[elementKey];
        if (level === currentLevel + 1) {
            gameState.unlockedDeepDiveLevels[elementKey] = level;
            if (gameState.onboardingPhase < Config.ONBOARDING_PHASE.ADVANCED && Object.values(gameState.unlockedDeepDiveLevels).some(l => l >= 1)) { advanceOnboardingPhase(Config.ONBOARDING_PHASE.ADVANCED); } // Unlocking deep dive implies advanced stage
            saveGameState();
            return true;
        }
    }
    return false;
}
export function resetDailyRituals() { // Reset Stellar Harmonics / Daily Scan
    gameState.completedRituals.daily = {}; gameState.freeResearchAvailableToday = true; gameState.lastLoginDate = new Date().toDateString();
    saveGameState();
}
export function setFreeResearchUsed() { // Daily Scan Used
    gameState.freeResearchAvailableToday = false; saveGameState();
}
export function completeRitualProgress(ritualId, period = 'daily') {
    if (!gameState.completedRituals[period]) gameState.completedRituals[period] = {}; if (!gameState.completedRituals[period][ritualId]) gameState.completedRituals[period][ritualId] = { completed: false, progress: 0 };
    gameState.completedRituals[period][ritualId].progress += 1; saveGameState();
    return gameState.completedRituals[period][ritualId].progress;
}
export function markRitualComplete(ritualId, period = 'daily') {
    if (!gameState.completedRituals[period]?.[ritualId]) { completeRitualProgress(ritualId, period); } // Ensure progress exists
    if (gameState.completedRituals[period]?.[ritualId]) { gameState.completedRituals[period][ritualId].completed = true; saveGameState(); }
}
export function addAchievedMilestone(milestoneId) { // Achieve Legendary Alignment
    if (!(gameState.achievedMilestones instanceof Set)) { console.error("CRITICAL ERROR: gameState.achievedMilestones is not a Set!"); gameState.achievedMilestones = new Set();}
    if (!gameState.achievedMilestones.has(milestoneId)) {
        gameState.achievedMilestones.add(milestoneId);
        // Check for phase advancement based on milestone ID (ensure IDs match data.js)
        const STUDY_UNLOCK_MILESTONE_ID = 'ms05'; // Example
        const REFLECTION_UNLOCK_MILESTONE_ID = 'ms07'; // Example
        const REPO_UNLOCK_MILESTONE_ID = 'ms73'; // Example: Repo Explorer

        if (milestoneId === STUDY_UNLOCK_MILESTONE_ID && gameState.onboardingPhase < Config.ONBOARDING_PHASE.STUDY_INSIGHT) advanceOnboardingPhase(Config.ONBOARDING_PHASE.STUDY_INSIGHT);
        if (milestoneId === REFLECTION_UNLOCK_MILESTONE_ID && gameState.onboardingPhase < Config.ONBOARDING_PHASE.REFLECTION_RITUALS) advanceOnboardingPhase(Config.ONBOARDING_PHASE.REFLECTION_RITUALS);
        if (milestoneId === REPO_UNLOCK_MILESTONE_ID && gameState.onboardingPhase < Config.ONBOARDING_PHASE.ADVANCED) advanceOnboardingPhase(Config.ONBOARDING_PHASE.ADVANCED);
        // Add more phase triggers if needed

        saveGameState(); // Save after adding milestone & potentially advancing phase
        return true;
    }
    return false;
}
export function addSeenPrompt(promptId) {
     if (!(gameState.seenPrompts instanceof Set)) { console.error("CRITICAL ERROR: gameState.seenPrompts is not a Set!"); gameState.seenPrompts = new Set();}
    gameState.seenPrompts.add(promptId); saveGameState();
}
export function incrementReflectionTrigger() {
    gameState.cardsAddedSinceLastPrompt++;
    // No save here, triggered by other actions
}
export function resetReflectionTrigger(startCooldown = false) {
    gameState.cardsAddedSinceLastPrompt = 0;
    if (startCooldown) { setPromptCooldownActive(true); }
    // No immediate save, cooldown timeout or other actions will save
}
export function setPromptCooldownActive(isActive) {
    gameState.promptCooldownActive = isActive;
    // Save state handled by gameLogic cooldown timeout or other actions
}
export function clearReflectionCooldown() {
    gameState.promptCooldownActive = false; saveGameState();
}
export function addRepositoryItem(itemType, itemId) { // Add Cartography Item
    if (!gameState.discoveredRepositoryItems[itemType]) { console.error(`Invalid repo item type: ${itemType}`); return false;}
    if (!(gameState.discoveredRepositoryItems[itemType] instanceof Set)) { console.error(`CRITICAL ERROR: gameState.discoveredRepositoryItems.${itemType} is not a Set!`); gameState.discoveredRepositoryItems[itemType] = new Set();}
    if (gameState.discoveredRepositoryItems[itemType] && !gameState.discoveredRepositoryItems[itemType].has(itemId)) {
        gameState.discoveredRepositoryItems[itemType].add(itemId);
        const repoNotEmpty = Object.values(gameState.discoveredRepositoryItems).some(set => set.size > 0);
        // Automatically advance phase if Repo/Cartography becomes non-empty
        if (gameState.onboardingPhase < Config.ONBOARDING_PHASE.ADVANCED && repoNotEmpty) {
             advanceOnboardingPhase(Config.ONBOARDING_PHASE.ADVANCED);
        } else {
            saveGameState(); // Save even if phase didn't change
        }
        return true;
    }
    return false;
}
export function addPendingRarePrompt(promptId) {
    if (!Array.isArray(gameState.pendingRarePrompts)) {console.error("CRITICAL ERROR: gameState.pendingRarePrompts is not an Array!"); gameState.pendingRarePrompts = [];}
    if (!gameState.pendingRarePrompts.includes(promptId)) { gameState.pendingRarePrompts.push(promptId); saveGameState(); return true; }
    return false;
}
export function getNextRarePrompt() {
    if (!Array.isArray(gameState.pendingRarePrompts)) {console.error("CRITICAL ERROR: gameState.pendingRarePrompts is not an Array!"); gameState.pendingRarePrompts = []; return null;}
    if (gameState.pendingRarePrompts.length > 0) { const promptId = gameState.pendingRarePrompts.shift(); saveGameState(); return promptId; }
    return null;
}
export function addUnlockedFocusItem(unlockId) { // Add Synergy Unlock
    if (!(gameState.unlockedFocusItems instanceof Set)) { console.error("CRITICAL ERROR: gameState.unlockedFocusItems is not a Set!"); gameState.unlockedFocusItems = new Set();}
    if (!gameState.unlockedFocusItems.has(unlockId)) {
        gameState.unlockedFocusItems.add(unlockId);
        if (gameState.onboardingPhase < Config.ONBOARDING_PHASE.ADVANCED) { advanceOnboardingPhase(Config.ONBOARDING_PHASE.ADVANCED); } // Unlocking these implies advanced stage
        else { saveGameState(); }
        return true;
    }
    return false;
}
export function setContemplationCooldown(endTime) {
    gameState.contemplationCooldownEnd = endTime; saveGameState();
}


console.log("state.js loaded.");
