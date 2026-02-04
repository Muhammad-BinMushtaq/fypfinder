// app/dashboard/layout.tsx
"use client";

import { useRequireAuth } from "@/hooks/auth/useRequireAuth";
import { useSession } from "@/hooks/auth/useSession";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
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
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar Skeleton */}
        <div className="hidden lg:block w-72 bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
        {/* Content Skeleton */}
        <div className="flex-1 p-8">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-6"></div>
          <div className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <DashboardSidebar
        userEmail={user?.email || "user@example.com"}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {/* Main content */}
      <main className="flex-1 lg:ml-72">
        {children}
      </main>
    </div>
  );
}
