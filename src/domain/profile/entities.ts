export type ReadmeTemplateId =
  | "cyber-guardian"
  | "minimal-header"
  | "auto-evolve-block"
  | "telemetry-stats";

export type TechCategory =
  | "languages"
  | "frontend"
  | "backend"
  | "databases"
  | "mobile"
  | "cloud-devops"
  | "ai-data"
  | "testing"
  | "design"
  | "tools"
  | "skills";

export const TECH_CATEGORY_LABELS: Record<TechCategory, string> = {
  languages: "Languages",
  frontend: "Frontend",
  backend: "Backend",
  databases: "Databases",
  mobile: "Mobile & Desktop",
  "cloud-devops": "Cloud & DevOps",
  "ai-data": "AI & Data",
  testing: "Testing",
  design: "Design & 3D",
  tools: "Tools",
  skills: "Skills",
};

export const TECH_CATEGORIES_ORDER: TechCategory[] = [
  "languages",
  "frontend",
  "backend",
  "databases",
  "mobile",
  "cloud-devops",
  "ai-data",
  "testing",
  "design",
  "tools",
  "skills",
];

export interface ReadmeBadge {
  id: string;
  label: string;
  color: string;
  logo?: string;
  logoColor?: string;
  category?: TechCategory;
  enabled: boolean;
}

export interface TechStackCard {
  id: string;
  title: string;
  badgeIds: string[];
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
  stackCards: TechStackCard[];
  savedOrganizedCards: TechStackCard[] | null;
  actionLinks: ReadmeActionLink[];
  profileDisplayName: string;
  profileStatusBio: string;
  profileLocation: string;
  profileCompany: string;
  profileWebsite: string;
  rawOverride: string | null;
}

export const DEFAULT_DUMMY_INTRO =
  "Hi, I'm @{{USERNAME}}, a passionate developer building modern web applications, developer tools, and open-source projects. I love clean architecture, creative UI engineering, and shipping reliable software.";

export const README_TEMPLATES: {
  id: ReadmeTemplateId;
  name: string;
  description: string;
}[] = [
  {
    id: "cyber-guardian",
    name: "Full Developer Profile",
    description:
      "Headline, specialty tags, intro bio, multi-card tech stack, CTA links, and creature",
  },
  {
    id: "minimal-header",
    name: "Minimalist Header",
    description: "Clean creature banner with headline and intro paragraph",
  },
  {
    id: "auto-evolve-block",
    name: "Auto-Evolve Block Only",
    description: "Drop-in START/END marker block for an existing README.md",
  },
  {
    id: "telemetry-stats",
    name: "Telemetry & Share Card",
    description: "Creature, live evolution stats table, and 1280x640 social card",
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

export const CTA_LOGO_PRESETS: {
  id: string;
  label: string;
  logo?: string;
}[] = [
  { id: "github", label: "GitHub", logo: "github" },
  { id: "googlechrome", label: "Website / Portfolio", logo: "googlechrome" },
  { id: "x", label: "X / Twitter", logo: "x" },
  { id: "gmail", label: "Email / Gmail", logo: "gmail" },
  { id: "youtube", label: "YouTube", logo: "youtube" },
  { id: "discord", label: "Discord", logo: "discord" },
  { id: "devdotto", label: "DEV.to", logo: "devdotto" },
  { id: "medium", label: "Medium", logo: "medium" },
  { id: "buymeacoffee", label: "Buy Me a Coffee", logo: "buymeacoffee" },
  { id: "none", label: "No Icon", logo: undefined },
];

export const CTA_QUICK_TEMPLATES: Omit<ReadmeActionLink, "id" | "enabled">[] = [
  {
    label: "LINKEDIN",
    valueText: "CONNECT",
    url: "https://linkedin.com/in/{{USERNAME}}",
    color: "0A66C2",
  },
  {
    label: "X",
    valueText: "@{{USERNAME}}",
    url: "https://x.com/{{USERNAME}}",
    color: "09090B",
    logo: "x",
  },
  {
    label: "EMAIL",
    valueText: "CONTACT ME",
    url: "mailto:hello@example.com",
    color: "EA4335",
    logo: "gmail",
  },
  {
    label: "PORTFOLIO",
    valueText: "VISIT SITE",
    url: "https://github.com/{{USERNAME}}?tab=repositories",
    color: "4F46E5",
    logo: "googlechrome",
  },
  {
    label: "YOUTUBE",
    valueText: "CHANNEL",
    url: "https://youtube.com/@{{USERNAME}}",
    color: "FF0000",
    logo: "youtube",
  },
  {
    label: "SPONSOR",
    valueText: "BUY COFFEE",
    url: "https://buymeacoffee.com/{{USERNAME}}",
    color: "FFDD00",
    logo: "buymeacoffee",
  },
];

export const TECH_STACK_CATALOG: Omit<ReadmeBadge, "enabled">[] = [
  // Languages (25)
  { id: "typescript", label: "TypeScript", color: "3178C6", logo: "typescript", logoColor: "white", category: "languages" },
  { id: "javascript", label: "JavaScript", color: "323330", logo: "javascript", logoColor: "F7DF1E", category: "languages" },
  { id: "python", label: "Python", color: "3776AB", logo: "python", logoColor: "white", category: "languages" },
  { id: "rust", label: "Rust", color: "000000", logo: "rust", logoColor: "white", category: "languages" },
  { id: "go", label: "Go", color: "00ADD8", logo: "go", logoColor: "white", category: "languages" },
  { id: "java", label: "Java", color: "ED8B00", logo: "openjdk", logoColor: "white", category: "languages" },
  { id: "kotlin", label: "Kotlin", color: "7F52FF", logo: "kotlin", logoColor: "white", category: "languages" },
  { id: "csharp", label: "C#", color: "512BD4", logo: "dotnet", logoColor: "white", category: "languages" },
  { id: "cpp", label: "C++", color: "00599C", logo: "cplusplus", logoColor: "white", category: "languages" },
  { id: "c", label: "C", color: "A8B9CC", logo: "c", logoColor: "black", category: "languages" },
  { id: "php", label: "PHP", color: "777BB4", logo: "php", logoColor: "white", category: "languages" },
  { id: "ruby", label: "Ruby", color: "CC342D", logo: "ruby", logoColor: "white", category: "languages" },
  { id: "swift", label: "Swift", color: "F05138", logo: "swift", logoColor: "white", category: "languages" },
  { id: "dart", label: "Dart", color: "0175C2", logo: "dart", logoColor: "white", category: "languages" },
  { id: "scala", label: "Scala", color: "DC322F", logo: "scala", logoColor: "white", category: "languages" },
  { id: "elixir", label: "Elixir", color: "4B275F", logo: "elixir", logoColor: "white", category: "languages" },
  { id: "haskell", label: "Haskell", color: "5E5086", logo: "haskell", logoColor: "white", category: "languages" },
  { id: "lua", label: "Lua", color: "2C2D72", logo: "lua", logoColor: "white", category: "languages" },
  { id: "r", label: "R", color: "276DC3", logo: "r", logoColor: "white", category: "languages" },
  { id: "julia", label: "Julia", color: "9558B2", logo: "julia", logoColor: "white", category: "languages" },
  { id: "zig", label: "Zig", color: "F7A41D", logo: "zig", logoColor: "black", category: "languages" },
  { id: "solidity", label: "Solidity", color: "363636", logo: "solidity", logoColor: "white", category: "languages" },
  { id: "bash", label: "Bash", color: "121011", logo: "gnubash", logoColor: "white", category: "languages" },
  { id: "sql", label: "SQL", color: "336791", category: "languages" },
  { id: "webassembly", label: "WebAssembly", color: "654FF0", logo: "webassembly", logoColor: "white", category: "languages" },

  // Frontend (28)
  { id: "react", label: "React", color: "20232A", logo: "react", logoColor: "61DAFB", category: "frontend" },
  { id: "nextjs", label: "Next.js", color: "000000", logo: "nextdotjs", logoColor: "white", category: "frontend" },
  { id: "tailwindcss", label: "Tailwind CSS", color: "06B6D4", logo: "tailwindcss", logoColor: "white", category: "frontend" },
  { id: "vue", label: "Vue.js", color: "4FC08D", logo: "vuedotjs", logoColor: "white", category: "frontend" },
  { id: "nuxt", label: "Nuxt", color: "00DC82", logo: "nuxt", logoColor: "white", category: "frontend" },
  { id: "angular", label: "Angular", color: "DD0031", logo: "angular", logoColor: "white", category: "frontend" },
  { id: "svelte", label: "Svelte", color: "FF3E00", logo: "svelte", logoColor: "white", category: "frontend" },
  { id: "solidjs", label: "SolidJS", color: "2C4F7C", logo: "solid", logoColor: "white", category: "frontend" },
  { id: "astro", label: "Astro", color: "BC52EE", logo: "astro", logoColor: "white", category: "frontend" },
  { id: "remix", label: "Remix", color: "121212", logo: "remix", logoColor: "white", category: "frontend" },
  { id: "html5", label: "HTML5", color: "E34F26", logo: "html5", logoColor: "white", category: "frontend" },
  { id: "css", label: "CSS", color: "663399", logo: "css", logoColor: "white", category: "frontend" },
  { id: "sass", label: "Sass", color: "CC6699", logo: "sass", logoColor: "white", category: "frontend" },
  { id: "bootstrap", label: "Bootstrap", color: "7952B3", logo: "bootstrap", logoColor: "white", category: "frontend" },
  { id: "redux", label: "Redux", color: "764ABC", logo: "redux", logoColor: "white", category: "frontend" },
  { id: "vite", label: "Vite", color: "646CFF", logo: "vite", logoColor: "white", category: "frontend" },
  { id: "webpack", label: "Webpack", color: "8DD6F9", logo: "webpack", logoColor: "black", category: "frontend" },
  { id: "storybook", label: "Storybook", color: "FF4785", logo: "storybook", logoColor: "white", category: "frontend" },
  { id: "framer", label: "Motion", color: "0055FF", logo: "framer", logoColor: "white", category: "frontend" },
  { id: "threejs", label: "Three.js", color: "000000", logo: "threedotjs", logoColor: "white", category: "frontend" },
  { id: "shadcnui", label: "shadcn/ui", color: "09090B", logo: "shadcnui", logoColor: "white", category: "frontend" },
  { id: "mui", label: "MUI", color: "007FFF", logo: "mui", logoColor: "white", category: "frontend" },
  { id: "chakraui", label: "Chakra UI", color: "319795", logo: "chakraui", logoColor: "white", category: "frontend" },
  { id: "reactrouter", label: "React Router", color: "CA4245", logo: "reactrouter", logoColor: "white", category: "frontend" },
  { id: "reactquery", label: "TanStack Query", color: "FF4154", logo: "reactquery", logoColor: "white", category: "frontend" },
  { id: "zod", label: "Zod", color: "3E67B1", logo: "zod", logoColor: "white", category: "frontend" },
  { id: "webgl", label: "WebGL", color: "990000", logo: "webgl", logoColor: "white", category: "frontend" },
  { id: "htmx", label: "htmx", color: "3366CC", logo: "htmx", logoColor: "white", category: "frontend" },

  // Backend (22)
  { id: "nodejs", label: "Node.js", color: "339933", logo: "nodedotjs", logoColor: "white", category: "backend" },
  { id: "express", label: "Express.js", color: "000000", logo: "express", logoColor: "white", category: "backend" },
  { id: "nestjs", label: "NestJS", color: "E0234E", logo: "nestjs", logoColor: "white", category: "backend" },
  { id: "fastify", label: "Fastify", color: "000000", logo: "fastify", logoColor: "white", category: "backend" },
  { id: "hono", label: "Hono", color: "E36002", logo: "hono", logoColor: "white", category: "backend" },
  { id: "deno", label: "Deno", color: "70FFAF", logo: "deno", logoColor: "black", category: "backend" },
  { id: "django", label: "Django", color: "092E20", logo: "django", logoColor: "white", category: "backend" },
  { id: "flask", label: "Flask", color: "000000", logo: "flask", logoColor: "white", category: "backend" },
  { id: "fastapi", label: "FastAPI", color: "009688", logo: "fastapi", logoColor: "white", category: "backend" },
  { id: "spring", label: "Spring Boot", color: "6DB33F", logo: "springboot", logoColor: "white", category: "backend" },
  { id: "laravel", label: "Laravel", color: "FF2D20", logo: "laravel", logoColor: "white", category: "backend" },
  { id: "rails", label: "Ruby on Rails", color: "D30001", logo: "rubyonrails", logoColor: "white", category: "backend" },
  { id: "dotnet", label: ".NET", color: "512BD4", logo: "dotnet", logoColor: "white", category: "backend" },
  { id: "graphql", label: "GraphQL", color: "E10098", logo: "graphql", logoColor: "white", category: "backend" },
  { id: "trpc", label: "tRPC", color: "2596BE", logo: "trpc", logoColor: "white", category: "backend" },
  { id: "prisma", label: "Prisma", color: "2D3748", logo: "prisma", logoColor: "white", category: "backend" },
  { id: "drizzle", label: "Drizzle ORM", color: "C5F74F", logo: "drizzle", logoColor: "black", category: "backend" },
  { id: "apollo", label: "Apollo GraphQL", color: "311C87", logo: "apollographql", logoColor: "white", category: "backend" },
  { id: "socketio", label: "Socket.io", color: "010101", logo: "socketdotio", logoColor: "white", category: "backend" },
  { id: "rabbitmq", label: "RabbitMQ", color: "FF6600", logo: "rabbitmq", logoColor: "white", category: "backend" },
  { id: "gin", label: "Gin", color: "008ECF", logo: "gin", logoColor: "white", category: "backend" },
  { id: "fiber", label: "Fiber", color: "00ACD7", category: "backend" },

  // Databases (15)
  { id: "postgresql", label: "PostgreSQL", color: "4169E1", logo: "postgresql", logoColor: "white", category: "databases" },
  { id: "mysql", label: "MySQL", color: "4479A1", logo: "mysql", logoColor: "white", category: "databases" },
  { id: "mariadb", label: "MariaDB", color: "003545", logo: "mariadb", logoColor: "white", category: "databases" },
  { id: "sqlite", label: "SQLite", color: "003B57", logo: "sqlite", logoColor: "white", category: "databases" },
  { id: "mongodb", label: "MongoDB", color: "47A248", logo: "mongodb", logoColor: "white", category: "databases" },
  { id: "redis", label: "Redis", color: "FF4438", logo: "redis", logoColor: "white", category: "databases" },
  { id: "elasticsearch", label: "Elasticsearch", color: "005571", logo: "elasticsearch", logoColor: "white", category: "databases" },
  { id: "supabase", label: "Supabase", color: "3ECF8E", logo: "supabase", logoColor: "white", category: "databases" },
  { id: "firebase", label: "Firebase", color: "DD2C00", logo: "firebase", logoColor: "white", category: "databases" },
  { id: "appwrite", label: "Appwrite", color: "FD366E", logo: "appwrite", logoColor: "white", category: "databases" },
  { id: "cockroachdb", label: "CockroachDB", color: "6933FF", logo: "cockroachlabs", logoColor: "white", category: "databases" },
  { id: "neo4j", label: "Neo4j", color: "4581C3", logo: "neo4j", logoColor: "white", category: "databases" },
  { id: "clickhouse", label: "ClickHouse", color: "FFCC01", logo: "clickhouse", logoColor: "black", category: "databases" },
  { id: "cassandra", label: "Cassandra", color: "1287B1", logo: "apachecassandra", logoColor: "white", category: "databases" },
  { id: "planetscale", label: "PlanetScale", color: "000000", logo: "planetscale", logoColor: "white", category: "databases" },

  // Mobile & Desktop (11)
  { id: "flutter", label: "Flutter", color: "02569B", logo: "flutter", logoColor: "white", category: "mobile" },
  { id: "reactnative", label: "React Native", color: "61DAFB", logo: "react", logoColor: "black", category: "mobile" },
  { id: "android", label: "Android", color: "3DDC84", logo: "android", logoColor: "black", category: "mobile" },
  { id: "ios", label: "iOS", color: "000000", logo: "ios", logoColor: "white", category: "mobile" },
  { id: "apple", label: "macOS / Apple", color: "000000", logo: "apple", logoColor: "white", category: "mobile" },
  { id: "expo", label: "Expo", color: "1C2024", logo: "expo", logoColor: "white", category: "mobile" },
  { id: "ionic", label: "Ionic", color: "3880FF", logo: "ionic", logoColor: "white", category: "mobile" },
  { id: "electron", label: "Electron", color: "47848F", logo: "electron", logoColor: "white", category: "mobile" },
  { id: "tauri", label: "Tauri", color: "24C8DB", logo: "tauri", logoColor: "black", category: "mobile" },
  { id: "capacitor", label: "Capacitor", color: "119EFF", logo: "capacitor", logoColor: "white", category: "mobile" },
  { id: "jetpackcompose", label: "Jetpack Compose", color: "4285F4", logo: "jetpackcompose", logoColor: "white", category: "mobile" },

  // Cloud & DevOps (28)
  { id: "docker", label: "Docker", color: "2496ED", logo: "docker", logoColor: "white", category: "cloud-devops" },
  { id: "kubernetes", label: "Kubernetes", color: "326CE5", logo: "kubernetes", logoColor: "white", category: "cloud-devops" },
  { id: "terraform", label: "Terraform", color: "844FBA", logo: "terraform", logoColor: "white", category: "cloud-devops" },
  { id: "ansible", label: "Ansible", color: "EE0000", logo: "ansible", logoColor: "white", category: "cloud-devops" },
  { id: "githubactions", label: "GitHub Actions", color: "2088FF", logo: "githubactions", logoColor: "white", category: "cloud-devops" },
  { id: "jenkins", label: "Jenkins", color: "D24939", logo: "jenkins", logoColor: "white", category: "cloud-devops" },
  { id: "gitlab", label: "GitLab CI", color: "FC6D26", logo: "gitlab", logoColor: "white", category: "cloud-devops" },
  { id: "circleci", label: "CircleCI", color: "343434", logo: "circleci", logoColor: "white", category: "cloud-devops" },
  { id: "nginx", label: "Nginx", color: "009639", logo: "nginx", logoColor: "white", category: "cloud-devops" },
  { id: "caddy", label: "Caddy", color: "1F88C0", logo: "caddy", logoColor: "white", category: "cloud-devops" },
  { id: "traefik", label: "Traefik", color: "24A1C1", logo: "traefikproxy", logoColor: "white", category: "cloud-devops" },
  { id: "linux", label: "Linux", color: "FCC624", logo: "linux", logoColor: "black", category: "cloud-devops" },
  { id: "ubuntu", label: "Ubuntu", color: "E95420", logo: "ubuntu", logoColor: "white", category: "cloud-devops" },
  { id: "debian", label: "Debian", color: "A81D33", logo: "debian", logoColor: "white", category: "cloud-devops" },
  { id: "archlinux", label: "Arch Linux", color: "1793D1", logo: "archlinux", logoColor: "white", category: "cloud-devops" },
  { id: "git", label: "Git", color: "F05032", logo: "git", logoColor: "white", category: "cloud-devops" },
  { id: "github", label: "GitHub", color: "181717", logo: "github", logoColor: "white", category: "cloud-devops" },
  { id: "aws", label: "AWS", color: "232F3E", category: "cloud-devops" },
  { id: "gcp", label: "Google Cloud", color: "4285F4", logo: "googlecloud", logoColor: "white", category: "cloud-devops" },
  { id: "azure", label: "Azure", color: "0078D4", category: "cloud-devops" },
  { id: "cloudflare", label: "Cloudflare", color: "F38020", logo: "cloudflare", logoColor: "white", category: "cloud-devops" },
  { id: "vercel", label: "Vercel", color: "000000", logo: "vercel", logoColor: "white", category: "cloud-devops" },
  { id: "netlify", label: "Netlify", color: "00C7B7", logo: "netlify", logoColor: "white", category: "cloud-devops" },
  { id: "digitalocean", label: "DigitalOcean", color: "0080FF", logo: "digitalocean", logoColor: "white", category: "cloud-devops" },
  { id: "railway", label: "Railway", color: "0B0D0E", logo: "railway", logoColor: "white", category: "cloud-devops" },
  { id: "render", label: "Render", color: "46E3B7", logo: "render", logoColor: "black", category: "cloud-devops" },
  { id: "helm", label: "Helm", color: "0F1689", logo: "helm", logoColor: "white", category: "cloud-devops" },
  { id: "prometheus", label: "Prometheus", color: "E6522C", logo: "prometheus", logoColor: "white", category: "cloud-devops" },

  // AI & Data (17)
  { id: "tensorflow", label: "TensorFlow", color: "FF6F00", logo: "tensorflow", logoColor: "white", category: "ai-data" },
  { id: "pytorch", label: "PyTorch", color: "EE4C2C", logo: "pytorch", logoColor: "white", category: "ai-data" },
  { id: "keras", label: "Keras", color: "D00000", logo: "keras", logoColor: "white", category: "ai-data" },
  { id: "scikitlearn", label: "scikit-learn", color: "F7931E", logo: "scikitlearn", logoColor: "white", category: "ai-data" },
  { id: "pandas", label: "Pandas", color: "150458", logo: "pandas", logoColor: "white", category: "ai-data" },
  { id: "numpy", label: "NumPy", color: "013243", logo: "numpy", logoColor: "white", category: "ai-data" },
  { id: "jupyter", label: "Jupyter", color: "F37626", logo: "jupyter", logoColor: "white", category: "ai-data" },
  { id: "opencv", label: "OpenCV", color: "5C3EE8", logo: "opencv", logoColor: "white", category: "ai-data" },
  { id: "huggingface", label: "Hugging Face", color: "FFD21E", logo: "huggingface", logoColor: "black", category: "ai-data" },
  { id: "langchain", label: "LangChain", color: "1C3C3C", logo: "langchain", logoColor: "white", category: "ai-data" },
  { id: "ollama", label: "Ollama", color: "000000", logo: "ollama", logoColor: "white", category: "ai-data" },
  { id: "anthropic", label: "Anthropic", color: "191919", logo: "anthropic", logoColor: "white", category: "ai-data" },
  { id: "kafka", label: "Apache Kafka", color: "231F20", logo: "apachekafka", logoColor: "white", category: "ai-data" },
  { id: "spark", label: "Apache Spark", color: "E25A1C", logo: "apachespark", logoColor: "white", category: "ai-data" },
  { id: "airflow", label: "Apache Airflow", color: "017CEE", logo: "apacheairflow", logoColor: "white", category: "ai-data" },
  { id: "grafana", label: "Grafana", color: "F46800", logo: "grafana", logoColor: "white", category: "ai-data" },
  { id: "datadog", label: "Datadog", color: "632CA6", logo: "datadog", logoColor: "white", category: "ai-data" },

  // Testing & QA (10)
  { id: "jest", label: "Jest", color: "C21325", logo: "jest", logoColor: "white", category: "testing" },
  { id: "vitest", label: "Vitest", color: "6E9F18", logo: "vitest", logoColor: "white", category: "testing" },
  { id: "cypress", label: "Cypress", color: "17202C", logo: "cypress", logoColor: "white", category: "testing" },
  { id: "playwright", label: "Playwright", color: "2EAD33", category: "testing" },
  { id: "selenium", label: "Selenium", color: "43B02A", logo: "selenium", logoColor: "white", category: "testing" },
  { id: "testinglibrary", label: "Testing Library", color: "E33332", logo: "testinglibrary", logoColor: "white", category: "testing" },
  { id: "postman", label: "Postman", color: "FF6C37", logo: "postman", logoColor: "white", category: "testing" },
  { id: "insomnia", label: "Insomnia", color: "4000BF", logo: "insomnia", logoColor: "white", category: "testing" },
  { id: "swagger", label: "Swagger", color: "85EA2D", logo: "swagger", logoColor: "black", category: "testing" },
  { id: "sonarqube", label: "SonarQube", color: "4E9BCD", logo: "sonarqubeserver", logoColor: "white", category: "testing" },

  // Design & 3D (12)
  { id: "figma", label: "Figma", color: "F24E1E", logo: "figma", logoColor: "white", category: "design" },
  { id: "blender", label: "Blender", color: "F5792A", logo: "blender", logoColor: "white", category: "design" },
  { id: "sketch", label: "Sketch", color: "F7B500", logo: "sketch", logoColor: "black", category: "design" },
  { id: "gimp", label: "GIMP", color: "5C5543", logo: "gimp", logoColor: "white", category: "design" },
  { id: "inkscape", label: "Inkscape", color: "000000", logo: "inkscape", logoColor: "white", category: "design" },
  { id: "krita", label: "Krita", color: "3BABFF", logo: "krita", logoColor: "white", category: "design" },
  { id: "aseprite", label: "Aseprite", color: "7D929E", logo: "aseprite", logoColor: "white", category: "design" },
  { id: "unity", label: "Unity", color: "000000", logo: "unity", logoColor: "white", category: "design" },
  { id: "unrealengine", label: "Unreal Engine", color: "0E1128", logo: "unrealengine", logoColor: "white", category: "design" },
  { id: "godot", label: "Godot Engine", color: "478CBF", logo: "godotengine", logoColor: "white", category: "design" },
  { id: "photoshop", label: "Photoshop", color: "31A8FF", category: "design" },
  { id: "illustrator", label: "Illustrator", color: "FF9A00", category: "design" },

  // Tools & Workflow (16)
  { id: "pnpm", label: "pnpm", color: "F69220", logo: "pnpm", logoColor: "white", category: "tools" },
  { id: "npm", label: "npm", color: "CB3837", logo: "npm", logoColor: "white", category: "tools" },
  { id: "yarn", label: "Yarn", color: "2C8EBB", logo: "yarn", logoColor: "white", category: "tools" },
  { id: "bun", label: "Bun", color: "000000", logo: "bun", logoColor: "white", category: "tools" },
  { id: "turborepo", label: "Turborepo", color: "EF4444", logo: "turborepo", logoColor: "white", category: "tools" },
  { id: "eslint", label: "ESLint", color: "4B32C3", logo: "eslint", logoColor: "white", category: "tools" },
  { id: "prettier", label: "Prettier", color: "F7B93E", logo: "prettier", logoColor: "black", category: "tools" },
  { id: "neovim", label: "Neovim", color: "57A143", logo: "neovim", logoColor: "white", category: "tools" },
  { id: "vim", label: "Vim", color: "019733", logo: "vim", logoColor: "white", category: "tools" },
  { id: "intellij", label: "IntelliJ IDEA", color: "000000", logo: "intellijidea", logoColor: "white", category: "tools" },
  { id: "notion", label: "Notion", color: "000000", logo: "notion", logoColor: "white", category: "tools" },
  { id: "jira", label: "Jira", color: "0052CC", logo: "jira", logoColor: "white", category: "tools" },
  { id: "linear", label: "Linear", color: "5E6AD2", logo: "linear", logoColor: "white", category: "tools" },
  { id: "obsidian", label: "Obsidian", color: "7C3AED", logo: "obsidian", logoColor: "white", category: "tools" },
  { id: "markdown", label: "Markdown", color: "000000", logo: "markdown", logoColor: "white", category: "tools" },
  { id: "vscode", label: "VS Code", color: "007ACC", category: "tools" },

  // Engineering Skills (18)
  { id: "skill-system-design", label: "System Design", color: "4F46E5", category: "skills" },
  { id: "skill-microservices", label: "Microservices", color: "0EA5E9", category: "skills" },
  { id: "skill-rest-api", label: "REST APIs", color: "10B981", category: "skills" },
  { id: "skill-websockets", label: "WebSockets", color: "6366F1", category: "skills" },
  { id: "skill-cicd", label: "CI/CD Pipelines", color: "2563EB", category: "skills" },
  { id: "skill-clean-arch", label: "Clean Architecture", color: "7C3AED", category: "skills" },
  { id: "skill-tdd", label: "TDD", color: "DC2626", category: "skills" },
  { id: "skill-agile", label: "Agile / Scrum", color: "059669", category: "skills" },
  { id: "skill-ui-ux", label: "UI / UX Design", color: "EC4899", category: "skills" },
  { id: "skill-a11y", label: "Accessibility (a11y)", color: "0284C7", category: "skills" },
  { id: "skill-perf", label: "Web Performance", color: "F59E0B", category: "skills" },
  { id: "skill-security", label: "App Security", color: "B91C1C", category: "skills" },
  { id: "skill-oauth", label: "OAuth 2.0 / JWT", color: "334155", category: "skills" },
  { id: "skill-distributed", label: "Distributed Systems", color: "4338CA", category: "skills" },
  { id: "skill-prompt-eng", label: "AI Agents & RAG", color: "8B5CF6", category: "skills" },
  { id: "skill-devops", label: "Cloud Infrastructure", color: "0369A1", category: "skills" },
  { id: "skill-db-opt", label: "Database Modeling", color: "1D4ED8", category: "skills" },
  { id: "skill-open-source", label: "Open Source", color: "16A34A", category: "skills" },
];

export const DEFAULT_TECH_STACK_CARDS: TechStackCard[] = [
  {
    id: "card-frontend",
    title: "Languages & Frontend",
    badgeIds: ["typescript", "javascript", "react", "nextjs", "tailwindcss"],
  },
  {
    id: "card-backend",
    title: "Backend & Databases",
    badgeIds: ["nodejs", "python", "postgresql", "mongodb", "graphql"],
  },
  {
    id: "card-devops",
    title: "Cloud, DevOps & Design",
    badgeIds: ["docker", "git", "githubactions", "linux", "figma"],
  },
];

const INITIAL_ENABLED_IDS = new Set(
  DEFAULT_TECH_STACK_CARDS.flatMap((c) => c.badgeIds)
);

export const DEFAULT_README_CONFIG: ReadmeConfig = {
  templateId: "cyber-guardian",
  headline: "Your Name | Occupation",
  subtitleTags: [
    "FULL-STACK DEVELOPMENT",
    "SYSTEMS ARCHITECTURE",
    "OPEN SOURCE",
    "UI ENGINEERING",
  ],
  bio: DEFAULT_DUMMY_INTRO,
  ctaLine:
    "Explore my tech stack and live cybernetic profile creature below.",
  telemetryCaptionTemplate: "",
  statsTableTitle: "Cybernetic Telemetry",
  align: "center",
  imageWidth: 760,
  useOutputBranchUrl: false,
  includeMarkers: true,
  includeTelemetryCaption: false,
  includeShareCard: false,
  includeStatsTable: false,
  customSectionTitle: "",
  customFooterMarkdown: "",
  badges: TECH_STACK_CATALOG.map((b) => ({
    ...b,
    enabled: INITIAL_ENABLED_IDS.has(b.id),
  })),
  stackCards: DEFAULT_TECH_STACK_CARDS.map((card) => ({
    ...card,
    badgeIds: [...card.badgeIds],
  })),
  savedOrganizedCards: null,
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
      id: "portfolio",
      label: "PORTFOLIO",
      valueText: "PROJECTS & DOCS",
      url: "https://github.com/{{USERNAME}}?tab=repositories",
      color: "4F46E5",
      logo: "googlechrome",
      enabled: true,
    },
  ],
  profileDisplayName: "Your Name",
  profileStatusBio: "Building clean software & open-source tools.",
  profileLocation: "Worldwide",
  profileCompany: "Independent Developer",
  profileWebsite: "https://github.com/{{USERNAME}}",
  rawOverride: null,
};
