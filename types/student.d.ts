import mongoose from "mongoose";


export interface IStudent extends mongoose.Document {
// Basic & Academic
regNo: string; // e.g., B23F0001SE021
batch: string; // e.g., BSE23F
sectionId: mongoose.Types.ObjectId; // Reference to Section
enrolledCourses?: mongoose.Types.ObjectId[]; // SectionCourse ids


// Personal
name: string;
gender?: "Male" | "Female" | "Other";
dob?: Date;
religion?: string;
nationality?: string;
bloodGroup?: string;
cnic?: string; // CNIC or Form-B No
passportNo?: string;


// Contact
personalPhone?: string;
guardianMobile?: string;
personalEmail?: string;
institutionalEmail: string; // university-provided, required


// Education sponsor
educationSponsoredBy?: string;


// Guardian & Family
fatherName?: string;
fatherCnic?: string;
fatherOccupation?: string;
fatherEmployer?: string;
fatherMonthlyIncome?: number;
motherName?: string;


// Address
presentAddress?: string;


// System fields
createdAt?: Date;
updatedAt?: Date;
}