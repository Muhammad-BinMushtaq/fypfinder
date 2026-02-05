// app/api/admin/logout/route.ts
// Logout route for admin users

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Admin logout error:", error)
      return NextResponse.json(
        { error: "Logout failed" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (err: any) {
    console.error("Admin logout error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
