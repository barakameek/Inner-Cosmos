
let currentElementIndex = 0;
let userScores = { A: 5, I: 5, S: 5, P: 5, C: 5, R: 5 };
let userAnswers = {};
const elementNames = ["Attraction", "Interaction", "Sensory", "Psychological", "Cognitive", "Relational"];
const cardTypeKeys = ["Orientation", "Identity/Role", "Practice/Kink", "Psychological/Goal", "Relationship Style"];
let currentElementAnswers = {};
let currentlyDisplayedConceptId = null;
let discoveredConcepts = new Map(); // ID -> { concept, discoveredTime, artUnlocked: boolean, notes: string }
let focusedConcepts = new Set();
let focusSlotsTotal = 5;
const MAX_FOCUS_SLOTS = 12;
let userInsight = 10;
let elementAttunement = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 };
let unlockedDeepDiveLevels = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 };
const MAX_ATTUNEMENT = 100;
const BASE_RESEARCH_COST = 15;
const ART_EVOLVE_COST = 20;
const GUIDED_REFLECTION_COST = 10;
const DISSONANCE_THRESHOLD = 6.5;
const SCORE_NUDGE_AMOUNT = 0.15;
const SELL_INSIGHT_FACTOR = 0.5; // Gain 50% of discovery value when selling
let freeResearchAvailableToday = false;
let currentReflectionContext = null;
let reflectionTargetConceptId = null;
let seenPrompts = new Set();
let completedRituals = { daily: {}, weekly: {} };
let achievedMilestones = new Set();
let lastLoginDate = null;
let cardsAddedSinceLastPrompt = 0;
let promptCooldownActive = false;
let currentReflectionElement = null;
let currentReflectionCategory = null;
let currentPromptId = null;
let toastTimeout = null;
let saveIndicatorTimeout = null;
// Repository State
let discoveredRepositoryItems = { scenes: new Set(), experiments: new Set(), insights: new Set() };
let pendingRarePrompts = [];
// Focus Unlocks State
let unlockedFocusItems = new Set(); // Stores IDs of unlocked focusDrivenUnlocks definitions

// --- Persistence Key ---
const SAVE_KEY = 'personaAlchemyLabSaveData';

// --- DOM Elements (Updated for Moved Sections) ---
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
const elementLibraryDiv = document.getElementById('elementLibrary'); // MOVED to Persona HTML
const elementLibraryButtonsDiv = document.getElementById('elementLibraryButtons'); // MOVED
const elementLibraryContentDiv = document.getElementById('elementLibraryContent'); // MOVED
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
const grimoireContentDiv = document.getElementById('grimoireContent');
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


// --- Persistence Functions ---
function showSaveIndicator() { if (!saveIndicator) return; saveIndicator.classList.remove('hidden'); if (saveIndicatorTimeout) clearTimeout(saveIndicatorTimeout); saveIndicatorTimeout = setTimeout(() => { saveIndicator.classList.add('hidden'); saveIndicatorTimeout = null; }, 750); }
function saveGameState() {
    showSaveIndicator();
    try {
        const stateToSave = {
            userScores,
            discoveredConcepts: Array.from(discoveredConcepts.entries()),
            focusedConcepts: Array.from(focusedConcepts),
            userInsight,
            elementAttunement,
            unlockedDeepDiveLevels,
            achievedMilestones: Array.from(achievedMilestones),
            completedRituals,
            lastLoginDate,
            focusSlotsTotal,
            seenPrompts: Array.from(seenPrompts),
            freeResearchAvailableToday,
            questionnaireCompleted: currentElementIndex >= elementNames.length,
            userAnswers,
            discoveredRepositoryItems: {
                 scenes: Array.from(discoveredRepositoryItems.scenes),
                 experiments: Array.from(discoveredRepositoryItems.experiments),
                 insights: Array.from(discoveredRepositoryItems.insights)
            },
            pendingRarePrompts,
            unlockedFocusItems: Array.from(unlockedFocusItems) // Save focus unlocks
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
    } catch (error) { console.error("Error saving game state:", error); showTemporaryMessage("Error: Could not save progress!", 4000); }
}
function loadGameState() {
    console.log("Attempting to load game state...");
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
        try {
            const loadedState = JSON.parse(savedData);
            console.log("Saved data found:", loadedState);
            userScores = loadedState.userScores || { A: 5, I: 5, S: 5, P: 5, C: 5, R: 5 };
            discoveredConcepts = new Map(loadedState.discoveredConcepts || []);
            focusedConcepts = new Set(loadedState.focusedConcepts || []);
            userInsight = typeof loadedState.userInsight === 'number' ? loadedState.userInsight : 10;
            elementAttunement = loadedState.elementAttunement || { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 };
            unlockedDeepDiveLevels = loadedState.unlockedDeepDiveLevels || { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 };
            achievedMilestones = new Set(loadedState.achievedMilestones || []);
            completedRituals = loadedState.completedRituals || { daily: {}, weekly: {} };
            lastLoginDate = loadedState.lastLoginDate || null;
            focusSlotsTotal = typeof loadedState.focusSlotsTotal === 'number' ? loadedState.focusSlotsTotal : 5;
            seenPrompts = new Set(loadedState.seenPrompts || []);
            freeResearchAvailableToday = typeof loadedState.freeResearchAvailableToday === 'boolean' ? loadedState.freeResearchAvailableToday : false;
            userAnswers = loadedState.userAnswers || {};
            currentElementIndex = loadedState.questionnaireCompleted ? elementNames.length : 0;
            // Load repository items
            discoveredRepositoryItems = {
                scenes: new Set(loadedState.discoveredRepositoryItems?.scenes || []),
                experiments: new Set(loadedState.discoveredRepositoryItems?.experiments || []),
                insights: new Set(loadedState.discoveredRepositoryItems?.insights || [])
            };
            pendingRarePrompts = loadedState.pendingRarePrompts || [];
            unlockedFocusItems = new Set(loadedState.unlockedFocusItems || []); // Load focus unlocks

            console.log("Game state loaded successfully.");
            showTemporaryMessage("Session Restored", 2000);
            return true;
        } catch (error) { console.error("Error loading or parsing game state:", error); localStorage.removeItem(SAVE_KEY); showTemporaryMessage("Error loading session. Starting fresh.", 4000); return false; }
    } else { console.log("No saved game state found."); if(loadButton) loadButton.classList.add('hidden'); return false; }
}
function clearGameState() { console.log("Clearing saved game state..."); localStorage.removeItem(SAVE_KEY); showTemporaryMessage("Progress Reset!", 3000); if(loadButton) loadButton.classList.add('hidden'); }

// --- Data Availability Check ---
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
function gainInsight(amount, source = "Unknown") { if (typeof amount !== 'number' || isNaN(amount)) return; if (amount === 0) return; const previousInsight = userInsight; userInsight = Math.max(0, userInsight + amount); const actualChange = userInsight - previousInsight; if (actualChange !== 0) { const action = actualChange > 0 ? "Gained" : "Spent"; console.log(`${action} ${Math.abs(actualChange).toFixed(1)} Insight from ${source}. New total: ${userInsight.toFixed(1)}`); updateInsightDisplays(); if(personaScreen && !personaScreen.classList.contains('hidden')) { displayElementLibrary(); /* Update library costs if on persona screen */ } saveGameState(); } }
function spendInsight(amount, source = "Unknown") { if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return false; if (userInsight >= amount) { gainInsight(-amount, source); return true; } else { showTemporaryMessage(`Not enough Insight! Need ${amount}.`, 3000); return false; } }
function updateInsightDisplays() { const formattedInsight = userInsight.toFixed(1); if (userInsightDisplayPersona) userInsightDisplayPersona.textContent = formattedInsight; if (userInsightDisplayStudy) userInsightDisplayStudy.textContent = formattedInsight; displayResearchButtons(); if (seekGuidanceButton) seekGuidanceButton.disabled = userInsight < GUIDED_REFLECTION_COST; if (guidedReflectionCostDisplay) guidedReflectionCostDisplay.textContent = GUIDED_REFLECTION_COST; }
function getScoreLabel(score) { if (typeof score !== 'number' || isNaN(score)) return "N/A"; if (score >= 9) return "Very High"; if (score >= 7) return "High"; if (score >= 5) return "Moderate"; if (score >= 3) return "Low"; return "Very Low"; }
function getAffinityLevel(score) { if (typeof score !== 'number' || isNaN(score)) return null; if (score >= 8) return "High"; if (score >= 5) return "Moderate"; return null; }
function getElementColor(elementName) { const colors = { Attraction: '#FF6347', Interaction: '#4682B4', Sensory: '#32CD32', Psychological: '#FFD700', Cognitive: '#8A2BE2', Relational: '#FF8C00' }; return colors[elementName] || '#CCCCCC'; }
function hexToRgba(hex, alpha = 1) { if (!hex || typeof hex !== 'string') return `rgba(128,128,128, ${alpha})`; hex = hex.replace('#', ''); if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]; const bigint = parseInt(hex, 16); if (isNaN(bigint)) return `rgba(128,128,128, ${alpha})`; const r = (bigint >> 16) & 255; const g = (bigint >> 8) & 255; const b = bigint & 255; return `rgba(${r},${g},${b},${alpha})`; }
function getCardTypeIcon(cardType) { switch (cardType) { case "Orientation": return "fa-solid fa-compass"; case "Identity/Role": return "fa-solid fa-mask"; case "Practice/Kink": return "fa-solid fa-gear"; case "Psychological/Goal": return "fa-solid fa-brain"; case "Relationship Style": return "fa-solid fa-heart"; default: return "fa-solid fa-question-circle"; } }
function getElementIcon(elementName) { switch (elementName) { case "Attraction": return "fa-solid fa-magnet"; case "Interaction": return "fa-solid fa-users"; case "Sensory": return "fa-solid fa-hand-sparkles"; case "Psychological": return "fa-solid fa-comment-dots"; case "Cognitive": return "fa-solid fa-lightbulb"; case "Relational": return "fa-solid fa-link"; default: return "fa-solid fa-atom"; } }
function euclideanDistance(userScoresObj, conceptScoresObj) { let sumOfSquares = 0; let validDimensions = 0; if (!userScoresObj || typeof userScoresObj !== 'object') { return Infinity; } if (!conceptScoresObj || typeof conceptScoresObj !== 'object') { return Infinity; } const expectedKeys = Object.keys(userScoresObj); if (expectedKeys.length === 0) { return Infinity; } for (const key of expectedKeys) { const s1 = userScoresObj[key]; const s2 = conceptScoresObj[key]; const s1Valid = typeof s1 === 'number' && !isNaN(s1); const s2Valid = conceptScoresObj.hasOwnProperty(key) && typeof s2 === 'number' && !isNaN(s2); if (s1Valid && s2Valid) { sumOfSquares += Math.pow(s1 - s2, 2); validDimensions++; } } if (validDimensions === 0) return Infinity; return Math.sqrt(sumOfSquares); }

// --- Screen Management ---
function showScreen(screenId) { console.log("Showing screen:", screenId); let targetIsMain = ['personaScreen', 'studyScreen', 'grimoireScreen', 'repositoryScreen'].includes(screenId); screens.forEach(screen => { screen.classList.toggle('current', screen.id === screenId); screen.classList.toggle('hidden', screen.id !== screenId); }); if (mainNavBar) mainNavBar.classList.toggle('hidden', !targetIsMain); navButtons.forEach(button => { button.classList.toggle('active', button.dataset.target === screenId); }); if (['questionnaireScreen', 'grimoireScreen', 'personaScreen', 'studyScreen', 'repositoryScreen'].includes(screenId)) { window.scrollTo(0, 0); } }
function hidePopups() { if (conceptDetailPopup) conceptDetailPopup.classList.add('hidden'); if (reflectionModal) reflectionModal.classList.add('hidden'); if (settingsPopup) settingsPopup.classList.add('hidden'); if (popupOverlay) popupOverlay.classList.add('hidden'); currentlyDisplayedConceptId = null; currentReflectionElement = null; currentPromptId = null; currentReflectionContext = null; reflectionTargetConceptId = null; }

// --- Initialization and Questionnaire Logic ---
function initializeQuestionnaire(forceReset = false) {
    if (!checkDataLoaded()) return;
    console.log(`[initializeQuestionnaire] Called. Force Reset: ${forceReset}`); const isResuming = !forceReset && localStorage.getItem(SAVE_KEY); if (!isResuming) { console.log("[initializeQuestionnaire] Resetting core state variables."); currentElementIndex = 0; userScores = { A: 5, I: 5, S: 5, P: 5, C: 5, R: 5 }; userAnswers = {}; elementNames.forEach(elName => { userAnswers[elName] = {}; }); discoveredConcepts = new Map(); focusedConcepts = new Set(); userInsight = 10; focusSlotsTotal = 5; elementAttunement = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 }; unlockedDeepDiveLevels = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 }; seenPrompts = new Set(); completedRituals = { daily: {}, weekly: {} }; achievedMilestones = new Set(); lastLoginDate = null; cardsAddedSinceLastPrompt = 0; promptCooldownActive = false; freeResearchAvailableToday = false; discoveredRepositoryItems = { scenes: new Set(), experiments: new Set(), insights: new Set() }; pendingRarePrompts = []; unlockedFocusItems = new Set(); /* Reset new state */ } else { console.log("[initializeQuestionnaire] Skipping core state reset (resuming or loaded)."); if (currentElementIndex < elementNames.length) { currentElementIndex = 0; userAnswers = {}; elementNames.forEach(elName => { userAnswers[elName] = {}; }); console.log("[initializeQuestionnaire] Restarting questionnaire from element 0."); } }
    updateElementProgressHeader(-1); displayElementQuestions(currentElementIndex); showScreen('questionnaireScreen'); if (mainNavBar) mainNavBar.classList.add('hidden'); if(dailyRitualsDisplay) dailyRitualsDisplay.innerHTML = '<li>Loading...</li>'; if(milestonesDisplay) milestonesDisplay.innerHTML = '<li>None yet</li>'; if(elementLibraryContentDiv) elementLibraryContentDiv.innerHTML = '<p>Select an Element above to view its deep dive content.</p>'; if(elementLibraryButtonsDiv) elementLibraryButtonsDiv.innerHTML = ''; /* Clear moved library */ if(grimoireContentDiv) grimoireContentDiv.innerHTML = '<p>Grimoire empty.</p>'; if(focusedConceptsDisplay) focusedConceptsDisplay.innerHTML = '<li>Mark concepts as "Focus"...</li>'; if(researchButtonContainer) researchButtonContainer.innerHTML = ''; if(freeResearchButton) freeResearchButton.classList.add('hidden'); if(researchOutput) researchOutput.innerHTML = '<p><i>Research results will appear here.</i></p>'; /* Reset research output */ updateInsightDisplays(); updateFocusSlotsDisplay(); updateGrimoireCounter(); if(personaDetailedView) personaDetailedView.classList.add('current'); if(personaDetailedView) personaDetailedView.classList.remove('hidden'); if(personaSummaryView) personaSummaryView.classList.add('hidden'); if(personaSummaryView) personaSummaryView.classList.remove('current'); if(showDetailedViewBtn) showDetailedViewBtn.classList.add('active'); if(showSummaryViewBtn) showSummaryViewBtn.classList.remove('active');
}
function updateElementProgressHeader(activeIndex) {
    if (!checkDataLoaded() || !elementProgressHeader) return;
    elementProgressHeader.innerHTML = ''; elementNames.forEach((name, index) => { const tab = document.createElement('div'); tab.classList.add('element-tab'); const elementData = elementDetails[name] || {}; tab.textContent = elementData.name || name; tab.title = elementData.name || name; tab.classList.toggle('completed', index < activeIndex); tab.classList.toggle('active', index === activeIndex); elementProgressHeader.appendChild(tab); });
}
function displayElementQuestions(index) {
    if (!checkDataLoaded()) return;
    if (index >= elementNames.length) { finalizeScoresAndShowPersona(); return; } const elementName = elementNames[index]; const elementData = elementDetails[elementName] || {}; const questions = questionnaireGuided[elementName] || []; const questionContentElement = document.getElementById('questionContent'); if (!questionContentElement) { return; } let introHTML = `<div class="element-intro"><h2>${elementData.name || elementName}</h2><p><em>${elementData.coreQuestion || ''}</em></p><p>${elementData.coreConcept || 'Loading...'}</p><p><small><strong>Persona Connection:</strong> ${elementData.personaConnection || ''}</small></p></div>`; questionContentElement.innerHTML = introHTML; currentElementAnswers = { ...(userAnswers[elementName] || {}) }; let questionsHTML = '';
    if (questions && questions.length > 0) { questions.forEach(q => { let inputHTML = `<div class="question-block" id="block_${q.qId}"><h3 class="question-title">${q.text}</h3><div class="input-container">`; const savedAnswer = currentElementAnswers[q.qId]; if (q.type === "slider") { const val = savedAnswer !== undefined ? savedAnswer : q.defaultValue; inputHTML += ` <div class="slider-container"> <input type="range" id="${q.qId}" class="slider q-input" min="${q.minValue}" max="${q.maxValue}" step="${q.step || 0.5}" value="${val}" data-question-id="${q.qId}" data-type="slider"> <div class="label-container"> <span class="label-text">${q.minLabel}</span><span class="label-text">${q.maxLabel}</span> </div> <p class="value-text">Selected: <span id="display_${q.qId}">${parseFloat(val).toFixed(1)}</span></p> <p class="slider-feedback" id="feedback_${q.qId}"></p> </div>`; } else if (q.type === "radio") { inputHTML += `<div class="radio-options">`; q.options.forEach(opt => { const checked = savedAnswer === opt.value ? 'checked' : ''; inputHTML += `<div><input type="radio" id="${q.qId}_${opt.value}" class="q-input" name="${q.qId}" value="${opt.value}" ${checked} data-question-id="${q.qId}" data-type="radio"><label for="${q.qId}_${opt.value}">${opt.value}</label></div>`; }); inputHTML += `</div>`; } else if (q.type === "checkbox") { inputHTML += `<div class="checkbox-options">`; q.options.forEach(opt => { const checked = Array.isArray(savedAnswer) && savedAnswer.includes(opt.value) ? 'checked' : ''; inputHTML += `<div><input type="checkbox" id="${q.qId}_${opt.value}" class="q-input" name="${q.qId}" value="${opt.value}" ${checked} data-question-id="${q.qId}" data-max-choices="${q.maxChoices || 2}" data-type="checkbox"><label for="${q.qId}_${opt.value}">${opt.value}</label></div>`; }); inputHTML += `</div>`; } inputHTML += `</div></div>`; questionsHTML += inputHTML; }); } else { questionsHTML = '<p><em>(No questions defined)</em></p>'; }
    const introDiv = questionContentElement.querySelector('.element-intro'); if (introDiv) { introDiv.insertAdjacentHTML('afterend', questionsHTML); } else { questionContentElement.innerHTML += questionsHTML; }
    questionContentElement.querySelectorAll('.q-input').forEach(input => { const eventType = (input.type === 'range') ? 'input' : 'change'; input.addEventListener(eventType, handleQuestionnaireInputChange); }); questionContentElement.querySelectorAll('input[type="checkbox"].q-input').forEach(checkbox => { checkbox.addEventListener('change', (event) => enforceMaxChoices(checkbox.name, parseInt(checkbox.dataset.maxChoices || 2), event)); }); questionContentElement.querySelectorAll('.slider.q-input').forEach(slider => { updateSliderFeedbackText(slider); });
    updateElementProgressHeader(index); if (progressText) progressText.textContent = `Element ${index + 1} / ${elementNames.length}: ${elementData.name || elementName}`; updateDynamicFeedback(elementName); if (dynamicScoreFeedback) dynamicScoreFeedback.style.display = 'block'; if (prevElementButton) prevElementButton.style.visibility = (index > 0) ? 'visible' : 'hidden'; if (nextElementButton) nextElementButton.textContent = (index === elementNames.length - 1) ? "View My Persona" : "Next Element";
}
function updateSliderFeedbackText(sliderElement) { if (!checkDataLoaded()) return; if (!sliderElement || sliderElement.type !== 'range') return; const qId = sliderElement.dataset.questionId; const feedbackElement = document.getElementById(`feedback_${qId}`); if (!feedbackElement) return; const currentValue = parseFloat(sliderElement.value); const elementName = elementNames[currentElementIndex]; const interpretations = elementDetails?.[elementName]?.scoreInterpretations; if (!interpretations) { feedbackElement.textContent = `(Score: ${currentValue.toFixed(1)})`; return; } const scoreLabel = getScoreLabel(currentValue); const interpretationText = interpretations[scoreLabel] || `Interpretation for "${scoreLabel}" not found.`; feedbackElement.textContent = interpretationText; feedbackElement.title = `Meaning of score ${currentValue.toFixed(1)} (${scoreLabel})`; }
function handleQuestionnaireInputChange(event) { const input = event.target; const type = input.dataset.type; const elementName = elementNames[currentElementIndex]; if (type === 'slider') { const qId = input.dataset.questionId; const display = document.getElementById(`display_${qId}`); if (display) display.textContent = parseFloat(input.value).toFixed(1); updateSliderFeedbackText(input); } collectCurrentElementAnswers(); updateDynamicFeedback(elementName); }
function enforceMaxChoices(name, max, event) { const checkboxes = questionContent?.querySelectorAll(`input[name="${name}"]:checked`); if (!checkboxes) return; if (checkboxes.length > max) { showTemporaryMessage(`Max ${max} options allowed.`, 2500); if (event?.target?.checked) { event.target.checked = false; collectCurrentElementAnswers(); updateDynamicFeedback(elementNames[currentElementIndex]); } } }
function collectCurrentElementAnswers() { const elementName = elementNames[currentElementIndex]; const questions = questionnaireGuided[elementName] || []; currentElementAnswers = {}; questions.forEach(q => { const qId = q.qId; const container = questionContent || document; if (q.type === 'slider') { const input = container.querySelector(`#${qId}.q-input`); if (input) currentElementAnswers[qId] = parseFloat(input.value); } else if (q.type === 'radio') { const checked = container.querySelector(`input[name="${qId}"]:checked`); if (checked) currentElementAnswers[qId] = checked.value; } else if (q.type === 'checkbox') { const checked = container.querySelectorAll(`input[name="${qId}"]:checked`); currentElementAnswers[qId] = Array.from(checked).map(cb => cb.value); } }); userAnswers[elementName] = { ...currentElementAnswers }; }
function updateDynamicFeedback(elementName) { if (!checkDataLoaded()) return; const elementData = elementDetails?.[elementName]; if (!elementData) return; if (!dynamicScoreFeedback || !feedbackElementSpan || !feedbackScoreSpan || !feedbackScoreBar) return; const tempScore = calculateElementScore(elementName, currentElementAnswers); const scoreLabel = getScoreLabel(tempScore); feedbackElementSpan.textContent = elementData.name || elementName; feedbackScoreSpan.textContent = tempScore.toFixed(1); let labelSpan = dynamicScoreFeedback.querySelector('.score-label'); if (labelSpan) { labelSpan.textContent = `(${scoreLabel})`; } feedbackScoreBar.style.width = `${tempScore * 10}%`; }
function calculateElementScore(elementName, answersForElement) { const questions = questionnaireGuided[elementName] || []; let score = 5.0; questions.forEach(q => { const answer = answersForElement[q.qId]; let pointsToAdd = 0; if (q.type === 'slider') { const value = (answer !== undefined) ? answer : q.defaultValue; pointsToAdd = (value - q.defaultValue) * (q.scoreWeight || 1.0); } else if (q.type === 'radio') { const opt = q.options.find(o => o.value === answer); pointsToAdd = opt ? (opt.points || 0) * (q.scoreWeight || 1.0) : 0; } else if (q.type === 'checkbox' && Array.isArray(answer)) { answer.forEach(val => { const opt = q.options.find(o => o.value === val); pointsToAdd += opt ? (opt.points || 0) * (q.scoreWeight || 1.0) : 0; }); } score += pointsToAdd; }); return Math.max(0, Math.min(10, score)); }
function nextElement() { collectCurrentElementAnswers(); currentElementIndex++; displayElementQuestions(currentElementIndex); }
function prevElement() { collectCurrentElementAnswers(); currentElementIndex--; displayElementQuestions(currentElementIndex); }

function finalizeScoresAndShowPersona() {
    if (!checkDataLoaded()) return;
    console.log("Finalizing scores...");
    const finalScores = {};
    try {
        elementNames.forEach(elementName => {
            const score = calculateElementScore(elementName, userAnswers[elementName] || {});
            const key = elementNameToKey[elementName];
            if (key) {
                finalScores[key] = score;
            } else {
                console.warn(`Could not find key for element name: ${elementName}`);
            }
        });
        userScores = finalScores;
        console.log("Final User Scores:", userScores);
        determineStarterHandAndEssence();
        updateMilestoneProgress('completeQuestionnaire', 1);
        checkForDailyLogin();
        displayPersonaScreen(); // Includes Element Library now
        displayStudyScreenContent();
        displayDailyRituals();
        // displayMilestones(); // Now displayed via Repository
        populateGrimoireFilters();
        updateGrimoireCounter();
        displayGrimoire();
        displayRepositoryContent(); // Includes Milestones now
        saveGameState();
        showScreen('personaScreen'); // Default to Persona screen after questionnaire
        showTemporaryMessage("Experiment Complete! Explore your results.", 4000);
    } catch (error) {
        console.error("Error during finalizeScoresAndShowPersona sequence:", error);
        try {
            showScreen('welcomeScreen');
            alert("An error occurred during setup. Please check console and try restarting.");
        } catch (fallbackError) {
            console.error("Error during fallback sequence:", fallbackError);
            document.body.innerHTML = "<h1>Critical Error</h1><p>Setup failed. Check console (F12) and refresh.</p>";
        }
    }
}

// --- Starter Hand & Resource Granting ---
function determineStarterHandAndEssence() { if (!checkDataLoaded()) return; console.log("[determineStarterHand] Function called."); discoveredConcepts = new Map(); if (!concepts || !Array.isArray(concepts) || concepts.length === 0) { return; } if (typeof elementKeyToFullName === 'undefined' || !elementKeyToFullName) { return; } let conceptsWithDistance = []; concepts.forEach((c, index) => { if (!c || typeof c !== 'object' || !c.id || !c.elementScores) { return; } const distance = euclideanDistance(userScores, c.elementScores); if (distance !== Infinity && typeof distance === 'number' && !isNaN(distance)) { conceptsWithDistance.push({ ...c, distance: distance }); } }); if (conceptsWithDistance.length === 0) { return; } conceptsWithDistance.sort((a, b) => a.distance - b.distance); const candidates = conceptsWithDistance.slice(0, 20); const starterHand = []; const representedElements = new Set(); const starterHandIds = new Set(); const targetHandSize = 7; for (const c of candidates) { if (starterHand.length >= 4) break; if (!starterHandIds.has(c.id)) { starterHand.push(c); starterHandIds.add(c.id); if (c.primaryElement) representedElements.add(c.primaryElement); } } for (const c of candidates) { if (starterHand.length >= targetHandSize) break; if (starterHandIds.has(c.id)) continue; const needsRepresentation = c.primaryElement && !representedElements.has(c.primaryElement); if (needsRepresentation || representedElements.size < 4 || starterHand.length < 5) { starterHand.push(c); starterHandIds.add(c.id); if (c.primaryElement) representedElements.add(c.primaryElement); } } for (const c of candidates) { if (starterHand.length >= targetHandSize) break; if (!starterHandIds.has(c.id)) { starterHand.push(c); starterHandIds.add(c.id); } } console.log("[determineStarterHand] Starter Hand Selected:", starterHand.map(c => c.name)); if (starterHand.length === 0) { return; } starterHand.forEach(concept => { if (!discoveredConcepts.has(concept.id)) { discoveredConcepts.set(concept.id, { concept: concept, discoveredTime: Date.now(), artUnlocked: false, notes: "" }); gainAttunementForAction('discover', concept.primaryElement); } }); console.log(`[determineStarterHand] Discovered Concepts Count: ${discoveredConcepts.size}`); }

// --- Attunement ---
function gainAttunementForAction(actionType, elementKey = null, amount = 0.5) { if (!checkDataLoaded()) return; let targetKeys = []; const gainAmount = amount; if (elementKey && elementAttunement.hasOwnProperty(elementKey)) { targetKeys.push(elementKey); } else if (actionType === 'completeReflection' && currentReflectionElement && elementNameToKey[currentReflectionElement]) { const key = elementNameToKey[currentReflectionElement]; if (key && elementAttunement.hasOwnProperty(key)) { targetKeys.push(key); } } else if (['generic', 'completeReflectionGeneric', 'scoreNudge', 'ritual', 'milestone', 'experimentSuccess'].includes(actionType) || elementKey === 'All') { targetKeys = Object.keys(elementAttunement); amount = (actionType === 'generic') ? 0.1 : (actionType === 'completeReflectionGeneric') ? 0.2 : (actionType === 'scoreNudge') ? 0.5 / targetKeys.length : amount; } else { return; } let changed = false; targetKeys.forEach(key => { const currentAttunement = elementAttunement[key] || 0; const newAttunement = Math.min(MAX_ATTUNEMENT, currentAttunement + gainAmount); if (newAttunement > currentAttunement) { elementAttunement[key] = newAttunement; changed = true; updateMilestoneProgress('elementAttunement', { [key]: newAttunement }); updateMilestoneProgress('elementAttunement', elementAttunement); } }); if (changed) { console.log(`Attunement updated (${actionType}, Key: ${elementKey || 'Multi'}) by ${gainAmount.toFixed(1)}`); displayElementAttunement(); saveGameState(); } }
function displayElementAttunement() {
    if (!checkDataLoaded()) return;
    elementNames.forEach(elName => {
        const key = elementNameToKey[elName];
        const attunementValue = elementAttunement[key] || 0;
        const percentage = (attunementValue / MAX_ATTUNEMENT) * 100;
        const color = getElementColor(elName);
        const targetDetails = personaElementDetailsDiv?.querySelector(`.element-detail-entry[data-element-key="${key}"]`);
        if (targetDetails) {
            let attunementDiv = targetDetails.querySelector('.attunement-display');
            if (!attunementDiv) {
                attunementDiv = document.createElement('div');
                attunementDiv.classList.add('attunement-display');
                const descriptionDiv = targetDetails.querySelector('.element-description');
                if (descriptionDiv) {
                     descriptionDiv.appendChild(document.createElement('hr')); // Add separator
                     descriptionDiv.appendChild(attunementDiv);
                } else {
                     // Fallback if structure is unexpected
                     targetDetails.appendChild(document.createElement('hr'));
                     targetDetails.appendChild(attunementDiv);
                }
            }
            attunementDiv.innerHTML = `
                <div class="attunement-item">
                    <span class="attunement-name">Attunement:</span>
                    <div class="attunement-bar-container" title="Current Attunement: ${attunementValue.toFixed(1)} / ${MAX_ATTUNEMENT}">
                        <div class="attunement-bar" style="width: ${percentage}%; background-color: ${color};"></div>
                    </div>
                     <i class="fas fa-info-circle info-icon" title="Attunement reflects your affinity and experience with this Element. It grows through related actions like Research, Reflection, and focusing on relevant Concepts. High Attunement may unlock Experiments or reduce Research costs."></i>
                </div>`;
        }
    });
}

// --- Persona Screen Functions ---
function updateFocusSlotsDisplay() { if (focusedConceptsHeader) { focusedConceptsHeader.textContent = `Focused Concepts (${focusedConcepts.size} / ${focusSlotsTotal})`; const icon = focusedConceptsHeader.querySelector('.info-icon'); if(icon) icon.title = `The number of Concepts currently marked as Focus out of your total available slots (${focusSlotsTotal}). Slots can be increased via Milestones.`; } }
function displayPersonaScreen() {
    if (!checkDataLoaded()) return;
    if (!personaElementDetailsDiv) return; personaElementDetailsDiv.innerHTML = '';
    elementNames.forEach(elementName => { const key = elementNameToKey[elementName]; const score = userScores[key]; const scoreLabel = getScoreLabel(score); const elementData = elementDetails[elementName] || {}; const interpretation = elementData.scoreInterpretations?.[scoreLabel] || "N/A"; const barWidth = score ? (score / 10) * 100 : 0; const color = getElementColor(elementName); const details = document.createElement('details'); details.classList.add('element-detail-entry'); details.dataset.elementKey = key; details.style.setProperty('--element-color', color); details.innerHTML = `<summary class="element-detail-header"><div><strong>${elementData.name || elementName}:</strong><span>${score?.toFixed(1) ?? '?'}</span> <span class="score-label">(${scoreLabel})</span></div><div class="score-bar-container"><div style="width: ${barWidth}%; background-color: ${color};"></div></div></summary><div class="element-description"><p><strong>Core Concept:</strong> ${elementData.coreConcept || ''}</p><p><strong>Elaboration:</strong> ${elementData.elaboration || ''}</p><hr><p><strong>Your Score (${scoreLabel}):</strong> ${interpretation}</p><p><small><strong>Examples:</strong> ${elementData.examples || ''}</small></p></div>`; personaElementDetailsDiv.appendChild(details); });
    updateInsightDisplays(); displayElementAttunement(); displayFocusedConceptsPersona(); updateFocusElementalResonance(); generateTapestryNarrative(); synthesizeAndDisplayThemesPersona();
    displayElementLibrary(); // MOVED Call here
    // displayMilestones(); // MOVED Removed call here
    displayPersonaSummary();
}
function displayFocusedConceptsPersona() { if (!checkDataLoaded() || !focusedConceptsDisplay) return; focusedConceptsDisplay.innerHTML = ''; updateFocusSlotsDisplay(); if (focusedConcepts.size === 0) { focusedConceptsDisplay.innerHTML = `<li>Mark concepts as "Focus" to weave your active Tapestry (Max ${focusSlotsTotal}).</li>`; return; } focusedConcepts.forEach(conceptId => { const conceptData = discoveredConcepts.get(conceptId); if (conceptData?.concept) { const concept = conceptData.concept; const item = document.createElement('div'); item.classList.add('focus-concept-item'); item.dataset.conceptId = concept.id; item.title = `View ${concept.name}`; item.innerHTML = `<i class="${getCardTypeIcon(concept.cardType)}"></i><span class="name">${concept.name}</span><span class="type">(${concept.cardType})</span>`; item.addEventListener('click', () => showConceptDetailPopup(concept.id)); focusedConceptsDisplay.appendChild(item); } else { console.warn(`Focused concept ID ${conceptId} not found in discoveredConcepts.`); } }); }
function synthesizeAndDisplayThemesPersona() {
    if (!checkDataLoaded()) return;
    if (!personaThemesList) return; personaThemesList.innerHTML = ''; if (focusedConcepts.size === 0) { personaThemesList.innerHTML = '<li>Mark Focused Concepts to reveal dominant themes.</li>'; return; } if (typeof elementKeyToFullName === 'undefined') { return; } const elementCountsByKey = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 }; const themeThreshold = 7.0; focusedConcepts.forEach(id => { const discoveredData = discoveredConcepts.get(id); const concept = discoveredData?.concept; if (concept?.elementScores) { for (const key in concept.elementScores) { if (elementKeyToFullName.hasOwnProperty(key) && concept.elementScores[key] >= themeThreshold) { elementCountsByKey[key]++; } } } }); const sortedThemes = Object.entries(elementCountsByKey).filter(([key, count]) => count > 0 && elementDetails[elementKeyToFullName[key]]).sort(([, a], [, b]) => b - a).map(([key, count]) => ({ name: elementDetails[elementKeyToFullName[key]]?.name || key, count })); if (sortedThemes.length === 0) { personaThemesList.innerHTML = `<li>No strong themes (element score >= ${themeThreshold.toFixed(1)}) detected.</li>`; return; } sortedThemes.slice(0, 3).forEach(theme => { const li = document.createElement('li'); li.textContent = `${theme.name} Focus (${theme.count} concept${theme.count > 1 ? 's' : ''})`; personaThemesList.appendChild(li); });
}
function updateFocusElementalResonance() {
    if (!checkDataLoaded() || !focusResonanceBarsContainer) return;
    focusResonanceBarsContainer.innerHTML = ''; const focusScores = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 }; let focusCount = focusedConcepts.size; if (focusCount > 0) { focusedConcepts.forEach(id => { const data = discoveredConcepts.get(id); if (data?.concept?.elementScores) { for (const key in focusScores) { if (data.concept.elementScores.hasOwnProperty(key)) { focusScores[key] += data.concept.elementScores[key]; } } } }); for (const key in focusScores) { focusScores[key] /= focusCount; } } elementNames.forEach(elName => { const key = elementNameToKey[elName]; const avgScore = focusScores[key] || 0; const percentage = Math.max(0, Math.min(100, (avgScore / 10) * 100)); const color = getElementColor(elName); const name = elementDetails[elName]?.name || elName; const item = document.createElement('div'); item.classList.add('focus-resonance-item'); item.innerHTML = ` <span class="focus-resonance-name">${name}:</span> <div class="focus-resonance-bar-container" title="${avgScore.toFixed(1)} Avg Score"> <div class="focus-resonance-bar" style="width: ${percentage}%; background-color: ${color};"></div> </div>`; focusResonanceBarsContainer.appendChild(item); });
}
function generateTapestryNarrative() {
    if (!checkDataLoaded() || !tapestryNarrativeP) return;
    const focusCount = focusedConcepts.size; if (focusCount === 0) { tapestryNarrativeP.textContent = 'Mark concepts as "Focus" to weave your narrative...'; return; } const focusScores = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 }; focusedConcepts.forEach(id => { const data = discoveredConcepts.get(id); if (data?.concept?.elementScores) { for (const key in focusScores) { if (data.concept.elementScores.hasOwnProperty(key)) { focusScores[key] += data.concept.elementScores[key]; } } } }); for (const key in focusScores) { focusScores[key] /= focusCount; } const sortedElements = Object.entries(focusScores).filter(([key, score]) => score > 0).sort(([, a], [, b]) => b - a); if (sortedElements.length === 0) { tapestryNarrativeP.textContent = 'Your focused concepts show a balanced, subtle essence.'; return; } const [topKey, topScore] = sortedElements[0]; const topElementName = elementDetails[elementKeyToFullName[topKey]]?.name || topKey; let topConceptName = ""; for (const id of focusedConcepts) { const data = discoveredConcepts.get(id); if (data?.concept?.primaryElement === topKey || (data?.concept?.elementScores[topKey] || 0) >= 7) { topConceptName = data.concept.name; break; } } if (!topConceptName && focusedConcepts.size > 0) { topConceptName = discoveredConcepts.get(focusedConcepts.values().next().value)?.concept?.name || "?"; } let narrative = `Your current tapestry resonates strongly with **${topElementName}**`; if (topConceptName) narrative += `, reflected in your focus on **${topConceptName}**. `; else narrative += ". "; if (sortedElements.length > 1) { const [secondKey, secondScore] = sortedElements[1]; if (secondScore > 3.5) { const secondElementName = elementDetails[elementKeyToFullName[secondKey]]?.name || secondKey; let secondConceptName = ""; for (const id of focusedConcepts) { const data = discoveredConcepts.get(id); if(data?.concept?.name === topConceptName) continue; if (data?.concept?.primaryElement === secondKey || (data?.concept?.elementScores[secondKey] || 0) >= 6) { secondConceptName = data.concept.name; break; } } narrative += `Undercurrents of **${secondElementName}** add complexity`; if(secondConceptName) narrative += ` through **${secondConceptName}**.`; else narrative += "."; } }
    // Check for Synergy
    let synergyFound = false; const focusedArray = Array.from(focusedConcepts);
    for (let i = 0; i < focusedArray.length; i++) {
        const conceptAData = discoveredConcepts.get(focusedArray[i]);
        if (!conceptAData || !conceptAData.concept.relatedIds) continue;
        for (let j = i + 1; j < focusedArray.length; j++) {
            const conceptBData = discoveredConcepts.get(focusedArray[j]);
            if (conceptAData.concept.relatedIds.includes(focusedArray[j])) {
                narrative += ` The synergy between **${conceptAData.concept.name}** and **${conceptBData.concept.name}** suggests [potential emergent theme, e.g., 'a dynamic exploration of control' or 'an interest in intense sensation within connection'].`; // TODO: Make this more dynamic based on combined concepts later
                synergyFound = true; break;
            }
        } if (synergyFound) break;
    }
    tapestryNarrativeP.innerHTML = narrative.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}
function displayPersonaSummary() {
    if (!checkDataLoaded() || !summaryContentDiv) return;
    summaryContentDiv.innerHTML = ''; let html = '<h3>Core Essence</h3><p>'; elementNames.forEach(elName => { const key = elementNameToKey[elName]; const score = userScores[key]; const label = getScoreLabel(score); const interpretation = elementDetails[elName]?.scoreInterpretations?.[label] || "N/A"; html += `<strong>${elementDetails[elName]?.name || elName} (${score.toFixed(1)} - ${label}):</strong> ${interpretation}<br>`; }); html += '</p><hr>'; html += '<h3>Focused Tapestry</h3>'; if (focusedConcepts.size > 0) { const narrativeText = tapestryNarrativeP.innerHTML; html += `<p><em>${narrativeText || "No narrative generated."}</em></p>`; html += '<strong>Focused Concepts:</strong><ul>'; focusedConcepts.forEach(id => { const name = discoveredConcepts.get(id)?.concept?.name || `Concept ID ${id}`; html += `<li>${name}</li>`; }); html += '</ul>'; const themeItems = personaThemesList.innerHTML; if (themeItems && !themeItems.includes("<li>Mark Focused Concepts")) { html += '<strong>Dominant Themes:</strong><ul>' + themeItems + '</ul>'; } else { html += '<strong>Dominant Themes:</strong><p>Mark concepts with high element scores as "Focus" to see themes here.</p>'; } } else { html += '<p>No concepts are currently focused.</p>'; }
    // Milestones removed from summary
    summaryContentDiv.innerHTML = html;
}

// --- Study Screen Functions ---
function displayStudyScreenContent() {
    if (!checkDataLoaded()) return;
    updateInsightDisplays();
    displayResearchButtons();
    displayDailyRituals();
    // displayElementLibrary(); // MOVED Removed call here
}
function displayResearchButtons() {
    if (!checkDataLoaded() || !researchButtonContainer) return;
    researchButtonContainer.innerHTML = ''; if (freeResearchAvailableToday && freeResearchButton) { freeResearchButton.classList.remove('hidden'); freeResearchButton.disabled = false; freeResearchButton.textContent = "Perform Daily Meditation (Free Research)"; freeResearchButton.onclick = handleFreeResearchClick; } else if (freeResearchButton) { freeResearchButton.disabled = true; freeResearchButton.textContent = freeResearchAvailableToday === false ? "Daily Meditation Performed" : "Perform Daily Meditation"; } elementNames.forEach(elName => { const key = elementNameToKey[elName]; const currentAttunement = elementAttunement[key] || 0; let currentCost = BASE_RESEARCH_COST; if (currentAttunement > 80) currentCost = Math.max(5, BASE_RESEARCH_COST - 5); else if (currentAttunement > 50) currentCost = Math.max(5, BASE_RESEARCH_COST - 3); const canAfford = userInsight >= currentCost; const fullName = elementDetails[elName]?.name || elName; const button = document.createElement('button'); button.classList.add('button', 'research-button'); button.dataset.elementKey = key; button.dataset.cost = currentCost; button.disabled = !canAfford; button.title = `Focus on ${fullName} (Cost: ${currentCost} Insight)`; button.innerHTML = ` <span class="research-el-icon" style="color: ${getElementColor(elName)};"><i class="${getElementIcon(fullName)}"></i></span> <span class="research-el-name">${fullName}</span> <span class="research-el-cost">${currentCost} <i class="fas fa-brain insight-icon"></i></span> `; button.addEventListener('click', handleResearchClick); researchButtonContainer.appendChild(button); }); if (seekGuidanceButton) seekGuidanceButton.disabled = userInsight < GUIDED_REFLECTION_COST;
}
function handleResearchClick(event) { const button = event.currentTarget; const elementKey = button.dataset.elementKey; const currentCost = parseFloat(button.dataset.cost); if (!elementKey || isNaN(currentCost) || button.disabled) return; if (spendInsight(currentCost, `Research: ${elementKeyToFullName[elementKey]}`)) { console.log(`Spent ${currentCost} Insight researching ${elementKey}.`); conductResearch(elementKey); updateMilestoneProgress('conductResearch', 1); checkAndUpdateRituals('conductResearch'); } }
function handleFreeResearchClick() { if (!freeResearchAvailableToday) { showTemporaryMessage("Daily meditation already performed today.", 3000); return; } const keys = Object.keys(elementAttunement); let targetKey = keys[0]; let minAttunement = MAX_ATTUNEMENT + 1; keys.forEach(key => { if (elementAttunement[key] < minAttunement) { minAttunement = elementAttunement[key]; targetKey = key; } }); console.log(`Performing free daily meditation on ${targetKey} (${elementKeyToFullName[targetKey]})`); freeResearchAvailableToday = false; if (freeResearchButton) { freeResearchButton.disabled = true; freeResearchButton.textContent = "Daily Meditation Performed"; } conductResearch(targetKey); updateMilestoneProgress('freeResearch', 1); checkAndUpdateRituals('freeResearch'); saveGameState(); }

function conductResearch(elementKeyToResearch) {
    if (!checkDataLoaded()) return;
    if (typeof elementKeyToFullName === 'undefined') return;
    const elementFullName = elementKeyToFullName[elementKeyToResearch];
    if (!elementFullName) return;
    console.log(`Researching: ${elementFullName} (Key: ${elementKeyToResearch})`);
    if (researchStatus) researchStatus.textContent = `Reviewing notes on ${elementDetails[elementFullName]?.name || elementFullName}...`;

    // Clear previous 'Add/Sell' buttons from old results to avoid duplicates if re-rendering same area
    researchOutput?.querySelectorAll('.research-actions').forEach(el => el.remove());

    const discoveredIds = new Set(discoveredConcepts.keys());
    const undiscoveredPool = concepts.filter(c => !discoveredIds.has(c.id));

    // --- RARE DISCOVERY CHECKS ---
    let rareItemFound = false;
    const discoveryRoll = Math.random();
    const insightDiscoveryChance = 0.015;
    const sceneDiscoveryChance = 0.008;

    // Check only if research output area is empty or contains only the placeholder
    const canFindRareItem = !researchOutput || researchOutput.children.length <= 1 || researchOutput.querySelector('p i');

    if (canFindRareItem && discoveryRoll < sceneDiscoveryChance && sceneBlueprints.length > 0) {
        const availableScenes = sceneBlueprints.filter(s => !discoveredRepositoryItems.scenes.has(s.id));
        if (availableScenes.length > 0) {
            const foundScene = availableScenes[Math.floor(Math.random() * availableScenes.length)];
            discoveredRepositoryItems.scenes.add(foundScene.id);
            saveGameState();
            if (researchOutput) researchOutput.innerHTML = `<div class="repository-item-discovery"><h4><i class="fas fa-scroll"></i> Scene Blueprint Discovered!</h4><p>You've uncovered notes detailing the '${foundScene.name}' scenario. View it in the Repository.</p></div>`;
            showTemporaryMessage("Scene Blueprint Discovered!", 4000);
            rareItemFound = true;
        }
    } else if (canFindRareItem && discoveryRoll < (sceneDiscoveryChance + insightDiscoveryChance) && elementalInsights.length > 0) {
        const relevantInsights = elementalInsights.filter(i => i.element === elementKeyToResearch);
        const unseenRelevant = relevantInsights.filter(i => !discoveredRepositoryItems.insights.has(i.id));
        const poolToUse = unseenRelevant.length > 0 ? unseenRelevant : relevantInsights;
        if (poolToUse.length > 0) {
            const foundInsight = poolToUse[Math.floor(Math.random() * poolToUse.length)];
            discoveredRepositoryItems.insights.add(foundInsight.id);
            updateMilestoneProgress('repositoryInsightsCount', discoveredRepositoryItems.insights.size);
            saveGameState();
            if (researchOutput) researchOutput.innerHTML = `<div class="repository-item-discovery"><h4><i class="fas fa-lightbulb"></i> Elemental Insight Fragment Found!</h4><p>"${foundInsight.text}"</p><p>This fragment has been added to your Repository.</p></div>`;
            showTemporaryMessage("Elemental Insight Fragment Found!", 3500);
            rareItemFound = true;
        }
    }

    // If a rare item was found, skip normal concept discovery
    if (rareItemFound) {
        if (researchStatus) researchStatus.textContent = "A unique insight unearthed!";
        gainAttunementForAction('researchSpecial', elementKeyToResearch, 1.0);
        return;
    }

    // --- NORMAL CONCEPT DISCOVERY ---
    if (undiscoveredPool.length === 0) { if (researchStatus) researchStatus.textContent = "Research complete. No more concepts to discover."; if (researchOutput && researchOutput.children.length <= 1) researchOutput.innerHTML = '<p><i>The library holds all known concepts.</i></p>'; gainInsight(5.0, "All Concepts Discovered Bonus"); return; }
    const currentAttunement = elementAttunement[elementKeyToResearch] || 0; const priorityPool = []; const secondaryPool = []; const tertiaryPool = []; undiscoveredPool.forEach(c => { const score = c.elementScores?.[elementKeyToResearch] || 0; const isPrimary = c.primaryElement === elementKeyToResearch; if (isPrimary || score >= 7.5) { priorityPool.push(c); } else if (score >= 4.5) { secondaryPool.push(c); } else { tertiaryPool.push(c); } }); const selectedForOutput = []; let duplicateInsightGain = 0; const numberOfResults = 3;
    const selectWeightedRandomFromPools = () => { /* ... (unchanged) ... */
        const pools = [ { pool: priorityPool, weightMultiplier: 3.5 }, { pool: secondaryPool, weightMultiplier: 1.5 }, { pool: tertiaryPool, weightMultiplier: 0.8 } ]; let combinedWeightedPool = []; let totalWeight = 0;
        pools.forEach(({ pool, weightMultiplier }) => { pool.forEach(card => { let weight = 1.0 * weightMultiplier; const rarityFactor = 1 + (currentAttunement / (MAX_ATTUNEMENT * 1.5)); if (card.rarity === 'uncommon') weight *= (1.2 * rarityFactor); else if (card.rarity === 'rare') weight *= (0.4 * rarityFactor); else weight *= rarityFactor; weight = Math.max(0.1, weight); totalWeight += weight; combinedWeightedPool.push({ card, weight }); }); }); if (combinedWeightedPool.length === 0) return null; let randomPick = Math.random() * totalWeight; let chosenItem = null; for (let i = 0; i < combinedWeightedPool.length; i++) { chosenItem = combinedWeightedPool[i]; if (randomPick < chosenItem.weight) { [priorityPool, secondaryPool, tertiaryPool].forEach(p => { const index = p.findIndex(c => c.id === chosenItem.card.id); if (index > -1) p.splice(index, 1); }); return chosenItem.card; } randomPick -= chosenItem.weight; } const flatPool = [...priorityPool, ...secondaryPool, ...tertiaryPool]; if (flatPool.length > 0) { const fallbackIndex = Math.floor(Math.random() * flatPool.length); const chosenCard = flatPool[fallbackIndex]; [priorityPool, secondaryPool, tertiaryPool].forEach(p => { const index = p.findIndex(c => c.id === chosenCard.id); if (index > -1) p.splice(index, 1); }); return chosenCard; } return null;
    };
    let attempts = 0; const maxAttempts = numberOfResults * 3; while (selectedForOutput.length < numberOfResults && attempts < maxAttempts && (priorityPool.length > 0 || secondaryPool.length > 0 || tertiaryPool.length > 0)) { attempts++; let potentialCard = selectWeightedRandomFromPools(); if (potentialCard) { if (discoveredConcepts.has(potentialCard.id)) { gainInsight(1.0, `Duplicate Research (${potentialCard.name})`); duplicateInsightGain += 1.0; } else { selectedForOutput.push(potentialCard); } } else { break; } }
    let resultMessage = ""; if (selectedForOutput.length > 0) { resultMessage = `Discovered ${selectedForOutput.length} new potential concept(s)! `;
        // If output only had placeholder, clear it first
        if (researchOutput && researchOutput.children.length === 1 && researchOutput.querySelector('p i')) {
             researchOutput.innerHTML = '';
        }
        selectedForOutput.forEach(concept => {
             // Avoid adding duplicates to the research output view
             if (researchOutput && !researchOutput.querySelector(`.research-result-item[data-concept-id="${concept.id}"]`)) {
                  const resultItemDiv = document.createElement('div');
                  resultItemDiv.classList.add('research-result-item');
                  resultItemDiv.dataset.conceptId = concept.id; // Add ID for selling/adding
                  const cardElement = renderCard(concept, 'research-output');
                  resultItemDiv.appendChild(cardElement);
                  // Add Action Buttons Container
                  const actionDiv = document.createElement('div');
                  actionDiv.classList.add('research-actions');
                  const addButton = document.createElement('button');
                  addButton.textContent = "Add to Grimoire";
                  addButton.classList.add('button', 'small-button', 'research-action-button', 'add-button');
                  addButton.dataset.conceptId = concept.id;
                  addButton.onclick = (e) => { const btn = e.target; const id = parseInt(btn.dataset.conceptId); if (!isNaN(id)) { addConceptToGrimoireById(id, btn); } };
                  actionDiv.appendChild(addButton);
                  // Add Sell Button
                  let sellValue = 1.0 * SELL_INSIGHT_FACTOR; // Base for common
                  if (concept.rarity === 'uncommon') sellValue = 2.0 * SELL_INSIGHT_FACTOR;
                  else if (concept.rarity === 'rare') sellValue = 4.0 * SELL_INSIGHT_FACTOR;
                  const sellButton = document.createElement('button');
                  sellButton.textContent = `Sell (${sellValue.toFixed(1)} )`; // Show value
                  sellButton.innerHTML += ` <i class="fas fa-brain insight-icon"></i>`; // Add icon
                  sellButton.classList.add('button', 'small-button', 'secondary-button', 'sell-button');
                  sellButton.dataset.conceptId = concept.id;
                  sellButton.dataset.context = 'research';
                  sellButton.title = `Sell this concept for ${sellValue.toFixed(1)} Insight.`;
                  sellButton.onclick = (e) => { const btn = e.target.closest('button'); const id = parseInt(btn.dataset.conceptId); if (!isNaN(id)) { sellConcept(id, btn); } }; // Use closest button
                  actionDiv.appendChild(sellButton);

                  resultItemDiv.appendChild(actionDiv);
                  researchOutput.appendChild(resultItemDiv);
             }
        });
        gainAttunementForAction('researchSuccess', elementKeyToResearch, 0.8); if (selectedForOutput.some(c => c.rarity === 'rare')) { updateMilestoneProgress('discoverRareCard', 1); } } else { resultMessage = "No new concepts discovered this time. "; if (researchOutput && researchOutput.children.length === 0) researchOutput.innerHTML = '<p><i>Familiar thoughts echo... Perhaps try a different focus or deepen existing knowledge?</i></p>'; gainAttunementForAction('researchFail', elementKeyToResearch, 0.2); } if (duplicateInsightGain > 0) { resultMessage += ` Gained ${duplicateInsightGain.toFixed(0)} Insight from echoes.`; if (researchOutput && selectedForOutput.length > 0) { const dupeMsg = document.createElement('p'); dupeMsg.classList.add('duplicate-message'); dupeMsg.innerHTML = `<i class="fas fa-info-circle"></i> Gained ${duplicateInsightGain.toFixed(0)} Insight from duplicate research echoes.`; researchOutput.prepend(dupeMsg); } } if (researchStatus) researchStatus.textContent = resultMessage.trim();
}


// --- Grimoire Functions ---
function displayGrimoire(filterType = "All", filterElement = "All", sortBy = "discovered", filterRarity = "All") { if (!checkDataLoaded() || !grimoireContentDiv) return; grimoireContentDiv.innerHTML = ''; if (discoveredConcepts.size === 0) { grimoireContentDiv.innerHTML = '<p>Your Grimoire is empty. Conduct Research to discover Concepts!</p>'; return; } let discoveredArray = Array.from(discoveredConcepts.values()); const conceptsToDisplay = discoveredArray.filter(data => { if (!data || !data.concept) return false; const concept = data.concept; const typeMatch = (filterType === "All") || (concept.cardType === filterType); const elementKey = filterElement !== "All" ? elementNameToKey[filterElement] : "All"; const elementMatch = (elementKey === "All") || (concept.primaryElement === elementKey); const rarityMatch = (filterRarity === "All") || (concept.rarity === filterRarity); return typeMatch && elementMatch && rarityMatch; }); const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3 }; conceptsToDisplay.sort((a, b) => { if (!a.concept || !b.concept) return 0; switch (sortBy) { case 'name': return a.concept.name.localeCompare(b.concept.name); case 'type': return a.concept.cardType.localeCompare(b.concept.cardType) || a.concept.name.localeCompare(b.concept.name); case 'rarity': return (rarityOrder[a.concept.rarity] || 0) - (rarityOrder[b.concept.rarity] || 0) || a.concept.name.localeCompare(b.concept.name); default: return a.discoveredTime - b.discoveredTime; } }); if (conceptsToDisplay.length === 0) { grimoireContentDiv.innerHTML = `<p>No discovered concepts match the current filters.</p>`; } else { conceptsToDisplay.forEach(data => { const cardElement = renderCard(data.concept, 'grimoire'); grimoireContentDiv.appendChild(cardElement); }); } }
function populateGrimoireFilters() { if (!checkDataLoaded()) return; if (grimoireTypeFilter) { grimoireTypeFilter.innerHTML = '<option value="All">All Types</option>'; cardTypeKeys.forEach(type => { const option = document.createElement('option'); option.value = type; option.textContent = type; grimoireTypeFilter.appendChild(option); }); } if (grimoireElementFilter) { grimoireElementFilter.innerHTML = '<option value="All">All Elements</option>'; elementNames.forEach(fullName => { const name = elementDetails[fullName]?.name || fullName; const option = document.createElement('option'); option.value = fullName; option.textContent = name; grimoireElementFilter.appendChild(option); }); } }
function updateGrimoireCounter() { if (grimoireCountSpan) grimoireCountSpan.textContent = discoveredConcepts.size; }

// --- Card Rendering Function ---
function renderCard(concept, context = 'grimoire') {
    if (!checkDataLoaded()) return document.createElement('div');
    if (!concept || !concept.id) { console.warn("renderCard called with invalid concept:", concept); return document.createElement('div'); }
    if (typeof elementKeyToFullName === 'undefined') { return document.createElement('div');}

    const cardDiv = document.createElement('div');
    cardDiv.classList.add('concept-card');
    cardDiv.classList.add(`rarity-${concept.rarity || 'common'}`);
    cardDiv.dataset.conceptId = concept.id;
    cardDiv.title = `View ${concept.name}`;

    const discoveredData = discoveredConcepts.get(concept.id);
    const isDiscovered = !!discoveredData;
    const isFocused = focusedConcepts.has(concept.id);
    const artUnlocked = discoveredData?.artUnlocked || false;

    const grimoireStampHTML = isDiscovered ? '<span class="grimoire-stamp" title="In Grimoire"><i class="fas fa-book-open"></i></span>' : '';
    const focusStampHTML = isFocused ? '<span class="focus-indicator" title="Focused Concept">★</span>' : '';
    const cardTypeIcon = getCardTypeIcon(concept.cardType);

    let affinitiesHTML = '';
    if (concept.elementScores && typeof elementKeyToFullName !== 'undefined') {
        Object.entries(concept.elementScores).forEach(([key, score]) => {
            const level = getAffinityLevel(score);
            if (level && elementKeyToFullName[key]) {
                const fullName = elementKeyToFullName[key];
                const color = getElementColor(fullName);
                const levelClass = level === "High" ? "affinity-high" : "";
                const iconClass = getElementIcon(fullName);
                affinitiesHTML += `<span class="affinity ${levelClass}" style="border-color: ${color}; color: ${color}; background-color: ${hexToRgba(color, 0.1)};" title="${elementDetails[fullName]?.name || fullName} Affinity: ${level} (${score.toFixed(1)})"><i class="${iconClass}"></i> ${level.substring(0,1)}</span> `;
            }
        });
    }

    const currentVisualHandle = artUnlocked ? (concept.visualHandleUnlocked || concept.visualHandle) : concept.visualHandle;
    const visualContent = artUnlocked && concept.visualHandleUnlocked ? `<img src="placeholder_art/${concept.visualHandleUnlocked}.png" alt="${concept.name} Art" class="card-art-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';"> <i class="fas fa-image card-visual-placeholder" style="display: none;" title="Art Placeholder"></i>` : `<i class="fas fa-${artUnlocked ? 'star' : 'question'} card-visual-placeholder ${artUnlocked ? 'card-art-unlocked' : ''}" title="${currentVisualHandle || 'Visual Placeholder'}"></i>`;

    // Sell button HTML (Only for Grimoire context)
    let sellButtonHTML = '';
    if (context === 'grimoire') {
        let discoveryValue = 2.0; // Common
        if (concept.rarity === 'uncommon') discoveryValue = 4.0;
        else if (concept.rarity === 'rare') discoveryValue = 8.0;
        const sellValue = discoveryValue * SELL_INSIGHT_FACTOR;
        // IMPORTANT: Use template literal for onclick to pass ID correctly
        sellButtonHTML = `<button class="button small-button secondary-button sell-button card-sell-button"
                                  data-concept-id="${concept.id}"
                                  data-context="grimoire"
                                  title="Sell this concept for ${sellValue.toFixed(1)} Insight."
                                  onclick="event.stopPropagation(); sellConcept(${concept.id}, this);">
                             Sell <i class="fas fa-brain insight-icon"></i>${sellValue.toFixed(1)}
                          </button>`;
    }

    cardDiv.innerHTML = `
        <div class="card-header">
            <i class="${cardTypeIcon} card-type-icon" title="${concept.cardType}"></i>
            <span class="card-name">${concept.name}</span>
            <span class="card-stamps">${focusStampHTML}${grimoireStampHTML}</span>
        </div>
        <div class="card-visual">
            ${visualContent}
        </div>
        <div class="card-footer">
            <div class="card-affinities">${affinitiesHTML || '<small style="color:#888; font-style: italic;">Basic Affinity</small>'}</div>
            <p class="card-brief-desc">${concept.briefDescription || '...'}</p>
            ${sellButtonHTML} {/* Inject sell button HTML */}
        </div>`;

    // Add main click listener for popup (excluding sell button clicks)
    if (context !== 'no-click') {
        cardDiv.addEventListener('click', (event) => {
            // Prevent opening popup if a button inside the card was clicked
            if (event.target.closest('button')) {
                return;
            }
            showConceptDetailPopup(concept.id);
        });
    }

    if (context === 'research-output') {
        cardDiv.title = `Click to view details for ${concept.name} (Not yet in Grimoire)`;
        // Remove potential duplicate sell button added by innerHTML if logic flaw exists
        cardDiv.querySelector('.card-footer .sell-button')?.remove();
    }
    return cardDiv;
}


// --- Sell Concept Function ---
function sellConcept(conceptId, buttonElement = null) {
    if (!checkDataLoaded()) return;
    const conceptData = discoveredConcepts.get(conceptId);
    const concept = conceptData?.concept || concepts.find(c => c.id === conceptId);
    const context = buttonElement?.dataset.context || (conceptData ? 'grimoire' : 'research');

    if (!concept) {
        console.error(`Cannot sell concept ID ${conceptId}: Not found.`);
        showTemporaryMessage("Error selling concept.", 3000);
        return;
    }

    let discoveryValue = 2.0; // Common
    if (concept.rarity === 'uncommon') discoveryValue = 4.0;
    else if (concept.rarity === 'rare') discoveryValue = 8.0;
    const sellValue = discoveryValue * SELL_INSIGHT_FACTOR;

    if (confirm(`Sell '${concept.name}' (${concept.rarity}) for ${sellValue.toFixed(1)} Insight?`)) {
        gainInsight(sellValue, `Sold Concept: ${concept.name}`);
        updateMilestoneProgress('sellConcept', 1); // Track milestone

        if (context === 'grimoire' && discoveredConcepts.has(conceptId)) {
            discoveredConcepts.delete(conceptId);
            if (focusedConcepts.has(conceptId)) {
                focusedConcepts.delete(conceptId);
                // Update Persona screen elements if the focus changed
                displayFocusedConceptsPersona();
                updateFocusElementalResonance();
                generateTapestryNarrative();
                synthesizeAndDisplayThemesPersona();
                 checkForFocusUnlocks(); // Re-check unlocks after removing focus
            }
            updateGrimoireCounter();
            // Remove card from Grimoire display immediately
            const cardElement = grimoireContentDiv?.querySelector(`.concept-card[data-concept-id="${conceptId}"]`);
            cardElement?.remove();
            if (grimoireContentDiv && discoveredConcepts.size === 0) {
                grimoireContentDiv.innerHTML = '<p>Your Grimoire is empty. Conduct Research to discover Concepts!</p>';
            }
        } else if (context === 'research') {
            // Remove card from Research Notes display
            const researchItem = researchOutput?.querySelector(`.research-result-item[data-concept-id="${conceptId}"]`);
            researchItem?.remove();
             if (researchOutput && researchOutput.children.length === 0) {
                 researchOutput.innerHTML = '<p><i>Research results cleared.</i></p>';
                 if(researchStatus) researchStatus.textContent = "Ready for new research.";
             }
        }

        showTemporaryMessage(`Sold ${concept.name} for ${sellValue.toFixed(1)} Insight.`, 2500);
        saveGameState();

        if (currentlyDisplayedConceptId === conceptId) {
            hidePopups();
        }
    }
}


// --- Concept Detail Pop-up Logic ---
function showConceptDetailPopup(conceptId) {
    if (!checkDataLoaded()) return;
    const conceptData = concepts.find(c => c.id === conceptId);
    const discoveredData = discoveredConcepts.get(conceptId); // Check if it's in the Grimoire
    const inResearchNotes = !discoveredData && researchOutput?.querySelector(`.research-result-item[data-concept-id="${conceptId}"]`);

    if (!conceptData) {
        console.error("Concept data not found for ID:", conceptId);
        return;
    }

    currentlyDisplayedConceptId = conceptId;

    // Basic Info
    if (popupConceptName) popupConceptName.textContent = conceptData.name;
    if (popupConceptType) popupConceptType.textContent = conceptData.cardType;
    if (popupCardTypeIcon) popupCardTypeIcon.className = `${getCardTypeIcon(conceptData.cardType)} card-type-icon`;
    if (popupDetailedDescription) popupDetailedDescription.textContent = conceptData.detailedDescription || "No description.";

    // Visuals
    const artUnlocked = discoveredData?.artUnlocked || false;
    const currentVisualHandle = artUnlocked ? (conceptData.visualHandleUnlocked || conceptData.visualHandle) : conceptData.visualHandle;
    if (popupVisualContainer) { popupVisualContainer.innerHTML = ''; if (artUnlocked && conceptData.visualHandleUnlocked) { const img = document.createElement('img'); img.src = `placeholder_art/${conceptData.visualHandleUnlocked}.png`; img.alt = `${conceptData.name} Art`; img.classList.add('card-art-image'); img.onerror = function() { this.style.display='none'; const icon = document.createElement('i'); icon.className = `fas fa-image card-visual-placeholder`; icon.title = "Art Placeholder (Load Failed)"; popupVisualContainer.appendChild(icon); }; popupVisualContainer.appendChild(img); } else { const icon = document.createElement('i'); icon.className = `fas fa-${artUnlocked ? 'star card-art-unlocked' : 'question'} card-visual-placeholder`; icon.title = currentVisualHandle || "Visual Placeholder"; if (artUnlocked) icon.classList.add('card-art-unlocked'); popupVisualContainer.appendChild(icon); } }

    // Analysis
    const distance = euclideanDistance(userScores, conceptData.elementScores);
    displayPopupResonance(distance);
    displayPopupRecipeComparison(conceptData);
    displayPopupRelatedConcepts(conceptData); // Updated for dropdown

    // Notes (Only if in Grimoire)
    if (myNotesSection && myNotesTextarea && saveMyNoteButton) {
        if (discoveredData) {
            myNotesTextarea.value = discoveredData.notes || "";
            myNotesSection.classList.remove('hidden');
            noteSaveStatusSpan.textContent = "";
            saveMyNoteButton.onclick = () => saveMyNote(conceptId);
        } else {
            myNotesSection.classList.add('hidden');
        }
    }

    // Evolution (Only if in Grimoire)
    displayEvolutionSection(conceptData, discoveredData);

    // Action Buttons
    updateGrimoireButtonStatus(conceptId, inResearchNotes); // Pass context
    updateFocusButtonStatus(conceptId); // Only relevant if in Grimoire
    updatePopupSellButton(conceptId, conceptData, discoveredData, inResearchNotes); // Add/Update Sell button

    // Show Popup
    if (conceptDetailPopup) conceptDetailPopup.classList.remove('hidden');
    if (popupOverlay) popupOverlay.classList.remove('hidden');
}
function displayPopupResonance(distance) { if (!popupResonanceSummary) return; let resonanceLabel = "Low"; let resonanceClass = "resonance-low"; let message = ""; if (distance === Infinity || isNaN(distance)) { resonanceLabel = "N/A"; resonanceClass = ""; message = "(Cannot compare profiles)"; } else if (distance < 2.5) { resonanceLabel = "Very High"; resonanceClass = "resonance-high"; message = "Strongly aligns with your core profile."; } else if (distance < 4.0) { resonanceLabel = "High"; resonanceClass = "resonance-high"; message = "Shares significant common ground."; } else if (distance < 6.0) { resonanceLabel = "Moderate"; resonanceClass = "resonance-medium"; message = "Some similarities and differences noted."; } else if (distance <= DISSONANCE_THRESHOLD) { resonanceLabel = "Low"; resonanceClass = "resonance-low"; message = "Notable divergence from your profile."; } else { resonanceLabel = "Dissonant"; resonanceClass = "resonance-low"; message = "Significantly diverges. Reflection suggested if added."; } popupResonanceSummary.innerHTML = `Resonance with You: <span class="resonance-indicator ${resonanceClass}">${resonanceLabel}</span> (Dist: ${distance.toFixed(1)})<br><small>${message}</small> <i class="fas fa-info-circle info-icon" title="How closely this Concept's elemental scores align with your current Core Foundation scores. High resonance suggests strong alignment, Dissonant suggests significant divergence."></i>`; }
function displayPopupRecipeComparison(conceptData) {
    if (!checkDataLoaded()) return;
    if (!popupConceptProfile || !popupUserComparisonProfile || !popupComparisonHighlights) return; if (typeof elementKeyToFullName === 'undefined') return; popupConceptProfile.innerHTML = ''; popupUserComparisonProfile.innerHTML = ''; popupComparisonHighlights.innerHTML = ''; let highlightsHTML = '<p><strong>Key Alignments & Differences:</strong></p>'; let hasHighlights = false; const conceptScores = conceptData.elementScores || {}; const userCompScores = userScores || {}; elementNames.forEach(elName => { const key = elementNameToKey[elName]; const fullName = elementKeyToFullName[key]; if (!fullName) return; const conceptScore = conceptScores[key]; const userScore = userCompScores[key]; const conceptScoreValid = typeof conceptScore === 'number' && !isNaN(conceptScore); const userScoreValid = typeof userScore === 'number' && !isNaN(userScore); const conceptDisplay = conceptScoreValid ? conceptScore.toFixed(1) : '?'; const userDisplay = userScoreValid ? userScore.toFixed(1) : '?'; const conceptLabel = conceptScoreValid ? getScoreLabel(conceptScore) : 'N/A'; const userLabel = userScoreValid ? getScoreLabel(userScore) : 'N/A'; const conceptBarWidth = conceptScoreValid ? (conceptScore / 10) * 100 : 0; const userBarWidth = userScoreValid ? (userScore / 10) * 100 : 0; const color = getElementColor(fullName); const elementNameShort = elementDetails[fullName]?.name.substring(0, 11) || elName; popupConceptProfile.innerHTML += `<div><strong>${elementNameShort}:</strong> <span>${conceptDisplay}</span> <div class="score-bar-container" title="${conceptLabel}"><div style="width: ${conceptBarWidth}%; background-color: ${color};"></div></div></div>`; popupUserComparisonProfile.innerHTML += `<div><strong>${elementNameShort}:</strong> <span>${userDisplay}</span> <div class="score-bar-container" title="${userLabel}"><div style="width: ${userBarWidth}%; background-color: ${color};"></div></div></div>`; if (conceptScoreValid && userScoreValid) { const diff = Math.abs(conceptScore - userScore); const elementNameDisplay = elementDetails[fullName]?.name || elName; if (conceptScore >= 7 && userScore >= 7) { highlightsHTML += `<p>• <strong class="match">Strong Alignment</strong> in ${elementNameDisplay} (Both ${conceptLabel} / ${userLabel})</p>`; hasHighlights = true; } else if (conceptScore <= 3 && userScore <= 3) { highlightsHTML += `<p>• <strong class="match">Shared Low Emphasis</strong> in ${elementNameDisplay} (Both ${conceptLabel} / ${userLabel})</p>`; hasHighlights = true; } else if (diff >= 4) { highlightsHTML += `<p>• <strong class="mismatch">Notable Difference</strong> in ${elementNameDisplay} (Concept is ${conceptLabel}, You are ${userLabel})</p>`; hasHighlights = true; } } }); if (!hasHighlights) highlightsHTML += '<p><em>No strong alignments or major differences identified.</em></p>'; popupComparisonHighlights.innerHTML = highlightsHTML;
}
function displayPopupRelatedConcepts(conceptData) { // Modified for Dropdown & No Click
    if (!checkDataLoaded()) return;
    if (!popupRelatedConcepts) return;
    popupRelatedConcepts.innerHTML = ''; // Clear previous

    if (conceptData.relatedIds && conceptData.relatedIds.length > 0) {
        const details = document.createElement('details');
        details.classList.add('related-concepts-details');

        const summary = document.createElement('summary');
        summary.innerHTML = `Synergies / Related (${conceptData.relatedIds.length}) <i class="fas fa-info-circle info-icon" title="Concepts that have a thematic or functional relationship with this one. Focusing on synergistic concepts together may unlock unique insights or content."></i>`;
        details.appendChild(summary);

        const listDiv = document.createElement('div');
        listDiv.classList.add('related-concepts-list-dropdown');

        let foundCount = 0;
        conceptData.relatedIds.forEach(relatedId => {
            const relatedConcept = concepts.find(c => c.id === relatedId);
            if (relatedConcept) {
                const span = document.createElement('span');
                span.textContent = relatedConcept.name;
                span.classList.add('related-concept-item'); // Add class for styling
                span.title = `Related to: ${relatedConcept.name}`; // Add title for hover info
                listDiv.appendChild(span);
                foundCount++;
            }
        });

        if (foundCount > 0) {
            details.appendChild(listDiv);
            popupRelatedConcepts.appendChild(details);
        } else {
             popupRelatedConcepts.innerHTML = `<h4>Synergies / Related <i class="fas fa-info-circle info-icon" title="Concepts that have a thematic or functional relationship with this one. Focusing on synergistic concepts together may unlock unique insights or content."></i></h4><p>None specified or found.</p>`;
        }

    } else {
        popupRelatedConcepts.innerHTML = `<h4>Synergies / Related <i class="fas fa-info-circle info-icon" title="Concepts that have a thematic or functional relationship with this one. Focusing on synergistic concepts together may unlock unique insights or content."></i></h4><p>None specified.</p>`;
    }
}
function displayEvolutionSection(conceptData, discoveredData) {
    if (!checkDataLoaded()) return;
    if (!popupEvolutionSection || !evolveArtButton || !evolveEligibility || !evolveCostSpan) return; if (typeof elementKeyToFullName === 'undefined') return; const isDiscovered = !!discoveredData; const canUnlock = conceptData.canUnlockArt; const alreadyUnlocked = discoveredData?.artUnlocked || false; const isFocused = focusedConcepts.has(conceptData.id); const requiredElement = conceptData.primaryElement; if (!requiredElement) { popupEvolutionSection.classList.add('hidden'); return; } // Added check
    const fullName = elementKeyToFullName[requiredElement]; if (!fullName) { popupEvolutionSection.classList.add('hidden'); return; } const cost = ART_EVOLVE_COST; const hasEnoughInsight = userInsight >= cost; const hasReflected = seenPrompts.size > 0; evolveCostSpan.textContent = `${cost} Insight`; if (isDiscovered && canUnlock && !alreadyUnlocked) { popupEvolutionSection.classList.remove('hidden'); let eligibilityText = ''; let canEvolve = true; if (!isFocused) { eligibilityText += '<li>Requires: Mark as Focus Concept</li>'; canEvolve = false; } else { eligibilityText += '<li><i class="fas fa-check"></i> Focused Concept</li>'; } if (!hasReflected) { eligibilityText += '<li>Requires: Engage in Reflection (any)</li>'; canEvolve = false; } else { eligibilityText += '<li><i class="fas fa-check"></i> Reflection Engaged</li>'; } if (!hasEnoughInsight) { eligibilityText += `<li>Requires: ${cost} Insight (Have ${userInsight.toFixed(1)})</li>`; canEvolve = false;} else { eligibilityText += `<li><i class="fas fa-check"></i> Sufficient Insight</li>`; } evolveEligibility.innerHTML = `<ul>${eligibilityText}</ul>`; evolveEligibility.classList.remove('hidden'); evolveArtButton.disabled = !canEvolve; evolveArtButton.onclick = canEvolve ? () => attemptArtEvolution(conceptData.id, cost) : null; } else { popupEvolutionSection.classList.add('hidden'); evolveArtButton.disabled = true; evolveEligibility.classList.add('hidden'); evolveArtButton.onclick = null; }
}
function attemptArtEvolution(conceptId, cost) {
    if (!checkDataLoaded()) return;
    const discoveredData = discoveredConcepts.get(conceptId); if (!discoveredData || !discoveredData.concept || discoveredData.artUnlocked) { showTemporaryMessage("Evolution failed: Concept state error.", 3000); return; } const concept = discoveredData.concept; if (!concept.canUnlockArt) { return; } const isFocused = focusedConcepts.has(conceptId); const hasReflected = seenPrompts.size > 0; if (isFocused && hasReflected && spendInsight(cost, `Evolve Art: ${concept.name}`)) { discoveredData.artUnlocked = true; discoveredConcepts.set(conceptId, discoveredData); console.log(`Art unlocked for ${concept.name}!`); showTemporaryMessage(`Enhanced Art Unlocked for ${concept.name}!`, 3500); if (currentlyDisplayedConceptId === conceptId) { displayEvolutionSection(concept, discoveredData); if (popupVisualContainer) { popupVisualContainer.innerHTML = ''; if (discoveredData.artUnlocked && concept.visualHandleUnlocked) { const img = document.createElement('img'); img.src = `placeholder_art/${concept.visualHandleUnlocked}.png`; img.alt = `${concept.name} Art`; img.classList.add('card-art-image'); img.onerror = function() { this.style.display='none'; const icon = document.createElement('i'); icon.className = `fas fa-image card-visual-placeholder`; icon.title = "Art Placeholder (Load Failed)"; popupVisualContainer.appendChild(icon); }; popupVisualContainer.appendChild(img); } else { const icon = document.createElement('i'); icon.className = `fas fa-star card-visual-placeholder card-art-unlocked`; icon.title = concept.visualHandleUnlocked || concept.visualHandle || "Unlocked Visual"; popupVisualContainer.appendChild(icon); } } } if (grimoireScreen.classList.contains('current')) { displayGrimoire(grimoireTypeFilter.value, grimoireElementFilter.value, grimoireSortOrder.value, grimoireRarityFilter.value); } gainAttunementForAction('artEvolve', concept.primaryElement, 1.5); updateMilestoneProgress('evolveArt', 1); checkAndUpdateRituals('evolveArt'); saveGameState(); } else if (!isFocused || !hasReflected) { showTemporaryMessage("Cannot unlock art yet. Check requirements.", 3000); }
}


// --- Grimoire/Focus Button & State Logic ---
function addConceptToGrimoireById(conceptId, buttonElement = null) { // Modified buttonElement handling
    if (!checkDataLoaded()) return;
    if (discoveredConcepts.has(conceptId)) { showTemporaryMessage("Already in Grimoire.", 2500); if(buttonElement) { buttonElement.textContent = "In Grimoire"; buttonElement.disabled = true; } return; }
    const concept = concepts.find(c => c.id === conceptId); if (!concept) { console.error("Cannot add concept: Not found in base data."); return; }
    const distance = euclideanDistance(userScores, concept.elementScores);

    if (distance > DISSONANCE_THRESHOLD) {
        console.log(`Dissonance detected for ${concept.name}. Triggering reflection.`);
        reflectionTargetConceptId = conceptId;
        displayReflectionPrompt('Dissonance', concept.id); // Still trigger reflection
    } else {
        addConceptToGrimoireInternal(conceptId);
        // Update button in Research Notes if it exists
        const researchItemDiv = researchOutput?.querySelector(`.research-result-item[data-concept-id="${conceptId}"]`);
        if (researchItemDiv) {
            const addButton = researchItemDiv.querySelector('.add-button');
            const sellButton = researchItemDiv.querySelector('.sell-button');
            if (addButton) {
                addButton.textContent = "In Grimoire";
                addButton.disabled = true;
            }
             if (sellButton) sellButton.remove(); // Remove sell button once added
        }
    }
}
function addToGrimoire() { // Called from Popup
    if (currentlyDisplayedConceptId === null) return;
    addConceptToGrimoireById(currentlyDisplayedConceptId, addToGrimoireButton);
}
function addConceptToGrimoireInternal(conceptId) { // Modified to handle Research Notes UI update
    if (!checkDataLoaded()) return;
    const concept = concepts.find(c => c.id === conceptId);
    if (!concept) { console.error("Internal add failed: Concept not found for ID:", conceptId); return; }
    if (discoveredConcepts.has(conceptId)) { return; } // Avoid duplicates
    console.log(`Adding ${concept.name} to Grimoire (Internal).`);

    let insightReward = 2.0; // Common
    if (concept.rarity === 'uncommon') insightReward = 4.0;
    else if (concept.rarity === 'rare') insightReward = 8.0;

    discoveredConcepts.set(conceptId, { concept: concept, discoveredTime: Date.now(), artUnlocked: false, notes: "" });
    gainInsight(insightReward, `Discovered ${concept.rarity} ${concept.name}`);
    gainAttunementForAction('addToGrimoire', concept.primaryElement, 0.6);
    updateGrimoireCounter();

    // Queue rare prompt
    if (concept.rarity === 'rare' && concept.uniquePromptId && reflectionPrompts.RareConcept[concept.uniquePromptId]) {
        if (!pendingRarePrompts.includes(concept.uniquePromptId)) {
            pendingRarePrompts.push(concept.uniquePromptId);
            console.log(`Queued unique reflection prompt ${concept.uniquePromptId} for ${concept.name}`);
        }
    }

    // Update Popup if open
    if (currentlyDisplayedConceptId === conceptId) {
        updateGrimoireButtonStatus(concept.id, false); // Now in grimoire, not research notes
        updateFocusButtonStatus(concept.id);
        updatePopupSellButton(concept.id, concept, discoveredConcepts.get(conceptId), false);
        if(myNotesSection) myNotesSection.classList.remove('hidden');
    }

     // Update Research Notes UI if the concept was added from there
     const researchItemDiv = researchOutput?.querySelector(`.research-result-item[data-concept-id="${conceptId}"]`);
     if (researchItemDiv) {
         const addButton = researchItemDiv.querySelector('.add-button');
         const sellButton = researchItemDiv.querySelector('.sell-button');
         if (addButton) {
             addButton.textContent = "In Grimoire";
             addButton.disabled = true;
         }
          if (sellButton) sellButton.remove(); // Remove sell button once added
     }


    checkTriggerReflectionPrompt('add');
    updateMilestoneProgress('addToGrimoire', 1);
    updateMilestoneProgress('discoveredConcepts.size', discoveredConcepts.size);
    checkAndUpdateRituals('addToGrimoire');
    if (grimoireScreen.classList.contains('current')) {
        displayGrimoire(grimoireTypeFilter.value, grimoireElementFilter.value, grimoireSortOrder.value, grimoireRarityFilter.value);
    }
    showTemporaryMessage(`${concept.name} added to Grimoire!`, 3000);
    saveGameState();
}
function toggleFocusConcept() {
    if (!checkDataLoaded()) return;
    if (currentlyDisplayedConceptId === null) return; const discoveredData = discoveredConcepts.get(currentlyDisplayedConceptId); if (!discoveredData || !discoveredData.concept) { showTemporaryMessage("Cannot focus undiscovered concept.", 3000); return; } const concept = discoveredData.concept; if (focusedConcepts.has(concept.id)) { focusedConcepts.delete(concept.id); console.log(`Removed ${concept.name} from Focus.`); showTemporaryMessage(`${concept.name} removed from Focus.`, 2500); checkAndUpdateRituals('removeFocus'); } else { if (focusedConcepts.size >= focusSlotsTotal) { showTemporaryMessage(`Focus slots full (${focusedConcepts.size}/${focusSlotsTotal}).`, 3000); return; } focusedConcepts.add(concept.id); console.log(`Marked ${concept.name} as Focus.`); showTemporaryMessage(`${concept.name} marked as Focus!`, 2500); gainInsight(1.0, `Focused on ${concept.name}`); gainAttunementForAction('markFocus', concept.primaryElement, 1.0); updateMilestoneProgress('markFocus', 1); updateMilestoneProgress('focusedConcepts.size', focusedConcepts.size); checkAndUpdateRituals('markFocus'); }
    updateFocusButtonStatus(concept.id);
    displayFocusedConceptsPersona();
    updateFocusElementalResonance();
    generateTapestryNarrative();
    synthesizeAndDisplayThemesPersona();
    checkForFocusUnlocks(); // Check for unlocks after focus change
    if (grimoireScreen.classList.contains('current')) { displayGrimoire(grimoireTypeFilter.value, grimoireElementFilter.value, grimoireSortOrder.value, grimoireRarityFilter.value); } saveGameState();
}
function updateGrimoireButtonStatus(conceptId, inResearchNotes = false) {
     if (!addToGrimoireButton) return;
     const isDiscovered = discoveredConcepts.has(conceptId);
     addToGrimoireButton.disabled = isDiscovered; // Disable if in Grimoire
     addToGrimoireButton.textContent = isDiscovered ? "In Grimoire" : "Add to Grimoire";
     addToGrimoireButton.classList.toggle('added', isDiscovered);
     // Hide if not in research notes AND already in grimoire? Or just disable? Let's just disable.
}
function updateFocusButtonStatus(conceptId) {
    if (!markAsFocusButton) return;
    const isDiscovered = discoveredConcepts.has(conceptId);
    const isFocused = focusedConcepts.has(conceptId);
    markAsFocusButton.classList.toggle('hidden', !isDiscovered); // Only show if in Grimoire
    if (isDiscovered) {
        markAsFocusButton.textContent = isFocused ? "Remove Focus" : "Mark as Focus";
        markAsFocusButton.disabled = (focusedConcepts.size >= focusSlotsTotal && !isFocused);
        markAsFocusButton.classList.toggle('marked', isFocused);
        if (markAsFocusButton.disabled && !isFocused) {
            markAsFocusButton.title = `Focus slots full (${focusSlotsTotal})`;
        } else {
            markAsFocusButton.title = isFocused ? "Remove from Focused Concepts" : "Add to Focused Concepts";
        }
    }
}
function updatePopupSellButton(conceptId, conceptData, discoveredData, inResearchNotes) {
     const popupActions = conceptDetailPopup?.querySelector('.popup-actions');
     if (!popupActions || !conceptData) return;

     // Remove existing sell button first
     popupActions.querySelector('.popup-sell-button')?.remove();

     const context = discoveredData ? 'grimoire' : (inResearchNotes ? 'research' : 'none');

     if (context !== 'none') {
          let discoveryValue = 2.0; // Common
          if (conceptData.rarity === 'uncommon') discoveryValue = 4.0;
          else if (conceptData.rarity === 'rare') discoveryValue = 8.0;
          const sellValue = discoveryValue * SELL_INSIGHT_FACTOR;

          const sellButton = document.createElement('button');
          sellButton.classList.add('button', 'small-button', 'secondary-button', 'sell-button', 'popup-sell-button');
          sellButton.textContent = `Sell (${sellValue.toFixed(1)})`;
          sellButton.innerHTML += ` <i class="fas fa-brain insight-icon"></i>`;
          sellButton.dataset.conceptId = conceptId;
          sellButton.dataset.context = context; // Mark context
          sellButton.title = `Sell this concept from ${context === 'grimoire' ? 'Grimoire' : 'Research Notes'} for ${sellValue.toFixed(1)} Insight.`;
          sellButton.onclick = (e) => { sellConcept(conceptId, e.target.closest('button')); };

          // Append after focus button if it exists, otherwise at the end
          if (markAsFocusButton && !markAsFocusButton.classList.contains('hidden')) {
               markAsFocusButton.insertAdjacentElement('afterend', sellButton);
          } else {
               popupActions.appendChild(sellButton);
          }
     }
}

// --- My Notes ---
function saveMyNote(conceptId) {
    if (!myNotesTextarea || !noteSaveStatusSpan) return; const noteText = myNotesTextarea.value.trim(); const discoveredData = discoveredConcepts.get(conceptId);
    if (discoveredData) { discoveredData.notes = noteText; discoveredConcepts.set(conceptId, discoveredData); saveGameState(); noteSaveStatusSpan.textContent = "Note Saved!"; noteSaveStatusSpan.classList.remove('error'); setTimeout(() => { noteSaveStatusSpan.textContent = ""; }, 2000); }
    else { noteSaveStatusSpan.textContent = "Error: Concept not found."; noteSaveStatusSpan.classList.add('error'); }
}

// --- Check for Focus-Driven Unlocks ---
function checkForFocusUnlocks() {
    if (!checkDataLoaded() || !focusDrivenUnlocks) return;
    console.log("Checking for focus-driven unlocks...");
    let newlyUnlocked = false;

    focusDrivenUnlocks.forEach(unlock => {
        if (unlockedFocusItems.has(unlock.id)) { return; } // Skip if already unlocked

        let requirementsMet = true;
        if (!unlock.requiredFocusIds || unlock.requiredFocusIds.length === 0) { requirementsMet = false; }
        else { for (const reqId of unlock.requiredFocusIds) { if (!focusedConcepts.has(reqId)) { requirementsMet = false; break; } } }

        if (requirementsMet) {
            console.log(`Focus requirements met for Unlock ID: ${unlock.id}`);
            unlockedFocusItems.add(unlock.id);
            newlyUnlocked = true;

            const item = unlock.unlocks;
            let unlockedItemName = item.name || `Item ${item.id}`; // Fallback name

            if (item.type === 'scene' && !discoveredRepositoryItems.scenes.has(item.id)) {
                // Add to scenes if not already there (might be discovered via research too)
                 const sceneExists = sceneBlueprints.some(s => s.id === item.id);
                 if (!sceneExists) console.warn(`Focus unlock ${unlock.id} references Scene ${item.id} not in sceneBlueprints!`);
                discoveredRepositoryItems.scenes.add(item.id);
                console.log(`Unlocked Scene Blueprint: ${unlockedItemName}`);
            } else if (item.type === 'experiment') {
                // Experiments unlocked by focus *could* be added to the base list if not present,
                // or simply flagged. We assume they exist in alchemicalExperiments.
                 const experimentExists = alchemicalExperiments.some(e => e.id === item.id);
                 if (!experimentExists) console.warn(`Focus unlock ${unlock.id} references Experiment ${item.id} not in alchemicalExperiments!`);
                 console.log(`Focus Unlock grants access eligibility to Experiment: ${unlockedItemName}. Check Attunement/requirements in Repository.`);
                 // We don't add to discoveredRepositoryItems.experiments (completion list)
            } else if (item.type === 'insightFragment' && !discoveredRepositoryItems.insights.has(item.id)) {
                discoveredRepositoryItems.insights.add(item.id);
                const insightData = elementalInsights.find(i => i.id === item.id);
                unlockedItemName = insightData ? `Insight: "${insightData.text}"` : `Insight ${item.id}`;
                 if (!insightData) {
                     console.warn(`Focus Unlock ${unlock.id} granted Insight ${item.id}, but it wasn't pre-defined. Granting ID only.`);
                 }
                console.log(`Unlocked Elemental Insight: ${item.id}`);
            }

            showTemporaryMessage(`Focus Synergy: ${unlock.description || `Unlocked ${unlockedItemName}`}`, 4500);
        }
    });

    if (newlyUnlocked) {
        console.log("Unlocked Focus Items:", Array.from(unlockedFocusItems));
        if (repositoryScreen && repositoryScreen.classList.contains('current')) { displayRepositoryContent(); }
        saveGameState();
    }
}

// --- Reflection Prompts ---
function checkTriggerReflectionPrompt(triggerAction = 'other') { if (promptCooldownActive) return; if (triggerAction === 'add') cardsAddedSinceLastPrompt++; if (triggerAction === 'completeQuestionnaire') cardsAddedSinceLastPrompt = 99; const triggerThreshold = 3; if (cardsAddedSinceLastPrompt >= triggerThreshold && pendingRarePrompts.length === 0) { displayReflectionPrompt('Standard'); cardsAddedSinceLastPrompt = 0; promptCooldownActive = true; setTimeout(() => { promptCooldownActive = false; console.log("Reflection cooldown ended."); }, 1000 * 60 * 5); } else if (pendingRarePrompts.length > 0) { displayReflectionPrompt('RareConcept'); cardsAddedSinceLastPrompt = 0; } }
function displayReflectionPrompt(context = 'Standard', targetId = null, promptCategory = null) {
    if (!checkDataLoaded()) return;
    currentReflectionContext = context;
    reflectionTargetConceptId = (context === 'Dissonance') ? targetId : null;
    let promptPool = [];
    let titleElement = "Reflection Topic";
    let selectedPrompt = null;
    const nudgeElements = [scoreNudgeCheckbox, scoreNudgeLabel];

    console.log(`[displayReflectionPrompt] Context: ${context}, TargetID: ${targetId}`);
    // console.log('[displayReflectionPrompt] Checking reflectionPrompts object:', reflectionPrompts); // Optional: Reduce logging noise

    if (context !== 'Dissonance' && pendingRarePrompts.length > 0) {
        const rarePromptId = pendingRarePrompts.shift();
        saveGameState();
        selectedPrompt = reflectionPrompts.RareConcept?.[rarePromptId]; // Use optional chaining
        if (selectedPrompt) {
            context = 'RareConcept'; titleElement = "Rare Concept Reflection";
            const conceptEntry = Array.from(discoveredConcepts.entries()).find(([id, data]) => data.concept.uniquePromptId === rarePromptId);
            currentReflectionCategory = conceptEntry ? conceptEntry[1].concept.name : "Rare Concept";
            nudgeElements.forEach(el => el?.classList.add('hidden'));
            console.log(`Displaying queued Rare Concept reflection: ${rarePromptId}`);
        } else { console.warn(`Could not find prompt text for queued rare prompt ID: ${rarePromptId}`); context = 'Standard'; }
    }

    if (!selectedPrompt) {
        if(context === 'Guided') {
            titleElement = "Guided Reflection"; currentReflectionCategory = promptCategory;
            promptPool = reflectionPrompts.Guided?.[promptCategory] || [];
            // console.log(`[displayReflectionPrompt] Guided promptPool for category ${promptCategory}:`, promptPool);
            nudgeElements.forEach(el => el?.classList.add('hidden'));
        }
        else if (context === 'Dissonance') {
            titleElement = "Dissonance Reflection";
            const concept = concepts.find(c => c.id === reflectionTargetConceptId);
            currentReflectionCategory = concept ? concept.name : "Dissonant Concept";
            // console.log('[displayReflectionPrompt] Accessing reflectionPrompts.Dissonance:', reflectionPrompts.Dissonance);
            promptPool = reflectionPrompts.Dissonance || [];
            console.log(`[displayReflectionPrompt] Dissonance promptPool length: ${promptPool.length}`);
            nudgeElements.forEach(el => el?.classList.remove('hidden'));
        }
        else { // Standard
            titleElement = "Standard Reflection";
            const validElements = elementNames.filter(elName => (elementAttunement[elementNameToKey[elName]] || 0) > 0);
            if (validElements.length > 0) {
                currentReflectionElement = validElements[Math.floor(Math.random() * validElements.length)];
                promptPool = reflectionPrompts[currentReflectionElement] || [];
                currentReflectionCategory = currentReflectionElement;
                // console.log(`[displayReflectionPrompt] Standard promptPool for element ${currentReflectionElement}:`, promptPool);
            } else { promptPool = []; console.warn("[displayReflectionPrompt] No elements with attunement > 0 found for Standard reflection."); }
            nudgeElements.forEach(el => el?.classList.add('hidden'));
        }

        if (!selectedPrompt && promptPool.length > 0) {
            const availablePrompts = promptPool.filter(p => !seenPrompts.has(p.id));
            selectedPrompt = availablePrompts.length > 0 ? availablePrompts[Math.floor(Math.random() * availablePrompts.length)] : promptPool[Math.floor(Math.random() * promptPool.length)];
            // console.log('[displayReflectionPrompt] Selected prompt:', selectedPrompt);
        } else if (!selectedPrompt) { console.warn('[displayReflectionPrompt] Prompt selection skipped (promptPool likely empty).'); }
    }

    if (!selectedPrompt) {
        console.error(`Could not select prompt for context: ${context}`);
        if (context === 'Dissonance' && reflectionTargetConceptId !== null) { console.warn("Dissonance prompt failed, attempting to add concept directly."); addConceptToGrimoireInternal(reflectionTargetConceptId); hidePopups(); showTemporaryMessage("Reflection unavailable, concept added directly.", 3500); }
        return;
    }

    currentPromptId = selectedPrompt.id;
    if(reflectionModalTitle) reflectionModalTitle.textContent = titleElement;
    if (reflectionElement) reflectionElement.textContent = (context === 'Dissonance' || context === 'Guided' || context === 'RareConcept' || context === 'SceneMeditation') ? currentReflectionCategory || titleElement : currentReflectionElement;
    if (reflectionPromptText) reflectionPromptText.textContent = selectedPrompt.text;
    if (reflectionCheckbox) reflectionCheckbox.checked = false;
    if (scoreNudgeCheckbox && scoreNudgeLabel) { scoreNudgeCheckbox.checked = false; scoreNudgeCheckbox.classList.toggle('hidden', context !== 'Dissonance'); scoreNudgeLabel.classList.toggle('hidden', context !== 'Dissonance'); }
    if (confirmReflectionButton) confirmReflectionButton.disabled = true;
    const rewardAmount = (currentReflectionContext === 'Guided') ? GUIDED_REFLECTION_COST + 2 : (currentReflectionContext === 'RareConcept') ? 7.0 : (currentReflectionContext === 'SceneMeditation') ? (sceneBlueprints.find(s => s.reflectionPromptId === currentPromptId)?.meditationCost || 0) + 5 : 5.0;

    if (reflectionRewardAmount) reflectionRewardAmount.textContent = `${rewardAmount.toFixed(1)} Insight`; // Ensure fixed decimal
    if (reflectionModal) reflectionModal.classList.remove('hidden');
    if (popupOverlay) popupOverlay.classList.remove('hidden');
}
function handleConfirmReflection() {
    if (!checkDataLoaded()) return;
    if (!currentPromptId || !reflectionCheckbox || !reflectionCheckbox.checked) return;
    console.log(`Reflection confirmed: ${currentReflectionContext}, prompt: ${currentPromptId}`);
    seenPrompts.add(currentPromptId);
    const rewardAmount = (currentReflectionContext === 'Guided') ? GUIDED_REFLECTION_COST + 2 : (currentReflectionContext === 'RareConcept') ? 7.0 : (currentReflectionContext === 'SceneMeditation') ? (sceneBlueprints.find(s => s.reflectionPromptId === currentPromptId)?.meditationCost || 0) + 5 : 5.0;


    let attunementKey = null;
    let attunementAmount = 1.0;
    let milestoneAction = 'completeReflection';
    let scoreNudged = false;

    if (currentReflectionContext === 'Dissonance' && scoreNudgeCheckbox && scoreNudgeCheckbox.checked) { console.log("Score nudge requested."); const concept = concepts.find(c => c.id === reflectionTargetConceptId); if (concept?.elementScores) { for (const key in userScores) { if (userScores.hasOwnProperty(key) && concept.elementScores.hasOwnProperty(key)) { const userScore = userScores[key]; const conceptScore = concept.elementScores[key]; const diff = conceptScore - userScore; if (Math.abs(diff) > 2.0) { const nudge = Math.sign(diff) * SCORE_NUDGE_AMOUNT; userScores[key] = Math.max(0, Math.min(10, userScore + nudge)); scoreNudged = true; } } } if (scoreNudged) { console.log("Updated User Scores:", userScores); displayPersonaScreen(); showTemporaryMessage("Core understanding shifted slightly.", 3500); gainAttunementForAction('scoreNudge', 'All', 0.5); updateMilestoneProgress('scoreNudgeApplied', 1); } } }
    if (currentReflectionContext === 'Dissonance' && reflectionTargetConceptId !== null) { addConceptToGrimoireInternal(reflectionTargetConceptId); milestoneAction = 'completeReflectionDissonance'; attunementAmount = 0.5; }

    gainInsight(rewardAmount, `Reflection (${currentReflectionContext})`);

    if (currentReflectionContext === 'Standard' && currentReflectionElement) { attunementKey = elementNameToKey[currentReflectionElement]; }
    else if (['Guided', 'RareConcept', 'SceneMeditation'].includes(currentReflectionContext)) {
        const scene = sceneBlueprints.find(s => s.reflectionPromptId === currentPromptId);
        const rareConcept = Array.from(discoveredConcepts.values()).find(d => d.concept.uniquePromptId === currentPromptId)?.concept;
        if (currentReflectionContext === 'SceneMeditation' && scene) {
             attunementKey = scene.element || null; // Use scene's element if defined
        } else if (currentReflectionContext === 'RareConcept' && rareConcept) {
             attunementKey = rareConcept.primaryElement || null; // Use rare concept's element
        } else if (currentReflectionCategory) { // Fallback for Guided or if element not found above
             attunementKey = elementNameToKey[currentReflectionCategory] || null;
        }
    } else { attunementKey = null; }

    if (attunementKey) { gainAttunementForAction('completeReflection', attunementKey, attunementAmount); }
    else { gainAttunementForAction('completeReflectionGeneric', 'All', 0.2); }

    updateMilestoneProgress(milestoneAction, 1);
    checkAndUpdateRituals('completeReflection');
    hidePopups();
    showTemporaryMessage("Reflection complete! Insight gained.", 3000);
    currentReflectionContext = null; reflectionTargetConceptId = null; currentReflectionCategory = null; // Reset context state
    saveGameState();
}
function triggerGuidedReflection() {
    if (!checkDataLoaded()) return;
    if (spendInsight(GUIDED_REFLECTION_COST, "Guided Reflection")) { const availableCategories = Object.keys(reflectionPrompts.Guided || {}); if (availableCategories.length > 0) { const category = availableCategories[Math.floor(Math.random() * availableCategories.length)]; console.log(`Triggering guided reflection for category: ${category}`); displayReflectionPrompt('Guided', null, category); } else { console.warn("No guided reflection categories defined."); gainInsight(GUIDED_REFLECTION_COST, "Refund: No guided reflections"); } }
}

// --- Rituals & Milestones ---
function displayDailyRituals() {
    if (!checkDataLoaded() || !dailyRitualsDisplay) return;
    dailyRitualsDisplay.innerHTML = ''; let activeRituals = [...dailyRituals];

    if (typeof focusRituals !== 'undefined') {
        focusRituals.forEach(ritual => {
            const requiredIds = new Set(ritual.requiredFocusIds); let allFocused = true; if (requiredIds.size === 0) allFocused = false;
            for (const id of requiredIds) { if (!focusedConcepts.has(id)) { allFocused = false; break; } }
            if (allFocused) { activeRituals.push({ ...ritual, isFocusRitual: true }); }
        });
    }

    if (activeRituals.length === 0) { dailyRitualsDisplay.innerHTML = '<li>No daily rituals available.</li>'; return; }

    activeRituals.forEach(ritual => {
        const completedData = completedRituals.daily[ritual.id] || {completed: false, progress: 0};
        const isCompleted = completedData.completed;
        const li = document.createElement('li'); li.classList.toggle('completed', isCompleted);
        let rewardText = '';
        if (ritual.reward) { if (ritual.reward.type === 'insight') rewardText = `(+${ritual.reward.amount} <i class="fas fa-brain insight-icon"></i>)`; else if (ritual.reward.type === 'attunement') rewardText = `(+${ritual.reward.amount} Attun.)`; else if (ritual.reward.type === 'token') rewardText = `(+1 ${ritual.reward.tokenType || 'Token'})`; }
        li.innerHTML = `${ritual.description} <span class="ritual-reward">${rewardText}</span>`;
        if(ritual.isFocusRitual) li.classList.add('focus-ritual');
        dailyRitualsDisplay.appendChild(li);
    });
}
function checkAndUpdateRituals(action, details = {}) {
    if (!checkDataLoaded()) return;
    let ritualUpdated = false;
    let currentRitualPool = [...dailyRituals];

    if (typeof focusRituals !== 'undefined') {
        focusRituals.forEach(ritual => {
             const requiredIds = new Set(ritual.requiredFocusIds); let allFocused = true; if (requiredIds.size === 0) allFocused = false;
             for (const id of requiredIds) { if (!focusedConcepts.has(id)) { allFocused = false; break; } }
             if (allFocused) { currentRitualPool.push(ritual); }
        });
    }

    currentRitualPool.forEach(ritual => {
        let completedData = completedRituals.daily[ritual.id] || {completed: false, progress: 0};
        const actionMatch = ritual.track.action === action;
        const contextMatch = ritual.track.contextMatch && currentReflectionContext === ritual.track.contextMatch;

        if (!completedData.completed && (actionMatch || contextMatch)) {
            completedData.progress++;
            if (completedData.progress >= ritual.track.count) { console.log(`Ritual Completed: ${ritual.description}`); completedData.completed = true; ritualUpdated = true; if (ritual.reward) { if (ritual.reward.type === 'insight') { gainInsight(ritual.reward.amount || 0, `Ritual: ${ritual.description}`); } else if (ritual.reward.type === 'attunement') { gainAttunementForAction('ritual', ritual.reward.element || 'All', ritual.reward.amount || 0); } else if (ritual.reward.type === 'token') { console.log(`TODO: Grant ${ritual.reward.tokenType || 'Research'} token`); } } }
            completedRituals.daily[ritual.id] = completedData;
        }
    });
    if (ritualUpdated) { if(dailyRitualsDisplay) displayDailyRituals(); saveGameState(); } // Update display only if needed
}
function displayMilestones() {
    if (!checkDataLoaded() || !milestonesDisplay) return;
    milestonesDisplay.innerHTML = ''; if (achievedMilestones.size === 0) { milestonesDisplay.innerHTML = '<li>No milestones achieved yet.</li>'; return; } const sortedMilestoneIds = Array.from(achievedMilestones).sort((a, b) => { const ma = milestones.find(m => m.id === a); const mb = milestones.find(m => m.id === b); return (ma?.id || '').localeCompare(mb?.id || ''); }); sortedMilestoneIds.forEach(milestoneId => { const milestone = milestones.find(m => m.id === milestoneId); if (milestone) { const li = document.createElement('li'); li.textContent = `✓ ${milestone.description}`; milestonesDisplay.appendChild(li); } });
}
function updateMilestoneProgress(trackType, currentValue) {
    if (!checkDataLoaded()) return;
    let milestoneAchievedThisUpdate = false;
    milestones.forEach(m => {
        if (!achievedMilestones.has(m.id)) {
            let achieved = false;
            if (m.track.action === trackType) {
                if (typeof currentValue === 'number' && currentValue >= (m.track.count || 1)) { achieved = true; }
                else if ((m.track.count === 1 || typeof m.track.count === 'undefined') && currentValue) { achieved = true; }
            } else if (m.track.state === trackType) {
                const threshold = m.track.threshold;
                let targetObject = null;
                let targetValue = currentValue; // Assume currentValue is the relevant value unless overridden

                // Identify the state object or derive the target value
                if (trackType === 'elementAttunement') targetObject = elementAttunement;
                else if (trackType === 'unlockedDeepDiveLevels') targetObject = unlockedDeepDiveLevels;
                else if (trackType === 'discoveredConcepts.size') targetValue = discoveredConcepts.size;
                else if (trackType === 'focusedConcepts.size') targetValue = focusedConcepts.size;
                else if (trackType === 'repositoryInsightsCount') targetValue = discoveredRepositoryItems.insights.size;
                else if (trackType === 'repositoryContents') {
                     if (m.track.condition === "allTypesPresent") { // Specific custom check
                          const hasScene = discoveredRepositoryItems.scenes.size > 0;
                          const hasExperiment = discoveredRepositoryItems.experiments.size > 0; // Checks COMPLETED experiments
                          const hasInsight = discoveredRepositoryItems.insights.size > 0;
                          if (hasScene && hasExperiment && hasInsight) {
                               achieved = true;
                          }
                     }
                } else if (trackType === 'focusSlotsTotal') {
                    targetValue = focusSlotsTotal; // Use the global variable directly
                }


                // Evaluate conditions if not already achieved by custom check
                if (!achieved) {
                    if (m.track.condition === "any" && targetObject) {
                        if (typeof currentValue === 'object' && currentValue !== null) { // Check passed object update
                            for (const key in currentValue) { if (targetObject.hasOwnProperty(key) && currentValue[key] >= threshold) { achieved = true; break; } }
                        } else { // Check the whole state object
                             for (const key in targetObject) { if (targetObject[key] >= threshold) { achieved = true; break; } }
                        }
                    } else if (m.track.condition === "all" && targetObject) {
                         let allMet = true;
                         for (const key in targetObject) {
                             // Check against passed update first if it exists for the key, otherwise check the full object
                              const valueToCheck = (typeof currentValue === 'object' && currentValue !== null && currentValue.hasOwnProperty(key)) ? currentValue[key] : targetObject[key];
                              if (!(valueToCheck >= threshold)) {
                                  allMet = false; break;
                              }
                          }
                          if (allMet) achieved = true;
                    } else { // Simple threshold check on targetValue
                        if (typeof targetValue === 'number' && targetValue >= threshold) { achieved = true; }
                    }
                }
            }

            // Grant reward if achieved
            if (achieved) {
                console.log("Milestone Achieved!", m.description);
                achievedMilestones.add(m.id);
                milestoneAchievedThisUpdate = true;
                if (milestonesDisplay && repositoryScreen.classList.contains('current')) displayMilestones(); // Update immediately if visible
                showMilestoneAlert(m.description);
                if (m.reward) {
                    if (m.reward.type === 'insight') { gainInsight(m.reward.amount || 0, `Milestone: ${m.description}`); }
                    else if (m.reward.type === 'attunement') { gainAttunementForAction('milestone', m.reward.element || 'All', m.reward.amount || 0); }
                    else if (m.reward.type === 'increaseFocusSlots') { const increaseAmount = m.reward.amount || 1; if (focusSlotsTotal < MAX_FOCUS_SLOTS) { focusSlotsTotal = Math.min(MAX_FOCUS_SLOTS, focusSlotsTotal + increaseAmount); console.log(`Focus Slots increased by ${increaseAmount}. New: ${focusSlotsTotal}`); updateFocusSlotsDisplay(); updateMilestoneProgress('focusSlotsTotal', focusSlotsTotal); /* Trigger check for milestones based on slots */ } }
                    else if (m.reward.type === 'discoverCard') { const cardIdToDiscover = m.reward.cardId; if (cardIdToDiscover && !discoveredConcepts.has(cardIdToDiscover)) { const conceptToDiscover = concepts.find(c => c.id === cardIdToDiscover); if (conceptToDiscover) { addConceptToGrimoireInternal(cardIdToDiscover); showTemporaryMessage(`Milestone Reward: Discovered ${conceptToDiscover.name}!`, 3500); } } }
                }
            }
        }
    });
    // Trigger focus slot check *after* processing all milestones for this update
    // if (['focusedConcepts.size', 'increaseFocusSlots', 'unlockedDeepDiveLevels'].includes(trackType)) {
    //     updateMilestoneProgress('focusSlotsTotal', focusSlotsTotal); // Moved inside reward logic
    // }
    if (milestoneAchievedThisUpdate) { saveGameState(); }
}
function showMilestoneAlert(text) { if (!milestoneAlert || !milestoneAlertText) return; milestoneAlertText.textContent = `Milestone: ${text}`; milestoneAlert.classList.remove('hidden'); setTimeout(hideMilestoneAlert, 5000); }
function hideMilestoneAlert() { if (milestoneAlert) milestoneAlert.classList.add('hidden'); }

// --- Element Deep Dive Library (MOVED to Persona Screen) ---
function displayElementLibrary() { // Now called from displayPersonaScreen
    if (!checkDataLoaded() || !elementLibraryButtonsDiv || !elementLibraryContentDiv) {
         console.warn("Element Library elements not found, skipping display.");
         return;
     }
    elementLibraryButtonsDiv.innerHTML = ''; elementNames.forEach(elName => { const key = elementNameToKey[elName]; const button = document.createElement('button'); button.classList.add('button', 'small-button'); button.textContent = elementDetails[elName]?.name || elName; button.style.borderColor = getElementColor(elName); button.onclick = () => displayElementDeepDive(key); elementLibraryButtonsDiv.appendChild(button); }); if (!elementLibraryContentDiv.querySelector('.library-level') && !elementLibraryContentDiv.querySelector('.library-unlock')) { elementLibraryContentDiv.innerHTML = '<p>Select an Element above to view its deep dive content.</p>'; } }
function displayElementDeepDive(elementKey) {
    if (!checkDataLoaded() || !elementLibraryContentDiv) return;
    const deepDiveData = elementDeepDive[elementKey] || []; const currentLevel = unlockedDeepDiveLevels[elementKey] || 0; const elementName = elementKeyToFullName[elementKey] || elementKey; elementLibraryContentDiv.innerHTML = `<h4>${elementDetails[elementName]?.name || elementName} - Insights</h4>`; if (deepDiveData.length === 0) { elementLibraryContentDiv.innerHTML += '<p>No deep dive content available.</p>'; return; } let displayedContent = false; deepDiveData.forEach(levelData => { if (levelData.level <= currentLevel) { elementLibraryContentDiv.innerHTML += `<div class="library-level"><h5 class="level-title">${levelData.title} (Level ${levelData.level})</h5><div class="level-content">${levelData.content}</div></div><hr class="popup-hr">`; displayedContent = true; } }); if (!displayedContent) { elementLibraryContentDiv.innerHTML += '<p>Unlock the first level to begin exploring.</p>'; } const nextLevel = currentLevel + 1; const nextLevelData = deepDiveData.find(l => l.level === nextLevel); if (nextLevelData) { const cost = nextLevelData.insightCost || 0; const canAfford = userInsight >= cost; const requirementsMet = true; elementLibraryContentDiv.innerHTML += `<div class="library-unlock"><h5>Next: ${nextLevelData.title} (Level ${nextLevelData.level})</h5><button class="button small-button unlock-button" onclick="unlockDeepDiveLevel('${elementKey}', ${nextLevelData.level})" ${!canAfford || !requirementsMet ? 'disabled' : ''} title="${!canAfford ? `Requires ${cost} Insight` : !requirementsMet ? 'Requirements not met' : `Unlock for ${cost} Insight`}"> Unlock (Cost: ${cost} <i class="fas fa-brain insight-icon"></i>)</button>${!canAfford ? `<p class='unlock-error'>Insufficient Insight (${userInsight.toFixed(1)}/${cost})</p>` : ''}${!requirementsMet && canAfford ? `<p class='unlock-error'>Other requirements not met.</p>` : ''}</div>`; } else if (displayedContent) { elementLibraryContentDiv.innerHTML += '<p><i>You have unlocked all available insights for this element.</i></p>'; }
}
function unlockDeepDiveLevel(elementKey, levelToUnlock) {
    if (!checkDataLoaded()) return;
    const deepDiveData = elementDeepDive[elementKey] || []; const levelData = deepDiveData.find(l => l.level === levelToUnlock); const currentLevel = unlockedDeepDiveLevels[elementKey] || 0; if (!levelData || levelToUnlock !== currentLevel + 1) { return; } const cost = levelData.insightCost || 0; if (spendInsight(cost, `Unlock Library: ${elementKeyToFullName[elementKey]} Lv ${levelToUnlock}`)) { unlockedDeepDiveLevels[elementKey] = levelToUnlock; console.log(`Unlocked ${elementKeyToFullName[elementKey]} deep dive level ${levelToUnlock}`); displayElementDeepDive(elementKey); saveGameState(); showTemporaryMessage(`${elementKeyToFullName[elementKey]} Insight Level ${levelToUnlock} Unlocked!`, 3000); updateMilestoneProgress('unlockLibrary', levelToUnlock); updateMilestoneProgress('unlockedDeepDiveLevels', unlockedDeepDiveLevels); checkAndUpdateRituals('unlockLibrary'); }
}

// --- Repository Functions ---
function displayRepositoryContent() {
    if (!checkDataLoaded()) return;
    const focusUnlocksContainer = repositoryFocusUnlocksDiv;
    const scenesContainer = repositoryScenesDiv;
    const experimentsContainer = repositoryExperimentsDiv;
    const insightsContainer = repositoryInsightsDiv;

    if (!repositoryScreen) return;
    if (!focusUnlocksContainer || !scenesContainer || !experimentsContainer || !insightsContainer) { console.error("One or more repository list containers not found!"); return; }

    focusUnlocksContainer.innerHTML = ''; scenesContainer.innerHTML = ''; experimentsContainer.innerHTML = ''; insightsContainer.innerHTML = '';

    // Display Focus-Driven Unlocks
    if (unlockedFocusItems.size > 0) {
        unlockedFocusItems.forEach(unlockId => {
             const unlockData = focusDrivenUnlocks.find(u => u.id === unlockId);
             if (unlockData && unlockData.unlocks) {
                  const item = unlockData.unlocks;
                  const div = document.createElement('div');
                  div.classList.add('repository-item', 'focus-unlock-item');
                  let itemHTML = `<h4>${item.name || `Unlock: ${unlockData.id}`} (${item.type})</h4>`;
                  if(unlockData.description) itemHTML += `<p><em>Reason: ${unlockData.description}</em></p>`; // Add reason if defined
                  if (item.type === 'insightFragment') { itemHTML += `<p><em>"${item.text}"</em></p>`; }
                  else { itemHTML += `<p>Details may be found in the relevant section below.</p>`; }
                  div.innerHTML = itemHTML;
                  focusUnlocksContainer.appendChild(div);
             }
        });
    } else { focusUnlocksContainer.innerHTML = '<p>Focus on synergistic combinations of Concepts to unlock special items here.</p>'; }

    // Display Scene Blueprints
    if (discoveredRepositoryItems.scenes.size > 0) { discoveredRepositoryItems.scenes.forEach(sceneId => { const scene = sceneBlueprints.find(s => s.id === sceneId); if (scene) scenesContainer.appendChild(renderRepositoryItem(scene, 'scene')); }); }
    else { scenesContainer.innerHTML = '<p>No Scene Blueprints discovered yet.</p>'; }

    // Display Alchemical Experiments
    let experimentsDisplayed = 0;
    alchemicalExperiments.forEach(exp => {
        const isUnlocked = elementAttunement[exp.requiredElement] >= exp.requiredAttunement;
        const alreadyCompleted = discoveredRepositoryItems.experiments.has(exp.id);
        if (isUnlocked) { experimentsContainer.appendChild(renderRepositoryItem(exp, 'experiment', alreadyCompleted)); experimentsDisplayed++; }
    });
     if (experimentsDisplayed === 0) { experimentsContainer.innerHTML = '<p>Increase Element Attunement to unlock Experiments.</p>'; }

    // Display Elemental Insights
    if (discoveredRepositoryItems.insights.size > 0) {
        const insightsByElement = {}; elementNames.forEach(elName => insightsByElement[elementNameToKey[elName]] = []);
        discoveredRepositoryItems.insights.forEach(insightId => { const insight = elementalInsights.find(i => i.id === insightId); if (insight && insightsByElement[insight.element]) { insightsByElement[insight.element].push(insight); } });
        let insightsHTML = '';
        for (const key in insightsByElement) { if (insightsByElement[key].length > 0) { insightsHTML += `<h5>${elementDetails[elementKeyToFullName[key]]?.name || key} Insights:</h5><ul>`; insightsByElement[key].sort((a, b) => a.id.localeCompare(b.id)).forEach(insight => { insightsHTML += `<li>"${insight.text}"</li>`; }); insightsHTML += `</ul>`; } }
        insightsContainer.innerHTML = insightsHTML || '<p>No Elemental Insights collected yet.</p>';
    } else { insightsContainer.innerHTML = '<p>No Elemental Insights collected yet.</p>'; }

    // Display Milestones (MOVED HERE)
    displayMilestones();
    updateMilestoneProgress('repositoryContents', null); // Trigger custom check
}
function renderRepositoryItem(item, type, completed = false) {
    const div = document.createElement('div');
    div.classList.add('repository-item', `repo-item-${type}`);
    if (completed) div.classList.add('completed');

    let actionsHTML = '';
    if (type === 'scene') {
        actionsHTML = `<button class="button small-button" onclick="meditateOnScene('${item.id}')" ${userInsight < item.meditationCost ? 'disabled' : ''}>Meditate (${item.meditationCost} <i class="fas fa-brain insight-icon"></i>)</button>`;
    } else if (type === 'experiment') {
        let canAttempt = true; let unmetReqs = [];
        if (item.requiredFocusConceptIds && item.requiredFocusConceptIds.length > 0) { item.requiredFocusConceptIds.forEach(reqId => { if (!focusedConcepts.has(reqId)) { canAttempt = false; const concept = concepts.find(c=>c.id === reqId); unmetReqs.push(concept ? concept.name : `ID ${reqId}`); } }); }
        if (item.requiredFocusConceptTypes && item.requiredFocusConceptTypes.length > 0) { item.requiredFocusConceptTypes.forEach(typeReq => { let typeMet = false; for (const focusId of focusedConcepts) { const concept = discoveredConcepts.get(focusId)?.concept; if (concept && concept.cardType === typeReq) { typeMet = true; break; } } if (!typeMet) { canAttempt = false; unmetReqs.push(`Type: ${typeReq}`); } }); }
        actionsHTML = `<button class="button small-button" onclick="attemptExperiment('${item.id}')" ${userInsight < item.insightCost || !canAttempt || completed ? 'disabled' : ''}>Attempt (${item.insightCost} <i class="fas fa-brain insight-icon"></i>)</button>`;
        if (completed) actionsHTML += ` <span class="completed-text">(Completed)</span>`;
        else if (!canAttempt) actionsHTML += ` <small class="req-missing">(Requires Focus: ${unmetReqs.join(', ')})</small>`;
        else if (userInsight < item.insightCost) actionsHTML += ` <small class="req-missing">(Insufficient Insight)</small>`;
    }

    div.innerHTML = `<h4>${item.name} ${type === 'experiment' ? `(Requires ${item.requiredAttunement} ${elementKeyToFullName[item.requiredElement]} Attun.)` : ''}</h4><p>${item.description}</p><div class="repo-actions">${actionsHTML}</div>`;
    return div;
}
function meditateOnScene(sceneId) {
    if (!checkDataLoaded()) return;
    const scene = sceneBlueprints.find(s => s.id === sceneId); if (!scene) return;
    if (spendInsight(scene.meditationCost, `Meditate on Scene: ${scene.name}`)) {
        const prompt = reflectionPrompts.SceneMeditation[scene.reflectionPromptId];
        if (prompt) {
            console.log(`Triggering Scene Meditation for ${scene.name} (Prompt ID: ${prompt.id})`);
            currentReflectionContext = 'SceneMeditation'; currentReflectionCategory = scene.name; currentPromptId = prompt.id;
            if (reflectionModalTitle) reflectionModalTitle.textContent = "Scene Meditation";
            if (reflectionElement) reflectionElement.textContent = scene.name;
            if (reflectionPromptText) reflectionPromptText.textContent = prompt.text;
            if (reflectionCheckbox) reflectionCheckbox.checked = false;
            if (scoreNudgeCheckbox && scoreNudgeLabel) { scoreNudgeCheckbox.classList.add('hidden'); scoreNudgeLabel.classList.add('hidden'); }
            if (confirmReflectionButton) confirmReflectionButton.disabled = true;
            const rewardAmount = scene.meditationCost + 5;
            if (reflectionRewardAmount) reflectionRewardAmount.textContent = `${rewardAmount.toFixed(1)} Insight`;
            if (reflectionModal) reflectionModal.classList.remove('hidden');
            if (popupOverlay) popupOverlay.classList.remove('hidden');
            updateMilestoneProgress('meditateScene', 1);
        } else { console.error(`Reflection prompt ${scene.reflectionPromptId} not found for scene ${sceneId}`); gainInsight(scene.meditationCost, `Refund: Missing prompt for scene ${sceneId}`); }
    }
}
function attemptExperiment(experimentId) {
    if (!checkDataLoaded()) return;
    const experiment = alchemicalExperiments.find(e => e.id === experimentId); if (!experiment || discoveredRepositoryItems.experiments.has(experimentId)) return;
    if (elementAttunement[experiment.requiredElement] < experiment.requiredAttunement) { showTemporaryMessage("Attunement too low.", 3000); return; }
    let canAttempt = true;
    if (experiment.requiredFocusConceptIds) { experiment.requiredFocusConceptIds.forEach(reqId => { if (!focusedConcepts.has(reqId)) canAttempt = false; }); }
    if (experiment.requiredFocusConceptTypes && canAttempt) { experiment.requiredFocusConceptTypes.forEach(typeReq => { let typeMet = false; for (const focusId of focusedConcepts) { const concept = discoveredConcepts.get(focusId)?.concept; if (concept && concept.cardType === typeReq) { typeMet = true; break; } } if (!typeMet) canAttempt = false; }); }
    if (!canAttempt) { showTemporaryMessage("Required concepts not focused.", 3000); return; }

    if (spendInsight(experiment.insightCost, `Attempt Experiment: ${experiment.name}`)) {
        console.log(`Attempting experiment: ${experiment.name}`);
        updateMilestoneProgress('attemptExperiment', 1);
        const successRoll = Math.random();
        if (successRoll < (experiment.successRate || 0.5)) {
            console.log("Experiment Successful!"); showTemporaryMessage(`Success! Experiment '${experiment.name}' yielded results.`, 4000);
            discoveredRepositoryItems.experiments.add(experiment.id);
            if (experiment.successReward) {
                if (experiment.successReward.type === 'insight') gainInsight(experiment.successReward.amount, `Experiment Success: ${experiment.name}`);
                if (experiment.successReward.type === 'attunement') gainAttunementForAction('experimentSuccess', experiment.successReward.element || 'All', experiment.successReward.amount);
                if (experiment.successReward.type === 'insightFragment') { // Handle new reward type
                     if (!discoveredRepositoryItems.insights.has(experiment.successReward.id)) {
                          discoveredRepositoryItems.insights.add(experiment.successReward.id);
                          console.log(`Experiment reward: Unlocked Insight ${experiment.successReward.id}`);
                          // Optionally ensure the insight exists in base data
                          if (!elementalInsights.some(ei => ei.id === experiment.successReward.id)) {
                               console.warn(`Experiment ${experiment.id} rewarded Insight ${experiment.successReward.id}, but it's not defined.`);
                               // Add dynamically ONLY if necessary and safe
                               // elementalInsights.push({ id: experiment.successReward.id, element: experiment.successReward.element || experiment.requiredElement, text: experiment.successReward.text || "Insight from Experiment" });
                          }
                     }
                }
            }
        } else {
            console.log("Experiment Failed."); showTemporaryMessage(`Experiment '${experiment.name}' failed... ${experiment.failureConsequence || "No lasting effects."}`, 4000);
             if (experiment.failureConsequence?.includes("Insight loss")) { // Example consequence parsing
                  const lossAmount = parseFloat(experiment.failureConsequence.match(/(\d+(\.\d+)?)/)?.[0] || 1);
                  gainInsight(-lossAmount, `Experiment Failure: ${experiment.name}`);
             }
        }
        displayRepositoryContent(); saveGameState();
    }
}

// --- Toast Message Function ---
function showTemporaryMessage(message, duration = 3000) { if (!toastElement || !toastMessageElement) { console.warn("Toast elements not found, logging message to console:", message); return; } console.info(`Toast: ${message}`); toastMessageElement.textContent = message; if (toastTimeout) { clearTimeout(toastTimeout); } toastElement.classList.remove('hidden'); toastElement.classList.add('visible'); toastTimeout = setTimeout(() => { toastElement.classList.remove('visible'); toastElement.classList.add('hidden'); toastTimeout = null; }, duration); }

// --- Reset App ---
function resetApp() { if (confirm("Reset ALL progress, including scores, Grimoire, and unlocked content? This cannot be undone.")) { console.log("Resetting application..."); clearGameState(); initializeQuestionnaire(true); } }

// --- Daily Login Check ---
function checkForDailyLogin() { const today = new Date().toDateString(); let updatedState = false; if (lastLoginDate !== today) { console.log("First login of the day detected."); completedRituals.daily = {}; lastLoginDate = today; freeResearchAvailableToday = true; updatedState = true; console.log("Daily rituals reset. Free daily research granted."); gainInsight(5.0, "Daily Login Bonus"); showTemporaryMessage("Daily Rituals Reset. Free Research Available!", 3500); displayDailyRituals(); } else { console.log("Already logged in today."); if (!freeResearchAvailableToday && freeResearchButton) { freeResearchButton.disabled = true; freeResearchButton.textContent = "Daily Meditation Performed"; } } displayResearchButtons(); if (updatedState) { saveGameState(); } }

// --- Show Settings Popup ---
function showSettings() { if(settingsPopup) settingsPopup.classList.remove('hidden'); if(popupOverlay) popupOverlay.classList.remove('hidden'); }

// --- Event Listeners (Updated for Moves) ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Fully Loaded. Initializing Persona Alchemy Lab v12+...");
    if (!checkDataLoaded()) { console.error("Data check failed on DOMContentLoaded. Aborting initialization."); return; }

    // --- Navigation & Core Actions ---
    navButtons.forEach(button => { button.addEventListener('click', () => { const targetScreenId = button.dataset.target; if (!document.getElementById(targetScreenId)) { console.error(`Target screen '${targetScreenId}' not found!`); return; } if (targetScreenId === 'personaScreen') { displayPersonaScreen(); } else if (targetScreenId === 'studyScreen') { displayStudyScreenContent(); } else if (targetScreenId === 'grimoireScreen') { displayGrimoire(grimoireTypeFilter.value, grimoireElementFilter.value, grimoireSortOrder.value, grimoireRarityFilter.value); } else if (targetScreenId === 'repositoryScreen') { displayRepositoryContent(); } showScreen(targetScreenId); }); });
    if (startButton) { startButton.addEventListener('click', () => { initializeQuestionnaire(true); if(loadButton) loadButton.classList.add('hidden'); }); } else { console.error("Start button not found!"); }
    if (loadButton) { loadButton.onclick = () => { if(loadGameState()){ if (currentElementIndex >= elementNames.length) { console.log("Resuming existing session after load button click."); checkForDailyLogin(); updateInsightDisplays(); updateFocusSlotsDisplay(); updateGrimoireCounter(); populateGrimoireFilters(); displayPersonaScreen(); displayStudyScreenContent(); displayDailyRituals(); displayRepositoryContent(); // Display Repo (incl. Milestones)
     showScreen('personaScreen'); // Still default to Persona
     } else { console.log("Saved state incomplete. Restarting setup after load."); initializeQuestionnaire(true); } loadButton.classList.add('hidden'); } }; }
    if (nextElementButton) nextElementButton.addEventListener('click', nextElement); else console.error("Next button not found!");
    if (prevElementButton) prevElementButton.addEventListener('click', prevElement); else console.error("Prev button not found!");
    if (settingsButton) settingsButton.addEventListener('click', showSettings); else console.error("Settings button not found!");

    // --- Popups & Modals ---
    if (closePopupButton) closePopupButton.addEventListener('click', hidePopups); else console.error("Close Popup button not found!");
    if (popupOverlay) popupOverlay.addEventListener('click', hidePopups); else console.error("Popup Overlay not found!");
    if (closeReflectionModalButton) closeReflectionModalButton.addEventListener('click', hidePopups); else console.error("Close Reflection Modal button not found!");
    if (closeSettingsPopupButton) closeSettingsPopupButton.addEventListener('click', hidePopups); else console.error("Close Settings Popup button not found!");
    if (closeMilestoneAlertButton) closeMilestoneAlertButton.addEventListener('click', hideMilestoneAlert); else console.error("Close Milestone Alert button not found!");

    // --- Concept Interaction & Notes ---
    if (addToGrimoireButton) addToGrimoireButton.addEventListener('click', addToGrimoire); else console.error("Add to Grimoire button not found!");
    if (markAsFocusButton) markAsFocusButton.addEventListener('click', toggleFocusConcept); else console.error("Mark as Focus button not found!");
    // Sell buttons handled dynamically

    // --- Grimoire Filters ---
    const grimoireRefresh = () => { if (!grimoireScreen.classList.contains('hidden')) { displayGrimoire(grimoireTypeFilter.value, grimoireElementFilter.value, grimoireSortOrder.value, grimoireRarityFilter.value); } };
    if (grimoireTypeFilter) grimoireTypeFilter.addEventListener('change', grimoireRefresh); else console.error("Grimoire Type filter not found!");
    if (grimoireElementFilter) grimoireElementFilter.addEventListener('change', grimoireRefresh); else console.error("Grimoire Element filter not found!");
    if (grimoireRarityFilter) grimoireRarityFilter.addEventListener('change', grimoireRefresh); else console.error("Grimoire Rarity filter not found!");
    if (grimoireSortOrder) grimoireSortOrder.addEventListener('change', grimoireRefresh); else console.error("Grimoire Sort order not found!");

    // --- Reflection & Guidance ---
    if (reflectionCheckbox) reflectionCheckbox.addEventListener('change', () => { if(confirmReflectionButton) confirmReflectionButton.disabled = !reflectionCheckbox.checked; }); else console.error("Reflection checkbox not found!");
    if (confirmReflectionButton) confirmReflectionButton.addEventListener('click', handleConfirmReflection); else console.error("Confirm Reflection button not found!");
    if (seekGuidanceButton) seekGuidanceButton.addEventListener('click', triggerGuidedReflection); else console.error("Seek Guidance button not found!");

    // --- Settings Popup Actions ---
    if (forceSaveButton) forceSaveButton.addEventListener('click', () => { saveGameState(); showTemporaryMessage("Game Saved!", 1500); }); else console.error("Force Save button not found!");
    if (resetAppButton) resetAppButton.addEventListener('click', resetApp); else console.error("Reset App button not found!");

    // --- Persona View Toggle ---
    if(showDetailedViewBtn) showDetailedViewBtn.addEventListener('click', () => { personaDetailedView?.classList.add('current'); personaDetailedView?.classList.remove('hidden'); personaSummaryView?.classList.add('hidden'); personaSummaryView?.classList.remove('current'); showDetailedViewBtn.classList.add('active'); showSummaryViewBtn?.classList.remove('active'); });
    if(showSummaryViewBtn) showSummaryViewBtn.addEventListener('click', () => { personaSummaryView?.classList.add('current'); personaSummaryView?.classList.remove('hidden'); personaDetailedView?.classList.add('hidden'); personaDetailedView?.classList.remove('current'); showSummaryViewBtn.classList.add('active'); showDetailedViewBtn?.classList.remove('active'); displayPersonaSummary(); });

    // --- INITIAL LOAD LOGIC ---
    if (localStorage.getItem(SAVE_KEY)) { if(loadButton) loadButton.classList.remove('hidden'); showScreen('welcomeScreen'); }
    else { if(loadButton) loadButton.classList.add('hidden'); showScreen('welcomeScreen'); }
    updateInsightDisplays(); // Ensure cost display is correct initially
    console.log("Initialization complete. Ready.");

}); // --- END OF DOMContentLoaded ---
