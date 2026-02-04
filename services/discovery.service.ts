// services/discovery.service.ts
/**
 * Discovery Service
 * -----------------
 * API contracts for student discovery.
 * Handles fetching matched students list.
 * 
 * ⚠️ NO React, NO hooks, NO caching logic here.
 * This is pure API contract layer.
 */

import { apiClient } from "@/services/apiClient";

/* ---------- TYPES ---------- */

export interface MatchedStudent {
  id: string;
  name: string;
  department: string;
  semester: number;
  profilePicture: string | null;
  skills: string[];
}

export interface DiscoveryPagination {
  limit: number;
  offset: number;
  total: number;
}

export interface DiscoveryResponse {
  items: MatchedStudent[];
  pagination: DiscoveryPagination;
}

export interface DiscoveryFilters {
  department?: string;
  semester?: number;
  skills?: string[];
  limit?: number;
  offset?: number;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/* ---------- API FUNCTIONS ---------- */

/**
 * Fetch matched students from discovery API
 * Backend enforces:
 * - Auth via cookies
 * - Excludes current user
 * - Only AVAILABLE students
 * - Only semester 5-7
 * - Only ACTIVE accounts
 */
export async function getMatchedStudents(
  filters: DiscoveryFilters = {}
): Promise<DiscoveryResponse> {
  // Build query params
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 12,
    offset: filters.offset ?? 0,
  };

  if (filters.department) {
    params.department = filters.department;
  }

  if (filters.semester) {
    params.semester = filters.semester;
  }

  const response = await apiClient.get<ApiResponse<DiscoveryResponse>>(
    "/api/discovery/get-matched-students",
    params
  );

  return response.data;
}

/**
 * Fetch matched students with skill filters
 * (Separate function to handle array params properly)
 */
export async function getMatchedStudentsWithSkills(
  filters: DiscoveryFilters = {}
): Promise<DiscoveryResponse> {
  const baseUrl = "/api/discovery/get-matched-students";
  
  // Build URL with proper skill params
  const url = new URL(baseUrl, window.location.origin);
  
  url.searchParams.set("limit", String(filters.limit ?? 12));
  url.searchParams.set("offset", String(filters.offset ?? 0));
  
  if (filters.department) {
    url.searchParams.set("department", filters.department);
  }
  
  if (filters.semester) {
    url.searchParams.set("semester", String(filters.semester));
  }
  
  // Append each skill as separate param
  if (filters.skills?.length) {
    filters.skills.forEach((skill) => {
      url.searchParams.append("skill", skill);
    });
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch students");
  }

  const json: ApiResponse<DiscoveryResponse> = await response.json();
  return json.data;
}
