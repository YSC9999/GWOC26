import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  await connectDB();

  const products = await Product.find({
    isActive: true,
    stock: { $gt: 0 },
  })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(products);
}
