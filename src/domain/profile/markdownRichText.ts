import type { JSONContent } from "@tiptap/react";

export interface EditorTemplateItem {
  id: string;
  name: string;
  category: string;
  description: string;
  markdown: string;
}

export const PROFILE_EDITOR_TEMPLATES: EditorTemplateItem[] = [
  {
    id: "clean-dev",
    name: "Clean developer intro",
    category: "Balanced",
    description: "Clean heading without divider, role line, intro bio and three bullets.",
    markdown: [
      "### Hi, I am @{{USERNAME}}",
      "",
      "**Full-stack developer, systems architecture, open source**",
      "",
      "I build fast, reliable software with `{{LANGUAGES}}` and share open source tools on GitHub. Currently growing Stage {{STAGE}} **{{CREATURE}}** with `{{COMMITS}}` commits.",
      "",
      "- Building scalable web applications and developer tooling",
      "- Focused on clean architecture, interface craft and automation",
      "- Connect with me through the links below",
    ].join("\n"),
  },
  {
    id: "centered-hero",
    name: "Centered hero banner",
    category: "Centered",
    description: "Centered title, subtitle tagline and crisp hero summary.",
    markdown: [
      '<h3 align="center">Hi, I am @{{USERNAME}}</h3>',
      "",
      '<p align="center">',
      "  <strong>Software engineer, open source builder, UI craftsman</strong>",
      "</p>",
      "",
      '<p align="center">',
      "  Crafting resilient web apps, developer tools and automated workflows with <code>{{LANGUAGES}}</code>.",
      "</p>",
      "",
      "---",
      "",
      '<p align="center">',
      "  Stage {{STAGE}} <strong>{{CREATURE}}</strong>, {{RANK}} tier, <code>{{COMMITS}}</code> commits",
      "</p>",
    ].join("\n"),
  },
  {
    id: "fullstack-eng",
    name: "Full-stack engineer",
    category: "Engineering",
    description: "Engineering overview with a clear stack summary table.",
    markdown: [
      "### @{{USERNAME}}, Full-stack software engineer",
      "",
      "Designing products from calm frontends to dependable backend APIs.",
      "",
      "- **Frontend**: Component systems, accessibility, state machines and canvas graphics",
      "- **Backend**: HTTP and GraphQL services, relational data modeling, queues and caching",
      "- **Tooling**: Continuous integration pipelines, static checks and container workflows",
      "",
      "| Domain | Primary tools | Focus |",
      "| --- | --- | --- |",
      "| Product UI | TypeScript, React, Next.js | Fast accessible UX |",
      "| Services | Node.js, PostgreSQL, Docker | Reliable APIs |",
    ].join("\n"),
  },
  {
    id: "oss-maintainer",
    name: "Open source maintainer",
    category: "Open source",
    description: "Mission quote, project table and maintainer checklist.",
    markdown: [
      "### @{{USERNAME}}, Open source maintainer",
      "",
      "> Shipping composable packages, clean APIs and clear documentation.",
      "",
      "| Area | Focus | Status |",
      "| --- | --- | --- |",
      "| Libraries | Developer tooling and zero bloat cores | Active |",
      "| Automation | GitHub Actions and release pipelines | Maintained |",
      "| Primary stack | `{{LANGUAGES}}` | Growing |",
      "",
      "- [x] Automated {{CREATURE}} profile banner (`{{RANK}}`)",
      "- [x] Open to pull requests, code reviews and bug reports",
    ].join("\n"),
  },
  {
    id: "ai-data",
    name: "AI and data engineer",
    category: "AI and ML",
    description: "Research and evaluation workflow with Python code block.",
    markdown: [
      "### @{{USERNAME}}, AI and systems engineer",
      "",
      "Exploring model evaluation pipelines, retrieval architecture and high-throughput data flows.",
      "",
      "1. Benchmarking agent tool reliability and latency budgets",
      "2. Building reproducible evaluation harnesses in `{{LANGUAGES}}`",
      "3. Packaging inference APIs for production workloads",
      "",
      "```python",
      "profile = {",
      '    "handle": "@{{USERNAME}}",',
      '    "companion": "{{CREATURE}} Stage {{STAGE}}",',
      '    "commits": "{{COMMITS}}",',
      "}",
      "```",
    ].join("\n"),
  },
  {
    id: "student-learner",
    name: "Student and learner",
    category: "Learning",
    description: "Friendly bio with interactive learning roadmap checkboxes.",
    markdown: [
      "### Hello, I am @{{USERNAME}}",
      "",
      "Computer science student focused on software engineering, problem solving and shipping real projects each week.",
      "",
      "#### Learning roadmap",
      "",
      "- [x] Core algorithms, Git workflows and TypeScript fundamentals",
      "- [x] Building full-stack applications with modern frameworks",
      "- [ ] Studying distributed systems and compiler design",
      "",
      "Always glad to team up on hackathons and beginner friendly open source issues.",
    ].join("\n"),
  },
  {
    id: "minimalist-zen",
    name: "Minimalist zen",
    category: "Minimal",
    description: "Short airy signature intro with zero clutter.",
    markdown: [
      '<h3 align="center">@{{USERNAME}}</h3>',
      "",
      '<p align="center">',
      "  Software engineer building calm, dependable tools in <code>{{LANGUAGES}}</code>.",
      "</p>",
    ].join("\n"),
  },
  {
    id: "design-engineer",
    name: "UI and design engineer",
    category: "Design",
    description: "Design systems craft philosophy and motion focus highlights.",
    markdown: [
      "### @{{USERNAME}}, Design engineer",
      "",
      "> Bridging design tokens, crisp typography and 60fps interaction engineering.",
      "",
      "- **Design systems**: Composable primitives, keyboard states and semantic tokens",
      "- **Graphics and motion**: Procedural canvas rendering, micro-motion and WebP encoding",
      "- **Everyday stack**: `{{LANGUAGES}}`",
    ].join("\n"),
  },
  {
    id: "terminal-bio",
    name: "Developer terminal card",
    category: "Code",
    description: "Code block developer card displaying live creature values.",
    markdown: [
      "### whoami @{{USERNAME}}",
      "",
      "```ts",
      "export const developer = {",
      '  username: "@{{USERNAME}}",',
      '  stack: "{{LANGUAGES}}",',
      '  companion: "{{CREATURE}}",',
      '  stage: "Stage {{STAGE}} {{RANK}}",',
      '  commits: "{{COMMITS}}",',
      "};",
      "```",
      "",
      "Explore my pinned repositories or reach out below.",
    ].join("\n"),
  },
  {
    id: "freelancer-pro",
    name: "Freelancer and consultant",
    category: "Work",
    description: "Services table, availability checklist and project contact callout.",
    markdown: [
      "### @{{USERNAME}}, Independent software consultant",
      "",
      "Helping startups and product teams move from architecture to production launch.",
      "",
      "| Engagement | Deliverable | Stack |",
      "| --- | --- | --- |",
      "| MVP build | Production web app and CI automation | `{{LANGUAGES}}` |",
      "| Architecture audit | Performance and code health report | Full-stack |",
      "",
      "- [x] Available for select product engineering contracts",
      "- [x] Direct technical advisory and UI modernization",
      "",
      "Reach out through Portfolio or Email below to discuss a project.",
    ].join("\n"),
  },
  {
    id: "terminal-minimal",
    name: "Terminal minimal prompt",
    category: "Code",
    description: "Command prompt style summary for CLI and systems developers.",
    markdown: [
      "### Terminal session for @{{USERNAME}}",
      "",
      "```sh",
      "$ whoami",
      "@{{USERNAME}}",
      "$ stack --top",
      "{{LANGUAGES}}",
      "$ companion --status",
      "{{CREATURE}} Stage {{STAGE}} ({{COMMITS}} commits)",
      "```",
      "",
      "Shipping small, fast command line tools and libraries.",
    ].join("\n"),
  },
  {
    id: "devops-cloud",
    name: "DevOps and cloud engineer",
    category: "Cloud",
    description: "Infrastructure principles, automation table and reliability focus.",
    markdown: [
      "### @{{USERNAME}}, Cloud and DevOps engineer",
      "",
      "**Infrastructure as code, containers, observability**",
      "",
      "Automating deployments, tightening feedback loops and keeping production services calm.",
      "",
      "| Layer | Approach | Outcome |",
      "| --- | --- | --- |",
      "| Provisioning | Declarative modules and policy checks | Repeatable environments |",
      "| Delivery | Automated builds and canary rollouts | Zero downtime deploys |",
      "| Telemetry | Structured logs and OpenTelemetry traces | Fast root cause discovery |",
    ].join("\n"),
  },
  {
    id: "mobile-developer",
    name: "Mobile developer",
    category: "Mobile",
    description: "Cross platform and native mobile app engineering overview.",
    markdown: [
      "### @{{USERNAME}}, Mobile app developer",
      "",
      "**Native feel, offline resilience, smooth frame pacing**",
      "",
      "Building iOS and Android apps with `{{LANGUAGES}}`.",
      "",
      "- Gesture driven navigation and platform native controls",
      "- Local first sync engines and background task scheduling",
      "- Automated UI snapshot testing on real device matrices",
    ].join("\n"),
  },
  {
    id: "game-developer",
    name: "Game developer",
    category: "Games",
    description: "Graphics programming, engine tooling and interactive worlds.",
    markdown: [
      "### @{{USERNAME}}, Game developer and graphics tinkerer",
      "",
      "> Turning shader math, pixel art and frame budgets into playable experiences.",
      "",
      "- Custom 2D sprite pipelines and procedural animation curves",
      "- Entity component systems written in `{{LANGUAGES}}`",
      "- Showcasing {{CREATURE}} (`{{VIEW}}` view) animated in WebP below",
    ].join("\n"),
  },
  {
    id: "technical-writer",
    name: "Technical writer and blogger",
    category: "Writing",
    description: "Editorial focus, guide index table and publication links.",
    markdown: [
      "### @{{USERNAME}}, Software engineer and technical writer",
      "",
      "Writing deep dive guides on `{{LANGUAGES}}`, software architecture and real production trade-offs.",
      "",
      "| Topic | Format | Cadence |",
      "| --- | --- | --- |",
      "| Engineering deep dives | Annotated articles with runnable code | Weekly |",
      "| Developer guides | Reference walkthroughs and diagrams | Biweekly |",
      "",
      "Read recent posts through the blog links below.",
    ].join("\n"),
  },
  {
    id: "backend-architecture",
    name: "Backend architecture notes",
    category: "Engineering",
    description: "Distributed services, storage engines and API contract notes.",
    markdown: [
      "### @{{USERNAME}}, Backend systems engineer",
      "",
      "**High throughput APIs, event streams, data integrity**",
      "",
      "Designing low-latency services and predictable storage schemas with `{{LANGUAGES}}`.",
      "",
      "- Explicit idempotency keys and bounded retries on network calls",
      "- Append-only event logs paired with indexed read projections",
      "- Clear schema migrations and zero lock database rollouts",
    ].join("\n"),
  },
  {
    id: "research-academic",
    name: "Research and academic",
    category: "Research",
    description: "Research interests, reproducible artifact checklist and citations.",
    markdown: [
      "### @{{USERNAME}}, Computing researcher",
      "",
      "*Systems, program verification and machine learning methods*",
      "",
      "Publishing open datasets, reproducible benchmarks and reference implementations in `{{LANGUAGES}}`.",
      "",
      "- [x] Reproducible artifact scripts included in every repository",
      "- [x] Open source benchmark suites with pinned environments",
      "- [ ] Writing upcoming workshop paper and evaluation notes",
    ].join("\n"),
  },
  {
    id: "security-engineer",
    name: "Security engineer",
    category: "Security",
    description: "AppSec posture, threat modeling and supply chain hardening.",
    markdown: [
      "### @{{USERNAME}}, Security engineer",
      "",
      "> Secure defaults reduce risk before code reaches production.",
      "",
      "- Automated dependency auditing, SBOM generation and signed commits",
      "- Threat modeling for browser applications and OAuth flows",
      "- Building zero-server static tools that keep tokens strictly in memory",
    ].join("\n"),
  },
  {
    id: "embedded-hardware",
    name: "Embedded and firmware",
    category: "Systems",
    description: "Microcontrollers, real-time constraints and hardware debugging.",
    markdown: [
      "### @{{USERNAME}}, Embedded and firmware engineer",
      "",
      "Writing deterministic firmware, protocol drivers and test benches close to the hardware.",
      "",
      "```c",
      "const char *owner = \"@{{USERNAME}}\";",
      "const int yearly_commits = 1990;",
      "```",
      "",
      "Working across serial protocols, power profiling and real-time loops.",
    ].join("\n"),
  },
  {
    id: "data-scientist",
    name: "Data analyst and scientist",
    category: "AI and ML",
    description: "Experiment design, feature pipelines and visual storytelling.",
    markdown: [
      "### @{{USERNAME}}, Data scientist",
      "",
      "**Statistical modeling, experiment analysis, visual notebooks**",
      "",
      "Turning messy event streams into clear decisions using `{{LANGUAGES}}`.",
      "",
      "1. Framing clear hypotheses before training models",
      "2. Checking calibration, drift and slice metrics in automated runs",
      "3. Publishing crisp charts alongside open datasets",
    ].join("\n"),
  },
  {
    id: "indie-maker",
    name: "Indie software maker",
    category: "Work",
    description: "Small profitable tools, public changelog habits and shipping fast.",
    markdown: [
      "### Built by @{{USERNAME}}",
      "",
      "**Independent maker, small software, public roadmap**",
      "",
      "Shipping focused utilities for developers with `{{LANGUAGES}}`. Backed by `{{COMMITS}}` commits and Stage {{STAGE}} {{CREATURE}}.",
      "",
      "- Small team of one from research to support",
      "- Fast static exports that run directly in your browser",
      "- Open source code whenever possible",
    ].join("\n"),
  },
  {
    id: "developer-advocate",
    name: "Developer advocate",
    category: "Open source",
    description: "Workshops, starter kits and community office hours.",
    markdown: [
      "### @{{USERNAME}}, Developer advocate",
      "",
      "Helping developers adopt modern tooling through starter templates, live talks and sample repositories.",
      "",
      "- Hands-on workshops and recorded walkthroughs",
      "- Minimal starter kits written in `{{LANGUAGES}}`",
      "- Open community office hours for feedback and triage",
    ].join("\n"),
  },
  {
    id: "creative-coder",
    name: "Creative coder and shaders",
    category: "Design",
    description: "Generative geometry, pixel shaders and procedural canvas art.",
    markdown: [
      '<h3 align="center">@{{USERNAME}} builds generative graphics</h3>',
      "",
      '<p align="center">',
      "  Exploring cellular automata, signed distance fields and procedural pixel animation in <code>{{LANGUAGES}}</code>.",
      "</p>",
      "",
      '<p align="center">',
      "  Live {{CREATURE}} in {{VIEW}} view reacting to <code>{{COMMITS}}</code> contributions.",
      "</p>",
    ].join("\n"),
  },
  {
    id: "sre-reliability",
    name: "Site reliability engineer",
    category: "Cloud",
    description: "Error budgets, incident response playbooks and load testing.",
    markdown: [
      "### @{{USERNAME}}, Site reliability engineer",
      "",
      "> Reliability comes from clear failure boundaries, not heroic paging.",
      "",
      "| Practice | Metric | Goal |",
      "| --- | --- | --- |",
      "| Latency budgets | p99 response time | Under 120 ms |",
      "| Deployments | Canary rollback time | Under 60 seconds |",
      "| Automation | Toil eliminated per quarter | Measured weekly |",
    ].join("\n"),
  },
  {
    id: "quality-automation",
    name: "Quality and test engineer",
    category: "Engineering",
    description: "End to end browser suites, contract tests and accessibility audits.",
    markdown: [
      "### @{{USERNAME}}, Quality engineering lead",
      "",
      "**Browser automation, visual diffs, contract tests**",
      "",
      "Catching regressions early in CI with deterministic test suites built in `{{LANGUAGES}}`.",
      "",
      "- Cross viewport layout verification from 390px mobile to desktop",
      "- Accessible keyboard and focus checks built into every run",
      "- Fast visual diff artifacts on every pull request",
    ].join("\n"),
  },
  {
    id: "protocol-crypto",
    name: "Protocol and networking engineer",
    category: "Systems",
    description: "Peer to peer transports, binary framing and consensus primitives.",
    markdown: [
      "### @{{USERNAME}}, Network protocol engineer",
      "",
      "Building fault tolerant messaging protocols, wire formats and compact binary encoders in `{{LANGUAGES}}`.",
      "",
      "- Zero copy framing parsers with property based fuzz testing",
      "- End to end authenticated channels and peer discovery",
      "- Reproducible network simulations under packet loss",
    ].join("\n"),
  },
  {
    id: "engineering-lead",
    name: "Engineering manager and builder",
    category: "Balanced",
    description: "Calm engineering culture, architectural mentorship and hands-on PRs.",
    markdown: [
      "### @{{USERNAME}}, Engineering lead",
      "",
      "Growing high-trust product teams while staying close to architecture, code review and shipping software in `{{LANGUAGES}}`.",
      "",
      "- Writing clear technical RFCs before large migrations",
      "- Protecting deep focus time for engineers",
      "- Mentoring staff and senior contributors across stacks",
    ].join("\n"),
  },
  {
    id: "compiler-pl",
    name: "Compilers and language tooling",
    category: "Code",
    description: "Parsers, type checkers, AST transforms and language servers.",
    markdown: [
      "### @{{USERNAME}}, Compilers and developer tools",
      "",
      "Obsessed with fast parsers, helpful type error messages and snappy editor language servers.",
      "",
      "```txt",
      "source -> lexer -> parser -> typecheck -> ir -> codegen",
      "```",
      "",
      "Currently hacking with `{{LANGUAGES}}` (`{{COMMITS}}` commits).",
    ].join("\n"),
  },
  {
    id: "accessibility-web",
    name: "Accessibility specialist",
    category: "Design",
    description: "Semantic HTML, WCAG contrast verification and screen reader QA.",
    markdown: [
      "### @{{USERNAME}}, Web accessibility engineer",
      "",
      "> Inclusive software works smoothly with keyboard, mouse, touch and assistive technology.",
      "",
      "- Keyboard navigation audits without visual clutter or focus traps",
      "- High contrast semantic tokens tested in light and dark modes",
      "- Reduced motion fallbacks for all animated canvas and CSS layers",
    ].join("\n"),
  },
  {
    id: "civic-open-data",
    name: "Open data and civic tech",
    category: "Open source",
    description: "Public datasets, map visualizers and transparent community tools.",
    markdown: [
      "### @{{USERNAME}}, Civic software builder",
      "",
      "Opening public transit, climate and municipal datasets with accessible web apps written in `{{LANGUAGES}}`.",
      "",
      "- [x] Lightweight static maps that load quickly on slow connections",
      "- [x] Open JSON exports documented for journalists and researchers",
      "- [ ] Expanding neighborhood dataset coverage",
    ].join("\n"),
  },
  {
    id: "minimal-one-screen",
    name: "Minimal one screen",
    category: "Minimal",
    description: "Single-screen intro with name, focus and two links.",
    markdown: [
      "### @{{USERNAME}}",
      "",
      "Building calm software with `{{LANGUAGES}}`.",
      "",
      "[GitHub](https://github.com/{{USERNAME}}) and [Repositories](https://github.com/{{USERNAME}}?tab=repositories)",
    ].join("\n"),
  },
  {
    id: "newspaper-front-page",
    name: "Newspaper front page",
    category: "Writing",
    description: "Broadsheet layout with headline, lead and dispatches.",
    markdown: [
      "# The Daily Build",
      "",
      "**Edition by @{{USERNAME}}**",
      "",
      "### Lead story",
      "",
      "Shipping reliable web tools in `{{LANGUAGES}}` with `{{COMMITS}}` commits recorded this year.",
      "",
      "### Short dispatches",
      "",
      "- **Current focus**: Clear interfaces, fast pages and small dependencies.",
      "- **Open work**: Maintaining `{{TOP_REPO}}` and documenting lessons learned.",
    ].join("\n"),
  },
  {
    id: "retro-terminal",
    name: "Retro terminal",
    category: "Code",
    description: "Classic CRT status readout with uptime and tasks.",
    markdown: [
      "```txt",
      "SYSTEM READY",
      "USER     @{{USERNAME}}",
      "STACK    {{LANGUAGES}}",
      "COMMITS  {{COMMITS}}",
      "STATUS   ONLINE AND BUILDING",
      "```",
      "",
      "Drop by [my repositories](https://github.com/{{USERNAME}}?tab=repositories) to inspect recent builds.",
    ].join("\n"),
  },
  {
    id: "product-engineer",
    name: "Product engineer",
    category: "Engineering",
    description: "Customer-focused builder pairing UX polish with speed.",
    markdown: [
      "### @{{USERNAME}}, Product engineer",
      "",
      "I bridge product discovery, interface craft and full-stack delivery using `{{LANGUAGES}}`.",
      "",
      "- Talking directly with users before writing code",
      "- Prototyping flows in production-ready components",
      "- Measuring adoption and simplifying rough edges",
    ].join("\n"),
  },
  {
    id: "teacher-mentor",
    name: "Teacher and mentor",
    category: "Learning",
    description: "Workshops, office hours and beginner-friendly guides.",
    markdown: [
      "### @{{USERNAME}}, Educator and mentor",
      "",
      "Helping new developers build confidence with `{{LANGUAGES}}`, clear mental models and hands-on projects.",
      "",
      "- Running weekly code walkthroughs and debugging sessions",
      "- Writing step-by-step starter guides with zero jargon",
      "- Reviewing first pull requests for open source contributors",
    ].join("\n"),
  },
  {
    id: "speaker-podcaster",
    name: "Speaker and podcaster",
    category: "Writing",
    description: "Conference talks, podcast episodes and slide decks.",
    markdown: [
      "### @{{USERNAME}}, Speaker and host",
      "",
      "Sharing practical lessons on software craft, developer tools and team habits.",
      "",
      "- **Recent talk**: Designing predictable state machines for web apps",
      "- **Podcast**: Conversations with builders behind open source tools",
      "- **Slides**: Published alongside demo repos in `{{LANGUAGES}}`",
    ].join("\n"),
  },
  {
    id: "audio-dsp",
    name: "Audio and DSP builder",
    category: "Systems",
    description: "Digital signal processing, synths and audio tools.",
    markdown: [
      "### @{{USERNAME}}, Audio software developer",
      "",
      "Building low-latency synthesizers, filters and real-time audio plugins in `{{LANGUAGES}}`.",
      "",
      "- Lock-free ring buffers and deterministic audio threads",
      "- Custom Web Audio and native DSP experiments",
      "- Clean knobs, meters and spectrum visualizers",
    ].join("\n"),
  },
  {
    id: "robotics-builder",
    name: "Robotics engineer",
    category: "Systems",
    description: "Autonomous motion, sensor fusion and control loops.",
    markdown: [
      "### @{{USERNAME}}, Robotics and control",
      "",
      "Working on state estimation, path planning and embedded telemetry using `{{LANGUAGES}}`.",
      "",
      "- Sensor calibration and real-time PID tuning",
      "- Simulation harnesses for reproducible field tests",
      "- Hardware bring-up logs and wiring notes",
    ].join("\n"),
  },
  {
    id: "climate-tech",
    name: "Climate tech builder",
    category: "Research",
    description: "Energy modeling, grid telemetry and carbon data.",
    markdown: [
      "### @{{USERNAME}}, Climate software",
      "",
      "Applying `{{LANGUAGES}}` to clean grid analytics, building efficiency tools and open environmental datasets.",
      "",
      "- Time-series pipelines for solar and battery telemetry",
      "- Open models for estimating regional grid intensity",
      "- Clear dashboards for local sustainability teams",
    ].join("\n"),
  },
  {
    id: "weekend-tinkerer",
    name: "Weekend tinkerer",
    category: "Balanced",
    description: "Small hardware hacks, scripts and side experiments.",
    markdown: [
      "### @{{USERNAME}}, Curious builder",
      "",
      "Spending weekends on small scripts, desk gadgets and playful experiments in `{{LANGUAGES}}`.",
      "",
      "{{CREATURE_STAGE}}",
      "",
      "- `{{COMMITS}}` commits across side projects and utilities",
      "- Always happy to trade notes on `{{TOP_REPO}}`",
    ].join("\n"),
  },
];

function escapeHtmlText(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtmlAttr(text: string): string {
  return escapeHtmlText(text).replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function sanitizeHref(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:/i.test(trimmed) ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("./") ||
    trimmed.includes("{{USERNAME}}")
  ) {
    return trimmed;
  }
  return "#";
}

function sanitizeImageSrc(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  return null;
}

export function resolveImageDisplaySrc(
  rawSrc: string,
  imageUrlMap?: Record<string, string>
): { displaySrc: string; repoPath: string | null } | null {
  const trimmed = rawSrc.trim();
  if (imageUrlMap) {
    const cleanRel = trimmed.replace(/^\.\//, "");
    const mapped =
      imageUrlMap[trimmed] ?? imageUrlMap[`./${cleanRel}`] ?? imageUrlMap[cleanRel];
    if (mapped) {
      return {
        displaySrc: mapped,
        repoPath: `./${cleanRel}`,
      };
    }
  }
  const safe = sanitizeImageSrc(trimmed);
  if (!safe) return null;
  return { displaySrc: safe, repoPath: null };
}

function parseTagAttr(attrText: string, attrName: string): string {
  const match = attrText.match(
    new RegExp(`${attrName}=["']([^"']*)["']`, "i")
  );
  return match?.[1] ?? "";
}

function renderHtmlImgTag(
  rawSrc: string,
  alt: string,
  imageUrlMap?: Record<string, string>
): string | null {
  const resolved = resolveImageDisplaySrc(rawSrc, imageUrlMap);
  if (!resolved) return null;
  const repoAttr = resolved.repoPath
    ? ` data-repo-path="${escapeHtmlAttr(resolved.repoPath)}"`
    : "";
  return `<img src="${escapeHtmlAttr(resolved.displaySrc)}"${repoAttr} alt="${escapeHtmlAttr(alt)}" />`;
}

function convertPlainInlineMarkdown(
  raw: string,
  imageUrlMap?: Record<string, string>
): string {
  let result = "";
  const tokenRegex =
    /(`[^`]+`|!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|~~[^~]+~~|\*[^*]+\*)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(raw)) !== null) {
    if (match.index > lastIdx) {
      result += escapeHtmlText(raw.slice(lastIdx, match.index));
    }
    const token = match[0];

    if (token.startsWith("`") && token.endsWith("`")) {
      result += `<code>${escapeHtmlText(token.slice(1, -1))}</code>`;
    } else if (token.startsWith("![")) {
      const m = token.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      const imgTag = m ? renderHtmlImgTag(m[2], m[1], imageUrlMap) : null;
      if (imgTag) {
        result += imgTag;
      } else {
        result += escapeHtmlText(token);
      }
    } else if (token.startsWith("[")) {
      const m = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) {
        result += `<a href="${escapeHtmlAttr(sanitizeHref(m[2]))}">${convertPlainInlineMarkdown(m[1], imageUrlMap)}</a>`;
      } else {
        result += escapeHtmlText(token);
      }
    } else if (token.startsWith("**") && token.endsWith("**")) {
      result += `<strong>${convertPlainInlineMarkdown(token.slice(2, -2), imageUrlMap)}</strong>`;
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      result += `<del>${convertPlainInlineMarkdown(token.slice(2, -2), imageUrlMap)}</del>`;
    } else if (token.startsWith("*") && token.endsWith("*")) {
      result += `<em>${convertPlainInlineMarkdown(token.slice(1, -1), imageUrlMap)}</em>`;
    } else {
      result += escapeHtmlText(token);
    }
    lastIdx = match.index + token.length;
  }

  if (lastIdx < raw.length) {
    result += escapeHtmlText(raw.slice(lastIdx));
  }
  return result;
}

function convertInlineMixedToHtml(
  raw: string,
  imageUrlMap?: Record<string, string>
): string {
  const htmlTokenRegex =
    /(<br\s*\/?>|<img\b[^>]*\/?>|<a\b([^>]*)>([\s\S]*?)<\/a>|<(strong|b|em|i|u|ins|del|s|code)>([\s\S]*?)<\/\4>)/gi;
  let out = "";
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = htmlTokenRegex.exec(raw)) !== null) {
    if (match.index > lastIdx) {
      out += convertPlainInlineMarkdown(raw.slice(lastIdx, match.index), imageUrlMap);
    }

    const full = match[0];
    if (/^<br/i.test(full)) {
      out += "<br />";
    } else if (/^<img/i.test(full)) {
      const alt = parseTagAttr(full, "alt");
      const imgTag = renderHtmlImgTag(parseTagAttr(full, "src"), alt, imageUrlMap);
      if (imgTag) {
        out += imgTag;
      }
    } else if (/^<a\b/i.test(full)) {
      const attrs = match[2] || "";
      const inner = match[3] || "";
      const href = sanitizeHref(parseTagAttr(attrs, "href"));
      out += `<a href="${escapeHtmlAttr(href)}">${convertInlineMixedToHtml(inner, imageUrlMap)}</a>`;
    } else {
      const rawTag = (match[4] || "").toLowerCase();
      const inner = match[5] || "";
      const tagMap: Record<string, string> = {
        strong: "strong",
        b: "strong",
        em: "em",
        i: "em",
        u: "u",
        ins: "u",
        del: "del",
        s: "del",
        code: "code",
      };
      const tag = tagMap[rawTag] || "span";
      out +=
        tag === "code"
          ? `<code>${escapeHtmlText(inner)}</code>`
          : `<${tag}>${convertInlineMixedToHtml(inner, imageUrlMap)}</${tag}>`;
    }

    lastIdx = match.index + full.length;
  }

  if (lastIdx < raw.length) {
    out += convertPlainInlineMarkdown(raw.slice(lastIdx), imageUrlMap);
  }
  return out;
}

function splitTableCells(row: string): string[] {
  return row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\|?(\s*:?-{3,}:?\s*\|)+(\s*:?-{3,}:?\s*)?\|?$/.test(line.trim());
}

export function markdownToEditorHtml(
  markdown: string,
  imageUrlMap?: Record<string, string>
): string {
  const source = (markdown || "").trim();
  if (!source) return "<p></p>";

  const lines = source.split(/\r?\n/);
  const blocks: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Fenced code block
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      let j = i + 1;
      while (j < lines.length && !lines[j].trim().startsWith("```")) {
        codeLines.push(lines[j]);
        j++;
      }
      const cls = lang ? ` class="language-${escapeHtmlAttr(lang)}"` : "";
      blocks.push(`<pre><code${cls}>${escapeHtmlText(codeLines.join("\n"))}</code></pre>`);
      i = j;
      continue;
    }

    // HTML Heading <h1..4 align="...">...</h1>
    const htmlHeadingSingle = trimmed.match(
      /^<h([1-4])(?:\s+[^>]*align=["'](left|center|right)["'][^>]*)?>([\s\S]*)<\/h\1>$/i
    );
    if (htmlHeadingSingle) {
      const level = htmlHeadingSingle[1];
      const align = htmlHeadingSingle[2]?.toLowerCase();
      const inner = htmlHeadingSingle[3].trim();
      const style = align ? ` style="text-align: ${align}"` : "";
      blocks.push(
        `<h${level}${style}>${convertInlineMixedToHtml(inner, imageUrlMap)}</h${level}>`
      );
      continue;
    }

    // HTML Paragraph <p align="...">...</p> (single or multi-line)
    const htmlParaSingle = trimmed.match(
      /^<p(?:\s+[^>]*align=["'](left|center|right)["'][^>]*)?>([\s\S]*)<\/p>$/i
    );
    if (htmlParaSingle) {
      const align = htmlParaSingle[1]?.toLowerCase();
      const inner = htmlParaSingle[2].trim();
      const style = align ? ` style="text-align: ${align}"` : "";
      blocks.push(`<p${style}>${convertInlineMixedToHtml(inner, imageUrlMap)}</p>`);
      continue;
    }

    const htmlParaStart = trimmed.match(
      /^<p(?:\s+[^>]*align=["'](left|center|right)["'][^>]*)?>$/i
    );
    if (htmlParaStart) {
      const align = htmlParaStart[1]?.toLowerCase();
      const innerLines: string[] = [];
      let j = i + 1;
      while (j < lines.length && !/<\/p>/i.test(lines[j])) {
        innerLines.push(lines[j].trim());
        j++;
      }
      const style = align ? ` style="text-align: ${align}"` : "";
      const joined = innerLines
        .filter(Boolean)
        .map((l) => convertInlineMixedToHtml(l, imageUrlMap))
        .join("<br />");
      blocks.push(`<p${style}>${joined}</p>`);
      i = j;
      continue;
    }

    // GFM Markdown table
    if (
      trimmed.includes("|") &&
      i + 1 < lines.length &&
      isTableSeparator(lines[i + 1])
    ) {
      const headers = splitTableCells(trimmed);
      const bodyRows: string[][] = [];
      let j = i + 2;
      while (j < lines.length && lines[j].trim().includes("|")) {
        bodyRows.push(splitTableCells(lines[j]));
        j++;
      }
      const thHtml = headers
        .map((h) => `<th><p>${convertInlineMixedToHtml(h, imageUrlMap)}</p></th>`)
        .join("");
      const bodyHtml = bodyRows
        .map((cells) => {
          const tds = headers
            .map(
              (_, cIdx) =>
                `<td><p>${convertInlineMixedToHtml(cells[cIdx] ?? "", imageUrlMap)}</p></td>`
            )
            .join("");
          return `<tr>${tds}</tr>`;
        })
        .join("");
      blocks.push(
        `<table><thead><tr>${thHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`
      );
      i = j - 1;
      continue;
    }

    // Horizontal rule
    if (/^(---+|\*\*\*+)$/.test(trimmed)) {
      blocks.push("<hr />");
      continue;
    }

    // Markdown headings
    const mdHeading = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (mdHeading) {
      const lvl = mdHeading[1].length;
      blocks.push(
        `<h${lvl}>${convertInlineMixedToHtml(mdHeading[2].trim(), imageUrlMap)}</h${lvl}>`
      );
      continue;
    }

    // Task list
    if (/^[-*]\s+\[[ xX]\]\s+/.test(trimmed)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length) {
        const m = lines[j].trim().match(/^[-*]\s+\[([ xX])\]\s+(.*)$/);
        if (!m) break;
        const checked = m[1].toLowerCase() === "x";
        items.push(
          `<li data-type="taskItem" data-checked="${checked}"><p>${convertInlineMixedToHtml(m[2], imageUrlMap)}</p></li>`
        );
        j++;
      }
      blocks.push(`<ul data-type="taskList">${items.join("")}</ul>`);
      i = j - 1;
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length) {
        const t = lines[j].trim();
        if (/^[-*]\s+\[[ xX]\]\s+/.test(t)) break;
        const m = t.match(/^[-*]\s+(.*)$/);
        if (!m) break;
        items.push(`<li><p>${convertInlineMixedToHtml(m[1], imageUrlMap)}</p></li>`);
        j++;
      }
      blocks.push(`<ul>${items.join("")}</ul>`);
      i = j - 1;
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length) {
        const m = lines[j].trim().match(/^\d+\.\s+(.*)$/);
        if (!m) break;
        items.push(`<li><p>${convertInlineMixedToHtml(m[1], imageUrlMap)}</p></li>`);
        j++;
      }
      blocks.push(`<ol>${items.join("")}</ol>`);
      i = j - 1;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      let j = i;
      while (j < lines.length && lines[j].trim().startsWith(">")) {
        quoteLines.push(lines[j].trim().replace(/^>\s?/, ""));
        j++;
      }
      const qParagraphs = quoteLines
        .map((q) => `<p>${convertInlineMixedToHtml(q, imageUrlMap)}</p>`)
        .join("");
      blocks.push(`<blockquote>${qParagraphs}</blockquote>`);
      i = j - 1;
      continue;
    }

    // Regular paragraph
    const paraLines: string[] = [trimmed];
    let j = i + 1;
    while (j < lines.length) {
      const nextTrim = lines[j].trim();
      if (
        !nextTrim ||
        nextTrim.startsWith("```") ||
        /^(#{1,4})\s+/.test(nextTrim) ||
        /^(---+|\*\*\*+)$/.test(nextTrim) ||
        /^[-*]\s+/.test(nextTrim) ||
        /^\d+\.\s+/.test(nextTrim) ||
        nextTrim.startsWith(">") ||
        /^<(?:h[1-4]|p)(?:\s|>)/i.test(nextTrim) ||
        (nextTrim.includes("|") &&
          j + 1 < lines.length &&
          isTableSeparator(lines[j + 1]))
      ) {
        break;
      }
      paraLines.push(nextTrim);
      j++;
    }
    blocks.push(
      `<p>${paraLines.map((l) => convertInlineMixedToHtml(l, imageUrlMap)).join(" ")}</p>`
    );
    i = j - 1;
  }

  return blocks.length > 0 ? blocks.join("") : "<p></p>";
}

function serializeTextWithMarks(
  node: JSONContent,
  htmlMode: boolean
): string {
  const rawText = node.text ?? "";
  const marks = node.marks ?? [];
  const hasCode = marks.some((m) => m.type === "code");

  let out = htmlMode ? escapeHtmlText(rawText) : rawText;

  if (hasCode) {
    if (htmlMode) {
      out = `<code>${out}</code>`;
    } else {
      const fence = rawText.includes("`") ? "``" : "`";
      out =
        fence.length === 2
          ? `\`\` ${rawText} \`\``
          : `\`${rawText}\``;
    }
  }

  const orderedMarkTypes = ["bold", "italic", "strike", "underline", "link"];
  for (const type of orderedMarkTypes) {
    const mark = marks.find((m) => m.type === type);
    if (!mark) continue;
    if (type === "bold") {
      out = htmlMode ? `<strong>${out}</strong>` : `**${out}**`;
    } else if (type === "italic") {
      out = htmlMode ? `<em>${out}</em>` : `*${out}*`;
    } else if (type === "strike") {
      out = htmlMode ? `<del>${out}</del>` : `~~${out}~~`;
    } else if (type === "underline") {
      out = `<u>${out}</u>`;
    } else if (type === "link") {
      const href = sanitizeHref(String(mark.attrs?.href ?? "#"));
      out = htmlMode
        ? `<a href="${escapeHtmlAttr(href)}">${out}</a>`
        : `[${out}](${href})`;
    }
  }

  return out;
}

function getSerializableImageSrc(node: JSONContent): string | null {
  const preferred = node.attrs?.repoPath ?? node.attrs?.src ?? "";
  return sanitizeImageSrc(String(preferred));
}

function serializeInlineContent(
  nodes: JSONContent[] | undefined,
  htmlMode: boolean
): string {
  if (!nodes || nodes.length === 0) return "";
  return nodes
    .map((child) => {
      if (child.type === "text") {
        return serializeTextWithMarks(child, htmlMode);
      }
      if (child.type === "hardBreak") {
        return htmlMode ? "<br />" : "  \n";
      }
      if (child.type === "image") {
        const src = getSerializableImageSrc(child);
        const alt = String(child.attrs?.alt ?? "");
        if (!src) return "";
        return htmlMode
          ? `<img src="${escapeHtmlAttr(src)}" alt="${escapeHtmlAttr(alt)}" />`
          : `![${alt}](${src})`;
      }
      return child.content ? serializeInlineContent(child.content, htmlMode) : "";
    })
    .join("");
}

function serializeListNode(
  listNode: JSONContent,
  depth = 0
): string {
  const isOrdered = listNode.type === "orderedList";
  const isTask = listNode.type === "taskList";
  const startNum = Number(listNode.attrs?.start ?? 1);
  const indent = "  ".repeat(depth);
  const lines: string[] = [];

  (listNode.content ?? []).forEach((item, idx) => {
    const bullet = isTask
      ? `- [${item.attrs?.checked ? "x" : " "}] `
      : isOrdered
        ? `${startNum + idx}. `
        : "- ";

    const childBlocks = item.content ?? [];
    const firstInline =
      childBlocks[0]?.type === "paragraph"
        ? serializeInlineContent(childBlocks[0].content, false).trim()
        : "";
    lines.push(`${indent}${bullet}${firstInline}`);

    for (let k = 1; k < childBlocks.length; k++) {
      const sub = childBlocks[k];
      if (
        sub.type === "bulletList" ||
        sub.type === "orderedList" ||
        sub.type === "taskList"
      ) {
        lines.push(serializeListNode(sub, depth + 1));
      } else if (sub.type === "paragraph") {
        const subText = serializeInlineContent(sub.content, false).trim();
        if (subText) lines.push(`${indent}  ${subText}`);
      }
    }
  });

  return lines.join("\n");
}

function serializeTableNode(tableNode: JSONContent): string {
  const rows = tableNode.content ?? [];
  if (rows.length === 0) return "";

  const matrix = rows.map((row) =>
    (row.content ?? []).map((cell) => {
      const inner = (cell.content ?? [])
        .map((blk) => serializeInlineContent(blk.content, false).trim())
        .filter(Boolean)
        .join("<br />");
      return inner.replaceAll("|", "\\|");
    })
  );

  const colCount = Math.max(1, ...matrix.map((r) => r.length));
  const normalizeRow = (cells: string[]) =>
    `| ${Array.from({ length: colCount }, (_, idx) => cells[idx] ?? "").join(" | ")} |`;

  const headerLine = normalizeRow(matrix[0] ?? []);
  const sepLine = `| ${Array.from({ length: colCount }, () => "---").join(" | ")} |`;
  const bodyLines = matrix.slice(1).map(normalizeRow);
  return [headerLine, sepLine, ...bodyLines].join("\n");
}

function serializeBlockNode(node: JSONContent): string {
  const type = node.type;
  const align = String(node.attrs?.textAlign ?? "left");
  const isCustomAlign = align === "center" || align === "right";

  if (type === "heading") {
    const level = Math.min(4, Math.max(1, Number(node.attrs?.level ?? 3)));
    if (isCustomAlign) {
      const inner = serializeInlineContent(node.content, true).trim();
      return inner ? `<h${level} align="${align}">${inner}</h${level}>` : "";
    }
    const inner = serializeInlineContent(node.content, false).trim();
    return inner ? `${"#".repeat(level)} ${inner}` : "";
  }

  if (type === "paragraph") {
    if (isCustomAlign) {
      const inner = serializeInlineContent(node.content, true).trim();
      return inner ? `<p align="${align}">\n  ${inner}\n</p>` : "";
    }
    return serializeInlineContent(node.content, false).trim();
  }

  if (
    type === "bulletList" ||
    type === "orderedList" ||
    type === "taskList"
  ) {
    return serializeListNode(node);
  }

  if (type === "blockquote") {
    const innerBlocks = (node.content ?? [])
      .map(serializeBlockNode)
      .filter(Boolean)
      .join("\n\n");
    if (!innerBlocks) return "";
    return innerBlocks
      .split("\n")
      .map((l) => (l ? `> ${l}` : ">"))
      .join("\n");
  }

  if (type === "codeBlock") {
    const lang = String(node.attrs?.language ?? "").trim();
    const rawCode = (node.content ?? []).map((n) => n.text ?? "").join("");
    return `\`\`\`${lang}\n${rawCode}\n\`\`\``;
  }

  if (type === "horizontalRule") {
    return "---";
  }

  if (type === "image") {
    const src = getSerializableImageSrc(node);
    if (!src) return "";
    const alt = String(node.attrs?.alt ?? "");
    return `![${alt}](${src})`;
  }

  if (type === "table") {
    return serializeTableNode(node);
  }

  return (node.content ?? []).map(serializeBlockNode).filter(Boolean).join("\n\n");
}

export function tiptapJsonToGithubMarkdown(doc: JSONContent): string {
  const blocks = (doc.content ?? []).map(serializeBlockNode).filter(Boolean);
  return blocks.join("\n\n").trim();
}
