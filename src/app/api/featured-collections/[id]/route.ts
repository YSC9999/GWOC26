import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FeaturedCollection from "@/models/FeaturedCollection";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Correct for Next.js 15+
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();

        const collection = await FeaturedCollection.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!collection) {
            return NextResponse.json({ error: "Collection not found" }, { status: 404 });
        }

        return NextResponse.json({ collection });
    } catch (error: any) {
        console.error("Update Collection Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const collection = await FeaturedCollection.findByIdAndDelete(id);

        if (!collection) {
            return NextResponse.json({ error: "Collection not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete Collection Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
