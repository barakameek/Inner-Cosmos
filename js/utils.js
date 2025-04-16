// --- START OF CORRECTED utils.js (v4.7 - Refined Name/Key Handling) ---

// js/utils.js - Utility Functions (Enhanced for 7 Elements + v4)

// Import elementDetails (for getElementShortName) and elementKeyToFullName (for reverse lookup)
import { elementDetails, elementKeyToFullName } from '../data.js';

console.log("utils.js loading... (Enhanced v4.7 - Refining Key/Name Handling)");

/**
 * Returns a descriptive label for a score (0-10).
 * @param {number} score - The score value.
 * @returns {string} The descriptive label (e.g., "High", "Very Low").
 */
export function getScoreLabel(score) {
    if (typeof score !== 'number' || isNaN(score)) return "N/A";
    if (score >= 9) return "Very High";
    if (score >= 7) return "High";
    if (score >= 4) return "Moderate";
    if (score >= 2) return "Low";
    return "Very Low";
}

/**
 * Returns a simple affinity level (High/Moderate) for concept cards based on Resonance score.
 * Returns null if score is below Moderate threshold.
 * @param {number} score - The score value (typically 0-10).
 * @returns {string|null} "High", "Moderate", or null.
 */
export function getAffinityLevel(score) {
    if (typeof score !== 'number' || isNaN(score)) return null;
    if (score >= 8) return "High";
    if (score >= 5) return "Moderate";
    return null;
}

/**
 * Gets the short name for an element (e.g., "Attraction").
 * Can accept either the short name ("Attraction") or the full descriptive name.
 * @param {string} nameOrKey - The short name key ("Attraction") or full descriptive name ("Attraction Focus: The Spark Plug").
 * @returns {string} The short name or the original input if lookup fails.
 */
export function getElementShortName(nameOrKey) {
    if (!nameOrKey) return "Unknown";
    // If it's already a key in elementDetails, use its name property
    if (elementDetails[nameOrKey]?.name) {
        return elementDetails[nameOrKey].name.split(':')[0];
    }
    // If it contains ':', assume it's a full name
    if (nameOrKey.includes(':')) {
        return nameOrKey.split(':')[0];
    }
    // Otherwise, assume it's already the short name (or return as is)
    return nameOrKey;
}


/**
 * Gets the color associated with an element.
 * Expects the short name key ("Attraction", "Interaction", etc.) as input.
 * @param {string} elementNameKey - The short name key of the element (e.g., "Attraction", "RoleFocus").
 * @returns {string} The hex color code.
 */
export function getElementColor(elementNameKey) {
    // Colors keyed by the short name ("Attraction", etc.)
    const fallbackColors = {
        "Attraction": '#FF6347',
        "Interaction": '#4682B4',
        "Sensory": '#32CD32',
        "Psychological": '#FFD700',
        "Cognitive": '#8A2BE2',
        "Relational": '#FF8C00',
        "RoleFocus": '#40E0D0'
    };
     if (fallbackColors[elementNameKey]) {
         return fallbackColors[elementNameKey];
     }
    console.warn(`Color not found for element key: ${elementNameKey}`);
    return '#CCCCCC'; // Default grey
}


/**
 * Converts a HEX color code to an RGBA string.
 * @param {string} hex - The hex color code (e.g., "#FF6347").
 * @param {number} [alpha=1] - The alpha transparency (0 to 1).
 * @returns {string} The RGBA color string.
 */
export function hexToRgba(hex, alpha = 1) {
    if (!hex || typeof hex !== 'string') return `rgba(128,128,128, ${alpha})`;
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    if (hex.length !== 6) return `rgba(128,128,128, ${alpha})`;
    const bigint = parseInt(hex, 16);
    if (isNaN(bigint)) return `rgba(128,128,128, ${alpha})`;
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const validAlpha = Math.max(0, Math.min(1, alpha));
    return `rgba(${r},${g},${b},${validAlpha})`;
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
         default: return "fa-solid fa-question-circle";
     }
}

/**
 * Gets the Font Awesome icon class for a given element.
 * Expects the short name key ("Attraction", "Interaction", etc.) as input.
 * @param {string} elementNameKey - The short name key of the element (e.g., "Attraction").
 * @returns {string} The Font Awesome class string.
 */
export function getElementIcon(elementNameKey) {
     switch (elementNameKey) {
         case "Attraction": return "fa-solid fa-magnet";
         case "Interaction": return "fa-solid fa-people-arrows";
         case "Sensory": return "fa-solid fa-hand-sparkles";
         case "Psychological": return "fa-solid fa-comment-dots";
         case "Cognitive": return "fa-solid fa-lightbulb";
         case "Relational": return "fa-solid fa-link";
         case "RoleFocus": return "fa-solid fa-gauge-high";
         default:
             console.warn(`Icon not found for element key: ${elementNameKey}`);
             return "fa-solid fa-atom";
     }
}

/**
 * Calculates the Euclidean distance between two score objects.
 * @param {object} userScoresObj - The user's score object (expected to have 7 keys: A, I, S, P, C, R, RF).
 * @param {object} conceptScoresObj - The concept's score object (expected to have 7 keys).
 * @param {string} [conceptName='Unknown Concept'] - Optional name for debugging.
 * @returns {number} The calculated Euclidean distance, or Infinity if inputs are invalid/incompatible.
 */
export function euclideanDistance(userScoresObj, conceptScoresObj, conceptName = 'Unknown Concept') {
     let sumOfSquares = 0;
     let validDimensions = 0;

     if (!userScoresObj || typeof userScoresObj !== 'object' || !conceptScoresObj || typeof conceptScoresObj !== 'object') {
         console.warn(`Invalid input for euclideanDistance (Concept: ${conceptName})`, userScoresObj, conceptScoresObj);
         return Infinity;
     }

     const keysToCompare = Object.keys(userScoresObj); // Should be ['A', 'I', 'S', 'P', 'C', 'R', 'RF']

     if (keysToCompare.length === 0) {
         console.warn(`Could not determine keys for comparison in euclideanDistance (Concept: ${conceptName}, userScoresObj is empty?)`);
         return Infinity;
     }

     for (const key of keysToCompare) { // key is 'A', 'I', etc.
         const s1 = userScoresObj[key];
         const s2 = conceptScoresObj[key];

         const s1Valid = typeof s1 === 'number' && !isNaN(s1);
         const s2Valid = conceptScoresObj.hasOwnProperty(key) && typeof s2 === 'number' && !isNaN(s2);

         if (s1Valid && s2Valid) {
             sumOfSquares += Math.pow(s1 - s2, 2);
             validDimensions++;
         } else {
              if (!s2Valid) { console.debug(`DistCalc Warning (Concept: ${conceptName}): Skipping dimension ${key} - Concept Score Invalid/Missing: ${s2}. User Score: ${s1}`); }
              else if (!s1Valid) { console.debug(`DistCalc Warning (Concept: ${conceptName}): Skipping dimension ${key} - User Score Invalid: ${s1}. Concept Score: ${s2}`); }
         }
     }

     if (validDimensions < keysToCompare.length - 1) {
         console.warn(`Potentially inaccurate distance for Concept: ${conceptName}. Only ${validDimensions}/${keysToCompare.length} dimensions compared. Check concept's elementScores in data.js.`);
         if (validDimensions === 0) return Infinity;
     }

     return Math.sqrt(sumOfSquares);
}

/**
 * Debounce function: Limits the rate at which a function can fire.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
export function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * Formats a timestamp into a readable date/time string.
 * @param {number} timestamp - The Unix timestamp in milliseconds.
 * @returns {string} Formatted date/time string (e.g., "YYYY-MM-DD HH:MM") or "Invalid Date".
 */
export function formatTimestamp(timestamp) {
    if (!timestamp || typeof timestamp !== 'number') return "Invalid Date";
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return "Invalid Date"; // Check if the date object is valid

        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (e) {
        console.error("Error formatting timestamp:", e);
        return "Invalid Date";
    }
}


console.log("utils.js loaded.");
// --- END OF CORRECTED utils.js ---
