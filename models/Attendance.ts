import mongoose, { Schema } from "mongoose";
import { IAttendance } from "@/types/attendance";

const AttendanceSchema = new Schema<IAttendance>(
    {
        sectionCourseId: { type: Schema.Types.ObjectId, ref: "SectionCourse", required: true },
        studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
        date: { type: Date, required: true },
        status: { type: String, enum: ["Present", "Absent", "Leave"], required: true },
        markedBy: { type: Schema.Types.ObjectId, ref: "Teacher" },
    },
    { timestamps: true }
);

AttendanceSchema.index({ sectionCourseId: 1, studentId: 1, date: 1 }, { unique: true });

const Attendance =
    mongoose.models.Attendance ||
    mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
