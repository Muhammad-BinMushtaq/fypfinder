// hooks/messaging/useStartConversation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

interface StartConversationParams {
  targetStudentId: string
}

interface ConversationResponse {
  conversation: {
    id: string
    studentAId: string
    studentBId: string
    createdAt: string
    updatedAt: string
  }
}

async function startConversation(
  params: StartConversationParams
): Promise<ConversationResponse> {
  const response = await fetch("/api/messaging/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to start conversation")
  }

  return data
}

export function useStartConversation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: startConversation,
    onSuccess: (data) => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: ["conversations"] })

      // Navigate to the conversation
      router.push(`/dashboard/messages/${data.conversation.id}`)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to start conversation"
      )
    },
  })

  return {
    startConversation: mutation.mutate,
    startConversationAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
