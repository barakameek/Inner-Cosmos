// --- START OF COMPLETE main.js (Verified Imports - Attempt 3) ---

// Correct imports assuming main.js is in the ROOT directory
// and config.js, utils.js, state.js, ui.js, gameLogic.js are inside the 'js' folder.
import * as UI from './js/ui.js';
import * as State from './js/state.js';
import * as GameLogic from './js/gameLogic.js';
import * as Utils from './js/utils.js';
import * as Config from './js/config.js';

console.log("main.js loading... (Workshop Screen integration) - Verifying imports.");

// --- Initialization ---
function initializeApp() {
    console.log("Initializing Persona Alchemy Lab...");
    const loaded = State.loadGameState();
    UI.setupInitialUI(); // Sets initial screen, hides nav if needed etc.

    if (loaded && State.getState().questionnaireCompleted) {
        console.log("Loaded completed state. Showing Persona screen.");
        UI.showScreen('personaScreen'); // Show persona screen if questionnaire already done
        GameLogic.checkForDailyLogin(); // Check daily login on load
        UI.populateGrimoireFilters(); // Populate filters even if not showing screen yet
        UI.displayMilestones();
        UI.updateInsightDisplays();
        UI.updateFocusSlotsDisplay();
        UI.updateGrimoireCounter();
    } else if (loaded && !State.getState().questionnaireCompleted && State.getState().currentElementIndex > -1) {
        console.log("Loaded incomplete questionnaire state. Resuming questionnaire.");
        UI.showScreen('questionnaireScreen'); // Resume questionnaire
    } else {
        console.log("No saved state or starting fresh. Showing welcome screen.");
        UI.showScreen('welcomeScreen'); // Default to welcome
    }

    // Setup General Event Listeners
    setupGlobalEventListeners();
    setupNavigationListeners();
    setupPopupInteractionListeners();
    setupQuestionnaireListeners(); // Keep these active
    setupPersonaScreenListeners(); // Keep these active
    setupWorkshopScreenListeners(); // Add listeners for the new screen
    setupRepositoryListeners(); // Keep these active

    // Initial UI updates based on loaded/initial state
    UI.updateInsightDisplays();
    UI.updateFocusSlotsDisplay();
    UI.updateGrimoireCounter(); // Update counter on nav bar

    console.log("Initialization complete.");
}

// --- Event Listener Setup Functions ---

function setupGlobalEventListeners() {
    // Settings Button
    const settingsBtn = document.getElementById('settingsButton');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', UI.showSettings);
    } else { console.warn("Settings button not found."); }

    // Settings Popup Buttons
    const closeSettingsBtn = document.getElementById('closeSettingsPopupButton');
    const forceSaveBtn = document.getElementById('forceSaveButton');
    const resetBtn = document.getElementById('resetAppButton');
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', UI.hidePopups);
    if (forceSaveBtn) forceSaveBtn.addEventListener('click', () => { State.saveGameState(); UI.showTemporaryMessage("Game Saved!", 1500); });
    if (resetBtn) resetBtn.addEventListener('click', () => {
        if (confirm("Are you SURE you want to reset all progress? This cannot be undone!")) {
            GameLogic.clearPopupState(); // Clear any lingering popup state
            State.clearGameState();
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
    if (overlay) overlay.addEventListener('click', UI.hidePopups);

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
        if (target && target.title) {
            event.preventDefault();
            const infoPopup = document.getElementById('infoPopup');
            const infoContent = document.getElementById('infoPopupContent');
            if (infoPopup && infoContent) {
                infoContent.textContent = target.title;
                infoPopup.classList.remove('hidden');
                const overlay = document.getElementById('popupOverlay');
                if (overlay) overlay.classList.remove('hidden');
            }
        }
    });
}

function setupNavigationListeners() {
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        // Ensure listener is only added once if this function is called multiple times
        button.removeEventListener('click', handleNavClick); // Remove previous listener
        button.addEventListener('click', handleNavClick); // Add new listener
    });

    // Welcome Screen Buttons
    const startBtn = document.getElementById('startGuidedButton');
    const loadBtn = document.getElementById('loadButton');
    if (startBtn) startBtn.addEventListener('click', () => { UI.initializeQuestionnaireUI(); UI.showScreen('questionnaireScreen'); });
    if (loadBtn) loadBtn.addEventListener('click', () => {
        if (State.loadGameState()) {
            // Determine the correct screen to show after load
            if (State.getState().questionnaireCompleted) {
                 UI.showScreen('personaScreen');
            } else if (State.getState().currentElementIndex > -1) {
                 UI.showScreen('questionnaireScreen');
            } else {
                UI.showScreen('welcomeScreen'); // Fallback if something is odd
            }
            GameLogic.checkForDailyLogin();
            UI.populateGrimoireFilters();
            UI.displayMilestones();
            UI.updateInsightDisplays();
            UI.updateFocusSlotsDisplay();
            UI.updateGrimoireCounter();
            UI.showTemporaryMessage("Session Loaded.", 2000);
        } else {
            UI.showTemporaryMessage("Failed to load session.", 3000);
        }
    });
}

function handleNavClick(event) {
    const targetScreen = event.target.dataset.target;
    // Allow navigation even if the button might be technically hidden by flow
    // if the state indicates post-questionnaire (e.g., after loading a saved game)
    const isPostQuestionnaire = State.getState().questionnaireCompleted;
    const canNavigate = isPostQuestionnaire || ['welcomeScreen', 'questionnaireScreen'].includes(targetScreen) || event.target.id === 'settingsButton';

    if (targetScreen && targetScreen !== 'settingsButton' && canNavigate) {
        UI.showScreen(targetScreen);
    } else if (targetScreen === 'settingsButton') {
        // Settings button has its own handler in setupGlobalEventListeners
    } else if (!canNavigate) {
        console.log("Navigation blocked: Questionnaire not complete.");
        UI.showTemporaryMessage("Complete the Experimentation first!", 2500);
    } else {
         console.warn("Nav button clicked without target screen:", event.target);
    }
}


function setupQuestionnaireListeners() {
    const nextBtn = document.getElementById('nextElementButton');
    const prevBtn = document.getElementById('prevElementButton');
    if (nextBtn) nextBtn.addEventListener('click', GameLogic.goToNextElement);
    if (prevBtn) prevBtn.addEventListener('click', GameLogic.goToPrevElement);
    // Input listeners are added dynamically in UI.displayElementQuestions
}

function setupPersonaScreenListeners() {
    const detailedViewBtn = document.getElementById('showDetailedViewBtn');
    const summaryViewBtn = document.getElementById('showSummaryViewBtn');
    const personaDetailedView = document.getElementById('personaDetailedView');
    const personaSummaryView = document.getElementById('personaSummaryView');
    const personaElementsContainer = document.getElementById('personaElementDetails');
    const focusedConceptsContainer = document.getElementById('focusedConceptsDisplay');
    const dilemmaBtn = document.getElementById('elementalDilemmaButton');
    const synergyBtn = document.getElementById('exploreSynergyButton');
    const suggestSceneBtn = document.getElementById('suggestSceneButton');
    const suggestedSceneContainer = document.getElementById('suggestedSceneContent'); // For meditate button listener


    if (detailedViewBtn && summaryViewBtn && personaDetailedView && personaSummaryView) {
        detailedViewBtn.addEventListener('click', () => {
            personaDetailedView.classList.remove('hidden'); personaDetailedView.classList.add('current');
            personaSummaryView.classList.add('hidden'); personaSummaryView.classList.remove('current');
            detailedViewBtn.classList.add('active'); summaryViewBtn.classList.remove('active');
            GameLogic.displayPersonaScreenLogic(); // Refresh detailed view content
        });
        summaryViewBtn.addEventListener('click', () => {
            personaSummaryView.classList.remove('hidden'); personaSummaryView.classList.add('current');
            personaDetailedView.classList.add('hidden'); personaDetailedView.classList.remove('current');
            summaryViewBtn.classList.add('active'); detailedViewBtn.classList.remove('active');
            UI.displayPersonaSummary(); // Render summary view content
        });
    }

    // Listener for unlocking deep dive levels (delegated)
    if (personaElementsContainer) {
        personaElementsContainer.addEventListener('click', (event) => {
            const unlockButton = event.target.closest('.unlock-button');
            if (unlockButton) {
                GameLogic.handleUnlockLibraryLevel(event);
            }
            // Handle toggling details open/closed
            const summary = event.target.closest('.element-detail-header');
            if (summary && summary.parentElement.tagName === 'DETAILS') {
                // Optional: Add logic if needed when details are toggled
            }
        });
    }

    // Listener for clicking focused concepts (delegated)
    if (focusedConceptsContainer) {
        focusedConceptsContainer.addEventListener('click', (event) => {
            const targetItem = event.target.closest('.focus-concept-item');
            if (targetItem && targetItem.dataset.conceptId) {
                UI.showConceptDetailPopup(parseInt(targetItem.dataset.conceptId));
            }
        });
    }

     // Persona Action Buttons
    if (dilemmaBtn) dilemmaBtn.addEventListener('click', GameLogic.handleElementalDilemmaClick);
    if (synergyBtn) synergyBtn.addEventListener('click', GameLogic.handleExploreSynergyClick);
    if (suggestSceneBtn) suggestSceneBtn.addEventListener('click', GameLogic.handleSuggestSceneClick);

     // Listener for Meditate button within the suggested scene output (delegated)
     if (suggestedSceneContainer) {
         suggestedSceneContainer.addEventListener('click', (event) => {
            const meditateButton = event.target.closest('.button[data-scene-id]');
             if (meditateButton && !meditateButton.disabled) {
                GameLogic.handleMeditateScene(event);
             }
         });
     }
}

function setupWorkshopScreenListeners() {
    const workshopScreen = document.getElementById('workshopScreen');
    if (!workshopScreen) return; // Don't setup if screen doesn't exist

    // --- Research Panel Listeners ---
    const researchButtonsContainer = document.getElementById('element-research-buttons');
    const freeResearchBtn = document.getElementById('freeResearchButtonWorkshop');
    const seekGuidanceBtn = document.getElementById('seekGuidanceButtonWorkshop');
    const researchResultsArea = document.getElementById('research-results-content');

    // Delegate listener for research element buttons
    if (researchButtonsContainer) {
        researchButtonsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.initial-discovery-element.clickable');
            if (button && button.dataset.elementKey) {
                 const freeResearchLeft = State.getInitialFreeResearchRemaining();
                 const isFreeClick = freeResearchLeft > 0;
                GameLogic.handleResearchClick({ currentTarget: button, isFree: isFreeClick });
            }
        });
    }

    if (freeResearchBtn) freeResearchBtn.addEventListener('click', GameLogic.handleFreeResearchClick);
    if (seekGuidanceBtn) seekGuidanceBtn.addEventListener('click', GameLogic.triggerGuidedReflection);

    // Delegate listeners for Add/Sell buttons in Research Results
    if (researchResultsArea) {
        researchResultsArea.addEventListener('click', (event) => {
            const addButton = event.target.closest('.add-button');
            const sellButton = event.target.closest('.sell-button');
            const cardElement = event.target.closest('.concept-card');

            if (addButton && addButton.dataset.conceptId) {
                const conceptId = parseInt(addButton.dataset.conceptId);
                GameLogic.addConceptToGrimoireById(conceptId, addButton); // Pass button for UI update
            } else if (sellButton && sellButton.dataset.conceptId) {
                GameLogic.handleSellConcept(event); // Use existing handler
            } else if (cardElement && cardElement.dataset.conceptId) {
                 // Click on card in results area should show popup
                 const conceptId = parseInt(cardElement.dataset.conceptId);
                 // Check if it was the Add or Sell button inside the card that was clicked
                 if (!addButton && !sellButton) {
                     UI.showConceptDetailPopup(conceptId);
                 }
            }
        });
    }

    // --- Grimoire Library Listeners ---
    const controls = document.getElementById('grimoire-controls-workshop');
    const shelves = document.getElementById('grimoire-shelves-workshop');
    const grid = document.getElementById('grimoire-grid-workshop');

    // Filter/Sort Controls
    if (controls) {
        controls.addEventListener('change', () => UI.refreshGrimoireDisplay());
        const searchInput = document.getElementById('grimoireSearchInputWorkshop');
        if (searchInput) {
            // Use 'input' for instant feedback, 'change' fires less often
            searchInput.addEventListener('input', () => UI.refreshGrimoireDisplay());
        }
    }

    // Shelf Clicks (for filtering)
    if (shelves) {
        shelves.addEventListener('click', (event) => {
            const shelf = event.target.closest('.grimoire-shelf');
            if (shelf && shelf.dataset.categoryId) {
                // Remove active class from all shelves
                shelves.querySelectorAll('.grimoire-shelf').forEach(s => s.classList.remove('active-shelf'));
                // Add active class to the clicked shelf
                shelf.classList.add('active-shelf');
                // Refresh the grid, filtering by the clicked category
                UI.refreshGrimoireDisplay({ filterCategory: shelf.dataset.categoryId });
            }
        });
    }

    // Grimoire Grid Card Interactions (Details, Focus, Sell) - Delegated
    if (grid) {
        grid.addEventListener('click', (event) => {
            const focusButton = event.target.closest('.card-focus-button');
            const sellButton = event.target.closest('.card-sell-button');
            const card = event.target.closest('.concept-card');

            if (focusButton && focusButton.dataset.conceptId && !focusButton.disabled) {
                event.stopPropagation(); // Prevent card click handler from firing too
                const conceptId = parseInt(focusButton.dataset.conceptId);
                GameLogic.handleCardFocusToggle(conceptId);
                // Update button visuals immediately (optional, UI.refresh might cover it)
                 const isFocused = State.getFocusedConcepts().has(conceptId);
                 focusButton.classList.toggle('marked', isFocused);
                 focusButton.innerHTML = `<i class="fas ${isFocused ? 'fa-star' : 'fa-regular fa-star'}"></i>`;
                 focusButton.title = isFocused ? 'Remove Focus' : 'Mark as Focus';
            } else if (sellButton && sellButton.dataset.conceptId) {
                 event.stopPropagation(); // Prevent card click handler from firing too
                 GameLogic.handleSellConcept(event);
            } else if (card && card.dataset.conceptId) {
                // Only trigger if not clicking a button inside the card
                if(!focusButton && !sellButton) {
                     const conceptId = parseInt(card.dataset.conceptId);
                     UI.showConceptDetailPopup(conceptId);
                }
            }
        });

        // --- Drag and Drop Listeners for Grimoire ---
        let draggedCardId = null;

        // Listener on the grid for starting drag
        grid.addEventListener('dragstart', (event) => {
            const card = event.target.closest('.concept-card[draggable="true"]');
            if (card && card.dataset.conceptId) {
                draggedCardId = parseInt(card.dataset.conceptId);
                event.dataTransfer.effectAllowed = 'move';
                try { // Use try/catch for IE compatibility if needed, though text/plain is standard
                   event.dataTransfer.setData('text/plain', draggedCardId.toString());
                } catch (e) {
                   event.dataTransfer.setData('Text', draggedCardId.toString());
                }
                // Optional: Add dragging class for visual feedback
                setTimeout(() => card.classList.add('dragging'), 0);
                console.log(`Drag Start: Card ID ${draggedCardId}`);
            } else {
                event.preventDefault(); // Prevent dragging if not a valid card
            }
        });

        // Listener on the grid for ending drag (cleanup)
        grid.addEventListener('dragend', (event) => {
            const card = event.target.closest('.concept-card');
            if (card) {
                card.classList.remove('dragging');
            }
            draggedCardId = null;
             // Remove drag-over styles from all shelves
             shelves?.querySelectorAll('.grimoire-shelf').forEach(shelf => shelf.classList.remove('drag-over'));
            console.log("Drag End");
        });

        // Listeners on the shelves area for drop targets
        if (shelves) {
            shelves.addEventListener('dragover', (event) => {
                event.preventDefault(); // Necessary to allow drop
                const shelf = event.target.closest('.grimoire-shelf:not(.show-all-shelf)'); // Exclude "Show All"
                if (shelf) {
                    event.dataTransfer.dropEffect = 'move';
                     // Add visual feedback (only to the current target shelf)
                     shelves.querySelectorAll('.grimoire-shelf').forEach(s => s.classList.remove('drag-over'));
                     shelf.classList.add('drag-over');
                } else {
                     event.dataTransfer.dropEffect = 'none';
                     shelves.querySelectorAll('.grimoire-shelf').forEach(s => s.classList.remove('drag-over'));
                }
            });

            shelves.addEventListener('dragleave', (event) => {
                const shelf = event.target.closest('.grimoire-shelf');
                 if (shelf && !shelf.contains(event.relatedTarget)) { // Check if leaving the shelf element entirely
                     shelf.classList.remove('drag-over');
                 }
                 // If leaving the whole shelves container
                 if (event.currentTarget === shelves && !shelves.contains(event.relatedTarget)){
                     shelves.querySelectorAll('.grimoire-shelf').forEach(s => s.classList.remove('drag-over'));
                 }
            });

            shelves.addEventListener('drop', (event) => {
                event.preventDefault();
                 shelves.querySelectorAll('.grimoire-shelf').forEach(shelf => shelf.classList.remove('drag-over')); // Clean up visual feedback
                const shelf = event.target.closest('.grimoire-shelf:not(.show-all-shelf)');
                let droppedCardIdFromData = null;
                 try { // Try standard 'text/plain' first
                     droppedCardIdFromData = parseInt(event.dataTransfer.getData('text/plain'));
                 } catch (e) { // Fallback for older browsers/IE
                     droppedCardIdFromData = parseInt(event.dataTransfer.getData('Text'));
                 }
                 // Use the globally stored ID if dataTransfer fails (less reliable but backup)
                const finalCardId = !isNaN(droppedCardIdFromData) ? droppedCardIdFromData : draggedCardId;

                if (shelf && shelf.dataset.categoryId && finalCardId) {
                    const targetCategoryId = shelf.dataset.categoryId;
                    console.log(`Drop: Card ID ${finalCardId} onto Category ${targetCategoryId}`);
                    GameLogic.handleCategorizeCard(finalCardId, targetCategoryId);
                } else {
                     console.log("Drop occurred outside a valid shelf or Card ID missing.", { shelf, categoryId: shelf?.dataset.categoryId, finalCardId });
                 }
                 draggedCardId = null; // Reset dragged ID
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

        if (meditateButton && !meditateButton.disabled) {
            GameLogic.handleMeditateScene(event);
        } else if (experimentButton && !experimentButton.disabled) {
            GameLogic.handleAttemptExperiment(event);
        }
    });
}


function setupPopupInteractionListeners() {
    // Close Buttons
    const closePopupBtn = document.getElementById('closePopupButton');
    const closeReflectionBtn = document.getElementById('closeReflectionModalButton');
    const closeDeepDiveBtn = document.getElementById('closeDeepDiveButton');
    const closeDilemmaBtn = document.getElementById('closeDilemmaModalButton');
    if (closePopupBtn) closePopupBtn.addEventListener('click', UI.hidePopups);
    if (closeReflectionBtn) closeReflectionBtn.addEventListener('click', UI.hidePopups);
    if (closeDeepDiveBtn) closeDeepDiveBtn.addEventListener('click', UI.hidePopups);
    if (closeDilemmaBtn) closeDilemmaBtn.addEventListener('click', UI.hidePopups);


    // Concept Popup Actions
    const addBtn = document.getElementById('addToGrimoireButton');
    const focusBtn = document.getElementById('markAsFocusButton');
    const saveNoteBtn = document.getElementById('saveMyNoteButton');
    const loreContent = document.getElementById('popupLoreContent');
    const sellBtnContainer = document.querySelector('#conceptDetailPopup .popup-actions'); // Delegate sell button listener

    if (addBtn) addBtn.addEventListener('click', () => {
        const conceptId = GameLogic.getCurrentPopupConceptId();
        if (conceptId !== null) GameLogic.addConceptToGrimoireById(conceptId, addBtn);
    });
    if (focusBtn) focusBtn.addEventListener('click', GameLogic.handleToggleFocusConcept);
    if (saveNoteBtn) saveNoteBtn.addEventListener('click', GameLogic.handleSaveNote);
    if (loreContent) { // Delegate listener for unlock buttons
        loreContent.addEventListener('click', (event) => {
            const button = event.target.closest('.unlock-lore-button');
            if (button && !button.disabled && button.dataset.conceptId && button.dataset.loreLevel && button.dataset.cost) {
                const conceptId = parseInt(button.dataset.conceptId);
                const level = parseInt(button.dataset.loreLevel);
                const cost = parseFloat(button.dataset.cost);
                GameLogic.handleUnlockLore(conceptId, level, cost);
            }
        });
    }
     if (sellBtnContainer) { // Delegate listener for sell button added dynamically
         sellBtnContainer.addEventListener('click', (event) => {
             const sellButton = event.target.closest('.popup-sell-button');
             if (sellButton && sellButton.dataset.conceptId) {
                GameLogic.handleSellConcept(event);
             }
         });
     }

    // Reflection Modal Interaction
    const reflectionCheck = document.getElementById('reflectionCheckbox');
    const confirmReflectionBtn = document.getElementById('confirmReflectionButton');
    const nudgeCheck = document.getElementById('scoreNudgeCheckbox');
    if (reflectionCheck && confirmReflectionBtn) {
        reflectionCheck.addEventListener('change', () => {
            confirmReflectionBtn.disabled = !reflectionCheck.checked;
        });
        confirmReflectionBtn.addEventListener('click', () => {
            const nudge = nudgeCheck ? nudgeCheck.checked : false;
            GameLogic.handleConfirmReflection(nudge);
        });
    }

    // Tapestry Deep Dive Modal
    const deepDiveNodes = document.getElementById('deepDiveAnalysisNodes');
    if (deepDiveNodes) {
        deepDiveNodes.addEventListener('click', (event) => {
            const nodeButton = event.target.closest('.aspect-node');
            if (nodeButton && !nodeButton.disabled && nodeButton.dataset.nodeId) {
                const nodeId = nodeButton.dataset.nodeId;
                 if (nodeId === 'contemplation') {
                     GameLogic.handleContemplationNodeClick();
                 } else {
                     GameLogic.handleDeepDiveNodeClick(nodeId);
                 }
            }
        });
    }
    // Listener for completing contemplation task added dynamically in UI.displayContemplationTask

     // Elemental Dilemma Modal
     const confirmDilemmaBtn = document.getElementById('confirmDilemmaButton');
     if (confirmDilemmaBtn) {
         confirmDilemmaBtn.addEventListener('click', GameLogic.handleConfirmDilemma);
     }
}


// --- App Start ---
document.addEventListener('DOMContentLoaded', initializeApp);

console.log("main.js loaded.");
// --- END OF COMPLETE main.js ---
