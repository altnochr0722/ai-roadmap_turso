import { notFound } from "next/navigation";
import { getRoadmap, listRoadmaps } from "@/lib/db";
import { RoadmapPage } from "@/components/roadmap-page";

// Server component: reads one roadmap from the database (Turso / SQLite) and shows it
export async function DatabaseRoadmap({ slug }: { slug: string }) {
  const { nodes, edges } = await getRoadmap(slug);
  if (nodes.length === 0) notFound();

  return <RoadmapPage slug={slug} nodes={nodes} edges={edges} source="database" roadmaps={await listRoadmaps()} />;
}
