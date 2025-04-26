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
     * @param {string | null} [artId=null] - Identifier for enemy art.
     * @param {object | null} [specialMechanics=null] - Any unique passive abilities or triggers.
     *      Examples:
     *      { onHpLoss: { action: 'applyStatusToSelf', status: 'Strength', amount: 1 } }
     *      { phaseChangeThresholds: [0.5], onPhaseChange: [{ phase: 2, action: 'changeMoveSet', newMoveSetId: '...' }] }
     * @param {object | null} [moveSetDefinitions=null] - Stores alternate move sets for multi-phase bosses, keyed by ID.
     * @param {number} [baseShardReward=0] - Base Insight Shards rewarded on defeat.
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
        specialMechanics = null,
        moveSetDefinitions = null, // Added for bosses
        baseShardReward = 0        // Added for rewards
    }) {
        this.id = id;
        this.name = name;
        this.archetype = archetype; // Link to core archetype behaviour/theming
        this.maxHp = maxHp;
        this.weakness = getElementWeakness(archetype); // Use utility function
        this.resistance = getElementResistance(archetype); // Use utility function
        this.moveSet = moveSet; // List of potential actions for the current phase
        this.isElite = isElite;
        this.isBoss = isBoss;
        this.artId = artId || id; // Default artId to enemy ID
        this.specialMechanics = specialMechanics;
        this.moveSetDefinitions = moveSetDefinitions; // Store other phases' movesets
        this.baseShardReward = baseShardReward; // Base reward

        // Basic validation
        if (!this.weakness || !this.resistance) {
            // Allow null if archetype isn't standard 5?
            if(archetype && Object.values(EnemyArchetype).includes(archetype)) {
                 console.warn(`Enemy '${this.id}' created without automatically derived Weakness/Resistance for standard archetype '${this.archetype}'. Check utils.js.`);
            }
        }
        if (moveSet.length === 0) {
             console.warn(`Enemy '${this.id}' defined with an empty initial move set.`);
        }
    }
}

/**
 * Represents a potential action (Intent) an enemy can take.
 * @typedef {object} EnemyMove
 * @property {string} id - Unique ID for the move (e.g., 'basic_attack').
 * @property {string} intentType - Type of intent ('Attack', 'Defend', 'Debuff', 'Buff', 'Dilemma', 'Special', 'AttackDebuff'). Helps determine icon.
 * @property {number} [damage] - Amount of base Bruise damage (if applicable).
 * @property {number} [block] - Amount of Guard gained (if applicable).
 * @property {object} [applyStatus] - Status to apply { status: string, target: string ('player'|'self'), amount: number, duration?: number }.
 * @property {object} [dilemma] - Dilemma choice definition (if intentType is 'Dilemma'). { id: string, text: string, choices: object[] }
 * @property {object} [effects] - Other special effects (e.g., { addCardToDiscard: { cardId: '...', count: 1 } }).
 * @property {object} [effectsModifiers] - Conditional modifiers to base effects (e.g., { condition: 'hp_below_50', damageBonus: 2 }). Handled in Enemy.calculateIntentDamage etc.
 * @property {string} [description] - Optional text description for complex moves or intent display.
 * @property {number} [weight=1] - Relative probability of choosing this move (higher is more likely). Can be adjusted by combat logic.
 * @property {number} [minHpThreshold] - Optional: Move only usable if enemy HP is below this percentage (e.g., 50 for 50%).
 * @property {number} [maxHpThreshold] - Optional: Move only usable if enemy HP is above this percentage.
 * @property {number} [cooldown] - Optional: Turns before this move can be used again after being performed.
 * @property {boolean} [initialCooldown] - Optional: Cannot be used on turn 1 (Needs turn counter access).
 */

// --- Master Enemy Pool ---
const BASE_ENEMY_POOL = {};

/**
 * Adds an enemy definition to the pool. Checks for duplicates.
 * @param {EnemyDefinition} enemyDef - The EnemyDefinition object.
 */
function addEnemyDefinition(enemyDef) {
     if (!enemyDef || !enemyDef.id) {
        console.error("Attempted to add invalid enemy definition:", enemyDef);
        return;
    }
    if (BASE_ENEMY_POOL[enemyDef.id]) {
        // Avoid warning spam
        // console.warn(`Enemy definition with ID '${enemyDef.id}' already exists. Overwriting.`);
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
 * @param {string[]} [options.excludeIds=[]] - List of IDs to exclude.
 * @returns {string[]} List of matching enemy IDs.
 */
function getEnemyIdsByCriteria({ isElite, isBoss, layer, excludeIds = [] } = {}) {
    return Object.values(BASE_ENEMY_POOL)
        .filter(enemy => {
            if (excludeIds.includes(enemy.id)) return false;
            if (isElite !== undefined && enemy.isElite !== isElite) return false;
            if (isBoss !== undefined && enemy.isBoss !== isBoss) return false;

            // Simple layer filtering logic (adjust as needed)
            if (layer !== undefined) {
                 if (layer === 1 && (enemy.isElite || enemy.isBoss || enemy.maxHp > 70)) return false; // Only weaker enemies/elites on L1
                 if (layer === 2 && (enemy.isBoss || enemy.maxHp < 40 || enemy.maxHp > 120)) return false; // Mid-range on L2
                 if (layer === 3 && !enemy.isElite && !enemy.isBoss) return false; // Only Elites/Boss on L3? Needs refinement.
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
    baseShardReward: 10,
    artId: 'doubt_wraith',
    moveSet: [
        { id: 'dw_hesitate', intentType: 'Debuff', applyStatus: { status: StatusEffects.WEAK, target: 'player', amount: 1, duration: 1 }, weight: 3, description: "Apply 1 Weak" },
        { id: 'dw_falter', intentType: 'Attack', damage: 6, weight: 4, description: "Attack for 6 Bruise" },
        { id: 'dw_overthink', intentType: 'Defend', block: 5, weight: 2, description: "Gain 5 Guard" },
        { id: 'dw_dilemma_certainty', intentType: 'Dilemma', weight: 1, cooldown: 3, dilemma: {
            id: 'certainty_vs_openness', text: "Cling to certainty or embrace the unknown?",
            choices: [
                { text: "Certainty (Take 5 Bruise)", effects: { dealBruise: { amount: 5, target: 'player', duration: 1 } } }, // Assumes direct damage for dilemma outcome
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
    baseShardReward: 12,
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
    baseShardReward: 15,
    artId: 'fear_construct',
    moveSet: [
        { id: 'fc_brace', intentType: 'Defend', block: 10, weight: 2, description: "Gain 10 Guard" },
        { id: 'fc_panic_attack', intentType: 'Attack', damage: 12, weight: 3, description: "Attack for 12 Bruise" },
        { id: 'fc_freeze', intentType: 'Debuff', applyStatus: { status: StatusEffects.FREEZE, target: 'player', element: Elements.SENSORY, amount: 1, duration: 1 }, weight: 2, description: "Freeze Sensory cards next turn" },
        { id: 'fc_dilemma_response', intentType: 'Dilemma', weight: 1, cooldown: 4, dilemma: {
            id: 'fight_or_flight', text: "Confront the fear or retreat?",
            choices: [
                 // Effect needs specific handling in CombatManager/Enemy based on choice text or effect structure
                { text: "Fight (Enemy gains 3 Strength)", effects: { applyStatusToEnemy: { enemyId: 'self', status: 'Strength', amount: 3, duration: 99 } } }, // Need way to target specific enemy from dilemma
                { text: "Flight (Lose 2 Insight next turn)", effects: { applyStatusToPlayer: { status: 'InsightDown', amount: 2, duration: 1 } } }
            ]}
        }
    ],
    specialMechanics: { onHpLoss: { action: 'applyStatusToSelf', status: 'Strength', amount: 1 } } // Gains 1 Strength each time it loses HP
}));

// Despair Sludge (Psychological Lean: Weak Psychological, Resist Relational)
addEnemyDefinition(new EnemyDefinition({
    id: 'despair_sludge',
    name: 'Despair Sludge',
    archetype: EnemyArchetype.DESPAIR,
    maxHp: 70, // Tankier
    baseShardReward: 18,
    artId: 'despair_sludge',
    moveSet: [
        { id: 'ds_numb', intentType: 'Defend', block: 6, weight: 2, description: "Gain 6 Guard" },
        { id: 'ds_crushing_weight', intentType: 'Attack', damage: 7, weight: 2, description: "Attack for 7 Bruise" },
        { id: 'ds_drain_hope', intentType: 'Debuff', weight: 3, description: "Player loses 1 Insight next turn", applyStatus: { status: 'InsightDown', target: 'player', amount: 1, duration: 1 } },
        { id: 'ds_entangle', intentType: 'Special', weight: 1, description: "Add 1 Heavy Heart Curse to discard", effects: { addCardToDiscard: { cardId: 'curse_heavy_heart', count: 1 } } },
    ]
}));

// Anger Ember (Interaction Lean: Weak Cognitive, Resist Sensory)
addEnemyDefinition(new EnemyDefinition({
    id: 'anger_ember',
    name: 'Anger Ember',
    archetype: EnemyArchetype.ANGER,
    maxHp: 40, // Lower HP, more aggressive
    baseShardReward: 10,
    artId: 'anger_ember',
    moveSet: [
        { id: 'ae_flicker', intentType: 'Attack', damage: 5, weight: 3, description: "Attack for 5 Bruise" },
        { id: 'ae_flare_up', intentType: 'Attack', damage: 8, weight: 2, description: "Attack for 8 Bruise. Gains +2 Damage if HP < 50%.", effectsModifiers: { condition: 'hp_below_50', damageBonus: 2 } },
        { id: 'ae_intimidate', intentType: 'Debuff', applyStatus: { status: StatusEffects.WEAK, target: 'player', amount: 1, duration: 1 }, weight: 2, description: "Apply 1 Weak" },
        { id: 'ae_stoke', intentType: 'Buff', applyStatus: { status: 'Strength', target: 'self', amount: 2, duration: 99 }, weight: 1, description: "Gain 2 Strength", maxHpThreshold: 60 }, // Only uses above 60% HP
    ]
}));

// --- Elite Enemy Example ---
// Anxiety Cluster (Doubt + Fear Mix)
addEnemyDefinition(new EnemyDefinition({
    id: 'anxiety_cluster',
    name: 'Anxiety Cluster',
    archetype: EnemyArchetype.DOUBT, // Primary archetype for weakness/resistance
    maxHp: 90,
    isElite: true,
    baseShardReward: 50,
    artId: 'anxiety_cluster',
    moveSet: [
        { id: 'ac_hesitate_strong', intentType: 'Debuff', applyStatus: { status: StatusEffects.WEAK, target: 'player', amount: 1, duration: 2 }, weight: 3, description: "Apply 1 Weak (2 turns)" },
        { id: 'ac_panic_strike', intentType: 'Attack', damage: 10, weight: 4, description: "Attack for 10 Bruise" },
        { id: 'ac_overthink_brace', intentType: 'Defend', block: 12, weight: 2, description: "Gain 12 Guard" },
        { id: 'ac_freeze_mind', intentType: 'Debuff', applyStatus: { status: StatusEffects.FREEZE, target: 'player', element: Elements.COGNITIVE, amount: 1, duration: 1 }, weight: 2, description: "Freeze Cognitive cards next turn" },
        { id: 'ac_catastrophize', intentType: 'AttackDebuff', damage: 6, applyStatus: { status: StatusEffects.VULNERABLE, target: 'player', amount: 1, duration: 1 }, weight: 2, description: "Attack for 6 Bruise and Apply 1 Vulnerable" }
    ],
    // Weak: Interaction, Resist: Psychological (from Doubt)
}));


// --- Boss Enemy Example (Layer 1) ---
// Guardian of Boundaries
addEnemyDefinition(new EnemyDefinition({
    id: 'guardian_boundaries',
    name: 'Guardian of Boundaries',
    archetype: EnemyArchetype.ANGER, // Base archetype - Anger (Weak Cognitive, Resist Sensory)
    maxHp: 200,
    isBoss: true,
    baseShardReward: 100,
    artId: 'guardian_boundaries',
    specialMechanics: {
        phaseChangeThresholds: [50], // Changes behavior at 50% HP
        onPhaseChange: [
            { phase: 2, action: 'changeMoveSet', newMoveSetId: 'guardian_boundaries_phase2' },
            { phase: 2, action: 'applyStatusToSelf', status: 'Strength', amount: 5 } // Example: Gain strength on phase change
        ]
    },
    // Initial move set (Phase 1)
    moveSet: [
        { id: 'gb1_push_back', intentType: 'Attack', damage: 12, weight: 3, description: "Attack for 12 Bruise" },
        { id: 'gb1_reinforce', intentType: 'Defend', block: 15, weight: 2, description: "Gain 15 Guard" },
        { id: 'gb1_set_limit', intentType: 'Debuff', weight: 2, description: "Player cannot play more than 2 cards next turn", applyStatus: { status: 'CardPlayLimit', target: 'player', amount: 2, duration: 1 } },
        { id: 'gb1_warning', intentType: 'Buff', applyStatus: { status: 'Strength', target: 'self', amount: 3, duration: 99 }, weight: 1, description: "Gain 3 Strength" }
    ],
    // Store other phase move sets here
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

// Initialize pool when script loads
initializeEnemyPool();

// Example Usage:
// const layer1Enemies = getEnemyIdsByCriteria({ layer: 1, isElite: false, isBoss: false });
// console.log("Layer 1 Enemies:", layer1Enemies);
// const layer1Elite = getEnemyIdsByCriteria({ layer: 1, isElite: true });
// console.log("Layer 1 Elites:", layer1Elite);
// const fearConstructDef = getEnemyDefinition('fear_construct');
// console.log("Fear Construct Weakness:", fearConstructDef?.weakness);
// console.log("Fear Construct Move Set:", fearConstructDef?.moveSet);
