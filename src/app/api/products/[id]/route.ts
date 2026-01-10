import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

// GET single product by ID or slug
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const { id } = await params;

        // Try to find by ID first, then by slug
        let product;

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product.findById(id).lean();
        }

        if (!product) {
            product = await Product.findOne({ slug: id }).lean();
        }

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ product });
    } catch (error: any) {
        console.error("Product GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
