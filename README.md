![DirtyReadme landing hero](docs/screenshots/landing-hero.png)

# DirtyReadme

Build your GitHub README fast and push it in one click.

> This is an open source project. Issues, ideas and pull requests are welcome.

- [Live site](https://pathumsandeepa.github.io/DirtyReadme/)
- [GitHub repository](https://github.com/PathumSandeepa/DirtyReadme)

## Why DirtyReadme

Most developers want a clean, informative GitHub profile README without spending an evening fighting raw HTML tables, broken badge URLs or local build tools. DirtyReadme lets anyone open a browser, inspect their public profile, customize a README in a live visual editor and push it directly to GitHub in one commit. Everything runs in the browser with nothing to install.

## Screenshots

### Landing page

![DirtyReadme landing page](docs/screenshots/landing-hero.png)

### Live editor

![DirtyReadme live editor](docs/screenshots/editor.png)

### Template gallery

![DirtyReadme template gallery](docs/screenshots/template-gallery.png)

### Publish flow

![DirtyReadme publish page](docs/screenshots/publish.png)

## Features

- **Live visual editor**: Write and format headings, lists, links, code blocks and tables directly at GitHub width with TipTap 3.
- **README parts map**: Jump between header, about, tech stack, links, custom images and optional sections from the left sidebar.
- **40 starter templates**: Filter by category, search by keyword, preview full layouts and either replace your draft or insert below.
- **200 plus tech badges with drag and drop**: Search curated stack badges, drag them between groups, add custom badges and reorder sections.
- **Link buttons**: Add portfolio, blog, social and contact links with platform icons and labels.
- **Custom images**: Upload images, crop them in the browser and convert them to lightweight WebP files committed under `readme-assets`.
- **Undo, redo and clear all**: Step backward and forward across editor, form and inspector changes, or reset safely with confirmation.
- **Light and dark preview**: Switch between GitHub light and dark surfaces while editing.
- **Publish with one push**: Commit your README, assets and optional workflow files to your profile repository straight from the browser.
- **Optional daily auto update**: Pick a time of day and time zone to refresh dynamic stats and creature telemetry on a GitHub Actions schedule.
- **Optional animated pixel creature**: Turn on a pixel creature banner that evolves with your commit count if you want a playful extra on your profile.

## How it works

1. **Connect**: Enter your GitHub username or profile URL to load your public languages, commit counts and any existing README setup.
2. **Repository**: Check that your public `username/username` profile repository exists, or follow the guided steps to create it on GitHub.
3. **Customize**: Pick a starter template or edit every part of your README in the live visual editor.
4. **Publish**: Review your files, paste a temporary GitHub Personal Access Token and push everything in one atomic commit.

## Privacy and security

DirtyReadme runs completely in your browser with no backend server. Your GitHub Personal Access Token is kept only in React component state in memory for the current tab, is never written to cookies or `localStorage`, and is cleared from memory as soon as a push succeeds. You can also download a zip archive of your generated files and commit them manually instead of pasting a token.

## Tech stack

- **Framework**: Next.js 16 and React 19
- **Styling**: Tailwind CSS 4 and Base UI
- **Editor**: TipTap 3
- **Icons**: Lucide React
- **Image tools**: `react-easy-crop`, `react-color-palette` and `gifenc`
- **Package manager**: `pnpm` and TypeScript

## Getting started

```bash
git clone https://github.com/PathumSandeepa/DirtyReadme.git
cd DirtyReadme
pnpm install
pnpm dev
```

Available scripts:

- `pnpm dev`: Start the local development server.
- `pnpm build`: Build the production static bundle.
- `pnpm lint`: Run ESLint across the codebase.

## Project structure

```text
src/
  app/             Next.js App Router pages, layout and global styles
  components/ui/   Shared Base UI and Tailwind primitives
  config/          Brand metadata and repository URLs
  domain/          Profile, creature and workflow domain logic
  infrastructure/  Browser storage, image encoding, zip builder and GitHub API client
  presentation/    Studio screens, live editor, inspectors and landing sections
public/            Static icons, sprites and landing assets
docs/              Documentation and screenshots
```

## Contributing

Contributions are welcome.

1. Open an issue in [GitHub Issues](https://github.com/PathumSandeepa/DirtyReadme/issues) to describe a bug or propose an improvement.
2. Fork the repository and create a short feature branch.
3. Follow the Next.js 16 notes in [AGENTS.md](AGENTS.md) and check `node_modules/next/dist/docs/` before changing Next.js APIs.
4. Run `pnpm exec tsc --noEmit`, `pnpm lint` and `pnpm build` before opening a pull request.

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

## Credits

Made by Pathum Sandeepa.
