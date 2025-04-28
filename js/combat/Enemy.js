// js/combat/Enemy.js

// Import status definitions for checking properties and logging
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
            fade_away: (self, player, gameState) => self.applyStatus('Intangible', 1, 1, self.enemyType) // Logs status apply
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
                    player.spendFocus(amount); // Player logs this
                    self.heal(amount * 2); // Enemy logs this
                    gameState?.uiManager?.logCombatEvent(`${self.name} drains ${amount} Focus, heals ${amount*2}.`, "enemy"); // Specific log
                } else {
                    gameState?.uiManager?.logCombatEvent(`${self.name} tries to drain Focus, but Player has none.`, "info");
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
                    gameState?.uiManager?.logCombatEvent(`${self.name} festers, applying Poison.`, "enemy"); // Log special action
                    player.applyStatus('Poison', 99, 3, self.enemyType); // Player logs status apply
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
                  gameState?.uiManager?.logCombatEvent(`${self.name} strengthens its cycle.`, "enemy"); // Log special action
                  // Apply status which logs itself and triggers UI update
                  self.applyStatus('Strength', 99, self.internalCounters.cycleStrengthBonus, self.enemyType);
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
             { phase: 'Aggressive', type: 'multi_attack', count: 2, baseValue: 8, description: "Assertive Flurry (2x8)" },
             { phase: 'Aggressive', type: 'attack', baseValue: 12, status: 'Vulnerable', statusDuration: 1, target: 'player', description: "Exposing Strike (12 Atk, -Vuln)" },
             { phase: 'Aggressive', type: 'special', id: 'shift_phase', targetPhase: 'Defensive', description: "Shift Aspect (-> Defensive)" },
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
                 // Log phase shift
                 gameState?.uiManager?.logCombatEvent(`${self.name} shifts aspect to ${targetPhase}!`, "enemy");
                 self.currentIntent = null;
                 self.determineNextIntent(player);
                 gameState?.uiManager?.updateCombatUI(player, gameState.combatManager.enemies, false);
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
            { type: 'special', id: 'command_ally', description: "Command Ally (?)" },
            { type: 'debuff', status: 'Entangle', duration: 1, amount: 2, target: 'player', description: "Binding Words (+2 Cost)" },
            { type: 'block', baseValue: 20, description: "Imposing Stance" },
            { type: 'multi_attack', count: 3, baseValue: 6, description: "Flurry of Control (3x6)" },
        ],
        resistances: { Interaction: 0.5, Psychological: 0.7 },
        weaknesses: { Sensory: 1.2, Relational: 1.2 },
        aiBehavior: 'boss_pattern_1',
        specialAbilities: {
            command_ally: (self, player, gameState) => {
                gameState?.uiManager?.logCombatEvent(`${self.name} uses Command Ally (Not Implemented).`, "enemy");
                console.log(`${self.name} uses Command Ally (Not Implemented)`);
             }
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
        this.activeStatusEffects = [];

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
        this.playerRef = null;
        this.gameStateRef = null;

        this.determineNextIntent();
    }

    /** Determines the enemy's action for the upcoming turn. */
    determineNextIntent(player = null) {
        if (this.currentHp <= 0) { this.currentIntent = null; return; }
        this.playerRef = player || this.playerRef;
        this.currentBlock = 0; // Reset block
        let phaseIntentions = this.intentions;
        if (this.currentPhase) { phaseIntentions = this.intentions.filter(intent => !intent.phase || intent.phase === this.currentPhase); if (phaseIntentions.length === 0) { console.warn(`${this.name}: No intentions for phase ${this.currentPhase}. Using all.`); phaseIntentions = this.intentions; } }
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
        if (possibleIntents.length === 0) { chosenIntent = phaseIntentions.find(i => !i.condition) || this.intentions.find(i => !i.condition); if (!chosenIntent) chosenIntent = {type:'none', description:'Hesitating...'}; console.warn(`${this.name} had no valid intents. Fallback: ${chosenIntent.description}`); }
        else { chosenIntent = this._selectIntentFromPossibles(possibleIntents); }
        this.wasDamagedLastTurn = false; this.wasDamagedUnblockedLastTurn = false;
        this.currentIntent = chosenIntent;
    }

    /** Helper function to select intent based on AI behavior */
    _selectIntentFromPossibles(possibleIntents) {
        let chosenIntent = null;
        switch (this.aiBehavior) {
            case 'sequential_intent': case 'sequential_cycle_powerup': chosenIntent = possibleIntents[this.intentCycleIndex % possibleIntents.length]; this.intentCycleIndex++; break;
            case 'random_intent': chosenIntent = possibleIntents[Math.floor(Math.random() * possibleIntents.length)]; break;
            case 'random_weighted': chosenIntent = possibleIntents[Math.floor(Math.random() * possibleIntents.length)]; break; // Fallback
            case 'reactive_pattern': const conditionalMove = possibleIntents.find(i => i.condition); if (conditionalMove) { chosenIntent = conditionalMove; } else { const nonConditional = possibleIntents.filter(i => !i.condition); if (nonConditional.length > 0) { chosenIntent = nonConditional[this.intentCycleIndex % nonConditional.length]; this.intentCycleIndex++; } else { chosenIntent = possibleIntents[0] || {type:'none', description:'Stuck...'}; } } break;
            case 'phase_shift': chosenIntent = possibleIntents[Math.floor(Math.random() * possibleIntents.length)]; break;
            case 'boss_pattern_1': console.warn(`AI behavior 'boss_pattern_1' not implemented for ${this.name}. Using sequential.`); chosenIntent = possibleIntents[this.intentCycleIndex % possibleIntents.length]; this.intentCycleIndex++; break;
            default: console.warn(`Unknown AI behavior '${this.aiBehavior}' for ${this.name}. Using first possible.`); chosenIntent = possibleIntents[0];
        }
        return chosenIntent || {type:'none', description:'Calculating...'};
    }


    /** Executes the enemy's planned action for the *current* turn. */
    executeTurn(player, gameState) {
        this.playerRef = player;
        this.gameStateRef = gameState;

        if (!this.currentIntent || this.currentHp <= 0 || !player) { if (this.currentHp <= 0) this.determineNextIntent(player); return; }

        // --- Log Turn Start ---
        // Moved actual turn log to CombatManager potentially, but log action start here
        // this.gameStateRef?.uiManager?.logCombatEvent(`-- ${this.name}'s Action --`, "enemy");

        // Check for Stun
        if (this.hasStatus('Stunned')) {
            this.gameStateRef?.uiManager?.logCombatEvent(`${this.name} is Stunned, turn skipped.`, "warning");
            this.removeStatus('Stunned'); // Logs removal & updates UI
            this.tickStatusEffects('start', player); // Tick statuses AFTER removing stun
            this.tickStatusEffects('end', player);
            this.determineNextIntent(player);
            return; // End turn execution here
        }

        this.tickStatusEffects('start', player); // Handles its own logging/UI updates

        if (this.currentHp <= 0) { this.determineNextIntent(player); return; } // Re-check life after start effects

        const intent = this.currentIntent;
        let baseValue = intent.baseValue || 0;
        let modifiedValue;

        // Log the intended action *before* execution
        this.gameStateRef?.uiManager?.logCombatEvent(`${this.name} intends ${intent.description || intent.type}.`, "enemy");

        try {
            switch (intent.type) {
                case 'attack':
                    modifiedValue = this.applyModifiers('damageDealt', baseValue);
                    player.takeDamage(modifiedValue, this); // Pass self as source
                    if (intent.status && player.currentHp > 0) player.applyStatus(intent.status, intent.statusDuration || 1, 1, this);
                    break;
                case 'multi_attack':
                    const count = intent.count || 1;
                    modifiedValue = this.applyModifiers('damageDealt', baseValue);
                    for(let i = 0; i < count && player.currentHp > 0; i++) {
                        player.takeDamage(modifiedValue, this);
                    }
                    if (intent.status && intent.applyStatusOnce && player.currentHp > 0) {
                        player.applyStatus(intent.status, intent.statusDuration || 1, 1, this);
                    }
                    break;
                case 'block':
                    this.gainBlock(this.applyModifiers('blockGain', baseValue)); // Logs block gain
                    break;
                case 'attack_block':
                    const attackVal = this.applyModifiers('damageDealt', intent.attackValue || 0);
                    if (player.currentHp > 0) player.takeDamage(attackVal, this);
                    const blockVal = this.applyModifiers('blockGain', intent.blockValue || 0);
                    this.gainBlock(blockVal); // Logs block gain
                    break;
                case 'debuff':
                    if (intent.status && intent.target === 'player' && player.currentHp > 0) {
                        // Log applying debuff here is clearer than player logging receiving it
                        this.gameStateRef?.uiManager?.logCombatEvent(`${this.name} applies ${intent.status} to Player.`, "status");
                        player.applyStatus(intent.status, intent.duration || 1, intent.amount || 1, this);
                    }
                    break;
                case 'buff':
                case 'power_up':
                    if (intent.status) this.applyStatus(intent.status, intent.duration || (intent.type === 'power_up' ? 99 : 1), intent.amount || 1, this); // Logs status apply
                    break;
                 case 'special':
                    // Logging handled within executeSpecialAbility or the ability itself
                    this.executeSpecialAbility(intent.id, player, gameState);
                    break;
                 case 'none':
                    this.gameStateRef?.uiManager?.logCombatEvent(`${this.name} is ${intent.description || 'doing nothing'}.`, "info");
                    break;
                default:
                    console.warn(`Unknown intent type executed by ${this.name}: ${intent.type}`);
            }
        } catch (error) { console.error(`Error executing intent for ${this.name} (Intent: ${JSON.stringify(intent)}):`, error); }

        this.tickStatusEffects('end', player); // Handles its own logging/UI

        if (this.currentHp > 0) { this.determineNextIntent(player); }
        else { this.currentIntent = null; } // Clear intent if died
    }


    /** Handles custom special ability logic from template. */
     executeSpecialAbility(abilityId, player, gameState) {
         if (!abilityId) { return; }
         // Log generic special use if specific log isn't in the ability itself
         // this.gameStateRef?.uiManager?.logCombatEvent(`${this.name} uses special ability: ${abilityId}.`, "enemy");
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
        let logText = `Takes ${initialAmount} damage`; // Start log text
        let damageType = 'damage'; // For floating number

        // Apply Intangible first
        if (this.hasStatus('Intangible')) {
            modifiedAmount = Math.max(1, modifiedAmount > 0 ? 1 : 0);
            modifiersText.push('Intangible!');
            logText += ` (Intangible!)`;
        }

        // Apply Vulnerable
        if (this.hasStatus('Vulnerable')) {
            const preVuln = modifiedAmount;
            modifiedAmount = Math.floor(modifiedAmount * 1.5);
            modifiersText.push('x1.5 Vuln!');
            logText += ` (x1.5 Vuln: ${preVuln} -> ${modifiedAmount})`;
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
                logText += ` (${elementalMultiplier.toFixed(1)}x ${damageSourceElement})`;
            }
        }

        modifiedAmount = Math.max(0, modifiedAmount);

        if (modifiedAmount <= 0) {
              if (this.gameStateRef?.uiManager) {
                  const enemyElement = this.gameStateRef.uiManager.enemyArea?.querySelector(`.enemy-display[data-enemy-id="${this.id}"]`);
                  if(enemyElement) this.gameStateRef.uiManager.showFloatingNumber(enemyElement, `Negated!`, 'negate', modifiersText.join(', '));
                  this.gameStateRef.uiManager.logCombatEvent(`${this.name} damage negated${logText.includes('(') ? logText.substring(logText.indexOf('(')) : ''}.`, "info"); // Log negation
              }
              this.gameStateRef?.uiManager?.combatUI?.renderEnemies(this.gameStateRef.combatManager.enemies, this.gameStateRef.combatManager.playerTurn);
              return 0;
        }

        const blockConsumed = Math.min(this.currentBlock, modifiedAmount);
        const damageAfterBlock = modifiedAmount - blockConsumed;

        this.wasDamagedLastTurn = true;
        if (damageAfterBlock > 0) this.wasDamagedUnblockedLastTurn = true;

        // Floating Numbers
         if (this.gameStateRef?.uiManager) {
             const enemyElement = this.gameStateRef.uiManager.enemyArea?.querySelector(`.enemy-display[data-enemy-id="${this.id}"]`);
             if (enemyElement) {
                 if (blockConsumed > 0) {
                     this.gameStateRef.uiManager.showFloatingNumber(enemyElement, `-${blockConsumed}`, 'blocked', `Blocked ${modifiedAmount}`);
                     logText += ` (${blockConsumed} blocked)`;
                 }
                 if (damageAfterBlock > 0) {
                     this.gameStateRef.uiManager.showFloatingNumber(enemyElement, `-${damageAfterBlock}`, 'damage', modifiersText.join(', '));
                     damageType = 'damage';
                 } else {
                     damageType = 'blocked';
                 }
             }
         }

        // Log AFTER calculations and floating numbers
        this.gameStateRef?.uiManager?.logCombatEvent(`${this.name} ${logText}.`, damageType);

        // Apply damage/block reduction
        if (blockConsumed > 0) this.currentBlock -= blockConsumed;
        if (damageAfterBlock > 0) this.currentHp -= damageAfterBlock;

        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.currentIntent = null;
            this.activeStatusEffects = [];
            this.gameStateRef?.uiManager?.logCombatEvent(`${this.name} defeated!`, "info"); // Log defeat
            // On death trigger handled by CombatManager check
        }

        // Update Enemy UI AFTER applying damage/block
        this.gameStateRef?.uiManager?.combatUI?.renderEnemies(this.gameStateRef.combatManager.enemies, this.gameStateRef.combatManager.playerTurn);

         if(this.currentHp <= 0) {
              const debuffs = this.activeStatusEffects.filter(s => getStatusEffectDefinition(s.id)?.type === 'debuff').length;
              if(debuffs >= 3) { this.gameStateRef?.triggerMilestoneAction('defeatEnemyWithDebuffs', debuffs); }
         }

        return damageAfterBlock;
    }


    /** Adds block to the enemy, considering statuses, and showing floating number. */
    gainBlock(amount) {
         if (amount <= 0) return;
         const modifiedAmount = this.applyModifiers('blockGain', amount); // Modifiers might log
         if (modifiedAmount <= 0) {
             this.gameStateRef?.uiManager?.logCombatEvent(`${this.name} Block gain negated.`, "info");
             return;
         }

         this.currentBlock += modifiedAmount;

         // Floating Number
          if (this.gameStateRef?.uiManager) {
             const enemyElement = this.gameStateRef.uiManager.enemyArea?.querySelector(`.enemy-display[data-enemy-id="${this.id}"]`);
              let modifiersText = [];
              let modifierLog = "";
              if(this.hasStatus('Dexterity')) {
                 const dexAmt = this.getStatusAmount('Dexterity');
                 if (dexAmt > 0) { modifiersText.push(`+${dexAmt} Dex`); modifierLog += ` (+${dexAmt} Dex)`; }
              }
              // Frail doesn't affect enemy block gain
              if(enemyElement) this.gameStateRef.uiManager.showFloatingNumber(enemyElement, `+${modifiedAmount}`, 'block', modifiersText.join(', '));
              this.gameStateRef?.uiManager?.logCombatEvent(`${this.name} gained ${modifiedAmount} Block${modifierLog}.`, "block"); // Log gain
          }

         // Update Enemy UI
         this.gameStateRef?.uiManager?.combatUI?.renderEnemies(this.gameStateRef.combatManager.enemies, this.gameStateRef.combatManager.playerTurn);
    }


     // --- Status Effects ---
     applyStatus(statusId, duration, amount = 1, source = null) {
         if (!statusId) { return; }
         const definition = getStatusEffectDefinition(statusId);
         if (!definition) { console.warn(`Enemy.applyStatus: No definition for ${statusId}`); return; }

         const uiAffectingStatuses = ['Weak', 'Vulnerable', 'Frail', 'Strength', 'Dexterity', 'Entangle'];
         const canBeZero = uiAffectingStatuses.includes(statusId);
         if (!canBeZero && duration <= 0 && amount <= 0 && !definition.stacking) return;
         if (!canBeZero && duration <= 0 && amount <= 0 && definition.stacking && initialAmount <= 0) return;

         const existing = this.activeStatusEffects.find(s => s.id === statusId);
         let statusAppliedOrUpdated = false;
         let logMsg = "";
         const sourceName = source?.name || (typeof source === 'string' ? source : 'Unknown');

         if (existing) {
             let amtChanged = false; let durChanged = false;
             if (definition.stacking) { const oldAmt = existing.amount || 0; existing.amount = oldAmt + amount; if(existing.amount !== oldAmt) amtChanged = true; }
             if (existing.duration !== 99) { const oldDur = existing.duration; const newEffDur = duration > 0 ? Math.max(existing.duration, duration) : existing.duration; existing.duration = newEffDur; if(existing.duration !== oldDur) durChanged = true; }
             existing.source = sourceName;
             if (amtChanged || durChanged) { logMsg = `${this.name} Status Updated: ${statusId} (Amt: ${existing.amount}, Dur: ${existing.duration})`; statusAppliedOrUpdated = true; }
         } else {
              let initialAmount = definition.stacking ? amount : 1;
              if (initialAmount <= 0 && duration <= 0 && !canBeZero) return;
              this.activeStatusEffects.push({ id: statusId, duration: duration, source: sourceName, amount: initialAmount });
              logMsg = `${this.name} Applied Status: ${statusId} (Amt: ${initialAmount}, Dur: ${duration}) from ${sourceName}`;
              statusAppliedOrUpdated = true;
         }

         if (statusAppliedOrUpdated) {
             this.gameStateRef?.uiManager?.logCombatEvent(logMsg, "status"); // Log status change
             this.gameStateRef?.uiManager?.combatUI?.renderEnemies(this.gameStateRef.combatManager.enemies, this.gameStateRef.combatManager.playerTurn);
             // Trigger artifacts if needed
         }
     }

     removeStatus(statusId) {
         const initialLength = this.activeStatusEffects.length;
         this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId);
         if (this.activeStatusEffects.length < initialLength) {
             this.gameStateRef?.uiManager?.logCombatEvent(`${this.name} Status Removed: ${statusId}.`, "status"); // Log removal
             this.gameStateRef?.uiManager?.combatUI?.renderEnemies(this.gameStateRef.combatManager.enemies, this.gameStateRef.combatManager.playerTurn);
             return true;
         }
         return false;
     }

     hasStatus(statusId) { return this.activeStatusEffects.some(s => s.id === statusId); }
     getStatusAmount(statusId) { const s = this.activeStatusEffects.find(st => st.id === statusId); return s ? (s.amount || (s.duration > 0 ? 1 : 0)) : 0; }

     /** Process status effects at start or end of turn. */
     tickStatusEffects(phase, player) {
        let uiNeedsUpdate = false;
        // Iterate backwards for safe removal
        for (let i = this.activeStatusEffects.length - 1; i >= 0; i--) {
            const effect = this.activeStatusEffects[i];
            if (!effect) continue;

            let removeEffectAfterTick = false;
            const initialAmount = effect.amount;
            const initialDuration = effect.duration;
            const definition = getStatusEffectDefinition(effect.id);
            let stateChanged = false;

            // Start of Turn
             if (phase === 'start') {
                 switch(effect.id) {
                     case 'Poison':
                         if (effect.amount > 0) {
                             this.gameStateRef?.uiManager?.logCombatEvent(`${this.name} takes ${effect.amount} damage (Poison).`, "damage");
                             this.takeDamage(effect.amount, 'Poison'); // Handles its own logging/UI
                             if (this.currentHp > 0 && this.activeStatusEffects.includes(effect)) {
                                 effect.amount--;
                                 if (effect.amount <= 0) removeEffectAfterTick = true;
                                 stateChanged = true;
                             } else { removeEffectAfterTick = true; stateChanged = true;}
                         } else { removeEffectAfterTick = true; stateChanged = true;}
                         break;
                     case 'Burn':
                         if (effect.amount > 0) {
                              this.gameStateRef?.uiManager?.logCombatEvent(`${this.name} takes ${effect.amount} damage (Burn).`, "damage");
                             this.takeDamage(effect.amount, 'Burn'); // Handles its own logging/UI
                             // Duration ticks end of turn
                         }
                         break;
                 }
             }

             // End of Turn
             if (phase === 'end') {
                  switch(effect.id) {
                     case 'Regen': if (effect.amount > 0) { this.heal(effect.amount); stateChanged = true;} break; // Heal logs itself
                     case 'Metallicize': if (effect.amount > 0) { this.gainBlock(effect.amount); stateChanged = true;} break; // Block logs itself
                     case 'Intangible': removeEffectAfterTick = true; this.gameStateRef?.uiManager?.logCombatEvent(`${this.name}'s Intangible wore off.`, "status"); stateChanged = true; break;
                 }
                 // Duration Ticking
                 const tickDuration = definition?.durationBased && effect.duration !== 99 && effect.id !== 'Poison';
                 if (tickDuration && this.activeStatusEffects.includes(effect)) {
                     effect.duration--;
                     if (effect.duration <= 0) {
                          this.gameStateRef?.uiManager?.logCombatEvent(`${this.name}'s ${effect.id} expired.`, "status");
                          removeEffectAfterTick = true;
                     }
                     stateChanged = true;
                 }
             }

             if (removeEffectAfterTick) {
                 this.activeStatusEffects.splice(i, 1); // Remove directly
                 stateChanged = true; // Removal is a state change
             }
             if(stateChanged) uiNeedsUpdate = true;
        } // End loop

        // Update UI once at the end if any status changed or was removed
        if (uiNeedsUpdate) {
            this.gameStateRef?.uiManager?.combatUI?.renderEnemies(this.gameStateRef.combatManager.enemies, this.gameStateRef.combatManager.playerTurn);
        }
     }

     /** Heal the enemy, showing floating number */
     heal(amount) {
          if (amount <= 0 || this.currentHp <= 0 || this.currentHp >= this.maxHp) return 0;
          const actualHeal = Math.min(amount, this.maxHp - this.currentHp);
          this.currentHp += actualHeal;
           if (this.gameStateRef?.uiManager) {
              const enemyElement = this.gameStateRef.uiManager.enemyArea?.querySelector(`.enemy-display[data-enemy-id="${this.id}"]`);
              if(enemyElement) this.gameStateRef.uiManager.showFloatingNumber(enemyElement, `+${actualHeal}`, 'heal');
              this.gameStateRef.uiManager.logCombatEvent(`${this.name} healed ${actualHeal} HP.`, "heal"); // Log heal
           }
          this.gameStateRef?.uiManager?.combatUI?.renderEnemies(this.gameStateRef.combatManager.enemies, this.gameStateRef.combatManager.playerTurn);
          return actualHeal;
      }

    // --- Modifiers ---
     applyModifiers(modifierType, baseValue) {
         let modifiedValue = baseValue;
         let logParts = []; // For logging

         switch(modifierType) {
            case 'damageDealt':
                if (this.hasStatus('Weak')) { const newVal = Math.floor(modifiedValue * 0.75); if(newVal < modifiedValue) logParts.push("Weak!"); modifiedValue = newVal; }
                if (this.hasStatus('Strength')) { const strAmt = this.getStatusAmount('Strength'); if(strAmt !== 0) logParts.push(`+${strAmt} Str`); modifiedValue += strAmt; }
                break;
            case 'blockGain':
                if (this.hasStatus('Dexterity')) { const dexAmt = this.getStatusAmount('Dexterity'); if(dexAmt !== 0) logParts.push(`+${dexAmt} Dex`); modifiedValue += dexAmt; }
                if (this.hasStatus('Frail')) { const newVal = Math.floor(modifiedValue * 0.75); if(newVal < modifiedValue) logParts.push("Frail!"); modifiedValue = newVal; } // Note: Frail usually affects player block gain, but added here for completeness
                break;
         }
         modifiedValue = Math.max(0, Math.floor(modifiedValue));

         // Log modifications (Optional, can be verbose)
         // if (logParts.length > 0 && modifiedValue !== baseValue) {
         //     this.gameStateRef?.uiManager?.logCombatEvent(`${this.name} ${modifierType} modified: ${baseValue} -> ${modifiedValue} (${logParts.join(', ')})`, "info");
         // }

         return modifiedValue;
     }

     // --- End of Combat Cleanup ---
     cleanupCombatStatuses() {
         const initialLength = this.activeStatusEffects.length;
         this.activeStatusEffects = this.activeStatusEffects.filter(effect => {
              const persist = [/*'PermanentEnemyCurse'*/].includes(effect.id);
              return persist;
         });
         // No logging needed here normally
     }

} // End of Enemy class
