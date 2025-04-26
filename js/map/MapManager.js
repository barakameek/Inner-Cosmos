// js/map/MapManager.js

// Import data - needed for enemy/event selection
import * as Data from '../data.js';
// Import enemy/artifact definitions if needed (e.g., to validate selected IDs)
import { ENEMY_TEMPLATES } from '../combat/Enemy.js'; // Assuming templates exported from Enemy.js or a dedicated defs file
import { ARTIFACT_TEMPLATES } from '../core/ArtifactDefinitions.js';

// --- Constants ---
const NODE_DISTRIBUTION = {
    1: { combat: 7, elite: 1, event: 3, rest: 1, shop: 1 },
    2: { combat: 8, elite: 2, event: 4, rest: 1, shop: 1 },
    3: { combat: 6, elite: 2, event: 3, rest: 2, shop: 1 },
};
// Ensure these ENEMY_ENCOUNTERS use valid IDs from ENEMY_TEMPLATES
const ENEMY_ENCOUNTERS = {
    floor1_combat: [ ['doubt_whisper'], ['doubt_whisper', 'doubt_whisper'] ],
    floor1_elite: [ ['rigid_perfectionism'] ],
    floor1_boss: [ ['shadow_aspect_interaction'] ],
    floor2_combat: [ ['rigid_perfectionism'], ['doubt_whisper','rigid_perfectionism'] ],
    floor2_elite: [ ['rigid_perfectionism', 'rigid_perfectionism'] ],
    floor2_boss: [ ['shadow_aspect_interaction'] ], // Reusing boss for example
    floor3_combat: [ ['rigid_perfectionism','rigid_perfectionism'], ['rigid_perfectionism', 'doubt_whisper','doubt_whisper'] ],
    floor3_elite: [ ['shadow_aspect_interaction'] ], // Example: Boss as Elite?
    floor3_boss: [ ['shadow_aspect_interaction'] ], // Final Boss
};
// Ensure these EVENT_IDS use valid IDs from Data.js (reflections/dilemmas)
const EVENT_IDS = {
     floor1: ['ED_A01', 'ED_I01', 'ED_S01', 'ED_P01', 'ED_C01', 'ED_R01', 'pA1', 'pI1'], // Mix dilemmas and reflections
     floor2: ['ED_A02', 'ED_I02', 'ED_S02', 'ED_P02', 'ED_C02', 'ED_R02', 'pS1', 'pP1'],
     floor3: ['ED_A03', 'ED_I03', 'ED_RF01', 'ED_RF02', 'pC1', 'pRF1', 'pD1'], // Add Dissonance
};


/**
 * Represents a single node on the map.
 */
class MapNode {
    constructor(id, type, floor, position = { x: 0, y: 0 }, data = {}) {
        this.id = id; // e.g., "floor1-node5-combat"
        this.type = type; // 'combat', 'elite', 'event', 'rest', 'shop', 'boss', 'start'
        this.floor = floor;
        this.position = position; // { x, y } for rendering
        this.connections = []; // Array of node IDs this node connects TO
        this.incomingConnections = []; // Nodes connecting TO this (for validation/rendering)
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
     */
    generateFloor(floorNum) {
        console.log(`MapManager: Generating map for Floor ${floorNum}...`);
        this.currentFloor = floorNum;
        this.nodes = {};
        this.startNodeId = `floor${floorNum}-start`;
        this.bossNodeId = `floor${floorNum}-boss`;
        this.currentNodeId = null;

        const distribution = NODE_DISTRIBUTION[floorNum] || NODE_DISTRIBUTION[1];
        const layers = 9;
        const baseWidth = 4;
        const widthVariance = 2;
        let nodeCounter = 0;
        const generatedNodesByLayer = [];
        const nodeWidth = 100;
        const layerHeight = (this.uiManager?.mapArea?.clientHeight || 700) / (layers + 1); // Use container height, default 700
        const mapWidth = this.uiManager?.mapArea?.clientWidth || 1000;

        // 1. Create Start Node
        const startNode = new MapNode(this.startNodeId, 'start', floorNum, { x: mapWidth / 2, y: layerHeight * 0.5 }); // Position closer to top
        this.nodes[this.startNodeId] = startNode;
        generatedNodesByLayer.push([startNode]);

        // 2. Generate Middle Layers
        let availableTypes = this._getShuffledNodeTypes(distribution);
        for (let layer = 1; layer < layers - 1; layer++) {
            const layerNodes = [];
            const numNodesThisLayer = Math.max(1, baseWidth + Math.floor(Math.random() * (widthVariance * 2 + 1)) - widthVariance);
            const layerY = layerHeight * (layer + 0.5); // Center nodes vertically in layer band

            for (let i = 0; i < numNodesThisLayer; i++) {
                 if (availableTypes.length === 0) {
                    availableTypes.push('combat'); // Fallback
                 }
                 const nodeType = availableTypes.pop();
                 const nodeId = `floor${floorNum}-node${nodeCounter++}-${nodeType}`;
                 const nodeX = (mapWidth / (numNodesThisLayer + 1)) * (i + 1);

                 let nodeData = {};
                 try { // Add try-catch around data selection
                    if (nodeType === 'combat' || nodeType === 'elite') {
                        nodeData.enemies = this.selectEnemyEncounter(floorNum, nodeType);
                         if (!nodeData.enemies) throw new Error(`No valid enemies found for ${nodeType} on floor ${floorNum}`);
                    } else if (nodeType === 'event') {
                         nodeData.eventId = this.selectEvent(floorNum);
                          if (!nodeData.eventId) throw new Error(`No valid event found for floor ${floorNum}`);
                    }
                 } catch (error) {
                     console.error(`Error assigning data for node ${nodeId}:`, error);
                     // Fallback: Make it a simple combat node? Or skip? Let's make it combat.
                      nodeData = { enemies: this.selectEnemyEncounter(floorNum, 'combat', true) }; // Pass true for fallback default
                 }

                 const newNode = new MapNode(nodeId, nodeType, floorNum, { x: nodeX, y: layerY }, nodeData);
                 this.nodes[nodeId] = newNode;
                 layerNodes.push(newNode);
            }
            if(layerNodes.length > 0) generatedNodesByLayer.push(layerNodes);
        }

        // 3. Create Boss Node
         const bossNode = new MapNode(this.bossNodeId, 'boss', floorNum, { x: mapWidth / 2, y: layerHeight * (layers - 0.5) }); // Position closer to bottom
         try {
             bossNode.data.enemies = this.selectEnemyEncounter(floorNum, 'boss');
             if (!bossNode.data.enemies) throw new Error(`No valid boss encounter found for floor ${floorNum}`);
         } catch (error) {
              console.error(`Error assigning boss data for floor ${floorNum}:`, error);
              bossNode.data.enemies = this.selectEnemyEncounter(floorNum, 'elite', true); // Fallback to elite
         }
         this.nodes[this.bossNodeId] = bossNode;
         generatedNodesByLayer.push([bossNode]);


        // 4. Create Connections
         this._connectLayers(generatedNodesByLayer);
         // Ensure path is more robustly checked/created if needed
         if (!this._isNodeReachable(this.bossNodeId, this.startNodeId)) {
             console.warn("Boss node potentially unreachable after initial connection phase. Attempting fix...");
             this._forceConnectionsTowards(this.bossNodeId, generatedNodesByLayer); // Try harder to force path
         }


        // --- Final Setup ---
        this.currentNodeId = this.startNodeId;
        this.nodes[this.startNodeId].visited = true;

        console.log(`MapManager: Generated ${Object.keys(this.nodes).length} nodes for Floor ${floorNum}.`);

         // Initial rendering via UIManager AFTER generation completes
         this.renderMap();
    }


    /** Creates connections between adjacent layers. */
    _connectLayers(layers) {
         for (let i = 0; i < layers.length - 1; i++) {
            const currentLayerNodes = layers[i];
            const nextLayerNodes = layers[i + 1];
            if (!nextLayerNodes || nextLayerNodes.length === 0) continue;

            currentLayerNodes.forEach(node => {
                 const potentialTargets = [...nextLayerNodes].sort((a, b) => Math.abs(a.position.x - node.position.x) - Math.abs(b.position.x - node.position.x));
                const maxConnections = 3;
                 let connectionCount = 0;

                 // Connect to closest 1-3 nodes with decreasing probability
                 for(let j=0; j < potentialTargets.length && connectionCount < maxConnections; j++) {
                    const targetNode = potentialTargets[j];
                    // Higher chance to connect to closer nodes
                    const connectChance = 0.8 / (j + 1); // Example: 80% for closest, 40% for 2nd, ~27% for 3rd
                    if(Math.random() < connectChance || connectionCount === 0) { // Always connect at least one if possible
                         if (!node.connections.includes(targetNode.id)) {
                            node.connections.push(targetNode.id);
                            targetNode.incomingConnections.push(node.id);
                            connectionCount++;
                         }
                    }
                 }
                 // Ensure at least one connection if possible (redundant if first connect chance is 1.0)
                 // if (node.connections.length === 0 && potentialTargets.length > 0) {
                 //    const targetNode = potentialTargets[0];
                 //    node.connections.push(targetNode.id);
                 //    targetNode.incomingConnections.push(node.id);
                 // }
            });
         }
    }

     /** Checks reachability using BFS or DFS */
      _isNodeReachable(targetId, startId) {
          if (!this.nodes[startId] || !this.nodes[targetId]) return false;
          const queue = [startId];
          const visited = new Set([startId]);
          while (queue.length > 0) {
              const currentId = queue.shift();
              if (currentId === targetId) return true;
              const node = this.nodes[currentId];
              node?.connections.forEach(nextId => {
                  if (this.nodes[nextId] && !visited.has(nextId)) {
                      visited.add(nextId);
                      queue.push(nextId);
                  }
              });
          }
          return false; // Target not found
      }

      /** Attempts to force connections back from unreachable nodes towards the start */
       _forceConnectionsTowards(targetId, layers) {
          // Very basic: Connect last layer node(s) without outgoing connections backwards if boss unreachable
          // A better approach involves finding disconnected graph components.
          for (let i = layers.length - 2; i >= 0; i--) { // Work backwards from penultimate layer
                layers[i].forEach(node => {
                    if (node.connections.length === 0 && layers[i+1]?.length > 0) {
                         // Connect to a random node in the next layer
                         const nextLayer = layers[i+1];
                         const targetNode = nextLayer[Math.floor(Math.random() * nextLayer.length)];
                         console.log(`Forcing fallback connection from ${node.id} to ${targetNode.id}`);
                         node.connections.push(targetNode.id);
                         targetNode.incomingConnections.push(node.id);
                    }
                });
            }
            // Re-check reachability after forcing connections
             if (!this._isNodeReachable(this.bossNodeId, this.startNodeId)) {
                console.error("FATAL MAP ERROR: Boss still unreachable after forcing connections!");
                 // Implement more robust fix or error handling
             }
       }


    /** Gets shuffled node types based on distribution. */
     _getShuffledNodeTypes(distribution) {
         const types = [];
         for (const type in distribution) {
             for (let i = 0; i < distribution[type]; i++) {
                 types.push(type);
             }
         }
         return this.shuffleArray(types);
     }

    /** Utility to shuffle an array. */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }


    /** Selects an enemy encounter, ensuring IDs are valid. */
     selectEnemyEncounter(floorNum, nodeType, useDefault = false) {
         if (useDefault) return ['doubt_whisper']; // Force default if requested

         let key = `floor${floorNum}_${nodeType}`;
         let encounters = ENEMY_ENCOUNTERS[key];

         // Fallback to floor 1 if specific floor/type combo is missing
         if (!encounters || encounters.length === 0) {
             console.warn(`No encounters defined for key: ${key}. Falling back to floor1_${nodeType}.`);
             key = `floor1_${nodeType}`;
             encounters = ENEMY_ENCOUNTERS[key];
         }
         // Final fallback to basic combat
         if (!encounters || encounters.length === 0) {
              console.warn(`No encounters defined for key: ${key}. Falling back to default combat.`);
              return ['doubt_whisper'];
         }

         // Select a random encounter group
         const randomIndex = Math.floor(Math.random() * encounters.length);
         const chosenGroup = encounters[randomIndex];

         // Validate that all enemy IDs in the chosen group exist in ENEMY_TEMPLATES
         const validGroup = chosenGroup.filter(enemyId => ENEMY_TEMPLATES[enemyId]);
         if (validGroup.length !== chosenGroup.length) {
              console.error(`Encounter group [${chosenGroup}] contains invalid enemy IDs! Substituting defaults.`);
              // Return default group or filter out invalid ones? Filter is safer.
              return validGroup.length > 0 ? validGroup : ['doubt_whisper'];
         }

         return validGroup; // Return the validated group of enemy IDs
     }

     /** Selects a valid event ID. */
     selectEvent(floorNum) {
         const key = `floor${floorNum}`;
         let eventIds = EVENT_IDS[key] || EVENT_IDS['floor1']; // Fallback to floor 1

         // Filter event IDs to ensure they exist in Data.js
         const validEventIds = eventIds.filter(id => {
             // Check reflections
             for (const category in Data.reflectionPrompts) {
                  const source = Data.reflectionPrompts[category];
                  if (Array.isArray(source) && source.some(p => p.id === id)) return true;
                  if (typeof source === 'object' && source !== null && source[id]) return true;
             }
             // Check dilemmas
             if (Data.elementalDilemmas.some(d => d.id === id)) return true;
             console.warn(`Event ID ${id} listed for floor ${floorNum} not found in Data.js`);
             return false;
         });


         if (validEventIds && validEventIds.length > 0) {
              const randomIndex = Math.floor(Math.random() * validEventIds.length);
              return validEventIds[randomIndex];
         }

         console.warn(`No valid events found for key: ${key}. Returning null.`);
         return null;
     }


    /** Renders the current map state using the UIManager. */
    renderMap() {
        if (!this.uiManager) {
            console.error("MapManager: UIManager not available for rendering.");
            return;
        }
        // UIManager method handles the actual drawing
        this.uiManager.renderMap(this.nodes, this.currentNodeId, this.getAllConnections());
        // Update player info display separately if needed
        // this.uiManager.updatePlayerMapInfo(this.gameState.player, this.currentFloor);
    }


    /** Moves the player and triggers node interaction via GameState. */
    moveToNode(targetNodeId) {
        if (!this.runActiveCheck()) return; // Check if run is active first

        const currentNode = this.nodes[this.currentNodeId];
        if (!currentNode) { console.error("MapManager: Current node invalid."); return; }

        if (!currentNode.connections.includes(targetNodeId)) {
            console.warn(`MapManager: Invalid move: ${this.currentNodeId} to ${targetNodeId}.`);
            this.uiManager.showActionFeedback("Cannot move there!", "warning");
            return;
        }

        const targetNode = this.nodes[targetNodeId];
        if (!targetNode) {
            console.error(`MapManager: Target node ${targetNodeId} not found.`);
            this.uiManager.showActionFeedback("Map Error!", "error");
            return;
        }

        // --- Perform Move ---
        console.log(`MapManager: Moving to ${targetNode.type} node ${targetNodeId}...`);
        this.currentNodeId = targetNodeId;
        targetNode.visited = true;

        // --- Trigger Node Interaction via GameState ---
        // GameState handles screen changes and initiating actions
        this.gameState.handleNodeEntry(targetNode);

        // --- Update UI ---
        // Re-rendering the map itself is usually deferred until returning to the map screen
        // But update immediately available info like player stats
        this.uiManager.updatePlayerMapInfo(this.gameState.player, this.currentFloor);
        // Force map re-render if staying on map screen (e.g., after visiting start node again?)
        // if (this.uiManager.currentScreen === this.uiManager.screens['mapScreen']) {
        //      this.renderMap();
        // }
    }


    /** Returns connection pairs for rendering. */
     getAllConnections() {
        const connections = [];
        Object.values(this.nodes).forEach(node => {
            node.connections.forEach(targetId => {
                if(this.nodes[targetId]) {
                    connections.push({ from: node.id, to: targetId });
                } else {
                    console.warn(`Map Connection Error: Node ${node.id} connects to non-existent ${targetId}`);
                }
            });
        });
        return connections;
     }

    /** Returns available next nodes. */
     getAvailableMoves() {
         if (!this.runActiveCheck() || !this.nodes[this.currentNodeId]) return [];
         return this.nodes[this.currentNodeId].connections
             .map(id => this.nodes[id])
             .filter(node => node); // Ensure node exists
     }

    /** Returns the current node object. */
     getCurrentNode() {
         if (!this.runActiveCheck()) return null;
        return this.nodes[this.currentNodeId];
     }

     /** Helper to check if game state and run are active */
     runActiveCheck() {
         if (!this.gameState || !this.gameState.runActive) {
             // console.warn("MapManager: Action aborted, run is not active.");
             return false;
         }
         return true;
     }

} // End of MapManager class
