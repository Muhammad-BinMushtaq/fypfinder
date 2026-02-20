// hooks/pwa/useServiceWorker.ts
/**
 * Service Worker Registration Hook
 * ---------------------------------
 * Handles service worker registration, updates, and lifecycle management.
 * 
 * Features:
 * - Registers service worker on mount
 * - Handles updates gracefully
 * - Provides registration status
 * - Cleanup on unmount
 * 
 * Usage:
 * const { isSupported, isRegistered, registration, error } = useServiceWorker();
 */

import { useState, useEffect, useCallback } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isLoading: boolean;
  registration: ServiceWorkerRegistration | null;
  waitingWorker: ServiceWorker | null;
  error: Error | null;
}

interface UseServiceWorkerReturn extends ServiceWorkerState {
  update: () => Promise<void>;
  skipWaiting: () => void;
}

export function useServiceWorker(): UseServiceWorkerReturn {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isLoading: true,
    registration: null,
    waitingWorker: null,
    error: null,
  });

  // Check if service workers are supported
  const isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator;

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!isSupported) {
      setState(prev => ({ ...prev, isSupported: false, isLoading: false }));
      return;
    }

    try {
      // Wait for the page to load
      await new Promise<void>((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', () => resolve(), { once: true });
        }
      });

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // Always fetch fresh SW
      });

      console.log('[PWA] Service Worker registered:', registration.scope);

      // Handle waiting worker (update available)
      const handleStateChange = () => {
        if (registration.installing) {
          registration.installing.addEventListener('statechange', function() {
            if (this.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available
              setState(prev => ({
                ...prev,
                waitingWorker: registration.waiting,
              }));
            }
          });
        }
      };

      registration.addEventListener('updatefound', handleStateChange);

      // Check for existing waiting worker
      if (registration.waiting) {
        setState(prev => ({
          ...prev,
          waitingWorker: registration.waiting,
        }));
      }

      setState(prev => ({
        ...prev,
        isSupported: true,
        isRegistered: true,
        isLoading: false,
        registration,
        error: null,
      }));

      // Check for updates periodically (every hour)
      const updateInterval = setInterval(() => {
        registration.update().catch(console.error);
      }, 60 * 60 * 1000);

      // Cleanup interval on page unload
      window.addEventListener('beforeunload', () => {
        clearInterval(updateInterval);
      });

    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      setState(prev => ({
        ...prev,
        isSupported: true,
        isRegistered: false,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Registration failed'),
      }));
    }
  }, [isSupported]);

  // Manual update check
  const update = useCallback(async () => {
    if (state.registration) {
      await state.registration.update();
    }
  }, [state.registration]);

  // Skip waiting and activate new worker
  const skipWaiting = useCallback(() => {
    if (state.waitingWorker) {
      state.waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      // Reload to activate new service worker
      window.location.reload();
    }
  }, [state.waitingWorker]);

  // Register on mount
  useEffect(() => {
    registerServiceWorker();
  }, [registerServiceWorker]);

  // Listen for controller change (new SW activated)
  useEffect(() => {
    if (!isSupported) return;

    const handleControllerChange = () => {
      // Optionally reload to ensure fresh content
      // window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, [isSupported]);

  return {
    ...state,
    isSupported,
    update,
    skipWaiting,
  };
}
