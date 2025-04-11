// --- START OF FULL gameLogic.js ---

// js/gameLogic.js - Application Logic

import * as State from './state.js';
import * as Config from './config.js';
import * as Utils from './utils.js';
import * as UI from './ui.js';
// Import specific data structures needed
import {
    elementDetails, elementKeyToFullName, elementNameToKey, concepts, questionnaireGuided,
    reflectionPrompts, elementDeepDive, dailyRituals, milestones, focusRituals,
    sceneBlueprints, alchemicalExperiments, elementalInsights, focusDrivenUnlocks,
    cardTypeKeys, elementNames, elementInteractionThemes, cardTypeThemes,
    categoryDrivenUnlocks, grimoireShelves, elementalDilemmas // Added imports
} from '../data.js';

console.log("gameLogic.js loading...");

// --- Temporary State ---
let currentlyDisplayedConceptId = null;
let currentReflectionContext = null;
let reflectionTargetConceptId = null;
let currentReflectionCategory = null;
let currentPromptId = null;
let reflectionCooldownTimeout = null; // Used for *reflection* prompt cooldown, not contemplation
let currentDilemma = null; // Store the currently displayed dilemma

// --- Tapestry Analysis Cache ---
let currentTapestryAnalysis = null; // Stores the detailed breakdown from calculateTapestryNarrative

// --- Exported Functions ---

// --- Initialization & Core State ---
export function clearPopupState() {
    currentlyDisplayedConceptId = null;
    currentReflectionContext = null;
    reflectionTargetConceptId = null;
    currentReflectionCategory = null;
    currentPromptId = null;
    currentDilemma = null; // Clear dilemma state too
    // Don't clear currentTapestryAnalysis here, it's linked to focus set
}
export function setCurrentPopupConcept(conceptId) { currentlyDisplayedConceptId = conceptId; }
export function getCurrentPopupConceptId() { return currentlyDisplayedConceptId; }


// --- Insight & Attunement Management ---
export function gainInsight(amount, source = "Unknown") {
    if (typeof amount !== 'number' || isNaN(amount) || amount === 0) return;
    const changed = State.changeInsight(amount);
    if (changed) {
        const action = amount > 0 ? "Gained" : "Spent";
        const currentInsight = State.getInsight();
        console.log(`${action} ${Math.abs(amount).toFixed(1)} Insight from ${source}. New total: ${currentInsight.toFixed(1)}`);
        UI.updateInsightDisplays(); // Update UI after insight change
    }
}
// Helper function to count undiscovered concepts by rarity for a specific element
export function countUndiscoveredByRarity(elementKey) {
    const discoveredIds = new Set(State.getDiscoveredConcepts().keys());
    const counts = { common: 0, uncommon: 0, rare: 0 };

    concepts.forEach(concept => {
        if (!discoveredIds.has(concept.id)) {
            // Check if the concept is relevant to the element (Primary or high score)
            // You might adjust this relevance logic if needed
            const isPrimary = concept.primaryElement === elementKey;
            const score = concept.elementScores?.[elementKey] || 0;
            const isRelevant = isPrimary || score >= 5.0; // Example relevance threshold

            if (isRelevant) {
                const rarity = concept.rarity || 'common';
                if (counts.hasOwnProperty(rarity)) {
                    counts[rarity]++;
                }
            }
        }
    });
    return counts;
}
export function spendInsight(amount, source = "Unknown") {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return false;
    if (State.getInsight() >= amount) {
        gainInsight(-amount, source); // Will trigger UI update via gainInsight
        return true;
    } else {
        UI.showTemporaryMessage(`Not enough Insight! Need ${amount.toFixed(1)}.`, 3000);
        return false;
    }
}

export function gainAttunementForAction(actionType, elementKey = null, amount = 0.5) {
    let targetKeys = [];
    let baseAmount = amount;

    // Determine target element(s) based on action and context
    if (elementKey && State.getAttunement().hasOwnProperty(elementKey)) {
        targetKeys.push(elementKey);
    } else if (actionType === 'completeReflection' && ['Standard', 'SceneMeditation', 'RareConcept'].includes(currentReflectionContext)) {
         // Determine element from context if possible
         let keyFromContext = null;
         if (currentReflectionContext === 'Standard' && currentReflectionCategory) {
              keyFromContext = elementNameToKey[currentReflectionCategory];
         } else if (currentReflectionContext === 'SceneMeditation') {
              const scene = sceneBlueprints.find(s => s.reflectionPromptId === currentPromptId);
              keyFromContext = scene?.element || null;
         } else if (currentReflectionContext === 'RareConcept') {
              const cEntry = Array.from(State.getDiscoveredConcepts().entries()).find(([id, data]) => data.concept.uniquePromptId === currentPromptId);
              keyFromContext = cEntry ? cEntry[1].concept.primaryElement : null;
         }
         // Prioritize context-derived key, fallback to passed elementKey if context is missing/invalid
         if (keyFromContext && State.getAttunement().hasOwnProperty(keyFromContext)) {
              targetKeys.push(keyFromContext);
         } else if (elementKey && State.getAttunement().hasOwnProperty(elementKey)) {
              targetKeys.push(elementKey); // Fallback if context key invalid
         } else {
             console.warn(`Could not determine target element for reflection context: ${currentReflectionContext}, category: ${currentReflectionCategory}, prompt: ${currentPromptId}`);
             targetKeys = Object.keys(State.getAttunement()); // Fallback to all elements with reduced gain
             baseAmount = 0.1;
         }

    } else if (['generic', 'completeReflectionGeneric', 'scoreNudge', 'ritual', 'milestone', 'experimentSuccess', 'addToGrimoire', 'discover', 'markFocus', 'contemplation', 'researchSuccess', 'researchFail', 'researchSpecial', 'dilemmaNudge'].includes(actionType) || elementKey === 'All') {
        // If action implies all elements or 'All' key is used
        targetKeys = Object.keys(State.getAttunement());
        // Adjust baseAmount based on specific global actions
        if (actionType === 'scoreNudge') baseAmount = (0.5 / (targetKeys.length || 1));
        else if (actionType === 'dilemmaNudge') baseAmount = (0.3 / (targetKeys.length || 1)); // Slightly less than reflection nudge
        else if (actionType === 'completeReflectionGeneric') baseAmount = 0.2;
        else if (actionType === 'generic') baseAmount = 0.1;
        else if (actionType === 'contemplation' && elementKey === 'All') baseAmount = 0.1; // Default for 'All' contemplation
        else if (actionType === 'contemplation' && elementKey !== 'All') baseAmount = 0.4; // Increased gain for specific element contemplation
        else if (actionType === 'researchSuccess') baseAmount = 0.8;
        else if (actionType === 'researchFail') baseAmount = 0.2;
        else if (actionType === 'researchSpecial') baseAmount = 1.0; // For finding rare items during research
    } else {
        console.warn(`gainAttunement called with invalid parameters or context: action=${actionType}, key=${elementKey}, context=${currentReflectionContext}, category=${currentReflectionCategory}`);
        return; // Exit if no valid target keys determined
    }

    // Apply attunement gain
    let changed = false;
    targetKeys.forEach(key => {
        if (State.updateAttunement(key, baseAmount)) { // Use state function to update
            changed = true;
            // Trigger milestone checks after successful update
            updateMilestoneProgress('elementAttunement', { [key]: State.getAttunement()[key] }); // Pass specific update
            updateMilestoneProgress('elementAttunement', State.getAttunement()); // Pass full state for 'all' conditions
        }
    });

    if (changed) {
        console.log(`Attunement updated (${actionType}, Key(s): ${targetKeys.join(',') || 'None'}) by ${baseAmount.toFixed(2)} per element.`);
        // Update Persona screen attunement display if it's the current screen
        if (document.getElementById('personaScreen')?.classList.contains('current')) {
           UI.displayElementAttunement();
       }
    }
}

// NEW: Handle Insight Boost Button Click
export function handleInsightBoostClick() {
    const cooldownEnd = State.getInsightBoostCooldownEnd();
    if (cooldownEnd && Date.now() < cooldownEnd) {
        UI.showTemporaryMessage("Insight boost is still cooling down.", 2000);
        return;
    }

    gainInsight(Config.INSIGHT_BOOST_AMOUNT, "Manual Boost");
    State.setInsightBoostCooldown(Date.now() + Config.INSIGHT_BOOST_COOLDOWN);
    UI.updateInsightBoostButtonState(); // Update the button immediately
    UI.showTemporaryMessage(`Gained ${Config.INSIGHT_BOOST_AMOUNT} Insight!`, 2500);
}


// --- Questionnaire Logic ---
export function handleQuestionnaireInputChange(event) {
    const input = event.target;
    const type = input.dataset.type;
    const currentState = State.getState();

    if (currentState.currentElementIndex < 0 || currentState.currentElementIndex >= elementNames.length) {
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
     const checkbox = event.target; const name = checkbox.name; const maxChoices = parseInt(checkbox.dataset.maxChoices || 2);
     const container = checkbox.closest('.checkbox-options'); if (!container) return;
     const checkedBoxes = container.querySelectorAll(`input[name="${name}"]:checked`);
     if (checkedBoxes.length > maxChoices) {
        UI.showTemporaryMessage(`Max ${maxChoices} options.`, 2500);
        checkbox.checked = false;
        // Trigger input change handler again to update state after unchecking
        handleQuestionnaireInputChange(event);
     } else {
        handleQuestionnaireInputChange(event);
     }
}

export function calculateElementScore(elementName, answersForElement) {
    const questions = questionnaireGuided[elementName] || []; let score = 5.0;
    questions.forEach(q => {
        const answer = answersForElement[q.qId]; let pointsToAdd = 0; const weight = q.scoreWeight || 1.0;
        if (q.type === 'slider') {
            const value = (answer !== undefined && !isNaN(parseFloat(answer))) ? parseFloat(answer) : q.defaultValue;
            const baseValue = q.defaultValue !== undefined ? q.defaultValue : 5; // Assume 5 if missing
            pointsToAdd = (value - baseValue) * weight;
        }
        else if (q.type === 'radio') {
            const opt = q.options.find(o => o.value === answer);
            pointsToAdd = opt ? (opt.points || 0) * weight : 0;
        }
        else if (q.type === 'checkbox' && Array.isArray(answer)) {
            answer.forEach(val => { const opt = q.options.find(o => o.value === val); pointsToAdd += opt ? (opt.points || 0) * weight : 0; });
        }
        score += pointsToAdd;
    });
    return Math.max(0, Math.min(10, score));
}

export function goToNextElement() {
    const currentState = State.getState();
    const currentAnswers = UI.getQuestionnaireAnswers();

    if (currentState.currentElementIndex >= 0 && currentState.currentElementIndex < elementNames.length) {
        const elementName = elementNames[currentState.currentElementIndex];
        State.updateAnswers(elementName, currentAnswers);
        console.log(`Saved answers for ${elementName}.`);
    } else { console.warn("goToNextElement called with invalid index:", currentState.currentElementIndex); }

    const nextIndex = currentState.currentElementIndex + 1;
    if (nextIndex >= elementNames.length) { finalizeQuestionnaire(); }
    else { State.updateElementIndex(nextIndex); UI.displayElementQuestions(nextIndex); }
}

export function goToPrevElement() {
    const currentState = State.getState();
    if (currentState.currentElementIndex > 0) {
        const currentAnswers = UI.getQuestionnaireAnswers();
        if (currentState.currentElementIndex < elementNames.length) {
             const elementName = elementNames[currentState.currentElementIndex];
             State.updateAnswers(elementName, currentAnswers);
             console.log(`Saved answers for ${elementName} before going back.`);
        }
        const prevIndex = currentState.currentElementIndex - 1;
        State.updateElementIndex(prevIndex);
        UI.displayElementQuestions(prevIndex);
    } else { console.log("Already at the first element."); }
}

export function finalizeQuestionnaire() {
    console.log("Finalizing scores...");
    const finalScores = {}; const allAnswers = State.getState().userAnswers;
    elementNames.forEach(elementName => { const score = calculateElementScore(elementName, allAnswers[elementName] || {}); const key = elementNameToKey[elementName]; if (key) { finalScores[key] = score; } else { console.warn(`No key found for element name: ${elementName}`); } });
    State.updateScores(finalScores);
    State.setQuestionnaireComplete(); // Marks done, saves state
    State.saveAllAnswers(allAnswers); // Save final answers
    determineStarterHandAndEssence();
    updateMilestoneProgress('completeQuestionnaire', 1);
    checkForDailyLogin();
    UI.updateInsightDisplays(); UI.updateFocusSlotsDisplay(); UI.updateGrimoireCounter(); UI.populateGrimoireFilters(); UI.displayDailyRituals(); UI.refreshGrimoireDisplay();
    calculateTapestryNarrative(true); // Calculate initial narrative
    checkSynergyTensionStatus(); // Check initial synergy
    UI.displayPersonaSummary(); // Display summary view content first
    console.log("Final User Scores:", State.getScores());
    UI.showScreen('personaScreen'); // Start on Persona screen
    UI.showTemporaryMessage("Experiment Complete! Explore your results.", 4000);
}


// --- Starter Hand ---
export function determineStarterHandAndEssence() { console.log("Determining starter hand..."); if (!concepts || !Array.isArray(concepts) || concepts.length === 0) { console.error("Concepts missing."); return; } const userScores = State.getScores(); let conceptsWithDistance = concepts.map(c => ({ ...c, distance: Utils.euclideanDistance(userScores, c.elementScores) })).filter(c => c.distance !== Infinity && !isNaN(c.distance)); if (conceptsWithDistance.length === 0) { console.error("Distance calculation failed or no valid concepts."); const defaultStarters = concepts.slice(0, 5); defaultStarters.forEach(c => { if (State.addDiscoveredConcept(c.id, c)) gainAttunementForAction('discover', c.primaryElement, 0.3); }); console.warn("Granted default starter concepts."); UI.updateGrimoireCounter(); return; } conceptsWithDistance.sort((a, b) => a.distance - b.distance); const candidates = conceptsWithDistance.slice(0, 25); const starterHand = []; const starterHandIds = new Set(); const targetHandSize = 7; const elementRepTarget = 4; const representedElements = new Set(); // Select top 4 closest concepts for sure
    for (const c of candidates) { if (starterHand.length >= 4) break; if (!starterHandIds.has(c.id)) { starterHand.push(c); starterHandIds.add(c.id); if (c.primaryElement) representedElements.add(c.primaryElement); } } // Prioritize representing elements and diversity
    for (const c of candidates) { if (starterHand.length >= targetHandSize) break; if (starterHandIds.has(c.id)) continue; const needsRep = c.primaryElement && representedElements.size < elementRepTarget && !representedElements.has(c.primaryElement); if (needsRep || starterHand.length < 5) { // Add if needed for representation or to fill minimum spots
        starterHand.push(c); starterHandIds.add(c.id); if (c.primaryElement) representedElements.add(c.primaryElement); } } // Fill remaining spots with closest available
    for (const c of candidates) { if (starterHand.length >= targetHandSize) break; if (!starterHandIds.has(c.id)) { starterHand.push(c); starterHandIds.add(c.id); } } console.log("Starter Hand Selected:", starterHand.map(c => c.name)); starterHand.forEach(c => { if (State.addDiscoveredConcept(c.id, c)) gainAttunementForAction('discover', c.primaryElement, 0.3); }); updateMilestoneProgress('discoveredConcepts.size', State.getDiscoveredConcepts().size); UI.updateGrimoireCounter(); }

// --- Core Actions (Research, Reflection, Focus, etc.) ---
// Screen Logic Wrappers
export function displayPersonaScreenLogic() { calculateTapestryNarrative(true); checkSynergyTensionStatus(); UI.displayPersonaScreen(); }
export function displayStudyScreenLogic() { UI.displayStudyScreenContent(); }

// Research Actions
export function handleResearchClick({ currentTarget, isFree = false }) {
    const button = currentTarget; const elementKey = button.dataset.elementKey; const cost = parseFloat(button.dataset.cost);
    if (!elementKey || isNaN(cost)) { console.error("Invalid research button data."); return; }
    if (button.classList.contains('disabled')) { console.log("Research button disabled."); return; }

    if (isFree && State.getInitialFreeResearchRemaining() > 0) {
        if (State.useInitialFreeResearch()) {
            console.log(`Used initial free research on ${elementKey}.`);
            conductResearch(elementKey);
            UI.displayStudyScreenContent(); // Refresh UI to show updated remaining count
        } else { console.warn("Attempted free research, but none remaining."); UI.showTemporaryMessage("No free research attempts left.", 3000); }
    } else {
        if (spendInsight(cost, `Research: ${elementKeyToFullName[elementKey]}`)) {
            console.log(`Spent ${cost} Insight on ${elementKey}.`);
            conductResearch(elementKey);
            updateMilestoneProgress('conductResearch', 1);
            checkAndUpdateRituals('conductResearch');
            UI.displayStudyScreenContent(); // Refresh UI (might change button costs/availability if attunement changes)
        }
    }
}
export function handleFreeResearchClick() { if (!State.isFreeResearchAvailable()) { UI.showTemporaryMessage("Daily meditation already performed.", 3000); return; } const attunement = State.getAttunement(); let targetKey = 'A'; // Default fallback
    let minAtt = Config.MAX_ATTUNEMENT + 1; for (const key in attunement) { if (attunement[key] < minAtt) { minAtt = attunement[key]; targetKey = key; } } console.log(`Free meditation on ${targetKey} (${elementKeyToFullName[targetKey]})`); State.setFreeResearchUsed(); UI.displayStudyScreenContent(); // Update button text
    conductResearch(targetKey); updateMilestoneProgress('freeResearch', 1); checkAndUpdateRituals('freeResearch'); }
export function conductResearch(elementKeyToResearch) { const elementFullName = elementKeyToFullName[elementKeyToResearch]; if (!elementFullName) { console.error(`Invalid key: ${elementKeyToResearch}`); return; } console.log(`Researching: ${elementFullName}`); UI.displayResearchStatus(`Reviewing ${elementDetails[elementFullName]?.name || elementFullName}...`); const discoveredIds = new Set(State.getDiscoveredConcepts().keys()); const discoveredRepo = State.getRepositoryItems(); const undiscoveredPool = concepts.filter(c => !discoveredIds.has(c.id)); let rareFound = false; const roll = Math.random(); const insightChance = 0.12; // Chance to find insight fragment
    const researchOutElem = document.getElementById('studyResearchDiscoveries'); const canFindRare = researchOutElem && (researchOutElem.children.length === 0 || (researchOutElem.children.length === 1 && researchOutElem.children[0].tagName === 'P')); let foundRepoItem = null; // Check for Insight Fragment
    if (!rareFound && canFindRare && roll < insightChance && elementalInsights.length > 0) { const relevant = elementalInsights.filter(i => i.element === elementKeyToResearch); const unseenRel = relevant.filter(i => !discoveredRepo.insights.has(i.id)); const anyUnseen = elementalInsights.filter(i => !discoveredRepo.insights.has(i.id)); const pool = unseenRel.length > 0 ? unseenRel : (anyUnseen.length > 0 ? anyUnseen : relevant); // Prioritize relevant unseen, then any unseen, then any relevant
        if (pool.length > 0) { const found = pool[Math.floor(Math.random() * pool.length)]; if (State.addRepositoryItem('insights', found.id)) { rareFound = true; foundRepoItem = {type: 'insight', ...found}; UI.showTemporaryMessage("Insight Fragment Found!", 3500); updateMilestoneProgress('repositoryInsightsCount', State.getRepositoryItems().insights.size); if(document.getElementById('repositoryScreen')?.classList.contains('current')) UI.displayRepositoryContent(); } } } // Check for Scene Blueprint (Lower chance)
    const sceneChance = 0.08; // Chance to find a scene blueprint
    if (!rareFound && canFindRare && roll > insightChance && roll < (insightChance + sceneChance) && sceneBlueprints.length > 0) { const availableScenes = sceneBlueprints.filter(s => !discoveredRepo.scenes.has(s.id)); if (availableScenes.length > 0) { const foundScene = availableScenes[Math.floor(Math.random() * availableScenes.length)]; if (State.addRepositoryItem('scenes', foundScene.id)) { rareFound = true; foundRepoItem = {type: 'scene', ...foundScene}; UI.showTemporaryMessage("Scene Blueprint Discovered!", 4000); if(document.getElementById('repositoryScreen')?.classList.contains('current')) UI.displayRepositoryContent(); } } } // Handle rare item found
    if (rareFound && foundRepoItem) { UI.displayResearchResults({ concepts: [], repositoryItems: [foundRepoItem], duplicateInsightGain: 0 }); UI.displayResearchStatus("Unique discovery unearthed!"); gainAttunementForAction('researchSpecial', elementKeyToResearch, 1.0); return; } // Handle no more concepts
    if (undiscoveredPool.length === 0) { UI.displayResearchStatus("No more concepts to discover."); if (researchOutElem && researchOutElem.children.length === 0) researchOutElem.innerHTML = '<p><i>Library holds all known concepts.</i></p>'; gainInsight(5.0, "All Concepts Bonus"); return; } // Normal Concept Discovery
    const currentAtt = State.getAttunement()[elementKeyToResearch] || 0; const priorityP = []; const secondaryP = []; const tertiaryP = []; undiscoveredPool.forEach(c => { const score = c.elementScores?.[elementKeyToResearch] || 0; const isPri = c.primaryElement === elementKeyToResearch; if (isPri || score >= 7.5) priorityP.push({...c}); else if (score >= 4.5) secondaryP.push({...c}); else tertiaryP.push({...c}); }); const selectedOut = []; let dupeGain = 0; const numResults = 3; // Select concepts
    const selectWeighted = () => { const pools = [ { pool: priorityP, mult: 3.5 + (currentAtt / 30) }, { pool: secondaryP, mult: 1.5 + (currentAtt / 60) }, { pool: tertiaryP, mult: 0.8 } ]; let combined = []; let totalW = 0; const attFactor = 1 + (currentAtt / (Config.MAX_ATTUNEMENT * 1.2)); pools.forEach(({ pool, mult }) => { pool.forEach(card => { let w = 1.0 * mult; if (card.rarity === 'uncommon') w *= (1.3 * attFactor); else if (card.rarity === 'rare') w *= (0.6 * attFactor); else w *= (1.0 * attFactor); w = Math.max(0.1, w); totalW += w; combined.push({ card, w }); }); }); if (combined.length === 0) return null; let pick = Math.random() * totalW; for (let i = 0; i < combined.length; i++) { const item = combined[i]; if (pick < item.w) { // Remove from original pool to avoid re-selection
        const foundInP = priorityP.findIndex(c => c.id === item.card.id); if(foundInP > -1) priorityP.splice(foundInP, 1); const foundInS = secondaryP.findIndex(c => c.id === item.card.id); if(foundInS > -1) secondaryP.splice(foundInS, 1); const foundInT = tertiaryP.findIndex(c => c.id === item.card.id); if(foundInT > -1) tertiaryP.splice(foundInT, 1); return item.card; } pick -= item.w; } // Fallback if calculation error
        const flatP = [...priorityP, ...secondaryP, ...tertiaryP]; if (flatP.length > 0) { const idx = Math.floor(Math.random() * flatP.length); const card = flatP[idx]; const foundInP = priorityP.findIndex(c => c.id === card.id); if(foundInP > -1) priorityP.splice(foundInP, 1); const foundInS = secondaryP.findIndex(c => c.id === card.id); if(foundInS > -1) secondaryP.splice(foundInS, 1); const foundInT = tertiaryP.findIndex(c => c.id === card.id); if(foundInT > -1) tertiaryP.splice(foundInT, 1); console.warn("Weighted selection failed, using fallback."); return card; } return null; }; let attempts = 0; const maxAtt = numResults * 4; while (selectedOut.length < numResults && attempts < maxAtt && (priorityP.length > 0 || secondaryP.length > 0 || tertiaryP.length > 0)) { attempts++; let potential = selectWeighted(); if (potential) { if (discoveredIds.has(potential.id)) { gainInsight(1.0, `Dupe (${potential.name})`); dupeGain += 1.0; } else { if (!selectedOut.some(c => c.id === potential.id)) selectedOut.push(potential); } } else break; // No more items in any pool
    } // Display results
    let msg = ""; if (selectedOut.length > 0) { msg = `Discovered ${selectedOut.length} new concept(s)! `; UI.displayResearchResults({ concepts: selectedOut, repositoryItems: [], duplicateInsightGain: dupeGain }); gainAttunementForAction('researchSuccess', elementKeyToResearch); if (selectedOut.some(c => c.rarity === 'rare')) updateMilestoneProgress('discoverRareCard', 1); } else { msg = "No new concepts found. "; UI.displayResearchResults({ concepts: [], repositoryItems: [], duplicateInsightGain: dupeGain }); gainAttunementForAction('researchFail', elementKeyToResearch); } if (dupeGain > 0 && selectedOut.length === 0) msg += ` Gained ${dupeGain.toFixed(0)} Insight from echoes.`; UI.displayResearchStatus(msg.trim()); }

// Grimoire Actions
export function addConceptToGrimoireById(conceptId, buttonElement = null) {
    if (State.getDiscoveredConcepts().has(conceptId)) { UI.showTemporaryMessage("Already in Grimoire.", 2500); if (buttonElement) UI.updateResearchButtonAfterAction(conceptId, 'add'); return; }
    const concept = concepts.find(c => c.id === conceptId); if (!concept) { console.error("Cannot add concept: Not found. ID:", conceptId); UI.showTemporaryMessage("Error: Concept not found.", 3000); return; }
    const distance = Utils.euclideanDistance(State.getScores(), concept.elementScores);
    const context = buttonElement?.closest('#studyResearchDiscoveries') ? 'discovery' : 'popup';

    if (distance > Config.DISSONANCE_THRESHOLD) { triggerReflectionPrompt('Dissonance', concept.id); }
    else { addConceptToGrimoireInternal(conceptId, context); }
 }
export function addConceptToGrimoireInternal(conceptId, context = 'unknown') { const conceptToAdd = concepts.find(c => c.id === conceptId); if (!conceptToAdd) { console.error("Internal add fail: Not found. ID:", conceptId); return; } if (State.getDiscoveredConcepts().has(conceptId)) return; console.log(`Adding ${conceptToAdd.name} internally. Context: ${context}`); if (State.addDiscoveredConcept(conceptId, conceptToAdd)) { let insightRwd = Config.CONCEPT_DISCOVERY_INSIGHT[conceptToAdd.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default; let bonusInsight = 0; let synergyMessageShown = false; // Check for synergy bonus/discovery
        if (conceptToAdd.relatedIds && conceptToAdd.relatedIds.length > 0) { const discoveredMap = State.getDiscoveredConcepts(); const undiscoveredRelated = conceptToAdd.relatedIds.filter(id => !discoveredMap.has(id)); for (const relatedId of conceptToAdd.relatedIds) { if (discoveredMap.has(relatedId)) { bonusInsight += Config.SYNERGY_INSIGHT_BONUS; if (!synergyMessageShown) { const relatedConcept = discoveredMap.get(relatedId)?.concept; UI.showTemporaryMessage(`Synergy Bonus: +${Config.SYNERGY_INSIGHT_BONUS.toFixed(1)} Insight (Related to ${relatedConcept?.name || 'a known concept'})`, 3500); synergyMessageShown = true; } } } // Chance to discover related concept
            if (undiscoveredRelated.length > 0 && Math.random() < Config.SYNERGY_DISCOVERY_CHANCE) { const relatedIdToDiscover = undiscoveredRelated[Math.floor(Math.random() * undiscoveredRelated.length)]; const relatedConceptData = concepts.find(c => c.id === relatedIdToDiscover); if (relatedConceptData) { UI.displayResearchResults({ concepts: [relatedConceptData], repositoryItems: [], duplicateInsightGain: 0 }); UI.showTemporaryMessage(`Synergy Resonance: Adding ${conceptToAdd.name} illuminated ${relatedConceptData.name}! Check Research Notes.`, 5000); console.log(`Synergy discovery: Revealed ${relatedConceptData.name} (ID: ${relatedIdToDiscover})`); } } } insightRwd += bonusInsight; gainInsight(insightRwd, `Discovered ${conceptToAdd.rarity} ${conceptToAdd.name}${bonusInsight > 0 ? ' (Synergy)' : ''}`); gainAttunementForAction('addToGrimoire', conceptToAdd.primaryElement, 0.6); UI.updateGrimoireCounter(); // Queue rare prompt if applicable
        if (conceptToAdd.rarity === 'rare' && conceptToAdd.uniquePromptId && reflectionPrompts.RareConcept?.[conceptToAdd.uniquePromptId]) { State.addPendingRarePrompt(conceptToAdd.uniquePromptId); console.log(`Queued rare prompt ${conceptToAdd.uniquePromptId}`); } // Update UI
        if (currentlyDisplayedConceptId === conceptId) { UI.showConceptDetailPopup(conceptId); } UI.updateResearchButtonAfterAction(conceptId, 'add'); // Trigger related game systems
        checkTriggerReflectionPrompt('add'); updateMilestoneProgress('addToGrimoire', 1); if (context === 'discovery') { updateMilestoneProgress('addToGrimoireFromResearch', 1); console.log("Tracked addToGrimoireFromResearch"); } updateMilestoneProgress('discoveredConcepts.size', State.getDiscoveredConcepts().size); checkAndUpdateRituals('addToGrimoire', { conceptId: conceptId, rarity: conceptToAdd.rarity, conceptType: conceptToAdd.cardType }); UI.refreshGrimoireDisplay(); UI.showTemporaryMessage(`${conceptToAdd.name} added to Grimoire!`, 3000); } else { console.warn(`State fail add ${conceptToAdd.name}.`); UI.showTemporaryMessage(`Error adding ${conceptToAdd.name}.`, 3000); } }
export function handleToggleFocusConcept() { if (currentlyDisplayedConceptId === null) return; handleCardFocusToggle(currentlyDisplayedConceptId); UI.updateFocusButtonStatus(currentlyDisplayedConceptId); }
export function handleCardFocusToggle(conceptId) { if (isNaN(conceptId)) return; const result = State.toggleFocusConcept(conceptId); const conceptName = State.getDiscoveredConceptData(conceptId)?.concept?.name || `ID ${conceptId}`; if (result === 'not_discovered') { UI.showTemporaryMessage("Concept not in Grimoire.", 3000); } else if (result === 'slots_full') { UI.showTemporaryMessage(`Focus slots full (${State.getFocusSlots()}).`, 3000); } else { if (result === 'removed') { UI.showTemporaryMessage(`${conceptName} removed from Focus.`, 2500); checkAndUpdateRituals('removeFocus'); } else { UI.showTemporaryMessage(`${conceptName} marked as Focus!`, 2500); gainInsight(1.0, `Focused on ${conceptName}`); const concept = State.getDiscoveredConceptData(conceptId)?.concept; if (concept?.primaryElement) gainAttunementForAction('markFocus', concept.primaryElement, 1.0); updateMilestoneProgress('markFocus', 1); updateMilestoneProgress('focusedConcepts.size', State.getFocusedConcepts().size); checkAndUpdateRituals('markFocus', { conceptId: conceptId }); } UI.refreshGrimoireDisplay(); calculateTapestryNarrative(true); // Recalculate narrative after focus change
        checkSynergyTensionStatus(); // Recalculate synergy/tension status
        if (document.getElementById('personaScreen')?.classList.contains('current')) { UI.displayFocusedConceptsPersona(); UI.generateTapestryNarrative(); UI.synthesizeAndDisplayThemesPersona(); } checkForFocusUnlocks(); UI.updateElementalDilemmaButtonState(); // Update buttons potentially affected by focus
        UI.updateSuggestSceneButtonState(); if (currentlyDisplayedConceptId === conceptId) { UI.updateFocusButtonStatus(conceptId); } } }
export function handleSellConcept(event) { const button = event.target.closest('button'); if (!button) return; const conceptId = parseInt(button.dataset.conceptId); const context = button.dataset.context; if (isNaN(conceptId)) { console.error("Invalid sell ID:", button.dataset.conceptId); return; } sellConcept(conceptId, context); }
export function sellConcept(conceptId, context) { const discovered = State.getDiscoveredConceptData(conceptId); const concept = discovered?.concept || concepts.find(c => c.id === conceptId); if (!concept) { console.error(`Sell fail: Not found ${conceptId}`); UI.showTemporaryMessage("Error selling.", 3000); return; } let val = Config.CONCEPT_DISCOVERY_INSIGHT[concept.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default; const sellVal = val * Config.SELL_INSIGHT_FACTOR; const sourceLoc = context === 'grimoire' ? 'Grimoire' : 'Research Notes'; if (confirm(`Sell '${concept.name}' (${concept.rarity}) from ${sourceLoc} for ${sellVal.toFixed(1)} Insight?`)) { gainInsight(sellVal, `Sold: ${concept.name}`); updateMilestoneProgress('sellConcept', 1); let focusChanged = false; if (context === 'grimoire' && discovered) { focusChanged = State.getFocusedConcepts().has(conceptId); if(State.removeDiscoveredConcept(conceptId)) { UI.updateGrimoireCounter(); UI.refreshGrimoireDisplay(); } } else if (context === 'discovery' || context === 'research') { // Also handle 'research' context if used
        UI.updateResearchButtonAfterAction(conceptId, 'sell'); } if (focusChanged) { calculateTapestryNarrative(true); checkSynergyTensionStatus(); if (document.getElementById('personaScreen')?.classList.contains('current')) { UI.displayFocusedConceptsPersona(); UI.generateTapestryNarrative(); UI.synthesizeAndDisplayThemesPersona(); } checkForFocusUnlocks(); UI.updateElementalDilemmaButtonState(); UI.updateSuggestSceneButtonState(); } UI.showTemporaryMessage(`Sold ${concept.name} for ${sellVal.toFixed(1)} Insight.`, 2500); if (currentlyDisplayedConceptId === conceptId) UI.hidePopups(); } }

// Reflection Logic
export function checkTriggerReflectionPrompt(triggerAction = 'other') {
    const currentState = State.getState(); if (currentState.promptCooldownActive) return;

    if (triggerAction === 'add') State.incrementReflectionTrigger();
    if (triggerAction === 'completeQuestionnaire') { State.incrementReflectionTrigger(); State.incrementReflectionTrigger(); State.incrementReflectionTrigger(); } // Force trigger after questionnaire

    const cardsAdded = currentState.cardsAddedSinceLastPrompt;
    const triggerThresh = 3;
    const hasPending = currentState.pendingRarePrompts.length > 0;

    if (hasPending) { console.log("Pending rare prompt found. Triggering."); triggerReflectionPrompt('RareConcept'); State.resetReflectionTrigger(true); startReflectionCooldown(); }
    else if (cardsAdded >= triggerThresh) { console.log("Reflection trigger threshold met. Triggering Standard."); triggerReflectionPrompt('Standard'); State.resetReflectionTrigger(true); startReflectionCooldown(); }
}
export function startReflectionCooldown() { if (reflectionCooldownTimeout) clearTimeout(reflectionCooldownTimeout); State.setPromptCooldownActive(true); reflectionCooldownTimeout = setTimeout(() => { State.clearReflectionCooldown(); console.log("Reflection cooldown ended."); reflectionCooldownTimeout = null; }, 1000 * 60 * 3); } // 3 minute cooldown
export function triggerReflectionPrompt(context = 'Standard', targetId = null, category = null) { currentReflectionContext = context; reflectionTargetConceptId = (context === 'Dissonance') ? targetId : null; currentReflectionCategory = category; currentPromptId = null; let promptPool = []; let title = "Moment for Reflection"; let promptCatLabel = "General"; let selPrompt = null; let showNudge = false; let reward = 5.0; console.log(`Trigger reflection: Context=${context}, Target=${targetId}, Category=${category}`); // Check for pending rare prompts first (unless explicitly triggering Dissonance/Scene)
    if (context !== 'Dissonance' && context !== 'SceneMeditation') { const nextRareId = State.getNextRarePrompt(); if (nextRareId) { selPrompt = reflectionPrompts.RareConcept?.[nextRareId]; if (selPrompt) { currentReflectionContext = 'RareConcept'; title = "Rare Concept Reflection"; const cEntry = Array.from(State.getDiscoveredConcepts().entries()).find(([id, data]) => data.concept.uniquePromptId === nextRareId); promptCatLabel = cEntry ? cEntry[1].concept.name : "Rare Concept"; currentPromptId = selPrompt.id; reward = 7.0; console.log(`Displaying Queued Rare reflection: ${nextRareId}`); } else { console.warn(`Rare prompt text missing: ${nextRareId}`); currentReflectionContext = 'Standard'; // Fallback if prompt missing
            State.addPendingRarePrompt(nextRareId); // Put it back if text missing
         } } } // Select prompt based on context if no rare one was found/triggered
    if (!selPrompt) { if (context === 'Dissonance' && targetId) { title = "Dissonance Reflection"; const concept = concepts.find(c => c.id === targetId); promptCatLabel = concept ? concept.name : "Dissonant Concept"; promptPool = reflectionPrompts.Dissonance || []; showNudge = true; reward = 5.0; console.log(`Looking for Dissonance prompt for ${promptCatLabel}`); } else if (context === 'Guided' && category) { title = "Guided Reflection"; promptCatLabel = category; promptPool = reflectionPrompts.Guided?.[category] || []; reward = Config.GUIDED_REFLECTION_COST + 2; console.log(`Looking for Guided prompt: ${category}`); } else if (context === 'SceneMeditation' && targetId) { const scene = sceneBlueprints.find(s => s.id === targetId); if (scene?.reflectionPromptId) { selPrompt = reflectionPrompts.SceneMeditation?.[scene.reflectionPromptId]; if (selPrompt) { title = "Scene Meditation"; promptCatLabel = scene.name; currentPromptId = selPrompt.id; reward = (scene.meditationCost || Config.SCENE_MEDITATION_BASE_COST) + 5; console.log(`Displaying Scene Meditation: ${currentPromptId}`); } else { console.warn(`Scene prompt ${scene.reflectionPromptId} missing.`); currentReflectionContext = 'Standard'; } } else { console.warn(`Scene ${targetId} or prompt ID missing.`); currentReflectionContext = 'Standard'; } } else { // Standard Reflection logic
            currentReflectionContext = 'Standard'; title = "Standard Reflection"; reward = 5.0; const attune = State.getAttunement(); const validElems = Object.entries(attune).filter(([k, v]) => v > 0).sort(([,a], [,b]) => b - a); if (validElems.length > 0) { const topTier = validElems.slice(0, Math.ceil(validElems.length / 2)); // Select from top half
                const [selKey] = topTier.length > 0 ? topTier[Math.floor(Math.random() * topTier.length)] : validElems[Math.floor(Math.random() * validElems.length)]; // Fallback if top tier empty
                const selName = elementKeyToFullName[selKey]; promptPool = reflectionPrompts[selName] || []; promptCatLabel = elementDetails[selName]?.name || selName; currentReflectionCategory = selName; console.log(`Looking for Standard prompt: ${promptCatLabel}`); } else { promptPool = []; console.warn("No attunement > 0 for Standard reflection."); } } } // Select from pool if needed
    if (!selPrompt && promptPool.length > 0) { const seen = State.getSeenPrompts(); const available = promptPool.filter(p => !seen.has(p.id)); selPrompt = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : promptPool[Math.floor(Math.random() * promptPool.length)]; currentPromptId = selPrompt.id; console.log(`Selected prompt ${currentPromptId} from pool.`); } // Display if a prompt was selected
    if (selPrompt && currentPromptId) { const pData = { title, category: promptCatLabel, prompt: selPrompt, showNudge, reward }; UI.displayReflectionPrompt(pData, currentReflectionContext); } else { console.error(`Could not select prompt for ${context}`); if (context === 'Dissonance' && reflectionTargetConceptId) { console.warn("Dissonance reflection fail, adding concept."); addConceptToGrimoireInternal(reflectionTargetConceptId); UI.hidePopups(); UI.showTemporaryMessage("Reflection unavailable, added concept.", 3500); } else if (context === 'Guided') { gainInsight(Config.GUIDED_REFLECTION_COST, "Refund: No guided prompt"); UI.showTemporaryMessage("No guided reflections available.", 3000); } else { UI.showTemporaryMessage("No reflection prompt found.", 3000); } clearPopupState(); } }
export function handleConfirmReflection(nudgeAllowed) { if (!currentPromptId) { console.error("No current prompt ID."); UI.hidePopups(); return; } console.log(`Reflection confirmed: Context=${currentReflectionContext}, Prompt=${currentPromptId}, Nudge=${nudgeAllowed}`); State.addSeenPrompt(currentPromptId); let rewardAmt = 5.0; let attuneKey = null; let attuneAmt = 1.0; let milestoneAct = 'completeReflection'; // Determine reward based on context
    if (currentReflectionContext === 'Guided') { rewardAmt = Config.GUIDED_REFLECTION_COST + 2; } else if (currentReflectionContext === 'RareConcept') { rewardAmt = 7.0; } else if (currentReflectionContext === 'SceneMeditation') { const scene = sceneBlueprints.find(s => s.reflectionPromptId === currentPromptId); rewardAmt = (scene?.meditationCost || Config.SCENE_MEDITATION_BASE_COST) + 5; } else { rewardAmt = 5.0; } // Handle Dissonance context specifics
    if (currentReflectionContext === 'Dissonance') { milestoneAct = 'completeReflectionDissonance'; attuneAmt = 0.5; // Reduced attunement for dissonance
        if (nudgeAllowed && reflectionTargetConceptId) { console.log("Processing nudge..."); const concept = concepts.find(c => c.id === reflectionTargetConceptId); const scores = State.getScores(); let nudged = false; if (concept?.elementScores) { const newScores = { ...scores }; for (const key in scores) { if (scores.hasOwnProperty(key) && concept.elementScores.hasOwnProperty(key)) { const uScore = scores[key]; const cScore = concept.elementScores[key]; const diff = cScore - uScore; if (Math.abs(diff) > 1.5) { const nudgeVal = Math.sign(diff) * Config.SCORE_NUDGE_AMOUNT; newScores[key] = Math.max(0, Math.min(10, uScore + nudgeVal)); if (newScores[key] !== uScore) nudged = true; } } } if (nudged) { State.updateScores(newScores); console.log("Nudged Scores:", State.getScores()); UI.displayPersonaScreen(); UI.showTemporaryMessage("Core understanding shifted.", 3500); gainAttunementForAction('scoreNudge', 'All', 0.5); updateMilestoneProgress('scoreNudgeApplied', 1); } } else { console.warn(`Cannot apply nudge, concept data missing for ID ${reflectionTargetConceptId}`); } } // Add the concept after reflection (even if nudge failed)
        if (reflectionTargetConceptId) { addConceptToGrimoireInternal(reflectionTargetConceptId, 'dissonance'); } } // Grant Insight
    gainInsight(rewardAmt, `Reflection (${currentReflectionContext || 'Unknown'})`); // Determine and grant Attunement
    if (currentReflectionContext === 'Standard' && currentReflectionCategory) { attuneKey = elementNameToKey[currentReflectionCategory]; } else if (currentReflectionContext === 'Guided') { attuneKey = null; // Guided usually grants generic
    } else if (currentReflectionContext === 'RareConcept') { const cEntry = Array.from(State.getDiscoveredConcepts().entries()).find(([id, data]) => data.concept.uniquePromptId === currentPromptId); attuneKey = cEntry ? cEntry[1].concept.primaryElement : null; } else if (currentReflectionContext === 'SceneMeditation') { const scene = sceneBlueprints.find(s => s.reflectionPromptId === currentPromptId); attuneKey = scene?.element || null; } // Grant based on determined key or fallback
    if (attuneKey) gainAttunementForAction('completeReflection', attuneKey, attuneAmt); else gainAttunementForAction('completeReflectionGeneric', 'All', 0.2); // Track milestones and rituals
    updateMilestoneProgress(milestoneAct, 1); checkAndUpdateRituals('completeReflection'); // Check generic ritual
    const ritualCtxMatch = `${currentReflectionContext}_${currentPromptId}`; // Check context-specific ritual
    checkAndUpdateRituals('completeReflection', { contextMatch: ritualCtxMatch }); // Cleanup and feedback
    UI.hidePopups(); UI.showTemporaryMessage("Reflection complete! Insight gained.", 3000); clearPopupState(); }
export function triggerGuidedReflection() {
     if (spendInsight(Config.GUIDED_REFLECTION_COST, "Guided Reflection")) { const cats = Object.keys(reflectionPrompts.Guided || {}); if (cats.length > 0) { const cat = cats[Math.floor(Math.random() * cats.length)]; console.log(`Triggering guided: ${cat}`); triggerReflectionPrompt('Guided', null, cat); } else { console.warn("No guided categories."); gainInsight(Config.GUIDED_REFLECTION_COST, "Refund: No guided prompt"); UI.showTemporaryMessage("No guided reflections available.", 3000); } }
}

// --- Notes, Library, Repository Actions ---
export function handleSaveNote() { if (currentlyDisplayedConceptId === null) return; const notesTA = document.getElementById('myNotesTextarea'); if (!notesTA) return; const noteText = notesTA.value.trim(); if (State.updateNotes(currentlyDisplayedConceptId, noteText)) { const status = document.getElementById('noteSaveStatus'); if (status) { status.textContent = "Saved!"; status.classList.remove('error'); setTimeout(() => { status.textContent = ""; }, 2000); } } else { const status = document.getElementById('noteSaveStatus'); if (status) { status.textContent = "Error."; status.classList.add('error'); } } }
export function handleUnlockLibraryLevel(event) { const button = event.target.closest('button'); if (!button || button.disabled) return; const key = button.dataset.elementKey; const level = parseInt(button.dataset.level); if (!key || isNaN(level)) { console.error("Invalid library unlock data"); return; } unlockDeepDiveLevelInternal(key, level); }
function unlockDeepDiveLevelInternal(elementKey, levelToUnlock) { const dData = elementDeepDive[elementKey] || []; const lData = dData.find(l => l.level === levelToUnlock); const curLevel = State.getState().unlockedDeepDiveLevels[elementKey] || 0; if (!lData || levelToUnlock !== curLevel + 1) { console.warn(`Library unlock fail: Invalid level/seq.`); return; } const cost = lData.insightCost || 0; if (spendInsight(cost, `Unlock Library: ${elementKeyToFullName[elementKey]} Lv ${levelToUnlock}`)) { if (State.unlockLibraryLevel(elementKey, levelToUnlock)) { console.log(`Unlocked ${elementKeyToFullName[elementKey]} level ${levelToUnlock}`); const targetContainer = document.querySelector(`#personaElementDetails .element-deep-dive-container[data-element-key="${elementKey}"]`); if (targetContainer) { UI.displayElementDeepDive(elementKey, targetContainer); } else { console.warn(`Could not find container for ${elementKey} to refresh UI.`); } UI.showTemporaryMessage(`${elementKeyToFullName[elementKey]} Insight Lv ${levelToUnlock} Unlocked!`, 3000); updateMilestoneProgress('unlockLibrary', levelToUnlock); updateMilestoneProgress('unlockedDeepDiveLevels', State.getState().unlockedDeepDiveLevels); checkAndUpdateRituals('unlockLibrary'); } else { console.error(`State fail unlock library ${elementKey} Lv ${levelToUnlock}`); gainInsight(cost, `Refund: Library unlock error`); UI.showTemporaryMessage("Error unlocking insight.", 3000);} } }
export function handleMeditateScene(event) { const button = event.target.closest('button'); if (!button || button.disabled) return; const sceneId = button.dataset.sceneId; if (!sceneId) return; meditateOnSceneInternal(sceneId); }
function meditateOnSceneInternal(sceneId) { const scene = sceneBlueprints.find(s => s.id === sceneId); if (!scene) { console.error(`Scene not found: ${sceneId}`); return; } const cost = scene.meditationCost || Config.SCENE_MEDITATION_BASE_COST; if (spendInsight(cost, `Meditate: ${scene.name}`)) { if (scene.reflectionPromptId) { console.log(`Triggering Scene Meditation: ${scene.name}`); triggerReflectionPrompt('SceneMeditation', sceneId); updateMilestoneProgress('meditateScene', 1); } else { console.error(`Prompt ID missing for scene ${sceneId}`); gainInsight(cost, `Refund: Missing scene prompt`); UI.showTemporaryMessage("Meditation fail: Reflection missing.", 3000); } } }
export function handleAttemptExperiment(event) { const button = event.target.closest('button'); if (!button || button.disabled) return; const expId = button.dataset.experimentId; if (!expId) return; attemptExperimentInternal(expId); }
function attemptExperimentInternal(experimentId) { const exp = alchemicalExperiments.find(e => e.id === experimentId); if (!exp || State.getRepositoryItems().experiments.has(experimentId)) { console.warn(`Exp ${experimentId} not found/completed.`); return; } const attune = State.getAttunement(); const focused = State.getFocusedConcepts(); const insight = State.getInsight(); // Check Attunement
    if (attune[exp.requiredElement] < exp.requiredAttunement) { UI.showTemporaryMessage("Attunement too low.", 3000); return; } // Check Focus Requirements
    let canAttempt = true; let unmetReqs = []; if (exp.requiredFocusConceptIds) { for (const reqId of exp.requiredFocusConceptIds) { if (!focused.has(reqId)) { canAttempt = false; const c = concepts.find(c=>c.id === reqId); unmetReqs.push(c ? c.name : `ID ${reqId}`); } } } if (exp.requiredFocusConceptTypes) { for (const typeReq of exp.requiredFocusConceptTypes) { let met = false; const dMap = State.getDiscoveredConcepts(); for (const fId of focused) { const c = dMap.get(fId)?.concept; if (c?.cardType === typeReq) { met = true; break; } } if (!met) { canAttempt = false; unmetReqs.push(`Type: ${typeReq}`); } } } if (!canAttempt) { UI.showTemporaryMessage(`Requires Focus: ${unmetReqs.join(', ')}`, 3000); return; } // Check Insight Cost
    const cost = exp.insightCost || Config.EXPERIMENT_BASE_COST; if (!spendInsight(cost, `Attempt Exp: ${exp.name}`)) return; // Attempt Experiment
    console.log(`Attempting: ${exp.name}`); updateMilestoneProgress('attemptExperiment', 1); const roll = Math.random(); if (roll < (exp.successRate || 0.5)) { console.log("Exp Success!"); UI.showTemporaryMessage(`Success! '${exp.name}' yielded results.`, 4000); const addedRepo = State.addRepositoryItem('experiments', exp.id); if (!addedRepo) console.warn(`Experiment ${exp.id} succeeded but failed to add to repo state.`); if (exp.successReward) { if (exp.successReward.type === 'insight') gainInsight(exp.successReward.amount, `Exp Success: ${exp.name}`); if (exp.successReward.type === 'attunement') gainAttunementForAction('experimentSuccess', exp.successReward.element || 'All', exp.successReward.amount); if (exp.successReward.type === 'insightFragment') { if (State.addRepositoryItem('insights', exp.successReward.id)) { console.log(`Exp reward: Insight ${exp.successReward.id}`); updateMilestoneProgress('repositoryInsightsCount', State.getRepositoryItems().insights.size); } } } } else { console.log("Exp Failed."); UI.showTemporaryMessage(`Exp '${exp.name}' failed... ${exp.failureConsequence || "No effect."}`, 4000); if (exp.failureConsequence?.includes("Insight loss")) { const loss = parseFloat(exp.failureConsequence.match(/(\d+(\.\d+)?)/)?.[0] || 1); gainInsight(-loss, `Exp Failure: ${exp.name}`); } else if (exp.failureConsequence?.includes("attunement decrease")) { const key = exp.requiredElement; if (key) { if(State.updateAttunement(key, -1.0)) UI.displayElementAttunement(); } } } UI.displayRepositoryContent(); }
export function handleSuggestSceneClick() {
    const focused = State.getFocusedConcepts(); const suggestionOutputDiv = document.getElementById('sceneSuggestionOutput'); const suggestedSceneContentDiv = document.getElementById('suggestedSceneContent');

    if (focused.size === 0) { UI.showTemporaryMessage("Focus on concepts first to suggest relevant scenes.", 3000); return; }
    const cost = Config.SCENE_SUGGESTION_COST; if (!spendInsight(cost, "Suggest Scene")) return;
    console.log("Suggesting scenes based on focus..."); const { focusScores } = calculateFocusScores(); const discoveredScenes = State.getRepositoryItems().scenes; const sortedElements = Object.entries(focusScores).filter(([key, score]) => score > 4.0).sort(([, a], [, b]) => b - a); const topElements = sortedElements.slice(0, 2).map(([key]) => key); if (topElements.length === 0 && sortedElements.length > 0) { topElements.push(sortedElements[0][0]); } else if (topElements.length === 0) { UI.showTemporaryMessage("Focus is too broad to suggest specific scenes.", 3000); gainInsight(cost, "Refund: Scene Suggestion Fail (Broad Focus)"); return; } console.log("Dominant focus elements for scene suggestion:", topElements); const relevantUndiscoveredScenes = sceneBlueprints.filter(scene => topElements.includes(scene.element) && !discoveredScenes.has(scene.id)); if (relevantUndiscoveredScenes.length === 0) { UI.showTemporaryMessage("All relevant scenes for this focus have been discovered. Check Repository.", 3500); } else { const selectedScene = relevantUndiscoveredScenes[Math.floor(Math.random() * relevantUndiscoveredScenes.length)]; const added = State.addRepositoryItem('scenes', selectedScene.id); if (added) { console.log(`Suggested Scene: ${selectedScene.name} (ID: ${selectedScene.id})`); if (suggestionOutputDiv) suggestionOutputDiv.classList.add('hidden'); // Hide old before showing new
        if (suggestedSceneContentDiv) suggestedSceneContentDiv.innerHTML = ''; if (suggestionOutputDiv && suggestedSceneContentDiv) { const sceneCost = selectedScene.meditationCost || Config.SCENE_MEDITATION_BASE_COST; const canAfford = State.getInsight() >= sceneCost; const sceneElement = UI.renderRepositoryItem(selectedScene, 'scene', sceneCost, canAfford); suggestedSceneContentDiv.appendChild(sceneElement); suggestionOutputDiv.classList.remove('hidden'); } else { console.error("Scene suggestion UI elements not found!"); } UI.showTemporaryMessage(`Scene Suggested: '${selectedScene.name}'! See details below.`, 4000); if (document.getElementById('repositoryScreen')?.classList.contains('current')) { UI.displayRepositoryContent(); } } else { console.error(`Failed to add scene ${selectedScene.id} to repository state.`); gainInsight(cost, "Refund: Scene Suggestion Error (State Add Fail)"); UI.showTemporaryMessage("Error suggesting scene.", 3000); } }
}

// --- Category & Lore Logic ---
export function handleCategorizeCard(conceptId, categoryId) {
    const currentCategory = State.getCardCategory(conceptId); if (currentCategory === categoryId) return; // No change needed

    if (State.setCardCategory(conceptId, categoryId)) {
        console.log(`Categorized card ${conceptId} as ${categoryId}`);
        // Refresh the grimoire display, ensuring the currently active filter is maintained
        const activeShelf = document.querySelector('.grimoire-shelf.active-shelf');
        const currentFilterCategory = activeShelf ? activeShelf.dataset.categoryId : 'All';
        UI.refreshGrimoireDisplay({ filterCategory: currentFilterCategory });
        checkCategoryUnlocks(categoryId); // Check if this categorization unlocked anything
        checkAndUpdateRituals('categorizeCard', { categoryId: categoryId, conceptId: conceptId });
    } else {
        console.error(`Failed to set category for card ${conceptId}`);
    }
}
function checkCategoryUnlocks(categoryId) { if (!categoryDrivenUnlocks || categoryDrivenUnlocks.length === 0) return; console.log(`Checking category unlocks for category: ${categoryId}`); const discoveredMap = State.getDiscoveredConcepts(); const cardsInCategory = Array.from(discoveredMap.entries()).filter(([id, data]) => (data.userCategory || 'uncategorized') === categoryId).map(([id]) => id); const cardIdSetInCategory = new Set(cardsInCategory); categoryDrivenUnlocks.forEach(unlock => { if (unlock.categoryRequired === categoryId ) { let requirementsMet = true; if (!unlock.requiredInSameCategory || unlock.requiredInSameCategory.length === 0) requirementsMet = false; else { for (const reqId of unlock.requiredInSameCategory) { if (!cardIdSetInCategory.has(reqId)) { requirementsMet = false; break; } } } // If requirements met, process the unlock
            if (requirementsMet) { console.log(`Category unlock triggered: ${unlock.id}`); const reward = unlock.unlocks; // Check if already processed (e.g., lore already unlocked)
                let alreadyDone = false; if (reward.type === 'lore') { const currentLoreLevel = State.getUnlockedLoreLevel(reward.targetConceptId); if (reward.loreLevelToUnlock <= currentLoreLevel) alreadyDone = true; } // Process reward if not already done
                if (!alreadyDone) { if (reward.type === 'lore') { if (unlockLoreInternal(reward.targetConceptId, reward.loreLevelToUnlock, `Category Unlock: ${unlock.description || unlock.id}`)) { UI.showTemporaryMessage(unlock.description || `New Lore Unlocked!`, 4000); } } else if (reward.type === 'insight') { gainInsight(reward.amount, `Category Unlock: ${unlock.description || unlock.id}`); UI.showTemporaryMessage(unlock.description || `Gained ${reward.amount} Insight!`, 3500); } } } } }); }
export function handleUnlockLore(conceptId, level, cost) { console.log(`Attempting to unlock lore level ${level} for concept ${conceptId} (Cost: ${cost})`); const concept = State.getDiscoveredConceptData(conceptId)?.concept; if (!concept) return; if (State.getUnlockedLoreLevel(conceptId) >= level) { UI.showTemporaryMessage("Lore already unlocked.", 2000); return; } if (spendInsight(cost, `Unlock Lore: ${concept.name} Lvl ${level}`)) { unlockLoreInternal(conceptId, level, `Insight Purchase`); } }
function unlockLoreInternal(conceptId, level, source = "Unknown") {
    if (State.unlockLoreLevel(conceptId, level)) { // State function now returns true/false
        const conceptName = State.getDiscoveredConceptData(conceptId)?.concept?.name || `ID ${conceptId}`;
        console.log(`Successfully unlocked lore level ${level} for ${conceptName} via ${source}`);

        // Update UI if popup is open
        if (getCurrentPopupConceptId() === conceptId && document.getElementById('conceptDetailPopup') && !document.getElementById('conceptDetailPopup').classList.contains('hidden')) {
            // Use requestAnimationFrame to ensure DOM is ready for update
            requestAnimationFrame(() => {
                const loreContentContainer = document.getElementById('popupLoreContent');
                if (!loreContentContainer) { console.error("rAF: Could not find #popupLoreContent container!"); UI.showConceptDetailPopup(conceptId); return; }

                let loreEntryDiv = null;
                for (const child of loreContentContainer.children) {
                    if (child.classList.contains('lore-entry') && child.dataset.loreLevel === String(level)) {
                        loreEntryDiv = child;
                        break;
                    }
                }

                if (loreEntryDiv) {
                    const conceptData = concepts.find(c => c.id === conceptId);
                    const loreData = conceptData?.lore?.find(l => l.level === level);

                    if (loreData) {
                        loreEntryDiv.innerHTML = `
                            <h5 class="lore-level-title">Level ${loreData.level} Insight:</h5>
                            <p class="lore-text">${loreData.text}</p>
                        `;
                        loreEntryDiv.dataset.loreLevel = level; // Ensure dataset is correct
                        console.log(`rAF: Updated DOM successfully for level ${level}.`);
                    } else {
                        console.error(`rAF: Could not find lore data for level ${level} to update DOM.`);
                        UI.showConceptDetailPopup(conceptId); // Fallback redraw
                    }
                } else {
                     console.error(`rAF: DOM search failed for level ${level} within animation frame. Falling back to redraw.`);
                     UI.showConceptDetailPopup(conceptId); // Fallback redraw
                }
            });
        } else {
            // If popup not open, just refresh grimoire (to remove lore indicator if needed)
            UI.refreshGrimoireDisplay();
        }

        updateMilestoneProgress('unlockLore', level); // Track milestone
        return true;
    } else {
        console.error(`Failed to update lore level in state for ${conceptId}`);
        return false;
    }
}


// --- Synergy/Tension Logic ---
export function checkSynergyTensionStatus() { calculateTapestryNarrative(true); // Ensure analysis is up-to-date
    let status = 'none'; if (currentTapestryAnalysis) { if (currentTapestryAnalysis.synergies.length > 0) status = 'synergy'; if (currentTapestryAnalysis.tensions.length > 0) status = (status === 'synergy') ? 'both' : 'tension'; } UI.updateExploreSynergyButtonStatus(status); return status; }
export function handleExploreSynergyClick() { if (!currentTapestryAnalysis) { console.warn("Synergy/Tension analysis not available."); UI.showTemporaryMessage("Focus concepts to analyze synergy.", 3000); return; } // Use the specific UI function to display this info
    UI.displaySynergyTensionInfo(currentTapestryAnalysis); }

// --- Rituals & Milestones Logic ---
export function checkAndUpdateRituals(action, details = {}) { let ritualCompletedThisCheck = false; const currentState = State.getState(); const completedToday = currentState.completedRituals.daily || {}; const focused = currentState.focusedConcepts; let currentRitualPool = [...dailyRituals]; if (focusRituals) { focusRituals.forEach(ritual => { if (!ritual.requiredFocusIds || ritual.requiredFocusIds.length === 0) return; const reqIds = new Set(ritual.requiredFocusIds); let allFoc = true; for (const id of reqIds) { if (!focused.has(id)) { allFoc = false; break; } } if (allFoc) currentRitualPool.push({ ...ritual, isFocusRitual: true, period: 'daily' }); }); } currentRitualPool.forEach(ritual => { const completedData = completedToday[ritual.id] || { completed: false, progress: 0 }; if (completedData.completed) return; const actionMatch = ritual.track.action === action; const contextMatches = ritual.track.contextMatch ? details.contextMatch === ritual.track.contextMatch : false; const categoryMatches = ritual.track.categoryId ? details.categoryId === ritual.track.categoryId : false; const rarityMatches = ritual.track.rarity ? details.rarity === ritual.track.rarity : false; if (actionMatch || contextMatches || categoryMatches || rarityMatches) { let conceptTypeMatch = true; if (ritual.track.conceptType && details.conceptId) { const conceptData = State.getDiscoveredConceptData(details.conceptId)?.concept; if (!conceptData || conceptData.cardType !== ritual.track.conceptType) { conceptTypeMatch = false; } } if (conceptTypeMatch) { const progress = State.completeRitualProgress(ritual.id, 'daily'); const requiredCount = ritual.track.count || 1; if (progress >= requiredCount) { console.log(`Ritual Completed: ${ritual.description}`); State.markRitualComplete(ritual.id, 'daily'); ritualCompletedThisCheck = true; if (ritual.reward) { if (ritual.reward.type === 'insight') gainInsight(ritual.reward.amount || 0, `Ritual: ${ritual.description}`); else if (ritual.reward.type === 'attunement') gainAttunementForAction('ritual', ritual.reward.element || 'All', ritual.reward.amount || 0); else if (ritual.reward.type === 'token') console.log(`TODO: Grant ${ritual.reward.tokenType || 'Research'} token`); } } } } }); if (ritualCompletedThisCheck) UI.displayDailyRituals(); }
export function updateMilestoneProgress(trackType, currentValue) {
     let milestoneAchievedThisUpdate = false;
     const achievedSet = State.getState().achievedMilestones; if (!(achievedSet instanceof Set)) { console.error("CRITICAL ERROR: gameState.achievedMilestones is not a Set!"); return; }
     milestones.forEach(m => {
         if (!achievedSet.has(m.id)) {
             let achieved = false; const threshold = m.track.threshold; let checkValue = null;

             // --- Achievement Check Logic ---
             if (m.track.action === trackType) { // Action-based milestones
                 if (typeof currentValue === 'number' && currentValue >= (m.track.count || 1)) achieved = true;
                 else if ((m.track.count === 1 || !m.track.count) && currentValue) achieved = true; // Simple boolean or count=1 trigger
             }
             else if (m.track.state === trackType) { // State-based milestones
                 const att = State.getAttunement(); const lvls = State.getState().unlockedDeepDiveLevels; const discSize = State.getDiscoveredConcepts().size; const focSize = State.getFocusedConcepts().size; const insCount = State.getRepositoryItems().insights.size; const slots = State.getFocusSlots();
                 if (trackType === 'elementAttunement') {
                     if (m.track.element && att.hasOwnProperty(m.track.element)) { // Check specific element
                        const valueToCheck = (typeof currentValue === 'object' && currentValue !== null && currentValue.hasOwnProperty(m.track.element)) ? currentValue[m.track.element] : att[m.track.element];
                        if(valueToCheck >= threshold) achieved = true;
                     } else if (m.track.condition === 'any') { // Check if *any* element meets threshold
                        achieved = Object.values(att).some(v => v >= threshold);
                     } else if (m.track.condition === 'all') { // Check if *all* elements meet threshold
                        achieved = Object.values(att).every(v => v >= threshold);
                     }
                 } else if (trackType === 'unlockedDeepDiveLevels') {
                     const levelsToCheck = (typeof currentValue === 'object' && currentValue !== null) ? currentValue : lvls;
                     if (m.track.condition === 'any') achieved = Object.values(levelsToCheck).some(v => v >= threshold);
                     else if (m.track.condition === 'all') achieved = Object.values(levelsToCheck).every(v => v >= threshold);
                 } else if (trackType === 'discoveredConcepts.size') checkValue = discSize;
                 else if (trackType === 'focusedConcepts.size') checkValue = focSize;
                 else if (trackType === 'repositoryInsightsCount') checkValue = insCount;
                 else if (trackType === 'focusSlotsTotal') checkValue = slots;
                 else if (trackType === 'repositoryContents' && m.track.condition === "allTypesPresent") {
                     const i = State.getRepositoryItems(); achieved = i.scenes.size > 0 && i.experiments.size > 0 && i.insights.size > 0;
                 }
                 else if (trackType === 'unlockLore' && m.track.condition === 'anyLevel' && typeof currentValue === 'number') {
                     // This checks if *any* lore level equal to or greater than the threshold was unlocked
                     achieved = currentValue >= threshold;
                 }
                 // Generic state threshold check
                 if (!achieved && checkValue !== null && typeof checkValue === 'number' && checkValue >= threshold) achieved = true;
             }
             // --- End Achievement Check Logic ---

             // --- Grant Reward if Achieved ---
             if (achieved) {
                 if (State.addAchievedMilestone(m.id)) { // addAchievedMilestone handles saving and preventing duplicates
                     console.log("Milestone Achieved!", m.description); milestoneAchievedThisUpdate = true; UI.displayMilestones(); UI.showMilestoneAlert(m.description);
                     if (m.reward) {
                         if (m.reward.type === 'insight') gainInsight(m.reward.amount || 0, `Milestone: ${m.description}`);
                         else if (m.reward.type === 'attunement') gainAttunementForAction('milestone', m.reward.element || 'All', m.reward.amount || 0);
                         else if (m.reward.type === 'increaseFocusSlots') { const inc = m.reward.amount || 1; if (State.increaseFocusSlots(inc)) { UI.updateFocusSlotsDisplay(); updateMilestoneProgress('focusSlotsTotal', State.getFocusSlots()); } } // Trigger check for milestones based on slots
                         else if (m.reward.type === 'discoverCard') { const cId = m.reward.cardId; if (cId && !State.getDiscoveredConcepts().has(cId)) { const cDisc = concepts.find(c => c.id === cId); if (cDisc) { addConceptToGrimoireInternal(cId, 'milestone'); UI.showTemporaryMessage(`Milestone Reward: Discovered ${cDisc.name}!`, 3500); } } }
                     }
                 }
             }
             // --- End Grant Reward ---
         }
     });
}


// --- Daily Login ---
export function checkForDailyLogin() { const today = new Date().toDateString(); const last = State.getState().lastLoginDate; if (last !== today) { console.log("First login today."); State.resetDailyRituals(); gainInsight(5.0, "Daily Bonus"); UI.showTemporaryMessage("Rituals Reset. Free Research Available!", 3500); UI.displayDailyRituals(); if(document.getElementById('studyScreen')?.classList.contains('current')) UI.displayStudyScreenContent(); } else { console.log("Already logged in today."); if(document.getElementById('studyScreen')?.classList.contains('current')) UI.displayStudyScreenContent(); } }

// --- Persona Calculation Logic Helpers ---
export function calculateFocusScores() { const scores = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 }; const focused = State.getFocusedConcepts(); const disc = State.getDiscoveredConcepts(); const count = focused.size; if (count > 0) { focused.forEach(id => { const data = disc.get(id); if (data?.concept?.elementScores) { for (const key in scores) { if (data.concept.elementScores.hasOwnProperty(key)) scores[key] += data.concept.elementScores[key]; } } }); for (const key in scores) scores[key] /= count; } return { focusScores: scores, focusCount: count }; }
export function calculateTapestryNarrative(forceRecalculate = false) {
    const stateHash = State.getState().currentFocusSetHash;
    const currentCalculatedHash = State.getState().focusedConcepts ? Array.from(State.getState().focusedConcepts).sort((a, b) => a - b).join(',') : '';

    if (currentTapestryAnalysis && !forceRecalculate && currentCalculatedHash === stateHash) { return currentTapestryAnalysis.fullNarrativeHTML; }
    console.log("Recalculating tapestry narrative...");
    const focused = State.getFocusedConcepts(); const focusCount = focused.size;
    if (focusCount === 0) { currentTapestryAnalysis = { synergies: [], tensions: [], fullNarrativeHTML: 'Mark concepts as "Focus" from the Grimoire to weave your narrative.' }; State.getState().currentFocusSetHash = ''; return currentTapestryAnalysis.fullNarrativeHTML; }
    const disc = State.getDiscoveredConcepts(); const { focusScores } = calculateFocusScores();
    const analysis = { dominantElements: [], elementThemes: [], dominantCardTypes: [], cardTypeThemes: [], synergies: [], tensions: [], essenceTitle: "Balanced", balanceComment: "", fullNarrativeRaw: "", fullNarrativeHTML: "" };
    const sortedElements = Object.entries(focusScores).filter(([k, s]) => s > 3.5).sort(([, a], [, b]) => b - a); if (sortedElements.length > 0) { analysis.dominantElements = sortedElements.map(([key, score]) => ({ key: key, name: elementDetails[elementKeyToFullName[key]]?.name || key, score: score })); const topElementKeys = analysis.dominantElements.slice(0, 3).map(e => e.key).sort().join(''); const themeKey = topElementKeys.length > 1 ? topElementKeys : (topElementKeys.length === 1 ? analysis.dominantElements[0].key : null); if (themeKey && elementInteractionThemes && elementInteractionThemes[themeKey]) { analysis.elementThemes.push(elementInteractionThemes[themeKey]); } else if (analysis.dominantElements.length > 0) { analysis.elementThemes.push(`a strong emphasis on **${analysis.dominantElements[0].name}**.`); } if (analysis.dominantElements.length >= 2 && analysis.dominantElements[0].score > 6.5 && analysis.dominantElements[1].score > 5.5) { analysis.essenceTitle = `${analysis.dominantElements[0].name}/${analysis.dominantElements[1].name} Blend`; } else if (analysis.dominantElements.length >= 1 && analysis.dominantElements[0].score > 6.5) { analysis.essenceTitle = `${analysis.dominantElements[0].name} Focus`; } else { analysis.essenceTitle = "Developing"; } } else { analysis.essenceTitle = "Subtle"; } const typeCounts = {}; cardTypeKeys.forEach(type => typeCounts[type] = 0); focused.forEach(id => { const type = disc.get(id)?.concept?.cardType; if (type && typeCounts.hasOwnProperty(type)) { typeCounts[type]++; } }); analysis.dominantCardTypes = Object.entries(typeCounts).filter(([type, count]) => count > 0).sort(([, a], [, b]) => b - a).map(([type, count]) => ({ type, count })); if (analysis.dominantCardTypes.length > 0) { const topType = analysis.dominantCardTypes[0].type; if (cardTypeThemes && cardTypeThemes[topType]) { analysis.cardTypeThemes.push(cardTypeThemes[topType]); } } const checkedPairs = new Set(); focused.forEach(idA => { const conceptA = disc.get(idA)?.concept; if (!conceptA?.relatedIds) return; focused.forEach(idB => { if (idA === idB) return; const pairKey = [idA, idB].sort().join('-'); if (checkedPairs.has(pairKey)) return; if (conceptA.relatedIds.includes(idB)) { const conceptB = disc.get(idB)?.concept; if (conceptB) { analysis.synergies.push({ concepts: [conceptA.name, conceptB.name], text: `The connection between **${conceptA.name}** and **${conceptB.name}** suggests a reinforcing dynamic.` }); } } checkedPairs.add(pairKey); }); }); const highThreshold = 7.0; const lowThreshold = 3.0; const focusConceptsData = Array.from(focused).map(id => disc.get(id)?.concept).filter(Boolean); if (focusConceptsData.length >= 2) { for (const key of Object.keys(elementNameToKey)) { const elementName = elementKeyToFullName[key]; let hasHigh = focusConceptsData.some(c => c.elementScores?.[key] >= highThreshold); let hasLow = focusConceptsData.some(c => c.elementScores?.[key] <= lowThreshold); if (hasHigh && hasLow) { const highConcepts = focusConceptsData.filter(c => c.elementScores?.[key] >= highThreshold).map(c => c.name); const lowConcepts = focusConceptsData.filter(c => c.elementScores?.[key] <= lowThreshold).map(c => c.name); analysis.tensions.push({ element: elementName, text: `A potential tension exists within **${elementName}**: concepts like **${highConcepts.join(', ')}** lean high, while **${lowConcepts.join(', ')}** lean low.` }); } } } const scores = Object.values(focusScores); const minScore = Math.min(...scores); const maxScore = Math.max(...scores); const range = maxScore - minScore; if (range <= 2.5 && focusCount > 2) analysis.balanceComment = "The focused elements present a relatively balanced profile."; else if (range >= 5.0 && focusCount > 2) analysis.balanceComment = "There's a notable range in elemental emphasis within your focus."; let narrative = `Current Essence: **${analysis.essenceTitle}**. `; if (analysis.dominantElements.length > 0) { narrative += `Your tapestry currently resonates with ${analysis.elementThemes.join(' ')} `; } else { narrative += "Your focus presents a unique and subtle balance. "; } if (analysis.dominantCardTypes.length > 0) { narrative += `The lean towards ${analysis.cardTypeThemes.join(' ')} shapes the expression. `; } if (analysis.balanceComment) narrative += analysis.balanceComment + " ";
    analysis.fullNarrativeRaw = narrative.trim(); analysis.fullNarrativeHTML = analysis.fullNarrativeRaw.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    currentTapestryAnalysis = analysis;
    State.getState().currentFocusSetHash = currentCalculatedHash; // Update hash in state
    console.log("Recalculated Tapestry Analysis and updated state hash:", currentTapestryAnalysis);
    return analysis.fullNarrativeHTML;
 }
export function calculateFocusThemes() { const focused = State.getFocusedConcepts(); const disc = State.getDiscoveredConcepts(); if (focused.size === 0) return []; const counts = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 }; const thresh = 7.0; focused.forEach(id => { const concept = disc.get(id)?.concept; if (concept?.elementScores) { for (const key in concept.elementScores) { if (elementKeyToFullName.hasOwnProperty(key) && concept.elementScores[key] >= thresh) counts[key]++; } } }); const sorted = Object.entries(counts).filter(([k, c]) => c > 0 && elementDetails[elementKeyToFullName[k]]).sort(([, a], [, b]) => b - a).map(([k, c]) => ({ key: k, name: elementDetails[elementKeyToFullName[k]]?.name || k, count: c })); return sorted; }

// --- Focus Unlocks ---
export function checkForFocusUnlocks(silent = false) {
     console.log("Checking focus unlocks..."); let newlyUnlocked = false;
     const focused = State.getFocusedConcepts(); const unlocked = State.getUnlockedFocusItems();
     focusDrivenUnlocks.forEach(unlock => { if (unlocked.has(unlock.id)) return; let met = true; if (!unlock.requiredFocusIds || unlock.requiredFocusIds.length === 0) met = false; else { for (const reqId of unlock.requiredFocusIds) { if (!focused.has(reqId)) { met = false; break; } } } if (met) { console.log(`Met reqs for ${unlock.id}`); if (State.addUnlockedFocusItem(unlock.id)) { newlyUnlocked = true; const item = unlock.unlocks; let name = item.name || `ID ${item.id}`; let notif = unlock.description || `Unlocked ${name}`; if (item.type === 'scene') { if (State.addRepositoryItem('scenes', item.id)) { console.log(`Unlocked Scene: ${name}`); notif += ` View in Repo.`; } else notif += ` (Already Discovered)`; } else if (item.type === 'experiment') { console.log(`Unlocked Exp: ${name}.`); notif += ` Check Repo for availability.`; } else if (item.type === 'insightFragment') { if (State.addRepositoryItem('insights', item.id)) { const iData = elementalInsights.find(i => i.id === item.id); name = iData ? `"${iData.text}"` : `ID ${item.id}`; console.log(`Unlocked Insight: ${item.id}`); notif += ` View in Repo.`; updateMilestoneProgress('repositoryInsightsCount', State.getRepositoryItems().insights.size); } else notif += ` (Already Discovered)`; } if (!silent) UI.showTemporaryMessage(`Focus Synergy: ${notif}`, 5000); } } });
     if (newlyUnlocked && !silent) { console.log("New Focus Unlocks:", Array.from(State.getUnlockedFocusItems())); if (document.getElementById('repositoryScreen')?.classList.contains('current')) UI.displayRepositoryContent(); if (document.getElementById('personaScreen')?.classList.contains('current')) UI.generateTapestryNarrative(); }
}

// --- Tapestry Deep Dive Logic ---
export function showTapestryDeepDive() { if (State.getFocusedConcepts().size === 0) { UI.showTemporaryMessage("Focus on concepts first to explore the tapestry.", 3000); return; } calculateTapestryNarrative(true); // Ensure analysis is current
    if (!currentTapestryAnalysis) { console.error("Failed to generate tapestry analysis for Deep Dive."); UI.showTemporaryMessage("Error analyzing Tapestry.", 3000); return; } UI.displayTapestryDeepDive(currentTapestryAnalysis); }
export function handleDeepDiveNodeClick(nodeId) { if (!currentTapestryAnalysis) { console.error("Deep Dive Node Click: Analysis missing."); UI.updateDeepDiveContent("<p>Error: Analysis data unavailable.</p>", nodeId); return; } console.log(`Logic: Handling Deep Dive node click: ${nodeId}`); let content = `<p><em>Analysis for '${nodeId}'...</em></p>`; try { switch (nodeId) { case 'elemental': content = `<h4>Elemental Resonance Breakdown</h4>`; if(currentTapestryAnalysis.elementThemes.length > 0) { content += `<ul>${currentTapestryAnalysis.elementThemes.map(t => `<li>${t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}</ul>`; } else { content += `<p>No specific elemental themes detected.</p>`; } content += `<p><small>Dominant Elements: ${currentTapestryAnalysis.dominantElements.length > 0 ? currentTapestryAnalysis.dominantElements.map(e => `${e.name} (${e.score.toFixed(1)})`).join(', ') : 'None strongly dominant'}</small></p>`; if(currentTapestryAnalysis.balanceComment) content += `<p><small>Balance: ${currentTapestryAnalysis.balanceComment}</small></p>`; break; case 'archetype': content = `<h4>Concept Archetype Analysis</h4>`; if (currentTapestryAnalysis.cardTypeThemes.length > 0) { content += `<ul>${currentTapestryAnalysis.cardTypeThemes.map(t => `<li>${t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}</ul>`; } else { content += `<p>No specific archetype themes detected.</p>`; } content += `<p><small>Focus Distribution: ${currentTapestryAnalysis.dominantCardTypes.length > 0 ? currentTapestryAnalysis.dominantCardTypes.map(ct => `${ct.type} (${ct.count})`).join(', ') : 'None'}</small></p>`; break; case 'synergy': content = `<h4>Synergies & Tensions</h4>`; if (currentTapestryAnalysis.synergies.length > 0) { content += `<h5>Synergies:</h5><ul>${currentTapestryAnalysis.synergies.map(s => `<li>${s.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}</ul>`; } else { content += `<p><em>No direct synergies detected between focused concepts.</em></p>`; } content += `<br>`; if (currentTapestryAnalysis.tensions.length > 0) { content += `<h5>Tensions:</h5><ul>${currentTapestryAnalysis.tensions.map(t => `<li>${t.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}</ul>`; } else { content += `<p><em>No significant elemental tensions detected within the focus.</em></p>`; } break; default: content = `<p><em>Analysis node '${nodeId}' not recognized.</em></p>`; } } catch (error) { console.error(`Error generating content for node ${nodeId}:`, error); content = `<p>Error generating analysis for ${nodeId}.</p>`; } UI.updateDeepDiveContent(content, nodeId); }
export function handleContemplationNodeClick() { const cooldownEnd = State.getContemplationCooldownEnd(); if (cooldownEnd && Date.now() < cooldownEnd) { UI.showTemporaryMessage("Contemplation still cooling down.", 2500); UI.updateContemplationButtonState(); return; } if (spendInsight(Config.CONTEMPLATION_COST, "Focused Contemplation")) { const contemplation = generateFocusedContemplation(); if (contemplation) { UI.displayContemplationTask(contemplation); State.setContemplationCooldown(Date.now() + Config.CONTEMPLATION_COOLDOWN); UI.updateContemplationButtonState(); } else { UI.updateDeepDiveContent("<p><em>Could not generate contemplation task.</em></p>", 'contemplation'); gainInsight(Config.CONTEMPLATION_COST, "Refund: Contemplation Fail"); UI.updateContemplationButtonState(); } } else { UI.updateContemplationButtonState(); } }
function generateFocusedContemplation() { // Internal helper
    if (!currentTapestryAnalysis) { console.error("Cannot generate contemplation: Tapestry analysis missing."); return null; }
    const focused = State.getFocusedConcepts(); const disc = State.getDiscoveredConcepts(); const focusedConceptsArray = Array.from(focused).map(id => disc.get(id)?.concept).filter(Boolean);
    let task = { type: "Default", text: "Reflect on your current focus.", reward: { type: 'insight', amount: 2 }, requiresCompletionButton: true };
    try {
        const taskOptions = [];
        // Tension Task
        if (currentTapestryAnalysis.tensions.length > 0) { const tension = currentTapestryAnalysis.tensions[Math.floor(Math.random() * currentTapestryAnalysis.tensions.length)]; taskOptions.push({ type: 'Tension Reflection', text: `Your Tapestry highlights a tension within **${tension.element}**. Reflect on how you reconcile or experience this contrast. Consider adding a note.`, reward: { type: 'insight', amount: 4 }, requiresCompletionButton: true }); }
        // Synergy Task (Modified to be actionable)
        if (currentTapestryAnalysis.synergies.length > 0) { const syn = currentTapestryAnalysis.synergies[Math.floor(Math.random() * currentTapestryAnalysis.synergies.length)]; const [nameA, nameB] = syn.concepts; taskOptions.push({ type: 'Synergy Note', text: `Focus links <strong>${nameA}</strong> and <strong>${nameB}</strong>. In the 'My Notes' for <strong>${nameA}</strong>, write one sentence about how <strong>${nameB}</strong> might amplify or alter its expression. (No button needed, gain Insight automatically).`, reward: { type: 'insight', amount: 3 }, requiresCompletionButton: false }); } // Note-based doesn't need button
        // Dominant Element Task
        if (currentTapestryAnalysis.dominantElements.length > 0 && currentTapestryAnalysis.dominantElements[0].score > 7.0) { const el = currentTapestryAnalysis.dominantElements[0]; let action = "observe an interaction involving this element"; if (el.key === 'S') action = "mindfully experience one physical sensation related to this element"; else if (el.key === 'P') action = "acknowledge one emotion linked to this element without judgment"; else if (el.key === 'C') action = "analyze one assumption related to this element"; else if (el.key === 'R') action = "consider one relationship boundary influenced by this element"; else if (el.key === 'A') action = "notice one thing that subtly attracts or repels you, related to this element"; taskOptions.push({ type: 'Dominant Element Ritual', text: `Your focus strongly resonates with **${el.name}**. Today's mini-ritual: ${action}.`, attunementReward: { element: el.key, amount: 0.5 }, reward: { type: 'insight', amount: 2 }, requiresCompletionButton: true }); }
        // General Resonance Task
         if (focusedConceptsArray.length > 0) { const conceptNames = focusedConceptsArray.map(c => `<strong>${c.name}</strong>`); taskOptions.push({ type: 'Tapestry Resonance', text: `Meditate briefly on the combined energy of your focused concepts: ${conceptNames.join(', ')}. What overall feeling or image emerges?`, attunementReward: { element: 'All', amount: 0.2 }, reward: { type: 'insight', amount: 3 }, requiresCompletionButton: true }); }
        // Select Task (Prioritize Tension/Synergy slightly if available)
        let selectedTaskOption = null; const tensionTask = taskOptions.find(t => t.type === 'Tension Reflection'); const synergyTask = taskOptions.find(t => t.type === 'Synergy Note');
        if (tensionTask && Math.random() < 0.4) { selectedTaskOption = tensionTask; } else if (synergyTask && Math.random() < 0.4) { selectedTaskOption = synergyTask; } else if (taskOptions.length > 0) { selectedTaskOption = taskOptions[Math.floor(Math.random() * taskOptions.length)]; }
        // Process selected task
        if (selectedTaskOption) { task = selectedTaskOption; // Handle immediate rewards (like note-based ones)
             if (task.reward?.type === 'insight' && !task.requiresCompletionButton) { gainInsight(task.reward.amount, 'Contemplation Task (Immediate)'); task.reward = { type: 'none' }; } // Grant reward, clear it
             // Handle immediate attunement
             if (task.attunementReward) { gainAttunementForAction('contemplation', task.attunementReward.element, task.attunementReward.amount); delete task.attunementReward; } }
        else { console.log("Using default contemplation task."); } // Fallback to default
    } catch (error) { console.error("Error generating contemplation task:", error); return { type: "Error", text: "An error occurred during generation.", reward: { type: 'none' }, requiresCompletionButton: false }; }
    console.log(`Generated contemplation task of type: ${task.type}`); return task;
}
export function handleCompleteContemplation(task) {
    if (!task || !task.reward || !task.requiresCompletionButton) return;
    console.log(`Contemplation task completed: ${task.type}`);
    if (task.reward.type === 'insight' && task.reward.amount > 0) { gainInsight(task.reward.amount, `Contemplation Task`); }
    UI.showTemporaryMessage("Contemplation complete!", 2500);
    UI.clearContemplationTask(); // Update UI to show completion/clear task
}

// --- Elemental Dilemma Logic ---
export function handleElementalDilemmaClick() {
    const availableDilemmas = elementalDilemmas; // Assuming elementalDilemmas is imported
    if (!availableDilemmas || availableDilemmas.length === 0) {
        UI.showTemporaryMessage("No dilemmas available at this time.", 3000);
        return;
    }
    // Simple random selection for now
    currentDilemma = availableDilemmas[Math.floor(Math.random() * availableDilemmas.length)];
    UI.displayElementalDilemma(currentDilemma);
}
export function handleConfirmDilemma() {
    const modal = document.getElementById('dilemmaModal');
    const slider = document.getElementById('dilemmaSlider');
    const nudgeCheckbox = document.getElementById('dilemmaNudgeCheckbox');

    if (!modal || !slider || !nudgeCheckbox || !currentDilemma) {
        console.error("Cannot confirm dilemma, elements or data missing.");
        UI.hidePopups();
        return;
    }

    const sliderValue = parseFloat(slider.value); // 0-10
    const nudgeAllowed = nudgeCheckbox.checked;
    const keyMin = currentDilemma.elementKeyMin;
    const keyMax = currentDilemma.elementKeyMax;

    console.log(`Dilemma ${currentDilemma.id} confirmed. Value: ${sliderValue}, Nudge: ${nudgeAllowed}`);

    // --- Reward Insight ---
    gainInsight(3, `Dilemma Choice: ${currentDilemma.id}`);

    // --- Apply Score Nudge if Allowed ---
    if (nudgeAllowed) {
        const scores = State.getScores();
        const newScores = { ...scores };
        let nudged = false;

        // Calculate how much to nudge each element based on the slider
        // Slider towards Min (0) increases Min Element, decreases Max Element
        // Slider towards Max (10) increases Max Element, decreases Min Element
        const maxNudgeEffect = Config.SCORE_NUDGE_AMOUNT * 2; // Max potential change for full slider swing
        const proportionMin = (10 - sliderValue) / 10; // 1 when slider=0, 0 when slider=10
        const proportionMax = sliderValue / 10; // 0 when slider=0, 1 when slider=10

        const nudgeMin = proportionMin * maxNudgeEffect - (proportionMax * maxNudgeEffect * 0.5); // Nudge towards min, slightly reduce if leaning max
        const nudgeMax = proportionMax * maxNudgeEffect - (proportionMin * maxNudgeEffect * 0.5); // Nudge towards max, slightly reduce if leaning min

        // Apply nudge to Min Element
        if (keyMin && newScores[keyMin] !== undefined) {
            const originalMin = newScores[keyMin];
            newScores[keyMin] = Math.max(0, Math.min(10, newScores[keyMin] + nudgeMin));
            if (newScores[keyMin] !== originalMin) nudged = true;
        }
        // Apply nudge to Max Element
        if (keyMax && newScores[keyMax] !== undefined) {
            const originalMax = newScores[keyMax];
            newScores[keyMax] = Math.max(0, Math.min(10, newScores[keyMax] + nudgeMax));
             if (newScores[keyMax] !== originalMax) nudged = true;
        }

        if (nudged) {
            State.updateScores(newScores);
            console.log("Nudged Scores after Dilemma:", State.getScores());
            UI.displayPersonaScreen(); // Update persona screen if visible
            UI.showTemporaryMessage("Dilemma choice influenced core understanding.", 3500);
            gainAttunementForAction('dilemmaNudge', 'All'); // Small generic attunement gain
            updateMilestoneProgress('scoreNudgeApplied', 1); // Count as a nudge
        } else {
            console.log("Dilemma nudge resulted in no score change.");
        }
    }

    UI.hidePopups();
    currentDilemma = null; // Clear the current dilemma
}


console.log("gameLogic.js loaded.");
// --- END OF gameLogic.js ---
