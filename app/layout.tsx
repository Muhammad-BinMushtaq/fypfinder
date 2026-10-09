import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "../globals.css";
import { AppProviders } from "@/lib/providers";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

// PWA Viewport configuration
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  interactiveWidget: "resizes-content",
};

// PWA & SEO Metadata configuration
export const metadata: Metadata = {
  metadataBase: new URL("https://fypmate.com"),
  title: {
    default: "FYPMate | AI FYP Idea Validator & Student Teammate Platform",
    template: "%s | FYPMate",
  },
  description:
    "FYPMate is the university platform to find the right Final Year Project teammates and benchmark project proposals with AI feasibility & defense rubric scoring.",
  applicationName: "FYPMate",
  authors: [{ name: "Muhammad bin Mushtaq" }],
  generator: "Next.js",
  keywords: [
    "FYPMate",
    "FYP partner finder",
    "final year project teammates",
    "FYP idea validator",
    "project feasibility assessment",
    "university FYP groups",
    "PAF-IAST FYP",
    "student project collaboration",
    "AI FYP assessment",
    "FYP defense preparation",
  ],
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FYPMate",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fypmate.com",
    siteName: "FYPMate",
    title: "FYPMate | AI FYP Idea Validator & Student Teammate Platform",
    description:
      "Find ideal university project partners and validate your Final Year Project proposals with AI rubric scoring and defense timelines.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FYPMate | Find Teammates & Validate FYP Ideas",
    description:
      "Connect with university peers and benchmark your FYP proposals with AI.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "FYPMate",
    "apple-mobile-web-app-title": "FYPMate",
    "msapplication-TileColor": "#0f172a",
  },
};

import { CommandPalette } from "@/components/ui/CommandPalette";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try { if (localStorage.getItem('theme') === 'dark') { document.documentElement.classList.add('dark'); } else { document.documentElement.classList.remove('dark'); } } catch (_) {}`,
          }}
        />
      </head>
      <body className={`${inter.className} bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 min-h-screen selection:bg-blue-500/20 selection:text-blue-700 dark:selection:text-blue-300 antialiased`}>
        <ThemeProvider>
          <AppProviders>
            <ToastContainer 
              theme="colored"
              position="top-right"
              autoClose={3000}
            />
            <CommandPalette />
            {children}
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
