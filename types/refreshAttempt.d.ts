export interface IRefreshAttempt {
    _id?: mongoose.Types.ObjectId;
    key: string;              
    count: number;            
    firstAttemptAt: Date;
    blockedUntil?: Date;
}
