// services/requestMessage.service.ts
/**
 * Message Request Service
 * -----------------------
 * API contracts for MESSAGE type requests.
 * Message requests enable communication permission between students.
 * 
 * Accepting a message request:
 * - Grants messaging permission between both students
 * - Does NOT create or modify FYP groups
 */

import { apiClient } from "@/services/apiClient";

// ============ TYPE DEFINITIONS ============

export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface StudentPreview {
  id: string;
  name: string;
  department: string;
  currentSemester: number;
  profilePicture: string | null;
}

export interface MessageRequest {
  id: string;
  fromStudentId: string;
  toStudentId: string;
  type: "MESSAGE";
  status: RequestStatus;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
  // Populated relations
  fromStudent?: StudentPreview;
  toStudent?: StudentPreview;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============ SEND MESSAGE REQUEST ============

export interface SendMessageRequestPayload {
  toStudentId: string;
  reason?: string;
}

/**
 * Send a message request to another student
 * @param payload - Target student ID and optional reason
 * @returns The created request
 * 
 * Backend validates:
 * - No self-request
 * - Target student exists
 * - No duplicate pending request
 */
export async function sendMessageRequest(
  payload: SendMessageRequestPayload
): Promise<MessageRequest> {
  const response = await apiClient.post<ApiResponse<MessageRequest>>(
    "/api/request/message/send",
    payload
  );
  return response.data;
}

// ============ GET SENT REQUESTS ============

/**
 * Fetch all message requests sent BY the current user
 * @returns Array of sent message requests with receiver info
 */
export async function getSentMessageRequests(): Promise<MessageRequest[]> {
  const response = await apiClient.get<ApiResponse<MessageRequest[]>>(
    "/api/request/message/get-sent"
  );
  return response.data;
}

// ============ GET RECEIVED REQUESTS ============

/**
 * Fetch all message requests sent TO the current user
 * @returns Array of received message requests with sender info
 */
export async function getReceivedMessageRequests(): Promise<MessageRequest[]> {
  const response = await apiClient.get<ApiResponse<MessageRequest[]>>(
    "/api/request/message/get-received"
  );
  return response.data;
}

// ============ ACCEPT REQUEST ============

export interface AcceptRejectPayload {
  requestId: string;
}

/**
 * Accept a received message request
 * @param payload - Request ID to accept
 * @returns Updated request with ACCEPTED status
 * 
 * Side effects (handled by backend):
 * - Messaging permission is enabled between both students
 */
export async function acceptMessageRequest(
  payload: AcceptRejectPayload
): Promise<MessageRequest> {
  const response = await apiClient.post<ApiResponse<MessageRequest>>(
    "/api/request/message/accept",
    payload
  );
  return response.data;
}

// ============ REJECT REQUEST ============

/**
 * Reject a received message request
 * @param payload - Request ID to reject
 * @returns Updated request with REJECTED status
 */
export async function rejectMessageRequest(
  payload: AcceptRejectPayload
): Promise<MessageRequest> {
  const response = await apiClient.post<ApiResponse<MessageRequest>>(
    "/api/request/message/reject",
    payload
  );
  return response.data;
}
