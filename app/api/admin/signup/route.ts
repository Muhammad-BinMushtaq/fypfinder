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
                { success: false, message: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: rateLimit.retryAfter
                        ? { "Retry-After": String(rateLimit.retryAfter) }
                        : undefined,
                }
            )
        }

        await requireRole(UserRole.ADMIN)

        const body = await req.json()
        const { email, password, name } = body

        if (!email || !password || !name) {
            return NextResponse.json(
                { success: false, message: "Email, password, and name are required" },
                { status: 400 }
            )
        }

        if (typeof email !== "string" || typeof password !== "string" || typeof name !== "string") {
            return NextResponse.json(
                { success: false, message: "Invalid input types" },
                { status: 400 }
            )
        }

        if (!email.includes("@")) {
            return NextResponse.json(
                { success: false, message: "Please provide a valid email address" },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, message: "Password must be at least 6 characters" },
                { status: 400 }
            )
        }

        const trimmedName = name.trim()
        if (trimmedName.length < 2) {
            return NextResponse.json(
                { success: false, message: "Name must be at least 2 characters" },
                { status: 400 }
            )
        }

        const supabase = await createSupabaseServerClient()

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error || !data.user) {
            return NextResponse.json(
                { success: false, message: error?.message || "Signup failed" },
                { status: 400 }
            )
        }

        await prisma.user.create({
            data: {
                id: data.user.id,
                email,
                role: UserRole.ADMIN,
            },
        })

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
                data: {
                    admin: {
                        userId: data.user.id,
                        email,
                        name: trimmedName,
                        role: UserRole.ADMIN,
                    },
                },
            },
            { status: 201 }
        )
    } catch (err: any) {
        if (process.env.NODE_ENV === "development") {
            logger.error("Admin signup error:", err)
        }

        const isUnauthorized = err.message?.includes("Unauthorized")
        return NextResponse.json(
            { success: false, message: isUnauthorized ? "Unauthorized" : "Internal server error" },
            { status: isUnauthorized ? 403 : 500 }
        )
    }
}
