import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getUser } from "@/lib/server-auth";

/* GET: Get user's wishlist */
export async function GET() {
    try {
        await connectDB();
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Populate wishlist products
        const userData = await User.findById(user.id).populate("wishlist");
        return NextResponse.json({ wishlist: userData?.wishlist || [] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/* POST: Toggle wishlist item */
export async function POST(req: Request) {
    try {
        await connectDB();
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { productId } = await req.json();
        if (!productId) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        const dbUser = await User.findById(user.id);
        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if product is already in wishlist
        const index = dbUser.wishlist.indexOf(productId);
        let isLiked = false;

        if (index === -1) {
            // Add to wishlist
            dbUser.wishlist.push(productId);
            isLiked = true;
        } else {
            // Remove from wishlist
            dbUser.wishlist.splice(index, 1);
            isLiked = false;
        }

        await dbUser.save();

        return NextResponse.json({ success: true, isLiked, wishlist: dbUser.wishlist });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
