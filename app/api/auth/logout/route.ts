//logout route
import logger from "@/lib/logger"
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { removeAllSubscriptions } from "@/lib/push-service";

export async function POST(req: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        
        // Get user before signing out (to clean up push subscriptions)
        const { data: { user } } = await supabase.auth.getUser();
        
        // Sign out from Supabase
        const { error } = await supabase.auth.signOut();
        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        // Clean up push subscriptions (async, don't block response)
        if (user?.id) {
            removeAllSubscriptions(user.id).catch(err => {
                logger.error("Failed to clean up push subscriptions:", err);
            });
        }

        return NextResponse.json(
            { message: "Logged out successfully" },
            { status: 200 }
        );
    }
    catch (err) {
        logger.error("Logout error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}