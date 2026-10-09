"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useAdminSession } from "@/hooks/admin"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Loader2, Menu, ChevronRight } from "lucide-react"

export default function AdminAuthenticatedLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { admin, isLoading } = useAdminSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Generate breadcrumb text
  const getSectionTitle = () => {
    if (pathname.includes("/dashboard")) return "Dashboard"
    if (pathname.includes("/students")) return "Students"
    if (pathname.includes("/feedback")) return "Feedback"
    if (pathname.includes("/messages")) return "Messages"
    if (pathname.includes("/reports")) return "Reports"
    if (pathname.includes("/settings")) return "Settings"
    return "Overview"
  }

  if (isLoading || !admin) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 dark:bg-slate-800 text-white shadow-sm">
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          </div>
          <p className="mt-4 text-xs font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
            Loading Admin Portal...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
      <AdminSidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="lg:pl-64">
        {/* Modern Minimal Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="hidden sm:inline hover:text-slate-700 dark:hover:text-slate-300">Admin</span>
              <ChevronRight className="hidden sm:inline h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-900 dark:text-slate-100 font-semibold text-sm">
                {getSectionTitle()}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            {/* Admin Profile Pill */}
            <div className="flex items-center gap-2.5 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 shadow-xs">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-100 text-xs font-semibold text-white dark:text-slate-900">
                {admin?.name?.charAt(0).toUpperCase() || admin?.email?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium leading-tight text-slate-900 dark:text-white truncate max-w-[120px]">
                  {admin?.name || "Admin"}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  )
}
