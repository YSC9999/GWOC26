import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/admin-guard";
import { sendNewContentNotification } from "@/lib/email";

/* GET ALL PRODUCTS */
export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/* ADD PRODUCT */
export async function POST(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const { name, price, stockQuantity, weightGrams, images = [], description, category } = await req.json();

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check for existing slug and modify if necessary to ensure uniqueness
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      slug = `${slug}-${Date.now()}`;
    }

    const product = await Product.create({
      name,
      slug,
      description: description || "",
      category,
      price,
      stockQuantity,
      weightGrams: weightGrams || 500, // Default if not provided
      images,
    });

    // Send notification to all users (Async/Fire-and-forget)
    sendNewContentNotification(
      'product',
      product.name,
      product.description || "Check out our latest addition!",
      product.images && product.images.length > 0 ? product.images[0] : "",
      `/products/${product.slug}`
    ).catch(err => console.error("Failed to trigger product notification:", err));

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}


/* UPDATE PRODUCT */
export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const { id, ...data } = await req.json();

    const updated = await Product.findByIdAndUpdate(
      id,
      data,
      { returnDocument: "after" } // ✅ MONGOOSE 8+
    ).exec();

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

/* DELETE PRODUCT */
export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await req.json();

    await Product.findByIdAndDelete(id).exec();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
