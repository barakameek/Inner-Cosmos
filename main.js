// --- START OF COMPLETE main.js (Workshop v3 - Popup Results) ---

import * as UI from './js/ui.js';
import * as State from './js/state.js';
import * as GameLogic from './js/gameLogic.js';
import * as Utils from './js/utils.js';
import * as Config from './js/config.js';

console.log("main.js loading... (Workshop v3 - Popup Results)");

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
        UI.displayMilestones(); // Display milestones now in Repository
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
    setupRepositoryListeners(); // Add listeners for repo (includes rituals now)

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
        button.removeEventListener('click', handleNavClick);
        button.addEventListener('click', handleNavClick);
    });

    // Welcome Screen Buttons
    const startBtn = document.getElementById('startGuidedButton');
    const loadBtn = document.getElementById('loadButton');
    if (startBtn) startBtn.addEventListener('click', () => { UI.initializeQuestionnaireUI(); UI.showScreen('questionnaireScreen'); });
    if (loadBtn) loadBtn.addEventListener('click', () => {
        if (State.loadGameState()) {
            if (State.getState().questionnaireCompleted) {
                 UI.showScreen('personaScreen');
            } else if (State.getState().currentElementIndex > -1) {
                 UI.showScreen('questionnaireScreen');
            } else {
                UI.showScreen('welcomeScreen');
            }
            GameLogic.checkForDailyLogin();
            UI.populateGrimoireFilters();
            UI.displayMilestones(); // Setup milestones display
            UI.displayDailyRituals(); // Setup rituals display
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
    const isPostQuestionnaire = State.getState().questionnaireCompleted;
    const canNavigate = isPostQuestionnaire || ['welcomeScreen', 'questionnaireScreen'].includes(targetScreen) || event.target.id === 'settingsButton';

    if (targetScreen && targetScreen !== 'settingsButton' && canNavigate) {
        UI.showScreen(targetScreen);
    } else if (targetScreen === 'settingsButton') {
        // Settings handled globally
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
    // Input listeners added dynamically
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
    const suggestedSceneContainer = document.getElementById('suggestedSceneContent');

    if (detailedViewBtn && summaryViewBtn && personaDetailedView && personaSummaryView) {
        detailedViewBtn.addEventListener('click', () => {
            personaDetailedView.classList.remove('hidden'); personaDetailedView.classList.add('current');
            personaSummaryView.classList.add('hidden'); personaSummaryView.classList.remove('current');
            detailedViewBtn.classList.add('active'); summaryViewBtn.classList.remove('active');
            GameLogic.displayPersonaScreenLogic();
        });
        summaryViewBtn.addEventListener('click', () => {
            personaSummaryView.classList.remove('hidden'); personaSummaryView.classList.add('current');
            personaDetailedView.classList.add('hidden'); personaDetailedView.classList.remove('current');
            summaryViewBtn.classList.add('active'); detailedViewBtn.classList.remove('active');
            UI.displayPersonaSummary();
        });
    }

    if (personaElementsContainer) {
        personaElementsContainer.addEventListener('click', (event) => {
            const unlockButton = event.target.closest('.unlock-button');
            if (unlockButton) { GameLogic.handleUnlockLibraryLevel(event); }
        });
    }

    if (focusedConceptsContainer) {
        focusedConceptsContainer.addEventListener('click', (event) => {
            const targetItem = event.target.closest('.focus-concept-item');
            if (targetItem?.dataset.conceptId) { UI.showConceptDetailPopup(parseInt(targetItem.dataset.conceptId)); }
        });
    }

    if (dilemmaBtn) dilemmaBtn.addEventListener('click', GameLogic.handleElementalDilemmaClick);
    if (synergyBtn) synergyBtn.addEventListener('click', GameLogic.handleExploreSynergyClick);
    if (suggestSceneBtn) suggestSceneBtn.addEventListener('click', GameLogic.handleSuggestSceneClick);

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

    // --- Research Buttons Area ---
    const researchButtonsContainer = document.getElementById('element-research-buttons');
    if (researchButtonsContainer) {
        researchButtonsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.initial-discovery-element.clickable');
            if (button?.dataset.elementKey) {
                 const freeResearchLeft = State.getInitialFreeResearchRemaining();
                 const isFreeClick = freeResearchLeft > 0;
                GameLogic.handleResearchClick({ currentTarget: button, isFree: isFreeClick });
            }
        });
    }

    // --- Daily Actions Area ---
    const freeResearchBtn = document.getElementById('freeResearchButtonWorkshop');
    const seekGuidanceBtn = document.getElementById('seekGuidanceButtonWorkshop');
    if (freeResearchBtn) freeResearchBtn.addEventListener('click', GameLogic.handleFreeResearchClick);
    if (seekGuidanceBtn) seekGuidanceBtn.addEventListener('click', GameLogic.triggerGuidedReflection);

    // --- Library Area ---
    const controls = document.getElementById('grimoire-controls-workshop');
    const shelves = document.getElementById('grimoire-shelves-workshop');
    const grid = document.getElementById('grimoire-grid-workshop');

    // Filter/Sort Controls
    if (controls) {
        controls.addEventListener('change', () => UI.refreshGrimoireDisplay());
        const searchInput = document.getElementById('grimoireSearchInputWorkshop');
        if (searchInput) { searchInput.addEventListener('input', () => UI.refreshGrimoireDisplay()); }
    }

    // Shelf Clicks (Filtering)
    if (shelves) {
        shelves.addEventListener('click', (event) => {
            const shelf = event.target.closest('.grimoire-shelf');
            if (shelf?.dataset.categoryId) {
                shelves.querySelectorAll('.grimoire-shelf').forEach(s => s.classList.remove('active-shelf'));
                shelf.classList.add('active-shelf');
                UI.refreshGrimoireDisplay({ filterCategory: shelf.dataset.categoryId });
            }
        });
    }

    // Grimoire Grid Interactions (Details, Focus, Sell) - Delegated
    if (grid) {
        grid.addEventListener('click', (event) => {
            const focusButton = event.target.closest('.card-focus-button');
            const sellButton = event.target.closest('.card-sell-button');
            const card = event.target.closest('.concept-card');

            if (focusButton?.dataset.conceptId && !focusButton.disabled) {
                event.stopPropagation();
                const conceptId = parseInt(focusButton.dataset.conceptId);
                GameLogic.handleCardFocusToggle(conceptId);
                 const isFocused = State.getFocusedConcepts().has(conceptId); // Update button state immediately
                 focusButton.classList.toggle('marked', isFocused);
                 focusButton.innerHTML = `<i class="fas ${isFocused ? 'fa-star' : 'fa-regular fa-star'}"></i>`;
                 focusButton.title = isFocused ? 'Remove Focus' : 'Mark as Focus';
            } else if (sellButton?.dataset.conceptId) {
                 event.stopPropagation();
                 GameLogic.handleSellConcept(event); // Sell from grimoire context
            } else if (card?.dataset.conceptId && !focusButton && !sellButton) {
                 UI.showConceptDetailPopup(parseInt(card.dataset.conceptId));
            }
        });

        // --- Drag and Drop Listeners for Grimoire ---
        let draggedCardId = null;
        grid.addEventListener('dragstart', (event) => {
            const card = event.target.closest('.concept-card[draggable="true"]');
            if (card?.dataset.conceptId) {
                draggedCardId = parseInt(card.dataset.conceptId);
                event.dataTransfer.effectAllowed = 'move';
                try { event.dataTransfer.setData('text/plain', draggedCardId.toString()); } catch (e) { event.dataTransfer.setData('Text', draggedCardId.toString()); }
                setTimeout(() => card.classList.add('dragging'), 0);
                console.log(`Drag Start: Card ID ${draggedCardId}`);
            } else { event.preventDefault(); }
        });
        grid.addEventListener('dragend', (event) => {
            const card = event.target.closest('.concept-card');
            if (card) { card.classList.remove('dragging'); }
            draggedCardId = null;
            shelves?.querySelectorAll('.grimoire-shelf').forEach(shelf => shelf.classList.remove('drag-over'));
            console.log("Drag End");
        });
        if (shelves) {
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
                 if (event.currentTarget === shelves && !shelves.contains(event.relatedTarget)){ shelves.querySelectorAll('.grimoire-shelf').forEach(s => s.classList.remove('drag-over')); }
            });
            shelves.addEventListener('drop', (event) => {
                event.preventDefault();
                shelves.querySelectorAll('.grimoire-shelf').forEach(shelf => shelf.classList.remove('drag-over'));
                const shelf = event.target.closest('.grimoire-shelf:not(.show-all-shelf)');
                let droppedCardIdFromData = null;
                try { droppedCardIdFromData = parseInt(event.dataTransfer.getData('text/plain')); } catch (e) { droppedCardIdFromData = parseInt(event.dataTransfer.getData('Text')); }
                const finalCardId = !isNaN(droppedCardIdFromData) ? droppedCardIdFromData : draggedCardId;
                if (shelf?.dataset.categoryId && finalCardId) {
                    GameLogic.handleCategorizeCard(finalCardId, shelf.dataset.categoryId);
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
    // Close Buttons (All Popups)
    document.querySelectorAll('.popup .close-button').forEach(button => {
         button.addEventListener('click', UI.hidePopups);
    });
    // Specific Close Button for Research Popup (might have disabled state logic)
    const closeResearchBtn = document.getElementById('closeResearchResultsPopupButton');
    if(closeResearchBtn) closeResearchBtn.addEventListener('click', UI.hidePopups);
    // Optional Confirm button for Research Popup
    const confirmResearchBtn = document.getElementById('confirmResearchChoicesButton');
    if(confirmResearchBtn) confirmResearchBtn.addEventListener('click', UI.hidePopups);


    // Concept Detail Popup Actions
    const addBtn = document.getElementById('addToGrimoireButton');
    const focusBtn = document.getElementById('markAsFocusButton');
    const saveNoteBtn = document.getElementById('saveMyNoteButton');
    const loreContent = document.getElementById('popupLoreContent');
    const sellBtnContainer = document.querySelector('#conceptDetailPopup .popup-actions');

    if (addBtn) addBtn.addEventListener('click', () => {
        const conceptId = GameLogic.getCurrentPopupConceptId();
        if (conceptId !== null) GameLogic.addConceptToGrimoireById(conceptId, addBtn);
    });
    if (focusBtn) focusBtn.addEventListener('click', GameLogic.handleToggleFocusConcept);
    if (saveNoteBtn) saveNoteBtn.addEventListener('click', GameLogic.handleSaveNote);
    if (loreContent) { // Delegate listener for unlock buttons
        loreContent.addEventListener('click', (event) => {
            const button = event.target.closest('.unlock-lore-button');
            if (button?.dataset.conceptId && button.dataset.loreLevel && button.dataset.cost && !button.disabled) {
                GameLogic.handleUnlockLore(parseInt(button.dataset.conceptId), parseInt(button.dataset.loreLevel), parseFloat(button.dataset.cost));
            }
        });
    }
     if (sellBtnContainer) { // Delegate listener for sell button added dynamically
         sellBtnContainer.addEventListener('click', (event) => {
             const sellButton = event.target.closest('.popup-sell-button');
             if (sellButton?.dataset.conceptId) { GameLogic.handleSellConcept(event); }
         });
     }

    // Reflection Modal Interaction
    const reflectionCheck = document.getElementById('reflectionCheckbox');
    const confirmReflectionBtn = document.getElementById('confirmReflectionButton');
    const nudgeCheck = document.getElementById('scoreNudgeCheckbox');
    if (reflectionCheck && confirmReflectionBtn) {
        reflectionCheck.addEventListener('change', () => { confirmReflectionBtn.disabled = !reflectionCheck.checked; });
        confirmReflectionBtn.addEventListener('click', () => { GameLogic.handleConfirmReflection(nudgeCheck?.checked || false); });
    }

    // Research Results Popup Actions (Keep/Sell) - Delegated
    const researchPopupContentEl = document.getElementById('researchPopupContent');
    if (researchPopupContentEl) {
        researchPopupContentEl.addEventListener('click', (event) => {
            const actionButton = event.target.closest('.card-actions .button');
            if (actionButton?.dataset.conceptId && actionButton.dataset.action) {
                 const conceptId = parseInt(actionButton.dataset.conceptId);
                 const action = actionButton.dataset.action;
                 GameLogic.handleResearchPopupChoice(conceptId, action); // Let GameLogic handle the keep/sell decision
            }
        });
    }

    // Tapestry Deep Dive Modal
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
    // Listener for completing contemplation task added dynamically

    // Elemental Dilemma Modal
    const confirmDilemmaBtn = document.getElementById('confirmDilemmaButton');
    if (confirmDilemmaBtn) { confirmDilemmaBtn.addEventListener('click', GameLogic.handleConfirmDilemma); }
}


// --- App Start ---
document.addEventListener('DOMContentLoaded', initializeApp);

console.log("main.js loaded. (Workshop v3 - Popup Results)");
// --- END OF COMPLETE main.js ---
