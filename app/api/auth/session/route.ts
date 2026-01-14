// this is for session route
import { NextResponse } from "next/server";
import {  requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const currentUser = await requireAuth();


        if (currentUser) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Session active",
                    data: {
                        user: currentUser
                    },
                },
                { status: 200 }
            );
        }


        return NextResponse.json(
            {
                success: false,
                message: "No active session",
                data: null,
            },
            { status: 401 }
        );
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