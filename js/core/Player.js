// js/core/Player.js

import { DeckManager } from './DeckManager.js';
import { Artifact } from './Artifact.js';
import { Card } from './Card.js'; // Needed for potential effects/status cards
import * as Data from '../../data.js'; // For default deck/attunements

// --- Constants ---
const BASE_FOCUS = 3;
const BASE_INTEGRITY = 70;

/**
 * Represents the player character during a run.
 * Manages stats, status effects, artifacts, and deck interactions.
 */
export class Player {
    constructor(playerData = {}, metaProgression = null) {
        console.log("Creating Player instance...");
        this.gameStateRef = null; // Set by GameState after creation

        // --- Core Identity ---
        this.name = playerData?.name || "Alchemist";

        // --- Meta Progression Bonuses ---
        const startingIntegrityBonus = metaProgression?.getStartingBonus('maxIntegrityBonus') || 0;
        const baseIntegrity = metaProgression?.getStartingBonus('baseIntegrity') || BASE_INTEGRITY;
        const baseFocus = metaProgression?.getStartingBonus('baseFocus') || BASE_FOCUS;
        const focusSlotsBonus = metaProgression?.getStartingBonus('focusSlotsBonus') || 0;
        const startingInsightBonus = metaProgression?.getStartingBonus('startingInsightBonus') || 0;

        // --- Attunements ---
        const baseAttunements = this.getDefaultAttunements();
        this.attunements = { ...baseAttunements };
        if (metaProgression) {
            // Apply specific element bonuses
            for (const key in this.attunements) {
                if (this.attunements.hasOwnProperty(key)) {
                    const bonus = metaProgression.getStartingBonus(`attunementBonus.${key}`);
                    if (bonus) this.attunements[key] += bonus;
                }
            }
            // Apply 'All' bonus
            const allBonus = metaProgression.getStartingBonus('attunementBonus.All');
            if (allBonus) {
                for (const key in this.attunements) {
                    if (this.attunements.hasOwnProperty(key)) this.attunements[key] += allBonus;
                }
            }
        }
        // Override with specific playerData attunements if provided
        if (playerData?.attunements) {
            this.attunements = { ...this.attunements, ...playerData.attunements };
        }
        // --- DYNAMIC ATTUNEMENT PLACEHOLDER ---
        // TODO: Implement logic elsewhere to modify this.attunements during the run.

        // --- Calculate Derived Stats ---
        this.maxIntegrity = baseIntegrity + startingIntegrityBonus;
        this.currentIntegrity = this.maxIntegrity;
        const finalStartingCog = this.attunements.Cognitive || 5;
        this.maxFocus = baseFocus + focusSlotsBonus + Math.floor(finalStartingCog / 3);
        this.currentFocus = this.maxFocus;

        // --- Deck ---
        const startingDeckIds = playerData?.startingDeck || this.getDefaultDeckIds();
        this.deckManager = new DeckManager(startingDeckIds); // PlayerRef set later

        // --- Run Progress ---
        this.insightThisRun = startingInsightBonus;

        // --- Combat State ---
        this.currentBlock = 0;
        this.activeStatusEffects = [];

        // --- Artifacts ---
        const startingArtifactIds = playerData?.startingArtifacts || [];
        this.artifacts = startingArtifactIds
            .map(artId => { try { return new Artifact(artId); } catch (error) { console.error(`Failed artifact ${artId}:`, error); return null; } })
            .filter(a => a && a.id !== 'error_artifact');

        console.log(`Player created: ${this.name}`);
        console.log(` > Integrity: ${this.currentIntegrity}/${this.maxIntegrity}`);
        console.log(` > Focus: ${this.currentFocus}/${this.maxFocus}`);
        console.log(` > Attunements:`, this.attunements);
        console.log(` > Starting Deck Size: ${this.deckManager.masterDeck.length}`);
        console.log(` > Starting Artifacts: ${this.artifacts.map(a=>a.name).join(', ') || 'None'}`);
    }

    /** Links this player instance back to the main GameState. */
    setGameState(gameState) {
        if (!gameState) { console.error("Player Error: Attempted to set invalid GameState reference."); return; }
        this.gameStateRef = gameState;
    }

    // --- Combat Lifecycle ---

    /** Prepares the player for combat. */
    startCombat() {
        console.log("Player: Starting Combat...");
        this.currentBlock = 0;
        this.activeStatusEffects = []; // Clear statuses
        this.deckManager.resetForCombat(); // Reset deck piles
        this.triggerArtifacts('onCombatStart'); // Trigger artifacts BEFORE focus/draw
        this.gainFocus(this.maxFocus); // Gain focus
        this.drawInitialHand(); // Draw initial hand (triggers draw artifacts)
        console.log("Player combat setup complete.");
    }

    /** Starts the player's turn. */
    startTurn() {
        console.log(`Player: Starting Turn ${this.gameStateRef?.combatManager?.turnNumber || '?'}`);
        this.currentBlock = 0; // Reset block
        this.triggerArtifacts('onTurnStart'); // Trigger start of turn artifacts
        this.gainFocus(this.maxFocus); // Gain base focus
        this.tickStatusEffects('start'); // Tick statuses (Poison, Burn, FocusNextTurn etc.)
        if (this.currentIntegrity <= 0) { console.log("Player died from start-of-turn effects."); return; } // Check death
        this.drawCards(5); // Draw standard hand size
    }

    /** Ends the player's turn. */
    endTurn() {
        console.log("Player: Ending Turn...");
        this.triggerArtifacts('onTurnEnd'); // Trigger end-of-turn artifacts
        this.tickStatusEffects('end'); // Tick end-of-turn statuses (Regen, Intangible, Durations)

        // Handle Ethereal cards
        const handAtTurnEnd = [...this.deckManager.hand];
        let etherealExhausted = false;
        handAtTurnEnd.forEach(card => {
             if (card.isEthereal && this.deckManager.hand.includes(card)) {
                 console.log(`Exhausting ethereal card: ${card.name}`);
                 this.triggerArtifacts('onCardExhaust', { card: card, reason: 'ethereal' });
                 this.deckManager.exhaustCardFromHand(card);
                 etherealExhausted = true;
             }
        });
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

        const modifiedCost = Math.max(0, this.applyModifiers('cardCost', card.cost));

        if (this.currentFocus >= modifiedCost) {
            this.spendFocus(modifiedCost); // Spend focus first
            console.log(`Player: Playing ${card.name} (Cost: ${modifiedCost}) targeting ${target?.name || 'self/none'}`);

            // --- DYNAMIC ATTUNEMENT CHANGE (Example Placeholder) ---
            // TODO: Implement this properly!
            // if (card.primaryElement && this.attunements.hasOwnProperty(card.primaryElement)) {
            //     const attunementGain = 0.1;
            //     this.attunements[card.primaryElement] = (this.attunements[card.primaryElement] || 0) + attunementGain;
            //     this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef); // Check if attunement milestones met
            // }
            // --- END Example ---

            const eventData = { card: card, target: target }; // Data for triggers
            card.executeEffect(this, target, enemies); // Execute effect
            this.triggerArtifacts('onCardPlay', eventData); // Trigger AFTER effect

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
        if (drawn.length > 0) { this.triggerArtifacts('onCardsDrawn', { cards: drawn, count: drawn.length }); }
    }

    /** Draws the initial hand at combat start. */
     drawInitialHand(num = 5) {
        if (!this.deckManager) return;
        const drawn = this.deckManager.draw(num);
        if (drawn.length > 0) { this.triggerArtifacts('onCardsDrawn', { cards: drawn, count: drawn.length, initial: true }); }
    }

    // --- Stat Interactions ---

    /** Gains block, applying modifiers and triggering artifacts. */
    gainBlock(amount) {
        if (amount <= 0) return;
        const modifiedAmount = this.applyModifiers('blockGain', amount);
        if (modifiedAmount <= 0) return;
        const previousBlock = this.currentBlock;
        this.currentBlock += modifiedAmount;
        this.triggerArtifacts('onGainBlock', { amount: modifiedAmount, previousBlock: previousBlock });
    }

    /** Takes damage, applying modifiers, block, and triggering artifacts. */
    takeDamage(amount, damageSource = null) {
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
    heal(amount) {
        if (amount <= 0 || this.currentIntegrity >= this.maxIntegrity) return 0;
        const previousIntegrity = this.currentIntegrity;
        const actualHeal = Math.min(amount, this.maxIntegrity - this.currentIntegrity);
        if (actualHeal <= 0) return 0;
        this.currentIntegrity += actualHeal;
        this.triggerArtifacts('onHeal', { amount: actualHeal, previousIntegrity: previousIntegrity });
        return actualHeal;
    }

    /** Spends focus, triggering artifacts. */
    spendFocus(amount) {
        if (amount <= 0) return;
        const previousFocus = this.currentFocus;
        const spentAmount = Math.min(amount, this.currentFocus);
        if (spentAmount <= 0) return;
        this.currentFocus -= spentAmount;
        this.triggerArtifacts('onFocusSpent', { amount: spentAmount, previousFocus: previousFocus });
    }

    /** Gains focus, respecting max Focus and triggering artifacts. */
    gainFocus(amount) {
        if (amount <= 0) return;
        const previousFocus = this.currentFocus;
        this.currentFocus = Math.min(this.maxFocus, this.currentFocus + amount);
        const actualGain = this.currentFocus - previousFocus;
        if (actualGain > 0) { this.triggerArtifacts('onFocusGained', { amount: actualGain, previousFocus: previousFocus }); }
    }

    // --- Status Effects ---

    /** Applies a status effect to the player. */
    applyStatus(statusId, duration, amount = 1, source = null) {
        if (!statusId) { console.warn("Player.applyStatus: Null/undefined ID."); return; }
        if (duration <= 0 && amount <= 0 && !['Strength', 'Dexterity'].includes(statusId)) return; // Allow adding 0 duration Str/Dex if amount > 0

        const existingStatus = this.activeStatusEffects.find(s => s.id === statusId);
        let statusAppliedOrUpdated = false;
        let previousAmount = 0;
        let previousDuration = 0;
        const sourceId = source?.id || (typeof source === 'string' ? source : 'Unknown');

        if (existingStatus) {
            previousAmount = existingStatus.amount || 0;
            previousDuration = existingStatus.duration || 0;
            const stackableAmount = ['Strength', 'Dexterity', 'Poison', 'Regen', 'Metallicize', 'Thorns', 'FocusNextTurn', 'TempMaxHP', 'Entangle', 'ProtocolActive', 'Burn'];
            if (stackableAmount.includes(statusId)) {
                 existingStatus.amount = (existingStatus.amount || 0) + amount;
            }
            if (existingStatus.duration !== 99) { // Don't overwrite infinite duration
                existingStatus.duration = Math.max(existingStatus.duration, duration);
            }
            existingStatus.source = sourceId; // Update source
            statusAppliedOrUpdated = true;
            console.log(`Player status updated: ${statusId}. Amt: ${existingStatus.amount}, Dur: ${existingStatus.duration}`);
        } else {
             const stackableAmount = ['Strength', 'Dexterity', 'Poison', 'Regen', 'Metallicize', 'Thorns', 'FocusNextTurn', 'TempMaxHP', 'Entangle', 'ProtocolActive', 'Burn'];
             let initialAmount = stackableAmount.includes(statusId) ? amount : 1;
             if (initialAmount <= 0 && duration <= 0) return; // Avoid adding useless status

            this.activeStatusEffects.push({ id: statusId, duration: duration, source: sourceId, amount: initialAmount });
            statusAppliedOrUpdated = true;
            console.log(`Player status applied: ${statusId}. Amt: ${initialAmount}, Dur: ${duration}`);
        }
        if (statusAppliedOrUpdated) {
            const currentStatus = this.activeStatusEffects.find(s => s.id === statusId);
            this.triggerArtifacts('onStatusAppliedToPlayer', { status: { ...currentStatus }, amountApplied: amount, durationApplied: duration, previousAmount: previousAmount, previousDuration: previousDuration });
            this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); // Update UI
        }
    }

    /** Removes a status effect instance by ID. */
    removeStatus(statusId) {
        const initialLength = this.activeStatusEffects.length;
        const removedEffect = this.activeStatusEffects.find(s => s.id === statusId);
        this.activeStatusEffects = this.activeStatusEffects.filter(s => s.id !== statusId);
        if (this.activeStatusEffects.length < initialLength) {
             console.log(`Player status removed: ${statusId}`);
             this.triggerArtifacts('onStatusRemoved', { statusId: statusId, removedEffect: removedEffect });
             this.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(this); // Update UI
             return true;
        }
        return false;
    }

    hasStatus(statusId) { return this.activeStatusEffects.some(s => s.id === statusId); }
    getStatusAmount(statusId) { const status = this.activeStatusEffects.find(s => s.id === statusId); return status ? (status.amount || (status.duration > 0 ? 1 : 0)) : 0; }

    /** Process status effects at start/end of turn */
    tickStatusEffects(phase) {
        const effectsToRemove = [];
        const statusesAtStartOfTick = [...this.activeStatusEffects];

        statusesAtStartOfTick.forEach(effect => {
            if (!this.activeStatusEffects.includes(effect)) return;
            let removeEffectAfterTick = false;
            switch (effect.id) {
                case 'Poison': if (phase === 'start' && effect.amount > 0) { console.log(`Player taking ${effect.amount} Poison.`); this.takeDamage(effect.amount, 'Poison'); effect.amount--; if (effect.amount <= 0) effectsToRemove.push(effect.id); } else if (phase === 'start' && effect.amount <= 0) { effectsToRemove.push(effect.id); } break;
                case 'Regen': if (phase === 'end' && effect.amount > 0) { console.log(`Player regen ${effect.amount}.`); this.heal(effect.amount); } break;
                case 'Burn': if (phase === 'start' && effect.amount > 0) { console.log(`Player taking ${effect.amount} Burn.`); this.takeDamage(effect.amount, 'Burn'); } break;
                case 'Confusion': if (phase === 'start') { if (this.deckManager.hand.length > 0) { const index = Math.floor(Math.random() * this.deckManager.hand.length); const card = this.deckManager.hand[index]; if (card) { console.log(`Confusion discard: ${card.name}`); this.deckManager.discardCardFromHand(card); } } removeEffectAfterTick = true; } break;
                case 'FocusNextTurn': if (phase === 'start' && effect.amount > 0) { console.log(`Gain ${effect.amount} Focus.`); this.gainFocus(effect.amount); removeEffectAfterTick = true; } else if (phase === 'start') { removeEffectAfterTick = true; } break;
                case 'Metallicize': if (phase === 'end' && effect.amount > 0) { console.log(`Player gain ${effect.amount} Block.`); this.gainBlock(effect.amount); } break;
                case 'Intangible': if (phase === 'end') removeEffectAfterTick = true; break;
                 default: break; // Includes Strength, Dex, Vuln, Frail, etc. Handled by duration tick or passively.
            }

            if (phase === 'end') {
                 const isPassiveStack = ['Strength', 'Dexterity', 'ProtocolActive', 'TempMaxHP', 'Metallicize', 'Thorns'].includes(effect.id);
                 const isInfiniteDuration = effect.duration === 99;
                 const tickDuration = !isPassiveStack && !isInfiniteDuration && effect.id !== 'Poison';
                 if (tickDuration) { effect.duration--; if (effect.duration <= 0 && !effectsToRemove.includes(effect.id)) { console.log(`Player status expired: ${effect.id}`); effectsToRemove.push(effect.id); } }
            }
            if (removeEffectAfterTick && !effectsToRemove.includes(effect.id)) { effectsToRemove.push(effect.id); }
        });
        if (effectsToRemove.length > 0) { this.activeStatusEffects = this.activeStatusEffects.filter(effect => !effectsToRemove.includes(effect.id)); }
    }


    // --- Modifiers ---
     /** Applies player-based modifiers (statuses) to a value. */
     applyModifiers(modifierType, baseValue) {
         let modifiedValue = baseValue;
         switch (modifierType) {
            case 'damageDealt': if (this.hasStatus('Weak')) modifiedValue = Math.floor(modifiedValue * 0.75); if (this.hasStatus('Strength')) modifiedValue += this.getStatusAmount('Strength'); break;
            case 'damageTaken': if (this.hasStatus('Vulnerable')) modifiedValue = Math.floor(modifiedValue * 1.5); break;
            case 'blockGain': if (this.hasStatus('Dexterity')) modifiedValue += this.getStatusAmount('Dexterity'); if (this.hasStatus('Frail')) modifiedValue = Math.floor(modifiedValue * 0.75); if (this.hasStatus('ProtocolActive')) modifiedValue += this.getStatusAmount('ProtocolActive'); break;
            case 'cardCost': if (this.hasStatus('Entangle')) modifiedValue += this.getStatusAmount('Entangle'); break;
         }
         // TODO: Add artifact passive modifications here if needed
         return Math.max(0, Math.floor(modifiedValue));
     }


    // --- Artifacts ---
    /** Adds an artifact instance to the player. */
    addArtifact(artifactId) {
        if (!artifactId) { console.warn("Player.addArtifact: Invalid artifactId."); return; } if (this.artifacts.some(a => a.id === artifactId)) { return; }
        try { const newArtifact = new Artifact(artifactId); if (newArtifact.id !== 'error_artifact') { this.artifacts.push(newArtifact); console.log(`Player Added artifact: ${newArtifact.name}`); newArtifact.handleEvent('onPickup', this, this.gameStateRef); this.gameStateRef?.uiManager?.updatePlayerCombatInfo(this); this.gameStateRef?.uiManager?.updatePlayerMapInfo(this, this.gameStateRef.currentFloor); } } catch (error) { console.error(`Error adding artifact ${artifactId}:`, error); }
    }
    /** Calls handleEvent on all artifacts for a given trigger phase. */
    triggerArtifacts(triggerPhase, data = null) {
        if (!this.gameStateRef || !this.artifacts || this.artifacts.length === 0) { return; }
        [...this.artifacts].forEach(artifact => { if (this.artifacts.includes(artifact)) { try { artifact.handleEvent(triggerPhase, this, this.gameStateRef, data); } catch (error) { console.error(`Error triggering artifact ${artifact.name} (ID: ${artifact.id}) for ${triggerPhase}:`, error); } } });
    }


    // --- Deck Manipulation (Delegates to DeckManager, adds triggers) ---
    /** Adds a card to the master deck. */
    addCardToDeck(cardOrId) {
        const cardAdded = this.deckManager.addCardToMasterDeck(cardOrId);
        if(cardAdded){ this.triggerArtifacts('onCardAdded', { card: cardAdded }); this.gameStateRef?.triggerMilestoneAction('collectCard', 1, { rarity: cardAdded.rarity }); this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef); }
        return cardAdded;
    }
    /** Removes a card from the master deck. */
    removeCardFromDeck(cardToRemove) {
        const cardDataCopy = { id: cardToRemove?.id, name: cardToRemove?.name, rarity: cardToRemove?.rarity };
        const removed = this.deckManager.removeCardFromMasterDeck(cardToRemove);
        if (removed) { this.triggerArtifacts('onCardRemove', { card: cardDataCopy }); this.gameStateRef?.metaProgression?.checkStateBasedMilestones(this.gameStateRef); return true; }
        return false;
    }

    // --- Utility ---
    /** Gets default starting deck IDs using defined starter concepts. */
    getDefaultDeckIds() {
        const strikeId = 10001; const defendId = 10002;
        if (!Data?.concepts?.some(c => c.id === strikeId) || !Data?.concepts?.some(c => c.id === defendId)) { console.warn(`Player.getDefaultDeckIds: Starter concept IDs missing!`); return []; }
        console.log(`Using default starter deck: 5x ${strikeId}, 5x ${defendId}`);
        return Array(5).fill(strikeId).concat(Array(5).fill(defendId));
     }
    /** Gets default base attunements. */
     getDefaultAttunements() { return { Attraction: 5, Interaction: 5, Sensory: 5, Psychological: 5, Cognitive: 5, Relational: 5, RoleFocus: 5 }; }

    // --- End of Combat Cleanup ---
    /** Removes temporary status effects at the end of combat. */
    cleanupCombatStatuses() {
        const initialLength = this.activeStatusEffects.length; const effectsToRemove = [];
        this.activeStatusEffects = this.activeStatusEffects.filter(effect => {
            const persist = [/*'PermanentBlessing'*/].includes(effect.id);
            if (effect.id === 'TempMaxHP') { console.warn("TempMaxHP removal logic needs implementation."); effectsToRemove.push(effect.id); return false; }
            if (effect.id === 'MirrorShieldUsed') { effectsToRemove.push(effect.id); return false; } // Remove combat flag
            if (!persist) { effectsToRemove.push(effect.id); return false; }
            return true;
        });
        if (effectsToRemove.length > 0) { console.log(`Player cleaning up end-of-combat effects: ${effectsToRemove.join(', ')}`); this.triggerArtifacts('onCombatStatusCleanup', { removed: effectsToRemove }); }
    }

} // End Player Class
