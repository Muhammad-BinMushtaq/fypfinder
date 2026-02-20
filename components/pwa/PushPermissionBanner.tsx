// components/pwa/PushPermissionBanner.tsx
/**
 * Push Permission Banner
 * ----------------------
 * A dismissible banner that prompts users to enable push notifications.
 * Appears only when:
 * - Push is supported
 * - Permission hasn't been decided yet
 * - User hasn't dismissed the banner in this session
 * 
 * Usage:
 * <PushPermissionBanner />
 */

"use client";

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { usePushSubscription } from '@/hooks/pwa';

export function PushPermissionBanner() {
  const { 
    isSupported, 
    isLoading: pushLoading, 
    permission, 
    isSubscribed, 
    subscribe 
  } = usePushSubscription();
  
  const [isDismissed, setIsDismissed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Check if banner should be shown
  useEffect(() => {
    // Only show banner if:
    // 1. Push is supported
    // 2. Permission is 'default' (not yet asked)
    // 3. User hasn't dismissed banner in this session
    // 4. User is not already subscribed
    const dismissed = sessionStorage.getItem('push-banner-dismissed');
    if (isSupported && permission === 'default' && !dismissed && !isSubscribed) {
      setIsDismissed(false);
    }
  }, [isSupported, permission, isSubscribed]);

  const handleEnable = async () => {
    setIsLoading(true);
    const success = await subscribe();
    setIsLoading(false);
    
    if (success) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('push-banner-dismissed', 'true');
    setIsDismissed(true);
  };

  // Don't render if not ready or should be hidden
  if (pushLoading || isDismissed || !isSupported || permission !== 'default') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Enable Notifications
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Get notified about new messages and requests, even when the browser is closed.
            </p>
            
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleEnable}
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg 
                         hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enabling...
                  </>
                ) : (
                  'Enable'
                )}
              </button>
              
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg 
                         hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
