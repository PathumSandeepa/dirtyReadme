import { StudioApp } from "@/presentation/StudioApp";

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Dynamic Cybernetic Creature Studio",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  url: "https://pathumsandeepa.github.io/dynamic-readme-creature/",
  description:
    "Static web studio for generating animated SVG cybernetic creatures (Cyber-Tulkun, Cyber-Serpent, Cyber-Manta, Cyber-Jellyfish) and customizable GitHub profile READMEs.",
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
