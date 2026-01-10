import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");

    const query: any = {};
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Contact.countDocuments(query),
    ]);

    return NextResponse.json({ messages, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error: any) {
    console.error("Admin Contacts GET error:", error);
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update a message (status)
export async function PUT(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await req.json();
    const { id, status } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const allowed = ["new", "read", "replied"];
    const update: any = {};
    if (status && allowed.includes(status)) update.status = status;

    // return the updated document using returnDocument option; avoid chaining .lean() for update ops to satisfy typings
    const message = await Contact.findByIdAndUpdate(id as any, update as any, { returnDocument: 'after' } as any);
    if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error("Admin Contacts PUT error:", error);
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const res = await Contact.findOneAndDelete({ _id: id } as any);
    if (!res) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin Contacts DELETE error:", error);
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
