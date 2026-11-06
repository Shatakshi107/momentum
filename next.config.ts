import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the dev-mode "N" badge so it never shows up in the recorded demo.
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
