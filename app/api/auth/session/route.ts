// this is for session route
import logger from "@/lib/logger"
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
            
            // Don't cache auth state to avoid stale sessions
            response.headers.set("Cache-Control", "no-store");
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
        logger.error("Session retrieval error:", error);
        const message = error?.message || "Internal server error";
        let status = 500;

        if (message.includes("Unauthorized")) {
            status = 401;
        } else if (message.includes("suspended")) {
            status = 403;
        } else if (message.includes("Network error")) {
            status = 503;
        }

        const response = NextResponse.json(
            {
                success: false,
                message,
                data: null
            },
            { status }
        );
        response.headers.set("Cache-Control", "no-store");
        return response;
    }
}
