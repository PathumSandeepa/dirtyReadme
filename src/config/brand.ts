const GITHUB_PAGES_HOST = "https://pathumsandeepa.github.io";
const CONFIGURED_BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH ||
  process.env.NEXT_PUBLIC_SITE_BASE_PATH ||
  "/dirtyReadme";
const NORMALIZED_BASE_PATH = CONFIGURED_BASE_PATH.replace(/^\/+|\/+$/g, "");
const SITE_URL = NORMALIZED_BASE_PATH
  ? `${GITHUB_PAGES_HOST}/${NORMALIZED_BASE_PATH}/`
  : `${GITHUB_PAGES_HOST}/`;

export const BRAND = {
  name: "DirtyReadme",
  tagline: "Build your GitHub README fast and push it in one click.",
  description:
    "DirtyReadme is a free, open source GitHub README builder. Edit with a live preview, start from templates, add badges and links, and publish to your profile in one push.",
  repoUrl: "https://github.com/PathumSandeepa/dirtyReadme",
  issuesUrl: "https://github.com/PathumSandeepa/dirtyReadme/issues",
  pullsUrl: "https://github.com/PathumSandeepa/dirtyReadme/pulls",
  readmeUrl: "https://github.com/PathumSandeepa/dirtyReadme#readme",
  contributingUrl:
    "https://github.com/PathumSandeepa/dirtyReadme#contributing",
  authorUrl: "https://github.com/PathumSandeepa",
  authorHandle: "PathumSandeepa",
  siteUrl: SITE_URL,
  authorName: "Pathum Sandeepa",
} as const;
