// js/cardData.js

/**
 * Represents the base definition of a card.
 * Specific instances in the game will be derived from these definitions.
 */
class CardDefinition {
    /**
     * @param {string} id - Unique identifier (e.g., 'impact_play_light')
     * @param {string} name - Display name (e.g., 'Impact Play (Light)')
     * @param {string} type - CardType enum value (e.g., CardType.SKILL)
     * @param {string} element - Elements enum value (e.g., Elements.SENSORY)
     * @param {number} cost - Insight cost to play
     * @param {string} rarity - CardRarity enum value (e.g., CardRarity.COMMON)
     * @param {string} description - Text describing the card's effect
     * @param {object} effects - Structured representation of effects (e.g., { damage: 6, applyStatus: { target: 'enemy', status: StatusEffects.VULNERABLE, amount: 1 }})
     * @param {object} [momentumEffect] - Optional bonus effect triggered by Momentum { threshold: number, description: string, effects: object }
     * @param {object} [resonanceEffect] - Optional bonus effect triggered by Resonance { element: string, description: string, effects: object }
     * @param {object} [upgrade] - Definition for the upgraded version { cost: number, description: string, effects: object, momentumEffect?: object, resonanceEffect?: object }
     * @param {string[]} [keywords] - List of keywords (e.g., [StatusEffects.EXHAUST])
     * @param {string} [artId] - Identifier for card art (maps to Persona Lab concept art if possible)
     */
    constructor({
        id,
        name,
        type,
        element,
        cost,
        rarity,
        description,
        effects = {},
        momentumEffect = null,
        resonanceEffect = null,
        upgrade = null,
        keywords = [],
        artId = null // Use concept ID or a generic one
    }) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.element = element;
        this.cost = cost;
        this.rarity = rarity;
        this.description = description;
        this.effects = effects; // Effects when played normally
        this.momentumEffect = momentumEffect; // Requires momentum threshold
        this.resonanceEffect = resonanceEffect; // Requires resonance of specific element
        this.upgrade = upgrade; // Definition of the '+' version
        this.keywords = keywords; // Like Exhaust, Retain, Ethereal
        this.artId = artId || id; // Default artId to concept ID if not specified
    }
}

// --- Master Card Pool ---
// Stores all card definitions, keyed by their ID.
const BASE_CARD_POOL = {};

/**
 * Adds a card definition to the pool.
 * @param {CardDefinition} cardDef - The CardDefinition object.
 */
function addCardDefinition(cardDef) {
    if (BASE_CARD_POOL[cardDef.id]) {
        console.warn(`Card definition with ID '${cardDef.id}' already exists. Overwriting.`);
    }
    BASE_CARD_POOL[cardDef.id] = cardDef;
}

/**
 * Retrieves a card definition by its ID.
 * @param {string} cardId - The unique ID of the card.
 * @returns {CardDefinition | undefined} The card definition or undefined if not found.
 */
function getCardDefinition(cardId) {
    return BASE_CARD_POOL[cardId];
}

// --- Example Card Definitions (Based on Design Doc) ---

addCardDefinition(new CardDefinition({
    id: 'impact_play_light',
    name: 'Impact Play (Light)',
    type: CardType.SKILL, // Design doc says Skill, but effect is damage -> let's make it Attack for consistency? Or Skill dealing Bruise is fine? Let's try Skill first.
    element: Elements.SENSORY, // Assuming from S:6 score dominant
    cost: 1,
    rarity: CardRarity.COMMON, // Guessing rarity
    description: "Deal 6 Bruise. If Momentum > 2, gain 1 Insight.",
    effects: { dealBruise: { amount: 6, target: 'enemy', duration: 1 } }, // Bruise dealt over 1 turn
    momentumEffect: {
        threshold: 3, // Momentum > 2 means threshold is 3
        description: "Gain 1 Insight.",
        effects: { gainInsight: 1 }
    },
    upgrade: {
        cost: 1,
        description: "Deal 9 Bruise. If Momentum > 2, gain 1 Insight.",
        effects: { dealBruise: { amount: 9, target: 'enemy', duration: 1 } },
    },
    artId: 'impact_play_light' // Placeholder art ID
}));

addCardDefinition(new CardDefinition({
    id: 'relationship_anarchy',
    name: 'Relationship Anarchy',
    type: CardType.POWER,
    element: Elements.RELATIONAL, // Assuming R:9 dominant
    cost: 2,
    rarity: CardRarity.UNCOMMON, // Guessing rarity
    description: "At the start of your turn, the first card played costs 0 Insight.",
    effects: { applyPower: { effectId: 'first_card_free', permanent: true } }, // Effect handled by combat manager
    upgrade: {
        cost: 1, // Reduced cost on upgrade
        description: "At the start of your turn, the first card played costs 0 Insight.",
        effects: { applyPower: { effectId: 'first_card_free', permanent: true } },
    },
    artId: 'relationship_anarchy'
}));

addCardDefinition(new CardDefinition({
    id: 'dominance_psych',
    name: 'Dominance (Psych)',
    type: CardType.POWER,
    element: Elements.PSYCHOLOGICAL, // Assuming I:9 or RF:9 dominant? Let's pick Psychological based on name/theme. Needs clearer rule.
    cost: 3,
    rarity: CardRarity.RARE, // Guessing rarity based on cost/effect
    description: "Whenever you play an Interaction card, apply 1 Vulnerable.",
    effects: { applyPower: { effectId: 'interaction_vulnerable', permanent: true, trigger: 'onPlayInteractionCard', value: 1 } }, // Effect handled by combat manager
    upgrade: {
        cost: 3,
        description: "Whenever you play an Interaction card, apply 2 Vulnerable.",
        effects: { applyPower: { effectId: 'interaction_vulnerable', permanent: true, trigger: 'onPlayInteractionCard', value: 2 } },
    },
    artId: 'dominance_psych'
}));

// --- Starter Card Definitions ---

addCardDefinition(new CardDefinition({
    id: 'starter_strike',
    name: 'Strike',
    type: CardType.ATTACK,
    element: Elements.NEUTRAL, // Neutral starter
    cost: 1,
    rarity: CardRarity.STARTER,
    description: "Deal 6 Bruise.",
    effects: { dealBruise: { amount: 6, target: 'enemy', duration: 1 } },
    upgrade: {
        cost: 1,
        description: "Deal 9 Bruise.",
        effects: { dealBruise: { amount: 9, target: 'enemy', duration: 1 } },
    },
    artId: 'starter_strike' // Generic art ID
}));

addCardDefinition(new CardDefinition({
    id: 'starter_defend',
    name: 'Defend',
    type: CardType.SKILL,
    element: Elements.NEUTRAL,
    cost: 1,
    rarity: CardRarity.STARTER,
    description: "Gain 5 Guard.",
    effects: { gainGuard: { amount: 5, target: 'player' } },
    upgrade: {
        cost: 1,
        description: "Gain 8 Guard.",
        effects: { gainGuard: { amount: 8, target: 'player' } },
    },
    artId: 'starter_defend' // Generic art ID
}));

addCardDefinition(new CardDefinition({
    id: 'starter_doubt', // Example starter representing a small negative aspect
    name: 'Lingering Doubt',
    type: CardType.CURSE,
    element: Elements.NEUTRAL,
    cost: null, // Unplayable
    rarity: CardRarity.SPECIAL, // Curses are special
    description: "Unplayable. Ethereal.",
    keywords: [StatusEffects.ETHEREAL], // Exhausts if not played (but it can't be played)
    effects: {}, // No effect when "played" (it can't be)
    artId: 'starter_doubt'
}));

// --- Placeholder Conversion Function ---

/**
 * Takes a concept object from Persona Lab data and attempts to convert it
 * into a CardDefinition object for the roguelite.
 * THIS IS A PLACEHOLDER/CONCEPTUAL FUNCTION. The actual logic needs refinement.
 * @param {object} conceptData - Object representing a discovered concept (e.g., { id: '...', name: '...', cardType: 'Practice/Kink', elementScores: { S:6, I:6, RF:6 }, keywords: ['intensity'], ... })
 * @returns {CardDefinition | null} A CardDefinition object or null if conversion fails.
 */
function createCardFromConcept(conceptData) {
    if (!conceptData || !conceptData.id || !conceptData.name || !conceptData.cardType || !conceptData.elementScores) {
        console.warn("Invalid concept data provided for card conversion:", conceptData);
        return null;
    }

    let cardType;
    let baseEffectValue = 0;
    let cost = 1; // Default cost
    let rarity = CardRarity.COMMON; // Default rarity

    // --- Determine Dominant Element ---
    let dominantElement = Elements.NEUTRAL;
    let maxScore = 0;
    const relevantScores = { // Only consider the 5 gameplay elements
        [Elements.COGNITIVE]: conceptData.elementScores.C || 0,
        [Elements.RELATIONAL]: conceptData.elementScores.R || 0,
        [Elements.SENSORY]: conceptData.elementScores.S || 0,
        [Elements.PSYCHOLOGICAL]: conceptData.elementScores.P || 0,
        [Elements.INTERACTION]: conceptData.elementScores.I || 0,
    };
    for (const [element, score] of Object.entries(relevantScores)) {
        if (score > maxScore) {
            maxScore = score;
            dominantElement = element;
        } else if (score === maxScore && score > 0) {
            // Handle ties? For now, maybe pick the first one, or keep Neutral if tied?
            // Let's keep the first one encountered for simplicity.
        }
    }
    baseEffectValue = Math.max(1, Math.floor(maxScore * 0.8 + 2)); // Rough scaling: Score * 0.8 + 2

    // --- Determine Card Type and Base Effect (Simplified Rules) ---
    // These rules need significant expansion based on cardType strings from Persona Lab
    const typeString = conceptData.cardType.toLowerCase();
    let description = "";
    let effects = {};
    let momentumEffect = null;
    let keywords = [];

    if (typeString.includes('kink') || typeString.includes('practice') || typeString.includes('identity') || typeString.includes('role')) {
        // Could be Attack, Skill, or Power depending on keywords/element/scores
        if (dominantElement === Elements.SENSORY || dominantElement === Elements.INTERACTION) {
            cardType = CardType.ATTACK;
            description = `Deal ${baseEffectValue} Bruise.`;
            effects = { dealBruise: { amount: baseEffectValue, target: 'enemy', duration: 1 } };
        } else if (dominantElement === Elements.COGNITIVE || dominantElement === Elements.RELATIONAL) {
            cardType = CardType.SKILL;
            description = `Gain ${Math.floor(baseEffectValue * 0.8)} Guard.`; // Guard slightly less than Bruise?
            effects = { gainGuard: { amount: Math.floor(baseEffectValue * 0.8), target: 'player' } };
        } else { // Psychological or Neutral default
            cardType = CardType.POWER;
            cost = 2; // Powers often cost more
            description = `Passive effect related to ${conceptData.name}.`; // Needs real logic
            effects = { applyPower: { effectId: conceptData.id + '_power', permanent: true } }; // Generic power effect
        }
    } else if (typeString.includes('relationship style') || typeString.includes('philosophy')) {
        cardType = CardType.POWER;
        cost = 2;
        description = `Passive effect related to ${conceptData.name}.`;
        effects = { applyPower: { effectId: conceptData.id + '_power', permanent: true } };
    } else if (typeString.includes('feeling') || typeString.includes('need')) {
        cardType = CardType.SKILL;
        description = `Gain some benefit related to ${conceptData.name}.`; // Needs real logic (e.g., draw cards, gain Insight)
        effects = { drawCards: 1 }; // Placeholder
    } else {
        // Default fallback: Basic Skill
        cardType = CardType.SKILL;
        description = `Gain ${Math.floor(baseEffectValue * 0.8)} Guard.`;
        effects = { gainGuard: { amount: Math.floor(baseEffectValue * 0.8), target: 'player' } };
    }

    // --- Determine Cost & Rarity (Simplified Rules) ---
    const totalScore = Object.values(conceptData.elementScores).reduce((sum, score) => sum + (score || 0), 0);
    if (maxScore >= 8 || totalScore >= 25) {
        rarity = CardRarity.RARE;
        cost = (cardType === CardType.POWER) ? 3 : 2;
    } else if (maxScore >= 5 || totalScore >= 15) {
        rarity = CardRarity.UNCOMMON;
        cost = (cardType === CardType.POWER) ? 2 : 1;
    } else {
        rarity = CardRarity.COMMON;
        cost = (cardType === CardType.POWER) ? 1 : (cardType === CardType.ATTACK || cardType === CardType.SKILL) ? 1 : 0; // Basic cards cost 1
    }
    if (cardType === CardType.CURSE) { // Overrides based on potential keywords/flags later
        cost = null;
        rarity = CardRarity.SPECIAL;
    }


    // --- Add Momentum/Keywords based on conceptData.keywords ---
    // Example: if conceptData.keywords.includes('synergy') add momentum effect
    if (conceptData.keywords && conceptData.keywords.includes('synergy')) {
         momentumEffect = {
            threshold: 3,
            description: "Draw 1 card.",
            effects: { drawCards: 1 }
        };
        description += ` If Momentum > 2, draw 1 card.`;
    }
     if (conceptData.keywords && conceptData.keywords.includes('fleeting')) {
        keywords.push(StatusEffects.ETHEREAL);
        description += ` Ethereal.`;
    }
     if (conceptData.keywords && conceptData.keywords.includes('finality')) {
        keywords.push(StatusEffects.EXHAUST);
        description += ` Exhaust.`;
    }


    // --- Define Upgrade Path (Simplified: +3 Bruise/Guard, or enhance effect) ---
    let upgradeDef = null;
    if (cardType === CardType.ATTACK && effects.dealBruise) {
        const upgradedAmount = effects.dealBruise.amount + 3;
        upgradeDef = {
            cost: cost, // Usually cost stays same unless specified
            description: description.replace(`Deal ${effects.dealBruise.amount}`, `Deal ${upgradedAmount}`),
            effects: { ...effects, dealBruise: { ...effects.dealBruise, amount: upgradedAmount } }
        };
    } else if (cardType === CardType.SKILL && effects.gainGuard) {
        const upgradedAmount = effects.gainGuard.amount + 3;
         upgradeDef = {
            cost: cost,
            description: description.replace(`Gain ${effects.gainGuard.amount}`, `Gain ${upgradedAmount}`),
            effects: { ...effects, gainGuard: { ...effects.gainGuard, amount: upgradedAmount } }
        };
    } // Add upgrade logic for other effects/types

    // --- Create Definition ---
    const cardDef = new CardDefinition({
        id: conceptData.id,
        name: conceptData.name,
        type: cardType,
        element: dominantElement,
        cost: cost,
        rarity: rarity,
        description: description.trim(),
        effects: effects,
        momentumEffect: momentumEffect,
        keywords: keywords,
        upgrade: upgradeDef,
        artId: conceptData.id // Use concept ID for art mapping
    });

    return cardDef;
}


// --- Function to load all known concepts from Persona Lab data ---
// This would be called once during game initialization.
function loadCardsFromPersonaLabData(personaLabData) {
    if (!personaLabData || !personaLabData.discoveredConcepts) {
        console.warn("Cannot load cards: Persona Lab data is missing or invalid.");
        return;
    }

    let loadedCount = 0;
    for (const concept of Object.values(personaLabData.discoveredConcepts)) {
        // Filter out concepts that shouldn't be cards (e.g., Orientation?)
        // The design doc excludes Orientation, add more filters if needed
        if (concept.cardType && !concept.cardType.toLowerCase().includes('orientation')) {
            const cardDef = createCardFromConcept(concept);
            if (cardDef) {
                addCardDefinition(cardDef);
                loadedCount++;
            }
        }
    }
    console.log(`Loaded ${loadedCount} card definitions from Persona Lab data.`);

    // Ensure starter cards are always present, even if Lab data is empty
    if (!getCardDefinition('starter_strike')) addCardDefinition(/* definition from above */);
    if (!getCardDefinition('starter_defend')) addCardDefinition(/* definition from above */);
    // Make sure starter definitions are actually added if not loaded from Lab
    // (Code above adds them unconditionally, which is fine too)
}

// Example of how you might initialize later:
// const savedLabData = getPersonaLabData();
// loadCardsFromPersonaLabData(savedLabData);
// console.log("Available cards:", BASE_CARD_POOL);
