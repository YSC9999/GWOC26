import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";

// GET gallery items
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const featured = searchParams.get("featured");
        const albumId = searchParams.get("album");

        const query: any = {};

        if (category && category !== "all") {
            query.category = category;
        }

        if (featured === "true") {
            query.featured = true;
        }

        if (albumId) {
            query.album = albumId;
        }

        const gallery = await Gallery.find(query)
            .populate('album', 'name slug')
            .sort({ order: 1, createdAt: -1 })
            .lean();

        return NextResponse.json({ gallery });
    } catch (error: any) {
        console.error("Gallery GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Add new gallery item
export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        // Validation: Check constraints
        if (!body.album) {
            return NextResponse.json({ error: "Album ID is required" }, { status: 400 });
        }

        const type = body.type || 'image';

        if (type === 'video') {
            const videoCount = await Gallery.countDocuments({ album: body.album, type: 'video' } as any);
            if (videoCount >= 10) {
                return NextResponse.json({ error: "Maximum limit of 10 videos per album reached." }, { status: 400 });
            }
        } else {
            const imageCount = await Gallery.countDocuments({ album: body.album, type: 'image' } as any);
            if (imageCount >= 20) {
                return NextResponse.json({ error: "Maximum limit of 20 images per album reached." }, { status: 400 });
            }
        }

        // Get max order to append to end
        const lastItem = await Gallery.findOne({ album: body.album } as any).sort({ order: -1 });
        const newOrder = lastItem ? lastItem.order + 1 : 0;

        const newItem = await Gallery.create({
            ...body,
            order: newOrder
        });

        return NextResponse.json({ item: newItem }, { status: 201 });
    } catch (error: any) {
        console.error("Gallery POST error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Update gallery item
export async function PUT(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { _id, ...updateData } = body;

        const updatedItem = await Gallery.findByIdAndUpdate(_id, updateData, { new: true } as any);
        return NextResponse.json({ item: updatedItem });
    } catch (error: any) {
        console.error("Gallery PUT error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete gallery item
export async function DELETE(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Item ID required" }, { status: 400 });

        await (Gallery as any).findByIdAndDelete(id);
        return NextResponse.json({ message: "Item deleted successfully" });
    } catch (error: any) {
        console.error("Gallery DELETE error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
