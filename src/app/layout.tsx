import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { BRAND } from "@/config/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const THEME_INIT_SCRIPT = `(function(){try{var k="readmeforge-theme";var pref=localStorage.getItem(k);if(pref!=="light"&&pref!=="dark"&&pref!=="system"){pref="dark";}var resolved=pref==="system"?(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):pref;var root=document.documentElement;root.setAttribute("data-theme",resolved);root.setAttribute("data-theme-pref",pref);if(resolved==="dark"){root.classList.add("dark");}else{root.classList.remove("dark");}root.style.colorScheme=resolved;document.addEventListener("pointerdown",function(){root.removeAttribute("data-keyboard-nav");},true);document.addEventListener("keydown",function(e){if(e.key==="Tab"){root.setAttribute("data-keyboard-nav","true");}},true);}catch(e){}})();`;

export const viewport: Viewport = {
  themeColor: "#0C0E0F",
  colorScheme: "light dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: `${BRAND.name}. ${BRAND.tagline}`,
  description: BRAND.description,
  applicationName: BRAND.name,
  keywords: [
    "ReadmeForge",
    "GitHub profile README builder",
    "GitHub profile README editor",
    "GitHub profile templates",
    "Animated WebP creature",
    "GitHub Actions auto evolve",
    "Tech stack badges",
    "Markdown profile studio",
  ],
  alternates: {
    canonical: BRAND.siteUrl,
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
    url: BRAND.siteUrl,
    siteName: BRAND.name,
    title: `${BRAND.name}. ${BRAND.tagline}`,
    description: BRAND.description,
    images: [
      {
        url: "og-image.png",
        width: 1200,
        height: 630,
        alt: `${BRAND.name} GitHub profile README builder preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name}. ${BRAND.tagline}`,
    description: BRAND.description,
    images: ["og-image.png"],
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
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakartaSans.variable} dark h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full bg-[var(--bg)] font-sans text-[var(--text)]">
        {children}
      </body>
    </html>
  );
}
