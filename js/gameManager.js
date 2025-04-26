// js/mapGenerator.js

/**
 * Represents a single node on the map.
 */
class MapNode {
    /**
     * @param {string} id - Unique ID for the node (e.g., 'L1R2N3').
     * @param {number} layer - The logical layer index (0-indexed, but displayed as 1-based).
     * @param {number} indexInLayer - The horizontal position/index within the layer (visual column).
     * @param {string} type - NodeType constant (e.g., NodeType.ENCOUNTER).
     * @param {number} x - X coordinate for rendering center.
     * @param {number} y - Y coordinate for rendering center.
     * @param {object} [data={}] - Additional data specific to the node type (e.g., { enemies: ['doubt_wraith'] } for ENCOUNTER).
     */
    constructor(id, layer, indexInLayer, type, x, y, data = {}) {
        this.id = id;
        this.layer = layer; // 0-indexed internal layer
        this.indexInLayer = indexInLayer; // Horizontal position index
        this.type = type;
        this.x = x; // Position for rendering
        this.y = y;
        this.data = data; // e.g., enemy IDs, event ID, shop inventory ID

        // State for pathfinding/rendering/interaction
        this.nextNodes = []; // Array of IDs of nodes reachable from this one
        this.prevNodes = []; // Array of IDs of nodes that can reach this one
        this.isVisible = false; // Is the node revealed to the player?
        this.isReachable = false; // Can the player move to this node currently? (Used for visual cues/interaction blocking)
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

        const currentRadius = this.isHovered && this.isReachable ? this.hoverRadius : this.radius;
        const nodeColor = this.getNodeColor();
        // Border highlights current node or reachable nodes
        const borderColor = this.isCurrent ? '#FFFF00' : (this.isReachable ? '#FFFFFF' : '#666666');
        const borderWidth = this.isCurrent ? 4 : (this.isReachable ? 2 : 1);

        // Draw the node circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();

        // Draw border only if reachable or current? Or always? Always for now.
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.stroke();

        // Draw Icon/Text (simple placeholder for now)
        // Icon color dimmed if visited, bright if current/reachable, normal otherwise
        ctx.fillStyle = this.isVisited ? '#AAAAAA' : (this.isCurrent || this.isReachable) ? '#FFFFFF' : '#DDDDDD';
        ctx.font = `bold ${Math.floor(currentRadius * 0.8)}px sans-serif`; // Adjust size based on radius
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.getNodeIcon(), this.x, this.y);

        // Optional: Draw ID for debugging
        // ctx.fillStyle = '#AAA';
        // ctx.font = '10px sans-serif';
        // ctx.fillText(this.id, this.x, this.y + currentRadius + 10);
    }

    getNodeColor() {
        // Use dimmer color if visited but not current
        if (this.isVisited && !this.isCurrent) return '#444444';
        // Brighter color if reachable but not visited? Or just use border? Use border.
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
 * Represents the entire map structure for a single run.
 * Managed by the MapGenerator.
 */
class GameMap {
    constructor() {
        this.nodes = {}; // Stores all MapNode objects keyed by ID
        this.layers = []; // Array of arrays, each inner array holds node IDs for that logical layer
        this.connections = []; // Store connections { from: nodeId, to: nodeId } for rendering lines
        this.nodeRows = []; // Stores nodes organized by visual row during generation (transient)
    }

    addNode(node) {
        if (this.nodes[node.id]) {
            console.warn(`Node with ID ${node.id} already exists on map.`);
            return;
        }
        this.nodes[node.id] = node;
        // Ensure layer array exists
        while (this.layers.length <= node.layer) {
            this.layers.push([]);
        }
        // Add to the correct logical layer based on node.layer property
        if (!this.layers[node.layer].includes(node.id)) {
             this.layers[node.layer].push(node.id);
             // Sort nodes within the logical layer by their horizontal index for consistency
             this.layers[node.layer].sort((aId, bId) => this.nodes[aId].indexInLayer - this.nodes[bId].indexInLayer);
        }
    }

    getNode(id) {
        return this.nodes[id];
    }

    /** Adds a connection between two nodes and updates their internal lists. */
    addConnection(fromId, toId) {
        const fromNode = this.getNode(fromId);
        const toNode = this.getNode(toId);
        if (fromNode && toNode) {
            // Prevent duplicate connections in node lists and connections array
            if (!fromNode.nextNodes.includes(toId)) fromNode.nextNodes.push(toId);
            if (!toNode.prevNodes.includes(fromId)) toNode.prevNodes.push(fromId);
            if (!this.connections.some(c => c.from === fromId && c.to === toId)) {
                 this.connections.push({ from: fromId, to: toId });
            }
        } else {
            console.warn(`Failed to add connection: Node ${fromId} or ${toId} not found.`);
        }
    }

    getStartingNode() {
        // The starting node is the first node added in the first visual row during generation.
         if (this.nodeRows.length > 0 && this.nodeRows[0].length > 0) {
             return this.nodeRows[0][0]; // Return the first node of the first generated row
         }
         // Fallback: Check logical layer 0 if nodeRows isn't populated correctly
         if (this.layers.length > 0 && this.layers[0].length > 0) {
             console.warn("Getting start node from logical layer 0, nodeRows might be empty.");
             return this.getNode(this.layers[0][0]);
         }
        return null;
    }

    /** Returns an array of MapNode objects reachable from the given node ID. */
    getNodesReachableFrom(nodeId) {
        const node = this.getNode(nodeId);
        if (!node) return [];
        return node.nextNodes.map(id => this.getNode(id)).filter(n => n !== null);
    }

    /** Reveals nodes connected *to* the given node ID and marks them as reachable. */
    revealConnectedNodes(nodeId) {
         const node = this.getNode(nodeId);
         if (!node) return;

         // Mark all nodes connected FROM this node as visible and reachable
         node.nextNodes.forEach(nextId => {
             const nextNode = this.getNode(nextId);
             if (nextNode) {
                 nextNode.isVisible = true;
                 nextNode.isReachable = true; // Mark as reachable for interaction
             }
         });

          // Optional: Make nodes connected FROM the *newly reachable* nodes also visible,
          // but not necessarily reachable yet, to show the path ahead.
          // node.nextNodes.forEach(nextId => {
          //     const nextNode = this.getNode(nextId);
          //     if (nextNode) {
          //          nextNode.nextNodes.forEach(farId => {
          //              const farNode = this.getNode(farId);
          //              if(farNode) farNode.isVisible = true;
          //          });
          //     }
          // });
    }

    /** Finds the topmost visible node at the given coordinates. */
    getNodeAt(x, y) {
        let foundNode = null;
        // Check nodes layer by layer, from top to bottom visually (which might be reverse layer index if needed)
        // Using the nodeRows structure from generation ensures visual top-to-bottom check
        for (let i = this.nodeRows.length - 1; i >= 0; i--) {
             for (const node of this.nodeRows[i]) { // Iterate through MapNode objects directly
                  if (node.isVisible && node.isPointInside(x, y)) {
                      // Found a node, store it and continue checking layers above (lower index i)
                      // This ensures we get the one visually on top if they overlap
                      foundNode = node;
                      // We can break inner loop once found in a row, but need to check rows above it
                      // break; // Removed break to check all nodes in the row potentially
                  }
             }
             // If found in this row, no need to check rows below it (higher index i)
             // But strict top-most requires checking all potentially overlapping nodes
        }
         // Refined approach: iterate all visible nodes and find the one with highest Y that contains the point?
         let candidateNodes = Object.values(this.nodes).filter(node => node.isVisible && node.isPointInside(x, y));
         if (candidateNodes.length === 0) return null;
         if (candidateNodes.length === 1) return candidateNodes[0];
         // If multiple overlap, return the one with the highest Y coordinate (visually top-most)
         candidateNodes.sort((a, b) => a.y - b.y); // Sort by Y ascending (topmost has smaller Y)
         return candidateNodes[0];


        // return foundNode; // Return the last node found (visually topmost)
    }

     /** Updates the hover state of nodes based on mouse position. Returns the hovered node, if any. */
     updateHover(mouseX, mouseY) {
         let hoveredNode = null;
         // Reset hover state for all nodes first
         Object.values(this.nodes).forEach(node => node.isHovered = false);

         // Find the node under the mouse
         const nodeAtMouse = this.getNodeAt(mouseX, mouseY);

         // Set hover state only if the node is visible and reachable
         if (nodeAtMouse && nodeAtMouse.isVisible && nodeAtMouse.isReachable) {
            nodeAtMouse.isHovered = true;
            hoveredNode = nodeAtMouse;
         }
         return hoveredNode;
     }

    render(ctx) {
        // 1. Draw Connections
        ctx.lineWidth = 2;
        this.connections.forEach(conn => {
            const fromNode = this.getNode(conn.from);
            const toNode = this.getNode(conn.to);
            // Only draw if both nodes exist and are visible
            if (fromNode && toNode && fromNode.isVisible && toNode.isVisible) {
                // Dim lines based on visited/reachable status
                 if (fromNode.isVisited && toNode.isVisited) ctx.strokeStyle = '#333'; // Both visited
                 else if (toNode.isReachable && !toNode.isVisited) ctx.strokeStyle = '#AAA'; // Reachable path
                 else ctx.strokeStyle = '#555'; // Default visible connection

                ctx.beginPath();
                ctx.moveTo(fromNode.x, fromNode.y);
                ctx.lineTo(toNode.x, toNode.y);
                ctx.stroke();
            }
        });

        // 2. Draw Nodes
        // Iterate through layers/rows stored during generation for consistent draw order
        this.nodeRows.forEach(rowNodes => {
            rowNodes.forEach(node => { // Iterate through MapNode objects
                if (node) node.render(ctx);
            });
        });
    }
}


/**
 * Handles the generation of the map layers.
 */
class MapGenerator {
    constructor() {
        this.config = {
            paddingX: 150,          // Horizontal padding from canvas edge
            paddingY: 100,          // Vertical padding from canvas edge (top and bottom)
            numRows: 7,             // Number of potential node rows between start and boss
            nodesPerRowVariance: 2, // +/- variance in nodes per row
            baseNodesPerRow: 5,     // Average nodes per row
            connectionDensity: 0.6, // Chance to connect nodes directly ahead (reduced from 0.8)
            crossConnectionDensity: 0.2, // Chance for diagonal connections (increased from 0.15)
            forceConnections: 1,    // Ensure at least this many connections forward if random fails
            bossRowYOffset: 100,    // Extra space before boss row
        };
    }

    /**
     * Generates a GameMap object representing one layer of the run.
     * @param {number} logicalLayerIndex - The logical layer index (0-based).
     * @param {GameManager} gameManager - Reference to game manager for context.
     * @returns {GameMap} The generated map object for this layer.
     */
    generateLayer(logicalLayerIndex, gameManager) {
        console.log(`Generating map for Layer ${logicalLayerIndex + 1}...`);
        const map = new GameMap();
        const numRows = this.config.numRows; // Visual rows of nodes
        const totalLayersInRun = MAX_LAYERS; // From constants.js

        const availableHeight = CANVAS_HEIGHT - 2 * this.config.paddingY - this.config.bossRowYOffset;
        const rowSpacingY = availableHeight / numRows;
        const availableWidth = CANVAS_WIDTH - 2 * this.config.paddingX;

        let previousRowNodes = []; // Keep track of the nodes in the row above

        // --- Generate Nodes Row by Row ---
        for (let i = 0; i <= numRows + 1; i++) { // Include start (implicit row -1), main rows, and boss row (+1)
            const currentRowNodes = [];
            const y = this.config.paddingY + i * rowSpacingY;
            let nodeCountThisRow;
            let nodeTypeForRow;
            let rowIdentifier = i; // Use row index for node ID

            // --- Determine Row Type and Node Count ---
            if (i === 0) { // START row
                nodeCountThisRow = 1;
                nodeTypeForRow = NodeType.START;
            } else if (i === numRows + 1) { // BOSS row
                nodeCountThisRow = 1;
                nodeTypeForRow = NodeType.BOSS;
                // Adjust Y position for boss row spacing
                // y = this.config.paddingY + numRows * rowSpacingY + this.config.bossRowYOffset;
                 // Correct Y calculation needs careful thought based on previous row
                 const lastRegularY = this.config.paddingY + numRows * rowSpacingY;
                 y = lastRegularY + this.config.bossRowYOffset; // Add offset to last regular row's Y

            } else { // Intermediate rows
                nodeCountThisRow = this.config.baseNodesPerRow + getRandomInt(-this.config.nodesPerRowVariance, this.config.nodesPerRowVariance);
                nodeCountThisRow = Math.max(1, nodeCountThisRow); // Ensure at least 1 node
                nodeTypeForRow = null; // Type determined per node
            }

            const totalRowWidth = (nodeCountThisRow - 1) * (availableWidth / Math.max(1, nodeCountThisRow -1)); // Calculate node spacing dynamically? Risky.
            // Use fixed max node count for spacing calculation for stability
             const nodeSpacingX = availableWidth / Math.max(1, this.config.baseNodesPerRow + this.config.nodesPerRowVariance -1);
             const startX = CANVAS_WIDTH / 2 - (nodeCountThisRow - 1) * nodeSpacingX / 2;

            // --- Create Nodes for the Row ---
            for (let j = 0; j < nodeCountThisRow; j++) {
                const x = startX + j * nodeSpacingX;
                const nodeId = `L${logicalLayerIndex}R${rowIdentifier}N${j}`; // Layer, Row, Node index
                let nodeType = nodeTypeForRow; // Use row type or determine randomly

                if (nodeType === null) { // Assign random type for intermediate rows
                    nodeType = this.getRandomNodeType(logicalLayerIndex, i, j, totalLayersInRun, numRows);
                }

                const node = new MapNode(nodeId, logicalLayerIndex, j, nodeType, x, y);

                 // Assign specific data like enemy IDs
                 if (node.type === NodeType.ENCOUNTER || node.type === NodeType.ELITE_ENCOUNTER || node.type === NodeType.BOSS) {
                     node.data.enemies = this.getEnemiesForNode(node.type, logicalLayerIndex + 1); // Pass 1-based layer
                 }
                 // Add event/shop data later

                currentRowNodes.push(node);
                map.addNode(node); // Add to the main nodes dictionary and logical layer array
            }
            map.nodeRows.push(currentRowNodes); // Store visual row structure


            // --- Connect to Previous Row ---
            if (i > 0 && previousRowNodes.length > 0) {
                 this.connectRows(map, previousRowNodes, currentRowNodes);
            }

            previousRowNodes = currentRowNodes; // Update for next iteration
        }

        // --- Post-Generation Cleanup ---
        // Optional: Remove dead ends (nodes with no forward connections, except boss)
        // Optional: Ensure boss node is reachable


        // --- Set Initial Visibility ---
        const startNode = map.getStartingNode();
        if (startNode) {
            startNode.isVisible = true;
            startNode.isReachable = true; // Can't move *to* start, but it's the origin state
             map.revealConnectedNodes(startNode.id); // Reveal nodes reachable from start
        } else {
             console.error("Map generation failed to produce a start node!");
        }

        console.log(`Generated map with ${Object.keys(map.nodes).length} nodes and ${map.connections.length} connections.`);
        return map;
    }

    /** Connects nodes between two adjacent rows based on configured probabilities. */
    connectRows(map, previousRow, currentRow) {
         previousRow.forEach((prevNode, prevIndex) => {
            let connectionsMade = 0;
             // Potential targets: straight, diagonal left, diagonal right
             const potentialTargets = [];
             if (currentRow[prevIndex]) potentialTargets.push(currentRow[prevIndex]);         // Straight
             if (currentRow[prevIndex - 1]) potentialTargets.push(currentRow[prevIndex - 1]); // Left
             if (currentRow[prevIndex + 1]) potentialTargets.push(currentRow[prevIndex + 1]); // Right

             // Try connecting to each potential target randomly
             potentialTargets.forEach(targetNode => {
                  const isDiagonal = targetNode.indexInLayer !== prevNode.indexInLayer;
                  const probability = isDiagonal ? this.config.crossConnectionDensity : this.config.connectionDensity;
                  if (Math.random() < probability) {
                      map.addConnection(prevNode.id, targetNode.id);
                      connectionsMade++;
                  }
             });

              // Force connections if none made randomly and required
              if (connectionsMade < this.config.forceConnections && potentialTargets.length > 0) {
                   // Shuffle potential targets to avoid bias if forcing more than 1
                   shuffleArray(potentialTargets);
                   for (let k = 0; k < Math.min(this.config.forceConnections - connectionsMade, potentialTargets.length); k++) {
                        // Check if already connected before forcing again
                        if (!prevNode.nextNodes.includes(potentialTargets[k].id)) {
                             map.addConnection(prevNode.id, potentialTargets[k].id);
                        }
                   }
              }
         });
    }


    getRandomNodeType(layerIndex, rowIndex, nodeIndex, totalLayers, numRows) {
         // Define probabilities (adjust these based on desired game flow)
         // These represent the chance *after* filtering out impossible types (e.g., no boss mid-layer)
         const weights = {
             [NodeType.ENCOUNTER]: 60, // Higher weight = more common
             [NodeType.EVENT]: 18,
             [NodeType.SHOP]: 10,
             [NodeType.RESPITE]: 12,
             [NodeType.ELITE_ENCOUNTER]: 5 // Base weight, increased later
         };

         // --- Adjust Weights Based on Context ---
         // Increase Elite chance closer to the boss row
         const progressThroughLayer = rowIndex / numRows; // 0.0 to 1.0
         weights[NodeType.ELITE_ENCOUNTER] += Math.floor(progressThroughLayer * 15); // Add up to 15 weight

         // Increase Elite chance on later layers
         weights[NodeType.ELITE_ENCOUNTER] += Math.floor((layerIndex / totalLayers) * 10); // Add up to 10 weight for layer

         // Ensure shops/respites aren't too clustered? (Could track recent types)
         // Example: Decrease shop weight if previous node was a shop? Needs state tracking.

         // --- Select Type Based on Weights ---
         const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
         let randomRoll = Math.random() * totalWeight;

         for (const [type, weight] of Object.entries(weights)) {
             if (randomRoll < weight) {
                 return type;
             }
             randomRoll -= weight;
         }

         return NodeType.ENCOUNTER; // Fallback if something goes wrong
    }

     getEnemiesForNode(nodeType, layerIndex) { // Layer is 1-based here
         let enemyPoolIds = [];
         let count = 1;

         if (nodeType === NodeType.ENCOUNTER) {
             enemyPoolIds = getEnemyIdsByCriteria({ layer: layerIndex, isElite: false, isBoss: false });
             // Make encounters slightly harder on later layers?
             count = (layerIndex === 1) ? getRandomInt(1, 2) : getRandomInt(2, 2); // L1: 1-2 enemies, L2+: 2 enemies?
         } else if (nodeType === NodeType.ELITE_ENCOUNTER) {
             enemyPoolIds = getEnemyIdsByCriteria({ layer: layerIndex, isElite: true, isBoss: false });
              // Elites are usually single encounters
              count = 1;
         } else if (nodeType === NodeType.BOSS) {
              // Get boss for the specific layer
              enemyPoolIds = getEnemyIdsByCriteria({ layer: layerIndex, isBoss: true });
              // Filter further if multiple bosses exist per layer?
              // Example: layer1BossId = 'guardian_boundaries'; layer2BossId = 'ego_construct'; etc.
              // enemyPoolIds = enemyPoolIds.filter(id => id === `layer${layerIndex}_boss`);
              count = 1; // Bosses are single
         }

         if (enemyPoolIds.length === 0) {
              console.error(`No enemies found for NodeType ${nodeType} on Layer ${layerIndex}! Falling back to Doubt Wraith.`);
              return ['doubt_wraith']; // Fallback
         }

         shuffleArray(enemyPoolIds);
         // Ensure count doesn't exceed available unique enemies in the filtered pool
         count = Math.min(count, enemyPoolIds.length);

         return enemyPoolIds.slice(0, count);
     }
}
