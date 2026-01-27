// app/api/admin/signup/route.ts
// Signup route for ADMIN users only

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"
import prisma from "@/lib/db"
import { UserRole } from "@/lib/generated/prisma/enums"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password, name } = body

        // ✅ Basic payload validation (simple - any email)
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: "Email, password, and name are required" },
                { status: 400 }
            )
        }

        // ✅ Validate input types
        if (typeof email !== "string" || typeof password !== "string" || typeof name !== "string") {
            return NextResponse.json(
                { error: "Invalid input types" },
                { status: 400 }
            )
        }

        // ✅ Validate email format (basic - just check for @)
        if (!email.includes("@")) {
            return NextResponse.json(
                { error: "Please provide a valid email address" },
                { status: 400 }
            )
        }

        // ✅ Validate password strength
        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            )
        }

        // ✅ Validate name
        const trimmedName = name.trim()
        if (trimmedName.length < 2) {
            return NextResponse.json(
                { error: "Name must be at least 2 characters" },
                { status: 400 }
            )
        }

        // 🔑 Create auth user in Supabase
        const supabase = await createSupabaseServerClient()

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error || !data.user) {
            return NextResponse.json(
                { error: error?.message || "Signup failed" },
                { status: 400 }
            )
        }

        // 👤 Create User record in Prisma
        await prisma.user.create({
            data: {
                id: data.user.id,      // SAME ID AS SUPABASE
                email,
                role: UserRole.ADMIN,  // ✅ Set role to ADMIN
            },
        })

        // 🏢 Create Admin profile record
        await prisma.admin.create({
            data: {
                userId: data.user.id,
                name: trimmedName,
            },
        })

        return NextResponse.json(
            {
                success: true,
                message: "Admin signup successful",
                userId: data.user.id,
                email,
                role: UserRole.ADMIN,
            },
            { status: 201 }
        )
    } catch (err: any) {
        console.error("Admin signup error:", err)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
