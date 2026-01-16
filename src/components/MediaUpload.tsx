"use client";
import { useState } from "react";
import { Upload, X } from "lucide-react";

export default function MediaUpload({
    onUploaded,
    uploadPreset,
    folder,
    resourceType = "image",
    label = "Upload File",
    currentUrl,
    onClear
}: {
    onUploaded: (url: string) => void;
    uploadPreset?: string;
    folder?: string;
    resourceType?: "image" | "video";
    label?: string;
    currentUrl?: string;
    onClear?: () => void;
}) {
    const [uploading, setUploading] = useState(false);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const file = files[0];
        const data = new FormData();
        data.append("file", file);
        data.append(
            "upload_preset",
            uploadPreset || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
        );
        if (folder) data.append("folder", folder);

        try {
            const type = resourceType === 'video' ? 'video' : 'image';
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${type}/upload`,
                { method: "POST", body: data }
            );
            const json = await res.json();
            if (json.secure_url) {
                onUploaded(json.secure_url);
            } else {
                console.error("Upload failed", json);
                alert("Upload failed: " + (json.error?.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Upload error", err);
            alert("Upload error");
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="flex flex-col gap-3">
            {!currentUrl ? (
                <label className={`flex items-center justify-center gap-2 cursor-pointer bg-white/10 border border-soil/20 border-dashed p-4 rounded-xl hover:bg-white/20 transition-all w-full text-center group ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input
                        type="file"
                        accept={resourceType === 'video' ? "video/*" : "image/*"}
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                    <Upload size={20} className="text-soil/40 group-hover:text-soil/60 transition-colors" />
                    <span className="text-soil/60 group-hover:text-soil/80 text-sm font-medium transition-colors">
                        {uploading ? "Uploading..." : label}
                    </span>
                </label>
            ) : (
                <div className="relative group w-fit">
                    {resourceType === 'video' ? (
                        <video src={currentUrl} className="h-32 w-auto rounded-lg shadow-sm bg-black" controls />
                    ) : (
                        <img src={currentUrl} alt="Preview" className="h-32 w-auto rounded-lg shadow-sm object-cover" />
                    )}
                    {onClear && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-100 shadow-md hover:bg-red-600 transition-colors"
                            title="Remove"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
