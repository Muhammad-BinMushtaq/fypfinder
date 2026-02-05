// services/student.service.ts

import { apiClient } from "@/services/apiClient";

export type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type AvailabilityStatus = "AVAILABLE" | "BUSY" | "AWAY";

export interface Skill {
  id: string;
  name: string;
  description?: string;
  level: ExperienceLevel;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  liveLink?: string;
  githubLink?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  department: string;
  semester: number;
  profilePicture?: string;
  interests?: string;
  phone?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  availability: AvailabilityStatus;
  skills: Skill[];
  projects: Project[];
  user?: {
    status: "ACTIVE" | "SUSPENDED" | "DELETION_REQUESTED";
    email: string;
    createdAt: string;
  };
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/* ---------- PROFILE ---------- */

export async function getMyProfile(): Promise<StudentProfile> {
  const response = await apiClient.get<ApiResponse<StudentProfile>>(
    "/api/student/get-my-profile"
  );
  return response.data;
}

export async function updateMyProfile(data: Partial<{
  name: string;
  interests: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
  availability: AvailabilityStatus;
  currentSemester: number;
  profilePicture: string;
}>): Promise<StudentProfile> {
  const response = await apiClient.patch<ApiResponse<StudentProfile>>(
    "/api/student/update-my-profile",
    data
  );
  return response.data;
}

/* ---------- SKILLS ---------- */

export async function addSkill(data: {
  name: string;
  level: ExperienceLevel;
  description?: string;
}): Promise<Skill> {
  const response = await apiClient.post<ApiResponse<Skill>>(
    "/api/student/skill/add",
    data
  );
  return response.data;
}

export async function updateSkill(skillId: string, data: {
  name?: string;
  level?: ExperienceLevel;
  description?: string;
}): Promise<Skill> {
  const response = await apiClient.patch<ApiResponse<Skill>>(
    "/api/student/skill/update",
    { skillId, ...data }
  );
  return response.data;
}

export async function removeSkill(skillId: string): Promise<{ success: boolean }> {
  const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
    `/api/student/skill/remove?skillId=${skillId}`
  );
  return response.data;
}

/* ---------- PROJECTS ---------- */

export async function addProject(data: {
  name: string;
  description?: string;
  liveLink?: string;
  githubLink?: string;
}): Promise<Project> {
  const response = await apiClient.post<ApiResponse<Project>>(
    "/api/student/project/add",
    data
  );
  return response.data;
}

export async function updateProject(projectId: string, data: {
  name?: string;
  description?: string;
  liveLink?: string;
  githubLink?: string;
}): Promise<Project> {
  const response = await apiClient.patch<ApiResponse<Project>>(
    "/api/student/project/update",
    { projectId, ...data }
  );
  return response.data;
}

export async function removeProject(projectId: string): Promise<{ success: boolean }> {
  const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
    `/api/student/project/remove?projectId=${projectId}`
  );
  return response.data;
}

/* ---------- ACCOUNT MANAGEMENT ---------- */

export interface DeletionRequestResponse {
  success: boolean
  message: string
}

export interface StudentAccountStatus {
  status: "ACTIVE" | "SUSPENDED" | "DELETION_REQUESTED"
  canMessage: boolean
  canSendRequests: boolean
  canDiscoverStudents: boolean
}

/**
 * Request account deletion
 * Sets user status to DELETION_REQUESTED
 * Admin must approve for actual deletion
 */
export async function requestAccountDeletion(): Promise<DeletionRequestResponse> {
  const response = await fetch("/api/student/delete-my-profile", {
    method: "PATCH",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to request deletion")
  }

  return {
    success: true,
    message: data.message || "Deletion request sent for admin approval",
  }
}

/**
 * Cancel deletion request (if allowed)
 * Returns status to ACTIVE
 */
export async function cancelDeletionRequest(): Promise<DeletionRequestResponse> {
  const response = await fetch("/api/student/cancel-deletion", {
    method: "PATCH",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to cancel deletion request")
  }

  return {
    success: true,
    message: data.message || "Deletion request cancelled",
  }
}
