import { Inter } from "next/font/google";
import "../globals.css";
import { AppProviders } from "@/lib/providers";
import { ToastContainer } from "react-toastify";    

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} bg-background-light dark:bg-background-dark min-h-screen`}>
        <AppProviders>
          <ToastContainer />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
