// Review API Route - Verified Fix
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import Review from "@/models/Review";
import Order from "@/models/Order";
import Product from "@/models/Product";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

// Helper to get user from token
async function getUserFromRequest(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
        const token = authHeader.split(" ")[1];
        const decoded: any = jwt.verify(token, SECRET_KEY);
        return decoded;
    } catch (err) {
        return null;
    }
}

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");
        const checkEligibility = searchParams.get("checkEligibility");

        // Check Eligibility Mode
        if (checkEligibility === "true" && productId) {
            const user = await getUserFromRequest(req);
            if (!user) return NextResponse.json({ eligible: false, canReview: false });

            // Cast to ObjectId to be safe
            const userObjectId = new mongoose.Types.ObjectId(user.id);
            const productObjectId = new mongoose.Types.ObjectId(productId);

            // Check if user has ANY order with this product (still useful for the "Verified Purchase" badge)
            const order = await Order.findOne({
                userId: userObjectId,
                "items.productId": productObjectId,
                status: { $ne: "cancelled" }
            });

            // Check if user already reviewed
            const existingReview = await Review.findOne({ product: productId, user: user.id });

            return NextResponse.json({
                eligible: !!order, // For "Verified Purchase" badge
                hasReviewed: !!existingReview,
                canReview: !existingReview // ALLOW ALL USERS TO REVIEW if they haven't already
            });
        }

        // Normal Get Reviews
        if (!productId) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });
        return NextResponse.json({ reviews });

    } catch (error: any) {
        console.error("Review API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const user = await getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { productId, rating, comment, images } = body;

        // SKIP PURCHASE CHECK AS REQUESTED
        /*
        const userObjectId = new mongoose.Types.ObjectId(user.id);
        const productObjectId = new mongoose.Types.ObjectId(productId);

        const hasPurchased = await Order.exists({
            userId: userObjectId,
            "items.productId": productObjectId,
            status: { $ne: "cancelled" }
        });

        if (!hasPurchased) {
            return NextResponse.json({ error: "You must purchase this product to review it." }, { status: 403 });
        }
        */

        // Check Existing Review
        const existing = await Review.findOne({ product: productId, user: user.id });

        if (existing) {
            return NextResponse.json({ error: "You have already reviewed this product." }, { status: 400 });
        }

        // Create Review
        const review = await Review.create({
            product: productId,
            user: user.id,
            userName: user.name || "Customer",
            rating,
            comment,
            images
        });

        // Update Product Stats
        const stats = await Review.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId) } },
            {
                $group: {
                    _id: "$product",
                    avgRating: { $avg: "$rating" },
                    count: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            await Product.findByIdAndUpdate(productId, {
                rating: Math.round(stats[0].avgRating * 10) / 10,
                reviewCount: stats[0].count
            });
        }

        return NextResponse.json({ review });

    } catch (error: any) {
        console.error("Review Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await connectDB();
        const user = await getUserFromRequest(req);

        // Verify Admin
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const reviewId = searchParams.get("id");

        if (!reviewId) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await Review.findByIdAndDelete(reviewId);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
