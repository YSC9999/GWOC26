import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
import slugify from "slugify";

// GET: Fetch all categories
export async function GET() {
    try {
        await connectDB();
        let categories = await Category.find().sort({ order: 1, name: 1 });

        // Seed if empty
        if (categories.length === 0) {
            const seedData = PRODUCT_CATEGORIES.filter((c) => c.id !== "all").map((c, index) => ({
                name: c.label,
                slug: c.id,
                order: index,
            })) as any[];
            categories = await Category.insertMany(seedData);
        }

        return NextResponse.json(categories);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new category
export async function POST(req: Request) {
    try {
        await connectDB();
        const { name } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const slug = slugify(name, { lower: true, strict: true });

        // Check for duplicate
        const existing = await Category.findOne({ slug } as any);
        if (existing) {
            return NextResponse.json({ error: "Category already exists" }, { status: 400 });
        }

        const category = await Category.create({ name, slug });
        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Remove a category
export async function DELETE(req: Request) {
    try {
        await connectDB();
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await (Category as any).findByIdAndDelete(id);
        return NextResponse.json({ message: "Category deleted" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
