// js/combat/Enemy.js

// Import status definitions if needed for lookups (optional, as mechanics are internal)
// import { getStatusEffectDefinition } from './StatusEffects.js';

/**
 * Enemy Templates - Defines the base stats, behaviors, and abilities of enemies.
 */
export const ENEMY_TEMPLATES = {

    // --- Floor 1 Enemies ---
    'doubt_whisper': {
        name: "Whispering Doubt", maxHp: 28, // Slightly higher HP
        sprite: 'assets/images/enemies/doubt_whisper.png',
        intentions: [
            { type: 'attack', baseValue: 5, description: "Niggle" }, // Slightly stronger base attack
            { type: 'debuff', status: 'Weak', duration: 1, target: 'player', description: "Sow Weakness (-Weak)" },
            { type: 'attack', baseValue: 6, description: "Questioning Jab" },
            { type: 'debuff', status: 'Frail', duration: 1, target: 'player', description: "Undermine Confidence (-Frail)" },
        ],
        resistances: { Psychological: 0.75 }, // Resists mental attacks
        weaknesses: { Cognitive: 1.25 }, // Vulnerable to logic/focus
        aiBehavior: 'random_intent', // Simple random behavior
        keywords: ['Mental', 'Debuff'],
    },
    'fleeting_desire': {
        name: "Fleeting Desire", maxHp: 32,
        sprite: 'assets/images/enemies/fleeting_desire.png',
        intentions: [
            { type: 'attack', baseValue: 7, description: "Sudden Urge" },
            { type: 'buff', status: 'Dexterity', duration: 99, amount: 1, description: "Become Evasive (+1 Dex)" }, // Buff lasts
            { type: 'attack', baseValue: 6, description: "Distracting Glance" },
            { type: 'special', id: 'fade_away', description: "Become Intangible (1 Turn)" },
        ],
        resistances: { Attraction: 0.5 }, // Hard to influence directly
        weaknesses: { Relational: 1.5 }, // Vulnerable to connection?
        aiBehavior: 'random_weighted', // Example: more likely to attack? (Needs weighting logic)
        specialAbilities: {
            fade_away: (self, player, gameState) => self.applyStatus('Intangible', 1, 1, self.enemyType) // Apply Intangible for 1 turn
        },
        keywords: ['Evasive', 'Buff', 'Temporal'],
    },
     'anxious_tremor': { // NEW Floor 1 Enemy
        name: "Anxious Tremor", maxHp: 38,
        sprite: 'assets/images/enemies/anxious_tremor.png',
        intentions: [ // Sequential: Block, Attack, Block, Multi-Attack, Debuff
            { type: 'block', baseValue: 6, description: "Defensive Twitch" },
            { type: 'attack', baseValue: 6, description: "Nervous Strike" },
            { type: 'block', baseValue: 6, description: "Defensive Twitch" },
            { type: 'multi_attack', count: 3, baseValue: 2, description: "Flurry of Worry (3x2)"},
            { type: 'debuff', status: 'Vulnerable', duration: 1, target: 'player', description: "Expose Fear (-Vuln)" },
        ],
        resistances: { Sensory: 0.8 }, // Less affected by raw sensation? Harder to distract?
        weaknesses: { Psychological: 1.3 }, // Vulnerable to calming/assurance?
        aiBehavior: 'sequential_intent', // Follows the pattern
        keywords: ['Defensive', 'Anxiety', 'Debuff'],
    },

    // --- Floor 1 Elite ---
    'rigid_perfectionism': {
        name: "Rigid Perfectionism", maxHp: 70, // Increased HP
        sprite: 'assets/images/enemies/perfectionism.png',
        intentions: [
            { type: 'block', baseValue: 12, description: "Reinforce Standards" },
            { type: 'attack', baseValue: 10, description: "Critical Strike" }, // Increased damage
            { type: 'attack_block', attackValue: 7, blockValue: 7, description: "Measured Assault (7 Atk, 7 Blk)" },
            // Reactive Intention: Only uses if took unblocked damage last turn
            { type: 'power_up', status: 'Strength', duration: 99, amount: 1, condition: 'wasDamagedUnblockedLastTurn', description: "Punish Imperfection (+1 Str)" },
            // Reactive Intention: Only uses if player has significant block
            { type: 'debuff', status: 'Frail', duration: 1, target: 'player', condition: 'playerHasHighBlock', description: "Critique Defense (-Frail)" }
        ],
         resistances: { Interaction: 0.75, Cognitive: 0.8 }, // Resists social/mental manipulation
         weaknesses: { Psychological: 1.25 }, // Vulnerable to emotional approaches?
         aiBehavior: 'reactive_pattern', // Prioritizes conditional moves, otherwise cycles basics
         keywords: ['Elite', 'Defensive', 'Reactive', 'Punisher'],
    },

    // --- Floor 2 Enemies ---
    'inner_critic': {
        name: "Inner Critic", maxHp: 50, // Increased HP
        sprite: 'assets/images/enemies/inner_critic.png',
        intentions: [
             { type: 'multi_attack', baseValue: 4, count: 2, description: "Harsh Words (2x4)" }, // Slightly higher damage
             { type: 'debuff', status: 'Vulnerable', duration: 2, target: 'player', description: "Expose Flaw (-Vuln)" },
             { type: 'attack', baseValue: 8, status: 'Weak', statusDuration: 1, applyStatusOnce: true, description: "Belittle (-Weak, 8 Atk)" }, // Clarified desc
             { type: 'block', baseValue: 9, description: "Defensive Rationalization" },
        ],
        resistances: { Psychological: 0.6 }, // Highly resistant to direct mental influence
        weaknesses: { Sensory: 1.25, Interaction: 1.25 }, // Vulnerable to physical grounding or direct interaction
        aiBehavior: 'random_weighted', // Prefers debuffs/attacks? (Needs weighting)
        keywords: ['Debuff', 'Mental', 'Defense'],
    },
    'unmet_need': {
         name: "Unmet Need (Craving)", maxHp: 60, // Increased HP
         sprite: 'assets/images/enemies/unmet_need.png',
         intentions: [
              { type: 'attack', baseValue: 10, description: "Lashing Out" }, // Increased damage
              { type: 'special', id: 'drain_focus', amount: 1, description: "Drain Focus (1)" }, // Special ability
              { type: 'power_up', status: 'Strength', duration: 99, amount: 1, condition: 'hpBelow50', description: "Grow Desperate (+1 Str)" }, // Reactive based on HP
              { type: 'debuff', status: 'Entangle', duration: 1, target: 'player', amount: 1, description: "Cling (+1 Card Cost)" }, // Applies Entangle status
         ],
         resistances: {},
         weaknesses: { Psychological: 1.5, Relational: 1.25 }, // Very vulnerable to connection/validation
         aiBehavior: 'reactive_pattern', // Prioritizes HP-based powerup
         specialAbilities: {
             // Player needs spendFocus method, Enemy needs heal method
             drain_focus: (self, player, gameState) => {
                if (player?.currentFocus > 0) {
                    const amount = self.currentIntent?.amount || 1;
                    player.spendFocus(amount);
                    self.heal(amount * 2); // Heal more than drained?
                    console.log(`${self.name} drained ${amount} Focus and healed.`);
                    // Optional: Trigger UI update for player focus
                    player.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(player);
                }
            }
         },
         keywords: ['Reactive', 'Debuff', 'ResourceDrain'],
    },
     'resentment_globule': { // NEW Floor 2 Enemy
        name: "Resentment Globule", maxHp: 65, // Decent HP
        sprite: 'assets/images/enemies/resentment_globule.png',
        intentions: [ // Sequential: Block, Attack, Poison, Attack
            { type: 'block', baseValue: 10, description: "Harden Grudge" },
            { type: 'attack', baseValue: 8, description: "Bitter Lash" },
            { type: 'special', id: 'fester', description: "Fester (Apply 3 Poison)"}, // Applies stacking poison
            { type: 'attack', baseValue: 8, description: "Bitter Lash" },
        ],
        resistances: { Psychological: 0.8, Sensory: 0.8 }, // Hard to affect emotionally or physically initially
        weaknesses: { Interaction: 1.25 }, // Vulnerable to direct interaction/confrontation?
        aiBehavior: 'sequential_intent',
        specialAbilities: {
             fester: (self, player, gameState) => {
                 if (player) {
                    player.applyStatus('Poison', 99, 3, self.enemyType); // Apply 3 Poison stacks
                    console.log(`${self.name} applied Poison to the player.`);
                 }
             }
        },
        keywords: ['Poison', 'DamageOverTime', 'Defensive'],
    },

     // --- Floor 2 Elite ---
     'compulsive_habit': {
         name: "Compulsive Habit", maxHp: 90, // Increased HP
         sprite: 'assets/images/enemies/compulsive_habit.png',
         intentions: [ // Sequential Cycle: Attack, Block, Multi-Attack, Power-Up
             { type: 'attack', baseValue: 7, description: "Recurring Thought (7 Atk)" },
             { type: 'block', baseValue: 8, description: "Routine Defense" }, // Slightly more block
             { type: 'multi_attack', baseValue: 3, count: 3, description: "Rapid Fixation (3x3)" },
             { type: 'special', id: 'cycle_strength', description: "Strengthens Cycle (+Str)" } // Gains strength over time
         ],
         resistances: { Cognitive: 0.7 }, // Hard to break the pattern with thought alone
         weaknesses: { Interaction: 1.3, Psychological: 1.1 }, // Vulnerable to interruption or addressing root cause
         aiBehavior: 'sequential_cycle_powerup', // Cycles intents, powers up on special ability
         internalCounters: { cycleStrengthBonus: 0 }, // Tracks its strength gain
         specialAbilities: {
              cycle_strength: (self, player, gameState) => {
                  self.internalCounters.cycleStrengthBonus = (self.internalCounters.cycleStrengthBonus || 0) + 1;
                  self.applyStatus('Strength', 99, self.internalCounters.cycleStrengthBonus, self.enemyType);
                  console.log(`${self.name} strengthens its cycle! (+${self.internalCounters.cycleStrengthBonus} Str total)`);
              }
         },
         keywords: ['Elite', 'Scaling', 'Pattern'],
     },

    // --- Floor 3 Enemies ---
     'despair_echo': { // NEW Floor 3 Enemy
        name: "Despair Echo", maxHp: 80, // Tanky
        sprite: 'assets/images/enemies/despair_echo.png',
        intentions: [ // Weighted random, favors debuffs/heavy hits
            { type: 'debuff', status: 'Weak', duration: 2, target: 'player', description: "Sap Strength (-Weak)" },
            { type: 'attack', baseValue: 14, description: "Heavy Blow" }, // Hits hard
            { type: 'debuff', status: 'Frail', duration: 2, target: 'player', description: "Induce Brittleness (-Frail)" },
            { type: 'block', baseValue: 15, description: "Numbness" }, // High block occasionally
            { type: 'attack', baseValue: 14, description: "Heavy Blow" },
        ],
        resistances: { Psychological: 0.5 }, // Very hard to affect emotionally
        weaknesses: { Sensory: 1.4 }, // Strong sensation breaks through?
        aiBehavior: 'random_weighted', // Favors debuffs/attacks (Needs weighting)
        keywords: ['Tanky', 'Debuff', 'HighDamage'],
    },

     // --- Floor 3 Elite ---
    'fragmented_identity': { // NEW Floor 3 Elite - Simplified Phase Shift
         name: "Fragmented Identity", maxHp: 110, // High HP pool
         sprite: 'assets/images/enemies/fragment_1.png', // TODO: Needs phase-specific art handling?
         // Simplified: Shifts between Aggressive and Defensive modes
         intentions: [
             // Aggressive Phase
             { phase: 'Aggressive', type: 'multi_attack', count: 2, baseValue: 8, description: "Assertive Flurry (2x8)" },
             { phase: 'Aggressive', type: 'attack', baseValue: 12, status: 'Vulnerable', statusDuration: 1, target: 'player', description: "Exposing Strike (12 Atk, -Vuln)" },
             { phase: 'Aggressive', type: 'special', id: 'shift_phase', targetPhase: 'Defensive', description: "Shift Aspect (-> Defensive)" },
             // Defensive Phase
             { phase: 'Defensive', type: 'block', baseValue: 18, description: "Yielding Guard" }, // High block
             { phase: 'Defensive', type: 'debuff', status: 'Weak', duration: 2, target: 'player', description: "Defensive Murmur (-Weak)" },
             { phase: 'Defensive', type: 'special', id: 'shift_phase', targetPhase: 'Aggressive', description: "Shift Aspect (-> Aggressive)" },
         ],
         resistances: { Interaction: 0.8 }, // Base resistance
         weaknesses: { Cognitive: 1.2 }, // Base weakness (hard to predict)
         aiBehavior: 'phase_shift', // Custom AI needed
         currentPhase: 'Aggressive', // Starts aggressive
         specialAbilities: {
             shift_phase: (self, player, gameState) => {
                 const targetPhase = self.currentIntent?.targetPhase || 'Aggressive'; // Get target phase from intent
                 self.currentPhase = targetPhase;
                 console.log(`${self.name} shifts aspect to ${targetPhase}!`);
                 // Clear intent immediately to re-evaluate based on new phase
                 self.currentIntent = null;
                 self.determineNextIntent(player);
                 // Optional: Change sprite/appearance via UI
                 // gameState?.uiManager?.updateEnemyAppearance(self.id, targetPhase);
             }
         },
         keywords: ['Elite', 'PhaseShift', 'Unpredictable'],
    },

    // --- Bosses ---
     // Example structure - Requires specific boss mechanics designed
    'shadow_aspect_interaction': {
        name: "Shadow Aspect (Interaction)", maxHp: 150,
        sprite: 'assets/images/enemies/shadow_aspect_interaction.png', // Placeholder
        intentions: [ /* More complex pattern */
            { type: 'attack', baseValue: 15, description: "Dominating Blow" },
            { type: 'special', id: 'command_ally', description: "Command Ally (?)" }, // Needs minions or other mechanics
            { type: 'debuff', status: 'Entangle', duration: 1, amount: 2, target: 'player', description: "Binding Words (+2 Cost)" },
            { type: 'block', baseValue: 20, description: "Imposing Stance" },
            { type: 'multi_attack', count: 3, baseValue: 6, description: "Flurry of Control (3x6)" },
        ],
        resistances: { Interaction: 0.5, Psychological: 0.7 }, // Resistant to its own domain
        weaknesses: { Sensory: 1.2, Relational: 1.2 }, // Grounding or connection bypasses control?
        aiBehavior: 'boss_pattern_1', // Needs custom AI
        onDeathAction: { type: 'reward', insight: 30, artifactId: 'commanders_presence_i' }, // Example boss drop
        keywords: ['Boss', 'Control', 'Debuff', 'HighDamage'],
        // Add specialAbilities for unique boss mechanics
    }
    // Add other boss templates...
};


/**
 * Represents an enemy combatant.
 */
export class Enemy {
    constructor(enemyId, instanceId) {
        const template = ENEMY_TEMPLATES[enemyId];
        if (!template) {
            console.error(`Enemy Error: Template not found for ID: ${enemyId}`);
            // Create a fallback enemy? For now, return null or throw error
            throw new Error(`Invalid enemy template ID: ${enemyId}`);
            // Or return a minimal error object if preferred:
            // return { id: `enemy_error_${instanceId}`, name: "Missing Enemy", currentHp: 0, maxHp: 1, ... };
        }

        this.id = `enemy_${enemyId}_${instanceId}`; // Unique instance ID
        this.enemyType = enemyId; // Template ID
        this.name = template.name;
        this.maxHp = template.maxHp;
        this.currentHp = template.maxHp;
        this.sprite = template.sprite;

        // Deep copy intentions to prevent modifications affecting the template
        this.intentions = JSON.parse(JSON.stringify(template.intentions));
        this.currentIntent = null;
        this.currentBlock = 0;
        this.activeStatusEffects = []; // { id, duration, amount, source }

        this.resistances = { ...(template.resistances || {}) };
        this.weaknesses = { ...(template.weaknesses || {}) };
        this.aiBehavior = template.aiBehavior || 'sequential_intent'; // Default AI
        this.intentCycleIndex = 0; // For sequential AI behaviors

        // Copy unique template data
        this.onDeathAction = template.onDeathAction ? { ...template.onDeathAction } : null;
        this.specialAbilities = template.specialAbilities || {};
        this.internalCounters = template.internalCounters ? JSON.parse(JSON.stringify(template.internalCounters)) : {};
        this.currentPhase = template.currentPhase || null; // For phase-shifting enemies

        // Runtime state flags
        this.wasDamagedLastTurn = false;
        this.wasDamagedUnblockedLastTurn = false;
        this.playerRef = null; // Reference to the player instance

        this.determineNextIntent(); // Determine initial intent immediately
    }

    /** Determines the enemy's action for the upcoming turn based on AI behavior and conditions. */
    determineNextIntent(player = null) {
        if (this.currentHp <= 0) {
            this.currentIntent = null; // No intent if dead
            return;
        }
        this.playerRef = player || this.playerRef; // Update reference if provided

        // Reset block unless specified by the *previous* intent (e.g., retain block intent)
        if (!this.currentIntent?.keepsBlock) {
            this.currentBlock = 0;
        }

        // Filter intentions based on current phase (if applicable)
        let phaseIntentions = this.intentions;
        if (this.currentPhase) {
             phaseIntentions = this.intentions.filter(intent => !intent.phase || intent.phase === this.currentPhase);
             if (phaseIntentions.length === 0) { // Fallback if no intentions match phase
                  console.warn(`Enemy ${this.name} has no intentions for current phase: ${this.currentPhase}. Using full list.`);
                  phaseIntentions = this.intentions;
             }
        }

        // Filter based on conditions
        const possibleIntents = phaseIntentions.filter(intent => {
             if (!intent.condition) return true; // No condition = always possible (within phase)

             // Evaluate known conditions
             switch(intent.condition) {
                 case 'wasDamagedLastTurn': return this.wasDamagedLastTurn;
                 case 'wasDamagedUnblockedLastTurn': return this.wasDamagedUnblockedLastTurn;
                 case 'hpBelow50': return this.currentHp < this.maxHp * 0.5;
                 case 'hpBelow30': return this.currentHp < this.maxHp * 0.3; // Example new condition
                 case 'hpAbove75': return this.currentHp > this.maxHp * 0.75;
                 case 'playerHasHighBlock': return this.playerRef && this.playerRef.currentBlock >= 10; // Example threshold
                 case 'playerHasDebuff': // Example: Check if player has ANY common debuff
                      return this.playerRef && this.playerRef.activeStatusEffects.some(s => ['Weak', 'Vulnerable', 'Frail', 'Poison', 'Burn'].includes(s.id));
                 case 'selfHasDebuff':
                     return this.activeStatusEffects.some(s => ['Weak', 'Vulnerable', 'Frail'].includes(s.id));
                 // Add more conditions...
                 default: console.warn(`Unknown intent condition for ${this.name}: ${intent.condition}`); return true; // Default true if condition unknown
             }
        });

        let chosenIntent = null;
        if (possibleIntents.length === 0) {
             // Fallback: Find first non-conditional intent from the current phase list (or full list)
             chosenIntent = phaseIntentions.find(i => !i.condition) || this.intentions.find(i => !i.condition);
             // If STILL none, use a default 'hesitate' action
              if (!chosenIntent) chosenIntent = {type:'none', description:'Hesitating...'};
              console.warn(`${this.name} had no valid possible intents. Fallback: ${chosenIntent.description}`);
        } else {
            // Apply AI behavior to possible intents
            switch (this.aiBehavior) {
                case 'sequential_intent':
                case 'sequential_cycle_powerup': // Simple sequential cycle through possibles
                    chosenIntent = possibleIntents[this.intentCycleIndex % possibleIntents.length];
                    this.intentCycleIndex++;
                    break;
                case 'random_intent': // Pure random choice from possibles
                    chosenIntent = possibleIntents[Math.floor(Math.random() * possibleIntents.length)];
                    break;
                case 'random_weighted': // NEEDS WEIGHTS on intentions[] for proper implementation
                    // Simple random fallback for now
                    chosenIntent = possibleIntents[Math.floor(Math.random() * possibleIntents.length)];
                    console.warn(`AI behavior 'random_weighted' not fully implemented for ${this.name}. Using random.`);
                    break;
                case 'reactive_pattern':
                    // Prioritize the first conditional move found
                    const conditionalMove = possibleIntents.find(i => i.condition);
                    if (conditionalMove) {
                        chosenIntent = conditionalMove;
                    } else {
                        // Cycle through non-conditional moves if no reaction needed
                        const nonConditional = possibleIntents.filter(i => !i.condition);
                        if (nonConditional.length > 0) {
                            chosenIntent = nonConditional[this.intentCycleIndex % nonConditional.length];
                            this.intentCycleIndex++; // Only advance base pattern index when using non-conditional
                        } else {
                            chosenIntent = possibleIntents[0]; // Fallback if only conditional moves were possible but none met
                             if (!chosenIntent) chosenIntent = {type:'none', description:'Calculating...'};
                        }
                    }
                    break;
                 case 'phase_shift': // Logic specific to Fragmented Identity (uses intents filtered by phase)
                     // Choose randomly from the possible intents for the current phase
                      chosenIntent = possibleIntents[Math.floor(Math.random() * possibleIntents.length)];
                      // The actual phase shift happens via the special ability intent
                     break;
                 case 'boss_pattern_1': // Needs specific implementation
                     console.warn(`AI behavior 'boss_pattern_1' not implemented for ${this.name}. Using sequential.`);
                     chosenIntent = possibleIntents[this.intentCycleIndex % possibleIntents.length];
                     this.intentCycleIndex++;
                     break;
                default: // Default to first possible intent
                    console.warn(`Unknown AI behavior '${this.aiBehavior}' for ${this.name}. Using first possible.`);
                    chosenIntent = possibleIntents[0];
            }
        }

        // Reset flags AFTER choosing intent for next turn
        this.wasDamagedLastTurn = false;
        this.wasDamagedUnblockedLastTurn = false;

        this.currentIntent = chosenIntent;
        // UI update is handled by CombatManager/CombatUI after calling this
    }

    /** Executes the enemy's planned action for the *current* turn. */
    executeTurn(player, gameState) {
        if (!this.currentIntent || this.currentHp <= 0 || !player) {
             if (this.currentHp <= 0) this.determineNextIntent(player); // Ensure intent clears on death if somehow missed
             return;
        }
        this.playerRef = player; // Ensure reference is fresh

        // Check for Stun BEFORE ticking effects
        if (this.hasStatus('Stunned')) {
            console.log(`${this.name} is Stunned! Turn skipped.`);
            this.removeStatus('Stunned'); // Remove stun after skipping
            // Tick effects AFTER removing stun, so durations decrease
            this.tickStatusEffects('start', player);
            this.tickStatusEffects('end', player);
            this.determineNextIntent(player); // Determine next intent
            gameState?.uiManager?.updateCombatUI(player, gameState.combatManager.enemies, false); // Update UI to show stun gone
            return;
        }

        // console.log(`${this.name} executing: ${this.currentIntent.description || this.currentIntent.type}`); // Noisy
        this.tickStatusEffects('start', player); // Tick start effects FIRST

        // Re-check if alive after start-of-turn effects (like Poison)
        if (this.currentHp <= 0) {
             this.determineNextIntent(player);
             return;
        }

        const intent = this.currentIntent;
        let baseValue = intent.baseValue || 0;
        let modifiedValue; // Calculated inside switch where needed

        try { // Execute action based on intent type
            switch (intent.type) {
                case 'attack':
                    modifiedValue = this.applyModifiers('damageDealt', baseValue);
                    player.takeDamage(modifiedValue, this.enemyType);
                    if (intent.status && player.currentHp > 0) player.applyStatus(intent.status, intent.statusDuration || 1, 1, this.enemyType);
                    break;
                case 'multi_attack':
                    const count = intent.count || 1;
                    modifiedValue = this.applyModifiers('damageDealt', baseValue); // Calculate base damage once
                    for(let i = 0; i < count && player.currentHp > 0; i++) { // Check player HP each hit
                        player.takeDamage(modifiedValue, this.enemyType);
                    }
                    // Apply status only once after all hits, if player is alive
                    if (intent.status && intent.applyStatusOnce && player.currentHp > 0) {
                        player.applyStatus(intent.status, intent.statusDuration || 1, 1, this.enemyType);
                    }
                    break;
                case 'block':
                    this.gainBlock(this.applyModifiers('blockGain', baseValue));
                    break;
                case 'attack_block':
                    // Attack first, then block
                    const attackVal = this.applyModifiers('damageDealt', intent.attackValue || 0);
                    if (player.currentHp > 0) player.takeDamage(attackVal, this.enemyType);
                    const blockVal = this.applyModifiers('blockGain', intent.blockValue || 0);
                    this.gainBlock(blockVal);
                    break;
                case 'debuff':
                    if (intent.status && intent.target === 'player' && player.currentHp > 0) {
                        player.applyStatus(intent.status, intent.duration || 1, intent.amount || 1, this.enemyType);
                    } else if (intent.target !== 'player') {
                        console.warn(`Enemy ${this.name} tried to debuff non-player target:`, intent);
                    }
                    break;
                case 'buff': // Target self
                    if (intent.status) this.applyStatus(intent.status, intent.duration || 1, intent.amount || 1, this.enemyType);
                    break;
                case 'power_up': // Target self, usually permanent duration
                    if (intent.status) this.applyStatus(intent.status, intent.duration || 99, intent.amount || 1, this.enemyType);
                    break;
                 case 'special':
                    this.executeSpecialAbility(intent.id, player, gameState);
                    break;
                 case 'none': // Do nothing (e.g., Hesitating)
                    console.log(`${this.name} is ${intent.description || 'doing nothing'}.`);
                    break;
                default:
                    console.warn(`Unknown intent type executed by ${this.name}: ${intent.type}`);
            }
        } catch (error) {
            console.error(`Error executing intent for ${this.name} (Intent: ${JSON.stringify(intent)}):`, error);
        }

        this.tickStatusEffects('end', player); // Tick end effects AFTER action

         // Check if alive after end-of-turn effects
         if (this.currentHp <= 0) {
              this.determineNextIntent(player);
              return;
         }

        this.determineNextIntent(player); // Determine NEXT intent LAST
    }

    /** Handles custom special ability logic from template. */
     executeSpecialAbility(abilityId, player, gameState) {
         if (!abilityId) { console.warn(`${this.name} tried to execute special ability with no ID.`); return; }

         if (this.specialAbilities && typeof this.specialAbilities[abilityId] === 'function') {
             // console.log(`${this.name} using special: ${abilityId}`); // Noisy
             try {
                 this.specialAbilities[abilityId](this, player, gameState);
             } catch (error) {
                 console.error(`Error executing special ability '${abilityId}' for ${this.name}:`, error);
             }
         } else {
             // Fallback for simple hardcoded specials if needed, though template is preferred
             console.warn(`Undefined or non-function special ability ID: ${abilityId} for ${this.name}`);
             // switch (abilityId) {
             //     case 'mind_twist': if(player) { player.applyStatus('Confusion', 1, 1, this.enemyType); player.applyStatus('Frail', 1, 1, this.enemyType); } break;
             //     default: console.warn(`Unknown or undefined special ability ID: ${abilityId} for ${this.name}`);
             // }
         }
     }

    /** Applies damage to the enemy, considering block, statuses, resistances/weaknesses. */
    takeDamage(amount, damageSourceElement = null) {
        if (this.currentHp <= 0) return 0; // Already dead
        if (amount <= 0) return 0; // No damage dealt

        let modifiedAmount = amount;

        // Apply Intangible first (reduces damage to 1)
        if (this.hasStatus('Intangible')) {
            modifiedAmount = Math.max(1, modifiedAmount > 0 ? 1 : 0);
        }

        // Apply Vulnerable (takes MORE damage)
        if (this.hasStatus('Vulnerable')) {
            modifiedAmount = Math.floor(modifiedAmount * 1.5);
        }

        // Apply elemental resistances/weaknesses
        if (damageSourceElement) {
            const weakMult = this.weaknesses[damageSourceElement] || 1.0;
            const resMult = this.resistances[damageSourceElement] || 1.0;
            const combinedMult = weakMult * resMult;
            if (combinedMult !== 1.0) {
                modifiedAmount = Math.floor(modifiedAmount * combinedMult);
                // console.log(`${this.name} elemental mod applied (${damageSourceElement}): ${combinedMult.toFixed(2)}x`); // Noisy
            }
        }

        // Ensure damage is at least 0 after modifications
        modifiedAmount = Math.max(0, modifiedAmount);
        if (modifiedAmount <= 0) { return 0; } // No damage after modifications

        const blockConsumed = Math.min(this.currentBlock, modifiedAmount);
        const damageAfterBlock = modifiedAmount - blockConsumed;

        // Set flags for AI conditions (BEFORE HP changes)
        this.wasDamagedLastTurn = true;
        if (damageAfterBlock > 0) {
            this.wasDamagedUnblockedLastTurn = true;
        }

        // Apply damage/block reduction
        if (blockConsumed > 0) this.currentBlock -= blockConsumed;
        if (damageAfterBlock > 0) this.currentHp -= damageAfterBlock;

        // console.log(`${this.name} took ${damageAfterBlock} damage (${blockConsumed} blocked). HP: ${this.currentHp}/${this.maxHp}`); // Slightly less noisy

        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.currentIntent = null; // Clear intent on death
            this.activeStatusEffects = []; // Clear statuses on death
            console.log(`${this.name} defeated!`);
        }
        return damageAfterBlock; // Return actual HP damage dealt
    }

    /** Adds block to the enemy, considering statuses. */
    gainBlock(amount) {
         if (amount <= 0) return;
         const modifiedAmount = this.applyModifiers('blockGain', amount);
         if (modifiedAmount <= 0) return;
         this.currentBlock += modifiedAmount;
         // console.log(`${this.name} gained ${modifiedAmount} Block.`); // Noisy
    }

     // --- Status Effects ---
     applyStatus(statusId, duration, amount = 1, source = null) { // Source can be element, enemyType, 'Artifact' etc.
        let effectiveDuration = duration;
        let effectiveAmount = amount;

         // TODO: Apply resistances/weaknesses to STATUS effects?
         // Example: Resistance to Psychological might reduce duration/amount of Weak/Frail
         // if (source && this.resistances[source]) {
         //     const mult = this.resistances[source];
         //     effectiveDuration = Math.max(0, Math.floor(duration * mult));
         //     effectiveAmount = Math.max(0, Math.floor(amount * mult));
         //     if (effectiveDuration < duration || effectiveAmount < amount) console.log(`${this.name} resistance reduced ${statusId}.`);
         // }
         // NOTE: Status resistance is complex, omitting for now for simplicity.

         // Don't apply if duration and amount are zero or less, unless it's a persistent stack like Str/Dex
         const persistentStack = ['Strength', 'Dexterity', 'Metallicize', 'Thorns', 'Poison']; // Poison needs amount > 0
         if (effectiveDuration <= 0 && effectiveAmount <= 0 && !persistentStack.includes(statusId)) {
            return;
         }
         if (statusId === 'Poison' && effectiveAmount <= 0) return; // Don't add 0 poison

        const existing = this.activeStatusEffects.find(s => s.id === statusId);
        if (existing) {
            // Stacking logic for amount-based statuses
            if (persistentStack.includes(statusId) || ['Regen'].includes(statusId)) {
                 existing.amount = (existing.amount || 0) + effectiveAmount;
            }
            // Duration refresh/overwrite (usually take the max duration)
             if (existing.duration !== 99) { // Don't overwrite permanent duration
                  existing.duration = Math.max(existing.duration, effectiveDuration);
             }
             console.log(`${this.name} refreshed/stacked ${statusId}. New amount: ${existing.amount}, New duration: ${existing.duration}`);
        } else {
            // Ensure initial amount is valid for the type
             let initialAmount = (persistentStack.includes(statusId) || ['Regen'].includes(statusId)) ? effectiveAmount : 1;
              // Don't add if initial amount is invalid (e.g. 0 poison)
              if (initialAmount <= 0 && statusId === 'Poison') return;
              if (initialAmount <= 0 && effectiveDuration <= 0 && !persistentStack.includes(statusId)) return; // Avoid adding useless statuses

             this.activeStatusEffects.push({
                 id: statusId,
                 duration: effectiveDuration,
                 source: source || 'Unknown', // Track source if provided
                 amount: initialAmount
             });
             console.log(`${this.name} applied ${statusId}. Amount: ${initialAmount}, Duration: ${effectiveDuration}`);
        }
         // Update UI externally if needed
     }

     removeStatus(statusId) {
         const initialLength = this.activeStatusEffects.length;
         this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId);
         // Update UI externally if needed
          return this.activeStatusEffects.length < initialLength; // Return true if removed
     }

     hasStatus(statusId) {
         return this.activeStatusEffects.some(s => s.id === statusId);
     }

     getStatusAmount(statusId) {
         const s = this.activeStatusEffects.find(st => st.id === statusId);
         // Amount is primary for stacking effects, fallback to 1 if duration exists > 0
         return s ? (s.amount || (s.duration > 0 ? 1 : 0)) : 0;
     }

     /** Process status effects at start or end of turn. */
     tickStatusEffects(phase, player) { // phase = 'start' or 'end'
        const effectsToRemove = [];
        // Iterate over a copy in case effects modify the array during iteration (e.g., removing stun)
        const statusesAtStartOfTick = [...this.activeStatusEffects];

        statusesAtStartOfTick.forEach(effect => {
            // Skip if effect was removed by another effect during this tick
            if (!this.activeStatusEffects.includes(effect)) return;

            let removeAfterTick = false;

            // --- Start of Turn Effects ---
             if (phase === 'start') {
                 switch(effect.id) {
                     case 'Poison':
                         if (effect.amount > 0) {
                             console.log(`${this.name} taking ${effect.amount} Poison damage.`);
                             this.takeDamage(effect.amount, 'Poison'); // Take damage
                             effect.amount--; // Decrease stacks AFTER taking damage
                             if (effect.amount <= 0) {
                                  removeAfterTick = true; // Remove if stacks depleted
                                  console.log(`${this.name}'s Poison wore off.`);
                             }
                         } else { removeAfterTick = true; } // Remove if somehow amount is 0
                         break;
                     case 'Burn': // Takes damage, duration ticks down at end
                         if (effect.amount > 0) {
                             console.log(`${this.name} taking ${effect.amount} Burn damage.`);
                             this.takeDamage(effect.amount, 'Burn');
                         }
                         break;
                     // Add other start-of-turn effects here
                 }
             }

             // --- End of Turn Effects & Duration Ticking ---
             if (phase === 'end') {
                  switch(effect.id) {
                     case 'Regen':
                         if (effect.amount > 0) {
                             console.log(`${this.name} regenerating ${effect.amount} HP.`);
                             this.heal(effect.amount);
                         }
                         break;
                     case 'Metallicize':
                         if (effect.amount > 0) {
                             console.log(`${this.name} gaining ${effect.amount} Block from Metallicize.`);
                             this.gainBlock(effect.amount);
                         }
                         break;
                     case 'Intangible':
                         removeAfterTick = true; // Intangible fades at end of turn
                          console.log(`${this.name}'s Intangible wore off.`);
                         break;
                     // Add other end-of-turn effects here
                 }

                 // --- Decrement Duration ---
                 const isPassiveOrInfinite = ['Strength', 'Dexterity', 'Metallicize', 'Thorns'].includes(effect.id) || effect.duration === 99;
                 // Poison duration is tied to its amount, not turns
                 const tickDuration = !isPassiveOrInfinite && effect.id !== 'Poison';

                 if (tickDuration) {
                     effect.duration--;
                     if (effect.duration <= 0) {
                          removeAfterTick = true;
                          console.log(`${this.name}'s ${effect.id} wore off (duration).`);
                     }
                 }
             } // End End Phase

             if (removeAfterTick && !effectsToRemove.includes(effect.id)) {
                 effectsToRemove.push(effect.id);
             }
        }); // End forEach effect

        // Remove expired effects
        if (effectsToRemove.length > 0) {
            this.activeStatusEffects = this.activeStatusEffects.filter(e => !effectsToRemove.includes(e.id));
            // Update UI externally if needed
        }
     }

     /** Heal the enemy */
     heal(amount) {
          if (amount <= 0 || this.currentHp <= 0 || this.currentHp >= this.maxHp) return 0;
          const actualHeal = Math.min(amount, this.maxHp - this.currentHp);
          this.currentHp += actualHeal;
          // console.log(`${this.name} healed ${actualHeal} HP.`); // Noisy
           return actualHeal; // Return amount healed
      }

    // --- Modifiers ---
     applyModifiers(modifierType, baseValue) {
         let modifiedValue = baseValue;

         switch(modifierType) {
            case 'damageDealt':
                if (this.hasStatus('Weak')) modifiedValue = Math.floor(modifiedValue * 0.75);
                if (this.hasStatus('Strength')) modifiedValue += this.getStatusAmount('Strength');
                break;
            case 'blockGain':
                if (this.hasStatus('Dexterity')) modifiedValue += this.getStatusAmount('Dexterity');
                if (this.hasStatus('Frail')) modifiedValue = Math.floor(modifiedValue * 0.75);
                break;
            // damageTaken mods handled in takeDamage method
         }
         // Apply other potential modifiers here...

         return Math.max(0, Math.floor(modifiedValue)); // Ensure non-negative integer
     }

     // --- End of Combat Cleanup ---
     /** Called by CombatManager or GameState when combat ends */
     cleanupCombatStatuses() {
         const initialLength = this.activeStatusEffects.length;
         this.activeStatusEffects = this.activeStatusEffects.filter(effect => {
              // Define statuses that persist between fights for enemies (usually none)
              const persist = [/*'PermanentEnemyCurse'*/].includes(effect.id);
              return persist;
         });
         // if(this.activeStatusEffects.length < initialLength) console.log(`${this.name} cleaned up temporary statuses.`); // Noisy
     }

} // End of Enemy class
