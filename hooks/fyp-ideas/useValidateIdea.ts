// hooks/fyp-ideas/useValidateIdea.ts

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import {
  validateIdea,
  type IdeaInput,
  type ValidationResult,
} from "@/services/fypIdeas.service"

export function useValidateIdea() {
  const queryClient = useQueryClient()

  const mutation = useMutation<ValidationResult, Error, IdeaInput>({
    mutationFn: validateIdea,
    onSuccess: () => {
      // Invalidate history so it shows the new validation
      queryClient.invalidateQueries({ queryKey: ["fyp-validations"] })
    },
    onError: (error) => {
      toast.error(error.message || "Failed to validate idea")
    },
  })

  return {
    validate: mutation.mutate,
    validateAsync: mutation.mutateAsync,
    data: mutation.data ?? null,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  }
}
