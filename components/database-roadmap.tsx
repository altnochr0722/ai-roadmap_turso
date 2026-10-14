import { notFound } from "next/navigation";
import { getRoadmap, listRoadmaps } from "@/lib/roadmaps";
import { getDoneIds } from "@/lib/db";
import { RoadmapPage } from "@/components/roadmap-page";

// Server component: layout from the JSON files, finished topics from the database
export async function DatabaseRoadmap({ slug }: { slug: string }) {
  const { nodes, edges } = getRoadmap(slug);
  if (nodes.length === 0) notFound();

  let done = new Set<string>();
  let warning: string | undefined;
  try {
    done = await getDoneIds(slug);
  } catch (err) {
    // the roadmap still shows even if the database is unreachable
    console.error("progress database error:", err);
    warning = "Progress can't be loaded or saved right now (database unavailable).";
  }

  return (
    <RoadmapPage
      slug={slug}
      nodes={nodes.map((n) => ({ ...n, done: done.has(n.id) ? 1 : 0 }))}
      edges={edges}
      source="database"
      roadmaps={listRoadmaps()}
      warning={warning}
    />
  );
}
