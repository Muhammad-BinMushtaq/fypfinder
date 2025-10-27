import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
 
    institutionalEmail: string;
    password: string;
    role: "Admin" | "Teacher" | "Student";
    linkedId?: mongoose.Types.ObjectId; // Link to Student/Teacher profile
    createdAt?: Date;
    updatedAt?: Date;
}



