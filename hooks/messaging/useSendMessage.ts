// hooks/messaging/useSendMessage.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import type { Message } from "./useMessages"

interface SendMessageParams {
  conversationId: string
  content: string
  currentStudentId: string
  currentStudentName: string
}

async function sendMessage(params: SendMessageParams): Promise<Message> {
  const response = await fetch("/api/messaging/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversationId: params.conversationId,
      content: params.content,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to send message")
  }

  return data.message
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: sendMessage,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["messages", variables.conversationId],
      })

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<Message[]>([
        "messages",
        variables.conversationId,
      ])

      // Create optimistic message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: variables.conversationId,
        senderId: variables.currentStudentId,
        content: variables.content,
        isRead: false,
        createdAt: new Date().toISOString(),
        sender: {
          id: variables.currentStudentId,
          name: variables.currentStudentName,
          profilePicture: null,
        },
        isOptimistic: true,
      }

      // Optimistically add to cache
      queryClient.setQueryData<Message[]>(
        ["messages", variables.conversationId],
        (old = []) => [...old, optimisticMessage]
      )

      return { previousMessages, optimisticMessage }
    },
    onSuccess: (realMessage, variables, context) => {
      // Replace optimistic message with real one
      if (context?.optimisticMessage) {
        queryClient.setQueryData<Message[]>(
          ["messages", variables.conversationId],
          (old = []) =>
            old.map((m) =>
              m.id === context.optimisticMessage.id ? realMessage : m
            )
        )
      }

      // Update conversations list to show new last message
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["messages", variables.conversationId],
          context.previousMessages
        )
      }

      toast.error(error instanceof Error ? error.message : "Failed to send message")
    },
  })

  return {
    sendMessage: mutation.mutate,
    sendMessageAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
