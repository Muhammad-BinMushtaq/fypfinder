
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"
import prisma from "@/lib/db"

import { validateStudentID } from "@/modules/auth/auth.service"
import { UserRole } from "@/lib/generated/prisma/enums"


export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password } = body

        // Basic payload validation
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            )
        }

        //  Validate university email
        if (!email.endsWith("@paf-iast.edu.pk")) {
            return NextResponse.json(
                { error: "Invalid university email" },
                { status: 400 }
            )
        }

        //  Extract registration number
        const regNo = email.split("@")[0]

        //  Validate student eligibility
        const validation = validateStudentID(regNo)
        // console


        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            )
        }
        const { currentSemester, department } = validation

        const supabase = await createSupabaseServerClient()

        //  Create user in Supabase Auth
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

        //  Sync user into Prisma
        await prisma.user.create({
            data: {
                id: data.user.id,        // SAME ID AS SUPABASE
                email,
                role: UserRole.STUDENT,  // ENUM SAFE
            },
        })

        await prisma.student.create({
            data: {
                userId: data.user.id,
                name: "not Define yet",
                department: department,
                currentSemester: currentSemester



            },
        })

        return NextResponse.json(
            {
                success: true,
                userId: data.user.id,
            },

            { status: 201 }
        )
    }
    catch (err) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
