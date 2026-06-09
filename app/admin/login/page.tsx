import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import AdminLoginClient from "./LoginClient"

export default async function AdminLoginPage() {
  let isAdmin = false

  try {
    await requireRole(UserRole.ADMIN)
    isAdmin = true
  } catch {
    // No active admin session, show login form.
  }

  if (isAdmin) {
    redirect("/admin/dashboard")
  }

  return <AdminLoginClient />
}
