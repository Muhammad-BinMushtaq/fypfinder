// app/api/admin/login/route.ts
// Login route for ADMIN users only

import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"
import prisma from "@/lib/db"
import { UserRole, UserStatus } from "@/lib/generated/prisma/enums"
import { authRateLimiter, getClientIdentifier } from "@/lib/rate-limit"

export async function POST(req: Request) {
    try {
        const rateLimit = authRateLimiter.check(getClientIdentifier(req.headers))
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { success: false, message: "Too many login attempts. Please try again later." },
                {
                    status: 429,
                    headers: rateLimit.retryAfter
                        ? { "Retry-After": String(rateLimit.retryAfter) }
                        : undefined,
                }
            )
        }

        const body = await req.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: "Email and password are required" },
                { status: 400 }
            )
        }

        if (typeof email !== "string" || typeof password !== "string") {
            return NextResponse.json(
                { success: false, message: "Invalid input types" },
                { status: 400 }
            )
        }

        const supabase = await createSupabaseServerClient()

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error || !data.user) {
            return NextResponse.json(
                { success: false, message: error?.message || "Login failed" },
                { status: 401 }
            )
        }

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
                { success: false, message: "User not found in database" },
                { status: 404 }
            )
        }

        if (user.status !== UserStatus.ACTIVE) {
            return NextResponse.json(
                { success: false, message: "Account is not active" },
                { status: 403 }
            )
        }

        if (user.role !== UserRole.ADMIN) {
            return NextResponse.json(
                { success: false, message: "Only admins can access this route" },
                { status: 403 }
            )
        }

        if (!user.admin) {
            return NextResponse.json(
                { success: false, message: "Admin profile not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(
            {
                success: true,
                message: "Admin login successful",
                data: {
                    admin: {
                        id: user.admin.id,
                        userId: data.user.id,
                        name: user.admin.name,
                        email: user.email,
                        role: user.role,
                    },
                },
            },
            { status: 200 }
        )
    } catch (err: any) {
        logger.error("Admin login error:", err)
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        )
    }
}
