import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node-latex spawns child processes and uses Node.js-specific internals;
  // it must not be bundled by Next.js — use native require instead.
  serverExternalPackages: ["node-latex"],
};

export default nextConfig;
