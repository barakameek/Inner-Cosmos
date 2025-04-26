// js/core/ArtifactDefinitions.js

/**
 * Definitions for all Artifacts in the game.
 * Artifact effects are functions that take (player, gameState, eventData)
 * Condition functions take the same arguments relevant to their trigger.
 */
export const ARTIFACT_TEMPLATES = {

    // --- Common Artifacts ---
    'insight_fragment_a': {
        id: 'insight_fragment_a',
        name: "Fragment of Attraction",
        description: "At the start of each combat, draw 1 additional card.",
        rarity: 'common',
        trigger: 'onCombatStart', // Triggered by Player.startCombat
        effect: (player, gameState) => {
            if (player?.deckManager) { // Safety check
                player.drawCards(1);
                console.log("Artifact Triggered: Fragment of Attraction - Drew 1 card.");
                // Add UI feedback? player.gameStateRef?.uiManager?.showNotification("+1 Card Draw (Attraction)");
            }
        }
    },
    'comforting_touch_s': {
        id: 'comforting_touch_s',
        name: "Soothing Touch (Sensory)",
        description: "Whenever you Rest at a Sanctuary, heal +3 additional Integrity.",
        rarity: 'common',
        trigger: 'onRestSiteHeal', // Needs a specific trigger from GameState.handleRestSiteAction
        effect: (player, gameState, eventData) => { // eventData might contain base heal amount
            if (player) {
                player.heal(3);
                console.log("Artifact Triggered: Soothing Touch (S) - Healed +3 Integrity at rest site.");
                player.gameStateRef?.uiManager?.showNotification("Soothing Touch healed +3 Integrity.");
            }
        }
    },
    'fleeting_thought_c': {
        id: 'fleeting_thought_c',
        name: "Fleeting Thought (Cognitive)",
        description: "At the start of your turn, if you have no Block, gain 3 Block.",
        rarity: 'common',
        trigger: 'onTurnStart',
        condition: (player) => player && player.currentBlock <= 0,
        effect: (player, gameState) => {
            player.gainBlock(3);
            console.log("Artifact Triggered: Fleeting Thought (C) - Gained 3 Block.");
        }
    },
      id: 'stubborn_psyche_p', name: "Stubborn Psyche (P)",
        description: "At the start of each combat, gain 5 temporary Hit Points.", // Changed effect
        rarity: 'common', trigger: 'onCombatStart',
        effect: (player, gameState) => {
             if(player) {
                 player.applyStatus('TemporaryHP', 99, 5); // Use amount for HP value
                 console.log("Artifact Triggered: Stubborn Psyche - Gained 5 Temporary HP.");
                 // Need status logic in Player.takeDamage to consume TemporaryHP before currentIntegrity
             }
        }
    },
 'quick_wit_c': { // NEW Common
        id: 'quick_wit_c', name: "Quick Wit (C)",
        description: "Whenever you play 3 Attacks in a single turn, draw 1 card.",
        rarity: 'common', trigger: 'onCardPlay',
        // Requires tracking attacks played per turn (needs state in Player or CombatManager)
        // Placeholder implementation - assumes CombatManager tracks turn state
        condition: (player, gameState, eventData) => {
            const card = eventData?.card;
            if (!card || !card.keywords.includes('Attack')) return false;
            // Access turn state (e.g., from gameState.combatManager.turnState.attacksPlayed)
            const attacksThisTurn = gameState?.combatManager?.getTurnState?.()?.attacksPlayed ?? 0; // Need getTurnState()
            return attacksThisTurn === 3; // Trigger on the 3rd attack
        },
        effect: (player, gameState, eventData) => {
            if (player) {
                player.drawCards(1);
                console.log("Artifact Triggered: Quick Wit - Drew card after 3rd Attack.");
                player.gameStateRef?.uiManager?.showNotification("Quick Wit triggered!");
            }
        }
    },
    // --- Uncommon Artifacts ---
    'resonant_echo_s': {
        id: 'resonant_echo_s',
        name: "Resonant Echo (Sensory)",
        description: "Whenever you play an Attack card, gain 1 Block.", // Simplified condition
        rarity: 'uncommon',
        trigger: 'onCardPlay',
        condition: (player, gameState, eventData) => eventData?.card?.keywords.includes('Attack'), // Check card keyword
        effect: (player, gameState, eventData) => {
            player.gainBlock(1); // Gain small block
            console.log(`Artifact Triggered: Resonant Echo (S) - Gained 1 Block from playing ${eventData?.card?.name}.`);
        }
    },
    'commanders_presence_i': {
        id: 'commanders_presence_i',
        name: "Commander's Presence (Interaction)",
        description: "Enemies start combat with 1 Weak.",
        rarity: 'uncommon',
        trigger: 'onEnemySpawn', // Trigger when enemies are created in CombatManager.startCombat
        // OR trigger onCombatStart and apply to all existing enemies
        // Let's use onCombatStart for simplicity
        trigger: 'onCombatStart',
        effect: (player, gameState) => {
            console.log("Artifact Triggered: Commander's Presence - Applying Weak.");
            gameState?.combatManager?.enemies.forEach(enemy => {
                if (enemy?.applyStatus) { // Check if enemy exists and has method
                    enemy.applyStatus('Weak', 1); // Apply 1 turn of weak
                }
            });
        }
    },
    'pillar_of_self_p': {
        id: 'pillar_of_self_p',
        name: "Pillar of Self (Psychological)",
        description: "At the start of your turn, if your Integrity is below 50%, gain 1 Strength.",
        rarity: 'uncommon',
        trigger: 'onTurnStart',
        condition: (player) => player && player.currentIntegrity < player.maxIntegrity * 0.5,
        effect: (player, gameState) => {
            player.applyStatus('Strength', 99, 1);
            console.log("Artifact Triggered: Pillar of Self (P) - Gained 1 Strength.");
             player.gameStateRef?.uiManager?.showNotification("Pillar of Self: Gained Strength!");

        }
    },
     'cartographers_pen_r': {
         id: 'cartographers_pen_r',
         name: "Cartographer's Pen (Relational)",
         description: "Gain 15 Insight when entering a new Floor.",
         rarity: 'uncommon',
         trigger: 'onFloorStart', // Needs trigger from GameState.advanceFloor
         effect: (player, gameState) => {
             if (player) {
                 player.insightThisRun += 15;
                 console.log("Artifact Triggered: Cartographer's Pen - Gained 15 Insight.");
                  player.gameStateRef?.uiManager?.showNotification("+15 Insight (Cartographer's Pen)");
                  // Update map info UI immediately?
                   player.gameStateRef?.uiManager?.updatePlayerMapInfo(player, gameState.currentFloor);
             }
         }
     },
 'mirror_shield_i': { // NEW Uncommon
         id: 'mirror_shield_i', name: "Mirror Shield (I)",
         description: "The first time you are attacked each combat, apply 1 Weak to the attacker.",
         rarity: 'uncommon', trigger: 'onDamageTaken', // Use damage trigger
         // Need state to track if it already triggered this combat
         // Use a temporary status effect on the player as the flag?
         condition: (player, gameState, eventData) => {
            // Check if damage > 0 and if the 'MirrorShieldUsed' flag status is NOT present
            return eventData?.amount > 0 && !player?.hasStatus('MirrorShieldUsed');
         },
         effect: (player, gameState, eventData) => {
             // eventData for onDamageTaken should include source enemy ID
             const sourceEnemy = gameState?.combatManager?.enemies.find(e => e.id === eventData?.source?.id); // Need source in eventData
             if (sourceEnemy && player) {
                 sourceEnemy.applyStatus('Weak', 1); // Apply 1 Weak
                 player.applyStatus('MirrorShieldUsed', 99, 1); // Apply flag status for rest of combat
                 console.log(`Artifact Triggered: Mirror Shield - Applied Weak to ${sourceEnemy.name}.`);
                  player.gameStateRef?.uiManager?.showNotification("Mirror Shield reflected Weakness!");
             }
         }
     },
      'alchemical_pouch_x': { // NEW Uncommon (Cross-element?)
         id: 'alchemical_pouch_x', name: "Alchemical Pouch",
         description: "At the start of combat, add 2 random common Potion cards to your hand.", // Potion cards TBD
         rarity: 'uncommon', trigger: 'onCombatStart',
         effect: (player, gameState) => {
              if (player && player.deckManager) {
                   console.log("Artifact Triggered: Alchemical Pouch - Adding Potions...");
                   // TODO: Define "Potion" cards (e.g., concepts for heal, temp str, block)
                   const potionIds = [1001, 1002, 1003]; // Placeholder Potion Concept IDs
                   for (let i = 0; i < 2; i++) {
                        const randomPotionId = potionIds[Math.floor(Math.random() * potionIds.length)];
                        const potionCard = new Card(randomPotionId); // Need Card class imported
                         if (potionCard.conceptId !== -1 && player.deckManager.hand.length < player.deckManager.maxHandSize) {
                             // Mark as Ethereal and maybe Exhaust?
                             potionCard.isEthereal = true;
                             potionCard.exhausts = true;
                             player.deckManager.hand.push(potionCard); // Add directly to hand
                              console.log(`   Added ${potionCard.name} to hand.`);
                         } else if (potionCard.conceptId !== -1) {
                             // Add to draw pile if hand full? Or discard? Discard is safer.
                              player.deckManager.discardPile.push(potionCard);
                               console.log(`   Hand full, added ${potionCard.name} to discard.`);
                         }
                   }
                    player.gameStateRef?.uiManager?.renderHand(player.deckManager.hand); // Update UI
              }
         }
     },

    // --- Rare Artifacts ---
    'focus_lens_c': {
         id: 'focus_lens_c',
         name: "Focus Lens (Cognitive)",
         description: "Gain 1 additional Focus at the start of each turn.",
         rarity: 'rare',
         trigger: 'onTurnStart',
         effect: (player, gameState) => {
             player.gainFocus(1);
             console.log("Artifact Triggered: Focus Lens (C) - Gained 1 Focus.");
         }
     },
     'binding_threads_rf': {
        id: 'binding_threads_rf',
        name: "Binding Threads (RoleFocus)",
        description: "Whenever an enemy applies a negative Status Effect (Weak, Vulnerable, Frail) to you, it takes 3 damage.",
        rarity: 'rare',
        trigger: 'onStatusAppliedToPlayer', // Triggered by Player.applyStatus
        condition: (player, gameState, eventData) => {
            // Check if the status applied is a debuff and came from an enemy
            const debuffs = ['Weak', 'Vulnerable', 'Frail', 'Confusion', 'Entangle']; // Define negative statuses
            const status = eventData?.status;
            // Ensure source ID exists and corresponds to an active enemy
            const sourceEnemy = gameState?.combatManager?.enemies.find(e => e.id === status?.source);
            return status && debuffs.includes(status.id) && sourceEnemy && sourceEnemy.currentHp > 0;
        },
        effect: (player, gameState, eventData) => {
             const sourceEnemy = gameState.combatManager.enemies.find(e => e.id === eventData?.status?.source);
             if (sourceEnemy) {
                  sourceEnemy.takeDamage(3, 'Retribution'); // Deal 3 damage, maybe custom element type?
                  console.log(`Artifact Triggered: Binding Threads (RF) - Dealt 3 damage to ${sourceEnemy.name}.`);
                  player.gameStateRef?.uiManager?.showActionFeedback(`${sourceEnemy.name} took 3 damage!`, 'info');
             }
        }
     },
      'alchemists_stone_x': { // Example Boss/Special Artifact
          id: 'alchemists_stone_x',
          name: "Alchemist's Stone (Synthesis)",
          description: "At the start of combat, gain 1 Strength, 1 Dexterity, and Heal 5 Integrity.",
          rarity: 'rare', // Or maybe 'boss' rarity?
          trigger: 'onCombatStart',
          effect: (player, gameState) => {
              if(player) {
                  player.applyStatus('Strength', 99, 1);
                  player.applyStatus('Dexterity', 99, 1);
                  player.heal(5);
                   console.log("Artifact Triggered: Alchemist's Stone - Gained Str, Dex, Heal.");
                   player.gameStateRef?.uiManager?.showNotification("Alchemist's Stone Activated!");
              }
          }
      },
       'shadow_insight_artifact': { /* ... keep (Focus next turn on Exhaust) ... */ },
     'philosophers_catalyst_p': { // NEW Rare
         id: 'philosophers_catalyst_p', name: "Philosopher's Catalyst (P)",
         description: "Whenever you heal Integrity, gain that much Block.",
         rarity: 'rare', trigger: 'onHeal',
         condition: (player, gameState, eventData) => eventData?.amount > 0,
         effect: (player, gameState, eventData) => {
              const healAmount = eventData.amount;
              if (player && healAmount > 0) {
                  player.gainBlock(healAmount);
                   console.log(`Artifact Triggered: Catalyst - Gained ${healAmount} Block from healing.`);
              }
         }
     },
     'labyrinth_map_r': { // NEW Rare
          id: 'labyrinth_map_r', name: "Labyrinth Map (R)",
          description: "You can now see paths 2 nodes ahead on the map.",
          rarity: 'rare', trigger: 'passive', // No event trigger, effect handled by MapUI rendering
          effect: null, // Logic implemented in MapUI
          isPassive: true // Flag for passive effects
      }
};

// --- Need Status Effect Logic Implementation ---
// Example logic needed in Player.tickStatusEffects for the above:
/*
case 'TempMaxHP':
    // This status would need to be applied ONCE, and removed at end of combat.
    // The actual max HP increase might need to be handled differently, perhaps
    // directly modifying player.maxIntegrity for the combat duration.
    // This is complex. A simpler alternative: Gain X Block at combat start.
    break;
case 'FocusNextTurn':
    if (phase === 'start' && effect.amount > 0) {
        console.log(`Gaining ${effect.amount} focus from Shadow Insight.`);
        this.gainFocus(effect.amount);
        // Remove the status after granting focus
        effectsToRemove.push(effect.id); // Mark for removal immediately
    }
    break;
// Add 'Entangle' effect logic (e.g., increase card costs?)
*/

// --- Need Trigger Point Implementation ---
// - GameState.handleRestSiteAction should call player.triggerArtifacts('onRestSiteHeal', { amount: healAmount });
// - GameState.advanceFloor should call player.triggerArtifacts('onFloorStart', { floor: newFloorNumber });
// - Player.playCard or DeckManager.exhaustCardFromHand needs to call player.triggerArtifacts('onCardExhaust', { card: exhaustedCard });
// - CombatManager.startCombat needs to iterate enemies and call player.triggerArtifacts('onEnemySpawn', { enemy: spawnedEnemy }); (If using this trigger)
