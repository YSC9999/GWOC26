import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CustomOrder from "@/models/CustomOrder";
import Product from "@/models/Product";
import { getUser } from "@/lib/server-auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const customOrder = await CustomOrder.findOne({ _id: id, userId: user.id });

    if (!customOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (customOrder.status !== 'quoted') {
      return NextResponse.json({ error: "Order is not in quoted status" }, { status: 400 });
    }

    // Create a hidden Product
    const productName = `Custom Order: ${customOrder.name}`;
    const productSlug = `custom-order-${customOrder._id}`;

    // Check if product already exists (maybe retry accept?)
    let product = await Product.findOne({ slug: productSlug });

    if (!product) {
      product = await Product.create({
        name: productName,
        slug: productSlug,
        description: `Custom order for ${customOrder.name}. Includes: ${customOrder.items.map((i: any) => i.name).join(', ')}`,
        price: customOrder.totalPrice,
        category: 'sets', // generic category
        images: customOrder.referenceImages || [], // or item images
        inStock: true,
        stockQuantity: 1,
        featured: false,
        // Hidden flag? The schema doesn't have 'hidden', but we can just not list it in main pages by filtering.
        // Or rely on current fetch logic (usually fetches all).
        // Actually, if we don't want it to show up in "Shop", we might need a flag.
        // For now, let's assume "Stock 1" and it will be bought immediately.
        // Or maybe we add 'tags': ['custom'] and filter out 'custom' in main shop.
        tags: ['custom', `order-${id}`]
      });
    }

    // Update Custom Order status
    customOrder.status = 'accepted';
    await customOrder.save();

    return NextResponse.json({
      success: true,
      productId: product._id,
      slug: product.slug
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}