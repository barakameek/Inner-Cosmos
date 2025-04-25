// js/enemyData.js

/**
 * Represents the definition of an enemy type.
 * Instances in combat will be created based on these.
 */
class EnemyDefinition {
    /**
     * @param {string} id - Unique identifier (e.g., 'doubt_wraith')
     * @param {string} name - Display name (e.g., 'Doubt Wraith')
     * @param {string} archetype - EnemyArchetype enum value (e.g., EnemyArchetype.DOUBT)
     * @param {number} maxHp - Maximum health points.
     * @param {string} weakness - Elements enum value for weakness (auto-derived if possible).
     * @param {string} resistance - Elements enum value for resistance (auto-derived if possible).
     * @param {object[]} moveSet - An array of possible moves/intents the enemy can perform.
     * @param {boolean} [isElite=false] - Flag indicating if this is an Elite enemy.
     * @param {boolean} [isBoss=false] - Flag indicating if this is a Boss enemy.
     * @param {string} [artId] - Identifier for enemy art.
     * @param {object} [specialMechanics] - Any unique passive abilities or triggers.
     */
    constructor({
        id,
        name,
        archetype,
        maxHp,
        moveSet = [],
        isElite = false,
        isBoss = false,
        artId = null,
        specialMechanics = null
    }) {
        this.id = id;
        this.name = name;
        this.archetype = archetype; // Link to core archetype behaviour/theming
        this.maxHp = maxHp;
        this.weakness = getElementWeakness(archetype); // Use utility function
        this.resistance = getElementResistance(archetype); // Use utility function
        this.moveSet = moveSet; // List of potential actions
        this.isElite = isElite;
        this.isBoss = isBoss;
        this.artId = artId || id; // Default artId to enemy ID
        this.specialMechanics = specialMechanics; // e.g., { onDamageTaken: 'gainStrength', threshold: 10 }

        // Basic validation
        if (!this.weakness || !this.resistance) {
            console.warn(`Enemy '${this.id}' created without automatically derived Weakness/Resistance for archetype '${this.archetype}'. Check utils.js.`);
        }
        if (moveSet.length === 0) {
             console.warn(`Enemy '${this.id}' defined with an empty move set.`);
        }
    }
}

/**
 * Represents a potential action (Intent) an enemy can take.
 * @typedef {object} EnemyMove
 * @property {string} id - Unique ID for the move (e.g., 'basic_attack').
 * @property {string} intentType - Type of intent (e.g., 'Attack', 'Defend', 'Debuff', 'Buff', 'Dilemma', 'Special'). Helps determine icon.
 * @property {number} [damage] - Amount of base Bruise damage (if applicable).
 * @property {number} [block] - Amount of Guard gained (if applicable).
 * @property {object} [applyStatus] - Status to apply { status: string, target: string, amount: number, duration?: number }.
 * @property {object} [dilemma] - Dilemma choice definition (if intentType is 'Dilemma'). { id: string, text: string, choices: object[] }
 * @property {string} [description] - Optional text description for complex moves.
 * @property {number} [weight=1] - Relative probability of choosing this move (higher is more likely). Can be adjusted by combat logic.
 * @property {number} [minHpThreshold] - Optional: Move only usable below this HP percentage.
 * @property {number} [maxHpThreshold] - Optional: Move only usable above this HP percentage.
 * @property {number} [cooldown] - Optional: Turns before this move can be used again after being performed.
 * @property {boolean} [initialCooldown] - Optional: Cannot be used on turn 1.
 */

// --- Master Enemy Pool ---
const BASE_ENEMY_POOL = {};

/**
 * Adds an enemy definition to the pool.
 * @param {EnemyDefinition} enemyDef - The EnemyDefinition object.
 */
function addEnemyDefinition(enemyDef) {
    if (BASE_ENEMY_POOL[enemyDef.id]) {
        console.warn(`Enemy definition with ID '${enemyDef.id}' already exists. Overwriting.`);
    }
    BASE_ENEMY_POOL[enemyDef.id] = enemyDef;
}

/**
 * Retrieves an enemy definition by its ID.
 * @param {string} enemyId - The unique ID of the enemy.
 * @returns {EnemyDefinition | undefined} The enemy definition or undefined if not found.
 */
function getEnemyDefinition(enemyId) {
    return BASE_ENEMY_POOL[enemyId];
}

/**
 * Gets enemy IDs based on criteria (e.g., for encounters).
 * @param {object} options - Filtering options.
 * @param {boolean} [options.isElite] - Filter by elite status.
 * @param {boolean} [options.isBoss] - Filter by boss status.
 * @param {number} [options.layer] - Filter by the layer they might appear on (conceptual).
 * @param {string[]} [options.excludeIds] - List of IDs to exclude.
 * @returns {string[]} List of matching enemy IDs.
 */
function getEnemyIdsByCriteria({ isElite, isBoss, layer, excludeIds = [] } = {}) {
    return Object.values(BASE_ENEMY_POOL)
        .filter(enemy => {
            if (excludeIds.includes(enemy.id)) return false;
            if (isElite !== undefined && enemy.isElite !== isElite) return false;
            if (isBoss !== undefined && enemy.isBoss !== isBoss) return false;
            // Add layer filtering logic here if needed (e.g., based on HP or archetype)
            // Example: Simple layer logic based on HP / Elite status
            if (layer !== undefined) {
                 if (layer === 1 && (enemy.isElite || enemy.isBoss || enemy.maxHp > 60)) return false;
                 if (layer === 2 && (enemy.isBoss || (!enemy.isElite && enemy.maxHp < 50) || (enemy.isElite && enemy.maxHp < 80))) return false;
                 if (layer === 3 && !enemy.isBoss && !enemy.isElite) return false; // Layer 3 only Elites/Boss? Adjust rules.
            }

            return true;
        })
        .map(enemy => enemy.id);
}


// --- Standard Enemy Definitions ---

// Doubt Wraith (Cognitive Lean: Weak Interaction, Resist Psychological)
addEnemyDefinition(new EnemyDefinition({
    id: 'doubt_wraith',
    name: 'Doubt Wraith',
    archetype: EnemyArchetype.DOUBT,
    maxHp: 45,
    artId: 'doubt_wraith',
    moveSet: [
        { id: 'dw_hesitate', intentType: 'Debuff', applyStatus: { status: StatusEffects.WEAK, target: 'player', amount: 1, duration: 1 }, weight: 3, description: "Apply 1 Weak" },
        { id: 'dw_falter', intentType: 'Attack', damage: 6, weight: 4, description: "Attack for 6 Bruise" },
        { id: 'dw_overthink', intentType: 'Defend', block: 5, weight: 2, description: "Gain 5 Guard" },
        { id: 'dw_dilemma_certainty', intentType: 'Dilemma', weight: 1, initialCooldown: true, dilemma: {
            id: 'certainty_vs_openness', text: "Cling to certainty or embrace the unknown?",
            choices: [
                { text: "Certainty (Take 5 Bruise)", effects: { dealBruise: { amount: 5, target: 'player', duration: 1 } } },
                { text: "Openness (Add 1 Static to discard)", effects: { addCardToDiscard: { cardId: 'status_static', count: 1 } } }
            ]}
        }
    ]
}));

// Shame Shade (Relational Lean: Weak Relational, Resist Cognitive)
addEnemyDefinition(new EnemyDefinition({
    id: 'shame_shade',
    name: 'Shame Shade',
    archetype: EnemyArchetype.SHAME,
    maxHp: 50,
    artId: 'shame_shade',
    moveSet: [
        { id: 'ss_cower', intentType: 'Defend', block: 8, weight: 3, description: "Gain 8 Guard" },
        { id: 'ss_lash_out', intentType: 'Attack', damage: 8, weight: 2, description: "Attack for 8 Bruise" },
        { id: 'ss_burden', intentType: 'Debuff', applyStatus: { status: StatusEffects.VULNERABLE, target: 'player', amount: 1, duration: 2 }, weight: 2, description: "Apply 1 Vulnerable (2 turns)" },
        { id: 'ss_isolate', intentType: 'Special', weight: 1, description: "Add 2 Static cards to player draw pile", effects: { addCardToDrawPile: { cardId: 'status_static', count: 2 } } }
    ]
}));

// Fear Construct (Sensory Lean: Weak Sensory, Resist Interaction)
addEnemyDefinition(new EnemyDefinition({
    id: 'fear_construct',
    name: 'Fear Construct',
    archetype: EnemyArchetype.FEAR,
    maxHp: 60,
    artId: 'fear_construct',
    moveSet: [
        { id: 'fc_brace', intentType: 'Defend', block: 10, weight: 2, description: "Gain 10 Guard" },
        { id: 'fc_panic_attack', intentType: 'Attack', damage: 12, weight: 3, description: "Attack for 12 Bruise" },
        { id: 'fc_freeze', intentType: 'Debuff', applyStatus: { status: StatusEffects.FREEZE, target: 'player', element: Elements.SENSORY, amount: 1, duration: 1 }, weight: 2, description: "Freeze Sensory cards next turn" },
        // Dilemma: Fight or Flight?
        { id: 'fc_dilemma_response', intentType: 'Dilemma', weight: 1, initialCooldown: true, dilemma: {
            id: 'fight_or_flight', text: "Confront the fear or retreat?",
            choices: [
                { text: "Fight (Enemy gains 3 Strength)", effects: { applyStatusToEnemy: { status: 'Strength', amount: 3, duration: 99 } } }, // Strength increases damage output
                { text: "Flight (Lose 2 Insight next turn)", effects: { applyStatusToPlayer: { status: 'InsightDown', amount: 2, duration: 1 } } }
            ]}
        }
    ],
    // Example special mechanic: Gains strength when damaged?
    specialMechanics: { onHpLoss: { action: 'applyStatusToSelf', status: 'Strength', amount: 1, triggerAmount: 1 } } // Gains 1 Strength each time it loses HP
}));

// Despair Sludge (Psychological Lean: Weak Psychological, Resist Relational)
addEnemyDefinition(new EnemyDefinition({
    id: 'despair_sludge',
    name: 'Despair Sludge',
    archetype: EnemyArchetype.DESPAIR,
    maxHp: 70, // Tankier
    artId: 'despair_sludge',
    moveSet: [
        { id: 'ds_numb', intentType: 'Defend', block: 6, weight: 2, description: "Gain 6 Guard" },
        { id: 'ds_crushing_weight', intentType: 'Attack', damage: 7, weight: 2, description: "Attack for 7 Bruise" },
        { id: 'ds_drain_hope', intentType: 'Debuff', weight: 3, description: "Player loses 1 Insight next turn", applyStatus: { status: 'InsightDown', target: 'player', amount: 1, duration: 1 } },
        { id: 'ds_entangle', intentType: 'Special', weight: 1, description: "Add 1 'Heavy Heart' Curse to discard", effects: { addCardToDiscard: { cardId: 'curse_heavy_heart', count: 1 } } },
    ]
}));
// Need to define the 'Heavy Heart' curse
addCardDefinition(new CardDefinition({
    id: 'curse_heavy_heart',
    name: 'Heavy Heart',
    type: CardType.CURSE,
    element: Elements.NEUTRAL,
    cost: null, // Unplayable
    rarity: CardRarity.SPECIAL,
    description: "Unplayable. Reduces Insight gain by 1 while in hand.", // Needs specific handling in player turn logic
    keywords: [],
    effects: { passiveInHand: { effectId: 'reduceInsightGain', value: 1 } },
    artId: 'curse_heavy_heart'
}));


// Anger Ember (Interaction Lean: Weak Cognitive, Resist Sensory)
addEnemyDefinition(new EnemyDefinition({
    id: 'anger_ember',
    name: 'Anger Ember',
    archetype: EnemyArchetype.ANGER,
    maxHp: 40, // Lower HP, more aggressive
    artId: 'anger_ember',
    moveSet: [
        { id: 'ae_flicker', intentType: 'Attack', damage: 5, weight: 3, description: "Attack for 5 Bruise" },
        { id: 'ae_flare_up', intentType: 'Attack', damage: 8, weight: 2, description: "Attack for 8 Bruise. Gains +2 Damage if HP < 50%.", effectsModifiers: { condition: 'hp_below_50', damageBonus: 2 } },
        { id: 'ae_intimidate', intentType: 'Debuff', applyStatus: { status: StatusEffects.WEAK, target: 'player', amount: 1, duration: 1 }, weight: 2, description: "Apply 1 Weak" },
        { id: 'ae_stoke', intentType: 'Buff', applyStatus: { status: 'Strength', target: 'self', amount: 2, duration: 99 }, weight: 1, description: "Gain 2 Strength", maxHpThreshold: 0.6 }, // Only uses below 60% HP
    ]
}));

// --- Elite Enemy Example ---
// Anxiety Cluster (Doubt + Fear Mix)
addEnemyDefinition(new EnemyDefinition({
    id: 'anxiety_cluster',
    name: 'Anxiety Cluster',
    archetype: EnemyArchetype.DOUBT, // Primary archetype for weakness/resistance? Or pick one? Let's say Doubt.
    maxHp: 90,
    isElite: true,
    artId: 'anxiety_cluster', // Needs unique art ID
    moveSet: [
        // Mix of Doubt and Fear moves, slightly stronger
        { id: 'ac_hesitate_strong', intentType: 'Debuff', applyStatus: { status: StatusEffects.WEAK, target: 'player', amount: 1, duration: 2 }, weight: 3, description: "Apply 1 Weak (2 turns)" },
        { id: 'ac_panic_strike', intentType: 'Attack', damage: 10, weight: 4, description: "Attack for 10 Bruise" },
        { id: 'ac_overthink_brace', intentType: 'Defend', block: 12, weight: 2, description: "Gain 12 Guard" },
        { id: 'ac_freeze_mind', intentType: 'Debuff', applyStatus: { status: StatusEffects.FREEZE, target: 'player', element: Elements.COGNITIVE, amount: 1, duration: 1 }, weight: 2, description: "Freeze Cognitive cards next turn" },
        // Potential unique move
        { id: 'ac_catastrophize', intentType: 'AttackDebuff', damage: 6, applyStatus: { status: StatusEffects.VULNERABLE, target: 'player', amount: 1, duration: 1 }, weight: 2, description: "Attack for 6 Bruise and Apply 1 Vulnerable" }
    ],
    // Inherit weakness/resistance from primary archetype (Doubt)
    // Or potentially give it multiple? For now, stick to primary.
    // Weak: Interaction, Resist: Psychological
}));


// --- Boss Enemy Example (Layer 1) ---
// Guardian of Boundaries
addEnemyDefinition(new EnemyDefinition({
    id: 'guardian_boundaries',
    name: 'Guardian of Boundaries',
    archetype: EnemyArchetype.ANGER, // Example: Base archetype - Anger (Weak Cognitive, Resist Sensory)
    maxHp: 200,
    isBoss: true,
    artId: 'guardian_boundaries',
    specialMechanics: { // Example: Changes behavior based on HP thresholds
        phaseChangeThresholds: [0.5], // Changes behavior at 50% HP
        onPhaseChange: [ // Action to take when threshold crossed
            { phase: 2, action: 'changeMoveSet', newMoveSetId: 'guardian_boundaries_phase2' }
        ]
    },
    moveSet: [ // Phase 1 move set
        { id: 'gb1_push_back', intentType: 'Attack', damage: 12, weight: 3, description: "Attack for 12 Bruise" },
        { id: 'gb1_reinforce', intentType: 'Defend', block: 15, weight: 2, description: "Gain 15 Guard" },
        { id: 'gb1_set_limit', intentType: 'Debuff', weight: 2, description: "Player cannot play more than 2 cards next turn", applyStatus: { status: 'CardPlayLimit', target: 'player', amount: 2, duration: 1 } },
        { id: 'gb1_warning', intentType: 'Buff', applyStatus: { status: 'Strength', target: 'self', amount: 3, duration: 99 }, weight: 1, description: "Gain 3 Strength" }
    ],
    // Define Phase 2 move set (could be stored elsewhere, but defining inline for simplicity)
    // This assumes the CombatManager can handle swapping move sets based on the specialMechanics trigger.
    moveSetDefinitions: {
        'guardian_boundaries_phase2': [
            { id: 'gb2_enforce', intentType: 'Attack', damage: 16, weight: 3, description: "Attack for 16 Bruise" },
            { id: 'gb2_wall_up', intentType: 'Defend', block: 20, weight: 2, description: "Gain 20 Guard" },
            { id: 'gb2_expel', intentType: 'AttackDebuff', damage: 8, applyStatus: { status: StatusEffects.WEAK, target: 'player', amount: 2, duration: 1 }, weight: 2, description: "Attack for 8 Bruise and apply 2 Weak" },
            { id: 'gb2_overwhelm', intentType: 'Special', weight: 1, description: "Add 3 Static cards to player discard pile", effects: { addCardToDiscard: { cardId: 'status_static', count: 3 } } }
        ]
    }
}));


function initializeEnemyPool() {
    // Could add logic here to only include certain enemies based on meta-progression later
    console.log(`Initialized Enemy Pool with ${Object.keys(BASE_ENEMY_POOL).length} definitions.`);
}

// Initialize pool
initializeEnemyPool();

// Example Usage:
// const layer1Enemies = getEnemyIdsByCriteria({ layer: 1, isElite: false, isBoss: false });
// console.log("Layer 1 Enemies:", layer1Enemies);
// const layer1Elite = getEnemyIdsByCriteria({ layer: 1, isElite: true });
// console.log("Layer 1 Elites:", layer1Elite);
// const fearConstructDef = getEnemyDefinition('fear_construct');
// console.log("Fear Construct Weakness:", fearConstructDef?.weakness);
// console.log("Fear Construct Move Set:", fearConstructDef?.moveSet);
