import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Roadmap } from "@/components/roadmap";
import type { RoadmapEdge, RoadmapNode } from "@/lib/types";
import { ModeToggle } from "@/app/components/darkmode";

interface RoadmapPageProps {
  slug: string;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  source: "database" | "json";
  roadmaps?: string[];
}

export function RoadmapPage({ slug, nodes, edges, source, roadmaps = [] }: RoadmapPageProps) {
  const fromDatabase = source === "database";
  const title = slug.replace(/-/g, " ");

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight capitalize">{title} roadmap</h1>
            <Badge variant={fromDatabase ? "default" : "secondary"}>{fromDatabase ? "SQLite database" : "Static JSON"}</Badge>
          </div>
          <ModeToggle />
        </div>
        <p className="text-muted-foreground">
          {fromDatabase
            ? "Click a topic to mark it done. Your progress is saved in the database."
            : "Data comes straight from data/repo/ai-engineer.json. Checkmarks are not saved."}
        </p>
        <nav className="flex flex-wrap gap-2" aria-label="Roadmaps">
          {fromDatabase ? (
            <>
              {roadmaps.map((r) => (
                <Button key={r} asChild size="sm" variant={r === slug ? "default" : "outline"}>
                  <Link href={r === "ai-engineer" ? "/" : `/${r}`}>{r}</Link>
                </Button>
              ))}
              <Button asChild size="sm" variant="ghost">
                <Link href="/static">static version</Link>
              </Button>
            </>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href="/">database version</Link>
            </Button>
          )}
        </nav>
      </header>

      <Separator className="my-6" />

      <Roadmap slug={slug} initialNodes={nodes} edges={edges} persist={fromDatabase} />
    </main>
  );
}
