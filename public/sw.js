// FYP Finder Service Worker
// Version: 1.0.0
// Purpose: PWA support + Push Notifications

const SW_VERSION = '1.0.0';
const CACHE_NAME = `fypfinder-v${SW_VERSION}`;

// Static assets to cache (minimal - only icons)
const STATIC_ASSETS = [
  '/icons/logo.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Patterns that should NEVER be cached
const NO_CACHE_PATTERNS = [
  /^\/api\//,              // All API routes
  /\/_next\//,             // Next.js internals
  /supabase/,              // Supabase calls
  /\.json$/,               // JSON files (dynamic)
];

// =====================
// INSTALL EVENT
// =====================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v' + SW_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        // Don't fail install if assets missing
        return cache.addAll(STATIC_ASSETS).catch(() => {
          console.log('[SW] Some static assets not found, continuing...');
        });
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// =====================
// ACTIVATE EVENT
// =====================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v' + SW_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// =====================
// FETCH EVENT (Minimal caching)
// =====================
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Skip patterns that should never be cached
  for (const pattern of NO_CACHE_PATTERNS) {
    if (pattern.test(url.pathname) || pattern.test(url.href)) {
      return;
    }
  }
  
  // Network-first strategy for everything else
  // This ensures fresh content while providing offline fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses for static assets
        if (response.ok && STATIC_ASSETS.some(asset => url.pathname.endsWith(asset))) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache only for static assets
        return caches.match(event.request);
      })
  );
});

// =====================
// PUSH EVENT
// =====================
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  let data = {
    title: 'FYP Finder',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: 'default',
    data: { url: '/dashboard' }
  };
  
  // Parse push data if available
  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-96x96.png',
    tag: data.tag || 'default',
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: data.data || { url: '/dashboard' },
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// =====================
// NOTIFICATION CLICK EVENT
// =====================
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          const clientUrl = new URL(client.url);
          // If we have a window on the same origin
          if (clientUrl.origin === self.location.origin) {
            // Navigate to the target URL and focus
            return client.navigate(urlToOpen).then((client) => {
              if (client) {
                return client.focus();
              }
            });
          }
        }
        // No existing window, open a new one
        return clients.openWindow(urlToOpen);
      })
  );
});

// =====================
// NOTIFICATION CLOSE EVENT
// =====================
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
});

// =====================
// MESSAGE EVENT (for communication with main thread)
// =====================
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: SW_VERSION });
  }
});
