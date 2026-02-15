import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { redirectTo } = body

        const supabase = await createSupabaseServerClient()

        // Get the origin from the request headers for callback URL
        const origin = req.headers.get("origin") || "http://localhost:3000"
        const callbackUrl = `${origin}/api/auth/callback`

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "azure",
            options: {
                redirectTo: callbackUrl,
                scopes: "email openid profile",
                queryParams: {
                    // Pass the intended redirect destination after auth
                    redirect_to: redirectTo || "/dashboard/profile"
                }
            }
        })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json({
            url: data.url
        })
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Internal server error" },
            { status: 500 }
        )
    }
}
