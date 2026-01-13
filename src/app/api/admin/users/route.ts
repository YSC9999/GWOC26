import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireMainAdmin } from "@/lib/admin-guard";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    await requireMainAdmin();
    await connectDB();

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const role = url.searchParams.get("role") || "all";
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const page = parseInt(url.searchParams.get("page") || "1");

    const query: any = {};
    if (role && role !== "all") query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    return NextResponse.json({ users, pagination: { page, limit, total } });
  } catch (error: any) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireMainAdmin();
    await connectDB();

    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const allowedRoles = ["customer", "admin"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const exists = await User.findOne({ email }).lean();
    if (exists) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
    });

    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error: any) {
    console.error("Admin users POST error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireMainAdmin();
    await connectDB();

    const body = await req.json();
    const { id, name, email, password, role } = body;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const user = await User.findById(id as any);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (email && email !== user.email) {
      const exists = await User.findOne({ email }).lean();
      if (exists) return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      user.email = email;
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    const out = { _id: user._id, name: user.name, email: user.email, role: user.role };
    return NextResponse.json({ success: true, user: out });
  } catch (error: any) {
    console.error("Admin users PUT error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireMainAdmin();
    await connectDB();

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // Prevent deleting main admin
    const mainEmail = process.env.MAIN_ADMIN_EMAIL;
    if (mainEmail) {
      const mainUser = await User.findOne({ email: mainEmail }).lean();
      if (mainUser && String(mainUser._id) === id) {
        return NextResponse.json({ error: "Cannot delete main admin" }, { status: 400 });
      }
    }

    await User.deleteOne({ _id: id } as any);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin users DELETE error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}