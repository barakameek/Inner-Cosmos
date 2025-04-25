// js/gameManager.js

class GameManager {
    constructor(personaLabData) {
        console.log("GameManager initializing...");
        // Use provided data or set defaults if null/undefined
        this.personaLabData = personaLabData || { discoveredConcepts: {}, attunement: {} };
        this.currentState = GameState.LOADING;

        // --- Run-specific state ---
        this.player = null;
        this.currentRunDeckIds = []; // IDs of cards available in the current run pool
        this.currentMap = null;
        this.currentLayer = 0;
        this.currentNode = null; // The map node the player is currently at
        this.insightShards = 0;
        this.currentRelics = []; // RelicDefinition objects acquired this run

        // --- Meta-progression state ---
        // Load from persistence or use defaults
        this.integrationPoints = this.loadIntegrationPoints(); // Meta-currency
        this.unlockedRelicIds = this.loadUnlockedRelics(); // IDs of relics available in runs
        this.playerAttunement = this.loadPlayerAttunement(); // Load from Lab data or use defaults

        // --- Core Components ---
        this.mapGenerator = new MapGenerator();
        this.combatManager = null; // Instantiated when combat starts
        // this.uiManager = new UIManager(); // If needed for complex global UI
        // this.eventManager = null; // For handling text events
        // this.rewardManager = null; // Could manage reward generation/display

        // --- Input handling ---
        this.lastClick = null; // Stores {x, y} of the last click event

        console.log("GameManager initialized.");
    }

    // --- State Management ---

    changeState(newState) {
        if (newState === this.currentState) {
             console.warn(`Attempted to change to the same state: ${newState}`);
             return;
        }
        console.log(`Changing state from ${this.currentState} to ${newState}`);
        this.onStateExit(this.currentState);
        this.currentState = newState;
        this.onStateEnter(this.currentState);
    }

    onStateEnter(state) {
        this.lastClick = null; // Clear clicks on state change
        switch (state) {
            case GameState.RUN_SETUP:
                this.setupNewRun();
                // setupNewRun will auto-transition to MAP when done
                break;
            case GameState.MAP:
                // Ensure map exists before entering state
                if (!this.currentMap || !this.currentNode) {
                    console.error("Cannot enter MAP state without a valid map/current node!");
                    this.changeState(GameState.MAIN_MENU); // Go back to menu on error
                }
                break;
            case GameState.COMBAT:
                if (!this.currentNode || (this.currentNode.type !== NodeType.ENCOUNTER && this.currentNode.type !== NodeType.ELITE_ENCOUNTER && this.currentNode.type !== NodeType.BOSS)) {
                    console.error("Cannot enter COMBAT state without a valid combat node!", this.currentNode);
                    this.changeState(GameState.MAP); // Go back to map if invalid node
                    return;
                }
                const enemyIds = this.currentNode.enemies;
                if (!enemyIds || enemyIds.length === 0) {
                     console.error("Combat node has no enemy IDs defined!", this.currentNode);
                     this.changeState(GameState.MAP);
                     return;
                }
                // Create combat manager instance
                this.combatManager = new CombatManager(this.player, enemyIds, this); // Pass references
                this.combatManager.startCombat();
                break;
            case GameState.REWARD_SCREEN:
                // Prepare rewards based on last combat/event outcome
                // Needs data passed from where it was triggered (e.g., combat end)
                console.log("Entering Reward Screen (Needs Implementation)");
                 // For now, just auto-advance after short delay
                 setTimeout(() => this.finishRewardState(), 1500);
                break;
            case GameState.EVENT:
                console.log("Entering Event Node (Needs Implementation)");
                 // Transition back to map for now
                 setTimeout(() => this.changeState(GameState.MAP), 1500);
                 break;
            case GameState.SHOP:
                 console.log("Entering Shop Node (Needs Implementation)");
                 // Transition back to map for now
                 setTimeout(() => this.changeState(GameState.MAP), 1500);
                 break;
            case GameState.RESPITE:
                 console.log("Entering Respite Node (Needs Implementation)");
                 // Transition back to map for now
                 setTimeout(() => this.changeState(GameState.MAP), 1500);
                 break;
            case GameState.RUN_OVER:
                console.log("Entering Run Over Screen (Needs Implementation)");
                 // Could have logic waiting for player input to return to menu
                 setTimeout(() => this.changeState(GameState.MAIN_MENU), 4000); // Auto-return for now
                 break;
            case GameState.MAIN_MENU:
                 console.log("Entering Main Menu (Needs Implementation)");
                 // Reset run state variables?
                 this.player = null;
                 this.currentMap = null;
                 this.currentNode = null;
                 this.currentRunDeckIds = [];
                 this.currentRelics = [];
                 break;
            default:
                console.warn(`Entered unknown state: ${state}`);
                break;
        }
    }

    onStateExit(state) {
        switch (state) {
            case GameState.COMBAT:
                // Clean up combat manager instance
                this.combatManager = null;
                console.log("Exited Combat State, cleaned up CombatManager.");
                break;
            // Add cleanup for other states if necessary (e.g., remove event listeners)
        }
    }

    // --- Game Loop Functions ---

    update(deltaTime) {
        // Delegate update logic based on the current state
        switch (this.currentState) {
            case GameState.MAP:
                this.handleMapInput(); // Check for node clicks
                // Other map animations/updates?
                break;
            case GameState.COMBAT:
                if (this.combatManager) {
                    this.combatManager.update(deltaTime);
                    if (this.combatManager.isCombatOver()) {
                        this.handleCombatEnd(this.combatManager.playerWon, this.combatManager.pendingRewards);
                        // Change state happens within handleCombatEnd
                    }
                }
                break;
             case GameState.REWARD_SCREEN:
                 // Handle player choices on rewards
                 // Currently auto-advances via onStateEnter timeout
                 break;
            // Add update logic for Event, Shop, Respite, RunOver, MainMenu if they become interactive
        }

        // Clear processed input *after* potential use in state handlers
        this.lastClick = null;
    }

    render(ctx) {
        // Delegate rendering based on the current state
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Clear canvas each frame
        ctx.fillStyle = '#333'; // Default background
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        switch (this.currentState) {
            case GameState.LOADING: this.renderLoadingScreen(ctx); break;
            case GameState.RUN_SETUP: this.renderRunSetupScreen(ctx); break;
            case GameState.MAP: this.renderMapScreen(ctx); break;
            case GameState.COMBAT:
                if (this.combatManager) this.combatManager.render(ctx);
                break;
            case GameState.REWARD_SCREEN: this.renderRewardScreen(ctx); break;
            case GameState.EVENT: this.renderEventScreen(ctx); break;
            case GameState.SHOP: this.renderShopScreen(ctx); break;
            case GameState.RESPITE: this.renderRespiteScreen(ctx); break;
            case GameState.RUN_OVER: this.renderRunOverScreen(ctx); break;
            case GameState.MAIN_MENU: this.renderMainMenuScreen(ctx); break;
            default: // Draw placeholder for unknown state
                 ctx.fillStyle = '#FFF';
                 ctx.font = '24px sans-serif';
                 ctx.textAlign = 'center';
                 ctx.fillText(`Unknown State: ${this.currentState}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
                 break;
        }
         // Render HUD on top of most states (except maybe loading/menu?)
         if (this.currentState !== GameState.LOADING && this.currentState !== GameState.MAIN_MENU && this.currentState !== GameState.RUN_SETUP) {
             this.renderHUD(ctx);
         }

         // Temporary State Display always visible for debugging
         ctx.fillStyle = '#888';
         ctx.font = '12px sans-serif';
         ctx.textAlign = 'left';
         ctx.textBaseline = 'bottom';
         ctx.fillText(`State: ${this.currentState}`, 5, CANVAS_HEIGHT - 5);
    }

    // --- Input Handling ---

    handleInput(input) {
        // Store the input for processing in the update loop or handle immediately
        if (input.type === 'click') {
            this.lastClick = { x: input.x, y: input.y };
            // console.log(`Click registered at (${input.x}, ${input.y})`); // Can be noisy

             // Delegate click immediately if the state has a dedicated handler
             if (this.currentState === GameState.COMBAT && this.combatManager) {
                 this.combatManager.handleInput(this.lastClick);
             }
             // Other states like Reward, Shop, Event might also handle clicks immediately
             // Otherwise, the state's update method will check this.lastClick (like handleMapInput)
        }
    }

     // --- Specific State Logic ---

    setupNewRun() {
        console.log("Setting up new run...");
        this.currentLayer = 1;
        this.insightShards = INITIAL_INSIGHT_SHARDS;
        this.currentRelics = []; // Reset run relics

        // 1. Create Player
        const startingHp = BASE_PLAYER_HP; // TODO: Modify based on meta-progression
        const startingInsight = BASE_PLAYER_INSIGHT; // TODO: Modify based on meta-progression
        this.player = new Player(startingHp, startingInsight, this.playerAttunement);

        // 2. Generate Run Pool IDs
        const availableCardIds = this.getAvailableCardPoolIds();
        const runPoolSize = Math.min(availableCardIds.length, STARTING_DECK_DRAFT_POOL_SIZE);
        this.currentRunDeckIds = this.selectRunPool(availableCardIds, runPoolSize); // Store the pool for the run
        console.log(`Generated Run Pool with ${this.currentRunDeckIds.length} card IDs.`);

        // 3. Draft Starting Deck (Simplified: Random pick + starters)
        // TODO: Implement actual drafting UI/logic
        const startingDeckIds = this.draftStartingDeck(this.currentRunDeckIds, STARTING_DECK_SIZE);
        this.player.initializeDeck(startingDeckIds); // Give the deck (IDs) to the player
        console.log(`Drafted starting deck (${startingDeckIds.length} cards):`, startingDeckIds);

        // 4. Choose/Assign Starting Relic (Simplified: Give one starter)
        // TODO: Allow choice based on meta-progression unlocks
        const possibleStarterRelics = Object.values(BASE_RELIC_POOL)
                                    .filter(r => r.rarity === CardRarity.STARTER && this.unlockedRelicIds.includes(r.id))
                                    .map(r => r.id);
        if (possibleStarterRelics.length > 0) {
            const chosenRelicId = getRandomElement(possibleStarterRelics);
            this.addRelic(chosenRelicId); // Adds relic and applies immediate effects
        } else {
            console.warn("No unlocked starting relics available!");
        }

        // 5. Generate Map for Layer 1
        this.currentMap = this.mapGenerator.generateLayer(this.currentLayer, null);
        this.currentNode = this.currentMap.getStartingNode();
        if (!this.currentNode) {
            console.error("Map generated without a starting node!");
            this.changeState(GameState.MAIN_MENU); return;
        }
        this.currentNode.isCurrent = true;
        this.currentMap.revealConnectedNodes(this.currentNode.id);

        console.log("Run setup complete.");
        this.changeState(GameState.MAP); // Transition to the map view
    }

    getAvailableCardPoolIds() {
        // Get all non-Starter, non-Special, non-Curse/Status cards
        let basePoolIds = Object.values(BASE_CARD_POOL)
            .filter(cardDef => cardDef.rarity !== CardRarity.STARTER &&
                               cardDef.rarity !== CardRarity.SPECIAL &&
                               cardDef.type !== CardType.CURSE &&
                               cardDef.type !== CardType.STATUS)
            .map(cardDef => cardDef.id);

        // If Persona Lab data exists, filter this pool based on discovered concepts
        if (this.personaLabData && this.personaLabData.discoveredConcepts && Object.keys(this.personaLabData.discoveredConcepts).length > 0) {
            const discoveredIds = Object.keys(this.personaLabData.discoveredConcepts);
            const discoveredSet = new Set(discoveredIds); // Faster lookups
            const filteredPool = basePoolIds.filter(id => discoveredSet.has(id));

            // Only use the filtered pool if it's reasonably large, otherwise log a warning
            if (filteredPool.length >= STARTING_DECK_SIZE) { // Need enough for draft + some variety
                 console.log(`Using ${filteredPool.length} cards based on discovered Persona Lab concepts.`);
                 return filteredPool;
            } else {
                 console.warn(`Persona Lab filter resulted in too few cards (${filteredPool.length}). Falling back to base pool of ${basePoolIds.length} cards.`);
                 return basePoolIds;
            }
        } else {
            console.log("No Persona Lab data or no concepts discovered, using base card pool.");
            return basePoolIds;
        }
    }

    selectRunPool(availableCardIds, targetSize) {
         shuffleArray(availableCardIds);
         const actualSize = Math.min(availableCardIds.length, targetSize);
         return availableCardIds.slice(0, actualSize);
    }

    draftStartingDeck(runPoolIds, deckSize) {
        // Define fixed starter cards
        const starterCardIds = [
            'starter_strike', 'starter_strike', 'starter_strike', 'starter_strike',
            'starter_defend', 'starter_defend', 'starter_defend', 'starter_defend',
            'starter_doubt' // Example starting curse/weakness
        ];
        const numCardsToDraft = deckSize - starterCardIds.length;

        if (numCardsToDraft <= 0) {
            return starterCardIds.slice(0, deckSize); // Return only needed starters
        }

        // Simple random draft from the run pool
        let draftPool = [...runPoolIds]; // Copy pool to avoid modifying original
        shuffleArray(draftPool);
        const draftedCards = draftPool.slice(0, Math.min(numCardsToDraft, draftPool.length));

        // Ensure we have enough cards even if runPool is small
        while (draftedCards.length < numCardsToDraft) {
            console.warn("Run pool too small to draft full starting deck complement. Adding extra starter Defend.");
            draftedCards.push('starter_defend');
        }

        const finalDeckIds = [...starterCardIds, ...draftedCards];
        shuffleArray(finalDeckIds); // Shuffle the combined deck
        return finalDeckIds;
    }

    handleMapInput() {
        if (!this.lastClick || !this.currentMap || !this.player || !this.currentNode) return;

        const clickedNode = this.currentMap.getNodeAt(this.lastClick.x, this.lastClick.y);

        if (clickedNode && clickedNode.isVisible) {
             const possibleNodes = this.currentMap.getNodesReachableFrom(this.currentNode.id);
             if (possibleNodes.includes(clickedNode)) {
                 console.log(`Clicked reachable node: ${clickedNode.id} (${clickedNode.type})`);
                 this.moveToNode(clickedNode);
             } else {
                 console.log(`Clicked node ${clickedNode.id} is visible but not reachable from ${this.currentNode.id}.`);
             }
        }
        // Click is consumed regardless of outcome
        this.lastClick = null;
    }

    moveToNode(targetNode) {
         if (!targetNode || !this.currentNode) return;
         console.log(`Moving from node ${this.currentNode.id} (${this.currentNode.type}) to ${targetNode.id} (${targetNode.type})`);

         // Update map state
         this.currentNode.isCurrent = false;
         this.currentNode.isVisited = true;
         this.currentNode = targetNode;
         this.currentNode.isCurrent = true;
         this.currentNode.isVisible = true; // Should already be visible if reachable

         // Reveal next layer of nodes
         this.currentMap.revealConnectedNodes(this.currentNode.id);

         // Trigger node action by changing game state
         switch (targetNode.type) {
             case NodeType.ENCOUNTER:
             case NodeType.ELITE_ENCOUNTER:
             case NodeType.BOSS:
                 this.changeState(GameState.COMBAT);
                 break;
             case NodeType.EVENT: this.changeState(GameState.EVENT); break;
             case NodeType.SHOP: this.changeState(GameState.SHOP); break;
             case NodeType.RESPITE: this.changeState(GameState.RESPITE); break;
             default:
                 console.warn(`Unhandled node type for state transition: ${targetNode.type}`);
                 this.changeState(GameState.MAP); // Stay on map if node type is unknown
                 break;
         }
    }

    handleCombatEnd(victory, rewards) {
        if (!this.currentNode) return; // Should not happen

        const encounterType = this.currentNode.type;

        if (victory) {
            console.log(`Combat Victory at ${encounterType}!`);
            // Process rewards accumulated during combat
            if (rewards) {
                this.gainInsightShards(rewards.insightShards || 0);
                // Store pending card/relic rewards for the reward screen
                this.pendingCardRewardIds = rewards.cardChoices || [];
                this.pendingRelicRewardId = rewards.relicChoice || null;
                 // TODO: Handle status/curse rewards?
            } else {
                 console.warn("Combat ended with victory but no reward data provided.");
                 // Generate default rewards?
                  this.gainInsightShards(getRandomInt(15, 25)); // Basic shards
                  this.pendingCardRewardIds = this.generateCardRewards(encounterType);
                  if (encounterType === NodeType.ELITE_ENCOUNTER || encounterType === NodeType.BOSS) {
                       this.pendingRelicRewardId = this.generateRelicReward(encounterType);
                  } else {
                       this.pendingRelicRewardId = null;
                  }
            }


            // Check for Boss Defeat / Layer Advancement
            if (encounterType === NodeType.BOSS) {
                if (this.currentLayer < MAX_LAYERS) {
                    this.advanceToNextLayer(); // Handles state change internally
                    return; // Don't go to reward screen if advancing layer immediately
                } else {
                    console.log("Final Boss Defeated! Run Complete!");
                    this.endRun(true); // Ends run, changes state to RUN_OVER
                    return;
                }
            }

            // Transition to Reward Screen
            this.changeState(GameState.REWARD_SCREEN);

        } else {
            console.log("Combat Defeat...");
            this.endRun(false); // Ends run, changes state to RUN_OVER
        }
    }

    // Called when player makes choices on reward screen or it times out
    finishRewardState() {
         // TODO: Process chosen rewards (add card to deck, add relic)
         console.log("Finishing reward state (Add selected card/relic logic here)");
         // Example: if player chose a card with id 'chosenCardId'
         // if(chosenCardId) this.player.addCardToDeck(chosenCardId);
          // if(chosenRelicId) this.addRelic(chosenRelicId);

          // Clear pending rewards
          this.pendingCardRewardIds = [];
          this.pendingRelicRewardId = null;

          // Transition back to map
          this.changeState(GameState.MAP);
    }


    gainInsightShards(amount) {
        if (amount <= 0) return;
        this.insightShards += amount;
        console.log(`Gained ${amount} Insight Shards. Total: ${this.insightShards}`);
        // TODO: Trigger UI effect for gaining shards
    }

     addRelic(relicId) {
         const relicDef = getRelicDefinition(relicId);
         if (relicDef && !this.currentRelics.some(r => r.id === relicId)) {
             console.log(`Adding relic: ${relicDef.name} (${relicDef.id})`);
             this.currentRelics.push(relicDef); // Store the definition object
             this.applyRelicImmediateEffects(relicDef); // Apply stats etc.
              // Potentially trigger CombatManager/Player updates if effects are complex
         } else if (!relicDef) {
             console.warn(`Could not add relic with ID: ${relicId}. Definition not found.`);
         } else {
              console.warn(`Could not add relic with ID: ${relicId}. Already present.`);
         }
     }

     applyRelicImmediateEffects(relicDef) {
         // Apply effects that happen once upon pickup
         if (relicDef.effects?.modifyStat && this.player) {
            const effect = relicDef.effects.modifyStat;
            this.player.modifyStat(effect.stat, effect.value);
            console.log(`Applied relic stat mod: ${effect.stat} +${effect.value}`);
         }
         // Example: Trigger card draw on pickup?
         // if(relicDef.effects?.onPickup?.drawCards) this.player.drawCards(relicDef.effects.onPickup.drawCards);
     }

     // Generates card choices for reward screen
     generateCardRewards(encounterType) {
         // Use the run's specific pool for rewards? Or global pool? Let's try run pool first.
         let possibleRewardIds = [...this.currentRunDeckIds];

         // If run pool is too small, supplement with global pool (commons?)
         if (possibleRewardIds.length < 3) {
              const globalCommons = Object.values(BASE_CARD_POOL)
                  .filter(c => c.rarity === CardRarity.COMMON && c.type !== CardType.CURSE && c.type !== CardType.STATUS)
                  .map(c => c.id);
               possibleRewardIds = [...new Set([...possibleRewardIds, ...globalCommons])]; // Combine and deduplicate
         }

          // TODO: Implement rarity weighting based on encounter type / layer
          // For now, just random 3 from the pool
          shuffleArray(possibleRewardIds);
          const choices = possibleRewardIds.slice(0, 3);
          console.log("Generated Card Reward Choices:", choices);
          return choices;
     }

     // Generates a single relic choice for reward screen
     generateRelicReward(encounterType) {
          let possibleRarities = [];
          if (encounterType === NodeType.ELITE_ENCOUNTER) {
              // Weighted chances for Common/Uncommon/Rare
              const roll = Math.random();
              if (roll < 0.60) possibleRarities.push(CardRarity.COMMON); // 60%
              else if (roll < 0.95) possibleRarities.push(CardRarity.UNCOMMON); // 35%
              else possibleRarities.push(CardRarity.RARE); // 5%
          } else if (encounterType === NodeType.BOSS) {
              // Primarily Rare/Boss relics after boss
              const roll = Math.random();
               if (roll < 0.7) possibleRarities.push(CardRarity.RARE); // 70%
               else possibleRarities.push(CardRarity.BOSS); // 30%
          }

          let possibleRelicIds = [];
          possibleRarities.forEach(rarity => {
              possibleRelicIds.push(...getRelicIdsByRarity(rarity));
          });

          // Filter by unlocked relics and exclude already owned relics
          const ownedRelicIds = this.currentRelics.map(r => r.id);
          const availableUnlocked = possibleRelicIds.filter(id =>
              this.unlockedRelicIds.includes(id) && !ownedRelicIds.includes(id)
          );

          if (availableUnlocked.length === 0) {
              console.warn(`No suitable ${possibleRarities.join('/')} relics found. Trying Common.`);
              const commonRelics = getRelicIdsByRarity(CardRarity.COMMON)
                                   .filter(id => this.unlockedRelicIds.includes(id) && !ownedRelicIds.includes(id));
               if (commonRelics.length > 0) {
                   shuffleArray(commonRelics);
                   const choice = commonRelics[0];
                   console.log("Offering fallback Common Relic Reward Choice:", choice);
                   return choice;
               } else {
                   console.warn("Could not find any suitable relic reward.");
                   return null; // No relic reward offered
               }
          }

          shuffleArray(availableUnlocked);
          const choice = availableUnlocked[0];
          console.log(`Offering ${possibleRarities.join('/')} Relic Reward Choice:`, choice);
          return choice; // Offer 1 relic choice
     }


    advanceToNextLayer() {
        this.currentLayer++;
        console.log(`Advancing to Layer ${this.currentLayer}`);

        // Generate new map for the next layer
        this.currentMap = this.mapGenerator.generateLayer(this.currentLayer, this.currentNode); // Pass previous node for context
        this.currentNode = this.currentMap.getStartingNode();
        if (!this.currentNode) {
            console.error(`Map for layer ${this.currentLayer} generated without a starting node!`);
            this.endRun(false); return; // End run on error
        }
        this.currentNode.isCurrent = true;
        this.currentMap.revealConnectedNodes(this.currentNode.id);

        // Optional: Heal player between layers
        if(this.player) this.player.heal(Math.floor(this.player.maxHp * 0.25)); // Heal 25% max HP

        this.changeState(GameState.MAP); // Go to the new map
    }

    endRun(victory) {
        console.log(`Run ended. Victory: ${victory}`);
        // Calculate Attunement XP (Placeholder)
        let attunementGains = {}; // e.g., { [Elements.COGNITIVE]: 10, ... }
        // Calculate Integration Points (Placeholder)
        let integrationPointsGained = 0;
        if (victory) {
             integrationPointsGained = 100 + (this.currentLayer * 25); // More points for deeper runs
        } else {
            integrationPointsGained = 20 + (this.currentLayer * 10); // Fewer points on loss
        }
        integrationPointsGained = Math.max(0, integrationPointsGained); // Ensure non-negative

        this.integrationPoints += integrationPointsGained;
        console.log(`Gained ${integrationPointsGained} Integration Points. Total: ${this.integrationPoints}`);

        // TODO: Apply attunement XP gains to meta-progression data
        // TODO: Save meta-progression (Integration Points, Unlocks, Attunement)
        this.saveMetaProgression();

        this.changeState(GameState.RUN_OVER);
    }

    // --- Meta-Progression Loading/Saving (Placeholders) ---

    loadIntegrationPoints() {
        const saved = localStorage.getItem('grimoire_integrationPoints');
        return saved ? parseInt(saved, 10) : 0;
    }

    loadUnlockedRelics() {
        const saved = localStorage.getItem('grimoire_unlockedRelics');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                 // Basic validation - check if it's an array of strings
                 if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
                     console.log("Loaded unlocked relics:", parsed);
                     return parsed;
                 } else {
                      console.warn("Invalid unlocked relics data found in localStorage. Resetting.");
                      localStorage.removeItem('grimoire_unlockedRelics'); // Clear invalid data
                 }
            } catch (e) {
                 console.error("Error parsing unlocked relics from localStorage:", e);
                 localStorage.removeItem('grimoire_unlockedRelics'); // Clear invalid data
            }
        }
        // Default: Only starter relics unlocked initially? Or all for testing? Let's start with only starters.
        const starterRelics = Object.values(BASE_RELIC_POOL)
                                  .filter(r => r.rarity === CardRarity.STARTER)
                                  .map(r => r.id);
        console.log("Defaulting to starter relics unlocked:", starterRelics);
        return starterRelics;
    }

    loadPlayerAttunement() {
        // Priority: 1) Persona Lab Data, 2) Saved Roguelite Data, 3) Defaults
        if (this.personaLabData?.attunement && Object.keys(this.personaLabData.attunement).length > 0) {
             console.log("Loading player attunement from Persona Lab data:", this.personaLabData.attunement);
             return { ...DEFAULT_PLAYER_ATTUNEMENT, ...this.personaLabData.attunement };
        }
        // TODO: Add loading from roguelite save data if needed
        console.log("Using default player attunement.");
        return { ...DEFAULT_PLAYER_ATTUNEMENT };
    }

    saveMetaProgression() {
         try {
            localStorage.setItem('grimoire_integrationPoints', this.integrationPoints.toString());
            localStorage.setItem('grimoire_unlockedRelics', JSON.stringify(this.unlockedRelicIds));
            // Save attunement levels if they are modified by the roguelite?
            console.log("Saved meta-progression to localStorage.");
         } catch (e) {
             console.error("Error saving meta-progression to localStorage:", e);
         }
    }

    // --- Rendering Placeholders ---

    renderText(ctx, text, x, y, size = 20, color = '#FFF', align = 'center', baseline = 'middle') {
        ctx.fillStyle = color;
        ctx.font = `${size}px sans-serif`;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        ctx.fillText(text, x, y);
    }

    renderLoadingScreen(ctx) {
        this.renderText(ctx, 'Loading Grimoire...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 30);
    }
    renderRunSetupScreen(ctx) {
        this.renderText(ctx, 'Setting up Run / Drafting...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 30);
        // Add visual feedback for drafting here later
    }
    renderMapScreen(ctx) {
         if(this.currentMap) {
             this.currentMap.render(ctx); // Map handles its own drawing
         } else {
              this.renderText(ctx, 'Error: Map not loaded!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 24, '#F88');
         }
    }
    renderRewardScreen(ctx) {
         this.renderText(ctx, 'Combat Victory!', CANVAS_WIDTH / 2, 100, 30);
         // Draw card choices
         if (this.pendingCardRewardIds && this.pendingCardRewardIds.length > 0) {
             this.renderText(ctx, 'Choose a Card:', CANVAS_WIDTH / 2, 200, 24);
             this.pendingCardRewardIds.forEach((cardId, index) => {
                 const cardDef = getCardDefinition(cardId);
                 const cardName = cardDef ? cardDef.name : `Unknown (${cardId})`;
                 // Basic layout - replace with actual card rendering later
                 this.renderText(ctx, cardName, CANVAS_WIDTH / 2 - 200 + (index * 200), 250, 18);
             });
         }
         // Draw relic choice
         if (this.pendingRelicRewardId) {
             const relicDef = getRelicDefinition(this.pendingRelicRewardId);
             const relicName = relicDef ? relicDef.name : `Unknown (${this.pendingRelicRewardId})`;
             this.renderText(ctx, 'Relic Reward:', CANVAS_WIDTH / 2, 350, 24);
             this.renderText(ctx, relicName, CANVAS_WIDTH / 2, 400, 18);
         }
         // Add "Skip" button text
         this.renderText(ctx, '(Auto-advancing for now...)', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100, 16, '#AAA');
    }
    renderEventScreen(ctx) { this.renderText(ctx, 'Event Node', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 30); }
    renderShopScreen(ctx) { this.renderText(ctx, 'Shop Node', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 30); }
    renderRespiteScreen(ctx) { this.renderText(ctx, 'Respite Node', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 30); }
    renderRunOverScreen(ctx) {
        const victory = this.player ? this.player.currentHp > 0 : false; // Simple check
        this.renderText(ctx, victory ? 'Run Complete!' : 'Run Over', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60, 40);
        this.renderText(ctx, `Integration Points Gained: ${this.integrationPoints}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 0, 24);
        // Add more run summary details here
         this.renderText(ctx, '(Returning to menu...)', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100, 16, '#AAA');
    }
    renderMainMenuScreen(ctx) {
         this.renderText(ctx, 'Grimoire Roguelite', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3, 48);
         // Placeholder for Start Button
         const btnX = CANVAS_WIDTH / 2;
         const btnY = CANVAS_HEIGHT / 2 + 50;
         const btnW = 200;
         const btnH = 60;
         ctx.fillStyle = '#558';
         ctx.fillRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH);
         this.renderText(ctx, 'Start New Run', btnX, btnY, 24, '#FFF');
         // Check if mouse is over button area (simple example)
         // if(this.lastClick && this.lastClick.x > btnX - btnW/2 && ...) // Add click handling in update/handleInput
    }

    renderHUD(ctx) {
         const hudY = 0;
         const hudHeight = 50;
         // Background bar
         ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
         ctx.fillRect(0, hudY, CANVAS_WIDTH, hudHeight);

         ctx.textBaseline = 'middle'; // Align text vertically in the bar

         let xPos = 15;
         // Player HP
         if (this.player) {
             this.renderText(ctx, `Composure: ${this.player.currentHp} / ${this.player.maxHp}`, xPos, hudY + hudHeight / 2, 18, '#FFD700', 'left');
             xPos += ctx.measureText(`Composure: ${this.player.currentHp} / ${this.player.maxHp}`).width + 30; // Dynamic spacing
         }
         // Insight Shards
         this.renderText(ctx, `Shards: ${this.insightShards}`, xPos, hudY + hudHeight / 2, 18, '#ADD8E6', 'left');
         xPos += ctx.measureText(`Shards: ${this.insightShards}`).width + 30;

         // Deck/Discard Count
         if(this.player){
             this.renderText(ctx, `Deck: ${this.player.drawPile.length}`, xPos, hudY + hudHeight / 2, 18, '#FFF', 'left');
             xPos += ctx.measureText(`Deck: ${this.player.drawPile.length}`).width + 20;
             this.renderText(ctx, `Discard: ${this.player.discardPile.length}`, xPos, hudY + hudHeight / 2, 18, '#AAA', 'left');
             xPos += ctx.measureText(`Discard: ${this.player.discardPile.length}`).width + 30;
         }

         // Current Layer
         this.renderText(ctx, `Layer: ${this.currentLayer} / ${MAX_LAYERS}`, xPos, hudY + hudHeight / 2, 18, '#FFF', 'left');

         // Relics (Icons would be better later)
         if (this.currentRelics.length > 0) {
             let relicX = CANVAS_WIDTH - 15;
             this.currentRelics.forEach(relic => {
                  const name = relic.name; // Simple name for now
                  this.renderText(ctx, name, relicX, hudY + hudHeight / 2, 16, '#AFEEEE', 'right');
                  relicX -= ctx.measureText(name).width + 15; // Move left for next relic
             });
         } else {
             this.renderText(ctx, 'No Relics', CANVAS_WIDTH - 15, hudY + hudHeight / 2, 16, '#888', 'right');
         }
    }
}
