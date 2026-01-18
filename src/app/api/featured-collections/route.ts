import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FeaturedCollection from "@/models/FeaturedCollection";
import Product from "@/models/Product"; // Ensure Product model is registered

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const activeOnly = searchParams.get("active") === "true";

        const query = activeOnly ? { isActive: true } : {};

        const collections = await FeaturedCollection.find(query)
            .sort({ displayOrder: 1, createdAt: -1 })
            .populate("products");

        return NextResponse.json({ collections });
    } catch (error: any) {
        console.error("Fetch Collections Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        // Auto-generate slug if not provided
        if (!body.slug && body.title) {
            body.slug = body.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, ""); // basic slugify
        }

        const collection = await FeaturedCollection.create(body);
        return NextResponse.json({ collection }, { status: 201 });
    } catch (error: any) {
        console.error("Create Collection Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create collection" }, { status: 500 });
    }
}
