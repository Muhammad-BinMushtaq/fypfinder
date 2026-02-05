// hooks/student/useRequestDeletion.ts
/**
 * Request Deletion Hook
 * ---------------------
 * Handles account deletion request flow for students.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { requestAccountDeletion, cancelDeletionRequest } from "@/services/student.service"

const PROFILE_QUERY_KEY = ["student", "my-profile"]

export function useRequestDeletion() {
  const queryClient = useQueryClient()

  const requestMutation = useMutation({
    mutationFn: requestAccountDeletion,
    onSuccess: (data) => {
      // Invalidate profile to reflect new status
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ["session"] })
      
      toast.success(data.message || "Deletion request sent for admin approval")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to request account deletion")
    },
  })

  const cancelMutation = useMutation({
    mutationFn: cancelDeletionRequest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ["session"] })
      
      toast.success(data.message || "Deletion request cancelled")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel deletion request")
    },
  })

  return {
    requestDeletion: requestMutation.mutate,
    requestDeletionAsync: requestMutation.mutateAsync,
    isRequesting: requestMutation.isPending,
    requestError: requestMutation.error,
    
    cancelDeletion: cancelMutation.mutate,
    cancelDeletionAsync: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    cancelError: cancelMutation.error,
  }
}
