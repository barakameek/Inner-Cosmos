// ui.js - Handles DOM Manipulation and UI Updates (Inner Cosmos Theme)
import * as State from './state.js';
import * as Config from './config.js';
import * as Utils from './utils.js';
import * as GameLogic from './gameLogic.js';
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
  elementNames
} from '../data.js';

console.log("ui.js loading...");

// --- DOM Element References ---
const saveIndicator = document.getElementById('saveIndicator');
const screens = document.querySelectorAll('.screen');
const welcomeScreen = document.getElementById('welcomeScreen');
const loadButton = document.getElementById('loadButton');
const chartingScreen = document.getElementById('chartingScreen');
const forceProgressHeader = document.getElementById('forceProgressHeader');
const questionContent = document.getElementById('questionContent');
const progressText = document.getElementById('progressText');
const dynamicForceFeedback = document.getElementById('dynamicForceFeedback');
const feedbackForceSpan = document.getElementById('feedbackForce');
const feedbackScoreSpan = document.getElementById('feedbackScore');
const feedbackScoreBar = document.getElementById('feedbackScoreBar');
const prevForceButton = document.getElementById('prevForceButton');
const nextForceButton = document.getElementById('nextForceButton');
const mainNavBar = document.getElementById('mainNavBar');
const navButtons = document.querySelectorAll('.nav-button');
const settingsButton = document.getElementById('settingsButton');

// Constellation Map Screen (Persona)
const constellationMapScreen = document.getElementById('constellationMapScreen');
const constellationName = document.getElementById('constellationName');
const constellationVisualPlaceholder = document.getElementById('constellationVisualPlaceholder');
const interpretationTextElement = document.getElementById('constellationInterpretationText');
const dominantForcesElement = document.getElementById('constellationDominantForces');
const userInsightDisplayConstellation = document.getElementById('userInsightDisplayConstellation');
const forceDetailsElement = document.getElementById('constellationForceDetails');
const discoverMoreButton = document.getElementById('discoverMoreButton');
const suggestBlueprintButton = document.getElementById('suggestBlueprintButton');

// Star Catalog Screen (Grimoire)
const starCatalogScreen = document.getElementById('starCatalogScreen');
const starCountSpan = document.getElementById('starCount');
const catalogControls = document.getElementById('catalogControls');
const catalogFilterControls = catalogControls ? catalogControls.querySelector('.filter-controls') : null;
const catalogTypeFilter = document.getElementById('catalogTypeFilter');
const catalogForceFilter = document.getElementById('catalogForceFilter');
const catalogRarityFilter = document.getElementById('catalogRarityFilter');
const catalogSortOrder = document.getElementById('catalogSortOrder');
const catalogSearchInput = document.getElementById('catalogSearchInput');
const catalogFocusFilter = document.getElementById('catalogFocusFilter');
const starCatalogContent = document.getElementById('starCatalogContent');

// Observatory Screen (Study)
const observatoryScreen = document.getElementById('observatoryScreen');
const userInsightDisplayObservatory = document.getElementById('userInsightDisplayObservatory');
const sectorScanButtonContainer = document.getElementById('sectorScanButtonContainer');
const dailyScanButton = document.getElementById('dailyScanButton');
const deepScanButton = document.getElementById('deepScanButton');
const scanStatus = document.getElementById('scanStatus');
const scanOutput = document.getElementById('scanOutput');
const observatoryRitualsDisplay = document.getElementById('observatoryRitualsDisplay');
const deepScanCostDisplay = document.getElementById('deepScanCostDisplay');

// Cartography Screen (Repository)
const cartographyScreen = document.getElementById('cartographyScreen');
const cartographySynergiesDiv = document.getElementById('cartographySynergies')
  ? document.getElementById('cartographySynergies').querySelector('.cartography-list')
  : null;
const cartographyBlueprintsDiv = document.getElementById('cartographyBlueprints')
  ? document.getElementById('cartographyBlueprints').querySelector('.cartography-list')
  : null;
const cartographyOrbitsDiv = document.getElementById('cartographyOrbits')
  ? document.getElementById('cartographyOrbits').querySelector('.cartography-list')
  : null;
const cartographyWhispersDiv = document.getElementById('cartographyWhispers')
  ? document.getElementById('cartographyWhispers').querySelector('.cartography-list')
  : null;
const legendaryAlignmentsDisplay = document.getElementById('legendaryAlignmentsDisplay');

// Observatory View Popup (Concept Detail)
const observatoryViewPopup = document.getElementById('observatoryViewPopup');
const closeObservatoryViewButton = document.getElementById('closeObservatoryViewButton');
const observatoryStarTypeIcon = document.getElementById('observatoryStarTypeIcon');
const observatoryStarName = document.getElementById('observatoryStarName');
const observatoryStarType = document.getElementById('observatoryStarType');
const observatoryVisualContainer = document.getElementById('observatoryVisualContainer');
const observatoryDetailedDescription = document.getElementById('observatoryDetailedDescription');
const observatoryResonanceSummary = document.getElementById('observatoryResonanceSummary');
const observatoryComparisonHighlights = document.getElementById('observatoryComparisonHighlights');
const observatoryStarProfile = document.getElementById('observatoryStarProfile');
const observatoryNebulaComparisonProfile = document.getElementById('observatoryNebulaComparisonProfile');
const observatoryRelatedStars = document.getElementById('observatoryRelatedStars');

// Logbook Section
const logbookSection = document.getElementById('logbookSection');
const logbookTextarea = document.getElementById('logbookTextarea');
const saveLogEntryButton = document.getElementById('saveLogEntryButton');
const logSaveStatus = document.getElementById('logSaveStatus');
const catalogStarButton = document.getElementById('catalogStarButton');
const alignStarButton = document.getElementById('alignStarButton');
const stellarEvolutionSection = document.getElementById('stellarEvolutionSection');
const evolveStarButton = document.getElementById('evolveStarButton');
const evolveCostObs = document.getElementById('evolveCostObs');
const evolveEligibilityObs = document.getElementById('evolveEligibilityObs');

// Reflection Modal
const reflectionModal = document.getElementById('reflectionModal');
const reflectionModalTitle = document.getElementById('reflectionModalTitle');
const closeReflectionModalButton = document.getElementById('closeReflectionModalButton');
const reflectionSubject = document.getElementById('reflectionSubject');
const reflectionPromptText = document.getElementById('reflectionPromptText');
const reflectionCheckbox = document.getElementById('reflectionCheckbox');
const scoreNudgeCheckbox = document.getElementById('scoreNudgeCheckbox');
const scoreNudgeLabel = document.getElementById('scoreNudgeLabel');
const confirmReflectionButton = document.getElementById('confirmReflectionButton');
const reflectionRewardAmount = document.getElementById('reflectionRewardAmount');

// Settings Popup
const settingsPopup = document.getElementById('settingsPopup');
const closeSettingsPopupButton = document.getElementById('closeSettingsPopupButton');
const forceSaveButton = document.getElementById('forceSaveButton');
const resetAppButton = document.getElementById('resetAppButton');

// Alerts & Toast
const milestoneAlert = document.getElementById('milestoneAlert');
const milestoneAlertText = document.getElementById('milestoneAlertText');
const closeMilestoneAlertButton = document.getElementById('closeMilestoneAlertButton');
const toastElement = document.getElementById('toastNotification');
const toastMessageElement = document.getElementById('toastMessage');

// Starting Nebula Modal
const startingNebulaModal = document.getElementById('startingNebulaModal');
const nebulaScoresDisplay = document.getElementById('nebulaScoresDisplay');
const nebulaInterpretation = document.getElementById('nebulaInterpretation');
const nebulaStarterStarsDisplay = document.getElementById('nebulaStarterStarsDisplay');
const goToCatalogButton = document.getElementById('goToCatalogButton');
const closeNebulaModalButton = document.getElementById('closeNebulaModalButton');

// Tutorial Modal
const tutorialOverlay = document.getElementById('tutorialOverlay');
const tutorialModal = document.getElementById('tutorialModal');
const tutorialTitle = document.getElementById('tutorialTitle');
const tutorialContent = document.getElementById('tutorialContent');
const tutorialNextButton = document.getElementById('tutorialNextButton');

// General Overlay
const popupOverlay = document.getElementById('popupOverlay');

// --- Toast Message Logic ---
let toastTimeout = null;
export function showTemporaryMessage(message, duration = 3000) {
  if (!toastElement || !toastMessageElement) {
    console.warn("Toast elements missing:", message);
    return;
  }
  console.info(`Toast: ${message}`);
  toastMessageElement.textContent = message;
  if (toastTimeout) clearTimeout(toastTimeout);
  toastElement.classList.remove('hidden', 'visible');
  void toastElement.offsetWidth; // Trigger reflow
  toastElement.classList.add('visible');
  toastElement.classList.remove('hidden');
  toastTimeout = setTimeout(() => {
    toastElement.classList.remove('visible');
    setTimeout(() => {
      if (!toastElement.classList.contains('visible')) {
        toastElement.classList.add('hidden');
      }
    }, 500);
    toastTimeout = null;
  }, duration);
}

// --- Milestone Alert Logic ---
let milestoneTimeout = null;
export function showMilestoneAlert(text, milestoneId = null) {
  if (!milestoneAlert || !milestoneAlertText) return;
  milestoneAlertText.textContent = text;
  milestoneAlert.classList.remove('hidden');
  if (milestoneTimeout) clearTimeout(milestoneTimeout);
  milestoneTimeout = setTimeout(() => {
    milestoneAlert.classList.add('hidden');
    milestoneTimeout = null;
  }, 4000);
}

// --- UI Setup Functions ---
export function setupInitialUI() {
  if (loadButton) loadButton.classList.add('hidden');
  showScreen('welcomeScreen');
}

export function showScreen(screenId) {
  screens.forEach(screen => {
    if (screen.id === screenId) {
      screen.classList.remove('hidden');
      screen.classList.add('current');
    } else {
      screen.classList.add('hidden');
      screen.classList.remove('current');
    }
  });
}

// Questionnaire UI initialization
export function initializeQuestionnaireUI() {
  if (chartingScreen) {
    chartingScreen.classList.remove('hidden');
    showScreen('chartingScreen');
  }
  // Additional questionnaire setup…
}

// Update insight displays in various screens
export function updateInsightDisplays() {
  const formattedInsight = State.getInsight().toFixed(1);
  if (userInsightDisplayConstellation) userInsightDisplayConstellation.textContent = formattedInsight;
  if (userInsightDisplayObservatory) userInsightDisplayObservatory.textContent = formattedInsight;
}

// --- Constellation Map UI Updates ---
export function displayConstellationNarrative() {
  if (!interpretationTextElement) return;
  const narrative = GameLogic.calculateConstellationNarrative();
  interpretationTextElement.innerHTML = narrative || 'Align Stars to see emergent patterns...';
}

export function displayConstellationThemes() {
  if (!dominantForcesElement) return;
  const themes = GameLogic.calculateDominantForces();
  dominantForcesElement.innerHTML = '';
  if (themes.length > 0) {
    themes.slice(0, 3).forEach(theme => {
      dominantForcesElement.innerHTML += `<p><strong>${theme.name}</strong> (${theme.count} Star${theme.count !== 1 ? 's' : ''})</p>`;
    });
  } else {
    dominantForcesElement.innerHTML = '<p>No dominant forces detected in current alignment.</p>';
  }
}

export function updateConstellationResonance() {
  // Placeholder: update visual representation if needed
}

export function updateConstellationExploreButton() {
  if (!discoverMoreButton) return;
  const phase = State.getOnboardingPhase();
  discoverMoreButton.classList.toggle('hidden-by-flow', phase < Config.ONBOARDING_PHASE.STUDY_INSIGHT);
}

export function updateSuggestBlueprintButtonState() {
  if (!suggestBlueprintButton) return;
  const phase = State.getOnboardingPhase();
  suggestBlueprintButton.disabled = phase < Config.ONBOARDING_PHASE.STUDY_INSIGHT;
}

// Display aligned stars in the Constellation Map
export function displayAlignedStars() {
  if (!constellationVisualPlaceholder) return;
  const alignedStars = State.getFocusedConcepts();
  if (alignedStars.size > 0) {
    let starListHTML = "<ul>";
    alignedStars.forEach(id => {
      const name = State.getDiscoveredConceptData(id)?.concept?.name || `Star ${id}`;
      starListHTML += `<li><i class="fas fa-star"></i> ${name}</li>`;
    });
    starListHTML += "</ul><p>(Placeholder: Connections not drawn)</p>";
    constellationVisualPlaceholder.innerHTML = starListHTML;
  } else {
    constellationVisualPlaceholder.innerHTML =
      `<i class="fas fa-meteor" style="font-size: 3em; color: #555;"></i>
       <p>(Align Stars from your Catalog to build your Constellation)</p>`;
  }
}

// --- Starting Nebula Modal Functions ---
export function showStartingNebulaModal(scores, starterStarConcepts) {
  if (!startingNebulaModal) return;
  // Display core force scores
  nebulaScoresDisplay.innerHTML = "";
  if (scores && typeof scores === 'object') {
    let scoresHTML = "";
    for (const key in scores) {
      if (!scores.hasOwnProperty(key)) continue;
      const forceName = elementKeyToFullName[key] || key;
      const scoreVal = scores[key];
      const scoreLabel = Utils.getScoreLabel(scoreVal);
      scoresHTML += `
        <div class="nebula-score-item">
          <div class="element-name">${forceName}</div>
          <div class="score-value">${scoreVal.toFixed(1)}</div>
          <div class="score-label">(${scoreLabel})</div>
        </div>`;
    }
    nebulaScoresDisplay.innerHTML = scoresHTML;
  }
  // Display interpretation text
  if (nebulaInterpretation) {
    let interpText = "";
    const sortedForces = scores ? Object.entries(scores).sort((a, b) => b[1] - a[1]) : [];
    if (sortedForces.length > 0) {
      const topForce = elementKeyToFullName[sortedForces[0][0]] || sortedForces[0][0];
      if (sortedForces.length > 1) {
        const secondForce = elementKeyToFullName[sortedForces[1][0]] || sortedForces[1][0];
        interpText = `Your core profile is strongly influenced by ${topForce} and ${secondForce}.`;
      } else {
        interpText = `Your core profile is defined by a strong ${topForce} influence.`;
      }
    }
    nebulaInterpretation.textContent = interpText;
  }
  // Display starter stars
  nebulaStarterStarsDisplay.innerHTML = "";
  if (Array.isArray(starterStarConcepts)) {
    starterStarConcepts.forEach(concept => {
      const cardElement = renderStarCard(concept, 'starCatalog');
      if (cardElement) nebulaStarterStarsDisplay.appendChild(cardElement);
    });
  }
  startingNebulaModal.classList.remove('hidden');
  if (popupOverlay) popupOverlay.classList.remove('hidden');
}

export function hideStartingNebulaModal() {
  if (startingNebulaModal) startingNebulaModal.classList.add('hidden');
  if (popupOverlay) popupOverlay.classList.add('hidden');
}

// Render a star card (stub implementation)
export function renderStarCard(concept, context) {
  const card = document.createElement('div');
  card.classList.add('star-card');
  card.innerHTML = `<h4>${concept.name}</h4>
                    <p>${concept.description || ''}</p>`;
  return card;
}

// Hide any open popups
export function hidePopups() {
  const popups = document.querySelectorAll('.popup');
  popups.forEach(popup => popup.classList.add('hidden'));
  if (popupOverlay) popupOverlay.classList.add('hidden');
}

console.log("ui.js loaded.");
