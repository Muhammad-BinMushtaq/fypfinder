// components/dashboard/MobileBottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Search, MessageSquare, Sparkles, FileText, Settings } from "lucide-react";
import { useUnreadCount } from "@/hooks/messaging/useUnreadCount";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  showUnreadBadge?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: <User className="w-5 h-5" />,
  },
  {
    label: "Discover",
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
  },
  {
    label: "Validate",
    href: "/dashboard/fyp-ideas/validate",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useUnreadCount();

  const isActive = (href: string) => {
    if (href === "/dashboard/requests") {
      return pathname.startsWith("/dashboard/requests");
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[24rem] z-50 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 shadow-2xl rounded-full overflow-visible pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-between h-16 px-4 gap-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                active
                  ? "bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.showUnreadBadge && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold bg-red-500 text-white rounded-full shadow-sm ring-2 ring-white dark:ring-slate-900">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="sr-only">{item.label}</span>
              {active && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-900 dark:bg-white rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
