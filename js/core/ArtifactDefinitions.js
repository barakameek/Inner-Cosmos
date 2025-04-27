// js/core/ArtifactDefinitions.js

// Import necessary classes ONLY IF effect/condition logic needs them directly
// Typically, effects modify player/gameState passed in.
import { Card } from './Card.js'; // Needed for Alchemical Pouch example

/**
 * Definitions for all Artifacts in the game.
 * Artifact effects are functions that take (player, gameState, eventData)
 * Condition functions take the same arguments and return true/false.
 * eventData structure depends on the trigger (e.g., { card: Card } for onCardPlay, { amount: number } for onDamageTaken).
 */
export const ARTIFACT_TEMPLATES = {

    // --- Common Artifacts ---
    'insight_fragment_a': {
        id: 'insight_fragment_a',
        name: "Fragment of Attraction",
        description: "At the start of each combat, draw 1 additional card.",
        rarity: 'common',
        trigger: 'onCombatStart', // Triggered by Player.startCombat AFTER reset/shuffle
        effect: (player, gameState, eventData) => {
            if (player?.deckManager) {
                console.log("Artifact Triggered: Fragment of Attraction - Drawing 1 card.");
                player.drawCards(1); // Player method handles hand size limit etc.
                player.gameStateRef?.uiManager?.showNotification("+1 Card (Attraction Fragment)");
            }
        }
    },
    'comforting_touch_s': {
        id: 'comforting_touch_s',
        name: "Soothing Touch (Sensory)",
        description: "Whenever you Rest at a Sanctuary and choose to Heal, heal +4 additional Integrity.",
        rarity: 'common',
        trigger: 'onRestSiteHeal', // Triggered by GameState.handleRestSiteAction('heal') -> Player.heal -> Player.triggerArtifacts
        effect: (player, gameState, eventData) => { // eventData from onHeal might contain { amount: actualHeal }
            if (player) {
                player.heal(4); // Apply additional healing
                console.log("Artifact Triggered: Soothing Touch (S) - Healed +4 Integrity at rest site.");
                player.gameStateRef?.uiManager?.showNotification("Soothing Touch healed +4 Integrity.");
            }
        }
    },
    'fleeting_thought_c': {
        id: 'fleeting_thought_c',
        name: "Fleeting Thought (Cognitive)",
        description: "At the start of your turn, if you have 0 Block, gain 3 Block.",
        rarity: 'common',
        trigger: 'onTurnStart', // Triggered by Player.startTurn
        condition: (player, gameState, eventData) => player?.currentBlock <= 0,
        effect: (player, gameState, eventData) => {
            player.gainBlock(3);
            console.log("Artifact Triggered: Fleeting Thought (C) - Gained 3 Block.");
             player.gameStateRef?.uiManager?.showNotification("Fleeting Thought: Gained Block");
        }
    },
    'stubborn_psyche_p': { // Renamed slightly, using TempHP status
        id: 'stubborn_psyche_p',
        name: "Stubborn Psyche (P)",
        description: "At the start of each combat, gain 5 Temporary HP for this combat.",
        rarity: 'common',
        trigger: 'onCombatStart',
        effect: (player, gameState, eventData) => {
             if(player) {
                 // Applying TempHP needs Player logic to handle it correctly during damage calculation and removal.
                 // Let's simplify: Gain 5 Block at combat start instead for now.
                 player.gainBlock(5);
                 console.log("Artifact Triggered: Stubborn Psyche - Gained 5 Block.");
                 player.gameStateRef?.uiManager?.showNotification("+5 Block (Stubborn Psyche)");
                 // To implement TempHP properly:
                 // player.applyStatus('TempMaxHP', 99, 5); // Needs status logic in Player
                 // player.heal(5); // Heal up to the new temp max
             }
        }
    },
    'quick_wit_c': {
        id: 'quick_wit_c', name: "Quick Wit (C)",
        description: "Whenever you play 3 Attacks in a single turn, draw 1 card.",
        rarity: 'common', trigger: 'onCardPlay',
        // Requires CombatManager to track turn state accurately
        condition: (player, gameState, eventData) => {
            const card = eventData?.card;
            if (!card || !card.keywords.includes('Attack')) return false;
            // Access turn state (ensure combatManager exists and has the state)
            const attacksThisTurn = gameState?.combatManager?.turnState?.attacksPlayedThisTurn ?? 0;
            // Trigger on the 3rd attack play action itself
            return attacksThisTurn === 3;
        },
        effect: (player, gameState, eventData) => {
            if (player) {
                player.drawCards(1);
                console.log("Artifact Triggered: Quick Wit - Drew card after 3rd Attack.");
                player.gameStateRef?.uiManager?.showNotification("Quick Wit triggered!");
            }
        }
    },
     'sticky_concept_r': { // NEW Common
          id: 'sticky_concept_r', name: "Sticky Concept (R)",
          description: "At the start of combat, Retain 1 card.", // Retain keyword needs implementation
          rarity: 'common', trigger: 'onCombatStart',
          effect: (player, gameState, eventData) => {
               // Needs logic in Player.endTurn to check for Retain keyword/status
               // For now, let's just draw one extra card and let player choose what to keep implicitly
               if(player) {
                    // player.applyStatus('RetainNextTurn', 1, 1); // Needs status handling
                    console.log("Artifact Triggered: Sticky Concept - Retain effect needs implementation. Drawing +1 card instead.");
                    player.drawCards(1);
                    player.gameStateRef?.uiManager?.showNotification("Sticky Concept: +1 Card Draw (Retain Placeholder)");
               }
          }
      },

    // --- Uncommon Artifacts ---
    'resonant_echo_s': {
        id: 'resonant_echo_s',
        name: "Resonant Echo (Sensory)",
        description: "Whenever you play an Attack card, gain 1 Block.",
        rarity: 'uncommon',
        trigger: 'onCardPlay',
        condition: (player, gameState, eventData) => eventData?.card?.keywords.includes('Attack'),
        effect: (player, gameState, eventData) => {
            player.gainBlock(1);
            // console.log(`Artifact Triggered: Resonant Echo (S) - Gained 1 Block from playing ${eventData?.card?.name}.`); // Noisy
        }
    },
    'commanders_presence_i': {
        id: 'commanders_presence_i',
        name: "Commander's Presence (Interaction)",
        description: "Enemies start combat with 1 Weak.",
        rarity: 'uncommon',
        trigger: 'onCombatStart', // Trigger when player combat starts
        effect: (player, gameState, eventData) => {
            console.log("Artifact Triggered: Commander's Presence - Applying Weak.");
            gameState?.combatManager?.enemies.forEach(enemy => {
                if (enemy?.applyStatus && enemy.currentHp > 0) { // Check enemy exists, has method, and is alive
                    enemy.applyStatus('Weak', 1, 1, 'Artifact'); // Apply 1 turn of weak, specify source
                }
            });
            // Update UI after applying statuses
            gameState?.uiManager?.updateCombatUI(player, gameState.combatManager.enemies, gameState.combatManager.playerTurn);
        }
    },
    'pillar_of_self_p': {
        id: 'pillar_of_self_p',
        name: "Pillar of Self (Psychological)",
        description: "At the start of your turn, if your Integrity is below 50%, gain 1 Strength.",
        rarity: 'uncommon',
        trigger: 'onTurnStart',
        condition: (player, gameState, eventData) => player && player.currentIntegrity < player.maxIntegrity * 0.5,
        effect: (player, gameState, eventData) => {
            player.applyStatus('Strength', 99, 1, 'Artifact'); // Apply permanent strength for the combat
            console.log("Artifact Triggered: Pillar of Self (P) - Gained 1 Strength.");
            player.gameStateRef?.uiManager?.showNotification("Pillar of Self: Gained Strength!");
        }
    },
     'cartographers_pen_r': {
         id: 'cartographers_pen_r',
         name: "Cartographer's Pen (Relational)",
         description: "Gain 15 Insight when entering a new Floor.",
         rarity: 'uncommon',
         trigger: 'onFloorStart', // Triggered by GameState.advanceFloor -> player.triggerArtifacts
         effect: (player, gameState, eventData) => { // eventData should contain { floor: newFloorNumber }
             if (player) {
                 player.insightThisRun += 15;
                 console.log("Artifact Triggered: Cartographer's Pen - Gained 15 Insight.");
                 player.gameStateRef?.uiManager?.showNotification("+15 Insight (Cartographer's Pen)");
                 // Update map info UI immediately
                 player.gameStateRef?.uiManager?.updatePlayerMapInfo(player, gameState.currentFloor);
             }
         }
     },
    'mirror_shield_i': {
         id: 'mirror_shield_i', name: "Mirror Shield (Interaction)",
         description: "The first time you take unblocked Attack damage each combat, apply 1 Weak to the attacker.",
         rarity: 'uncommon', trigger: 'onDamageTaken', // Trigger on taking damage
         condition: (player, gameState, eventData) => {
            // Check if damage taken > 0, source exists, source is enemy, and shield hasn't been used
            const damageAmount = eventData?.amount ?? 0;
            const sourceIsEnemy = gameState?.combatManager?.enemies.some(e => e.id === eventData?.source?.id);
            return damageAmount > 0 && eventData?.source?.id && sourceIsEnemy && !player?.hasStatus('MirrorShieldUsed');
         },
         effect: (player, gameState, eventData) => {
             const sourceEnemy = gameState?.combatManager?.enemies.find(e => e.id === eventData?.source?.id);
             if (sourceEnemy && player) {
                 sourceEnemy.applyStatus('Weak', 1, 1, 'Artifact'); // Apply 1 Weak
                 player.applyStatus('MirrorShieldUsed', 99, 1, 'ArtifactInternal'); // Apply flag status for rest of combat
                 console.log(`Artifact Triggered: Mirror Shield - Applied Weak to ${sourceEnemy.name}.`);
                 player.gameStateRef?.uiManager?.showNotification("Mirror Shield reflected Weakness!");
                 // Update enemy UI to show Weak status
                 gameState?.uiManager?.updateCombatUI(player, gameState.combatManager.enemies, gameState.combatManager.playerTurn);
             }
         }
     },
    'alchemical_pouch_x': { // Requires Potion cards defined
         id: 'alchemical_pouch_x', name: "Alchemical Pouch",
         description: "At the start of combat, add 2 random basic Potion cards to your hand. They are Ethereal and Exhaust.",
         rarity: 'uncommon', trigger: 'onCombatStart',
         effect: (player, gameState, eventData) => {
              if (player?.deckManager && Data?.concepts) { // Ensure Data and concepts exist
                   console.log("Artifact Triggered: Alchemical Pouch - Adding Potions...");
                   const potionConcepts = Data.concepts.filter(c => c.keywords?.includes('Potion')); // Find concepts marked as Potions
                   if (potionConcepts.length === 0) {
                        console.warn("Alchemical Pouch: No concepts found with 'Potion' keyword in data.js!");
                        return;
                   }
                   let addedCount = 0;
                   for (let i = 0; i < 2; i++) {
                        if (player.deckManager.hand.length >= player.deckManager.maxHandSize) break; // Stop if hand full

                        const randomPotionConcept = potionConcepts[Math.floor(Math.random() * potionConcepts.length)];
                        try {
                            const potionCard = new Card(randomPotionConcept.id); // Create card instance
                            if (potionCard.conceptId !== -1) {
                                // Modify the card instance
                                potionCard.isEthereal = true;
                                potionCard.exhausts = true;
                                if(!potionCard.keywords.includes('Ethereal')) potionCard.keywords.push('Ethereal');
                                if(!potionCard.keywords.includes('Exhaust')) potionCard.keywords.push('Exhaust');
                                potionCard.cost = 0; // Potions usually cost 0

                                player.deckManager.hand.push(potionCard); // Add directly to hand
                                console.log(`   Added Potion: ${potionCard.name} to hand.`);
                                addedCount++;
                            }
                        } catch (error) {
                            console.error(`Alchemical Pouch: Error creating potion card for concept ${randomPotionConcept.id}:`, error);
                        }
                   }
                    if (addedCount > 0) {
                        // Trigger UI update for hand only if cards were added
                        player.gameStateRef?.uiManager?.combatUI?.renderHand(player.deckManager.hand, true);
                    }
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
         effect: (player, gameState, eventData) => {
             player.gainFocus(1);
             console.log("Artifact Triggered: Focus Lens (C) - Gained 1 Focus.");
             // Optionally update UI immediately
             player.gameStateRef?.uiManager?.combatUI?.updatePlayerInfo(player);
         }
     },
     'binding_threads_rf': {
        id: 'binding_threads_rf',
        name: "Binding Threads (RoleFocus)",
        description: "Whenever an enemy applies a negative Status Effect (Weak, Vulnerable, Frail, etc.) to you, it takes 3 damage.",
        rarity: 'rare',
        trigger: 'onStatusAppliedToPlayer',
        condition: (player, gameState, eventData) => {
            const debuffs = ['Weak', 'Vulnerable', 'Frail', 'Poison', 'Burn', 'Confusion', 'Entangle', 'Stun']; // Define negative statuses
            const status = eventData?.status;
            const sourceEnemy = gameState?.combatManager?.enemies.find(e => e.id === status?.source); // Check source is an enemy
            return status && debuffs.includes(status.id) && sourceEnemy && sourceEnemy.currentHp > 0;
        },
        effect: (player, gameState, eventData) => {
             const sourceEnemy = gameState.combatManager.enemies.find(e => e.id === eventData?.status?.source);
             if (sourceEnemy) {
                  sourceEnemy.takeDamage(3, 'Retribution'); // Deal damage
                  console.log(`Artifact Triggered: Binding Threads (RF) - Dealt 3 damage to ${sourceEnemy.name}.`);
                  player.gameStateRef?.uiManager?.showActionFeedback(`${sourceEnemy.name} took 3 damage!`, 'info');
                  // Update enemy UI
                   gameState?.uiManager?.combatUI?.renderEnemies(gameState.combatManager.enemies, gameState.combatManager.playerTurn);
             }
        }
     },
    'alchemists_stone_x': { // Powerful cross-element artifact
        id: 'alchemists_stone_x',
        name: "Alchemist's Stone (Synthesis)",
        description: "At the start of combat, gain 1 Strength, 1 Dexterity, and Heal 5 Integrity.",
        rarity: 'rare', // Could be Boss rarity if desired
        trigger: 'onCombatStart',
        effect: (player, gameState, eventData) => {
            if(player) {
                player.applyStatus('Strength', 99, 1, 'Artifact');
                player.applyStatus('Dexterity', 99, 1, 'Artifact');
                player.heal(5);
                console.log("Artifact Triggered: Alchemist's Stone - Gained Str, Dex, Heal.");
                player.gameStateRef?.uiManager?.showNotification("Alchemist's Stone Activated!");
            }
        }
    },
    'shadow_insight_artifact': { // Placeholder from original list
        id: 'shadow_insight_artifact',
        name: "Shadow Insight",
        description: "Whenever a card is Exhausted, gain 1 Focus next turn.",
        rarity: 'rare',
        trigger: 'onCardExhaust', // Triggered by Player before card moves to exhaust pile
        effect: (player, gameState, eventData) => {
            if (player) {
                player.applyStatus('FocusNextTurn', 2, 1, 'Artifact'); // Duration 2 = gain start of next turn, removed end of next turn
                console.log("Artifact Triggered: Shadow Insight - Queued 1 Focus gain.");
                 player.gameStateRef?.uiManager?.showNotification("Shadow Insight: Focus next turn!");
            }
        }
    },
    'philosophers_catalyst_p': {
         id: 'philosophers_catalyst_p', name: "Philosopher's Catalyst (P)",
         description: "Whenever you heal Integrity, gain Block equal to the amount healed.",
         rarity: 'rare', trigger: 'onHeal', // Triggered AFTER heal amount is calculated and applied
         condition: (player, gameState, eventData) => eventData?.amount > 0, // Only trigger if actual healing happened
         effect: (player, gameState, eventData) => {
              const healAmount = eventData.amount;
              if (player && healAmount > 0) {
                  player.gainBlock(healAmount);
                   console.log(`Artifact Triggered: Catalyst - Gained ${healAmount} Block from healing.`);
                   player.gameStateRef?.uiManager?.showNotification(`Catalyst: +${healAmount} Block!`);
              }
         }
     },
     'labyrinth_map_r': { // Passive Example
          id: 'labyrinth_map_r', name: "Labyrinth Map (R)",
          description: "You can now see paths 2 nodes ahead on the map.",
          rarity: 'rare', trigger: 'passive', // No event trigger
          isPassive: true, // Mark as passive
          effect: null // Logic handled directly in Map rendering/generation based on player having artifact
      },
      'echo_chamber_c': { // NEW Rare
          id: 'echo_chamber_c', name: 'Echo Chamber (C)',
          description: 'The first card you play each turn is played an additional time.',
          rarity: 'rare', trigger: 'onCardPlay',
          // Needs state tracking for first card played this turn
          condition: (player, gameState, eventData) => {
              const isFirstCard = (gameState?.combatManager?.turnState?.cardsPlayedThisTurn ?? 0) === 1;
              // Prevent infinite loops with itself or other echo effects
              const cardPlayed = eventData?.card;
              const isEchoedPlay = eventData?.isEchoedPlay ?? false; // Check for flag in eventData
              return isFirstCard && cardPlayed && !isEchoedPlay;
          },
          effect: (player, gameState, eventData) => {
              const originalCard = eventData?.card;
              const originalTarget = eventData?.target; // Need combat manager to pass original target
              if (originalCard && player && gameState?.combatManager) {
                  console.log(`Artifact Triggered: Echo Chamber - Replaying ${originalCard.name}`);
                  player.gameStateRef?.uiManager?.showNotification(`Echo Chamber: ${originalCard.name} played again!`);
                  // Re-execute the card's effect, potentially targeting the same initial target
                  // Crucially, add a flag to prevent infinite loops with this artifact
                  const echoEventData = { ...eventData, isEchoedPlay: true };
                  // Find the correct target again if it was an enemy
                  let reTarget = null;
                   if(originalTarget && originalTarget.id && gameState.combatManager.enemies.some(e => e.id === originalTarget.id)){
                        reTarget = gameState.combatManager.enemies.find(e => e.id === originalTarget.id);
                   } else if(originalTarget === player){
                        reTarget = player;
                   }
                  // Directly execute the logic again
                   originalCard.effectLogic(player, reTarget, gameState.combatManager.enemies);
                   // Note: This doesn't re-trigger 'onCardPlay' artifacts for the echo, preventing loops there too.
                   // Doesn't re-spend Focus. Doesn't move the card again (it's already discarded/exhausted).
              }
          }
      }

    // --- Add More Artifacts Here ---

};
