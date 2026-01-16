"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

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
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

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
      setImages(allItems.filter(item => item.type === 'image' || !item.type));
      setVideos(allItems.filter(item => item.type === 'video'));

    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = (itemId: string) => {
    setLikedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Scroll album slider
  const scrollAlbums = (direction: "left" | "right") => {
    const container = document.getElementById("album-slider");
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sand/20 to-white py-12 px-4 md:px-8">
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
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all hover:scale-110"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} className="text-soil" />
          </button>
          <button
            onClick={() => scrollAlbums("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all hover:scale-110"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} className="text-soil" />
          </button>

          {/* Album Cards Slider */}
          <div
            id="album-slider"
            className="flex gap-6 overflow-x-auto scrollbar-hide px-12 py-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {albums.map((album) => (
              <motion.div
                key={album._id}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedAlbum(album)}
                className={`flex-shrink-0 w-64 h-64 rounded-2xl cursor-pointer transition-all snap-center ${selectedAlbum?._id === album._id
                  ? "ring-4 ring-clay shadow-2xl scale-105"
                  : "ring-2 ring-soil/10 hover:ring-clay/50 shadow-lg"
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
                      <h3 className="text-white font-bold text-xl font-serif mb-1">
                        {album.name}
                      </h3>
                      {album.description && (
                        <p className="text-white/80 text-sm line-clamp-2">
                          {album.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {selectedAlbum?._id === album._id && (
                    <div className="absolute top-4 right-4 bg-clay text-white px-3 py-1 rounded-full text-xs font-bold">
                      Selected
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Video Slider (if specific videos exist for this album) */}
      {!loading && videos.length > 0 && (
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
            {/* Video Scroll Buttons */}
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

            {/* Video Cards Slider */}
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
      )}

      {/* Gallery Grid - Masonry Layout */}
      {loading ? (
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
          {/* Masonry Grid using CSS columns */}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-white/90 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(item._id);
                    }}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110 z-10"
                  >
                    <Heart
                      size={20}
                      className={`transition-colors ${likedItems.has(item._id)
                          ? "fill-red-500 text-red-500"
                          : "text-soil"
                        }`}
                    />
                  </button>

                  {/* Category Badge */}
                  <div className="absolute bottom-3 left-3 bg-clay/90 text-white px-3 py-1 rounded-full text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.category}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Media Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-3 z-10 shadow-xl"
              onClick={() => setSelectedItem(null)}
            >
              <X size={24} className="text-soil" />
            </motion.button>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="max-w-6xl max-h-[90vh] w-full relative flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.type === 'video' && selectedItem.videoUrl ? (
                // Video Player
                <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl mb-4">
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
                  className="max-h-[70vh] w-auto object-contain rounded-2xl mb-4"
                />
              )}

              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl w-full max-w-2xl text-center border border-white/20">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 font-serif">
                  {selectedItem.title}
                </h3>
                {selectedItem.description && (
                  <p className="text-white/90 mb-4">{selectedItem.description}</p>
                )}
                <div className="flex gap-2 justify-center">
                  <span className="inline-block px-4 py-2 bg-clay text-white rounded-full text-sm font-semibold">
                    {selectedItem.category}
                  </span>
                  <span className="inline-block px-4 py-2 bg-white/20 text-white rounded-full text-sm font-semibold">
                    {selectedItem.album.name}
                  </span>
                </div>
              </div>
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
  );
}
