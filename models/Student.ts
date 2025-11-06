import mongoose, { Schema } from "mongoose";
import { IStudent } from "@/types/student";


const StudentSchema = new Schema<IStudent>(
  {
    // Basic & Academic
    regNo: { type: String  },
    batch: { type: String },
    sectionId: { type: Schema.Types.ObjectId, ref: "Section" },
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "SectionCourse" }],


    // Personal
    name: { type: String  },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dob: { type: Date },
    religion: { type: String },
    nationality: { type: String },
    bloodGroup: { type: String },
    cnic: { type: String required: true },
    passportNo: { type: String },



    // Contact
    personalPhone: { type: String },
    guardianMobile: { type: String },
    personalEmail: { type: String  },
    institutionalEmail: { type: String, required: true },


    // Education sponsor
    educationSponsoredBy: { type: String },


    // Guardian & Family
    fatherName: { type: String },
    fatherCnic: { type: String },
    fatherOccupation: { type: String },
    fatherEmployer: { type: String },
    fatherMonthlyIncome: { type: Number },
    motherName: { type: String },


    // Address
    presentAddress: { type: String },
  },
  { timestamps: true }
);





const Student = mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

export default Student;