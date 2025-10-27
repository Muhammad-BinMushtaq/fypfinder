import mongoose, { Schema } from "mongoose";
import { IUser } from "@/types/user";

const UserSchema = new Schema<IUser>(
    {
       
        institutionalEmail: { type: String, required: true, unique: true, index: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["Admin", "Teacher", "Student"], required: true },
        linkedId: { type: Schema.Types.ObjectId },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
