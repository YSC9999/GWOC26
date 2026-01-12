import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await connectDB();

        // Next.js 15/16 compatibility: Await params
        const { slug } = await params;

        console.log(`[Product API v2] Searching for: ${slug}`);

        // Try to find by slug first
        let product = await Product.findOne({ slug });

        // Fallback for ID backwards compatibility or if slug lookup fails
        if (!product && slug.match(/^[0-9a-fA-F]{24}$/)) {
            console.log(`[Product API v2] Trying ID lookup for: ${slug}`);
            product = await Product.findById(slug);
        }

        if (!product) {
            console.log(`[Product API v2] Not found: ${slug}`);
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ product });
    } catch (error) {
        console.error("Fetch Product Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
