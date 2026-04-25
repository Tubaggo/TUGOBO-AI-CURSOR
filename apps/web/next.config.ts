import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@tugobo/shared",
    "@tugobo/db",
    "@tugobo/channels",
    "@tugobo/core",
  ],
  serverExternalPackages: ["postgres", "twilio"],
};

export default nextConfig;
