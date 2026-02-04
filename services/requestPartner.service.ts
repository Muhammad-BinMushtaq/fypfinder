// services/requestPartner.service.ts
/**
 * Partner Request Service
 * -----------------------
 * API contracts for PARTNER type requests.
 * Partner requests are for forming FYP groups.
 * 
 * Accepting a partner request:
 * - Creates or updates FYP group
 * - Adds both students to the same group
 * - May lock group if MAX_PARTNERS (3) is reached
 * - Enables messaging between partners
 * 
 * This is MORE consequential than message requests!
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

export interface PartnerRequest {
  id: string;
  fromStudentId: string;
  toStudentId: string;
  type: "PARTNER";
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

// ============ SEND PARTNER REQUEST ============

export interface SendPartnerRequestPayload {
  toStudentId: string;
  reason?: string;
}

/**
 * Send a partner request to another student
 * @param payload - Target student ID and optional reason
 * @returns The created request
 * 
 * Backend validates:
 * - No self-request
 * - Both students exist
 * - Same semester requirement
 * - Sender's group is not locked
 * - No duplicate pending request
 */
export async function sendPartnerRequest(
  payload: SendPartnerRequestPayload
): Promise<PartnerRequest> {
  const response = await apiClient.post<ApiResponse<PartnerRequest>>(
    "/api/request/partner/send",
    payload
  );
  return response.data;
}

// ============ GET SENT REQUESTS ============

/**
 * Fetch all partner requests sent BY the current user
 * @returns Array of sent partner requests with receiver info
 */
export async function getSentPartnerRequests(): Promise<PartnerRequest[]> {
  const response = await apiClient.get<ApiResponse<PartnerRequest[]>>(
    "/api/request/partner/get-sent"
  );
  return response.data;
}

// ============ GET RECEIVED REQUESTS ============

/**
 * Fetch all partner requests sent TO the current user
 * @returns Array of received partner requests with sender info
 */
export async function getReceivedPartnerRequests(): Promise<PartnerRequest[]> {
  const response = await apiClient.get<ApiResponse<PartnerRequest[]>>(
    "/api/request/partner/get-received"
  );
  return response.data;
}

// ============ ACCEPT REQUEST ============

export interface AcceptRejectPayload {
  requestId: string;
}

/**
 * Accept a received partner request
 * @param payload - Request ID to accept
 * @returns Updated request with ACCEPTED status
 * 
 * Side effects (handled by backend):
 * - FYP group is created or updated
 * - Both students become group members
 * - Group may be locked if full (3 members)
 */
export async function acceptPartnerRequest(
  payload: AcceptRejectPayload
): Promise<PartnerRequest> {
  const response = await apiClient.post<ApiResponse<PartnerRequest>>(
    "/api/request/partner/accept",
    payload
  );
  return response.data;
}

// ============ REJECT REQUEST ============

/**
 * Reject a received partner request
 * @param payload - Request ID to reject
 * @returns Updated request with REJECTED status
 */
export async function rejectPartnerRequest(
  payload: AcceptRejectPayload
): Promise<PartnerRequest> {
  const response = await apiClient.post<ApiResponse<PartnerRequest>>(
    "/api/request/partner/reject",
    payload
  );
  return response.data;
}
