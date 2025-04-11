// --- Event Listeners ---
function attachEventListeners() {
    console.log("Attaching event listeners...");

    // --- Element References (Declared once for clarity) ---
    const startButton = document.getElementById('startGuidedButton');
    const loadButton = document.getElementById('loadButton');
    const nextBtn = document.getElementById('nextElementButton');
    const prevBtn = document.getElementById('prevElementButton');
    const mainNavBar = document.getElementById('mainNavBar');
    const popupOverlay = document.getElementById('popupOverlay');
    const grimoireContent = document.getElementById('grimoireContent');
    const grimoireShelvesContainer = document.getElementById('grimoireShelvesContainer');
    const studyScreenElement = document.getElementById('studyScreen');
    const studyResearchDiscoveriesArea = document.getElementById('studyResearchDiscoveries');
    const repositoryContainer = document.getElementById('repositoryScreen');
    const settingsPopupElem = document.getElementById('settingsPopup');
    const personaScreenDiv = document.getElementById('personaScreen');
    const tapestryDeepDiveModalElem = document.getElementById('tapestryDeepDiveModal');
    const conceptDetailPopupElem = document.getElementById('conceptDetailPopup');
    const infoPopupElem = document.getElementById('infoPopup');
    const dilemmaModalElem = document.getElementById('dilemmaModal');
    const splashScreen = document.getElementById('postQuestionnaireSplash'); // Splash Screen

    // --- Welcome Screen ---
    if (startButton) startButton.addEventListener('click', () => {
        State.clearGameState();
        UI.initializeQuestionnaireUI();
        UI.showScreen('questionnaireScreen');
        if(loadButton) loadButton.classList.add('hidden');
    });
    if (loadButton) loadButton.addEventListener('click', initializeApp);

    // --- Questionnaire Navigation ---
    if (nextBtn) nextBtn.addEventListener('click', GameLogic.goToNextElement);
    if (prevBtn) prevBtn.addEventListener('click', GameLogic.goToPrevElement);

    // --- Main Navigation ---
    if (mainNavBar) {
        mainNavBar.addEventListener('click', (event) => {
            const button = event.target.closest('.nav-button');
            if (!button) return;
            if (button.id === 'settingsButton') {
                UI.showSettings();
            } else {
                const target = button.dataset.target;
                if (target) UI.showScreen(target);
            }
        });
    }

    // --- General Popup/Overlay Closing ---
    if (popupOverlay) popupOverlay.addEventListener('click', UI.hidePopups);

    document.body.addEventListener('click', (event) => {
        // Close buttons for standard popups/modals (excluding splash confirm)
        const closeButtonSelector = `
            #closePopupButton,
            #closeReflectionModalButton,
            #closeSettingsPopupButton,
            #closeDeepDiveButton,
            #closeDilemmaModalButton,
            #closeInfoPopupButton,
            #confirmInfoPopupButton
            /* Add other general close buttons here if needed */
        `;
        if (event.target.matches(closeButtonSelector)) {
            UI.hidePopups();
        }
        // Separate handler for milestone alert close
        if (event.target.matches('#closeMilestoneAlertButton')) {
            UI.hideMilestoneAlert();
        }
        // Explicit handler for splash screen 'X' button
        if (event.target.matches('#closeSplashButton')) {
             if (!State.hasSeenPostQuestionnaireSplash()){
                State.markPostQuestionnaireSplashSeen(); // Mark seen if closed via X
                UI.hidePopups(); // Hide the splash
                UI.showScreen('personaScreen'); // Ensure transition
             } else {
                UI.hidePopups(); // Just hide if already seen
             }
        }
    });


    // --- Post-Questionnaire Splash Screen CONFIRM Button ---
    if (splashScreen) {
        const confirmSplashButton = document.getElementById('confirmSplashButton');
        if(confirmSplashButton) {
            confirmSplashButton.addEventListener('click', () => {
                if (!State.hasSeenPostQuestionnaireSplash()) {
                    State.markPostQuestionnaireSplashSeen(); // Mark as seen
                }
                UI.hidePopups(); // Hide splash and overlay
                UI.showScreen('personaScreen'); // Transition to Persona
            });
        }
         // The 'X' close button click is handled by the body listener now
    }

    // --- Study Screen Actions ---
    if (studyScreenElement) {
        studyScreenElement.addEventListener('click', (event) => {
            const discoveryElement = event.target.closest('.initial-discovery-element.clickable');
            if (discoveryElement) {
                 const freeResearchLeft = State.getInitialFreeResearchRemaining();
                 const isFreeClick = freeResearchLeft > 0;
                 GameLogic.handleResearchClick({ currentTarget: discoveryElement, isFree: isFreeClick }); return;
            }
            if (event.target.matches('#freeResearchButton')) { GameLogic.handleFreeResearchClick(); return; }
            if (event.target.matches('#seekGuidanceButton')) { GameLogic.triggerGuidedReflection(); return; }
        });
    } else { console.error("Study Screen element not found for listener attachment."); }

    // --- Study Screen Research Discoveries Actions ---
    if (studyResearchDiscoveriesArea) {
        studyResearchDiscoveriesArea.addEventListener('click', (event) => {
             const actionButton = event.target.closest('button.add-button, button.sell-button');
             if (actionButton) {
                  event.stopPropagation();
                  const conceptIdStr = actionButton.dataset.conceptId;
                  if (conceptIdStr) { const conceptId = parseInt(conceptIdStr); if (!isNaN(conceptId)) { if (actionButton.classList.contains('add-button')) { GameLogic.addConceptToGrimoireById(conceptId, actionButton); } else if (actionButton.classList.contains('sell-button')) { GameLogic.handleSellConcept(event);
                  } } else { console.error("Invalid conceptId:", conceptIdStr); } } else { console.error("Button missing conceptId:", actionButton); }
             } else {
                const card = event.target.closest('.concept-card');
                if (card) { const conceptIdStr = card.dataset.conceptId; if (conceptIdStr) { const conceptId = parseInt(conceptIdStr); if (!isNaN(conceptId)) { UI.showConceptDetailPopup(conceptId); } } }
             }
        });
    } else { console.error("#studyResearchDiscoveries element not found for listener attachment."); }

    // --- Grimoire Actions ---
    const grimoireControlsElem = document.getElementById('grimoireControls');
    if (grimoireControlsElem) {
        grimoireControlsElem.addEventListener('change', () => UI.refreshGrimoireDisplay());
        grimoireControlsElem.addEventListener('input', (event) => {
            if (event.target.id === 'grimoireSearchInput') UI.refreshGrimoireDisplay();
        });
    }
    if (grimoireContent) {
        // Grimoire Card Button Clicks
        grimoireContent.addEventListener('click', (event) => {
            const targetButton = event.target.closest('button.card-sell-button, button.card-focus-button');
            if (!targetButton) return;
            event.stopPropagation();
            const conceptIdStr = targetButton.dataset.conceptId;
            if (conceptIdStr) { const conceptId = parseInt(conceptIdStr); if (!isNaN(conceptId)) { if (targetButton.classList.contains('card-sell-button')) { GameLogic.handleSellConcept(event); } else if (targetButton.classList.contains('card-focus-button')) { GameLogic.handleCardFocusToggle(conceptId); } } }
        });
        // Grimoire Card Popup Click
         grimoireContent.addEventListener('click', (event) => {
             if (event.target.closest('button')) return;
             const card = event.target.closest('.concept-card');
             if (card) { const conceptId = parseInt(card.dataset.conceptId); if (!isNaN(conceptId)) { UI.showConceptDetailPopup(conceptId); } }
         });
         // Grimoire Card Drag/Drop
         grimoireContent.addEventListener('dragstart', (event) => {
             const card = event.target.closest('.concept-card');
             if (card && card.draggable) {
                event.dataTransfer.setData('text/plain', card.dataset.conceptId);
                event.dataTransfer.effectAllowed = 'move';
                card.classList.add('dragging');
                draggedCardId = parseInt(card.dataset.conceptId);
             } else { event.preventDefault(); }
         });
         grimoireContent.addEventListener('dragend', (event) => {
             const card = event.target.closest('.concept-card');
             if (card) { card.classList.remove('dragging'); }
             draggedCardId = null;
             document.querySelectorAll('.grimoire-shelf.drag-over').forEach(shelf => shelf.classList.remove('drag-over'));
         });
    }
    if (grimoireShelvesContainer) {
        // Shelf Click (Filter)
        grimoireShelvesContainer.addEventListener('click', (event) => {
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
        // Shelf Drag/Drop
        grimoireShelvesContainer.addEventListener('dragover', (event) => {
             event.preventDefault();
             const shelf = event.target.closest('.grimoire-shelf:not(.show-all-shelf)');
             document.querySelectorAll('.grimoire-shelf.drag-over').forEach(s => s.classList.remove('drag-over'));
             if (shelf && draggedCardId !== null) {
                event.dataTransfer.dropEffect = 'move';
                shelf.classList.add('drag-over');
             } else { event.dataTransfer.dropEffect = 'none'; }
        });
        grimoireShelvesContainer.addEventListener('dragleave', (event) => {
             const shelf = event.target.closest('.grimoire-shelf');
             if (shelf && !shelf.contains(event.relatedTarget)) { shelf.classList.remove('drag-over'); }
             if (!grimoireShelvesContainer.contains(event.relatedTarget)) {
                 document.querySelectorAll('.grimoire-shelf.drag-over').forEach(s => s.classList.remove('drag-over'));
             }
        });
        grimoireShelvesContainer.addEventListener('drop', (event) => {
            event.preventDefault();
            const shelf = event.target.closest('.grimoire-shelf:not(.show-all-shelf)');
            document.querySelectorAll('.grimoire-shelf.drag-over').forEach(s => s.classList.remove('drag-over'));
            if (shelf && draggedCardId !== null) {
                const categoryId = shelf.dataset.categoryId;
                if (categoryId) { GameLogic.handleCategorizeCard(draggedCardId, categoryId); }
            }
            draggedCardId = null;
        });
    }

    // --- Persona Screen Actions ---
    if (personaScreenDiv) {
         const detailedViewBtn = document.getElementById('showDetailedViewBtn'); const summaryViewBtn = document.getElementById('showSummaryViewBtn'); const personaDetailedDiv = document.getElementById('personaDetailedView'); const personaSummaryDiv = document.getElementById('personaSummaryView');
         // View Toggle Buttons
         if (detailedViewBtn && summaryViewBtn && personaDetailedDiv && personaSummaryDiv) { detailedViewBtn.addEventListener('click', () => { personaDetailedDiv.classList.add('current'); personaDetailedDiv.classList.remove('hidden'); personaSummaryDiv.classList.add('hidden'); personaSummaryDiv.classList.remove('current'); detailedViewBtn.classList.add('active'); summaryViewBtn.classList.remove('active'); }); summaryViewBtn.addEventListener('click', () => { personaSummaryDiv.classList.add('current'); personaSummaryDiv.classList.remove('hidden'); personaDetailedDiv.classList.add('hidden'); personaDetailedDiv.classList.remove('current'); summaryViewBtn.classList.add('active'); detailedViewBtn.classList.remove('active'); UI.displayPersonaSummary(); }); }
         // Deep Dive Unlock Button
         const personaElementDetails = document.getElementById('personaElementDetails');
         if (personaElementDetails) { personaElementDetails.addEventListener('click', (event) => { if (event.target.matches('.unlock-button')) GameLogic.handleUnlockLibraryLevel(event); }); }
         // Core Action Buttons
         personaScreenDiv.addEventListener('click', (event) => {
             if (event.target.matches('#elementalDilemmaButton')) GameLogic.handleElementalDilemmaClick();
             else if (event.target.matches('#suggestSceneButton')) GameLogic.handleSuggestSceneClick();
             else if (event.target.matches('#exploreSynergyButton')) GameLogic.handleExploreSynergyClick();
             else if (event.target.matches('#addInsightButton')) GameLogic.handleInsightBoostClick();
             else { // Focus Concept Click
                 const focusItem = event.target.closest('.focus-concept-item');
                 if (focusItem && focusItem.dataset.conceptId) {
                     const conceptId = parseInt(focusItem.dataset.conceptId);
                     if (!isNaN(conceptId)) { UI.showConceptDetailPopup(conceptId); }
                 }
             }
         });
    }

    // --- Concept Detail Popup Actions ---
    if (conceptDetailPopupElem) {
        conceptDetailPopupElem.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            const conceptId = GameLogic.getCurrentPopupConceptId();
            if (conceptId === null) return;

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

    // --- Repository Actions ---
     if (repositoryContainer) { repositoryContainer.addEventListener('click', (event) => { const button = event.target.closest('button'); if (!button) return; if (button.dataset.sceneId) GameLogic.handleMeditateScene(event); else if (button.dataset.experimentId) GameLogic.handleAttemptExperiment(event); }); }

    // --- Resonance Chamber (Tapestry Deep Dive) Modal Actions ---
    if (tapestryDeepDiveModalElem) {
        const deepDiveNodesContainer = document.getElementById('deepDiveAnalysisNodes');
        if (deepDiveNodesContainer) {
             deepDiveNodesContainer.addEventListener('click', (event) => {
                 const button = event.target.closest('.aspect-node');
                 if (!button) return;
                 const nodeId = button.dataset.nodeId;
                 if (nodeId === 'contemplation') GameLogic.handleContemplationNodeClick();
                 else if (nodeId) GameLogic.handleDeepDiveNodeClick(nodeId);
             });
        }
        const deepDiveDetail = document.getElementById('deepDiveDetailContent');
        if (deepDiveDetail) {
            deepDiveDetail.addEventListener('click', (event) => {
                if (event.target.matches('#completeContemplationBtn')) {
                    console.warn("Complete Contemplation button clicked, ensure task data retrieval is robust.");
                    // TODO: Retrieve the current task data before calling handleCompleteContemplation
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
    }

    // --- Settings Popup Actions ---
    if (settingsPopupElem) {
        settingsPopupElem.addEventListener('click', (event) => {
            if (event.target.matches('#forceSaveButton')) {
                State.saveGameState();
                UI.showTemporaryMessage("Game Saved!", 1500);
            } else if (event.target.matches('#resetAppButton')) {
                if (confirm("Reset ALL progress? This cannot be undone.")) {
                    console.log("Resetting application...");
                    State.clearGameState(); // Clear state first
                    // Hide popups *before* re-initializing UI
                    UI.hidePopups();
                    // Re-initialize the application state and UI
                    // Since initializeApp sets up listeners etc., calling it directly IS the correct way
                    // The error likely stemmed from something else getting corrupted during reset,
                    // but ensuring popups are hidden first is good practice.
                    initializeApp(); // Call the function directly - it's in the same module scope
                    UI.showTemporaryMessage("Progress Reset!", 3000);
                     // Ensure load button is hidden after reset
                     const loadBtn = document.getElementById('loadButton');
                     if(loadBtn) loadBtn.classList.add('hidden');
                }
            }
        });
    }

    console.log("All event listeners attached.");
} // End of attachEventListeners function

// --- Start the App ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp(); // Call initializeApp directly if DOM is already loaded
}

console.log("main.js loaded.");
// --- END OF main.js ---
