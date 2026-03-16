import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

if (!MONGO_URI) {
    throw new Error("Defina MONGO_URI no arquivo .env (local) ou nas Environment Variables (Vercel)");
}

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectMongo() {

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {

        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
            return mongoose;
        });

    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        // Reset do cache em caso de falha — permite tentativa futura
        cached.promise = null;
        cached.conn = null;
        throw error;
    }

    return cached.conn;
}

export default connectMongo;