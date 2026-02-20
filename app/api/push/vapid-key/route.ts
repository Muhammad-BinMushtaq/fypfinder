// app/api/push/vapid-key/route.ts
/**
 * VAPID Public Key Endpoint
 * -------------------------
 * Returns the VAPID public key for client-side push subscription.
 * This endpoint is public (no auth required) as the public key is safe to expose.
 */

import { NextResponse } from 'next/server';
import { getVapidPublicKey, isWebPushConfigured } from '@/lib/web-push';

export async function GET() {
  if (!isWebPushConfigured()) {
    return NextResponse.json(
      { error: 'Push notifications not configured' },
      { status: 503 }
    );
  }

  const publicKey = getVapidPublicKey();
  
  return NextResponse.json({
    publicKey,
  });
}
