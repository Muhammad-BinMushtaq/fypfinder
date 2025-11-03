import mongoose, { Schema, Document } from "mongoose";
import { IRefreshTokenDoc } from "@/types/refreshToken";




const RefreshTokenSchema = new Schema<IRefreshTokenDoc>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        tokenHash: { type: String, required: true },
        ip: String,
        userAgent: String,
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

// TTL index to auto-delete expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.RefreshToken ||
    mongoose.model<IRefreshTokenDoc>("RefreshToken", RefreshTokenSchema);
