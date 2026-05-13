import mongoose from "mongoose";
import dns from "dns";

// Force Node to use Google's DNS servers for SRV resolution
// This is critical for environments where local DNS fails to resolve SRV records
function initializeDNS() {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
    console.log("MongoDB DNS: Set to Google DNS successfully");
  } catch (e) {
    console.warn("MongoDB DNS: Could not set DNS servers:", e);
  }
}

if (process.env.NODE_ENV === "development") {
  initializeDNS();
}

const MONGODB_URL = process.env.MONGODB_URL!;

if (!MONGODB_URL) {
  throw new Error("MONGODB_URL is not defined in environment variables");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000, // Very high timeout for unstable networks
      connectTimeoutMS: 30000,
      family: 4, // Prioritize IPv4
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URL, opts).then((mongoose) => {
      console.log("MongoDB connected successfully");
      return mongoose;
    }).catch((err) => {
      console.error('MongoDB connect error:', err);
      // If SRV fails, we might be on a network that blocks SRV but allows standard connection
      if (err.message.includes('querySrv ETIMEOUT') || err.message.includes('querySrv ENOTFOUND')) {
        console.warn('SRV resolution failed. Suggest checking MONGODB_URL or network DNS settings.');
      }
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset promise on failure so next attempt retries
    throw e;
  }

  return cached.conn;
}
