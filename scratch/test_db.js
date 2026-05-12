import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function checkDB() {
  const uri = process.env.MONGODB_URL;
  if (!uri) {
    console.error("No MONGODB_URL found in .env");
    return;
  }
  
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;

    // Check Products
    const products = await db.collection("products").find({}).limit(3).toArray();
    console.log("Products:", products.map(p => ({ name: p.name, images: p.images, image: p.image })));

    // Check Featured Collections
    const collections = await db.collection("featuredcollections").find({}).limit(3).toArray();
    console.log("Collections:", collections.map(c => ({ title: c.title, image: c.image })));

    // Check Workshops
    const workshops = await db.collection("workshops").find({}).limit(3).toArray();
    console.log("Workshops:", workshops.map(w => ({ title: w.title, image: w.image })));

    mongoose.connection.close();
  } catch (error) {
    console.error("Error connecting to DB:", error);
  }
}

checkDB();
