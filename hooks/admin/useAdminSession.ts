// hooks/admin/useAdminSession.ts
/**
 * Admin Session Hook
 * ------------------
 * Manages admin authentication state using React Query.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import {
  getAdminSession,
  adminLogin,
  adminLogout,
  type AdminUser,
  type StudentFilters,
} from "@/services/admin.service"

export const adminKeys = {
  all: ["admin"] as const,
  session: () => [...adminKeys.all, "session"] as const,
  students: () => [...adminKeys.all, "students"] as const,
  studentsList: (filters: StudentFilters) => [...adminKeys.students(), filters] as const,
  student: (id: string) => [...adminKeys.students(), id] as const,
  conversations: () => [...adminKeys.all, "conversations"] as const,
  conversationsList: (page: number) => [...adminKeys.conversations(), page] as const,
  messages: (conversationId: string) => [...adminKeys.all, "messages", conversationId] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
}

export function useAdminSession() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const sessionQuery = useQuery({
    queryKey: adminKeys.session(),
    queryFn: getAdminSession,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      adminLogin(email, password),
    onSuccess: (admin) => {
      queryClient.setQueryData(adminKeys.session(), admin)
      router.push("/admin/dashboard")
    },
  })

  const logoutMutation = useMutation({
    mutationFn: adminLogout,
    onSuccess: () => {
      queryClient.setQueryData(adminKeys.session(), null)
      queryClient.clear() // Clear all admin data
      router.push("/admin/login")
    },
  })

  return {
    admin: sessionQuery.data as AdminUser | null,
    isLoading: sessionQuery.isLoading,
    isAuthenticated: !!sessionQuery.data,
    error: sessionQuery.error,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  }
}

/**
 * Hook to require admin authentication
 * Redirects to login if not authenticated
 */
export function useRequireAdmin() {
  const router = useRouter()
  const { admin, isLoading, isAuthenticated } = useAdminSession()

  // Redirect if not authenticated after loading
  if (!isLoading && !isAuthenticated) {
    router.push("/admin/login")
  }

  return { admin, isLoading, isAuthenticated }
}
