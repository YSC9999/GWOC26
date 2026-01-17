"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, X, ArrowLeft } from "lucide-react";

interface GalleryItem {
    _id: string;
    title: string;
    type: 'image' | 'video';
    image: string;
    videoUrl?: string;
    category: string;
    featured: boolean;
}

export default function ViewAllGalleryPage() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [images, setImages] = useState<GalleryItem[]>([]);
    const [videos, setVideos] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const res = await fetch("/api/gallery");
            const data = await res.json();
            if (data.gallery) {
                setItems(data.gallery);

                // Separate and Shuffle Images
                const imgs = data.gallery.filter((i: GalleryItem) => i.type === 'image' || !i.type);
                setImages(imgs.sort(() => Math.random() - 0.5));

                // Get Videos
                const vids = data.gallery.filter((i: GalleryItem) => i.type === 'video');
                setVideos(vids);
            }
        } catch (error) {
            console.error("Failed to fetch gallery:", error);
        } finally {
            setLoading(false);
        }
    };

    const scrollVideos = (direction: "left" | "right") => {
        if (sliderRef.current) {
            const scrollAmount = 400;
            sliderRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsPaused(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsPaused(false);
        }, 5000);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedItem) return;
        const isVideo = videos.some(v => v._id === selectedItem._id);
        const list = isVideo ? videos : images;
        const idx = list.findIndex(i => i._id === selectedItem._id);
        if (idx === -1) return;
        setSelectedItem(list[(idx + 1) % list.length]);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedItem) return;
        const isVideo = videos.some(v => v._id === selectedItem._id);
        const list = isVideo ? videos : images;
        const idx = list.findIndex(i => i._id === selectedItem._id);
        if (idx === -1) return;
        setSelectedItem(list[(idx - 1 + list.length) % list.length]);
    };

    return (
        <div className="min-h-screen bg-[#FDF8F3] pt-24 px-4 md:px-8 pb-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                    <div>
                        <Link
                            href="/gallery"
                            className="inline-flex items-center gap-2 text-soil/60 hover:text-soil transition-colors mb-4 group font-bold"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Gallery
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-bold text-soil font-serif">Full Collection</h1>
                        <p className="text-soil/70 mt-2 max-w-xl">
                            Immerse yourself in our complete archive of handcrafted works and studio stories.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clay"></div>
                    </div>
                ) : (
                    <div className="space-y-16">

                        {/* Videos Slider Section */}
                        {videos.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-6">
                                    <h2 className="text-2xl font-bold text-soil font-serif flex items-center gap-2">
                                        <Play size={24} className="fill-clay text-clay" />
                                        Featured Videos
                                    </h2>
                                    <div className="h-px bg-soil/10 flex-1"></div>
                                </div>

                                {/* Infinite Slider Implementation */}
                                <div className="relative group/slider">
                                    <button
                                        onClick={() => scrollVideos("left")}
                                        className="absolute left-4 z-20 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-soil p-3 rounded-full shadow-lg backdrop-blur-sm transition-all opacity-0 group-hover/slider:opacity-100 disabled:opacity-30 cursor-pointer"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={() => scrollVideos("right")}
                                        className="absolute right-4 z-20 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-soil p-3 rounded-full shadow-lg backdrop-blur-sm transition-all opacity-0 group-hover/slider:opacity-100 disabled:opacity-30 cursor-pointer"
                                    >
                                        <ChevronRight size={24} />
                                    </button>

                                    <div
                                        ref={sliderRef}
                                        className="relative w-full overflow-x-auto hide-scrollbar mask-gradient-x"
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <div
                                            className="flex gap-6 py-4 animate-scroll items-center w-max"
                                            style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                                        >
                                            {/* Original Set */}
                                            {videos.map((video) => (
                                                <VideoCard key={video._id} video={video} onClick={() => setSelectedItem(video)} />
                                            ))}
                                            {/* Duplicated Set for Loop */}
                                            {videos.map((video) => (
                                                <VideoCard key={`dup-${video._id}`} video={video} onClick={() => setSelectedItem(video)} />
                                            ))}
                                            {/* Triplicated Set for Safety */}
                                            {videos.map((video) => (
                                                <VideoCard key={`trip-${video._id}`} video={video} onClick={() => setSelectedItem(video)} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Images Grid */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <h2 className="text-2xl font-bold text-soil font-serif">Gallery Images</h2>
                                <div className="h-px bg-soil/10 flex-1"></div>
                            </div>

                            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                                {images.map((img, idx) => (
                                    <motion.div
                                        key={img._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx % 10 * 0.05 }}
                                        className="break-inside-avoid mb-4"
                                    >
                                        <div
                                            className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 bg-white"
                                            onClick={() => setSelectedItem(img)}
                                        >
                                            <img
                                                src={img.image}
                                                alt={img.title}
                                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                                <p className="text-white font-serif font-medium truncate w-full">{img.title}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                    </div>
                )}
            </div>

            {/* Media Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 pt-24 content-viewer-modal"
                        onClick={() => setSelectedItem(null)}
                    >
                        {/* Navigation Arrows */}
                        <button
                            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:scale-110 p-2 z-[110] transition-all cursor-pointer"
                            onClick={handlePrev}
                        >
                            <ChevronLeft size={48} />
                        </button>
                        <button
                            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:scale-110 p-2 z-[110] transition-all cursor-pointer"
                            onClick={handleNext}
                        >
                            <ChevronRight size={48} />
                        </button>

                        <motion.div
                            key={selectedItem._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button - Conditionally positioned */}
                            {!(selectedItem.type === 'video') && (
                                <button
                                    className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 z-[60] backdrop-blur-md transition-colors border border-white/20 cursor-pointer"
                                    onClick={() => setSelectedItem(null)}
                                >
                                    <X size={24} />
                                </button>
                            )}

                            {selectedItem.type === 'video' && (
                                <button
                                    className="absolute -top-12 -right-4 md:-right-12 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 z-[60] backdrop-blur-md transition-colors border border-white/20 cursor-pointer"
                                    onClick={() => setSelectedItem(null)}
                                >
                                    <X size={24} />
                                </button>
                            )}

                            {selectedItem.type === 'video' && selectedItem.videoUrl ? (
                                <div className="w-full max-h-[80%] aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                                    <iframe
                                        src={selectedItem.videoUrl}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : (
                                <div className="relative max-h-[85%] w-auto bg-white rounded-xl shadow-2xl p-2 overflow-hidden flex flex-col items-center justify-center">
                                    <img
                                        src={selectedItem.image}
                                        alt={selectedItem.title}
                                        className="max-h-[70vh] w-auto object-contain rounded-lg"
                                    />
                                    <div className="mt-4 text-center shrink-0">
                                        <h3 className="text-soil font-bold font-serif text-lg">{selectedItem.title}</h3>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
          .mask-gradient-x {
             mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          }
          @keyframes scroll {
             0% { transform: translateX(0); }
             100% { transform: translateX(calc(-50% - 12px)); } /* Adjust based on gap */
          }
          .animate-scroll {
             animation: scroll 40s linear infinite;
             width: max-content;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        </div>
    );
}

function VideoCard({ video, onClick }: { video: GalleryItem; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="relative flex-shrink-0 w-80 md:w-96 aspect-video rounded-xl overflow-hidden shadow-lg cursor-pointer group bg-black"
        >
            <img
                src={video.image}
                alt={video.title}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Play size={20} className="ml-1 text-clay fill-clay" />
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white text-sm font-bold truncate">{video.title}</h3>
            </div>
        </div>
    );
}
