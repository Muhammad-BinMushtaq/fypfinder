// hooks/request/useRequestRealtime.ts
/**
 * Request Realtime Hook
 * ---------------------
 * Listens to Supabase Realtime changes on the Request table.
 * 
 * When a change is detected (INSERT, UPDATE, DELETE), 
 * it ONLY invalidates React Query cache - NO local state updates.
 * 
 * This follows the "Backend is the Judge" pattern:
 * - Realtime is just a notification that data changed
 * - We refetch from server to get the truth
 * - No optimistic updates from realtime events
 * 
 * Usage:
 * - Call this hook at the top level of request pages
 * - Or in a provider that wraps the app
 */

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { messageRequestKeys } from "./useMessageRequests";
import { partnerRequestKeys, groupKeys } from "./usePartnerRequests";

interface UseRequestRealtimeOptions {
  /** Current user's student ID to filter relevant events */
  studentId: string | null;
  /** Whether realtime is enabled */
  enabled?: boolean;
}

export function useRequestRealtime({
  studentId,
  enabled = true,
}: UseRequestRealtimeOptions) {
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<
    ReturnType<typeof createSupabaseBrowserClient>["channel"]
  > | null>(null);

  useEffect(() => {
    // Don't subscribe if not enabled or no student ID
    if (!enabled || !studentId) {
      return;
    }

    const supabase = createSupabaseBrowserClient();

    // Create a channel for Request table changes
    const channel = supabase
      .channel("request-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events: INSERT, UPDATE, DELETE
          schema: "public",
          table: "Request",
          // We could filter by column, but it's simpler to check in handler
        },
        (payload) => {
          // Get the request data
          const request = payload.new as {
            id: string;
            fromStudentId: string;
            toStudentId: string;
            type: "MESSAGE" | "PARTNER";
            status: "PENDING" | "ACCEPTED" | "REJECTED";
          } | null;

          const oldRequest = payload.old as typeof request;

          // Only invalidate if this affects the current user
          const affectsMe =
            request?.fromStudentId === studentId ||
            request?.toStudentId === studentId ||
            oldRequest?.fromStudentId === studentId ||
            oldRequest?.toStudentId === studentId;

          if (!affectsMe) {
            return;
          }

          // Determine request type
          const type = request?.type || oldRequest?.type;

          if (type === "MESSAGE") {
            // Invalidate message request queries
            queryClient.invalidateQueries({ queryKey: messageRequestKeys.all });
          } else if (type === "PARTNER") {
            // Invalidate partner request queries
            queryClient.invalidateQueries({ queryKey: partnerRequestKeys.all });

            // If status changed to ACCEPTED, also invalidate group data
            if (request?.status === "ACCEPTED") {
              queryClient.invalidateQueries({ queryKey: groupKeys.myGroup() });
            }
          }
        }
      )
      .subscribe(() => {
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [studentId, enabled, queryClient]);

  // Return nothing - this hook is for side effects only
}

/**
 * Convenience hook that combines realtime subscription with easy setup.
 * Automatically gets student ID from the current session.
 */
export function useRequestRealtimeAuto() {
  // This would need to be connected to your auth context
  // For now, it's a placeholder showing the pattern
  
  // const { studentId } = useStudentProfile();
  // useRequestRealtime({ studentId });
}
