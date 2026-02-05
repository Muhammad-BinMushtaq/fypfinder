// components/student/DeletionRequestButton.tsx
"use client"

import { useState } from "react"
import { Trash2, AlertTriangle, Clock, X, Loader2 } from "lucide-react"
import { useRequestDeletion } from "@/hooks/student/useRequestDeletion"
import { useAccountStatus } from "@/hooks/student/useAccountStatus"

export function DeletionRequestButton() {
  const [showModal, setShowModal] = useState(false)
  const { status } = useAccountStatus()
  const { requestDeletionAsync, cancelDeletionAsync, isRequesting, isCancelling } = useRequestDeletion()

  const isPending = status === "DELETION_REQUESTED"

  const handleRequest = async () => {
    try {
      await requestDeletionAsync()
      setShowModal(false)
    } catch {
      // Error is handled by the hook
    }
  }

  const handleCancel = async () => {
    try {
      await cancelDeletionAsync()
    } catch {
      // Error is handled by the hook
    }
  }

  // If deletion is already requested, show pending state
  if (isPending) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 text-amber-600" />
          <div className="flex-1">
            <h3 className="font-medium text-amber-900">Deletion Request Pending</h3>
            <p className="mt-1 text-sm text-amber-700">
              Your account deletion request is being reviewed by an administrator.
              This process may take a few days.
            </p>
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
            >
              {isCancelling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Cancel Request
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
          <div className="flex-1">
            <h3 className="font-medium text-red-900">Delete Account</h3>
            <p className="mt-1 text-sm text-red-700">
              Once your account is deleted, all your data will be permanently removed.
              This action cannot be undone.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Request Account Deletion
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Request Account Deletion
                </h2>
                <p className="text-sm text-gray-500">
                  This will submit a deletion request to administrators
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-red-50 p-3">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> After an administrator approves your request:
              </p>
              <ul className="mt-2 list-inside list-disc text-sm text-red-700">
                <li>Your profile will be permanently deleted</li>
                <li>All your messages will be removed</li>
                <li>Your group memberships will be cancelled</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              Are you sure you want to request deletion of your account?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isRequesting}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequest}
                disabled={isRequesting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isRequesting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Confirm Deletion Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
