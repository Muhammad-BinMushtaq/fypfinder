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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      {/* Desktop Sidebar */}
      <DashboardSidebar
        userEmail={userEmail || "user@example.com"}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0 w-full lg:ml-72 pb-20 lg:pb-0 overflow-x-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-3.5 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <Link href="/dashboard/profile" className="flex items-center gap-2 shrink-0 min-w-0">
              <div className="w-7 h-7 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-white dark:text-gray-900" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base truncate">FYP Finder</span>
            </Link>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* FYP Ideas */}
              <Link
                href="/dashboard/fyp-ideas"
                title="FYP Ideas Archive"
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg transition-colors border border-amber-200 dark:border-amber-800"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">Ideas</span>
              </Link>
              {/* Validate Idea */}
              <Link
                href="/dashboard/fyp-ideas/validate"
                title="Validate Idea"
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 rounded-lg transition-colors border border-blue-200 dark:border-blue-900/40"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">Validate</span>
              </Link>
              {/* Settings */}
              <Link
                href="/dashboard/settings"
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 transition-colors hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-700"
                aria-label="Settings"
              >
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
              {/* Install Button */}
              <InstallButton />
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 px-4 py-3 lg:px-6">
          <div className="flex items-center justify-end gap-3">
            <InstallButton />
            <Link
              href="/dashboard/fyp-ideas"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              FYP Ideas
            </Link>
            <Link
              href="/dashboard/fyp-ideas/validate"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 rounded-lg transition-colors border border-blue-200 dark:border-blue-900/40"
            >
              <Sparkles className="w-4 h-4" />
              Validate Idea
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <SuspensionBanner />

        <div>{children}</div>

        <PushPermissionBanner />
        <InstallPromptBanner />
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
