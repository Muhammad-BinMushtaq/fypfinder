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
