import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import StudioInfo from "@/models/StudioInfo";
import { requireAdmin } from "@/lib/admin-guard";

// GET studio info (admin)
export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const studioInfo = await StudioInfo.findOne().lean();
    if (!studioInfo) {
      return NextResponse.json({ error: "Studio info not found" }, { status: 404 });
    }

    return NextResponse.json({ studioInfo });
  } catch (error: any) {
    console.error("Admin Studio GET error:", error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update/create studio info (admin)
export async function PUT(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await req.json();

    // Basic sanitization: only allow known fields
    const allowedFields = [
      'name','tagline','address','city','state','pincode','mapUrl','mapLink',
      'phone','email','whatsapp','visitingHours','visitPolicy','collectionPolicy',
      'instagram','facebook','youtube','aboutText','founderName','founderBio','founderImage'
    ];

    const update: any = {};
    Object.keys(body).forEach((k) => {
      if (allowedFields.includes(k)) update[k] = body[k];
    });

    // Use MongoDB options compatible with mongoose typings (returnDocument: 'after' returns the updated document)
    const studioInfo = await StudioInfo.findOneAndUpdate({} as any, update as any, { upsert: true, returnDocument: 'after' } as any);

    return NextResponse.json({ studioInfo });
  } catch (error: any) {
    console.error("Admin Studio PUT error:", error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
