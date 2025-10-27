import { ITeacher } from "@/types/teacher";
import mongoose, { Schema } from "mongoose";


const TeacherSchema = new Schema<ITeacher>(
    {
        name: { type: String, required: true },
        designation: { type: String },
        department: { type: String },
        institutionalEmail: { type: String, required: true, unique: true, index: true },
        personalEmail: { type: String },
        phone: { type: String },
        cnic: { type: String },
        qualification: { type: String },
        experience: { type: String },
        coursesTaught: [{ type: Schema.Types.ObjectId, ref: "SectionCourse" }],
    },
    { timestamps: true }
);

const Teacher =
    mongoose.models.Teacher || mongoose.model<ITeacher>("Teacher", TeacherSchema);

export default Teacher;
