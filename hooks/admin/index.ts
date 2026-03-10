// hooks/admin/index.ts
/**
 * Admin Hooks - Barrel Export
 */

export { useAdminSession, useRequireAdmin, adminKeys } from "./useAdminSession"
export { 
  useStudents, 
  useStudentDetails, 
  useSuspendStudent, 
  useUnsuspendStudent,
  useUpdateStudent,
} from "./useStudents"
export type { StudentListItem, StudentDetails, StudentFilters, StudentFullProfile } from "./useStudents"
export { 
  useAdminConversations, 
  useAdminMessages,
} from "./useAdminConversations"
export type { AdminConversation, AdminMessage } from "./useAdminConversations"
export { useAdminStats } from "./useAdminStats"
export type { AdminStats } from "./useAdminStats"
export { useAdminReports } from "./useAdminReports"
export type { AdminReports } from "./useAdminReports"
