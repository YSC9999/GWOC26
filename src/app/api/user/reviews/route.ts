import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";
import { getUser } from "@/lib/server-auth";

export async function GET(req: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Find reviews by user and populate product info
        const reviews = await Review.find({ user: user.id })
            .populate({
                path: 'product',
                select: 'name images',
                model: Product
            })
            .sort({ createdAt: -1 })
            .lean();

        // Transform for frontend if needed (renaming 'product' to 'productId' to match component expectation)
        const formattedReviews = reviews.map((r: any) => ({
            ...r,
            productId: r.product
        }));

        return NextResponse.json({ reviews: formattedReviews });
    } catch (error: any) {
        console.error("User Reviews API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
