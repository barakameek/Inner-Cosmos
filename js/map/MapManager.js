// js/map/MapManager.js

// Import data - needed for enemy/event selection
import * as Data from '../../data.js'; // Correct path from js/map to root
// Import enemy/artifact definitions if needed (e.g., to validate selected IDs)
// Assuming these are defined in files accessible via these paths
import { ENEMY_TEMPLATES } from '../combat/Enemy.js';
import { ARTIFACT_TEMPLATES } from '../core/ArtifactDefinitions.js';

// --- Constants ---
const NODE_DISTRIBUTION = {
    1: { combat: 7, elite: 1, event: 3, rest: 1, shop: 1, /* Total: 13 */ },
    2: { combat: 8, elite: 2, event: 4, rest: 1, shop: 1, /* Total: 16 */ },
    3: { combat: 6, elite: 2, event: 3, rest: 2, shop: 1, /* Total: 14 */},
};
const ENEMY_ENCOUNTERS = {
    floor1_combat: [ ['doubt_whisper'], ['doubt_whisper', 'doubt_whisper'] ],
    floor1_elite: [ ['rigid_perfectionism'] ],
    floor1_boss: [ ['shadow_aspect_interaction'] ],
    floor2_combat: [ ['rigid_perfectionism'], ['doubt_whisper','rigid_perfectionism'], ['inner_critic'] ],
    floor2_elite: [ ['rigid_perfectionism', 'rigid_perfectionism'], ['compulsive_habit'] ],
    floor2_boss: [ ['shadow_aspect_interaction'] ], // Reusing boss
    floor3_combat: [ ['inner_critic','unmet_need'], ['compulsive_habit'] ],
    floor3_elite: [ ['inner_critic', 'unmet_need'], ['compulsive_habit', 'rigid_perfectionism'] ],
    floor3_boss: [ ['shadow_aspect_interaction'] ], // Final Boss
};
const EVENT_IDS = {
     floor1: ['ED_A01', 'ED_I01', 'ED_S01', 'ED_P01', 'ED_C01', 'ED_R01', 'pA1', 'pI1'],
     floor2: ['ED_A02', 'ED_I02', 'ED_S02', 'ED_P02', 'ED_C02', 'ED_R02', 'pS1', 'pP1'],
     floor3: ['ED_A03', 'ED_I03', 'ED_RF01', 'ED_RF02', 'pC1', 'pRF1', 'pD1'],
};


/**
 * Represents a single node on the map.
 */
class MapNode {
    constructor(id, type, floor, position = { x: 0, y: 0 }, data = {}) {
        this.id = id;
        this.type = type;
        this.floor = floor;
        this.position = position;
        this.connections = []; // Node IDs this connects TO
        this.incomingConnections = []; // Nodes connecting TO this
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
        this.currentNodeId = null; // Reset current node for new floor

        // --- Generation Parameters ---
        const distribution = NODE_DISTRIBUTION[floorNum] || NODE_DISTRIBUTION[1];
        const layers = 9; // Number of vertical steps/layers
        const baseWidth = 4; // Average nodes per layer
        const widthVariance = 2; // Randomness in layer width
        let nodeCounter = 0;
        const generatedNodesByLayer = []; // Stores nodes organized by layer
        const mapHeight = this.uiManager?.mapArea?.clientHeight || 700; // Get actual render area height
        const mapWidth = this.uiManager?.mapArea?.clientWidth || 1000; // Get actual render area width
        const yPadding = 50; // Padding top/bottom
        const layerHeight = (mapHeight - yPadding * 2) / (layers - 1); // Vertical distance between layer centers

        // 1. Create Start Node
        const startNode = new MapNode(this.startNodeId, 'start', floorNum, { x: mapWidth / 2, y: yPadding });
        this.nodes[this.startNodeId] = startNode;
        generatedNodesByLayer.push([startNode]);

        // 2. Generate Middle Layers
        let availableTypes = this._getShuffledNodeTypes(distribution);
        for (let layer = 1; layer < layers - 1; layer++) {
            const layerNodes = [];
            const numNodesThisLayer = Math.max(1, baseWidth + Math.floor(Math.random() * (widthVariance * 2 + 1)) - widthVariance);
            const layerY = yPadding + layer * layerHeight;

            for (let i = 0; i < numNodesThisLayer; i++) {
                 if (availableTypes.length === 0) availableTypes.push('combat'); // Fallback

                 const nodeType = availableTypes.pop();
                 const nodeId = `floor${floorNum}-node${nodeCounter++}-${nodeType}`;
                 // Distribute horizontally, add slight random offset for less grid-like appearance
                 const baseNodeX = (mapWidth / (numNodesThisLayer + 1)) * (i + 1);
                 const nodeX = baseNodeX + (Math.random() - 0.5) * 40; // +/- 20px random offset

                 let nodeData = {};
                 try {
                    if (nodeType === 'combat' || nodeType === 'elite') {
                        nodeData.enemies = this.selectEnemyEncounter(floorNum, nodeType);
                        if (!nodeData.enemies) throw new Error(`Enemy setup failed`);
                    } else if (nodeType === 'event') {
                         nodeData.eventId = this.selectEvent(floorNum);
                         if (!nodeData.eventId) throw new Error(`Event setup failed`);
                    }
                 } catch (error) {
                     console.error(`Error assigning data for ${nodeType} node ${nodeId}:`, error);
                     // Fallback to ensure node is still valid (e.g., make it a simple combat)
                     nodeData = { enemies: this.selectEnemyEncounter(floorNum, 'combat', true) }; // Fallback combat
                 }

                 const newNode = new MapNode(nodeId, nodeType, floorNum, { x: nodeX, y: layerY }, nodeData);
                 this.nodes[nodeId] = newNode;
                 layerNodes.push(newNode);
            }
            if(layerNodes.length > 0) generatedNodesByLayer.push(layerNodes);
        }

        // 3. Create Boss Node
         const bossNode = new MapNode(this.bossNodeId, 'boss', floorNum, { x: mapWidth / 2, y: yPadding + (layers - 1) * layerHeight });
         try {
             bossNode.data.enemies = this.selectEnemyEncounter(floorNum, 'boss');
             if (!bossNode.data.enemies) throw new Error(`Boss setup failed`);
         } catch (error) {
              console.error(`Error assigning boss data for floor ${floorNum}:`, error);
              bossNode.data.enemies = this.selectEnemyEncounter(floorNum, 'elite', true); // Fallback elite
         }
         this.nodes[this.bossNodeId] = bossNode;
         generatedNodesByLayer.push([bossNode]);


        // 4. Create Connections & Ensure Path
        this._connectLayers(generatedNodesByLayer);
        if (!this._isNodeReachable(this.bossNodeId, this.startNodeId)) {
            console.warn("Boss node potentially unreachable! Forcing connections...");
            this._forceConnectionsTowards(this.bossNodeId, generatedNodesByLayer);
        }

        // --- Final Setup ---
        this.currentNodeId = this.startNodeId; // Set player position
        if (this.nodes[this.startNodeId]) {
            this.nodes[this.startNodeId].visited = true;
        } else {
            console.error("CRITICAL ERROR: Start node not found after map generation!");
            // Handle this - maybe regenerate or throw fatal error?
            return; // Prevent rendering a broken map
        }

        console.log(`MapManager: Generated ${Object.keys(this.nodes).length} nodes for Floor ${floorNum}.`);

        // --- Render the generated map via UIManager ---
        this.renderMap(); // <<<< ENSURE THIS CALL IS HERE AND EXECUTED
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
                    const connectChance = Math.max(0.1, 0.9 / (j + 1)); // Ensure minimum chance, decrease prob for farther nodes
                    if(Math.random() < connectChance || (j === 0 && potentialTargets.length === 1)) { // Connect if chance met, or if it's the only option
                         if (!node.connections.includes(targetNode.id)) {
                            node.connections.push(targetNode.id);
                            targetNode.incomingConnections.push(node.id);
                            connectionCount++;
                         }
                    }
                 }
                 // Ensure at least one connection if none were made randomly (should be rare with above logic)
                 if (node.connections.length === 0 && potentialTargets.length > 0) {
                     const targetNode = potentialTargets[0]; // Connect to closest as fallback
                     node.connections.push(targetNode.id);
                     targetNode.incomingConnections.push(node.id);
                     console.warn(`Node ${node.id} had no connections, forcing link to ${targetNode.id}`);
                 }
            });
         }
    }

     /** Checks reachability using BFS. */
      _isNodeReachable(targetId, startId) {
          if (!this.nodes[startId] || !this.nodes[targetId]) return false;
          const queue = [startId];
          const visited = new Set([startId]);
          while (queue.length > 0) {
              const currentId = queue.shift();
              if (currentId === targetId) return true;
              const node = this.nodes[currentId];
              // Optional chaining for safety
              node?.connections?.forEach(nextId => {
                  if (this.nodes[nextId] && !visited.has(nextId)) {
                      visited.add(nextId);
                      queue.push(nextId);
                  }
              });
          }
          return false;
      }

      /** Attempts to force connections back from unreachable nodes towards the start */
       _forceConnectionsTowards(targetId, layers) {
          // More robust: Find all nodes with no outgoing connections before the final layer
          // and connect them to a random node in the next layer. Repeat until boss is reachable?
          let changed = false;
          for (let i = layers.length - 2; i >= 0; i--) {
                layers[i].forEach(node => {
                    if (node.connections.length === 0 && layers[i+1]?.length > 0) {
                         const nextLayer = layers[i+1];
                         const targetNode = nextLayer[Math.floor(Math.random() * nextLayer.length)];
                         console.log(`Forcing connection from dangling node ${node.id} to ${targetNode.id}`);
                         node.connections.push(targetNode.id);
                         targetNode.incomingConnections.push(node.id);
                         changed = true;
                    }
                });
            }
            // If forcing fixed it, great. If not, log critical error.
             if (changed && !this._isNodeReachable(this.bossNodeId, this.startNodeId)) {
                console.error("CRITICAL MAP ERROR: Boss still unreachable after forcing connections!");
                 // Consider adding a direct path from start or previous layer's first node to boss as last resort?
             } else if (changed) {
                 console.log("Forced connections potentially fixed reachability.");
             }
       }


    /** Gets shuffled node types based on distribution. */
     _getShuffledNodeTypes(distribution) {
         const types = [];
         for (const type in distribution) { for (let i = 0; i < distribution[type]; i++) { types.push(type); } }
         return this.shuffleArray(types);
     }

    /** Utility to shuffle an array. */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; }
        return array;
    }

    /** Selects an enemy encounter, ensuring IDs are valid. */
     selectEnemyEncounter(floorNum, nodeType, useDefault = false) {
         if (useDefault || !ENEMY_TEMPLATES) return ['doubt_whisper']; // Force default or if templates missing

         let key = `floor${floorNum}_${nodeType}`;
         let encounters = ENEMY_TEMPLATES[key];
         if (!encounters || encounters.length === 0) { key = `floor1_${nodeType}`; encounters = ENEMY_TEMPLATES[key]; } // Fallback floor 1 type
         if (!encounters || encounters.length === 0) { key = `floor1_combat`; encounters = ENEMY_TEMPLATES[key]; } // Fallback floor 1 combat
         if (!encounters || encounters.length === 0) return ['doubt_whisper']; // Absolute fallback

         const randomIndex = Math.floor(Math.random() * encounters.length);
         const chosenGroup = encounters[randomIndex];
         const validGroup = chosenGroup.filter(enemyId => ENEMY_TEMPLATES[enemyId]); // Validate IDs
         if (validGroup.length !== chosenGroup.length) { console.error(`Encounter group [${chosenGroup}] had invalid IDs!`); return validGroup.length > 0 ? validGroup : ['doubt_whisper']; }
         return validGroup;
     }

     /** Selects a valid event ID. */
     selectEvent(floorNum) {
         if (!Data || !Data.reflectionPrompts || !Data.elementalDilemmas) return null; // Check data exists
         const key = `floor${floorNum}`;
         let eventIds = EVENT_IDS[key] || EVENT_IDS['floor1']; // Fallback
         const validEventIds = eventIds.filter(id => { // Validate against Data.js
             for (const category in Data.reflectionPrompts) { const source = Data.reflectionPrompts[category]; if (Array.isArray(source) && source.some(p => p.id === id)) return true; if (typeof source === 'object' && source !== null && source[id]) return true; }
             if (Data.elementalDilemmas.some(d => d.id === id)) return true;
             // console.warn(`Event ID ${id} for floor ${floorNum} not found in Data.js`); // Can be noisy
             return false;
         });
         if (validEventIds && validEventIds.length > 0) { return validEventIds[Math.floor(Math.random() * validEventIds.length)]; }
         console.warn(`No valid events found for key: ${key}. Returning null.`);
         return null;
     }


    /** Renders the current map state using the UIManager. */
    renderMap() {
        if (!this.uiManager) { console.error("MapManager: UIManager not available for rendering."); return; }
        // Delegate rendering to UIManager
        this.uiManager.renderMap(this.nodes, this.currentNodeId, this.getAllConnections());
    }


    /** Moves the player and triggers node interaction via GameState. */
    moveToNode(targetNodeId) {
        if (!this.runActiveCheck()) return; // Check run active
        const currentNode = this.nodes[this.currentNodeId];
        if (!currentNode) { console.error("MapManager: Current node invalid."); return; }
        if (!currentNode.connections.includes(targetNodeId)) { this.uiManager?.showActionFeedback("Cannot move there!", "warning"); return; } // Check connection
        const targetNode = this.nodes[targetNodeId];
        if (!targetNode) { console.error(`MapManager: Target node ${targetNodeId} not found.`); this.uiManager?.showActionFeedback("Map Error!", "error"); return; }

        // Perform Move
        console.log(`MapManager: Moving to ${targetNode.type} node ${targetNodeId}...`);
        this.currentNodeId = targetNodeId;
        targetNode.visited = true;

        // Delegate Interaction to GameState (handles screen changes etc.)
        this.gameState.handleNodeEntry(targetNode);

        // Update player info display on map immediately
        this.uiManager?.updatePlayerMapInfo(this.gameState.player, this.currentFloor);
        // Map itself is usually re-rendered by UIManager when returning to mapScreen
    }


    /** Returns connection pairs [{from: nodeId, to: nodeId}] for rendering. */
     getAllConnections() {
        const connections = [];
        Object.values(this.nodes).forEach(node => {
            node.connections?.forEach(targetId => { // Add null check
                if(this.nodes[targetId]) { connections.push({ from: node.id, to: targetId }); }
                else { /* console.warn(`Connection Error: ${node.id} -> ${targetId}`); */ } // Noisy
            });
        });
        return connections;
     }

    /** Returns available next nodes. */
     getAvailableMoves() {
         if (!this.runActiveCheck() || !this.nodes[this.currentNodeId]) return [];
         return this.nodes[this.currentNodeId].connections
             ?.map(id => this.nodes[id]) // Add null check
             .filter(node => node); // Filter out undefined nodes
     }

    /** Returns the current node object. */
     getCurrentNode() {
         if (!this.runActiveCheck()) return null;
        return this.nodes[this.currentNodeId];
     }

     /** Helper to check if game state and run are active */
     runActiveCheck() {
         // Added check for gameState itself
         if (!this.gameState || !this.gameState.runActive) { return false; }
         return true;
     }

} // End of MapManager class
