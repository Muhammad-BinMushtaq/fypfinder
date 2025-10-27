import mongoose from "mongoose";

export interface IMarks extends mongoose.Document {
    sectionCourseId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    assessmentType: "Quiz" | "Assignment" | "Mid" | "Final" | "Project";
    totalMarks: number;
    obtainedMarks: number;
    date?: Date;
    remarks?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
