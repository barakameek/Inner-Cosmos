// js/core/Card.js

// Import Data - Need access to the concept details
import * as Data from '../data.js';

// --- Constants ---
// Map card types to potential base functionalities (can be refined)
const CARD_TYPE_FUNCTION_MAP = {
    "Practice/Kink": "Skill/Attack", // Often direct actions
    "Identity/Role": "Power/Stance", // Often persistent effects or transformations
    "Psychological/Goal": "Power/Effect", // Can be buffs, debuffs, unique mechanics
    "Relationship Style": "Multi-Target/Support", // Might affect multiple enemies or player stats
    "Orientation": "Triggered/Passive", // Might modify other cards or react to game state
    "Interaction": "Skill/Effect", // Added type based on some concepts like Flirting
    "Cognitive": "Skill/Utility" // Added type based on some concepts like Fantasy Immersion
};

/**
 * Represents a single playable card during a run.
 */
export class Card {
    constructor(conceptId) {
        const conceptData = Data.concepts.find(c => c.id === conceptId);
        if (!conceptData) {
            console.error(`Card Error: Concept data not found for ID: ${conceptId}`);
            // Handle error appropriately - maybe create a default 'Error Card'?
            this.id = -1;
            this.conceptId = -1;
            this.name = "Error Card";
            this.rarity = 'common'; // Or a special rarity
            this.cardType = "Error";
            this.cost = 0;
            this.baseEffectDescription = "Something went wrong.";
            this.elementScores = {};
            this.keywords = [];
            this.upgraded = false;
            // Add flags for targeting etc.
            this.requiresTarget = false;
            this.targetType = null; // 'enemy', 'self'
            this.aoe = false; // Area of Effect?
            this.exhausts = false; // Exhausts after use?
            this.isEthereal = false; // Discarded if not played? (Slay the Spire term)
            return;
        }

        this.id = `card_${conceptId}_${Date.now()}_${Math.random()}`; // Unique ID for this instance
        this.conceptId = conceptId;
        this.name = conceptData.name;
        this.rarity = conceptData.rarity || 'common';
        this.cardType = conceptData.cardType; // e.g., "Practice/Kink"
        this.visualHandle = conceptData.visualHandle; // For card art
        this.primaryElement = conceptData.primaryElement;
        this.elementScores = { ...(conceptData.elementScores || {}) }; // Copy scores
        this.keywords = [...(conceptData.keywords || [])]; // Copy keywords

        // --- Dynamic properties based on concept data (examples - NEEDS HEAVY REFINEMENT) ---
        // Cost: Could be based on average score, specific scores, or manually set
        this.cost = this.determineCost(conceptData);

        // Effect Description: Start with brief, upgrade to detailed? Or use logic
        this.baseEffectDescription = conceptData.briefDescription; // For display
        this.detailedDescription = conceptData.detailedDescription; // More info for tooltips/upgrades

        // Determine basic flags based on type/scores (examples)
        this.requiresTarget = this.determineTargeting(conceptData);
        this.targetType = this.requiresTarget ? 'enemy' : null; // Default to enemy if targeting needed
        this.exhausts = this.determineExhaust(conceptData);

        // Upgrade status
        this.upgraded = false;
        this.upgradeData = this.prepareUpgradeData(conceptData); // Store potential upgrade effects

        // --- Add Lore ---
        // Store lore for potential upgrade paths or flavor text
        this.lore = conceptData.lore ? [...conceptData.lore] : [];

        // Placeholder for specific effect execution logic
        this.effectLogic = this.defineEffectLogic(conceptData);
    }

    // --- Methods ---

    /**
     * Determine the card's energy cost based on its data.
     * This is a placeholder and needs significant tuning.
     */
    determineCost(conceptData) {
        // Example logic: Higher average score = higher cost? Specific elements? Rarity?
        const scores = Object.values(conceptData.elementScores || {});
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 5;

        if (this.rarity === 'rare') return Math.max(1, Math.min(3, Math.round(avgScore / 3)));
        if (this.rarity === 'uncommon') return Math.max(1, Math.min(3, Math.round(avgScore / 3.5)));
        return Math.max(0, Math.min(2, Math.round(avgScore / 4))); // Common cards cheaper
        // Could return 0 for passive/power cards often
    }

    /**
     * Determine if the card needs a target.
     * Placeholder logic.
     */
    determineTargeting(conceptData) {
        // Example: High Interaction/Sensory often implies acting ON something/someone
        if ((conceptData.elementScores?.I || 0) >= 7 || (conceptData.elementScores?.S || 0) >= 7) {
             // Exceptions: Maybe self-buffs with high S?
             if (conceptData.cardType === "Practice/Kink" && !this.name.includes("Focus")) { // Crude check
                 return true;
             }
        }
        // Example: Command/Control almost always needs target
        if (conceptData.keywords?.includes('Control') || conceptData.keywords?.includes('Command')) return true;
        // Example: Impact Play needs target
        if (conceptData.keywords?.includes('Impact')) return true;

        return false; // Default to no target needed
    }

    /**
     * Determine if the card should exhaust after use.
     * Placeholder logic.
     */
     determineExhaust(conceptData) {
        // Example: Very high impact effects, powerful setups, maybe rare cards?
        if (this.rarity === 'rare' && this.cost >= 2) return true; // Arbitrary example
        if (conceptData.cardType === "Identity/Role") return true; // Powers often exhaust
        if (this.name.includes("Ritual")) return true; // Rituals might be one-offs
        return false;
    }

    /**
     * Placeholder for defining the specific effect logic based on concept data.
     * This is the core of card functionality and requires the most work.
     */
    defineEffectLogic(conceptData) {
        // --- THIS IS WHERE THE MAGIC HAPPENS ---
        // We need to translate conceptData (scores, keywords, type, name)
        // into concrete game actions (deal damage, gain block, apply status, etc.)

        // Example Structure:
        return (player, target = null, enemies = []) => { // Pass player, optional target, and all enemies
            console.log(`Executing effect for: ${this.name}`);

            let baseDamage = 0;
            let baseBlock = 0;
            let statusToApply = null;
            let statusDuration = 1;
            let drawAmount = 0;

            // --- Example Logic based on Keywords/Scores/Type ---

            // Interaction-based (Control, Buffs, Debuffs)
            if (this.primaryElement === 'I' || (this.elementScores?.I || 0) >= 6) {
                if (this.keywords.includes('Control') || this.keywords.includes('Command')) {
                    statusToApply = 'Weak'; // Apply Weak status
                    statusDuration = this.upgraded ? 2 : 1;
                    console.log(`Applying ${statusToApply} for ${statusDuration} turns`);
                } else if (this.keywords.includes('Guidance') || this.keywords.includes('Nurturing')) {
                     player.gainFocus(this.upgraded ? 2 : 1); // Grant Focus
                     console.log(`Gaining ${this.upgraded ? 2 : 1} Focus`);
                }
            }

            // Sensory-based (Damage, Block, Intense Effects)
            if (this.primaryElement === 'S' || (this.elementScores?.S || 0) >= 6) {
                 // Simple damage scaling based on Sensory score
                 baseDamage = Math.max(1, Math.floor((this.elementScores?.S || 0) * (this.upgraded ? 1.5 : 1)));
                 // If it's Impact Play
                 if (this.keywords.includes('Impact')) {
                     baseDamage += this.upgraded ? 4 : 2; // Bonus impact damage
                 }
                 // If it's defensive touch
                 if (this.keywords.includes('Comfort') || this.keywords.includes('Gentle')) {
                     baseBlock = Math.max(1, Math.floor((this.elementScores?.S || 0) * (this.upgraded ? 1.2 : 0.8)));
                     baseDamage = 0; // Comfort doesn't usually deal damage
                 }
            }

            // Psychological-based (Healing, Resilience, Emotional Effects)
            if (this.primaryElement === 'P' || (this.elementScores?.P || 0) >= 6) {
                if (this.keywords.includes('Connection') || this.keywords.includes('Intimacy')) {
                    player.heal(this.upgraded ? 5 : 3);
                }
                if (this.keywords.includes('Validation') || this.keywords.includes('Comfort')) {
                    player.gainBlock(this.upgraded ? 6 : 4);
                }
                 if (this.keywords.includes('Humiliation') && target) { // Needs target
                     // Apply Vulnerable maybe?
                     statusToApply = 'Vulnerable';
                     statusDuration = this.upgraded ? 2 : 1;
                 }
            }

             // Cognitive-based (Card Draw, Focus Gain, Planning)
             if (this.primaryElement === 'C' || (this.elementScores?.C || 0) >= 6) {
                 if (this.keywords.includes('Fantasy') || this.keywords.includes('Mind')) {
                    drawAmount = this.upgraded ? 2 : 1;
                 } else if (this.keywords.includes('Banter')) {
                     // Maybe apply a small debuff AND draw a card?
                     statusToApply = 'Distracted'; // Custom status example
                     statusDuration = 1;
                     drawAmount = 1;
                 }
             }

             // Relational-based (Affecting multiple targets?)
             if (this.primaryElement === 'R' || (this.elementScores?.R || 0) >= 6) {
                  if (this.keywords.includes('Group') || this.keywords.includes('Multiple Partners')) {
                     // Example: Apply weak to ALL enemies
                     if (this.upgraded){
                         enemies.forEach(enemy => enemy.applyStatus('Weak', 1)); // Need Enemy class method
                         console.log("Applying Weak to all enemies");
                     } else {
                          baseDamage = Math.floor((this.elementScores?.R || 0) * 0.5); // Small AOE damage
                          this.aoe = true; // Mark as AOE for targeting logic
                          console.log(`Dealing ${baseDamage} AOE damage`);
                     }
                 }
             }

            // --- Apply Calculated Effects ---
            // Apply status first
            if (statusToApply && target) {
                // TODO: Replace with target.applyStatus(statusToApply, statusDuration);
                console.log(`Placeholder: Applying ${statusToApply} to ${target.id} for ${statusDuration} turns.`);
            } else if (statusToApply) { // Self-applied status
                player.applyStatus(statusToApply, statusDuration);
                 console.log(`Placeholder: Applying ${statusToApply} to self for ${statusDuration} turns.`);
            }

            // Deal Damage
            if (baseDamage > 0) {
                 const modifiedDamage = player.applyModifiers('damageDealt', baseDamage);
                 if (this.aoe && enemies) {
                    enemies.forEach(enemy => {
                        // TODO: Replace with enemy.takeDamage(modifiedDamage);
                        console.log(`Placeholder: Dealing ${modifiedDamage} damage to enemy ${enemy.id}`);
                    });
                 } else if (target) {
                    // TODO: Replace with target.takeDamage(modifiedDamage);
                    console.log(`Placeholder: Dealing ${modifiedDamage} damage to ${target.id}`);
                 } else if (this.requiresTarget) {
                     console.warn(`Card ${this.name} requires a target, but none provided.`);
                 }
            }

            // Gain Block
            if (baseBlock > 0) {
                player.gainBlock(baseBlock);
            }

            // Draw Cards
            if (drawAmount > 0) {
                 player.drawCards(drawAmount);
            }

            // --- Special Card Logic ---
            // Example: Specific logic for 'High Protocol D/s' might apply a persistent 'Protocol Active' power
            if (this.conceptId === 30) { // High Protocol D/s
                player.applyStatus('ProtocolActive', 99); // Apply a long-duration status/power
            }
        };
    }

    /**
     * Executes the card's defined effect logic.
     */
    executeEffect(player, target = null, enemies = []) {
        if (typeof this.effectLogic === 'function') {
            this.effectLogic(player, target, enemies);
        } else {
            console.error(`Card ${this.name} has no defined effect logic!`);
        }
    }

    /**
     * Prepares the data needed for upgrading the card.
     * Returns an object describing the changes.
     */
     prepareUpgradeData(conceptData) {
         // Example: Based on lore level 2 text? Or generic improvements?
         const upgradeEffects = {};
         // Generic examples:
         if (this.cost > 0) upgradeEffects.cost = this.cost - 1;
         if (this.determineCost(conceptData, true) < this.cost) upgradeEffects.cost = this.determineCost(conceptData, true); // Recalculate cost if upgrade changes stats significantly
         upgradeEffects.description = `[UPGRADED] ${this.detailedDescription || this.baseEffectDescription}`; // Placeholder description update
         upgradeEffects.damageIncrease = Math.ceil((this.elementScores?.S || 0) * 0.5) || 2; // Increase damage
         upgradeEffects.blockIncrease = Math.ceil((this.elementScores?.S || 0) * 0.3) || 2; // Increase block
         if (this.keywords.includes('Control') || this.keywords.includes('Vulnerable')) upgradeEffects.statusDurationIncrease = 1; // Increase debuff duration
         if (this.keywords.includes('Fantasy') || this.keywords.includes('Mind')) upgradeEffects.drawIncrease = 1; // Draw more cards

         // TODO: More sophisticated upgrade logic based on card type, keywords, lore?
         return upgradeEffects;
     }


    /**
     * Applies the upgrade effects to the card instance.
     */
    upgrade() {
        if (this.upgraded) return; // Already upgraded

        console.log(`Upgrading card: ${this.name}`);
        this.upgraded = true;
        this.name += "+"; // Common convention

        // Apply changes from upgradeData
        // This requires the effectLogic to check this.upgraded status
        if (this.upgradeData.cost !== undefined && this.upgradeData.cost < this.cost) {
            this.cost = this.upgradeData.cost;
        }
        // Note: The actual *effect changes* happen within defineEffectLogic
        // by checking the `this.upgraded` flag. We don't rewrite the function here,
        // but ensure the logic inside it handles the upgraded state.

        console.log(`Card ${this.name} upgraded. New cost: ${this.cost}`);
    }

    // --- Display Methods (Examples) ---
    getTooltipHtml() {
        let html = `<strong>${this.name} (${this.cost} Focus)</strong><br>`;
        html += `<em>${this.cardType} - ${this.rarity}</em><hr>`;
        // TODO: Generate dynamic description based on effectLogic and upgrade status
        html += `${this.getEffectDescriptionHtml()}<br>`; // Use a helper
        if (this.keywords.length > 0) {
            html += `<br>Keywords: ${this.keywords.join(', ')}`;
        }
         if (this.exhausts) html += `<br><em>Exhausts.</em>`;
        return html;
    }

    getEffectDescriptionHtml() {
        // This needs to dynamically generate the description based on calculated effects
        // and whether the card is upgraded. Very complex to do accurately without
        // a fully defined effect system. Using placeholders for now.
        let desc = this.upgraded ? this.upgradeData.description : this.baseEffectDescription;
        // Try to insert calculated values (VERY simplified example)
         if (this.elementScores.S >=6 && !this.keywords.includes('Comfort')) {
             let dmg = Math.max(1, Math.floor((this.elementScores?.S || 0) * (this.upgraded ? 1.5 : 1)));
             if (this.keywords.includes('Impact')) dmg += this.upgraded ? 4 : 2;
             desc += ` (Deals ~${dmg} damage)`;
         }
         if (this.elementScores.S >=6 && this.keywords.includes('Comfort')) {
             let blk = Math.max(1, Math.floor((this.elementScores?.S || 0) * (this.upgraded ? 1.2 : 0.8)));
             desc += ` (Gains ~${blk} block)`;
         }
        return desc;
    }

}
