// components/dashboard/MobileBottomNav.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, ClipboardCheck, BookOpen } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Find Partners",
    href: "/dashboard/discovery",
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: "Validate FYP",
    href: "/dashboard/fyp-ideas/validate",
    icon: <ClipboardCheck className="w-5 h-5" />,
  },
  {
    label: "Previous FYPs",
    href: "/dashboard/fyp-ideas",
    icon: <BookOpen className="w-5 h-5" />,
  },
];

/**
 * Returns whether the bottom navigation should be visible for a given pathname.
 * Only shown on Find Partners, Previous FYPs, and Validate FYP.
 * Strictly hidden on Messages, Requests, My Profile, Settings, and active subpages.
 */
export function isBottomNavAllowed(pathname: string): boolean {
  if (!pathname) return false;

  // Never show on Messages, Requests, Profile, Settings, or deep subpages
  if (
    pathname.startsWith("/dashboard/messages") ||
    pathname.startsWith("/dashboard/requests") ||
    pathname.startsWith("/dashboard/profile") ||
    pathname.startsWith("/dashboard/settings") ||
    pathname.startsWith("/dashboard/discovery/profile")
  ) {
    return false;
  }

  // Only allowed on primary discovery and FYP hubs
  return (
    pathname === "/dashboard/discovery" ||
    pathname === "/dashboard/fyp-ideas" ||
    pathname === "/dashboard/fyp-ideas/validate"
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Keyboard and input focus detection to prevent bottom nav from floating above mobile keyboards
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        setIsKeyboardVisible(true);
      }
    };

    const handleFocusOut = () => {
      // Small timeout to prevent momentary flicker between consecutive input taps
      setTimeout(() => {
        const active = document.activeElement as HTMLElement | null;
        if (
          !active ||
          (active.tagName !== "INPUT" &&
            active.tagName !== "TEXTAREA" &&
            active.tagName !== "SELECT" &&
            !active.isContentEditable)
        ) {
          setIsKeyboardVisible(false);
        }
      }, 50);
    };

    // Detect virtual keyboard expansion via window.visualViewport height shrinkage
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const heightRatio = window.visualViewport.height / window.innerHeight;
        if (heightRatio < 0.78) {
          setIsKeyboardVisible(true);
        } else if (
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA"
        ) {
          setIsKeyboardVisible(false);
        }
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
    }

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleViewportChange);
      }
    };
  }, []);

  // Do not render if the route does not permit it, or if mobile keyboard / input is active
  if (!isBottomNavAllowed(pathname) || isKeyboardVisible) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/dashboard/discovery") {
      return pathname === "/dashboard/discovery";
    }
    if (href === "/dashboard/fyp-ideas/validate") {
      return pathname === "/dashboard/fyp-ideas/validate";
    }
    if (href === "/dashboard/fyp-ideas") {
      return pathname === "/dashboard/fyp-ideas";
    }
    return pathname === href;
  };

  return (
    <nav 
      data-mobile-bottom-nav="true"
      className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1.75rem)] max-w-sm z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden pb-[env(safe-area-inset-bottom)] transition-all duration-200"
    >
      <div className="grid grid-cols-3 items-center h-16 px-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                active
                  ? "text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  active ? "bg-blue-50 dark:bg-blue-950/40" : ""
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[11px] tracking-tight mt-0.5 truncate text-center leading-tight">
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-1 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
