// components/pwa/NotificationSettings.tsx
/**
 * Notification Settings Component
 * -------------------------------
 * A settings panel for managing push notifications.
 * Shows subscription status and allows users to enable/disable.
 * 
 * Usage:
 * <NotificationSettings />
 */

"use client";

import { useState } from 'react';
import { Bell, BellOff, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { usePushSubscription } from '@/hooks/pwa';

export function NotificationSettings() {
  const { 
    isSupported, 
    isLoading, 
    permission, 
    isSubscribed, 
    subscribe, 
    unsubscribe 
  } = usePushSubscription();
  
  const [actionLoading, setActionLoading] = useState(false);

  const handleToggle = async () => {
    setActionLoading(true);
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
    setActionLoading(false);
  };

  // Unsupported browser
  if (!isSupported) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
              Push Notifications Not Supported
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Your browser doesn&apos;t support push notifications. Try using Chrome, Firefox, or Edge.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Permission denied
  if (permission === 'denied') {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <BellOff className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800 dark:text-red-200">
              Notifications Blocked
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              You&apos;ve blocked notifications for this site. To enable them:
            </p>
            <ol className="text-sm text-red-700 dark:text-red-300 mt-2 ml-4 list-decimal">
              <li>Click the lock icon in your browser&apos;s address bar</li>
              <li>Find &quot;Notifications&quot; and change it to &quot;Allow&quot;</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Normal state - show toggle
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          {isSubscribed ? (
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <BellOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
          )}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              Push Notifications
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {isSubscribed 
                ? 'You will receive notifications for new messages and requests'
                : 'Enable to get notified even when the browser is closed'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={isLoading || actionLoading}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                     transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed
                     ${isSubscribed ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-600'}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                       transition duration-200 ease-in-out
                       ${isSubscribed ? 'translate-x-5' : 'translate-x-0'}`}
          >
            {(isLoading || actionLoading) && (
              <RefreshCw className="w-3 h-3 text-gray-400 absolute top-1 left-1 animate-spin" />
            )}
          </span>
        </button>
      </div>
      
      {isSubscribed && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span>Notifications enabled</span>
          </div>
        </div>
      )}
      
      {/* iOS Safari notice */}
      {typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent) && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            <strong>iOS Users:</strong> For push notifications to work, add this app to your Home Screen first (Share → Add to Home Screen).
          </p>
        </div>
      )}
    </div>
  );
}
