"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Edit,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
    Search
} from "lucide-react";
import AdminPageContainer from "@/components/admin/AdminPageContainer";
import MediaUpload from "@/components/MediaUpload";

interface Album {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    coverImage?: string;
    isActive: boolean;
    order: number;
}

export default function AdminGalleryPage() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [filteredAlbums, setFilteredAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        coverImage: "",
        isActive: true
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchAlbums();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredAlbums(albums);
        } else {
            const term = searchTerm.toLowerCase();
            setFilteredAlbums(albums.filter(a =>
                a.name.toLowerCase().includes(term) ||
                (a.description && a.description.toLowerCase().includes(term))
            ));
        }
    }, [searchTerm, albums]);

    const fetchAlbums = async () => {
        try {
            const res = await fetch("/api/albums?admin=true");
            const data = await res.json();
            if (data.albums) {
                setAlbums(data.albums);
                setFilteredAlbums(data.albums);
            }
        } catch (error) {
            console.error("Failed to fetch albums", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const url = "/api/albums";
            const method = editingId ? "PUT" : "POST";
            const body = {
                ...formData,
                _id: editingId
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setSuccess(editingId ? "Album updated successfully" : "Album created successfully");
                setShowAddForm(false);
                setEditingId(null);
                setFormData({
                    name: "",
                    description: "",
                    coverImage: "",
                    isActive: true
                });
                fetchAlbums();
            } else {
                const err = await res.json();
                setError(err.error || "Operation failed");
            }
        } catch (error) {
            console.error("Failed to save album:", error);
            setError("Network error occurred");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete all images/videos inside this album.")) return;
        try {
            const res = await fetch(`/api/albums?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchAlbums();
                setSuccess("Album deleted");
            } else {
                setError("Failed to delete album");
            }
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };

    const startEdit = (album: Album) => {
        setEditingId(album._id);
        setFormData({
            name: album.name,
            description: album.description || "",
            coverImage: album.coverImage || "",
            isActive: album.isActive
        });
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AdminPageContainer title="Gallery Albums">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
                {/* Notifications */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100"
                        >
                            {error}
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-green-50 text-green-600 p-4 rounded-xl border border-green-100"
                        >
                            {success}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-soil/40" size={18} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search albums..."
                            className="w-full pl-10 pr-4 py-2 bg-white/50 border border-soil/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/20 transition-all placeholder:text-soil/40 text-soil"
                        />
                    </div>

                    <button
                        onClick={() => {
                            setShowAddForm(!showAddForm);
                            if (!showAddForm) {
                                setEditingId(null);
                                setFormData({ name: "", description: "", coverImage: "", isActive: true });
                            }
                        }}
                        className={`px-6 py-2 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 ${showAddForm
                                ? "bg-gray-100 text-soil hover:bg-gray-200"
                                : "bg-clay text-white hover:bg-clay/90"
                            }`}
                    >
                        {showAddForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Add Album</>}
                    </button>
                </div>

                {/* Form */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white/40 backdrop-blur-md rounded-2xl border border-soil/10 p-6 md:p-8"
                        >
                            <h2 className="text-xl font-bold text-soil mb-6 font-serif">
                                {editingId ? "Edit Album" : "Create New Album"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-soil/70 mb-1">Album Name</label>
                                            <input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full p-3 bg-white/60 border border-soil/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/20"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-soil/70 mb-1">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full p-3 bg-white/60 border border-soil/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/20 resize-none h-32"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="active"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="w-5 h-5 rounded border-soil/20 text-clay focus:ring-clay"
                                            />
                                            <label htmlFor="active" className="text-soil font-medium cursor-pointer">Active (Visible)</label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-soil/70 mb-1">Cover Image</label>
                                        <MediaUpload
                                            onUploaded={(url) => setFormData(prev => ({ ...prev, coverImage: url }))}
                                            currentUrl={formData.coverImage}
                                            onClear={() => setFormData(prev => ({ ...prev, coverImage: "" }))}
                                            folder="gallery/covers"
                                            label="Upload Cover Image"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        className="px-8 py-3 bg-soil text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-soil/90 transition-all"
                                    >
                                        {editingId ? "Save Changes" : "Create Album"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Table */}
                <div className="bg-white/30 backdrop-blur-sm border border-soil/10 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-sand/20 text-soil/60 text-xs uppercase tracking-wider font-bold border-b border-soil/10">
                                <tr>
                                    <th className="p-4">Cover</th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-soil/5">
                                {filteredAlbums.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-soil/50">
                                            No albums found. Create one to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAlbums.map((album) => (
                                        <tr
                                            key={album._id}
                                            className="hover:bg-white/40 transition-colors group"
                                        >
                                            <td className="p-4 w-24">
                                                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden border border-soil/10">
                                                    {album.coverImage && (
                                                        <img src={album.coverImage} alt={album.name} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-soil text-lg">{album.name}</div>
                                                <div className="text-sm text-soil/60 line-clamp-1 max-w-md">{album.description}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${album.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                                    }`}>
                                                    {album.isActive ? "Visible" : "Hidden"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/gallery/${album._id}`}
                                                        className="p-2 hover:bg-soil/10 rounded-lg text-soil/70 hover:text-soil transition-colors"
                                                        title="Manage Items"
                                                    >
                                                        <ChevronRight size={20} />
                                                    </Link>
                                                    <button
                                                        onClick={() => startEdit(album)}
                                                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(album._id)}
                                                        className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        </AdminPageContainer>
    );
}
