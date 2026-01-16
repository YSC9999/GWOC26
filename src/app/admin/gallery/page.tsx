"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Album {
    _id: string;
    name: string;
    slug: string;
    coverImage?: string;
    description?: string;
    isActive: boolean;
    order: number;
}

export default function AdminGalleryPage() {
    const router = useRouter();
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        coverImage: "",
    });

    useEffect(() => {
        fetchAlbums();
    }, []);

    const fetchAlbums = async () => {
        try {
            const res = await fetch("/api/albums?admin=true");
            const data = await res.json();
            if (data.albums) {
                setAlbums(data.albums);
            }
        } catch (error) {
            console.error("Failed to fetch albums:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = "/api/albums";
            const method = editingAlbum ? "PUT" : "POST";
            const body = editingAlbum
                ? { ...formData, _id: editingAlbum._id }
                : formData;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setShowModal(false);
                setEditingAlbum(null);
                setFormData({ name: "", description: "", coverImage: "" });
                fetchAlbums();
            } else {
                const err = await res.json();
                alert(err.error || "Operation failed");
            }
        } catch (error) {
            console.error("Failed to save album:", error);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete album "${name}"? This will confirm delete all images/videos in it.`)) return;

        try {
            const res = await fetch(`/api/albums?id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchAlbums();
            }
        } catch (error) {
            console.error("Failed to delete album:", error);
        }
    };

    const openEdit = (album: Album) => {
        setEditingAlbum(album);
        setFormData({
            name: album.name,
            description: album.description || "",
            coverImage: album.coverImage || "",
        });
        setShowModal(true);
    };

    const openCreate = () => {
        if (albums.length >= 15) {
            alert("Maximum limit of 15 albums reached.");
            return;
        }
        setEditingAlbum(null);
        setFormData({ name: "", description: "", coverImage: "" });
        setShowModal(true);
    };

    return (
        <div className="min-h-screen p-6 md:p-10 font-sans">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-soil mb-2 font-serif">Gallery Management</h1>
                    <p className="text-soil/60">Manage your albums and collections ({albums.length}/15)</p>
                </div>
                <button
                    onClick={openCreate}
                    disabled={albums.length >= 15}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${albums.length >= 15
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-clay text-white hover:bg-clay/90 shadow-lg hover:shadow-xl"
                        }`}
                >
                    <Plus size={20} />
                    <span>New Album</span>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-clay border-t-transparent"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {albums.map((album) => (
                        <motion.div
                            key={album._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-lg border border-soil/10 overflow-hidden hover:shadow-2xl transition-all group"
                        >
                            <div
                                className="h-48 bg-gray-100 relative cursor-pointer"
                                onClick={() => router.push(`/admin/gallery/${album._id}`)}
                            >
                                {album.coverImage ? (
                                    <img src={album.coverImage} alt={album.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-soil/30">
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <span className="bg-white/90 text-soil px-4 py-2 rounded-full font-semibold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                                        Manage Content
                                    </span>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-soil font-serif truncate pr-4">{album.name}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEdit(album)}
                                            className="p-2 hover:bg-soil/10 rounded-full text-soil/70 hover:text-soil transition-colors"
                                            title="Edit Album Settings"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(album._id, album.name)}
                                            className="p-2 hover:bg-red-50 rounded-full text-red-400 hover:text-red-500 transition-colors"
                                            title="Delete Album"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-soil/60 text-sm line-clamp-2 mb-4 h-10">
                                    {album.description || "No description provided."}
                                </p>
                                <div className="flex justify-between items-center text-sm">
                                    <span className={`px-3 py-1 rounded-full ${album.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {album.isActive ? 'Active' : 'Hidden'}
                                    </span>
                                    <button
                                        onClick={() => router.push(`/admin/gallery/${album._id}`)}
                                        className="flex items-center gap-1 text-clay font-semibold hover:underline"
                                    >
                                        Manage Items <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 right-6 text-soil/50 hover:text-soil transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-2xl font-bold text-soil mb-6 font-serif">
                                {editingAlbum ? "Edit Album" : "Create New Album"}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-soil/70 mb-1">Album Name (Unique)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-soil/20 focus:outline-none focus:ring-2 focus:ring-clay/50 bg-white text-soil"
                                        placeholder="e.g., Summer Collection"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-soil/70 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-xl border border-soil/20 focus:outline-none focus:ring-2 focus:ring-clay/50 bg-white text-soil resize-none"
                                        placeholder="Brief description of the collection..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-soil/70 mb-1">Cover Image URL</label>
                                    <input
                                        type="url"
                                        value={formData.coverImage}
                                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-soil/20 focus:outline-none focus:ring-2 focus:ring-clay/50 bg-white text-soil"
                                        placeholder="https://cloudinary.com/..."
                                    />
                                    <p className="text-xs text-soil/40 mt-1">Paste a Cloudinary or direct image link</p>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-3 rounded-xl border border-soil/20 text-soil hover:bg-gray-50 transition-colors font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 rounded-xl bg-clay text-white hover:bg-clay/90 transition-all font-semibold shadow-lg"
                                    >
                                        {editingAlbum ? "Save Changes" : "Create Album"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
