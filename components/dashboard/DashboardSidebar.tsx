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
  Handshake,
  FolderKanban,
  BookOpen,
  Settings,
  LogOut,
  ChevronDown,
  GraduationCap,
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
    label: "My Profile",
    href: "/dashboard/profile",
    icon: <User className="w-5 h-5" />,
  },
  {
    label: "Discovery",
    href: "/dashboard/discovery",
    icon: <Search className="w-5 h-5" />,
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
    children: [
      { label: "Partner Requests", href: "/dashboard/requests/partner", icon: <Handshake className="w-4 h-4" /> },
      { label: "Message Requests", href: "/dashboard/requests/messages", icon: <MessageSquare className="w-4 h-4" /> },
    ],
  },
  {
    label: "FYP Management",
    href: "/dashboard/fyp",
    icon: <FolderKanban className="w-5 h-5" />,
  },
  {
    label: "Taken FYPs",
    href: "/dashboard/fyp-ideas",
    icon: <BookOpen className="w-5 h-5" />,
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
    <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <Link href="/dashboard/profile" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-6 h-6 text-white dark:text-gray-900" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">FYP Finder</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <div key={item.label}>
            {item.children ? (
              // Parent with children
              <>
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    isActive(item.href)
                      ? "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 dark:text-gray-400">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expandedItems.includes(item.label) ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedItems.includes(item.label) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                          pathname === child.href
                            ? "bg-gray-200 dark:bg-slate-600 text-gray-900 dark:text-white font-medium"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <span className="text-gray-500 dark:text-gray-400">{child.icon}</span>
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
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  isActive(item.href)
                    ? "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 dark:text-gray-400">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.showUnreadBadge && unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
          <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userEmail}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Student</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <>
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              Logging out...
            </>
          ) : (
            <>
              <LogOut className="w-5 h-5" />
              Logout
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
