// js/combat/Enemy.js

// Assuming ENEMY_TEMPLATES are defined directly in this file for now
export const ENEMY_TEMPLATES = {
    // --- Floor 1 Enemies ---
    'doubt_whisper': {
        name: "Whispering Doubt", maxHp: 25, sprite: 'assets/images/enemies/doubt_whisper.png',
        intentions: [
            { type: 'attack', baseValue: 4, description: "Niggle" },
            { type: 'debuff', status: 'Weak', duration: 1, target: 'player', description: "Sow Weakness" },
            { type: 'attack', baseValue: 5, description: "Questioning Jab" },
            { type: 'debuff', status: 'Frail', duration: 1, target: 'player', description: "Undermine Confidence" },
        ],
        resistances: { Psychological: 0.75 }, weaknesses: { Cognitive: 1.25 }, aiBehavior: 'random_intent',
    },
    'fleeting_desire': {
        name: "Fleeting Desire", maxHp: 30, sprite: 'assets/images/enemies/fleeting_desire.png',
        intentions: [
            { type: 'attack', baseValue: 7, description: "Sudden Urge" },
            { type: 'buff', status: 'Dexterity', duration: 99, amount: 2, description: "Become Evasive (+Dex)"},
            { type: 'attack', baseValue: 5, description: "Distracting Glance" },
            { type: 'special', id: 'fade_away', description: "Become Intangible (1 Turn)"},
        ],
        resistances: { Attraction: 0.5 }, weaknesses: { Relational: 1.5 }, aiBehavior: 'random_weighted',
        specialAbilities: {
             fade_away: (self, player, gameState) => self.applyStatus('Intangible', 1, 1) // Duration 1, Amount 1
         }
    },
    'rigid_perfectionism': { // Floor 1 Elite
        name: "Rigid Perfectionism", maxHp: 65, sprite: 'assets/images/enemies/perfectionism.png',
        intentions: [
            { type: 'block', baseValue: 12, description: "Reinforce Standards" },
            { type: 'attack', baseValue: 9, description: "Critical Strike" },
            { type: 'attack_block', attackValue: 7, blockValue: 7, description: "Measured Assault" },
            { type: 'power_up', status: 'Strength', duration: 99, amount: 1, condition: 'wasDamagedUnblockedLastTurn', description: "Punish Imperfection (+1 Str)" },
            { type: 'debuff', status: 'Frail', duration: 1, target: 'player', condition: 'playerHasHighBlock', description: "Inflict Frail" }
        ],
         resistances: { Interaction: 0.75, Cognitive: 0.8 }, weaknesses: { Psychological: 1.25 }, aiBehavior: 'reactive_pattern',
    },
    // --- Floor 2 Enemies ---
    'inner_critic': {
        name: "Inner Critic", maxHp: 45, sprite: 'assets/images/enemies/inner_critic.png',
        intentions: [
             { type: 'multi_attack', baseValue: 3, count: 2, description: "Harsh Words"},
             { type: 'debuff', status: 'Vulnerable', duration: 2, target: 'player', description: "Expose Flaw"},
             { type: 'attack', baseValue: 7, status: 'Weak', statusDuration: 1, applyStatusOnce: true, description: "Belittle (-Weak)"},
             { type: 'block', baseValue: 8, description: "Defensive Rationalization"},
        ],
        resistances: { Psychological: 0.6 }, weaknesses: { Sensory: 1.25 }, aiBehavior: 'random_weighted',
    },
    'unmet_need': {
         name: "Unmet Need (Craving)", maxHp: 55, sprite: 'assets/images/enemies/unmet_need.png',
         intentions: [
              { type: 'attack', baseValue: 9, description: "Lashing Out"},
              { type: 'special', id: 'drain_focus', amount: 1, description: "Drain Focus"},
              { type: 'power_up', status: 'Strength', duration: 99, amount: 1, condition: 'hpBelow50', description: "Grow Desperate (+1 Str)"},
              { type: 'debuff', status: 'Entangle', duration: 1, target: 'player', amount: 1, description: "Cling (+1 Card Cost)"}, // Entangle defined as increasing cost
         ],
         resistances: {}, weaknesses: { Psychological: 1.5, Relational: 1.25 }, aiBehavior: 'reactive_pattern',
         specialAbilities: {
              drain_focus: (self, player, gameState) => {
                  if (player?.currentFocus > 0) {
                      const amount = self.currentIntent?.amount || 1;
                      player.spendFocus(amount); // Player function handles min 0
                       console.log(`${self.name} drains ${amount} Focus.`);
                       self.heal(amount); // Heal self slightly when draining
                  } else { console.log(`${self.name} tries to drain Focus, but Player has none.`); }
              }
         }
    },
     'compulsive_habit': { // Floor 2 Elite
         name: "Compulsive Habit", maxHp: 80, sprite: 'assets/images/enemies/compulsive_habit.png',
         intentions: [
             { type: 'attack', baseValue: 6, description: "Recurring Thought" },
             { type: 'block', baseValue: 6, description: "Routine Defense" },
             { type: 'multi_attack', baseValue: 3, count: 3, description: "Rapid Fixation" },
             { type: 'special', id: 'cycle_strength', description: "Strengthens Cycle" }
         ],
         resistances: { Cognitive: 0.7 }, weaknesses: { Interaction: 1.3 }, aiBehavior: 'sequential_cycle_powerup',
         internalCounters: { cycle: 0, strengthBonus: 0 }, // AI state
         specialAbilities: {
              cycle_strength: (self, player, gameState) => {
                 self.internalCounters.strengthBonus += 1;
                 // Apply temporary strength buff based on cycle count
                 self.applyStatus('Strength', 1, self.internalCounters.strengthBonus); // Strength lasts 1 turn
                  console.log(`${self.name} strengthens its cycle (+${self.internalCounters.strengthBonus} Str for next turn).`);
              }
         }
     },
    // --- Bosses ---
    'shadow_aspect_interaction': {
        name: "Shadow of Unseen Influence", maxHp: 150, sprite: 'assets/images/enemies/shadow_interaction.png',
        intentions: [
            { type: 'attack', baseValue: 10, status: 'Weak', statusDuration: 1, applyStatusOnce: true, description: "Manipulative Strike" },
            { type: 'multi_attack', baseValue: 4, count: 3, description: "Conflicting Signals"},
            { type: 'debuff', status: 'Vulnerable', duration: 2, target: 'player', description: "Exploit Insecurity" },
            { type: 'block', baseValue: 20, description: "Wall of Denial" },
            { type: 'special', id: 'mind_twist', description: "Applies Confusion & Frail" },
             { type: 'power_up', status: 'Strength', duration: 99, amount: 2, condition: 'hpBelow50', description: "Desperate Power (+2 Str)"},
             { type: 'debuff', status: 'Entangle', duration: 2, target: 'player', amount: 1, description: "Suffocating Closeness (+1 Card Cost)"}
        ],
        resistances: { Sensory: 0.8, Psychological: 0.8 }, weaknesses: { Interaction: 1.25 }, aiBehavior: 'random_weighted',
        onDeathAction: { type: 'reward', insight: 50, artifactId: 'shadow_insight_artifact' } // Changed ID to match artifact def
    }
};


/**
 * Represents an enemy combatant.
 */
export class Enemy {
    constructor(enemyId, instanceId) {
        const template = ENEMY_TEMPLATES[enemyId];
        if (!template) {
             this.id = `enemy_error_${instanceId}`; this.enemyType = 'error'; this.name = "Lost Fragment"; this.maxHp = 1; this.currentHp = 1; this.sprite = 'assets/images/enemies/error.png'; this.intentions = [{ type: 'attack', baseValue: 1 }]; this.currentIntent = null; this.currentBlock = 0; this.activeStatusEffects = []; this.resistances = {}; this.weaknesses = {}; this.aiBehavior = 'sequential_intent'; this.intentCycleIndex = 0; this.onDeathAction = null;
             console.error(`Enemy Error: Template not found for ID: ${enemyId}`); return;
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
        this.wasDamagedLastTurn = false;
        this.wasDamagedUnblockedLastTurn = false; // Flag if HP damage was taken
        this.playerRef = null; // Reference for condition checks

        // console.log(`Enemy created: ${this.name} (ID: ${this.id})`); // Noisy
        this.determineNextIntent(); // Determine initial intent
    }

    /** Determines the enemy's action for the upcoming turn. */
    determineNextIntent(player = null) {
        if (this.currentHp <= 0) { this.currentIntent = null; return; }
        this.playerRef = player || this.playerRef; // Update reference if provided
        if (!this.currentIntent?.keepsBlock) { this.currentBlock = 0; } // Reset block unless specified

        let chosenIntent = null;
        const possibleIntents = this.intentions.filter(intent => { // Filter possible intents based on condition
             if (!intent.condition) return true;
             switch(intent.condition) {
                 case 'wasDamagedLastTurn': return this.wasDamagedLastTurn;
                 case 'wasDamagedUnblockedLastTurn': return this.wasDamagedUnblockedLastTurn;
                 case 'hpBelow50': return this.currentHp < this.maxHp * 0.5;
                 case 'hpAbove75': return this.currentHp > this.maxHp * 0.75;
                 case 'playerHasHighBlock': return this.playerRef && this.playerRef.currentBlock >= 10;
                 case 'selfHasDebuff': return this.activeStatusEffects.some(s => ['Weak', 'Vulnerable', 'Frail'].includes(s.id));
                 // Add more conditions...
                 default: console.warn(`Unknown intent condition: ${intent.condition}`); return true;
             }
        });

        if (possibleIntents.length === 0) { // Fallback if no conditions met
             chosenIntent = this.intentions.find(i => !i.condition) || this.intentions[0] || {type:'none', description:'Hesitating...'};
        } else { // Apply AI behavior to possible intents
            switch (this.aiBehavior) {
                case 'sequential_intent':
                case 'sequential_cycle_powerup':
                    // Cycle through original intentions index but pick from possibles IF the condition matches
                     let attempts = 0; let foundPossible = false;
                     while(attempts < this.intentions.length * 2) { // Limit attempts
                        let potentialIntent = this.intentions[this.intentCycleIndex % this.intentions.length];
                         if (possibleIntents.includes(potentialIntent)) {
                             chosenIntent = potentialIntent;
                             this.intentCycleIndex++; // Advance only when using the cycled intent
                             foundPossible = true;
                             break;
                         }
                         this.intentCycleIndex++; // Advance index even if skipping conditional
                         attempts++;
                     }
                     if (!foundPossible) { // Fallback if cycle doesn't find a possible one
                          chosenIntent = possibleIntents[0] || {type:'none', description:'Faltering...'};
                     }
                    break;
                case 'random_intent':
                case 'random_weighted': // Needs weights for true weighted
                    const randomIndex = Math.floor(Math.random() * possibleIntents.length);
                    chosenIntent = possibleIntents[randomIndex];
                    break;
                case 'reactive_pattern':
                    const conditionalMove = possibleIntents.find(i => i.condition);
                     if (conditionalMove) { chosenIntent = conditionalMove; } // Prioritize reaction
                     else { // Cycle non-conditional if no reaction needed
                         const nonConditional = possibleIntents.filter(i => !i.condition);
                         if (nonConditional.length > 0) {
                            chosenIntent = nonConditional[this.intentCycleIndex % nonConditional.length];
                            this.intentCycleIndex++; // Only advance base pattern index when using non-conditional part
                         } else { chosenIntent = possibleIntents[0] || {type:'none', description:'Hesitating...'}; } // Fallback
                     }
                    break;
                default:
                    chosenIntent = possibleIntents[0]; // Default to first possible
            }
        }
        // Reset flags AFTER choosing intent for next turn
        this.wasDamagedLastTurn = false; this.wasDamagedUnblockedLastTurn = false;
        this.currentIntent = chosenIntent;
        // UI update is handled by CombatManager
    }

    /** Executes the enemy's planned action for the *current* turn. */
    executeTurn(player, gameState) {
        if (!this.currentIntent || this.currentHp <= 0 || !player) { if(this.currentHp <= 0) this.determineNextIntent(player); return; }
        this.playerRef = player; // Ensure reference is fresh
        if (this.hasStatus('Stunned')) { console.log(`${this.name} Stunned.`); this.tickStatusEffects('start', player); this.removeStatus('Stunned'); this.tickStatusEffects('end', player); this.determineNextIntent(player); return; }

        // console.log(`${this.name} executing: ${this.currentIntent.description || this.currentIntent.type}`); // Noisy
        this.tickStatusEffects('start', player); // Tick start effects FIRST

        const intent = this.currentIntent;
        let baseValue = intent.baseValue || 0;
        let modifiedValue; // Calculate inside switch where needed

        try { // Execute action
            switch (intent.type) {
                case 'attack':
                    modifiedValue = this.applyModifiers('damageDealt', baseValue);
                    player.takeDamage(modifiedValue, this.enemyType); // Pass source type? Optional.
                    if (intent.status) player.applyStatus(intent.status, intent.statusDuration || 1, 1, this.enemyType);
                    break;
                case 'multi_attack':
                    const count = intent.count || 1; modifiedValue = this.applyModifiers('damageDealt', baseValue); // Calculate once
                    for(let i=0; i < count; i++) player.takeDamage(modifiedValue, this.enemyType);
                    if (intent.status && intent.applyStatusOnce) player.applyStatus(intent.status, intent.statusDuration || 1, 1, this.enemyType);
                    break;
                case 'block': this.gainBlock(this.applyModifiers('blockGain', baseValue)); break;
                case 'attack_block':
                    const attackVal = this.applyModifiers('damageDealt', intent.attackValue || 0); const blockVal = this.applyModifiers('blockGain', intent.blockValue || 0);
                    player.takeDamage(attackVal, this.enemyType); this.gainBlock(blockVal); break;
                case 'debuff':
                    if (intent.status && intent.target === 'player') player.applyStatus(intent.status, intent.duration || 1, intent.amount || 1, this.enemyType);
                    else console.warn(`Invalid debuff intent:`, intent); break;
                case 'buff': if (intent.status) this.applyStatus(intent.status, intent.duration || 1, intent.amount || 1); break;
                case 'power_up': if (intent.status) this.applyStatus(intent.status, intent.duration || 99, intent.amount || 1); break;
                 case 'special': this.executeSpecialAbility(intent.id, player, gameState); break;
                 case 'none': /* Do nothing */ break;
                default: console.warn(`Unknown intent executed: ${intent.type}`);
            }
        } catch (error) { console.error(`Error executing intent for ${this.name}:`, error, intent); }

        this.tickStatusEffects('end', player); // Tick end effects AFTER action
        this.determineNextIntent(player); // Determine NEXT intent LAST
    }

    /** Handles custom special ability logic from template. */
     executeSpecialAbility(abilityId, player, gameState) {
         if (this.specialAbilities && typeof this.specialAbilities[abilityId] === 'function') {
             // console.log(`${this.name} using special: ${abilityId}`); // Noisy
             try { this.specialAbilities[abilityId](this, player, gameState); }
             catch (error) { console.error(`Error executing special ${abilityId}:`, error); }
         } else { // Fallback for simple hardcoded specials
             switch (abilityId) {
                 case 'mind_twist': if(player) player.applyStatus('Confusion', 1, 1, this.enemyType); if(player) player.applyStatus('Frail', 1, 1, this.enemyType); break;
                 default: console.warn(`Unknown or undefined special ability ID: ${abilityId} for ${this.name}`);
             }
         }
     }

    /** Applies damage to the enemy. */
    takeDamage(amount, damageSourceElement = null) {
        if (amount <= 0 || this.currentHp <= 0) return;
        let dmgAmount = amount;
        // Apply Intangible first
        if (this.hasStatus('Intangible')) { dmgAmount = Math.max(1, dmgAmount > 0 ? 1 : 0); }
        // Apply Vulnerable
        if (this.hasStatus('Vulnerable')) dmgAmount = Math.floor(dmgAmount * 1.5);
        // Apply elemental mods
        if (damageSourceElement) { const weakMult = this.weaknesses[damageSourceElement] || 1.0; const resMult = this.resistances[damageSourceElement] || 1.0; dmgAmount *= weakMult * resMult; if(weakMult > 1.0 || resMult < 1.0) /* console.log(`${this.name} elemental mod applied.`)*/; dmgAmount = Math.floor(dmgAmount); }
        if (dmgAmount <= 0) { return; }

        const blockConsumed = Math.min(this.currentBlock, dmgAmount);
        const damageAfterBlock = dmgAmount - blockConsumed;
        this.wasDamagedLastTurn = true; // General flag
        if (blockConsumed > 0) this.currentBlock -= blockConsumed;
        if (damageAfterBlock > 0) { this.currentHp -= damageAfterBlock; this.wasDamagedUnblockedLastTurn = true; /* console.log(`${this.name} took ${damageAfterBlock} damage.`); */ } // Less noisy

        if (this.currentHp <= 0) { this.currentHp = 0; console.log(`${this.name} defeated!`); this.currentIntent = null; }
    }

    /** Adds block to the enemy. */
    gainBlock(amount) {
         if (amount <= 0) return; const modifiedAmount = this.applyModifiers('blockGain', amount);
         if (modifiedAmount <=0) return; this.currentBlock += modifiedAmount;
    }

     // --- Status Effects ---
     applyStatus(statusId, duration, amount = 1, sourceElement = null) {
        let effectiveDuration = duration; let effectiveAmount = amount;
         if(sourceElement && this.resistances[sourceElement]) { const mult = this.resistances[sourceElement]; effectiveDuration=Math.max(0, Math.floor(duration*mult)); effectiveAmount=Math.max(0, Math.floor(amount*mult)); if (effectiveDuration < duration || effectiveAmount < amount) /* console.log(`${this.name} resistance reduced ${statusId}.`)*/ ; } // Less noisy
         if (effectiveDuration <= 0 && effectiveAmount <= 0 && !['Strength', 'Dexterity'].includes(statusId)) { return; }

        const existing = this.activeStatusEffects.find(s => s.id === statusId);
        if (existing) { existing.duration = Math.max(existing.duration, effectiveDuration); existing.amount = (existing.amount || 0) + effectiveAmount; }
         else { let initAmt = (['Strength', 'Dexterity', 'Poison', 'Regen', 'Metallicize', 'Thorns'].includes(statusId)) ? effectiveAmount : 1; if (initAmt <= 0 && effectiveDuration <=0) return; this.activeStatusEffects.push({ id: statusId, duration: effectiveDuration, source: sourceElement, amount: initAmt }); }
     }
     removeStatus(statusId) { this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId); }
     hasStatus(statusId) { return this.activeStatusEffects.some(s => s.id === statusId); }
     getStatusAmount(statusId) { const s = this.activeStatusEffects.find(st => st.id === statusId); return s ? (s.amount || (s.duration > 0 ? 1 : 0)) : 0; }

     /** Process status effects. */
     tickStatusEffects(phase, player) {
        const effectsToRemove = []; const statusesAtStart = [...this.activeStatusEffects];
        statusesAtStart.forEach(effect => {
            if (!this.activeStatusEffects.includes(effect)) return;
             let removeAfterTick = false;
             // Start Phase
             if (phase === 'start') {
                 switch(effect.id) {
                     case 'Poison': if (effect.amount > 0) { this.takeDamage(effect.amount, 'Poison'); effect.amount--; if (effect.amount <= 0) effectsToRemove.push(effect.id); } break;
                     case 'Burn': if (effect.amount > 0) { this.takeDamage(effect.amount, 'Burn'); } break; // Amount doesn't decrease
                 }
             }
             // End Phase
             if (phase === 'end') {
                  switch(effect.id) {
                     case 'Regen': if (effect.amount > 0) { this.heal(effect.amount); } break;
                     case 'Metallicize': if (effect.amount > 0) { this.gainBlock(effect.amount); } break;
                     case 'Intangible': removeAfterTick = true; break; // Fades at end
                 }
                 // Decrement Duration
                 const isPassiveStack = ['Strength', 'Dexterity', 'Metallicize', 'Thorns'].includes(effect.id);
                 if (effect.duration !== 99 && !isPassiveStack) {
                     effect.duration--;
                     if (effect.duration <= 0 && !effectsToRemove.includes(effect.id)) effectsToRemove.push(effect.id);
                 }
             }
             if (removeAfterTick && !effectsToRemove.includes(effect.id)) effectsToRemove.push(effect.id);
        });
        if (effectsToRemove.length > 0) { this.activeStatusEffects = this.activeStatusEffects.filter(e => !effectsToRemove.includes(e.id)); }
     }

     /** Heal the enemy */
     heal(amount) {
          if (amount <= 0 || this.currentHp <= 0 || this.currentHp >= this.maxHp) return;
          const actualHeal = Math.min(amount, this.maxHp - this.currentHp);
          this.currentHp += actualHeal;
      }

    // --- Modifiers ---
     applyModifiers(modifierType, baseValue) {
         let modifiedValue = baseValue;
         if (modifierType === 'damageDealt') { if (this.hasStatus('Weak')) modifiedValue = Math.floor(modifiedValue * 0.75); if (this.hasStatus('Strength')) modifiedValue += this.getStatusAmount('Strength'); }
         else if (modifierType === 'blockGain') { if (this.hasStatus('Dexterity')) modifiedValue += this.getStatusAmount('Dexterity'); if (this.hasStatus('Frail')) modifiedValue = Math.floor(modifiedValue * 0.75); }
         // damageTaken mods handled in takeDamage
         return Math.max(0, Math.floor(modifiedValue));
     }

     // --- End of Combat Cleanup ---
     /** Called by CombatManager or GameState when combat ends */
     cleanupCombatStatuses() {
         const initialLength = this.activeStatusEffects.length;
         this.activeStatusEffects = this.activeStatusEffects.filter(effect => {
              // Define statuses that persist between fights for enemies (e.g. none?)
              const persist = [/*'PermanentEnemyCurse'*/].includes(effect.id);
              return persist;
         });
         // if(this.activeStatusEffects.length < initialLength) console.log(`${this.name} cleaned up temporary statuses.`); // Noisy
     }

} // End of Enemy class
