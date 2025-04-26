// js/combat/Enemy.js

// Assume templates are defined here or imported
const ENEMY_TEMPLATES = {
    'doubt_whisper': {
        name: "Whispering Doubt", maxHp: 25, sprite: 'assets/images/enemies/doubt_whisper.png',
        intentions: [
            { type: 'attack', baseValue: 4 },
             // Apply 'ConfusionStatus' instead of adding card directly for now
            { type: 'debuff', status: 'Confusion', duration: 1, target: 'player', description: "Inflict Confusion" },
            { type: 'attack', baseValue: 5 },
        ],
        resistances: { Psychological: 0.75 }, weaknesses: { Cognitive: 1.25 }, aiBehavior: 'sequential_intent',
    },
    'rigid_perfectionism': {
        name: "Rigid Perfectionism", maxHp: 60, sprite: 'assets/images/enemies/perfectionism.png',
        intentions: [
            { type: 'block', baseValue: 10 },
            { type: 'attack', baseValue: 8 },
            { type: 'attack_block', attackValue: 6, blockValue: 6 },
            { type: 'power_up', status: 'Strength', duration: 99, amount: 2, condition: 'wasDamagedLastTurn', description: "Gain Strength if Damaged" },
             // Add example: Apply Frail if player has high block?
             { type: 'debuff', status: 'Frail', duration: 1, target: 'player', condition: 'playerHasHighBlock', description: "Inflict Frail" }
        ],
         resistances: { Interaction: 0.75 }, weaknesses: { Psychological: 1.25 }, aiBehavior: 'reactive_pattern',
    },
    'shadow_aspect_interaction': {
        name: "Shadow of Unseen Influence", maxHp: 150, sprite: 'assets/images/enemies/shadow_interaction.png',
        intentions: [
            { type: 'attack', baseValue: 10, status: 'Weak', statusDuration: 1 }, // Attack that also applies weak
            { type: 'multi_attack', baseValue: 4, count: 2},
            { type: 'debuff', status: 'Vulnerable', duration: 2, target: 'player' },
            { type: 'block', baseValue: 15 },
            { type: 'special', id: 'mind_twist', description: "Applies Confusion & Frail" }, // Changed Dazed to Frail for example
             { type: 'buff', status: 'Regen', duration: 2, amount: 5, condition: 'hpBelow50'} // Conditional Regen
        ],
        resistances: { Sensory: 0.8 }, // Example resistance
        weaknesses: { Interaction: 1.25 }, // Example weakness
        aiBehavior: 'random_weighted',
        onDeathAction: { type: 'reward', insight: 50, artifactId: 'ARTIFACT_ShadowInsight' }
    }
};


/**
 * Represents an enemy combatant.
 */
export class Enemy {
    // Keep constructor and existing properties...
    constructor(enemyId, instanceId) {
        const template = ENEMY_TEMPLATES[enemyId];
        if (!template) { /* ... keep error handling ... */
             this.id = `enemy_error_${instanceId}`; this.enemyType = 'error'; this.name = "Lost Fragment"; this.maxHp = 1; this.currentHp = 1; this.sprite = 'assets/images/enemies/error.png'; this.intentions = [{ type: 'attack', baseValue: 1 }]; this.currentIntent = null; this.currentBlock = 0; this.activeStatusEffects = []; this.resistances = {}; this.weaknesses = {}; this.aiBehavior = 'sequential_intent'; this.intentCycleIndex = 0; this.onDeathAction = null;
             console.error(`Enemy Error: Template not found for ID: ${enemyId}`); return;
        }
        this.id = `enemy_${enemyId}_${instanceId}`; this.enemyType = enemyId; this.name = template.name;
        this.maxHp = template.maxHp; this.currentHp = template.maxHp; this.sprite = template.sprite;
        this.intentions = JSON.parse(JSON.stringify(template.intentions)); // Deep copy
        this.currentIntent = null; this.currentBlock = 0; this.activeStatusEffects = [];
        this.resistances = { ...(template.resistances || {}) }; this.weaknesses = { ...(template.weaknesses || {}) };
        this.aiBehavior = template.aiBehavior || 'sequential_intent'; this.intentCycleIndex = 0;
        this.onDeathAction = template.onDeathAction ? { ...template.onDeathAction } : null;
        this.wasDamagedLastTurn = false;
        this.playerRef = null; // Store reference to player if needed for conditions

        console.log(`Enemy created: ${this.name} (ID: ${this.id})`);
        this.determineNextIntent(); // Determine initial intent
    }

    /** Determines the enemy's action for the upcoming turn. */
    determineNextIntent(player = null) { // Accept player state for conditions
        if (this.currentHp <= 0) { this.currentIntent = null; return; }
        this.playerRef = player || this.playerRef; // Update player reference if provided

        if (!this.currentIntent?.keepsBlock) { this.currentBlock = 0; }

        let chosenIntent = null;
        const possibleIntents = this.intentions.filter(intent => {
             if (!intent.condition) return true; // No condition = always possible
             // --- Evaluate Conditions ---
             switch(intent.condition) {
                 case 'wasDamagedLastTurn': return this.wasDamagedLastTurn;
                 case 'hpBelow50': return this.currentHp < this.maxHp * 0.5;
                 case 'hpAbove75': return this.currentHp > this.maxHp * 0.75;
                  case 'playerHasHighBlock': return this.playerRef && this.playerRef.currentBlock >= 10; // Example check
                  case 'selfHasDebuff': return this.activeStatusEffects.some(s => ['Weak', 'Vulnerable', 'Frail'].includes(s.id)); // Example check
                 // Add more complex conditions
                 default: console.warn(`Unknown intent condition: ${intent.condition}`); return true; // Default to possible if condition unknown
             }
        });

        if (possibleIntents.length === 0) {
             console.warn(`${this.name} has no valid intents this turn.`);
             chosenIntent = this.intentions.find(i => !i.condition) || this.intentions[0] || {type:'none', description:'Struggling'}; // Fallback needed
        } else {
            // Apply AI behavior (sequential, random, weighted) to possibleIntents
             // ... (keep AI logic from previous version, using possibleIntents) ...
            switch (this.aiBehavior) {
                case 'sequential_intent':
                     chosenIntent = possibleIntents[this.intentCycleIndex % possibleIntents.length];
                     this.intentCycleIndex = (this.intentCycleIndex + 1);
                    break;
                case 'random_intent': case 'random_weighted': // Needs weights for true weighted
                    const randomIndex = Math.floor(Math.random() * possibleIntents.length);
                    chosenIntent = possibleIntents[randomIndex];
                    break;
                case 'reactive_pattern':
                     chosenIntent = possibleIntents[this.intentCycleIndex % possibleIntents.length];
                     this.intentCycleIndex = (this.intentCycleIndex + 1);
                    break;
                default: chosenIntent = possibleIntents[0];
            }
        }

        this.wasDamagedLastTurn = false; // Reset flag AFTER choosing intent
        this.currentIntent = chosenIntent;
        // console.log(`${this.name} determined next intent:`, this.currentIntent);
    }

    /** Executes the enemy's planned action for the current turn. */
    executeTurn(player, gameState) {
        if (!this.currentIntent || this.currentHp <= 0 || !player) {
            if(this.currentHp <= 0) this.determineNextIntent(player); // Still determine intent to clear it
            return;
        }
        this.playerRef = player; // Ensure playerRef is updated

        if (this.hasStatus('Stunned')) {
             console.log(`${this.name} is Stunned.`);
             this.tickStatusEffects('start', player); // Tick statuses
             this.removeStatus('Stunned');
             this.tickStatusEffects('end', player); // Tick end effects
             this.determineNextIntent(player); // Determine next intent
             return;
        }

        console.log(`${this.name} executing: ${this.currentIntent.description || this.currentIntent.type}`);
        this.tickStatusEffects('start', player); // Apply start-of-turn effects (like poison)

        const intent = this.currentIntent;
        let baseValue = intent.baseValue || 0;
        let modifiedValue = this.applyModifiers('damageDealt', baseValue);

        try {
            switch (intent.type) {
                case 'attack':
                    player.takeDamage(modifiedValue);
                    if (intent.status) player.applyStatus(intent.status, intent.statusDuration || 1, 1, this.enemyType); // Pass enemy type as source element?
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
                 case 'none': // Intentional no-op
                     console.log(`${this.name} is struggling or choosing not to act.`);
                     break;
                default:
                    console.warn(`Unknown intent type executed: ${intent.type}`);
            }
        } catch (error) { console.error(`Error executing intent for ${this.name}:`, error, intent); }

        this.tickStatusEffects('end', player); // Apply end-of-turn effects AFTER action
        this.determineNextIntent(player); // Determine NEXT turn's intent AFTER completing current turn
    }

    /** Handles custom special ability logic. */
     executeSpecialAbility(abilityId, player, gameState) {
         console.log(`${this.name} using special ability: ${abilityId}`);
         if (!player) return;
         try {
             switch (abilityId) {
                 case 'mind_twist':
                     player.applyStatus('Confusion', 1, 1, this.enemyType);
                     player.applyStatus('Frail', 1, 1, this.enemyType); // Changed from Dazed
                     console.log("Applied Confusion & Frail effect.");
                     break;
                 // Add more special abilities here
                 default: console.warn(`Unknown special ability ID: ${abilityId}`);
             }
         } catch (error) { console.error(`Error executing special ability ${abilityId}:`, error); }
     }

    /** Applies damage to the enemy. */
    takeDamage(amount, damageElement = null) { /* ... keep existing refined logic ... */
         if (amount <= 0 || this.currentHp <= 0) return;
        let modifiedAmount = amount;
        if (this.hasStatus('Vulnerable')) modifiedAmount = Math.floor(modifiedAmount * 1.5);
        if (this.hasStatus('Intangible')) modifiedAmount = Math.max(1, modifiedAmount > 0 ? 1 : 0);
         if (damageElement) {
             const weakMult = this.weaknesses[damageElement] || 1.0;
             const resMult = this.resistances[damageElement] || 1.0;
             modifiedAmount *= weakMult * resMult;
             if(weakMult > 1.0) console.log(`${this.name} Weakness triggered! (${damageElement})`);
             if(resMult < 1.0) console.log(`${this.name} Resistance triggered! (${damageElement})`);
             modifiedAmount = Math.floor(modifiedAmount);
         }
        if (modifiedAmount <= 0) { console.log(`${this.name} damage negated.`); return; }
        // console.log(`${this.name} attempting take ${modifiedAmount} damage...`); // Can be noisy
        const blockConsumed = Math.min(this.currentBlock, modifiedAmount);
        const damageAfterBlock = modifiedAmount - blockConsumed;
        if (blockConsumed > 0) this.currentBlock -= blockConsumed;
        if (damageAfterBlock > 0) {
            this.currentHp -= damageAfterBlock; this.wasDamagedLastTurn = true;
            console.log(`${this.name}: Took ${damageAfterBlock} damage.`);
        }
        // console.log(`${this.name}: HP: ${this.currentHp}/${this.maxHp}, Block: ${this.currentBlock}`);
        if (this.currentHp <= 0) {
            this.currentHp = 0; console.log(`${this.name} defeated!`); this.currentIntent = null;
        }
    }

    /** Adds block to the enemy. */
    gainBlock(amount) { /* ... keep existing refined logic ... */
         if (amount <= 0) return;
         const modifiedAmount = this.applyModifiers('blockGain', amount);
         if (modifiedAmount <=0) return;
        this.currentBlock += modifiedAmount;
        // console.log(`${this.name}: Gained ${modifiedAmount} Block. Total: ${this.currentBlock}`);
    }

     // --- Status Effects ---
     applyStatus(statusId, duration, amount = 1, sourceElement = null) {
        // Check Resistance?
        let effectiveDuration = duration;
        let effectiveAmount = amount;
         if(sourceElement && this.resistances[sourceElement]) {
             const multiplier = this.resistances[sourceElement];
             effectiveDuration = Math.max(1, Math.floor(duration * multiplier));
             effectiveAmount = Math.max(1, Math.floor(amount * multiplier));
             if (effectiveDuration < duration || effectiveAmount < amount) {
                  console.log(`${this.name} resistance to ${sourceElement} reduced status ${statusId}.`);
                  // Show UI feedback? this.gameStateRef?.uiManager?.showActionFeedback(`${this.name} Resisted!`, 'info');
             }
         }
         if (effectiveDuration <= 0 && effectiveAmount <= 0 && !['Strength', 'Dexterity'].includes(statusId)) return; // Check validity

        const existingStatus = this.activeStatusEffects.find(s => s.id === statusId);
        if (existingStatus) {
            existingStatus.duration = Math.max(existingStatus.duration, effectiveDuration);
            existingStatus.amount = (existingStatus.amount || 0) + effectiveAmount; // Always stack amount
            // console.log(`${this.name}: Refreshed status ${statusId} to duration ${existingStatus.duration}, amount ${existingStatus.amount}`);
        } else {
            let initialAmount = (['Strength', 'Dexterity', 'Poison', 'Regen'].includes(statusId)) ? effectiveAmount : 1;
            if (initialAmount <= 0) return; // Don't add 0 amount stacks
            this.activeStatusEffects.push({ id: statusId, duration: effectiveDuration, source: sourceElement, amount: initialAmount });
            // console.log(`${this.name}: Applied status ${statusId} for ${effectiveDuration} turns, amount ${initialAmount}`);
        }
        // UI update handled by CombatManager after action/turn
    }

     removeStatus(statusId) {
        const initialLength = this.activeStatusEffects.length;
        this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId);
        // if(this.activeStatusEffects.length < initialLength) console.log(`${this.name}: Removed status ${statusId}`);
        // UI update handled by CombatManager
    }

    hasStatus(statusId) {
        return this.activeStatusEffects.some(s => s.id === statusId);
    }

     getStatusAmount(statusId) {
        const status = this.activeStatusEffects.find(s => s.id === statusId);
        return status ? (status.amount || (status.duration > 0 ? 1 : 0)) : 0;
    }

     /** Process status effects. Needs player ref for effects that target player. */
     tickStatusEffects(phase, player) {
        // console.log(`${this.name}: Ticking ${phase}-of-turn status effects...`);
         const effectsToRemove = [];
         const statusesAtStartOfTick = [...this.activeStatusEffects];

        statusesAtStartOfTick.forEach(effect => {
            if (!this.activeStatusEffects.includes(effect)) return;

             // --- Apply Status Logic ---
             switch(effect.id) {
                 case 'Poison': // Example: Enemy poisons itself? Unlikely, but possible.
                     if (phase === 'start' && effect.amount > 0) {
                          console.log(`${this.name} takes ${effect.amount} poison damage.`);
                          this.takeDamage(effect.amount, 'Poison'); // Element type for poison?
                          effect.amount--;
                          if (effect.amount <= 0) effectsToRemove.push(effect.id);
                     }
                     break;
                 case 'Regen':
                     if (phase === 'end' && effect.amount > 0) {
                          console.log(`${this.name} heals ${effect.amount} from Regen.`);
                          this.heal(effect.amount); // Added heal method below
                     }
                     break;
                 case 'Burn': // Example: Take damage at start, reduce stack
                     if (phase === 'start' && effect.amount > 0) {
                          console.log(`${this.name} takes ${effect.amount} burn damage.`);
                          this.takeDamage(effect.amount, 'Burn'); // Burn element type?
                          effect.amount--;
                          if (effect.amount <= 0) effectsToRemove.push(effect.id);
                     }
                     break;
                  // Add logic for enemy-specific statuses if needed
             }

             // --- Decrement Duration ---
             const isPassiveStack = ['Strength', 'Dexterity', 'Metallicize' /* Others? */].includes(effect.id);
             if (phase === 'end' && effect.duration !== 99 && !isPassiveStack) {
                 effect.duration--;
                 if (effect.duration <= 0 && !effectsToRemove.includes(effect.id)) {
                      effectsToRemove.push(effect.id);
                 }
             }
        });

        if (effectsToRemove.length > 0) {
            // console.log(`   - Removing expired effects on ${this.name}: ${effectsToRemove.join(', ')}`);
            this.activeStatusEffects = this.activeStatusEffects.filter(
                effect => !effectsToRemove.includes(effect.id)
            );
        }
        // UI update handled by CombatManager
    }

     // Add heal method for Regen etc.
     heal(amount) {
         if (amount <= 0 || this.currentHp <= 0) return;
         const actualHeal = Math.min(amount, this.maxHp - this.currentHp);
         if(actualHeal <= 0) return;
         this.currentHp += actualHeal;
         console.log(`${this.name} healed ${actualHeal}. HP: ${this.currentHp}/${this.maxHp}`);
         // UI update handled by CombatManager
     }

    // --- Modifiers ---
     applyModifiers(modifierType, baseValue) { /* ... keep existing refined logic ... */
         let modifiedValue = baseValue;
         if (modifierType === 'damageDealt') {
             if (this.hasStatus('Weak')) modifiedValue = Math.floor(modifiedValue * 0.75);
             if (this.hasStatus('Strength')) modifiedValue += this.getStatusAmount('Strength');
         } else if (modifierType === 'blockGain') {
             if (this.hasStatus('Dexterity')) modifiedValue += this.getStatusAmount('Dexterity');
             if (this.hasStatus('Frail')) modifiedValue = Math.floor(modifiedValue * 0.75);
         } else if (modifierType === 'damageTaken') { // Modifiers applied *to* enemy
             if (this.hasStatus('Vulnerable')) modifiedValue = Math.floor(modifiedValue * 1.5);
             if (this.hasStatus('Intangible')) modifiedValue = Math.max(1, modifiedValue > 0 ? 1 : 0);
         }
         // Note: damageTaken is different from the others. It's applied *when the enemy takes damage*.
         // damageDealt and blockGain are applied *when the enemy calculates its own actions*.
         return Math.max(0, Math.floor(modifiedValue));
     }

} // End of Enemy class
