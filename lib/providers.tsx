"use client"

import React, { useEffect, useState } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { getQueryClient } from "./reactQuery"

interface ProvidersProps {
  children: React.ReactNode
}

// Create persister only on client side
function createPersister() {
  if (typeof window === 'undefined') return null
  
  return createSyncStoragePersister({
    storage: window.localStorage,
    key: 'fypfinder-cache',
    // Throttle writes to localStorage
    throttleTime: 1000,
    // Serialize/deserialize
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  })
}

export function AppProviders({ children }: ProvidersProps) {
  const queryClient = getQueryClient()
  const [persister, setPersister] = useState<ReturnType<typeof createSyncStoragePersister> | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setPersister(createPersister())
  }, [])

  // During SSR or before hydration, use regular provider
  if (!isClient || !persister) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  // On client with persister, use PersistQueryClientProvider
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        // Only persist certain queries
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const queryKey = query.queryKey as string[]
            
            // NEVER persist auth-related queries (causes login issues)
            const neverPersistKeys = ['session', 'auth', 'user']
            if (neverPersistKeys.some(key => queryKey[0]?.includes(key))) {
              return false
            }
            
            // Persist discovery, profile, and messages data
            const persistableKeys = ['discovery', 'profile', 'student', 'messages', 'conversations']
            return persistableKeys.some(key => queryKey[0]?.includes(key))
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
