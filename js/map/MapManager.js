// js/map/MapManager.js

// Import node data definitions if they become complex
import * as Data from '../data.js'; // Needed for event/enemy definitions

// --- Constants ---
// Keep existing constants NODE_DISTRIBUTION, ENEMY_ENCOUNTERS, EVENT_IDS...
const NODE_DISTRIBUTION = {
    1: { combat: 7, elite: 1, event: 3, rest: 1, shop: 1, /* Total: 13 */ },
    2: { combat: 8, elite: 2, event: 4, rest: 1, shop: 1, /* Total: 16 */ },
    3: { combat: 6, elite: 2, event: 3, rest: 2, shop: 1, /* Total: 14 - Fewer combats before boss? */},
};
const ENEMY_ENCOUNTERS = {
    floor1_combat: [ ['doubt_whisper'], ['doubt_whisper', 'doubt_whisper'] ],
    floor1_elite: [ ['rigid_perfectionism'] ],
    floor1_boss: [ ['shadow_aspect_interaction'] ], // Ensure boss encounters are defined
    // Placeholder for floor 2+ - NEEDS DEFINITIONS
    floor2_combat: [ ['rigid_perfectionism'], ['doubt_whisper','rigid_perfectionism'] ],
    floor2_elite: [ ['rigid_perfectionism', 'rigid_perfectionism'] ], // Example: Tougher elite
    floor2_boss: [ ['shadow_aspect_interaction'] ], // Placeholder boss
    floor3_combat: [ ['rigid_perfectionism','rigid_perfectionism'], ['rigid_perfectionism', 'doubt_whisper','doubt_whisper'] ],
    floor3_elite: [ ['shadow_aspect_interaction'] ], // Example: Boss as Elite on final floor? Risky!
    floor3_boss: [ ['shadow_aspect_interaction'] ], // Final Boss
};
const EVENT_IDS = {
     floor1: ['ED_A01', 'ED_I01', 'ED_S01', 'ED_P01', 'ED_C01', 'ED_R01'], // Example mix
     floor2: ['ED_A02', 'ED_I02', 'ED_S02', 'ED_P02', 'ED_C02', 'ED_R02'],
     floor3: ['ED_A03', 'ED_I03', 'ED_RF01', 'ED_RF02', 'ED_P01'], // Mix repeats potentially
};


/**
 * Represents a single node on the map.
 */
class MapNode { // Keep MapNode class definition here or move to separate file
    constructor(id, type, floor, position = { x: 0, y: 0 }, data = {}) {
        this.id = id;
        this.type = type;
        this.floor = floor;
        this.position = position;
        this.connections = []; // Node IDs this connects TO
        this.incomingConnections = []; // Node IDs that connect TO THIS (useful for path validation)
        this.visited = false;
        this.data = data; // { enemies?: string[], eventId?: string }
        this.element = null; // DOM element reference (set by UIManager)
    }
}


/**
 * Manages map generation, player position, and node transitions.
 */
export class MapManager {
    constructor(gameState, uiManager) {
        if (!gameState) throw new Error("MapManager requires a GameState instance.");
        if (!uiManager) throw new Error("MapManager requires a UIManager instance.");

        this.gameState = gameState;
        this.uiManager = uiManager;
        this.currentFloor = 0;
        this.nodes = {}; // { nodeId: MapNode }
        this.startNodeId = null;
        this.bossNodeId = null;
        this.currentNodeId = null;

        console.log("MapManager initialized.");
    }

    /**
     * Generates the map data for a specific floor.
     * @param {number} floorNum - The floor number to generate.
     */
    generateFloor(floorNum) {
        console.log(`MapManager: Generating map for Floor ${floorNum}...`);
        this.currentFloor = floorNum;
        this.nodes = {};
        this.startNodeId = `floor${floorNum}-start`;
        this.bossNodeId = `floor${floorNum}-boss`;
        this.currentNodeId = null;

        const distribution = NODE_DISTRIBUTION[floorNum] || NODE_DISTRIBUTION[1];
        const layers = 9; // Increase layers for potentially better pathing variance
        const baseWidth = 4; // Avg nodes per layer
        const widthVariance = 2; // Allow layers to have +/- this many nodes

        let nodeCounter = 0;
        const generatedNodesByLayer = []; // Array of arrays: [[startNode], [layer1Nodes], ..., [bossNode]]
        const nodeWidth = 100; // Estimated horizontal space per node for positioning
        const layerHeight = (800 - 100) / (layers -1); // Vertical space per layer (assuming 800px map height)
        const mapWidth = this.uiManager?.mapArea?.clientWidth || 1000; // Get actual width if possible


        // 1. Create Start Node
        const startNode = new MapNode(this.startNodeId, 'start', floorNum, { x: mapWidth / 2, y: 50 });
        this.nodes[this.startNodeId] = startNode;
        generatedNodesByLayer.push([startNode]);

        // 2. Generate Middle Layers
        let availableTypes = this._getShuffledNodeTypes(distribution);
        for (let layer = 1; layer < layers - 1; layer++) {
            const layerNodes = [];
             // Determine number of nodes for this layer (randomized slightly)
            const numNodesThisLayer = Math.max(1, baseWidth + Math.floor(Math.random() * (widthVariance * 2 + 1)) - widthVariance);
            const layerY = 50 + layer * layerHeight;

            for (let i = 0; i < numNodesThisLayer; i++) {
                 if (availableTypes.length === 0) {
                    console.warn(`Ran out of node types for floor ${floorNum} at layer ${layer}. Using combat fallback.`);
                    availableTypes.push('combat'); // Add fallback combat node if we run out
                 };

                 const nodeType = availableTypes.pop();
                 const nodeId = `floor${floorNum}-node${nodeCounter++}-${nodeType}`;
                 // Distribute horizontally more evenly
                 const nodeX = (mapWidth / (numNodesThisLayer + 1)) * (i + 1);

                 let nodeData = {};
                 if (nodeType === 'combat' || nodeType === 'elite') {
                     nodeData.enemies = this.selectEnemyEncounter(floorNum, nodeType);
                 } else if (nodeType === 'event') {
                      nodeData.eventId = this.selectEvent(floorNum);
                 }
                 // Add data for shop, rest if needed

                 const newNode = new MapNode(nodeId, nodeType, floorNum, { x: nodeX, y: layerY }, nodeData);
                 this.nodes[nodeId] = newNode;
                 layerNodes.push(newNode);
            }
            if(layerNodes.length > 0) generatedNodesByLayer.push(layerNodes);
        }

        // 3. Create Boss Node
         const bossNode = new MapNode(this.bossNodeId, 'boss', floorNum, { x: mapWidth / 2, y: 50 + (layers - 1) * layerHeight });
         bossNode.data.enemies = this.selectEnemyEncounter(floorNum, 'boss');
         this.nodes[this.bossNodeId] = bossNode;
         generatedNodesByLayer.push([bossNode]);

        // 4. Create Connections (Improved Logic)
         this._connectLayers(generatedNodesByLayer);
         this._ensurePathToBoss(generatedNodesByLayer); // Try to guarantee at least one path


        // --- Final Setup ---
        this.currentNodeId = this.startNodeId;
        this.nodes[this.startNodeId].visited = true;

        console.log(`MapManager: Generated ${Object.keys(this.nodes).length} nodes for Floor ${floorNum}.`);

         // Initial rendering via UIManager
         this.renderMap();
    }


    /**
     * Creates connections between adjacent layers.
     */
    _connectLayers(layers) {
         for (let i = 0; i < layers.length - 1; i++) {
            const currentLayerNodes = layers[i];
            const nextLayerNodes = layers[i + 1];

            if (!nextLayerNodes || nextLayerNodes.length === 0) continue;

            currentLayerNodes.forEach(node => {
                 // Connect to 1-3 nodes in the next layer, prioritizing closer ones?
                 const potentialTargets = [...nextLayerNodes].sort((a, b) => {
                     // Simple proximity sort based on X distance
                     return Math.abs(a.position.x - node.position.x) - Math.abs(b.position.x - node.position.x);
                 });

                const maxConnections = 3; // Max outgoing connections
                 let connectionCount = 0;
                 // Always connect to the closest?
                 if (potentialTargets.length > 0) {
                     const targetNode = potentialTargets[0];
                     node.connections.push(targetNode.id);
                     targetNode.incomingConnections.push(node.id);
                     connectionCount++;
                 }
                 // Add 1-2 more random connections from remaining nearby targets
                 const additionalConnections = Math.floor(Math.random() * Math.min(maxConnections, potentialTargets.length)); // 0, 1 or 2 more
                  for (let j = 1; j < potentialTargets.length && connectionCount < maxConnections && connectionCount <= additionalConnections ; j++) {
                      // Add bias towards connecting? Or purely random?
                      if (Math.random() < 0.6) { // 60% chance to connect to other nearby nodes
                         const targetNode = potentialTargets[j];
                         if (!node.connections.includes(targetNode.id)) {
                            node.connections.push(targetNode.id);
                            targetNode.incomingConnections.push(node.id);
                            connectionCount++;
                         }
                      }
                 }
            });
         }
    }

     /**
     * Tries to ensure at least one path exists from start to boss.
     * Very basic implementation: checks if boss is reachable and adds connections if not.
     */
     _ensurePathToBoss(layers) {
         const bossNode = layers[layers.length - 1][0];
         const penultimateLayer = layers[layers.length - 2];

         // Check if boss has any incoming connections
         if (bossNode.incomingConnections.length === 0 && penultimateLayer && penultimateLayer.length > 0) {
             console.warn("Boss node initially unreachable! Forcing connection...");
             // Connect a random node from the penultimate layer to the boss
             const randomPenultimateNode = penultimateLayer[Math.floor(Math.random() * penultimateLayer.length)];
             if (!randomPenultimateNode.connections.includes(bossNode.id)) {
                 randomPenultimateNode.connections.push(bossNode.id);
                 bossNode.incomingConnections.push(randomPenultimateNode.id);
                 console.log(`Forced connection from ${randomPenultimateNode.id} to boss ${bossNode.id}`);
             }
         }
          // A more robust check would involve traversing the graph from the start node.
     }


    // Keep _getShuffledNodeTypes, shuffleArray, selectEnemyEncounter, selectEvent...
     _getShuffledNodeTypes(distribution) { /* ... keep ... */
         const types = [];
         for (const type in distribution) {
             for (let i = 0; i < distribution[type]; i++) {
                 types.push(type);
             }
         }
         return this.shuffleArray(types);
     }
     shuffleArray(array) { /* ... keep ... */
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
     }
     selectEnemyEncounter(floorNum, nodeType) { /* ... keep ... */
        let key;
         const floorKey = `floor${floorNum}`;
         if (nodeType === 'boss') {
             key = `${floorKey}_boss`;
         } else {
             key = `${floorKey}_${nodeType}`;
         }

         const encounters = ENEMY_ENCOUNTERS[key] || ENEMY_ENCOUNTERS[`floor1_${nodeType}`]; // Fallback to floor 1 if specific floor missing
         if (encounters && encounters.length > 0) {
             const randomIndex = Math.floor(Math.random() * encounters.length);
             return encounters[randomIndex];
         }
         console.warn(`No enemy encounters defined for key: ${key}. Using default.`);
         return ['doubt_whisper']; // Default fallback
     }
     selectEvent(floorNum) { /* ... keep ... */
         const key = `floor${floorNum}`;
         const eventIds = EVENT_IDS[key] || EVENT_IDS['floor1']; // Fallback to floor 1
         if (eventIds && eventIds.length > 0) {
              const randomIndex = Math.floor(Math.random() * eventIds.length);
              return eventIds[randomIndex];
         }
         console.warn(`No events defined for key: ${key}.`);
         return null;
     }


    /**
     * Renders the current map state using the UIManager.
     */
    renderMap() {
        if (!this.uiManager) {
            console.error("MapManager: UIManager not available for rendering.");
            return;
        }
        // Pass necessary data to the UIManager's map rendering function
        // UIManager needs nodes, current node ID, and all connections
        this.uiManager.renderMap(this.nodes, this.currentNodeId, this.getAllConnections());
        // Player info update might happen separately or here
        // this.uiManager.updatePlayerMapInfo(this.gameState.player, this.currentFloor);
    }


    /**
     * Moves the player to a new node and triggers the node's interaction logic via GameState.
     * @param {string} targetNodeId - The ID of the node to move to.
     */
    moveToNode(targetNodeId) {
        // Validate move
        if (!this.currentNodeId || !this.nodes[this.currentNodeId]) {
            console.error("MapManager: Cannot move, current node is invalid.");
            return;
        }
        const currentNode = this.nodes[this.currentNodeId];
        if (!currentNode.connections.includes(targetNodeId)) {
            console.warn(`MapManager: Cannot move from ${this.currentNodeId} to ${targetNodeId}. Not connected.`);
            this.uiManager.showActionFeedback("Invalid move!", "warning"); // UI Feedback
            return;
        }
        const targetNode = this.nodes[targetNodeId];
        if (!targetNode) {
            console.error(`MapManager: Target node ${targetNodeId} not found.`);
             this.uiManager.showActionFeedback("Map Error!", "error");
            return;
        }

        // --- Perform Move ---
        console.log(`MapManager: Moving from ${currentNode.type} node ${this.currentNodeId} to ${targetNode.type} node ${targetNodeId}...`);
        this.currentNodeId = targetNodeId;
        targetNode.visited = true;

        // --- Delegate Interaction to GameState ---
        // GameState will handle starting combat, events, shops etc. and changing screens
        this.gameState.handleNodeEntry(targetNode);

        // --- Update UI (Map is usually re-rendered AFTER node interaction completes) ---
        // We don't necessarily render the map immediately here, because handleNodeEntry
        // might switch the screen to combat/event/etc. The map should be rendered
        // when the player returns TO the map screen after completing the node action.
        // However, we might update player info immediately if needed.
         this.uiManager.updatePlayerMapInfo(this.gameState.player, this.currentFloor);

    }


    // Keep getAllConnections, getAvailableMoves, getCurrentNode...
     getAllConnections() { /* ... keep ... */
        const connections = [];
        Object.values(this.nodes).forEach(node => {
            node.connections.forEach(targetId => {
                // Ensure target exists before adding connection (robustness)
                if(this.nodes[targetId]) {
                    connections.push({ from: node.id, to: targetId });
                } else {
                    console.warn(`Map Connection Error: Node ${node.id} connects to non-existent node ${targetId}`);
                }
            });
        });
        return connections;
     }
     getAvailableMoves() { /* ... keep ... */
         if (!this.currentNodeId || !this.nodes[this.currentNodeId]) {
            return [];
        }
        const currentNode = this.nodes[this.currentNodeId];
        return currentNode.connections.map(id => this.nodes[id]).filter(node => node);
     }
     getCurrentNode() { /* ... keep ... */
        return this.nodes[this.currentNodeId];
     }

} // End of MapManager class
