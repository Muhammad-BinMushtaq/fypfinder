// app/api/push/unsubscribe/route.ts
/**
 * Push Unsubscribe Endpoint
 * -------------------------
 * Removes a push subscription for the authenticated user.
 * Can remove a specific subscription by endpoint or all subscriptions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/db';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse request body
    const body = await request.json();
    const { endpoint, removeAll } = body;

    if (removeAll) {
      // Remove all subscriptions for this user
      const result = await prisma.pushSubscription.deleteMany({
        where: { userId: user.id },
      });

      logger.info(`Removed all ${result.count} push subscriptions for user ${user.id}`);

      return NextResponse.json({
        success: true,
        message: `Removed ${result.count} subscriptions`,
        count: result.count,
      });
    }

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required (or set removeAll: true)' },
        { status: 400 }
      );
    }

    // Remove specific subscription
    const result = await prisma.pushSubscription.deleteMany({
      where: {
        userId: user.id,
        endpoint: endpoint,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    logger.info(`Push subscription removed for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Subscription removed',
    });
  } catch (error: any) {
    logger.error('Error removing push subscription:', error);

    if (error.message === 'Unauthorized: not logged in') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}
