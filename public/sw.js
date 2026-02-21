// FYP Finder Service Worker
// Version: 1.1.0
// Purpose: PWA support + Push Notifications + Offline Support

const SW_VERSION = '1.1.0';
const CACHE_NAME = `fypfinder-v${SW_VERSION}`;
const RUNTIME_CACHE = `fypfinder-runtime-v${SW_VERSION}`;

// Static assets to pre-cache for instant load
const STATIC_ASSETS = [
  '/icons/logo.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json',
];

// Pages to cache for offline access (App Shell)
const APP_SHELL_PAGES = [
  '/dashboard/discovery',
  '/dashboard/profile',
  '/dashboard/messages',
  '/dashboard/requests',
  '/dashboard/fyp',
  '/dashboard/settings',
];

// Patterns that should NEVER be cached (always network)
const NO_CACHE_PATTERNS = [
  /^\/api\//,              // All API routes (dynamic data)
  /supabase/,              // Supabase realtime/auth
  /\/_next\/webpack/,      // HMR in dev
];

// Patterns to cache with stale-while-revalidate
const STALE_WHILE_REVALIDATE_PATTERNS = [
  /\/_next\/static\//,     // Next.js static assets (JS/CSS)
  /\.(?:js|css)$/,         // JS and CSS files
  /\.(?:woff2?|ttf|otf)$/, // Fonts
];

// Patterns to cache with cache-first
const CACHE_FIRST_PATTERNS = [
  /\.(?:png|jpg|jpeg|gif|svg|webp|ico)$/, // Images
  /\/icons\//,             // App icons
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
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
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
// HELPER FUNCTIONS
// =====================

// Check if request matches any pattern in array
function matchesPattern(url, patterns) {
  return patterns.some(pattern => pattern.test(url.pathname) || pattern.test(url.href));
}

// Cache-first strategy (for images/icons)
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('', { status: 408, statusText: 'Request timeout' });
  }
}

// Stale-while-revalidate strategy (for JS/CSS)
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);
  
  // Return cached response immediately, or wait for network
  return cachedResponse || fetchPromise;
}

// Network-first strategy (for pages)
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/dashboard/discovery');
    }
    throw error;
  }
}

// =====================
// FETCH EVENT (Smart caching strategies)
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
  
  // Skip patterns that should never be cached (API, Supabase)
  if (matchesPattern(url, NO_CACHE_PATTERNS)) {
    return;
  }
  
  // Cache-first for images and icons
  if (matchesPattern(url, CACHE_FIRST_PATTERNS)) {
    event.respondWith(cacheFirst(event.request, CACHE_NAME));
    return;
  }
  
  // Stale-while-revalidate for static assets (JS/CSS)
  if (matchesPattern(url, STALE_WHILE_REVALIDATE_PATTERNS)) {
    event.respondWith(staleWhileRevalidate(event.request, RUNTIME_CACHE));
    return;
  }
  
  // Network-first for pages (navigation requests)
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request, RUNTIME_CACHE));
    return;
  }
  
  // Default: Network-first with cache fallback
  event.respondWith(networkFirst(event.request, RUNTIME_CACHE));
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
