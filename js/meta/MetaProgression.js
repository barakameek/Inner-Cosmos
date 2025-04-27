// js/meta/MetaProgression.js

// Import data - needs milestones, concepts, card pools
import * as Data from '../../data.js'; // Correct path from js/meta to root

// Import artifact definitions - needs access for unlocks, rewards
import { ARTIFACT_TEMPLATES } from '../core/ArtifactDefinitions.js'; // Correct path

// --- Constants ---
const SAVE_KEY = 'personaLabyrinth_metaProgress_v1.3'; // Updated version key for new structure
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
        this.currentAscension = 0;
        this.highestAscensionBeat = -1;

        // Runtime tracking for action-based milestones (reset per run needed externally)
        this.milestoneProgress = {}; // { milestoneId_actionCount: currentCount }

        this.load(); // Load saved data OVER defaults

        // Initialize basic unlocks (only if sets are still empty after load)
        try {
            if (Data?.concepts && ARTIFACT_TEMPLATES) {
                this._initializeDefaultUnlocks();
            } else {
                console.error("MetaProgression FATAL: Cannot initialize defaults - Data.js or ArtifactDefinitions.js not loaded correctly!");
            }
        } catch (error) {
            console.error("Error during MetaProgression default unlock initialization:", error);
        }

        console.log("MetaProgression initialized.");
    }

    /** Initializes default unlocked concepts/artifacts if none are saved. */
    _initializeDefaultUnlocks() {
        let changed = false;

        if (Data?.concepts && this.unlockedConceptIds.size === 0) {
            console.log("MetaProgression: Performing first-time default concept unlocks...");
            Data.concepts.forEach(concept => {
                // Unlock starters and commons automatically
                if (concept.rarity === 'starter' || concept.rarity === 'common') {
                    this.unlockedConceptIds.add(concept.id);
                    changed = true;
                }
            });
            // Explicitly unlock a few core uncommons
            const coreUncommons = [4, 5, 15]; // Dom(Psych), Sub(Psych), Deep Intimacy
            coreUncommons.forEach(id => {
                if (Data.concepts.some(c => c.id === id)) {
                    this.unlockedConceptIds.add(id);
                    changed = true;
                }
            });
             console.log(`MetaProgression: Unlocked ${this.unlockedConceptIds.size} default/core concepts.`);
        }

         if (ARTIFACT_TEMPLATES && this.unlockedArtifactIds.size === 0) {
             console.log("MetaProgression: Performing first-time default artifact unlocks...");
             const defaultArtifacts = ['insight_fragment_a', 'comforting_touch_s']; // Example defaults
             defaultArtifacts.forEach(artId => {
                  if (ARTIFACT_TEMPLATES[artId]) {
                       this.unlockedArtifactIds.add(artId);
                       changed = true;
                  }
             });
             if (changed) console.log(`MetaProgression: Unlocked ${this.unlockedArtifactIds.size} default artifacts.`);
         }

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
                this.unlockedConceptIds = new Set(Array.isArray(parsedData.unlockedConceptIds) ? parsedData.unlockedConceptIds : []);
                this.unlockedArtifactIds = new Set(Array.isArray(parsedData.unlockedArtifactIds) ? parsedData.unlockedArtifactIds : []);
                this.completedMilestoneIds = new Set(Array.isArray(parsedData.completedMilestoneIds) ? parsedData.completedMilestoneIds : []);
                this.permanentUpgrades = this._mergeDeep(this.getDefaultUpgrades(), parsedData.permanentUpgrades || {});
                this.currentAscension = parsedData.currentAscension || 0;
                this.highestAscensionBeat = parsedData.highestAscensionBeat ?? -1;
                console.log("MetaProgression loaded successfully.");
            } catch (error) {
                console.error("MetaProgression Error: Failed to parse saved data. Resetting to defaults.", error);
                this._resetToDefaults(); // Use internal reset helper
            }
        } else {
            console.log("MetaProgression: No saved data found. Using defaults.");
            this._resetToDefaults(); // Ensure defaults are set if no save exists
        }
    }

    /** Resets internal state variables to default values. */
    _resetToDefaults() {
        this.totalInsight = 0;
        this.unlockedConceptIds = new Set();
        this.unlockedArtifactIds = new Set();
        this.completedMilestoneIds = new Set();
        this.permanentUpgrades = this.getDefaultUpgrades();
        this.currentAscension = 0;
        this.highestAscensionBeat = -1;
        this.milestoneProgress = {};
    }

    /** Helper for safely merging nested objects during load */
    _mergeDeep(target, source) {
        // ... (keep the _mergeDeep implementation from previous version) ...
        const isObject = (obj) => obj && typeof obj === 'object' && !Array.isArray(obj);
        if (!isObject(target) || !isObject(source)) { return source; }
        Object.keys(source).forEach(key => {
            const targetValue = target[key]; const sourceValue = source[key];
            if (isObject(sourceValue)) {
                if (!isObject(targetValue)) { target[key] = {}; }
                this._mergeDeep(target[key], sourceValue);
            } else if (sourceValue !== undefined) { target[key] = sourceValue; }
        });
        return target;
     }

    /** Returns a deep copy of the default structure for permanent upgrades */
    getDefaultUpgrades() {
         // ... (keep the getDefaultUpgrades implementation from previous version) ...
         return JSON.parse(JSON.stringify({
             maxIntegrityBonus: 0, startingFocusBonus: 0, focusSlotsBonus: 0,
             startingInsightBonus: 0, cardRewardChoicesBonus: 0,
             shopArtifactChoicesBonus: 0, shopRemovalCostIncrease: 0,
             attunementBonus: { Attraction: 0, Interaction: 0, Sensory: 0, Psychological: 0, Cognitive: 0, Relational: 0, RoleFocus: 0, All: 0 }
         }));
     }

    /** Saves the current progress to localStorage. */
    save() {
        // ... (keep the save implementation from previous version) ...
        try {
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
        } catch (error) { console.error("MetaProgression Error: Failed to save progress:", error); }
    }

    /** Resets all meta progression after user confirmation. */
    resetProgress() {
         if (!window.confirm("!! WARNING !!\n\nAre you sure you want to reset ALL permanent progress (unlocks, insight, upgrades)?\n\nThis action CANNOT be undone.")) {
             console.log("Meta progression reset cancelled by user."); return;
         }
         console.warn("MetaProgression: Resetting all permanent progress!");
         this._resetToDefaults(); // Reset variables
         localStorage.removeItem(SAVE_KEY); // Clear storage
         try { // Re-initialize default unlocks
             if (Data?.concepts && ARTIFACT_TEMPLATES) { this._initializeDefaultUnlocks(); }
             else { console.error("MetaProgression Reset Error: Cannot re-initialize defaults - Data missing!"); }
         } catch (error) { console.error("Error during default unlock initialization after reset:", error); }
         this.save(); // Save the reset state
         console.log("MetaProgression: Progress has been reset.");
         alert("Meta progression has been reset successfully.");
         window.location.reload(); // Force reload
     }

    // --- Currency ---
    addInsight(amount) { /* ... keep ... */
        if (typeof amount !== 'number' || amount <= 0) return;
        this.totalInsight = (this.totalInsight || 0) + amount;
        this.checkMilestonesOnInsightChange();
        this.save();
    }
    spendInsight(amount) { /* ... keep ... */
        if (typeof amount !== 'number' || amount <= 0) return false;
        if ((this.totalInsight || 0) >= amount) {
            this.totalInsight -= amount;
            this.save(); return true;
        }
        return false;
    }

    // --- Unlocks ---
    unlockConcept(conceptId) { /* ... keep, ensure Data?.concepts check ... */
        if (!Data?.concepts) { console.error("MetaProgression Error: Data.concepts not available for unlockConcept."); return false; }
        if (this.unlockedConceptIds.has(conceptId)) return false;
        const concept = Data.concepts.find(c => c.id === conceptId);
        if (!concept) { console.warn(`MetaProgression: Attempted to unlock invalid concept ID: ${conceptId}`); return false; }
        this.unlockedConceptIds.add(conceptId);
        console.log(`Concept unlocked: ${concept.name} (ID: ${conceptId})`);
        this.save(); return true;
     }
    unlockArtifact(artifactId) { /* ... keep, ensure ARTIFACT_TEMPLATES check ... */
        if (!ARTIFACT_TEMPLATES) { console.error("MetaProgression Error: ARTIFACT_TEMPLATES not available for unlockArtifact."); return false; }
        if (this.unlockedArtifactIds.has(artifactId)) return false;
        const artifact = ARTIFACT_TEMPLATES[artifactId];
        if (!artifact) { console.warn(`MetaProgression: Attempted to unlock invalid artifact ID: ${artifactId}`); return false; }
        this.unlockedArtifactIds.add(artifactId);
        console.log(`Artifact unlocked: ${artifact.name} (ID: ${artifactId})`);
        this.save(); return true;
     }
     // Added batch unlock method
     unlockConcepts(conceptIdArray) {
        if (!Data?.concepts || !Array.isArray(conceptIdArray)) return false;
        let changed = false;
        conceptIdArray.forEach(id => {
            if (!this.unlockedConceptIds.has(id) && Data.concepts.some(c => c.id === id)) {
                this.unlockedConceptIds.add(id);
                console.log(`   Pool Unlock: Concept ${id}`);
                changed = true;
            }
        });
        if (changed) this.save();
        return changed;
     }

    isConceptUnlocked(conceptId) { return this.unlockedConceptIds.has(conceptId); }
    isArtifactUnlocked(artifactId) { return this.unlockedArtifactIds.has(artifactId); }
    getUnlockedConcepts() { return Array.from(this.unlockedConceptIds); }
    getUnlockedArtifacts() { return Array.from(this.unlockedArtifactIds); }

    // --- Milestones ---
    /** Tracks progress towards action-based milestones. */
    updateMilestoneProgress(actionName, value = 1, context = null) { // Value can be count or specific value
        if (!Data?.milestones) { console.error("MetaProgression Error: Milestone data not loaded."); return; }

        let needsSave = false;
         Data.milestones.forEach(milestone => {
            if (this.completedMilestoneIds.has(milestone.id) || milestone.track?.action !== actionName) return;

            const track = milestone.track;
            let progressMade = false;

            // Handle different tracking types (count vs. value)
            if (track.value !== undefined) { // Tracks achieving a specific value (e.g., deal 50 damage)
                if (value >= track.value) {
                    progressMade = true; // Condition met if action value meets threshold
                }
            } else { // Tracks completing an action X times (default)
                const progressKey = `${milestone.id}_actionCount`;
                const currentCount = (this.milestoneProgress[progressKey] || 0) + value; // Use value as count increment
                this.milestoneProgress[progressKey] = currentCount;
                if (currentCount >= (track.count || track.threshold || 1)) { // Use count or threshold
                    progressMade = true;
                }
            }

            // Check context and complete if progress made
            if (progressMade && this._checkMilestoneContext(track, context)) {
                if (this.completeMilestone(milestone)) {
                    needsSave = true;
                }
            }
         });
         if (needsSave) this.save();
    }

    /** Helper to check context conditions for milestones */
     _checkMilestoneContext(trackData, context) { /* ... keep ... */
         if (!trackData?.condition || !context) return true;
         try {
             switch(trackData.condition) {
                 case 'level3': return context?.level === 3;
                 case 'anyLevel': return context?.level !== undefined && context?.level !== null;
                 case 'conceptRarity': return context?.rarity === trackData.value;
                 case 'elementType': return context?.element === trackData.value;
                 default: console.warn(`MetaProgression: Unknown milestone condition type: ${trackData.condition}`); return true;
             }
         } catch (error) { console.error("Error checking milestone context:", error, trackData, context); return false; }
     }

    /** Checks state-based milestones (e.g., total insight, unlocks). */
    checkStateBasedMilestones(currentGameState = null) {
        if (!Data?.milestones) { console.error("MetaProgression Error: Milestone data not loaded."); return; }

        let needsSave = false;
        const player = currentGameState?.player;

         Data.milestones.forEach(milestone => {
             if (this.completedMilestoneIds.has(milestone.id) || !milestone.track?.state) return;

             let conditionMet = false;
             const stateKey = milestone.track.state;
             const threshold = milestone.track.threshold ?? 1;
             const trackCondition = milestone.track.condition;
             const trackElement = milestone.track.element;

             try {
                 switch(stateKey) {
                     case 'unlockedConcepts.size': conditionMet = (this.unlockedConceptIds?.size || 0) >= threshold; break;
                     case 'unlockedArtifacts.size': conditionMet = (this.unlockedArtifactIds?.size || 0) >= threshold; break;
                     case 'totalInsight': conditionMet = (this.totalInsight || 0) >= threshold; break;
                     // Player state checks (require gameState)
                     case 'playerMaxFocus': if (player) conditionMet = (player.maxFocus || 0) >= threshold; break;
                     case 'playerMaxIntegrity': if (player) conditionMet = (player.maxIntegrity || 0) >= threshold; break;
                     case 'playerAttunement': // Renamed from elementAttunement for clarity
                         if (player?.attunements) {
                              if (trackElement && trackCondition === 'specific') { conditionMet = (player.attunements[trackElement] || 0) >= threshold; }
                              else if (trackCondition === 'any') { conditionMet = Object.values(player.attunements).some(att => (att || 0) >= threshold); }
                              else if (trackCondition === 'all') { conditionMet = Object.values(player.attunements).every(att => (att || 0) >= threshold); }
                         } break;
                     // Add other state checks here...
                     default: break;
                 }
             } catch (error) { console.error(`Error checking state milestone ${milestone.id} ('${stateKey}'):`, error); }

             if (conditionMet) { if (this.completeMilestone(milestone)) { needsSave = true; } }
         });
          if (needsSave) this.save();
     }

    /** Completes a milestone, applies reward, and updates state. */
    completeMilestone(milestone) {
        if (!milestone || !milestone.id) { console.error("Invalid milestone object passed."); return false; }
        if (this.completedMilestoneIds.has(milestone.id)) return false;

        console.log(`%cMilestone Completed: ${milestone.id} - ${milestone.description}`, "color: #f1c40f; font-weight: bold;");
        this.completedMilestoneIds.add(milestone.id);
        let needsSave = false; // Flag if save is needed due to non-insight reward

        if (milestone.reward) {
            const reward = milestone.reward;
            try {
                const rewardDesc = this.getRewardDescription(reward); // Get description before applying
                let rewardApplied = true; // Assume success unless specific types fail

                switch (reward.type) {
                    case 'insight': this.addInsight(reward.amount); rewardApplied = false; break; // addInsight saves
                    case 'attunement':
                        const element = reward.element;
                        if (element === 'All') { this.applyPermanentUpgrade('attunementBonus.All', reward.amount); }
                        else if (this.permanentUpgrades.attunementBonus?.hasOwnProperty(element)) { this.applyPermanentUpgrade(`attunementBonus.${element}`, reward.amount); }
                        else { console.warn(`Invalid element '${element}' for reward in milestone ${milestone.id}`); rewardApplied = false; break; }
                        needsSave = true; break;
                    case 'increaseFocusSlots': this.applyPermanentUpgrade('focusSlotsBonus', reward.amount); needsSave = true; break;
                    case 'increaseMaxIntegrity': this.applyPermanentUpgrade('maxIntegrityBonus', reward.amount); needsSave = true; break;
                    case 'increaseStartingFocus': this.applyPermanentUpgrade('startingFocusBonus', reward.amount); needsSave = true; break; // Added case
                    case 'increaseStartingInsight': this.applyPermanentUpgrade('startingInsightBonus', reward.amount); needsSave = true; break;
                    case 'increaseCardRewardChoices': this.applyPermanentUpgrade('cardRewardChoicesBonus', reward.amount); needsSave = true; break;
                    case 'increaseShopArtifactChoices': this.applyPermanentUpgrade('shopArtifactChoicesBonus', reward.amount); needsSave = true; break;
                    case 'increaseShopRemovalCost': this.applyPermanentUpgrade('shopRemovalCostIncrease', reward.amount); needsSave = true; break;
                    // Unlocks handle their own saving
                    case 'discoverCard': case 'unlockCard': rewardApplied = this.unlockConcept(reward.conceptId || reward.cardId); break;
                    case 'discoverMultipleCards': rewardApplied = this.unlockConcepts(reward.cardIds); break;
                    case 'unlockArtifact': rewardApplied = this.unlockArtifact(reward.artifactId); break;
                    // --- NEW: Unlock Card Pool ---
                    case 'unlockCardPool':
                        const poolKey = reward.poolKey;
                        const conceptIdsToUnlock = Data?.cardPools?.[poolKey]; // Safely access pool
                        if (poolKey && conceptIdsToUnlock) {
                            console.log(`Milestone unlocking card pool: ${poolKey}`);
                            rewardApplied = this.unlockConcepts(conceptIdsToUnlock); // unlockConcepts handles saving
                        } else {
                            console.warn(`Card pool key '${poolKey}' not found or invalid in milestone ${milestone.id}`);
                            rewardApplied = false;
                        }
                        break;
                    default: console.warn(`Unknown reward type in milestone ${milestone.id}: ${reward.type}`); rewardApplied = false;
                }

                // Show notification only if reward was successfully applied
                if(rewardApplied && this.gameStateRef?.uiManager) { // Check UIManager link
                     this.gameStateRef.uiManager.showNotification(`Milestone: ${rewardDesc}!`);
                } else if (rewardApplied) {
                     console.log(`Milestone Reward Applied: ${rewardDesc}`); // Fallback log
                }

            } catch (error) { console.error(`Error applying reward for milestone ${milestone.id}:`, error, reward); }
        }
        return needsSave; // Return whether the main save in the calling function is needed
    }

    /** Convenience method called by addInsight to check relevant milestones. */
    checkMilestonesOnInsightChange() { this.checkStateBasedMilestones(); }

    // --- Permanent Upgrades ---
    applyPermanentUpgrade(upgradeKey, amount) { /* ... keep ... */
         if (typeof amount !== 'number' || amount === 0) return;
         if (!upgradeKey || typeof upgradeKey !== 'string') { console.error("Invalid upgradeKey provided."); return; }
         const keys = upgradeKey.split('.'); let target = this.permanentUpgrades;
         try {
             for (let i = 0; i < keys.length - 1; i++) {
                 if (target === undefined || typeof target !== 'object') throw new Error(`Invalid path segment '${keys[i]}'`);
                 target = target[keys[i]];
             }
             const finalKey = keys[keys.length - 1];
             if (target === undefined || typeof target !== 'object' || !target.hasOwnProperty(finalKey)) throw new Error(`Invalid final key '${finalKey}'`);
             target[finalKey] = (target[finalKey] || 0) + amount;
             console.log(`MetaProgression: Applied permanent upgrade: ${upgradeKey} +${amount}. New value: ${target[finalKey]}`);
         } catch (error) { console.error(`MetaProgression Error: Failed to apply permanent upgrade '${upgradeKey}':`, error); }
    }
    getStartingBonus(bonusKey) { /* ... keep ... */
        if (!bonusKey || typeof bonusKey !== 'string') return 0;
        const keys = bonusKey.split('.'); let value = this.permanentUpgrades;
        try {
            for (const key of keys) { if (value === undefined || value === null) return 0; value = value[key]; }
            const baseValue = value || 0;
            if (keys.length === 2 && keys[0] === 'attunementBonus' && keys[1] !== 'All') {
                const allBonus = this.permanentUpgrades?.attunementBonus?.All || 0;
                return baseValue + allBonus;
            } return baseValue;
        } catch (error) { console.error(`Error getting starting bonus for key '${bonusKey}':`, error); return 0; }
     }
    getRewardDescription(reward) { /* ... keep, ensure Data?.cardPools check for new type ... */
        if (!reward || !reward.type) return "Unknown Reward";
        try {
            switch (reward.type) {
                case 'insight': return `${reward.amount} Insight`;
                case 'attunement': return `+${reward.amount} ${reward.element || '?'} Attunement`;
                case 'increaseFocusSlots': return `+${reward.amount} Focus Slot`;
                case 'increaseMaxIntegrity': return `+${reward.amount} Max Integrity`;
                case 'increaseStartingFocus': return `+${reward.amount} Starting Focus`; // Added case
                case 'increaseStartingInsight': return `+${reward.amount} Starting Insight`;
                case 'increaseCardRewardChoices': return `+${reward.amount} Card Reward Choice`;
                case 'increaseShopArtifactChoices': return `+${reward.amount} Shop Relic Choice`;
                case 'increaseShopRemovalCost': return `+${reward.amount} Shop Removal Cost`;
                case 'discoverCard': case 'unlockCard': const card = Data?.concepts?.find(c => c.id === (reward.conceptId || reward.cardId)); return `Unlocked Concept: ${card?.name || '?'}`;
                case 'discoverMultipleCards': return `Unlocked Multiple Concepts`;
                case 'unlockArtifact': const artifact = ARTIFACT_TEMPLATES ? ARTIFACT_TEMPLATES[reward.artifactId] : null; return `Unlocked Relic: ${artifact?.name || '?'}`;
                case 'unlockCardPool': return `Unlocked '${reward.poolKey || '?'}' Card Pool`; // Added case
                default: return `Unknown Reward (${reward.type})`;
            }
        } catch (e) { console.error("Error generating reward description:", e); return "Reward Data Error"; }
     }

} // End of MetaProgression class
