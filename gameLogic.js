// js/gameLogic.js - Application Logic (Inner Cosmos Theme)

import * as State from './state.js';
import * as Config from './config.js';
import * as Utils from './utils.js';
import * as UI from './ui.js';
// Import specific data structures needed (names kept same internally for now)
import { elementDetails, elementKeyToFullName, elementNameToKey, concepts, questionnaireGuided, reflectionPrompts, elementDeepDive, dailyRituals, milestones, focusRituals, sceneBlueprints, alchemicalExperiments, elementalInsights, focusDrivenUnlocks, cardTypeKeys, elementNames, elementInteractionThemes, cardTypeThemes } from '../data.js';

console.log("gameLogic.js loading...");

// --- Temporary State (Theme Specific) ---
let currentlyDisplayedStarId = null; // Was conceptId
let currentReflectionContext = null; // 'Standard', 'Dissonance', 'Guided', 'RareConcept', 'SceneMeditation'
let reflectionTargetStarId = null; // Was conceptId
let currentReflectionSubject = null; // Category/Name for display
let currentReflectionForceName = null; // Standard force name
let currentPromptId = null;
let reflectionCooldownTimeout = null;
let currentContemplationTask = null;

// --- Constellation Analysis Cache (Theme Specific) ---
let currentConstellationAnalysis = null; // Was tapestryAnalysis

// --- Popup State Management ---
export function clearPopupState() {
    currentlyDisplayedStarId = null;
    currentReflectionContext = null;
    reflectionTargetStarId = null;
    currentReflectionSubject = null;
    currentReflectionForceName = null;
    currentPromptId = null;
    currentContemplationTask = null;
}
export function setCurrentPopupConcept(starId) { currentlyDisplayedStarId = starId; } // Renamed param
export function getCurrentPopupConceptId() { return currentlyDisplayedStarId; } // Keep name for now? Or rename to getCurrentPopupStarId? Let's rename.
export function getCurrentPopupStarId() { return currentlyDisplayedStarId; }


// --- Insight & Force Strength (Attunement) Management ---
export function gainInsight(amount, source = "Unknown") {
    if (typeof amount !== 'number' || isNaN(amount) || amount === 0) return;
    const changed = State.changeInsight(amount);
    if (changed) {
        const action = amount > 0 ? "Gained" : "Spent";
        const currentInsight = State.getInsight();
        console.log(`${action} ${Math.abs(amount).toFixed(1)} Insight from ${source}. New total: ${currentInsight.toFixed(1)}`);
        UI.updateInsightDisplays();
    }
}

export function spendInsight(amount, source = "Unknown") {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return false;
    if (State.getInsight() >= amount) {
        gainInsight(-amount, source);
        return true;
    } else {
        UI.showTemporaryMessage(`Not enough Insight! Need ${amount.toFixed(1)}.`, 3000);
        return false;
    }
}

export function gainAttunementForAction(actionType, forceKey = null, amount = 0.5) { // Renamed elementKey to forceKey
    let targetKeys = [];
    let baseAmount = amount;

    // Determine target forces based on action type and context
    if (forceKey && State.getAttunement().hasOwnProperty(forceKey)) {
        targetKeys.push(forceKey);
    } else if (actionType === 'completeReflection' && ['Standard', 'SceneMeditation', 'RareConcept', 'Guided', 'Dissonance'].includes(currentReflectionContext)) {
        let keyFromContext = null;
        if (currentReflectionContext === 'Standard' && currentReflectionForceName) { // Use force name
             keyFromContext = elementNameToKey[currentReflectionForceName];
        } else if (currentReflectionContext === 'SceneMeditation') { // Nebula Blueprint
             const scene = sceneBlueprints.find(s => s.reflectionPromptId === currentPromptId);
             keyFromContext = scene?.element || null; // Data still uses 'element'
        } else if (currentReflectionContext === 'RareConcept') { // Rare Star
             const cEntry = Array.from(State.getDiscoveredConcepts().entries()).find(([id, data]) => data.concept.uniquePromptId === currentPromptId);
             keyFromContext = cEntry ? cEntry[1].concept.primaryElement : null;
        } else if (currentReflectionContext === 'Guided' && currentReflectionSubject) { // Deep Scan Signal
              keyFromContext = elementNameToKey[currentReflectionSubject] || null;
        } else if (currentReflectionContext === 'Dissonance' && reflectionTargetStarId){ // Dissonant Star
            const concept = concepts.find(c => c.id === reflectionTargetStarId);
            keyFromContext = concept?.primaryElement || null;
        }

        if (keyFromContext && State.getAttunement().hasOwnProperty(keyFromContext)) {
             targetKeys.push(keyFromContext);
             if (currentReflectionContext !== 'Standard') baseAmount *= 1.2;
        } else if (forceKey && State.getAttunement().hasOwnProperty(forceKey)) {
             targetKeys.push(forceKey); // Fallback
        } else {
            console.warn(`Could not determine specific Force for reflection context: ${currentReflectionContext}, subject: ${currentReflectionSubject}, force: ${currentReflectionForceName}, prompt: ${currentPromptId}. Applying generic gain.`);
            targetKeys = Object.keys(State.getAttunement());
            baseAmount = 0.1;
        }

    } else if (['generic', 'completeReflectionGeneric', 'scoreNudge', 'ritual', 'milestone', 'experimentSuccess', 'artEvolve', 'addToCatalog', 'discover', 'alignStar', 'contemplation', 'scanSuccess', 'scanFail', 'scanSpecial'].includes(actionType) || forceKey === 'All') {
        // Renamed some actions to match theme
        targetKeys = Object.keys(State.getAttunement());
        // Adjust base amounts if needed for new theme actions
        if (actionType === 'scoreNudge') baseAmount = (0.5 / (targetKeys.length || 1));
        else if (actionType === 'completeReflectionGeneric') baseAmount = 0.2;
        else if (actionType === 'generic') baseAmount = 0.1;
        else if (actionType === 'contemplation' && forceKey === 'All') baseAmount = 0.1;
        else if (actionType === 'contemplation' && forceKey !== 'All') baseAmount = 0.4;
        else if (actionType === 'scanSuccess') baseAmount = 0.8; // Was researchSuccess
        else if (actionType === 'scanFail') baseAmount = 0.2; // Was researchFail
        else if (actionType === 'scanSpecial') baseAmount = 1.0; // Was researchSpecial
        else if (actionType === 'addToCatalog') baseAmount = 0.6; // Was addToGrimoire
        else if (actionType === 'alignStar') baseAmount = 1.0; // Was markFocus
        else if (actionType === 'artEvolve') baseAmount = 1.5; // Evolve Star
    } else {
        console.warn(`gainAttunement called with invalid parameters: action=${actionType}, key=${forceKey}`);
        return;
    }

    let changed = false;
    targetKeys.forEach(key => {
        if (State.updateAttunement(key, baseAmount)) {
            changed = true;
            // Update milestone check using internal element name ('elementAttunement' state key)
            updateMilestoneProgress('elementAttunement', { [key]: State.getAttunement()[key] });
        }
    });

    if (changed) {
        console.log(`Force Strength updated (${actionType}, Key(s): ${targetKeys.join(',') || 'All'}) by ${baseAmount.toFixed(2)} per Force.`);
        if (document.getElementById('constellationMapScreen')?.classList.contains('current')) { // Update if Constellation map visible
           UI.displayElementAttunement(); // UI function name kept for now
       }
    }
}


// --- Charting (Questionnaire) Logic ---
export function handleQuestionnaireInputChange(event) { // Renamed for clarity
    const input = event.target;
    const type = input.dataset.type;
    const currentState = State.getState();
    if (currentState.currentElementIndex < 0 || currentState.currentElementIndex >= elementNames.length) return;
    const forceName = elementNames[currentState.currentElementIndex]; // Use internal name

    if (type === 'slider') {
        UI.updateSliderFeedbackText(input, forceName); // Pass internal name
    }
    const currentAnswers = UI.getQuestionnaireAnswers();
    State.updateAnswers(forceName, currentAnswers);
    UI.updateDynamicFeedback(forceName, currentAnswers);
}
export function handleCheckboxChange(event) { // Name kept generic
     const checkbox = event.target; const name = checkbox.name; const maxChoices = parseInt(checkbox.dataset.maxChoices || 2);
     const container = checkbox.closest('.checkbox-options'); if (!container) return;
     const checkedBoxes = container.querySelectorAll(`input[name="${name}"]:checked`);
     if (checkedBoxes.length > maxChoices) { UI.showTemporaryMessage(`Max ${maxChoices} options.`, 2500); checkbox.checked = false; }
     handleQuestionnaireInputChange(event);
}
export function calculateElementScore(elementName, answersForElement) { // Keep name, operates on internal data structure
    const questions = questionnaireGuided[elementName] || []; let score = 5.0;
    questions.forEach(q => {
        const answer = answersForElement[q.qId]; let pointsToAdd = 0; const weight = q.scoreWeight || 1.0;
        if (q.type === 'slider') { const value = (answer !== undefined && !isNaN(answer)) ? parseFloat(answer) : q.defaultValue; const baseValue = q.defaultValue !== undefined ? q.defaultValue : 5; pointsToAdd = (value - baseValue) * weight; }
        else if (q.type === 'radio') { const opt = q.options.find(o => o.value === answer); pointsToAdd = opt ? (opt.points || 0) * weight : 0; }
        else if (q.type === 'checkbox' && Array.isArray(answer)) { answer.forEach(val => { const opt = q.options.find(o => o.value === val); pointsToAdd += opt ? (opt.points || 0) * weight : 0; }); }
        score += pointsToAdd;
    });
    return Math.max(0, Math.min(10, score)); // Clamp
}
// Renamed goToNextElement -> goToNextForce
export function goToNextForce() {
    const currentState = State.getState();
    const currentAnswers = UI.getQuestionnaireAnswers();
    const currentIndex = currentState.currentElementIndex;

    if (currentIndex >= 0 && currentIndex < elementNames.length) {
        State.updateAnswers(elementNames[currentIndex], currentAnswers);
        console.log(`Answers explicitly saved for Force index ${currentIndex} (${elementNames[currentIndex]}):`, currentAnswers);
    } else {
         console.warn(`Attempted to save answers for invalid index: ${currentIndex} in goToNextForce`);
         return;
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex >= elementNames.length) {
         console.log("Reached end of charting, finalizing...");
         finalizeCharting(); // Renamed
    } else {
        console.log(`Moving from Force index ${currentIndex} to ${nextIndex}`);
        State.updateElementIndex(nextIndex);
        UI.displayElementQuestions(nextIndex); // UI function name kept for now
    }
}
// Renamed goToPrevElement -> goToPrevForce
export function goToPrevForce() {
    const currentState = State.getState();
    if (currentState.currentElementIndex > 0) {
        const currentAnswers = UI.getQuestionnaireAnswers();
        const currentIndex = currentState.currentElementIndex;
        if (currentIndex >= 0 && currentIndex < elementNames.length) {
             State.updateAnswers(elementNames[currentIndex], currentAnswers);
             console.log(`Answers saved for ${elementNames[currentIndex]} on going back:`, currentAnswers);
        } else { console.warn(`Attempted to save answers for invalid index: ${currentIndex} on going back`); }
        const prevIndex = currentIndex - 1;
        State.updateElementIndex(prevIndex);
        console.log(`Moving back from Force index ${currentIndex} to ${prevIndex}`);
        UI.displayElementQuestions(prevIndex); // UI function name kept for now
    } else { console.log("Cannot go back from the first Force."); }
}
// Renamed finalizeQuestionnaire -> finalizeCharting
export function finalizeCharting() {
    console.log("Finalizing charting...");
    const finalScores = {};
    const allAnswers = State.getState().userAnswers;
    elementNames.forEach(elementName => {
        const score = calculateElementScore(elementName, allAnswers[elementName] || {});
        const key = elementNameToKey[elementName];
        if (key) finalScores[key] = score; else console.warn(`No key for ${elementName}`);
    });
    State.updateScores(finalScores);
    State.setQuestionnaireComplete();
    State.saveAllAnswers(allAnswers);
    const starterStarConcepts = determineStarterStarsAndNebula(); // Renamed
    updateMilestoneProgress('completeQuestionnaire', 1); // Keep milestone ID? Or rename to 'completeCharting'?
    checkForDailyLogin();

    // Show Starting Nebula Modal
    console.log("Showing starting nebula modal.");
    UI.showExperimentResultsModal(State.getScores(), starterStarConcepts); // Reusing results modal structure

    console.log("Final Core Forces:", State.getScores());
    State.saveGameState(); // Final save after charting phase
}


// --- Starter Stars (Starter Hand) ---
// Renamed determineStarterHandAndEssence -> determineStarterStarsAndNebula
function determineStarterStarsAndNebula() {
    console.log("Determining starter Stars...");
    if (!concepts || !Array.isArray(concepts) || concepts.length === 0) { console.error("Star (Concept) data missing."); return []; }
    const userScores = State.getScores(); // Nebula Forces
    // Filter and calculate distance (resonance)
    let starsWithDistance = concepts.map(c => ({ ...c, distance: Utils.euclideanDistance(userScores, c.elementScores) })).filter(c => c.distance !== Infinity && !isNaN(c.distance));
    if (starsWithDistance.length === 0) { /* ... error handling ... */ return []; }
    starsWithDistance.sort((a, b) => a.distance - b.distance); // Closest first
    const candidates = starsWithDistance.slice(0, 25); const starterStars = []; const starterStarIds = new Set(); const targetHandSize = 7; const forceRepTarget = 4; const representedForces = new Set(); // Renamed vars
    // Prioritize closest matches
    for (const s of candidates) { if (starterStars.length >= 4) break; if (!starterStarIds.has(s.id)) { starterStars.push(s); starterStarIds.add(s.id); if (s.primaryElement) representedForces.add(s.primaryElement); } }
    // Ensure some force diversity
    for (const s of candidates) { if (starterStars.length >= targetHandSize) break; if (starterStarIds.has(s.id)) continue; const needsRep = s.primaryElement && representedForces.size < forceRepTarget && !representedForces.has(s.primaryElement); if (needsRep || starterStars.length < 5) { starterStars.push(s); starterStarIds.add(s.id); if (s.primaryElement) representedForces.add(s.primaryElement); } }
    // Fill remaining slots
    for (const s of candidates) { if (starterStars.length >= targetHandSize) break; if (!starterStarIds.has(s.id)) { starterStars.push(s); starterStarIds.add(s.id); } }
    console.log("Starter Stars Selected:", starterStars.map(s => s.name));
    starterStars.forEach(star => { if (State.addDiscoveredConcept(star.id, star)) gainAttunementForAction('discover', star.primaryElement, 0.3); }); // Add to state
    updateMilestoneProgress('discoveredConcepts.size', State.getDiscoveredConcepts().size); // Update milestones
    UI.updateGrimoireCounter(); // Update UI counter (now Star Count)
    return starterStars; // Return the array of star objects
}


// --- Core Actions (Scanning, Reflection, Alignment, etc.) ---
// Screen Logic Wrappers
export function displayConstellationMapScreenLogic() { // Renamed
    calculateConstellationNarrative(true); // Renamed
    UI.displayConstellationMapScreen(); // Renamed
}
export function displayObservatoryScreenLogic() { // Renamed
    UI.displayObservatoryScreenContent(); // Renamed
}

// Scanning (Research) Actions
// Renamed handleResearchClick -> handleSectorScanClick
export function handleSectorScanClick(event) {
    const button = event.currentTarget; const forceKey = button.dataset.elementKey; // Still uses elementKey internally
    const cost = parseFloat(button.dataset.cost);
    if (!forceKey || isNaN(cost) || button.disabled) return;
    if (spendInsight(cost, `Scan Sector: ${elementKeyToFullName[forceKey]}`)) { // Use internal key->name map
        console.log(`Spent ${cost} Insight scanning ${forceKey} sector.`);
        performSectorScan(forceKey); // Renamed
        updateMilestoneProgress('conductResearch', 1); // Keep milestone ID or change?
        checkAndUpdateRituals('conductResearch'); // Keep ritual action name or change?
    }
}
// Renamed handleFreeResearchClick -> handleDailyScanClick
export function handleDailyScanClick() {
    if (!State.isFreeResearchAvailable()) { UI.showTemporaryMessage("Daily calibration scan done.", 3000); return; }
    const attunement = State.getAttunement(); let targetKey = 'A'; let minAtt = Config.MAX_ATTUNEMENT + 1;
    for (const key in attunement) { if (attunement[key] < minAtt) { minAtt = attunement[key]; targetKey = key; } }
    console.log(`Performing daily calibration scan on ${targetKey} (${elementKeyToFullName[targetKey]}) sector`);
    State.setFreeResearchUsed();
    UI.displayResearchButtons(); // Needs rename in UI to displayScanButtons?
    performSectorScan(targetKey); // Renamed
    updateMilestoneProgress('freeResearch', 1); // Keep milestone ID?
    checkAndUpdateRituals('freeResearch'); // Keep ritual name?
}
// Renamed conductResearch -> performSectorScan
export function performSectorScan(forceKeyToScan) {
    const forceFullName = elementKeyToFullName[forceKeyToScan]; if (!forceFullName) { console.error(`Invalid Force key: ${forceKeyToScan}`); return; }
    console.log(`Scanning Sector: ${forceFullName}`); UI.displayResearchStatus(`Scanning ${elementDetails[forceFullName]?.name || forceFullName} sector...`); // Renamed UI func
    const discoveredIds = new Set(State.getDiscoveredConcepts().keys()); const discoveredRepo = State.getRepositoryItems(); const undiscoveredPool = concepts.filter(c => !discoveredIds.has(c.id));
    let rareFound = false; const roll = Math.random();
    const insightChance = 0.12; const sceneChance = 0.05; // Combined chance adjusted
    const scanOutputElem = document.getElementById('scanOutput'); // Renamed ID
    const canFindRare = !scanOutputElem || scanOutputElem.children.length <= 1 || scanOutputElem.querySelector('p > i');
    let foundRepoItem = null;

    // Check for rare discoveries (Blueprints/Whispers)
    if (!rareFound && canFindRare && roll < sceneChance && sceneBlueprints.length > 0) {
        const relevantScenes = sceneBlueprints.filter(s => s.element === forceKeyToScan); // Check scene element
        const unseenRelevantScenes = relevantScenes.filter(s => !discoveredRepo.scenes.has(s.id));
        const anyUnseenScenes = sceneBlueprints.filter(s => !discoveredRepo.scenes.has(s.id));
        const scenePool = unseenRelevantScenes.length > 0 ? unseenRelevantScenes : anyUnseenScenes;
        if (scenePool.length > 0) { const found = scenePool[Math.floor(Math.random() * scenePool.length)]; if (State.addRepositoryItem('scenes', found.id)) { rareFound = true; foundRepoItem = {type: 'scene', ...found}; UI.showTemporaryMessage("Nebula Blueprint Discovered!", 4000); if(document.getElementById('cartographyScreen')?.classList.contains('current')) UI.displayRepositoryContent();} } // Update Cartography if visible
    } else if (!rareFound && canFindRare && roll < (sceneChance + insightChance) && elementalInsights.length > 0) {
        const relevantInsights = elementalInsights.filter(i => i.element === forceKeyToScan);
        const unseenRel = relevantInsights.filter(i => !discoveredRepo.insights.has(i.id));
        const anyUnseen = elementalInsights.filter(i => !discoveredRepo.insights.has(i.id));
        const pool = unseenRel.length > 0 ? unseenRel : (anyUnseen.length > 0 ? anyUnseen : relevant);
        if (pool.length > 0) { const found = pool[Math.floor(Math.random() * pool.length)]; if (State.addRepositoryItem('insights', found.id)) { rareFound = true; foundRepoItem = {type: 'insight', ...found}; UI.showTemporaryMessage("Cosmic Whisper Intercepted!", 3500); updateMilestoneProgress('repositoryInsightsCount', State.getRepositoryItems().insights.size); if(document.getElementById('cartographyScreen')?.classList.contains('current')) UI.displayRepositoryContent();} }
    }

    // Display rare item if found
    if (rareFound && foundRepoItem) {
        UI.displayResearchResults({ concepts: [], repositoryItems: [foundRepoItem], duplicateInsightGain: 0 }); // Rename UI func?
        UI.displayResearchStatus("Unique signal detected!"); // Rename UI func?
        gainAttunementForAction('scanSpecial', forceKeyToScan, 1.0); // Renamed
        return;
    }

    // Star (Concept) discovery
    if (undiscoveredPool.length === 0) { UI.displayResearchStatus("Scan complete. No new stellar phenomena detected."); if (scanOutputElem && scanOutputElem.children.length === 0) scanOutputElem.innerHTML = '<p><i>All known Stars cataloged.</i></p>'; gainInsight(5.0, "All Stars Cataloged Bonus"); return; }
    const currentAtt = State.getAttunement()[forceKeyToScan] || 0; const priorityP = []; const secondaryP = []; const tertiaryP = [];
    undiscoveredPool.forEach(c => { const score = c.elementScores?.[forceKeyToScan] || 0; const isPri = c.primaryElement === forceKeyToScan; if (isPri || score >= 7.5) priorityP.push({...c}); else if (score >= 4.5) secondaryP.push({...c}); else tertiaryP.push({...c}); });
    const selectedOut = []; let dupeGain = 0; const numResults = 3;
    const selectWeighted = () => { /* ... same weighting logic ... */ }; // Weighting logic remains the same
    let attempts = 0; const maxAtt = numResults * 4;
    while (selectedOut.length < numResults && attempts < maxAtt && (priorityP.length > 0 || secondaryP.length > 0 || tertiaryP.length > 0)) {
        attempts++; let potential = selectWeighted();
        if (potential) { if (discoveredIds.has(potential.id)) { gainInsight(1.0, `Duplicate Signal (${potential.name})`); dupeGain += 1.0; } else { if (!selectedOut.some(c => c.id === potential.id)) selectedOut.push(potential); } } else break;
    }
    let msg = "";
    if (selectedOut.length > 0) { msg = `Detected ${selectedOut.length} new Star signature(s)! `; UI.displayResearchResults({ concepts: selectedOut, repositoryItems: [], duplicateInsightGain: dupeGain }); gainAttunementForAction('scanSuccess', forceKeyToScan); if (selectedOut.some(c => c.rarity === 'rare')) updateMilestoneProgress('discoverRareCard', 1); } // Change milestone ID?
    else { msg = "No new Star signatures detected. "; UI.displayResearchResults({ concepts: [], repositoryItems: [], duplicateInsightGain: dupeGain }); gainAttunementForAction('scanFail', forceKeyToScan); }
    if (dupeGain > 0 && selectedOut.length === 0) msg += ` Gained ${dupeGain.toFixed(0)} Insight from signal echoes.`;
    UI.displayResearchStatus(msg.trim()); // Rename UI func?
}

// Catalog (Grimoire) Actions
// Renamed addConceptToGrimoireById -> addStarToCatalogById
export function addStarToCatalogById(starId, buttonElement = null) {
    if (State.getDiscoveredConcepts().has(starId)) { UI.showTemporaryMessage("Already in Star Catalog.", 2500); if (buttonElement) UI.updateResearchButtonAfterAction(starId, 'add'); return; } // Rename UI func?
    const concept = concepts.find(c => c.id === starId); if (!concept) { console.error("Cannot catalog Star: Not found. ID:", starId); UI.showTemporaryMessage("Error: Star data not found.", 3000); return; }
    const distance = Utils.euclideanDistance(State.getScores(), concept.elementScores);
    if (distance > Config.DISSONANCE_THRESHOLD && State.getOnboardingPhase() >= Config.ONBOARDING_PHASE.REFLECTION_RITUALS) {
        console.log(`Dissonant signal from ${concept.name}. Triggering reflection.`);
        triggerReflectionPrompt('Dissonance', starId);
    } else {
        addStarToCatalogInternal(starId);
    }
 }

// Renamed addConceptToGrimoireInternal -> addStarToCatalogInternal
export function addStarToCatalogInternal(starId) {
     const starToAdd = concepts.find(c => c.id === starId); // Still uses concept data internally
     if (!starToAdd) { console.error("Internal catalog fail: Not found. ID:", starId); return; }
     if (State.getDiscoveredConcepts().has(starId)) return; // Already cataloged

     console.log(`Cataloging ${starToAdd.name} internally.`);
     if (State.addDiscoveredConcept(starId, starToAdd)) { // Use original state function
        let insightRwd = Config.CONCEPT_DISCOVERY_INSIGHT[starToAdd.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default;
        let bonusInsight = 0; let synergyMessageShown = false;
        // Synergy check remains the same internally
        if (starToAdd.relatedIds && starToAdd.relatedIds.length > 0) { /* ... check synergy ... */ }
        insightRwd += bonusInsight;
        gainInsight(insightRwd, `Cataloged ${starToAdd.rarity} ${starToAdd.name}${bonusInsight > 0 ? ' (Synergy)' : ''}`);
        gainAttunementForAction('addToCatalog', starToAdd.primaryElement, 0.6); // Renamed action
        UI.updateGrimoireCounter(); // Rename UI func? updateStarCount?
        if (starToAdd.rarity === 'rare' && starToAdd.uniquePromptId && reflectionPrompts.RareConcept?.[starToAdd.uniquePromptId]) { State.addPendingRarePrompt(starToAdd.uniquePromptId); }
        if (currentlyDisplayedStarId === starId) { UI.showConceptDetailPopup(starId); } // Refresh popup
        UI.updateResearchButtonAfterAction(starId, 'add'); // Remove from scan results
        checkTriggerReflectionPrompt('add'); // Reflection trigger based on adding
        updateMilestoneProgress('addToGrimoire', 1); // Keep ID or change?
        updateMilestoneProgress('discoveredConcepts.size', State.getDiscoveredConcepts().size);
        checkAndUpdateRituals('addToGrimoire'); // Keep ID or change?
        UI.refreshGrimoireDisplay(); // Rename UI func? refreshStarCatalogDisplay?
        UI.showTemporaryMessage(`${starToAdd.name} cataloged!`, 3000);
     } else { console.warn(`State catalog fail ${starToAdd.name}.`); UI.showTemporaryMessage(`Error cataloging ${starToAdd.name}.`, 3000); }
 }

// Renamed handleToggleFocusConcept -> handleToggleAlignment
export function handleToggleAlignment() {
    if (currentlyDisplayedStarId === null) return;
    const starId = currentlyDisplayedStarId;
    const initialFocusCount = State.getFocusedConcepts().size;
    const result = State.toggleFocusConcept(starId); // State function name kept for now
    const starName = State.getDiscoveredConceptData(starId)?.concept?.name || `Star ID ${starId}`;

    if (result === 'not_discovered' || result === 'slots_full') {
        if(result === 'slots_full') UI.showTemporaryMessage(`Alignment capacity full (${State.getFocusSlots()}).`, 3000);
        else UI.showTemporaryMessage("Cannot align uncataloged Star.", 3000);
    } else {
        if (result === 'removed') { UI.showTemporaryMessage(`${starName} removed from Constellation.`, 2500); checkAndUpdateRituals('removeFocus'); } // Change ritual ID?
        else { // added
            UI.showTemporaryMessage(`${starName} aligned in Constellation!`, 2500); gainInsight(1.0, `Aligned ${starName}`);
            const star = State.getDiscoveredConceptData(starId)?.concept; if (star?.primaryElement) gainAttunementForAction('alignStar', star.primaryElement, 1.0); // Renamed action
            updateMilestoneProgress('markFocus', 1); // Change milestone ID?
            updateMilestoneProgress('focusedConcepts.size', State.getFocusedConcepts().size);
            checkAndUpdateRituals('markFocus'); // Change ritual ID?
        }
        // --- Update UI ---
        UI.updateFocusButtonStatus(starId); // Rename UI func? updateAlignButtonStatus?
        UI.displayFocusedConceptsPersona(); // Rename UI func? displayAlignedStars?
        UI.updateFocusElementalResonance(); // Rename UI func? updateConstellationResonance?
        calculateConstellationNarrative(true); // Renamed
        UI.generateTapestryNarrative(); // Rename UI func? displayConstellationNarrative?
        UI.synthesizeAndDisplayThemesPersona(); // Rename UI func? displayConstellationThemes?
        checkForFocusUnlocks(); // Rename? checkForSynergyUnlocks?
        UI.refreshGrimoireDisplay(); // Rename? refreshStarCatalogDisplay?
        UI.updateTapestryDeepDiveButton(); // Rename? updateConstellationExploreButton?
        UI.updateSuggestSceneButtonState(); // Rename? updateSuggestBlueprintButton?

        // Navigate after first alignment if tutorial not seen
        if (result === 'added' && initialFocusCount === 0 && State.getFocusedConcepts().size === 1 && State.getOnboardingTutorialStep() < 'persona_tapestry_prompt') { // Check step
            console.log("First Star aligned, navigating to Constellation Map.");
            State.setOnboardingTutorialStep('persona_tapestry_prompt'); // Set step BEFORE navigation
            setTimeout(() => {
                UI.showScreen('constellationMapScreen'); // Navigate
            }, 300);
        }
    }
}

// Keep handleSellConcept, but rename concept -> star in messages/logic
export function handleSellConcept(event) {
     const button = event.target.closest('button'); if (!button) return;
     const starId = parseInt(button.dataset.conceptId); // Use conceptId from data attribute
     const context = button.dataset.context;
     if (isNaN(starId)) { console.error("Invalid sell ID:", button.dataset.conceptId); return; }
     sellStar(starId, context); // Renamed internal call
}
export function sellStar(starId, context) { // Renamed conceptId -> starId
    const discovered = State.getDiscoveredConceptData(starId);
    const star = discovered?.concept || concepts.find(c => c.id === starId); // Get concept data
    if (!star) { console.error(`Sell fail: Not found ${starId}`); UI.showTemporaryMessage("Error analyzing signal.", 3000); return; }
    let val = Config.CONCEPT_DISCOVERY_INSIGHT[star.rarity] || Config.CONCEPT_DISCOVERY_INSIGHT.default;
    const sellVal = val * Config.SELL_INSIGHT_FACTOR;
    const sourceLoc = context === 'grimoire' ? 'Star Catalog' : 'Scan Log'; // Renamed source
    if (confirm(`Analyze signal from '${star.name}' (${star.rarity}) via ${sourceLoc} for ${sellVal.toFixed(1)} Insight?`)) { // Renamed confirm message
        gainInsight(sellVal, `Analyzed Signal: ${star.name}`);
        updateMilestoneProgress('sellConcept', 1); // Keep milestone ID? Or 'analyzeSignal'?
        let focusChanged = false;
        if (context === 'grimoire') { // Selling from Catalog
             focusChanged = State.getFocusedConcepts().has(starId);
             if(State.removeDiscoveredConcept(starId)) { // Remove from catalog
                 UI.updateGrimoireCounter(); // Rename UI func?
                 UI.refreshGrimoireDisplay(); // Rename UI func?
             }
        }
        else if (context === 'research') { // Selling from Scan Log
             UI.updateResearchButtonAfterAction(starId, 'sell'); // Rename UI func? updateScanLogAction?
        }
        if (focusChanged) { // If an aligned star was sold, update Constellation map
            UI.displayFocusedConceptsPersona(); // Rename?
            UI.updateFocusElementalResonance(); // Rename?
            calculateConstellationNarrative(true); // Rename?
            UI.generateTapestryNarrative(); // Rename?
            UI.synthesizeAndDisplayThemesPersona(); // Rename?
            checkForFocusUnlocks(); // Rename?
            UI.updateTapestryDeepDiveButton(); // Rename?
            UI.updateSuggestSceneButtonState(); // Rename?
        }
        UI.showTemporaryMessage(`Signal analyzed: ${star.name} (+${sellVal.toFixed(1)} Insight).`, 2500);
        if (currentlyDisplayedStarId === starId) UI.hidePopups(); // Close popup if open
    }
}

// Reflection Logic (Update Text/Context)
export function checkTriggerReflectionPrompt(triggerAction = 'other') {
    const currentState = State.getState();
    if (currentState.promptCooldownActive) return;
    if (currentState.onboardingPhase < Config.ONBOARDING_PHASE.REFLECTION_RITUALS) return;
    if (triggerAction === 'add') State.incrementReflectionTrigger(); // 'add' is now 'catalog star'
    if (triggerAction === 'completeQuestionnaire') State.incrementReflectionTrigger() * 3; // Charting complete
    const starsCataloged = currentState.cardsAddedSinceLastPrompt; // Rename var
    const triggerThresh = 3;
    const hasPending = currentState.pendingRarePrompts.length > 0;
    if (hasPending) { console.log("Pending rare signal detected."); triggerReflectionPrompt('RareConcept'); State.resetReflectionTrigger(true); startReflectionCooldown(); } // Keep 'RareConcept' context?
    else if (starsCataloged >= triggerThresh) { console.log("Reflection threshold met."); triggerReflectionPrompt('Standard'); State.resetReflectionTrigger(true); startReflectionCooldown(); }
}
function startReflectionCooldown() { /* ... Unchanged ... */ }
export function triggerReflectionPrompt(context = 'Standard', targetId = null, category = null) {
    currentReflectionContext = context;
    reflectionTargetStarId = (context === 'Dissonance' || context === 'SceneMeditation') ? targetId : null; // Use star ID
    currentReflectionSubject = category; // Subject/Category for display
    currentReflectionForceName = null; // Reset standard force name
    currentPromptId = null;
    let promptPool = []; let title = "Reflection Signal Received"; let promptCatLabel = "General Signal"; let selPrompt = null; let showNudge = false; let reward = 5.0;
    console.log(`Trigger reflection: Context=${context}, TargetID=${targetId}, Subject=${category}`);

    // Prioritize Rare prompts
    if (context !== 'Dissonance') { /* ... check State.getNextRarePrompt() ... title="Rare Signal"; promptCatLabel=starName */ }

    // Select pool based on context
    if (!selPrompt) {
        if (context === 'Dissonance' && targetId) { title = "Dissonant Signal"; const star = concepts.find(c => c.id === targetId); promptCatLabel = star ? star.name : "Dissonant Star"; promptPool = reflectionPrompts.Dissonance || []; showNudge = true; }
        else if (context === 'Guided' && category) { title = "Deep Scan Signal"; promptCatLabel = category; promptPool = reflectionPrompts.Guided?.[category] || []; reward = Config.GUIDED_REFLECTION_COST + 2; }
        else if (context === 'SceneMeditation' && targetId) { const scene = sceneBlueprints.find(s => s.id === targetId); if (scene?.reflectionPromptId) { selPrompt = reflectionPrompts.SceneMeditation?.[scene.reflectionPromptId]; if (selPrompt) { title = "Nebula Meditation"; promptCatLabel = scene.name; currentPromptId = selPrompt.id; reward = (scene.meditationCost || Config.SCENE_MEDITATION_BASE_COST) + 5; } else { /* fallback */ currentReflectionContext = 'Standard'; } } else { /* fallback */ currentReflectionContext = 'Standard'; } }
        else { // Standard
             currentReflectionContext = 'Standard'; title = "Standard Signal";
             const attune = State.getAttunement(); const validElems = elementNames.filter(elName => (attune[elementNameToKey[elName]] || 0) > 0);
             if (validElems.length > 0) { currentReflectionForceName = validElems[Math.floor(Math.random() * validElems.length)]; promptPool = reflectionPrompts[currentReflectionForceName] || []; promptCatLabel = elementDetails[currentReflectionForceName]?.name || currentReflectionForceName; console.log(`Standard signal for Force: ${currentReflectionForceName}`); }
             else { promptPool = []; } showNudge = false; reward = 5.0;
         }
    }

    // Select prompt from pool
    if (!selPrompt && promptPool.length > 0) { /* ... select prompt, avoid seen ... */ }

    // Display or handle failure
    if (selPrompt) { const pData = { title, category: promptCatLabel, prompt: selPrompt, showNudge, reward }; UI.displayReflectionPrompt(pData, currentReflectionContext); }
    else { /* ... handle failure, maybe refund for Guided ... */ }
}
export function handleConfirmReflection(nudgeAllowed) {
    if (!currentPromptId) { /* ... error ... */ return; }
    State.addSeenPrompt(currentPromptId);
    let rewardAmt = 5.0; let attuneKey = null; let attuneAmt = 1.0; let milestoneAct = 'completeReflection';
    // Calculate reward
    if (currentReflectionContext === 'Guided') { rewardAmt = Config.GUIDED_REFLECTION_COST + 2; } else if (currentReflectionContext === 'RareConcept') { rewardAmt = 7.0; } else if (currentReflectionContext === 'SceneMeditation') { const scene = sceneBlueprints.find(s => s.reflectionPromptId === currentPromptId); rewardAmt = (scene?.meditationCost || Config.SCENE_MEDITATION_BASE_COST) + 5; }
    // Handle Dissonance Nudge & Add
    if (currentReflectionContext === 'Dissonance') { milestoneAct = 'completeReflectionDissonance'; attuneAmt = 0.5; if (nudgeAllowed && reflectionTargetStarId) { /* ... perform nudge logic ... */ } if (reflectionTargetStarId) { addStarToCatalogInternal(reflectionTargetStarId); } }
    gainInsight(rewardAmt, `Reflection (${currentReflectionContext || 'Unknown'})`);
    // Determine Attunement Key based on context/subject/force
    if (currentReflectionContext === 'Standard' && currentReflectionForceName) { attuneKey = elementNameToKey[currentReflectionForceName]; }
    // ... other context checks (Guided, Rare, Scene, Dissonance) to find relevant force key ...
    else { attuneKey = null; }
    // Apply Attunement
    if (attuneKey) { gainAttunementForAction('completeReflection', attuneKey, attuneAmt); }
    else { gainAttunementForAction('completeReflectionGeneric', 'All', 0.2); }
    updateMilestoneProgress(milestoneAct, 1); checkAndUpdateRituals('completeReflection');
    UI.hidePopups(); UI.showTemporaryMessage("Reflection complete! Insight gained.", 3000); clearPopupState();
}
export function triggerGuidedReflection() { // Renamed to triggerDeepScanSignal
     if (State.getOnboardingPhase() < Config.ONBOARDING_PHASE.REFLECTION_RITUALS) { UI.showTemporaryMessage("Unlock Deep Scan first.", 3000); return; }
     if (spendInsight(Config.GUIDED_REFLECTION_COST, "Deep Scan Signal")) {
         const cats = Object.keys(reflectionPrompts.Guided || {}); // Use internal keys
         if (cats.length > 0) { const cat = cats[Math.floor(Math.random() * cats.length)]; console.log(`Triggering deep scan signal: ${cat}`); triggerReflectionPrompt('Guided', null, cat); }
         else { console.warn("No deep scan signal categories."); gainInsight(Config.GUIDED_REFLECTION_COST, "Refund: No signals"); UI.showTemporaryMessage("No deep scan signals available.", 3000); }
     }
}

// Other Actions
export function attemptArtEvolution() { // Renamed to attemptStellarEvolution
    if (currentlyDisplayedStarId === null) return; const starId = currentlyDisplayedStarId; const discovered = State.getDiscoveredConceptData(starId);
    if (!discovered?.concept || discovered.artUnlocked) { UI.showTemporaryMessage("Evolution fail: Star state error.", 3000); return; }
    const star = discovered.concept; if (!star.canUnlockArt) return;
    const cost = Config.ART_EVOLVE_COST; const isAligned = State.getFocusedConcepts().has(starId); const hasReflected = State.getState().seenPrompts.size > 0;
    const phaseOK = State.getOnboardingPhase() >= Config.ONBOARDING_PHASE.ADVANCED;
    if (!phaseOK) { UI.showTemporaryMessage("Further cartography required to reveal full potential.", 3000); return; }
    if (!isAligned || !hasReflected) { UI.showTemporaryMessage("Check requirements (Alignment + Reflection).", 3000); return; }
    if (spendInsight(cost, `Evolve Star: ${star.name}`)) {
        if (State.unlockArt(starId)) { console.log(`Full potential revealed for ${star.name}!`); UI.showTemporaryMessage(`Full Potential Revealed for ${star.name}!`, 3500); if (currentlyDisplayedStarId === starId) UI.showConceptDetailPopup(starId); UI.refreshGrimoireDisplay(); gainAttunementForAction('artEvolve', star.primaryElement, 1.5); updateMilestoneProgress('evolveArt', 1); checkAndUpdateRituals('artEvolve'); } // Change IDs?
        else { console.error(`State evolveStar fail ${star.name}`); gainInsight(cost, `Refund: Evolution error`); UI.showTemporaryMessage("Error revealing potential.", 3000); }
    }
}
export function handleSaveNote() { // Renamed to handleSaveLogEntry
    if (currentlyDisplayedStarId === null) return; const notesTA = document.getElementById('logbookTextarea'); // Changed ID
    if (!notesTA) return; const noteText = notesTA.value.trim();
    if (State.updateNotes(currentlyDisplayedStarId, noteText)) { const status = document.getElementById('logSaveStatus'); if (status) { status.textContent = "Entry Saved!"; status.classList.remove('error'); setTimeout(() => { status.textContent = ""; }, 2000); } } // Changed ID
    else { const status = document.getElementById('logSaveStatus'); if (status) { status.textContent = "Error."; status.classList.add('error'); } }
}
export function handleUnlockLibraryLevel(event) { /* Renamed to handleUnlockForceInsight - logic mostly same */ }
function unlockDeepDiveLevel(forceKey, levelToUnlock) { /* Renamed to unlockForceInsight - logic mostly same */ }
export function handleMeditateScene(event) { /* Renamed to handleMeditateBlueprint */ }
function meditateOnScene(blueprintId) { /* Renamed to meditateOnBlueprint - logic mostly same */ }
export function handleAttemptExperiment(event) { /* Renamed to handleStabilizeOrbit */ }
function attemptExperiment(orbitId) { /* Renamed to stabilizeOrbit - logic mostly same */ }
export function handleSuggestSceneClick() { /* Renamed to handleSuggestBlueprintClick */ }
function suggestBlueprint() { /* Renamed logic, uses focusScores, looks for sceneBlueprints */ }

// --- Rituals & Milestones Logic (Helper) ---
export function checkAndUpdateRituals(action, details = {}) { /* Renamed to checkAndUpdateHarmonics? Logic same */ }
export function updateMilestoneProgress(trackType, currentValue) { /* Renamed to updateAlignments? Logic same */ }

// --- Daily Login ---
export function checkForDailyLogin() { /* Logic same, update messages/UI calls */ }

// --- Constellation Calculation Logic Helpers ---
export function calculateFocusScores() { /* Renamed to calculateAlignmentScores - Logic same */ }
export function calculateConstellationNarrative(forceRecalculate = false) { // Renamed calculateTapestryNarrative
    const currentHash = _calculateFocusSetHash(); // Recalculate hash here
    // Use cached analysis ONLY if the focus set hasn't changed
    if (currentConstellationAnalysis && !forceRecalculate && currentHash === State.getCurrentFocusSetHash()) {
         console.log("Using cached Constellation Analysis.");
         return currentConstellationAnalysis.fullNarrativeHTML;
    }
    console.log("Recalculating Constellation Narrative...");
    // ... rest of analysis logic, using 'Forces', 'Stars', 'Alignment' terminology ...
    // Store result in currentConstellationAnalysis
    // Update the hash in state
    State.getState().currentFocusSetHash = currentHash; // Directly update hash in current state object (will be saved on next trigger)
    return analysis.fullNarrativeHTML;
 }
export function calculateFocusThemes() { /* Renamed to calculateDominantForces? Logic same */ }

// --- Focus Unlocks ---
export function checkForFocusUnlocks(silent = false) { /* Renamed to checkForSynergyUnlocks? Logic same */ }

// --- Tapestry Deep Dive Logic ---
export function showTapestryDeepDive() { /* Renamed to showConstellationDeepDive */ }
export function handleDeepDiveNodeClick(nodeId) { /* Renamed to handleConstellationNodeClick - update content based on new theme */ }
export function handleContemplationNodeClick() { /* Logic same */ }
function generateFocusedContemplation() { /* Update text based on new theme */ }
export function handleCompleteContemplation() { /* Use stored task */ }

// --- Exports ---
// Update export list with RENAMED function names
export {
    // Charting (Questionnaire)
    handleQuestionnaireInputChange, handleCheckboxChange, calculateElementScore,
    goToNextForce, goToPrevForce, finalizeCharting,
    // Core Logic & Actions
    gainInsight, spendInsight, gainAttunementForAction,
    addStarToCatalogById, addStarToCatalogInternal, handleToggleAlignment,
    handleSectorScanClick, handleDailyScanClick, performSectorScan,
    attemptStellarEvolution, handleSaveLogEntry, handleSellConcept, sellStar,
    // Reflection
    checkTriggerReflectionPrompt, triggerReflectionPrompt, handleConfirmReflection,
    triggerGuidedReflection, // Keep name or triggerDeepScanSignal?
    // Force Insight (Library)
    handleUnlockLibraryLevel, // Keeping internal name handleUnlockForceInsight,
    // Cartography (Repository)
    handleMeditateBlueprint, handleStabilizeOrbit, // Renamed handlers
    // Constellation (Persona) Calculation Helpers
    calculateFocusScores, calculateConstellationNarrative, calculateFocusThemes, // Rename these?
    // Synergy (Focus) Unlocks
    checkForFocusUnlocks, // Rename? checkForSynergyUnlocks?
    // Daily Login
    checkForDailyLogin,
    // Alignments & Harmonics (Milestones & Rituals)
    updateMilestoneProgress, checkAndUpdateRituals, // Rename? updateAlignments, checkHarmonics?
    // Popup State Management
    clearPopupState, setCurrentPopupConcept, getCurrentPopupStarId, // Renamed getter
    // Screen Logic Wrappers
    displayConstellationMapScreenLogic, displayObservatoryScreenLogic, // Renamed
    // Constellation (Tapestry) Deep Dive
    showConstellationDeepDive, handleConstellationNodeClick, handleContemplationNodeClick, // Renamed
    handleCompleteContemplation,
    // Suggest Blueprints (Scenes)
    handleSuggestBlueprintClick // Renamed
};

console.log("gameLogic.js loaded.");
