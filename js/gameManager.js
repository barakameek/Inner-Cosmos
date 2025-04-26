// js/gameManager.js

class GameManager {
    /**
     * @param {object | null} personaLabData - Data loaded from localStorage, or null.
     */
    constructor(personaLabData) {
        console.log("GameManager initializing...");
        // Use provided data or set defaults if null/undefined
        this.personaLabData = personaLabData || { discoveredConcepts: {}, attunement: {} };
        this.currentState = GameState.LOADING;
        this.lastInputPos = { x: 0, y: 0 }; // Store last known mouse position

        // --- Run-specific state ---
        this.player = null;
        this.currentRunPoolIds = []; // IDs of cards available in the run's draft pool
        this.currentMap = null;
        this.currentLayer = 0; // 0-based internal index
        this.currentNode = null; // The MapNode the player is currently at
        this.insightShards = 0;
        this.currentRelics = []; // Array of RelicDefinition objects acquired this run
        this.pendingCardRewardIds = []; // Card IDs offered as reward choices
        this.pendingRelicRewardId = null; // Relic ID offered as reward choice

        // --- Meta-progression state ---
        // Load from persistence or use defaults
        this.integrationPoints = this.loadIntegrationPoints(); // Meta-currency
        this.unlockedRelicIds = this.loadUnlockedRelics(); // IDs of relics available in runs
        // Player Attunement is loaded/calculated during Player creation potentially
        this.basePlayerAttunement = this.loadPlayerAttunement(); // Base attunement for run start

        // --- Core Components ---
        this.mapGenerator = new MapGenerator();
        this.combatManager = null; // Instantiated when combat starts
        this.uiManager = null; // Will be created in main.js and potentially passed or accessed globally

        // --- Input handling ---
        this.lastClick = null; // Stores {x, y} of the last click event processed

        // --- UI State for Specific Nodes ---
        // Respite Node State
        this.respiteOptions = [
            { id: 'heal', text: 'Meditate (Heal 25% HP)', bounds: null, isHovered: false },
            { id: 'refine', text: 'Refine (Remove a Card)', bounds: null, isHovered: false }
        ];
        this.refineModeActive = false; // Flag when player is selecting card to remove
        this.refineCardSelection = []; // Stores { card: Card, bounds: object } for display
        this.refineCardsPerPage = 15;
        this.refineCurrentPage = 0;
        this.refinePaginationButtons = { // Store button objects { text, bounds, isHovered }
            prev: null,
            next: null,
            cancel: { text: 'Cancel', bounds: { x: 20, y: CANVAS_HEIGHT - 60, width: 100, height: 40 }, isHovered: false }
        };
        // Shop Node State (Placeholder)
        // Event Node State (Placeholder)

        console.log("GameManager initialized.");
    }

    // --- State Management ---

    changeState(newState) {
        if (newState === this.currentState) {
             // console.warn(`Attempted to change to the same state: ${newState}`);
             return;
        }
        console.log(`Changing state from ${this.currentState} to ${newState}`);
        this.onStateExit(this.currentState);
        this.currentState = newState;
        this.onStateEnter(this.currentState);
    }

    onStateEnter(state) {
        this.lastClick = null; // Clear clicks on state change
        this.lastInputPos = { x:0, y:0 }; // Reset mouse pos? Or keep? Keep for now.
        switch (state) {
            case GameState.RUN_SETUP:
                this.setupNewRun();
                // setupNewRun will auto-transition to MAP when done
                break;
            case GameState.MAP:
                if (!this.currentMap || !this.currentNode) {
                    console.error("Cannot enter MAP state without a valid map/current node!");
                    this.changeState(GameState.MAIN_MENU);
                } else {
                     // Ensure map nodes are correctly marked as reachable/visible based on current node
                     this.currentMap.revealConnectedNodes(this.currentNode.id);
                }
                break;
            case GameState.COMBAT:
                if (!this.currentNode || (this.currentNode.type !== NodeType.ENCOUNTER && this.currentNode.type !== NodeType.ELITE_ENCOUNTER && this.currentNode.type !== NodeType.BOSS)) {
                    console.error("Cannot enter COMBAT state without a valid combat node!", this.currentNode);
                    this.changeState(GameState.MAP);
                    return;
                }
                const enemyIds = this.currentNode.data?.enemies; // Get enemies from node data
                if (!enemyIds || enemyIds.length === 0) {
                     console.error("Combat node has no enemy IDs defined!", this.currentNode);
                     this.changeState(GameState.MAP);
                     return;
                }
                // Create combat manager instance
                this.combatManager = new CombatManager(this.player, enemyIds, this);
                this.combatManager.startCombat();
                break;
            case GameState.REWARD_SCREEN:
                console.log("Entering Reward Screen");
                // Prepare rewards based on last combat/event outcome stored in pendingRewards
                this.calculateRewardButtonBounds(); // Set up bounds for card/relic choices
                break;
            case GameState.EVENT:
                console.log("Entering Event Node (Needs Implementation)");
                 // TODO: Load event data based on currentNode.data.eventId
                 // Transition back to map for now
                 setTimeout(() => this.changeState(GameState.MAP), 1500);
                 break;
            case GameState.SHOP:
                 console.log("Entering Shop Node (Needs Implementation)");
                 // TODO: Load shop inventory, set up buttons
                 // Transition back to map for now
                 setTimeout(() => this.changeState(GameState.MAP), 1500);
                 break;
            case GameState.RESPITE:
                 console.log("Entering Respite Node");
                 this.refineModeActive = false; // Reset refine mode on entry
                 this.refineCardSelection = []; // Clear card selection cache
                 this.calculateRespiteButtonBounds(); // Calculate initial option bounds
                 break;
            case GameState.RUN_OVER:
                console.log("Entering Run Over Screen (Needs Implementation)");
                 // Could wait for player input or timeout
                 setTimeout(() => this.changeState(GameState.MAIN_MENU), 4000); // Auto-return for now
                 break;
            case GameState.MAIN_MENU:
                 console.log("Entering Main Menu (Needs Implementation)");
                 // Reset run state variables
                 this.player = null;
                 this.currentMap = null;
                 this.currentNode = null;
                 this.currentRunPoolIds = [];
                 this.currentRelics = [];
                 this.combatManager = null; // Clear combat manager too
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
                console.log(`Exiting Combat State. Player Won: ${this.combatManager?.playerWon}`);
                this.combatManager = null; // Allow garbage collection
                break;
            case GameState.RESPITE:
                this.refineModeActive = false;
                this.refineCardSelection = [];
                console.log("Exited Respite State.");
                break;
             case GameState.REWARD_SCREEN:
                 // Clear pending rewards after leaving reward screen
                 this.pendingCardRewardIds = [];
                 this.pendingRelicRewardId = null;
                 this.rewardCardButtons = []; // Clear calculated bounds
                 this.rewardRelicButton = null;
                 this.rewardSkipButton = null;
                 console.log("Exited Reward Screen.");
                 break;
            // Add cleanup for other states if necessary
        }
    }

    // --- Game Loop Functions ---

    update(deltaTime) {
        // Update mouse position state FIRST
        // Assumes main.js updates this via an event listener
        // Example in main.js: canvas.addEventListener('mousemove', (e) => gameManager.updateMousePos(e.clientX, e.clientY));

         // Update hover states based on current state and mouse position
         this.updateHoverStates();

        // Delegate update logic based on the current state
        switch (this.currentState) {
            case GameState.MAP:
                this.handleMapInput(); // Checks lastClick for node clicks
                break;
            case GameState.COMBAT:
                if (this.combatManager) {
                    this.combatManager.update(deltaTime);
                    // Check if combat ended and GameManager needs to take over
                    if (this.combatManager.isCombatOver) {
                        this.handleCombatEnd(this.combatManager.playerWon, this.combatManager.pendingRewards);
                        // Change state happens within handleCombatEnd
                    }
                }
                break;
             case GameState.RESPITE:
                 this.handleRespiteInput(); // Checks lastClick for option/card clicks
                 break;
             case GameState.REWARD_SCREEN:
                  this.handleRewardInput(); // Checks lastClick for reward choices/skip
                  break;
            // Add update logic for Event, Shop, RunOver, MainMenu if they become interactive
        }

        // Clear processed click *after* potential use in state handlers
        this.lastClick = null;
    }

    render(ctx) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Delegate rendering based on the current state
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
            default:
                 this.renderText(ctx, `Unknown State: ${this.currentState}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
                 break;
        }
         // Render global HUD (if not handled entirely by UIManager)
         // Only render HUD if a run is active and not in menu/loading states
          if (this.player && this.currentState !== GameState.LOADING && this.currentState !== GameState.MAIN_MENU && this.currentState !== GameState.RUN_SETUP) {
             this.renderHUD(ctx);
         }

         // Render UIManager elements (e.g., tooltips) last / on top
         if (this.uiManager) {
              this.uiManager.render(); // Assumes UIManager uses the shared context
         }

         // Temporary State Display always visible for debugging
         ctx.fillStyle = '#888'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
         ctx.fillText(`State: ${this.currentState}`, 5, CANVAS_HEIGHT - 5);
         ctx.fillText(`Mouse: (${this.lastInputPos.x}, ${this.lastInputPos.y})`, 5, CANVAS_HEIGHT - 20);
    }

    // --- Input Handling ---

    // Called by event listeners in main.js
    updateMousePos(event) {
        const rect = event.target.getBoundingClientRect(); // Assumes event target is canvas
        this.lastInputPos.x = Math.round(event.clientX - rect.left);
        this.lastInputPos.y = Math.round(event.clientY - rect.top);
    }
    registerClick() {
        this.lastClick = { ...this.lastInputPos }; // Register click at current mouse pos
    }

    updateHoverStates() {
        // Reset hover states for relevant UI elements
        this.respiteOptions.forEach(opt => opt.isHovered = false);
        Object.values(this.refinePaginationButtons).forEach(btn => { if(btn) btn.isHovered = false; });
        // Reset reward button hover states (if calculated)
        if (this.rewardCardButtons) this.rewardCardButtons.forEach(btn => btn.isHovered = false);
        if (this.rewardRelicButton) this.rewardRelicButton.isHovered = false;
        if (this.rewardSkipButton) this.rewardSkipButton.isHovered = false;
        // Main menu button hover...

        // Delegate hover updates based on state
         switch (this.currentState) {
            case GameState.MAP:
                 if (this.currentMap) this.currentMap.updateHover(this.lastInputPos.x, this.lastInputPos.y);
                 break;
            case GameState.COMBAT:
                  if (this.combatManager) this.combatManager.updateHoverStates(); // CombatManager handles its own hovers
                  break;
            case GameState.RESPITE:
                 this.updateRespiteHoverStates();
                 break;
            case GameState.REWARD_SCREEN:
                 this.updateRewardHoverStates();
                 break;
            case GameState.MAIN_MENU:
                 // Update main menu button hover state
                 break;
         }
    }


     // --- Specific State Logic ---

    setupNewRun() {
        console.log("Setting up new run...");
        this.currentLayer = 0; // Start at layer 0 (displayed as 1)
        this.insightShards = INITIAL_INSIGHT_SHARDS;
        this.currentRelics = [];

        // 1. Create Player
        const startingHp = BASE_PLAYER_HP; // TODO: Modify based on meta-progression
        const startingInsight = BASE_PLAYER_INSIGHT; // TODO: Modify based on meta-progression
        // Apply attunement loaded from storage/persona lab
        this.player = new Player(startingHp, startingInsight, this.basePlayerAttunement);
        this.player.maxCardsPerTurn = MAX_CARDS_PER_TURN_PLAY; // Reset max cards per turn

        // 2. Generate Run Pool IDs from available cards
        const availableCardIds = this.getAvailableCardPoolIds();
        const runPoolSize = Math.min(availableCardIds.length, STARTING_DECK_DRAFT_POOL_SIZE);
        this.currentRunPoolIds = this.selectRunPool(availableCardIds, runPoolSize);
        console.log(`Generated Run Pool with ${this.currentRunPoolIds.length} card IDs.`);

        // 3. Draft Starting Deck (Simplified: Starters + Random from Run Pool)
        const startingDeckIds = this.draftStartingDeck(this.currentRunPoolIds, STARTING_DECK_SIZE);
        this.player.initializeDeck(startingDeckIds);
        console.log(`Drafted starting deck (${this.player.masterDeck.length} cards).`);

        // 4. Choose/Assign Starting Relic
        // Filter starter relics by those the player has unlocked
        const possibleStarterRelics = Object.values(BASE_RELIC_POOL)
                                    .filter(r => r.rarity === CardRarity.STARTER && this.unlockedRelicIds.includes(r.id))
                                    .map(r => r.id);
        if (possibleStarterRelics.length > 0) {
            // TODO: Implement starting relic choice UI if multiple are unlocked
            const chosenRelicId = getRandomElement(possibleStarterRelics);
            this.addRelic(chosenRelicId); // Adds relic and applies immediate effects
        } else {
            console.warn("No unlocked starting relics available!");
        }

        // 5. Generate Map for Layer 1 (index 0)
        this.currentMap = this.mapGenerator.generateLayer(this.currentLayer, this); // Pass GM reference
        this.currentNode = this.currentMap.getStartingNode();
        if (!this.currentNode) {
            console.error("Map generated without a starting node!");
            this.changeState(GameState.MAIN_MENU); return;
        }
        this.currentNode.isCurrent = true; // Mark start node as current
        // Initial reveal happens in generateLayer now

        console.log("Run setup complete.");
        this.changeState(GameState.MAP);
    }

    getAvailableCardPoolIds() {
        // Get all non-Starter, non-Special cards from the base pool
        const basePoolIds = Object.values(BASE_CARD_POOL)
            .filter(cardDef => cardDef.rarity !== CardRarity.STARTER &&
                               cardDef.rarity !== CardRarity.SPECIAL &&
                               cardDef.type !== CardType.CURSE &&
                               cardDef.type !== CardType.STATUS)
            .map(cardDef => cardDef.id);

        // Filter based on Persona Lab discovered concepts if data exists
        if (this.personaLabData?.discoveredConcepts && Object.keys(this.personaLabData.discoveredConcepts).length > 0) {
            const discoveredIds = Object.keys(this.personaLabData.discoveredConcepts);
            const discoveredSet = new Set(discoveredIds);
            const filteredPool = basePoolIds.filter(id => discoveredSet.has(id));

            // Use filtered pool only if it's large enough
            const minPoolSizeForDraft = STARTING_DECK_SIZE * 2; // Need reasonable variety
            if (filteredPool.length >= minPoolSizeForDraft) {
                 console.log(`Using ${filteredPool.length} cards based on discovered Persona Lab concepts.`);
                 return filteredPool;
            } else {
                 console.warn(`Persona Lab filter resulted in too few cards (${filteredPool.length}). Falling back to base pool of ${basePoolIds.length} cards.`);
                 return basePoolIds;
            }
        } else {
            console.log("No Persona Lab data or concepts found, using base card pool.");
            return basePoolIds;
        }
    }

    selectRunPool(availableCardIds, targetSize) {
         shuffleArray(availableCardIds);
         const actualSize = Math.min(availableCardIds.length, targetSize);
         return availableCardIds.slice(0, actualSize);
    }

    draftStartingDeck(runPoolIds, deckSize) {
        // TODO: Implement actual drafting UI/logic instead of random pick
        const starterCardIds = [
            'starter_strike', 'starter_strike', 'starter_strike', 'starter_strike',
            'starter_defend', 'starter_defend', 'starter_defend', 'starter_defend',
            'starter_doubt'
        ];
        const numCardsToDraft = Math.max(0, deckSize - starterCardIds.length);

        let draftedCards = [];
        if (numCardsToDraft > 0 && runPoolIds.length > 0) {
             let draftPool = [...runPoolIds];
             shuffleArray(draftPool);
             draftedCards = draftPool.slice(0, Math.min(numCardsToDraft, draftPool.length));
        }

        // Ensure deck reaches target size even if pool is small (add more basics)
        while (starterCardIds.length + draftedCards.length < deckSize) {
            console.warn("Run pool too small to draft full starting deck complement. Adding extra starter Defend.");
            starterCardIds.push('starter_defend'); // Add more Defends if needed
        }

        const finalDeckIds = [...starterCardIds, ...draftedCards];
        // Don't shuffle the final result here, player initializes deck which shuffles draw pile
        return finalDeckIds;
    }

    handleMapInput() {
        if (!this.lastClick || !this.currentMap || !this.player || !this.currentNode) return;

        const clickedNode = this.currentMap.getNodeAt(this.lastClick.x, this.lastClick.y);

        if (clickedNode && clickedNode.isReachable) { // Only allow clicking reachable nodes
             // Ensure it's actually connected to the current node
             if (this.currentNode.nextNodes.includes(clickedNode.id)) {
                  console.log(`Clicked reachable node: ${clickedNode.id} (${clickedNode.type})`);
                  this.moveToNode(clickedNode);
             } else {
                  console.log(`Clicked node ${clickedNode.id} is reachable but not directly connected to ${this.currentNode.id}.`);
             }
        }
        // Click is consumed regardless of outcome
        // this.lastClick = null; // Now cleared in main update loop
    }

    moveToNode(targetNode) {
         if (!targetNode || !this.currentNode) return;
         console.log(`Moving from node ${this.currentNode.id} (${this.currentNode.type}) to ${targetNode.id} (${targetNode.type})`);

         // Update map state: Mark previous node visited, current node not current, target node current
         this.currentNode.isCurrent = false;
         this.currentNode.isVisited = true;
         this.currentNode.isReachable = false; // Can no longer move back to previous node implicitly
         // Mark all previously reachable nodes as no longer reachable
         this.currentNode.nextNodes.forEach(id => {
              const node = this.currentMap.getNode(id);
              if (node) node.isReachable = false;
         });


         this.currentNode = targetNode;
         this.currentNode.isCurrent = true;
         this.currentNode.isVisible = true; // Should already be visible
         this.currentNode.isReachable = false; // Cannot move *to* the node you are on

         // Reveal next layer of nodes and mark them reachable
         this.currentMap.revealConnectedNodes(this.currentNode.id);

         // --- Trigger node action by changing game state ---
         // Store node type before potentially changing state
         const nodeType = targetNode.type;
         this.changeState(this.getStateForNodeType(nodeType));
    }

    getStateForNodeType(nodeType) {
        switch (nodeType) {
            case NodeType.ENCOUNTER:
            case NodeType.ELITE_ENCOUNTER:
            case NodeType.BOSS:
                return GameState.COMBAT;
            case NodeType.EVENT: return GameState.EVENT;
            case NodeType.SHOP: return GameState.SHOP;
            case NodeType.RESPITE: return GameState.RESPITE;
            default:
                console.warn(`Unhandled node type for state transition: ${nodeType}`);
                return GameState.MAP; // Stay on map if node type is unknown/unhandled
        }
    }


    handleCombatEnd(victory, rewardsFromCombat) {
        // This is called from GameManager's update loop when combatManager.isCombatOver is true
        if (!this.currentNode) return;

        const encounterType = this.currentNode.type;

        if (victory) {
            console.log(`Combat Victory at ${encounterType}!`);

            // --- Calculate Base Rewards from Node ---
            let baseShards = 0;
            // Sum rewards from defeated enemies (if defined)
            // Note: combatManager doesn't store defeated enemies, maybe pass IDs?
            // For simplicity, use node type for now
            if (encounterType === NodeType.ENCOUNTER) baseShards = getRandomInt(15, 25);
            else if (encounterType === NodeType.ELITE_ENCOUNTER) baseShards = getRandomInt(50, 75);
            else if (encounterType === NodeType.BOSS) baseShards = getRandomInt(100, 150);

            this.gainInsightShards(baseShards);

            // --- Determine Offered Rewards (Cards/Relics) ---
            // Store these in pendingRewards for the RewardScreen state
            this.pendingCardRewardIds = this.generateCardRewards(encounterType);
            if (encounterType === NodeType.ELITE_ENCOUNTER || encounterType === NodeType.BOSS) {
                 this.pendingRelicRewardId = this.generateRelicReward(encounterType);
            } else {
                 this.pendingRelicRewardId = null;
            }
            console.log("Pending Rewards:", { cards: this.pendingCardRewardIds, relic: this.pendingRelicRewardId });


            // --- Check for Advancement or Run End ---
            if (encounterType === NodeType.BOSS) {
                if (this.currentLayer < MAX_LAYERS - 1) { // Layers are 0-indexed
                    // Don't go to reward screen, just advance
                    this.advanceToNextLayer();
                    return; // State change handled by advanceToNextLayer
                } else {
                    console.log("Final Boss Defeated! Run Complete!");
                    this.endRun(true); // Ends run, changes state to RUN_OVER
                    return; // State change handled by endRun
                }
            }

            // --- Transition to Reward Screen (if not advancing layer/ending run) ---
             this.changeState(GameState.REWARD_SCREEN);

        } else {
            console.log("Combat Defeat...");
            this.endRun(false); // Ends run, changes state to RUN_OVER
        }
    }

    // --- Reward Screen Logic ---

    calculateRewardButtonBounds() {
         // Reset bounds
         this.rewardCardButtons = [];
         this.rewardRelicButton = null;
         this.rewardSkipButton = null;

         const cardButtonWidth = 200;
         const cardButtonHeight = 50;
         const relicButtonWidth = 200;
         const relicButtonHeight = 50;
         const skipButtonWidth = 100;
         const skipButtonHeight = 40;
         const startY = 200;
         const spacingY = 60;

         // Card choices
         this.pendingCardRewardIds.forEach((cardId, index) => {
             const cardDef = getCardDefinition(cardId);
             const text = cardDef ? cardDef.name : `Unknown (${cardId})`;
             const bounds = {
                 x: CANVAS_WIDTH / 2 - cardButtonWidth / 2,
                 y: startY + index * spacingY,
                 width: cardButtonWidth,
                 height: cardButtonHeight
             };
             this.rewardCardButtons.push({ id: cardId, text: text, bounds: bounds, isHovered: false });
         });

          // Relic choice (if any)
          let currentY = startY + this.pendingCardRewardIds.length * spacingY;
          if (this.pendingRelicRewardId) {
               const relicDef = getRelicDefinition(this.pendingRelicRewardId);
               const text = relicDef ? relicDef.name : `Unknown (${this.pendingRelicRewardId})`;
                const bounds = {
                    x: CANVAS_WIDTH / 2 - relicButtonWidth / 2,
                    y: currentY,
                    width: relicButtonWidth,
                    height: relicButtonHeight
                };
                this.rewardRelicButton = { id: this.pendingRelicRewardId, text: text, bounds: bounds, isHovered: false };
                currentY += spacingY;
          }

         // Skip button
          const skipBounds = {
               x: CANVAS_WIDTH / 2 - skipButtonWidth / 2,
               y: CANVAS_HEIGHT - 100,
               width: skipButtonWidth,
               height: skipButtonHeight
          };
         this.rewardSkipButton = { id: 'skip', text: 'Skip', bounds: skipBounds, isHovered: false };
    }

    updateRewardHoverStates() {
          if (this.currentState !== GameState.REWARD_SCREEN) return;
          const mousePos = this.lastInputPos;
          if (!mousePos) return;

          this.rewardCardButtons.forEach(btn => btn.isHovered = this.isPointInRect(mousePos, btn.bounds));
          if (this.rewardRelicButton) this.rewardRelicButton.isHovered = this.isPointInRect(mousePos, this.rewardRelicButton.bounds);
          if (this.rewardSkipButton) this.rewardSkipButton.isHovered = this.isPointInRect(mousePos, this.rewardSkipButton.bounds);
    }

    handleRewardInput() {
        if (!this.lastClick) return;

        // Check card choices
        for (const button of this.rewardCardButtons) {
            if (this.isPointInRect(this.lastClick, button.bounds)) {
                console.log(`Selected card reward: ${button.text}`);
                this.addCardToPlayerDeck(button.id);
                this.finishRewardState(); // Leave after choosing one
                return;
            }
        }

         // Check relic choice
        if (this.rewardRelicButton && this.isPointInRect(this.lastClick, this.rewardRelicButton.bounds)) {
            console.log(`Selected relic reward: ${this.rewardRelicButton.text}`);
            this.addRelic(this.rewardRelicButton.id);
            this.finishRewardState(); // Leave after choosing one
            return;
        }

        // Check skip button
        if (this.rewardSkipButton && this.isPointInRect(this.lastClick, this.rewardSkipButton.bounds)) {
            console.log("Skipped rewards.");
            this.finishRewardState();
            return;
        }
    }

    addCardToPlayerDeck(cardId) {
         const definition = getCardDefinition(cardId);
         if (definition && this.player) {
              const newCard = new Card(definition);
              this.player.addCardToDeck(newCard, 'discard'); // Add to discard pile usually
              console.log(`Added ${definition.name} to deck.`);
         } else {
              console.error(`Could not add card ID ${cardId} to deck.`);
         }
    }


    // Called when player makes choices on reward screen or skips
    finishRewardState() {
          // Note: Pending rewards are cleared in onStateExit
          this.changeState(GameState.MAP);
    }

    // --- Currency & Relics ---

    gainInsightShards(amount) {
        if (amount <= 0) return;
        this.insightShards += amount;
        console.log(`Gained ${amount} Insight Shards. Total: ${this.insightShards}`);
        // TODO: Trigger UI effect
    }

     addRelic(relicId) {
         const relicDef = getRelicDefinition(relicId);
         if (relicDef && !this.currentRelics.some(r => r.id === relicId)) {
             console.log(`Adding relic: ${relicDef.name} (${relicDef.id})`);
             this.currentRelics.push(relicDef); // Store the definition object
             this.applyRelicImmediateEffects(relicDef);
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
            // Log handled within player.modifyStat
         }
         // Example: gain max HP
         // if (relicDef.effects?.gainMaxHp) this.player.modifyStat('maxHp', relicDef.effects.gainMaxHp);
     }

     // --- Reward Generation ---

     generateCardRewards(encounterType) {
         // Use the run's specific pool for rewards
         let possibleRewardIds = [...this.currentRunPoolIds];

         // Filter out curses/status if they somehow got into run pool
         possibleRewardIds = possibleRewardIds.filter(id => {
              const def = getCardDefinition(id);
              return def && def.type !== CardType.CURSE && def.type !== CardType.STATUS;
         });

         // If run pool is too small, supplement with global pool (commons?)
         if (possibleRewardIds.length < 3) {
              const globalCommons = Object.values(BASE_CARD_POOL)
                  .filter(c => c.rarity === CardRarity.COMMON && c.type !== CardType.CURSE && c.type !== CardType.STATUS)
                  .map(c => c.id);
               possibleRewardIds = [...new Set([...possibleRewardIds, ...globalCommons])];
         }

          // Rarity weighting
          const rarityWeights = {
              [CardRarity.COMMON]: 75,
              [CardRarity.UNCOMMON]: 20,
              [CardRarity.RARE]: 5
          };
          if (encounterType === NodeType.ELITE_ENCOUNTER) {
              rarityWeights[CardRarity.COMMON] = 50;
              rarityWeights[CardRarity.UNCOMMON] = 35;
              rarityWeights[CardRarity.RARE] = 15;
          } else if (encounterType === NodeType.BOSS) {
              rarityWeights[CardRarity.COMMON] = 20;
              rarityWeights[CardRarity.UNCOMMON] = 50;
              rarityWeights[CardRarity.RARE] = 30;
          }

          const choices = [];
          const availablePool = [...possibleRewardIds]; // Copy pool to draw from
          shuffleArray(availablePool);

          for (let i = 0; i < 3; i++) { // Offer 3 choices
              if (availablePool.length === 0) break; // Stop if pool empty

              // Select rarity based on weights
              const totalWeight = Object.values(rarityWeights).reduce((s, w) => s + w, 0);
              let roll = Math.random() * totalWeight;
              let chosenRarity = CardRarity.COMMON; // Default
              for (const [rarity, weight] of Object.entries(rarityWeights)) {
                   if (roll < weight) { chosenRarity = rarity; break; }
                   roll -= weight;
              }

              // Find a card of that rarity from the available pool
              let foundCardId = null;
              let foundIndex = -1;
               for (let j = 0; j < availablePool.length; j++) {
                   const cardId = availablePool[j];
                   const cardDef = getCardDefinition(cardId);
                   if (cardDef && cardDef.rarity === chosenRarity) {
                        foundCardId = cardId;
                        foundIndex = j;
                        break;
                   }
               }
               // If no card of chosen rarity found, try next lower rarity or just pick any
               if (foundIndex === -1) {
                    // Fallback: just pick the first available card regardless of rarity
                    foundIndex = 0;
                    foundCardId = availablePool[0];
               }

               if (foundCardId) {
                    choices.push(foundCardId);
                    availablePool.splice(foundIndex, 1); // Remove from pool for next choice
               }
          }

          console.log("Generated Card Reward Choices:", choices);
          return choices;
     }

     generateRelicReward(encounterType) {
          // Determine possible rarity based on encounter
           let possibleRarities = [];
           let weights = {};
           if (encounterType === NodeType.ELITE_ENCOUNTER) {
                weights = { [CardRarity.COMMON]: 60, [CardRarity.UNCOMMON]: 35, [CardRarity.RARE]: 5 };
           } else if (encounterType === NodeType.BOSS) {
                weights = { [CardRarity.RARE]: 70, [CardRarity.BOSS]: 30 }; // Bosses give Rare/Boss
           } else return null; // Only Elite/Boss give relics this way

           const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0);
           let roll = Math.random() * totalWeight;
           let chosenRarity = Object.keys(weights)[0]; // Default to first
           for (const [rarity, weight] of Object.entries(weights)) {
                if (roll < weight) { chosenRarity = rarity; break; }
                roll -= weight;
           }
           possibleRarities.push(chosenRarity); // Target this rarity

          let possibleRelicIds = [];
          possibleRarities.forEach(rarity => {
              possibleRelicIds.push(...getRelicIdsByRarity(rarity));
          });

          // Filter by unlocked relics and exclude already owned relics
          const ownedRelicIds = new Set(this.currentRelics.map(r => r.id));
          const unlockedSet = new Set(this.unlockedRelicIds);

          let availableUnlocked = possibleRelicIds.filter(id =>
              unlockedSet.has(id) && !ownedRelicIds.has(id)
          );

          // If no relic of desired rarity found, try lower rarities (if Elite)
           if (availableUnlocked.length === 0 && encounterType === NodeType.ELITE_ENCOUNTER) {
                console.warn(`No suitable ${chosenRarity} relic found. Trying Uncommon...`);
                availableUnlocked = getRelicIdsByRarity(CardRarity.UNCOMMON).filter(id => unlockedSet.has(id) && !ownedRelicIds.has(id));
                if (availableUnlocked.length === 0) {
                     console.warn(`No suitable Uncommon relic found. Trying Common...`);
                     availableUnlocked = getRelicIdsByRarity(CardRarity.COMMON).filter(id => unlockedSet.has(id) && !ownedRelicIds.has(id));
                }
           }

          if (availableUnlocked.length === 0) {
               console.warn("Could not find any suitable unlocked, unowned relic reward.");
               return null; // No relic reward offered
          }

          shuffleArray(availableUnlocked);
          const choice = availableUnlocked[0];
          console.log(`Offering ${chosenRarity} Relic Reward Choice:`, choice);
          return choice; // Offer 1 relic choice
     }

    // --- Layer Advancement & Run End ---

    advanceToNextLayer() {
        this.currentLayer++;
        console.log(`Advancing to Layer ${this.currentLayer + 1}`); // Display 1-based layer

        // Generate new map for the next layer
        this.currentMap = this.mapGenerator.generateLayer(this.currentLayer, this); // Pass GM reference
        this.currentNode = this.currentMap.getStartingNode();
        if (!this.currentNode) {
            console.error(`Map for layer ${this.currentLayer + 1} generated without a starting node!`);
            this.endRun(false); return; // End run on error
        }
        this.currentNode.isCurrent = true;
        // revealConnectedNodes happens in generateLayer/onStateEnter(MAP) now

        // Optional: Heal player between layers
        if(this.player) this.player.heal(Math.floor(this.player.maxHp * 0.25)); // Heal 25% max HP

        this.changeState(GameState.MAP); // Go to the new map
    }

    endRun(victory) {
        console.log(`Run ended. Victory: ${victory}`);
        // Calculate Attunement XP (Placeholder - needs tracking element usage)
        let attunementGains = {}; // e.g., { [Elements.COGNITIVE]: 10, ... }
        console.log("Attunement XP calculation not implemented.");

        // Calculate Integration Points
        let integrationPointsGained = 0;
        if (victory) {
             integrationPointsGained = 100 + ((this.currentLayer + 1) * 50); // More points for winning deeper runs
        } else {
            integrationPointsGained = 10 + ((this.currentLayer + 1) * 15); // Fewer points on loss
        }
        // Bonus for Elites/Bosses defeated? Needs tracking.
        integrationPointsGained = Math.max(0, integrationPointsGained);

        this.integrationPoints += integrationPointsGained;
        console.log(`Gained ${integrationPointsGained} Integration Points. Total: ${this.integrationPoints}`);

        // TODO: Apply attunement XP gains to meta-progression data
        // TODO: Update unlocked relics based on run achievements?

        this.saveMetaProgression(); // Save points, unlocks etc.
        this.changeState(GameState.RUN_OVER);
    }

    // --- Meta-Progression Loading/Saving ---

    loadIntegrationPoints() {
        const saved = localStorage.getItem('grimoire_integrationPoints');
        return saved ? parseInt(saved, 10) : 0;
    }

    loadUnlockedRelics() {
        let unlocked = [];
        const saved = localStorage.getItem('grimoire_unlockedRelics');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                 if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
                     unlocked = parsed;
                 } else {
                      console.warn("Invalid unlocked relics data found in localStorage. Resetting.");
                 }
            } catch (e) {
                 console.error("Error parsing unlocked relics from localStorage:", e);
            }
        }
        // Ensure all starter relics are always considered unlocked
        const starterRelics = Object.values(BASE_RELIC_POOL)
                                  .filter(r => r.rarity === CardRarity.STARTER)
                                  .map(r => r.id);
         // Combine saved unlocks with starters, removing duplicates
         const finalUnlocked = [...new Set([...unlocked, ...starterRelics])];
         console.log("Loaded/Defaulted unlocked relics:", finalUnlocked);
         return finalUnlocked;
    }

    loadPlayerAttunement() {
        // Priority: 1) Persona Lab Data, 2) Saved Roguelite Data, 3) Defaults
        let loadedAttunement = null;
        if (this.personaLabData?.attunement && Object.keys(this.personaLabData.attunement).length > 0) {
             // Validate lab data structure? Assume it's correct for now.
             loadedAttunement = this.personaLabData.attunement;
             console.log("Loading base player attunement from Persona Lab data:", loadedAttunement);
        }
        // TODO: Add loading from roguelite-specific saved attunement if needed
        // const savedRogueliteAttunement = localStorage.getItem('grimoire_attunement');
        // if (!loadedAttunement && savedRogueliteAttunement) { ... }

        // Return loaded data merged with defaults, or just defaults
        if (loadedAttunement) {
            return { ...DEFAULT_PLAYER_ATTUNEMENT, ...loadedAttunement };
        } else {
             console.log("Using default player attunement.");
             return { ...DEFAULT_PLAYER_ATTUNEMENT };
        }
    }

    saveMetaProgression() {
         try {
            localStorage.setItem('grimoire_integrationPoints', this.integrationPoints.toString());
            // Save only non-starter relics explicitly? Or save all known unlocked ones? Save all.
            localStorage.setItem('grimoire_unlockedRelics', JSON.stringify(this.unlockedRelicIds));
            // Save attunement levels if they are modified by the roguelite?
            // localStorage.setItem('grimoire_attunement', JSON.stringify(this.playerAttunement));
            console.log("Saved meta-progression to localStorage.");
         } catch (e) {
             console.error("Error saving meta-progression to localStorage:", e);
         }
    }

     // --- Respite Node Logic --- (Copied and integrated from previous step)

    calculateRespiteButtonBounds() {
        const buttonWidth = 300;
        const buttonHeight = 50;
        const startY = CANVAS_HEIGHT / 2 - 50;
        const spacingY = 70;

        this.respiteOptions.forEach((option, index) => {
             option.bounds = {
                 x: CANVAS_WIDTH / 2 - buttonWidth / 2,
                 y: startY + index * spacingY,
                 width: buttonWidth,
                 height: buttonHeight
             };
             option.isHovered = false; // Reset hover state
        });
    }

     updateRespiteHoverStates() {
          if (this.currentState !== GameState.RESPITE) return;
          const mousePos = this.lastInputPos;
          if (!mousePos) return;

          if (this.refineModeActive) {
               // Card hover
               const cardsOnPage = this.getRefineCardsForCurrentPage();
               cardsOnPage.forEach(cardData => {
                   // Need to recalculate bounds here if they aren't stored persistently or passed
                   // Assume bounds are calculated in renderRefineSelection and stored temporarily
                   // For now, skip card hover effect update here unless bounds are stable
               });
               // Button hover
                if (this.refinePaginationButtons.prev) this.refinePaginationButtons.prev.isHovered = this.isPointInRect(mousePos, this.refinePaginationButtons.prev.bounds);
                if (this.refinePaginationButtons.next) this.refinePaginationButtons.next.isHovered = this.isPointInRect(mousePos, this.refinePaginationButtons.next.bounds);
                if (this.refinePaginationButtons.cancel) this.refinePaginationButtons.cancel.isHovered = this.isPointInRect(mousePos, this.refinePaginationButtons.cancel.bounds);

          } else {
               // Option hover
               this.respiteOptions.forEach(option => {
                    option.isHovered = option.bounds && this.isPointInRect(mousePos, option.bounds);
               });
          }
     }

    handleRespiteInput() {
        if (!this.lastClick) return;

        if (this.refineModeActive) {
            // --- Handling clicks while choosing a card to remove ---

            // Check pagination buttons
            if (this.refinePaginationButtons.prev?.isHovered) {
                 this.refineCurrentPage = Math.max(0, this.refineCurrentPage - 1);
                 this.lastClick = null; return;
            }
             if (this.refinePaginationButtons.next?.isHovered) {
                  const maxPage = Math.ceil(this.refineCardSelection.length / this.refineCardsPerPage) - 1;
                  this.refineCurrentPage = Math.min(maxPage, this.refineCurrentPage + 1);
                  this.lastClick = null; return;
             }
             // Check Cancel button
             if (this.refinePaginationButtons.cancel?.isHovered) {
                  console.log("Cancelled refine.");
                  this.refineModeActive = false;
                  this.lastClick = null;
                  return;
             }

            // Check card clicks - Needs stable bounds calculation, often done *during render*
            // Re-calculate or retrieve bounds based on current page and click position
             const cardsOnPage = this.getRefineCardsForCurrentPage();
             const cardBoundsOnPage = this.calculateRefineCardBounds(cardsOnPage); // Needs implementation or use render calculation
             cardBoundsOnPage.forEach((boundsData, index) => {
                 if (this.isPointInRect(this.lastClick, boundsData.bounds)) {
                     const cardToRemove = boundsData.card;
                     console.log(`Selected card to refine: ${cardToRemove.name}`);
                     // Confirm before removing? Add later.
                     const success = this.player.removeCardFromDeck(cardToRemove);
                     if (success) {
                          this.finishRespite(); // Leave respite after successful removal
                     } else {
                          console.error("Failed to remove selected card!");
                          this.prepareRefineSelection(); // Refresh list
                     }
                     this.lastClick = null;
                     return;
                 }
             });

        } else {
            // --- Handling clicks on initial Respite options ---
            this.respiteOptions.forEach(option => {
                if (option.isHovered) { // Check hover state set by updateHoverStates
                    this.executeRespiteOption(option.id);
                    this.lastClick = null;
                    return;
                }
            });
        }
        // Consume click if not handled
        this.lastClick = null;
    }

    executeRespiteOption(optionId) {
        switch (optionId) {
            case 'heal':
                const healAmount = Math.floor(this.player.maxHp * 0.25);
                const actualHealed = this.player.heal(healAmount);
                console.log(`Chose to heal. Healed ${actualHealed} HP.`);
                this.finishRespite();
                break;
            case 'refine':
                let refineLimit = 1; // Base limit
                // Check relics for bonus refines
                if (this.currentRelics.some(r => r.id === 'meditative_focus')) {
                     refineLimit += 1; // Example relic effect check
                }
                // TODO: Track refines used at this node if limit > 1 matters

                console.log("Chose to refine. Entering card selection mode.");
                this.refineModeActive = true;
                this.refineCurrentPage = 0;
                this.prepareRefineSelection();
                break;
            default:
                console.warn(`Unknown respite option selected: ${optionId}`);
                break;
        }
    }

    prepareRefineSelection() {
        if (!this.player) return;
        // Prepare the list of cards (with bounds for clicking) to display for removal
        // Filter out basic starter cards? Maybe allow removing Strikes/Defends but not curses?
        this.refineCardSelection = this.player.masterDeck
            .filter(card => card.rarity !== CardRarity.STARTER && card.id !== 'starter_doubt') // Can't remove starters/starting curse
            .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
            .map(card => ({ card: card, bounds: null })); // Bounds calculated during render/input check
    }

    getRefineCardsForCurrentPage() {
        const startIndex = this.refineCurrentPage * this.refineCardsPerPage;
        const endIndex = startIndex + this.refineCardsPerPage;
        return this.refineCardSelection.slice(startIndex, endIndex);
    }

     // Calculates and returns bounds for cards currently visible in refine view
     // Needed for click detection as render state might change frame-to-frame
     calculateRefineCardBounds(cardsToDisplay) {
         const boundsData = [];
         const cardWidth = 110; const cardHeight = 154; const cardsPerRow = 5;
         const spacingX = 20; const spacingY = 20;
         const totalGridWidth = cardsPerRow * (cardWidth + spacingX) - spacingX;
         const startX = CANVAS_WIDTH / 2 - totalGridWidth / 2;
         let currentX = startX; let currentY = 120; let cardsInRow = 0;

         cardsToDisplay.forEach(cardData => {
             boundsData.push({
                 card: cardData.card, // Include card reference
                 bounds: { x: currentX, y: currentY, width: cardWidth, height: cardHeight }
             });
             currentX += cardWidth + spacingX; cardsInRow++;
             if (cardsInRow >= cardsPerRow) { currentX = startX; currentY += cardHeight + spacingY; cardsInRow = 0; }
         });
         return boundsData;
     }


    finishRespite() {
        // Action complete, transition back to map
        console.log("Leaving Respite.");
        this.changeState(GameState.MAP);
    }

    // --- Rendering Placeholders ---

     renderText(ctx, text, x, y, size = 20, color = '#FFF', align = 'center', baseline = 'middle') {
        ctx.fillStyle = color;
        ctx.font = `${size}px sans-serif`;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        ctx.fillText(text, x, y);
    }
     wrapText(context, text, x, y, maxWidth, lineHeight) { // Copied from CombatManager for use here
         if (!text) return; const words = text.split(' '); let line = ''; let lines = [];
         const initialY = y;
         for (let n = 0; n < words.length; n++) {
             const testLine = line + words[n] + ' '; const metrics = context.measureText(testLine);
             const testWidth = metrics.width;
             if (testWidth > maxWidth && n > 0) { lines.push(line); line = words[n] + ' '; } else { line = testLine; }
         } lines.push(line); y = initialY - (lines.length - 1) * lineHeight;
         for (let k = 0; k < lines.length; k++) { context.fillText(lines[k].trim(), x, y + k * lineHeight); }
     }

    renderLoadingScreen(ctx) { this.renderText(ctx, 'Loading Grimoire...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 30); }
    renderRunSetupScreen(ctx) { this.renderText(ctx, 'Setting up Run / Drafting...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 30); }
    renderMapScreen(ctx) { if(this.currentMap) { this.currentMap.render(ctx); } else { this.renderText(ctx, 'Error: Map not loaded!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 24, '#F88'); } }
    renderEventScreen(ctx) { this.renderText(ctx, 'Event Node', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 30); }
    renderShopScreen(ctx) { this.renderText(ctx, 'Shop Node', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 30); }

    renderRespiteScreen(ctx) {
        if (this.refineModeActive) {
            this.renderRefineSelection(ctx);
        } else {
            this.renderRespiteOptions(ctx);
        }
    }

    renderRespiteOptions(ctx) {
        this.renderText(ctx, 'Respite', CANVAS_WIDTH / 2, 100, 40);
        this.renderText(ctx, 'A moment of calm reflection.', CANVAS_WIDTH / 2, 150, 20, '#DDD');

        this.respiteOptions.forEach(option => {
            if (option.bounds) {
                const bounds = option.bounds;
                ctx.fillStyle = option.isHovered ? '#557' : '#446';
                ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
                ctx.strokeStyle = '#88A'; ctx.lineWidth = 2;
                ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
                this.renderText(ctx, option.text, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, 18);
            }
        });
    }

    renderRefineSelection(ctx) {
        this.renderText(ctx, 'Refine: Choose a Card to Remove', CANVAS_WIDTH / 2, 60, 30);

        const cardsToDisplay = this.getRefineCardsForCurrentPage();
        const cardBoundsData = this.calculateRefineCardBounds(cardsToDisplay); // Use calculation

        cardBoundsData.forEach((boundsData) => {
            const card = boundsData.card;
            const bounds = boundsData.bounds;
            // Card hover state - need to check mouse against these bounds
             const isHovered = this.isPointInRect(this.lastInputPos, bounds);

             ctx.fillStyle = isHovered ? '#444' : '#333'; // Slightly lighter on hover
             ctx.strokeStyle = isHovered ? '#FFF' : (ElementColors[card.element] || '#888');
             ctx.lineWidth = isHovered ? 3 : 2;
             ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
             ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

             // Card Text
             ctx.fillStyle = '#FFF'; ctx.textAlign = 'center';
             ctx.font = '12px sans-serif'; ctx.textBaseline = 'top';
             this.wrapText(ctx, card.name, bounds.x + bounds.width / 2, bounds.y + 5, bounds.width - 10, 14);
             ctx.font = '10px sans-serif'; ctx.textBaseline = 'bottom';
             ctx.fillText(`(${card.cost ?? 'N/A'}) ${card.type}`, bounds.x + bounds.width / 2, bounds.y + bounds.height - 5);
        });

         // Pagination
         const maxPage = Math.ceil(this.refineCardSelection.length / this.refineCardsPerPage) - 1;
         if (maxPage > 0) {
              const pageText = `Page ${this.refineCurrentPage + 1} / ${maxPage + 1}`;
              const buttonY = CANVAS_HEIGHT - 40;
               this.renderText(ctx, pageText, CANVAS_WIDTH / 2, buttonY, 14, '#FFF');
              if (this.refinePaginationButtons.prev) {
                  const btn = this.refinePaginationButtons.prev;
                  ctx.fillStyle = btn.isHovered ? '#668' : '#557'; ctx.fillRect(btn.bounds.x, btn.bounds.y, btn.bounds.width, btn.bounds.height);
                  this.renderText(ctx, btn.text, btn.bounds.x + btn.bounds.width / 2, buttonY, 14, '#FFF'); }
              if (this.refinePaginationButtons.next) {
                  const btn = this.refinePaginationButtons.next;
                  ctx.fillStyle = btn.isHovered ? '#668' : '#557'; ctx.fillRect(btn.bounds.x, btn.bounds.y, btn.bounds.width, btn.bounds.height);
                  this.renderText(ctx, btn.text, btn.bounds.x + btn.bounds.width / 2, buttonY, 14, '#FFF'); }
         }
          // Cancel Button
          if (this.refinePaginationButtons.cancel) {
               const btn = this.refinePaginationButtons.cancel;
               ctx.fillStyle = btn.isHovered ? '#944' : '#833'; ctx.fillRect(btn.bounds.x, btn.bounds.y, btn.bounds.width, btn.bounds.height);
               this.renderText(ctx, btn.text, btn.bounds.x + btn.bounds.width / 2, btn.bounds.y + btn.bounds.height / 2, 16, '#FFF');
          }
    }

    renderRewardScreen(ctx) {
         this.renderText(ctx, 'Combat Victory!', CANVAS_WIDTH / 2, 100, 30);
         let currentY = 180;
         const spacingY = 60;
         const btnWidth = 250;
         const btnHeight = 50;

         // Draw card choices
         if (this.rewardCardButtons && this.rewardCardButtons.length > 0) {
             this.renderText(ctx, 'Choose a Card:', CANVAS_WIDTH / 2, currentY, 24);
             currentY += 40;
             this.rewardCardButtons.forEach(button => {
                  ctx.fillStyle = button.isHovered ? '#557' : '#446';
                  ctx.fillRect(button.bounds.x, button.bounds.y, button.bounds.width, button.bounds.height);
                  ctx.strokeStyle = '#88A'; ctx.lineWidth=1; ctx.strokeRect(button.bounds.x, button.bounds.y, button.bounds.width, button.bounds.height);
                  this.renderText(ctx, button.text, button.bounds.x + button.bounds.width / 2, button.bounds.y + button.bounds.height / 2, 16);
                  currentY += spacingY; // Adjust Y for next potential section
             });
         }

         // Draw relic choice
         if (this.rewardRelicButton) {
              currentY = this.rewardRelicButton.bounds.y; // Reset Y based on calculated bounds
              this.renderText(ctx, 'Relic Reward:', CANVAS_WIDTH / 2, currentY - 30, 24); // Label above button
              const button = this.rewardRelicButton;
              ctx.fillStyle = button.isHovered ? '#775' : '#664'; // Goldish button?
              ctx.fillRect(button.bounds.x, button.bounds.y, button.bounds.width, button.bounds.height);
              ctx.strokeStyle = '#BA8'; ctx.lineWidth=1; ctx.strokeRect(button.bounds.x, button.bounds.y, button.bounds.width, button.bounds.height);
              this.renderText(ctx, button.text, button.bounds.x + button.bounds.width / 2, button.bounds.y + button.bounds.height / 2, 16);
         }

         // Draw Skip button
         if(this.rewardSkipButton) {
             const button = this.rewardSkipButton;
             ctx.fillStyle = button.isHovered ? '#777' : '#666';
             ctx.fillRect(button.bounds.x, button.bounds.y, button.bounds.width, button.bounds.height);
             ctx.strokeStyle = '#AAA'; ctx.lineWidth=1; ctx.strokeRect(button.bounds.x, button.bounds.y, button.bounds.width, button.bounds.height);
             this.renderText(ctx, button.text, button.bounds.x + button.bounds.width / 2, button.bounds.y + button.bounds.height / 2, 16);
         }
    }

    renderRunOverScreen(ctx) {
        // Determine victory based on player health *at the time endRun was called*
        // Needs a flag set in endRun, as player object might be null later.
        // Let's assume playerWon flag exists. Need to add it in endRun.
        const victory = this.playerWonFlag || false; // Need to set playerWonFlag in endRun
        this.renderText(ctx, victory ? 'Integration Achieved!' : 'Overwhelmed', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60, 40);
        this.renderText(ctx, `Integration Points Gained: ${this.lastRunIntegrationPoints || 0}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 0, 24); // Need to store points gained
        this.renderText(ctx, `Total Points: ${this.integrationPoints}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30, 18);
         this.renderText(ctx, '(Returning to menu...)', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100, 16, '#AAA');
    }
    renderMainMenuScreen(ctx) {
         this.renderText(ctx, 'Grimoire Roguelite', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3, 48);
         // Placeholder for Start Button
         const btnX = CANVAS_WIDTH / 2; const btnY = CANVAS_HEIGHT / 2 + 50;
         const btnW = 200; const btnH = 60;
         // TODO: Define bounds, check hover, handle click -> changeState(GameState.RUN_SETUP)
         ctx.fillStyle = '#558'; ctx.fillRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH);
         this.renderText(ctx, 'Start New Run', btnX, btnY, 24, '#FFF');
    }

    renderHUD(ctx) {
         const hudY = 0; const hudHeight = 50;
         ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fillRect(0, hudY, CANVAS_WIDTH, hudHeight);
         ctx.textBaseline = 'middle';
         let xPos = 15;
         if (this.player) { // Player HP
             const hpText = `Composure: ${this.player.currentHp} / ${this.player.maxHp}`;
             this.renderText(ctx, hpText, xPos, hudY + hudHeight / 2, 18, '#FFD700', 'left');
             xPos += ctx.measureText(hpText).width + 30; }
         // Insight Shards
         const shardText = `Shards: ${this.insightShards}`;
         this.renderText(ctx, shardText, xPos, hudY + hudHeight / 2, 18, '#ADD8E6', 'left');
         xPos += ctx.measureText(shardText).width + 30;
         // Deck/Discard Count
         if(this.player){
             const deckText = `Deck: ${this.player.drawPile.length}`;
             const discardText = `Discard: ${this.player.discardPile.length}`;
             this.renderText(ctx, deckText, xPos, hudY + hudHeight / 2, 18, '#FFF', 'left');
             xPos += ctx.measureText(deckText).width + 20;
             this.renderText(ctx, discardText, xPos, hudY + hudHeight / 2, 18, '#AAA', 'left');
             xPos += ctx.measureText(discardText).width + 30; }
         // Current Layer
         this.renderText(ctx, `Layer: ${this.currentLayer + 1} / ${MAX_LAYERS}`, xPos, hudY + hudHeight / 2, 18, '#FFF', 'left');
         // Relics (Right side)
         if (this.currentRelics.length > 0) {
             let relicX = CANVAS_WIDTH - 15;
             this.currentRelics.forEach(relic => {
                  const name = relic.name; // Simple name for now
                  const textWidth = ctx.measureText(name).width;
                  this.renderText(ctx, name, relicX, hudY + hudHeight / 2, 16, '#AFEEEE', 'right');
                  relicX -= textWidth + 15; }); // Move left for next relic
         } else { this.renderText(ctx, 'No Relics', CANVAS_WIDTH - 15, hudY + hudHeight / 2, 16, '#888', 'right'); }
    }

     // Utility to check point in rectangle
     isPointInRect(point, rect) {
         if (!point || !rect) return false;
         return point.x >= rect.x && point.x <= rect.x + rect.width &&
                point.y >= rect.y && point.y <= rect.y + rect.height;
     }

} // End GameManager Class
