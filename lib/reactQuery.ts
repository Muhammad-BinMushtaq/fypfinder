// lib/reactQuery.ts
// React Query configuration - centralized with offline persistence

import { QueryClient } from "@tanstack/react-query"

/**
 * Create a QueryClient instance with production-ready defaults
 * This is called once at app startup and shared across the entire app
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,  // 5 minutes - data considered fresh
        gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep in storage for offline
        retry: 1,                
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        // ✅ Refetch on reconnect
        refetchOnReconnect: true,
        // ✅ Keep showing stale data while fetching new
        placeholderData: (previousData: unknown) => previousData,
        // ✅ Network mode for better offline handling
        networkMode: 'offlineFirst',
      },

      mutations: {
        // ✅ Retry mutations 1 time on failure
        retry: 1,

        // ✅ Exponential backoff for mutations
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // ✅ Network mode for mutations
        networkMode: 'offlineFirst',
      },
    },
  })
}

// ✅ Create a singleton instance
let queryClient: QueryClient | undefined

export function getQueryClient() {
  if (!queryClient) queryClient = createQueryClient()
  return queryClient
}
