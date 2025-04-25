// --- START OF FILE ui.js ---

import * as State from './state.js';
import * as Config from './config.js';
import * as Utils from './utils.js';
import * as GameLogic from './gameLogic.js';
import {
    elementDetails, elementKeyToFullName,
    concepts, questionnaireGuided,
    reflectionPrompts, elementDeepDive, dailyRituals, milestones, focusRituals,
    sceneBlueprints, alchemicalExperiments, elementalInsights, focusDrivenUnlocks,
    cardTypeKeys, elementNames,
    grimoireShelves, elementalDilemmas,
    // Import onboarding task arrays
    onboardingWelcomeIntro, onboardingWorkshopIntro, onboardingRepositoryIntro,
    // Other needed data
    elementInteractionThemes, cardTypeThemes
} from '../data.js';

console.log("ui.js loading... (Enhanced v4.10 + Drawer/Accordion/Layout Fixes - Corrected v5 + Onboarding Tours)");

// --- Helper Function for Image Errors ---
function handleImageError(imgElement) {
    console.warn(`Image failed to load: ${imgElement?.src}. Displaying placeholder.`);
    if (imgElement) {
        imgElement.style.display = 'none';
        const visualContainer = imgElement.closest('.card-visual, .popup-visual');
        const placeholder = visualContainer?.querySelector('.card-visual-placeholder');
        if (placeholder) {
            placeholder.style.display = 'flex';
            placeholder.title = `Art Placeholder (Load Failed: ${imgElement.src?.split('/')?.pop() || 'unknown'})`;
        }
    }
}
window.handleImageError = handleImageError; // Make accessible globally if needed by onerror attribute


// --- DOM Element References ---
const getElement = (id) => document.getElementById(id);

// General UI
const saveIndicator = getElement('saveIndicator');
const screens = document.querySelectorAll('.screen');
const popupOverlay = getElement('popupOverlay');
const milestoneAlert = getElement('milestoneAlert');
const milestoneAlertText = getElement('milestoneAlertText');
const toastElement = getElement('toastNotification');
const toastMessageElement = getElement('toastMessage');

// Drawer Navigation
const drawerToggle = getElement('drawerToggle');
const sideDrawer = getElement('sideDrawer');
const drawerSettingsButton = getElement('drawerSettings');
const drawerThemeToggle = getElement('drawerThemeToggle');
const drawerGrimoireCountSpan = getElement('drawerGrimoireCount');
const helpBtn = getElement('helpBtn'); // New Help button

// Welcome Screen
const welcomeScreen = getElement('welcomeScreen');
const loadButton = getElement('loadButton');
const startGuidedButton = getElement('startGuidedButton');

// Questionnaire Screen
const questionnaireScreen = getElement('questionnaireScreen');
const elementProgressHeader = getElement('elementProgressHeader');
const questionContent = getElement('questionContent');
const progressText = getElement('progressText');
const dynamicScoreFeedback = getElement('dynamicScoreFeedback');
const feedbackElementSpan = getElement('feedbackElement');
const feedbackScoreSpan = getElement('feedbackScore');
const feedbackScoreBar = getElement('feedbackScoreBar');
const prevElementButton = getElement('prevElementButton');
const nextElementButton = getElement('nextElementButton');

// Persona Screen
const personaScreen = getElement('personaScreen');
const personaDetailedView = getElement('personaDetailedView');
const personaSummaryView = getElement('personaSummaryView');
const showDetailedViewBtn = getElement('showDetailedViewBtn');
const showSummaryViewBtn = getElement('showSummaryViewBtn');
const personaElementDetailsDiv = getElement('personaElementDetails');
const userInsightDisplayPersona = getElement('userInsightDisplayPersona');
const insightLogContainer = getElement('insightLogContainer');
const focusedConceptsDisplay = getElement('focusedConceptsDisplay');
const focusedConceptsHeader = getElement('focusedConceptsHeader');
const tapestryNarrativeP = getElement('tapestryNarrative');
const personaThemesList = getElement('personaThemesList');
const summaryContentDiv = getElement('summaryContent');
const summaryCoreEssenceTextDiv = getElement('summaryCoreEssenceText');
const summaryTapestryInfoDiv = getElement('summaryTapestryInfo');
const personaScoreChartCanvas = getElement('personaScoreChartCanvas');
const addInsightButton = getElement('addInsightButton');
const elementalDilemmaButton = getElement('elementalDilemmaButton');
const exploreSynergyButton = getElement('exploreSynergyButton');
const suggestSceneButton = getElement('suggestSceneButton');
const sceneSuggestCostDisplay = getElement('sceneSuggestCostDisplay');
const deepDiveTriggerButton = getElement('deepDiveTriggerButton');
const sceneSuggestionOutput = getElement('sceneSuggestionOutput');
const suggestedSceneContent = getElement('suggestedSceneContent');

// Workshop Screen
const workshopScreen = getElement('workshopScreen');
const userInsightDisplayWorkshop = getElement('userInsightDisplayWorkshop');
const researchBenchArea = getElement('workshop-research-area');
const elementResearchButtonsContainer = getElement('element-research-buttons');
const dailyActionsContainer = getElement('daily-actions');
const freeResearchButtonWorkshop = getElement('freeResearchButtonWorkshop');
const seekGuidanceButtonWorkshop = getElement('seekGuidanceButtonWorkshop');
const guidedReflectionCostDisplayWorkshop = getElement('guidedReflectionCostDisplayWorkshop');
const grimoireLibraryContainer = getElement('workshop-library-area');
const grimoireControlsWorkshop = getElement('grimoire-controls-workshop');
const grimoireFilterControls = grimoireControlsWorkshop?.querySelector('.filter-controls');
const grimoireTypeFilterWorkshop = getElement('grimoireTypeFilterWorkshop');
const grimoireElementFilterWorkshop = getElement('grimoireElementFilterWorkshop');
const grimoireRarityFilterWorkshop = getElement('grimoireRarityFilterWorkshop');
const grimoireSortOrderWorkshop = getElement('grimoireSortOrderWorkshop');
const grimoireSearchInputWorkshop = getElement('grimoireSearchInputWorkshop');
const grimoireFocusFilterWorkshop = getElement('grimoireFocusFilterWorkshop');
const grimoireShelvesWorkshop = getElement('grimoire-shelves-workshop');
const grimoireGridWorkshop = getElement('grimoire-grid-workshop');

// Repository Screen
const repositoryScreen = getElement('repositoryScreen');
const repositoryFocusUnlocksDiv = getElement('repositoryFocusUnlocks')?.querySelector('.repo-list');
const repositoryScenesDiv = getElement('repositoryScenes')?.querySelector('.repo-list');
const repositoryExperimentsDiv = getElement('repositoryExperiments')?.querySelector('.repo-list');
const repositoryInsightsDiv = getElement('repositoryInsights')?.querySelector('.repo-list');
const milestonesDisplay = getElement('milestonesDisplay');
const dailyRitualsDisplayRepo = getElement('dailyRitualsDisplayRepo');

// Concept Detail Popup
const conceptDetailPopup = getElement('conceptDetailPopup');
const popupCardTypeIcon = getElement('popupCardTypeIcon');
const popupConceptName = getElement('popupConceptName');
const popupConceptType = getElement('popupConceptType');
const popupVisualContainer = getElement('popupVisualContainer');
const popupBriefDescription = getElement('popupBriefDescription');
const popupDetailedDescription = getElement('popupDetailedDescription');
const popupResonanceGaugeSection = getElement('popupResonanceGaugeSection');
const popupResonanceGaugeContainer = getElement('popupResonanceGaugeContainer');
const popupResonanceGaugeBar = getElement('popupResonanceGaugeBar');
const popupResonanceGaugeLabel = getElement('popupResonanceGaugeLabel');
const popupResonanceGaugeText = getElement('popupResonanceGaugeText');
const popupRelatedConceptsTags = getElement('popupRelatedConceptsTags');
const popupLoreSection = getElement('popupLoreSection');
const popupLoreContent = getElement('popupLoreContent');
const popupRecipeDetailsSection = getElement('popupRecipeDetails');
const popupComparisonHighlights = getElement('popupComparisonHighlights');
const popupConceptProfile = getElement('popupConceptProfile');
const popupUserComparisonProfile = getElement('popupUserComparisonProfile');
const myNotesSection = getElement('myNotesSection');
const myNotesTextarea = getElement('myNotesTextarea');
const saveMyNoteButton = getElement('saveMyNoteButton');
const noteSaveStatusSpan = getElement('noteSaveStatus');
const addToGrimoireButton = getElement('addToGrimoireButton');
const markAsFocusButton = getElement('markAsFocusButton');

// Research Results Popup
const researchResultsPopup = getElement('researchResultsPopup');
const researchPopupContent = getElement('researchPopupContent');
const closeResearchResultsPopupButton = getElement('closeResearchResultsPopupButton');
const researchPopupStatus = getElement('researchPopupStatus');
const confirmResearchChoicesButton = getElement('confirmResearchChoicesButton');

// Reflection Modal
const reflectionModal = getElement('reflectionModal');
const reflectionModalTitle = getElement('reflectionModalTitle');
const closeReflectionModalButton = getElement('closeReflectionModalButton');
const reflectionElement = getElement('reflectionElement');
const reflectionPromptText = getElement('reflectionPromptText');
const reflectionCheckbox = getElement('reflectionCheckbox');
const scoreNudgeCheckbox = getElement('scoreNudgeCheckbox');
const scoreNudgeLabel = getElement('scoreNudgeLabel');
const confirmReflectionButton = getElement('confirmReflectionButton');
const reflectionRewardAmount = getElement('reflectionRewardAmount');

// Settings Popup
const settingsPopup = getElement('settingsPopup');
const closeSettingsPopupButton = getElement('closeSettingsPopupButton');
const forceSaveButton = getElement('forceSaveButton');
const resetAppButton = getElement('resetAppButton');

// Tapestry Deep Dive Modal
const tapestryDeepDiveModal = getElement('tapestryDeepDiveModal');
const deepDiveTitle = getElement('deepDiveTitle');
const closeDeepDiveButton = getElement('closeDeepDiveButton');
const deepDiveNarrativeP = getElement('deepDiveNarrativeP');
const deepDiveFocusIcons = getElement('deepDiveFocusIcons');
const deepDiveAnalysisNodesContainer = getElement('deepDiveAnalysisNodes');
const deepDiveDetailContent = getElement('deepDiveDetailContent');
const contemplationNodeButton = getElement('contemplationNode');

// Dilemma Modal
const dilemmaModal = getElement('dilemmaModal');
const closeDilemmaModalButton = getElement('closeDilemmaModalButton');
const dilemmaSituationText = getElement('dilemmaSituationText');
const dilemmaQuestionText = getElement('dilemmaQuestionText');
const dilemmaSlider = getElement('dilemmaSlider');
const dilemmaSliderMinLabel = getElement('dilemmaSliderMinLabel');
const dilemmaSliderMaxLabel = getElement('dilemmaSliderMaxLabel');
const dilemmaSliderValueDisplay = getElement('dilemmaSliderValueDisplay');
const dilemmaNudgeCheckbox = getElement('dilemmaNudgeCheckbox');
const confirmDilemmaButton = getElement('confirmDilemmaButton');

// Info Popup
const infoPopupElement = getElement('infoPopup');
const infoPopupContent = getElement('infoPopupContent');
const closeInfoPopupButton = getElement('closeInfoPopupButton');
const confirmInfoPopupButton = getElement('confirmInfoPopupButton');

// Onboarding Elements
const onboardingOverlay = getElement('onboardingOverlay');
const onboardingPopup = getElement('onboardingPopup');
const onboardingContent = getElement('onboardingContent');
const onboardingProgressSpan = getElement('onboardingProgress'); // For tour progress 1/N
const onboardingTitle = getElement('onboarding-heading'); // For tour title
const onboardingPrevButton = getElement('onboardingPrevButton');
const onboardingNextButton = getElement('onboardingNextButton');
const onboardingSkipButton = getElement('onboardingSkipButton'); // Skip ALL button
const skipTourBtn = getElement('skipTourBtn'); // Skip CURRENT tour button
const onboardingHighlight = getElement('onboardingHighlight');


// --- Module-level Variables ---
let personaChartInstance = null;
let toastTimeout = null;
let milestoneTimeout = null;
let insightBoostTimeoutId = null;
let contemplationTimeoutId = null;
let previousScreenId = 'welcomeScreen';

// --- Replicate Helper from main.js ---
// (Needed for showOnboarding to select correct task list)
function getTourForScreen(screenId){
    switch(screenId){
        case 'workshopScreen':   return onboardingWorkshopIntro;
        case 'repositoryScreen': return onboardingRepositoryIntro;
        // Welcome, Questionnaire, and Persona use the Welcome tour
        case 'welcomeScreen':
        case 'questionnaireScreen':
        case 'personaScreen':
        default:                 return onboardingWelcomeIntro;
    }
}

// --- Utility UI Functions ---

/** Displays a short notification message (toast). */
export function showTemporaryMessage(message, duration = Config.TOAST_DURATION, isGuidance = false) {
    if (!toastElement || !toastMessageElement) { console.warn("Toast elements missing:", message); return; }
    console.info(`Toast: ${message}`);
    toastMessageElement.textContent = message;
    toastElement.classList.toggle('guidance-toast', isGuidance);

    if (toastTimeout) clearTimeout(toastTimeout);
    toastElement.classList.remove('hidden', 'visible');
    void toastElement.offsetWidth;

    toastElement.classList.add('visible');
    toastElement.classList.remove('hidden');

    toastTimeout = setTimeout(() => {
        toastElement.classList.remove('visible');
        setTimeout(() => {
            if (toastElement && !toastElement.classList.contains('visible')) {
                 toastElement.classList.add('hidden');
            }
        }, 500);
        toastTimeout = null;
    }, duration);
}

/** Displays a milestone achievement alert. */
export function showMilestoneAlert(text) {
    if (!milestoneAlert || !milestoneAlertText) { console.warn("Milestone alert elements missing."); return; }
    milestoneAlertText.textContent = `Milestone: ${text}`;
    milestoneAlert.classList.remove('hidden');
    if (milestoneTimeout) clearTimeout(milestoneTimeout);
    milestoneTimeout = setTimeout(hideMilestoneAlert, Config.MILESTONE_ALERT_DURATION);
}

/** Hides the milestone alert. */
export function hideMilestoneAlert() {
    if (milestoneAlert) milestoneAlert.classList.add('hidden');
    if (milestoneTimeout) { clearTimeout(milestoneTimeout); milestoneTimeout = null; }
}

/** Hides all popups and the overlay, except for pending research or active onboarding. */
export function hidePopups() {
    let researchPopupIsOpenAndPending = false;
    if (researchResultsPopup && !researchResultsPopup.classList.contains('hidden')) {
        const pendingItems = researchPopupContent?.querySelectorAll('.research-result-item[data-processed="false"], .research-result-item[data-choice-made="pending_dissonance"]');
        if (pendingItems && pendingItems.length > 0) {
            researchPopupIsOpenAndPending = true;
        }
    }

    document.querySelectorAll('.popup:not(.onboarding-popup)').forEach(popup => {
        if (!(popup.id === 'researchResultsPopup' && researchPopupIsOpenAndPending)) {
            popup.classList.add('hidden');
        }
    });

    const anyGeneralPopupVisible = document.querySelector('.popup:not(.hidden):not(.onboarding-popup)');
    const onboardingActive = onboardingOverlay && onboardingOverlay.classList.contains('visible');

    if (!anyGeneralPopupVisible && popupOverlay && !onboardingActive) {
        popupOverlay.classList.add('hidden');
        if (typeof GameLogic !== 'undefined' && GameLogic.clearPopupState) {
            GameLogic.clearPopupState();
        }
    } else if (onboardingActive && popupOverlay) {
         // Don't hide overlay if onboarding is active, but other popups were hidden
         // popupOverlay.classList.add('hidden'); // Original logic was here
    } else if (!anyGeneralPopupVisible && !onboardingActive && popupOverlay) {
         popupOverlay.classList.add('hidden'); // Ensure overlay hides if no popups and no onboarding
    }
}


/** Shows the generic info popup with a specific message. */
export function showInfoPopup(message) {
    if (infoPopupElement && infoPopupContent) {
        infoPopupContent.textContent = message;
        infoPopupElement.classList.remove('hidden');
        const onboardingActive = onboardingOverlay && onboardingOverlay.classList.contains('visible');
        if (popupOverlay && !onboardingActive) {
            popupOverlay.classList.remove('hidden');
        }
    } else {
        console.error("Info popup elements (#infoPopup, #infoPopupContent) not found.");
        showTemporaryMessage("Error displaying information.", 2000);
    }
}


// --- Screen Management ---

/** Helper function to update drawer link visibility based on questionnaire completion */
export function updateDrawerLinks() { // Now exported correctly
  const done = State.getState().questionnaireCompleted;
  if(sideDrawer) {
      sideDrawer.querySelectorAll('.drawer-link.hidden-by-flow')
        .forEach(btn => btn.classList.toggle('hidden', !done));
  } else {
      // console.warn("Side drawer element not found for updating links.");
  }
}


/** Shows the specified screen and hides others, updating drawer state. */
export function showScreen(screenId) {
    console.log(`UI: Attempting to show screen: ${screenId}`);
    const currentState = State.getState();
    const isPostQuestionnaire = currentState.questionnaireCompleted;

    const targetScreenElement = getElement(screenId);
    if (!targetScreenElement) {
        console.error(`UI Error: Screen element with ID '${screenId}' not found! Falling back to welcome.`);
        screens.forEach(screen => screen?.classList.add('hidden', 'current')); // Hide all
        const welcomeEl = getElement('welcomeScreen');
        if(welcomeEl) {
            welcomeEl.classList.remove('hidden');
            welcomeEl.classList.add('current');
        }
        screenId = 'welcomeScreen';
    } else {
        screens.forEach(screen => {
            if (screen) { screen.classList.add('hidden'); screen.classList.remove('current'); }
        });
        targetScreenElement.classList.remove('hidden');
        targetScreenElement.classList.add('current');
        console.log(`UI: Screen ${screenId} activated.`);
    }

    updateDrawerLinks(); // Ensure visibility is correct

    if (sideDrawer) {
        sideDrawer.querySelectorAll('.drawer-link[data-target]').forEach(button => {
            button?.classList.toggle('active', button.dataset.target === screenId);
        });
    } else { console.warn("Side drawer element not found for active link update."); }

    try {
        switch (screenId) {
            case 'personaScreen':
                if (isPostQuestionnaire) {
                    const justFinishedQuestionnaire = previousScreenId === 'questionnaireScreen';
                    const showDetailed = personaDetailedView?.classList.contains('current') ?? true;
                    if (justFinishedQuestionnaire) { togglePersonaView(false); }
                    else {
                        if (showDetailed) {
                            if (typeof GameLogic !== 'undefined' && GameLogic.displayPersonaScreenLogic) { GameLogic.displayPersonaScreenLogic(); }
                            else { console.error("GameLogic or displayPersonaScreenLogic not available."); }
                        } else { displayPersonaSummary(); }
                    }
                    displayInsightLog();
                } else { console.warn("Attempted to access Persona screen before questionnaire completion. Redirecting."); showScreen('welcomeScreen'); return; }
                break;
            case 'workshopScreen':
                if (isPostQuestionnaire) {
                    displayWorkshopScreenContent();
                    refreshGrimoireDisplay();
                    // Show hint for free research button only once
                    showHintOnce('freeResearch', '#freeResearchButtonWorkshop',
                                 '<b>Free research!</b><br>Click once per day to draw new cards.');
                }
                else { console.warn("Attempted to access Workshop screen before questionnaire completion. Redirecting."); showScreen('welcomeScreen'); return; }
                break;
            case 'repositoryScreen':
                if (isPostQuestionnaire) { displayRepositoryContent(); }
                else { console.warn("Attempted to access Repository screen before questionnaire completion. Redirecting."); showScreen('welcomeScreen'); return; }
                break;
            case 'questionnaireScreen':
                if (!isPostQuestionnaire) {
                    const index = State.getState().currentElementIndex;
                    if (index >= 0 && index < elementNames.length) { displayElementQuestions(index); }
                    else { console.warn("Questionnaire screen shown but index is invalid:", index); initializeQuestionnaireUI(); }
                } else { console.warn("Attempted to show questionnaire screen after completion."); showScreen('personaScreen'); return; }
                break;
            case 'welcomeScreen': updateDrawerLinks(); break;
        }
    } catch (error) { console.error(`Error during display logic for screen ${screenId}:`, error); }

    if (['questionnaireScreen', 'workshopScreen', 'personaScreen', 'repositoryScreen'].includes(screenId)) { window.scrollTo(0, 0); }
    previousScreenId = screenId;
}

/** Toggles the side drawer open/closed */
export function toggleDrawer () {
    if (!sideDrawer || !drawerToggle) return;

    /* Is the drawer about to open or close? ------------------------- */
    const willOpen = !sideDrawer.classList.contains('open');

    /* ----  OPEN  ---- */
    if (willOpen) {
        sideDrawer.classList.add('open');
        drawerToggle.setAttribute('aria-expanded', 'true');
        sideDrawer.setAttribute('aria-hidden', 'false');

    /* ----  CLOSE  ---- */
    } else {
        /* 1  return focus to a visible element (the toggle button)   */
        drawerToggle.focus();

        /* 2  now hide the drawer for AT users                        */
        sideDrawer.classList.remove('open');
        drawerToggle.setAttribute('aria-expanded', 'false');
        sideDrawer.setAttribute('aria-hidden', 'true');
    }

    /* Overlay logic stays the same ---------------------------------- */
    const onboardingActive =
        onboardingOverlay && onboardingOverlay.classList.contains('visible');
    if (popupOverlay && !onboardingActive) {
        popupOverlay.classList.toggle('hidden', willOpen === false);
    }
}


// --- Insight Display & Log ---
export function updateInsightDisplays() {
    const insightValue = State.getInsight();
    const insight = insightValue.toFixed(1);
    if (userInsightDisplayPersona) {
        userInsightDisplayPersona.textContent = insight;
        if (!userInsightDisplayPersona.hasAttribute('aria-live')) userInsightDisplayPersona.setAttribute('aria-live', 'polite');
    }
    if (userInsightDisplayWorkshop) {
         userInsightDisplayWorkshop.textContent = insight;
         if (!userInsightDisplayWorkshop.hasAttribute('aria-live')) userInsightDisplayWorkshop.setAttribute('aria-live', 'polite');
    } // Removed console warning for missing element
    updateInsightBoostButtonState();
    updateDependentUI();
    if (personaScreen?.classList.contains('current') && insightLogContainer && !insightLogContainer.classList.contains('log-hidden')) {
        displayInsightLog();
    }
}

function updateDependentUI() {
    const insightValue = State.getInsight();
    const researchBtnsContainer = getElement('element-research-buttons');
    if (researchBtnsContainer) {
        researchBtnsContainer.querySelectorAll('.initial-discovery-element').forEach(buttonCard => {
            const cost = parseFloat(buttonCard.dataset.cost);
            const canAfford = insightValue >= cost;
            const isFree = buttonCard.dataset.isFree === 'true';
            const key = buttonCard.dataset.elementKey;
            const shortName = key && elementKeyToFullName?.[key] ? Utils.getElementShortName(elementKeyToFullName[key]) : 'Element';
            const shouldBeDisabled = !isFree && !canAfford;
            buttonCard.classList.toggle('disabled', shouldBeDisabled);
            buttonCard.classList.toggle('clickable', !shouldBeDisabled);
            const actionDiv = buttonCard.querySelector('.element-action');
            if (actionDiv) actionDiv.classList.toggle('disabled', shouldBeDisabled);
            if (isFree) {
                const freeLeft = State.getInitialFreeResearchRemaining();
                buttonCard.title = `Conduct FREE research on ${shortName}. (${freeLeft} left total)`;
            } else if (shouldBeDisabled) {
                buttonCard.title = `Research ${shortName} (Requires ${cost.toFixed(1)} Insight)`;
            } else {
                buttonCard.title = `Research ${shortName} (Cost: ${cost.toFixed(1)} Insight)`;
            }
        });
    }

    if (seekGuidanceButtonWorkshop && guidedReflectionCostDisplayWorkshop) {
        const cost = Config.GUIDED_REFLECTION_COST;
        const canAfford = insightValue >= cost;
        seekGuidanceButtonWorkshop.disabled = !canAfford;
        seekGuidanceButtonWorkshop.title = canAfford ? `Spend ${cost.toFixed(1)} Insight for a Guided Reflection.` : `Requires ${cost.toFixed(1)} Insight.`;
    }

    if (personaScreen?.classList.contains('current')) {
        personaElementDetailsDiv?.querySelectorAll('.element-deep-dive-container .unlock-button').forEach(button => {
            const cost = parseFloat(button.dataset.cost);
            const canAfford = insightValue >= cost;
            button.disabled = !canAfford;
            button.title = canAfford ? `Unlock for ${cost.toFixed(1)} Insight` : `Requires ${cost.toFixed(1)} Insight`;
            const errorMsg = button.parentElement?.querySelector('.unlock-error');
            if (errorMsg) errorMsg.style.display = canAfford ? 'none' : 'block';
        });
        updateSuggestSceneButtonState();
    }

    if (repositoryScreen?.classList.contains('current')) {
        repositoryScreen.querySelectorAll('.repo-actions button').forEach(button => {
             const sceneId = button.dataset.sceneId;
             const experimentId = button.dataset.experimentId;
             let cost = 0; let baseTitle = ""; let actionLabel = "";
             if (sceneId) {
                 const scene = sceneBlueprints.find(s => s.id === sceneId);
                 cost = scene?.meditationCost || Config.SCENE_MEDITATION_BASE_COST;
                 baseTitle = `Meditate on ${scene?.name || 'Scene'}`;
                 actionLabel = `Meditate (${cost.toFixed(1)})`;
                 button.disabled = insightValue < cost;
                 button.title = insightValue >= cost ? baseTitle : `${baseTitle} (Requires ${cost.toFixed(1)} Insight)`;
             } else if (experimentId) {
                  const experiment = alchemicalExperiments.find(e => e.id === experimentId);
                  cost = experiment?.insightCost || Config.EXPERIMENT_BASE_COST;
                  baseTitle = `Attempt ${experiment?.name || 'Experiment'}`;
                  actionLabel = `Attempt (${cost.toFixed(1)})`;
                  const otherReqsMet = button.title ? !button.title.toLowerCase().includes('requires:') : true;
                  if (otherReqsMet) {
                       button.disabled = insightValue < cost;
                       button.title = (insightValue >= cost) ? baseTitle : `${baseTitle} (Requires ${cost.toFixed(1)} Insight)`;
                  }
             } else { return; }
             const icon = button.querySelector('i');
             if(icon) button.innerHTML = `<i class="${icon.className}"></i> ${actionLabel}`;
             else button.textContent = actionLabel;
        });
    }
    updateContemplationButtonState();
    if (conceptDetailPopup && !conceptDetailPopup.classList.contains('hidden')) {
        popupLoreContent?.querySelectorAll('.unlock-lore-button').forEach(button => {
            const cost = parseFloat(button.dataset.cost);
            const canAfford = insightValue >= cost;
            button.disabled = !canAfford;
            button.title = canAfford ? `Unlock for ${cost.toFixed(1)} Insight` : `Requires ${cost.toFixed(1)} Insight`;
        });
    }
}

/** Renders the recent insight log entries. */
export function displayInsightLog() {
    if (!insightLogContainer) { console.warn("Insight log container not found."); return; }
    const logEntries = State.getInsightLog(); // Gets a copy
    insightLogContainer.innerHTML = '<h5>Recent Insight Changes:</h5>'; // Clear and add header
    if (!insightLogContainer.hasAttribute('aria-live')) insightLogContainer.setAttribute('aria-live', 'polite');

    if (logEntries.length === 0) {
        insightLogContainer.innerHTML += '<p><i>No recent changes logged.</i></p>';
        return;
    }

    // Display newest entries first
    logEntries.slice().reverse().forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.classList.add('insight-log-entry');
        const amountClass = entry.amount > 0 ? 'log-amount-gain' : 'log-amount-loss';
        const sign = entry.amount > 0 ? '+' : '';
        // Basic sanitization for display
        const sourceText = entry.source?.replace(/</g, "&lt;").replace(/>/g, "&gt;") || 'Unknown Source';

        entryDiv.innerHTML = `
            <span class="log-timestamp">${entry.timestamp}</span>
            <span class="log-source">${sourceText}</span>
            <span class="log-amount ${amountClass}">${sign}${entry.amount.toFixed(1)}</span>
        `;
        insightLogContainer.appendChild(entryDiv);
    });
}

/** Updates the state of the Insight Boost button (cooldown timer). */
export function updateInsightBoostButtonState() {
    const btn = getElement('addInsightButton');
    if (!btn) return;

    const cooldownEnd = State.getInsightBoostCooldownEnd();
    const now = Date.now();

    if (insightBoostTimeoutId) { clearTimeout(insightBoostTimeoutId); insightBoostTimeoutId = null; }

    if (cooldownEnd && now < cooldownEnd) {
        const remaining = Math.ceil((cooldownEnd - now) / 1000);
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-hourglass-half"></i> ${remaining}s`;
        btn.title = `Insight boost available in ${remaining} seconds.`;
        insightBoostTimeoutId = setTimeout(updateInsightBoostButtonState, 1000); // Schedule next update
    } else {
        btn.disabled = false;
        // Ensure visually hidden text is present for accessibility
        btn.innerHTML = `<i class="fas fa-plus"></i> <span class="visually-hidden">Add Insight</span>`;
        btn.title = `Get an Insight boost (${Config.INSIGHT_BOOST_AMOUNT} Insight, ${Config.INSIGHT_BOOST_COOLDOWN / 60000} min cooldown)`;
    }
}

// --- Questionnaire UI ---

/** Sets up the UI for starting the questionnaire. */
export function initializeQuestionnaireUI() {
    console.log("UI: Initializing Questionnaire UI");
    State.updateElementIndex(0); // Ensure state starts at index 0
    displayElementQuestions(0); // Display first set of questions
    if (dynamicScoreFeedback) dynamicScoreFeedback.style.display = 'none'; // Hide feedback initially
    else { console.warn("Dynamic score feedback element not found."); }
    // Set initial progress (using Config.MAX_ONBOARDING_PHASE for total steps in Welcome tour)
    document.documentElement.style.setProperty('--progress-pct', `${(1 / Config.MAX_ONBOARDING_PHASE) * 100}%`);
    console.log("UI: Questionnaire UI initialized.");
}

/** Updates the progress header with steps for each element. */
export function updateElementProgressHeader(activeIndex) {
    if (!elementProgressHeader) { console.error("Element progress header not found."); return; }
    elementProgressHeader.innerHTML = '';
    elementNames.forEach((elementNameKey, index) => { // Includes RF
        const stepDiv = document.createElement('div');
        stepDiv.classList.add('step');
        const elementData = elementDetails[elementNameKey] || {};
        const fullName = elementData.name || elementNameKey;
        const shortName = Utils.getElementShortName(fullName);
        stepDiv.textContent = shortName;
        stepDiv.title = fullName;
        stepDiv.classList.toggle('completed', index < activeIndex);
        stepDiv.classList.toggle('active', index === activeIndex);
        elementProgressHeader.appendChild(stepDiv);
    });
}

/** Displays the questions for the element at the given index. */
export function displayElementQuestions(index) {
    const actualIndex = State.getState().currentElementIndex;
    // Use actualIndex from state if valid, otherwise use passed index (e.g., for initialization)
    const displayIndex = (actualIndex >= 0 && actualIndex < elementNames.length) ? actualIndex : index;
    console.log(`UI: Displaying Qs for index ${displayIndex}`);

    if (displayIndex >= elementNames.length) {
        console.warn(`displayElementQuestions called with index ${displayIndex} >= element count ${elementNames.length}. Finalizing.`);
        if (typeof GameLogic !== 'undefined' && GameLogic.finalizeQuestionnaire) {
            GameLogic.finalizeQuestionnaire();
        } else { console.error("GameLogic or finalizeQuestionnaire not available yet!"); }
        return;
    }

    const elementNameKey = elementNames[displayIndex]; // "Attraction", ..., "RoleFocus"
    const elementData = elementDetails[elementNameKey] || {};
    const fullName = elementData.name || elementNameKey;
    const questions = questionnaireGuided[elementNameKey] || [];

    if (!questionContent) { console.error("Question content area #questionContent missing!"); return; }
    const elementAnswers = State.getState().userAnswers?.[elementNameKey] || {};

    // --- Build HTML ---
    questionContent.innerHTML = `
        <div class="element-intro">
            <h2>${fullName}</h2>
            <p><em>${elementData.coreQuestion || 'Exploring this element...'}</em></p>
            <p>${elementData.coreConcept || 'Loading details...'}</p>
            <p><small><strong>Persona Connection:</strong> ${elementData.personaConnection || ''}</small></p>
        </div>`;

    let questionsHTML = '';
    if (questions.length > 0) {
        questions.forEach(q => {
            questionsHTML += `<div class="question-block" id="block_${q.qId}"><h3 class="question-title">${q.text}</h3><div class="input-container">`;
            const savedAnswer = elementAnswers[q.qId];
            if (q.type === "slider") {
                const sliderValue = (savedAnswer !== undefined && !isNaN(parseFloat(savedAnswer))) ? parseFloat(savedAnswer) : q.defaultValue;
                questionsHTML += `
                    <div class="slider-container">
                        <label for="${q.qId}" class="visually-hidden">${q.text}</label>
                        <input type="range" id="${q.qId}" class="slider q-input" min="${q.minValue}" max="${q.maxValue}" step="${q.step || 0.5}" value="${sliderValue}" data-question-id="${q.qId}" data-type="slider">
                        <div class="label-container">
                            <span class="label-text">${q.minLabel}</span>
                            <span class="label-text">${q.maxLabel}</span>
                        </div>
                        <p class="value-text" aria-live="polite">Selected: <span id="display_${q.qId}">${parseFloat(sliderValue).toFixed(1)}</span></p>
                        <p class="slider-feedback" id="feedback_${q.qId}"></p>
                    </div>`;
            } else if (q.type === "radio") {
                questionsHTML += `<fieldset class="radio-options"><legend class="visually-hidden">${q.text}</legend>`;
                q.options.forEach(opt => {
                    const checked = savedAnswer === opt.value ? 'checked' : '';
                    // Wrap input and label text in a label for better clickability
                    questionsHTML += `<label class="form-group ${checked}" for="${q.qId}_${opt.value}"><input type="radio" id="${q.qId}_${opt.value}" class="q-input" name="${q.qId}" value="${opt.value}" ${checked} data-question-id="${q.qId}" data-type="radio"><span>${opt.value}</span></label>`;
                });
                questionsHTML += `</fieldset>`;
            } else if (q.type === "checkbox") {
                questionsHTML += `<fieldset class="checkbox-options"><legend class="visually-hidden">${q.text} (Max ${q.maxChoices || 2})</legend>`;
                q.options.forEach(opt => {
                    const checked = Array.isArray(savedAnswer) && savedAnswer.includes(opt.value) ? 'checked' : '';
                    // Wrap input and label text in a label
                    questionsHTML += `<label class="form-group ${checked}" for="${q.qId}_${opt.value}"><input type="checkbox" id="${q.qId}_${opt.value}" class="q-input" name="${q.qId}" value="${opt.value}" ${checked} data-question-id="${q.qId}" data-max-choices="${q.maxChoices || 2}" data-type="checkbox"><span>${opt.value}</span></label>`;
                });
                questionsHTML += `</fieldset>`;
            }
            questionsHTML += `</div></div>`;
        });
    } else {
        questionsHTML = '<p><i>(Assessment based on general understanding.)</i></p>';
    }
    questionContent.innerHTML += questionsHTML;

    // --- Add Listeners Dynamically ---
    questionContent.querySelectorAll('.q-input').forEach(input => {
        const eventType = (input.type === 'range') ? 'input' : 'change';
        // Remove existing listeners before adding new ones to prevent duplicates
        input.removeEventListener(eventType, handleQuestionnaireInput);
        input.addEventListener(eventType, handleQuestionnaireInput);
    });
    questionContent.querySelectorAll('input[type="checkbox"].q-input').forEach(checkbox => {
        checkbox.removeEventListener('change', handleCheckboxInput);
        checkbox.addEventListener('change', handleCheckboxInput);
    });
    // Add listeners to radio/checkbox labels to update their own 'checked' class for styling
     questionContent.querySelectorAll('.radio-options label.form-group, .checkbox-options label.form-group').forEach(label => {
         const input = label.querySelector('input');
         if (input) {
             // Define named listener function for removal
             const updateLabelClass = () => {
                 // For radio, remove 'checked' from siblings' labels in the same fieldset
                 if (input.type === 'radio') {
                     const fieldset = label.closest('fieldset');
                     fieldset?.querySelectorAll('label.form-group').forEach(l => l.classList.remove('checked'));
                 }
                 // Toggle class on the specific label based on input's checked state
                 label.classList.toggle('checked', input.checked);
             };
             // Remove previous listener if any, then add
             input.removeEventListener('change', updateLabelClass);
             input.addEventListener('change', updateLabelClass);
             // Initial check state
             label.classList.toggle('checked', input.checked);
         }
     });

    // Initial update for slider feedback text
    questionContent.querySelectorAll('.slider.q-input').forEach(slider => {
        updateSliderFeedbackText(slider, elementNameKey);
    });

    // --- Update Surrounding UI ---
    updateDynamicFeedback(elementNameKey, elementAnswers); // Update score preview
    updateElementProgressHeader(displayIndex); // Update progress bar steps
    if (progressText) progressText.textContent = `Element ${displayIndex + 1} / ${elementNames.length}: ${fullName}`;
    else { console.warn("Progress text element not found."); }

    if (prevElementButton) prevElementButton.style.visibility = (displayIndex > 0) ? 'visible' : 'hidden';
    else { console.warn("Previous element button not found."); }

    if (nextElementButton) nextElementButton.textContent = (displayIndex === elementNames.length - 1) ? "View Initial Discoveries" : "Next Element";
    else { console.warn("Next element button not found."); }

    // Update progress bar CSS variable
    const pct = ((displayIndex + 1) / elementNames.length) * 100;
    document.documentElement.style.setProperty('--progress-pct', `${pct}%`);
}

// Named handler functions for adding/removing listeners correctly
function handleQuestionnaireInput(event) {
    if (typeof GameLogic !== 'undefined' && GameLogic.handleQuestionnaireInputChange) {
        GameLogic.handleQuestionnaireInputChange(event);
    } else { console.error("GameLogic or handleQuestionnaireInputChange not available."); }
}
function handleCheckboxInput(event) {
     if (typeof GameLogic !== 'undefined' && GameLogic.handleCheckboxChange) {
        GameLogic.handleCheckboxChange(event);
     } else { console.error("GameLogic or handleCheckboxChange not available."); }
}


/** Updates the descriptive text below a slider based on its value. */
export function updateSliderFeedbackText(sliderElement, elementNameKey) {
    if (!sliderElement || sliderElement.type !== 'range') return;
    const qId = sliderElement.dataset.questionId;
    const feedbackElement = getElement(`feedback_${qId}`);
    const display = getElement(`display_${qId}`); // Get value display span
    if (!feedbackElement || !display) {
        console.warn(`Feedback or display element missing for slider ${qId}`);
        return;
    }
    const currentValue = parseFloat(sliderElement.value);
    display.textContent = currentValue.toFixed(1); // Update numerical display

    const elementData = elementDetails?.[elementNameKey];
    if (!elementData?.scoreInterpretations) {
        console.warn(`Interpretations missing for element: ${elementNameKey}`);
        feedbackElement.textContent = `(Score: ${currentValue.toFixed(1)})`;
        return;
    }
    const interpretations = elementData.scoreInterpretations;
    const scoreLabel = Utils.getScoreLabel(currentValue);
    const interpretationText = interpretations[scoreLabel] || `Interpretation for "${scoreLabel}" not found.`;
    feedbackElement.textContent = interpretationText;
    feedbackElement.title = `Meaning of score ${currentValue.toFixed(1)} (${scoreLabel})`;
}

/** Updates the dynamic score preview area during the questionnaire. */
export function updateDynamicFeedback(elementNameKey, currentAnswers) {
    if (!dynamicScoreFeedback || !feedbackElementSpan || !feedbackScoreSpan || !feedbackScoreBar) {
        if(dynamicScoreFeedback) dynamicScoreFeedback.style.display = 'none';
        console.warn("Dynamic score feedback elements missing.");
        return;
    }
    const elementData = elementDetails?.[elementNameKey];
    if (!elementData) {
        dynamicScoreFeedback.style.display = 'none';
        console.warn(`Element data missing for dynamic feedback: ${elementNameKey}`);
        return;
    }

    if (typeof GameLogic === 'undefined' || !GameLogic.calculateElementScore) {
         console.error("GameLogic or calculateElementScore not available for dynamic feedback.");
         dynamicScoreFeedback.style.display = 'none';
         return;
    }
    const tempScore = GameLogic.calculateElementScore(elementNameKey, currentAnswers);
    const scoreLabel = Utils.getScoreLabel(tempScore);
    const shortName = Utils.getElementShortName(elementData.name || elementNameKey);

    feedbackElementSpan.textContent = shortName;
    feedbackScoreSpan.textContent = tempScore.toFixed(1);

    // Ensure the label span exists and update it
    let labelSpan = feedbackScoreSpan.nextElementSibling; // Assuming label span is immediately after
    if (!labelSpan || !labelSpan.classList.contains('score-label')) {
        // If not found or incorrect, try querying more robustly
        labelSpan = dynamicScoreFeedback.querySelector('.score-label');
        // If still not found, create and insert it
        if (!labelSpan) {
             labelSpan = document.createElement('span');
             labelSpan.classList.add('score-label');
             feedbackScoreSpan.parentNode?.insertBefore(labelSpan, feedbackScoreSpan.nextSibling);
        }
    }
    if (labelSpan) labelSpan.textContent = ` (${scoreLabel})`;

    feedbackScoreBar.style.width = `${Math.max(0, Math.min(100, tempScore * 10))}%`; // Clamp width
    dynamicScoreFeedback.style.display = 'block';
}


/** Reads and returns the current answers from the questionnaire UI. */
export function getQuestionnaireAnswers() {
    const answers = {};
    if (!questionContent) {
        console.error("Cannot get answers: #questionContent missing.");
        return answers;
    }
    const inputs = questionContent.querySelectorAll('.q-input');
    inputs.forEach(input => {
        const qId = input.dataset.questionId;
        const type = input.dataset.type;
        if (!qId) return;
        if (type === 'slider') { answers[qId] = parseFloat(input.value); }
        else if (type === 'radio') { if (input.checked) { answers[qId] = input.value; } }
        else if (type === 'checkbox') { if (!answers[qId]) { answers[qId] = []; } if (input.checked) { answers[qId].push(input.value); } }
    });
    // Ensure checkbox arrays exist even if no boxes are checked
    questionContent.querySelectorAll('.checkbox-options').forEach(container => {
        const name = container.querySelector('input[type="checkbox"]')?.name;
        if(name && !answers[name]) { answers[name] = []; }
    });
    return answers;
}

// --- Persona Action Buttons State ---
export function updateElementalDilemmaButtonState() {
    const btn = getElement('elementalDilemmaButton');
    if (!btn) { console.warn("UI: Elemental Dilemma Button not found!"); return; }
    const questionnaireCompleted = State.getState().questionnaireCompleted;
    btn.disabled = !questionnaireCompleted;
    btn.title = btn.disabled ? "Complete the initial Experimentation first" : "Engage with an Elemental Dilemma for Insight.";
}
export function updateExploreSynergyButtonStatus(status) {
    const btn = getElement('exploreSynergyButton');
    if (!btn) { console.warn("UI: Explore Synergy Button not found!"); return; }
    const hasFocus = State.getFocusedConcepts().size >= 2;
    btn.disabled = !hasFocus;
    btn.classList.remove('highlight-synergy', 'highlight-tension');
    btn.textContent = "Explore Synergy";
    if (!hasFocus) {
        btn.title = "Focus at least 2 concepts to explore";
    } else {
        btn.title = "Explore synergies and tensions between focused concepts";
        if (status === 'synergy') { btn.classList.add('highlight-synergy'); btn.title += " (Synergy detected!)"; btn.textContent = "Explore Synergy ✨"; }
        else if (status === 'tension') { btn.classList.add('highlight-tension'); btn.title += " (Tension detected!)"; btn.textContent = "Explore Synergy ⚡"; }
        else if (status === 'both') { btn.classList.add('highlight-synergy', 'highlight-tension'); btn.title += " (Synergy & Tension detected!)"; btn.textContent = "Explore Synergy 💥"; }
    }
}
export function updateSuggestSceneButtonState() {
    const btn = getElement('suggestSceneButton');
    if (!btn) { console.warn("UI: Suggest Scene Button not found!"); return; }
    const costDisplay = getElement('sceneSuggestCostDisplay');
    const hasFocus = State.getFocusedConcepts().size > 0;
    const canAfford = State.getInsight() >= Config.SCENE_SUGGESTION_COST;
    btn.disabled = !hasFocus || !canAfford;
    if (!hasFocus) btn.title = "Focus on concepts first";
    else if (!canAfford) btn.title = `Requires ${Config.SCENE_SUGGESTION_COST.toFixed(1)} Insight`;
    else btn.title = `Suggest resonant scenes (${Config.SCENE_SUGGESTION_COST.toFixed(1)} Insight)`;
    if(costDisplay) costDisplay.textContent = Config.SCENE_SUGGESTION_COST.toFixed(1);
}

// --- Persona Screen UI ---

/** Toggles between the detailed and summary views on the Persona screen. */
export function togglePersonaView(showDetailed) {
    if (personaDetailedView && personaSummaryView && showDetailedViewBtn && showSummaryViewBtn) {
        const detailedIsCurrent = personaDetailedView.classList.contains('current');

        if (showDetailed && !detailedIsCurrent) { // Show Detailed
            personaDetailedView.classList.remove('hidden');
            personaDetailedView.classList.add('current');
            personaSummaryView.classList.add('hidden');
            personaSummaryView.classList.remove('current');
            showDetailedViewBtn.classList.add('active'); showDetailedViewBtn.setAttribute('aria-pressed', 'true');
            showSummaryViewBtn.classList.remove('active'); showSummaryViewBtn.setAttribute('aria-pressed', 'false');
            if (typeof GameLogic !== 'undefined' && GameLogic.displayPersonaScreenLogic) { GameLogic.displayPersonaScreenLogic(); }
            else { console.error("GameLogic or displayPersonaScreenLogic not available."); }
            displayInsightLog();

        } else if (!showDetailed && detailedIsCurrent) { // Show Summary
            personaDetailedView.classList.add('hidden');
            personaDetailedView.classList.remove('current');
            personaSummaryView.classList.remove('hidden');
            personaSummaryView.classList.add('current');
            showDetailedViewBtn.classList.remove('active'); showDetailedViewBtn.setAttribute('aria-pressed', 'false');
            showSummaryViewBtn.classList.add('active'); showSummaryViewBtn.setAttribute('aria-pressed', 'true');
            displayPersonaSummary();
        }
        // If already in the target state, do nothing.
    } else { console.error("Persona view toggle elements missing."); }
}

/** Renders the detailed view of the Persona screen (using accordion logic). */
export function displayPersonaScreen() {
    if (!personaElementDetailsDiv) { console.error("Persona element details div not found!"); return; }
    console.log("UI: Displaying Persona Screen (Detailed View - Accordion)");
    personaElementDetailsDiv.innerHTML = ''; // Clear previous content
    const scores = State.getScores();
    const showDeepDiveContainer = State.getState().questionnaireCompleted;

    elementNames.forEach(elementNameKey => { // Includes RF
        const key = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === elementNameKey);
        const elementData = elementDetails[elementNameKey];
        if (!key || !elementData) { console.warn(`UI displayPersonaScreen: Skip render for missing data: ${elementNameKey}`); return; }

        const score = (scores[key] !== undefined && typeof scores[key] === 'number' && !isNaN(scores[key])) ? scores[key] : 5.0;
        const scoreLabel = Utils.getScoreLabel(score);
        const interpretation = elementData.scoreInterpretations?.[scoreLabel] || "Interpretation N/A.";
        const barWidth = Math.max(0, Math.min(100, score * 10));
        const color = Utils.getElementColor(elementNameKey);
        const iconClass = Utils.getElementIcon(elementNameKey);
        const fullName = elementData.name || elementNameKey;
        const elementNameShort = Utils.getElementShortName(fullName);

        // Create accordion elements
        const accordionItemDiv = document.createElement('div');
        accordionItemDiv.classList.add('accordion-item');
        accordionItemDiv.dataset.elementKey = key;
        accordionItemDiv.style.setProperty('--element-color', color);

        const button = document.createElement('button');
        button.classList.add('accordion-header');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', `accordion-body-${key}`);
        button.id = `accordion-header-${key}`;
        button.innerHTML = `
            <span class="element-summary-header"> <!-- Wrap header content -->
                <i class="${iconClass} element-icon-indicator" style="color: ${color};" title="${fullName}"></i>
                <strong>${elementNameShort}:</strong>
                <span>${score.toFixed(1)}</span>
                <span class="score-label">(${scoreLabel})</span>
            </span>
            <span class="score-bar-container" title="Score: ${score.toFixed(1)}/10 (${scoreLabel})"> <!-- Wrap bar -->
                <div style="width: ${barWidth}%; background-color: ${color};"></div>
            </span>
        `;

        const body = document.createElement('div');
        body.classList.add('accordion-body');
        body.id = `accordion-body-${key}`;
        body.setAttribute('role', 'region');
        body.setAttribute('aria-labelledby', `accordion-header-${key}`);
        body.innerHTML = `
            <div class="element-description">
                <p><strong>Core Concept:</strong> ${elementData.coreConcept || ''}</p>
                <details class="element-elaboration">
                    <summary>Elaboration & Examples</summary>
                    <div class="collapsible-content">
                        <p><strong>Elaboration:</strong> ${elementData.elaboration || ''}</p>
                        <p><small><strong>Examples:</strong> ${elementData.examples || ''}</small></p>
                    </div>
                </details>
                <hr class="content-hr">
                <p><strong>Your Score (${scoreLabel}):</strong> ${interpretation}</p>
                <hr class="attunement-hr">
                <div class="attunement-placeholder"></div> <!-- Placeholder for attunement bar -->
                <div class="element-deep-dive-container ${showDeepDiveContainer ? '' : 'hidden'}" data-element-key="${key}"></div>
            </div>`;

        accordionItemDiv.appendChild(button);
        accordionItemDiv.appendChild(body);
        personaElementDetailsDiv.appendChild(accordionItemDiv);

        // Add click listener for the button to toggle aria-expanded and open/close class
        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', !isExpanded);
            accordionItemDiv.classList.toggle('open', !isExpanded);
            // CSS should handle the max-height transition based on .open or [aria-expanded="true"]
        });

        // Populate Deep Dive if applicable
        if (showDeepDiveContainer) {
             const deepDiveContainer = body.querySelector('.element-deep-dive-container');
             if(deepDiveContainer) displayElementDeepDive(key, deepDiveContainer);
        }
    });
    // Update other persona screen elements
    displayElementAttunement();
    updateInsightDisplays();
    displayFocusedConceptsPersona();
    generateTapestryNarrative();
    synthesizeAndDisplayThemesPersona();
    updateElementalDilemmaButtonState();
    updateSuggestSceneButtonState();
     if (typeof GameLogic !== 'undefined' && GameLogic.checkSynergyTensionStatus) {
        GameLogic.checkSynergyTensionStatus();
     } else { console.error("GameLogic or checkSynergyTensionStatus not available yet!"); }
}


/** Updates the attunement bars within the element detail accordions. */
export function displayElementAttunement() {
    if (!personaElementDetailsDiv) return;
    const attunement = State.getAttunement(); // Includes RF
    Object.entries(attunement).forEach(([key, attunementValue]) => {
        const value = attunementValue || 0;
        const percentage = Math.max(0, Math.min(100, (value / Config.MAX_ATTUNEMENT) * 100));
        const elementNameKey = elementKeyToFullName[key]; // Convert 'A' -> 'Attraction' etc.
        if (!elementNameKey) { console.warn(`UI displayElementAttunement: Element name key not found for key: ${key}`); return; }
        const color = Utils.getElementColor(elementNameKey);

        // Find the correct accordion item and placeholder
        const targetAccordion = personaElementDetailsDiv.querySelector(`.accordion-item[data-element-key="${key}"]`);
        const placeholder = targetAccordion?.querySelector('.attunement-placeholder');
        if (!placeholder) { /*console.warn(`Attunement placeholder not found for key ${key}`);*/ return; } // Might not be rendered yet

        let attunementDisplay = placeholder.querySelector('.attunement-display');
        // Create display if it doesn't exist
        if (!attunementDisplay) {
            attunementDisplay = document.createElement('div');
            attunementDisplay.classList.add('attunement-display');
            attunementDisplay.innerHTML = `
                <div class="attunement-item">
                    <span class="attunement-name">Attunement:</span>
                    <div class="attunement-bar-container" title="">
                        <div class="attunement-bar" style="background-color: ${color};"></div>
                    </div>
                    <i class="fas fa-info-circle info-icon" title="Attunement reflects affinity/experience with this Element. Grows via Research, Reflection, Focusing concepts. High Attunement may unlock content or reduce costs."></i>
                </div>`;
            placeholder.innerHTML = ''; // Clear placeholder text/content
            placeholder.appendChild(attunementDisplay);
        }

        // Update bar width and title
        const bar = attunementDisplay.querySelector('.attunement-bar');
        const container = attunementDisplay.querySelector('.attunement-bar-container');
        if (bar) bar.style.width = `${percentage}%`;
        if (container) container.title = `Current Attunement: ${value.toFixed(1)} / ${Config.MAX_ATTUNEMENT}`;
    });
}


/** Updates the display showing focused concepts count / total slots. */
export function updateFocusSlotsDisplay() {
    const focused = State.getFocusedConcepts();
    const totalSlots = State.getFocusSlots();
    if (focusedConceptsHeader) {
        focusedConceptsHeader.innerHTML = `Focused Concepts (${focused.size} / ${totalSlots}) <i class="fas fa-info-circle info-icon" title="Concepts marked as Focus (${focused.size}) out of your available slots (${totalSlots}). Slots increase via Milestones."></i>`;
    } else { console.warn("Focused concepts header element not found."); }
}

/** Renders the grid of currently focused concepts on the Persona screen. */
export function displayFocusedConceptsPersona() {
    if (!focusedConceptsDisplay) { console.error("Focused concepts display area not found."); return; }
    focusedConceptsDisplay.innerHTML = ''; // Clear previous
    updateFocusSlotsDisplay(); // Update header count
    const focused = State.getFocusedConcepts();
    const discovered = State.getDiscoveredConcepts();

    if (focused.size === 0) {
        focusedConceptsDisplay.innerHTML = `<div class="focus-placeholder">Focus Concepts from your Workshop Library (tap the ☆)</div>`;
        return;
    }

    focused.forEach(conceptId => {
        const conceptData = discovered.get(conceptId);
        if (conceptData?.concept) {
            const concept = conceptData.concept;
            const item = document.createElement('div');
            item.classList.add('focus-concept-item'); // Use generic item class
            item.dataset.conceptId = concept.id;
            item.title = `View Details: ${concept.name}`;
            item.style.cursor = 'pointer';

            let backgroundStyle = '';
            let imgErrorPlaceholder = '';
            if (concept.visualHandle) {
                const handle = concept.visualHandle;
                const extension = Config.UNLOCKED_ART_EXTENSION || '.jpg';
                const fileName = handle.includes('.') ? handle : `${handle}${extension}`;
                const imageUrl = `placeholder_art/${fileName}`;
                backgroundStyle = `background-image: url('${imageUrl}');`;
                item.classList.add('has-background-image');
                // Add hidden image for onerror handler
                imgErrorPlaceholder = `<img src="${imageUrl}" alt="" style="position:absolute; width:1px; height:1px; opacity:0; pointer-events:none;" onerror="window.handleImageError(this)">`;
            }
            item.style = backgroundStyle;

            // Determine Icon based on Element or Type
            let iconClass = Utils.getCardTypeIcon(concept.cardType); // Default to type icon
            let iconColor = 'var(--text-muted-color)'; // Default color
            let iconTitle = concept.cardType;
            // Ensure element maps are available before lookup
            if (concept.primaryElement && elementKeyToFullName?.[concept.primaryElement] && elementDetails) {
                const elementNameKey = elementKeyToFullName[concept.primaryElement];
                iconClass = Utils.getElementIcon(elementNameKey); // Override with element icon
                iconColor = Utils.getElementColor(elementNameKey);
                iconTitle = Utils.getElementShortName(elementDetails[elementNameKey]?.name || elementNameKey); // Use short name from details
            }

            item.innerHTML = `
                <i class="${iconClass}" style="color: ${iconColor};" title="${iconTitle}"></i>
                <span class="name">${concept.name}</span>
                <span class="type">(${concept.cardType})</span>
                ${imgErrorPlaceholder}
            `;
            focusedConceptsDisplay.appendChild(item);
        } else {
            console.warn(`Focused concept ID ${conceptId} not found in discovered concepts map.`);
            const item = document.createElement('div');
            item.classList.add('focus-concept-item', 'missing');
            item.textContent = `Error: ID ${conceptId}`;
            focusedConceptsDisplay.appendChild(item);
        }
    });
    updateSuggestSceneButtonState(); // Update dependent buttons
}


/** Calls game logic to calculate and then displays the tapestry narrative. */
export function generateTapestryNarrative() {
    if (!tapestryNarrativeP) { console.warn("Tapestry narrative element not found."); return; }
    if (typeof GameLogic === 'undefined' || !GameLogic.calculateTapestryNarrative) {
         console.error("GameLogic or calculateTapestryNarrative not available yet!");
         tapestryNarrativeP.innerHTML = 'Error generating narrative...';
         return;
    }
    const narrativeHTML = GameLogic.calculateTapestryNarrative(); // Force recalc handled in logic
    tapestryNarrativeP.innerHTML = narrativeHTML || 'Mark concepts as "Focus" to generate narrative...';
    if (!tapestryNarrativeP.hasAttribute('aria-live')) tapestryNarrativeP.setAttribute('aria-live', 'polite');
}

/** Calculates and displays the dominant themes based on focused concepts. */
export function synthesizeAndDisplayThemesPersona() {
    if (!personaThemesList) { console.error("Persona themes list element not found."); return; }
    personaThemesList.innerHTML = ''; // Clear previous
    if (!personaThemesList.hasAttribute('aria-live')) personaThemesList.setAttribute('aria-live', 'polite');

    if (typeof GameLogic === 'undefined' || !GameLogic.calculateFocusThemes) {
        console.error("GameLogic or calculateFocusThemes not available yet!");
        personaThemesList.innerHTML = `<li>Error calculating themes...</li>`;
        return;
    }
    const themes = GameLogic.calculateFocusThemes(); // Includes RF

    if (themes.length === 0) {
        const placeholderText = State.getFocusedConcepts().size > 0 ? 'Focus is currently balanced across elements.' : 'Mark Focused Concepts to see dominant themes...';
        personaThemesList.innerHTML = `<li>${placeholderText}</li>`;
        return;
    }

    themes.slice(0, 3).forEach((theme, index) => { // Show top 3 themes
        const li = document.createElement('li');
        // theme.key is 'A'...'RF'
        const elementNameKey = elementKeyToFullName?.[theme.key]; // Includes RF
        if (!elementNameKey) { console.warn(`Missing element name for key ${theme.key} in themes`); return; } // Skip if key invalid
        const color = Utils.getElementColor(elementNameKey);
        const icon = Utils.getElementIcon(elementNameKey);
        let emphasis = "Influenced by";
        if (index === 0 && theme.count >= 3) emphasis = "Strongly Focused on";
        else if (index === 0) emphasis = "Primarily Focused on";

        li.innerHTML = `<i class="${icon}" style="color: ${color}; margin-right: 5px;" title="${theme.name}"></i> ${emphasis} <strong>${theme.name}</strong> (${theme.count})`;
        li.style.borderLeft = `3px solid ${color}`;
        li.style.paddingLeft = '8px';
        li.style.marginBottom = '4px';
        personaThemesList.appendChild(li);
    });
}


/** Draws the radar chart for persona scores (including RF). */
export function drawPersonaChart(scores) {
    if (!personaScoreChartCanvas) { console.error("Persona score chart canvas not found!"); return; }
    const ctx = personaScoreChartCanvas.getContext('2d');
    if (!ctx) { console.error("Could not get canvas context for chart!"); return; }

    // Get computed styles for dynamic theming
    const computedStyle = getComputedStyle(document.documentElement);
    const pointLabelFont = computedStyle.fontFamily || 'Arial, sans-serif';
    const pointLabelColor = computedStyle.getPropertyValue('--text-muted-color').trim() || '#6c757d';
    const tickColor = computedStyle.getPropertyValue('--text-color').trim() || '#333';
    const gridColor = Utils.hexToRgba(computedStyle.getPropertyValue('--border-color-dark').trim() || '#adb5bd', 0.3);
    const chartBackgroundColor = Utils.hexToRgba(computedStyle.getPropertyValue('--background-light').trim() || '#f8f9fa', 0.8);

    // Prepare data (using elementNames ensures RF is included)
    const labels = elementNames.map(nameKey => Utils.getElementShortName(elementDetails[nameKey]?.name || nameKey));
    const dataPoints = elementNames.map(nameKey => {
        const key = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === nameKey);
        return scores[key] ?? 0; // Default to 0 if score missing
    });
    const borderColors = elementNames.map(nameKey => {
        // Attempt to get color from CSS variable first
        let colorVar = `--${nameKey.toLowerCase()}-color`;
        let adaptedColor = computedStyle.getPropertyValue(colorVar).trim();
        // Ensure the adaptedColor is a valid hex before using, otherwise fallback
        if (!adaptedColor || !/^#[0-9A-F]{6}$/i.test(adaptedColor)) {
             adaptedColor = Utils.getElementColor(nameKey);
        }
        return adaptedColor;
    });
    const backgroundColors = borderColors.map(color => Utils.hexToRgba(color, 0.4));

    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Elemental Scores',
            data: dataPoints,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 2,
            pointBackgroundColor: borderColors,
            pointBorderColor: chartBackgroundColor, // Use chart bg for point border
            pointHoverBackgroundColor: chartBackgroundColor,
            pointHoverBorderColor: borderColors,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: { // Radial axis configuration
                angleLines: { display: true, color: gridColor },
                grid: { color: gridColor },
                pointLabels: {
                    font: { size: 11, family: pointLabelFont, weight: 'bold' },
                    color: pointLabelColor
                },
                suggestedMin: 0,
                suggestedMax: 10,
                ticks: {
                    stepSize: 2,
                    backdropColor: chartBackgroundColor, // Background for ticks
                    color: tickColor, // Tick number color
                    font: { weight: 'bold' } // Bold tick numbers
                }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { family: pointLabelFont, weight: 'bold' },
                bodyFont: { family: pointLabelFont },
                padding: 10,
                borderColor: 'rgba(255,255,255,0.2)',
                borderWidth: 1,
                displayColors: false, // Don't show color box in tooltip
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || ''; // Use dataset label first
                        if (context.label) {
                            label = context.label; // Use the axis label (element name)
                        }
                        const score = context.parsed.r;
                        if (score !== null) {
                            label += `: ${score.toFixed(1)} (${Utils.getScoreLabel(score)})`;
                        }
                        return label;
                    }
                }
            }
        }
    };

    // Destroy previous chart instance if it exists
    if (personaChartInstance) {
        personaChartInstance.destroy();
    }
    // Create new chart instance
    try {
        personaChartInstance = new Chart(ctx, {
            type: 'radar',
            data: chartData,
            options: chartOptions
        });
    } catch (error) {
         console.error("Error creating Chart.js instance:", error);
         // Optionally display an error message on the canvas
         ctx.clearRect(0, 0, personaScoreChartCanvas.width, personaScoreChartCanvas.height);
         ctx.fillStyle = 'red';
         ctx.font = '14px Arial';
         ctx.textAlign = 'center';
         ctx.fillText('Error rendering chart.', personaScoreChartCanvas.width / 2, personaScoreChartCanvas.height / 2);
    }
}


/** Renders the content for the Persona Summary view (Includes RF). */
export function displayPersonaSummary() {
    if (!summaryContentDiv || !summaryCoreEssenceTextDiv || !summaryTapestryInfoDiv) { console.error("Summary view content divs not found!"); if(summaryContentDiv) summaryContentDiv.innerHTML = '<p>Error loading summary content elements.</p>'; return; }
    console.log("UI: Displaying Persona Summary");
    summaryCoreEssenceTextDiv.innerHTML = ''; summaryTapestryInfoDiv.innerHTML = '';
    const scores = State.getScores(); const focused = State.getFocusedConcepts();

    if (typeof GameLogic === 'undefined' || !GameLogic.calculateTapestryNarrative || !GameLogic.calculateFocusThemes) {
         console.error("GameLogic or required functions not available for Persona Summary.");
         summaryCoreEssenceTextDiv.innerHTML = '<p>Error loading core essence...</p>';
         summaryTapestryInfoDiv.innerHTML = '<p>Error loading tapestry info...</p>';
         return;
    }
    const narrativeHTML = GameLogic.calculateTapestryNarrative(); const themes = GameLogic.calculateFocusThemes();

    // Core Essence Text (Iterate through all 7 elements)
    let coreEssenceHTML = '';
    if (elementDetails && elementKeyToFullName) {
        elementNames.forEach(elNameKey => { // Includes RF
            const key = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === elNameKey);
            if (!key) { console.warn(`UI displayPersonaSummary: Could not find score key for element name: ${elNameKey}`); coreEssenceHTML += `<p><strong>${Utils.getElementShortName(elementDetails[elNameKey]?.name || elNameKey)}:</strong> Score lookup error.</p>`; return; }
            const score = scores[key];
            if (typeof score === 'number') {
                const label = Utils.getScoreLabel(score);
                const elementData = elementDetails[elNameKey] || {};
                const fullName = elementData.name || elNameKey;
                const interpretation = elementData.scoreInterpretations?.[label] || "N/A";
                coreEssenceHTML += `<p><strong>${Utils.getElementShortName(fullName)} (${score.toFixed(1)} - ${label}):</strong> ${interpretation}</p>`;
            } else {
                const fullName = elementDetails[elNameKey]?.name || elNameKey;
                coreEssenceHTML += `<p><strong>${Utils.getElementShortName(fullName)}:</strong> Score not available.</p>`;
            }
        });
    } else { coreEssenceHTML += "<p>Error: Element details not loaded.</p>"; }
    summaryCoreEssenceTextDiv.innerHTML = coreEssenceHTML;

    // Tapestry Info
    let tapestryHTML = '';
    if (focused.size > 0) {
        tapestryHTML += `<p><em>${narrativeHTML || "No narrative generated."}</em></p>`;
        tapestryHTML += '<strong>Focused Concepts:</strong><ul>';
        const discovered = State.getDiscoveredConcepts();
        focused.forEach(id => {
            const name = discovered.get(id)?.concept?.name || `ID ${id}`;
            tapestryHTML += `<li>${name}</li>`;
        });
        tapestryHTML += '</ul>';
        if (themes.length > 0) {
            tapestryHTML += '<strong>Dominant Themes:</strong><ul>';
            themes.slice(0, 3).forEach(theme => {
                const elementNameKey = elementKeyToFullName[theme.key]; // Includes RF
                 if (!elementNameKey) { console.warn(`Missing element name for key ${theme.key} in themes`); return; }
                const color = Utils.getElementColor(elementNameKey);
                tapestryHTML += `<li style="border-left: 3px solid ${color}; padding-left: 5px;">${theme.name} Focus (${theme.count} concept${theme.count > 1 ? 's' : ''})</li>`;
            });
            tapestryHTML += '</ul>';
        } else {
            tapestryHTML += '<strong>Dominant Themes:</strong><p>No strong themes detected from current focus.</p>';
        }
    } else {
        tapestryHTML += '<p>No concepts are currently focused. Add focus in the Workshop to weave your Tapestry!</p>';
    }
    summaryTapestryInfoDiv.innerHTML = tapestryHTML;

    // Draw Chart (Includes RF)
    drawPersonaChart(scores);
}


// --- Workshop Screen UI ---

/** Populates the Workshop screen, including research buttons and daily actions. */
export function displayWorkshopScreenContent() {
    if (!workshopScreen) { console.warn("Workshop screen element not found."); return; }
    // Update insight display within the workshop header
    if (userInsightDisplayWorkshop) { userInsightDisplayWorkshop.textContent = State.getInsight().toFixed(1); }
    else { console.warn("Workshop insight display element not found."); }

    // Populate Research Bench Element Buttons
    if (elementResearchButtonsContainer) {
        elementResearchButtonsContainer.innerHTML = ''; // Clear previous
        const scores = State.getScores();
        const freeResearchLeft = State.getInitialFreeResearchRemaining();
        const insight = State.getInsight();

        elementNames.forEach(elementNameKey => { // Includes RF
            const key = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === elementNameKey);
            if (!key || !elementDetails[elementNameKey]) { console.warn(`UI displayWorkshopScreenContent: Skip render for missing data: ${elementNameKey}`); return; }
            const elementData = elementDetails[elementNameKey];
            const score = scores[key] ?? 5.0;
            const scoreLabel = Utils.getScoreLabel(score);
            const fullName = elementData.name || elementNameKey;
            const color = Utils.getElementColor(elementNameKey);
            const iconClass = Utils.getElementIcon(elementNameKey);
            const shortName = Utils.getElementShortName(fullName);

            const elementDiv = document.createElement('div');
            elementDiv.classList.add('initial-discovery-element'); // Use the class from CSS
            elementDiv.dataset.elementKey = key;

            let costText = "";
            let isDisabled = false;
            let titleText = "";
            let isFreeClick = false;
            const researchCost = Config.BASE_RESEARCH_COST;

            if (freeResearchLeft > 0) {
                costText = `Use 1 FREE ★`;
                titleText = `Conduct FREE research on ${shortName}. (${freeResearchLeft} left total)`;
                isFreeClick = true;
                isDisabled = false;
            } else {
                costText = `${researchCost.toFixed(1)} <i class="fas fa-brain insight-icon"></i>`;
                if (insight < researchCost) {
                    isDisabled = true;
                    titleText = `Research ${shortName} (Requires ${researchCost.toFixed(1)} Insight)`;
                } else {
                    isDisabled = false;
                    titleText = `Research ${shortName} (Cost: ${researchCost.toFixed(1)} Insight)`;
                }
                isFreeClick = false;
            }
            elementDiv.dataset.cost = researchCost;
            elementDiv.dataset.isFree = isFreeClick;

            let rarityCountsHTML = '';
            if (typeof GameLogic !== 'undefined' && GameLogic.countUndiscoveredByRarity) {
                try {
                    const rarityCounts = GameLogic.countUndiscoveredByRarity(key);
                    rarityCountsHTML = `
                        <div class="rarity-counts-display" title="Undiscovered Concepts (Primary Element: ${shortName})">
                            <span class="rarity-count common" title="${rarityCounts.common} Common"><i class="fas fa-circle"></i> ${rarityCounts.common}</span>
                            <span class="rarity-count uncommon" title="${rarityCounts.uncommon} Uncommon"><i class="fas fa-square"></i> ${rarityCounts.uncommon}</span>
                            <span class="rarity-count rare" title="${rarityCounts.rare} Rare"><i class="fas fa-star"></i> ${rarityCounts.rare}</span>
                        </div>`;
                } catch (error) {
                    console.error(`Error getting rarity counts for ${key}:`, error);
                    rarityCountsHTML = '<div class="rarity-counts-display error">Counts N/A</div>';
                }
            } else {
                console.error("GameLogic or countUndiscoveredByRarity not available yet!");
                rarityCountsHTML = '<div class="rarity-counts-display error">Counts N/A</div>';
            }

            elementDiv.innerHTML = `
                <div class="element-header">
                    <i class="${iconClass}" style="color: ${color};"></i>
                    <span class="element-name">${shortName}</span>
                </div>
                <div class="element-score-display">${score.toFixed(1)} (${scoreLabel})</div>
                <p class="element-concept">${elementData.coreConcept || '...'}</p>
                ${rarityCountsHTML}
                <div class="element-action ${isDisabled ? 'disabled' : ''}">
                    <span class="element-cost">${costText}</span>
                </div>
                ${isFreeClick ? `<span class="free-indicator" title="Free Research Available!">★</span>` : ''}`;
            elementDiv.title = titleText;
            elementDiv.classList.toggle('disabled', isDisabled);
            elementDiv.classList.toggle('clickable', !isDisabled);
            elementResearchButtonsContainer.appendChild(elementDiv);
        });
    } else { console.error("Element research buttons container not found!"); }

    // Update Daily Action buttons
    if (freeResearchButtonWorkshop) {
        const freeAvailable = State.isFreeResearchAvailable();
        freeResearchButtonWorkshop.disabled = !freeAvailable;
        freeResearchButtonWorkshop.innerHTML = freeAvailable ? "Perform Daily Meditation ☆" : "Meditation Performed Today";
        freeResearchButtonWorkshop.title = freeAvailable ? "Once per day, perform free research on your least attuned element." : "Daily free meditation already completed.";
    }
    if (seekGuidanceButtonWorkshop && guidedReflectionCostDisplayWorkshop) {
        const cost = Config.GUIDED_REFLECTION_COST;
        const canAfford = State.getInsight() >= cost;
        seekGuidanceButtonWorkshop.disabled = !canAfford;
        seekGuidanceButtonWorkshop.title = canAfford ? `Spend ${cost.toFixed(1)} Insight for a Guided Reflection.` : `Requires ${cost.toFixed(1)} Insight.`;
        guidedReflectionCostDisplayWorkshop.textContent = cost.toFixed(1);
    }
}


// --- Grimoire UI ---

/** Updates the Grimoire count in the drawer navigation. */
export function updateGrimoireCounter() {
    const count = State.getDiscoveredConcepts().size;
    if (drawerGrimoireCountSpan) {
        drawerGrimoireCountSpan.textContent = count;
    } else { console.warn("Drawer grimoire count span not found."); }
}
/** Populates the filter dropdowns in the Grimoire controls. */
export function populateGrimoireFilters() {
    if (grimoireTypeFilterWorkshop) {
        grimoireTypeFilterWorkshop.innerHTML = '<option value="All">All Types</option>';
        cardTypeKeys.forEach(type => { const option = document.createElement('option'); option.value = type; option.textContent = type; grimoireTypeFilterWorkshop.appendChild(option); });
    } else { console.warn("Grimoire type filter dropdown not found."); }

    if (grimoireElementFilterWorkshop) {
        grimoireElementFilterWorkshop.innerHTML = '<option value="All">All Elements</option>';
        elementNames.forEach(elementNameKey => { // Includes RF
            const elementData = elementDetails[elementNameKey] || {};
            const fullName = elementData.name || elementNameKey;
            const shortName = Utils.getElementShortName(fullName);
            const option = document.createElement('option');
            option.value = elementNameKey; // Value is the Name Key ("Attraction")
            option.textContent = shortName;
            option.title = fullName;
            grimoireElementFilterWorkshop.appendChild(option);
        });
    } else { console.warn("Grimoire element filter dropdown not found."); }

    if (grimoireRarityFilterWorkshop) {
         grimoireRarityFilterWorkshop.innerHTML = `<option value="All">All Rarities</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>`;
    } else { console.warn("Grimoire rarity filter dropdown not found."); }

     if (!grimoireFocusFilterWorkshop) console.warn("Grimoire focus filter dropdown not found.");
     if (!grimoireSortOrderWorkshop) console.warn("Grimoire sort order dropdown not found.");
}
/** Updates the count display on each Grimoire shelf. */
function updateShelfCounts() {
    if (!grimoireShelvesWorkshop) { console.warn("Grimoire shelves container not found."); return; }
    const conceptData = Array.from(State.getDiscoveredConcepts().values());
    // Update specific shelves
    grimoireShelves.forEach(shelfDef => {
        const shelfElem = grimoireShelvesWorkshop.querySelector(`.grimoire-shelf[data-category-id="${shelfDef.id}"] .shelf-count`);
        if (shelfElem) {
            const count = conceptData.filter(data => (data.userCategory || 'uncategorized') === shelfDef.id).length;
            shelfElem.textContent = `(${count})`;
        }
    });
    // Update "Show All" shelf
    const showAllShelfCount = grimoireShelvesWorkshop.querySelector(`.show-all-shelf .shelf-count`);
    if (showAllShelfCount) {
        showAllShelfCount.textContent = `(${conceptData.length})`;
    }
}
/** Displays the Grimoire library content based on filters and sorting. */
export function displayGrimoire(filterParams = {}) {
    const {
        filterType = "All",
        filterElement = "All", // Expects Name Key like "Attraction", "RoleFocus"
        sortBy = "discovered",
        filterRarity = "All",
        searchTerm = "",
        filterFocus = "All",
        filterCategory = "All" // Shelf ID
    } = filterParams;

    // Display Shelves (and update counts)
    if (grimoireShelvesWorkshop) {
        grimoireShelvesWorkshop.innerHTML = ''; // Clear existing
        // Add "Show All" Shelf
        const showAllDiv = document.createElement('div');
        showAllDiv.classList.add('grimoire-shelf', 'show-all-shelf');
        if (filterCategory === 'All') showAllDiv.classList.add('active-shelf');
        showAllDiv.innerHTML = `<h4>Show All Cards</h4><span class="shelf-count">(?)</span>`;
        showAllDiv.dataset.categoryId = 'All';
        grimoireShelvesWorkshop.appendChild(showAllDiv);
        // Add Defined Shelves
        grimoireShelves.forEach(shelf => {
            const shelfDiv = document.createElement('div');
            shelfDiv.classList.add('grimoire-shelf');
            shelfDiv.dataset.categoryId = shelf.id;
            if (filterCategory === shelf.id) shelfDiv.classList.add('active-shelf');
            // Apply styles dynamically based on category ID (requires CSS variables set up)
            shelfDiv.style.backgroundColor = `var(--category-${shelf.id}-bg, transparent)`;
            shelfDiv.style.border = `1px solid var(--category-${shelf.id}-border, var(--border-color-light))`;
            shelfDiv.innerHTML = `
                <h4>${shelf.name} <i class="fas fa-info-circle info-icon" title="${shelf.description || ''}"></i></h4>
                <span class="shelf-count">(?)</span>`;
            grimoireShelvesWorkshop.appendChild(shelfDiv);
        });
    } else { console.error("Grimoire shelves container #grimoire-shelves-workshop not found."); }

    // Display Cards
    const targetCardContainer = grimoireGridWorkshop;
    if (!targetCardContainer) { console.error("#grimoire-grid-workshop element not found for cards."); return; }
    targetCardContainer.innerHTML = ''; // Clear previous cards

    const discoveredMap = State.getDiscoveredConcepts();
    if (discoveredMap.size === 0) {
        targetCardContainer.innerHTML = '<p>Your Grimoire Library is empty... Discover Concepts using the Research Bench!</p>';
        updateShelfCounts(); // Update counts even if empty
        return;
    }

    const userScores = State.getScores();
    const focusedSet = State.getFocusedConcepts();
    let discoveredArray = Array.from(discoveredMap.values());

    // --- Filtering ---
    const searchTermLower = searchTerm.toLowerCase().trim();
    const conceptsToDisplay = discoveredArray.filter(data => {
        if (!data?.concept) return false; // Skip if concept data missing
        const concept = data.concept;
        const userCategory = data.userCategory || 'uncategorized';

        const typeMatch = (filterType === "All") || (concept.cardType === filterType);
        // Element filter uses Name Key ("Attraction", "RoleFocus") from dropdown value
        let elementMatch = (filterElement === "All");
        if (!elementMatch) {
            // Convert filter name key ("Attraction") back to single letter key ('A') for comparison
             const filterLetterKey = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === filterElement);
             elementMatch = (concept.primaryElement === filterLetterKey);
        }
        const rarityMatch = (filterRarity === "All") || (concept.rarity === filterRarity);
        const focusMatch = (filterFocus === 'All') || (filterFocus === 'Focused' && focusedSet.has(concept.id)) || (filterFocus === 'Not Focused' && !focusedSet.has(concept.id));
        const searchMatch = !searchTermLower ||
                            (concept.name?.toLowerCase().includes(searchTermLower)) || // Add null checks
                            (concept.keywords && concept.keywords.some(k => k.toLowerCase().includes(searchTermLower))) ||
                            (concept.briefDescription?.toLowerCase().includes(searchTermLower));
        const categoryMatch = (filterCategory === 'All') || (userCategory === filterCategory);

        return typeMatch && elementMatch && rarityMatch && focusMatch && searchMatch && categoryMatch;
    });

    // --- Sorting ---
    const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3 };
    conceptsToDisplay.sort((a, b) => {
        if (!a?.concept || !b?.concept) return 0;
        const conceptA = a.concept;
        const conceptB = b.concept;
        switch (sortBy) {
            case 'name': return conceptA.name.localeCompare(conceptB.name);
            case 'type': return (cardTypeKeys.indexOf(conceptA.cardType) - cardTypeKeys.indexOf(conceptB.cardType)) || conceptA.name.localeCompare(conceptB.name);
            case 'rarity': return (rarityOrder[conceptB.rarity] || 0) - (rarityOrder[conceptA.rarity] || 0) || conceptA.name.localeCompare(conceptB.name);
            case 'resonance':
                 // Check if scores are valid before calculating distance
                 const scoresAValid = conceptA.elementScores && Object.keys(conceptA.elementScores).length === elementNames.length;
                 const scoresBValid = conceptB.elementScores && Object.keys(conceptB.elementScores).length === elementNames.length;
                 const distA = scoresAValid ? (a.distance ?? Utils.euclideanDistance(userScores, conceptA.elementScores, conceptA.name)) : Infinity;
                 const distB = scoresBValid ? (b.distance ?? Utils.euclideanDistance(userScores, conceptB.elementScores, conceptB.name)) : Infinity;
                a.distance = distA; // Cache distance
                b.distance = distB;
                if (distA === Infinity && distB !== Infinity) return 1; // Invalid scores go last
                if (distA !== Infinity && distB === Infinity) return -1;
                if (distA === Infinity && distB === Infinity) return conceptA.name.localeCompare(conceptB.name); // Sort by name if both invalid
                return distA - distB || conceptA.name.localeCompare(conceptB.name); // Sort by distance asc
            case 'discovered': // Default
            default:
                return (b.discoveredTime || 0) - (a.discoveredTime || 0) || conceptA.name.localeCompare(conceptB.name); // Sort by time desc
        }
    });


    // --- Rendering ---
    if (conceptsToDisplay.length === 0) {
        const shelfName = filterCategory !== 'All' ? `'${grimoireShelves.find(s=>s.id===filterCategory)?.name || filterCategory}' shelf` : '';
        targetCardContainer.innerHTML = `<p>No discovered concepts match the current filters${searchTerm ? ' or search term' : ''}${shelfName ? ` on the ${shelfName}` : ''}.</p>`;
    } else {
        conceptsToDisplay.forEach(data => {
            const cardElement = renderCard(data.concept, 'grimoire', data);
            if (cardElement) {
                cardElement.draggable = true; // Enable dragging for categorization
                cardElement.dataset.conceptId = data.concept.id; // Ensure ID is set for drop logic
                targetCardContainer.appendChild(cardElement);
            }
        });
    }
const libGrid = document.getElementById('grimoire-grid-workshop');
if (libGrid){
    libGrid.querySelectorAll('img').forEach(img=>{
        if (img.complete) return;               // already cached
        img.addEventListener('load', ()=>{      // image finished
            libGrid.style.columnGap = '1px';    // nudge the engine…
            libGrid.offsetHeight;               // force reflow
            libGrid.style.columnGap = '';       // restore gap
        });
    });
}
    updateShelfCounts(); // Update counts after rendering cards
}
/** Refreshes the Grimoire display based on current filter/sort control values. */
export function refreshGrimoireDisplay(overrideFilters = {}) {
    if (workshopScreen && !workshopScreen.classList.contains('hidden')) {
        const currentFilters = {
             filterType: grimoireTypeFilterWorkshop?.value || "All",
             filterElement: grimoireElementFilterWorkshop?.value || "All", // Value is Name Key ("Attraction")
             sortBy: grimoireSortOrderWorkshop?.value || "discovered",
             filterRarity: grimoireRarityFilterWorkshop?.value || "All",
             searchTerm: grimoireSearchInputWorkshop?.value || "",
             filterFocus: grimoireFocusFilterWorkshop?.value || "All",
             // Get active shelf ID, default to "All"
             filterCategory: overrideFilters.filterCategory !== undefined ? overrideFilters.filterCategory : document.querySelector('#grimoire-shelves-workshop .grimoire-shelf.active-shelf')?.dataset.categoryId || "All"
        };
        const finalFilters = { ...currentFilters, ...overrideFilters };
        console.log("Refreshing Grimoire with filters:", finalFilters);
        displayGrimoire(finalFilters);
    }
}
/** Renders a single concept card element. */
export function renderCard(concept, context = 'grimoire', discoveredData = null) {
    if (!concept || typeof concept.id === 'undefined') { console.warn("renderCard called with invalid concept:", concept); const eDiv = document.createElement('div'); eDiv.textContent = "Error: Invalid Concept Data"; eDiv.classList.add('concept-card', 'error'); return eDiv; }

    const cardDiv = document.createElement('div');
    cardDiv.classList.add('concept-card', `rarity-${concept.rarity || 'common'}`);
    cardDiv.dataset.conceptId = concept.id;
    cardDiv.title = (context === 'grimoire') ? `View Details: ${concept.name}` : concept.name;

    const isDiscovered = context === 'grimoire' && !!discoveredData;
    const isFocused = isDiscovered && State.getFocusedConcepts().has(concept.id);
    const hasNewLore = isDiscovered && (discoveredData?.newLoreAvailable || false);
    const userCategory = isDiscovered ? (discoveredData?.userCategory || 'uncategorized') : 'uncategorized';

    // Visual Content (Image or Placeholder)
   let visualContentHTML = '';
   /* Show the art both in the Grimoire **and** in the Research‑popup  */
    if (context === 'grimoire' || context === 'popup-result') {
        const placeholderIconHTML = `<i class="fas fa-image card-visual-placeholder" title="Visual Placeholder"></i>`;
        if (concept.visualHandle) {
            const handle = concept.visualHandle;
            const fileName = handle.includes('.') ? handle : `${handle}${Config.UNLOCKED_ART_EXTENSION || '.jpg'}`;
            const imageUrl = `placeholder_art/${fileName}`;
            visualContentHTML = `
                <img src="${imageUrl}" alt="${concept.name} Art" class="card-art-image" loading="lazy" onerror="window.handleImageError(this)">
                <i class="fas fa-image card-visual-placeholder" style="display: none;" title="Art Placeholder (Load Failed)"></i>`; // Start placeholder hidden
        } else {
            visualContentHTML = placeholderIconHTML;
        }
        visualContentHTML = `<div class="card-visual">${visualContentHTML}</div>`;
    }

    // Stamps (Focus, Lore)
    const focusStampHTML = (context === 'grimoire' && isFocused) ? '<span class="focus-indicator" title="Focused Concept">★</span>' : '';
    const loreStampHTML = (context === 'grimoire' && hasNewLore) ? '<span class="lore-indicator" title="New Lore Unlocked!"><i class="fas fa-scroll"></i></span>' : '';
    const cardStampsHTML = `<span class="card-stamps">${focusStampHTML}${loreStampHTML}</span>`;

    // Rarity Indicator
    let rarityText = concept.rarity ? concept.rarity.charAt(0).toUpperCase() + concept.rarity.slice(1) : 'Common';
    let rarityClass = `rarity-indicator-${concept.rarity || 'common'}`;
    const rarityIndicatorHTML = `<span class="card-rarity ${rarityClass}" title="Rarity: ${rarityText}">${rarityText}</span>`;

    // Card Header Right Area
    const cardHeaderRightHTML = `<span class="card-header-right">${rarityIndicatorHTML}${cardStampsHTML}</span>`;

    // Primary Element Display
    let primaryElementHTML = '<small class="no-element">No Primary Element</small>';
    if (concept.primaryElement && elementKeyToFullName?.[concept.primaryElement]) {
        const primaryKey = concept.primaryElement; // 'A'...'RF'
        const elementNameKey = elementKeyToFullName[primaryKey]; // 'Attraction'...'RoleFocus'
        const elementData = elementDetails?.[elementNameKey] || {}; // Added check for elementDetails
        const descriptiveName = elementData.name || elementNameKey;
        const color = Utils.getElementColor(elementNameKey);
        const icon = Utils.getElementIcon(elementNameKey);
        const nameShort = Utils.getElementShortName(descriptiveName);
        primaryElementHTML = `<span class="primary-element-display" style="color: ${color}; border-color: ${Utils.hexToRgba(color, 0.5)}; background-color: ${Utils.hexToRgba(color, 0.1)};" title="Primary Element: ${descriptiveName}"><i class="${icon}"></i> ${nameShort}</span>`;
    }

    // Action Buttons (Only in Grimoire context)
    let actionButtonsHTML = '';
    if (context === 'grimoire') {
        actionButtonsHTML += '<div class="card-actions">';
        let hasActions = false;
        const showSellButtonOnCard = isDiscovered;
        const showFocusButtonOnCard = isDiscovered;

        if (showSellButtonOnCard) {
            let discoveryValue = Config.CONCEPT_DISCOVERY_INSIGHT[concept.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default;
            const sellValue = discoveryValue * Config.SELL_INSIGHT_FACTOR;
            actionButtonsHTML += `<button class="button tiny-button secondary-button sell-button card-sell-button btn" data-concept-id="${concept.id}" data-context="grimoire" title="Sell (${sellValue.toFixed(1)} Insight)"><i class="fas fa-dollar-sign"></i></button>`;
            hasActions = true;
        }
        if (showFocusButtonOnCard) {
            const slotsFull = State.getFocusedConcepts().size >= State.getFocusSlots() && !isFocused;
            const buttonClass = isFocused ? 'marked' : '';
            const buttonIcon = isFocused ? 'fa-star' : 'fa-regular fa-star'; // Use filled/regular star
            const buttonTitle = slotsFull ? `Focus Slots Full (${State.getFocusSlots()})` : (isFocused ? 'Remove Focus' : 'Mark as Focus');
            actionButtonsHTML += `<button class="button tiny-button card-focus-button ${buttonClass} btn" data-concept-id="${concept.id}" title="${buttonTitle}" ${slotsFull ? 'disabled' : ''}><i class="fas ${buttonIcon}"></i></button>`;
            hasActions = true;
        }
        actionButtonsHTML += '</div>';
        if (!hasActions) actionButtonsHTML = ''; // Remove container if no actions
    }

    // Assemble Card HTML
    cardDiv.innerHTML = `
        <div class="card-header">
            <span class="card-type-icon-area"><i class="${Utils.getCardTypeIcon(concept.cardType)}" title="${concept.cardType}"></i></span>
            <span class="card-name">${concept.name}</span>
            ${cardHeaderRightHTML}
        </div>
        ${visualContentHTML}
        <div class="card-footer">
            <div class="card-affinities">${primaryElementHTML}</div>
            <p class="card-brief-desc">${concept.briefDescription || '...'}</p>
            ${actionButtonsHTML}
        </div>
    `;

    // Add category class for styling left border
    if (context === 'grimoire') {
        cardDiv.classList.add(`category-${userCategory}`);
    }
    // Special styling for cards in research popup
    if (context === 'popup-result') {
        cardDiv.classList.add('popup-result-card');
        const footer = cardDiv.querySelector('.card-footer');
        const briefDesc = cardDiv.querySelector('.card-brief-desc');
        const affinities = cardDiv.querySelector('.card-affinities');
        if(footer) footer.style.paddingBottom = '0px';
        if(briefDesc) {
             briefDesc.style.display = 'block'; // Ensure brief desc is block
             briefDesc.style.minHeight = 'calc(1.4em * 1)'; // Adjust min height if needed
        }
        if(affinities) affinities.style.marginBottom = '5px';
    }

    return cardDiv;
}

// --- Concept Detail Popup UI ---

/** Displays the details of a concept in a popup. */
export function showConceptDetailPopup(conceptId) {
    if (!conceptDetailPopup) { console.error("Concept detail popup element not found!"); return; }
    const discoveredData = State.getDiscoveredConceptData(conceptId);
    const concept = discoveredData?.concept;

    if (!concept) {
        console.error(`Concept data for ID ${conceptId} not found in discovered state.`);
        showTemporaryMessage(`Error: Cannot display details for Concept ID ${conceptId}.`, 3000);
        return;
    }
    console.log(`UI: Showing details for concept: ${concept.name}`);
    if (typeof GameLogic !== 'undefined' && GameLogic.setCurrentPopupConcept) {
        GameLogic.setCurrentPopupConcept(conceptId); // Store ID in logic state
    } else { console.error("GameLogic or setCurrentPopupConcept not available."); }

    // --- Populate Basic Info ---
    if (popupCardTypeIcon) popupCardTypeIcon.className = `card-type-icon ${Utils.getCardTypeIcon(concept.cardType)}`;
    else { console.warn("Popup card type icon element not found."); }
    if (popupConceptName) popupConceptName.textContent = concept.name;
    else { console.warn("Popup concept name element not found."); }
    if (popupConceptType) popupConceptType.textContent = concept.cardType;
    else { console.warn("Popup concept type element not found."); }
    if (popupBriefDescription) popupBriefDescription.textContent = concept.briefDescription || '...';
    else { console.warn("Popup brief description element not found."); }
    if (popupDetailedDescription) popupDetailedDescription.textContent = concept.detailedDescription || 'Loading details...';
    else { console.warn("Popup detailed description element not found."); }

    // --- Populate Visual ---
    if (popupVisualContainer) {
        popupVisualContainer.innerHTML = ''; // Clear previous
        popupVisualContainer.setAttribute('aria-label', `${concept.name} Art`);
        const placeholder = document.createElement('i');
        placeholder.className = 'fas fa-image card-visual-placeholder';
        placeholder.title = 'Visual Placeholder';
        placeholder.style.display = 'none'; // Start hidden
        popupVisualContainer.appendChild(placeholder);

        if (concept.visualHandle) {
            const handle = concept.visualHandle;
            const fileName = handle.includes('.') ? handle : `${handle}${Config.UNLOCKED_ART_EXTENSION || '.jpg'}`;
            const imageUrl = `placeholder_art/${fileName}`;
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = `${concept.name} Art`;
            img.loading = 'lazy';
            img.onerror = () => handleImageError(img); // Use helper on error
            img.onload = () => { // Hide placeholder on successful load
                placeholder.style.display = 'none';
                img.style.display = 'block';
            };
            // Initially hide image until load/error check
            img.style.display = 'block'; // Assume load success initially
            placeholder.style.display = 'none';
            popupVisualContainer.appendChild(img);
        } else {
            placeholder.style.display = 'flex'; // Show placeholder if no image handle
        }
    } else { console.warn("Popup visual container not found."); }

    // --- Calculate & Display Resonance ---
    const userScores = State.getScores();
    const conceptScores = concept.elementScores;
    const expectedKeys = Object.keys(elementKeyToFullName);
    const scoresValid = conceptScores && typeof conceptScores === 'object' &&
                       expectedKeys.length === Object.keys(conceptScores).length &&
                       expectedKeys.every(key => conceptScores.hasOwnProperty(key) && typeof conceptScores[key] === 'number' && !isNaN(conceptScores[key]));

    if (scoresValid) {
         const distance = Utils.euclideanDistance(userScores, conceptScores, concept.name);
         const maxPossibleDistance = Math.sqrt(elementNames.length * Math.pow(10, 2)); // Max distance in 7D space
         const similarity = Math.max(0, 1 - (distance / maxPossibleDistance));
         const resonanceScore = similarity * 10;
         displayPopupResonanceGauge(resonanceScore);
         if (popupResonanceGaugeSection) popupResonanceGaugeSection.classList.remove('hidden');
         else { console.warn("Popup resonance gauge section not found."); }
    } else {
        if (popupResonanceGaugeSection) popupResonanceGaugeSection.classList.add('hidden');
        console.warn(`Concept ${concept.name} missing or has incomplete elementScores. Hiding resonance gauge.`);
    }

    // --- Display Related Concepts Tags ---
    displayPopupRelatedConceptsTags(concept.relatedIds);

    // --- Display Recipe Comparison ---
    displayPopupRecipeComparison(conceptScores, userScores);

    // --- Display Lore ---
    displayPopupLore(conceptId, concept.lore, discoveredData.unlockedLoreLevel);

    // --- Display Notes ---
    if (myNotesSection) {
        myNotesSection.classList.remove('hidden'); // Always show notes section
        if (myNotesTextarea) myNotesTextarea.value = discoveredData.notes || "";
        else { console.warn("My notes textarea not found."); }
        if (noteSaveStatusSpan) noteSaveStatusSpan.textContent = ""; // Clear previous save status
        else { console.warn("Note save status span not found."); }
    } else { console.warn("My notes section not found."); }

    // --- Set Button States ---
    updateGrimoireButtonStatus(conceptId); // Update Add/Sell status
    updateFocusButtonStatus(conceptId); // Update Focus status

    // --- Show Popup ---
    conceptDetailPopup.classList.remove('hidden');
    // Show overlay if onboarding isn't active
    if (popupOverlay && !(onboardingOverlay && onboardingOverlay.classList.contains('visible'))) {
         popupOverlay.classList.remove('hidden');
    }
}

/** Displays the resonance gauge in the popup. */
function displayPopupResonanceGauge(score) { if (!popupResonanceGaugeBar || !popupResonanceGaugeLabel || !popupResonanceGaugeText) { console.warn("Popup resonance gauge elements missing."); return; } const clampedScore = Math.max(0, Math.min(10, score)); const percentage = (clampedScore / 10) * 100; const scoreLabel = Utils.getScoreLabel(clampedScore); let resonanceText = "Some similarities."; let barClass = 'resonance-medium'; if (clampedScore >= 8) { resonanceText = "Strong alignment detected!"; barClass = 'resonance-high'; } else if (clampedScore < 4) { resonanceText = "Significant differences noted."; barClass = 'resonance-low'; } popupResonanceGaugeBar.style.width = `${percentage}%`; popupResonanceGaugeLabel.textContent = scoreLabel; popupResonanceGaugeText.textContent = resonanceText; popupResonanceGaugeBar.className = 'popup-resonance-gauge-bar'; popupResonanceGaugeBar.classList.add(barClass); popupResonanceGaugeLabel.className = 'popup-resonance-gauge-label'; popupResonanceGaugeLabel.classList.add(barClass); if (popupResonanceGaugeContainer) { popupResonanceGaugeContainer.setAttribute('aria-valuenow', clampedScore.toFixed(1)); popupResonanceGaugeContainer.setAttribute('aria-valuetext', `${scoreLabel}: ${resonanceText}`); } }
/** Displays related concept tags in the popup. */
function displayPopupRelatedConceptsTags(relatedIds) { if (!popupRelatedConceptsTags) { console.warn("Popup related concepts tags container missing."); return; } popupRelatedConceptsTags.innerHTML = ''; if (!relatedIds || relatedIds.length === 0) { popupRelatedConceptsTags.innerHTML = '<p><i>None specified.</i></p>'; return; } const discoveredMap = State.getDiscoveredConcepts(); relatedIds.forEach(id => { const conceptData = discoveredMap.get(id)?.concept; const name = conceptData?.name || `Concept ID ${id}`; const tagSpan = document.createElement('span'); tagSpan.classList.add('related-concept-tag'); tagSpan.textContent = name; if (conceptData) { tagSpan.title = `View details for ${name}`; tagSpan.style.cursor = 'pointer'; tagSpan.addEventListener('click', () => showConceptDetailPopup(id)); } else { tagSpan.title = `Concept ID ${id} (Not yet discovered)`; tagSpan.style.opacity = '0.7'; } popupRelatedConceptsTags.appendChild(tagSpan); }); }
/** Displays the recipe comparison (concept vs user scores) in the popup. */
function displayPopupRecipeComparison(conceptScores, userScores) { if (!popupConceptProfile || !popupUserComparisonProfile || !popupComparisonHighlights) { console.warn("Popup recipe comparison elements missing."); return; } const renderProfile = (scores, container) => { container.innerHTML = ''; elementNames.forEach(elNameKey => { const key = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === elNameKey); const score = (scores && typeof scores[key] === 'number') ? scores[key] : NaN; const name = Utils.getElementShortName(elementDetails?.[elNameKey]?.name || elNameKey); const color = Utils.getElementColor(elNameKey); const barWidth = isNaN(score) ? 0 : Math.max(0, Math.min(100, score * 10)); const scoreText = isNaN(score) ? 'N/A' : score.toFixed(1); container.innerHTML += `<div><strong>${name}:</strong> ${scoreText} <div class="score-bar-container"><div style="width: ${barWidth}%; background-color:${color};"></div></div></div>`; }); }; renderProfile(conceptScores, popupConceptProfile); renderProfile(userScores, popupUserComparisonProfile); // Highlight differences
    let highlightsHTML = ''; const expectedKeys = Object.keys(elementKeyToFullName); const scoresValid = conceptScores && typeof conceptScores === 'object' && expectedKeys.length === Object.keys(conceptScores).length && expectedKeys.every(key => conceptScores.hasOwnProperty(key) && typeof conceptScores[key] === 'number' && !isNaN(conceptScores[key])); if (!scoresValid) { highlightsHTML = "<p><em>Concept score data incomplete. Cannot compare.</em></p>"; } else { elementNames.forEach(elNameKey => { const key = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === elNameKey); const cScore = conceptScores[key]; const uScore = userScores[key]; const diff = Math.abs(cScore - uScore); if (diff <= 1.5) { highlightsHTML += `<p class="match"><i class="fas fa-check"></i> ${Utils.getElementShortName(elementDetails?.[elNameKey]?.name || elNameKey)}: Close alignment.</p>`; } else if (diff >= 4.0) { highlightsHTML += `<p class="mismatch"><i class="fas fa-times"></i> ${Utils.getElementShortName(elementDetails?.[elNameKey]?.name || elNameKey)}: Significant difference.</p>`; } }); } popupComparisonHighlights.innerHTML = highlightsHTML || "<p><em>Scores seem broadly similar or differences are moderate.</em></p>"; }
/** Displays the Lore section in the concept detail popup. */
export function displayPopupLore(conceptId, loreData, unlockedLevel) { // Exported now
     if (!popupLoreSection || !popupLoreContent) { console.warn("Popup lore elements missing."); return; } popupLoreContent.innerHTML = ''; if (!loreData || !Array.isArray(loreData) || loreData.length === 0) { popupLoreSection.classList.add('hidden'); return; } popupLoreSection.classList.remove('hidden'); // Ensure section is visible
    let canUnlockMore = false; loreData.forEach(entry => { if (entry.level <= unlockedLevel) { // Display unlocked lore
            const entryDiv = document.createElement('div'); entryDiv.classList.add('lore-entry'); entryDiv.innerHTML = `<h6><i class="fas fa-scroll"></i> Level ${entry.level}</h6><p>${entry.text}</p>`; popupLoreContent.appendChild(entryDiv); } else if (entry.level === unlockedLevel + 1) { // Display next unlock button
            canUnlockMore = true; const unlockDiv = document.createElement('div'); unlockDiv.classList.add('lore-unlock'); const cost = entry.insightCost || Config.LORE_UNLOCK_COSTS[`level${entry.level}`] || 999; // Get cost, fallback
            const canAfford = State.getInsight() >= cost; const errorMsg = canAfford ? '' : `<span class="unlock-error">Requires ${cost.toFixed(1)} Insight</span>`; unlockDiv.innerHTML = `<button class="button small-button unlock-lore-button btn" data-concept-id="${conceptId}" data-lore-level="${entry.level}" data-cost="${cost}" ${canAfford ? '' : 'disabled'} title="${canAfford ? `Unlock for ${cost.toFixed(1)} Insight` : `Requires ${cost.toFixed(1)} Insight`}">Unlock Level ${entry.level} Lore (${cost.toFixed(1)} <i class="fas fa-brain insight-icon"></i>)</button>${errorMsg}`; popupLoreContent.appendChild(unlockDiv); } }); if (!canUnlockMore && unlockedLevel >= loreData.length) { popupLoreContent.innerHTML += '<p><i>All lore insights unlocked.</i></p>'; } // Mark lore as seen if it was new
     if (State.isNewLoreAvailable(conceptId)) { State.markLoreAsSeen(conceptId); } }
/** Updates the "Add to Grimoire" / "Sell" button state in the popup. */
export function updateGrimoireButtonStatus(conceptId) { const container = conceptDetailPopup?.querySelector('.popup-actions'); const addBtn = getElement('addToGrimoireButton'); if (!container || !addBtn) { console.warn("Popup actions container or add button missing for Grimoire status update."); return; } // Remove existing sell button if present
    const existingSellBtn = container.querySelector('.popup-sell-button'); if (existingSellBtn) existingSellBtn.remove(); if (State.getDiscoveredConcepts().has(conceptId)) { // Concept IS discovered
        addBtn.classList.add('hidden'); // Hide 'Add' button
        // Add 'Sell' button
        const sellButton = document.createElement('button'); const concept = State.getDiscoveredConceptData(conceptId)?.concept; if (!concept) return; // Should not happen if discovered
        let discoveryValue = Config.CONCEPT_DISCOVERY_INSIGHT[concept.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default; const sellValue = discoveryValue * Config.SELL_INSIGHT_FACTOR; sellButton.className = 'button small-button secondary-button sell-button popup-sell-button btn'; sellButton.dataset.conceptId = conceptId; sellButton.dataset.context = 'detailPopup'; sellButton.title = `Sell this Concept for ${sellValue.toFixed(1)} Insight (Permanent!)`; sellButton.innerHTML = `Sell <i class="fas fa-dollar-sign"></i>`; container.appendChild(sellButton); } else { // Concept is NOT discovered
        addBtn.classList.remove('hidden'); // Show 'Add' button
    } }
/** Updates the "Mark/Remove Focus" button state in the popup. */
export function updateFocusButtonStatus(conceptId) { if (!markAsFocusButton) { console.warn("Mark as Focus button not found."); return; } if (State.getDiscoveredConcepts().has(conceptId)) { markAsFocusButton.classList.remove('hidden'); // Show button if discovered
        const isFocused = State.getFocusedConcepts().has(conceptId); markAsFocusButton.classList.toggle('marked', isFocused); markAsFocusButton.innerHTML = isFocused ? 'Remove Focus <i class="fas fa-star"></i>' : 'Mark as Focus <i class="far fa-star"></i>'; const slotsFull = State.getFocusedConcepts().size >= State.getFocusSlots() && !isFocused; markAsFocusButton.disabled = slotsFull; markAsFocusButton.title = slotsFull ? `Focus Slots Full (${State.getFocusSlots()})` : (isFocused ? 'Remove from Persona Tapestry Focus' : 'Add to Persona Tapestry Focus'); } else { markAsFocusButton.classList.add('hidden'); // Hide if not discovered
    } }

// --- Research Popup ---

/** Displays the results of a research action in a popup. */
export function displayResearchResults(results) { if (!researchResultsPopup || !researchPopupContent) { console.error("Research results popup elements missing!"); return; } researchPopupContent.innerHTML = ''; // Clear previous
    const { concepts: foundConcepts, duplicateInsightGain } = results; if (foundConcepts.length === 0 && duplicateInsightGain <= 0) { researchPopupContent.innerHTML = '<p>No new discoveries this time. Perhaps try a different approach?</p>'; } else { if (duplicateInsightGain > 0) { researchPopupContent.innerHTML += `<p class="duplicate-insight-info">No new Concepts found in this area, but gained ${duplicateInsightGain.toFixed(1)} Insight from Research Echoes!</p>`; } foundConcepts.forEach(concept => { const itemDiv = document.createElement('div'); itemDiv.classList.add('research-result-item'); itemDiv.dataset.conceptId = concept.id; itemDiv.dataset.processed = "false"; // Mark as unprocessed initially
            const cardElement = renderCard(concept, 'popup-result'); // Use specific context for styling
             if(cardElement) itemDiv.appendChild(cardElement); // Append rendered card only if valid
            // Add action buttons container
            const actionsDiv = document.createElement('div'); actionsDiv.classList.add('card-actions'); actionsDiv.innerHTML = ` <button class="button tiny-button add-grimoire-button btn" data-action="keep" data-concept-id="${concept.id}" title="Keep Concept (May cost Insight later)">Keep <i class="fas fa-plus"></i></button> <button class="button tiny-button sell-button btn" data-action="sell" data-concept-id="${concept.id}" title="Sell for Insight">Sell <i class="fas fa-dollar-sign"></i></button> <span class="action-feedback"></span> `; itemDiv.appendChild(actionsDiv); researchPopupContent.appendChild(itemDiv); }); } // Update status and button states
    updateResearchPopupState(); // Show the popup
    researchResultsPopup.classList.remove('hidden'); if (popupOverlay && !(onboardingOverlay && onboardingOverlay.classList.contains('visible'))) { popupOverlay.classList.remove('hidden'); } }
/** Updates the state of a specific item and the overall popup after a Keep/Sell choice. */
export function handleResearchPopupAction(conceptId, actionResult) { const item = researchPopupContent?.querySelector(`.research-result-item[data-concept-id="${conceptId}"]`); if (!item) return; const feedbackSpan = item.querySelector('.action-feedback'); const buttons = item.querySelectorAll('.card-actions button'); // Disable buttons after choice
    buttons.forEach(btn => btn.disabled = true); item.dataset.processed = "true"; // Mark as processed
    item.dataset.choiceMade = actionResult; // Store the result ('kept', 'sold', 'pending_dissonance', etc.)
    // Update feedback text and styling based on the action result
    let feedbackText = ""; switch (actionResult) { case 'kept': feedbackText = "Added to Grimoire!"; item.classList.add('kept'); break; case 'sold': feedbackText = "Sold for Insight!"; item.classList.add('sold'); break; case 'pending_dissonance': feedbackText = "Dissonance! Reflection needed..."; item.classList.add('pending'); break; case 'kept_after_dissonance': feedbackText = "Kept after reflection."; item.classList.add('kept'); break; case 'kept_after_dissonance_fail': feedbackText = "Kept (Reflection Error)"; item.classList.add('kept'); break; case 'error_adding': feedbackText = "Error adding!"; item.classList.add('error'); break; case 'error_unknown': default: feedbackText = "Error processing choice."; item.classList.add('error'); break; } if (feedbackSpan) feedbackSpan.textContent = feedbackText; // Check if all items are processed to enable close button
    updateResearchPopupState(); }
/** Updates the status message and close/confirm buttons of the research popup. */
function updateResearchPopupState() { if (!researchPopupContent) return; const items = researchPopupContent.querySelectorAll('.research-result-item'); const duplicateInsightGain = parseFloat(researchPopupContent.querySelector('.duplicate-insight-info')?.textContent.match(/gained ([\d.]+)/)?.[1] || '0'); if (!items || items.length === 0) { // No items found, or duplicate insight message
        if(researchPopupStatus) researchPopupStatus.textContent = duplicateInsightGain > 0 ? "Insight gained." : "No discoveries."; if(closeResearchResultsPopupButton) closeResearchResultsPopupButton.disabled = false; if(confirmResearchChoicesButton) confirmResearchChoicesButton.classList.add('hidden'); return; } const unprocessedItems = Array.from(items).filter(item => item.dataset.processed === "false" || item.dataset.choiceMade === "pending_dissonance"); const allProcessed = unprocessedItems.length === 0; if(researchPopupStatus) researchPopupStatus.textContent = allProcessed ? "All findings processed." : `Choose an action for the remaining ${unprocessedItems.length} finding(s).`; if(closeResearchResultsPopupButton) closeResearchResultsPopupButton.disabled = !allProcessed; if(confirmResearchChoicesButton) confirmResearchChoicesButton.classList.toggle('hidden', !allProcessed); }

// --- Reflection Modal UI ---

/** Displays the reflection prompt modal. */
export function displayReflectionPrompt(promptData, context) { if (!reflectionModal || !reflectionModalTitle || !reflectionElement || !reflectionPromptText || !confirmReflectionButton || !reflectionCheckbox || !scoreNudgeCheckbox || !scoreNudgeLabel) { console.error("Reflection modal elements missing!"); return; } // Reset UI state
    reflectionCheckbox.checked = false; scoreNudgeCheckbox.checked = false; confirmReflectionButton.disabled = true; scoreNudgeCheckbox.classList.add('hidden'); scoreNudgeLabel.classList.add('hidden'); const { title, category, prompt, showNudge, reward } = promptData; reflectionModalTitle.textContent = title || "Moment for Reflection"; reflectionElement.textContent = category || "Your Journey"; reflectionPromptText.innerHTML = prompt?.text || "Reflect on this..."; // Added null check for prompt
    // Show nudge checkbox only if allowed by context
    if (showNudge) { scoreNudgeCheckbox.classList.remove('hidden'); scoreNudgeLabel.classList.remove('hidden'); } // Update reward display
    if (reflectionRewardAmount) reflectionRewardAmount.textContent = reward?.toFixed(1) || '?'; // Show reward amount, default '?'
    // Show the modal
    reflectionModal.classList.remove('hidden'); if (popupOverlay && !(onboardingOverlay && onboardingOverlay.classList.contains('visible'))) { popupOverlay.classList.remove('hidden'); } }

// --- Repository UI ---

/** Renders the entire content of the Repository screen. */
export function displayRepositoryContent() {
    if (!repositoryScreen || !repositoryScreen.classList.contains('current')) return;
    console.log("UI: Displaying Repository Content");
    if (repositoryFocusUnlocksDiv) { repositoryFocusUnlocksDiv.innerHTML = ''; const unlockedFocus = State.getUnlockedFocusItems(); if (unlockedFocus.size === 0) { repositoryFocusUnlocksDiv.innerHTML = '<li>No focus-driven discoveries yet. Combine concepts in your Tapestry!</li>'; } else { focusDrivenUnlocks.filter(u => unlockedFocus.has(u.id)).forEach(u => repositoryFocusUnlocksDiv.appendChild(renderRepositoryItem(u, 'focusUnlock'))); } } else { console.warn("Repo Focus Unlocks div missing."); }
    if (repositoryScenesDiv) { repositoryScenesDiv.innerHTML = ''; const scenes = State.getRepositoryItems().scenes; if (scenes.size === 0) { repositoryScenesDiv.innerHTML = '<li>No Scene Blueprints acquired. Try suggesting scenes in the Persona screen.</li>'; } else { sceneBlueprints.filter(s => scenes.has(s.id)).forEach(s => { const cost = s.meditationCost || Config.SCENE_MEDITATION_BASE_COST; const canAfford = State.getInsight() >= cost; repositoryScenesDiv.appendChild(renderRepositoryItem(s, 'scene', cost, canAfford)); }); } } else { console.warn("Repo Scenes div missing."); }
    if (repositoryExperimentsDiv) { repositoryExperimentsDiv.innerHTML = ''; const completedExperiments = State.getRepositoryItems().experiments; const userAttunement = State.getAttunement(); const userScores = State.getScores(); const userFocus = State.getFocusedConcepts(); const discoveredMap = State.getDiscoveredConcepts(); const availableExperiments = alchemicalExperiments.filter(e => { // Check if requirements are met to even display it
            if (completedExperiments.has(e.id)) return true; // Always show completed
            let reqsMet = userAttunement[e.requiredElement] >= e.requiredAttunement; if (e.requiredRoleFocusScore !== undefined && (userScores.RF ?? 0) < e.requiredRoleFocusScore) reqsMet = false; if (e.requiredRoleFocusScoreBelow !== undefined && (userScores.RF ?? 0) >= e.requiredRoleFocusScoreBelow) reqsMet = false; if (e.requiredFocusConceptIds) { for (const reqId of e.requiredFocusConceptIds) { if (!userFocus.has(reqId)) reqsMet = false; } } if (e.requiredFocusConceptTypes) { for (const typeReq of e.requiredFocusConceptTypes) { let typeMet = false; for (const fId of userFocus) { const c = discoveredMap.get(fId)?.concept; if (c?.cardType === typeReq) { typeMet = true; break; } } if (!typeMet) reqsMet = false; } } return reqsMet; }); if (availableExperiments.length === 0) { repositoryExperimentsDiv.innerHTML = '<li>No Alchemical Experiments available. Increase Element Attunement and Focus relevant Concepts.</li>'; } else { availableExperiments.forEach(e => { const cost = e.insightCost || Config.EXPERIMENT_BASE_COST; const canAfford = State.getInsight() >= cost; const completed = completedExperiments.has(e.id); repositoryExperimentsDiv.appendChild(renderRepositoryItem(e, 'experiment', cost, canAfford, completed)); }); } } else { console.warn("Repo Experiments div missing."); }
    if (repositoryInsightsDiv) { repositoryInsightsDiv.innerHTML = ''; const insights = State.getRepositoryItems().insights; if (insights.size === 0) { repositoryInsightsDiv.innerHTML = '<li>No Elemental Insights uncovered. Keep researching!</li>'; } else { elementalInsights.filter(i => insights.has(i.id)).forEach(i => repositoryInsightsDiv.appendChild(renderRepositoryItem(i, 'insight'))); } } else { console.warn("Repo Insights div missing."); }
    displayMilestones();
    displayDailyRituals(); // Refresh rituals display
}
/** Renders a single item for the Repository lists. */
export function renderRepositoryItem(item, type, cost = 0, canAfford = false, completed = false) { const li = document.createElement('li'); li.classList.add('repository-item'); li.classList.toggle('completed', completed); const itemElementKey = item.element || item.requiredElement || null; const elementName = itemElementKey ? elementKeyToFullName?.[itemElementKey] : null; // Added null check
    const color = elementName ? Utils.getElementColor(elementName) : 'var(--secondary-color)'; li.style.borderLeftColor = completed ? 'var(--success-color)' : color; let actionsHTML = ''; let title = item.name; let description = item.description || ''; let requiresText = ""; // Requirements text for experiments
    switch (type) { case 'scene': title = `<i class="fas fa-scroll" style="color: ${color};"></i> ${item.name}`; if (!completed) { const actionLabel = `Meditate (${cost.toFixed(1)})`; actionsHTML = `<div class="repo-actions"><button class="button tiny-button btn" data-scene-id="${item.id}" ${!canAfford ? 'disabled' : ''} title="${canAfford ? `Meditate on ${item.name}` : `Requires ${cost.toFixed(1)} Insight`}"><i class="fas fa-brain"></i> ${actionLabel}</button></div>`; } break; case 'experiment': title = `<i class="fas fa-flask" style="color: ${color};"></i> ${item.name}`; const userAttunement = State.getAttunement(); const userScores = State.getScores(); const userFocus = State.getFocusedConcepts(); const discoveredMap = State.getDiscoveredConcepts(); let otherReqsMet = true; let reqsList = []; if (userAttunement[item.requiredElement] < item.requiredAttunement) { otherReqsMet = false; reqsList.push(`${item.requiredAttunement} ${Utils.getElementShortName(elementKeyToFullName[item.requiredElement])} Att.`); } if (item.requiredRoleFocusScore !== undefined && (userScores.RF ?? 0) < item.requiredRoleFocusScore) { otherReqsMet = false; reqsList.push(`RF Score ≥ ${item.requiredRoleFocusScore}`); } if (item.requiredRoleFocusScoreBelow !== undefined && (userScores.RF ?? 0) >= item.requiredRoleFocusScoreBelow) { otherReqsMet = false; reqsList.push(`RF Score < ${item.requiredRoleFocusScoreBelow}`); } if (item.requiredFocusConceptIds) { for (const reqId of item.requiredFocusConceptIds) { if (!userFocus.has(reqId)) { otherReqsMet = false; const c = concepts.find(c=>c.id === reqId); reqsList.push(c ? `Focus: ${c.name}` : `Focus: ID ${reqId}`); } } } if (item.requiredFocusConceptTypes) { for (const typeReq of item.requiredFocusConceptTypes) { let typeMet = false; for (const fId of userFocus) { const c = discoveredMap.get(fId)?.concept; if (c?.cardType === typeReq) { typeMet = true; break; } } if (!typeMet) { otherReqsMet = false; reqsList.push(`Focus Type: ${typeReq}`); } } } if (!otherReqsMet) { requiresText = `<small class="req-missing">Requires: ${reqsList.join(', ')}</small>`; } if (!completed) { const buttonDisabled = !otherReqsMet || !canAfford; const buttonTitle = completed ? "Already Completed" : (!otherReqsMet ? "Requirements not met" : (!canAfford ? `Requires ${cost.toFixed(1)} Insight` : `Attempt Experiment`)); const actionLabel = `Attempt (${cost.toFixed(1)})`; actionsHTML = `<div class="repo-actions">${requiresText}<button class="button tiny-button btn" data-experiment-id="${item.id}" ${buttonDisabled ? 'disabled' : ''} title="${buttonTitle}"><i class="fas fa-vial"></i> ${actionLabel}</button></div>`; } break; case 'insight': title = `<i class="fas fa-lightbulb" style="color: ${color};"></i> Elemental Insight (${Utils.getElementShortName(elementKeyToFullName[item.element])})`; description = `<em>"${item.text}"</em>`; break; case 'focusUnlock': title = `<i class="fas fa-link" style="color: ${color};"></i> Focus Discovery: ${item.unlocks?.name || 'Item'}`; description = item.description || ''; break; default: title = item.name || 'Unknown Item'; } li.innerHTML = `<h4>${title}</h4><p>${description}</p>${actionsHTML}`; return li; }

// --- Milestones UI ---

/** Displays the list of achieved milestones. */
export function displayMilestones() { if (!milestonesDisplay) { console.warn("Milestones display element not found."); return; } milestonesDisplay.innerHTML = ''; const achieved = State.getAchievedMilestones(); const allMilestones = milestones; // From data.js
    if (!allMilestones) { milestonesDisplay.innerHTML = '<li>Error loading milestone data.</li>'; return; } let achievedCount = 0; allMilestones.forEach(m => { if(!m) return; // Skip invalid milestone entries
        const li = document.createElement('li'); const isAchieved = achieved.has(m.id); li.classList.toggle('completed', isAchieved); li.innerHTML = `<i class="fas ${isAchieved ? 'fa-award' : 'fa-times-circle'}" style="color: ${isAchieved ? 'var(--success-color)' : 'var(--text-muted-color)'}; margin-right: 8px;"></i> ${m.description || `Milestone ${m.id}`}`; if (isAchieved) achievedCount++; milestonesDisplay.appendChild(li); }); if (achievedCount === 0) { milestonesDisplay.innerHTML = '<li>No milestones achieved yet. Keep exploring!</li>'; } }

// --- Rituals Display (Targets Repository) ---

/** Displays the daily and focus rituals in the Repository. */
export function displayDailyRituals() { if (!dailyRitualsDisplayRepo) { console.warn("Daily rituals display element not found."); return; } const currentState = State.getState(); const completedRitualsData = currentState.completedRituals || { daily: {} }; const completedToday = completedRitualsData.daily || {}; const focused = currentState.focusedConcepts; const scores = currentState.userScores; // Include RF score
    dailyRitualsDisplayRepo.innerHTML = ''; let displayedRitualCount = 0; // --- Display Standard Daily Rituals ---
    if (dailyRituals && Array.isArray(dailyRituals)) { dailyRituals.forEach(ritual => { if (!ritual?.id || !ritual.track) return; // Basic validation
        const completedData = completedToday[ritual.id] || { completed: false, progress: 0 }; const track = ritual.track; const requiredCount = track.count || 1; const isComplete = completedData.completed || (track.count && completedData.progress >= requiredCount); const li = document.createElement('li'); li.classList.toggle('completed', isComplete); let progressText = ''; if (requiredCount > 1) { progressText = ` (${completedData.progress}/${requiredCount})`; } let rewardText = ''; if (ritual.reward) { if (ritual.reward.type === 'insight') rewardText = ` (+${ritual.reward.amount} <i class="fas fa-brain insight-icon"></i>)`; else if (ritual.reward.type === 'attunement') rewardText = ` (+${ritual.reward.amount} Att.)`; } li.innerHTML = `${ritual.description}${progressText}<span class="ritual-reward">${rewardText}</span>`; dailyRitualsDisplayRepo.appendChild(li); displayedRitualCount++; }); } // --- Display Active Focus Rituals ---
    if (focusRituals && Array.isArray(focusRituals)) { focusRituals.forEach(ritual => { if (!ritual?.id || !ritual.track) return; // Basic validation
        let focusMet = true; if (ritual.requiredFocusIds) { for (const id of ritual.requiredFocusIds) { if (!focused.has(id)) { focusMet = false; break; } } } // Check RF score requirement (above)
            if (focusMet && ritual.requiredRoleFocusScore !== undefined && (scores.RF ?? 0) < ritual.requiredRoleFocusScore) { focusMet = false; } // Check RF score requirement (below)
            if (focusMet && ritual.requiredRoleFocusScoreBelow !== undefined && (scores.RF ?? 0) >= ritual.requiredRoleFocusScoreBelow) { focusMet = false; } if (focusMet) { const completedData = completedToday[ritual.id] || { completed: false, progress: 0 }; const track = ritual.track; const requiredCount = track.count || 1; const isComplete = completedData.completed || (track.count && completedData.progress >= requiredCount); const li = document.createElement('li'); li.classList.add('focus-ritual'); li.classList.toggle('completed', isComplete); let progressText = ''; if (requiredCount > 1) { progressText = ` (${completedData.progress}/${requiredCount})`; } let rewardText = ''; if (ritual.reward) { if (ritual.reward.type === 'insight') rewardText = ` (+${ritual.reward.amount} <i class="fas fa-brain insight-icon"></i>)`; else if (ritual.reward.type === 'attunement') rewardText = ` (+${ritual.reward.amount} Att.)`; } li.innerHTML = `${ritual.description}${progressText}<span class="ritual-reward">${rewardText}</span>`; dailyRitualsDisplayRepo.appendChild(li); displayedRitualCount++; } }); } if (displayedRitualCount === 0) { dailyRitualsDisplayRepo.innerHTML = '<li>No active rituals.</li>'; } }

// --- Tapestry Deep Dive / Resonance Chamber UI ---

/** Displays the Tapestry Deep Dive modal with analysis data. */
export function displayTapestryDeepDive(analysis) { if (!tapestryDeepDiveModal || !deepDiveNarrativeP || !deepDiveFocusIcons || !deepDiveAnalysisNodesContainer || !deepDiveDetailContent) { console.error("Deep Dive modal elements missing!"); return; } console.log("UI: Displaying Tapestry Deep Dive"); const discovered = State.getDiscoveredConcepts(); // Populate Summary Narrative
    deepDiveNarrativeP.innerHTML = analysis?.fullNarrativeHTML || "Analysis unavailable."; // Added null check
    // Populate Focus Icons
    deepDiveFocusIcons.innerHTML = ''; const focused = State.getFocusedConcepts(); focused.forEach(id => { const conceptData = discovered.get(id)?.concept; if (conceptData) { const iconSpan = document.createElement('span'); iconSpan.classList.add('deep-dive-focus-icon'); const elementNameKey = elementKeyToFullName?.[conceptData.primaryElement]; if (!elementNameKey) { console.warn(`Missing element name for primary element ${conceptData.primaryElement}`); return; } const color = Utils.getElementColor(elementNameKey); const icon = Utils.getElementIcon(elementNameKey); iconSpan.innerHTML = `<i class="${icon}" style="color: ${color};"></i>`; iconSpan.title = `${conceptData.name} (${Utils.getElementShortName(elementDetails?.[elementNameKey]?.name || elementNameKey)})`; deepDiveFocusIcons.appendChild(iconSpan); } }); // Reset Node States & Content
    deepDiveAnalysisNodesContainer.querySelectorAll('.aspect-node').forEach(btn => btn.classList.remove('active')); deepDiveDetailContent.innerHTML = '<p><i>Select an Aspect to explore...</i></p>'; updateContemplationButtonState(); // Update contemplation button state
    // Show Modal
    tapestryDeepDiveModal.classList.remove('hidden'); if (popupOverlay && !(onboardingOverlay && onboardingOverlay.classList.contains('visible'))) { popupOverlay.classList.remove('hidden'); } }
/** Displays synergy/tension details in the Deep Dive panel. */
export function displaySynergyTensionInfo(analysis) { if (!tapestryDeepDiveModal || !deepDiveDetailContent || !deepDiveAnalysisNodesContainer) { console.warn("Cannot display Synergy/Tension, elements missing."); return; } // Ensure modal is visible first
    if (tapestryDeepDiveModal.classList.contains('hidden')) { showTapestryDeepDive(); } // Show modal if not already visible
    // Activate the Synergy node
    deepDiveAnalysisNodesContainer.querySelectorAll('.aspect-node').forEach(btn => btn.classList.remove('active')); const synergyNode = deepDiveAnalysisNodesContainer.querySelector('[data-node-id="synergy"]'); if (synergyNode) synergyNode.classList.add('active'); // Generate and display content
    let content = `<h4>Synergy & Tension</h4>`; if (analysis?.synergies?.length > 0) { content += `<h5>Synergies Found:</h5><ul>${analysis.synergies.map(s => `<li>${s.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}</ul><hr class="popup-hr">`; } else { content += `<p><em>No direct synergies detected between focused concepts.</em></p><hr class="popup-hr">`; } if (analysis?.tensions?.length > 0) { content += `<h5>Tensions Noted:</h5><ul>${analysis.tensions.map(t => `<li>${t.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}</ul>`; } else { content += `<p><em>No significant elemental tensions detected within the focus.</em></p>`; } deepDiveDetailContent.innerHTML = content; }

/** Updates the content area of the deep dive modal. */
export function updateDeepDiveContent(htmlContent, activeNodeId) { if (!deepDiveDetailContent || !deepDiveAnalysisNodesContainer) { console.warn("Cannot update deep dive content, elements missing."); return; } deepDiveDetailContent.innerHTML = htmlContent; // Update button active states
    deepDiveAnalysisNodesContainer.querySelectorAll('.aspect-node').forEach(btn => { btn.classList.toggle('active', btn.dataset.nodeId === activeNodeId); }); deepDiveDetailContent.scrollTop = 0; // Scroll to top of new content
}
/** Displays the contemplation task in the Deep Dive modal. */
export function displayContemplationTask(task) { if (!deepDiveDetailContent || !task) { console.warn("Cannot display contemplation task, element or task data missing."); return; } let content = `<h4>Focusing Lens</h4><p>${task.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`; if (task.requiresCompletionButton) { let rewardText = ""; if (task.reward?.type === 'insight') { rewardText = `+${task.reward.amount || '?'} Insight`; } else if (task.reward?.type === 'attunement') { rewardText = `+${task.reward.amount || '?'} Attunement`; } content += `<button id="completeContemplationBtn" class="button small-button btn">Complete Contemplation (${rewardText})</button>`; } updateDeepDiveContent(content, 'contemplation'); }
/** Clears the contemplation task display area. */
export function clearContemplationTask() { if (!deepDiveDetailContent || !deepDiveAnalysisNodesContainer) return; const contemplationNode = deepDiveAnalysisNodesContainer.querySelector('[data-node-id="contemplation"]'); if (contemplationNode?.classList.contains('active')) { // Only clear if contemplation was active
        deepDiveDetailContent.innerHTML = '<p><i>Select an Aspect to explore...</i></p>'; contemplationNode.classList.remove('active'); } }

// --- Initial UI Setup Helper ---
/** Sets up the initial state of the UI on load. */
export function setupInitialUI() { console.log("UI: Setting up initial UI state");
    // Hide screens by default, show welcome or resume Q
    screens.forEach(s => s?.classList.add('hidden', 'current')); // Ensure both are removed initially
    getElement('welcomeScreen')?.classList.remove('hidden'); // Welcome is default starting point
    getElement('welcomeScreen')?.classList.add('current'); // Explicitly set welcome as current initially

    // Hide drawer initially
    if (sideDrawer) sideDrawer.setAttribute('aria-hidden', 'true');
    else { console.warn("Side drawer element not found during initial setup."); }
    if (drawerToggle) drawerToggle.setAttribute('aria-expanded', 'false');
    else { console.warn("Drawer toggle button not found during initial setup."); }

    // Check for saved game to enable Load button
    if (loadButton) { loadButton.classList.toggle('hidden', !localStorage.getItem(Config.SAVE_KEY)); }
    else { console.warn("Load button element not found during initial setup."); }

    // Set initial state for Persona action buttons
    updateSuggestSceneButtonState();
    updateElementalDilemmaButtonState();
    updateExploreSynergyButtonStatus('none');
    updateInsightBoostButtonState();
    populateGrimoireFilters(); // Populate dropdowns early
    updateDrawerLinks(); // Ensure drawer links are correct initially

    // Apply theme
    if (localStorage.getItem('theme') === 'dark') { document.documentElement.classList.add('dark'); } else { document.documentElement.classList.remove('dark'); }

    // Wire up skip tour button listener (inside onboarding popup)
    if (skipTourBtn) {
        skipTourBtn.addEventListener('click', () => {
            console.log("UI: Skip current tour button clicked.");
            hideOnboarding(); // Hide the overlay
            State.setOnboardingPhase(99); // Mark onboarding as skipped/complete in state
        });
    } else { console.warn("Skip Tour button (#skipTourBtn) not found."); }

    // Wire up help button listener (in main UI)
     if (helpBtn) {
         helpBtn.addEventListener('click', () => {
             const currentScreenId = document.querySelector('.screen.current')?.id || 'welcomeScreen';
             console.log(`UI: Help button clicked on screen: ${currentScreenId}`);
             State.setOnboardingPhase(1); // Set state to restart tour at phase 1
             showOnboarding(1, currentScreenId); // Show phase 1 of the relevant tour
         });
     } else { console.warn("Help button (#helpBtn) not found."); }
}


// --- Onboarding UI ---
/** Displays the onboarding popup for a specific phase and screen context. */
export function showOnboarding(phase, currentScreenId) {
    if (!onboardingOverlay || !onboardingPopup || !onboardingContent || !onboardingProgressSpan || !onboardingTitle || !onboardingPrevButton || !onboardingNextButton || !onboardingSkipButton || !skipTourBtn || !onboardingHighlight) {
        console.error("Onboarding UI elements missing! Cannot show onboarding. Aborting.");
        if (typeof State !== 'undefined' && State.markOnboardingComplete) State.markOnboardingComplete();
        hideOnboarding();
        return;
    }
    if (phase <= 0 || State.isOnboardingComplete()) { // Check if already complete/skipped
        hideOnboarding();
        return;
    }

    const tourTasks = getTourForScreen(currentScreenId); // Get tasks for the current screen
    const task = tourTasks.find(t => t.phaseRequired === phase);

    if (!task) {
        console.warn(`Onboarding task for phase ${phase} on screen ${currentScreenId} not found. Hiding onboarding.`);
        hideOnboarding();
        return;
    }
    console.log(`UI: Showing onboarding phase ${phase} for tour '${currentScreenId}'`);

    // Set Tour Title
    let tourTitle = "Orientation";
    if (currentScreenId === 'workshopScreen') tourTitle = "Workshop Tour";
    else if (currentScreenId === 'repositoryScreen') tourTitle = "Repository Tour";
    if (onboardingTitle) onboardingTitle.textContent = tourTitle;

    const taskText = task.description || task.text || 'Follow the instructions...'; // Use description first
    onboardingContent.innerHTML = `<p>${taskText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
    if (task.hint) { onboardingContent.innerHTML += `<p><small><em>Hint: ${task.hint}</em></small></p>`; }

    // Update Progress Indicator (within the current tour)
    const totalStepsInTour = tourTasks.length;
    const tourProgressDisplay = getElement('tourProgress'); // Get the dedicated tour progress element
    if(tourProgressDisplay) tourProgressDisplay.textContent = `${phase}/${totalStepsInTour}`;
    onboardingProgressSpan.textContent = `Step ${phase} of ${totalStepsInTour}`; // Keep old one for now? Or remove?

    onboardingPrevButton.disabled = (phase === 1);
    // Update Next button text based on whether it's the last step of the *current* tour
    onboardingNextButton.textContent = (phase === totalStepsInTour) ? "Finish Tour" : "Next";

    onboardingOverlay.classList.add('visible');
    onboardingOverlay.classList.remove('hidden');
    onboardingPopup.classList.remove('hidden');
    onboardingOverlay.removeAttribute('aria-hidden');
    if(popupOverlay) popupOverlay.classList.add('hidden'); // Hide standard overlay

    // Use requestAnimationFrame to ensure layout is calculated before highlighting
    requestAnimationFrame(() => {
        updateOnboardingHighlight(task.highlightElementId);
    });
}
/** Hides the onboarding overlay and popup. */
export function hideOnboarding() {
     if (onboardingOverlay) { onboardingOverlay.classList.remove('visible'); onboardingOverlay.classList.add('hidden'); onboardingOverlay.setAttribute('aria-hidden', 'true'); }
     else { console.warn("Onboarding overlay missing for hide."); }
     if (onboardingPopup) { onboardingPopup.classList.add('hidden'); }
     else { console.warn("Onboarding popup missing for hide."); }
     if (onboardingHighlight) { onboardingHighlight.style.display = 'none'; }
     else { console.warn("Onboarding highlight missing for hide."); }
     updateDrawerLinks(); // Ensure correct links shown after onboarding hides
     console.log("UI: Onboarding hidden.");
 }
/** Updates the position and visibility of the onboarding highlight element. */
function updateOnboardingHighlight(elementId) {
     if (!onboardingHighlight) { console.warn("Onboarding highlight element missing"); return; }
     const targetElement = elementId ? getElement(elementId) : null;
     if (targetElement && targetElement.offsetParent !== null) { // Check if element is visible
         const rect = targetElement.getBoundingClientRect();
         onboardingHighlight.style.left = `${rect.left - 5 + window.scrollX}px`;
         onboardingHighlight.style.top = `${rect.top - 5 + window.scrollY}px`;
         onboardingHighlight.style.width = `${rect.width + 10}px`;
         onboardingHighlight.style.height = `${rect.height + 10}px`;
         onboardingHighlight.style.display = 'block'; // Ensure it's block, not flex
         // Smooth scroll with check for reduced motion
         const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
         targetElement.scrollIntoView({ behavior: mediaQuery.matches ? 'auto' : 'smooth', block: 'center', inline: 'nearest' });
         console.log(`UI: Highlighting element: #${elementId}`);
     } else {
         onboardingHighlight.style.display = 'none';
         if(elementId) console.log(`UI: Cannot highlight hidden/missing element: #${elementId}`);
     }
 }

// --- Update Note Save Status ---
/** Displays a temporary status message after saving a note. */
export function updateNoteSaveStatus(message, isError = false) {
    if (noteSaveStatusSpan) {
        noteSaveStatusSpan.textContent = message;
        noteSaveStatusSpan.className = 'note-status'; // Reset classes
        if (isError) noteSaveStatusSpan.classList.add('error');
        // Clear message after a delay
        setTimeout(() => { if(noteSaveStatusSpan) noteSaveStatusSpan.textContent = ""; }, 2500);
    } else { console.warn("Note save status span not found."); }
}

// --- Theme Toggle ---
/** Handles the theme toggle action */
export function toggleTheme() {
    const root = document.documentElement;
    root.classList.toggle('dark');
    const currentTheme = root.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    console.log(`Theme set to: ${currentTheme}`);
    // Redraw chart if visible, as colors change
    if (personaSummaryView?.classList.contains('current')) {
        drawPersonaChart(State.getScores());
    }
}

// --- Element Deep Dive Display ---
/** Displays the Element Deep Dive content within an accordion body. */
export function displayElementDeepDive(elementKey, container) {
    if (!container) {
        console.warn(`Deep dive container missing for element ${elementKey}`);
        return;
    }
    const unlockedLevel = State.getState().unlockedDeepDiveLevels[elementKey] || 0;
    const elementNameKey = elementKeyToFullName[elementKey]; // Convert 'A' -> 'Attraction' etc.
    if (!elementNameKey) {
         console.warn(`UI displayElementDeepDive: Element name key not found for key: ${elementKey}`);
         container.innerHTML = '<p><i>Error: Element data not found.</i></p>';
         return;
    }
    const deepDiveLevels = elementDeepDive[elementNameKey] || []; // Get data using name key

    container.innerHTML = `<h6><i class="fas fa-book-open"></i> Element Insights</h6>`; // Add header

    if (deepDiveLevels.length === 0) {
        container.innerHTML += '<p><i>No deep dive insights defined for this element.</i></p>';
        return;
    }

    deepDiveLevels.forEach(levelData => {
        if (!levelData || typeof levelData.level !== 'number') {
             console.warn(`Invalid level data found for ${elementNameKey}:`, levelData);
             return; // Skip invalid level data
        }
        const levelDiv = document.createElement('div');
        levelDiv.classList.add('deep-dive-level');

        if (levelData.level <= unlockedLevel) {
            // Display unlocked level content
            levelDiv.classList.add('unlocked');
            levelDiv.innerHTML = `
                <h6><i class="fas fa-lock-open"></i> Level ${levelData.level}: ${levelData.title || ''}</h6>
                <p>${levelData.content || ''}</p>
            `;
        } else if (levelData.level === unlockedLevel + 1) {
            // Display the next unlockable level with a button
            levelDiv.classList.add('locked');
            const cost = levelData.insightCost || Config.LORE_UNLOCK_COSTS[`level${levelData.level}`] || 999; // Use Insight cost from data, fallback if needed
            const canAfford = State.getInsight() >= cost;
            const errorMsg = canAfford ? '' : `<span class="unlock-error">Requires ${cost.toFixed(1)} Insight</span>`;
            levelDiv.innerHTML = `
                <h6><i class="fas fa-lock"></i> Level ${levelData.level}: ${levelData.title || 'Next Insight'}</h6>
                <button class="button tiny-button unlock-button btn"
                        data-element-key="${elementKey}"
                        data-level="${levelData.level}"
                        data-cost="${cost}"
                        ${canAfford ? '' : 'disabled'}
                        title="${canAfford ? `Unlock for ${cost.toFixed(1)} Insight` : `Requires ${cost.toFixed(1)} Insight`}">
                    Unlock (${cost.toFixed(1)} <i class="fas fa-brain insight-icon"></i>)
                </button>
                ${errorMsg}
            `;
        } else {
            // Future locked levels (don't show button, appear greyed out)
            levelDiv.classList.add('locked');
            levelDiv.innerHTML = `<h6><i class="fas fa-lock"></i> Level ${levelData.level} (Locked)</h6>`;
            levelDiv.style.opacity = '0.6';
        }
        container.appendChild(levelDiv);
    });
    // Note: Event listeners for unlock buttons are handled centrally in main.js setupPersonaScreenListeners
}


/** Updates the state of the contemplation button in the Deep Dive modal. */
export function updateContemplationButtonState() {
    const btn = document.getElementById('contemplationNode');
    if (!btn) { /*console.warn("Contemplation button not found for state update.");*/ return; } // Might not be rendered
    const costDisplay = btn.querySelector('.contemplation-cost');
    if (costDisplay) costDisplay.textContent = Config.CONTEMPLATION_COST;

    const cooldownEnd = State.getContemplationCooldownEnd?.() ?? null;
    const now = Date.now();

    if (contemplationTimeoutId) clearTimeout(contemplationTimeoutId); // Clear previous timer

    if (cooldownEnd && now < cooldownEnd) {
        const remaining = Math.ceil((cooldownEnd - now) / 1000);
        btn.disabled = true;
        btn.title = `Contemplation cooling down (${remaining}s)`;
        // Optionally update text visually - Find the text node after the icon
        const icon = btn.querySelector('i.fa-brain');
        if (icon && icon.nextSibling && icon.nextSibling.nodeType === Node.TEXT_NODE) {
            icon.nextSibling.textContent = ` Focusing Lens (${remaining}s)`;
        }
        contemplationTimeoutId = setTimeout(updateContemplationButtonState, 1000); // Check again in 1s
    } else {
        const canAfford = State.getInsight() >= Config.CONTEMPLATION_COST;
        btn.disabled = !canAfford;
        btn.title = canAfford ? `Begin focused contemplation (Cost: ${Config.CONTEMPLATION_COST} Insight)` : `Requires ${Config.CONTEMPLATION_COST} Insight`;
        // Reset text
        const icon = btn.querySelector('i.fa-brain');
        if (icon && icon.nextSibling && icon.nextSibling.nodeType === Node.TEXT_NODE) {
            // Find the span for cost and reconstruct the text content correctly
            const costSpan = btn.querySelector('.contemplation-cost');
            const insightIconHTML = '<i class="fas fa-brain insight-icon"></i>';
            if (costSpan) {
                 // Need to reconstruct the innerHTML carefully to keep elements
                 btn.innerHTML = `<i class="fas fa-brain" aria-hidden="true"></i> Focusing Lens (${costSpan.outerHTML} ${insightIconHTML})`;
            } else {
                 // Fallback if span is missing
                 btn.innerHTML = `<i class="fas fa-brain" aria-hidden="true"></i> Focusing Lens (${Config.CONTEMPLATION_COST} ${insightIconHTML})`;
            }
        }
    }
}


/** Displays the Elemental Dilemma modal. */
export function displayElementalDilemma(dilemmaData) {
    const situation = getElement('dilemmaSituationText'); // Define locally
    const question = getElement('dilemmaQuestionText');
    const slider = getElement('dilemmaSlider');
    const minLabel = getElement('dilemmaSliderMinLabel');
    const maxLabel = getElement('dilemmaSliderMaxLabel');
    const valueDisplay = getElement('dilemmaSliderValueDisplay');
    const nudgeCheck = getElement('dilemmaNudgeCheckbox');

    if (!dilemmaModal || !situation || !question || !slider || !minLabel || !maxLabel || !valueDisplay || !nudgeCheck) {
        console.error("Dilemma modal elements missing!");
        return;
    }

    situation.textContent = dilemmaData?.situation ?? 'Dilemma situation missing.';
    question.textContent = dilemmaData?.question ?? 'Dilemma question missing.';
    minLabel.textContent = dilemmaData?.sliderMinLabel ?? 'Option A';
    maxLabel.textContent = dilemmaData?.sliderMaxLabel ?? 'Option B';

    // Reset slider and display
    slider.value = 5;
    valueDisplay.textContent = 'Balanced';
    nudgeCheck.checked = false; // Default nudge off

    dilemmaModal.classList.remove('hidden');
    // Show the main overlay if onboarding isn't active
    const onboardingActive = onboardingOverlay && onboardingOverlay.classList.contains('visible');
    if (popupOverlay && !onboardingActive) {
        popupOverlay.classList.remove('hidden');
    }
    console.log(`UI: Displaying dilemma ${dilemmaData?.id}`);
}


/** Shows the settings popup. */
export function showSettings() {
     if (settingsPopup) {
         settingsPopup.classList.remove('hidden');
         // Show the main overlay if onboarding isn't active
         const onboardingActive = onboardingOverlay && onboardingOverlay.classList.contains('visible');
         if (popupOverlay && !onboardingActive) {
             popupOverlay.classList.remove('hidden');
         }
         console.log("UI: Showing Settings Popup");
     } else {
         console.error("Settings popup element not found!");
     }
}

/**
 * Shows a hint bubble near a target element, only once per hint ID.
 * @param {string} id Unique ID for this hint (used for localStorage)
 * @param {string} targetSelector CSS selector for the element to point to
 * @param {string} html Content for the hint bubble
 */
export function showHintOnce(id, targetSelector, html){
    if(localStorage.getItem('hint.'+id)) return; // Already seen
    const target = document.querySelector(targetSelector);
    if(!target || target.offsetParent === null) { // Don't show if target hidden
        console.warn(`Hint target '${targetSelector}' not found or hidden.`);
        return;
    }

    // Close any existing hint bubbles first
    document.querySelectorAll('.hint-bubble').forEach(b => b.remove());

    const bubble = document.createElement('div');
    bubble.className = 'hint-bubble';
    bubble.innerHTML = html + '<span class="hint-close" title="Dismiss Hint">✕</span>';
    document.body.append(bubble);

    const r = target.getBoundingClientRect();
    bubble.style.top  = (r.bottom + 8 + window.scrollY) + 'px';
    bubble.style.left = (r.left   + window.scrollX) + 'px';

    bubble.querySelector('.hint-close').onclick = ()=>bubble.remove();
    localStorage.setItem('hint.'+id,'seen'); // Mark as seen
    console.log(`UI: Showing hint bubble: ${id}`);
}


console.log("ui.js loaded successfully. (Enhanced v4.10 + Drawer/Accordion/Layout Fixes - Corrected + Onboarding Tours)");
// --- END OF FILE ui.js ---
