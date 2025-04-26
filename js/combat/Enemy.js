// js/combat/Enemy.js

// Import status effect logic if needed (or handle it within CombatManager/Player)
// import { applyStatus, tickStatusEffects, hasStatus } from './StatusEffects.js'; // Example

// --- Enemy Definitions (Simplified) ---
// In a larger game, this might be loaded from a separate data file (e.g., enemies.js)
const ENEMY_TEMPLATES = {
    'doubt_whisper': {
        name: "Whispering Doubt",
        maxHp: 25,
        sprite: 'assets/images/enemies/doubt_whisper.png', // Placeholder path
        intentions: [ // Pattern of actions
            { type: 'attack', baseValue: 4, status: null },
            { type: 'debuff', status: 'Confusion', duration: 1, target: 'player' }, // Add 'Confusion' card
            { type: 'attack', baseValue: 5, status: null },
        ],
        resistances: { // Example: Higher resistance to Psychological effects
            Psychological: 0.5, // Takes 50% less effect from P-based statuses?
        },
        weaknesses: { // Example: Takes more damage from Cognitive attacks
            Cognitive: 1.5,
        },
        aiBehavior: 'sequential_intent', // How it chooses intents
        onDeathAction: null, // Special effect on death?
    },
    'rigid_perfectionism': {
        name: "Rigid Perfectionism",
        maxHp: 60,
        sprite: 'assets/images/enemies/perfectionism.png', // Placeholder path
        intentions: [
            { type: 'block', baseValue: 10 },
            { type: 'attack', baseValue: 8, status: null },
            { type: 'attack_block', attackValue: 6, blockValue: 6 }, // Attack and block
            { type: 'power_up', status: 'Strength', duration: 1, amount: 2, condition: 'player_damaged_last_turn'}, // Conditional power up
        ],
         resistances: {
             Interaction: 0.75, // Harder to control/debuff
         },
        weaknesses: {
             Psychological: 1.25, // Self-acceptance hurts it
         },
        aiBehavior: 'reactive_pattern',
         onDeathAction: null,
    },
    'shadow_aspect_interaction': { // Example Boss
        name: "Shadow of Unseen Influence",
        maxHp: 150,
        sprite: 'assets/images/enemies/shadow_interaction.png',
        intentions: [ // More complex pool
            { type: 'attack', baseValue: 10, status: 'Weak', statusDuration: 1 },
            { type: 'multi_attack', baseValue: 4, count: 2},
            { type: 'debuff', status: 'Vulnerable', duration: 2, target: 'player' },
            { type: 'block', baseValue: 15 },
            { type: 'special', id: 'mind_twist', description: "Applies Confusion and Dazed" }, // Custom ability
        ],
        resistances: {},
        weaknesses: {}, // Bosses might have phased weaknesses
        aiBehavior: 'random_weighted', // More unpredictable
        onDeathAction: { type: 'reward', insight: 50, artifactId: 'ARTIFACT_ShadowInsight' }
    }
    // Add more enemy types here
};

/**
 * Represents an enemy combatant.
 */
export class Enemy {
    constructor(enemyId, instanceId) {
        const template = ENEMY_TEMPLATES[enemyId];
        if (!template) {
            console.error(`Enemy Error: Template not found for ID: ${enemyId}`);
            // Return a default error enemy?
            this.id = `enemy_error_${instanceId}`;
            this.enemyType = 'error';
            this.name = "Lost Fragment";
            this.maxHp = 1;
            this.currentHp = 1;
            this.sprite = 'assets/images/enemies/error.png';
            this.intentions = [{ type: 'attack', baseValue: 1 }];
            this.currentIntent = null;
            this.currentBlock = 0;
            this.activeStatusEffects = [];
            this.resistances = {};
            this.weaknesses = {};
            this.aiBehavior = 'sequential_intent';
            this.intentCycleIndex = 0;
            this.onDeathAction = null;
            return;
        }

        this.id = `enemy_${enemyId}_${instanceId}`; // Unique ID for this instance in combat
        this.enemyType = enemyId;
        this.name = template.name;
        this.maxHp = template.maxHp;
        this.currentHp = template.maxHp;
        this.sprite = template.sprite; // Path to image asset
        this.intentions = template.intentions; // Array of possible actions/intents
        this.currentIntent = null; // The action planned for the next turn
        this.currentBlock = 0;
        this.activeStatusEffects = []; // { id: 'vulnerable', duration: 1 }
        this.resistances = { ...(template.resistances || {}) };
        this.weaknesses = { ...(template.weaknesses || {}) };
        this.aiBehavior = template.aiBehavior || 'sequential_intent';
        this.intentCycleIndex = 0; // For sequential AI
        this.onDeathAction = template.onDeathAction || null;

        // Internal state flags
        this.wasDamagedLastTurn = false; // For reactive AI

        console.log(`Enemy created: ${this.name} (ID: ${this.id})`);
        this.determineNextIntent(); // Determine initial intent
    }

    /**
     * Determines the enemy's action for the upcoming turn based on its AI behavior.
     * Stores the chosen intent in `this.currentIntent`.
     */
    determineNextIntent() {
        this.currentBlock = 0; // Block typically resets unless specified otherwise
        // Tick status effects that happen at intent determination? (Uncommon)

        switch (this.aiBehavior) {
            case 'sequential_intent':
                this.currentIntent = this.intentions[this.intentCycleIndex];
                this.intentCycleIndex = (this.intentCycleIndex + 1) % this.intentions.length;
                break;

            case 'random_intent':
                const randomIndex = Math.floor(Math.random() * this.intentions.length);
                this.currentIntent = this.intentions[randomIndex];
                break;

            case 'random_weighted': // More complex: needs weights on intentions
                 // Placeholder: act like random for now
                 const randomIndexW = Math.floor(Math.random() * this.intentions.length);
                 this.currentIntent = this.intentions[randomIndexW];
                 break;

            case 'reactive_pattern':
                // Example: Check conditions before picking from pattern
                 const powerUpIntent = this.intentions.find(intent => intent.condition === 'player_damaged_last_turn');
                 if (powerUpIntent && this.wasDamagedLastTurn) { // Need game state flag for this
                     this.currentIntent = powerUpIntent;
                 } else {
                    // Default to sequential if condition not met
                    // Filter out conditional intents if their condition isn't met?
                    const nonConditionalIntents = this.intentions.filter(i => !i.condition);
                    if (nonConditionalIntents.length > 0) {
                        this.currentIntent = nonConditionalIntents[this.intentCycleIndex % nonConditionalIntents.length];
                        this.intentCycleIndex = (this.intentCycleIndex + 1); // Only advance if using pattern part
                    } else {
                         this.currentIntent = this.intentions[0]; // Fallback if only conditional intents exist
                    }
                 }
                this.wasDamagedLastTurn = false; // Reset flag after using it
                break;

            default:
                console.warn(`Unknown AI behavior: ${this.aiBehavior} for ${this.name}. Defaulting to sequential.`);
                this.currentIntent = this.intentions[this.intentCycleIndex];
                this.intentCycleIndex = (this.intentCycleIndex + 1) % this.intentions.length;
        }

        console.log(`${this.name} determined next intent:`, this.currentIntent);
        // TODO: Update Enemy UI to show intent
    }

    /**
     * Executes the enemy's planned action (`this.currentIntent`).
     * Needs access to the player object to apply effects.
     * @param {Player} player - The player object.
     * @param {GameState} gameState - The current game state (for context).
     */
    executeTurn(player, gameState) {
        if (!this.currentIntent || this.currentHp <= 0) {
            console.log(`${this.name} cannot act (no intent or defeated).`);
            return; // Cannot act if no intent or defeated
        }
        if (this.hasStatus('Stunned')) { // Example status check
             console.log(`${this.name} is Stunned and cannot act.`);
             this.removeStatus('Stunned'); // Typically remove stun after skipping turn
             this.determineNextIntent(); // Need a new intent for next turn
             return;
        }


        console.log(`${this.name} executing intent: ${this.currentIntent.type}`);
        this.tickStatusEffects('start'); // Apply start-of-turn effects

        // --- Execute Action based on Intent Type ---
        let baseValue = this.currentIntent.baseValue || 0;
        let modifiedValue = this.applyModifiers('damageDealt', baseValue); // Apply Strength/Weak

        switch (this.currentIntent.type) {
            case 'attack':
                player.takeDamage(modifiedValue);
                break;
            case 'multi_attack':
                const count = this.currentIntent.count || 1;
                 modifiedValue = this.applyModifiers('damageDealt', baseValue); // Apply Strength/Weak to each hit
                for(let i=0; i < count; i++) {
                    player.takeDamage(modifiedValue);
                }
                break;
            case 'block':
                this.gainBlock(this.applyModifiers('blockGain', baseValue)); // Block can also be modified
                break;
            case 'attack_block':
                const attackVal = this.applyModifiers('damageDealt', this.currentIntent.attackValue || 0);
                const blockVal = this.applyModifiers('blockGain', this.currentIntent.blockValue || 0);
                player.takeDamage(attackVal);
                this.gainBlock(blockVal);
                break;
            case 'debuff':
                if (this.currentIntent.status && this.currentIntent.target === 'player') {
                    player.applyStatus(this.currentIntent.status, this.currentIntent.duration || 1, this.id);
                } else {
                    console.warn(`Invalid debuff intent for ${this.name}:`, this.currentIntent);
                }
                break;
             case 'buff': // Buff self
                if (this.currentIntent.status) {
                    this.applyStatus(this.currentIntent.status, this.currentIntent.duration || 1);
                }
                 break;
             case 'power_up': // Often conditional buffs
                 if (this.currentIntent.status) {
                    this.applyStatus(this.currentIntent.status, this.currentIntent.duration || 1, this.currentIntent.amount || 1); // Pass amount if stacking (like Strength)
                 }
                 break;
            case 'special':
                // Handle custom logic based on intent id
                this.executeSpecialAbility(this.currentIntent.id, player, gameState);
                break;
            default:
                console.warn(`Unknown intent type: ${this.currentIntent.type} for ${this.name}`);
        }

         this.tickStatusEffects('end'); // Apply end-of-turn effects
         this.wasDamagedLastTurn = false; // Reset damage flag for next turn's AI decision (will be set by player actions)


        // Determine intent for the *next* turn immediately after acting
        this.determineNextIntent();
    }

     /**
      * Handles custom special ability logic.
      */
     executeSpecialAbility(abilityId, player, gameState) {
         console.log(`${this.name} using special ability: ${abilityId}`);
         switch (abilityId) {
             case 'mind_twist':
                 player.applyStatus('Confusion', 1, this.id);
                 player.applyStatus('Dazed', 1, this.id); // Dazed = Add Dazed status card to discard pile
                 // TODO: Implement adding status cards logic
                 console.log("TODO: Add Dazed card to player discard");
                 break;
             // Add more special abilities here
             default:
                 console.warn(`Unknown special ability ID: ${abilityId}`);
         }
     }


    /**
     * Applies damage to the enemy, considering block.
     * @param {number} amount - The raw amount of damage dealt by the player.
     * @param {string | null} damageElement - Optional element type of the damage for weaknesses/resistances.
     */
    takeDamage(amount, damageElement = null) {
        if (amount <= 0 || this.currentHp <= 0) return;

        let modifiedAmount = amount;

        // Apply Vulnerable status effect
        if (this.hasStatus('Vulnerable')) {
            modifiedAmount = Math.floor(modifiedAmount * 1.5); // Example: 50% more damage
        }

         // Apply Weakness/Resistance based on damage element
         if (damageElement && this.weaknesses[damageElement]) {
            modifiedAmount = Math.floor(modifiedAmount * this.weaknesses[damageElement]);
             console.log(`${this.name} Weakness triggered! (${damageElement})`);
         }
         if (damageElement && this.resistances[damageElement]) {
            modifiedAmount = Math.floor(modifiedAmount * this.resistances[damageElement]);
             console.log(`${this.name} Resistance triggered! (${damageElement})`);
         }


        console.log(`${this.name} attempting to take ${modifiedAmount} damage...`);

        const damageAfterBlock = Math.max(0, modifiedAmount - this.currentBlock);
        const blockConsumed = modifiedAmount - damageAfterBlock;

        this.currentBlock -= blockConsumed;
        this.currentHp -= damageAfterBlock;
        this.wasDamagedLastTurn = true; // Set flag for AI

        console.log(`${this.name}: Block absorbed ${blockConsumed}. Took ${damageAfterBlock} damage.`);
        console.log(`${this.name}: HP: ${this.currentHp}/${this.maxHp}, Block: ${this.currentBlock}`);

        if (this.currentHp <= 0) {
            this.currentHp = 0;
            console.log(`${this.name} has been defeated!`);
            // Trigger onDeath effects (handled by CombatManager potentially)
        }
        // TODO: Update Enemy UI (HP bar, damage numbers)
    }

    /**
     * Adds block to the enemy.
     * @param {number} amount - The amount of block to gain.
     */
    gainBlock(amount) {
        if (amount <= 0) return;
        // Block gain can also be modified by statuses (e.g., 'Fragile')
         const modifiedAmount = this.applyModifiers('blockGain', amount);
        this.currentBlock += modifiedAmount;
        console.log(`${this.name}: Gained ${modifiedAmount} Block. Total: ${this.currentBlock}`);
        // TODO: Update Enemy UI
    }

     // --- Status Effects (Simplified, mirrors Player somewhat) ---
     applyStatus(statusId, duration, amount = 1, source = null) {
        // Check Resistance?
        let effectiveDuration = duration;
         if(this.resistances[source?.primaryElement]) { // If source is a card/player with element
             effectiveDuration = Math.ceil(duration * this.resistances[source.primaryElement]); // Reduce duration
         }


        const existingStatus = this.activeStatusEffects.find(s => s.id === statusId);
        if (existingStatus) {
            existingStatus.duration += effectiveDuration; // Or Math.max? Depends.
            existingStatus.amount = (existingStatus.amount || 0) + amount; // Stacking amount for things like Strength
            console.log(`${this.name}: Refreshed status ${statusId} to duration ${existingStatus.duration}, amount ${existingStatus.amount}`);
        } else {
            this.activeStatusEffects.push({ id: statusId, duration: effectiveDuration, source: source?.id, amount: amount });
            console.log(`${this.name}: Applied status ${statusId} for ${effectiveDuration} turns, amount ${amount}`);
        }
         // TODO: Update Enemy Status UI
    }

     removeStatus(statusId) {
        this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId);
        console.log(`${this.name}: Removed status ${statusId}`);
         // TODO: Update Enemy Status UI
    }

    hasStatus(statusId) {
        return this.activeStatusEffects.some(s => s.id === statusId);
    }

     getStatusAmount(statusId) {
        const status = this.activeStatusEffects.find(s => s.id === statusId);
        return status ? (status.amount || (status.duration > 0 ? 1: 0)) : 0; // Return amount if exists, else 1 if duration > 0, else 0
    }


     tickStatusEffects(phase) { // phase = 'start' or 'end'
        // console.log(`${this.name}: Ticking ${phase}-of-turn status effects...`);
         const effectsToRemove = [];
        this.activeStatusEffects.forEach(effect => {
            // TODO: Implement enemy-specific status effects (e.g. applying poison to player)
            if (effect.id === 'Poison' && phase === 'start') {
                 this.takeDamage(effect.amount || 1); // Poison deals damage
                 effect.amount = (effect.amount || 1) -1; // Poison typically reduces stack
                 if(effect.amount <= 0) effectsToRemove.push(effect.id); // Remove if stack reaches 0
            }


             // Decrement duration (usually at end of turn)
             if (phase === 'end' && !['Strength','Dexterity'].includes(effect.id)) { // Don't decrement duration for passive buffs like str/dex? Or handle differently? Design decision.
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
         // TODO: Update Enemy Status UI
    }

    // --- Modifiers (Simplified) ---
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
        // Add checks for other relevant enemy statuses
        return modifiedValue;
    }


} // End of Enemy class
