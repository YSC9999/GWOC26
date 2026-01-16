import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Album from "@/models/Album";

// GET - Fetch all albums
export async function GET() {
    try {
        await connectDB();
        const albums = await Album.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        return NextResponse.json({ albums });
    } catch (error: any) {
        console.error("GET Albums Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
