import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client"],
  // make the roadmap JSON files available to the /api/seed function on Vercel
  outputFileTracingIncludes: { "/api/seed": ["./data/repo/**/*"] },
};

export default nextConfig;
