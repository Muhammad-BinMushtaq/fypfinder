"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { SuspensionBanner } from "@/components/student/SuspensionBanner";
import { PushPermissionBanner } from "@/components/pwa/PushPermissionBanner";
import { InstallButton } from "@/components/pwa/InstallButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GraduationCap, BookOpen } from "lucide-react";
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
      <main className="flex-1 lg:ml-72 pb-20 lg:pb-0">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/profile" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white dark:text-gray-900" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">FYP Finder</span>
            </Link>
            <div className="flex items-center gap-2">
              <InstallButton />
              <Link
                href="/dashboard/fyp-ideas"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Previous FYP Ideas
              </Link>
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
              <BookOpen className="w-4 h-4" />
             Already Taken FYPs
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <SuspensionBanner />

        <div>{children}</div>

        <PushPermissionBanner />
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
