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
        this.playerWonFlag = false; // Flag set at end of combat for run over screen
        this.lastRunIntegrationPoints = 0; // Store points gained for run over screen

        // --- Meta-progression state ---
        this.integrationPoints = this.loadIntegrationPoints(); // Meta-currency
        this.unlockedRelicIds = this.loadUnlockedRelics(); // IDs of relics available in runs
        this.basePlayerAttunement = this.loadPlayerAttunement(); // Base attunement for run start

        // --- Core Components ---
        this.mapGenerator = new MapGenerator();
        this.combatManager = null; // Instantiated when combat starts
        this.uiManager = null; // Reference set in main.js

        // --- Input handling ---
        this.lastClick = null; // Stores {x, y} of the last click event processed

        // --- UI State for Specific Nodes / Menus ---
        // Respite Node State
        this.respiteOptions = [
            { id: 'heal', text: 'Meditate (Heal 25% HP)', bounds: null, isHovered: false },
            { id: 'refine', text: 'Refine (Remove a Card)', bounds: null, isHovered: false }
        ];
        this.refineModeActive = false;
        this.refineCardSelection = []; // Stores { card: Card, bounds: object }
        this.refineCardsPerPage = 15;
        this.refineCurrentPage = 0;
        this.refinePaginationButtons = {
            prev: null, // { text, bounds, isHovered }
            next: null,
            cancel: { text: 'Cancel', bounds: { x: 20, y: CANVAS_HEIGHT - 60, width: 100, height: 40 }, isHovered: false }
        };
        // Reward Screen State
        this.rewardCardButtons = []; // { id, text, bounds, isHovered }
        this.rewardRelicButton = null; // { id, text, bounds, isHovered }
        this.rewardSkipButton = null; // { id, text, bounds, isHovered }
        // Main Menu State
        this.mainMenuStartButton = null; // { x, y, width, height, text, isHovered }
        // Shop Node State (Placeholder)
        // Event Node State (Placeholder)

        console.log("GameManager initialized.");
    }

    // --- State Management ---

    changeState(newState) {
        if (newState === this.currentState) { return; }
        console.log(`Changing state from ${this.currentState} to ${newState}`);
        this.onStateExit(this.currentState);
        this.currentState = newState;
        this.onStateEnter(this.currentState);
    }

    onStateEnter(state) {
        this.lastClick = null;
        this.lastInputPos = { x:0, y:0 }; // Reset mouse pos on state change? Maybe not needed.
        switch (state) {
            case GameState.RUN_SETUP:
                this.setupNewRun();
                break;
            case GameState.MAP:
                if (!this.currentMap || !this.currentNode) {
                    console.error("Cannot enter MAP state without a valid map/current node!");
                    this.changeState(GameState.MAIN_MENU);
                } else {
                     this.currentMap.revealConnectedNodes(this.currentNode.id);
                }
                break;
            case GameState.COMBAT:
                if (!this.currentNode || !(this.currentNode.type === NodeType.ENCOUNTER || this.currentNode.type === NodeType.ELITE_ENCOUNTER || this.currentNode.type === NodeType.BOSS)) {
                    console.error("Cannot enter COMBAT state without a valid combat node!", this.currentNode); this.changeState(GameState.MAP); return; }
                const enemyIds = this.currentNode.data?.enemies;
                if (!enemyIds || enemyIds.length === 0) {
                     console.error("Combat node has no enemy IDs defined!", this.currentNode); this.changeState(GameState.MAP); return; }
                this.combatManager = new CombatManager(this.player, enemyIds, this);
                this.combatManager.startCombat();
                break;
            case GameState.REWARD_SCREEN:
                console.log("Entering Reward Screen");
                this.calculateRewardButtonBounds();
                break;
            case GameState.EVENT:
                console.log("Entering Event Node (Needs Implementation)");
                 setTimeout(() => this.changeState(GameState.MAP), 1500); // Placeholder exit
                 break;
            case GameState.SHOP:
                 console.log("Entering Shop Node (Needs Implementation)");
                 setTimeout(() => this.changeState(GameState.MAP), 1500); // Placeholder exit
                 break;
            case GameState.RESPITE:
                 console.log("Entering Respite Node");
                 this.refineModeActive = false;
                 this.refineCardSelection = [];
                 this.calculateRespiteButtonBounds();
                 break;
            case GameState.RUN_OVER:
                console.log("Entering Run Over Screen");
                 setTimeout(() => this.changeState(GameState.MAIN_MENU), 4000); // Auto-return
                 break;
            case GameState.MAIN_MENU:
                 console.log("Entering Main Menu");
                 this.player = null; this.currentMap = null; this.currentNode = null;
                 this.currentRunPoolIds = []; this.currentRelics = []; this.combatManager = null;
                 this.mainMenuStartButton = {
                     x: CANVAS_WIDTH / 2 - 100, y: CANVAS_HEIGHT / 2 + 20, width: 200, height: 60,
                     text: 'Start New Run', isHovered: false
                 };
                 break;
            default: console.warn(`Entered unknown state: ${state}`); break;
        }
    }

    onStateExit(state) {
        switch (state) {
            case GameState.COMBAT:
                console.log(`Exiting Combat State. Player Won: ${this.combatManager?.playerWon}`);
                this.combatManager = null;
                break;
            case GameState.RESPITE:
                this.refineModeActive = false; this.refineCardSelection = [];
                console.log("Exited Respite State.");
                break;
             case GameState.REWARD_SCREEN:
                 this.pendingCardRewardIds = []; this.pendingRelicRewardId = null;
                 this.rewardCardButtons = []; this.rewardRelicButton = null; this.rewardSkipButton = null;
                 console.log("Exited Reward Screen.");
                 break;
             case GameState.MAIN_MENU:
                 this.mainMenuStartButton = null;
                 break;
            // Add cleanup for other states if necessary
        }
    }

    // --- Game Loop Functions ---

    update(deltaTime) {
        this.updateHoverStates(); // Update hover first

        switch (this.currentState) {
            case GameState.MAP: this.handleMapInput(); break;
            case GameState.COMBAT:
                if (this.combatManager) {
                    this.combatManager.update(deltaTime);
                    if (this.combatManager.isCombatOver) {
                        this.handleCombatEnd(this.combatManager.playerWon); // Pass victory flag
                    }
                }
                break;
             case GameState.RESPITE: this.handleRespiteInput(); break;
             case GameState.REWARD_SCREEN: this.handleRewardInput(); break;
             case GameState.MAIN_MENU: this.handleMainMenuInput(); break;
            // Add update logic for Event, Shop, RunOver if interactive
        }
        this.lastClick = null; // Consume click after all handlers check it
    }

    render(ctx) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = '#333'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        switch (this.currentState) {
            case GameState.LOADING: this.renderLoadingScreen(ctx); break;
            case GameState.RUN_SETUP: this.renderRunSetupScreen(ctx); break;
            case GameState.MAP: this.renderMapScreen(ctx); break;
            case GameState.COMBAT: if (this.combatManager) this.combatManager.render(ctx); break;
            case GameState.REWARD_SCREEN: this.renderRewardScreen(ctx); break;
            case GameState.EVENT: this.renderEventScreen(ctx); break;
            case GameState.SHOP: this.renderShopScreen(ctx); break;
            case GameState.RESPITE: this.renderRespiteScreen(ctx); break;
            case GameState.RUN_OVER: this.renderRunOverScreen(ctx); break;
            case GameState.MAIN_MENU: this.renderMainMenuScreen(ctx); break;
            default: this.renderText(ctx, `Unknown State: ${this.currentState}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2); break;
        }
        if (this.player && this.currentState !== GameState.LOADING && this.currentState !== GameState.MAIN_MENU && this.currentState !== GameState.RUN_SETUP) {
             this.renderHUD(ctx);
        }
        if (this.uiManager) { this.uiManager.render(); }

         ctx.fillStyle = '#888'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
         ctx.fillText(`State: ${this.currentState}`, 5, CANVAS_HEIGHT - 5);
         ctx.fillText(`Mouse: (${this.lastInputPos.x}, ${this.lastInputPos.y})`, 5, CANVAS_HEIGHT - 20);
    }

    // --- Input Handling ---

    updateMousePos(event) {
        const rect = event.target.getBoundingClientRect();
        this.lastInputPos.x = Math.round(event.clientX - rect.left);
        this.lastInputPos.y = Math.round(event.clientY - rect.top);
    }
    registerClick() { this.lastClick = { ...this.lastInputPos }; }

    updateHoverStates() {
        // Reset all potential hover states
        this.respiteOptions.forEach(opt => opt.isHovered = false);
        Object.values(this.refinePaginationButtons).forEach(btn => { if(btn) btn.isHovered = false; });
        if (this.rewardCardButtons) this.rewardCardButtons.forEach(btn => btn.isHovered = false);
        if (this.rewardRelicButton) this.rewardRelicButton.isHovered = false;
        if (this.rewardSkipButton) this.rewardSkipButton.isHovered = false;
        if (this.mainMenuStartButton) this.mainMenuStartButton.isHovered = false;

        // Update hover based on current state
         switch (this.currentState) {
            case GameState.MAP: if (this.currentMap) this.currentMap.updateHover(this.lastInputPos.x, this.lastInputPos.y); break;
            case GameState.COMBAT: if (this.combatManager) this.combatManager.updateHoverStates(); break;
            case GameState.RESPITE: this.updateRespiteHoverStates(); break;
            case GameState.REWARD_SCREEN: this.updateRewardHoverStates(); break;
            case GameState.MAIN_MENU: if (this.mainMenuStartButton) this.mainMenuStartButton.isHovered = this.isPointInRect(this.lastInputPos, this.mainMenuStartButton); break;
         }
    }

     handleMainMenuInput() {
         if (this.lastClick && this.mainMenuStartButton?.isHovered) { // Check hover flag
             console.log("Start New Run button clicked!");
             this.changeState(GameState.RUN_SETUP);
         }
    }

    handleMapInput() {
        if (!this.lastClick || !this.currentMap || !this.currentNode) return;
        const clickedNode = this.currentMap.getNodeAt(this.lastClick.x, this.lastClick.y);
        if (clickedNode && clickedNode.isReachable && this.currentNode.nextNodes.includes(clickedNode.id)) {
             this.moveToNode(clickedNode);
        }
    }

     handleRespiteInput() { // Assumes lastClick is checked in update loop
        if (!this.lastClick) return;
        if (this.refineModeActive) {
            if (this.refinePaginationButtons.prev?.isHovered) { this.refineCurrentPage = Math.max(0, this.refineCurrentPage - 1); return; }
            if (this.refinePaginationButtons.next?.isHovered) { const maxPage = Math.ceil(this.refineCardSelection.length / this.refineCardsPerPage) - 1; this.refineCurrentPage = Math.min(maxPage, this.refineCurrentPage + 1); return; }
            if (this.refinePaginationButtons.cancel?.isHovered) { this.refineModeActive = false; return; }
            const cardBoundsOnPage = this.calculateRefineCardBounds(this.getRefineCardsForCurrentPage());
            for (const boundsData of cardBoundsOnPage) {
                if (this.isPointInRect(this.lastClick, boundsData.bounds)) {
                    if (this.player.removeCardFromDeck(boundsData.card)) { this.finishRespite(); }
                    else { console.error("Failed remove"); this.prepareRefineSelection(); }
                    return; // Click handled
                }
            }
        } else {
            for (const option of this.respiteOptions) {
                if (option.isHovered) { this.executeRespiteOption(option.id); return; }
            }
        }
    }

     handleRewardInput() { // Assumes lastClick is checked in update loop
        if (!this.lastClick) return;
        for (const button of this.rewardCardButtons) {
            if (button.isHovered) { this.addCardToPlayerDeck(button.id); this.finishRewardState(); return; }
        }
        if (this.rewardRelicButton?.isHovered) { this.addRelic(this.rewardRelicButton.id); this.finishRewardState(); return; }
        if (this.rewardSkipButton?.isHovered) { this.finishRewardState(); return; }
    }

    // --- Specific State Logic ---

    setupNewRun() { /* ... (code from previous full version) ... */
        console.log("Setting up new run...");
        this.currentLayer = 0; this.insightShards = INITIAL_INSIGHT_SHARDS; this.currentRelics = [];
        const startingHp = BASE_PLAYER_HP; const startingInsight = BASE_PLAYER_INSIGHT;
        this.player = new Player(startingHp, startingInsight, this.basePlayerAttunement);
        this.player.maxCardsPerTurn = MAX_CARDS_PER_TURN_PLAY;
        const availableCardIds = this.getAvailableCardPoolIds();
        const runPoolSize = Math.min(availableCardIds.length, STARTING_DECK_DRAFT_POOL_SIZE);
        this.currentRunPoolIds = this.selectRunPool(availableCardIds, runPoolSize);
        console.log(`Generated Run Pool with ${this.currentRunPoolIds.length} card IDs.`);
        const startingDeckIds = this.draftStartingDeck(this.currentRunPoolIds, STARTING_DECK_SIZE);
        this.player.initializeDeck(startingDeckIds);
        console.log(`Drafted starting deck (${this.player.masterDeck.length} cards).`);
        const possibleStarterRelics = Object.values(BASE_RELIC_POOL)
                                    .filter(r => r.rarity === CardRarity.STARTER && this.unlockedRelicIds.includes(r.id)).map(r => r.id);
        if (possibleStarterRelics.length > 0) { const chosenRelicId = getRandomElement(possibleStarterRelics); this.addRelic(chosenRelicId);
        } else { console.warn("No unlocked starting relics available!"); }
        this.currentMap = this.mapGenerator.generateLayer(this.currentLayer, this);
        this.currentNode = this.currentMap.getStartingNode();
        if (!this.currentNode) { console.error("Map generated without a starting node!"); this.changeState(GameState.MAIN_MENU); return; }
        this.currentNode.isCurrent = true;
        console.log("Run setup complete.");
        this.changeState(GameState.MAP);
     }
    getAvailableCardPoolIds() { /* ... (code from previous full version) ... */
        const basePoolIds = Object.values(BASE_CARD_POOL).filter(cardDef => cardDef.rarity !== CardRarity.STARTER && cardDef.rarity !== CardRarity.SPECIAL && cardDef.type !== CardType.CURSE && cardDef.type !== CardType.STATUS).map(cardDef => cardDef.id);
        if (this.personaLabData?.discoveredConcepts && Object.keys(this.personaLabData.discoveredConcepts).length > 0) {
            const discoveredIds = Object.keys(this.personaLabData.discoveredConcepts); const discoveredSet = new Set(discoveredIds);
            const filteredPool = basePoolIds.filter(id => discoveredSet.has(id));
            const minPoolSizeForDraft = STARTING_DECK_SIZE * 2;
            if (filteredPool.length >= minPoolSizeForDraft) { console.log(`Using ${filteredPool.length} cards based on discovered Persona Lab concepts.`); return filteredPool;
            } else { console.warn(`Persona Lab filter resulted in too few cards (${filteredPool.length}). Falling back to base pool of ${basePoolIds.length} cards.`); return basePoolIds; }
        } else { console.log("No Persona Lab data or concepts found, using base card pool."); return basePoolIds; }
     }
    selectRunPool(availableCardIds, targetSize) { /* ... (code from previous full version) ... */
        shuffleArray(availableCardIds); const actualSize = Math.min(availableCardIds.length, targetSize); return availableCardIds.slice(0, actualSize);
     }
    draftStartingDeck(runPoolIds, deckSize) { /* ... (code from previous full version) ... */
        const starterCardIds = [ 'starter_strike', 'starter_strike', 'starter_strike', 'starter_strike', 'starter_defend', 'starter_defend', 'starter_defend', 'starter_defend', 'starter_doubt' ];
        const numCardsToDraft = Math.max(0, deckSize - starterCardIds.length); let draftedCards = [];
        if (numCardsToDraft > 0 && runPoolIds.length > 0) { let draftPool = [...runPoolIds]; shuffleArray(draftPool); draftedCards = draftPool.slice(0, Math.min(numCardsToDraft, draftPool.length)); }
        while (starterCardIds.length + draftedCards.length < deckSize) { console.warn("Run pool too small to draft full starting deck complement. Adding extra starter Defend."); starterCardIds.push('starter_defend'); }
        return [...starterCardIds, ...draftedCards];
     }
    moveToNode(targetNode) { /* ... (code from previous full version, using getStateForNodeType) ... */
        if (!targetNode || !this.currentNode) return; console.log(`Moving from node ${this.currentNode.id} (${this.currentNode.type}) to ${targetNode.id} (${targetNode.type})`);
        this.currentNode.isCurrent = false; this.currentNode.isVisited = true; this.currentNode.isReachable = false;
        this.currentNode.nextNodes.forEach(id => { const node = this.currentMap.getNode(id); if (node) node.isReachable = false; });
        this.currentNode = targetNode; this.currentNode.isCurrent = true; this.currentNode.isVisible = true; this.currentNode.isReachable = false;
        this.currentMap.revealConnectedNodes(this.currentNode.id);
        this.changeState(this.getStateForNodeType(targetNode.type));
     }
    getStateForNodeType(nodeType) { /* ... (code from previous full version) ... */
        switch (nodeType) {
            case NodeType.ENCOUNTER: case NodeType.ELITE_ENCOUNTER: case NodeType.BOSS: return GameState.COMBAT;
            case NodeType.EVENT: return GameState.EVENT; case NodeType.SHOP: return GameState.SHOP; case NodeType.RESPITE: return GameState.RESPITE;
            default: console.warn(`Unhandled node type for state transition: ${nodeType}`); return GameState.MAP;
        }
     }
    handleCombatEnd(victory) { /* ... (code from previous full version, stores rewards) ... */
        if (!this.currentNode) return; const encounterType = this.currentNode.type; this.playerWonFlag = victory; // Set flag for run over screen
        if (victory) {
            console.log(`Combat Victory at ${encounterType}!`); let baseShards = 0;
            if (encounterType === NodeType.ENCOUNTER) baseShards = getRandomInt(15, 25);
            else if (encounterType === NodeType.ELITE_ENCOUNTER) baseShards = getRandomInt(50, 75);
            else if (encounterType === NodeType.BOSS) baseShards = getRandomInt(100, 150);
            this.gainInsightShards(baseShards); this.pendingCardRewardIds = this.generateCardRewards(encounterType);
            if (encounterType === NodeType.ELITE_ENCOUNTER || encounterType === NodeType.BOSS) { this.pendingRelicRewardId = this.generateRelicReward(encounterType); } else { this.pendingRelicRewardId = null; }
            console.log("Pending Rewards:", { cards: this.pendingCardRewardIds, relic: this.pendingRelicRewardId });
            if (encounterType === NodeType.BOSS) {
                if (this.currentLayer < MAX_LAYERS - 1) { this.advanceToNextLayer(); return; }
                else { console.log("Final Boss Defeated! Run Complete!"); this.endRun(true); return; }
            } this.changeState(GameState.REWARD_SCREEN);
        } else { console.log("Combat Defeat..."); this.endRun(false); }
     }
    calculateRewardButtonBounds() { /* ... (code from previous full version) ... */
        this.rewardCardButtons = []; this.rewardRelicButton = null; this.rewardSkipButton = null;
        const cardW = 200, cardH = 50, relicW = 200, relicH = 50, skipW = 100, skipH = 40;
        let startY = 200; const spacingY = 60;
        this.pendingCardRewardIds.forEach((cardId, index) => { const cardDef = getCardDefinition(cardId); const text = cardDef ? cardDef.name : `Unknown (${cardId})`;
            const bounds = { x: CANVAS_WIDTH / 2 - cardW / 2, y: startY + index * spacingY, width: cardW, height: cardH }; this.rewardCardButtons.push({ id: cardId, text: text, bounds: bounds, isHovered: false }); });
        let currentY = startY + this.pendingCardRewardIds.length * spacingY;
        if (this.pendingRelicRewardId) { const relicDef = getRelicDefinition(this.pendingRelicRewardId); const text = relicDef ? relicDef.name : `Unknown (${this.pendingRelicRewardId})`;
            const bounds = { x: CANVAS_WIDTH / 2 - relicW / 2, y: currentY, width: relicW, height: relicH }; this.rewardRelicButton = { id: this.pendingRelicRewardId, text: text, bounds: bounds, isHovered: false }; currentY += spacingY; }
        const skipBounds = { x: CANVAS_WIDTH / 2 - skipW / 2, y: CANVAS_HEIGHT - 100, width: skipW, height: skipH };
        this.rewardSkipButton = { id: 'skip', text: 'Skip', bounds: skipBounds, isHovered: false };
     }
    updateRewardHoverStates() { /* ... (code from previous full version) ... */
        if (this.currentState !== GameState.REWARD_SCREEN) return; const mousePos = this.lastInputPos; if (!mousePos) return;
        this.rewardCardButtons.forEach(btn => btn.isHovered = this.isPointInRect(mousePos, btn.bounds));
        if (this.rewardRelicButton) this.rewardRelicButton.isHovered = this.isPointInRect(mousePos, this.rewardRelicButton.bounds);
        if (this.rewardSkipButton) this.rewardSkipButton.isHovered = this.isPointInRect(mousePos, this.rewardSkipButton.bounds);
     }
    addCardToPlayerDeck(cardId) { /* ... (code from previous full version) ... */
        const definition = getCardDefinition(cardId); if (definition && this.player) { const newCard = new Card(definition); this.player.addCardToDeck(newCard, 'discard'); console.log(`Added ${definition.name} to deck.`); } else { console.error(`Could not add card ID ${cardId} to deck.`); }
     }
    finishRewardState() { /* ... (code from previous full version) ... */ this.changeState(GameState.MAP); }
    gainInsightShards(amount) { /* ... (code from previous full version) ... */ if (amount <= 0) return; this.insightShards += amount; console.log(`Gained ${amount} Insight Shards. Total: ${this.insightShards}`); }
    addRelic(relicId) { /* ... (code from previous full version) ... */
        const relicDef = getRelicDefinition(relicId); if (relicDef && !this.currentRelics.some(r => r.id === relicId)) { console.log(`Adding relic: ${relicDef.name} (${relicDef.id})`); this.currentRelics.push(relicDef); this.applyRelicImmediateEffects(relicDef); } else if (!relicDef) { console.warn(`Could not add relic with ID: ${relicId}. Definition not found.`); } else { console.warn(`Could not add relic with ID: ${relicId}. Already present.`); }
     }
    applyRelicImmediateEffects(relicDef) { /* ... (code from previous full version) ... */ if (relicDef.effects?.modifyStat && this.player) { const effect = relicDef.effects.modifyStat; this.player.modifyStat(effect.stat, effect.value); } }
    generateCardRewards(encounterType) { /* ... (code from previous full version) ... */
        let possibleRewardIds = [...this.currentRunPoolIds].filter(id => { const def = getCardDefinition(id); return def && def.type !== CardType.CURSE && def.type !== CardType.STATUS; });
        if (possibleRewardIds.length < 3) { const globalCommons = Object.values(BASE_CARD_POOL).filter(c => c.rarity === CardRarity.COMMON && c.type !== CardType.CURSE && c.type !== CardType.STATUS).map(c => c.id); possibleRewardIds = [...new Set([...possibleRewardIds, ...globalCommons])]; }
        const rarityWeights = { [CardRarity.COMMON]: 75, [CardRarity.UNCOMMON]: 20, [CardRarity.RARE]: 5 };
        if (encounterType === NodeType.ELITE_ENCOUNTER) { rarityWeights[CardRarity.COMMON] = 50; rarityWeights[CardRarity.UNCOMMON] = 35; rarityWeights[CardRarity.RARE] = 15; }
        else if (encounterType === NodeType.BOSS) { rarityWeights[CardRarity.COMMON] = 20; rarityWeights[CardRarity.UNCOMMON] = 50; rarityWeights[CardRarity.RARE] = 30; }
        const choices = []; const availablePool = [...possibleRewardIds]; shuffleArray(availablePool);
        for (let i = 0; i < 3; i++) { if (availablePool.length === 0) break; const totalWeight = Object.values(rarityWeights).reduce((s, w) => s + w, 0); let roll = Math.random() * totalWeight; let chosenRarity = CardRarity.COMMON;
            for (const [rarity, weight] of Object.entries(rarityWeights)) { if (roll < weight) { chosenRarity = rarity; break; } roll -= weight; }
            let foundCardId = null; let foundIndex = -1;
            for (let j = 0; j < availablePool.length; j++) { const cardId = availablePool[j]; const cardDef = getCardDefinition(cardId); if (cardDef && cardDef.rarity === chosenRarity) { foundCardId = cardId; foundIndex = j; break; } }
            if (foundIndex === -1) { if(availablePool.length > 0) {foundIndex = 0; foundCardId = availablePool[0];} } // Fallback
            if (foundCardId) { choices.push(foundCardId); availablePool.splice(foundIndex, 1); } }
        console.log("Generated Card Reward Choices:", choices); return choices;
     }
    generateRelicReward(encounterType) { /* ... (code from previous full version) ... */
        let weights = {}; if (encounterType === NodeType.ELITE_ENCOUNTER) { weights = { [CardRarity.COMMON]: 60, [CardRarity.UNCOMMON]: 35, [CardRarity.RARE]: 5 }; } else if (encounterType === NodeType.BOSS) { weights = { [CardRarity.RARE]: 70, [CardRarity.BOSS]: 30 }; } else return null;
        const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0); let roll = Math.random() * totalWeight; let chosenRarity = Object.keys(weights)[0]; for (const [rarity, weight] of Object.entries(weights)) { if (roll < weight) { chosenRarity = rarity; break; } roll -= weight; }
        let possibleRelicIds = getRelicIdsByRarity(chosenRarity); const ownedRelicIds = new Set(this.currentRelics.map(r => r.id)); const unlockedSet = new Set(this.unlockedRelicIds);
        let availableUnlocked = possibleRelicIds.filter(id => unlockedSet.has(id) && !ownedRelicIds.has(id));
        if (availableUnlocked.length === 0 && encounterType === NodeType.ELITE_ENCOUNTER) { // Fallback for elites
            console.warn(`No suitable ${chosenRarity} relic found. Trying Uncommon...`); availableUnlocked = getRelicIdsByRarity(CardRarity.UNCOMMON).filter(id => unlockedSet.has(id) && !ownedRelicIds.has(id));
            if (availableUnlocked.length === 0) { console.warn(`No suitable Uncommon relic found. Trying Common...`); availableUnlocked = getRelicIdsByRarity(CardRarity.COMMON).filter(id => unlockedSet.has(id) && !ownedRelicIds.has(id)); } }
        if (availableUnlocked.length === 0) { console.warn("Could not find any suitable unlocked, unowned relic reward."); return null; }
        shuffleArray(availableUnlocked); const choice = availableUnlocked[0]; console.log(`Offering ${chosenRarity} Relic Reward Choice:`, choice); return choice;
     }
    advanceToNextLayer() { /* ... (code from previous full version) ... */
        this.currentLayer++; console.log(`Advancing to Layer ${this.currentLayer + 1}`);
        this.currentMap = this.mapGenerator.generateLayer(this.currentLayer, this); this.currentNode = this.currentMap.getStartingNode();
        if (!this.currentNode) { console.error(`Map for layer ${this.currentLayer + 1} generated without a starting node!`); this.endRun(false); return; }
        this.currentNode.isCurrent = true; if(this.player) this.player.heal(Math.floor(this.player.maxHp * 0.25));
        this.changeState(GameState.MAP);
     }
    endRun(victory) { /* ... (code from previous full version, sets points gained) ... */
        console.log(`Run ended. Victory: ${victory}`); this.playerWonFlag = victory; let attunementGains = {}; console.log("Attunement XP calculation not implemented.");
        let integrationPointsGained = 0; if (victory) { integrationPointsGained = 100 + ((this.currentLayer + 1) * 50); } else { integrationPointsGained = 10 + ((this.currentLayer + 1) * 15); }
        integrationPointsGained = Math.max(0, integrationPointsGained); this.lastRunIntegrationPoints = integrationPointsGained; // Store for display
        this.integrationPoints += integrationPointsGained; console.log(`Gained ${integrationPointsGained} Integration Points. Total: ${this.integrationPoints}`);
        this.saveMetaProgression(); this.changeState(GameState.RUN_OVER);
     }
    loadIntegrationPoints() { /* ... (code from previous full version) ... */ const saved = localStorage.getItem('grimoire_integrationPoints'); return saved ? parseInt(saved, 10) : 0; }
    loadUnlockedRelics() { /* ... (code from previous full version) ... */
        let unlocked = []; const saved = localStorage.getItem('grimoire_unlockedRelics'); if (saved) { try { const parsed = JSON.parse(saved); if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) { unlocked = parsed; } else { console.warn("Invalid unlocked relics data found in localStorage. Resetting."); } } catch (e) { console.error("Error parsing unlocked relics from localStorage:", e); } }
        const starterRelics = Object.values(BASE_RELIC_POOL).filter(r => r.rarity === CardRarity.STARTER).map(r => r.id); const finalUnlocked = [...new Set([...unlocked, ...starterRelics])]; console.log("Loaded/Defaulted unlocked relics:", finalUnlocked); return finalUnlocked;
     }
    loadPlayerAttunement() { /* ... (code from previous full version) ... */
        let loadedAttunement = null; if (this.personaLabData?.attunement && Object.keys(this.personaLabData.attunement).length > 0) { loadedAttunement = this.personaLabData.attunement; console.log("Loading base player attunement from Persona Lab data:", loadedAttunement); }
        if (loadedAttunement) { return { ...DEFAULT_PLAYER_ATTUNEMENT, ...loadedAttunement }; } else { console.log("Using default player attunement."); return { ...DEFAULT_PLAYER_ATTUNEMENT }; }
     }
    saveMetaProgression() { /* ... (code from previous full version) ... */ try { localStorage.setItem('grimoire_integrationPoints', this.integrationPoints.toString()); localStorage.setItem('grimoire_unlockedRelics', JSON.stringify(this.unlockedRelicIds)); console.log("Saved meta-progression to localStorage."); } catch (e) { console.error("Error saving meta-progression to localStorage:", e); } }
    calculateRespiteButtonBounds() { /* ... (code from previous full version) ... */ const btnW = 300, btnH = 50, startY = CANVAS_HEIGHT / 2 - 50, spaceY = 70; this.respiteOptions.forEach((option, index) => { option.bounds = { x: CANVAS_WIDTH / 2 - btnW / 2, y: startY + index * spaceY, width: btnW, height: btnH }; option.isHovered = false; }); }
    updateRespiteHoverStates() { /* ... (code from previous full version) ... */
        if (this.currentState !== GameState.RESPITE) return; const mousePos = this.lastInputPos; if (!mousePos) return;
        if (this.refineModeActive) { if (this.refinePaginationButtons.prev) this.refinePaginationButtons.prev.isHovered = this.isPointInRect(mousePos, this.refinePaginationButtons.prev.bounds); if (this.refinePaginationButtons.next) this.refinePaginationButtons.next.isHovered = this.isPointInRect(mousePos, this.refinePaginationButtons.next.bounds); if (this.refinePaginationButtons.cancel) this.refinePaginationButtons.cancel.isHovered = this.isPointInRect(mousePos, this.refinePaginationButtons.cancel.bounds); /* Card hover needs bounds */ }
        else { this.respiteOptions.forEach(option => { option.isHovered = option.bounds && this.isPointInRect(mousePos, option.bounds); }); }
     }
    executeRespiteOption(optionId) { /* ... (code from previous full version) ... */
        switch (optionId) { case 'heal': const healAmount = Math.floor(this.player.maxHp * 0.25); const actualHealed = this.player.heal(healAmount); console.log(`Chose to heal. Healed ${actualHealed} HP.`); this.finishRespite(); break;
            case 'refine': let refineLimit = 1; if (this.currentRelics.some(r => r.id === 'meditative_focus')) { refineLimit += 1; } console.log("Chose to refine. Entering card selection mode."); this.refineModeActive = true; this.refineCurrentPage = 0; this.prepareRefineSelection(); break;
            default: console.warn(`Unknown respite option selected: ${optionId}`); break; }
     }
    prepareRefineSelection() { /* ... (code from previous full version) ... */ if (!this.player) return; this.refineCardSelection = this.player.masterDeck.filter(card => card.rarity !== CardRarity.STARTER && card.id !== 'starter_doubt').sort((a, b) => a.name.localeCompare(b.name)).map(card => ({ card: card, bounds: null })); }
    getRefineCardsForCurrentPage() { /* ... (code from previous full version) ... */ const startIndex = this.refineCurrentPage * this.refineCardsPerPage; const endIndex = startIndex + this.refineCardsPerPage; return this.refineCardSelection.slice(startIndex, endIndex); }
    calculateRefineCardBounds(cardsToDisplay) { /* ... (code from previous full version) ... */
        const boundsData = []; const cardW = 110, cardH = 154, cardsPR = 5, spaceX = 20, spaceY = 20; const gridW = cardsPR * (cardW + spaceX) - spaceX; const startX = CANVAS_WIDTH / 2 - gridW / 2; let cX = startX, cY = 120, cardsIR = 0;
        cardsToDisplay.forEach(cardData => { boundsData.push({ card: cardData.card, bounds: { x: cX, y: cY, width: cardW, height: cardH } }); cX += cardW + spaceX; cardsIR++; if (cardsIR >= cardsPR) { cX = startX; cY += cardH + spaceY; cardsIR = 0; } }); return boundsData;
     }
    finishRespite() { /* ... (code from previous full version) ... */ console.log("Leaving Respite."); this.changeState(GameState.MAP); }
    renderText(ctx, text, x, y, size = 20, color = '#FFF', align = 'center', baseline = 'middle') { /* ... (code from previous full version) ... */ ctx.fillStyle = color; ctx.font = `${size}px sans-serif`; ctx.textAlign = align; ctx.textBaseline = baseline; ctx.fillText(text, x, y); }
    wrapText(context, text, x, y, maxWidth, lineHeight) { /* ... (code from previous full version) ... */ if (!text) return; const words = text.split(' '); let line = ''; let lines = []; const initialY = y; for (let n = 0; n < words.length; n++) { const testLine = line + words[n] + ' '; const metrics = context.measureText(testLine); const testWidth = metrics.width; if (testWidth > maxWidth && n > 0) { lines.push(line); line = words[n] + ' '; } else { line = testLine; } } lines.push(line); y = initialY - (lines.length - 1) * lineHeight; for (let k = 0; k < lines.length; k++) { context.fillText(lines[k].trim(), x, y + k * lineHeight); } }
    renderLoadingScreen(ctx) { /* ... (code from previous full version) ... */ this.renderText(ctx, 'Loading Grimoire...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 30); }
    renderRunSetupScreen(ctx) { /* ... (code from previous full version) ... */ this.renderText(ctx, 'Setting up Run / Drafting...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 30); }
    renderMapScreen(ctx) { /* ... (code from previous full version) ... */ if(this.currentMap) { this.currentMap.render(ctx); } else { this.renderText(ctx, 'Error: Map not loaded!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 24, '#F88'); } }
    renderEventScreen(ctx) { /* ... (code from previous full version) ... */ this.renderText(ctx, 'Event Node', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 30); }
    renderShopScreen(ctx) { /* ... (code from previous full version) ... */ this.renderText(ctx, 'Shop Node', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 30); }
    renderRespiteScreen(ctx) { /* ... (code from previous full version) ... */ if (this.refineModeActive) { this.renderRefineSelection(ctx); } else { this.renderRespiteOptions(ctx); } }
    renderRespiteOptions(ctx) { /* ... (code from previous full version) ... */ this.renderText(ctx, 'Respite', CANVAS_WIDTH / 2, 100, 40); this.renderText(ctx, 'A moment of calm reflection.', CANVAS_WIDTH / 2, 150, 20, '#DDD'); this.respiteOptions.forEach(option => { if (option.bounds) { const bounds = option.bounds; ctx.fillStyle = option.isHovered ? '#557' : '#446'; ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height); ctx.strokeStyle = '#88A'; ctx.lineWidth = 2; ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height); this.renderText(ctx, option.text, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, 18); } }); }
    renderRefineSelection(ctx) { /* ... (code from previous full version) ... */
        this.renderText(ctx, 'Refine: Choose a Card to Remove', CANVAS_WIDTH / 2, 60, 30); const cardsToDisplay = this.getRefineCardsForCurrentPage(); const cardBoundsData = this.calculateRefineCardBounds(cardsToDisplay);
        cardBoundsData.forEach((boundsData) => { const card = boundsData.card; const bounds = boundsData.bounds; const isHovered = this.isPointInRect(this.lastInputPos, bounds); ctx.fillStyle = isHovered ? '#444' : '#333'; ctx.strokeStyle = isHovered ? '#FFF' : (ElementColors[card.element] || '#888'); ctx.lineWidth = isHovered ? 3 : 2; ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height); ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height); ctx.fillStyle = '#FFF'; ctx.textAlign = 'center'; ctx.font = '12px sans-serif'; ctx.textBaseline = 'top'; this.wrapText(ctx, card.name, bounds.x + bounds.width / 2, bounds.y + 5, bounds.width - 10, 14); ctx.font = '10px sans-serif'; ctx.textBaseline = 'bottom'; ctx.fillText(`(${card.cost ?? 'N/A'}) ${card.type}`, bounds.x + bounds.width / 2, bounds.y + bounds.height - 5); });
        const maxPage = Math.ceil(this.refineCardSelection.length / this.refineCardsPerPage) - 1; if (maxPage > 0) { const pageText = `Page ${this.refineCurrentPage + 1} / ${maxPage + 1}`; const buttonY = CANVAS_HEIGHT - 40; this.renderText(ctx, pageText, CANVAS_WIDTH / 2, buttonY, 14, '#FFF'); if (this.refinePaginationButtons.prev) { const btn = this.refinePaginationButtons.prev; ctx.fillStyle = btn.isHovered ? '#668' : '#557'; ctx.fillRect(btn.bounds.x, btn.bounds.y, btn.bounds.width, btn.bounds.height); this.renderText(ctx, btn.text, btn.bounds.x + btn.bounds.width / 2, buttonY, 14, '#FFF'); } if (this.refinePaginationButtons.next) { const btn = this.refinePaginationButtons.next; ctx.fillStyle = btn.isHovered ? '#668' : '#557'; ctx.fillRect(btn.bounds.x, btn.bounds.y, btn.bounds.width, btn.bounds.height); this.renderText(ctx, btn.text, btn.bounds.x + btn.bounds.width / 2, buttonY, 14, '#FFF'); } }
        if (this.refinePaginationButtons.cancel) { const btn = this.refinePaginationButtons.cancel; ctx.fillStyle = btn.isHovered ? '#944' : '#833'; ctx.fillRect(btn.bounds.x, btn.bounds.y, btn.bounds.width, btn.bounds.height); this.renderText(ctx, btn.text, btn.bounds.x + btn.bounds.width / 2, btn.bounds.y + btn.bounds.height / 2, 16, '#FFF'); }
     }
    renderRewardScreen(ctx) { /* ... (code from previous full version) ... */
        this.renderText(ctx, 'Combat Victory!', CANVAS_WIDTH / 2, 100, 30); let currentY = 180; const spacingY = 60; const btnWidth = 250; const btnHeight = 50;
        if (this.rewardCardButtons && this.rewardCardButtons.length > 0) { this.renderText(ctx, 'Choose a Card:', CANVAS_WIDTH / 2, currentY, 24); currentY += 40; this.rewardCardButtons.forEach(button => { ctx.fillStyle = button.isHovered ? '#557' : '#446'; ctx.fillRect(button.bounds.x, button.bounds.y, button.bounds.width, button.bounds.height); ctx.strokeStyle = '#88A'; ctx.lineWidth=1; ctx.strokeRect(button.bounds.x, button.bounds.y, button.bounds.width, button.bounds.height); this.renderText(ctx, button.text, button.bounds.x + button.bounds.width / 2, button.bounds.y + button.bounds.height / 2, 16); currentY += spacingY; }); }
        if (this.rewardRelicButton) { currentY = this.rewardRelicButton.bounds.y; this.renderText(ctx, 'Relic Reward:', CANVAS_WIDTH / 2, currentY - 30, 24); const button = this.rewardRelicButton; ctx.fillStyle = button.isHovered ? '#775' : '#664'; ctx.fillRect(button.bounds.x, button.bounds.y, button.bounds.width, button.bounds.height); ctx.strokeStyle = '#BA8'; ctx.lineWidth=1; ctx.strokeRect(button.bounds.x, button.bounds.y, button.bounds.width, button.bounds.height); this.renderText(ctx, button.text, button.bounds.x + button.bounds.width / 2, button.bounds.y + button.bounds.height / 2, 16); }
        if(this.rewardSkipButton) { const button = this.rewardSkipButton; ctx.fillStyle = button.isHovered ? '#777' : '#666'; ctx.fillRect(button.bounds.x, button.bounds.y, button.bounds.width, button.bounds.height); ctx.strokeStyle = '#AAA'; ctx.lineWidth=1; ctx.strokeRect(button.bounds.x, button.bounds.y, button.bounds.width, button.bounds.height); this.renderText(ctx, button.text, button.bounds.x + button.bounds.width / 2, button.bounds.y + button.bounds.height / 2, 16); }
     }
    renderRunOverScreen(ctx) { /* ... (code from previous full version, uses flags) ... */ const victory = this.playerWonFlag || false; this.renderText(ctx, victory ? 'Integration Achieved!' : 'Overwhelmed', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60, 40); this.renderText(ctx, `Integration Points Gained: ${this.lastRunIntegrationPoints || 0}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 0, 24); this.renderText(ctx, `Total Points: ${this.integrationPoints}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30, 18); this.renderText(ctx, '(Returning to menu...)', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100, 16, '#AAA'); }
    renderMainMenuScreen(ctx) { /* ... (code from previous full version, uses button state) ... */ this.renderText(ctx, 'Grimoire Roguelite', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3, 48); const btn = this.mainMenuStartButton; if (btn) { ctx.fillStyle = btn.isHovered ? '#66A' : '#558'; ctx.fillRect(btn.x, btn.y, btn.width, btn.height); ctx.strokeStyle="#FFF"; ctx.lineWidth=1; ctx.strokeRect(btn.x, btn.y, btn.width, btn.height); this.renderText(ctx, btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2, 24, '#FFF'); } }
    renderHUD(ctx) { /* ... (code from previous full version) ... */
        const hudY = 0; const hudHeight = 50; ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fillRect(0, hudY, CANVAS_WIDTH, hudHeight); ctx.textBaseline = 'middle'; let xPos = 15;
        if (this.player) { const hpText = `Composure: ${this.player.currentHp} / ${this.player.maxHp}`; this.renderText(ctx, hpText, xPos, hudY + hudHeight / 2, 18, '#FFD700', 'left'); xPos += ctx.measureText(hpText).width + 30; }
        const shardText = `Shards: ${this.insightShards}`; this.renderText(ctx, shardText, xPos, hudY + hudHeight / 2, 18, '#ADD8E6', 'left'); xPos += ctx.measureText(shardText).width + 30;
        if(this.player){ const deckText = `Deck: ${this.player.drawPile.length}`; const discardText = `Discard: ${this.player.discardPile.length}`; this.renderText(ctx, deckText, xPos, hudY + hudHeight / 2, 18, '#FFF', 'left'); xPos += ctx.measureText(deckText).width + 20; this.renderText(ctx, discardText, xPos, hudY + hudHeight / 2, 18, '#AAA', 'left'); xPos += ctx.measureText(discardText).width + 30; }
        this.renderText(ctx, `Layer: ${this.currentLayer + 1} / ${MAX_LAYERS}`, xPos, hudY + hudHeight / 2, 18, '#FFF', 'left');
        if (this.currentRelics.length > 0) { let relicX = CANVAS_WIDTH - 15; this.currentRelics.forEach(relic => { const name = relic.name; const textWidth = ctx.measureText(name).width; this.renderText(ctx, name, relicX, hudY + hudHeight / 2, 16, '#AFEEEE', 'right'); relicX -= textWidth + 15; });
        } else { this.renderText(ctx, 'No Relics', CANVAS_WIDTH - 15, hudY + hudHeight / 2, 16, '#888', 'right'); }
     }
    isPointInRect(point, rect) { /* ... (code from previous full version) ... */ if (!point || !rect) return false; return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height; }

} // End GameManager Class
