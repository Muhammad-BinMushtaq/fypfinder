import { Inter } from "next/font/google";
import "../globals.css";
import { AppProviders } from "@/lib/providers";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
