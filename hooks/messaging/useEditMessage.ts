// hooks/messaging/useEditMessage.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import type { Message } from "./useMessages"

interface EditMessageParams {
  messageId: string
  conversationId: string
  content: string
}

async function editMessageApi(params: EditMessageParams): Promise<Message> {
  const response = await fetch("/api/messaging/edit", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messageId: params.messageId,
      content: params.content,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to edit message")
  }

  return data.data.message
}

export function useEditMessage() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: editMessageApi,
    onSuccess: (updatedMessage, variables) => {
      // Update the message in cache
      queryClient.setQueryData<Message[]>(
        ["messages", variables.conversationId],
        (old = []) =>
          old.map((m) => (m.id === variables.messageId ? updatedMessage : m))
      )
      // Update conversations list (last message may have changed)
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to edit message")
    },
  })

  return {
    editMessage: mutation.mutate,
    editMessageAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
