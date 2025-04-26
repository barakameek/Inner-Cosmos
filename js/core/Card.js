// js/core/Card.js

// --- CORRECTED PATH FOR data.js ---
// Path goes up from 'core' to 'js', then up from 'js' to root
import * as Data from '../../data.js';
// --- END CORRECTION ---

// Import specific game classes IF effect logic needs to directly call methods on them
// (Though preferably effects modify player/target passed in)
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
        // Use imported Data object now
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
        if (this.keywords.includes('Intensity') && (this.keywords.includes('Damage') || this.keywords.includes('Pain'))) calculatedCost++;
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
         // ID overrides
         if ([31, 46, 51, 57].includes(conceptData.id)) return 'self'; // Cuddling, Compliments, Stress Relief, Sensory Enhancement
         // Default to enemy if targeting is required and not explicitly self
         return 'enemy';
      }

      _determineAOE(conceptData) {
           if (this.keywords.includes('AOE') || this.keywords.includes('Group')) return true;
           if (conceptData.id === 34) return true; // Group Sex ID
           return false;
       }

     _determineExhaust(conceptData) {
         // Powers exhaust by default (with overrides)
         if (['Identity/Role', 'Psychological/Goal'].includes(conceptData.cardType)) {
             // Overrides for common/simple powers that shouldn't exhaust
             if ([46, 51].includes(conceptData.id) && this.rarity === 'common') return false; // Compliments, Stress Relief
             return true; // Default exhaust for powers
         }
         // High-cost rare cards
         if (this.rarity === 'rare' && this.cost >= 2) return true;
         // Specific keywords
         if (this.keywords.includes('Ritual') || this.keywords.includes('OneTime') || this.keywords.includes('Transform') || this.keywords.includes('Intense')) return true;
          // Explicit card IDs
         if ([15, 109, 131, 132, 137 /* etc. */].includes(conceptData.id)) return true;
         return false; // Default: don't exhaust skills/attacks
      }

      _determineEthereal(conceptData) {
          if (this.keywords.includes('Fleeting') || this.keywords.includes('Ephemeral')) return true;
          return false;
      }

    // --- Effect Calculation and Execution ---

    /** Calculates base effect values (damage, block, etc.) */
    _calculateEffects(conceptData, upgraded = false) {
        const values = { damage: 0, block: 0, draw: 0, focus: 0, heal: 0, status: [], aoe: this._determineAOE(conceptData), targetType: this._determineTargetType(conceptData), meta: {} };
        const scores = conceptData.elementScores || {};
        const upgradeMultiplier = upgraded ? 1.3 : 1.0;
        const upgradeBonus = upgraded ? 2 : 0; // Flat bonus for upgrading simple effects
        const upgradeStatusDurationBonus = upgraded ? 1 : 0;
        const upgradeStatusAmountBonus = upgraded ? 1 : 0; // Usually +1 for stacking effects

        const scale = (base, score, factor = 1.0) => Math.max(0, Math.floor(base * (1 + (score || 0) / 10) * factor));

        // --- Calculate Base Values ---
        // Use max of relevant scores? Or average? Let's try max for more distinct feel.
        let potentialDamage = scale(6, Math.max(scores.S || 0, scores.I || 0), 0.8); // Sensory OR Interaction based damage
        let potentialBlock = scale(5, Math.max(scores.S || 0, scores.P || 0), 0.7); // Sensory OR Psych based block
        let potentialDraw = (scores.C >= 6) ? 1 : 0; // Lower Cog threshold slightly
        let potentialFocus = (scores.C >= 7 && scores.P >= 4) ? 1 : 0;
        let potentialHeal = scale(4, scores.P, 0.6); // Psych based

        // --- Adjust based on Keywords & Type ---
        if (this.keywords.includes('Attack') || this.keywords.includes('Damage') || this.keywords.includes('Impact') || conceptData.cardType === "Practice/Kink") {
            values.damage = potentialDamage + (this.keywords.includes('Impact') ? 3 : 0);
             if (upgraded && values.damage > 0) values.damage = Math.max(values.damage + upgradeBonus + 1, Math.floor(values.damage * 1.2));
        }
        if (this.keywords.includes('Block') || this.keywords.includes('Defend') || this.keywords.includes('Comfort')) {
            values.block = potentialBlock + (this.keywords.includes('Comfort') ? 2 : 0);
             if (upgraded && values.block > 0) values.block = Math.max(values.block + upgradeBonus + 1, Math.floor(values.block * 1.2));
        }
        // Ensure keyword guarantees effect even if base potential is 0
        if (this.keywords.includes('Draw')) { values.draw = Math.max(1, potentialDraw); if (upgraded) values.draw++; } else { values.draw = potentialDraw; }
        if (this.keywords.includes('Focus') || this.keywords.includes('GainFocus')) { values.focus = Math.max(1, potentialFocus); if (upgraded) values.focus++; } else { values.focus = potentialFocus; }
        if (this.keywords.includes('Heal')) { values.heal = Math.max(2, potentialHeal); if (upgraded) values.heal = Math.floor(values.heal * 1.2) + 1; } else { values.heal = potentialHeal; }


        // --- Status Effects ---
        let statusDuration = 1 + upgradeStatusDurationBonus;
        let statusAmount = 1 + upgradeStatusAmountBonus; // Default amount bonus for stacking effects
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
        if (this.keywords.includes('Intangible') || this.keywords.includes('IntangibleSelf') || this.keywords.includes('BuffSelf')) values.status.push({ id: 'Intangible', duration: 1, amount: 1, target: 'self' }); // Intangible usually lasts 1 turn, duration doesn't upgrade easily


        // --- Specific Card Overrides / Adjustments ---
        this._applySpecificCardLogic(conceptData, values, upgraded);

        // --- Final Cleanup ---
        for(const key in values) { if (typeof values[key] === 'number') values[key] = Math.max(0, Math.floor(values[key])); }
        // Don't deal damage if primarily blocking/healing unless explicitly AttackBlock
        if (values.block > 0 && values.damage > 0 && !this.keywords.includes('AttackBlock')) values.damage = 0;
        if (values.heal > 0 && values.damage > 0) values.damage = 0; // Healing cancels damage

        return values;
    }

    /** Apply logic specific to certain card IDs */
    _applySpecificCardLogic(conceptData, values, upgraded) {
         const upgradeBonus = upgraded ? 2 : 0;
         const upgradeStatusDurationBonus = upgraded ? 1 : 0;
         const upgradeStatusAmountBonus = upgraded ? 1 : 0;

        switch (conceptData.id) {
            // Batch 1 Overrides (Adjusted slightly)
            case 1: values.damage = upgraded ? 9 : 6; values.block = 0; values.status = []; break;
            case 2: values.damage = 0; values.block = upgraded ? 8 : 5; values.status = []; break;
            case 3: values.damage = upgraded ? 5 : 3; values.block = 0; values.status = [{ id: 'Weak', duration: 1 + upgradeStatusDurationBonus, target: 'enemy', amount: 1 }]; break;
            case 31: values.damage = 0; values.block = upgraded ? 7 : 4; values.heal = upgraded ? 3 : 2; values.status = []; values.targetType = 'self'; break;
            case 32: values.damage = 0; values.block = 0; values.status = [{ id: 'Vulnerable', duration: 1 + upgradeStatusDurationBonus, target: 'enemy', amount: 1 }]; if (upgraded) values.draw = 1; break;
            case 46: values.damage = 0; values.block = upgraded ? 6 : 3; values.status = [{ id: 'Strength', duration: 99, amount: 1 + upgradeStatusAmountBonus, target: 'self' }]; values.targetType = 'self'; break;
            case 49: values.damage = 0; values.block = 0; values.draw = upgraded? 2: 1; values.focus = upgraded? 1: 0; values.targetType = null; break;
            case 51: values.damage = 0; values.block = upgraded ? 9 : 6; values.heal = upgraded ? 3 : 2; values.targetType = 'self'; this.exhausts = true; break; // Now exhausts via override
            case 74: values.damage = upgraded ? 4 : 2; values.block = 0; values.status = [{ id: 'Weak', duration: 1, target: 'enemy', amount: 1 }]; if(upgraded) values.draw = 1; break;

            // Batch 2 Overrides (Adjusted slightly)
            case 7: values.damage = upgraded ? 6 : 4; values.block = 0; values.status = upgraded ? [{ id: 'Vulnerable', duration: 1, target: 'enemy', amount: 1 }] : []; break;
            case 9: values.damage = upgraded ? 4 : 2; values.block = 0; values.status = [{ id: 'Vulnerable', duration: 1 + upgradeStatusDurationBonus, target: 'enemy', amount: 1 }]; break;
            case 13: values.damage = 0; values.block = upgraded ? 8 : 5; values.draw = upgraded ? 1 : 0; values.status = []; values.targetType = 'self'; break;
            case 15: values.damage = 0; values.block = 0; values.heal = upgraded ? 6 : 4; values.status = [{ id: 'Regen', duration: upgraded ? 3: 2, amount: 2, target: 'self' }]; values.targetType = 'self'; this.exhausts = true; break;
            case 33: values.damage = 0; values.block = 0; values.focus = upgraded ? 2 : 1; values.draw = upgraded ? 1 : 0; values.status = []; values.targetType = null; break;
            case 37: values.damage = 0; values.block = upgraded ? 7 : 4; values.status = [{ id: 'Dexterity', duration: 99, amount: upgraded ? 2: 1, target: 'self' }]; values.targetType = 'self'; break;
            case 47: values.damage = 0; values.block = upgraded ? 5 : 3; values.status = [{ id: 'Vulnerable', duration: upgraded ? 2: 1, target: 'enemy', amount: 1 }]; break;
            case 57: values.damage = 0; values.block = 0; values.draw = 1; values.focus = upgraded ? 1 : 0; values.status = [{ id: 'Strength', duration: 99, amount: 1, target: 'self' }]; values.targetType = 'self'; break;
            case 60: values.damage = 0; values.block = 0; values.status = []; values.draw = 1 + Math.floor((this.elementScores.C || 0) / 4) + (upgraded ? 1 : 0); values.targetType = null; this.cost = 1; break;
            case 66: values.damage = 0; values.block = upgraded ? 7 : 4; values.status = [{ id: 'Weak', duration: upgraded ? 2 : 1, target: 'enemy', amount: 1 }]; break;
            case 67: values.damage = upgraded ? 10 : 7; values.block = 0; values.status = upgraded ? [{ id: 'Vulnerable', duration: 1, target: 'enemy', amount: 1 }] : []; break;

            // Override exhaust logic if needed
            case 4: this.exhausts = true; break; // Ensure Dominance exhausts
            case 5: this.exhausts = true; break; // Ensure Submission exhausts

            // ... Add many more cases here ...
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

         if (newCost > 0 && !significantIncrease) { newCost = Math.max(0, newCost - 1); }
         newCost = Math.min(this._determineCost(conceptData), newCost); // Ensure upgrade doesn't increase base cost

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
                          enemies?.forEach(enemy => { if (enemy?.currentHp > 0) enemy.applyStatus(statusEffect.id, statusEffect.duration || 1, statusEffect.amount || 1, this.primaryElement); }); return; // Handled all, exit early
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
                // Example: if (this.conceptId === SPECIFIC_ID) { /* unique execution */ }

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
         // Recalculate display values maybe? Or rely on tooltip re-rendering?
         console.log(`Card ${this.name} upgraded. New cost: ${this.cost}`);
    }

    // --- Display Methods ---
    getEffectDescriptionHtml() {
        const values = this.upgraded ? this.upgradeData.values : this.calculatedValues; let parts = [];
        if (values.damage > 0) parts.push(`Deal ${values.damage} damage${values.aoe ? ' to ALL enemies' : ''}.`);
        if (values.block > 0) parts.push(`Gain ${values.block} Block.`);
        if (values.heal > 0) parts.push(`Heal ${values.heal}.`);
        values.status?.forEach(s => {
            let targetText = ""; let valueText = "";
            if (s.target === 'self') targetText = " self"; else if (s.target === 'all_enemies') targetText = " ALL enemies";
            if (s.amount > 1 && ['Strength', 'Dexterity', 'Poison', 'Regen', 'Burn', 'Metallicize', 'Thorns', 'Entangle'].includes(s.id)) valueText = `${s.amount} `;
            else if (s.duration > 1 && s.duration !== 99) valueText = `(${s.duration}) `;
             parts.push(`Apply ${valueText}${s.id}${targetText}.`);
        });
        if (values.draw > 0) parts.push(`Draw ${values.draw} card${values.draw > 1 ? 's' : ''}.`);
        if (values.focus > 0) parts.push(`Gain ${values.focus} Focus.`);
        if (parts.length === 0) parts.push(this.upgraded ? (this.detailedDescription || this.baseEffectDescription) : this.baseEffectDescription);
        if (this.exhausts) parts.push("Exhaust."); if (this.isEthereal) parts.push("Ethereal.");
        return parts.join(' ').trim();
    }

    getTooltipHtml() {
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
