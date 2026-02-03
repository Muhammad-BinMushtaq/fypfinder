// services/apiClient.ts

/**
 * Centralized API client
 * Handles:
 * - SSR & CSR URLs
 * - Cookies (auth)
 * - JSON & FormData
 * - Errors
 * - Query params
 */

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiRequestOptions {
  method?: HttpMethod;
  params?: Record<string, string | number | boolean | undefined>;
  body?: any;
  headers?: HeadersInit;
}

/**
 * Decide base URL depending on environment
 */
function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * Core request function
 */
async function request<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const baseUrl = getBaseUrl();

  const url = new URL(
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`,
    baseUrl
  );

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const isFormData = options.body instanceof FormData;

  const headers = new Headers(options.headers);

  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers,
    credentials: "include",
    body: isFormData
      ? options.body
      : options.body
        ? JSON.stringify(options.body)
        : undefined,
  });

  let responseData: any = null;
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    const message =
      responseData?.message ||
      responseData?.error ||
      response.statusText ||
      "Something went wrong";
    throw new ApiError(message, response.status, responseData);
  }

  return responseData as T;
}

/**
 * Public API helpers
 */
export const apiClient = {
  get: <T>(endpoint: string, params?: ApiRequestOptions["params"]) =>
    request<T>(endpoint, { method: "GET", params }),

  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: "POST", body }),

  put: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: "PUT", body }),

  patch: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: "PATCH", body }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};
