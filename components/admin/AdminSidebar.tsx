// components/admin/AdminSidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  LogOut,
  Shield,
  ChevronRight,
  Settings,
  X
} from "lucide-react"
import { useAdminSession } from "@/hooks/admin"

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    description: "Overview & stats",
  },
  {
    label: "Students",
    href: "/admin/students",
    icon: Users,
    description: "Manage students",
  },
  {
    label: "Messages",
    href: "/admin/messages",
    icon: MessageSquare,
    description: "View conversations",
  },
]

interface AdminSidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function AdminSidebar({ isMobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const { admin, logout, isLoggingOut } = useAdminSession()

  const sidebarContent = (
    <>
      {/* Header / Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">FYP Finder</h1>
            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Admin Panel</p>
          </div>
        </div>
        {/* Mobile close button */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 group-hover:text-slate-700 dark:group-hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isActive ? "text-indigo-700 dark:text-indigo-300" : ""}`}>
                  {item.label}
                </p>
                <p className="text-xs text-slate-400">{item.description}</p>
              </div>
              {isActive && (
                <ChevronRight className="h-4 w-4 text-indigo-400" />
              )}
            </Link>
          )
        })}

        <div className="my-4 border-t border-slate-200 dark:border-slate-700" />

        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          System
        </p>
        <Link
          href="/admin/dashboard"
          onClick={onMobileClose}
          className="group flex items-center gap-3 rounded-xl px-3 py-3 text-slate-600 dark:text-slate-300 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 group-hover:text-slate-700 dark:group-hover:text-white">
            <Settings className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Settings</p>
            <p className="text-xs text-slate-400">Preferences</p>
          </div>
        </Link>
      </nav>

      {/* Footer / Logout */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
            {admin?.name?.charAt(0).toUpperCase() || admin?.email?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{admin?.name || "Administrator"}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{admin?.email || "admin@example.com"}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? "Logging out..." : "Sign Out"}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
