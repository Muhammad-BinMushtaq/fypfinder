// services/auth.service.ts

/**
 * Auth Service
 * -------------
 * Contains ONLY API calls related to authentication.
 * No React, no state, no logic.
 */

import { apiClient } from "@/services/apiClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: true;
}

/**
 * Login user
 */
export function login(payload: LoginPayload) {
  return apiClient.post<AuthResponse>(
    "/api/auth/login",
    payload
  );
}

/**
 * Signup user
 */
export function signup(payload: SignupPayload) {
  return apiClient.post<AuthResponse>(
    "/api/auth/signup",
    payload
  );
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
