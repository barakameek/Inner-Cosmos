// js/utils.js - Utility Functions (Inner Cosmos Theme)
import { elementDetails, elementKeyToFullName, elementNameToKey } from '../data.js'; // Keep using internal data names

console.log("utils.js loading...");

// Translates a numerical score (0-10) into a qualitative label.
// Used for Core Forces and Star Properties.
export function getScoreLabel(score) {
    if (typeof score !== 'number' || isNaN(score)) return "N/A";
    if (score >= 9) return "Very High";
    if (score >= 7) return "High";
    if (score >= 5) return "Moderate";
    if (score >= 3) return "Low";
    return "Very Low";
}

// Determines the affinity level based on a Star's score for a specific Force.
// Used for displaying affinity icons on Star Cards.
export function getAffinityLevel(score) {
    if (typeof score !== 'number' || isNaN(score)) return null; // No affinity if score is invalid
    if (score >= 8) return "High"; // Strong pull/resonance
    if (score >= 5) return "Moderate"; // noticeable pull/resonance
    // Implicitly returns null if below 5 (Low/Very Low don't get an affinity icon by default)
    return null;
}

// Gets the display color associated with a Core Force (Element).
// Uses the internal Element Name (e.g., "Attraction").
export function getElementColor(elementName) {
    // Using fallback colors directly. Could be moved to config or derived from elementDetails.
    const fallbackColors = {
        Attraction: '#FF6347', // Fiery Red/Orange (Kept for distinctness)
        Interaction: '#4682B4', // Steel Blue (Kept)
        Sensory: '#32CD32',    // Lime Green (Kept)
        Psychological: '#FFD700',// Gold (Kept)
        Cognitive: '#8A2BE2',   // Blue Violet (Kept)
        Relational: '#FF8C00'   // Dark Orange (Kept)
    };
    // New Space Theme Colors (Example - uncomment and adjust if you prefer these)
    /*
    const spaceColors = {
        Attraction: '#ef4565', // Pink/Red
        Interaction: '#7f5af0', // Purple
        Sensory: '#2cb67d',    // Teal
        Psychological: '#ffc600',// Yellow
        Cognitive: '#7dd3fc',   // Light Blue
        Relational: '#94a3b8'   // Gray
    };
    return spaceColors[elementName] || '#CCCCCC'; // Default Gray
    */
    return fallbackColors[elementName] || '#CCCCCC'; // Use fallback for now
}

// Converts a HEX color string to an RGBA string.
export function hexToRgba(hex, alpha = 1) {
    if (!hex || typeof hex !== 'string') return `rgba(128,128,128, ${alpha})`;
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    const bigint = parseInt(hex, 16);
    if (isNaN(bigint)) return `rgba(128,128,128, ${alpha})`;
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
}

// Gets the Font Awesome icon class for a specific Star Type (Card Type).
export function getCardTypeIcon(cardType) {
     // Using space/abstract icons
     switch (cardType) {
         case "Orientation": return "fa-solid fa-signs-post"; // Crossroads/Direction
         case "Identity/Role": return "fa-solid fa-masks-theater"; // Mask/Persona
         case "Practice/Kink": return "fa-solid fa-atom"; // Action/Process
         case "Psychological/Goal": return "fa-solid fa-brain"; // Mind/Motive
         case "Relationship Style": return "fa-solid fa-people-arrows"; // Connections
         default: return "fa-solid fa-question-circle"; // Unknown
     }
}

// Gets the Font Awesome icon class for a Core Force (Element).
export function getElementIcon(elementName) {
     // Using space/abstract icons
     switch (elementName) {
         case "Attraction": return "fa-solid fa-magnet"; // Pull/Force
         case "Interaction": return "fa-solid fa-arrows-spin"; // Dynamic/Exchange
         case "Sensory": return "fa-solid fa-wave-square"; // Wave/Signal
         case "Psychological": return "fa-solid fa-heart-pulse"; // Inner state/Emotion
         case "Cognitive": return "fa-solid fa-lightbulb"; // Idea/Thought
         case "Relational": return "fa-solid fa-link"; // Connection/Structure
         default: return "fa-solid fa-circle-nodes"; // Generic node
     }
}

// Calculates the Euclidean distance between user scores (Nebula) and star scores (Concept).
// Lower distance means higher resonance.
export function euclideanDistance(userScoresObj, conceptScoresObj) {
     let sumOfSquares = 0;
     let validDimensions = 0;
     // Basic validation
     if (!userScoresObj || typeof userScoresObj !== 'object' || !conceptScoresObj || typeof conceptScoresObj !== 'object') {
         console.warn("Invalid input for euclideanDistance", userScoresObj, conceptScoresObj);
         return Infinity; // Return infinity for invalid input
     }
     // Use elementNameToKey mapping if available (should be), otherwise assume keys match
     const keysToCompare = elementNameToKey ? Object.values(elementNameToKey) : Object.keys(userScoresObj);
     if (keysToCompare.length === 0) {
         console.warn("Could not determine keys for comparison in euclideanDistance");
         return Infinity;
     }

     // Calculate sum of squares for valid, matching dimensions
     for (const key of keysToCompare) {
         const s1 = userScoresObj[key]; // User score for this force
         const s2 = conceptScoresObj[key]; // Star score for this force

         const s1Valid = typeof s1 === 'number' && !isNaN(s1);
         // Check if the concept *has* a score defined for this key, and if it's a valid number
         const s2Valid = conceptScoresObj.hasOwnProperty(key) && typeof s2 === 'number' && !isNaN(s2);

         if (s1Valid && s2Valid) {
             sumOfSquares += Math.pow(s1 - s2, 2);
             validDimensions++;
         } else {
             // Optional: Log if a dimension is missing or invalid on either side
             // console.log(`Skipping dimension ${key} in distance calc (s1Valid: ${s1Valid}, s2Valid: ${s2Valid})`);
         }
     }

     // Return Infinity if no valid dimensions were found for comparison
     if (validDimensions === 0) {
         console.warn("No valid dimensions found for comparison in euclideanDistance");
         return Infinity;
     }

     // Return the square root of the sum of squares
     return Math.sqrt(sumOfSquares);
}

console.log("utils.js loaded.");
