// services/auth.service.ts

/**
 * Auth Service
 * -------------
 * Contains ONLY API calls related to authentication.
 * No React, no state, no logic.
 */

import { apiClient } from "@/services/apiClient";

export interface AuthResponse {
  success: true;
}

/**
 * Logout user
 */
export function logout() {
  return apiClient.post<AuthResponse>(
    "/api/auth/logout"
  );
}

/**
 * Fetch current session
 */
export function getSession() {
  return apiClient.get("/api/auth/session");
}
