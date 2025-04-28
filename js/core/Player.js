// js/core/Player.js

import { DeckManager } from './DeckManager.js';
import { Artifact } from './Artifact.js';
import { Card } from './Card.js'; // Needed for potential effects/status cards
import * as Data from '../../data.js'; // For default deck/attunements

// --- Constants ---
const BASE_FOCUS = 3;
const BASE_INTEGRITY = 70;
const CORE_TRAIT_THRESHOLD = 10; // Attunement level needed for core traits

/**
 * Represents the player character during a run.
 * Manages stats, status effects, artifacts, and deck interactions.
 */
export class Player {
    constructor(playerData = {}, metaProgression = null) {
        console.log("Creating Player instance with data:", playerData);
        this.gameStateRef = null; // Set by GameState after creation

        // --- Core Identity ---
        this.name = playerData?.name || "Alchemist"; // Allow setting name via playerData later?

        // --- Attunements (Order of Application Matters!) ---
        const baseAttunements = this.getDefaultAttunements();
        this.attunements = { ...baseAttunements }; // Start with base defaults

        // 1. Apply QUIZ bonuses FIRST if they exist in playerData
        if (playerData?.attunements) {
            console.log("Player Constructor: Applying quiz attunement bonuses:", playerData.attunements);
            for (const key in playerData.attunements) {
                if (this.attunements.hasOwnProperty(key) && typeof playerData.attunements[key] === 'number') {
                    this.attunements[key] += playerData.attunements[key];
                }
            }
        }

        // 2. THEN apply Meta Progression bonuses ON TOP
        let startingIntegrityBonus = 0;
        let baseIntegrity = BASE_INTEGRITY;
        let baseFocus = BASE_FOCUS;
        let focusSlotsBonus = 0;
        let startingInsightBonus = 0;

        if (metaProgression) {
            startingIntegrityBonus = metaProgression.getStartingBonus('maxIntegrityBonus') || 0;
            baseIntegrity = metaProgression.getStartingBonus('baseIntegrity') || BASE_INTEGRITY;
            baseFocus = metaProgression.getStartingBonus('baseFocus') || BASE_FOCUS;
            focusSlotsBonus = metaProgression.getStartingBonus('focusSlotsBonus') || 0;
            startingInsightBonus = metaProgression.getStartingBonus('startingInsightBonus') || 0;

            // Apply specific element bonuses from meta
            for (const key in this.attunements) {
                if (this.attunements.hasOwnProperty(key)) {
                    // Note: getStartingBonus already handles adding 'All' bonus
                    const bonus = metaProgression.getStartingBonus(`attunementBonus.${key}`);
                    if (bonus) {
                        this.attunements[key] += bonus;
                    }
                }
            }
             // Ensure non-negative attunements after bonuses
             for (const key in this.attunements) {
                 this.attunements[key] = Math.max(0, this.attunements[key]);
             }
        }
        console.log("Player Constructor: Attunements after Quiz & Meta bonuses:", this.attunements);

        // --- Core Trait Tracking ---
        this.unlockedCoreTraits = new Set(); // Track unlocked passives like 'CoreTrait_C10'
        // Flags for checking passive effects easily (set in applyCoreTraitPassive)
        this.hasAttractionCoreTrait = false;
        this.hasInteractionCoreTrait = false;
        this.hasSensoryCoreTrait = false;
        this.hasPsychologicalCoreTrait = false;
        this.hasCognitiveCoreTrait = false;
        this.hasRelationalCoreTrait = false;
        this.hasRoleFocusCoreTrait = false;

        // --- Calculate Derived Stats (using final attunements) ---
        this.maxIntegrity = baseIntegrity + startingIntegrityBonus;
        this.currentIntegrity = this.maxIntegrity;
        const finalStartingCog = this.attunements.Cognitive || 5; // Ensure Cognitive exists
        this.maxFocus = baseFocus + focusSlotsBonus + Math.floor(finalStartingCog / 3); // Focus scales slightly with Cognitive
        this.currentFocus = this.maxFocus;

        // --- Deck ---
        // Use deck from playerData (quiz result) OR fallback to default
        const startingDeckIds = playerData?.startingDeck || this.getDefaultDeckIds();
        this.deckManager = new DeckManager(startingDeckIds); // PlayerRef set later by GameState

        // --- Run Progress ---
        this.insightThisRun = startingInsightBonus; // Start with meta bonus

        // --- Combat State ---
        this.currentBlock = 0;
        this.activeStatusEffects = [];

        // --- Artifacts ---
        const startingArtifactIds = playerData?.startingArtifacts || []; // Allow starting artifacts via playerData?
        this.artifacts = startingArtifactIds
            .map(artId => { try { return new Artifact(artId); } catch (error) { console.error(`Failed artifact ${artId}:`, error); return null; } })
            .filter(a => a && a.id !== 'error_artifact');

        // --- Final Initialization ---
        console.log(`Player created: ${this.name}`);
        console.log(` > Integrity: ${this.currentIntegrity}/${this.maxIntegrity}`);
        console.log(` > Focus: ${this.currentFocus}/${this.maxFocus}`);
        console.log(` > Attunements:`, this.attunements);
        console.log(` > Starting Deck Size: ${this.deckManager.masterDeck.length}`);
        console.log(` > Starting Artifacts: ${this.artifacts.map(a=>a.name).join(', ') || 'None'}`);

        // Check initial core traits based on final starting attunements
        this.checkAllCoreTraitUnlocks();
    }

    /** Links this player instance back to the main GameState. */
    setGameState(gameState) {
        if (!gameState) { console.error("Player Error: Attempted to set invalid GameState reference."); return; }
        this.gameStateRef = gameState;
        // Ensure DeckManager also gets its reference if not set earlier
        if (this.deckManager && !this.deckManager.playerRef) {
            this.deckManager.setPlayerReference(this);
        }
    }

    // --- Combat Lifecycle ---

    /** Prepares the player for combat. */
    startCombat() {
        console.log("Player: Starting Combat...");
        this.currentBlock = 0;
        this.activeStatusEffects = []; // Clear statuses from previous combat/event
        this.deckManager.resetForCombat(); // Reset deck piles
        this.triggerArtifacts('onCombatStart'); // Trigger artifacts BEFORE focus/draw
        // --- Apply Combat Start Core Traits ---
        if (this.hasAttractionCoreTrait) {
            // Example: Apply 1 Strength at combat start
            this.applyStatus('Strength', 99, 1, 'CoreTrait_A10');
            console.log("Core Trait (Attraction): Applied +1 Strength.");
        }
        // --- End Combat Start Core Traits ---
        this.gainFocus(this.maxFocus); // Gain focus
        this.drawInitialHand(); // Draw initial hand (triggers draw artifacts)
        console.log("Player combat setup complete.");
    }

    /** Starts the player's turn. */
    startTurn() {
        console.log(`Player: Starting Turn ${this.gameStateRef?.combatManager?.turnNumber || '?'}`);
        this.currentBlock = 0; // Reset block (usually happens here)
        this.triggerArtifacts('onTurnStart'); // Trigger start of turn artifacts
        this.gainFocus(this.maxFocus); // Gain base focus
        this.tickStatusEffects('start'); // Tick statuses (Poison, Burn, FocusNextTurn etc.)

        // --- Cognitive Core Trait: Scry 1 ---
        if (this.hasCognitiveCoreTrait) {
            this.scry(1); // Perform Scry 1
        }
        // --- End Cognitive Core Trait ---

        if (this.currentIntegrity <= 0) { console.log("Player died from start-of-turn effects."); return; } // Check death
        this.drawCards(5); // Draw standard hand size
        // Note: Block reset might happen AFTER draw in some games (Slay the Spire style), adjust if needed.
    }

    /** Ends the player's turn. */
    endTurn() {
        console.log("Player: Ending Turn...");
        this.triggerArtifacts('onTurnEnd'); // Trigger end-of-turn artifacts

        // --- Psychological Core Trait: Heal 1 ---
        if (this.hasPsychologicalCoreTrait) {
             if (this.currentIntegrity < this.maxIntegrity) {
                  this.heal(1);
                  console.log("Core Trait (Psychological): Healed 1 HP.");
             }
        }
        // --- End Psychological Core Trait ---

        this.tickStatusEffects('end'); // Tick end-of-turn statuses (Regen, Intangible, Durations)

        // Handle Ethereal cards
        const handAtTurnEnd = [...this.deckManager.hand];
        let etherealExhausted = false;
        handAtTurnEnd.forEach(card => {
             if (card && card.isEthereal && this.deckManager.hand.includes(card)) { // Check card exists
                 console.log(`Exhausting ethereal card: ${card.name}`);
                 this.triggerArtifacts('onCardExhaust', { card: card, reason: 'ethereal' });
                 this.deckManager.exhaustCardFromHand(card);
                 etherealExhausted = true;
             }
        });
        // Update hand display only if something was exhausted
        if (etherealExhausted && this.gameStateRef?.uiManager?.combatUI) {
             this.gameStateRef.uiManager.combatUI.renderHand(this.deckManager.hand, true);
        }

        // Check High Block Milestone
        if (this.currentBlock >= 30) {
             this.gameStateRef?.triggerMilestoneAction('endTurnHighBlock', this.currentBlock);
        }

        // Discard remaining hand
        this.deckManager.discardHand(); // Triggers discard artifacts internally
    }

    // --- Combat Actions ---

    /** Attempts to play a card from hand. */
    playCard(card, target = null, enemies = []) {
        if (!card || !(card instanceof Card)) { console.error("Player.playCard: Invalid card object."); return false; }
        if (card.cost === null) { console.warn(`Player: Cannot play unplayable card ${card.name}.`); this.gameStateRef?.uiManager?.showActionFeedback("Cannot play this card!", "warning"); return false; }

        // --- Interaction Core Trait: Cost Reduction ---
        let modifiedCost = card.cost;
        if (this.hasInteractionCoreTrait && card.primaryElement === 'I') {
            modifiedCost = Math.max(0, card.cost - 1);
            console.log(`Core Trait (Interaction): Reduced cost of ${card.name} to ${modifiedCost}`);
        }
        // --- End Interaction Core Trait ---

        // Apply general cost modifiers AFTER specific trait reduction
        modifiedCost = Math.max(0, this.applyModifiers('cardCost', modifiedCost));

        if (this.currentFocus >= modifiedCost) {
            this.spendFocus(modifiedCost); // Spend focus first
            console.log(`Player: Playing ${card.name} (Cost: ${modifiedCost}) targeting ${target?.name || 'self/none'}`);

            const eventData = { card: card, target: target }; // Data for triggers
            card.executeEffect(this, target, enemies); // Execute effect

             // --- Sensory Core Trait: Block on Skill ---
             if (this.hasSensoryCoreTrait && card.cardType === 'Skill') {
                 this.gainBlock(2); // Example: Gain 2 Block
                 console.log("Core Trait (Sensory): Gained 2 Block from playing a Skill.");
             }
             // --- End Sensory Core Trait ---
             // --- RoleFocus Core Trait: Focus on Power ---
             if (this.hasRoleFocusCoreTrait && card.cardType === 'Power') {
                 this.gainFocus(1); // Example: Gain 1 Focus
                 console.log("Core Trait (RoleFocus): Gained 1 Focus from playing a Power.");
             }
             // --- End RoleFocus Core Trait ---


            this.triggerArtifacts('onCardPlay', eventData); // Trigger AFTER effect and core traits

            // Move Card After Play
            if (card.exhausts) {
                this.triggerArtifacts('onCardExhaust', { card: card, reason: 'played' });
                this.deckManager.exhaustCardFromHand(card);
            } else {
                 this.deckManager.discardCardFromHand(card); // Handles discard triggers
            }
            return true; // Success
        } else {
            console.log(`Player: Not enough Focus for ${card.name} (cost ${card.cost} -> ${modifiedCost}, have ${this.currentFocus})`);
            this.gameStateRef?.uiManager?.showActionFeedback("Not enough Focus!", "error");
            return false; // Failure
        }
    }

    /** Draws cards using DeckManager. */
    drawCards(num) {
        if (!this.deckManager || num <= 0) return;
        const drawn = this.deckManager.draw(num);
        if (drawn.length > 0) {
            // Check for Relational Core Trait
            if (this.hasRelationalCoreTrait) {
                const statusCurseDrawnCount = drawn.filter(c => c.cardType === 'Status' || c.cardType === 'Curse').length;
                if (statusCurseDrawnCount > 0) {
                    console.log(`Core Trait (Relational): Drew ${statusCurseDrawnCount} Status/Curse, drawing ${statusCurseDrawnCount} more card(s).`);
                    this.drawCards(statusCurseDrawnCount); // Draw additional cards
                }
            }
            // Trigger general draw artifacts AFTER potentially drawing extra from trait
            this.triggerArtifacts('onCardsDrawn', { cards: drawn, count: drawn.length });
        }
    }

    /** Draws the initial hand at combat start. */
     drawInitialHand(num = 5) {
        if (!this.deckManager) return;
        // Initial draw logic might slightly differ, but uses the main draw method for consistency
        this.drawCards(num);
        // Note: 'onCardsDrawn' is triggered inside drawCards itself.
        // We might want a specific 'onInitialDraw' trigger if needed.
     }

    // --- Stat Interactions ---
    /** Gains block, applying modifiers and triggering artifacts. */
    gainBlock(amount) { /* ... Keep existing gainBlock ... */
        if (amount <= 0) return;
        const modifiedAmount = this.applyModifiers('blockGain', amount);
        if (modifiedAmount <= 0) return;
        const previousBlock = this.currentBlock;
        this.currentBlock += modifiedAmount;
        this.triggerArtifacts('onGainBlock', { amount: modifiedAmount, previousBlock: previousBlock });
    }
    /** Takes damage, applying modifiers, block, and triggering artifacts. */
    takeDamage(amount, damageSource = null) { /* ... Keep existing takeDamage ... */
        if (amount <= 0 || this.currentIntegrity <= 0) return 0;
        const initialAmount = amount;
        let modifiedAmount = amount;
        if (this.hasStatus('Intangible')) { modifiedAmount = Math.max(1, modifiedAmount > 0 ? 1 : 0); console.log("Player Intangible reduced damage!"); }
        modifiedAmount = this.applyModifiers('damageTaken', modifiedAmount);
        modifiedAmount = Math.max(0, modifiedAmount);
        if (modifiedAmount <= 0) { console.log("Player: Damage negated."); this.triggerArtifacts('onDamageNegated', { initialAmount: initialAmount, source: damageSource }); return 0; }

        const blockConsumed = Math.min(this.currentBlock, modifiedAmount);
        const damageAfterBlock = modifiedAmount - blockConsumed;
        const previousIntegrity = this.currentIntegrity;

        if (blockConsumed > 0) { this.currentBlock -= blockConsumed; this.triggerArtifacts('onBlockBroken', { amountBlocked: blockConsumed, initialDamage: modifiedAmount, source: damageSource }); }
        if (damageAfterBlock > 0) {
            this.currentIntegrity -= damageAfterBlock;
             this.triggerArtifacts('onDamageTaken', { amount: damageAfterBlock, initialAmount: initialAmount, source: damageSource });
        }
        if (this.currentIntegrity <= 0 && previousIntegrity > 0) { this.currentIntegrity = 0; console.log("Player: Integrity depleted!"); this.triggerArtifacts('onDeath', { source: damageSource }); }
        return damageAfterBlock;
    }
    /** Heals the player, respecting max Integrity and triggering artifacts. */
    heal(amount) { /* ... Keep existing heal ... */
        if (amount <= 0 || this.currentIntegrity >= this.maxIntegrity) return 0;
        const previousIntegrity = this.currentIntegrity;
        const actualHeal = Math.min(amount, this.maxIntegrity - this.currentIntegrity);
        if (actualHeal <= 0) return 0;
        this.currentIntegrity += actualHeal;
        this.triggerArtifacts('onHeal', { amount: actualHeal, previousIntegrity: previousIntegrity });
        return actualHeal;
    }
    /** Spends focus, triggering artifacts. */
    spendFocus(amount) { /* ... Keep existing spendFocus ... */
        if (amount <= 0) return;
        const previousFocus = this.currentFocus;
        const spentAmount = Math.min(amount, this.currentFocus);
        if (spentAmount <= 0) return;
        this.currentFocus -= spentAmount;
        this.triggerArtifacts('onFocusSpent', { amount: spentAmount, previousFocus: previousFocus });
    }
    /** Gains focus, respecting max Focus and triggering artifacts. */
    gainFocus(amount) { /* ... Keep existing gainFocus ... */
        if (amount <= 0) return;
        const previousFocus = this.currentFocus;
        this.currentFocus = Math.min(this.maxFocus, this.currentFocus + amount);
        const actualGain = this.currentFocus - previousFocus;
        if (actualGain > 0) { this.triggerArtifacts('onFocusGained', { amount: actualGain, previousFocus: previousFocus }); }
    }

    // --- Status Effects ---
    /** Applies a status effect to the player. */
    applyStatus(statusId, duration, amount = 1, source = null) { /* ... Keep existing applyStatus ... */
        if (!statusId) { console.warn("Player.applyStatus: Null/undefined ID."); return; }
        // Allow adding 0 duration Str/Dex if amount > 0, or specific internal flags like Core Traits
        if (duration <= 0 && amount <= 0 && !['Strength', 'Dexterity'].includes(statusId) && !statusId.startsWith('CoreTrait_')) return;

        const existingStatus = this.activeStatusEffects.find(s => s.id === statusId);
        let statusAppliedOrUpdated = false;
        let previousAmount = 0;
        let previousDuration = 0;
        const sourceId = source || 'Unknown'; // Keep source simpler

        if (existingStatus) {
            previousAmount = existingStatus.amount || 0;
            previousDuration = existingStatus.duration || 0;
            const stackableAmount = ['Strength', 'Dexterity', 'Poison', 'Regen', 'Metallicize', 'Thorns', 'FocusNextTurn', 'TempMaxHP', 'Entangle', 'ProtocolActive', 'Burn']; // Core Traits amount shouldn't stack
            if (stackableAmount.includes(statusId)) {
                 existingStatus.amount = (existingStatus.amount || 0) + amount;
            }
            if (existingStatus.duration !== 99) { // Don't overwrite infinite duration
                existingStatus.duration = Math.max(existingStatus.duration, duration);
            }
            existingStatus.source = sourceId; // Update source
            statusAppliedOrUpdated = true;
            // console.log(`Player status updated: ${statusId}. Amt: ${existingStatus.amount}, Dur: ${existingStatus.duration}`); // Noisy
        } else {
             const stackableAmount = ['Strength', 'Dexterity', 'Poison', 'Regen', 'Metallicize', 'Thorns', 'FocusNextTurn', 'TempMaxHP', 'Entangle', 'ProtocolActive', 'Burn'];
             let initialAmount = (stackableAmount.includes(statusId) || statusId.startsWith('CoreTrait_')) ? amount : 1; // Allow amount for core traits if needed later
             if (initialAmount <= 0 && duration <= 0 && !statusId.startsWith('CoreTrait_')) return; // Avoid adding useless status

            this.activeStatusEffects.push({ id: statusId, duration: duration, source: sourceId, amount: initialAmount });
            statusAppliedOrUpdated = true;
            console.log(`Player status applied: ${statusId}. Amt: ${initialAmount}, Dur: ${duration}`);
        }
        if (statusAppliedOrUpdated) {
            const currentStatus = this.activeStatusEffects.find(s => s.id === statusId);
            // Trigger artifact only for gameplay-relevant statuses, not internal flags like Core Traits
            if (!statusId.startsWith('CoreTrait_')) {
                this.triggerArtifacts('onStatusAppliedToPlayer', { status: { ...currentStatus }, amountApplied: amount, durationApplied: duration, previousAmount: previousAmount, previousDuration: previousDuration });
            }
            this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); // Update UI
        }
    }
    /** Removes a status effect instance by ID. */
    removeStatus(statusId) { /* ... Keep existing removeStatus ... */
        const initialLength = this.activeStatusEffects.length;
        const removedEffect = this.activeStatusEffects.find(s => s.id === statusId);
        this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId);
        if (this.activeStatusEffects.length < initialLength) {
             console.log(`Player status removed: ${statusId}`);
              // Trigger artifact only for gameplay-relevant statuses
             if (!statusId.startsWith('CoreTrait_')) {
                this.triggerArtifacts('onStatusRemoved', { statusId: statusId, removedEffect: removedEffect });
             }
             this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); // Update UI
             return true;
        }
        return false;
    }
    /** Checks if player has a status. */
    hasStatus(statusId) { /* ... Keep existing hasStatus ... */ return this.activeStatusEffects.some(s => s.id === statusId); }
    /** Gets the amount of a status. */
    getStatusAmount(statusId) { /* ... Keep existing getStatusAmount ... */ const status = this.activeStatusEffects.find(s => s.id === statusId); return status ? (status.amount || (status.duration > 0 ? 1 : 0)) : 0; }
    /** Process status effects at start/end of turn */
    tickStatusEffects(phase) { /* ... Keep existing tickStatusEffects ... */
        const effectsToRemove = [];
        const statusesAtStartOfTick = [...this.activeStatusEffects];

        statusesAtStartOfTick.forEach(effect => {
            if (!this.activeStatusEffects.includes(effect)) return;
            let removeEffectAfterTick = false;
            // Skip internal flags like Core Traits from ticking logic
            if (effect.id.startsWith('CoreTrait_')) return;

            switch (effect.id) {
                // Existing cases for Poison, Regen, Burn, Confusion, FocusNextTurn, Metallicize, Intangible...
                case 'Poison': if (phase === 'start' && effect.amount > 0) { console.log(`Player taking ${effect.amount} Poison.`); this.takeDamage(effect.amount, 'Poison'); effect.amount--; if (effect.amount <= 0) effectsToRemove.push(effect.id); } else if (phase === 'start' && effect.amount <= 0) { effectsToRemove.push(effect.id); } break;
                case 'Regen': if (phase === 'end' && effect.amount > 0) { console.log(`Player regen ${effect.amount}.`); this.heal(effect.amount); } break; // Note: Regen usually ticks down duration too
                case 'Burn': if (phase === 'start' && effect.amount > 0) { console.log(`Player taking ${effect.amount} Burn.`); this.takeDamage(effect.amount, 'Burn'); } break; // Duration ticks at end
                case 'Confusion': if (phase === 'start') { if (this.deckManager.hand.length > 0) { const index = Math.floor(Math.random() * this.deckManager.hand.length); const card = this.deckManager.hand[index]; if (card) { console.log(`Confusion discard: ${card.name}`); this.deckManager.discardCardFromHand(card); } } removeEffectAfterTick = true; } break;
                case 'FocusNextTurn': if (phase === 'start' && effect.amount > 0) { console.log(`Gain ${effect.amount} Focus.`); this.gainFocus(effect.amount); removeEffectAfterTick = true; } else if (phase === 'start') { removeEffectAfterTick = true; } break;
                case 'Metallicize': if (phase === 'end' && effect.amount > 0) { console.log(`Player gain ${effect.amount} Block.`); this.gainBlock(effect.amount); } break; // Usually permanent amount, duration 99
                case 'Intangible': if (phase === 'end') removeEffectAfterTick = true; break;
                 default: break; // Includes Strength, Dex, Vuln, Frail, etc. Handled by duration tick or passively.
            }

            // Duration ticking at END of turn
            if (phase === 'end') {
                 // Define non-ticking passive stacks OR infinite duration effects
                 const isPassiveStack = ['Strength', 'Dexterity', 'ProtocolActive', 'TempMaxHP', 'Metallicize', 'Thorns'].includes(effect.id);
                 const isInfiniteDuration = effect.duration === 99;
                 const tickDuration = !isPassiveStack && !isInfiniteDuration && effect.id !== 'Poison'; // Poison uses amount

                 if (tickDuration) {
                     effect.duration--;
                     if (effect.duration <= 0 && !effectsToRemove.includes(effect.id)) {
                         console.log(`Player status expired: ${effect.id}`);
                         effectsToRemove.push(effect.id);
                     }
                 }
            }
            if (removeEffectAfterTick && !effectsToRemove.includes(effect.id)) {
                effectsToRemove.push(effect.id);
            }
        });
        if (effectsToRemove.length > 0) {
            this.activeStatusEffects = this.activeStatusEffects.filter(effect => !effectsToRemove.includes(effect.id));
            // Update UI if statuses changed
            this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this);
        }
    }


    // --- Modifiers ---
     /** Applies player-based modifiers (statuses) to a value. */
     applyModifiers(modifierType, baseValue) { /* ... Keep existing applyModifiers ... */
         let modifiedValue = baseValue;
         switch (modifierType) {
            case 'damageDealt': if (this.hasStatus('Weak')) modifiedValue = Math.floor(modifiedValue * 0.75); if (this.hasStatus('Strength')) modifiedValue += this.getStatusAmount('Strength'); break;
            case 'damageTaken': if (this.hasStatus('Vulnerable')) modifiedValue = Math.floor(modifiedValue * 1.5); break;
            case 'blockGain': if (this.hasStatus('Dexterity')) modifiedValue += this.getStatusAmount('Dexterity'); if (this.hasStatus('Frail')) modifiedValue = Math.floor(modifiedValue * 0.75); if (this.hasStatus('ProtocolActive')) modifiedValue += this.getStatusAmount('ProtocolActive'); break;
            case 'cardCost': if (this.hasStatus('Entangle')) modifiedValue += this.getStatusAmount('Entangle'); break;
            // TODO: Add artifact passive modifications here if needed
         }
         return Math.max(0, Math.floor(modifiedValue));
     }


    // --- Artifacts ---
    /** Adds an artifact instance to the player. */
    addArtifact(artifactId) { /* ... Keep existing addArtifact ... */
        if (!artifactId) { console.warn("Player.addArtifact: Invalid artifactId."); return; } if (this.artifacts.some(a => a.id === artifactId)) { console.log(`Player already has artifact: ${artifactId}`); return; } // Don't add duplicates
        try { const newArtifact = new Artifact(artifactId); if (newArtifact.id !== 'error_artifact') { this.artifacts.push(newArtifact); console.log(`Player Added artifact: ${newArtifact.name}`); newArtifact.handleEvent('onPickup', this, this.gameStateRef); /* Update relevant UI */ this.gameStateRef?.uiManager?.updatePlayerMapInfo(this, this.gameStateRef.currentFloor); this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); } } catch (error) { console.error(`Error adding artifact ${artifactId}:`, error); }
    }
    /** Calls handleEvent on all artifacts for a given trigger phase. */
    triggerArtifacts(triggerPhase, data = null) { /* ... Keep existing triggerArtifacts ... */
        if (!this.gameStateRef || !this.artifacts || this.artifacts.length === 0) { return; }
        // Iterate over a copy in case an artifact removes itself during its effect
        [...this.artifacts].forEach(artifact => {
            // Check if artifact still exists in the main list before triggering
            if (this.artifacts.includes(artifact)) {
                 try {
                     artifact.handleEvent(triggerPhase, this, this.gameStateRef, data);
                 } catch (error) {
                     console.error(`Error triggering artifact ${artifact.name} (ID: ${artifact.id}) for ${triggerPhase}:`, error);
                 }
            }
        });
    }


    // --- Deck Manipulation (Delegates to DeckManager, adds triggers) ---
    /** Adds a card to the master deck. */
    addCardToDeck(cardOrId) { /* ... Keep existing addCardToDeck ... */
        const cardAdded = this.deckManager.addCardToMasterDeck(cardOrId);
        if(cardAdded){ this.triggerArtifacts('onCardAdded', { card: cardAdded }); this.gameStateRef?.triggerMilestoneAction('collectCard', 1, { rarity: cardAdded.rarity }); this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef); /* Update Deck Portrait UI */ this.gameStateRef?.uiManager?.renderDeckPortrait(this.deckManager); }
        return cardAdded;
    }
    /** Removes a card from the master deck. */
    removeCardFromDeck(cardToRemove) { /* ... Keep existing removeCardFromDeck ... */
        const cardDataCopy = { id: cardToRemove?.id, name: cardToRemove?.name, rarity: cardToRemove?.rarity };
        const removed = this.deckManager.removeCardFromMasterDeck(cardToRemove);
        if (removed) { this.triggerArtifacts('onCardRemove', { card: cardDataCopy }); this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef); /* Update Deck Portrait UI */ this.gameStateRef?.uiManager?.renderDeckPortrait(this.deckManager); return true; }
        return false;
    }

    // --- Utility ---
    /** Gets default starting deck IDs using defined starter concepts. */
    getDefaultDeckIds() { /* ... Keep existing getDefaultDeckIds ... */
        const strikeId = 10001; const defendId = 10002; const clarityId = 10003; // Add clarity
        if (!Data?.concepts?.some(c => c.id === strikeId) || !Data?.concepts?.some(c => c.id === defendId) || !Data?.concepts?.some(c => c.id === clarityId)) {
             console.warn(`Player.getDefaultDeckIds: Starter concept IDs missing! (Need ${strikeId}, ${defendId}, ${clarityId})`); return [];
        }
        console.log(`Using default starter deck: 4x Strike, 4x Defend, 2x Clarity`); // Adjusted default counts
        return Array(4).fill(strikeId).concat(Array(4).fill(defendId)).concat(Array(2).fill(clarityId));
     }
    /** Gets default base attunements. */
     getDefaultAttunements() { /* ... Keep existing getDefaultAttunements ... */ return { Attraction: 5, Interaction: 5, Sensory: 5, Psychological: 5, Cognitive: 5, Relational: 5, RoleFocus: 5 }; }

    // --- End of Combat Cleanup ---
    /** Removes temporary status effects at the end of combat. */
    cleanupCombatStatuses() { /* ... Keep existing cleanupCombatStatuses ... */
        const initialLength = this.activeStatusEffects.length; const effectsToRemove = [];
        this.activeStatusEffects = this.activeStatusEffects.filter(effect => {
            // Keep Core Traits and other potentially permanent run effects
            const persist = effect.id.startsWith('CoreTrait_') /* || ['PermanentBlessing'].includes(effect.id) */;
            if (effect.id === 'TempMaxHP') { console.warn("TempMaxHP removal logic needs implementation."); effectsToRemove.push(effect.id); return false; }
            if (effect.id === 'MirrorShieldUsed') { effectsToRemove.push(effect.id); return false; } // Remove combat flag
            if (!persist) { effectsToRemove.push(effect.id); return false; }
            return true;
        });
        if (effectsToRemove.length > 0) { console.log(`Player cleaning up end-of-combat effects: ${effectsToRemove.join(', ')}`); this.triggerArtifacts('onCombatStatusCleanup', { removed: effectsToRemove }); }
    }


    // --- NEW: Attunement Management ---
    /**
     * Modifies a player's attunement score and checks for core trait unlocks.
     * @param {string} key - The element key ('A', 'I', 'S', etc.).
     * @param {number} delta - The amount to change the attunement by (can be negative).
     */
    modifyAttunement(key, delta) {
        if (!this.attunements.hasOwnProperty(key)) {
            console.warn(`Player.modifyAttunement: Invalid element key '${key}'`);
            return;
        }
        // Store previous value for comparison
        const previousValue = this.attunements[key] || 0;
        // Update value, ensuring it doesn't go below 0
        this.attunements[key] = Math.max(0, previousValue + delta);

        console.log(`Attunement ${key} changed by ${delta}. New value: ${this.attunements[key]}`);

        // Check if a threshold was crossed (only positive changes trigger unlock)
        if (delta > 0 && this.attunements[key] >= CORE_TRAIT_THRESHOLD && previousValue < CORE_TRAIT_THRESHOLD) {
            this.checkCoreTraitUnlock(key);
        }
        // Update the UI meter
        this.gameStateRef?.uiManager?.updateAttunementMeter(this);
        // Check state-based milestones related to attunements
        this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef);
    }

    /**
     * Checks if a core trait passive should be unlocked for a specific element.
     * @param {string} key - The element key ('A', 'I', 'S', etc.).
     */
    checkCoreTraitUnlock(key) {
        if (!this.attunements.hasOwnProperty(key)) return;

        const value = this.attunements[key];
        const traitId = `CoreTrait_${key}${CORE_TRAIT_THRESHOLD}`; // e.g., CoreTrait_C10

        // Check if threshold reached and trait not already unlocked
        if (value >= CORE_TRAIT_THRESHOLD && !this.unlockedCoreTraits.has(traitId)) {
            this.unlockedCoreTraits.add(traitId);
            console.log(`%cUnlocked Core Trait: ${traitId}!`, "color: #f1c40f; font-weight: bold;"); // Yellow highlight log
            this.applyCoreTraitPassive(key); // Apply the specific passive effect
            this.gameStateRef?.uiManager?.showNotification(`Core Trait Unlocked: ${Data.elementKeyToFullName[key]}!`);
            // Apply a hidden status effect to represent the passive (optional but potentially useful)
            // this.applyStatus(traitId, 99, 1, 'CoreTraitUnlock');
        }
        // Future: Add checks for Tier 2 (e.g., >= 20) if desired
    }

    /** Checks all attunements for potential core trait unlocks (useful on initialization). */
    checkAllCoreTraitUnlocks() {
        console.log("Checking initial core trait unlocks...");
        Object.keys(this.attunements).forEach(key => {
            // Check without triggering notifications if called during setup
            const value = this.attunements[key];
            const traitId = `CoreTrait_${key}${CORE_TRAIT_THRESHOLD}`;
            if (value >= CORE_TRAIT_THRESHOLD && !this.unlockedCoreTraits.has(traitId)) {
                this.unlockedCoreTraits.add(traitId);
                console.log(` > Initial Unlock: ${traitId}`);
                this.applyCoreTraitPassive(key); // Apply passive immediately
            }
        });
    }

    /** Applies the passive effect associated with reaching an attunement threshold. */
    applyCoreTraitPassive(elementKey) {
        console.log(`Applying passive effect for Core Trait: ${elementKey}`);
        // Set boolean flags for easy checking in other methods
        switch (elementKey) {
            case 'A': this.hasAttractionCoreTrait = true; /* Effect implemented in startCombat */ break;
            case 'I': this.hasInteractionCoreTrait = true; /* Effect implemented in playCard (cost reduction) */ break;
            case 'S': this.hasSensoryCoreTrait = true; /* Effect implemented in playCard (block on skill) */ break;
            case 'P': this.hasPsychologicalCoreTrait = true; /* Effect implemented in endTurn (heal) */ break;
            case 'C': this.hasCognitiveCoreTrait = true; /* Effect implemented in startTurn (scry) */ break;
            case 'R': this.hasRelationalCoreTrait = true; /* Effect implemented in drawCards (draw on status/curse) */ break;
            case 'RF': this.hasRoleFocusCoreTrait = true; /* Effect implemented in playCard (focus on power) */ break;
            default: console.warn("Unknown element key for core trait passive:", elementKey);
        }
        // Optionally apply a hidden status effect as well if that helps tracking/display
        // this.applyStatus(`CoreTrait_${elementKey}${CORE_TRAIT_THRESHOLD}`, 99, 1, 'Internal');
    }


    // --- NEW: Dual-Path Upgrade Handling ---
    /**
     * Handles the logic for upgrading a card instance based on the chosen path.
     * Called by GameState after player makes choice in Rest Site modal.
     * @param {Card} cardInstance - The specific card instance from the deck.
     * @param {string} branch - Either 'refine' or 'transmute'.
     * @returns {boolean} True if upgrade was successful, false otherwise.
     */
    upgradeCard(cardInstance, branch) {
        if (!cardInstance || !(cardInstance instanceof Card) || cardInstance.upgraded) {
             console.error("Player.upgradeCard: Invalid card instance or already upgraded.", cardInstance);
             return false;
        }
        if (branch !== 'refine' && branch !== 'transmute') {
             console.error(`Player.upgradeCard: Invalid upgrade branch specified: ${branch}`);
             return false;
        }

        let targetElement = null; // Only used for transmute
        if (branch === 'transmute') {
            // Find the element with the lowest attunement score
            let lowestVal = Infinity;
            let lowestKey = null;
            const elementOrder = ['A', 'I', 'S', 'P', 'C', 'R', 'RF']; // Define order for tie-breaking
            for (const key of elementOrder) {
                if (this.attunements.hasOwnProperty(key)) {
                     const currentVal = this.attunements[key] || 0;
                     if (currentVal < lowestVal) {
                          lowestVal = currentVal;
                          lowestKey = key;
                     }
                }
            }
             // Ensure a valid key was found
             if (!lowestKey) {
                  console.error("Could not determine lowest attunement for transmutation.");
                  return false; // Cannot transmute without a target element
             }
            targetElement = lowestKey;
            console.log(`Transmuting ${cardInstance.name} towards lowest attunement: ${targetElement} (${lowestVal})`);
            // Optionally give a small attunement bump for embracing the weaker element
            this.modifyAttunement(targetElement, 1);
        }

        // Apply the upgrade on the card instance
        cardInstance.applyUpgrade(branch, targetElement); // Card method handles internal changes

        // Trigger artifacts associated with upgrading
        this.triggerArtifacts('onCardUpgrade', { card: cardInstance, branch: branch });

        // Update Deck Portrait UI as the card might have changed element/name
        this.gameStateRef?.uiManager?.renderDeckPortrait(this.deckManager);

        return true; // Indicate success
    }

    // --- NEW: Scry Action ---
    /**
     * Allows the player to look at the top card(s) of their draw pile and potentially discard them.
     * @param {number} amount - The number of cards to Scry.
     */
    scry(amount) {
        if (!this.deckManager || amount <= 0) return;

        const topCards = this.deckManager.peekDrawPile(amount); // Needs peekDrawPile in DeckManager
        if (topCards.length === 0) {
            this.gameStateRef?.uiManager?.showActionFeedback("Draw pile empty.", "info");
            return;
        }

        console.log(`Scrying ${topCards.length} card(s):`, topCards.map(c => c.name).join(', '));
        this.gameStateRef?.uiManager?.showActionFeedback(`Scrying: ${topCards.map(c=>c.name).join('/')}`, "info", 2500);

        // --- Scry Modal Logic ---
        // Show a special modal allowing the player to click cards to discard or confirm to keep on top.
        // This requires a new modal type in UIManager or extending showCardSelectionModal.
        // For now, we'll implement the basic logic assuming the modal returns which cards to discard.

        // Placeholder: Simulate player keeping all cards for now
        const cardsToDiscard = []; // Simulate player choosing not to discard anything

        // --- Process Scry Result ---
        const cardsToKeep = [];
        topCards.forEach(card => {
             if (cardsToDiscard.some(discarded => discarded.id === card.id)) {
                  // Move card from draw pile to discard pile
                  this.deckManager.moveTopDrawCardToDiscard(card); // Need this method in DeckManager
                  console.log(`Scry: Discarded ${card.name}`);
             } else {
                  cardsToKeep.push(card); // Will remain on top (or be re-added)
             }
        });

        // If any cards were kept, ensure they are put back on top in the chosen order (if ordering is implemented)
        // If the peek method didn't remove them, and none were discarded, nothing needs to be done.
        // If peek *did* remove them, they need to be added back to the *top* of the draw pile.
        // Assuming peekDrawPile does NOT remove cards, we only need to handle discards.

        // Update deck counts if cards were moved
        if (cardsToDiscard.length > 0) {
             this.gameStateRef?.uiManager?.updateDeckDiscardCounts(this.deckManager);
        }
        // --- End Scry Modal Logic ---
    }

} // End Player Class
