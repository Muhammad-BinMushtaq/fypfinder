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

export interface MicrosoftAuthResponse {
  url: string;
}

/**
 * Initiate Microsoft OAuth login
 * Returns the OAuth URL to redirect the user to
 */
export async function loginWithMicrosoft(redirectTo?: string): Promise<string> {
  const response = await apiClient.post<MicrosoftAuthResponse>(
    "/api/auth/microsoft",
    { redirectTo: redirectTo || "/dashboard/profile" }
  );
  return response.url;
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
