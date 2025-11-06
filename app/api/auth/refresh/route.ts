import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoDb";
import User from "@/models/User";
import { createAccessToken, findRefreshTokenByRaw } from "@/lib/auth";




export async function POST() {
    try {
        await dbConnect();

        // 1️⃣ Read cookies from request
        const cookieStore = cookies();
        const refreshToken = (await cookieStore).get("refreshToken")?.value;

        if (!refreshToken) {
            return NextResponse.json({ message: "No refresh token found" }, { status: 401 });
        }


        // 3️⃣ Check if the refresh token exists in DB
        const tokenInDB = await findRefreshTokenByRaw(refreshToken);
        if (!tokenInDB) {
            return NextResponse.json({ message: "Refresh token invalid or revoked" }, { status: 403 });
        }

        // 4️⃣ Verify the user still exists
        const user = await User.findById(tokenInDB.userId);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // 5️⃣ Create new access token
        const newAccessToken = createAccessToken(user._id, user.role)
        console.log("New access token created:", newAccessToken);


        // 6️⃣ Send new access token back
        return NextResponse.json(
            {
                accessToken: newAccessToken,
                message: "Access token refreshed",
                user: {
                    _id: user._id,
                    institutionalEmail: user.institutionalEmail,
                    role: user.role,
                    linkedId: user.linkedId,
                }
            },
            { status: 200 }
        );
    } catch (err: any) {
        console.error("Refresh route error:", err);
        return NextResponse.json({ message: err.message || "Server error" }, { status: 500 });
    }
}
