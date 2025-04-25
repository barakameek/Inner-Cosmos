// js/relicData.js

/**
 * Represents the base definition of a Relic.
 * Player will possess instances of these during a run.
 */
class RelicDefinition {
    /**
     * @param {string} id - Unique identifier (e.g., 'meditative_focus')
     * @param {string} name - Display name (e.g., 'Meditative Focus')
     * @param {string} rarity - CardRarity enum value (Common, Uncommon, Rare, Boss, Starter, Special) - Using CardRarity for convenience, might need its own enum later.
     * @param {string} description - Text explaining the relic's effect.
     * @param {string} [flavorText] - Optional thematic text.
     * @param {object} effects - Structured representation of passive effects (e.g., { modifyStat: { stat: 'maxInsight', value: 1 }, triggerEffect: { trigger: 'onCombatStart', action: 'gainGuard', value: 5 } }).
     * @param {string} [unlockCondition] - Optional description of how it's unlocked via meta-progression.
     * @param {string} [artId] - Identifier for relic art.
     */
    constructor({
        id,
        name,
        rarity,
        description,
        flavorText = "",
        effects = {},
        unlockCondition = null,
        artId = null
    }) {
        this.id = id;
        this.name = name;
        this.rarity = rarity; // e.g., CardRarity.UNCOMMON
        this.description = description;
        this.flavorText = flavorText;
        this.effects = effects; // How the game interprets the relic's function
        this.unlockCondition = unlockCondition; // For meta-game display
        this.artId = artId || id; // Default artId to relic ID if not specified
    }
}

// --- Master Relic Pool ---
// Stores all relic definitions, keyed by their ID.
const BASE_RELIC_POOL = {};

/**
 * Adds a relic definition to the pool.
 * @param {RelicDefinition} relicDef - The RelicDefinition object.
 */
function addRelicDefinition(relicDef) {
    if (BASE_RELIC_POOL[relicDef.id]) {
        console.warn(`Relic definition with ID '${relicDef.id}' already exists. Overwriting.`);
    }
    BASE_RELIC_POOL[relicDef.id] = relicDef;
}

/**
 * Retrieves a relic definition by its ID.
 * @param {string} relicId - The unique ID of the relic.
 * @returns {RelicDefinition | undefined} The relic definition or undefined if not found.
 */
function getRelicDefinition(relicId) {
    return BASE_RELIC_POOL[relicId];
}

/**
 * Gets a list of relic IDs based on rarity.
 * @param {string} rarity - The CardRarity constant.
 * @param {boolean} includeLower - If true, also includes relics of lower rarities.
 * @returns {string[]} List of matching relic IDs.
 */
function getRelicIdsByRarity(rarity, includeLower = false) {
    const rarities = [CardRarity.STARTER, CardRarity.COMMON, CardRarity.UNCOMMON, CardRarity.RARE, CardRarity.SPECIAL, CardRarity.BOSS]; // Define order
    const targetIndex = rarities.indexOf(rarity);
    if (targetIndex === -1) return [];

    const allowedRarities = includeLower
        ? rarities.slice(0, targetIndex + 1)
        : [rarity];

    return Object.values(BASE_RELIC_POOL)
        .filter(relic => allowedRarities.includes(relic.rarity))
        .map(relic => relic.id);
}


// --- Example Relic Definitions ---

// --- Starter Relics (Could be chosen/assigned at run start) ---
addRelicDefinition(new RelicDefinition({
    id: 'inner_spark',
    name: 'Inner Spark',
    rarity: CardRarity.STARTER,
    description: "Start each combat with 1 Resonance: Neutral.", // Generic starting point
    flavorText: "A faint flicker against the encroaching shadows.",
    effects: { triggerEffect: { trigger: 'onCombatStart', action: 'gainResonance', element: Elements.NEUTRAL, value: 1 } },
    artId: 'inner_spark'
}));

addRelicDefinition(new RelicDefinition({
    id: 'worn_journal',
    name: 'Worn Journal',
    rarity: CardRarity.STARTER,
    description: "Start each run with +1 Max Composure.", // Slight HP increase
    flavorText: "Filled with half-formed thoughts and forgotten insights.",
    effects: { modifyStat: { stat: 'maxHp', value: 5 } }, // Assuming +5 HP instead of +1 for meaningfulness
    artId: 'worn_journal'
}));


// --- Common Relics ---
addRelicDefinition(new RelicDefinition({
    id: 'shard_magnet',
    name: 'Shard Magnet',
    rarity: CardRarity.COMMON,
    description: "Gain +10 Insight Shards after each combat.",
    flavorText: "Even small glimmers are drawn to it.",
    effects: { triggerEffect: { trigger: 'onCombatEnd', condition:'victory', action: 'gainCurrency', currency: Currency.INSIGHT_SHARDS, value: 10 } },
    artId: 'shard_magnet'
}));

addRelicDefinition(new RelicDefinition({
    id: 'focus_crystal_cognitive',
    name: 'Focus Crystal (Cognitive)',
    rarity: CardRarity.COMMON,
    description: "Whenever you generate Momentum with a Cognitive card, gain 1 extra Momentum.",
    flavorText: "Sharpens the edges of thought.",
    effects: { modifyMechanic: { mechanic: 'momentumGain', element: Elements.COGNITIVE, value: 1 } },
    // This needs specific handling in the momentum logic
    artId: 'focus_crystal_cognitive'
}));


// --- Uncommon Relics ---
addRelicDefinition(new RelicDefinition({
    id: 'meditative_focus',
    name: 'Meditative Focus',
    rarity: CardRarity.UNCOMMON,
    description: "At Respite nodes, you may Refine (remove) 1 additional card.",
    flavorText: "Clarity often comes from letting go.",
    effects: { modifyNodeInteraction: { node: NodeType.RESPITE, option: 'refine', value: 1 } },
    artId: 'meditative_focus'
}));

addRelicDefinition(new RelicDefinition({
    id: 'echoing_chamber',
    name: 'Echoing Chamber',
    rarity: CardRarity.UNCOMMON,
    description: "The first card played each turn that matches the previous turn's last played Element costs 1 less Insight.",
    flavorText: "Resonating thoughts build upon themselves.",
    effects: { modifyCardCost: { condition: 'firstCardMatchesLastElement', value: -1 } },
    // Requires state tracking between turns
    artId: 'echoing_chamber'
}));


// --- Rare Relics ---
addRelicDefinition(new RelicDefinition({
    id: 'persona_mask', // Connects to the Persona theme
    name: 'Persona Mask',
    rarity: CardRarity.RARE,
    description: "Gain +1 Max Insight.",
    flavorText: "Adopt a new face, gain new potential.",
    effects: { modifyStat: { stat: 'maxInsight', value: 1 } },
    artId: 'persona_mask'
}));

addRelicDefinition(new RelicDefinition({
    id: 'integrated_circuit',
    name: 'Integrated Circuit',
    rarity: CardRarity.RARE,
    description: "Whenever you trigger Resonance, gain 2 Guard.",
    flavorText: "Harmony provides its own defense.",
    effects: { triggerEffect: { trigger: 'onResonanceTrigger', action: 'gainGuard', value: 2 } },
    artId: 'integrated_circuit'
}));


// --- Boss Relics (Often powerful with potential downsides) ---
addRelicDefinition(new RelicDefinition({
    id: 'shadow_core',
    name: 'Shadow Core',
    rarity: CardRarity.BOSS,
    description: "Gain +1 Insight per turn. Start each combat with 1 Dissonance (Static card) in your draw pile.",
    flavorText: "Power drawn from the depths often carries a price.",
    effects: {
        modifyStat: { stat: 'baseInsight', value: 1 },
        triggerEffect: { trigger: 'onCombatStart', action: 'addCardToDrawPile', cardId: 'status_static', count: 1 }
    },
    artId: 'shadow_core'
}));

addCardDefinition(new CardDefinition({ // Define the Static card used by the boss relic
    id: 'status_static',
    name: 'Static',
    type: CardType.STATUS, // Using Status type
    element: Elements.NEUTRAL,
    cost: null, // Unplayable
    rarity: CardRarity.SPECIAL,
    description: "Unplayable.",
    keywords: [],
    effects: {},
    artId: 'status_static'
}));


// --- Loading Relics ---
// Relics might be loaded unconditionally at the start,
// or some might be locked behind meta-progression (Integration Points) initially.
// We can add a check here later based on meta-progression data.

function initializeRelicPool() {
    // Currently adds all defined relics.
    // Later, this function could check meta-progression flags
    // before adding certain relics to the available pool for a run.
    console.log(`Initialized Relic Pool with ${Object.keys(BASE_RELIC_POOL).length} definitions.`);
}

// Call initialization immediately for now
initializeRelicPool();

// Example usage:
// const randomUncommonRelicId = getRandomElement(getRelicIdsByRarity(CardRarity.UNCOMMON));
// console.log("Random Uncommon Relic ID:", randomUncommonRelicId);
// if (randomUncommonRelicId) {
//     console.log("Relic Definition:", getRelicDefinition(randomUncommonRelicId));
// }
