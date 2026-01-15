"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  Save,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminPageContainer from "@/components/admin/AdminPageContainer";

interface Product {
  _id: string;
  name: string;
  image?: string;
  price: number;
}

interface Collection {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  isActive: boolean;
  products: Product[];
  displayOrder: number;
}

export default function AdminCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [currentCollection, setCurrentCollection] = useState<Collection>({
    title: "",
    slug: "",
    description: "",
    isActive: true,
    products: [],
    displayOrder: 0,
  });

  // Product Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await fetch("/api/featured-collections");
      const data = await res.json();
      setCollections(data.collections || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const method = currentCollection._id ? "PUT" : "POST";
      const url = currentCollection._id
        ? `/api/featured-collections/${currentCollection._id}`
        : "/api/featured-collections";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentCollection,
          products: currentCollection.products.map((p) => p._id), // Send only IDs
        }),
      });

      if (res.ok) {
        setIsEditing(false);
        fetchCollections();
        resetForm();
      } else {
        alert("Failed to save collection");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving collection");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this collection?")) return;
    try {
      await fetch(`/api/featured-collections/${id}`, { method: "DELETE" });
      fetchCollections();
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setCurrentCollection({
      title: "",
      slug: "",
      description: "",
      isActive: true,
      products: [],
      displayOrder: collections.length,
    });
    setSearchTerm("");
    setSearchResults([]);
  };

  const searchProducts = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      // Assuming a product search API exists, if not we might need to create one or use the list endpoint with filter
      // For now, let's assume we can fetch all and filter client side if the list is small, or use a proper search endpoint.
      // Let's use the main products API and filter client side for MVP to avoid creating new endpoints unnecessarily if not needed.
      const res = await fetch(`/api/products?search=${term}`);
      const data = await res.json();
      setSearchResults(data.products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const addProductToCollection = (product: Product) => {
    if (currentCollection.products.some((p) => p._id === product._id)) return;
    setCurrentCollection((prev) => ({
      ...prev,
      products: [...prev.products, product],
    }));
    setSearchTerm("");
    setSearchResults([]);
  };

  const removeProductFromCollection = (productId: string) => {
    setCurrentCollection((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p._id !== productId),
    }));
  };

  return (
    <AdminPageContainer title="Featured Collections">
      <div className="space-y-6">
        <div className="flex justify-end">
          {!isEditing && (
            <button
              onClick={() => {
                resetForm();
                setIsEditing(true);
              }}
              className="flex items-center gap-2 bg-clay text-white px-6 py-2 rounded-lg hover:bg-clay/90 transition-colors"
            >
              <Plus size={20} /> Create New
            </button>
          )}
        </div>

        {isEditing ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg border border-soil/10"
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-soil/10">
              <h2 className="text-xl font-bold text-soil">
                {currentCollection._id ? "Edit Collection" : "New Collection"}
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-soil/50 hover:text-red-500 p-2"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ... existing fields ... */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-soil mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={currentCollection.title}
                    onChange={(e) =>
                      setCurrentCollection({
                        ...currentCollection,
                        title: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-soil/20 rounded-lg focus:outline-none focus:border-clay text-base md:text-sm"
                    placeholder="e.g. Bestsellers"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-soil mb-1">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={currentCollection.slug}
                    onChange={(e) =>
                      setCurrentCollection({
                        ...currentCollection,
                        slug: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-soil/20 rounded-lg focus:outline-none focus:border-clay text-base md:text-sm"
                    placeholder="bestsellers"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-soil mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={currentCollection.description}
                    onChange={(e) =>
                      setCurrentCollection({
                        ...currentCollection,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-soil/20 rounded-lg focus:outline-none focus:border-clay h-24 text-base md:text-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentCollection.isActive}
                      onChange={(e) =>
                        setCurrentCollection({
                          ...currentCollection,
                          isActive: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-clay rounded focus:ring-clay"
                    />
                    <span className="text-soil">Active on Home Page</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-soil mb-1">
                  Add Products
                </label>
                <div className="relative">
                  <div className="flex items-center border border-soil/20 rounded-lg bg-sand/10 px-3">
                    <Search size={18} className="text-soil/50" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => searchProducts(e.target.value)}
                      className="w-full p-3 bg-transparent focus:outline-none text-base md:text-sm"
                      placeholder="Search products directly..."
                    />
                  </div>

                  {/* Search Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-soil/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      {searchResults.map((product) => (
                        <button
                          key={product._id}
                          onClick={() => addProductToCollection(product)}
                          className="w-full text-left px-4 py-3 hover:bg-sand/20 flex items-center justify-between border-b border-soil/5 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              <img
                                src={product.image}
                                className="w-8 h-8 rounded object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-200 rounded" />
                            )}
                            <span className="font-medium text-soil line-clamp-1">
                              {product.name}
                            </span>
                          </div>
                          <span className="text-clay text-sm shrink-0">
                            ₹{product.price}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-soil mb-2">
                    Selected Products ({currentCollection.products.length})
                  </label>
                  <div className="bg-sand/10 rounded-xl p-2 max-h-[300px] overflow-y-auto space-y-2 no-scrollbar">
                    {currentCollection.products.length === 0 && (
                      <div className="text-center py-8 text-soil/40 italic">
                        No products added yet
                      </div>
                    )}
                    <AnimatePresence>
                      {currentCollection.products.map((product, index) => (
                        <motion.div
                          key={product._id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center justify-between bg-white p-3 rounded-lg border border-soil/5"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs text-soil/30 font-mono w-4 shrink-0">
                              {index + 1}
                            </span>
                            {product.image && (
                              <img
                                src={product.image}
                                className="w-8 h-8 rounded object-cover shrink-0"
                              />
                            )}
                            <span className="text-sm font-medium text-soil truncate">
                              {product.name}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              removeProductFromCollection(product._id)
                            }
                            className="text-red-400 hover:text-red-600 p-1 shrink-0"
                          >
                            <MinusIcon />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-soil/10 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                onClick={() => setIsEditing(false)}
                className="w-full sm:w-auto px-6 py-2.5 text-soil/60 hover:text-soil font-medium hover:bg-sand/10 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-2.5 bg-clay text-white rounded-xl hover:bg-clay/90 font-medium flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={18} /> Save Collection
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div
                key={collection._id}
                className="bg-white border border-soil/10 rounded-2xl p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-soil font-serif">
                      {collection.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        collection.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {collection.isActive ? "Active" : "Draft"}
                    </span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setCurrentCollection(collection);
                        setIsEditing(true);
                      }}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-full"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(collection._id!)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-full"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-soil/60 text-sm mb-4 line-clamp-2 h-10">
                  {collection.description || "No description"}
                </p>
                <div className="flex items-center gap-2 text-sm text-soil/50 bg-sand/20 p-3 rounded-lg">
                  <div className="flex -space-x-2">
                    {collection.products.slice(0, 3).map((p) => (
                      <div
                        key={p._id}
                        className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white overflow-hidden"
                      >
                        {p.image && (
                          <img
                            src={p.image}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <span>{collection.products.length} Products</span>
                </div>
              </div>
            ))}

            {collections.length === 0 && (
              <div className="col-span-full py-20 text-center text-soil/40 border-2 border-dashed border-soil/10 rounded-3xl">
                <p>No collections found. Create one to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminPageContainer>
  );
}

function MinusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
    </svg>
  );
}
