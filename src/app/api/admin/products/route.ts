import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/admin-guard";

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

    const { name, price, stock, images = [] } = await req.json();

    const product = await Product.create({
      name,
      price,
      stock,
      images,
    });

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Create failed" }, { status: 400 });
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
