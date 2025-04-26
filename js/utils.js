// js/utils.js

/**
 * Generates a random integer between min (inclusive) and max (inclusive).
 * @param {number} min - The minimum possible value.
 * @param {number} max - The maximum possible value.
 * @returns {number} A random integer within the range.
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Selects a random element from an array.
 * @param {Array} array - The array to select from.
 * @returns {*} A random element from the array, or undefined if the array is empty.
 */
function getRandomElement(array) {
    if (!array || array.length === 0) {
        return undefined;
    }
    return array[getRandomInt(0, array.length - 1)];
}

/**
 * Shuffles an array in place using the Fisher-Yates (aka Knuth) Shuffle algorithm.
 * @param {Array} array - The array to be shuffled.
 */
function shuffleArray(array) {
    if (!array) return;
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // ES6 swap
    }
}

/**
 * Clamps a value between a minimum and maximum value.
 * @param {number} value - The value to clamp.
 * @param {number} min - The minimum allowed value.
 * @param {number} max - The maximum allowed value.
 * @returns {number} The clamped value.
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

/**
 * Generates a simple pseudo-UUID (Universally Unique Identifier).
 * Mainly for giving unique IDs to runtime objects like card instances.
 * Not cryptographically secure or guaranteed unique across sessions if persisted,
 * but good enough for runtime instance identification.
 * @returns {string} A pseudo-UUID string.
 */
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Safely retrieves and parses Persona Lab data from localStorage.
 * @returns {object | null} The parsed save data object, or null if not found or invalid JSON.
 */
function getPersonaLabData() {
    try {
        const rawData = localStorage.getItem(PERSONA_LAB_SAVE_KEY);
        if (rawData) {
            const parsedData = JSON.parse(rawData);
            // Basic validation: Check if it has some expected structure
            if (parsedData && typeof parsedData === 'object' && parsedData.discoveredConcepts) {
                 // Perform deeper validation if necessary (e.g., schema check)
                 console.log("Persona Lab data loaded successfully.");
                 return parsedData;
            } else {
                console.warn("Persona Lab data found in localStorage but seems invalid.");
                return null;
            }
        } else {
            console.log("No Persona Lab data found in localStorage.");
            return null;
        }
    } catch (error) {
        console.error("Error parsing Persona Lab data from localStorage:", error);
        return null;
    }
}

/**
 * Gets the elemental weakness for a given enemy archetype.
 * Based on the mapping defined in the design doc.
 * @param {string} archetype - The EnemyArchetype constant.
 * @returns {string | null} The Elements constant representing the weakness, or null if archetype is unknown.
 */
function getElementWeakness(archetype) {
    switch (archetype) {
        case EnemyArchetype.DOUBT: return Elements.INTERACTION;
        // Design doc used Attraction for Shame, mapped to Relational based on defined elements.
        case EnemyArchetype.SHAME: return Elements.RELATIONAL;
        case EnemyArchetype.FEAR: return Elements.SENSORY;
        case EnemyArchetype.DESPAIR: return Elements.PSYCHOLOGICAL;
        case EnemyArchetype.ANGER: return Elements.COGNITIVE;
        default: return null; // No defined weakness or unknown archetype
    }
}

/**
 * Gets the elemental resistance for a given enemy archetype.
 * Based on the mapping defined in the design doc.
 * @param {string} archetype - The EnemyArchetype constant.
 * @returns {string | null} The Elements constant representing the resistance, or null if archetype is unknown.
 */
function getElementResistance(archetype) {
    switch (archetype) {
        case EnemyArchetype.DOUBT: return Elements.PSYCHOLOGICAL;
        case EnemyArchetype.SHAME: return Elements.COGNITIVE;
        case EnemyArchetype.FEAR: return Elements.INTERACTION;
        case EnemyArchetype.DESPAIR: return Elements.RELATIONAL;
        case EnemyArchetype.ANGER: return Elements.SENSORY;
        default: return null; // No defined resistance or unknown archetype
    }
}

/**
 * Helper function to deep copy an object (useful for creating card instances).
 * Note: This is a simple version and won't handle functions, Dates, RegExps, Maps, Sets correctly.
 * Good enough for simple data objects like card definitions.
 * @param {object} obj - The object to copy.
 * @returns {object} A deep copy of the object.
 */
function deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    // Handle Arrays
    if (Array.isArray(obj)) {
        const arrCopy = [];
        obj.forEach((item, index) => {
            arrCopy[index] = deepCopy(item);
        });
        return arrCopy;
    }
    // Handle Objects
    const objCopy = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            objCopy[key] = deepCopy(obj[key]);
        }
    }
    return objCopy;
}

// Example usage (can be removed later):
// console.log("Random Int (1-10):", getRandomInt(1, 10));
// let testArray = [1, 2, 3, 4, 5];
// console.log("Random Element:", getRandomElement(testArray));
// shuffleArray(testArray);
// console.log("Shuffled Array:", testArray);
// console.log("Clamped Value (15, 0, 10):", clamp(15, 0, 10));
// console.log("Generated UUID:", uuidv4());
// console.log("Shame Weakness:", getElementWeakness(EnemyArchetype.SHAME));
// console.log("Shame Resistance:", getElementResistance(EnemyArchetype.SHAME));
