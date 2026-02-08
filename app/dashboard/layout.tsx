// app/dashboard/layout.tsx
"use client";

import { useRequireAuth } from "@/hooks/auth/useRequireAuth";
import { useSession } from "@/hooks/auth/useSession";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { NotificationBell } from "@/components/notifications";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SuspensionBanner } from "@/components/student/SuspensionBanner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  useRequireAuth();
  const { user, isLoading } = useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        // Clear any client-side cache/state if needed
        router.push("/login");
        router.refresh();
      } else {
        console.error("Logout failed");
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
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
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
        {/* Sidebar */}
        <DashboardSidebar
          userEmail={user?.email || "user@example.com"}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />

        {/* Main content */}
        <main className="flex-1 lg:ml-72">
          {/* Top Header Bar with Notification Bell */}
          <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 px-4 py-3 lg:px-6">
            <div className="flex items-center justify-end gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notification Bell */}
              <NotificationBell />
              
              {/* User Avatar (small) */}
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>

          {/* Suspension/Deletion Banner */}
          <SuspensionBanner />

          {/* Page Content */}
          <div>
            {children}
          </div>
        </main>
      </div>
    </NotificationProvider>
  );
}
