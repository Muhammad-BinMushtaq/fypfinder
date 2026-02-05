// hooks/admin/useStudents.ts
/**
 * Students Management Hooks for Admin
 * ------------------------------------
 * Handles fetching, filtering, and managing students.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import {
  getAllStudents,
  getStudentDetails,
  suspendStudent,
  unsuspendStudent,
  deleteStudent,
  type StudentFilters,
  type StudentListItem,
  type StudentDetails,
} from "@/services/admin.service"
import { adminKeys } from "./useAdminSession"

/**
 * Fetch paginated list of students with filters
 */
export function useStudents(filters: StudentFilters = {}) {
  return useQuery({
    queryKey: adminKeys.studentsList(filters),
    queryFn: () => getAllStudents(filters),
    staleTime: 30 * 1000, // 30 seconds - students list can change frequently
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  })
}

/**
 * Fetch single student details
 */
export function useStudentDetails(studentId: string | null) {
  return useQuery({
    queryKey: adminKeys.student(studentId!),
    queryFn: () => getStudentDetails(studentId!),
    enabled: !!studentId,
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Suspend a student
 */
export function useSuspendStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentId: string) => suspendStudent(studentId),
    onSuccess: (_, studentId) => {
      // Invalidate students list to refetch
      queryClient.invalidateQueries({ queryKey: adminKeys.students() })
      
      // Update the specific student in cache if exists
      queryClient.setQueryData<StudentDetails>(
        adminKeys.student(studentId),
        (old) => old ? { ...old, status: "SUSPENDED" } : undefined
      )
      
      toast.success("Student suspended successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to suspend student")
    },
  })
}

/**
 * Unsuspend a student
 */
export function useUnsuspendStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentId: string) => unsuspendStudent(studentId),
    onSuccess: (_, studentId) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.students() })
      
      queryClient.setQueryData<StudentDetails>(
        adminKeys.student(studentId),
        (old) => old ? { ...old, status: "ACTIVE" } : undefined
      )
      
      toast.success("Student unsuspended successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unsuspend student")
    },
  })
}

/**
 * Delete a student (approve deletion request)
 */
export function useDeleteStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentId: string) => deleteStudent(studentId),
    onSuccess: (_, studentId) => {
      // Invalidate students list
      queryClient.invalidateQueries({ queryKey: adminKeys.students() })
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: adminKeys.student(studentId) })
      
      toast.success("Student deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete student")
    },
  })
}

// Re-export types for convenience
export type { StudentListItem, StudentDetails, StudentFilters }
