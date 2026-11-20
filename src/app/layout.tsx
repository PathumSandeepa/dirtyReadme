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
    "Dynamic Cybernetic Creature Studio — Animated SVG & GitHub Profile README Generator",
  description:
    "Create self-contained animated SVG creatures (Cyber-Tulkun, Cyber-Serpent, Cyber-Manta, and Cyber-Jellyfish), customize your entire GitHub profile README with drag-and-drop tech badges, and publish directly from your browser.",
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
      "Dynamic Cybernetic Creature Studio — Animated SVG & GitHub Profile README Generator",
    description:
      "Design an animated cybernetic creature and customizable GitHub profile README with drag-and-drop tech stack badges and 12:00 AM daily evolution.",
    images: [
      {
        url: "showcase/share-card.svg",
        width: 1280,
        height: 640,
        alt: "Dynamic Cybernetic Creature Studio Social Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Dynamic Cybernetic Creature Studio — Animated GitHub README Generator",
    description:
      "Design pure-CSS animated SVG creatures and publish a custom GitHub profile README directly from your browser.",
    images: ["showcase/share-card.svg"],
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
      <body className="min-h-full bg-slate-50 font-sans text-slate-900 dark:bg-[#14171c] dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
