// --- START OF FILE script.js (MODIFIED FOR TUTORIAL STATE) ---

// --- Constants (Moved from config.js for non-module environment) ---
const SAVE_KEY = 'personaAlchemyLabSaveData'; // Keeping original key for now
const MAX_ATTUNEMENT = 100;
const BASE_RESEARCH_COST = 15;
const ART_EVOLVE_COST = 20;
const GUIDED_REFLECTION_COST = 10;
const SCENE_MEDITATION_BASE_COST = 8;
const EXPERIMENT_BASE_COST = 30;
const DISSONANCE_THRESHOLD = 6.5;
const SCORE_NUDGE_AMOUNT = 0.15;
const SELL_INSIGHT_FACTOR = 0.5;
const MAX_FOCUS_SLOTS = 12;
const INITIAL_FOCUS_SLOTS = 5;
const INITIAL_INSIGHT = 10;
const CONTEMPLATION_COST = 3;
const CONTEMPLATION_COOLDOWN = 2 * 60 * 1000; // 2 minutes
const SCENE_SUGGESTION_COST = 12;
const SYNERGY_INSIGHT_BONUS = 1.0;
const SYNERGY_DISCOVERY_CHANCE = 0.15;

// Onboarding Phases (Moved from config.js)
const ONBOARDING_PHASE = {
    START: 0, // Questionnaire
    PERSONA_GRIMOIRE: 1, // View Persona, Grimoire, Learn Focus
    STUDY_INSIGHT: 2, // Unlock Study, Learn Research/Insight/Sell
    REFLECTION_RITUALS: 3, // Unlock Reflection, Rituals
    ADVANCED: 4 // Unlock Repository, Library etc.
};

// Concept discovery insight values (Moved from config.js)
const CONCEPT_DISCOVERY_INSIGHT = {
    common: 2.0,
    uncommon: 4.0,
    rare: 8.0,
    default: 2.0
};
// --- End Constants ---


// --- Core State Variables ---
let currentElementIndex = 0;
let userScores = { A: 5, I: 5, S: 5, P: 5, C: 5, R: 5 };
let userAnswers = {}; // Will be populated in initialize or load
const elementNames = ["Attraction", "Interaction", "Sensory", "Psychological", "Cognitive", "Relational"]; // Assumes data.js loaded
const cardTypeKeys = ["Orientation", "Identity/Role", "Practice/Kink", "Psychological/Goal", "Relationship Style"]; // Assumes data.js loaded
let currentElementAnswers = {};
let currentlyDisplayedConceptId = null;
let discoveredConcepts = new Map(); // ID -> { concept, discoveredTime, artUnlocked: boolean, notes: string }
let focusedConcepts = new Set();
let focusSlotsTotal = INITIAL_FOCUS_SLOTS; // Use constant
let userInsight = INITIAL_INSIGHT; // Use constant
let elementAttunement = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 };
let unlockedDeepDiveLevels = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 };
let freeResearchAvailableToday = false;
let currentReflectionContext = null;
let reflectionTargetConceptId = null;
let seenPrompts = new Set();
let completedRituals = { daily: {}, weekly: {} };
let achievedMilestones = new Set();
let lastLoginDate = null;
let cardsAddedSinceLastPrompt = 0;
let promptCooldownActive = false;
let currentReflectionElement = null; // Was this used before? Keeping it for now
let currentReflectionCategory = null;
let currentPromptId = null;
let toastTimeout = null;
let saveIndicatorTimeout = null;
// Repository State
let discoveredRepositoryItems = { scenes: new Set(), experiments: new Set(), insights: new Set() };
let pendingRarePrompts = [];
// Focus Unlocks State
let unlockedFocusItems = new Set(); // Stores IDs of unlocked focusDrivenUnlocks definitions
// --- NEW State Variables (from separate state.js) ---
let questionnaireCompleted = false; // Moved from save/load logic
let currentFocusSetHash = '';
let contemplationCooldownEnd = null;
let onboardingPhase = ONBOARDING_PHASE.START; // Use constant
let onboardingTutorialStep = 'start'; // <<< NEW STATE VARIABLE ADDED
// --- End Core State Variables ---


// --- DOM Elements ---
// (Keep existing DOM element references)
const saveIndicator = document.getElementById('saveIndicator');
const screens = document.querySelectorAll('.screen');
const startButton = document.getElementById('startGuidedButton');
const loadButton = document.getElementById('loadButton');
const questionnaireScreen = document.getElementById('questionnaireScreen');
const elementProgressHeader = document.getElementById('elementProgressHeader');
const questionContent = document.getElementById('questionContent');
const progressText = document.getElementById('progressText');
const dynamicScoreFeedback = document.getElementById('dynamicScoreFeedback');
const feedbackElementSpan = document.getElementById('feedbackElement');
const feedbackScoreSpan = document.getElementById('feedbackScore');
const feedbackScoreBar = document.getElementById('feedbackScoreBar');
const prevElementButton = document.getElementById('prevElementButton');
const nextElementButton = document.getElementById('nextElementButton');
const mainNavBar = document.getElementById('mainNavBar');
const navButtons = document.querySelectorAll('.nav-button');
const settingsButton = document.getElementById('settingsButton');
// Persona Screen
const personaScreen = document.getElementById('personaScreen');
const personaDetailedView = document.getElementById('personaDetailedView');
const personaSummaryView = document.getElementById('personaSummaryView');
const showDetailedViewBtn = document.getElementById('showDetailedViewBtn');
const showSummaryViewBtn = document.getElementById('showSummaryViewBtn');
const personaElementDetailsDiv = document.getElementById('personaElementDetails');
const userInsightDisplayPersona = document.getElementById('userInsightDisplayPersona');
const focusedConceptsDisplay = document.getElementById('focusedConceptsDisplay');
const focusedConceptsHeader = document.getElementById('focusedConceptsHeader');
const focusResonanceBarsContainer = document.getElementById('focusResonanceBars');
const tapestryNarrativeP = document.getElementById('tapestryNarrative');
const personaThemesList = document.getElementById('personaThemesList');
const summaryContentDiv = document.getElementById('summaryContent');
// Study Screen
const studyScreen = document.getElementById('studyScreen');
const userInsightDisplayStudy = document.getElementById('userInsightDisplayStudy');
const researchButtonContainer = document.getElementById('researchButtonContainer');
const freeResearchButton = document.getElementById('freeResearchButton');
const seekGuidanceButton = document.getElementById('seekGuidanceButton');
const researchStatus = document.getElementById('researchStatus');
const researchOutput = document.getElementById('researchOutput');
const dailyRitualsDisplay = document.getElementById('dailyRitualsDisplay'); // Remains in Study
const guidedReflectionCostDisplay = document.getElementById('guidedReflectionCostDisplay'); // Span for cost
// Grimoire Screen
const grimoireScreen = document.getElementById('grimoireScreen');
const grimoireCountSpan = document.getElementById('grimoireCount');
const grimoireTypeFilter = document.getElementById('grimoireTypeFilter');
const grimoireElementFilter = document.getElementById('grimoireElementFilter');
const grimoireRarityFilter = document.getElementById('grimoireRarityFilter');
const grimoireSortOrder = document.getElementById('grimoireSortOrder');
const grimoireSearchInput = document.getElementById('grimoireSearchInput'); // Added ref
const grimoireFocusFilter = document.getElementById('grimoireFocusFilter'); // Added ref
const grimoireContentDiv = document.getElementById('grimoireContent');
const grimoireControls = document.getElementById('grimoireControls'); // Added ref
const grimoireFilterControls = grimoireControls?.querySelector('.filter-controls'); // Added ref
// Repository Screen
const repositoryScreen = document.getElementById('repositoryScreen');
const repositoryFocusUnlocksDiv = document.getElementById('repositoryFocusUnlocks')?.querySelector('.repo-list');
const repositoryScenesDiv = document.getElementById('repositoryScenes')?.querySelector('.repo-list');
const repositoryExperimentsDiv = document.getElementById('repositoryExperiments')?.querySelector('.repo-list');
const repositoryInsightsDiv = document.getElementById('repositoryInsights')?.querySelector('.repo-list');
const milestonesDisplay = document.getElementById('milestonesDisplay'); // MOVED to Repository HTML
// Popup
const conceptDetailPopup = document.getElementById('conceptDetailPopup');
const popupOverlay = document.getElementById('popupOverlay');
const popupCardTypeIcon = document.getElementById('popupCardTypeIcon');
const popupConceptName = document.getElementById('popupConceptName');
const popupConceptType = document.getElementById('popupConceptType');
const popupVisualContainer = document.getElementById('popupVisualContainer');
const popupDetailedDescription = document.getElementById('popupDetailedDescription');
const popupResonanceSummary = document.getElementById('popupResonanceSummary');
const popupComparisonHighlights = document.getElementById('popupComparisonHighlights');
const popupConceptProfile = document.getElementById('popupConceptProfile');
const popupUserComparisonProfile = document.getElementById('popupUserComparisonProfile');
const popupRelatedConcepts = document.getElementById('popupRelatedConcepts'); // Container Div
const myNotesSection = document.getElementById('myNotesSection');
const myNotesTextarea = document.getElementById('myNotesTextarea');
const saveMyNoteButton = document.getElementById('saveMyNoteButton');
const noteSaveStatusSpan = document.getElementById('noteSaveStatus');
const closePopupButton = document.getElementById('closePopupButton');
const addToGrimoireButton = document.getElementById('addToGrimoireButton');
const markAsFocusButton = document.getElementById('markAsFocusButton');
const popupEvolutionSection = document.getElementById('popupEvolutionSection');
const evolveArtButton = document.getElementById('evolveArtButton');
const evolveCostSpan = document.getElementById('evolveCost');
const evolveEligibility = document.getElementById('evolveEligibility');
// Reflection Modal
const reflectionModal = document.getElementById('reflectionModal');
const reflectionModalTitle = document.getElementById('reflectionModalTitle');
const closeReflectionModalButton = document.getElementById('closeReflectionModalButton');
const reflectionElement = document.getElementById('reflectionElement');
const reflectionPromptText = document.getElementById('reflectionPromptText');
const reflectionCheckbox = document.getElementById('reflectionCheckbox');
const scoreNudgeCheckbox = document.getElementById('scoreNudgeCheckbox');
const scoreNudgeLabel = document.getElementById('scoreNudgeLabel');
const confirmReflectionButton = document.getElementById('confirmReflectionButton');
const reflectionRewardAmount = document.getElementById('reflectionRewardAmount');
// Settings Popup
const settingsPopup = document.getElementById('settingsPopup');
const closeSettingsPopupButton = document.getElementById('closeSettingsPopupButton');
const forceSaveButton = document.getElementById('forceSaveButton');
const resetAppButton = document.getElementById('resetAppButton');
// Alerts & Toast
const milestoneAlert = document.getElementById('milestoneAlert');
const milestoneAlertText = document.getElementById('milestoneAlertText');
const closeMilestoneAlertButton = document.getElementById('closeMilestoneAlertButton');
const toastElement = document.getElementById('toastNotification');
const toastMessageElement = document.getElementById('toastMessage');
// Deep Dive Elements
const exploreTapestryButton = document.getElementById('exploreTapestryButton');
const suggestSceneButton = document.getElementById('suggestSceneButton');
const tapestryDeepDiveModal = document.getElementById('tapestryDeepDiveModal');
const closeDeepDiveButton = document.getElementById('closeDeepDiveButton');
const deepDiveFocusIcons = document.getElementById('deepDiveFocusIcons');
const deepDiveNarrativeP = document.getElementById('deepDiveNarrative');
const deepDiveAnalysisNodes = document.getElementById('deepDiveAnalysisNodes');
const deepDiveDetailContent = document.getElementById('deepDiveDetailContent');
const contemplationNodeButton = document.getElementById('contemplationNode');
// --- End DOM Element References ---


// --- Persistence Functions ---
let saveTimeout = null; // Added timeout variable
const SAVE_DELAY = 1000; // Delay before save triggers

function showSaveIndicator() {
    if (!saveIndicator) return;
    saveIndicator.classList.remove('hidden');
    if (saveIndicatorTimeout) clearTimeout(saveIndicatorTimeout);
    saveIndicatorTimeout = setTimeout(() => {
        saveIndicator.classList.add('hidden');
        saveIndicatorTimeout = null;
    }, 750);
}

function saveGameState() {
    // showSaveIndicator(); // Moved inside _triggerSave
    _triggerSave(); // Debounce save calls
}

function _triggerSave() {
    showSaveIndicator();
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        try {
            const stateToSave = {
                // Core state
                userScores,
                userAnswers, // Save answers object
                discoveredConcepts: Array.from(discoveredConcepts.entries()),
                focusedConcepts: Array.from(focusedConcepts),
                focusSlotsTotal,
                userInsight,
                elementAttunement,
                unlockedDeepDiveLevels,
                achievedMilestones: Array.from(achievedMilestones),
                completedRituals,
                lastLoginDate,
                freeResearchAvailableToday,
                seenPrompts: Array.from(seenPrompts),
                // Tracking state
                currentElementIndex, // Save index to know where they were
                questionnaireCompleted, // Save completion status
                cardsAddedSinceLastPrompt,
                promptCooldownActive,
                // Repository & Unlocks
                discoveredRepositoryItems: {
                    scenes: Array.from(discoveredRepositoryItems.scenes),
                    experiments: Array.from(discoveredRepositoryItems.experiments),
                    insights: Array.from(discoveredRepositoryItems.insights)
                },
                pendingRarePrompts,
                unlockedFocusItems: Array.from(unlockedFocusItems),
                // Additions from state.js merge
                currentFocusSetHash,
                contemplationCooldownEnd,
                onboardingPhase,
                onboardingTutorialStep // <<< SAVE TUTORIAL STEP
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
            // console.log("Game state saved."); // Optional: For debugging
        } catch (error) {
            console.error("Error saving game state:", error);
            showTemporaryMessage("Error: Could not save progress!", 4000);
        } finally {
            // Hide indicator slightly after save completes (or fails)
            setTimeout(() => {
                if(saveIndicator && saveTimeout === null) saveIndicator.classList.add('hidden');
            }, 200);
            saveTimeout = null; // Clear timeout flag *after* save attempt
        }
    }, SAVE_DELAY);
}

function loadGameState() {
    console.log("Attempting to load game state...");
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
        try {
            const loadedState = JSON.parse(savedData);
            console.log("Saved data found.");

            // Reset to defaults *first* to handle potentially missing keys
            initializeDefaultState();

            // Carefully merge loaded data
            userScores = typeof loadedState.userScores === 'object' && loadedState.userScores !== null ? { ...userScores, ...loadedState.userScores } : userScores;
            userAnswers = typeof loadedState.userAnswers === 'object' && loadedState.userAnswers !== null ? loadedState.userAnswers : {};
            elementNames.forEach(name => { if (!userAnswers[name]) userAnswers[name] = {}; }); // Ensure all element keys exist

            discoveredConcepts = new Map(Array.isArray(loadedState.discoveredConcepts) ? loadedState.discoveredConcepts : []);
            focusedConcepts = new Set(Array.isArray(loadedState.focusedConcepts) ? loadedState.focusedConcepts : []);
            focusSlotsTotal = typeof loadedState.focusSlotsTotal === 'number' ? loadedState.focusSlotsTotal : INITIAL_FOCUS_SLOTS;
            userInsight = typeof loadedState.userInsight === 'number' ? loadedState.userInsight : INITIAL_INSIGHT;
            elementAttunement = typeof loadedState.elementAttunement === 'object' && loadedState.elementAttunement !== null ? { ...elementAttunement, ...loadedState.elementAttunement } : elementAttunement;
            unlockedDeepDiveLevels = typeof loadedState.unlockedDeepDiveLevels === 'object' && loadedState.unlockedDeepDiveLevels !== null ? { ...unlockedDeepDiveLevels, ...loadedState.unlockedDeepDiveLevels } : unlockedDeepDiveLevels;
            achievedMilestones = new Set(Array.isArray(loadedState.achievedMilestones) ? loadedState.achievedMilestones : []);
            completedRituals = typeof loadedState.completedRituals === 'object' && loadedState.completedRituals !== null ? loadedState.completedRituals : { daily: {}, weekly: {} };
            lastLoginDate = typeof loadedState.lastLoginDate === 'string' ? loadedState.lastLoginDate : null;
            freeResearchAvailableToday = typeof loadedState.freeResearchAvailableToday === 'boolean' ? loadedState.freeResearchAvailableToday : false;
            seenPrompts = new Set(Array.isArray(loadedState.seenPrompts) ? loadedState.seenPrompts : []);

            currentElementIndex = typeof loadedState.currentElementIndex === 'number' ? loadedState.currentElementIndex : -1; // Load index
            questionnaireCompleted = typeof loadedState.questionnaireCompleted === 'boolean' ? loadedState.questionnaireCompleted : false; // Load status

            cardsAddedSinceLastPrompt = typeof loadedState.cardsAddedSinceLastPrompt === 'number' ? loadedState.cardsAddedSinceLastPrompt : 0;
            promptCooldownActive = typeof loadedState.promptCooldownActive === 'boolean' ? loadedState.promptCooldownActive : false;

            // Load repository items safely
            discoveredRepositoryItems = {
                scenes: new Set(Array.isArray(loadedState.discoveredRepositoryItems?.scenes) ? loadedState.discoveredRepositoryItems.scenes : []),
                experiments: new Set(Array.isArray(loadedState.discoveredRepositoryItems?.experiments) ? loadedState.discoveredRepositoryItems.experiments : []),
                insights: new Set(Array.isArray(loadedState.discoveredRepositoryItems?.insights) ? loadedState.discoveredRepositoryItems.insights : []),
            };
            pendingRarePrompts = Array.isArray(loadedState.pendingRarePrompts) ? loadedState.pendingRarePrompts : [];
            unlockedFocusItems = new Set(Array.isArray(loadedState.unlockedFocusItems) ? loadedState.unlockedFocusItems : []);

            // Load additions from state.js merge
            currentFocusSetHash = loadedState.currentFocusSetHash || '';
            contemplationCooldownEnd = typeof loadedState.contemplationCooldownEnd === 'number' ? loadedState.contemplationCooldownEnd : null;
            onboardingPhase = typeof loadedState.onboardingPhase === 'number' ? loadedState.onboardingPhase : ONBOARDING_PHASE.START;

            // <<< LOAD TUTORIAL STEP >>>
            onboardingTutorialStep = typeof loadedState.onboardingTutorialStep === 'string'
                                        ? loadedState.onboardingTutorialStep
                                        : (questionnaireCompleted ? 'complete' : 'start'); // Default based on questionnaire status if missing

            console.log("Game state loaded successfully.");
            showTemporaryMessage("Session Restored", 2000);
            return true;
        } catch (error) {
            console.error("Error loading or parsing game state:", error);
            localStorage.removeItem(SAVE_KEY); // Clear potentially corrupted data
            initializeDefaultState(); // Reset to default state
            showTemporaryMessage("Error loading session. Starting fresh.", 4000);
            return false;
        }
    } else {
        console.log("No saved game state found.");
        initializeDefaultState(); // Ensure default state on first run
        if(loadButton) loadButton.classList.add('hidden');
        return false;
    }
}

function initializeDefaultState() {
    console.log("Initializing default state variables.");
    currentElementIndex = -1; // Start before first element
    userScores = { A: 5, I: 5, S: 5, P: 5, C: 5, R: 5 };
    userAnswers = {}; // Initialize as empty
    elementNames.forEach(elName => { userAnswers[elName] = {}; }); // Populate keys
    discoveredConcepts = new Map();
    focusedConcepts = new Set();
    focusSlotsTotal = INITIAL_FOCUS_SLOTS;
    userInsight = INITIAL_INSIGHT;
    elementAttunement = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 };
    unlockedDeepDiveLevels = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 };
    seenPrompts = new Set();
    completedRituals = { daily: {}, weekly: {} };
    achievedMilestones = new Set();
    lastLoginDate = null;
    cardsAddedSinceLastPrompt = 0;
    promptCooldownActive = false;
    freeResearchAvailableToday = false;
    questionnaireCompleted = false;
    discoveredRepositoryItems = { scenes: new Set(), experiments: new Set(), insights: new Set() };
    pendingRarePrompts = [];
    unlockedFocusItems = new Set();
    currentFocusSetHash = '';
    contemplationCooldownEnd = null;
    onboardingPhase = ONBOARDING_PHASE.START;
    onboardingTutorialStep = 'start'; // <<< SET DEFAULT
}

function clearGameState() {
    console.log("Clearing saved game state and resetting runtime state...");
    localStorage.removeItem(SAVE_KEY);
    initializeDefaultState(); // Reset runtime state to defaults
    showTemporaryMessage("Progress Reset!", 3000);
    if(loadButton) loadButton.classList.add('hidden');
    // Potentially re-run questionnaire initialization if needed, handled by start button click now
    initializeQuestionnaireUI(); // Ensure UI reflects reset state
    showScreen('welcomeScreen'); // Go back to start
}

// --- Data Availability Check ---
// (Keep existing checkDataLoaded function)
let dataLoaded = false;
function checkDataLoaded() {
    if (!dataLoaded) {
        dataLoaded = typeof elementDetails !== 'undefined' &&
                     typeof concepts !== 'undefined' &&
                     typeof questionnaireGuided !== 'undefined' &&
                     typeof reflectionPrompts !== 'undefined' &&
                     typeof elementDeepDive !== 'undefined' &&
                     typeof dailyRituals !== 'undefined' &&
                     typeof milestones !== 'undefined' &&
                     typeof elementKeyToFullName !== 'undefined' &&
                     typeof focusRituals !== 'undefined' &&
                     typeof sceneBlueprints !== 'undefined' &&
                     typeof alchemicalExperiments !== 'undefined' &&
                     typeof elementalInsights !== 'undefined' &&
                     typeof focusDrivenUnlocks !== 'undefined'; // Check NEW data
        if (!dataLoaded) { console.error("CRITICAL: Data from data.js not loaded!"); }
    }
    return dataLoaded;
}

// --- Utility Maps ---
const elementNameToKey = { "Attraction": "A", "Interaction": "I", "Sensory": "S", "Psychological": "P", "Cognitive": "C", "Relational": "R" };

// --- Utility & Setup Functions ---
// (Keep gainInsight, spendInsight, updateInsightDisplays, getScoreLabel, etc.)
// --- NEW: Function to set tutorial step ---
function setOnboardingTutorialStep(step) {
    if (typeof step === 'string' && onboardingTutorialStep !== step) {
        console.log(`Setting tutorial step to: ${step}`);
        onboardingTutorialStep = step;
        saveGameState(); // Save tutorial progress immediately
    }
}

// --- Screen Management ---
// (Keep showScreen, hidePopups)

// --- Initialization and Questionnaire Logic ---
// (Keep initializeQuestionnaire, updateElementProgressHeader, displayElementQuestions,
//  updateSliderFeedbackText, handleQuestionnaireInputChange, enforceMaxChoices,
//  collectCurrentElementAnswers, updateDynamicFeedback, calculateElementScore,
//  nextElement, prevElement, finalizeScoresAndShowPersona)

// --- Starter Hand & Resource Granting ---
// (Keep determineStarterHandAndEssence)

// --- Attunement ---
// (Keep gainAttunementForAction, displayElementAttunement)

// --- Persona Screen Functions ---
// (Keep updateFocusSlotsDisplay, displayPersonaScreen, displayFocusedConceptsPersona,
//  synthesizeAndDisplayThemesPersona, updateFocusElementalResonance,
//  generateTapestryNarrative, displayPersonaSummary)

// --- Study Screen Functions ---
// (Keep displayStudyScreenContent, displayResearchButtons, handleResearchClick,
//  handleFreeResearchClick, conductResearch)

// --- Grimoire Functions ---
// (Keep displayGrimoire, populateGrimoireFilters, updateGrimoireCounter)

// --- Card Rendering Function ---
// (Keep renderCard)

// --- Sell Concept Function ---
// (Keep sellConcept)

// --- Concept Detail Pop-up Logic ---
// (Keep showConceptDetailPopup, displayPopupResonance, displayPopupRecipeComparison,
//  displayPopupRelatedConcepts, displayEvolutionSection, attemptArtEvolution)

// --- Grimoire/Focus Button & State Logic ---
// (Keep addConceptToGrimoireById, addToGrimoire, addConceptToGrimoireInternal,
//  toggleFocusConcept, updateGrimoireButtonStatus, updateFocusButtonStatus,
//  updatePopupSellButton)

// --- My Notes ---
// (Keep saveMyNote)

// --- Check for Focus-Driven Unlocks ---
// (Keep checkForFocusUnlocks)

// --- Reflection Prompts ---
// (Keep checkTriggerReflectionPrompt, displayReflectionPrompt, handleConfirmReflection,
//  triggerGuidedReflection, startReflectionCooldown)

// --- Rituals & Milestones ---
// (Keep displayDailyRituals, checkAndUpdateRituals, displayMilestones,
//  updateMilestoneProgress, showMilestoneAlert, hideMilestoneAlert)

// --- Element Deep Dive Library (Now Integrated into Persona Screen) ---
// (Keep displayElementLibrary, displayElementDeepDive, unlockDeepDiveLevel)
// Note: The calls to displayElementLibrary need to be removed from displayStudyScreenContent if they were there.
//       handleUnlockLibraryLevel listener needs to be attached within the attachEventListeners section.

// --- Repository Functions ---
// (Keep displayRepositoryContent, renderRepositoryItem, meditateOnScene, attemptExperiment)

// --- Suggest Scenes ---
// (Keep handleSuggestSceneClick)

// --- Toast Message Function ---
// (Keep showTemporaryMessage)

// --- Reset App ---
// (Keep resetApp)

// --- Daily Login Check ---
// (Keep checkForDailyLogin)

// --- Show Settings Popup ---
// (Keep showSettings)

// --- Tapestry Deep Dive ---
// (Keep showTapestryDeepDive, handleDeepDiveNodeClick, handleContemplationNodeClick,
//  generateFocusedContemplation, handleCompleteContemplation)

// --- Event Listeners ---
// (Keep attachEventListeners, but verify deep dive unlock listener is correct)

// --- Start the App ---
// (Keep DOMContentLoaded logic)


// ========================================================
// MAKE SURE ALL PREVIOUSLY DEFINED FUNCTIONS ARE INCLUDED
// This is just showing the STATE variable modifications
// and the new setOnboardingTutorialStep function.
// ========================================================

// --- Example Placeholder Functions (KEEP YOUR ORIGINAL IMPLEMENTATIONS) ---
// Ensure functions like updateInsightDisplays, displayResearchButtons etc. exist
function updateInsightDisplays() { /* Your original implementation */ }
function displayResearchButtons() { /* Your original implementation */ }
function updateFocusSlotsDisplay() { /* Your original implementation */ }
function updateGrimoireCounter() { /* Your original implementation */ }
function populateGrimoireFilters() { /* Your original implementation */ }
function refreshGrimoireDisplay() { /* Your original implementation */ }
function displayDailyRituals() { /* Your original implementation */ }
function displayMilestones() { /* Your original implementation */ }
function displayElementLibrary() { /* Your original implementation */ }
function displayPersonaScreen() { /* Your original implementation */ }
function displayStudyScreenContent() { /* Your original implementation */ }
function displayRepositoryContent() { /* Your original implementation */ }
function displayPersonaSummary() { /* Your original implementation */ }
function displayElementAttunement() { /* Your original implementation */ }
function displayFocusedConceptsPersona() { /* Your original implementation */ }
function updateFocusElementalResonance() { /* Your original implementation */ }
function generateTapestryNarrative() { /* Your original implementation */ }
function synthesizeAndDisplayThemesPersona() { /* Your original implementation */ }
function showConceptDetailPopup(id) { /* Your original implementation */ }
function renderCard(concept, context) { /* Your original implementation */ }
function updateGrimoireButtonStatus(id, inResearch) { /* Your original implementation */ }
function updateFocusButtonStatus(id) { /* Your original implementation */ }
function updatePopupSellButton(id, concept, isDiscovered, inResearch) { /* Your original implementation */ }
function displayEvolutionSection(concept, discovered) { /* Your original implementation */ }
function displayElementDeepDive(key, container) { /* Your original implementation */ }
function updateTapestryDeepDiveButton() { /* Your original implementation */ }
function updateSuggestSceneButtonState() { /* Your original implementation */ }
function displayTapestryDeepDive(analysis) { /* Your original implementation */ }
function updateContemplationButtonState() { /* Your original implementation */ }
function updateDeepDiveContent(html, node) { /* Your original implementation */ }
function displayContemplationTask(task) { /* Your original implementation */ }
function clearContemplationTask() { /* Your original implementation */ }
function initializeQuestionnaireUI() { /* Your original implementation */ }
function setupInitialUI() { /* Your original implementation */ }
// --- End Example Placeholders ---


console.log("script.js loaded.");

// --- Global Exports (if needed for inline event handlers, though delegation is better) ---
// Make functions accessible globally if used directly in HTML onclick attributes
window.sellConcept = sellConcept;
window.addConceptToGrimoireById = addConceptToGrimoireById;
window.toggleFocusConcept = toggleFocusConcept;
window.saveMyNote = saveMyNote;
window.attemptArtEvolution = attemptArtEvolution;
window.unlockDeepDiveLevel = unlockDeepDiveLevel;
window.meditateOnScene = meditateOnScene;
window.attemptExperiment = attemptExperiment;
window.showConceptDetailPopup = showConceptDetailPopup;
window.displayElementDeepDive = displayElementDeepDive; // Needed for inline button in library

// Ensure attachEventListeners is called at the end (usually within DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Fully Loaded. Initializing Persona Alchemy Lab (Modified)...");
    // Load data if necessary (assuming data.js loads and makes globals available)
    if (!checkDataLoaded()) {
        console.error("Data check failed on DOMContentLoaded. Aborting initialization.");
        alert("Error loading game data. Please refresh.");
        return;
    }

    // Initialize the application (load state, set initial screen)
    initializeApp(); // Your existing initialization logic from main.js

    // Attach event listeners (Your existing attachEventListeners function from main.js)
    // attachEventListeners(); // This is called inside initializeApp in your original code

    console.log("Initialization and event listeners complete. Ready.");
});


// --- END OF FILE script.js ---
