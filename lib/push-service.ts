// lib/push-service.ts
/**
 * Push & Transactional Email Notification Service
 * -----------------------------------------------
 * Handles the business logic for sending Web Push notifications and
 * automatic transactional emails (via Resend).
 *
 * Respects the Admin's EmailTriggerConfig:
 *  - SMART_FALLBACK (default): Sends free Web Push first; only sends a Resend
 *    email if the student has NO active Web Push subscriptions (saving the 100/day Free Tier quota!).
 *  - ALWAYS_SEND: Sends both Web Push and Resend email on enabled triggers.
 *  - Per-trigger toggles: partnerRequest, messageRequest, requestAccepted, feedbackUpdate.
 */

import prisma from './db';
import {
  sendPushNotificationToMany,
  isWebPushConfigured,
  type NotificationPayload,
} from './web-push';
import {
  isEmailConfigured,
  sendSingleEmail,
  getEmailTriggerConfig,
} from './email';
import {
  buildMessageRequestEmail,
  buildPartnerRequestEmail,
  buildRequestAcceptedEmail,
  buildFeedbackUpdateEmail,
} from './email-templates';
import logger from './logger';

/**
 * Send push notification when a new message is received.
 * Does NOT send email per chat message to avoid inbox spam and quota burn.
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

    const recipientUserId = conversation.studentAId === senderId
      ? conversation.studentB.userId
      : conversation.studentA.userId;

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

    const formattedSubs = subscriptions.map(sub => ({
      id: sub.id,
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    }));

    const results = await sendPushNotificationToMany(formattedSubs, payload);

    const expiredIds = results
      .filter(r => r.shouldDelete)
      .map(r => r.id);

    if (expiredIds.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { id: { in: expiredIds } },
      });
      logger.info(`Cleaned up ${expiredIds.length} expired push subscriptions`);
    }

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
 * Send Web Push + Automatic Transactional Email when a message request is received.
 */
export async function notifyMessageRequest(
  toStudentId: string,
  fromStudentName: string,
  requestId: string,
  reason: string
): Promise<void> {
  if (!isWebPushConfigured() && !isEmailConfigured()) {
    return;
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: toStudentId },
      select: {
        id: true,
        name: true,
        userId: true,
        user: {
          select: {
            email: true,
            status: true,
          },
        },
      },
    });

    if (!student) {
      logger.warn(`notifyMessageRequest: Student ${toStudentId} not found`);
      return;
    }

    let pushDelivered = false

    // 1. Try Web Push first (100% free & instant)
    if (isWebPushConfigured()) {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId: student.userId },
        select: {
          id: true,
          endpoint: true,
          p256dh: true,
          auth: true,
        },
      });

      if (subscriptions.length > 0) {
        const payload: NotificationPayload = {
          title: 'Message Request',
          body: `${fromStudentName} wants to connect${reason ? ` - "${reason.substring(0, 40)}${reason.length > 40 ? '...' : ''}"` : ''}`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-96x96.png',
          tag: `request-message-${requestId}`,
          data: {
            url: '/dashboard/requests/received',
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
        pushDelivered = results.some(r => r.success);

        const expiredIds = results.filter(r => r.shouldDelete).map(r => r.id);
        if (expiredIds.length > 0) {
          await prisma.pushSubscription.deleteMany({
            where: { id: { in: expiredIds } },
          });
        }
      }
    }

    // 2. Dispatch Automatic Transactional Email via Resend according to Admin Trigger Config
    if (isEmailConfigured() && student.user?.email && student.user.status === 'ACTIVE') {
      const triggerConfig = await getEmailTriggerConfig();
      const shouldSendEmail =
        triggerConfig.messageRequest &&
        (triggerConfig.deliveryMode === 'ALWAYS_SEND' || !pushDelivered);

      if (shouldSendEmail) {
        const { subject, html } = buildMessageRequestEmail({
          toName: student.name,
          fromName: fromStudentName,
          reason,
        });

        await sendSingleEmail({
          to: student.user.email,
          subject,
          html,
          studentId: student.id,
          category: 'TRANSACTIONAL',
          templateKey: 'messageRequest',
        });
      }
    }
  } catch (error) {
    logger.error('Error sending message request notification:', error);
  }
}

/**
 * Send Web Push + Automatic Transactional Email when a partner request is received.
 */
export async function notifyPartnerRequest(
  toStudentId: string,
  fromStudentName: string,
  requestId: string,
  reason: string
): Promise<void> {
  if (!isWebPushConfigured() && !isEmailConfigured()) {
    return;
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: toStudentId },
      select: {
        id: true,
        name: true,
        department: true,
        currentSemester: true,
        userId: true,
        user: {
          select: {
            email: true,
            status: true,
          },
        },
      },
    });

    if (!student) {
      logger.warn(`notifyPartnerRequest: Student ${toStudentId} not found`);
      return;
    }

    let pushDelivered = false;

    // 1. Try Web Push first
    if (isWebPushConfigured()) {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId: student.userId },
        select: {
          id: true,
          endpoint: true,
          p256dh: true,
          auth: true,
        },
      });

      if (subscriptions.length > 0) {
        const payload: NotificationPayload = {
          title: 'Partner Request',
          body: `${fromStudentName} wants to join your FYP${reason ? ` - "${reason.substring(0, 40)}${reason.length > 40 ? '...' : ''}"` : ''}`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-96x96.png',
          tag: `request-partner-${requestId}`,
          data: {
            url: '/dashboard/requests/received',
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
        pushDelivered = results.some(r => r.success);

        const expiredIds = results.filter(r => r.shouldDelete).map(r => r.id);
        if (expiredIds.length > 0) {
          await prisma.pushSubscription.deleteMany({
            where: { id: { in: expiredIds } },
          });
        }
      }
    }

    // 2. Dispatch Automatic Transactional Email via Resend according to Admin Trigger Config
    if (isEmailConfigured() && student.user?.email && student.user.status === 'ACTIVE') {
      const triggerConfig = await getEmailTriggerConfig();
      const shouldSendEmail =
        triggerConfig.partnerRequest &&
        (triggerConfig.deliveryMode === 'ALWAYS_SEND' || !pushDelivered);

      if (shouldSendEmail) {
        const { subject, html } = buildPartnerRequestEmail({
          toName: student.name,
          fromName: fromStudentName,
          fromSemester: student.currentSemester,
          reason,
        });

        await sendSingleEmail({
          to: student.user.email,
          subject,
          html,
          studentId: student.id,
          category: 'TRANSACTIONAL',
          templateKey: 'partnerRequest',
        });
      }
    }
  } catch (error) {
    logger.error('Error sending partner request notification:', error);
  }
}

/**
 * Send Web Push + Automatic Transactional Email when a request is accepted.
 */
export async function notifyRequestAccepted(
  toStudentId: string,
  type: 'MESSAGE' | 'PARTNER',
  accepterName: string
): Promise<void> {
  if (!isWebPushConfigured() && !isEmailConfigured()) {
    return;
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: toStudentId },
      select: {
        id: true,
        name: true,
        userId: true,
        user: {
          select: {
            email: true,
            status: true,
          },
        },
      },
    });

    if (!student) {
      return;
    }

    let pushDelivered = false;

    // 1. Try Web Push first
    if (isWebPushConfigured()) {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId: student.userId },
        select: {
          id: true,
          endpoint: true,
          p256dh: true,
          auth: true,
        },
      });

      if (subscriptions.length > 0) {
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

        const results = await sendPushNotificationToMany(formattedSubs, payload);
        pushDelivered = results.some(r => r.success);
      }
    }

    // 2. Dispatch Automatic Transactional Email via Resend according to Admin Trigger Config
    if (isEmailConfigured() && student.user?.email && student.user.status === 'ACTIVE') {
      const triggerConfig = await getEmailTriggerConfig();
      const shouldSendEmail =
        triggerConfig.requestAccepted &&
        (triggerConfig.deliveryMode === 'ALWAYS_SEND' || !pushDelivered);

      if (shouldSendEmail) {
        const { subject, html } = buildRequestAcceptedEmail({
          toName: student.name,
          accepterName,
          requestType: type,
        });

        await sendSingleEmail({
          to: student.user.email,
          subject,
          html,
          studentId: student.id,
          category: 'TRANSACTIONAL',
          templateKey: 'requestAccepted',
        });
      }
    }
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

/**
 * Send Web Push + Automatic Transactional Email when admin responds to or updates student feedback.
 */
export async function notifyFeedbackUpdate(
  studentId: string,
  status: string,
  adminResponse?: string | null
): Promise<void> {
  if (!isWebPushConfigured() && !isEmailConfigured()) {
    return;
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        userId: true,
        user: {
          select: {
            email: true,
            status: true,
          },
        },
      },
    });

    if (!student) {
      logger.warn(`notifyFeedbackUpdate: Student ${studentId} not found`);
      return;
    }

    let pushDelivered = false;

    // 1. Try Web Push first
    if (isWebPushConfigured()) {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId: student.userId },
        select: {
          id: true,
          endpoint: true,
          p256dh: true,
          auth: true,
        },
      });

      if (subscriptions.length > 0) {
        const formattedStatus = status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());
        const body = adminResponse
          ? `Admin note: "${adminResponse.length > 50 ? adminResponse.substring(0, 50) + '...' : adminResponse}"`
          : `Your feedback status is now marked as ${formattedStatus}.`;

        const payload: NotificationPayload = {
          title: `Feedback Update: ${formattedStatus}`,
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-96x96.png',
          tag: `feedback-update-${studentId}-${Date.now()}`,
          data: {
            url: '/dashboard/feedback',
            type: 'feedback_update',
            status,
          },
          actions: [
            { action: 'view', title: 'View Feedback' },
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
        pushDelivered = results.some(r => r.success);

        const expiredIds = results.filter(r => r.shouldDelete).map(r => r.id);
        if (expiredIds.length > 0) {
          await prisma.pushSubscription.deleteMany({
            where: { id: { in: expiredIds } },
          });
        }
      }
    }

    // 2. Dispatch Automatic Transactional Email via Resend according to Admin Trigger Config
    if (isEmailConfigured() && student.user?.email && student.user.status === 'ACTIVE') {
      const triggerConfig = await getEmailTriggerConfig();
      const shouldSendEmail =
        triggerConfig.feedbackUpdate &&
        (triggerConfig.deliveryMode === 'ALWAYS_SEND' || !pushDelivered);

      if (shouldSendEmail) {
        const { subject, html } = buildFeedbackUpdateEmail({
          toName: student.name,
          status,
          adminResponse,
        });

        await sendSingleEmail({
          to: student.user.email,
          subject,
          html,
          studentId: student.id,
          category: 'TRANSACTIONAL',
          templateKey: 'feedbackUpdate',
        });
      }
    }
  } catch (error) {
    logger.error('Error sending feedback update notification:', error);
  }
}
