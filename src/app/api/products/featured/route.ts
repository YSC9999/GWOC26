import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

// GET featured products for homepage
export async function GET() {
    try {
        await connectDB();

        const productsRaw = await Product.find({
            featured: true,
            inStock: true
        })
            .sort({ createdAt: -1 })
            .limit(6)
            .lean();

        const products = (productsRaw as any[]).map((p) => {
            const img = p.images && p.images.length > 0 ? p.images[0] : null;
            const valid = img && (img.startsWith("/") || img.startsWith("http") || img.startsWith("data:"));
            return { ...p, image: valid ? img : null };
        });

        return NextResponse.json({ products });
    } catch (error: any) {
        console.error("Featured products error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
