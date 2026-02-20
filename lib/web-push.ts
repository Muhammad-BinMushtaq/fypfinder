// lib/web-push.ts
/**
 * Web Push Configuration
 * ----------------------
 * Server-side configuration for Web Push notifications using VAPID.
 * 
 * Environment Variables Required:
 * - VAPID_PUBLIC_KEY: Public key for client subscription
 * - VAPID_PRIVATE_KEY: Private key for signing push messages
 * - VAPID_SUBJECT: Contact email (mailto:) or URL
 * 
 * Usage:
 * import { sendPushNotification, getVapidPublicKey } from '@/lib/web-push';
 */

import webpush from 'web-push';
import logger from './logger';

// VAPID Configuration
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@fypfinder.com';

// Initialize web-push with VAPID details
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      VAPID_SUBJECT,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
    logger.info('Web Push VAPID configured successfully');
  } catch (error) {
    logger.error('Failed to configure Web Push VAPID:', error);
  }
} else {
  logger.warn('Web Push VAPID keys not configured. Push notifications will not work.');
}

/**
 * Get the VAPID public key for client-side subscription
 */
export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}

/**
 * Check if Web Push is configured
 */
export function isWebPushConfigured(): boolean {
  return Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
}

/**
 * Push Subscription interface (from client PushSubscription.toJSON())
 */
export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Notification payload interface
 */
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    url?: string;
    type?: 'message' | 'message_request' | 'partner_request';
    conversationId?: string;
    requestId?: string;
    senderId?: string;
    senderName?: string;
  };
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * Send a push notification to a single subscription
 * 
 * @param subscription - Push subscription data
 * @param payload - Notification content
 * @returns Promise with send result
 */
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: NotificationPayload
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  if (!isWebPushConfigured()) {
    logger.warn('Web Push not configured, skipping notification');
    return { success: false, error: 'Web Push not configured' };
  }

  try {
    const result = await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      JSON.stringify(payload),
      {
        TTL: 60 * 60, // 1 hour TTL
        urgency: 'high',
      }
    );

    logger.info(`Push notification sent successfully: ${result.statusCode}`);
    return { success: true, statusCode: result.statusCode };
  } catch (error: any) {
    // Handle specific Web Push errors
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription expired or invalid - should be deleted
      logger.info(`Push subscription expired/invalid (${error.statusCode})`);
      return { success: false, statusCode: error.statusCode, error: 'subscription_expired' };
    }
    
    if (error.statusCode === 429) {
      // Rate limited
      logger.warn('Push notification rate limited');
      return { success: false, statusCode: 429, error: 'rate_limited' };
    }

    logger.error('Failed to send push notification:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Send push notifications to multiple subscriptions
 * 
 * @param subscriptions - Array of push subscription data
 * @param payload - Notification content
 * @returns Promise with results for each subscription
 */
export async function sendPushNotificationToMany(
  subscriptions: Array<PushSubscriptionData & { id: string }>,
  payload: NotificationPayload
): Promise<Array<{ id: string; success: boolean; error?: string; shouldDelete?: boolean }>> {
  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const result = await sendPushNotification(sub, payload);
      return {
        id: sub.id,
        success: result.success,
        error: result.error,
        // Mark for deletion if subscription is expired/invalid
        shouldDelete: result.error === 'subscription_expired',
      };
    })
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      id: subscriptions[index].id,
      success: false,
      error: 'Promise rejected',
      shouldDelete: false,
    };
  });
}

/**
 * Generate new VAPID keys (utility function for setup)
 * Run this once to generate keys for .env
 */
export function generateVapidKeys(): { publicKey: string; privateKey: string } {
  return webpush.generateVAPIDKeys();
}
