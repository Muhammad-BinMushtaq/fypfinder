# PWA & Web Push Notifications - Technical Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [File Structure](#file-structure)
5. [Setup Guide](#setup-guide)
6. [API Reference](#api-reference)
7. [Client Hooks](#client-hooks)
8. [Service Worker](#service-worker)
9. [Notification Flow](#notification-flow)
10. [Security Considerations](#security-considerations)
11. [Browser Compatibility](#browser-compatibility)
12. [Deployment Checklist](#deployment-checklist)
13. [Troubleshooting](#troubleshooting)

---

## Overview

FYP Finder has been converted to a Progressive Web App (PWA) with Web Push notification support. This enables:

- **Installable**: Users can add the app to their home screen
- **Push Notifications**: Real-time alerts even when the browser is closed
- **Offline Awareness**: Graceful handling of network issues

### Push Notification Triggers

| Event | Trigger | Notification Type |
|-------|---------|-------------------|
| New Message | When message sent in chat | "💬 {SenderName}: {preview}" |
| Message Request | When someone requests to message you | "📨 New Message Request" |
| Partner Request | When someone wants to be your FYP partner | "🤝 New Partner Request" |
| Request Accepted | When your request is accepted | "✅ Request Accepted" |

---

## Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PUSH NOTIFICATION FLOW                          │
└─────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
    │   User A    │ ──────► │   Server    │ ──────► │   User B    │
    │  (Sender)   │         │  (Next.js)  │         │ (Receiver)  │
    └─────────────┘         └──────┬──────┘         └──────▲──────┘
                                   │                        │
                                   │ 1. Save message        │
                                   │ 2. Get subscriptions   │
                                   │ 3. Send via web-push   │
                                   │                        │
                            ┌──────▼──────┐         ┌──────┴──────┐
                            │  PostgreSQL │         │ Push Service│
                            │  (Supabase) │         │ (FCM/Mozilla)│
                            └─────────────┘         └─────────────┘
                                                           │
                                                           │ Push Event
                                                           │
                                                    ┌──────▼──────┐
                                                    │   Service   │
                                                    │   Worker    │
                                                    │   (sw.js)   │
                                                    └──────┬──────┘
                                                           │
                                                    ┌──────▼──────┐
                                                    │ System      │
                                                    │ Notification│
                                                    └─────────────┘
```

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Service Worker | `public/sw.js` | Receives push events, shows notifications |
| Web Push Config | `lib/web-push.ts` | VAPID configuration, send notifications |
| Push Service | `lib/push-service.ts` | Business logic for triggering notifications |
| API Routes | `app/api/push/*` | Subscribe/unsubscribe endpoints |
| Client Hooks | `hooks/pwa/*` | Service worker & push subscription management |
| UI Components | `components/pwa/*` | Permission banner, settings toggle |

---

## Database Schema

### PushSubscription Table

```prisma
model PushSubscription {
  id         String   @id @default(uuid())
  userId     String   // Links to User.id
  endpoint   String   @unique  // Push service endpoint URL (unique per device)
  p256dh     String   // Client public key for encryption
  auth       String   // Auth secret for encryption
  userAgent  String?  // Browser/device info for debugging
  createdAt  DateTime @default(now())
  lastUsedAt DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

### Key Design Decisions

1. **Linked to User, not Student**: Works for both students and admins
2. **Unique endpoint**: Prevents duplicate subscriptions for same device
3. **onDelete: Cascade**: Auto-cleanup when user is deleted
4. **lastUsedAt**: Tracks subscription health for cleanup

---

## File Structure

```
fypfinder/
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service worker
│   └── icons/
│       ├── README.md              # Icon requirements
│       └── icon-*.png             # App icons (add these)
│
├── app/
│   ├── layout.tsx                 # PWA metadata added
│   ├── dashboard/
│   │   ├── layout.tsx             # PushPermissionBanner added
│   │   └── settings/page.tsx      # NotificationSettings added
│   └── api/
│       └── push/
│           ├── subscribe/route.ts
│           ├── unsubscribe/route.ts
│           └── vapid-key/route.ts
│
├── lib/
│   ├── web-push.ts                # VAPID config, sendPushNotification()
│   └── push-service.ts            # notifyNewMessage(), notifyMessageRequest(), etc.
│
├── hooks/pwa/
│   ├── index.ts
│   ├── useServiceWorker.ts        # SW registration
│   └── usePushSubscription.ts     # Subscribe/unsubscribe logic
│
├── components/pwa/
│   ├── index.ts
│   ├── PushPermissionBanner.tsx   # First-time prompt
│   └── NotificationSettings.tsx   # Settings page toggle
│
├── modules/
│   ├── messaging/messaging.service.ts  # Modified: triggers notifyNewMessage()
│   └── request/request.service.ts      # Modified: triggers notifyMessageRequest(), etc.
│
├── scripts/
│   └── generate-vapid-keys.js     # VAPID key generator
│
└── prisma/
    └── schema.prisma              # PushSubscription model added
```

---

## Setup Guide

### 1. Generate VAPID Keys

```bash
node scripts/generate-vapid-keys.js
```

Output:
```
VAPID_PUBLIC_KEY=BEk6zXzwz2Ex7pAFAmw...
VAPID_PRIVATE_KEY=HAbYV2MwghxZPA0vbik...
VAPID_SUBJECT=mailto:support@fypfinder.com
```

### 2. Add to Environment

Add to `.env.local` (local) and Vercel Environment Variables (production):

```env
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:support@fypfinder.com
```

### 3. Run Database Migration

```bash
npx prisma migrate dev --name add_push_subscriptions
```

For production:
```bash
npx prisma migrate deploy
```

### 4. Add App Icons

Create PNG icons and place in `public/icons/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
- icon-maskable-192x192.png
- icon-maskable-512x512.png

See `public/icons/README.md` for details.

### 5. Deploy

```bash
npm run build
# Deploy to Vercel
```

---

## API Reference

### GET /api/push/vapid-key

Returns the VAPID public key for client subscription.

**Response:**
```json
{
  "publicKey": "BEk6zXzwz2Ex7pAFAmw..."
}
```

### POST /api/push/subscribe

Saves a push subscription for the authenticated user.

**Request:**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "userAgent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription saved",
  "subscriptionId": "uuid"
}
```

### POST /api/push/unsubscribe

Removes a push subscription.

**Request:**
```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  // OR
  "removeAll": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription removed"
}
```

---

## Client Hooks

### useServiceWorker

```typescript
import { useServiceWorker } from '@/hooks/pwa';

const { 
  isSupported,    // boolean - Is SW supported?
  isRegistered,   // boolean - Is SW registered?
  registration,   // ServiceWorkerRegistration | null
  waitingWorker,  // ServiceWorker | null - Update available
  error,          // Error | null
  update,         // () => Promise<void> - Check for updates
  skipWaiting,    // () => void - Activate waiting worker
} = useServiceWorker();
```

### usePushSubscription

```typescript
import { usePushSubscription } from '@/hooks/pwa';

const { 
  isSupported,      // boolean - Is push supported?
  permission,       // 'default' | 'granted' | 'denied' | 'unsupported'
  isSubscribed,     // boolean - Is user subscribed?
  isLoading,        // boolean
  error,            // Error | null
  requestPermission, // () => Promise<boolean>
  subscribe,        // () => Promise<boolean>
  unsubscribe,      // () => Promise<boolean>
} = usePushSubscription();
```

---

## Service Worker

### Location
`public/sw.js`

### Responsibilities
1. **Install**: Cache static assets (icons only)
2. **Activate**: Clean up old caches
3. **Fetch**: Network-first strategy (minimal caching)
4. **Push**: Receive and display notifications
5. **Notification Click**: Navigate to correct page

### Caching Strategy

| Resource | Strategy | Reason |
|----------|----------|--------|
| `/api/*` | Network only | Dynamic data, auth required |
| `/_next/*` | Network only | Let Next.js handle |
| `supabase` | Network only | Real-time data |
| Static icons | Cache first | Rarely change |
| Everything else | Network first | Fresh content priority |

### Push Event Handling

```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: data.tag,
    data: data.data,
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  
  // Open or focus existing window
  clients.matchAll({ type: 'window' }).then((clientList) => {
    // ... navigation logic
  });
});
```

---

## Notification Flow

### Message Notification Flow

```
1. User A sends message
   │
   ▼
2. POST /api/messaging/send
   │
   ▼
3. sendMessage() in messaging.service.ts
   │
   ├── Create message in DB
   │
   └── notifyNewMessage() (async, non-blocking)
       │
       ▼
4. Get recipient's userId from conversation
   │
   ▼
5. Fetch all PushSubscriptions for recipient
   │
   ▼
6. For each subscription:
   ├── webpush.sendNotification()
   ├── On 410/404: Delete expired subscription
   └── On success: Update lastUsedAt
   │
   ▼
7. Push service (FCM/Mozilla) delivers to device
   │
   ▼
8. sw.js receives 'push' event
   │
   ▼
9. self.registration.showNotification()
```

### Request Notification Flow

```
1. User A sends message/partner request
   │
   ▼
2. POST /api/request/message/send or /api/request/partner/send
   │
   ▼
3. sendMessageRequest() or sendPartnerRequest()
   │
   ├── Create request in DB
   │
   └── notifyMessageRequest() or notifyPartnerRequest() (async)
       │
       ▼
4. Same flow as above (steps 4-9)
```

---

## Security Considerations

### Server-Side Security

| Concern | Mitigation |
|---------|------------|
| VAPID private key exposure | Server-side only, environment variable |
| Unauthorized subscription | Auth required for subscribe endpoint |
| Cross-user notification | User ID validated in push trigger |
| Expired subscriptions | Auto-deleted on 410/404 response |

### Client-Side Security

| Concern | Mitigation |
|---------|------------|
| XSS in notifications | No user-controlled HTML in notifications |
| Service worker scope | Scoped to `/` only |
| Credential caching | API routes excluded from SW cache |

### What NOT to Cache

```javascript
const NO_CACHE_PATTERNS = [
  /^\/api\//,       // All API routes
  /\/_next\//,      // Next.js internals  
  /supabase/,       // Supabase calls
];
```

---

## Browser Compatibility

### Fully Supported

| Browser | PWA Install | Push Notifications |
|---------|-------------|-------------------|
| Chrome Desktop | ✅ | ✅ |
| Chrome Android | ✅ | ✅ |
| Edge Desktop | ✅ | ✅ |
| Firefox Desktop | ✅ | ✅ |
| Firefox Android | ✅ | ✅ |

### Partial Support

| Browser | PWA Install | Push Notifications | Notes |
|---------|-------------|-------------------|-------|
| Safari macOS | ✅ (macOS 14+) | ✅ (macOS 13+) | Limited |
| Safari iOS | ✅ (iOS 16.4+) | ✅ (iOS 16.4+) | Must add to Home Screen first |

### iOS Safari Limitations

1. **Add to Home Screen Required**: Push only works when app is added to Home Screen
2. **No beforeinstallprompt**: Cannot programmatically prompt to install
3. **Limited Background**: Service worker may be killed aggressively
4. **No Badge API**: Cannot update app icon badge

### Fallback for Unsupported Browsers

- In-app toast notifications (already implemented via Supabase Realtime)
- No push notifications, but real-time still works when tab is open

---

## Deployment Checklist

### Environment Variables (Vercel)

- [ ] `VAPID_PUBLIC_KEY` - Set in Vercel dashboard
- [ ] `VAPID_PRIVATE_KEY` - Set in Vercel dashboard
- [ ] `VAPID_SUBJECT` - Set in Vercel dashboard

### Database

- [ ] Run `prisma migrate deploy` for PushSubscription table

### App Icons

- [ ] All icon sizes created and in `public/icons/`
- [ ] Icons are proper PNGs (not SVG)
- [ ] Maskable icons have safe zone padding

### Pre-Deploy Verification

- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] Service worker file exists at `public/sw.js`
- [ ] Manifest file exists at `public/manifest.json`

### Post-Deploy Testing

- [ ] Visit site and check DevTools → Application → Manifest (no errors)
- [ ] Check DevTools → Application → Service Workers (registered)
- [ ] Test notification permission prompt
- [ ] Test push notification delivery
- [ ] Test notification click opens correct page

### Lighthouse PWA Audit

Run Lighthouse and verify:
- [ ] PWA score > 90
- [ ] Installable
- [ ] Works offline (graceful degradation)

---

## Troubleshooting

### Push Notifications Not Working

1. **Check VAPID keys are set**
   ```bash
   echo $VAPID_PUBLIC_KEY
   echo $VAPID_PRIVATE_KEY
   ```

2. **Check browser permission**
   - DevTools → Application → Notifications

3. **Check subscription exists in DB**
   ```sql
   SELECT * FROM "PushSubscription" WHERE "userId" = 'your-user-id';
   ```

4. **Check service worker is registered**
   - DevTools → Application → Service Workers

5. **Check push endpoint is valid**
   - Subscription endpoint should start with `https://fcm.googleapis.com/` (Chrome) or `https://updates.push.services.mozilla.com/` (Firefox)

### Service Worker Not Updating

1. **Hard refresh**: Ctrl+Shift+R
2. **Unregister old SW**: DevTools → Application → Service Workers → Unregister
3. **Clear cache**: DevTools → Application → Storage → Clear site data

### PWA Not Installable

1. **Check manifest**: DevTools → Application → Manifest
2. **Check icons exist**: All icons in manifest must be accessible
3. **Check HTTPS**: PWA requires HTTPS (or localhost)

### iOS Safari Issues

1. **Add to Home Screen first**: Share → Add to Home Screen
2. **Re-enable push after install**: May need to grant permission again
3. **Check iOS version**: Requires iOS 16.4+

---

## Testing Checklist

### Manual Testing

- [ ] Fresh user sees push permission banner
- [ ] Can enable push from settings
- [ ] Receives push when message sent (different user)
- [ ] Receives push when message request received
- [ ] Receives push when partner request received
- [ ] Clicking notification opens correct page
- [ ] Can disable push from settings
- [ ] Push subscriptions removed on logout

### Browser Testing

- [ ] Chrome Desktop
- [ ] Chrome Android
- [ ] Firefox Desktop
- [ ] Edge Desktop
- [ ] Safari macOS (if available)

### Edge Cases

- [ ] Multiple tabs open
- [ ] Browser completely closed
- [ ] Offline then online
- [ ] Same user on multiple devices

---

## Code Examples

### Triggering a Custom Push Notification

```typescript
import { notifyNewMessage } from '@/lib/push-service';

// In your API route or service
await notifyNewMessage(
  conversationId,
  senderId,
  'John Doe',
  'Hey, want to team up for FYP?'
);
```

### Checking Push Support in Component

```tsx
import { usePushSubscription } from '@/hooks/pwa';

function MyComponent() {
  const { isSupported, permission, isSubscribed } = usePushSubscription();
  
  if (!isSupported) {
    return <p>Push notifications not supported</p>;
  }
  
  if (permission === 'denied') {
    return <p>Notifications blocked. Enable in browser settings.</p>;
  }
  
  return <p>Push status: {isSubscribed ? 'Enabled' : 'Disabled'}</p>;
}
```

---

## Future Improvements

1. **Active Conversation Detection**: Skip push if user is viewing the chat
2. **Notification Preferences**: Per-type notification settings
3. **Quiet Hours**: Don't send push during specified hours
4. **Batch Notifications**: Group multiple notifications
5. **Rich Notifications**: Add action buttons
6. **Push Analytics**: Track delivery rates

---

## Related Documentation

- [MESSAGING_ARCHITECTURE.md](./MESSAGING_ARCHITECTURE.md) - Existing real-time messaging system
- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web-push npm](https://www.npmjs.com/package/web-push)
