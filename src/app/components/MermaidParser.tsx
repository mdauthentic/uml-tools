import { Node, Edge, MarkerType, Position } from "reactflow";
import dagre from "dagre";

interface ParsedDiagram {
  nodes: Node[];
  edges: Edge[];
}

interface NodeData {
  label: string;
}

// Constants
const RELATIONS = [
  "<|--",
  "--|>",
  "*--",
  "o--",
  "--",
  "<..",
  "..>",
  "<--",
  "-->",
  "<|..",
  "..",
] as const;

const EDGE_STYLES = {
  EDGE: {
    stroke: "#101828cc",
    strokeWidth: 1,
  },
  EDGE_DASHED: {
    stroke: "#101828cc",
    strokeWidth: 1,
    strokeDasharray: "6 4",
  },
} as const;

const MARKER_CONFIG = {
  type: MarkerType.ArrowClosed,
  width: 15,
  height: 15,
  color: "#a9b2bc",
} as const;

const LAYOUT_CONFIG = {
  NODE_WIDTH: 220,
  NODE_HEIGHT: 120,
  DAGRE_OPTIONS: { rankdir: "TB", nodesep: 100, ranksep: 80 },
} as const;

// Precompile regex patterns
const PATTERNS = {
  CLASS_BLOCK_START: /^class\s+(\w+)\s*{$/,
  EDGE_WITH_CARDINALITY:
    /("?[\w~]+"?)\s*"([^"]+)"?\s*([<|o*.\-]+)\s*"([^"]+)"?\s*("?[\w~]+"?)\s*(?::\s*(.+?))?\s*(>?)/,
  INLINE_CLASS: /^(\w+)\s*:\s*(.+)$/,
} as const;

// Utilities
function createNode(id: string, label: string = id): Node<NodeData> {
  return {
    id,
    data: { label },
    position: { x: 0, y: 0 },
    type: "umlClass",
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  };
}

function createEdge(
  from: string,
  to: string,
  relation: string,
  label = "",
): Edge {
  const isDashed = relation.includes("..");
  const style = isDashed ? EDGE_STYLES.EDGE_DASHED : EDGE_STYLES.EDGE;
  return {
    id: `${from}-${to}-${relation}`,
    source: from,
    target: to,
    type: "step",
    label,
    style,
    markerEnd: MARKER_CONFIG,
  };
}

function getOrCreateNode(
  nodeMap: Map<string, Node<NodeData>>,
  id: string,
): Node<NodeData> {
  let node = nodeMap.get(id);
  if (!node) {
    node = createNode(id);
    nodeMap.set(id, node);
  }
  return node;
}

function preprocessLines(code: string): string[] {
  return code
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function findRelation(line: string): string | undefined {
  return RELATIONS.find((relation) => line.includes(relation));
}

function createDagreGraph(): dagre.graphlib.Graph {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph(LAYOUT_CONFIG.DAGRE_OPTIONS);
  return g;
}

function applyLayout(nodes: Node<NodeData>[], edges: Edge[]): void {
  const graph = createDagreGraph();

  // Add nodes to dagre graph
  for (const node of nodes) {
    graph.setNode(node.id, {
      width: LAYOUT_CONFIG.NODE_WIDTH,
      height: LAYOUT_CONFIG.NODE_HEIGHT,
    });
  }

  // Add edges to dagre graph
  for (const edge of edges) {
    graph.setEdge(edge.source, edge.target);
  }

  // Calculate layout
  dagre.layout(graph);

  // Apply positions to nodes
  const halfWidth = LAYOUT_CONFIG.NODE_WIDTH / 2;
  const halfHeight = LAYOUT_CONFIG.NODE_HEIGHT / 2;

  for (const node of nodes) {
    const { x, y } = graph.node(node.id);
    node.position = {
      x: x - halfWidth,
      y: y - halfHeight,
    };
  }
}

function parseRelationship(
  line: string,
  relation: string,
  nodeMap: Map<string, Node<NodeData>>,
): Edge | null {
  // Try complex edge pattern first
  const edgeMatch = line.match(PATTERNS.EDGE_WITH_CARDINALITY);
  if (edgeMatch) {
    const [, leftClass, , relSymbol, , rightClass, relLabel] = edgeMatch;
    const source = leftClass.replace(/"/g, "").trim();
    const target = rightClass.replace(/"/g, "").trim();
    const edgeLabel = relLabel?.trim() || "";

    getOrCreateNode(nodeMap, source);
    getOrCreateNode(nodeMap, target);

    return createEdge(source, target, relSymbol.trim(), edgeLabel);
  }

  // Fallback: simple relationship
  const [from, toAndLabel] = line.split(relation).map((s) => s.trim());
  const [to, label = ""] = toAndLabel.split(":").map((s) => s.trim());

  getOrCreateNode(nodeMap, from);
  getOrCreateNode(nodeMap, to);

  return createEdge(from, to, relation, label);
}

export function MermaidParser(code: string): ParsedDiagram {
  const lines = preprocessLines(code);
  const nodeMap = new Map<string, Node<NodeData>>();
  const edges: Edge[] = [];

  let currentClass: string | null = null;

  for (const line of lines) {
    // Skip notes
    if (line.startsWith("note")) continue;

    // Handle class block start
    const classBlockMatch = line.match(PATTERNS.CLASS_BLOCK_START);
    if (classBlockMatch) {
      currentClass = classBlockMatch[1];
      getOrCreateNode(nodeMap, currentClass);
      continue;
    }

    // Handle class block end
    if (line === "}") {
      currentClass = null;
      continue;
    }

    // Handle content inside class block
    if (currentClass) {
      const node = nodeMap.get(currentClass)!;
      node.data.label += `\n${line}`;
      continue;
    }

    // Handle relationships
    const relation = findRelation(line);
    if (relation) {
      const edge = parseRelationship(line, relation, nodeMap);
      if (edge) {
        edges.push(edge);
      }
      continue;
    }

    // Handle inline class members
    const inlineClassMatch = line.match(PATTERNS.INLINE_CLASS);
    if (inlineClassMatch) {
      const [, className, member] = inlineClassMatch;
      const node = getOrCreateNode(nodeMap, className);
      node.data.label += `\n${member}`;
    }
  }

  const nodes = Array.from(nodeMap.values());

  // Apply Dagre layout
  applyLayout(nodes, edges);

  return { nodes, edges };
}
