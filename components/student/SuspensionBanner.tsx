// components/student/SuspensionBanner.tsx
"use client"

import { AlertTriangle, Clock, Mail } from "lucide-react"
import { useAccountStatus } from "@/hooks/student/useAccountStatus"

export function SuspensionBanner() {
  const { status, isSuspended, isDeletionRequested, statusMessage } = useAccountStatus()

  // Don't show anything for active users
  if (status === "ACTIVE") {
    return null
  }

  // Suspended banner
  if (isSuspended) {
    return (
      <div className="border-b border-red-200 bg-red-50 px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">
              Your account has been suspended
            </p>
            <p className="text-sm text-red-700">
              {statusMessage || "You cannot send messages or requests while suspended."}
            </p>
          </div>
          <a
            href="mailto:support@fypfinder.com"
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <Mail className="h-4 w-4" />
            Contact Support
          </a>
        </div>
      </div>
    )
  }

  // Deletion requested banner
  if (isDeletionRequested) {
    return (
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Clock className="h-5 w-5 flex-shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              Account deletion request pending
            </p>
            <p className="text-sm text-amber-700">
              {statusMessage || "Your deletion request is being reviewed. You can still use your account."}
            </p>
          </div>
          <a
            href="/settings"
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50"
          >
            View Request
          </a>
        </div>
      </div>
    )
  }

  return null
}

// Compact version for sidebars or smaller areas
export function SuspensionBadge() {
  const { isSuspended, isDeletionRequested } = useAccountStatus()

  if (isSuspended) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
        <AlertTriangle className="h-3 w-3" />
        Suspended
      </div>
    )
  }

  if (isDeletionRequested) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
        <Clock className="h-3 w-3" />
        Deletion Pending
      </div>
    )
  }

  return null
}
