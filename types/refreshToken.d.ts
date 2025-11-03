export interface IRefreshTokenDoc {
    _id: string
    userId: Types.ObjectId;
    tokenHash: string;
    ip?: string;
    userAgent?: string;
    createdAt?: Date;
    expiresAt: Date;
}
