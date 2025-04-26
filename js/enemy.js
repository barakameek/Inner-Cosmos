// js/enemy.js

class Enemy {
    /**
     * Creates an instance of an enemy for combat.
     * @param {string} enemyId - The ID of the enemy definition from enemyData.js.
     * @param {number} positionX - X coordinate for rendering center base.
     * @param {number} positionY - Y coordinate for rendering center base.
     */
    constructor(enemyId, positionX, positionY) {
        this.definition = getEnemyDefinition(enemyId);
        if (!this.definition) {
            console.error(`Failed to create Enemy instance: Definition not found for ID '${enemyId}'. Using fallback.`);
            // Create a minimal fallback definition
            this.definition = new EnemyDefinition({
                id: 'fallback_error',
                name: 'Error Foe',
                archetype: EnemyArchetype.DOUBT, // Need a valid archetype for weakness/resistance lookup
                maxHp: 10,
                moveSet: [{ id: 'fallback_attack', intentType: 'Attack', damage: 1, description: "Attack for 1 Bruise", weight: 1 }]
            });
             // Ensure fallback has weakness/resistance
             if (!this.definition.weakness) this.definition.weakness = getElementWeakness(this.definition.archetype);
             if (!this.definition.resistance) this.definition.resistance = getElementResistance(this.definition.archetype);
        }

        this.instanceId = uuidv4(); // Unique ID for this specific instance
        this.id = this.definition.id; // Base definition ID
        this.name = this.definition.name;
        this.archetype = this.definition.archetype;
        this.maxHp = this.definition.maxHp;
        this.currentHp = this.maxHp;
        this.weakness = this.definition.weakness;
        this.resistance = this.definition.resistance;

        this.position = { x: positionX, y: positionY }; // Center-bottom position

        // Combat State
        this.statusEffects = {}; // e.g., { [StatusEffects.GUARD]: 0, [StatusEffects.VULNERABLE]: {amount:1, duration:1}, Strength: 2 }
        this.currentMove = null; // The EnemyMove object chosen for the current turn (intent)
        this.moveHistory = []; // Track recent move IDs for AI patterns/cooldowns
        this.moveCooldowns = {}; // Track cooldowns for specific move IDs { moveId: turnsRemaining }
        this.currentPhase = 1; // For multi-phase bosses
        // Store the original moveset for phase resets if needed
        this.originalMoveSet = [...this.definition.moveSet];

        // --- Rendering properties ---
        this.width = 100; // Example dimensions, adjust based on art
        this.height = 150;
        this.intentIcon = null; // Stores the icon string for the current intent
        this.intentValue = null; // Stores damage/block value for intent display
        this.isHovered = false; // For UI feedback

        console.log(`Enemy instance created: ${this.name} (ID: ${this.id}, Instance: ${this.instanceId.substring(0,4)})`);
    }

    // --- Combat Turn Management ---

    startTurn(combatManager) {
        // Called at the START of the enemy's turn (before acting)
        this.updateStatusDurations();
        this.updateCooldowns();
        // Reset Guard at start of turn? Usually keep until broken.
        // this.statusEffects[StatusEffects.GUARD] = 0;

        // Trigger start-of-turn effects (if any defined in specialMechanics)
        if (this.definition.specialMechanics?.onTurnStart) {
            // Execute defined actions
        }
    }

    endTurn(combatManager) {
         // Called at the END of the enemy's turn (after acting)
         // Usually less common for enemies to have end-of-turn effects
         if (this.definition.specialMechanics?.onTurnEnd) {
             // Execute defined actions
         }
    }


    /**
     * Choose the next move based on the move set, weights, cooldowns, and HP thresholds.
     * This determines the *intent* for the next turn. Called BEFORE the enemy acts.
     */
    chooseNextMove(turnCount) { // Pass turn count for initial cooldown checks
        let currentMoveSet = this.definition.moveSet; // Use the active moveset (might change by phase)

        let availableMoves = currentMoveSet.filter(move => {
            // Check HP thresholds
            const hpPercent = this.currentHp / this.maxHp * 100;
            if (move.minHpThreshold !== undefined && hpPercent >= move.minHpThreshold) return false; // Use >= for "below threshold"
            if (move.maxHpThreshold !== undefined && hpPercent < move.maxHpThreshold) return false; // Use < for "above threshold"

            // Check cooldowns
            if (this.moveCooldowns[move.id] && this.moveCooldowns[move.id] > 0) return false;

            // Check initial cooldown (only applies on turn 1)
            if (move.initialCooldown && turnCount === 1) return false;

            // Add other conditions (e.g., require player debuff, require self buff) if needed later

            return true;
        });

        if (availableMoves.length === 0) {
            console.warn(`Enemy ${this.name} has no available moves! Using fallback.`);
            // Use a basic attack or defend as fallback
            const fallbackAttack = currentMoveSet.find(m => m.intentType === 'Attack');
            if (fallbackAttack) {
                 availableMoves.push(fallbackAttack);
            } else {
                 // Absolute fallback: Wait/Defend weakly
                 availableMoves.push({ id: 'fallback_wait', intentType: 'Defend', block: 1, description: "Waiting...", weight: 1 });
            }
        }

        // Calculate total weight
        const totalWeight = availableMoves.reduce((sum, move) => sum + (move.weight || 1), 0);
        // Handle zero total weight case
        if (totalWeight <= 0) {
             console.warn(`Enemy ${this.name} available moves have zero total weight. Choosing first available.`);
             this.currentMove = availableMoves[0];
        } else {
            let randomRoll = Math.random() * totalWeight;
            // Select move based on weight
            let chosenMove = availableMoves[availableMoves.length - 1]; // Default to last if roll somehow fails
            for (const move of availableMoves) {
                const weight = move.weight || 1;
                if (randomRoll < weight) {
                    chosenMove = move;
                    break;
                }
                randomRoll -= weight;
            }
            this.currentMove = chosenMove;
        }


        this.moveHistory.push(this.currentMove.id); // Track history
        // Limit history size if needed: if (this.moveHistory.length > 5) this.moveHistory.shift();
        this.setIntentDisplay(); // Update display values for UI
        // console.log(`${this.name} intends to use: ${this.currentMove.id} (${this.currentMove.intentType})`);
    }

    /** Updates intent icon and value based on the currentMove */
    setIntentDisplay() {
        if (!this.currentMove) {
            this.intentIcon = null;
            this.intentValue = null;
            return;
        }

        this.intentValue = null; // Reset
        const move = this.currentMove;

        switch (move.intentType) {
            case 'Attack':
                this.intentIcon = '⚔️';
                this.intentValue = this.calculateIntentDamage();
                break;
            case 'Defend':
                this.intentIcon = '🛡️'; // Shield icon
                this.intentValue = move.block || null;
                break;
            case 'Debuff':
                this.intentIcon = '⬇️'; // Down arrow
                // Optionally show stacks if applying > 1
                if (move.applyStatus?.amount > 1) this.intentValue = move.applyStatus.amount;
                break;
             case 'Buff':
                this.intentIcon = '⬆️'; // Up arrow
                if (move.applyStatus?.amount > 1) this.intentValue = move.applyStatus.amount;
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

        // Factor in enemy's Strength status (assuming additive)
        baseDamage += this.getStatus(StatusEffects.STRENGTH);

         // Factor in player's Weak status (if enemy is attacking player)
         // This calculation belongs in Player.takeBruise or CombatManager.applyDamage...
         // BUT, for accurate intent display, we might need to preview it.
         // Let's ignore player Weak for intent display for now for simplicity.

        // Factor in move-specific modifiers (like Anger Ember's flare_up)
        if (this.currentMove.effectsModifiers?.condition === 'hp_below_50' && (this.currentHp / this.maxHp) < 0.5) {
            baseDamage += this.currentMove.effectsModifiers.damageBonus || 0;
        }
        // Add other modifier checks here

        return Math.max(0, Math.floor(baseDamage)); // Ensure damage isn't negative, floor it
    }

    /** Executes the chosen move. Should be called by CombatManager. */
    executeMove(player, combatManager) {
        if (!this.currentMove) {
            console.log(`${this.name} has no move selected, skipping turn.`);
            return;
        }
        const move = this.currentMove; // Use shorter alias
        console.log(`${this.name} executes move: ${move.id} (${move.intentType})`);

        // Apply effects based on move definition
        // --- Damage ---
        const dealDamage = this.calculateIntentDamage(); // Recalculate in case Strength changed before execution
        if (dealDamage > 0) {
             // Apply player Weak status here before dealing damage
             let finalDamage = dealDamage;
             if (player.hasStatus(StatusEffects.WEAK)) {
                  finalDamage = Math.floor(finalDamage * WEAK_MULTIPLIER);
                   console.log(`Player Weak reduced incoming damage to ${finalDamage}`);
             }
             player.takeBruise(finalDamage);
        }
        // --- Block ---
        if (move.block) {
            this.applyStatus(StatusEffects.GUARD, move.block);
        }
        // --- Apply Status (to player or self) ---
        if (move.applyStatus) {
            const statusInfo = move.applyStatus;
            const target = (statusInfo.target === 'player') ? player : this;
            if (target) {
                 // Handle potential element freezing specially
                 if(statusInfo.status === StatusEffects.FREEZE && statusInfo.element) {
                      // Store as Freeze_ELEMENTID
                      target.applyStatus(statusInfo.status + '_' + statusInfo.element, statusInfo.amount || 1, statusInfo.duration || 1);
                 } else {
                      target.applyStatus(statusInfo.status, statusInfo.amount || 1, statusInfo.duration || 1);
                 }
            }
        }
         // --- Trigger Dilemma ---
         if (move.intentType === 'Dilemma' && move.dilemma) {
              // Pass self reference if dilemma effects need to target this enemy
              combatManager.triggerDilemma(move.dilemma, this);
         }
         // --- Special Effects (e.g., add cards to deck) ---
         if (move.effects?.addCardToDrawPile || move.effects?.addCardToDiscard || move.effects?.addCardToHand) {
              const effect = move.effects.addCardToDrawPile || move.effects.addCardToDiscard || move.effects.addCardToHand;
              const pile = move.effects.addCardToDrawPile ? 'draw' : move.effects.addCardToHand ? 'hand' : 'discard';
              const cardDef = getCardDefinition(effect.cardId);
              if (cardDef) {
                  const count = effect.count || 1;
                  console.log(`Adding ${count}x '${effect.cardId}' to player's ${pile} pile.`);
                  for(let i=0; i<count; i++) {
                      const newCard = new Card(cardDef); // Create new instance
                      player.addCardToDeck(newCard, pile); // Add to player's deck
                  }
              } else {
                  console.warn(`Could not find card definition for '${effect.cardId}' needed by enemy move.`);
              }
         }
         // --- Handle Dilemma Choice Effects on Enemy ---
         // This needs to be handled when resolving the dilemma choice in CombatManager if the effect targets 'enemy'


        // Set cooldown if applicable AFTER execution
        if (move.cooldown) {
            this.moveCooldowns[move.id] = move.cooldown + 1; // +1 because it decrements at start of next turn
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
                 // console.log(`Cooldown for ${this.name}'s ${moveId}: ${this.moveCooldowns[moveId]}`);
             }
        }
    }

    // --- Health & Status ---

    /**
     * Takes Bruise damage, considering Guard, Weakness/Resistance, and Vulnerable status.
     * @param {number} amount - The base amount of incoming Bruise.
     * @param {string} [sourceElement=Elements.NEUTRAL] - The element of the damage source.
     * @returns {object} Result object: { actualHpLoss, isWeaknessHit, isResistanceHit, sourceElement }
     */
    takeBruise(amount, sourceElement = Elements.NEUTRAL) {
         if (amount <= 0) return { actualHpLoss: 0, isWeaknessHit: false, isResistanceHit: false, sourceElement: sourceElement };
        let damageToTake = amount;
        let isWeaknessHit = false;
        let isResistanceHit = false;

        // Apply Weakness/Resistance
        if (sourceElement !== Elements.NEUTRAL) {
            if (sourceElement === this.weakness) {
                damageToTake = Math.floor(damageToTake * WEAKNESS_MULTIPLIER);
                isWeaknessHit = true;
                console.log(`${this.name} hit for Weakness (${sourceElement})! Damage increased to ${damageToTake}`);
            } else if (sourceElement === this.resistance) {
                damageToTake = Math.floor(damageToTake * RESISTANCE_MULTIPLIER);
                isResistanceHit = true;
                 console.log(`${this.name} hit for Resistance (${sourceElement}). Damage reduced to ${damageToTake}`);
            }
        }

        // Apply Vulnerable (if present)
        if (this.hasStatus(StatusEffects.VULNERABLE)) {
            damageToTake = Math.floor(damageToTake * VULNERABLE_MULTIPLIER);
             console.log(`${this.name} is Vulnerable. Damage increased to ${damageToTake}`);
        }

        // Apply Guard
        const guard = this.getStatus(StatusEffects.GUARD); // Guard is simple number
        if (guard > 0) {
            const blockedAmount = Math.min(guard, damageToTake);
            this.applyStatus(StatusEffects.GUARD, -blockedAmount); // Decrease guard
            damageToTake -= blockedAmount;
            console.log(`${this.name} Blocked ${blockedAmount} Bruise. Remaining Guard: ${this.getStatus(StatusEffects.GUARD)}`);
        }

        // Apply damage to HP
        let actualHpLoss = 0;
        if (damageToTake > 0) {
            actualHpLoss = Math.min(damageToTake, this.currentHp);
            this.currentHp -= actualHpLoss;
            console.log(`${this.name} took ${actualHpLoss} Bruise (${damageToTake} calculated). Current HP: ${this.currentHp}/${this.maxHp}`);

            // Trigger onHpLoss mechanics (e.g., Fear Construct gain Strength)
            if (this.definition.specialMechanics?.onHpLoss) {
                 const mech = this.definition.specialMechanics.onHpLoss;
                 if(mech.action === 'applyStatusToSelf') {
                      this.applyStatus(mech.status, mech.amount || 1, mech.duration || Infinity);
                 }
                 // Add other onHpLoss actions
            }
             // Check for phase changes immediately after taking damage
             this.checkPhaseChange();

        }
        return {
            actualHpLoss: actualHpLoss,
            isWeaknessHit: isWeaknessHit,
            isResistanceHit: isResistanceHit,
            sourceElement: sourceElement
        }; // Return info for CombatManager (Resonance, Dissonance)
    }

    applyStatus(effectId, amount, duration = Infinity) {
         if (!effectId) return;
        // Handle simple numeric, stackable statuses
        if (effectId === StatusEffects.GUARD || effectId === StatusEffects.STRENGTH /* add others */) {
            if (!this.statusEffects[effectId]) this.statusEffects[effectId] = 0;
            this.statusEffects[effectId] += amount;
            if (effectId === StatusEffects.GUARD) this.statusEffects[effectId] = Math.max(0, this.statusEffects[effectId]);
        }
        // Handle duration-based statuses (replace or update)
        else if (duration > 0 || duration === Infinity) {
            const existingStatus = this.statusEffects[effectId];
            if (existingStatus && typeof existingStatus === 'object') {
                 existingStatus.amount += amount;
                 existingStatus.duration = duration;
                 if (existingStatus.amount <= 0) delete this.statusEffects[effectId];
            } else if (amount > 0) {
                 this.statusEffects[effectId] = { amount: amount, duration: duration };
            }
        } else {
            delete this.statusEffects[effectId];
        }
        console.log(`${this.name} applied status: ${effectId}, Amount: ${amount}, Duration: ${duration}. Current value: ${this.getStatus(effectId)}`);

        // Special case: Check phase change if HP threshold status applied? Unlikely.
    }

    getStatus(effectId) {
        const status = this.statusEffects[effectId];
        if (!status) return 0;
        if (typeof status === 'number') return status;
        if (typeof status === 'object' && status.amount !== undefined) {
             if (status.duration === Infinity || status.duration > 0) return status.amount;
             else return 0; // Expired
        }
        return 0;
    }

     hasStatus(effectId) {
         return this.getStatus(effectId) > 0;
     }

     updateStatusDurations() {
        for (const key in this.statusEffects) {
            if (this.statusEffects[key] && typeof this.statusEffects[key] === 'object' && this.statusEffects[key].duration !== undefined) {
                const status = this.statusEffects[key];
                if (status.duration !== Infinity) {
                    status.duration--;
                    if (status.duration <= 0) {
                        console.log(`Enemy ${this.name} status effect '${key}' expired.`);
                        delete this.statusEffects[key];
                    }
                }
            }
        }
    }

    // --- Phase Management (for Bosses) ---
    checkPhaseChange() {
        if (!this.definition.specialMechanics?.phaseChangeThresholds) return;

        const hpPercent = this.currentHp / this.maxHp * 100;
        const thresholds = this.definition.specialMechanics.phaseChangeThresholds; // e.g., [50] means change below 50%

        // Find the highest threshold crossed (which corresponds to the new phase)
        let newPhase = 1;
        for (let i = 0; i < thresholds.length; i++) {
            if (hpPercent <= thresholds[i]) {
                newPhase = i + 2; // Phase index is threshold index + 2 (Phase 1 is default)
            } else {
                // If HP is above this threshold, we can't be in this phase or higher
                break;
            }
        }


        if (newPhase > this.currentPhase) {
             console.log(`${this.name} entering Phase ${newPhase} (HP: ${hpPercent.toFixed(1)}%)!`);
             const oldPhase = this.currentPhase;
             this.currentPhase = newPhase;

             // Trigger phase change actions for the NEW phase
              const phaseActions = this.definition.specialMechanics.onPhaseChange?.filter(action => action.phase === newPhase) || [];

              phaseActions.forEach(phaseAction => {
                   if (phaseAction.action === 'changeMoveSet' && this.definition.moveSetDefinitions?.[phaseAction.newMoveSetId]) {
                        console.log(`${this.name} changing move set to ${phaseAction.newMoveSetId}`);
                        // Replace the effective move set
                        this.definition.moveSet = this.definition.moveSetDefinitions[phaseAction.newMoveSetId];
                        // Reset cooldowns and history for the new phase
                        this.moveCooldowns = {};
                        this.moveHistory = [];
                         // Immediately choose next move for the new phase? Or wait? Wait is safer.
                   }
                   else if (phaseAction.action === 'applyStatusToSelf') {
                        this.applyStatus(phaseAction.status, phaseAction.amount || 1, phaseAction.duration || Infinity);
                   }
                    // Add other actions: heal, clear debuffs, etc.
              });

             // Re-choose move for the current turn using the new moveset? Risky if already acted.
             // Usually, phase changes apply effects/change moveset for the *next* turn.
             // Let's clear the current intent if phase changed, forcing a new choice next turn.
             this.currentMove = null;
             this.intentIcon = null;
             this.intentValue = null;
        }
    }


    // --- Rendering ---
    render(ctx) {
         // Base position is center-bottom of the enemy
         const baseX = this.position.x;
         const baseY = this.position.y;
         const bodyWidth = this.width * 0.8; // Make body slightly narrower than total width
         const bodyHeight = this.height * 0.9; // Make body slightly shorter

         // Placeholder rectangle for enemy sprite
         ctx.fillStyle = '#A0522D'; // Brownish placeholder
         ctx.strokeStyle = this.isHovered ? '#FFFF00' : '#333'; // Yellow border on hover
         ctx.lineWidth = this.isHovered ? 3 : 2;
         ctx.fillRect(baseX - bodyWidth / 2, baseY - bodyHeight, bodyWidth, bodyHeight);
         ctx.strokeRect(baseX - bodyWidth / 2, baseY - bodyHeight, bodyWidth, bodyHeight);

         // Render Name
         ctx.fillStyle = '#FFF';
         ctx.font = '14px sans-serif';
         ctx.textAlign = 'center';
         ctx.textBaseline = 'bottom';
         ctx.fillText(this.name, baseX, baseY - bodyHeight - 45); // Position above intent

          // Render Intent (above enemy)
          if (this.currentMove) { // Only show if intent is set
             const intentY = baseY - bodyHeight - 25; // Above HP bar
             ctx.fillStyle = '#FFF';
             ctx.font = 'bold 24px sans-serif';
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             let intentText = this.intentIcon || '?'; // Use icon or fallback
             if (this.intentValue !== null) {
                 intentText += `${this.intentValue}`;
             }
             ctx.fillText(intentText, baseX, intentY);
         }

         // Render HP Bar
         const hpBarWidth = this.width * 0.8;
         const hpBarHeight = 10;
         const hpBarX = baseX - hpBarWidth / 2;
         const hpBarY = baseY - bodyHeight - 15; // Above enemy rect, below intent
         const hpPercent = Math.max(0, this.currentHp / this.maxHp); // Ensure percentage >= 0

         ctx.fillStyle = '#555'; // Background
         ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
         ctx.fillStyle = '#D9534F'; // HP color (Red)
         ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight);
         // HP Text
         ctx.fillStyle = '#FFF';
         ctx.font = '10px sans-serif';
         ctx.textBaseline = 'middle';
         ctx.fillText(`${this.currentHp}/${this.maxHp}`, baseX, hpBarY + hpBarHeight / 2);

         // Render Guard (if any) - Left of HP bar
         const guardAmount = this.getStatus(StatusEffects.GUARD);
         if (guardAmount > 0) {
             const guardIconX = hpBarX - 5; // Space left of HP bar
             const guardIconY = hpBarY + hpBarHeight / 2;
             ctx.fillStyle = '#428BCA'; // Blueish for Guard
             ctx.font = 'bold 14px sans-serif';
             ctx.textAlign = 'right';
             ctx.fillText(`🛡️${guardAmount}`, guardIconX, guardIconY);
         }

         // Render Status Effects Icons (below enemy body)
         let statusIconX = baseX - bodyWidth / 2; // Start from left edge
         const statusIconY = baseY + 15; // Below the base Y
         const iconSize = 16;
         let iconCount = 0;
         Object.entries(this.statusEffects).forEach(([key, value]) => {
            if (key === StatusEffects.GUARD) return; // Already displayed

            let amount = 0;
            let durationInfo = '';
            let color = '#FFF'; // Default color

            if (typeof value === 'number') {
                amount = value;
            } else if (typeof value === 'object' && value.amount !== undefined) {
                 amount = value.amount;
                 if (value.duration !== Infinity && value.duration > 0) durationInfo = ` (${value.duration}t)`;
            }

            if (amount <= 0) return; // Don't show empty/expired statuses

             let icon = '?';
             switch (key) {
                 case StatusEffects.VULNERABLE: icon = '💥'; color = '#FF8C00'; break; // Orange burst
                 case StatusEffects.WEAK: icon = '💧'; color = '#ADD8E6'; break; // Blue drop
                 case StatusEffects.STRENGTH: icon = '💪'; color = '#FF6347'; break; // Red muscle
                 // Add more icons/colors
             }

             const textToDraw = `${icon}${amount}${durationInfo}`;
             ctx.fillStyle = color;
             ctx.font = `bold ${iconSize}px sans-serif`;
             ctx.textAlign = 'left';
             ctx.textBaseline = 'middle';
             ctx.fillText(textToDraw, statusIconX, statusIconY);
             statusIconX += ctx.measureText(textToDraw).width + 6; // Move right for next icon
             iconCount++;
         });
    }
}
