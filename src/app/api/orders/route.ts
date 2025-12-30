import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();
  await connectDB();

  const order = await Order.create(data);
  return NextResponse.json(order);
}

export async function GET() {
  await connectDB();
  const orders = await Order.find().sort({ createdAt: -1 });
  return NextResponse.json(orders);
}
