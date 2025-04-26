// js/core/Card.js

import * as Data from '../data.js';
// Import specific game classes IF effect logic needs to directly call methods on them
// (Though preferably effects modify player/target passed in)
// import { Player } from './Player.js';
// import { Enemy } from '../combat/Enemy.js';

// --- Constants ---
const CARD_TYPE_FUNCTION_MAP = { /* ... keep as is ... */ };

/**
 * Represents a single playable card during a run.
 */
export class Card {
    // --- Keep existing constructor setup ---
    constructor(conceptId) {
        const conceptData = Data.concepts.find(c => c.id === conceptId);
        if (!conceptData) {
            // ... keep error handling ...
            this.id = -1; this.conceptId = -1; this.name = "Error Card"; this.rarity = 'common';
            this.cardType = "Error"; this.cost = 0; this.baseEffectDescription = "Error."; this.elementScores = {};
            this.keywords = []; this.upgraded = false; this.requiresTarget = false; this.targetType = null;
            this.aoe = false; this.exhausts = false; this.isEthereal = false; this.effectLogic = () => {};
            return;
        }

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
        this.cost = this.determineCost(conceptData);
        this.baseEffectDescription = conceptData.briefDescription;
        this.detailedDescription = conceptData.detailedDescription;
        this.requiresTarget = this.determineTargeting(conceptData);
        this.targetType = this.determineTargetType(conceptData); // 'enemy', 'self', null
        this.aoe = this.determineAOE(conceptData);
        this.exhausts = this.determineExhaust(conceptData);
        this.isEthereal = this.determineEthereal(conceptData); // Example: Add ethereal flag?
        this.upgraded = false;

        // --- Effect Definition ---
        // Store calculated values for use in descriptions and logic
        this.calculatedValues = this._calculateEffects(conceptData, false); // Calculate for non-upgraded
        this.upgradeData = this._prepareUpgradeData(conceptData); // Stores calcs for upgraded version

        // Define the execution function
        this.effectLogic = this._defineEffectExecution(conceptData);

         // Add simple check for basic attack/block keywords for targeting default
         if (!this.requiresTarget && (this.keywords.includes('Block') || this.keywords.includes('Defend'))) {
             this.targetType = 'self';
         }
    }

    // --- Property Determination Methods ---

    determineCost(conceptData) {
        // Refined Example: Cost based on rarity and key scores, maybe type
        let calculatedCost = 1; // Default cost
        const scores = conceptData.elementScores || {};
        const avgScore = Object.values(scores).length > 0 ? Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length : 5;
        const maxScore = Math.max(...Object.values(scores), 0);

        if (conceptData.cardType === 'Identity/Role' || conceptData.cardType === 'Psychological/Goal') {
             // Powers often cost more or exhaust
             calculatedCost = Math.max(1, Math.round(avgScore / 3.5));
             if (maxScore >= 9) calculatedCost++;
        } else { // Practice/Kink etc.
             calculatedCost = Math.max(1, Math.round(avgScore / 4));
        }

        // Adjust by rarity
        if (this.rarity === 'uncommon') calculatedCost = Math.max(1, calculatedCost); // Ensure uncommon cost at least 1
        if (this.rarity === 'rare') calculatedCost = Math.max(1, calculatedCost + 1); // Rare usually cost more
        if (this.rarity === 'common' && calculatedCost > 1) calculatedCost = 1; // Cap most common cards at 1 cost? Design choice.

        // Specific overrides based on name/keywords
        if (conceptData.keywords?.includes('Simple') || conceptData.keywords?.includes('Comfort')) calculatedCost = Math.max(0, calculatedCost -1); // Make simple/comfort cheaper, potentially 0
        if (conceptData.keywords?.includes('Intensity') && conceptData.keywords?.includes('Damage')) calculatedCost++; // Intense damage costs more

        return Math.max(0, Math.min(3, calculatedCost)); // Clamp cost between 0 and 3
    }

    determineTargeting(conceptData) {
        // If it deals damage, applies direct debuffs, or is explicitly about interaction ON another
        if (this.keywords.includes('Damage') && !this.keywords.includes('AOE')) return true;
        if (['Weak', 'Vulnerable', 'Frail', 'Confusion'].some(k => this.keywords.includes(k))) return true; // Direct debuffs usually target
        if (conceptData.cardType === 'Interaction' && (conceptData.elementScores?.I || 0) >= 6 && !this.keywords.includes('Self')) return true; // High Interaction usually targets
        if (conceptData.keywords.includes('Control') || conceptData.keywords.includes('Command')) return true;
        if (conceptData.keywords.includes('Impact')) return true;
        // Add more specific checks
        return false;
    }

     determineTargetType(conceptData) {
         if (!this.determineTargeting(conceptData)) return null; // No target needed
         // Default to enemy, but check for self-targeting keywords/types
         if (this.keywords.includes('Heal') || this.keywords.includes('BuffSelf') || this.keywords.includes('GainFocus')) return 'self';
         if (conceptData.cardType === 'Psychological/Goal' && this.keywords.includes('Comfort')) return 'self';
         // Add more specific self-target cases
         return 'enemy'; // Default target is enemy
     }

     determineAOE(conceptData) {
          // Check keywords or specific card IDs
          if (this.keywords.includes('AOE') || this.keywords.includes('Group')) return true;
          if (conceptData.name === 'Group Sex') return true; // Example specific card
          return false;
      }

    determineExhaust(conceptData) {
         // Powers ('Identity/Role', 'Psychological/Goal') often exhaust
         if (['Identity/Role', 'Psychological/Goal'].includes(conceptData.cardType)) return true;
         // High-cost rare cards often exhaust
         if (this.rarity === 'rare' && this.cost >= 2) return true;
         // Specific keywords
         if (this.keywords.includes('Ritual') || this.keywords.includes('OneTime')) return true;
          // Explicit card IDs
         if ([/* Add specific concept IDs here */].includes(conceptData.id)) return true;
         return false;
     }

     determineEthereal(conceptData) {
         // Example: Maybe cards related to 'Fleeting' or specific 'Mind' concepts?
         if (this.keywords.includes('Fleeting') || this.keywords.includes('Ephemeral')) return true;
         return false;
     }

    // --- Effect Calculation and Execution ---

    /** Calculates base effect values (damage, block, etc.) */
    _calculateEffects(conceptData, upgraded = false) {
        const values = { damage: 0, block: 0, draw: 0, focus: 0, heal: 0, status: [], aoe: this.aoe };
        const scores = conceptData.elementScores || {};
        const upgradeMultiplier = upgraded ? 1.3 : 1.0; // General upgrade boost (adjust)
        const basePotency = Math.max(1, Math.floor((scores.S || 0 + scores.I || 0 + scores.P || 0 + scores.C || 0) / 2.5)); // Simple combined potency score

        // --- Basic Damage/Block from Sensory/Interaction ---
        if (this.keywords.includes('Attack') || this.keywords.includes('Damage') || this.keywords.includes('Impact') || conceptData.cardType === "Practice/Kink") {
            let dmgMod = 1.0;
            if (scores.S >= 7) dmgMod += 0.3;
            if (scores.I >= 6 && this.requiresTarget) dmgMod += 0.2; // Interaction contributes to targeted damage
            if (this.keywords.includes('Impact')) dmgMod += 0.4;
            values.damage = Math.max(1, Math.floor(basePotency * dmgMod * upgradeMultiplier * 0.8)); // Scale damage based on scores/keywords
             if (upgraded && values.damage > 0) values.damage = Math.max(values.damage + 2, Math.floor(values.damage * 1.2)); // Ensure upgrade adds noticeable damage
        }
         if (this.keywords.includes('Block') || this.keywords.includes('Defend') || this.keywords.includes('Comfort')) {
             let blockMod = 1.0;
             if (scores.S >= 6) blockMod += 0.2;
             if (scores.P >= 6) blockMod += 0.3; // Psychological comfort adds block
              values.block = Math.max(1, Math.floor(basePotency * blockMod * upgradeMultiplier * 0.7));
              if (upgraded && values.block > 0) values.block = Math.max(values.block + 2, Math.floor(values.block * 1.2)); // Ensure noticeable upgrade
         }

         // --- Status Effects from Interaction/Psychological/Keywords ---
         let statusDuration = upgraded ? 2 : 1;
         if (this.keywords.includes('Control') || this.keywords.includes('Weak')) values.status.push({ id: 'Weak', duration: statusDuration, target: 'enemy' });
         if (this.keywords.includes('Vulnerable') || this.keywords.includes('Expose')) values.status.push({ id: 'Vulnerable', duration: statusDuration, target: 'enemy' });
         if (this.keywords.includes('Frail')) values.status.push({ id: 'Frail', duration: statusDuration, target: 'enemy' }); // Frail = less block gain
          if (this.keywords.includes('StrengthSelf')) values.status.push({ id: 'Strength', duration: 99, amount: upgraded? 2: 1, target: 'self' }); // Strength stacks
          if (this.keywords.includes('DexteritySelf')) values.status.push({ id: 'Dexterity', duration: 99, amount: upgraded? 2: 1, target: 'self' }); // Dexterity stacks


         // --- Utility from Cognitive/Psychological/Keywords ---
         if (this.keywords.includes('Draw')) values.draw = upgraded ? 2 : 1;
         if (this.keywords.includes('Focus') || this.keywords.includes('GainFocus')) values.focus = upgraded ? 2 : 1;
         if (this.keywords.includes('Heal') || (this.keywords.includes('Comfort') && scores.P >= 7)) values.heal = Math.floor(basePotency * 0.5 * upgradeMultiplier) + (upgraded ? 2 : 1);

        // --- Refine based on Specific Cards ---
        // Example: Override for starter cards
        if (conceptData.id === 1) { // Vanilla Sex (assuming Attack)
             values.damage = upgraded ? 9 : 6; values.block = 0; values.status = [];
        }
         if (conceptData.id === 2) { // Sensual Touch (assuming Block)
              values.damage = 0; values.block = upgraded ? 8 : 5; values.status = [];
         }
         // Add more specific overrides...

        return values;
    }

    /** Stores upgrade calculations */
     _prepareUpgradeData(conceptData) {
         const upgradedValues = this._calculateEffects(conceptData, true);
         const upgradeInfo = {
             values: upgradedValues,
             cost: this.cost, // Check if cost should decrease
             // description: Generate dynamic description based on upgradedValues
         };
         // Example cost reduction logic
         if (this.cost > 0 && (upgradedValues.damage > this.calculatedValues.damage * 1.5 || upgradedValues.block > this.calculatedValues.block * 1.5)) {
             // If effect significantly improved, consider NOT reducing cost. Otherwise, reduce cost.
         } else if (this.cost > 0) {
              upgradeInfo.cost = Math.max(0, this.cost - 1);
         }
         return upgradeInfo;
     }


    /** Defines the actual function to execute the card's effect */
    _defineEffectExecution(conceptData) {
        // Return the function that will be stored in this.effectLogic
        return (player, target = null, enemies = []) => {
            // Use the pre-calculated values based on upgrade status
            const values = this.upgraded ? this.upgradeData.values : this.calculatedValues;
            const targetType = this.targetType; // Use determined target type

            console.log(`Executing effect for: ${this.name} (Upgraded: ${this.upgraded})`, values);

            // --- Apply Effects ---
            try { // Wrap execution in try-catch
                // Apply Status Effects FIRST
                values.status?.forEach(statusEffect => {
                    const statusTarget = (statusEffect.target === 'self' || targetType === 'self') ? player : target;
                    const sourceElement = this.primaryElement; // Pass card's element for resistance checks
                    if (statusTarget) {
                        console.log(` -> Applying ${statusEffect.id} (${statusEffect.duration || statusEffect.amount}) to ${statusTarget.name || 'Player'}`);
                        // Use applyStatus method on Player or Enemy class
                        statusTarget.applyStatus(statusEffect.id, statusEffect.duration || 1, statusEffect.amount || 1, sourceElement);
                    } else if (statusEffect.target === 'all_enemies') {
                         enemies.forEach(enemy => {
                             if (enemy.currentHp > 0) enemy.applyStatus(statusEffect.id, statusEffect.duration || 1, statusEffect.amount || 1, sourceElement);
                         });
                    }
                });

                // Deal Damage
                if (values.damage > 0) {
                    const modifiedDamage = player.applyModifiers('damageDealt', values.damage); // Apply player's Strength/Weak etc.
                    if (values.aoe) { // Check calculated AOE flag
                        console.log(` -> Dealing ${modifiedDamage} AOE damage`);
                        enemies.forEach(enemy => {
                            if (enemy.currentHp > 0) enemy.takeDamage(modifiedDamage, this.primaryElement);
                        });
                    } else if (targetType === 'enemy' && target) {
                        console.log(` -> Dealing ${modifiedDamage} damage to ${target.name}`);
                        target.takeDamage(modifiedDamage, this.primaryElement);
                    } else if (targetType !== 'self') { // Damage effect requires target but none valid
                         console.warn(`Damage card ${this.name} played without valid enemy target.`);
                    }
                }

                // Gain Block
                if (values.block > 0) {
                    console.log(` -> Gaining ${values.block} Block`);
                    player.gainBlock(values.block); // Player applies own modifiers internally now
                }

                // Heal Self
                if (values.heal > 0) {
                     console.log(` -> Healing ${values.heal} Integrity`);
                    player.heal(values.heal);
                }

                // Draw Cards
                if (values.draw > 0) {
                     console.log(` -> Drawing ${values.draw} card(s)`);
                    player.drawCards(values.draw);
                }

                // Gain Focus
                if (values.focus > 0) {
                     console.log(` -> Gaining ${values.focus} Focus`);
                    player.gainFocus(values.focus);
                }

                 // --- Add specific card logic here ---
                 if (this.conceptId === 30 && !this.upgraded) { // High Protocol D/s (Base)
                     player.applyStatus('ProtocolActive', 3, 1, this.primaryElement); // Apply for 3 turns
                     console.log("   -> Applied ProtocolActive(3)");
                 }
                 if (this.conceptId === 30 && this.upgraded) { // High Protocol D/s (Upgraded)
                      player.applyStatus('ProtocolActive', 99, 1, this.primaryElement); // Apply permanently for combat
                      console.log("   -> Applied ProtocolActive(Permanent)");
                 }


            } catch (error) {
                console.error(`Error during effect execution for ${this.name}:`, error);
            }
        };
    }

    /** Executes the card's defined effect logic. */
    executeEffect(player, target = null, enemies = []) {
        if (typeof this.effectLogic === 'function') {
            this.effectLogic(player, target, enemies);
        } else {
            console.error(`Card ${this.name} has no defined effect logic!`);
        }
    }

    /** Applies the upgrade effects to the card instance. */
    upgrade() {
        if (this.upgraded) return;
        console.log(`Upgrading card: ${this.name}`);
        this.upgraded = true;
        this.name += "+";

        // Apply direct changes like cost reduction if defined in upgradeData
        if (this.upgradeData.cost !== undefined && this.upgradeData.cost < this.cost) {
            this.cost = this.upgradeData.cost;
        }
        // The effect function this.effectLogic automatically uses upgraded values now
        console.log(`Card ${this.name} upgraded. New cost: ${this.cost}`);
    }

    // --- Display Methods ---

    /** Generates dynamic effect description for display */
    getEffectDescriptionHtml() {
        const values = this.upgraded ? this.upgradeData.values : this.calculatedValues;
        let desc = "";

        // Build description based on calculated values
        if (values.damage > 0) {
            desc += `Deal ${values.damage} damage${values.aoe ? ' to ALL enemies' : ''}. `;
        }
        if (values.block > 0) {
            desc += `Gain ${values.block} Block. `;
        }
        if (values.heal > 0) {
            desc += `Heal ${values.heal} Integrity. `;
        }
        values.status?.forEach(s => {
            desc += `Apply ${s.amount > 1 ? s.amount + ' ' : ''}${s.id}${s.target === 'self' ? ' to self' : (s.target === 'all_enemies' ? ' to ALL enemies': '')}${s.duration > 1 && s.duration !== 99 ? ` for ${s.duration} turns` : ''}. `;
        });
        if (values.draw > 0) {
            desc += `Draw ${values.draw} card${values.draw > 1 ? 's' : ''}. `;
        }
        if (values.focus > 0) {
            desc += `Gain ${values.focus} Focus. `;
        }

         // Add base description if no calculated effects or for flavor?
         if (desc === "") {
             desc = this.upgraded ? (this.detailedDescription || this.baseEffectDescription) : this.baseEffectDescription;
         }

        // Add Exhaust/Ethereal text
        if (this.exhausts) desc += " Exhaust.";
        if (this.isEthereal) desc += " Ethereal.";

        return desc.trim(); // Remove trailing space
    }

    /** Generates full tooltip HTML */
    getTooltipHtml() {
        let html = `<div class="card-tooltip">`;
        html += `<div class="tooltip-header"><strong>${this.name} (${this.cost} <i class="fas fa-bolt"></i>)</strong></div>`; // Added focus icon example
        html += `<div class="tooltip-type"><em>${this.cardType} - ${this.rarity}</em></div><hr>`;
        html += `<div class="tooltip-description">${this.getEffectDescriptionHtml()}</div>`;
        if (this.keywords.length > 0) {
            html += `<hr><div class="tooltip-keywords">Keywords: ${this.keywords.join(', ')}</div>`;
        }
        if (this.lore && this.lore.length > 0) {
             // Find lore matching current upgrade status? Or just show base?
             const loreToShow = this.lore[0]; // Show level 1 lore for now
             if(loreToShow) html += `<hr><div class="tooltip-lore"><i>${loreToShow.text}</i></div>`;
        }
        html += `</div>`;
        return html;
    }

} // End Card Class
