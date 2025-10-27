import mongoose from "mongoose";

export interface IAttendance extends mongoose.Document {
    sectionCourseId: mongoose.Types.ObjectId; // Link to class
    studentId: mongoose.Types.ObjectId;
    date: Date;
    status: "Present" | "Absent" | "Leave";
    markedBy?: mongoose.Types.ObjectId; // Teacher or Admin ID
    createdAt?: Date;
    updatedAt?: Date;
}
