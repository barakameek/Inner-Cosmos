// js/enemy.js

class Enemy {
    /**
     * Creates an instance of an enemy for combat.
     * @param {string} enemyId - The ID of the enemy definition from enemyData.js.
     * @param {number} positionX - X coordinate for rendering.
     * @param {number} positionY - Y coordinate for rendering.
     */
    constructor(enemyId, positionX, positionY) {
        this.definition = getEnemyDefinition(enemyId);
        if (!this.definition) {
            console.error(`Failed to create Enemy instance: Definition not found for ID '${enemyId}'. Using fallback.`);
            this.definition = new EnemyDefinition({ // Fallback definition
                id: 'fallback_error', name: 'Error Foe', archetype: EnemyArchetype.DOUBT, maxHp: 10, moveSet: [{ id: 'fallback_attack', intentType: 'Attack', damage: 1 }]
            });
        }

        this.instanceId = uuidv4(); // Unique ID for this specific instance
        this.id = this.definition.id; // Base definition ID
        this.name = this.definition.name;
        this.archetype = this.definition.archetype;
        this.maxHp = this.definition.maxHp;
        this.currentHp = this.maxHp;
        this.weakness = this.definition.weakness;
        this.resistance = this.definition.resistance;

        this.position = { x: positionX, y: positionY }; // For rendering

        // Combat State
        this.statusEffects = {}; // e.g., { [StatusEffects.GUARD]: 0, [StatusEffects.VULNERABLE]: 1, Strength: 2 }
        this.currentMove = null; // The EnemyMove object chosen for the current turn (intent)
        this.moveHistory = []; // Track recent moves for AI patterns/cooldowns
        this.moveCooldowns = {}; // Track cooldowns for specific move IDs { moveId: turnsRemaining }
        this.currentPhase = 1; // For multi-phase bosses

        // --- Rendering properties ---
        this.width = 100; // Example dimensions, adjust as needed
        this.height = 150;
        this.intentIcon = null; // Stores the icon string for the current intent
        this.intentValue = null; // Stores damage/block value for intent display

        console.log(`Enemy instance created: ${this.name} (ID: ${this.id}, Instance: ${this.instanceId.substring(0,4)})`);
    }

    // --- Combat Turn Management ---

    startTurn(combatManager) {
        this.updateStatusDurations();
        this.updateCooldowns();
        // Trigger start-of-turn effects (if any defined in specialMechanics)
        // Example: Passive regeneration?
    }

    /**
     * Choose the next move based on the move set, weights, cooldowns, and HP thresholds.
     * This determines the *intent* for the next turn.
     */
    chooseNextMove() {
        let availableMoves = this.definition.moveSet.filter(move => {
            // Check HP thresholds
            const hpPercent = this.currentHp / this.maxHp;
            if (move.minHpThreshold !== undefined && hpPercent * 100 >= move.minHpThreshold) return false;
            if (move.maxHpThreshold !== undefined && hpPercent * 100 <= move.maxHpThreshold) return false;

            // Check cooldowns
            if (this.moveCooldowns[move.id] && this.moveCooldowns[move.id] > 0) return false;

            // Check initial cooldown (if applicable, only for turn 1 typically)
            // Need turn counter from combat manager for this check
            // if (move.initialCooldown && combatManager.turnCount === 1) return false; // Needs turn count

            // Check phase restrictions if it's a boss with multiple movesets
            if (this.definition.moveSetDefinitions && this.definition.specialMechanics?.phaseChangeThresholds) {
                 // This logic needs to be integrated with phase changes - assume moveSet is already correct for current phase for now
            }

            return true;
        });

        if (availableMoves.length === 0) {
            console.warn(`Enemy ${this.name} has no available moves! Using fallback.`);
            // Provide a basic fallback move if none are available
            // This should ideally not happen with good move set design
            availableMoves.push({ id: 'fallback_wait', intentType: 'Special', description: "Waiting...", weight: 1 });
        }

        // Calculate total weight
        const totalWeight = availableMoves.reduce((sum, move) => sum + (move.weight || 1), 0);
        let randomRoll = Math.random() * totalWeight;

        // Select move based on weight
        let chosenMove = availableMoves[availableMoves.length - 1]; // Default to last if roll fails
        for (const move of availableMoves) {
            const weight = move.weight || 1;
            if (randomRoll < weight) {
                chosenMove = move;
                break;
            }
            randomRoll -= weight;
        }

        this.currentMove = chosenMove;
        this.moveHistory.push(chosenMove.id); // Track history
        this.setIntentDisplay(); // Update display values for UI
        console.log(`${this.name} intends to use: ${this.currentMove.id} (${this.currentMove.intentType})`);
    }

    /** Updates intent icon and value based on the currentMove */
    setIntentDisplay() {
        if (!this.currentMove) {
            this.intentIcon = null;
            this.intentValue = null;
            return;
        }

        this.intentValue = null; // Reset
        switch (this.currentMove.intentType) {
            case 'Attack':
                this.intentIcon = '⚔️';
                this.intentValue = this.calculateIntentDamage();
                break;
            case 'Defend':
                this.intentIcon = '🛡️'; // Shield icon
                this.intentValue = this.currentMove.block || null;
                break;
            case 'Debuff':
                this.intentIcon = '⬇️'; // Down arrow
                // Could show stacks: this.intentValue = this.currentMove.applyStatus?.amount;
                break;
             case 'Buff':
                this.intentIcon = '⬆️'; // Up arrow
                 break;
            case 'Dilemma':
                 this.intentIcon = '❓'; // Question mark
                 break;
             case 'AttackDebuff':
                 this.intentIcon = '⚔️⬇️'; // Combined icon
                 this.intentValue = this.calculateIntentDamage();
                 break;
             case 'Special': // Generic special/unique action
             default:
                this.intentIcon = '✨'; // Sparkles
                 break;
        }
    }

    calculateIntentDamage() {
        if (!this.currentMove || !this.currentMove.damage) return 0;

        let baseDamage = this.currentMove.damage;

        // Factor in enemy's Strength status
        baseDamage += this.getStatus('Strength'); // Assuming 'Strength' is a simple value added to damage

        // Factor in move-specific modifiers (like Anger Ember's flare_up)
        if (this.currentMove.effectsModifiers?.condition === 'hp_below_50' && (this.currentHp / this.maxHp) < 0.5) {
            baseDamage += this.currentMove.effectsModifiers.damageBonus || 0;
        }
        // Add other modifier checks here

        return Math.max(0, baseDamage); // Ensure damage isn't negative
    }

    /** Executes the chosen move. Should be called by CombatManager. */
    executeMove(player, combatManager) {
        if (!this.currentMove) {
            console.log(`${this.name} has no move selected, skipping turn.`);
            return;
        }

        console.log(`${this.name} executes move: ${this.currentMove.id}`);

        // Apply effects based on move definition
        // --- Damage ---
        const dealDamage = this.calculateIntentDamage(); // Recalculate in case Strength changed mid-turn
        if (dealDamage > 0) {
             player.takeBruise(dealDamage);
        }
        // --- Block ---
        if (this.currentMove.block) {
            this.applyStatus(StatusEffects.GUARD, this.currentMove.block);
        }
        // --- Apply Status (to player or self) ---
        if (this.currentMove.applyStatus) {
            const statusInfo = this.currentMove.applyStatus;
            const target = (statusInfo.target === 'player') ? player : this;
            if (target) {
                 // Handle potential element freezing specially
                 if(statusInfo.status === StatusEffects.FREEZE && statusInfo.element) {
                      target.applyStatus(statusInfo.status + '_' + statusInfo.element, statusInfo.amount || 1, statusInfo.duration || 1); // Append element to status ID
                 } else {
                      target.applyStatus(statusInfo.status, statusInfo.amount || 1, statusInfo.duration || 1);
                 }
            }
        }
         // --- Trigger Dilemma ---
         if (this.currentMove.intentType === 'Dilemma' && this.currentMove.dilemma) {
              combatManager.triggerDilemma(this.currentMove.dilemma);
         }
         // --- Special Effects (e.g., add cards to deck) ---
         if (this.currentMove.effects?.addCardToDrawPile || this.currentMove.effects?.addCardToDiscard || this.currentMove.effects?.addCardToHand) {
              const effect = this.currentMove.effects.addCardToDrawPile || this.currentMove.effects.addCardToDiscard || this.currentMove.effects.addCardToHand;
              const pile = this.currentMove.effects.addCardToDrawPile ? 'draw' : this.currentMove.effects.addCardToHand ? 'hand' : 'discard';
              const cardDef = getCardDefinition(effect.cardId);
              if (cardDef) {
                  const count = effect.count || 1;
                  for(let i=0; i<count; i++) {
                      const newCard = new Card(cardDef); // *** Requires Card class ***
                      player.addCardToDeck(newCard, pile); // Add to player's deck
                  }
              } else {
                  console.warn(`Could not find card definition for '${effect.cardId}' needed by enemy move.`);
              }
         }


        // Set cooldown if applicable
        if (this.currentMove.cooldown) {
            this.moveCooldowns[this.currentMove.id] = this.currentMove.cooldown + 1; // +1 because it decrements at start of next turn
        }

        // Clear the executed move (intent)
        this.currentMove = null;
        this.intentIcon = null;
        this.intentValue = null;
    }

    updateCooldowns() {
        for (const moveId in this.moveCooldowns) {
             if (this.moveCooldowns[moveId] > 0) {
                 this.moveCooldowns[moveId]--;
             }
        }
    }

    // --- Health & Status ---

    takeBruise(amount, sourceElement = Elements.NEUTRAL) {
        let damageToTake = amount;
        let isWeaknessHit = false;

        // Apply Weakness/Resistance
        if (sourceElement !== Elements.NEUTRAL) {
            if (sourceElement === this.weakness) {
                damageToTake = Math.floor(damageToTake * WEAKNESS_MULTIPLIER);
                isWeaknessHit = true;
                console.log(`${this.name} hit for Weakness (${sourceElement})! Damage increased to ${damageToTake}`);
            } else if (sourceElement === this.resistance) {
                damageToTake = Math.floor(damageToTake * RESISTANCE_MULTIPLIER);
                 console.log(`${this.name} hit for Resistance (${sourceElement}). Damage reduced to ${damageToTake}`);
                 // Trigger Dissonance penalty in CombatManager/Player based on return value?
            }
        }

        // Apply Vulnerable (if present)
        if (this.hasStatus(StatusEffects.VULNERABLE)) {
            damageToTake = Math.floor(damageToTake * VULNERABLE_MULTIPLIER);
             console.log(`${this.name} is Vulnerable. Damage increased to ${damageToTake}`);
        }

        // Apply Guard
        const guard = this.getStatus(StatusEffects.GUARD);
        if (guard > 0) {
            const blockedAmount = Math.min(guard, damageToTake);
            this.applyStatus(StatusEffects.GUARD, -blockedAmount); // Decrease guard
            damageToTake -= blockedAmount;
            console.log(`${this.name} Blocked ${blockedAmount} Bruise. Remaining Guard: ${this.getStatus(StatusEffects.GUARD)}`);
        }

        // Apply damage to HP
        if (damageToTake > 0) {
            const actualHpLoss = Math.min(damageToTake, this.currentHp);
            this.currentHp -= actualHpLoss;
            console.log(`${this.name} took ${damageToTake} Bruise. Current HP: ${this.currentHp}/${this.maxHp}`);

            // Trigger onHpLoss mechanics (e.g., Fear Construct gain Strength)
            if (this.definition.specialMechanics?.onHpLoss) {
                 const mech = this.definition.specialMechanics.onHpLoss;
                 if(mech.action === 'applyStatusToSelf') {
                      this.applyStatus(mech.status, mech.amount || 1, mech.duration || Infinity);
                 }
            }
             // Check for phase changes after taking damage
             this.checkPhaseChange();

            return {
                actualHpLoss: actualHpLoss,
                isWeaknessHit: isWeaknessHit,
                isResistanceHit: sourceElement === this.resistance,
                sourceElement: sourceElement
            }; // Return info for CombatManager (Resonance, Dissonance)
        }
        return { actualHpLoss: 0, isWeaknessHit: false, isResistanceHit: sourceElement === this.resistance, sourceElement: sourceElement }; // No HP lost
    }

    applyStatus(effectId, amount, duration = Infinity) {
        // Handle stackable value types (Guard, Strength, etc.)
        if (effectId === StatusEffects.GUARD || effectId === 'Strength' /* add other stackable value types */) {
            if (!this.statusEffects[effectId]) this.statusEffects[effectId] = 0;
            this.statusEffects[effectId] += amount;
             // Ensure Guard doesn't go below 0
             if (effectId === StatusEffects.GUARD) this.statusEffects[effectId] = Math.max(0, this.statusEffects[effectId]);
        } else {
            // For duration-based statuses (Vulnerable, Weak), replace or update
            // If applying positive amount, set/replace
            if (amount > 0) {
                 // If already present, maybe add duration or take max amount? Let's replace for simplicity.
                 this.statusEffects[effectId] = { amount: amount, duration: duration };
            }
            // Applying negative amount could potentially remove stacks, but needs careful design.
            // For now, negative amounts mainly used internally for Guard.
        }
        console.log(`${this.name} Applied status: ${effectId}, Amount: ${amount}, Duration: ${duration}. Current value: ${this.getStatus(effectId)}`);
    }

    getStatus(effectId) {
        const status = this.statusEffects[effectId];
        if (!status) return 0;
        if (typeof status === 'number') return status;
        if (typeof status === 'object' && status.amount !== undefined) return status.amount;
        return 0;
    }

     hasStatus(effectId) {
         const status = this.statusEffects[effectId];
         if (!status) return false;
         if (typeof status === 'number') return status > 0;
         if (typeof status === 'object') return status.amount > 0 && (status.duration > 0 || status.duration === Infinity);
         return false;
     }

     updateStatusDurations() {
         // Reset Guard? Usually enemies keep Guard until broken unless specified otherwise.
         // statusEffects[StatusEffects.GUARD] = 0;

        for (const key in this.statusEffects) {
            const status = this.statusEffects[key];
            if (status && typeof status === 'object' && status.duration !== undefined && status.duration !== Infinity) {
                status.duration--;
                if (status.duration <= 0) {
                    console.log(`Enemy ${this.name} status effect '${key}' expired.`);
                    delete this.statusEffects[key];
                }
            }
        }
    }

    // --- Phase Management (for Bosses) ---
    checkPhaseChange() {
        if (!this.definition.specialMechanics?.phaseChangeThresholds) return;

        const hpPercent = this.currentHp / this.maxHp;
        const thresholds = this.definition.specialMechanics.phaseChangeThresholds; // e.g., [0.5] means change at 50%

        // Find the highest threshold crossed (which corresponds to the new phase)
        let newPhase = 1;
        for (let i = 0; i < thresholds.length; i++) {
            if (hpPercent <= thresholds[i]) {
                newPhase = i + 2; // Phase index is threshold index + 2 (Phase 1 is default)
            } else {
                break; // Stop checking once a threshold isn't met
            }
        }

        if (newPhase > this.currentPhase) {
             console.log(`${this.name} entering Phase ${newPhase}!`);
             this.currentPhase = newPhase;
             // Trigger phase change actions
             const phaseAction = this.definition.specialMechanics.onPhaseChange?.find(action => action.phase === newPhase);
             if (phaseAction) {
                 if (phaseAction.action === 'changeMoveSet' && this.definition.moveSetDefinitions?.[phaseAction.newMoveSetId]) {
                      console.log(`${this.name} changing move set to ${phaseAction.newMoveSetId}`);
                      // Replace the effective move set for AI logic
                      // This assumes the definition structure allows easy swapping
                      this.definition.moveSet = this.definition.moveSetDefinitions[phaseAction.newMoveSetId];
                      // Reset cooldowns? Clear history? Maybe.
                      this.moveCooldowns = {};
                      this.moveHistory = [];
                 }
                  // Add other actions like self-buffs, debuffs, etc.
                 if (phaseAction.action === 'applyStatusToSelf') {
                      this.applyStatus(phaseAction.status, phaseAction.amount || 1, phaseAction.duration || Infinity);
                 }
             }
             // Re-choose move immediately? Or wait until next turn? Usually wait.
        }
    }


    // --- Rendering ---
    render(ctx) {
         // Placeholder rectangle for enemy sprite
         ctx.fillStyle = '#A0522D'; // Brownish placeholder
         ctx.strokeStyle = '#333';
         ctx.lineWidth = 2;
         ctx.fillRect(this.position.x - this.width / 2, this.position.y - this.height, this.width, this.height);
         ctx.strokeRect(this.position.x - this.width / 2, this.position.y - this.height, this.width, this.height);

         // Render Name
         ctx.fillStyle = '#FFF';
         ctx.font = '14px sans-serif';
         ctx.textAlign = 'center';
         ctx.textBaseline = 'bottom';
         ctx.fillText(this.name, this.position.x, this.position.y - this.height - 50); // Position above HP bar

         // Render HP Bar
         const hpBarWidth = this.width * 0.8;
         const hpBarHeight = 10;
         const hpBarX = this.position.x - hpBarWidth / 2;
         const hpBarY = this.position.y - this.height - 20; // Above enemy rect
         const hpPercent = this.currentHp / this.maxHp;

         ctx.fillStyle = '#555'; // Background
         ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
         ctx.fillStyle = '#D9534F'; // HP color (Red)
         ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight);
         // HP Text
         ctx.fillStyle = '#FFF';
         ctx.font = '10px sans-serif';
         ctx.textBaseline = 'middle';
         ctx.fillText(`${this.currentHp}/${this.maxHp}`, this.position.x, hpBarY + hpBarHeight / 2);


         // Render Guard (if any)
         const guardAmount = this.getStatus(StatusEffects.GUARD);
         if (guardAmount > 0) {
             const guardIconX = hpBarX - 15; // Left of HP bar
             const guardIconY = hpBarY + hpBarHeight / 2;
             ctx.fillStyle = '#428BCA'; // Blueish for Guard
             ctx.font = 'bold 14px sans-serif';
             ctx.textAlign = 'right';
             ctx.fillText(`🛡️${guardAmount}`, guardIconX, guardIconY);
         }

         // Render Status Effects Icons (below HP bar)
         let statusIconX = hpBarX;
         const statusIconY = hpBarY + hpBarHeight + 15;
         const iconSize = 16;
         Object.entries(this.statusEffects).forEach(([key, value]) => {
            if (key === StatusEffects.GUARD) return; // Already displayed

            let icon = '?';
            let amount = 0;
            let color = '#FFF';

            if (typeof value === 'number') amount = value; // Simple numeric status (Strength)
            else if (typeof value === 'object') amount = value.amount; // Duration-based

            if (amount <= 0) return; // Don't show empty statuses

             switch (key) {
                 case StatusEffects.VULNERABLE: icon = '💥'; color = '#FF8C00'; break; // Orange burst
                 case StatusEffects.WEAK: icon = '💧'; color = '#ADD8E6'; break; // Blue drop
                 case 'Strength': icon = '💪'; color = '#FF6347'; break; // Red muscle
                 // Add more icons/colors
             }

             ctx.fillStyle = color;
             ctx.font = `bold ${iconSize}px sans-serif`;
             ctx.textAlign = 'left';
             ctx.textBaseline = 'middle';
             ctx.fillText(`${icon}${amount}`, statusIconX, statusIconY);
             statusIconX += ctx.measureText(`${icon}${amount}`).width + 5; // Move for next icon
         });

         // Render Intent (above enemy)
         if (this.intentIcon) {
             const intentY = this.position.y - this.height - 30; // Above HP bar, below name
             ctx.fillStyle = '#FFF';
             ctx.font = 'bold 24px sans-serif';
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             let intentText = this.intentIcon;
             if (this.intentValue !== null) {
                 intentText += `${this.intentValue}`;
             }
             ctx.fillText(intentText, this.position.x, intentY);
         }
    }
}
