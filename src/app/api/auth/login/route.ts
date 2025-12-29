import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";


export async function POST(req: Request) {
  const { email, password } = await req.json();
  await connectDB();

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return NextResponse.json({ error: "Wrong password" }, { status: 401 });

  const token = jwt.sign({ id: user._id }, "SECRETKEY");

  const res = NextResponse.json({ success: true });
  res.cookies.set("basho_token", token, { httpOnly: true });

  return res;
}
