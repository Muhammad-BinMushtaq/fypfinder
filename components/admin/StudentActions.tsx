// components/admin/StudentActions.tsx
"use client"

import { useState } from "react"
import { 
  X, 
  Ban, 
  CheckCircle2, 
  Mail, 
  GraduationCap, 
  AlertTriangle,
  Loader2 
} from "lucide-react"
import { 
  useSuspendStudent, 
  useUnsuspendStudent, 
  type StudentListItem 
} from "@/hooks/admin"

interface StudentActionsProps {
  student: StudentListItem
  onClose: () => void
}

export function StudentActions({ student, onClose }: StudentActionsProps) {
  const [confirmAction, setConfirmAction] = useState<"suspend" | "unsuspend" | null>(null)
  
  const suspendMutation = useSuspendStudent()
  const unsuspendMutation = useUnsuspendStudent()

  const handleSuspend = async () => {
    await suspendMutation.mutateAsync(student.id)
    onClose()
  }

  const handleUnsuspend = async () => {
    await unsuspendMutation.mutateAsync(student.id)
    onClose()
  }

  const isLoading = suspendMutation.isPending || unsuspendMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 p-4">
          <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            Manage Student Access
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Student Summary */}
        <div className="border-b border-slate-200/80 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3.5">
            {student.profilePicture ? (
              <img
                src={student.profilePicture}
                alt={student.name}
                className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-sm text-slate-800 dark:text-slate-100">
                {student.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                {student.name}
              </h4>
              <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                <Mail className="h-3 w-3 shrink-0" />
                {student.email}
              </p>
              {student.department && (
                <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  <GraduationCap className="h-3 w-3 shrink-0" />
                  {student.department}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Current Status</span>
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 font-semibold text-[11px] ${
                student.status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : student.status === "SUSPENDED"
                  ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              }`}
            >
              {student.status === "DELETION_REQUESTED" ? "Deletion Pending" : student.status}
            </span>
          </div>
        </div>

        {/* Actions Area */}
        <div className="p-5">
          {confirmAction ? (
            <div className="text-center space-y-4">
              <div
                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${
                  confirmAction === "suspend"
                    ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                    : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                }`}
              >
                {confirmAction === "suspend" ? (
                  <Ban className="h-6 w-6" />
                ) : (
                  <CheckCircle2 className="h-6 w-6" />
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {confirmAction === "suspend" ? "Suspend Student Account" : "Unsuspend Student Account"}
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {confirmAction === "suspend"
                    ? `Are you sure you want to suspend ${student.name}? They will immediately lose platform access.`
                    : `Restore platform access for ${student.name}?`}
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setConfirmAction(null)}
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction === "suspend" ? handleSuspend : handleUnsuspend}
                  disabled={isLoading}
                  className={`flex-1 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer ${
                    confirmAction === "suspend"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{confirmAction === "suspend" ? "Confirm Suspend" : "Confirm Unsuspend"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {student.status === "SUSPENDED" ? (
                <button
                  onClick={() => setConfirmAction("unsuspend")}
                  className="flex w-full items-center justify-between rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 text-left transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Unsuspend Account</p>
                      <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">Reactivate access to FYP Finder</p>
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setConfirmAction("suspend")}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 text-left transition-colors hover:bg-red-50/50 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:border-red-900/50 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <Ban className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Suspend Account</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Block student login and all actions</p>
                    </div>
                  </div>
                </button>
              )}

              <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 p-3 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Note:</span> Suspended students cannot log in or participate in groups. Suspension syncs directly with the authentication provider.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
