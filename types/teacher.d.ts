import mongoose from "mongoose";

export interface ITeacher extends mongoose.Document {
    name: string;
    designation?: string; // Lecturer, Assistant Professor, etc.
    department?: string;
    institutionalEmail: string; // Required for login
    personalEmail?: string;
    phone?: string;
    cnic?: string;
    qualification?: string; // e.g., MS Computer Science
    experience?: string; // e.g., 5 years
    coursesTaught?: mongoose.Types.ObjectId[]; // SectionCourse IDs
    createdAt?: Date;
    updatedAt?: Date;
}
