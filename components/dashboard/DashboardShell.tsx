"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { SuspensionBanner } from "@/components/student/SuspensionBanner";
import { PushPermissionBanner } from "@/components/pwa/PushPermissionBanner";
import { InstallPromptBanner } from "@/components/pwa/InstallPromptBanner";
import { InstallButton } from "@/components/pwa/InstallButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GraduationCap, Lightbulb, Settings, ClipboardCheck } from "lucide-react";
import { useVisualViewport } from "@/hooks/useVisualViewport";
import clientLogger from "@/lib/client-logger";

interface DashboardShellProps {
  userEmail: string;
  children: ReactNode;
}

export function DashboardShell({ userEmail, children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isChatOpen = pathname.startsWith("/dashboard/messages/") && pathname !== "/dashboard/messages";
  const viewportHeight = useVisualViewport(isChatOpen);

  useEffect(() => {
    if (!isChatOpen) return;

    // Body scroll lock on mobile when active chat is open
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;

    if (window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      window.scrollTo(0, 0);
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;
    };
  }, [isChatOpen]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        queryClient.clear();

        if (typeof window !== "undefined") {
          localStorage.removeItem("fypfinder-cache");
        }

        router.push("/login");
        router.refresh();
      } else {
        clientLogger.error("Logout failed");
        setIsLoggingOut(false);
      }
    } catch (error) {
      clientLogger.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      className={`bg-slate-100 dark:bg-[#020617] flex ${
        isChatOpen ? "h-[100dvh] overflow-hidden" : "min-h-screen"
      }`}
    >
      {/* Desktop Sidebar */}
      <DashboardSidebar
        userEmail={userEmail || "user@example.com"}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {/* Main content */}
      <main
        style={
          isChatOpen && viewportHeight
            ? { height: `${viewportHeight}px` }
            : undefined
        }
        className={`flex-1 min-w-0 w-full lg:pl-[17.5rem] ${
          isChatOpen
            ? "fixed top-0 left-0 right-0 z-40 lg:static lg:pr-4 lg:py-4 h-[100dvh] overflow-hidden flex flex-col"
            : "lg:pr-4 lg:py-4 pb-28 lg:pb-4 overflow-x-hidden flex flex-col min-h-screen"
        }`}
      >
        {/* Floating Desktop Main Container */}
        <div
          className={`flex-1 flex flex-col lg:bg-white/75 lg:dark:bg-slate-900/60 lg:backdrop-blur-xl lg:border lg:border-white/40 lg:dark:border-white/10 lg:shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:dark:shadow-2xl lg:rounded-3xl relative overflow-hidden ${
            isChatOpen ? "h-full rounded-none border-none shadow-none bg-white dark:bg-slate-900" : ""
          }`}
        >
          {/* Mobile Header (Glass) - Hidden when in active chat */}
          {!isChatOpen && (
            <div className="lg:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-white/10 px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <Link href="/dashboard/profile" className="flex items-center gap-2 shrink-0 min-w-0">
                  <div className="w-8 h-8 bg-gradient-to-tr from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                    <GraduationCap className="w-4 h-4 text-white dark:text-gray-900" />
                  </div>
                  <span className="font-bold tracking-tight text-gray-900 dark:text-white text-base truncate">FYP Finder</span>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/dashboard/fyp-ideas"
                    title="FYP Ideas Archive"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                  >
                    <Lightbulb className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/dashboard/fyp-ideas/validate"
                    title="Validate Idea"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                    aria-label="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                  <InstallButton />
                  <ThemeToggle />
                </div>
              </div>
            </div>
          )}

          {/* Desktop Header (Minimal & Floating inside main container) - Hidden when in active chat */}
          {!isChatOpen && (
            <div className="hidden lg:flex sticky top-0 z-40 bg-transparent px-6 py-4 items-center justify-between border-b border-gray-100 dark:border-white/5">
              <div className="flex-1">
                {/* Optional: Breadcrumbs or Page Title could go here */}
              </div>
              <div className="flex items-center gap-3">
                <InstallButton />
                <div className="h-4 w-px bg-gray-200 dark:bg-white/10"></div>
                <Link
                  href="/dashboard/fyp-ideas"
                  title="FYP Ideas"
                  className="flex items-center justify-center w-9 h-9 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-all"
                >
                  <Lightbulb className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard/fyp-ideas/validate"
                  title="Validate Idea"
                  className="flex items-center justify-center w-9 h-9 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all"
                >
                  <ClipboardCheck className="w-4 h-4" />
                </Link>
                <ThemeToggle />
              </div>
            </div>
          )}

          <SuspensionBanner />

          {/* Content Area */}
          <div
            className={`flex-1 lg:rounded-b-3xl relative z-10 flex flex-col min-h-0 ${
              isChatOpen ? "p-0 h-full overflow-hidden" : "p-4 lg:p-6"
            }`}
          >
            {children}
          </div>
          
          {!isChatOpen && (
            <>
              <PushPermissionBanner />
              <InstallPromptBanner />
            </>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Hidden when in active chat */}
      {!isChatOpen && <MobileBottomNav />}
    </div>
  );
}
