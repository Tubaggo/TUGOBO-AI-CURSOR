import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  transpilePackages: [
    "@tugobo/shared",
    "@tugobo/db",
    "@tugobo/channels",
    "@tugobo/core",
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["postgres", "twilio"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withNextIntl(nextConfig);
