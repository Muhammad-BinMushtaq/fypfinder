import mongoose, { Schema } from "mongoose";
import { ISection } from "@/types/section";

const SectionSchema = new Schema<ISection>(
    {
        code: { type: String, required: true, unique: true, index: true }, // for lookups
        name: { type: String, required: true }, // for display
        batch: { type: String, required: true },
        semester: { type: Number, required: true },
        department: { type: String },
        students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
    },
    { timestamps: true }
);

// Indexes
SectionSchema.index({ code: 1 }, { unique: true });
SectionSchema.index({ batch: 1, semester: 1 });

const Section =
    mongoose.models.Section || mongoose.model<ISection>("Section", SectionSchema);

export default Section;
