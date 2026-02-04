// contexts/NotificationContext.tsx
/**
 * Notification Context
 * --------------------
 * Global context for real-time notifications.
 * 
 * Features:
 * - Listens to Supabase Realtime for incoming requests
 * - Shows toast notifications for new requests
 * - Maintains a list of unread notifications
 * - Provides notification bell badge count
 * 
 * This should wrap the dashboard to enable notifications.
 */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useMyProfile } from "@/hooks/student/useMyProfile";
import { messageRequestKeys } from "@/hooks/request/useMessageRequests";
import { partnerRequestKeys, groupKeys } from "@/hooks/request/usePartnerRequests";
import { toast } from "react-toastify";

// ============ TYPES ============

export interface Notification {
  id: string;
  type: "MESSAGE_REQUEST" | "PARTNER_REQUEST";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  requestId: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// ============ PROVIDER ============

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const { profile } = useMyProfile();
  const channelRef = useRef<ReturnType<
    ReturnType<typeof createSupabaseBrowserClient>["channel"]
  > | null>(null);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!profile?.id) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const studentId = profile.id;

    // Create a channel for Request table changes
    // Note: For Supabase Realtime to work, you need to:
    // 1. Enable Realtime on the "Request" table in Supabase Dashboard
    // 2. Go to Database > Replication > Enable for "Request" table
    // 3. Add a RLS policy that allows the user to see their own requests
    const channel = supabase
      .channel(`request-notifications-${studentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Request",
          filter: `toStudentId=eq.${studentId}`,
        },
        (payload) => {
          console.log("[Notification] Request change:", payload.eventType, payload);

          const request = payload.new as {
            id: string;
            fromStudentId: string;
            toStudentId: string;
            type: "MESSAGE" | "PARTNER";
            status: "PENDING" | "ACCEPTED" | "REJECTED";
            reason?: string;
          } | null;

          const oldRequest = payload.old as typeof request;

          // Check if this affects the current user
          const isReceiver = request?.toStudentId === studentId;
          const isSender = request?.fromStudentId === studentId;
          const wasReceiver = oldRequest?.toStudentId === studentId;
          const wasSender = oldRequest?.fromStudentId === studentId;

          // Determine request type
          const type = request?.type || oldRequest?.type;

          // Invalidate relevant caches
          if (isReceiver || isSender || wasReceiver || wasSender) {
            if (type === "MESSAGE") {
              console.log("[Notification] Invalidating MESSAGE request cache");
              queryClient.invalidateQueries({ queryKey: messageRequestKeys.all });
            } else if (type === "PARTNER") {
              console.log("[Notification] Invalidating PARTNER request cache");
              queryClient.invalidateQueries({ queryKey: partnerRequestKeys.all });
              
              // If accepted, also invalidate group
              if (request?.status === "ACCEPTED") {
                queryClient.invalidateQueries({ queryKey: groupKeys.myGroup() });
              }
            }
          }

          // Show notification for NEW incoming requests (INSERT where I'm receiver)
          if (payload.eventType === "INSERT" && isReceiver && request?.status === "PENDING") {
            const notification: Notification = {
              id: `notif-${request.id}-${Date.now()}`,
              type: type === "MESSAGE" ? "MESSAGE_REQUEST" : "PARTNER_REQUEST",
              title: type === "MESSAGE" ? "New Message Request" : "New Partner Request",
              message: type === "MESSAGE" 
                ? "Someone wants to send you a message!"
                : "Someone wants to be your FYP partner!",
              timestamp: new Date(),
              read: false,
              requestId: request.id,
            };

            setNotifications((prev) => [notification, ...prev].slice(0, 20)); // Keep max 20

            // Show toast notification
            toast.info(notification.title, {
              onClick: () => {
                // Navigate to requests page when clicked
                window.location.href = type === "MESSAGE" 
                  ? "/dashboard/requests/messages"
                  : "/dashboard/requests/partner";
              },
            });
          }
        }
      )
      // Also listen for UPDATE events on requests I sent (for acceptance notifications)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Request",
          filter: `fromStudentId=eq.${studentId}`,
        },
        (payload) => {
          console.log("[Notification] Sent request updated:", payload);
          
          const request = payload.new as {
            id: string;
            fromStudentId: string;
            toStudentId: string;
            type: "MESSAGE" | "PARTNER";
            status: "PENDING" | "ACCEPTED" | "REJECTED";
          } | null;

          const oldRequest = payload.old as typeof request;

          // Invalidate caches
          if (request?.type === "MESSAGE") {
            queryClient.invalidateQueries({ queryKey: messageRequestKeys.all });
          } else if (request?.type === "PARTNER") {
            queryClient.invalidateQueries({ queryKey: partnerRequestKeys.all });
            if (request?.status === "ACCEPTED") {
              queryClient.invalidateQueries({ queryKey: groupKeys.myGroup() });
            }
          }

          // Show toast for accepted requests
          if (request?.status === "ACCEPTED" && oldRequest?.status === "PENDING") {
            const notification: Notification = {
              id: `notif-${request.id}-${Date.now()}`,
              type: request.type === "MESSAGE" ? "MESSAGE_REQUEST" : "PARTNER_REQUEST",
              title: request.type === "MESSAGE" ? "Request Accepted!" : "Partner Request Accepted!",
              message: request.type === "MESSAGE"
                ? "Your message request was accepted! You can now chat."
                : "Your partner request was accepted! Check your group.",
              timestamp: new Date(),
              read: false,
              requestId: request.id,
            };

            setNotifications((prev) => [notification, ...prev].slice(0, 20));
            toast.success(notification.title);
          }
        }
      )
      .subscribe((status) => {
        console.log("[Notification] Subscription status:", status);
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      console.log("[Notification] Unsubscribing");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [profile?.id, queryClient]);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        isConnected,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// ============ HOOK ============

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
