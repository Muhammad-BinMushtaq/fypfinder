// services/studentPublic.service.ts
/**
 * Student Public Profile Service
 * ------------------------------
 * API contracts for viewing OTHER students' public profiles.
 * 
 * ⚠️ This is SEPARATE from student.service.ts which handles
 *    the CURRENT user's own profile.
 * 
 * ⚠️ NO React, NO hooks, NO caching logic here.
 * This is pure API contract layer.
 */

import { apiClient } from "@/services/apiClient";

/* ---------- TYPES ---------- */

export interface PublicSkill {
  id: string;
  name: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
}

export interface PublicProject {
  id: string;
  name: string;
  description?: string;
  liveLink?: string;
  githubLink?: string;
}

export interface GroupInfo {
  groupId: string;
  projectName: string;
  isLocked: boolean;
}

export interface PublicStudentProfile {
  id: string;
  name: string;
  department: string;
  semester: number;
  profilePicture?: string | null;
  interests?: string;
  availability: "AVAILABLE" | "BUSY" | "AWAY";
  // Social Links
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  // Group status
  isGrouped: boolean;
  availableForGroup: boolean;
  groupInfo: GroupInfo | null;
  // Skills & Projects
  skills: PublicSkill[];
  projects: PublicProject[];
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/* ---------- API FUNCTIONS ---------- */

/**
 * Fetch a student's PUBLIC profile by ID
 * 
 * Backend enforces:
 * - Auth via cookies (must be logged in)
 * - Returns ONLY public-safe data
 * - No private info (phone, email, linkedin, github)
 * 
 * @param studentId - The student's ID
 * @returns Public profile data
 */
export async function getPublicProfile(
  studentId: string
): Promise<PublicStudentProfile> {
  if (!studentId) {
    throw new Error("Student ID is required");
  }

  const response = await apiClient.get<ApiResponse<PublicStudentProfile>>(
    `/api/student/get-public-profile/${studentId}`
  );

  return response.data;
}
