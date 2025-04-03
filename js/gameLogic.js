// gameLogic.js - Application Logic (Inner Cosmos Theme)
import * as State from './state.js';
import * as Config from './config.js';
import * as Utils from './utils.js';
import * as UI from './ui.js';
import {
  elementDetails,
  elementKeyToFullName,
  elementNameToKey,
  concepts,
  questionnaireGuided,
  reflectionPrompts,
  elementDeepDive,
  dailyRituals,
  milestones,
  focusRituals,
  sceneBlueprints,
  alchemicalExperiments,
  elementalInsights,
  focusDrivenUnlocks,
  cardTypeKeys,
  elementNames,
  forceInteractionThemes,
  starTypeThemes
} from '../data.js';

console.log("gameLogic.js loading...");

// --- Temporary State Variables ---
let currentlyDisplayedStarId = null;
let currentReflectionContext = null;
let reflectionTargetStarId = null;
let currentReflectionSubject = null;
let currentReflectionForceName = null;
let currentPromptId = null;
let reflectionCooldownTimeout = null;
let currentContemplationTask = null;
let currentConstellationAnalysis = null;

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

export function setCurrentPopupConcept(starId) {
  currentlyDisplayedStarId = starId;
}

export function getCurrentPopupStarId() {
  return currentlyDisplayedStarId;
}

// --- Insight & Attunement Management ---
function gainInsight(amount, source = "Unknown") {
  if (typeof amount !== 'number' || isNaN(amount) || amount === 0) return;
  const changed = State.changeInsight(amount);
  if (changed) {
    const action = amount > 0 ? "Gained" : "Spent";
    const currentInsight = State.getInsight();
    console.log(`${action} ${Math.abs(amount).toFixed(1)} Insight from ${source}. New total: ${currentInsight.toFixed(1)}`);
    UI.updateInsightDisplays();
  }
}

function spendInsight(amount, source = "Unknown") {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return false;
  if (State.getInsight() >= amount) {
    gainInsight(-amount, source);
    return true;
  } else {
    UI.showTemporaryMessage(`Not enough Insight! Need ${amount.toFixed(1)}.`, 3000);
    return false;
  }
}

function gainAttunementForAction(actionType, forceKey = null, amount = 0.5) {
  let targetKeys = [];
  let baseAmount = amount;
  if (forceKey && State.getAttunement().hasOwnProperty(forceKey)) {
    targetKeys.push(forceKey);
  } else if (actionType === 'completeReflection' && ['Standard', 'SceneMeditation', 'RareConcept', 'Guided', 'Dissonance'].includes(currentReflectionContext)) {
    const keyFromContext = forceKey; // Simplification: use provided key if available
    if (keyFromContext && State.getAttunement().hasOwnProperty(keyFromContext)) {
      targetKeys.push(keyFromContext);
      if (currentReflectionContext !== 'Standard') baseAmount *= 1.2;
    } else if (forceKey && State.getAttunement().hasOwnProperty(forceKey)) {
      targetKeys.push(forceKey);
    } else {
      targetKeys = Object.keys(State.getAttunement());
      baseAmount = 0.1;
    }
  } else if (
    ['generic', 'completeReflectionGeneric', 'scoreNudge', 'ritual', 'milestone', 'experimentSuccess', 'artEvolve', 'addToCatalog', 'discover', 'alignStar', 'contemplation', 'scanSuccess', 'scanFail', 'scanSpecial'].includes(actionType) ||
    forceKey === 'All'
  ) {
    targetKeys = Object.keys(State.getAttunement());
  } else {
    console.warn(`gainAttunement: Invalid params: action=${actionType}, key=${forceKey}`);
    return;
  }

  let changed = false;
  targetKeys.forEach(key => {
    if (State.updateAttunement(key, baseAmount)) {
      changed = true;
      // Optionally update milestone progress here
    }
  });
  if (changed) {
    console.log(`Force Strength updated (${actionType}, Key(s): ${targetKeys.join(',') || 'All'}) by ${baseAmount.toFixed(2)} per Force.`);
    if (document.getElementById('constellationMapScreen')?.classList.contains('current')) {
      UI.displayAlignedStars();
    }
  }
}

// --- Charting (Questionnaire) Logic ---
export function handleQuestionnaireInputChange(event) {
  const input = event.target;
  const type = input.dataset.type;
  const currentState = State.getState();
  if (currentState.currentElementIndex < 0 || currentState.currentElementIndex >= elementNames.length) return;
  const forceName = elementNames[currentState.currentElementIndex];
  if (type === 'slider') {
    UI.updateSliderFeedbackText(input, forceName);
  }
  const currentAnswers = UI.getQuestionnaireAnswers();
  State.updateAnswers(forceName, currentAnswers);
  UI.updateDynamicFeedback(forceName, currentAnswers);
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
  }
  handleQuestionnaireInputChange(event);
}

// Placeholder for calculating element score based on answers
export function calculateElementScore(elementName, answersForElement) {
  let score = 0;
  if (answersForElement && typeof answersForElement === 'object') {
    for (const key in answersForElement) {
      if (typeof answersForElement[key] === 'number') {
        score += answersForElement[key];
      }
    }
  }
  return score;
}

// --- Constellation Calculation Helpers ---
function calculateAlignmentScores() {
  const scores = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 };
  State.getFocusedConcepts().forEach(id => {
    const data = State.getDiscoveredConceptData(id);
    if (data?.concept?.elementScores) {
      for (const key in scores) {
        if (Object.hasOwn(data.concept.elementScores, key)) {
          scores[key] += data.concept.elementScores[key];
        }
      }
    }
  });
  return scores;
}

export function calculateConstellationNarrative(forceRecalculate = false) {
  if (forceRecalculate || !currentConstellationAnalysis) {
    const focused = State.getFocusedConcepts();
    if (focused.size === 0) {
      currentConstellationAnalysis = null;
      return "";
    }
    // Sum element scores of all aligned stars
    const totalScores = { A: 0, I: 0, S: 0, P: 0, C: 0, R: 0 };
    focused.forEach(id => {
      const data = State.getDiscoveredConceptData(id);
      if (data?.concept?.elementScores) {
        for (const key in totalScores) {
          if (Object.hasOwn(data.concept.elementScores, key)) {
            totalScores[key] += data.concept.elementScores[key];
          }
        }
      }
    });
    // Identify top one or two forces
    const sorted = Object.entries(totalScores)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, sum]) => sum > 0);
    let narrative = "";
    if (sorted.length === 0) {
      narrative = "Your focused stars show a balanced, subtle essence.";
    } else {
      const [topKey] = sorted[0];
      const topForceName = elementKeyToFullName[topKey] || topKey;
      let topConceptName = "";
      for (let id of focused) {
        const concept = State.getDiscoveredConceptData(id)?.concept;
        if (concept?.primaryElement === topKey) {
          topConceptName = concept.name;
          break;
        }
      }
      narrative = `Your constellation resonates strongly with <strong>${topForceName}</strong>`;
      narrative += topConceptName
        ? `, reflected in your focus on <strong>${topConceptName}</strong>. `
        : ". ";
      if (sorted.length > 1) {
        const [secondKey] = sorted[1];
        const secondForceName = elementKeyToFullName[secondKey] || secondKey;
        let secondConceptName = "";
        for (let id of focused) {
          const concept = State.getDiscoveredConceptData(id)?.concept;
          if (concept?.primaryElement === secondKey) {
            secondConceptName = concept.name;
            break;
          }
        }
        narrative += `Undercurrents of <strong>${secondForceName}</strong> add complexity`;
        narrative += secondConceptName
          ? ` through <strong>${secondConceptName}</strong>.`
          : ".";
      }
    }
    currentConstellationAnalysis = { fullNarrativeHTML: narrative };
  }
  return currentConstellationAnalysis?.fullNarrativeHTML || "";
}

export function calculateDominantForces() {
  const focused = State.getFocusedConcepts();
  if (focused.size === 0) return [];
  const counts = {};
  focused.forEach(id => {
    const concept = State.getDiscoveredConceptData(id)?.concept;
    if (concept?.primaryElement) {
      counts[concept.primaryElement] = (counts[concept.primaryElement] || 0) + 1;
    }
  });
  return Object.entries(counts)
    .map(([key, count]) => ({
      key,
      name: elementKeyToFullName[key] || key,
      count
    }))
    .sort((a, b) => b.count - a.count);
}

// --- Alignment (Focus) Handling ---
export function handleToggleAlignment() {
  if (currentlyDisplayedStarId === null) return;
  const starId = currentlyDisplayedStarId;
  const result = State.toggleFocusConcept(starId);
  // Retrieve star data from state
  const star = State.getDiscoveredConceptData(starId)?.concept;
  if (!star) {
    UI.showTemporaryMessage("Star data not found.", 3000);
    return;
  }
  // Update attunement for aligning star
  gainAttunementForAction('alignStar', star.primaryElement, 1.0);
  // Update UI
  UI.updateAlignStarButtonStatus && UI.updateAlignStarButtonStatus(starId);
  UI.displayAlignedStars();
  UI.updateConstellationResonance();
  calculateConstellationNarrative(true);
  UI.displayConstellationNarrative();
  UI.displayConstellationThemes();
  // Optionally check for synergy unlocks here
  UI.refreshStarCatalogDisplay && UI.refreshStarCatalogDisplay();
  UI.updateConstellationExploreButton && UI.updateConstellationExploreButton();
  UI.updateSuggestBlueprintButtonState && UI.updateSuggestBlueprintButtonState();
  UI.showTemporaryMessage(`Toggled alignment for ${star.name}.`, 2000);
}

// Other game logic functions (such as research, scanning, etc.) would be added here.

console.log("gameLogic.js loaded.");
