// lib/apiClient.ts
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""; // optional base URL

export async function apiClient(
    endpoint: string,
    options: RequestInit = {},
    accessToken?: string,
): Promise<any> {
    try {
        const headers = new Headers(options.headers || {});

        // ✅ Include Bearer token if available
        if (accessToken) {
            headers.set("Authorization", `Bearer ${accessToken}`);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            credentials: "include", // important for cookies (refresh token)
        });

        // If token expired → try refreshing
        if (response.status === 401) {
            const refreshRes = await fetch("/api/auth/refresh", {
                method: "POST",
                credentials: "include",
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                const newAccessToken = data.accessToken;

                // ✅ Retry the original request with the new token
                const retryHeaders = new Headers(options.headers || {});
                retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);

                const retryRes = await fetch(`${API_BASE_URL}${endpoint}`, {
                    ...options,
                    headers: retryHeaders,
                    credentials: "include",
                });

                return retryRes.json();
            } else {
                throw new Error("Session expired. Please log in again.");
            }
        }

        // Normal response
        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error("API request error:", error);
        throw error;
    }
}
