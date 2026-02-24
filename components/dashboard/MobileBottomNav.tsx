// components/dashboard/MobileBottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Search, MessageSquare, FileText, Settings } from "lucide-react";
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
    href: "/dashboard/requests/partner",
    icon: <FileText className="w-5 h-5" />,
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
    if (href === "/dashboard/requests/partner") {
      return pathname.startsWith("/dashboard/requests");
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.showUnreadBadge && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${active ? "font-semibold" : ""}`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gray-900 dark:bg-white rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
