import mongoose from "mongoose";
import dotenv from "dotenv";




if (!process.env.MONGODB_URI) {
    throw new Error("MONGO_DB_URI is not defined in environment variables");
    console.log
}
const mongoDbUri = process.env.MONGODB_URI;

let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = (global as any).mongoose || { conn: null, promise: null };

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }


    if (!cached.promise) {
        cached.promise = mongoose.connect(mongoDbUri!).then((m) => m);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}


export default dbConnect;

