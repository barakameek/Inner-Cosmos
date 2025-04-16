// js/utils.js - Utility Functions (Enhanced for 7 Elements + v4)

// Import updated data structures only if needed for lookups WITHIN utils itself
// In this case, we only need elementDetails for getElementShortName.
import { elementDetails, elementKeyToFullName, elementNameToKey } from '../data.js';

console.log("utils.js loading... (Enhanced for 7 Elements + v4)");

/**
 * Returns a descriptive label for a score (0-10).
 * @param {number} score - The score value.
 * @returns {string} The descriptive label (e.g., "High", "Very Low").
 */
export function getScoreLabel(score) {
    if (typeof score !== 'number' || isNaN(score)) return "N/A";
    if (score >= 9) return "Very High";
    if (score >= 7) return "High";
    if (score >= 4) return "Moderate"; // Adjusted threshold slightly for finer grain
    if (score >= 2) return "Low"; // Adjusted threshold slightly
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
    if (score >= 5) return "Moderate"; // Standard threshold for 'Moderate' affinity
    return null; // Scores below 5 don't show an affinity badge on cards
}

/**
 * Gets the short name for an element (e.g., "Attraction").
 * @param {string} fullName - The full name from elementDetails (e.g., "Attraction Focus: The Spark Plug").
 * @returns {string} The short name or the original name if format unknown.
 */
export function getElementShortName(fullName) {
    if (!fullName) return "Unknown";
    // Find the element key corresponding to the full name
    const key = Object.keys(elementDetails).find(k => elementDetails[k]?.name === fullName);
    if (key && elementDetails[key]?.name) {
        return elementDetails[key].name.split(':')[0]; // Get part before colon
    }
    // Fallback if not found in elementDetails keys directly (e.g., using name from elementNames)
     const matchingDetail = Object.values(elementDetails).find(detail => detail.name === fullName);
     if (matchingDetail?.name) {
        return matchingDetail.name.split(':')[0];
     }
    // Final fallback
    return fullName.split(':')[0] || fullName;
}


/**
 * Gets the color associated with an element name (full name like "Attraction").
 * Now includes RoleFocus.
 * @param {string} elementName - The full name of the element (e.g., "Attraction", "RoleFocus").
 * @returns {string} The hex color code.
 */
export function getElementColor(elementName) {
    // Using fallback colors directly for reliability.
    // Ensure these match CSS variables in style.css :root
    const fallbackColors = {
        "Attraction": '#FF6347',      // Tomato Red (--attraction-color)
        "Interaction": '#4682B4',     // Steel Blue (--interaction-color)
        "Sensory": '#32CD32',         // Lime Green (--sensory-color)
        "Psychological": '#FFD700',   // Gold (--psychological-color)
        "Cognitive": '#8A2BE2',       // Blue Violet (--cognitive-color)
        "Relational": '#FF8C00',      // Dark Orange (--relational-color)
        "RoleFocus": '#40E0D0'        // Turquoise (--rolefocus-color)
    };
    // Try to find the key corresponding to the full name first
    const key = Object.keys(elementDetails).find(k => elementDetails[k]?.name === elementName);
     if (key && elementKeyToFullName[key] && fallbackColors[elementKeyToFullName[key]]) {
         return fallbackColors[elementKeyToFullName[key]];
     }
     // Fallback check directly against the name provided
     if (fallbackColors[elementName]) {
         return fallbackColors[elementName];
     }
    // Last resort default
    console.warn(`Color not found for element: ${elementName}`);
    return '#CCCCCC'; // Default grey
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
    if (hex.length !== 6) return `rgba(128,128,128, ${alpha})`; // Invalid length
    const bigint = parseInt(hex, 16);
    if (isNaN(bigint)) return `rgba(128,128,128, ${alpha})`; // Default grey if parsing fails
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    // Clamp alpha
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
         case "Practice/Kink": return "fa-solid fa-gear"; // Was fa-wand-sparkles
         case "Psychological/Goal": return "fa-solid fa-brain";
         case "Relationship Style": return "fa-solid fa-heart";
         default: return "fa-solid fa-question-circle"; // Fallback icon
     }
}

/**
 * Gets the Font Awesome icon class for a given element name (now including RoleFocus).
 * Uses the short name for matching.
 * @param {string} elementName - The full name of the element (e.g., "Attraction Focus: The Spark Plug").
 * @returns {string} The Font Awesome class string.
 */
export function getElementIcon(elementName) {
    const shortName = getElementShortName(elementName);
     switch (shortName) {
         case "Attraction": return "fa-solid fa-magnet";
         case "Interaction": return "fa-solid fa-people-arrows"; // Changed from arrows-left-right
         case "Sensory": return "fa-solid fa-hand-sparkles";
         case "Psychological": return "fa-solid fa-comment-dots";
         case "Cognitive": return "fa-solid fa-lightbulb";
         case "Relational": return "fa-solid fa-link";
         case "RoleFocus": return "fa-solid fa-gauge-high";
         default: return "fa-solid fa-atom"; // Generic fallback
     }
}

/**
 * Calculates the Euclidean distance between two score objects.
 * Assumes objects use the same keys (A, I, S, P, C, R, RF).
 * It dynamically uses the keys from the userScoresObj for comparison.
 * @param {object} userScoresObj - The user's score object (expected to have 7 keys).
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

     // Use the keys from the user's score object as the reference dimensions
     const keysToCompare = Object.keys(userScoresObj);

     if (keysToCompare.length === 0) {
         console.warn(`Could not determine keys for comparison in euclideanDistance (Concept: ${conceptName}, userScoresObj is empty?)`);
         return Infinity;
     }

     for (const key of keysToCompare) {
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

     // Check if we compared a reasonable number of dimensions (e.g., at least 6 out of 7)
     if (validDimensions < keysToCompare.length - 1) { // Allow for maybe one missing score temporarily
         console.warn(`Potentially inaccurate distance for Concept: ${conceptName}. Only ${validDimensions}/${keysToCompare.length} dimensions compared. Check concept's elementScores in data.js.`);
          // Return Infinity if too many are missing? Or proceed with caution? Proceeding for now.
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
// --- END OF FILE utils.js ---
