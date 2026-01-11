"use client";
import { useState } from "react";

export default function UploadInput({
  onUploaded,
  uploadPreset,
  folder,
}: {
  onUploaded: (urls: string[]) => void;
  uploadPreset?: string;
  folder?: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const urls: string[] = [];

    for (const file of Array.from(files)) {
      const data = new FormData();
      data.append("file", file);
      data.append(
        "upload_preset",
        uploadPreset || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );

      if (folder) {
        data.append("folder", folder);
      }

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const json = await res.json();
      urls.push(json.secure_url);
    }

    setUploading(false);
    onUploaded(urls);
  }

  return (
    <div className="flex flex-col gap-1">
      <input type="file" multiple accept="image/*" onChange={handleUpload} />
      {uploading && <span className="text-sm text-blue-600">Uploading...</span>}
    </div>
  );
}
