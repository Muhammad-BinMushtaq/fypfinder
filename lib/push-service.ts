// lib/push-service.ts
/**
 * Push Notification Service
 * -------------------------
 * Handles the business logic for sending push notifications.
 * Integrates with the messaging and request systems.
 * 
 * Features:
 * - Send notification for new messages
 * - Send notification for message requests
 * - Send notification for partner requests
 * - Check if user is active in conversation (skip push if so)
 * - Clean up expired subscriptions
 */

import prisma from './db';
import {
  sendPushNotificationToMany,
  isWebPushConfigured,
  type NotificationPayload,
} from './web-push';
import logger from './logger';

/**
 * Send push notification when a new message is received.
 * Does NOT send if user might be viewing the conversation (tab is active).
 * 
 * @param conversationId - The conversation ID
 * @param senderId - The student ID who sent the message
 * @param senderName - Name of the sender
 * @param messagePreview - First few characters of the message
 */
export async function notifyNewMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  messagePreview: string
): Promise<void> {
  if (!isWebPushConfigured()) {
    return;
  }

  try {
    // Get the conversation to find the recipient
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        studentAId: true,
        studentBId: true,
        studentA: {
          select: { userId: true },
        },
        studentB: {
          select: { userId: true },
        },
      },
    });

    if (!conversation) {
      logger.warn(`notifyNewMessage: Conversation ${conversationId} not found`);
      return;
    }

    // Determine recipient (the one who is NOT the sender)
    const recipientStudentId = conversation.studentAId === senderId
      ? conversation.studentBId
      : conversation.studentAId;
    
    const recipientUserId = conversation.studentAId === senderId
      ? conversation.studentB.userId
      : conversation.studentA.userId;

    // Get recipient's push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: recipientUserId },
      select: {
        id: true,
        endpoint: true,
        p256dh: true,
        auth: true,
      },
    });

    if (subscriptions.length === 0) {
      logger.info(`No push subscriptions for user ${recipientUserId}`);
      return;
    }

    // Prepare notification payload - clean minimalist design
    const payload: NotificationPayload = {
      title: senderName,
      body: messagePreview.length > 100 
        ? messagePreview.substring(0, 100) + '...' 
        : messagePreview,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: `message-${conversationId}`,
      data: {
        url: `/dashboard/messages/${conversationId}`,
        type: 'message',
        conversationId,
        senderId,
        senderName,
      },
      actions: [
        { action: 'reply', title: 'Reply' },
      ],
    };

    // Send to all subscriptions
    const formattedSubs = subscriptions.map(sub => ({
      id: sub.id,
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    }));

    const results = await sendPushNotificationToMany(formattedSubs, payload);

    // Clean up expired subscriptions
    const expiredIds = results
      .filter(r => r.shouldDelete)
      .map(r => r.id);

    if (expiredIds.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { id: { in: expiredIds } },
      });
      logger.info(`Cleaned up ${expiredIds.length} expired push subscriptions`);
    }

    // Update lastUsedAt for successful sends
    const successIds = results
      .filter(r => r.success)
      .map(r => r.id);

    if (successIds.length > 0) {
      await prisma.pushSubscription.updateMany({
        where: { id: { in: successIds } },
        data: { lastUsedAt: new Date() },
      });
    }

    logger.info(`Push notification sent for message in conversation ${conversationId}`);
  } catch (error) {
    logger.error('Error sending message push notification:', error);
  }
}

/**
 * Send push notification when a message request is received.
 * 
 * @param toStudentId - The student receiving the request
 * @param fromStudentName - Name of the requester
 * @param requestId - The request ID
 * @param reason - Request reason/message
 */
export async function notifyMessageRequest(
  toStudentId: string,
  fromStudentName: string,
  requestId: string,
  reason: string
): Promise<void> {
  if (!isWebPushConfigured()) {
    return;
  }

  try {
    // Get the recipient's userId
    const student = await prisma.student.findUnique({
      where: { id: toStudentId },
      select: { userId: true },
    });

    if (!student) {
      logger.warn(`notifyMessageRequest: Student ${toStudentId} not found`);
      return;
    }

    // Get push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: student.userId },
      select: {
        id: true,
        endpoint: true,
        p256dh: true,
        auth: true,
      },
    });

    if (subscriptions.length === 0) {
      return;
    }

    const payload: NotificationPayload = {
      title: 'Message Request',
      body: `${fromStudentName} wants to connect${reason ? ` - "${reason.substring(0, 40)}${reason.length > 40 ? '...' : ''}"` : ''}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: `request-message-${requestId}`,
      data: {
        url: '/dashboard/requests/messages',
        type: 'message_request',
        requestId,
        senderName: fromStudentName,
      },
      actions: [
        { action: 'view', title: 'View' },
      ],
    };

    const formattedSubs = subscriptions.map(sub => ({
      id: sub.id,
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    }));

    const results = await sendPushNotificationToMany(formattedSubs, payload);

    // Clean up expired subscriptions
    const expiredIds = results.filter(r => r.shouldDelete).map(r => r.id);
    if (expiredIds.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { id: { in: expiredIds } },
      });
    }

    logger.info(`Push notification sent for message request ${requestId}`);
  } catch (error) {
    logger.error('Error sending message request push notification:', error);
  }
}

/**
 * Send push notification when a partner request is received.
 * 
 * @param toStudentId - The student receiving the request
 * @param fromStudentName - Name of the requester
 * @param requestId - The request ID
 * @param reason - Request reason/message
 */
export async function notifyPartnerRequest(
  toStudentId: string,
  fromStudentName: string,
  requestId: string,
  reason: string
): Promise<void> {
  if (!isWebPushConfigured()) {
    return;
  }

  try {
    // Get the recipient's userId
    const student = await prisma.student.findUnique({
      where: { id: toStudentId },
      select: { userId: true },
    });

    if (!student) {
      logger.warn(`notifyPartnerRequest: Student ${toStudentId} not found`);
      return;
    }

    // Get push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: student.userId },
      select: {
        id: true,
        endpoint: true,
        p256dh: true,
        auth: true,
      },
    });

    if (subscriptions.length === 0) {
      return;
    }

    const payload: NotificationPayload = {
      title: 'Partner Request',
      body: `${fromStudentName} wants to join your FYP${reason ? ` - "${reason.substring(0, 40)}${reason.length > 40 ? '...' : ''}"` : ''}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: `request-partner-${requestId}`,
      data: {
        url: '/dashboard/requests/partner',
        type: 'partner_request',
        requestId,
        senderName: fromStudentName,
      },
      actions: [
        { action: 'view', title: 'View' },
      ],
    };

    const formattedSubs = subscriptions.map(sub => ({
      id: sub.id,
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    }));

    const results = await sendPushNotificationToMany(formattedSubs, payload);

    // Clean up expired subscriptions
    const expiredIds = results.filter(r => r.shouldDelete).map(r => r.id);
    if (expiredIds.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { id: { in: expiredIds } },
      });
    }

    logger.info(`Push notification sent for partner request ${requestId}`);
  } catch (error) {
    logger.error('Error sending partner request push notification:', error);
  }
}

/**
 * Send push notification when a request is accepted.
 * 
 * @param toStudentId - The student who sent the original request (now being notified)
 * @param type - 'MESSAGE' or 'PARTNER'
 * @param accepterName - Name of the person who accepted
 */
export async function notifyRequestAccepted(
  toStudentId: string,
  type: 'MESSAGE' | 'PARTNER',
  accepterName: string
): Promise<void> {
  if (!isWebPushConfigured()) {
    return;
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: toStudentId },
      select: { userId: true },
    });

    if (!student) {
      return;
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: student.userId },
      select: {
        id: true,
        endpoint: true,
        p256dh: true,
        auth: true,
      },
    });

    if (subscriptions.length === 0) {
      return;
    }

    const isMessage = type === 'MESSAGE';
    const payload: NotificationPayload = {
      title: isMessage ? 'Request Accepted' : 'Partner Request Accepted',
      body: isMessage 
        ? `${accepterName} accepted. You can now chat.`
        : `${accepterName} accepted your request. Welcome to the team.`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: `request-accepted-${type.toLowerCase()}`,
      data: {
        url: isMessage ? '/dashboard/messages' : '/dashboard/fyp',
        type: isMessage ? 'message_request' : 'partner_request',
      },
    };

    const formattedSubs = subscriptions.map(sub => ({
      id: sub.id,
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    }));

    await sendPushNotificationToMany(formattedSubs, payload);
    logger.info(`Push notification sent for ${type} request accepted`);
  } catch (error) {
    logger.error('Error sending request accepted notification:', error);
  }
}

/**
 * Remove all push subscriptions for a user (called on logout)
 */
export async function removeAllSubscriptions(userId: string): Promise<void> {
  try {
    const result = await prisma.pushSubscription.deleteMany({
      where: { userId },
    });
    logger.info(`Removed ${result.count} push subscriptions for user ${userId}`);
  } catch (error) {
    logger.error('Error removing push subscriptions:', error);
  }
}
