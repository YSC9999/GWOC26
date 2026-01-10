"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, ZoomIn, X } from "lucide-react";
import Image from "next/image";

interface GalleryItem {
  _id: string;
  title: string;
  image: string;
  category: string;
  description: string;
}

const categories = [
  { id: "all", label: "All" },
  { id: "products", label: "Collections" },
  { id: "workshops", label: "Workshops" },
  { id: "studio", label: "Studio" },
  { id: "events", label: "Events" },
  { id: "process", label: "Process" },
];

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetchGallery();
  }, [selectedCategory]);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      
      const res = await fetch(`/api/gallery?${params}`);
      const data = await res.json();
      setItems(data.gallery || []);
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <span className="inline-block text-clay font-medium mb-4 tracking-wider uppercase">
          Visual Diary
        </span>
        <h1 className="text-5xl md:text-6xl font-bold text-soil mb-6 font-serif">
          Moments in Clay
        </h1>
        <p className="text-xl text-soil/70 max-w-2xl mx-auto">
          A glimpse into our world – from the potter's wheel to the kiln, 
          and the beautiful moments shared in our studio.
        </p>
      </motion.section>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap justify-center gap-3 mb-12"
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              selectedCategory === cat.id
                ? "bg-clay text-white shadow-lg shadow-clay/30"
                : "bg-white text-soil border-2 border-soil/20 hover:border-clay hover:text-clay"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-clay" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-soil/60">
          No images found in this category.
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 px-4 md:px-12">
          {items.map((item, idx) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              layoutId={item._id}
              className="break-inside-avoid relative group cursor-zoom-in"
              onClick={() => setSelectedImage(item)}
            >
              <div className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow bg-sand/30">
                {item.image.startsWith("/") ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-64 bg-sand flex items-center justify-center text-4xl">
                    📷
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <ZoomIn className="text-white w-8 h-8" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="font-bold text-soil">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-soil/60">{item.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          
          <motion.div
            layoutId={selectedImage._id}
            className="relative max-w-5xl w-full max-h-[90vh] rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedImage.image.startsWith("/") ? (
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-96 bg-white flex items-center justify-center text-6xl">
                📷
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
              <h3 className="text-2xl font-bold mb-2">{selectedImage.title}</h3>
              <p className="text-white/80">{selectedImage.description}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
