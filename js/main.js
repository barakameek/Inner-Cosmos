// main.js - Application Entry Point, Event Listeners, and Initialization (Inner Cosmos Theme)
import * as State from './state.js';
import * as UI from './ui.js';
import * as GameLogic from './gameLogic.js';
import * as Config from './config.js';

console.log("main.js loading...");

// --- Stub for UI.updateFocusSlotsDisplay ---
// If UI.updateFocusSlotsDisplay is not defined in ui.js, define it here to avoid errors.
if (!UI.updateFocusSlotsDisplay) {
  UI.updateFocusSlotsDisplay = function() {
    const focusDisplay = document.getElementById('focusSlotsDisplay');
    if (focusDisplay && State.getFocusSlotsTotal) {
      focusDisplay.textContent = State.getFocusSlotsTotal();
    } else {
      console.log("updateFocusSlotsDisplay: No focusSlotsDisplay element found or getFocusSlotsTotal not defined.");
    }
  };
}

// --- Initialization ---
function initializeApp() {
  console.log("Initializing Inner Cosmos v1.0 (Guided Flow)...");

  // Attempt to load game state
  const loaded = State.loadGameState(); // This populates the current state
  let initialScreen = 'welcomeScreen';

  if (loaded) {
    console.log("Existing voyage data loaded.");
    const currentState = State.getState();
    // Use a function from state.js to get the current tutorial step if available
    const tutorialStep = State.getOnboardingTutorialStep ? State.getOnboardingTutorialStep() : 'start';

    if (currentState.questionnaireCompleted) { // Charting completed?
      if (tutorialStep !== 'complete') {
        console.log(`Resuming tutorial at step: ${tutorialStep}`);
        // Determine screen based on tutorial step
        if (tutorialStep === 'start' || tutorialStep === 'results_seen') {
          initialScreen = 'starCatalogScreen';
          GameLogic.calculateConstellationNarrative(true);
          UI.updateInsightDisplays();
          UI.updateFocusSlotsDisplay();
          UI.updateGrimoireCounter && UI.updateGrimoireCounter();
          UI.populateGrimoireFilters && UI.populateGrimoireFilters();
          UI.refreshStarCatalogDisplay && UI.refreshStarCatalogDisplay();
        } else if (tutorialStep === 'grimoire_intro' || tutorialStep === 'grimoire_card_prompt' || tutorialStep === 'focus_prompt' || tutorialStep === 'focus_action_pending') {
          initialScreen = 'starCatalogScreen';
          GameLogic.calculateConstellationNarrative(true);
          UI.updateInsightDisplays();
          UI.updateFocusSlotsDisplay();
          UI.updateGrimoireCounter && UI.updateGrimoireCounter();
          UI.populateGrimoireFilters && UI.populateGrimoireFilters();
          UI.refreshStarCatalogDisplay && UI.refreshStarCatalogDisplay();
        } else if (tutorialStep === 'persona_tapestry_prompt') {
          initialScreen = 'constellationMapScreen';
          GameLogic.displayConstellationMapScreenLogic && GameLogic.displayConstellationMapScreenLogic();
        } else if (tutorialStep === 'study_intro_prompt' || tutorialStep === 'study_research_prompt') {
          initialScreen = 'observatoryScreen';
          GameLogic.displayObservatoryScreenLogic && GameLogic.displayObservatoryScreenLogic();
        } else {
          initialScreen = 'constellationMapScreen';
          GameLogic.displayConstellationMapScreenLogic && GameLogic.displayConstellationMapScreenLogic();
        }
      } else {
        // Tutorial is complete; resume normal session
        console.log("Continuing voyage post-tutorial.");
        GameLogic.checkForDailyLogin && GameLogic.checkForDailyLogin();
        UI.applyOnboardingPhaseUI && UI.applyOnboardingPhaseUI(State.getOnboardingPhase ? State.getOnboardingPhase() : 0);
        GameLogic.calculateConstellationNarrative(true);
        UI.updateInsightDisplays();
        UI.updateFocusSlotsDisplay();
        UI.updateGrimoireCounter && UI.updateGrimoireCounter();
        UI.populateGrimoireFilters && UI.populateGrimoireFilters();
        UI.refreshStarCatalogDisplay && UI.refreshStarCatalogDisplay();
        UI.setupInitialUI && UI.setupInitialUI();
        initialScreen = 'constellationMapScreen';
      }
      if (loadButton) loadButton.classList.add('hidden');
    } else {
      console.log("Loaded state incomplete (charting not done). Starting charting.");
      State.updateElementIndex && State.updateElementIndex(0);
      UI.initializeQuestionnaireUI && UI.initializeQuestionnaireUI();
      initialScreen = 'chartingScreen';
    }
  } else {
    console.log("No valid saved voyage found or load error. Starting fresh.");
    UI.setupInitialUI && UI.setupInitialUI();
    if (localStorage.getItem(Config.SAVE_KEY)) {
      UI.showTemporaryMessage("Error loading voyage data. Starting fresh.", 4000);
      localStorage.removeItem(Config.SAVE_KEY);
    }
    if (loadButton) loadButton.classList.add('hidden');
  }

  // Show the determined initial screen
  if (initialScreen) {
    UI.showScreen(initialScreen);
  }
  // Ensure no popups remain visible
  if (!document.querySelector('.popup:not(.hidden)')) {
    UI.hidePopups && UI.hidePopups();
  }

  console.log("Initialization complete. Attaching event listeners.");
  attachEventListeners();
  console.log("Inner Cosmos ready.");
}

// --- Event Listeners ---
function attachEventListeners() {
  console.log("Attaching event listeners...");

  const startButton = document.getElementById('startChartingButton');
  const loadBtn = document.getElementById('loadButton');

  if (startButton) {
    startButton.addEventListener('click', () => {
      // Clear any previous state and start questionnaire
      State.clearGameState && State.clearGameState();
      UI.initializeQuestionnaireUI && UI.initializeQuestionnaireUI();
      UI.showScreen('chartingScreen');
    });
  }

  if (loadBtn) {
    loadBtn.addEventListener('click', () => {
      const loaded = State.loadGameState();
      if (loaded) {
        UI.showTemporaryMessage("Voyage data loaded.", 2000);
        initializeApp();
      } else {
        UI.showTemporaryMessage("No saved voyage data found.", 2000);
      }
    });
  }

  // Attach navigation button listeners
  const navButtons = document.querySelectorAll('.nav-button');
  navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const target = e.currentTarget.dataset.target;
      if (target) {
        UI.showScreen(target);
      }
    });
  });

  // Close popups when clicking on the overlay
  const popupOverlay = document.getElementById('popupOverlay');
  if (popupOverlay) {
    popupOverlay.addEventListener('click', () => {
      UI.hidePopups && UI.hidePopups();
    });
  }

  // Additional event listeners for other UI elements can be added here.
}

// Run initialization when the DOM content is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

console.log("main.js loaded.");
