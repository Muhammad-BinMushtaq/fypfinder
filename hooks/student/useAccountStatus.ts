// hooks/student/useAccountStatus.ts
/**
 * Account Status Hook
 * -------------------
 * Provides account status and permission checks for students.
 * Used to enforce suspension restrictions in the UI.
 */

import { useMemo } from "react"
import { useMyProfile } from "./useMyProfile"

export type UserStatus = "ACTIVE" | "SUSPENDED" | "DELETION_REQUESTED"

export interface AccountPermissions {
  canMessage: boolean
  canSendRequests: boolean
  canDiscoverStudents: boolean
  canEditProfile: boolean
  canViewContent: boolean
}

export function useAccountStatus() {
  const { profile, isLoading, error } = useMyProfile()
  const isError = !!error

  const status = useMemo((): UserStatus => {
    if (!profile?.user?.status) return "ACTIVE"
    return profile.user.status as UserStatus
  }, [profile])

  const permissions = useMemo((): AccountPermissions => {
    const isActive = status === "ACTIVE"
    const isSuspended = status === "SUSPENDED"
    const isDeletionRequested = status === "DELETION_REQUESTED"

    return {
      // Only active users can message
      canMessage: isActive,
      // Only active users can send requests
      canSendRequests: isActive,
      // Everyone can browse discovery (read-only for suspended)
      canDiscoverStudents: true,
      // Only active users can edit profile
      canEditProfile: isActive,
      // Everyone can view content
      canViewContent: true,
    }
  }, [status])

  const statusMessage = useMemo(() => {
    switch (status) {
      case "SUSPENDED":
        return "Your account is suspended. Some actions are disabled."
      case "DELETION_REQUESTED":
        return "Your account deletion request is pending admin approval."
      default:
        return null
    }
  }, [status])

  return {
    status,
    permissions,
    statusMessage,
    isActive: status === "ACTIVE",
    isSuspended: status === "SUSPENDED",
    isDeletionRequested: status === "DELETION_REQUESTED",
    isLoading,
    isError,
  }
}
