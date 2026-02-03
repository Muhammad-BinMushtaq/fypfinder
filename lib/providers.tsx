"use client"

import React from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { getQueryClient } from "./reactQuery"


interface ProvidersProps {
  children: React.ReactNode
}


export function AppProviders({ children }: ProvidersProps) {
  // ✅ Get QueryClient instance (singleton)
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
