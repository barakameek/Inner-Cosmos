// --- START OF FILE main.js ---
// js/main.js - Application Entry Point & Event Listener Setup (Enhanced v4.1 + Drawer - Fixed v2 + Onboarding Tours)

 import * as UI from './js/ui.js'; // ui.js is inside js/
 import * as State from './js/state.js'; // state.js is inside js/
 import * as GameLogic from './js/gameLogic.js'; // gameLogic.js is inside js/
 import * as Utils from './js/utils.js'; // utils.js is inside js/
 import * as Config from './js/config.js'; // config.js is inside js/
 import {
   onboardingWelcomeIntro, // Import specific tours
   onboardingWorkshopIntro,
   onboardingRepositoryIntro,
   elementKeyToFullName, // Keep other necessary imports
   elementDetails, // Ensure elementDetails is imported if needed by getTourForScreen (it is)
 } from './data.js'; // data.js is at the root (same level as main.js)

console.log("main.js loading... (Enhanced v4.1 + Drawer - Fixed v2 + Onboarding Tours)");

// --- Helper Function ---
const getElement = (id) => document.getElementById(id);

// --- Utility to pick the correct onboarding tour based on screen ---
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

// --- Initialization ---
function initializeApp() {
    console.log("Initializing Persona Alchemy Lab (v4.1 - Fixed v2 + Tours)...");
    const loaded = State.loadGameState(); // Load state first
    UI.setupInitialUI(); // Sets initial screen visibility, theme etc. BEFORE showing content

    // Determine starting screen based on loaded state and onboarding status
    const currentState = State.getState();
    const onboardingPhase = currentState.onboardingPhase;
    // Use the updated isOnboardingComplete which checks for phase 99 (skipped)
    const onboardingComplete = State.isOnboardingComplete();
    const questionnaireComplete = currentState.questionnaireCompleted;
    const currentQuestionnaireIndex = currentState.currentElementIndex;

    console.log(`Initial State: Onboarding Phase ${onboardingPhase}, Onboarding Complete: ${onboardingComplete}, Questionnaire Complete: ${questionnaireComplete}, Q Index: ${currentQuestionnaireIndex}`);

    let initialScreenId = 'welcomeScreen'; // Default

    // Check if onboarding is *active* (enabled, not complete/skipped, phase > 0)
    // MAX_ONBOARDING_PHASE is now 3 for the initial tour.
    if (Config.ONBOARDING_ENABLED && !onboardingComplete && onboardingPhase >= 1) {
        // Onboarding is active, determine the required screen for the current phase
        console.log(`Resuming onboarding at phase ${onboardingPhase}.`);
        let requiredScreen = 'welcomeScreen'; // Default screen

        // Find the appropriate tour and task for the *current* phase
        const tasksForCurrentPhase = getTourForScreen(initialScreenId); // Start assuming welcome screen
        const currentTask = tasksForCurrentPhase.find(t => t.phaseRequired === onboardingPhase);

        if (currentTask?.highlightElementId) {
            const targetElement = getElement(currentTask.highlightElementId);
            const screenElement = targetElement?.closest('.screen');
            if (screenElement?.id) {
                requiredScreen = screenElement.id;
                // Re-evaluate the correct task list if the required screen changes
                const tasksForRequiredScreen = getTourForScreen(requiredScreen);
                const taskForRequiredScreen = tasksForRequiredScreen.find(t => t.phaseRequired === onboardingPhase);

                // Accessibility/Flow Checks
                if (!questionnaireComplete && ['personaScreen', 'workshopScreen', 'repositoryScreen'].includes(requiredScreen)) {
                    requiredScreen = (currentQuestionnaireIndex > -1) ? 'questionnaireScreen' : 'welcomeScreen';
                    console.warn(`Onboarding task ${taskForRequiredScreen?.id || currentTask.id} requires screen ${screenElement.id}, but questionnaire not complete. Forcing ${requiredScreen}.`);
                } else if (questionnaireComplete && requiredScreen === 'questionnaireScreen') {
                    requiredScreen = 'personaScreen';
                    console.warn(`Onboarding task ${taskForRequiredScreen?.id || currentTask.id} requires questionnaireScreen, but questionnaire complete. Forcing personaScreen.`);
                }
            }
        } else {
            // If no highlight, determine screen based on which tour the phase *belongs* to
            // This logic might need adjustment based on how you want phase numbers to map across tours
            // Assuming phase 1-3 = welcome/persona, 4-5 = workshop, 6-8 = repository (conceptually)
            // Since MAX_PHASE is now 3, this section needs revision or removal if we always start at phase 1 for each tour.
             console.log("Determining required screen based on phase number (needs review with multi-tour logic)...");
             // Example: If phase is 4 or 5 (Workshop tour concepts), default to workshop screen if Q complete
             if (onboardingPhase >= 4 && onboardingPhase <= 5 && questionnaireComplete) requiredScreen = 'workshopScreen';
             else if (onboardingPhase >= 6 && questionnaireComplete) requiredScreen = 'repositoryScreen';
             // If phase is 1-3, welcome/persona/questionnaire is okay.
             else requiredScreen = questionnaireComplete ? 'personaScreen' : 'welcomeScreen';
        }

        initialScreenId = requiredScreen;
        UI.showScreen(initialScreenId); // Show context screen FIRST
        UI.showOnboarding(onboardingPhase, initialScreenId); // Pass screen ID to potentially select correct tour length

    } else if (loaded && questionnaireComplete) {
        // Standard load: Questionnaire done, show Persona screen
        initialScreenId = 'personaScreen';
        console.log("Loaded completed state. Showing Persona screen.");
        UI.showScreen(initialScreenId);
        // Explicitly update drawer links after showing screen based on loaded state
        UI.updateDrawerLinks(); // Ensure links are correct after loading completed state
        if (typeof GameLogic !== 'undefined' && GameLogic.checkForDailyLogin) {
             GameLogic.checkForDailyLogin();
        } else { console.error("GameLogic or checkForDailyLogin not available yet!"); }

    } else if (loaded && !questionnaireComplete && currentQuestionnaireIndex > -1) {
        // Loaded incomplete questionnaire state
        initialScreenId = 'questionnaireScreen';
        console.log("Loaded incomplete questionnaire state. Resuming questionnaire.");
        UI.showScreen(initialScreenId);

    } else {
        // No saved state or starting completely fresh.
        initialScreenId = 'welcomeScreen';
        console.log("No saved state or starting fresh. Showing welcome screen.");
        UI.showScreen(initialScreenId);
        if (Config.ONBOARDING_ENABLED && !onboardingComplete && onboardingPhase === 1) {
             console.log("Starting onboarding automatically from phase 1 (Welcome Tour).");
             UI.showOnboarding(1, initialScreenId); // Show Welcome Tour Phase 1
        }
    }

    // Setup General Event Listeners (always needed)
    setupGlobalEventListeners();
    setupWelcomeScreenListeners();
    setupDrawerListeners();
    setupPopupInteractionListeners();
    setupQuestionnaireListeners(); // Setup listeners AFTER initial screen is determined
    setupPersonaScreenListeners();
    setupWorkshopScreenListeners();
    setupRepositoryListeners();
    setupOnboardingListeners(); // Now includes the new help button listener

    // Initial UI updates based on loaded/initial state
    UI.updateInsightDisplays();
    UI.updateFocusSlotsDisplay();
    UI.updateGrimoireCounter();

    console.log("Initialization complete. Initial screen:", initialScreenId);
}

// --- Helper to potentially advance onboarding after an action ---
function triggerActionAndCheckOnboarding(actionFn, actionName, targetPhase, actionValue = null, currentScreenId = null) {
    const activeScreenId = currentScreenId || document.querySelector('.screen.current')?.id || 'welcomeScreen';
    console.log(`Action Triggered: '${actionName}' on screen '${activeScreenId}' (Target Phase: ${targetPhase}, Value: ${actionValue})`);

    let actionResult = null;
    if (actionFn && typeof actionFn === 'function') {
        try {
            actionResult = actionFn();
        } catch (error) {
            console.error(`Error executing action function for '${actionName}':`, error);
        }
    }

    const currentPhase = State.getOnboardingPhase();
    const onboardingComplete = State.isOnboardingComplete(); // Checks for 99 too

    // Check if onboarding is active for the current screen's tour
    if (Config.ONBOARDING_ENABLED && !onboardingComplete && currentPhase >= 1) {
        const tasks = getTourForScreen(activeScreenId); // Get tasks for the CURRENT screen
        const task = tasks.find(t => t.phaseRequired === currentPhase); // Find the task for the current phase within this tour

        if (!task) {
            // This might happen if the user is on a screen whose tour hasn't started or is finished
            // Or if the phase number doesn't exist in this tour's tasks.
            console.log(`Onboarding Check: No task found for phase ${currentPhase} in the tour for screen '${activeScreenId}'. Onboarding likely inactive for this action/screen.`);
            return actionResult;
        }

        // Check if the triggered action matches the *target* phase for the *task* definition
        // The targetPhase passed to this function indicates which phase *this action* is intended to trigger.
        if (currentPhase !== targetPhase) {
             console.log(`Action '${actionName}' triggered for phase ${targetPhase}, but current onboarding phase is ${currentPhase}. No advance.`);
             return actionResult;
        }

        let meetsCondition = false;
        if (task.track) {
            if (task.track.action === actionName) {
                 meetsCondition = (task.track.value === undefined || task.track.value === actionValue);
                 console.log(`Onboarding Check: Action '${actionName}' matches task action for phase ${currentPhase}. Value check needed: ${task.track.value !== undefined}. Provided: ${actionValue}. Condition met: ${meetsCondition}`);
            }
        } else {
            console.log(`Onboarding Check: No specific track conditions for phase ${currentPhase}. Assuming action '${actionName}' is the trigger.`);
            meetsCondition = true;
        }

        if (meetsCondition) {
             console.log(`Action '${actionName}' meets criteria for phase ${currentPhase}. Advancing onboarding.`);
             const nextPhase = State.advanceOnboardingPhase();
             const maxPhaseForThisTour = tasks.length; // Max phase for the current tour

             if (nextPhase > maxPhaseForThisTour) {
                  console.log(`Onboarding: Tour for screen '${activeScreenId}' completed.`);
                  // Optionally mark this specific tour as done if needed, or just hide
                  UI.hideOnboarding();
                  // Maybe trigger the next tour automatically?
                  // Example: If finishing welcome tour (phase 3), maybe auto-show workshop tour phase 1?
                  // if (activeScreenId === 'welcomeScreen' && nextPhase === 4) {
                  //     State.setOnboardingPhase(1); // Reset phase for next tour
                  //     UI.showScreen('workshopScreen'); // Go to the next screen
                  //     UI.showOnboarding(1, 'workshopScreen'); // Show the workshop tour
                  // }
             } else {
                  UI.showOnboarding(nextPhase, activeScreenId); // Show next step in the *current* tour
             }
        } else {
             console.log(`Action '${actionName}' triggered for phase ${currentPhase}, but condition not met. Onboarding not advanced.`);
        }
    }
    return actionResult;
}


// --- Event Listener Setup Functions ---

function setupGlobalEventListeners() {
    const closeSettingsBtn = getElement('closeSettingsPopupButton');
    const forceSaveBtn = getElement('forceSaveButton');
    const resetBtn = getElement('resetAppButton');

    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', UI.hidePopups);
    if (forceSaveBtn) forceSaveBtn.addEventListener('click', () => { State.saveGameState(true); UI.showTemporaryMessage("Game Saved!", 1500); });
    if (resetBtn) resetBtn.addEventListener('click', () => {
        if (confirm("Are you SURE you want to reset all progress? This cannot be undone!")) {
            if (typeof GameLogic !== 'undefined' && GameLogic.clearPopupState) {
                 GameLogic.clearPopupState();
            } else { console.error("GameLogic or clearPopupState not available."); }
            State.clearGameState();
            window.location.reload(); // Reload after clearing
        }
    });

    const closeMilestoneBtn = getElement('closeMilestoneAlertButton');
    if (closeMilestoneBtn) closeMilestoneBtn.addEventListener('click', UI.hideMilestoneAlert);

    const overlay = getElement('popupOverlay');
    if (overlay) {
        overlay.addEventListener('click', (event) => {
            const onboardingOverlay = getElement('onboardingOverlay');
            const onboardingPopup = getElement('onboardingPopup');
            const sideDrawerElement = getElement('sideDrawer');

            const isClickInsideOnboardingPopup = onboardingPopup?.contains(event.target);
            const isClickInsideDrawer = sideDrawerElement?.contains(event.target);

            // If onboarding overlay is visible, clicking outside its popup should NOT close anything else
            if (onboardingOverlay?.classList.contains('visible') && !isClickInsideOnboardingPopup) {
                return;
            } else if (sideDrawerElement?.classList.contains('open') && !isClickInsideDrawer) {
                 UI.toggleDrawer(); // Close drawer if clicking outside it
            } else if (!onboardingOverlay?.classList.contains('visible') && !sideDrawerElement?.classList.contains('open')) {
                 // Only hide general popups if neither drawer nor onboarding is active
                 UI.hidePopups();
            }
        });
    } else { console.warn("Popup overlay element not found."); }

     const closeInfoBtn = getElement('closeInfoPopupButton');
     const confirmInfoBtn = getElement('confirmInfoPopupButton');
     if (closeInfoBtn) closeInfoBtn.addEventListener('click', UI.hidePopups);
     if (confirmInfoBtn) confirmInfoBtn.addEventListener('click', UI.hidePopups);

    const addInsightBtn = getElement('addInsightButton');
    if(addInsightBtn) {
        addInsightBtn.addEventListener('click', () => {
             if (typeof GameLogic !== 'undefined' && GameLogic.handleInsightBoostClick) {
                  GameLogic.handleInsightBoostClick();
             } else { console.error("GameLogic or handleInsightBoostClick not available."); }
        });
    } else { console.warn("Add Insight button not found."); }

    document.body.addEventListener('click', (event) => {
        const target = event.target.closest('.info-icon');
        if (target?.title) {
            event.preventDefault();
            event.stopPropagation();
            UI.showInfoPopup(target.title);
        }
    });
}

function setupDrawerListeners() {
    const drawerToggle = getElement('drawerToggle');
    const sideDrawer = getElement('sideDrawer');
    const drawerSettingsButton = getElement('drawerSettings');
    const drawerThemeToggle = getElement('drawerThemeToggle');

    if (drawerToggle) drawerToggle.addEventListener('click', UI.toggleDrawer);
    else console.warn("Drawer toggle button not found.");

    if (sideDrawer) sideDrawer.addEventListener('click', handleDrawerNavClick);
    else console.warn("Side drawer element not found.");

    if (drawerSettingsButton) {
        drawerSettingsButton.addEventListener('click', () => {
            UI.showSettings();
            UI.toggleDrawer(); // Close drawer after opening settings
        });
    }
    if (drawerThemeToggle) drawerThemeToggle.addEventListener('click', UI.toggleTheme);

    // Add listener for the new help button
    const helpBtn = getElement('helpBtn');
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            const currentScreenId = document.querySelector('.screen.current')?.id || 'welcomeScreen';
            console.log(`Help button clicked on screen: ${currentScreenId}`);
            State.setOnboardingPhase(1); // Restart the tour for the current screen at phase 1
            UI.showOnboarding(1, currentScreenId); // Show phase 1 of the relevant tour
        });
    } else { console.warn("Help button (#helpBtn) not found."); }
}

function handleDrawerNavClick(event) {
    const button = event.target.closest('.drawer-link[data-target]');
    if (!button) return;

    const targetScreenId = button.dataset.target;
    if (!targetScreenId) {
         console.warn("Drawer link clicked without target screen:", button);
         return;
    }

    const isPostQuestionnaire = State.getState().questionnaireCompleted;
    // Allow navigation to welcome/persona anytime, others only post-questionnaire
    const canNavigate = ['welcomeScreen', 'personaScreen'].includes(targetScreenId) || isPostQuestionnaire;

    if (canNavigate) {
         // Determine which tour *might* be relevant for this screen, and reset phase to 1
         const tour = getTourForScreen(targetScreenId);
         const shouldRestartTour = tour && !State.isOnboardingComplete(); // Restart if tour exists and not skipped

         if (shouldRestartTour) {
              State.setOnboardingPhase(1); // Set state to phase 1 for this tour
              // The showScreen call below will trigger the actual onboarding display
              console.log(`Navigating to ${targetScreenId}, resetting onboarding to phase 1 for its tour.`);
         }

         UI.showScreen(targetScreenId); // Show the screen first

         if (shouldRestartTour) {
             // Explicitly show onboarding after screen transition
             UI.showOnboarding(1, targetScreenId);
         }

         UI.toggleDrawer(); // Close drawer after navigation
    } else {
        console.log("Navigation blocked: Questionnaire not complete.");
        UI.showTemporaryMessage("Complete the initial Experimentation first!", 2500);
        UI.toggleDrawer(); // Close drawer even if blocked
    }
}


function setupWelcomeScreenListeners() {
    const startBtn = getElement('startGuidedButton');
    const loadBtn = getElement('loadButton');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const currentState = State.getState();
            const onboardingComplete = State.isOnboardingComplete();
            const questionnaireComplete = currentState.questionnaireCompleted;

            if (!questionnaireComplete) {
                // If onboarding is enabled AND not complete/skipped, start/resume it
                if (Config.ONBOARDING_ENABLED && !onboardingComplete) {
                    console.log("Starting/resuming Welcome Onboarding tour...");
                    State.setOnboardingPhase(1); // Ensure we start at phase 1 of welcome tour
                    UI.showOnboarding(1, 'welcomeScreen'); // Explicitly show phase 1
                    // Don't transition screen yet, let onboarding guide
                } else {
                    // Onboarding disabled or already skipped/finished, go straight to questionnaire
                    UI.initializeQuestionnaireUI();
                    UI.showScreen('questionnaireScreen');
                }
            } else {
                 // Questionnaire already done, just go to Persona
                 UI.showScreen('personaScreen');
                 UI.showTemporaryMessage("Experimentation already complete. Welcome back!", 2500);
            }
        });
    } else { console.warn("Start button not found."); }

    if (loadBtn) {
        loadBtn.addEventListener('click', () => {
            // Re-initialize completely after loading
            if (State.loadGameState()) {
                initializeApp(); // This re-evaluates where the user should be, including onboarding state
                UI.showTemporaryMessage("Session Loaded.", 2000);
            } else {
                 UI.showTemporaryMessage("Failed to load session. Starting fresh.", 3000);
                 UI.showScreen('welcomeScreen');
            }
        });
    } else { console.warn("Load button not found."); }
}


function setupQuestionnaireListeners() {
    const nextBtn = getElement('nextElementButton');
    const prevBtn = getElement('prevElementButton');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (typeof GameLogic !== 'undefined' && GameLogic.goToPrevElement) {
                 GameLogic.goToPrevElement();
            } else { console.error("GameLogic or goToPrevElement not available."); }
        });
    } else { console.warn("Questionnaire previous button not found."); }

    if (nextBtn) {
         nextBtn.addEventListener('click', () => {
             if (typeof GameLogic !== 'undefined' && GameLogic.goToNextElement) {
                 // Call the logic function first
                 GameLogic.goToNextElement();

                 // Check the state *after* the logic function has potentially updated it
                 const state = State.getState();
                 if (state.questionnaireCompleted && getElement('questionnaireScreen')?.classList.contains('current')) {
                     // If the logic completed the questionnaire and we are still on the Q screen...
                     console.log("Questionnaire complete triggered, transitioning to Persona screen from listener.");
                     // ...then trigger the screen transition.
                     // No specific onboarding phase tied directly to *completing* the questionnaire
                     // but showing Persona screen might trigger its tour if not skipped.
                     const targetScreenId = 'personaScreen';
                     UI.showScreen(targetScreenId);
                     // If onboarding isn't skipped, start the Persona tour (which uses Welcome tour tasks)
                     if (Config.ONBOARDING_ENABLED && !State.isOnboardingComplete()) {
                         State.setOnboardingPhase(1); // Start Persona/Welcome tour at phase 1
                         UI.showOnboarding(1, targetScreenId);
                     }
                 }
             } else {
                 console.error("GameLogic or goToNextElement not available.");
             }
         });
     } else { console.warn("Questionnaire next button not found."); }

    // Input listeners are added dynamically by UI.displayElementQuestions
}

// --- Setup Persona Screen Listeners (Keep as is) ---
function setupPersonaScreenListeners() {
    const detailedViewBtn = getElement('showDetailedViewBtn');
    const summaryViewBtn = getElement('showSummaryViewBtn');
    if (detailedViewBtn && summaryViewBtn) {
        detailedViewBtn.addEventListener('click', () => UI.togglePersonaView(true));
        summaryViewBtn.addEventListener('click', () => UI.togglePersonaView(false));
    } else { console.warn("Persona view toggle buttons not found."); }

    const personaElementsContainer = getElement('personaElementDetails');
    if (personaElementsContainer) {
        personaElementsContainer.addEventListener('click', (event) => {
            const unlockButton = event.target.closest('.unlock-button');
            const headerButton = event.target.closest('.accordion-header');

            if (unlockButton) {
                 event.stopPropagation();
                 const elementKey = unlockButton.dataset.elementKey;
                 const level = parseInt(unlockButton.dataset.level);
                 const cost = parseFloat(unlockButton.dataset.cost);
                 if (elementKey && !isNaN(level) && !isNaN(cost)) {
                     if (typeof GameLogic !== 'undefined' && GameLogic.handleUnlockLibraryLevel) {
                         // Unlocking library isn't tied to a specific onboarding phase in the split model
                         GameLogic.handleUnlockLibraryLevel(event);
                         // triggerActionAndCheckOnboarding(() => GameLogic.handleUnlockLibraryLevel(event), 'unlockLibrary', 6 ); // Old phase 6
                     } else { console.error("GameLogic or handleUnlockLibraryLevel not available."); }
                 }
            } else if (headerButton) {
                 const accordionItem = headerButton.closest('.accordion-item');
                 const elementKey = accordionItem?.dataset.elementKey;
                 // Opening 'Attraction' accordion was phase 1 goal in original Welcome tour
                 if (elementKey === 'A') {
                      triggerActionAndCheckOnboarding(null, 'openElementDetails', 1, elementKey, 'personaScreen'); // Check against Welcome tour phase 1
                 }
            }
        });
    } else { console.warn("Persona element details container not found."); }

    const focusedConceptsContainer = getElement('focusedConceptsDisplay');
    if (focusedConceptsContainer) {
        focusedConceptsContainer.addEventListener('click', (event) => {
            const targetItem = event.target.closest('.focus-concept-item[data-concept-id]');
            if (targetItem) {
                const conceptId = parseInt(targetItem.dataset.conceptId);
                if (!isNaN(conceptId)) { UI.showConceptDetailPopup(conceptId); }
            }
        });
    } else { console.warn("Focused concepts display container not found."); }

     const insightLogContainer = getElement('insightLogContainer');
     if (insightLogContainer) {
         const resourceHeader = personaElementsContainer?.parentNode?.querySelector('h2[title*="Insight"]');
         if (resourceHeader) {
             resourceHeader.style.cursor = 'pointer';
             resourceHeader.addEventListener('click', () => {
                 const isHidden = insightLogContainer.classList.toggle('log-hidden');
                 insightLogContainer.style.display = isHidden ? 'none' : 'block';
             });
             insightLogContainer.style.display = insightLogContainer.classList.contains('log-hidden') ? 'none' : 'block';
         } else { console.warn("Could not find 'Resources' header to attach Insight Log toggle."); }
     } else { console.warn("Insight log container not found."); }

    const dilemmaBtn = getElement('elementalDilemmaButton');
    const synergyBtn = getElement('exploreSynergyButton');
    const suggestSceneBtn = getElement('suggestSceneButton');
    const deepDiveBtn = getElement('deepDiveTriggerButton');

     if (typeof GameLogic !== 'undefined') {
         if (dilemmaBtn && GameLogic.handleElementalDilemmaClick) dilemmaBtn.addEventListener('click', GameLogic.handleElementalDilemmaClick);
         else if (dilemmaBtn) console.warn("Dilemma button found, but handler missing in GameLogic.");
         if (synergyBtn && GameLogic.handleExploreSynergyClick) synergyBtn.addEventListener('click', GameLogic.handleExploreSynergyClick);
         else if (synergyBtn) console.warn("Synergy button found, but handler missing in GameLogic.");
         if (suggestSceneBtn && GameLogic.handleSuggestSceneClick) suggestSceneBtn.addEventListener('click', GameLogic.handleSuggestSceneClick);
         else if (suggestSceneBtn) console.warn("Suggest Scene button found, but handler missing in GameLogic.");
         if (deepDiveBtn && GameLogic.showTapestryDeepDive) deepDiveBtn.addEventListener('click', GameLogic.showTapestryDeepDive);
         else if (deepDiveBtn) console.warn("Deep Dive button found, but handler missing in GameLogic.");
     } else { console.error("GameLogic not available for persona action button listeners."); }

    const suggestedSceneContainer = getElement('suggestedSceneContent');
     if (suggestedSceneContainer) {
         suggestedSceneContainer.addEventListener('click', (event) => {
            const meditateButton = event.target.closest('.button[data-scene-id]');
             if (meditateButton && !meditateButton.disabled) {
                 if (typeof GameLogic !== 'undefined' && GameLogic.handleMeditateScene) {
                      GameLogic.handleMeditateScene(event);
                 } else { console.error("GameLogic or handleMeditateScene not available."); }
             }
         });
     } else { console.warn("Suggested scene content container not found."); }
}


// --- Setup Workshop Screen Listeners (Keep as is, but adjust onboarding triggers) ---
function setupWorkshopScreenListeners() {
    const workshopScreen = getElement('workshopScreen');
    if (!workshopScreen) return;
    const screenId = workshopScreen.id; // 'workshopScreen'

    const researchBench = getElement('workshop-research-area');
    if (researchBench) {
        researchBench.addEventListener('click', (event) => {
            const buttonCard = event.target.closest('.initial-discovery-element.clickable');
            if (buttonCard?.dataset.elementKey) {
                const isFreeClick = buttonCard.dataset.isFree === 'true';
                 if (typeof GameLogic !== 'undefined' && GameLogic.handleResearchClick) {
                      // Research was step 3 in original plan, now step 1 in Workshop Tour
                      triggerActionAndCheckOnboarding(
                          () => GameLogic.handleResearchClick({ currentTarget: buttonCard, isFree: isFreeClick }),
                          'conductResearch',
                          1, // Phase 1 of Workshop Tour
                          null,
                          screenId
                      );
                 } else { console.error("GameLogic or handleResearchClick not available."); }
            }
        });
    } else { console.warn("Workshop research bench area not found."); }

    const freeResearchBtn = getElement('freeResearchButtonWorkshop');
    const seekGuidanceBtn = getElement('seekGuidanceButtonWorkshop');
    if (freeResearchBtn) {
        freeResearchBtn.addEventListener('click', () => {
             if (typeof GameLogic !== 'undefined' && GameLogic.handleFreeResearchClick) {
                 // Free research also fulfills Phase 1 of Workshop Tour
                 triggerActionAndCheckOnboarding(
                     GameLogic.handleFreeResearchClick,
                     'conductResearch',
                     1, // Phase 1 of Workshop Tour
                     null,
                     screenId
                 );
             } else { console.error("GameLogic or handleFreeResearchClick not available."); }
        });
    } else { console.warn("Free research button not found."); }
    if (seekGuidanceBtn) {
        seekGuidanceBtn.addEventListener('click', () => {
             if (typeof GameLogic !== 'undefined' && GameLogic.triggerGuidedReflection) {
                  // Seeking Guidance was part of old Phase 7, now potentially later
                  // Not currently part of a defined split tour, so no onboarding check here.
                  GameLogic.triggerGuidedReflection();
                  // triggerActionAndCheckOnboarding(GameLogic.triggerGuidedReflection, 'triggerReflection', 7);
             } else { console.error("GameLogic or triggerGuidedReflection not available."); }
        });
    } else { console.warn("Seek guidance button not found."); }

    const libraryArea = getElement('workshop-library-area');
    const controls = getElement('grimoire-controls-workshop');
    const shelves = getElement('grimoire-shelves-workshop');
    const grid = getElement('grimoire-grid-workshop');

    if (!libraryArea || !controls || !shelves || !grid) {
        console.error("One or more Workshop library components not found.");
        return;
    }

    const searchInput = getElement('grimoireSearchInputWorkshop');
    if (searchInput) {
         const debouncedRefresh = Utils.debounce(() => UI.refreshGrimoireDisplay(), 350);
         searchInput.addEventListener('input', debouncedRefresh);
    }
    controls.addEventListener('change', (event) => {
         if (event.target.tagName === 'SELECT') { UI.refreshGrimoireDisplay(); }
    });

    shelves.addEventListener('click', (event) => {
        const shelf = event.target.closest('.grimoire-shelf');
        if (shelf?.dataset.categoryId) {
            shelves.querySelectorAll('.grimoire-shelf').forEach(s => s.classList.remove('active-shelf'));
            shelf.classList.add('active-shelf');
            UI.refreshGrimoireDisplay({ filterCategory: shelf.dataset.categoryId });
        }
    });

    grid.addEventListener('click', (event) => {
        const focusButton = event.target.closest('.card-focus-button');
        const sellButton = event.target.closest('.card-sell-button');
        const card = event.target.closest('.concept-card');

        if (focusButton?.dataset.conceptId && !focusButton.disabled) {
            event.stopPropagation();
            const conceptId = parseInt(focusButton.dataset.conceptId);
             if (typeof GameLogic !== 'undefined' && GameLogic.handleCardFocusToggle) {
                  // Marking focus was old Phase 5, now Phase 2 of Workshop Tour
                  triggerActionAndCheckOnboarding(() => {
                      if(GameLogic.handleCardFocusToggle(conceptId)) {
                          const isFocused = State.getFocusedConcepts().has(conceptId);
                          focusButton.classList.toggle('marked', isFocused);
                          focusButton.innerHTML = `<i class="fas ${isFocused ? 'fa-star' : 'fa-regular fa-star'}"></i>`;
                          focusButton.title = isFocused ? 'Remove Focus' : 'Mark as Focus';
                      }
                  }, 'markFocus', 2, null, screenId); // Phase 2 of Workshop Tour
             } else { console.error("GameLogic or handleCardFocusToggle not available."); }
        } else if (sellButton?.dataset.conceptId) {
             event.stopPropagation();
              if (typeof GameLogic !== 'undefined' && GameLogic.handleSellConcept) {
                   GameLogic.handleSellConcept(event);
              } else { console.error("GameLogic or handleSellConcept not available."); }
        } else if (card?.dataset.conceptId && !event.target.closest('button')) {
             UI.showConceptDetailPopup(parseInt(card.dataset.conceptId));
        }
    });

    // Drag & Drop Logic (Keep as is, but adjust onboarding check for drop)
    let draggedCardId = null;
    grid.addEventListener('dragstart', (event) => {
        const card = event.target.closest('.concept-card[draggable="true"]');
        if (card?.dataset.conceptId) {
            draggedCardId = parseInt(card.dataset.conceptId);
            event.dataTransfer.effectAllowed = 'move';
            try { event.dataTransfer.setData('text/plain', draggedCardId.toString()); } catch (e) { try { event.dataTransfer.setData('Text', draggedCardId.toString()); } catch (e2) { console.error("Drag/Drop setData failed:", e2); } }
            setTimeout(() => card.classList.add('dragging'), 0);
        } else { event.preventDefault(); }
    });
    grid.addEventListener('dragend', (event) => {
        const card = event.target.closest('.concept-card');
        if (card) { card.classList.remove('dragging'); }
        draggedCardId = null;
        shelves?.querySelectorAll('.grimoire-shelf').forEach(shelf => shelf.classList.remove('drag-over'));
    });

    shelves.addEventListener('dragover', (event) => {
        event.preventDefault();
        const shelf = event.target.closest('.grimoire-shelf:not(.show-all-shelf)');
        if (shelf) {
            event.dataTransfer.dropEffect = 'move';
            shelves.querySelectorAll('.grimoire-shelf').forEach(s => s.classList.remove('drag-over'));
            shelf.classList.add('drag-over');
        } else {
            event.dataTransfer.dropEffect = 'none';
            shelves.querySelectorAll('.grimoire-shelf').forEach(s => s.classList.remove('drag-over'));
        }
    });
    shelves.addEventListener('dragleave', (event) => {
        const shelf = event.target.closest('.grimoire-shelf');
         if (shelf && !shelf.contains(event.relatedTarget)) { shelf.classList.remove('drag-over'); }
         else if (event.currentTarget === shelves && !shelves.contains(event.relatedTarget)){
             shelves.querySelectorAll('.grimoire-shelf').forEach(s => s.classList.remove('drag-over'));
         }
    });
    shelves.addEventListener('drop', (event) => {
        event.preventDefault();
        shelves.querySelectorAll('.grimoire-shelf').forEach(shelf => shelf.classList.remove('drag-over'));
        const shelf = event.target.closest('.grimoire-shelf:not(.show-all-shelf)');
        let droppedCardIdFromData = null;
        try { droppedCardIdFromData = parseInt(event.dataTransfer.getData('text/plain')); } catch (e) { try { droppedCardIdFromData = parseInt(event.dataTransfer.getData('Text')); } catch (e2) { /* ignore */ } }
        const finalCardId = !isNaN(droppedCardIdFromData) ? droppedCardIdFromData : draggedCardId;
        if (shelf?.dataset.categoryId && finalCardId !== null) {
            const categoryId = shelf.dataset.categoryId;
            if (typeof GameLogic !== 'undefined' && GameLogic.handleCategorizeCard) {
                 // Categorizing was part of old Phase 5, now maybe Phase 2 of Workshop Tour? Check task definitions.
                 // Assuming categorize fulfills the 'markFocus' goal conceptually for now.
                 triggerActionAndCheckOnboarding(
                     () => GameLogic.handleCategorizeCard(finalCardId, categoryId),
                     'categorizeCard', // Action name
                     2, // Phase 2 of Workshop Tour (assuming it covers general library interaction)
                     null,
                     screenId
                 );
            } else { console.error("GameLogic or handleCategorizeCard not available."); }
        } else { console.log("Drop failed: Invalid target shelf or missing card ID."); }
        draggedCardId = null;
    });
}

// --- Setup Repository Listeners (Keep as is, adjust onboarding trigger) ---
function setupRepositoryListeners() {
    const repoContainer = getElement('repositoryScreen');
    if (!repoContainer) return;
    const screenId = repoContainer.id; // 'repositoryScreen'

    repoContainer.addEventListener('click', (event) => {
        const meditateButton = event.target.closest('.button[data-scene-id]');
        const experimentButton = event.target.closest('.button[data-experiment-id]');

        if (typeof GameLogic !== 'undefined') {
             if (meditateButton && !meditateButton.disabled && GameLogic.handleMeditateScene) {
                 // Meditating on scene was part of old Phase 8, now maybe Phase 1 of Repo Tour?
                 triggerActionAndCheckOnboarding(
                     () => GameLogic.handleMeditateScene(event),
                     'meditateScene',
                     1, // Phase 1 of Repository Tour (assuming)
                     null,
                     screenId
                  );
             }
             else if (experimentButton && !experimentButton.disabled && GameLogic.handleAttemptExperiment) {
                  // Attempting experiment was part of old Phase 8, now maybe Phase 1 of Repo Tour?
                  triggerActionAndCheckOnboarding(
                      () => GameLogic.handleAttemptExperiment(event),
                      'attemptExperiment',
                      1, // Phase 1 of Repository Tour (assuming)
                      null,
                      screenId
                  );
             }
        } else { console.error("GameLogic not available for repository button listeners."); }
    });
}

// --- Setup Popup Interaction Listeners (Keep as is) ---
function setupPopupInteractionListeners() {
    document.querySelectorAll('.popup:not(.onboarding-popup) .close-button').forEach(button => {
         button.addEventListener('click', UI.hidePopups);
    });
    setupConceptDetailPopupListeners();
    setupResearchPopupListeners();
    setupReflectionPopupListeners();
    setupDeepDivePopupListeners();
    setupDilemmaPopupListeners();
}

// --- Setup Concept Detail Listeners (Keep as is, adjust onboarding trigger) ---
function setupConceptDetailPopupListeners() {
    const popup = getElement('conceptDetailPopup');
    if (!popup) { console.warn("Concept detail popup not found."); return; }
    const screenId = document.querySelector('.screen.current')?.id || 'workshopScreen'; // Assume workshop if unknown

    const addBtn = getElement('addToGrimoireButton');
    const focusBtn = getElement('markAsFocusButton');
    const saveNoteBtn = getElement('saveMyNoteButton');
    const loreContent = getElement('popupLoreContent');
    const actionsContainer = popup.querySelector('.popup-actions');

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (typeof GameLogic !== 'undefined' && GameLogic.getCurrentPopupConceptId && GameLogic.addConceptToGrimoireById) {
                const conceptId = GameLogic.getCurrentPopupConceptId();
                if (conceptId !== null) {
                    // Adding to grimoire was old Phase 4, now Phase 2 of Workshop Tour (Keeping Concept)
                    triggerActionAndCheckOnboarding(
                        () => GameLogic.addConceptToGrimoireById(conceptId, addBtn),
                        'addToGrimoire',
                        2, // Phase 2 of Workshop Tour
                        null,
                        screenId
                    );
                }
            } else { console.error("GameLogic functions for AddToGrimoire not available."); }
        });
    } else { console.warn("Add to Grimoire button not found in popup."); }

    if (focusBtn) {
        focusBtn.addEventListener('click', () => {
             if (typeof GameLogic !== 'undefined' && GameLogic.handleToggleFocusConcept) {
                 // Marking focus was old Phase 5, now Phase 2 of Workshop Tour
                 triggerActionAndCheckOnboarding(
                     () => GameLogic.handleToggleFocusConcept(),
                     'markFocus',
                     2, // Phase 2 of Workshop Tour
                     null,
                     screenId
                 );
             } else { console.error("GameLogic function handleToggleFocusConcept not available."); }
        });
    } else { console.warn("Mark as Focus button not found in popup."); }

    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', () => {
             if (typeof GameLogic !== 'undefined' && GameLogic.handleSaveNote) {
                  GameLogic.handleSaveNote(); // Saving notes isn't usually an onboarding step
             } else { console.error("GameLogic function handleSaveNote not available."); }
        });
    } else { console.warn("Save Note button not found in popup."); }

    if (loreContent) {
        loreContent.addEventListener('click', (event) => {
            const button = event.target.closest('.unlock-lore-button');
            if (button?.dataset.conceptId && button.dataset.loreLevel && button.dataset.cost && !button.disabled) {
                 if (typeof GameLogic !== 'undefined' && GameLogic.handleUnlockLore) {
                      // Unlocking lore was old Phase 6, now maybe Phase 1 of Repository Tour?
                      triggerActionAndCheckOnboarding(
                          () => GameLogic.handleUnlockLore(parseInt(button.dataset.conceptId), parseInt(button.dataset.loreLevel), parseFloat(button.dataset.cost)),
                          'unlockLore',
                          1, // Phase 1 of Repository Tour (assuming)
                          null,
                          screenId
                      );
                 } else { console.error("GameLogic function handleUnlockLore not available."); }
            }
        });
    } else { console.warn("Lore content container not found in popup."); }

    if (actionsContainer) {
        actionsContainer.addEventListener('click', (event) => {
            const sellButton = event.target.closest('.popup-sell-button');
            if (sellButton?.dataset.conceptId) {
                 if (typeof GameLogic !== 'undefined' && GameLogic.handleSellConcept) {
                      GameLogic.handleSellConcept(event); // Selling isn't usually an onboarding step
                 } else { console.error("GameLogic function handleSellConcept not available."); }
            }
        });
    } else { console.warn("Popup actions container not found."); }
}

// --- Setup Research Popup Listeners (Keep as is, adjust onboarding trigger) ---
function setupResearchPopupListeners() {
    const popup = getElement('researchResultsPopup');
    if (!popup) { console.warn("Research results popup not found."); return; }
    const screenId = document.querySelector('.screen.current')?.id || 'workshopScreen'; // Assume workshop

    const closeBtn = getElement('closeResearchResultsPopupButton');
    const confirmBtn = getElement('confirmResearchChoicesButton');
    const contentArea = getElement('researchPopupContent');

    if (closeBtn) closeBtn.addEventListener('click', UI.hidePopups);
    else { console.warn("Research results close button not found."); }

    if (confirmBtn) confirmBtn.addEventListener('click', UI.hidePopups);
    else { console.warn("Research results confirm button not found."); }

    if (contentArea) {
        contentArea.addEventListener('click', (event) => {
            const actionButton = event.target.closest('.card-actions .button[data-action]');
            if (actionButton?.dataset.conceptId) {
                const conceptId = parseInt(actionButton.dataset.conceptId);
                const action = actionButton.dataset.action;
                 if (typeof GameLogic !== 'undefined' && GameLogic.handleResearchPopupChoice) {
                      // Choosing Keep was old Phase 4, now Phase 2 of Workshop Tour
                      if (action === 'keep') {
                          triggerActionAndCheckOnboarding(
                              () => GameLogic.handleResearchPopupChoice(conceptId, action),
                              'addToGrimoire', // Trigger action name
                              2, // Phase 2 of Workshop Tour
                              null,
                              screenId
                          );
                      } else {
                           GameLogic.handleResearchPopupChoice(conceptId, action); // Sell doesn't trigger onboarding
                      }
                 } else { console.error("GameLogic function handleResearchPopupChoice not available."); }
            }
        });
    } else { console.warn("Research popup content area not found."); }
}

// --- Setup Reflection Popup Listeners (Keep as is, adjust onboarding trigger) ---
function setupReflectionPopupListeners() {
    const popup = getElement('reflectionModal');
    if (!popup) { console.warn("Reflection modal not found."); return; }
    const screenId = document.querySelector('.screen.current')?.id || 'workshopScreen';

    const reflectionCheck = getElement('reflectionCheckbox');
    const confirmBtn = getElement('confirmReflectionButton');
    const nudgeCheck = getElement('scoreNudgeCheckbox');

    if (reflectionCheck && confirmBtn) {
        reflectionCheck.addEventListener('change', () => { confirmBtn.disabled = !reflectionCheck.checked; });
        confirmBtn.addEventListener('click', () => {
             if (typeof GameLogic !== 'undefined' && GameLogic.handleConfirmReflection) {
                  // Completing reflection was old Phase 7, now maybe Phase 1 of Repository Tour?
                  triggerActionAndCheckOnboarding(
                      () => GameLogic.handleConfirmReflection(nudgeCheck?.checked || false),
                      'completeReflection',
                      1, // Phase 1 of Repository Tour (assuming)
                      null,
                      screenId
                  );
             } else { console.error("GameLogic function handleConfirmReflection not available."); }
        });
    } else { console.warn("Reflection checkbox or confirm button not found."); }
}

// --- Setup Deep Dive Listeners (Keep as is) ---
function setupDeepDivePopupListeners() {
    const popup = getElement('tapestryDeepDiveModal');
    if (!popup) { console.warn("Deep dive modal not found."); return; }

    const nodesContainer = getElement('deepDiveAnalysisNodes');
    const detailContent = getElement('deepDiveDetailContent');

    if (nodesContainer) {
        nodesContainer.addEventListener('click', (event) => {
            const nodeButton = event.target.closest('.aspect-node[data-node-id]');
            if (nodeButton && !nodeButton.disabled) {
                 const nodeId = nodeButton.dataset.nodeId;
                 if (typeof GameLogic !== 'undefined') {
                      if (nodeId === 'contemplation' && GameLogic.handleContemplationNodeClick) GameLogic.handleContemplationNodeClick();
                      else if (GameLogic.handleDeepDiveNodeClick) GameLogic.handleDeepDiveNodeClick(nodeId);
                      else console.error("GameLogic deep dive handlers not available.");
                 } else { console.error("GameLogic not available for deep dive node clicks."); }
            }
        });
    } else { console.warn("Deep dive nodes container not found."); }

     if (detailContent) {
         detailContent.addEventListener('click', (event) => {
             const completeButton = event.target.closest('#completeContemplationBtn');
             if (completeButton) {
                 if (typeof GameLogic !== 'undefined' && GameLogic.handleCompleteContemplation) GameLogic.handleCompleteContemplation();
                 else console.error("GameLogic function handleCompleteContemplation not available.");
             }
         });
     } else { console.warn("Deep dive detail content area not found."); }
}

// --- Setup Dilemma Listeners (Keep as is) ---
function setupDilemmaPopupListeners() {
    const popup = getElement('dilemmaModal');
    if (!popup) { console.warn("Dilemma modal not found."); return; }

    const confirmBtn = getElement('confirmDilemmaButton');
    if (confirmBtn) {
         if (typeof GameLogic !== 'undefined' && GameLogic.handleConfirmDilemma) confirmBtn.addEventListener('click', GameLogic.handleConfirmDilemma);
         else console.error("GameLogic function handleConfirmDilemma not available.");
    } else { console.warn("Dilemma confirm button not found."); }

    const slider = getElement('dilemmaSlider');
    const valueDisplay = getElement('dilemmaSliderValueDisplay');
    const minLabel = getElement('dilemmaSliderMinLabel');
    const maxLabel = getElement('dilemmaSliderMaxLabel');
    if (slider && valueDisplay && minLabel && maxLabel) {
        slider.addEventListener('input', () => {
            const val = parseFloat(slider.value); let leaning;
            if (val < 1.5) leaning = `Strongly ${minLabel.textContent}`;
            else if (val < 4.5) leaning = `Towards ${minLabel.textContent}`;
            else if (val > 8.5) leaning = `Strongly ${maxLabel.textContent}`;
            else if (val > 5.5) leaning = `Towards ${maxLabel.textContent}`;
            else leaning = "Balanced";
            valueDisplay.textContent = leaning;
        });
    } else { console.warn("Dilemma slider components missing."); }
}

// --- Setup Onboarding Listeners (Adjusted for new button logic) ---
function setupOnboardingListeners() {
    const overlay = getElement('onboardingOverlay');
    if (!overlay) return;

    const nextBtn = getElement('onboardingNextButton');
    const prevBtn = getElement('onboardingPrevButton');
    const skipBtn = getElement('onboardingSkipButton');
    const skipTourBtn = getElement('skipTourBtn'); // The new button INSIDE the popup

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const currentPhase = State.getOnboardingPhase();
            const currentScreenId = document.querySelector('.screen.current')?.id || 'welcomeScreen';
            const tasks = getTourForScreen(currentScreenId);
            const maxPhaseForThisTour = tasks.length;

            if (currentPhase >= maxPhaseForThisTour) {
                 console.log(`Onboarding: Tour for screen '${currentScreenId}' completed.`);
                 // Decide what happens next - e.g., hide, or maybe auto-trigger next tour?
                 UI.hideOnboarding();
                 // If finishing Welcome Tour (max phase = 3), maybe prompt to go to Workshop?
                 if (currentScreenId === 'welcomeScreen' && currentPhase === 3) {
                     // Option 1: Just hide and let user navigate
                     // Option 2: Show temporary message
                     UI.showTemporaryMessage("Orientation Part 1 Complete! Click Workshop in the menu.", 4000);
                     // Option 3: Auto-navigate and start next tour (more intrusive)
                     // State.setOnboardingPhase(1); // Reset for next tour
                     // UI.showScreen('workshopScreen');
                     // UI.showOnboarding(1, 'workshopScreen');
                 } else if (currentScreenId === 'workshopScreen' && currentPhase === 2) { // Max phase for workshop is 2
                     UI.showTemporaryMessage("Workshop Tour Complete! Explore the Repository next.", 4000);
                 } else if (currentScreenId === 'repositoryScreen' && currentPhase === 1) { // Max phase for repo is 1 (for now)
                      UI.showTemporaryMessage("Repository Tour Complete! You're all set.", 4000);
                      State.markOnboardingComplete(); // Mark fully done after last tour
                 } else {
                      State.markOnboardingComplete(); // Default to marking complete if unsure
                 }

            } else {
                 const nextPhase = State.advanceOnboardingPhase();
                 UI.showOnboarding(nextPhase, currentScreenId); // Show next step in current tour
            }
        });
    } else { console.warn("Onboarding next button not found."); }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const currentPhase = State.getOnboardingPhase();
             const currentScreenId = document.querySelector('.screen.current')?.id || 'welcomeScreen';
            if (currentPhase > 1) {
                 const prevPhase = currentPhase - 1;
                 State.updateOnboardingPhase(prevPhase); // Use the specific setter
                 UI.showOnboarding(prevPhase, currentScreenId);
            }
        });
    } else { console.warn("Onboarding previous button not found."); }

    // Skip button for the *entire* onboarding process
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to skip the entire orientation? You can restart individual tours using the (?) help button.")) {
                 console.log("Onboarding: Skipping ALL tours...");
                 State.setOnboardingPhase(99); // Mark as skipped
                 UI.hideOnboarding();
                 // Go to appropriate screen based on questionnaire status
                 UI.showScreen(State.getState().questionnaireCompleted ? 'personaScreen' : 'welcomeScreen');
            }
        });
    } else { console.warn("Onboarding skip button (main) not found."); }

    // Skip button for the *current* tour only
     if (skipTourBtn) {
         skipTourBtn.addEventListener('click', () => {
             console.log("Onboarding: Skipping current tour...");
             State.setOnboardingPhase(99); // Mark as skipped/complete
             UI.hideOnboarding();
             // User remains on the current screen
         });
     } else { console.warn("Skip Tour button not found in onboarding popup."); }
}


// --- App Start ---
document.addEventListener('DOMContentLoaded', initializeApp);

console.log("main.js loaded successfully. (Enhanced v4.1 + Drawer - Fixed v2 + Onboarding Tours)");
// --- END OF FILE main.js ---
