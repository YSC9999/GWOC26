import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

// GET all products with filtering and pagination
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const featured = searchParams.get("featured");
        const search = searchParams.get("search");
        const limit = parseInt(searchParams.get("limit") || "50");
        const page = parseInt(searchParams.get("page") || "1");

        // Build query - ensure we filter using fields that exist in the Product schema
       // Use stockQuantity or inStock; previous code used `stock` which doesn't exist, returning no products.
       const query: any = { $or: [{ stockQuantity: { $gt: 0 } }, { inStock: true }] };

        if (category && category !== "all") {
            query.category = category;
        }

        if (featured === "true") {
            query.featured = true;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { tags: { $in: [new RegExp(search, "i")] } }
            ];
        }

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find(query)
                .sort({ featured: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(query)
        ]);

        return NextResponse.json({
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error("Products GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
