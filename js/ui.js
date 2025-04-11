// js/utils.js - Utility Functions
import { elementDetails, elementKeyToFullName, elementNameToKey } from '../data.js'; // data.js is now in parent directory

console.log("utils.js loading...");

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
 * @param {string} elementName - The full name of the element (e.g., "Attraction").
 * @returns {string} The hex color code.
 */
export function getElementColor(elementName) {
    // Using fallback colors directly for simplicity now.
    // TODO: Potentially read from elementDetails if defined there later.
    const fallbackColors = { Attraction: '#FF6347', Interaction: '#4682B4', Sensory: '#32CD32', Psychological: '#FFD700', Cognitive: '#8A2BE2', Relational: '#FF8C00' };
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
         case "Identity/Role": return "fa-solid fa-mask";
         case "Practice/Kink": return "fa-solid fa-gear";
         case "Psychological/Goal": return "fa-solid fa-brain";
         case "Relationship Style": return "fa-solid fa-heart";
         default: return "fa-solid fa-question-circle"; // Fallback icon
     }
}

/**
 * Gets the Font Awesome icon class for a given element name.
 * @param {string} elementName - The full name of the element.
 * @returns {string} The Font Awesome class string.
 */
export function getElementIcon(elementName) {
     // Using fallback icons directly for now.
     // TODO: Potentially read from elementDetails if defined there later.
     switch (elementName) {
         case "Attraction": return "fa-solid fa-magnet";
         case "Interaction": return "fa-solid fa-users";
         case "Sensory": return "fa-solid fa-hand-sparkles";
         case "Psychological": return "fa-solid fa-comment-dots"; // Changed from brain (used by CardType)
         case "Cognitive": return "fa-solid fa-lightbulb";
         case "Relational": return "fa-solid fa-link";
         default: return "fa-solid fa-atom"; // Generic fallback
     }
}

/**
 * Calculates the Euclidean distance between two score objects.
 * Assumes objects use the same keys (A, I, S, P, C, R).
 * @param {object} userScoresObj - The user's score object.
 * @param {object} conceptScoresObj - The concept's score object.
 * @returns {number} The calculated Euclidean distance, or Infinity if inputs are invalid/incompatible.
 */
export function euclideanDistance(userScoresObj, conceptScoresObj) {
     let sumOfSquares = 0;
     let validDimensions = 0;

     // Basic validation
     if (!userScoresObj || typeof userScoresObj !== 'object' || !conceptScoresObj || typeof conceptScoresObj !== 'object') {
         console.warn("Invalid input for euclideanDistance", userScoresObj, conceptScoresObj);
         return Infinity;
     }

     // Determine keys to compare. Use elementKeyToFullName if available to ensure consistency,
     // otherwise fallback to keys from user scores.
     const keysToCompare = elementNameToKey ? Object.values(elementNameToKey) : Object.keys(userScoresObj);

     if (keysToCompare.length === 0) {
         console.warn("Could not determine keys for comparison in euclideanDistance");
         return Infinity;
     }

     for (const key of keysToCompare) {
         const s1 = userScoresObj[key];
         const s2 = conceptScoresObj[key];

         // Check if both scores are valid numbers for this dimension
         const s1Valid = typeof s1 === 'number' && !isNaN(s1);
         // Check if the concept actually has this score and it's valid
         const s2Valid = conceptScoresObj.hasOwnProperty(key) && typeof s2 === 'number' && !isNaN(s2);

         if (s1Valid && s2Valid) {
             sumOfSquares += Math.pow(s1 - s2, 2);
             validDimensions++;
         } else {
             // Optionally log missing/invalid dimensions for debugging
             // console.debug(`Skipping dimension ${key} in distance calc (s1Valid: ${s1Valid}, s2Valid: ${s2Valid})`);
         }
     }

     // If no dimensions could be compared, distance is undefined (Infinity)
     if (validDimensions === 0) {
         console.warn("No valid dimensions found for comparison in euclideanDistance");
         return Infinity;
     }

     // If only some dimensions were valid, should we normalize?
     // For now, just calculate based on valid dimensions. Could adjust later if needed.
     // Example normalization: return Math.sqrt(sumOfSquares / validDimensions) * Math.sqrt(keysToCompare.length);

     return Math.sqrt(sumOfSquares);
}

console.log("utils.js loaded.");
