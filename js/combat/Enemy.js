// js/combat/Enemy.js

// Import status definitions if needed for lookups or tooltip generation (using tooltip function is better)
import { getStatusEffectDefinition } from './StatusEffects.js';

/**
 * Enemy Templates - Defines the base stats, behaviors, and abilities of enemies.
 */
export const ENEMY_TEMPLATES = {

    // --- Floor 1 Enemies ---
    'doubt_whisper': {
        name: "Whispering Doubt", maxHp: 28,
        sprite: 'assets/images/enemies/doubt_whisper.png',
        intentions: [
            { type: 'attack', baseValue: 5, description: "Niggle" },
            { type: 'debuff', status: 'Weak', duration: 1, target: 'player', description: "Sow Weakness (-Weak)" },
            { type: 'attack', baseValue: 6, description: "Questioning Jab" },
            { type: 'debuff', status: 'Frail', duration: 1, target: 'player', description: "Undermine Confidence (-Frail)" },
        ],
        resistances: { Psychological: 0.75 },
        weaknesses: { Cognitive: 1.25 },
        aiBehavior: 'random_intent',
        keywords: ['Mental', 'Debuff'],
    },
    'fleeting_desire': {
        name: "Fleeting Desire", maxHp: 32,
        sprite: 'assets/images/enemies/fleeting_desire.png',
        intentions: [
            { type: 'attack', baseValue: 7, description: "Sudden Urge" },
            { type: 'buff', status: 'Dexterity', duration: 99, amount: 1, description: "Become Evasive (+1 Dex)" },
            { type: 'attack', baseValue: 6, description: "Distracting Glance" },
            { type: 'special', id: 'fade_away', description: "Become Intangible (1 Turn)" },
        ],
        resistances: { Attraction: 0.5 },
        weaknesses: { Relational: 1.5 },
        aiBehavior: 'random_weighted',
        specialAbilities: {
            fade_away: (self, player, gameState) => self.applyStatus('Intangible', 1, 1, self.enemyType)
        },
        keywords: ['Evasive', 'Buff', 'Temporal'],
    },
     'anxious_tremor': {
        name: "Anxious Tremor", maxHp: 38,
        sprite: 'assets/images/enemies/anxious_tremor.png',
        intentions: [
            { type: 'block', baseValue: 6, description: "Defensive Twitch" },
            { type: 'attack', baseValue: 6, description: "Nervous Strike" },
            { type: 'block', baseValue: 6, description: "Defensive Twitch" },
            { type: 'multi_attack', count: 3, baseValue: 2, description: "Flurry of Worry (3x2)"},
            { type: 'debuff', status: 'Vulnerable', duration: 1, target: 'player', description: "Expose Fear (-Vuln)" },
        ],
        resistances: { Sensory: 0.8 },
        weaknesses: { Psychological: 1.3 },
        aiBehavior: 'sequential_intent',
        keywords: ['Defensive', 'Anxiety', 'Debuff'],
    },

    // --- Floor 1 Elite ---
    'rigid_perfectionism': {
        name: "Rigid Perfectionism", maxHp: 70,
        sprite: 'assets/images/enemies/perfectionism.png',
        intentions: [
            { type: 'block', baseValue: 12, description: "Reinforce Standards" },
            { type: 'attack', baseValue: 10, description: "Critical Strike" },
            { type: 'attack_block', attackValue: 7, blockValue: 7, description: "Measured Assault (7 Atk, 7 Blk)" },
            { type: 'power_up', status: 'Strength', duration: 99, amount: 1, condition: 'wasDamagedUnblockedLastTurn', description: "Punish Imperfection (+1 Str)" },
            { type: 'debuff', status: 'Frail', duration: 1, target: 'player', condition: 'playerHasHighBlock', description: "Critique Defense (-Frail)" }
        ],
         resistances: { Interaction: 0.75, Cognitive: 0.8 },
         weaknesses: { Psychological: 1.25 },
         aiBehavior: 'reactive_pattern',
         keywords: ['Elite', 'Defensive', 'Reactive', 'Punisher'],
    },

    // --- Floor 2 Enemies ---
    'inner_critic': {
        name: "Inner Critic", maxHp: 50,
        sprite: 'assets/images/enemies/inner_critic.png',
        intentions: [
             { type: 'multi_attack', baseValue: 4, count: 2, description: "Harsh Words (2x4)" },
             { type: 'debuff', status: 'Vulnerable', duration: 2, target: 'player', description: "Expose Flaw (-Vuln)" },
             { type: 'attack', baseValue: 8, status: 'Weak', statusDuration: 1, applyStatusOnce: true, description: "Belittle (-Weak, 8 Atk)" },
             { type: 'block', baseValue: 9, description: "Defensive Rationalization" },
        ],
        resistances: { Psychological: 0.6 },
        weaknesses: { Sensory: 1.25, Interaction: 1.25 },
        aiBehavior: 'random_weighted',
        keywords: ['Debuff', 'Mental', 'Defense'],
    },
    'unmet_need': {
         name: "Unmet Need (Craving)", maxHp: 60,
         sprite: 'assets/images/enemies/unmet_need.png',
         intentions: [
              { type: 'attack', baseValue: 10, description: "Lashing Out" },
              { type: 'special', id: 'drain_focus', amount: 1, description: "Drain Focus (1)" },
              { type: 'power_up', status: 'Strength', duration: 99, amount: 1, condition: 'hpBelow50', description: "Grow Desperate (+1 Str)" },
              { type: 'debuff', status: 'Entangle', duration: 1, target: 'player', amount: 1, description: "Cling (+1 Card Cost)" },
         ],
         resistances: {},
         weaknesses: { Psychological: 1.5, Relational: 1.25 },
         aiBehavior: 'reactive_pattern',
         specialAbilities: {
             drain_focus: (self, player, gameState) => {
                if (player?.currentFocus > 0) {
                    const amount = self.currentIntent?.amount || 1;
                    player.spendFocus(amount); // Triggers UI update in Player
                    self.heal(amount * 2); // Triggers heal floating number/UI update in Enemy
                    console.log(`${self.name} drained ${amount} Focus and healed.`);
                }
            }
         },
         keywords: ['Reactive', 'Debuff', 'ResourceDrain'],
    },
     'resentment_globule': {
        name: "Resentment Globule", maxHp: 65,
        sprite: 'assets/images/enemies/resentment_globule.png',
        intentions: [
            { type: 'block', baseValue: 10, description: "Harden Grudge" },
            { type: 'attack', baseValue: 8, description: "Bitter Lash" },
            { type: 'special', id: 'fester', description: "Fester (Apply 3 Poison)"},
            { type: 'attack', baseValue: 8, description: "Bitter Lash" },
        ],
        resistances: { Psychological: 0.8, Sensory: 0.8 },
        weaknesses: { Interaction: 1.25 },
        aiBehavior: 'sequential_intent',
        specialAbilities: {
             fester: (self, player, gameState) => {
                 if (player) {
                    player.applyStatus('Poison', 99, 3, self.enemyType); // Triggers player UI update
                    console.log(`${self.name} applied Poison to the player.`);
                 }
             }
        },
        keywords: ['Poison', 'DamageOverTime', 'Defensive'],
    },

     // --- Floor 2 Elite ---
     'compulsive_habit': {
         name: "Compulsive Habit", maxHp: 90,
         sprite: 'assets/images/enemies/compulsive_habit.png',
         intentions: [
             { type: 'attack', baseValue: 7, description: "Recurring Thought (7 Atk)" },
             { type: 'block', baseValue: 8, description: "Routine Defense" },
             { type: 'multi_attack', baseValue: 3, count: 3, description: "Rapid Fixation (3x3)" },
             { type: 'special', id: 'cycle_strength', description: "Strengthens Cycle (+Str)" }
         ],
         resistances: { Cognitive: 0.7 },
         weaknesses: { Interaction: 1.3, Psychological: 1.1 },
         aiBehavior: 'sequential_cycle_powerup',
         internalCounters: { cycleStrengthBonus: 0 },
         specialAbilities: {
              cycle_strength: (self, player, gameState) => {
                  self.internalCounters.cycleStrengthBonus = (self.internalCounters.cycleStrengthBonus || 0) + 1;
                  // Apply status which triggers UI update
                  self.applyStatus('Strength', 99, self.internalCounters.cycleStrengthBonus, self.enemyType);
                  console.log(`${self.name} strengthens its cycle! (+${self.internalCounters.cycleStrengthBonus} Str total)`);
              }
         },
         keywords: ['Elite', 'Scaling', 'Pattern'],
     },

    // --- Floor 3 Enemies ---
     'despair_echo': {
        name: "Despair Echo", maxHp: 80,
        sprite: 'assets/images/enemies/despair_echo.png',
        intentions: [
            { type: 'debuff', status: 'Weak', duration: 2, target: 'player', description: "Sap Strength (-Weak)" },
            { type: 'attack', baseValue: 14, description: "Heavy Blow" },
            { type: 'debuff', status: 'Frail', duration: 2, target: 'player', description: "Induce Brittleness (-Frail)" },
            { type: 'block', baseValue: 15, description: "Numbness" },
            { type: 'attack', baseValue: 14, description: "Heavy Blow" },
        ],
        resistances: { Psychological: 0.5 },
        weaknesses: { Sensory: 1.4 },
        aiBehavior: 'random_weighted',
        keywords: ['Tanky', 'Debuff', 'HighDamage'],
    },

     // --- Floor 3 Elite ---
    'fragmented_identity': {
         name: "Fragmented Identity", maxHp: 110,
         sprite: 'assets/images/enemies/fragment_1.png',
         intentions: [
             // Aggressive Phase
             { phase: 'Aggressive', type: 'multi_attack', count: 2, baseValue: 8, description: "Assertive Flurry (2x8)" },
             { phase: 'Aggressive', type: 'attack', baseValue: 12, status: 'Vulnerable', statusDuration: 1, target: 'player', description: "Exposing Strike (12 Atk, -Vuln)" },
             { phase: 'Aggressive', type: 'special', id: 'shift_phase', targetPhase: 'Defensive', description: "Shift Aspect (-> Defensive)" },
             // Defensive Phase
             { phase: 'Defensive', type: 'block', baseValue: 18, description: "Yielding Guard" },
             { phase: 'Defensive', type: 'debuff', status: 'Weak', duration: 2, target: 'player', description: "Defensive Murmur (-Weak)" },
             { phase: 'Defensive', type: 'special', id: 'shift_phase', targetPhase: 'Aggressive', description: "Shift Aspect (-> Aggressive)" },
         ],
         resistances: { Interaction: 0.8 },
         weaknesses: { Cognitive: 1.2 },
         aiBehavior: 'phase_shift',
         currentPhase: 'Aggressive',
         specialAbilities: {
             shift_phase: (self, player, gameState) => {
                 const targetPhase = self.currentIntent?.targetPhase || 'Aggressive';
                 self.currentPhase = targetPhase;
                 console.log(`${self.name} shifts aspect to ${targetPhase}!`);
                 self.currentIntent = null; // Clear intent to force re-evaluation
                 self.determineNextIntent(player); // Determine new intent immediately
                 // --- Trigger UI Update ---
                 gameState?.uiManager?.updateCombatUI(player, gameState.combatManager.enemies, false);
                 // -----------------------
                 // Optional: Change sprite/appearance via UI
                 // gameState?.uiManager?.updateEnemyAppearance(self.id, targetPhase);
             }
         },
         keywords: ['Elite', 'PhaseShift', 'Unpredictable'],
    },

    // --- Bosses ---
    'shadow_aspect_interaction': {
        name: "Shadow Aspect (Interaction)", maxHp: 150,
        sprite: 'assets/images/enemies/shadow_aspect_interaction.png',
        intentions: [
            { type: 'attack', baseValue: 15, description: "Dominating Blow" },
            { type: 'special', id: 'command_ally', description: "Command Ally (?)" }, // Placeholder
            { type: 'debuff', status: 'Entangle', duration: 1, amount: 2, target: 'player', description: "Binding Words (+2 Cost)" },
            { type: 'block', baseValue: 20, description: "Imposing Stance" },
            { type: 'multi_attack', count: 3, baseValue: 6, description: "Flurry of Control (3x6)" },
        ],
        resistances: { Interaction: 0.5, Psychological: 0.7 },
        weaknesses: { Sensory: 1.2, Relational: 1.2 },
        aiBehavior: 'boss_pattern_1',
        specialAbilities: { // Placeholder
            command_ally: (self, player, gameState) => { console.log(`${self.name} uses Command Ally (Not Implemented)`); }
        },
        onDeathAction: { type: 'reward', insight: 30, artifactId: 'commanders_presence_i' },
        keywords: ['Boss', 'Control', 'Debuff', 'HighDamage'],
    }
};


/**
 * Represents an enemy combatant.
 */
export class Enemy {
    constructor(enemyId, instanceId) {
        const template = ENEMY_TEMPLATES[enemyId];
        if (!template) {
            console.error(`Enemy Error: Template not found for ID: ${enemyId}`);
            throw new Error(`Invalid enemy template ID: ${enemyId}`);
        }

        this.id = `enemy_${enemyId}_${instanceId}`;
        this.enemyType = enemyId;
        this.name = template.name;
        this.maxHp = template.maxHp;
        this.currentHp = template.maxHp;
        this.sprite = template.sprite;

        this.intentions = JSON.parse(JSON.stringify(template.intentions));
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
        this.currentPhase = template.currentPhase || null;

        this.wasDamagedLastTurn = false;
        this.wasDamagedUnblockedLastTurn = false;
        this.playerRef = null; // Reference set by determineNextIntent/executeTurn
        this.gameStateRef = null; // Reference set by executeTurn for UI calls

        this.determineNextIntent();
    }

    /** Determines the enemy's action for the upcoming turn. */
    determineNextIntent(player = null) {
        if (this.currentHp <= 0) {
            this.currentIntent = null; return;
        }
        this.playerRef = player || this.playerRef;

        // Reset block (unless kept by specific intent logic - not implemented here)
        this.currentBlock = 0;

        // Filter intentions based on current phase (if applicable)
        let phaseIntentions = this.intentions;
        if (this.currentPhase) {
             phaseIntentions = this.intentions.filter(intent => !intent.phase || intent.phase === this.currentPhase);
             if (phaseIntentions.length === 0) { console.warn(`${this.name}: No intentions for phase ${this.currentPhase}. Using all.`); phaseIntentions = this.intentions; }
        }

        // Filter based on conditions
        const possibleIntents = phaseIntentions.filter(intent => {
             if (!intent.condition) return true;
             switch(intent.condition) {
                 case 'wasDamagedLastTurn': return this.wasDamagedLastTurn;
                 case 'wasDamagedUnblockedLastTurn': return this.wasDamagedUnblockedLastTurn;
                 case 'hpBelow50': return this.currentHp < this.maxHp * 0.5;
                 case 'hpBelow30': return this.currentHp < this.maxHp * 0.3;
                 case 'hpAbove75': return this.currentHp > this.maxHp * 0.75;
                 case 'playerHasHighBlock': return this.playerRef && this.playerRef.currentBlock >= 10;
                 case 'playerHasDebuff': return this.playerRef && this.playerRef.activeStatusEffects.some(s => ['Weak', 'Vulnerable', 'Frail', 'Poison', 'Burn'].includes(s.id));
                 case 'selfHasDebuff': return this.activeStatusEffects.some(s => ['Weak', 'Vulnerable', 'Frail'].includes(s.id));
                 default: console.warn(`Unknown intent condition for ${this.name}: ${intent.condition}`); return true;
             }
        });

        let chosenIntent = null;
        if (possibleIntents.length === 0) {
             chosenIntent = phaseIntentions.find(i => !i.condition) || this.intentions.find(i => !i.condition);
             if (!chosenIntent) chosenIntent = {type:'none', description:'Hesitating...'};
             console.warn(`${this.name} had no valid intents. Fallback: ${chosenIntent.description}`);
        } else {
             chosenIntent = this._selectIntentFromPossibles(possibleIntents); // Use helper for AI logic
        }

        // Reset flags AFTER choosing intent for next turn
        this.wasDamagedLastTurn = false;
        this.wasDamagedUnblockedLastTurn = false;

        this.currentIntent = chosenIntent;
        // UI update happens in CombatManager after all enemies determine intents
    }

    /** Helper function to select intent based on AI behavior */
    _selectIntentFromPossibles(possibleIntents) {
        let chosenIntent = null;
        switch (this.aiBehavior) {
            case 'sequential_intent':
            case 'sequential_cycle_powerup':
                chosenIntent = possibleIntents[this.intentCycleIndex % possibleIntents.length];
                this.intentCycleIndex++;
                break;
            case 'random_intent':
                chosenIntent = possibleIntents[Math.floor(Math.random() * possibleIntents.length)];
                break;
            case 'random_weighted':
                // Simple random fallback until weights added
                chosenIntent = possibleIntents[Math.floor(Math.random() * possibleIntents.length)];
                // console.warn(`AI behavior 'random_weighted' not fully implemented for ${this.name}. Using random.`);
                break;
            case 'reactive_pattern':
                const conditionalMove = possibleIntents.find(i => i.condition);
                if (conditionalMove) { chosenIntent = conditionalMove; }
                else {
                    const nonConditional = possibleIntents.filter(i => !i.condition);
                    if (nonConditional.length > 0) {
                        chosenIntent = nonConditional[this.intentCycleIndex % nonConditional.length];
                        this.intentCycleIndex++;
                    } else {
                         chosenIntent = possibleIntents[0] || {type:'none', description:'Stuck...'};
                    }
                }
                break;
             case 'phase_shift':
                  chosenIntent = possibleIntents[Math.floor(Math.random() * possibleIntents.length)];
                 break;
             case 'boss_pattern_1':
                 console.warn(`AI behavior 'boss_pattern_1' not implemented for ${this.name}. Using sequential.`);
                 chosenIntent = possibleIntents[this.intentCycleIndex % possibleIntents.length];
                 this.intentCycleIndex++;
                 break;
            default:
                console.warn(`Unknown AI behavior '${this.aiBehavior}' for ${this.name}. Using first possible.`);
                chosenIntent = possibleIntents[0];
        }
        return chosenIntent || {type:'none', description:'Calculating...'}; // Ensure return value
    }


    /** Executes the enemy's planned action for the *current* turn. */
    executeTurn(player, gameState) {
        this.playerRef = player; // Ensure reference is fresh
        this.gameStateRef = gameState; // Store reference for UI calls

        if (!this.currentIntent || this.currentHp <= 0 || !player) {
             if (this.currentHp <= 0) this.determineNextIntent(player);
             return;
        }

        // Check for Stun BEFORE ticking effects
        if (this.hasStatus('Stunned')) {
            console.log(`${this.name} is Stunned! Turn skipped.`);
            this.removeStatus('Stunned'); // Triggers UI update
            // Tick effects AFTER removing stun, so durations decrease
            this.tickStatusEffects('start', player);
            this.tickStatusEffects('end', player);
            this.determineNextIntent(player);
            // No need for extra UI update here, removeStatus and tickStatusEffects handle it
            return;
        }

        this.tickStatusEffects('start', player); // Tick start effects (Poison etc.)

        // Re-check if alive after start-of-turn effects
        if (this.currentHp <= 0) { this.determineNextIntent(player); return; }

        const intent = this.currentIntent;
        let baseValue = intent.baseValue || 0;
        let modifiedValue;

        try {
            switch (intent.type) {
                case 'attack':
                    modifiedValue = this.applyModifiers('damageDealt', baseValue);
                    // Player takes damage, handles its own floating number/UI
                    player.takeDamage(modifiedValue, this.enemyType);
                    if (intent.status && player.currentHp > 0) player.applyStatus(intent.status, intent.statusDuration || 1, 1, this.enemyType);
                    break;
                case 'multi_attack':
                    const count = intent.count || 1;
                    modifiedValue = this.applyModifiers('damageDealt', baseValue);
                    for(let i = 0; i < count && player.currentHp > 0; i++) {
                        player.takeDamage(modifiedValue, this.enemyType);
                    }
                    if (intent.status && intent.applyStatusOnce && player.currentHp > 0) {
                        player.applyStatus(intent.status, intent.statusDuration || 1, 1, this.enemyType);
                    }
                    break;
                case 'block':
                    this.gainBlock(this.applyModifiers('blockGain', baseValue)); // gainBlock handles floating num/UI
                    break;
                case 'attack_block':
                    const attackVal = this.applyModifiers('damageDealt', intent.attackValue || 0);
                    if (player.currentHp > 0) player.takeDamage(attackVal, this.enemyType);
                    const blockVal = this.applyModifiers('blockGain', intent.blockValue || 0);
                    this.gainBlock(blockVal); // gainBlock handles floating num/UI
                    break;
                case 'debuff':
                    if (intent.status && intent.target === 'player' && player.currentHp > 0) {
                        player.applyStatus(intent.status, intent.duration || 1, intent.amount || 1, this.enemyType); // Player handles UI
                    }
                    break;
                case 'buff':
                case 'power_up':
                    if (intent.status) this.applyStatus(intent.status, intent.duration || (intent.type === 'power_up' ? 99 : 1), intent.amount || 1, this.enemyType); // applyStatus handles UI
                    break;
                 case 'special':
                    this.executeSpecialAbility(intent.id, player, gameState); // Special ability might update UI itself
                    break;
                 case 'none':
                    console.log(`${this.name} is ${intent.description || 'doing nothing'}.`);
                    break;
                default:
                    console.warn(`Unknown intent type executed by ${this.name}: ${intent.type}`);
            }
        } catch (error) { console.error(`Error executing intent for ${this.name} (Intent: ${JSON.stringify(intent)}):`, error); }

        this.tickStatusEffects('end', player); // Tick end effects

        // Determine NEXT intent AFTER all actions and end-of-turn effects
        // This allows the UI update in CombatManager to show the *next* intent correctly
        if (this.currentHp > 0) {
             this.determineNextIntent(player);
        } else {
            this.currentIntent = null; // Clear intent if died during end phase
        }
    }


    /** Handles custom special ability logic from template. */
     executeSpecialAbility(abilityId, player, gameState) {
         if (!abilityId) { console.warn(`${this.name} tried to execute special ability with no ID.`); return; }
         if (this.specialAbilities && typeof this.specialAbilities[abilityId] === 'function') {
             try { this.specialAbilities[abilityId](this, player, gameState); }
             catch (error) { console.error(`Error executing special ability '${abilityId}' for ${this.name}:`, error); }
         } else { console.warn(`Undefined or non-function special ability ID: ${abilityId} for ${this.name}`); }
     }

    /** Applies damage to the enemy, considering block, statuses, resistances/weaknesses, and showing floating numbers. */
    takeDamage(amount, damageSourceElement = null) {
        if (this.currentHp <= 0 || amount <= 0) return 0;

        const initialAmount = amount;
        let modifiedAmount = amount;
        let modifiersText = [];

        // Apply Intangible first
        if (this.hasStatus('Intangible')) {
            modifiedAmount = Math.max(1, modifiedAmount > 0 ? 1 : 0);
            modifiersText.push('Intangible!');
        }

        // Apply Vulnerable (takes MORE damage)
        if (this.hasStatus('Vulnerable')) {
            modifiedAmount = Math.floor(modifiedAmount * 1.5);
            modifiersText.push('x1.5 Vuln!');
        }

        // Apply elemental resistances/weaknesses
        let elementalMultiplier = 1.0;
        if (damageSourceElement) {
            const weakMult = this.weaknesses[damageSourceElement] || 1.0;
            const resMult = this.resistances[damageSourceElement] || 1.0;
            elementalMultiplier = weakMult * resMult;
            if (elementalMultiplier !== 1.0) {
                modifiedAmount = Math.floor(modifiedAmount * elementalMultiplier);
                modifiersText.push(`${elementalMultiplier.toFixed(1)}x ${damageSourceElement}`);
            }
        }

        modifiedAmount = Math.max(0, modifiedAmount);
        if (modifiedAmount <= 0) {
             // --- Floating Number (Negated) ---
              if (this.gameStateRef?.uiManager) {
                  const enemyElement = this.gameStateRef.uiManager.enemyArea?.querySelector(`.enemy-display[data-enemy-id="${this.id}"]`);
                  if(enemyElement) this.gameStateRef.uiManager.showFloatingNumber(enemyElement, `Negated!`, 'negate', modifiersText.join(', '));
              }
              // -----------------------------
              this.gameStateRef?.uiManager?.combatUI?.renderEnemies(this.gameStateRef.combatManager.enemies, this.gameStateRef.combatManager.playerTurn); // Update UI
              return 0;
        } // No damage after modifications

        const blockConsumed = Math.min(this.currentBlock, modifiedAmount);
        const damageAfterBlock = modifiedAmount - blockConsumed;

        // Set flags for AI conditions (BEFORE HP changes)
        this.wasDamagedLastTurn = true;
        if (damageAfterBlock > 0) this.wasDamagedUnblockedLastTurn = true;

        // --- Floating Number (Damage/Block) ---
         if (this.gameStateRef?.uiManager) {
             const enemyElement = this.gameStateRef.uiManager.enemyArea?.querySelector(`.enemy-display[data-enemy-id="${this.id}"]`);
             if (enemyElement) {
                 if (blockConsumed > 0) {
                     this.gameStateRef.uiManager.showFloatingNumber(enemyElement, `-${blockConsumed}`, 'blocked', `Blocked ${modifiedAmount}`);
                 }
                 if (damageAfterBlock > 0) {
                     this.gameStateRef.uiManager.showFloatingNumber(enemyElement, `-${damageAfterBlock}`, 'damage', modifiersText.join(', '));
                 }
             }
         }
         // ------------------------------------

        // Apply damage/block reduction
        if (blockConsumed > 0) this.currentBlock -= blockConsumed;
        if (damageAfterBlock > 0) this.currentHp -= damageAfterBlock;

        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.currentIntent = null;
            this.activeStatusEffects = [];
            console.log(`${this.name} defeated!`);
            // On death trigger handled by CombatManager check
        }

        // Update Enemy UI (HP Bar, Block)
        this.gameStateRef?.uiManager?.combatUI?.renderEnemies(this.gameStateRef.combatManager.enemies, this.gameStateRef.combatManager.playerTurn);

        // --- Milestone check for defeating enemy ---
         if(this.currentHp <= 0) {
              const debuffs = this.activeStatusEffects.filter(s => getStatusEffectDefinition(s.id)?.type === 'debuff').length;
              if(debuffs >= 3) {
                   this.gameStateRef?.triggerMilestoneAction('defeatEnemyWithDebuffs', debuffs);
              }
         }

        return damageAfterBlock; // Return actual HP damage dealt
    }


    /** Adds block to the enemy, considering statuses, and showing floating number. */
    gainBlock(amount) {
         if (amount <= 0) return;
         const modifiedAmount = this.applyModifiers('blockGain', amount);
         if (modifiedAmount <= 0) return;

         this.currentBlock += modifiedAmount;

         // --- Floating Number ---
          if (this.gameStateRef?.uiManager) {
             const enemyElement = this.gameStateRef.uiManager.enemyArea?.querySelector(`.enemy-display[data-enemy-id="${this.id}"]`);
              let modifiersText = [];
              if(this.hasStatus('Dexterity')) modifiersText.push(`+${this.getStatusAmount('Dexterity')} Dex`);
              // Frail doesn't usually affect enemy block gain, but include if logic changes
              // if(this.hasStatus('Frail')) modifiersText.push(`-25% Frail`);
              if(enemyElement) this.gameStateRef.uiManager.showFloatingNumber(enemyElement, `+${modifiedAmount}`, 'block', modifiersText.join(', '));
          }
          // ---------------------

         // Update Enemy UI (Block display)
         this.gameStateRef?.uiManager?.combatUI?.renderEnemies(this.gameStateRef.combatManager.enemies, this.gameStateRef.combatManager.playerTurn);
    }


     // --- Status Effects ---
     applyStatus(statusId, duration, amount = 1, source = null) {
         if (!statusId) { console.warn("Enemy.applyStatus: Null/undefined ID."); return; }

         const definition = getStatusEffectDefinition(statusId);
         const uiAffectingStatuses = ['Weak', 'Vulnerable', 'Frail', 'Strength', 'Dexterity', 'Entangle'];
         const canBeZero = uiAffectingStatuses.includes(statusId);

         if (!canBeZero && duration <= 0 && amount <= 0 && !['Strength', 'Dexterity'].includes(statusId)) return;

         const existing = this.activeStatusEffects.find(s => s.id === statusId);
         let statusAppliedOrUpdated = false;
         const sourceId = source?.id || (typeof source === 'string' ? source : 'Unknown');

         if (existing) {
             if (definition?.stacking) { existing.amount = (existing.amount || 0) + amount; }
             if (existing.duration !== 99) { existing.duration = Math.max(existing.duration, duration); }
             existing.source = sourceId;
             statusAppliedOrUpdated = true;
             console.log(`${this.name} status updated: ${statusId}. Amt: ${existing.amount}, Dur: ${existing.duration}`);
         } else {
             let initialAmount = definition?.stacking ? amount : 1;
             if (initialAmount <= 0 && duration <= 0 && !canBeZero) return;
             this.activeStatusEffects.push({ id: statusId, duration: duration, source: sourceId, amount: initialAmount });
             statusAppliedOrUpdated = true;
             console.log(`${this.name} applied status: ${statusId}. Amt: ${initialAmount}, Dur: ${duration}`);
         }

         if (statusAppliedOrUpdated) {
             // Update UI immediately
              this.gameStateRef?.uiManager?.combatUI?.renderEnemies(this.gameStateRef.combatManager.enemies, this.gameStateRef.combatManager.playerTurn);
             // Trigger artifacts listening for status application on enemy (if needed later)
             // this.gameStateRef?.player?.triggerArtifacts('onStatusAppliedToEnemy', { enemy: this, status: { id: statusId, duration, amount } });
         }
     }

     removeStatus(statusId) {
         const initialLength = this.activeStatusEffects.length;
         this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId);
         if (this.activeStatusEffects.length < initialLength) {
             console.log(`${this.name} status removed: ${statusId}`);
             // Update UI immediately
              this.gameStateRef?.uiManager?.combatUI?.renderEnemies(this.gameStateRef.combatManager.enemies, this.gameStateRef.combatManager.playerTurn);
             return true;
         }
         return false;
     }

     hasStatus(statusId) { return this.activeStatusEffects.some(s => s.id === statusId); }
     getStatusAmount(statusId) { const s = this.activeStatusEffects.find(st => st.id === statusId); return s ? (s.amount || (s.duration > 0 ? 1 : 0)) : 0; }

     /** Process status effects at start or end of turn. */
     tickStatusEffects(phase, player) {
        const effectsToRemove = [];
        const statusesAtStartOfTick = [...this.activeStatusEffects];
        let uiNeedsUpdate = false; // Flag if any visual status changed

        statusesAtStartOfTick.forEach(effect => {
            if (!this.activeStatusEffects.includes(effect)) return; // Skip if removed mid-tick
            let removeEffectAfterTick = false;
            const initialAmount = effect.amount;
            const initialDuration = effect.duration;

            // --- Start of Turn Effects ---
             if (phase === 'start') {
                 switch(effect.id) {
                     case 'Poison':
                         if (effect.amount > 0) {
                             console.log(`${this.name} taking ${effect.amount} Poison damage.`);
                             this.takeDamage(effect.amount, 'Poison'); // Handles floating num/UI
                             if (this.currentHp > 0 && this.activeStatusEffects.includes(effect)) { // Check if still alive/effect present
                                 effect.amount--;
                                 if (effect.amount <= 0) removeEffectAfterTick = true;
                             } else { removeEffectAfterTick = true; } // Died or removed by takeDamage trigger
                         } else { removeEffectAfterTick = true; }
                         break;
                     case 'Burn':
                         if (effect.amount > 0) {
                             console.log(`${this.name} taking ${effect.amount} Burn damage.`);
                             this.takeDamage(effect.amount, 'Burn'); // Handles floating num/UI
                         }
                         break;
                     // Add other enemy start-of-turn effects here
                 }
             } // --- End Start Phase ---

             // --- End of Turn Effects & Duration Ticking ---
             if (phase === 'end') {
                  switch(effect.id) {
                     case 'Regen': if (effect.amount > 0) this.heal(effect.amount); break; // Handles UI/floating
                     case 'Metallicize': if (effect.amount > 0) this.gainBlock(effect.amount); break; // Handles UI/floating
                     case 'Intangible': removeEffectAfterTick = true; break;
                     // Add other enemy end-of-turn effects here
                 }

                 // --- Decrement Duration ---
                 const definition = getStatusEffectDefinition(effect.id);
                 const tickDuration = definition?.durationBased && effect.duration !== 99 && effect.id !== 'Poison';
                 if (tickDuration && this.activeStatusEffects.includes(effect)) {
                     effect.duration--;
                     if (effect.duration <= 0) removeEffectAfterTick = true;
                 }
             } // --- End End Phase ---

             // Check if state changed for UI update
             if (effect.amount !== initialAmount || effect.duration !== initialDuration || removeEffectAfterTick) {
                 uiNeedsUpdate = true;
             }

             if (removeEffectAfterTick && !effectsToRemove.includes(effect.id)) {
                 effectsToRemove.push(effect.id);
             }
        }); // End forEach effect

        // Remove expired effects
        if (effectsToRemove.length > 0) {
            this.activeStatusEffects = this.activeStatusEffects.filter(e => !effectsToRemove.includes(e.id));
            uiNeedsUpdate = true; // Removal requires UI update
        }

        // Update UI once at the end if any status changed visually
        if (uiNeedsUpdate) {
            this.gameStateRef?.uiManager?.combatUI?.renderEnemies(this.gameStateRef.combatManager.enemies, this.gameStateRef.combatManager.playerTurn);
        }
     }

     /** Heal the enemy, showing floating number */
     heal(amount) {
          if (amount <= 0 || this.currentHp <= 0 || this.currentHp >= this.maxHp) return 0;
          const actualHeal = Math.min(amount, this.maxHp - this.currentHp);
          this.currentHp += actualHeal;

          // --- Floating Number ---
           if (this.gameStateRef?.uiManager) {
              const enemyElement = this.gameStateRef.uiManager.enemyArea?.querySelector(`.enemy-display[data-enemy-id="${this.id}"]`);
              if(enemyElement) this.gameStateRef.uiManager.showFloatingNumber(enemyElement, `+${actualHeal}`, 'heal');
           }
           // ---------------------

          // Update Enemy UI (HP Bar)
          this.gameStateRef?.uiManager?.combatUI?.renderEnemies(this.gameStateRef.combatManager.enemies, this.gameStateRef.combatManager.playerTurn);
          return actualHeal;
      }

    // --- Modifiers ---
     applyModifiers(modifierType, baseValue) {
         let modifiedValue = baseValue;
         switch(modifierType) {
            case 'damageDealt': if (this.hasStatus('Weak')) modifiedValue = Math.floor(modifiedValue * 0.75); if (this.hasStatus('Strength')) modifiedValue += this.getStatusAmount('Strength'); break;
            case 'blockGain': if (this.hasStatus('Dexterity')) modifiedValue += this.getStatusAmount('Dexterity'); if (this.hasStatus('Frail')) modifiedValue = Math.floor(modifiedValue * 0.75); break;
         }
         return Math.max(0, Math.floor(modifiedValue));
     }

     // --- End of Combat Cleanup ---
     /** Called by CombatManager or GameState when combat ends */
     cleanupCombatStatuses() {
         const initialLength = this.activeStatusEffects.length;
         this.activeStatusEffects = this.activeStatusEffects.filter(effect => {
              const persist = [/*'PermanentEnemyCurse'*/].includes(effect.id);
              return persist;
         });
     }

} // End of Enemy class
