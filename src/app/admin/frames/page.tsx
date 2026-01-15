"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  X,
  Image as ImageIcon,
  Save,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import AdminPageContainer from "@/components/admin/AdminPageContainer";

interface Product {
  _id: string;
  name: string;
  images: string[];
  category: string;
}

interface Frame {
  frameId: number;
  product?: Product | null;
}

export default function AdminFramesPage() {
  const [frames, setFrames] = useState<Frame[]>(
    Array.from({ length: 9 }, (_, i) => ({ frameId: i, product: null }))
  );
  const [loading, setLoading] = useState(true);

  // Search state
  const [activeFrameId, setActiveFrameId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchFrames();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const delayDebounceFn = setTimeout(() => {
        handleSearch(searchQuery);
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchFrames = async () => {
    try {
      const res = await fetch("/api/admin/frames");
      const data = await res.json();
      if (data.frames) {
        const newFrames = [...frames];
        data.frames.forEach((f: any) => {
          if (f.frameId >= 0 && f.frameId < 9) {
            newFrames[f.frameId] = { frameId: f.frameId, product: f.product };
          }
        });
        setFrames(newFrames);
      }
    } catch (error) {
      console.error("Failed to fetch frames", error);
      // alert("Failed to load frames");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearching(true);
    try {
      const res = await fetch(
        `/api/products/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setSearchResults(data.products || []);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setSearching(false);
    }
  };

  const handleAssignProduct = async (frameId: number, product: Product) => {
    // Optimistic update
    const updatedFrames = [...frames];
    updatedFrames[frameId] = { ...updatedFrames[frameId], product };
    setFrames(updatedFrames);
    setActiveFrameId(null);
    setSearchQuery("");

    try {
      const res = await fetch("/api/admin/frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frameId, productId: product._id }),
      });

      if (!res.ok) throw new Error("Failed to save");
      alert("Frame updated!");
    } catch (error) {
      console.error("Failed to update frame", error);
      alert("Failed to save frame");
      fetchFrames(); // Revert on error
    }
  };

  const handleClearFrame = async (frameId: number) => {
    if (!confirm("Are you sure you want to clear this frame?")) return;

    const updatedFrames = [...frames];
    updatedFrames[frameId] = { ...updatedFrames[frameId], product: null };
    setFrames(updatedFrames);

    try {
      await fetch("/api/admin/frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frameId, productId: null }),
      });
      alert("Frame cleared!");
    } catch (error) {
      fetchFrames();
    }
  };

  // Original Frame Layout Coords (Approximate relative positioning for visual reference)
  // This helps admin visualize which box is which
  const frameLayouts = [
    { label: "1 (Top Left)", color: "bg-[#442D1C]" },
    { label: "2 (Top Center)", color: "bg-[#652810]" },
    { label: "3 (Top Right)", color: "bg-[#8E5022]" },
    { label: "4 (Mid Left)", color: "bg-[#C85428]" },
    { label: "5 (Center)", color: "bg-[#EDD8B4]" },
    { label: "6 (Mid Right)", color: "bg-[#442D1C]" },
    { label: "7 (Bot Left)", color: "bg-[#652810]" },
    { label: "8 (Bot Center)", color: "bg-[#8E5022]" },
    { label: "9 (Bot Right)", color: "bg-[#C85428]" },
  ];

  return (
    <AdminPageContainer title="Manage Homepage Frames">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {frames.map((frame, index) => (
            <motion.div
              key={frame.frameId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`relative rounded-3xl p-6 border-2 transition-all duration-300 ${
                frame.product
                  ? "border-clay bg-white shadow-lg"
                  : "border-soil/10 bg-sand/20 border-dashed"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="bg-soil text-white w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shadow-md">
                  {frame.frameId + 1}
                </span>
                {frame.product && (
                  <button
                    onClick={() => handleClearFrame(frame.frameId)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4 relative group">
                {frame.product ? (
                  <>
                    <img
                      src={frame.product.images[0]}
                      alt={frame.product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-center p-2">
                      {frame.product.name}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-soil/20">
                    <ImageIcon size={48} />
                  </div>
                )}
              </div>

              {/* Search / Add Button */}
              <div className="relative">
                {!frame.product && activeFrameId !== frame.frameId && (
                  <button
                    onClick={() => {
                      setActiveFrameId(frame.frameId);
                      setSearchQuery("");
                      setTimeout(
                        () =>
                          document
                            .getElementById(`search-${frame.frameId}`)
                            ?.focus(),
                        100
                      );
                    }}
                    className="w-full py-3 border-2 border-clay text-clay rounded-xl font-semibold hover:bg-clay hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Add Product
                  </button>
                )}

                {/* Search Dropdown */}
                <AnimatePresence>
                  {activeFrameId === frame.frameId && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute inset-x-0 bottom-0 z-20 bg-white rounded-xl shadow-2xl border border-clay/20 overflow-hidden"
                    >
                      <div className="flex items-center border-b p-2">
                        <Search size={18} className="text-gray-400 ml-2" />
                        <input
                          id={`search-${frame.frameId}`}
                          type="text"
                          placeholder="Search product..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full p-2 outline-none text-base md:text-sm"
                        />
                        <button
                          onClick={() => setActiveFrameId(null)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="max-h-48 overflow-y-auto">
                        {searching ? (
                          <div className="p-4 text-center text-gray-500">
                            <Loader2 className="animate-spin mx-auto" />
                          </div>
                        ) : searchResults.length > 0 ? (
                          searchResults.map((p) => (
                            <button
                              key={p._id}
                              onClick={() =>
                                handleAssignProduct(frame.frameId, p)
                              }
                              className="w-full text-left p-3 hover:bg-sand/30 flex items-center gap-3 border-b border-gray-50 last:border-0"
                            >
                              <img
                                src={p.images[0]}
                                className="w-10 h-10 rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {p.name}
                                </div>
                                <div className="text-xs text-gray-500 capitalize">
                                  {p.category}
                                </div>
                              </div>
                            </button>
                          ))
                        ) : searchQuery.length > 1 ? (
                          <div className="p-3 text-center text-xs text-gray-500">
                            No products found
                          </div>
                        ) : (
                          <div className="p-3 text-center text-xs text-gray-400">
                            Type to search...
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Label hint */}
              <div className="text-xs text-center mt-3 text-soil/40 font-mono">
                {frameLayouts[index].label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminPageContainer>
  );
}
