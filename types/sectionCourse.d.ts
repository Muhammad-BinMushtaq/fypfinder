import mongoose from "mongoose";

export interface ISectionCourse extends mongoose.Document {
    sectionId: mongoose.Types.ObjectId; // reference to Section
    courseId: mongoose.Types.ObjectId; // reference to Course
    teacherId: mongoose.Types.ObjectId; // reference to Teacher

    schedule?: string; // e.g., "Mon-Wed 10:00-11:30"
    room?: string; // e.g., "Lab 2" or "CS-101"
    semester: number; // which semester it's offered in
    year: number; // e.g., 2025

    createdAt?: Date;
    updatedAt?: Date;
}
