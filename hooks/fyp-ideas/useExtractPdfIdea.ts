import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import {
  extractPdfIdea,
  type PdfIdeaExtractionResponse,
} from "@/services/fypIdeas.service"

export function useExtractPdfIdea() {
  const queryClient = useQueryClient()

  const mutation = useMutation<PdfIdeaExtractionResponse, Error, File>({
    mutationFn: extractPdfIdea,
    onSuccess: (result) => {
      if (result.validation) {
        queryClient.invalidateQueries({ queryKey: ["fyp-validations"] })
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process PDF")
    },
  })

  return {
    extractPdf: mutation.mutate,
    extractPdfAsync: mutation.mutateAsync,
    data: mutation.data ?? null,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  }
}

