// components/dashboard/MobileHeaderMenu.tsx
/**
 * Mobile Header Menu
 * ------------------
 * An overflow menu for mobile header to reduce clutter.
 * Contains secondary actions like FYP Ideas and Install App.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MoreVertical, BookOpen, Download, Lightbulb } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function MobileHeaderMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // PWA install detection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Close menu when clicking outside
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

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    setIsOpen(false);
  };

  const canInstall = !isInstalled && deferredPrompt;

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* FYP Ideas */}
          <Link
            href="/dashboard/fyp-ideas"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Lightbulb className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span>FYP Ideas</span>
          </Link>

          {/* Install App - only show if installable */}
          {canInstall && (
            <>
              <div className="border-t border-gray-100 dark:border-slate-700 my-1" />
              <button
                onClick={handleInstall}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>Install App</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
