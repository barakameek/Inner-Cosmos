// js/combat/Enemy.js

// Import definitions if they live elsewhere
// Example: import { ENEMY_TEMPLATES } from './Enemyattack', baseValue: 5, description: "Questioning Jab" },
            { type: 'debuff', status: 'Frail', duration: 1, target: 'player', description: "Undermine Confidence" },
        ],
        resistances: { Psychological: 0.75 }, weaknesses: { Cognitive: 1.25 }, aiBehavior: 'random_intent',
    },
    'fleeting_desire': {
        name: "Fleeting Desire", maxHp: 30, sprite: 'assets/images/enemiesDefinitions.js';

// Assuming ENEMY_TEMPLATES are defined directly in this file for now
export const ENEMY_TEMPLATES = {
    // --- Floor 1 Enemies ---
    'doubt_whisper': {
        name: "Whispering Doubt", maxHp: 25, sprite: 'assets/images/enemies/doubt_whisper.png',
        intentions: [
            { type: 'attack', baseValue: 4, description:/fleeting_desire.png',
        intentions: [
            { type: 'attack', baseValue: 7, description: "Sudden Urge" },
            { type: 'buff', status: 'Dexterity', duration: 99, amount: 2, description: "Become Evasive (+Dex)"},
            { type: 'attack', baseValue: 5, description: "Distracting Glance" }, "Niggle" },
            { type: 'debuff', status: 'Weak', duration: 1, target: 'player', description: "Sow Weakness" },
            { type: 'attack', baseValue: 5, description: "Questioning Jab" },
            { type: 'debuff', status: 'Frail', duration: 1, target: 'player', description: "Undermine Confidence" },
        
            { type: 'special', id: 'fade_away', description: "Become Intangible"},
        ],
        resistances: { Attraction: 0.5 }, weaknesses: { Relational: 1.5 }, aiBehavior: 'random_weighted',
        specialAbilities: { fade_away: (self) => self.apply],
        resistances: { Psychological: 0.75 }, weaknesses: { Cognitive: 1.25 }, aiBehavior: 'random_intent',
    },
    'fleeting_desire': {
        name: "Fleeting Desire", maxHp: 30, sprite: 'assets/images/enemies/fleeting_Status('Intangible', 1) } // Apply for 1 turn
    },
    'rigid_perfectionism': { // Floor 1 Elite
        name: "Rigid Perfectionism", maxHp: 65, sprite: 'assets/images/enemies/perfectionism.png',
        intentions: [
            { type: 'block', baseValue: 12, description: "Reinforce Standards" },
            { typedesire.png',
        intentions: [
            { type: 'attack', baseValue: 7, description: "Sudden Urge" },
            { type: 'buff', status: 'Dexterity', duration: 99, amount: 2, description: "Become Evasive (+Dex)"},
            { type: 'attack', baseValue: 5, description: "Distracting Glance" },
            { type: 'special: 'attack', baseValue: 9, description: "Critical Strike" },
            { type: 'attack_block', attackValue: 7, blockValue: 7, description: "Measured Assault" },
            { type: 'power_up', status: 'Strength', duration: 99, amount: 1, condition: 'wasDamagedUnblockedLastTurn', description: "Punish Imperfection (+1 Str)" },
            { type: 'debuff',', id: 'fade_away', description: "Become Intangible (1 Turn)"},
        ],
        resistances: { Attraction: 0.5 }, weaknesses: { Relational: 1.5 }, aiBehavior: 'random_weighted',
        specialAbilities: {
             fade_away: (self, player, gameState) => self.applyStatus('Intangible', 1, 1) // Duration 1, Amount 1
         status: 'Frail', duration: 1, target: 'player', condition: 'playerHasHighBlock', description: "Critique Defense (Apply Frail)" }
        ],
         resistances: { Interaction: 0.75, Cognitive: 0.8 }, weaknesses: { Psychological: 1.25 }, ai}
    },
    'rigid_perfectionism': { // Floor 1 Elite
        name: "Rigid Perfectionism", maxHp: 65, sprite: 'assets/images/enemies/perfectionism.png',
        intentions: [
            { type: 'block', baseValue: 12, description: "Behavior: 'reactive_pattern',
    },
    // --- Floor 2 Enemies ---
    'inner_critic': {
        name: "Inner Critic", maxHp: 45, sprite: 'assets/images/enemies/inner_critic.png',
        intentions: [
             { type: 'multi_attack', baseValue: 3, count: 2, description: "Harsh Words"},
             { type: 'debuffReinforce Standards" },
            { type: 'attack', baseValue: 9, description: "Critical Strike" },
            { type: 'attack_block', attackValue: 7, blockValue: 7, description: "Measured Assault" },
            { type: 'power_up', status: 'Strength', duration: 99, amount: 1, condition: 'wasDamagedUnblockedLastTurn', description: "Punish Imperfection (+1 Str)" },
', status: 'Vulnerable', duration: 2, target: 'player', description: "Expose Flaw"},
             { type: 'attack', baseValue: 7, status: 'Weak', statusDuration: 1, description: "Belittle (-Weak)"},
             { type: 'block', baseValue: 8, description: "Defensive Rationalization"},
        ],
        resistances: { Psychological: 0.6             { type: 'debuff', status: 'Frail', duration: 1, target: 'player', condition: 'playerHasHighBlock', description: "Inflict Frail" }
        ],
         resistances: { Interaction: 0.75, Cognitive: 0.8 }, weaknesses: { Psychological: 1.25 }, aiBehavior: 'reactive_pattern',
    },
    // --- Floor 2 Enemies ---
    'inner_ }, weaknesses: { Sensory: 1.25 }, aiBehavior: 'random_weighted',
    },
    'unmet_need': {
         name: "Unmet Need (Craving)", maxHp: 55, sprite: 'assets/images/enemies/unmet_need.png',
         intentions: [
              { type: 'attack', baseValue: 9, description: "Lashing Out"},
              { type: 'special', id: 'drain_focus', amount: 1, description: "Drain Focus"},critic': {
        name: "Inner Critic", maxHp: 45, sprite: 'assets/images/enemies/inner_critic.png',
        intentions: [
             { type: 'multi_attack', baseValue: 3, count: 2, description: "Harsh Words"},
             { type: 'debuff', status: 'Vulnerable', duration: 2, target: 'player', description: "Expose Flaw"},
             { type: 'attack', baseValue: 7, status: 'Weak', statusDuration: 1, applyStatusOnce: true, description: "Belittle (-Weak)"}, // Applies status only
              { type: 'power_up', status: 'Strength', duration: 99, amount: 1, condition: 'hpBelow50', description: "Grow Desperate (+1 Str)"},
              { type: 'debuff', status: 'Entangle', duration: 1, target: 'player', description: "Cling (Entangle)"},
         ],
         resistances: {}, weaknesses: { Psychological: 1.5, Relational: 1.25 }, aiBehavior: 'reactive_pattern',
         specialAbilities: {
              drain_focus: once
             { type: 'block', baseValue: 8, description: "Defensive Rationalization"},
        ],
        resistances: { Psychological: 0.6 }, weaknesses: { Sensory: 1.25 }, aiBehavior: 'random_weighted',
    },
    'unmet_need': {
         name: "Unmet Need (Craving)", maxHp: 55, sprite: 'assets/images/enemies/unmet_need.png',
         intentions: [
              { type: 'attack', baseValue:  (self, player) => { if (player?.currentFocus > 0) player.spendFocus(self.currentIntent?.amount || 1); }
         }
    },
     'compulsive_habit': { // Floor 2 Elite
         name: "Compulsive Habit", maxHp: 80, sprite: 'assets/images/enemies/compulsive_habit.png',
         intentions: [
             { type: 'attack', baseValue: 6, description: "Recurring Thought" },
             { type: 'block', baseValue: 6, description: "Routine Defense" },
             { type: 'multi_attack', baseValue: 3, count9, description: "Lashing Out"},
              { type: 'special', id: 'drain_focus', amount: 1, description: "Drain Focus"},
              { type: 'power_up', status: 'Strength', duration: 99, amount: 1, condition: 'hpBelow50', description: "Grow Desperate (+1 Str)"},
              { type: 'debuff', status: 'Entangle', duration: 1, target: 'player', amount: 1, description: "Cling (+1 Card Cost)"}, // Entangle defined: 3, description: "Rapid Fixation" },
             { type: 'special', id: 'cycle_strength', description: "Strengthens Cycle" }
         ],
         resistances: { Cognitive: 0.7 }, weaknesses: { Interaction: 1.3 }, aiBehavior: 'sequential_cycle_powerup',
         internalCounters: { cycle: 0, strengthBonus: 0 },
         specialAbilities: {
              cycle_strength: (self) => { self.internalCounters.strengthBonus++; self.applyStatus('Strength', 1 as increasing cost
         ],
         resistances: {}, weaknesses: { Psychological: 1.5, Relational: 1.25 }, aiBehavior: 'reactive_pattern',
         specialAbilities: {
              drain_focus: (self, player, gameState) => {
                  if (player?.currentFocus > 0) {
                      const amount = self.currentIntent?.amount || 1;
                      player.spendFocus(amount); // Player function, self.internalCounters.strengthBonus); } // Apply Str for next turn
         }
     },
    // --- Bosses ---
    'shadow_aspect_interaction': {
        name: "Shadow of Unseen Influence", maxHp: 150, sprite: 'assets/images/enemies/shadow_interaction.png handles min 0
                       console.log(`${self.name} drains ${amount} Focus.`);
                       self.heal(amount); // Heal self slightly when draining
                  } else {
                      console.log(`${self.name} tries to drain Focus, but Player has none.`);
                  }
              }
         }
    },
     'compulsive',
        intentions: [
            { type: 'attack', baseValue: 10, status: 'Weak', statusDuration: 1, description: "Manipulative Strike (-Weak)" },
            { type: 'multi_attack', baseValue: 4, count: 3, description: "Conflicting Signals"},
            { type: 'debuff', status: 'Vulnerable', duration: 2, target: 'player',_habit': { // Floor 2 Elite
         name: "Compulsive Habit", maxHp: 80, sprite: 'assets/images/enemies/compulsive_habit.png',
         intentions: [
             { type: description: "Exploit Insecurity (-Vuln)" },
            { type: 'block', baseValue: 20, description: "Wall of Denial" },
            { type: 'special', id: 'mind_twist', description: "Applies Confusion & Frail" },
             { type: 'buff', status: 'Strength', 'attack', baseValue: 6, description: "Recurring Thought" },
             { type: 'block', baseValue: 6, description: "Routine Defense" },
             { type: 'multi_attack', baseValue: 3, count: 3, description: "Rapid Fixation" },
             { type: 'special', duration: 99, amount: 2, condition: 'hpBelow50', description: "Desperate Power (+2 Str)"},
             { type: 'debuff', status: 'Entangle', duration: 2, target: 'player', description: "Suffocating Closeness (Entangle)"}
        ],
        resistances: id: 'cycle_strength', description: "Strengthens Cycle" }
         ],
         resistances: { Cognitive: 0.7 }, weaknesses: { Interaction: 1.3 }, aiBehavior: 'sequential_cycle_powerup',
         internalCounters: { cycle: 0, strengthBonus: 0 },
         specialAbilities: { { Sensory: 0.8, Psychological: 0.8 }, weaknesses: { Interaction: 1.25 }, aiBehavior: 'random_weighted',
        onDeathAction: { type: 'reward', insight: 50, artifactId: 'shadow_insight_artifact' }, // Use corrected ID
         specialAbilities: {
             mind
              cycle_strength: (self, player, gameState) => {
                 self.internalCounters.strengthBonus += 1;
                 // Apply temporary strength buff based on cycle count
                 self.applyStatus('Strength', 1, self.internalCounters.strengthBonus); // Strength lasts 1 turn
                  console.log(`${self.name}_twist: (self, player, gameState) => {
                if(player) player.applyStatus('Confusion', 1, 1, self.enemyType);
                if(player) player.applyStatus('Frail', strengthens its cycle (+${self.internalCounters.strengthBonus} Str for next turn).`);
              }
         }
     },
    // --- Bosses ---
    'shadow_aspect_interaction': {
        name: "Shadow of Unseen Influence", maxHp: 150, sprite: 'assets/images/enemies/ 1, 1, self.enemyType);
             }
         }
    }
};


/**
 * Represents an enemy combatant.
 */
export class Enemy {
    constructor(enemyId, instanceId) {
        const template = ENEMY_TEMPLATES[enemyId];
        if (!template) { /* ... keep error handling ... */ returnshadow_interaction.png',
        intentions: [
            { type: 'attack', baseValue: 10, status: 'Weak', statusDuration: 1, applyStatusOnce: true, description: "Manipulative Strike" },
            { type: 'multi_attack', baseValue: 4, count: 3, description: "Conflicting; }

        this.id = `enemy_${enemyId}_${instanceId}`;
        this.enemyType = enemyId;
        this.name = template.name;
        this.maxHp = template.maxHp;
        this.currentHp = template.maxHp;
        this.sprite = template.sprite;
        this.intentions = JSON.parse(JSON.stringify(template.intentions));
        this.currentIntent = null;
 Signals"},
            { type: 'debuff', status: 'Vulnerable', duration: 2, target: 'player', description: "Exploit Insecurity" },
            { type: 'block', baseValue: 20, description: "Wall of Denial" },
            { type: 'special', id: 'mind_twist        this.currentBlock = 0;
        this.activeStatusEffects = [];
        this.resistances = { ...(template.resistances || {}) };
        this.weaknesses = { ...(template.weaknesses || {}) };
        this.aiBehavior = template.aiBehavior || 'sequential_intent';
        this.intent', description: "Applies Confusion & Frail" },
             { type: 'power_up', status: 'Strength', duration: 99, amount: 2, condition: 'hpBelow50', description: "Desperate Power (+2 Str)"},
             { type: 'debuff', status: 'Entangle', duration: 2, targetCycleIndex = 0;
        this.onDeathAction = template.onDeathAction ? { ...template.onDeathAction } : null;
        this.specialAbilities = template.specialAbilities || {};
        this.internalCounters = template.internalCounters ? JSON.parse(JSON.stringify(template.internalCounters)) :: 'player', amount: 1, description: "Suffocating Closeness (+1 Card Cost)"}
        ],
        resistances: { Sensory: 0.8, Psychological: 0.8 }, weaknesses: { Interaction: 1.25 }, aiBehavior: 'random_weighted',
        onDeathAction: { type: 'reward', insight: 50, artifactId: 'shadow_insight_artifact' } // {};

        this.wasDamagedLastTurn = false;
        this.wasDamagedUnblockedLastTurn = false; // Flag if HP damage was taken
        this.playerRef = null;

        // console.log(`Enemy created: ${this.name} (ID: ${this.id})`);
        this.determineNextIntent();
    }

    /** Determines the enemy's action for the upcoming turn. */
    determineNextIntent Changed ID to match artifact def
    }
};


/**
 * Represents an enemy combatant.
 */
export class Enemy {
    constructor(enemyId, instanceId) {
        const template = ENEMY_TEMPLATES[enemyId];
        if (!template) { /* ... error handling ... */
             this.id = `enemy_error(player = null) {
        if (this.currentHp <= 0) { this.currentIntent = null; return; }
        this.playerRef = player || this.playerRef;

        if (!this.currentIntent?.keepsBlock) { this.currentBlock = 0; }

        let chosenIntent = null;
        const_${instanceId}`; this.enemyType = 'error'; this.name = "Lost Fragment"; this.maxHp = 1; this.currentHp = 1; this.sprite = 'assets/images/enemies/error.png'; this.intentions = [{ type: 'attack', baseValue: 1 }]; this.currentIntent = null; this.currentBlock = 0; this.activeStatusEffects = []; this.resistances = {}; this. possibleIntents = this.intentions.filter(intent => {
             if (!intent.condition) return true;
             switch(intent.condition) {
                 case 'wasDamagedLastTurn': return this.wasDamagedLastTurn;
                 case 'wasDamagedUnblockedLastTurn': return this.wasDamagedUnblockedLastTurn;
                 case 'hpBelow50': return this.currentHp < this.maxHp *weaknesses = {}; this.aiBehavior = 'sequential_intent'; this.intentCycleIndex = 0; this.onDeathAction = null;
             console.error(`Enemy Error: Template not found for ID: ${enemyId}`); return;
        }
        this.id = `enemy_${enemyId}_${instanceId}`; this.enemy 0.5;
                 case 'hpAbove75': return this.currentHp > this.maxHp * 0.75;
                 case 'playerHasHighBlock': return this.playerRef && this.playerRef.currentBlock >= 10;
                 case 'selfHasDebuff': return this.activeStatusEffects.some(s => ['Weak', 'Vulnerable', 'Frail'].includes(s.id));
Type = enemyId; this.name = template.name;
        this.maxHp = template.maxHp; this.currentHp = template.maxHp; this.sprite = template.sprite;
        this.intentions = JSON.parse(JSON.stringify(template.intentions));
        this.currentIntent = null; this.currentBlock = 0; this.activeStatusEffects = [];
        this.resistances = { ...(template.resistances ||                 default: return true;
             }
        });

        if (possibleIntents.length === 0) {
             chosenIntent = this.intentions.find(i => !i.condition) || this.intentions[0] || {type:'none', description:'Struggling'};
        } else {
            // Apply AI Behavior
            switch (this.aiBehavior) {
                 case 'sequential_intent':
                 case 'sequential_ {}) }; this.weaknesses = { ...(template.weaknesses || {}) };
        this.aiBehavior = template.aiBehavior || 'sequential_intent'; this.intentCycleIndex = 0;
        this.onDeathAction = template.onDeathAction ? { ...template.onDeathAction } : null;
        this.specialAbilities = template.specialAbilities || {};
        this.internalCounters = template.internalCounters ? JSON.parse(cycle_powerup':
                     chosenIntent = possibleIntents[this.intentCycleIndex % possibleIntents.length];
                     // Make cycle index wrap around *possible* intents length for sequential? Or original? Original feels more predictable.
                     //JSON.stringify(template.internalCounters)) : {};
        this.wasDamagedLastTurn = false; this.wasDamagedUnblockedLastTurn = false;
        this.playerRef = null;
        // console.log(`Enemy created: ${this.name} (ID: ${this.id})`); // Noisy
        this.determineNext Let's cycle through original intentions index but pick from possibles IF the condition matches
                      let attempts = 0;
                      do {
                          chosenIntent = this.intentions[this.intentCycleIndex % this.intentions.length];
                          this.intentCycleIndex = (this.intentCycleIndex + 1);
                          attempts++;
                      }Intent(); // Determine initial intent
    }

    determineNextIntent(player = null) {
        if (this.currentHp <= 0) { this.currentIntent = null; return; }
        this.playerRef = player || this.playerRef;
        if (!this.currentIntent?.keepsBlock) { this.currentBlock = 0; } // Reset block unless specified

        let chosenIntent = null;
        const possibleIntents = while (!possibleIntents.includes(chosenIntent) && attempts < this.intentions.length * 2); // Prevent infinite loop, check if chosen is possible
                      if (!possibleIntents.includes(chosenIntent)) { // Fallback if no possible intents found in cycle
                         chosenIntent = possibleIntents[0] || {type:'none', this.intentions.filter(intent => { // Filter possible intents based on condition
             if (!intent.condition) return true;
             switch(intent.condition) {
                 case 'wasDamagedLastTurn': return this.wasDamagedLastTurn;
                 case 'wasDamagedUnblockedLastTurn': return this.wasDamagedUnblockedLastTurn;
                 case 'hpBelow50': return this.currentHp < this.maxHp * description:'Faltering'};
                      }
                     break;
                case 'random_intent': case 'random_weighted':
                    chosenIntent = possibleIntents[Math.floor(Math.random() * possibleIntents.length)];
                    break;
                case 'reactive_pattern':
                    const conditionalMove = possibleIntents.find(i => i.condition);
                     if (conditionalMove) { chosenIntent = conditionalMove; }
                     else {
                         const nonConditional = possibleIntents.filter(i => !i.condition);
                         if 0.5;
                 case 'hpAbove75': return this.currentHp > this.maxHp * 0.75;
                 case 'playerHasHighBlock': return this.playerRef && this.playerRef.currentBlock >= 10;
                 case 'selfHasDebuff': return this.activeStatusEffects.some(s => ['Weak', 'Vulnerable', 'Frail'].includes(s.id));
                 // Add more conditions...
                 default: return true;
             }
        });

        if (possibleIntents (nonConditional.length > 0) {
                            chosenIntent = nonConditional[this.intentCycleIndex % nonConditional.length];
                            this.intentCycleIndex = (this.intentCycleIndex + 1);
                         } else.length === 0) { // Fallback if no conditions met
             chosenIntent = this.intentions.find(i => !i.condition) || this.intentions[0] || {type:'none', description:'Hesitating...'};
        } else { // Apply AI behavior to possible intents
            switch (this.aiBehavior) {
 { chosenIntent = possibleIntents[0] || {type:'none', description:'Hesitating'}; }
                     }
                    break;
                default: chosenIntent = possibleIntents[0];
            }
        }

        // Reset flags AFTER choosing intent
        this.wasDamagedLastTurn = false;
        this.wasDamagedUnblockedLastTurn = false; // Reset specific flag too

        this.currentIntent = chosenIntent;
    }

    /** Executes the enemy's planned action for the *current* turn. */
    executeTurn(player, gameState                case 'sequential_intent':
                case 'sequential_cycle_powerup':
                     // Cycle through *possible* intents for this turn based on original cycle index
                     const possibleIndex = this.intentCycleIndex % possibleIntents.length;
                     chosenIntent = possibleIntents[possibleIndex];
                     // How should index advance? Always?) {
        if (!this.currentIntent || this.currentHp <= 0 || !player) {
            if(this.currentHp <= 0) this.determineNextIntent(player); return;
        }
        this.playerRef = player;

        if (this.hasStatus('Stunned')) {
            console.log(`${this.name} is Stunned.`); this.tickStatusEffects('start', player);
            this.remove Or only if non-conditional used?
                     // Let's advance always for simplicity, meaning reactive patterns might skip steps.
                     this.intentCycleIndex = (this.intentCycleIndex + 1);
                    break;
                case 'random_intent': case 'random_weighted':
                    const randomIndex = Math.floor(Math.random() * possibleStatus('Stunned'); this.tickStatusEffects('end', player);
            this.determineNextIntent(player); return;
        }

        // console.log(`${this.name} executing: ${this.currentIntent.description || this.currentIntent.type}`); // Noisy
        this.tickStatusEffects('start', player); // StartIntents.length);
                    chosenIntent = possibleIntents[randomIndex];
                    break;
                case 'reactive_pattern':
                    const conditionalMove = possibleIntents.find(i => i.condition);
                     if (conditionalMove) { chosenIntent = conditionalMove; } // Prioritize reaction
                     else { // Cycle non-of-turn effects BEFORE action

        const intent = this.currentIntent;
        let baseValue = intent.baseValue || 0;
        let modifiedValue; // Calculate inside switch where needed

        try {
            switch (intent.type-conditional if no reaction needed
                         const nonConditional = possibleIntents.filter(i => !i.condition);
                         if (nonConditional.length > 0) {
                            chosenIntent = nonConditional[this.intentCycle) {
                case 'attack':
                    modifiedValue = this.applyModifiers('damageDealt', baseValue);
                    player.takeDamage(modifiedValue);
                    if (intent.status) player.applyStatus(Index % nonConditional.length];
                            this.intentCycleIndex = (this.intentCycleIndex + 1); // Only advance index for base pattern
                         } else { chosenIntent = possibleIntents[0]; } // Fallback ifintent.status, intent.statusDuration || 1, 1, this.enemyType);
                    break;
                case 'multi_attack':
                    const count = intent.count || 1;
                    // Apply modifier only conditional possible but none met
                     }
                    break;
                default: chosenIntent = possibleIntents[0];
            }
        }
        // Reset flags AFTER choosing intent for next turn
        this.wasDamagedLast per hit potentially
                    for(let i=0; i < count; i++) {
                        modifiedValue = this.applyModifiers('damageDealt', baseValue); // Recalculate for effects like Strength wearing off mid-attack? No,Turn = false; this.wasDamagedUnblockedLastTurn = false;
        this.currentIntent = chosenIntent;
    }

    executeTurn(player, gameState) {
        if (!this.currentIntent || this.currentHp Strength is passive. Calculate once.
                         player.takeDamage(modifiedValue);
                    }
                    if (intent.status && intent.applyStatusOnce) player.applyStatus(intent.status, intent.statusDuration ||  <= 0 || !player) { if(this.currentHp <= 0) this.determineNextIntent(player); return; }
        this.playerRef = player;
        if (this.hasStatus('Stunned'))1, 1, this.enemyType);
                    break;
                case 'block':
                    modifiedValue = this.applyModifiers('blockGain', baseValue);
                    this.gainBlock(modifiedValue);
                    break; { /* ... keep stun logic ... */ console.log(`${this.name} Stunned.`); this.tickStatusEffects('start', player); this.removeStatus('Stunned'); this.tickStatusEffects('end', player);
                case 'attack_block':
                    const attackVal = this.applyModifiers('damageDealt', intent.attackValue || 0);
                    const blockVal = this.applyModifiers('blockGain', intent.block this.determineNextIntent(player); return; }

        // console.log(`${this.name} executing: ${thisValue || 0);
                    player.takeDamage(attackVal); this.gainBlock(blockVal);
.currentIntent.description || this.currentIntent.type}`); // Noisy
        this.tickStatusEffects('start',                    break;
                case 'debuff':
                    if (intent.status && intent.target === 'player') {
                        player.applyStatus(intent.status, intent.duration || 1, intent.amount || player); // Tick start effects FIRST

        const intent = this.currentIntent;
        let baseValue = intent.baseValue || 0;
        let modifiedValue = this.applyModifiers('damageDealt', baseValue);

        try { // 1, this.enemyType);
                    } else { console.warn(`Invalid debuff intent:`, intent); }
                    break;
                case 'buff':
                    if (intent.status) this.applyStatus(intent.status, intent.duration || 1, intent.amount || 1);
                    break;
                case ' Execute action
            switch (intent.type) {
                case 'attack':
                    player.takeDamage(modifiedValue);
                    if (intent.status) player.applyStatus(intent.status, intent.statusDuration || 1, 1, this.enemyType);
                    break;
                case 'multi_attack':
                    power_up':
                    if (intent.status) this.applyStatus(intent.status, intent.duration || 99, intent.amount || 1);
                    break;
                 case 'special':
                    this.executeSpecialAbility(intent.id, player, gameState);
                    break;
                 case 'none':
                     const count = intent.count || 1; modifiedValue = this.applyModifiers('damageDealt', baseValue);
                    for(let i=0; i < count; i++) player.takeDamage(modifiedValue);
                    if (intent.status && intent.applyStatusOnce) player.applyStatus(intent.status, intent.statusDurationconsole.log(`${this.name} does nothing.`);
                     break;
                default: console.warn(`Unknown intent type executed: ${intent.type}`);
            }
        } catch (error) { console.error(`Error executing intent for ${this.name}:`, error, intent); }

        this.tickStatusEffects('end || 1, 1, this.enemyType);
                    break;
                case 'block': this.gainBlock(this.applyModifiers('blockGain', baseValue)); break;
                case 'attack_block':
                    const attackVal = this.applyModifiers('damageDealt', intent.attackValue || 0); const', player); // End-of-turn effects AFTER action
        this.determineNextIntent(player); // Determine NEXT turn's intent
    }

    /** Handles custom special ability logic from template. */
     executeSpecialAbility(abilityId, player, gameState) {
         if (this.specialAbilities && typeof this.specialAbilities[ability blockVal = this.applyModifiers('blockGain', intent.blockValue || 0);
                    player.takeDamage(attackVal); this.gainBlock(blockVal); break;
                case 'debuff':
                    if (intent.status && intent.target === 'player') player.applyStatus(intent.status, intent.duration || Id] === 'function') {
             // console.log(`${this.name} using special ability: ${abilityId}`); // Noisy
             try { this.specialAbilities[abilityId](this, player, gameState); }
             catch (error) { console.error(`Error executing special ability ${abilityId}:`, error); }
         1, intent.amount || 1, this.enemyType);
                    else console.warn(`Invalid debuff intent:`, intent); break;
                case 'buff': if (intent.status) this.applyStatus(intent.status, intent.duration || 1, intent.amount || 1); break;
                case 'power_up': if (intent.status) this.applyStatus(intent.status, intent.duration || 99} else { console.warn(`Unknown or undefined special ability ID: ${abilityId} for ${this.name}`); }
     }

    /** Applies damage to the enemy. */
    takeDamage(amount, damageElement = null) {
        if (amount <= 0 || this.currentHp <= 0) return;
        let modifiedAmount = amount, intent.amount || 1); break;
                 case 'special': this.executeSpecialAbility(intent.id, player, gameState); break;
                 case 'none': /* Do nothing */ break;
                default: console.warn(`Unknown intent executed: ${intent.type}`);
            }
        } catch (error) { console.error;
        // Apply damageTaken modifiers FIRST
        if (this.hasStatus('Vulnerable')) modifiedAmount = Math.floor(modifiedAmount * 1.5);
        if (this.hasStatus('Intangible')) modifiedAmount(`Error executing intent for ${this.name}:`, error, intent); }

        this.tickStatusEffects('end', player); // Tick end effects AFTER action
        this.determineNextIntent(player); // Determine NEXT intent = Math.max(1, modifiedAmount > 0 ? 1 : 0);
        // Apply elemental mods
        if (damageElement) {
             const weakMult = this.weaknesses[damageElement] || 1.0; const resMult = this.resistances[damageElement] || 1.0;
             modified LAST
    }

    executeSpecialAbility(abilityId, player, gameState) { /* ... keep refined version ... */
        if (this.specialAbilities && typeof this.specialAbilities[abilityId] === 'function') {
             console.log(`${this.name} using special: ${abilityId}`); try { this.specialAbilities[abilityAmount *= weakMult * resMult;
             if(weakMult > 1.0) console.log(`${this.name} Weakness! (${damageElement})`); if(resMult < 1.0) console.log(`${this.name} Resistance! (${damageElement})`);
             modifiedAmount = Math.floor(modifiedAmount);
        Id](this, player, gameState); } catch (error) { console.error(`Error executing special ${abilityId}:`, error); }
         } else { /* ... fallback switch ... */
             switch (abilityId) {
                 case 'mind_twist': if(player) player.applyStatus('Confusion', 1, 1, this.enemyType); if(}
        if (modifiedAmount <= 0) { console.log(`${this.name} damage negated.`); return; }

        const blockConsumed = Math.min(this.currentBlock, modifiedAmount);
        const damageAfterBlock = modifiedAmount - blockConsumed;

        this.wasDamagedLastTurn = true; // Set general flag
        ifplayer) player.applyStatus('Frail', 1, 1, this.enemyType); console.log("Applied Confusion & Frail."); break;
                 default: console.warn(`Unknown special ability ID executed: ${abilityId}`);
             }
         }
     }

    takeDamage(amount, damageElement = null) { /* ... keep refined (blockConsumed > 0) this.currentBlock -= blockConsumed;
        if (damageAfterBlock > 0) {
            this.currentHp -= damageAfterBlock;
            this.wasDamagedUnblockedLastTurn = true; // Set specific flag
            // console.log(`${this.name}: Took ${damageAfterBlock} damage version including wasDamagedUnblockedLastTurn ... */
        if (amount <= 0 || this.currentHp <= 0) return; let modifiedAmount = amount;
        if (this.hasStatus('Vulnerable')) modifiedAmount = Math.floor(modifiedAmount * 1.5); if (this.hasStatus('Intangible')) modifiedAmount.`); // Noisy
        }
        // console.log(`${this.name}: HP: ${this.currentHp}/${this.maxHp}, Block: ${this.currentBlock}`); // Noisy
        if (this.currentHp <= 0) {
             this.currentHp = 0; console.log(`${this.name} defeated!`); this = Math.max(1, modifiedAmount > 0 ? 1 : 0);
         if (damageElement) { const weakMult = this.weaknesses[damageElement] || 1.0; const resMult = this.resistances[damageElement] || 1.0; modifiedAmount *= weakMult * resMult; if.currentIntent = null;
             // Check if this enemy had Thorns, deal damage before dying?
             if (this.hasStatus('Thorns')) {
                const thornDmg = this.getStatusAmount('Thorns');
                console.log(`${this.name}'s Thorns deal ${thornDmg} damage on defeat.`);
                 //(weakMult > 1.0) console.log(`${this.name} Weakness! (${damageElement})`); if(resMult < 1.0) console.log(`${this.name} Resistance! (${damageElement})`); modifiedAmount = Math.floor(modifiedAmount); }
        if (modifiedAmount <= 0) { return; }
        const blockConsumed = Math.min(this.currentBlock, modifiedAmount); const damageAfterBlock Need reference to attacker (Player) - Thorns logic is tricky! Best handled via CombatManager or Player.takeDamage trigger?
                 // Let's assume Thorns is handled when the player ATTACKS, not when the enemy takes damage.
 = modifiedAmount - blockConsumed;
        this.wasDamagedLastTurn = true; // Set general flag
        if (blockConsumed > 0) this.currentBlock -= blockConsumed;
        if (damageAfterBlock > 0) { this.currentHp -= damageAfterBlock; this.wasDamagedUnblockedLastTurn = true;             }
        }
    }

    /** Adds block to the enemy. */
    gainBlock(amount) {
         if (amount <= 0) return; const modifiedAmount = this.applyModifiers('blockGain', amount);
         if (modifiedAmount <=0) return; this.currentBlock += modifiedAmount;
         // console.log(`${ /* console.log(`${this.name}: Took ${damageAfterBlock} damage.`); */ } // Less noisy log
        if (this.currentHp <= 0) { this.currentHp = 0; console.log(`${this.name} defeated!`); this.currentIntent = null; }
    }

    gainBlock(amount) { /* ...this.name}: Gained ${modifiedAmount} Block.`); // Noisy
    }

     // --- Status Effects ---
     applyStatus(statusId, duration, amount = 1, sourceElement = null) {
        let effectiveDuration = duration; let effectiveAmount = amount;
         if(sourceElement && this.resistances[sourceElement]) { /* keep refined version ... */
         if (amount <= 0) return; const modifiedAmount = this.applyModifiers('blockGain', amount);
         if (modifiedAmount <=0) return; this.currentBlock += modifiedAmount;
    }

     // --- Status Effects ---
     applyStatus(statusId, duration, amount = 1, Apply resistance */
              const mult = this.resistances[sourceElement]; effectiveDuration=Math.max(0, Math.floor(duration*mult)); effectiveAmount=Math.max(0, Math.floor(amount*mult sourceElement = null) { /* ... keep refined version ... */
         let effectiveDuration = duration; let effectiveAmount = amount;
         if(sourceElement && this.resistances[sourceElement]) { const mult = this.resistances[sourceElement]; effectiveDuration=Math.max(1, Math.floor(duration*mult)); effectiveAmount=Math.)); // Allow reduction to 0
              if (effectiveDuration < duration || effectiveAmount < amount) console.log(`${this.name} resistance to ${sourceElement} reduced ${statusId}.`);
         }
         // If effectmax(1, Math.floor(amount*mult)); if (effectiveDuration < duration || effectiveAmount < amount) console.log(`${this.name} resistance reduced ${statusId}.`); }
         if (effectiveDuration <= 0 && reduced to 0, don't apply unless it's a duration-based effect with amount=1 maybe?
         if (effectiveDuration <= 0 && effectiveAmount <= 0 && !['Strength', 'Dexterity'].includes(statusId effectiveAmount <= 0 && !['Strength', 'Dexterity'].includes(statusId)) return;
         const existing = this.activeStatusEffects.find(s => s.id === statusId);
         if (existing))) {
              console.log(`${this.name} resisted ${statusId} completely.`);
              return;
         }

        const existing = this.activeStatusEffects.find(s => s.id === statusId); { existing.duration = Math.max(existing.duration, effectiveDuration); existing.amount = (existing.amount || 0) + effectiveAmount; }
         else { let initAmt = (['Strength', 'Dexterity',
        if (existing) {
            existing.duration = Math.max(existing.duration, effectiveDuration);
            existing.amount = (existing.amount || 0) + effectiveAmount;
        } else {
 'Poison', 'Regen', 'Metallicize', 'Thorns'].includes(statusId)) ? effectiveAmount : 1; if (initAmt <= 0 && effectiveDuration <=0) return; this.activeStatusEffects.push({ id            let initAmt = (['Strength', 'Dexterity', 'Poison', 'Regen', 'Metallicize', 'Thorns'].includes(statusId)) ? effectiveAmount : 1;
            if (initAmt: statusId, duration: effectiveDuration, source: sourceElement, amount: initAmt }); }
     }
     removeStatus(statusId) { /* ... keep refined version ... */
        const initLen = this.activeStatusEffects. <= 0 && effectiveDuration <=0) return; // Don't add 0/0
            this.activeStatusEffects.push({ id: statusId, duration: effectiveDuration, source: sourceElement, amount: initAmt });
        length; this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId);
        // if(this.activeStatusEffects.length < initLen) console.log(`${this.name}:}
        // console.log(`${this.name} status ${statusId} updated/applied.`); // Noisy
     }

     removeStatus(statusId) { /* ... keep existing ... */
         this.activeStatusEffects = this.active Removed ${statusId}`);
     }
     hasStatus(statusId) { /* ... keep existing ... */ return this.activeStatusEffects.some(s => s.id === statusId); }
     getStatusAmount(statusId) { /* ... keep existing ... */ const s = this.activeStatusEffects.find(st => st.id === statusId); returnStatusEffects.filter(s => s.id !== statusId);
     }
     hasStatus(statusId) { /* ... keep existing ... */ return this.activeStatusEffects.some(s => s.id === statusId); s ? (s.amount || (s.duration > 0 ? 1 : 0)) : 0; }

     /** Process status effects. */
     tickStatusEffects(phase, player) { /* ... keep refined }
     getStatusAmount(statusId) { /* ... keep existing ... */
         const s = this.activeStatusEffects.find(st => st.id === statusId); return s ? (s.amount || (s.duration version including Burn, Regen, Metallicize ... */
         const effectsToRemove = []; const statusesAtStart = [...this.activeStatusEffects];
         statusesAtStart.forEach(effect => {
            if (!this.activeStatusEffects.includes(effect > 0 ? 1 : 0)) : 0;
     }

     /** Process status effects. */
     tickStatusEffects(phase, player) {
        // console.log(`${this.name}: Ticking ${phase} effects...`); // Noisy
         const effectsToRemove = []; const statusesAtStart = [...this.activeStatusEffects];
)) return;
             let removeAfterTick = false;
             // Start Phase
             if (phase === 'start') {
                 switch(effect.id) {
                     case 'Poison': if (effect.amount > 0) { this.takeDamage(effect.amount, 'Poison'); effect.amount--; if (effect.amount <= 0) effects         statusesAtStart.forEach(effect => {
            if (!this.activeStatusEffects.includes(effect)) return;
             let removeEffectAfterTick = false;
             switch(effect.id) {
                 case 'Poison': if (phase === 'start' && effect.amount > 0) { this.takeDamage(effect.ToRemove.push(effect.id); } break;
                     case 'Burn': if (effect.amount > 0) { this.takeDamage(effect.amount, 'Burn'); /* Amount doesn't decrease, only durationamount, 'Poison'); effect.amount--; if (effect.amount <= 0) effectsToRemove.push(effect.id); } break;
                 case 'Regen': if (phase === 'end' && effect. */ } break;
                 }
             }
             // End Phase
             if (phase === 'end') {
                  switch(effect.id) {
                     case 'Regen': if (effect.amount > 0) {amount > 0) { this.heal(effect.amount); } break;
                 case 'Burn': if (phase === 'start' && effect.amount > 0) { this.takeDamage(effect.amount, 'Burn'); this.heal(effect.amount); } break;
                     case 'Metallicize': if (effect.amount > 0) { this.gainBlock(effect.amount); } break;
                 }
                 // Decrement Duration
                 const is } break;
                 case 'Metallicize': if (phase === 'end' && effect.amount > 0) { this.gainBlock(effect.amount); } break;
                 case 'Intangible': if (phasePassiveStack = ['Strength', 'Dexterity', 'Metallicize', 'Thorns'].includes(effect.id);
                 if (effect.duration !== 99 && !isPassiveStack) {
                     effect.duration === 'end') { removeEffectAfterTick = true; } break; // Intangible often lasts 1 turn
                 // Add other ticks...
             }
             // Decrement Duration
             const isPassiveStack = ['Strength', '--;
                     if (effect.duration <= 0 && !effectsToRemove.includes(effect.id)) effectsToRemove.push(effect.id);
                 }
             }
             if (removeAfterTick && !effectsToRemove.includesDexterity', 'Metallicize', 'Thorns'].includes(effect.id);
             if (phase === 'end' && effect.duration !== 99 && !isPassiveStack) {
                 effect.duration--;
                 if(effect.id)) effectsToRemove.push(effect.id); // For single-tick effects if needed
        });
        if (effectsToRemove.length > 0) { this.activeStatusEffects = this.activeStatusEffects.filter (effect.duration <= 0 && !effectsToRemove.includes(effect.id)) effectsToRemove.push(effect.id);
             }
              if (removeEffectAfterTick && !effectsToRemove.includes(effect.id)) effectsToRemove.push(effect.id);
        });
        if (effectsToRemove.length > 0) { this(e => !effectsToRemove.includes(e.id)); }
     }

     /** Heal the enemy */
     heal(amount) { /* ... keep existing ... */
          if (amount <= 0 || this.currentHp <=.activeStatusEffects = this.activeStatusEffects.filter(e => !effectsToRemove.includes(e.id)); }
     }

     /** Heal the enemy */
     heal(amount) { /* ... keep existing ... 0) return; const actualHeal = Math.min(amount, this.maxHp - this.currentHp);
          if(actualHeal <= 0) return; this.currentHp += actualHeal;
      }

    // */
          if (amount <= 0 || this.currentHp <= 0 || this.currentHp >= this.maxHp) return;
          const actualHeal = Math.min(amount, this.maxHp - this. --- Modifiers ---
     applyModifiers(modifierType, baseValue) { /* ... keep existing refined logic ... */
         let modifiedValue = baseValue;
         if (modifierType === 'damageDealt') { if (thiscurrentHp);
          this.currentHp += actualHeal;
          // console.log(`${this.name} healed ${.hasStatus('Weak')) modifiedValue = Math.floor(modifiedValue * 0.75); if (this.hasStatus('Strength')) modifiedValue += this.getStatusAmount('Strength'); }
         else if (modifieractualHeal}.`); // Noisy
      }

    // --- Modifiers ---
     applyModifiers(modifierType, baseValue) { /* ... keep existing ... */
         let modifiedValue = baseValue;
         if (modifierType === 'damageDealt') { if (this.hasStatus('Weak')) modifiedValue = Math.floor(modifiedType === 'blockGain') { if (this.hasStatus('Dexterity')) modifiedValue += this.getStatusAmount('Dexterity'); if (this.hasStatus('Frail')) modifiedValue = Math.floor(modifiedValue * 0.75); }
         // damageTaken modifiers are handled in takeDamage
         return Math.maxValue * 0.75); if (this.hasStatus('Strength')) modifiedValue += this.getStatusAmount('Strength'); }
         else if (modifierType === 'blockGain') { if (this.hasStatus('Dexterity')) modifiedValue += this.getStatusAmount('Dexterity'); if (this.hasStatus('Frail')) modified(0, Math.floor(modifiedValue));
     }

} // End of Enemy class
