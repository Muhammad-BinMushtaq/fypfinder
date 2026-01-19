// lib/auth.ts
import prisma from "./db"
import { UserRole, UserStatus } from "./generated/prisma/enums"
import { createSupabaseServerClient } from "./supabase"

// Get current logged-in user (SECURE)
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null

  // Fetch app-level user from Prisma
  const appUser = await prisma.user.findUnique({
    where: { id: user.id },
  })

  return appUser

}




// Require login
export async function requireAuth() {

  // if (process.env.NODE_ENV === "development") {
  //   // TEMP: return first user for Postman testing 
  //   const user = await prisma.user.findFirst()
  //   if (!user) throw new Error("No users in database")
  //   // console.log('this is user', user)
  //   return user
  // }


  const user = await getCurrentUser()

  if (user?.status === UserStatus.SUSPENDED) {
    throw new Error("Account suspended")
  }
  if (!user) {
    throw new Error("Unauthorized: not logged in")
  }
  return user
}

// Require specific role
export async function requireRole(role: UserRole) {
  const user = await requireAuth()
  if (user.role !== role) {
    throw new Error("Unauthorized: insufficient role")
  }
  return user
}

/*
export async function checkSuspended() {
  const user = await requireAuth()
  if (user.status === UserStatus.SUSPENDED) {
    throw new Error("Account suspended")
  }
}
*/