import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      console.error("❌ CLOUDINARY_CLOUD_NAME is missing in environment variables!");
      throw new Error("Server Misconfiguration: CLOUDINARY_CLOUD_NAME (or NEXT_PUBLIC_ variant) is missing.");
    }

    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    const uploads = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());

        return new Promise<string>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "products" }, (err, result) => {
              if (err || !result) reject(err);
              else resolve(result.secure_url);
            })
            .end(buffer);
        });
      })
    );

    return NextResponse.json(uploads);
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { error: "Upload failed", details: error.message },
      { status: 500 }
    );
  }
}
