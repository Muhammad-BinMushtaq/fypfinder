// lib/auth.ts
import prisma from "./db"
import { UserRole, UserStatus } from "./generated/prisma/enums"
import { createSupabaseServerClient } from "./supabase"

// Get current logged-in user (SECURE)
export async function getCurrentUser() {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      // Check if it's a network error vs auth error
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        console.error("Network error connecting to auth server:", error.message)
        throw new Error("Network error: Unable to connect to authentication server. Please check your internet connection.")
      }
      return null
    }
    
    if (!user) return null

    // Fetch app-level user from Prisma
    const appUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    return appUser
  } catch (err) {
    // Handle network/connection errors specifically
    const errorMessage = err instanceof Error ? err.message : String(err)
    if (errorMessage.includes('fetch failed') || 
        errorMessage.includes('ENOTFOUND') || 
        errorMessage.includes('ConnectTimeoutError') ||
        errorMessage.includes('Network error')) {
      console.error("⚠️ Network connectivity issue with Supabase:", errorMessage)
      throw new Error("Network error: Unable to reach authentication server. Please check your internet connection and try again.")
    }
    throw err
  }
}




// Require login
export async function requireAuth() {
  try {
    const user = await getCurrentUser()

    if (user?.status === UserStatus.SUSPENDED) {
      throw new Error("Account suspended")
    }
    if (!user) {
      throw new Error("Unauthorized: not logged in")
    }
    return user
  } catch (err) {
    // Re-throw network errors with clear message
    const errorMessage = err instanceof Error ? err.message : String(err)
    if (errorMessage.includes('Network error')) {
      throw err // Already has clear message
    }
    throw err
  }
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