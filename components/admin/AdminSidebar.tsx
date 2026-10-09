// components/admin/AdminSidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  BarChart3,
  LogOut,
  Shield,
  Settings,
  X,
  MessageSquareHeart,
  ChevronRight,
} from "lucide-react"
import { useAdminSession } from "@/hooks/admin"

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    description: "Overview & metrics",
  },
  {
    label: "Students",
    href: "/admin/students",
    icon: Users,
    description: "Manage accounts",
  },
  {
    label: "Feedback",
    href: "/admin/feedback",
    icon: MessageSquareHeart,
    description: "Tickets & responses",
  },
  {
    label: "Messages",
    href: "/admin/messages",
    icon: MessageSquare,
    description: "Audit conversations",
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
    description: "Platform analytics",
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
    <div className="flex h-full flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      {/* Header / Brand */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 px-5">
        <Link 
          href="/admin/dashboard" 
          onClick={onMobileClose}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              FYPMate
            </span>
            <span className="ml-1.5 inline-block rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
              Admin
            </span>
          </div>
        </Link>

        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <div className="px-2.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {isActive && (
                <div className="h-1.5 w-1.5 rounded-full bg-slate-900 dark:bg-slate-100" />
              )}
            </Link>
          )
        })}

        <div className="pt-4 pb-2 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Settings
        </div>

        <Link
          href="/admin/settings"
          onClick={onMobileClose}
          className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
            pathname === "/admin/settings"
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Settings
              className={`h-4 w-4 shrink-0 transition-colors ${
                pathname === "/admin/settings"
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
              }`}
            />
            <span className="truncate">Settings</span>
          </div>
          {pathname === "/admin/settings" && (
            <div className="h-1.5 w-1.5 rounded-full bg-slate-900 dark:bg-slate-100" />
          )}
        </Link>
      </nav>

      {/* Footer / Account & Sign out */}
      <div className="border-t border-slate-200/80 dark:border-slate-800/80 p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0">
            {admin?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
              {admin?.name || "Administrator"}
            </p>
            <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
              {admin?.email}
            </p>
          </div>
        </div>

        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/40 disabled:opacity-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          {isLoggingOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-slate-200/80 dark:border-slate-800/80 lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out lg:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
