//logout route
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
export async function POST(req: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase.auth.signOut();
        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "Logged out successfully" },
            { status: 200 }
        );
    }
    catch (err) {
        console.error("Logout error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}