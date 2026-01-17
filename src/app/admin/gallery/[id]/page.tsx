"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
    Plus,
    Trash2,
    Edit2,
    Save,
    Video,
    Image as ImageIcon,
    Play,
    GripVertical,
    X,
    Check
} from "lucide-react";
import AdminPageContainer from "@/components/admin/AdminPageContainer";
import MediaUpload from "@/components/MediaUpload";

interface GalleryItem {
    _id: string;
    title: string;
    type: 'image' | 'video';
    image: string;
    videoUrl?: string; // YouTube/Embed URL for video type
    category: string;
    description?: string;
    featured: boolean;
    order: number;
}

interface Album {
    _id: string;
    name: string;
}

export default function AlbumDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: albumId } = use(params);

    const [items, setItems] = useState<GalleryItem[]>([]);
    const [album, setAlbum] = useState<Album | null>(null);
    const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [hasOrderChanged, setHasOrderChanged] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        type: "image" as 'image' | 'video',
        image: "",
        videoUrl: "",
        category: "products",
        description: "",
        featured: false,
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchData();
    }, [albumId]);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/gallery?album=${albumId}`);
            const data = await res.json();
            if (data.gallery) {
                setItems(data.gallery);
                if (data.gallery.length > 0 && data.gallery[0].album) setAlbum(data.gallery[0].album);
            }
            // Fallback album fetch if empty
            if (!data.gallery?.length) {
                const aRes = await fetch(`/api/albums?admin=true`);
                const aData = await aRes.json();
                const current = aData.albums.find((a: any) => a._id === albumId);
                if (current) setAlbum(current);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredItems = items.filter(item => {
        if (activeTab === 'video') return item.type === 'video';
        return item.type === 'image' || !item.type;
    });

    const calculateCounts = () => {
        const images = items.filter(i => i.type !== 'video').length;
        const videos = items.filter(i => i.type === 'video').length;
        return { images, videos };
    };

    const handleReorder = (newOrder: GalleryItem[]) => {
        const otherItems = items.filter(item => {
            if (activeTab === 'video') return item.type !== 'video';
            return item.type === 'video';
        });
        setItems([...otherItems, ...newOrder]);
        setHasOrderChanged(true);
    };

    const saveOrder = async () => {
        try {
            const updates = items.map((item, index) => ({ _id: item._id, order: index }));
            await Promise.all(updates.map(u =>
                fetch('/api/gallery', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(u)
                })
            ));
            setHasOrderChanged(false);
            setSuccess("Order saved successfully");
            setTimeout(() => setSuccess(""), 3000);
        } catch (error) {
            console.error("Failed to save order", error);
            setError("Failed to save order");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const url = "/api/gallery";
            const method = editingItem ? "PUT" : "POST";
            const body = {
                ...formData,
                album: albumId,
                _id: editingItem?._id
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setSuccess(editingItem ? "Item updated" : "Item added");
                setShowForm(false);
                setEditingItem(null);
                setFormData({
                    title: "",
                    type: activeTab,
                    image: "",
                    videoUrl: "",
                    category: "products",
                    description: "",
                    featured: false,
                });
                fetchData();
            } else {
                const err = await res.json();
                setError(err.error || "Operation failed");
            }
        } catch (error) {
            console.error(error);
            setError("Network error");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
            fetchData();
            setSuccess("Item deleted");
        } catch (error) {
            setError("Delete failed");
        }
    };

    const openCreate = () => {
        const { images, videos } = calculateCounts();
        if (activeTab === 'image' && images >= 20) {
            alert("Maximum 20 images limit reached.");
            return;
        }
        if (activeTab === 'video' && videos >= 10) {
            alert("Maximum 10 videos limit reached.");
            return;
        }
        setEditingItem(null);
        setFormData({
            title: "",
            type: activeTab,
            image: "",
            videoUrl: "",
            category: "products",
            description: "",
            featured: false,
        });
        setShowForm(true);
    };

    const openEdit = (item: GalleryItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            type: item.type,
            image: item.image,
            videoUrl: item.videoUrl || "",
            category: item.category,
            description: item.description || "",
            featured: item.featured,
        });
        setShowForm(true);
    };

    return (
        <AdminPageContainer title={`${album?.name || "Album"} Content`}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
                {/* Notifications */}
                <AnimatePresence>
                    {(error || success) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`p-4 rounded-xl border ${error ? "bg-red-50 border-red-100 text-red-600" : "bg-green-50 border-green-100 text-green-600"}`}
                        >
                            {error || success}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-soil/10 pb-4">
                    <div className="flex gap-4 p-1 bg-soil/5 rounded-xl">
                        <button
                            onClick={() => { setActiveTab('image'); setShowForm(false); }}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'image' ? 'bg-white shadow-sm text-clay' : 'text-soil/60 hover:text-soil'}`}
                        >
                            <ImageIcon size={18} /> Images ({calculateCounts().images}/20)
                        </button>
                        <button
                            onClick={() => { setActiveTab('video'); setShowForm(false); }}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'video' ? 'bg-white shadow-sm text-clay' : 'text-soil/60 hover:text-soil'}`}
                        >
                            <Video size={18} /> Videos ({calculateCounts().videos}/10)
                        </button>
                    </div>

                    <div className="flex gap-3">
                        {hasOrderChanged && (
                            <button
                                onClick={saveOrder}
                                className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-md transition-all flex items-center gap-2 animate-pulse"
                            >
                                <Save size={18} /> Save Order
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setShowForm(!showForm);
                                if (!showForm) openCreate();
                            }}
                            className={`px-6 py-2 rounded-xl font-semibold shadow-md transition-all flex items-center gap-2 ${showForm ? "bg-gray-100 text-soil" : "bg-clay text-white"}`}
                        >
                            {showForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Add {activeTab === 'image' ? 'Image' : 'Video'}</>}
                        </button>
                    </div>
                </div>

                {/* Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white/40 backdrop-blur-md rounded-2xl border border-soil/10 p-6 md:p-8 overflow-hidden"
                        >
                            <h2 className="text-xl font-bold text-soil mb-6 font-serif flex items-center gap-2">
                                {editingItem ? <Edit2 size={20} /> : <Plus size={20} />}
                                {editingItem ? "Edit Item" : `Add ${activeTab === 'image' ? 'Image' : 'Video'}`}
                            </h2>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Title"
                                        className="w-full p-3 bg-white/60 border border-soil/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/20"
                                        required
                                    />
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Description (Optional)"
                                        className="w-full p-3 bg-white/60 border border-soil/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/20 resize-none h-24"
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full p-3 bg-white/60 border border-soil/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-clay/20"
                                        >
                                            <option value="products">Products</option>
                                            <option value="studio">Studio</option>
                                            <option value="workshops">Workshops</option>
                                            <option value="process">Process</option>
                                            <option value="events">Events</option>
                                        </select>
                                        <div></div>
                                    </div>

                                    {activeTab === 'video' && (
                                        <MediaUpload
                                            resourceType="video"
                                            onUploaded={(url) => setFormData(prev => ({ ...prev, videoUrl: url }))}
                                            currentUrl={formData.videoUrl}
                                            onClear={() => setFormData(prev => ({ ...prev, videoUrl: "" }))}
                                            folder="gallery/videos"
                                            label="Upload Video File"
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-soil/70 mb-2">
                                        {activeTab === 'video' ? "Video Thumbnail" : "Upload Image"}
                                    </label>
                                    <MediaUpload
                                        onUploaded={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                        currentUrl={formData.image}
                                        onClear={() => setFormData(prev => ({ ...prev, image: "" }))}
                                        folder="gallery/items"
                                        label={activeTab === 'video' ? "Upload Thumbnail" : "Upload Image"}
                                    />

                                    <div className="flex justify-end mt-4 pt-4">
                                        <button type="submit" className="px-8 py-3 bg-soil text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-soil/90 transition-all">
                                            {editingItem ? "Update" : "Create"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Table-like Reorder List */}
                <div className="bg-white/30 backdrop-blur-sm border border-soil/10 rounded-3xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-sand/20 text-soil/60 text-xs uppercase tracking-wider font-bold border-b border-soil/10 flex p-4">
                        <div className="w-12 text-center">#</div>
                        <div className="w-24">Media</div>
                        <div className="flex-1 px-4">Details</div>
                        <div className="w-24">Type</div>
                        <div className="w-24 text-right">Actions</div>
                    </div>

                    <Reorder.Group axis="y" values={filteredItems} onReorder={handleReorder} className="divide-y divide-soil/5 min-h-[100px]">
                        {filteredItems.length === 0 ? (
                            <div className="p-8 text-center text-soil/50">No items found.</div>
                        ) : (
                            filteredItems.map((item) => (
                                <Reorder.Item
                                    key={item._id}
                                    value={item}
                                    className="flex items-center p-4 hover:bg-white/40 transition-colors group cursor-move bg-transparent"
                                >
                                    <div className="w-12 text-center text-soil/30">
                                        <GripVertical size={20} className="mx-auto" />
                                    </div>
                                    <div className="w-24">
                                        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden relative border border-soil/10">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            {item.type === 'video' && (
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                    <Play size={20} className="text-white fill-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 px-4 min-w-0">
                                        <div className="font-bold text-soil truncate flex items-center gap-2">
                                            {item.title}
                                        </div>
                                        <div className="text-sm text-soil/60 truncate">{item.description || "No description"}</div>
                                        <div className="text-xs text-soil/40 mt-1 capitalize">{item.category}</div>
                                    </div>
                                    <div className="w-24 text-sm capitalize text-soil/70 bg-white/50 px-2 py-1 rounded w-fit h-fit">
                                        {item.type}
                                    </div>
                                    <div className="w-24 text-right flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => openEdit(item)}
                                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </Reorder.Item>
                            ))
                        )}
                    </Reorder.Group>
                </div>
            </motion.div>
        </AdminPageContainer>
    );
}

