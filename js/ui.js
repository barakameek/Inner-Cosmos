// --- START OF COMPLETE ui.js ---

// js/ui.js - Handles DOM Manipulation and UI Updates
import * as State from './state.js';
import * as Config from './config.js';
import * as Utils from './utils.js';
import * as GameLogic from './gameLogic.js'; // Needed for button actions
import {
    elementDetails, elementKeyToFullName, elementNameToKey, concepts, questionnaireGuided,
    reflectionPrompts, elementDeepDive, dailyRituals, milestones, focusRituals,
    sceneBlueprints, alchemicalExperiments, elementalInsights, focusDrivenUnlocks,
    cardTypeKeys, elementNames, grimoireShelves, elementalDilemmas // Import dilemmas
} from '../data.js'; // Assumes data.js is in parent directory

console.log("ui.js loading...");

// --- DOM Element References ---
// (Keep all the existing DOM element references from the previous version)
const saveIndicator = document.getElementById('saveIndicator');
const screens = document.querySelectorAll('.screen');
const welcomeScreen = document.getElementById('welcomeScreen');
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
const tapestryNarrativeP = document.getElementById('tapestryNarrative'); // In Constellation section
const personaThemesList = document.getElementById('personaThemesList');
const summaryContentDiv = document.getElementById('summaryContent');
// Persona Summary Specific Divs
const summaryCoreEssenceTextDiv = document.getElementById('summaryCoreEssenceText');
const summaryTapestryInfoDiv = document.getElementById('summaryTapestryInfo');
const personaScoreChartCanvas = document.getElementById('personaScoreChartCanvas'); // Canvas for chart

// Study Screen (Unified Structure Refs)
const studyScreen = document.getElementById('studyScreen');
const initialDiscoveryGuidance = document.getElementById('initialDiscoveryGuidance');
const initialDiscoveryElements = document.getElementById('initialDiscoveryElements');
const studyResearchDiscoveries = document.getElementById('studyResearchDiscoveries');
const studyActionsArea = studyScreen?.querySelector('.study-actions-area');
const freeResearchButton = document.getElementById('freeResearchButton');
const seekGuidanceButton = document.getElementById('seekGuidanceButton');
const userInsightDisplayStudy = document.getElementById('userInsightDisplayStudy');
const dailyRitualsDisplay = document.getElementById('dailyRitualsDisplay');
const guidedReflectionCostDisplay = document.getElementById('guidedReflectionCostDisplay');
const ritualsAlcove = studyScreen?.querySelector('.rituals-alcove');
// Grimoire Screen
const grimoireScreen = document.getElementById('grimoireScreen');
const grimoireCountSpan = document.getElementById('grimoireCount');
const grimoireGuidance = document.getElementById('grimoireGuidance');
const grimoireControls = document.getElementById('grimoireControls');
const grimoireFilterControls = grimoireControls?.querySelector('.filter-controls');
const grimoireTypeFilter = document.getElementById('grimoireTypeFilter');
const grimoireElementFilter = document.getElementById('grimoireElementFilter');
const grimoireRarityFilter = document.getElementById('grimoireRarityFilter');
const grimoireSortOrder = document.getElementById('grimoireSortOrder');
const grimoireSearchInput = document.getElementById('grimoireSearchInput');
const grimoireFocusFilter = document.getElementById('grimoireFocusFilter');
const grimoireContentDiv = document.getElementById('grimoireContent');
const grimoireShelvesContainer = document.getElementById('grimoireShelvesContainer');
const grimoireCardArea = document.getElementById('grimoireContent');

// Repository Screen
const repositoryScreen = document.getElementById('repositoryScreen');
const repositoryFocusUnlocksDiv = document.getElementById('repositoryFocusUnlocks')?.querySelector('.repo-list');
const repositoryScenesDiv = document.getElementById('repositoryScenes')?.querySelector('.repo-list');
const repositoryExperimentsDiv = document.getElementById('repositoryExperiments')?.querySelector('.repo-list');
const repositoryInsightsDiv = document.getElementById('repositoryInsights')?.querySelector('.repo-list');
const milestonesDisplay = document.getElementById('milestonesDisplay');

// --- Concept Detail Popup Elements ---
const conceptDetailPopup = document.getElementById('conceptDetailPopup');
const popupOverlay = document.getElementById('popupOverlay');
const closePopupButton = document.getElementById('closePopupButton');
const popupCardTypeIcon = document.getElementById('popupCardTypeIcon');
const popupConceptName = document.getElementById('popupConceptName');
const popupConceptType = document.getElementById('popupConceptType');
const popupVisualContainer = document.getElementById('popupVisualContainer');
const popupBriefDescription = document.getElementById('popupBriefDescription');
const popupDetailedDescription = document.getElementById('popupDetailedDescription');
const popupResonanceGaugeContainer = document.getElementById('popupResonanceGaugeContainer');
const popupResonanceGaugeBar = document.getElementById('popupResonanceGaugeBar');
const popupResonanceGaugeLabel = document.getElementById('popupResonanceGaugeLabel');
const popupResonanceGaugeText = document.getElementById('popupResonanceGaugeText');
const popupRelatedConceptsTags = document.getElementById('popupRelatedConceptsTags');
const popupLoreSection = document.getElementById('popupLoreSection');
const popupLoreContent = document.getElementById('popupLoreContent');
const popupRecipeDetailsSection = document.getElementById('popupRecipeDetails');
const popupComparisonHighlights = document.getElementById('popupComparisonHighlights');
const popupConceptProfile = document.getElementById('popupConceptProfile');
const popupUserComparisonProfile = document.getElementById('popupUserComparisonProfile');
const myNotesSection = document.getElementById('myNotesSection');
const myNotesTextarea = document.getElementById('myNotesTextarea');
const saveMyNoteButton = document.getElementById('saveMyNoteButton');
const noteSaveStatusSpan = document.getElementById('noteSaveStatus');
const addToGrimoireButton = document.getElementById('addToGrimoireButton');
const markAsFocusButton = document.getElementById('markAsFocusButton');

// --- Reflection Modal Elements ---
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

// --- Settings Popup Elements ---
const settingsPopup = document.getElementById('settingsPopup');
const closeSettingsPopupButton = document.getElementById('closeSettingsPopupButton');
const forceSaveButton = document.getElementById('forceSaveButton');
const resetAppButton = document.getElementById('resetAppButton');

// --- Alerts & Toast Elements ---
const milestoneAlert = document.getElementById('milestoneAlert');
const milestoneAlertText = document.getElementById('milestoneAlertText');
const closeMilestoneAlertButton = document.getElementById('closeMilestoneAlertButton');
const toastElement = document.getElementById('toastNotification');
const toastMessageElement = document.getElementById('toastMessage');

// --- Persona Action Buttons ---
const elementalDilemmaButton = document.getElementById('elementalDilemmaButton');
const exploreSynergyButton = document.getElementById('exploreSynergyButton');
const suggestSceneButton = document.getElementById('suggestSceneButton');
const sceneSuggestCostDisplay = document.getElementById('sceneSuggestCostDisplay');
const addInsightButton = document.getElementById('addInsightButton');

// --- Tapestry Deep Dive Modal (Resonance Chamber) Elements ---
const tapestryDeepDiveModal = document.getElementById('tapestryDeepDiveModal');
const deepDiveTitle = document.getElementById('deepDiveTitle');
const closeDeepDiveButton = document.getElementById('closeDeepDiveButton');
const deepDiveNarrativeP = document.getElementById('deepDiveNarrativeP');
const deepDiveFocusIcons = document.getElementById('deepDiveFocusIcons');
const deepDiveAnalysisNodesContainer = document.getElementById('deepDiveAnalysisNodes');
const deepDiveDetailContent = document.getElementById('deepDiveDetailContent');
const contemplationNodeButton = document.getElementById('contemplationNode');

// --- Elemental Dilemma Modal Elements ---
const dilemmaModal = document.getElementById('dilemmaModal');
const closeDilemmaModalButton = document.getElementById('closeDilemmaModalButton');
const dilemmaSituationText = document.getElementById('dilemmaSituationText');
const dilemmaQuestionText = document.getElementById('dilemmaQuestionText');
const dilemmaSlider = document.getElementById('dilemmaSlider');
const dilemmaSliderMinLabel = document.getElementById('dilemmaSliderMinLabel');
const dilemmaSliderMaxLabel = document.getElementById('dilemmaSliderMaxLabel');
const dilemmaSliderValueDisplay = document.getElementById('dilemmaSliderValueDisplay');
const dilemmaNudgeCheckbox = document.getElementById('dilemmaNudgeCheckbox');
const confirmDilemmaButton = document.getElementById('confirmDilemmaButton');

// --- Info Popup Elements ---
const infoPopupElement = document.getElementById('infoPopup');
const infoPopupContent = document.getElementById('infoPopupContent');
const closeInfoPopupButton = document.getElementById('closeInfoPopupButton');
const confirmInfoPopupButton = document.getElementById('confirmInfoPopupButton');


// --- Utility UI Functions ---
let toastTimeout = null;
export function showTemporaryMessage(message, duration = 3000, isGuidance = false) { if (!toastElement || !toastMessageElement) { console.warn("Toast elements missing:", message); return; } console.info(`Toast: ${message}`); toastMessageElement.textContent = message; toastElement.classList.toggle('guidance-toast', isGuidance); if (toastTimeout) { clearTimeout(toastTimeout); } toastElement.classList.remove('hidden', 'visible'); void toastElement.offsetWidth; toastElement.classList.add('visible'); toastElement.classList.remove('hidden'); toastTimeout = setTimeout(() => { toastElement.classList.remove('visible'); setTimeout(() => { if (toastElement && !toastElement.classList.contains('visible')) { toastElement.classList.add('hidden'); } }, 500); toastTimeout = null; }, duration); }
let milestoneTimeout = null;
export function showMilestoneAlert(text) { if (!milestoneAlert || !milestoneAlertText) return; milestoneAlertText.textContent = `Milestone: ${text}`; milestoneAlert.classList.remove('hidden'); if (milestoneTimeout) clearTimeout(milestoneTimeout); milestoneTimeout = setTimeout(hideMilestoneAlert, 5000); }
export function hideMilestoneAlert() { if (milestoneAlert) milestoneAlert.classList.add('hidden'); if (milestoneTimeout) clearTimeout(milestoneTimeout); milestoneTimeout = null; }
export function hidePopups() { if (conceptDetailPopup) conceptDetailPopup.classList.add('hidden'); if (reflectionModal) reflectionModal.classList.add('hidden'); if (settingsPopup) settingsPopup.classList.add('hidden'); if (tapestryDeepDiveModal) tapestryDeepDiveModal.classList.add('hidden'); if (dilemmaModal) dilemmaModal.classList.add('hidden'); if (infoPopupElement) infoPopupElement.classList.add('hidden'); const anyPopupVisible = document.querySelector('.popup:not(.hidden)'); if (!anyPopupVisible && popupOverlay) popupOverlay.classList.add('hidden'); GameLogic.clearPopupState(); }

// --- Screen Management ---
let previousScreenId = 'welcomeScreen';
export function showScreen(screenId) {
    console.log("UI: Showing screen:", screenId);
    const currentState = State.getState();
    const isPostQuestionnaire = currentState.questionnaireCompleted;

    screens.forEach(screen => {
        if(screen) {
             screen.classList.toggle('current', screen.id === screenId);
             screen.classList.toggle('hidden', screen.id !== screenId);
        } else {
            const screenElements = document.querySelectorAll('.screen');
            const missingId = Array.from(screenElements).find(s => !s)?.id || 'unknown';
            console.warn(`UI Warning: Screen element with ID potentially '${missingId}' not found during showScreen.`);
        }
    });

    if (mainNavBar) {
        mainNavBar.classList.toggle('hidden', !isPostQuestionnaire || screenId === 'welcomeScreen' || screenId === 'questionnaireScreen');
    }
    navButtons.forEach(button => {
        if (button) {
             button.classList.toggle('active', button.dataset.target === screenId);
             button.classList.toggle('hidden-by-flow', !isPostQuestionnaire && !['welcomeScreen', 'questionnaireScreen'].includes(button.dataset.target) && button.id !== 'settingsButton');
        }
    });

    if (isPostQuestionnaire) {
        if (studyActionsArea) studyActionsArea.classList.remove('hidden-by-flow');
        if (ritualsAlcove) ritualsAlcove.classList.remove('hidden-by-flow');
        if (freeResearchButton) freeResearchButton.classList.remove('hidden-by-flow');
        if (seekGuidanceButton) seekGuidanceButton.classList.remove('hidden-by-flow');
        if (grimoireFilterControls) grimoireFilterControls.classList.remove('hidden-by-flow');
        if (grimoireShelvesContainer) grimoireShelvesContainer.classList.remove('hidden-by-flow');
        if (elementalDilemmaButton) elementalDilemmaButton.classList.remove('hidden-by-flow');
        if (exploreSynergyButton) exploreSynergyButton.classList.remove('hidden-by-flow');
        if (suggestSceneButton) suggestSceneButton.classList.remove('hidden-by-flow');
        if (repositoryScreen) repositoryScreen.classList.remove('hidden-by-flow');
        if (addInsightButton) addInsightButton.classList.remove('hidden-by-flow');


        if (screenId === 'studyScreen') { displayStudyScreenContent(); }
        else if (screenId === 'personaScreen') {
             const justFinishedQuestionnaire = previousScreenId === 'questionnaireScreen';
             if (justFinishedQuestionnaire && personaSummaryView && personaDetailedView && showSummaryViewBtn && showDetailedViewBtn) {
                 personaSummaryView.classList.remove('hidden'); personaSummaryView.classList.add('current');
                 personaDetailedView.classList.add('hidden'); personaDetailedView.classList.remove('current');
                 showSummaryViewBtn.classList.add('active'); showDetailedViewBtn.classList.remove('active');
                 displayPersonaSummary(); // Call summary display logic
             } else {
                 if (!personaDetailedView?.classList.contains('current') && !personaSummaryView?.classList.contains('current')) {
                      personaDetailedView?.classList.remove('hidden'); personaDetailedView?.classList.add('current');
                      showDetailedViewBtn?.classList.add('active');
                      personaSummaryView?.classList.add('hidden'); personaSummaryView?.classList.remove('current');
                      showSummaryViewBtn?.classList.remove('active');
                 }
                 // Ensure correct view is populated
                 if (personaDetailedView?.classList.contains('current')) {
                     GameLogic.displayPersonaScreenLogic(); // This handles calculating narrative etc. for detailed view
                 } else if (personaSummaryView?.classList.contains('current')) {
                     displayPersonaSummary(); // Handle populating summary view
                 }
             }
        } else if (screenId === 'grimoireScreen') { handleFirstGrimoireVisit(); refreshGrimoireDisplay(); }
        else if (screenId === 'repositoryScreen') { displayRepositoryContent(); }

    } else if (screenId === 'questionnaireScreen') {
         if(currentState.currentElementIndex >= 0 && currentState.currentElementIndex < elementNames.length) {
             displayElementQuestions(currentState.currentElementIndex);
         }
    }

    if (['questionnaireScreen', 'grimoireScreen', 'personaScreen', 'studyScreen', 'repositoryScreen'].includes(screenId)) {
        window.scrollTo(0, 0);
    }
    previousScreenId = screenId;
}

// --- Insight Display & Related UI Updates ---
export function updateInsightDisplays() {
    const insightValue = State.getInsight();
    const insight = insightValue.toFixed(1);
    if (userInsightDisplayPersona) userInsightDisplayPersona.textContent = insight;
    if (userInsightDisplayStudy) userInsightDisplayStudy.textContent = insight;

    updateInsightBoostButtonState(); // Update boost button state

    if (studyScreen?.classList.contains('current')) {
        displayStudyScreenContent(); // Re-render study content which includes button states
    }
    if (personaScreen?.classList.contains('current')) {
        // Refresh deep dive unlock buttons
        const deepDiveContainers = personaElementDetailsDiv?.querySelectorAll('.element-deep-dive-container:not(.hidden)');
        deepDiveContainers?.forEach(container => {
            const elementKey = container.dataset.elementKey;
            if (elementKey) displayElementDeepDive(elementKey, container); // Re-render deep dive section
        });
        updateSuggestSceneButtonState(); // Update suggest scene button
        GameLogic.checkSynergyTensionStatus(); // Update synergy button
    }
    if (repositoryScreen?.classList.contains('current')) {
        displayRepositoryContent(); // Re-render repo which includes button states
    }
    // Update popup if open
    const popupConceptId = GameLogic.getCurrentPopupConceptId();
    if (popupConceptId !== null && conceptDetailPopup && !conceptDetailPopup.classList.contains('hidden')) {
        const concept = concepts.find(c => c.id === popupConceptId);
        if(concept && popupLoreContent) { // Update lore unlock buttons
            popupLoreContent.querySelectorAll('.unlock-lore-button').forEach(button => {
                const cost = parseFloat(button.dataset.cost);
                const canAfford = insightValue >= cost;
                button.disabled = !canAfford;
                button.title = canAfford ? `Unlock for ${cost} Insight` : `Requires ${cost} Insight`;
            });
        }
        // Update sell button text/value if needed
        const sellButton = conceptDetailPopup.querySelector('.popup-sell-button');
        if (sellButton && concept) {
            let discoveryValue = Config.CONCEPT_DISCOVERY_INSIGHT[concept.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default;
            const sellValue = discoveryValue * Config.SELL_INSIGHT_FACTOR;
            sellButton.textContent = `Sell (${sellValue.toFixed(1)})`;
            sellButton.innerHTML += ` <i class="fas fa-brain insight-icon"></i>`;
            const sourceLoc = sellButton.dataset.context === 'grimoire' ? 'Grimoire' : 'Research Notes';
            sellButton.title = `Sell from ${sourceLoc} for ${sellValue.toFixed(1)} Insight.`;
        }
    }
    updateContemplationButtonState(); // Update contemplation button in its modal
}

// --- Insight Boost Button State ---
let insightBoostTimeoutId = null; // Store the timeout ID
export function updateInsightBoostButtonState() {
    const btn = document.getElementById('addInsightButton');
    if (!btn) return;

    const cooldownEnd = State.getInsightBoostCooldownEnd();
    const now = Date.now();

    // Clear any existing timeout before setting a new one
    if (insightBoostTimeoutId) {
        clearTimeout(insightBoostTimeoutId);
        insightBoostTimeoutId = null;
    }

    if (cooldownEnd && now < cooldownEnd) {
        const remaining = Math.ceil((cooldownEnd - now) / 1000);
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-hourglass-half"></i> ${remaining}s`;
        btn.title = `Insight boost available in ${remaining} seconds.`;
        insightBoostTimeoutId = setTimeout(updateInsightBoostButtonState, 1000);
    } else {
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-plus"></i> Add Insight`;
        btn.title = `Get an Insight boost (${Config.INSIGHT_BOOST_AMOUNT} Insight, ${Config.INSIGHT_BOOST_COOLDOWN / 60000} min cooldown)`;
    }
}

// --- Questionnaire UI ---
export function initializeQuestionnaireUI() { console.log("UI: Initializing Questionnaire UI"); State.updateElementIndex(0); updateElementProgressHeader(-1); displayElementQuestions(0); if (mainNavBar) mainNavBar.classList.add('hidden'); if (dynamicScoreFeedback) dynamicScoreFeedback.style.display = 'none'; console.log("UI: Questionnaire UI initialized."); }
export function updateElementProgressHeader(activeIndex) { if (!elementProgressHeader) return; elementProgressHeader.innerHTML = ''; elementNames.forEach((name, index) => { const tab = document.createElement('div'); tab.classList.add('element-tab'); const elementData = elementDetails[name] || {}; tab.textContent = elementData.name || name; tab.title = elementData.name || name; tab.classList.toggle('completed', index < activeIndex); tab.classList.toggle('active', index === activeIndex); elementProgressHeader.appendChild(tab); }); }
export function displayElementQuestions(index) { const actualIndex = State.getState().currentElementIndex; const displayIndex = (actualIndex >= 0 && actualIndex < elementNames.length) ? actualIndex : index; console.log(`UI: Displaying Qs requested index ${index}, using state index ${displayIndex}`); if (displayIndex >= elementNames.length) { GameLogic.finalizeQuestionnaire(); return; } const elementName = elementNames[displayIndex]; const elementData = elementDetails[elementName] || {}; const questions = questionnaireGuided[elementName] || []; if (!questionContent) { console.error("questionContent element missing!"); return; } const elementAnswers = State.getState().userAnswers?.[elementName] || {}; let introHTML = `<div class="element-intro"><h2>${elementData.name || elementName}</h2><p><em>${elementData.coreQuestion || ''}</em></p><p>${elementData.coreConcept || 'Loading...'}</p><p><small><strong>Persona Connection:</strong> ${elementData.personaConnection || ''}</small></p></div>`; let questionsHTML = ''; questions.forEach(q => { let inputHTML = `<div class="question-block" id="block_${q.qId}"><h3 class="question-title">${q.text}</h3><div class="input-container">`; const savedAnswer = elementAnswers[q.qId]; let sliderValue = q.defaultValue; if (q.type === "slider") { sliderValue = (savedAnswer !== undefined && !isNaN(parseFloat(savedAnswer))) ? parseFloat(savedAnswer) : q.defaultValue; inputHTML += `<div class="slider-container"><input type="range" id="${q.qId}" class="slider q-input" min="${q.minValue}" max="${q.maxValue}" step="${q.step || 0.5}" value="${sliderValue}" data-question-id="${q.qId}" data-type="slider"><div class="label-container"><span class="label-text">${q.minLabel}</span><span class="label-text">${q.maxLabel}</span></div><p class="value-text">Selected: <span id="display_${q.qId}">${parseFloat(sliderValue).toFixed(1)}</span></p><p class="slider-feedback" id="feedback_${q.qId}"></p></div>`; } else if (q.type === "radio") { inputHTML += `<div class="radio-options">`; q.options.forEach(opt => { const checked = savedAnswer === opt.value ? 'checked' : ''; inputHTML += `<div><input type="radio" id="${q.qId}_${opt.value}" class="q-input" name="${q.qId}" value="${opt.value}" ${checked} data-question-id="${q.qId}" data-type="radio"><label for="${q.qId}_${opt.value}">${opt.value}</label></div>`; }); inputHTML += `</div>`; } else if (q.type === "checkbox") { inputHTML += `<div class="checkbox-options">`; q.options.forEach(opt => { const checked = Array.isArray(savedAnswer) && savedAnswer.includes(opt.value) ? 'checked' : ''; inputHTML += `<div><input type="checkbox" id="${q.qId}_${opt.value}" class="q-input" name="${q.qId}" value="${opt.value}" ${checked} data-question-id="${q.qId}" data-max-choices="${q.maxChoices || 2}" data-type="checkbox"><label for="${q.qId}_${opt.value}">${opt.value}</label></div>`; }); inputHTML += `</div>`; } inputHTML += `</div></div>`; questionsHTML += inputHTML; }); if (questions.length === 0) questionsHTML = '<p><em>(No questions for this element)</em></p>'; questionContent.innerHTML = introHTML; const introDiv = questionContent.querySelector('.element-intro'); if (introDiv) introDiv.insertAdjacentHTML('afterend', questionsHTML); else questionContent.innerHTML += questionsHTML; questionContent.querySelectorAll('.q-input').forEach(input => { const eventType = (input.type === 'range') ? 'input' : 'change'; input.removeEventListener(eventType, GameLogic.handleQuestionnaireInputChange); input.addEventListener(eventType, GameLogic.handleQuestionnaireInputChange); }); questionContent.querySelectorAll('input[type="checkbox"].q-input').forEach(checkbox => { checkbox.removeEventListener('change', GameLogic.handleCheckboxChange); checkbox.addEventListener('change', GameLogic.handleCheckboxChange); }); questionContent.querySelectorAll('.slider.q-input').forEach(slider => { updateSliderFeedbackText(slider, elementName); }); updateDynamicFeedback(elementName, elementAnswers); updateElementProgressHeader(displayIndex); if (progressText) progressText.textContent = `Element ${displayIndex + 1} / ${elementNames.length}: ${elementData.name || elementName}`; if (prevElementButton) prevElementButton.style.visibility = (displayIndex > 0) ? 'visible' : 'hidden'; if (nextElementButton) nextElementButton.textContent = (displayIndex === elementNames.length - 1) ? "View Initial Discoveries" : "Next Element"; console.log(`UI: Finished displaying questions for ${elementName} at index ${displayIndex}`); }
export function updateSliderFeedbackText(sliderElement, elementName) { if (!sliderElement || sliderElement.type !== 'range') return; const qId = sliderElement.dataset.questionId; const feedbackElement = document.getElementById(`feedback_${qId}`); if (!feedbackElement) return; const currentValue = parseFloat(sliderElement.value); const display = document.getElementById(`display_${qId}`); if(display) display.textContent = currentValue.toFixed(1); if (!elementName) { console.warn("updateSliderFeedbackText called without elementName!"); feedbackElement.textContent = `(Score: ${currentValue.toFixed(1)})`; return; } const interpretations = elementDetails?.[elementName]?.scoreInterpretations; if (!interpretations) { feedbackElement.textContent = `(Score: ${currentValue.toFixed(1)})`; return; } const scoreLabel = Utils.getScoreLabel(currentValue); const interpretationText = interpretations[scoreLabel] || `Interpretation for "${scoreLabel}" not found.`; feedbackElement.textContent = interpretationText; feedbackElement.title = `Meaning of score ${currentValue.toFixed(1)} (${scoreLabel})`; }
export function updateDynamicFeedback(elementName, currentAnswers) { const elementData = elementDetails?.[elementName]; if (!elementData || !dynamicScoreFeedback || !feedbackElementSpan || !feedbackScoreSpan || !feedbackScoreBar) { if(dynamicScoreFeedback) dynamicScoreFeedback.style.display = 'none'; return; } const tempScore = GameLogic.calculateElementScore(elementName, currentAnswers); const scoreLabel = Utils.getScoreLabel(tempScore); feedbackElementSpan.textContent = elementData.name || elementName; feedbackScoreSpan.textContent = tempScore.toFixed(1); // Find parent node to ensure correct insertion point
    let scoreParent = feedbackScoreSpan?.parentNode; let labelSpan = scoreParent ? scoreParent.querySelector('.score-label') : null; if (!labelSpan && scoreParent) { labelSpan = document.createElement('span'); labelSpan.classList.add('score-label'); scoreParent.insertBefore(labelSpan, feedbackScoreSpan.nextSibling); } if (labelSpan) { labelSpan.textContent = ` (${scoreLabel})`; } else { console.warn("Could not find/create score label span."); } feedbackScoreBar.style.width = `${tempScore * 10}%`; dynamicScoreFeedback.style.display = 'block'; }
export function getQuestionnaireAnswers() { const answers = {}; const inputs = questionContent?.querySelectorAll('.q-input'); if (!inputs) return answers; inputs.forEach(input => { const qId = input.dataset.questionId; const type = input.dataset.type; if (!qId) return; if (type === 'slider') answers[qId] = parseFloat(input.value); else if (type === 'radio') { if (input.checked) answers[qId] = input.value; } else if (type === 'checkbox') { if (!answers[qId]) answers[qId] = []; if (input.checked) answers[qId].push(input.value); } }); return answers; }

// --- Persona Screen UI ---
export function displayPersonaScreen() {
    if (!personaElementDetailsDiv) { console.error("Persona element details div not found!"); return; }
    console.log("UI: Displaying Persona Screen");
    personaElementDetailsDiv.innerHTML = ''; // Clear previous details
    const scores = State.getScores();
    const showDeepDiveContainer = State.getState().questionnaireCompleted;

    elementNames.forEach(elementName => {
        const key = elementNameToKey[elementName];
        const score = (typeof scores[key] === 'number' && !isNaN(scores[key])) ? scores[key] : 5.0;
        const scoreLabel = Utils.getScoreLabel(score);
        const elementData = elementDetails[elementName] || {};
        const interpretation = elementData.scoreInterpretations?.[scoreLabel] || "Interpretation not available.";
        const barWidth = score ? (score / 10) * 100 : 0;
        const color = Utils.getElementColor(elementName);
        const iconClass = Utils.getElementIcon(elementName);

        const details = document.createElement('details');
        details.classList.add('element-detail-entry');
        details.dataset.elementKey = key;
        details.style.setProperty('--element-color', color);

        const descriptionDiv = document.createElement('div');
        descriptionDiv.classList.add('element-description');
        // Basic info
        descriptionDiv.innerHTML = `
            <p><strong>Core Concept:</strong> ${elementData.coreConcept || ''}</p>
            <p><strong>Elaboration:</strong> ${elementData.elaboration || ''}</p>
            <hr class="content-hr">
            <p><strong>Your Score (${scoreLabel}):</strong> ${interpretation}</p>
            <p><small><strong>Examples:</strong> ${elementData.examples || ''}</small></p>
        `;
        // Prepare container for attunement and deep dive
        const deepDiveContainer = document.createElement('div');
        deepDiveContainer.classList.add('element-deep-dive-container');
        deepDiveContainer.dataset.elementKey = key;
        deepDiveContainer.classList.add('hidden'); // Hide initially

        // Placeholder for Attunement (will be added by displayElementAttunement)
        const attunementPlaceholder = document.createElement('div');
        attunementPlaceholder.className = 'attunement-placeholder'; // This will be replaced

        // Append placeholders and deep dive container
        descriptionDiv.appendChild(document.createElement('hr')); // Separator before attunement
        descriptionDiv.appendChild(attunementPlaceholder);
        descriptionDiv.appendChild(deepDiveContainer);

        // Construct the full element details entry
        details.innerHTML = `
            <summary class="element-detail-header">
                <div>
                    <i class="${iconClass} element-icon-indicator" style="color: ${color};" title="${elementData.name || elementName}"></i>
                    <strong>${elementData.name || elementName}:</strong>
                    <span>${score?.toFixed(1) ?? '?'}</span>
                    <span class="score-label">(${scoreLabel})</span>
                </div>
                <div class="score-bar-container">
                    <div style="width: ${barWidth}%; background-color: ${color};"></div>
                </div>
            </summary>
        `;
        details.appendChild(descriptionDiv); // Append the description div containing everything else
        personaElementDetailsDiv.appendChild(details);

        // Populate deep dive if applicable AFTER element is in DOM
        if (showDeepDiveContainer) {
            displayElementDeepDive(key, deepDiveContainer); // Pass the specific container
            deepDiveContainer.classList.remove('hidden');
        }
    });

    // Now populate attunement AFTER all elements are in the DOM
    displayElementAttunement(); // This will find and replace placeholders

    // Update other Persona screen elements
    updateInsightDisplays();
    displayFocusedConceptsPersona();
    generateTapestryNarrative(); // UI function calls Logic function internally
    synthesizeAndDisplayThemesPersona(); // UI function calls Logic function internally
    displayPersonaSummary(); // Display summary view content (which also calls draw chart)
    updateElementalDilemmaButtonState();
    updateSuggestSceneButtonState();
    GameLogic.checkSynergyTensionStatus(); // Logic check is fine here
}
export function displayElementAttunement() { // CORRECTED LOGIC
    if (!personaElementDetailsDiv || personaElementDetailsDiv.children.length === 0) return;
    const attunement = State.getAttunement();
    elementNames.forEach(elName => {
        const key = elementNameToKey[elName];
        const attunementValue = attunement[key] || 0;
        const percentage = (attunementValue / Config.MAX_ATTUNEMENT) * 100;
        const color = Utils.getElementColor(elName);
        const targetDetails = personaElementDetailsDiv.querySelector(`.element-detail-entry[data-element-key="${key}"]`);

        if (targetDetails) {
            const descriptionDiv = targetDetails.querySelector('.element-description');
            if (!descriptionDiv) { console.warn(`No .element-description found for ${key}`); return; }

            let existingAttunementDisplay = descriptionDiv.querySelector('.attunement-display');

            if (existingAttunementDisplay) {
                // --- UPDATE EXISTING DISPLAY ---
                const bar = existingAttunementDisplay.querySelector('.attunement-bar');
                const container = existingAttunementDisplay.querySelector('.attunement-bar-container');
                if (bar) bar.style.width = `${percentage}%`;
                if (container) container.title = `Current Attunement: ${attunementValue.toFixed(1)} / ${Config.MAX_ATTUNEMENT}`;
            } else {
                // --- CREATE NEW DISPLAY ---
                let placeholderDiv = descriptionDiv.querySelector('.attunement-placeholder');
                const deepDiveContainer = descriptionDiv.querySelector('.element-deep-dive-container');

                const newAttunementDiv = document.createElement('div');
                newAttunementDiv.classList.add('attunement-display');
                newAttunementDiv.innerHTML = `
                    <div class="attunement-item">
                        <span class="attunement-name">Attunement:</span>
                        <div class="attunement-bar-container" title="Current Attunement: ${attunementValue.toFixed(1)} / ${Config.MAX_ATTUNEMENT}">
                            <div class="attunement-bar" style="width: ${percentage}%; background-color: ${color};"></div>
                        </div>
                        <i class="fas fa-info-circle info-icon" title="Attunement reflects affinity/experience with this Element. Grows via Research, Reflection, Focusing concepts. High Attunement may unlock content or reduce costs."></i>
                    </div>`;

                if (placeholderDiv) {
                    placeholderDiv.replaceWith(newAttunementDiv); // Replace placeholder
                } else {
                    console.warn(`Attunement placeholder missing for ${key}, inserting before deep dive (or appending).`);
                     // Insert before deep dive container if it exists, otherwise append
                     const separatorHr = descriptionDiv.querySelector('hr.attunement-hr'); // Find potential existing hr
                     if (!separatorHr) { // Add separator if missing
                         const hr = document.createElement('hr');
                         hr.className = 'attunement-hr';
                         if (deepDiveContainer) {
                            descriptionDiv.insertBefore(hr, deepDiveContainer);
                         } else {
                            descriptionDiv.appendChild(hr); // Append hr if no deep dive
                         }
                     }
                     if (deepDiveContainer) {
                         descriptionDiv.insertBefore(newAttunementDiv, deepDiveContainer);
                     } else {
                         descriptionDiv.appendChild(newAttunementDiv);
                     }
                }
            }
        }
    });
}
export function updateFocusSlotsDisplay() { const focused = State.getFocusedConcepts(); const totalSlots = State.getFocusSlots(); if (focusedConceptsHeader) { focusedConceptsHeader.textContent = `Focused Concepts (${focused.size} / ${totalSlots})`; const icon = focusedConceptsHeader.querySelector('.info-icon'); if(icon) icon.title = `Concepts marked as Focus (${focused.size}) out of your available slots (${totalSlots}). Slots increase via Milestones.`; } }
// --- START OF ui.js MODIFICATION (Inside displayFocusedConceptsPersona) ---

export function displayFocusedConceptsPersona() {
    if (!focusedConceptsDisplay) return;
    focusedConceptsDisplay.innerHTML = '';
    updateFocusSlotsDisplay();
    const focused = State.getFocusedConcepts();
    const discovered = State.getDiscoveredConcepts();

    if (focused.size === 0) {
        focusedConceptsDisplay.innerHTML = `<li class="focus-placeholder">Focus Concepts from your Grimoire</li>`;
        return;
    }

    focused.forEach(conceptId => {
        const conceptData = discovered.get(conceptId);
        if (conceptData?.concept) {
            const concept = conceptData.concept;
            const item = document.createElement('div');
            item.classList.add('focus-concept-item');
            item.dataset.conceptId = concept.id;
            item.title = `View ${concept.name}`;

            // --- START: Background Image Logic ---
            if (concept.visualHandle) {
                const handle = concept.visualHandle;
                // Use Config for extension or default if Config isn't imported/doesn't have it
                const extension = Config.UNLOCKED_ART_EXTENSION || '.jpg';
                const fileName = handle.includes('.') ? handle : `${handle}${extension}`;
                const imageUrl = `url('placeholder_art/${fileName}')`; // Correctly format URL

                item.style.backgroundImage = imageUrl;
                item.classList.add('has-background-image'); // Add class for CSS targeting
                console.log(`Applying background: ${imageUrl} to focus item ${concept.id}`);
            } else {
                 console.log(`No visualHandle for focus item ${concept.id}`);
            }
            // --- END: Background Image Logic ---

            // Original icon/text logic
            let iconClass = Utils.getCardTypeIcon(concept.cardType);
            let iconColor = '#b8860b'; // Default color
            if (concept.primaryElement && elementKeyToFullName?.[concept.primaryElement]) {
                const fullElementName = elementKeyToFullName[concept.primaryElement];
                iconClass = Utils.getElementIcon(fullElementName);
                iconColor = Utils.getElementColor(fullElementName);
            }
            item.innerHTML = `
                <i class="${iconClass}" style="color: ${iconColor};"></i>
                <span class="name">${concept.name}</span>
                <span class="type">(${concept.cardType})</span>
            `;

            item.addEventListener('click', () => showConceptDetailPopup(concept.id));
            focusedConceptsDisplay.appendChild(item);
        } else {
            console.warn(`Focused concept ID ${conceptId} not found.`);
            const item = document.createElement('div');
            item.classList.add('focus-concept-item', 'missing');
            item.textContent = `Error: ID ${conceptId}`;
            focusedConceptsDisplay.appendChild(item);
        }
    });
    updateSuggestSceneButtonState(); // Keep this if needed
}

// --- END OF ui.js MODIFICATION ---
// (The rest of ui.js remains the same)
export function generateTapestryNarrative() { if (!tapestryNarrativeP) return; const narrativeHTML = GameLogic.calculateTapestryNarrative(); tapestryNarrativeP.innerHTML = narrativeHTML || 'Mark concepts as "Focus" to generate narrative...'; }
export function synthesizeAndDisplayThemesPersona() { if (!personaThemesList) return; personaThemesList.innerHTML = ''; const themes = GameLogic.calculateFocusThemes(); if (themes.length === 0) { personaThemesList.innerHTML = `<li>${State.getFocusedConcepts().size > 0 ? 'Focus is currently balanced.' : 'Mark Focused Concepts...'}</li>`; return; } const topTheme = themes[0]; const li = document.createElement('li'); let emphasis = "Strongly"; if (themes.length > 1 && topTheme.count <= themes[1].count + 1) emphasis = "Primarily"; else if (topTheme.count < 3) emphasis = "Leaning towards"; li.textContent = `${emphasis} focused on ${topTheme.name}`; li.style.borderLeft = `3px solid ${Utils.getElementColor(elementKeyToFullName[topTheme.key])}`; li.style.paddingLeft = '8px'; personaThemesList.appendChild(li); if (themes.length > 1 && topTheme.count <= themes[1].count + 1) { const balanceLi = document.createElement('li'); balanceLi.innerHTML = `<small>(with other influences present)</small>`; balanceLi.style.fontSize = '0.85em'; balanceLi.style.color = '#666'; balanceLi.style.paddingLeft = '20px'; balanceLi.style.borderLeft = 'none'; personaThemesList.appendChild(balanceLi); } }

// --- Persona Summary & Chart ---
let personaChartInstance = null;
function drawPersonaChart(scores) {
    // ... (Keep existing drawPersonaChart code) ...
     const canvas = document.getElementById('personaScoreChartCanvas');
    if (!canvas) { console.error("Persona score chart canvas not found!"); return; }
    const ctx = canvas.getContext('2d');
    if (!ctx) { console.error("Could not get canvas context for chart!"); return; }

    const labels = elementNames.map(name => elementDetails[name]?.name || name);
    const dataPoints = elementNames.map(name => scores[elementNameToKey[name]] ?? 0);
    const backgroundColors = elementNames.map(name => Utils.hexToRgba(Utils.getElementColor(name), 0.6));
    const borderColors = elementNames.map(name => Utils.getElementColor(name));

    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Elemental Scores',
            data: dataPoints,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 2,
            pointBackgroundColor: borderColors,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: borderColors
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: { display: true, color: 'rgba(139, 69, 19, 0.2)' },
                grid: { color: 'rgba(139, 69, 19, 0.2)' },
                pointLabels: { font: { size: 11, family: 'Merriweather, serif' }, color: '#5a3a22' },
                suggestedMin: 0, suggestedMax: 10,
                ticks: { stepSize: 2, backdropColor: 'rgba(253, 248, 240, 0.8)', color: '#8b4513' }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed.r !== null) { label += `${context.parsed.r.toFixed(1)} (${Utils.getScoreLabel(context.parsed.r)})`; }
                        return label;
                    }
                }
            }
        }
    };

    if (personaChartInstance) { personaChartInstance.destroy(); }
    personaChartInstance = new Chart(ctx, { type: 'radar', data: chartData, options: chartOptions });
} // End of drawPersonaChart definition

export function displayPersonaSummary() {
    // ... (Keep existing displayPersonaSummary code) ...
    if (!summaryContentDiv || !summaryCoreEssenceTextDiv || !summaryTapestryInfoDiv) {
        console.error("Summary view content divs not found!");
        if(summaryContentDiv) summaryContentDiv.innerHTML = '<p>Error loading summary content elements.</p>';
        return;
    }
    summaryCoreEssenceTextDiv.innerHTML = '';
    summaryTapestryInfoDiv.innerHTML = '';
    const scores = State.getScores();
    const focused = State.getFocusedConcepts();
    const narrativeHTML = GameLogic.calculateTapestryNarrative(); // Use logic function
    const themes = GameLogic.calculateFocusThemes(); // Use logic function
    let coreEssenceHTML = '';
    if (elementDetails && elementNameToKey && elementKeyToFullName) {
        elementNames.forEach(elName => {
            const key = elementNameToKey[elName];
            const score = scores[key];
            if (typeof score === 'number') {
                const label = Utils.getScoreLabel(score);
                const interpretation = elementDetails[elName]?.scoreInterpretations?.[label] || "N/A";
                coreEssenceHTML += `<p><strong>${elementDetails[elName]?.name || elName} (${score.toFixed(1)} - ${label}):</strong> ${interpretation}</p>`;
            } else {
                coreEssenceHTML += `<p><strong>${elementDetails[elName]?.name || elName}:</strong> Score not available.</p>`;
            }
        });
    } else {
        coreEssenceHTML += "<p>Error: Element details not loaded.</p>";
    }
    summaryCoreEssenceTextDiv.innerHTML = coreEssenceHTML;
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
                tapestryHTML += `<li>${theme.name} Focus (${theme.count} concept${theme.count > 1 ? 's' : ''})</li>`;
            });
            tapestryHTML += '</ul>';
        } else {
            tapestryHTML += '<strong>Dominant Themes:</strong><p>No strong themes detected.</p>';
        }
    } else {
        tapestryHTML += '<p>No concepts are currently focused.</p>';
    }
    summaryTapestryInfoDiv.innerHTML = tapestryHTML;
    drawPersonaChart(scores); // Draw the chart
}

// --- Study Screen UI ---
export function displayStudyScreenContent() {
    if (!studyScreen) return;
    console.log(`UI: Displaying Study Screen Content`);
    if (userInsightDisplayStudy) userInsightDisplayStudy.textContent = State.getInsight().toFixed(1);
    if (initialDiscoveryElements) {
        initialDiscoveryElements.innerHTML = '';
        const scores = State.getScores();
        const freeResearchLeft = State.getInitialFreeResearchRemaining();
        const insight = State.getInsight();
        elementNames.forEach(elementName => {
            const key = elementNameToKey[elementName]; const score = scores[key] || 5.0; const scoreLabel = Utils.getScoreLabel(score); const elementData = elementDetails[elementName] || {};
            const color = Utils.getElementColor(elementName); const iconClass = Utils.getElementIcon(elementName);
            const elementDiv = document.createElement('div'); elementDiv.classList.add('initial-discovery-element');
            elementDiv.style.borderColor = color; elementDiv.dataset.elementKey = key;
            let costText = ""; let isDisabled = false; let titleText = ""; let isFreeClick = false;
            const researchCost = Config.BASE_RESEARCH_COST;
            if (freeResearchLeft > 0) { costText = `Free Research (${freeResearchLeft} left)`; titleText = `Conduct FREE research on ${elementData.name || elementName}.`; isFreeClick = true; isDisabled = false; }
            else { costText = `${researchCost} <i class="fas fa-brain insight-icon"></i>`; if (insight < researchCost) { isDisabled = true; titleText = `Research ${elementData.name || elementName} (Requires ${researchCost} Insight)`; } else { isDisabled = false; titleText = `Research ${elementData.name || elementName} (Cost: ${researchCost} Insight)`; } isFreeClick = false; }
            elementDiv.dataset.cost = researchCost;

            // --- ADD RARITY COUNT LOGIC ---
            // NOTE: This assumes countUndiscoveredByRarity is accessible.
            // If it's in gameLogic.js, you might need to call GameLogic.countUndiscoveredByRarity(key)
            // or adjust imports/exports appropriately. For simplicity here, assuming it's callable.
            let rarityCountsHTML = '';
            try {
                // IMPORTANT: Call the function via the imported module
                const rarityCounts = GameLogic.countUndiscoveredByRarity(key);
                rarityCountsHTML = `
                    <div class="rarity-counts-display" title="Undiscovered Concepts (Relevant to Element)">
                        <span class="rarity-count common" title="${rarityCounts.common} Common"><i class="fas fa-circle"></i> ${rarityCounts.common}</span>
                        <span class="rarity-count uncommon" title="${rarityCounts.uncommon} Uncommon"><i class="fas fa-square"></i> ${rarityCounts.uncommon}</span>
                        <span class="rarity-count rare" title="${rarityCounts.rare} Rare"><i class="fas fa-star"></i> ${rarityCounts.rare}</span>
                    </div>
                `;
            } catch (error) {
                console.error(`Error getting rarity counts for ${key}:`, error);
                rarityCountsHTML = '<div class="rarity-counts-display error">Counts N/A</div>';
            }
            // --- END RARITY COUNT LOGIC ---

            // Modified innerHTML to include rarityCountsHTML
            elementDiv.innerHTML = `
                <div class="element-header">
                    <i class="${iconClass}" style="color: ${color};"></i>
                    <span class="element-name">${elementData.name || elementName}</span>
                    <span class="element-score">${score.toFixed(1)} (${scoreLabel})</span>
                </div>
                <p class="element-concept">${elementData.coreConcept || 'Loading...'}</p>
                ${rarityCountsHTML} <!-- Inject the rarity counts here -->
                <div class="element-action ${isDisabled ? 'disabled' : ''}">
                    <span class="element-cost">${costText}</span>
                </div>
            `;

            elementDiv.title = titleText; if (!isDisabled) { elementDiv.classList.add('clickable'); } else { elementDiv.classList.add('disabled'); }
            initialDiscoveryElements.appendChild(elementDiv);
        });
    }
    if (initialDiscoveryGuidance) { initialDiscoveryGuidance.textContent = "Research Elements to discover Concepts, complete Rituals, or Seek Guidance."; }
    if (freeResearchButton) { const freeAvailable = State.isFreeResearchAvailable(); freeResearchButton.disabled = !freeAvailable; freeResearchButton.textContent = freeAvailable ? "Perform Daily Meditation" : "Meditation Performed Today"; freeResearchButton.title = freeAvailable ? "Once per day, perform free research on your least attuned element." : "Daily free meditation already completed."; }
    if (seekGuidanceButton && guidedReflectionCostDisplay) { const cost = Config.GUIDED_REFLECTION_COST; const canAfford = State.getInsight() >= cost; seekGuidanceButton.disabled = !canAfford; seekGuidanceButton.title = canAfford ? `Spend ${cost} Insight for a Guided Reflection.` : `Requires ${cost} Insight.`; guidedReflectionCostDisplay.textContent = cost; }
     if (studyResearchDiscoveries) { const placeholder = studyResearchDiscoveries.querySelector('p > i'); if (placeholder && studyResearchDiscoveries.children.length > 1) { placeholder.parentElement.remove(); } else if (!placeholder && studyResearchDiscoveries.children.length === 0) { studyResearchDiscoveries.innerHTML = '<p><i>Discoveries will appear here...</i></p>'; } }
    displayDailyRituals();
}

// --- Rituals Display ---
export function displayDailyRituals() {
    // ... (Keep existing displayDailyRituals code) ...
     if (!dailyRitualsDisplay) return; dailyRitualsDisplay.innerHTML = ''; const completed = State.getState().completedRituals.daily || {}; const focused = State.getFocusedConcepts(); let activeRituals = [...dailyRituals]; if (focusRituals) { focusRituals.forEach(ritual => { if (!ritual.requiredFocusIds || !Array.isArray(ritual.requiredFocusIds) || ritual.requiredFocusIds.length === 0) return; const reqIds = new Set(ritual.requiredFocusIds); let allFocused = true; for (const id of reqIds) { if (!focused.has(id)) { allFocused = false; break; } } if (allFocused) activeRituals.push({ ...ritual, isFocusRitual: true }); }); } if (activeRituals.length === 0) { dailyRitualsDisplay.innerHTML = '<li>No daily rituals currently active.</li>'; return; } activeRituals.forEach(ritual => { const completedData = completed[ritual.id] || { completed: false, progress: 0 }; const isCompleted = completedData.completed; const li = document.createElement('li'); li.classList.toggle('completed', isCompleted); if(ritual.isFocusRitual) li.classList.add('focus-ritual'); let rewardText = ''; if (ritual.reward) { if (ritual.reward.type === 'insight') rewardText = `(+${ritual.reward.amount} <i class="fas fa-brain insight-icon"></i>)`; else if (ritual.reward.type === 'attunement') { const elName = ritual.reward.element === 'All' ? 'All' : (elementKeyToFullName[ritual.reward.element] || ritual.reward.element); rewardText = `(+${ritual.reward.amount} ${elName} Attun.)`; } else if (ritual.reward.type === 'token') rewardText = `(+1 ${ritual.reward.tokenType || 'Token'})`; } li.innerHTML = `${ritual.description} <span class="ritual-reward">${rewardText}</span>`; dailyRitualsDisplay.appendChild(li); });
}

// --- Research Results & Update Button ---
export function displayResearchResults(results) {
    // ... (Keep existing displayResearchResults code) ...
     const container = document.getElementById('studyResearchDiscoveries'); if (!container) { console.error(`Research results container #studyResearchDiscoveries not found!`); return; } const { concepts: foundConcepts, repositoryItems, duplicateInsightGain } = results; const placeholder = container.querySelector('p > i'); if ((foundConcepts.length > 0 || repositoryItems.length > 0) && placeholder && container.children.length === 1) { container.innerHTML = ''; } else if ((foundConcepts.length > 0 || repositoryItems.length > 0) && !placeholder && container.children.length > 0 && !container.querySelector('.research-result-item, .repository-item-discovery')) { container.innerHTML = ''; } if (duplicateInsightGain > 0) { const existingDupeMsg = container.querySelector('.duplicate-message'); if(existingDupeMsg) existingDupeMsg.remove(); const dupeMsg = document.createElement('p'); dupeMsg.classList.add('duplicate-message'); dupeMsg.innerHTML = `<i class="fas fa-info-circle"></i> Gained ${duplicateInsightGain.toFixed(0)} Insight from duplicate echoes.`; container.prepend(dupeMsg); } repositoryItems.forEach(item => { if (container.querySelector(`[data-repo-id="${item.id}"]`)) return; const itemDiv = document.createElement('div'); itemDiv.classList.add('repository-item-discovery'); itemDiv.dataset.repoId = item.id; let iconClass = 'fa-question-circle'; let typeName = 'Item'; if (item.type === 'scene') { iconClass = 'fa-scroll'; typeName = 'Scene Blueprint'; } else if (item.type === 'insight') { iconClass = 'fa-lightbulb'; typeName = 'Insight Fragment'; } itemDiv.innerHTML = `<h4><i class="fas ${iconClass}"></i> ${typeName} Discovered!</h4><p>${item.text || `You've uncovered the '${item.name}'. View it in the Repository.`}</p>`; container.appendChild(itemDiv); }); foundConcepts.forEach(concept => { if (!container.querySelector(`.research-result-item[data-concept-id="${concept.id}"]`)) { const resultItemDiv = document.createElement('div'); resultItemDiv.classList.add('research-result-item'); resultItemDiv.dataset.conceptId = concept.id; const cardElement = renderCard(concept, 'discovery-note'); if (!cardElement) return; resultItemDiv.appendChild(cardElement); const actionDiv = document.createElement('div'); actionDiv.classList.add('research-actions'); const addButton = document.createElement('button'); addButton.textContent = "Add to Grimoire"; addButton.classList.add('button', 'small-button', 'add-button'); addButton.dataset.conceptId = concept.id; actionDiv.appendChild(addButton); const sellButton = document.createElement('button'); let discoveryValue = Config.CONCEPT_DISCOVERY_INSIGHT[concept.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default; const sellValue = discoveryValue * Config.SELL_INSIGHT_FACTOR; sellButton.textContent = `Sell (${sellValue.toFixed(1)}) `; sellButton.innerHTML += `<i class="fas fa-brain insight-icon"></i>`; sellButton.classList.add('button', 'small-button', 'secondary-button', 'sell-button'); sellButton.dataset.conceptId = concept.id; sellButton.dataset.context = 'discovery'; sellButton.title = `Sell for ${sellValue.toFixed(1)} Insight.`; actionDiv.appendChild(sellButton); resultItemDiv.appendChild(actionDiv); container.appendChild(resultItemDiv); } }); const hasContent = container.querySelector('.research-result-item, .repository-item-discovery'); if (!hasContent && container.children.length <= 1) { container.querySelector('.duplicate-message')?.remove(); container.innerHTML = '<p><i>Discoveries will appear here...</i></p>'; }
}
export function updateResearchButtonAfterAction(conceptId, action) {
    // ... (Keep existing updateResearchButtonAfterAction code) ...
    const container = document.getElementById('studyResearchDiscoveries'); const itemDiv = container?.querySelector(`.research-result-item[data-concept-id="${conceptId}"]`); if (!itemDiv || !container) return; if (action === 'add' || action === 'sell') { itemDiv.remove(); const hasContent = container.querySelector('.research-result-item, .repository-item-discovery'); if (!hasContent && container.children.length <= 1) { container.querySelector('.duplicate-message')?.remove(); container.innerHTML = '<p><i>Discoveries will appear here...</i></p>'; } }
}

// --- Grimoire Screen UI ---
export function updateGrimoireCounter() {
    // ... (Keep existing updateGrimoireCounter code) ...
    if (grimoireCountSpan) grimoireCountSpan.textContent = State.getDiscoveredConcepts().size;
}
export function populateGrimoireFilters() {
    // ... (Keep existing populateGrimoireFilters code) ...
    if (grimoireTypeFilter) { grimoireTypeFilter.innerHTML = '<option value="All">All Types</option>'; cardTypeKeys.forEach(type => { const option = document.createElement('option'); option.value = type; option.textContent = type; grimoireTypeFilter.appendChild(option); }); } if (grimoireElementFilter) { grimoireElementFilter.innerHTML = '<option value="All">All Elements</option>'; elementNames.forEach(fullName => { const name = elementDetails[fullName]?.name || fullName; const option = document.createElement('option'); option.value = fullName; option.textContent = name; grimoireElementFilter.appendChild(option); }); }
}
function updateShelfCounts() {
    // ... (Keep existing updateShelfCounts code) ...
    if (!grimoireShelvesContainer) return; const conceptData = Array.from(State.getDiscoveredConcepts().values()); grimoireShelves.forEach(shelf => { const shelfElem = grimoireShelvesContainer.querySelector(`.grimoire-shelf[data-category-id="${shelf.id}"] .shelf-count`); if (shelfElem) { const count = conceptData.filter(data => (data.userCategory || 'uncategorized') === shelf.id).length; shelfElem.textContent = `(${count})`; } });
}
export function displayGrimoire(filterParams = {}) {
    // ... (Keep existing displayGrimoire code) ...
    const { filterType = "All", filterElement = "All", sortBy = "discovered", filterRarity = "All", searchTerm = "", filterFocus = "All", filterCategory = "All" } = filterParams; if (grimoireShelvesContainer) { grimoireShelvesContainer.innerHTML = ''; grimoireShelves.forEach(shelf => { const shelfDiv = document.createElement('div'); shelfDiv.classList.add('grimoire-shelf'); shelfDiv.dataset.categoryId = shelf.id; if (filterCategory === shelf.id) { shelfDiv.classList.add('active-shelf'); } shelfDiv.innerHTML = `<h4>${shelf.name} <i class="fas fa-info-circle info-icon" title="${shelf.description || ''}"></i></h4><span class="shelf-count">(0)</span>`; grimoireShelvesContainer.appendChild(shelfDiv); }); const showAllDiv = document.createElement('div'); showAllDiv.classList.add('grimoire-shelf', 'show-all-shelf'); if (filterCategory === 'All') { showAllDiv.classList.add('active-shelf'); } showAllDiv.innerHTML = `<h4>Show All Cards</h4>`; showAllDiv.dataset.categoryId = 'All'; grimoireShelvesContainer.appendChild(showAllDiv); } else { console.error("Grimoire shelves container not found."); } const targetCardContainer = grimoireContentDiv; if (!targetCardContainer) { console.error("#grimoireContent element not found for cards."); return; } targetCardContainer.innerHTML = ''; const discoveredMap = State.getDiscoveredConcepts(); if (discoveredMap.size === 0) { targetCardContainer.innerHTML = '<p>Your Grimoire is empty... Discover Concepts in the Study!</p>'; updateShelfCounts(); return; } const userScores = State.getScores(); const focusedSet = State.getFocusedConcepts(); let discoveredArray = Array.from(discoveredMap.values()); const searchTermLower = searchTerm.toLowerCase().trim(); const conceptsToDisplay = discoveredArray.filter(data => { if (!data?.concept) return false; const concept = data.concept; const userCategory = data.userCategory || 'uncategorized'; const typeMatch = (filterType === "All") || (concept.cardType === filterType); let elementMatch = (filterElement === "All"); if (!elementMatch && elementNameToKey && filterElement !== "All") { const elementKey = elementNameToKey[filterElement]; if (elementKey) elementMatch = (concept.primaryElement === elementKey); } const rarityMatch = (filterRarity === "All") || (concept.rarity === filterRarity); const focusMatch = (filterFocus === 'All') || (filterFocus === 'Focused' && focusedSet.has(concept.id)) || (filterFocus === 'Not Focused' && !focusedSet.has(concept.id)); const searchMatch = !searchTermLower || (concept.name.toLowerCase().includes(searchTermLower)) || (concept.keywords && concept.keywords.some(k => k.toLowerCase().includes(searchTermLower))); const categoryMatch = (filterCategory === 'All') || (userCategory === filterCategory); return typeMatch && elementMatch && rarityMatch && focusMatch && searchMatch && categoryMatch; }); const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3 }; conceptsToDisplay.sort((a, b) => { if (!a.concept || !b.concept) return 0; const conceptA = a.concept; const conceptB = b.concept; switch (sortBy) { case 'name': return conceptA.name.localeCompare(conceptB.name); case 'type': return (cardTypeKeys.indexOf(conceptA.cardType) - cardTypeKeys.indexOf(conceptB.cardType)) || conceptA.name.localeCompare(conceptB.name); case 'rarity': return (rarityOrder[conceptA.rarity] || 0) - (rarityOrder[conceptB.rarity] || 0) || conceptA.name.localeCompare(conceptB.name); case 'resonance': const distA = Utils.euclideanDistance(userScores, conceptA.elementScores); const distB = Utils.euclideanDistance(userScores, conceptB.elementScores); return distA - distB || conceptA.name.localeCompare(conceptB.name); default: return (a.discoveredTime || 0) - (b.discoveredTime || 0) || conceptA.name.localeCompare(conceptB.name); } }); if (conceptsToDisplay.length === 0) { targetCardContainer.innerHTML = `<p>No discovered concepts match the current filters${searchTerm ? ' or search term' : ''}.</p>`; } else { conceptsToDisplay.forEach(data => { const cardElement = renderCard(data.concept, 'grimoire'); if (cardElement) { cardElement.draggable = true; cardElement.dataset.conceptId = data.concept.id; cardElement.classList.add(`category-${data.userCategory || 'uncategorized'}`); targetCardContainer.appendChild(cardElement); } }); } updateShelfCounts();
}
export function refreshGrimoireDisplay(overrideFilters = {}) {
    // ... (Keep existing refreshGrimoireDisplay code) ...
    if (grimoireScreen && !grimoireScreen.classList.contains('hidden')) { const currentFilters = { filterType: grimoireTypeFilter?.value || "All", filterElement: grimoireElementFilter?.value || "All", sortBy: grimoireSortOrder?.value || "discovered", filterRarity: grimoireRarityFilter?.value || "All", searchTerm: grimoireSearchInput?.value || "", filterFocus: grimoireFocusFilter?.value || "All", filterCategory: overrideFilters.filterCategory !== undefined ? overrideFilters.filterCategory : document.querySelector('.grimoire-shelf.active-shelf')?.dataset.categoryId || "All" }; const finalFilters = { ...currentFilters, ...overrideFilters }; displayGrimoire(finalFilters); }
}
function handleFirstGrimoireVisit() {
    // ... (Keep existing handleFirstGrimoireVisit code) ...
    if (!State.getState().grimoireFirstVisitDone) { if (grimoireGuidance) { grimoireGuidance.innerHTML = `<i class="fas fa-info-circle"></i> Welcome to your Grimoire! Drag & Drop Concept cards onto the shelves above to categorize them. Click cards for details.`; grimoireGuidance.classList.remove('hidden'); } State.markGrimoireVisited(); } else { if (grimoireGuidance) grimoireGuidance.classList.add('hidden'); }
}

// --- Card Rendering ---
export function renderCard(concept, context = 'grimoire') {
    // ... (Keep existing renderCard code) ...
    if (!concept || typeof concept.id === 'undefined') { console.warn("renderCard called with invalid concept:", concept); const eDiv = document.createElement('div'); eDiv.textContent = "Error: Invalid Concept Data"; return eDiv; }
    const cardDiv = document.createElement('div'); cardDiv.classList.add('concept-card'); cardDiv.classList.add(`rarity-${concept.rarity || 'common'}`); cardDiv.dataset.conceptId = concept.id; cardDiv.title = `View Details: ${concept.name}`;
    const discoveredData = State.getDiscoveredConceptData(concept.id); const isDiscovered = !!discoveredData; const isFocused = State.getFocusedConcepts().has(concept.id); const hasNewLore = discoveredData?.newLoreAvailable || false;
    let visualContentHTML = '';
    if (concept.visualHandle) {
        const handle = concept.visualHandle;
        const fileName = handle.includes('.') ? handle : `${handle}${Config.UNLOCKED_ART_EXTENSION || '.jpg'}`;
        visualContentHTML = `<img src="placeholder_art/${fileName}" alt="${concept.name} Art" class="card-art-image" onerror="this.style.display='none'; this.parentElement.querySelector('.card-visual-placeholder')?.style.display='block';"><i class="fas fa-image card-visual-placeholder" style="display: none;" title="Art Placeholder (Load Failed)"></i>`;
    } else { visualContentHTML = `<i class="fas fa-question card-visual-placeholder" title="Visual Placeholder"></i>`; }
    const focusStampHTML = isFocused ? '<span class="focus-indicator" title="Focused Concept">★</span>' : '';
    const noteStampHTML = (!isDiscovered && (context === 'discovery-note' || context === 'research-output')) ? '<span class="note-stamp" title="Research Note"><i class="fa-regular fa-clipboard"></i></span>' : '';
    const loreStampHTML = (isDiscovered && hasNewLore) ? '<span class="lore-indicator" title="New Lore Unlocked!"><i class="fas fa-scroll"></i></span>' : '';
    const cardTypeIcon = Utils.getCardTypeIcon(concept.cardType);
    let rarityText = concept.rarity ? concept.rarity.charAt(0).toUpperCase() + concept.rarity.slice(1) : 'Common';
    let rarityClass = `rarity-indicator-${concept.rarity || 'common'}`;
    const rarityIndicatorHTML = `<span class="card-rarity ${rarityClass}" title="Rarity: ${rarityText}">${rarityText}</span>`;
    let primaryElementHTML = '<small style="color:#888; font-style: italic;">Basic Affinity</small>';
    if (concept.primaryElement && elementKeyToFullName && elementKeyToFullName[concept.primaryElement]) {
        const primaryKey = concept.primaryElement; const primaryFullName = elementKeyToFullName[primaryKey]; const primaryColor = Utils.getElementColor(primaryFullName); const primaryIcon = Utils.getElementIcon(primaryFullName); const primaryName = elementDetails[primaryFullName]?.name || primaryFullName;
        primaryElementHTML = `<span class="primary-element-display" style="color: ${primaryColor};" title="Primary Element: ${primaryName}"><i class="${primaryIcon}"></i> ${primaryName.split(':')[0]}</span>`;
    }
    let actionButtonsHTML = ''; const showFocusButtonOnCard = context === 'grimoire' && isDiscovered; const showSellButtonOnCard = context === 'grimoire' && isDiscovered; let hasActions = false;
    if (context === 'grimoire') {
        actionButtonsHTML = '<div class="card-actions">'; if (showSellButtonOnCard) { let discoveryValue = Config.CONCEPT_DISCOVERY_INSIGHT[concept.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default; const sellValue = discoveryValue * Config.SELL_INSIGHT_FACTOR; actionButtonsHTML += `<button class="button tiny-button secondary-button sell-button card-sell-button" data-concept-id="${concept.id}" data-context="grimoire" title="Sell (${sellValue.toFixed(1)} Insight)"><i class="fas fa-dollar-sign"></i></button>`; hasActions = true; } if (showFocusButtonOnCard) { const slotsFull = State.getFocusedConcepts().size >= State.getFocusSlots() && !isFocused; const buttonClass = isFocused ? 'marked' : ''; const buttonIcon = isFocused ? 'fa-star' : 'fa-regular fa-star'; const buttonTitle = slotsFull ? `Focus Slots Full (${State.getFocusSlots()})` : (isFocused ? 'Remove Focus' : 'Mark as Focus'); actionButtonsHTML += `<button class="button tiny-button card-focus-button ${buttonClass}" data-concept-id="${concept.id}" title="${buttonTitle}" ${slotsFull ? 'disabled' : ''}><i class="fas ${buttonIcon}"></i></button>`; hasActions = true; } actionButtonsHTML += '</div>'; if (!hasActions) actionButtonsHTML = '';
    }
     cardDiv.innerHTML = `
        <div class="card-header">
            <span class="card-type-icon-area"><i class="${cardTypeIcon}" title="${concept.cardType}"></i></span>
            <span class="card-name">${concept.name}</span>
            <span class="card-header-right">${rarityIndicatorHTML}<span class="card-stamps">${focusStampHTML}${noteStampHTML}${loreStampHTML}</span></span>
        </div>
        <div class="card-visual">${visualContentHTML}</div>
        <div class="card-footer">
            <div class="card-affinities">${primaryElementHTML}</div><p class="card-brief-desc">${concept.briefDescription || '...'}</p>${actionButtonsHTML}
        </div>`;
    if (context === 'research-output' || context === 'discovery-note') { cardDiv.title = `Click to view details for ${concept.name} (Not yet in Grimoire)`; cardDiv.classList.add('research-note-card'); }
    if (isDiscovered) { cardDiv.classList.add(`category-${discoveredData.userCategory || 'uncategorized'}`); }
    return cardDiv;
}

// --- Concept Detail Popup UI ---
export function showConceptDetailPopup(conceptId) {
    // ... (Keep existing showConceptDetailPopup code) ...
     console.log(`--- Opening Popup for Concept ID: ${conceptId} ---`);
     const conceptData = concepts.find(c => c.id === conceptId);
     if (!conceptData) { console.error("Concept data missing:", conceptId); return; }
     const discoveredData = State.getDiscoveredConceptData(conceptId);
     const inGrimoire = !!discoveredData;
     const researchNotesArea = document.getElementById('studyResearchDiscoveries');
     const inResearchNotes = !inGrimoire && researchNotesArea?.querySelector(`.research-result-item[data-concept-id="${conceptId}"]`);
     console.log(`   - In Grimoire (Discovered): ${inGrimoire}`);
     console.log(`   - Is in Research Notes: ${!!inResearchNotes}`);
     GameLogic.setCurrentPopupConcept(conceptId);

     // Basic Header Info
     if (popupConceptName) popupConceptName.textContent = conceptData.name;
     let subHeaderText = conceptData.cardType || "Unknown Type";
     let primaryElementIconHTML = '';
     if (conceptData.primaryElement && elementKeyToFullName?.[conceptData.primaryElement]) {
         const primaryKey = conceptData.primaryElement; const primaryFullName = elementKeyToFullName[primaryKey]; const primaryColor = Utils.getElementColor(primaryFullName); const primaryIcon = Utils.getElementIcon(primaryFullName); const primaryName = elementDetails[primaryFullName]?.name || primaryFullName; subHeaderText += ` | Element: ${primaryName.split(':')[0]}`; primaryElementIconHTML = `<i class="${primaryIcon} popup-element-icon" style="color: ${primaryColor}; margin-left: 8px;" title="Primary Element: ${primaryName}"></i>`;
     }
     if (popupConceptType) popupConceptType.innerHTML = subHeaderText + primaryElementIconHTML;
     if (popupCardTypeIcon) popupCardTypeIcon.className = `${Utils.getCardTypeIcon(conceptData.cardType)} card-type-icon`;

     // Visual Area
     if (popupVisualContainer) {
         popupVisualContainer.innerHTML = ''; let content;
         if (conceptData.visualHandle) {
            const handle = conceptData.visualHandle;
            const fileName = handle.includes('.') ? handle : `${handle}${Config.UNLOCKED_ART_EXTENSION || '.jpg'}`;
            content = document.createElement('img');
            content.src = `placeholder_art/${fileName}`;
            content.alt = `${conceptData.name} Art`;
            content.classList.add('card-art-image');
            content.onerror = function() { this.style.display='none'; const icon = document.createElement('i'); icon.className = `fas fa-image card-visual-placeholder`; icon.title = "Art Placeholder (Load Failed)"; popupVisualContainer.appendChild(icon); };
         } else {
            content = document.createElement('i');
            content.className = `fas fa-question card-visual-placeholder`;
            content.title = "Visual Placeholder";
         }
         popupVisualContainer.appendChild(content);
     }

     // Info Area
     if (popupBriefDescription) { popupBriefDescription.textContent = conceptData.briefDescription || ''; }
     if (popupDetailedDescription) { popupDetailedDescription.textContent = conceptData.detailedDescription || "No description."; }
     const scores = State.getScores(); const distance = Utils.euclideanDistance(scores, conceptData.elementScores);
     displayPopupResonanceGauge(distance); // Update resonance gauge
     displayPopupRelatedConceptsTags(conceptData); // Update related tags
     if(popupRecipeDetailsSection) displayPopupRecipeComparison(conceptData, scores); // Update recipe comparison

     // Lore Section (Handle potential missing lore data gracefully)
     if (popupLoreSection && popupLoreContent) {
         const hasLoreDefined = conceptData.lore && Array.isArray(conceptData.lore) && conceptData.lore.length > 0;
         console.log(`   - Lore Check: In Grimoire=${inGrimoire}, Has Lore Defined=${hasLoreDefined}`);
         popupLoreSection.classList.toggle('hidden', !inGrimoire || !hasLoreDefined);
         popupLoreContent.innerHTML = ''; // Clear previous lore
         if (inGrimoire && hasLoreDefined) {
             const unlockedLevel = State.getUnlockedLoreLevel(conceptId);
             console.log(`   - Currently Unlocked Lore Level for ${conceptId}: ${unlockedLevel}`);
             conceptData.lore.forEach((loreEntry, index) => {
                 if (!loreEntry || typeof loreEntry.level !== 'number' || typeof loreEntry.text !== 'string' || typeof loreEntry.insightCost !== 'number') {
                     console.warn(`Invalid lore entry at index ${index} for concept ${conceptId}. Skipping.`);
                     return; // Skip invalid lore entries
                 }
                 const loreDiv = document.createElement('div'); loreDiv.classList.add('lore-entry'); loreDiv.dataset.loreLevel = loreEntry.level;
                 if (loreEntry.level <= unlockedLevel) { console.log(`      -> UNLOCKED. Adding text: "${loreEntry.text.substring(0, 20)}..."`); loreDiv.innerHTML = `<h5 class="lore-level-title">Level ${loreEntry.level} Insight:</h5><p class="lore-text">${loreEntry.text}</p>`; }
                 else { console.log(`      -> LOCKED.`); loreDiv.innerHTML = `<h5 class="lore-level-title">Level ${loreEntry.level} Insight: [Locked]</h5>`; const cost = Config.LORE_UNLOCK_COSTS[`level${loreEntry.level}`] || 999; const currentInsight = State.getInsight(); const canAfford = currentInsight >= cost; console.log(`         -> Cost: ${cost}, Have: ${currentInsight.toFixed(1)}, Can Afford: ${canAfford}`); const unlockButton = document.createElement('button'); unlockButton.className = 'button tiny-button unlock-lore-button'; unlockButton.dataset.conceptId = conceptId; unlockButton.dataset.loreLevel = loreEntry.level; unlockButton.dataset.cost = cost; unlockButton.title = canAfford ? `Unlock for ${cost} Insight` : `Requires ${cost} Insight`; unlockButton.disabled = !canAfford; unlockButton.innerHTML = `Unlock (${cost} <i class="fas fa-brain insight-icon"></i>)`; loreDiv.appendChild(unlockButton); console.log(`         -> Added unlock button.`); }
                 popupLoreContent.appendChild(loreDiv); if (index < conceptData.lore.length - 1) popupLoreContent.appendChild(document.createElement('hr'));
             });
             popupLoreSection.open = (discoveredData?.newLoreAvailable) || false; // Open if new lore is available
         } else if (inGrimoire && !hasLoreDefined) { console.log(`   - No lore defined for ${conceptData.name} in data.js.`); popupLoreContent.innerHTML = '<p><i>No lore recorded.</i></p>'; }
         else { console.log(`   - Lore section not populated (Not in Grimoire or no lore defined).`); }
         // Mark lore as seen if applicable
         if (inGrimoire && discoveredData?.newLoreAvailable) { State.markLoreAsSeen(conceptId); const cardElemIndicator = document.querySelector(`#grimoireContent .concept-card[data-concept-id="${conceptId}"] .lore-indicator`); cardElemIndicator?.remove(); console.log(`Marked lore seen: ${conceptId}`); }
     } else { console.error("Lore elements missing!"); }

     // Notes Section
     const showNotes = inGrimoire;
     if (myNotesSection) { myNotesSection.classList.toggle('hidden', !showNotes); if (showNotes && discoveredData) { if(myNotesTextarea) myNotesTextarea.value = discoveredData.notes || ""; if(noteSaveStatusSpan) noteSaveStatusSpan.textContent = ""; myNotesSection.open = false; } }

     // Action Buttons
     updateGrimoireButtonStatus(conceptId, !!inResearchNotes);
     updateFocusButtonStatus(conceptId);
     updatePopupSellButton(conceptId, conceptData, inGrimoire, !!inResearchNotes);

     // Show Popup
     if (conceptDetailPopup) conceptDetailPopup.classList.remove('hidden');
     if (popupOverlay) popupOverlay.classList.remove('hidden');
     console.log(`--- Finished Opening Popup for Concept ID: ${conceptId} ---`);
}
function displayPopupResonanceGauge(distance) {
    // ... (Keep existing displayPopupResonanceGauge code) ...
    const gaugeBar = document.getElementById('popupResonanceGaugeBar');
    const gaugeLabel = document.getElementById('popupResonanceGaugeLabel');
    const gaugeText = document.getElementById('popupResonanceGaugeText');
    if (!gaugeBar || !gaugeLabel || !gaugeText) { console.error("Resonance gauge elements not found!"); return; }
    let resonanceLabel, resonanceClass, message, widthPercent;
    if (distance === Infinity || isNaN(distance)) { resonanceLabel = "N/A"; resonanceClass = ""; message = "(Comparison Error)"; widthPercent = 0; }
    else if (distance < 2.5) { resonanceLabel = "Very High"; resonanceClass = "resonance-high"; message = "Strong alignment."; widthPercent = Math.min(100, Math.max(5, 100 - (distance * 15))); }
    else if (distance < 4.0) { resonanceLabel = "High"; resonanceClass = "resonance-high"; message = "Shares common ground."; widthPercent = Math.min(100, Math.max(5, 100 - (distance * 15))); }
    else if (distance < 6.0) { resonanceLabel = "Moderate"; resonanceClass = "resonance-medium"; message = "Some similarities."; widthPercent = Math.min(100, Math.max(5, 100 - (distance * 12))); }
    else if (distance <= Config.DISSONANCE_THRESHOLD) { resonanceLabel = "Low"; resonanceClass = "resonance-low"; message = "Notable divergence."; widthPercent = Math.min(100, Math.max(5, 100 - (distance * 10))); }
    else { resonanceLabel = "Dissonant"; resonanceClass = "resonance-low"; message = "Significant divergence."; widthPercent = Math.min(100, Math.max(5, 100 - (distance * 8))); }
    widthPercent = Math.max(5, Math.min(95, widthPercent)); // Keep bar visible
    gaugeBar.style.width = `${widthPercent}%`; gaugeBar.className = 'popup-resonance-gauge-bar'; if (resonanceClass) gaugeBar.classList.add(resonanceClass); // Reset classes first
    gaugeLabel.textContent = resonanceLabel; gaugeLabel.className = 'popup-resonance-gauge-label'; if (resonanceClass) gaugeLabel.classList.add(resonanceClass); // Reset classes first
    gaugeText.textContent = `${message} (Dist: ${distance.toFixed(1)})`;
}
function displayPopupRelatedConceptsTags(conceptData) {
    // ... (Keep existing displayPopupRelatedConceptsTags code) ...
    const tagsContainer = document.getElementById('popupRelatedConceptsTags');
    if (!tagsContainer) { console.error("Related concepts tags container #popupRelatedConceptsTags not found!"); return; }
    tagsContainer.innerHTML = '';
    if (conceptData.relatedIds && conceptData.relatedIds.length > 0) {
        let foundCount = 0;
        conceptData.relatedIds.forEach(relatedId => {
            const relatedConcept = concepts.find(c => c.id === relatedId);
            if (relatedConcept) { const tag = document.createElement('span'); tag.textContent = relatedConcept.name; tag.classList.add('related-concept-tag'); tag.title = `Related: ${relatedConcept.name}`; tagsContainer.appendChild(tag); foundCount++; }
            else { console.warn(`Related concept ID ${relatedId} in concept ${conceptData.id} not found.`); }
        });
        if (foundCount === 0) { tagsContainer.innerHTML = '<p><i>None specified or found.</i></p>'; }
    } else { tagsContainer.innerHTML = '<p><i>None specified.</i></p>'; }
}
export function displayPopupRecipeComparison(conceptData, userCompScores) {
    // ... (Keep existing displayPopupRecipeComparison code) ...
    const detailsElement = document.getElementById('popupRecipeDetails'); const conceptProfileContainer = document.getElementById('popupConceptProfile'); const userProfileContainer = document.getElementById('popupUserComparisonProfile'); const highlightsContainer = document.getElementById('popupComparisonHighlights');
    if (!conceptProfileContainer || !userProfileContainer || !highlightsContainer || !detailsElement) { console.warn("Popup recipe comparison elements not found!"); if(detailsElement) detailsElement.style.display = 'none'; return; }
    detailsElement.style.display = ''; conceptProfileContainer.innerHTML = ''; userProfileContainer.innerHTML = ''; highlightsContainer.innerHTML = ''; let highlightsHTML = '<p><strong>Key Alignments & Differences:</strong></p>'; let hasHighlights = false; const conceptScores = conceptData.elementScores || {};
    elementNames.forEach(elName => {
        const key = elementNameToKey[elName]; const fullName = elementKeyToFullName[key]; if (!fullName) return; const conceptScore = conceptScores[key]; const userScore = userCompScores[key]; const conceptScoreValid = typeof conceptScore === 'number' && !isNaN(conceptScore); const userScoreValid = typeof userScore === 'number' && !isNaN(userScore); const conceptDisplay = conceptScoreValid ? conceptScore.toFixed(1) : '?'; const userDisplay = userScoreValid ? userScore.toFixed(1) : '?'; const conceptLabel = conceptScoreValid ? Utils.getScoreLabel(conceptScore) : 'N/A'; const userLabel = userScoreValid ? Utils.getScoreLabel(userScore) : 'N/A'; const conceptBarWidth = conceptScoreValid ? (conceptScore / 10) * 100 : 0; const userBarWidth = userScoreValid ? (userScore / 10) * 100 : 0; const color = Utils.getElementColor(fullName); const elementNameShort = elementDetails[fullName]?.name.substring(0, 11) || elName;
        conceptProfileContainer.innerHTML += `<div><strong>${elementNameShort}:</strong> <span>${conceptDisplay}</span> <div class="score-bar-container" title="${conceptLabel}"><div style="width: ${conceptBarWidth}%; background-color: ${color};"></div></div></div>`;
        userProfileContainer.innerHTML += `<div><strong>${elementNameShort}:</strong> <span>${userDisplay}</span> <div class="score-bar-container" title="${userLabel}"><div style="width: ${userBarWidth}%; background-color: ${color};"></div></div></div>`;
        if (conceptScoreValid && userScoreValid) { const diff = Math.abs(conceptScore - userScore); const elementNameDisplay = elementDetails[fullName]?.name || elName; if (conceptScore >= 7 && userScore >= 7) { highlightsHTML += `<p>• <strong class="match">Strong Alignment</strong> in ${elementNameDisplay} (Both ${conceptLabel}/${userLabel})</p>`; hasHighlights = true; } else if (conceptScore <= 3 && userScore <= 3) { highlightsHTML += `<p>• <strong class="match">Shared Low Emphasis</strong> in ${elementNameDisplay} (Both ${conceptLabel}/${userLabel})</p>`; hasHighlights = true; } else if (diff >= 4) { highlightsHTML += `<p>• <strong class="mismatch">Notable Difference</strong> in ${elementNameDisplay} (Concept: ${conceptLabel}, You: ${userLabel})</p>`; hasHighlights = true; } }
    });
    if (!hasHighlights) { highlightsHTML += '<p><em>No strong alignments or major differences identified.</em></p>'; }
    highlightsContainer.innerHTML = highlightsHTML; detailsElement.open = false; const nestedDetails = detailsElement.querySelector('.element-details'); if(nestedDetails) nestedDetails.open = false;
}

// --- Update Button Status Functions ---
export function updateGrimoireButtonStatus(conceptId, inResearchNotes = false) {
    // ... (Keep existing updateGrimoireButtonStatus code) ...
     if (!addToGrimoireButton) return; const isDiscovered = State.getDiscoveredConcepts().has(conceptId); addToGrimoireButton.classList.toggle('hidden', isDiscovered); if (!isDiscovered) { addToGrimoireButton.disabled = false; addToGrimoireButton.textContent = "Add to Grimoire"; addToGrimoireButton.classList.remove('added'); }
}
export function updateFocusButtonStatus(conceptId) {
    // ... (Keep existing updateFocusButtonStatus code) ...
    const localMarkAsFocusButton = document.getElementById('markAsFocusButton'); if (!localMarkAsFocusButton) return; const isDiscovered = State.getDiscoveredConcepts().has(conceptId); const isFocused = State.getFocusedConcepts().has(conceptId); const slotsFull = State.getFocusedConcepts().size >= State.getFocusSlots() && !isFocused; const showButton = isDiscovered; localMarkAsFocusButton.classList.toggle('hidden', !showButton); if (showButton) { localMarkAsFocusButton.textContent = isFocused ? "Remove Focus" : "Mark as Focus"; localMarkAsFocusButton.disabled = (slotsFull); localMarkAsFocusButton.classList.toggle('marked', isFocused); localMarkAsFocusButton.title = localMarkAsFocusButton.disabled && !isFocused ? `Focus slots full (${State.getFocusSlots()})` : (isFocused ? "Remove from Focused Concepts" : "Add to Focused Concepts"); }
}
export function updatePopupSellButton(conceptId, conceptData, inGrimoire, inResearchNotes) {
    // ... (Keep existing updatePopupSellButton code) ...
    const popupActions = conceptDetailPopup?.querySelector('.popup-actions'); if (!popupActions || !conceptData) return;
    popupActions.querySelector('.popup-sell-button')?.remove();
    let context = 'none'; if (inGrimoire) context = 'grimoire'; else if (inResearchNotes) context = 'discovery';
    if (context !== 'none') {
        let discoveryValue = Config.CONCEPT_DISCOVERY_INSIGHT[conceptData.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default; const sellValue = discoveryValue * Config.SELL_INSIGHT_FACTOR; const sourceLocation = context === 'grimoire' ? 'Grimoire' : 'Research Notes'; const sellButton = document.createElement('button'); sellButton.classList.add('button', 'small-button', 'secondary-button', 'sell-button', 'popup-sell-button'); sellButton.textContent = `Sell (${sellValue.toFixed(1)})`; sellButton.innerHTML += ` <i class="fas fa-brain insight-icon"></i>`; sellButton.dataset.conceptId = conceptId; sellButton.dataset.context = context; sellButton.title = `Sell from ${sourceLocation} for ${sellValue.toFixed(1)} Insight.`;
        const localMarkAsFocusButton = document.getElementById('markAsFocusButton'); // Get local reference
        if (localMarkAsFocusButton && !localMarkAsFocusButton.classList.contains('hidden')) { localMarkAsFocusButton.insertAdjacentElement('afterend', sellButton); }
        else if (addToGrimoireButton && !addToGrimoireButton.classList.contains('hidden')) { addToGrimoireButton.insertAdjacentElement('afterend', sellButton); }
        else { popupActions.appendChild(sellButton); }
    }
}

// --- Reflection Modal UI ---
export function displayReflectionPrompt(promptData, context) {
    // ... (Keep existing displayReflectionPrompt code) ...
    if (!reflectionModal || !promptData || !promptData.prompt) { console.error("Reflection modal or prompt data/text missing.", promptData); if (context === 'Dissonance') { const conceptId = GameLogic.getCurrentPopupConceptId(); if (conceptId !== null) { console.warn("Reflection prompt missing for Dissonance, adding concept directly."); if (typeof GameLogic.addConceptToGrimoireInternal === 'function') { GameLogic.addConceptToGrimoireInternal(conceptId); hidePopups(); showTemporaryMessage("Reflection unavailable, concept added.", 3500); } else { console.error("addConceptToGrimoireInternal is not available!"); showTemporaryMessage("Critical Error: Cannot process reflection.", 4000); } } else { showTemporaryMessage("Error: Could not display reflection or find target concept.", 3000); } } else { showTemporaryMessage("Error: Could not display reflection.", 3000); } return; } const { title, category, prompt, showNudge, reward } = promptData; if (reflectionModalTitle) reflectionModalTitle.textContent = title || "Moment for Reflection"; if (reflectionElement) reflectionElement.textContent = category || "General"; if (reflectionPromptText) reflectionPromptText.textContent = prompt.text; if (reflectionCheckbox) reflectionCheckbox.checked = false; if (scoreNudgeCheckbox && scoreNudgeLabel) { scoreNudgeCheckbox.checked = false; scoreNudgeCheckbox.classList.toggle('hidden', !showNudge); scoreNudgeLabel.classList.toggle('hidden', !showNudge); } if (confirmReflectionButton) confirmReflectionButton.disabled = true; if (reflectionRewardAmount) reflectionRewardAmount.textContent = `${reward.toFixed(1)}`; reflectionModal.classList.remove('hidden'); if (popupOverlay) popupOverlay.classList.remove('hidden');
}

// --- Integrated Element Deep Dive UI ---
export function displayElementDeepDive(elementKey, targetContainerElement) {
    // ... (Keep existing displayElementDeepDive code) ...
    if (!targetContainerElement) { targetContainerElement = personaElementDetailsDiv?.querySelector(`.element-deep-dive-container[data-element-key="${elementKey}"]`); if (!targetContainerElement) { console.error(`UI: Still could not find target container for element ${elementKey}`); return; } }
    const deepDiveData = elementDeepDive[elementKey] || []; const unlockedLevels = State.getState().unlockedDeepDiveLevels; const currentLevel = unlockedLevels[elementKey] || 0; const elementName = elementKeyToFullName[elementKey] || elementKey;
    const insight = State.getInsight();
    targetContainerElement.innerHTML = `<h5 class="deep-dive-section-title">${elementDetails[elementName]?.name || elementName} Insights</h5>`;
    if (deepDiveData.length === 0) { targetContainerElement.innerHTML += '<p>No deep dive content available.</p>'; return; }
    let displayedContent = false; deepDiveData.forEach(levelData => { if (levelData.level <= currentLevel) { targetContainerElement.innerHTML += `<div class="library-level"><h5 class="level-title">${levelData.title} (Level ${levelData.level})</h5><div class="level-content">${levelData.content}</div></div><hr class="popup-hr">`; displayedContent = true; } });
    if (!displayedContent && currentLevel === 0) { targetContainerElement.innerHTML += '<p><i>Unlock the first level to begin exploring.</i></p>'; }
    else if (!displayedContent && currentLevel > 0) { targetContainerElement.innerHTML += '<p><i>Error displaying unlocked content. Check console.</i></p>'; }
    const nextLevel = currentLevel + 1; const nextLevelData = deepDiveData.find(l => l.level === nextLevel);
    if (nextLevelData) {
        const cost = nextLevelData.insightCost || 0; const canAfford = insight >= cost;
        const isDisabled = !canAfford;
        let buttonTitle = ''; let errorMsgHTML = '';
        if (!canAfford) { buttonTitle = `Requires ${cost} Insight`; errorMsgHTML = `<p class='unlock-error'>Insufficient Insight (${insight.toFixed(1)}/${cost})</p>`; }
        else { buttonTitle = `Unlock for ${cost} Insight`; }
        const buttonHTML = `<button class="button small-button unlock-button" data-element-key="${elementKey}" data-level="${nextLevelData.level}" ${isDisabled ? 'disabled' : ''} title="${buttonTitle.replace(/"/g, '&quot;')}"> Unlock (${cost} <i class="fas fa-brain insight-icon"></i>)</button>`;
        targetContainerElement.innerHTML += `<div class="library-unlock"><h5>Next: ${nextLevelData.title} (Level ${nextLevelData.level})</h5>${buttonHTML}${errorMsgHTML}</div>`;
    } else if (displayedContent) { const lastHr = targetContainerElement.querySelector('hr.popup-hr:last-of-type'); if (lastHr) lastHr.remove(); targetContainerElement.innerHTML += '<p class="all-unlocked-message"><i>All insights unlocked for this element.</i></p>'; }
}

// --- Repository UI ---
export function displayRepositoryContent() {
    // ... (Keep existing displayRepositoryContent code) ...
     const showRepository = State.getState().questionnaireCompleted;
    if (repositoryScreen) repositoryScreen.classList.toggle('hidden', !showRepository);
    if (!showRepository) return;
    if (!repositoryFocusUnlocksDiv || !repositoryScenesDiv || !repositoryExperimentsDiv || !repositoryInsightsDiv) { console.error("Repository list containers missing!"); return; } console.log("UI: Displaying Repository Content"); repositoryFocusUnlocksDiv.innerHTML = ''; repositoryScenesDiv.innerHTML = ''; repositoryExperimentsDiv.innerHTML = ''; repositoryInsightsDiv.innerHTML = ''; const repoItems = State.getRepositoryItems(); const unlockedFocusData = State.getUnlockedFocusItems(); const attunement = State.getAttunement(); const focused = State.getFocusedConcepts(); const insight = State.getInsight(); if (unlockedFocusData.size > 0) { unlockedFocusData.forEach(unlockId => { const unlockData = focusDrivenUnlocks.find(u => u.id === unlockId); if (unlockData?.unlocks) { const item = unlockData.unlocks; const div = document.createElement('div'); div.classList.add('repository-item', 'focus-unlock-item'); let itemHTML = `<h4>${item.name || `Unlock: ${unlockData.id}`} (${item.type})</h4>`; if (unlockData.description) itemHTML += `<p><em>Source: ${unlockData.description}</em></p>`; if (item.type === 'insightFragment') { const iData = elementalInsights.find(i => i.id === item.id); itemHTML += `<p><em>"${iData?.text || item.text || "..."}"</em></p>`; } else itemHTML += `<p>Details below.</p>`; div.innerHTML = itemHTML; repositoryFocusUnlocksDiv.appendChild(div); } }); } else { repositoryFocusUnlocksDiv.innerHTML = '<p>Focus on synergistic Concepts on the Persona screen to unlock items.</p>'; } if (repoItems.scenes.size > 0) { repoItems.scenes.forEach(sceneId => { const scene = sceneBlueprints.find(s => s.id === sceneId); if (scene) { const cost = scene.meditationCost || Config.SCENE_MEDITATION_BASE_COST; const canAfford = insight >= cost; repositoryScenesDiv.appendChild(renderRepositoryItem(scene, 'scene', cost, canAfford)); } else { console.warn(`Scene ID ${sceneId} not found.`); } }); } else { repositoryScenesDiv.innerHTML = '<p>No Scene Blueprints discovered. Try using "Suggest Scenes".</p>'; } let experimentsDisplayed = 0; alchemicalExperiments.forEach(exp => { const isUnlockedByAttunement = attunement[exp.requiredElement] >= exp.requiredAttunement; const alreadyCompleted = repoItems.experiments.has(exp.id); if (isUnlockedByAttunement) { let canAttempt = true; let unmetReqs = []; if (exp.requiredFocusConceptIds) { for (const reqId of exp.requiredFocusConceptIds) { if (!focused.has(reqId)) { canAttempt = false; const c = concepts.find(c=>c.id === reqId); unmetReqs.push(c ? c.name : `ID ${reqId}`); } } } if (exp.requiredFocusConceptTypes) { for (const typeReq of exp.requiredFocusConceptTypes) { let met = false; const dMap = State.getDiscoveredConcepts(); for (const fId of focused) { const c = dMap.get(fId)?.concept; if (c?.cardType === typeReq) { met = true; break; } } if (!met) { canAttempt = false; unmetReqs.push(`Type: ${typeReq}`); } } } const cost = exp.insightCost || Config.EXPERIMENT_BASE_COST; const canAfford = insight >= cost; if (!canAfford) unmetReqs.push("Insight"); repositoryExperimentsDiv.appendChild(renderRepositoryItem(exp, 'experiment', cost, canAfford && canAttempt && !alreadyCompleted, alreadyCompleted, unmetReqs)); experimentsDisplayed++; } }); if (experimentsDisplayed === 0) { repositoryExperimentsDiv.innerHTML = '<p>Increase Element Attunement to unlock Experiments.</p>'; } if (repoItems.insights.size > 0) { const insightsByElement = {}; elementNames.forEach(elName => insightsByElement[elementNameToKey[elName]] = []); repoItems.insights.forEach(insightId => { const insightData = elementalInsights.find(i => i.id === insightId); if (insightData) { if (!insightsByElement[insightData.element]) insightsByElement[insightData.element] = []; insightsByElement[insightData.element].push(insightData); } else { console.warn(`Insight ID ${insightId} not found.`); } }); let insightsHTML = ''; elementNames.forEach(elName => { const key = elementNameToKey[elName]; if (insightsByElement[key] && insightsByElement[key].length > 0) { insightsHTML += `<h5>${elementDetails[elName]?.name || elName} Insights:</h5><ul>`; insightsByElement[key].sort((a, b) => a.id.localeCompare(b.id)).forEach(insight => { insightsHTML += `<li>"${insight.text}"</li>`; }); insightsHTML += `</ul>`; } }); repositoryInsightsDiv.innerHTML = insightsHTML || '<p>No Elemental Insights collected.</p>'; } else { repositoryInsightsDiv.innerHTML = '<p>No Elemental Insights collected. Found occasionally during Research.</p>'; } displayMilestones(); GameLogic.updateMilestoneProgress('repositoryContents', null);
}
export function renderRepositoryItem(item, type, cost, canDoAction, completed = false, unmetReqs = []) {
    // ... (Keep existing renderRepositoryItem code) ...
    const div = document.createElement('div'); div.classList.add('repository-item', `repo-item-${type}`); if (completed) div.classList.add('completed'); let actionsHTML = ''; let buttonDisabled = !canDoAction; let buttonTitle = ''; let buttonText = ''; if (type === 'scene') { buttonText = `Meditate (${cost} <i class="fas fa-brain insight-icon"></i>)`; if (!canDoAction) buttonTitle = `Requires ${cost} Insight`; else buttonTitle = `Meditate on ${item.name}`; actionsHTML = `<button class="button small-button" data-scene-id="${item.id}" ${buttonDisabled ? 'disabled' : ''} title="${buttonTitle}">${buttonText}</button>`; } else if (type === 'experiment') { buttonText = `Attempt (${cost} <i class="fas fa-brain insight-icon"></i>)`; if (completed) { buttonTitle = "Experiment Completed"; buttonDisabled = true; } else if (!canDoAction && unmetReqs.includes("Insight")) { buttonTitle = `Requires ${cost} Insight`; buttonDisabled = true; } else if (!canDoAction && unmetReqs.length > 0) { buttonTitle = `Requires Focus: ${unmetReqs.join(', ')}`; buttonDisabled = true; } else { buttonTitle = `Attempt ${item.name}`; buttonDisabled = false;} actionsHTML = `<button class="button small-button" data-experiment-id="${item.id}" ${buttonDisabled ? 'disabled' : ''} title="${buttonTitle}">${buttonText}</button>`; if (completed) actionsHTML += ` <span class="completed-text">(Completed)</span>`; else if (!canDoAction && unmetReqs.includes("Insight")) actionsHTML += ` <small class="req-missing">(Insufficient Insight)</small>`; else if (!canDoAction && unmetReqs.length > 0) actionsHTML += ` <small class="req-missing">(Requires Focus: ${unmetReqs.join(', ')})</small>`; } div.innerHTML = `<h4>${item.name} ${type === 'experiment' ? `(Req: ${item.requiredAttunement} ${elementKeyToFullName[item.requiredElement]} Attun.)` : ''}</h4><p>${item.description}</p><div class="repo-actions">${actionsHTML}</div>`; return div;
}

// --- Milestones UI ---
export function displayMilestones() {
    // ... (Keep existing displayMilestones code) ...
    if (!milestonesDisplay) return; milestonesDisplay.innerHTML = ''; const achieved = State.getState().achievedMilestones; if (achieved.size === 0) { milestonesDisplay.innerHTML = '<li>No milestones achieved yet.</li>'; return; } const achievedMilestonesData = milestones.filter(m => achieved.has(m.id)); achievedMilestonesData.forEach(milestone => { const li = document.createElement('li'); li.textContent = `✓ ${milestone.description}`; milestonesDisplay.appendChild(li); });
}

// --- Settings Popup UI ---
export function showSettings() {
    // ... (Keep existing showSettings code) ...
    if (settingsPopup) settingsPopup.classList.remove('hidden'); if (popupOverlay) popupOverlay.classList.remove('hidden');
}

// --- Tapestry Deep Dive / Resonance Chamber UI ---
export function displayTapestryDeepDive(analysisData) {
    // ... (Keep existing displayTapestryDeepDive code) ...
     if (!tapestryDeepDiveModal || !popupOverlay || !deepDiveNarrativeP || !deepDiveFocusIcons || !deepDiveAnalysisNodesContainer || !deepDiveDetailContent || !deepDiveTitle) {
        console.error("Resonance Chamber Modal elements missing!");
        showTemporaryMessage("Error opening Resonance Chamber.", 3000);
        return;
    }
    console.log("UI: Displaying Resonance Chamber with analysis:", analysisData);

    // Populate Summary Section
    deepDiveTitle.textContent = "Resonance Chamber"; // New title
    deepDiveNarrativeP.innerHTML = analysisData.fullNarrativeHTML || "Could not generate narrative.";
    deepDiveFocusIcons.innerHTML = '';
    const focused = State.getFocusedConcepts();
    const discovered = State.getDiscoveredConcepts();
    focused.forEach(id => {
        const concept = discovered.get(id)?.concept;
        if (concept) {
            let iconClass = Utils.getElementIcon("Default"); let iconColor = '#CCCCCC'; let iconTitle = concept.name;
            if (concept.primaryElement && elementKeyToFullName && elementKeyToFullName[concept.primaryElement]) {
                const fullElementName = elementKeyToFullName[concept.primaryElement]; iconClass = Utils.getElementIcon(fullElementName); iconColor = Utils.getElementColor(fullElementName); iconTitle = `${concept.name} (${elementDetails[fullElementName]?.name || fullElementName})`;
            } else { iconClass = Utils.getCardTypeIcon(concept.cardType); }
            const icon = document.createElement('i'); icon.className = `${iconClass}`; icon.style.color = iconColor; icon.title = iconTitle;
            deepDiveFocusIcons.appendChild(icon);
        }
    });

    // Reset Content Panel and Active Node
    if (deepDiveDetailContent) deepDiveDetailContent.innerHTML = '<p><i>Select an Aspect to explore...</i></p>';
    deepDiveAnalysisNodesContainer?.querySelectorAll('.aspect-node').forEach(btn => btn.classList.remove('active'));

    updateContemplationButtonState(); // Update button state (cost/cooldown)

    tapestryDeepDiveModal.classList.remove('hidden');
    popupOverlay.classList.remove('hidden');
}
export function displaySynergyTensionInfo(analysisData) {
    // ... (Keep existing displaySynergyTensionInfo code) ...
    if (!tapestryDeepDiveModal || !popupOverlay || !deepDiveDetailContent || !deepDiveTitle) {
        console.error("Resonance Chamber elements missing for Synergy/Tension display!");
        showTemporaryMessage("Error showing synergy details.", 3000);
        return;
    }
    console.log("UI: Displaying Synergy/Tension info in Resonance Chamber");

    let content = '<h4>Synergies & Tensions</h4>'; // Add header for clarity
     if (analysisData.synergies.length > 0) {
        content += `<h5>Synergies Found:</h5><ul>${analysisData.synergies.map(s => `<li>${s.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}</ul><hr class="popup-hr">`;
    } else {
        content += `<p><em>No direct synergies detected between focused concepts.</em></p><hr class="popup-hr">`;
    }
    if (analysisData.tensions.length > 0) {
        content += `<h5>Tensions Noted:</h5><ul>${analysisData.tensions.map(t => `<li>${t.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}</ul>`;
    } else {
        content += `<p><em>No significant elemental tensions detected within the focus.</em></p>`;
    }

    if (deepDiveDetailContent) deepDiveDetailContent.innerHTML = content;

    // Ensure the correct node is marked active
    deepDiveAnalysisNodesContainer?.querySelectorAll('.aspect-node').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.nodeId === 'synergy');
    });

    tapestryDeepDiveModal.classList.remove('hidden');
    popupOverlay.classList.remove('hidden');
}
export function updateContemplationButtonState() {
    // ... (Keep existing updateContemplationButtonState code) ...
    if (!contemplationNodeButton) return;
    const cooldownEnd = State.getContemplationCooldownEnd();
    const now = Date.now();
    const insight = State.getInsight();
    const cost = Config.CONTEMPLATION_COST;
    let disabled = false;
    let title = `Contemplate your focus (${cost} Insight)`;
    let text = `<i class="fas fa-brain"></i> Focusing Lens (<span class="contemplation-cost">${cost}</span> <i class="fas fa-brain insight-icon"></i>)`;

    if (cooldownEnd && now < cooldownEnd) {
        const remaining = Math.ceil((cooldownEnd - now) / 1000);
        disabled = true;
        title = `Contemplation available in ${remaining}s`;
        text = `<i class="fas fa-hourglass-half"></i> On Cooldown (${remaining}s)`;
    } else if (insight < cost) {
        disabled = true;
        title = `Requires ${cost} Insight`;
        // Keep button text showing cost
    }

    contemplationNodeButton.disabled = disabled;
    contemplationNodeButton.title = title;
    contemplationNodeButton.innerHTML = text;
}
export function updateDeepDiveContent(htmlContent, nodeId) {
    // ... (Keep existing updateDeepDiveContent code) ...
    if (!deepDiveDetailContent) return;
    console.log(`UI: Updating deep dive content for node: ${nodeId}`);
    deepDiveDetailContent.innerHTML = htmlContent;
    // Update active state for the navigation nodes
    deepDiveAnalysisNodesContainer?.querySelectorAll('.aspect-node').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.nodeId === nodeId);
    });
}
export function displayContemplationTask(task) {
    // ... (Keep existing displayContemplationTask code) ...
    if (!deepDiveDetailContent || !task) return;
    console.log("UI: Displaying contemplation task:", task);
    let html = `<h4>Contemplation Task</h4><p>${task.text}</p>`;
    if (task.requiresCompletionButton) {
        const rewardText = task.reward.type === 'insight' ? `<i class="fas fa-brain insight-icon"></i>` : 'Attun.';
        html += `<button id="completeContemplationBtn" class="button small-button">Mark Complete (+${task.reward.amount} ${rewardText})</button>`;
    }
    updateDeepDiveContent(html, 'contemplation'); // Use update function to set content and active state
    const completeBtn = document.getElementById('completeContemplationBtn');
    if (completeBtn) {
        completeBtn.addEventListener('click', () => {
            GameLogic.handleCompleteContemplation(task);
        }, { once: true });
    }
}
export function clearContemplationTask() {
    // ... (Keep existing clearContemplationTask code) ...
    if (deepDiveDetailContent) {
        deepDiveDetailContent.innerHTML = '<p>Contemplation acknowledged. Select another Aspect to explore.</p>';
        // Deactivate contemplation node
        deepDiveAnalysisNodesContainer?.querySelector('.aspect-node[data-node-id="contemplation"]')?.classList.remove('active');
    }
    updateContemplationButtonState(); // Update cooldown timer display
}

// --- Elemental Dilemma Modal Display ---
export function displayElementalDilemma(dilemma) {
    // ... (Keep existing displayElementalDilemma code) ...
    const modal = document.getElementById('dilemmaModal');
    const situationEl = document.getElementById('dilemmaSituationText');
    const questionEl = document.getElementById('dilemmaQuestionText');
    const slider = document.getElementById('dilemmaSlider');
    const minLabelEl = document.getElementById('dilemmaSliderMinLabel');
    const maxLabelEl = document.getElementById('dilemmaSliderMaxLabel');
    const valueDisplayEl = document.getElementById('dilemmaSliderValueDisplay');
    const nudgeCheckbox = document.getElementById('dilemmaNudgeCheckbox');

    if (!modal || !situationEl || !questionEl || !slider || !minLabelEl || !maxLabelEl || !valueDisplayEl || !nudgeCheckbox) {
        console.error("Dilemma modal elements missing!");
        return;
    }

    situationEl.textContent = dilemma.situation;
    questionEl.textContent = dilemma.question;
    minLabelEl.textContent = dilemma.sliderMinLabel;
    maxLabelEl.textContent = dilemma.sliderMaxLabel;
    slider.value = 5; // Reset slider
    valueDisplayEl.textContent = "Balanced"; // Reset display
    nudgeCheckbox.checked = false; // Reset checkbox

    // Update display on slider input
    slider.oninput = () => {
        const val = parseFloat(slider.value);
        let leaning;
        if (val < 1.5) leaning = `Strongly ${dilemma.sliderMinLabel}`;
        else if (val < 4.5) leaning = `Towards ${dilemma.sliderMinLabel}`;
        else if (val > 8.5) leaning = `Strongly ${dilemma.sliderMaxLabel}`;
        else if (val > 5.5) leaning = `Towards ${dilemma.sliderMaxLabel}`;
        else leaning = "Balanced";
        valueDisplayEl.textContent = leaning;
    };

    // Store dilemma data for confirmation button
    modal.dataset.dilemmaId = dilemma.id;
    modal.dataset.keyMin = dilemma.elementKeyMin;
    modal.dataset.keyMax = dilemma.elementKeyMax;

    modal.classList.remove('hidden');
    popupOverlay.classList.remove('hidden');
}

// --- Persona Action Buttons ---
export function updateElementalDilemmaButtonState() {
    // ... (Keep existing updateElementalDilemmaButtonState code) ...
     const btn = document.getElementById('elementalDilemmaButton');
     if (btn) {
         btn.disabled = false; // Always enabled post-questionnaire
         btn.title = "Engage with an Elemental Dilemma for Insight.";
     } else { console.warn("UI: Elemental Dilemma Button not found!"); }
}
export function updateExploreSynergyButtonStatus(status) {
    // ... (Keep existing updateExploreSynergyButtonStatus code) ...
    if (!exploreSynergyButton) return; const hasFocus = State.getFocusedConcepts().size >= 2; exploreSynergyButton.disabled = !hasFocus; exploreSynergyButton.classList.remove('highlight-synergy', 'highlight-tension'); if (!hasFocus) { exploreSynergyButton.title = "Focus at least 2 concepts"; exploreSynergyButton.textContent = "Explore Synergy"; } else { exploreSynergyButton.title = "Explore synergies and tensions between focused concepts"; exploreSynergyButton.textContent = "Explore Synergy"; if (status === 'synergy') { exploreSynergyButton.classList.add('highlight-synergy'); exploreSynergyButton.title += " (Synergy detected!)"; exploreSynergyButton.textContent = "Explore Synergy ✨"; } else if (status === 'tension') { exploreSynergyButton.classList.add('highlight-tension'); exploreSynergyButton.title += " (Tension detected!)"; exploreSynergyButton.textContent = "Explore Synergy ⚡"; } else if (status === 'both') { exploreSynergyButton.classList.add('highlight-synergy', 'highlight-tension'); exploreSynergyButton.title += " (Synergy & Tension detected!)"; exploreSynergyButton.textContent = "Explore Synergy 💥"; } }
}
export function updateSuggestSceneButtonState() {
    // ... (Keep existing updateSuggestSceneButtonState code) ...
    if (!suggestSceneButton) return; const hasFocus = State.getFocusedConcepts().size > 0; const canAfford = State.getInsight() >= Config.SCENE_SUGGESTION_COST; suggestSceneButton.disabled = !hasFocus || !canAfford; if (!hasFocus) suggestSceneButton.title = "Focus on concepts first"; else if (!canAfford) suggestSceneButton.title = `Requires ${Config.SCENE_SUGGESTION_COST} Insight`; else suggestSceneButton.title = `Suggest resonant scenes (${Config.SCENE_SUGGESTION_COST} Insight)`; if(sceneSuggestCostDisplay) sceneSuggestCostDisplay.textContent = Config.SCENE_SUGGESTION_COST;
}

// --- Display Research Status ---
export function displayResearchStatus(message) {
    // ... (Keep existing displayResearchStatus code) ...
    showTemporaryMessage(message, 2000);
}

// --- Initial UI Setup Helper ---
export function setupInitialUI() {
    // ... (Keep existing setupInitialUI code) ...
    console.log("UI: Setting up initial UI state");
    if(mainNavBar) mainNavBar.classList.add('hidden');
    showScreen('welcomeScreen');
    const loadBtn = document.getElementById('loadButton');
    if (loadBtn) loadBtn.classList.toggle('hidden', !localStorage.getItem(Config.SAVE_KEY));
    else console.warn("Load button element not found during initial setup.");
    updateSuggestSceneButtonState();
    updateElementalDilemmaButtonState();
    updateExploreSynergyButtonStatus('none');
    updateInsightBoostButtonState();
}

console.log("ui.js loaded.");
// --- END OF ui.js ---
