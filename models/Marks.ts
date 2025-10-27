import mongoose, { Schema } from "mongoose";
import { IMarks } from "@/types/marks";

const MarksSchema = new Schema<IMarks>(
    {
        sectionCourseId: { type: Schema.Types.ObjectId, ref: "SectionCourse", required: true },
        studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
        assessmentType: {
            type: String,
            enum: ["Quiz", "Assignment", "Mid", "Final", "Project"],
            required: true,
        },
        totalMarks: { type: Number, required: true },
        obtainedMarks: { type: Number, required: true },
        date: { type: Date },
        remarks: { type: String },
    },
    { timestamps: true }
);

MarksSchema.index({ sectionCourseId: 1, studentId: 1, assessmentType: 1 });

const Marks =
    mongoose.models.Marks || mongoose.model<IMarks>("Marks", MarksSchema);

export default Marks;
