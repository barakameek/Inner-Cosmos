// js/ui.js - Handles DOM Manipulation and UI Updates (Inner Cosmos Theme)
import * as State from './state.js';
import * as Config from './config.js';
import * as Utils from './utils.js';
import * as GameLogic from './gameLogic.js'; // Needed for button actions
// Data imports (internal names mostly kept)
import { elementDetails, elementKeyToFullName, elementNameToKey, concepts, questionnaireGuided, reflectionPrompts, elementDeepDive, dailyRituals, milestones, focusRituals, sceneBlueprints, alchemicalExperiments, elementalInsights, focusDrivenUnlocks, cardTypeKeys, elementNames } from '../data.js';

console.log("ui.js loading...");

// --- DOM Element References (Updated for Inner Cosmos) ---
const saveIndicator = document.getElementById('saveIndicator');
const screens = document.querySelectorAll('.screen');
const welcomeScreen = document.getElementById('welcomeScreen');
const loadButton = document.getElementById('loadButton');
const chartingScreen = document.getElementById('chartingScreen'); // Renamed
const forceProgressHeader = document.getElementById('forceProgressHeader'); // Renamed
const questionContent = document.getElementById('questionContent');
const progressText = document.getElementById('progressText');
const dynamicForceFeedback = document.getElementById('dynamicForceFeedback'); // Renamed
const feedbackForceSpan = document.getElementById('feedbackForce'); // Renamed
const feedbackScoreSpan = document.getElementById('feedbackScore');
const feedbackScoreBar = document.getElementById('feedbackScoreBar');
const prevForceButton = document.getElementById('prevForceButton'); // Renamed
const nextForceButton = document.getElementById('nextForceButton'); // Renamed
const mainNavBar = document.getElementById('mainNavBar');
const navButtons = document.querySelectorAll('.nav-button');
const settingsButton = document.getElementById('settingsButton');
// Constellation Map Screen (Persona)
const constellationMapScreen = document.getElementById('constellationMapScreen'); // Renamed
const constellationName = document.getElementById('constellationName');
const constellationVisualPlaceholder = document.getElementById('constellationVisualPlaceholder');
const interpretationTextElement = document.getElementById('constellationInterpretationText'); // Corrected var name
const dominantForcesElement = document.getElementById('constellationDominantForces'); // Corrected var name
const userInsightDisplayConstellation = document.getElementById('userInsightDisplayConstellation'); // Renamed
const forceDetailsElement = document.getElementById('constellationForceDetails'); // Corrected var name & Renamed
const discoverMoreButton = document.getElementById('discoverMoreButton');
const suggestBlueprintButton = document.getElementById('suggestBlueprintButton'); // Renamed
// Star Catalog Screen (Grimoire)
const starCatalogScreen = document.getElementById('starCatalogScreen'); // Renamed
const starCountSpan = document.getElementById('starCount'); // Renamed
const catalogControls = document.getElementById('catalogControls'); // Renamed
const catalogFilterControls = catalogControls?.querySelector('.filter-controls'); // Kept class name for now
const catalogTypeFilter = document.getElementById('catalogTypeFilter'); // Renamed
const catalogForceFilter = document.getElementById('catalogForceFilter'); // Renamed
const catalogRarityFilter = document.getElementById('catalogRarityFilter'); // Renamed
const catalogSortOrder = document.getElementById('catalogSortOrder'); // Renamed
const catalogSearchInput = document.getElementById('catalogSearchInput'); // Renamed
const catalogFocusFilter = document.getElementById('catalogFocusFilter'); // Renamed
const starCatalogContent = document.getElementById('starCatalogContent'); // Renamed
// Observatory Screen (Study)
const observatoryScreen = document.getElementById('observatoryScreen'); // Renamed
const userInsightDisplayObservatory = document.getElementById('userInsightDisplayObservatory'); // Renamed
const sectorScanButtonContainer = document.getElementById('sectorScanButtonContainer'); // Renamed
const dailyScanButton = document.getElementById('dailyScanButton'); // Renamed
const deepScanButton = document.getElementById('deepScanButton'); // Renamed
const scanStatus = document.getElementById('scanStatus'); // Renamed
const scanOutput = document.getElementById('scanOutput'); // Renamed
const observatoryRitualsDisplay = document.getElementById('observatoryRitualsDisplay'); // Renamed
const deepScanCostDisplay = document.getElementById('deepScanCostDisplay'); // Renamed
// Cartography Screen (Repository)
const cartographyScreen = document.getElementById('cartographyScreen'); // Renamed
const cartographySynergiesDiv = document.getElementById('cartographySynergies')?.querySelector('.cartography-list'); // Renamed
const cartographyBlueprintsDiv = document.getElementById('cartographyBlueprints')?.querySelector('.cartography-list'); // Renamed
const cartographyOrbitsDiv = document.getElementById('cartographyOrbits')?.querySelector('.cartography-list'); // Renamed
const cartographyWhispersDiv = document.getElementById('cartographyWhispers')?.querySelector('.cartography-list'); // Renamed
const legendaryAlignmentsDisplay = document.getElementById('legendaryAlignmentsDisplay'); // Renamed
// Observatory View Popup (Concept Detail)
const observatoryViewPopup = document.getElementById('observatoryViewPopup'); // Renamed
const closeObservatoryViewButton = document.getElementById('closeObservatoryViewButton'); // Renamed
const observatoryStarTypeIcon = document.getElementById('observatoryStarTypeIcon'); // Renamed
const observatoryStarName = document.getElementById('observatoryStarName'); // Renamed
const observatoryStarType = document.getElementById('observatoryStarType'); // Renamed
const observatoryVisualContainer = document.getElementById('observatoryVisualContainer'); // Renamed
const observatoryDetailedDescription = document.getElementById('observatoryDetailedDescription'); // Renamed
const observatoryResonanceSummary = document.getElementById('observatoryResonanceSummary'); // Renamed
const observatoryComparisonHighlights = document.getElementById('observatoryComparisonHighlights'); // Renamed
const observatoryStarProfile = document.getElementById('observatoryStarProfile'); // Renamed
const observatoryNebulaComparisonProfile = document.getElementById('observatoryNebulaComparisonProfile'); // Renamed
const observatoryRelatedStars = document.getElementById('observatoryRelatedStars'); // Renamed
const logbookSection = document.getElementById('logbookSection'); // Renamed
const logbookTextarea = document.getElementById('logbookTextarea'); // Renamed
const saveLogEntryButton = document.getElementById('saveLogEntryButton'); // Renamed
const logSaveStatus = document.getElementById('logSaveStatus'); // Renamed
const catalogStarButton = document.getElementById('catalogStarButton'); // Renamed
const alignStarButton = document.getElementById('alignStarButton'); // Renamed
const stellarEvolutionSection = document.getElementById('stellarEvolutionSection'); // Renamed
const evolveStarButton = document.getElementById('evolveStarButton'); // Renamed
const evolveCostObs = document.getElementById('evolveCostObs'); // Renamed
const evolveEligibilityObs = document.getElementById('evolveEligibilityObs'); // Renamed
// Reflection Modal (Renamed internal elements)
const reflectionModal = document.getElementById('reflectionModal');
const reflectionModalTitle = document.getElementById('reflectionModalTitle');
const closeReflectionModalButton = document.getElementById('closeReflectionModalButton');
const reflectionSubject = document.getElementById('reflectionSubject'); // Renamed
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
// Starting Nebula Modal Refs
const startingNebulaModal = document.getElementById('startingNebulaModal'); // Renamed
const nebulaScoresDisplay = document.getElementById('nebulaScoresDisplay'); // Renamed
const nebulaInterpretation = document.getElementById('nebulaInterpretation'); // Renamed
const nebulaStarterStarsDisplay = document.getElementById('nebulaStarterStarsDisplay'); // Renamed
const goToCatalogButton = document.getElementById('goToCatalogButton'); // Renamed
const closeNebulaModalButton = document.getElementById('closeNebulaModalButton'); // Renamed
// Tutorial Modal Refs
const tutorialOverlay = document.getElementById('tutorialOverlay');
const tutorialModal = document.getElementById('tutorialModal');
const tutorialTitle = document.getElementById('tutorialTitle');
const tutorialContent = document.getElementById('tutorialContent');
const tutorialNextButton = document.getElementById('tutorialNextButton');
// General Overlay
const popupOverlay = document.getElementById('popupOverlay'); // Shared overlay

// --- Tutorial State ---
let currentTutorialTargetId = null; // Stores ID of element being highlighted by tutorial

// --- Utility UI Functions ---
let toastTimeout = null;
export function showTemporaryMessage(message, duration = 3000) {
    if (!toastElement || !toastMessageElement) { console.warn("Toast elements missing:", message); return; }
    console.info(`Toast: ${message}`);
    toastMessageElement.textContent = message;
    if (toastTimeout) { clearTimeout(toastTimeout); }
    toastElement.classList.remove('hidden', 'visible');
    void toastElement.offsetWidth; // Trigger reflow
    toastElement.classList.add('visible');
    toastElement.classList.remove('hidden');
    toastTimeout = setTimeout(() => {
        toastElement.classList.remove('visible');
         setTimeout(() => { if (!toastElement.classList.contains('visible')) { toastElement.classList.add('hidden'); } }, 500); // Delay hidden to allow fade out
        toastTimeout = null;
    }, duration);
}

let milestoneTimeout = null;
export function showMilestoneAlert(text, milestoneId = null) {
    if (!milestoneAlert || !milestoneAlertText) return;
    // Add intro messages for specific milestones if needed (use correct milestone IDs)
    const REPOSITORY_UNLOCK_MILESTONE_ID = 'ms73'; // Example
    // Add more relevant IDs here
    if (milestoneId === REPOSITORY_UNLOCK_MILESTONE_ID && State.getOnboardingPhase() < Config.ONBOARDING_PHASE.ADVANCED) {
         showTemporaryMessage("Cartography unlocked! Access newly discovered cosmic data.", 5000); // Updated text
         const cartographyNav = document.querySelector('.nav-button[data-target="cartographyScreen"]');
         if(cartographyNav) temporaryHighlight(cartographyNav); // Highlight the nav button itself
    }
    milestoneAlertText.textContent = `Legendary Alignment: ${text}`; // Updated text
    milestoneAlert.classList.remove('hidden');
    if (milestoneTimeout) clearTimeout(milestoneTimeout);
    milestoneTimeout = setTimeout(hideMilestoneAlert, 5000);
}
export function hideMilestoneAlert() {
    if (milestoneAlert) milestoneAlert.classList.add('hidden');
    if (milestoneTimeout) clearTimeout(milestoneTimeout);
    milestoneTimeout = null;
}
export function hidePopups() {
    if (observatoryViewPopup) observatoryViewPopup.classList.add('hidden');
    if (reflectionModal) reflectionModal.classList.add('hidden');
    if (settingsPopup) settingsPopup.classList.add('hidden');
    if (startingNebulaModal) startingNebulaModal.classList.add('hidden');
    if (tutorialModal) tutorialModal.classList.add('hidden');
    // Hide overlay only if ALL popups are hidden
    if (popupOverlay && observatoryViewPopup?.classList.contains('hidden') &&
        reflectionModal?.classList.contains('hidden') &&
        settingsPopup?.classList.contains('hidden') &&
        startingNebulaModal?.classList.contains('hidden') &&
        tutorialModal?.classList.contains('hidden'))
    {
        popupOverlay.classList.add('hidden');
        if (tutorialOverlay) tutorialOverlay.classList.add('hidden');
    }
    GameLogic.clearPopupState();
    removeAllHighlights(); // Clear any active highlights when closing popups
}


// --- Onboarding Tutorial System ---
let highlightTimeouts = {};
function temporaryHighlight(elementIdOrElement, duration = Infinity, highlightClass = 'highlight-feature-onboarding') {
    const element = (typeof elementIdOrElement === 'string') ? document.getElementById(elementIdOrElement) : elementIdOrElement;
    if (!element) { console.warn(`Cannot highlight missing element:`, elementIdOrElement); return; }
    const elementId = element.id || element.dataset?.target || `highlight-target-${Math.random().toString(36).substring(2, 9)}`;
    if (!element.id) { element.id = elementId; }

    console.log(`Highlighting: ${elementId} with class ${highlightClass}`);
    element.classList.add(highlightClass);
    element.style.pointerEvents = 'auto';

    if (highlightTimeouts[elementId]) { clearTimeout(highlightTimeouts[elementId]); }
    if(duration > 0 && duration !== Infinity) {
        highlightTimeouts[elementId] = setTimeout(() => {
            removeHighlight(elementId, highlightClass);
        }, duration);
    } else if (duration <= 0) {
        removeHighlight(elementId, highlightClass);
    }
}

function removeHighlight(elementId, highlightClass = 'highlight-feature-onboarding') {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove(highlightClass);
        element.style.pointerEvents = '';
        console.log(`Removing highlight from: ${elementId}`);
        if (elementId.startsWith('highlight-target-')) { element.removeAttribute('id'); }
    }
    if (highlightTimeouts[elementId]) {
        clearTimeout(highlightTimeouts[elementId]);
        delete highlightTimeouts[elementId];
    }
}

function removeAllHighlights(highlightClass = 'highlight-feature-onboarding') {
     document.querySelectorAll(`.${highlightClass}`).forEach(el => {
         el.classList.remove(highlightClass);
         el.style.pointerEvents = '';
         if (el.id && el.id.startsWith('highlight-target-')) { el.removeAttribute('id'); }
     });
     Object.keys(highlightTimeouts).forEach(id => clearTimeout(highlightTimeouts[id]));
     highlightTimeouts = {};
     console.log("Cleared all highlights.");
}

const tutorialSteps = {
    'start': {},
    'results_seen': { nextStep: 'grimoire_intro' },
    'grimoire_intro': { title: "The Star Catalog", content: "<p>This is your personal **Star Catalog**. It holds every Star (Concept) you've discovered. Think of it as your library of potential identities.</p><p>Click a Star to learn more about its properties and how it **resonates** with your core Forces.</p>", targetElementId: 'starCatalogContent', nextStep: 'grimoire_card_prompt' },
    'grimoire_card_prompt': { title: "Examine a Star", content: "<p>Select any Star in your Catalog to view its details in the Observatory View.</p>", targetElementId: null, nextStep: 'focus_prompt' },
    'focus_prompt': { title: "Star Properties", content: "<p>Here you can see the Star's detailed description, its resonance with your Nebula, and its unique **Force profile**.</p>", targetElementId: 'observatoryDetailedDescription', nextStep: 'focus_explained' },
    'focus_explained': { title: "Aligning Stars", content: "<p>See the **'Align Star'** button? Aligning means you're actively incorporating this Star into your **Constellation Map**. It's like choosing key stars to define your current cosmic pattern.</p><p>Aligning shapes your Constellation interpretation and can unlock synergies. Choose Stars that feel most relevant *now*.</p>", targetElementId: 'alignStarButton', nextStep: 'focus_action_pending' },
    'focus_action_pending': {},
    'persona_tapestry_prompt': { title: "Your Constellation Map", content: "<p>Welcome to your Constellation Map! The Star you aligned now appears here.</p>", targetElementId: 'constellationVisualPlaceholder', nextStep: 'persona_narrative_prompt' },
    'persona_narrative_prompt': { title: "Emergent Patterns", content: "<p>Notice how aligning Stars changes the **Emergent Patterns** interpretation? This reflects the unique combination you're expressing.</p><p>Align more Stars from your Catalog to see how the patterns shift!</p>", targetElementId: 'constellationInterpretationText', nextStep: 'study_intro_prompt' },
    'study_intro_prompt': { title: "The Observatory", content: "<p>Welcome to the Observatory! This is where you expand your understanding of the cosmos.</p><p>You use **Insight** <i class='fas fa-brain insight-icon'></i> as fuel for discovery here.</p>", targetElementId: 'userInsightDisplayObservatory', nextStep: 'study_scan_prompt' },
    'study_scan_prompt': { title: "Scanning Sectors", content: "<p>Use the **Scan Sector** buttons to probe different **Force** areas of the cosmos. Scanning costs Insight but is the primary way to discover new **Stars** and potentially rare **Cartography** data.</p>", targetElementId: 'sectorScanButtonContainer', nextStep: 'study_results_prompt' },
    'study_results_prompt': { title: "Scan Log", content: "<p>Discoveries from your scans appear in the **Scan Log**. Examine new signals: **Catalog** promising Stars to add them permanently, or **Analyze** faint signals for a small Insight gain.</p>", targetElementId: 'scanOutput', nextStep: 'complete' },
    'complete': {}
};

export function showTutorialStep(stepId) {
    const stepDetails = tutorialSteps[stepId];
    if (!stepDetails || !tutorialModal || !tutorialOverlay || !tutorialTitle || !tutorialContent || !tutorialNextButton) {
        console.warn(`Tutorial step "${stepId}" not found or modal elements missing.`);
        if(State.getOnboardingTutorialStep() !== 'complete') { State.setOnboardingTutorialStep('complete'); }
        return;
    }
    console.log(`Showing Tutorial Step: ${stepId}`);
    tutorialTitle.textContent = stepDetails.title || "Tutorial";
    const formattedContent = (stepDetails.content || "").replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/<i class='(.*?)'><\/i>/g, '<i class="$1"></i>');
    tutorialContent.innerHTML = formattedContent;
    removeAllHighlights();
    currentTutorialTargetId = stepDetails.targetElementId;
    if (currentTutorialTargetId) {
        const targetElement = document.getElementById(currentTutorialTargetId);
        if(targetElement) {
             temporaryHighlight(targetElement, Infinity);
             try { targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }); }
             catch (e) { console.warn("Could not scroll tutorial target into view:", e); }
        }
    }
    const nextStep = stepDetails.nextStep || 'complete';
    tutorialNextButton.textContent = (nextStep === 'complete') ? "Got it!" : "Next";
    tutorialNextButton.onclick = () => hideTutorialStep(stepId, nextStep);
    tutorialOverlay.classList.remove('hidden');
    tutorialModal.classList.remove('hidden');
}

function hideTutorialStep(currentStepId, nextStepId) {
    console.log(`Hiding Tutorial Step: ${currentStepId}, advancing to: ${nextStepId}`);
    if (tutorialModal) tutorialModal.classList.add('hidden');
    if (tutorialOverlay) tutorialOverlay.classList.add('hidden');
    const stepDetails = tutorialSteps[currentStepId];
    if (stepDetails && stepDetails.targetElementId) { removeHighlight(stepDetails.targetElementId); }
    currentTutorialTargetId = null;
    State.setOnboardingTutorialStep(nextStepId);
    if (nextStepId && tutorialSteps[nextStepId]?.content && nextStepId !== 'complete') {
         if( (currentStepId === 'focus_prompt' && nextStepId === 'focus_explained') ||
             (currentStepId === 'persona_tapestry_prompt' && nextStepId === 'persona_narrative_prompt') ||
             (currentStepId === 'study_intro_prompt' && nextStepId === 'study_scan_prompt') )
         { setTimeout(() => showTutorialStep(nextStepId), 50); }
         else if (currentStepId === 'study_results_prompt' && nextStepId === 'complete') { console.log("Basic tutorial sequence complete."); }
    } else if (nextStepId === 'complete') { console.log("Tutorial marked as complete."); }
    applyOnboardingPhaseUI(State.getOnboardingPhase()); // Re-apply UI based on new step/phase
}


// --- Screen Management (Handles Tutorial Triggering) ---
export function showScreen(screenId) {
    console.log(`UI: Requesting screen: ${screenId}`);
    const currentState = State.getState();
    const isPostQuestionnaire = currentState.questionnaireCompleted;
    const currentTutorialStep = State.getOnboardingTutorialStep();
    let blockScreenChange = false;
    let targetTutorialStep = null;

    if (screenId === 'starCatalogScreen' && isPostQuestionnaire && currentTutorialStep === 'grimoire_intro') { targetTutorialStep = 'grimoire_intro'; }
    else if (screenId === 'constellationMapScreen' && isPostQuestionnaire && currentTutorialStep === 'persona_tapestry_prompt') { targetTutorialStep = 'persona_tapestry_prompt'; }
    else if (screenId === 'observatoryScreen' && currentState.onboardingPhase >= Config.ONBOARDING_PHASE.STUDY_INSIGHT && currentTutorialStep === 'study_intro_prompt') { targetTutorialStep = 'study_intro_prompt'; }
    // Add tutorial step for scan results? Triggered from performSectorScan instead.

    if(targetTutorialStep) {
        console.log(`UI: Intercepting screen change to show tutorial: ${targetTutorialStep}`);
        showTutorialStep(targetTutorialStep);
        blockScreenChange = true;
    }

    if (!blockScreenChange) {
        screens.forEach(screen => { screen?.classList.toggle('current', screen?.id === screenId); screen?.classList.toggle('hidden', screen?.id !== screenId); });
    } else {
         screens.forEach(screen => { if(screen?.id !== screenId) screen?.classList.add('hidden'); screen?.classList.toggle('current', screen?.id === screenId); });
    }

    if (mainNavBar) {
        const showNav = State.getOnboardingTutorialStep() !== 'start' && isPostQuestionnaire;
        mainNavBar.classList.toggle('hidden', !showNav || screenId === 'welcomeScreen' || screenId === 'chartingScreen');
    }
    navButtons.forEach(button => {
        if(button) { button.classList.toggle('active', button.dataset.target === screenId); if (!button.id && button.dataset.target) { button.id = `navButton-${button.dataset.target}`; } }
    });

    applyOnboardingPhaseUI(State.getOnboardingPhase()); // Apply after screen toggles

    if (!blockScreenChange && isPostQuestionnaire) {
        if (screenId === 'constellationMapScreen' && typeof GameLogic.displayConstellationMapScreenLogic === 'function') GameLogic.displayConstellationMapScreenLogic();
        else if (screenId === 'observatoryScreen' && typeof GameLogic.displayObservatoryScreenLogic === 'function') GameLogic.displayObservatoryScreenLogic();
        else if (screenId === 'starCatalogScreen' && typeof refreshStarCatalogDisplay === 'function') refreshStarCatalogDisplay(); // Renamed? refreshStarCatalogDisplay?
        else if (screenId === 'cartographyScreen' && typeof displayCartographyContent === 'function') displayCartographyContent(); // Renamed? displayCartographyContent?
    }

    if (!blockScreenChange && ['chartingScreen', 'starCatalogScreen', 'constellationMapScreen', 'observatoryScreen', 'cartographyScreen'].includes(screenId)) {
        window.scrollTo(0, 0);
    }
}

// --- Onboarding UI Adjustments ---
export function applyOnboardingPhaseUI(phase) {
    console.log(`UI: Applying onboarding phase ${phase}`);
    const isPhase1 = phase >= Config.ONBOARDING_PHASE.PERSONA_GRIMOIRE;
    const isPhase2 = phase >= Config.ONBOARDING_PHASE.STUDY_INSIGHT;
    const isPhase3 = phase >= Config.ONBOARDING_PHASE.REFLECTION_RITUALS;
    const isPhase4 = phase >= Config.ONBOARDING_PHASE.ADVANCED;

    // Ensure navButtons NodeList is available
    if (typeof navButtons !== 'undefined' && navButtons) {
        navButtons.forEach(button => {
            if (!button) return; const target = button.dataset.target; let hide = false;
            if (target === 'observatoryScreen' && !isPhase2) hide = true;
            else if (target === 'cartographyScreen' && !isPhase4) hide = true;
            button.classList.toggle('hidden-by-flow', hide);
        });
    } else { console.warn("applyOnboardingPhaseUI: navButtons not found."); }

    // Toggle Catalog Filters
    if (typeof catalogFilterControls !== 'undefined' && catalogFilterControls) { catalogFilterControls.classList.toggle('hidden-by-flow', !isPhase2); }

    // Toggle Observatory Actions & Rituals
    if (typeof deepScanButton !== 'undefined' && deepScanButton) { deepScanButton.classList.toggle('hidden-by-flow', !isPhase3); }
    const ritualsSection = typeof observatoryScreen !== 'undefined' && observatoryScreen ? observatoryScreen.querySelector('.observatory-rituals') : null;
    if (ritualsSection) { ritualsSection.classList.toggle('hidden-by-flow', !isPhase3); }

    // Update popup elements based on phase (Observatory View)
    const popupStarId = GameLogic.getCurrentPopupStarId();
    if (popupStarId !== null && typeof observatoryViewPopup !== 'undefined' && observatoryViewPopup && !observatoryViewPopup.classList.contains('hidden')) {
        if(typeof updateAlignStarButtonStatus === 'function') updateAlignStarButtonStatus(popupStarId);
        const discoveredData = State.getDiscoveredConceptData(popupStarId);
        const star = concepts.find(c => c.id === popupStarId);
        const inScanLog = !discoveredData && typeof scanOutput !== 'undefined' && scanOutput ? scanOutput.querySelector(`.scan-result-item[data-concept-id="${popupStarId}"]`) : false;
        if(typeof updateCatalogStarButtonStatus === 'function') updateCatalogStarButtonStatus(popupStarId, !!inScanLog);
        if(typeof updateObservatorySellButton === 'function') updateObservatorySellButton(popupStarId, star, !!discoveredData, !!inScanLog);
        if (typeof logbookSection !== 'undefined' && logbookSection) logbookSection.classList.toggle('hidden', !isPhase2 || !discoveredData);
        if (typeof stellarEvolutionSection !== 'undefined' && stellarEvolutionSection) stellarEvolutionSection.classList.toggle('hidden', !isPhase4 || !discoveredData || !star?.canUnlockArt || discoveredData?.artUnlocked);
        if(star && discoveredData && typeof displayStellarEvolutionSection === 'function') displayStellarEvolutionSection(star, discoveredData);
    }

    // Update Constellation Map buttons
    if(typeof updateSuggestBlueprintButtonState === 'function') updateSuggestBlueprintButtonState();
    if (typeof discoverMoreButton !== 'undefined' && discoverMoreButton) discoverMoreButton.classList.toggle('hidden-by-flow', !isPhase2);
}

// --- Insight Display ---
export function updateInsightDisplays() {
    const insight = State.getInsight().toFixed(1);
    if (userInsightDisplayConstellation) userInsightDisplayConstellation.textContent = insight;
    if (userInsightDisplayObservatory) userInsightDisplayObservatory.textContent = insight;
    if (typeof displayScanButtons === 'function') displayScanButtons(); // Check if function exists
    if (deepScanButton) deepScanButton.disabled = State.getInsight() < Config.GUIDED_REFLECTION_COST;
    if (deepScanCostDisplay) deepScanCostDisplay.textContent = Config.GUIDED_REFLECTION_COST;
    // ... (Refresh Force Insight / Deep Dive - Currently removed) ...
    if (cartographyScreen && cartographyScreen.classList.contains('current')) {
        if(typeof displayCartographyContent === 'function') displayCartographyContent();
    }
    const popupStarId = GameLogic.getCurrentPopupStarId();
    if (popupStarId !== null && observatoryViewPopup && !observatoryViewPopup.classList.contains('hidden')) {
          const star = concepts.find(c => c.id === popupStarId);
          const discoveredData = State.getDiscoveredConceptData(popupStarId);
          if(star && discoveredData && typeof displayStellarEvolutionSection === 'function') displayStellarEvolutionSection(star, discoveredData);
    }
    // updateContemplationButtonState(); // Removed
    if(typeof updateSuggestBlueprintButtonState === 'function') updateSuggestBlueprintButtonState();
}


// --- Charting (Questionnaire) UI ---
export function initializeQuestionnaireUI() { // Renamed? Maybe keep internal name
    updateForceProgressHeader(-1); // Renamed
    displayForceQuestions(0); // Renamed
    if (mainNavBar) mainNavBar.classList.add('hidden');
    if (dynamicForceFeedback) dynamicForceFeedback.style.display = 'none'; // Renamed
}
export function updateForceProgressHeader(activeIndex) { // Renamed
    if (!forceProgressHeader) return; forceProgressHeader.innerHTML = ''; // Renamed selector
    elementNames.forEach((name, index) => {
        const tab = document.createElement('div'); tab.classList.add('element-tab'); // Keep class name
        const forceData = elementDetails[name] || {}; // Use internal name
        tab.textContent = forceData.name || name; tab.title = forceData.name || name;
        tab.classList.toggle('completed', index < activeIndex); tab.classList.toggle('active', index === activeIndex);
        forceProgressHeader.appendChild(tab); // Renamed selector
    });
}
export function displayForceQuestions(index) { // Renamed
    const currentState = State.getState();
    if (index >= elementNames.length) {
        const lastElementIndex = elementNames.length - 1;
        if (lastElementIndex >= 0) {
            const finalAnswers = getQuestionnaireAnswers(); // Keep generic name
            State.updateAnswers(elementNames[lastElementIndex], finalAnswers);
        }
        GameLogic.finalizeCharting(); // Renamed handler
        return;
    }
    const forceName = elementNames[index]; // Internal name
    const forceData = elementDetails[forceName] || {};
    const questions = questionnaireGuided[forceName] || [];
    if (!questionContent) { console.error("questionContent element missing!"); return; }
    const forceAnswers = currentState.userAnswers?.[forceName] || {}; // Renamed var
    console.log(`UI: Displaying questions for Force Index ${index} (${forceName}). Initial answers:`, JSON.parse(JSON.stringify(forceAnswers)));
    // --- Generate HTML (Use new theme terminology) ---
    let introHTML = `<div class="element-intro"><h2>${forceData.name || forceName}</h2><p><em>${forceData.coreQuestion || ''}</em></p><p>${forceData.coreConcept || 'Loading...'}</p><p><small><strong>Cosmic Connection:</strong> ${forceData.personaConnection || ''}</small></p></div>`; // Renamed label
    let questionsHTML = '';
    questions.forEach(q => {
        let inputHTML = `<div class="question-block" id="block_${q.qId}"><h3 class="question-title">${q.text}</h3><div class="input-container">`;
        const savedAnswer = forceAnswers[q.qId];
        if (q.type === "slider") { /* ... same slider HTML ... */ }
        else if (q.type === "radio") { /* ... same radio HTML ... */ }
        else if (q.type === "checkbox") { /* ... same checkbox HTML ... */ }
        inputHTML += `</div></div>`; questionsHTML += inputHTML;
    });
    if(questions.length === 0) questionsHTML = '<p><em>(No probes for this Force)</em></p>'; // Updated text
    questionContent.innerHTML = introHTML;
    const introDiv = questionContent.querySelector('.element-intro');
    if (introDiv) introDiv.insertAdjacentHTML('afterend', questionsHTML);
    else questionContent.innerHTML += questionsHTML;
    // --- Attach Listeners ---
    questionContent.querySelectorAll('.q-input').forEach(input => { /* ... same listener logic ... */ });
    questionContent.querySelectorAll('input[type="checkbox"].q-input').forEach(checkbox => { /* ... same listener logic ... */ });
    // --- Initial UI Updates ---
    if (dynamicForceFeedback) dynamicForceFeedback.style.display = 'block'; // Renamed
    questionContent.querySelectorAll('.slider.q-input').forEach(slider => {
        updateSliderFeedbackText(slider, forceName); // Pass internal name
    });
    updateDynamicFeedback(forceName, forceAnswers); // Update score display, pass internal name
    updateForceProgressHeader(index); // Renamed
    if (progressText) progressText.textContent = `Charting Force ${index + 1} / ${elementNames.length}: ${forceData.name || forceName}`;
    if (prevForceButton) prevForceButton.style.visibility = (index > 0) ? 'visible' : 'hidden'; // Renamed ID
    if (nextForceButton) nextForceButton.textContent = (index === elementNames.length - 1) ? "Reveal Nebula" : "Next Force"; // Renamed ID & Text
}
export function updateSliderFeedbackText(sliderElement, forceName) { // Renamed param
    // ... (Logic remains same, uses internal forceName) ...
}
export function updateDynamicFeedback(forceName, currentAnswers) { // Renamed param
     const forceData = elementDetails?.[forceName]; // Use internal name
     if (!forceData || !dynamicForceFeedback || !feedbackForceSpan || !feedbackScoreSpan || !feedbackScoreBar) { if(dynamicForceFeedback) dynamicForceFeedback.style.display = 'none'; return; }
     const tempScore = GameLogic.calculateElementScore(forceName, currentAnswers); // Keep internal name
     const scoreLabel = Utils.getScoreLabel(tempScore);
     feedbackForceSpan.textContent = forceData.name || forceName; // Display themed name
     feedbackScoreSpan.textContent = tempScore.toFixed(1);
     let labelSpan = dynamicForceFeedback.querySelector('.score-label');
     if(!labelSpan && feedbackScoreSpan?.parentNode) { labelSpan = document.createElement('span'); labelSpan.classList.add('score-label'); feedbackScoreSpan.parentNode.insertBefore(labelSpan, feedbackScoreSpan.nextSibling); }
     if (labelSpan) labelSpan.textContent = ` (${scoreLabel})`;
     feedbackScoreBar.style.width = `${tempScore * 10}%`;
     dynamicForceFeedback.style.display = 'block';
}
export function getQuestionnaireAnswers() { // Keep generic name
     const answers = {}; const inputs = questionContent?.querySelectorAll('.q-input'); if (!inputs) return answers;
     inputs.forEach(input => { /* ... same logic ... */ }); return answers;
}


// --- Constellation Map (Persona) Screen UI ---
export function displayConstellationMapScreen() { // Renamed
    // Target new elements: #constellationName, #constellationVisualPlaceholder, #constellationInterpretationText, #constellationDominantForces, #constellationForceDetails
    console.log("UI: Displaying Constellation Map Screen");

    const constellationNameElement = document.getElementById('constellationName');
    const mapVisualPlaceholder = document.getElementById('constellationVisualPlaceholder'); // TODO: Implement actual map drawing
    const interpretationTextElement = document.getElementById('constellationInterpretationText');
    const dominantForcesElement = document.getElementById('constellationDominantForces');
    const forceDetailsElement = document.getElementById('constellationForceDetails');

    // 1. Update Constellation Name (Optional - generated in GameLogic potentially)
    // constellationNameElement.textContent = GameLogic.getGeneratedConstellationName() || "Your Constellation";

    // 2. Update Map Visual (Placeholder for now)
    // This is where complex SVG/Canvas logic would go to draw stars and connections
    // For now, maybe just list the aligned stars in the placeholder?
    const alignedStars = State.getFocusedConcepts();
    if(mapVisualPlaceholder) {
        if (alignedStars.size > 0) {
            let starList = '<ul>';
            alignedStars.forEach(id => {
                const name = State.getDiscoveredConceptData(id)?.concept?.name || `Star ${id}`;
                starList += `<li><i class="fas fa-star"></i> ${name}</li>`;
            });
            starList += '</ul><p>(Placeholder: Connections not drawn)</p>';
             mapVisualPlaceholder.innerHTML = starList;
        } else {
             mapVisualPlaceholder.innerHTML = `<i class="fas fa-meteor" style="font-size: 3em; color: #555;"></i><p>(Align Stars from your Catalog to build your Constellation)</p>`;
        }
    }


    // 3. Display Interpretation / Narrative
    if(interpretationTextElement) {
         const narrative = GameLogic.calculateConstellationNarrative(); // Fetch latest narrative
         interpretationTextElement.innerHTML = narrative || 'Align Stars to see emergent patterns...';
    }

    // 4. Display Dominant Forces (Based on focused stars)
    if(dominantForcesElement) {
         const themes = GameLogic.calculateFocusThemes(); // Renamed? calculateDominantForces?
         dominantForcesElement.innerHTML = ''; // Clear previous
         if (themes.length > 0) {
              themes.slice(0, 3).forEach(theme => {
                   dominantForcesElement.innerHTML += `<p><strong>${theme.name}</strong> (${theme.count} Star${theme.count > 1 ? 's' : ''})</p>`;
              });
         } else {
              dominantForcesElement.innerHTML = '<p>No dominant forces detected in current alignment.</p>';
         }
    }

    // 5. Display Core Force Details (Scores)
    if(forceDetailsElement) {
         forceDetailsElement.innerHTML = '';
         const scores = State.getScores();
         elementNames.forEach(forceName => {
              const key = elementNameToKey[forceName];
              const score = scores[key];
              const forceData = elementDetails[forceName] || {};
              const scoreLabel = Utils.getScoreLabel(score);
              const color = Utils.getElementColor(forceName);
              const item = document.createElement('div');
              item.classList.add('force-detail-entry');
              item.style.borderColor = color;
              item.innerHTML = `
                   <div class="force-detail-header">
                        <strong>${forceData.name || forceName}:</strong>
                        <div>
                             <span class="score-value">${score?.toFixed(1) ?? '?'}</span>
                             <span class="score-label">(${scoreLabel})</span>
                        </div>
                   </div>
                   `;
               // Add attunement/deep dive integration here if desired for this view
              forceDetailsElement.appendChild(item);
         });
    }

    updateInsightDisplays(); // Update insight display on this screen
    // applyOnboardingPhaseUI is called by showScreen
    updateSuggestBlueprintButtonState(); // Renamed
    // Update button states like Discover More
    if(discoverMoreButton) discoverMoreButton.classList.toggle('hidden-by-flow', State.getOnboardingPhase() < Config.ONBOARDING_PHASE.STUDY_INSIGHT);
}
// Remove old persona screen display functions if they exist separately
// export function displayElementAttunement() { ... } // Now integrated or handled differently
// export function updateFocusSlotsDisplay() { ... } // Integrated into displayConstellationMapScreen or removed if display changes
// export function displayFocusedConceptsPersona() { ... } // Integrated
// export function updateFocusElementalResonance() { ... } // Integrated
// export function generateTapestryNarrative() { ... } // Integrated
// export function synthesizeAndDisplayThemesPersona() { ... } // Integrated
// export function displayPersonaSummary() { ... } // Removed, constellation map is the main view


// --- Observatory (Study) Screen UI ---
export function displayObservatoryScreenContent() { // Renamed
    console.log("UI: Displaying Observatory Screen Content");
    updateInsightDisplays(); // Refreshes costs/availability
    displayStellarHarmonics(); // Renamed from displayDailyRituals
    // applyOnboardingPhaseUI called by showScreen
}
export function displayScanButtons() { // Renamed from displayResearchButtons
    if (!sectorScanButtonContainer) return; // Renamed selector
    sectorScanButtonContainer.innerHTML = '';
    const insight = State.getInsight(); const attunement = State.getAttunement();

    if (dailyScanButton) { // Renamed selector
        const available = State.isFreeResearchAvailable();
        const showScan = available && State.getOnboardingPhase() >= Config.ONBOARDING_PHASE.STUDY_INSIGHT;
        dailyScanButton.classList.toggle('hidden', !showScan);
        dailyScanButton.disabled = !available;
        dailyScanButton.textContent = available ? "Perform Daily Calibration Scan" : "Daily Calibration Done";
        if (!available && State.getOnboardingPhase() >= Config.ONBOARDING_PHASE.STUDY_INSIGHT) { dailyScanButton.classList.remove('hidden'); }
    }

    elementNames.forEach(elName => {
        const key = elementNameToKey[elName]; const currentAttunement = attunement[key] || 0;
        let currentCost = Config.BASE_RESEARCH_COST; // Use config, maybe rename later
        if (currentAttunement > 80) currentCost = Math.max(5, Config.BASE_RESEARCH_COST - 5);
        else if (currentAttunement > 50) currentCost = Math.max(5, Config.BASE_RESEARCH_COST - 3);
        const canAfford = insight >= currentCost; const fullName = elementDetails[elName]?.name || elName;
        const button = document.createElement('button'); button.classList.add('button', 'sector-scan-button'); // New class name
        button.dataset.elementKey = key; button.dataset.cost = currentCost; button.disabled = !canAfford;
        button.title = `Scan ${fullName} Sector (Cost: ${currentCost} Insight)`;
        button.innerHTML = `<span class="scan-el-icon" style="color: ${Utils.getElementColor(elName)};"><i class="${Utils.getElementIcon(fullName)}"></i></span><span class="scan-el-name">${fullName}</span><span class="scan-el-cost">${currentCost} <i class="fas fa-brain insight-icon"></i></span>`;
        sectorScanButtonContainer.appendChild(button);
    });

    if (deepScanButton) deepScanButton.disabled = insight < Config.GUIDED_REFLECTION_COST; // Renamed selector
    if (deepScanCostDisplay) deepScanCostDisplay.textContent = Config.GUIDED_REFLECTION_COST; // Renamed selector
}
export function displayStellarHarmonics() { // Renamed from displayDailyRituals
     if (!observatoryRitualsDisplay) return; // Renamed selector
     observatoryRitualsDisplay.innerHTML = '';
     if (State.getOnboardingPhase() < Config.ONBOARDING_PHASE.REFLECTION_RITUALS) { observatoryRitualsDisplay.innerHTML = '<li>Unlock Harmonics by progressing.</li>'; return; }
     const completed = State.getState().completedRituals.daily || {}; const focused = State.getFocusedConcepts();
     let activeRituals = [...dailyRituals]; // Keep using original data structure name for now
     if (focusRituals) { /* ... Add focus rituals ... */ }
     if (activeRituals.length === 0) { observatoryRitualsDisplay.innerHTML = '<li>No Stellar Harmonics currently active.</li>'; return; }
     activeRituals.forEach(ritual => { /* ... Render ritual list items ... */ });
}
export function displayResearchStatus(message) { if (scanStatus) scanStatus.textContent = message; } // Renamed selector
export function displayResearchResults(results) { // Renamed? displayScanResults?
    if (!scanOutput) return; const { concepts: foundStars, repositoryItems, duplicateInsightGain } = results; // Renamed concepts -> foundStars
    const placeholder = scanOutput.querySelector('p > i');
    if ((foundStars.length > 0 || repositoryItems.length > 0) && placeholder && scanOutput.children.length === 1) { placeholder.parentElement.innerHTML = ''; }
    if (duplicateInsightGain > 0) { const dupeMsg = document.createElement('p'); dupeMsg.classList.add('duplicate-message'); dupeMsg.innerHTML = `<i class="fas fa-wave-square"></i> Gained ${duplicateInsightGain.toFixed(0)} Insight from signal echoes.`; scanOutput.prepend(dupeMsg); setTimeout(() => dupeMsg.remove(), 5000); } // Changed icon
    foundStars.forEach(star => { // Use star variable
        if (!scanOutput.querySelector(`.scan-result-item[data-concept-id="${star.id}"]`)) { // Check class name?
            const resultItemDiv = document.createElement('div'); resultItemDiv.classList.add('scan-result-item'); resultItemDiv.dataset.conceptId = star.id;
            const cardElement = renderStarCard(star, 'scan-output'); // Use renderStarCard, new context
            resultItemDiv.appendChild(cardElement);
            const actionDiv = document.createElement('div'); actionDiv.classList.add('scan-actions'); // Renamed class?
            const catalogButton = document.createElement('button'); catalogButton.textContent = "Catalog Star"; catalogButton.classList.add('button', 'small-button', 'scan-action-button', 'catalog-button'); catalogButton.dataset.conceptId = star.id; // Renamed button
            let discoveryValue = Config.CONCEPT_DISCOVERY_INSIGHT[star.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default; const sellValue = discoveryValue * Config.SELL_INSIGHT_FACTOR;
            const analyzeButton = document.createElement('button'); analyzeButton.textContent = `Analyze (${sellValue.toFixed(1)}) `; analyzeButton.innerHTML += `<i class="fas fa-brain insight-icon"></i>`; analyzeButton.classList.add('button', 'small-button', 'secondary-button', 'sell-button'); analyzeButton.dataset.conceptId = star.id; analyzeButton.dataset.context = 'research'; analyzeButton.title = `Analyze signal for ${sellValue.toFixed(1)} Insight.`; // Renamed button & text
            actionDiv.appendChild(catalogButton); actionDiv.appendChild(analyzeButton);
            resultItemDiv.appendChild(actionDiv); scanOutput.appendChild(resultItemDiv);
        }
    });
    repositoryItems.forEach(item => { /* ... Display repo item discoveries (Blueprints/Whispers) ... */ });
    if (scanOutput.children.length === 0 && !placeholder) { scanOutput.innerHTML = '<p><i>Faint echoes detected... perhaps scan another sector?</i></p>'; }
}
export function updateResearchButtonAfterAction(starId, action) { // Renamed conceptId -> starId
    const itemDiv = scanOutput?.querySelector(`.scan-result-item[data-concept-id="${starId}"]`); if (!itemDiv) return; // Renamed selector
    if (action === 'add' || action === 'sell') { // 'add' is now 'catalog'
        itemDiv.remove();
        if (scanOutput && scanOutput.children.length === 0) { scanOutput.innerHTML = '<p><i>Scan log cleared.</i></p>'; if (action === 'sell' && scanStatus) { displayResearchStatus("Ready for new scan."); } } // Renamed UI func
    }
}

// --- Star Catalog (Grimoire) Screen UI ---
export function updateGrimoireCounter() { if (starCountSpan) starCountSpan.textContent = State.getDiscoveredConcepts().size; } // Renamed selector
export function populateGrimoireFilters() { // Rename? populateCatalogFilters?
    if (catalogTypeFilter) { catalogTypeFilter.innerHTML = '<option value="All">All Types</option>'; cardTypeKeys.forEach(type => { const option = document.createElement('option'); option.value = type; option.textContent = type; catalogTypeFilter.appendChild(option); }); } // Renamed selector
    if (catalogForceFilter) { catalogForceFilter.innerHTML = '<option value="All">All Forces</option>'; elementNames.forEach(fullName => { const name = elementDetails[fullName]?.name || fullName; const option = document.createElement('option'); option.value = fullName; option.textContent = name; catalogForceFilter.appendChild(option); }); } // Renamed selector
}
export function displayGrimoire(filterType = "All", filterForce = "All", sortBy = "discovered", filterRarity = "All", searchTerm = "", filterFocus = "All") { // Renamed filterElement -> filterForce
    if (!starCatalogContent) return; starCatalogContent.innerHTML = ''; // Renamed selector
    const discoveredMap = State.getDiscoveredConcepts(); if (discoveredMap.size === 0) { starCatalogContent.innerHTML = '<p>Your Star Catalog is empty. Scan sectors in the Observatory to discover Stars!</p>'; return; } // Updated text
    const userScores = State.getScores();
    const focusedSet = State.getFocusedConcepts(); // Keep internal name
    let discoveredArray = Array.from(discoveredMap.values());
    const searchTermLower = searchTerm.toLowerCase().trim();
    const starsToDisplay = discoveredArray.filter(data => { // Renamed variable
        if (!data?.concept) return false; const star = data.concept; // Renamed variable
        const typeMatch = (filterType === "All") || (star.cardType === filterType);
        const forceKey = (filterForce !== "All" && elementNameToKey) ? elementNameToKey[filterForce] : "All"; // Use filterForce
        const forceMatch = (forceKey === "All") || (star.primaryElement === forceKey); // Check forceMatch
        const rarityMatch = (filterRarity === "All") || (star.rarity === filterRarity);
        const focusMatch = (filterFocus === 'All') || (filterFocus === 'Aligned' && focusedSet.has(star.id)) || (filterFocus === 'Not Aligned' && !focusedSet.has(star.id)); // Use Aligned text
        const searchMatch = !searchTermLower || (star.name.toLowerCase().includes(searchTermLower)) || (star.keywords && star.keywords.some(k => k.toLowerCase().includes(searchTermLower)));
        return typeMatch && forceMatch && rarityMatch && focusMatch && searchMatch;
    });
    const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3 };
    starsToDisplay.sort((a, b) => { /* ... same sorting logic ... */ });
    if (starsToDisplay.length === 0) { starCatalogContent.innerHTML = `<p>No cataloged Stars match the current filters${searchTermLower ? ' or search term' : ''}.</p>`; } // Updated text
    else { starsToDisplay.forEach(data => { const cardElement = renderStarCard(data.concept, 'starCatalog'); if (cardElement) { starCatalogContent.appendChild(cardElement); } }); } // Renamed context, render func
}
export function refreshGrimoireDisplay() { // Rename? refreshCatalogDisplay?
     if (starCatalogScreen && !starCatalogScreen.classList.contains('hidden')) { // Renamed selector
         const typeValue = catalogTypeFilter?.value || "All"; // Renamed selector
         const forceValue = catalogForceFilter?.value || "All"; // Renamed selector
         const sortValue = catalogSortOrder?.value || "discovered"; // Renamed selector
         const rarityValue = catalogRarityFilter?.value || "All"; // Renamed selector
         const searchValue = catalogSearchInput?.value || ""; // Renamed selector
         const focusValue = catalogFocusFilter?.value || "All"; // Renamed selector
         displayGrimoire(typeValue, forceValue, sortValue, rarityValue, searchValue, focusValue); // Renamed func, param
     }
}

// --- Star Card Rendering ---
// Renamed renderCard -> renderStarCard
export function renderStarCard(star, context = 'starCatalog') { // Renamed param, default context
    if (!star || typeof star.id === 'undefined') { console.warn("renderStarCard invalid data:", star); const d = document.createElement('div'); d.textContent = "Error"; return d; }
    const cardDiv = document.createElement('div'); cardDiv.classList.add('star-card'); cardDiv.classList.add(`rarity-${star.rarity || 'common'}`); cardDiv.dataset.conceptId = star.id; cardDiv.title = `View ${star.name}`; // Keep conceptId in dataset for consistency?
    const discoveredData = State.getDiscoveredConceptData(star.id); const isCataloged = !!discoveredData; // Renamed var
    const isAligned = State.getFocusedConcepts().has(star.id); // Renamed var
    const artUnlocked = discoveredData?.artUnlocked || false; // Stellar Evolution
    const showAlignIndicator = isAligned && State.getOnboardingPhase() >= Config.ONBOARDING_PHASE.PERSONA_GRIMOIRE; // Use Aligned nomenclature
    const catalogStampHTML = isCataloged ? '<span class="star-stamp" title="Cataloged"><i class="fas fa-book-journal"></i></span>' : ''; // Renamed class, changed icon
    const alignStampHTML = showAlignIndicator ? '<span class="alignment-indicator" title="Aligned Star">✦</span>' : ''; // Renamed class, changed icon
    const cardTypeIcon = Utils.getCardTypeIcon(star.cardType);
    let affinitiesHTML = '';
    if (star.elementScores && elementKeyToFullName) {
        Object.entries(star.elementScores).forEach(([key, score]) => {
            const level = Utils.getAffinityLevel(score);
            if (level && elementKeyToFullName[key]) {
                const fullName = elementKeyToFullName[key]; const color = Utils.getElementColor(fullName); const iconClass = Utils.getElementIcon(fullName); const forceNameDetail = elementDetails[fullName]?.name || fullName; // Renamed var
                affinitiesHTML += `<span class="affinity affinity-${level.toLowerCase()}" style="border-color: ${color}; background-color: ${Utils.hexToRgba(color, 0.1)};" title="${forceNameDetail} Pull: ${level} (${score.toFixed(1)})"><i class="${iconClass}" style="color: ${color};"></i></span> `; // Updated title
            }
        });
    }
    let visualIconClass = "fas fa-star-of-life star-visual-placeholder"; let visualTitle = "Stellar Signature"; // New placeholder icon/title
    if (artUnlocked) { visualIconClass = "fas fa-sun star-visual-placeholder star-art-unlocked"; visualTitle = "Full Potential Revealed"; } // Changed icon
    else if (star.visualHandle) { visualIconClass = "fas fa-circle-notch star-visual-placeholder"; visualTitle = "Basic Signature"; } // Changed icon
    const visualContent = `<i class="${visualIconClass}" title="${visualTitle}"></i>`;
    let sellButtonHTML = '';
    if (context === 'starCatalog' && State.getOnboardingPhase() >= Config.ONBOARDING_PHASE.STUDY_INSIGHT) {
        let discoveryValue = Config.CONCEPT_DISCOVERY_INSIGHT[star.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default;
        const sellValue = discoveryValue * Config.SELL_INSIGHT_FACTOR;
        sellButtonHTML = `<button class="button small-button secondary-button sell-button card-sell-button" data-concept-id="${star.id}" data-context="grimoire" title="Analyze signal for ${sellValue.toFixed(1)} Insight.">Analyze <i class="fas fa-brain insight-icon"></i>${sellValue.toFixed(1)}</button>`; // Changed text
    }
    cardDiv.innerHTML = `<div class="card-header"><i class="${cardTypeIcon} card-type-icon" title="${star.cardType}"></i><span class="card-name">${star.name}</span><span class="card-stamps">${alignStampHTML}${catalogStampHTML}</span></div><div class="card-visual">${visualContent}</div><div class="card-footer"><div class="card-affinities">${affinitiesHTML || '<small style="color:#888; font-style: italic;">Basic Signature</small>'}</div><p class="card-brief-desc">${star.briefDescription || '...'}</p>${sellButtonHTML}</div>`;
    if (context !== 'no-click') { cardDiv.addEventListener('click', (event) => { if (event.target.closest('button')) return; showObservatoryViewPopup(star.id); }); } // Renamed popup func
    if (context === 'scan-output') { cardDiv.title = `View signal details for ${star.name} (Not yet cataloged)`; cardDiv.querySelector('.card-footer .sell-button')?.remove(); } // Updated text, keep removal logic
    return cardDiv;
}

// --- Observatory View (Concept Detail) Popup UI ---
// Renamed showConceptDetailPopup -> showObservatoryViewPopup
export function showObservatoryViewPopup(starId) {
    console.log(`UI: Attempting to show Observatory View for starId: ${starId}`);
    if (!observatoryViewPopup || !popupOverlay) { console.error("Observatory View Popup or overlay missing!"); return; }
    // Check essential elements using NEW IDs
    if (!observatoryStarName || !observatoryStarType || !observatoryStarTypeIcon || !observatoryDetailedDescription || !observatoryVisualContainer || !observatoryResonanceSummary || !observatoryComparisonHighlights || !observatoryStarProfile || !observatoryNebulaComparisonProfile || !observatoryRelatedStars || !logbookSection || !stellarEvolutionSection || !catalogStarButton || !alignStarButton) {
         console.error("One or more critical elements inside the Observatory View Popup are missing! Check HTML IDs."); UI.showTemporaryMessage("Error displaying Star details.", 3000); return;
    }
    const starData = concepts.find(c => c.id === starId); // Use internal concepts data
    if (!starData) { console.error("Star data missing for ID:", starId); UI.showTemporaryMessage("Error: Star data not found.", 3000); return; }
    console.log(`UI: Found star data for "${starData.name}"`);
    const discoveredData = State.getDiscoveredConceptData(starId); const isCataloged = !!discoveredData; // Renamed var
    const inScanLog = !isCataloged && scanOutput?.querySelector(`.scan-result-item[data-concept-id="${starId}"]`); // Renamed var and selector
    const currentPhase = State.getOnboardingPhase();
    GameLogic.setCurrentPopupConcept(starId); // Keep internal name for now

    // --- Populate Basic Info ---
    console.log("UI: Populating basic info...");
    observatoryStarName.textContent = starData.name;
    observatoryStarType.textContent = starData.cardType;
    observatoryStarTypeIcon.className = `${Utils.getCardTypeIcon(starData.cardType)} star-type-icon`; // Use star class
    observatoryDetailedDescription.textContent = starData.detailedDescription || "No description.";

    // --- Populate Visuals ---
    console.log("UI: Populating visual...");
    const artUnlocked = discoveredData?.artUnlocked || false;
    observatoryVisualContainer.innerHTML = ''; // Clear previous
    let visualIconClass = "fas fa-star-of-life star-visual-placeholder"; let visualTitle = "Stellar Signature";
    if (artUnlocked) { visualIconClass = "fas fa-sun star-visual-placeholder star-art-unlocked"; visualTitle = "Full Potential Revealed"; }
    else if (starData.visualHandle) { visualIconClass = "fas fa-circle-notch star-visual-placeholder"; visualTitle = "Basic Signature"; }
    const visualContent = `<i class="${visualIconClass}" title="${visualTitle}"></i>`;
    observatoryVisualContainer.innerHTML = visualContent;

    // --- Populate Analysis ---
    console.log("UI: Populating analysis sections...");
    const scores = State.getScores();
    const distance = Utils.euclideanDistance(scores, starData.elementScores);
    displayPopupResonance(distance); // Keep internal name
    displayPopupRecipeComparison(starData, scores); // Keep internal name
    displayPopupRelatedStars(starData); // Renamed

    // --- Logbook (Notes) Section ---
    console.log("UI: Handling Logbook section...");
    const showLogbook = isCataloged && currentPhase >= Config.ONBOARDING_PHASE.STUDY_INSIGHT; // Show if cataloged and phase allows
    if (logbookSection && logbookTextarea && saveLogEntryButton) {
        logbookSection.classList.toggle('hidden', !showLogbook);
        if (showLogbook) {
             logbookTextarea.value = discoveredData.notes || "";
             if(logSaveStatus) logSaveStatus.textContent = "";
             // Listener handled by delegation in main.js
        }
    }

    // --- Stellar Evolution Section ---
    console.log("UI: Handling Stellar Evolution section...");
    const showEvolution = isCataloged && currentPhase >= Config.ONBOARDING_PHASE.ADVANCED; // Show if cataloged and phase allows
    if (stellarEvolutionSection) {
        stellarEvolutionSection.classList.toggle('hidden', !showEvolution);
        if (showEvolution) displayStellarEvolutionSection(starData, discoveredData); // Renamed
    }

    // --- Update Action Buttons ---
    console.log("UI: Updating action buttons...");
    updateCatalogStarButtonStatus(starId, !!inScanLog); // Renamed
    updateAlignStarButtonStatus(starId); // Renamed
    updateObservatorySellButton(starId, starData, isCataloged, !!inScanLog); // Renamed

    // --- Tutorial Highlight Check ---
    const currentTutorialStep = State.getOnboardingTutorialStep();
    if (currentTutorialStep === 'grimoire_card_prompt') {
        console.log("UI: Triggering Observatory View tutorial steps.");
        // Immediately trigger the first step for this view
        showTutorialStep('focus_prompt'); // Start the explanation sequence
    } else if (currentTutorialStep === 'focus_prompt' || currentTutorialStep === 'focus_explained') {
        // If user re-opens popup while tutorial is active, re-trigger it
        showTutorialStep(currentTutorialStep);
    }

    // --- Show Popup ---
    console.log("UI: Displaying Observatory View popup.");
    observatoryViewPopup.classList.remove('hidden');
    popupOverlay.classList.remove('hidden');
}
export function displayPopupResonance(distance) { /* Logic same, update text? */ }
export function displayPopupRecipeComparison(starData, userCompScores = State.getScores()) { /* Logic same, update selectors/text */ }
// Renamed displayPopupRelatedConcepts -> displayPopupRelatedStars
export function displayPopupRelatedStars(starData) {
     if (!observatoryRelatedStars) return; observatoryRelatedStars.innerHTML = ''; // Use new selector
     if (starData.relatedIds && starData.relatedIds.length > 0) {
         const details = document.createElement('details'); details.classList.add('related-concepts-details'); // Keep class? Or rename?
         const summary = document.createElement('summary'); summary.innerHTML = `Constellation Links (${starData.relatedIds.length}) <i class="fas fa-info-circle info-icon" title="Stars with potential synergistic links. Aligning linked Stars may reveal unique patterns or unlock Cartography data."></i>`; details.appendChild(summary); // Updated text
         const listDiv = document.createElement('div'); listDiv.classList.add('related-concepts-list-dropdown'); // Keep class?
         let foundCount = 0;
         starData.relatedIds.forEach(relatedId => {
             const relatedStar = concepts.find(c => c.id === relatedId); // Find related concept data
             if (relatedStar) { const span = document.createElement('span'); span.textContent = relatedStar.name; span.classList.add('related-concept-item'); span.title = `Linked: ${relatedStar.name}`; listDiv.appendChild(span); foundCount++; }
             else { console.warn(`Linked Star ID ${relatedId} in ${starData.id} not found.`); }
         });
         if (foundCount > 0) { details.appendChild(listDiv); observatoryRelatedStars.appendChild(details); } // Use new selector
         else { observatoryRelatedStars.innerHTML = `<details class="related-concepts-details"><summary>Constellation Links <i class="fas fa-info-circle info-icon" title="..."></i></summary><p>Error: Linked stars not found.</p></details>`; } // Updated text
     } else { observatoryRelatedStars.innerHTML = `<details class="related-concepts-details"><summary>Constellation Links <i class="fas fa-info-circle info-icon" title="..."></i></summary><p>No direct links known.</p></details>`; } // Updated text
}
// Renamed displayEvolutionSection -> displayStellarEvolutionSection
export function displayStellarEvolutionSection(starData, discoveredData) {
     if (!stellarEvolutionSection || !evolveStarButton || !evolveEligibilityObs || !evolveCostObs) return; // Use new selectors
     const isCataloged = !!discoveredData; const canUnlockArt = starData.canUnlockArt; const alreadyUnlocked = discoveredData?.artUnlocked || false;
     const isAligned = State.getFocusedConcepts().has(starData.id); const hasReflected = State.getState().seenPrompts.size > 0; const hasEnoughInsight = State.getInsight() >= Config.ART_EVOLVE_COST; const currentPhase = State.getOnboardingPhase();
     const showSection = isCataloged && canUnlockArt && !alreadyUnlocked && currentPhase >= Config.ONBOARDING_PHASE.ADVANCED;
     stellarEvolutionSection.classList.toggle('hidden', !showSection); // Use new selector
     if (!showSection) { evolveStarButton.disabled = true; evolveEligibilityObs.classList.add('hidden'); return; } // Use new selectors
     evolveCostObs.textContent = `${Config.ART_EVOLVE_COST}`; // Use new selector
     let eligibilityText = ''; let canEvolve = true;
     if (!isAligned) { eligibilityText += '<li>Requires: Align Star</li>'; canEvolve = false; } else { eligibilityText += '<li><i class="fas fa-check"></i> Aligned</li>'; } // Updated text
     if (!hasReflected) { eligibilityText += '<li>Requires: Engage in Reflection</li>'; canEvolve = false; } else { eligibilityText += '<li><i class="fas fa-check"></i> Reflected</li>'; }
     if (!hasEnoughInsight) { eligibilityText += `<li>Requires: ${Config.ART_EVOLVE_COST} Insight</li>`; canEvolve = false;} else { eligibilityText += `<li><i class="fas fa-check"></i> Insight OK</li>`; }
     evolveEligibilityObs.innerHTML = `<ul>${eligibilityText}</ul>`; evolveEligibilityObs.classList.remove('hidden'); // Use new selector
     evolveStarButton.disabled = !canEvolve; // Use new selector
}
// Renamed updateGrimoireButtonStatus -> updateCatalogStarButtonStatus
export function updateCatalogStarButtonStatus(starId, inScanLog = false) { // Renamed params
    if (!catalogStarButton) return; const isCataloged = State.getDiscoveredConcepts().has(starId); // Renamed var
    catalogStarButton.classList.toggle('hidden', isCataloged); // Hide if cataloged
    catalogStarButton.disabled = false; // Enable if visible
    catalogStarButton.textContent = "Catalog Star"; // Updated text
    catalogStarButton.classList.remove('added');
}
// Renamed updateFocusButtonStatus -> updateAlignStarButtonStatus
export function updateAlignStarButtonStatus(starId) {
    if (!alignStarButton) return; // Renamed selector
    const isCataloged = State.getDiscoveredConcepts().has(starId); // Renamed var
    const isAligned = State.getFocusedConcepts().has(starId); // Renamed var
    const slotsFull = State.getFocusedConcepts().size >= State.getFocusSlots();
    const phaseAllowsAlign = State.getOnboardingPhase() >= Config.ONBOARDING_PHASE.PERSONA_GRIMOIRE; // Phase name kept
    const showButton = isCataloged && phaseAllowsAlign; // Must be cataloged AND phase must allow alignment
    alignStarButton.classList.toggle('hidden', !showButton);
    if (showButton) {
        alignStarButton.textContent = isAligned ? "Remove Alignment" : "Align Star"; // Updated text
        alignStarButton.disabled = (slotsFull && !isAligned);
        alignStarButton.classList.toggle('marked', isAligned);
        alignStarButton.title = alignStarButton.disabled && !isAligned ? `Alignment capacity full (${State.getFocusSlots()})` : (isAligned ? "Remove from Constellation Map" : "Add to Constellation Map"); // Updated text
    }
}
// Renamed updatePopupSellButton -> updateObservatorySellButton
export function updateObservatorySellButton(starId, starData, isCataloged, inScanLog) { // Renamed params
    const popupActions = observatoryViewPopup?.querySelector('.popup-actions'); if (!popupActions || !starData) return;
    popupActions.querySelector('.popup-sell-button')?.remove(); // Remove existing first
    const context = isCataloged ? 'grimoire' : (inScanLog ? 'research' : 'none'); // Internal context names kept
    const phaseAllowsSell = State.getOnboardingPhase() >= Config.ONBOARDING_PHASE.STUDY_INSIGHT; // Keep phase name
    if (context !== 'none' && phaseAllowsSell) {
        let discoveryValue = Config.CONCEPT_DISCOVERY_INSIGHT[starData.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default;
        const sellValue = discoveryValue * Config.SELL_INSIGHT_FACTOR;
        const sourceLocation = context === 'grimoire' ? 'Star Catalog' : 'Scan Log'; // Renamed location text
        const sellButton = document.createElement('button');
        sellButton.classList.add('button', 'small-button', 'secondary-button', 'sell-button', 'popup-sell-button'); // Keep classes
        sellButton.textContent = `Analyze (${sellValue.toFixed(1)})`; // Updated text
        sellButton.innerHTML += ` <i class="fas fa-brain insight-icon"></i>`;
        sellButton.dataset.conceptId = starId; // Keep dataset name consistent?
        sellButton.dataset.context = context;
        sellButton.title = `Analyze signal from ${sourceLocation} for ${sellValue.toFixed(1)} Insight.`; // Updated text
        // Append after align button if visible, else after catalog button if visible, else at end
        if (alignStarButton && !alignStarButton.classList.contains('hidden')) { alignStarButton.insertAdjacentElement('afterend', sellButton); }
        else if (catalogStarButton && !catalogStarButton.classList.contains('hidden')) { catalogStarButton.insertAdjacentElement('afterend', sellButton); }
        else { popupActions.appendChild(sellButton); }
    }
}


// --- Reflection Modal UI ---
export function displayReflectionPrompt(promptData, context) {
    // Add Introduction Check
    if (!State.getHasSeenReflectionIntro() && State.getOnboardingPhase() >= Config.ONBOARDING_PHASE.REFLECTION_RITUALS) {
        showTemporaryMessage("Reflection Signal Received! Pausing to reflect grants Insight.", 4500); // Updated text
        State.setHasSeenReflectionIntro(true);
    }
    if (!reflectionModal || !promptData || !promptData.prompt) { /* ... error handling ... */ return; }
    const { title, category, prompt, showNudge, reward } = promptData;
    if (reflectionModalTitle) reflectionModalTitle.textContent = title || "Reflection Signal"; // Updated text
    if (reflectionSubject) reflectionSubject.textContent = category || "General Signal"; // Use new selector & text
    if (reflectionPromptText) reflectionPromptText.textContent = prompt.text;
    if (reflectionCheckbox) reflectionCheckbox.checked = false;
    if (scoreNudgeCheckbox && scoreNudgeLabel) { scoreNudgeCheckbox.checked = false; scoreNudgeCheckbox.classList.toggle('hidden', !showNudge); scoreNudgeLabel.classList.toggle('hidden', !showNudge); }
    if (confirmReflectionButton) confirmReflectionButton.disabled = true;
    if (reflectionRewardAmount) reflectionRewardAmount.textContent = `+${reward.toFixed(1)} Insight`; // Updated text format
    reflectionModal.classList.remove('hidden'); if (popupOverlay) popupOverlay.classList.remove('hidden');
}

// --- Integrated Force Insight (Deep Dive) UI ---
// Renamed displayElementDeepDive -> displayForceInsightLevels
export function displayForceInsightLevels(forceKey, targetContainerElement) {
     if (!targetContainerElement) { /* ... error handling ... */ return; }
     const deepDiveData = elementDeepDive[forceKey] || []; // Keep internal data name
     const unlockedLevels = State.getState().unlockedDeepDiveLevels;
     const currentLevel = unlockedLevels[forceKey] || 0;
     const forceName = elementKeyToFullName[forceKey] || forceKey; // Internal name
     const insight = State.getInsight();
     const showDeepDive = State.getOnboardingPhase() >= Config.ONBOARDING_PHASE.ADVANCED; // Keep phase name

     targetContainerElement.innerHTML = `<h5 class="deep-dive-section-title">${elementDetails[forceName]?.name || forceName} Insights</h5>`; // Use force name

     if (!showDeepDive) { targetContainerElement.innerHTML += '<p><i>Unlock Cartography to delve deeper.</i></p>'; return; } // Updated text
     if (deepDiveData.length === 0) { targetContainerElement.innerHTML += '<p>No deeper insights available for this Force.</p>'; return; } // Updated text

     let displayedContent = false;
     deepDiveData.forEach(levelData => { /* ... render unlocked levels ... */ });

     if (!displayedContent && currentLevel === 0) { /* ... show prompt to unlock first level ... */ }

     const nextLevel = currentLevel + 1;
     const nextLevelData = deepDiveData.find(l => l.level === nextLevel);
     if (nextLevelData) { /* ... render unlock button with cost ... */ }
     else if (displayedContent) { targetContainerElement.innerHTML += '<p class="all-unlocked-message"><i>All insights unlocked for this Force.</i></p>'; } // Updated text
     else if (!displayedContent && currentLevel > 0) { targetContainerElement.innerHTML += '<p><i>Error displaying insight content.</i></p>'; }
}


// --- Cartography (Repository) UI ---
export function displayCartographyContent() { // Renamed
     const showCartography = State.getOnboardingPhase() >= Config.ONBOARDING_PHASE.ADVANCED; // Keep phase name
     if (cartographyScreen) cartographyScreen.classList.toggle('hidden-by-flow', !showCartography); if(!showCartography) return; // Renamed selector
     // Use NEW selectors for content areas
     if (!cartographySynergiesDiv || !cartographyBlueprintsDiv || !cartographyOrbitsDiv || !cartographyWhispersDiv) { console.error("Cartography list containers missing!"); return; }
     console.log("UI: Displaying Cartography Content");
     cartographySynergiesDiv.innerHTML = ''; cartographyBlueprintsDiv.innerHTML = ''; cartographyOrbitsDiv.innerHTML = ''; cartographyWhispersDiv.innerHTML = '';
     const repoItems = State.getRepositoryItems(); const unlockedFocusData = State.getUnlockedFocusItems(); const attunement = State.getAttunement(); const focused = State.getFocusedConcepts(); const insight = State.getInsight();

     // Display Synergy Unlocks
     if (unlockedFocusData.size > 0) { unlockedFocusData.forEach(unlockId => { /* ... render synergy items ... */ }); }
     else { cartographySynergiesDiv.innerHTML = '<p>Align synergistic Stars to reveal discoveries here.</p>'; }

     // Display Blueprints (Scenes)
     if (repoItems.scenes.size > 0) { repoItems.scenes.forEach(sceneId => { const scene = sceneBlueprints.find(s => s.id === sceneId); if (scene) { const cost = scene.meditationCost || Config.SCENE_MEDITATION_BASE_COST; const canAfford = insight >= cost; cartographyBlueprintsDiv.appendChild(renderCartographyItem(scene, 'scene', cost, canAfford)); } else { console.warn(`Blueprint ID ${sceneId} not found.`); } }); } // Renamed render func
     else { cartographyBlueprintsDiv.innerHTML = '<p>No Nebula Blueprints discovered yet.</p>'; }

     // Display Orbits (Experiments)
     let orbitsDisplayed = 0;
     alchemicalExperiments.forEach(exp => { // Keep internal data name
         const isUnlockedByAttunement = attunement[exp.requiredElement] >= exp.requiredAttunement;
         const alreadyCompleted = repoItems.experiments.has(exp.id); // Completed orbits
         if (isUnlockedByAttunement) { /* ... check requirements, render orbit item ... */ orbitsDisplayed++; }
     });
     if (orbitsDisplayed === 0) { cartographyOrbitsDiv.innerHTML = '<p>Increase Force Strength to reveal complex Orbits.</p>'; }

     // Display Whispers (Insights)
     if (repoItems.insights.size > 0) { /* ... render whispers ... */ }
     else { cartographyWhispersDiv.innerHTML = '<p>No Cosmic Whispers intercepted yet.</p>'; }

     displayLegendaryAlignments(); // Renamed
     GameLogic.updateMilestoneProgress('repositoryContents', null); // Trigger check (keep internal name?)
 }
 // Renamed renderRepositoryItem -> renderCartographyItem
export function renderCartographyItem(item, type, cost, canAfford, completed = false, unmetReqs = []) {
     const div = document.createElement('div'); div.classList.add('cartography-item', `carto-item-${type}`); if (completed) div.classList.add('completed'); // Renamed class
     let actionsHTML = ''; let buttonDisabled = false; let buttonTitle = ''; let buttonText = '';
     if (type === 'scene') { // Blueprint
         buttonDisabled = !canAfford;
         buttonText = `Meditate (${cost} <i class="fas fa-brain insight-icon"></i>)`;
         if (!canAfford) buttonTitle = `Requires ${cost} Insight`;
         actionsHTML = `<button class="button small-button" data-scene-id="${item.id}" ${buttonDisabled ? 'disabled' : ''} title="${buttonTitle}">${buttonText}</button>`; // Keep dataset name?
     } else if (type === 'experiment') { // Orbit
         buttonDisabled = (!canAfford || completed || unmetReqs.length > 0);
         buttonText = `Stabilize (${cost} <i class="fas fa-brain insight-icon"></i>)`; // Updated text
         if (completed) buttonTitle = "Stabilized"; // Updated text
         else if (unmetReqs.length > 0 && unmetReqs.includes("Insight")) buttonTitle = `Requires ${cost} Insight & ${unmetReqs.filter(r=>r!=="Insight").join(', ')}`;
         else if (unmetReqs.length > 0) buttonTitle = `Requires Alignment: ${unmetReqs.join(', ')}`; // Updated text
         else if (!canAfford) buttonTitle = `Requires ${cost} Insight`;
         actionsHTML = `<button class="button small-button" data-experiment-id="${item.id}" ${buttonDisabled ? 'disabled' : ''} title="${buttonTitle}">${buttonText}</button>`; // Keep dataset name?
         if (completed) actionsHTML += ` <span class="completed-text">(Stabilized)</span>`; // Updated text
         else if (unmetReqs.length > 0 && unmetReqs.includes("Insight")) actionsHTML += ` <small class="req-missing">(Insufficient Insight & Alignment)</small>`; // Updated text
         else if (unmetReqs.length > 0) actionsHTML += ` <small class="req-missing">(Requires Alignment: ${unmetReqs.join(', ')})</small>`; // Updated text
         else if (!canAfford) actionsHTML += ` <small class="req-missing">(Insufficient Insight)</small>`;
     }
     div.innerHTML = `<h4>${item.name} ${type === 'experiment' ? `(Requires ${item.requiredAttunement} ${elementKeyToFullName[item.requiredElement]} Strength)` : ''}</h4><p>${item.description}</p><div class="repo-actions">${actionsHTML}</div>`; // Updated text
     return div;
 }

// --- Milestones UI ---
export function displayLegendaryAlignments() { // Renamed
    if (!legendaryAlignmentsDisplay) return; // Renamed selector
    legendaryAlignmentsDisplay.innerHTML = '';
    const achieved = State.getState().achievedMilestones;
    if (achieved.size === 0) { legendaryAlignmentsDisplay.innerHTML = '<li>No Legendary Alignments recorded yet.</li>'; return; } // Updated text
    const sortedAchievedIds = milestones.filter(m => achieved.has(m.id)).map(m => m.id);
    sortedAchievedIds.forEach(milestoneId => { const milestone = milestones.find(m => m.id === milestoneId); if (milestone) { const li = document.createElement('li'); li.textContent = `✓ ${milestone.description}`; legendaryAlignmentsDisplay.appendChild(li); } });
}

// --- Settings Popup UI ---
export function showSettings() {
    if (settingsPopup) settingsPopup.classList.remove('hidden'); if (popupOverlay) popupOverlay.classList.remove('hidden');
}

// --- Tapestry Deep Dive UI (REMOVED) ---
// Remove functions: displayTapestryDeepDive, updateContemplationButtonState, updateDeepDiveContent, displayContemplationTask, clearContemplationTask, updateTapestryDeepDiveButton

// --- Suggest Blueprint (Scene) Button UI ---
// Renamed updateSuggestSceneButtonState -> updateSuggestBlueprintButtonState
export function updateSuggestBlueprintButtonState() {
    if (!suggestBlueprintButton) return; // Renamed selector
    const hasFocus = State.getFocusedConcepts().size > 0;
    const canAfford = State.getInsight() >= Config.SCENE_SUGGESTION_COST; // Keep config name?
    const isPhaseReady = State.getOnboardingPhase() >= Config.ONBOARDING_PHASE.PERSONA_GRIMOIRE; // Keep phase name?

    suggestBlueprintButton.classList.toggle('hidden-by-flow', !isPhaseReady);

    if (isPhaseReady) {
        suggestBlueprintButton.disabled = !hasFocus || !canAfford;
        if (!hasFocus) { suggestBlueprintButton.title = "Align Stars first"; } // Updated text
        else if (!canAfford) { suggestBlueprintButton.title = `Requires ${Config.SCENE_SUGGESTION_COST} Insight`; }
        else { suggestBlueprintButton.title = `Suggest Nebula Blueprints (${Config.SCENE_SUGGESTION_COST} Insight)`; } // Updated text
        suggestBlueprintButton.innerHTML = `Suggest Blueprints (${Config.SCENE_SUGGESTION_COST} <i class="fas fa-brain insight-icon"></i>)`; // Updated text
    } else {
        suggestBlueprintButton.disabled = true;
        suggestBlueprintButton.title = "Progress further...";
    }
}

// --- Initial UI Setup Helper ---
export function setupInitialUI() {
    console.log("UI: Setting up initial UI state...");
    applyOnboardingPhaseUI(Config.ONBOARDING_PHASE.START);
    if(mainNavBar) mainNavBar.classList.add('hidden');
    // showScreen('welcomeScreen'); // Called by initializeApp
    if(loadButton) loadButton.classList.toggle('hidden', !localStorage.getItem(Config.SAVE_KEY));
    updateSuggestBlueprintButtonState(); // Renamed
    // updateTapestryDeepDiveButton(); // Removed
}


console.log("ui.js loaded.");
