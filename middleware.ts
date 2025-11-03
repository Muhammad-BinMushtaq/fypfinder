import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./lib/auth";


export async function middleware(req: NextRequest) {

    const protectedRoutes = ["/dashboard", "/mypayment", "/api/refresh",];

    const path = req.nextUrl.pathname;


    if (!protectedRoutes.some((route) => path.startsWith(route))) {
        return NextResponse.next();
    }


    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        // If token missing → redirect to login (for pages)
        if (path.startsWith("/api")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        } else {
            const loginUrl = new URL("/login", req.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    // 5️⃣ Extract the token
    const token = authHeader.split(" ")[1];

    try {
        // 6️⃣ Verify the access token
        verifyAccessToken(token);

        // ✅ Token is valid → continue request
        return NextResponse.next();
    } catch (err) {
        console.error("Middleware error:", err);

        // ❌ Invalid token → redirect or block
        if (path.startsWith("/api")) {
            return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
        } else {
            const loginUrl = new URL("/login", req.url);
            return NextResponse.redirect(loginUrl);
        }
    }
}

// 7️⃣ Tell Next.js which paths should trigger this middleware
export const config = {
    matcher: ["/dashboard/:path*", "/mypayment/:path*", "/api/secure/:path*"],
    runtime: "nodejs",
};
