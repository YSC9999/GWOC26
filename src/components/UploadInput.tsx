"use client";
import { useState } from "react";

export default function UploadInput({
  onUploaded,
  uploadPreset,
  folder,
  children,
}: {
  onUploaded: (urls: string[]) => void;
  uploadPreset?: string;
  folder?: string;
  children?: React.ReactNode;
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
      if (json.secure_url) {
        urls.push(json.secure_url);
      } else {
        console.error("Upload failed:", json);
      }
    }

    setUploading(false);
    if (urls.length > 0) {
      onUploaded(urls);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="cursor-pointer">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleUpload}
          className={children ? "hidden" : "block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"}
        />
        {children}
      </label>
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-clay justify-center mt-2">
          <svg className="animate-spin h-4 w-4 text-clay" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Uploading...
        </div>
      )}
    </div>
  );
}
