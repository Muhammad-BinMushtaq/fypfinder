// components/pwa/InstallPromptBanner.tsx
/**
 * Install Prompt Banner
 * ---------------------
 * A smart, non-intrusive banner that encourages PWA installation.
 * 
 * Shows when:
 * - beforeinstallprompt event fired (PWA installable)
 * - User is logged in (has engaged with the app)
 * - User hasn't permanently dismissed the banner
 * - App is not already installed
 * 
 * Respects:
 * - Permanent dismissal (localStorage)
 * - Browser PWA install rules
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'fypfinder-install-dismissed';
const LAST_SHOWN_KEY = 'fypfinder-install-last-shown';
const COOLDOWN_DAYS = 7; // Don't show again for 7 days after "Not Now"

export function InstallPromptBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Check if banner should be shown
  const shouldShowBanner = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    // Check if permanently dismissed
    if (localStorage.getItem(STORAGE_KEY) === 'true') return false;
    
    // Check cooldown (7 days after "Not Now")
    const lastShown = localStorage.getItem(LAST_SHOWN_KEY);
    if (lastShown) {
      const daysSince = (Date.now() - parseInt(lastShown, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < COOLDOWN_DAYS) return false;
    }
    
    return true;
  }, []);

  useEffect(() => {
    // Check if app is already installed
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show banner after a delay if conditions are met
      if (shouldShowBanner()) {
        // Small delay for better UX - let user engage first
        setTimeout(() => {
          setIsVisible(true);
        }, 3000); // 3 second delay
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setIsVisible(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [shouldShowBanner]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsVisible(false);
        // Mark as permanently dismissed since they installed
        localStorage.setItem(STORAGE_KEY, 'true');
      }
    } catch (error) {
      console.error('Install prompt error:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  // "Not Now" - temporary dismiss with cooldown
  const handleNotNow = () => {
    localStorage.setItem(LAST_SHOWN_KEY, Date.now().toString());
    setIsVisible(false);
  };

  // "×" - permanent dismiss
  const handlePermanentDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  // Don't render if installed, not installable, or not visible
  if (isInstalled || !deferredPrompt || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 relative">
        {/* Permanent dismiss button */}
        <button
          onClick={handlePermanentDismiss}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
          aria-label="Don't show again"
          title="Don't show again"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Install FYP Finder
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Get quick access and notifications on your device
            </p>

            {/* Action buttons */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isInstalling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Install
                  </>
                )}
              </button>
              
              <button
                onClick={handleNotNow}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
