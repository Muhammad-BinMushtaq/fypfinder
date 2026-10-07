// components/dashboard/MobileProfileMenu.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import { useTheme } from "@/contexts/ThemeContext";
import { User, Settings, Moon, Sun, LogOut, ChevronRight } from "lucide-react";
import { InstallButton } from "@/components/pwa/InstallButton";

interface MobileProfileMenuProps {
  userEmail: string;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export function MobileProfileMenu({ userEmail, onLogout, isLoggingOut }: MobileProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { profile, isLoading } = useMyProfile();
  const { theme, toggleTheme } = useTheme();

  // Eagerly prefetch profile and settings routes on mount
  useEffect(() => {
    router.prefetch("/dashboard/profile");
    router.prefetch("/dashboard/settings");
  }, [router]);

  // Close when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : userEmail?.charAt(0).toUpperCase() || "U";

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button: Profile Avatar / Skeleton */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-0.5 rounded-full transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        aria-label="Open profile menu"
        aria-expanded={isOpen}
      >
        {isLoading ? (
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse border border-slate-300 dark:border-slate-600" />
        ) : profile?.profilePicture ? (
          <img
            src={profile.profilePicture}
            alt={profile.name || "User profile"}
            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center shadow-sm">
            {initials}
          </div>
        )}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Preview */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-1.5 flex items-center gap-3">
            {profile?.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-sm flex items-center justify-center shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {profile?.name || "Student"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {userEmail}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5">
            <Link
              href="/dashboard/profile"
              prefetch={true}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-slate-400" />
                <span>Edit Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/dashboard/settings"
              prefetch={true}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

          {/* Theme Toggle row */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-blue-500" />
              )}
              <span>Appearance</span>
            </div>
            <span className="text-xs text-slate-400 uppercase font-semibold">
              {theme === "dark" ? "Dark" : "Light"}
            </span>
          </button>

          {/* Optional Install App */}
          <div className="px-1 py-1">
            <InstallButton />
          </div>

          <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

          {/* Logout */}
          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
