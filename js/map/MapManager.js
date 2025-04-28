// js/map/MapManager.js

// Import data - needed for enemy/event selection
import * as Data from '../../data.js'; // Correct path from js/map to root
// Import enemy/artifact definitions for validation
import { ENEMY_TEMPLATES } from '../combat/Enemy.js';
import { ARTIFACT_TEMPLATES } from '../core/ArtifactDefinitions.js'; // Needed if events/rewards give artifacts

// --- Map Generation Constants ---
// Defines the number of each node type per floor (adjust for balance)
const NODE_DISTRIBUTION = {
    // Floor 1: 7 middle layers * avg 4 nodes/layer = ~28 nodes needed
    1: { combat: 18, elite: 2, event: 5, rest: 2, shop: 1, /* Total: 28 */ }, // Increased counts significantly
    // Floor 2: Assume same density for now, adjust if layers/width change
    2: { combat: 20, elite: 3, event: 6, rest: 2, shop: 1, /* Total: 32 */ }, // Increased counts
    // Floor 3: Assume same density
    3: { combat: 18, elite: 4, event: 7, rest: 3, shop: 1, /* Total: 33 */}, // Increased counts
};
// Defines potential enemy groups for different node types and floors
const ENEMY_ENCOUNTERS = {
    // Use enemy IDs defined in Enemy.js
    floor1_combat: [ ['doubt_whisper'], ['doubt_whisper', 'doubt_whisper'], ['anxious_tremor'] ],
    floor1_elite: [ ['rigid_perfectionism'] ],
    floor1_boss: [ ['shadow_aspect_interaction'] ], // Placeholder boss ID
    floor2_combat: [ ['anxious_tremor', 'doubt_whisper'], ['inner_critic'], ['resentment_globule'] ],
    floor2_elite: [ ['rigid_perfectionism', 'doubt_whisper'], ['compulsive_habit'] ],
    floor2_boss: [ ['shadow_aspect_interaction'] ], // Reusing boss placeholder
    floor3_combat: [ ['inner_critic', 'resentment_globule'], ['despair_echo'], ['compulsive_habit'] ],
    floor3_elite: [ ['fragmented_identity'], ['compulsive_habit', 'inner_critic'] ],
    floor3_boss: [ ['shadow_aspect_interaction'] ], // Final Boss placeholder
};

// Defines potential Event/Dilemma IDs available on each floor (from Data.js)
const EVENT_IDS = {
     floor1: ['ED_A01', 'ED_I01', 'ED_S01', 'pA1', 'pI1', 'pS1'], // Example mix
     floor2: ['ED_P01', 'ED_C01', 'ED_R01', 'pP1', 'pC1', 'pD1'], // Example mix
     floor3: ['ED_A02', 'ED_I02', 'ED_S02', 'ED_RF01', 'ED_RF02', 'pRF1', 'pD2'], // Example mix + RF Dilemmas (pD2 needs definition)
};


/**
 * Represents a single node on the map.
 */
class MapNode {
    constructor(id, type, floor, position = { x: 0, y: 0 }, data = {}) {
        this.id = id; // Unique identifier (e.g., "floor1-node3-combat")
        this.type = type; // 'start', 'combat', 'elite', 'event', 'rest', 'shop', 'boss'
        this.floor = floor; // Floor number
        this.position = position; // { x, y } coordinates for rendering
        this.connections = []; // Node IDs this node connects TO (forward)
        this.incomingConnections = []; // Node IDs connecting TO this node (backward)
        this.visited = false; // Has the player been here?
        this.data = data; // Node-specific data: { enemies?: string[], eventId?: string }
        this.element = null; // DOM element reference (set by UIManager during render)
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
        this.nodes = {}; // Stores all MapNode instances, keyed by ID
        this.startNodeId = null;
        this.bossNodeId = null;
        this.currentNodeId = null; // Player's current location node ID

        console.log("MapManager initialized.");
    }

    /**
     * Generates the map data for a specific floor.
     * @param {number} floorNum - The floor number to generate.
     */
    generateFloor(floorNum) {
        if (!this.runActiveCheck()) {
             console.warn("MapManager: Cannot generate floor, run is not active.");
             return;
        }
        console.log(`MapManager: Generating map for Floor ${floorNum}...`);
        this.currentFloor = floorNum;
        this.nodes = {}; // Clear previous floor nodes
        this.startNodeId = `floor${floorNum}-start`;
        this.bossNodeId = `floor${floorNum}-boss`;
        this.currentNodeId = null; // Reset current node for new floor

        // --- Generation Parameters ---
        const distribution = NODE_DISTRIBUTION[floorNum] || NODE_DISTRIBUTION[1]; // Use floor dist or fallback
        // TODO: Make layers/width potentially variable per floor?
        const layers = 9; // Number of vertical steps/layers (including start/boss)
        const baseWidth = 4; // Average nodes per layer
        const widthVariance = 2; // Randomness in layer width (+/- this value)
        let nodeCounter = 0; // For unique node IDs
        const generatedNodesByLayer = []; // Stores nodes organized by layer [[start], [layer1], ..., [boss]]
        const mapHeight = this.uiManager?.mapArea?.clientHeight || 700; // Get render area size
        const mapWidth = this.uiManager?.mapArea?.clientWidth || 1000;
        const yPadding = 60; // Increased padding top/bottom
        const layerHeight = (mapHeight - yPadding * 2) / (layers - 1); // Vertical distance between layer centers

        // 1. Create Start Node
        const startNode = new MapNode(this.startNodeId, 'start', floorNum, { x: mapWidth / 2, y: yPadding });
        this.nodes[this.startNodeId] = startNode;
        generatedNodesByLayer.push([startNode]);

        // 2. Generate Middle Layers (Layers 1 to layers-2)
        let availableTypes = this._getShuffledNodeTypes(distribution);
        for (let layer = 1; layer < layers - 1; layer++) {
            const layerNodes = [];
            // Ensure at least 1 node per layer, apply variance
            const numNodesThisLayer = Math.max(1, baseWidth + Math.floor(Math.random() * (widthVariance * 2 + 1)) - widthVariance);
            const layerY = yPadding + layer * layerHeight;

            for (let i = 0; i < numNodesThisLayer; i++) {
                 // Replenish types if somehow ran out (shouldn't happen with proper distribution)
                 if (availableTypes.length === 0) {
                     console.warn(`Ran out of node types for floor ${floorNum}, layer ${layer}. Adding fallback combat.`);
                     availableTypes = this._getShuffledNodeTypes({combat: 1});
                 }

                 const nodeType = availableTypes.pop();
                 const nodeId = `floor${floorNum}-node${nodeCounter++}-${nodeType}`;
                 // Distribute horizontally, add slight random offset
                 const baseNodeX = (mapWidth / (numNodesThisLayer + 1)) * (i + 1);
                 const nodeX = Math.round(baseNodeX + (Math.random() - 0.5) * 60); // +/- 30px random offset

                 let nodeData = {};
                 try {
                    if (nodeType === 'combat' || nodeType === 'elite') {
                        nodeData.enemies = this.selectEnemyEncounter(floorNum, nodeType);
                        if (!nodeData.enemies || nodeData.enemies.length === 0) {
                             throw new Error(`Failed to select valid enemies for ${nodeType}`);
                        }
                    } else if (nodeType === 'event') {
                         nodeData.eventId = this.selectEvent(floorNum);
                         if (!nodeData.eventId) {
                             throw new Error(`Failed to select a valid event ID`);
                         }
                    }
                    // Shop/Rest nodes currently don't need specific data pre-assigned
                 } catch (error) {
                     console.error(`Map Gen Error: Node data assignment failed for ${nodeId} (${nodeType}):`, error);
                     // --- Fallback Strategy ---
                     // Change type to basic combat and assign default enemies
                     console.warn(`Falling back to basic combat node for ${nodeId}.`);
                     nodeData = { enemies: this.selectEnemyEncounter(floorNum, 'combat', true) }; // Use default fallback
                     // We might change the node type itself here too, but keep original label for now
                     // newNode.type = 'combat'; // Optionally change type if data fails
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
             if (!bossNode.data.enemies || bossNode.data.enemies.length === 0) {
                  throw new Error(`Failed to select valid boss encounter`);
             }
         } catch (error) {
              console.error(`Map Gen Error: Boss data assignment failed for floor ${floorNum}:`, error);
              bossNode.data.enemies = this.selectEnemyEncounter(floorNum, 'elite', true); // Fallback elite
              console.warn(`Assigned fallback elite encounter to boss node ${this.bossNodeId}.`);
         }
         this.nodes[this.bossNodeId] = bossNode;
         generatedNodesByLayer.push([bossNode]);


        // 4. Create Connections & Ensure Path
        this._connectLayers(generatedNodesByLayer);
        if (!this._isNodeReachable(this.bossNodeId, this.startNodeId)) {
            console.warn("Map Gen Warning: Boss node potentially unreachable after initial connection phase! Forcing connections...");
            this._forceConnectionsTowards(this.bossNodeId, generatedNodesByLayer);
             // Re-check after forcing
             if (!this._isNodeReachable(this.bossNodeId, this.startNodeId)) {
                  console.error("Map Gen CRITICAL ERROR: Boss still unreachable after forcing connections!");
                  // Consider adding a direct path from start or final layer node as ultimate fallback?
             }
        }

        // --- Final Setup ---
        this.currentNodeId = this.startNodeId; // Set player position to start
        if (this.nodes[this.startNodeId]) {
            this.nodes[this.startNodeId].visited = true; // Mark start node as visited
        } else {
            console.error("Map Gen CRITICAL ERROR: Start node missing after generation!");
            // Handle this - maybe try regenerating or throw fatal error?
            this.gameState.endRun(false); // End run immediately if map fails critically
            return;
        }

        console.log(`MapManager: Generated ${Object.keys(this.nodes).length} nodes for Floor ${floorNum}. Player at ${this.currentNodeId}.`);

        // --- Render the generated map via UIManager ---
        // Render is called here to ensure map is drawn immediately upon floor generation
        this.renderMap();
    }


    /** Creates connections between adjacent layers, trying to ensure path diversity. */
    _connectLayers(layers) {
         for (let i = 0; i < layers.length - 1; i++) {
            const currentLayerNodes = layers[i];
            const nextLayerNodes = layers[i + 1];
            if (!nextLayerNodes || nextLayerNodes.length === 0) continue; // Skip if next layer is empty

            currentLayerNodes.forEach(node => {
                 // Sort potential targets by horizontal distance
                 const potentialTargets = [...nextLayerNodes].sort((a, b) =>
                      Math.abs(a.position.x - node.position.x) - Math.abs(b.position.x - node.position.x)
                 );
                const maxConnections = 3; // Max outgoing connections per node
                 let connectionCount = 0;

                 // Connect to closest 1-3 nodes with decreasing probability
                 for(let j=0; j < potentialTargets.length && connectionCount < maxConnections; j++) {
                    const targetNode = potentialTargets[j];
                    // Higher chance for closer nodes, ensure minimum chance, guarantee at least one if possible
                    const connectChance = Math.max(0.15, 0.95 / (j + 1)); // Adjusted probabilities
                    const isOnlyOption = potentialTargets.length === 1; // Connect if it's the only target
                    const needsConnection = node.connections.length === 0 && j === 0; // Force connect to closest if node has no connections yet

                    if(Math.random() < connectChance || isOnlyOption || needsConnection) {
                         if (!node.connections.includes(targetNode.id)) { // Avoid duplicate connections
                            node.connections.push(targetNode.id);
                            targetNode.incomingConnections.push(node.id);
                            connectionCount++;
                         }
                    }
                 }
                 // Ensure at least one connection if somehow none were made (should be rare)
                 if (node.connections.length === 0 && potentialTargets.length > 0) {
                     const targetNode = potentialTargets[0]; // Connect to closest as fallback
                     node.connections.push(targetNode.id);
                     targetNode.incomingConnections.push(node.id);
                     console.warn(`Map Gen Warning: Node ${node.id} had 0 connections after loop, forcing link to ${targetNode.id}`);
                 }
            });
         }
    }

     /** Checks reachability from startId to targetId using Breadth-First Search. */
      _isNodeReachable(targetId, startId) {
          if (!this.nodes[startId] || !this.nodes[targetId]) return false; // Nodes don't exist

          const queue = [startId];
          const visited = new Set([startId]);

          while (queue.length > 0) {
              const currentId = queue.shift();
              if (currentId === targetId) return true; // Target found

              const node = this.nodes[currentId];
              // Check if node and connections exist before iterating
              node?.connections?.forEach(nextId => {
                  if (this.nodes[nextId] && !visited.has(nextId)) {
                      visited.add(nextId);
                      queue.push(nextId);
                  }
              });
          }
          return false; // Target not reachable
      }

      /** Attempts to fix reachability issues by adding connections upwards from dead ends. */
       _forceConnectionsTowards(targetId, layers) {
          let changesMade = false;
          // Iterate backwards from the layer before the boss
          for (let i = layers.length - 2; i >= 0; i--) {
              const currentLayer = layers[i];
              const nextLayer = layers[i + 1];
              if (!nextLayer || nextLayer.length === 0) continue;

              currentLayer.forEach(node => {
                  // Check if node has no outgoing connections OR if none of its connections are reachable from start
                  let needsConnection = node.connections.length === 0;
                  if (!needsConnection && !this._isNodeReachable(node.id, this.startNodeId)) {
                       // This node itself isn't reachable, skip forcing from here
                       return;
                  }
                   // If the node is reachable, but none of its forward connections lead to the boss eventually, it's a dead end path
                  // This check is complex, let's stick to the simpler "no outgoing connections" check for now.
                  // A more robust check would trace forward from each connection.

                  if (needsConnection) {
                       // Find the closest node in the next layer to connect to
                       const potentialTargets = [...nextLayer].sort((a, b) =>
                           Math.abs(a.position.x - node.position.x) - Math.abs(b.position.x - node.position.x)
                       );
                       if (potentialTargets.length > 0) {
                           const targetNode = potentialTargets[0];
                           if (!node.connections.includes(targetNode.id)) {
                                node.connections.push(targetNode.id);
                                targetNode.incomingConnections.push(node.id);
                                console.log(`Map Gen Force Connect: Linked dangling node ${node.id} to ${targetNode.id}`);
                                changesMade = true;
                           }
                       }
                  }
              });
          }
          return changesMade;
       }


    /** Gets shuffled node types based on distribution. */
     _getShuffledNodeTypes(distribution) {
         const types = [];
         for (const type in distribution) {
             if (distribution.hasOwnProperty(type)) {
                 for (let i = 0; i < distribution[type]; i++) {
                     types.push(type);
                 }
             }
         }
         return this.shuffleArray(types); // Use utility shuffle
     }

    /** Utility to shuffle an array (Fisher-Yates). */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /** Selects a valid enemy encounter group for the floor/type. */
     selectEnemyEncounter(floorNum, nodeType, useDefault = false) {
         const fallbackEncounter = ['doubt_whisper']; // Define fallback
         if (useDefault || !ENEMY_TEMPLATES) return fallbackEncounter;

         let potentialKeys = [
             `floor${floorNum}_${nodeType}`,
             `floor1_${nodeType}`, // Fallback to floor 1 type
             `floor${floorNum}_combat`, // Fallback to floor combat
             `floor1_combat` // Fallback to floor 1 combat
         ];

         let encounters = null;
         for (const key of potentialKeys) {
             if (ENEMY_ENCOUNTERS[key] && ENEMY_ENCOUNTERS[key].length > 0) {
                 encounters = ENEMY_ENCOUNTERS[key];
                 // console.log(`Selected encounters using key: ${key}`); // Debug
                 break;
             }
         }

         if (!encounters) {
              console.warn(`No valid enemy encounters found for floor ${floorNum}, type ${nodeType}. Using default.`);
              return fallbackEncounter;
         }

         // Select a random group from the list
         const chosenGroup = encounters[Math.floor(Math.random() * encounters.length)];

         // Validate that all enemy IDs in the chosen group exist in ENEMY_TEMPLATES
         const validGroup = chosenGroup.filter(enemyId => ENEMY_TEMPLATES[enemyId]);
         if (validGroup.length !== chosenGroup.length) {
              console.error(`Map Gen Error: Encounter group [${chosenGroup.join(', ')}] contained invalid enemy IDs not found in ENEMY_TEMPLATES! Using valid subset or fallback.`);
              return validGroup.length > 0 ? validGroup : fallbackEncounter; // Return valid subset or absolute fallback
         }

         return validGroup; // Return the validated group
     }

     /** Selects a valid event ID for the floor from Data.js. */
     selectEvent(floorNum) {
         // Ensure Data object and necessary sub-objects exist
         if (!Data || !Data.reflectionPrompts || !Data.elementalDilemmas) {
             console.error("Map Gen Error: Data.js structure missing for event selection.");
             return null;
         }

         const key = `floor${floorNum}`;
         let eventIds = EVENT_IDS[key] || EVENT_IDS['floor1']; // Use floor list or fallback to floor 1

         // Filter the list to include only IDs that actually exist in Data.js
         const validEventIds = eventIds.filter(id => {
             // Check reflection prompts (including nested)
             for (const category in Data.reflectionPrompts) {
                 const source = Data.reflectionPrompts[category];
                 if (Array.isArray(source) && source.some(p => p.id === id)) return true;
                 if (typeof source === 'object' && source !== null) {
                      if (source[id]) return true; // Direct key match
                      // Check nested arrays within objects (like 'Guided')
                      for (const subKey in source) {
                           if(Array.isArray(source[subKey]) && source[subKey].some(p => p.id === id)) return true;
                      }
                 }
             }
             // Check elemental dilemmas
             if (Data.elementalDilemmas.some(d => d.id === id)) return true;

             // If not found anywhere
             // console.warn(`Event ID ${id} listed for floor ${floorNum} but not found in Data.js`); // Can be noisy
             return false;
         });

         if (validEventIds && validEventIds.length > 0) {
             // Select a random valid ID
             return validEventIds[Math.floor(Math.random() * validEventIds.length)];
         }

         console.warn(`No valid and defined events found for key: ${key}. Returning null.`);
         return null; // Return null if no valid events are available
     }


    /** Renders the current map state using the UIManager. */
    renderMap() {
        if (!this.uiManager) { console.error("MapManager: UIManager not available for rendering."); return; }
        if (!this.runActiveCheck()) return; // Don't render if run isn't active

        // Delegate rendering to UIManager, providing necessary data
        try {
             this.uiManager.renderMap(this.nodes, this.currentNodeId, this.getAllConnections());
        } catch (error) {
             console.error("Error during UIManager.renderMap call:", error);
             // Display error on map area?
             if (this.uiManager.mapArea) this.uiManager.mapArea.innerHTML = `<p style="color:red; text-align:center; padding: 20px;">Map Rendering Error!</p>`;
        }
    }


    /** Moves the player to a target node and triggers node interaction via GameState. */
    moveToNode(targetNodeId) {
        if (!this.runActiveCheck()) return; // Check run active

        const currentNode = this.nodes[this.currentNodeId];
        if (!currentNode) { console.error("MapManager Error: Current node is invalid."); return; }

        // Check if the target node is a valid connection from the current node
        if (!currentNode.connections?.includes(targetNodeId)) {
            this.uiManager?.showActionFeedback("Cannot move to that node!", "warning");
            console.warn(`Attempted invalid move from ${this.currentNodeId} to ${targetNodeId}. Valid connections: ${currentNode.connections.join(', ')}`);
            return;
        }

        const targetNode = this.nodes[targetNodeId];
        if (!targetNode) {
             console.error(`MapManager Error: Target node ${targetNodeId} not found in nodes object.`);
             this.uiManager?.showActionFeedback("Map Error!", "error");
             return;
        }

        // --- Perform Move ---
        console.log(`MapManager: Moving from ${currentNode.id} to ${targetNode.type} node ${targetNodeId}...`);
        this.currentNodeId = targetNodeId;
        targetNode.visited = true; // Mark as visited immediately

        // Delegate Interaction to GameState (handles screen changes, combat start, events etc.)
        try {
            this.gameState.handleNodeEntry(targetNode);
        } catch (error) {
            console.error(`Error during GameState.handleNodeEntry for node ${targetNodeId}:`, error);
            // Attempt to recover - maybe force back to map screen?
            this.uiManager?.showActionFeedback("Error entering node!", "error");
            this.uiManager?.showScreen('mapScreen');
            this.renderMap(); // Re-render map after error
        }

        // --- Post-Move Updates ---
        // Update player info display on map immediately (might have changed during node entry)
        this.uiManager?.updatePlayerMapInfo(this.gameState.player, this.currentFloor);
        // Map itself might be re-rendered by UIManager when returning to mapScreen,
        // but rendering here ensures connections dim immediately if needed.
        this.renderMap(); // Re-render map to show visited state and updated available moves
    }


    /** Returns connection pairs [{from: nodeId, to: nodeId}] for rendering lines. */
     getAllConnections() {
        const connections = [];
        Object.values(this.nodes).forEach(node => {
            node?.connections?.forEach(targetId => { // Add null checks
                if(this.nodes[targetId]) { // Ensure target node exists
                    connections.push({ from: node.id, to: targetId });
                } else {
                    console.warn(`Map Data Warning: Node ${node.id} lists connection to non-existent node ${targetId}`);
                }
            });
        });
        return connections;
     }

    /** Returns available next node objects based on current position. */
     getAvailableMoves() {
         if (!this.runActiveCheck() || !this.nodes[this.currentNodeId]) return [];

         return this.nodes[this.currentNodeId].connections
             ?.map(id => this.nodes[id]) // Get node object for each connected ID
             .filter(node => node); // Filter out any potentially undefined nodes
     }

    /** Returns the current node object. */
     getCurrentNode() {
         if (!this.runActiveCheck()) return null;
        return this.nodes[this.currentNodeId] || null; // Return null if ID is somehow invalid
     }

     /** Helper to check if game state and run are active */
     runActiveCheck() {
         // Added check for gameState itself
         if (!this.gameState || !this.gameState.runActive) {
             // console.warn("MapManager: Action aborted, run not active."); // Can be noisy
             return false;
         }
         return true;
     }

} // End of MapManager class
