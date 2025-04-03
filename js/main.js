// js/main.js - Application Entry Point, Event Listeners, Initialization (Inner Cosmos Theme)
import * as State from './state.js';
import * as UI from './ui.js';
import * as GameLogic from './gameLogic.js';
import * as Config from './config.js';

console.log("main.js loading...");

// --- Initialization ---
function initializeApp() {
    console.log("Initializing Inner Cosmos v1.0 (Guided Flow)...");

    // Attempt to load game state first
    const loaded = State.loadGameState(); // Populates gameState

    // Determine initial screen based on loaded state & tutorial step
    let initialScreen = 'welcomeScreen';
    if (loaded) {
        console.log("Existing voyage data loaded.");
        const currentState = State.getState();
        const tutorialStep = State.getOnboardingTutorialStep();

        if (currentState.questionnaireCompleted) { // Charting done?
            // If tutorial isn't complete, figure out where they left off
            if (tutorialStep !== 'complete') {
                console.log(`Resuming tutorial at step: ${tutorialStep}`);
                // Determine screen based on tutorial step
                if (tutorialStep === 'start' || tutorialStep === 'results_seen') {
                    // Should have seen results modal, needs grimoire intro
                    initialScreen = 'starCatalogScreen'; // Go to Catalog for intro
                    // GameLogic setup might be needed if skipping results modal on load
                    GameLogic.calculateConstellationNarrative(true);
                    UI.updateInsightDisplays();
                    UI.updateFocusSlotsDisplay();
                    UI.updateGrimoireCounter(); // Renamed? updateStarCount?
                    UI.populateGrimoireFilters(); // Rename? populateCatalogFilters?
                    UI.refreshGrimoireDisplay(); // Rename? refreshStarCatalogDisplay?

                } else if (tutorialStep === 'grimoire_intro' || tutorialStep === 'grimoire_card_prompt' || tutorialStep === 'focus_prompt' || tutorialStep === 'focus_action_pending') {
                    initialScreen = 'starCatalogScreen'; // Still in Catalog/Observatory View context
                    // Load relevant data
                    GameLogic.calculateConstellationNarrative(true);
                    UI.updateInsightDisplays();
                    UI.updateFocusSlotsDisplay();
                    UI.updateGrimoireCounter();
                    UI.populateGrimoireFilters();
                    UI.refreshGrimoireDisplay();

                } else if (tutorialStep === 'persona_tapestry_prompt') {
                    initialScreen = 'constellationMapScreen'; // Go to Constellation Map
                    GameLogic.displayConstellationMapScreenLogic(); // Ensure map data is ready

                } else if (tutorialStep === 'study_intro_prompt' || tutorialStep === 'study_research_prompt') {
                    initialScreen = 'observatoryScreen'; // Go to Observatory
                    GameLogic.displayObservatoryScreenLogic(); // Ensure observatory data is ready
                }
                 else {
                     initialScreen = 'constellationMapScreen'; // Fallback if tutorial step is weird
                      GameLogic.displayConstellationMapScreenLogic();
                 }
            } else {
                // Tutorial is complete, normal session resume
                console.log("Continuing voyage post-tutorial.");
                GameLogic.checkForDailyLogin();
                UI.applyOnboardingPhaseUI(State.getOnboardingPhase());
                GameLogic.calculateConstellationNarrative(true);
                UI.updateInsightDisplays();
                UI.updateFocusSlotsDisplay();
                UI.updateGrimoireCounter();
                UI.populateGrimoireFilters();
                UI.refreshGrimoireDisplay();
                UI.setupInitialUI(); // Sets button states etc.
                initialScreen = 'constellationMapScreen'; // Default to Constellation Map
            }
        } else {
            console.log("Loaded state incomplete (charting not done). Starting charting.");
            State.updateElementIndex(0);
            UI.initializeQuestionnaireUI(); // Renamed? initializeChartingUI?
            initialScreen = 'chartingScreen'; // Renamed screen ID
        }
        const loadBtn = document.getElementById('loadButton');
        if (loadBtn) loadBtn.classList.add('hidden');

    } else {
        console.log("No valid saved voyage found or load error. Starting fresh.");
        UI.setupInitialUI(); // Sets tutorialStep to 'start'
        if (localStorage.getItem(Config.SAVE_KEY)) { UI.showTemporaryMessage("Error loading voyage data. Starting fresh.", 4000); localStorage.removeItem(Config.SAVE_KEY); }
        const loadBtn = document.getElementById('loadButton');
        if (loadBtn) loadBtn.classList.add('hidden');
    }

    // Show the determined initial screen (or let tutorial modal show first)
    // Note: showScreen now handles triggering the tutorial modal if needed
    if(initialScreen) {
         UI.showScreen(initialScreen);
    }
     // Ensure no popups are stuck open
     if (!document.querySelector('.popup:not(.hidden)')) {
        UI.hidePopups();
     }

    console.log("Initialization complete. Attaching event listeners.");
    attachEventListeners();
    console.log("Inner Cosmos ready.");
}

// --- Event Listeners ---
function attachEventListeners() {
    console.log("Attaching event listeners...");

    // Welcome Screen
    const startButton = document.getElementById('startChartingButton'); // Renamed ID
    const loadButton = document.getElementById('loadButton');
    if (startButton) startButton.addEventListener('click', () => {
        State.clearGameState();
        State.updateElementIndex(0); // Set state index to 0 for charting
        UI.initializeQuestionnaireUI(); // Renamed? initializeChartingUI?
        UI.showScreen('chartingScreen'); // Renamed ID
        if(loadButton) loadButton.classList.add('hidden');
    });
    // Load button logic handled in initializeApp

    // Charting (Questionnaire) Navigation
    const nextBtn = document.getElementById('nextForceButton'); // Renamed ID
    const prevBtn = document.getElementById('prevForceButton'); // Renamed ID
    if (nextBtn) nextBtn.addEventListener('click', GameLogic.goToNextForce); // Renamed handler
    if (prevBtn) prevBtn.addEventListener('click', GameLogic.goToPrevForce); // Renamed handler

    // Main Navigation
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        if(!button.classList.contains('settings-button')) {
            button.addEventListener('click', () => {
                const target = button.dataset.target;
                if (target) { UI.showScreen(target); } // showScreen handles logic/tutorials
            });
        }
    });
    const settingsBtn = document.getElementById('settingsButton');
    if (settingsBtn) settingsBtn.addEventListener('click', UI.showSettings);

    // --- Starting Nebula Modal Listener ---
     const nebulaModalBtn = document.getElementById('goToCatalogButton'); // Renamed ID
    const closeNebulaBtn = document.getElementById('closeNebulaModalButton'); // Renamed ID
    if (nebulaModalBtn) {
        nebulaModalBtn.addEventListener('click', () => {
            console.log("Navigating from Nebula Modal to Catalog.");
            UI.hideStartingNebulaModal(); // *** Use new hide function ***
            State.setOnboardingTutorialStep('grimoire_intro');
            UI.showScreen('starCatalogScreen');
        });
    } else { console.error("Go To Catalog button not found!"); }
    if (closeNebulaBtn) {
         closeNebulaBtn.addEventListener('click', () => {
            console.log("Nebula modal closed via 'X', navigating to Catalog.");
            UI.hideStartingNebulaModal(); // *** Use new hide function ***
            State.setOnboardingTutorialStep('grimoire_intro');
            UI.showScreen('starCatalogScreen');
         });
    }
    // --- End Starting Nebula Modal Listener ---

    // --- Tutorial Modal ---
    const tutorialNextButton = document.getElementById('tutorialNextButton');
    if (tutorialNextButton) {
        // The actual logic (advancing step, hiding) is handled within showTutorialStep/hideTutorialStep in ui.js
        // This button's click is set dynamically by showTutorialStep
    } else { console.error("Tutorial Next button not found!"); }


    // Popups & Modals Close Buttons (General)
    const closeObservatoryViewBtn = document.getElementById('closeObservatoryViewButton'); // Renamed
    const overlay = document.getElementById('popupOverlay');
    const closeReflectionBtn = document.getElementById('closeReflectionModalButton');
    const closeSettingsBtn = document.getElementById('closeSettingsPopupButton');
    const closeMilestoneBtn = document.getElementById('closeMilestoneAlertButton');
    // Removed closeDeepDiveBtn as that modal structure was part of the old theme
    if (closeObservatoryViewBtn) closeObservatoryViewBtn.addEventListener('click', UI.hidePopups);
    if (overlay) overlay.addEventListener('click', UI.hidePopups);
    if (closeReflectionBtn) closeReflectionBtn.addEventListener('click', UI.hidePopups);
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', UI.hidePopups);
    if (closeMilestoneBtn) closeMilestoneBtn.addEventListener('click', UI.hideMilestoneAlert);

    // Observatory View (Star Detail) Popup Actions (Delegation)
    const observatoryPopupActions = document.querySelector('#observatoryViewPopup .popup-actions'); // Renamed ID
    if (observatoryPopupActions) {
         observatoryPopupActions.addEventListener('click', (event) => {
               const button = event.target.closest('button'); if (!button) return;
               const starId = GameLogic.getCurrentPopupStarId(); // Renamed getter
               if (button.id === 'catalogStarButton' && starId !== null) GameLogic.addStarToCatalogById(starId, button); // Renamed handler & button ID
               else if (button.id === 'alignStarButton' && starId !== null) GameLogic.handleToggleAlignment(); // Renamed handler & button ID
               else if (button.classList.contains('popup-sell-button') && starId !== null) GameLogic.handleSellConcept(event); // Keep generic sell handler for now
         });
    }

    // Evolve Star Button (in Observatory View Popup)
    const evolveBtn = document.getElementById('evolveStarButton'); // Renamed ID
    if (evolveBtn) evolveBtn.addEventListener('click', GameLogic.attemptStellarEvolution); // Renamed handler

    // Save Log Entry Button (in Observatory View Popup)
    const saveLogBtn = document.getElementById('saveLogEntryButton'); // Renamed ID
    if (saveLogBtn) saveLogBtn.addEventListener('click', GameLogic.handleSaveLogEntry); // Renamed handler

    // Star Catalog (Grimoire) Filters & Card Interaction (Delegation)
    const catalogControls = document.getElementById('catalogControls'); // Renamed ID
    if (catalogControls) {
        catalogControls.querySelectorAll('select').forEach(select => {
             select.addEventListener('change', UI.refreshGrimoireDisplay); // Rename UI func? refreshCatalogDisplay?
        });
        const searchInput = document.getElementById('catalogSearchInput'); // Renamed ID
        if (searchInput) {
             searchInput.addEventListener('input', UI.refreshGrimoireDisplay); // Rename UI func?
        }
    }
    const catalogContent = document.getElementById('starCatalogContent'); // Renamed ID
    if (catalogContent) {
        // Delegated listener for sell buttons *within* the catalog grid cards
        catalogContent.addEventListener('click', (event) => {
            const sellButton = event.target.closest('.card-sell-button'); // Keep class for now
            if (sellButton) {
                event.stopPropagation(); // Prevent card click from opening popup
                GameLogic.handleSellConcept(event); // Keep generic sell handler
            }
        });
    }

    // Reflection Modal
    const reflectionCheck = document.getElementById('reflectionCheckbox');
    const confirmReflectionBtn = document.getElementById('confirmReflectionButton');
    if (reflectionCheck) reflectionCheck.addEventListener('change', () => { if(confirmReflectionBtn) confirmReflectionBtn.disabled = !reflectionCheck.checked; });
    if (confirmReflectionBtn) confirmReflectionBtn.addEventListener('click', () => { const nudgeCheckbox = document.getElementById('scoreNudgeCheckbox'); GameLogic.handleConfirmReflection(nudgeCheckbox ? nudgeCheckbox.checked : false); });

    // Observatory (Study) Actions
    const scanContainer = document.getElementById('sectorScanButtonContainer'); // Renamed ID
    const dailyScanBtn = document.getElementById('dailyScanButton'); // Renamed ID
    const deepScanBtn = document.getElementById('deepScanButton'); // Renamed ID
    if (scanContainer) { scanContainer.addEventListener('click', (event) => { const button = event.target.closest('.sector-scan-button'); if (button) GameLogic.handleSectorScanClick({ currentTarget: button }); }); } // Renamed handler
    if (dailyScanBtn) dailyScanBtn.addEventListener('click', GameLogic.handleDailyScanClick); // Renamed handler
    if (deepScanBtn) deepScanBtn.addEventListener('click', GameLogic.triggerGuidedReflection); // Rename handler? triggerDeepScan?

    // Scan Log (Research Output) Actions (Delegation for Catalog/Analyze buttons)
    const scanOutputArea = document.getElementById('scanOutput'); // Renamed ID
    if (scanOutputArea) {
        scanOutputArea.addEventListener('click', (event) => {
            const button = event.target.closest('button'); if (!button) return;
            const starIdStr = button.dataset.conceptId; if (!starIdStr) return; // Still using conceptId data attribute
            const starId = parseInt(starIdStr); if (isNaN(starId)) return;
            if (button.classList.contains('catalog-button')) GameLogic.addStarToCatalogById(starId, button); // Renamed handler
            else if (button.classList.contains('sell-button')) GameLogic.handleSellConcept(event); // Keep generic handler
        });
    }

     // Deep Dive Unlock (Now likely handled differently or removed)
     // const personaDetailsContainer = document.getElementById('personaElementDetails'); ... listener removed ...

     // Cartography (Repository) Actions (Delegation for Meditate/Stabilize buttons)
     const cartographyContainer = document.getElementById('cartographyScreen'); // Renamed ID
     if (cartographyContainer) { cartographyContainer.addEventListener('click', (event) => { const button = event.target.closest('button'); if (!button) return; if (button.dataset.sceneId) GameLogic.handleMeditateBlueprint(event); else if (button.dataset.experimentId) GameLogic.handleStabilizeOrbit(event); }); } // Renamed handlers

    // Settings Popup Actions
    const forceSaveBtn = document.getElementById('forceSaveButton');
    const resetBtn = document.getElementById('resetAppButton');
    if (forceSaveBtn) forceSaveBtn.addEventListener('click', () => { State.saveGameState(); UI.showTemporaryMessage("Transmission Sent (Saved)!", 1500); }); // Renamed message
    if (resetBtn) resetBtn.addEventListener('click', () => { if (confirm("Abandon Voyage? ALL progress will be lost.")) { console.log("Abandoning voyage..."); State.clearGameState(); UI.setupInitialUI(); UI.hidePopups(); UI.showTemporaryMessage("Voyage Abandoned.", 3000); const loadBtn = document.getElementById('loadButton'); if(loadBtn) loadBtn.classList.add('hidden'); } }); // Renamed confirm

     // View Toggle (If keeping Summary view for Constellation Map)
     // const detailedViewBtn = document.getElementById('showDetailedViewBtn'); ... listeners might be removed if summary view is dropped ...

    // Constellation Map Specific Button Delegation (If needed - Explore/Suggest removed?)
    const constellationScreenDiv = document.getElementById('constellationMapScreen'); // Renamed ID
    if (constellationScreenDiv) {
        constellationScreenDiv.addEventListener('click', (event) => {
            const button = event.target.closest('button'); if (!button) return;
            if (button.id === 'discoverMoreButton') UI.showScreen('observatoryScreen'); // Button to go to Observatory
            else if (button.id === 'suggestBlueprintButton') GameLogic.handleSuggestBlueprintClick(); // Renamed handler
        });
    } else { console.warn("Constellation Map container not found for button delegation."); }

    // Deep Dive / Contemplation (Removed as it was part of old theme)
    // const deepDiveNodesContainer = ... listener removed ...
    // const deepDiveDetailArea = ... listener removed ...

    console.log("Event listeners attached.");
}

// --- Start the App ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp(); // Already loaded
}

console.log("main.js loaded.");
