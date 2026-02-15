
import prisma from "@/lib/db"
import { UserStatus } from "@/lib/generated/prisma/enums"
import { createSupabaseServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"



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



        const supabase = await createSupabaseServerClient()

        //  Create user in Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })


        console.log("This is data returned from supabse", data)
        console.log("This is error returned from supabse", error)
        // console.log("Supabase signin data:", data, "error:", error);
        if (error || !data.user) {
            return NextResponse.json(
                { error: error?.message || "Signin failed" },
                { status: 400 }
            )
        }

        if (!data.user?.email_confirmed_at) {
            return NextResponse.json(
                { error: "Please verify your email first" },
                { status: 403 }
            )
        }

        // Check if user is suspended
        const user = await prisma.user.findUnique({
            where: { id: data.user.id },
            select: { status: true }
        })

        if (user?.status === UserStatus.SUSPENDED) {
            // Sign them out since they shouldn't be logged in
            await supabase.auth.signOut()

            return NextResponse.json(
                {
                    error: "Your account has been suspended. Please contact administration for account reactivation.",
                    isSuspended: true
                },
                { status: 403 }
            )
        }



        return NextResponse.json(
            {
                message: "Signin successful",
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
