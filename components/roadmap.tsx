"use client";

import { useState, type CSSProperties } from "react";
import { RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { RoadmapEdge, RoadmapNode } from "@/lib/types";

const PAD = 40;

// The roadmap JSON has hard-coded colors (white boxes, black text, blue lines) that only
// look right in light mode. Map them to CSS variables (see app/globals.css) so they follow the theme.
function norm(c?: string): string | undefined {
  if (!c) return undefined;
  let v = c.trim().toLowerCase();
  if (v === "white") v = "#ffffff";
  if (v === "black") v = "#000000";
  if (/^#[0-9a-f]{3}$/.test(v)) v = "#" + [...v.slice(1)].map((x) => x + x).join("");
  return v;
}

const BG: Record<string, string> = {
  "#ffffff": "var(--rm-surface)",
  "#ebebeb": "var(--rm-surface-2)",
  "#d1d1d1": "var(--rm-btn-grey)",
  "#232323": "var(--rm-btn-dark)",
  "#4136d6": "var(--rm-btn-purple)",
  "#2a79e4": "var(--rm-btn-blue)",
  "#2b78e4": "var(--rm-btn-blue)",
};
const TEXT: Record<string, string> = { "#000000": "var(--rm-text)" };
const LINE: Record<string, string> = {
  "#000000": "var(--rm-ink)",
  "#2b78e4": "var(--rm-edge)",
  "#2a79e4": "var(--rm-edge)",
  "#0a33ff": "var(--rm-edge)",
};

const themeBg = (c?: string) => (c ? BG[norm(c)!] ?? c : undefined);
const themeText = (c?: string) => (c ? TEXT[norm(c)!] ?? c : undefined);
const themeLine = (c?: string) => (c ? LINE[norm(c)!] ?? c : undefined);

// Which side of a box a connection handle sits on: w = top, x = bottom, y = left, z = right
const DIR: Record<string, readonly [number, number]> = {
  w: [0, -1],
  x: [0, 1],
  y: [-1, 0],
  z: [1, 0],
};

function anchor(n: RoadmapNode, handle: string): [number, number] {
  const side = handle[0] ?? "z";
  if (side === "w") return [n.x + n.w / 2, n.y];
  if (side === "x") return [n.x + n.w / 2, n.y + n.h];
  if (side === "y") return [n.x, n.y + n.h / 2];
  return [n.x + n.w, n.y + n.h / 2];
}

// One SVG line between two boxes
function Edge({ edge, byId }: { edge: RoadmapEdge; byId: Record<string, RoadmapNode> }) {
  const a = byId[edge.source];
  const b = byId[edge.target];
  const [x1, y1] = anchor(a, edge.sourceHandle);
  const [x2, y2] = anchor(b, edge.targetHandle);
  const [d1x, d1y] = DIR[edge.sourceHandle[0]] ?? DIR.z;
  const [d2x, d2y] = DIR[edge.targetHandle[0]] ?? DIR.y;
  const k = Math.max(20, Math.hypot(x2 - x1, y2 - y1) * 0.4);
  const d = `M${x1},${y1} C${x1 + d1x * k},${y1 + d1y * k} ${x2 + d2x * k},${y2 + d2y * k} ${x2},${y2}`;
  const s = edge.style;

  return (
    <path
      d={d}
      fill="none"
      style={{ stroke: themeLine(s.stroke) ?? "var(--rm-edge)" }}
      strokeWidth={s.strokeWidth ?? 3}
      strokeLinecap="round"
      strokeDasharray={s.strokeDasharray && s.strokeDasharray !== "0" ? s.strokeDasharray : undefined}
    />
  );
}

// The little dotted line pieces from the roadmap ("vertical" / "horizontal" nodes)
function Stub({ n }: { n: RoadmapNode }) {
  const s = n.data.style;
  const [x1, y1, x2, y2] =
    n.type === "vertical"
      ? [n.x + n.w / 2, n.y, n.x + n.w / 2, n.y + n.h]
      : [n.x, n.y + n.h / 2, n.x + n.w, n.y + n.h / 2];

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      style={{ stroke: themeLine(s?.stroke) ?? "var(--rm-edge)" }}
      strokeWidth={s?.strokeWidth ?? 3}
      strokeLinecap="round"
      strokeDasharray={s?.strokeDasharray}
    />
  );
}

interface RoadmapProps {
  slug: string;
  initialNodes: RoadmapNode[];
  edges: RoadmapEdge[];
  // true  -> checkmarks are saved to the database (/api/toggle)
  // false -> static version, checkmarks only live in the browser
  persist: boolean;
}

function post(url: string, body: unknown) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function Roadmap({ slug, initialNodes, edges, persist }: RoadmapProps) {
  const [nodes, setNodes] = useState<RoadmapNode[]>(initialNodes);

  // move everything so the top-left corner of the roadmap is at (PAD, PAD)
  const minX = Math.min(...nodes.map((n) => n.x));
  const minY = Math.min(...nodes.map((n) => n.y));
  const shifted = nodes.map((n) => ({ ...n, x: n.x - minX + PAD, y: n.y - minY + PAD }));
  const width = Math.max(...shifted.map((n) => n.x + n.w)) + PAD;
  const height = Math.max(...shifted.map((n) => n.y + n.h)) + PAD;
  const byId: Record<string, RoadmapNode> = Object.fromEntries(shifted.map((n) => [n.id, n]));

  const items = nodes.filter((n) => n.type === "topic" || n.type === "subtopic");
  const doneCount = items.filter((n) => n.done).length;
  const percent = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  const flip = (id: string) =>
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, done: n.done ? 0 : 1 } : n)));

  async function toggle(id: string) {
    flip(id);
    if (!persist) return;
    try {
      const res = await post("/api/toggle", { roadmap: slug, id });
      if (!res.ok) throw new Error("save failed");
    } catch {
      flip(id); // could not save, put it back
    }
  }

  async function reset() {
    if (!window.confirm("Clear all progress on this roadmap?")) return;
    setNodes((prev) => prev.map((n) => ({ ...n, done: 0 })));
    if (persist) await post("/api/reset", { roadmap: slug });
  }

  function box(n: RoadmapNode): CSSProperties {
    return { left: n.x, top: n.y, width: n.w, height: n.h, fontSize: n.data.style?.fontSize };
  }

  return (
    <div className="space-y-4">
      <Card className="py-4">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <Badge variant="secondary">
                {doneCount} of {items.length} topics done
              </Badge>
            </div>
            <Progress value={percent} aria-label="Roadmap progress" />
          </div>
          <Button variant="outline" size="sm" onClick={reset} disabled={doneCount === 0}>
            <RotateCcw />
            Reset
          </Button>
        </CardContent>
      </Card>

      <div className="roadmap-canvas overflow-x-auto rounded-xl border shadow-sm">
        <div className="relative mx-auto" style={{ width, height }}>
          {/* background boxes */}
          {shifted
            .filter((n) => n.type === "section")
            .map((n) => (
              <div
                key={n.id}
                className="absolute rounded-lg border-2 shadow-sm"
                style={{
                  ...box(n),
                  backgroundColor: themeBg(n.data.style?.backgroundColor) ?? "var(--rm-surface)",
                  borderColor: themeLine(n.data.style?.borderColor) ?? "var(--rm-ink)",
                }}
              />
            ))}

          {/* lines */}
          <svg width={width} height={height} className="absolute inset-0 z-[1]" aria-hidden="true">
            {edges.map((e) => (
              <Edge key={e.id} edge={e} byId={byId} />
            ))}
            {shifted
              .filter((n) => n.type === "vertical" || n.type === "horizontal")
              .map((n) => (
                <Stub key={n.id} n={n} />
              ))}
          </svg>

          {/* boxes and text */}
          {shifted.map((n) => {
            const d = n.data;

            if (n.type === "topic" || n.type === "subtopic") {
              return (
                <button
                  key={n.id}
                  type="button"
                  aria-pressed={Boolean(n.done)}
                  onClick={() => toggle(n.id)}
                  style={box(n)}
                  className={cn(
                    "absolute z-[2] cursor-pointer rounded-md border-2 px-2 text-center leading-tight shadow-xs transition-colors",
                    "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60",
                    n.done
                      ? "border-(--rm-done-border) bg-(--rm-done-bg) text-(--rm-done-fg) line-through decoration-2 hover:bg-(--rm-done-hover)"
                      : n.type === "topic"
                        ? "border-(--rm-topic-border) bg-(--rm-topic-bg) font-bold text-(--rm-topic-fg) hover:bg-(--rm-topic-hover)"
                        : "border-(--rm-sub-border) bg-(--rm-sub-bg) text-(--rm-sub-fg) hover:bg-(--rm-sub-hover)"
                  )}
                >
                  {n.label}
                </button>
              );
            }

            if (n.type === "title") {
              return (
                <div
                  key={n.id}
                  className="absolute z-[2] flex items-center justify-center text-[28px] font-extrabold text-foreground"
                  style={box(n)}
                >
                  {n.label}
                </div>
              );
            }

            if (n.type === "paragraph") {
              return (
                <div
                  key={n.id}
                  className="absolute z-[2] flex flex-col items-center rounded-md border-2 border-(--rm-ink) bg-(--rm-surface) p-4 text-center text-foreground"
                  style={{ ...box(n), justifyContent: d.style?.justifyContent }}
                >
                  {n.label}
                </div>
              );
            }

            if (n.type === "label") {
              const cls = "absolute z-[2] flex items-center justify-center text-center";
              return d.href ? (
                <a key={n.id} href={d.href} className={cn(cls, "hover:underline")} style={{ ...box(n), color: themeText(d.color) }}>
                  {n.label}
                </a>
              ) : (
                <div key={n.id} className={cls} style={{ ...box(n), color: themeText(d.color) }}>
                  {n.label}
                </div>
              );
            }

            if (n.type === "button") {
              const bg = themeBg(d.backgroundColor);
              return (
                <a
                  key={n.id}
                  href={d.href}
                  className="absolute z-[2] flex items-center justify-center rounded-md font-semibold shadow-sm transition-[filter] hover:brightness-110"
                  style={{ ...box(n), background: bg, color: themeText(d.color) }}
                >
                  {n.label}
                </a>
              );
            }

            if (n.type === "linksgroup") {
              return (
                <div
                  key={n.id}
                  className="absolute z-[2] flex flex-col gap-2 rounded-md border-2 border-(--rm-ink) bg-(--rm-surface) px-4 py-3 text-[15px] text-foreground"
                  style={box(n)}
                >
                  <strong>{n.label}</strong>
                  {(d.links ?? []).map((l) => (
                    <a key={l.id} href={l.url} className="text-(--rm-link) hover:underline">
                      {l.label}
                    </a>
                  ))}
                </div>
              );
            }

            return null; // section, vertical, horizontal are drawn above; unknown types are skipped
          })}
        </div>
      </div>
    </div>
  );
}
