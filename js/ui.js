// --- START OF CORRECTED ui.js (v4.10 + Progress Bar/Accordion) ---

// js/ui.js - User Interface Logic (Enhanced v4)

import * as State from './state.js';
import * as Config from './config.js';
import * as Utils from './utils.js';
import * as GameLogic from './gameLogic.js';
import {
    elementDetails, elementKeyToFullName, // elementNameToKey removed as unreliable
    concepts, questionnaireGuided,
    reflectionPrompts, elementDeepDive, dailyRituals, milestones, focusRituals,
    sceneBlueprints, alchemicalExperiments, elementalInsights, focusDrivenUnlocks,
    cardTypeKeys, elementNames, // Now includes RoleFocus ("Attraction", "Interaction", etc.)
    grimoireShelves, elementalDilemmas, onboardingTasks // Include onboardingTasks
} from '../data.js';

console.log("ui.js loading... (Enhanced v4.10 + Progress Bar/Accordion)");

// --- Helper Function for Image Errors ---
function handleImageError(imgElement) {
    console.warn(`Image failed to load: ${imgElement?.src}. Displaying placeholder.`);
    if (imgElement) {
        imgElement.style.display = 'none'; // Hide broken img
        const placeholder = imgElement.parentElement?.querySelector('.card-visual-placeholder');
        if (placeholder) {
            placeholder.style.display = 'flex'; // Ensure placeholder is visible
            placeholder.title = `Art Placeholder (Load Failed: ${imgElement.src?.split('/')?.pop() || 'unknown'})`;
        }
    }
}
window.handleImageError = handleImageError;


// --- DOM Element References ---
const getElement = (id) => document.getElementById(id);
const saveIndicator = getElement('saveIndicator');
const screens = document.querySelectorAll('.screen');
const welcomeScreen = getElement('welcomeScreen');
const loadButton = getElement('loadButton');
const startGuidedButton = getElement('startGuidedButton');
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
const mainNavBar = getElement('mainNavBar');
const navButtons = document.querySelectorAll('.nav-button');
const settingsButton = getElement('settingsButton');
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
const workshopScreen = getElement('workshopScreen');
const userInsightDisplayWorkshop = getElement('userInsightDisplayWorkshop');
const researchArea = getElement('workshop-research-area');
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
const repositoryScreen = getElement('repositoryScreen');
const repositoryFocusUnlocksDiv = getElement('repositoryFocusUnlocks')?.querySelector('.repo-list');
const repositoryScenesDiv = getElement('repositoryScenes')?.querySelector('.repo-list');
const repositoryExperimentsDiv = getElement('repositoryExperiments')?.querySelector('.repo-list');
const repositoryInsightsDiv = getElement('repositoryInsights')?.querySelector('.repo-list');
const milestonesDisplay = getElement('milestonesDisplay');
const dailyRitualsDisplayRepo = getElement('dailyRitualsDisplayRepo');
const conceptDetailPopup = getElement('conceptDetailPopup');
const popupOverlay = getElement('popupOverlay');
const popupCardTypeIcon = getElement('popupCardTypeIcon');
const popupConceptName = getElement('popupConceptName');
const popupConceptType = getElement('popupConceptType');
const popupVisualContainer = getElement('popupVisualContainer');
const popupBriefDescription = getElement('popupBriefDescription');
const popupDetailedDescription = getElement('popupDetailedDescription');
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
const researchResultsPopup = getElement('researchResultsPopup');
const researchPopupContent = getElement('researchPopupContent');
const closeResearchResultsPopupButton = getElement('closeResearchResultsPopupButton');
const researchPopupStatus = getElement('researchPopupStatus');
const confirmResearchChoicesButton = getElement('confirmResearchChoicesButton');
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
const settingsPopup = getElement('settingsPopup');
const closeSettingsPopupButton = getElement('closeSettingsPopupButton');
const forceSaveButton = getElement('forceSaveButton');
const resetAppButton = getElement('resetAppButton');
const tapestryDeepDiveModal = getElement('tapestryDeepDiveModal');
const deepDiveTriggerButton = getElement('deepDiveTriggerButton');
const deepDiveTitle = getElement('deepDiveTitle');
const closeDeepDiveButton = getElement('closeDeepDiveButton');
const deepDiveNarrativeP = getElement('deepDiveNarrativeP');
const deepDiveFocusIcons = getElement('deepDiveFocusIcons');
const deepDiveAnalysisNodesContainer = getElement('deepDiveAnalysisNodes');
const deepDiveDetailContent = getElement('deepDiveDetailContent');
const contemplationNodeButton = getElement('contemplationNode');
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
const infoPopupElement = getElement('infoPopup');
const infoPopupContent = getElement('infoPopupContent');
const closeInfoPopupButton = getElement('closeInfoPopupButton');
const confirmInfoPopupButton = getElement('confirmInfoPopupButton');
const milestoneAlert = getElement('milestoneAlert');
const milestoneAlertText = getElement('milestoneAlertText');
const toastElement = getElement('toastNotification');
const toastMessageElement = getElement('toastMessage');
const grimoireCountSpan = getElement('grimoireCount');
// Onboarding Elements
const onboardingOverlay = getElement('onboardingOverlay');
const onboardingPopup = getElement('onboardingPopup');
const onboardingContent = getElement('onboardingContent');
const onboardingProgressSpan = getElement('onboardingProgress');
const onboardingPrevButton = getElement('onboardingPrevButton');
const onboardingNextButton = getElement('onboardingNextButton');
const onboardingSkipButton = getElement('onboardingSkipButton');
const onboardingHighlight = getElement('onboardingHighlight');

// --- Module-level Variables ---
let personaChartInstance = null;
let toastTimeout = null;
let milestoneTimeout = null;
let insightBoostTimeoutId = null;
let previousScreenId = 'welcomeScreen';

// --- Utility UI Functions ---
export function showTemporaryMessage(message, duration = Config.TOAST_DURATION, isGuidance = false) { if (!toastElement || !toastMessageElement) { console.warn("Toast elements missing:", message); return; } console.info(`Toast: ${message}`); toastMessageElement.textContent = message; toastElement.classList.toggle('guidance-toast', isGuidance); if (toastTimeout) clearTimeout(toastTimeout); toastElement.classList.remove('hidden', 'visible'); void toastElement.offsetWidth; toastElement.classList.add('visible'); toastElement.classList.remove('hidden'); toastTimeout = setTimeout(() => { toastElement.classList.remove('visible'); setTimeout(() => { if (toastElement && !toastElement.classList.contains('visible')) { toastElement.classList.add('hidden'); } }, 500); toastTimeout = null; }, duration); }
export function showMilestoneAlert(text) { if (!milestoneAlert || !milestoneAlertText) return; milestoneAlertText.textContent = `Milestone: ${text}`; milestoneAlert.classList.remove('hidden'); if (milestoneTimeout) clearTimeout(milestoneTimeout); milestoneTimeout = setTimeout(hideMilestoneAlert, Config.MILESTONE_ALERT_DURATION); }
export function hideMilestoneAlert() { if (milestoneAlert) milestoneAlert.classList.add('hidden'); if (milestoneTimeout) clearTimeout(milestoneTimeout); milestoneTimeout = null; }
export function hidePopups() { console.log("UI: hidePopups called"); let researchPopupIsOpenAndPending = false; if (researchResultsPopup && !researchResultsPopup.classList.contains('hidden')) { const pendingItems = researchPopupContent?.querySelectorAll('.research-result-item[data-processed="false"], .research-result-item[data-choice-made="pending_dissonance"]'); if (pendingItems && pendingItems.length > 0) { researchPopupIsOpenAndPending = true; console.log(`UI: Keeping research results popup open (${pendingItems.length} items pending).`); } } document.querySelectorAll('.popup:not(.onboarding-popup)').forEach(popup => { if (!(popup.id === 'researchResultsPopup' && researchPopupIsOpenAndPending)) { popup.classList.add('hidden'); } }); const anyGeneralPopupVisible = document.querySelector('.popup:not(.hidden):not(.onboarding-popup)'); const onboardingActive = onboardingOverlay && !onboardingOverlay.classList.contains('hidden'); if (!anyGeneralPopupVisible && popupOverlay && !onboardingActive) { popupOverlay.classList.add('hidden'); if (typeof GameLogic !== 'undefined' && GameLogic.clearPopupState) { GameLogic.clearPopupState(); console.log("UI: All general popups hidden, cleared popup state."); } } else if (anyGeneralPopupVisible) { console.log("UI: Some general popups remain visible, overlay kept."); } else if (onboardingActive) { console.log("UI: Onboarding is visible, main popup overlay remains hidden."); popupOverlay?.classList.add('hidden'); } }
export function showInfoPopup(message) { if (infoPopupElement && infoPopupContent) { infoPopupContent.textContent = message; infoPopupElement.classList.remove('hidden'); const onboardingActive = onboardingOverlay && !onboardingOverlay.classList.contains('hidden'); if (popupOverlay && !onboardingActive) { popupOverlay.classList.remove('hidden'); } } else { console.error("Info popup elements not found."); showTemporaryMessage("Error displaying info.", 2000); } }


// --- Screen Management ---
export function showScreen(screenId) {
    console.log(`UI: Attempting to show screen: ${screenId}`);
    const currentState = State.getState();
    const isPostQuestionnaire = currentState.questionnaireCompleted;
    const onboardingComplete = currentState.onboardingComplete;

    const targetScreenElement = getElement(screenId);
    if (!targetScreenElement) {
        console.error(`UI Error: Screen element with ID '${screenId}' not found! Falling back to welcome.`);
        getElement('welcomeScreen')?.classList.remove('hidden');
        getElement('welcomeScreen')?.classList.add('current');
        screenId = 'welcomeScreen'; // Update screenId to reflect fallback
    } else {
        screens.forEach(screen => { if (screen) { screen.classList.add('hidden'); screen.classList.remove('current'); } });
        targetScreenElement.classList.remove('hidden');
        targetScreenElement.classList.add('current');
        console.log(`UI: Screen ${screenId} activated.`);
    }

    if (mainNavBar) {
        const showNav = isPostQuestionnaire && screenId !== 'welcomeScreen' && screenId !== 'questionnaireScreen';
        mainNavBar.classList.toggle('hidden', !showNav);
        if (showNav) {
            mainNavBar.querySelectorAll('.nav-button, .theme-toggle').forEach(button => { // Include theme toggle
                if (button) {
                    button.classList.toggle('active', button.dataset?.target === screenId); // Check dataset exists
                    // Settings and theme toggle always shown when nav is visible
                    const alwaysShow = button.id === 'settingsButton' || button.id === 'themeToggle';
                    const isCoreNav = ['personaScreen', 'workshopScreen', 'repositoryScreen'].includes(button.dataset?.target);
                    const showButtonFlow = isPostQuestionnaire || alwaysShow;
                    button.classList.toggle('hidden-by-flow', !showButtonFlow && isCoreNav);
                }
            });
        }
    }

    // Call relevant display logic AFTER the screen is made visible
    switch (screenId) {
        case 'personaScreen': if (isPostQuestionnaire) { const justFinishedQuestionnaire = previousScreenId === 'questionnaireScreen'; if (justFinishedQuestionnaire && personaSummaryView && personaDetailedView) { togglePersonaView(false); } else { if (personaSummaryView?.classList.contains('current')) { displayPersonaSummary(); } else { GameLogic.displayPersonaScreenLogic(); } } displayInsightLog(); } break;
        case 'workshopScreen': if (isPostQuestionnaire) { displayWorkshopScreenContent(); handleFirstGrimoireVisit(); refreshGrimoireDisplay(); } break;
        case 'repositoryScreen': if (isPostQuestionnaire) { displayRepositoryContent(); } break;
        case 'questionnaireScreen': if (!isPostQuestionnaire) { if (currentState.currentElementIndex >= 0 && currentState.currentElementIndex < elementNames.length) { displayElementQuestions(currentState.currentElementIndex); } else { console.warn("Questionnaire screen shown but index is invalid:", currentState.currentElementIndex); initializeQuestionnaireUI(); } } else { console.warn("Attempted to show questionnaire screen after completion."); showScreen('personaScreen'); } break;
        case 'welcomeScreen': break;
    }

    if (['questionnaireScreen', 'workshopScreen', 'personaScreen', 'repositoryScreen'].includes(screenId)) { window.scrollTo(0, 0); }
    previousScreenId = screenId;
}


// --- Insight Display & Log ---
export function updateInsightDisplays() { const insightValue = State.getInsight(); const insight = insightValue.toFixed(1); if (userInsightDisplayPersona) userInsightDisplayPersona.textContent = insight; if (userInsightDisplayWorkshop) userInsightDisplayWorkshop.textContent = insight; updateInsightBoostButtonState(); updateDependentUI(); if (personaScreen?.classList.contains('current') && insightLogContainer && !insightLogContainer.classList.contains('log-hidden')) { displayInsightLog(); } }
function updateDependentUI() { const insightValue = State.getInsight(); if (workshopScreen?.classList.contains('current')) { displayWorkshopScreenContent(); } else if (elementResearchButtonsContainer) { elementResearchButtonsContainer.querySelectorAll('.initial-discovery-element').forEach(button => { if (!button.dataset.isFree || button.dataset.isFree === 'false') { const cost = parseFloat(button.dataset.cost); const canAfford = insightValue >= cost; button.classList.toggle('disabled', !canAfford); button.title = canAfford ? `Research (Cost: ${cost})` : `Requires ${cost} Insight`; button.querySelector('.element-action')?.classList.toggle('disabled', !canAfford); } }); } if (personaScreen?.classList.contains('current')) { updateSuggestSceneButtonState(); personaElementDetailsDiv?.querySelectorAll('.element-deep-dive-container').forEach(container => { const key = container.dataset.elementKey; if (key) displayElementDeepDive(key, container); }); } if (repositoryScreen?.classList.contains('current')) { displayRepositoryContent(); } updateContemplationButtonState(); if (conceptDetailPopup && !conceptDetailPopup.classList.contains('hidden')) { const popupConceptId = GameLogic.getCurrentPopupConceptId(); if (popupConceptId !== null) { popupLoreContent?.querySelectorAll('.unlock-lore-button').forEach(button => { const cost = parseFloat(button.dataset.cost); button.disabled = !(insightValue >= cost); button.title = (insightValue >= cost) ? `Unlock for ${cost} Insight` : `Requires ${cost} Insight`; }); } } if (seekGuidanceButtonWorkshop && guidedReflectionCostDisplayWorkshop) { const cost = Config.GUIDED_REFLECTION_COST; seekGuidanceButtonWorkshop.disabled = insightValue < cost; seekGuidanceButtonWorkshop.title = insightValue >= cost ? `Spend ${cost} Insight for a Guided Reflection.` : `Requires ${cost} Insight.`; } }
export function displayInsightLog() { if (!insightLogContainer) return; const logEntries = State.getInsightLog(); insightLogContainer.innerHTML = '<h5>Recent Insight Changes:</h5>'; if (logEntries.length === 0) { insightLogContainer.innerHTML += '<p><i>No recent changes logged.</i></p>'; return; } logEntries.slice().reverse().forEach(entry => { const entryDiv = document.createElement('div'); entryDiv.classList.add('insight-log-entry'); const amountClass = entry.amount > 0 ? 'log-amount-gain' : 'log-amount-loss'; const sign = entry.amount > 0 ? '+' : ''; entryDiv.innerHTML = ` <span class="log-timestamp">${entry.timestamp}</span> <span class="log-source">${entry.source || 'Unknown Source'}</span> <span class="log-amount ${amountClass}">${sign}${entry.amount.toFixed(1)}</span> `; insightLogContainer.appendChild(entryDiv); }); }
export function updateInsightBoostButtonState() { const btn = getElement('addInsightButton'); if (!btn) return; const cooldownEnd = State.getInsightBoostCooldownEnd(); const now = Date.now(); if (insightBoostTimeoutId) { clearTimeout(insightBoostTimeoutId); insightBoostTimeoutId = null; } if (cooldownEnd && now < cooldownEnd) { const remaining = Math.ceil((cooldownEnd - now) / 1000); btn.disabled = true; btn.innerHTML = `<i class="fas fa-hourglass-half"></i> ${remaining}s`; btn.title = `Insight boost available in ${remaining} seconds.`; insightBoostTimeoutId = setTimeout(updateInsightBoostButtonState, 1000); } else { btn.disabled = false; btn.innerHTML = `<i class="fas fa-plus"></i> Add Insight`; btn.title = `Get an Insight boost (${Config.INSIGHT_BOOST_AMOUNT} Insight, ${Config.INSIGHT_BOOST_COOLDOWN / 60000} min cooldown)`; } }

// --- Questionnaire UI ---
export function initializeQuestionnaireUI() {
    console.log("UI: Initializing Questionnaire UI for 7 Elements");
    State.updateElementIndex(0); // Reset index in state
    updateElementProgressHeader(-1); // Clear header initially
    displayElementQuestions(0); // Display first element
    if (mainNavBar) mainNavBar.classList.add('hidden');
    if (dynamicScoreFeedback) dynamicScoreFeedback.style.display = 'none'; // Hide dynamic feedback initially
    // Set initial progress bar to 0
    document.documentElement.style.setProperty('--progress-pct', '0%');
    console.log("UI: Questionnaire UI initialized.");
}

// --- updateElementProgressHeader: MODIFIED to use .step ---
export function updateElementProgressHeader(activeIndex) {
    if (!elementProgressHeader) return;
    elementProgressHeader.innerHTML = ''; // Clear previous
    // Now iterates through 7 elements defined in data.js
    elementNames.forEach((name, index) => { // name is "Attraction", etc.
        const stepDiv = document.createElement('div');
        stepDiv.classList.add('step'); // Use .step class for new CSS
        const elementData = elementDetails[name] || {}; // Use name as key
        const fullName = elementData.name || name; // Get full name
        const shortName = Utils.getElementShortName(fullName); // Use full name for short name util
        stepDiv.textContent = shortName; // Text inside the step div
        stepDiv.title = fullName; // Full name on hover

        // Add classes based on state (active state handled in displayElementQuestions)
        stepDiv.classList.toggle('completed', index < activeIndex);

        elementProgressHeader.appendChild(stepDiv);
    });
}

// --- displayElementQuestions: MODIFIED to update progress bar & step completion ---
export function displayElementQuestions(index) {
    const actualIndex = State.getState().currentElementIndex;
    const displayIndex = (actualIndex >= 0 && actualIndex < elementNames.length) ? actualIndex : index;
    console.log(`UI: Displaying Qs requested index ${index}, using state index ${displayIndex}`);

    if (displayIndex >= elementNames.length) {
        GameLogic.finalizeQuestionnaire();
        return;
    }

    const elementName = elementNames[displayIndex];
    const elementData = elementDetails[elementName] || {};
    const fullName = elementData.name || elementName;
    const questions = questionnaireGuided[elementName] || [];

    if (!questionContent) { console.error("questionContent element missing!"); return; }

    const elementAnswers = State.getState().userAnswers?.[elementName] || {};

    // Clear previous content and add intro
    questionContent.innerHTML = '';
    let introHTML = `
        <div class="element-intro">
            <h2>${fullName}</h2>
            <p><em>${elementData.coreQuestion || ''}</em></p>
            <p>${elementData.coreConcept || 'Loading...'}</p>
            <p><small><strong>Persona Connection:</strong> ${elementData.personaConnection || ''}</small></p>
        </div>`;
    questionContent.innerHTML = introHTML;

    // Build and append questions
    let questionsHTML = '';
    if (questions.length > 0) {
        questions.forEach(q => {
            let inputHTML = `<div class="question-block" id="block_${q.qId}"><h3 class="question-title">${q.text}</h3><div class="input-container">`;
            const savedAnswer = elementAnswers[q.qId];

            if (q.type === "slider") {
                const sliderValue = (savedAnswer !== undefined && !isNaN(parseFloat(savedAnswer))) ? parseFloat(savedAnswer) : q.defaultValue;
                inputHTML += `
                    <div class="slider-container">
                        <input type="range" id="${q.qId}" class="slider q-input" min="${q.minValue}" max="${q.maxValue}" step="${q.step || 0.5}" value="${sliderValue}" data-question-id="${q.qId}" data-type="slider">
                        <div class="label-container">
                            <span class="label-text">${q.minLabel}</span>
                            <span class="label-text">${q.maxLabel}</span>
                        </div>
                        <p class="value-text">Selected: <span id="display_${q.qId}">${parseFloat(sliderValue).toFixed(1)}</span></p>
                        <p class="slider-feedback" id="feedback_${q.qId}"></p>
                    </div>`;
            } else if (q.type === "radio") {
                inputHTML += `<div class="radio-options">`;
                q.options.forEach(opt => {
                    const checked = savedAnswer === opt.value ? 'checked' : '';
                    inputHTML += `<div class="form-group"><input type="radio" id="${q.qId}_${opt.value}" class="q-input" name="${q.qId}" value="${opt.value}" ${checked} data-question-id="${q.qId}" data-type="radio"><label for="${q.qId}_${opt.value}">${opt.value}</label></div>`;
                });
                inputHTML += `</div>`;
            } else if (q.type === "checkbox") {
                inputHTML += `<div class="checkbox-options">`;
                q.options.forEach(opt => {
                    const checked = Array.isArray(savedAnswer) && savedAnswer.includes(opt.value) ? 'checked' : '';
                    inputHTML += `<div class="form-group"><input type="checkbox" id="${q.qId}_${opt.value}" class="q-input" name="${q.qId}" value="${opt.value}" ${checked} data-question-id="${q.qId}" data-max-choices="${q.maxChoices || 2}" data-type="checkbox"><label for="${q.qId}_${opt.value}">${opt.value}</label></div>`;
                });
                inputHTML += `</div>`;
            }
            inputHTML += `</div></div>`;
            questionsHTML += inputHTML;
        });
    } else {
        questionsHTML = '<p><i>(No specific questions required for this element assessment.)</i></p>';
    }

    questionContent.innerHTML += questionsHTML;

    // Add event listeners
    questionContent.querySelectorAll('.q-input').forEach(input => {
        const eventType = (input.type === 'range') ? 'input' : 'change';
        input.removeEventListener(eventType, GameLogic.handleQuestionnaireInputChange);
        input.addEventListener(eventType, GameLogic.handleQuestionnaireInputChange);
    });
    questionContent.querySelectorAll('input[type="checkbox"].q-input').forEach(checkbox => {
        checkbox.removeEventListener('change', GameLogic.handleCheckboxChange);
        checkbox.addEventListener('change', GameLogic.handleCheckboxChange);
    });
    questionContent.querySelectorAll('.slider.q-input').forEach(slider => {
        updateSliderFeedbackText(slider, elementName);
    });

    // --- Update dynamic score feedback and header/footer ---
    updateDynamicFeedback(elementName, elementAnswers);
    updateElementProgressHeader(displayIndex); // Update text/titles in header
    if (progressText) progressText.textContent = `Element ${displayIndex + 1} / ${elementNames.length}: ${fullName}`;
    if (prevElementButton) prevElementButton.style.visibility = (displayIndex > 0) ? 'visible' : 'hidden';
    if (nextElementButton) nextElementButton.textContent = (displayIndex === elementNames.length - 1) ? "View Initial Discoveries" : "Next Element";

    // --- Calculate and set progress bar percentage & step completion ---
    // Offset by one because displayIndex is 0-based
    const pct = ((displayIndex + 1) / elementNames.length) * 100;
    document.documentElement.style.setProperty('--progress-pct', pct + '%');
    elementProgressHeader?.querySelectorAll('.step').forEach((step, i) => {
        step.classList.toggle('completed', i < displayIndex);
        step.classList.toggle('active', i === displayIndex); // Ensure active state is also set here
    });

    console.log(`UI: Finished displaying questions for ${elementName} at index ${displayIndex}`);
}

export function updateSliderFeedbackText(sliderElement, elementName) {
    if (!sliderElement || sliderElement.type !== 'range') return;
    const qId = sliderElement.dataset.questionId;
    const feedbackElement = getElement(`feedback_${qId}`);
    if (!feedbackElement) return;

    const currentValue = parseFloat(sliderElement.value);
    const display = getElement(`display_${qId}`);
    if(display) display.textContent = currentValue.toFixed(1);

    if (!elementName || !elementDetails[elementName]) {
        console.warn(`updateSliderFeedbackText called without valid elementName: ${elementName}`);
        feedbackElement.textContent = `(Score: ${currentValue.toFixed(1)})`;
        return;
    }
    const interpretations = elementDetails[elementName]?.scoreInterpretations;
    if (!interpretations) {
         console.warn(`Interpretations missing for element: ${elementName}`);
        feedbackElement.textContent = `(Score: ${currentValue.toFixed(1)})`;
        return;
    }
    const scoreLabel = Utils.getScoreLabel(currentValue);
    const interpretationText = interpretations[scoreLabel] || `Interpretation for "${scoreLabel}" not found.`;
    feedbackElement.textContent = interpretationText;
    feedbackElement.title = `Meaning of score ${currentValue.toFixed(1)} (${scoreLabel})`;
}

export function updateDynamicFeedback(elementName, currentAnswers) {
    const elementData = elementDetails?.[elementName];
    if (!elementData || !dynamicScoreFeedback || !feedbackElementSpan || !feedbackScoreSpan || !feedbackScoreBar) {
        if(dynamicScoreFeedback) dynamicScoreFeedback.style.display = 'none';
        return;
    }

    const tempScore = GameLogic.calculateElementScore(elementName, currentAnswers);
    const scoreLabel = Utils.getScoreLabel(tempScore);
    const fullName = elementData.name || elementName;

    feedbackElementSpan.textContent = Utils.getElementShortName(fullName);
    feedbackScoreSpan.textContent = tempScore.toFixed(1);

    let scoreParent = feedbackScoreSpan?.parentNode;
    let labelSpan = scoreParent?.querySelector('.score-label');
    if (!labelSpan && scoreParent) {
        labelSpan = document.createElement('span');
        labelSpan.classList.add('score-label');
        feedbackScoreSpan.parentNode.insertBefore(labelSpan, feedbackScoreSpan.nextSibling);
    }
    if (labelSpan) {
        labelSpan.textContent = ` (${scoreLabel})`;
    } else { console.warn("Could not find/create score label span."); }

    feedbackScoreBar.style.width = `${tempScore * 10}%`;
    dynamicScoreFeedback.style.display = 'block';
}

export function getQuestionnaireAnswers() {
    const answers = {};
    const inputs = questionContent?.querySelectorAll('.q-input');
    if (!inputs) return answers;

    inputs.forEach(input => {
        const qId = input.dataset.questionId;
        const type = input.dataset.type;
        if (!qId) return;

        if (type === 'slider') {
            answers[qId] = parseFloat(input.value);
        } else if (type === 'radio') {
            if (input.checked) {
                answers[qId] = input.value;
            }
        } else if (type === 'checkbox') {
            if (!answers[qId]) {
                answers[qId] = [];
            }
            if (input.checked) {
                answers[qId].push(input.value);
            }
        }
    });
    questionContent?.querySelectorAll('.checkbox-options').forEach(container => {
        const name = container.querySelector('input[type="checkbox"]')?.name;
        if(name && !answers[name]) {
            answers[name] = [];
        }
    });
    return answers;
}


// --- Persona Screen UI ---
export function togglePersonaView(showDetailed) {
    if (personaDetailedView && personaSummaryView && showDetailedViewBtn && showSummaryViewBtn) {
        const detailedIsCurrent = personaDetailedView.classList.contains('current');
        if (showDetailed && !detailedIsCurrent) {
            personaDetailedView.classList.remove('hidden'); personaDetailedView.classList.add('current');
            personaSummaryView.classList.add('hidden'); personaSummaryView.classList.remove('current');
            showDetailedViewBtn.classList.add('active'); showSummaryViewBtn.classList.remove('active');
            GameLogic.displayPersonaScreenLogic();
            displayInsightLog();
        } else if (!showDetailed && detailedIsCurrent) {
            personaSummaryView.classList.remove('hidden'); personaSummaryView.classList.add('current');
            personaDetailedView.classList.add('hidden'); personaDetailedView.classList.remove('current');
            showSummaryViewBtn.classList.add('active'); showDetailedViewBtn.classList.remove('active');
            displayPersonaSummary();
        }
    } else {
        console.error("Persona view toggle elements missing.");
    }
}

// --- displayPersonaScreen: MODIFIED to use <details> for elaboration/examples ---
export function displayPersonaScreen() {
    if (!personaElementDetailsDiv) { console.error("Persona element details div not found!"); return; }
    console.log("UI: Displaying Persona Screen (7 Elements)");
    personaElementDetailsDiv.innerHTML = ''; // Clear previous details
    const scores = State.getScores();
    const showDeepDiveContainer = State.getState().questionnaireCompleted;

    elementNames.forEach(elementNameKey => { // "Attraction", etc.
        const key = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === elementNameKey);
        const elementData = elementDetails[elementNameKey];
        if (!key || !elementData) {
            console.warn(`UI displayPersonaScreen: Could not find key or data for element name key: ${elementNameKey}`);
            return;
        }

        const fullName = elementData.name || elementNameKey;
        const score = (scores[key] !== undefined && typeof scores[key] === 'number' && !isNaN(scores[key])) ? scores[key] : 5.0;
        const scoreLabel = Utils.getScoreLabel(score);
        const interpretation = elementData.scoreInterpretations?.[scoreLabel] || "Interpretation not available.";
        const barWidth = score ? (score / 10) * 100 : 0;
        const color = Utils.getElementColor(elementNameKey);
        const iconClass = Utils.getElementIcon(elementNameKey);
        const elementNameShort = Utils.getElementShortName(fullName);

        const details = document.createElement('details');
        details.classList.add('element-detail-entry');
        details.dataset.elementKey = key;
        details.style.setProperty('--element-color', color);

        // --- Description Div with Accordion ---
        const descriptionDiv = document.createElement('div');
        descriptionDiv.classList.add('element-description');
        // *** MODIFICATION START: Use details/summary for elaboration ***
        descriptionDiv.innerHTML = `
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
        `;
        // *** MODIFICATION END ***

        const attunementPlaceholder = document.createElement('div');
        attunementPlaceholder.className = 'attunement-placeholder';
        descriptionDiv.appendChild(attunementPlaceholder);

        const deepDiveContainer = document.createElement('div');
        deepDiveContainer.classList.add('element-deep-dive-container', 'hidden');
        deepDiveContainer.dataset.elementKey = key;
        descriptionDiv.appendChild(deepDiveContainer);

        details.innerHTML = `
            <summary class="element-detail-header">
                <div>
                    <i class="${iconClass} element-icon-indicator" style="color: ${color};" title="${fullName}"></i>
                    <strong>${elementNameShort}:</strong>
                    <span>${score?.toFixed(1) ?? '?'}</span>
                    <span class="score-label">(${scoreLabel})</span>
                </div>
                <div class="score-bar-container">
                    <div style="width: ${barWidth}%; background-color: ${color};"></div>
                </div>
            </summary>
        `;
        details.appendChild(descriptionDiv);
        personaElementDetailsDiv.appendChild(details);

        if (showDeepDiveContainer) {
            displayElementDeepDive(key, deepDiveContainer);
            deepDiveContainer.classList.remove('hidden');
        }
    });

    displayElementAttunement();
    updateInsightDisplays();
    displayFocusedConceptsPersona();
    generateTapestryNarrative();
    synthesizeAndDisplayThemesPersona();
    updateElementalDilemmaButtonState();
    updateSuggestSceneButtonState();
    GameLogic.checkSynergyTensionStatus();
}

export function displayElementAttunement() {
    if (!personaElementDetailsDiv) return;
    const attunement = State.getAttunement();
    Object.keys(attunement).forEach(key => {
        const attunementValue = attunement[key] || 0;
        const percentage = (attunementValue / Config.MAX_ATTUNEMENT) * 100;
        const shortNameKey = elementKeyToFullName[key];
        if (!shortNameKey) {
            console.warn(`UI displayElementAttunement: Short name key not found for key: ${key}`);
            return;
        }
        const color = Utils.getElementColor(shortNameKey);

        const targetDetails = personaElementDetailsDiv.querySelector(`.element-detail-entry[data-element-key="${key}"]`);
        if (!targetDetails) {
            console.warn(`UI displayElementAttunement: Target details container not found for key ${key}.`);
            return;
        }

        const descriptionDiv = targetDetails.querySelector('.element-description');
        if (!descriptionDiv) { console.warn(`No .element-description found for ${key}`); return; }

        let attunementDisplay = descriptionDiv.querySelector('.attunement-display');
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
            const hr = descriptionDiv.querySelector('hr.attunement-hr');
            if (hr) { hr.insertAdjacentElement('afterend', attunementDisplay); }
            else { descriptionDiv.insertBefore(attunementDisplay, descriptionDiv.querySelector('.element-deep-dive-container')); }
        }

        const bar = attunementDisplay.querySelector('.attunement-bar');
        const container = attunementDisplay.querySelector('.attunement-bar-container');
        if (bar) bar.style.width = `${percentage}%`;
        if (container) container.title = `Current Attunement: ${attunementValue.toFixed(1)} / ${Config.MAX_ATTUNEMENT}`;
    });
}

export function updateFocusSlotsDisplay() {
    const focused = State.getFocusedConcepts();
    const totalSlots = State.getFocusSlots();
    if (focusedConceptsHeader) {
        focusedConceptsHeader.innerHTML = `Focused Concepts (${focused.size} / ${totalSlots}) <i class="fas fa-info-circle info-icon"></i>`;
        const icon = focusedConceptsHeader.querySelector('.info-icon');
        if (icon) icon.title = `Concepts marked as Focus (${focused.size}) out of your available slots (${totalSlots}). Slots increase via Milestones.`;
    }
}

export function displayFocusedConceptsPersona() {
    if (!focusedConceptsDisplay) return;
    focusedConceptsDisplay.innerHTML = '';
    updateFocusSlotsDisplay();

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
            item.classList.add('focus-concept-item'); // This will now be styled by .concept-grid .concept-card potentially
            item.dataset.conceptId = concept.id;
            item.title = `View Details: ${concept.name}`;

            if (concept.visualHandle) {
                const handle = concept.visualHandle;
                const extension = Config.UNLOCKED_ART_EXTENSION || '.jpg';
                const fileName = handle.includes('.') ? handle : `${handle}${extension}`;
                const imageUrl = `url('placeholder_art/${fileName}')`;
                item.style.backgroundImage = imageUrl;
                item.classList.add('has-background-image');
                 const img = document.createElement('img');
                 img.src = `placeholder_art/${fileName}`;
                 img.alt = '';
                 img.style.display = 'none';
                 img.onerror = function() { handleImageError(this.parentElement); };
                 item.appendChild(img);
            }

            let iconClass = Utils.getCardTypeIcon(concept.cardType);
            let iconColor = '#b8860b';
            if (concept.primaryElement && elementKeyToFullName?.[concept.primaryElement]) {
                const elementShortNameKey = elementKeyToFullName[concept.primaryElement];
                iconClass = Utils.getElementIcon(elementShortNameKey);
                iconColor = Utils.getElementColor(elementShortNameKey);
            }

            item.innerHTML = `
                <i class="${iconClass}" style="color: ${iconColor};"></i>
                <span class="name">${concept.name}</span>
                <span class="type">(${concept.cardType})</span>
            `;
            item.addEventListener('click', () => showConceptDetailPopup(concept.id));
            focusedConceptsDisplay.appendChild(item);
        } else {
            console.warn(`Focused concept ID ${conceptId} not found or has no concept data.`);
            const item = document.createElement('div');
            item.classList.add('focus-concept-item', 'missing');
            item.textContent = `Error: ID ${conceptId}`;
            focusedConceptsDisplay.appendChild(item);
        }
    });
    updateSuggestSceneButtonState();
}

export function generateTapestryNarrative() {
    if (!tapestryNarrativeP) return;
    const narrativeHTML = GameLogic.calculateTapestryNarrative();
    tapestryNarrativeP.innerHTML = narrativeHTML || 'Mark concepts as "Focus" to generate narrative...';
}

export function synthesizeAndDisplayThemesPersona() {
    if (!personaThemesList) return;
    personaThemesList.innerHTML = '';
    const themes = GameLogic.calculateFocusThemes();

    if (themes.length === 0) {
        personaThemesList.innerHTML = `<li>${State.getFocusedConcepts().size > 0 ? 'Focus is currently balanced across elements.' : 'Mark Focused Concepts to see dominant themes...'}</li>`;
        return;
    }

    themes.slice(0, 3).forEach((theme, index) => {
        const li = document.createElement('li');
        const elementShortNameKey = elementKeyToFullName[theme.key];
        const color = Utils.getElementColor(elementShortNameKey);
        const icon = Utils.getElementIcon(elementShortNameKey);
        let emphasis = "Influenced by";
        if (index === 0 && theme.count >= 3) emphasis = "Strongly Focused on";
        else if (index === 0) emphasis = "Primarily Focused on";

        li.innerHTML = `<i class="${icon}" style="color: ${color}; margin-right: 5px;"></i> ${emphasis} ${theme.name} (${theme.count})`;
        li.style.borderLeft = `3px solid ${color}`;
        li.style.paddingLeft = '8px';
        personaThemesList.appendChild(li);
    });
}

export function drawPersonaChart(scores) {
    const canvas = personaScoreChartCanvas;
    if (!canvas) { console.error("Persona score chart canvas not found!"); return; }
    const ctx = canvas.getContext('2d');
    if (!ctx) { console.error("Could not get canvas context for chart!"); return; }

    const computedStyle = getComputedStyle(document.documentElement);
    const pointLabelFont = computedStyle.getPropertyValue('--font-family').trim() || 'Arial, sans-serif'; // Use new font
    const pointLabelColor = computedStyle.getPropertyValue('--text-muted-color').trim() || '#6c757d';
    const tickColor = computedStyle.getPropertyValue('--text-color').trim() || '#333'; // Use text color for ticks
    const gridColor = Utils.hexToRgba(computedStyle.getPropertyValue('--border-color-dark').trim() || '#adb5bd', 0.3); // Use border color for grid

    const labels = elementNames.map(nameKey => Utils.getElementShortName(elementDetails[nameKey]?.name || nameKey));
    const dataPoints = elementNames.map(nameKey => {
        const key = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === nameKey);
        return scores[key] ?? 0;
    });

    // Use adapted element colors if defined in dark mode, otherwise original
    const borderColors = elementNames.map(nameKey => {
        const originalColor = Utils.getElementColor(nameKey);
        // Check if a dark mode version exists in CSS variables (this requires :root.dark --element-color variables)
        let darkColorVar = `--${nameKey.toLowerCase()}-color`; // e.g., --attraction-color
        let adaptedColor = computedStyle.getPropertyValue(darkColorVar).trim();
        return adaptedColor || originalColor; // Fallback to original if dark var not found
    });
     const backgroundColors = borderColors.map(color => Utils.hexToRgba(color, 0.4)); // Use 40% alpha


    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Elemental Scores', data: dataPoints,
            backgroundColor: backgroundColors, borderColor: borderColors, borderWidth: 2,
            pointBackgroundColor: borderColors, pointBorderColor: computedStyle.getPropertyValue('--background-light').trim(), pointHoverBackgroundColor: computedStyle.getPropertyValue('--background-light').trim(),
            pointHoverBorderColor: borderColors, pointRadius: 4, pointHoverRadius: 6
        }]
    };

    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: { display: true, color: gridColor }, grid: { color: gridColor },
                pointLabels: { font: { size: 11, family: pointLabelFont }, color: pointLabelColor },
                suggestedMin: 0, suggestedMax: 10,
                ticks: { stepSize: 2, backdropColor: Utils.hexToRgba(computedStyle.getPropertyValue('--background-light').trim(), 0.8), color: tickColor, font: { weight: 'bold' } }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.75)', titleFont: { family: pointLabelFont }, bodyFont: { family: pointLabelFont }, padding: 10,
                 color: '#fff', // Ensure tooltip text is light
                 borderColor: 'rgba(255,255,255,0.2)',
                 borderWidth: 1,
                callbacks: { label: function(context) { let label = context.dataset.label || ''; if (label) { label += ': '; } if (context.parsed.r !== null) { label += `${context.parsed.r.toFixed(1)} (${Utils.getScoreLabel(context.parsed.r)})`; } return label; } }
            }
        }
    };

    if (personaChartInstance) { personaChartInstance.destroy(); }
    personaChartInstance = new Chart(ctx, { type: 'radar', data: chartData, options: chartOptions });
}

export function displayPersonaSummary() {
    if (!summaryContentDiv || !summaryCoreEssenceTextDiv || !summaryTapestryInfoDiv) {
        console.error("Summary view content divs not found!");
        if(summaryContentDiv) summaryContentDiv.innerHTML = '<p>Error loading summary content elements.</p>';
        return;
    }
    console.log("UI: Displaying Persona Summary");

    summaryCoreEssenceTextDiv.innerHTML = '';
    summaryTapestryInfoDiv.innerHTML = '';

    const scores = State.getScores();
    const focused = State.getFocusedConcepts();
    const narrativeHTML = GameLogic.calculateTapestryNarrative();
    const themes = GameLogic.calculateFocusThemes();

    // Core Essence
    let coreEssenceHTML = '';
    if (elementDetails && elementKeyToFullName) {
        elementNames.forEach(elNameKey => {
            const key = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === elNameKey);
            if (!key) {
                console.warn(`UI displayPersonaSummary: Could not find key for element name: ${elNameKey}`);
                coreEssenceHTML += `<p><strong>${Utils.getElementShortName(elementDetails[elNameKey]?.name || elNameKey)}:</strong> Score lookup error.</p>`;
                return;
            }

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
    } else {
        coreEssenceHTML += "<p>Error: Element details not loaded.</p>";
    }
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
                 const elementShortNameKey = elementKeyToFullName[theme.key];
                 const color = Utils.getElementColor(elementShortNameKey);
                tapestryHTML += `<li style="border-left: 3px solid ${color}; padding-left: 5px;">${theme.name} Focus (${theme.count} concept${theme.count > 1 ? 's' : ''})</li>`;
            });
            tapestryHTML += '</ul>';
        } else {
            tapestryHTML += '<strong>Dominant Themes:</strong><p>No strong themes detected.</p>';
        }
    } else {
        tapestryHTML += '<p>No concepts are currently focused. Add focus in the Workshop!</p>';
    }
    summaryTapestryInfoDiv.innerHTML = tapestryHTML;

    drawPersonaChart(scores);
}

// --- Workshop Screen UI ---
export function displayWorkshopScreenContent() {
    if (!workshopScreen) return;
    console.log(`UI: Populating Workshop Screen Content`);

    if (userInsightDisplayWorkshop) {
        userInsightDisplayWorkshop.textContent = State.getInsight().toFixed(1);
    }

    // Populate Research Bench Buttons
    if (elementResearchButtonsContainer) {
        elementResearchButtonsContainer.innerHTML = '';
        const scores = State.getScores();
        const freeResearchLeft = State.getInitialFreeResearchRemaining();
        const insight = State.getInsight();

        elementNames.forEach(elementNameKey => {
            const key = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === elementNameKey);
            if (!key) {
                 console.warn(`UI displayWorkshopScreenContent: Could not find key for element name: ${elementNameKey}`);
                 return;
            }

            const score = scores[key] ?? 5.0;
            const scoreLabel = Utils.getScoreLabel(score);
            const elementData = elementDetails[elementNameKey] || {};
            const fullName = elementData.name || elementNameKey;
            const color = Utils.getElementColor(elementNameKey);
            const iconClass = Utils.getElementIcon(elementNameKey);
            const elementDiv = document.createElement('div');
            elementDiv.classList.add('initial-discovery-element', 'card'); // Add card class
            elementDiv.style.setProperty('--card-border-color', color); // Custom prop for border
            elementDiv.dataset.elementKey = key;

            let costText = "";
            let isDisabled = false;
            let titleText = "";
            let isFreeClick = false;
            const researchCost = Config.BASE_RESEARCH_COST;

            if (freeResearchLeft > 0) {
                costText = `Use 1 FREE`;
                titleText = `Conduct FREE research on ${Utils.getElementShortName(fullName)}. (${freeResearchLeft} left total)`;
                isFreeClick = true;
                isDisabled = false;
                 elementDiv.innerHTML += `<span style="position: absolute; top: 5px; right: 5px; color: var(--accent-color); font-size: 1.3em; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);" title="Free Research Available!">★</span>`;
            } else {
                costText = `${researchCost} <i class="fas fa-brain insight-icon"></i>`;
                if (insight < researchCost) {
                    isDisabled = true;
                    titleText = `Research ${Utils.getElementShortName(fullName)} (Requires ${researchCost} Insight)`;
                } else {
                    isDisabled = false;
                    titleText = `Research ${Utils.getElementShortName(fullName)} (Cost: ${researchCost} Insight)`;
                }
                isFreeClick = false;
            }
            elementDiv.dataset.cost = researchCost;
            elementDiv.dataset.isFree = isFreeClick;

            let rarityCountsHTML = '';
            try {
                const rarityCounts = GameLogic.countUndiscoveredByRarity(key);
                rarityCountsHTML = `
                    <div class="rarity-counts-display" title="Undiscovered Concepts (Primary Element: ${Utils.getElementShortName(fullName)})">
                        <span class="rarity-count common" title="${rarityCounts.common} Common"><i class="fas fa-circle"></i> ${rarityCounts.common}</span>
                        <span class="rarity-count uncommon" title="${rarityCounts.uncommon} Uncommon"><i class="fas fa-square"></i> ${rarityCounts.uncommon}</span>
                        <span class="rarity-count rare" title="${rarityCounts.rare} Rare"><i class="fas fa-star"></i> ${rarityCounts.rare}</span>
                    </div>`;
            } catch (error) {
                console.error(`Error getting rarity counts for ${key}:`, error);
                rarityCountsHTML = '<div class="rarity-counts-display error">Counts N/A</div>';
            }

            elementDiv.innerHTML += `
                <div class="element-header card-title"> <!-- Use card-title -->
                    <i class="${iconClass}" style="color: ${color};"></i>
                    <span class="element-name">${Utils.getElementShortName(fullName)}</span>
                </div>
                <div class="element-score-display">
                    ${score.toFixed(1)} (${scoreLabel})
                </div>
                <p class="element-concept card-content">${elementData.coreConcept || 'Loading...'}</p> <!-- Use card-content -->
                ${rarityCountsHTML}
                <div class="element-action ${isDisabled ? 'disabled' : ''}">
                    <span class="element-cost">${costText}</span>
                </div>
            `;
            elementDiv.title = titleText;

            if (!isDisabled) {
                elementDiv.classList.add('clickable');
            } else {
                elementDiv.classList.add('disabled');
            }
            elementResearchButtonsContainer.appendChild(elementDiv);
        });
    } else {
        console.error("Element research buttons container not found in Workshop!");
    }

    if (freeResearchButtonWorkshop) {
        const freeAvailable = State.isFreeResearchAvailable();
        freeResearchButtonWorkshop.disabled = !freeAvailable;
        freeResearchButtonWorkshop.textContent = freeAvailable ? "Perform Daily Meditation ☆" : "Meditation Performed Today";
        freeResearchButtonWorkshop.title = freeAvailable ? "Once per day, perform free research on your least attuned element." : "Daily free meditation already completed.";
    }
    if (seekGuidanceButtonWorkshop && guidedReflectionCostDisplayWorkshop) {
        const cost = Config.GUIDED_REFLECTION_COST;
        const canAfford = State.getInsight() >= cost;
        seekGuidanceButtonWorkshop.disabled = !canAfford;
        seekGuidanceButtonWorkshop.title = canAfford ? `Spend ${cost} Insight for a Guided Reflection.` : `Requires ${cost} Insight.`;
        guidedReflectionCostDisplayWorkshop.textContent = cost;
    }
}

// --- Grimoire UI ---
export function updateGrimoireCounter() { if (grimoireCountSpan) { grimoireCountSpan.textContent = State.getDiscoveredConcepts().size; } }
export function populateGrimoireFilters() {
    if (grimoireTypeFilterWorkshop) {
        grimoireTypeFilterWorkshop.innerHTML = '<option value="All">All Types</option>';
        cardTypeKeys.forEach(type => { const option = document.createElement('option'); option.value = type; option.textContent = type; grimoireTypeFilterWorkshop.appendChild(option); });
    }
    if (grimoireElementFilterWorkshop) {
        grimoireElementFilterWorkshop.innerHTML = '<option value="All">All Elements</option>';
        elementNames.forEach(shortNameKey => { const elementData = elementDetails[shortNameKey] || {}; const fullName = elementData.name || shortNameKey; const shortName = Utils.getElementShortName(fullName); const option = document.createElement('option'); option.value = shortNameKey; option.textContent = shortName; option.title = fullName; grimoireElementFilterWorkshop.appendChild(option); });
    }
}
function updateShelfCounts() {
    if (!grimoireShelvesWorkshop) return;
    const conceptData = Array.from(State.getDiscoveredConcepts().values());
    grimoireShelves.forEach(shelf => { const shelfElem = grimoireShelvesWorkshop.querySelector(`.grimoire-shelf[data-category-id="${shelf.id}"] .shelf-count`); if (shelfElem) { const count = conceptData.filter(data => (data.userCategory || 'uncategorized') === shelf.id).length; shelfElem.textContent = `(${count})`; } });
     const showAllShelfCount = grimoireShelvesWorkshop.querySelector(`.show-all-shelf .shelf-count`);
     if (showAllShelfCount) { showAllShelfCount.textContent = `(${conceptData.length})`; }
}
export function displayGrimoire(filterParams = {}) {
    const { filterType = "All", filterElement = "All", sortBy = "discovered", filterRarity = "All", searchTerm = "", filterFocus = "All", filterCategory = "All" } = filterParams;

    if (grimoireShelvesWorkshop) {
        grimoireShelvesWorkshop.innerHTML = '';
        grimoireShelves.forEach(shelf => { const shelfDiv = document.createElement('div'); shelfDiv.classList.add('grimoire-shelf'); shelfDiv.dataset.categoryId = shelf.id; if (filterCategory === shelf.id) { shelfDiv.classList.add('active-shelf'); } shelfDiv.innerHTML = `<h4>${shelf.name} <i class="fas fa-info-circle info-icon" title="${shelf.description || ''}"></i></h4><span class="shelf-count">(0)</span>`; grimoireShelvesWorkshop.appendChild(shelfDiv); });
        const showAllDiv = document.createElement('div'); showAllDiv.classList.add('grimoire-shelf', 'show-all-shelf'); if (filterCategory === 'All') { showAllDiv.classList.add('active-shelf'); } showAllDiv.innerHTML = `<h4>Show All Cards</h4><span class="shelf-count">(0)</span>`; showAllDiv.dataset.categoryId = 'All'; grimoireShelvesWorkshop.appendChild(showAllDiv);
    } else { console.error("Grimoire shelves container #grimoire-shelves-workshop not found."); }

    const targetCardContainer = grimoireGridWorkshop;
    if (!targetCardContainer) { console.error("#grimoire-grid-workshop element not found for cards."); return; }
    targetCardContainer.innerHTML = '';

    const discoveredMap = State.getDiscoveredConcepts();
    if (discoveredMap.size === 0) { targetCardContainer.innerHTML = '<p>Your Grimoire Library is empty... Discover Concepts using the Research Bench!</p>'; updateShelfCounts(); return; }

    const userScores = State.getScores();
    const focusedSet = State.getFocusedConcepts();
    let discoveredArray = Array.from(discoveredMap.values());

    // Filtering
    const searchTermLower = searchTerm.toLowerCase().trim();
    const conceptsToDisplay = discoveredArray.filter(data => {
        if (!data?.concept) return false;
        const concept = data.concept;
        const userCategory = data.userCategory || 'uncategorized';
        const typeMatch = (filterType === "All") || (concept.cardType === filterType);
        let elementMatch = (filterElement === "All");
        if (!elementMatch) { const selectedElementKey = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === filterElement); if(selectedElementKey) { elementMatch = (concept.primaryElement === selectedElementKey); } else { console.warn(`Could not map filter element name "${filterElement}" to a key.`); } }
        const rarityMatch = (filterRarity === "All") || (concept.rarity === filterRarity);
        const focusMatch = (filterFocus === 'All') || (filterFocus === 'Focused' && focusedSet.has(concept.id)) || (filterFocus === 'Not Focused' && !focusedSet.has(concept.id));
        const searchMatch = !searchTermLower || (concept.name.toLowerCase().includes(searchTermLower)) || (concept.keywords && concept.keywords.some(k => k.toLowerCase().includes(searchTermLower))) || (concept.briefDescription?.toLowerCase().includes(searchTermLower));
        const categoryMatch = (filterCategory === 'All') || (userCategory === filterCategory);
        return typeMatch && elementMatch && rarityMatch && focusMatch && searchMatch && categoryMatch;
    });

    // Sorting
    const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3 };
    conceptsToDisplay.sort((a, b) => {
        if (!a.concept || !b.concept) return 0;
        const conceptA = a.concept; const conceptB = b.concept;
        switch (sortBy) {
            case 'name': return conceptA.name.localeCompare(conceptB.name);
            case 'type': return (cardTypeKeys.indexOf(conceptA.cardType) - cardTypeKeys.indexOf(conceptB.cardType)) || conceptA.name.localeCompare(conceptB.name);
            case 'rarity': return (rarityOrder[conceptB.rarity] || 0) - (rarityOrder[conceptA.rarity] || 0) || conceptA.name.localeCompare(conceptB.name);
            case 'resonance': const distA = a.distance ?? Utils.euclideanDistance(userScores, conceptA.elementScores, conceptA.name); const distB = b.distance ?? Utils.euclideanDistance(userScores, conceptB.elementScores, conceptB.name); a.distance = distA; b.distance = distB; return distA - distB || conceptA.name.localeCompare(conceptB.name);
            default: return (b.discoveredTime || 0) - (a.discoveredTime || 0) || conceptA.name.localeCompare(conceptB.name);
        }
    });

    // Rendering
    if (conceptsToDisplay.length === 0) { targetCardContainer.innerHTML = `<p>No discovered concepts match the current filters${searchTerm ? ' or search term' : ''}${filterCategory !== 'All' ? ` on the '${grimoireShelves.find(s=>s.id===filterCategory)?.name || filterCategory}' shelf` : ''}.</p>`; }
    else { conceptsToDisplay.forEach(data => { const cardElement = renderCard(data.concept, 'grimoire'); if (cardElement) { cardElement.draggable = true; cardElement.dataset.conceptId = data.concept.id; cardElement.classList.add(`category-${data.userCategory || 'uncategorized'}`); targetCardContainer.appendChild(cardElement); } }); }
    updateShelfCounts();
}
export function refreshGrimoireDisplay(overrideFilters = {}) {
    if (workshopScreen && !workshopScreen.classList.contains('hidden')) {
        const currentFilters = {
            filterType: grimoireTypeFilterWorkshop?.value || "All",
            filterElement: grimoireElementFilterWorkshop?.value || "All",
            sortBy: grimoireSortOrderWorkshop?.value || "discovered",
            filterRarity: grimoireRarityFilterWorkshop?.value || "All",
            searchTerm: grimoireSearchInputWorkshop?.value || "",
            filterFocus: grimoireFocusFilterWorkshop?.value || "All",
            filterCategory: overrideFilters.filterCategory !== undefined ? overrideFilters.filterCategory : document.querySelector('#grimoire-shelves-workshop .grimoire-shelf.active-shelf')?.dataset.categoryId || "All"
        };
        const finalFilters = { ...currentFilters, ...overrideFilters };
        console.log("Refreshing Grimoire with filters:", finalFilters);
        displayGrimoire(finalFilters);
    }
}
function handleFirstGrimoireVisit() { /* Deprecated */ }
export function renderCard(concept, context = 'grimoire') {
    if (!concept || typeof concept.id === 'undefined') { console.warn("renderCard called with invalid concept:", concept); const eDiv = document.createElement('div'); eDiv.textContent = "Error: Invalid Concept Data"; return eDiv; }
    const cardDiv = document.createElement('div'); cardDiv.classList.add('concept-card', 'card'); cardDiv.classList.add(`rarity-${concept.rarity || 'common'}`); cardDiv.dataset.conceptId = concept.id; cardDiv.title = (context === 'grimoire') ? `View Details: ${concept.name}` : concept.name;
    let isDiscovered = false, isFocused = false, hasNewLore = false, userCategory = 'uncategorized';
    if (context === 'grimoire') { const discoveredData = State.getDiscoveredConceptData(concept.id); isDiscovered = !!discoveredData; isFocused = State.getFocusedConcepts().has(concept.id); hasNewLore = discoveredData?.newLoreAvailable || false; userCategory = discoveredData?.userCategory || 'uncategorized'; }
    let visualContentHTML = '';
     if (context === 'grimoire' && concept.visualHandle) { const handle = concept.visualHandle; const fileName = handle.includes('.') ? handle : `${handle}${Config.UNLOCKED_ART_EXTENSION || '.jpg'}`; visualContentHTML = `<img src="placeholder_art/${fileName}" alt="${concept.name} Art" class="card-art-image" loading="lazy" onerror="handleImageError(this)"><i class="fas fa-image card-visual-placeholder" style="display: none;" title="Art Placeholder (Load Failed)"></i>`; }
     else if (context === 'grimoire') { visualContentHTML = `<i class="fas fa-question card-visual-placeholder" title="Visual Placeholder"></i>`; }
    const focusStampHTML = (context === 'grimoire' && isFocused) ? '<span class="focus-indicator" title="Focused Concept">★</span>' : '';
    const loreStampHTML = (context === 'grimoire' && isDiscovered && hasNewLore) ? '<span class="lore-indicator" title="New Lore Unlocked!"><i class="fas fa-scroll"></i></span>' : '';
    const cardTypeIcon = Utils.getCardTypeIcon(concept.cardType);
    let rarityText = concept.rarity ? concept.rarity.charAt(0).toUpperCase() + concept.rarity.slice(1) : 'Common'; let rarityClass = `rarity-indicator-${concept.rarity || 'common'}`; const rarityIndicatorHTML = `<span class="card-rarity ${rarityClass}" title="Rarity: ${rarityText}">${rarityText}</span>`;
    let primaryElementHTML = '<small style="color:var(--text-muted-color); font-style: italic;">No Primary Element</small>';
    if (concept.primaryElement && elementKeyToFullName?.[concept.primaryElement]) { const primaryKey = concept.primaryElement; const shortNameKey = elementKeyToFullName[primaryKey]; const elementData = elementDetails[shortNameKey] || {}; const descriptiveName = elementData.name || shortNameKey; const color = Utils.getElementColor(shortNameKey); const icon = Utils.getElementIcon(shortNameKey); const nameShort = Utils.getElementShortName(descriptiveName); primaryElementHTML = `<span class="primary-element-display" style="color: ${color}; border-color: ${Utils.hexToRgba(color, 0.5)}; background-color: ${Utils.hexToRgba(color, 0.1)};" title="Primary Element: ${descriptiveName}"><i class="${icon}"></i> ${nameShort}</span>`; }
    let actionButtonsHTML = '';
    if (context === 'grimoire') {
        actionButtonsHTML = '<div class="card-actions">'; let hasActions = false; const showSellButtonOnCard = isDiscovered; const showFocusButtonOnCard = isDiscovered;
        if (showSellButtonOnCard) { let discoveryValue = Config.CONCEPT_DISCOVERY_INSIGHT[concept.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default; const sellValue = discoveryValue * Config.SELL_INSIGHT_FACTOR; actionButtonsHTML += `<button class="button tiny-button secondary-button sell-button card-sell-button btn" data-concept-id="${concept.id}" data-context="grimoire" title="Sell (${sellValue.toFixed(1)} Insight)"><i class="fas fa-dollar-sign"></i></button>`; hasActions = true; }
        if (showFocusButtonOnCard) { const slotsFull = State.getFocusedConcepts().size >= State.getFocusSlots() && !isFocused; const buttonClass = isFocused ? 'marked' : ''; const buttonIcon = isFocused ? 'fa-star' : 'fa-regular fa-star'; const buttonTitle = slotsFull ? `Focus Slots Full (${State.getFocusSlots()})` : (isFocused ? 'Remove Focus' : 'Mark as Focus'); actionButtonsHTML += `<button class="button tiny-button card-focus-button ${buttonClass} btn" data-concept-id="${concept.id}" title="${buttonTitle}" ${slotsFull ? 'disabled' : ''}><i class="fas ${buttonIcon}"></i></button>`; hasActions = true; }
        actionButtonsHTML += '</div>'; if (!hasActions) actionButtonsHTML = '';
    }
     cardDiv.innerHTML = `
         <div class="card-header">
             <span class="card-type-icon-area"><i class="${cardTypeIcon}" title="${concept.cardType}"></i></span>
             <span class="card-name">${concept.name}</span>
             <span class="card-header-right">
                 ${rarityIndicatorHTML}
                 <span class="card-stamps">${focusStampHTML}${loreStampHTML}</span>
             </span>
         </div>
         ${context === 'grimoire' ? `<div class="card-visual">${visualContentHTML}</div>` : ''}
         <div class="card-footer">
             <div class="card-affinities">${primaryElementHTML}</div>
             <p class="card-brief-desc card-content">${concept.briefDescription || '...'}</p> <!-- Added card-content -->
             ${actionButtonsHTML}
         </div>`;
    if (context === 'grimoire') { cardDiv.classList.add(`category-${userCategory}`); }
     if (context === 'popup-result') { cardDiv.classList.add('popup-result-card'); cardDiv.querySelector('.card-footer').style.paddingBottom = '0px'; cardDiv.querySelector('.card-brief-desc').style.display = 'block'; cardDiv.querySelector('.card-brief-desc').style.minHeight = 'calc(1.4em * 1)'; cardDiv.querySelector('.card-affinities').style.marginBottom = '5px'; cardDiv.title = concept.name; }
    return cardDiv;
}

// --- Concept Detail Popup UI ---
export function showConceptDetailPopup(conceptId) {
     console.log(`--- UI: Opening Popup for Concept ID: ${conceptId} ---`);
     const conceptData = concepts.find(c => c.id === conceptId);
     if (!conceptData) { console.error("Concept data missing:", conceptId); showTemporaryMessage("Error: Concept not found.", 3000); return; }
     const discoveredData = State.getDiscoveredConceptData(conceptId);
     const inGrimoire = !!discoveredData;
     GameLogic.setCurrentPopupConcept(conceptId);

     if (popupConceptName) popupConceptName.textContent = conceptData.name;
     let subHeaderText = conceptData.cardType || "Unknown Type"; let primaryElementIconHTML = '';
     if (conceptData.primaryElement && elementKeyToFullName?.[conceptData.primaryElement]) { const primaryKey = conceptData.primaryElement; const primaryShortNameKey = elementKeyToFullName[primaryKey]; const elementData = elementDetails[primaryShortNameKey] || {}; const fullName = elementData.name || primaryShortNameKey; const primaryColor = Utils.getElementColor(primaryShortNameKey); const primaryIcon = Utils.getElementIcon(primaryShortNameKey); const primaryNameDisplay = Utils.getElementShortName(fullName); subHeaderText += ` | Element: ${primaryNameDisplay}`; primaryElementIconHTML = `<i class="${primaryIcon} popup-element-icon" style="color: ${primaryColor}; margin-left: 8px;" title="Primary Element: ${fullName}"></i>`; }
     if (popupConceptType) popupConceptType.innerHTML = subHeaderText + primaryElementIconHTML;
     if (popupCardTypeIcon) popupCardTypeIcon.className = `${Utils.getCardTypeIcon(conceptData.cardType)} card-type-icon`;

     if (popupVisualContainer) {
         popupVisualContainer.innerHTML = ''; const placeholderIcon = `<i class="fas fa-image card-visual-placeholder" style="display: flex;" title="Art Placeholder"></i>`;
         if (conceptData.visualHandle) { const handle = conceptData.visualHandle; const fileName = handle.includes('.') ? handle : `${handle}${Config.UNLOCKED_ART_EXTENSION || '.jpg'}`; const content = document.createElement('img'); content.src = `placeholder_art/${fileName}`; content.alt = `${conceptData.name} Art`; content.classList.add('card-art-image'); content.onerror = function() { console.warn(`Image failed to load: ${this.src}. Displaying placeholder.`); this.style.display = 'none'; const placeholderEl = this.parentNode.querySelector('.card-visual-placeholder'); if (placeholderEl) placeholderEl.style.display = 'flex'; else this.parentNode.innerHTML = placeholderIcon; }; popupVisualContainer.innerHTML = placeholderIcon; popupVisualContainer.appendChild(content); }
         else { popupVisualContainer.innerHTML = placeholderIcon; }
     }

     if (popupBriefDescription) popupBriefDescription.textContent = conceptData.briefDescription || '';
     if (popupDetailedDescription) popupDetailedDescription.textContent = conceptData.detailedDescription || "No detailed description available.";
     const scores = State.getScores(); const distance = Utils.euclideanDistance(scores, conceptData.elementScores, conceptData.name);
     displayPopupResonanceGauge(distance);
     displayPopupRelatedConceptsTags(conceptData);
     if(popupRecipeDetailsSection) displayPopupRecipeComparison(conceptData, scores);

     if (popupLoreSection && popupLoreContent) {
         const hasLoreDefined = conceptData.lore && Array.isArray(conceptData.lore) && conceptData.lore.length > 0;
         popupLoreSection.classList.toggle('hidden', !inGrimoire || !hasLoreDefined);
         popupLoreContent.innerHTML = '';
         if (inGrimoire && hasLoreDefined) {
             const unlockedLevel = State.getUnlockedLoreLevel(conceptId);
             conceptData.lore.sort((a, b) => a.level - b.level).forEach((loreEntry, index) => {
                 if (!loreEntry || typeof loreEntry.level !== 'number' || typeof loreEntry.text !== 'string') { console.warn(`Invalid lore entry at index ${index} for concept ${conceptId}. Skipping.`); return; }
                 const loreDiv = document.createElement('div'); loreDiv.classList.add('lore-entry'); loreDiv.dataset.loreLevel = loreEntry.level;
                 if (loreEntry.level <= unlockedLevel) { loreDiv.innerHTML = `<h5 class="lore-level-title">Level ${loreEntry.level} Insight:</h5><p class="lore-text">${loreEntry.text}</p>`; }
                 else { loreDiv.innerHTML = `<h5 class="lore-level-title">Level ${loreEntry.level} Insight: [Locked]</h5>`; const cost = Config.LORE_UNLOCK_COSTS[`level${loreEntry.level}`] || 999; const currentInsight = State.getInsight(); const canAfford = currentInsight >= cost; const unlockButton = document.createElement('button'); unlockButton.className = 'button tiny-button unlock-lore-button btn'; unlockButton.dataset.conceptId = conceptId; unlockButton.dataset.loreLevel = loreEntry.level; unlockButton.dataset.cost = cost; unlockButton.title = canAfford ? `Unlock for ${cost} Insight` : `Requires ${cost} Insight`; unlockButton.disabled = !canAfford; unlockButton.innerHTML = `Unlock (${cost} <i class="fas fa-brain insight-icon"></i>)`; loreDiv.appendChild(unlockButton); }
                 popupLoreContent.appendChild(loreDiv);
                 if (index < conceptData.lore.length - 1) { popupLoreContent.appendChild(document.createElement('hr')); }
             });
             popupLoreSection.open = (discoveredData?.newLoreAvailable) || false;
         } else if (inGrimoire && !hasLoreDefined) { popupLoreContent.innerHTML = '<p><i>No specific lore recorded for this concept.</i></p>'; }
         if (inGrimoire && discoveredData?.newLoreAvailable) { State.markLoreAsSeen(conceptId); const cardElemIndicator = document.querySelector(`#grimoire-grid-workshop .concept-card[data-concept-id="${conceptId}"] .lore-indicator`); cardElemIndicator?.remove(); console.log(`UI: Marked lore seen for concept ${conceptId}.`); }
     } else { console.error("Lore UI elements missing!"); }

     const showNotes = inGrimoire;
     if (myNotesSection) {
         myNotesSection.classList.toggle('hidden', !showNotes);
         if (showNotes && discoveredData) { if(myNotesTextarea) myNotesTextarea.value = discoveredData.notes || ""; if(noteSaveStatusSpan) noteSaveStatusSpan.textContent = ""; myNotesSection.open = false; }
     }

     updateGrimoireButtonStatus(conceptId);
     updateFocusButtonStatus(conceptId);
     updatePopupSellButton(conceptId, conceptData, inGrimoire);

     if (conceptDetailPopup) conceptDetailPopup.classList.remove('hidden');
     const onboardingActive = onboardingOverlay && !onboardingOverlay.classList.contains('hidden');
     if (popupOverlay && !onboardingActive) { popupOverlay.classList.remove('hidden'); }
     console.log(`--- UI: Finished Opening Popup for Concept ID: ${conceptId} ---`);
}
function displayPopupResonanceGauge(distance) {
    const gaugeBar = getElement('popupResonanceGaugeBar'); const gaugeLabel = getElement('popupResonanceGaugeLabel'); const gaugeText = getElement('popupResonanceGaugeText');
    if (!gaugeBar || !gaugeLabel || !gaugeText) { console.error("Resonance gauge elements not found!"); return; }
    let resonanceLabel, resonanceClass, message, widthPercent;
    if (distance === Infinity || isNaN(distance)) { resonanceLabel = "N/A"; resonanceClass = ""; message = "(Comparison Error)"; widthPercent = 0; }
    else if (distance < 2.5) { resonanceLabel = "Very High"; resonanceClass = "resonance-high"; message = "Strong alignment."; widthPercent = Math.max(5, 100 - (distance * 15)); }
    else if (distance < 4.0) { resonanceLabel = "High"; resonanceClass = "resonance-high"; message = "Shares significant common ground."; widthPercent = Math.max(5, 100 - (distance * 15)); }
    else if (distance < 6.0) { resonanceLabel = "Moderate"; resonanceClass = "resonance-medium"; message = "Some similarities, some differences."; widthPercent = Math.max(5, 100 - (distance * 12)); }
    else if (distance <= Config.DISSONANCE_THRESHOLD) { resonanceLabel = "Low"; resonanceClass = "resonance-low"; message = "Notable divergence."; widthPercent = Math.max(5, 100 - (distance * 10)); }
    else { resonanceLabel = "Dissonant"; resonanceClass = "resonance-low"; message = "Significant divergence. Reflection advised."; widthPercent = Math.max(5, 100 - (distance * 8)); }
    widthPercent = Math.max(5, Math.min(95, widthPercent));
    gaugeBar.style.width = `${widthPercent}%`; gaugeBar.className = 'popup-resonance-gauge-bar'; if (resonanceClass) gaugeBar.classList.add(resonanceClass);
    gaugeLabel.textContent = resonanceLabel; gaugeLabel.className = 'popup-resonance-gauge-label'; if (resonanceClass) gaugeLabel.classList.add(resonanceClass);
    gaugeText.textContent = `${message} (Dist: ${distance.toFixed(1)})`;
}
function displayPopupRelatedConceptsTags(conceptData) {
    const tagsContainer = getElement('popupRelatedConceptsTags'); if (!tagsContainer) { console.error("Related concepts tags container #popupRelatedConceptsTags not found!"); return; } tagsContainer.innerHTML = '';
    if (conceptData.relatedIds && conceptData.relatedIds.length > 0) {
        let foundCount = 0;
        conceptData.relatedIds.forEach(relatedId => {
            const relatedConcept = concepts.find(c => c.id === relatedId);
            if (relatedConcept) { const tag = document.createElement('span'); tag.textContent = relatedConcept.name; tag.classList.add('related-concept-tag'); tag.title = `Related: ${relatedConcept.name}. Click to view (if discovered).`; if (State.getDiscoveredConcepts().has(relatedId)) { tag.style.cursor = 'pointer'; tag.style.textDecoration = 'underline'; tag.addEventListener('click', () => { hidePopups(); setTimeout(() => showConceptDetailPopup(relatedId), 50); }); } else { tag.style.opacity = '0.7'; tag.title += ' (Not Discovered)'; } tagsContainer.appendChild(tag); foundCount++; }
            else { console.warn(`Related concept ID ${relatedId} referenced by concept ${conceptData.id} not found in data.js.`); }
        });
        if (foundCount === 0) { tagsContainer.innerHTML = '<p><i>None specified or related concepts not found.</i></p>'; }
    } else { tagsContainer.innerHTML = '<p><i>None specified.</i></p>'; }
}
export function displayPopupRecipeComparison(conceptData, userCompScores) {
    const detailsElement = getElement('popupRecipeDetails'); const conceptProfileContainer = getElement('popupConceptProfile'); const userProfileContainer = getElement('popupUserComparisonProfile'); const highlightsContainer = getElement('popupComparisonHighlights');
    if (!conceptProfileContainer || !userProfileContainer || !highlightsContainer || !detailsElement) { console.warn("Popup recipe comparison elements not found!"); if(detailsElement) detailsElement.style.display = 'none'; return; }
    detailsElement.style.display = ''; conceptProfileContainer.innerHTML = ''; userProfileContainer.innerHTML = ''; highlightsContainer.innerHTML = '';
    let highlightsHTML = '<p><strong>Key Alignments & Differences:</strong></p>'; let hasHighlights = false; const conceptScores = conceptData.elementScores || {};
    elementNames.forEach(elNameKey => {
        const key = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === elNameKey); if (!key) return;
        const elementData = elementDetails[elNameKey] || {}; const fullName = elementData.name || elNameKey;
        const conceptScore = conceptScores[key]; const userScore = userCompScores[key];
        const conceptScoreValid = typeof conceptScore === 'number' && !isNaN(conceptScore); const userScoreValid = typeof userScore === 'number' && !isNaN(userScore);
        const conceptDisplay = conceptScoreValid ? conceptScore.toFixed(1) : '?'; const userDisplay = userScoreValid ? userScore.toFixed(1) : '?'; const conceptLabel = conceptScoreValid ? Utils.getScoreLabel(conceptScore) : 'N/A'; const userLabel = userScoreValid ? Utils.getScoreLabel(userScore) : 'N/A'; const conceptBarWidth = conceptScoreValid ? (conceptScore / 10) * 100 : 0; const userBarWidth = userScoreValid ? (userScore / 10) * 100 : 0; const color = Utils.getElementColor(elNameKey); const elementNameShort = Utils.getElementShortName(fullName);
        conceptProfileContainer.innerHTML += `<div><strong>${elementNameShort}:</strong> <span>${conceptDisplay}</span> <div class="score-bar-container" title="${conceptLabel}"><div style="width: ${conceptBarWidth}%; background-color: ${color};"></div></div></div>`;
        userProfileContainer.innerHTML += `<div><strong>${elementNameShort}:</strong> <span>${userDisplay}</span> <div class="score-bar-container" title="${userLabel}"><div style="width: ${userBarWidth}%; background-color: ${color};"></div></div></div>`;
        if (conceptScoreValid && userScoreValid) { const diff = Math.abs(conceptScore - userScore); if (conceptScore >= 7 && userScore >= 7) { highlightsHTML += `<p>• <strong class="match">Strong Alignment</strong> in ${elementNameShort} (Both ${conceptLabel}/${userLabel})</p>`; hasHighlights = true; } else if (conceptScore <= 3 && userScore <= 3) { highlightsHTML += `<p>• <strong class="match">Shared Low Emphasis</strong> in ${elementNameShort} (Both ${conceptLabel}/${userLabel})</p>`; hasHighlights = true; } else if (diff >= 4) { highlightsHTML += `<p>• <strong class="mismatch">Notable Difference</strong> in ${elementNameShort} (Concept: ${conceptLabel}, You: ${userLabel})</p>`; hasHighlights = true; } }
    });
    if (!hasHighlights) { highlightsHTML += '<p><em>No strong alignments or major differences identified.</em></p>'; }
    highlightsContainer.innerHTML = highlightsHTML;
    detailsElement.open = false; const nestedDetails = detailsElement.querySelector('.element-details'); if(nestedDetails) nestedDetails.open = false;
}
export function updateGrimoireButtonStatus(conceptId) {
    if (!addToGrimoireButton) return; const isDiscovered = State.getDiscoveredConcepts().has(conceptId); addToGrimoireButton.classList.toggle('hidden', isDiscovered);
    if (!isDiscovered) { addToGrimoireButton.disabled = false; addToGrimoireButton.textContent = "Add to Grimoire"; addToGrimoireButton.classList.remove('added'); }
}
export function updateFocusButtonStatus(conceptId) {
    const localMarkAsFocusButton = getElement('markAsFocusButton'); if (!localMarkAsFocusButton) return;
    const isDiscovered = State.getDiscoveredConcepts().has(conceptId); const isFocused = State.getFocusedConcepts().has(conceptId); const slotsAvailable = State.getFocusedConcepts().size < State.getFocusSlots(); const canFocus = isDiscovered && (isFocused || slotsAvailable);
    localMarkAsFocusButton.classList.toggle('hidden', !isDiscovered);
    if (isDiscovered) { localMarkAsFocusButton.textContent = isFocused ? "Remove Focus" : "Mark as Focus"; localMarkAsFocusButton.disabled = !canFocus && !isFocused; localMarkAsFocusButton.classList.toggle('marked', isFocused); if (!canFocus && !isFocused) { localMarkAsFocusButton.title = `Focus slots full (${State.getFocusSlots()})`; } else { localMarkAsFocusButton.title = isFocused ? "Remove from Focused Concepts" : "Add to Focused Concepts"; } }
}
export function updatePopupSellButton(conceptId, conceptData, inGrimoire) {
    const popupActions = conceptDetailPopup?.querySelector('.popup-actions'); if (!popupActions || !conceptData) return;
    popupActions.querySelector('.popup-sell-button')?.remove();
    if (inGrimoire) { let discoveryValue = Config.CONCEPT_DISCOVERY_INSIGHT[conceptData.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default; const sellValue = discoveryValue * Config.SELL_INSIGHT_FACTOR; const sourceLocation = 'Grimoire Library'; const sellButton = document.createElement('button'); sellButton.classList.add('button', 'small-button', 'secondary-button', 'sell-button', 'popup-sell-button', 'btn'); sellButton.textContent = `Sell (${sellValue.toFixed(1)})`; sellButton.innerHTML += ` <i class="fas fa-brain insight-icon"></i>`; sellButton.dataset.conceptId = conceptId; sellButton.dataset.context = 'grimoire'; sellButton.title = `Sell from ${sourceLocation} for ${sellValue.toFixed(1)} Insight.`; const localMarkAsFocusButton = popupActions.querySelector('#markAsFocusButton'); if (localMarkAsFocusButton && !localMarkAsFocusButton.classList.contains('hidden')) { localMarkAsFocusButton.insertAdjacentElement('afterend', sellButton); } else { popupActions.appendChild(sellButton); } }
}

// --- Research Popup ---
export function displayResearchResults({ concepts = [], duplicateInsightGain = 0 }) {
    if (!researchResultsPopup || !researchPopupContent || !confirmResearchChoicesButton) { console.error("Research results popup elements missing!"); return; }
    researchPopupContent.innerHTML = ''; let allProcessed = true; let hasNewCards = concepts.length > 0;
    if (concepts.length > 0) {
        concepts.forEach(concept => {
            const itemDiv = document.createElement('div'); itemDiv.classList.add('research-result-item'); itemDiv.dataset.conceptId = concept.id; itemDiv.dataset.processed = 'false'; itemDiv.dataset.choiceMade = 'none';
            const cardHTML = renderCard(concept, 'popup-result'); if (cardHTML) itemDiv.appendChild(cardHTML);
            const actionsDiv = document.createElement('div'); actionsDiv.classList.add('card-actions'); const discoveryValue = Config.CONCEPT_DISCOVERY_INSIGHT[concept.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default; const sellValue = discoveryValue * Config.SELL_INSIGHT_FACTOR; actionsDiv.innerHTML = `<button class="button tiny-button keep-button btn" data-concept-id="${concept.id}" data-action="keep" title="Add to Grimoire Library">Keep</button><button class="button tiny-button sell-button btn" data-concept-id="${concept.id}" data-action="sell" title="Sell for ${sellValue.toFixed(1)} Insight">Sell (${sellValue.toFixed(1)} <i class="fas fa-brain insight-icon"></i>)</button><span class="action-feedback" aria-live="polite"></span>`; itemDiv.appendChild(actionsDiv);
            researchPopupContent.appendChild(itemDiv); allProcessed = false;
        });
    }
    if (duplicateInsightGain > 0) { researchPopupContent.innerHTML += `<p class="duplicate-insight-info">Echoes of previous discoveries... +${duplicateInsightGain.toFixed(1)} <i class="fas fa-brain insight-icon"></i> Insight gained.</p>`; }
    if (!hasNewCards && duplicateInsightGain <= 0) { researchPopupContent.innerHTML = '<p>The currents of inspiration were quiet this time. No new concepts revealed.</p>'; allProcessed = true; }
    confirmResearchChoicesButton.disabled = !allProcessed; closeResearchResultsPopupButton.disabled = !allProcessed; closeResearchResultsPopupButton.title = allProcessed ? "Close" : "Make a choice for all concepts first"; researchPopupStatus.textContent = allProcessed ? 'All choices confirmed.' : 'Choose an action for each finding above.'; confirmResearchChoicesButton.classList.toggle('hidden', !hasNewCards);
    researchResultsPopup.classList.remove('hidden');
     const onboardingActive = onboardingOverlay && !onboardingOverlay.classList.contains('hidden');
    if (popupOverlay && !onboardingActive) { popupOverlay.classList.remove('hidden'); }
}
export function handleResearchPopupAction(conceptId, action) {
    const item = researchPopupContent?.querySelector(`.research-result-item[data-concept-id="${conceptId}"]`); if (!item) return;
    const feedbackSpan = item.querySelector('.action-feedback'); const keepButton = item.querySelector('button[data-action="keep"]'); const sellButton = item.querySelector('button[data-action="sell"]');
    if(keepButton) keepButton.disabled = true; if(sellButton) sellButton.disabled = true; item.dataset.processed = 'true'; item.dataset.choiceMade = action;
    if (feedbackSpan) { switch(action) { case 'kept': feedbackSpan.textContent = 'Added to Grimoire!'; feedbackSpan.style.color = 'green'; break; case 'kept_after_dissonance': feedbackSpan.textContent = 'Added after reflection.'; feedbackSpan.style.color = 'green'; break; case 'sold': feedbackSpan.textContent = 'Sold for Insight!'; feedbackSpan.style.color = 'orange'; break; case 'pending_dissonance': feedbackSpan.textContent = 'Awaiting Reflection...'; feedbackSpan.style.color = 'blue'; break; case 'error_adding': feedbackSpan.textContent = 'Error Adding!'; feedbackSpan.style.color = 'red'; break; case 'error_unknown': feedbackSpan.textContent = 'Error!'; feedbackSpan.style.color = 'red'; break; case 'kept_after_dissonance_fail': feedbackSpan.textContent = 'Added (Reflection Error)'; feedbackSpan.style.color = 'green'; break; default: feedbackSpan.textContent = ''; break; } }
    const allItems = researchPopupContent?.querySelectorAll('.research-result-item'); const allProcessed = Array.from(allItems).every(i => i.dataset.processed === 'true');
    if (confirmResearchChoicesButton) confirmResearchChoicesButton.disabled = !allProcessed; if (closeResearchResultsPopupButton) { closeResearchResultsPopupButton.disabled = !allProcessed; closeResearchResultsPopupButton.title = allProcessed ? "Close" : "Make a choice for all concepts first"; } if (researchPopupStatus) researchPopupStatus.textContent = allProcessed ? 'All choices confirmed.' : 'Choose an action for each finding.';
}

// --- Reflection Modal UI ---
export function displayReflectionPrompt(promptData, context) {
    if (!reflectionModal || !promptData || !promptData.prompt) { console.error("Reflection modal or prompt data/text missing.", promptData); if (context === 'Dissonance') { const conceptId = GameLogic.getCurrentPopupConceptId(); if (conceptId !== null) { console.warn("Reflection prompt missing for Dissonance, adding concept directly."); if (typeof GameLogic.addConceptToGrimoireInternal === 'function') { handleResearchPopupAction(conceptId, 'kept_after_dissonance_fail'); GameLogic.addConceptToGrimoireInternal(conceptId, 'dissonance_reflection_failed'); hidePopups(); showTemporaryMessage("Reflection unavailable, concept added.", 3500); } else { console.error("addConceptToGrimoireInternal is not available in GameLogic!"); showTemporaryMessage("Critical Error: Cannot process reflection.", 4000); } } else { showTemporaryMessage("Error: Could not display reflection or find target concept.", 3000); } } else { showTemporaryMessage("Error: Could not display reflection prompt.", 3000); } return; }
    const { title, category, prompt, showNudge, reward } = promptData;
    if (reflectionModalTitle) reflectionModalTitle.textContent = title || "Moment for Reflection"; if (reflectionElement) reflectionElement.textContent = category || "General"; if (reflectionPromptText) reflectionPromptText.innerHTML = prompt.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); if (reflectionCheckbox) reflectionCheckbox.checked = false;
    if (scoreNudgeCheckbox && scoreNudgeLabel) { scoreNudgeCheckbox.checked = false; scoreNudgeCheckbox.classList.toggle('hidden', !showNudge); scoreNudgeLabel.classList.toggle('hidden', !showNudge); }
    if (confirmReflectionButton) confirmReflectionButton.disabled = true; if (reflectionRewardAmount) reflectionRewardAmount.textContent = `${reward.toFixed(1)}`;
    reflectionModal.classList.remove('hidden');
    const onboardingActive = onboardingOverlay && !onboardingOverlay.classList.contains('hidden');
    if (popupOverlay && !onboardingActive) { popupOverlay.classList.remove('hidden'); }
}

// --- Integrated Element Deep Dive UI ---
export function displayElementDeepDive(elementKey, targetContainerElement) {
    if (!targetContainerElement) { targetContainerElement = personaElementDetailsDiv?.querySelector(`.element-deep-dive-container[data-element-key="${elementKey}"]`); if (!targetContainerElement) { console.error(`UI: Still could not find target container for element ${elementKey}`); return; } }
    const shortNameKey = elementKeyToFullName[elementKey]; if (!shortNameKey) { console.warn(`UI displayElementDeepDive: Could not find short name for key: ${elementKey}`); targetContainerElement.innerHTML = '<p><i>Error loading deep dive data.</i></p>'; return; }
    const deepDiveData = elementDeepDive[shortNameKey] || []; const unlockedLevels = State.getState().unlockedDeepDiveLevels; const currentLevel = unlockedLevels[elementKey] || 0; const elementName = elementKeyToFullName[elementKey] || elementKey; const fullName = elementDetails[elementName]?.name || elementName; const insight = State.getInsight();
    targetContainerElement.innerHTML = `<h5 class="deep-dive-section-title">${Utils.getElementShortName(fullName)} Insights</h5>`;
    if (deepDiveData.length === 0) { targetContainerElement.innerHTML += '<p><i>No deep dive content available for this element yet.</i></p>'; return; }
    let displayedContent = false;
    deepDiveData.sort((a,b) => a.level - b.level).forEach(levelData => {
        if (levelData.level <= currentLevel) { targetContainerElement.innerHTML += `<div class="library-level"><h5 class="level-title">${levelData.title} (Level ${levelData.level})</h5><div class="level-content">${levelData.content}</div></div><hr class="popup-hr">`; displayedContent = true; }
    });
    if (!displayedContent && currentLevel === 0) { targetContainerElement.innerHTML += '<p><i>Unlock the first level to begin exploring deeper insights.</i></p>'; }
    const nextLevel = currentLevel + 1; const nextLevelData = deepDiveData.find(l => l.level === nextLevel);
    if (nextLevelData) {
        const cost = nextLevelData.insightCost || 0; const canAfford = insight >= cost; const isDisabled = !canAfford; let buttonTitle = ''; let errorMsgHTML = '';
        if (!canAfford) { buttonTitle = `Requires ${cost} Insight`; errorMsgHTML = `<p class='unlock-error'>Insufficient Insight (${insight.toFixed(1)}/${cost})</p>`; } else { buttonTitle = `Unlock for ${cost} Insight`; }
        const buttonHTML = `<button class="button small-button unlock-button btn" data-element-key="${elementKey}" data-level="${nextLevelData.level}" ${isDisabled ? 'disabled' : ''} title="${buttonTitle.replace(/"/g, '&quot;')}">Unlock (${cost} <i class="fas fa-brain insight-icon"></i>)</button>`;
        targetContainerElement.innerHTML += `<div class="library-unlock"><h5>Next: ${nextLevelData.title} (Level ${nextLevelData.level})</h5>${buttonHTML}${errorMsgHTML}</div>`;
    } else if (displayedContent) { const lastHr = targetContainerElement.querySelector('hr.popup-hr:last-of-type'); if (lastHr) lastHr.remove(); targetContainerElement.innerHTML += '<p class="all-unlocked-message"><i>All insights unlocked for this element.</i></p>'; }
}

// --- Repository UI ---
export function displayRepositoryContent() {
    const showRepository = State.getState().questionnaireCompleted;
    if (repositoryScreen) repositoryScreen.classList.toggle('hidden', !showRepository); if (!showRepository) return;
    if (!repositoryFocusUnlocksDiv || !repositoryScenesDiv || !repositoryExperimentsDiv || !repositoryInsightsDiv) { console.error("Repository list containers missing!"); return; }
    console.log("UI: Displaying Repository Content");
    repositoryFocusUnlocksDiv.innerHTML = ''; repositoryScenesDiv.innerHTML = ''; repositoryExperimentsDiv.innerHTML = ''; repositoryInsightsDiv.innerHTML = '';
    const repoItems = State.getRepositoryItems(); const unlockedFocusData = State.getUnlockedFocusItems(); const attunement = State.getAttunement(); const focused = State.getFocusedConcepts(); const insight = State.getInsight(); const scores = State.getScores();
    if (unlockedFocusData.size > 0) { unlockedFocusData.forEach(unlockId => { const unlockData = focusDrivenUnlocks.find(u => u.id === unlockId); if (unlockData?.unlocks) { const item = unlockData.unlocks; const div = document.createElement('div'); div.classList.add('repository-item', 'focus-unlock-item'); let itemHTML = `<h4>${item.name || `Unlock: ${unlockData.id}`} (${item.type})</h4>`; if (unlockData.description) itemHTML += `<p><em>Source: ${unlockData.description}</em></p>`; if (item.type === 'insightFragment') { const iData = elementalInsights.find(i => i.id === item.id); itemHTML += `<p class="repo-insight-text"><em>"${iData?.text || item.text || "..."}"</em></p>`; } else if (item.type === 'scene' || item.type === 'experiment') { itemHTML += `<p>View details in the relevant section below.</p>`; } else { itemHTML += `<p>Unique reward unlocked.</p>`; } div.innerHTML = itemHTML; repositoryFocusUnlocksDiv.appendChild(div); } }); }
    else { repositoryFocusUnlocksDiv.innerHTML = '<p>Focus on synergistic Concepts on the Persona screen to unlock special items here.</p>'; }
    if (repoItems.scenes.size > 0) { [...repoItems.scenes].sort().forEach(sceneId => { const scene = sceneBlueprints.find(s => s.id === sceneId); if (scene) { const cost = scene.meditationCost || Config.SCENE_MEDITATION_BASE_COST; const canAfford = insight >= cost; repositoryScenesDiv.appendChild(renderRepositoryItem(scene, 'scene', cost, canAfford)); } else { console.warn(`Scene ID ${sceneId} not found in data.js.`); } }); }
    else { repositoryScenesDiv.innerHTML = '<p>No Scene Blueprints discovered. Try using "Suggest Scenes" on the Persona screen.</p>'; }
    let experimentsDisplayed = 0;
    alchemicalExperiments.sort((a,b) => a.requiredAttunement - b.requiredAttunement).forEach(exp => {
        const isUnlockedByAttunement = attunement[exp.requiredElement] >= exp.requiredAttunement; const alreadyCompleted = repoItems.experiments.has(exp.id);
        if (isUnlockedByAttunement) {
            let canAttempt = true; let unmetReqs = [];
            if (exp.requiredRoleFocusScore && (scores.RF || 0) < exp.requiredRoleFocusScore) { canAttempt = false; unmetReqs.push(`RF Score ≥ ${exp.requiredRoleFocusScore}`); }
            if (exp.requiredRoleFocusScoreBelow && (scores.RF || 0) >= exp.requiredRoleFocusScoreBelow) { canAttempt = false; unmetReqs.push(`RF Score < ${exp.requiredRoleFocusScoreBelow}`); }
            if (exp.requiredFocusConceptIds) { for (const reqId of exp.requiredFocusConceptIds) { if (!focused.has(reqId)) { canAttempt = false; const c = concepts.find(c=>c.id === reqId); unmetReqs.push(c ? `Focus: ${c.name}` : `Focus: ID ${reqId}`); } } }
            if (exp.requiredFocusConceptTypes) { for (const typeReq of exp.requiredFocusConceptTypes) { let met = false; const dMap = State.getDiscoveredConcepts(); for (const fId of focused) { const c = dMap.get(fId)?.concept; if (c?.cardType === typeReq) { met = true; break; } } if (!met) { canAttempt = false; unmetReqs.push(`Focus Type: ${typeReq}`); } } }
            const cost = exp.insightCost || Config.EXPERIMENT_BASE_COST; const canAfford = insight >= cost; if (!canAfford) { canAttempt = false; unmetReqs.push(`${cost} Insight`); }
            repositoryExperimentsDiv.appendChild(renderRepositoryItem(exp, 'experiment', cost, canAttempt && !alreadyCompleted, alreadyCompleted, unmetReqs)); experimentsDisplayed++;
        }
    });
    if (experimentsDisplayed === 0) { repositoryExperimentsDiv.innerHTML = '<p>Increase Element Attunement to unlock potential Experiments here.</p>'; }
    if (repoItems.insights.size > 0) {
        const insightsByElement = {}; elementNames.forEach(elNameKey => { const key = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === elNameKey); if(key) insightsByElement[key] = []; });
        repoItems.insights.forEach(insightId => { const insightData = elementalInsights.find(i => i.id === insightId); if (insightData) { if (!insightsByElement[insightData.element]) insightsByElement[insightData.element] = []; insightsByElement[insightData.element].push(insightData); } else { console.warn(`Insight ID ${insightId} not found in data.js.`); } });
        let insightsHTML = '';
        elementNames.forEach(elNameKey => { const key = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === elNameKey); if (key && insightsByElement[key] && insightsByElement[key].length > 0) { const elementData = elementDetails[elNameKey] || {}; const fullName = elementData.name || elNameKey; insightsHTML += `<h5>${Utils.getElementShortName(fullName)} Insights:</h5><ul>`; insightsByElement[key].sort((a, b) => a.text.localeCompare(b.text)).forEach(insight => { insightsHTML += `<li>"${insight.text}"</li>`; }); insightsHTML += `</ul>`; } });
        repositoryInsightsDiv.innerHTML = insightsHTML || '<p>No Elemental Insights collected.</p>';
    } else { repositoryInsightsDiv.innerHTML = '<p>No Elemental Insights collected. Found occasionally during Research in the Workshop.</p>'; }
    displayMilestones(); displayDailyRituals(); GameLogic.updateMilestoneProgress('repositoryContents', null);
}
export function renderRepositoryItem(item, type, cost, canDoAction, completed = false, unmetReqs = []) {
    const div = document.createElement('div'); div.classList.add('repository-item', `repo-item-${type}`); if (completed) div.classList.add('completed');
    let actionsHTML = ''; let buttonDisabled = !canDoAction; let buttonTitle = ''; let buttonText = ''; let requirementText = '';
    if (type === 'scene') { buttonText = `Meditate (${cost} <i class="fas fa-brain insight-icon"></i>)`; buttonTitle = canDoAction ? `Meditate on ${item.name}` : `Requires ${cost} Insight`; actionsHTML = `<button class="button small-button btn" data-scene-id="${item.id}" ${buttonDisabled ? 'disabled' : ''} title="${buttonTitle}">${buttonText}</button>`; }
    else if (type === 'experiment') { buttonText = `Attempt (${cost} <i class="fas fa-brain insight-icon"></i>)`; if (completed) { buttonTitle = "Experiment Completed"; buttonDisabled = true; actionsHTML = `<span class="completed-text">(Completed)</span>`; } else { requirementText = unmetReqs.length > 0 ? `<small class="req-missing">(Requires: ${unmetReqs.join(', ')})</small>` : ''; buttonTitle = canDoAction ? `Attempt ${item.name}` : `Requirements not met: ${unmetReqs.join(', ')}`; actionsHTML = `<button class="button small-button btn" data-experiment-id="${item.id}" ${buttonDisabled ? 'disabled' : ''} title="${buttonTitle}">${buttonText}</button> ${requirementText}`; } }
     const requirementDisplay = type === 'experiment' ? `(Req: ${item.requiredAttunement} ${Utils.getElementShortName(elementKeyToFullName[item.requiredElement])} Attun.)` : '';
    div.innerHTML = `<h4>${item.name} ${requirementDisplay}</h4><p>${item.description}</p><div class="repo-actions">${actionsHTML}</div>`; return div;
}

// --- Milestones UI ---
export function displayMilestones() {
    if (!milestonesDisplay) { if (getElement('repositoryScreen')?.classList.contains('current')) { console.error("Milestones display list #milestonesDisplay not found!"); } return; }
    milestonesDisplay.innerHTML = ''; const achieved = State.getState().achievedMilestones;
    if (achieved.size === 0) { milestonesDisplay.innerHTML = '<li>No milestones achieved yet. Keep exploring!</li>'; return; }
    const allMilestonesSorted = [...milestones].sort((a, b) => a.id.localeCompare(b.id));
    const achievedMilestonesData = allMilestonesSorted.filter(m => achieved.has(m.id));
    achievedMilestonesData.forEach(milestone => { const li = document.createElement('li'); li.classList.add('milestone-achieved'); li.innerHTML = `✓ ${milestone.description}`; milestonesDisplay.appendChild(li); });
}

// --- Rituals Display (Targets Repository) ---
export function displayDailyRituals() {
     const targetDisplay = dailyRitualsDisplayRepo; if (!targetDisplay) { if (getElement('repositoryScreen')?.classList.contains('current')) { console.error("Daily rituals display list #dailyRitualsDisplayRepo not found!"); } return; }
     targetDisplay.innerHTML = ''; const completed = State.getState().completedRituals.daily || {}; const focused = State.getFocusedConcepts(); const scores = State.getScores();
     let activeRituals = [...dailyRituals];
     if (focusRituals) { focusRituals.forEach(ritual => { let meetsFocusReq = true; if (ritual.requiredFocusIds && Array.isArray(ritual.requiredFocusIds)) { for (const id of ritual.requiredFocusIds) { if (!focused.has(id)) { meetsFocusReq = false; break; } } } if (meetsFocusReq && ritual.requiredRoleFocusScore !== undefined && (scores.RF || 0) < ritual.requiredRoleFocusScore) { meetsFocusReq = false; } if (meetsFocusReq && ritual.requiredRoleFocusScoreBelow !== undefined && (scores.RF || 0) >= ritual.requiredRoleFocusScoreBelow) { meetsFocusReq = false; } if (meetsFocusReq) { activeRituals.push({ ...ritual, isFocusRitual: true }); } }); }
     if (activeRituals.length === 0) { targetDisplay.innerHTML = '<li>No daily rituals currently active. Check back tomorrow!</li>'; return; }
     activeRituals.sort((a,b) => a.id.localeCompare(b.id)).forEach(ritual => {
         const completedData = completed[ritual.id] || { completed: false, progress: 0 }; const isCompleted = completedData.completed; const progressNeeded = ritual.track?.count || 1; const progressText = progressNeeded > 1 ? ` (${completedData.progress}/${progressNeeded})` : ''; const li = document.createElement('li'); li.classList.toggle('completed', isCompleted); if(ritual.isFocusRitual) li.classList.add('focus-ritual'); let rewardText = '';
         if (ritual.reward) { if (ritual.reward.type === 'insight') rewardText = `(+${ritual.reward.amount} <i class="fas fa-brain insight-icon"></i>)`; else if (ritual.reward.type === 'attunement') { const elKey = ritual.reward.element; const elName = elKey === 'All' ? 'All' : Utils.getElementShortName(elementKeyToFullName[elKey] || elKey); rewardText = `(+${ritual.reward.amount} ${elName} Attun.)`; } else if (ritual.reward.type === 'token') rewardText = `(+1 ${ritual.reward.tokenType || 'Token'})`; }
         li.innerHTML = `${ritual.description}${progressText} <span class="ritual-reward">${rewardText}</span>`; targetDisplay.appendChild(li);
     });
}

// --- Settings Popup UI ---
export function showSettings() { if (settingsPopup) settingsPopup.classList.remove('hidden'); const onboardingActive = onboardingOverlay && !onboardingOverlay.classList.contains('hidden'); if (popupOverlay && !onboardingActive) { popupOverlay.classList.remove('hidden'); } }

// --- Tapestry Deep Dive / Resonance Chamber UI ---
export function displayTapestryDeepDive(analysisData) {
     if (!tapestryDeepDiveModal || !popupOverlay || !deepDiveNarrativeP || !deepDiveFocusIcons || !deepDiveAnalysisNodesContainer || !deepDiveDetailContent || !deepDiveTitle) { console.error("Resonance Chamber Modal elements missing!"); showTemporaryMessage("Error opening Resonance Chamber.", 3000); return; }
     console.log("UI: Displaying Resonance Chamber with analysis:", analysisData); deepDiveTitle.textContent = "Resonance Chamber"; deepDiveNarrativeP.innerHTML = analysisData.fullNarrativeHTML || "Could not generate narrative.";
     deepDiveFocusIcons.innerHTML = ''; const focused = State.getFocusedConcepts(); const discovered = State.getDiscoveredConcepts(); focused.forEach(id => { const concept = discovered.get(id)?.concept; if (concept) { let iconClass = "fa-solid fa-question-circle"; let iconColor = '#CCCCCC'; let iconTitle = concept.name; if (concept.primaryElement && elementKeyToFullName?.[concept.primaryElement]) { const elementShortNameKey = elementKeyToFullName[concept.primaryElement]; const elementData = elementDetails[elementShortNameKey] || {}; const fullName = elementData.name || elementShortNameKey; iconClass = Utils.getElementIcon(elementShortNameKey); iconColor = Utils.getElementColor(elementShortNameKey); iconTitle = `${concept.name} (${Utils.getElementShortName(fullName)})`; } else { iconClass = Utils.getCardTypeIcon(concept.cardType); } const icon = document.createElement('i'); icon.className = `${iconClass}`; icon.style.color = iconColor; icon.title = iconTitle; deepDiveFocusIcons.appendChild(icon); } });
     if (deepDiveDetailContent) deepDiveDetailContent.innerHTML = '<p><i>Select an Aspect to explore...</i></p>'; deepDiveAnalysisNodesContainer?.querySelectorAll('.aspect-node').forEach(btn => btn.classList.remove('active')); updateContemplationButtonState();
     tapestryDeepDiveModal.classList.remove('hidden'); const onboardingActive = onboardingOverlay && !onboardingOverlay.classList.contains('hidden'); if (popupOverlay && !onboardingActive) { popupOverlay.classList.remove('hidden'); }
}
export function displaySynergyTensionInfo(analysisData) {
    if (!tapestryDeepDiveModal || !popupOverlay || !deepDiveDetailContent || !deepDiveTitle) { console.error("Resonance Chamber elements missing for Synergy/Tension display!"); showTemporaryMessage("Error showing synergy details.", 3000); return; }
    console.log("UI: Displaying Synergy/Tension info in Resonance Chamber"); let content = '<h4>Synergies & Tensions</h4>'; if (analysisData.synergies.length > 0) { content += `<h5>Synergies Found:</h5><ul>${analysisData.synergies.map(s => `<li>${s.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}</ul><hr class="popup-hr">`; } else { content += `<p><em>No direct synergies detected between focused concepts.</em></p><hr class="popup-hr">`; } if (analysisData.tensions.length > 0) { content += `<h5>Tensions Noted:</h5><ul>${analysisData.tensions.map(t => `<li>${t.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}</ul>`; } else { content += `<p><em>No significant elemental tensions detected within the focus.</em></p>`; }
    if (deepDiveDetailContent) deepDiveDetailContent.innerHTML = content; deepDiveAnalysisNodesContainer?.querySelectorAll('.aspect-node').forEach(btn => { btn.classList.toggle('active', btn.dataset.nodeId === 'synergy'); });
    tapestryDeepDiveModal.classList.remove('hidden'); const onboardingActive = onboardingOverlay && !onboardingOverlay.classList.contains('hidden'); if (popupOverlay && !onboardingActive) { popupOverlay.classList.remove('hidden'); }
}
export function updateContemplationButtonState() {
    if (!contemplationNodeButton) return; const cooldownEnd = State.getContemplationCooldownEnd(); const now = Date.now(); const insight = State.getInsight(); const cost = Config.CONTEMPLATION_COST; let disabled = false; let title = `Contemplate your focus (${cost} Insight)`; let text = `<i class="fas fa-brain"></i> Focusing Lens (<span class="contemplation-cost">${cost}</span> <i class="fas fa-brain insight-icon"></i>)`;
    if (cooldownEnd && now < cooldownEnd) { const remaining = Math.ceil((cooldownEnd - now) / 1000); disabled = true; title = `Contemplation available in ${remaining}s`; text = `<i class="fas fa-hourglass-half"></i> On Cooldown (${remaining}s)`; } else if (insight < cost) { disabled = true; title = `Requires ${cost} Insight`; }
    contemplationNodeButton.disabled = disabled; contemplationNodeButton.title = title; contemplationNodeButton.innerHTML = text;
}
export function updateDeepDiveContent(htmlContent, nodeId) { if (!deepDiveDetailContent) return; console.log(`UI: Updating deep dive content for node: ${nodeId}`); deepDiveDetailContent.innerHTML = htmlContent; deepDiveAnalysisNodesContainer?.querySelectorAll('.aspect-node').forEach(btn => { btn.classList.toggle('active', btn.dataset.nodeId === nodeId); }); }
export function displayContemplationTask(task) {
    if (!deepDiveDetailContent || !task) return; console.log("UI: Displaying contemplation task:", task); let html = `<h4>Contemplation Task</h4><p>${task.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
    if (task.requiresCompletionButton) { const rewardText = task.reward.type === 'insight' ? `<i class="fas fa-brain insight-icon"></i>` : 'Attun.'; html += `<button id="completeContemplationBtn" class="button small-button btn">Mark Complete (+${task.reward.amount || '?'} ${rewardText})</button>`; }
    updateDeepDiveContent(html, 'contemplation'); const completeBtn = getElement('completeContemplationBtn'); if (completeBtn) { completeBtn.addEventListener('click', () => { GameLogic.handleCompleteContemplation(task); }, { once: true }); }
}
export function clearContemplationTask() { if (deepDiveDetailContent) { deepDiveDetailContent.innerHTML = '<p>Contemplation acknowledged. Select another Aspect to explore.</p>'; deepDiveAnalysisNodesContainer?.querySelector('.aspect-node[data-node-id="contemplation"]')?.classList.remove('active'); } updateContemplationButtonState(); }


// --- Elemental Dilemma Modal Display ---
export function displayElementalDilemma(dilemma) {
    const modal = getElement('dilemmaModal'); const situationEl = getElement('dilemmaSituationText'); const questionEl = getElement('dilemmaQuestionText'); const slider = getElement('dilemmaSlider'); const minLabelEl = getElement('dilemmaSliderMinLabel'); const maxLabelEl = getElement('dilemmaSliderMaxLabel'); const valueDisplayEl = getElement('dilemmaSliderValueDisplay'); const nudgeCheckbox = getElement('dilemmaNudgeCheckbox');
    if (!modal || !situationEl || !questionEl || !slider || !minLabelEl || !maxLabelEl || !valueDisplayEl || !nudgeCheckbox) { console.error("Dilemma modal elements missing!"); return; }
    situationEl.textContent = dilemma.situation; questionEl.textContent = dilemma.question; minLabelEl.textContent = dilemma.sliderMinLabel; maxLabelEl.textContent = dilemma.sliderMaxLabel; slider.value = 5; valueDisplayEl.textContent = "Balanced"; nudgeCheckbox.checked = false;
    slider.oninput = () => { const val = parseFloat(slider.value); let leaning; if (val < 1.5) leaning = `Strongly ${dilemma.sliderMinLabel}`; else if (val < 4.5) leaning = `Towards ${dilemma.sliderMinLabel}`; else if (val > 8.5) leaning = `Strongly ${dilemma.sliderMaxLabel}`; else if (val > 5.5) leaning = `Towards ${dilemma.sliderMaxLabel}`; else leaning = "Balanced"; valueDisplayEl.textContent = leaning; };
    modal.dataset.dilemmaId = dilemma.id; modal.dataset.keyMin = dilemma.elementKeyMin; modal.dataset.keyMax = dilemma.elementKeyMax;
    modal.classList.remove('hidden');
    const onboardingActive = onboardingOverlay && !onboardingOverlay.classList.contains('hidden');
    if (popupOverlay && !onboardingActive) { popupOverlay.classList.remove('hidden'); }
}

// --- Persona Action Buttons State ---
export function updateElementalDilemmaButtonState() { const btn = getElement('elementalDilemmaButton'); if (btn) { btn.disabled = false; btn.title = "Engage with an Elemental Dilemma for Insight."; } else { console.warn("UI: Elemental Dilemma Button not found!"); } }
export function updateExploreSynergyButtonStatus(status) {
    const btn = getElement('exploreSynergyButton'); if (!btn) return; const hasFocus = State.getFocusedConcepts().size >= 2; btn.disabled = !hasFocus; btn.classList.remove('highlight-synergy', 'highlight-tension');
    if (!hasFocus) { btn.title = "Focus at least 2 concepts"; btn.textContent = "Explore Synergy"; }
    else { btn.title = "Explore synergies and tensions between focused concepts"; btn.textContent = "Explore Synergy"; if (status === 'synergy') { btn.classList.add('highlight-synergy'); btn.title += " (Synergy detected!)"; btn.textContent = "Explore Synergy ✨"; } else if (status === 'tension') { btn.classList.add('highlight-tension'); btn.title += " (Tension detected!)"; btn.textContent = "Explore Synergy ⚡"; } else if (status === 'both') { btn.classList.add('highlight-synergy', 'highlight-tension'); btn.title += " (Synergy & Tension detected!)"; btn.textContent = "Explore Synergy 💥"; } }
}
export function updateSuggestSceneButtonState() { const btn = getElement('suggestSceneButton'); if (!btn) return; const costDisplay = getElement('sceneSuggestCostDisplay'); const hasFocus = State.getFocusedConcepts().size > 0; const canAfford = State.getInsight() >= Config.SCENE_SUGGESTION_COST; btn.disabled = !hasFocus || !canAfford; if (!hasFocus) btn.title = "Focus on concepts first"; else if (!canAfford) btn.title = `Requires ${Config.SCENE_SUGGESTION_COST} Insight`; else btn.title = `Suggest resonant scenes (${Config.SCENE_SUGGESTION_COST} Insight)`; if(costDisplay) costDisplay.textContent = Config.SCENE_SUGGESTION_COST; }

// --- Display Research Status ---
export function displayResearchStatus(message) { showTemporaryMessage(message, 2000); }

// --- Initial UI Setup Helper ---
export function setupInitialUI() {
    console.log("UI: Setting up initial UI state (v4 + Polish)");
    if(mainNavBar) mainNavBar.classList.add('hidden');
    if (loadButton) { loadButton.classList.toggle('hidden', !localStorage.getItem(Config.SAVE_KEY)); }
    else { console.warn("Load button element not found during initial setup."); }
    updateSuggestSceneButtonState(); updateElementalDilemmaButtonState(); updateExploreSynergyButtonStatus('none'); updateInsightBoostButtonState(); populateGrimoireFilters();
    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark') { document.documentElement.classList.add('dark'); }
}

// --- Onboarding UI ---
export function showOnboarding(phase) {
    if (!onboardingOverlay || !onboardingPopup || !onboardingContent || !onboardingProgressSpan || !onboardingPrevButton || !onboardingNextButton || !onboardingSkipButton) { console.error("Onboarding UI elements missing!"); State.markOnboardingComplete(); return; }
    if (phase <= 0 || phase > Config.MAX_ONBOARDING_PHASE || State.isOnboardingComplete()) { hideOnboarding(); return; }
    const task = onboardingTasks.find(t => t.phaseRequired === phase);
    if (!task) { console.warn(`Onboarding task for phase ${phase} not found.`); hideOnboarding(); State.markOnboardingComplete(); return; }
    console.log(`UI: Showing onboarding phase ${phase}`);
    const taskText = task.description || task.text || 'Follow the instructions...';
    onboardingContent.innerHTML = `<p>${taskText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
    if (task.hint) { onboardingContent.innerHTML += `<p><small><em>Hint: ${task.hint}</em></small></p>`; }
    onboardingProgressSpan.textContent = `Step ${phase} of ${Config.MAX_ONBOARDING_PHASE}`;
    onboardingPrevButton.disabled = (phase === 1);
    onboardingNextButton.textContent = (phase === Config.MAX_ONBOARDING_PHASE) ? "Finish Orientation" : "Next";
    onboardingOverlay.classList.add('visible'); onboardingOverlay.classList.remove('hidden'); onboardingPopup.classList.remove('hidden'); onboardingOverlay.removeAttribute('aria-hidden'); popupOverlay?.classList.add('hidden');
    setTimeout(() => { updateOnboardingHighlight(task.highlightElementId); }, 100);
}
export function hideOnboarding() {
    if (onboardingOverlay) { onboardingOverlay.classList.add('hidden'); onboardingOverlay.classList.remove('visible'); onboardingOverlay.setAttribute('aria-hidden', 'true'); }
    if (onboardingPopup) onboardingPopup.classList.add('hidden'); updateOnboardingHighlight(null); console.log("UI: Hiding onboarding.");
     const anyGeneralPopupVisible = document.querySelector('.popup:not(.hidden):not(.onboarding-popup)'); if (!anyGeneralPopupVisible && popupOverlay) { popupOverlay.classList.add('hidden'); }
}
function updateOnboardingHighlight(elementId) {
    if (!onboardingHighlight) { console.warn("Onboarding highlight element missing"); return; }
    const targetElement = elementId ? getElement(elementId) : null;
    if (targetElement && targetElement.offsetParent !== null) {
        const rect = targetElement.getBoundingClientRect();
        onboardingHighlight.style.left = `${rect.left - 5 + window.scrollX}px`; onboardingHighlight.style.top = `${rect.top - 5 + window.scrollY}px`; onboardingHighlight.style.width = `${rect.width + 10}px`; onboardingHighlight.style.height = `${rect.height + 10}px`; onboardingHighlight.style.display = 'block';
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }); console.log(`UI: Highlighting element: ${elementId}`);
    } else { onboardingHighlight.style.display = 'none'; if(elementId) console.log(`UI: Cannot highlight hidden/missing element: ${elementId}`); }
}

// --- Update Note Save Status ---
export function updateNoteSaveStatus(message, isError = false) { if (noteSaveStatusSpan) { noteSaveStatusSpan.textContent = message; noteSaveStatusSpan.classList.toggle('error', isError); setTimeout(() => { if(noteSaveStatusSpan) noteSaveStatusSpan.textContent = ""; }, 2500); } }

console.log("ui.js loaded. (Enhanced v4.10 + Progress Bar/Accordion)");
// --- END OF CORRECTED ui.js ---
