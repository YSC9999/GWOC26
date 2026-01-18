"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Play, X, ChevronLeft, ChevronRight, Grid } from "lucide-react";

interface Album {
  _id: string;
  name: string;
  slug: string;
  coverImage?: string;
  description?: string;
  order: number;
}

interface GalleryItem {
  _id: string;
  title: string;
  type: 'image' | 'video';
  image: string; // Thumbnail for video
  videoUrl?: string;
  album: {
    _id: string;
    name: string;
    slug: string;
  };
  category: string;
  description?: string;
  featured: boolean;
}

export default function GalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<GalleryItem[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]); // Full list for navigation
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [isPaused, setIsPaused] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const videoSliderRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    if (selectedAlbum) {
      fetchGalleryByAlbum(selectedAlbum._id);
    }
  }, [selectedAlbum]);

  const fetchAlbums = async () => {
    try {
      const res = await fetch("/api/albums");
      const data = await res.json();
      if (data.albums && data.albums.length > 0) {
        setAlbums(data.albums);
        setSelectedAlbum(data.albums[0]);
      }
    } catch (error) {
      console.error("Failed to fetch albums:", error);
    }
  };

  // function fetchAllVideos removed as videos are now filtered by album

  const fetchGalleryByAlbum = async (albumId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/gallery?album=${albumId}`);
      const data = await res.json();
      const allItems: GalleryItem[] = data.gallery || [];
      setGalleryItems(allItems);
      setImages(allItems.filter(item => item.type === 'image' || !item.type));
      setVideos(allItems.filter(item => item.type === 'video'));
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollAlbums = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = 300;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollVideos = (direction: "left" | "right") => {
    if (videoSliderRef.current) {
      const scrollAmount = 400;
      videoSliderRef.current.scrollBy({
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
    }, 1500);
  };

  const handleVideoMouseEnter = () => {
    if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current);
    setIsVideoPaused(true);
  };

  const handleVideoMouseLeave = () => {
    videoTimeoutRef.current = setTimeout(() => {
      setIsVideoPaused(false);
    }, 1500);
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
    <div className="min-h-screen">
      <div
        className="bg-[#FDF8F3] relative overflow-hidden m-2 mt-24 border-8 border-[#652810] p-6 md:p-10 min-h-[90vh]"
        style={{ borderRadius: "30px 28px 32px 29px / 28px 32px 29px 30px" }}
      >
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto text-center mb-12 relative"
        >
          <Link
            href="/gallery/view-all"
            className="absolute right-0 top-0 hidden md:flex items-center gap-2 px-6 py-2 bg-soil/10 hover:bg-soil/20 text-soil rounded-full transition-all text-sm font-bold border border-soil/10 shadow-sm"
          >
            <Grid size={16} /> View All
          </Link>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-soil mb-4 font-serif">
            Gallery
          </h1>
          <p className="text-lg md:text-xl text-soil/70 max-w-2xl mx-auto">
            Explore our curated collections of handcrafted pottery and studio moments
          </p>

          <Link
            href="/gallery/view-all"
            className="md:hidden mt-6 inline-flex items-center gap-2 px-6 py-2 bg-soil/10 hover:bg-soil/20 text-soil rounded-full transition-all text-sm font-bold border border-soil/10"
          >
            <Grid size={16} /> View All Collection
          </Link>
        </motion.div>

        {/* Album Slider - Infinite Loop */}
        <div className="max-w-[100vw] mx-auto mb-16 relative group/slider">

          {/* Navigation Buttons */}
          <button
            onClick={() => scrollAlbums("left")}
            className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-soil p-3 rounded-full shadow-lg backdrop-blur-sm transition-all opacity-0 group-hover/slider:opacity-100 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => scrollAlbums("right")}
            className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-soil p-3 rounded-full shadow-lg backdrop-blur-sm transition-all opacity-0 group-hover/slider:opacity-100 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight size={24} />
          </button>

          <div
            ref={sliderRef}
            className="relative w-full overflow-x-auto hide-scrollbar mask-gradient-x -mx-6 md:-mx-10 px-6 md:px-10"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              id="album-slider-inner"
              className="flex gap-8 py-16 animate-scroll-albums items-center w-max"
              style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
            >
              {/* Triple items for seamless loop */}
              {[...albums, ...albums, ...albums].map((album, idx) => (
                <motion.div
                  key={`${album._id}-${idx}`}
                  onClick={() => setSelectedAlbum(album)}
                  layout
                  animate={{
                    scale: selectedAlbum?._id === album._id ? 1.05 : 0.95,
                    rotate: idx % 2 === 0 ? -3 : 3, // Increased rotation for slanted look
                  }}
                  whileHover={{ scale: 1.05, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`flex-shrink-0 w-64 md:w-72 cursor-pointer relative bg-white p-4 pb-16 transition-all duration-300 ${selectedAlbum?._id === album._id
                    ? "ring-4 ring-soil shadow-[0_20px_50px_rgba(101,40,16,0.3)] z-10 scale-105"
                    : "hover:shadow-2xl hover:z-10 shadow-xl"
                    }`}
                  style={{ transformOrigin: "center" }}
                >
                  {/* Tape Effect */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-[#EFE5D8]/90 backdrop-blur-sm shadow-sm rotate-[-2deg] z-20 opacity-80" style={{ clipPath: "polygon(0% 0%, 100% 0%, 98% 100%, 2% 100%)" }}></div>

                  <div className="relative w-full aspect-square bg-gray-100 overflow-hidden mb-4 border border-gray-100">
                    {album.coverImage ? (
                  <img src={album.coverImage} alt={album.name} loading="lazy" decoding="async" className="w-full h-full object-cover" style={{ contentVisibility: "auto" }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-4xl text-soil/20 font-serif">🎨</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-center text-center px-2">
                    <h3 className={`text-soil font-bold text-xl font-serif leading-none ${selectedAlbum?._id === album._id ? 'text-2xl' : ''}`} style={{ fontFamily: "var(--font-edu-nsw-act)" }}>
                      {album.name}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Video Slider */}
        {!loading && videos.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto mb-16">
            <div className="flex items-center gap-3 mb-8 px-4">
              <div className="h-px bg-soil/10 flex-1"></div>
              <h2 className="text-2xl font-bold text-soil font-serif flex items-center gap-2">
                <Play size={20} className="fill-clay text-clay" />
                Featured Videos
              </h2>
              <div className="h-px bg-soil/10 flex-1"></div>
            </div>

            <div className="relative group/video-slider">
              {/* Navigation Buttons for Videos */}
              <button
                onClick={() => scrollVideos("left")}
                className="absolute left-4 z-20 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-soil p-3 rounded-full shadow-lg backdrop-blur-sm transition-all opacity-0 group-hover/video-slider:opacity-100 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => scrollVideos("right")}
                className="absolute right-4 z-20 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-soil p-3 rounded-full shadow-lg backdrop-blur-sm transition-all opacity-0 group-hover/video-slider:opacity-100 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight size={24} />
              </button>

              <div
                ref={videoSliderRef}
                className="relative w-full overflow-x-auto hide-scrollbar mask-gradient-x"
                onMouseEnter={handleVideoMouseEnter}
                onMouseLeave={handleVideoMouseLeave}
              >
                <div
                  className="flex gap-6 py-4 animate-scroll-videos items-center w-max"
                  style={{ animationPlayState: isVideoPaused ? 'paused' : 'running' }}
                >
                  {[...videos, ...videos].map((video, idx) => (
                    <motion.div
                      key={`${video._id}-${idx}`}
                      whileHover={{ y: -5 }}
                      className="flex-shrink-0 w-80 md:w-96 aspect-video relative rounded-2xl overflow-hidden shadow-xl cursor-pointer group bg-black"
                      onClick={() => setSelectedItem(video)}
                    >
                      <img src={video.image} alt={video.title} loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" style={{ contentVisibility: "auto" }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <Play size={24} className="ml-1 text-clay fill-clay" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-white font-bold truncate">{video.title}</h3>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Gallery Grid */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-clay border-t-transparent"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-soil/10 rounded-3xl">
              <p className="text-soil/40 text-xl font-serif italic">No images in this album yet</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4" style={{ contain: "layout" }}>
              {images.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index < 8 ? index * 0.03 : 0, duration: 0.3 }}
                  className="break-inside-avoid mb-4"
                  style={{ contain: "layout paint" }}
                >
                  <div
                    className="relative group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <img src={item.image} alt={item.title} loading="lazy" decoding="async" className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" style={{ contentVisibility: "auto" }} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <h3 className="text-white font-bold text-lg font-serif truncate">{item.title}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Improved Lightbox */}
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
            mask-image: linear-gradient(to right, transparent, black 10%, black 95%, transparent);
          }
          @keyframes scroll-albums {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-33.33% - 10.66px)); }
          }
          @keyframes scroll-videos {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-50% - 12px)); }
          }
          .animate-scroll-albums {
            animation: scroll-albums 60s linear infinite;
            width: max-content;
            will-change: transform;
          }
          .animate-scroll-videos {
            animation: scroll-videos 40s linear infinite;
            width: max-content;
            will-change: transform;
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
    </div>
  );
}
