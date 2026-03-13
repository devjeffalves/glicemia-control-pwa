import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

if (!MONGO_URI) {
    throw new Error("Defina MONGO_URI no .env");
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

    cached.conn = await cached.promise;

    return cached.conn;
}

export default connectMongo;