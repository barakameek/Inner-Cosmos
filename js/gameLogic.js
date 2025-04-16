// js/gameLogic.js - Application Logic (Enhanced v4 - RF, Onboarding, Logging)

import * as State from './state.js';
import * as Config from './config.js';
import * as Utils from './utils.js';
import * as UI from './ui.js';
// Import updated data structures (now including RoleFocus, onboardingTasks)
import {
    elementDetails, elementKeyToFullName, elementNameToKey, concepts, questionnaireGuided,
    reflectionPrompts, elementDeepDive, dailyRituals, milestones, focusRituals,
    sceneBlueprints, alchemicalExperiments, elementalInsights, focusDrivenUnlocks,
    cardTypeKeys, elementNames, // Now 7 elements including RoleFocus
    elementInteractionThemes, cardTypeThemes,
    categoryDrivenUnlocks, grimoireShelves, elementalDilemmas, onboardingTasks
} from '../data.js';

console.log("gameLogic.js loading... (Enhanced v4 - RF, Onboarding, Logging)");

// --- Temporary State (Cleared by hidePopups in UI) ---
let currentlyDisplayedConceptId = null; // ID of concept in the detail popup
let currentReflectionContext = null; // e.g., 'Standard', 'Dissonance', 'Guided'
let reflectionTargetConceptId = null; // ID of concept causing Dissonance/Rare prompt
let currentReflectionCategory = null; // e.g., 'Attraction', 'Sensory' for Standard reflections
let currentPromptId = null; // ID of the specific prompt being shown
let reflectionCooldownTimeout = null; // Timeout ID for standard reflection cooldown
let currentDilemma = null; // Data object for the active dilemma

// --- Tapestry Analysis Cache ---
let currentTapestryAnalysis = null; // Stores result of calculateTapestryNarrative

// --- Initialization & Core State ---
export function clearPopupState() {
    currentlyDisplayedConceptId = null;
    currentReflectionContext = null;
    reflectionTargetConceptId = null;
    currentReflectionCategory = null;
    currentPromptId = null;
    currentDilemma = null;
    console.log("Logic: Popup state cleared.");
}

export function setCurrentPopupConcept(conceptId) { currentlyDisplayedConceptId = conceptId; }
export function getCurrentPopupConceptId() { return currentlyDisplayedConceptId; }


// --- Helper to Trigger Onboarding Advance ---
// Simplified wrapper - main.js handles calling State/UI update
function checkOnboarding(actionName, targetPhase, actionValue = null) {
    const currentPhase = State.getOnboardingPhase();
    const onboardingComplete = State.isOnboardingComplete();

    if (Config.ONBOARDING_ENABLED && !onboardingComplete && currentPhase === targetPhase) {
        // Find the task for the current phase
        const task = onboardingTasks.find(t => t.phaseRequired === currentPhase);
        if (!task) return; // Should not happen if phase is valid

        // Check if the action matches the task's tracking criteria
        const track = task.track;
        let conditionMet = false;
        if (track.action === actionName) {
            conditionMet = (!track.value || track.value === actionValue);
             if (track.count && State.getActionCount(track.action) < track.count) { // Hypothetical state function needed for count tracking
                 conditionMet = false; // Not implemented yet, but shows concept
             }
        } else if (track.state === actionName) {
             // Handle state-based triggers if needed later
             conditionMet = true; // Assume true for now if state matches actionName
        }


        if (conditionMet) {
             console.log(`Onboarding Check: Action '${actionName}' (value: ${actionValue}) meets criteria for phase ${targetPhase}. Advancing.`);
             State.advanceOnboardingPhase(); // Advance state
             UI.showOnboarding(State.getOnboardingPhase()); // Trigger UI update
        } else {
             // console.log(`Onboarding Check: Action '${actionName}' did not meet criteria for phase ${targetPhase}.`);
        }
    }
}

// --- Insight & Attunement Management ---
export function gainInsight(amount, source = "Unknown") {
    if (typeof amount !== 'number' || isNaN(amount) || amount === 0) return;
    // State.changeInsight now handles logging
    const changed = State.changeInsight(amount);
    if (changed) {
        // Don't log here, State.changeInsight handles it
        UI.updateInsightDisplays(); // Update UI displays
        checkAndUpdateRituals('gainInsight', { amount: Math.abs(amount) }); // Check if gaining insight triggers ritual
    }
}

export function spendInsight(amount, source = "Unknown") {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return false;
    if (State.getInsight() >= amount) {
        gainInsight(-amount, source); // This will log the spending via gainInsight
        checkAndUpdateRituals('spendInsight', { amount: amount }); // Check if spending triggers ritual
        return true;
    } else {
        UI.showTemporaryMessage(`Not enough Insight! Need ${amount.toFixed(1)}.`, Config.TOAST_DURATION);
        return false;
    }
}

export function countUndiscoveredByRarity(elementKey) {
    const discoveredIds = new Set(State.getDiscoveredConcepts().keys());
    const counts = { common: 0, uncommon: 0, rare: 0, total: 0 };
    concepts.forEach(concept => {
        if (concept.primaryElement === elementKey && !discoveredIds.has(concept.id)) {
            const rarity = concept.rarity || 'common';
            if (counts.hasOwnProperty(rarity)) { counts[rarity]++; }
            counts.total++;
        }
    });
    return counts;
}

// Now handles 7 elements including RF
export function gainAttunementForAction(actionType, elementKey = null, amount = 0.5) {
    let targetKeys = [];
    let baseAmount = amount;
    const allKeys = Object.keys(State.getAttunement()); // Get all 7 keys

    if (elementKey && allKeys.includes(elementKey) && elementKey !== 'All') {
        targetKeys.push(elementKey);
    } else if (actionType === 'completeReflection' && ['Standard', 'SceneMeditation', 'RareConcept'].includes(currentReflectionContext)) {
         // Determine target element based on reflection context
         let keyFromContext = null;
         if (currentReflectionContext === 'Standard' && currentReflectionCategory) {
             // Need to map full name back to key reliably
             keyFromContext = Object.keys(elementKeyToFullName).find(key => elementKeyToFullName[key] === currentReflectionCategory);
         } else if (currentReflectionContext === 'SceneMeditation') {
             const scene = sceneBlueprints.find(s => s.reflectionPromptId === currentPromptId);
             keyFromContext = scene?.element || null;
         } else if (currentReflectionContext === 'RareConcept') {
             const cEntry = Array.from(State.getDiscoveredConcepts().entries()).find(([id, data]) => data.concept.uniquePromptId === currentPromptId);
             keyFromContext = cEntry ? cEntry[1].concept.primaryElement : null;
         }

         if (keyFromContext && allKeys.includes(keyFromContext)) {
             targetKeys.push(keyFromContext);
         } else {
             console.warn(`Could not determine target element for reflection context: ${currentReflectionContext}, category: ${currentReflectionCategory}, prompt: ${currentPromptId}. Applying small amount to all.`);
             targetKeys = allKeys; baseAmount = 0.1; // Small gain across all if target unclear
         }
    }
    // Handle generic actions or 'All' key
    else if (['generic', 'completeReflectionGeneric', 'scoreNudge', 'ritual', 'milestone', 'experimentSuccess', 'addToGrimoire', 'discover', 'markFocus', 'contemplation', 'researchSuccess', 'researchFail', 'researchSpecial', 'dilemmaNudge'].includes(actionType) || elementKey === 'All') {
        targetKeys = allKeys;
        // Adjust base amount based on action type for 'All' targets
        switch(actionType) {
            case 'scoreNudge': baseAmount = (Config.SCORE_NUDGE_AMOUNT * 2) / (targetKeys.length || 1); break; // Scale nudge effect
            case 'dilemmaNudge': baseAmount = (0.3 / (targetKeys.length || 1)); break;
            case 'completeReflectionGeneric': baseAmount = 0.2; break;
            case 'contemplation': baseAmount = (elementKey === 'All') ? 0.1 : 0.4; break; // Different if specific vs all
            case 'researchSuccess': baseAmount = 0.5; break;
            case 'researchFail': baseAmount = 0.1; break;
            case 'researchSpecial': baseAmount = 0.8; break;
            case 'generic':
            default: baseAmount = 0.2; break; // Default small gain for other 'All' actions
        }
    } else {
        console.warn(`gainAttunement called with invalid parameters or context: action=${actionType}, key=${elementKey}, context=${currentReflectionContext}, category=${currentReflectionCategory}`);
        return;
    }

    let changed = false;
    targetKeys.forEach(key => {
        if (State.updateAttunement(key, baseAmount)) {
            changed = true;
            // Update milestones checks for 'all' and 'any' conditions
            updateMilestoneProgress('elementAttunement', State.getAttunement()); // Pass full state for 'all' checks
            updateMilestoneProgress('elementAttunement', { [key]: State.getAttunement()[key] }); // Pass single for 'any' or specific element checks
        }
    });

    if (changed) {
        console.log(`Attunement updated (${actionType}, Key(s): ${targetKeys.join(',') || 'None'}) by ${baseAmount.toFixed(2)} per element.`);
        // Refresh UI only if relevant screen is active
        if (document.getElementById('personaScreen')?.classList.contains('current')) {
            UI.displayElementAttunement();
        }
    }
}

export function handleInsightBoostClick() {
    const cooldownEnd = State.getInsightBoostCooldownEnd();
    if (cooldownEnd && Date.now() < cooldownEnd) {
        UI.showTemporaryMessage("Insight boost is still cooling down.", Config.TOAST_DURATION);
        return;
    }
    gainInsight(Config.INSIGHT_BOOST_AMOUNT, "Manual Boost"); // gainInsight handles UI update
    State.setInsightBoostCooldown(Date.now() + Config.INSIGHT_BOOST_COOLDOWN);
    UI.updateInsightBoostButtonState(); // Update button immediately
    UI.showTemporaryMessage(`Gained ${Config.INSIGHT_BOOST_AMOUNT} Insight!`, 2500);
}


// --- Questionnaire Logic (Includes RF) ---
export function handleQuestionnaireInputChange(event) {
    const input = event.target;
    const type = input.dataset.type;
    const currentState = State.getState();
    if (currentState.currentElementIndex < 0 || currentState.currentElementIndex >= elementNames.length) {
        console.warn("Input change outside valid questionnaire index.");
        return;
    }
    const elementName = elementNames[currentState.currentElementIndex];
    const currentAnswers = UI.getQuestionnaireAnswers(); // Get current answers from UI
    State.updateAnswers(elementName, currentAnswers); // Update state (without saving yet)

    // Update slider feedback text immediately
    if (type === 'slider') {
        const sliderElement = document.getElementById(input.id);
        if(sliderElement) {
             UI.updateSliderFeedbackText(sliderElement, elementName);
        } else {
             console.warn(`Could not find slider element ${input.id} to update feedback.`);
        }
    }
    // Update the dynamic score display for the current element
    UI.updateDynamicFeedback(elementName, currentAnswers);
}

export function handleCheckboxChange(event) {
     const checkbox = event.target;
     const name = checkbox.name;
     const maxChoices = parseInt(checkbox.dataset.maxChoices || 2);
     const container = checkbox.closest('.checkbox-options');
     if (!container) return;

     const checkedBoxes = container.querySelectorAll(`input[name="${name}"]:checked`);
     if (checkedBoxes.length > maxChoices) {
         UI.showTemporaryMessage(`Max ${maxChoices} options.`, 2500);
         checkbox.checked = false; // Uncheck the last clicked one
         // Need to re-trigger the input change logic after unchecking
         handleQuestionnaireInputChange(event);
     } else {
         handleQuestionnaireInputChange(event); // Process the valid change
     }
}

export function calculateElementScore(elementName, answersForElement) {
    // Find the questions for the given element (using the full name)
    const questions = questionnaireGuided[elementName] || [];
    let score = 5.0; // Start at neutral

    questions.forEach(q => {
        const answer = answersForElement[q.qId];
        let pointsToAdd = 0;
        const weight = q.scoreWeight || 1.0;

        if (q.type === 'slider') {
            // Use saved answer if valid, otherwise default value
            const value = (answer !== undefined && !isNaN(parseFloat(answer))) ? parseFloat(answer) : q.defaultValue;
            const baseValue = q.defaultValue !== undefined ? q.defaultValue : 5; // Assume 5 if no default
            pointsToAdd = (value - baseValue) * weight;
        }
        else if (q.type === 'radio') {
            const opt = q.options.find(o => o.value === answer);
            pointsToAdd = opt ? (opt.points || 0) * weight : 0;
        }
        else if (q.type === 'checkbox' && Array.isArray(answer)) {
            // Sum points for all checked options
            answer.forEach(val => {
                const opt = q.options.find(o => o.value === val);
                pointsToAdd += opt ? (opt.points || 0) * weight : 0;
            });
        }
        score += pointsToAdd;
    });

    // Clamp score between 0 and 10
    return Math.max(0, Math.min(10, score));
}

export function goToNextElement() {
    const currentState = State.getState();
    const currentIndex = currentState.currentElementIndex;

    // Save answers for the current element before moving
    if (currentIndex >= 0 && currentIndex < elementNames.length) {
        const elementName = elementNames[currentIndex];
        const currentAnswers = UI.getQuestionnaireAnswers();
        State.updateAnswers(elementName, currentAnswers); // Update state (no save yet)
        console.log(`Logic: Saved answers for ${elementName}.`);
    } else {
        console.warn("goToNextElement called with invalid index:", currentIndex);
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex >= elementNames.length) {
        finalizeQuestionnaire(); // All elements done
    } else {
        State.updateElementIndex(nextIndex); // Update state index (no save yet)
        UI.displayElementQuestions(nextIndex); // Display next set of questions
    }
}

export function goToPrevElement() {
    const currentState = State.getState();
    if (currentState.currentElementIndex > 0) {
        // Save current answers first (optional, but good practice)
        const elementName = elementNames[currentState.currentElementIndex];
        const currentAnswers = UI.getQuestionnaireAnswers();
        State.updateAnswers(elementName, currentAnswers);
        console.log(`Logic: Saved answers for ${elementName} before going back.`);

        const prevIndex = currentState.currentElementIndex - 1;
        State.updateElementIndex(prevIndex);
        UI.displayElementQuestions(prevIndex);
    } else {
        console.log("Already at the first element.");
    }
}

export function finalizeQuestionnaire() {
    console.log("Logic: Finalizing scores for 7 elements...");
    const finalScores = {};
    const allAnswers = State.getState().userAnswers;

    // Calculate final score for each element (including RF)
    elementNames.forEach(elementName => {
        const score = calculateElementScore(elementName, allAnswers[elementName] || {});
        const key = elementNameToKey[elementName]; // Get the key (A, I, S, P, C, R, RF)
        if (key) {
            finalScores[key] = score;
        } else {
            console.warn(`No key found for element name during finalization: ${elementName}`);
        }
    });

    // Update state with final scores and mark questionnaire complete
    State.updateScores(finalScores); // Updates the userScores object
    State.saveAllAnswers(allAnswers); // Save the answers permanently
    State.setQuestionnaireComplete(); // Mark as done

    // Determine starter concepts based on final scores
    determineStarterHandAndEssence();

    // Trigger post-questionnaire actions
    updateMilestoneProgress('completeQuestionnaire', 1); // Track milestone
    checkForDailyLogin(); // Check daily login bonus/reset

    // Update UI elements
    UI.updateInsightDisplays();
    UI.updateFocusSlotsDisplay();
    UI.updateGrimoireCounter();
    UI.populateGrimoireFilters();
    UI.refreshGrimoireDisplay(); // Show initial cards in Workshop
    calculateTapestryNarrative(true); // Calculate initial narrative
    checkSynergyTensionStatus(); // Update synergy button
    UI.displayPersonaSummary(); // Show summary first after questionnaire

    console.log("Logic: Final User Scores (7 Elements):", State.getScores());
    UI.showScreen('personaScreen'); // Transition to Persona screen
    UI.showTemporaryMessage("Experiment Complete! Explore your results.", 4000);

    // Trigger relevant onboarding phase if applicable
    checkOnboarding('completeQuestionnaire', 1); // Check if this completes phase 1
}


// --- Starter Hand Determination ---
export function determineStarterHandAndEssence() {
     console.log("Logic: Determining starter hand (7 Dimensions)...");
     if (!concepts || !Array.isArray(concepts) || concepts.length === 0) {
         console.error("Concepts data missing or invalid.");
         return;
     }

     const userScores = State.getScores();
     // Calculate distance for all concepts
     let conceptsWithDistance = concepts.map(c => {
         // Ensure concept has valid scores before calculating distance
         const conceptScoresValid = c.elementScores && Object.keys(c.elementScores).length === elementNames.length;
         const distance = conceptScoresValid ? Utils.euclideanDistance(userScores, c.elementScores, c.name) : Infinity;
          if (!conceptScoresValid) { console.warn(`Concept ${c.name} (ID: ${c.id}) missing or has incomplete elementScores. Excluding from starter hand.`); }
         return { ...c, distance };
     }).filter(c => c.distance !== Infinity && !isNaN(c.distance)); // Filter out invalid distances

     if (conceptsWithDistance.length === 0) {
         console.error("Distance calculation failed or no valid concepts with complete scores found.");
         // Fallback: Grant first few concepts as default (less ideal)
         const defaultStarters = concepts.slice(0, 5);
         defaultStarters.forEach(c => {
             if (State.addDiscoveredConcept(c.id, c)) {
                 gainAttunementForAction('discover', c.primaryElement, 0.3);
             }
         });
         console.warn("Granted default starter concepts due to error.");
         UI.updateGrimoireCounter();
         return;
     }

     // Sort concepts by distance (closest first)
     conceptsWithDistance.sort((a, b) => a.distance - b.distance);

     // Selection Logic (Aim for ~7 diverse cards)
     const candidates = conceptsWithDistance.slice(0, 30); // Consider top 30 closest
     const starterHand = [];
     const starterHandIds = new Set();
     const targetHandSize = 7;
     const elementRepTarget = 4; // Aim for at least 4 unique elements represented
     const representedElements = new Set();

     // Prioritize closest concepts first
     for (const c of candidates) {
         if (starterHand.length >= 4) break; // Get closest 4 first
         if (!starterHandIds.has(c.id)) {
             starterHand.push(c);
             starterHandIds.add(c.id);
             if (c.primaryElement) representedElements.add(c.primaryElement);
         }
     }

     // Try to ensure element diversity
     for (const c of candidates) {
         if (starterHand.length >= targetHandSize) break;
         if (starterHandIds.has(c.id)) continue; // Skip already added

         const needsRep = c.primaryElement && representedElements.size < elementRepTarget && !representedElements.has(c.primaryElement);
         // Add if it provides needed representation OR if hand is still small
         if (needsRep || starterHand.length < 5) {
             starterHand.push(c);
             starterHandIds.add(c.id);
             if (c.primaryElement) representedElements.add(c.primaryElement);
         }
     }

     // Fill remaining slots with closest available concepts
     for (const c of candidates) {
         if (starterHand.length >= targetHandSize) break;
         if (!starterHandIds.has(c.id)) {
             starterHand.push(c);
             starterHandIds.add(c.id);
         }
     }

     console.log("Logic: Starter Hand Selected:", starterHand.map(c => c.name));

     // Add selected concepts to state and grant attunement
     starterHand.forEach(c => {
         if (State.addDiscoveredConcept(c.id, c)) {
             gainAttunementForAction('discover', c.primaryElement, 0.3);
         }
     });

     updateMilestoneProgress('discoveredConcepts.size', State.getDiscoveredConcepts().size);
     UI.updateGrimoireCounter();
}


// --- Core Screen Logic Calls ---
export function displayPersonaScreenLogic() {
    calculateTapestryNarrative(true); // Force recalculation on showing screen
    checkSynergyTensionStatus();
    UI.displayPersonaScreen(); // UI function handles rendering details
    UI.displayInsightLog(); // Show insight log when navigating here
}

export function displayWorkshopScreenLogic() {
    UI.displayWorkshopScreenContent();
    UI.refreshGrimoireDisplay(); // Ensure grimoire is up-to-date
}


// --- Research Actions (Workshop Version with Popup) ---
export function handleResearchClick({ currentTarget, isFree = false }) {
    const button = currentTarget;
    const elementKey = button.dataset.elementKey;
    const cost = parseFloat(button.dataset.cost);

    if (!elementKey || isNaN(cost)) { console.error("Invalid research button data."); return; }
    if (button.classList.contains('disabled')) { console.log("Research button disabled."); return; }

    let conducted = false;
    if (isFree && State.getInitialFreeResearchRemaining() > 0) {
        if (State.useInitialFreeResearch()) {
            console.log(`Logic: Used initial free research on ${elementKey}.`);
            conductResearch(elementKey);
            conducted = true;
             // Check onboarding phase 3 after conducting research
             checkOnboarding('conductResearch', 3);
        } else {
            UI.showTemporaryMessage("No free research attempts left.", Config.TOAST_DURATION);
        }
    }
    else if (spendInsight(cost, `Research: ${elementKeyToFullName[elementKey]}`)) {
        console.log(`Logic: Spent ${cost} Insight on ${elementKey}.`);
        conductResearch(elementKey);
        updateMilestoneProgress('conductResearch', 1);
        checkAndUpdateRituals('conductResearch');
        conducted = true;
         // Check onboarding phase 3 after conducting research
         checkOnboarding('conductResearch', 3);
    }

    // Refresh workshop UI only if research was actually conducted
    if (conducted && document.getElementById('workshopScreen')?.classList.contains('current')) {
        UI.displayWorkshopScreenContent(); // Update button states/costs
    }
}

export function handleFreeResearchClick() {
    if (!State.isFreeResearchAvailable()) {
        UI.showTemporaryMessage("Daily meditation already performed.", Config.TOAST_DURATION);
        return;
    }

    const attunement = State.getAttunement();
    let targetKey = null;
    let minAtt = Config.MAX_ATTUNEMENT + 1;

    // Find the element with the lowest attunement
    for (const key in attunement) {
        if (attunement.hasOwnProperty(key) && attunement[key] < minAtt) {
            minAtt = attunement[key];
            targetKey = key;
        }
    }

    if (!targetKey) { // Should not happen if attunement is initialized
        console.error("Could not determine target for free research.");
        UI.showTemporaryMessage("Error determining meditation target.", Config.TOAST_DURATION);
        return;
    }

    console.log(`Logic: Free meditation target: ${targetKey} (${elementKeyToFullName[targetKey]})`);
    State.setFreeResearchUsed(); // Mark as used
    UI.displayWorkshopScreenContent(); // Update button state immediately
    conductResearch(targetKey); // Perform the research
    updateMilestoneProgress('freeResearch', 1);
    checkAndUpdateRituals('freeResearch');
     // Check onboarding phase 3 after conducting research
     checkOnboarding('conductResearch', 3);
}

export function conductResearch(elementKeyToResearch) {
    const elementFullName = elementKeyToFullName[elementKeyToResearch];
    if (!elementFullName) { console.error(`Invalid element key for research: ${elementKeyToResearch}`); return; }

    console.log(`Logic: Conducting research for: ${elementFullName} (Key: ${elementKeyToResearch})`);
    UI.showTemporaryMessage(`Researching ${Utils.getElementShortName(elementDetails[elementFullName]?.name || elementFullName)}...`, 1500);

    const discoveredIds = new Set(State.getDiscoveredConcepts().keys());
    const discoveredRepo = State.getRepositoryItems();
    let rareFound = false; // Flag for special discoveries
    const roll = Math.random();
    const insightChance = 0.12; // Chance to find an elemental insight fragment
    const sceneChance = 0.08; // Chance to find a scene blueprint

    // Check for rare repository items first
    if (roll < insightChance && elementalInsights.some(i => !discoveredRepo.insights.has(i.id))) {
        const relevantInsights = elementalInsights.filter(i => i.element === elementKeyToResearch && !discoveredRepo.insights.has(i.id));
        const anyUnseenInsights = elementalInsights.filter(i => !discoveredRepo.insights.has(i.id));
        const insightPool = relevantInsights.length > 0 ? relevantInsights : anyUnseenInsights; // Prefer relevant, fallback to any

        if (insightPool.length > 0) {
            const foundInsight = insightPool[Math.floor(Math.random() * insightPool.length)];
            if (State.addRepositoryItem('insights', foundInsight.id)) {
                rareFound = true;
                UI.showTemporaryMessage(`Elemental Insight Found: "${foundInsight.text}" (Check Repository)`, 4000);
                updateMilestoneProgress('repositoryInsightsCount', State.getRepositoryItems().insights.size);
                if(document.getElementById('repositoryScreen')?.classList.contains('current')) UI.displayRepositoryContent();
                gainAttunementForAction('researchSpecial', elementKeyToResearch, 0.8); // Boost attunement for special find
            }
        }
    }
    // Check for Scene Blueprint if Insight wasn't found
    else if (!rareFound && roll < (insightChance + sceneChance) && sceneBlueprints.some(s => !discoveredRepo.scenes.has(s.id))) {
         const availableScenes = sceneBlueprints.filter(s => !discoveredRepo.scenes.has(s.id) && s.element === elementKeyToResearch); // Prefer element-relevant scenes
         const anyUnseenScenes = sceneBlueprints.filter(s => !discoveredRepo.scenes.has(s.id));
         const scenePool = availableScenes.length > 0 ? availableScenes : anyUnseenScenes; // Fallback to any

         if (scenePool.length > 0) {
             const foundScene = scenePool[Math.floor(Math.random() * scenePool.length)];
             if (State.addRepositoryItem('scenes', foundScene.id)) {
                 rareFound = true;
                 UI.showTemporaryMessage(`Scene Blueprint Discovered: '${foundScene.name}' (Check Repository)`, 4000);
                 if(document.getElementById('repositoryScreen')?.classList.contains('current')) UI.displayRepositoryContent();
                 gainAttunementForAction('researchSpecial', elementKeyToResearch, 0.8);
             }
         }
    }

    // If a rare repo item was found, maybe skip concept finding this time? (Optional rule)
    // if (rareFound) {
    //     UI.displayResearchResults({ concepts: [], duplicateInsightGain: 0 }); // Show empty results popup
    //     return;
    // }

    // Find potential concepts to discover for this element
    const conceptPool = concepts.filter(c => c.primaryElement === elementKeyToResearch && !discoveredIds.has(c.id));

    if (conceptPool.length === 0) {
        console.log(`Logic: No new primary concepts found for ${elementFullName}.`);
        gainInsight(1.5, `Research Echoes: ${elementFullName}`); // Slightly increased reward for finding nothing new
        UI.displayResearchResults({ concepts: [], duplicateInsightGain: 1.5 });
        gainAttunementForAction('researchFail', elementKeyToResearch);
        return;
    }

    // Determine number of results (e.g., 1-3)
    const numResults = Math.min(conceptPool.length, Math.floor(Math.random() * 3) + 1);
    const selectedOut = [];
    const availableIndices = Array.from(conceptPool.keys());

    // Randomly select concepts from the pool
    while (selectedOut.length < numResults && availableIndices.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        const poolIndex = availableIndices.splice(randomIndex, 1)[0];
        selectedOut.push(conceptPool[poolIndex]);
    }

    console.log(`Logic: Research Results for ${elementFullName}:`, selectedOut.map(c => c.name));

    if (selectedOut.length > 0) {
        if (selectedOut.some(c => c.rarity === 'rare')) {
            updateMilestoneProgress('discoverRareCard', 1);
        }
        gainAttunementForAction('researchSuccess', elementKeyToResearch); // Grant success attunement
        UI.displayResearchResults({ concepts: selectedOut, duplicateInsightGain: 0 });
    } else {
        // This case should be rare if pool wasn't empty, but handle defensively
        console.warn("Logic: Selection logic failed, no concepts selected despite pool.");
        UI.displayResearchResults({ concepts: [], duplicateInsightGain: 0 });
        gainAttunementForAction('researchFail', elementKeyToResearch);
    }
}

// --- Reflection Confirmation Logic ---
export function handleConfirmReflection(nudgeAllowed) {
    if (!currentPromptId) { console.error("No current prompt ID for reflection confirmation."); UI.hidePopups(); return; }

    console.log(`Logic: Reflection confirmed: Context=${currentReflectionContext}, Prompt=${currentPromptId}, Nudge=${nudgeAllowed}`);
    State.addSeenPrompt(currentPromptId); // Mark prompt as seen

    let rewardAmt = 5.0;
    let attuneKey = null;
    let attuneAmt = 1.0;
    let milestoneAct = 'completeReflection';
    let reflectionSourceText = `Reflection (${currentReflectionContext || 'Unknown'})`;

    // Determine reward amount based on context
    switch (currentReflectionContext) {
        case 'Guided':
            rewardAmt = Config.GUIDED_REFLECTION_COST + 3; // Slight bonus over cost
            reflectionSourceText = `Guided Reflection (${currentReflectionCategory || 'Unknown'})`;
            break;
        case 'RareConcept':
            rewardAmt = 8.0; // Higher reward for rare concept prompts
            const conceptData = State.getDiscoveredConcepts().get(reflectionTargetConceptId);
            reflectionSourceText = `Rare Reflection (${conceptData?.concept?.name || 'Unknown Concept'})`;
            break;
        case 'SceneMeditation':
            const scene = sceneBlueprints.find(s => s.reflectionPromptId === currentPromptId);
            rewardAmt = (scene?.meditationCost || Config.SCENE_MEDITATION_BASE_COST) + 5;
            reflectionSourceText = `Scene Meditation (${scene?.name || 'Unknown Scene'})`;
            break;
        case 'Dissonance':
             // Reward handled below after nudge/add logic
             const dissonantConcept = concepts.find(c => c.id === reflectionTargetConceptId);
             reflectionSourceText = `Dissonance Reflection (${dissonantConcept?.name || 'Unknown Concept'})`;
            break;
        default: // Standard or unknown
            rewardAmt = 5.0;
            reflectionSourceText = `Standard Reflection (${currentReflectionCategory || 'General'})`;
            break;
    }

    // --- Handle Dissonance Confirmation ---
    if (currentReflectionContext === 'Dissonance') {
        milestoneAct = 'completeReflectionDissonance';
        attuneAmt = 0.5; // Lower attunement gain for resolving dissonance
        rewardAmt = 3.0; // Standard reward for resolving dissonance

        // Apply score nudge if allowed and target concept exists
        if (nudgeAllowed && reflectionTargetConceptId) {
            console.log("Logic: Processing nudge for Dissonance...");
            const concept = concepts.find(c => c.id === reflectionTargetConceptId);
            const scores = State.getScores();
            let nudged = false;
            if (concept?.elementScores) {
                const newScores = { ...scores };
                // Nudge ALL scores slightly towards the concept's profile
                for (const key in scores) {
                    if (scores.hasOwnProperty(key) && concept.elementScores.hasOwnProperty(key)) {
                        const uScore = scores[key];
                        const cScore = concept.elementScores[key];
                        const diff = cScore - uScore;
                        // Only nudge if the difference is somewhat significant
                        if (Math.abs(diff) > 1.0) { // Lowered threshold slightly
                            const nudgeVal = Math.sign(diff) * Config.SCORE_NUDGE_AMOUNT;
                            newScores[key] = Math.max(0, Math.min(10, uScore + nudgeVal));
                            if (newScores[key] !== uScore) nudged = true;
                        }
                    }
                }
                if (nudged) {
                    State.updateScores(newScores); // Update state
                    console.log("Logic: Nudged Scores (7 Elements):", State.getScores());
                    // Refresh relevant UI if visible
                    if (document.getElementById('personaScreen')?.classList.contains('current')) { UI.displayPersonaScreen(); }
                    UI.showTemporaryMessage("Core understanding shifted slightly.", 3500);
                    gainAttunementForAction('scoreNudge', 'All', 0.5); // Grant attunement for nudge
                    updateMilestoneProgress('scoreNudgeApplied', 1);
                }
            } else { console.warn(`Cannot apply nudge, concept data missing for ID ${reflectionTargetConceptId}`); }
        }

        // Add the concept to the Grimoire NOW that reflection is confirmed
        if (reflectionTargetConceptId) {
            if (addConceptToGrimoireInternal(reflectionTargetConceptId, 'dissonanceConfirm')) {
                // Update the research popup item state if it's still open and pending
                 const researchPopupIsOpen = researchResultsPopup && !researchResultsPopup.classList.contains('hidden');
                 const pendingItem = researchPopupContent?.querySelector(`.research-result-item[data-concept-id="${reflectionTargetConceptId}"][data-choice-made="pending_dissonance"]`);
                 if (researchPopupIsOpen && pendingItem) {
                     UI.handleResearchPopupAction(reflectionTargetConceptId, 'kept_after_dissonance');
                 }
            } else {
                 // If adding failed (e.g., already exists somehow), refund insight? Unlikely scenario.
                 console.warn(`Failed to add concept ${reflectionTargetConceptId} after dissonance confirmation.`);
            }
        }
    } // End Dissonance Handling

    // --- Grant Insight & Attunement ---
    gainInsight(rewardAmt, reflectionSourceText);

    // Determine Attunement target
    if (currentReflectionContext === 'Standard' && currentReflectionCategory) {
        attuneKey = Object.keys(elementKeyToFullName).find(key => elementKeyToFullName[key] === currentReflectionCategory);
    } else if (currentReflectionContext === 'RareConcept' && reflectionTargetConceptId) {
        const conceptData = State.getDiscoveredConceptData(reflectionTargetConceptId);
        attuneKey = conceptData?.concept?.primaryElement || null;
    } else if (currentReflectionContext === 'SceneMeditation') {
        const scene = sceneBlueprints.find(s => s.reflectionPromptId === currentPromptId);
        attuneKey = scene?.element || null;
    }
    // Apply attunement
    if (attuneKey) {
        gainAttunementForAction('completeReflection', attuneKey, attuneAmt);
    } else {
        // Apply generic attunement if specific key couldn't be determined or for Dissonance/Guided without category
        gainAttunementForAction('completeReflectionGeneric', 'All', 0.2);
    }

    // --- Update Milestones & Rituals ---
    updateMilestoneProgress(milestoneAct, 1); // Track base reflection milestone
    checkAndUpdateRituals('completeReflection'); // Check base action for rituals
    const ritualCtxMatch = `${currentReflectionContext}_${currentPromptId}`;
    checkAndUpdateRituals('completeReflection', { contextMatch: ritualCtxMatch }); // Check specific context match

    // --- Cleanup ---
    UI.hidePopups(); // Standard hide function handles clearing state now
    UI.showTemporaryMessage("Reflection complete! Insight gained.", Config.TOAST_DURATION);
     checkOnboarding('completeReflection', 7); // Check if this completes phase 7
} // End handleConfirmReflection


// --- Grimoire / Collection Actions ---
export function handleResearchPopupChoice(conceptId, action) {
    const concept = concepts.find(c => c.id === conceptId);
    if (!concept) { console.error(`Cannot process choice: Concept ${conceptId} not found.`); return; }

    console.log(`Logic: Processing research choice: ${action} for ${concept.name} (ID: ${conceptId})`);

    if (action === 'keep') {
        const distance = Utils.euclideanDistance(State.getScores(), concept.elementScores, concept.name);
        if (distance > Config.DISSONANCE_THRESHOLD) {
            // Trigger Dissonance Reflection - Concept addition deferred
            triggerReflectionPrompt('Dissonance', concept.id);
            UI.handleResearchPopupAction(conceptId, 'pending_dissonance'); // Update UI to show pending state
            console.log(`Logic: Dissonance triggered for ${concept.name}. Addition deferred pending reflection.`);
        } else {
            // Add directly if not dissonant
            if(addConceptToGrimoireInternal(conceptId, 'researchKeep')) {
                UI.handleResearchPopupAction(conceptId, 'kept'); // Update UI immediately
                 checkOnboarding('addToGrimoire', 4); // Check onboarding after adding
            } else {
                 // Handle case where adding failed (e.g., already exists - shouldn't happen here)
                 UI.handleResearchPopupAction(conceptId, 'error_adding'); // Update UI to show error?
            }
        }
    } else if (action === 'sell') {
        const discoveryValue = Config.CONCEPT_DISCOVERY_INSIGHT[concept.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default;
        const sellValue = discoveryValue * Config.SELL_INSIGHT_FACTOR;
        gainInsight(sellValue, `Sold from Research: ${concept.name}`);
        updateMilestoneProgress('sellConcept', 1);
        UI.handleResearchPopupAction(conceptId, 'sold'); // Update UI
        console.log(`Logic: Sold ${concept.name} from research for ${sellValue.toFixed(1)} Insight.`);
    } else {
        console.warn(`Unknown action '${action}' for research popup choice.`);
    }
     // Refresh Grimoire if a concept was actually added state-side (not pending)
     if (action === 'keep' && State.getDiscoveredConcepts().has(conceptId)) {
         UI.refreshGrimoireDisplay();
         UI.updateGrimoireCounter();
     }
}

// Internal function to add concept, handles synergy checks, rewards, prompts etc.
function addConceptToGrimoireInternal(conceptId, context = 'unknown') {
    const conceptToAdd = concepts.find(c => c.id === conceptId);
    if (!conceptToAdd) { console.error("Internal add fail: Concept not found. ID:", conceptId); return false; }
    if (State.getDiscoveredConcepts().has(conceptId)) {
        console.warn(`Attempted to re-add already discovered concept ${conceptId} (${conceptToAdd.name}). Context: ${context}`);
        return false; // Prevent re-adding
    }

    console.log(`Logic: Adding '${conceptToAdd.name}' (ID: ${conceptId}) internally. Context: ${context}`);

    if (State.addDiscoveredConcept(conceptId, conceptToAdd)) { // Add to state first
        let insightReward = Config.CONCEPT_DISCOVERY_INSIGHT[conceptToAdd.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default;
        let bonusInsight = 0;
        let synergyMessage = null; // Store message to show after main add message

        // Synergy Check
        if (conceptToAdd.relatedIds && conceptToAdd.relatedIds.length > 0) {
            const discoveredMap = State.getDiscoveredConcepts();
            const undiscoveredRelated = conceptToAdd.relatedIds.filter(id => !discoveredMap.has(id));

            // Bonus for linking to already discovered concepts
            for (const relatedId of conceptToAdd.relatedIds) {
                if (discoveredMap.has(relatedId)) {
                    bonusInsight += Config.SYNERGY_INSIGHT_BONUS;
                    if (!synergyMessage) { // Show only one bonus message per add
                         const relatedConcept = discoveredMap.get(relatedId)?.concept;
                         synergyMessage = `Synergy Bonus: +${Config.SYNERGY_INSIGHT_BONUS.toFixed(1)} Insight (Related to ${relatedConcept?.name || 'a known concept'})`;
                    }
                }
            }

            // Chance to auto-discover a related concept
            if (undiscoveredRelated.length > 0 && Math.random() < Config.SYNERGY_DISCOVERY_CHANCE) {
                const relatedIdToDiscover = undiscoveredRelated[Math.floor(Math.random() * undiscoveredRelated.length)];
                const relatedConceptData = concepts.find(c => c.id === relatedIdToDiscover);
                if (relatedConceptData && !State.getDiscoveredConcepts().has(relatedIdToDiscover)) {
                    // Recursive call - potential risk, but usually fine for one level
                    addConceptToGrimoireInternal(relatedIdToDiscover, 'synergy');
                    // Use a more prominent message for auto-discovery
                    UI.showTemporaryMessage(`Synergy Resonance: Focusing ${conceptToAdd.name} also revealed ${relatedConceptData.name}! Check your Grimoire.`, 5000);
                    console.log(`Logic: Synergy discovery! Added ${relatedConceptData.name} (ID: ${relatedIdToDiscover})`);
                }
            }
        }

        insightReward += bonusInsight;
        gainInsight(insightReward, `Discovered: ${conceptToAdd.name}${bonusInsight > 0 ? ' (Synergy)' : ''}`);
        gainAttunementForAction('addToGrimoire', conceptToAdd.primaryElement, 0.6);

        // Check for Rare Concept Reflection Prompt
        if (conceptToAdd.rarity === 'rare' && conceptToAdd.uniquePromptId && reflectionPrompts.RareConcept?.[conceptToAdd.uniquePromptId]) {
            State.addPendingRarePrompt(conceptToAdd.uniquePromptId);
            console.log(`Logic: Queued rare prompt ${conceptToAdd.uniquePromptId} for ${conceptToAdd.name}`);
        }

        // Update UI & Trigger Checks
        UI.updateGrimoireCounter();
        if (currentlyDisplayedConceptId === conceptId) { // Refresh popup if viewing this concept
            UI.showConceptDetailPopup(conceptId);
        }
        checkTriggerReflectionPrompt('add'); // Check if adding triggers standard reflection
        updateMilestoneProgress('addToGrimoire', 1);
        updateMilestoneProgress('discoveredConcepts.size', State.getDiscoveredConcepts().size);
        checkAndUpdateRituals('addToGrimoire', { conceptId: conceptId, rarity: conceptToAdd.rarity, conceptType: conceptToAdd.cardType });
        UI.refreshGrimoireDisplay(); // Refresh the grimoire view

        // Show messages (delay synergy message slightly)
        if (context !== 'synergy' && context !== 'dissonanceConfirm') { // Avoid message spam from synergy/dissonance
             UI.showTemporaryMessage(`${conceptToAdd.name} added to Grimoire!`, Config.TOAST_DURATION);
             if (synergyMessage) {
                 setTimeout(() => UI.showTemporaryMessage(synergyMessage, 3500), 500);
             }
        } else if (context === 'dissonanceConfirm') {
             UI.showTemporaryMessage(`${conceptToAdd.name} accepted into Grimoire after reflection.`, Config.TOAST_DURATION);
        }

        return true; // Successfully added
    } else {
        console.error(`Logic: State failed to add concept ${conceptToAdd.name}.`);
        UI.showTemporaryMessage(`Error adding ${conceptToAdd.name}.`, Config.TOAST_DURATION);
        return false;
    }
}

// Called from UI button click (Detail Popup 'Add to Grimoire')
export function addConceptToGrimoireById(conceptId, buttonElement = null) {
     if (State.getDiscoveredConcepts().has(conceptId)) {
         UI.showTemporaryMessage("Already in Grimoire.", 2500);
         return; // Already discovered
     }
     const concept = concepts.find(c => c.id === conceptId);
     if (!concept) {
         console.error("Cannot add concept: Not found. ID:", conceptId);
         UI.showTemporaryMessage("Error: Concept not found.", 3000);
         return;
     }

     // Check for Dissonance
     const distance = Utils.euclideanDistance(State.getScores(), concept.elementScores, concept.name);
     if (distance > Config.DISSONANCE_THRESHOLD) {
         triggerReflectionPrompt('Dissonance', concept.id);
         if(buttonElement) buttonElement.disabled = true; // Disable button while reflection pending
         console.log(`Logic: Dissonance triggered for ${concept.name} from detail popup. Addition deferred.`);
     } else {
         // Add directly if not dissonant
         if (addConceptToGrimoireInternal(conceptId, 'detailPopup')) {
             if(buttonElement) UI.updateGrimoireButtonStatus(conceptId); // Update button state in popup
             checkOnboarding('addToGrimoire', 4); // Check onboarding after adding
         }
     }
}

export function handleToggleFocusConcept() {
    if (currentlyDisplayedConceptId === null) return;
    handleCardFocusToggle(currentlyDisplayedConceptId); // Call the main toggle logic
    UI.updateFocusButtonStatus(currentlyDisplayedConceptId); // Update button in popup
}

export function handleCardFocusToggle(conceptId) {
    if (isNaN(conceptId)) { console.error("Invalid concept ID for focus toggle."); return; }

    const result = State.toggleFocusConcept(conceptId);
    const conceptName = State.getDiscoveredConceptData(conceptId)?.concept?.name || `ID ${conceptId}`;

    if (result === 'not_discovered') {
        UI.showTemporaryMessage("Concept not in Grimoire.", 3000);
    } else if (result === 'slots_full') {
        UI.showTemporaryMessage(`Focus slots full (${State.getFocusSlots()}).`, 3000);
    } else {
        if (result === 'removed') {
            UI.showTemporaryMessage(`${conceptName} removed from Focus.`, 2500);
            checkAndUpdateRituals('removeFocus');
        } else { // Added
            UI.showTemporaryMessage(`${conceptName} marked as Focus!`, 2500);
            gainInsight(1.0, `Focused on ${conceptName}`);
            const concept = State.getDiscoveredConceptData(conceptId)?.concept;
            if (concept?.primaryElement) {
                gainAttunementForAction('markFocus', concept.primaryElement, 1.0);
            }
            updateMilestoneProgress('markFocus', 1);
            updateMilestoneProgress('focusedConcepts.size', State.getFocusedConcepts().size);
            checkAndUpdateRituals('markFocus', { conceptId: conceptId });
             // Check onboarding phase 5 after first focus
             checkOnboarding('markFocus', 5);
             // Check onboarding phase 6 requires navigating back to Persona
             // We can't check that directly here, main.js navigation listener handles it.
        }

        // Update relevant UI components
        UI.refreshGrimoireDisplay(); // Update grimoire view (card stamp/filters)
        calculateTapestryNarrative(true); // Recalculate narrative
        checkSynergyTensionStatus(); // Update synergy button status

        if (document.getElementById('personaScreen')?.classList.contains('current')) {
            UI.displayFocusedConceptsPersona();
            UI.generateTapestryNarrative();
            UI.synthesizeAndDisplayThemesPersona();
        }
        checkForFocusUnlocks(); // Check if new focus combination unlocks items
        UI.updateElementalDilemmaButtonState();
        UI.updateSuggestSceneButtonState();

        // If the detail popup for this concept is open, update its focus button
        if (currentlyDisplayedConceptId === conceptId) {
            UI.updateFocusButtonStatus(conceptId);
        }
    }
}

// Handles selling from Grimoire card OR Detail Popup sell button
export function handleSellConcept(event) {
    const button = event.target.closest('button[data-concept-id]');
    if (!button) return;
    const conceptId = parseInt(button.dataset.conceptId);
    const context = button.dataset.context; // 'grimoire' or 'detail' (not 'discovery' anymore)

    if (isNaN(conceptId)) { console.error("Invalid concept ID for selling."); return; }
    // No longer need discovery context check here

    const discoveredData = State.getDiscoveredConceptData(conceptId);
    const concept = discoveredData?.concept;
    if (!concept) { console.error(`Sell fail: Concept ${conceptId} not found in discovered state.`); UI.showTemporaryMessage("Error selling concept.", 3000); return; }

    let discoveryValue = Config.CONCEPT_DISCOVERY_INSIGHT[concept.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default;
    const sellValue = discoveryValue * Config.SELL_INSIGHT_FACTOR;
    const sourceLoc = (context === 'grimoire') ? 'Grimoire Library' : 'Detail Popup';

    if (confirm(`Sell '${concept.name}' (${concept.rarity}) from ${sourceLoc} for ${sellValue.toFixed(1)} Insight? This is permanent.`)) {
        gainInsight(sellValue, `Sold: ${concept.name}`);
        updateMilestoneProgress('sellConcept', 1);
        checkAndUpdateRituals('sellConcept'); // Check ritual for selling

        let focusChanged = State.getFocusedConcepts().has(conceptId); // Check if it was focused BEFORE removing

        // Remove the concept from the discovered list
        if(State.removeDiscoveredConcept(conceptId)) {
            UI.updateGrimoireCounter();
            UI.refreshGrimoireDisplay(); // Update grimoire view
        } else {
             console.error(`Failed to remove concept ${conceptId} from state during sell.`);
             // Refund? Maybe not, the gainInsight already happened.
        }

        // If focus changed, update tapestry etc.
        if (focusChanged) {
            calculateTapestryNarrative(true);
            checkSynergyTensionStatus();
            if (document.getElementById('personaScreen')?.classList.contains('current')) {
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
        if (context !== 'grimoire' && currentlyDisplayedConceptId === conceptId) {
            UI.hidePopups();
        }
    }
}


// --- Reflection Logic ---
export function checkTriggerReflectionPrompt(triggerAction = 'other') {
    const currentState = State.getState();
    if (currentState.promptCooldownActive) return; // Don't trigger if on cooldown

    // Increment trigger count for specific actions
    if (triggerAction === 'add') {
        State.incrementReflectionTrigger();
    } else if (triggerAction === 'completeQuestionnaire') {
        // Grant multiple triggers after questionnaire to likely get first reflection
        State.incrementReflectionTrigger(); State.incrementReflectionTrigger(); State.incrementReflectionTrigger();
    }

    const cardsAdded = currentState.cardsAddedSinceLastPrompt;
    const hasPendingRare = currentState.pendingRarePrompts.length > 0;

    // Prioritize pending rare prompts
    if (hasPendingRare) {
        console.log("Logic: Pending rare prompt found. Triggering RareConcept reflection.");
        triggerReflectionPrompt('RareConcept'); // Let triggerReflectionPrompt handle getting the specific ID
        State.resetReflectionTrigger(true); // Reset count and start cooldown
        startReflectionCooldown(Config.REFLECTION_COOLDOWN);
    }
    // Check standard reflection trigger threshold
    else if (cardsAdded >= Config.REFLECTION_TRIGGER_THRESHOLD) {
        console.log("Logic: Reflection trigger threshold met. Triggering Standard reflection.");
        triggerReflectionPrompt('Standard');
        State.resetReflectionTrigger(true);
        startReflectionCooldown(Config.REFLECTION_COOLDOWN);
    }
}

export function startReflectionCooldown(duration = Config.REFLECTION_COOLDOWN) {
    if (reflectionCooldownTimeout) clearTimeout(reflectionCooldownTimeout);
    State.setPromptCooldownActive(true);
    console.log(`Logic: Reflection cooldown started (${duration / 1000}s).`);
    reflectionCooldownTimeout = setTimeout(() => {
        State.clearReflectionCooldown();
        console.log("Logic: Reflection cooldown ended.");
        reflectionCooldownTimeout = null;
    }, duration);
}

// Central function to select and display a reflection prompt
export function triggerReflectionPrompt(context = 'Standard', targetId = null, category = null) {
    currentReflectionContext = context;
    reflectionTargetConceptId = (context === 'Dissonance' || context === 'RareConcept') ? targetId : null;
    currentReflectionCategory = category; // Store category if provided (for Guided/Standard)
    currentPromptId = null; // Reset prompt ID
    let selectedPrompt = null;
    let title = "Moment for Reflection";
    let promptCatLabel = "General";
    let showNudge = false;
    let reward = 5.0;

    console.log(`Logic: Triggering reflection - Context=${context}, TargetID=${targetId}, Category=${category}`);

    // 1. Check for Pending Rare Prompts (unless Dissonance/SceneMeditation)
    if (context !== 'Dissonance' && context !== 'SceneMeditation') {
        const nextRareId = State.getNextRarePrompt(); // Gets and removes from queue
        if (nextRareId) {
            selectedPrompt = reflectionPrompts.RareConcept?.[nextRareId];
            if (selectedPrompt) {
                currentReflectionContext = 'RareConcept'; // Override context
                currentPromptId = selectedPrompt.id;
                // Find the concept associated with this rare prompt ID
                 const conceptEntry = Array.from(State.getDiscoveredConcepts().entries()).find(([id, data]) => data.concept.uniquePromptId === nextRareId);
                 if (conceptEntry) {
                     reflectionTargetConceptId = conceptEntry[0]; // Store concept ID for potential use
                     promptCatLabel = conceptEntry[1].concept.name;
                     title = `Reflection: ${promptCatLabel}`;
                 } else {
                     promptCatLabel = "Rare Concept"; title = "Rare Concept Reflection";
                     console.warn(`Could not find concept associated with rare prompt ID: ${nextRareId}`);
                 }
                reward = 8.0; // Higher reward for rare
                console.log(`Logic: Displaying Queued Rare reflection: ${nextRareId} for ${promptCatLabel}`);
                 checkOnboarding('triggerReflection', 7); // Check if this fulfills phase 7
                 UI.displayReflectionPrompt({ title, category: promptCatLabel, prompt: selectedPrompt, showNudge, reward }, currentReflectionContext);
                return; // Stop further processing if rare prompt found
            } else {
                console.warn(`Rare prompt text missing for ID: ${nextRareId}. Re-queuing.`);
                State.addPendingRarePrompt(nextRareId); // Add it back if text missing
                currentReflectionContext = 'Standard'; // Fallback to standard if rare fails
            }
        }
    }

    // 2. Handle Specific Contexts (Dissonance, Guided, Scene)
    let promptPool = [];
    if (context === 'Dissonance' && targetId) {
        title = "Dissonance Reflection";
        const concept = concepts.find(c => c.id === targetId);
        promptCatLabel = concept ? concept.name : "Dissonant Concept";
        promptPool = reflectionPrompts.Dissonance || [];
        showNudge = true; // Allow nudge for dissonance
        reward = 3.0; // Lower reward for dissonance resolution itself
        reflectionTargetConceptId = targetId;
        console.log(`Logic: Selecting Dissonance prompt for ${promptCatLabel}`);
    } else if (context === 'Guided' && category) {
        title = "Guided Reflection";
        promptCatLabel = category; // Use the provided category name
        promptPool = reflectionPrompts.Guided?.[category] || [];
        reward = Config.GUIDED_REFLECTION_COST + 3; // Bonus over cost
        console.log(`Logic: Selecting Guided prompt for category: ${category}`);
    } else if (context === 'SceneMeditation' && targetId) {
        const scene = sceneBlueprints.find(s => s.id === targetId);
        if (scene?.reflectionPromptId) {
            selectedPrompt = reflectionPrompts.SceneMeditation?.[scene.reflectionPromptId];
            if (selectedPrompt) {
                title = "Scene Meditation";
                promptCatLabel = scene.name;
                currentPromptId = selectedPrompt.id;
                reward = (scene.meditationCost || Config.SCENE_MEDITATION_BASE_COST) + 5;
                console.log(`Logic: Displaying Scene Meditation: ${currentPromptId} for ${scene.name}`);
                 checkOnboarding('triggerReflection', 7); // Check if this fulfills phase 7
                UI.displayReflectionPrompt({ title, category: promptCatLabel, prompt: selectedPrompt, showNudge, reward }, currentReflectionContext);
                return; // Stop processing if scene prompt found
            } else { console.warn(`Scene prompt text missing for ID: ${scene.reflectionPromptId}. Falling back.`); context = 'Standard'; } // Fallback if prompt missing
        } else { console.warn(`Scene ${targetId} or its prompt ID missing. Falling back.`); context = 'Standard'; } // Fallback if scene data missing
    }

    // 3. Handle Standard Reflection (or fallback)
    if (context === 'Standard' || promptPool.length === 0 && context !== 'Dissonance') {
        currentReflectionContext = 'Standard'; // Ensure context is Standard
        title = "Standard Reflection";
        reward = 5.0;
        // Select an element based on attunement (prefer higher attunement)
        const attunement = State.getAttunement();
        const validElements = Object.entries(attunement)
            .filter(([key, value]) => value > 0 && reflectionPrompts[elementKeyToFullName[key]]?.length > 0) // Check if prompts exist for element
            .sort(([, a], [, b]) => b - a); // Sort descending attunement

        if (validElements.length > 0) {
            // Pick randomly from the top half (or just top one if only 1-2 valid)
            const topTierCount = Math.max(1, Math.ceil(validElements.length / 2));
            const topTier = validElements.slice(0, topTierCount);
            const [selectedKey] = topTier[Math.floor(Math.random() * topTier.length)];
            const selectedFullName = elementKeyToFullName[selectedKey];
            promptPool = reflectionPrompts[selectedFullName] || [];
            promptCatLabel = Utils.getElementShortName(elementDetails[selectedFullName]?.name || selectedFullName);
            currentReflectionCategory = selectedFullName; // Store the full name for potential use
            console.log(`Logic: Selecting Standard prompt (Selected Element: ${promptCatLabel})`);
        } else {
            promptPool = []; // No valid elements to select from
            console.warn("Logic: No elements with attunement > 0 or no prompts available for Standard reflection.");
        }
    }

    // 4. Select Prompt from Pool (if not already selected)
    if (!selectedPrompt && promptPool.length > 0) {
        const seen = State.getSeenPrompts();
        const available = promptPool.filter(p => !seen.has(p.id));
        // Prefer unseen prompts, fallback to random seen prompt if necessary
        selectedPrompt = available.length > 0
            ? available[Math.floor(Math.random() * available.length)]
            : promptPool[Math.floor(Math.random() * promptPool.length)];
        currentPromptId = selectedPrompt.id;
        console.log(`Logic: Selected prompt ${currentPromptId} from pool.`);
    }

    // 5. Display the selected prompt or handle failure
    if (selectedPrompt && currentPromptId) {
        const promptData = { title, category: promptCatLabel, prompt: selectedPrompt, showNudge, reward };
         checkOnboarding('triggerReflection', 7); // Check if this fulfills phase 7
        UI.displayReflectionPrompt(promptData, currentReflectionContext);
    } else {
        console.error(`Logic: Could not select a prompt for context ${context}.`);
        if (context === 'Dissonance' && reflectionTargetConceptId) {
            // Failsafe: If dissonance reflection fails to trigger, add the concept directly
            console.warn("Logic: Dissonance reflection failed to trigger prompt, adding concept directly.");
            if(addConceptToGrimoireInternal(reflectionTargetConceptId, 'dissonanceFail')) {
                 // Update research popup UI if needed
                 handleResearchPopupAction(reflectionTargetConceptId, 'kept_after_dissonance_fail');
            }
            UI.hidePopups();
            UI.showTemporaryMessage("Reflection unavailable, concept added.", 3500);
        } else if (context === 'Guided') {
            // Refund Insight if Guided reflection fails
            gainInsight(Config.GUIDED_REFLECTION_COST, "Refund: No guided prompt");
            UI.showTemporaryMessage("No guided reflections available for that element currently.", 3000);
        } else {
            // Generic failure message
            UI.showTemporaryMessage("No reflection prompt available at this time.", 3000);
        }
        clearPopupState(); // Clear state if prompt failed
    }
}

// --- Trigger Guided Reflection (Called from UI) ---
export function triggerGuidedReflection() {
    // Simple approach: Pick a random element to reflect on
    const availableElements = elementNames.filter(name => reflectionPrompts.Guided?.[name]?.length > 0);
    if (availableElements.length === 0) {
        UI.showTemporaryMessage("No guided reflections available at all.", 3000);
        return;
    }
    const randomElement = availableElements[Math.floor(Math.random() * availableElements.length)];
    const cost = Config.GUIDED_REFLECTION_COST;

    if (spendInsight(cost, `Seek Guidance: ${randomElement}`)) {
        triggerReflectionPrompt('Guided', null, randomElement); // Trigger with context and category
    }
     // No separate onboarding check needed here, triggerReflectionPrompt handles it
}

// --- Notes, Library, Repository Actions ---
export function handleSaveNote() {
    if (currentlyDisplayedConceptId === null) return;
    const notesTA = document.getElementById('myNotesTextarea');
    if (!notesTA) return;
    const noteText = notesTA.value.trim();
    if (State.updateNotes(currentlyDisplayedConceptId, noteText)) {
        UI.updateNoteSaveStatus("Saved!", false);
    } else {
        UI.updateNoteSaveStatus("Error.", true);
    }
}

export function handleUnlockLibraryLevel(event) {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    const key = button.dataset.elementKey;
    const level = parseInt(button.dataset.level);
    if (!key || isNaN(level)) { console.error("Invalid library unlock data"); return; }
    unlockDeepDiveLevelInternal(key, level); // Call internal logic
}

function unlockDeepDiveLevelInternal(elementKey, levelToUnlock) {
    const deepDiveData = elementDeepDive[elementKey] || [];
    const levelData = deepDiveData.find(l => l.level === levelToUnlock);
    const currentLevel = State.getState().unlockedDeepDiveLevels[elementKey] || 0;

    if (!levelData || levelToUnlock !== currentLevel + 1) {
        console.warn(`Library unlock fail: Invalid level/sequence for ${elementKey}. Trying to unlock ${levelToUnlock}, current is ${currentLevel}.`);
        return;
    }
    const cost = levelData.insightCost || 0; // Use cost defined in data

    if (spendInsight(cost, `Unlock Insight: ${elementKeyToFullName[elementKey]} Lv ${levelToUnlock}`)) {
        if (State.unlockLibraryLevel(elementKey, levelToUnlock)) {
            console.log(`Logic: Unlocked ${elementKeyToFullName[elementKey]} insight level ${levelToUnlock}`);
            // Refresh the specific deep dive UI section if visible
            if (document.getElementById('personaScreen')?.classList.contains('current')) {
                 const targetContainer = document.querySelector(`#personaElementDetails .element-deep-dive-container[data-element-key="${elementKey}"]`);
                 if (targetContainer) {
                     UI.displayElementDeepDive(elementKey, targetContainer);
                 } else { console.warn(`Could not find container for ${elementKey} to refresh UI.`); }
            }
            UI.showTemporaryMessage(`${Utils.getElementShortName(elementKeyToFullName[elementKey])} Insight Lv ${levelToUnlock} Unlocked!`, 3000);
            updateMilestoneProgress('unlockLibrary', levelToUnlock); // Track level reached
            updateMilestoneProgress('unlockedDeepDiveLevels', State.getState().unlockedDeepDiveLevels); // Track overall state
            checkAndUpdateRituals('unlockLibrary');
            // Check onboarding phase 6
            checkOnboarding('unlockLibrary', 6);
        } else {
            console.error(`Logic: State failed to unlock library level for ${elementKey} Lv ${levelToUnlock}.`);
            gainInsight(cost, `Refund: Library unlock state error`); // Refund if state update failed
            UI.showTemporaryMessage("Error unlocking insight level.", 3000);
        }
    }
}

export function handleMeditateScene(event) {
    const button = event.target.closest('button[data-scene-id]');
    if (!button || button.disabled) return;
    const sceneId = button.dataset.sceneId;
    if (!sceneId) return;
    meditateOnSceneInternal(sceneId);
}

function meditateOnSceneInternal(sceneId) {
    const scene = sceneBlueprints.find(s => s.id === sceneId);
    if (!scene) { console.error(`Scene not found: ${sceneId}`); return; }

    const cost = scene.meditationCost || Config.SCENE_MEDITATION_BASE_COST;
    if (spendInsight(cost, `Meditate: ${scene.name}`)) {
        if (scene.reflectionPromptId) {
            console.log(`Logic: Triggering Scene Meditation: ${scene.name} (Prompt ID: ${scene.reflectionPromptId})`);
            triggerReflectionPrompt('SceneMeditation', sceneId); // Pass sceneId as targetId
            updateMilestoneProgress('meditateScene', 1);
            checkAndUpdateRituals('meditateScene');
        } else {
            console.error(`Prompt ID missing for scene ${sceneId}`);
            gainInsight(cost, `Refund: Missing scene prompt`); // Refund if prompt missing
            UI.showTemporaryMessage("Meditation failed: Reflection data missing.", 3000);
        }
    }
}

export function handleAttemptExperiment(event) {
    const button = event.target.closest('button[data-experiment-id]');
    if (!button || button.disabled) return;
    const expId = button.dataset.experimentId;
    if (!expId) return;
    attemptExperimentInternal(expId);
}

function attemptExperimentInternal(experimentId) {
    const exp = alchemicalExperiments.find(e => e.id === experimentId);
    if (!exp) { console.warn(`Experiment ${experimentId} not found.`); return; }
    if(State.getRepositoryItems().experiments.has(experimentId)) {
        UI.showTemporaryMessage("Experiment already completed.", 2500); return;
    }

    // Check Requirements
    const attunement = State.getAttunement();
    const focused = State.getFocusedConcepts();
    const insight = State.getInsight();
    const scores = State.getScores();
    let canAttempt = true;
    let unmetReqs = [];

    // Attunement Requirement
    if (attunement[exp.requiredElement] < exp.requiredAttunement) {
        canAttempt = false; unmetReqs.push(`${exp.requiredAttunement} ${Utils.getElementShortName(elementKeyToFullName[exp.requiredElement])} Attun.`);
    }
    // RoleFocus Score Requirements
    if (exp.requiredRoleFocusScore && (scores.RF || 0) < exp.requiredRoleFocusScore) {
        canAttempt = false; unmetReqs.push(`RF Score ≥ ${exp.requiredRoleFocusScore}`);
    }
    if (exp.requiredRoleFocusScoreBelow && (scores.RF || 0) >= exp.requiredRoleFocusScoreBelow) {
        canAttempt = false; unmetReqs.push(`RF Score < ${exp.requiredRoleFocusScoreBelow}`);
    }
    // Focused Concept ID Requirements
    if (exp.requiredFocusConceptIds) {
        for (const reqId of exp.requiredFocusConceptIds) {
            if (!focused.has(reqId)) {
                canAttempt = false;
                const c = concepts.find(c=>c.id === reqId);
                unmetReqs.push(c ? `Focus: ${c.name}` : `Focus: ID ${reqId}`);
            }
        }
    }
    // Focused Concept Type Requirements
    if (exp.requiredFocusConceptTypes) {
        for (const typeReq of exp.requiredFocusConceptTypes) {
            let met = false;
            const dMap = State.getDiscoveredConcepts();
            for (const fId of focused) {
                const c = dMap.get(fId)?.concept;
                if (c?.cardType === typeReq) { met = true; break; }
            }
            if (!met) {
                canAttempt = false; unmetReqs.push(`Focus Type: ${typeReq}`);
            }
        }
    }
    // Insight Cost Requirement
    const cost = exp.insightCost || Config.EXPERIMENT_BASE_COST;
    const canAfford = insight >= cost;
    if (!canAfford) {
        canAttempt = false; unmetReqs.push(`${cost} Insight`);
    }

    // Abort if requirements not met
    if (!canAttempt) {
        UI.showTemporaryMessage(`Requires: ${unmetReqs.join(', ')}`, 3500);
        return;
    }

    // Spend Insight and Attempt
    if (!spendInsight(cost, `Attempt Exp: ${exp.name}`)) return; // Abort if spending fails somehow
    console.log(`Logic: Attempting Experiment: ${exp.name}`);
    updateMilestoneProgress('attemptExperiment', 1);
    checkAndUpdateRituals('attemptExperiment');

    const roll = Math.random();
    if (roll < (exp.successRate || 0.5)) { // Success
        console.log("Logic: Experiment Success!");
        UI.showTemporaryMessage(`Success! '${exp.name}' yielded results.`, 4000);
        const addedRepo = State.addRepositoryItem('experiments', exp.id); // Mark as completed
        if (!addedRepo) console.warn(`Experiment ${exp.id} succeeded but failed to add to repository state.`);

        // Grant Rewards
        if (exp.successReward) {
            if (exp.successReward.type === 'insight') gainInsight(exp.successReward.amount, `Exp Success: ${exp.name}`);
            if (exp.successReward.type === 'attunement') gainAttunementForAction('experimentSuccess', exp.successReward.element || 'All', exp.successReward.amount);
            if (exp.successReward.type === 'insightFragment') {
                if (State.addRepositoryItem('insights', exp.successReward.id)) {
                    console.log(`Logic: Experiment reward: Insight Fragment ${exp.successReward.id}`);
                    updateMilestoneProgress('repositoryInsightsCount', State.getRepositoryItems().insights.size);
                }
            }
            // Add other reward types here if needed (e.g., discoverCard, unlockScene)
        }
    } else { // Failure
        console.log("Logic: Experiment Failed.");
        UI.showTemporaryMessage(`Experiment '${exp.name}' failed... ${exp.failureConsequence || "No effect."}`, 4000);
        // Apply Consequences
        if (exp.failureConsequence?.includes("Insight loss")) {
            const loss = parseFloat(exp.failureConsequence.match(/(\d+(\.\d+)?)/)?.[0] || 1);
            gainInsight(-loss, `Exp Failure: ${exp.name}`);
        } else if (exp.failureConsequence?.includes("attunement decrease")) {
            const key = exp.requiredElement;
            if (key) {
                if(State.updateAttunement(key, -1.0)) { // Decrease attunement
                     if (document.getElementById('personaScreen')?.classList.contains('current')) { UI.displayElementAttunement(); }
                }
            }
        }
        // Add other consequence types here
    }
    // Refresh Repository UI if visible
    if (document.getElementById('repositoryScreen')?.classList.contains('current')) {
        UI.displayRepositoryContent();
    }
}

export function handleSuggestSceneClick() {
    const focused = State.getFocusedConcepts();
    const suggestionOutputDiv = document.getElementById('sceneSuggestionOutput');
    const suggestedSceneContentDiv = document.getElementById('suggestedSceneContent');

    if (focused.size === 0) {
        UI.showTemporaryMessage("Focus on concepts first to suggest relevant scenes.", 3000);
        return;
    }
    const cost = Config.SCENE_SUGGESTION_COST;
    if (!spendInsight(cost, "Suggest Scene")) return;

    console.log("Logic: Suggesting scenes based on focus...");
    const { focusScores } = calculateFocusScores(); // Get average scores of focused concepts
    const discoveredScenes = State.getRepositoryItems().scenes;

    // Find top 2-3 dominant elements from focus scores
    const sortedElements = Object.entries(focusScores)
        .filter(([key, score]) => score > 4.0) // Consider elements with moderate or higher average score
        .sort(([, a], [, b]) => b - a); // Sort descending

    const topElements = sortedElements.slice(0, 3).map(([key]) => key); // Take top 3

    if (topElements.length === 0) {
        UI.showTemporaryMessage("Focus is too broad or subtle to suggest specific scenes.", 3000);
        gainInsight(cost, "Refund: Scene Suggestion Fail (Broad Focus)");
        return;
    }
    console.log("Logic: Dominant focus elements for scene suggestion:", topElements);

    // Find relevant, undiscovered scenes matching the dominant elements
    const relevantUndiscoveredScenes = sceneBlueprints.filter(scene =>
        topElements.includes(scene.element) && !discoveredScenes.has(scene.id)
    );

    if (relevantUndiscoveredScenes.length === 0) {
        UI.showTemporaryMessage("All relevant scenes for this focus have been discovered. Check Repository.", 3500);
         if (suggestionOutputDiv) suggestionOutputDiv.classList.add('hidden'); // Hide output if nothing new
    } else {
        // Select a random scene from the relevant pool
        const selectedScene = relevantUndiscoveredScenes[Math.floor(Math.random() * relevantUndiscoveredScenes.length)];
        const added = State.addRepositoryItem('scenes', selectedScene.id); // Add to repository

        if (added) {
            console.log(`Logic: Suggested Scene: ${selectedScene.name} (ID: ${selectedScene.id})`);
            // Display the suggested scene in the Persona screen output area
            if (suggestionOutputDiv && suggestedSceneContentDiv) {
                const sceneCost = selectedScene.meditationCost || Config.SCENE_MEDITATION_BASE_COST;
                const canAfford = State.getInsight() >= sceneCost;
                const sceneElement = UI.renderRepositoryItem(selectedScene, 'scene', sceneCost, canAfford); // Use repo renderer
                suggestedSceneContentDiv.innerHTML = ''; // Clear previous suggestion
                suggestedSceneContentDiv.appendChild(sceneElement);
                suggestionOutputDiv.classList.remove('hidden');
                UI.showTemporaryMessage(`Scene Suggested: '${selectedScene.name}'! See details below.`, 4000);
                 // Refresh repo if visible
                 if (document.getElementById('repositoryScreen')?.classList.contains('current')) { UI.displayRepositoryContent(); }
            } else { console.error("Scene suggestion UI elements not found!"); }
        } else {
            console.error(`Failed to add scene ${selectedScene.id} to repository state.`);
            gainInsight(cost, "Refund: Scene Suggestion Error (State Add Fail)");
            UI.showTemporaryMessage("Error suggesting scene.", 3000);
        }
    }
}


// --- Category & Lore Logic ---
export function handleCategorizeCard(conceptId, categoryId) {
    const currentCategory = State.getCardCategory(conceptId);
    if (currentCategory === categoryId) return; // No change needed

    if (State.setCardCategory(conceptId, categoryId)) {
        console.log(`Logic: Categorized card ${conceptId} as ${categoryId}`);
        // Refresh Grimoire UI to reflect change (color border, filtering)
        const activeShelf = document.querySelector('#grimoire-shelves-workshop .grimoire-shelf.active-shelf');
        const currentFilterCategory = activeShelf ? activeShelf.dataset.categoryId : 'All';
        UI.refreshGrimoireDisplay({ filterCategory: currentFilterCategory }); // Refresh with current shelf filter

        checkCategoryUnlocks(categoryId); // Check if this categorization unlocks anything
        checkAndUpdateRituals('categorizeCard', { categoryId: categoryId, conceptId: conceptId }); // Track ritual
         checkOnboarding('categorizeCard', 5); // Check onboarding
    } else {
        console.error(`Failed to set category for card ${conceptId}`);
    }
}

function checkCategoryUnlocks(categoryId) {
    if (!categoryDrivenUnlocks || categoryDrivenUnlocks.length === 0) return;
    console.log(`Logic: Checking category unlocks for category: ${categoryId}`);

    const discoveredMap = State.getDiscoveredConcepts();
    const cardsInCategory = Array.from(discoveredMap.entries())
        .filter(([id, data]) => (data.userCategory || 'uncategorized') === categoryId)
        .map(([id]) => id); // Get array of IDs in the target category
    const cardIdSetInCategory = new Set(cardsInCategory);

    categoryDrivenUnlocks.forEach(unlock => {
        // Check if unlock targets the category that was just modified
        if (unlock.categoryRequired === categoryId ) {
            let requirementsMet = true;
            // Check if all required concepts are in the SAME category now
            if (!unlock.requiredInSameCategory || unlock.requiredInSameCategory.length === 0) {
                requirementsMet = false; // Need specific concepts required
            } else {
                for (const reqId of unlock.requiredInSameCategory) {
                    if (!cardIdSetInCategory.has(reqId)) {
                        requirementsMet = false; // A required concept is missing from this category
                        break;
                    }
                }
            }

            if (requirementsMet) {
                console.log(`Logic: Category unlock triggered: ${unlock.id}`);
                const reward = unlock.unlocks;
                let alreadyDone = false;

                // Check if lore reward is already unlocked
                if (reward.type === 'lore') {
                    const currentLoreLevel = State.getUnlockedLoreLevel(reward.targetConceptId);
                    if (reward.loreLevelToUnlock <= currentLoreLevel) {
                        alreadyDone = true;
                        console.log(`   - Lore level ${reward.loreLevelToUnlock} for ${reward.targetConceptId} already unlocked.`);
                    }
                } // Add checks for other reward types if needed (e.g., already have scene/experiment)

                if (!alreadyDone) {
                    if (reward.type === 'lore') {
                        if (unlockLoreInternal(reward.targetConceptId, reward.loreLevelToUnlock, `Category Unlock: ${unlock.description || unlock.id}`)) {
                            UI.showTemporaryMessage(unlock.description || `New Lore Unlocked!`, 4000);
                        }
                    } else if (reward.type === 'insight') {
                        gainInsight(reward.amount, `Category Unlock: ${unlock.description || unlock.id}`);
                        UI.showTemporaryMessage(unlock.description || `Gained ${reward.amount} Insight!`, 3500);
                    }
                     // Add other reward types (e.g., Add Repository Item)
                }
            }
        }
    });
}

export function handleUnlockLore(conceptId, level, cost) {
    console.log(`Logic: Attempting to unlock lore level ${level} for concept ${conceptId} (Cost: ${cost})`);
    const concept = State.getDiscoveredConceptData(conceptId)?.concept;
    if (!concept) { console.error("Cannot unlock lore: Concept data not found."); return; }

    if (State.getUnlockedLoreLevel(conceptId) >= level) {
        UI.showTemporaryMessage("Lore already unlocked.", 2000);
        return;
    }

    if (spendInsight(cost, `Unlock Lore: ${concept.name} Lvl ${level}`)) {
        if(unlockLoreInternal(conceptId, level, `Insight Purchase`)) {
             checkOnboarding('unlockLore', 6); // Check onboarding after unlocking lore
        }
    }
}

// Internal function for unlocking lore, returns true on success
function unlockLoreInternal(conceptId, level, source = "Unknown") {
    if (State.unlockLoreLevel(conceptId, level)) { // Update state first
        const conceptName = State.getDiscoveredConceptData(conceptId)?.concept?.name || `ID ${conceptId}`;
        console.log(`Logic: Successfully unlocked lore level ${level} for ${conceptName} via ${source}`);

        // Update UI immediately if the popup is open for this concept
        if (getCurrentPopupConceptId() === conceptId && conceptDetailPopup && !conceptDetailPopup.classList.contains('hidden')) {
             // Request animation frame ensures DOM is ready after potential state update/re-render
             requestAnimationFrame(() => {
                 const loreContentContainer = getElement('popupLoreContent');
                 if (!loreContentContainer) {
                     console.error("rAF Error: Could not find #popupLoreContent container! Re-rendering popup.");
                     UI.showConceptDetailPopup(conceptId); // Fallback: redraw whole popup
                     return;
                 }
                 // Find the specific lore entry div to update
                 let loreEntryDiv = null;
                 for (const child of loreContentContainer.children) {
                     if (child.classList.contains('lore-entry') && child.dataset.loreLevel === String(level)) {
                         loreEntryDiv = child;
                         break;
                     }
                 }

                 if (loreEntryDiv) {
                     // Find the lore text from data.js
                     const conceptData = concepts.find(c => c.id === conceptId);
                     const loreData = conceptData?.lore?.find(l => l.level === level);
                     if (loreData) {
                         // Update the content of the existing div
                         loreEntryDiv.innerHTML = `
                             <h5 class="lore-level-title">Level ${loreData.level} Insight:</h5>
                             <p class="lore-text">${loreData.text}</p>`;
                         console.log(`UI Update (rAF): Updated lore content for level ${level} in popup.`);
                     } else {
                         console.error(`rAF Error: Could not find lore data for level ${level} to update DOM.`);
                         UI.showConceptDetailPopup(conceptId); // Fallback redraw
                     }
                 } else {
                     console.error(`rAF Error: DOM search failed for lore entry level ${level}. Re-rendering popup.`);
                     UI.showConceptDetailPopup(conceptId); // Fallback redraw
                 }
             });
        } else {
            // If popup not open, just refresh the grimoire to potentially show the lore indicator change (if logic added there)
             UI.refreshGrimoireDisplay();
        }

        updateMilestoneProgress('unlockLore', level); // Track milestone
        return true;
    } else {
        console.error(`Logic Error: Failed to update lore level in state for ${conceptId}`);
        // Should not happen if checks pass, but good to handle
        return false;
    }
}


// --- Synergy/Tension & Tapestry Calculation Logic ---
export function checkSynergyTensionStatus() {
    calculateTapestryNarrative(true); // Ensure analysis is fresh
    let status = 'none';
    if (currentTapestryAnalysis) {
        const hasSynergy = currentTapestryAnalysis.synergies.length > 0;
        const hasTension = currentTapestryAnalysis.tensions.length > 0;
        if (hasSynergy && hasTension) status = 'both';
        else if (hasSynergy) status = 'synergy';
        else if (hasTension) status = 'tension';
    }
    UI.updateExploreSynergyButtonStatus(status); // Update button UI
    return status;
}

export function handleExploreSynergyClick() {
    if (!currentTapestryAnalysis) {
        console.warn("Synergy/Tension analysis not available.");
        UI.showTemporaryMessage("Focus concepts to analyze synergy.", 3000);
        return;
    }
    // Re-use the Deep Dive modal to display the synergy/tension info
    UI.displaySynergyTensionInfo(currentTapestryAnalysis);
}

// --- Persona Calculation Logic Helpers (Includes RF) ---
export function calculateFocusScores() {
    // Initialize scores for all 7 elements
    const scores = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0, RF: 0 };
    const focused = State.getFocusedConcepts();
    const disc = State.getDiscoveredConcepts();
    const count = focused.size;

    if (count > 0) {
        focused.forEach(id => {
            const data = disc.get(id);
            if (data?.concept?.elementScores) {
                // Add scores for all defined elements in the concept
                for (const key in scores) {
                    if (data.concept.elementScores.hasOwnProperty(key)) {
                        scores[key] += data.concept.elementScores[key];
                    } else {
                         // Concept is missing a score for this dimension - treat as neutral (5)? Or log warning?
                         // console.warn(`Concept ${data.concept.name} missing score for ${key}. Assuming 5.`);
                         scores[key] += 5; // Assume neutral if missing for averaging
                    }
                }
            }
        });
        // Average the scores
        for (const key in scores) {
            scores[key] /= count;
        }
    } else {
        // If no focus, return default neutral scores
        Object.keys(scores).forEach(key => scores[key] = 5.0);
    }
    return { focusScores: scores, focusCount: count };
}

export function calculateTapestryNarrative(forceRecalculate = false) {
    const stateHash = State.getState().currentFocusSetHash;
    const currentCalculatedHash = _calculateFocusSetHash(); // Use internal helper

    // Return cached analysis if hash matches and not forced
    if (currentTapestryAnalysis && !forceRecalculate && currentCalculatedHash === stateHash) {
        return currentTapestryAnalysis.fullNarrativeHTML;
    }

    console.log("Logic: Recalculating tapestry narrative (7 Elements)...");
    const focused = State.getFocusedConcepts();
    const focusCount = focused.size;

    if (focusCount === 0) {
        currentTapestryAnalysis = { synergies: [], tensions: [], dominantElements: [], dominantCardTypes: [], elementThemes: [], cardTypeThemes: [], essenceTitle: "Empty Canvas", balanceComment: "", fullNarrativeRaw: "", fullNarrativeHTML: 'Mark concepts as "Focus" from the Workshop to weave your narrative.' };
        State.getState().currentFocusSetHash = ''; // Update hash in state
        return currentTapestryAnalysis.fullNarrativeHTML;
    }

    const disc = State.getDiscoveredConcepts();
    const { focusScores } = calculateFocusScores(); // Includes RF now

    const analysis = {
        dominantElements: [], elementThemes: [], dominantCardTypes: [], cardTypeThemes: [],
        synergies: [], tensions: [], essenceTitle: "Balanced", balanceComment: "",
        fullNarrativeRaw: "", fullNarrativeHTML: ""
    };

    // 1. Analyze Dominant Elements (Including RF)
    const sortedElements = Object.entries(focusScores)
        .filter(([key, score]) => score > 3.5) // Filter elements with at least moderate score
        .sort(([, a], [, b]) => b - a); // Sort descending score

    if (sortedElements.length > 0) {
        analysis.dominantElements = sortedElements.map(([key, score]) => ({
            key: key,
            name: Utils.getElementShortName(elementKeyToFullName[key]), // Use short name
            score: score
        }));

        // Generate Element Themes text based on top 1-3 elements
        const topElementKeys = analysis.dominantElements.slice(0, 3).map(e => e.key).sort().join('');
        const themeKey = topElementKeys.length > 1 ? topElementKeys : (topElementKeys.length === 1 ? analysis.dominantElements[0].key : null);

        if (themeKey && elementInteractionThemes && elementInteractionThemes[themeKey]) {
            analysis.elementThemes.push(elementInteractionThemes[themeKey]);
        } else if (analysis.dominantElements.length > 0) {
            // Default theme based on single most dominant element
            analysis.elementThemes.push(`a strong emphasis on **${analysis.dominantElements[0].name}**.`);
        }

        // Determine Essence Title based on dominant elements
        if (analysis.dominantElements.length >= 2 && analysis.dominantElements[0].score > 6.5 && analysis.dominantElements[1].score > 5.5) {
            analysis.essenceTitle = `${analysis.dominantElements[0].name}/${analysis.dominantElements[1].name} Blend`;
        } else if (analysis.dominantElements.length >= 1 && analysis.dominantElements[0].score > 6.5) {
            analysis.essenceTitle = `${analysis.dominantElements[0].name} Focus`;
        } else {
            analysis.essenceTitle = "Developing";
        }
    } else {
        analysis.essenceTitle = "Subtle"; // No elements strongly dominant
    }

    // 2. Analyze Dominant Card Types
    const typeCounts = {}; cardTypeKeys.forEach(type => typeCounts[type] = 0);
    focused.forEach(id => {
        const type = disc.get(id)?.concept?.cardType;
        if (type && typeCounts.hasOwnProperty(type)) { typeCounts[type]++; }
    });
    analysis.dominantCardTypes = Object.entries(typeCounts)
        .filter(([type, count]) => count > 0)
        .sort(([, a], [, b]) => b - a)
        .map(([type, count]) => ({ type, count }));

    if (analysis.dominantCardTypes.length > 0) {
        const topType = analysis.dominantCardTypes[0].type;
        if (cardTypeThemes && cardTypeThemes[topType]) {
            analysis.cardTypeThemes.push(cardTypeThemes[topType]);
        }
    }

    // 3. Identify Synergies (Based on relatedIds)
    const checkedPairs = new Set();
    focused.forEach(idA => {
        const conceptA = disc.get(idA)?.concept;
        if (!conceptA?.relatedIds) return;
        focused.forEach(idB => {
            if (idA === idB) return;
            const pairKey = [idA, idB].sort().join('-'); // Ensure consistent pair key
            if (checkedPairs.has(pairKey)) return;
            if (conceptA.relatedIds.includes(idB)) {
                const conceptB = disc.get(idB)?.concept;
                if (conceptB) {
                    analysis.synergies.push({
                        concepts: [conceptA.name, conceptB.name],
                        text: `The connection between **${conceptA.name}** and **${conceptB.name}** suggests a reinforcing dynamic.`
                    });
                }
            }
            checkedPairs.add(pairKey);
        });
    });

    // 4. Identify Tensions (High/Low scores within the same element across focused concepts)
    const highThreshold = 7.0; const lowThreshold = 3.0;
    const focusConceptsData = Array.from(focused).map(id => disc.get(id)?.concept).filter(Boolean);
    if (focusConceptsData.length >= 2) {
         // Iterate through ALL element keys, including RF
        for (const key of Object.keys(elementKeyToFullName)) {
            const elementName = Utils.getElementShortName(elementKeyToFullName[key]); // Use short name
            let hasHigh = focusConceptsData.some(c => c.elementScores?.[key] >= highThreshold);
            let hasLow = focusConceptsData.some(c => c.elementScores?.[key] <= lowThreshold);
            if (hasHigh && hasLow) {
                const highConcepts = focusConceptsData.filter(c => c.elementScores?.[key] >= highThreshold).map(c => c.name);
                const lowConcepts = focusConceptsData.filter(c => c.elementScores?.[key] <= lowThreshold).map(c => c.name);
                analysis.tensions.push({
                    element: elementName,
                    text: `A potential tension exists within **${elementName}**: concepts like **${highConcepts.join(', ')}** lean high, while **${lowConcepts.join(', ')}** lean low.`
                });
            }
        }
    }

    // 5. Analyze Balance
    const scores = Object.values(focusScores);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const range = maxScore - minScore;
    if (range <= 2.5 && focusCount > 2) analysis.balanceComment = "The focused elements present a relatively balanced profile.";
    else if (range >= 5.0 && focusCount > 2) analysis.balanceComment = "There's a notable range in elemental emphasis within your focus.";

    // 6. Construct Narrative
    let narrative = `Current Essence: **${analysis.essenceTitle}**. `;
    if (analysis.dominantElements.length > 0) {
        narrative += `Your tapestry currently resonates with ${analysis.elementThemes.join(' ')} `;
    } else {
        narrative += "Your focus presents a unique and subtle balance across the elements. ";
    }
    if (analysis.dominantCardTypes.length > 0) {
        narrative += `The lean towards ${analysis.cardTypeThemes.join(' ')} shapes the expression. `;
    }
    if (analysis.balanceComment) narrative += analysis.balanceComment + " ";
    if (analysis.synergies.length > 0) { narrative += ` **Synergies** are reinforcing certain themes. `; }
    if (analysis.tensions.length > 0) { narrative += ` Potential **Tensions** offer areas for deeper exploration. `; }

    analysis.fullNarrativeRaw = narrative.trim();
    analysis.fullNarrativeHTML = analysis.fullNarrativeRaw.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Cache the result and update state hash
    currentTapestryAnalysis = analysis;
    State.getState().currentFocusSetHash = currentCalculatedHash; // Update hash in state

    console.log("Logic: Recalculated Tapestry Analysis (7 Elements) and updated state hash.");
    return analysis.fullNarrativeHTML;
}

export function calculateFocusThemes() { // Includes RF
    const focused = State.getFocusedConcepts();
    const disc = State.getDiscoveredConcepts();
    if (focused.size === 0) return [];

    const counts = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0, RF: 0 };
    const threshold = 7.0; // Concept needs high score in element to contribute to theme

    focused.forEach(id => {
        const concept = disc.get(id)?.concept;
        if (concept?.elementScores) {
            for (const key in concept.elementScores) {
                // Check if key is one of the 7 valid element keys
                if (counts.hasOwnProperty(key) && concept.elementScores[key] >= threshold) {
                    counts[key]++;
                }
            }
        }
    });

    // Filter, Sort, and Format
    const sorted = Object.entries(counts)
        .filter(([key, count]) => count > 0 && elementKeyToFullName[key]) // Ensure key is valid and count > 0
        .sort(([, a], [, b]) => b - a) // Sort descending by count
        .map(([key, count]) => ({
            key: key,
            name: Utils.getElementShortName(elementKeyToFullName[key]), // Use short name
            count: count
        }));

    return sorted;
}


// --- Focus Unlocks ---
export function checkForFocusUnlocks(silent = false) {
     console.log("Logic: Checking focus unlocks...");
     let newlyUnlocked = false;
     const focused = State.getFocusedConcepts();
     const unlocked = State.getUnlockedFocusItems();
     const scores = State.getScores(); // Needed for RF score checks

     focusDrivenUnlocks.forEach(unlock => {
         if (unlocked.has(unlock.id)) return; // Skip already unlocked

         let met = true;
         // Check required concept IDs
         if (!unlock.requiredFocusIds || unlock.requiredFocusIds.length === 0) {
             met = false; // Must require at least one concept ID
         } else {
             for (const reqId of unlock.requiredFocusIds) {
                 if (!focused.has(reqId)) {
                     met = false; break; // Requirement not met
                 }
             }
         }
         // Check RF score requirement if concept IDs met
         if (met && unlock.requiredRoleFocusScore !== undefined && (scores.RF || 0) < unlock.requiredRoleFocusScore) {
             met = false;
         }
         if (met && unlock.requiredRoleFocusScoreBelow !== undefined && (scores.RF || 0) >= unlock.requiredRoleFocusScoreBelow) {
             met = false;
         }

         // If all requirements met, process the unlock
         if (met) {
             console.log(`Logic: Met requirements for focus unlock: ${unlock.id}`);
             if (State.addUnlockedFocusItem(unlock.id)) { // Add to state
                 newlyUnlocked = true;
                 const item = unlock.unlocks;
                 let name = item.name || `ID ${item.id}`;
                 let notif = unlock.description || `Unlocked ${name}`;

                 // Add unlocked item to repository if applicable
                 if (item.type === 'scene') {
                     if (State.addRepositoryItem('scenes', item.id)) {
                         console.log(`Logic: Unlocked Scene: ${name}`);
                         notif += ` View in Repo.`;
                     } else notif += ` (Already Discovered)`;
                 } else if (item.type === 'experiment') {
                     // Experiments aren't added to repo directly, user finds them when attunement is high enough
                     console.log(`Logic: Unlocked potential Experiment: ${name}. Check Repo later.`);
                     notif += ` Check Repo for availability based on Attunement.`;
                 } else if (item.type === 'insightFragment') {
                     if (State.addRepositoryItem('insights', item.id)) {
                         const iData = elementalInsights.find(i => i.id === item.id);
                         name = iData ? `"${iData.text}"` : `ID ${item.id}`;
                         console.log(`Logic: Unlocked Insight Fragment: ${item.id}`);
                         notif += ` View in Repo.`;
                         updateMilestoneProgress('repositoryInsightsCount', State.getRepositoryItems().insights.size);
                     } else notif += ` (Already Discovered)`;
                 }
                 // Add other unlock types here (e.g., Insight reward, Attunement)

                 if (!silent) UI.showTemporaryMessage(`Focus Synergy: ${notif}`, 5000);
             }
         }
     });

     // Refresh UI if something new was unlocked and relevant screens are visible
     if (newlyUnlocked && !silent) {
         console.log("Logic: New Focus Unlocks:", Array.from(State.getUnlockedFocusItems()));
         if (document.getElementById('repositoryScreen')?.classList.contains('current')) UI.displayRepositoryContent();
         if (document.getElementById('personaScreen')?.classList.contains('current')) UI.generateTapestryNarrative(); // Re-gen narrative in case unlocks affect it
     }
}

// --- Tapestry Deep Dive Logic ---
export function showTapestryDeepDive() {
    if (State.getFocusedConcepts().size === 0) {
        UI.showTemporaryMessage("Focus on concepts first to explore the tapestry.", 3000);
        return;
    }
    // Ensure the analysis is up-to-date before showing
    calculateTapestryNarrative(true); // Force recalculation if needed
    if (!currentTapestryAnalysis) {
        console.error("Failed to generate tapestry analysis for Deep Dive.");
        UI.showTemporaryMessage("Error analyzing Tapestry.", 3000);
        return;
    }
    UI.displayTapestryDeepDive(currentTapestryAnalysis);
}

export function handleDeepDiveNodeClick(nodeId) {
    if (!currentTapestryAnalysis) {
        console.error("Deep Dive Node Click: Analysis missing.");
        UI.updateDeepDiveContent("<p>Error: Analysis data unavailable.</p>", nodeId);
        return;
    }
    console.log(`Logic: Handling Deep Dive node click: ${nodeId}`);
    let content = `<p><em>Analysis for '${nodeId}'...</em></p>`;
    try {
        switch (nodeId) {
            case 'elemental': // Includes RF
                content = `<h4>Elemental Resonance Breakdown</h4>`;
                if(currentTapestryAnalysis.elementThemes.length > 0) {
                     content += `<ul>${currentTapestryAnalysis.elementThemes.map(t => `<li>${t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}</ul>`;
                } else { content += `<p>No specific elemental themes detected.</p>`; }
                content += `<p><small>Dominant Elements: ${currentTapestryAnalysis.dominantElements.length > 0 ? currentTapestryAnalysis.dominantElements.map(e => `${e.name} (${e.score.toFixed(1)})`).join(', ') : 'None strongly dominant'}</small></p>`;
                if(currentTapestryAnalysis.balanceComment) content += `<p><small>Balance: ${currentTapestryAnalysis.balanceComment}</small></p>`;
                break;
            case 'archetype':
                content = `<h4>Concept Archetype Analysis</h4>`;
                if (currentTapestryAnalysis.cardTypeThemes.length > 0) {
                    content += `<ul>${currentTapestryAnalysis.cardTypeThemes.map(t => `<li>${t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}</ul>`;
                } else { content += `<p>No specific archetype themes detected.</p>`; }
                content += `<p><small>Focus Distribution: ${currentTapestryAnalysis.dominantCardTypes.length > 0 ? currentTapestryAnalysis.dominantCardTypes.map(ct => `${ct.type} (${ct.count})`).join(', ') : 'None'}</small></p>`;
                break;
            case 'synergy': // Renamed from synergy/tension, now focuses on both
                content = `<h4>Synergies & Tensions</h4>`;
                if (currentTapestryAnalysis.synergies.length > 0) {
                    content += `<h5>Synergies Found:</h5><ul>${currentTapestryAnalysis.synergies.map(s => `<li>${s.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}</ul><hr class="popup-hr">`;
                } else { content += `<p><em>No direct synergies detected between focused concepts.</em></p><hr class="popup-hr">`; }
                if (currentTapestryAnalysis.tensions.length > 0) {
                    content += `<h5>Tensions Noted:</h5><ul>${currentTapestryAnalysis.tensions.map(t => `<li>${t.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}</ul>`;
                } else { content += `<p><em>No significant elemental tensions detected within the focus.</em></p>`; }
                break;
            // 'contemplation' case handled by handleContemplationNodeClick
            default:
                content = `<p><em>Analysis node '${nodeId}' not recognized.</em></p>`;
        }
    } catch (error) {
        console.error(`Error generating content for node ${nodeId}:`, error);
        content = `<p>Error generating analysis for ${nodeId}.</p>`;
    }
    UI.updateDeepDiveContent(content, nodeId);
}

export function handleContemplationNodeClick() {
    const cooldownEnd = State.getContemplationCooldownEnd();
    if (cooldownEnd && Date.now() < cooldownEnd) {
        UI.showTemporaryMessage("Contemplation still cooling down.", 2500);
        UI.updateContemplationButtonState();
        return;
    }
    if (spendInsight(Config.CONTEMPLATION_COST, "Focused Contemplation")) {
        const contemplation = generateFocusedContemplation(); // Generate task based on current analysis
        if (contemplation) {
            UI.displayContemplationTask(contemplation);
            State.setContemplationCooldown(Date.now() + Config.CONTEMPLATION_COOLDOWN);
            UI.updateContemplationButtonState();
            checkAndUpdateRituals('contemplateFocus'); // Track ritual
        } else {
            UI.updateDeepDiveContent("<p><em>Could not generate contemplation task. Focus might be too narrow or broad.</em></p>", 'contemplation');
            gainInsight(Config.CONTEMPLATION_COST, "Refund: Contemplation Fail"); // Refund if task fails
            UI.updateContemplationButtonState();
        }
    } else {
        UI.updateContemplationButtonState(); // Update button state if couldn't afford
    }
}

function generateFocusedContemplation() {
    if (!currentTapestryAnalysis) { console.error("Cannot generate contemplation: Tapestry analysis missing."); return null; }

    const focused = State.getFocusedConcepts();
    const disc = State.getDiscoveredConcepts();
    const focusedConceptsArray = Array.from(focused).map(id => disc.get(id)?.concept).filter(Boolean);

    let task = { type: "Default", text: "Reflect on the overall energy of your current focus.", reward: { type: 'insight', amount: 2 }, requiresCompletionButton: true };
    const taskOptions = [];

    // Tension Reflection Task
    if (currentTapestryAnalysis.tensions.length > 0) {
        const tension = currentTapestryAnalysis.tensions[Math.floor(Math.random() * currentTapestryAnalysis.tensions.length)];
        taskOptions.push({
            type: 'Tension Reflection',
            text: `Your Tapestry highlights a tension within **${tension.element}**. Reflect on how you experience this contrast internally or in interactions. Consider adding a note to a relevant Concept.`,
            reward: { type: 'insight', amount: 4 }, requiresCompletionButton: true
        });
    }
    // Synergy Note Task
    if (currentTapestryAnalysis.synergies.length > 0) {
        const syn = currentTapestryAnalysis.synergies[Math.floor(Math.random() * currentTapestryAnalysis.synergies.length)];
        const [nameA, nameB] = syn.concepts;
        taskOptions.push({
            type: 'Synergy Note',
            text: `Focus links <strong>${nameA}</strong> and <strong>${nameB}</strong>. In the 'My Notes' for <strong>${nameA}</strong>, write one sentence about how <strong>${nameB}</strong> might amplify or alter its expression. (Reward granted automatically).`,
            reward: { type: 'insight', amount: 3 }, requiresCompletionButton: false // Auto-reward
        });
    }
    // Dominant Element Ritual Task
    if (currentTapestryAnalysis.dominantElements.length > 0 && currentTapestryAnalysis.dominantElements[0].score > 7.0) {
        const el = currentTapestryAnalysis.dominantElements[0];
        let action = "observe an interaction involving this element's themes";
        // Customize action based on element
        if (el.key === 'S') action = "mindfully experience one physical sensation related to this element";
        else if (el.key === 'P') action = "acknowledge one emotion linked to this element without judgment";
        else if (el.key === 'C') action = "analyze one assumption related to this element";
        else if (el.key === 'R') action = "consider one relationship boundary influenced by this element";
        else if (el.key === 'A') action = "notice one thing that subtly attracts or repels you, related to this element";
        else if (el.key === 'RF') action = "consider how a specific role (Dom/sub/Switch) feels or manifests for you today";
        taskOptions.push({
            type: 'Dominant Element Ritual', text: `Your focus strongly resonates with **${el.name}**. Today's mini-ritual: ${action}.`,
            attunementReward: { element: el.key, amount: 0.5 }, reward: { type: 'insight', amount: 2 }, requiresCompletionButton: true
        });
    }
    // Tapestry Resonance Meditation Task
    if (focusedConceptsArray.length > 0) {
        const conceptNames = focusedConceptsArray.map(c => `<strong>${c.name}</strong>`);
        taskOptions.push({
            type: 'Tapestry Resonance', text: `Meditate briefly on the combined energy of your focused concepts: ${conceptNames.join(', ')}. What overall feeling or image emerges?`,
            attunementReward: { element: 'All', amount: 0.2 }, reward: { type: 'insight', amount: 3 }, requiresCompletionButton: true
        });
    }

    // Select a task, prioritizing more specific ones
    let selectedTaskOption = null;
    const tensionTask = taskOptions.find(t => t.type === 'Tension Reflection');
    const synergyTask = taskOptions.find(t => t.type === 'Synergy Note');
    const dominantTask = taskOptions.find(t => t.type === 'Dominant Element Ritual');

    if (tensionTask && Math.random() < 0.4) { selectedTaskOption = tensionTask; }
    else if (synergyTask && Math.random() < 0.4) { selectedTaskOption = synergyTask; }
    else if (dominantTask && Math.random() < 0.3) { selectedTaskOption = dominantTask; }
    else if (taskOptions.length > 0) { selectedTaskOption = taskOptions[Math.floor(Math.random() * taskOptions.length)]; } // Pick randomly from remaining

    if (selectedTaskOption) {
        task = selectedTaskOption;
        // Apply immediate rewards if needed
        if (task.reward?.type === 'insight' && !task.requiresCompletionButton) {
            gainInsight(task.reward.amount, 'Contemplation Task (Immediate)');
            task.reward = { type: 'none' }; // Prevent double reward
        }
        if (task.attunementReward) {
            gainAttunementForAction('contemplation', task.attunementReward.element, task.attunementReward.amount);
            delete task.attunementReward; // Remove after granting
        }
    } else {
        console.log("Logic: Using default contemplation task.");
    }

    console.log(`Logic: Generated contemplation task of type: ${task.type}`);
    return task;
}

export function handleCompleteContemplation(task) {
    if (!task || !task.reward || !task.requiresCompletionButton) return;
    console.log(`Logic: Contemplation task completed: ${task.type}`);
    if (task.reward.type === 'insight' && task.reward.amount > 0) {
        gainInsight(task.reward.amount, `Contemplation Task: ${task.type}`);
    }
    // Grant attunement if specified (though usually done on generation now)
    // if (task.attunementReward) {
    //    gainAttunementForAction('contemplationComplete', task.attunementReward.element, task.attunementReward.amount);
    // }
    UI.showTemporaryMessage("Contemplation complete!", 2500);
    UI.clearContemplationTask(); // Update UI
}

// --- Elemental Dilemma Logic ---
export function handleElementalDilemmaClick() {
    const availableDilemmas = elementalDilemmas; // Assuming dilemmas are loaded from data.js
    if (!availableDilemmas || availableDilemmas.length === 0) {
        UI.showTemporaryMessage("No dilemmas available at this time.", 3000);
        return;
    }
    // Select a random dilemma
    currentDilemma = availableDilemmas[Math.floor(Math.random() * availableDilemmas.length)];
    UI.displayElementalDilemma(currentDilemma); // Display in UI
}

export function handleConfirmDilemma() {
    const modal = document.getElementById('dilemmaModal');
    const slider = document.getElementById('dilemmaSlider');
    const nudgeCheckbox = document.getElementById('dilemmaNudgeCheckbox');

    if (!modal || !slider || !nudgeCheckbox || !currentDilemma) {
        console.error("Cannot confirm dilemma, UI elements or dilemma data missing.");
        UI.hidePopups(); return;
    }

    const sliderValue = parseFloat(slider.value);
    const nudgeAllowed = nudgeCheckbox.checked;
    const keyMin = currentDilemma.elementKeyMin;
    const keyMax = currentDilemma.elementKeyMax;

    console.log(`Logic: Dilemma ${currentDilemma.id} confirmed. Value: ${sliderValue}, Nudge: ${nudgeAllowed}`);
    gainInsight(3, `Dilemma Choice: ${currentDilemma.id}`); // Grant base insight

    // Apply score nudge if allowed
    if (nudgeAllowed) {
        const scores = State.getScores();
        const newScores = { ...scores };
        let nudged = false;

        // Calculate nudge amounts based on slider position
        const maxNudgeEffect = Config.SCORE_NUDGE_AMOUNT * 1.5; // Slightly stronger nudge for dilemma
        const proportionMin = (10 - sliderValue) / 10; // 1.0 if slider is 0, 0.0 if slider is 10
        const proportionMax = sliderValue / 10;      // 0.0 if slider is 0, 1.0 if slider is 10

        // Nudge towards the chosen side, slightly away from the other
        const nudgeMin = proportionMin * maxNudgeEffect - (proportionMax * maxNudgeEffect * 0.3); // Less penalty
        const nudgeMax = proportionMax * maxNudgeEffect - (proportionMin * maxNudgeEffect * 0.3); // Less penalty

        if (keyMin && newScores[keyMin] !== undefined) {
            const originalMin = newScores[keyMin];
            newScores[keyMin] = Math.max(0, Math.min(10, newScores[keyMin] + nudgeMin));
            if (newScores[keyMin] !== originalMin) nudged = true;
        }
        if (keyMax && newScores[keyMax] !== undefined) {
            const originalMax = newScores[keyMax];
            newScores[keyMax] = Math.max(0, Math.min(10, newScores[keyMax] + nudgeMax));
            if (newScores[keyMax] !== originalMax) nudged = true;
        }

        if (nudged) {
            State.updateScores(newScores); // Update state
            console.log("Logic: Nudged Scores after Dilemma (7 Elements):", State.getScores());
            if(document.getElementById('personaScreen')?.classList.contains('current')) UI.displayPersonaScreen(); // Refresh UI
            UI.showTemporaryMessage("Dilemma choice influenced core understanding.", 3500);
            gainAttunementForAction('dilemmaNudge', 'All'); // Small attunement boost for nudge
            updateMilestoneProgress('scoreNudgeApplied', 1); // Count dilemma nudge same as reflection nudge
        } else {
            console.log("Logic: Dilemma nudge resulted in no score change.");
        }
    }

    UI.hidePopups(); // Close dilemma modal
    currentDilemma = null; // Clear current dilemma
}

// --- Daily Login & Ritual/Milestone Logic ---
export function checkForDailyLogin() {
    const today = new Date().toDateString();
    const lastLogin = State.getState().lastLoginDate;

    if (lastLogin !== today) {
        console.log("Logic: First login today. Resetting rituals and granting bonus.");
        State.resetDailyRituals(); // Reset daily rituals and set free research available
        gainInsight(5.0, "Daily Bonus");
        UI.showTemporaryMessage("Daily Rituals Reset. Free Research Available!", 3500);
        // Refresh UI if relevant screens are active
        if(document.getElementById('workshopScreen')?.classList.contains('current')) { UI.displayWorkshopScreenContent(); }
        if(document.getElementById('repositoryScreen')?.classList.contains('current')) { UI.displayRepositoryContent(); }
    } else {
        console.log("Logic: Already logged in today.");
        // Still update workshop buttons in case free research was used since load
         if(document.getElementById('workshopScreen')?.classList.contains('current')) { UI.displayWorkshopScreenContent(); }
    }
}

export function checkAndUpdateRituals(action, details = {}) {
    let ritualCompletedThisCheck = false;
    const currentState = State.getState();
    const completedToday = currentState.completedRituals.daily || {};
    const focused = currentState.focusedConcepts;
    const scores = currentState.userScores; // Needed for RF checks

    // Build the pool of potentially active rituals (base daily + relevant focus rituals)
    let currentRitualPool = [...dailyRituals];
    if (focusRituals) {
        focusRituals.forEach(ritual => {
            // Check focus concept requirements
            let focusMet = true;
            if (ritual.requiredFocusIds && Array.isArray(ritual.requiredFocusIds)) {
                for (const id of ritual.requiredFocusIds) {
                    if (!focused.has(id)) { focusMet = false; break; }
                }
            }
             // Check RF score requirements if focus is met
            if (focusMet && ritual.requiredRoleFocusScore !== undefined && (scores.RF || 0) < ritual.requiredRoleFocusScore) {
                focusMet = false;
            }
             if (focusMet && ritual.requiredRoleFocusScoreBelow !== undefined && (scores.RF || 0) >= ritual.requiredRoleFocusScoreBelow) {
                focusMet = false;
            }

            if (focusMet) {
                // Add focus ritual to the pool if requirements met
                currentRitualPool.push({ ...ritual, isFocusRitual: true, period: 'daily' }); // Assume focus rituals are daily for now
            }
        });
    }

    // Iterate through the active pool and check for completion
    currentRitualPool.forEach(ritual => {
        const completedData = completedToday[ritual.id] || { completed: false, progress: 0 };
        if (completedData.completed) return; // Skip already completed rituals

        const track = ritual.track;
        let triggerMet = false;

        // Check if the current action matches the ritual's trigger
        if (track.action === action) {
            triggerMet = true;
            // Check additional conditions if specified
            if (track.contextMatch && details.contextMatch !== track.contextMatch) triggerMet = false;
            if (track.categoryId && details.categoryId !== track.categoryId) triggerMet = false;
            if (track.rarity && details.rarity !== track.rarity) triggerMet = false;
            if (track.conceptType && details.conceptId) { // Check concept type if needed
                const conceptData = State.getDiscoveredConceptData(details.conceptId)?.concept;
                if (!conceptData || conceptData.cardType !== track.conceptType) triggerMet = false;
            }
            // Add more specific detail checks here if needed (e.g., specific element)
        }

        if (triggerMet) {
            console.log(`Logic: Action '${action}' matched ritual '${ritual.id}'. Progressing.`);
            const progress = State.completeRitualProgress(ritual.id, 'daily'); // Increment progress in state
            const requiredCount = track.count || 1;

            if (progress >= requiredCount) {
                console.log(`Logic: Ritual Completed: ${ritual.description}`);
                State.markRitualComplete(ritual.id, 'daily'); // Mark as complete in state
                ritualCompletedThisCheck = true;

                // Grant reward
                if (ritual.reward) {
                    if (ritual.reward.type === 'insight') gainInsight(ritual.reward.amount || 0, `Ritual: ${ritual.description}`);
                    else if (ritual.reward.type === 'attunement') gainAttunementForAction('ritual', ritual.reward.element || 'All', ritual.reward.amount || 0);
                    else if (ritual.reward.type === 'token') console.log(`TODO: Grant ${ritual.reward.tokenType || 'Research'} token`);
                    // Add other reward types here
                }
            }
        }
    });

    // Update UI if a ritual was completed and the repo screen is visible
    if (ritualCompletedThisCheck && document.getElementById('repositoryScreen')?.classList.contains('current')) {
        UI.displayDailyRituals();
    }
}

export function updateMilestoneProgress(trackType, currentValue) {
     let milestoneAchievedThisUpdate = false;
     const achievedSet = State.getState().achievedMilestones;
     if (!(achievedSet instanceof Set)) { console.error("CRITICAL ERROR: gameState.achievedMilestones is not a Set!"); return; } // Safeguard

     milestones.forEach(m => {
         if (achievedSet.has(m.id)) return; // Skip already achieved

         let achieved = false;
         const track = m.track;
         const threshold = track.threshold;

         // --- Check based on Action ---
         if (track.action === trackType) {
             // Simple count check for actions
             if (typeof currentValue === 'number' && currentValue >= (track.count || 1)) achieved = true;
             // Simple trigger check if count not specified
             else if ((track.count === 1 || !track.count) && currentValue) achieved = true;
         }
         // --- Check based on State ---
         else if (track.state === trackType) {
             const state = State.getState();
             const scores = state.userScores;
             const att = state.elementAttunement;
             const lvls = state.unlockedDeepDiveLevels;
             const discSize = State.getDiscoveredConcepts().size;
             const focSize = State.getFocusedConcepts().size;
             const insCount = State.getRepositoryItems().insights.size;
             const slots = State.getFocusSlots();
             let checkValue = null;

             // Specific State Checks (including RF where applicable)
             if (trackType === 'elementAttunement') {
                 const attToCheck = (typeof currentValue === 'object' && currentValue !== null) ? currentValue : att; // Use passed value if object, else full state
                 if (track.element && attToCheck.hasOwnProperty(track.element)) {
                     checkValue = attToCheck[track.element];
                 } else if (track.condition === 'any') {
                     achieved = Object.values(attToCheck).some(v => v >= threshold);
                 } else if (track.condition === 'all') {
                      // Check if *all* defined attunement keys meet threshold
                      const allKeys = Object.keys(att); // Get all keys from state
                      achieved = allKeys.every(key => attToCheck[key] >= threshold);
                 }
             } else if (trackType === 'unlockedDeepDiveLevels') {
                  const levelsToCheck = (typeof currentValue === 'object' && currentValue !== null) ? currentValue : lvls;
                  if (track.condition === 'any') achieved = Object.values(levelsToCheck).some(v => v >= threshold);
                  else if (track.condition === 'all') {
                       const allKeys = Object.keys(lvls); // Get all keys from state
                       achieved = allKeys.every(key => levelsToCheck[key] >= threshold);
                  }
             } else if (trackType === 'discoveredConcepts.size') checkValue = discSize;
             else if (trackType === 'focusedConcepts.size') checkValue = focSize;
             else if (trackType === 'repositoryInsightsCount') checkValue = insCount;
             else if (trackType === 'focusSlotsTotal') checkValue = slots;
             else if (trackType === 'repositoryContents' && track.condition === "allTypesPresent") {
                 const i = State.getRepositoryItems();
                 achieved = i.scenes.size > 0 && i.experiments.size > 0 && i.insights.size > 0;
             }
              // Lore unlock milestones
             else if (trackType === 'unlockLore') {
                   if (track.condition === 'anyLevel' && typeof currentValue === 'number' && currentValue >= threshold) { achieved = true; }
                   else if (track.condition === 'level3' && typeof currentValue === 'number' && currentValue >= 3) { // Specific check for level 3
                        achieved = true; // Note: This might trigger multiple times if not careful. State check better.
                        // Better approach: Check state if level 3 is unlocked for *any* concept
                        // achieved = Array.from(State.getDiscoveredConcepts().values()).some(data => data.unlockedLoreLevel >= 3);
                   }
             }
              // Add RF score checks if needed
              else if (trackType === 'roleFocusScore' && track.condition === 'above' && (scores.RF || 0) >= threshold) { achieved = true; }
              else if (trackType === 'roleFocusScore' && track.condition === 'below' && (scores.RF || 0) <= threshold) { achieved = true; }


             // Final check if checkValue was set
             if (!achieved && checkValue !== null && typeof checkValue === 'number' && checkValue >= threshold) {
                 achieved = true;
             }
         }

         // --- Grant Milestone if Achieved ---
         if (achieved) {
             if (State.addAchievedMilestone(m.id)) { // Add to state, returns true if added
                 console.log("Milestone Achieved!", m.description);
                 milestoneAchievedThisUpdate = true;
                 UI.showMilestoneAlert(m.description); // Show UI alert

                 // Grant Reward
                 if (m.reward) {
                     if (m.reward.type === 'insight') gainInsight(m.reward.amount || 0, `Milestone: ${m.description}`);
                     else if (m.reward.type === 'attunement') gainAttunementForAction('milestone', m.reward.element || 'All', m.reward.amount || 0);
                     else if (m.reward.type === 'increaseFocusSlots') {
                         const inc = m.reward.amount || 1;
                         if (State.increaseFocusSlots(inc)) {
                             UI.updateFocusSlotsDisplay(); // Update UI immediately
                             updateMilestoneProgress('focusSlotsTotal', State.getFocusSlots()); // Re-check focus slot milestones
                         }
                     } else if (m.reward.type === 'discoverCard') {
                         const cId = m.reward.cardId;
                         if (cId && !State.getDiscoveredConcepts().has(cId)) {
                             const cDisc = concepts.find(c => c.id === cId);
                             if (cDisc) {
                                 addConceptToGrimoireInternal(cId, 'milestone'); // Use internal add function
                                 UI.showTemporaryMessage(`Milestone Reward: Discovered ${cDisc.name}!`, 3500);
                             } else { console.warn(`Milestone ${m.id} tried to reward non-existent card ID: ${cId}`); }
                         }
                     } else if (m.reward.type === 'discoverMultipleCards') { // Handle multiple card rewards
                          if(Array.isArray(m.reward.cardIds)) {
                              m.reward.cardIds.forEach(cId => {
                                  if (cId && !State.getDiscoveredConcepts().has(cId)) {
                                     const cDisc = concepts.find(c => c.id === cId);
                                     if (cDisc) { addConceptToGrimoireInternal(cId, 'milestone'); }
                                     else { console.warn(`Milestone ${m.id} tried to reward non-existent card ID: ${cId}`); }
                                  }
                              });
                               UI.showTemporaryMessage(`Milestone Reward: Multiple Concepts Discovered!`, 3500);
                          }
                     }
                     // Add other reward types here
                 }
             }
         }
     }); // End milestones.forEach

     // Refresh Repository UI if a milestone was achieved and the screen is visible
     if (milestoneAchievedThisUpdate && document.getElementById('repositoryScreen')?.classList.contains('current')) {
         UI.displayRepositoryContent(); // Re-render to show updated milestone list
     }
} // End updateMilestoneProgress


console.log("gameLogic.js loaded. (Enhanced v4)");
// --- END OF FILE gameLogic.js ---
