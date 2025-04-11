// --- START OF FULL main.js ---

// js/main.js - Application Entry Point, Event Listeners, Initialization
import * as State from './state.js';
import * as UI from './ui.js';
import * as GameLogic from './gameLogic.js';
import * as Config from './config.js'; // Import Config
import { elementNames } from '../data.js'; // Assumes data.js is in parent directory

console.log("main.js loading...");

// --- Drag & Drop State ---
let draggedCardId = null; // Keep track of the card being dragged

// --- Initialization ---
function initializeApp() {
    console.log("Initializing Persona Alchemy Lab...");
    const loaded = State.loadGameState(); // Load state first

    // Initial UI setup based on loaded state
    UI.updateInsightDisplays();
    UI.updateGrimoireCounter();
    UI.populateGrimoireFilters();

    if (loaded) {
        console.log("Existing session data found.");
        const currentState = State.getState();
        if (currentState.questionnaireCompleted) {
             console.log("Continuing session post-questionnaire...");
             GameLogic.checkForDailyLogin(); // Check daily login *after* loading
             GameLogic.calculateTapestryNarrative(true); // Calculate initial narrative
             GameLogic.checkSynergyTensionStatus(); // Set initial synergy button state
             UI.updateFocusSlotsDisplay();
             const activeShelf = document.querySelector('.grimoire-shelf.active-shelf');
             const initialCategory = activeShelf ? activeShelf.dataset.categoryId : 'All';
             UI.refreshGrimoireDisplay({ filterCategory: initialCategory }); // Populate grimoire
             UI.showScreen('personaScreen'); // Start on Persona screen
             UI.hidePopups(); // Ensure no popups are open on load
        } else {
             console.log("Loaded state incomplete (Questionnaire not finished). Restarting questionnaire.");
             // Ensure index is 0 or start of questionnaire if needed
             if (currentState.currentElementIndex < 0 || currentState.currentElementIndex >= elementNames.length) {
                 State.updateElementIndex(0);
             }
             UI.initializeQuestionnaireUI();
             UI.showScreen('questionnaireScreen');
        }
        const loadBtn = document.getElementById('loadButton');
        if (loadBtn) loadBtn.classList.add('hidden'); // Hide load button after successful load
    } else {
        console.log("No valid saved session. Starting fresh.");
        UI.setupInitialUI(); // Setup for a fresh start (Welcome screen)
        // Clear any potentially invalid save data if loading failed but key existed
        if (localStorage.getItem(Config.SAVE_KEY)) {
             UI.showTemporaryMessage("Error loading previous session. Starting fresh.", 4000);
             localStorage.removeItem(Config.SAVE_KEY);
             const loadBtn = document.getElementById('loadButton');
             if(loadBtn) loadBtn.classList.add('hidden');
        }
    }
    console.log("Initialization complete. Attaching event listeners.");
    attachEventListeners();
    console.log("Application ready.");
}

// --- Event Listeners ---
function attachEventListeners() {
    console.log("Attaching event listeners...");

    // --- Element References ---
    const startButton = document.getElementById('startGuidedButton');
    const loadButton = document.getElementById('loadButton');
    const nextBtn = document.getElementById('nextElementButton');
    const prevBtn = document.getElementById('prevElementButton');
    const mainNavBar = document.getElementById('mainNavBar');
    const popupOverlay = document.getElementById('popupOverlay');
    const grimoireContent = document.getElementById('grimoireContent'); // Card Area
    const grimoireShelvesContainer = document.getElementById('grimoireShelvesContainer'); // Shelves Area
    const studyScreenElement = document.getElementById('studyScreen');
    const studyResearchDiscoveriesArea = document.getElementById('studyResearchDiscoveries');
    const repositoryContainer = document.getElementById('repositoryScreen');
    const settingsPopupElem = document.getElementById('settingsPopup');
    const personaScreenDiv = document.getElementById('personaScreen');
    const tapestryDeepDiveModalElem = document.getElementById('tapestryDeepDiveModal'); // Resonance Chamber
    const conceptDetailPopupElem = document.getElementById('conceptDetailPopup');
    const infoPopupElem = document.getElementById('infoPopup');
    const dilemmaModalElem = document.getElementById('dilemmaModal'); // Dilemma Modal

    // --- Welcome Screen ---
    if (startButton) startButton.addEventListener('click', () => {
        State.clearGameState(); // Clear state for a new game
        UI.initializeQuestionnaireUI();
        UI.showScreen('questionnaireScreen');
        if(loadButton) loadButton.classList.add('hidden'); // Hide load button on new game
    });
    if (loadButton) loadButton.addEventListener('click', initializeApp); // Reload logic handles load

    // --- Questionnaire Navigation ---
    if (nextBtn) nextBtn.addEventListener('click', GameLogic.goToNextElement);
    if (prevBtn) prevBtn.addEventListener('click', GameLogic.goToPrevElement);

    // --- Main Navigation & Popups (Delegation on Body/Nav) ---
    if (mainNavBar) { mainNavBar.addEventListener('click', (event) => { const button = event.target.closest('.nav-button'); if (!button) return; if (button.id === 'settingsButton') UI.showSettings(); else { const target = button.dataset.target; if (target) UI.showScreen(target); } }); }
    // Combined close button listener for all popups/modals
    document.body.addEventListener('click', (event) => {
        if (event.target.matches('#closePopupButton, #closeReflectionModalButton, #closeSettingsPopupButton, #closeDeepDiveButton, #closeDilemmaModalButton, #closeInfoPopupButton, #confirmInfoPopupButton')) {
             UI.hidePopups();
        }
        if (event.target.matches('#closeMilestoneAlertButton')) {
            UI.hideMilestoneAlert();
        }
    });
    if (popupOverlay) popupOverlay.addEventListener('click', UI.hidePopups);

    // --- Study Screen Actions (Delegation on Study Screen) ---
    if (studyScreenElement) {
        studyScreenElement.addEventListener('click', (event) => {
            const discoveryElement = event.target.closest('.initial-discovery-element.clickable');
            if (discoveryElement) {
                 const freeResearchLeft = State.getInitialFreeResearchRemaining();
                 const isFreeClick = freeResearchLeft > 0;
                 // Pass the event object or relevant data if handleResearchClick needs it
                 GameLogic.handleResearchClick({ currentTarget: discoveryElement, isFree: isFreeClick }); return;
            }
            if (event.target.matches('#freeResearchButton')) { GameLogic.handleFreeResearchClick(); return; }
            if (event.target.matches('#seekGuidanceButton')) { GameLogic.triggerGuidedReflection(); return; }
        });
    } else { console.error("Study Screen element not found for listener attachment."); }

    // --- Study Screen Research Discoveries Actions (Delegation) ---
    if (studyResearchDiscoveriesArea) {
        studyResearchDiscoveriesArea.addEventListener('click', (event) => {
             const actionButton = event.target.closest('button.add-button, button.sell-button');
             if (actionButton) {
                  event.stopPropagation(); // Prevent card click from firing
                  const conceptIdStr = actionButton.dataset.conceptId;
                  if (conceptIdStr) { const conceptId = parseInt(conceptIdStr); if (!isNaN(conceptId)) { if (actionButton.classList.contains('add-button')) { GameLogic.addConceptToGrimoireById(conceptId, actionButton); } else if (actionButton.classList.contains('sell-button')) { GameLogic.handleSellConcept(event); // Pass event to get context
                  } } else { console.error("Invalid conceptId:", conceptIdStr); } } else { console.error("Button missing conceptId:", actionButton); }
             } else { // Handle click on the card itself to show popup
                const card = event.target.closest('.concept-card');
                if (card) { const conceptIdStr = card.dataset.conceptId; if (conceptIdStr) { const conceptId = parseInt(conceptIdStr); if (!isNaN(conceptId)) { UI.showConceptDetailPopup(conceptId); } } }
             }
        });
    } else { console.error("#studyResearchDiscoveries element not found for listener attachment."); }


    // --- Grimoire Actions (Filters, Cards, Shelves - Delegated) ---
    const grimoireControlsElem = document.getElementById('grimoireControls');
    if (grimoireControlsElem) { // Filter/Sort Changes
        grimoireControlsElem.addEventListener('change', () => UI.refreshGrimoireDisplay());
        grimoireControlsElem.addEventListener('input', (event) => { // Live search
            if (event.target.id === 'grimoireSearchInput') UI.refreshGrimoireDisplay();
        });
    }
    if (grimoireContent) { // Card Area
        grimoireContent.addEventListener('click', (event) => { // Handle Button Clicks on Cards
            const targetButton = event.target.closest('button.card-sell-button, button.card-focus-button');
            if (!targetButton) return;
            event.stopPropagation(); // Prevent card click popup
            const conceptIdStr = targetButton.dataset.conceptId;
            if (conceptIdStr) { const conceptId = parseInt(conceptIdStr); if (!isNaN(conceptId)) { if (targetButton.classList.contains('card-sell-button')) { GameLogic.handleSellConcept(event); // Pass event for context
            } else if (targetButton.classList.contains('card-focus-button')) { GameLogic.handleCardFocusToggle(conceptId); } } }
        });
         grimoireContent.addEventListener('click', (event) => { // Handle Card Popup Click (if not a button)
             if (event.target.closest('button')) return; // Ignore button clicks handled above
             const card = event.target.closest('.concept-card');
             if (card) { const conceptId = parseInt(card.dataset.conceptId); if (!isNaN(conceptId)) { UI.showConceptDetailPopup(conceptId); } }
         });
         // Drag and Drop for Cards
         grimoireContent.addEventListener('dragstart', (event) => {
             const card = event.target.closest('.concept-card');
             if (card && card.draggable) { // Make sure it's a draggable card
                event.dataTransfer.setData('text/plain', card.dataset.conceptId);
                event.dataTransfer.effectAllowed = 'move';
                card.classList.add('dragging'); // Visual feedback
                draggedCardId = parseInt(card.dataset.conceptId);
                console.log(`Dragging card: ${draggedCardId}`);
             } else {
                event.preventDefault(); // Prevent dragging if not draggable
             }
         });
         grimoireContent.addEventListener('dragend', (event) => { // Cleanup after drag ends
             const card = event.target.closest('.concept-card');
             if (card) { card.classList.remove('dragging'); }
             draggedCardId = null; // Reset dragged ID
             // Remove hover effect from all shelves
             document.querySelectorAll('.grimoire-shelf.drag-over').forEach(shelf => shelf.classList.remove('drag-over'));
         });
    }
    if (grimoireShelvesContainer) { // Shelves Container
        grimoireShelvesContainer.addEventListener('click', (event) => { // Shelf Click (Filter)
            const shelf = event.target.closest('.grimoire-shelf');
            if (shelf) {
                const categoryId = shelf.classList.contains('show-all-shelf') ? 'All' : shelf.dataset.categoryId;
                if (categoryId) {
                    grimoireShelvesContainer.querySelectorAll('.grimoire-shelf').forEach(s => s.classList.remove('active-shelf'));
                    shelf.classList.add('active-shelf');
                    UI.refreshGrimoireDisplay({ filterCategory: categoryId });
                }
            }
        });
        // Drag and Drop for Shelves
        grimoireShelvesContainer.addEventListener('dragover', (event) => {
             event.preventDefault(); // Necessary to allow drop
             const shelf = event.target.closest('.grimoire-shelf:not(.show-all-shelf)'); // Cannot drop on "Show All"
             // Clear previous hover effects before applying new one
             document.querySelectorAll('.grimoire-shelf.drag-over').forEach(s => s.classList.remove('drag-over'));
             if (shelf && draggedCardId !== null) { // Only allow drop if a card is being dragged
                event.dataTransfer.dropEffect = 'move';
                shelf.classList.add('drag-over'); // Visual feedback
             } else {
                event.dataTransfer.dropEffect = 'none'; // Indicate invalid drop target
             }
        });
        grimoireShelvesContainer.addEventListener('dragleave', (event) => {
             // Remove hover effect if leaving the shelf area, unless moving to another shelf element
             const shelf = event.target.closest('.grimoire-shelf');
             if (shelf && !shelf.contains(event.relatedTarget)) {
                 shelf.classList.remove('drag-over');
             }
             // If leaving the container entirely, clear all hover effects
             if (!grimoireShelvesContainer.contains(event.relatedTarget)) {
                 document.querySelectorAll('.grimoire-shelf.drag-over').forEach(s => s.classList.remove('drag-over'));
             }
        });
        grimoireShelvesContainer.addEventListener('drop', (event) => {
            event.preventDefault(); // Prevent default drop behavior
            const shelf = event.target.closest('.grimoire-shelf:not(.show-all-shelf)');
            // Clear hover effect regardless of successful drop
            document.querySelectorAll('.grimoire-shelf.drag-over').forEach(s => s.classList.remove('drag-over'));
            if (shelf && draggedCardId !== null) { // Ensure drop target is valid shelf and a card was dragged
                const categoryId = shelf.dataset.categoryId;
                if (categoryId) {
                    console.log(`Attempting drop: Card ${draggedCardId} onto Shelf ${categoryId}`);
                    GameLogic.handleCategorizeCard(draggedCardId, categoryId);
                }
            }
            draggedCardId = null; // Reset dragged card ID after drop attempt
        });
    }

    // --- Persona Screen Actions (Delegation) ---
    if (personaScreenDiv) {
         const detailedViewBtn = document.getElementById('showDetailedViewBtn'); const summaryViewBtn = document.getElementById('showSummaryViewBtn'); const personaDetailedDiv = document.getElementById('personaDetailedView'); const personaSummaryDiv = document.getElementById('personaSummaryView');
         // View Toggle Buttons
         if (detailedViewBtn && summaryViewBtn && personaDetailedDiv && personaSummaryDiv) { detailedViewBtn.addEventListener('click', () => { personaDetailedDiv.classList.add('current'); personaDetailedDiv.classList.remove('hidden'); personaSummaryDiv.classList.add('hidden'); personaSummaryDiv.classList.remove('current'); detailedViewBtn.classList.add('active'); summaryViewBtn.classList.remove('active'); }); summaryViewBtn.addEventListener('click', () => { personaSummaryDiv.classList.add('current'); personaSummaryDiv.classList.remove('hidden'); personaDetailedDiv.classList.add('hidden'); personaDetailedDiv.classList.remove('current'); summaryViewBtn.classList.add('active'); detailedViewBtn.classList.remove('active'); UI.displayPersonaSummary(); }); }
         // Deep Dive Unlock Button (inside personaElementDetails)
         const personaElementDetails = document.getElementById('personaElementDetails');
         if (personaElementDetails) { personaElementDetails.addEventListener('click', (event) => { if (event.target.matches('.unlock-button')) GameLogic.handleUnlockLibraryLevel(event); }); }
         // Core Action Buttons (Delegated to Persona Screen)
         personaScreenDiv.addEventListener('click', (event) => {
             if (event.target.matches('#elementalDilemmaButton')) GameLogic.handleElementalDilemmaClick();
             else if (event.target.matches('#suggestSceneButton')) GameLogic.handleSuggestSceneClick();
             else if (event.target.matches('#exploreSynergyButton')) GameLogic.handleExploreSynergyClick();
             else if (event.target.matches('#addInsightButton')) GameLogic.handleInsightBoostClick();
             else { // Handle clicks on focus concept items to show popup
                 const focusItem = event.target.closest('.focus-concept-item');
                 if (focusItem && focusItem.dataset.conceptId) {
                     const conceptId = parseInt(focusItem.dataset.conceptId);
                     if (!isNaN(conceptId)) {
                         UI.showConceptDetailPopup(conceptId);
                     }
                 }
             }
         });
    }

    // --- Concept Detail Popup Actions (Delegation) ---
    if (conceptDetailPopupElem) {
        conceptDetailPopupElem.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            const conceptId = GameLogic.getCurrentPopupConceptId();
            if (conceptId === null) return; // No concept loaded in popup

            if (button.id === 'addToGrimoireButton') { GameLogic.addConceptToGrimoireById(conceptId, button); }
            else if (button.id === 'markAsFocusButton') { GameLogic.handleToggleFocusConcept(); }
            else if (button.classList.contains('popup-sell-button')) { GameLogic.handleSellConcept(event); }
            else if (button.id === 'saveMyNoteButton') { GameLogic.handleSaveNote(); }
            else if (button.classList.contains('unlock-lore-button')) {
                const levelToUnlock = parseInt(button.dataset.loreLevel);
                const cost = parseFloat(button.dataset.cost);
                if (!isNaN(levelToUnlock) && !isNaN(cost)) { GameLogic.handleUnlockLore(conceptId, levelToUnlock, cost); }
                else { console.error("Invalid lore level or cost data on button."); }
            }
        });
    }

    // --- Reflection Modal ---
    const reflectionCheck = document.getElementById('reflectionCheckbox'); const confirmReflectionBtn = document.getElementById('confirmReflectionButton');
    if (reflectionCheck) reflectionCheck.addEventListener('change', () => { if(confirmReflectionBtn) confirmReflectionBtn.disabled = !reflectionCheck.checked; });
    if (confirmReflectionBtn) confirmReflectionBtn.addEventListener('click', () => { const nudgeCheckbox = document.getElementById('scoreNudgeCheckbox'); GameLogic.handleConfirmReflection(nudgeCheckbox ? nudgeCheckbox.checked : false); });

    // --- Repository Actions (Delegation) ---
     if (repositoryContainer) { repositoryContainer.addEventListener('click', (event) => { const button = event.target.closest('button'); if (!button) return; if (button.dataset.sceneId) GameLogic.handleMeditateScene(event); else if (button.dataset.experimentId) GameLogic.handleAttemptExperiment(event); }); }

    // --- Resonance Chamber (Tapestry Deep Dive) Modal Actions (Delegation) ---
    if (tapestryDeepDiveModalElem) {
        const deepDiveNodesContainer = document.getElementById('deepDiveAnalysisNodes'); // The NAV container
        if (deepDiveNodesContainer) {
             deepDiveNodesContainer.addEventListener('click', (event) => {
                 const button = event.target.closest('.aspect-node'); // Target the aspect buttons
                 if (!button) return;
                 const nodeId = button.dataset.nodeId;
                 if (nodeId === 'contemplation') GameLogic.handleContemplationNodeClick();
                 else if (nodeId) GameLogic.handleDeepDiveNodeClick(nodeId); // For elemental, archetype, synergy
             });
        }
        // Listener for the "Complete Contemplation" button (added dynamically)
        const deepDiveDetail = document.getElementById('deepDiveDetailContent');
        if (deepDiveDetail) {
            deepDiveDetail.addEventListener('click', (event) => {
                if (event.target.matches('#completeContemplationBtn')) {
                    // Retrieve task data (this assumes it's stored appropriately when displayed)
                    // This part might need refinement based on how task data is stored/retrieved
                    console.warn("Complete Contemplation button clicked, ensure task data retrieval is robust.");
                    // Example: const taskData = GameLogic.getCurrentContemplationTask();
                    // if (taskData) GameLogic.handleCompleteContemplation(taskData);
                }
            });
        }
    }

    // --- Elemental Dilemma Modal ---
    if (dilemmaModalElem) {
        const confirmDilemmaBtn = document.getElementById('confirmDilemmaButton');
        if (confirmDilemmaBtn) {
            confirmDilemmaBtn.addEventListener('click', GameLogic.handleConfirmDilemma);
        }
        // Close button handled by general popup close listener
    }

    // --- Settings Popup Actions ---
    if (settingsPopupElem) { settingsPopupElem.addEventListener('click', (event) => { if (event.target.matches('#forceSaveButton')) { State.saveGameState(); UI.showTemporaryMessage("Game Saved!", 1500); } else if (event.target.matches('#resetAppButton')) { if (confirm("Reset ALL progress? This cannot be undone.")) { console.log("Resetting application..."); State.clearGameState(); // Clear state
                 initializeApp(); // Re-initialize to show welcome screen
                 UI.hidePopups(); // Close settings popup
                 UI.showTemporaryMessage("Progress Reset!", 3000); } } }); }

     // --- Info Icon Handling (Delegated to body) ---
     document.body.addEventListener('click', (event) => {
         const infoIcon = event.target.closest('.info-icon');
         if (infoIcon) {
             event.preventDefault(); event.stopPropagation();
             const message = infoIcon.getAttribute('title');
             const infoPopupContentElem = document.getElementById('infoPopupContent');
             const infoPopup = document.getElementById('infoPopup');
             const overlay = document.getElementById('popupOverlay');
             if (message && infoPopup && overlay && infoPopupContentElem) { infoPopupContentElem.textContent = message; infoPopup.classList.remove('hidden'); overlay.classList.remove('hidden'); }
             else if (message) { // Fallback to toast if popup elements missing
                 UI.showTemporaryMessage(message, 4000);
             }
         }
     });

    console.log("All event listeners attached.");
}

// --- Start the App ---
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initializeApp); }
else { initializeApp(); }

console.log("main.js loaded.");
// --- END OF main.js ---
