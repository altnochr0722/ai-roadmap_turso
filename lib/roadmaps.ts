import { fromRepoJson, type RepoJson } from "./convert";
import aiEngineer from "@/data/repo/ai-engineer.json";
import frontend from "@/data/repo/frontend.json";
import type { Roadmap } from "./types";

// The roadmap layout (boxes + lines) comes straight from the JSON files, bundled into the app.
// To add another roadmap: copy its JSON into data/repo/ and add one line here.
const FILES: Record<string, unknown> = {
  "ai-engineer": aiEngineer,
  frontend,
};

export function listRoadmaps(): string[] {
  return Object.keys(FILES);
}

export function getRoadmap(slug: string): Roadmap {
  const json = FILES[slug];
  if (!json) return { nodes: [], edges: [] };
  return fromRepoJson(json as RepoJson);
}

export function isValidTopic(slug: string, id: string): boolean {
  return getRoadmap(slug).nodes.some((n) => n.id === id && (n.type === "topic" || n.type === "subtopic"));
}
