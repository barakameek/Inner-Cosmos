// js/meta/MetaProgression.js

import * as Data from '../data.js';
// Import artifact definitions to potentially unlock specific ones via milestones
import { ARTIFACT_TEMPLATES } from '../core/ArtifactDefinitions.js';

// --- Constants ---
const SAVE_KEY = 'personaLabyrinth_metaProgress_v1.1'; // Increment version if structure changes significantly
const MAX_ASCENSION = 10; // Example max difficulty

/**
 * Manages persistent player progress between runs.
 */
export class MetaProgression {
    constructor() {
        this.totalInsight = 0;
        this.unlockedConceptIds = new Set();
        this.unlockedArtifactIds = new Set();
        this.completedMilestoneIds = new Set();
        // Structure for permanent upgrades - values are the *bonus* amount
        this.permanentUpgrades = {
             maxIntegrityBonus: 0,
             startingFocusBonus: 0, // Flat bonus to starting focus
             focusSlotsBonus: 0, // Bonus slots (affects max focus calculation)
             startingInsightBonus: 0,
             cardRewardChoicesBonus: 0, // e.g., +1 card choice
             // Attunement bonuses stored separately for clarity
             attunementBonus: { // Store bonuses per element
                Attraction: 0, Interaction: 0, Sensory: 0, Psychological: 0,
                Cognitive: 0, Relational: 0, RoleFocus: 0, All: 0 // 'All' applies to each individually
            }
             // Add other potential upgrades: starting artifact slot, shop discounts?
        };
        this.currentAscension = 0;
        this.highestAscensionBeat = -1; // Track highest level actually won

        // Runtime tracking (not saved)
        this.milestoneProgress = {}; // { milestoneId: currentCount }

        this.load();
        this._initializeDefaultUnlocks();

        console.log("MetaProgression initialized.");
    }

    _initializeDefaultUnlocks() {
        let changed = false;
        if (this.unlockedConceptIds.size === 0) {
            console.log("Performing first-time default concept unlocks...");
            Data.concepts.forEach(concept => {
                if (concept.rarity === 'common') {
                    this.unlockedConceptIds.add(concept.id);
                    changed = true;
                }
            });
             // Unlock a few specific interesting uncommons?
            const idsToUnlock = [2, 4, 5, 15]; // Sensual Touch, Dom, Sub, Deep Intimacy
             idsToUnlock.forEach(id => {
                if(Data.concepts.find(c=>c.id===id)) { // Check exists
                    this.unlockedConceptIds.add(id);
                    changed = true;
                }
             });
             console.log(`Unlocked ${this.unlockedConceptIds.size} default concepts.`);
        }

         if (this.unlockedArtifactIds.size === 0) {
             console.log("Performing first-time default artifact unlocks...");
             if (ARTIFACT_TEMPLATES['insight_fragment_a']) {
                  this.unlockedArtifactIds.add('insight_fragment_a');
                   console.log("Unlocked default artifact: Fragment of Attraction");
                  changed = true;
             }
              // Maybe unlock another basic one?
              // if (ARTIFACT_TEMPLATES['resonant_echo_s']) {
              //    this.unlockedArtifactIds.add('resonant_echo_s');
              //    changed = true;
              // }
         }
         if (changed) this.save(); // Save only if changes were made
    }

    load() {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                this.totalInsight = parsedData.totalInsight || 0;
                this.unlockedConceptIds = new Set(parsedData.unlockedConceptIds || []);
                this.unlockedArtifactIds = new Set(parsedData.unlockedArtifactIds || []);
                this.completedMilestoneIds = new Set(parsedData.completedMilestoneIds || []);
                // Deep merge permanent upgrades to handle potentially new keys in future versions
                this.permanentUpgrades = this._mergeDeep(this.getDefaultUpgrades(), parsedData.permanentUpgrades || {});
                this.currentAscension = parsedData.currentAscension || 0;
                this.highestAscensionBeat = parsedData.highestAscensionBeat || -1;

                console.log("MetaProgression loaded successfully.");
            } catch (error) {
                console.error("Failed to parse saved meta progression:", error);
                // Consider backing up corrupted data before removing
                // localStorage.setItem(SAVE_KEY + '_backup_' + Date.now(), savedData);
                // localStorage.removeItem(SAVE_KEY);
                 // Reset to defaults after failed load
                 Object.assign(this, new MetaProgression()); // Reinitialize might be risky, manual reset better
                 this.permanentUpgrades = this.getDefaultUpgrades(); // Reset upgrades explicitly
                 this._initializeDefaultUnlocks();

            }
        } else {
            console.log("No saved meta progression found. Initializing defaults.");
             this.permanentUpgrades = this.getDefaultUpgrades(); // Ensure defaults on fresh start
             this._initializeDefaultUnlocks();
        }
    }

    /** Helper for merging nested objects during load */
    _mergeDeep(target, source) {
        const isObject = (obj) => obj && typeof obj === 'object' && !Array.isArray(obj);
        Object.keys(source).forEach(key => {
            const targetValue = target[key];
            const sourceValue = source[key];
            if (isObject(targetValue) && isObject(sourceValue)) {
                this._mergeDeep(targetValue, sourceValue);
            } else {
                target[key] = sourceValue; // Overwrite or add source value
            }
        });
        return target;
     }

    /** Returns the default structure for permanent upgrades */
    getDefaultUpgrades() {
         return {
             maxIntegrityBonus: 0, startingFocusBonus: 0, focusSlotsBonus: 0,
             startingInsightBonus: 0, cardRewardChoicesBonus: 0,
             attunementBonus: { Attraction: 0, Interaction: 0, Sensory: 0, Psychological: 0, Cognitive: 0, Relational: 0, RoleFocus: 0, All: 0 }
         };
     }

    save() {
        try {
            const dataToSave = {
                totalInsight: this.totalInsight,
                unlockedConceptIds: Array.from(this.unlockedConceptIds),
                unlockedArtifactIds: Array.from(this.unlockedArtifactIds),
                completedMilestoneIds: Array.from(this.completedMilestoneIds),
                permanentUpgrades: this.permanentUpgrades, // Save the nested structure
                currentAscension: this.currentAscension,
                highestAscensionBeat: this.highestAscensionBeat,
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
            // console.log("MetaProgression saved."); // Can be noisy
        } catch (error) {
            console.error("Failed to save meta progression:", error);
            // Consider notifying the user
        }
    }

    // Keep resetProgress, addInsight, spendInsight...
     resetProgress() { /* ... keep, ensure it calls getDefaultUpgrades and saves */
         console.warn("Resetting all meta progression!");
        this.totalInsight = 0;
        this.unlockedConceptIds = new Set();
        this.unlockedArtifactIds = new Set();
        this.completedMilestoneIds = new Set();
        this.permanentUpgrades = this.getDefaultUpgrades(); // Reset to defaults
        this.currentAscension = 0;
         this.highestAscensionBeat = -1;
        this.milestoneProgress = {};
        localStorage.removeItem(SAVE_KEY);
        this._initializeDefaultUnlocks();
        this.save();
        console.log("Meta progression has been reset.");
     }
     addInsight(amount) { /* ... keep, ensures save() is called ... */
         if (amount > 0) {
            this.totalInsight += amount;
            console.log(`Added ${amount} Insight. Total: ${this.totalInsight}`);
             this.checkMilestonesOnInsightChange();
             this.save(); // Save after potentially completing milestones too
        }
     }
     spendInsight(amount) { /* ... keep, ensures save() is called ... */
        if (amount > 0 && this.totalInsight >= amount) {
            this.totalInsight -= amount;
            console.log(`Spent ${amount} Insight. Remaining: ${this.totalInsight}`);
            this.save();
            return true;
        }
        console.log(`Failed to spend ${amount} Insight. Have: ${this.totalInsight}`);
        return false;
     }


    // Keep unlockConcept, unlockArtifact, isUnlocked methods...
     unlockConcept(conceptId) { /* ... keep, ensures save() is called ... */
        if (!this.unlockedConceptIds.has(conceptId)) {
            // Check if concept ID is valid? Optional.
             const conceptExists = Data.concepts.some(c => c.id === conceptId);
             if (!conceptExists) {
                console.warn(`Attempted to unlock non-existent concept ID: ${conceptId}`);
                return false;
             }
            this.unlockedConceptIds.add(conceptId);
            console.log(`Unlocked Concept ID: ${conceptId}`);
            this.save();
            return true;
        }
        return false;
     }
     unlockArtifact(artifactId) { /* ... keep, ensures save() is called ... */
        if (!this.unlockedArtifactIds.has(artifactId)) {
             // Check if artifact ID is valid
             if (!ARTIFACT_TEMPLATES[artifactId]) {
                  console.warn(`Attempted to unlock non-existent artifact ID: ${artifactId}`);
                 return false;
             }
            this.unlockedArtifactIds.add(artifactId);
            console.log(`Unlocked Artifact ID: ${artifactId}`);
            this.save();
            return true;
        }
        return false;
     }
     isConceptUnlocked(conceptId) { /* ... keep ... */ return this.unlockedConceptIds.has(conceptId); }
     isArtifactUnlocked(artifactId) { /* ... keep ... */ return this.unlockedArtifactIds.has(artifactId); }
     getUnlockedConcepts() { /* ... keep ... */ return Array.from(this.unlockedConceptIds); }
     getUnlockedArtifacts() { /* ... keep ... */ return Array.from(this.unlockedArtifactIds); }

    // --- Milestones ---

    // Refine updateMilestoneProgress for clarity
    updateMilestoneProgress(actionName, count = 1, context = null) {
        // console.log(`Tracking milestone action: ${actionName}, Count: ${count}, Context:`, context); // Can be noisy
        let milestoneCompleted = false; // Flag to save only once if multiple complete

         Data.milestones.forEach(milestone => {
             if (this.completedMilestoneIds.has(milestone.id)) return;

             if (milestone.track.action === actionName) {
                 const progressKey = `${milestone.id}_actionCount`;
                 const currentCount = (this.milestoneProgress[progressKey] || 0) + count;
                 this.milestoneProgress[progressKey] = currentCount; // Update runtime progress

                 // console.log(`   Milestone ${milestone.id} progress: ${currentCount} / ${milestone.track.threshold}`);

                 if (currentCount >= milestone.track.threshold) {
                      // Perform context check
                      if (this._checkMilestoneContext(milestone.track, context)) {
                          if (this.completeMilestone(milestone)) {
                              milestoneCompleted = true;
                          }
                      }
                 }
             }
         });
         if (milestoneCompleted) this.save(); // Save if any action milestone completed
    }

    /** Helper to check context conditions for milestones */
     _checkMilestoneContext(trackData, context) {
         if (!trackData.condition) return true; // No specific condition to check

         switch(trackData.condition) {
             case 'level3': // Specific check for lore level 3
                 return context?.level === 3;
             case 'anyLevel': // Requires some level context exists
                  return context?.level !== undefined && context?.level !== null;
             case 'microStory': // Requires context indicating microStory unlock
                  return context?.unlockType === 'microStory';
             // Add more conditions as needed based on milestone definitions
             default:
                 console.warn("Unhandled milestone context condition:", trackData.condition);
                 return true; // Default to true if condition isn't understood? Or false?
         }
     }


    // Refine checkStateBasedMilestones
    checkStateBasedMilestones(currentGameState = null) {
         // console.log("Checking state-based milestones..."); // Can be noisy
         let milestoneCompleted = false;
         const player = currentGameState?.player;

         Data.milestones.forEach(milestone => {
             if (this.completedMilestoneIds.has(milestone.id) || !milestone.track.state) return;

             let conditionMet = false;
             const stateKey = milestone.track.state;
             const threshold = milestone.track.threshold;

             try {
                 switch(stateKey) {
                     case 'discoveredConcepts.size':
                         conditionMet = this.unlockedConceptIds.size >= threshold;
                         break;
                     case 'focusedConcepts.size':
                          // Needs player object from current run
                          if (player && player.focusedConcepts) { // Assuming player tracks focused concepts
                              conditionMet = player.focusedConcepts.length >= threshold;
                          }
                          break;
                     case 'elementAttunement':
                          if (player && player.attunements) {
                             if (milestone.track.condition === 'any') {
                                 conditionMet = Object.values(player.attunements).some(att => att >= threshold);
                             } else if (milestone.track.condition === 'all') {
                                 conditionMet = Object.values(player.attunements).every(att => att >= threshold);
                             }
                          }
                         break;
                     case 'totalInsight': // Check meta insight total
                         conditionMet = this.totalInsight >= threshold;
                         break;
                     // --- Add placeholders for unimplemented state checks ---
                     case 'unlockedDeepDiveLevels':
                     case 'repositoryInsightsCount':
                     case 'repositoryContents':
                     case 'elementLevel':
                     case 'focusSlotsTotal': // Example: Check against max slots defined elsewhere
                          // console.warn(`State check for '${stateKey}' not fully implemented yet.`);
                          break;
                     default:
                          console.warn(`Unknown milestone state key: ${stateKey}`);
                 }
             } catch (error) {
                 console.error(`Error checking state milestone ${milestone.id} (${stateKey}):`, error);
             }

             if (conditionMet) {
                  if (this.completeMilestone(milestone)) {
                     milestoneCompleted = true;
                  }
             }
         });
          if (milestoneCompleted) this.save(); // Save if any state milestone completed
    }

     // Refine completeMilestone to use new permanentUpgrades structure
     completeMilestone(milestone) {
        if (this.completedMilestoneIds.has(milestone.id)) return false; // Already completed

        console.log(`%cMilestone Completed: ${milestone.id} - ${milestone.description}`, "color: #f1c40f; font-weight: bold;");
        this.completedMilestoneIds.add(milestone.id);

        let appliedReward = false;
        if (milestone.reward) {
            appliedReward = true; // Assume reward applied unless specific type fails
            const reward = milestone.reward;
            switch (reward.type) {
                case 'insight':
                    this.addInsight(reward.amount); // addInsight handles saving
                    appliedReward = false; // Don't double-save below if only insight gained
                    break;
                case 'attunement':
                    const element = reward.element; // 'Sensory', 'All', etc.
                    if (element === 'All') {
                        this.applyPermanentUpgrade('attunementBonus.All', reward.amount);
                    } else if (this.permanentUpgrades.attunementBonus.hasOwnProperty(element)) {
                        this.applyPermanentUpgrade(`attunementBonus.${element}`, reward.amount);
                    } else {
                        console.warn(`Invalid element '${element}' for attunement milestone reward ${milestone.id}`);
                        appliedReward = false;
                    }
                    break;
                case 'increaseFocusSlots':
                     this.applyPermanentUpgrade('focusSlotsBonus', reward.amount);
                     break;
                 case 'increaseMaxIntegrity': // Example new reward type
                     this.applyPermanentUpgrade('maxIntegrityBonus', reward.amount);
                     break;
                 case 'increaseStartingInsight': // Example
                     this.applyPermanentUpgrade('startingInsightBonus', reward.amount);
                     break;
                 case 'increaseCardRewardChoices': // Example
                      this.applyPermanentUpgrade('cardRewardChoicesBonus', reward.amount);
                     break;
                 case 'unlockCard':
                      if (!this.unlockConcept(reward.conceptId)) appliedReward = false;
                      break;
                 case 'unlockArtifact':
                      if (!this.unlockArtifact(reward.artifactId)) appliedReward = false;
                      break;
                 default:
                      console.warn(`Unknown milestone reward type: ${reward.type}`);
                      appliedReward = false;
            }
            if(appliedReward) {
                 // TODO: Show UI Notification for the reward gained
                 this.uiManager?.showNotification(`Milestone Reward: ${this.getRewardDescription(reward)}`);
            }
        }

        // Save occurs in calling function (updateMilestoneProgress/checkStateBasedMilestones) if appliedReward is true
        return appliedReward; // Return true if a non-insight reward was successfully applied
    }

    // Keep checkMilestonesOnInsightChange (it now correctly calls the refined checkStateBasedMilestones indirectly via addInsight -> save)
     checkMilestonesOnInsightChange() {
         this.checkStateBasedMilestones(); // Check relevant state milestones after insight changes
     }

    // Refine permanent upgrades
    applyPermanentUpgrade(upgradeKey, amount) {
         // Use dot notation access for nested properties
         const keys = upgradeKey.split('.');
         let target = this.permanentUpgrades;
         try {
             for (let i = 0; i < keys.length - 1; i++) {
                target = target[keys[i]];
                if (target === undefined) throw new Error(`Invalid key path: ${upgradeKey}`);
            }
            const finalKey = keys[keys.length - 1];
            target[finalKey] = (target[finalKey] || 0) + amount;
            console.log(`Applied permanent upgrade: ${upgradeKey} +${amount}. New value: ${target[finalKey]}`);
            // Save is handled by the function that calls this (e.g., completeMilestone)
         } catch (error) {
             console.error(`Error applying permanent upgrade ${upgradeKey}:`, error);
         }

    }

    // Refine getting bonuses
    getStartingBonus(bonusKey) {
        const keys = bonusKey.split('.');
        let value = this.permanentUpgrades;
        try {
            for (const key of keys) {
                if (value === undefined || value === null) return 0; // Not found
                value = value[key];
            }
            // Special handling for attunement 'All' bonus
            if (keys[0] === 'attunementBonus' && keys.length === 2 && keys[1] !== 'All') {
                 value = (value || 0) + (this.permanentUpgrades.attunementBonus?.All || 0);
            }

            return value || 0; // Return 0 if value is undefined/null at the end
        } catch (error) {
            console.warn(`Error getting starting bonus ${bonusKey}:`, error);
            return 0;
        }
    }

     // Helper to generate reward description for notifications
     getRewardDescription(reward) {
         switch (reward.type) {
             case 'insight': return `${reward.amount} Insight`;
             case 'attunement': return `+${reward.amount} ${reward.element} Attunement`;
             case 'increaseFocusSlots': return `+${reward.amount} Focus Slot`;
             case 'increaseMaxIntegrity': return `+${reward.amount} Max Integrity`;
             case 'increaseStartingInsight': return `+${reward.amount} Starting Insight`;
             case 'increaseCardRewardChoices': return `+${reward.amount} Card Reward Choice`;
             case 'unlockCard':
                  const card = Data.concepts.find(c => c.id === reward.conceptId);
                  return `Unlocked Concept: ${card?.name || 'Unknown'}`;
             case 'unlockArtifact':
                   const artifact = ARTIFACT_TEMPLATES[reward.artifactId];
                   return `Unlocked Relic: ${artifact?.name || 'Unknown'}`;
             default: return `Unknown Reward`;
         }
     }

} // End of MetaProgression class
