// js/combat/Enemy.js

// Assume templates are defined here or imported
// Example using internal definition for now:
const ENEMY_TEMPLATES = {
    'doubt_whisper': {
        name: "Whispering Doubt", maxHp: 25, sprite: 'assets/images/enemies/doubt_whisper.png',
        intentions: [
            { type: 'attack', baseValue: 4 },
            { type: 'debuff', status: 'Confusion', duration: 1, target: 'player', description: "Add Confused Card" }, // Add description for intent UI
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
            { type: 'power_up', status: 'Strength', duration: 99, amount: 2, condition: 'wasDamagedLastTurn', description: "Gain Strength if Damaged" }, // Permanent Strength stack
        ],
         resistances: { Interaction: 0.75 }, weaknesses: { Psychological: 1.25 }, aiBehavior: 'reactive_pattern',
    },
    'shadow_aspect_interaction': {
        name: "Shadow of Unseen Influence", maxHp: 150, sprite: 'assets/images/enemies/shadow_interaction.png',
        intentions: [
            { type: 'attack', baseValue: 10, status: 'Weak', statusDuration: 1 },
            { type: 'multi_attack', baseValue: 4, count: 2},
            { type: 'debuff', status: 'Vulnerable', duration: 2, target: 'player' },
            { type: 'block', baseValue: 15 },
            { type: 'special', id: 'mind_twist', description: "Applies Confusion & Dazed" },
        ],
        resistances: {}, weaknesses: {}, aiBehavior: 'random_weighted', // Needs actual weights in template
        onDeathAction: { type: 'reward', insight: 50, artifactId: 'ARTIFACT_ShadowInsight' } // Example specific drop
    }
};


/**
 * Represents an enemy combatant.
 */
export class Enemy {
    constructor(enemyId, instanceId) {
        const template = ENEMY_TEMPLATES[enemyId];
        if (!template) {
            // ... (keep error handling constructor from previous version) ...
            this.id = `enemy_error_${instanceId}`; this.enemyType = 'error'; this.name = "Lost Fragment";
            this.maxHp = 1; this.currentHp = 1; this.sprite = 'assets/images/enemies/error.png';
            this.intentions = [{ type: 'attack', baseValue: 1 }]; this.currentIntent = null; this.currentBlock = 0;
            this.activeStatusEffects = []; this.resistances = {}; this.weaknesses = {};
            this.aiBehavior = 'sequential_intent'; this.intentCycleIndex = 0; this.onDeathAction = null;
             console.error(`Enemy Error: Template not found for ID: ${enemyId}`);
            return;
        }

        this.id = `enemy_${enemyId}_${instanceId}`;
        this.enemyType = enemyId;
        this.name = template.name;
        this.maxHp = template.maxHp;
        this.currentHp = template.maxHp;
        this.sprite = template.sprite;
        // Deep copy intentions array to prevent modifications affecting template
        this.intentions = JSON.parse(JSON.stringify(template.intentions));
        this.currentIntent = null;
        this.currentBlock = 0;
        this.activeStatusEffects = [];
        this.resistances = { ...(template.resistances || {}) };
        this.weaknesses = { ...(template.weaknesses || {}) };
        this.aiBehavior = template.aiBehavior || 'sequential_intent';
        this.intentCycleIndex = 0;
        this.onDeathAction = template.onDeathAction ? { ...template.onDeathAction } : null;

        this.wasDamagedLastTurn = false; // Reset flag

        console.log(`Enemy created: ${this.name} (ID: ${this.id})`);
        this.determineNextIntent(); // Determine initial intent immediately on creation
    }

    /**
     * Determines the enemy's action for the upcoming turn based on its AI behavior.
     * Stores the chosen intent in `this.currentIntent`. Should be called AFTER the enemy acts.
     */
    determineNextIntent() {
        if (this.currentHp <= 0) {
            this.currentIntent = null; // No intent if defeated
            return;
        }

        // Reset block only when determining next intent, AFTER the previous turn's block was used.
        // Exception: Some enemies might retain block. Add a flag in template?
        if (!this.currentIntent?.keepsBlock) { // Example flag check
             this.currentBlock = 0;
        }


        let chosenIntent = null;
        // Filter out conditional intents whose conditions aren't met FIRST
        const possibleIntents = this.intentions.filter(intent => {
             if (intent.condition === 'wasDamagedLastTurn') return this.wasDamagedLastTurn;
             if (intent.condition === 'hpBelow50') return this.currentHp < this.maxHp * 0.5;
             // Add more conditions here
             return !intent.condition; // Include intents with no condition
        });

        if (possibleIntents.length === 0) {
             console.warn(`${this.name} has no valid intents this turn. Defaulting.`);
             // Fallback to first non-conditional intent from original list?
             chosenIntent = this.intentions.find(i => !i.condition) || this.intentions[0];
        } else {
            // --- Apply AI Behavior to *filtered* possible intents ---
            switch (this.aiBehavior) {
                case 'sequential_intent':
                     // Cycle through the *original* list, but pick from *possible* intents
                     // This is tricky. Maybe just cycle through possibleIntents?
                     chosenIntent = possibleIntents[this.intentCycleIndex % possibleIntents.length];
                     this.intentCycleIndex = (this.intentCycleIndex + 1); // Always advance cycle index? Or only when using non-conditional? Design choice. Let's always advance for simplicity.
                    break;

                case 'random_intent':
                case 'random_weighted': // Needs weights in template for true weighted random
                    const randomIndex = Math.floor(Math.random() * possibleIntents.length);
                    chosenIntent = possibleIntents[randomIndex];
                    break;

                case 'reactive_pattern': // Condition check is now done via filter above
                    // Default to cycling through the *possible* intents if conditions met
                     chosenIntent = possibleIntents[this.intentCycleIndex % possibleIntents.length];
                     this.intentCycleIndex = (this.intentCycleIndex + 1);
                    break;

                default:
                    console.warn(`Unknown AI behavior: ${this.aiBehavior}. Defaulting.`);
                    chosenIntent = possibleIntents[0]; // Default to first possible
            }
        }

        // Reset flags used for conditions *after* choosing intent
        this.wasDamagedLastTurn = false;

        this.currentIntent = chosenIntent;
        // console.log(`${this.name} determined next intent:`, this.currentIntent); // Can be noisy
        // UI update is handled by CombatManager calling UIManager AFTER all enemies have acted and determined next intent.
    }

    /**
     * Executes the enemy's planned action (`this.currentIntent`) for the *current* turn.
     * Needs access to the player object. Determines *next* intent at the end.
     * @param {Player} player - The player object.
     * @param {GameState} gameState - The current game state (for context).
     */
    executeTurn(player, gameState) {
        if (!this.currentIntent || this.currentHp <= 0) {
            // console.log(`${this.name} cannot act (no intent or defeated).`);
             // Still need to determine next intent even if defeated, to clear it
             if(this.currentHp <= 0) this.determineNextIntent();
            return;
        }
        if (this.hasStatus('Stunned')) {
             console.log(`${this.name} is Stunned and cannot act.`);
             this.tickStatusEffects('start'); // Tick statuses even if stunned
             this.removeStatus('Stunned'); // Stun removed after missing turn
             this.tickStatusEffects('end'); // Tick end effects
             this.determineNextIntent(); // Determine next intent
             return;
        }

        console.log(`${this.name} executing intent: ${this.currentIntent.type}`);
        this.tickStatusEffects('start'); // Apply start-of-turn effects (like poison)

        // --- Execute Action based on currentIntent ---
        const intent = this.currentIntent; // Use current intent
        let baseValue = intent.baseValue || 0;
        let modifiedValue = this.applyModifiers('damageDealt', baseValue);

        try { // Add try-catch around execution
            switch (intent.type) {
                case 'attack':
                    if (player) player.takeDamage(modifiedValue);
                    if (intent.status && player) player.applyStatus(intent.status, intent.statusDuration || 1, this.id);
                    break;
                case 'multi_attack':
                    const count = intent.count || 1;
                    modifiedValue = this.applyModifiers('damageDealt', baseValue); // Recalc for multi-hit
                    for(let i=0; i < count; i++) {
                        if (player) player.takeDamage(modifiedValue);
                         // Apply status per hit? Optional rule.
                         // if (intent.status && player) player.applyStatus(intent.status, intent.statusDuration || 1, this.id);
                    }
                     // Or apply status once after all hits?
                    if (intent.status && player && intent.applyStatusOnce) player.applyStatus(intent.status, intent.statusDuration || 1, this.id);
                    break;
                case 'block':
                    this.gainBlock(this.applyModifiers('blockGain', baseValue));
                    break;
                case 'attack_block':
                    const attackVal = this.applyModifiers('damageDealt', intent.attackValue || 0);
                    const blockVal = this.applyModifiers('blockGain', intent.blockValue || 0);
                    if (player) player.takeDamage(attackVal);
                    this.gainBlock(blockVal);
                    break;
                case 'debuff':
                    if (intent.status && intent.target === 'player' && player) {
                        player.applyStatus(intent.status, intent.duration || 1, this.id);
                    } else {
                        console.warn(`Invalid debuff intent for ${this.name}:`, intent);
                    }
                    break;
                case 'buff': // Buff self
                    if (intent.status) {
                        this.applyStatus(intent.status, intent.duration || 1, intent.amount); // Pass amount if needed
                    }
                    break;
                case 'power_up': // Usually conditional buff self
                    if (intent.status) {
                       this.applyStatus(intent.status, intent.duration || 99, intent.amount || 1); // Default long duration, pass amount
                    }
                    break;
                case 'special':
                    this.executeSpecialAbility(intent.id, player, gameState);
                    break;
                default:
                    console.warn(`Unknown intent type executed: ${intent.type} for ${this.name}`);
            }
        } catch (error) {
            console.error(`Error executing intent for ${this.name}:`, error, intent);
        }


         // --- Post-Action ---
         this.tickStatusEffects('end'); // Apply end-of-turn effects AFTER action completes

         // --- Determine NEXT turn's intent ---
         this.determineNextIntent(); // <<<< MOVED HERE
    }

    /** Handles custom special ability logic. */
     executeSpecialAbility(abilityId, player, gameState) {
         console.log(`${this.name} using special ability: ${abilityId}`);
         if (!player) return; // Need player target usually
         try {
             switch (abilityId) {
                 case 'mind_twist': // Example from template
                     player.applyStatus('Confusion', 1, this.id); // Confused card added by status system potentially
                     // Dazed: Need mechanism to add status cards to player draw/discard
                     gameState?.addStatusCardToPlayerDeck('Dazed', 'discard'); // Example call to GameState helper
                     console.log("Applied Confusion & Dazed effect.");
                     break;
                 // Add more special abilities here based on enemy designs
                 default:
                     console.warn(`Unknown special ability ID executed: ${abilityId}`);
             }
         } catch (error) {
             console.error(`Error executing special ability ${abilityId} for ${this.name}:`, error);
         }
     }


    /** Applies damage to the enemy, considering block and modifiers. */
    takeDamage(amount, damageElement = null) {
        if (amount <= 0 || this.currentHp <= 0) return;

        let modifiedAmount = amount;

        // Apply Vulnerable status first
        if (this.hasStatus('Vulnerable')) {
            modifiedAmount = Math.floor(modifiedAmount * 1.5);
        }
        // Apply Intangible? (Reduce all damage to 1)
        if (this.hasStatus('Intangible')) {
             modifiedAmount = Math.min(modifiedAmount, 1); // Cap damage at 1
        }

         // Apply Weakness/Resistance based on damage element
         if (damageElement) {
             const weaknessMultiplier = this.weaknesses[damageElement] || 1.0;
             const resistanceMultiplier = this.resistances[damageElement] || 1.0;
             modifiedAmount *= weaknessMultiplier;
             modifiedAmount *= resistanceMultiplier; // Apply both
             if(weaknessMultiplier > 1.0) console.log(`${this.name} Weakness triggered! (${damageElement})`);
             if(resistanceMultiplier < 1.0) console.log(`${this.name} Resistance triggered! (${damageElement})`);
             modifiedAmount = Math.floor(modifiedAmount); // Floor after multipliers
         }

        if (modifiedAmount <= 0) {
             console.log(`${this.name} damage negated after modifiers.`);
             return; // Stop if damage reduced to 0 or less
        }

        console.log(`${this.name} attempting to take ${modifiedAmount} damage...`);

        const blockConsumed = Math.min(this.currentBlock, modifiedAmount);
        const damageAfterBlock = modifiedAmount - blockConsumed;

        if (blockConsumed > 0) {
            this.currentBlock -= blockConsumed;
            console.log(`${this.name}: Block absorbed ${blockConsumed}.`);
            // Trigger onBlockBroken effects? (Less common for enemies)
        }

        if (damageAfterBlock > 0) {
            this.currentHp -= damageAfterBlock;
            console.log(`${this.name}: Took ${damageAfterBlock} damage.`);
            this.wasDamagedLastTurn = true; // Set flag for AI reaction next turn
            // Trigger onDamageTaken effects?
        }

        console.log(`${this.name}: HP: ${this.currentHp}/${this.maxHp}, Block: ${this.currentBlock}`);

        if (this.currentHp <= 0) {
            this.currentHp = 0;
            console.log(`${this.name} has been defeated!`);
            this.currentIntent = null; // Clear intent on death
             // CombatManager checks for win condition; onDeathAction applied via GameState.handleCombatEnd potentially
        }
        // UI update handled by CombatManager calling UIManager
    }

    /** Adds block to the enemy. */
    gainBlock(amount) {
        if (amount <= 0) return;
         const modifiedAmount = this.applyModifiers('blockGain', amount);
         if (modifiedAmount <=0) return; // Stop if block gain negated
        this.currentBlock += modifiedAmount;
        console.log(`${this.name}: Gained ${modifiedAmount} Block. Total: ${this.currentBlock}`);
        // UI update handled by CombatManager
    }

     // --- Status Effects ---
     applyStatus(statusId, duration, amount = 1, sourceElement = null) { // Allow passing source element for resistance check
        // Check Resistance based on source element?
        let effectiveDuration = duration;
        let effectiveAmount = amount;
         if(sourceElement && this.resistances[sourceElement]) {
             const multiplier = this.resistances[sourceElement];
             effectiveDuration = Math.max(1, Math.floor(duration * multiplier)); // Don't reduce below 1 turn?
             effectiveAmount = Math.max(1, Math.floor(amount * multiplier));
              console.log(`${this.name} resistance to ${sourceElement} modified status ${statusId}. Duration: ${duration}->${effectiveDuration}, Amount: ${amount}->${effectiveAmount}`);
         }
         if (effectiveDuration <= 0 && effectiveAmount <= 0 && !['Strength', 'Dexterity'].includes(statusId)) return; // Don't apply zero effect non-stacking status

        const existingStatus = this.activeStatusEffects.find(s => s.id === statusId);
        if (existingStatus) {
            existingStatus.duration = Math.max(existingStatus.duration, effectiveDuration); // Refresh to max duration? Or add? Max is simpler.
            existingStatus.amount = (existingStatus.amount || 0) + effectiveAmount; // Always stack amount
            console.log(`${this.name}: Refreshed status ${statusId} to duration ${existingStatus.duration}, amount ${existingStatus.amount}`);
        } else {
            // Amount only matters for stacking effects initially
            let initialAmount = (['Strength', 'Dexterity', 'Poison'].includes(statusId)) ? effectiveAmount : 1;
            this.activeStatusEffects.push({ id: statusId, duration: effectiveDuration, source: sourceElement, amount: initialAmount });
            console.log(`${this.name}: Applied status ${statusId} for ${effectiveDuration} turns, amount ${initialAmount}`);
        }
         // UI update handled by CombatManager
    }

     removeStatus(statusId) {
         const initialLength = this.activeStatusEffects.length;
        this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId);
        if(this.activeStatusEffects.length < initialLength) {
            console.log(`${this.name}: Removed status ${statusId}`);
             // UI update handled by CombatManager
        }
    }

    hasStatus(statusId) {
        return this.activeStatusEffects.some(s => s.id === statusId);
    }

     getStatusAmount(statusId) {
        const status = this.activeStatusEffects.find(s => s.id === statusId);
        return status ? (status.amount || (status.duration > 0 ? 1 : 0)) : 0;
    }

     tickStatusEffects(phase) { // phase = 'start' or 'end'
         const effectsToRemove = [];
         const statusesAtStartOfTick = [...this.activeStatusEffects];

        statusesAtStartOfTick.forEach(effect => {
            if (!this.activeStatusEffects.includes(effect)) return; // Skip if already removed by another tick

             // Apply start-of-turn damage/effects
             if (phase === 'start') {
                 if (effect.id === 'Poison' && effect.amount > 0) {
                     console.log(`${this.name} takes ${effect.amount} poison damage.`);
                     this.takeDamage(effect.amount, 'Poison'); // Poison has an element? Optional.
                     effect.amount--; // Reduce stack amount
                     if (effect.amount <= 0) effectsToRemove.push(effect.id);
                 }
                 // Add other start-of-turn effects like Burn, etc.
             }

             // Decrement duration at end of turn
             const isPassiveStack = ['Strength', 'Dexterity', /* Add others like Metallicize? */].includes(effect.id);
             if (phase === 'end' && effect.duration !== 99 && !isPassiveStack) {
                 effect.duration--;
                 if (effect.duration <= 0 && !effectsToRemove.includes(effect.id)) {
                      effectsToRemove.push(effect.id);
                 }
             }
        });

        if (effectsToRemove.length > 0) {
            this.activeStatusEffects = this.activeStatusEffects.filter(
                effect => !effectsToRemove.includes(effect.id)
            );
        }
          // UI update handled by CombatManager
    }

    // --- Modifiers ---
     applyModifiers(modifierType, baseValue) {
        let modifiedValue = baseValue;
        if (modifierType === 'damageDealt' && this.hasStatus('Weak')) {
            modifiedValue = Math.floor(modifiedValue * 0.75);
        }
        if (modifierType === 'damageDealt' && this.hasStatus('Strength')) {
            modifiedValue += this.getStatusAmount('Strength');
        }
         if (modifierType === 'blockGain' && this.hasStatus('Dexterity')) {
             modifiedValue += this.getStatusAmount('Dexterity');
         }
         if (modifierType === 'blockGain' && this.hasStatus('Frail')) {
            modifiedValue = Math.floor(modifiedValue * 0.75);
        }
        // Add other status checks...

         return Math.max(0, Math.floor(modifiedValue)); // Ensure non-negative
     }

} // End of Enemy class
