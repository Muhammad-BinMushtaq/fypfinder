// hooks/request/index.ts
/**
 * Request Hooks Barrel Export
 * ---------------------------
 * Clean imports for request-related hooks.
 * 
 * Message and Partner are kept SEPARATE intentionally.
 */

// Message Request Hooks
export {
  messageRequestKeys,
  useSendMessageRequest,
  useSentMessageRequests,
  useReceivedMessageRequests,
  useAcceptMessageRequest,
  useRejectMessageRequest,
  useInvalidateMessageRequests,
} from "./useMessageRequests";

// Partner Request Hooks
export {
  partnerRequestKeys,
  groupKeys,
  useSendPartnerRequest,
  useSentPartnerRequests,
  useReceivedPartnerRequests,
  useAcceptPartnerRequest,
  useRejectPartnerRequest,
  useInvalidatePartnerRequests,
} from "./usePartnerRequests";

// Realtime
export { useRequestRealtime } from "./useRequestRealtime";
