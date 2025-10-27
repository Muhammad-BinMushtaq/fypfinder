import { ICourse } from "@/types/course";
import mongoose, { Schema } from "mongoose";



const CourseSchema = new Schema<ICourse>(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    creditHours: { type: Number, required: true },
    description: { type: String },
    department: { type: String },
    semesterOffered: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);


CourseSchema.index({ code: 1 }, { unique: true });
CourseSchema.index({ department: 1 });


const Course = mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);


export default Course;

