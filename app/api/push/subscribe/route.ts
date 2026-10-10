// app/api/push/subscribe/route.ts
/**
 * Push Subscription Endpoint
 * --------------------------
 * Saves a push subscription for the authenticated user.
 * Handles duplicate subscriptions by updating existing ones.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/db';
import { isWebPushConfigured } from '@/lib/web-push';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Check if push is configured
    if (!isWebPushConfigured()) {
      return NextResponse.json(
        { error: 'Push notifications not configured' },
        { status: 503 }
      );
    }

    // Require authentication
    const user = await requireAuth();

    // Parse request body
    const body = await request.json();
    const { subscription, userAgent } = body;

    // Validate subscription data
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    if (!p256dh || !auth) {
      return NextResponse.json(
        { error: 'Missing subscription keys' },
        { status: 400 }
      );
    }

    // 🛡️ Validate subscription endpoint to prevent Blind SSRF attacks
    let parsedEndpointUrl: URL;
    try {
      parsedEndpointUrl = new URL(endpoint);
    } catch {
      return NextResponse.json(
        { error: 'Invalid subscription endpoint URL' },
        { status: 400 }
      );
    }

    if (parsedEndpointUrl.protocol !== 'https:') {
      return NextResponse.json(
        { error: 'Push service endpoint must use secure HTTPS protocol' },
        { status: 400 }
      );
    }

    // Allowlist of verified browser push gateway providers:
    // - Google FCM: fcm.googleapis.com, android.googleapis.com
    // - Mozilla: *.push.services.mozilla.com
    // - Apple: *.push.apple.com
    // - Microsoft: *.notify.windows.com
    const hostname = parsedEndpointUrl.hostname.toLowerCase();
    const isAllowedPushGateway =
      hostname === 'fcm.googleapis.com' ||
      hostname === 'android.googleapis.com' ||
      hostname.endsWith('.push.apple.com') ||
      hostname.endsWith('.push.services.mozilla.com') ||
      hostname.endsWith('.notify.windows.com') ||
      hostname === 'updates.push.services.mozilla.com' ||
      hostname === 'push.services.mozilla.com';

    if (!isAllowedPushGateway) {
      logger.warn(`Rejected untrusted push gateway host: ${hostname} from user ${user.id}`);
      return NextResponse.json(
        { error: 'Invalid or unsupported push notification gateway provider' },
        { status: 400 }
      );
    }

    // Upsert subscription (update if endpoint exists, create if not)
    const result = await prisma.pushSubscription.upsert({
      where: {
        endpoint: endpoint,
      },
      update: {
        // Update if endpoint already exists (same device, new keys)
        userId: user.id,
        p256dh,
        auth,
        userAgent: userAgent || null,
        lastUsedAt: new Date(),
      },
      create: {
        userId: user.id,
        endpoint,
        p256dh,
        auth,
        userAgent: userAgent || null,
      },
    });

    logger.info(`Push subscription saved for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Subscription saved',
      subscriptionId: result.id,
    });
  } catch (error: any) {
    logger.error('Error saving push subscription:', error);

    // Handle specific errors
    if (error.message === 'Unauthorized: not logged in') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}
