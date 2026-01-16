import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Workshop from "@/models/Workshop";
import { requireAdmin } from "@/lib/admin-guard";
import { sendNewContentNotification } from "@/lib/email";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const workshops = await Workshop.find().sort({ createdAt: -1 });
    return NextResponse.json(workshops);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string;
    const level = formData.get("level") as string;
    const price = Number(formData.get("price"));
    const maxParticipants = Number(formData.get("maxParticipants"));
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const duration = formData.get("duration") as string;
    const location = formData.get("location") as string;
    const address = formData.get("address") as string;
    const includes = (formData.get("includes") as string)?.split(",") || [];
    const image = formData.get("image") as string;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const workshop = await Workshop.create({
      title,
      slug,
      description,
      type,
      level,
      price,
      maxParticipants,
      date,
      time,
      duration,
      location,
      address,
      includes,
      enrolledCount: 0,
      status: "upcoming",
      image,
    });

    // Send notification to all users (Async/Fire-and-forget)
    sendNewContentNotification(
      'workshop',
      workshop.title,
      workshop.description || "Join our new crafting session!",
      workshop.image || "",
      `/workshops#${workshop.slug}` // Anchor or direct link if page supports it
    ).catch(err => console.error("Failed to trigger workshop notification:", err));

    return NextResponse.json(workshop, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create workshop" }, { status: 400 });
  }
}


export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Workshop ID required" }, { status: 400 });
    }

    // Generate new slug if title changed
    if (updates.title) {
      updates.slug = updates.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Handle includes if it's a string
    if (typeof updates.includes === "string") {
      updates.includes = updates.includes.split(",").map((s: string) => s.trim()).filter(Boolean);
    }

    const workshop = await (Workshop as any).findByIdAndUpdate(id, updates, { new: true });

    if (!workshop) {
      return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
    }

    return NextResponse.json({ workshop });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update workshop" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Workshop ID required" }, { status: 400 });
    }

    await (Workshop as any).findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete workshop" }, { status: 400 });
  }
}
