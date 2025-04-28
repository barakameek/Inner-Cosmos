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
        name: "Whispering Doubt", maxHp: 25, // Lowered HP slightly
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
        name: "Rigid Perfectionism", maxHp: 75, // Increased HP
        sprite: 'assets/images/enemies/perfectionism.png', // Placeholder path
        intentions: [ // Base cycle: Block -> Attack -> Attack/Block. Reacts to player state.
            { type: 'block', baseValue: 14, weight: 1, description: "Reinforce Standards" }, // Strong initial block
            { type: 'attack', baseValue: 11, weight: 1, description: "Critical Strike" },
            { type: 'attack_block', attackValue: 8, blockValue: 8, weight: 1, description: "Measured Assault (8 Atk, 8 Blk)" },
            // Reactive Intention 1: Punishes player taking damage
            { type: 'power_up', status: 'Strength', duration: 99, amount: 1, condition: 'playerTookDamageLastTurn', description: "Punish Imperfection (+1 Str)", weight: 10 }, // High priority if condition met
            // Reactive Intention 2: Punishes player blocking heavily
            { type: 'debuff', status: 'Frail', duration: 2, target: 'player', condition: 'playerHasHighBlock', description: "Critique Defense (-Frail 2t)", weight: 10 } // High priority if condition met
        ],
         resistances: { Interaction: 0.75, Cognitive: 0.8 }, // Resists social/mental manipulation
         weaknesses: { Psychological: 1.25 }, // Vulnerable to emotional approaches?
         aiBehavior: 'reactive_pattern', // Prioritizes conditional moves, otherwise cycles basics
         keywords: ['Elite', 'Defensive', 'Reactive', 'Punisher', 'Armor'], // Armor implies high block/defense
         // Define custom condition checks within the Enemy class or pass player state to determineNextIntent
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
        name: "Resentment Globule", maxHp: 60, // Slightly less HP
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
             { type: 'buff', status: 'Dexterity', duration: 99, amount: 2, target: 'ally', description: "Reinforce Facade (+2 Dex Ally)" }, // Buff ally
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
         name: "Compulsive Habit", maxHp: 95, // More HP
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
        name: "Suppressed Memory", maxHp: 80, // Moderate HP, relies on disruption
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
        name: "Despair Echo", maxHp: 75, // Slightly less HP
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
    'fragmented_identity': { // Kept from before, slightly tuned
         name: "Fragmented Identity", maxHp: 120, // More HP
         sprite: 'assets/images/enemies/fragment_1.png', // Placeholder
         intentions: [
             // Aggressive Phase
             { phase: 'Aggressive', type: 'multi_attack', count: 2, baseValue: 9, description: "Assertive Flurry (2x9)" }, // Higher damage
             { phase: 'Aggressive', type: 'attack', baseValue: 14, status: 'Vulnerable', statusDuration: 1, target: 'player', description: "Exposing Strike (14 Atk, -Vuln)" },
             { phase: 'Aggressive', type: 'special', id: 'shift_phase', targetPhase: 'Defensive', description: "Shift Aspect (-> Defensive)" },
             // Defensive Phase
             { phase: 'Defensive', type: 'block', baseValue: 20, description: "Yielding Guard" }, // Higher block
             { phase: 'Defensive', type: 'debuff', status: 'Weak', duration: 2, target: 'player', description: "Defensive Murmur (-Weak 2t)" },
              { phase: 'Defensive', type: 'heal', baseValue: 10, description: "Recuperate (Heal 10)" }, // Added heal
             { phase: 'Defensive', type: 'special', id: 'shift_phase', targetPhase: 'Aggressive', description: "Shift Aspect (-> Aggressive)" },
         ],
         resistances: { Interaction: 0.8 }, weaknesses: { Cognitive: 1.2 }, aiBehavior: 'phase_shift', currentPhase: 'Aggressive',
         specialAbilities: { shift_phase: (self, player, gameState) => { const targetPhase = self.currentIntent?.targetPhase || 'Aggressive'; self.currentPhase = targetPhase; console.log(`${self.name} shifts aspect to ${targetPhase}!`); self.currentIntent = null; self.determineNextIntent(player); /* Optional: Change sprite */ } },
         keywords: ['Elite', 'PhaseShift', 'Unpredictable', 'Heal'],
    },
    'manifested_fear': { // NEW Floor 3 Elite - Powerful single target / fear based
        name: "Manifested Fear", maxHp: 100,
        sprite: 'assets/images/enemies/manifested_fear.png', // Placeholder
        intentions: [ // Cycle focused on high damage and debilitating debuffs
             { type: 'attack', baseValue: 20, description: "Paralyzing Blow" }, // Very high damage
             { type: 'debuff', status: 'Frail', duration: 3, target: 'player', description: "Crippling Doubt (-Frail 3t)" },
             { type: 'attack', baseValue: 10, status: 'Vulnerable', statusDuration: 2, target: 'player', description: "Nightmare Strike (10 Atk, -Vuln 2t)" },
             { type: 'special', id: 'add_fear_card', description: "Instill Dread (+Heavy Heart)" }, // Adds a curse
        ],
        resistances: { Psychological: 0.3 }, // Extremely resistant to mental effects
        weaknesses: { Interaction: 1.5, Sensory: 1.2 }, // Vulnerable to directness/grounding
        aiBehavior: 'sequential_intent',
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
        intentions: [ // Pattern: Debuff -> Multi-Attack -> Block -> Heavy Attack -> Repeat
            { pattern: 0, type: 'debuff', status: 'Weak', duration: 2, target: 'player', description: "Whispers of Doubt (-Weak 2t)" },
            { pattern: 1, type: 'multi_attack', count: 3, baseValue: 5, description: "Flurry of Self-Criticism (3x5)" },
            { pattern: 2, type: 'block', baseValue: 15, description: "Defensive Posturing" },
            { pattern: 3, type: 'attack', baseValue: 16, description: "Crippling Comparison" },
            // Adds Strength when player heals?
             { pattern: -1, condition: 'playerHealedLastTurn', type: 'buff', status: 'Strength', amount: 1, duration: 99, description: "Feeding on Weakness (+1 Str)", weight: 10 } // Reactive, high priority
        ],
        resistances: { Psychological: 0.7 },
        weaknesses: { Interaction: 1.3 },
        aiBehavior: 'boss_pattern_reactive', // Cycles pattern, checks reactive moves
        internalCounters: { patternIndex: 0 }, // Tracks pattern
        keywords: ['Boss', 'Floor1', 'Debuff', 'Mental', 'Reactive'],
        // Needs custom AI logic ('boss_pattern_reactive')
    },

     // --- Floor 2 Boss ---
     'gatekeeper_of_shame': {
        name: "Gatekeeper of Shame", maxHp: 200,
        sprite: 'assets/images/enemies/boss_shame.png', // Placeholder
        minions: [ { id: 'shame_fragment', count: 2, initial: true } ], // Starts with minions
        intentions: [ // Complex pattern involving minions
            { pattern: 0, type: 'attack', baseValue: 10, status: 'Frail', duration: 1, target: 'player', description: "Judgmental Glare (10 Atk, -Frail)"},
            { pattern: 1, type: 'special', id: 'summon_fragment', description: "Summon Shame Fragment" },
            { pattern: 2, type: 'block', baseValue: 10, target: 'self_and_allies', description: "Wall of Secrets (10 Blk All)" },
            { pattern: 3, type: 'special', id: 'empower_fragments', description: "Empower Fragments (+Str Allies)" },
            { pattern: 4, type: 'multi_attack', count: 2, baseValue: 8, description: "Projected Criticism (2x8)" },
        ],
        resistances: { Psychological: 0.6, Cognitive: 0.8 },
        weaknesses: { Sensory: 1.4 }, // Vulnerable to grounding/presence
        aiBehavior: 'boss_summoner_pattern', // Specific pattern involving summons
        internalCounters: { patternIndex: 0, fragmentsSummoned: 0 },
        specialAbilities: {
            summon_fragment: (self, player, gameState) => { /* TODO: Add logic in CombatManager to spawn a 'shame_fragment' enemy */ console.warn("Summon Fragment ability not implemented!"); },
            empower_fragments: (self, player, gameState) => { /* TODO: Add logic to find allied 'shame_fragment' and buff their Strength */ console.warn("Empower Fragments ability not implemented!"); }
        },
        keywords: ['Boss', 'Floor2', 'Summoner', 'Debuff', 'GroupTactics'],
     },
     'shame_fragment': { // Minion for Gatekeeper boss
        name: "Shame Fragment", maxHp: 20,
        sprite: 'assets/images/enemies/shame_fragment.png', // Placeholder
        intentions: [
             { type: 'attack', baseValue: 5, weight: 3, description: "Pointed Remark" },
             { type: 'debuff', status: 'Weak', duration: 1, target: 'player', weight: 1, description: "Lingering Discomfort (-Weak)" },
        ],
        resistances: {}, weaknesses: {}, aiBehavior: 'random_weighted',
        keywords: ['Minion', 'Debuff'],
     },

     // --- Floor 3 Boss ---
     'persona_core_conflict': {
        name: "Persona Core Conflict", maxHp: 280,
        sprite: 'assets/images/enemies/boss_core.png', // Placeholder
        intentions: [ // Phase-based boss
            // Phase 1: Defensive/Setup (Above 60% HP)
            { phase: 1, type: 'block', baseValue: 25, description: "Inner Wall" },
            { phase: 1, type: 'special', id: 'prepare_onslaught', description: "Gathering Storm (+Artifact)" }, // Gains artifact power
            { phase: 1, type: 'debuff', status: 'Entangle', amount: 1, duration: 2, target: 'player', description: "Web of Thoughts (+1 Cost 2t)" },
            // Phase 2: Aggressive/Debuff (Below 60% HP)
            { phase: 2, type: 'multi_attack', count: 3, baseValue: 7, description: "Fragmented Assault (3x7)" },
            { phase: 2, type: 'attack', baseValue: 12, status: 'Vulnerable', duration: 2, target: 'player', description: "Raw Exposure (12 Atk, -Vuln 2t)" },
            { phase: 2, type: 'special', id: 'consume_buffs', description: "Consume Persona (Steal Buffs?)" }, // Steals player buffs?
             // Phase 3: Desperation (Below 25% HP)
             { phase: 3, type: 'attack', baseValue: 25, description: "Desperate Lashing" }, // Huge hit
             { phase: 3, type: 'special', id: 'shatter_reality', description: "Shatter Reality (Heavy Debuffs?)" }, // Apply multiple debuffs
        ],
        resistances: { }, // No specific resistance, relies on phases
        weaknesses: { },
        aiBehavior: 'boss_phase_hp', // AI changes based on HP thresholds
        currentPhase: 1, // Starts in phase 1
        internalCounters: { artifactPower: 0 },
        specialAbilities: {
            prepare_onslaught: (self, p, gs) => { self.internalCounters.artifactPower++; self.applyStatus('Strength', 99, self.internalCounters.artifactPower); self.applyStatus('Dexterity', 99, self.internalCounters.artifactPower); console.log(`${self.name} gathers power! (+${self.internalCounters.artifactPower} Str/Dex total)`);},
            consume_buffs: (self, p, gs) => { console.warn("Consume Buffs ability not implemented!"); /* TODO: Logic to remove player buffs and potentially add to self */ },
            shatter_reality: (self, p, gs) => { console.warn("Shatter Reality ability not implemented!"); /* TODO: Apply multiple strong debuffs */ p?.applyStatus('Weak', 3, 1, self.enemyType); p?.applyStatus('Frail', 3, 1, self.enemyType); p?.applyStatus('Vulnerable', 3, 1, self.enemyType); }
        },
        keywords: ['Boss', 'Floor3', 'PhaseShift', 'Scaling', 'Debuff', 'HighDamage'],
        // Needs AI logic ('boss_phase_hp') in Enemy class to handle phase transitions based on HP
    },

};


/**
 * Represents an enemy combatant.
 */
export class Enemy {
    constructor(enemyId, instanceId) {
        const template = ENEMY_TEMPLATES[enemyId];
        if (!template) { throw new Error(`Invalid enemy template ID: ${enemyId}`); }

        this.id = `enemy_${enemyId}_${instanceId}`; this.enemyType = enemyId; this.name = template.name; this.maxHp = template.maxHp; this.currentHp = template.maxHp; this.sprite = template.sprite;
        this.intentions = JSON.parse(JSON.stringify(template.intentions)); this.currentIntent = null; this.currentBlock = 0; this.activeStatusEffects = [];
        this.resistances = { ...(template.resistances || {}) }; this.weaknesses = { ...(template.weaknesses || {}) }; this.aiBehavior = template.aiBehavior || 'sequential_intent'; this.intentCycleIndex = 0;
        this.onDeathAction = template.onDeathAction ? { ...template.onDeathAction } : null; this.specialAbilities = template.specialAbilities || {}; this.internalCounters = template.internalCounters ? JSON.parse(JSON.stringify(template.internalCounters)) : {};
        this.currentPhase = template.currentPhase || null; // Initialize phase if defined
        this.passives = template.passives || []; // Initialize passives

        // Runtime state flags
        this.wasDamagedLastTurn = false; this.wasDamagedUnblockedLastTurn = false;
        this.playerTookDamageLastTurn = false; // Flag for reactive patterns
        this.playerHealedLastTurn = false; // Flag for reactive patterns
        this.playerRef = null; // Reference set during combat

        this.determineNextIntent(); // Determine initial intent immediately
    }

    /** Determines the enemy's action for the upcoming turn based on AI behavior and conditions. */
    determineNextIntent(player = null) {
        if (this.currentHp <= 0) { this.currentIntent = null; return; }
        this.playerRef = player || this.playerRef;

        // --- AI Phase Check (for HP-based phases) ---
        if (this.aiBehavior === 'boss_phase_hp') {
             const hpPercent = this.currentHp / this.maxHp;
             let targetPhase = 1; // Default phase
             if (hpPercent <= 0.25) targetPhase = 3;
             else if (hpPercent <= 0.60) targetPhase = 2;
             if (this.currentPhase !== targetPhase) {
                  console.log(`${this.name} phase changes to ${targetPhase} (HP: ${Math.round(hpPercent*100)}%)`);
                  this.currentPhase = targetPhase;
                  this.intentCycleIndex = 0; // Reset pattern index on phase change
                  // Optionally trigger phase change effect/artifact?
             }
        }
        // --- End AI Phase Check ---


        if (!this.currentIntent?.keepsBlock) { this.currentBlock = 0; }

        // Filter intentions based on current phase (if applicable)
        let phaseIntentions = this.intentions;
        if (this.currentPhase !== null) { // Use null check for phases
             phaseIntentions = this.intentions.filter(intent => intent.phase === undefined || intent.phase === this.currentPhase); // Intentions with no phase or matching phase
             if (phaseIntentions.length === 0) { console.warn(`Enemy ${this.name} has no intentions for phase: ${this.currentPhase}. Using full list.`); phaseIntentions = this.intentions; }
        }

        // Filter based on conditions
        const possibleIntents = phaseIntentions.filter(intent => {
             if (!intent.condition) return true;
             // Evaluate known conditions (using internal flags set elsewhere)
             switch(intent.condition) {
                 case 'wasDamagedLastTurn': return this.wasDamagedLastTurn;
                 case 'wasDamagedUnblockedLastTurn': return this.wasDamagedUnblockedLastTurn;
                 case 'playerTookDamageLastTurn': return this.playerTookDamageLastTurn; // NEW flag check
                 case 'playerHealedLastTurn': return this.playerHealedLastTurn; // NEW flag check
                 case 'hpBelow50': return this.currentHp < this.maxHp * 0.5;
                 case 'hpBelow30': return this.currentHp < this.maxHp * 0.3;
                 case 'hpAbove75': return this.currentHp > this.maxHp * 0.75;
                 case 'playerHasHighBlock': return this.playerRef && this.playerRef.currentBlock >= 10;
                 case 'playerHasDebuff': return this.playerRef && this.playerRef.activeStatusEffects.some(s => ['Weak', 'Vulnerable', 'Frail', 'Poison', 'Burn', 'Entangle', 'Confusion'].includes(s.id));
                 case 'selfHasDebuff': return this.activeStatusEffects.some(s => ['Weak', 'Vulnerable', 'Frail'].includes(s.id));
                 // Add custom function conditions later if needed:
                 // case 'customFunction': return template.conditionFunctions[intent.customConditionId](this, player, gameState);
                 default: console.warn(`Unknown intent condition for ${this.name}: ${intent.condition}`); return true;
             }
        });

        let chosenIntent = null;
        if (possibleIntents.length === 0) { /* ... Fallback logic ... */ chosenIntent = phaseIntentions.find(i => !i.condition) || this.intentions.find(i => !i.condition); if (!chosenIntent) chosenIntent = {type:'none', description:'Hesitating...'}; console.warn(`${this.name} had no valid possible intents. Fallback: ${chosenIntent.description}`); }
        else {
            // --- Apply AI behavior ---
             const weights = possibleIntents.map(i => i.weight || 1); // Default weight 1 if not specified
             const totalWeight = weights.reduce((sum, w) => sum + w, 0);

            switch (this.aiBehavior) {
                case 'sequential_intent': chosenIntent = possibleIntents[this.intentCycleIndex % possibleIntents.length]; this.intentCycleIndex++; break;
                case 'sequential_cycle_powerup': // Cycle includes the powerup which might be conditional
                    chosenIntent = phaseIntentions[this.intentCycleIndex % phaseIntentions.length]; // Cycle through PHASE intentions
                    // Only execute if possible (condition met) - handled in executeTurn
                    this.intentCycleIndex++;
                    break;
                case 'random_intent': chosenIntent = possibleIntents[Math.floor(Math.random() * possibleIntents.length)]; break;
                case 'random_weighted':
                    if (totalWeight <= 0) { chosenIntent = possibleIntents[0]; break; } // Fallback if weights are zero
                    let randomNumW = Math.random() * totalWeight;
                    for(let i=0; i < possibleIntents.length; i++) { randomNumW -= weights[i]; if (randomNumW <= 0) { chosenIntent = possibleIntents[i]; break; } }
                    if (!chosenIntent) chosenIntent = possibleIntents[0]; // Fallback
                    break;
                case 'reactive_pattern': // Prioritize first conditional, otherwise cycle non-conditional base pattern
                    const conditionalMove = possibleIntents.find(i => i.condition);
                    if (conditionalMove) { chosenIntent = conditionalMove; }
                    else { const nonConditional = possibleIntents.filter(i => !i.condition); if (nonConditional.length > 0) { chosenIntent = nonConditional[this.intentCycleIndex % nonConditional.length]; this.intentCycleIndex++; } else { chosenIntent = possibleIntents[0]; if (!chosenIntent) chosenIntent = {type:'none', description:'Calculating...'}; } }
                    break;
                 case 'phase_shift': // Simple random within phase
                      chosenIntent = possibleIntents[Math.floor(Math.random() * possibleIntents.length)];
                      break;
                 case 'support_cycle': // Prioritize buffs/debuffs, less attack
                 case 'support_passive': // Similar logic, passive handled elsewhere
                     const supportMoves = possibleIntents.filter(i => i.type === 'buff' || i.type === 'debuff' || i.type === 'block' || i.type === 'special');
                     const attackMoves = possibleIntents.filter(i => i.type === 'attack' || i.type === 'multi_attack');
                     if (supportMoves.length > 0 && (attackMoves.length === 0 || Math.random() < 0.75)) { // 75% chance to use support if available
                         chosenIntent = supportMoves[Math.floor(Math.random() * supportMoves.length)];
                     } else if (attackMoves.length > 0) {
                         chosenIntent = attackMoves[Math.floor(Math.random() * attackMoves.length)];
                     } else { chosenIntent = possibleIntents[0]; } // Fallback
                     break;
                 case 'boss_pattern_reactive': // Cycle pattern, check reactive
                 case 'boss_summoner_pattern': // Specific patterns
                 case 'boss_phase_hp': // Phase logic handled above, choose within phase
                     // Use pattern index specific to the boss/phase if needed
                     let patternIndex = this.internalCounters.patternIndex || 0;
                     chosenIntent = possibleIntents.find(i => i.pattern === patternIndex); // Find specific pattern move
                     if (!chosenIntent) { // Fallback if pattern move missing/invalid
                          chosenIntent = possibleIntents[Math.floor(Math.random() * possibleIntents.length)];
                          console.warn(`${this.name} missing intent for pattern index ${patternIndex}, choosing randomly.`);
                     }
                     this.internalCounters.patternIndex = (patternIndex + 1) % phaseIntentions.filter(i => i.pattern !== undefined).length; // Cycle pattern index (needs adjustment if patterns aren't sequential 0,1,2...)
                     // Check reactive moves *after* selecting pattern move - can override
                     const reactiveMove = possibleIntents.find(i => i.condition);
                     if (reactiveMove && (!chosenIntent || (reactiveMove.weight || 1) > (chosenIntent.weight || 1))) { // Allow reactive to override if condition met (and optionally higher weight)
                         chosenIntent = reactiveMove;
                         console.log(`${this.name} using reactive move: ${chosenIntent.description}`);
                     }
                     break;

                default: console.warn(`Unknown AI behavior '${this.aiBehavior}' for ${this.name}. Using first possible.`); chosenIntent = possibleIntents[0];
            }
        }
        // Reset reactive flags AFTER choosing intent for next turn
        this.wasDamagedLastTurn = false; this.wasDamagedUnblockedLastTurn = false; this.playerTookDamageLastTurn = false; this.playerHealedLastTurn = false;
        this.currentIntent = chosenIntent;
    }

    /** Executes the enemy's planned action. */
    executeTurn(player, gameState) {
        // ... (Keep existing executeTurn logic, including Stun check and start/end tickStatusEffects) ...
         if (!this.currentIntent || this.currentHp <= 0 || !player) { if (this.currentHp <= 0) this.determineNextIntent(player); return; } this.playerRef = player; if (this.hasStatus('Stunned')) { console.log(`${this.name} is Stunned! Turn skipped.`); this.removeStatus('Stunned'); this.tickStatusEffects('start', player); this.tickStatusEffects('end', player); this.determineNextIntent(player); gameState?.uiManager?.updateCombatUI(player, gameState.combatManager.enemies, false); return; }
         this.tickStatusEffects('start', player); if (this.currentHp <= 0) { this.determineNextIntent(player); return; }
         const intent = this.currentIntent; let baseValue = intent.baseValue || 0; let modifiedValue;
         try { switch (intent.type) { case 'attack': modifiedValue = this.applyModifiers('damageDealt', baseValue); player.takeDamage(modifiedValue, this.enemyType); if (intent.status && player.currentHp > 0) player.applyStatus(intent.status, intent.statusDuration || 1, 1, this.enemyType); break; case 'multi_attack': const count = intent.count || 1; modifiedValue = this.applyModifiers('damageDealt', baseValue); for(let i = 0; i < count && player.currentHp > 0; i++) { player.takeDamage(modifiedValue, this.enemyType); } if (intent.status && intent.applyStatusOnce && player.currentHp > 0) { player.applyStatus(intent.status, intent.statusDuration || 1, 1, this.enemyType); } break; case 'block': this.gainBlock(this.applyModifiers('blockGain', baseValue)); break; case 'attack_block': const attackVal = this.applyModifiers('damageDealt', intent.attackValue || 0); if (player.currentHp > 0) player.takeDamage(attackVal, this.enemyType); const blockVal = this.applyModifiers('blockGain', intent.blockValue || 0); this.gainBlock(blockVal); break; case 'debuff': if (intent.status && intent.target === 'player' && player.currentHp > 0) { player.applyStatus(intent.status, intent.duration || 1, intent.amount || 1, this.enemyType); } else if (intent.target !== 'player') { console.warn(`Enemy ${this.name} tried to debuff non-player target:`, intent); } break; case 'buff': if (intent.status) { const target = intent.target === 'ally' || intent.target === 'ally_lowest_hp' || intent.target === 'self_and_allies' ? this.findAllyTarget(intent.target, gameState?.combatManager?.enemies) : this; if(target) { if(Array.isArray(target)) { target.forEach(t => t.applyStatus(intent.status, intent.duration || 1, intent.amount || 1, this.enemyType));} else { target.applyStatus(intent.status, intent.duration || 1, intent.amount || 1, this.enemyType); } } } break; case 'power_up': if (intent.status) this.applyStatus(intent.status, intent.duration || 99, intent.amount || 1, this.enemyType); break; case 'special': this.executeSpecialAbility(intent.id, player, gameState); break; case 'none': console.log(`${this.name} is ${intent.description || 'doing nothing'}.`); break; default: console.warn(`Unknown intent type executed by ${this.name}: ${intent.type}`); } } catch (error) { console.error(`Error executing intent for ${this.name} (Intent: ${JSON.stringify(intent)}):`, error); }
         this.tickStatusEffects('end', player); if (this.currentHp <= 0) { this.determineNextIntent(player); return; } this.determineNextIntent(player);
    }

    /** Handles custom special ability logic from template. */
     executeSpecialAbility(abilityId, player, gameState) { /* ... Keep existing ... */ if (!abilityId) { console.warn(`${this.name} tried to execute special ability with no ID.`); return; } if (this.specialAbilities && typeof this.specialAbilities[abilityId] === 'function') { try { this.specialAbilities[abilityId](this, player, gameState); } catch (error) { console.error(`Error executing special ability '${abilityId}' for ${this.name}:`, error); } } else { console.warn(`Undefined or non-function special ability ID: ${abilityId} for ${this.name}`); } }

    /** Applies damage to the enemy, considering block, statuses, resistances/weaknesses. (Checks passives) */
    takeDamage(amount, damageSourceElement = null) {
        if (this.currentHp <= 0 || amount <= 0) return 0;
        let modifiedAmount = amount;

        // Apply passives BEFORE block/reduction if they modify incoming damage
        this.checkPassives('onTakingDamage', { amount: modifiedAmount, sourceElement: damageSourceElement }); // Example trigger point

        if (this.hasStatus('Intangible')) { modifiedAmount = Math.max(1, modifiedAmount > 0 ? 1 : 0); }
        if (this.hasStatus('Vulnerable')) { modifiedAmount = Math.floor(modifiedAmount * 1.5); }
        if (damageSourceElement) { /* ... elemental mods ... */ const weakMult = this.weaknesses[damageSourceElement] || 1.0; const resMult = this.resistances[damageSourceElement] || 1.0; const combinedMult = weakMult * resMult; if (combinedMult !== 1.0) { modifiedAmount = Math.floor(modifiedAmount * combinedMult); } }
        modifiedAmount = Math.max(0, modifiedAmount);
        if (modifiedAmount <= 0) { return 0; }

        const blockConsumed = Math.min(this.currentBlock, modifiedAmount);
        const damageAfterBlock = modifiedAmount - blockConsumed;
        const hpLost = Math.min(this.currentHp, damageAfterBlock); // Track actual HP lost

        // Set flags for AI conditions
        this.wasDamagedLastTurn = true;
        if (damageAfterBlock > 0) { this.wasDamagedUnblockedLastTurn = true; }

        if (blockConsumed > 0) this.currentBlock -= blockConsumed;
        if (damageAfterBlock > 0) this.currentHp -= damageAfterBlock;

        // Trigger passives AFTER damage is applied
        if (hpLost > 0) {
             this.checkPassives('onDamaged', { amount: hpLost, sourceElement: damageSourceElement });
        }

        if (this.currentHp <= 0) { /* ... handle death ... */ this.currentHp = 0; this.currentIntent = null; this.activeStatusEffects = []; console.log(`${this.name} defeated!`); }
        return damageAfterBlock;
    }

    /** Adds block to the enemy, considering statuses. */
    gainBlock(amount) { /* ... Keep existing ... */ if (amount <= 0) return; const modifiedAmount = this.applyModifiers('blockGain', amount); if (modifiedAmount <= 0) return; this.currentBlock += modifiedAmount; }

    /** Applies status effects. */
    applyStatus(statusId, duration, amount = 1, source = null) { /* ... Keep existing ... */ if (!statusId) return; const persistentStack = ['Strength', 'Dexterity', 'Metallicize', 'Thorns', 'Poison']; if (duration <= 0 && amount <= 0 && !persistentStack.includes(statusId)) return; if (statusId === 'Poison' && amount <= 0) return; const existing = this.activeStatusEffects.find(s => s.id === statusId); if (existing) { if (persistentStack.includes(statusId) || ['Regen'].includes(statusId)) { existing.amount = (existing.amount || 0) + amount; } if (existing.duration !== 99) { existing.duration = Math.max(existing.duration, duration); } console.log(`${this.name} refreshed/stacked ${statusId}.`); } else { let initialAmount = (persistentStack.includes(statusId) || ['Regen'].includes(statusId)) ? amount : 1; if (initialAmount <= 0 && statusId === 'Poison') return; if (initialAmount <= 0 && duration <= 0 && !persistentStack.includes(statusId)) return; this.activeStatusEffects.push({ id: statusId, duration: duration, source: source || 'Unknown', amount: initialAmount }); console.log(`${this.name} applied ${statusId}.`); } }
    /** Removes a status effect. */
    removeStatus(statusId) { /* ... Keep existing ... */ const initialLength = this.activeStatusEffects.length; this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId); return this.activeStatusEffects.length < initialLength; }
    /** Checks for a status. */
    hasStatus(statusId) { /* ... Keep existing ... */ return this.activeStatusEffects.some(s => s.id === statusId); }
    /** Gets status amount. */
    getStatusAmount(statusId) { /* ... Keep existing ... */ const s = this.activeStatusEffects.find(st => st.id === statusId); return s ? (s.amount || (s.duration > 0 ? 1 : 0)) : 0; }
    /** Processes status effect ticks. */
    tickStatusEffects(phase, player) { /* ... Keep existing tickStatusEffects logic ... */ const effectsToRemove = []; const statusesAtStartOfTick = [...this.activeStatusEffects]; statusesAtStartOfTick.forEach(effect => { if (!this.activeStatusEffects.includes(effect)) return; let removeAfterTick = false; if (phase === 'start') { switch(effect.id) { case 'Poison': if (effect.amount > 0) { this.takeDamage(effect.amount, 'Poison'); effect.amount--; if (effect.amount <= 0) removeAfterTick = true; } else { removeAfterTick = true; } break; case 'Burn': if (effect.amount > 0) { this.takeDamage(effect.amount, 'Burn'); } break; } } if (phase === 'end') { switch(effect.id) { case 'Regen': if (effect.amount > 0) { this.heal(effect.amount); } break; case 'Metallicize': if (effect.amount > 0) { this.gainBlock(effect.amount); } break; case 'Intangible': removeAfterTick = true; break; } const isPassiveOrInfinite = ['Strength', 'Dexterity', 'Metallicize', 'Thorns'].includes(effect.id) || effect.duration === 99; const tickDuration = !isPassiveOrInfinite && effect.id !== 'Poison'; if (tickDuration) { effect.duration--; if (effect.duration <= 0 && !effectsToRemove.includes(effect.id)) { removeAfterTick = true; } } } if (removeAfterTick && !effectsToRemove.includes(effect.id)) { effectsToRemove.push(effect.id); } }); if (effectsToRemove.length > 0) { this.activeStatusEffects = this.activeStatusEffects.filter(e => !effectsToRemove.includes(e.id)); } }
    /** Heals the enemy. */
    heal(amount) { /* ... Keep existing ... */ if (amount <= 0 || this.currentHp <= 0 || this.currentHp >= this.maxHp) return 0; const actualHeal = Math.min(amount, this.maxHp - this.currentHp); this.currentHp += actualHeal; return actualHeal; }
    /** Applies damage/block modifiers based on statuses. */
    applyModifiers(modifierType, baseValue) { /* ... Keep existing ... */ let modifiedValue = baseValue; switch(modifierType) { case 'damageDealt': if (this.hasStatus('Weak')) modifiedValue = Math.floor(modifiedValue * 0.75); if (this.hasStatus('Strength')) modifiedValue += this.getStatusAmount('Strength'); break; case 'blockGain': if (this.hasStatus('Dexterity')) modifiedValue += this.getStatusAmount('Dexterity'); if (this.hasStatus('Frail')) modifiedValue = Math.floor(modifiedValue * 0.75); break; } return Math.max(0, Math.floor(modifiedValue)); }

    /** Checks and executes passive abilities. */
    checkPassives(trigger, eventData = {}) {
        if (!this.passives || this.passives.length === 0) return;

        this.passives.forEach(passive => {
            if (passive.trigger === trigger) {
                // Check condition
                let conditionMet = true; // Assume true if no condition
                if (passive.condition) {
                     switch(passive.condition) {
                         case 'hpAbove50': conditionMet = this.currentHp > this.maxHp * 0.5; break;
                         case 'hpBelow50': conditionMet = this.currentHp < this.maxHp * 0.5; break;
                         // Add more passive conditions
                         default: console.warn(`Unknown passive condition: ${passive.condition}`);
                     }
                }

                // Execute effect if condition met
                if (conditionMet) {
                     console.log(`${this.name} passive triggered: ${passive.trigger}`);
                     try {
                          if (passive.effect?.type === 'applyStatusToPlayer' && this.playerRef) {
                              this.playerRef.applyStatus(passive.effect.status, passive.effect.duration || 1, passive.effect.amount || 1, `${this.enemyType}_Passive`);
                          }
                          // Add more passive effect types
                     } catch (error) {
                          console.error(`Error executing passive for ${this.name}:`, error, passive);
                     }
                }
            }
        });
    }

    /** Finds ally targets for buffs/effects. */
    findAllyTarget(targetType, allEnemies = []) {
        const allies = allEnemies.filter(e => e.id !== this.id && e.currentHp > 0);
        if (allies.length === 0) return null; // No allies or no living allies

        switch(targetType) {
            case 'ally': // Target one random living ally
                 return allies[Math.floor(Math.random() * allies.length)];
            case 'ally_lowest_hp': // Target the living ally with the lowest current HP
                 return allies.sort((a, b) => a.currentHp - b.currentHp)[0];
            case 'self_and_allies': // Target self and all living allies
                 return [this, ...allies];
            default:
                 return this; // Default to self if target type is unclear
        }
    }


    /** Cleans up temporary statuses at end of combat. */
    cleanupCombatStatuses() { /* ... Keep existing ... */ const initialLength = this.activeStatusEffects.length; this.activeStatusEffects = this.activeStatusEffects.filter(effect => { const persist = [/*'PermanentEnemyCurse'*/].includes(effect.id); return persist; }); }

} // End of Enemy class
