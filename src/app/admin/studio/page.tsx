"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Trash2,
  Plus,
  Calendar,
  MapPin,
  Clock,
  Image as ImageIcon,
  Loader2,
  X,
  Edit,
} from "lucide-react";

export default function AdminStudio() {
  const [activeTab, setActiveTab] = useState<"images" | "exhibits">("images");

  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-soil mb-2">
          Studio Management
        </h1>
        <p className="text-soil/60">
          Manage your studio slider images and exhibitions.
        </p>
      </div>

      <div className="flex gap-4 mb-8 border-b border-soil/10 pb-1">
        <button
          onClick={() => setActiveTab("images")}
          className={`px-6 py-3 font-medium transition-all relative ${
            activeTab === "images"
              ? "text-clay"
              : "text-soil/60 hover:text-soil"
          }`}
        >
          Studio Images
          {activeTab === "images" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-1 bg-clay rounded-t-full"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("exhibits")}
          className={`px-6 py-3 font-medium transition-all relative ${
            activeTab === "exhibits"
              ? "text-clay"
              : "text-soil/60 hover:text-soil"
          }`}
        >
          Exhibitions
          {activeTab === "exhibits" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-1 bg-clay rounded-t-full"
            />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "images" && (
          <motion.div
            key="images"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <StudioImagesManager />
          </motion.div>
        )}
        {activeTab === "exhibits" && (
          <motion.div
            key="exhibits"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ExhibitsManager />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StudioImagesManager() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/gallery?category=studio");
      const data = await res.json();
      setImages(data.gallery || []);
    } catch (error) {
      console.error("Failed to fetch images", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("images", file);

    try {
      // 1. Upload to Cloudinary
      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (uploadData?.[0]) {
        // 2. Create Gallery Entry
        const imageUrl = uploadData[0];
        const res = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Studio Image",
            image: imageUrl,
            category: "studio",
            description: "Uploaded via Admin",
          }),
        });

        if (res.ok) {
          fetchImages();
        }
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      await fetch(`/api/admin/gallery?id=${id}`, { method: "DELETE" });
      setImages(images.filter((img) => img._id !== id));
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-soil/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-soil">
          Details & Auto-Slider Images
        </h2>
        <div className="relative">
          <input
            type="file"
            id="studio-upload"
            onChange={handleUpload}
            className="hidden"
            accept="image/*"
            disabled={uploading}
          />
          <label
            htmlFor="studio-upload"
            className={`flex items-center gap-2 bg-clay text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-clay/90 transition-colors ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {uploading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Add New Image
          </label>
        </div>
      </div>

      <p className="text-sm text-soil/60 mb-6 bg-amber-50 p-4 rounded-xl border border-amber-100">
        💡 The layout will automatically display the newest image first. These
        images will be used in the auto-playing carousel on the Studio page.
      </p>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img._id}
              className="relative group rounded-xl overflow-hidden aspect-video bg-sand/20"
            >
              <img
                src={img.image}
                alt={img.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDelete(img._id)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-full text-center py-12 text-soil/40 border-2 border-dashed border-soil/10 rounded-xl">
              No images uploaded yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ExhibitsManager() {
  const [exhibits, setExhibits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExhibit, setEditingExhibit] = useState<any>(null);

  useEffect(() => {
    fetchExhibits();
  }, []);

  const fetchExhibits = async () => {
    try {
      const res = await fetch("/api/admin/events"); // We created this GET route
      const data = await res.json();
      setExhibits(data.events || []);
    } catch (error) {
      console.error("Failed to fetch exhibits", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this exhibit?")) return;
    await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
    fetchExhibits();
  };

  const openEdit = (exhibit: any) => {
    setEditingExhibit(exhibit);
    setShowModal(true);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-soil/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-soil">Exhibitions</h2>
        <button
          onClick={() => {
            setEditingExhibit(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-soil text-white px-4 py-2 rounded-lg hover:bg-soil/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Exhibition
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="space-y-4">
          {exhibits.map((ex) => (
            <div
              key={ex._id}
              className="flex flex-col md:flex-row gap-4 p-4 border border-soil/10 rounded-xl hover:bg-sand/10 transition-colors"
            >
              <div className="w-24 h-24 bg-sand rounded-lg overflow-hidden flex-shrink-0">
                {ex.image && (
                  <img
                    src={ex.image}
                    alt={ex.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase mb-1 ${
                        new Date(ex.endDate) < new Date()
                          ? "bg-gray-100 text-gray-500"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {new Date(ex.endDate) < new Date() ? "Past" : "Upcoming"}
                    </span>
                    <h3 className="font-bold text-lg text-soil">{ex.title}</h3>
                    <div className="text-sm text-soil/60 flex gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />{" "}
                        {new Date(ex.startDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> {ex.city}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(ex)}
                      className="p-2 text-soil/60 hover:text-clay hover:bg-clay/10 rounded"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(ex._id)}
                      className="p-2 text-soil/60 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {exhibits.length === 0 && (
            <div className="text-center py-10 text-soil/40">
              No exhibitions found.
            </div>
          )}
        </div>
      )}

      {showModal && (
        <ExhibitModal
          exhibit={editingExhibit}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchExhibits();
          }}
        />
      )}
    </div>
  );
}

import { createPortal } from "react-dom";

function ExhibitModal({ exhibit, onClose, onSuccess }: any) {
  const isEdit = !!exhibit;
  const [imageLoading, setImageLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // ... (rest of useEffect)

  const [formData, setFormData] = useState({
    // ... (existing state)
    title: exhibit?.title || "",
    description: exhibit?.description || "",
    type: exhibit?.type || "exhibition",
    venue: exhibit?.venue || "",
    address: exhibit?.address || "",
    city: exhibit?.city || "",
    startDate: exhibit?.startDate
      ? new Date(exhibit.startDate).toISOString().split("T")[0]
      : "",
    endDate: exhibit?.endDate
      ? new Date(exhibit.endDate).toISOString().split("T")[0]
      : "",
    timings: exhibit?.timings || "",
    entryFee: exhibit?.entryFee || 0,
    registrationRequired: exhibit?.registrationRequired || false,
    registrationLink: exhibit?.registrationLink || "",
    image: exhibit?.image || "",
  });

  const handleChange = (e: any) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleImageUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Immediate Local Preview
    const objectUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, image: objectUrl }));
    setImageLoading(true);

    const fd = new FormData();
    fd.append("images", file);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();

      if (data.error) {
        alert(`Upload failed: ${data.details || data.error}`);
        console.error(data);
        // Revert to original or empty if failed
        setFormData((prev) => ({ ...prev, image: exhibit?.image || "" }));
        return;
      }
      if (data?.[0]) {
        // 2. Update with real server URL
        setFormData((prev) => ({ ...prev, image: data[0] }));
      }
    } catch (e) {
      console.error(e);
      alert("Upload failed. Check console.");
      setFormData((prev) => ({ ...prev, image: exhibit?.image || "" }));
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ... (submission logic)
      const url = "/api/admin/events";
      const method = isEdit ? "PUT" : "POST";
      const body = isEdit ? { ...formData, _id: exhibit._id } : formData;

      // Ensure description is an empty string if falsy, to satisfy backend/model requirements
      if (!body.description) body.description = "";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) onSuccess();
      else {
        const err = await res.json();
        console.error("Event Save Error:", err);
        alert("Failed to save: " + (err.error || "Unknown"));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* ... (header) ... */}
        <div className="p-6 border-b border-soil/10 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold">
            {isEdit ? "Edit Exhibition" : "New Exhibition"}
          </h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* ... (Basic Info inputs) ... */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Cover Image
            </label>
            <div className="flex gap-4 items-center">
              <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-dashed border-gray-300 flex items-center justify-center shrink-0">
                {formData.image ? (
                  <>
                    <img
                      src={formData.image}
                      className={`w-full h-full object-cover transition-opacity ${
                        imageLoading ? "opacity-50" : "opacity-100"
                      }`}
                    />
                    {imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-soil" />
                      </div>
                    )}
                  </>
                ) : (
                  <ImageIcon className="text-gray-400 w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="block w-full text-sm text-slate-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-clay/10 file:text-clay
                                    hover:file:bg-clay/20
                                  "
                />
                <p className="text-xs text-gray-500 mt-1">
                  {imageLoading
                    ? "Uploading to server..."
                    : "Recommended: 800x600px"}
                </p>
              </div>
            </div>
          </div>

          {/* ... (Rest of Form) ... */}
          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Venue Name
              </label>
              <input
                name="venue"
                required
                value={formData.venue}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Address
            </label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Timings</label>
              <input
                name="timings"
                placeholder="e.g. 10 AM - 6 PM"
                value={formData.timings}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Registration */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="regRequired"
              name="registrationRequired"
              checked={formData.registrationRequired}
              onChange={handleChange}
            />
            <label htmlFor="regRequired">Registration Required?</label>
          </div>
          {formData.registrationRequired && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Registration Link
              </label>
              <input
                name="registrationLink"
                value={formData.registrationLink}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          )}

          <div className="pt-4 border-t mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-soil hover:bg-soil/5 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || imageLoading}
              className="px-6 py-2 bg-clay text-white rounded-lg hover:bg-clay/90 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Saving..." : "Save Exhibition"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
