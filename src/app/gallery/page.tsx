"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";

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

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    if (selectedAlbum) {
      fetchGalleryByAlbum(selectedAlbum._id);
    }
  }, [selectedAlbum]);

  // Keyboard Navigation
  const handleNext = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    if (!selectedItem || galleryItems.length === 0) return;
    const currentIndex = galleryItems.findIndex(item => item._id === selectedItem._id);
    const nextIndex = (currentIndex + 1) % galleryItems.length;
    setSelectedItem(galleryItems[nextIndex]);
  }, [selectedItem, galleryItems]);

  const handlePrev = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    if (!selectedItem || galleryItems.length === 0) return;
    const currentIndex = galleryItems.findIndex(item => item._id === selectedItem._id);
    const prevIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    setSelectedItem(galleryItems[prevIndex]);
  }, [selectedItem, galleryItems]);

  useEffect(() => {
    if (!selectedItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext(e);
      if (e.key === "ArrowLeft") handlePrev(e);
      if (e.key === "Escape") setSelectedItem(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem, handleNext, handlePrev]);

  const fetchAlbums = async () => {
    try {
      const res = await fetch("/api/albums");
      const data = await res.json();
      if (data.albums && data.albums.length > 0) {
        setAlbums(data.albums);
        setSelectedAlbum(data.albums[0]); // Select first album by default
      }
    } catch (error) {
      console.error("Failed to fetch albums:", error);
    } finally {
      setLoading(false);
    }
  };

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

  // Scroll album slider
  const scrollAlbums = (direction: "left" | "right") => {
    const container = document.getElementById("album-slider");
    if (container) {
      const scrollAmount = 320;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <div
        className="bg-white relative overflow-hidden m-4 md:m-8 border-8 border-[#652810] p-6 md:p-10 min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)]"
        style={{ borderRadius: "50px 48px 52px 49px / 48px 52px 49px 50px" }}
      >
        <div className="absolute top-10 left-12 w-16 h-16 border-2 border-gray-300/30 rounded-full opacity-40 pointer-events-none" />
        <div className="absolute top-1/4 right-20 w-24 h-1 bg-gray-400/20 rotate-45 pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 w-20 h-20 border border-gray-300/20 rounded opacity-35 pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 w-12 h-12 border-2 border-gray-300/25 rounded-lg opacity-30 pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-32 h-2 bg-gray-400/15 rounded-full pointer-events-none" />
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-soil mb-4 font-serif">
            Gallery
          </h1>
          <p className="text-lg md:text-xl text-soil/70 max-w-2xl mx-auto">
            Explore our curated collections of handcrafted pottery and studio moments
          </p>
        </motion.div>

        {/* Album Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-7xl mx-auto mb-16"
        >
          <div className="relative">
            {/* Scroll Buttons */}
            <button
              onClick={() => scrollAlbums("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} className="text-soil" />
            </button>
            <button
              onClick={() => scrollAlbums("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRight size={24} className="text-soil" />
            </button>

            {/* Album Cards Slider */}
            <div
              id="album-slider"
              className="flex gap-8 overflow-x-auto scrollbar-hide px-0 py-12 snap-x snap-mandatory items-center"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {albums.map((album) => (
                <motion.div
                  key={album._id}
                  onClick={() => setSelectedAlbum(album)}
                  layout
                  animate={{
                    scale: selectedAlbum?._id === album._id ? 1.15 : 0.95,
                    opacity: 1,
                    zIndex: selectedAlbum?._id === album._id ? 10 : 1
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`flex-shrink-0 w-72 h-72 rounded-2xl cursor-pointer snap-center relative ${selectedAlbum?._id === album._id
                    ? "shadow-2xl ring-4 ring-clay"
                    : "shadow-lg hover:opacity-90"
                    }`}
                >
                  <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-sand/40 to-clay/10">
                    {album.coverImage ? (
                      <img
                        src={album.coverImage}
                        alt={album.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-clay/20 to-sand/40">
                        <span className="text-6xl">🎨</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                      <div>
                        <h3 className="text-white font-bold text-xl font-serif mb-1 drop-shadow-md">
                          {album.name}
                        </h3>
                        {album.description && (
                          <p className="text-white/90 text-sm line-clamp-2 drop-shadow-sm">
                            {album.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div >

        {/* Video Slider */}
        {
          !loading && videos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-7xl mx-auto mb-16"
            >
              <div className="flex items-center gap-3 mb-6 px-4">
                <div className="h-px bg-soil/20 flex-1"></div>
                <h2 className="text-2xl font-bold text-soil font-serif flex items-center gap-2">
                  <Play size={20} className="fill-clay text-clay" />
                  Featured Videos
                </h2>
                <div className="h-px bg-soil/20 flex-1"></div>
              </div>

              <div className="relative group/slider">
                {videos.length > 2 && (
                  <>
                    <button
                      onClick={() => {
                        const container = document.getElementById("video-slider");
                        container?.scrollBy({ left: -400, behavior: "smooth" });
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all hover:scale-110 opacity-0 group-hover/slider:opacity-100"
                      aria-label="Scroll videos left"
                    >
                      <ChevronLeft size={24} className="text-soil" />
                    </button>
                    <button
                      onClick={() => {
                        const container = document.getElementById("video-slider");
                        container?.scrollBy({ left: 400, behavior: "smooth" });
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all hover:scale-110 opacity-0 group-hover/slider:opacity-100"
                      aria-label="Scroll videos right"
                    >
                      <ChevronRight size={24} className="text-soil" />
                    </button>
                  </>
                )}

                <div
                  id="video-slider"
                  className="flex gap-6 overflow-x-auto scrollbar-hide px-4 md:px-12 py-4 snap-x snap-mandatory"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {videos.map((video) => (
                    <motion.div
                      key={video._id}
                      whileHover={{ y: -5 }}
                      className="flex-shrink-0 w-full md:w-[calc(50%-12px)] snap-center relative aspect-video rounded-2xl overflow-hidden shadow-xl cursor-pointer group bg-black"
                      onClick={() => setSelectedItem(video)}
                    >
                      <img
                        src={video.image}
                        alt={video.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                      />
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
            </motion.div>
          )
        }

        {/* Gallery Grid */}
        {
          loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-clay border-t-transparent"></div>
            </div>
          ) : images.length === 0 && videos.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🖼️</div>
              <p className="text-soil/50 text-xl">
                No items in this album yet. Check back soon!
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              {/* Masonry Grid */}
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {images.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="break-inside-avoid mb-4"
                  >
                    <div className="relative group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white">
                      <div
                        className="relative cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <h3 className="text-white font-bold text-lg font-serif truncate">{item.title}</h3>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
        }

        {/* Media Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white/98 z-[30] flex items-center justify-center p-4 pt-28"
              onClick={() => setSelectedItem(null)}
            >
              {/* Close Button */}
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-28 right-6 bg-soil/10 hover:bg-soil/20 text-soil rounded-full p-2 z-[60] backdrop-blur-md transition-colors border border-soil/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItem(null);
                }}
              >
                <X size={24} />
              </motion.button>

              {/* Navigation Buttons */}
              {galleryItems.length > 1 && (
                <>
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-soil/10 text-soil backdrop-blur-md border border-soil/10 z-[60]"
                    onClick={handlePrev}
                  >
                    <ChevronLeft size={32} />
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-soil/10 text-soil backdrop-blur-md border border-soil/10 z-[60]"
                    onClick={handleNext}
                  >
                    <ChevronRight size={32} />
                  </motion.button>
                </>
              )}

              <motion.div
                key={selectedItem._id}
                initial={{ opacity: 0.5, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", damping: 25 }}
                className="relative max-w-7xl w-full h-auto flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedItem.type === 'video' && selectedItem.videoUrl ? (
                  // Video Player
                  <div className="w-full max-w-3xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                    <iframe
                      src={selectedItem.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  // Image View
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    className="max-h-[80vh] max-w-[85vw] object-contain rounded-xl shadow-2xl"
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      </div>
    </div>
  );
}
