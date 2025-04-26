// js/combat/Enemy.js

// Import necessary classes if effects require them (unlikely for templates)

// --- Enemy Definitions ---
// Store templates in a separate object for clarity
export const ENEMY_TEMPLATES = {

    // --- Floor 1 Enemies ---
    'doubt_whisper': {
        name: "Whispering Doubt", maxHp: 25, sprite: 'assets/images/enemies/doubt_whisper.png', // Placeholder path
        intentions: [
            { type: 'attack', baseValue: 4, description: "Niggle" },
            { type: 'debuff', status: 'Weak', duration: 1, target: 'player', description: "Sow Weakness" },
            { type: 'attack', baseValue: 5, description: "Questioning Jab" },
            { type: 'debuff', status: 'Frail', duration: 1, target: 'player', description: "Undermine Confidence" }, // Frail = Block less effective
        ],
        resistances: { Psychological: 0.75 }, // Slightly resistant to psychological reassurance?
        weaknesses: { Cognitive: 1.25 }, // Vulnerable to focused thought/logic?
        aiBehavior: 'random_intent', // More unpredictable than sequential
    },
    'fleeting_desire': {
        name: "Fleeting Desire", maxHp: 30, sprite: 'assets/images/enemies/fleeting_desire.png',
        intentions: [
            { type: 'attack', baseValue: 7, description: "Sudden Urge" },
            { type: 'buff', status: 'Dexterity', duration: 99, amount: 2, description: "Become Evasive"}, // Gains Dex (Block)
            { type: 'attack', baseValue: 5, description: "Distracting Glance" },
            { type: 'special', id: 'fade_away', description: "Become Intangible next turn"}, // Intangible = Damage is 1
        ],
        resistances: { Attraction: 0.5 }, // Hard to "attract" or target reliably?
        weaknesses: { Relational: 1.5 }, // Vulnerable to connection/grounding?
        aiBehavior: 'random_weighted', // Define weights later if needed
        specialAbilities: { // Define special logic here
             fade_away: (self, player, gameState) => {
                 self.applyStatus('Intangible', 1); // Apply for 1 turn duration
                 console.log(`${self.name} fades slightly...`);
             }
        }
    },
    'rigid_perfectionism': { // Floor 1 Elite
        name: "Rigid Perfectionism", maxHp: 65, sprite: 'assets/images/enemies/perfectionism.png',
        intentions: [
            { type: 'block', baseValue: 12, description: "Reinforce Standards" },
            { type: 'attack', baseValue: 9, description: "Critical Strike" },
            { type: 'attack_block', attackValue: 7, blockValue: 7, description: "Measured Assault" },
            // Gain strength PERMANENTLY if player took unblocked damage last turn
            { type: 'power_up', status: 'Strength', duration: 99, amount: 1, condition: 'wasDamagedUnblockedLastTurn', description: "Punish Imperfection (+Str)" },
        ],
         resistances: { Interaction: 0.75, Cognitive: 0.8 }, // Resistant to control or clever tricks
         weaknesses: { Psychological: 1.25 }, // Vulnerable to acceptance/letting go
         aiBehavior: 'reactive_pattern', // Prioritizes reacting to player damage
    },

    // --- Floor 2 Enemies ---
    'inner_critic': {
        name: "Inner Critic", maxHp: 45, sprite: 'assets/images/enemies/inner_critic.png',
        intentions: [
             { type: 'multi_attack', baseValue: 3, count: 2, description: "Harsh Words"},
             { type: 'debuff', status: 'Vulnerable', duration: 2, target: 'player', description: "Expose Flaw"},
             { type: 'attack', baseValue: 7, status: 'Weak', statusDuration: 1, description: "Belittle"}, // Attack applies Weak
             { type: 'block', baseValue: 8, description: "Defensive Rationalization"},
        ],
        resistances: { Psychological: 0.6 }, // Very resistant to direct P effects
        weaknesses: { Sensory: 1.25 }, // Grounding in sensation disrupts it?
        aiBehavior: 'random_weighted', // Tends towards debuffs? Needs weights.
    },
    'unmet_need': {
         name: "Unmet Need (Craving)", maxHp: 55, sprite: 'assets/images/enemies/unmet_need.png',
         intentions: [
              { type: 'attack', baseValue: 9, description: "Lashing Out"},
              { type: 'special', id: 'drain_focus', amount: 1, description: "Drain Focus"}, // Steal player resource
              { type: 'buff', status: 'Strength', duration: 99, amount: 1, condition: 'hpBelow50', description: "Grow Desperate (+Str)"}, // Gets stronger when weak
              { type: 'debuff', status: 'Entangle', duration: 1, target: 'player', description: "Cling"}, // Custom status: maybe increase cost of cards?
         ],
         resistances: {},
         weaknesses: { Psychological: 1.5, Relational: 1.25 }, // Vulnerable to direct addressing of need/connection
         aiBehavior: 'reactive_pattern',
         specialAbilities: {
              drain_focus: (self, player, gameState) => {
                  if (player && player.currentFocus > 0) {
                      const amount = self.currentIntent?.amount || 1; // Get amount from intent data
                      player.spendFocus(amount); // Use spendFocus to handle min 0
                       console.log(`${self.name} drains ${amount} Focus.`);
                       // Maybe enemy gains focus or heals?
                       // self.heal(amount * 2);
                  }
              }
         }
    },
     'compulsive_habit': { // Floor 2 Elite
         name: "Compulsive Habit", maxHp: 80, sprite: 'assets/images/enemies/compulsive_habit.png',
         intentions: [ // Repeats a short cycle, maybe gets stronger each cycle?
             { type: 'attack', baseValue: 6, description: "Recurring Thought" },
             { type: 'block', baseValue: 6, description: "Routine Defense" },
             { type: 'multi_attack', baseValue: 3, count: 3, description: "Rapid Fixation" },
             { type: 'special', id: 'cycle_strength', description: "Strengthens Cycle" }
         ],
         resistances: { Cognitive: 0.7 }, // Hard to break the mental pattern
         weaknesses: { Interaction: 1.3 }, // Can be interrupted/controlled?
         aiBehavior: 'sequential_cycle_powerup', // Custom AI needed
         internalCounters: { cycle: 0, strengthBonus: 0 }, // State for AI
         specialAbilities: {
              cycle_strength: (self, player, gameState) => {
                 self.internalCounters.strengthBonus += 1;
                  console.log(`${self.name} strengthens its cycle (+${self.internalCounters.strengthBonus} Str next cycle).`);
                  // Apply temporary Strength buff? Or modify base values next cycle?
                  self.applyStatus('Strength', 1, self.internalCounters.strengthBonus); // Apply strength for next turn
              }
         }
     },


    // --- Floor 3 Enemies ---
    // ... (Define Floor 3 enemies - could be combinations or stronger versions)

    // --- Bosses ---
    'shadow_aspect_interaction': { // Example Boss (Floor 1 or 3?)
        name: "Shadow of Unseen Influence", maxHp: 150, sprite: 'assets/images/enemies/shadow_interaction.png',
        intentions: [ // Larger pool of moves
            { type: 'attack', baseValue: 10, status: 'Weak', statusDuration: 1, description: "Manipulative Strike" },
            { type: 'multi_attack', baseValue: 4, count: 3, description: "Conflicting Signals"}, // Increased count
            { type: 'debuff', status: 'Vulnerable', duration: 2, target: 'player', description: "Exploit Insecurity" },
            { type: 'block', baseValue: 20, description: "Wall of Denial" }, // Stronger block
            { type: 'special', id: 'mind_twist', description: "Applies Confusion & Frail" },
             { type: 'buff', status: 'Strength', duration: 99, amount: 2, condition: 'hpBelow50', description: "Desperate Power"},
             { type: 'debuff', status: 'Entangle', duration: 2, target: 'player', description: "Suffocating Closeness"} // Longer duration debuff
        ],
        resistances: { Sensory: 0.8, Psychological: 0.8 }, // Boss resistances
        weaknesses: { Interaction: 1.25 },
        aiBehavior: 'random_weighted', // Needs weights for phases?
        onDeathAction: { type: 'reward', insight: 50, artifactId: 'ARTIFACT_ShadowInsight' } // Specific artifact drop
         // Bosses might have phases based on HP triggering different intention sets or behaviors.
    }
};


/**
 * Represents an enemy combatant.
 */
export class Enemy {
    constructor(enemyId, instanceId) {
        const template = ENEMY_TEMPLATES[enemyId];
        if (!template) { /* ... keep error handling ... */ return; }

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
        this.specialAbilities = template.specialAbilities || {}; // Store special ability functions
        this.internalCounters = template.internalCounters ? JSON.parse(JSON.stringify(template.internalCounters)) : {}; // Store AI state

        this.wasDamagedLastTurn = false; // General flag
        this.wasDamagedUnblockedLastTurn = false; // More specific flag
        this.playerRef = null; // Reference for condition checks

        // console.log(`Enemy created: ${this.name} (ID: ${this.id})`);
        this.determineNextIntent(); // Determine initial intent
    }

    /** Determines the enemy's action for the upcoming turn. */
    determineNextIntent(player = null) {
        if (this.currentHp <= 0) { this.currentIntent = null; return; }
        this.playerRef = player || this.playerRef;

        if (!this.currentIntent?.keepsBlock) { this.currentBlock = 0; }

        let chosenIntent = null;
        const possibleIntents = this.intentions.filter(intent => {
             if (!intent.condition) return true;
             switch(intent.condition) {
                 case 'wasDamagedLastTurn': return this.wasDamagedLastTurn;
                  case 'wasDamagedUnblockedLastTurn': return this.wasDamagedUnblockedLastTurn; // Check specific flag
                 case 'hpBelow50': return this.currentHp < this.maxHp * 0.5;
                 case 'hpAbove75': return this.currentHp > this.maxHp * 0.75;
                 case 'playerHasHighBlock': return this.playerRef && this.playerRef.currentBlock >= 10;
                  case 'selfHasDebuff': return this.activeStatusEffects.some(s => ['Weak', 'Vulnerable', 'Frail'].includes(s.id));
                 default: return true;
             }
        });

        if (possibleIntents.length === 0) {
             chosenIntent = this.intentions.find(i => !i.condition) || this.intentions[0] || {type:'none', description:'Struggling'};
        } else {
            // Apply AI Behavior
            switch (this.aiBehavior) {
                case 'sequential_intent':
                case 'sequential_cycle_powerup': // Use same logic base, special ability handles powerup
                     chosenIntent = possibleIntents[this.intentCycleIndex % possibleIntents.length];
                     this.intentCycleIndex = (this.intentCycleIndex + 1);
                    break;
                case 'random_intent':
                case 'random_weighted': // Add weights later
                    const randomIndex = Math.floor(Math.random() * possibleIntents.length);
                    chosenIntent = possibleIntents[randomIndex];
                    break;
                case 'reactive_pattern':
                    // Prioritize conditional moves if conditions met?
                    const conditionalMove = possibleIntents.find(i => i.condition);
                     if (conditionalMove) {
                         chosenIntent = conditionalMove;
                     } else {
                         // Cycle through non-conditional moves if no condition met
                         const nonConditional = possibleIntents.filter(i => !i.condition);
                         if (nonConditional.length > 0) {
                            chosenIntent = nonConditional[this.intentCycleIndex % nonConditional.length];
                            this.intentCycleIndex = (this.intentCycleIndex + 1);
                         } else {
                             chosenIntent = possibleIntents[0]; // Fallback if only conditional possible but none met (shouldn't happen often)
                         }
                     }
                    break;
                default:
                    chosenIntent = possibleIntents[0];
            }
        }

        // Reset flags AFTER choosing intent
        this.wasDamagedLastTurn = false;
        this.wasDamagedUnblockedLastTurn = false;

        this.currentIntent = chosenIntent;
    }

    /** Executes the enemy's planned action for the *current* turn. */
    executeTurn(player, gameState) {
        if (!this.currentIntent || this.currentHp <= 0 || !player) {
            if(this.currentHp <= 0) this.determineNextIntent(player);
            return;
        }
        this.playerRef = player; // Update reference

        if (this.hasStatus('Stunned')) { /* ... keep stun logic ... */
             console.log(`${this.name} is Stunned.`); this.tickStatusEffects('start', player);
             this.removeStatus('Stunned'); this.tickStatusEffects('end', player);
             this.determineNextIntent(player); return;
        }

        console.log(`${this.name} executing: ${this.currentIntent.description || this.currentIntent.type}`);
        this.tickStatusEffects('start', player);

        const intent = this.currentIntent;
        let baseValue = intent.baseValue || 0;
        let modifiedValue = this.applyModifiers('damageDealt', baseValue);

        try {
            switch (intent.type) {
                // ... keep cases for attack, multi_attack, block, attack_block, debuff, buff, power_up ...
                case 'attack':
                    player.takeDamage(modifiedValue);
                    if (intent.status) player.applyStatus(intent.status, intent.statusDuration || 1, 1, this.enemyType);
                    break;
                case 'multi_attack':
                    const count = intent.count || 1;
                    modifiedValue = this.applyModifiers('damageDealt', baseValue);
                    for(let i=0; i < count; i++) player.takeDamage(modifiedValue);
                    if (intent.status && intent.applyStatusOnce) player.applyStatus(intent.status, intent.statusDuration || 1, 1, this.enemyType);
                    break;
                case 'block':
                    this.gainBlock(this.applyModifiers('blockGain', baseValue));
                    break;
                case 'attack_block':
                    const attackVal = this.applyModifiers('damageDealt', intent.attackValue || 0);
                    const blockVal = this.applyModifiers('blockGain', intent.blockValue || 0);
                    player.takeDamage(attackVal); this.gainBlock(blockVal);
                    break;
                case 'debuff':
                    if (intent.status && intent.target === 'player') {
                        player.applyStatus(intent.status, intent.duration || 1, intent.amount || 1, this.enemyType);
                    } else { console.warn(`Invalid debuff intent:`, intent); }
                    break;
                case 'buff':
                    if (intent.status) this.applyStatus(intent.status, intent.duration || 1, intent.amount || 1);
                    break;
                case 'power_up':
                    if (intent.status) this.applyStatus(intent.status, intent.duration || 99, intent.amount || 1);
                    break;
                 case 'special':
                    this.executeSpecialAbility(intent.id, player, gameState);
                    break;
                 case 'none':
                     console.log(`${this.name} does nothing.`);
                     break;
                default: console.warn(`Unknown intent type executed: ${intent.type}`);
            }
        } catch (error) { console.error(`Error executing intent for ${this.name}:`, error, intent); }

        this.tickStatusEffects('end', player);
        this.determineNextIntent(player); // Determine NEXT turn's intent
    }

    /** Handles custom special ability logic. */
     executeSpecialAbility(abilityId, player, gameState) {
         if (this.specialAbilities && typeof this.specialAbilities[abilityId] === 'function') {
             console.log(`${this.name} using special ability: ${abilityId}`);
             try {
                 this.specialAbilities[abilityId](this, player, gameState); // Call function defined in template
             } catch (error) {
                  console.error(`Error executing special ability ${abilityId}:`, error);
             }
         } else {
            // Fallback for older definitions or simple cases
             switch (abilityId) {
                 case 'mind_twist':
                     if(player) player.applyStatus('Confusion', 1, 1, this.enemyType);
                     if(player) player.applyStatus('Frail', 1, 1, this.enemyType);
                     console.log("Applied Confusion & Frail effect.");
                     break;
                 default:
                     console.warn(`Unknown or undefined special ability ID: ${abilityId}`);
             }
         }
     }

    /** Applies damage to the enemy. */
    takeDamage(amount, damageElement = null) {
        if (amount <= 0 || this.currentHp <= 0) return;
        let modifiedAmount = amount;
        // Apply damageTaken modifiers FIRST
        if (this.hasStatus('Vulnerable')) modifiedAmount = Math.floor(modifiedAmount * 1.5);
        if (this.hasStatus('Intangible')) modifiedAmount = Math.max(1, modifiedAmount > 0 ? 1 : 0);
        // Apply elemental mods
        if (damageElement) { /* ... keep elemental mod logic ... */
             const weakMult = this.weaknesses[damageElement] || 1.0; const resMult = this.resistances[damageElement] || 1.0;
             modifiedAmount *= weakMult * resMult;
             if(weakMult > 1.0) console.log(`${this.name} Weakness! (${damageElement})`);
             if(resMult < 1.0) console.log(`${this.name} Resistance! (${damageElement})`);
             modifiedAmount = Math.floor(modifiedAmount);
        }
        if (modifiedAmount <= 0) { /* ... log negated ... */ return; }

        const blockConsumed = Math.min(this.currentBlock, modifiedAmount);
        const damageAfterBlock = modifiedAmount - blockConsumed;

        this.wasDamagedLastTurn = true; // Set general flag
        if (blockConsumed > 0) this.currentBlock -= blockConsumed;
        if (damageAfterBlock > 0) {
            this.currentHp -= damageAfterBlock;
            this.wasDamagedUnblockedLastTurn = true; // Set specific flag
            console.log(`${this.name}: Took ${damageAfterBlock} damage.`);
        }
        // console.log(`${this.name}: HP: ${this.currentHp}/${this.maxHp}, Block: ${this.currentBlock}`);
        if (this.currentHp <= 0) { /* ... handle defeat ... */ this.currentHp = 0; this.currentIntent = null; }
    }

    /** Adds block to the enemy. */
    gainBlock(amount) { /* ... keep existing refined logic ... */
         if (amount <= 0) return; const modifiedAmount = this.applyModifiers('blockGain', amount);
         if (modifiedAmount <=0) return; this.currentBlock += modifiedAmount;
    }

     // --- Status Effects ---
     applyStatus(statusId, duration, amount = 1, sourceElement = null) { /* ... keep existing refined logic ... */
        let effectiveDuration = duration; let effectiveAmount = amount;
         if(sourceElement && this.resistances[sourceElement]) { /* Apply resistance */
             const mult = this.resistances[sourceElement]; effectiveDuration=Math.max(1, Math.floor(duration*mult)); effectiveAmount=Math.max(1, Math.floor(amount*mult));
             if (effectiveDuration < duration || effectiveAmount < amount) console.log(`${this.name} resistance to ${sourceElement} reduced ${statusId}.`);
         }
         if (effectiveDuration <= 0 && effectiveAmount <= 0 && !['Strength', 'Dexterity'].includes(statusId)) return;

        const existing = this.activeStatusEffects.find(s => s.id === statusId);
        if (existing) {
            existing.duration = Math.max(existing.duration, effectiveDuration); existing.amount = (existing.amount || 0) + effectiveAmount;
        } else {
            let initAmt = (['Strength', 'Dexterity', 'Poison', 'Regen'].includes(statusId)) ? effectiveAmount : 1;
            if (initAmt <= 0 && effectiveDuration <=0) return; // Don't add 0/0 status
            this.activeStatusEffects.push({ id: statusId, duration: effectiveDuration, source: sourceElement, amount: initAmt });
        }
     }
     removeStatus(statusId) { /* ... keep existing ... */
         const initLen = this.activeStatusEffects.length;
         this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId);
         // if(this.activeStatusEffects.length < initLen) console.log(`${this.name}: Removed ${statusId}`);
     }
     hasStatus(statusId) { /* ... keep existing ... */ return this.activeStatusEffects.some(s => s.id === statusId); }
     getStatusAmount(statusId) { /* ... keep existing ... */
         const s = this.activeStatusEffects.find(st => st.id === statusId); return s ? (s.amount || (s.duration > 0 ? 1 : 0)) : 0;
     }

     /** Process status effects. */
     tickStatusEffects(phase, player) { /* ... keep existing logic, adding Burn/etc. ... */
         const effectsToRemove = []; const statusesAtStart = [...this.activeStatusEffects];
         statusesAtStart.forEach(effect => {
            if (!this.activeStatusEffects.includes(effect)) return;
             // Start Phase Effects
             if (phase === 'start') {
                 if (effect.id === 'Poison' && effect.amount > 0) { this.takeDamage(effect.amount, 'Poison'); effect.amount--; if (effect.amount <= 0) effectsToRemove.push(effect.id); }
                 if (effect.id === 'Burn' && effect.amount > 0) { this.takeDamage(effect.amount, 'Burn'); effect.amount--; if (effect.amount <= 0) effectsToRemove.push(effect.id); }
                 // Add others like Thorns (deal damage to player on attack?) - needs different trigger point
             }
             // End Phase Effects
             if (phase === 'end') {
                 if (effect.id === 'Regen' && effect.amount > 0) { this.heal(effect.amount); }
                 // Decrement Duration
                 const isPassiveStack = ['Strength', 'Dexterity', 'Metallicize'].includes(effect.id);
                 if (effect.duration !== 99 && !isPassiveStack) {
                     effect.duration--;
                     if (effect.duration <= 0 && !effectsToRemove.includes(effect.id)) effectsToRemove.push(effect.id);
                 }
             }
        });
        if (effectsToRemove.length > 0) { this.activeStatusEffects = this.activeStatusEffects.filter(e => !effectsToRemove.includes(e.id)); }
     }

     /** Heal the enemy */
     heal(amount) { /* ... keep existing ... */
          if (amount <= 0 || this.currentHp <= 0) return; const actualHeal = Math.min(amount, this.maxHp - this.currentHp);
          if(actualHeal <= 0) return; this.currentHp += actualHeal;
          // console.log(`${this.name} healed ${actualHeal}. HP: ${this.currentHp}/${this.maxHp}`);
      }

    // --- Modifiers ---
     applyModifiers(modifierType, baseValue) { /* ... keep existing, ensure damageTaken checks Vulnerable/Intangible ... */
         let modifiedValue = baseValue;
         // Modifiers applied *by the enemy* (when calculating its own actions)
         if (modifierType === 'damageDealt') {
             if (this.hasStatus('Weak')) modifiedValue = Math.floor(modifiedValue * 0.75);
             if (this.hasStatus('Strength')) modifiedValue += this.getStatusAmount('Strength');
         } else if (modifierType === 'blockGain') {
             if (this.hasStatus('Dexterity')) modifiedValue += this.getStatusAmount('Dexterity');
             if (this.hasStatus('Frail')) modifiedValue = Math.floor(modifiedValue * 0.75);
         }
         // Modifiers applied *to the enemy* (when taking damage/effects) are handled in takeDamage/applyStatus

         return Math.max(0, Math.floor(modifiedValue));
     }

} // End of Enemy class
