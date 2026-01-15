import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query) {
            return NextResponse.json({ products: [] });
        }

        // Case-insensitive regex search
        const products = await Product.find({
            name: { $regex: query, $options: "i" },
            tags: { $ne: 'custom' }
        })
            .select("name images price category") // Select minimal fields
            .limit(10);

        return NextResponse.json({ products });
    } catch (error) {
        console.error("Error searching products:", error);
        return NextResponse.json(
            { error: "Failed to search products" },
            { status: 500 }
        );
    }
}
