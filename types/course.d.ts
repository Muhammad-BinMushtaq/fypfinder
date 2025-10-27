import mongoose from "mongoose";


export interface ICourse extends mongoose.Document {
    code: string; // e.g., ENG101, CS201
    name: string; // Course name
    creditHours: number; // e.g., 3
    description?: string; // Optional detailed description
    department?: string; // e.g., Computer Science, English
    semesterOffered?: number; // e.g., 1, 2, 3, ...
    isActive?: boolean; // To manage retired or inactive courses
    createdAt?: Date;
    updatedAt?: Date;
}