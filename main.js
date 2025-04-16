// js/main.js - Application Entry Point & Event Listener Setup (Enhanced v4)

import * as UI from './js/ui.js';
import * as State from './js/state.js';
import * as GameLogic from './js/gameLogic.js';
import * as Utils from './js/utils.js';
import * as Config from './js/config.js';

console.log("main.js loading... (Enhanced v4 - Onboarding, Debounce)");

// --- Initialization ---
function initializeApp() {
    console.log("Initializing Persona Alchemy Lab (v4)...");
    const loaded = State.loadGameState();
    UI.setupInitialUI(); // Sets initial screen, hides nav if needed etc.

    // Determine starting screen based on loaded state and onboarding status
    const currentState = State.getState();
    const onboardingPhase = currentState.onboardingPhase;
    const onboardingComplete = currentState.onboardingComplete;

    if (Config.ONBOARDING_ENABLED && !onboardingComplete && onboardingPhase > 0 && onboardingPhase <= Config.MAX_ONBOARDING_PHASE) {
        console.log(`Resuming onboarding at phase ${onboardingPhase}.`);
        UI.showOnboarding(onboardingPhase);
    } else if (loaded && currentState.questionnaireCompleted) {
        console.log("Loaded completed state. Showing Persona screen.");
        UI.showScreen('personaScreen');
        GameLogic.checkForDailyLogin();
        UI.populateGrimoireFilters();
        UI.displayMilestones();
        UI.displayDailyRituals();
        UI.updateInsightDisplays();
        UI.updateFocusSlotsDisplay();
        UI.updateGrimoireCounter();
        UI.displayInsightLog(); // Display log on load if on persona screen
    } else if (loaded && !currentState.questionnaireCompleted && currentState.currentElementIndex > -1) {
        console.log("Loaded incomplete questionnaire state. Resuming questionnaire.");
        UI.showScreen('questionnaireScreen');
    } else {
        console.log("No saved state or starting fresh. Showing welcome screen.");
        UI.showScreen('welcomeScreen');
        // If onboarding is enabled and hasn't started, trigger phase 1
        if (Config.ONBOARDING_ENABLED && !onboardingComplete && onboardingPhase === 1) {
            UI.showOnboarding(1);
        }
    }

    // Setup General Event Listeners
    setupGlobalEventListeners();
    setupNavigationListeners();
    setupPopupInteractionListeners();
    setupQuestionnaireListeners();
    setupPersonaScreenListeners();
    setupWorkshopScreenListeners();
    setupRepositoryListeners();
    setupOnboardingListeners(); // Add listeners for onboarding controls

    // Initial UI updates based on loaded/initial state
    UI.updateInsightDisplays();
    UI.updateFocusSlotsDisplay();
    UI.updateGrimoireCounter(); // Update counter on nav bar

    console.log("Initialization complete.");
}

// --- Helper to potentially advance onboarding after an action ---
function triggerActionAndCheckOnboarding(actionFn, actionName, targetPhase, actionValue = null) {
    console.log(`Triggering action: ${actionName} for onboarding phase ${targetPhase}`);
    if (actionFn) {
        actionFn(); // Execute the primary action
    }

    const currentPhase = State.getOnboardingPhase();
    const onboardingComplete = State.isOnboardingComplete();

    if (Config.ONBOARDING_ENABLED && !onboardingComplete && currentPhase === targetPhase) {
        // Check if the specific action condition is met (if provided)
        const meetsCondition = !State.getState().onboardingTasks[targetPhase -1]?.track.value ||
                                State.getState().onboardingTasks[targetPhase -1]?.track.value === actionValue;

        if (meetsCondition) {
             console.log(`Action '${actionName}' matches condition for phase ${targetPhase}. Advancing onboarding.`);
             State.advanceOnboardingPhase();
             UI.showOnboarding(State.getOnboardingPhase()); // Show next phase
        } else {
             console.log(`Action '${actionName}' triggered, but condition not met for phase ${targetPhase}.`);
        }
    }
}


// --- Event Listener Setup Functions ---

function setupGlobalEventListeners() {
    // Settings Button
    const settingsBtn = document.getElementById('settingsButton');
    if (settingsBtn) settingsBtn.addEventListener('click', UI.showSettings);
    else console.warn("Settings button not found.");

    // Settings Popup Buttons
    const closeSettingsBtn = document.getElementById('closeSettingsPopupButton');
    const forceSaveBtn = document.getElementById('forceSaveButton');
    const resetBtn = document.getElementById('resetAppButton');
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', UI.hidePopups);
    if (forceSaveBtn) forceSaveBtn.addEventListener('click', () => { State.saveGameState(true); UI.showTemporaryMessage("Game Saved!", 1500); }); // Force immediate save
    if (resetBtn) resetBtn.addEventListener('click', () => {
        if (confirm("Are you SURE you want to reset all progress? This cannot be undone!")) {
            GameLogic.clearPopupState();
            State.clearGameState(); // This now handles resetting onboarding state too
            initializeApp(); // Re-initialize the app state and UI
            UI.hidePopups();
            UI.showTemporaryMessage("Progress Reset.", 2000);
        }
    });

    // Milestone Alert Close
    const closeMilestoneBtn = document.getElementById('closeMilestoneAlertButton');
    if (closeMilestoneBtn) closeMilestoneBtn.addEventListener('click', UI.hideMilestoneAlert);

    // Overlay Click to Close Popups
    const overlay = document.getElementById('popupOverlay');
    if (overlay) {
        overlay.addEventListener('click', (event) => {
            // Prevent closing if onboarding overlay is active
            if (event.target.id !== 'onboardingOverlay') {
                 UI.hidePopups();
            }
        });
    }


     // Info Popup Close/Confirm
    const closeInfoBtn = document.getElementById('closeInfoPopupButton');
    const confirmInfoBtn = document.getElementById('confirmInfoPopupButton');
    if (closeInfoBtn) closeInfoBtn.addEventListener('click', UI.hidePopups);
    if (confirmInfoBtn) confirmInfoBtn.addEventListener('click', UI.hidePopups);

    // Add Insight Button
    const addInsightBtn = document.getElementById('addInsightButton');
    if(addInsightBtn) addInsightBtn.addEventListener('click', GameLogic.handleInsightBoostClick);

    // Listen for clicks on info icons globally
    document.body.addEventListener('click', (event) => {
        const target = event.target.closest('.info-icon');
        if (target?.title) {
            event.preventDefault();
            UI.showInfoPopup(target.title);
        }
    });
}

function setupNavigationListeners() {
    // Main Navigation
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        button.removeEventListener('click', handleNavClick); // Prevent duplicates
        button.addEventListener('click', handleNavClick);
    });

    // Welcome Screen Buttons
    const startBtn = document.getElementById('startGuidedButton');
    const loadBtn = document.getElementById('loadButton');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const currentPhase = State.getOnboardingPhase();
            const onboardingComplete = State.isOnboardingComplete();
             // Start questionnaire only if onboarding is done or disabled
             if (!Config.ONBOARDING_ENABLED || onboardingComplete || currentPhase > Config.MAX_ONBOARDING_PHASE) {
                 UI.initializeQuestionnaireUI();
                 UI.showScreen('questionnaireScreen');
             } else {
                  // If onboarding isn't finished, just ensure the current phase is shown
                  UI.showOnboarding(currentPhase);
                  UI.showTemporaryMessage("Let's finish the quick orientation first!", Config.TOAST_DURATION);
             }
        });
    }
    if (loadBtn) loadBtn.addEventListener('click', () => {
        if (State.loadGameState()) { // loadGameState now returns true/false
             initializeApp(); // Re-run initialization to show correct screen based on loaded state
             UI.showTemporaryMessage("Session Loaded.", 2000);
        } else {
            UI.showTemporaryMessage("Failed to load session.", 3000);
        }
    });
}

function handleNavClick(event) {
    const button = event.target.closest('.nav-button');
    if (!button) return;

    const targetScreen = button.dataset.target;
    const isPostQuestionnaire = State.getState().questionnaireCompleted;
    const canNavigate = isPostQuestionnaire || ['welcomeScreen', 'questionnaireScreen'].includes(targetScreen) || button.id === 'settingsButton';

    if (targetScreen && targetScreen !== 'settingsButton' && canNavigate) {
         // Use the helper function to potentially advance onboarding
         triggerActionAndCheckOnboarding(() => UI.showScreen(targetScreen), 'showScreen', /* Phase target */ 1, /* Action value */ targetScreen);
          // Special check for workshop/grimoire screen for onboarding task 2
          if(targetScreen === 'workshopScreen') {
              triggerActionAndCheckOnboarding(null, 'showScreen', 2, targetScreen);
          }
         // Special check for repository screen for onboarding task 8
         if(targetScreen === 'repositoryScreen') {
              triggerActionAndCheckOnboarding(null, 'showScreen', 8, targetScreen);
         }

    } else if (targetScreen === 'settingsButton') {
        UI.showSettings(); // Settings handled globally, no onboarding check needed here
    } else if (!canNavigate) {
        console.log("Navigation blocked: Questionnaire not complete.");
        UI.showTemporaryMessage("Complete the Experimentation first!", 2500);
    } else {
         console.warn("Nav button clicked without target screen:", button);
    }
}

function setupQuestionnaireListeners() {
    const nextBtn = document.getElementById('nextElementButton');
    const prevBtn = document.getElementById('prevElementButton');
    if (nextBtn) nextBtn.addEventListener('click', GameLogic.goToNextElement);
    if (prevBtn) prevBtn.addEventListener('click', GameLogic.goToPrevElement);
    // Input listeners added dynamically by UI.displayElementQuestions
}

function setupPersonaScreenListeners() {
    // View Toggle Buttons
    const detailedViewBtn = document.getElementById('showDetailedViewBtn');
    const summaryViewBtn = document.getElementById('showSummaryViewBtn');
    const personaDetailedView = document.getElementById('personaDetailedView');
    const personaSummaryView = document.getElementById('personaSummaryView');
    if (detailedViewBtn && summaryViewBtn && personaDetailedView && personaSummaryView) {
        detailedViewBtn.addEventListener('click', () => UI.togglePersonaView(true));
        summaryViewBtn.addEventListener('click', () => UI.togglePersonaView(false));
    }

    // Element Details Delegation (for unlock buttons)
    const personaElementsContainer = document.getElementById('personaElementDetails');
    if (personaElementsContainer) {
        personaElementsContainer.addEventListener('click', (event) => {
            const unlockButton = event.target.closest('.unlock-button');
            if (unlockButton) {
                // Pass the action function to the helper
                triggerActionAndCheckOnboarding(() => GameLogic.handleUnlockLibraryLevel(event), 'unlockLibrary', 6);
            }
             const detailsToggle = event.target.closest('summary.element-detail-header');
             if (detailsToggle) {
                 // Optional: Add tracking if needed for onboarding specific element opens
             }
        });
    }

    // Focused Concepts Delegation (for opening detail popup)
    const focusedConceptsContainer = document.getElementById('focusedConceptsDisplay');
    if (focusedConceptsContainer) {
        focusedConceptsContainer.addEventListener('click', (event) => {
            const targetItem = event.target.closest('.focus-concept-item');
            if (targetItem?.dataset.conceptId) { UI.showConceptDetailPopup(parseInt(targetItem.dataset.conceptId)); }
        });
    }

     // Insight Log Toggle (Example: Toggle on click, can be enhanced)
     const insightLogContainer = document.getElementById('insightLogContainer');
     if (insightLogContainer) {
         const header = document.querySelector('.persona-elements-detailed h2:nth-of-type(2)'); // Target "Resources" header
         if (header) {
             header.style.cursor = 'pointer';
             header.title = 'Click to toggle Insight Log';
             header.addEventListener('click', () => {
                 insightLogContainer.classList.toggle('log-hidden');
             });
             // Initially hide it
             insightLogContainer.classList.add('log-hidden');
         }
     }

    // Action Buttons
    const dilemmaBtn = document.getElementById('elementalDilemmaButton');
    const synergyBtn = document.getElementById('exploreSynergyButton');
    const suggestSceneBtn = document.getElementById('suggestSceneButton');
    if (dilemmaBtn) dilemmaBtn.addEventListener('click', GameLogic.handleElementalDilemmaClick);
    if (synergyBtn) synergyBtn.addEventListener('click', GameLogic.handleExploreSynergyClick);
    if (suggestSceneBtn) suggestSceneBtn.addEventListener('click', GameLogic.handleSuggestSceneClick);

    // Suggested Scene Container (for meditate button)
    const suggestedSceneContainer = document.getElementById('suggestedSceneContent');
     if (suggestedSceneContainer) {
         suggestedSceneContainer.addEventListener('click', (event) => {
            const meditateButton = event.target.closest('.button[data-scene-id]');
             if (meditateButton && !meditateButton.disabled) { GameLogic.handleMeditateScene(event); }
         });
     }
}

function setupWorkshopScreenListeners() {
    const workshopScreen = document.getElementById('workshopScreen');
    if (!workshopScreen) return;

    // --- Research & Daily Actions ---
    const researchButtonsContainer = document.getElementById('element-research-buttons');
    if (researchButtonsContainer) {
        researchButtonsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.initial-discovery-element.clickable');
            if (button?.dataset.elementKey) {
                const freeResearchLeft = State.getInitialFreeResearchRemaining();
                const isFreeClick = freeResearchLeft > 0;
                 // Use helper for onboarding check
                 triggerActionAndCheckOnboarding(() => GameLogic.handleResearchClick({ currentTarget: button, isFree: isFreeClick }), 'conductResearch', 3);
            }
        });
    }
    const freeResearchBtn = document.getElementById('freeResearchButtonWorkshop');
    const seekGuidanceBtn = document.getElementById('seekGuidanceButtonWorkshop');
    if (freeResearchBtn) {
        freeResearchBtn.addEventListener('click', () => {
            // No specific onboarding check needed here, usually covered by daily login or research action
            GameLogic.handleFreeResearchClick();
        });
    }
    if (seekGuidanceBtn) {
        seekGuidanceBtn.addEventListener('click', () => {
             // Use helper for onboarding check
            triggerActionAndCheckOnboarding(GameLogic.triggerGuidedReflection, 'triggerReflection', 7);
        });
    }

    // --- Library Area ---
    const controls = document.getElementById('grimoire-controls-workshop');
    const shelves = document.getElementById('grimoire-shelves-workshop');
    const grid = document.getElementById('grimoire-grid-workshop');

    // Filter/Sort Controls
    if (controls) {
        // Debounce search input
        const searchInput = document.getElementById('grimoireSearchInputWorkshop');
        if (searchInput) {
             const debouncedRefresh = Utils.debounce(() => UI.refreshGrimoireDisplay(), 300);
             searchInput.addEventListener('input', debouncedRefresh);
        }
        // Refresh immediately on other control changes
        controls.addEventListener('change', (event) => {
             if (event.target.tagName === 'SELECT') { UI.refreshGrimoireDisplay(); }
        });
    }

    // Shelf Clicks (Filtering & Onboarding Check)
    if (shelves) {
        shelves.addEventListener('click', (event) => {
            const shelf = event.target.closest('.grimoire-shelf');
            if (shelf?.dataset.categoryId) {
                shelves.querySelectorAll('.grimoire-shelf').forEach(s => s.classList.remove('active-shelf'));
                shelf.classList.add('active-shelf');
                UI.refreshGrimoireDisplay({ filterCategory: shelf.dataset.categoryId });
                 // Onboarding: Check if a card was moved (handled in drop event)
                 // This click itself doesn't fulfill the task, but drop does
            }
        });
    }

    // Grimoire Grid Interactions (Details, Focus, Sell, Drag/Drop) - Delegated
    if (grid) {
        // Click Actions
        grid.addEventListener('click', (event) => {
            const focusButton = event.target.closest('.card-focus-button');
            const sellButton = event.target.closest('.card-sell-button');
            const card = event.target.closest('.concept-card');

            if (focusButton?.dataset.conceptId && !focusButton.disabled) {
                event.stopPropagation();
                const conceptId = parseInt(focusButton.dataset.conceptId);
                 // Use helper for onboarding check
                 triggerActionAndCheckOnboarding(() => GameLogic.handleCardFocusToggle(conceptId), 'markFocus', 5);
                 // Update button state immediately
                 const isFocused = State.getFocusedConcepts().has(conceptId);
                 focusButton.classList.toggle('marked', isFocused);
                 focusButton.innerHTML = `<i class="fas ${isFocused ? 'fa-star' : 'fa-regular fa-star'}"></i>`;
                 focusButton.title = isFocused ? 'Remove Focus' : 'Mark as Focus';
            } else if (sellButton?.dataset.conceptId) {
                 event.stopPropagation();
                 GameLogic.handleSellConcept(event);
            } else if (card?.dataset.conceptId && !focusButton && !sellButton) {
                 UI.showConceptDetailPopup(parseInt(card.dataset.conceptId));
            }
        });

        // Drag and Drop
        let draggedCardId = null;
        grid.addEventListener('dragstart', (event) => { /* Unchanged */
            const card = event.target.closest('.concept-card[draggable="true"]');
            if (card?.dataset.conceptId) {
                draggedCardId = parseInt(card.dataset.conceptId);
                event.dataTransfer.effectAllowed = 'move';
                try { event.dataTransfer.setData('text/plain', draggedCardId.toString()); } catch (e) { event.dataTransfer.setData('Text', draggedCardId.toString()); }
                setTimeout(() => card.classList.add('dragging'), 0);
            } else { event.preventDefault(); }
        });
        grid.addEventListener('dragend', (event) => { /* Unchanged */
            const card = event.target.closest('.concept-card');
            if (card) { card.classList.remove('dragging'); }
            draggedCardId = null;
            shelves?.querySelectorAll('.grimoire-shelf').forEach(shelf => shelf.classList.remove('drag-over'));
        });
        if (shelves) {
            shelves.addEventListener('dragover', (event) => { /* Unchanged */
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
            shelves.addEventListener('dragleave', (event) => { /* Unchanged */
                const shelf = event.target.closest('.grimoire-shelf');
                 if (shelf && !shelf.contains(event.relatedTarget)) { shelf.classList.remove('drag-over'); }
                 if (event.currentTarget === shelves && !shelves.contains(event.relatedTarget)){ shelves.querySelectorAll('.grimoire-shelf').forEach(s => s.classList.remove('drag-over')); }
            });
            shelves.addEventListener('drop', (event) => { /* Modified */
                event.preventDefault();
                shelves.querySelectorAll('.grimoire-shelf').forEach(shelf => shelf.classList.remove('drag-over'));
                const shelf = event.target.closest('.grimoire-shelf:not(.show-all-shelf)');
                let droppedCardIdFromData = null;
                try { droppedCardIdFromData = parseInt(event.dataTransfer.getData('text/plain')); } catch (e) { droppedCardIdFromData = parseInt(event.dataTransfer.getData('Text')); }
                const finalCardId = !isNaN(droppedCardIdFromData) ? droppedCardIdFromData : draggedCardId;

                if (shelf?.dataset.categoryId && finalCardId) {
                    const categoryId = shelf.dataset.categoryId;
                    // Use onboarding helper
                    triggerActionAndCheckOnboarding(() => GameLogic.handleCategorizeCard(finalCardId, categoryId), 'categorizeCard', 5); // Check if this fulfills phase 5
                } else { console.log("Drop failed: Invalid target or missing card ID."); }
                draggedCardId = null;
            });
        }
    }
}

function setupRepositoryListeners() {
    const repoContainer = document.getElementById('repositoryScreen');
    if (!repoContainer) return;

    repoContainer.addEventListener('click', (event) => {
        const meditateButton = event.target.closest('.button[data-scene-id]');
        const experimentButton = event.target.closest('.button[data-experiment-id]');

        if (meditateButton && !meditateButton.disabled) { GameLogic.handleMeditateScene(event); }
        else if (experimentButton && !experimentButton.disabled) { GameLogic.handleAttemptExperiment(event); }
    });
}

function setupPopupInteractionListeners() {
    // Close Buttons (All Popups except Onboarding)
    document.querySelectorAll('.popup:not(.onboarding-popup) .close-button').forEach(button => {
         button.addEventListener('click', UI.hidePopups);
    });

    // Specific Popups
    setupConceptDetailPopupListeners();
    setupResearchPopupListeners();
    setupReflectionPopupListeners();
    setupDeepDivePopupListeners();
    setupDilemmaPopupListeners();
}

function setupConceptDetailPopupListeners() {
    const addBtn = document.getElementById('addToGrimoireButton');
    const focusBtn = document.getElementById('markAsFocusButton');
    const saveNoteBtn = document.getElementById('saveMyNoteButton');
    const loreContent = document.getElementById('popupLoreContent');
    const sellBtnContainer = document.querySelector('#conceptDetailPopup .popup-actions');

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const conceptId = GameLogic.getCurrentPopupConceptId();
            if (conceptId !== null) {
                // Pass action to helper for onboarding check
                triggerActionAndCheckOnboarding(() => GameLogic.addConceptToGrimoireById(conceptId, addBtn), 'addToGrimoire', 4);
            }
        });
    }
    if (focusBtn) {
        focusBtn.addEventListener('click', () => {
            const conceptId = GameLogic.getCurrentPopupConceptId();
             // Pass action to helper for onboarding check
            triggerActionAndCheckOnboarding(() => GameLogic.handleToggleFocusConcept(), 'markFocus', 5);
        });
    }
    if (saveNoteBtn) saveNoteBtn.addEventListener('click', GameLogic.handleSaveNote);
    if (loreContent) {
        loreContent.addEventListener('click', (event) => { /* Unchanged */
            const button = event.target.closest('.unlock-lore-button');
            if (button?.dataset.conceptId && button.dataset.loreLevel && button.dataset.cost && !button.disabled) {
                GameLogic.handleUnlockLore(parseInt(button.dataset.conceptId), parseInt(button.dataset.loreLevel), parseFloat(button.dataset.cost));
            }
        });
    }
    if (sellBtnContainer) {
        sellBtnContainer.addEventListener('click', (event) => { /* Unchanged */
            const sellButton = event.target.closest('.popup-sell-button');
            if (sellButton?.dataset.conceptId) { GameLogic.handleSellConcept(event); }
        });
    }
}

function setupResearchPopupListeners() {
    const closeResearchBtn = document.getElementById('closeResearchResultsPopupButton');
    if (closeResearchBtn) closeResearchBtn.addEventListener('click', UI.hidePopups);
    const confirmResearchBtn = document.getElementById('confirmResearchChoicesButton');
    if (confirmResearchBtn) confirmResearchBtn.addEventListener('click', UI.hidePopups);

    const researchPopupContentEl = document.getElementById('researchPopupContent');
    if (researchPopupContentEl) {
        researchPopupContentEl.addEventListener('click', (event) => {
            const actionButton = event.target.closest('.card-actions .button');
            if (actionButton?.dataset.conceptId && actionButton.dataset.action) {
                const conceptId = parseInt(actionButton.dataset.conceptId);
                const action = actionButton.dataset.action;
                const isKeepAction = action === 'keep';

                 // Wrap the action for onboarding check if it's a 'keep' action
                 if (isKeepAction) {
                     triggerActionAndCheckOnboarding(() => GameLogic.handleResearchPopupChoice(conceptId, action), 'addToGrimoire', 4);
                 } else {
                      GameLogic.handleResearchPopupChoice(conceptId, action); // Handle sell directly
                 }
            }
        });
    }
}

function setupReflectionPopupListeners() {
    const reflectionCheck = document.getElementById('reflectionCheckbox');
    const confirmReflectionBtn = document.getElementById('confirmReflectionButton');
    const nudgeCheck = document.getElementById('scoreNudgeCheckbox');
    if (reflectionCheck && confirmReflectionBtn) {
        reflectionCheck.addEventListener('change', () => { confirmReflectionBtn.disabled = !reflectionCheck.checked; });
        confirmReflectionBtn.addEventListener('click', () => {
             // Wrap for onboarding check
             triggerActionAndCheckOnboarding(() => GameLogic.handleConfirmReflection(nudgeCheck?.checked || false), 'completeReflection', 7);
        });
    }
}

function setupDeepDivePopupListeners() {
    const deepDiveNodes = document.getElementById('deepDiveAnalysisNodes');
    if (deepDiveNodes) {
        deepDiveNodes.addEventListener('click', (event) => {
            const nodeButton = event.target.closest('.aspect-node');
            if (nodeButton?.dataset.nodeId && !nodeButton.disabled) {
                 if (nodeButton.dataset.nodeId === 'contemplation') { GameLogic.handleContemplationNodeClick(); }
                 else { GameLogic.handleDeepDiveNodeClick(nodeButton.dataset.nodeId); }
            }
        });
    }
     // Listener for completing contemplation task added dynamically in UI.displayContemplationTask
}

function setupDilemmaPopupListeners() {
    const confirmDilemmaBtn = document.getElementById('confirmDilemmaButton');
    if (confirmDilemmaBtn) { confirmDilemmaBtn.addEventListener('click', GameLogic.handleConfirmDilemma); }
}

function setupOnboardingListeners() {
    const nextBtn = document.getElementById('onboardingNextButton');
    const prevBtn = document.getElementById('onboardingPrevButton');
    const skipBtn = document.getElementById('onboardingSkipButton');

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const nextPhase = State.advanceOnboardingPhase();
            UI.showOnboarding(nextPhase);
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const currentPhase = State.getOnboardingPhase();
            if (currentPhase > 1) {
                 State.updateOnboardingPhase(currentPhase - 1); // Need a direct setter in state.js
                 UI.showOnboarding(currentPhase - 1);
            }
        });
    }
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to skip the rest of the orientation?")) {
                 State.markOnboardingComplete();
                 UI.hideOnboarding();
                 // Ensure main UI is correctly shown after skipping
                 initializeApp(); // Re-run init to show appropriate screen
            }
        });
    }
}


// --- App Start ---
document.addEventListener('DOMContentLoaded', initializeApp);

console.log("main.js loaded. (Enhanced v4)");
// --- END OF FILE main.js ---
