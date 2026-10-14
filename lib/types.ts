export interface LinkItem {
  id: string;
  label: string;
  url: string;
}

export interface NodeStyle {
  fontSize?: number | string;
  backgroundColor?: string;
  borderColor?: string;
  color?: string;
  justifyContent?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  [key: string]: unknown;
}

export interface NodeData {
  label?: string;
  href?: string;
  color?: string;
  backgroundColor?: string;
  style?: NodeStyle;
  links?: LinkItem[];
  [key: string]: unknown;
}

export interface RoadmapNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  data: NodeData;
  done: number; // 0 or 1
}

export interface EdgeStyle {
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  [key: string]: unknown;
}

export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  style: EdgeStyle;
}

export interface Roadmap {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}
