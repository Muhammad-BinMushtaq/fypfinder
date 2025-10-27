export interface IRefreshToken {
    _id?: string;
    userId: mongoose.Types.ObjectId;
    tokenHash: string;     
    createdAt: Date;
    expiresAt: Date;
    ip?: string;
    userAgent?: string;
}
