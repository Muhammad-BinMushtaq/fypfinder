// hooks/pwa/usePushSubscription.ts
/**
 * Push Subscription Hook
 * ----------------------
 * Manages Web Push subscription on the client side.
 * 
 * Features:
 * - Check push support
 * - Request notification permission
 * - Subscribe to push notifications
 * - Unsubscribe from push notifications
 * - Sync subscription with server
 * 
 * Usage:
 * const { 
 *   isSupported, 
 *   permission, 
 *   isSubscribed,
 *   subscribe, 
 *   unsubscribe,
 *   requestPermission 
 * } = usePushSubscription();
 */

import { useState, useEffect, useCallback } from 'react';
import { useServiceWorker } from './useServiceWorker';

type PermissionState = NotificationPermission | 'unsupported';

interface UsePushSubscriptionReturn {
  isSupported: boolean;
  isLoading: boolean;
  permission: PermissionState;
  isSubscribed: boolean;
  error: Error | null;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
}

// Convert VAPID public key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushSubscription(): UsePushSubscriptionReturn {
  const { registration, isRegistered } = useServiceWorker();
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<PermissionState>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Check if push is supported
  const isSupported = typeof window !== 'undefined' 
    && 'PushManager' in window 
    && 'Notification' in window
    && 'serviceWorker' in navigator;

  // Check current permission and subscription status
  const checkStatus = useCallback(async () => {
    if (!isSupported) {
      setPermission('unsupported');
      setIsLoading(false);
      return;
    }

    // Check notification permission
    setPermission(Notification.permission);

    // Check if already subscribed
    if (registration) {
      try {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(subscription !== null);
      } catch (err) {
        console.error('[Push] Error checking subscription:', err);
      }
    }

    setIsLoading(false);
  }, [isSupported, registration]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError(new Error('Push notifications not supported'));
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (err) {
      console.error('[Push] Error requesting permission:', err);
      setError(err instanceof Error ? err : new Error('Permission request failed'));
      return false;
    }
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !registration) {
      setError(new Error('Service worker not ready'));
      return false;
    }

    if (Notification.permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        return false;
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get VAPID public key from server
      const vapidResponse = await fetch('/api/push/vapid-key');
      if (!vapidResponse.ok) {
        throw new Error('Failed to get VAPID key');
      }
      const { publicKey } = await vapidResponse.json();

      if (!publicKey) {
        throw new Error('VAPID public key not available');
      }

      // Subscribe to push manager
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription to server');
      }

      setIsSubscribed(true);
      console.log('[Push] Subscribed successfully');
      return true;
    } catch (err) {
      console.error('[Push] Subscription error:', err);
      setError(err instanceof Error ? err : new Error('Subscription failed'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, registration, requestPermission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !registration) {
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe();

        // Remove from server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });
      }

      setIsSubscribed(false);
      console.log('[Push] Unsubscribed successfully');
      return true;
    } catch (err) {
      console.error('[Push] Unsubscribe error:', err);
      setError(err instanceof Error ? err : new Error('Unsubscribe failed'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, registration]);

  // Check status on mount and when registration changes
  useEffect(() => {
    if (isRegistered) {
      checkStatus();
    }
  }, [isRegistered, checkStatus]);

  return {
    isSupported,
    isLoading,
    permission,
    isSubscribed,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}
