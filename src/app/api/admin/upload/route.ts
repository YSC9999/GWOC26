import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST(req: Request) {
  try {
    await requireAdmin();

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
  } catch {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 401 }
    );
  }
}
