// js/meta/MetaProgression.js

// Import data - needs access to milestones, concepts, artifacts etc. for initialization
// --- CORRECTED PATH FOR data.js ---
//attunementBonus: { Attraction: 0, Interaction: 0, Sensory: 0, Psychological: 0, Cognitive: 0, Relational: 0, RoleFocus: 0, All: 0 }
         };
     }

    /** Saves the current progress to localStorage. */
    save() {
        try {
            const dataToSave = {
                totalInsight: this.totalInsight,
                unlockedConceptIds: Array.from(this.unlockedConceptIds),
                unlockedArtifactIds: Array.from(this.unlockedArtifactIds),
                completedMilestoneIds: Array.from(this.completedMilestoneIds),
                permanentUpgrades: this.permanentUpgrades,
                currentAscension: this.currentAscension,
                highestAscension Go up from 'meta' to 'js', then up from 'js' to the root directory
import * as Data from '../../data.js';
// --- END CORRECTION ---

// Import artifact definitions - assuming ArtifactDefinitions.js is in js/core/
import { ARTIFACT_TEMPLATES } from '../core/ArtifactDefinitions.js'; // Path goes up from 'meta', then down into 'core'

// --- Constants ---
const SAVE_KEY = 'personaLabyrinth_metaProgress_v1.1'; // Key for localStorage
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
        // Structure for permanent upgrades
        this.permanentUpgrades = {
             maxIntegrityBonus: 0,
             startingFocusBonus: 0,
             focusSlotsBonus: 0,
             startingInsightBonus: 0,
             cardRewardChoicesBonus: 0,
             attunementBonus: { // Store bonuses per element
Beat: this.highestAscensionBeat,
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
            // console.log("MetaProgression saved."); // Noisy
        } catch (error) {
            console.error("Failed to save meta progression:", error);
        }
    }

    /** Resets all meta progression. */
    resetProgress() {
         console.warn("Resetting all meta progression!");
        this.totalInsight = 0; this.unlockedConceptIds = new Set(); this.unlockedArtifact                Attraction: 0, Interaction: 0, Sensory: 0, Psychological: 0,
                Cognitive: 0, Relational: 0, RoleFocus: 0, All: 0
            }
             // Add other potential upgrades: starting artifact slot, shop discounts?
        };
        this.currentAscension = 0;
        this.highestAscensionBeat = -1;

        // Runtime tracking (not saved)
        this.milestoneProgress = {}; // { milestoneId: currentCount }

        this.load();
        // Use imported Data object now
        if (Data && Data.concepts) { // Check if Data loaded correctly before initializing
             this._initializeDefaultUnlocks();
        } else {
            console.error("MetaProgression: CannotIds = new Set();
        this.completedMilestoneIds = new Set(); this.permanentUpgrades = this.getDefaultUpgrades();
        this.currentAscension = 0; this.highestAscensionBeat = -1; this.milestoneProgress = {};
        localStorage.removeItem(SAVE_KEY); this._initializeDefaultUnlocks(); this.save();
        console.log("Meta progression has been reset.");
     }

    // --- Currency ---
    addInsight(amount) {
        if (amount > 0) { this.totalInsight += amount; this.checkMilestonesOnInsightChange(); this.save(); }
     }
    spendInsight(amount) {
        if (amount > 0 && this.totalInsight >= amount) { this.totalInsight -= amount; this.save(); return true; } return false;
     }

    // --- Unlocks ---
    unlockConcept(conceptId) {
        if (!this.unlockedConceptIds.has(conceptId)) {
            const conceptExists = Data.concepts.some(c => c.id === conceptId); // Use imported Data
             initialize default unlocks - Data.js not loaded correctly!");
        }


        console.log("MetaProgression initialized.");
    }

    /** Initializes default unlocked concepts/artifacts if none are saved. */
    _initializeDefaultUnlocks() {
        // Ensure Data and necessary arrays exist before proceeding
        if (!Data || !Data.concepts || !ARTIFACT_TEMPLATES) {
             console.error("Cannot run _initializeDefaultUnlocks: Required data missing.");
             return; // Exit if data isn't loaded
        }

        let changed = false;
        if (this.unlockedConceptIds.size === 0) {
            console.log("Performing first-time default concept unlocks...");
            Data.concepts.forEach(concept => {
                if (concept.rarity === 'common') {
                    thisif (!conceptExists) {console.warn(`Invalid concept ID: ${conceptId}`); return false;}
            this.unlockedConceptIds.add(conceptId); this.save(); return true;
        } return false;
     }
    unlockArtifact(artifactId) {
        if (!this.unlockedArtifactIds.has(artifactId)) {
            if (!ARTIFACT_TEMPLATES[artifactId]) {console.warn(`Invalid artifact ID: ${artifactId}`); return false;} // Use imported TEMPLATES
            this.unlockedArtifactIds.add(artifactId); this.save(); return true;
        } return false;
     }
    isConceptUnlocked(conceptId) { return this.unlockedConceptIds.has(conceptId); }
    isArtifactUnlocked(artifactId) { return this.unlockedArtifactIds.has(artifactId); }
    getUnlockedConcepts() { return Array.from(this.unlockedConceptIds); }
    getUnlockedArtifacts() { return Array.from(this.unlockedArtifactIds); }

    // --- Milestones ---
    updateMilestoneProgress(actionName, count = 1, context = null) {
        let milestoneCompleted = false;
         // Use imported Data
         Data.milestones.forEach(milestone => {
             if (this.completedMil.unlockedConceptIds.add(concept.id);
                    changed = true;
                }
            });
             const idsToUnlock = [2, 4, 5, 15];
             idsToUnlock.forEach(id => {
                if(Data.concepts.find(c=>c.id===id)) {
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
         }
         if (changed) this.save();
    }

    /** Loads progress from localStorage. */
    load() {
        const savedData = localStorage.getItem(SAVE_KEYestoneIds.has(milestone.id)) return;
             if (milestone.track.action === actionName) {
                 const progressKey = `${milestone.id}_actionCount`;
                 const currentCount = (this.milestoneProgress[progressKey] || 0) + count;
                 this.milestoneProgress[progressKey] = currentCount;
                 if (currentCount >= milestone.track.threshold) {
                      if (this._checkMilestoneContext(milestone.track, context)) {
                          if (this.completeMilestone(milestone)) milestoneCompleted = true;
                      }
                 }
             }
         });
         if (milestoneCompleted) this.save();
    }

    /** Helper to check context conditions for milestones */
     _checkMilestoneContext(trackData, context) {
         if (!trackData.condition) return true;
         switch(trackData.condition) {
             case 'level3': return context?.level === 3;
             case 'anyLevel': return context?.level !== undefined && context?.level !== null;
             case 'microStory': return context?.unlockType === 'microStory';
             // Add more conditions...
             default: return true;
         }
);
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
                 this.permanentUpgrades = this.getDefaultUpgrades(); // Reset upgrades
                 // Don't call initialize here, let constructor handle it after failed load
            }
        } else {
            console.log("No saved meta progression found. Initializing defaults.");
             this.permanentUpgrades = this.getDefaultUpgrades();
             // Initialization happens in constructor
        }
    }

    /** Helper for merging nested objects during load */
    _mergeDeep(target, source) {
        const isObject = (obj) => obj && typeof obj === 'object' && !Array.isArray(obj);
        Object.keys(source).forEach(key => {
            const targetValue = target[key];
            const sourceValue = source[key];
            if (isObject(targetValue) && isObject(sourceValue)) {
                // Ensure target key exists before recursing
                if (!targetValue) target[key] = {};
                this._mergeDeep(target[key], sourceValue);
            } else if (source     }

    checkStateBasedMilestones(currentGameState = null) {
        let milestoneCompleted = false; const player = currentGameState?.player;
         // Use imported Data
         Data.milestones.forEach(milestone => {
             if (this.completedMilestoneIds.has(milestone.id) || !milestone.track.state) return;
             let conditionMet = false; const stateKey = milestone.track.state; const threshold = milestone.track.threshold;
             try {
                 switch(stateKey) {
                     case 'discoveredConcepts.size': conditionMet = this.unlockedConceptIds.size >= threshold; break;
                     case 'focusedConcepts.size': if (player?.focusedConcepts) conditionMet = player.focusedConcepts.length >= threshold; break;
                     case 'elementAttunement': if (player?.attunements) { if (milestone.track.condition === 'any') conditionMet = Object.values(player.attunements).some(att => att >= threshold); else if (milestone.track.condition === 'all') conditionMet = Object.values(player.attunements).every(att => att >= threshold); } break;
                     case 'totalInsight': conditionMet = this.totalInsight >= threshold; break;
                     // Add other state checks...
                     default: break; // Ignore unimplemented checks silently now
                 }
             } catch (error) { console.error(`Error checking state milestone ${milestone.id}:`, error); }
             if (conditionMet) { if (this.completeMilestone(milestone)) milestoneCompleted = true; }
         });
          if (milestoneCompleted) this.save();
     }

    completeMilestone(milestone) {
        if (this.completedMilestoneIds.has(milestone.id)) return false;
        console.log(`%cMilestone Completed: ${milestone.id} - ${milestone.description}`, "color: #f1c40f; font-weight: bold;");
        this.completedMilestoneIds.add(milestone.id);
        let appliedReward = false;
        if (milestone.reward) {
            appliedReward = true; const reward = milestone.reward;
            switch (reward.type) {
                case 'insight': this.addInsight(reward.amount); appliedReward = false; break;
                case 'attunement': const element = reward.element; if (element === 'All') this.applyPermanentUpgrade('attunementBonus.All', reward.amount); else if (this.permanentUpgrades.attunementBonusValue !== undefined) { // Only overwrite/add if source has value
                target[key] = sourceValue;
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

    /** Saves the current progress to localStorage. */
    save() {
        try {
            const dataToSave = {
                totalInsight: this.totalInsight,
                unlockedConceptIds: Array.from(this.unlockedConceptIds),
                unlockedArtifactIds: Array.from(this.unlockedArtifactIds),
                completedMilestoneIds: Array.from(this.completedMilestoneIds),
                permanentUpgrades: this.permanentUpgrades,
                currentAscension: this.currentAscension,
                highestAscensionBeat: this.highestAscensionBeat,
            };
            localStorage..hasOwnProperty(element)) this.applyPermanentUpgrade(`attunementBonus.${element}`, reward.amount); else appliedReward = false; break;
                case 'increaseFocusSlots': this.applyPermanentUpgrade('focusSlotsBonus', reward.amount); break;
                case 'increaseMaxIntegrity': this.applyPermanentUpgrade('maxIntegrityBonus', reward.amount); break;
                case 'increaseStartingInsight': this.applyPermanentUpgrade('startingInsightBonus', reward.amount); break;
                case 'increaseCardRewardChoices': this.applyPermanentUpgrade('cardRewardChoicesBonus', reward.amount); break;
                case 'unlockCard': if (!this.unlockConcept(reward.conceptId)) appliedReward = false; break;
                case 'unlockArtifact': if (!this.unlockArtifact(reward.artifactId)) appliedReward = false; break;
                default: appliedReward = false;
            }
            // Trigger UI notification if possible (needs UIManager reference or event system)
            // if(appliedReward && window.personaLab?.uiManager) { window.personaLab.uiManager.showNotification(`Milestone: ${this.getRewardDescription(reward)}`); }
        }
        // Save happens in calling function if reward applied
        return appliedReward;
    }

    checkMilestonesOnInsightChange() { this.checkStateBasedMilestones(); }

    // --- Permanent Upgrades ---
    applyPermanentUpgrade(upgradeKey, amount) {
         const keys = upgradeKey.split('.'); let target = this.permanentUpgrades;
         try {
             for (let i = 0; i < keys.length - 1; i++) { target = target[keys[i]]; if (target === undefined) throw new Error(`Invalid key path: ${upgradeKey}`); }
             const finalKey = keys[keys.length - 1]; target[finalKey] = (target[finalKey] || 0) + amount;
             console.log(`Applied permanent upgrade: ${upgradeKey} +${amount}. New value: ${target[finalKey]}`);
         } catch (error) { console.error(`Error applying permanent upgrade ${upgradeKey}:`, error); }
    }

    getStartingBonus(bonusKey) {
        const keys = bonusKey.split('.'); let value = this.permanentUpgrades;setItem(SAVE_KEY, JSON.stringify(dataToSave));
            // console.log("MetaProgression saved."); // Less noisy
        } catch (error) {
            console.error("Failed to save meta progression:", error);
        }
    }

    /** Resets all meta progression (USE WITH CAUTION). */
    resetProgress() {
         console.warn("Resetting all meta progression!");
        this.totalInsight = 0; this.unlockedConceptIds = new Set(); this.unlockedArtifactIds = new Set();
        this.completedMilestoneIds = new Set(); this.permanentUpgrades = this.getDefaultUpgrades();
        this.currentAscension = 0; this.highestAscensionBeat = -1; this.milestoneProgress = {};
        localStorage.removeItem(SAVE_KEY);
         // Check if Data is loaded before trying to use it
         if (Data && Data.concepts) {
             this._initializeDefaultUnlocks();
         } else {
             console.error("Cannot initialize defaults after reset: Data not loaded.");
         }
        this.save();
        console.log("Meta progression has been reset.");
     }

    // --- Currency ---
    addInsight(amount) {
        if (amount > 0) { this.totalInsight += amount; this.checkMilestonesOnInsightChange(); this.save(); }
     }
    spendInsight(amount) {
        if (amount > 0 && this.totalInsight >= amount) { this.totalInsight -= amount; this.save(); return true; } return false;
     }

    // --- Unlocks ---
    unlockConcept(conceptId) {
        if (!this.unlockedConceptIds.has(conceptId)) { const conceptExists = Data?.concepts?.some(c => c.id === conceptId); if (!conceptExists) { console.warn(`Attempted unlock invalid concept ${conceptId}`); return false; } this.unlockedConceptIds.add(conceptId); this.save(); return true; } return false;
     }
    unlockArtifact(artifactId) {
        if (!this.unlockedArtifactIds.has(artifactId)) { if (!ARTIFACT_TEMPLATES || !ARTIFACT_TEMPLATES[artifactId]) { console.warn(`Attempted unlock invalid artifact ${artifactId}`); return false; } this.unlockedArtifactIds.add(artifactId); this.save(); return true; } return false;
     }
    isConceptUnlocked(conceptId) { return this.unlockedConceptIds.has(conceptId); }
    isArtifactUnlocked(artifactId) { return this.unlockedArtifactIds.has(artifactId); }
    getUnlockedConcepts() { return Array.from(this.unlockedConceptIds); }
    getUnlockedArtifacts() { return Array.from(this.unlockedArtifactIds); }

    // --- Milestones ---
    updateMilestoneProgress(actionName, count = 1, context = null) {
        if (!Data || !Data.milestones) return; // Guard against data not loaded
        let milestoneCompleted = false;
         Data.milestones.forEach(milestone => {
             if (this.completedMilestoneIds.has(milestone.id)) return;
             if (milestone.track.action === actionName) {
                 const progressKey = `${milestone.id}_actionCount`;
                 const currentCount = (this.milestoneProgress[progressKey] || 0) + count;
                 this.milestoneProgress[progressKey] = currentCount;
                 if (currentCount >= milestone.track.threshold)
        try {
            for (const key of keys) { if (value === undefined || value === null) return 0; value = value[key]; }
            if (keys[0] === 'attunementBonus' && keys.length === 2 && keys[1] !== 'All') { value = (value || 0) + (this.permanentUpgrades.attunementBonus?.All || 0); }
            return value || 0;
        } catch (error) { return 0; }
     }

    /** Helper to generate reward description for notifications */
     getRewardDescription(reward) {
         switch (reward.type) {
             case 'insight': return `${reward.amount} Insight`; case 'attunement': return `+${reward.amount} ${reward.element} Attunement`; case 'increaseFocusSlots': return `+${reward.amount} Focus Slot`; case 'increaseMaxIntegrity': return `+${reward.amount} Max Integrity`; case 'increaseStartingInsight': return `+${reward.amount} Starting Insight`; case 'increaseCardRewardChoices': return `+${reward.amount} Card Reward Choice`; case 'unlockCard': const card = Data.concepts.find(c => c.id === reward.conceptId); return `Unlocked Concept: ${card?.name || 'Unknown'}`; case 'unlockArtifact': const artifact = ARTIFACT_TEMPLATES[reward.artifactId]; return `Unlocked Relic: ${artifact?.name || 'Unknown'}`; default: return `Unknown Reward`;
         }
     }

} // End of MetaProgression class
