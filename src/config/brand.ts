const GITHUB_PAGES_HOST = "https://pathumsandeepa.github.io";
const CONFIGURED_BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH ||
  process.env.NEXT_PUBLIC_SITE_BASE_PATH ||
  "/dynamic-readme-creature";
const NORMALIZED_BASE_PATH = CONFIGURED_BASE_PATH.replace(/^\/+|\/+$/g, "");
const SITE_URL = NORMALIZED_BASE_PATH
  ? `${GITHUB_PAGES_HOST}/${NORMALIZED_BASE_PATH}/`
  : `${GITHUB_PAGES_HOST}/`;

export const BRAND = {
  name: "ReadmeForge",
  tagline: "Build a GitHub profile README that moves.",
  description:
    "Build, edit and publish a GitHub profile README in your browser with live preview, starter templates, animated pixel creatures and custom images.",
  repoUrl: "https://github.com/PathumSandeepa/dynamic-readme-creature",
  issuesUrl: "https://github.com/PathumSandeepa/dynamic-readme-creature/issues",
  pullsUrl: "https://github.com/PathumSandeepa/dynamic-readme-creature/pulls",
  readmeUrl: "https://github.com/PathumSandeepa/dynamic-readme-creature#readme",
  contributingUrl:
    "https://github.com/PathumSandeepa/dynamic-readme-creature#contributing",
  authorUrl: "https://github.com/PathumSandeepa",
  authorHandle: "PathumSandeepa",
  siteUrl: SITE_URL,
  authorName: "Pathum Sandeepa",
} as const;
