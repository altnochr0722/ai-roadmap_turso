import { DatabaseRoadmap } from "@/components/database-roadmap";

export const dynamic = "force-dynamic"; // always read fresh data from the database

export default function Page() {
  return <DatabaseRoadmap slug="ai-engineer" />;
}
