// js/core/Card.js

import * as Data from '../data.js';
// Potentially import Player/Enemy if complex effects need direct calls, but try to avoid
// import { Player } from './Player.js';
// import { Enemy } from '../combat/Enemy.js';

// --- Constants ---
const CARD_TYPE_FUNCTION_MAP = { // Keep if needed for future reference
    "Practice/Kink": "Skill/Attack",
    "Identity/Role": "Power/Stance",
    "Psychological/Goal": "Power/Effect",
    "Relationship Style": "Multi-Target/Support",
    "Orientation": "Triggered/Passive",
    "Interaction": "Skill/Effect",
    "Cognitive": "Skill/Utility"
};

/**
 * Represents a single playable card during a run.
 */
export class Card {
    constructor(conceptId) {
        const conceptData = Data.concepts.find(c => c.id === conceptId);
        if (!conceptData) {
            console.error(`Card Error: Concept data not found for ID: ${conceptId}`);
            this.id = -1; this.conceptId = -1; this.name = "Error Card"; this.rarity = 'common';
            this.cardType = "Error"; this.cost = 0; this.baseEffectDescription = "Error."; this.elementScores = {};
            this.keywords = []; this.upgraded = false; this.requiresTarget = false; this.targetType = null;
            this.aoe = false; this.exhausts = false; this.isEthereal = false; this.effectLogic = () => {};
            return;
        }

        this.id = `card_${conceptId}_${Date.now()}_${Math.random()}`; // Unique instance ID
        this.conceptId = conceptId;
        this.name = conceptData.name;
        this.rarity = conceptData.rarity || 'common';
        this.cardType = conceptData.cardType;
        this.visualHandle = conceptData.visualHandle;
        this.primaryElement = conceptData.primaryElement;
        this.elementScores = { ...(conceptData.elementScores || {}) };
        this.keywords = [...(conceptData.keywords || [])];
        this.lore = conceptData.lore ? [...conceptData.lore] : [];

        // --- Dynamic properties determined by helpers ---
        this.cost = this._determineCost(conceptData);
        this.baseEffectDescription = conceptData.briefDescription;
        this.detailedDescription = conceptData.detailedDescription;
        this.requiresTarget = this._determineTargeting(conceptData);
        this.targetType = this._determineTargetType(conceptData); // 'enemy', 'self', null
        this.aoe = this._determineAOE(conceptData);
        this.exhausts = this._determineExhaust(conceptData);
        this.isEthereal = this._determineEthereal(conceptData);
        this.upgraded = false;

        // --- Effect Definition ---
        // Calculate and store effect values for both base and upgraded states
        this.calculatedValues = this._calculateEffects(conceptData, false);
        this.upgradeData = this._prepareUpgradeData(conceptData);

        // Define the execution function based on calculated values
        this.effectLogic = this._defineEffectExecution(conceptData);

        // Final refinement of target type based on calculated effects
         if (!this.requiresTarget && (this.calculatedValues.block > 0 || this.calculatedValues.heal > 0) && this.calculatedValues.damage === 0) {
             this.targetType = 'self';
         }
    }

    // --- Property Determination Methods ---

    _determineCost(conceptData) {
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
        if (this.keywords.includes('Intensity') && (this.keywords.includes('Damage') || this.keywords.includes('Pain'))) calculatedCost++; // Pain/Intensity costs more
        if (this.keywords.includes('Draw')) calculatedCost = Math.max(1, calculatedCost); // Drawing usually costs 1+

        return Math.max(0, Math.min(3, calculatedCost)); // Clamp cost 0-3
    }

    _determineTargeting(conceptData) {
        // If it has Attack/Damage keywords (and isn't AOE)
        if ((this.keywords.includes('Attack') || this.keywords.includes('Damage') || this.keywords.includes('Impact')) && !this._determineAOE(conceptData) ) return true;
        // If it explicitly targets enemy debuffs
        if (this.keywords.includes('DebuffEnemy')) return true;
        if (['Weak', 'Vulnerable', 'Frail', 'Confusion', 'Poison', 'Burn'].some(k => this.keywords.includes(k))) return true; // Assume debuff keywords target enemy by default
        // High Interaction usually implies targeting something external unless self-focused
        if (conceptData.cardType === 'Interaction' && (conceptData.elementScores?.I || 0) >= 6 && !this.keywords.includes('Self') && !this.keywords.includes('BuffSelf')) return true;
        // Specific keywords that imply targeting
        if (this.keywords.includes('Control') || this.keywords.includes('Command') || this.keywords.includes('Kissing') || this.keywords.includes('Oral')) return true;
        return false;
     }

     _determineTargetType(conceptData) {
         if (!this._determineTargeting(conceptData)) return null; // No target needed
         // Explicit self keywords
         if (this.keywords.includes('BuffSelf') || this.keywords.includes('Heal') || this.keywords.includes('GainFocus') || this.keywords.includes('GainBlock') || this.keywords.includes('Self')) return 'self';
         // Specific card types/keywords that imply self
         if (conceptData.cardType === 'Psychological/Goal' && this.keywords.includes('Comfort')) return 'self';
         if (conceptData.name === "Stress Relief Focus") return 'self'; // Example ID override
         if (conceptData.name === "Compliments / Praise") return 'self';
         // Default to enemy if targeting is required and not explicitly self
         return 'enemy';
      }

      _determineAOE(conceptData) {
           if (this.keywords.includes('AOE') || this.keywords.includes('Group')) return true;
           if (conceptData.id === 34) return true; // Group Sex ID
           // Add other potential AOE indicators
           return false;
       }

     _determineExhaust(conceptData) {
         // Powers exhaust by default
         if (['Identity/Role', 'Psychological/Goal'].includes(conceptData.cardType)) return true;
         // High-cost rare cards
         if (this.rarity === 'rare' && this.cost >= 2) return true;
         // Specific keywords
         if (this.keywords.includes('Ritual') || this.keywords.includes('OneTime') || this.keywords.includes('Transform') || this.keywords.includes('Intense')) return true;
          // Explicit card IDs
         if ([15, 109, 131, 132, 137 /* etc. */].includes(conceptData.id)) return true;
         // Overrides - some Powers might NOT exhaust if common/simple
          if (conceptData.id === 46 && this.rarity === 'common') return false; // Compliments/Praise is common Psych/Goal, shouldn't exhaust
          if (conceptData.id === 51 && this.rarity === 'common') return false; // Stress Relief Focus
         return false; // Default: don't exhaust skills/attacks
      }

      _determineEthereal(conceptData) {
          if (this.keywords.includes('Fleeting') || this.keywords.includes('Ephemeral')) return true;
          // Maybe specific Cognitive cards?
          // if (conceptData.id === 14) return true; // Fantasy Immersion?
          return false;
      }

    // --- Effect Calculation and Execution ---

    _calculateEffects(conceptData, upgraded = false) {
        const values = { damage: 0, block: 0, draw: 0, focus: 0, heal: 0, status: [], aoe: this._determineAOE(conceptData), targetType: this._determineTargetType(conceptData), meta: {} };
        const scores = conceptData.elementScores || {};
        const upgradeMultiplier = upgraded ? 1.3 : 1.0;
        const upgradeBonus = upgraded ? 2 : 0;
        const upgradeStatusDurationBonus = upgraded ? 1 : 0;
        const upgradeStatusAmountBonus = upgraded ? 1 : 0;

        const scale = (base, score, factor = 1.0) => Math.max(0, Math.floor(base * (1 + (score || 0) / 10) * factor));

        // Calculate Base Potentials
        let potentialDamage = scale(5, scores.S, 0.8) + scale(3, scores.I, 0.5);
        let potentialBlock = scale(4, scores.S, 0.6) + scale(4, scores.P, 0.7);
        let potentialDraw = (scores.C >= 7) ? 1 : 0;
        let potentialFocus = (scores.C >= 8 && scores.P >= 5) ? 1 : 0;
        let potentialHeal = scale(3, scores.P, 0.6);

        // Adjust based on Keywords & Type
        if (this.keywords.includes('Attack') || this.keywords.includes('Damage') || this.keywords.includes('Impact') || conceptData.cardType === "Practice/Kink") {
            values.damage = potentialDamage + (this.keywords.includes('Impact') ? 3 : 0);
             if (upgraded && values.damage > 0) values.damage = Math.max(values.damage + upgradeBonus + 1, Math.floor(values.damage * 1.2));
        }
        if (this.keywords.includes('Block') || this.keywords.includes('Defend') || this.keywords.includes('Comfort')) {
            values.block = potentialBlock + (this.keywords.includes('Comfort') ? 2 : 0);
             if (upgraded && values.block > 0) values.block = Math.max(values.block + upgradeBonus + 1, Math.floor(values.block * 1.2));
        }
        if (this.keywords.includes('Draw')) { values.draw = potentialDraw + 1; if (upgraded) values.draw++; }
        if (this.keywords.includes('Focus') || this.keywords.includes('GainFocus')) { values.focus = potentialFocus + 1; if (upgraded) values.focus++; }
        if (this.keywords.includes('Heal')) { values.heal = potentialHeal + 2; if (upgraded) values.heal = Math.floor(values.heal * 1.2) + 1; }

        // --- Status Effects ---
        let statusDuration = 1 + upgradeStatusDurationBonus;
        let statusAmount = 1 + upgradeStatusAmountBonus;
        // Enemy Debuffs
        if (this.keywords.includes('Weak') || this.keywords.includes('Control') || this.keywords.includes('DebuffEnemy')) values.status.push({ id: 'Weak', duration: statusDuration, target: 'enemy', amount: 1 });
        if (this.keywords.includes('Vulnerable') || this.keywords.includes('Expose') || this.keywords.includes('DebuffEnemy')) values.status.push({ id: 'Vulnerable', duration: statusDuration, target: 'enemy', amount: 1 });
        if (this.keywords.includes('Frail') || this.keywords.includes('DebuffEnemy')) values.status.push({ id: 'Frail', duration: statusDuration, target: 'enemy', amount: 1 });
        if (this.keywords.includes('Poison') || this.keywords.includes('DebuffEnemy')) values.status.push({ id: 'Poison', duration: 99, target: 'enemy', amount: (upgraded? 5 : 3) });
        if (this.keywords.includes('Burn') || this.keywords.includes('DebuffEnemy')) values.status.push({ id: 'Burn', duration: statusDuration, target: 'enemy', amount: (upgraded? 6 : 4) });
         // Self Buffs
        if (this.keywords.includes('Strength') || this.keywords.includes('StrengthSelf') || this.keywords.includes('BuffSelf')) values.status.push({ id: 'Strength', duration: 99, amount: statusAmount, target: 'self' });
        if (this.keywords.includes('Dexterity') || this.keywords.includes('DexteritySelf') || this.keywords.includes('BuffSelf')) values.status.push({ id: 'Dexterity', duration: 99, amount: statusAmount, target: 'self' });
        if (this.keywords.includes('Regen') || this.keywords.includes('RegenSelf') || this.keywords.includes('BuffSelf')) values.status.push({ id: 'Regen', duration: upgraded ? 4: 3, amount: statusAmount + 1, target: 'self' });
        if (this.keywords.includes('Intangible') || this.keywords.includes('IntangibleSelf') || this.keywords.includes('BuffSelf')) values.status.push({ id: 'Intangible', duration: 1 + upgradeStatusDurationBonus, amount: 1, target: 'self' });

        // --- Specific Card Overrides / Adjustments ---
        this._applySpecificCardLogic(conceptData, values, upgraded);

        // --- Final Cleanup ---
        for(const key in values) { if (typeof values[key] === 'number') values[key] = Math.max(0, Math.floor(values[key])); }
        // Don't deal damage if primarily blocking/healing unless explicitly an Attack/Block card
        if (values.block > 0 && values.damage > 0 && !this.keywords.includes('AttackBlock')) values.damage = 0;
        if (values.heal > 0 && values.damage > 0) values.damage = 0;

        return values;
    }

    /** Apply logic specific to certain card IDs */
    _applySpecificCardLogic(conceptData, values, upgraded) {
         const upgradeBonus = upgraded ? 2 : 0;
         const upgradeStatusDurationBonus = upgraded ? 1 : 0;
         const upgradeStatusAmountBonus = upgraded ? 1 : 0;

        switch (conceptData.id) {
            // Batch 1 Overrides
            case 1: values.damage = upgraded ? 9 : 6; values.block = 0; values.status = []; break;
            case 2: values.damage = 0; values.block = upgraded ? 8 : 5; values.status = []; break;
            case 3: values.damage = 3 + upgradeBonus; values.block = 0; values.status = [{ id: 'Weak', duration: 1 + upgradeStatusDurationBonus, target: 'enemy', amount: 1 }]; break;
            case 31: values.damage = 0; values.block = 4 + upgradeBonus; values.heal = upgraded ? 3 : 2; values.status = []; values.targetType = 'self'; break;
            case 32: values.damage = 0; values.block = 0; values.status = [{ id: 'Vulnerable', duration: 1 + upgradeStatusDurationBonus, target: 'enemy', amount: 1 }]; if (upgraded) values.draw = 1; break;
            case 46: values.damage = 0; values.block = 3 + upgradeBonus; values.status = [{ id: 'Strength', duration: 99, amount: 1 + upgradeStatusAmountBonus, target: 'self' }]; values.targetType = 'self'; break;
            case 49: values.damage = 0; values.block = 0; values.draw = upgraded? 2: 1; values.focus = upgraded? 1: 0; values.targetType = null; break;
            case 51: values.damage = 0; values.block = 6 + upgradeBonus; values.heal = 2; values.targetType = 'self'; this.exhausts = true; break; // Override default exhaust=true here if needed, though type handles it
            case 74: values.damage = 2 + upgradeBonus; values.status = [{ id: 'Weak', duration: 1, target: 'enemy', amount: 1 }]; if(upgraded) values.draw = 1; break;

            // Batch 2 Overrides
            case 7: values.damage = 4 + upgradeBonus; values.block = 0; values.status = upgraded ? [{ id: 'Vulnerable', duration: 1, target: 'enemy', amount: 1 }] : []; break;
            case 9: values.damage = 2 + upgradeBonus; values.block = 0; values.status = [{ id: 'Vulnerable', duration: 1 + upgradeStatusDurationBonus, target: 'enemy', amount: 1 }]; break;
            case 13: values.damage = 0; values.block = 5 + upgradeBonus + (upgraded ? 1:0); values.draw = upgraded ? 1 : 0; values.status = []; values.targetType = 'self'; break;
            case 15: values.damage = 0; values.block = 0; values.heal = 4 + upgradeBonus; values.status = [{ id: 'Regen', duration: upgraded ? 3: 2, amount: 2, target: 'self' }]; values.targetType = 'self'; this.exhausts = true; break;
            case 33: values.damage = 0; values.block = 0; values.focus = upgraded ? 2 : 1; values.draw = upgraded ? 1 : 0; values.status = []; values.targetType = null; break;
            case 37: values.damage = 0; values.block = 4 + upgradeBonus; values.status = [{ id: 'Dexterity', duration: 99, amount: upgraded ? 2: 1, target: 'self' }]; values.targetType = 'self'; break;
            case 47: values.damage = 0; values.block = 3 + upgradeBonus; values.status = [{ id: 'Vulnerable', duration: upgraded ? 2: 1, target: 'enemy', amount: 1 }]; break;
            case 57: values.damage = 0; values.block = 0; values.draw = 1; values.focus = upgraded ? 1 : 0; values.status = [{ id: 'Strength', duration: 99, amount: 1, target: 'self' }]; values.targetType = 'self'; break;
            case 60: values.damage = 0; values.block = 0; values.status = []; values.draw = 1 + Math.floor((this.elementScores.C || 0) / 4) + (upgraded ? 1 : 0); values.targetType = null; this.cost = 1; break;
            case 66: values.damage = 0; values.block = 4 + upgradeBonus; values.status = [{ id: 'Weak', duration: upgraded ? 2 : 1, target: 'enemy', amount: 1 }]; break;
            case 67: values.damage = 7 + upgradeBonus + (upgraded?1:0); values.block = 0; values.status = upgraded ? [{ id: 'Vulnerable', duration: 1, target: 'enemy', amount: 1 }] : []; break;

            // --- Add overrides for new cards as you implement them ---
            case 4: // Dominance (Psychological) - Power card, should exhaust
                 values.damage = 0; values.block = 0;
                 // Apply Strength to self, maybe apply Weak to target?
                 values.status = [
                     { id: 'Strength', duration: 99, amount: upgraded ? 3 : 2, target: 'self'},
                     // { id: 'Weak', duration: 1 + upgradeStatusDurationBonus, target: 'enemy', amount: 1} // Optional debuff
                 ];
                 values.targetType = 'self'; // Primarily self-buff
                 this.exhausts = true; // Ensure power exhausts
                 break;
            case 5: // Submission (Psychological) - Power card, should exhaust
                 values.damage = 0; values.block = 0;
                 // Gain Block and maybe Dexterity? Represents readiness to endure/receive.
                 values.block = 8 + upgradeBonus * 2; // Good block amount
                 values.status = [
                     { id: 'Dexterity', duration: 99, amount: upgraded ? 2 : 1, target: 'self'}
                 ];
                 values.targetType = 'self';
                 this.exhausts = true;
                 break;
             case 6: // Switching - Power card? Or Skill? Let's make it a Skill that buffs based on last action.
                  // This needs state tracking, complex for this system.
                  // Simpler version: Gain Block and draw 1 card. Upgrade draws 2.
                  values.damage = 0; values.block = 5 + upgradeBonus; values.draw = upgraded ? 2 : 1; values.status = [];
                  this.targetType = 'self';
                  this.exhausts = false; // Make it a non-exhausting skill
                  break;

            // ... continue for all 139 concepts ...
        }
    }

    /** Stores upgrade calculations */
     _prepareUpgradeData(conceptData) {
         const upgradedValues = this._calculateEffects(conceptData, true);
         let newCost = this._determineCost(conceptData); // Base cost

         // Upgrade Cost Logic
         const baseValues = this.calculatedValues;
         const significantIncrease =
             (upgradedValues.damage > baseValues.damage + 3 || upgradedValues.damage >= baseValues.damage * 1.4) ||
             (upgradedValues.block > baseValues.block + 3 || upgradedValues.block >= baseValues.block * 1.4) ||
             (upgradedValues.draw > baseValues.draw) ||
             (upgradedValues.focus > baseValues.focus) ||
             (upgradedValues.heal > baseValues.heal + 1) ||
             (upgradedValues.status.length > baseValues.status.length) ||
             (upgradedValues.status.some((upgStatus, i) => !baseValues.status[i] || upgStatus.duration > baseValues.status[i].duration || upgStatus.amount > baseValues.status[i].amount ));

         // Reduce cost if upgrade was minor OR if card is expensive initially
         if (newCost > 0 && (!significantIncrease || newCost > 1)) {
              newCost = Math.max(0, newCost - 1);
         }
         newCost = Math.min(this._determineCost(conceptData), newCost); // Don't increase cost

         return { values: upgradedValues, cost: newCost };
     }


    /** Defines the function to execute the card's effect */
    _defineEffectExecution(conceptData) {
        return (player, target = null, enemies = []) => {
            const values = this.upgraded ? this.upgradeData.values : this.calculatedValues;
            const targetType = this.targetType; // Use determined type

            try {
                // Apply Status Effects
                values.status?.forEach(statusEffect => {
                     let statusTarget = null;
                     if (statusEffect.target === 'self' || targetType === 'self') statusTarget = player;
                     else if (statusEffect.target === 'enemy' || targetType === 'enemy') statusTarget = target;
                     else if (statusEffect.target === 'all_enemies') {
                          enemies?.forEach(enemy => { if (enemy?.currentHp > 0) enemy.applyStatus(statusEffect.id, statusEffect.duration || 1, statusEffect.amount || 1, this.primaryElement); }); return;
                     }
                     if (statusTarget) { statusTarget.applyStatus(statusEffect.id, statusEffect.duration || 1, statusEffect.amount || 1, this.primaryElement); }
                     else if(statusEffect.target !== 'all_enemies') { console.warn(`Status ${statusEffect.id} on ${this.name} had no valid target.`); }
                 });
                // Deal Damage
                if (values.damage > 0) {
                     const modifiedDamage = player.applyModifiers('damageDealt', values.damage);
                     if (values.aoe) { enemies?.forEach(enemy => { if (enemy?.currentHp > 0) enemy.takeDamage(modifiedDamage, this.primaryElement); }); }
                     else if (targetType === 'enemy' && target) { target.takeDamage(modifiedDamage, this.primaryElement); }
                     else if (targetType === 'enemy') { console.warn(`Damage card ${this.name} needs valid enemy target.`);}
                }
                // Gain Block, Heal Self, Draw Cards, Gain Focus (all target 'self')
                if (values.block > 0) player.gainBlock(values.block);
                if (values.heal > 0) player.heal(values.heal);
                if (values.draw > 0) player.drawCards(values.draw);
                if (values.focus > 0) player.gainFocus(values.focus);

                // --- Specific Card Execution Logic ---
                // Example: Erotic Hypnosis - already handled by applying statuses in calculation
                // Add others if calculation isn't enough (e.g., complex interactions)

            } catch (error) { console.error(`Error during effect execution for ${this.name}:`, error); }
        };
     }

    // --- Keep executeEffect, upgrade ---
    executeEffect(player, target = null, enemies = []) {
         if (typeof this.effectLogic === 'function') { this.effectLogic(player, target, enemies); }
         else { console.error(`Card ${this.name} has no defined effect logic!`); }
    }
    upgrade() {
         if (this.upgraded) return; this.upgraded = true; this.name += "+";
         if (this.upgradeData.cost !== undefined && this.upgradeData.cost < this.cost) { this.cost = this.upgradeData.cost; }
         // Recalculate internal values based on upgrade? No, effectLogic uses the flag.
         console.log(`Card ${this.name} upgraded. New cost: ${this.cost}`);
    }

    // --- Display Methods ---
    getEffectDescriptionHtml() { /* ... keep refined version from File 27 ... */
        const values = this.upgraded ? this.upgradeData.values : this.calculatedValues; let parts = [];
        if (values.damage > 0) parts.push(`Deal ${values.damage} damage${values.aoe ? ' to ALL enemies' : ''}.`);
        if (values.block > 0) parts.push(`Gain ${values.block} Block.`);
        if (values.heal > 0) parts.push(`Heal ${values.heal}.`);
        values.status?.forEach(s => {
            let targetText = ""; let valueText = "";
            if (s.target === 'self') targetText = " self"; else if (s.target === 'all_enemies') targetText = " ALL enemies";
            // Show amount only for specific stacking statuses, otherwise show duration if > 1 & not permanent
            if (s.amount > 1 && ['Strength', 'Dexterity', 'Poison', 'Regen', 'Burn', 'Metallicize', 'Thorns'].includes(s.id)) valueText = `${s.amount} `;
            else if (s.duration > 1 && s.duration !== 99) valueText = `(${s.duration}) `;
             parts.push(`Apply ${valueText}${s.id}${targetText}.`);
        });
        if (values.draw > 0) parts.push(`Draw ${values.draw} card${values.draw > 1 ? 's' : ''}.`);
        if (values.focus > 0) parts.push(`Gain ${values.focus} Focus.`);
        if (parts.length === 0) parts.push(this.upgraded ? (this.detailedDescription || this.baseEffectDescription) : this.baseEffectDescription);
        if (this.exhausts) parts.push("Exhaust."); if (this.isEthereal) parts.push("Ethereal.");
        return parts.join(' ');
    }
    getTooltipHtml() { /* ... keep refined version from File 27 ... */
         let html = `<div class="card-tooltip">`;
         html += `<div class="tooltip-header"><strong>${this.name} (${this.cost} <i class="fa-solid fa-bolt" style="color: #f1c40f;"></i>)</strong></div>`;
         html += `<div class="tooltip-type"><em>${this.cardType} - ${this.rarity}</em></div><hr>`;
         html += `<div class="tooltip-description">${this.getEffectDescriptionHtml()}</div>`;
         if (this.keywords.length > 0) html += `<hr><div class="tooltip-keywords">Keywords: ${this.keywords.join(', ')}</div>`;
          if (this.lore && this.lore.length > 0) { const loreLevel = this.upgraded ? 1 : 0; const loreToShow = this.lore[loreLevel]; if(loreToShow) html += `<hr><div class="tooltip-lore"><i>${loreToShow.text}</i></div>`; }
         html += `</div>`;
         return html;
     }

} // End Card Class
