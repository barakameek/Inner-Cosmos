// js/meta/MetaProgression.js

// Import data - needs access to milestones, concepts definitions
import * as Data from '../../data.js'; // Correct path from js/meta to root

// Import artifact definitions - needs access for unlocks, rewards
import { ARTIFACT_TEMPLATES } from '../core/ArtifactDefinitions.js'; // Correct path

// --- Constants ---
const SAVE_KEY = 'personaLabyrinth_metaProgress_v1.2'; // Updated version key
const MAX_ASCENSION = 10; // Example max difficulty

/**
 * Manages persistent player progress between runs (unlocks, currency, upgrades).
 */
export class MetaProgression {
    constructor() {
        // --- Core Persistent Data ---
        this.totalInsight = 0;
        this.unlockedConceptIds = new Set();
        this.unlockedArtifactIds = new Set();
        this.completedMilestoneIds = new Set();
        this.permanentUpgrades = this.getDefaultUpgrades(); // Initialize with defaults
        this.currentAscension = 0; // Selected ascension for the *next* run
        this.highestAscensionBeat = -1; // Track highest level actually *won*

        // Runtime tracking (not saved directly, but used for checking milestones during a run)
        // This might be better placed in GameState if it's purely run-specific,
        // but keeping it here allows checking across multiple runs if needed (e.g., "win 5 combats total").
        // For simplicity, let's assume it's reset implicitly or explicitly when a new run starts.
        this.milestoneProgress = {}; // { milestoneId_actionCount: currentCount }

        this.load(); // Load saved data OVER defaults

        // Initialize basic unlocks ONLY if loading didn't populate them (first time run)
        try {
            // Check if essential data is loaded before initializing defaults
            if (Data?.concepts && ARTIFACT_TEMPLATES) {
                this._initializeDefaultUnlocks();
            } else {
                console.error("MetaProgression FATAL: Cannot initialize defaults - Data.js or ArtifactDefinitions.js not loaded correctly!");
                // Consider throwing an error or setting a flag indicating a critical failure
            }
        } catch (error) {
            console.error("Error during MetaProgression default unlock initialization:", error);
        }


        console.log("MetaProgression initialized.");
    }

    /** Initializes default unlocked concepts/artifacts if none are saved. */
    _initializeDefaultUnlocks() {
        let changed = false;

        // Check if concepts data exists and the set is empty
        if (Data?.concepts && this.unlockedConceptIds.size === 0) {
            console.log("MetaProgression: Performing first-time default concept unlocks...");
            Data.concepts.forEach(concept => {
                // Automatically unlock all common concepts
                if (concept.rarity === 'common') {
                    this.unlockedConceptIds.add(concept.id);
                    changed = true;
                }
            });
            // Explicitly unlock a few core uncommon concepts for early gameplay
            const coreUncommons = [4, 5, 15]; // Dom(Psych), Sub(Psych), Deep Intimacy
            coreUncommons.forEach(id => {
                if (Data.concepts.some(c => c.id === id)) { // Check if concept exists
                    this.unlockedConceptIds.add(id);
                    changed = true;
                }
            });
             console.log(`MetaProgression: Unlocked ${this.unlockedConceptIds.size} default/core concepts.`);
        }

        // Check if artifact templates exist and the set is empty
         if (ARTIFACT_TEMPLATES && this.unlockedArtifactIds.size === 0) {
             console.log("MetaProgression: Performing first-time default artifact unlocks...");
             // Add a guaranteed basic starting artifact
             if (ARTIFACT_TEMPLATES['insight_fragment_a']) { // Check if definition exists
                  this.unlockedArtifactIds.add('insight_fragment_a');
                  changed = true;
             }
             // Add other desired defaults here
             // if (ARTIFACT_TEMPLATES['comforting_touch_s']) { this.unlockedArtifactIds.add('comforting_touch_s'); changed = true; }
             if (changed) console.log(`MetaProgression: Unlocked ${this.unlockedArtifactIds.size} default artifacts.`);
         }

         // Save ONLY if defaults were actually added to prevent unnecessary writes
         if (changed) {
             this.save();
         }
    }

    /** Loads progress from localStorage. */
    load() {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                console.log("MetaProgression: Loading saved data...");

                this.totalInsight = parsedData.totalInsight || 0;
                // Ensure loaded data are arrays before creating Sets
                this.unlockedConceptIds = new Set(Array.isArray(parsedData.unlockedConceptIds) ? parsedData.unlockedConceptIds : []);
                this.unlockedArtifactIds = new Set(Array.isArray(parsedData.unlockedArtifactIds) ? parsedData.unlockedArtifactIds : []);
                this.completedMilestoneIds = new Set(Array.isArray(parsedData.completedMilestoneIds) ? parsedData.completedMilestoneIds : []);

                // Safely merge upgrades onto the default structure
                this.permanentUpgrades = this._mergeDeep(this.getDefaultUpgrades(), parsedData.permanentUpgrades || {});

                this.currentAscension = parsedData.currentAscension || 0;
                this.highestAscensionBeat = parsedData.highestAscensionBeat ?? -1; // Use nullish coalescing

                console.log("MetaProgression loaded successfully.");

            } catch (error) {
                console.error("MetaProgression Error: Failed to parse saved data. Resetting to defaults.", error);
                // Reset to defaults ONLY if parsing fails
                this.totalInsight = 0;
                this.unlockedConceptIds = new Set();
                this.unlockedArtifactIds = new Set();
                this.completedMilestoneIds = new Set();
                this.permanentUpgrades = this.getDefaultUpgrades();
                this.currentAscension = 0;
                this.highestAscensionBeat = -1;
                this.milestoneProgress = {};
                // Let constructor handle re-initializing default unlocks after reset
            }
        } else {
            console.log("MetaProgression: No saved data found. Using defaults.");
            // Defaults are already set by constructor, _initializeDefaultUnlocks will run if needed
        }
    }

    /** Helper for safely merging nested objects during load */
    _mergeDeep(target, source) {
        const isObject = (obj) => obj && typeof obj === 'object' && !Array.isArray(obj);

        if (!isObject(target) || !isObject(source)) {
             console.warn("_mergeDeep: Invalid arguments, returning source.");
             return source; // Or handle error appropriately
        }

        // Iterate over source keys
        Object.keys(source).forEach(key => {
            const targetValue = target[key];
            const sourceValue = source[key];

            if (isObject(sourceValue)) {
                // If target doesn't have the key or it's not an object, create it
                if (!isObject(targetValue)) {
                    target[key] = {};
                }
                // Recurse only if both are objects
                this._mergeDeep(target[key], sourceValue);
            } else if (sourceValue !== undefined) {
                // Assign non-object values (including primitives, null) from source to target
                target[key] = sourceValue;
            }
            // If sourceValue is undefined, do nothing (keep target's value)
        });
        return target;
     }


    /** Returns a deep copy of the default structure for permanent upgrades */
    getDefaultUpgrades() {
         // Use JSON parse/stringify for a reliable deep copy
         return JSON.parse(JSON.stringify({
             maxIntegrityBonus: 0,
             startingFocusBonus: 0, // Bonus starting focus points
             focusSlotsBonus: 0, // Bonus max focus slots
             startingInsightBonus: 0,
             cardRewardChoicesBonus: 0,
             shopArtifactChoicesBonus: 0, // Example new bonus
             shopRemovalCostIncrease: 0, // Example negative bonus (cost increase)
             attunementBonus: {
                 Attraction: 0, Interaction: 0, Sensory: 0,
                 Psychological: 0, Cognitive: 0, Relational: 0, RoleFocus: 0,
                 All: 0 // Flat bonus applied to all elements
             }
             // Add other potential upgrade categories here
         }));
     }

    /** Saves the current progress to localStorage. */
    save() {
        try {
            // Ensure nested objects exist before trying to access properties
            const upgradesToSave = this.permanentUpgrades || this.getDefaultUpgrades(); // Fallback

            const dataToSave = {
                totalInsight: this.totalInsight || 0,
                unlockedConceptIds: Array.from(this.unlockedConceptIds || new Set()),
                unlockedArtifactIds: Array.from(this.unlockedArtifactIds || new Set()),
                completedMilestoneIds: Array.from(this.completedMilestoneIds || new Set()),
                permanentUpgrades: upgradesToSave,
                currentAscension: this.currentAscension || 0,
                highestAscensionBeat: this.highestAscensionBeat ?? -1,
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
            // console.log("MetaProgression saved."); // Less noisy logging
        } catch (error) {
            console.error("MetaProgression Error: Failed to save progress:", error);
        }
    }

    /** Resets all meta progression (USE WITH CAUTION). */
    resetProgress() {
         // User confirmation
         if (!window.confirm("!! WARNING !!\n\nAre you sure you want to reset ALL permanent progress (unlocks, insight, upgrades)?\n\nThis action CANNOT be undone.")) {
             console.log("Meta progression reset cancelled by user.");
             return; // Abort if user cancels
         }
         console.warn("MetaProgression: Resetting all permanent progress!");

         // Reset variables
        this.totalInsight = 0;
        this.unlockedConceptIds = new Set();
        this.unlockedArtifactIds = new Set();
        this.completedMilestoneIds = new Set();
        this.permanentUpgrades = this.getDefaultUpgrades(); // Reset upgrades
        this.currentAscension = 0;
        this.highestAscensionBeat = -1;
        this.milestoneProgress = {}; // Clear runtime progress tracking

        // Clear storage
        localStorage.removeItem(SAVE_KEY);

        // Re-initialize default unlocks (needs Data/Artifacts loaded)
        try {
             if (Data?.concepts && ARTIFACT_TEMPLATES) {
                  this._initializeDefaultUnlocks(); // This will now save the defaults
             } else {
                   console.error("MetaProgression Reset Error: Cannot re-initialize defaults - Data.js or ArtifactDefinitions.js not loaded correctly!");
             }
        } catch (error) {
             console.error("Error during default unlock initialization after reset:", error);
        }

        // Save the reset state (even if default unlocks failed, save the cleared state)
        this.save();

        console.log("MetaProgression: Progress has been reset.");
        alert("Meta progression has been reset successfully."); // Feedback
        // Potentially force a UI refresh or reload
        window.location.reload(); // Force reload to reflect changes immediately
     }

    // --- Currency ---
    addInsight(amount) {
        if (typeof amount !== 'number' || amount <= 0) return;
        this.totalInsight = (this.totalInsight || 0) + amount;
        this.checkMilestonesOnInsightChange(); // Check if new total unlocks anything
        this.save();
     }
    spendInsight(amount) {
        if (typeof amount !== 'number' || amount <= 0) return false;
        if ((this.totalInsight || 0) >= amount) {
            this.totalInsight -= amount;
            this.save();
            return true;
        }
        return false; // Not enough insight
     }

    // --- Unlocks ---
    unlockConcept(conceptId) {
        // Ensure Data and concepts list are loaded
        if (!Data?.concepts) { console.error("MetaProgression Error: Data.concepts not available for unlockConcept."); return false; }
        if (this.unlockedConceptIds.has(conceptId)) return false; // Already unlocked

        const conceptExists = Data.concepts.some(c => c.id === conceptId);
        if (!conceptExists) {
             console.warn(`MetaProgression: Attempted to unlock invalid or non-existent concept ID: ${conceptId}`);
             return false;
        }
        this.unlockedConceptIds.add(conceptId);
        console.log(`Concept unlocked: ${conceptId} (${Data.concepts.find(c=>c.id===conceptId)?.name || 'Unknown Name'})`);
        this.save();
        return true;
     }

    unlockArtifact(artifactId) {
        // Ensure artifact templates are loaded
        if (!ARTIFACT_TEMPLATES) { console.error("MetaProgression Error: ARTIFACT_TEMPLATES not available for unlockArtifact."); return false; }
        if (this.unlockedArtifactIds.has(artifactId)) return false; // Already unlocked

        if (!ARTIFACT_TEMPLATES[artifactId]) {
             console.warn(`MetaProgression: Attempted to unlock invalid or non-existent artifact ID: ${artifactId}`);
             return false;
        }
        this.unlockedArtifactIds.add(artifactId);
         console.log(`Artifact unlocked: ${artifactId} (${ARTIFACT_TEMPLATES[artifactId]?.name || 'Unknown Name'})`);
        this.save();
        return true;
     }

    isConceptUnlocked(conceptId) { return this.unlockedConceptIds.has(conceptId); }
    isArtifactUnlocked(artifactId) { return this.unlockedArtifactIds.has(artifactId); }
    getUnlockedConcepts() { return Array.from(this.unlockedConceptIds); }
    getUnlockedArtifacts() { return Array.from(this.unlockedArtifactIds); }

    // --- Milestones ---
    /** Tracks progress towards action-based milestones. */
    updateMilestoneProgress(actionName, count = 1, context = null) {
        // Guard against missing data
        if (!Data?.milestones) { console.error("MetaProgression Error: Milestone data not loaded, cannot update progress."); return; }

        let needsSave = false;
         Data.milestones.forEach(milestone => {
             if (this.completedMilestoneIds.has(milestone.id)) return; // Skip completed
             // Check if this milestone tracks the triggered action
             if (milestone.track?.action === actionName) {
                 const progressKey = `${milestone.id}_actionCount`; // Unique key for tracking count
                 const currentCount = (this.milestoneProgress[progressKey] || 0) + count;
                 this.milestoneProgress[progressKey] = currentCount; // Update runtime progress

                 // Check if count threshold is met and context conditions (if any) are met
                 if (currentCount >= (milestone.track.threshold || 1)) {
                      if (this._checkMilestoneContext(milestone.track, context)) {
                          // completeMilestone returns true if a non-insight reward was applied
                          if (this.completeMilestone(milestone)) {
                              needsSave = true;
                          }
                          // Reset progress counter after completion? Optional.
                          // delete this.milestoneProgress[progressKey];
                      }
                 }
             }
         });
         // Save only if a non-insight reward milestone was completed
         if (needsSave) this.save();
    }

    /** Helper to check context conditions for milestones */
     _checkMilestoneContext(trackData, context) {
         if (!trackData?.condition || !context) return true; // No condition or no context? Condition met.

         try {
             switch(trackData.condition) {
                 case 'level3': return context?.level === 3;
                 case 'anyLevel': return context?.level !== undefined && context?.level !== null;
                 case 'conceptRarity': return context?.rarity === trackData.value; // Needs value like 'rare' in milestone def
                 case 'elementType': return context?.element === trackData.value; // Needs value like 'S' in milestone def
                 // Add more complex conditions as needed
                 default: console.warn(`MetaProgression: Unknown milestone condition type: ${trackData.condition}`); return true; // Default true? Or false?
             }
         } catch (error) {
              console.error("Error checking milestone context:", error, trackData, context);
              return false; // Fail safe on error
         }
     }

    /** Checks state-based milestones (e.g., total insight, unlocks). */
    checkStateBasedMilestones(currentGameState = null) { // Pass GameState for player state access
        if (!Data?.milestones) { console.error("MetaProgression Error: Milestone data not loaded, cannot check state."); return; }

        let needsSave = false;
        const player = currentGameState?.player; // Get player from optional GameState

         Data.milestones.forEach(milestone => {
             if (this.completedMilestoneIds.has(milestone.id) || !milestone.track?.state) return; // Skip completed or non-state milestones

             let conditionMet = false;
             const stateKey = milestone.track.state;
             const threshold = milestone.track.threshold ?? 1; // Use nullish coalescing, default 1
             const trackCondition = milestone.track.condition; // e.g., 'any', 'all'
             const trackElement = milestone.track.element; // e.g., 'S', 'P'

             try {
                 switch(stateKey) {
                     case 'discoveredConcepts.size':
                         conditionMet = (this.unlockedConceptIds?.size || 0) >= threshold;
                         break;
                     case 'focusedConcepts.size':
                         // Access player's focused concepts IF player exists
                         if (player?.deckManager?.focusedConcepts) { // Assuming focusedConcepts is on DeckManager or Player
                            conditionMet = player.deckManager.focusedConcepts.length >= threshold;
                         }
                         break;
                     case 'elementAttunement':
                         if (player?.attunements) {
                             if (trackElement && trackCondition === 'specific') { // Check specific element
                                  conditionMet = (player.attunements[trackElement] || 0) >= threshold;
                             } else if (trackCondition === 'any') { // Check any element
                                 conditionMet = Object.values(player.attunements).some(att => (att || 0) >= threshold);
                             } else if (trackCondition === 'all') { // Check all elements
                                 conditionMet = Object.values(player.attunements).every(att => (att || 0) >= threshold);
                             }
                         }
                         break;
                     case 'totalInsight':
                         conditionMet = (this.totalInsight || 0) >= threshold;
                         break;
                     case 'focusSlotsTotal':
                          // Need max slots from config or calculated on player? Player seems better.
                          if (player?.maxFocus) { // Check against actual max focus
                               // This seems wrong, milestone should likely track the *BONUS* slots from meta
                               // Let's track the bonus instead:
                               conditionMet = (this.permanentUpgrades?.focusSlotsBonus || 0) >= threshold;
                          }
                          break;
                    case 'repositoryInsightsCount':
                        // Requires GameState/Player to track these, maybe not ideal here.
                        // Let's assume this is tracked elsewhere or via action milestones.
                        console.warn("State check for 'repositoryInsightsCount' not implemented in MetaProgression.");
                        break;
                     // Add other state checks here...
                     default:
                        // console.warn(`State check for '${stateKey}' not implemented.`);
                        break;
                 }
             } catch (error) {
                 console.error(`Error checking state milestone ${milestone.id} ('${stateKey}'):`, error);
             }

             if (conditionMet) {
                 // completeMilestone returns true if a non-insight reward needs saving
                 if (this.completeMilestone(milestone)) {
                     needsSave = true;
                 }
             }
         });
          if (needsSave) this.save();
     }

    /** Completes a milestone, applies reward, and updates state. */
    completeMilestone(milestone) {
        if (!milestone || !milestone.id) { console.error("Invalid milestone object passed to completeMilestone."); return false; }
        if (this.completedMilestoneIds.has(milestone.id)) return false; // Already completed

        console.log(`%cMilestone Completed: ${milestone.id} - ${milestone.description}`, "color: #f1c40f; font-weight: bold;");
        this.completedMilestoneIds.add(milestone.id);
        let needsSave = false; // Flag if save is needed due to non-insight reward

        if (milestone.reward) {
            const reward = milestone.reward;
            try {
                switch (reward.type) {
                    case 'insight':
                        this.addInsight(reward.amount); // addInsight saves itself
                        break; // No need for needsSave=true here
                    case 'attunement':
                        const element = reward.element;
                        if (element === 'All') { this.applyPermanentUpgrade('attunementBonus.All', reward.amount); }
                        else if (this.permanentUpgrades.attunementBonus?.hasOwnProperty(element)) { this.applyPermanentUpgrade(`attunementBonus.${element}`, reward.amount); }
                        else { console.warn(`Invalid element '${element}' for attunement reward in milestone ${milestone.id}`); break; }
                        needsSave = true;
                        break;
                    case 'increaseFocusSlots': this.applyPermanentUpgrade('focusSlotsBonus', reward.amount); needsSave = true; break;
                    case 'increaseMaxIntegrity': this.applyPermanentUpgrade('maxIntegrityBonus', reward.amount); needsSave = true; break;
                    case 'increaseStartingInsight': this.applyPermanentUpgrade('startingInsightBonus', reward.amount); needsSave = true; break;
                    case 'increaseCardRewardChoices': this.applyPermanentUpgrade('cardRewardChoicesBonus', reward.amount); needsSave = true; break;
                    // Add cases for new bonuses
                    case 'increaseShopArtifactChoices': this.applyPermanentUpgrade('shopArtifactChoicesBonus', reward.amount); needsSave = true; break;
                    case 'increaseShopRemovalCost': this.applyPermanentUpgrade('shopRemovalCostIncrease', reward.amount); needsSave = true; break;
                    // Unlocks handle their own saving
                    case 'discoverCard': case 'unlockCard': this.unlockConcept(reward.conceptId || reward.cardId); break; // Use conceptId or cardId
                    case 'discoverMultipleCards': if (Array.isArray(reward.cardIds)) { reward.cardIds.forEach(id => this.unlockConcept(id)); } break;
                    case 'unlockArtifact': this.unlockArtifact(reward.artifactId); break;
                    default: console.warn(`Unknown reward type in milestone ${milestone.id}: ${reward.type}`);
                }

                // Show notification via UIManager (if available)
                const rewardDesc = this.getRewardDescription(reward);
                // Access UIManager via GameState reference if possible
                const uiManager = this.gameStateRef?.uiManager; // Need GameState linked for this
                if(uiManager) {
                     uiManager.showNotification(`Milestone: ${rewardDesc}!`);
                } else {
                    console.log(`Milestone Reward Applied: ${rewardDesc}`); // Fallback log
                }

            } catch (error) {
                 console.error(`Error applying reward for milestone ${milestone.id}:`, error, reward);
            }
        }
        return needsSave; // Return whether the main save in the calling function is needed
    }

    /** Convenience method called by addInsight to check relevant milestones. */
    checkMilestonesOnInsightChange() {
        this.checkStateBasedMilestones(); // Check total insight milestones etc.
    }

    // --- Permanent Upgrades ---
    /** Applies a permanent upgrade bonus. */
    applyPermanentUpgrade(upgradeKey, amount) {
         if (typeof amount !== 'number' || amount === 0) return; // No change
         if (!upgradeKey || typeof upgradeKey !== 'string') { console.error("Invalid upgradeKey provided."); return; }

         const keys = upgradeKey.split('.');
         let target = this.permanentUpgrades;

         try {
             // Traverse the path except for the final key
             for (let i = 0; i < keys.length - 1; i++) {
                 if (target === undefined || typeof target !== 'object') {
                      throw new Error(`Invalid path segment '${keys[i]}' in key '${upgradeKey}'. Target is not an object.`);
                 }
                 target = target[keys[i]];
             }

             const finalKey = keys[keys.length - 1];
             // Check if the final target object exists and the key is valid
             if (target === undefined || typeof target !== 'object' || !target.hasOwnProperty(finalKey)) {
                  throw new Error(`Invalid final key '${finalKey}' or target object for key '${upgradeKey}'.`);
             }

             // Apply the bonus
             target[finalKey] = (target[finalKey] || 0) + amount;
             console.log(`MetaProgression: Applied permanent upgrade: ${upgradeKey} +${amount}. New value: ${target[finalKey]}`);
             // Save is typically handled by the calling function (e.g., completeMilestone)
         } catch (error) {
             console.error(`MetaProgression Error: Failed to apply permanent upgrade '${upgradeKey}':`, error);
         }
    }

    /** Gets the value of a starting bonus from permanent upgrades. */
    getStartingBonus(bonusKey) {
        if (!bonusKey || typeof bonusKey !== 'string') return 0;

        const keys = bonusKey.split('.');
        let value = this.permanentUpgrades;

        try {
            // Traverse the path
            for (const key of keys) {
                if (value === undefined || value === null) return 0; // Path segment doesn't exist
                value = value[key];
            }

            const baseValue = value || 0; // Get the specific bonus value

            // Special handling: Apply 'All' attunement bonus on top of specific element bonus
            if (keys.length === 2 && keys[0] === 'attunementBonus' && keys[1] !== 'All') {
                const allBonus = this.permanentUpgrades?.attunementBonus?.All || 0;
                return baseValue + allBonus;
            }

            return baseValue; // Return the fetched value or 0 if undefined/null

        } catch (error) {
            console.error(`Error getting starting bonus for key '${bonusKey}':`, error);
            return 0; // Return 0 on error
        }
     }

    /** Helper to generate reward description string for notifications */
     getRewardDescription(reward) {
        if (!reward || !reward.type) return "Unknown Reward";
         try {
             switch (reward.type) {
                 case 'insight': return `${reward.amount} Insight`;
                 case 'attunement': return `+${reward.amount} ${reward.element || 'Unknown'} Attunement`;
                 case 'increaseFocusSlots': return `+${reward.amount} Focus Slot`;
                 case 'increaseMaxIntegrity': return `+${reward.amount} Max Integrity`;
                 case 'increaseStartingInsight': return `+${reward.amount} Starting Insight`;
                 case 'increaseCardRewardChoices': return `+${reward.amount} Card Reward Choice`;
                 case 'increaseShopArtifactChoices': return `+${reward.amount} Shop Relic Choice`;
                 case 'increaseShopRemovalCost': return `+${reward.amount} Shop Removal Cost`; // Note: Increase might be bad!
                 case 'discoverCard': case 'unlockCard':
                     const card = Data?.concepts?.find(c => c.id === (reward.conceptId || reward.cardId));
                     return `Unlocked Concept: ${card?.name || 'Unknown Concept'}`;
                 case 'discoverMultipleCards': return `Unlocked Multiple Concepts`; // Keep it simple
                 case 'unlockArtifact':
                     const artifact = ARTIFACT_TEMPLATES ? ARTIFACT_TEMPLATES[reward.artifactId] : null;
                     return `Unlocked Relic: ${artifact?.name || 'Unknown Relic'}`;
                 default: return `Unknown Reward (${reward.type})`;
             }
         } catch(e) {
             console.error("Error generating reward description:", e);
             return "Reward Data Error";
         }
     }

} // End of MetaProgression class
