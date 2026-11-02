// app/dashboard/requests/received/page.tsx
import { redirect } from "next/navigation"

/**
 * Legacy Redirect for `/dashboard/requests/received`
 * Ensures any previously sent partner or message request emails in students'
 * inboxes redirect cleanly to the unified received requests view instead of 404.
 */
export default function LegacyReceivedRequestsRedirectPage() {
  redirect("/dashboard/requests")
}
