// --- START OF COMPLETE utils.js (with RoleFocus Integration) ---

// js/utils.js - Utility Functions (Updated for 7 Elements)
// Import updated data structures
import { elementDetails, elementKeyToFullName, elementNameToKey } from '../data.js';

console.log("utils.js loading... (with RoleFocus integration)");

/**
 * Returns a descriptive label for a score (0-10).
 * @param {number} score - The score value.
 * @returns {string} The descriptive label (e.g., "High", "Low").
 */
export function getScoreLabel(score) {
    if (typeof score !== 'number' || isNaN(score)) return "N/A";
    if (score >= 9) return "Very High";
    if (score >= 7) return "High";
    if (score >= 5) return "Moderate";
    if (score >= 3) return "Low";
    return "Very Low";
}

/**
 * Returns a simple affinity level (High/Moderate) for concept cards.
 * Returns null if score is below Moderate threshold.
 * @param {number} score - The score value.
 * @returns {string|null} "High", "Moderate", or null.
 */
export function getAffinityLevel(score) {
    if (typeof score !== 'number' || isNaN(score)) return null;
    if (score >= 8) return "High";
    if (score >= 5) return "Moderate";
    return null; // Scores below 5 don't show an affinity badge on cards
}

/**
 * Gets the color associated with an element name.
 * Now includes RoleFocus.
 * @param {string} elementName - The full name of the element (e.g., "Attraction", "RoleFocus").
 * @returns {string} The hex color code.
 */
export function getElementColor(elementName) {
    // Using fallback colors directly for simplicity now.
    const fallbackColors = {
        Attraction: '#FF6347',      // Tomato Red
        Interaction: '#4682B4',     // Steel Blue (Leaning)
        Sensory: '#32CD32',         // Lime Green
        Psychological: '#FFD700',   // Gold
        Cognitive: '#8A2BE2',       // Blue Violet
        Relational: '#FF8C00',      // Dark Orange
        RoleFocus: '#40E0D0'        // Turquoise (Intensity) - Matches CSS variable
    };
    // Attempt to get from CSS variable first (more flexible)
    // Note: This requires the variable to be defined in :root
    // try {
    //     const cssVarName = `--${elementName.toLowerCase()}-color`;
    //     const colorFromCSS = getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim();
    //     if (colorFromCSS) return colorFromCSS;
    // } catch (e) {
    //     // Ignore error if CSS variable doesn't exist
    // }
    // Fallback to hardcoded colors
    return fallbackColors[elementName] || '#CCCCCC'; // Default grey
}


/**
 * Converts a HEX color code to an RGBA string.
 * @param {string} hex - The hex color code (e.g., "#FF6347").
 * @param {number} [alpha=1] - The alpha transparency (0 to 1).
 * @returns {string} The RGBA color string.
 */
export function hexToRgba(hex, alpha = 1) {
    if (!hex || typeof hex !== 'string') return `rgba(128,128,128, ${alpha})`; // Default grey on invalid input
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]; // Expand shorthand hex
    const bigint = parseInt(hex, 16);
    if (isNaN(bigint)) return `rgba(128,128,128, ${alpha})`; // Default grey if parsing fails
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Gets the Font Awesome icon class for a given card type.
 * @param {string} cardType - The type of the concept card.
 * @returns {string} The Font Awesome class string.
 */
export function getCardTypeIcon(cardType) {
     switch (cardType) {
         case "Orientation": return "fa-solid fa-compass";
         case "Identity/Role": return "fa-solid fa-mask"; // Good for BDSM styles too
         case "Practice/Kink": return "fa-solid fa-gear";
         case "Psychological/Goal": return "fa-solid fa-brain";
         case "Relationship Style": return "fa-solid fa-heart";
         default: return "fa-solid fa-question-circle"; // Fallback icon
     }
}

/**
 * Gets the Font Awesome icon class for a given element name (now including RoleFocus).
 * @param {string} elementName - The full name of the element.
 * @returns {string} The Font Awesome class string.
 */
export function getElementIcon(elementName) {
     switch (elementName) {
         case "Attraction": return "fa-solid fa-magnet";
         case "Interaction": return "fa-solid fa-arrows-left-right-to-line"; // Represents leaning/spectrum
         case "Sensory": return "fa-solid fa-hand-sparkles";
         case "Psychological": return "fa-solid fa-comment-dots";
         case "Cognitive": return "fa-solid fa-lightbulb";
         case "Relational": return "fa-solid fa-link";
         case "RoleFocus": return "fa-solid fa-gauge-high"; // Represents intensity/focus
         default: return "fa-solid fa-atom"; // Generic fallback
     }
}

/**
 * Calculates the Euclidean distance between two score objects.
 * Assumes objects use the same keys (A, I, S, P, C, R, RF).
 * It dynamically uses the keys from the userScoresObj for comparison.
 * @param {object} userScoresObj - The user's score object (expected to have 7 keys).
 * @param {object} conceptScoresObj - The concept's score object (expected to have 7 keys).
 * @returns {number} The calculated Euclidean distance, or Infinity if inputs are invalid/incompatible.
 */
export function euclideanDistance(userScoresObj, conceptScoresObj) {
     let sumOfSquares = 0;
     let validDimensions = 0;

     if (!userScoresObj || typeof userScoresObj !== 'object' || !conceptScoresObj || typeof conceptScoresObj !== 'object') {
         console.warn("Invalid input for euclideanDistance", userScoresObj, conceptScoresObj);
         return Infinity;
     }

     // Use the keys from the user's score object as the reference dimensions
     // Since state.js now initializes userScores with 7 keys, this will include RF.
     const keysToCompare = Object.keys(userScoresObj);

     if (keysToCompare.length === 0) {
         console.warn("Could not determine keys for comparison in euclideanDistance (userScoresObj is empty?)");
         return Infinity;
     }
     // console.log("Comparing keys for distance:", keysToCompare); // DEBUG

     for (const key of keysToCompare) {
         const s1 = userScoresObj[key];
         const s2 = conceptScoresObj[key];

         const s1Valid = typeof s1 === 'number' && !isNaN(s1);
         // Ensure the concept *has* this score and it's valid
         const s2Valid = conceptScoresObj.hasOwnProperty(key) && typeof s2 === 'number' && !isNaN(s2);

         if (s1Valid && s2Valid) {
             sumOfSquares += Math.pow(s1 - s2, 2);
             validDimensions++;
         } else {
              if (!s2Valid) { console.debug(`Skipping dimension ${key} in distance calc (Concept Score Invalid/Missing: ${s2}) User Score: ${s1}`); }
              else if (!s1Valid) { console.debug(`Skipping dimension ${key} in distance calc (User Score Invalid: ${s1}) Concept Score: ${s2}`); }
         }
     }

     if (validDimensions === 0) {
         console.warn("No valid dimensions found for comparison in euclideanDistance (check if concept scores have all 7 keys)");
         return Infinity;
     }

     // No normalization applied currently, assuming all concepts *should* have all 7 scores.
     return Math.sqrt(sumOfSquares);
}

console.log("utils.js loaded.");
// --- END OF MODIFIED utils.js ---
