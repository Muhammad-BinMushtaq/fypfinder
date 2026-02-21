"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { SuspensionBanner } from "@/components/student/SuspensionBanner";
import { PushPermissionBanner } from "@/components/pwa/PushPermissionBanner";
import { ThemeToggle } from "@/components/ThemeToggle";
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
      {/* Sidebar */}
      <DashboardSidebar
        userEmail={userEmail || "user@example.com"}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {/* Main content */}
      <main className="flex-1 lg:ml-72">
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 px-4 py-3 lg:px-6">
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/dashboard/fyp-ideas"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Taken FYPs
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <SuspensionBanner />

        <div>{children}</div>

        <PushPermissionBanner />
      </main>
    </div>
  );
}
