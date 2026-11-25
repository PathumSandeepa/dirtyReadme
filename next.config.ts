import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const githubRepoFromEnv = process.env.GITHUB_REPOSITORY?.split("/")[1];
const repoName =
  process.env.NEXT_PUBLIC_REPO_NAME ||
  githubRepoFromEnv ||
  "dirtyReadme";
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