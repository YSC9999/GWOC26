import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import { requireAdmin } from "@/lib/admin-guard";

// POST create new gallery item
export async function POST(req: Request) {
    try {
        await requireAdmin();
        await connectDB();

        const body = await req.json();
        const { title, image, category, description } = body;

        if (!title || !image || !category) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const galleryItem = await Gallery.create({
            title,
            image,
            category,
            description,
            featured: false,
            order: 0,
        });

        return NextResponse.json({ galleryItem }, { status: 201 });
    } catch (error: any) {
        console.error("Admin Gallery POST error:", error);
        if (error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE gallery item
export async function DELETE(req: Request) {
    try {
        await requireAdmin();
        await connectDB();

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        const deletedItem = await (Gallery as any).findByIdAndDelete(id);

        if (!deletedItem) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Item deleted successfully" });
    } catch (error: any) {
        console.error("Admin Gallery DELETE error:", error);
        if (error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
