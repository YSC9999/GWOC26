"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Plus, Trash2, Edit2, ChevronLeft, Save, Video, Image as ImageIcon, ExternalLink, Play } from "lucide-react";
import { useRouter } from "next/navigation";

interface GalleryItem {
    _id: string;
    title: string;
    type: 'image' | 'video';
    image: string;
    videoUrl?: string;
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
    // Unwrap params using React.use()
    const { id: albumId } = use(params);

    const router = useRouter();
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [album, setAlbum] = useState<Album | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

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

    const [hasOrderChanged, setHasOrderChanged] = useState(false);

    useEffect(() => {
        fetchData();
    }, [albumId]);

    const fetchData = async () => {
        try {
            // Fetch Album Info (from list or separate endpoint, here we just use what we assume exists or fetch all albums to filter)
            // Ideally we would have GET /api/albums/:id but we can simulate or fetch all.
            // actually, let's fetch gallery items and album name from gallery endpoint
            const res = await fetch(`/api/gallery?album=${albumId}`);
            const data = await res.json();

            if (data.gallery && data.gallery.length > 0) {
                setItems(data.gallery);
                // Assuming populated album is same for all, pick from first
                if (data.gallery[0].album) {
                    setAlbum(data.gallery[0].album);
                }
            } else {
                setItems([]);
            }

            // If album info missing (empty gallery), fetch album details separately
            // Using the albums list endpoint
            const albumsRes = await fetch(`/api/albums?admin=true`);
            const albumsData = await albumsRes.json();
            const currentAlbum = albumsData.albums.find((a: any) => a._id === albumId);
            if (currentAlbum) setAlbum(currentAlbum);

        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(item => {
        if (activeTab === 'video') return item.type === 'video';
        return item.type === 'image' || !item.type;
    });

    // Reorder Handler
    const handleReorder = (newOrder: GalleryItem[]) => {
        // We only reorder the visible items
        // We need to merge this back into the full list
        const otherItems = items.filter(item => {
            if (activeTab === 'video') return item.type !== 'video';
            return item.type === 'video'; // if tab is image, preserve videos
        });

        setItems([...otherItems, ...newOrder]);
        setHasOrderChanged(true);
    };

    const saveOrder = async () => {
        try {
            // Update order for all items based on index
            const updates = items.map((item, index) => ({
                _id: item._id,
                order: index
            }));

            // We need a Batch Update API or loop PUTs. Loop is easier for now.
            await Promise.all(updates.map(u =>
                fetch('/api/gallery', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(u)
                })
            ));

            setHasOrderChanged(false);
            alert("Order saved!");
        } catch (error) {
            console.error("Failed to save order", error);
        }
    };

    const calculateCounts = () => {
        const images = items.filter(i => i.type !== 'video').length;
        const videos = items.filter(i => i.type === 'video').length;
        return { images, videos };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                setShowModal(false);
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
                alert(err.error || "Operation failed");
            }
        } catch (error) {
            console.error("Failed to save item:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this item?")) return;
        try {
            await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
            fetchData();
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };

    const openCreate = () => {
        const { images, videos } = calculateCounts();
        if (activeTab === 'image' && images >= 20) {
            alert("Maximum 20 images allowed.");
            return;
        }
        if (activeTab === 'video' && videos >= 10) {
            alert("Maximum 10 videos allowed.");
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
        setShowModal(true);
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
        setShowModal(true);
    };

    return (
        <div className="min-h-screen p-6 md:p-10 font-sans max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin/gallery')}
                        className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-soil"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-soil font-serif">
                            {album?.name || "Loading..."}
                        </h1>
                        <p className="text-soil/60 text-sm">Manage album content</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    {hasOrderChanged && (
                        <button
                            onClick={saveOrder}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg transition-all animate-pulse"
                        >
                            <Save size={18} /> Save Order
                        </button>
                    )}
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-6 py-2 bg-clay text-white rounded-xl hover:bg-clay/90 shadow-lg transition-all"
                    >
                        <Plus size={18} /> Add {activeTab === 'image' ? 'Image' : 'Video'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-soil/10 mb-8">
                <button
                    onClick={() => setActiveTab('image')}
                    className={`pb-3 px-2 flex items-center gap-2 font-medium transition-colors relative ${activeTab === 'image' ? 'text-clay' : 'text-soil/50 hover:text-soil'
                        }`}
                >
                    <ImageIcon size={20} />
                    Images ({calculateCounts().images}/20)
                    {activeTab === 'image' && (
                        <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-clay" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('video')}
                    className={`pb-3 px-2 flex items-center gap-2 font-medium transition-colors relative ${activeTab === 'video' ? 'text-clay' : 'text-soil/50 hover:text-soil'
                        }`}
                >
                    <Video size={20} />
                    Videos ({calculateCounts().videos}/10)
                    {activeTab === 'video' && (
                        <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-clay" />
                    )}
                </button>
            </div>

            {/* Content List */}
            <Reorder.Group axis="y" values={filteredItems} onReorder={handleReorder} className="space-y-4">
                {filteredItems.map((item) => (
                    <Reorder.Item key={item._id} value={item}>
                        <div className="bg-white rounded-xl shadow-sm border border-soil/10 p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-move group">
                            <div className="w-8 flex flex-col gap-1 text-soil/20 group-hover:text-soil/40">
                                <div className="w-1 h-1 bg-current rounded-full mx-auto" />
                                <div className="w-1 h-1 bg-current rounded-full mx-auto" />
                                <div className="w-1 h-1 bg-current rounded-full mx-auto" />
                            </div>

                            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                {item.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <Play className="text-white fill-white" size={20} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-soil truncate">{item.title}</h3>
                                    {item.featured && (
                                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">Featured</span>
                                    )}
                                </div>
                                <p className="text-sm text-soil/60 truncate mb-1">{item.description || "No description"}</p>
                                <div className="flex gap-2 text-xs text-soil/40">
                                    <span className="capitalize">{item.category}</span>
                                    {item.type === 'video' && <span>• Video URL: {item.videoUrl}</span>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEdit(item)}
                                    className="p-2 hover:bg-soil/10 rounded-full text-soil/60 hover:text-soil"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item._id)}
                                    className="p-2 hover:bg-red-50 rounded-full text-red-300 hover:text-red-500"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

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
                            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-soil mb-6 font-serif">
                                {editingItem ? "Edit Item" : `Add New ${activeTab === 'image' ? 'Image' : 'Video'}`}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-soil/70 mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-soil/20 focus:outline-none focus:ring-2 focus:ring-clay/50 bg-white text-soil"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-soil/70 mb-1">
                                        {activeTab === 'video' ? 'Thumbnail Image URL' : 'Image URL'}
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            required
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-soil/20 focus:outline-none focus:ring-2 focus:ring-clay/50 bg-white text-soil"
                                        />
                                    </div>
                                </div>

                                {activeTab === 'video' && (
                                    <div>
                                        <label className="block text-sm font-medium text-soil/70 mb-1">Video URL (YouTube/Embed)</label>
                                        <input
                                            type="url"
                                            required
                                            value={formData.videoUrl}
                                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-soil/20 focus:outline-none focus:ring-2 focus:ring-clay/50 bg-white text-soil"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-soil/70 mb-1">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-soil/20 focus:outline-none focus:ring-2 focus:ring-clay/50 bg-white text-soil"
                                        >
                                            <option value="products">Products</option>
                                            <option value="studio">Studio</option>
                                            <option value="workshops">Workshops</option>
                                            <option value="process">Process</option>
                                            <option value="events">Events</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-soil/70 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-xl border border-soil/20 focus:outline-none focus:ring-2 focus:ring-clay/50 bg-white text-soil resize-none"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="featured"
                                        checked={formData.featured}
                                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                        className="w-5 h-5 rounded border-soil/20 text-clay focus:ring-clay"
                                    />
                                    <label htmlFor="featured" className="text-soil/90 font-medium select-none">Mark as Featured</label>
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
                                        {editingItem ? "Save Changes" : "Create Item"}
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
