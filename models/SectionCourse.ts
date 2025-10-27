import mongoose, { Schema } from "mongoose";
import { ISectionCourse } from "@/types/sectionCourse";

const SectionCourseSchema = new Schema<ISectionCourse>(
  {
    sectionId: { type: Schema.Types.ObjectId, ref: "Section", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },

    schedule: { type: String },
    room: { type: String },
    semester: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

// Prevent duplicates for the same Section + Course + Semester + Year
SectionCourseSchema.index(
  { sectionId: 1, courseId: 1, semester: 1, year: 1 },
  { unique: true }
);

const SectionCourse =
  mongoose.models.SectionCourse ||
  mongoose.model<ISectionCourse>("SectionCourse", SectionCourseSchema);

export default SectionCourse;
