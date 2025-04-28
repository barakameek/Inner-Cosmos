// js/core/Card.js

// Import data (corrected path)
import * as Data from '../../data.js';

/**
 * Represents a single playable card instance during a run.
 * Card effects and properties are dynamically determined based on conceptData from data.js.
 */
export class Card {
    constructor(conceptId) {
        const conceptData = Data.concepts?.find(c => c.id === conceptId); // Add safe navigation

        if (!conceptData) {
            // ... (Keep existing Error Card setup) ...
            this.id = `card_error_${Date.now()}`;
            this.conceptId = -1; this.name = "Error Card"; this.rarity = 'common'; this.cardType = "Error"; this.cost = 99; this.baseEffectDescription = "Error loading card data."; this.detailedDescription = "Could not find concept data."; this.elementScores = {}; this.keywords = ['Unplayable']; this.upgraded = false; this.requiresTarget = false; this.targetType = null; this.aoe = false; this.exhausts = true; this.isEthereal = false; this.effectLogic = () => { console.error("Attempted to play Error Card."); }; this.calculatedValues = {}; this.upgradeData = {}; this.primaryElement = null; this.lore = []; this.visualHandle = null; this.upgradeBranch = null; // Added to track chosen upgrade
            return;
        }

        // --- Base Properties from Concept Data ---
        this.id = `card_${conceptId}_${Date.now()}_${Math.random().toString(36).substring(7)}`; // Unique instance ID
        this.conceptId = conceptId;
        this.name = conceptData.name;
        this.rarity = conceptData.rarity || 'common';
        this.cardType = conceptData.cardType;
        this.visualHandle = conceptData.visualHandle;
        this.primaryElement = conceptData.primaryElement || this._determineDominantElement(conceptData.elementScores);
        this.elementScores = { ...(conceptData.elementScores || {}) };
        this.keywords = [...(conceptData.keywords || [])]; // Copy keywords
        this.lore = conceptData.lore ? JSON.parse(JSON.stringify(conceptData.lore)) : []; // Deep copy lore

        // --- Dynamic properties determined by helpers ---
        this.cost = this._determineCost(conceptData);
        this.baseEffectDescription = conceptData.briefDescription;
        this.detailedDescription = conceptData.detailedDescription;
        this.requiresTarget = this._determineTargeting(conceptData);
        this.targetType = this._determineTargetType(conceptData);
        this.aoe = this._determineAOE(conceptData);
        this.exhausts = this._determineExhaust(conceptData);
        this.isEthereal = this._determineEthereal(conceptData);
        this.upgraded = false;
        this.upgradeBranch = null; // NEW: Track which branch was chosen

        // --- Add inherent keywords based on properties ---
        if (this.exhausts && !this.keywords.includes('Exhaust')) this.keywords.push('Exhaust');
        if (this.isEthereal && !this.keywords.includes('Ethereal')) this.keywords.push('Ethereal');
        if (this.targetType === null && this.cost === null && !this.keywords.includes('Unplayable')) this.keywords.push('Unplayable');


        // --- Effect Definition ---
        // Calculate and store effect values for base state
        this.calculatedValues = this._calculateEffects(conceptData, false);
        // Prepare data for potential upgrades (both branches)
        this.upgradeData = this._prepareUpgradeData(conceptData); // Modified to store both branches

        // Define the execution function based on calculated values (now checks this.upgraded and this.upgradeBranch)
        this.effectLogic = this._defineEffectExecution(conceptData);

        // Final refinement of target type based on calculated effects
         if (!this.requiresTarget && (this.calculatedValues.block > 0 || this.calculatedValues.heal > 0 || this.calculatedValues.focus > 0 || this.calculatedValues.draw > 0 || (this.calculatedValues.status.length > 0 && this.calculatedValues.status.every(s => s.target === 'self'))) && this.calculatedValues.damage === 0) {
             this.targetType = 'self';
             this.requiresTarget = false;
         } else if (this.requiresTarget && !this.targetType) {
             this.targetType = 'enemy';
         }

         // Ensure cost is null for unplayable cards
         if (this.keywords.includes('Unplayable')) {
            this.cost = null;
         }
    }

    // --- Property Determination Methods ---
    _determineDominantElement(scores = {}) { /* ... Keep existing ... */
        let dominant = null; let maxScore = -1; const elementOrder = ['A', 'I', 'S', 'P', 'C', 'R', 'RF'];
        for (const element of elementOrder) { if ((scores[element] || 0) > maxScore) { maxScore = scores[element]; dominant = element; } } return dominant;
    }
    _determineCost(conceptData) { /* ... Keep existing ... */
        if (['Status', 'Curse'].includes(conceptData.cardType) || this.keywords.includes('Unplayable')) return null;
        let calculatedCost = 1; const scores = conceptData.elementScores || {}; const avgScore = Object.values(scores).length > 0 ? Object.values(scores).reduce((a, b) => a + (b || 0), 0) / Object.values(scores).length : 5; const maxScore = Math.max(...Object.values(scores).map(s => s || 0), 0);
        if (['Identity/Role', 'Psychological/Goal', 'Power'].includes(conceptData.cardType)) { calculatedCost = Math.max(1, Math.round(avgScore / 3.0)); if (maxScore >= 9) calculatedCost++; } else { calculatedCost = Math.max(1, Math.round(avgScore / 4.0)); }
        if (conceptData.rarity === 'uncommon') calculatedCost = Math.max(1, calculatedCost); if (conceptData.rarity === 'rare') calculatedCost = Math.max(1, calculatedCost + 1);
        if (this.keywords.includes('Simple') || this.keywords.includes('Comfortable')) calculatedCost = Math.max(0, calculatedCost -1); if (this.keywords.includes('Intensity') && (this.keywords.includes('Damage') || this.keywords.includes('Pain') || this.keywords.includes('Impact'))) calculatedCost++; if (this.keywords.includes('Draw') && calculatedCost < 1) calculatedCost = 1; if (this.keywords.includes('Ritual') || this.keywords.includes('Complex')) calculatedCost++;
        return Math.max(0, Math.min(3, calculatedCost));
    }
    _determineTargeting(conceptData) { /* ... Keep existing ... */
        if (['Status', 'Curse'].includes(conceptData.cardType)) return false; if (this.keywords.includes('TargetEnemy') || this.keywords.includes('DebuffEnemy')) return true; if (this.keywords.includes('TargetSelf') || this.keywords.includes('BuffSelf')) return false;
        if ((this.keywords.includes('Attack') || this.keywords.includes('Damage') || this.keywords.includes('Impact')) && !this._determineAOE(conceptData) ) return true;
        const debuffKeywords = ['Weak', 'Vulnerable', 'Frail', 'Poison', 'Burn', 'Confusion', 'Entangle', 'Stun']; if (debuffKeywords.some(k => this.keywords.includes(k)) && !this.keywords.includes('BuffSelf')) return true;
        if (conceptData.cardType === 'Interaction' && (conceptData.elementScores?.I || 0) >= 6 && !this._determineAOE(conceptData) && !this.keywords.includes('Self')) return true; if (this.keywords.includes('Control') || this.keywords.includes('Command')) return true;
        return false;
     }
    _determineTargetType(conceptData) { /* ... Keep existing ... */
         if (!this._determineTargeting(conceptData)) return null; const selfTargetIds = [31, 46, 51, 57, 15, 37]; if (selfTargetIds.includes(conceptData.id)) return 'self'; if (this.keywords.includes('BuffSelf') || this.keywords.includes('HealSelf') || this.keywords.includes('GainFocus') || this.keywords.includes('GainBlock') || this.keywords.includes('Self')) return 'self'; if (conceptData.cardType === 'Psychological/Goal' && this.keywords.includes('Comfort')) return 'self'; return 'enemy';
      }
    _determineAOE(conceptData) { /* ... Keep existing ... */
           if (this.keywords.includes('AOE') || this.keywords.includes('Group') || this.keywords.includes('AllEnemies')) return true; if (conceptData.id === 34) return true; return false;
       }
    _determineExhaust(conceptData) { /* ... Keep existing ... */
        if (this.keywords.includes('Exhaust')) return true; if (['Identity/Role', 'Psychological/Goal', 'Power'].includes(conceptData.cardType)) { if ([46, 51].includes(conceptData.id) && this.rarity === 'common') return false; if (this.cost <= 1 && this.rarity === 'common') return false; return true; }
        if (this.rarity === 'rare' && this._determineCost(conceptData) >= 2) return true; if (this.keywords.includes('Ritual') || this.keywords.includes('Transform') || this.keywords.includes('Intense') || this.keywords.includes('TPE') || this.keywords.includes('MajorDebuff')) return true;
        const exhaustIds = [15, 109, 131, 132, 137, 4, 5, 30, 41, 42, 43, 44, 45, 101, 111, 113, 116, 119, 120, 122, 123, 124, 125]; if (exhaustIds.includes(conceptData.id)) return true;
        return false;
      }
    _determineEthereal(conceptData) { /* ... Keep existing ... */
          if (this.keywords.includes('Ethereal') || this.keywords.includes('Fleeting') || this.keywords.includes('Ephemeral')) return true; if (conceptData.cardType === 'Curse') return true; return false;
      }

    // --- Effect Calculation and Execution ---

    /** Calculates effect values (damage, block, etc.) for base or upgraded state */
    _calculateEffects(conceptData, upgraded = false) {
        // ... (Keep existing effect calculation logic) ...
        // This function should return the 'values' object for either base or refined state
        const values = { damage: 0, block: 0, draw: 0, focus: 0, heal: 0, status: [], aoe: this._determineAOE(conceptData), meta: {} };
        const scores = conceptData.elementScores || {}; const primaryElem = this.primaryElement;
        let primaryScore = scores[primaryElem] || 0; let scoreScale = (score) => Math.floor(score / 1.5 + 2);
        let effectScale = scoreScale(primaryScore);
        const upgradeEffectBonus = upgraded ? Math.max(1, Math.floor(effectScale * 0.3) + 1) : 0;
        const upgradeStatusDurationBonus = upgraded ? 1 : 0;
        const upgradeStatusAmountBonus = upgraded ? Math.ceil((scores[primaryElem] || 1) / 4) : 0;

        if (this.keywords.includes('Attack') || this.keywords.includes('Damage') || this.keywords.includes('Impact') || conceptData.cardType === "Practice/Kink" || primaryElem === 'S' || primaryElem === 'I') { values.damage = effectScale + (this.keywords.includes('Impact') ? 2 : 0); values.damage += upgradeEffectBonus; if (conceptData.id === 8) values.damage += 3; }
        if (this.keywords.includes('Block') || this.keywords.includes('Defend') || this.keywords.includes('Comfort') || conceptData.cardType === "Psychological/Goal" || primaryElem === 'P' || primaryElem === 'S') { values.block = Math.floor(effectScale * 0.8) + (this.keywords.includes('Comfort') ? 1 : 0); values.block += upgradeEffectBonus; }
        if (this.keywords.includes('Draw') || primaryElem === 'C' || primaryElem === 'R') { values.draw = Math.max(0, Math.floor((scores.C || 0) / 5)); if (this.keywords.includes('Draw')) values.draw = Math.max(1, values.draw); if (upgraded) values.draw++; }
        if (this.keywords.includes('Focus') || this.keywords.includes('GainFocus') || primaryElem === 'C' || primaryElem === 'P') { values.focus = Math.max(0, Math.floor((scores.C || 0) / 7)); if (this.keywords.includes('Focus') || this.keywords.includes('GainFocus')) values.focus = Math.max(1, values.focus); if (upgraded) values.focus++; }
        if (this.keywords.includes('Heal') || primaryElem === 'P' || primaryElem === 'R') { values.heal = Math.floor(effectScale * 0.6); if (this.keywords.includes('Heal')) values.heal = Math.max(1, values.heal); values.heal += upgradeEffectBonus; }

        let statusDuration = 1 + upgradeStatusDurationBonus; let baseStatusAmount = 1;
        const applyStatus = (id, dur, amt, target = 'enemy') => { values.status.push({ id: id, duration: dur, amount: amt, target: target }); };
        if (this.keywords.includes('Weak')) applyStatus('Weak', statusDuration, baseStatusAmount); if (this.keywords.includes('Vulnerable')) applyStatus('Vulnerable', statusDuration, baseStatusAmount); if (this.keywords.includes('Frail')) applyStatus('Frail', statusDuration, baseStatusAmount); if (this.keywords.includes('Poison')) applyStatus('Poison', 99, 3 + Math.floor(upgradeStatusAmountBonus * 1.5)); if (this.keywords.includes('Burn')) applyStatus('Burn', statusDuration + 1, 4 + Math.floor(upgradeStatusAmountBonus * 1.5)); if (this.keywords.includes('StrengthSelf') || this.keywords.includes('Strength')) applyStatus('Strength', 99, 1 + upgradeStatusAmountBonus, 'self'); if (this.keywords.includes('DexteritySelf') || this.keywords.includes('Dexterity')) applyStatus('Dexterity', 99, 1 + upgradeStatusAmountBonus, 'self'); if (this.keywords.includes('RegenSelf') || this.keywords.includes('Regen')) applyStatus('Regen', 3 + upgradeStatusDurationBonus, 2 + upgradeStatusAmountBonus, 'self'); if (this.keywords.includes('IntangibleSelf') || this.keywords.includes('Intangible')) applyStatus('Intangible', 1, 1, 'self');
        if (primaryElem === 'I' && scores.I >= 7 && !values.status.some(s => s.id === 'Vulnerable') && Math.random() < 0.3) { applyStatus('Vulnerable', statusDuration, baseStatusAmount); } if (primaryElem === 'P' && scores.P >= 7 && !values.status.some(s => s.id === 'Strength') && Math.random() < 0.3) { applyStatus('Strength', 99, 1 + upgradeStatusAmountBonus, 'self'); } if (primaryElem === 'S' && scores.S >= 8 && !values.status.some(s => s.id === 'Weak') && Math.random() < 0.3) { applyStatus('Weak', statusDuration, baseStatusAmount); }

        this._applySpecificCardLogic(conceptData, values, upgraded);
        for(const key in values) { if (typeof values[key] === 'number') values[key] = Math.max(0, Math.floor(values[key])); }
        if (values.damage > 0 && this.targetType === 'self') values.damage = 0; if (values.block > 0 && values.damage > 0 && !this.keywords.includes('AttackBlock')) values.damage = 0; if (values.heal > 0 && values.damage > 0) values.damage = 0;
        values.aoe = this.aoe;
        return values;
    }

    /** Apply logic specific to certain card IDs - (Keep existing _applySpecificCardLogic) */
    _applySpecificCardLogic(conceptData, values, upgraded) {
        // ... (Keep your extensive switch statement for card-specific overrides) ...
         const upgradeBonus = upgraded ? 2 : 0; const upgradeEffectBonus = upgraded ? Math.max(1, Math.floor(values.damage || values.block || values.heal || 3 / 1.5 + 2) * 0.3 + 1) : 0; const upgradeStatusDurationBonus = upgraded ? 1 : 0; const upgradeStatusAmountBonus = upgraded ? Math.ceil((this.elementScores[this.primaryElement] || 1) / 4) : 0;
         const setStatus = (id, dur, amt, target = 'enemy') => { values.status = [{ id: id, duration: dur, amount: amt, target: target }]; };
        switch (conceptData.id) {
            case 1: values.damage = upgraded ? 9 : 6; values.block = 0; values.status = []; break;
            case 2: values.damage = 0; values.block = upgraded ? 8 : 5; values.heal = upgraded ? 2 : 0; values.status = []; break;
            case 3: values.damage = upgraded ? 5 : 3; values.block = 0; setStatus('Weak', 1 + upgradeStatusDurationBonus, 1); break;
            // ... include ALL your existing cases here ...
             case 4: values.damage = 0; values.block = 0; values.status = []; values.meta.trigger = 'onPlayCardType_Interaction'; values.meta.effect = { applyStatus: { target: 'random_enemy', status: 'Vulnerable', amount: upgraded ? 2 : 1, duration: 1 }}; this.exhausts = true; break;
             case 5: values.damage = 0; values.block = 0; values.status = []; values.meta.trigger = 'onTakeUnblockedDamage'; values.meta.effect = { gainBlock: upgraded ? 5 : 3 }; this.exhausts = true; break;
             case 6: values.damage = 0; values.block = 0; values.status = []; values.meta.trigger = 'onTurnStart'; values.meta.effect = { applyStatusToSelf: [{ id: 'Strength', duration: 1, amount: upgraded? 2: 1 }, { id: 'Dexterity', duration: 1, amount: upgraded? 2: 1 }] }; this.exhausts = true; break;
             case 7: values.damage = upgraded ? 6 : 4; values.block = 0; values.status = upgraded ? [{ id: 'Vulnerable', duration: 1, target: 'enemy', amount: 1 }] : []; break;
             case 8: values.damage = upgraded ? 12 : 9; values.block = 0; values.status = upgraded ? [{ id: 'Weak', duration: 1, target: 'enemy', amount: 1 }] : []; break;
             case 9: values.damage = 0; values.block = 0; setStatus('Vulnerable', 1 + upgradeStatusDurationBonus, 1); values.focus = upgraded ? 1 : 0; break; // Added Focus upgrade
             case 10: values.damage = 0; values.block = upgraded ? 9 : 6; values.focus = upgraded ? 1 : 0; values.status = []; break; // Upgrade block more, add focus
             case 11: values.damage = 0; values.block = 0; values.status = []; values.meta.trigger = 'onTurnStart'; values.meta.effect = { gainFocus: upgraded ? 2 : 1, applyEffectToAttackCards: { damageBonus: 2} }; this.exhausts = true; break; // Buff self, maybe affect other cards
             // ... etc ...
        }
    }

    /** Stores upgrade calculations for both branches */
     _prepareUpgradeData(conceptData) {
         // Calculate Refine results (standard upgrade)
         const refineValues = this._calculateEffects(conceptData, true);
         let refineCost = this.cost;
         // --- Standard Cost Reduction Logic (Keep) ---
         if (refineCost !== null && refineCost > 0) {
             const baseValues = this.calculatedValues; let significantIncrease = false;
             if ((refineValues.damage > baseValues.damage + 3) || (refineValues.block > baseValues.block + 3) || (refineValues.heal > baseValues.heal + 2)) significantIncrease = true;
             if ((refineValues.draw > baseValues.draw) || (refineValues.focus > baseValues.focus)) significantIncrease = true;
             if (refineValues.status.length > baseValues.status.length) significantIncrease = true;
             else { significantIncrease = refineValues.status.some((upgStatus, i) => { const baseStatus = baseValues.status[i]; if (!baseStatus) return true; if (upgStatus.duration !== 99 && baseStatus.duration !== 99 && upgStatus.duration > baseStatus.duration) return true; if (upgStatus.amount > baseStatus.amount) return true; return false; }); }
             if (!significantIncrease) { refineCost = Math.max(0, refineCost - 1); }
         }
         // --- End Cost Reduction Logic ---

         // Calculate Transmute results (Example: Keep base values, add a keyword/minor effect)
         let transmuteValues = { ...this.calculatedValues }; // Start with BASE values
         let transmuteCost = this.cost; // Keep BASE cost initially
         let transmuteKeywords = [...this.keywords]; // Copy base keywords

         // --- Transmute Effect Logic (Example - Customize as needed!) ---
         // Generic Rule: Add "Draw 1" if not already drawing, otherwise add "Gain 2 Block".
         // Keep other base effects. Change Primary Element (handled in applyUpgrade).
         if (!transmuteValues.draw || transmuteValues.draw < 1) {
             transmuteValues.draw = (transmuteValues.draw || 0) + 1;
              if (!transmuteKeywords.includes('Draw')) transmuteKeywords.push('Draw');
              console.log(` -> Transmute added Draw 1`);
         } else {
             transmuteValues.block = (transmuteValues.block || 0) + 2; // Add block instead
              if (!transmuteKeywords.includes('Block')) transmuteKeywords.push('Block');
              console.log(` -> Transmute added Gain 2 Block`);
         }
         // Ensure 'Transmuted' keyword is added later in applyUpgrade if chosen
         // --- End Transmute Effect Logic ---

         return {
             refine: { values: refineValues, cost: refineCost, keywords: this.keywords /* Refine keeps base keywords usually*/ },
             transmute: { values: transmuteValues, cost: transmuteCost, keywords: transmuteKeywords /* Store potentially modified keywords*/ }
         };
     }


    /** Defines the function to execute the card's effect (Handles upgraded state) */
    _defineEffectExecution(conceptData) {
        if (['Status', 'Curse'].includes(conceptData.cardType) || this.keywords.includes('Unplayable')) {
            // ... (keep existing unplayable logic) ...
             return (player, target = null, enemies = []) => { console.warn(`Attempted to execute unplayable card: ${this.name}`); };
        }

        // Return the main execution function
        return (player, target = null, enemies = []) => {
            // Determine which set of values to use based on upgrade state and branch
            const values = this.upgraded
                ? this.upgradeData[this.upgradeBranch || 'refine']?.values // Default to refine if branch somehow unset
                : this.calculatedValues;

            if (!values) {
                 console.error(`Card Execution Error (${this.name}): Could not determine effect values for state (Upgraded: ${this.upgraded}, Branch: ${this.upgradeBranch}). Using base.`);
                 // Fallback to base values in case of error
                 const baseValues = this.calculatedValues;
                 if (!baseValues) { console.error("FATAL: Base values also missing for card:", this.name); return; }
                 this.executeEffectsWithValues(baseValues, player, target, enemies); // Execute with base values
                 return;
            }

            // Execute effects using the determined values
            this.executeEffectsWithValues(values, player, target, enemies);
        };
    }

    /** Helper function to apply effects using a specific 'values' object */
    executeEffectsWithValues(values, player, target = null, enemies = []) {
         const effectTarget = this.targetType === 'self' ? player : target;

         if (!player) { console.error(`Card Execution Error (${this.name}): Player reference missing.`); return; }
         // console.log(`Executing ${this.name} with values:`, values); // Debug log

         try {
             // Apply Status Effects
             values.status?.forEach(statusEffect => { /* ... Keep existing status application logic ... */
                let targetsToApply = [];
                if (statusEffect.target === 'self') targetsToApply.push(player);
                else if (statusEffect.target === 'all_enemies') targetsToApply = enemies?.filter(e => e && e.currentHp > 0) || [];
                else if (statusEffect.target === 'enemy') { if (this.aoe || values.aoe) { targetsToApply = enemies?.filter(e => e && e.currentHp > 0) || []; } else if (effectTarget && effectTarget !== player && effectTarget.currentHp > 0) { targetsToApply.push(effectTarget); } }
                if (targetsToApply.length > 0) { targetsToApply.forEach(t => t.applyStatus(statusEffect.id, statusEffect.duration || 1, statusEffect.amount || 1, this.primaryElement)); }
                else if (!['self', 'all_enemies'].includes(statusEffect.target)) { console.warn(`Status ${statusEffect.id} on ${this.name} had no valid target(s). TargetType: ${this.targetType}, AOE: ${this.aoe}`); }
             });
             // Deal Damage
             if (values.damage > 0) { /* ... Keep existing damage logic ... */
                const modifiedDamage = player.applyModifiers('damageDealt', values.damage);
                if (this.aoe || values.aoe) { enemies?.forEach(enemy => { if (enemy?.currentHp > 0) enemy.takeDamage(modifiedDamage, this.primaryElement); }); }
                else if (this.targetType === 'enemy' && effectTarget && effectTarget.currentHp > 0) { effectTarget.takeDamage(modifiedDamage, this.primaryElement); }
                else if (this.targetType === 'enemy') { console.warn(`Damage card ${this.name} requires a valid enemy target.`); }
             }
             // Apply Self Effects
             if (values.block > 0) player.gainBlock(values.block);
             if (values.heal > 0) player.heal(values.heal);
             if (values.draw > 0) player.drawCards(values.draw);
             if (values.focus > 0) player.gainFocus(values.focus);
             // Handle Meta Effects (if any defined for the chosen values)
             if (values.meta && Object.keys(values.meta).length > 0) {
                  console.warn(`Card ${this.name} has meta effects defined - implementation needed.`, values.meta);
                  // TODO: Add logic to handle meta effects (like applying ongoing buffs/triggers)
             }
         } catch (error) {
             console.error(`Error during effect execution for ${this.name} (ID: ${this.conceptId}):`, error, "Values:", values);
         }
    }

    /** Execute the card's defined effect */
    executeEffect(player, target = null, enemies = []) {
         if (typeof this.effectLogic === 'function') {
             this.effectLogic(player, target, enemies);
         } else {
             console.error(`Card ${this.name} has no defined effect logic!`);
         }
    }

    /**
     * Applies the chosen upgrade branch to the card instance.
     * @param {string} branch - 'refine' or 'transmute'.
     * @param {string | null} targetElement - The element key ('A', 'I', etc.) for transmutation, or null for refine.
     */
    applyUpgrade(branch, targetElement = null) {
        if (this.upgraded) { console.warn(`Card ${this.name} is already upgraded.`); return; }
        if (branch !== 'refine' && branch !== 'transmute') { console.error(`Invalid upgrade branch: ${branch}`); return; }
        if (branch === 'transmute' && !targetElement) { console.error("Transmute upgrade requires a targetElement."); return; }

        let chosenUpgradeData = this.upgradeData[branch];
        if (!chosenUpgradeData) {
             console.error(`Upgrade data for branch '${branch}' not found for card ${this.name}.`);
             // Fallback: Apply refine data if transmute is missing? Or just fail? Fail for now.
             return;
        }

        console.log(`Applying ${branch} upgrade to ${this.name}...`);

        // Apply cost change
        if (chosenUpgradeData.cost !== undefined && chosenUpgradeData.cost < (this.cost ?? 99)) {
            this.cost = chosenUpgradeData.cost;
        }

        // Apply keyword changes (merge/replace as needed - simple replace for now)
        if (chosenUpgradeData.keywords) {
             this.keywords = [...chosenUpgradeData.keywords]; // Use keywords from upgrade data
        }

        // Handle branch-specific changes
        if (branch === 'refine') {
            if (!this.name.endsWith('+')) this.name += "+";
             // Ensure standard upgrade keywords are present if needed by effects
             if (chosenUpgradeData.values?.draw > this.calculatedValues.draw && !this.keywords.includes('Draw')) this.keywords.push('Draw');
             // Add other keyword checks based on refined values if necessary
        } else { // Transmute
            this.primaryElement = targetElement;
            if (!this.name.includes('*')) this.name += "*"; // Mark as transmuted differently
            if (!this.keywords.includes('Transmuted')) this.keywords.push('Transmuted'); // Add specific keyword
             // Recalculate targeting/AOE based on new keywords/element? Or keep base? Keep base for simplicity now.
        }

        // Mark as upgraded and store the chosen branch
        this.upgraded = true;
        this.upgradeBranch = branch;

        // Re-add core inherent keywords like Exhaust/Ethereal if they weren't included in upgrade data
        if (this._determineExhaust(Data.concepts.find(c=>c.id === this.conceptId)) && !this.keywords.includes('Exhaust')) this.keywords.push('Exhaust');
        if (this._determineEthereal(Data.concepts.find(c=>c.id === this.conceptId)) && !this.keywords.includes('Ethereal')) this.keywords.push('Ethereal');


        console.log(` > Upgrade Applied. Name: ${this.name}, Cost: ${this.cost === null ? 'X' : this.cost}, Element: ${this.primaryElement}, Branch: ${this.upgradeBranch}`);
        // Note: effectLogic function automatically uses the correct values based on this.upgraded and this.upgradeBranch
    }


    // --- Display Methods ---

    /** Generate HTML description of effects based on current state */
    getEffectDescriptionHtml() {
        const values = this.upgraded
            ? this.upgradeData[this.upgradeBranch || 'refine']?.values // Default to refine if branch somehow unset
            : this.calculatedValues;

        if (!values) {
            console.warn(`Card ${this.name} missing calculated values for state (Upgraded: ${this.upgraded}, Branch: ${this.upgradeBranch}). Using base description.`);
            return this.baseEffectDescription || "Error displaying effect.";
        }

        let parts = [];
        // Build description parts based on the 'values' object...
        if (values.damage > 0) parts.push(`Deal ${values.damage} damage${(this.aoe || values.aoe) ? ' to ALL enemies' : ''}.`);
        if (values.block > 0) parts.push(`Gain ${values.block} Block.`);
        if (values.heal > 0) parts.push(`Heal ${values.heal}.`);
        values.status?.forEach(s => {
            let targetText = ""; let valueText = "";
            if (s.target === 'self') targetText = " self";
            else if (s.target === 'all_enemies' || ((this.aoe || values.aoe) && s.target === 'enemy')) targetText = " ALL enemies";
            else targetText = " enemy";
            const isStacking = ['Strength', 'Dexterity', 'Poison', 'Regen', 'Burn', 'Metallicize', 'Thorns', 'Entangle', 'ProtocolActive'].includes(s.id);
            if (isStacking && s.amount > 1) valueText = `${s.amount} `;
            else if (!isStacking && s.duration > 1 && s.duration !== 99) valueText = `(${s.duration}) `;
            parts.push(`Apply ${valueText}${s.id}${targetText}.`);
        });
        if (values.draw > 0) parts.push(`Draw ${values.draw} card${values.draw > 1 ? 's' : ''}.`);
        if (values.focus > 0) parts.push(`Gain ${values.focus} Focus.`);

        // Add keywords to description, filter out internal/obvious ones
        const displayKeywords = (this.upgraded ? this.keywords : this.calculatedValues.keywords || this.keywords) // Use current keywords
                                  .filter(k => !['Unplayable', 'Simple', 'Attack', 'Skill', 'Power', 'Transmuted'].includes(k));
        if (displayKeywords.length > 0) {
             // Capitalize first letter of each keyword for display
             parts.push(displayKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join('. ') + '.');
        }


        // Fallback / Unplayable text
        if (parts.length === 0 && !this.keywords.includes('Unplayable')) {
             parts.push(this.baseEffectDescription || "No effect described.");
        } else if (this.keywords.includes('Unplayable')) {
             parts.push("Unplayable.");
        }

        // Add Transmuted suffix
        if (this.upgradeBranch === 'transmute') {
             parts.push("(Transmuted)");
        }

        return parts.join(' ').trim();
    }

    /** Generate HTML for tooltip display */
    getTooltipHtml() {
         let html = `<div class="card-tooltip">`;
         const costDisplay = this.cost === null ? 'X' : this.cost;
         // Add branch indicator to name in tooltip if upgraded
         const displayName = this.upgraded ? `${this.name}` : this.name; // Name already includes + or * from applyUpgrade
         html += `<div class="tooltip-header"><strong>${displayName} (${costDisplay} <i class="fa-solid fa-bolt" style="color: #f1c40f;"></i>)</strong></div>`;
         html += `<div class="tooltip-type"><em>${this.cardType || 'Unknown Type'} - ${this.rarity || 'common'} ${this.primaryElement ? '- ' + Data.elementKeyToFullName[this.primaryElement] : ''}</em></div><hr>`;
         html += `<div class="tooltip-description">${this.getEffectDescriptionHtml()}</div>`;

         // Add detailed description if different
         const effectDesc = this.getEffectDescriptionHtml().replace(/\.\s*$/, "").replace(" (Transmuted)",""); // Remove markers for comparison
         const detailDesc = (this.detailedDescription || "").replace(/\.\s*$/, "");
         if (this.detailedDescription && detailDesc !== effectDesc && detailDesc !== (this.baseEffectDescription || "").replace(/\.\s*$/, "")) {
             html += `<hr><div class="tooltip-detail-desc"><i>${this.detailedDescription}</i></div>`;
         }

         // Add lore
         if (this.lore && this.lore.length > 0) { /* ... Keep existing lore display ... */
             let highestUnlockedLore = null;
             for (let i = this.lore.length - 1; i >= 0; i--) { if (this.lore[i].unlocked) { highestUnlockedLore = this.lore[i]; break; } }
             if(highestUnlockedLore) { html += `<hr><div class="tooltip-lore"><b>Lore Lvl ${highestUnlockedLore.level}:</b> <i>${highestUnlockedLore.text}</i></div>`; }
         }
         html += `</div>`;
         return html;
     }

    /** (Optional/NEW) Generate description for upgrade previews */
    getUpgradePreviewHtml(branch) {
        if (!this.upgradeData || !this.upgradeData[branch]) {
            return "Upgrade data unavailable.";
        }
        const data = this.upgradeData[branch];
        const values = data.values;
        const cost = data.cost;
        const currentCost = this.cost;

        let parts = [];
         // Build description parts similar to getEffectDescriptionHtml, but using the *preview* values
        if (values.damage > 0) parts.push(`Deal ${values.damage} damage${(this.aoe || values.aoe) ? ' to ALL enemies' : ''}.`);
        if (values.block > 0) parts.push(`Gain ${values.block} Block.`);
        if (values.heal > 0) parts.push(`Heal ${values.heal}.`);
        values.status?.forEach(s => { /* ... build status string ... */
            let targetText = ""; let valueText = "";
            if (s.target === 'self') targetText = " self"; else if (s.target === 'all_enemies' || ((this.aoe || values.aoe) && s.target === 'enemy')) targetText = " ALL enemies"; else targetText = " enemy";
            const isStacking = ['Strength', 'Dexterity', 'Poison', 'Regen', 'Burn', 'Metallicize', 'Thorns', 'Entangle', 'ProtocolActive'].includes(s.id); if (isStacking && s.amount > 1) valueText = `${s.amount} `; else if (!isStacking && s.duration > 1 && s.duration !== 99) valueText = `(${s.duration}) `;
            parts.push(`Apply ${valueText}${s.id}${targetText}.`);
         });
        if (values.draw > 0) parts.push(`Draw ${values.draw} card${values.draw > 1 ? 's' : ''}.`);
        if (values.focus > 0) parts.push(`Gain ${values.focus} Focus.`);

        let preview = parts.join(' ').trim();
         if (!preview) preview = "Effect remains similar."; // Fallback

        // Add cost change information
        if (cost !== null && cost < (currentCost ?? 99)) {
            preview += ` (Cost: ${currentCost} -> ${cost})`;
        } else if (cost !== null && cost !== currentCost) {
             preview += ` (Cost: ${cost})`; // Show cost if it changes but doesn't decrease
        } else {
             preview += ` (Cost: ${currentCost ?? 'X'})`; // Show current cost if unchanged
        }


        // Add branch specific info
        if (branch === 'transmute') {
             // Ideally, calculate the target element here based on player state if possible, or state generically
             preview += `<br><i>Element changes based on lowest attunement. Keywords may change.</i>`;
        } else {
              preview += `<br><i>Refines existing effects.</i>`;
        }

        return preview;
    }

} // End Card Class
