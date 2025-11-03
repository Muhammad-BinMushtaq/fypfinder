import { findRefreshTokenByRaw, revokeRefreshTokenByRaw, verifyAccessToken } from "@/lib/auth";
import dbConnect from "@/lib/mongoDb";
import User from "@/models/User";
import { serialize } from "cookie";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {

    try {

        await dbConnect();
        const cookieStore = cookies()
        const refreshToken = (await cookieStore).get("refreshToken")?.value;

        if (!refreshToken) {
            return new Response("No refrsh Token Found", { status: 400 })

        }

        const refeshToken = await findRefreshTokenByRaw(refreshToken)
        if (!refeshToken) {
            return new Response("Invalid Refresh Token", { status: 400 })
        }

        const user = await User.findById(refeshToken.userId);
        if (!user) {
            return new Response("User Not Found", { status: 404 })
        }
        else {
            await revokeRefreshTokenByRaw(refreshToken);

        }

        const clearedCookies = serialize('refreshToken', "", {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 0,
        })

        const res = NextResponse.json({ message: "Logged Out Successfully" }, { status: 200 });
        res.headers.append("Set-Cookie", clearedCookies);
        return res;
    } catch (err:any) {

        console.error("Logout error:", err);
        return NextResponse.json({ message: err || "Server error" }, { status: 500 });
    }
}