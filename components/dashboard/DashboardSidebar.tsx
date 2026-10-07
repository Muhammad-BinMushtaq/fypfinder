// components/dashboard/DashboardSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUnreadCount } from "@/hooks/messaging/useUnreadCount";
import {
  User,
  Search,
  MessageSquare,
  FileText,
  FolderKanban,
  BookOpen,
  Settings,
  LogOut,
  ChevronDown,
  GraduationCap,
  ClipboardCheck,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  showUnreadBadge?: boolean;
  children?: { label: string; href: string; icon: React.ReactNode }[];
}

const navItems: NavItem[] = [
  {
    label: "Find Partners",
    href: "/dashboard/discovery",
    icon: <Search className="w-5 h-5" />,
  },
  {
    label: "Validate FYP",
    href: "/dashboard/fyp-ideas/validate",
    icon: <ClipboardCheck className="w-5 h-5" />,
    badge: "AI",
  },
  {
    label: "Previous FYPs",
    href: "/dashboard/fyp-ideas",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    label: "Messages",
    href: "/dashboard/messages",
    icon: <MessageSquare className="w-5 h-5" />,
    showUnreadBadge: true,
  },
  {
    label: "Requests",
    href: "/dashboard/requests",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: "FYP Management",
    href: "/dashboard/fyp",
    icon: <FolderKanban className="w-5 h-5" />,
  },
  {
    label: "My Profile",
    href: "/dashboard/profile",
    icon: <User className="w-5 h-5" />,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

interface DashboardSidebarProps {
  userEmail: string;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export function DashboardSidebar({ userEmail, onLogout, isLoggingOut }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Requests"]);
  const { unreadCount } = useUnreadCount();

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:top-4 lg:bottom-4 lg:left-4 z-50 bg-white/75 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl rounded-3xl overflow-hidden transition-all duration-300">
      {/* Logo */}
      <div className="pt-8 pb-4 px-6">
        <Link href="/dashboard/profile" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 rounded-xl flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-105">
            <GraduationCap className="w-6 h-6 text-white dark:text-gray-900" />
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">FYP Finder</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
          <div key={item.label}>
            {item.children ? (
              // Parent with children
              <>
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${isActive(item.href) ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>{item.icon}</span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      expandedItems.includes(item.label) ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedItems.includes(item.label) && (
                  <div className="ml-5 mt-1 pl-4 border-l border-gray-200 dark:border-slate-700/50 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        prefetch={true}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 active:scale-[0.98] ${
                          pathname === child.href
                            ? "text-gray-900 dark:text-white font-medium"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                      >
                        <span className="text-gray-400 dark:text-gray-500 scale-90">{child.icon}</span>
                        <span className="text-sm">{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Single item
              <Link
                href={item.href}
                prefetch={true}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 active:scale-[0.98] ${
                  isActive(item.href)
                    ? "bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive(item.href) ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors"}`}>{item.icon}</span>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.showUnreadBadge && unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 mb-2">
        <div className="flex flex-col gap-1 p-2 bg-transparent rounded-2xl transition-colors">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 border border-white/50 dark:border-slate-600 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold text-sm shadow-sm">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userEmail}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Student</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-2 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoggingOut ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                Log out
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
