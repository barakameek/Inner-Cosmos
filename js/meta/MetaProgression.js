// js/meta/MetaProgression.js

// Import data - needs access to milestones, concepts, etc.
// Path goes UP from 'meta' to 'js', then UP from 'js' to root
import * as Data from '../../data.js';

// Import artifact definitions - needs access for unlocks, maybe rewards
// Path goes UP from 'meta' to 'js', then DOWN into 'core'
import { ARTIFACT_TEMPLATES } from '../core/ArtifactDefinitions.js';

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
        // Structure for permanent upgrades - values are the *bonus* amount
        this.permanentUpgrades = this.getDefaultUpgrades(); // Initialize with defaults
        this.currentAscension = 0;
        this.highestAscensionBeat = -1; // Track highest level actually won

        // Runtime tracking (not saved directly, but used for checking milestones)
        this.milestoneProgress = {}; // { milestoneId: currentCount }

        this.load(); // Load saved data OVER defaults

        // Initialize basic unlocks ONLY if loading didn't populate them (first time run)
        // Check if Data is loaded before trying to use it
        if (Data && Data.concepts && ARTIFACT_TEMPLATES) {
             this._initializeDefaultUnlocks();
        } else {
            // This indicates a serious loading problem BEFORE MetaProgression runs
            console.error("MetaProgression FATAL: Cannot initialize defaults - Data.js or ArtifactDefinitions.js not loaded correctly!");
        }

        console.log("MetaProgression initialized.");
    }

    /** Initializes default unlocked concepts/artifacts if none are saved. */
    _initializeDefaultUnlocks() {
        // This should only run if the sets are empty AFTER loading
        let changed = false;
        if (this.unlockedConceptIds.size === 0 && Data?.concepts) { // Check Data again
            console.log("Performing first-time default concept unlocks...");
            Data.concepts.forEach(concept => {
                if (concept.rarity === 'common') {
                    this.unlockedConceptIds.add(concept.id);
                    changed = true;
                }
            });
             const idsToUnlock = [2, 4, 5, 15]; // Sensual Touch, Dom, Sub, Deep Intimacy
             idsToUnlock.forEach(id => { if(Data.concepts.find(c=>c.id===id)) { this.unlockedConceptIds.add(id); changed = true; } });
             console.log(`Unlocked ${this.unlockedConceptIds.size} default concepts.`);
        }

         if (this.unlockedArtifactIds.size === 0 && ARTIFACT_TEMPLATES) { // Check Artifact Defs
             console.log("Performing first-time default artifact unlocks...");
             if (ARTIFACT_TEMPLATES['insight_fragment_a']) { this.unlockedArtifactIds.add('insight_fragment_a'); changed = true; }
             // Add other defaults if desired
             if (changed) console.log(`Unlocked ${this.unlockedArtifactIds.size} default artifacts.`);
         }
         // Save ONLY if defaults were actually added
         if (changed) this.save();
    }

    /** Loads progress from localStorage. */
    load() {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                this.totalInsight = parsedData.totalInsight || 0;
                this.unlockedConceptIds = new Set(parsedData.unlockedConceptIds || []);
                this.unlockedArtifactIds = new Set(parsedData.unlockedArtifactIds || []);
                this.completedMilestoneIds = new Set(parsedData.completedMilestoneIds || []);
                // Use deep merge ensuring the DEFAULT structure exists first
                this.permanentUpgrades = this._mergeDeep(this.getDefaultUpgrades(), parsedData.permanentUpgrades || {});
                this.currentAscension = parsedData.currentAscension || 0;
                this.highestAscensionBeat = parsedData.highestAscensionBeat ?? -1; // Use ?? for nullish coalescing
                console.log("MetaProgression loaded successfully.");
            } catch (error) {
                console.error("Failed to parse saved meta progression:", error);
                // Reset to defaults ONLY if parsing fails, keep current state otherwise if load() called again
                this.permanentUpgrades = this.getDefaultUpgrades(); // Reset upgrades structure
                // Let constructor handle default unlocks if sets are now empty
            }
        } else {
            console.log("No saved meta progression found. Defaults will be used/initialized.");
            // No need to reset here, constructor already set defaults
        }
    }

    /** Helper for merging nested objects during load */
    _mergeDeep(target, source) {
        const isObject = (obj) => obj && typeof obj === 'object' && !Array.isArray(obj);
        if (!isObject(target) || !isObject(source)) return source; // Basic safety check

        Object.keys(source).forEach(key => {
            const targetValue = target[key];
            const sourceValue = source[key];

            if (isObject(sourceValue)) {
                // Ensure target key exists and is an object before recursing
                if (!isObject(targetValue)) {
                    target[key] = {};
                }
                this._mergeDeep(target[key], sourceValue);
            } else if (sourceValue !== undefined) { // Only overwrite/add if source has value
                target[key] = sourceValue;
            }
        });
        return target;
     }

    /** Returns the default structure for permanent upgrades */
    getDefaultUpgrades() {
         // Make sure this returns a NEW object each time to avoid reference issues
         return JSON.parse(JSON.stringify({
             maxIntegrityBonus: 0, startingFocusBonus: 0, focusSlotsBonus: 0,
             startingInsightBonus: 0, cardRewardChoicesBonus: 0,
             attunementBonus: { Attraction: 0, Interaction: 0, Sensory: 0, Psychological: 0, Cognitive: 0, Relational: 0, RoleFocus: 0, All: 0 }
         }));
     }

    /** Saves the current progress to localStorage. */
    save() {
        try {
            // Ensure nested objects exist before trying to access properties
            const upgradesToSave = this.permanentUpgrades || this.getDefaultUpgrades();

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
            // console.log("MetaProgression saved."); // Less noisy
        } catch (error) {
            console.error("Failed to save meta progression:", error);
        }
    }

    /** Resets all meta progression (USE WITH CAUTION). */
    resetProgress() {
         if (!confirm("Are you sure you want to reset ALL permanent progress? This cannot be undone.")) {
             return; // Abort if user cancels
         }
         console.warn("Resetting all meta progression!");
        this.totalInsight = 0; this.unlockedConceptIds = new Set(); this.unlockedArtifactIds = new Set();
        this.completedMilestoneIds = new Set(); this.permanentUpgrades = this.getDefaultUpgrades(); // Reset to defaults
        this.currentAscension = 0; this.highestAscensionBeat = -1; this.milestoneProgress = {};
        localStorage.removeItem(SAVE_KEY);
        // Re-initialize defaults, checking data is loaded
        if (Data && Data.concepts && ARTIFACT_TEMPLATES) {
             this._initializeDefaultUnlocks();
        }
        this.save(); // Save the reset state
        console.log("Meta progression has been reset.");
        alert("Meta progress reset successfully."); // User feedback
     }

    // --- Currency ---
    addInsight(amount) {
        if (amount > 0) { this.totalInsight = (this.totalInsight || 0) + amount; this.checkMilestonesOnInsightChange(); this.save(); }
     }
    spendInsight(amount) {
        if (amount > 0 && (this.totalInsight || 0) >= amount) { this.totalInsight -= amount; this.save(); return true; } return false;
     }

    // --- Unlocks ---
    unlockConcept(conceptId) {
        // Ensure Data is loaded before checking concepts
        if (!Data || !Data.concepts) return false;
        if (!this.unlockedConceptIds.has(conceptId)) { const conceptExists = Data.concepts.some(c => c.id === conceptId); if (!conceptExists) { console.warn(`Attempted unlock invalid concept ${conceptId}`); return false; } this.unlockedConceptIds.add(conceptId); this.save(); return true; } return false;
     }
    unlockArtifact(artifactId) {
        // Ensure templates are loaded
        if (!ARTIFACT_TEMPLATES) return false;
        if (!this.unlockedArtifactIds.has(artifactId)) { if (!ARTIFACT_TEMPLATES[artifactId]) { console.warn(`Attempted unlock invalid artifact ${artifactId}`); return false; } this.unlockedArtifactIds.add(artifactId); this.save(); return true; } return false;
     }
    isConceptUnlocked(conceptId) { return this.unlockedConceptIds.has(conceptId); }
    isArtifactUnlocked(artifactId) { return this.unlockedArtifactIds.has(artifactId); }
    getUnlockedConcepts() { return Array.from(this.unlockedConceptIds); }
    getUnlockedArtifacts() { return Array.from(this.unlockedArtifactIds); }

    // --- Milestones ---
    updateMilestoneProgress(actionName, count = 1, context = null) {
        // Guard against data/milestones not being loaded
        if (!Data || !Data.milestones) { console.error("Milestone data not loaded, cannot update progress."); return; }
        let milestoneCompleted = false;
         Data.milestones.forEach(milestone => {
             if (this.completedMilestoneIds.has(milestone.id)) return;
             if (milestone.track.action === actionName) {
                 const progressKey = `${milestone.id}_actionCount`;
                 const currentCount = (this.milestoneProgress[progressKey] || 0) + count;
                 this.milestoneProgress[progressKey] = currentCount;
                 if (currentCount >= (milestone.track.threshold || 1)) { // Use threshold or default to 1
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
             default: console.warn(`Unknown milestone condition: ${trackData.condition}`); return true;
         }
     }

    /** Check state-based milestones */
    checkStateBasedMilestones(currentGameState = null) {
        // Guard against data/milestones not being loaded
        if (!Data || !Data.milestones) { console.error("Milestone data not loaded, cannot check state."); return; }
        let milestoneCompleted = false; const player = currentGameState?.player;

         Data.milestones.forEach(milestone => {
             if (this.completedMilestoneIds.has(milestone.id) || !milestone.track.state) return;
             let conditionMet = false; const stateKey = milestone.track.state; const threshold = milestone.track.threshold || 1; // Default threshold 1
             try {
                 switch(stateKey) {
                     case 'discoveredConcepts.size': conditionMet = (this.unlockedConceptIds?.size || 0) >= threshold; break;
                     case 'focusedConcepts.size': if (player?.focusedConcepts) conditionMet = player.focusedConcepts.length >= threshold; break;
                     case 'elementAttunement': if (player?.attunements) { if (milestone.track.condition === 'any') conditionMet = Object.values(player.attunements).some(att => att >= threshold); else if (milestone.track.condition === 'all') conditionMet = Object.values(player.attunements).every(att => att >= threshold); } break;
                     case 'totalInsight': conditionMet = (this.totalInsight || 0) >= threshold; break;
                     // Add other state checks here...
                     default: /* console.warn(`State check for '${stateKey}' not implemented.`); */ break;
                 }
             } catch (error) { console.error(`Error checking state milestone ${milestone.id}:`, error); }
             if (conditionMet) { if (this.completeMilestone(milestone)) milestoneCompleted = true; }
         });
          if (milestoneCompleted) this.save();
     }

    /** Complete a milestone, apply reward, save state */
    completeMilestone(milestone) {
        if (!milestone || this.completedMilestoneIds.has(milestone.id)) return false;
        console.log(`%cMilestone Completed: ${milestone.id} - ${milestone.description}`, "color: #f1c40f; font-weight: bold;");
        this.completedMilestoneIds.add(milestone.id);
        let appliedReward = false;
        if (milestone.reward) {
            appliedReward = true; const reward = milestone.reward;
            try { // Wrap reward application
                switch (reward.type) {
                    case 'insight': this.addInsight(reward.amount); appliedReward = false; break; // addInsight saves
                    case 'attunement': const element = reward.element; if (element === 'All') this.applyPermanentUpgrade('attunementBonus.All', reward.amount); else if (this.permanentUpgrades.attunementBonus?.hasOwnProperty(element)) this.applyPermanentUpgrade(`attunementBonus.${element}`, reward.amount); else { console.warn(`Invalid element ${element} for milestone ${milestone.id}`); appliedReward = false; } break;
                    case 'increaseFocusSlots': this.applyPermanentUpgrade('focusSlotsBonus', reward.amount); break;
                    case 'increaseMaxIntegrity': this.applyPermanentUpgrade('maxIntegrityBonus', reward.amount); break;
                    case 'increaseStartingInsight': this.applyPermanentUpgrade('startingInsightBonus', reward.amount); break;
                    case 'increaseCardRewardChoices': this.applyPermanentUpgrade('cardRewardChoicesBonus', reward.amount); break;
                    case 'unlockCard': if (!this.unlockConcept(reward.conceptId)) appliedReward = false; break; // unlockConcept saves
                    case 'unlockArtifact': if (!this.unlockArtifact(reward.artifactId)) appliedReward = false; break; // unlockArtifact saves
                    default: console.warn(`Unknown reward type: ${reward.type}`); appliedReward = false;
                }
                // Trigger UI notification via debug object or event system later
                // if(appliedReward && window.personaLab?.uiManager) { window.personaLab.uiManager.showNotification(`Milestone: ${this.getRewardDescription(reward)}`); }
            } catch (error) {
                 console.error(`Error applying reward for milestone ${milestone.id}:`, error);
                 appliedReward = false; // Don't count as applied if error occurs
            }
        }
        return appliedReward; // Return true if save needed due to non-insight reward
    }

    checkMilestonesOnInsightChange() { this.checkStateBasedMilestones(); }

    // --- Permanent Upgrades ---
    applyPermanentUpgrade(upgradeKey, amount) {
         const keys = upgradeKey.split('.'); let target = this.permanentUpgrades;
         try {
             for (let i = 0; i < keys.length - 1; i++) { if (target === undefined) throw new Error(`Invalid path`); target = target[keys[i]]; }
             const finalKey = keys[keys.length - 1];
             if (target === undefined || typeof target !== 'object') throw new Error(`Invalid target for key ${finalKey}`);
             target[finalKey] = (target[finalKey] || 0) + amount;
             console.log(`Applied permanent upgrade: ${upgradeKey} +${amount}. New value: ${target[finalKey]}`);
             // Save is handled by the calling function (e.g., completeMilestone)
         } catch (error) { console.error(`Error applying permanent upgrade ${upgradeKey}:`, error); }
    }

    getStartingBonus(bonusKey) {
        const keys = bonusKey.split('.'); let value = this.permanentUpgrades;
        try {
            for (const key of keys) { if (value === undefined || value === null) return 0; value = value[key]; }
            // Special handling for attunement 'All' bonus
            if (keys[0] === 'attunementBonus' && keys.length === 2 && keys[1] !== 'All') { value = (value || 0) + (this.permanentUpgrades.attunementBonus?.All || 0); }
            return value || 0; // Return 0 if value is undefined/null at the end
        } catch (error) { return 0; } // Return 0 on error accessing path
     }

    /** Helper to generate reward description for notifications */
     getRewardDescription(reward) {
        if (!reward) return "Unknown Reward";
         try { // Add try-catch for safety if Data/ARTIFACT_TEMPLATES aren't loaded
             switch (reward.type) {
                 case 'insight': return `${reward.amount} Insight`; case 'attunement': return `+${reward.amount} ${reward.element} Attunement`; case 'increaseFocusSlots': return `+${reward.amount} Focus Slot`; case 'increaseMaxIntegrity': return `+${reward.amount} Max Integrity`; case 'increaseStartingInsight': return `+${reward.amount} Starting Insight`; case 'increaseCardRewardChoices': return `+${reward.amount} Card Reward Choice`; case 'unlockCard': const card = Data?.concepts?.find(c => c.id === reward.conceptId); return `Unlocked: ${card?.name || 'Concept'}`; case 'unlockArtifact': const artifact = ARTIFACT_TEMPLATES ? ARTIFACT_TEMPLATES[reward.artifactId] : null; return `Unlocked: ${artifact?.name || 'Relic'}`; default: return `Unknown Reward (${reward.type})`;
             }
         } catch(e) { return "Reward Data Error"; }
     }

} // End of MetaProgression class
