// js/core/Card.js

// Import data (corrected path)
import * as Data from '../../data.js';

// Import specific game classes IF needed (currently handled by passing player/target)
// import { Player } from './Player.js';
// import { Enemy } from '../combat/Enemy.js';

/**
 * Represents a single playable card instance during a run.
 * Card effects and properties are dynamically determined based on conceptData from data.js.
 */
export class Card {
    constructor(conceptId) {
        const conceptData = Data.concepts?.find(c => c.id === conceptId); // Add safe navigation

        if (!conceptData) {
            console.error(`Card Error: Concept data not found for ID: ${conceptId}`);
            // Set properties for a safe "Error Card" instance
            this.id = `card_error_${Date.now()}`;
            this.conceptId = -1;
            this.name = "Error Card";
            this.rarity = 'common';
            this.cardType = "Error";
            this.cost = 99; // Make unplayable
            this.baseEffectDescription = "Error loading card data.";
            this.detailedDescription = "Could not find concept data.";
            this.elementScores = {};
            this.keywords = ['Unplayable'];
            this.upgraded = false;
            this.requiresTarget = false;
            this.targetType = null;
            this.aoe = false;
            this.exhausts = true; // Error cards should probably exhaust
            this.isEthereal = false;
            this.effectLogic = () => { console.error("Attempted to play Error Card."); };
            this.calculatedValues = {};
            this.upgradeData = {};
            this.primaryElement = null;
            this.lore = [];
            this.visualHandle = null;
            return;
        }

        // --- Base Properties from Concept Data ---
        this.id = `card_${conceptId}_${Date.now()}_${Math.random()}`; // Unique instance ID
        this.conceptId = conceptId;
        this.name = conceptData.name;
        this.rarity = conceptData.rarity || 'common';
        this.cardType = conceptData.cardType;
        this.visualHandle = conceptData.visualHandle;
        this.primaryElement = conceptData.primaryElement || this._determineDominantElement(conceptData.elementScores); // Determine if not set
        this.elementScores = { ...(conceptData.elementScores || {}) };
        this.keywords = [...(conceptData.keywords || [])]; // Copy keywords
        this.lore = conceptData.lore ? JSON.parse(JSON.stringify(conceptData.lore)) : []; // Deep copy lore

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

        // --- Add inherent keywords based on properties ---
        if (this.exhausts && !this.keywords.includes('Exhaust')) this.keywords.push('Exhaust');
        if (this.isEthereal && !this.keywords.includes('Ethereal')) this.keywords.push('Ethereal');
        if (this.targetType === null && this.cost === null && !this.keywords.includes('Unplayable')) this.keywords.push('Unplayable');


        // --- Effect Definition ---
        // Calculate and store effect values for both base and upgraded states
        this.calculatedValues = this._calculateEffects(conceptData, false);
        this.upgradeData = this._prepareUpgradeData(conceptData);

        // Define the execution function based on calculated values
        this.effectLogic = this._defineEffectExecution(conceptData);

        // Final refinement of target type based on calculated effects (override if necessary)
         if (!this.requiresTarget && (this.calculatedValues.block > 0 || this.calculatedValues.heal > 0 || this.calculatedValues.focus > 0 || this.calculatedValues.draw > 0 || (this.calculatedValues.status.length > 0 && this.calculatedValues.status.every(s => s.target === 'self'))) && this.calculatedValues.damage === 0) {
             this.targetType = 'self';
             this.requiresTarget = false; // Ensure targeting isn't required for self-buffs
         } else if (this.requiresTarget && !this.targetType) {
             // If targeting is required but type is null, default to enemy
             this.targetType = 'enemy';
         }

         // Ensure cost is null for unplayable cards
         if (this.keywords.includes('Unplayable')) {
            this.cost = null;
         }
    }

    // --- Property Determination Methods ---

    _determineDominantElement(scores = {}) {
        let dominant = null;
        let maxScore = -1;
        const elementOrder = ['A', 'I', 'S', 'P', 'C', 'R', 'RF']; // Define order for tie-breaking
        for (const element of elementOrder) {
            if ((scores[element] || 0) > maxScore) {
                maxScore = scores[element];
                dominant = element;
            }
        }
        return dominant; // Returns first in elementOrder in case of tie
    }

    _determineCost(conceptData) {
        // Status/Curse cards are usually unplayable (cost null)
        if (['Status', 'Curse'].includes(conceptData.cardType) || this.keywords.includes('Unplayable')) {
            return null;
        }

        let calculatedCost = 1;
        const scores = conceptData.elementScores || {};
        const avgScore = Object.values(scores).length > 0 ? Object.values(scores).reduce((a, b) => a + (b || 0), 0) / Object.values(scores).length : 5;
        const maxScore = Math.max(...Object.values(scores).map(s => s || 0), 0);

        // Base cost on type and complexity (score average/max)
        if (['Identity/Role', 'Psychological/Goal', 'Power'].includes(conceptData.cardType)) { // Powers tend to cost more
             calculatedCost = Math.max(1, Math.round(avgScore / 3.0)); // Higher base cost for powers
             if (maxScore >= 9) calculatedCost++;
        } else { // Skills/Attacks
             calculatedCost = Math.max(1, Math.round(avgScore / 4.0)); // Lower base cost
        }

        // Rarity adjustment
        if (conceptData.rarity === 'uncommon') calculatedCost = Math.max(1, calculatedCost); // Ensure uncommon cost at least 1
        if (conceptData.rarity === 'rare') calculatedCost = Math.max(1, calculatedCost + 1); // Rare usually costs more

        // Keyword/Type adjustments
        if (this.keywords.includes('Simple') || this.keywords.includes('Comfortable')) calculatedCost = Math.max(0, calculatedCost -1); // Basic concepts cheaper
        if (this.keywords.includes('Intensity') && (this.keywords.includes('Damage') || this.keywords.includes('Pain') || this.keywords.includes('Impact'))) calculatedCost++;
        if (this.keywords.includes('Draw') && calculatedCost < 1) calculatedCost = 1; // Drawing usually costs at least 1
        if (this.keywords.includes('Ritual') || this.keywords.includes('Complex')) calculatedCost++;
        if (this._determineExhaust(conceptData) && calculatedCost > 0) {
             // Exhaust cards *might* cost slightly less, but not always guaranteed reduction
             // if (conceptData.rarity !== 'rare') calculatedCost = Math.max(0, calculatedCost - 1);
        }

        // Clamp cost 0-3 (adjust max as needed for game balance)
        return Math.max(0, Math.min(3, calculatedCost));
    }

    _determineTargeting(conceptData) {
        // No targeting for Status/Curse cards
        if (['Status', 'Curse'].includes(conceptData.cardType)) return false;
        // Explicit keywords
        if (this.keywords.includes('TargetEnemy') || this.keywords.includes('DebuffEnemy')) return true;
        if (this.keywords.includes('TargetSelf') || this.keywords.includes('BuffSelf')) return false; // Explicitly self = no target needed

        // Infer from effects/keywords
        if ((this.keywords.includes('Attack') || this.keywords.includes('Damage') || this.keywords.includes('Impact')) && !this._determineAOE(conceptData) ) return true;
        // Check for keywords commonly associated with debuffs
        const debuffKeywords = ['Weak', 'Vulnerable', 'Frail', 'Poison', 'Burn', 'Confusion', 'Entangle', 'Stun'];
        if (debuffKeywords.some(k => this.keywords.includes(k)) && !this.keywords.includes('BuffSelf')) return true; // Assume debuff targets enemy unless self specified

        // Infer from type/scores (less reliable)
        if (conceptData.cardType === 'Interaction' && (conceptData.elementScores?.I || 0) >= 6 && !this._determineAOE(conceptData) && !this.keywords.includes('Self')) return true;
        if (this.keywords.includes('Control') || this.keywords.includes('Command')) return true;

        // Default to no targeting if not clearly enemy-focused
        return false;
     }

     _determineTargetType(conceptData) {
         if (!this._determineTargeting(conceptData)) return null; // No target needed

         // Specific card IDs known to target self
         const selfTargetIds = [31, 46, 51, 57, 15, 37];
         if (selfTargetIds.includes(conceptData.id)) return 'self';

         // Keywords indicating self-target
         if (this.keywords.includes('BuffSelf') || this.keywords.includes('HealSelf') || this.keywords.includes('GainFocus') || this.keywords.includes('GainBlock') || this.keywords.includes('Self')) return 'self';

         // If card type suggests self-focus and targeting not enemy
         if (conceptData.cardType === 'Psychological/Goal' && this.keywords.includes('Comfort')) return 'self';

         // Default to enemy if targeting is required and not explicitly self
         return 'enemy';
      }

      _determineAOE(conceptData) {
           if (this.keywords.includes('AOE') || this.keywords.includes('Group') || this.keywords.includes('AllEnemies')) return true;
           if (conceptData.id === 34) return true; // Group Sex ID
           return false;
       }

     _determineExhaust(conceptData) {
        if (this.keywords.includes('Exhaust')) return true; // Explicit keyword
        // Powers often exhaust, especially higher cost/impact ones
         if (['Identity/Role', 'Psychological/Goal', 'Power'].includes(conceptData.cardType)) {
             // Non-exhaust overrides for common/simple powers
             if ([46, 51].includes(conceptData.id) && this.rarity === 'common') return false;
             if (this.cost <= 1 && this.rarity === 'common') return false; // Cheap common powers might not exhaust
             return true; // Default exhaust for powers
         }
         // High-cost rare cards
         if (this.rarity === 'rare' && this._determineCost(conceptData) >= 2) return true;
         // Specific keywords indicating significant effect
         if (this.keywords.includes('Ritual') || this.keywords.includes('Transform') || this.keywords.includes('Intense') || this.keywords.includes('TPE') || this.keywords.includes('MajorDebuff')) return true;
         // Specific card IDs known to exhaust
         const exhaustIds = [15, 109, 131, 132, 137, 4, 5, 30, 41, 42, 43, 44, 45, 101, 111, 113, 116, 119, 120, 122, 123, 124, 125];
         if (exhaustIds.includes(conceptData.id)) return true;

         return false; // Default: don't exhaust basic skills/attacks
      }

      _determineEthereal(conceptData) {
          if (this.keywords.includes('Ethereal') || this.keywords.includes('Fleeting') || this.keywords.includes('Ephemeral')) return true;
          // Curses are often Ethereal
          if (conceptData.cardType === 'Curse') return true;
          return false;
      }

    // --- Effect Calculation and Execution ---

    /** Calculates base effect values (damage, block, etc.) */
    _calculateEffects(conceptData, upgraded = false) {
        const values = { damage: 0, block: 0, draw: 0, focus: 0, heal: 0, status: [], aoe: this._determineAOE(conceptData), meta: {} };
        const scores = conceptData.elementScores || {};
        const primaryElem = this.primaryElement; // Determined earlier

        // --- Base Scaling Value (Combine primary element and relevant secondary score) ---
        // Example: Damage scales mostly with Sensory, slightly with Interaction
        let primaryScore = scores[primaryElem] || 0;
        let scoreScale = (score) => Math.floor(score / 1.5 + 2); // Base scaling from 0-10 score -> ~2-8

        let effectScale = scoreScale(primaryScore);

        // --- Upgrade Bonuses ---
        const upgradeEffectBonus = upgraded ? Math.max(1, Math.floor(effectScale * 0.3) + 1) : 0; // e.g., +1-3 based on scale
        const upgradeStatusDurationBonus = upgraded ? 1 : 0;
        const upgradeStatusAmountBonus = upgraded ? Math.ceil((scores[primaryElem] || 1) / 4) : 0; // Stronger elements give better status upgrades? +1 or +2

        // --- Calculate Base Values based on Keywords & Type ---
        // Damage: Primarily Attack/Practice/Kink/Interaction/Sensory related
        if (this.keywords.includes('Attack') || this.keywords.includes('Damage') || this.keywords.includes('Impact') || conceptData.cardType === "Practice/Kink" || primaryElem === 'S' || primaryElem === 'I') {
             values.damage = effectScale + (this.keywords.includes('Impact') ? 2 : 0);
             values.damage += upgradeEffectBonus;
             if (conceptData.id === 8) values.damage += 3; // Heavy Impact boost
        }
        // Block: Primarily Skill/Psychological/Sensory related
        if (this.keywords.includes('Block') || this.keywords.includes('Defend') || this.keywords.includes('Comfort') || conceptData.cardType === "Psychological/Goal" || primaryElem === 'P' || primaryElem === 'S') {
            values.block = Math.floor(effectScale * 0.8) + (this.keywords.includes('Comfort') ? 1 : 0); // Block slightly less than damage
            values.block += upgradeEffectBonus;
        }
        // Draw: Primarily Cognitive/Relational
        if (this.keywords.includes('Draw') || primaryElem === 'C' || primaryElem === 'R') {
             values.draw = Math.max(0, Math.floor((scores.C || 0) / 5)); // ~Draw 1 at Cog 5+, 2 at 10
             if (this.keywords.includes('Draw')) values.draw = Math.max(1, values.draw); // Ensure keyword guarantees draw
             if (upgraded) values.draw++;
        }
        // Focus: Primarily Cognitive/Psychological
        if (this.keywords.includes('Focus') || this.keywords.includes('GainFocus') || primaryElem === 'C' || primaryElem === 'P') {
            values.focus = Math.max(0, Math.floor((scores.C || 0) / 7)); // ~Focus 1 at Cog 7+
             if (this.keywords.includes('Focus') || this.keywords.includes('GainFocus')) values.focus = Math.max(1, values.focus);
             if (upgraded) values.focus++;
        }
        // Heal: Primarily Psychological/Relational
        if (this.keywords.includes('Heal') || primaryElem === 'P' || primaryElem === 'R') {
            values.heal = Math.floor(effectScale * 0.6); // Heal scales less than damage/block
            if (this.keywords.includes('Heal')) values.heal = Math.max(1, values.heal);
            values.heal += upgradeEffectBonus;
        }

        // --- Status Effects (Targeting determined later) ---
        let statusDuration = 1 + upgradeStatusDurationBonus;
        let baseStatusAmount = 1; // Default amount for non-stacking

        const applyStatus = (id, dur, amt, target = 'enemy') => {
            // Avoid duplicates of non-stacking statuses unless amounts differ significantly? No, allow overrides.
            values.status.push({ id: id, duration: dur, amount: amt, target: target });
        };

        // Apply based on keywords - prioritize more specific keywords
        if (this.keywords.includes('Weak')) applyStatus('Weak', statusDuration, baseStatusAmount);
        if (this.keywords.includes('Vulnerable')) applyStatus('Vulnerable', statusDuration, baseStatusAmount);
        if (this.keywords.includes('Frail')) applyStatus('Frail', statusDuration, baseStatusAmount);
        if (this.keywords.includes('Poison')) applyStatus('Poison', 99, 3 + Math.floor(upgradeStatusAmountBonus * 1.5)); // Poison stacks more
        if (this.keywords.includes('Burn')) applyStatus('Burn', statusDuration + 1, 4 + Math.floor(upgradeStatusAmountBonus * 1.5)); // Burn has duration and stacks amount
        if (this.keywords.includes('StrengthSelf') || this.keywords.includes('Strength')) applyStatus('Strength', 99, 1 + upgradeStatusAmountBonus, 'self');
        if (this.keywords.includes('DexteritySelf') || this.keywords.includes('Dexterity')) applyStatus('Dexterity', 99, 1 + upgradeStatusAmountBonus, 'self');
        if (this.keywords.includes('RegenSelf') || this.keywords.includes('Regen')) applyStatus('Regen', 3 + upgradeStatusDurationBonus, 2 + upgradeStatusAmountBonus, 'self');
        if (this.keywords.includes('IntangibleSelf') || this.keywords.includes('Intangible')) applyStatus('Intangible', 1, 1, 'self'); // Intangible base doesn't usually upgrade amount/duration easily

        // Infer status from type/element (secondary effects)
        if (primaryElem === 'I' && scores.I >= 7 && !values.status.some(s => s.id === 'Vulnerable') && Math.random() < 0.3) { // High Interaction might apply Vulnerable
             applyStatus('Vulnerable', statusDuration, baseStatusAmount);
        }
        if (primaryElem === 'P' && scores.P >= 7 && !values.status.some(s => s.id === 'Strength') && Math.random() < 0.3) { // High Psych might grant self Strength
             applyStatus('Strength', 99, 1 + upgradeStatusAmountBonus, 'self');
        }
         if (primaryElem === 'S' && scores.S >= 8 && !values.status.some(s => s.id === 'Weak') && Math.random() < 0.3) { // High Sensory might apply Weak
              applyStatus('Weak', statusDuration, baseStatusAmount);
         }

        // --- Specific Card Overrides / Adjustments ---
        // This is crucial for making cards unique and balancing them beyond heuristics
        this._applySpecificCardLogic(conceptData, values, upgraded);

        // --- Final Cleanup ---
        // Ensure numbers are non-negative integers
        for(const key in values) {
            if (typeof values[key] === 'number') values[key] = Math.max(0, Math.floor(values[key]));
        }
        // Prevent self-damage unless specifically intended
        if (values.damage > 0 && this.targetType === 'self') values.damage = 0;
        // Prioritize primary function (e.g., block cards don't usually deal damage unless hybrid)
        if (values.block > 0 && values.damage > 0 && !this.keywords.includes('AttackBlock')) values.damage = 0;
        if (values.heal > 0 && values.damage > 0) values.damage = 0; // Healing cancels damage

        // Add AOE property to calculated values for easy access in execution
        values.aoe = this.aoe;

        return values;
    }

    /** Apply logic specific to certain card IDs - EXPAND THIS SIGNIFICANTLY */
    _applySpecificCardLogic(conceptData, values, upgraded) {
         const upgradeBonus = upgraded ? 2 : 0;
         const upgradeEffectBonus = upgraded ? Math.max(1, Math.floor(values.damage || values.block || values.heal || 3 / 1.5 + 2) * 0.3 + 1) : 0;
         const upgradeStatusDurationBonus = upgraded ? 1 : 0;
         const upgradeStatusAmountBonus = upgraded ? Math.ceil((this.elementScores[this.primaryElement] || 1) / 4) : 0;

        // Helper to reset and apply a specific status
        const setStatus = (id, dur, amt, target = 'enemy') => {
             values.status = [{ id: id, duration: dur, amount: amt, target: target }];
        };

        switch (conceptData.id) {
            // --- Batch 1 Overrides (Revisited) ---
            case 1: // Vanilla Sex
                values.damage = upgraded ? 9 : 6; values.block = 0; values.status = []; break;
            case 2: // Sensual Touch
                values.damage = 0; values.block = upgraded ? 8 : 5; values.heal = upgraded ? 2 : 0; values.status = []; break;
            case 3: // Passionate Kissing
                values.damage = upgraded ? 5 : 3; values.block = 0; setStatus('Weak', 1 + upgradeStatusDurationBonus, 1); break;
            case 4: // Dominance (Psych) - POWER
                values.damage = 0; values.block = 0; values.status = []; // Effect handled by triggers
                values.meta.trigger = 'onPlayCardType_Interaction'; // Example trigger ID
                values.meta.effect = { applyStatus: { target: 'random_enemy', status: 'Vulnerable', amount: upgraded ? 2 : 1, duration: 1 }};
                this.exhausts = true; break;
            case 5: // Submission (Psych) - POWER
                values.damage = 0; values.block = 0; values.status = []; // Effect handled by triggers
                values.meta.trigger = 'onTakeUnblockedDamage'; // Example trigger ID
                values.meta.effect = { gainBlock: upgraded ? 5 : 3 };
                this.exhausts = true; break;
            case 6: // Switching - POWER
                values.damage = 0; values.block = 0; values.status = [];
                values.meta.trigger = 'onTurnStart';
                // Complex: Choose Dominant or Submissive effect each turn? Hard to model here.
                // Simple version: Gain 1 Str and 1 Dex for 1 turn.
                values.meta.effect = { applyStatusToSelf: [{ id: 'Strength', duration: 1, amount: upgraded? 2: 1 }, { id: 'Dexterity', duration: 1, amount: upgraded? 2: 1 }] };
                this.exhausts = true; break; // Power exhausts
            case 31: // Cuddling / Affection
                values.damage = 0; values.block = upgraded ? 7 : 4; values.heal = upgraded ? 3 : 2; values.status = []; break;
            case 32: // Dirty Talk
                values.damage = 0; values.block = 0; setStatus('Vulnerable', 1 + upgradeStatusDurationBonus, 1); values.draw = upgraded ? 1 : 0; break;
            case 46: // Compliments / Praise
                values.damage = 0; values.block = upgraded ? 6 : 3; setStatus('Strength', 99, 1 + upgradeStatusAmountBonus, 'self'); break; // BuffSelf is now keyword based
            case 49: // Shared Fantasy Talk
                values.damage = 0; values.block = 0; values.draw = upgraded ? 2 : 1; values.focus = upgraded ? 1 : 0; values.status = []; break;
            case 51: // Stress Relief Focus
                values.damage = 0; values.block = upgraded ? 9 : 6; values.heal = upgraded ? 3 : 2; this.exhausts = true; break;
            case 74: // Flirting / Banter
                values.damage = upgraded ? 4 : 2; values.block = 0; setStatus('Weak', 1, 1); values.draw = upgraded ? 1 : 0; break;

            // --- Batch 2 Overrides (Revisited) ---
            case 7: // Impact Play (Light)
                values.damage = upgraded ? 6 : 4; values.block = 0; values.status = upgraded ? [{ id: 'Vulnerable', duration: 1, target: 'enemy', amount: 1 }] : []; break;
            case 8: // Impact Play (Heavy)
                 values.damage = upgraded ? 12 : 9; values.block = 0; values.status = upgraded ? [{ id: 'Weak', duration: 1, target: 'enemy', amount: 1 }] : []; break;
            case 9: // Sensation Play (Pain/Intensity Focus)
                values.damage = upgraded ? 4 : 2; values.block = 0; setStatus('Vulnerable', 1 + upgradeStatusDurationBonus, 1); break; // Example: Pain makes vulnerable
            case 13: // Role-Playing (Scenario)
                values.damage = 0; values.block = upgraded ? 8 : 5; values.draw = upgraded ? 1 : 0; values.status = []; break; // Focus on block/draw
            case 15: // Deep Emotional Intimacy - POWER
                values.damage = 0; values.block = 0; values.heal = upgraded ? 6 : 4; setStatus('Regen', upgraded ? 4 : 3, 2 + upgradeStatusAmountBonus, 'self'); this.exhausts = true; break;
            case 16: // Rope Bondage (Shibari/Kinbaku) - Skill?
                 values.damage = 0; values.block = upgraded ? 10 : 7; setStatus('Entangle', upgraded ? 3 : 2, 1); break; // Apply Entangle (cost increase)
            case 17: // Restriction / Helplessness - POWER? Skill? Let's make it skill.
                 values.damage = 0; values.block = upgraded ? 12 : 8; values.status = []; this.exhausts = true; break; // High block, exhausts
            case 33: // Mutual Masturbation
                values.damage = 0; values.block = 0; values.focus = upgraded ? 2 : 1; values.draw = upgraded ? 1 : 0; values.status = []; break;
            case 37: // Sensory Deprivation (Light)
                values.damage = 0; values.block = upgraded ? 7 : 4; setStatus('Dexterity', 99, upgraded ? 2 : 1, 'self'); break; // Buff self dex
            case 47: // Eye Contact
                values.damage = 0; values.block = upgraded ? 5 : 3; setStatus('Vulnerable', upgraded ? 2 : 1, 1); break; // Make target Vulnerable
            case 57: // Sensory Enhancement
                values.damage = 0; values.block = 0; values.draw = 1; values.focus = upgraded ? 1 : 0; setStatus('Strength', 99, 1, 'self'); break; // Buff self str
            case 60: // Sapiosexuality - Skill
                values.damage = 0; values.block = 0; values.status = []; values.draw = 1 + Math.floor((this.elementScores.C || 0) / 4) + (upgraded ? 1 : 0); this.cost = 1; break; // Keep draw logic
            case 66: // Foreplay Focus
                values.damage = 0; values.block = upgraded ? 7 : 4; setStatus('Weak', upgraded ? 2 : 1, 1); break; // Make target weak
            case 67: // Oral Sex (Giving/Receiving) - Attack
                values.damage = upgraded ? 10 : 7; values.block = 0; values.status = upgraded ? [{ id: 'Vulnerable', duration: 1, target: 'enemy', amount: 1 }] : []; break; // Good damage, maybe vuln

            // --- More Specific Examples ---
            case 34: // Group Sex - Attack AOE
                 values.damage = upgraded ? 6 : 4; values.aoe = true; values.block = 0; values.status = []; break;
            case 38: // Tease & Denial - Skill Targetted
                 values.damage = 0; values.block = 0; setStatus('Strength', 99, upgraded? -2 : -1, 'enemy'); break; // Reduce enemy strength
            case 39: // Age Play - Skill Self
                 values.damage = 0; values.block = upgraded ? 8: 5; values.heal = upgraded ? 3 : 2; values.status = []; break; // Block + Heal
            case 40: // Primal Play - Attack
                 values.damage = upgraded ? 8 : 5; values.block = 0; setStatus('Weak', 1, 1); break; // Damage + Weak
            case 45: // Humiliation / Degradation - Skill Targetted
                 values.damage = 0; values.block = 0; setStatus('Frail', upgraded ? 3 : 2, 1); setStatus('Vulnerable', upgraded ? 2 : 1, 1); break; // Heavy debuff
            case 87: // Light Bondage (Cuffs/Silk) - Skill
                 values.damage = 0; values.block = upgraded ? 7 : 4; setStatus('Weak', 1 + upgradeStatusDurationBonus, 1); break; // Block + Weak
            case 98: // Pet Play - Skill Self
                 values.damage = 0; values.block = upgraded ? 9 : 6; values.draw = 1; break; // Block + Draw
            case 101: // Ritualistic Play - Power
                 values.damage = 0; values.block = 0; values.status = [];
                 values.meta.trigger = 'onTurnStart';
                 values.meta.effect = { applyStatusToSelf: [{id:'ProtocolActive', duration: 99, amount: upgraded? 3 : 2}] }; // Apply a custom buff
                 this.exhausts = true; break;
            case 126: // Brat - Skill Self? Target? Let's make it tricky.
                 values.damage = upgraded ? 5 : 3; values.block = 0; values.draw = 1; // Low damage, but draws a card
                 setStatus('Weak', 1, 1, 'self'); // Applies weak to SELF!
                 this.requiresTarget = true; // Needs target for damage
                 this.targetType = 'enemy';
                 break;
            case 128: // Masochist - Power? Skill?
                 values.damage = 0; values.block = 0; values.status = [];
                 values.meta.trigger = 'onDamageTaken';
                 values.meta.effect = { gainEnergy: upgraded? 2 : 1 }; // Gain energy when taking damage
                 this.exhausts = true; break; // Power exhausts

            // Handle Status/Curse Cards
            case 'status_static': values.damage=0; values.block=0; values.draw=0; values.focus=0; values.heal=0; values.status=[]; this.cost = null; break;
            case 'curse_heavy_heart': values.damage=0; values.block=0; values.draw=0; values.focus=0; values.heal=0; values.status=[]; this.cost = null; break; // Passive handled elsewhere


            // ... ADD MANY MORE OVERRIDES HERE based on data.js concepts ...
        }
    }


    /** Stores upgrade calculations */
     _prepareUpgradeData(conceptData) {
         const upgradedValues = this._calculateEffects(conceptData, true);
         let upgradedCost = this.cost; // Start with base cost

         // Upgrade Cost Logic: Reduce cost if upgrade isn't significantly powerful
         if (upgradedCost !== null && upgradedCost > 0) {
             const baseValues = this.calculatedValues;
             let significantIncrease = false;

             // Check numerical increases
             if ((upgradedValues.damage > baseValues.damage + 3) || (upgradedValues.block > baseValues.block + 3) || (upgradedValues.heal > baseValues.heal + 2)) significantIncrease = true;
             // Check additions (draw, focus)
             if ((upgradedValues.draw > baseValues.draw) || (upgradedValues.focus > baseValues.focus)) significantIncrease = true;
             // Check status effect improvements (new status, increased duration/amount)
             if (upgradedValues.status.length > baseValues.status.length) significantIncrease = true;
             else {
                 significantIncrease = upgradedValues.status.some((upgStatus, i) => {
                      const baseStatus = baseValues.status[i];
                      if (!baseStatus) return true; // Status added
                      // Check duration increase (excluding 99)
                      if (upgStatus.duration !== 99 && baseStatus.duration !== 99 && upgStatus.duration > baseStatus.duration) return true;
                      // Check amount increase
                      if (upgStatus.amount > baseStatus.amount) return true;
                      return false;
                  });
             }
              // Check if exhausts/ethereal was added/removed (less common)
              // if (this._determineExhaust(conceptData, true) !== this.exhausts) significantIncrease = true;

             // Reduce cost if upgrade wasn't significant
             if (!significantIncrease) {
                  upgradedCost = Math.max(0, upgradedCost - 1);
             }
         }


         return { values: upgradedValues, cost: upgradedCost };
     }


    /** Defines the function to execute the card's effect */
    _defineEffectExecution(conceptData) {
        // Status/Curse cards have no direct execution logic
        if (['Status', 'Curse'].includes(conceptData.cardType) || this.keywords.includes('Unplayable')) {
            return (player, target = null, enemies = []) => {
                console.warn(`Attempted to execute unplayable card: ${this.name}`);
            };
        }

        // Return the main execution function
        return (player, target = null, enemies = []) => {
            const values = this.upgraded ? this.upgradeData.values : this.calculatedValues;
            const effectTarget = this.targetType === 'self' ? player : target; // Determine effective target for single-target effects

            if (!player) {
                console.error(`Card Execution Error (${this.name}): Player reference missing.`);
                return;
            }

            // console.log(`Executing ${this.name}:`, values); // Debug log

            try {
                // --- Apply Status Effects ---
                values.status?.forEach(statusEffect => {
                    let targetsToApply = [];
                    if (statusEffect.target === 'self') {
                        targetsToApply.push(player);
                    } else if (statusEffect.target === 'all_enemies') {
                        targetsToApply = enemies?.filter(e => e && e.currentHp > 0) || [];
                    } else if (statusEffect.target === 'enemy') {
                         if (this.aoe) { // Apply enemy debuff to all if card is AOE
                              targetsToApply = enemies?.filter(e => e && e.currentHp > 0) || [];
                         } else if (effectTarget && effectTarget !== player && effectTarget.currentHp > 0) { // Single target enemy
                              targetsToApply.push(effectTarget);
                         }
                    }

                    if (targetsToApply.length > 0) {
                        targetsToApply.forEach(t => t.applyStatus(statusEffect.id, statusEffect.duration || 1, statusEffect.amount || 1, this.primaryElement));
                    } else if (!['self', 'all_enemies'].includes(statusEffect.target)) {
                        // Don't warn if targeting was 'self' or 'all_enemies' but no valid targets exist
                        console.warn(`Status ${statusEffect.id} on ${this.name} had no valid target(s). TargetType: ${this.targetType}, AOE: ${this.aoe}`);
                    }
                });

                // --- Deal Damage ---
                if (values.damage > 0) {
                    const modifiedDamage = player.applyModifiers('damageDealt', values.damage);
                    if (this.aoe) {
                        enemies?.forEach(enemy => {
                            if (enemy?.currentHp > 0) enemy.takeDamage(modifiedDamage, this.primaryElement);
                        });
                    } else if (this.targetType === 'enemy' && effectTarget && effectTarget.currentHp > 0) {
                        effectTarget.takeDamage(modifiedDamage, this.primaryElement);
                    } else if (this.targetType === 'enemy') {
                        console.warn(`Damage card ${this.name} requires a valid enemy target.`);
                    }
                }

                // --- Apply Self Effects ---
                if (values.block > 0) player.gainBlock(values.block);
                if (values.heal > 0) player.heal(values.heal);
                if (values.draw > 0) player.drawCards(values.draw);
                if (values.focus > 0) player.gainFocus(values.focus);

                // --- Specific Card Execution Logic (Post-Standard Effects) ---
                // This is where you'd put unique logic not covered by the standard values
                // Example: A card that consumes Poison on target for bonus damage
                // if (this.conceptId === 'poison_purge') {
                //     if (effectTarget && effectTarget.hasStatus('Poison')) {
                //         const poisonAmount = effectTarget.getStatusAmount('Poison');
                //         effectTarget.removeStatus('Poison');
                //         effectTarget.takeDamage(poisonAmount * 2, 'Purge'); // Deal damage based on removed poison
                //     }
                // }

            } catch (error) {
                console.error(`Error during effect execution for ${this.name} (ID: ${this.conceptId}):`, error, "Values:", values);
            }
        };
    }

    /** Execute the card's defined effect */
    executeEffect(player, target = null, enemies = []) {
         if (typeof this.effectLogic === 'function') {
             this.effectLogic(player, target, enemies);
         } else {
             console.error(`Card ${this.name} has no defined effect logic!`);
         }
    }

    /** Upgrade the card instance */
    upgrade() {
         if (this.upgraded) return;
         this.upgraded = true;
         if (!this.name.endsWith('+')) this.name += "+"; // Append '+' only once

         // Apply upgraded cost if it's defined and lower
         if (this.upgradeData?.cost !== undefined && this.upgradeData.cost < (this.cost ?? 99) ) {
             this.cost = this.upgradeData.cost;
         }
         // Note: The effect logic function `this.effectLogic` inherently checks `this.upgraded`
         // to use the correct values (`this.upgradeData.values` or `this.calculatedValues`).
         // No need to redefine `this.effectLogic` itself.

         console.log(`Card ${this.name} upgraded. New cost: ${this.cost === null ? 'Unplayable' : this.cost}`);
         // Trigger artifact for upgrade
         player?.triggerArtifacts('onCardUpgrade', { card: this });
    }

    // --- Display Methods ---

    /** Generate HTML description of effects based on current state (base/upgraded) */
    getEffectDescriptionHtml() {
        const values = this.upgraded ? this.upgradeData.values : this.calculatedValues;
        if (!values) { // Handle case where upgradeData might be missing
            console.warn(`Card ${this.name} missing calculated values for ${this.upgraded ? 'upgraded' : 'base'} state.`);
            return this.baseEffectDescription || "Error displaying effect.";
        }

        let parts = [];
        // Order matters for readability: Damage/Block first, then Statuses, then resource gain.
        if (values.damage > 0) parts.push(`Deal ${values.damage} damage${this.aoe ? ' to ALL enemies' : ''}.`);
        if (values.block > 0) parts.push(`Gain ${values.block} Block.`);
        if (values.heal > 0) parts.push(`Heal ${values.heal}.`);

        values.status?.forEach(s => {
            let targetText = ""; let valueText = "";
            // Determine target text
            if (s.target === 'self') targetText = " self";
            else if (s.target === 'all_enemies') targetText = " ALL enemies";
            else if (this.aoe && s.target === 'enemy') targetText = " ALL enemies"; // Enemy status applied to all if card is AOE
            else targetText = " enemy"; // Default enemy target

            // Determine value text (amount or duration)
            const isStacking = ['Strength', 'Dexterity', 'Poison', 'Regen', 'Burn', 'Metallicize', 'Thorns', 'Entangle', 'ProtocolActive'].includes(s.id);
            if (isStacking && s.amount > 1) valueText = `${s.amount} `;
            else if (!isStacking && s.duration > 1 && s.duration !== 99) valueText = `(${s.duration}) `; // Show duration for timed debuffs

            parts.push(`Apply ${valueText}${s.id}${targetText}.`);
        });

        if (values.draw > 0) parts.push(`Draw ${values.draw} card${values.draw > 1 ? 's' : ''}.`);
        if (values.focus > 0) parts.push(`Gain ${values.focus} Focus.`);

        // Add keywords to description
        const keywordsToShow = this.keywords.filter(k => k !== 'Unplayable'); // Don't show unplayable keyword explicitly
        if (keywordsToShow.length > 0) parts.push(keywordsToShow.join('. ') + '.');

        // Fallback to base description if no effects calculated (should be rare)
        if (parts.length === 0 && !this.keywords.includes('Unplayable')) {
             parts.push(this.baseEffectDescription || "No effect described.");
        } else if (this.keywords.includes('Unplayable')) {
             parts.push("Unplayable.");
        }

        return parts.join(' ').trim();
    }

    /** Generate HTML for tooltip display */
    getTooltipHtml() {
         let html = `<div class="card-tooltip">`;
         const costDisplay = this.cost === null ? 'X' : this.cost;
         html += `<div class="tooltip-header"><strong>${this.name} (${costDisplay} <i class="fa-solid fa-bolt" style="color: #f1c40f;"></i>)</strong></div>`;
         html += `<div class="tooltip-type"><em>${this.cardType || 'Unknown Type'} - ${this.rarity || 'common'}</em></div><hr>`;
         html += `<div class="tooltip-description">${this.getEffectDescriptionHtml()}</div>`;

         // Add detailed description if different from effect description
         const effectDesc = this.getEffectDescriptionHtml().replace(/\.\s*$/, ""); // Remove trailing period for comparison
         const detailDesc = (this.detailedDescription || "").replace(/\.\s*$/, "");
         if (this.detailedDescription && detailDesc !== effectDesc && detailDesc !== (this.baseEffectDescription || "").replace(/\.\s*$/, "")) {
             html += `<hr><div class="tooltip-detail-desc"><i>${this.detailedDescription}</i></div>`;
         }

         // Add unlocked lore level
         if (this.lore && this.lore.length > 0) {
             // Find highest unlocked level (assuming lore array is sorted by level or checking unlocked flag)
             let highestUnlockedLore = null;
             for (let i = this.lore.length - 1; i >= 0; i--) {
                 if (this.lore[i].unlocked) {
                     highestUnlockedLore = this.lore[i];
                     break;
                 }
             }
             if(highestUnlockedLore) {
                html += `<hr><div class="tooltip-lore"><b>Lore Lvl ${highestUnlockedLore.level}:</b> <i>${highestUnlockedLore.text}</i></div>`;
             }
         }
         html += `</div>`;
         return html;
     }

} // End Card Class
