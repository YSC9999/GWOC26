import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Album from "@/models/Album";
import Gallery from "@/models/Gallery";
import slugify from "slugify";

// GET - Fetch all albums (supports admin filter)
export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const isAdmin = searchParams.get("admin") === "true";

        const filter: any = isAdmin ? {} : { isActive: true };
        const albums = await Album.find(filter).sort({ order: 1, createdAt: -1 });

        return NextResponse.json({ albums });
    } catch (error: any) {
        console.error("GET Albums Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create new album
export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { name, description, coverImage } = body;

        // Constraint: Check if we have reached 15 albums
        const count = await Album.countDocuments();
        if (count >= 15) {
            return NextResponse.json({ error: "Maximum limit of 15 albums reached." }, { status: 400 });
        }

        const slug = slugify(name, { lower: true, strict: true });

        // Ensure slug is unique
        const existingSlug = await Album.findOne({ slug } as any);
        if (existingSlug) {
            return NextResponse.json({ error: "Album with this name already exists." }, { status: 400 });
        }

        const newAlbum = await Album.create({
            name,
            slug,
            description,
            coverImage,
            order: count + 1,
            isActive: true
        });

        return NextResponse.json({ album: newAlbum }, { status: 201 });
    } catch (error: any) {
        console.error("POST Album Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Update album
export async function PUT(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { _id, ...updateData } = body;

        if (updateData.name) {
            updateData.slug = slugify(updateData.name, { lower: true, strict: true });
        }

        const updatedAlbum = await Album.findByIdAndUpdate(_id, updateData, { new: true } as any);
        return NextResponse.json({ album: updatedAlbum });
    } catch (error: any) {
        console.error("PUT Album Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete album
export async function DELETE(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Album ID required" }, { status: 400 });

        await (Album.findByIdAndDelete(id) as any);
        // Cascade delete gallery items
        await Gallery.deleteMany({ album: id } as any);

        return NextResponse.json({ message: "Album deleted successfully" });
    } catch (error: any) {
        console.error("DELETE Album Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
