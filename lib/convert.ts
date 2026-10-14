import type { EdgeStyle, NodeData, Roadmap } from "./types";

// Shape of the JSON files in the roadmap.sh developer-roadmap repo
export interface RepoNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  measured?: { width?: number; height?: number };
  style?: { width?: number | string; height?: number | string };
  data?: NodeData;
}

export interface RepoEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  style?: EdgeStyle;
}

export interface RepoJson {
  nodes: RepoNode[];
  edges: RepoEdge[];
}

function toNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : fallback;
}

// Turns a repo JSON file into a simple shape.
// Used by the seed script (database) and by the static page (JSON only).
export function fromRepoJson(json: RepoJson): Roadmap {
  const ids = new Set(json.nodes.map((n) => n.id));

  const nodes = json.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    label: n.data?.label ?? "",
    x: n.position.x,
    y: n.position.y,
    w: toNumber(n.width ?? n.measured?.width ?? n.style?.width, 100),
    h: toNumber(n.height ?? n.measured?.height ?? n.style?.height, 40),
    data: n.data ?? {},
    done: 0,
  }));

  // skip edges that point to a node that does not exist
  const edges = json.edges
    .filter((e) => ids.has(e.source) && ids.has(e.target))
    .map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? "",
      targetHandle: e.targetHandle ?? "",
      style: e.style ?? {},
    }));

  return { nodes, edges };
}
