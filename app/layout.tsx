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
};

// PWA Metadata configuration
export const metadata: Metadata = {
  title: "FYP Finder - Find Your Perfect Project Partner",
  description: "Connect with Paf-iast students for your Final Year Project. Find partners, form groups, and collaborate.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FYP Finder",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "FYP Finder",
    title: "FYP Finder - Find Your Perfect Project Partner",
    description: "Connect with Paf-iast students for your Final Year Project",
  },
  twitter: {
    card: "summary",
    title: "FYP Finder",
    description: "Find your perfect FYP partner at Paf-iast",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "FYP Finder",
    "apple-mobile-web-app-title": "FYP Finder",
    "msapplication-TileColor": "#4f46e5",
  },
};

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
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen`}>
        <ThemeProvider>
          <AppProviders>
            <ToastContainer 
              theme="colored"
              position="top-right"
              autoClose={3000}
            />
            {children}
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
