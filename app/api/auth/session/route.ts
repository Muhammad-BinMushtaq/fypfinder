// this is for session route
import { NextResponse } from "next/server";
import {  requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const currentUser = await requireAuth();

        if (currentUser) {
            const response = NextResponse.json(
                {
                    success: true,
                    message: "Session active",
                    data: {
                        user: currentUser
                    },
                },
                { status: 200 }
            );
            
            // ✅ Cache session for 5 minutes
            response.headers.set("Cache-Control", "private, max-age=300");
            return response;
        }

        const response = NextResponse.json(
            {
                success: false,
                message: "No active session",
                data: null,
            },
            { status: 401 }
        );
        
        // ✅ Don't cache failed auth
        response.headers.set("Cache-Control", "no-store");
        return response;
    }
    catch (error: any) {
        console.error("Session retrieval error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Internal server error",
                data: null
            },
            { status: 500 }
        );
    }
}