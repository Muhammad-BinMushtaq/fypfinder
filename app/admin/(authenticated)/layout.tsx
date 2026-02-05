// app/admin/(authenticated)/layout.tsx
"use client"

import { useRequireAdmin } from "@/hooks/admin"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { Loader2, Bell, Search } from "lucide-react"

export default function AdminAuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { admin, isLoading } = useRequireAdmin()

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
          <p className="mt-3 text-sm font-medium text-slate-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, useRequireAdmin handles redirect
  if (!admin) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
          <p className="mt-3 text-sm font-medium text-slate-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area - offset by sidebar width */}
      <div className="lg:pl-72">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:px-8">
          {/* Search Bar */}
          <div className="hidden md:flex md:flex-1 md:items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Right Side - Notifications & Profile */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* Admin Profile */}
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                {admin?.name?.charAt(0).toUpperCase() || admin?.email?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{admin?.name || "Administrator"}</p>
                <p className="text-xs text-slate-500">{admin?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  )
}
