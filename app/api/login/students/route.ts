import dbConnect from "@/lib/mongoDb";
import Student from "@/models/Student";
import User from "@/models/User";
import bcrypt from "bcryptjs";


export async function POST(req: Request) {
    const { email, password } = await req.json();
    try {
        const institutionalEmail = email
        await dbConnect()
        const user = await User.findOne({ institutionalEmail });
        if (!user) {
            console.log(user)
            throw new Error("record not found");
        }

        let isPasswordTrue = await bcrypt.compare(password, user.password!);
        if (!isPasswordTrue) {
            return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 401 });
        }
        return new Response(JSON.stringify({ message: "Login successful" }), { status: 200 });


    }
    catch (error: any) {

        // throw new Error("Server error", error );
        console.log(error)
        return new Response(JSON.stringify({ message: error.message }), { status: 500 });

    }
}