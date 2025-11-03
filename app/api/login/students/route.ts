import dbConnect from "@/lib/mongoDb";
import bcrypt from "bcryptjs";
import { clearRefreshCookieHeader, createAccessToken, generateRawRefreshToken, saveRefreshToken, setRefreshCookieHeader } from "@/lib/auth";
import { checkRateLimit, recordFailedAttempt, resetAttempts } from "@/lib/rateLimiter";
import User from "@/models/User";

export async function POST(req: Request) {
    const headers = new Headers({
        "Content-Type": "application/json",
    });

    const ip =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("remote_addr") ||
        "unknown";

    const ua = req.headers.get("user-agent") || "";

    const { email, password } = await req.json();
    const institutionalEmail = email;

    try {
        await dbConnect();

        /**  Rate limit check before any DB lookups */
        const { attempt, blocked, message } = await checkRateLimit(ip, email);

        if (blocked) {
            return new Response(
                JSON.stringify({ message, blocked: true }),
                { status: 429, headers }
            );
        }

        /**  Find user */
        const user = await User.findOne({ institutionalEmail });
        if (!user) {
            // Record failed attempt
            const { remaining } = await recordFailedAttempt(attempt);
            return new Response(
                JSON.stringify({
                    message: `Invalid credentials. ${remaining} attempts left.`,
                }),
                { status: 401, headers }
            );
        }

        /**  Check password */
        const isPasswordTrue = await bcrypt.compare(password, user.password!);
        if (!isPasswordTrue) {
            const { remaining, blocked } = await recordFailedAttempt(attempt);

            if (blocked) {
                return new Response(
                    JSON.stringify({
                        message: `Too many failed attempts. Try again later.`,
                    }),
                    { status: 429, headers }
                );
            }

            return new Response(
                JSON.stringify({
                    message: `Invalid credentials. ${remaining} attempts left.`,
                }),
                { status: 401, headers }
            );
        }

        /**  Successful login: reset rate limit */
        await resetAttempts(ip, email);

        /**  Create tokens */
        const accessToken = createAccessToken(user._id.toString(), user.role);
        const rawRefreshToken = generateRawRefreshToken();
        await saveRefreshToken(user._id, rawRefreshToken, ip, ua, 7);

        /**  Set cookie header with refresh token */
        setRefreshCookieHeader(headers, rawRefreshToken, 7);

        /**  Respond with access token (used in Authorization header) */
        return new Response(
            JSON.stringify({
                message: "Login successful",
                accessToken,
            }),
            { status: 200, headers }
        );
    } catch (error: any) {
        console.error("Login error:", error);
        return new Response(
            JSON.stringify({ message: error.message || "Server error" }),
            { status: 500, headers }
        );
    }
}
