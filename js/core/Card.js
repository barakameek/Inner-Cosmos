// js/core/Card.js

import * as Data from '../data.js';
// May need Player/Enemy class for type checking or specific interactions if effects get very complex
// import { Player } from './Player.js';
// import { Enemy } from '../combat/Enemy.js';

// --- Constants ---
// ... (keep CARD_TYPE_FUNCTION_MAP)

/**
 * Represents a single playable card during a run.
 */
export class Card {
    // --- Keep existing constructor setup ---
    constructor(conceptId) {
        const conceptData = Data.concepts.find(c => c.id === conceptId);
        if (!conceptData) { /* ... keep error handling ... */ return; }

        this.id = `card_${conceptId}_${Date.now()}_${Math.random()}`;
        this.conceptId = conceptId;
        this.name = conceptData.name;
        this.rarity = conceptData.rarity || 'common';
        this.cardType = conceptData.cardType;
        this.visualHandle = conceptData.visualHandle;
        this.primaryElement = conceptData.primaryElement;
        this.elementScores = { ...(conceptData.elementScores || {}) };
        this.keywords = [...(conceptData.keywords || [])];
        this.lore = conceptData.lore ? [...conceptData.lore] : [];

        // --- Dynamic properties ---
        this.cost = this._determineCost(conceptData); // Use underscore for internal helper
        this.baseEffectDescription = conceptData.briefDescription;
        this.detailedDescription = conceptData.detailedDescription;
        this.requiresTarget = this._determineTargeting(conceptData);
        this.targetType = this._determineTargetType(conceptData);
        this.aoe = this._determineAOE(conceptData);
        this.exhausts = this._determineExhaust(conceptData);
        this.isEthereal = this._determineEthereal(conceptData);
        this.upgraded = false;

        // --- Effect Definition ---
        this.calculatedValues = this._calculateEffects(conceptData, false); // Base values
        this.upgradeData = this._prepareUpgradeData(conceptData); // Stores upgraded values & potentially adjusted cost

        // Define the execution function
        this.effectLogic = this._defineEffectExecution(conceptData);

        // Refine target type based on calculated effects
         if (!this.requiresTarget && this.calculatedValues.block > 0 && this.calculatedValues.damage === 0) {
             this.targetType = 'self'; // Default self target if only blocking
         }
         if (!this.requiresTarget && this.calculatedValues.heal > 0) {
            this.targetType = 'self'; // Default self target if healing
        }
    }

    // --- Property Determination Methods ---
    // Use underscore prefix for internal calculation helpers
    _determineCost(conceptData) { /* ... keep existing logic ... */
        let calculatedCost = 1;
        const scores = conceptData.elementScores || {};
        const avgScore = Object.values(scores).length > 0 ? Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length : 5;
        const maxScore = Math.max(...Object.values(scores), 0);

        if (['Identity/Role', 'Psychological/Goal'].includes(conceptData.cardType)) { // Powers
             calculatedCost = Math.max(1, Math.round(avgScore / 3.5));
             if (maxScore >= 9) calculatedCost++;
        } else { // Skills/Attacks
             calculatedCost = Math.max(1, Math.round(avgScore / 4));
        }
        // Rarity adjustment
        if (this.rarity === 'uncommon') calculatedCost = Math.max(1, calculatedCost);
        if (this.rarity === 'rare') calculatedCost = Math.max(1, calculatedCost + 1);
        // Keyword/Type adjustments
        if (this.keywords.includes('Simple') || this.keywords.includes('Comfort')) calculatedCost = Math.max(0, calculatedCost -1);
        if (this.keywords.includes('Intensity') && this.keywords.includes('Damage')) calculatedCost++;
        if (this.keywords.includes('Draw')) calculatedCost = Math.max(1, calculatedCost); // Drawing usually costs at least 1

        return Math.max(0, Math.min(3, calculatedCost));
    }
    _determineTargeting(conceptData) { /* ... keep existing logic ... */
        if (this.keywords.includes('Attack') || this.keywords.includes('Damage')) return true; // Assume attacks target unless AOE keyword present
        if (this.keywords.includes('DebuffEnemy')) return true; // Explicit keyword
        if (['Weak', 'Vulnerable', 'Frail', 'Confusion'].some(k => this.keywords.includes(k))) return true;
        if (conceptData.cardType === 'Interaction' && (conceptData.elementScores?.I || 0) >= 6 && !this.keywords.includes('Self')) return true;
        if (this.keywords.includes('Control') || this.keywords.includes('Command')) return true;
        if (this.keywords.includes('Impact')) return true;
        return false;
     }
     _determineTargetType(conceptData) { /* ... keep existing logic ... */
         if (!this._determineTargeting(conceptData)) return null;
         if (this.keywords.includes('BuffSelf') || this.keywords.includes('Heal') || this.keywords.includes('GainFocus') || this.keywords.includes('GainBlock')) return 'self';
         if (conceptData.cardType === 'Psychological/Goal' && this.keywords.includes('Comfort')) return 'self';
         return 'enemy';
      }
      _determineAOE(conceptData) { /* ... keep existing logic ... */
           if (this.keywords.includes('AOE') || this.keywords.includes('Group')) return true;
           if (conceptData.id === 34) return true; // Group Sex ID
           return false;
       }
     _determineExhaust(conceptData) { /* ... keep existing logic ... */
         if (['Identity/Role', 'Psychological/Goal'].includes(conceptData.cardType)) return true; // Powers exhaust by default
         if (this.rarity === 'rare' && this.cost >= 2) return true;
         if (this.keywords.includes('Ritual') || this.keywords.includes('OneTime') || this.keywords.includes('Transform')) return true;
         if ([109, 131, 132, 137 /* Add more IDs */].includes(conceptData.id)) return true; // M/s roles, Master/Mistress
         return false;
      }
      _determineEthereal(conceptData) { /* ... keep existing logic ... */
          if (this.keywords.includes('Fleeting') || this.keywords.includes('Ephemeral')) return true;
          return false;
      }

    // --- Effect Calculation and Execution ---

    /** Calculates base effect values */
    _calculateEffects(conceptData, upgraded = false) {
        const values = { damage: 0, block: 0, draw: 0, focus: 0, heal: 0, status: [], aoe: this._determineAOE(conceptData), targetType: this._determineTargetType(conceptData) }; // Include targetType and aoe
        const scores = conceptData.elementScores || {};
        const upgradeMultiplier = upgraded ? 1.3 : 1.0;
        const upgradeBonus = upgraded ? 2 : 0; // Flat bonus for upgrading simple effects

        // --- Helper function for scaling ---
        const scale = (base, score, factor = 1.0) => Math.max(0, Math.floor(base * (1 + (score || 0) / 10) * factor));

        // --- Calculate Base Values ---
        let potentialDamage = scale(5, scores.S, 0.8) + scale(3, scores.I, 0.5); // Sensory main, Interaction assists targeted
        let potentialBlock = scale(4, scores.S, 0.6) + scale(4, scores.P, 0.7); // Sensory & Psych contribute
        let potentialDraw = (scores.C >= 7) ? 1 : 0;
        let potentialFocus = (scores.C >= 8 && scores.P >= 5) ? 1 : 0; // High Cog + some Psych
        let potentialHeal = scale(3, scores.P, 0.6); // Psych based

        // --- Adjust based on Keywords & Type ---
        if (this.keywords.includes('Attack') || this.keywords.includes('Damage') || this.keywords.includes('Impact')) {
            values.damage = potentialDamage + (this.keywords.includes('Impact') ? 3 : 0);
             if (upgraded) values.damage = Math.floor(values.damage * 1.2) + upgradeBonus + (this.keywords.includes('Impact') ? 1 : 0);
        }
        if (this.keywords.includes('Block') || this.keywords.includes('Defend') || this.keywords.includes('Comfort')) {
            values.block = potentialBlock + (this.keywords.includes('Comfort') ? 2 : 0);
             if (upgraded) values.block = Math.floor(values.block * 1.2) + upgradeBonus + (this.keywords.includes('Comfort') ? 1 : 0);
        }
        if (this.keywords.includes('Draw')) {
            values.draw = potentialDraw + 1; // Keyword guarantees at least 1 draw
             if (upgraded) values.draw++;
        }
         if (this.keywords.includes('Focus') || this.keywords.includes('GainFocus')) {
             values.focus = potentialFocus + 1;
              if (upgraded) values.focus++;
         }
         if (this.keywords.includes('Heal')) {
            values.heal = potentialHeal + 2; // Keyword guarantees base heal
             if (upgraded) values.heal = Math.floor(values.heal * 1.2) + 1;
         }

        // --- Status Effects ---
        let statusDuration = upgraded ? 2 : 1;
        let statusAmount = upgraded ? 2 : 1;
        if (this.keywords.includes('Control') || this.keywords.includes('Weak') || this.keywords.includes('DebuffEnemy')) {
             values.status.push({ id: 'Weak', duration: statusDuration, target: 'enemy', amount: 1 });
        }
        if (this.keywords.includes('Vulnerable') || this.keywords.includes('Expose') || this.keywords.includes('DebuffEnemy')) {
             values.status.push({ id: 'Vulnerable', duration: statusDuration, target: 'enemy', amount: 1 });
        }
         if (this.keywords.includes('Frail') || this.keywords.includes('DebuffEnemy')) {
              values.status.push({ id: 'Frail', duration: statusDuration, target: 'enemy', amount: 1 });
         }
         // Self Buffs
          if (this.keywords.includes('StrengthSelf') || this.keywords.includes('BuffSelf')) {
              values.status.push({ id: 'Strength', duration: 99, amount: statusAmount, target: 'self' });
         }
          if (this.keywords.includes('DexteritySelf') || this.keywords.includes('BuffSelf')) {
               values.status.push({ id: 'Dexterity', duration: 99, amount: statusAmount, target: 'self' });
          }
           if (this.keywords.includes('RegenSelf') || this.keywords.includes('BuffSelf')) {
                values.status.push({ id: 'Regen', duration: upgraded ? 4: 3, amount: statusAmount +1, target: 'self' }); // Regen has amount & duration
           }


        // --- Specific Card Overrides / Adjustments ---
        this._applySpecificCardLogic(conceptData, values, upgraded);

        // --- Final Cleanup ---
        // Ensure non-negative values after overrides
        for(const key in values) {
            if (typeof values[key] === 'number') values[key] = Math.max(0, Math.floor(values[key]));
        }
        // If block exists, usually remove damage unless it's an attack/block card
        if (values.block > 0 && values.damage > 0 && !this.keywords.includes('AttackBlock')) {
            values.damage = 0; // Default block cards don't deal damage
        }
        if (values.heal > 0) values.damage = 0; // Healing doesn't usually deal damage

        return values;
    }

    /** Apply logic specific to certain card IDs */
    _applySpecificCardLogic(conceptData, values, upgraded) {
         const upgradeBonus = upgraded ? 2 : 0;
         const upgradeMultiplier = upgraded ? 1.3 : 1.0;

        switch (conceptData.id) {
            case 1: // Vanilla Sex
                values.damage = 6 + upgradeBonus + (upgraded ? 1 : 0); values.block = 0; values.status = [];
                break;
            case 2: // Sensual Touch
                values.damage = 0; values.block = 5 + upgradeBonus + (upgraded ? 1 : 0); values.status = [];
                break;
            case 3: // Passionate Kissing
                 values.damage = 3 + upgradeBonus; values.block = 0;
                 // Apply Weak? or maybe gain energy next turn? Let's apply Weak.
                 values.status = [{ id: 'Weak', duration: upgraded ? 2 : 1, target: 'enemy', amount: 1 }];
                 break;
             case 31: // Cuddling / Affection
                 values.damage = 0; values.block = 4 + upgradeBonus; values.heal = upgraded ? 3 : 2; values.status = [];
                 this.targetType = 'self'; // Force self target
                 break;
             case 32: // Dirty Talk
                 values.damage = 0; values.block = 0;
                 // Apply Vulnerable
                  values.status = [{ id: 'Vulnerable', duration: upgraded ? 2 : 1, target: 'enemy', amount: 1 }];
                  // Maybe draw a card too?
                  if (upgraded) values.draw = 1;
                  break;
             case 46: // Compliments / Praise
                  values.damage = 0; values.block = 3 + upgradeBonus;
                  // Apply Strength to self
                  values.status = [{ id: 'Strength', duration: 99, amount: upgraded ? 2 : 1, target: 'self' }];
                  this.targetType = 'self';
                  break;
             case 49: // Shared Fantasy Talk
                  values.damage = 0; values.block = 0; values.draw = upgraded? 2: 1; values.focus = upgraded? 1: 0; // Draw and maybe gain focus
                  this.targetType = null; // No target needed
                  break;
             case 51: // Stress Relief Focus
                   values.damage = 0; values.block = 6 + upgradeBonus; values.heal = 2; // Decent block, small heal
                   // Maybe exhaust? Let default exhaust handle it based on type (Psychological/Goal)
                   this.targetType = 'self';
                   break;
             case 74: // Flirting / Banter
                   values.damage = 2 + upgradeBonus; // Small damage
                   // Apply Weak or Vulnerable? Let's do Weak.
                   values.status = [{ id: 'Weak', duration: 1, target: 'enemy', amount: 1 }];
                    if(upgraded) values.draw = 1; // Draw on upgrade
                   break;
            // Add many more cases here...
        }
    }


    /** Stores upgrade calculations */
     _prepareUpgradeData(conceptData) {
         const upgradedValues = this._calculateEffects(conceptData, true);
         let newCost = this._determineCost(conceptData); // Start with base cost

         // --- Upgrade Cost Logic ---
         // Reduce cost if upgrade is minor OR if base cost is high
         const baseDmg = this.calculatedValues.damage;
         const upgDmg = upgradedValues.damage;
         const baseBlk = this.calculatedValues.block;
         const upgBlk = upgradedValues.block;
         // Check if effect increase was substantial (e.g., > 3 points or > 30%)
         const substantialIncrease = (upgDmg > baseDmg + 3 || upgDmg > baseDmg * 1.3) ||
                                    (upgBlk > baseBlk + 3 || upgBlk > baseBlk * 1.3) ||
                                    (upgradedValues.draw > this.calculatedValues.draw) ||
                                    (upgradedValues.focus > this.calculatedValues.focus); // Add other value checks

         if (newCost > 0 && !substantialIncrease) {
              newCost = Math.max(0, newCost - 1); // Reduce cost if upgrade wasn't huge
         } else if (newCost > 1 && substantialIncrease) {
              // Maybe still reduce cost for expensive cards even if upgrade good?
               // newCost = Math.max(1, newCost - 1);
         }
         // Ensure upgrade doesn't increase cost
         newCost = Math.min(this._determineCost(conceptData), newCost);

         return {
             values: upgradedValues,
             cost: newCost,
         };
     }


    /** Defines the function to execute the card's effect */
    _defineEffectExecution(conceptData) {
        return (player, target = null, enemies = []) => {
            const values = this.upgraded ? this.upgradeData.values : this.calculatedValues;
            const targetType = this.targetType; // Use pre-determined target type

            // console.log(`Executing: ${this.name}${this.upgraded?'+':''}`, values); // Less verbose log

            try {
                // Apply Status Effects
                values.status?.forEach(statusEffect => {
                    let statusTarget = null;
                    if (statusEffect.target === 'self' || targetType === 'self') statusTarget = player;
                    else if (statusEffect.target === 'enemy' || targetType === 'enemy') statusTarget = target;
                    // Handle 'all_enemies' target specifically
                    else if (statusEffect.target === 'all_enemies') {
                         enemies?.forEach(enemy => { // Use optional chaining
                              if (enemy?.currentHp > 0) enemy.applyStatus(statusEffect.id, statusEffect.duration || 1, statusEffect.amount || 1, this.primaryElement);
                         });
                         return; // Handled all enemies, skip single target logic
                    }

                    if (statusTarget) {
                        statusTarget.applyStatus(statusEffect.id, statusEffect.duration || 1, statusEffect.amount || 1, this.primaryElement);
                    } else if(statusEffect.target !== 'all_enemies') { // Don't warn if it was AOE
                        console.warn(`Status effect ${statusEffect.id} on ${this.name} had no valid target.`);
                    }
                });

                // Deal Damage
                if (values.damage > 0) {
                    const modifiedDamage = player.applyModifiers('damageDealt', values.damage);
                    if (values.aoe) {
                        enemies?.forEach(enemy => { // Use optional chaining
                            if (enemy?.currentHp > 0) enemy.takeDamage(modifiedDamage, this.primaryElement);
                        });
                    } else if (targetType === 'enemy' && target) {
                        target.takeDamage(modifiedDamage, this.primaryElement);
                    } else if (targetType === 'enemy') { /* Damage requires target but none valid */ }
                }

                // Gain Block (Always self)
                if (values.block > 0) player.gainBlock(values.block);
                // Heal Self (Always self)
                if (values.heal > 0) player.heal(values.heal);
                // Draw Cards (Always self)
                if (values.draw > 0) player.drawCards(values.draw);
                // Gain Focus (Always self)
                if (values.focus > 0) player.gainFocus(values.focus);

                // --- Specific Card Execution Logic (if needed beyond calculated values) ---
                 if (this.conceptId === 41) { // Erotic Hypnosis / Mind Control Play
                      // Example: Apply temporary 'Controlled' status? Or maybe 'Vulnerable'?
                      if (target) target.applyStatus('Vulnerable', upgraded ? 3 : 2, 1, this.primaryElement);
                      if (target) target.applyStatus('Weak', upgraded ? 2 : 1, 1, this.primaryElement);
                       console.log("   -> Hypnotic suggestion applied.");
                 }

            } catch (error) { console.error(`Error during effect execution for ${this.name}:`, error); }
        };
    }

    // Keep executeEffect, upgrade...
    executeEffect(player, target = null, enemies = []) { /* ... keep ... */
         if (typeof this.effectLogic === 'function') { this.effectLogic(player, target, enemies); }
         else { console.error(`Card ${this.name} has no defined effect logic!`); }
    }
    upgrade() { /* ... keep ... */
         if (this.upgraded) return;
         this.upgraded = true; this.name += "+";
         if (this.upgradeData.cost !== undefined && this.upgradeData.cost < this.cost) { this.cost = this.upgradeData.cost; }
         console.log(`Card ${this.name} upgraded. New cost: ${this.cost}`);
    }

    // --- Display Methods (Refined) ---
    getEffectDescriptionHtml() {
        const values = this.upgraded ? this.upgradeData.values : this.calculatedValues;
        let parts = []; // Collect description parts

        if (values.damage > 0) parts.push(`Deal ${values.damage} damage${values.aoe ? ' to ALL enemies' : ''}.`);
        if (values.block > 0) parts.push(`Gain ${values.block} Block.`);
        if (values.heal > 0) parts.push(`Heal ${values.heal}.`);
        values.status?.forEach(s => {
            let targetText = "";
            if (s.target === 'self') targetText = " self";
            else if (s.target === 'all_enemies') targetText = " ALL enemies";
            // Enemy target is implied if not self/all unless targeting==null

            let valueText = "";
            if (s.amount > 1 && ['Strength', 'Dexterity', 'Poison', 'Regen'].includes(s.id)) valueText = `${s.amount} `; // Show amount only for specific stacking statuses
            else if (s.duration > 1 && s.duration !== 99) valueText = `(${s.duration}) `; // Show duration if > 1 and not permanent

             parts.push(`Apply ${valueText}${s.id}${targetText}.`);
        });
        if (values.draw > 0) parts.push(`Draw ${values.draw} card${values.draw > 1 ? 's' : ''}.`);
        if (values.focus > 0) parts.push(`Gain ${values.focus} Focus.`);

         // Add specific text for certain cards if calculated values don't capture it
         if (this.conceptId === 41) parts.push("Suggest vulnerability."); // Example specific text

        // Fallback to base description if no effects calculated
        if (parts.length === 0) {
            parts.push(this.upgraded ? (this.detailedDescription || this.baseEffectDescription) : this.baseEffectDescription);
        }

        // Add Exhaust/Ethereal
        if (this.exhausts) parts.push("Exhaust.");
        if (this.isEthereal) parts.push("Ethereal.");

        return parts.join(' '); // Join parts with spaces
    }

    getTooltipHtml() { /* ... keep existing using updated getEffectDescriptionHtml ... */
         let html = `<div class="card-tooltip">`;
         // Use Font Awesome icon for Focus cost
         html += `<div class="tooltip-header"><strong>${this.name} (${this.cost} <i class="fa-solid fa-bolt" style="color: #f1c40f;"></i>)</strong></div>`;
         html += `<div class="tooltip-type"><em>${this.cardType} - ${this.rarity}</em></div><hr>`;
         html += `<div class="tooltip-description">${this.getEffectDescriptionHtml()}</div>`;
         if (this.keywords.length > 0) {
             html += `<hr><div class="tooltip-keywords">Keywords: ${this.keywords.join(', ')}</div>`;
         }
          if (this.lore && this.lore.length > 0) {
              const loreLevel = this.upgraded ? 1 : 0; // Show level 1 for base, level 2 for upgraded?
              const loreToShow = this.lore[loreLevel];
              if(loreToShow) html += `<hr><div class="tooltip-lore"><i>${loreToShow.text}</i></div>`;
         }
         html += `</div>`;
         return html;
     }

} // End Card Class
