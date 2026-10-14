import { RoadmapPage } from "@/components/roadmap-page";
import { getRoadmap } from "@/lib/roadmaps";

export default function StaticPage() {
  // no database: layout only, checkmarks are not saved
  const { nodes, edges } = getRoadmap("ai-engineer");
  return <RoadmapPage slug="ai-engineer" nodes={nodes} edges={edges} source="json" />;
}
