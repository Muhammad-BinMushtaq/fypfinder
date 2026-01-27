// app/api/admin/login/route.ts
// Login route for ADMIN users only

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"
import prisma from "@/lib/db"
import { UserRole } from "@/lib/generated/prisma/enums"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password } = body

        // ✅ Basic payload validation (simple - any email)
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            )
        }

        // ✅ Validate input types
        if (typeof email !== "string" || typeof password !== "string") {
            return NextResponse.json(
                { error: "Invalid input types" },
                { status: 400 }
            )
        }

        // 🔑 Sign in with Supabase
        const supabase = await createSupabaseServerClient()

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error || !data.user) {
            return NextResponse.json(
                { error: error?.message || "Login failed" },
                { status: 401 }
            )
        }

        // 👤 Verify user exists and has ADMIN role
        const user = await prisma.user.findUnique({
            where: { id: data.user.id },
            include: {
                admin: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found in database" },
                { status: 404 }
            )
        }

        // ✅ Verify user is ADMIN
        if (user.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { error: "Only admins can access this route" },
                { status: 403 }
            )
        }

        // ✅ Verify admin profile exists
        if (!user.admin) {
            return NextResponse.json(
                { error: "Admin profile not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(
            {
                success: true,
                message: "Admin login successful",
                userId: data.user.id,
                adminId: user.admin.id,
                adminName: user.admin.name,
                email: user.email,
                role: user.role,
            },
            { status: 200 }
        )
    } catch (err: any) {
        console.error("Admin login error:", err)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
