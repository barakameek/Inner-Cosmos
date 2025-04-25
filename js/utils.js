// --- START OF FILE utils.js ---
// js/utils.js - Utility Functions (Enhanced v4.8 - Fixed & Robustness)

// Import elementDetails (for getElementShortName) and elementKeyToFullName (for reverse lookup)
import { elementDetails, elementKeyToFullName, elementNames } from '../data.js'; // Added elementNames import

console.log("utils.js loading... (Enhanced v4.8 - Fixed & Robustness)");

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
    if (score >= 8) return "High"; // Adjusted threshold slightly
    if (score >= 5) return "Moderate";
    return null;
}

/**
 * Gets the short display name (e.g., "Attraction") from various possible inputs.
 * Relies on consistent naming in data.js -> elementDetails.
 * @param {string} nameOrKey - Can be short name key ("Attraction"), full descriptive name ("Attraction Focus: ..."), or single letter key ('A', 'RF').
 * @returns {string} The short display name or the original input if lookup fails.
 */
export function getElementShortName(nameOrKey) {
    if (!nameOrKey || typeof nameOrKey !== 'string') return "Unknown";

    // 1. Check if it's a single letter key ('A', 'I', ..., 'RF')
    if (nameOrKey.length === 1 && nameOrKey.toUpperCase() === nameOrKey && elementKeyToFullName?.[nameOrKey]) {
        const elementNameKey = elementKeyToFullName[nameOrKey]; // e.g., "Attraction" or "RoleFocus"
        // Use the name from elementDetails if available, split, otherwise fallback to elementNameKey
        return elementDetails?.[elementNameKey]?.name?.split(':')[0].trim() || elementNameKey;
    }

    // 2. Check if it's already the short name key ("Attraction", "RoleFocus", etc.) used in elementDetails
    if (elementDetails?.[nameOrKey]?.name) {
        return elementDetails[nameOrKey].name.split(':')[0].trim();
    }

    // 3. Check if it's a full descriptive name containing ":"
    if (nameOrKey.includes(':')) {
        return nameOrKey.split(':')[0].trim();
    }

    // 4. Final fallback - maybe it's already the short name but not a key in elementDetails?
    // Or maybe it's an invalid input. Return the input itself.
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
        "Attraction": '#FF6347', // Tomato
        "Interaction": '#4682B4', // SteelBlue
        "Sensory": '#32CD32', // LimeGreen
        "Psychological": '#FFD700', // Gold
        "Cognitive": '#8A2BE2', // BlueViolet
        "Relational": '#FF8C00', // DarkOrange
        "RoleFocus": '#40E0D0' // Turquoise
    };
     // Check if elementNameKey is a valid key in our color map
     if (fallbackColors.hasOwnProperty(elementNameKey)) {
         return fallbackColors[elementNameKey];
     }
    console.warn(`Utils: Color not found for element key: ${elementNameKey}. Using default grey.`);
    return '#CCCCCC'; // Default grey
}


/**
 * Converts a HEX color code to an RGBA string.
 * @param {string} hex - The hex color code (e.g., "#FF6347").
 * @param {number} [alpha=1] - The alpha transparency (0 to 1).
 * @returns {string} The RGBA color string.
 */
export function hexToRgba(hex, alpha = 1) {
    if (!hex || typeof hex !== 'string') return `rgba(128,128,128, ${alpha})`; // Return default grey on invalid input
    let localHex = hex.replace('#', ''); // Use local variable
    if (localHex.length === 3) {
        localHex = localHex[0]+localHex[0]+localHex[1]+localHex[1]+localHex[2]+localHex[2];
    }
    if (localHex.length !== 6) {
        console.warn(`Invalid hex code provided to hexToRgba: ${hex}`);
        return `rgba(128,128,128, ${alpha})`; // Return default grey
    }
    const bigint = parseInt(localHex, 16);
    if (isNaN(bigint)) {
        console.warn(`Could not parse hex code to integer: ${localHex}`);
        return `rgba(128,128,128, ${alpha})`;
    }
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const validAlpha = Math.max(0, Math.min(1, alpha)); // Clamp alpha
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
         case "Practice/Kink": return "fa-solid fa-gear"; // Using gear for practices
         case "Psychological/Goal": return "fa-solid fa-brain";
         case "Relationship Style": return "fa-solid fa-heart"; // Using heart for relationship style
         default:
             console.warn(`Utils: Icon not found for card type: ${cardType}. Using default.`);
             return "fa-solid fa-question-circle";
     }
}

/**
 * Gets the Font Awesome icon class for a given element.
 * Expects the short name key ("Attraction", "Interaction", etc.) as input.
 * @param {string} elementNameKey - The short name key of the element (e.g., "Attraction", "RoleFocus").
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
             console.warn(`Utils: Icon not found for element key: ${elementNameKey}. Using default atom.`);
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
     const expectedDimensions = elementNames.length; // Use imported elementNames length
     const expectedKeys = elementKeyToFullName ? Object.keys(elementKeyToFullName) : ['A','I','S','P','C','R','RF']; // Fallback if map isn't loaded yet

     if (!userScoresObj || typeof userScoresObj !== 'object' || !conceptScoresObj || typeof conceptScoresObj !== 'object') {
         console.warn(`Invalid input objects for euclideanDistance (Concept: ${conceptName})`, { userScoresObj, conceptScoresObj });
         return Infinity;
     }

     // Iterate over expected keys to ensure all dimensions are considered
     for (const key of expectedKeys) {
         const s1 = userScoresObj[key];
         const s2 = conceptScoresObj[key];

         const s1Valid = typeof s1 === 'number' && !isNaN(s1);
         // Check if concept HAS the key AND the value is a valid number
         const s2Valid = conceptScoresObj.hasOwnProperty(key) && typeof s2 === 'number' && !isNaN(s2);

         if (s1Valid && s2Valid) {
             sumOfSquares += Math.pow(s1 - s2, 2);
             validDimensions++;
         } else {
             // Log details about the missing/invalid score
             if (!s1Valid) {
                 console.warn(`DistCalc Warning (Concept: ${conceptName}): Invalid User Score for dimension '${key}'. Value: ${s1}.`);
             }
             if (!conceptScoresObj.hasOwnProperty(key)) {
                 console.warn(`DistCalc Warning (Concept: ${conceptName}): Missing Concept Score for dimension '${key}'.`);
             } else if (!s2Valid) {
                 console.warn(`DistCalc Warning (Concept: ${conceptName}): Invalid Concept Score for dimension '${key}'. Value: ${s2}.`);
             }
         }
     }

     // If NO valid dimensions could be compared, return Infinity
     if (validDimensions === 0) {
         console.error(`FATAL DistCalc (Concept: ${conceptName}): Could not compare any dimensions. Check data.`);
         return Infinity;
     }

     // Warn if fewer dimensions were compared than expected
     if (validDimensions < expectedDimensions) {
         console.warn(`Potentially inaccurate distance for Concept: ${conceptName}. Only ${validDimensions}/${expectedDimensions} valid dimensions compared. Check concept's elementScores in data.js.`);
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
 * @param {number | string | Date} timestamp - The timestamp (ms), date string, or Date object.
 * @returns {string} Formatted date/time string (e.g., "YYYY-MM-DD HH:MM") or "Invalid Date".
 */
export function formatTimestamp(timestamp) {
    if (!timestamp) return "Invalid Date";
    try {
        const date = new Date(timestamp);
        // Check if the date object is valid after conversion
        if (isNaN(date.getTime())) {
             console.warn("formatTimestamp received invalid date/timestamp:", timestamp);
             return "Invalid Date";
        }

        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (e) {
        console.error("Error formatting timestamp:", timestamp, e);
        return "Invalid Date";
    }
}


console.log("utils.js loaded successfully. (Fixed)");
// --- END OF FILE utils.js ---
