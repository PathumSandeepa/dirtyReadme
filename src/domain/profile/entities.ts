export type ReadmeTemplateId =
  | "cyber-guardian"
  | "minimal-header"
  | "auto-evolve-block"
  | "telemetry-stats";

export type TechCategory =
  | "design"
  | "frontend"
  | "backend"
  | "languages"
  | "devops";

export interface ReadmeBadge {
  id: string;
  label: string;
  color: string;
  logo?: string;
  logoColor?: string;
  category?: TechCategory;
  enabled: boolean;
}

export interface ReadmeActionLink {
  id: string;
  label: string;
  valueText: string;
  url: string;
  color: string;
  logo?: string;
  enabled: boolean;
}

export interface ReadmeConfig {
  templateId: ReadmeTemplateId;
  headline: string;
  subtitleTags: string[];
  bio: string;
  ctaLine: string;
  telemetryCaptionTemplate: string;
  statsTableTitle: string;
  align: "center" | "left";
  imageWidth: number;
  useOutputBranchUrl: boolean;
  includeMarkers: boolean;
  includeTelemetryCaption: boolean;
  includeShareCard: boolean;
  includeStatsTable: boolean;
  customSectionTitle: string;
  customFooterMarkdown: string;
  badges: ReadmeBadge[];
  actionLinks: ReadmeActionLink[];
  profileDisplayName: string;
  profileStatusBio: string;
  profileLocation: string;
  profileCompany: string;
  profileWebsite: string;
  rawOverride: string | null;
}

export const README_TEMPLATES: {
  id: ReadmeTemplateId;
  name: string;
  description: string;
}[] = [
  {
    id: "cyber-guardian",
    name: "Full Developer Profile",
    description:
      "Title, specialty tags, bio, drag-and-drop tech stack, CTA links, and creature",
  },
  {
    id: "minimal-header",
    name: "Minimalist Header",
    description: "Clean centered creature banner with headline and bio",
  },
  {
    id: "auto-evolve-block",
    name: "Auto-Evolve Block Only",
    description: "Drop-in START/END marker block for an existing README.md",
  },
  {
    id: "telemetry-stats",
    name: "Telemetry & Share Card",
    description: "Creature, live evolution table, and 1280x640 social card",
  },
];

export const DYNAMIC_TOKENS = [
  { token: "{{USERNAME}}", description: "GitHub handle" },
  { token: "{{CREATURE}}", description: "Creature name" },
  { token: "{{STAGE}}", description: "Evolution stage (1-5)" },
  { token: "{{RANK}}", description: "Stage rank" },
  { token: "{{COMMITS}}", description: "Formatted commit count" },
  { token: "{{VIEW}}", description: "Camera view" },
  { token: "{{LANGUAGES}}", description: "Top languages" },
];

export const TECH_STACK_CATALOG: Omit<ReadmeBadge, "enabled">[] = [
  { id: "figma", label: "Figma", color: "F24E1E", logo: "figma", logoColor: "white", category: "design" },
  { id: "photoshop", label: "Photoshop", color: "31A8FF", logo: "adobephotoshop", logoColor: "white", category: "design" },
  { id: "illustrator", label: "Illustrator", color: "FF9A00", logo: "adobeillustrator", logoColor: "white", category: "design" },
  { id: "aftereffects", label: "After Effects", color: "9999FF", logo: "adobeaftereffects", logoColor: "white", category: "design" },
  { id: "blender", label: "Blender", color: "F5792A", logo: "blender", logoColor: "white", category: "design" },
  { id: "react", label: "React", color: "20232A", logo: "react", logoColor: "61DAFB", category: "frontend" },
  { id: "nextjs", label: "Next.js", color: "000000", logo: "nextdotjs", logoColor: "white", category: "frontend" },
  { id: "tailwindcss", label: "Tailwind CSS", color: "06B6D4", logo: "tailwindcss", logoColor: "white", category: "frontend" },
  { id: "nodejs", label: "Node.js", color: "339933", logo: "nodedotjs", logoColor: "white", category: "frontend" },
  { id: "vue", label: "Vue.js", color: "4FC08D", logo: "vuedotjs", logoColor: "white", category: "frontend" },
  { id: "svelte", label: "Svelte", color: "FF3E00", logo: "svelte", logoColor: "white", category: "frontend" },
  { id: "html5", label: "HTML5", color: "E34F26", logo: "html5", logoColor: "white", category: "frontend" },
  { id: "css3", label: "CSS3", color: "1572B6", logo: "css3", logoColor: "white", category: "frontend" },
  { id: "typescript", label: "TypeScript", color: "3178C6", logo: "typescript", logoColor: "white", category: "languages" },
  { id: "javascript", label: "JavaScript", color: "323330", logo: "javascript", logoColor: "F7DF1E", category: "languages" },
  { id: "python", label: "Python", color: "3776AB", logo: "python", logoColor: "white", category: "languages" },
  { id: "rust", label: "Rust", color: "000000", logo: "rust", logoColor: "white", category: "languages" },
  { id: "go", label: "Go", color: "00ADD8", logo: "go", logoColor: "white", category: "languages" },
  { id: "java", label: "Java", color: "ED8B00", logo: "openjdk", logoColor: "white", category: "languages" },
  { id: "kotlin", label: "Kotlin", color: "7F52FF", logo: "kotlin", logoColor: "white", category: "languages" },
  { id: "csharp", label: "C#", color: "239120", logo: "sharp", logoColor: "white", category: "languages" },
  { id: "cpp", label: "C++", color: "00599C", logo: "cplusplus", logoColor: "white", category: "languages" },
  { id: "shell", label: "Shell Script", color: "121011", logo: "gnubash", logoColor: "white", category: "languages" },
  { id: "postgres", label: "PostgreSQL", color: "316192", logo: "postgresql", logoColor: "white", category: "backend" },
  { id: "mongodb", label: "MongoDB", color: "47A248", logo: "mongodb", logoColor: "white", category: "backend" },
  { id: "redis", label: "Redis", color: "DC382D", logo: "redis", logoColor: "white", category: "backend" },
  { id: "prisma", label: "Prisma", color: "2D3748", logo: "prisma", logoColor: "white", category: "backend" },
  { id: "graphql", label: "GraphQL", color: "E10098", logo: "graphql", logoColor: "white", category: "backend" },
  { id: "docker", label: "Docker", color: "2496ED", logo: "docker", logoColor: "white", category: "devops" },
  { id: "git", label: "Git", color: "F05032", logo: "git", logoColor: "white", category: "devops" },
  { id: "actions", label: "GitHub Actions", color: "2088FF", logo: "githubactions", logoColor: "white", category: "devops" },
  { id: "vscode", label: "VS Code", color: "007ACC", logo: "visualstudiocode", logoColor: "white", category: "devops" },
  { id: "pnpm", label: "pnpm", color: "F69220", logo: "pnpm", logoColor: "white", category: "devops" },
  { id: "linux", label: "Linux", color: "FCC624", logo: "linux", logoColor: "black", category: "devops" },
];

const INITIAL_ENABLED_IDS = new Set([
  "figma",
  "react",
  "nextjs",
  "tailwindcss",
  "nodejs",
  "html5",
  "css3",
  "typescript",
  "javascript",
  "python",
  "rust",
  "postgres",
  "docker",
  "actions",
  "vscode",
]);

export const DEFAULT_README_CONFIG: ReadmeConfig = {
  templateId: "cyber-guardian",
  headline: "Pathum Sandeepa | Creative Builder",
  subtitleTags: [
    "FULL-STACK PLATFORMS",
    "CREATIVE CODING",
    "SCALABLE SYSTEMS",
    "UI/UX DESIGN",
  ],
  bio: "I'm @{{USERNAME}}, a software engineer and creative builder sitting at the intersection of systems engineering and visual craft. I love building open-source developer tools, generative SVG engines, and scalable web applications.",
  ctaLine:
    "Curious to see what I've been building? Explore my stack & live cybernetic guardian below.",
  telemetryCaptionTemplate:
    "Live {{CREATURE}} for @{{USERNAME}} — Stage {{STAGE}}: {{RANK}} · {{COMMITS}} commits · View: {{VIEW}}",
  statsTableTitle: "Cybernetic Telemetry",
  align: "left",
  imageWidth: 760,
  useOutputBranchUrl: false,
  includeMarkers: true,
  includeTelemetryCaption: true,
  includeShareCard: false,
  includeStatsTable: false,
  customSectionTitle: "",
  customFooterMarkdown: "",
  badges: TECH_STACK_CATALOG.map((b) => ({
    ...b,
    enabled: INITIAL_ENABLED_IDS.has(b.id),
  })),
  actionLinks: [
    {
      id: "github",
      label: "GITHUB",
      valueText: "@{{USERNAME}}",
      url: "https://github.com/{{USERNAME}}",
      color: "181717",
      logo: "github",
      enabled: true,
    },
    {
      id: "studio",
      label: "STUDIO",
      valueText: "CREATURE GENERATOR",
      url: "https://pathumsandeepa.github.io/dynamic-readme-creature/",
      color: "27272A",
      logo: "vercel",
      enabled: true,
    },
  ],
  profileDisplayName: "Pathum Sandeepa",
  profileStatusBio: "Building clean software & cybernetic SVG tools.",
  profileLocation: "Sri Lanka",
  profileCompany: "Open Source Builder",
  profileWebsite: "https://pathumsandeepa.github.io/dynamic-readme-creature/",
  rawOverride: null,
};
