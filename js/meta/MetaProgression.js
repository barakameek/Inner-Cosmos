// js/meta/MetaProgression.js

// Import data - needs access to milestones, concepts, artifacts etc. for initialization
import * as Data from '../data.js';

// --- Constants ---
const SAVE_KEY = 'personaLabyrinth_metaProgress_v1'; // Key for localStorage

/**
 * Manages persistent player progress between runs.
 */
export class MetaProgression {
    constructor() {
        this.totalInsight = 0;          // Total currency accumulated
        this.unlockedConceptIds = new Set(); // IDs of concepts available to appear in runs
        this.unlockedArtifactIds = new Set(); // IDs of artifacts available to appear
        this.completedMilestoneIds = new Set(); // IDs of milestones already claimed
        this.permanentUpgrades = {}; // e.g., { startingIntegrityBonus: 5 }
        this.currentAscension = 0;     // Highest unlocked difficulty

        // Runtime tracking (not saved directly, but used for checking milestones)
        this.milestoneProgress = {}; // { milestoneId: currentCount } - Resets each session potentially

        // Load existing progress if available
        this.load();

        // Initialize basic unlocks if first time playing
        this._initializeDefaultUnlocks();

        console.log("MetaProgression initialized.");
         // console.log("Initial Meta State:", this); // For debugging
    }

    /**
     * Initializes default unlocked concepts/artifacts if none are saved.
     * Ensures the player starts with some basic options.
     */
    _initializeDefaultUnlocks() {
        if (this.unlockedConceptIds.size === 0) {
            console.log("Performing first-time default concept unlocks...");
            // Unlock common concepts initially
            Data.concepts.forEach(concept => {
                if (concept.rarity === 'common') {
                    this.unlockedConceptIds.add(concept.id);
                }
            });
             // Maybe unlock one or two specific uncommon ones?
             const sensualTouch = Data.concepts.find(c => c.name === "Sensual Touch")?.id;
             if(sensualTouch) this.unlockedConceptIds.add(sensualTouch);

             console.log(`Unlocked ${this.unlockedConceptIds.size} default concepts.`);
             this.save(); // Save initial unlocks
        }

         if (this.unlockedArtifactIds.size === 0) {
             console.log("Performing first-time default artifact unlocks...");
             // Unlock the first common artifact example
             if (Data.ARTIFACT_TEMPLATES['insight_fragment_a']) { // Check if defined
                  this.unlockedArtifactIds.add('insight_fragment_a');
                  console.log("Unlocked default artifact: Fragment of Attraction");
                  this.save();
             }
         }
    }

    /**
     * Loads progress from localStorage.
     */
    load() {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                this.totalInsight = parsedData.totalInsight || 0;
                // Convert arrays back to Sets
                this.unlockedConceptIds = new Set(parsedData.unlockedConceptIds || []);
                this.unlockedArtifactIds = new Set(parsedData.unlockedArtifactIds || []);
                this.completedMilestoneIds = new Set(parsedData.completedMilestoneIds || []);
                this.permanentUpgrades = parsedData.permanentUpgrades || {};
                this.currentAscension = parsedData.currentAscension || 0;

                console.log("MetaProgression loaded successfully.");
                // console.log("Loaded state:", this);
            } catch (error) {
                console.error("Failed to parse saved meta progression:", error);
                // Clear corrupted data?
                // localStorage.removeItem(SAVE_KEY);
            }
        } else {
            console.log("No saved meta progression found. Starting fresh.");
        }
    }

    /**
     * Saves the current progress to localStorage.
     */
    save() {
        try {
            const dataToSave = {
                totalInsight: this.totalInsight,
                // Convert Sets to arrays for JSON serialization
                unlockedConceptIds: Array.from(this.unlockedConceptIds),
                unlockedArtifactIds: Array.from(this.unlockedArtifactIds),
                completedMilestoneIds: Array.from(this.completedMilestoneIds),
                permanentUpgrades: this.permanentUpgrades,
                currentAscension: this.currentAscension,
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
            console.log("MetaProgression saved.");
        } catch (error) {
            console.error("Failed to save meta progression:", error);
        }
    }

    /**
     * Resets all meta progression (USE WITH CAUTION).
     */
    resetProgress() {
        console.warn("Resetting all meta progression!");
        this.totalInsight = 0;
        this.unlockedConceptIds = new Set();
        this.unlockedArtifactIds = new Set();
        this.completedMilestoneIds = new Set();
        this.permanentUpgrades = {};
        this.currentAscension = 0;
        this.milestoneProgress = {};
        localStorage.removeItem(SAVE_KEY);
        this._initializeDefaultUnlocks(); // Re-add defaults after reset
        this.save();
        console.log("Meta progression has been reset.");
        // TODO: Add confirmation prompt in UI before calling this
    }

    // --- Currency ---
    addInsight(amount) {
        if (amount > 0) {
            this.totalInsight += amount;
            console.log(`Added ${amount} Insight. Total: ${this.totalInsight}`);
            this.save(); // Save after gaining currency
             this.checkMilestonesOnInsightChange(); // Check if insight gain triggers milestones
        }
    }

    spendInsight(amount) {
        if (amount > 0 && this.totalInsight >= amount) {
            this.totalInsight -= amount;
            console.log(`Spent ${amount} Insight. Remaining: ${this.totalInsight}`);
            this.save();
            return true; // Purchase successful
        }
        console.log(`Failed to spend ${amount} Insight. Have: ${this.totalInsight}`);
        return false; // Insufficient funds
    }

    // --- Unlocks ---
    unlockConcept(conceptId) {
        if (!this.unlockedConceptIds.has(conceptId)) {
            this.unlockedConceptIds.add(conceptId);
            console.log(`Unlocked Concept ID: ${conceptId}`);
            this.save();
            return true;
        }
        return false;
    }

    unlockArtifact(artifactId) {
        if (!this.unlockedArtifactIds.has(artifactId)) {
            this.unlockedArtifactIds.add(artifactId);
            console.log(`Unlocked Artifact ID: ${artifactId}`);
            this.save();
            return true;
        }
        return false;
    }

    isConceptUnlocked(conceptId) {
        return this.unlockedConceptIds.has(conceptId);
    }

     isArtifactUnlocked(artifactId) {
         return this.unlockedArtifactIds.has(artifactId);
     }

     getUnlockedConcepts() {
         return Array.from(this.unlockedConceptIds);
     }

     getUnlockedArtifacts() {
         return Array.from(this.unlockedArtifactIds);
     }

    // --- Milestones ---

    /**
     * Updates progress towards an action-based milestone.
     * @param {string} actionName - The action identifier (e.g., 'completeReflection', 'discoverRareCard').
     * @param {number} count - The amount to increment the action count by (usually 1).
     * @param {object|null} context - Optional context data (e.g., { level: 3 } for lore unlock)
     */
    updateMilestoneProgress(actionName, count = 1, context = null) {
        console.log(`Tracking milestone action: ${actionName}, Count: ${count}, Context:`, context);
         Data.milestones.forEach(milestone => {
             // Skip if already completed
             if (this.completedMilestoneIds.has(milestone.id)) return;

             // Check if this milestone tracks this action
             if (milestone.track.action === actionName) {
                 const progressKey = `${milestone.id}_actionCount`;
                 this.milestoneProgress[progressKey] = (this.milestoneProgress[progressKey] || 0) + count;

                 console.log(`   Milestone ${milestone.id} progress: ${this.milestoneProgress[progressKey]} / ${milestone.track.count}`);

                 // Check if threshold is met
                 if (this.milestoneProgress[progressKey] >= milestone.track.count) {
                      // Additional context checks if needed
                      let contextMatch = true;
                      if (milestone.track.condition === 'level3' && context?.level !== 3) {
                         contextMatch = false; // Specific level 3 check
                      }
                       if (milestone.track.condition === 'anyLevel' && !context?.level) {
                         contextMatch = false; // Requires a level context
                       }
                       // Add more specific condition checks here based on milestone definitions

                      if (contextMatch) {
                          this.completeMilestone(milestone);
                      }
                 }
             }
         });
    }

    /**
     * Checks state-based milestones (e.g., deck size, attunement level).
     * Should be called when relevant game state changes (e.g., end of run, gaining cards).
     * @param {GameState} currentGameState - The current run's GameState (if applicable).
     */
    checkStateBasedMilestones(currentGameState = null) {
         console.log("Checking state-based milestones...");
         const player = currentGameState?.player;

         Data.milestones.forEach(milestone => {
             if (this.completedMilestoneIds.has(milestone.id) || !milestone.track.state) return; // Skip completed or non-state milestones

             let conditionMet = false;
             const stateKey = milestone.track.state;
             const threshold = milestone.track.threshold;

             try { // Add try-catch for safety when accessing potentially null state
                 switch(stateKey) {
                     case 'discoveredConcepts.size': // Check meta unlocked concepts
                         conditionMet = this.unlockedConceptIds.size >= threshold;
                         break;
                     case 'focusedConcepts.size': // Check during run state? Needs GameState access
                          if (player) conditionMet = player.focusedConcepts?.length >= threshold; // Assuming player has focusedConcepts array
                         break;
                     case 'elementAttunement': // Check during run state? Needs GameState access
                          if (player && player.attunements) {
                             if (milestone.track.condition === 'any') {
                                 conditionMet = Object.values(player.attunements).some(att => att >= threshold);
                             } else if (milestone.track.condition === 'all') {
                                 conditionMet = Object.values(player.attunements).every(att => att >= threshold);
                             }
                          }
                         break;
                      case 'unlockedDeepDiveLevels': // Check meta state
                           // Placeholder: need to track library unlocks in meta state
                           // Example: this.libraryUnlocks['Attraction'] >= threshold
                          console.warn("State check for 'unlockedDeepDiveLevels' not implemented.");
                          break;
                     case 'repositoryInsightsCount': // Check meta state
                          // Placeholder: need to track collected insights
                          console.warn("State check for 'repositoryInsightsCount' not implemented.");
                          break;
                     case 'repositoryContents': // Check meta state
                          // Placeholder: check if at least one of each item type exists
                           console.warn("State check for 'repositoryContents' not implemented.");
                          break;
                     case 'elementLevel': // Check during run state? Needs player XP/Level data
                         // Placeholder: Check player element levels
                          console.warn("State check for 'elementLevel' not implemented.");
                          break;
                     // Add more state checks here...
                 }
             } catch (error) {
                 console.error(`Error checking state milestone ${milestone.id}:`, error);
             }


             if (conditionMet) {
                 this.completeMilestone(milestone);
             }
         });
    }

    /**
     * Marks a milestone as completed and applies its reward.
     * @param {object} milestone - The milestone object from Data.js.
     */
    completeMilestone(milestone) {
        if (this.completedMilestoneIds.has(milestone.id)) return; // Already completed

        console.log(`%cMilestone Completed: ${milestone.id} - ${milestone.description}`, "color: #f1c40f; font-weight: bold;");
        this.completedMilestoneIds.add(milestone.id);

        // Apply Reward
        if (milestone.reward) {
            switch (milestone.reward.type) {
                case 'insight':
                    this.addInsight(milestone.reward.amount);
                    break;
                case 'attunement': // This might apply to next run start? Or maybe a temp run buff?
                    console.log(`Milestone Reward: Attunement +${milestone.reward.amount} for ${milestone.reward.element}`);
                    // How to apply this? Permanent upgrade? Temporary? Add to this.permanentUpgrades?
                     this.applyPermanentUpgrade(`attunement_${milestone.reward.element}`, milestone.reward.amount);
                    break;
                case 'increaseFocusSlots':
                     console.log(`Milestone Reward: +${milestone.reward.amount} Focus Slot(s)!`);
                     this.applyPermanentUpgrade('focusSlots', milestone.reward.amount);
                     break;
                // Add more reward types (unlock specific card, artifact, etc.)
                 case 'unlockCard':
                      this.unlockConcept(milestone.reward.conceptId);
                      break;
                 case 'unlockArtifact':
                      this.unlockArtifact(milestone.reward.artifactId);
                      break;
            }
        }

        // TODO: Show a notification to the player in the UI

        this.save(); // Save after completing a milestone
    }

     checkMilestonesOnInsightChange() {
         // Check milestones specifically triggered by total insight amount
         Data.milestones.forEach(milestone => {
             if (this.completedMilestoneIds.has(milestone.id)) return;
             if (milestone.track.state === 'totalInsight' && this.totalInsight >= milestone.track.threshold) {
                 this.completeMilestone(milestone);
             }
         });
     }

    // --- Permanent Upgrades ---
    applyPermanentUpgrade(upgradeKey, amount) {
        this.permanentUpgrades[upgradeKey] = (this.permanentUpgrades[upgradeKey] || 0) + amount;
        console.log(`Applied permanent upgrade: ${upgradeKey} +${amount}. New value: ${this.permanentUpgrades[upgradeKey]}`);
        this.save();
    }

    getStartingBonus(bonusKey) {
        // Used by GameState/Player constructor to apply bonuses at run start
        return this.permanentUpgrades[bonusKey] || 0;
    }

} // End of MetaProgression class
