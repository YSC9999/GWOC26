import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WorkshopCategory from "@/models/WorkshopCategory";
import slugify from "slugify";

export async function GET() {
    try {
        await connectDB();
        const categories = await WorkshopCategory.find().sort({ name: 1 });
        return NextResponse.json(categories);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const { name } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const slug = slugify(name, { lower: true, strict: true });

        // Check for duplicate
        const existing = await (WorkshopCategory as any).findOne({ slug });
        if (existing) {
            return NextResponse.json(
                { error: "Category already exists" },
                { status: 400 }
            );
        }

        const category = await WorkshopCategory.create({ name, slug });
        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await connectDB();
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const deleted = await (WorkshopCategory as any).findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Category deleted" });
    } catch (error: any) {
        console.error("Delete Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
