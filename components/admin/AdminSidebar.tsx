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
  Settings
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

export function AdminSidebar() {
  const pathname = usePathname()
  const { admin, logout, isLoggingOut } = useAdminSession()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col border-r border-slate-200 bg-white lg:flex">
      {/* Header / Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">FYP Finder</h1>
          <p className="text-xs font-medium text-indigo-600">Admin Panel</p>
        </div>
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
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30"
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isActive ? "text-indigo-700" : ""}`}>
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

        <div className="my-4 border-t border-slate-200" />

        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          System
        </p>
        <Link
          href="/admin/dashboard"
          className="group flex items-center gap-3 rounded-xl px-3 py-3 text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700">
            <Settings className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Settings</p>
            <p className="text-xs text-slate-400">Preferences</p>
          </div>
        </Link>
      </nav>

      {/* Footer / Logout */}
      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
            {admin?.name?.charAt(0).toUpperCase() || admin?.email?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{admin?.name || "Administrator"}</p>
            <p className="truncate text-xs text-slate-500">{admin?.email || "admin@example.com"}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? "Logging out..." : "Sign Out"}
        </button>
      </div>
    </aside>
  )
}
