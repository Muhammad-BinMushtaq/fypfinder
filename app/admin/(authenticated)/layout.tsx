import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import AdminAuthenticatedLayoutClient from "./AdminAuthenticatedLayoutClient"

export default async function AdminAuthenticatedLayout({
  children,
}: {
  children: ReactNode
}) {
  try {
    await requireRole(UserRole.ADMIN)
  } catch {
    redirect("/admin/login")
  }

  return <AdminAuthenticatedLayoutClient>{children}</AdminAuthenticatedLayoutClient>
}
