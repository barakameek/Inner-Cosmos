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
     * @param {number | null} cost - Insight cost to play (null for unplayable).
     * @param {string} rarity - CardRarity enum value (e.g., CardRarity.COMMON)
     * @param {string} description - Text describing the card's effect
     * @param {object} [effects={}] - Structured representation of effects (e.g., { dealBruise: 6, applyStatus: { target: 'enemy', status: StatusEffects.VULNERABLE, amount: 1 }})
     * @param {object} [momentumEffect=null] - Optional bonus effect triggered by Momentum { threshold: number, description: string, effects: object }
     * @param {object} [resonanceEffect=null] - Optional bonus effect triggered by Resonance { element: string, description: string, effects: object }
     * @param {object | null} [upgrade=null] - Definition for the upgraded version { cost: number, description: string, effects: object, momentumEffect?: object, resonanceEffect?: object }
     * @param {string[]} [keywords=[]] - List of keywords (e.g., [StatusEffects.EXHAUST])
     * @param {string | null} [artId=null] - Identifier for card art (maps to Persona Lab concept art if possible)
     * @param {object} [triggers=null] - Optional: Triggers for power cards { onPlayInteractionCard: { effects: {...} }, onTurnStart: { effects: {...} } } (Used by Player.triggerEffects)
     */
    constructor({
        id,
        name,
        type,
        element = Elements.NEUTRAL, // Default element
        cost,
        rarity,
        description,
        effects = {},
        momentumEffect = null,
        resonanceEffect = null,
        upgrade = null,
        keywords = [],
        artId = null,
        triggers = null // Added for power cards
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
        this.triggers = triggers; // For passive effects of powers
    }
}

// --- Master Card Pool ---
// Stores all card definitions, keyed by their ID.
const BASE_CARD_POOL = {};

/**
 * Adds a card definition to the pool. Checks for duplicates.
 * @param {CardDefinition} cardDef - The CardDefinition object.
 */
function addCardDefinition(cardDef) {
    if (!cardDef || !cardDef.id) {
        console.error("Attempted to add invalid card definition:", cardDef);
        return;
    }
    if (BASE_CARD_POOL[cardDef.id]) {
        // Avoid warning spam from redundant additions in main.js/data files
        // console.warn(`Card definition with ID '${cardDef.id}' already exists. Overwriting.`);
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
    type: CardType.ATTACK, // Changed to Attack as it deals damage directly
    element: Elements.SENSORY, // Assuming from S:6 score dominant
    cost: 1,
    rarity: CardRarity.COMMON, // Guessing rarity
    description: "Deal 6 Bruise. Momentum 3: Gain 1 Insight.", // Simplified desc. for display
    effects: { dealBruise: { amount: 6, target: 'enemy', duration: 1 } }, // Bruise dealt over 1 turn
    momentumEffect: {
        threshold: 3, // Momentum >= 3
        description: "Gain 1 Insight.", // For tooltip/internal use
        effects: { gainInsight: 1 }
    },
    upgrade: {
        // Inherits non-overridden properties from base automatically via Card class logic
        description: "Deal 9 Bruise. Momentum 3: Gain 1 Insight.",
        effects: { dealBruise: { amount: 9, target: 'enemy', duration: 1 } },
        // momentumEffect is implicitly inherited unless overridden here
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
    effects: { applyPower: { effectId: 'first_card_free', permanent: true } }, // Effect handled by combat manager logic checking powers
    // Define triggers for CombatManager/Player system
    triggers: {
        onTurnStart: { // Custom ID for effect logic handler
             effectId: 'first_card_free_setup'
        },
        // Maybe onCardPlayed trigger checks if it's the first? Complex.
    },
    upgrade: {
        cost: 1, // Reduced cost on upgrade
        description: "At the start of your turn, the first card played costs 0 Insight.",
        // effects & triggers are implicitly inherited
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
    description: "Whenever you play an Interaction card, apply 1 Vulnerable to a random enemy.", // Clarified target for simplicity
    effects: { applyPower: { effectId: 'interaction_vulnerable', permanent: true } },
    // Define triggers for CombatManager/Player system
    triggers: {
         onPlayInteractionCard: { // Specific trigger ID handled in Player.triggerEffects
              effects: { applyStatus: { target: 'random_enemy', status: StatusEffects.VULNERABLE, amount: 1, duration: 1 } } // Effect logic
         }
    },
    upgrade: {
        description: "Whenever you play an Interaction card, apply 2 Vulnerable to a random enemy.",
        triggers: {
             onPlayInteractionCard: {
                  effects: { applyStatus: { target: 'random_enemy', status: StatusEffects.VULNERABLE, amount: 2, duration: 1 } }
             }
        }
    },
    artId: 'dominance_psych'
}));

// --- Starter Card Definitions ---

addCardDefinition(new CardDefinition({
    id: 'starter_strike',
    name: 'Strike',
    type: CardType.ATTACK,
    element: Elements.NEUTRAL,
    cost: 1,
    rarity: CardRarity.STARTER,
    description: "Deal 6 Bruise.",
    effects: { dealBruise: { amount: 6, target: 'enemy', duration: 1 } },
    upgrade: {
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

// --- Status/Curse Cards Required by Other Systems ---

addCardDefinition(new CardDefinition({
    id: 'status_static',
    name: 'Static',
    type: CardType.STATUS, // Using Status type
    element: Elements.NEUTRAL,
    cost: null, // Unplayable
    rarity: CardRarity.SPECIAL,
    description: "Unplayable.",
    keywords: [], // Does not inherently Exhaust or become Ethereal unless added by source
    effects: {},
    artId: 'status_static' // Needs generic art
}));

addCardDefinition(new CardDefinition({
    id: 'curse_heavy_heart',
    name: 'Heavy Heart',
    type: CardType.CURSE,
    element: Elements.NEUTRAL,
    cost: null, // Unplayable
    rarity: CardRarity.SPECIAL,
    description: "Unplayable. While in hand, reduce Insight gain by 1 at start of turn.",
    keywords: [],
    effects: { passiveInHand: { effectId: 'reduceInsightGain', value: 1 } }, // Special handler needed in Player.calculateTurnInsightGain
    artId: 'curse_heavy_heart' // Needs generic art
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
    // Rough scaling for effect value based on highest score (needs tuning)
    baseEffectValue = Math.max(1, Math.floor(maxScore * 0.9 + 2));

    // --- Determine Card Type and Base Effect (Simplified Rules) ---
    // These rules need significant expansion based on cardType strings from Persona Lab
    const typeString = conceptData.cardType.toLowerCase();
    let description = "";
    let effects = {};
    let momentumEffect = null;
    let keywords = [];
    let triggers = null;

    // Very simplified mapping - NEEDS EXPANSION
    if (typeString.includes('kink') || typeString.includes('practice') || typeString.includes('identity') || typeString.includes('role')) {
        if (dominantElement === Elements.SENSORY || dominantElement === Elements.INTERACTION || dominantElement === Elements.NEUTRAL) {
            cardType = CardType.ATTACK;
            effects = { dealBruise: { amount: baseEffectValue, target: 'enemy', duration: 1 } };
            description = `Deal ${baseEffectValue} Bruise.`;
        } else if (dominantElement === Elements.COGNITIVE || dominantElement === Elements.RELATIONAL) {
            cardType = CardType.SKILL;
            const guardAmount = Math.max(3, Math.floor(baseEffectValue * 0.8)); // Guard slightly less than Bruise? Minimum 3.
            effects = { gainGuard: { amount: guardAmount, target: 'player' } };
            description = `Gain ${guardAmount} Guard.`;
        } else { // Psychological default? Powers often fit here.
            cardType = CardType.POWER;
            description = `Passive effect related to ${conceptData.name}.`; // Needs real logic
            effects = { applyPower: { effectId: conceptData.id + '_power', permanent: true } };
            triggers = {}; // Placeholder for trigger definition
        }
    } else if (typeString.includes('relationship style') || typeString.includes('philosophy')) {
        cardType = CardType.POWER;
        description = `Passive effect related to ${conceptData.name}.`;
        effects = { applyPower: { effectId: conceptData.id + '_power', permanent: true } };
        triggers = {};
    } else if (typeString.includes('feeling') || typeString.includes('need')) {
        cardType = CardType.SKILL;
        // Example: Map 'need for connection' -> draw cards? 'need for safety' -> gain guard?
        if (dominantElement === Elements.RELATIONAL) {
            effects = { drawCards: Math.max(1, Math.floor(baseEffectValue / 5)) }; // e.g., score 5-9 -> draw 1, 10+ -> draw 2
            description = `Draw ${effects.drawCards} card(s).`;
        } else {
             const guardAmount = Math.max(3, Math.floor(baseEffectValue * 0.8));
             effects = { gainGuard: { amount: guardAmount, target: 'player' } };
             description = `Gain ${guardAmount} Guard.`;
        }
    } else {
        // Default fallback: Basic Attack
        cardType = CardType.ATTACK;
        effects = { dealBruise: { amount: Math.max(4, baseEffectValue - 2), target: 'enemy', duration: 1 } }; // Slightly weaker default
        description = `Deal ${effects.dealBruise.amount} Bruise.`;
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
    // Ensure powers cost at least 1 unless explicitly 0?
    if (cardType === CardType.POWER && cost === 0) cost = 1;


    // --- Add Momentum/Keywords based on conceptData.keywords ---
    if (conceptData.keywords && conceptData.keywords.includes('synergy')) {
         momentumEffect = {
            threshold: 3,
            description: "Draw 1 card.", // For internal use
            effects: { drawCards: 1 }
        };
        description += ` Momentum 3: Draw 1 card.`;
    }
     if (conceptData.keywords && conceptData.keywords.includes('fleeting')) {
        keywords.push(StatusEffects.ETHEREAL);
        description += ` Ethereal.`;
    }
     if (conceptData.keywords && conceptData.keywords.includes('finality')) {
        keywords.push(StatusEffects.EXHAUST);
        description += ` Exhaust.`;
    }
    // Add more keyword mappings...


    // --- Define Upgrade Path (Simplified: +3 Bruise/Guard, or enhance effect) ---
    let upgradeDef = null;
    let upgradeDescription = description; // Start with base description for upgrade
    let upgradeEffects = deepCopy(effects); // Copy base effects
    let upgradeMomentumEffect = momentumEffect ? deepCopy(momentumEffect) : null;
    let upgradeTriggers = triggers ? deepCopy(triggers) : null;

    // Simple numerical upgrade logic
    if (cardType === CardType.ATTACK && upgradeEffects.dealBruise) {
        const upgradedAmount = upgradeEffects.dealBruise.amount + 3;
        upgradeDescription = upgradeDescription.replace(`${upgradeEffects.dealBruise.amount} Bruise`, `${upgradedAmount} Bruise`);
        upgradeEffects.dealBruise.amount = upgradedAmount;
    } else if (cardType === CardType.SKILL && upgradeEffects.gainGuard) {
        const upgradedAmount = upgradeEffects.gainGuard.amount + 3;
        upgradeDescription = upgradeDescription.replace(`Gain ${upgradeEffects.gainGuard.amount}`, `Gain ${upgradedAmount}`);
         upgradeEffects.gainGuard.amount = upgradedAmount;
    } else if (cardType === CardType.SKILL && upgradeEffects.drawCards) {
         const upgradedAmount = upgradeEffects.drawCards + 1;
         upgradeDescription = upgradeDescription.replace(`Draw ${upgradeEffects.drawCards}`, `Draw ${upgradedAmount}`);
         upgradeEffects.drawCards = upgradedAmount;
    } else if (cardType === CardType.POWER && upgradeTriggers) {
         // Upgrade power effects - highly specific, needs better rules
         // Example: Increase Vulnerable stacks for Dominance(Psych)
         if (upgradeTriggers?.onPlayInteractionCard?.effects?.applyStatus?.status === StatusEffects.VULNERABLE) {
              upgradeTriggers.onPlayInteractionCard.effects.applyStatus.amount += 1;
               const newAmount = upgradeTriggers.onPlayInteractionCard.effects.applyStatus.amount;
               upgradeDescription = upgradeDescription.replace(`apply ${newAmount-1} Vulnerable`, `apply ${newAmount} Vulnerable`); // Update text
         }
    }

    // Add upgrade modifications for Momentum/Keywords if needed
    // Example: Upgrade adds Exhaust keyword
    // let upgradeKeywords = [...keywords];
    // if (...) upgradeKeywords.push(StatusEffects.EXHAUST);

    // Create the upgrade object if changes were made
    if (JSON.stringify(effects) !== JSON.stringify(upgradeEffects) ||
        JSON.stringify(triggers) !== JSON.stringify(upgradeTriggers) ||
        description !== upgradeDescription) {
        upgradeDef = {
            // Cost usually stays the same unless specified by keyword/rule
            cost: cost, // Can be overridden if needed
            description: upgradeDescription.trim(),
            effects: upgradeEffects,
            momentumEffect: upgradeMomentumEffect, // Assumes momentum effect doesn't change for now
            triggers: upgradeTriggers,
            // keywords: upgradeKeywords, // Add if keywords can change
        };
    }


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
        triggers: triggers,
        artId: conceptData.id // Use concept ID for art mapping
    });

    return cardDef;
}


// --- Function to load all known concepts from Persona Lab data ---
// This would be called once during game initialization.
function loadCardsFromPersonaLabData(personaLabData) {
    if (!personaLabData || !personaLabData.discoveredConcepts) {
        console.warn("Cannot load cards: Persona Lab data is missing or invalid.");
        return 0; // Return count of loaded cards
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
    return loadedCount;
}

// --- Initialize Base Pool ---
// Add required cards unconditionally. `addCardDefinition` handles overwrites gracefully.
function initializeBaseCardPool() {
    // Add starters/status/curses first
    addCardDefinition(new CardDefinition({ /* ... starter_strike definition ... */ id: 'starter_strike', name: 'Strike', type: CardType.ATTACK, element: Elements.NEUTRAL, cost: 1, rarity: CardRarity.STARTER, description: "Deal 6 Bruise.", effects: { dealBruise: { amount: 6, target: 'enemy', duration: 1 } }, upgrade: { description: "Deal 9 Bruise.", effects: { dealBruise: { amount: 9, target: 'enemy', duration: 1 } }, }, artId: 'starter_strike' }));
    addCardDefinition(new CardDefinition({ /* ... starter_defend definition ... */ id: 'starter_defend', name: 'Defend', type: CardType.SKILL, element: Elements.NEUTRAL, cost: 1, rarity: CardRarity.STARTER, description: "Gain 5 Guard.", effects: { gainGuard: { amount: 5, target: 'player' } }, upgrade: { description: "Gain 8 Guard.", effects: { gainGuard: { amount: 8, target: 'player' } }, }, artId: 'starter_defend' }));
    addCardDefinition(new CardDefinition({ /* ... starter_doubt definition ... */ id: 'starter_doubt', name: 'Lingering Doubt', type: CardType.CURSE, element: Elements.NEUTRAL, cost: null, rarity: CardRarity.SPECIAL, description: "Unplayable. Ethereal.", keywords: [StatusEffects.ETHEREAL], effects: {}, artId: 'starter_doubt' }));
    addCardDefinition(new CardDefinition({ /* ... status_static definition ... */ id: 'status_static', name: 'Static', type: CardType.STATUS, element: Elements.NEUTRAL, cost: null, rarity: CardRarity.SPECIAL, description: "Unplayable.", keywords: [], effects: {}, artId: 'status_static' }));
    addCardDefinition(new CardDefinition({ /* ... curse_heavy_heart definition ... */ id: 'curse_heavy_heart', name: 'Heavy Heart', type: CardType.CURSE, element: Elements.NEUTRAL, cost: null, rarity: CardRarity.SPECIAL, description: "Unplayable. While in hand, reduce Insight gain by 1 at start of turn.", keywords: [], effects: { passiveInHand: { effectId: 'reduceInsightGain', value: 1 } }, artId: 'curse_heavy_heart' }));

     // Add example cards (these might be overwritten if they exist in Persona Lab data)
     addCardDefinition(new CardDefinition({ /* ... impact_play_light definition ... */ id: 'impact_play_light', name: 'Impact Play (Light)', type: CardType.ATTACK, element: Elements.SENSORY, cost: 1, rarity: CardRarity.COMMON, description: "Deal 6 Bruise. Momentum 3: Gain 1 Insight.", effects: { dealBruise: { amount: 6, target: 'enemy', duration: 1 } }, momentumEffect: { threshold: 3, description: "Gain 1 Insight.", effects: { gainInsight: 1 } }, upgrade: { description: "Deal 9 Bruise. Momentum 3: Gain 1 Insight.", effects: { dealBruise: { amount: 9, target: 'enemy', duration: 1 } }, }, artId: 'impact_play_light' }));
     addCardDefinition(new CardDefinition({ /* ... relationship_anarchy definition ... */ id: 'relationship_anarchy', name: 'Relationship Anarchy', type: CardType.POWER, element: Elements.RELATIONAL, cost: 2, rarity: CardRarity.UNCOMMON, description: "At the start of your turn, the first card played costs 0 Insight.", effects: { applyPower: { effectId: 'first_card_free', permanent: true } }, triggers: { onTurnStart: { effectId: 'first_card_free_setup' } }, upgrade: { cost: 1, description: "At the start of your turn, the first card played costs 0 Insight." }, artId: 'relationship_anarchy' }));
     addCardDefinition(new CardDefinition({ /* ... dominance_psych definition ... */ id: 'dominance_psych', name: 'Dominance (Psych)', type: CardType.POWER, element: Elements.PSYCHOLOGICAL, cost: 3, rarity: CardRarity.RARE, description: "Whenever you play an Interaction card, apply 1 Vulnerable to a random enemy.", effects: { applyPower: { effectId: 'interaction_vulnerable', permanent: true } }, triggers: { onPlayInteractionCard: { effects: { applyStatus: { target: 'random_enemy', status: StatusEffects.VULNERABLE, amount: 1, duration: 1 } } } }, upgrade: { description: "Whenever you play an Interaction card, apply 2 Vulnerable to a random enemy.", triggers: { onPlayInteractionCard: { effects: { applyStatus: { target: 'random_enemy', status: StatusEffects.VULNERABLE, amount: 2, duration: 1 } } } } }, artId: 'dominance_psych' }));

    console.log(`Base card pool initialized with ${Object.keys(BASE_CARD_POOL).length} required/example cards.`);
}

// Initialize the base pool immediately when the script loads
initializeBaseCardPool();

// Example of how loading from Persona Lab might be called later in main.js:
// const savedLabData = getPersonaLabData();
// const loadedCount = loadCardsFromPersonaLabData(savedLabData);
// console.log(`Total cards available after loading: ${Object.keys(BASE_CARD_POOL).length}`);
