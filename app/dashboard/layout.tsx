// app/dashboard/layout.tsx
"use client";

import { useRequireAuth } from "@/hooks/auth/useRequireAuth";
import { useSession } from "@/hooks/auth/useSession";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { SuspensionBanner } from "@/components/student/SuspensionBanner";
import { PushPermissionBanner } from "@/components/pwa/PushPermissionBanner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import clientLogger from "@/lib/client-logger";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  useRequireAuth();
  const { user, isLoading } = useSession();
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
        // Clear all cached data including session
        queryClient.clear();
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

  // Show loading skeleton while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
        {/* Sidebar Skeleton */}
        <div className="hidden lg:block w-72 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="h-10 w-40 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          </div>
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-slate-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
        {/* Content Skeleton */}
        <div className="flex-1 p-8">
          <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse mb-6"></div>
          <div className="h-64 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <DashboardSidebar
        userEmail={user?.email || "user@example.com"}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {/* Main content */}
      <main className="flex-1 lg:ml-72">
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 px-4 py-3 lg:px-6">
          <div className="flex items-center justify-end gap-3">
            {/* See Taken FYPs Link */}
            <Link
              href="/dashboard/fyp-ideas"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Taken FYPs
            </Link>
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>

        {/* Suspension/Deletion Banner */}
        <SuspensionBanner />

        {/* Page Content */}
        <div>
          {children}
        </div>

        {/* Push Notification Permission Banner */}
        <PushPermissionBanner />
      </main>
    </div>
  );
}
