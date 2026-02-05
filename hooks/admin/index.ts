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
} from "./useStudents"
export type { StudentListItem, StudentDetails, StudentFilters } from "./useStudents"
export { 
  useAdminConversations, 
  useAdminMessages,
} from "./useAdminConversations"
export type { AdminConversation, AdminMessage } from "./useAdminConversations"
export { useAdminStats } from "./useAdminStats"
export type { AdminStats } from "./useAdminStats"
