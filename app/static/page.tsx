import fs from "node:fs";
import path from "node:path";
import { RoadmapPage } from "@/components/roadmap-page";
import { fromRepoJson, type RepoJson } from "@/lib/convert";

export default function StaticPage() {
  // phase 1: read the JSON file directly, no database
  const file = path.join(process.cwd(), "data", "repo", "ai-engineer.json");
  const { nodes, edges } = fromRepoJson(JSON.parse(fs.readFileSync(file, "utf8")) as RepoJson);

  return <RoadmapPage slug="ai-engineer" nodes={nodes} edges={edges} source="json" />;
}
