// app/api/admin/signup/route.ts
// Create new admin - REQUIRES existing admin authentication

import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"
import prisma from "@/lib/db"
import { UserRole } from "@/lib/generated/prisma/enums"
import { requireRole } from "@/lib/auth"
import { authRateLimiter, getClientIdentifier } from "@/lib/rate-limit"

export async function POST(req: Request) {
    try {
        const rateLimit = authRateLimiter.check(getClientIdentifier(req.headers))
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: rateLimit.retryAfter
                        ? { "Retry-After": String(rateLimit.retryAfter) }
                        : undefined,
                }
            )
        }

        // 🔐 SECURITY: Only existing admins can create new admins
        await requireRole(UserRole.ADMIN)

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
        // Error logged server-side only in development
        if (process.env.NODE_ENV === "development") {
            logger.error("Admin signup error:", err)
        }
        return NextResponse.json(
            { error: err.message === "Unauthorized: insufficient role" ? "Unauthorized" : "Internal server error" },
            { status: err.message?.includes("Unauthorized") ? 403 : 500 }
        )
    }
}
