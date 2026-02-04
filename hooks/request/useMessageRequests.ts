// hooks/request/useMessageRequests.ts
/**
 * Message Request Hooks
 * ---------------------
 * React Query hooks for MESSAGE type requests.
 * 
 * Query Keys:
 * - ["requests", "message", "sent"]
 * - ["requests", "message", "received"]
 * 
 * These are SEPARATE from partner request hooks.
 * Never mix message and partner logic.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  sendMessageRequest,
  getSentMessageRequests,
  getReceivedMessageRequests,
  acceptMessageRequest,
  rejectMessageRequest,
  SendMessageRequestPayload,
  AcceptRejectPayload,
  MessageRequest,
} from "@/services/requestMessage.service";
import { toast } from "react-toastify";

// ============ QUERY KEYS ============

export const messageRequestKeys = {
  all: ["requests", "message"] as const,
  sent: () => [...messageRequestKeys.all, "sent"] as const,
  received: () => [...messageRequestKeys.all, "received"] as const,
};

// ============ SEND MESSAGE REQUEST ============

export function useSendMessageRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessageRequestPayload) =>
      sendMessageRequest(payload),

    onSuccess: () => {
      // Invalidate sent requests to refetch
      queryClient.invalidateQueries({ queryKey: messageRequestKeys.sent() });
      toast.success("Message request sent successfully");
    },

    onError: (error: Error) => {
      toast.error(error.message || "Failed to send message request");
    },
  });
}

// ============ GET SENT MESSAGE REQUESTS ============

export function useSentMessageRequests() {
  return useQuery({
    queryKey: messageRequestKeys.sent(),
    queryFn: getSentMessageRequests,
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

// ============ GET RECEIVED MESSAGE REQUESTS ============

export function useReceivedMessageRequests() {
  return useQuery({
    queryKey: messageRequestKeys.received(),
    queryFn: getReceivedMessageRequests,
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

// ============ ACCEPT MESSAGE REQUEST ============

export function useAcceptMessageRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AcceptRejectPayload) => acceptMessageRequest(payload),

    onSuccess: () => {
      // Invalidate received requests
      queryClient.invalidateQueries({ queryKey: messageRequestKeys.received() });
      toast.success("Message request accepted");
    },

    onError: (error: Error) => {
      toast.error(error.message || "Failed to accept message request");
    },
  });
}

// ============ REJECT MESSAGE REQUEST ============

export function useRejectMessageRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AcceptRejectPayload) => rejectMessageRequest(payload),

    onSuccess: () => {
      // Invalidate received requests
      queryClient.invalidateQueries({ queryKey: messageRequestKeys.received() });
      toast.success("Message request rejected");
    },

    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject message request");
    },
  });
}

// ============ UTILITY: INVALIDATE ALL MESSAGE REQUESTS ============

export function useInvalidateMessageRequests() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: messageRequestKeys.all });
  };
}
