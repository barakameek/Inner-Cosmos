// js/map/MapManager.js

// Import node types if we define them separately later
// import { CombatNode, EventNode, ShopNode, RestNode, BossNode } from './MapNode.js'; // Example

// --- Constants ---
// Define probabilities or counts for different node types per floor
const NODE_DISTRIBUTION = {
    // Floor: [Combat, Elite, Event, Rest, Shop] counts/weights
    1: { combat: 7, elite: 1, event: 3, rest: 1, shop: 1 },
    2: { combat: 8, elite: 2, event: 4, rest: 1, shop: 1 },
    // Add more floors as needed
};

// Define potential enemy encounters per floor/node type
const ENEMY_ENCOUNTERS = {
    floor1_combat: [
        ['doubt_whisper'], // Single enemy
        ['doubt_whisper', 'doubt_whisper'], // Two enemies
        // Add more combinations
    ],
    floor1_elite: [
        ['rigid_perfectionism'], // Elite enemy
    ],
    // Add encounters for other floors/types
};

// Define potential event IDs per floor
const EVENT_IDS = {
     floor1: ['ED_A01', 'ED_I01', 'ED_S01', /* ... more dilemma/reflection IDs */ ],
     // Add more floors
};


/**
 * Represents a single node on the map.
 * (Could be a separate file: MapNode.js, but included here for simplicity initially)
 */
class MapNode {
    constructor(id, type, floor, position = { x: 0, y: 0 }, data = {}) {
        this.id = id; // Unique identifier (e.g., "floor1-node5-combat")
        this.type = type; // 'combat', 'elite', 'event', 'rest', 'shop', 'boss', 'start'
        this.floor = floor;
        this.position = position; // { x, y } coordinates for rendering
        this.connections = []; // Array of node IDs this node connects TO
        this.visited = false;
        this.data = data; // Extra data (e.g., enemy group ID for combat, event ID)

        // Rendering properties (optional)
        this.element = null; // Reference to the DOM element for this node
    }
}


/**
 * Manages map generation, player position, and node transitions.
 */
export class MapManager {
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.currentFloor = 0;
        this.nodes = {}; // Store all nodes by ID: { nodeId: MapNode }
        this.startNodeId = null;
        this.bossNodeId = null;
        this.currentNodeId = null; // ID of the node the player is currently on

        console.log("MapManager initialized.");
    }

    /**
     * Generates the map data for a specific floor.
     * This is a complex task, simplified here.
     * @param {number} floorNum - The floor number to generate.
     * @returns {object} The generated map data (nodes, connections).
     */
    generateFloor(floorNum) {
        console.log(`MapManager: Generating map for Floor ${floorNum}...`);
        this.currentFloor = floorNum;
        this.nodes = {}; // Clear nodes from previous floor
        this.startNodeId = `floor${floorNum}-start`;
        this.bossNodeId = `floor${floorNum}-boss`;
        this.currentNodeId = null; // Reset current node

        const distribution = NODE_DISTRIBUTION[floorNum] || NODE_DISTRIBUTION[1]; // Fallback to floor 1
        const totalNodes = Object.values(distribution).reduce((a, b) => a + b, 0);
        const layers = 7; // Example: Fixed number of layers/rows for the map
        const nodesPerLayer = Math.ceil(totalNodes / (layers - 2)); // Distribute nodes between start/boss

        let nodeCounter = 0;
        const generatedNodes = []; // Array to hold nodes layer by layer

        // 1. Create Start Node
        const startNode = new MapNode(this.startNodeId, 'start', floorNum, { x: 50, y: 50 }); // Example position
        this.nodes[this.startNodeId] = startNode;
        generatedNodes.push([startNode]); // First layer

        // 2. Generate Middle Layers
        let availableTypes = this._getShuffledNodeTypes(distribution);
        for (let layer = 1; layer < layers - 1; layer++) {
            const layerNodes = [];
            const numNodesThisLayer = Math.min(nodesPerLayer, availableTypes.length); // Adjust based on remaining types
             const layerY = 50 + layer * (800 - 100) / layers; // Distribute vertically (assuming 800px height)

            for (let i = 0; i < numNodesThisLayer; i++) {
                 if (availableTypes.length === 0) break; // Ran out of types

                 const nodeType = availableTypes.pop();
                 const nodeId = `floor${floorNum}-node${nodeCounter++}-${nodeType}`;
                 const nodeX = 50 + (i + 1) * (1200 - 100) / (numNodesThisLayer + 1); // Distribute horizontally (1200px width)

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
            if(layerNodes.length > 0) generatedNodes.push(layerNodes);
        }

        // 3. Create Boss Node
        const bossNode = new MapNode(this.bossNodeId, 'boss', floorNum, { x: 600, y: 800 - 50 }); // Centered at bottom
         bossNode.data.enemies = this.selectEnemyEncounter(floorNum, 'boss'); // Get boss encounter
        this.nodes[this.bossNodeId] = bossNode;
        generatedNodes.push([bossNode]); // Last layer


        // 4. Create Connections (Simplified: connect each node to 1-2 random nodes in next layer)
        for (let layer = 0; layer < generatedNodes.length - 1; layer++) {
            const currentLayer = generatedNodes[layer];
            const nextLayer = generatedNodes[layer + 1];
            if (!nextLayer || nextLayer.length === 0) continue;

            currentLayer.forEach(node => {
                const numConnections = Math.random() < 0.4 ? 1 : 2; // Connect to 1 or 2 nodes usually
                const potentialTargets = [...nextLayer]; // Copy target layer
                this.shuffleArray(potentialTargets); // Shuffle targets

                for (let i = 0; i < Math.min(numConnections, potentialTargets.length); i++) {
                     node.connections.push(potentialTargets[i].id);
                 }
                // Ensure at least one connection if possible
                 if (node.connections.length === 0 && potentialTargets.length > 0) {
                     node.connections.push(potentialTargets[0].id);
                 }
            });
        }

        // --- Final Setup ---
        this.currentNodeId = this.startNodeId; // Player starts at the start node
        this.nodes[this.startNodeId].visited = true;

        console.log(`MapManager: Generated ${Object.keys(this.nodes).length} nodes for Floor ${floorNum}.`);
        // console.log("Generated Nodes:", this.nodes); // For debugging

         // Initial rendering
         this.renderMap();

        return { nodes: this.nodes, connections: this.getAllConnections() }; // Return map data
    }

    /**
     * Creates a shuffled list of node types based on distribution counts.
     */
     _getShuffledNodeTypes(distribution) {
         const types = [];
         for (const type in distribution) {
             for (let i = 0; i < distribution[type]; i++) {
                 types.push(type);
             }
         }
         return this.shuffleArray(types);
     }

    /**
     * Utility to shuffle an array.
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }


    /**
     * Selects an enemy encounter configuration for a given node type and floor.
     */
     selectEnemyEncounter(floorNum, nodeType) {
         let key;
         if (nodeType === 'boss') {
             key = `floor${floorNum}_boss`; // Define boss encounters separately if needed
             // Placeholder boss encounter
             return ['shadow_aspect_interaction']; // Default boss
         } else {
             key = `floor${floorNum}_${nodeType}`;
         }

         const encounters = ENEMY_ENCOUNTERS[key];
         if (encounters && encounters.length > 0) {
             const randomIndex = Math.floor(Math.random() * encounters.length);
             return encounters[randomIndex]; // Return an array of enemy IDs
         }
         console.warn(`No enemy encounters defined for key: ${key}. Using default.`);
         return ['doubt_whisper']; // Default fallback
     }

     /**
     * Selects an event ID for an event node.
     */
     selectEvent(floorNum) {
         const key = `floor${floorNum}`;
         const eventIds = EVENT_IDS[key];
         if (eventIds && eventIds.length > 0) {
              const randomIndex = Math.floor(Math.random() * eventIds.length);
              return eventIds[randomIndex];
         }
         console.warn(`No events defined for key: ${key}.`);
         return null; // Or a default event ID
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
        this.uiManager.renderMap(this.nodes, this.currentNodeId, this.getAllConnections());
        this.uiManager.updatePlayerMapInfo(this.gameState.player, this.currentFloor); // Update player info display
    }


    /**
     * Moves the player to a new node if it's a valid connection from the current node.
     * @param {string} targetNodeId - The ID of the node to move to.
     */
    moveToNode(targetNodeId) {
        if (!this.currentNodeId || !this.nodes[this.currentNodeId]) {
            console.error("MapManager: Cannot move, current node is invalid.");
            return;
        }

        const currentNode = this.nodes[this.currentNodeId];
        if (!currentNode.connections.includes(targetNodeId)) {
            console.warn(`MapManager: Cannot move from ${this.currentNodeId} to ${targetNodeId}. Not connected.`);
            return;
        }

        const targetNode = this.nodes[targetNodeId];
        if (!targetNode) {
            console.error(`MapManager: Target node ${targetNodeId} not found.`);
            return;
        }

        console.log(`MapManager: Moving from ${currentNode.type} node ${this.currentNodeId} to ${targetNode.type} node ${targetNodeId}...`);
        this.currentNodeId = targetNodeId;
        targetNode.visited = true; // Mark the new node as visited

        // --- Trigger Node Interaction ---
        this.gameState.handleNodeEntry(targetNode); // Delegate interaction logic to GameState

        // Re-render the map to show updated player position and visited status
        this.renderMap();
    }


    /**
     * Returns an array of all connection pairs for rendering.
     * @returns {Array<{from: string, to: string}>}
     */
    getAllConnections() {
        const connections = [];
        Object.values(this.nodes).forEach(node => {
            node.connections.forEach(targetId => {
                connections.push({ from: node.id, to: targetId });
            });
        });
        return connections;
    }

    /**
     * Returns the possible next nodes the player can move to.
     * @returns {MapNode[]} An array of reachable MapNode objects.
     */
    getAvailableMoves() {
        if (!this.currentNodeId || !this.nodes[this.currentNodeId]) {
            return [];
        }
        const currentNode = this.nodes[this.currentNodeId];
        return currentNode.connections.map(id => this.nodes[id]).filter(node => node); // Filter out invalid IDs
    }

    getCurrentNode() {
        return this.nodes[this.currentNodeId];
    }


} // End of MapManager class


// --- Add Map Rendering to UIManager (Example Snippet) ---
/*
// Add this method to UIManager.js

    renderMap(nodes, currentNodeId, connections) {
        if (!this.mapArea) return;
        this.mapArea.innerHTML = ''; // Clear previous map
        const mapSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        mapSvg.setAttribute('width', '100%');
        mapSvg.setAttribute('height', '100%');
        mapSvg.style.backgroundColor = '#34495e'; // Match area background

        // Render Connections (Lines) first
        connections.forEach(conn => {
            const fromNode = nodes[conn.from];
            const toNode = nodes[conn.to];
            if (fromNode && toNode) {
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute('x1', fromNode.position.x);
                line.setAttribute('y1', fromNode.position.y);
                line.setAttribute('x2', toNode.position.x);
                line.setAttribute('y2', toNode.position.y);
                // Style based on visited status?
                 line.setAttribute('stroke', fromNode.visited ? '#bdc3c7' : '#7f8c8d'); // Lighter if origin visited
                line.setAttribute('stroke-width', '2');
                mapSvg.appendChild(line);
            }
        });

        // Render Nodes (Circles/Icons) second
        Object.values(nodes).forEach(node => {
             const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
             nodeGroup.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);
             nodeGroup.style.cursor = 'pointer'; // Indicate clickable

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute('r', '15'); // Radius of the node circle
            circle.setAttribute('fill', this.getNodeColor(node.type));
            circle.setAttribute('stroke', node.id === currentNodeId ? '#f1c40f' : (node.visited ? '#555' : '#ecf0f1')); // Highlight current, dim visited
            circle.setAttribute('stroke-width', node.id === currentNodeId ? '3' : '2');

            // Add icon based on type (using Font Awesome text)
             const iconText = document.createElementNS("http://www.w3.org/2000/svg", "text");
             iconText.setAttribute('font-family', 'FontAwesome'); // Requires Font Awesome loaded
             iconText.setAttribute('font-size', '16px');
             iconText.setAttribute('fill', '#fff');
             iconText.setAttribute('text-anchor', 'middle');
             iconText.setAttribute('dominant-baseline', 'central');
             iconText.textContent = this.getNodeIcon(node.type);


            nodeGroup.appendChild(circle);
            nodeGroup.appendChild(iconText);

            // Store node ID for click handling
             nodeGroup.dataset.nodeId = node.id;

            // Add click listener to move
             nodeGroup.addEventListener('click', () => {
                  if (nodes[currentNodeId]?.connections.includes(node.id)) {
                       this.gameState.mapManager.moveToNode(node.id); // Use references correctly
                  } else {
                      console.log(`Cannot move to ${node.id} from ${currentNodeId}`);
                  }
             });

             // Add tooltip listener
            nodeGroup.addEventListener('mouseover', (event) => {
                 this.showTooltip(`Node: ${node.type.toUpperCase()}${node.visited ? ' (Visited)' : ''}`, event.clientX, event.clientY);
            });
             nodeGroup.addEventListener('mouseout', () => {
                 this.hideTooltip();
             });
              nodeGroup.addEventListener('mousemove', (event) => {
                  this.updateTooltipPosition(event.clientX, event.clientY);
              });


             node.element = nodeGroup; // Store reference if needed
             mapSvg.appendChild(nodeGroup);
        });

        this.mapArea.appendChild(mapSvg);
    }

     getNodeColor(type) {
         switch (type) {
             case 'combat': return '#c0392b'; // Red
             case 'elite': return '#8e44ad'; // Purple
             case 'event': return '#2980b9'; // Blue
             case 'rest': return '#27ae60'; // Green
             case 'shop': return '#f39c12'; // Orange
             case 'boss': return '#e74c3c'; // Darker Red
             case 'start': return '#bdc3c7'; // Grey
             default: return '#7f8c8d';
         }
     }

      getNodeIcon(type) {
          // Font Awesome unicode characters
          switch (type) {
              case 'combat': return '\uf118'; // fa-meh (placeholder for sword)
              case 'elite': return '\uf005'; // fa-star
              case 'event': return '\uf059'; // fa-question-circle
              case 'rest': return '\uf0f4'; // fa-coffee (placeholder for campfire)
              case 'shop': return '\uf07a'; // fa-shopping-cart
              case 'boss': return '\uf188'; // fa-skull (placeholder)
              case 'start': return '\uf007'; // fa-user
              default: return '?';
          }
      }

    updatePlayerMapInfo(player, floor) {
        if (!this.playerInfoMap) return;
        // Example: Show HP and current floor
        this.playerInfoMap.innerHTML = `
            <span>Floor: ${floor}</span>
            <span>Integrity: ${player.currentIntegrity} / ${player.maxIntegrity}</span>
            <span>Insight: ${player.insightThisRun} <i class='fas fa-brain insight-icon'></i></span>
            <span>Deck: ${player.deckManager.masterDeck.length}</span>
        `;
    }
*/
