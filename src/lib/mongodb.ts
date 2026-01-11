import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL!;

if (!MONGODB_URL) {
  throw new Error("MONGODB_URL is not defined");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL, {
      bufferCommands: false,
      // Set a reasonable server selection timeout so the app fails faster on network issues
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    }).catch((err) => {
      console.error('MongoDB connect error:', err);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
