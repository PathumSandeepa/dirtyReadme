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
  softwareVersion: pkg.version,
  description: BRAND.description,
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
