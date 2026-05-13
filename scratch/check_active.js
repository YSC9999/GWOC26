import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function checkCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    const db = mongoose.connection.db;
    const count = await db.collection("featuredcollections").countDocuments({ isActive: true });
    console.log("Active collections count:", count);
    const all = await db.collection("featuredcollections").find({}).toArray();
    console.log("All collections:", all.map(c => ({ title: c.title, isActive: c.isActive })));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCollections();
