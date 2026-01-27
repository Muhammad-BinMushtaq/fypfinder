
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"



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

        if (error || !data.user) {
            return NextResponse.json(
                { error: error?.message || "Signin failed" },
                { status: 400 }
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
        console.log("Signin error:", err)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
