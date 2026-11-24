import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = "DirtyReadme";
const prodBasePath = `/${repoName}`;
const basePath = isProd ? prodBasePath : "";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_BASE_PATH: prodBasePath,
  },
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