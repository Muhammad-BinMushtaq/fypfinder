import { verifyAccessToken } from "@/lib/auth";
import dbConnect from "@/lib/mongoDb";
import Student from "@/models/Student";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    await dbConnect()

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {

        console.log("request", req)
        console.log("authHeader", authHeader)
        return NextResponse.json(
            { message: "No authorization token provided" },
            { status: 401 }
        );
    }



    // 2. Extract the token
    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token)
    if (!payload) {
        return NextResponse.json(
            { message: "Invalid token" },
            { status: 401 }
        )
    }


    // 3 get student info
    const user = await User.findById(payload.sub)
    if (!user) {
        return NextResponse.json(
            { message: "Invalid token" },

            { status: 401 }
        )


    }


    try {
        const student = await Student.findById(user.linkedId)
        if (!student) {
            return NextResponse.json(
                { message: "Student not found" },
                { status: 404 })
        }

        return NextResponse.json(

            {
                message: "Student Found successfully",
                student
            },

            {
                status: 200
            }

        )
    } catch (error) {
        console.error('Failed to fetch profile:', error);
        throw error;
    }
}