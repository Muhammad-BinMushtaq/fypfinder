// components/admin/StudentActions.tsx
"use client"

import { useState } from "react"
import { 
  X, 
  User, 
  Ban, 
  CheckCircle,
  Mail,
  GraduationCap,
  Calendar
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h3 className="text-lg font-semibold text-slate-900">Student Actions</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Student Info */}
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-center gap-4">
            {student.profilePicture ? (
              <img
                src={student.profilePicture}
                alt={student.name}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-100"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                <span className="text-xl font-bold text-white">{student.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <h4 className="font-semibold text-slate-900">{student.name}</h4>
              <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <Mail className="h-3.5 w-3.5" />
                {student.email}
              </div>
              {student.department && (
                <div className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {student.department}
                </div>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Current Status:</span>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                student.status === "ACTIVE"
                  ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                  : student.status === "SUSPENDED"
                  ? "border-red-200 bg-red-100 text-red-700"
                  : "border-amber-200 bg-amber-100 text-amber-700"
              }`}
            >
              <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                student.status === "ACTIVE" ? "bg-emerald-500" :
                student.status === "SUSPENDED" ? "bg-red-500" : "bg-amber-500"
              }`} />
              {student.status === "DELETION_REQUESTED" ? "Deletion Requested" : student.status}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4">
          {confirmAction ? (
            <ConfirmationDialog
              action={confirmAction}
              studentName={student.name}
              onConfirm={
                confirmAction === "suspend"
                  ? handleSuspend
                  : handleUnsuspend
              }
              onCancel={() => setConfirmAction(null)}
              isLoading={isLoading}
            />
          ) : (
            <div className="space-y-2">
              {/* Suspend/Unsuspend */}
              {student.status === "SUSPENDED" ? (
                <button
                  onClick={() => setConfirmAction("unsuspend")}
                  className="flex w-full items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left transition-colors hover:bg-emerald-100"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-900">Unsuspend Student</p>
                    <p className="text-sm text-emerald-700">Restore access to all features</p>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setConfirmAction("suspend")}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                    <Ban className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Suspend Student</p>
                    <p className="text-sm text-slate-500">Disable login and all platform access</p>
                  </div>
                </button>
              )}

              {/* Info Notice */}
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Suspended students will not be able to log in to the platform. 
                  They will need to contact administration for account reactivation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Confirmation Dialog Component
interface ConfirmationDialogProps {
  action: "suspend" | "unsuspend"
  studentName: string
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

function ConfirmationDialog({
  action,
  studentName,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmationDialogProps) {
  const config = {
    suspend: {
      title: "Suspend Student",
      message: `Are you sure you want to suspend ${studentName}? They will not be able to log in or access any platform features.`,
      confirmText: "Suspend",
      confirmClass: "bg-orange-600 hover:bg-orange-700",
      icon: Ban,
      iconClass: "text-orange-600 bg-orange-100",
    },
    unsuspend: {
      title: "Unsuspend Student",
      message: `Are you sure you want to unsuspend ${studentName}? They will regain full access to the platform.`,
      confirmText: "Unsuspend",
      confirmClass: "bg-emerald-600 hover:bg-emerald-700",
      icon: CheckCircle,
      iconClass: "text-emerald-600 bg-emerald-100",
    },
  }

  const { title, message, confirmText, confirmClass, icon: Icon, iconClass } = config[action]

  return (
    <div className="text-center">
      <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${iconClass}`}>
        <Icon className="h-7 w-7" />
      </div>
      <h4 className="mt-4 text-lg font-semibold text-slate-900">{title}</h4>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 ${confirmClass}`}
        >
          {isLoading ? "Processing..." : confirmText}
        </button>
      </div>
    </div>
  )
}
