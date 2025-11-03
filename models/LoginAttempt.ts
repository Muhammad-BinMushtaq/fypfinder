import mongoose, { Schema, Document } from "mongoose";

export interface ILoginAttempt extends Document {
    key: string;
    count: number;
    firstAttemptAt: Date;
    blockedUntil?: Date | null;
}

const LoginAttemptSchema = new Schema<ILoginAttempt>({
    key: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    firstAttemptAt: { type: Date, default: Date.now },
    blockedUntil: { type: Date, default: null },
});

const LoginAttempt =
  mongoose.models.LoginAttempt ||
  mongoose.model<ILoginAttempt>("LoginAttempt", LoginAttemptSchema);

export default LoginAttempt;
