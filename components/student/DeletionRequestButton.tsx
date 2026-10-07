// components/student/DeletionRequestButton.tsx
"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Trash2, AlertTriangle, Clock, X, Loader2 } from "lucide-react"
import { useRequestDeletion } from "@/hooks/student/useRequestDeletion"
import { useAccountStatus } from "@/hooks/student/useAccountStatus"

export function DeletionRequestButton() {
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { status } = useAccountStatus()
  const { requestDeletionAsync, cancelDeletionAsync, isRequesting, isCancelling } = useRequestDeletion()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll and hide mobile bottom nav when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden"
      document.body.classList.add("modal-open")
    } else {
      document.body.style.overflow = "unset"
      document.body.classList.remove("modal-open")
    }
    return () => {
      document.body.style.overflow = "unset"
      document.body.classList.remove("modal-open")
    }
  }, [showModal])

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showModal) {
        setShowModal(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showModal])

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
      <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />
          <div className="flex-1">
            <h3 className="font-medium text-amber-900 dark:text-amber-200">Deletion Request Pending</h3>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              Your account deletion request is being reviewed by an administrator.
              This process may take a few days.
            </p>
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-300 dark:border-amber-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-slate-600 disabled:opacity-50"
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
      <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" />
          <div className="flex-1">
            <h3 className="font-medium text-red-900 dark:text-red-200">Delete Account</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
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
      {mounted && showModal && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          <div 
            className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] my-auto animate-in fade-in zoom-in-95 duration-200 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Request Account Deletion
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    This will submit a deletion request to administrators
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-900/20 p-3.5 border border-red-200/60 dark:border-red-800/40">
              <p className="text-xs font-semibold text-red-800 dark:text-red-200">
                Warning: After an administrator approves your request:
              </p>
              <ul className="mt-2 list-inside list-disc text-xs text-red-700 dark:text-red-300 space-y-1">
                <li>Your profile will be permanently deleted</li>
                <li>All your messages will be removed</li>
                <li>Your group memberships will be cancelled</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to request deletion of your account?
            </p>

            <div className="mt-6 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isRequesting}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequest}
                disabled={isRequesting}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
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
        </div>,
        document.body
      )}
    </>
  )
}
