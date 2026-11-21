import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://pathumsandeepa.github.io/dynamic-readme-creature/";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title:
    "Dynamic Cybernetic Creature Studio | Animated WebP/GIF & GitHub Profile README Generator",
  description:
    "Create S-curve animated pixel creatures (Pixel Tulkun in Top/Side views and Bioluminescent Jellyfish) as Animated WebP or GIF, customize your GitHub profile README with multi-card drag-and-drop tech badges, and publish directly from your browser.",
  applicationName: "Dynamic Cybernetic Creature Studio",
  keywords: [
    "GitHub Profile README Generator",
    "Animated SVG Creature",
    "GitHub README SVG",
    "Cyber Tulkun",
    "Cyber Jellyfish",
    "Dynamic GitHub Profile",
    "GitHub Actions Auto Evolve",
    "Tech Stack Badges",
    "Markdown Profile Builder",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Dynamic Cybernetic Creature Studio",
    title:
      "Dynamic Cybernetic Creature Studio | Animated WebP/GIF & GitHub Profile README Generator",
    description:
      "Design an S-curve animated pixel creature and customizable GitHub profile README with drag-and-drop tech stack cards and 12:00 AM daily evolution.",
    images: [
      {
        url: "showcase/share-card.png",
        width: 1280,
        height: 640,
        alt: "Dynamic Cybernetic Creature Studio Social Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Dynamic Cybernetic Creature Studio | Animated GitHub README Generator",
    description:
      "Design S-curve animated WebP/GIF pixel creatures and publish a custom GitHub profile README directly from your browser.",
    images: ["showcase/share-card.png"],
  },
  icons: {
    icon: [{ url: "favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "favicon.svg", type: "image/svg+xml" }],
  },
  manifest: "manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
