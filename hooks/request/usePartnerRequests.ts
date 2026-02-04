// hooks/request/usePartnerRequests.ts
/**
 * Partner Request Hooks
 * ---------------------
 * React Query hooks for PARTNER type requests.
 * 
 * Query Keys:
 * - ["requests", "partner", "sent"]
 * - ["requests", "partner", "received"]
 * 
 * These are SEPARATE from message request hooks.
 * Partner requests mutate FYP groups!
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  sendPartnerRequest,
  getSentPartnerRequests,
  getReceivedPartnerRequests,
  acceptPartnerRequest,
  rejectPartnerRequest,
  SendPartnerRequestPayload,
  AcceptRejectPayload,
  PartnerRequest,
} from "@/services/requestPartner.service";
import { toast } from "react-toastify";

// ============ QUERY KEYS ============

export const partnerRequestKeys = {
  all: ["requests", "partner"] as const,
  sent: () => [...partnerRequestKeys.all, "sent"] as const,
  received: () => [...partnerRequestKeys.all, "received"] as const,
};

// Group keys for invalidation after accept
export const groupKeys = {
  all: ["group"] as const,
  myGroup: () => [...groupKeys.all, "my-group"] as const,
};

// ============ SEND PARTNER REQUEST ============

export function useSendPartnerRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendPartnerRequestPayload) =>
      sendPartnerRequest(payload),

    onSuccess: () => {
      // Invalidate sent requests to refetch
      queryClient.invalidateQueries({ queryKey: partnerRequestKeys.sent() });
      toast.success("Partner request sent successfully");
    },

    onError: (error: Error) => {
      toast.error(error.message || "Failed to send partner request");
    },
  });
}

// ============ GET SENT PARTNER REQUESTS ============

export function useSentPartnerRequests() {
  return useQuery({
    queryKey: partnerRequestKeys.sent(),
    queryFn: getSentPartnerRequests,
    staleTime: 0, // Always consider stale - refetch on every mount
    refetchOnMount: "always", // Always refetch when component mounts
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 30, // Refetch every 30 seconds as backup
  });
}

// ============ GET RECEIVED PARTNER REQUESTS ============

export function useReceivedPartnerRequests() {
  return useQuery({
    queryKey: partnerRequestKeys.received(),
    queryFn: getReceivedPartnerRequests,
    staleTime: 0, // Always consider stale - refetch on every mount
    refetchOnMount: "always", // Always refetch when component mounts
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 30, // Refetch every 30 seconds as backup
  });
}

// ============ ACCEPT PARTNER REQUEST ============

export function useAcceptPartnerRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AcceptRejectPayload) => acceptPartnerRequest(payload),

    onSuccess: () => {
      // Partner accept has side effects:
      // 1. Request status changes
      // 2. FYP Group is created or updated
      // 3. Both students become group members
      
      // Invalidate requests
      queryClient.invalidateQueries({ queryKey: partnerRequestKeys.received() });
      queryClient.invalidateQueries({ queryKey: partnerRequestKeys.sent() });
      
      // CRITICAL: Invalidate group data
      queryClient.invalidateQueries({ queryKey: groupKeys.myGroup() });
      
      toast.success("Partner request accepted! You are now in the same group.");
    },

    onError: (error: Error) => {
      toast.error(error.message || "Failed to accept partner request");
    },
  });
}

// ============ REJECT PARTNER REQUEST ============

export function useRejectPartnerRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AcceptRejectPayload) => rejectPartnerRequest(payload),

    onSuccess: () => {
      // Invalidate received requests
      queryClient.invalidateQueries({ queryKey: partnerRequestKeys.received() });
      toast.success("Partner request rejected");
    },

    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject partner request");
    },
  });
}

// ============ UTILITY: INVALIDATE ALL PARTNER REQUESTS ============

export function useInvalidatePartnerRequests() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: partnerRequestKeys.all });
  };
}
