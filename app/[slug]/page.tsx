import { DatabaseRoadmap } from "@/components/database-roadmap";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <DatabaseRoadmap slug={slug} />;
}
