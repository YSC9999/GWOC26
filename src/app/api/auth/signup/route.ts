import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  await connectDB();

  const exists = await User.findOne({ email });
  if (exists) return NextResponse.json({ error: "User exists" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ email, password: hashed });

  return NextResponse.json({ success: true });
}
