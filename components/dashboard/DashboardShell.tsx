"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { SuspensionBanner } from "@/components/student/SuspensionBanner";
import { PushPermissionBanner } from "@/components/pwa/PushPermissionBanner";
import { InstallPromptBanner } from "@/components/pwa/InstallPromptBanner";
import { InstallButton } from "@/components/pwa/InstallButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GraduationCap, Lightbulb, Settings, Sparkles } from "lucide-react";
import clientLogger from "@/lib/client-logger";

interface DashboardShellProps {
  userEmail: string;
  children: ReactNode;
}

export function DashboardShell({ userEmail, children }: DashboardShellProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    <div className="min-h-screen bg-slate-100 dark:bg-[#020617] flex">
      {/* Desktop Sidebar */}
      <DashboardSidebar
        userEmail={userEmail || "user@example.com"}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0 w-full lg:pl-[17.5rem] lg:pr-4 lg:py-4 pb-28 lg:pb-4 overflow-x-hidden flex flex-col min-h-screen">
        
        {/* Floating Desktop Main Container */}
        <div className="flex-1 flex flex-col lg:bg-white/75 lg:dark:bg-slate-900/60 lg:backdrop-blur-xl lg:border lg:border-white/40 lg:dark:border-white/10 lg:shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:dark:shadow-2xl lg:rounded-3xl relative">
          
          {/* Mobile Header (Glass) */}
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
                  <Sparkles className="w-4 h-4" />
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

          {/* Desktop Header (Minimal & Floating inside main container) */}
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
                <Sparkles className="w-4 h-4" />
              </Link>
              <ThemeToggle />
            </div>
          </div>

          <SuspensionBanner />

          {/* Content Area */}
          <div className="flex-1 lg:rounded-b-3xl relative z-10 p-4 lg:p-6">
            {children}
          </div>
          
          <PushPermissionBanner />
          <InstallPromptBanner />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
