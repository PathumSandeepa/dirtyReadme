import { BRAND } from "@/config/brand";
import { StudioApp } from "@/presentation/StudioApp";
import pkg from "../../package.json";

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: BRAND.name,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web browser",
  url: BRAND.siteUrl,
  codeRepository: BRAND.repoUrl,
  license: `${BRAND.repoUrl}/blob/main/LICENSE`,
  softwareVersion: pkg.version,
  description: BRAND.description,
  featureList: [
    "Live TipTap 3 GitHub README visual editor",
    "40 starter templates with category filters",
    "Over 200 tech stack badges with drag and drop",
    "Browser-only custom image crop and WebP conversion",
    "One-click publish to GitHub profile repository",
    "Optional daily scheduled GitHub Actions updates",
  ],
  author: {
    "@type": "Person",
    name: BRAND.authorName,
    url: BRAND.authorUrl,
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <StudioApp />
    </>
  );
}
