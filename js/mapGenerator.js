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
        const currentRadius = this.isHovered && this.isReachable ? this.hoverRadius : this.radius; // Only increase size if reachable hover
        return distSq <= currentRadius ** 2;
    }

    render(ctx) {
        if (!this.isVisible) return;

        const currentRadius = this.isHovered && this.isReachable ? this.hoverRadius : this.radius;
        const nodeColor = this.getNodeColor();
        const borderColor = this.isCurrent ? '#FFFF00' : (this.isReachable ? '#FFFFFF' : '#666666');
        const borderWidth = this.isCurrent ? 4 : (this.isReachable ? 2 : 1);

        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.stroke();

        ctx.fillStyle = this.isVisited ? '#AAAAAA' : (this.isCurrent || this.isReachable) ? '#FFFFFF' : '#DDDDDD';
        ctx.font = `bold ${Math.floor(currentRadius * 0.8)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.getNodeIcon(), this.x, this.y);
    }

    getNodeColor() {
        if (this.isVisited && !this.isCurrent) return '#444444';
        switch (this.type) {
            case NodeType.START: return '#FFFFFF'; case NodeType.ENCOUNTER: return '#D9534F';
            case NodeType.ELITE_ENCOUNTER: return '#C9302C'; case NodeType.SHOP: return '#5CB85C';
            case NodeType.RESPITE: return '#428BCA'; case NodeType.EVENT: return '#F0AD4E';
            case NodeType.BOSS: return '#333333'; case NodeType.UNKNOWN: return '#777777';
            default: return '#AAAAAA';
        }
    }

     getNodeIcon() {
        switch (this.type) {
            case NodeType.START: return '🏁'; case NodeType.ENCOUNTER: return '⚔️';
            case NodeType.ELITE_ENCOUNTER: return '💀'; case NodeType.SHOP: return '💰';
            case NodeType.RESPITE: return '🔥'; case NodeType.EVENT: return '❓';
            case NodeType.BOSS: return '👑'; case NodeType.UNKNOWN: return '?';
            default: return '•';
        }
    }
}

/**
 * Represents the entire map structure for a single run.
 */
class GameMap {
    constructor() {
        this.nodes = {}; // Stores all MapNode objects keyed by ID
        this.layers = []; // Array of arrays (indexed by logical layer index), each inner array holds node IDs
        this.connections = []; // Store connections { from: nodeId, to: nodeId } for rendering lines
        this.nodeRows = []; // Stores nodes organized by visual row during generation (array of arrays of MapNode objects)
    }

    addNode(node) {
        // --- Safety Check ---
        if (!node || typeof node.layer !== 'number' || node.layer < 0) {
             console.error("Invalid node or node.layer passed to addNode:", node);
             return; // Prevent errors
        }
        // --- End Safety Check ---

        if (this.nodes[node.id]) { return; } // Node already exists

        this.nodes[node.id] = node;

        // Ensure the layers array is long enough
        while (this.layers.length <= node.layer) {
            this.layers.push([]); // Add a new empty array for the layer if needed
        }

        // --- Critical Check & Fix ---
        // Ensure the specific layer array actually exists before trying to push
        if (typeof this.layers[node.layer] === 'undefined') {
            console.error(`CRITICAL ERROR in addNode: this.layers[${node.layer}] is undefined AFTER while loop! Forcing creation.`);
            this.layers[node.layer] = []; // Create it explicitly if loop failed somehow
        }
        // --- End Critical Check ---

        // Add node ID to the correct logical layer array if not already present
        if (!this.layers[node.layer].includes(node.id)) {
             this.layers[node.layer].push(node.id);
             // Sort nodes within the logical layer by their horizontal index
             this.layers[node.layer].sort((aId, bId) => {
                  const nodeA = this.nodes[aId];
                  const nodeB = this.nodes[bId];
                  // Add checks for missing nodes during sort
                  if (!nodeA || nodeA.indexInLayer === undefined) { console.error(`Node A missing/invalid for sorting: ${aId}`); return 0; }
                  if (!nodeB || nodeB.indexInLayer === undefined) { console.error(`Node B missing/invalid for sorting: ${bId}`); return 0; }
                  return nodeA.indexInLayer - nodeB.indexInLayer;
             });
        }
    }


    getNode(id) { return this.nodes[id]; }

    addConnection(fromId, toId) {
        const fromNode = this.getNode(fromId);
        const toNode = this.getNode(toId);
        if (fromNode && toNode) {
            if (!fromNode.nextNodes.includes(toId)) fromNode.nextNodes.push(toId);
            if (!toNode.prevNodes.includes(fromId)) toNode.prevNodes.push(fromId);
            if (!this.connections.some(c => c.from === fromId && c.to === toId)) {
                 this.connections.push({ from: fromId, to: toId });
            }
        } else { console.warn(`Failed connection: Node ${fromId} or ${toId} not found.`); }
    }

    getStartingNode() {
         if (this.nodeRows.length > 0 && this.nodeRows[0].length > 0) { return this.nodeRows[0][0]; }
         if (this.layers.length > 0 && this.layers[0].length > 0) { console.warn("Get start node fallback: using logical layer 0."); return this.getNode(this.layers[0][0]); }
        return null;
    }

    getNodesReachableFrom(nodeId) {
        const node = this.getNode(nodeId); if (!node) return [];
        return node.nextNodes.map(id => this.getNode(id)).filter(n => n !== null);
    }

    revealConnectedNodes(nodeId) {
         const node = this.getNode(nodeId); if (!node) return;
         node.nextNodes.forEach(nextId => {
             const nextNode = this.getNode(nextId);
             if (nextNode) { nextNode.isVisible = true; nextNode.isReachable = true; }
         });
    }

    getNodeAt(x, y) {
         let candidateNodes = Object.values(this.nodes).filter(node => node.isVisible && node.isPointInside(x, y));
         if (candidateNodes.length === 0) return null;
         if (candidateNodes.length === 1) return candidateNodes[0];
         candidateNodes.sort((a, b) => a.y - b.y); // Sort by Y ascending (topmost first)
         return candidateNodes[0];
    }

     updateHover(mouseX, mouseY) {
         let hoveredNode = null;
         Object.values(this.nodes).forEach(node => node.isHovered = false);
         const nodeAtMouse = this.getNodeAt(mouseX, mouseY);
         // Allow hover only if node is visible AND reachable (prevents hovering over completed/future nodes)
         if (nodeAtMouse && nodeAtMouse.isVisible && nodeAtMouse.isReachable) {
            nodeAtMouse.isHovered = true;
            hoveredNode = nodeAtMouse;
         }
         // Store reference to the hovered node on the map object itself
         this.hoveredNode = hoveredNode;
         return hoveredNode; // Also return for direct use if needed
     }

    render(ctx) {
        // Draw Connections
        ctx.lineWidth = 2;
        this.connections.forEach(conn => {
            const fromNode = this.getNode(conn.from); const toNode = this.getNode(conn.to);
            if (fromNode && toNode && fromNode.isVisible && toNode.isVisible) {
                 if (fromNode.isVisited && toNode.isVisited) ctx.strokeStyle = '#333';
                 else if (toNode.isReachable && !toNode.isVisited) ctx.strokeStyle = '#AAA';
                 else ctx.strokeStyle = '#555';
                ctx.beginPath(); ctx.moveTo(fromNode.x, fromNode.y); ctx.lineTo(toNode.x, toNode.y); ctx.stroke();
            }
        });
        // Draw Nodes (using visual row order)
        this.nodeRows.forEach(rowNodes => {
            rowNodes.forEach(node => { if (node) node.render(ctx); });
        });
    }
}


/**
 * Handles the generation of the map layers.
 */
class MapGenerator {
    constructor() {
        this.config = {
            paddingX: 150, paddingY: 100, numRows: 7, nodesPerRowVariance: 2, baseNodesPerRow: 5,
            connectionDensity: 0.6, crossConnectionDensity: 0.2, forceConnections: 1, bossRowYOffset: 100,
        };
    }

    generateLayer(logicalLayerIndex, gameManager) {
        console.log(`Generating map for Layer ${logicalLayerIndex + 1}...`);
        const map = new GameMap(); // Create new map object for this layer
        const numRows = this.config.numRows; const totalLayersInRun = MAX_LAYERS;
        const availableHeight = CANVAS_HEIGHT - 2 * this.config.paddingY - this.config.bossRowYOffset;
        const rowSpacingY = availableHeight / numRows;
        const availableWidth = CANVAS_WIDTH - 2 * this.config.paddingX;
        let previousRowNodes = [];

        for (let i = 0; i <= numRows + 1; i++) {
            const currentRowNodes = []; let nodeCountThisRow; let nodeTypeForRow; let rowIdentifier = i;
            let y = this.config.paddingY + i * rowSpacingY;

            if (i === 0) { nodeCountThisRow = 1; nodeTypeForRow = NodeType.START; }
            else if (i === numRows + 1) {
                nodeCountThisRow = 1; nodeTypeForRow = NodeType.BOSS;
                const lastRegularY = this.config.paddingY + numRows * rowSpacingY;
                y = lastRegularY + this.config.bossRowYOffset;
            } else {
                nodeCountThisRow = this.config.baseNodesPerRow + getRandomInt(-this.config.nodesPerRowVariance, this.config.nodesPerRowVariance);
                nodeCountThisRow = Math.max(1, nodeCountThisRow); nodeTypeForRow = null;
            }

            const nodeSpacingX = availableWidth / Math.max(1, this.config.baseNodesPerRow + this.config.nodesPerRowVariance -1);
            const startX = CANVAS_WIDTH / 2 - (nodeCountThisRow - 1) * nodeSpacingX / 2;

            for (let j = 0; j < nodeCountThisRow; j++) {
                const x = startX + j * nodeSpacingX; const nodeId = `L${logicalLayerIndex}R${rowIdentifier}N${j}`;
                let nodeType = nodeTypeForRow;
                if (nodeType === null) { nodeType = this.getRandomNodeType(logicalLayerIndex, i, j, totalLayersInRun, numRows); }
                const node = new MapNode(nodeId, logicalLayerIndex, j, nodeType, x, y);
                if (node.type === NodeType.ENCOUNTER || node.type === NodeType.ELITE_ENCOUNTER || node.type === NodeType.BOSS) {
                    node.data.enemies = this.getEnemiesForNode(node.type, logicalLayerIndex + 1); }
                currentRowNodes.push(node);
                map.addNode(node); // Add to main dictionary and logical layer list
            }
            map.nodeRows.push(currentRowNodes); // Store visual row structure

            if (i > 0 && previousRowNodes.length > 0) { this.connectRows(map, previousRowNodes, currentRowNodes); }
            previousRowNodes = currentRowNodes;
        }

        const startNode = map.getStartingNode();
        if (startNode) { startNode.isVisible = true; startNode.isReachable = true; map.revealConnectedNodes(startNode.id);
        } else { console.error("Map generation failed to produce a start node!"); }

        console.log(`Generated map with ${Object.keys(map.nodes).length} nodes and ${map.connections.length} connections.`);
        return map;
    }

    connectRows(map, previousRow, currentRow) {
         previousRow.forEach((prevNode, prevIndex) => {
            let connectionsMade = 0; const potentialTargets = [];
            if (currentRow[prevIndex]) potentialTargets.push(currentRow[prevIndex]);
            if (currentRow[prevIndex - 1]) potentialTargets.push(currentRow[prevIndex - 1]);
            if (currentRow[prevIndex + 1]) potentialTargets.push(currentRow[prevIndex + 1]);

            potentialTargets.forEach(targetNode => {
                 const isDiagonal = targetNode.indexInLayer !== prevNode.indexInLayer;
                 const probability = isDiagonal ? this.config.crossConnectionDensity : this.config.connectionDensity;
                 if (Math.random() < probability) { map.addConnection(prevNode.id, targetNode.id); connectionsMade++; } });
             if (connectionsMade < this.config.forceConnections && potentialTargets.length > 0) {
                  shuffleArray(potentialTargets);
                  for (let k = 0; k < Math.min(this.config.forceConnections - connectionsMade, potentialTargets.length); k++) {
                       if (!prevNode.nextNodes.includes(potentialTargets[k].id)) { map.addConnection(prevNode.id, potentialTargets[k].id); } } } });
    }

    getRandomNodeType(layerIndex, rowIndex, nodeIndex, totalLayers, numRows) {
         const weights = { [NodeType.ENCOUNTER]: 60, [NodeType.EVENT]: 18, [NodeType.SHOP]: 10, [NodeType.RESPITE]: 12, [NodeType.ELITE_ENCOUNTER]: 5 };
         const progressThroughLayer = rowIndex / numRows;
         weights[NodeType.ELITE_ENCOUNTER] += Math.floor(progressThroughLayer * 15);
         weights[NodeType.ELITE_ENCOUNTER] += Math.floor((layerIndex / totalLayers) * 10);
         const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
         let randomRoll = Math.random() * totalWeight;
         for (const [type, weight] of Object.entries(weights)) { if (randomRoll < weight) { return type; } randomRoll -= weight; }
         return NodeType.ENCOUNTER; // Fallback
    }

     getEnemiesForNode(nodeType, layerIndex) { // Layer is 1-based here
         let enemyPoolIds = []; let count = 1;
         if (nodeType === NodeType.ENCOUNTER) { enemyPoolIds = getEnemyIdsByCriteria({ layer: layerIndex, isElite: false, isBoss: false }); count = (layerIndex === 1) ? getRandomInt(1, 2) : getRandomInt(2, 2); }
         else if (nodeType === NodeType.ELITE_ENCOUNTER) { enemyPoolIds = getEnemyIdsByCriteria({ layer: layerIndex, isElite: true, isBoss: false }); count = 1; }
         else if (nodeType === NodeType.BOSS) { enemyPoolIds = getEnemyIdsByCriteria({ layer: layerIndex, isBoss: true }); count = 1; }
         if (enemyPoolIds.length === 0) { console.error(`No enemies found for NodeType ${nodeType} on Layer ${layerIndex}! Fallback: Doubt Wraith.`); return ['doubt_wraith']; }
         shuffleArray(enemyPoolIds); count = Math.min(count, enemyPoolIds.length); return enemyPoolIds.slice(0, count);
     }
}
