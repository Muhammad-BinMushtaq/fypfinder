// hooks/admin/useAdminEmail.ts
/**
 * Admin Email Hooks
 * -----------------
 * Preview + send profile-completion emails.
 */

import { useMutation } from "@tanstack/react-query"
import { toast } from "react-toastify"
import {
  previewEmailRecipients,
  sendEmails,
  type EmailFilters,
  type EmailPreviewResponse,
  type EmailSendResult,
} from "@/services/admin.service"

/**
 * Preview which students match the email filters.
 * Uses mutation (POST) since it's a filter-based query.
 */
export function useEmailPreview() {
  return useMutation<EmailPreviewResponse, Error, EmailFilters>({
    mutationFn: (filters) => previewEmailRecipients(filters),
    onError: (error) => {
      toast.error(error.message || "Failed to preview recipients")
    },
  })
}

/**
 * Send emails to filtered students.
 */
export function useEmailSend() {
  return useMutation<EmailSendResult, Error, EmailFilters>({
    mutationFn: (filters) => sendEmails(filters),
    onSuccess: (result) => {
      if (result.totalFailed === 0) {
        toast.success(`Successfully sent ${result.totalSent} email(s)!`)
      } else {
        toast.warning(
          `Sent ${result.totalSent} of ${result.totalTargeted}. ${result.totalFailed} failed.`
        )
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send emails")
    },
  })
}

export type { EmailFilters, EmailPreviewResponse, EmailSendResult, EmailPreviewStudent } from "@/services/admin.service"
