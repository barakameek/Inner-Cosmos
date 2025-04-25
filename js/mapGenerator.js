// js/mapGenerator.js

/**
 * Represents a single node on the map.
 */
class MapNode {
    /**
     * @param {string} id - Unique ID for the node (e.g., 'L1N3').
     * @param {number} layer - The layer index (0-indexed, but displayed as 1-based).
     * @param {number} indexInLayer - The position/index within the layer.
     * @param {string} type - NodeType constant (e.g., NodeType.ENCOUNTER).
     * @param {number} x - X coordinate for rendering.
     * @param {number} y - Y coordinate for rendering.
     * @param {object} [data={}] - Additional data specific to the node type (e.g., { enemies: ['doubt_wraith'] } for ENCOUNTER).
     */
    constructor(id, layer, indexInLayer, type, x, y, data = {}) {
        this.id = id;
        this.layer = layer; // 0-indexed internal layer
        this.indexInLayer = indexInLayer;
        this.type = type;
        this.x = x; // Position for rendering
        this.y = y;
        this.data = data; // e.g., enemy IDs, event ID, shop inventory ID

        // State for rendering/interaction
        this.nextNodes = []; // Array of IDs of nodes reachable from this one
        this.prevNodes = []; // Array of IDs of nodes that can reach this one
        this.isVisible = false; // Is the node revealed to the player?
        this.isReachable = false; // Can the player move to this node currently?
        this.isCurrent = false; // Is the player currently on this node?
        this.isVisited = false; // Has the player already passed through this node?

        // --- Rendering properties (can be adjusted) ---
        this.radius = 20;
        this.hoverRadius = 25; // Radius when hovered
        this.isHovered = false;
    }

    // Simple collision check for clicking
    isPointInside(px, py) {
        const distSq = (px - this.x) ** 2 + (py - this.y) ** 2;
        const currentRadius = this.isHovered ? this.hoverRadius : this.radius;
        return distSq <= currentRadius ** 2;
    }

    render(ctx) {
        if (!this.isVisible) return;

        const currentRadius = this.isHovered ? this.hoverRadius : this.radius;
        const nodeColor = this.getNodeColor();
        const borderColor = this.isCurrent ? '#FFFF00' : (this.isReachable ? '#FFFFFF' : '#666666');
        const borderWidth = this.isCurrent ? 4 : (this.isReachable ? 2 : 1);

        // Draw the node circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.stroke();

        // Draw Icon/Text (simple placeholder for now)
        ctx.fillStyle = this.isVisited ? '#AAAAAA' : '#FFFFFF';
        ctx.font = `bold ${currentRadius * 0.8}px sans-serif`; // Adjust size based on radius
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.getNodeIcon(), this.x, this.y);

        // Optional: Draw ID for debugging
        // ctx.fillStyle = '#AAA';
        // ctx.font = '10px sans-serif';
        // ctx.fillText(this.id, this.x, this.y + currentRadius + 10);
    }

    getNodeColor() {
        if (this.isVisited) return '#444444';
        switch (this.type) {
            case NodeType.START: return '#FFFFFF';
            case NodeType.ENCOUNTER: return '#D9534F'; // Reddish
            case NodeType.ELITE_ENCOUNTER: return '#C9302C'; // Darker Red
            case NodeType.SHOP: return '#5CB85C'; // Greenish
            case NodeType.RESPITE: return '#428BCA'; // Blueish
            case NodeType.EVENT: return '#F0AD4E'; // Orangeish
            case NodeType.BOSS: return '#333333'; // Dark Grey/Black
            case NodeType.UNKNOWN: return '#777777';
            default: return '#AAAAAA';
        }
    }

     getNodeIcon() {
        switch (this.type) {
            case NodeType.START: return '🏁';
            case NodeType.ENCOUNTER: return '⚔️'; // Sword
            case NodeType.ELITE_ENCOUNTER: return '💀'; // Skull
            case NodeType.SHOP: return '💰'; // Money Bag
            case NodeType.RESPITE: return '🔥'; // Fire/Campfire
            case NodeType.EVENT: return '❓'; // Question Mark
            case NodeType.BOSS: return '👑'; // Crown / Boss icon
            case NodeType.UNKNOWN: return '?';
            default: return '•';
        }
    }
}

/**
 * Represents the entire map for a single run (across all layers).
 * Although generation happens layer by layer.
 */
class GameMap {
    constructor() {
        this.nodes = {}; // Store all nodes keyed by ID
        this.layers = []; // Array of arrays, each inner array holds node IDs for that layer
        this.connections = []; // Store connections { from: nodeId, to: nodeId } for rendering lines
    }

    addNode(node) {
        if (this.nodes[node.id]) {
            console.warn(`Node with ID ${node.id} already exists on map.`);
            return;
        }
        this.nodes[node.id] = node;
        while (this.layers.length <= node.layer) {
            this.layers.push([]);
        }
        this.layers[node.layer].push(node.id);
        // Sort nodes within layer by their indexInLayer for consistent rendering/logic
        this.layers[node.layer].sort((aId, bId) => this.nodes[aId].indexInLayer - this.nodes[bId].indexInLayer);
    }

    getNode(id) {
        return this.nodes[id];
    }

    addConnection(fromId, toId) {
        const fromNode = this.getNode(fromId);
        const toNode = this.getNode(toId);
        if (fromNode && toNode) {
            if (!fromNode.nextNodes.includes(toId)) fromNode.nextNodes.push(toId);
            if (!toNode.prevNodes.includes(fromId)) toNode.prevNodes.push(fromId);
            // Store connection for drawing lines
            this.connections.push({ from: fromId, to: toId });
        } else {
            console.warn(`Failed to add connection: Node ${fromId} or ${toId} not found.`);
        }
    }

    getStartingNode() {
        if (this.layers.length > 0 && this.layers[0].length > 0) {
            // Assuming the first layer always has the start node(s)
            // If multiple start nodes are possible, need logic to pick one
             return this.getNode(this.layers[0][0]); // Return the first node of the first layer
        }
        return null;
    }

    getNodesReachableFrom(nodeId) {
        const node = this.getNode(nodeId);
        if (!node) return [];
        return node.nextNodes.map(id => this.getNode(id)).filter(n => n !== null);
    }

    revealConnectedNodes(nodeId) {
         const node = this.getNode(nodeId);
         if (!node) return;

         node.nextNodes.forEach(nextId => {
             const nextNode = this.getNode(nextId);
             if (nextNode) {
                 nextNode.isVisible = true;
                 nextNode.isReachable = true; // Mark as reachable
             }
         });

          // Also make nodes reachable *from* the newly revealed nodes visible, but not reachable yet
          node.nextNodes.forEach(nextId => {
              const nextNode = this.getNode(nextId);
              if (nextNode) {
                   nextNode.nextNodes.forEach(farId => {
                       const farNode = this.getNode(farId);
                       if(farNode) farNode.isVisible = true;
                   });
              }
          });
    }

    getNodeAt(x, y) {
        // Check nodes in reverse order of layers (top layers first)
        // And reverse order within layer? Depends on overlap, but simple iteration is fine for now.
        for (let i = this.layers.length - 1; i >= 0; i--) {
             for (const nodeId of this.layers[i]) {
                  const node = this.getNode(nodeId);
                  if (node.isVisible && node.isPointInside(x, y)) {
                      return node;
                  }
             }
        }
        return null; // No node found at this point
    }

     updateHover(mouseX, mouseY) {
         let hoveredNode = null;
         // Reset hover state for all
         Object.values(this.nodes).forEach(node => node.isHovered = false);

         // Find the topmost node under the mouse
         const node = this.getNodeAt(mouseX, mouseY);
         if (node && node.isReachable) { // Only allow hover on reachable nodes? Or just visible? Let's try visible.
            if(node.isVisible) {
                 node.isHovered = true;
                 hoveredNode = node;
            }
         }
         return hoveredNode;
     }

    render(ctx) {
        // 1. Draw Connections (draw lines first, below nodes)
        ctx.strokeStyle = '#555'; // Color for connection lines
        ctx.lineWidth = 2;
        this.connections.forEach(conn => {
            const fromNode = this.getNode(conn.from);
            const toNode = this.getNode(conn.to);
            if (fromNode && toNode && (fromNode.isVisible || toNode.isVisible)) { // Only draw if at least one end is visible?
                // Dim lines if target isn't reachable or source is passed?
                 if (fromNode.isVisited && toNode.isVisited) ctx.strokeStyle = '#333';
                 else if(toNode.isVisible && !toNode.isReachable) ctx.strokeStyle = '#444';
                 else ctx.strokeStyle = '#666';

                ctx.beginPath();
                ctx.moveTo(fromNode.x, fromNode.y);
                ctx.lineTo(toNode.x, toNode.y);
                ctx.stroke();
            }
        });

        // 2. Draw Nodes (draw nodes on top of lines)
        // Iterate through layers and nodes within layers for consistent drawing order
        this.layers.forEach(layerNodes => {
            layerNodes.forEach(nodeId => {
                const node = this.getNode(nodeId);
                if (node) node.render(ctx);
            });
        });
    }
}


/**
 * Handles the generation of the map.
 */
class MapGenerator {
    constructor() {
        this.config = {
            paddingX: 100,          // Horizontal padding from canvas edge
            paddingY: 80,           // Vertical padding from canvas edge
            layerSpacingY: 110,     // Vertical distance between layers
            nodeSpacingX: 150,      // Horizontal distance between nodes in a layer
            maxNodesPerLayer: 7,    // Max nodes horizontally
            minNodesPerLayer: 4,    // Min nodes horizontally
            connectionProbability: 0.8, // Chance to connect to a node in the next layer
            crossConnectionProbability: 0.15, // Chance to connect diagonally
            forceConnectionToMiddle: true, // Ensure paths don't get stuck on edges
        };
    }

    /**
     * Generates a GameMap object for a specific layer.
     * @param {number} currentLayerIndex - The index of the layer to generate (1-based for logic here).
     * @param {MapNode | null} previousBossNode - The boss node from the previous layer (if any).
     * @returns {GameMap} The generated map object containing nodes and connections for this layer.
     */
    generateLayer(currentLayerIndex, previousBossNode = null) {
        const map = new GameMap();
        const layerIndex0 = currentLayerIndex - 1; // Use 0-based internally for arrays etc.
        const numLayersToGenerate = 1; // Currently generates one layer at a time, might expand later
        const nodeCount = getRandomInt(this.config.minNodesPerLayer, this.config.maxNodesPerLayer);
        const totalLayersInRun = MAX_LAYERS; // From constants.js

        const layerHeight = CANVAS_HEIGHT - 2 * this.config.paddingY;
        const nodesPerLayer = []; // Stores MapNode objects for each generated column/row

        // --- Generate Nodes ---
        for (let i = 0; i < numLayersToGenerate + 1; i++) { // Generate nodes for this layer + the next boss row
            const layerNodes = [];
            const y = this.config.paddingY + (i * this.config.layerSpacingY); // Calculate Y based on logical layer index
            const actualNodeCount = (i === numLayersToGenerate) ? 1 : nodeCount; // Boss layer has 1 node
            const layerWidth = CANVAS_WIDTH - 2 * this.config.paddingX;
            const startX = CANVAS_WIDTH / 2 - (actualNodeCount - 1) * this.config.nodeSpacingX / 2;

            for (let j = 0; j < actualNodeCount; j++) {
                const x = startX + j * this.config.nodeSpacingX;
                const nodeId = `L${currentLayerIndex}R${i}N${j}`; // Layer, Row in gen, Node index
                const nodeLayerIndex = layerIndex0; // All nodes belong to the current logical layer
                let nodeType;

                 // Determine node type based on row (within this generation pass)
                 if (i === numLayersToGenerate) { // This is the boss row
                    nodeType = NodeType.BOSS;
                 } else if (i === 0 && currentLayerIndex === 1) { // Very first row of the very first layer
                     nodeType = NodeType.START;
                 } else if (i === 0 && currentLayerIndex > 1) { // Subsequent layer starts (mimic previous boss type for connection?)
                     nodeType = NodeType.START; // Treat as a start for visibility/connection
                 }
                 else {
                    // Assign random types based on probabilities for intermediate rows
                    nodeType = this.getRandomNodeType(currentLayerIndex, i, j, totalLayersInRun);
                 }

                const node = new MapNode(nodeId, nodeLayerIndex, j, nodeType, x, y);

                 // Assign specific data like enemy IDs
                 if (node.type === NodeType.ENCOUNTER || node.type === NodeType.ELITE_ENCOUNTER || node.type === NodeType.BOSS) {
                     node.data.enemies = this.getEnemiesForNode(node.type, currentLayerIndex);
                 }
                 // Add event/shop data if needed

                layerNodes.push(node);
                map.addNode(node);
            }
            nodesPerLayer.push(layerNodes);
        }


        // --- Generate Connections ---
        // Connect nodes row by row
        for (let i = 0; i < numLayersToGenerate; i++) { // Iterate through rows (except the last/boss row)
            const currentRow = nodesPerLayer[i];
            const nextRow = nodesPerLayer[i+1];

            currentRow.forEach((currentNode, currentIndex) => {
                let connected = false;
                 // Try connecting forward, diagonally left, diagonally right
                 const potentialTargets = [];
                 // Directly ahead
                 if (nextRow[currentIndex]) potentialTargets.push(currentIndex);
                 // Diagonal left
                 if (nextRow[currentIndex - 1]) potentialTargets.push(currentIndex - 1);
                  // Diagonal right
                 if (nextRow[currentIndex + 1]) potentialTargets.push(currentIndex + 1);
                 // Center bias for edge nodes
                 if (this.config.forceConnectionToMiddle && nextRow.length > 1) {
                      const middleIndex = Math.floor(nextRow.length / 2);
                      if (currentIndex === 0 && !potentialTargets.includes(middleIndex) && nextRow[middleIndex]) potentialTargets.push(middleIndex);
                      if (currentIndex === currentRow.length - 1 && !potentialTargets.includes(middleIndex) && nextRow[middleIndex]) potentialTargets.push(middleIndex);
                 }


                 potentialTargets.forEach(targetIndex => {
                     const targetNode = nextRow[targetIndex];
                     const isDiagonal = targetIndex !== currentIndex;
                     const probability = isDiagonal ? this.config.crossConnectionProbability : this.config.connectionProbability;

                     if (Math.random() < probability) {
                         map.addConnection(currentNode.id, targetNode.id);
                         connected = true;
                     }
                 });

                 // Ensure every node has at least one forward connection if possible
                 if (!connected && potentialTargets.length > 0) {
                      // If no random connection made, force connect to one target (prefer straight)
                      let forcedTargetIndex = -1;
                      if (nextRow[currentIndex]) forcedTargetIndex = currentIndex; // Prefer straight
                      else if (potentialTargets.length > 0) forcedTargetIndex = potentialTargets[0]; // Fallback to first available

                      if(forcedTargetIndex !== -1) {
                          map.addConnection(currentNode.id, nextRow[forcedTargetIndex].id);
                      }
                 }
            });
        }

         // Clean up unconnected nodes in later rows (usually only boss if earlier rows failed)
         for (let i = 1; i < nodesPerLayer.length; i++) {
              nodesPerLayer[i].forEach(node => {
                  if (node.prevNodes.length === 0) {
                       console.warn(`Node ${node.id} (${node.type}) has no incoming connections. Removing.`);
                       // Need robust removal logic if this happens frequently
                       // For now, just log it. Could try forcing a connection from previous layer.
                  }
              });
         }

        // Special handling for start node(s)
        if (currentLayerIndex === 1) {
            // Mark the start node as visible and current
            const startNode = map.getStartingNode();
            if (startNode) {
                 startNode.isVisible = true;
                 startNode.isReachable = true; // Can't move *from* start, but it's the origin
                 map.revealConnectedNodes(startNode.id); // Reveal nodes reachable from start
            }
        } else if (previousBossNode) {
            // If it's layer 2+, connect the previous boss node to the start node(s) of this layer
            // This is tricky because the start nodes are *generated* here.
            // The GameManager should handle placing the player on the new layer's start node.
            // For now, just ensure the first node(s) are visible.
            nodesPerLayer[0].forEach(node => node.isVisible = true);
        }


        return map;
    }

    getRandomNodeType(layerIndex, rowIndex, nodeIndex, totalLayers) {
         // Define probabilities (adjust these based on desired game flow)
         const probs = {
             [NodeType.ENCOUNTER]: 0.60, // Most common
             [NodeType.EVENT]: 0.18,
             [NodeType.SHOP]: 0.10,
             [NodeType.RESPITE]: 0.12,
             [NodeType.ELITE_ENCOUNTER]: 0.0 // Base chance, increased later
         };

         // Increase Elite chance later in the layer/run?
         // Example: Higher chance in rows closer to the boss
         // const rowsUntilBoss = (this.config.numRowsPerLayer || 7) - rowIndex; // Need numRows config
         // probs[NodeType.ELITE_ENCOUNTER] = 0.05 + (1 / Math.max(1, rowsUntilBoss)) * 0.1; // Increases closer to end
         // Example: More Elites on later layers
         probs[NodeType.ELITE_ENCOUNTER] = 0.05 + (layerIndex / totalLayers) * 0.10; // Up to 15% on last layer

         // Ensure specific nodes aren't too frequent? (e.g., limit shops per layer)
         // Avoid Elites right after Respite? Complex rules can go here.

         // Normalize probabilities if needed (they slightly exceed 1.0 here)
         let totalProb = Object.values(probs).reduce((sum, p) => sum + p, 0);
         let cumulativeProb = 0;
         const rand = Math.random() * totalProb; // Roll based on total

         for (const [type, prob] of Object.entries(probs)) {
             cumulativeProb += prob;
             if (rand <= cumulativeProb) {
                 return type;
             }
         }

         return NodeType.ENCOUNTER; // Fallback if something goes wrong
    }

     getEnemiesForNode(nodeType, layerIndex) {
         let enemyPoolIds = [];
         let count = 1;

         if (nodeType === NodeType.ENCOUNTER) {
             enemyPoolIds = getEnemyIdsByCriteria({ layer: layerIndex, isElite: false, isBoss: false });
             count = getRandomInt(1, 2); // 1-2 normal enemies
         } else if (nodeType === NodeType.ELITE_ENCOUNTER) {
             enemyPoolIds = getEnemyIdsByCriteria({ layer: layerIndex, isElite: true, isBoss: false });
              // Elites are usually single encounters, but could be pairs later
              count = 1;
         } else if (nodeType === NodeType.BOSS) {
              enemyPoolIds = getEnemyIdsByCriteria({ layer: layerIndex, isBoss: true });
              count = 1; // Bosses are single
         }

         if (enemyPoolIds.length === 0) {
              console.error(`No enemies found for NodeType ${nodeType} on Layer ${layerIndex}! Falling back to Doubt Wraith.`);
              return ['doubt_wraith']; // Fallback
         }

         shuffleArray(enemyPoolIds);
         // Ensure count doesn't exceed available unique enemies
         count = Math.min(count, enemyPoolIds.length);

         return enemyPoolIds.slice(0, count);
     }
}
