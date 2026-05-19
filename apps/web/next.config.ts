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
  serverExternalPackages: ["postgres", "twilio"],
  poweredByHeader: false,
};

export default withNextIntl(nextConfig);
