import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getMyValidations, deleteValidation, type ValidationHistoryResponse } from "@/services/fypIdeas.service"

export function useMyValidations(limit = 10, offset = 0, enabled = true) {
  const query = useQuery<ValidationHistoryResponse, Error>({
    queryKey: ["fyp-validations", limit, offset],
    queryFn: () => getMyValidations(limit, offset),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  return {
    validations: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    remainingToday: query.data?.remainingToday ?? 3,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useDeleteValidation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteValidation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fyp-validations"] })
    },
  })
}
