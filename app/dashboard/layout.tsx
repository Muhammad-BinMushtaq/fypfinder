// app/dashboard/layout.tsx
"use client";

import { useRequireAuth } from "@/hooks/auth/useRequireAuth";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  useRequireAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg border-b border-indigo-700">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xl">📚</div>
            <h1 className="text-2xl font-bold text-white">FYP Finder</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>
    </div>
  );
}
