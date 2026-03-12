import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
    throw new Error("Defina MONGO_URI no .env");
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// adiciona cache global
declare global {
    var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
    cached = global.mongooseCache = {
        conn: null,
        promise: null,
    };
}

export async function connectDB() {

    if (cached?.conn) {
        return cached.conn;
    }

    if (!cached?.promise) {

        cached!.promise = mongoose.connect(MONGO_URI, {
            bufferCommands: false,
        });

    }

    cached!.conn = await cached!.promise;

    return cached!.conn;
}