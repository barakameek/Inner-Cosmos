// --- START OF FILE gameLogic.js ---

// js/gameLogic.js - Application Logic (Enhanced v4.1 - RF, Onboarding, Logging - Fixed + Onboarding Split)

import * as State from './state.js';
import * as Config from './config.js';
import * as Utils from './utils.js';
import * as UI from './ui.js';
// Import updated data structures (now using split onboarding tours if needed, but gameLogic doesn't directly use them)
import {
    elementDetails, elementKeyToFullName,
    concepts, questionnaireGuided,
    reflectionPrompts, elementDeepDive, dailyRituals, milestones, focusRituals,
    sceneBlueprints, alchemicalExperiments, elementalInsights, focusDrivenUnlocks,
    cardTypeKeys, elementNames, // Now 7 elements including RoleFocus ("Attraction", etc.)
    elementInteractionThemes, cardTypeThemes,
    categoryDrivenUnlocks, grimoireShelves, elementalDilemmas
    // Removed onboardingTasks import as it's unused here
} from '../data.js';

console.log("gameLogic.js loading... (Enhanced v4.1 - RF, Onboarding, Logging - Fixed + Onboarding Split)");

// --- Temporary State (Cleared by UI.hidePopups calling clearPopupState) ---
let currentlyDisplayedConceptId = null; // ID of concept in the detail popup
let currentReflectionContext = null; // e.g., 'Standard', 'Dissonance', 'Guided', 'SceneMeditation', 'RareConcept'
let reflectionTargetConceptId = null; // ID of concept causing Dissonance/Rare prompt
let currentReflectionCategory = null; // e.g., 'Attraction', 'Interaction' for Standard/Guided reflections (using element name key from data.js)
let currentPromptId = null; // ID of the specific prompt being shown
let reflectionCooldownTimeout = null; // Timeout ID for standard reflection cooldown
let currentDilemma = null; // Data object for the active dilemma

// --- Tapestry Analysis Cache ---
// Stores result of calculateTapestryNarrative { synergies, tensions, etc. }
// Cache invalidation based on focus set hash in State.
let currentTapestryAnalysis = null;

// --- Initialization & Core State ---

/**
 * Resets temporary state variables related to popups.
 * Typically called when popups are hidden.
 */
export function clearPopupState() {
    currentlyDisplayedConceptId = null;
    currentReflectionContext = null;
    reflectionTargetConceptId = null;
    currentReflectionCategory = null;
    currentPromptId = null;
    currentDilemma = null;
    console.log("Logic: Popup state cleared.");
}

/**
 * Sets the ID of the concept currently shown in the detail popup.
 * @param {number | null} conceptId
 */
export function setCurrentPopupConcept(conceptId) {
     currentlyDisplayedConceptId = conceptId;
}

/**
 * Gets the ID of the concept currently shown in the detail popup.
 * @returns {number | null}
 */
export function getCurrentPopupConceptId() {
     return currentlyDisplayedConceptId;
}

// --- REMOVED UNUSED FUNCTION ---
// The checkOnboardingInternal function was here, but it wasn't being called
// and used the old onboardingTasks array. Main.js handles onboarding checks now.


// --- Insight & Attunement Management ---

/**
 * Adds insight to the user's total. Automatically handles logging and UI updates.
 * @param {number} amount - The amount of insight to gain (can be negative for spending).
 * @param {string} [source="Unknown"] - Describes where the insight came from (for logging).
 */
export function gainInsight(amount, source = "Unknown") {
    if (typeof amount !== 'number' || isNaN(amount)) { // Allow amount === 0 for consistency if needed
        if (amount !== 0) console.warn(`gainInsight called with invalid amount: ${amount}`);
        return;
    }
    // State.changeInsight handles logging & saving automatically
    const changed = State.changeInsight(amount, source); // Pass source to state
    if (changed) {
        // Update UI displays (which includes log if visible)
        UI.updateInsightDisplays(); // This also calls updateDependentUI
        // Check if gaining insight triggers any rituals
        checkAndUpdateRituals('gainInsight', { amount: Math.abs(amount) });
    }
}

/**
 * Spends insight if the user has enough. Automatically handles logging and UI updates.
 * @param {number} amount - The positive amount of insight to spend.
 * @param {string} [source="Unknown"] - Describes what the insight was spent on (for logging).
 * @returns {boolean} True if insight was spent successfully, false otherwise.
 */
export function spendInsight(amount, source = "Unknown") {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
        console.warn(`spendInsight called with invalid amount: ${amount}`);
        return false;
    }
    if (State.getInsight() >= amount) {
        gainInsight(-amount, source); // Use gainInsight with negative value for logging consistency
        checkAndUpdateRituals('spendInsight', { amount: amount }); // Check if spending triggers ritual
        return true;
    } else {
        UI.showTemporaryMessage(`Not enough Insight! Need ${amount.toFixed(1)}.`, Config.TOAST_DURATION);
        return false;
    }
}

/**
 * Counts undiscovered concepts for a specific element key, broken down by rarity.
 * @param {string} elementKey - The single-letter key for the element (e.g., 'A', 'RF').
 * @returns {{common: number, uncommon: number, rare: number, total: number}} Counts by rarity.
 */
export function countUndiscoveredByRarity(elementKey) {
    const discoveredIds = new Set(State.getDiscoveredConcepts().keys());
    const counts = { common: 0, uncommon: 0, rare: 0, total: 0 };

    if (!elementKeyToFullName[elementKey]) {
        console.warn(`countUndiscoveredByRarity: Invalid elementKey '${elementKey}'`);
        return counts;
    }

    concepts.forEach(concept => {
        // Check if the concept's primary element matches the requested key
        if (concept.primaryElement === elementKey && !discoveredIds.has(concept.id)) {
            const rarity = concept.rarity || 'common';
            if (counts.hasOwnProperty(rarity)) {
                 counts[rarity]++;
            } else {
                console.warn(`Concept ${concept.id} has unknown rarity: ${rarity}`);
            }
            counts.total++;
        }
    });
    return counts;
}

/**
 * Grants attunement points for specific actions, potentially targeting specific elements or all.
 * Includes handling for RF element.
 * @param {string} actionType - Identifier for the action causing the gain (e.g., 'completeReflection', 'researchSuccess').
 * @param {string | null} [elementKey=null] - The specific element key ('A'...'RF') to target, or 'All'.
 * @param {number} [amount=0.5] - The base amount of attunement to grant per targeted element.
 */
export function gainAttunementForAction(actionType, elementKey = null, amount = 0.5) {
    let targetKeys = [];
    let baseAmount = amount;
    const allKeys = Object.keys(State.getAttunement()); // Get all 7 keys ('A'...'RF') from state

    // --- Determine Target Element(s) ---
    if (elementKey && allKeys.includes(elementKey) && elementKey !== 'All') {
        // Specific single valid element target
        targetKeys.push(elementKey);
    } else if (actionType === 'completeReflection' && ['Standard', 'SceneMeditation', 'RareConcept', 'Guided'].includes(currentReflectionContext)) {
        // Determine target element based on reflection context
        let keyFromContext = null;
        // Standard/Guided use currentReflectionCategory which stores the element name key ('Attraction', etc.)
        if ((currentReflectionContext === 'Standard' || currentReflectionContext === 'Guided') && currentReflectionCategory) {
             // Map the element name key back to the single letter key ('A'...'RF')
             keyFromContext = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === currentReflectionCategory);
        } else if (currentReflectionContext === 'SceneMeditation') {
            const scene = sceneBlueprints.find(s => s.reflectionPromptId === currentPromptId);
            keyFromContext = scene?.element || null; // Element defined in scene data ('A'...'RF')
        } else if (currentReflectionContext === 'RareConcept') {
            // Find concept associated with the rare prompt ID
            const conceptEntry = Array.from(State.getDiscoveredConcepts().entries()).find(([id, data]) => data.concept.uniquePromptId === currentPromptId);
            keyFromContext = conceptEntry ? conceptEntry[1].concept.primaryElement : null; // ('A'...'RF')
        }

        if (keyFromContext && allKeys.includes(keyFromContext)) {
            targetKeys.push(keyFromContext);
        } else {
            console.warn(`Could not determine target element for reflection context: ${currentReflectionContext}, category: ${currentReflectionCategory}, prompt: ${currentPromptId}. Applying small amount to all.`);
            targetKeys = allKeys; baseAmount = 0.1; // Small gain across all if target unclear
        }
    } else if (['generic', 'completeReflectionGeneric', 'scoreNudge', 'ritual', 'milestone', 'experimentSuccess', 'addToGrimoire', 'discover', 'markFocus', 'contemplation', 'researchSuccess', 'researchFail', 'researchSpecial', 'dilemmaNudge'].includes(actionType) || elementKey === 'All') {
        // Target all elements for generic actions or explicit 'All'
        targetKeys = allKeys; // Target all 7 elements
        // Adjust base amount based on action type for 'All' targets
        switch(actionType) {
            case 'scoreNudge': baseAmount = (Config.SCORE_NUDGE_AMOUNT * 2) / (targetKeys.length || 1); break; // Nudge has specific amount
            case 'dilemmaNudge': baseAmount = (0.3 / (targetKeys.length || 1)); break; // Dilemma nudge different amount
            case 'completeReflectionGeneric': baseAmount = 0.2; break;
            case 'contemplation': baseAmount = (elementKey === 'All') ? 0.1 : 0.4; break; // Different for general vs specific
            case 'researchSuccess': baseAmount = 0.5; break;
            case 'researchFail': baseAmount = 0.1; break;
            case 'researchSpecial': baseAmount = 0.8; break;
            case 'addToGrimoire': baseAmount = 0.6; break;
            case 'discover': baseAmount = 0.3; break;
            case 'markFocus': baseAmount = 1.0; break;
            case 'experimentSuccess': baseAmount = 1.0; break; // Added default for experiment success
            default: baseAmount = 0.2; break; // Default small gain for other generic actions
        }
    } else {
        // Handle cases where actionType doesn't fit or elementKey is invalid
        console.warn(`gainAttunementForAction called with unhandled parameters or context: action=${actionType}, key=${elementKey}, context=${currentReflectionContext}`);
        return; // Unknown action/target scenario
    }

    // --- Apply Attunement Changes ---
    let changed = false;
    targetKeys.forEach(key => {
        if (State.updateAttunement(key, baseAmount)) {
            changed = true;
            // Update milestones checks for 'all' and 'any' conditions
            // Pass the specific change AND the whole object for different milestone types
            updateMilestoneProgress('elementAttunement', { [key]: State.getAttunement()[key] }); // Pass specific change for 'any' check
            updateMilestoneProgress('elementAttunement', State.getAttunement()); // Pass entire object for 'all' check
        }
    });

    if (changed) {
        // console.log(`Logic: Attunement updated (${actionType}, Key(s): ${targetKeys.join(',') || 'None'}) by ${baseAmount.toFixed(2)} per element.`); // Reduce noise
        // Refresh UI only if relevant screen is active
        const personaScreen = document.getElementById('personaScreen');
        if (personaScreen?.classList.contains('current')) {
            // Use requestAnimationFrame to ensure DOM is ready if called rapidly
            requestAnimationFrame(UI.displayElementAttunement);
        }
    }
}

/**
 * Handles the click event for the manual insight boost button.
 */
export function handleInsightBoostClick() {
    const cooldownEnd = State.getInsightBoostCooldownEnd();
    if (cooldownEnd && Date.now() < cooldownEnd) {
        UI.showTemporaryMessage("Insight boost is still cooling down.", Config.TOAST_DURATION);
        return;
    }
    gainInsight(Config.INSIGHT_BOOST_AMOUNT, "Manual Boost");
    State.setInsightBoostCooldown(Date.now() + Config.INSIGHT_BOOST_COOLDOWN);
    UI.updateInsightBoostButtonState(); // Update button immediately
    UI.showTemporaryMessage(`Gained ${Config.INSIGHT_BOOST_AMOUNT} Insight!`, 2500);
}


// --- Questionnaire Logic (Includes RF) ---

/**
 * Handles input changes during the questionnaire.
 * @param {Event} event - The input or change event object.
 */
export function handleQuestionnaireInputChange(event) {
    const input = event.target;
    const type = input.dataset.type; // 'slider', 'radio', 'checkbox'
    const currentState = State.getState();

    if (!currentState || currentState.currentElementIndex < 0 || currentState.currentElementIndex >= elementNames.length) {
        console.warn("Questionnaire input change outside valid element index or state missing.");
        return;
    }
    // elementNames contains the keys like "Attraction", "Interaction", ..., "RoleFocus"
    const elementNameKey = elementNames[currentState.currentElementIndex];
    // Get all current answers for this element from the UI
    const currentAnswers = UI.getQuestionnaireAnswers();
    // Update the state (doesn't save immediately, saved on Next/Prev/Finalize)
    State.updateAnswers(elementNameKey, currentAnswers);

    // Update UI feedback specific to input type
    if (type === 'slider') {
        UI.updateSliderFeedbackText(input, elementNameKey); // Pass element name key
    }
    // Update the dynamic score preview for the current element
    UI.updateDynamicFeedback(elementNameKey, currentAnswers);
}

/**
 * Handles checkbox changes, enforcing max choices.
 * @param {Event} event - The change event object from a checkbox.
 */
export function handleCheckboxChange(event) {
     const checkbox = event.target;
     const name = checkbox.name; // Corresponds to qId
     const maxChoices = parseInt(checkbox.dataset.maxChoices || '2'); // Get max allowed choices
     const container = checkbox.closest('.checkbox-options');
     if (!container) return;

     const checkedBoxes = container.querySelectorAll(`input[name="${name}"]:checked`);
     if (checkedBoxes.length > maxChoices) {
         UI.showTemporaryMessage(`Max ${maxChoices} options allowed.`, 2500);
         checkbox.checked = false; // Revert the check
         // Re-trigger the update AFTER unchecking to ensure state is correct
         handleQuestionnaireInputChange(event);
     } else {
         // Process valid change
         handleQuestionnaireInputChange(event);
     }
}

/**
 * Calculates the score for a single element based on its answers.
 * Includes RoleFocus.
 * @param {string} elementNameKey - The key for the element (e.g., "Attraction", "RoleFocus").
 * @param {object} answersForElement - The answers object for this specific element.
 * @returns {number} The calculated score (0-10).
 */
export function calculateElementScore(elementNameKey, answersForElement) {
    const elementData = elementDetails[elementNameKey];
    const questions = questionnaireGuided[elementNameKey];

    if (!elementData || !questions || questions.length === 0) {
        console.warn(`No questions found for element: ${elementNameKey}. Using default score 5.0.`);
        return 5.0; // Return default score if questions are missing
    }

    let score = 5.0; // Start at neutral

    questions.forEach(q => {
        const answer = answersForElement?.[q.qId]; // Use optional chaining for safety
        let pointsToAdd = 0;
        const weight = q.scoreWeight || 1.0;

        if (q.type === 'slider') {
            // Ensure answer is a valid number, otherwise use default
            const value = (answer !== undefined && !isNaN(parseFloat(answer))) ? parseFloat(answer) : q.defaultValue;
            const baseValue = q.defaultValue !== undefined ? q.defaultValue : 5; // Slider midpoint default
            pointsToAdd = (value - baseValue) * weight;
        }
        else if (q.type === 'radio') {
            const opt = q.options.find(o => o.value === answer);
            pointsToAdd = opt?.points ? (opt.points * weight) : 0;
        }
        else if (q.type === 'checkbox' && Array.isArray(answer)) {
            answer.forEach(val => {
                const opt = q.options.find(o => o.value === val);
                pointsToAdd += opt?.points ? (opt.points * weight) : 0;
            });
        }
        score += pointsToAdd;
    });
    // Clamp score between 0 and 10
    return Math.max(0, Math.min(10, score));
}

/**
 * Moves to the next element in the questionnaire or finalizes if done.
 */
export function goToNextElement() {
    const currentState = State.getState();
    const currentIndex = currentState.currentElementIndex;

    // Save answers for the current element before moving
    if (currentIndex >= 0 && currentIndex < elementNames.length) {
        const elementNameKey = elementNames[currentIndex];
        const currentAnswers = UI.getQuestionnaireAnswers();
        State.updateAnswers(elementNameKey, currentAnswers);
        // console.log(`Logic: Saved answers for ${elementNameKey}.`); // Reduce noise
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= elementNames.length) {
        finalizeQuestionnaire(); // All elements done
    } else {
        State.updateElementIndex(nextIndex);
        UI.displayElementQuestions(nextIndex); // Display next set of questions
    }
}

/**
 * Moves to the previous element in the questionnaire.
 */
export function goToPrevElement() {
    const currentState = State.getState();
    if (currentState.currentElementIndex > 0) {
        // Save answers for the current element before going back
        const elementNameKey = elementNames[currentState.currentElementIndex];
        const currentAnswers = UI.getQuestionnaireAnswers();
        State.updateAnswers(elementNameKey, currentAnswers);
        // console.log(`Logic: Saved answers for ${elementNameKey} before going back.`); // Reduce noise

        const prevIndex = currentState.currentElementIndex - 1;
        State.updateElementIndex(prevIndex);
        UI.displayElementQuestions(prevIndex); // Display previous questions
    } else {
        console.log("Already at the first element.");
    }
}

/**
 * Finalizes the questionnaire, calculates all scores, determines starter hand, and transitions UI.
 * Includes RoleFocus.
 */
export function finalizeQuestionnaire() {
    console.log("Logic: Finalizing scores for 7 elements...");
    const finalScores = {};
    const currentState = State.getState(); // Get current state, including potentially unsaved answers
    const allAnswers = currentState.userAnswers; // Use answers from state

    // Save answers for the *last* element before calculating scores
     if (currentState.currentElementIndex >= 0 && currentState.currentElementIndex < elementNames.length) {
         const lastElementNameKey = elementNames[currentState.currentElementIndex];
         const currentUIAnswers = UI.getQuestionnaireAnswers(); // Get potentially updated answers from UI
         State.updateAnswers(lastElementNameKey, currentUIAnswers); // Update state without saving yet
         allAnswers[lastElementNameKey] = currentUIAnswers; // Ensure allAnswers has the latest
     }

    // Iterate using the element name keys which are used in answers and questionnaireGuided
    elementNames.forEach(elementNameKey => { // "Attraction", "Interaction", ..., "RoleFocus"
        const score = calculateElementScore(elementNameKey, allAnswers[elementNameKey] || {});
        // Map the element name key back to the single letter key ('A', 'I', ..., 'RF') for saving
        const scoreKey = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === elementNameKey);

        if (scoreKey) {
            finalScores[scoreKey] = score;
        } else {
            console.warn(`finalizeQuestionnaire: No score key found for element name key: ${elementNameKey}`);
        }
    });

    State.updateScores(finalScores); // Save the calculated scores ('A', 'I', ..., 'RF')
    State.saveAllAnswers(allAnswers); // Save the raw answers
    State.setQuestionnaireComplete(); // Marks done, saves state, handles onboarding flag if needed

    determineStarterHandAndEssence(); // Select initial concepts based on scores

    updateMilestoneProgress('completeQuestionnaire', 1); // Track milestone
    checkForDailyLogin(); // Perform daily check now that user state is established

    // Update UI elements based on new state
    UI.updateInsightDisplays();
    UI.updateFocusSlotsDisplay();
    UI.updateGrimoireCounter();
    UI.populateGrimoireFilters();
    calculateTapestryNarrative(true); // Calculate initial narrative
    checkSynergyTensionStatus(); // Check initial status
    // Let main.js handle showScreen call after this

    console.log("Logic: Final User Scores (7 Elements):", State.getScores());
    UI.showTemporaryMessage("Experiment Complete! Explore your results.", 4000);
    // UI.showScreen is handled by the calling function in main.js via triggerActionAndCheckOnboarding
}


// --- Starter Hand Determination (Uses 7 element distance) ---
/**
 * Determines the initial set of discovered concepts based on score proximity.
 * Includes RoleFocus in distance calculation.
 */
export function determineStarterHandAndEssence() {
     console.log("Logic: Determining starter hand (7 Dimensions)...");
     if (!concepts || !Array.isArray(concepts) || concepts.length === 0) {
         console.error("Concepts data missing or invalid.");
         return;
     }
     const userScores = State.getScores(); // Includes RF score ('A'...'RF')

     // Calculate distance for all concepts that have valid scores for ALL 7 elements
     let conceptsWithDistance = concepts.map(c => {
         const conceptScores = c.elementScores;
         // Strict check: Ensure elementScores exists and has exactly 7 keys matching elementNames
         const expectedKeys = Object.keys(elementKeyToFullName); // A, I, S, P, C, R, RF
         const conceptScoresValid = conceptScores &&
                                    typeof conceptScores === 'object' &&
                                    expectedKeys.length === Object.keys(conceptScores).length && // Check count first
                                    expectedKeys.every(key => conceptScores.hasOwnProperty(key) && typeof conceptScores[key] === 'number' && !isNaN(conceptScores[key])); // Check existence and type

         const distance = conceptScoresValid ? Utils.euclideanDistance(userScores, conceptScores, c.name) : Infinity;

         if (!conceptScoresValid) {
             console.warn(`Concept ${c.name} (ID: ${c.id}) missing or has incomplete/invalid scores (${Object.keys(conceptScores || {}).length}/${expectedKeys.length}). Excluding from starter hand calculation.`);
         }
         return { ...c, distance };
     }).filter(c => c.distance !== Infinity && !isNaN(c.distance)); // Filter out concepts with calculation errors or missing scores

     if (conceptsWithDistance.length === 0) {
        console.error("Distance calculation failed for all concepts or no valid concepts with complete scores found.");
        // Fallback: Grant first few concepts as default
        const defaultStarters = concepts.slice(0, Config.INITIAL_FOCUS_SLOTS); // Grant initial slots worth
        defaultStarters.forEach(c => {
            if (State.addDiscoveredConcept(c.id, c)) {
                gainAttunementForAction('discover', c.primaryElement, 0.3);
            }
        });
        console.warn(`Granted first ${Config.INITIAL_FOCUS_SLOTS} concepts due to error.`);
        UI.updateGrimoireCounter();
        return;
     }

     // Sort by distance (closest first)
     conceptsWithDistance.sort((a, b) => a.distance - b.distance);

     // Selection Logic (Aim for ~7 diverse cards)
     const candidates = conceptsWithDistance.slice(0, 30); // Consider top 30 closest
     const starterHand = [];
     const starterHandIds = new Set();
     const targetHandSize = Math.max(5, Config.INITIAL_FOCUS_SLOTS); // Aim for at least 5, up to initial slots
     const elementRepTarget = 4; // Try to get at least 4 unique primary elements represented
     const representedElements = new Set();

     // 1. Prioritize closest concepts first
     for (const c of candidates) {
         if (starterHand.length >= 4) break; // Get top 4 regardless of element
         if (!starterHandIds.has(c.id)) {
             starterHand.push(c);
             starterHandIds.add(c.id);
             if (c.primaryElement) representedElements.add(c.primaryElement);
         }
     }
     // 2. Try to ensure element diversity among remaining candidates
     for (const c of candidates) {
         if (starterHand.length >= targetHandSize) break;
         if (starterHandIds.has(c.id)) continue; // Skip already added

         const needsRep = c.primaryElement && representedElements.size < elementRepTarget && !representedElements.has(c.primaryElement);
         // Add if it adds diversity and we need it, OR if we still need cards to reach target
         if (needsRep || starterHand.length < targetHandSize) {
              starterHand.push(c);
              starterHandIds.add(c.id);
              if (c.primaryElement) representedElements.add(c.primaryElement);
         }
     }
     // 3. Fill remaining slots with the next closest candidates if needed
     for (const c of candidates) {
         if (starterHand.length >= targetHandSize) break;
         if (!starterHandIds.has(c.id)) {
             starterHand.push(c);
             starterHandIds.add(c.id);
         }
     }

     console.log("Logic: Starter Hand Selected:", starterHand.map(c => `${c.name} (Dist: ${c.distance.toFixed(1)})`));
     // Add selected concepts to state
     starterHand.forEach(c => {
         if (State.addDiscoveredConcept(c.id, c)) { // Add to state (will save)
             gainAttunementForAction('discover', c.primaryElement, 0.3); // Grant small attunement
         }
     });
     updateMilestoneProgress('discoveredConcepts.size', State.getDiscoveredConcepts().size); // Check collection milestones
     UI.updateGrimoireCounter(); // Update UI
}


// --- Core Screen Logic Calls ---

/**
 * Logic to execute when showing the Persona screen.
 */
export function displayPersonaScreenLogic() {
    calculateTapestryNarrative(true); // Recalculate narrative based on current focus
    checkSynergyTensionStatus(); // Update synergy button status
    UI.displayPersonaScreen(); // Render the persona details (scores, accordions)
    UI.displayInsightLog(); // Ensure log is displayed if visible
}

/**
 * Logic to execute when showing the Workshop screen.
 */
export function displayWorkshopScreenLogic() {
    UI.displayWorkshopScreenContent(); // Populate research buttons, daily actions
    UI.refreshGrimoireDisplay(); // Display the library content
}

// --- Research Actions ---

/**
 * Handles clicking a research button for a specific element.
 * @param {{currentTarget: HTMLElement, isFree: boolean}} eventData - Data about the event.
 */
export function handleResearchClick({ currentTarget, isFree = false }) {
    const buttonCard = currentTarget; // This is the .initial-discovery-element div
    if (!buttonCard || !buttonCard.dataset || !buttonCard.dataset.elementKey) {
        console.error("handleResearchClick called with invalid target:", currentTarget);
        return;
    }
    const elementKey = buttonCard.dataset.elementKey; // 'A', 'I', ..., 'RF'
    const cost = parseFloat(buttonCard.dataset.cost); // Base cost from config

    if (!elementKey || isNaN(cost)) {
        console.error(`Invalid research button data. Key: ${elementKey}, Cost: ${cost}`);
        return;
    }
    if (buttonCard.classList.contains('disabled')) {
        // console.log("Research button is disabled (likely insufficient insight)."); // Reduce noise
        return;
    }

    let conducted = false;
    if (isFree && State.getInitialFreeResearchRemaining() > 0) {
        if (State.useInitialFreeResearch()) { // Decrements count and saves state
            conducted = true;
            conductResearch(elementKey); // Perform the research logic
            console.log(`Logic: Used initial free research on ${elementKey}.`);
        } else {
            UI.showTemporaryMessage("No initial free research attempts left.", Config.TOAST_DURATION);
        }
    } else if (!isFree && spendInsight(cost, `Research: ${Utils.getElementShortName(elementKeyToFullName[elementKey])}`)) {
        conducted = true;
        conductResearch(elementKey);
        updateMilestoneProgress('conductResearch', 1); // Track milestone
        checkAndUpdateRituals('conductResearch'); // Check rituals
        console.log(`Logic: Spent ${cost} Insight researching ${elementKey}.`);
    }

    if (conducted) {
        // Onboarding check handled by triggerActionAndCheckOnboarding in main.js
        // Update button states if still on workshop screen
        const workshopScreen = document.getElementById('workshopScreen');
        if (workshopScreen?.classList.contains('current')) {
            UI.displayWorkshopScreenContent(); // Refresh button states (cost/free text)
        }
    }
}

/**
 * Handles clicking the "Daily Meditation" (free research) button.
 */
export function handleFreeResearchClick() {
    if (!State.isFreeResearchAvailable()) {
        UI.showTemporaryMessage("Daily meditation already performed today.", Config.TOAST_DURATION);
        return;
    }
    const attunement = State.getAttunement();
    let targetKey = null;
    let minAtt = Config.MAX_ATTUNEMENT + 1;

    // Find element with the lowest attunement
    for (const key in attunement) { // Includes RF
        if (attunement.hasOwnProperty(key) && typeof attunement[key] === 'number' && attunement[key] < minAtt) {
            minAtt = attunement[key];
            targetKey = key;
        }
    }

    if (!targetKey) {
        console.error("Could not determine target element for free research.");
        return;
    }

    console.log(`Logic: Free daily meditation target: ${targetKey} (${Utils.getElementShortName(elementKeyToFullName[targetKey])})`);
    State.setFreeResearchUsed(); // Mark daily research as used and save state
    UI.displayWorkshopScreenContent(); // Update button state immediately
    conductResearch(targetKey); // Perform the research
    updateMilestoneProgress('freeResearch', 1); // Track milestone
    checkAndUpdateRituals('freeResearch'); // Check rituals

    // Onboarding check handled by triggerActionAndCheckOnboarding in main.js
}

/**
 * Performs the actual research logic for a given element.
 * Includes RoleFocus.
 * @param {string} elementKeyToResearch - The single-letter key ('A'...'RF') for the element.
 */
export function conductResearch(elementKeyToResearch) {
    const elementNameKey = elementKeyToFullName[elementKeyToResearch]; // "Attraction", ..., "RoleFocus"
    if (!elementNameKey) {
        console.error(`Invalid element key for research: ${elementKeyToResearch}`);
        return;
    }
    const shortName = Utils.getElementShortName(elementNameKey);
    console.log(`Logic: Conducting research for: ${shortName} (Key: ${elementKeyToResearch})`);
    UI.showTemporaryMessage(`Researching ${shortName}...`, 1500);

    const discoveredIds = new Set(State.getDiscoveredConcepts().keys());
    const discoveredRepo = State.getRepositoryItems();
    let specialFindMade = false; // Track if a repo item was found this time
    const roll = Math.random();
    const insightChance = 0.12; // Chance to find an Elemental Insight
    const sceneChance = 0.08; // Chance to find a Scene Blueprint (after insight check)
    const repositoryScreen = document.getElementById('repositoryScreen'); // Check if repo screen is active

    // 1. Check for special repository items (Insights or Scenes)
    if (roll < insightChance) { // Check for Insight first
        // Filter unseen insights relevant to the element, or any unseen if none specific
        const relevantInsights = elementalInsights.filter(i => i.element === elementKeyToResearch && !discoveredRepo.insights.has(i.id));
        const anyUnseenInsights = elementalInsights.filter(i => !discoveredRepo.insights.has(i.id));
        const insightPool = relevantInsights.length > 0 ? relevantInsights : anyUnseenInsights;

        if (insightPool.length > 0) {
            const foundInsight = insightPool[Math.floor(Math.random() * insightPool.length)];
            if (State.addRepositoryItem('insights', foundInsight.id)) { // Add to state (saves)
                specialFindMade = true;
                UI.showTemporaryMessage(`Elemental Insight Found: "${foundInsight.text}" (Check Repository)`, 4000);
                updateMilestoneProgress('repositoryInsightsCount', State.getRepositoryItems().insights.size);
                if(repositoryScreen?.classList.contains('current')) UI.displayRepositoryContent(); // Refresh repo if open
                gainAttunementForAction('researchSpecial', elementKeyToResearch, 0.8); // Grant bonus attunement
            }
        }
    } else if (roll < (insightChance + sceneChance)) { // Check for Scene next
        // Filter unseen scenes relevant to the element, or any unseen if none specific
        const availableScenes = sceneBlueprints.filter(s => s.element === elementKeyToResearch && !discoveredRepo.scenes.has(s.id));
        const anyUnseenScenes = sceneBlueprints.filter(s => !discoveredRepo.scenes.has(s.id));
        const scenePool = availableScenes.length > 0 ? availableScenes : anyUnseenScenes;

        if (scenePool.length > 0) {
            const foundScene = scenePool[Math.floor(Math.random() * scenePool.length)];
            if (State.addRepositoryItem('scenes', foundScene.id)) { // Add to state (saves)
                specialFindMade = true;
                UI.showTemporaryMessage(`Scene Blueprint Discovered: '${foundScene.name}' (Check Repository)`, 4000);
                if(repositoryScreen?.classList.contains('current')) UI.displayRepositoryContent(); // Refresh repo if open
                gainAttunementForAction('researchSpecial', elementKeyToResearch, 0.8); // Grant bonus attunement
            }
        }
    }

    // 2. Find new Concepts
    const conceptPool = concepts.filter(c => c.primaryElement === elementKeyToResearch && !discoveredIds.has(c.id));

    if (conceptPool.length === 0) {
        // No concepts left for this element
        if (!specialFindMade) { // Only grant duplicate insight if nothing else was found
            gainInsight(1.5, `Research Echoes: ${shortName}`);
            UI.displayResearchResults({ concepts: [], duplicateInsightGain: 1.5 });
            gainAttunementForAction('researchFail', elementKeyToResearch); // Small attunement for trying
        } else {
             // Special item found, but no concepts left. Display empty results without penalty/bonus.
             UI.displayResearchResults({ concepts: [], duplicateInsightGain: 0 });
             // Attunement already granted by 'researchSpecial'
        }
        return; // Stop here if no concepts left
    }

    // Select concepts if pool is not empty
    const numResults = Math.min(conceptPool.length, Math.floor(Math.random() * 3) + 1); // 1-3 results
    const selectedOut = [];
    const availableIndices = Array.from(conceptPool.keys());

    while (selectedOut.length < numResults && availableIndices.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        const poolIndex = availableIndices.splice(randomIndex, 1)[0]; // Remove index to prevent duplicates
        selectedOut.push(conceptPool[poolIndex]);
    }

    console.log(`Logic: Research Results for ${shortName}:`, selectedOut.map(c => c.name));

    if (selectedOut.length > 0) {
        // Check for milestones related to discovery
        if (selectedOut.some(c => c.rarity === 'rare')) {
            updateMilestoneProgress('discoverRareCard', 1);
        }
        gainAttunementForAction('researchSuccess', elementKeyToResearch); // Grant attunement for finding concepts
        UI.displayResearchResults({ concepts: selectedOut, duplicateInsightGain: 0 });
    } else if (!specialFindMade) {
        // This case should be rare now if conceptPool.length > 0 initially, but handle defensively
        console.warn(`Research for ${shortName} selected 0 results despite non-empty pool.`);
        UI.displayResearchResults({ concepts: [], duplicateInsightGain: 0 });
        gainAttunementForAction('researchFail', elementKeyToResearch);
    }
    // If specialFindMade and selectedOut.length is 0, the special find message was already shown,
    // and the results popup will just show the empty state or duplicate insight.
}


// --- Reflection Confirmation Logic ---

/**
 * Handles the confirmation of a reflection prompt.
 * @param {boolean} nudgeAllowed - Whether the user allowed score nudging (for Dissonance/Dilemma).
 */
export function handleConfirmReflection(nudgeAllowed) {
    if (!currentPromptId) {
        console.error("No current prompt ID for reflection confirmation.");
        UI.hidePopups(); // Close the broken popup
        return;
    }
    console.log(`Logic: Reflection confirmed: Context=${currentReflectionContext}, Prompt=${currentPromptId}, Nudge Allowed=${nudgeAllowed}`);
    State.addSeenPrompt(currentPromptId); // Mark prompt as seen (saves state)

    let rewardAmt = 5.0; // Default reward
    let attuneKey = null; // Element key for specific attunement gain
    let attuneAmt = 1.0; // Default attunement amount
    let milestoneAct = 'completeReflection'; // Default milestone action
    let reflectionSourceText = `Reflection (${currentReflectionContext || 'Unknown'})`;
    const personaScreen = document.getElementById('personaScreen'); // For potential UI refresh after nudge

    // Determine reward amount and specific effects based on context
    switch (currentReflectionContext) {
        case 'Guided':
            rewardAmt = Config.GUIDED_REFLECTION_COST + 3; // Refund cost + bonus
            // currentReflectionCategory holds the element name key ('Attraction', ..., 'RoleFocus')
            reflectionSourceText = `Guided Reflection (${Utils.getElementShortName(currentReflectionCategory) || 'Unknown'})`;
            // Map name key back to letter key for attunement
            attuneKey = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === currentReflectionCategory);
            break;
        case 'RareConcept':
            rewardAmt = 8.0;
            const conceptDataRare = State.getDiscoveredConceptData(reflectionTargetConceptId);
            reflectionSourceText = `Rare Reflection (${conceptDataRare?.concept?.name || 'Unknown Concept'})`;
            attuneKey = conceptDataRare?.concept?.primaryElement || null; // Get element from concept ('A'...'RF')
            break;
        case 'SceneMeditation':
            const scene = sceneBlueprints.find(s => s.reflectionPromptId === currentPromptId);
            rewardAmt = (scene?.meditationCost || Config.SCENE_MEDITATION_BASE_COST) + 5; // Refund cost + bonus
            reflectionSourceText = `Scene Meditation (${scene?.name || 'Unknown Scene'})`;
            attuneKey = scene?.element || null; // Get element from scene data ('A'...'RF')
            break;
        case 'Dissonance':
            milestoneAct = 'completeReflectionDissonance';
            attuneAmt = 0.5; // Smaller attunement gain for dissonance
            rewardAmt = 3.0;
            const dissonantConcept = concepts.find(c => c.id === reflectionTargetConceptId);
            reflectionSourceText = `Dissonance Reflection (${dissonantConcept?.name || 'Unknown Concept'})`;

            // Apply score nudge if allowed and target concept exists with valid scores
            // Strict check for 7 scores
            const conceptScores = dissonantConcept?.elementScores;
            const conceptScoresValid = conceptScores && Object.keys(conceptScores).length === elementNames.length;

            if (nudgeAllowed && reflectionTargetConceptId && conceptScoresValid) {
                console.log("Logic: Processing score nudge for Dissonance...");
                const currentScores = State.getScores();
                const newScores = { ...currentScores };
                let nudged = false;
                const expectedKeys = Object.keys(elementKeyToFullName); // A, I, S, P, C, R, RF
                for (const key of expectedKeys) { // Iterate through 'A'...'RF'
                    if (currentScores.hasOwnProperty(key) && conceptScores.hasOwnProperty(key)) {
                        const uScore = currentScores[key];
                        const cScore = conceptScores[key];
                        const diff = cScore - uScore;
                        // Only nudge if difference is somewhat significant
                        if (Math.abs(diff) > 0.5) {
                            const nudgeVal = Math.sign(diff) * Config.SCORE_NUDGE_AMOUNT;
                            newScores[key] = Math.max(0, Math.min(10, uScore + nudgeVal)); // Apply nudge and clamp
                            if (newScores[key] !== uScore) nudged = true;
                        }
                    }
                }
                if (nudged) {
                    State.updateScores(newScores); // Save updated scores
                    console.log("Logic: Nudged Scores:", State.getScores());
                    if (personaScreen?.classList.contains('current')) { UI.displayPersonaScreen(); } // Refresh persona screen if visible
                    UI.showTemporaryMessage("Core understanding shifted slightly.", 3500);
                    gainAttunementForAction('scoreNudge', 'All'); // Updated call
                    updateMilestoneProgress('scoreNudgeApplied', 1); // Track milestone
                }
            } else if (nudgeAllowed && (!conceptScoresValid)) {
                 console.warn(`Score nudge skipped for ${dissonantConcept?.name}: Concept scores invalid/incomplete.`);
            }

            // Add the concept to the Grimoire NOW after reflection is confirmed
            if (reflectionTargetConceptId) {
                // Use internal function which handles logging, attunement, etc.
                if (addConceptToGrimoireInternal(reflectionTargetConceptId, 'dissonanceConfirm')) {
                     // Update the research popup item state if it's still open and pending
                     const researchResultsPopup = document.getElementById('researchResultsPopup');
                     const researchPopupContent = document.getElementById('researchPopupContent');
                     const researchPopupIsOpen = researchResultsPopup && !researchResultsPopup.classList.contains('hidden');
                     // Find item marked as 'pending_dissonance'
                     const pendingItem = researchPopupContent?.querySelector(`.research-result-item[data-concept-id="${reflectionTargetConceptId}"][data-choice-made="pending_dissonance"]`);
                     if (researchPopupIsOpen && pendingItem) {
                         UI.handleResearchPopupAction(reflectionTargetConceptId, 'kept_after_dissonance'); // Update UI in popup
                     }
                } else {
                     console.warn(`Failed to add concept ${reflectionTargetConceptId} after dissonance confirmation (might already exist?).`);
                     // Optionally: update research popup to show an error state?
                     // UI.handleResearchPopupAction(reflectionTargetConceptId, 'error_adding');
                }
            } else {
                 console.warn("Dissonance reflection confirmed but no target concept ID found to add.");
            }
            break; // End Dissonance specific handling

        default: // Standard or unknown context
            rewardAmt = 5.0;
            // currentReflectionCategory holds the element name key ('Attraction', ..., 'RoleFocus')
            reflectionSourceText = `Standard Reflection (${Utils.getElementShortName(currentReflectionCategory) || 'General'})`;
            // Map name key back to letter key for attunement
            attuneKey = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === currentReflectionCategory);
            break;
    }

    gainInsight(rewardAmt, reflectionSourceText); // Grant insight reward

    // Apply attunement gain
    if (attuneKey) {
        gainAttunementForAction('completeReflection', attuneKey, attuneAmt);
    } else {
        // If no specific element targeted (e.g., Dissonance), grant generic boost
        gainAttunementForAction('completeReflectionGeneric', 'All', 0.2);
    }

    // Update milestones and rituals
    updateMilestoneProgress(milestoneAct, 1); // Tracks 'completeReflection' or 'completeReflectionDissonance'
    checkAndUpdateRituals('completeReflection'); // Generic ritual trigger
    // Trigger specific ritual if context/prompt matches one
    const ritualCtxMatch = `${currentReflectionContext}_${currentPromptId}`;
    checkAndUpdateRituals('completeReflection', { contextMatch: ritualCtxMatch });

    UI.hidePopups(); // Close the reflection modal
    UI.showTemporaryMessage("Reflection complete! Insight gained.", Config.TOAST_DURATION);

    // Onboarding check handled by triggerActionAndCheckOnboarding in main.js
}

// --- Grimoire / Collection Actions ---

/**
 * Handles the user's choice (Keep/Sell) for a concept in the Research Results popup.
 * @param {number} conceptId - The ID of the concept.
 * @param {string} action - The chosen action ('keep' or 'sell').
 */
export function handleResearchPopupChoice(conceptId, action) {
    const concept = concepts.find(c => c.id === conceptId);
    if (!concept || !concept.elementScores) {
        console.error(`Cannot process choice: Concept ${conceptId} not found or missing scores.`);
        UI.handleResearchPopupAction(conceptId, 'error_unknown'); // Update UI to show error
        return;
    }
     // Strict check for 7 scores
     const expectedKeys = Object.keys(elementKeyToFullName);
     const conceptScoresValid = concept.elementScores &&
                                typeof concept.elementScores === 'object' &&
                                expectedKeys.length === Object.keys(concept.elementScores).length &&
                                expectedKeys.every(key => concept.elementScores.hasOwnProperty(key) && typeof concept.elementScores[key] === 'number' && !isNaN(concept.elementScores[key]));

     if (!conceptScoresValid) {
         console.error(`Concept ${conceptId} (${concept.name}) has incomplete/invalid scores. Cannot process choice.`);
         UI.handleResearchPopupAction(conceptId, 'error_unknown');
         return;
     }

    console.log(`Logic: Processing research choice: ${action} for ${concept.name} (ID: ${conceptId})`);

    if (action === 'keep') {
        const distance = Utils.euclideanDistance(State.getScores(), concept.elementScores, concept.name);
        if (distance > Config.DISSONANCE_THRESHOLD) {
            // Trigger Dissonance Reflection instead of adding immediately
            triggerReflectionPrompt('Dissonance', concept.id);
            UI.handleResearchPopupAction(conceptId, 'pending_dissonance'); // Update UI state
            console.log(`Logic: Dissonance triggered for ${concept.name}. Addition deferred pending reflection.`);
        } else {
            // Attempt to add to Grimoire directly
            if(addConceptToGrimoireInternal(conceptId, 'researchKeep')) {
                UI.handleResearchPopupAction(conceptId, 'kept'); // Update UI state to 'kept'
                // Onboarding check happens inside addConceptToGrimoireInternal via triggerActionAndCheckOnboarding
            } else {
                // Failed to add (e.g., already exists somehow, though shouldn't happen here)
                 UI.handleResearchPopupAction(conceptId, 'error_adding');
                 console.warn(`Failed to add concept ${conceptId} from research popup, though it wasn't dissonant.`);
            }
        }
    } else if (action === 'sell') {
        const discoveryValue = Config.CONCEPT_DISCOVERY_INSIGHT[concept.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default;
        const sellValue = discoveryValue * Config.SELL_INSIGHT_FACTOR;
        gainInsight(sellValue, `Sold from Research: ${concept.name}`);
        updateMilestoneProgress('sellConcept', 1); // Track milestone
        checkAndUpdateRituals('sellConcept'); // Check rituals
        UI.handleResearchPopupAction(conceptId, 'sold'); // Update UI state
        console.log(`Logic: Sold ${concept.name} from research for ${sellValue.toFixed(1)} Insight.`);
    } else {
        console.warn(`Unknown action '${action}' in handleResearchPopupChoice`);
        UI.handleResearchPopupAction(conceptId, 'error_unknown'); // Update UI to indicate error
    }
}

/**
 * Internal function to add a concept to the Grimoire state and handle related effects.
 * Assumes checks for dissonance/existence have already happened if necessary.
 * @param {number} conceptId - The ID of the concept to add.
 * @param {string} [context='unknown'] - Where the add originated from (e.g., 'researchKeep', 'detailPopup', 'synergy').
 * @returns {boolean} True if successfully added, false otherwise.
 */
function addConceptToGrimoireInternal(conceptId, context = 'unknown') {
    const conceptToAdd = concepts.find(c => c.id === conceptId);
    if (!conceptToAdd) {
        console.error("Internal add fail: Concept data not found for ID:", conceptId);
        return false;
    }
    if (State.getDiscoveredConcepts().has(conceptId)) {
        console.warn(`Attempted to re-add already discovered concept ${conceptId} (${conceptToAdd.name}). Context: ${context}`);
        return false; // Don't re-add
    }

    console.log(`Logic: Adding '${conceptToAdd.name}' (ID: ${conceptId}) to Grimoire. Context: ${context}`);

    // Add to state first (this saves the game)
    if (State.addDiscoveredConcept(conceptId, conceptToAdd)) {
        let insightReward = Config.CONCEPT_DISCOVERY_INSIGHT[conceptToAdd.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default;
        let bonusInsight = 0;
        let synergyMessage = null;

        // Synergy Check: Check related concepts
        if (conceptToAdd.relatedIds && conceptToAdd.relatedIds.length > 0) {
            const discoveredMap = State.getDiscoveredConcepts();
            const undiscoveredRelated = conceptToAdd.relatedIds.filter(id => !discoveredMap.has(id));

            // Bonus for linking to already discovered concepts
            for (const relatedId of conceptToAdd.relatedIds) {
                if (discoveredMap.has(relatedId)) {
                    bonusInsight += Config.SYNERGY_INSIGHT_BONUS;
                    if (!synergyMessage) { // Only show message for the first synergy found
                        const relatedConcept = discoveredMap.get(relatedId)?.concept;
                        synergyMessage = `Synergy Bonus: +${Config.SYNERGY_INSIGHT_BONUS.toFixed(1)} Insight (Related to ${relatedConcept?.name || 'a known concept'})`;
                    }
                }
            }

            // Chance to auto-discover an undiscovered related concept
            if (undiscoveredRelated.length > 0 && Math.random() < Config.SYNERGY_DISCOVERY_CHANCE) {
                const relatedIdToDiscover = undiscoveredRelated[Math.floor(Math.random() * undiscoveredRelated.length)];
                const relatedConceptData = concepts.find(c => c.id === relatedIdToDiscover);
                // Ensure it's not *already* discovered (double check) before adding recursively
                if (relatedConceptData && !State.getDiscoveredConcepts().has(relatedIdToDiscover)) {
                    console.log(`Logic: Synergy discovery! Attempting to add ${relatedConceptData.name} (ID: ${relatedIdToDiscover})`);
                    // Call recursively, marking context as 'synergy'
                    if (addConceptToGrimoireInternal(relatedIdToDiscover, 'synergy')) {
                        // Show message only if recursive add was successful
                        UI.showTemporaryMessage(`Synergy Resonance: Focusing ${conceptToAdd.name} also revealed ${relatedConceptData.name}! Check your Grimoire.`, 5000);
                    }
                }
            }
        }

        insightReward += bonusInsight;
        gainInsight(insightReward, `Discovered: ${conceptToAdd.name}${bonusInsight > 0 ? ' (Synergy)' : ''}`);
        gainAttunementForAction('addToGrimoire', conceptToAdd.primaryElement, 0.6);

        // Queue rare prompt if applicable
        if (conceptToAdd.rarity === 'rare' && conceptToAdd.uniquePromptId && reflectionPrompts.RareConcept?.[conceptToAdd.uniquePromptId]) {
            State.addPendingRarePrompt(conceptToAdd.uniquePromptId);
            console.log(`Logic: Queued rare prompt ${conceptToAdd.uniquePromptId} for concept ${conceptToAdd.name}`);
        }

        // --- Post-Add Updates ---
        UI.updateGrimoireCounter(); // Update nav counter
        // If the concept detail popup is currently open for this concept, refresh it
        if (getCurrentPopupConceptId() === conceptId && !document.getElementById('conceptDetailPopup')?.classList.contains('hidden')) {
             UI.showConceptDetailPopup(conceptId); // Refresh popup view
        }
        checkTriggerReflectionPrompt('add'); // Check if adding this card triggers a standard reflection
        updateMilestoneProgress('addToGrimoire', 1);
        updateMilestoneProgress('discoveredConcepts.size', State.getDiscoveredConcepts().size);
        checkAndUpdateRituals('addToGrimoire', { conceptId: conceptId, rarity: conceptToAdd.rarity, conceptType: conceptToAdd.cardType });
        UI.refreshGrimoireDisplay(); // Refresh library view if open

        // Show confirmation message (unless added silently via synergy or dissonance confirm)
        if (context !== 'synergy' && context !== 'dissonanceConfirm') {
            UI.showTemporaryMessage(`${conceptToAdd.name} added to Grimoire!`, Config.TOAST_DURATION);
            if (synergyMessage) {
                setTimeout(() => UI.showTemporaryMessage(synergyMessage, 3500), 500); // Show synergy bonus after main message
            }
        } else if (context === 'dissonanceConfirm') {
            UI.showTemporaryMessage(`${conceptToAdd.name} accepted into Grimoire after reflection.`, Config.TOAST_DURATION);
        }

        // Onboarding check handled by triggerActionAndCheckOnboarding in main.js ('addToGrimoire', phase 4)

        return true; // Success
    } else {
        // This should be rare if pre-checks are done, but handle state update failure
        console.error(`Logic Error: State failed to add concept ${conceptToAdd.name} (ID: ${conceptId}).`);
        UI.showTemporaryMessage(`Error adding ${conceptToAdd.name}.`, Config.TOAST_DURATION);
        return false; // Failure
    }
}

/**
 * Adds a concept to the Grimoire when triggered from the detail popup button.
 * Handles Dissonance check.
 * @param {number} conceptId - The ID of the concept to add.
 * @param {HTMLElement | null} buttonElement - The button element clicked (for UI updates).
 */
export function addConceptToGrimoireById(conceptId, buttonElement = null) {
     if (State.getDiscoveredConcepts().has(conceptId)) {
         UI.showTemporaryMessage("Already in Grimoire.", 2500);
         if(buttonElement) UI.updateGrimoireButtonStatus(conceptId); // Ensure button state is correct
         return;
     }
     const concept = concepts.find(c => c.id === conceptId);
     const expectedKeys = Object.keys(elementKeyToFullName);
     const conceptScoresValid = concept?.elementScores &&
                                typeof concept.elementScores === 'object' &&
                                expectedKeys.length === Object.keys(concept.elementScores).length &&
                                expectedKeys.every(key => concept.elementScores.hasOwnProperty(key) && typeof concept.elementScores[key] === 'number' && !isNaN(concept.elementScores[key]));

     if (!concept || !conceptScoresValid) {
         console.error("Cannot add concept: Not found or missing/incomplete scores. ID:", conceptId);
         UI.showTemporaryMessage("Error: Concept data invalid.", 3000);
         return;
     }

     const distance = Utils.euclideanDistance(State.getScores(), concept.elementScores, concept.name);
     if (distance > Config.DISSONANCE_THRESHOLD) {
         // Trigger Dissonance reflection instead of adding
         triggerReflectionPrompt('Dissonance', concept.id);
         if(buttonElement) buttonElement.disabled = true; // Disable button while reflection pending
         UI.showTemporaryMessage("Dissonance detected! A reflection prompt will appear.", 3500);
     } else {
         // Add directly if not dissonant
         if (addConceptToGrimoireInternal(conceptId, 'detailPopup')) {
             if(buttonElement) UI.updateGrimoireButtonStatus(conceptId); // Update button state after successful add
             // Onboarding check handled by triggerActionAndCheckOnboarding in main.js ('addToGrimoire', phase 4)
         }
     }
}

/**
 * Toggles the focus status for the concept currently displayed in the detail popup.
 */
export function handleToggleFocusConcept() {
    if (currentlyDisplayedConceptId === null) return;
    const conceptId = currentlyDisplayedConceptId;
    if (handleCardFocusToggle(conceptId)) { // Call core logic
         UI.updateFocusButtonStatus(conceptId); // Update button state in the popup
         // Onboarding check handled by triggerActionAndCheckOnboarding in main.js ('markFocus', phase 5)
    }
}

/**
 * Toggles the focus status for a given concept ID. Handles state, UI updates, and related effects.
 * @param {number} conceptId - The ID of the concept to toggle focus for.
 * @returns {boolean} True if focus state was successfully changed, false otherwise (e.g., slots full).
 */
export function handleCardFocusToggle(conceptId) {
    if (isNaN(conceptId)) {
        console.error("Invalid concept ID for focus toggle.");
        return false;
    }
    const result = State.toggleFocusConcept(conceptId); // Handles state update & saves

    if (result === 'not_discovered') {
        UI.showTemporaryMessage("Concept not in Grimoire.", 3000);
        return false;
    }
    else if (result === 'slots_full') {
        UI.showTemporaryMessage(`Focus slots full (${State.getFocusSlots()}). Remove another concept first.`, 3000);
        return false;
    }
    else { // Successfully added or removed
        const conceptName = State.getDiscoveredConceptData(conceptId)?.concept?.name || `ID ${conceptId}`;
        const isFocused = result === 'added'; // Check the result string
        if (isFocused) {
            UI.showTemporaryMessage(`${conceptName} marked as Focus!`, 2500);
            gainInsight(1.0, `Focused on ${conceptName}`);
            const concept = State.getDiscoveredConceptData(conceptId)?.concept;
            if (concept?.primaryElement) {
                gainAttunementForAction('markFocus', concept.primaryElement, 1.0); // Grant attunement
            }
            updateMilestoneProgress('markFocus', 1);
            updateMilestoneProgress('focusedConcepts.size', State.getFocusedConcepts().size);
            checkAndUpdateRituals('markFocus', { conceptId: conceptId });
            // Onboarding check handled by main.js trigger
        } else {
            UI.showTemporaryMessage(`${conceptName} removed from Focus.`, 2500);
            checkAndUpdateRituals('removeFocus'); // Check if removing focus triggers anything
        }

        // --- Update UI and related game elements ---
        UI.refreshGrimoireDisplay(); // Update card appearance in library
        calculateTapestryNarrative(true); // Recalculate narrative immediately
        checkSynergyTensionStatus(); // Update synergy button status
        // Update Persona screen elements if it's the current view
        const personaScreen = document.getElementById('personaScreen');
        if (personaScreen?.classList.contains('current')) {
            UI.displayFocusedConceptsPersona();
            UI.generateTapestryNarrative();
            UI.synthesizeAndDisplayThemesPersona();
        }
        checkForFocusUnlocks(); // Check if new combination unlocks items
        UI.updateElementalDilemmaButtonState(); // Update button availability
        UI.updateSuggestSceneButtonState(); // Update button availability
        // Update button state in the detail popup if it's open for this concept
        if (getCurrentPopupConceptId() === conceptId) {
            UI.updateFocusButtonStatus(conceptId);
        }
        return true; // Indicate success
    }
}

/**
 * Handles selling a concept card.
 * @param {Event} event - The click event from a sell button.
 */
export function handleSellConcept(event) {
    const button = event.target.closest('button[data-concept-id]');
    if (!button) return;

    const conceptId = parseInt(button.dataset.conceptId);
    const context = button.dataset.context; // 'grimoire' or 'detailPopup'
    if (isNaN(conceptId)) {
        console.error("Invalid concept ID for selling.");
        return;
    }

    const discoveredData = State.getDiscoveredConceptData(conceptId);
    const concept = discoveredData?.concept;
    if (!concept) {
        console.error(`Sell fail: Concept ${conceptId} not found in state.`);
        UI.showTemporaryMessage("Error selling concept.", 3000);
        return;
    }

    let discoveryValue = Config.CONCEPT_DISCOVERY_INSIGHT[concept.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default;
    const sellValue = discoveryValue * Config.SELL_INSIGHT_FACTOR;
    const sourceLoc = (context === 'grimoire') ? 'Grimoire Library Card' : 'Detail Popup';

    if (confirm(`Sell '${concept.name}' (${concept.rarity}) from ${sourceLoc} for ${sellValue.toFixed(1)} Insight? This is permanent.`)) {
        gainInsight(sellValue, `Sold: ${concept.name}`);
        updateMilestoneProgress('sellConcept', 1);
        checkAndUpdateRituals('sellConcept');

        let focusChanged = State.getFocusedConcepts().has(conceptId); // Check if it was focused BEFORE removing

        // Remove from state (this also removes focus if set)
        if(State.removeDiscoveredConcept(conceptId)) { // This saves state
            UI.updateGrimoireCounter(); // Update nav counter
            UI.refreshGrimoireDisplay(); // Update library view
        } else {
            console.error(`Failed to remove concept ${conceptId} from state during sell.`);
             UI.showTemporaryMessage(`Error removing ${concept.name}.`, 3000);
             // Don't proceed with UI updates if state removal failed
             return;
        }

        // If focus changed, update tapestry and related UI
        if (focusChanged) {
            calculateTapestryNarrative(true);
            checkSynergyTensionStatus();
            const personaScreen = document.getElementById('personaScreen');
            if (personaScreen?.classList.contains('current')) {
                UI.displayFocusedConceptsPersona();
                UI.generateTapestryNarrative();
                UI.synthesizeAndDisplayThemesPersona();
            }
            checkForFocusUnlocks();
            UI.updateElementalDilemmaButtonState();
            UI.updateSuggestSceneButtonState();
        }

        UI.showTemporaryMessage(`Sold ${concept.name} for ${sellValue.toFixed(1)} Insight.`, 2500);

        // If sold from detail popup, close the popup
        if (context !== 'grimoire' && getCurrentPopupConceptId() === conceptId) {
            UI.hidePopups();
        }
    }
}

// --- Reflection Triggering ---

/**
 * Checks if conditions are met to trigger a reflection prompt.
 * @param {string} [triggerAction='other'] - The action causing the check ('add', 'completeQuestionnaire', etc.).
 */
export function checkTriggerReflectionPrompt(triggerAction = 'other') {
    const currentState = State.getState();
    if (currentState.promptCooldownActive) {
        // console.log("Reflection check skipped: Cooldown active.");
        return;
    }

    // Increment trigger count if adding a card
    if (triggerAction === 'add') { State.incrementReflectionTrigger(); }
    // Note: Questionnaire completion trigger is handled elsewhere to avoid double triggering

    const cardsAdded = currentState.cardsAddedSinceLastPrompt;
    const hasPendingRare = currentState.pendingRarePrompts.length > 0;

    // Prioritize pending rare prompts
    if (hasPendingRare) {
        console.log("Logic: Pending rare prompt found. Triggering RareConcept reflection.");
        triggerReflectionPrompt('RareConcept'); // Will fetch the pending ID
        State.resetReflectionTrigger(true); // Reset counter and start cooldown
        startReflectionCooldown(Config.REFLECTION_COOLDOWN);
    }
    // Then check standard trigger threshold
    else if (cardsAdded >= Config.REFLECTION_TRIGGER_THRESHOLD) {
        console.log("Logic: Reflection trigger threshold met. Triggering Standard reflection.");
        triggerReflectionPrompt('Standard');
        State.resetReflectionTrigger(true); // Reset counter and start cooldown
        startReflectionCooldown(Config.REFLECTION_COOLDOWN);
    }
}

/**
 * Starts the cooldown period for standard/rare reflections.
 * @param {number} [duration=Config.REFLECTION_COOLDOWN] - Cooldown duration in milliseconds.
 */
export function startReflectionCooldown(duration = Config.REFLECTION_COOLDOWN) {
    if (reflectionCooldownTimeout) clearTimeout(reflectionCooldownTimeout); // Clear any existing timeout
    State.setPromptCooldownActive(true); // Saves state
    console.log(`Logic: Reflection cooldown started (${duration / 1000}s).`);
    reflectionCooldownTimeout = setTimeout(() => {
        State.clearReflectionCooldown(); // Saves state
        console.log("Logic: Reflection cooldown ended.");
        reflectionCooldownTimeout = null;
    }, duration);
}

/**
 * Selects and displays a reflection prompt based on the context.
 * Handles RoleFocus prompts.
 * @param {string} [context='Standard'] - The trigger context ('Standard', 'Dissonance', 'Guided', 'SceneMeditation', 'RareConcept').
 * @param {number | null} [targetId=null] - Relevant ID (Concept ID for Dissonance/Rare, Scene ID for SceneMeditation).
 * @param {string | null} [category=null] - Relevant category (Element Name Key for Guided/Standard - e.g., "Attraction", "RoleFocus").
 */
export function triggerReflectionPrompt(context = 'Standard', targetId = null, category = null) {
    // Reset temporary state for this reflection
    currentReflectionContext = context;
    reflectionTargetConceptId = (context === 'Dissonance' || context === 'RareConcept') ? targetId : null;
    currentReflectionCategory = (context === 'Guided' || context === 'Standard') ? category : null; // Expects "Attraction", "RoleFocus", etc.
    currentPromptId = null; // Will be set when a prompt is chosen
    let selectedPrompt = null;
    let title = "Moment for Reflection";
    let promptCatLabel = "General"; // Label shown in the modal
    let showNudge = false;
    let reward = 5.0; // Default reward

    console.log(`Logic: Triggering reflection - Context=${context}, TargetID=${targetId}, Category=${category}`);

    // 1. Check for Pending Rare Prompts (Highest priority unless Dissonance/Scene)
    if (context !== 'Dissonance' && context !== 'SceneMeditation') {
        const nextRarePromptId = State.getNextRarePrompt(); // Gets and removes from state queue
        if (nextRarePromptId) {
            selectedPrompt = reflectionPrompts.RareConcept?.[nextRarePromptId];
            if (selectedPrompt) {
                 currentReflectionContext = 'RareConcept'; // Override context
                 currentPromptId = selectedPrompt.id; // Use the rare prompt's ID
                 // Find the concept associated with this rare prompt
                 const conceptEntry = Array.from(State.getDiscoveredConcepts().entries()).find(([id, data]) => data.concept.uniquePromptId === nextRarePromptId);
                 if (conceptEntry) {
                     reflectionTargetConceptId = conceptEntry[0]; // Store the concept ID
                     promptCatLabel = conceptEntry[1].concept.name; // Use concept name as label
                     title = `Reflection: ${promptCatLabel}`;
                 } else {
                     promptCatLabel = "Rare Concept";
                     title = "Rare Concept Reflection";
                     console.warn(`Could not find concept associated with rare prompt ID: ${nextRarePromptId}`);
                 }
                 reward = 8.0; // Higher reward for rare
                 console.log(`Logic: Displaying Queued Rare reflection: ${nextRarePromptId}`);
                 // Check onboarding handled by main.js trigger

                 // Found a rare prompt, display it and exit
                 UI.displayReflectionPrompt({ title, category: promptCatLabel, prompt: selectedPrompt, showNudge, reward }, currentReflectionContext);
                 return;
            } else {
                 // Prompt text missing for the ID, requeue and fallback
                 console.warn(`Rare prompt text missing for ID: ${nextRarePromptId}. Re-queuing and falling back to Standard.`);
                 State.addPendingRarePrompt(nextRarePromptId); // Put it back
                 currentReflectionContext = 'Standard'; // Fallback context
            }
        }
    }

    // 2. Handle Specific Contexts (Dissonance, Guided, SceneMeditation)
    let promptPool = [];
    if (context === 'Dissonance' && targetId) {
        title = "Dissonance Reflection";
        const concept = concepts.find(c => c.id === targetId);
        promptCatLabel = concept ? concept.name : "Dissonant Concept";
        promptPool = reflectionPrompts.Dissonance || [];
        showNudge = true; // Allow nudge for dissonance
        reward = 3.0;
        reflectionTargetConceptId = targetId; // Ensure target ID is set
        if (promptPool.length === 0) { console.warn("No Dissonance prompts defined!"); context = 'Standard'; } // Fallback if none defined
    }
    else if (context === 'Guided' && category) { // category is "Attraction", ..., "RoleFocus"
        title = "Guided Reflection";
        promptCatLabel = Utils.getElementShortName(category); // Use short name for display
        promptPool = reflectionPrompts[category] || []; // Get prompts using the element name key
        reward = Config.GUIDED_REFLECTION_COST + 3; // Refund cost + bonus
        if (promptPool.length === 0) { console.warn(`No Guided prompts for category: ${category}`); context = 'Standard'; } // Fallback
    }
    else if (context === 'SceneMeditation' && targetId) { // targetId is scene ID
        const scene = sceneBlueprints.find(s => s.id === targetId);
        if (scene?.reflectionPromptId) {
            selectedPrompt = reflectionPrompts.SceneMeditation?.[scene.reflectionPromptId];
            if (selectedPrompt) {
                // Found specific scene prompt, display and exit
                title = "Scene Meditation";
                promptCatLabel = scene.name;
                currentPromptId = selectedPrompt.id;
                reward = (scene.meditationCost || Config.SCENE_MEDITATION_BASE_COST) + 5;
                // Check onboarding handled by main.js trigger
                UI.displayReflectionPrompt({ title, category: promptCatLabel, prompt: selectedPrompt, showNudge, reward }, currentReflectionContext);
                return;
            } else {
                 console.warn(`Prompt text missing for SceneMeditation ID: ${scene.reflectionPromptId}. Falling back.`);
                 context = 'Standard'; // Fallback if prompt text missing
            }
        } else {
             console.warn(`Scene ${targetId} has no reflectionPromptId. Falling back.`);
             context = 'Standard'; // Fallback if scene has no prompt ID
        }
    }

    // 3. Handle Standard Reflection (or fallback)
    if (context === 'Standard' || promptPool.length === 0) { // If context is Standard OR previous step failed to find prompts
        currentReflectionContext = 'Standard'; // Ensure context is set correctly
        title = "Standard Reflection";
        reward = 5.0;
        const attunement = State.getAttunement(); // { A: val, ..., RF: val }

        // Find elements with attunement > 0 and available prompts
        // Use elementNames to ensure RF is included
        const validElementKeys = elementNames.filter(nameKey => {
             const key = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === nameKey);
             // Check attunement and if prompts exist for this element name key
             return key && attunement[key] > 0 && reflectionPrompts[nameKey]?.length > 0;
        });

        if (validElementKeys.length > 0) {
            // Select randomly from the top half (most attuned) elements with prompts
            const sortedKeysByName = validElementKeys.sort((a, b) => {
                 const keyA = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === a);
                 const keyB = Object.keys(elementKeyToFullName).find(k => elementKeyToFullName[k] === b);
                 // Ensure keys exist before accessing attunement
                 const attA = keyA ? attunement[keyA] : 0;
                 const attB = keyB ? attunement[keyB] : 0;
                 return attB - attA; // Sort by attunement value DESC
            });
            const topTierCount = Math.max(1, Math.ceil(sortedKeysByName.length / 2));
            const topTierNames = sortedKeysByName.slice(0, topTierCount);
            const selectedElementNameKey = topTierNames[Math.floor(Math.random() * topTierNames.length)]; // "Attraction", ..., "RoleFocus"

            promptPool = reflectionPrompts[selectedElementNameKey] || [];
            promptCatLabel = Utils.getElementShortName(selectedElementNameKey); // Short name for display
            currentReflectionCategory = selectedElementNameKey; // Store the full name key for reward logic
            console.log(`Selected standard reflection category: ${promptCatLabel} (Key: ${selectedElementNameKey})`);
        } else {
            promptPool = []; // No suitable elements found
            console.warn("No reflection prompts available for any attuned elements.");
            // Potentially fallback to a truly generic prompt pool if one existed
            // Or simply don't show a reflection
        }
    }

    // 4. Select Prompt from the chosen Pool (avoiding recently seen if possible)
    if (!selectedPrompt && promptPool.length > 0) {
        const seen = State.getSeenPrompts();
        const available = promptPool.filter(p => !seen.has(p.id));
        if (available.length > 0) {
            // Prefer unseen prompts
            selectedPrompt = available[Math.floor(Math.random() * available.length)];
        } else {
            // If all are seen, select randomly from the pool
            console.log(`All prompts in pool for context ${currentReflectionContext}/${promptCatLabel} have been seen. Selecting randomly.`);
            selectedPrompt = promptPool[Math.floor(Math.random() * promptPool.length)];
        }
        currentPromptId = selectedPrompt.id; // Set the chosen prompt ID
    }

    // 5. Display the Selected Prompt or Handle Failure
    if (selectedPrompt && currentPromptId) {
        const promptData = { title, category: promptCatLabel, prompt: selectedPrompt, showNudge, reward };
        // Check onboarding handled by main.js trigger
        UI.displayReflectionPrompt(promptData, currentReflectionContext);
    } else {
        // Failed to select a prompt (e.g., no prompts defined for any category)
        console.error(`Could not select a reflection prompt for context ${context}.`);
        // Handle specific failure cases if needed
        if (context === 'Dissonance' && reflectionTargetConceptId) {
            console.warn("Failsafe: Dissonance reflection failed to find prompt. Adding concept directly.");
            // If reflection popup couldn't show, add the concept now
             if (addConceptToGrimoireInternal(reflectionTargetConceptId, 'dissonance_prompt_failed')) {
                  UI.handleResearchPopupAction(reflectionTargetConceptId, 'kept_after_dissonance_fail');
             } else {
                  UI.handleResearchPopupAction(reflectionTargetConceptId, 'error_adding');
             }
             // Ensure popup state is cleared if we bypass the modal
             clearPopupState();
             UI.hidePopups(); // Ensure no broken modal stays open
        } else if (context === 'Guided') {
            // Refund insight if guided reflection failed to find prompt
            gainInsight(Config.GUIDED_REFLECTION_COST, "Refund: Guided Reflection Failed");
            UI.showTemporaryMessage("Guided reflection unavailable, Insight refunded.", 3000);
             clearPopupState(); // Clear temp state as reflection failed
             UI.hidePopups(); // Ensure no broken modal stays open
        } else {
            // Generic failure, ensure state is cleared
            clearPopupState();
        }
    }
}

// --- Guided Reflection Trigger ---

/**
 * Triggers a guided reflection, selecting a random suitable element.
 * Includes RoleFocus as a potential element.
 */
export function triggerGuidedReflection() {
    // Find elements that have Guided prompts defined (using elementNames which includes RF)
    const availableElements = elementNames.filter(nameKey => reflectionPrompts[nameKey]?.length > 0);

    if (availableElements.length === 0) {
        UI.showTemporaryMessage("No guided reflections available at this time.", 3000);
        return;
    }
    // Select a random element from those available
    const randomElementKey = availableElements[Math.floor(Math.random() * availableElements.length)]; // "Attraction", ..., "RoleFocus"
    const cost = Config.GUIDED_REFLECTION_COST;

    if (spendInsight(cost, `Seek Guidance: ${Utils.getElementShortName(randomElementKey)}`)) {
        // Trigger the reflection prompt with 'Guided' context and the chosen element name key
        triggerReflectionPrompt('Guided', null, randomElementKey);
        // Onboarding check handled by main.js trigger
    }
}

// --- Notes, Library, Repository Actions ---

/** Handles saving notes from the concept detail popup */
export function handleSaveNote() {
    if (currentlyDisplayedConceptId === null) return;
    const notesTA = document.getElementById('myNotesTextarea');
    if (!notesTA) return;
    const noteText = notesTA.value.trim();
    if (State.updateNotes(currentlyDisplayedConceptId, noteText)) { // Saves state
        UI.updateNoteSaveStatus("Saved!", false);
    } else {
        UI.updateNoteSaveStatus("Error saving note.", true);
    }
}

/** Handles clicking an unlock button for element deep dive levels */
export function handleUnlockLibraryLevel(event) {
    const button = event.target.closest('button.unlock-button');
    if (!button || button.disabled) return;
    const key = button.dataset.elementKey; // 'A', 'I', ..., 'RF'
    const level = parseInt(button.dataset.level);
    if (!key || isNaN(level)) {
        console.error("Invalid library unlock button data", {key, level});
        return;
    }
    unlockDeepDiveLevelInternal(key, level);
     // Onboarding check handled by main.js trigger
}

/** Internal logic for unlocking deep dive levels (Handles RF key) */
function unlockDeepDiveLevelInternal(elementKey, levelToUnlock) {
    // Map key 'A'...'RF' to name key 'Attraction'...'RoleFocus' for data lookup
    const elementNameKey = elementKeyToFullName[elementKey];
    if (!elementNameKey) {
        console.error(`Invalid element key '${elementKey}' for deep dive unlock.`);
        return false;
    }
    const deepDiveData = elementDeepDive[elementNameKey] || [];
    const levelData = deepDiveData.find(l => l.level === levelToUnlock);
    const currentLevel = State.getState().unlockedDeepDiveLevels[elementKey] || 0;

    if (!levelData || levelToUnlock !== currentLevel + 1) {
        console.warn(`Unlock condition not met for ${elementKey} level ${levelToUnlock}. Current: ${currentLevel}`);
        return false;
    }
    const cost = levelData.insightCost || 0;

    if (spendInsight(cost, `Unlock Insight: ${Utils.getElementShortName(elementNameKey)} Lv ${levelToUnlock}`)) {
        if (State.unlockLibraryLevel(elementKey, levelToUnlock)) { // Saves state
            // Update UI: Refresh Persona screen to show new unlocked level
            const personaScreen = document.getElementById('personaScreen');
            if (personaScreen?.classList.contains('current')) {
                // Call the logic function within this module to update the screen
                displayPersonaScreenLogic(); // Corrected: No UI. prefix
            }
            updateMilestoneProgress('unlockLibrary', levelToUnlock); // Track milestone
            updateMilestoneProgress('unlockedDeepDiveLevels', State.getState().unlockedDeepDiveLevels); // Check aggregate milestones
            checkAndUpdateRituals('unlockLibrary'); // Check rituals
            // Onboarding handled by main.js trigger
            return true;
        } else {
            // Handle state update failure (should be rare)
            console.error(`State update failed for library unlock: ${elementKey} Lvl ${levelToUnlock}`);
            gainInsight(cost, `Refund: Library unlock state error`); // Refund insight
            return false;
        }
    }
    return false; // Failed to spend insight
}


/** Handles clicking meditate button on a scene */
export function handleMeditateScene(event) {
    const button = event.target.closest('button[data-scene-id]');
    if (!button || button.disabled) return;
    const sceneId = button.dataset.sceneId;
    if (!sceneId) return;
    meditateOnSceneInternal(sceneId);
}

/** Internal logic for meditating on a scene */
function meditateOnSceneInternal(sceneId) {
    const scene = sceneBlueprints.find(s => s.id === sceneId);
    if (!scene) {
        console.error(`Scene data not found for ID: ${sceneId}`);
        return;
    }
    const cost = scene.meditationCost || Config.SCENE_MEDITATION_BASE_COST;
    if (spendInsight(cost, `Meditate: ${scene.name}`)) {
        if (scene.reflectionPromptId) {
            // Trigger the specific reflection associated with this scene
            triggerReflectionPrompt('SceneMeditation', sceneId); // targetId is the sceneId
            updateMilestoneProgress('meditateScene', 1);
            checkAndUpdateRituals('meditateScene');
        } else {
            // Refund if scene has no associated prompt
            console.warn(`Scene ${sceneId} (${scene.name}) has no reflectionPromptId defined.`);
            gainInsight(cost, `Refund: Missing prompt for scene ${scene.name}`);
            UI.showTemporaryMessage("Scene has no reflection prompt.", 2500);
        }
        // Refresh repository if open to potentially update button state
         const repositoryScreen = document.getElementById('repositoryScreen');
         if (repositoryScreen?.classList.contains('current')) {
            UI.displayRepositoryContent();
         }
    }
}

/** Handles clicking attempt button on an experiment */
export function handleAttemptExperiment(event) {
    const button = event.target.closest('button[data-experiment-id]');
    if (!button || button.disabled) return;
    const expId = button.dataset.experimentId;
    if (!expId) return;
    attemptExperimentInternal(expId);
}

/** Internal logic for attempting an experiment (Checks RF requirements) */
function attemptExperimentInternal(experimentId) {
    const exp = alchemicalExperiments.find(e => e.id === experimentId);
    if (!exp) {
        console.error(`Experiment data not found for ID: ${experimentId}`);
        return;
    }
    // Check if already completed
    if(State.getRepositoryItems().experiments.has(experimentId)) {
        UI.showTemporaryMessage("Experiment already successfully completed.", 2500);
        return;
    }

    const attunement = State.getAttunement();
    const focused = State.getFocusedConcepts();
    const insight = State.getInsight();
    const scores = State.getScores(); // Includes RF
    let canAttempt = true;
    let unmetReqs = [];

    // Check Requirements
    if (attunement[exp.requiredElement] < exp.requiredAttunement) {
        canAttempt = false;
        unmetReqs.push(`${exp.requiredAttunement} ${Utils.getElementShortName(elementKeyToFullName[exp.requiredElement])} Att.`);
    }
    // Check RF score requirements if they exist
    if (exp.requiredRoleFocusScore !== undefined && (scores.RF ?? 0) < exp.requiredRoleFocusScore) {
        canAttempt = false;
        unmetReqs.push(`RF Score ≥ ${exp.requiredRoleFocusScore}`);
    }
    if (exp.requiredRoleFocusScoreBelow !== undefined && (scores.RF ?? 0) >= exp.requiredRoleFocusScoreBelow) {
        canAttempt = false;
        unmetReqs.push(`RF Score < ${exp.requiredRoleFocusScoreBelow}`);
    }
    // Check focused concept requirements
    if (exp.requiredFocusConceptIds) {
        for (const reqId of exp.requiredFocusConceptIds) {
            if (!focused.has(reqId)) {
                canAttempt = false;
                const c = concepts.find(c=>c.id === reqId);
                unmetReqs.push(c ? `Focus: ${c.name}` : `Focus: ID ${reqId}`);
            }
        }
    }
    // Check focused concept type requirements
    if (exp.requiredFocusConceptTypes) {
        const discoveredMap = State.getDiscoveredConcepts();
        for (const typeReq of exp.requiredFocusConceptTypes) {
            let typeMet = false;
            for (const fId of focused) { // Iterate through focused concept IDs
                const c = discoveredMap.get(fId)?.concept;
                if (c?.cardType === typeReq) {
                    typeMet = true;
                    break; // Found one of the required type
                }
            }
            if (!typeMet) {
                canAttempt = false;
                unmetReqs.push(`Focus Type: ${typeReq}`);
            }
        }
    }
    // Check insight cost
    const cost = exp.insightCost || Config.EXPERIMENT_BASE_COST;
    if (insight < cost) {
        canAttempt = false;
        unmetReqs.push(`${cost} Insight`);
    }

    // Abort if requirements not met
    if (!canAttempt) {
        UI.showTemporaryMessage(`Requires: ${unmetReqs.join(', ')}`, 3500);
        return;
    }

    // Spend insight and attempt
    if (!spendInsight(cost, `Attempt Exp: ${exp.name}`)) return; // Abort if spending failed

    console.log(`Logic: Attempting Experiment: ${exp.name}`);
    updateMilestoneProgress('attemptExperiment', 1);
    checkAndUpdateRituals('attemptExperiment');

    const roll = Math.random();
    const successRate = exp.successRate !== undefined ? exp.successRate : 0.5;

    if (roll < successRate) {
        // --- Success ---
        console.log(`Logic: Experiment '${exp.name}' Succeeded!`);
        State.addRepositoryItem('experiments', exp.id); // Mark as completed (saves state)
        UI.showTemporaryMessage(`Experiment '${exp.name}' Succeeded!`, 3500);
        // Grant rewards if defined
        if (exp.successReward) {
            if (exp.successReward.type === 'insight') {
                gainInsight(exp.successReward.amount || 0, `Exp Success: ${exp.name}`);
            } else if (exp.successReward.type === 'attunement') {
                gainAttunementForAction('experimentSuccess', exp.successReward.element || 'All', exp.successReward.amount || 0);
            } else if (exp.successReward.type === 'discoverCard') {
                 if (exp.successReward.cardId && !State.getDiscoveredConcepts().has(exp.successReward.cardId)) {
                      addConceptToGrimoireInternal(exp.successReward.cardId, 'experimentReward');
                 }
            }
            // Add more reward types as needed
        }
        // Grant bonus attunement related to the experiment's element
        gainAttunementForAction('experimentSuccess', exp.requiredElement, 1.5);
    } else {
        // --- Failure ---
        console.log(`Logic: Experiment '${exp.name}' Failed...`);
        UI.showTemporaryMessage(`Experiment '${exp.name}' Failed... Try again later.`, 3500);
        // Apply consequences if defined
        if (exp.failureConsequence) {
            // Example: Apply consequence text or modify state slightly
            console.warn(`Failure consequence for experiment ${exp.id}: ${exp.failureConsequence}`);
            // Implement more specific consequences (e.g., insight loss, temporary stat debuff)
            if(exp.failureConsequence.toLowerCase().includes('insight loss')) {
                gainInsight(-2, `Exp Fail: ${exp.name}`); // Example small insight loss
            }
        }
        // Grant smaller attunement boost for trying
        gainAttunementForAction('experimentFail', exp.requiredElement, 0.2);
    }

    // Refresh repository screen if it's currently visible
    const repositoryScreen = document.getElementById('repositoryScreen');
    if(repositoryScreen?.classList.contains('current')) {
        UI.displayRepositoryContent();
    }
}

/** Handles clicking the Suggest Scene button */
export function handleSuggestSceneClick() {
    const focused = State.getFocusedConcepts();
    const suggestionOutputDiv = document.getElementById('sceneSuggestionOutput');
    const suggestedSceneContentDiv = document.getElementById('suggestedSceneContent');

    if (focused.size === 0) {
        UI.showTemporaryMessage("Focus on concepts first to generate suggestions.", 3000);
        return;
    }
    const cost = Config.SCENE_SUGGESTION_COST;
    if (!spendInsight(cost, "Suggest Scene")) return;

    console.log("Logic: Suggesting scenes based on focus...");
    const { focusScores } = calculateFocusScores(); // Get averaged scores of focused concepts
    const discoveredScenes = State.getRepositoryItems().scenes;

    // Find dominant elements based on focus scores
    const sortedElements = Object.entries(focusScores)
        .filter(([key, score]) => score > 4.0) // Consider elements with moderate+ focus score
        .sort(([, a], [, b]) => b - a); // Sort highest score first

    // Get top 3 dominant element keys ('A', 'I', ..., 'RF')
    const topElements = sortedElements.slice(0, 3).map(([key]) => key);

    if (topElements.length === 0) {
        UI.showTemporaryMessage("Focus is too broad or neutral to suggest a specific scene.", 3000);
        gainInsight(cost, "Refund: Suggest Scene Fail (Neutral Focus)"); // Refund
        return;
    }

    console.log("Logic: Dominant focus elements for scene suggestion:", topElements);

    // Find relevant scenes (match top elements, not already discovered)
    const relevantUndiscoveredScenes = sceneBlueprints.filter(scene =>
        topElements.includes(scene.element) && !discoveredScenes.has(scene.id)
    );

    if (relevantUndiscoveredScenes.length === 0) {
        UI.showTemporaryMessage("All relevant scenes based on your current focus have already been discovered.", 3500);
        if (suggestionOutputDiv) suggestionOutputDiv.classList.add('hidden'); // Hide output area if nothing new
    } else {
        // Select one randomly from the relevant pool
        const selectedScene = relevantUndiscoveredScenes[Math.floor(Math.random() * relevantUndiscoveredScenes.length)];
        if (State.addRepositoryItem('scenes', selectedScene.id)) { // Add to state (saves)
            console.log(`Logic: Suggested Scene: ${selectedScene.name}`);
            // Display the suggested scene in the output area
            if (suggestionOutputDiv && suggestedSceneContentDiv) {
                const sceneCost = selectedScene.meditationCost || Config.SCENE_MEDITATION_BASE_COST;
                const canAfford = State.getInsight() >= sceneCost;
                const sceneElement = UI.renderRepositoryItem(selectedScene, 'scene', sceneCost, canAfford); // Render the scene item
                suggestedSceneContentDiv.innerHTML = ''; // Clear previous
                suggestedSceneContentDiv.appendChild(sceneElement);
                suggestionOutputDiv.classList.remove('hidden'); // Show the output area
            }
            UI.showTemporaryMessage(`Scene Suggested: '${selectedScene.name}'!`, 4000);
            // Refresh Repository if open
            const repositoryScreen = document.getElementById('repositoryScreen');
            if (repositoryScreen?.classList.contains('current')) {
                UI.displayRepositoryContent();
            }
        } else {
            // Handle state add failure (should be rare)
            console.error(`State failed to add suggested scene ${selectedScene.id}`);
            gainInsight(cost, "Refund: Suggest Scene Error"); // Refund
            if (suggestionOutputDiv) suggestionOutputDiv.classList.add('hidden');
        }
    }
}


// --- Category & Lore Logic ---

/** Handles dropping a card onto a category shelf */
export function handleCategorizeCard(conceptId, categoryId) {
    const currentCategory = State.getCardCategory(conceptId);
    if (currentCategory === categoryId) {
        // console.log(`Card ${conceptId} already in category ${categoryId}.`); // Reduce noise
        return; // No change needed
    }
    if (State.setCardCategory(conceptId, categoryId)) { // Saves state
        console.log(`Logic: Categorized card ${conceptId} as ${categoryId}`);
        UI.refreshGrimoireDisplay(); // Update shelf counts and card appearance
        checkCategoryUnlocks(categoryId); // Check if this categorization unlocks anything
        checkAndUpdateRituals('categorizeCard', { categoryId: categoryId, conceptId: conceptId });
        // Onboarding check handled by triggerActionAndCheckOnboarding in main.js
    } else {
        console.error(`Failed to set category for card ${conceptId}`);
    }
}

/** Checks if categorizing a card triggers any category-based unlocks */
function checkCategoryUnlocks(categoryId) {
    if (!categoryDrivenUnlocks || categoryDrivenUnlocks.length === 0) return;

    // console.log(`Logic: Checking category unlocks for category: ${categoryId}`); // Reduce noise
    const discoveredMap = State.getDiscoveredConcepts();
    // Get IDs of all cards currently in this specific category
    const cardsInCategory = Array.from(discoveredMap.entries())
        .filter(([id, data]) => (data.userCategory || 'uncategorized') === categoryId)
        .map(([id]) => id);
    const cardIdSetInCategory = new Set(cardsInCategory);

    // Check each potential unlock defined in data.js
    categoryDrivenUnlocks.forEach(unlock => {
        // Check if this unlock rule applies to the category the card was just moved TO
        if (unlock.categoryRequired === categoryId ) {
            let requirementsMet = true;
            // Check if all required concepts are now present in this category
            if (!unlock.requiredInSameCategory || unlock.requiredInSameCategory.length === 0) {
                requirementsMet = false; // Needs at least one required concept defined
            } else {
                for (const reqId of unlock.requiredInSameCategory) {
                    if (!cardIdSetInCategory.has(reqId)) {
                        requirementsMet = false; // A required concept is missing
                        break;
                    }
                }
            }

            // If all requirements are met, attempt to grant the reward
            if (requirementsMet) {
                console.log(`Logic: Category unlock requirements met for: ${unlock.id}`);
                const reward = unlock.unlocks;
                let alreadyDone = false;

                // Check if reward is already obtained (e.g., lore already unlocked)
                if (reward.type === 'lore') {
                    const currentLoreLevel = State.getUnlockedLoreLevel(reward.targetConceptId);
                    if (reward.loreLevelToUnlock <= currentLoreLevel) {
                        alreadyDone = true;
                        // console.log(`Category unlock ${unlock.id} skipped: Lore ${reward.targetConceptId} Lvl ${reward.loreLevelToUnlock} already unlocked.`); // Reduce noise
                    }
                }
                // Add checks for other reward types if they can be 'already done'

                if (!alreadyDone) {
                    // Grant the reward
                    let message = unlock.description || `Category Synergy!`; // Default message
                    if (reward.type === 'lore') {
                        if (unlockLoreInternal(reward.targetConceptId, reward.loreLevelToUnlock, `Category Unlock: ${unlock.id}`)) {
                            message += ` New Lore Unlocked!`;
                        } else { message = null; } // Don't show message if unlock failed
                    } else if (reward.type === 'insight') {
                        gainInsight(reward.amount, `Category Unlock: ${unlock.id}`);
                        message += ` Gained ${reward.amount} Insight!`;
                    } else if (reward.type === 'attunement') {
                         gainAttunementForAction('ritual', reward.element || 'All', reward.amount || 0);
                         message += ` Gained ${reward.amount} ${Utils.getElementShortName(elementKeyToFullName[reward.element] || reward.element || 'All')} Attunement!`;
                    }
                    // Add other reward types

                    if (message) UI.showTemporaryMessage(message, 4000);
                }
            }
        }
    });
}

/** Handles clicking the unlock lore button */
export function handleUnlockLore(conceptId, level, cost) {
    console.log(`Logic: Attempting to unlock lore level ${level} for concept ${conceptId} (Cost: ${cost})`);
    const concept = State.getDiscoveredConceptData(conceptId)?.concept;
    if (!concept) {
        console.error(`Cannot unlock lore: Concept ${conceptId} not found.`);
        return;
    }
    if (State.getUnlockedLoreLevel(conceptId) >= level) {
        UI.showTemporaryMessage("Lore already unlocked.", 2000);
        return;
    }
    if (spendInsight(cost, `Unlock Lore: ${concept.name} Lvl ${level}`)) {
        if(unlockLoreInternal(conceptId, level, `Insight Purchase`)) {
             // Onboarding check handled by main.js trigger
        }
    }
}

/** Internal logic for unlocking lore level and updating state/UI */
function unlockLoreInternal(conceptId, level, source = "Unknown") {
    const conceptDetailPopup = document.getElementById('conceptDetailPopup');
    if (State.unlockLoreLevel(conceptId, level)) { // Saves state
        const conceptName = State.getDiscoveredConceptData(conceptId)?.concept?.name || `ID ${conceptId}`;
        console.log(`Logic: Unlocked lore level ${level} for ${conceptName} via ${source}`);
        // If the popup is open for this concept, refresh its content
        if (getCurrentPopupConceptId() === conceptId && conceptDetailPopup && !conceptDetailPopup.classList.contains('hidden')) {
            // Use requestAnimationFrame to ensure DOM updates smoothly after state change
            requestAnimationFrame(() => {
                UI.showConceptDetailPopup(conceptId); // Re-render the popup to show unlocked lore
            });
        } else {
            // If popup not open, refresh grimoire display (might show lore indicator change)
             UI.refreshGrimoireDisplay();
        }
        updateMilestoneProgress('unlockLore', level); // Check milestones related to lore level
        return true;
    } else {
        console.error(`Logic Error: Failed to update lore level in state for ${conceptId}`);
        // Should not happen if checks are correct, but handle defensively
        return false;
    }
}

// --- Synergy/Tension & Tapestry Calculation Logic (Includes RF) ---

/** Checks synergy/tension status based on focused concepts and updates UI */
export function checkSynergyTensionStatus() {
    calculateTapestryNarrative(true); // Ensure analysis is up-to-date
    let status = 'none';
    if (currentTapestryAnalysis) {
        const hasSynergy = currentTapestryAnalysis.synergies.length > 0;
        const hasTension = currentTapestryAnalysis.tensions.length > 0;
        if (hasSynergy && hasTension) status = 'both';
        else if (hasSynergy) status = 'synergy';
        else if (hasTension) status = 'tension';
    }
    UI.updateExploreSynergyButtonStatus(status); // Update button appearance
    return status;
}

/** Handles clicking the Explore Synergy button */
export function handleExploreSynergyClick() {
    if (!currentTapestryAnalysis) {
        calculateTapestryNarrative(true); // Recalculate if missing
        if (!currentTapestryAnalysis) {
             UI.showTemporaryMessage("Focus concepts first to explore synergies.", 3000);
             return;
        }
    }
    // Display the synergy/tension details in the Deep Dive modal UI
    UI.displaySynergyTensionInfo(currentTapestryAnalysis);
}

/** Calculates the average scores based on currently focused concepts (Includes RF) */
export function calculateFocusScores() {
    const expectedKeys = Object.keys(elementKeyToFullName); // A, I, S, P, C, R, RF
    const scores = {};
    expectedKeys.forEach(key => scores[key] = 0); // Initialize all 7

    const focused = State.getFocusedConcepts();
    const disc = State.getDiscoveredConcepts();
    const count = focused.size;

    if (count > 0) {
        focused.forEach(id => {
            const conceptData = disc.get(id)?.concept;
            // Use concept scores if available and complete, otherwise add neutral (5.0)
            const conceptScores = conceptData?.elementScores;
             const scoresValid = conceptScores &&
                                typeof conceptScores === 'object' &&
                                expectedKeys.length === Object.keys(conceptScores).length &&
                                expectedKeys.every(key => conceptScores.hasOwnProperty(key) && typeof conceptScores[key] === 'number' && !isNaN(conceptScores[key]));

            if (scoresValid) {
                expectedKeys.forEach(key => {
                    scores[key] += conceptScores[key];
                });
            } else {
                 if(conceptData) console.warn(`Concept ${conceptData.name} (ID: ${id}) in focus has missing/incomplete scores. Using neutral 5.0 for averaging.`);
                 expectedKeys.forEach(key => { scores[key] += 5.0; }); // Add neutral if scores missing/incomplete
            }
        });
        // Average the scores
        expectedKeys.forEach(key => {
            scores[key] /= count;
        });
    } else {
        // If no concepts focused, return neutral scores
        expectedKeys.forEach(key => scores[key] = 5.0);
    }
    return { focusScores: scores, focusCount: count };
}

/**
 * Calculates the tapestry narrative, themes, synergies, and tensions based on focused concepts.
 * Uses caching based on focus set hash. Includes RF.
 * @param {boolean} [forceRecalculate=false] - Force recalculation even if cache seems valid.
 * @returns {string} The generated HTML narrative string.
 */
export function calculateTapestryNarrative(forceRecalculate = false) {
    const currentCalculatedHash = _calculateFocusSetHash(); // Calculate hash from current focus
    const stateHash = State.getState().currentFocusSetHash;

    // Use cache if not forcing recalculation and the focus set hasn't changed
    if (currentTapestryAnalysis && !forceRecalculate && currentCalculatedHash === stateHash) {
        // console.log("Using cached tapestry analysis."); // Reduce noise
        return currentTapestryAnalysis.fullNarrativeHTML;
    }

    console.log("Logic: Recalculating tapestry narrative (7 Elements)...");
    const focused = State.getFocusedConcepts();
    const focusCount = focused.size;

    // Reset analysis object
    currentTapestryAnalysis = {
        synergies: [], tensions: [], dominantElements: [], dominantCardTypes: [],
        elementThemes: [], cardTypeThemes: [], essenceTitle: "Empty Canvas",
        balanceComment: "", fullNarrativeRaw: "",
        fullNarrativeHTML: 'Mark concepts as "Focus" from the Workshop to weave your narrative.'
    };

    if (focusCount === 0) {
        State.getState().currentFocusSetHash = ''; // Update state hash for empty set
        return currentTapestryAnalysis.fullNarrativeHTML; // Return default message
    }

    const disc = State.getDiscoveredConcepts();
    const { focusScores } = calculateFocusScores(); // Get averaged scores based on focus (includes RF)
    const analysis = currentTapestryAnalysis; // Work directly on the cached object

    // 1. Determine Dominant Elements (Includes RF)
    const sortedElements = Object.entries(focusScores)
        .filter(([key, score]) => score > 3.5) // Consider elements above 'low'
        .sort(([, a], [, b]) => b - a); // Sort highest first

    if (sortedElements.length > 0) {
        analysis.dominantElements = sortedElements.map(([key, score]) => ({
            key: key, // 'A', 'I', ..., 'RF'
            name: Utils.getElementShortName(elementKeyToFullName[key]), // Get display name
            score: score
        }));

        // Generate Element Theme based on top 1-3 elements
        const topElementKeys = analysis.dominantElements.slice(0, 3).map(e => e.key).sort().join('');
        // Look for specific interaction theme (e.g., "AIS", "IRF") or single element theme
        const themeKey = topElementKeys.length > 1 ? topElementKeys : (topElementKeys.length === 1 ? analysis.dominantElements[0].key : null);

        if (themeKey && elementInteractionThemes && elementInteractionThemes[themeKey]) {
            analysis.elementThemes.push(elementInteractionThemes[themeKey]);
        } else if (analysis.dominantElements.length > 0) {
            // Fallback to describing the single most dominant element
            analysis.elementThemes.push(`a strong emphasis on **${analysis.dominantElements[0].name}**.`);
        }

        // Determine Essence Title based on dominant elements
        if (analysis.dominantElements.length >= 2 && analysis.dominantElements[0].score > 6.5 && analysis.dominantElements[1].score > 5.5) {
            analysis.essenceTitle = `${analysis.dominantElements[0].name}/${analysis.dominantElements[1].name} Blend`;
        } else if (analysis.dominantElements.length >= 1 && analysis.dominantElements[0].score > 6.5) {
            analysis.essenceTitle = `${analysis.dominantElements[0].name} Focus`;
        } else {
            analysis.essenceTitle = "Developing"; // Less pronounced dominance
        }
    } else {
        analysis.essenceTitle = "Subtle Balance"; // No element significantly dominant
    }

    // 2. Determine Dominant Card Types
    const typeCounts = {};
    cardTypeKeys.forEach(type => typeCounts[type] = 0); // Initialize counts for all types
    focused.forEach(id => {
        const type = disc.get(id)?.concept?.cardType;
        if (type && typeCounts.hasOwnProperty(type)) {
            typeCounts[type]++;
        }
    });
    analysis.dominantCardTypes = Object.entries(typeCounts)
        .filter(([type, count]) => count > 0) // Only include types present in focus
        .sort(([, a], [, b]) => b - a) // Sort most frequent first
        .map(([type, count]) => ({ type, count }));

    if (analysis.dominantCardTypes.length > 0) {
        const topType = analysis.dominantCardTypes[0].type;
        if (cardTypeThemes && cardTypeThemes[topType]) {
            analysis.cardTypeThemes.push(cardTypeThemes[topType]);
        } else {
             analysis.cardTypeThemes.push(`a focus on ${topType} concepts.`); // Fallback theme
        }
    }

    // 3. Identify Synergies (Directly linked concepts in focus)
    const checkedPairs = new Set(); // Avoid checking pairs twice
    focused.forEach(idA => {
        const conceptA = disc.get(idA)?.concept;
        if (!conceptA?.relatedIds) return; // Skip if no related IDs defined

        focused.forEach(idB => {
            if (idA === idB) return; // Don't compare concept to itself
            const pairKey = [idA, idB].sort().join('-'); // Create unique key for the pair
            if (checkedPairs.has(pairKey)) return; // Skip if already checked

            if (conceptA.relatedIds.includes(idB)) {
                // Found a direct link between two focused concepts
                const conceptB = disc.get(idB)?.concept;
                if (conceptB) {
                    analysis.synergies.push({
                        concepts: [conceptA.name, conceptB.name],
                        text: `The connection between **${conceptA.name}** and **${conceptB.name}** suggests a reinforcing dynamic.`
                    });
                }
            }
            checkedPairs.add(pairKey); // Mark pair as checked
        });
    });

    // 4. Identify Tensions (Concepts with opposing scores in the same element) (Includes RF)
    const highThreshold = 7.0;
    const lowThreshold = 3.0;
    const focusConceptsData = Array.from(focused).map(id => disc.get(id)?.concept).filter(Boolean); // Get data for focused concepts

    if (focusConceptsData.length >= 2) {
        const expectedKeys = Object.keys(elementKeyToFullName); // A, I, S, P, C, R, RF
        for (const key of expectedKeys) { // Check each element key ('A'...'RF')
            const elementName = Utils.getElementShortName(elementKeyToFullName[key]);
            // Check if concept scores exist and contain the key before accessing
            let hasHigh = focusConceptsData.some(c => c.elementScores?.[key] !== undefined && c.elementScores[key] >= highThreshold);
            let hasLow = focusConceptsData.some(c => c.elementScores?.[key] !== undefined && c.elementScores[key] <= lowThreshold);

            if (hasHigh && hasLow) {
                // Tension detected in this element
                const highConcepts = focusConceptsData.filter(c => c.elementScores?.[key] !== undefined && c.elementScores[key] >= highThreshold).map(c => c.name);
                const lowConcepts = focusConceptsData.filter(c => c.elementScores?.[key] !== undefined && c.elementScores[key] <= lowThreshold).map(c => c.name);
                analysis.tensions.push({
                    element: elementName,
                    text: `A potential tension exists within **${elementName}**: concepts like **${highConcepts.join(', ')}** lean high, while **${lowConcepts.join(', ')}** lean low.`
                });
            }
        }
    }

    // 5. Generate Balance Comment
    const scoresArray = Object.values(focusScores);
    const minScore = Math.min(...scoresArray);
    const maxScore = Math.max(...scoresArray);
    const range = maxScore - minScore;
    if (range <= 2.5 && focusCount > 2) {
        analysis.balanceComment = "The focused elements present a relatively balanced profile.";
    } else if (range >= 5.0 && focusCount > 2) {
        analysis.balanceComment = "There's a notable range in elemental emphasis within your focus.";
    } else {
         analysis.balanceComment = ""; // No specific comment needed for moderate range or few cards
    }

    // 6. Construct Final Narrative
    let narrative = `Current Essence: **${analysis.essenceTitle}**. `;
    if (analysis.elementThemes.length > 0) {
        narrative += `Your tapestry currently resonates with ${analysis.elementThemes.join(' ')} `;
    } else {
        narrative += "Your focus presents a unique and subtle balance across the elements. ";
    }
    if (analysis.cardTypeThemes.length > 0) {
        narrative += `The lean towards ${analysis.cardTypeThemes.join(' ')} shapes the expression. `;
    }
    if (analysis.balanceComment) {
        narrative += analysis.balanceComment + " ";
    }
    if (analysis.synergies.length > 0) {
        narrative += ` **Synergies** are reinforcing certain themes${analysis.tensions.length > 0 ? ' while' : '.'} `;
    }
    if (analysis.tensions.length > 0) {
        narrative += ` potential **Tensions** offer areas for deeper exploration.`;
    }

    analysis.fullNarrativeRaw = narrative.trim();
    analysis.fullNarrativeHTML = analysis.fullNarrativeRaw.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Update state hash (cache invalidation marker)
    State.getState().currentFocusSetHash = currentCalculatedHash; // Update hash in state
    console.log("Logic: Recalculated Tapestry Analysis (7 Elements) and updated state hash.");

    return analysis.fullNarrativeHTML;
}

/** Calculates dominant themes based on focused concepts (Includes RF) */
export function calculateFocusThemes() {
    const focused = State.getFocusedConcepts();
    const disc = State.getDiscoveredConcepts();
    if (focused.size === 0) return [];

    const expectedKeys = Object.keys(elementKeyToFullName); // A, I, S, P, C, R, RF
    const counts = {};
    expectedKeys.forEach(key => counts[key] = 0); // Initialize all 7

    const threshold = 7.0; // Consider 'High' or 'Very High' scores as contributing to a theme

    focused.forEach(id => {
        const concept = disc.get(id)?.concept;
        if (concept?.elementScores) {
            for (const key in concept.elementScores) { // key is 'A', 'I', ..., 'RF'
                if (counts.hasOwnProperty(key) && concept.elementScores[key] >= threshold) {
                    counts[key]++;
                }
            }
        }
    });

    // Convert counts to sorted array of { key, name, count }
    const sortedThemes = Object.entries(counts)
        .filter(([key, count]) => count > 0) // Only include elements with counts > 0
        .sort(([, a], [, b]) => b - a) // Sort by count descending
        .map(([key, count]) => ({
            key: key, // 'A', ..., 'RF'
            name: Utils.getElementShortName(elementKeyToFullName[key]), // Get display name
            count: count
        }));

    return sortedThemes;
}

// --- Focus Unlocks (Checks RF) ---
/** Checks if the current focus set unlocks any special items (Handles RF Requirements) */
export function checkForFocusUnlocks(silent = false) {
     // console.log("Logic: Checking focus unlocks..."); // Reduce noise
     let newlyUnlocked = false;
     const focused = State.getFocusedConcepts(); // Set of IDs
     const unlocked = State.getUnlockedFocusItems(); // Set of unlock IDs
     const scores = State.getScores(); // Current user scores, including RF

     focusDrivenUnlocks.forEach(unlock => {
         if (unlocked.has(unlock.id)) return; // Skip already unlocked

         let met = true;
         // 1. Check required concept IDs
         if (!unlock.requiredFocusIds || unlock.requiredFocusIds.length === 0) {
             met = false; // Must require at least one concept
             console.warn(`Focus Unlock ${unlock.id} definition issue: No requiredFocusIds specified.`);
         } else {
             for (const reqId of unlock.requiredFocusIds) {
                 if (!focused.has(reqId)) {
                     met = false; // Required concept not focused
                     break;
                 }
             }
         }
         // 2. Check RF score requirement (above threshold)
         if (met && unlock.requiredRoleFocusScore !== undefined) {
             if ((scores.RF ?? 0) < unlock.requiredRoleFocusScore) { // Use nullish coalescing for safety
                 met = false; // RF score too low
             }
         }
         // 3. Check RF score requirement (below threshold)
         if (met && unlock.requiredRoleFocusScoreBelow !== undefined) {
             if ((scores.RF ?? 0) >= unlock.requiredRoleFocusScoreBelow) { // Use nullish coalescing
                 met = false; // RF score too high
             }
         }

         // If all requirements met, attempt to unlock
         if (met) {
             if (State.addUnlockedFocusItem(unlock.id)) { // Saves state
                 newlyUnlocked = true;
                 const item = unlock.unlocks;
                 let itemName = item.name || `Item ${item.id}`; // Use provided name or ID
                 let notification = unlock.description || `Unlocked ${itemName}`;

                 // Add specific unlocked item to repository if applicable
                 if (item.type === 'scene') {
                     if (State.addRepositoryItem('scenes', item.id)) { // Saves state
                          notification += ` View in Repo.`;
                     } else { notification += ` (Scene already discovered)`; }
                 } else if (item.type === 'experiment') {
                      notification += ` Check Repo for availability.`; // Don't add experiment directly, check availability later
                 } else if (item.type === 'insightFragment') {
                     if (State.addRepositoryItem('insights', item.id)) { // Saves state
                          const iData = elementalInsights.find(i => i.id === item.id);
                          if(iData) itemName = `"${iData.text}"`; // Use insight text for name
                          notification = unlock.description || `Insight Found: ${itemName}`; // Better notification text
                          notification += ` View in Repo.`;
                          updateMilestoneProgress('repositoryInsightsCount', State.getRepositoryItems().insights.size);
                     } else { notification += ` (Insight already discovered)`; }
                 }
                 // Add other unlock types (e.g., direct insight gain) here if needed

                 if (!silent) UI.showTemporaryMessage(`Focus Synergy: ${notification}`, 5000);
                 // Check milestones triggered by this unlock itself
                 updateMilestoneProgress('unlockedFocusItems', State.getUnlockedFocusItems().size);
             }
         }
     });

     // Refresh relevant UI sections if unlocks happened
     if (newlyUnlocked && !silent) {
         console.log("Logic: New Focus Unlocks achieved:", Array.from(State.getUnlockedFocusItems()));
         const repositoryScreen = document.getElementById('repositoryScreen');
         const personaScreen = document.getElementById('personaScreen');
         if (repositoryScreen?.classList.contains('current')) {
             UI.displayRepositoryContent(); // Refresh repo if open
         }
         if (personaScreen?.classList.contains('current')) {
             UI.generateTapestryNarrative(); // Narrative might mention unlocks implicitly
         }
     }
}

// --- Tapestry Deep Dive Logic ---

/** Shows the Tapestry Deep Dive (Resonance Chamber) modal */
export function showTapestryDeepDive() {
    if (State.getFocusedConcepts().size === 0) {
        UI.showTemporaryMessage("Focus on concepts first.", 3000);
        return;
    }
    calculateTapestryNarrative(true); // Ensure analysis is fresh
    if (!currentTapestryAnalysis) {
        console.error("Failed to generate tapestry analysis for Deep Dive.");
        UI.showTemporaryMessage("Error analyzing Tapestry.", 3000);
        return;
    }
    UI.displayTapestryDeepDive(currentTapestryAnalysis); // Pass analysis data to UI
}

/** Handles clicks on the analysis nodes (Elemental Flow, Archetype, Synergy) */
export function handleDeepDiveNodeClick(nodeId) {
    if (!currentTapestryAnalysis) {
        UI.updateDeepDiveContent("<p>Error: Analysis unavailable.</p>", nodeId);
        return;
    }
    // console.log(`Logic: Handling Deep Dive node click: ${nodeId}`); // Reduce noise
    let content = `<p><em>Analysis for '${nodeId}'...</em></p>`; // Default/placeholder

    try {
        switch (nodeId) {
            case 'elemental':
                 content = `<h4>Elemental Flow</h4>`;
                 if (currentTapestryAnalysis.dominantElements.length > 0) {
                      content += `<p>Your focus shows prominence in: ${currentTapestryAnalysis.dominantElements.map(el => `<strong>${el.name}</strong> (${el.score.toFixed(1)})`).join(', ')}.</p>`;
                      content += `<p>This suggests themes related to: ${currentTapestryAnalysis.elementThemes.join(' ')}.</p>`;
                 } else { content += `<p>Your focus shows a relatively balanced elemental profile.</p>`; }
                 if (currentTapestryAnalysis.balanceComment) content += `<p>${currentTapestryAnalysis.balanceComment}</p>`;
                 // Add more detailed elemental comparison/interpretation if needed
                break;
            case 'archetype':
                 content = `<h4>Concept Archetype</h4>`;
                  if (currentTapestryAnalysis.dominantCardTypes.length > 0) {
                     content += `<p>The dominant card types in your focus are: ${currentTapestryAnalysis.dominantCardTypes.map(ct => `<strong>${ct.type}</strong> (${ct.count})`).join(', ')}.</p>`;
                     content += `<p>This points towards themes of: ${currentTapestryAnalysis.cardTypeThemes.join(' ')}.</p>`;
                 } else { content += `<p>No specific card type archetype strongly dominates your current focus.</p>`; }
                 // Add deeper analysis of type interactions if desired
                break;
            case 'synergy':
                 content = `<h4>Synergy & Tension</h4>`;
                  if (currentTapestryAnalysis.synergies.length > 0) { content += `<h5>Synergies Found:</h5><ul>${currentTapestryAnalysis.synergies.map(s => `<li>${s.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}</ul><hr class="popup-hr">`; } else { content += `<p><em>No direct synergies detected between focused concepts.</em></p><hr class="popup-hr">`; }
                  if (currentTapestryAnalysis.tensions.length > 0) { content += `<h5>Tensions Noted:</h5><ul>${currentTapestryAnalysis.tensions.map(t => `<li>${t.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}</ul>`; } else { content += `<p><em>No significant elemental tensions detected within the focus.</em></p>`; }
                break;
            default:
                content = `<p><em>Analysis node '${nodeId}' not recognized.</em></p>`;
        }
    } catch (error) {
        console.error(`Error generating content for deep dive node ${nodeId}:`, error);
        content = `<p>Error generating analysis content.</p>`;
    }
    UI.updateDeepDiveContent(content, nodeId); // Update the UI panel
}

/** Handles clicking the Contemplation node button */
export function handleContemplationNodeClick() {
    const cooldownEnd = State.getContemplationCooldownEnd();
    if (cooldownEnd && Date.now() < cooldownEnd) {
        UI.showTemporaryMessage("Contemplation is still cooling down.", 2500);
        UI.updateContemplationButtonState(); // Ensure button reflects cooldown
        return;
    }
    if (spendInsight(Config.CONTEMPLATION_COST, "Focused Contemplation")) {
        const contemplation = generateFocusedContemplation(); // Generate task based on current analysis
        if (contemplation) {
            UI.displayContemplationTask(contemplation); // Show the task in the UI
            State.setContemplationCooldown(Date.now() + Config.CONTEMPLATION_COOLDOWN); // Start cooldown (saves state)
            checkAndUpdateRituals('contemplateFocus'); // Check rituals
        } else {
            // Failed to generate a task (e.g., analysis missing)
            UI.updateDeepDiveContent("<p><em>Could not generate contemplation task. Ensure concepts are focused.</em></p>", 'contemplation');
            gainInsight(Config.CONTEMPLATION_COST, "Refund: Contemplation Fail"); // Refund insight
        }
        UI.updateContemplationButtonState(); // Update button (likely now shows cooldown)
    } else {
        // Failed to spend insight
        UI.updateContemplationButtonState(); // Update button state (may show insufficient insight)
    }
}

/** Generates a contemplation task based on the current tapestry analysis */
function generateFocusedContemplation() {
    if (!currentTapestryAnalysis) {
        console.warn("Cannot generate contemplation: Tapestry analysis is missing.");
        return null;
    }

    const focused = State.getFocusedConcepts();
    const disc = State.getDiscoveredConcepts();
    const focusedConceptsArray = Array.from(focused).map(id => disc.get(id)?.concept).filter(Boolean);
    let task = { type: "Default", text: "Reflect deeply on the overall shape and feel of your current focused Tapestry. What core truth is it revealing about you right now?", reward: { type: 'insight', amount: 2 }, requiresCompletionButton: true }; // Default task

    try {
        const taskOptions = [];

        // Option 1: Based on Tension
        if (currentTapestryAnalysis.tensions.length > 0) {
             const tension = currentTapestryAnalysis.tensions[Math.floor(Math.random() * currentTapestryAnalysis.tensions.length)];
             // Find the element key ('A'...'RF') from the short name
             const tensionElementKey = Object.keys(elementKeyToFullName).find(k => Utils.getElementShortName(elementKeyToFullName[k]) === tension.element);
             taskOptions.push({ type: "Tension Exploration", text: `Your Tapestry reveals potential tension within **${tension.element}**. ${tension.text} How might you navigate or integrate these opposing forces within yourself?`, reward: { type: 'attunement', element: tensionElementKey || 'All', amount: 0.5 }, requiresCompletionButton: true });
        }
        // Option 2: Based on Synergy
        if (currentTapestryAnalysis.synergies.length > 0) {
             const synergy = currentTapestryAnalysis.synergies[Math.floor(Math.random() * currentTapestryAnalysis.synergies.length)];
             taskOptions.push({ type: "Synergy Amplification", text: `A synergy exists between **${synergy.concepts[0]}** and **${synergy.concepts[1]}**. How could you consciously amplify this connection in your thoughts or actions to unlock further potential?`, reward: { type: 'insight', amount: 3 }, requiresCompletionButton: true });
        }
        // Option 3: Based on Dominant Element
        if (currentTapestryAnalysis.dominantElements.length > 0 && currentTapestryAnalysis.dominantElements[0].score > 7.0) {
            const domEl = currentTapestryAnalysis.dominantElements[0]; // { key: 'A', name: 'Attraction', score: ... }
             taskOptions.push({ type: "Dominant Element Focus", text: `Your Tapestry strongly emphasizes **${domEl.name}**. What is the core gift or challenge this dominant element presents in your life right now? How can you embody its energy more consciously?`, reward: { type: 'attunement', element: domEl.key, amount: 0.7 }, requiresCompletionButton: true });
        }
        // Option 4: Based on a specific focused concept (if any exist)
        if (focusedConceptsArray.length > 0) {
            const randomConcept = focusedConceptsArray[Math.floor(Math.random() * focusedConceptsArray.length)];
             taskOptions.push({ type: "Concept Resonance", text: `Focus your inner lens on **${randomConcept.name}**. What specific feeling, memory, or aspiration does contemplating this concept evoke most strongly for you today?`, reward: { type: 'insight', amount: 2 }, requiresCompletionButton: true });
        }

        // Select a task from the generated options, or use the default
        if (taskOptions.length > 0) {
            task = taskOptions[Math.floor(Math.random() * taskOptions.length)];
        }

    } catch (error) {
        console.error("Error generating specific contemplation task:", error);
        // Fallback to default task is already handled by initial 'task' definition
        return { type: "Error", text: "Error during contemplation generation. Reflect on your overall focus.", reward: { type: 'none' }, requiresCompletionButton: false };
    }

    console.log(`Generated contemplation task: ${task.type}`);
    return task;
}

/** Handles completing the contemplation task */
export function handleCompleteContemplation(taskData = null) {
     // Try to retrieve task data if not passed directly
     // Note: Regenerating task might lead to inconsistency if analysis changed.
     // Ideally, the task data should be stored temporarily when displayed.
     // For now, we keep the re-generation as a fallback.
    const currentTask = taskData || generateFocusedContemplation();

    if (!currentTask || !currentTask.reward || !currentTask.requiresCompletionButton) {
         console.warn("Contemplation completion attempted without valid task data.");
         return; // Cannot complete without valid task info
    }

    console.log(`Contemplation task completed: ${currentTask.type}`);
    // Grant reward
    if (currentTask.reward.type === 'insight' && currentTask.reward.amount > 0) {
        gainInsight(currentTask.reward.amount, `Contemplation Task: ${currentTask.type}`);
    } else if (currentTask.reward.type === 'attunement' && currentTask.reward.amount > 0) {
        gainAttunementForAction('contemplation', currentTask.reward.element || 'All', currentTask.reward.amount);
    }
    // Add other reward types if needed

    UI.showTemporaryMessage("Contemplation complete!", 2500);
    UI.clearContemplationTask(); // Clear the task display in the UI
}


// --- Elemental Dilemma Logic ---

/** Handles clicking the Elemental Dilemma button */
export function handleElementalDilemmaClick() {
    const availableDilemmas = elementalDilemmas; // Defined in data.js
    if (!availableDilemmas || availableDilemmas.length === 0) {
        UI.showTemporaryMessage("No elemental dilemmas available at this time.", 3000);
        return;
    }
    // Select a random dilemma
    currentDilemma = availableDilemmas[Math.floor(Math.random() * availableDilemmas.length)];
    UI.displayElementalDilemma(currentDilemma); // Show the modal
}

/** Handles confirming the choice in the Elemental Dilemma modal */
export function handleConfirmDilemma() {
    const modal = document.getElementById('dilemmaModal');
    const slider = document.getElementById('dilemmaSlider');
    const nudgeCheckbox = document.getElementById('dilemmaNudgeCheckbox');

    if (!modal || !slider || !nudgeCheckbox || !currentDilemma) {
        console.error("Dilemma confirmation failed: Missing elements or currentDilemma data.");
        UI.hidePopups(); // Close broken popup
        return;
    }

    const sliderValue = parseFloat(slider.value); // Value from 0 to 10
    const nudgeAllowed = nudgeCheckbox.checked;
    const keyMin = currentDilemma.elementKeyMin; // e.g., 'P'
    const keyMax = currentDilemma.elementKeyMax; // e.g., 'A'
    const personaScreen = document.getElementById('personaScreen');

    console.log(`Dilemma ${currentDilemma.id} confirmed. Value: ${sliderValue}, Nudge Allowed: ${nudgeAllowed}`);

    // Grant base insight for engaging
    gainInsight(3, `Dilemma Choice: ${currentDilemma.id}`);

    // Apply score nudge if allowed and keys are valid
    if (nudgeAllowed && keyMin && keyMax) {
        const currentScores = State.getScores();
        const newScores = { ...currentScores };
        let nudged = false;

        // Ensure keys exist in scores before proceeding
        if (!currentScores.hasOwnProperty(keyMin) || !currentScores.hasOwnProperty(keyMax)) {
             console.warn(`Dilemma Nudge Error: Invalid element keys: ${keyMin}, ${keyMax}`);
        } else {
            // Calculate nudge proportions - leaning towards max increases max, decreases min slightly
            const maxNudgeEffect = Config.SCORE_NUDGE_AMOUNT * 1.5; // Max potential shift
            const proportionMax = sliderValue / 10; // 0 to 1
            const proportionMin = (10 - sliderValue) / 10; // 1 to 0

            // Nudge = Base * Proportion - Dampening * OtherProportion
            const dampeningFactor = 0.3;
            const nudgeMin = (proportionMin * maxNudgeEffect) - (proportionMax * maxNudgeEffect * dampeningFactor);
            const nudgeMax = (proportionMax * maxNudgeEffect) - (proportionMin * maxNudgeEffect * dampeningFactor);

            // Apply nudge to Min element score
            const originalMin = newScores[keyMin];
            newScores[keyMin] = Math.max(0, Math.min(10, newScores[keyMin] + nudgeMin)); // Apply and clamp
            if (newScores[keyMin] !== originalMin) nudged = true;
            // console.log(`Dilemma Nudge: ${keyMin} adjusted by ${nudgeMin.toFixed(2)} -> ${newScores[keyMin].toFixed(1)}`); // Reduce noise

            // Apply nudge to Max element score
            const originalMax = newScores[keyMax];
            newScores[keyMax] = Math.max(0, Math.min(10, newScores[keyMax] + nudgeMax)); // Apply and clamp
            if (newScores[keyMax] !== originalMax) nudged = true;
            // console.log(`Dilemma Nudge: ${keyMax} adjusted by ${nudgeMax.toFixed(2)} -> ${newScores[keyMax].toFixed(1)}`); // Reduce noise

            // If any scores actually changed, update state and UI
            if (nudged) {
                State.updateScores(newScores); // Save updated scores
                console.log("Nudged Scores after Dilemma:", State.getScores());
                if(personaScreen?.classList.contains('current')) {
                     // Call the logic function to update the persona screen content
                     displayPersonaScreenLogic(); // Call internal logic function directly
                }
                UI.showTemporaryMessage("Dilemma choice influenced core understanding.", 3500);
                gainAttunementForAction('dilemmaNudge', 'All'); // Small attunement boost
                updateMilestoneProgress('scoreNudgeApplied', 1); // Track milestone
            }
        }
    }

    UI.hidePopups(); // Close the dilemma modal
    currentDilemma = null; // Clear the current dilemma data
}

// --- Daily Login ---

/** Checks if it's the first login of the day and resets rituals/grants bonus if so. */
export function checkForDailyLogin() {
    const today = new Date().toDateString();
    const lastLogin = State.getState().lastLoginDate;
    const workshopScreen = document.getElementById('workshopScreen');
    const repositoryScreen = document.getElementById('repositoryScreen');

    if (lastLogin !== today) {
        console.log("Logic: First login detected for today. Resetting daily rituals and granting bonus.");
        State.resetDailyRituals(); // Resets progress, sets free research flag, updates lastLoginDate, saves state
        gainInsight(5.0, "Daily Login Bonus");
        UI.showTemporaryMessage("Daily Rituals Reset. Free Research Available!", 3500);
        // Refresh relevant screens if they are currently visible
        if(workshopScreen?.classList.contains('current')) {
            UI.displayWorkshopScreenContent();
        }
        if(repositoryScreen?.classList.contains('current')) {
            UI.displayRepositoryContent(); // Refreshes rituals list
        }
    } else {
        // console.log("Logic: Already logged in today."); // Reduce noise
        // Ensure free research button state is correct even if already logged in
        if(workshopScreen?.classList.contains('current')) {
            UI.displayWorkshopScreenContent();
        }
         if(repositoryScreen?.classList.contains('current')) {
             UI.displayDailyRituals(); // Refresh ritual display in case state didn't fully update UI
        }
    }
}

// --- Rituals & Milestones Logic ---

/**
 * Checks if an action triggers progress or completion of any daily or focus rituals.
 * Includes RoleFocus checks.
 * @param {string} action - The action performed (e.g., 'addToGrimoire', 'completeReflection').
 * @param {object} [details={}] - Additional details about the action (e.g., { conceptId: 1, rarity: 'rare' }).
 */
export function checkAndUpdateRituals(action, details = {}) {
    let ritualCompletedThisCheck = false;
    const currentState = State.getState();
    const completedRitualsData = currentState.completedRituals || { daily: {}, weekly: {} };
    const focused = currentState.focusedConcepts;
    const scores = currentState.userScores; // Needed for RF checks in focus rituals

    // Combine standard daily rituals and applicable focus rituals
    // *** FIX 1: Apply spread syntax correctly to dailyRituals ***
    let currentRitualPool = [...dailyRituals];
    if (focusRituals && Array.isArray(focusRituals)) {
        focusRituals.forEach(ritual => {
            // Basic validation of ritual structure
            if (!ritual || !ritual.id) return;

            // Check if requirements for this focus ritual are met
            let focusMet = true;
            // Check specific focused concept IDs
            if (ritual.requiredFocusIds && Array.isArray(ritual.requiredFocusIds)) {
                for (const id of ritual.requiredFocusIds) {
                    if (!focused.has(id)) { focusMet = false; break; }
                }
            }
            // Check RF score requirement (above)
            if (focusMet && ritual.requiredRoleFocusScore !== undefined && (scores.RF ?? 0) < ritual.requiredRoleFocusScore) {
                 focusMet = false;
            }
            // Check RF score requirement (below)
            if (focusMet && ritual.requiredRoleFocusScoreBelow !== undefined && (scores.RF ?? 0) >= ritual.requiredRoleFocusScoreBelow) {
                 focusMet = false;
            }

            // If all requirements met, add it to the pool to be checked
            if (focusMet) {
                 // *** FIX 2: Apply spread syntax correctly to ritual object ***
                 currentRitualPool.push({ ...ritual, isFocusRitual: true, period: ritual.period || 'daily' });
            }
        });
    }

    // Iterate through the combined pool of active rituals
    currentRitualPool.forEach(ritual => {
        // Validate ritual structure again
        if (!ritual || !ritual.id || !ritual.track) {
             console.warn(`Skipping invalid ritual structure:`, ritual);
             return;
        }

        const period = ritual.period || 'daily'; // Default to daily if period missing
        const completedPeriodData = completedRitualsData[period] || {};
        const completedData = completedPeriodData[ritual.id] || { completed: false, progress: 0 };

        if (completedData.completed) return; // Skip rituals already completed for their period

        const track = ritual.track; // The trigger conditions for this ritual
        let triggerMet = false;

        // Check if the action matches the ritual's trigger action
        if (track.action === action) {
            triggerMet = true; // Base condition met

            // Check additional details if specified in the ritual's track object
            if (track.contextMatch && details.contextMatch !== track.contextMatch) triggerMet = false;
            if (track.categoryId && details.categoryId !== track.categoryId) triggerMet = false;
            if (track.rarity && details.rarity !== track.rarity) triggerMet = false;
            // Check concept type (if conceptId is provided in details)
            if (track.conceptType && details.conceptId) {
                const conceptData = State.getDiscoveredConceptData(details.conceptId)?.concept;
                if (!conceptData || conceptData.cardType !== track.conceptType) triggerMet = false;
            }
            // Add more detail checks here if needed
        }

        // If all trigger conditions are met, update progress
        if (triggerMet) {
             // Increment progress (returns new progress count)
             const progress = State.completeRitualProgress(ritual.id, period);
             const requiredCount = track.count || 1; // How many times action needs to be done

             // Check if progress meets the required count for completion
             if (progress >= requiredCount) {
                 console.log(`Logic: Ritual Completed: ${ritual.description}`);
                 State.markRitualComplete(ritual.id, period); // Mark as done for the period
                 ritualCompletedThisCheck = true;

                 // Grant reward if defined
                 if (ritual.reward) {
                    if (ritual.reward.type === 'insight') {
                         gainInsight(ritual.reward.amount || 0, `Ritual: ${ritual.description}`);
                    } else if (ritual.reward.type === 'attunement') {
                         gainAttunementForAction('ritual', ritual.reward.element || 'All', ritual.reward.amount || 0);
                    }
                    // Add other reward types (e.g., tokens, items)
                 }
             } else {
                 // Log progress update if not yet complete
                 // console.log(`Logic: Ritual Progress: ${ritual.description} (${progress}/${requiredCount})`); // Reduce noise
             }
        }
    });

    // If any ritual was completed, refresh the display if the Repository is visible
    const repositoryScreen = document.getElementById('repositoryScreen');
    if (ritualCompletedThisCheck && repositoryScreen?.classList.contains('current')) {
        UI.displayDailyRituals();
    }
}

/**
 * Updates progress towards milestones based on actions or state changes.
 * Includes RoleFocus milestone checks.
 * @param {string} trackType - The type of progress being tracked (e.g., 'elementAttunement', 'discoveredConcepts.size', 'completeReflection').
 * @param {any} currentValue - The current value related to the trackType (e.g., specific attunement score, total concepts, or just 1 for action counts).
 */
export function updateMilestoneProgress(trackType, currentValue) {
     let milestoneAchievedThisUpdate = false;
     const achievedSet = State.getState().achievedMilestones;

     // Defensive check: Ensure achievedMilestones is actually a Set
     if (!(achievedSet instanceof Set)) {
          console.error("CRITICAL ERROR: gameState.achievedMilestones is not a Set! Attempting recovery.");
          State.getState().achievedMilestones = new Set(Array.isArray(achievedSet) ? achievedSet : []);
          // We should probably return here to avoid potential infinite loops or further errors
          return;
     }

     milestones.forEach(m => {
         if (achievedSet.has(m.id)) return; // Skip already achieved milestones

         let achieved = false;
         const track = m.track;
         if (!track) {
             console.warn(`Milestone ${m.id} is missing tracking data. Skipping.`);
             return;
         }

         // Determine the threshold: Use config for max focus slots milestone, otherwise use milestone data
         const threshold = (m.id === 'ms024') ? Config.MAX_FOCUS_SLOTS : track.threshold;
         const countThreshold = track.count || 1; // For action counts

         // --- Check based on track type ---

         // 1. Action-based milestones
         if (track.action && track.action === trackType) {
             // Simple action count check
             // If currentValue is provided and represents the total count, use it.
             // Otherwise, assume this call represents one increment towards the count.
             // For milestones requiring counts > 1, the *calling* function needs to track the total count
             // and pass it as currentValue, or we need a separate state variable for the milestone count.
             // Assuming for now that action-based milestones mostly track the first occurrence (count=1).
             const currentActionCount = (typeof currentValue === 'number' && currentValue > 0) ? currentValue : 1;
             if (currentActionCount >= countThreshold) {
                  achieved = true;
             }
         }
         // 2. State-based milestones
         else if (track.state && track.state === trackType) {
             const state = State.getState(); // Get current state
             const scores = state.userScores;
             const att = state.elementAttunement;
             const lvls = state.unlockedDeepDiveLevels;
             let checkValue = null; // Value from state to compare against threshold

             // Handle specific state checks
             if (trackType === 'elementAttunement') {
                 // currentValue could be the whole attunement object OR just the changed value {key: value}
                 const attToCheck = (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue) && Object.keys(currentValue).length === elementNames.length) ? currentValue : att; // Use full state if partial not passed

                 if (track.element && attToCheck.hasOwnProperty(track.element)) {
                     // Check specific element against threshold
                     checkValue = attToCheck[track.element];
                 } else if (track.condition === 'any') {
                     // Check if ANY element meets the threshold
                     achieved = Object.values(attToCheck).some(v => v >= threshold);
                 } else if (track.condition === 'all') {
                     // Check if ALL elements meet the threshold
                     const allKeys = Object.keys(att); // Get all 7 keys
                     // Ensure we have scores for all expected elements before checking
                     achieved = allKeys.length === elementNames.length && allKeys.every(key => attToCheck.hasOwnProperty(key) && attToCheck[key] >= threshold);
                 }
             } else if (trackType === 'unlockedDeepDiveLevels') {
                  const levelsToCheck = (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) ? currentValue : lvls;
                  if (track.condition === 'any') {
                       achieved = Object.values(levelsToCheck).some(v => v >= threshold);
                  } else if (track.condition === 'all') {
                       const allKeys = Object.keys(lvls);
                       achieved = allKeys.length === elementNames.length && allKeys.every(key => levelsToCheck.hasOwnProperty(key) && levelsToCheck[key] >= threshold);
                  }
             }
             else if (trackType === 'discoveredConcepts.size') checkValue = State.getDiscoveredConcepts().size;
             else if (trackType === 'focusedConcepts.size') checkValue = State.getFocusedConcepts().size;
             else if (trackType === 'repositoryInsightsCount') checkValue = State.getRepositoryItems().insights.size;
             else if (trackType === 'focusSlotsTotal') { // Specifically for ms024 or similar
                  checkValue = State.getFocusSlots();
             }
             else if (trackType === 'repositoryContents' && track.condition === "allTypesPresent") {
                  const i = State.getRepositoryItems();
                  achieved = i.scenes.size > 0 && i.experiments.size > 0 && i.insights.size > 0;
             }
             else if (trackType === 'unlockedFocusItems') checkValue = State.getUnlockedFocusItems().size; // Check count of unlocked items
             // Check for simple numerical state thresholds
             if (!achieved && checkValue !== null && typeof checkValue === 'number' && threshold !== undefined && checkValue >= threshold) {
                  achieved = true;
             }
         }
         // 3. Lore Level Milestones
      else if (trackType === 'unlockLore') {
    const loreLevel = typeof currentValue === 'number' ? currentValue : 0;
    if (track.condition === 'anyLevel' && loreLevel >= 1) achieved = true; // ms006
    else if (track.condition === 'level3' && loreLevel >= 3) achieved = true; // ms039
}

         // --- Grant Milestone if Achieved ---
         if (achieved) {
             if (State.addAchievedMilestone(m.id)) { // Attempt to add to state (saves)
                 milestoneAchievedThisUpdate = true;
                 console.log(`Milestone Achieved: ${m.description} (ID: ${m.id})`);
                 UI.showMilestoneAlert(m.description); // Show UI alert

                 // Grant reward if defined
                 if (m.reward) {
                     if (m.reward.type === 'insight') {
                          gainInsight(m.reward.amount || 0, `Milestone: ${m.description}`);
                     } else if (m.reward.type === 'attunement') {
                          gainAttunementForAction('milestone', m.reward.element || 'All', m.reward.amount || 0);
                     } else if (m.reward.type === 'increaseFocusSlots') {
                          const inc = m.reward.amount || 1;
                          if (State.increaseFocusSlots(inc)) { // Saves state
                               UI.updateFocusSlotsDisplay();
                               // Recursively check if max slots milestone (ms024) is now met
                               updateMilestoneProgress('focusSlotsTotal', State.getFocusSlots());
                          }
                     } else if (m.reward.type === 'discoverCard') {
                          const cId = m.reward.cardId;
                          if (cId && !State.getDiscoveredConcepts().has(cId)) {
                               // Use internal add function to handle effects
                               if(addConceptToGrimoireInternal(cId, 'milestone')) {
                                    const cDisc = State.getDiscoveredConceptData(cId)?.concept;
                                    if(cDisc) UI.showTemporaryMessage(`Milestone Reward: Discovered ${cDisc.name}!`, 3500);
                               }
                          }
                     } else if (m.reward.type === 'discoverMultipleCards') {
                          if(Array.isArray(m.reward.cardIds)) {
                               let names = [];
                               m.reward.cardIds.forEach(cId => {
                                    if (cId && !State.getDiscoveredConcepts().has(cId)) {
                                        if(addConceptToGrimoireInternal(cId, 'milestone')) {
                                             const cDisc = State.getDiscoveredConceptData(cId)?.concept;
                                             if(cDisc) names.push(cDisc.name);
                                        }
                                    }
                               });
                               if (names.length > 0) UI.showTemporaryMessage(`Milestone Reward: Discovered ${names.join(' & ')}!`, 3500);
                          }
                     }
                     // Add other reward types
                 }
             } // end if (State.addAchievedMilestone)
         } // end if (achieved)
     }); // end forEach milestone

     // Refresh Repository UI if a milestone was achieved and the screen is visible
     const repositoryScreen = document.getElementById('repositoryScreen');
     if (milestoneAchievedThisUpdate && repositoryScreen?.classList.contains('current')) {
          UI.displayRepositoryContent(); // Refreshes milestones list
     }
}

// --- Internal Helper Function for Tapestry Hash Calculation ---
// Used for cache invalidation in calculateTapestryNarrative
function _calculateFocusSetHash() {
    const focused = State.getFocusedConcepts();
    if (!focused || focused.size === 0) { return ''; }
    const sortedIds = Array.from(focused).map(Number).sort((a, b) => a - b);
    return sortedIds.join(',');
}


console.log("gameLogic.js loaded successfully. (Enhanced v4.1 - Fixed + Onboarding Split)");
// --- END OF FILE gameLogic.js ---
