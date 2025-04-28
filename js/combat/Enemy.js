// js/combat/Enemy.js

// Import status definitions if needed for lookups (optional, as mechanics are internal)
import { getStatusEffectDefinition } from './StatusEffects.js'; // Use if needed for checks/logic

/**
 * Enemy Templates - Defines the base stats, behaviors, and abilities of enemies.
 * Keywords: Help categorize or trigger effects (e.g., Mental, Physical, Fast, Support, Summoner, Elite, Boss)
 * aiBehavior: random_intent, sequential_intent, random_weighted, reactive_pattern, phase_shift, boss_pattern_X
 */
export const ENEMY_TEMPLATES = {

    // ===================================
    // ========= FLOOR 1 ENEMIES =========
    // ===================================

    'doubt_whisper': {
        name: "Whispering Doubt", maxHp: 25,
        sprite: 'assets/images/enemies/doubt_whisper.png', // Placeholder path
        intentions: [ // Cycle: Attack -> Debuff -> Attack -> Debuff
            { type: 'attack', baseValue: 6, description: "Niggle" },
            { type: 'debuff', status: 'Weak', duration: 1, target: 'player', description: "Sow Weakness (-Weak)" },
            { type: 'attack', baseValue: 7, description: "Questioning Jab" },
            { type: 'debuff', status: 'Frail', duration: 1, target: 'player', description: "Undermine Confidence (-Frail)" },
        ],
        resistances: { Psychological: 0.75 },
        weaknesses: { Cognitive: 1.25 },
        aiBehavior: 'sequential_intent', // Simple cycle
        keywords: ['Mental', 'Debuff', 'Common'],
    },
    'anxious_tremor': {
        name: "Anxious Tremor", maxHp: 35,
        sprite: 'assets/images/enemies/anxious_tremor.png', // Placeholder path
        intentions: [ // Prefers blocking, occasional multi-hit or debuff
            { type: 'block', baseValue: 7, weight: 4, description: "Defensive Twitch" }, // High weight
            { type: 'attack', baseValue: 6, weight: 2, description: "Nervous Strike" },
            { type: 'multi_attack', count: 3, baseValue: 2, weight: 2, description: "Flurry of Worry (3x2)"},
            { type: 'debuff', status: 'Vulnerable', duration: 1, target: 'player', weight: 1, description: "Expose Fear (-Vuln)" },
        ],
        resistances: { Sensory: 0.8 },
        weaknesses: { Psychological: 1.3 },
        aiBehavior: 'random_weighted', // Weighted random
        keywords: ['Defensive', 'Anxiety', 'Debuff', 'Common'],
    },
     'fleeting_impulse': { // Replaces Fleeting Desire with more active role
        name: "Fleeting Impulse", maxHp: 22, // Lower HP, more aggressive
        sprite: 'assets/images/enemies/fleeting_impulse.png', // Placeholder path
        intentions: [ // Attacks frequently, sometimes buffs self
            { type: 'attack', baseValue: 7, weight: 3, description: "Sudden Urge" },
            { type: 'attack', baseValue: 8, weight: 3, description: "Reckless Lunge" },
            { type: 'buff', status: 'Strength', duration: 99, amount: 1, weight: 1, description: "Momentary Intensity (+1 Str)" }, // Gains perm Str
        ],
        resistances: {},
        weaknesses: { Cognitive: 1.2, Interaction: 1.1 }, // Vulnerable to focus/control
        aiBehavior: 'random_weighted',
        keywords: ['Aggressive', 'Fast', 'Buff', 'Common'],
    },

    // ===================================
    // ========= FLOOR 1 ELITE =========
    // ===================================
    'rigid_perfectionism': {
        name: "Rigid Perfectionism", maxHp: 75,
        sprite: 'assets/images/enemies/perfectionism.png', // Placeholder path
        intentions: [ // Base cycle: Block -> Attack -> Attack/Block. Reacts to player state.
            { type: 'block', baseValue: 14, weight: 1, description: "Reinforce Standards" }, // Strong initial block
            { type: 'attack', baseValue: 11, weight: 1, description: "Critical Strike" },
            { type: 'attack_block', attackValue: 8, blockValue: 8, weight: 1, description: "Measured Assault (8 Atk, 8 Blk)" },
            // Reactive Intention 1: Punishes player taking damage (NEEDS FLAG SETTING IN PLAYER/COMBATMANAGER)
            { type: 'power_up', status: 'Strength', duration: 99, amount: 1, condition: 'playerTookDamageLastTurn', description: "Punish Imperfection (+1 Str)", weight: 10 }, // High priority if condition met
            // Reactive Intention 2: Punishes player blocking heavily
            { type: 'debuff', status: 'Frail', duration: 2, target: 'player', condition: 'playerHasHighBlock', description: "Critique Defense (-Frail 2t)", weight: 10 } // High priority if condition met
        ],
         resistances: { Interaction: 0.75, Cognitive: 0.8 }, // Resists social/mental manipulation
         weaknesses: { Psychological: 1.25 }, // Vulnerable to emotional approaches?
         aiBehavior: 'reactive_pattern', // Prioritizes conditional moves, otherwise cycles basics
         keywords: ['Elite', 'Defensive', 'Reactive', 'Punisher', 'Armor'], // Armor implies high block/defense
    },

    // ===================================
    // ========= FLOOR 2 ENEMIES =========
    // ===================================
    'inner_critic': {
        name: "Inner Critic", maxHp: 48,
        sprite: 'assets/images/enemies/inner_critic.png', // Placeholder path
        intentions: [ // More debuff focused
             { type: 'attack', baseValue: 8, weight: 2, description: "Harsh Words" },
             { type: 'debuff', status: 'Vulnerable', duration: 2, target: 'player', weight: 3, description: "Expose Flaw (-Vuln 2t)" }, // Longer duration
             { type: 'debuff', status: 'Weak', duration: 2, target: 'player', weight: 3, description: "Belittle (-Weak 2t)" },
             { type: 'block', baseValue: 10, weight: 1, description: "Defensive Rationalization" },
        ],
        resistances: { Psychological: 0.6 },
        weaknesses: { Sensory: 1.25, Interaction: 1.25 },
        aiBehavior: 'random_weighted', // Prefers debuffs
        keywords: ['Debuff', 'Mental', 'Defense', 'Common'],
    },
    'resentment_globule': {
        name: "Resentment Globule", maxHp: 60,
        sprite: 'assets/images/enemies/resentment_globule.png', // Placeholder path
        intentions: [ // Cycle: Block -> Poison -> Attack -> Harden -> Poison...
            { type: 'block', baseValue: 12, description: "Simmering Grudge" },
            { type: 'special', id: 'fester', poisonAmount: 3, description: "Fester (Apply 3 Poison)"},
            { type: 'attack', baseValue: 9, description: "Bitter Lash" },
            { type: 'buff', status: 'Strength', amount: 1, duration: 99, description: "Harden Resentment (+1 Str)"}, // Gets stronger over time
        ],
        resistances: { Psychological: 0.8, Sensory: 0.8 },
        weaknesses: { Interaction: 1.25 },
        aiBehavior: 'sequential_intent',
        specialAbilities: { fester: (self, player, gameState) => { if (player) { player.applyStatus('Poison', 99, self.currentIntent?.poisonAmount || 3, self.enemyType); } } },
        keywords: ['Poison', 'DamageOverTime', 'Defensive', 'Scaling', 'Common'],
    },
    'social_mask': { // NEW Floor 2 Enemy - Support/Debuff
        name: "Social Mask", maxHp: 40,
        sprite: 'assets/images/enemies/social_mask.png', // Placeholder path
        intentions: [ // Cycles buffs/debuffs, occasionally attacks
             { type: 'buff', status: 'Dexterity', duration: 99, amount: 2, target: 'ally_lowest_hp', description: "Reinforce Facade (+2 Dex Ally)" }, // Buff ally
             { type: 'debuff', status: 'Confusion', duration: 1, target: 'player', description: "Obfuscate (-Confuse)"},
             { type: 'block', baseValue: 8, target: 'self_and_allies', description: "Group Defense (8 Blk All)" }, // Group block
             { type: 'attack', baseValue: 7, description: "Passive Aggression" },
        ],
        resistances: { Interaction: 0.7 }, // Hard to interact with directly
        weaknesses: { Psychological: 1.3 }, // Vulnerable to seeing through the facade
        aiBehavior: 'support_cycle', // Prioritizes buff/debuff, attacks less often
        keywords: ['Support', 'Debuff', 'Buff', 'GroupTactics', 'Common'],
        // Needs AI logic to target allies if present
    },

    // ===================================
    // ========= FLOOR 2 ELITE =========
    // ===================================
     'compulsive_habit': {
         name: "Compulsive Habit", maxHp: 95,
         sprite: 'assets/images/enemies/compulsive_habit.png', // Placeholder path
         intentions: [ // Cycle: Multi-Attack -> Block -> Heavy Attack -> Power-Up
             { type: 'multi_attack', baseValue: 3, count: 3, description: "Rapid Fixation (3x3)" },
             { type: 'block', baseValue: 10, description: "Routine Defense" },
             { type: 'attack', baseValue: 10, description: "Recurring Urge" },
             { type: 'special', id: 'cycle_strength', amount: 1, description: "Strengthens Cycle (+Str)" } // Gains strength over time
         ],
         resistances: { Cognitive: 0.7 },
         weaknesses: { Interaction: 1.3, Psychological: 1.1 },
         aiBehavior: 'sequential_cycle_powerup',
         internalCounters: { cycleStrengthBonus: 0 }, // Tracks its strength gain
         specialAbilities: { cycle_strength: (self, player, gameState) => { self.internalCounters.cycleStrengthBonus = (self.internalCounters.cycleStrengthBonus || 0) + (self.currentIntent?.amount || 1); self.applyStatus('Strength', 99, self.internalCounters.cycleStrengthBonus, self.enemyType); console.log(`${self.name} strengthens its cycle! (+${self.internalCounters.cycleStrengthBonus} Str total)`); } },
         keywords: ['Elite', 'Scaling', 'Pattern', 'Relentless'],
     },
     'suppressed_memory': { // NEW Floor 2 Elite - Debuff/Control focused
        name: "Suppressed Memory", maxHp: 80,
        sprite: 'assets/images/enemies/suppressed_memory.png', // Placeholder path
        intentions: [ // Cycle: Add Status Card -> Attack + Weak -> Block + Frail -> Strong Debuff
            { type: 'special', id: 'add_dazed', description: "Cloud Thoughts (+Dazed)" }, // Adds Dazed to player discard
            { type: 'attack', baseValue: 9, status: 'Weak', statusDuration: 1, target: 'player', description: "Painful Flashback (9 Atk, -Weak)"},
            { type: 'block', baseValue: 12, status: 'Frail', statusDuration: 1, target: 'player', description: "Wall of Denial (12 Blk, -Frail)" },
            { type: 'debuff', status: 'Entangle', duration: 1, amount: 2, target: 'player', description: "Burdening Weight (+2 Cost)" }, // Strong debuff
        ],
        resistances: { Psychological: 0.7 },
        weaknesses: { Cognitive: 1.4 }, // Vulnerable to clear thought/focus
        aiBehavior: 'sequential_intent',
        specialAbilities: { add_dazed: (self, player, gameState) => { gameState?.addStatusCardToPlayerDeck(20002, 'discard'); } }, // 20002 = Dazed ID
        keywords: ['Elite', 'Debuff', 'Control', 'Mental', 'DeckPollution'],
    },

    // ===================================
    // ========= FLOOR 3 ENEMIES =========
    // ===================================
     'despair_echo': {
        name: "Despair Echo", maxHp: 75,
        sprite: 'assets/images/enemies/despair_echo.png', // Placeholder path
        intentions: [ // Weighted random, favors heavy hits and debuffs
            { type: 'attack', baseValue: 15, weight: 3, description: "Crushing Weight" }, // Hits hard
            { type: 'debuff', status: 'Weak', duration: 2, target: 'player', weight: 2, description: "Sap Strength (-Weak 2t)" },
            { type: 'debuff', status: 'Frail', duration: 2, target: 'player', weight: 2, description: "Induce Brittleness (-Frail 2t)" },
            { type: 'block', baseValue: 18, weight: 1, description: "Numbness" }, // High block occasionally
        ],
        resistances: { Psychological: 0.4, Sensory: 0.6 }, // Very resistant
        weaknesses: { Interaction: 1.5 }, // Needs direct confrontation?
        aiBehavior: 'random_weighted',
        keywords: ['Tanky', 'Debuff', 'HighDamage', 'Resistant', 'Common'],
    },
    'cognitive_distortion': { // NEW Floor 3 Enemy - Focuses on messing with player resources/hand
        name: "Cognitive Distortion", maxHp: 55, // Fragile but annoying
        sprite: 'assets/images/enemies/cognitive_distortion.png', // Placeholder path
        intentions: [
             { type: 'special', id: 'focus_burn', amount: 1, weight: 3, description: "Mental Static (-1 Focus)"}, // Burns focus
             { type: 'debuff', status: 'Confusion', duration: 1, target: 'player', weight: 2, description: "Scramble Thoughts (-Confuse)"},
             { type: 'attack', baseValue: 8, weight: 2, description: "Illogical Jab"},
             { type: 'special', id: 'add_static_card', weight: 1, description: "Inject Noise (+Static)" }, // Adds unplayable card
        ],
        resistances: { Cognitive: 0.8 },
        weaknesses: { Psychological: 1.2, Sensory: 1.2 }, // Vulnerable to emotional grounding/sensation
        aiBehavior: 'random_weighted', // Favors disruption
        specialAbilities: {
            focus_burn: (self, player, gameState) => { player?.spendFocus(self.currentIntent?.amount || 1); },
            add_static_card: (self, player, gameState) => { gameState?.addStatusCardToPlayerDeck(20001, 'discard'); } // 20001 = Static ID
        },
        keywords: ['Disruption', 'Mental', 'Debuff', 'DeckPollution', 'Common'],
    },
    'codependent_tendril': { // NEW Floor 3 Enemy - Buffs allies, debuffs player when hit
        name: "Codependent Tendril", maxHp: 60,
        sprite: 'assets/images/enemies/codependent_tendril.png', // Placeholder path
        intentions: [
             { type: 'buff', status: 'Strength', duration: 99, amount: 2, target: 'ally_lowest_hp', weight: 3, description: "Empower Vulnerable (+2 Str Ally)" }, // Buffs weakest ally
             { type: 'block', baseValue: 10, target: 'self_and_allies', weight: 2, description: "Mutual Defense (10 Blk All)" },
             { type: 'debuff', status: 'Weak', duration: 1, target: 'player', weight: 1, description: "Guilt Trip (-Weak)" },
             { type: 'attack', baseValue: 6, weight: 1, description: "Cling"},
        ],
        passives: [ // NEW: Passive abilities triggered by events
            { trigger: 'onDamaged', condition: 'hpAbove50', effect: { type: 'applyStatusToPlayer', status: 'Frail', duration: 1 } } // Becomes Frail when hit above 50% HP
        ],
        resistances: { Relational: 0.7 },
        weaknesses: { Interaction: 1.3 }, // Vulnerable to direct confrontation
        aiBehavior: 'support_passive', // Prioritizes buffs, has passive reactions
        keywords: ['Support', 'Buff', 'Debuff', 'GroupTactics', 'Passive', 'Common'],
        // Needs logic in Enemy.takeDamage to check passives
    },

    // ===================================
    // ========= FLOOR 3 ELITE =========
    // ===================================
    'fragmented_identity': {
         name: "Fragmented Identity", maxHp: 120,
         sprite: 'assets/images/enemies/fragment_1.png', // Placeholder
         intentions: [ { phase: 'Aggressive', type: 'multi_attack', count: 2, baseValue: 9, description: "Assertive Flurry (2x9)" }, { phase: 'Aggressive', type: 'attack', baseValue: 14, status: 'Vulnerable', statusDuration: 1, target: 'player', description: "Exposing Strike (14 Atk, -Vuln)" }, { phase: 'Aggressive', type: 'special', id: 'shift_phase', targetPhase: 'Defensive', description: "Shift Aspect (-> Defensive)" }, { phase: 'Defensive', type: 'block', baseValue: 20, description: "Yielding Guard" }, { phase: 'Defensive', type: 'debuff', status: 'Weak', duration: 2, target: 'player', description: "Defensive Murmur (-Weak 2t)" }, { phase: 'Defensive', type: 'heal', baseValue: 10, description: "Recuperate (Heal 10)" }, { phase: 'Defensive', type: 'special', id: 'shift_phase', targetPhase: 'Aggressive', description: "Shift Aspect (-> Aggressive)" }, ],
         resistances: { Interaction: 0.8 }, weaknesses: { Cognitive: 1.2 }, aiBehavior: 'phase_shift', currentPhase: 'Aggressive',
         specialAbilities: { shift_phase: (self, player, gameState) => { const targetPhase = self.currentIntent?.targetPhase || 'Aggressive'; self.currentPhase = targetPhase; console.log(`${self.name} shifts aspect to ${targetPhase}!`); self.currentIntent = null; self.determineNextIntent(player); /* Optional: Change sprite */ } },
         keywords: ['Elite', 'PhaseShift', 'Unpredictable', 'Heal'],
    },
    'manifested_fear': {
        name: "Manifested Fear", maxHp: 100,
        sprite: 'assets/images/enemies/manifested_fear.png', // Placeholder
        intentions: [ { type: 'attack', baseValue: 20, description: "Paralyzing Blow" }, { type: 'debuff', status: 'Frail', duration: 3, target: 'player', description: "Crippling Doubt (-Frail 3t)" }, { type: 'attack', baseValue: 10, status: 'Vulnerable', statusDuration: 2, target: 'player', description: "Nightmare Strike (10 Atk, -Vuln 2t)" }, { type: 'special', id: 'add_fear_card', description: "Instill Dread (+Heavy Heart)" }, ],
        resistances: { Psychological: 0.3 }, weaknesses: { Interaction: 1.5, Sensory: 1.2 }, aiBehavior: 'sequential_intent',
        specialAbilities: { add_fear_card: (self, player, gameState) => { gameState?.addStatusCardToPlayerDeck(20003, 'discard'); } }, // 20003 = Heavy Heart ID
        keywords: ['Elite', 'HighDamage', 'Debuff', 'Fear', 'Curse', 'Resistant'],
    },


    // ===================================
    // ========= BOSSES =========
    // ===================================

    // --- Floor 1 Boss ---
    'echo_of_insecurity': {
        name: "Echo of Insecurity", maxHp: 140,
        sprite: 'assets/images/enemies/boss_insecurity.png', // Placeholder
        intentions: [ { pattern: 0, type: 'debuff', status: 'Weak', duration: 2, target: 'player', description: "Whispers of Doubt (-Weak 2t)" }, { pattern: 1, type: 'multi_attack', count: 3, baseValue: 5, description: "Flurry of Self-Criticism (3x5)" }, { pattern: 2, type: 'block', baseValue: 15, description: "Defensive Posturing" }, { pattern: 3, type: 'attack', baseValue: 16, description: "Crippling Comparison" }, { pattern: -1, condition: 'playerHealedLastTurn', type: 'buff', status: 'Strength', amount: 1, duration: 99, description: "Feeding on Weakness (+1 Str)", weight: 10 } ],
        resistances: { Psychological: 0.7 }, weaknesses: { Interaction: 1.3 }, aiBehavior: 'boss_pattern_reactive', internalCounters: { patternIndex: 0 }, keywords: ['Boss', 'Floor1', 'Debuff', 'Mental', 'Reactive'],
    },

     // --- Floor 2 Boss ---
     'gatekeeper_of_shame': {
        name: "Gatekeeper of Shame", maxHp: 200,
        sprite: 'assets/images/enemies/boss_shame.png', // Placeholder
        minions: [ { id: 'shame_fragment', count: 2, initial: true } ], // Starts with minions
        intentions: [ { pattern: 0, type: 'attack', baseValue: 10, status: 'Frail', duration: 1, target: 'player', description: "Judgmental Glare (10 Atk, -Frail)"}, { pattern: 1, type: 'special', id: 'summon_fragment', description: "Summon Shame Fragment" }, { pattern: 2, type: 'block', baseValue: 10, target: 'self_and_allies', description: "Wall of Secrets (10 Blk All)" }, { pattern: 3, type: 'special', id: 'empower_fragments', description: "Empower Fragments (+Str Allies)" }, { pattern: 4, type: 'multi_attack', count: 2, baseValue: 8, description: "Projected Criticism (2x8)" }, ],
        resistances: { Psychological: 0.6, Cognitive: 0.8 }, weaknesses: { Sensory: 1.4 }, aiBehavior: 'boss_summoner_pattern', internalCounters: { patternIndex: 0, fragmentsSummoned: 0 },
        specialAbilities: { summon_fragment: (self, player, gameState) => { console.warn("Summon Fragment ability not implemented!"); /* Needs CombatManager method */ }, empower_fragments: (self, player, gameState) => { console.warn("Empower Fragments ability not implemented!"); /* Needs CombatManager/Enemy method */ } },
        keywords: ['Boss', 'Floor2', 'Summoner', 'Debuff', 'GroupTactics'],
     },
     'shame_fragment': { // Minion for Gatekeeper boss
        name: "Shame Fragment", maxHp: 20,
        sprite: 'assets/images/enemies/shame_fragment.png', // Placeholder
        intentions: [ { type: 'attack', baseValue: 5, weight: 3, description: "Pointed Remark" }, { type: 'debuff', status: 'Weak', duration: 1, target: 'player', weight: 1, description: "Lingering Discomfort (-Weak)" }, ],
        resistances: {}, weaknesses: {}, aiBehavior: 'random_weighted', keywords: ['Minion', 'Debuff'],
     },

     // --- Floor 3 Boss ---
     'persona_core_conflict': {
        name: "Persona Core Conflict", maxHp: 280,
        sprite: 'assets/images/enemies/boss_core.png', // Placeholder
        intentions: [ { phase: 1, type: 'block', baseValue: 25, description: "Inner Wall" }, { phase: 1, type: 'special', id: 'prepare_onslaught', description: "Gathering Storm (+Artifact)" }, { phase: 1, type: 'debuff', status: 'Entangle', amount: 1, duration: 2, target: 'player', description: "Web of Thoughts (+1 Cost 2t)" }, { phase: 2, type: 'multi_attack', count: 3, baseValue: 7, description: "Fragmented Assault (3x7)" }, { phase: 2, type: 'attack', baseValue: 12, status: 'Vulnerable', duration: 2, target: 'player', description: "Raw Exposure (12 Atk, -Vuln 2t)" }, { phase: 2, type: 'special', id: 'consume_buffs', description: "Consume Persona (Steal Buffs?)" }, { phase: 3, type: 'attack', baseValue: 25, description: "Desperate Lashing" }, { phase: 3, type: 'special', id: 'shatter_reality', description: "Shatter Reality (Heavy Debuffs?)" }, ],
        resistances: { }, weaknesses: { }, aiBehavior: 'boss_phase_hp', currentPhase: 1, internalCounters: { artifactPower: 0 },
        specialAbilities: { prepare_onslaught: (self, p, gs) => { self.internalCounters.artifactPower++; self.applyStatus('Strength', 99, self.internalCounters.artifactPower); self.applyStatus('Dexterity', 99, self.internalCounters.artifactPower); console.log(`${self.name} gathers power! (+${self.internalCounters.artifactPower} Str/Dex total)`);}, consume_buffs: (self, p, gs) => { console.warn("Consume Buffs ability not implemented!"); /* TODO: Steal buffs */ }, shatter_reality: (self, p, gs) => { console.warn("Shatter Reality ability not implemented!"); /* TODO: Heavy multi-debuff */ p?.applyStatus('Weak', 3, 1, self.enemyType); p?.applyStatus('Frail', 3, 1, self.enemyType); p?.applyStatus('Vulnerable', 3, 1, self.enemyType); } },
        keywords: ['Boss', 'Floor3', 'PhaseShift', 'Scaling', 'Debuff', 'HighDamage'],
    },

};


/**
 * Represents an enemy combatant.
 */
export class Enemy {
    constructor(enemyId, instanceId) {
        const template = ENEMY_TEMPLATES[enemyId];
        if (!template) { throw new Error(`Invalid enemy template ID: ${enemyId}`); }

        this.id = `enemy_${enemyId}_${instanceId}`;
        this.enemyType = enemyId;
        this.name = template.name;
        this.maxHp = template.maxHp;
        this.currentHp = template.maxHp;
        this.sprite = template.sprite;
        this.intentions = JSON.parse(JSON.stringify(template.intentions)); // Deep copy
        this.currentIntent = null;
        this.currentBlock = 0;
        this.activeStatusEffects = []; // { id, duration, amount, source }
        this.resistances = { ...(template.resistances || {}) };
        this.weaknesses = { ...(template.weaknesses || {}) };
        this.aiBehavior = template.aiBehavior || 'sequential_intent';
        this.intentCycleIndex = 0;
        this.onDeathAction = template.onDeathAction ? { ...template.onDeathAction } : null;
        this.specialAbilities = template.specialAbilities || {};
        this.internalCounters = template.internalCounters ? JSON.parse(JSON.stringify(template.internalCounters)) : {};
        // Ensure currentPhase is initialized correctly
        this.currentPhase = template.currentPhase !== undefined ? template.currentPhase : null;
        this.passives = template.passives ? JSON.parse(JSON.stringify(template.passives)) : []; // Initialize passives

        // Runtime state flags
        this.wasDamagedLastTurn = false;
        this.wasDamagedUnblockedLastTurn = false;
        this.playerTookDamageLastTurn = false; // Needs to be set externally
        this.playerHealedLastTurn = false; // Needs to be set externally
        this.playerRef = null; // Reference set during combat

        this.determineNextIntent(); // Determine initial intent immediately
    }

    /** Determines the enemy's action for the upcoming turn based on AI behavior and conditions. */
    determineNextIntent(player = null) {
        if (this.currentHp <= 0) {
            this.currentIntent = null; // No intent if dead
            return;
        }
        this.playerRef = player || this.playerRef; // Update reference if provided

        // --- AI Phase Check (for HP-based phases) ---
        if (this.aiBehavior === 'boss_phase_hp' && this.currentPhase !== null) {
             const hpPercent = this.currentHp / this.maxHp;
             let targetPhase = 1; // Default phase
             // Determine target phase based on HP thresholds (example)
             if (this.intentions.some(i => i.phase === 3) && hpPercent <= 0.25) targetPhase = 3; // Check if phase 3 exists
             else if (this.intentions.some(i => i.phase === 2) && hpPercent <= 0.60) targetPhase = 2; // Check if phase 2 exists

             if (this.currentPhase !== targetPhase) {
                  console.log(`${this.name} phase changes to ${targetPhase} (HP: ${Math.round(hpPercent*100)}%)`);
                  this.currentPhase = targetPhase;
                  this.intentCycleIndex = 0; // Reset pattern/cycle index on phase change
                  // Optionally trigger phase change effect/artifact?
             }
        }
        // --- End AI Phase Check ---

        // Reset block unless specified by the *previous* intent
        if (!this.currentIntent?.keepsBlock) {
            this.currentBlock = 0;
        }

        // Filter intentions based on current phase (if applicable)
        let phaseIntentions = this.intentions;
        if (this.currentPhase !== null) {
             phaseIntentions = this.intentions.filter(intent => intent.phase === undefined || intent.phase === this.currentPhase);
             if (phaseIntentions.length === 0) {
                 console.warn(`Enemy ${this.name} has no intentions for current phase: ${this.currentPhase}. Using full list.`);
                 phaseIntentions = this.intentions; // Fallback to all intentions
             }
        }

        // Filter based on conditions
        const possibleIntents = phaseIntentions.filter(intent => {
             if (!intent.condition) return true; // No condition = always possible (within phase)

             // Evaluate known conditions
             switch(intent.condition) {
                 case 'wasDamagedLastTurn': return this.wasDamagedLastTurn;
                 case 'wasDamagedUnblockedLastTurn': return this.wasDamagedUnblockedLastTurn;
                 case 'playerTookDamageLastTurn': return this.playerTookDamageLastTurn;
                 case 'playerHealedLastTurn': return this.playerHealedLastTurn;
                 case 'hpBelow50': return this.currentHp < this.maxHp * 0.5;
                 case 'hpBelow30': return this.currentHp < this.maxHp * 0.3;
                 case 'hpAbove75': return this.currentHp > this.maxHp * 0.75;
                 case 'playerHasHighBlock': return this.playerRef && this.playerRef.currentBlock >= 10;
                 case 'playerHasDebuff': return this.playerRef && this.playerRef.activeStatusEffects.some(s => ['Weak', 'Vulnerable', 'Frail', 'Poison', 'Burn', 'Entangle', 'Confusion'].includes(s.id));
                 case 'selfHasDebuff': return this.activeStatusEffects.some(s => ['Weak', 'Vulnerable', 'Frail'].includes(s.id));
                 // Add more conditions...
                 default: console.warn(`Unknown intent condition for ${this.name}: ${intent.condition}`); return true; // Default true if condition unknown
             }
        });

        let chosenIntent = null;
        if (possibleIntents.length === 0) {
             // Fallback: Find first non-conditional intent from the current phase list (or full list)
             chosenIntent = phaseIntentions.find(i => !i.condition) || this.intentions.find(i => !i.condition);
              if (!chosenIntent) chosenIntent = {type:'none', description:'Hesitating...'}; // Ultimate fallback
              console.warn(`${this.name} had no valid possible intents. Fallback: ${chosenIntent.description}`);
        } else {
            // Apply AI behavior to possible intents
            const weights = possibleIntents.map(i => i.weight || 1); // Default weight 1
            const totalWeight = weights.reduce((sum, w) => sum + w, 0);

            switch (this.aiBehavior) {
                case 'sequential_intent':
                    chosenIntent = possibleIntents[this.intentCycleIndex % possibleIntents.length];
                    this.intentCycleIndex++;
                    break;
                case 'sequential_cycle_powerup': // Cycle includes the powerup which might be conditional
                    // Cycle through ALL phase intentions, conditions checked in executeTurn
                    chosenIntent = phaseIntentions[this.intentCycleIndex % phaseIntentions.length];
                    this.intentCycleIndex++;
                    break;
                case 'random_intent': // Pure random choice from possibles
                    chosenIntent = possibleIntents[Math.floor(Math.random() * possibleIntents.length)];
                    break;
                case 'random_weighted':
                    if (totalWeight <= 0 || possibleIntents.length === 0) { chosenIntent = possibleIntents[0] || phaseIntentions[0] || {type:'none', description:'Stuck...'}; break; } // Robust fallback
                    let randomNumW = Math.random() * totalWeight;
                    for(let i=0; i < possibleIntents.length; i++) {
                        randomNumW -= weights[i];
                        if (randomNumW <= 0) { chosenIntent = possibleIntents[i]; break; }
                    }
                    if (!chosenIntent) chosenIntent = possibleIntents[possibleIntents.length - 1]; // Assign last if loop fails somehow
                    break;
                case 'reactive_pattern':
                    const conditionalMove = possibleIntents.find(i => i.condition);
                    if (conditionalMove) { chosenIntent = conditionalMove; }
                    else {
                        const nonConditional = possibleIntents.filter(i => !i.condition);
                        if (nonConditional.length > 0) { chosenIntent = nonConditional[this.intentCycleIndex % nonConditional.length]; this.intentCycleIndex++; } // Only advance base pattern index when using non-conditional
                        else { chosenIntent = possibleIntents[0]; if (!chosenIntent) chosenIntent = {type:'none', description:'Calculating...'}; } // Fallback if only conditional moves were possible but none met
                    }
                    break;
                 case 'phase_shift': // Simple random within phase
                      chosenIntent = possibleIntents[Math.floor(Math.random() * possibleIntents.length)];
                     break;
                 case 'support_cycle': case 'support_passive':
                     const supportMoves = possibleIntents.filter(i => i.type === 'buff' || i.type === 'debuff' || i.type === 'block' || i.type === 'special' || i.type === 'heal');
                     const attackMoves = possibleIntents.filter(i => i.type === 'attack' || i.type === 'multi_attack');
                     if (supportMoves.length > 0 && (attackMoves.length === 0 || Math.random() < 0.75)) { chosenIntent = supportMoves[Math.floor(Math.random() * supportMoves.length)]; }
                     else if (attackMoves.length > 0) { chosenIntent = attackMoves[Math.floor(Math.random() * attackMoves.length)]; }
                     else { chosenIntent = possibleIntents[0]; } // Fallback
                     break;
                 case 'boss_pattern_reactive': case 'boss_summoner_pattern': case 'boss_phase_hp':
                     let patternIndex = this.internalCounters.patternIndex || 0;
                     // Find the move matching the current pattern index within the possible moves for this phase
                     chosenIntent = possibleIntents.find(i => i.pattern === patternIndex);
                     // Calculate total number of unique pattern steps *in this phase*
                     const phasePatternSteps = new Set(phaseIntentions.filter(i => i.pattern !== undefined).map(i => i.pattern)).size;

                     if (!chosenIntent) { // Fallback if pattern move missing/invalid for current state/phase
                          chosenIntent = possibleIntents[Math.floor(Math.random() * possibleIntents.length)];
                          console.warn(`${this.name} missing or cannot execute intent for pattern index ${patternIndex} in phase ${this.currentPhase}, choosing randomly.`);
                     }
                     // Advance pattern index, wrapping based on number of pattern steps in the current phase
                     if (phasePatternSteps > 0) { this.internalCounters.patternIndex = (patternIndex + 1) % phasePatternSteps; }
                     else { this.internalCounters.patternIndex = 0; } // Reset if no pattern moves in phase

                     // Check reactive moves *after* selecting pattern move - potentially override
                     const reactiveMove = possibleIntents.find(i => i.condition);
                     // Override if reactive move exists and either no pattern move was chosen, OR reactive has higher weight
                     if (reactiveMove && (!chosenIntent || (reactiveMove.weight || 1) > (chosenIntent.weight || 1))) {
                         chosenIntent = reactiveMove;
                         console.log(`${this.name} using reactive move: ${chosenIntent.description}`);
                     }
                     break;
                default:
                    console.warn(`Unknown AI behavior '${this.aiBehavior}' for ${this.name}. Using first possible.`);
                    chosenIntent = possibleIntents[0];
            }
        }

        // Reset flags AFTER choosing intent for next turn
        this.wasDamagedLastTurn = false; this.wasDamagedUnblockedLastTurn = false;
        this.playerTookDamageLastTurn = false; this.playerHealedLastTurn = false;

        this.currentIntent = chosenIntent;
    }

    /** Executes the enemy's planned action for the *current* turn. */
    executeTurn(player, gameState) {
        if (!this.currentIntent || this.currentHp <= 0 || !player) { if (this.currentHp <= 0) this.determineNextIntent(player); return; }
        this.playerRef = player;

        // Stun Check
        if (this.hasStatus('Stunned')) { console.log(`${this.name} is Stunned! Turn skipped.`); this.removeStatus('Stunned'); this.tickStatusEffects('start', player); this.tickStatusEffects('end', player); this.determineNextIntent(player); gameState?.uiManager?.updateCombatUI(player, gameState.combatManager.enemies, false); return; }

        // Start of Turn Effects
        this.tickStatusEffects('start', player);
        if (this.currentHp <= 0) { this.determineNextIntent(player); return; } // Re-check life

        const intent = this.currentIntent;
        if (!intent) { console.warn(`${this.name} has null intent at execution.`); this.determineNextIntent(player); return;} // Safety check

        console.log(`${this.name} executing: ${intent.description || intent.type}`); // Log action
        let baseValue = intent.baseValue || 0; let modifiedValue;

        // Execute action based on intent type
        try {
            switch (intent.type) {
                case 'attack': modifiedValue = this.applyModifiers('damageDealt', baseValue); player.takeDamage(modifiedValue, this.enemyType); if (intent.status && player.currentHp > 0) player.applyStatus(intent.status, intent.statusDuration || 1, 1, this.enemyType); break;
                case 'multi_attack': const count = intent.count || 1; modifiedValue = this.applyModifiers('damageDealt', baseValue); for(let i = 0; i < count && player.currentHp > 0; i++) { player.takeDamage(modifiedValue, this.enemyType); } if (intent.status && intent.applyStatusOnce && player.currentHp > 0) { player.applyStatus(intent.status, intent.statusDuration || 1, 1, this.enemyType); } break;
                case 'block': const targetBlock = intent.target === 'self_and_allies' ? this.findAllyTarget(intent.target, gameState?.combatManager?.enemies) : this; if (targetBlock) { const blockAmount = this.applyModifiers('blockGain', baseValue); if (Array.isArray(targetBlock)) { targetBlock.forEach(t => t.gainBlock(blockAmount)); } else { targetBlock.gainBlock(blockAmount); } } break;
                case 'attack_block': const attackVal = this.applyModifiers('damageDealt', intent.attackValue || 0); if (player.currentHp > 0) player.takeDamage(attackVal, this.enemyType); const blockVal = this.applyModifiers('blockGain', intent.blockValue || 0); this.gainBlock(blockVal); break;
                case 'debuff': if (intent.status && intent.target === 'player' && player.currentHp > 0) { player.applyStatus(intent.status, intent.duration || 1, intent.amount || 1, this.enemyType); } else if (intent.target !== 'player') { console.warn(`Enemy ${this.name} tried to debuff non-player target:`, intent); } break;
                case 'buff': case 'power_up': if (intent.status) { const duration = intent.type === 'power_up' ? 99 : (intent.duration || 1); const targetBuff = intent.target === 'ally' || intent.target === 'ally_lowest_hp' || intent.target === 'self_and_allies' ? this.findAllyTarget(intent.target, gameState?.combatManager?.enemies) : this; if(targetBuff) { if(Array.isArray(targetBuff)) { targetBuff.forEach(t => t.applyStatus(intent.status, duration, intent.amount || 1, this.enemyType));} else { targetBuff.applyStatus(intent.status, duration, intent.amount || 1, this.enemyType); } } } break;
                case 'heal': modifiedValue = baseValue; this.heal(modifiedValue); break; // Added Heal intent type
                case 'special': this.executeSpecialAbility(intent.id, player, gameState); break;
                case 'none': console.log(`${this.name} is ${intent.description || 'doing nothing'}.`); break;
                default: console.warn(`Unknown intent type executed by ${this.name}: ${intent.type}`);
            }
        } catch (error) { console.error(`Error executing intent for ${this.name} (Intent: ${JSON.stringify(intent)}):`, error); }

        // End of Turn Effects
        this.tickStatusEffects('end', player);
        if (this.currentHp <= 0) { this.determineNextIntent(player); return; } // Re-check life

        // Determine NEXT intent (for next turn) AFTER executing this turn's action & effects
        this.determineNextIntent(player);
    }

    /** Handles custom special ability logic from template. */
    executeSpecialAbility(abilityId, player, gameState) {
         if (!abilityId) { console.warn(`${this.name} tried to execute special ability with no ID.`); return; }
         if (this.specialAbilities && typeof this.specialAbilities[abilityId] === 'function') {
             try { this.specialAbilities[abilityId](this, player, gameState); }
             catch (error) { console.error(`Error executing special ability '${abilityId}' for ${this.name}:`, error); }
         } else { console.warn(`Undefined or non-function special ability ID: ${abilityId} for ${this.name}`); }
     }

    /** Applies damage to the enemy, considering block, statuses, resistances/weaknesses. (Checks passives) */
    takeDamage(amount, damageSourceElement = null) {
        if (this.currentHp <= 0 || amount <= 0) return 0;
        let modifiedAmount = amount;

        // Trigger passives like "onTakingDamage" BEFORE reductions/block
        this.checkPassives('onTakingDamage', { amount: modifiedAmount, sourceElement: damageSourceElement });

        // Apply standard reductions/multipliers
        if (this.hasStatus('Intangible')) { modifiedAmount = Math.max(1, modifiedAmount > 0 ? 1 : 0); }
        if (this.hasStatus('Vulnerable')) { modifiedAmount = Math.floor(modifiedAmount * 1.5); }
        if (damageSourceElement) { const weakMult = this.weaknesses[damageSourceElement] || 1.0; const resMult = this.resistances[damageSourceElement] || 1.0; const combinedMult = weakMult * resMult; if (combinedMult !== 1.0) { modifiedAmount = Math.floor(modifiedAmount * combinedMult); } }
        modifiedAmount = Math.max(0, modifiedAmount);
        if (modifiedAmount <= 0) { return 0; } // No damage after modifications

        const blockConsumed = Math.min(this.currentBlock, modifiedAmount);
        const damageAfterBlock = modifiedAmount - blockConsumed;
        const hpLost = Math.min(this.currentHp, damageAfterBlock); // Actual HP lost

        // Set flags for AI conditions (used in the *next* turn's determineNextIntent)
        this.wasDamagedLastTurn = true;
        if (damageAfterBlock > 0) { this.wasDamagedUnblockedLastTurn = true; }

        // Apply damage/block reduction
        if (blockConsumed > 0) this.currentBlock -= blockConsumed;
        if (damageAfterBlock > 0) this.currentHp -= damageAfterBlock;

        // Trigger passives like "onDamaged" AFTER damage is applied
        if (hpLost > 0) {
             this.checkPassives('onDamaged', { amount: hpLost, sourceElement: damageSourceElement });
        }

        // Handle death
        if (this.currentHp <= 0) { this.currentHp = 0; this.currentIntent = null; this.activeStatusEffects = []; console.log(`${this.name} defeated!`); }

        return damageAfterBlock; // Return actual HP damage dealt
    }

    /** Adds block to the enemy, considering statuses. */
    gainBlock(amount) {
        if (amount <= 0) return;
        const modifiedAmount = this.applyModifiers('blockGain', amount);
        if (modifiedAmount <= 0) return;
        this.currentBlock += modifiedAmount;
   }

    /** Applies status effects. */
    applyStatus(statusId, duration, amount = 1, source = null) {
        if (!statusId) return; const persistentStack = ['Strength', 'Dexterity', 'Metallicize', 'Thorns', 'Poison']; if (duration <= 0 && amount <= 0 && !persistentStack.includes(statusId)) return; if (statusId === 'Poison' && amount <= 0) return; const existing = this.activeStatusEffects.find(s => s.id === statusId); if (existing) { if (persistentStack.includes(statusId) || ['Regen'].includes(statusId)) { existing.amount = (existing.amount || 0) + amount; } if (existing.duration !== 99) { existing.duration = Math.max(existing.duration, duration); } /* console.log(`${this.name} refreshed/stacked ${statusId}.`); */ } else { let initialAmount = (persistentStack.includes(statusId) || ['Regen'].includes(statusId)) ? amount : 1; if (initialAmount <= 0 && statusId === 'Poison') return; if (initialAmount <= 0 && duration <= 0 && !persistentStack.includes(statusId)) return; this.activeStatusEffects.push({ id: statusId, duration: duration, source: source || 'Unknown', amount: initialAmount }); /* console.log(`${this.name} applied ${statusId}.`); */ }
     }
    /** Removes a status effect. */
    removeStatus(statusId) { const initialLength = this.activeStatusEffects.length; this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId); return this.activeStatusEffects.length < initialLength; }
    /** Checks for a status. */
    hasStatus(statusId) { return this.activeStatusEffects.some(s => s.id === statusId); }
    /** Gets status amount. */
    getStatusAmount(statusId) { const s = this.activeStatusEffects.find(st => st.id === statusId); return s ? (s.amount || (s.duration > 0 ? 1 : 0)) : 0; }
    /** Processes status effect ticks. */
    tickStatusEffects(phase, player) { const effectsToRemove = []; const statusesAtStartOfTick = [...this.activeStatusEffects]; statusesAtStartOfTick.forEach(effect => { if (!this.activeStatusEffects.includes(effect)) return; let removeAfterTick = false; if (phase === 'start') { switch(effect.id) { case 'Poison': if (effect.amount > 0) { this.takeDamage(effect.amount, 'Poison'); effect.amount--; if (effect.amount <= 0) removeAfterTick = true; } else { removeAfterTick = true; } break; case 'Burn': if (effect.amount > 0) { this.takeDamage(effect.amount, 'Burn'); } break; } } if (phase === 'end') { switch(effect.id) { case 'Regen': if (effect.amount > 0) { this.heal(effect.amount); } break; case 'Metallicize': if (effect.amount > 0) { this.gainBlock(effect.amount); } break; case 'Intangible': removeAfterTick = true; break; } const isPassiveOrInfinite = ['Strength', 'Dexterity', 'Metallicize', 'Thorns'].includes(effect.id) || effect.duration === 99; const tickDuration = !isPassiveOrInfinite && effect.id !== 'Poison'; if (tickDuration) { effect.duration--; if (effect.duration <= 0 && !effectsToRemove.includes(effect.id)) { removeAfterTick = true; } } } if (removeAfterTick && !effectsToRemove.includes(effect.id)) { effectsToRemove.push(effect.id); } }); if (effectsToRemove.length > 0) { this.activeStatusEffects = this.activeStatusEffects.filter(e => !effectsToRemove.includes(e.id)); } }
    /** Heals the enemy. */
    heal(amount) { if (amount <= 0 || this.currentHp <= 0 || this.currentHp >= this.maxHp) return 0; const actualHeal = Math.min(amount, this.maxHp - this.currentHp); this.currentHp += actualHeal; return actualHeal; }
    /** Applies damage/block modifiers based on statuses. */
    applyModifiers(modifierType, baseValue) { let modifiedValue = baseValue; switch(modifierType) { case 'damageDealt': if (this.hasStatus('Weak')) modifiedValue = Math.floor(modifiedValue * 0.75); if (this.hasStatus('Strength')) modifiedValue += this.getStatusAmount('Strength'); break; case 'blockGain': if (this.hasStatus('Dexterity')) modifiedValue += this.getStatusAmount('Dexterity'); if (this.hasStatus('Frail')) modifiedValue = Math.floor(modifiedValue * 0.75); break; } return Math.max(0, Math.floor(modifiedValue)); }
    /** Checks and executes passive abilities. */
    checkPassives(trigger, eventData = {}) { if (!this.passives || this.passives.length === 0) return; this.passives.forEach(passive => { if (passive.trigger === trigger) { let conditionMet = true; if (passive.condition) { switch(passive.condition) { case 'hpAbove50': conditionMet = this.currentHp > this.maxHp * 0.5; break; case 'hpBelow50': conditionMet = this.currentHp < this.maxHp * 0.5; break; default: console.warn(`Unknown passive condition: ${passive.condition}`); } } if (conditionMet) { console.log(`${this.name} passive triggered: ${passive.trigger}`); try { if (passive.effect?.type === 'applyStatusToPlayer' && this.playerRef) { this.playerRef.applyStatus(passive.effect.status, passive.effect.duration || 1, passive.effect.amount || 1, `${this.enemyType}_Passive`); } } catch (error) { console.error(`Error executing passive for ${this.name}:`, error, passive); } } } }); }
    /** Finds ally targets for buffs/effects. */
    findAllyTarget(targetType, allEnemies = []) { const allies = allEnemies.filter(e => e && e.id !== this.id && e.currentHp > 0); if (allies.length === 0) return (targetType === 'self_and_allies') ? [this] : (['ally', 'ally_lowest_hp'].includes(targetType) ? null : this); switch(targetType) { case 'ally': return allies[Math.floor(Math.random() * allies.length)]; case 'ally_lowest_hp': return allies.sort((a, b) => a.currentHp - b.currentHp)[0]; case 'self_and_allies': return [this, ...allies]; default: return this; } }
    /** Cleans up temporary statuses at end of combat. */
    cleanupCombatStatuses() { const initialLength = this.activeStatusEffects.length; this.activeStatusEffects = this.activeStatusEffects.filter(effect => { const persist = [].includes(effect.id); return persist; }); }

} // End of Enemy class
