
import bcrypt from "bcryptjs";
import Student from "@/models/Student";
import dbConnect from "@/lib/mongoDb";

import User from "@/models/User";


export async function GET(req: Request) {
    try {

        await dbConnect();

        const domain = "@edu.pafiast.pk";
        let email = "";


        // Generate unique institutional email

        const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 random digits
        const regNo = `b23f${randomNum}cs`;
        email = `${regNo}${domain}`;
        let exists = await Student.exists({ institutionalEmail: email });
        if (!exists) {
            // Hash password
            const plainPassword = Math.random().toString(36).slice(-8); // random 8-char password
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            // Create student
            const student = await Student.create({
                regNo,
                institutionalEmail: email,


            });

            const user = await User.create({
                  institutionalEmail: email,
                  password: hashedPassword,
                  role: 'Student',
                  linkedId: student._id

            })

            const password = plainPassword;
            return Response.json({
                data: { institutionalEmail: user.institutionalEmail, password },

            });
        }
    }
    catch (err: any) {
        console.error(err);
        return Response.json({ error: err.message || "Server error" }, { status: 500 });
    }
}


