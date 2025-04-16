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
    categoryDrivenUnlocks, grimoireShelves, elementalDilemmas, onboardingTasks // Include onboarding
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
// Checks if a logic-driven action should advance the onboarding phase.
function checkOnboardingInternal(actionName, targetPhase, conditionValue = null) {
    const currentPhase = State.getOnboardingPhase();
    const onboardingComplete = State.isOnboardingComplete();

    if (Config.ONBOARDING_ENABLED && !onboardingComplete && currentPhase === targetPhase) {
        const task = onboardingTasks.find(t => t.phaseRequired === currentPhase);
        if (!task) return; // No task defined for this phase

        const track = task.track;
        let conditionMet = false;

        // Check if the action and optional value match the task requirements
        if (track.action === actionName) {
            conditionMet = (!track.value || track.value === conditionValue);
        }
        // Add checks for state-based triggers if needed in the future
        // else if (track.state === actionName) { ... }

        if (conditionMet) {
            console.log(`Onboarding Check (Internal): Action '${actionName}' meets criteria for phase ${targetPhase}. Advancing.`);
            State.advanceOnboardingPhase(); // Advance state
            // UI update will likely be triggered by the calling function or main.js usually
            // However, we might need to explicitly show the next onboarding step here
            // if the action doesn't naturally lead to a screen change handled by main.js
            UI.showOnboarding(State.getOnboardingPhase()); // Re-show onboarding UI for next step
        }
    }
}


// --- Insight & Attunement Management ---
export function gainInsight(amount, source = "Unknown") {
    if (typeof amount !== 'number' || isNaN(amount) || amount === 0) return;
    // State.changeInsight now handles logging & saving automatically
    const changed = State.changeInsight(amount);
    if (changed) {
        // Update UI displays (which includes log if visible)
        UI.updateInsightDisplays();
        // Check if gaining insight triggers any rituals
        checkAndUpdateRituals('gainInsight', { amount: Math.abs(amount) });
    }
}

export function spendInsight(amount, source = "Unknown") {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return false;
    if (State.getInsight() >= amount) {
        gainInsight(-amount, source); // Logs the spending via gainInsight call
        checkAndUpdateRituals('spendInsight', { amount: amount }); // Check if spending triggers ritual
        return true;
    } else {
        UI.showTemporaryMessage(`Not enough Insight! Need ${amount.toFixed(1)}.`, Config.TOAST_DURATION);
        return false;
    }
}

// Counts undiscovered concepts for a specific element key, broken down by rarity.
export function countUndiscoveredByRarity(elementKey) {
    const discoveredIds = new Set(State.getDiscoveredConcepts().keys());
    const counts = { common: 0, uncommon: 0, rare: 0, total: 0 };
    concepts.forEach(concept => {
        // Check if the concept's primary element matches the requested key
        if (concept.primaryElement === elementKey && !discoveredIds.has(concept.id)) {
            const rarity = concept.rarity || 'common';
            if (counts.hasOwnProperty(rarity)) { counts[rarity]++; }
            counts.total++;
        }
    });
    return counts;
}

// Grants attunement, now handles 7 elements including RF.
export function gainAttunementForAction(actionType, elementKey = null, amount = 0.5) {
    let targetKeys = [];
    let baseAmount = amount;
    const allKeys = Object.keys(State.getAttunement()); // Get all 7 keys from state

    // --- Determine Target Element(s) ---
    if (elementKey && allKeys.includes(elementKey) && elementKey !== 'All') {
        // Specific single element target
        targetKeys.push(elementKey);
    } else if (actionType === 'completeReflection' && ['Standard', 'SceneMeditation', 'RareConcept'].includes(currentReflectionContext)) {
        // Determine target element based on reflection context
        let keyFromContext = null;
        if (currentReflectionContext === 'Standard' && currentReflectionCategory) {
            keyFromContext = Object.keys(elementKeyToFullName).find(key => elementKeyToFullName[key] === currentReflectionCategory);
        } else if (currentReflectionContext === 'SceneMeditation') {
            const scene = sceneBlueprints.find(s => s.reflectionPromptId === currentPromptId);
            keyFromContext = scene?.element || null; // Element defined in scene data
        } else if (currentReflectionContext === 'RareConcept') {
            // Find concept associated with the rare prompt ID
            const conceptEntry = Array.from(State.getDiscoveredConcepts().entries()).find(([id, data]) => data.concept.uniquePromptId === currentPromptId);
            keyFromContext = conceptEntry ? conceptEntry[1].concept.primaryElement : null;
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
            case 'scoreNudge': baseAmount = (Config.SCORE_NUDGE_AMOUNT * 2) / (targetKeys.length || 1); break;
            case 'dilemmaNudge': baseAmount = (0.3 / (targetKeys.length || 1)); break;
            case 'completeReflectionGeneric': baseAmount = 0.2; break;
            case 'contemplation': baseAmount = (elementKey === 'All') ? 0.1 : 0.4; break;
            case 'researchSuccess': baseAmount = 0.5; break;
            case 'researchFail': baseAmount = 0.1; break;
            case 'researchSpecial': baseAmount = 0.8; break;
            case 'addToGrimoire': baseAmount = 0.6; break;
            case 'discover': baseAmount = 0.3; break;
            case 'markFocus': baseAmount = 1.0; break;
            default: baseAmount = 0.2; break; // Default small gain
        }
    } else {
        console.warn(`gainAttunement called with invalid parameters or context: action=${actionType}, key=${elementKey}, context=${currentReflectionContext}, category=${currentReflectionCategory}`);
        return; // Unknown action/target scenario
    }

    // --- Apply Attunement Changes ---
    let changed = false;
    targetKeys.forEach(key => {
        if (State.updateAttunement(key, baseAmount)) {
            changed = true;
            // Update milestones checks for 'all' and 'any' conditions
            updateMilestoneProgress('elementAttunement', State.getAttunement());
            updateMilestoneProgress('elementAttunement', { [key]: State.getAttunement()[key] });
        }
    });

    if (changed) {
        console.log(`Logic: Attunement updated (${actionType}, Key(s): ${targetKeys.join(',') || 'None'}) by ${baseAmount.toFixed(2)} per element.`);
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
    gainInsight(Config.INSIGHT_BOOST_AMOUNT, "Manual Boost");
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
    const currentAnswers = UI.getQuestionnaireAnswers();
    State.updateAnswers(elementName, currentAnswers);

    if (type === 'slider') {
        const sliderElement = document.getElementById(input.id);
        if(sliderElement) { UI.updateSliderFeedbackText(sliderElement, elementName); }
        else { console.warn(`Could not find slider element ${input.id} to update feedback.`); }
    }
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
         checkbox.checked = false;
         handleQuestionnaireInputChange(event); // Re-trigger update after unchecking
     } else {
         handleQuestionnaireInputChange(event); // Process valid change
     }
}

// Calculates score for a single element based on its answers
export function calculateElementScore(elementName, answersForElement) {
    const questions = questionnaireGuided[elementName] || [];
    let score = 5.0; // Start at neutral

    questions.forEach(q => {
        const answer = answersForElement[q.qId];
        let pointsToAdd = 0;
        const weight = q.scoreWeight || 1.0;

        if (q.type === 'slider') {
            const value = (answer !== undefined && !isNaN(parseFloat(answer))) ? parseFloat(answer) : q.defaultValue;
            const baseValue = q.defaultValue !== undefined ? q.defaultValue : 5;
            pointsToAdd = (value - baseValue) * weight;
        }
        else if (q.type === 'radio') {
            const opt = q.options.find(o => o.value === answer);
            pointsToAdd = opt ? (opt.points || 0) * weight : 0;
        }
        else if (q.type === 'checkbox' && Array.isArray(answer)) {
            answer.forEach(val => {
                const opt = q.options.find(o => o.value === val);
                pointsToAdd += opt ? (opt.points || 0) * weight : 0;
            });
        }
        score += pointsToAdd;
    });
    return Math.max(0, Math.min(10, score)); // Clamp score
}

export function goToNextElement() {
    const currentState = State.getState();
    const currentIndex = currentState.currentElementIndex;

    if (currentIndex >= 0 && currentIndex < elementNames.length) {
        const elementName = elementNames[currentIndex];
        const currentAnswers = UI.getQuestionnaireAnswers();
        State.updateAnswers(elementName, currentAnswers);
        console.log(`Logic: Saved answers for ${elementName}.`);
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= elementNames.length) {
        finalizeQuestionnaire();
    } else {
        State.updateElementIndex(nextIndex);
        UI.displayElementQuestions(nextIndex);
    }
}

export function goToPrevElement() {
    const currentState = State.getState();
    if (currentState.currentElementIndex > 0) {
        const elementName = elementNames[currentState.currentElementIndex];
        const currentAnswers = UI.getQuestionnaireAnswers();
        State.updateAnswers(elementName, currentAnswers); // Save before going back
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

    elementNames.forEach(elementName => {
        const score = calculateElementScore(elementName, allAnswers[elementName] || {});
        const key = elementNameToKey[elementName];
        if (key) { finalScores[key] = score; }
        else { console.warn(`No key found for element name: ${elementName}`); }
    });

    State.updateScores(finalScores);
    State.saveAllAnswers(allAnswers);
    State.setQuestionnaireComplete(); // Marks done, saves state, handles onboarding flag

    determineStarterHandAndEssence();

    updateMilestoneProgress('completeQuestionnaire', 1);
    checkForDailyLogin();

    UI.updateInsightDisplays();
    UI.updateFocusSlotsDisplay();
    UI.updateGrimoireCounter();
    UI.populateGrimoireFilters();
    calculateTapestryNarrative(true);
    checkSynergyTensionStatus();
    UI.togglePersonaView(false); // Show summary view first after Q

    console.log("Logic: Final User Scores (7 Elements):", State.getScores());
    UI.showScreen('personaScreen');
    UI.showTemporaryMessage("Experiment Complete! Explore your results.", 4000);
    // Check onboarding phase 1 completion
    checkOnboardingInternal('completeQuestionnaire', 1);
}


// --- Starter Hand Determination (Uses 7 element distance) ---
export function determineStarterHandAndEssence() {
     console.log("Logic: Determining starter hand (7 Dimensions)...");
     if (!concepts || !Array.isArray(concepts) || concepts.length === 0) { console.error("Concepts data missing."); return; }
     const userScores = State.getScores(); // Includes RF
     let conceptsWithDistance = concepts.map(c => {
         const conceptScoresValid = c.elementScores && Object.keys(c.elementScores).length === elementNames.length;
         const distance = conceptScoresValid ? Utils.euclideanDistance(userScores, c.elementScores, c.name) : Infinity;
         if (!conceptScoresValid) { console.warn(`Concept ${c.name} (ID: ${c.id}) missing/incomplete scores. Excluding.`); }
         return { ...c, distance };
     }).filter(c => c.distance !== Infinity && !isNaN(c.distance));

     if (conceptsWithDistance.length === 0) {
        console.error("Distance calculation failed or no valid concepts with complete scores found.");
        // Fallback: Grant first few concepts as default
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

     conceptsWithDistance.sort((a, b) => a.distance - b.distance); // Sort closest first

     // Selection Logic (Aim for ~7 diverse cards)
     const candidates = conceptsWithDistance.slice(0, 30);
     const starterHand = []; const starterHandIds = new Set();
     const targetHandSize = 7; const elementRepTarget = 4;
     const representedElements = new Set();
     // Prioritize closest concepts first
     for (const c of candidates) {
         if (starterHand.length >= 4) break;
         if (!starterHandIds.has(c.id)) { starterHand.push(c); starterHandIds.add(c.id); if (c.primaryElement) representedElements.add(c.primaryElement); }
     }
     // Try to ensure element diversity
     for (const c of candidates) {
         if (starterHand.length >= targetHandSize) break;
         if (starterHandIds.has(c.id)) continue;
         const needsRep = c.primaryElement && representedElements.size < elementRepTarget && !representedElements.has(c.primaryElement);
         if (needsRep || starterHand.length < 5) { starterHand.push(c); starterHandIds.add(c.id); if (c.primaryElement) representedElements.add(c.primaryElement); }
     }
     // Fill remaining slots
     for (const c of candidates) {
         if (starterHand.length >= targetHandSize) break;
         if (!starterHandIds.has(c.id)) { starterHand.push(c); starterHandIds.add(c.id); }
     }

     console.log("Logic: Starter Hand Selected:", starterHand.map(c => c.name));
     // Add selected concepts to state
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
    calculateTapestryNarrative(true);
    checkSynergyTensionStatus();
    UI.displayPersonaScreen();
    UI.displayInsightLog(); // Ensure log is displayed
}

export function displayWorkshopScreenLogic() {
    UI.displayWorkshopScreenContent();
    UI.refreshGrimoireDisplay();
}


// --- Research Actions ---
export function handleResearchClick({ currentTarget, isFree = false }) {
    const button = currentTarget;
    const elementKey = button.dataset.elementKey;
    const cost = parseFloat(button.dataset.cost);
    if (!elementKey || isNaN(cost)) { console.error("Invalid research button data."); return; }
    if (button.classList.contains('disabled')) { return; } // Already checked affordability/cooldown

    let conducted = false;
    if (isFree && State.getInitialFreeResearchRemaining() > 0) {
        if (State.useInitialFreeResearch()) {
            conducted = true; conductResearch(elementKey); console.log(`Logic: Used initial free research on ${elementKey}.`);
        } else { UI.showTemporaryMessage("No free research attempts left.", Config.TOAST_DURATION); }
    } else if (spendInsight(cost, `Research: ${elementKeyToFullName[elementKey]}`)) {
        conducted = true; conductResearch(elementKey);
        updateMilestoneProgress('conductResearch', 1); checkAndUpdateRituals('conductResearch');
        console.log(`Logic: Spent ${cost} Insight on ${elementKey}.`);
    }
    if (conducted) {
        checkOnboardingInternal('conductResearch', 3); // Check onboarding phase 3 completion
        if (document.getElementById('workshopScreen')?.classList.contains('current')) { UI.displayWorkshopScreenContent(); } // Update button states
    }
}

export function handleFreeResearchClick() {
    if (!State.isFreeResearchAvailable()) { UI.showTemporaryMessage("Daily meditation already performed.", Config.TOAST_DURATION); return; }
    const attunement = State.getAttunement();
    let targetKey = null; let minAtt = Config.MAX_ATTUNEMENT + 1;
    for (const key in attunement) { if (attunement.hasOwnProperty(key) && attunement[key] < minAtt) { minAtt = attunement[key]; targetKey = key; } }
    if (!targetKey) { console.error("Could not determine target for free research."); return; }

    console.log(`Logic: Free meditation target: ${targetKey} (${elementKeyToFullName[targetKey]})`);
    State.setFreeResearchUsed(); UI.displayWorkshopScreenContent();
    conductResearch(targetKey);
    updateMilestoneProgress('freeResearch', 1); checkAndUpdateRituals('freeResearch');
    checkOnboardingInternal('conductResearch', 3); // Daily research also counts for onboarding task
}

export function conductResearch(elementKeyToResearch) {
    const elementFullName = elementKeyToFullName[elementKeyToResearch];
    if (!elementFullName) { console.error(`Invalid element key: ${elementKeyToResearch}`); return; }
    console.log(`Logic: Conducting research for: ${elementFullName} (Key: ${elementKeyToResearch})`);
    UI.showTemporaryMessage(`Researching ${Utils.getElementShortName(elementDetails[elementFullName]?.name || elementFullName)}...`, 1500);

    const discoveredIds = new Set(State.getDiscoveredConcepts().keys());
    const discoveredRepo = State.getRepositoryItems();
    let specialFind = false;
    const roll = Math.random();
    const insightChance = 0.12; const sceneChance = 0.08;

    // Check for special repository items
    if (roll < insightChance && elementalInsights.some(i => !discoveredRepo.insights.has(i.id))) {
        const relevantInsights = elementalInsights.filter(i => i.element === elementKeyToResearch && !discoveredRepo.insights.has(i.id));
        const anyUnseenInsights = elementalInsights.filter(i => !discoveredRepo.insights.has(i.id));
        const insightPool = relevantInsights.length > 0 ? relevantInsights : anyUnseenInsights;
        if (insightPool.length > 0) { const foundInsight = insightPool[Math.floor(Math.random() * insightPool.length)]; if (State.addRepositoryItem('insights', foundInsight.id)) { specialFind = true; UI.showTemporaryMessage(`Elemental Insight Found: "${foundInsight.text}" (Check Repository)`, 4000); updateMilestoneProgress('repositoryInsightsCount', State.getRepositoryItems().insights.size); if(repositoryScreen?.classList.contains('current')) UI.displayRepositoryContent(); gainAttunementForAction('researchSpecial', elementKeyToResearch, 0.8); } }
    } else if (roll < (insightChance + sceneChance) && sceneBlueprints.some(s => !discoveredRepo.scenes.has(s.id))) {
        const availableScenes = sceneBlueprints.filter(s => !discoveredRepo.scenes.has(s.id) && s.element === elementKeyToResearch);
        const anyUnseenScenes = sceneBlueprints.filter(s => !discoveredRepo.scenes.has(s.id));
        const scenePool = availableScenes.length > 0 ? availableScenes : anyUnseenScenes;
        if (scenePool.length > 0) { const foundScene = scenePool[Math.floor(Math.random() * scenePool.length)]; if (State.addRepositoryItem('scenes', foundScene.id)) { specialFind = true; UI.showTemporaryMessage(`Scene Blueprint Discovered: '${foundScene.name}' (Check Repository)`, 4000); if(repositoryScreen?.classList.contains('current')) UI.displayRepositoryContent(); gainAttunementForAction('researchSpecial', elementKeyToResearch, 0.8); } }
    }

    // Find concepts
    const conceptPool = concepts.filter(c => c.primaryElement === elementKeyToResearch && !discoveredIds.has(c.id));
    if (conceptPool.length === 0 && !specialFind) { gainInsight(1.5, `Research Echoes: ${elementFullName}`); UI.displayResearchResults({ concepts: [], duplicateInsightGain: 1.5 }); gainAttunementForAction('researchFail', elementKeyToResearch); return; }
    else if (conceptPool.length === 0 && specialFind) { UI.displayResearchResults({ concepts: [], duplicateInsightGain: 0 }); return; }

    // Select concepts if pool is not empty
    const numResults = Math.min(conceptPool.length, Math.floor(Math.random() * 3) + 1);
    const selectedOut = []; const availableIndices = Array.from(conceptPool.keys());
    while (selectedOut.length < numResults && availableIndices.length > 0) { const randomIndex = Math.floor(Math.random() * availableIndices.length); const poolIndex = availableIndices.splice(randomIndex, 1)[0]; selectedOut.push(conceptPool[poolIndex]); }

    console.log(`Logic: Research Results for ${elementFullName}:`, selectedOut.map(c => c.name));
    if (selectedOut.length > 0) { if (selectedOut.some(c => c.rarity === 'rare')) { updateMilestoneProgress('discoverRareCard', 1); } gainAttunementForAction('researchSuccess', elementKeyToResearch); UI.displayResearchResults({ concepts: selectedOut, duplicateInsightGain: 0 }); }
    else if (!specialFind) { UI.displayResearchResults({ concepts: [], duplicateInsightGain: 0 }); gainAttunementForAction('researchFail', elementKeyToResearch); }
}


// --- Reflection Confirmation Logic ---
export function handleConfirmReflection(nudgeAllowed) {
    if (!currentPromptId) { console.error("No current prompt ID for reflection confirmation."); UI.hidePopups(); return; }
    console.log(`Logic: Reflection confirmed: Context=${currentReflectionContext}, Prompt=${currentPromptId}, Nudge=${nudgeAllowed}`);
    State.addSeenPrompt(currentPromptId);

    let rewardAmt = 5.0; let attuneKey = null; let attuneAmt = 1.0;
    let milestoneAct = 'completeReflection'; let reflectionSourceText = `Reflection (${currentReflectionContext || 'Unknown'})`;

    // Determine reward amount based on context
    switch (currentReflectionContext) {
        case 'Guided':
            rewardAmt = Config.GUIDED_REFLECTION_COST + 3;
            reflectionSourceText = `Guided Reflection (${currentReflectionCategory || 'Unknown'})`;
            break;
        case 'RareConcept':
            rewardAmt = 8.0;
            const conceptData = State.getDiscoveredConceptData(reflectionTargetConceptId);
            reflectionSourceText = `Rare Reflection (${conceptData?.concept?.name || 'Unknown Concept'})`;
            break;
        case 'SceneMeditation':
            const scene = sceneBlueprints.find(s => s.reflectionPromptId === currentPromptId);
            rewardAmt = (scene?.meditationCost || Config.SCENE_MEDITATION_BASE_COST) + 5;
            reflectionSourceText = `Scene Meditation (${scene?.name || 'Unknown Scene'})`;
            break;
        case 'Dissonance':
            milestoneAct = 'completeReflectionDissonance'; attuneAmt = 0.5; rewardAmt = 3.0;
            const dissonantConcept = concepts.find(c => c.id === reflectionTargetConceptId);
            reflectionSourceText = `Dissonance Reflection (${dissonantConcept?.name || 'Unknown Concept'})`;
            // Apply score nudge if allowed and target concept exists
            if (nudgeAllowed && reflectionTargetConceptId && dissonantConcept?.elementScores) {
                console.log("Logic: Processing nudge for Dissonance...");
                const scores = State.getScores(); const newScores = { ...scores }; let nudged = false;
                for (const key in scores) { if (scores.hasOwnProperty(key) && dissonantConcept.elementScores.hasOwnProperty(key)) { const uScore = scores[key]; const cScore = dissonantConcept.elementScores[key]; const diff = cScore - uScore; if (Math.abs(diff) > 1.0) { const nudgeVal = Math.sign(diff) * Config.SCORE_NUDGE_AMOUNT; newScores[key] = Math.max(0, Math.min(10, uScore + nudgeVal)); if (newScores[key] !== uScore) nudged = true; } } }
                if (nudged) { State.updateScores(newScores); console.log("Logic: Nudged Scores:", State.getScores()); if (personaScreen?.classList.contains('current')) { UI.displayPersonaScreen(); } UI.showTemporaryMessage("Core understanding shifted slightly.", 3500); gainAttunementForAction('scoreNudge', 'All', 0.5); updateMilestoneProgress('scoreNudgeApplied', 1); }
            }
            // Add the concept to the Grimoire NOW
            if (reflectionTargetConceptId) {
                if (addConceptToGrimoireInternal(reflectionTargetConceptId, 'dissonanceConfirm')) {
                     // Update the research popup item state if it's still open and pending
                     const researchPopupIsOpen = researchResultsPopup && !researchResultsPopup.classList.contains('hidden');
                     const pendingItem = researchPopupContent?.querySelector(`.research-result-item[data-concept-id="${reflectionTargetConceptId}"][data-choice-made="pending_dissonance"]`);
                     if (researchPopupIsOpen && pendingItem) { UI.handleResearchPopupAction(reflectionTargetConceptId, 'kept_after_dissonance'); }
                } else { console.warn(`Failed to add concept ${reflectionTargetConceptId} after dissonance confirmation.`); }
            }
            break; // End Dissonance specific handling
        default: // Standard or unknown
            rewardAmt = 5.0;
            reflectionSourceText = `Standard Reflection (${currentReflectionCategory || 'General'})`;
            break;
    }

    gainInsight(rewardAmt, reflectionSourceText);

    // Determine Attunement target
    if (currentReflectionContext === 'Standard' && currentReflectionCategory) { attuneKey = Object.keys(elementKeyToFullName).find(key => elementKeyToFullName[key] === currentReflectionCategory); }
    else if (currentReflectionContext === 'RareConcept' && reflectionTargetConceptId) { const conceptData = State.getDiscoveredConceptData(reflectionTargetConceptId); attuneKey = conceptData?.concept?.primaryElement || null; }
    else if (currentReflectionContext === 'SceneMeditation') { const scene = sceneBlueprints.find(s => s.reflectionPromptId === currentPromptId); attuneKey = scene?.element || null; }
    // Apply attunement
    if (attuneKey) { gainAttunementForAction('completeReflection', attuneKey, attuneAmt); }
    else { gainAttunementForAction('completeReflectionGeneric', 'All', 0.2); }

    updateMilestoneProgress(milestoneAct, 1);
    checkAndUpdateRituals('completeReflection');
    const ritualCtxMatch = `${currentReflectionContext}_${currentPromptId}`;
    checkAndUpdateRituals('completeReflection', { contextMatch: ritualCtxMatch });

    UI.hidePopups();
    UI.showTemporaryMessage("Reflection complete! Insight gained.", Config.TOAST_DURATION);
    // Check general reflection onboarding trigger
    checkOnboardingInternal('completeReflection', 7);
}


// --- Grimoire / Collection Actions ---
export function handleResearchPopupChoice(conceptId, action) {
    const concept = concepts.find(c => c.id === conceptId);
    if (!concept) { console.error(`Cannot process choice: Concept ${conceptId} not found.`); return; }
    console.log(`Logic: Processing research choice: ${action} for ${concept.name} (ID: ${conceptId})`);

    if (action === 'keep') {
        const distance = Utils.euclideanDistance(State.getScores(), concept.elementScores, concept.name);
        if (distance > Config.DISSONANCE_THRESHOLD) {
            triggerReflectionPrompt('Dissonance', concept.id);
            UI.handleResearchPopupAction(conceptId, 'pending_dissonance');
            console.log(`Logic: Dissonance triggered for ${concept.name}. Addition deferred.`);
        } else {
            if(addConceptToGrimoireInternal(conceptId, 'researchKeep')) {
                UI.handleResearchPopupAction(conceptId, 'kept');
                // Onboarding check is inside addConceptToGrimoireInternal
            } else { UI.handleResearchPopupAction(conceptId, 'error_adding'); }
        }
    } else if (action === 'sell') {
        const discoveryValue = Config.CONCEPT_DISCOVERY_INSIGHT[concept.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default;
        const sellValue = discoveryValue * Config.SELL_INSIGHT_FACTOR;
        gainInsight(sellValue, `Sold from Research: ${concept.name}`);
        updateMilestoneProgress('sellConcept', 1);
        UI.handleResearchPopupAction(conceptId, 'sold');
        console.log(`Logic: Sold ${concept.name} from research for ${sellValue.toFixed(1)} Insight.`);
    } else {
        console.warn(`Unknown action '${action}'`);
        UI.handleResearchPopupAction(conceptId, 'error_unknown'); // Update UI to indicate error
    }
    // Refresh Grimoire if a concept was actually added state-side (not pending)
    if (action === 'keep' && State.getDiscoveredConcepts().has(conceptId)) { UI.refreshGrimoireDisplay(); UI.updateGrimoireCounter(); }
}

// Internal function to add concept, handles synergy checks, rewards, prompts etc.
function addConceptToGrimoireInternal(conceptId, context = 'unknown') {
    const conceptToAdd = concepts.find(c => c.id === conceptId);
    if (!conceptToAdd) { console.error("Internal add fail: Concept not found. ID:", conceptId); return false; }
    if (State.getDiscoveredConcepts().has(conceptId)) { console.warn(`Attempted to re-add already discovered concept ${conceptId} (${conceptToAdd.name}). Context: ${context}`); return false; }
    console.log(`Logic: Adding '${conceptToAdd.name}' (ID: ${conceptId}) internally. Context: ${context}`);

    if (State.addDiscoveredConcept(conceptId, conceptToAdd)) { // Add to state first
        let insightReward = Config.CONCEPT_DISCOVERY_INSIGHT[conceptToAdd.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default;
        let bonusInsight = 0; let synergyMessage = null;

        // Synergy Check
        if (conceptToAdd.relatedIds && conceptToAdd.relatedIds.length > 0) {
            const discoveredMap = State.getDiscoveredConcepts();
            const undiscoveredRelated = conceptToAdd.relatedIds.filter(id => !discoveredMap.has(id));
            for (const relatedId of conceptToAdd.relatedIds) { // Bonus for linking
                if (discoveredMap.has(relatedId)) { bonusInsight += Config.SYNERGY_INSIGHT_BONUS; if (!synergyMessage) { const relatedConcept = discoveredMap.get(relatedId)?.concept; synergyMessage = `Synergy Bonus: +${Config.SYNERGY_INSIGHT_BONUS.toFixed(1)} Insight (Related to ${relatedConcept?.name || 'a known concept'})`; } }
            }
            if (undiscoveredRelated.length > 0 && Math.random() < Config.SYNERGY_DISCOVERY_CHANCE) { // Chance to auto-discover
                const relatedIdToDiscover = undiscoveredRelated[Math.floor(Math.random() * undiscoveredRelated.length)];
                const relatedConceptData = concepts.find(c => c.id === relatedIdToDiscover);
                if (relatedConceptData && !State.getDiscoveredConcepts().has(relatedIdToDiscover)) { addConceptToGrimoireInternal(relatedIdToDiscover, 'synergy'); UI.showTemporaryMessage(`Synergy Resonance: Focusing ${conceptToAdd.name} also revealed ${relatedConceptData.name}! Check your Grimoire.`, 5000); console.log(`Logic: Synergy discovery! Added ${relatedConceptData.name} (ID: ${relatedIdToDiscover})`); }
            }
        }

        insightReward += bonusInsight;
        gainInsight(insightReward, `Discovered: ${conceptToAdd.name}${bonusInsight > 0 ? ' (Synergy)' : ''}`);
        gainAttunementForAction('addToGrimoire', conceptToAdd.primaryElement, 0.6);
        if (conceptToAdd.rarity === 'rare' && conceptToAdd.uniquePromptId && reflectionPrompts.RareConcept?.[conceptToAdd.uniquePromptId]) { State.addPendingRarePrompt(conceptToAdd.uniquePromptId); console.log(`Logic: Queued rare prompt ${conceptToAdd.uniquePromptId}`); }

        UI.updateGrimoireCounter();
        if (currentlyDisplayedConceptId === conceptId) { UI.showConceptDetailPopup(conceptId); }
        checkTriggerReflectionPrompt('add');
        updateMilestoneProgress('addToGrimoire', 1);
        updateMilestoneProgress('discoveredConcepts.size', State.getDiscoveredConcepts().size);
        checkAndUpdateRituals('addToGrimoire', { conceptId: conceptId, rarity: conceptToAdd.rarity, conceptType: conceptToAdd.cardType });
        UI.refreshGrimoireDisplay();

        if (context !== 'synergy' && context !== 'dissonanceConfirm') { UI.showTemporaryMessage(`${conceptToAdd.name} added to Grimoire!`, Config.TOAST_DURATION); if (synergyMessage) { setTimeout(() => UI.showTemporaryMessage(synergyMessage, 3500), 500); } }
        else if (context === 'dissonanceConfirm') { UI.showTemporaryMessage(`${conceptToAdd.name} accepted into Grimoire after reflection.`, Config.TOAST_DURATION); }

        checkOnboardingInternal('addToGrimoire', 4); // Check onboarding here after successful add

        return true;
    } else { console.error(`Logic: State failed to add concept ${conceptToAdd.name}.`); UI.showTemporaryMessage(`Error adding ${conceptToAdd.name}.`, Config.TOAST_DURATION); return false; }
}

export function addConceptToGrimoireById(conceptId, buttonElement = null) {
     if (State.getDiscoveredConcepts().has(conceptId)) { UI.showTemporaryMessage("Already in Grimoire.", 2500); return; }
     const concept = concepts.find(c => c.id === conceptId); if (!concept) { console.error("Cannot add concept: Not found. ID:", conceptId); UI.showTemporaryMessage("Error: Concept not found.", 3000); return; }
     const distance = Utils.euclideanDistance(State.getScores(), concept.elementScores, concept.name);
     if (distance > Config.DISSONANCE_THRESHOLD) { triggerReflectionPrompt('Dissonance', concept.id); if(buttonElement) buttonElement.disabled = true; }
     else { if (addConceptToGrimoireInternal(conceptId, 'detailPopup')) { if(buttonElement) UI.updateGrimoireButtonStatus(conceptId); /* Onboarding check inside internal func */ } }
}

export function handleToggleFocusConcept() {
    if (currentlyDisplayedConceptId === null) return;
    const conceptId = currentlyDisplayedConceptId;
    if (handleCardFocusToggle(conceptId)) { // Call core logic
         UI.updateFocusButtonStatus(conceptId);
         checkOnboardingInternal('markFocus', 5); // Check onboarding
    }
}

export function handleCardFocusToggle(conceptId) {
    if (isNaN(conceptId)) { console.error("Invalid concept ID for focus toggle."); return false; }
    const result = State.toggleFocusConcept(conceptId);
    const conceptName = State.getDiscoveredConceptData(conceptId)?.concept?.name || `ID ${conceptId}`;

    if (result === 'not_discovered') { UI.showTemporaryMessage("Concept not in Grimoire.", 3000); return false; }
    else if (result === 'slots_full') { UI.showTemporaryMessage(`Focus slots full (${State.getFocusSlots()}).`, 3000); return false; }
    else { // Added or removed
        if (result === 'removed') { UI.showTemporaryMessage(`${conceptName} removed from Focus.`, 2500); checkAndUpdateRituals('removeFocus'); }
        else { // Added
            UI.showTemporaryMessage(`${conceptName} marked as Focus!`, 2500);
            gainInsight(1.0, `Focused on ${conceptName}`);
            const concept = State.getDiscoveredConceptData(conceptId)?.concept;
            if (concept?.primaryElement) { gainAttunementForAction('markFocus', concept.primaryElement, 1.0); }
            updateMilestoneProgress('markFocus', 1); updateMilestoneProgress('focusedConcepts.size', State.getFocusedConcepts().size);
            checkAndUpdateRituals('markFocus', { conceptId: conceptId });
            checkOnboardingInternal('markFocus', 5); // Check phase 5 completion
        }
        // --- Update UI ---
        UI.refreshGrimoireDisplay(); calculateTapestryNarrative(true); checkSynergyTensionStatus();
        if (personaScreen?.classList.contains('current')) { UI.displayFocusedConceptsPersona(); UI.generateTapestryNarrative(); UI.synthesizeAndDisplayThemesPersona(); }
        checkForFocusUnlocks(); UI.updateElementalDilemmaButtonState(); UI.updateSuggestSceneButtonState();
        if (currentlyDisplayedConceptId === conceptId) { UI.updateFocusButtonStatus(conceptId); }
        return true; // Indicate success
    }
}

export function handleSellConcept(event) {
    const button = event.target.closest('button[data-concept-id]'); if (!button) return;
    const conceptId = parseInt(button.dataset.conceptId); const context = button.dataset.context;
    if (isNaN(conceptId)) { console.error("Invalid concept ID for selling."); return; }
    const discoveredData = State.getDiscoveredConceptData(conceptId); const concept = discoveredData?.concept;
    if (!concept) { console.error(`Sell fail: Concept ${conceptId} not found.`); UI.showTemporaryMessage("Error selling concept.", 3000); return; }
    let discoveryValue = Config.CONCEPT_DISCOVERY_INSIGHT[concept.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default;
    const sellValue = discoveryValue * Config.SELL_INSIGHT_FACTOR;
    const sourceLoc = (context === 'grimoire') ? 'Grimoire Library' : 'Detail Popup';
    if (confirm(`Sell '${concept.name}' (${concept.rarity}) from ${sourceLoc} for ${sellValue.toFixed(1)} Insight? This is permanent.`)) {
        gainInsight(sellValue, `Sold: ${concept.name}`);
        updateMilestoneProgress('sellConcept', 1); checkAndUpdateRituals('sellConcept');
        let focusChanged = State.getFocusedConcepts().has(conceptId);
        if(State.removeDiscoveredConcept(conceptId)) { UI.updateGrimoireCounter(); UI.refreshGrimoireDisplay(); }
        else { console.error(`Failed to remove concept ${conceptId} from state during sell.`); }
        if (focusChanged) { /* Update tapestry etc. */ calculateTapestryNarrative(true); checkSynergyTensionStatus(); if (personaScreen?.classList.contains('current')) { UI.displayFocusedConceptsPersona(); UI.generateTapestryNarrative(); UI.synthesizeAndDisplayThemesPersona(); } checkForFocusUnlocks(); UI.updateElementalDilemmaButtonState(); UI.updateSuggestSceneButtonState(); }
        UI.showTemporaryMessage(`Sold ${concept.name} for ${sellValue.toFixed(1)} Insight.`, 2500);
        if (context !== 'grimoire' && currentlyDisplayedConceptId === conceptId) { UI.hidePopups(); }
    }
}


// --- Reflection Triggering ---
export function checkTriggerReflectionPrompt(triggerAction = 'other') {
    const currentState = State.getState();
    if (currentState.promptCooldownActive) return;
    if (triggerAction === 'add') { State.incrementReflectionTrigger(); }
    else if (triggerAction === 'completeQuestionnaire') { State.incrementReflectionTrigger(); State.incrementReflectionTrigger(); State.incrementReflectionTrigger(); }
    const cardsAdded = currentState.cardsAddedSinceLastPrompt;
    const hasPendingRare = currentState.pendingRarePrompts.length > 0;
    if (hasPendingRare) { console.log("Logic: Pending rare prompt found. Triggering RareConcept."); triggerReflectionPrompt('RareConcept'); State.resetReflectionTrigger(true); startReflectionCooldown(Config.REFLECTION_COOLDOWN); }
    else if (cardsAdded >= Config.REFLECTION_TRIGGER_THRESHOLD) { console.log("Logic: Reflection trigger threshold met. Triggering Standard."); triggerReflectionPrompt('Standard'); State.resetReflectionTrigger(true); startReflectionCooldown(Config.REFLECTION_COOLDOWN); }
}

export function startReflectionCooldown(duration = Config.REFLECTION_COOLDOWN) {
    if (reflectionCooldownTimeout) clearTimeout(reflectionCooldownTimeout);
    State.setPromptCooldownActive(true); console.log(`Logic: Reflection cooldown started (${duration / 1000}s).`);
    reflectionCooldownTimeout = setTimeout(() => { State.clearReflectionCooldown(); console.log("Logic: Reflection cooldown ended."); reflectionCooldownTimeout = null; }, duration);
}

export function triggerReflectionPrompt(context = 'Standard', targetId = null, category = null) {
    currentReflectionContext = context;
    reflectionTargetConceptId = (context === 'Dissonance' || context === 'RareConcept') ? targetId : null;
    currentReflectionCategory = category;
    currentPromptId = null; let selectedPrompt = null;
    let title = "Moment for Reflection"; let promptCatLabel = "General"; let showNudge = false; let reward = 5.0;
    console.log(`Logic: Triggering reflection - Context=${context}, TargetID=${targetId}, Category=${category}`);

    // 1. Check for Pending Rare Prompts (unless Dissonance/SceneMeditation)
    if (context !== 'Dissonance' && context !== 'SceneMeditation') {
        const nextRareId = State.getNextRarePrompt();
        if (nextRareId) {
            selectedPrompt = reflectionPrompts.RareConcept?.[nextRareId];
            if (selectedPrompt) {
                 currentReflectionContext = 'RareConcept'; currentPromptId = selectedPrompt.id;
                 const conceptEntry = Array.from(State.getDiscoveredConcepts().entries()).find(([id, data]) => data.concept.uniquePromptId === nextRareId);
                 if (conceptEntry) { reflectionTargetConceptId = conceptEntry[0]; promptCatLabel = conceptEntry[1].concept.name; title = `Reflection: ${promptCatLabel}`; }
                 else { promptCatLabel = "Rare Concept"; title = "Rare Concept Reflection"; }
                 reward = 8.0; console.log(`Logic: Displaying Queued Rare reflection: ${nextRareId}`);
                 checkOnboardingInternal('triggerReflection', 7); // Check onboarding
                 UI.displayReflectionPrompt({ title, category: promptCatLabel, prompt: selectedPrompt, showNudge, reward }, currentReflectionContext); return;
            } else { console.warn(`Rare prompt text missing: ${nextRareId}. Re-queuing.`); State.addPendingRarePrompt(nextRareId); currentReflectionContext = 'Standard'; }
        }
    }
    // 2. Handle Specific Contexts
    let promptPool = [];
    if (context === 'Dissonance' && targetId) { title = "Dissonance Reflection"; const concept = concepts.find(c => c.id === targetId); promptCatLabel = concept ? concept.name : "Dissonant Concept"; promptPool = reflectionPrompts.Dissonance || []; showNudge = true; reward = 3.0; reflectionTargetConceptId = targetId; }
    else if (context === 'Guided' && category) { title = "Guided Reflection"; promptCatLabel = category; promptPool = reflectionPrompts.Guided?.[category] || []; reward = Config.GUIDED_REFLECTION_COST + 3; }
    else if (context === 'SceneMeditation' && targetId) { const scene = sceneBlueprints.find(s => s.id === targetId); if (scene?.reflectionPromptId) { selectedPrompt = reflectionPrompts.SceneMeditation?.[scene.reflectionPromptId]; if (selectedPrompt) { title = "Scene Meditation"; promptCatLabel = scene.name; currentPromptId = selectedPrompt.id; reward = (scene.meditationCost || Config.SCENE_MEDITATION_BASE_COST) + 5; checkOnboardingInternal('triggerReflection', 7); UI.displayReflectionPrompt({ title, category: promptCatLabel, prompt: selectedPrompt, showNudge, reward }, currentReflectionContext); return; } else { context = 'Standard'; } } else { context = 'Standard'; } }

    // 3. Handle Standard Reflection (or fallback)
    if (context === 'Standard' || promptPool.length === 0 && context !== 'Dissonance') {
        currentReflectionContext = 'Standard'; title = "Standard Reflection"; reward = 5.0;
        const attunement = State.getAttunement();
        const validElements = Object.entries(attunement).filter(([key, value]) => value > 0 && reflectionPrompts[elementKeyToFullName[key]]?.length > 0).sort(([, a], [, b]) => b - a);
        if (validElements.length > 0) { const topTierCount = Math.max(1, Math.ceil(validElements.length / 2)); const topTier = validElements.slice(0, topTierCount); const [selectedKey] = topTier[Math.floor(Math.random() * topTier.length)]; const selectedFullName = elementKeyToFullName[selectedKey]; promptPool = reflectionPrompts[selectedFullName] || []; promptCatLabel = Utils.getElementShortName(elementDetails[selectedFullName]?.name || selectedFullName); currentReflectionCategory = selectedFullName; }
        else { promptPool = []; }
    }
    // 4. Select Prompt from Pool
    if (!selectedPrompt && promptPool.length > 0) { const seen = State.getSeenPrompts(); const available = promptPool.filter(p => !seen.has(p.id)); selectedPrompt = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : promptPool[Math.floor(Math.random() * promptPool.length)]; currentPromptId = selectedPrompt.id; }

    // 5. Display or Handle Failure
    if (selectedPrompt && currentPromptId) { const promptData = { title, category: promptCatLabel, prompt: selectedPrompt, showNudge, reward }; checkOnboardingInternal('triggerReflection', 7); UI.displayReflectionPrompt(promptData, currentReflectionContext); }
    else { /* ... handle failure logic ... */ console.error(`Could not select prompt for context ${context}`); if (context === 'Dissonance' && reflectionTargetConceptId) { /* ... failsafe add ... */ } else if (context === 'Guided') { /* ... refund ... */ } clearPopupState(); }
}


// --- Guided Reflection Trigger ---
export function triggerGuidedReflection() {
    const availableElements = elementNames.filter(name => reflectionPrompts.Guided?.[name]?.length > 0);
    if (availableElements.length === 0) { UI.showTemporaryMessage("No guided reflections available.", 3000); return; }
    const randomElement = availableElements[Math.floor(Math.random() * availableElements.length)];
    const cost = Config.GUIDED_REFLECTION_COST;
    if (spendInsight(cost, `Seek Guidance: ${Utils.getElementShortName(randomElement)}`)) { triggerReflectionPrompt('Guided', null, randomElement); }
}

// --- Notes, Library, Repository Actions ---
export function handleSaveNote() { if (currentlyDisplayedConceptId === null) return; const notesTA = document.getElementById('myNotesTextarea'); if (!notesTA) return; const noteText = notesTA.value.trim(); if (State.updateNotes(currentlyDisplayedConceptId, noteText)) { UI.updateNoteSaveStatus("Saved!", false); } else { UI.updateNoteSaveStatus("Error.", true); } }
export function handleUnlockLibraryLevel(event) { const button = event.target.closest('button'); if (!button || button.disabled) return; const key = button.dataset.elementKey; const level = parseInt(button.dataset.level); if (!key || isNaN(level)) { console.error("Invalid library unlock data"); return; } unlockDeepDiveLevelInternal(key, level); }
function unlockDeepDiveLevelInternal(elementKey, levelToUnlock) {
    const deepDiveData = elementDeepDive[elementKey] || []; const levelData = deepDiveData.find(l => l.level === levelToUnlock); const currentLevel = State.getState().unlockedDeepDiveLevels[elementKey] || 0;
    if (!levelData || levelToUnlock !== currentLevel + 1) { return; } const cost = levelData.insightCost || 0;
    if (spendInsight(cost, `Unlock Insight: ${elementKeyToFullName[elementKey]} Lv ${levelToUnlock}`)) {
        if (State.unlockLibraryLevel(elementKey, levelToUnlock)) { /* ... Update UI, milestones, rituals ... */ checkOnboardingInternal('unlockLibrary', 6); }
        else { /* Handle state failure, refund */ gainInsight(cost, `Refund: Library unlock state error`); }
    }
}
export function handleMeditateScene(event) { const button = event.target.closest('button[data-scene-id]'); if (!button || button.disabled) return; const sceneId = button.dataset.sceneId; if (!sceneId) return; meditateOnSceneInternal(sceneId); }
function meditateOnSceneInternal(sceneId) { const scene = sceneBlueprints.find(s => s.id === sceneId); if (!scene) return; const cost = scene.meditationCost || Config.SCENE_MEDITATION_BASE_COST; if (spendInsight(cost, `Meditate: ${scene.name}`)) { if (scene.reflectionPromptId) { triggerReflectionPrompt('SceneMeditation', sceneId); updateMilestoneProgress('meditateScene', 1); checkAndUpdateRituals('meditateScene'); } else { /* Refund */ gainInsight(cost, `Refund: Missing scene prompt`); } } }
export function handleAttemptExperiment(event) { const button = event.target.closest('button[data-experiment-id]'); if (!button || button.disabled) return; const expId = button.dataset.experimentId; if (!expId) return; attemptExperimentInternal(expId); }
function attemptExperimentInternal(experimentId) {
    const exp = alchemicalExperiments.find(e => e.id === experimentId); if (!exp) return; if(State.getRepositoryItems().experiments.has(experimentId)) { UI.showTemporaryMessage("Experiment already completed.", 2500); return; }
    const attunement = State.getAttunement(); const focused = State.getFocusedConcepts(); const insight = State.getInsight(); const scores = State.getScores();
    let canAttempt = true; let unmetReqs = [];
    if (attunement[exp.requiredElement] < exp.requiredAttunement) { canAttempt = false; unmetReqs.push(`${exp.requiredAttunement} ${Utils.getElementShortName(elementKeyToFullName[exp.requiredElement])} Attun.`);}
    if (exp.requiredRoleFocusScore && (scores.RF || 0) < exp.requiredRoleFocusScore) { canAttempt = false; unmetReqs.push(`RF Score ≥ ${exp.requiredRoleFocusScore}`); }
    if (exp.requiredRoleFocusScoreBelow && (scores.RF || 0) >= exp.requiredRoleFocusScoreBelow) { canAttempt = false; unmetReqs.push(`RF Score < ${exp.requiredRoleFocusScoreBelow}`); }
    if (exp.requiredFocusConceptIds) { for (const reqId of exp.requiredFocusConceptIds) { if (!focused.has(reqId)) { canAttempt = false; const c = concepts.find(c=>c.id === reqId); unmetReqs.push(c ? `Focus: ${c.name}` : `Focus: ID ${reqId}`); } } }
    if (exp.requiredFocusConceptTypes) { for (const typeReq of exp.requiredFocusConceptTypes) { let met = false; const dMap = State.getDiscoveredConcepts(); for (const fId of focused) { const c = dMap.get(fId)?.concept; if (c?.cardType === typeReq) { met = true; break; } } if (!met) { canAttempt = false; unmetReqs.push(`Focus Type: ${typeReq}`); } } }
    const cost = exp.insightCost || Config.EXPERIMENT_BASE_COST; if (insight < cost) { canAttempt = false; unmetReqs.push(`${cost} Insight`); }
    if (!canAttempt) { UI.showTemporaryMessage(`Requires: ${unmetReqs.join(', ')}`, 3500); return; }
    if (!spendInsight(cost, `Attempt Exp: ${exp.name}`)) return;
    console.log(`Logic: Attempting: ${exp.name}`); updateMilestoneProgress('attemptExperiment', 1); checkAndUpdateRituals('attemptExperiment');
    const roll = Math.random();
    if (roll < (exp.successRate || 0.5)) { /* Handle Success */ State.addRepositoryItem('experiments', exp.id); if (exp.successReward) { /* Grant reward */ } }
    else { /* Handle Failure */ if (exp.failureConsequence) { /* Apply consequence */ } }
    if(repositoryScreen?.classList.contains('current')) UI.displayRepositoryContent();
}
export function handleSuggestSceneClick() {
    const focused = State.getFocusedConcepts(); const suggestionOutputDiv = getElement('sceneSuggestionOutput'); const suggestedSceneContentDiv = getElement('suggestedSceneContent');
    if (focused.size === 0) { UI.showTemporaryMessage("Focus on concepts first.", 3000); return; }
    const cost = Config.SCENE_SUGGESTION_COST; if (!spendInsight(cost, "Suggest Scene")) return;
    console.log("Logic: Suggesting scenes based on focus..."); const { focusScores } = calculateFocusScores(); const discoveredScenes = State.getRepositoryItems().scenes;
    const sortedElements = Object.entries(focusScores).filter(([key, score]) => score > 4.0).sort(([, a], [, b]) => b - a);
    const topElements = sortedElements.slice(0, 3).map(([key]) => key);
    if (topElements.length === 0) { UI.showTemporaryMessage("Focus too broad.", 3000); gainInsight(cost, "Refund: Suggest Fail"); return; }
    console.log("Logic: Dominant focus elements:", topElements);
    const relevantUndiscoveredScenes = sceneBlueprints.filter(scene => topElements.includes(scene.element) && !discoveredScenes.has(scene.id));
    if (relevantUndiscoveredScenes.length === 0) { UI.showTemporaryMessage("All relevant scenes discovered.", 3500); if (suggestionOutputDiv) suggestionOutputDiv.classList.add('hidden'); }
    else { const selectedScene = relevantUndiscoveredScenes[Math.floor(Math.random() * relevantUndiscoveredScenes.length)]; if (State.addRepositoryItem('scenes', selectedScene.id)) { console.log(`Logic: Suggested Scene: ${selectedScene.name}`); if (suggestionOutputDiv && suggestedSceneContentDiv) { const sceneCost = selectedScene.meditationCost || Config.SCENE_MEDITATION_BASE_COST; const canAfford = State.getInsight() >= sceneCost; const sceneElement = UI.renderRepositoryItem(selectedScene, 'scene', sceneCost, canAfford); suggestedSceneContentDiv.innerHTML = ''; suggestedSceneContentDiv.appendChild(sceneElement); suggestionOutputDiv.classList.remove('hidden'); } UI.showTemporaryMessage(`Scene Suggested: '${selectedScene.name}'!`, 4000); if (repositoryScreen?.classList.contains('current')) { UI.displayRepositoryContent(); } } else { /* Handle state add fail, refund */ gainInsight(cost, "Refund: Suggest Error"); } }
}


// --- Category & Lore Logic ---
export function handleCategorizeCard(conceptId, categoryId) {
    const currentCategory = State.getCardCategory(conceptId); if (currentCategory === categoryId) return;
    if (State.setCardCategory(conceptId, categoryId)) { console.log(`Logic: Categorized card ${conceptId} as ${categoryId}`); UI.refreshGrimoireDisplay(); checkCategoryUnlocks(categoryId); checkAndUpdateRituals('categorizeCard', { categoryId: categoryId, conceptId: conceptId }); checkOnboardingInternal('categorizeCard', 5); }
    else { console.error(`Failed to set category for card ${conceptId}`); }
}
function checkCategoryUnlocks(categoryId) {
    if (!categoryDrivenUnlocks || categoryDrivenUnlocks.length === 0) return;
    console.log(`Logic: Checking category unlocks for category: ${categoryId}`);
    const discoveredMap = State.getDiscoveredConcepts(); const cardsInCategory = Array.from(discoveredMap.entries()).filter(([id, data]) => (data.userCategory || 'uncategorized') === categoryId).map(([id]) => id); const cardIdSetInCategory = new Set(cardsInCategory);
    categoryDrivenUnlocks.forEach(unlock => { if (unlock.categoryRequired === categoryId ) { let requirementsMet = true; if (!unlock.requiredInSameCategory || unlock.requiredInSameCategory.length === 0) requirementsMet = false; else { for (const reqId of unlock.requiredInSameCategory) { if (!cardIdSetInCategory.has(reqId)) { requirementsMet = false; break; } } } if (requirementsMet) { console.log(`Logic: Category unlock triggered: ${unlock.id}`); const reward = unlock.unlocks; let alreadyDone = false; if (reward.type === 'lore') { const currentLoreLevel = State.getUnlockedLoreLevel(reward.targetConceptId); if (reward.loreLevelToUnlock <= currentLoreLevel) alreadyDone = true; } if (!alreadyDone) { if (reward.type === 'lore') { if (unlockLoreInternal(reward.targetConceptId, reward.loreLevelToUnlock, `Category Unlock: ${unlock.description || unlock.id}`)) { UI.showTemporaryMessage(unlock.description || `New Lore Unlocked!`, 4000); } } else if (reward.type === 'insight') { gainInsight(reward.amount, `Category Unlock: ${unlock.description || unlock.id}`); UI.showTemporaryMessage(unlock.description || `Gained ${reward.amount} Insight!`, 3500); } } } } });
}
export function handleUnlockLore(conceptId, level, cost) {
    console.log(`Logic: Attempting to unlock lore level ${level} for concept ${conceptId} (Cost: ${cost})`);
    const concept = State.getDiscoveredConceptData(conceptId)?.concept; if (!concept) return;
    if (State.getUnlockedLoreLevel(conceptId) >= level) { UI.showTemporaryMessage("Lore already unlocked.", 2000); return; }
    if (spendInsight(cost, `Unlock Lore: ${concept.name} Lvl ${level}`)) { if(unlockLoreInternal(conceptId, level, `Insight Purchase`)) { checkOnboardingInternal('unlockLore', 6); } }
}
function unlockLoreInternal(conceptId, level, source = "Unknown") {
    if (State.unlockLoreLevel(conceptId, level)) { const conceptName = State.getDiscoveredConceptData(conceptId)?.concept?.name || `ID ${conceptId}`; console.log(`Logic: Unlocked lore level ${level} for ${conceptName} via ${source}`); if (getCurrentPopupConceptId() === conceptId && conceptDetailPopup && !conceptDetailPopup.classList.contains('hidden')) { requestAnimationFrame(() => { /* ... Update specific lore entry in popup ... */ }); } else { UI.refreshGrimoireDisplay(); } updateMilestoneProgress('unlockLore', level); return true; }
    else { console.error(`Logic Error: Failed to update lore level in state for ${conceptId}`); return false; }
}


// --- Synergy/Tension & Tapestry Calculation Logic (Includes RF) ---
export function checkSynergyTensionStatus() { calculateTapestryNarrative(true); let status = 'none'; if (currentTapestryAnalysis) { const hasSynergy = currentTapestryAnalysis.synergies.length > 0; const hasTension = currentTapestryAnalysis.tensions.length > 0; if (hasSynergy && hasTension) status = 'both'; else if (hasSynergy) status = 'synergy'; else if (hasTension) status = 'tension'; } UI.updateExploreSynergyButtonStatus(status); return status; }
export function handleExploreSynergyClick() { if (!currentTapestryAnalysis) { UI.showTemporaryMessage("Focus concepts first.", 3000); return; } UI.displaySynergyTensionInfo(currentTapestryAnalysis); }
export function calculateFocusScores() { const scores = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0, RF: 0 }; const focused = State.getFocusedConcepts(); const disc = State.getDiscoveredConcepts(); const count = focused.size; if (count > 0) { focused.forEach(id => { const data = disc.get(id); if (data?.concept?.elementScores) { for (const key in scores) { if (data.concept.elementScores.hasOwnProperty(key)) scores[key] += data.concept.elementScores[key]; else scores[key] += 5; } } }); for (const key in scores) scores[key] /= count; } else { Object.keys(scores).forEach(key => scores[key] = 5.0); } return { focusScores: scores, focusCount: count }; }
export function calculateTapestryNarrative(forceRecalculate = false) { const stateHash = State.getState().currentFocusSetHash; const currentCalculatedHash = _calculateFocusSetHash(); if (currentTapestryAnalysis && !forceRecalculate && currentCalculatedHash === stateHash) { return currentTapestryAnalysis.fullNarrativeHTML; } console.log("Logic: Recalculating tapestry narrative (7 Elements)..."); const focused = State.getFocusedConcepts(); const focusCount = focused.size; if (focusCount === 0) { currentTapestryAnalysis = { synergies: [], tensions: [], dominantElements: [], dominantCardTypes: [], elementThemes: [], cardTypeThemes: [], essenceTitle: "Empty Canvas", balanceComment: "", fullNarrativeRaw: "", fullNarrativeHTML: 'Mark concepts as "Focus" from the Workshop to weave your narrative.' }; State.getState().currentFocusSetHash = ''; return currentTapestryAnalysis.fullNarrativeHTML; } const disc = State.getDiscoveredConcepts(); const { focusScores } = calculateFocusScores(); const analysis = { dominantElements: [], elementThemes: [], dominantCardTypes: [], cardTypeThemes: [], synergies: [], tensions: [], essenceTitle: "Balanced", balanceComment: "", fullNarrativeRaw: "", fullNarrativeHTML: "" }; const sortedElements = Object.entries(focusScores).filter(([key, score]) => score > 3.5).sort(([, a], [, b]) => b - a); if (sortedElements.length > 0) { analysis.dominantElements = sortedElements.map(([key, score]) => ({ key: key, name: Utils.getElementShortName(elementKeyToFullName[key]), score: score })); const topElementKeys = analysis.dominantElements.slice(0, 3).map(e => e.key).sort().join(''); const themeKey = topElementKeys.length > 1 ? topElementKeys : (topElementKeys.length === 1 ? analysis.dominantElements[0].key : null); if (themeKey && elementInteractionThemes && elementInteractionThemes[themeKey]) { analysis.elementThemes.push(elementInteractionThemes[themeKey]); } else if (analysis.dominantElements.length > 0) { analysis.elementThemes.push(`a strong emphasis on **${analysis.dominantElements[0].name}**.`); } if (analysis.dominantElements.length >= 2 && analysis.dominantElements[0].score > 6.5 && analysis.dominantElements[1].score > 5.5) { analysis.essenceTitle = `${analysis.dominantElements[0].name}/${analysis.dominantElements[1].name} Blend`; } else if (analysis.dominantElements.length >= 1 && analysis.dominantElements[0].score > 6.5) { analysis.essenceTitle = `${analysis.dominantElements[0].name} Focus`; } else { analysis.essenceTitle = "Developing"; } } else { analysis.essenceTitle = "Subtle"; } const typeCounts = {}; cardTypeKeys.forEach(type => typeCounts[type] = 0); focused.forEach(id => { const type = disc.get(id)?.concept?.cardType; if (type && typeCounts.hasOwnProperty(type)) { typeCounts[type]++; } }); analysis.dominantCardTypes = Object.entries(typeCounts).filter(([type, count]) => count > 0).sort(([, a], [, b]) => b - a).map(([type, count]) => ({ type, count })); if (analysis.dominantCardTypes.length > 0) { const topType = analysis.dominantCardTypes[0].type; if (cardTypeThemes && cardTypeThemes[topType]) { analysis.cardTypeThemes.push(cardTypeThemes[topType]); } } const checkedPairs = new Set(); focused.forEach(idA => { const conceptA = disc.get(idA)?.concept; if (!conceptA?.relatedIds) return; focused.forEach(idB => { if (idA === idB) return; const pairKey = [idA, idB].sort().join('-'); if (checkedPairs.has(pairKey)) return; if (conceptA.relatedIds.includes(idB)) { const conceptB = disc.get(idB)?.concept; if (conceptB) { analysis.synergies.push({ concepts: [conceptA.name, conceptB.name], text: `The connection between **${conceptA.name}** and **${conceptB.name}** suggests a reinforcing dynamic.` }); } } checkedPairs.add(pairKey); }); }); const highThreshold = 7.0; const lowThreshold = 3.0; const focusConceptsData = Array.from(focused).map(id => disc.get(id)?.concept).filter(Boolean); if (focusConceptsData.length >= 2) { for (const key of Object.keys(elementKeyToFullName)) { const elementName = Utils.getElementShortName(elementKeyToFullName[key]); let hasHigh = focusConceptsData.some(c => c.elementScores?.[key] >= highThreshold); let hasLow = focusConceptsData.some(c => c.elementScores?.[key] <= lowThreshold); if (hasHigh && hasLow) { const highConcepts = focusConceptsData.filter(c => c.elementScores?.[key] >= highThreshold).map(c => c.name); const lowConcepts = focusConceptsData.filter(c => c.elementScores?.[key] <= lowThreshold).map(c => c.name); analysis.tensions.push({ element: elementName, text: `A potential tension exists within **${elementName}**: concepts like **${highConcepts.join(', ')}** lean high, while **${lowConcepts.join(', ')}** lean low.` }); } } } const scores = Object.values(focusScores); const minScore = Math.min(...scores); const maxScore = Math.max(...scores); const range = maxScore - minScore; if (range <= 2.5 && focusCount > 2) analysis.balanceComment = "The focused elements present a relatively balanced profile."; else if (range >= 5.0 && focusCount > 2) analysis.balanceComment = "There's a notable range in elemental emphasis within your focus."; let narrative = `Current Essence: **${analysis.essenceTitle}**. `; if (analysis.dominantElements.length > 0) { narrative += `Your tapestry currently resonates with ${analysis.elementThemes.join(' ')} `; } else { narrative += "Your focus presents a unique and subtle balance across the elements. "; } if (analysis.dominantCardTypes.length > 0) { narrative += `The lean towards ${analysis.cardTypeThemes.join(' ')} shapes the expression. `; } if (analysis.balanceComment) narrative += analysis.balanceComment + " "; if (analysis.synergies.length > 0) { narrative += ` **Synergies** are reinforcing certain themes. `; } if (analysis.tensions.length > 0) { narrative += ` Potential **Tensions** offer areas for deeper exploration. `; } analysis.fullNarrativeRaw = narrative.trim(); analysis.fullNarrativeHTML = analysis.fullNarrativeRaw.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); currentTapestryAnalysis = analysis; State.getState().currentFocusSetHash = currentCalculatedHash; console.log("Logic: Recalculated Tapestry Analysis (7 Elements) and updated state hash."); return analysis.fullNarrativeHTML; }
export function calculateFocusThemes() { const focused = State.getFocusedConcepts(); const disc = State.getDiscoveredConcepts(); if (focused.size === 0) return []; const counts = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0, RF: 0 }; const threshold = 7.0; focused.forEach(id => { const concept = disc.get(id)?.concept; if (concept?.elementScores) { for (const key in concept.elementScores) { if (counts.hasOwnProperty(key) && concept.elementScores[key] >= threshold) { counts[key]++; } } } }); const sorted = Object.entries(counts).filter(([key, count]) => count > 0 && elementKeyToFullName[key]).sort(([, a], [, b]) => b - a).map(([key, count]) => ({ key: key, name: Utils.getElementShortName(elementKeyToFullName[key]), count: count })); return sorted; }


// --- Focus Unlocks (Checks RF) ---
export function checkForFocusUnlocks(silent = false) {
     console.log("Logic: Checking focus unlocks..."); let newlyUnlocked = false;
     const focused = State.getFocusedConcepts(); const unlocked = State.getUnlockedFocusItems(); const scores = State.getScores();
     focusDrivenUnlocks.forEach(unlock => {
         if (unlocked.has(unlock.id)) return; let met = true;
         if (!unlock.requiredFocusIds || unlock.requiredFocusIds.length === 0) { met = false; } else { for (const reqId of unlock.requiredFocusIds) { if (!focused.has(reqId)) { met = false; break; } } }
         if (met && unlock.requiredRoleFocusScore !== undefined && (scores.RF || 0) < unlock.requiredRoleFocusScore) { met = false; }
         if (met && unlock.requiredRoleFocusScoreBelow !== undefined && (scores.RF || 0) >= unlock.requiredRoleFocusScoreBelow) { met = false; }
         if (met) { if (State.addUnlockedFocusItem(unlock.id)) { newlyUnlocked = true; const item = unlock.unlocks; let name = item.name || `ID ${item.id}`; let notif = unlock.description || `Unlocked ${name}`; if (item.type === 'scene') { if (State.addRepositoryItem('scenes', item.id)) { notif += ` View in Repo.`; } else notif += ` (Already Discovered)`; } else if (item.type === 'experiment') { notif += ` Check Repo for availability.`; } else if (item.type === 'insightFragment') { if (State.addRepositoryItem('insights', item.id)) { const iData = elementalInsights.find(i => i.id === item.id); name = iData ? `"${iData.text}"` : `ID ${item.id}`; notif += ` View in Repo.`; updateMilestoneProgress('repositoryInsightsCount', State.getRepositoryItems().insights.size); } else notif += ` (Already Discovered)`; } if (!silent) UI.showTemporaryMessage(`Focus Synergy: ${notif}`, 5000); } }
     });
     if (newlyUnlocked && !silent) { console.log("Logic: New Focus Unlocks:", Array.from(State.getUnlockedFocusItems())); if (repositoryScreen?.classList.contains('current')) UI.displayRepositoryContent(); if (personaScreen?.classList.contains('current')) UI.generateTapestryNarrative(); }
}

// --- Tapestry Deep Dive Logic ---
export function showTapestryDeepDive() { if (State.getFocusedConcepts().size === 0) { UI.showTemporaryMessage("Focus on concepts first.", 3000); return; } calculateTapestryNarrative(true); if (!currentTapestryAnalysis) { console.error("Failed to generate analysis."); UI.showTemporaryMessage("Error analyzing Tapestry.", 3000); return; } UI.displayTapestryDeepDive(currentTapestryAnalysis); }
export function handleDeepDiveNodeClick(nodeId) { if (!currentTapestryAnalysis) { UI.updateDeepDiveContent("<p>Error: Analysis unavailable.</p>", nodeId); return; } console.log(`Logic: Handling Deep Dive node click: ${nodeId}`); let content = `<p><em>Analysis for '${nodeId}'...</em></p>`; try { switch (nodeId) { case 'elemental': /* ... generate elemental content ... */ break; case 'archetype': /* ... generate archetype content ... */ break; case 'synergy': /* ... generate synergy/tension content ... */ break; default: content = `<p><em>Analysis node '${nodeId}' not recognized.</em></p>`; } } catch (error) { console.error(`Error generating content for node ${nodeId}:`, error); content = `<p>Error generating analysis.</p>`; } UI.updateDeepDiveContent(content, nodeId); }
export function handleContemplationNodeClick() { const cooldownEnd = State.getContemplationCooldownEnd(); if (cooldownEnd && Date.now() < cooldownEnd) { UI.showTemporaryMessage("Contemplation cooling down.", 2500); UI.updateContemplationButtonState(); return; } if (spendInsight(Config.CONTEMPLATION_COST, "Focused Contemplation")) { const contemplation = generateFocusedContemplation(); if (contemplation) { UI.displayContemplationTask(contemplation); State.setContemplationCooldown(Date.now() + Config.CONTEMPLATION_COOLDOWN); checkAndUpdateRituals('contemplateFocus'); } else { UI.updateDeepDiveContent("<p><em>Could not generate task.</em></p>", 'contemplation'); gainInsight(Config.CONTEMPLATION_COST, "Refund: Contemplation Fail"); } UI.updateContemplationButtonState(); } else { UI.updateContemplationButtonState(); } }
function generateFocusedContemplation() { if (!currentTapestryAnalysis) return null; const focused = State.getFocusedConcepts(); const disc = State.getDiscoveredConcepts(); const focusedConceptsArray = Array.from(focused).map(id => disc.get(id)?.concept).filter(Boolean); let task = { type: "Default", text: "Reflect on your current focus.", reward: { type: 'insight', amount: 2 }, requiresCompletionButton: true }; try { const taskOptions = []; if (currentTapestryAnalysis.tensions.length > 0) { /* ... add tension task ... */ } if (currentTapestryAnalysis.synergies.length > 0) { /* ... add synergy task ... */ } if (currentTapestryAnalysis.dominantElements.length > 0 && currentTapestryAnalysis.dominantElements[0].score > 7.0) { /* ... add dominant element task ... */ } if (focusedConceptsArray.length > 0) { /* ... add tapestry resonance task ... */ } let selectedTaskOption = null; /* ... select task logic ... */ if (selectedTaskOption) { task = selectedTaskOption; /* ... handle immediate rewards/attunement ... */ } } catch (error) { console.error("Error generating contemplation task:", error); return { type: "Error", text: "Error during generation.", reward: { type: 'none' }, requiresCompletionButton: false }; } console.log(`Generated contemplation task: ${task.type}`); return task; }
export function handleCompleteContemplation(task) { if (!task || !task.reward || !task.requiresCompletionButton) return; console.log(`Contemplation task completed: ${task.type}`); if (task.reward.type === 'insight' && task.reward.amount > 0) { gainInsight(task.reward.amount, `Contemplation Task: ${task.type}`); } UI.showTemporaryMessage("Contemplation complete!", 2500); UI.clearContemplationTask(); }

// --- Elemental Dilemma Logic ---
export function handleElementalDilemmaClick() { const availableDilemmas = elementalDilemmas; if (!availableDilemmas || availableDilemmas.length === 0) { UI.showTemporaryMessage("No dilemmas available.", 3000); return; } currentDilemma = availableDilemmas[Math.floor(Math.random() * availableDilemmas.length)]; UI.displayElementalDilemma(currentDilemma); }
export function handleConfirmDilemma() { const modal = getElement('dilemmaModal'); const slider = getElement('dilemmaSlider'); const nudgeCheckbox = getElement('dilemmaNudgeCheckbox'); if (!modal || !slider || !nudgeCheckbox || !currentDilemma) { UI.hidePopups(); return; } const sliderValue = parseFloat(slider.value); const nudgeAllowed = nudgeCheckbox.checked; const keyMin = currentDilemma.elementKeyMin; const keyMax = currentDilemma.elementKeyMax; console.log(`Dilemma ${currentDilemma.id} confirmed. Value: ${sliderValue}, Nudge: ${nudgeAllowed}`); gainInsight(3, `Dilemma Choice: ${currentDilemma.id}`); if (nudgeAllowed) { const scores = State.getScores(); const newScores = { ...scores }; let nudged = false; const maxNudgeEffect = Config.SCORE_NUDGE_AMOUNT * 1.5; const proportionMin = (10 - sliderValue) / 10; const proportionMax = sliderValue / 10; const nudgeMin = proportionMin * maxNudgeEffect - (proportionMax * maxNudgeEffect * 0.3); const nudgeMax = proportionMax * maxNudgeEffect - (proportionMin * maxNudgeEffect * 0.3); if (keyMin && newScores[keyMin] !== undefined) { const originalMin = newScores[keyMin]; newScores[keyMin] = Math.max(0, Math.min(10, newScores[keyMin] + nudgeMin)); if (newScores[keyMin] !== originalMin) nudged = true; } if (keyMax && newScores[keyMax] !== undefined) { const originalMax = newScores[keyMax]; newScores[keyMax] = Math.max(0, Math.min(10, newScores[keyMax] + nudgeMax)); if (newScores[keyMax] !== originalMax) nudged = true; } if (nudged) { State.updateScores(newScores); console.log("Nudged Scores after Dilemma:", State.getScores()); if(personaScreen?.classList.contains('current')) UI.displayPersonaScreen(); UI.showTemporaryMessage("Dilemma choice influenced core understanding.", 3500); gainAttunementForAction('dilemmaNudge', 'All'); updateMilestoneProgress('scoreNudgeApplied', 1); } } UI.hidePopups(); currentDilemma = null; }

// --- Daily Login ---
export function checkForDailyLogin() { const today = new Date().toDateString(); const lastLogin = State.getState().lastLoginDate; if (lastLogin !== today) { console.log("Logic: First login today. Resetting rituals."); State.resetDailyRituals(); gainInsight(5.0, "Daily Bonus"); UI.showTemporaryMessage("Daily Rituals Reset. Free Research Available!", 3500); if(workshopScreen?.classList.contains('current')) { UI.displayWorkshopScreenContent(); } if(repositoryScreen?.classList.contains('current')) { UI.displayRepositoryContent(); } } else { console.log("Logic: Already logged in today."); if(workshopScreen?.classList.contains('current')) { UI.displayWorkshopScreenContent(); } } }

// --- Rituals & Milestones Logic ---
export function checkAndUpdateRituals(action, details = {}) {
    let ritualCompletedThisCheck = false;
    const currentState = State.getState();
    const completedToday = currentState.completedRituals.daily || {};
    const focused = currentState.focusedConcepts;
    const scores = currentState.userScores; // Needed for RF checks

    let currentRitualPool = [...dailyRituals];
    if (focusRituals) {
        focusRituals.forEach(ritual => {
            let focusMet = true;
            if (ritual.requiredFocusIds && Array.isArray(ritual.requiredFocusIds)) { for (const id of ritual.requiredFocusIds) { if (!focused.has(id)) { focusMet = false; break; } } }
            if (focusMet && ritual.requiredRoleFocusScore !== undefined && (scores.RF || 0) < ritual.requiredRoleFocusScore) { focusMet = false; }
            if (focusMet && ritual.requiredRoleFocusScoreBelow !== undefined && (scores.RF || 0) >= ritual.requiredRoleFocusScoreBelow) { focusMet = false; }
            if (focusMet) { currentRitualPool.push({ ...ritual, isFocusRitual: true, period: 'daily' }); }
        });
    }

    currentRitualPool.forEach(ritual => {
        const completedData = completedToday[ritual.id] || { completed: false, progress: 0 };
        if (completedData.completed) return; // Skip completed
        const track = ritual.track; let triggerMet = false;
        if (track.action === action) {
            triggerMet = true;
            // Check additional details if specified
            if (track.contextMatch && details.contextMatch !== track.contextMatch) triggerMet = false;
            if (track.categoryId && details.categoryId !== track.categoryId) triggerMet = false;
            if (track.rarity && details.rarity !== track.rarity) triggerMet = false;
            if (track.conceptType && details.conceptId) { const conceptData = State.getDiscoveredConceptData(details.conceptId)?.concept; if (!conceptData || conceptData.cardType !== track.conceptType) triggerMet = false; }
        }
        if (triggerMet) {
             const progress = State.completeRitualProgress(ritual.id, 'daily');
             const requiredCount = track.count || 1;
             if (progress >= requiredCount) {
                 console.log(`Logic: Ritual Completed: ${ritual.description}`);
                 State.markRitualComplete(ritual.id, 'daily'); ritualCompletedThisCheck = true;
                 if (ritual.reward) { /* Grant reward */
                    if (ritual.reward.type === 'insight') gainInsight(ritual.reward.amount || 0, `Ritual: ${ritual.description}`);
                    else if (ritual.reward.type === 'attunement') gainAttunementForAction('ritual', ritual.reward.element || 'All', ritual.reward.amount || 0);
                    // Add other reward types
                 }
             }
        }
    });
    if (ritualCompletedThisCheck && document.getElementById('repositoryScreen')?.classList.contains('current')) { UI.displayDailyRituals(); }
}

export function updateMilestoneProgress(trackType, currentValue) {
     let milestoneAchievedThisUpdate = false;
     const achievedSet = State.getState().achievedMilestones;
     if (!(achievedSet instanceof Set)) { console.error("CRITICAL ERROR: gameState.achievedMilestones is not a Set!"); return; }

     milestones.forEach(m => {
         if (achievedSet.has(m.id)) return; // Skip achieved
         let achieved = false; const track = m.track; const threshold = track.threshold;

         // Action-based checks
         if (track.action === trackType) {
             if (typeof currentValue === 'number' && currentValue >= (track.count || 1)) achieved = true;
             else if ((!track.count || track.count === 1) && currentValue) achieved = true; // Simple trigger
         }
         // State-based checks
         else if (track.state === trackType) {
             const state = State.getState(); const scores = state.userScores; const att = state.elementAttunement; const lvls = state.unlockedDeepDiveLevels; let checkValue = null;
             if (trackType === 'elementAttunement') {
                 const attToCheck = (typeof currentValue === 'object' && currentValue !== null) ? currentValue : att;
                 if (track.element && attToCheck.hasOwnProperty(track.element)) { checkValue = attToCheck[track.element]; }
                 else if (track.condition === 'any') { achieved = Object.values(attToCheck).some(v => v >= threshold); }
                 else if (track.condition === 'all') { const allKeys = Object.keys(att); achieved = allKeys.length === elementNames.length && allKeys.every(key => attToCheck[key] >= threshold); }
             } else if (trackType === 'unlockedDeepDiveLevels') {
                  const levelsToCheck = (typeof currentValue === 'object' && currentValue !== null) ? currentValue : lvls;
                  if (track.condition === 'any') achieved = Object.values(levelsToCheck).some(v => v >= threshold);
                  else if (track.condition === 'all') { const allKeys = Object.keys(lvls); achieved = allKeys.length === elementNames.length && allKeys.every(key => levelsToCheck[key] >= threshold); }
             } else if (trackType === 'discoveredConcepts.size') checkValue = State.getDiscoveredConcepts().size;
             else if (trackType === 'focusedConcepts.size') checkValue = State.getFocusedConcepts().size;
             else if (trackType === 'repositoryInsightsCount') checkValue = State.getRepositoryItems().insights.size;
             else if (trackType === 'focusSlotsTotal') checkValue = State.getFocusSlots();
             else if (trackType === 'repositoryContents' && track.condition === "allTypesPresent") { const i = State.getRepositoryItems(); achieved = i.scenes.size > 0 && i.experiments.size > 0 && i.insights.size > 0; }
             else if (trackType === 'unlockLore') { if (track.condition === 'anyLevel' && typeof currentValue === 'number' && currentValue >= threshold) { achieved = true; } else if (track.condition === 'level3' && typeof currentValue === 'number' && currentValue >= 3) { achieved = true; } }
             else if (trackType === 'roleFocusScore' && track.condition === 'above' && (scores.RF || 0) >= threshold) { achieved = true; }
             else if (trackType === 'roleFocusScore' && track.condition === 'below' && (scores.RF || 0) <= threshold) { achieved = true; }
             if (!achieved && checkValue !== null && typeof checkValue === 'number' && checkValue >= threshold) { achieved = true; }
         }

         if (achieved) { if (State.addAchievedMilestone(m.id)) { milestoneAchievedThisUpdate = true; UI.showMilestoneAlert(m.description); if (m.reward) { /* Grant reward (including discoverMultipleCards) */ if (m.reward.type === 'insight') gainInsight(m.reward.amount || 0, `Milestone: ${m.description}`); else if (m.reward.type === 'attunement') gainAttunementForAction('milestone', m.reward.element || 'All', m.reward.amount || 0); else if (m.reward.type === 'increaseFocusSlots') { const inc = m.reward.amount || 1; if (State.increaseFocusSlots(inc)) { UI.updateFocusSlotsDisplay(); updateMilestoneProgress('focusSlotsTotal', State.getFocusSlots()); } } else if (m.reward.type === 'discoverCard') { const cId = m.reward.cardId; if (cId && !State.getDiscoveredConcepts().has(cId)) { const cDisc = concepts.find(c => c.id === cId); if (cDisc) { addConceptToGrimoireInternal(cId, 'milestone'); UI.showTemporaryMessage(`Milestone Reward: Discovered ${cDisc.name}!`, 3500); } } } else if (m.reward.type === 'discoverMultipleCards') { if(Array.isArray(m.reward.cardIds)) { let names = []; m.reward.cardIds.forEach(cId => { if (cId && !State.getDiscoveredConcepts().has(cId)) { const cDisc = concepts.find(c => c.id === cId); if (cDisc) { addConceptToGrimoireInternal(cId, 'milestone'); names.push(cDisc.name); } } }); if (names.length > 0) UI.showTemporaryMessage(`Milestone Reward: Discovered ${names.join(' & ')}!`, 3500); } } } } }
     });
     if (milestoneAchievedThisUpdate && document.getElementById('repositoryScreen')?.classList.contains('current')) { UI.displayRepositoryContent(); }
}

console.log("gameLogic.js loaded. (Enhanced v4)");
// --- END OF FULL and COMPLETE gameLogic.js ---
