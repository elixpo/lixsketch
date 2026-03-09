/* eslint-disable */
/**
 * AIRenderer - Converts diagram JSON into shapes on the canvas.
 *
 * Two entry points:
 * 1. renderAIDiagram(diagram) - from AI text-to-diagram response
 * 2. renderMermaidDiagram(mermaidSrc) - direct algorithmic Mermaid parser
 */

const PADDING = 40;
const NODE_W = 160;
const NODE_H = 60;
const H_SPACING = 200;
const V_SPACING = 120;

// ============================================================
// MERMAID PARSER - No AI needed, direct algorithmic conversion
// ============================================================

/**
 * Parse Mermaid graph syntax into the diagram JSON format.
 * Supports: graph TD/TB/LR/RL, node shapes [], (), {}, (())
 */
export function parseMermaid(src) {
    const lines = src.trim().split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('%%'));
    if (lines.length === 0) return null;

    // Detect direction from first line
    const headerMatch = lines[0].match(/^(graph|flowchart)\s+(TD|TB|LR|RL|BT)/i);
    const direction = headerMatch ? headerMatch[2].toUpperCase() : 'TD';
    const isHorizontal = direction === 'LR' || direction === 'RL';
    const startIdx = headerMatch ? 1 : 0;

    const nodesMap = new Map(); // id -> { id, type, label }
    const edges = [];

    // Parse node definition: A[text], A(text), A{text}, A((text))
    function parseNodeRef(raw) {
        raw = raw.trim();
        if (!raw) return null;

        let id, label, type;

        // ((text)) -> circle
        let m = raw.match(/^(\w+)\(\((.+?)\)\)$/);
        if (m) { id = m[1]; label = m[2]; type = 'circle'; }

        // {text} -> diamond
        if (!m) { m = raw.match(/^(\w+)\{(.+?)\}$/); if (m) { id = m[1]; label = m[2]; type = 'diamond'; } }

        // (text) -> circle
        if (!m) { m = raw.match(/^(\w+)\((.+?)\)$/); if (m) { id = m[1]; label = m[2]; type = 'circle'; } }

        // [text] -> rectangle
        if (!m) { m = raw.match(/^(\w+)\[(.+?)\]$/); if (m) { id = m[1]; label = m[2]; type = 'rectangle'; } }

        // bare id
        if (!m) { id = raw; label = raw; type = 'rectangle'; }

        if (!nodesMap.has(id)) {
            nodesMap.set(id, { id, type, label });
        } else if (label !== id) {
            // Update label if we got a better one
            nodesMap.get(id).label = label;
            nodesMap.get(id).type = type;
        }

        return id;
    }

    // Parse each line for edges: A --> B, A -->|label| B, A -- text --> B
    for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].replace(/;$/, '').trim();
        if (!line) continue;

        // Try edge patterns
        // A -->|label| B  or  A -- label --> B  or  A --> B
        const edgeRegex = /^(.+?)\s*(-{1,2}>|={1,2}>|-.->|-->)\s*(?:\|([^|]*)\|)?\s*(.+)$/;
        const edgeRegex2 = /^(.+?)\s*--\s*(.+?)\s*-->\s*(.+)$/;

        let match = line.match(edgeRegex2);
        if (match) {
            const fromId = parseNodeRef(match[1].trim());
            const toId = parseNodeRef(match[3].trim());
            if (fromId && toId) {
                edges.push({ from: fromId, to: toId, label: match[2].trim() });
            }
            continue;
        }

        match = line.match(edgeRegex);
        if (match) {
            const fromId = parseNodeRef(match[1].trim());
            const toId = parseNodeRef(match[4].trim());
            const edgeLabel = match[3] ? match[3].trim() : undefined;
            if (fromId && toId) {
                edges.push({ from: fromId, to: toId, label: edgeLabel });
            }
            continue;
        }

        // Standalone node definition
        parseNodeRef(line);
    }

    if (nodesMap.size === 0) return null;

    // Layout: assign x,y positions using topological layers
    const nodes = [];
    const nodeIds = Array.from(nodesMap.keys());

    // Build adjacency for layer assignment
    const children = new Map();
    const parents = new Map();
    nodeIds.forEach(id => { children.set(id, []); parents.set(id, []); });
    edges.forEach(e => {
        if (children.has(e.from)) children.get(e.from).push(e.to);
        if (parents.has(e.to)) parents.get(e.to).push(e.from);
    });

    // Assign layers via BFS from roots (nodes with no parents)
    const layers = new Map();
    const roots = nodeIds.filter(id => parents.get(id).length === 0);
    if (roots.length === 0) roots.push(nodeIds[0]); // fallback: first node

    const queue = roots.map(id => ({ id, layer: 0 }));
    const visited = new Set();

    while (queue.length > 0) {
        const { id, layer } = queue.shift();
        if (visited.has(id)) {
            // Update to deeper layer if needed
            if (layer > (layers.get(id) || 0)) layers.set(id, layer);
            continue;
        }
        visited.add(id);
        layers.set(id, Math.max(layer, layers.get(id) || 0));

        for (const child of children.get(id) || []) {
            queue.push({ id: child, layer: layer + 1 });
        }
    }

    // Handle unvisited nodes
    nodeIds.forEach(id => {
        if (!visited.has(id)) {
            layers.set(id, 0);
        }
    });

    // Group by layer
    const layerGroups = new Map();
    layers.forEach((layer, id) => {
        if (!layerGroups.has(layer)) layerGroups.set(layer, []);
        layerGroups.get(layer).push(id);
    });

    // Position nodes
    const sortedLayers = Array.from(layerGroups.keys()).sort((a, b) => a - b);
    sortedLayers.forEach((layerIdx, li) => {
        const group = layerGroups.get(layerIdx);
        const groupWidth = group.length * H_SPACING;
        const startOffset = -groupWidth / 2 + H_SPACING / 2;

        group.forEach((id, gi) => {
            const nodeData = nodesMap.get(id);
            let x, y;
            if (isHorizontal) {
                x = li * H_SPACING;
                y = startOffset + gi * V_SPACING;
            } else {
                x = startOffset + gi * H_SPACING;
                y = li * V_SPACING;
            }
            nodes.push({
                id: nodeData.id,
                type: nodeData.type,
                label: nodeData.label,
                x, y,
                width: NODE_W,
                height: NODE_H,
            });
        });
    });

    return {
        title: 'Mermaid Diagram',
        nodes,
        edges: edges.map(e => ({
            from: e.from,
            to: e.to,
            label: e.label,
        })),
    };
}

// ============================================================
// RENDER DIAGRAM JSON → Shapes on canvas
// ============================================================

/**
 * Render diagram JSON onto the canvas inside a Frame.
 * @param {Object} diagram - { title, nodes[], edges[] }
 * @returns {boolean} true if rendering succeeded
 */
export function renderAIDiagram(diagram) {
    if (!diagram || !diagram.nodes || !Array.isArray(diagram.nodes) || diagram.nodes.length === 0) {
        console.error('[AIRenderer] Invalid or empty diagram data');
        return false;
    }

    const nodes = diagram.nodes;
    const edges = diagram.edges || [];
    const title = diagram.title || 'AI Diagram';

    if (!window.svg || !window.Frame || !window.Rectangle) {
        console.error('[AIRenderer] Engine not initialized');
        return false;
    }

    // Calculate canvas center based on current viewport
    const vb = window.currentViewBox || { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
    const viewCenterX = vb.x + vb.width / 2;
    const viewCenterY = vb.y + vb.height / 2;

    // Calculate diagram bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
        const w = node.width || NODE_W;
        const h = node.height || NODE_H;
        if (node.x < minX) minX = node.x;
        if (node.y < minY) minY = node.y;
        if (node.x + w > maxX) maxX = node.x + w;
        if (node.y + h > maxY) maxY = node.y + h;
    });

    const diagramWidth = maxX - minX;
    const diagramHeight = maxY - minY;

    // Offset to center diagram in viewport
    const offsetX = viewCenterX - diagramWidth / 2 - minX;
    const offsetY = viewCenterY - diagramHeight / 2 - minY;

    // Frame dimensions
    const frameX = viewCenterX - diagramWidth / 2 - PADDING;
    const frameY = viewCenterY - diagramHeight / 2 - PADDING;
    const frameW = diagramWidth + PADDING * 2;
    const frameH = diagramHeight + PADDING * 2;

    // Create frame with same options as frameTool.js defaults
    let frame = null;
    try {
        frame = new window.Frame(frameX, frameY, frameW, frameH, {
            stroke: '#888',
            strokeWidth: 2,
            fill: 'transparent',
            opacity: 1,
            frameName: title,
        });
        window.shapes.push(frame);
        if (typeof window.pushCreateAction === 'function') window.pushCreateAction(frame);
    } catch (err) {
        console.error('[AIRenderer] Failed to create frame:', err);
        return false;
    }

    const nodeMap = new Map();

    // Create nodes
    for (const node of nodes) {
        const nx = node.x + offsetX;
        const ny = node.y + offsetY;
        const nw = node.width || NODE_W;
        const nh = node.height || NODE_H;

        let shape = null;

        try {
            if (node.type === 'circle' && window.Circle) {
                const rx = nw / 2;
                const ry = nh / 2;
                shape = new window.Circle(nx + rx, ny + ry, rx, ry, {
                    stroke: '#e0e0e0',
                    strokeWidth: 1.5,
                    fill: 'transparent',
                    roughness: 1,
                });
            } else if (node.type === 'diamond' && window.Rectangle) {
                const size = Math.max(nw, nh) * 0.7;
                shape = new window.Rectangle(
                    nx + nw / 2 - size / 2,
                    ny + nh / 2 - size / 2,
                    size, size, {
                        stroke: '#e0e0e0',
                        strokeWidth: 1.5,
                        fill: 'transparent',
                        roughness: 1,
                    }
                );
                if (shape.element) {
                    shape.element.setAttribute('transform', `rotate(45, ${nx + nw / 2}, ${ny + nh / 2})`);
                }
            } else if (window.Rectangle) {
                shape = new window.Rectangle(nx, ny, nw, nh, {
                    stroke: '#e0e0e0',
                    strokeWidth: 1.5,
                    fill: 'transparent',
                    roughness: 1,
                });
            }
        } catch (err) {
            console.warn('[AIRenderer] Failed to create node:', node.id, err);
            continue;
        }

        if (shape) {
            window.shapes.push(shape);
            if (typeof window.pushCreateAction === 'function') window.pushCreateAction(shape);

            if (typeof frame.addShapeToFrame === 'function') {
                frame.addShapeToFrame(shape);
            }

            nodeMap.set(node.id, {
                shape,
                x: nx, y: ny,
                width: nw, height: nh,
                centerX: nx + nw / 2,
                centerY: ny + nh / 2,
            });
        }

        // Add label as text
        if (node.label && window.TextShape) {
            addTextLabel(node.label, nx + nw / 2, ny + nh / 2, frame);
        }
    }

    // Create edges as arrows
    for (const edge of edges) {
        const fromNode = nodeMap.get(edge.from);
        const toNode = nodeMap.get(edge.to);
        if (!fromNode || !toNode) continue;

        const startPoint = getConnectionPoint(fromNode, toNode);
        const endPoint = getConnectionPoint(toNode, fromNode, true);

        if (window.Arrow) {
            try {
                const arrow = new window.Arrow(startPoint, endPoint, {
                    stroke: '#e0e0e0',
                    strokeWidth: 1.5,
                    roughness: 1,
                });

                window.shapes.push(arrow);
                if (typeof window.pushCreateAction === 'function') window.pushCreateAction(arrow);

                if (typeof frame.addShapeToFrame === 'function') {
                    frame.addShapeToFrame(arrow);
                }

                if (fromNode.shape && arrow.setStartAttachment) {
                    arrow.setStartAttachment(fromNode.shape);
                }
                if (toNode.shape && arrow.setEndAttachment) {
                    arrow.setEndAttachment(toNode.shape);
                }
            } catch (err) {
                console.warn('[AIRenderer] Failed to create arrow:', edge, err);
            }
        }

        // Add edge label
        if (edge.label && window.TextShape) {
            const midX = (startPoint.x + endPoint.x) / 2;
            const midY = (startPoint.y + endPoint.y) / 2;
            addTextLabel(edge.label, midX, midY - 10, frame, 10);
        }
    }

    // Auto-select the frame after rendering
    window.currentShape = frame;
    if (typeof frame.selectFrame === 'function') {
        frame.selectFrame();
    }
    if (window.__sketchStoreApi) {
        window.__sketchStoreApi.setSelectedShapeSidebar('frame');
    }

    console.log(`[AIRenderer] Rendered ${nodes.length} nodes, ${edges.length} edges in frame "${title}"`);
    return true;
}

/**
 * Calculate connection point on a node's edge facing another node.
 */
function getConnectionPoint(fromNode, toNode, isTarget = false) {
    const dx = toNode.centerX - fromNode.centerX;
    const dy = toNode.centerY - fromNode.centerY;
    const hw = fromNode.width / 2;
    const hh = fromNode.height / 2;

    if (isTarget) {
        if (Math.abs(dy) * hw > Math.abs(dx) * hh) {
            return dy < 0
                ? { x: fromNode.centerX, y: fromNode.y + fromNode.height }
                : { x: fromNode.centerX, y: fromNode.y };
        } else {
            return dx < 0
                ? { x: fromNode.x + fromNode.width, y: fromNode.centerY }
                : { x: fromNode.x, y: fromNode.centerY };
        }
    } else {
        if (Math.abs(dy) * hw > Math.abs(dx) * hh) {
            return dy > 0
                ? { x: fromNode.centerX, y: fromNode.y + fromNode.height }
                : { x: fromNode.centerX, y: fromNode.y };
        } else {
            return dx > 0
                ? { x: fromNode.x + fromNode.width, y: fromNode.centerY }
                : { x: fromNode.x, y: fromNode.centerY };
        }
    }
}

/**
 * Add a text label at position.
 */
function addTextLabel(text, x, y, frame, fontSize = 14) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = window.svg;
    if (!svg) return null;

    try {
        const group = document.createElementNS(ns, 'g');
        const textEl = document.createElementNS(ns, 'text');
        textEl.setAttribute('x', x);
        textEl.setAttribute('y', y);
        textEl.setAttribute('text-anchor', 'middle');
        textEl.setAttribute('dominant-baseline', 'central');
        textEl.setAttribute('fill', '#e0e0e0');
        textEl.setAttribute('font-size', fontSize);
        textEl.setAttribute('font-family', 'lixFont, sans-serif');
        textEl.textContent = text;

        group.appendChild(textEl);
        svg.appendChild(group);

        const textShape = new window.TextShape(group);
        window.shapes.push(textShape);
        if (typeof window.pushCreateAction === 'function') window.pushCreateAction(textShape);

        if (frame && typeof frame.addShapeToFrame === 'function') {
            frame.addShapeToFrame(textShape);
        }

        return textShape;
    } catch (err) {
        console.warn('[AIRenderer] Failed to create text label:', err);
        return null;
    }
}

/**
 * Initialize the AI renderer bridge.
 */
export function initAIRenderer() {
    window.__aiRenderer = renderAIDiagram;
    window.__mermaidRenderer = (src) => {
        const diagram = parseMermaid(src);
        if (!diagram) {
            console.error('[AIRenderer] Failed to parse Mermaid syntax');
            return false;
        }
        return renderAIDiagram(diagram);
    };
}
