"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import UploadInput from "@/components/UploadInput";
import AdminPageContainer from "@/components/admin/AdminPageContainer";
import { PRODUCT_CATEGORIES } from "@/lib/categories";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50 },
  },
};

const formVariants: Variants = {
  hidden: { opacity: 0, height: 0, overflow: "hidden" },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

type ProductForm = {
  name: string;
  price: number;
  stockQuantity: number;
  images: string[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    name: "",
    price: "",
    stockQuantity: "",
    weightGrams: "", // Added weight field
    images: [],
    tags: [] as string[], // Added tags
  });
  const [tagInput, setTagInput] = useState("");
  const [categories, setCategories] = useState<any[]>([]); // Dynamic categories
  const [category, setCategory] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Custom dropdown interactions
  const [descriptionText, setDescriptionText] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [sortBy, setSortBy] = useState("newest");

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = p.name?.toLowerCase().includes(term);
    const catLabel = PRODUCT_CATEGORIES.find(
      (c) => c.id === p.category
    )?.label?.toLowerCase();
    const catMatch =
      p.category?.toLowerCase().includes(term) || catLabel?.includes(term);
    return nameMatch || catMatch;
  }).sort((a, b) => {
    switch (sortBy) {
      case "newest": return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case "oldest": return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      case "price-high": return b.price - a.price;
      case "price-low": return a.price - b.price;
      case "name-asc": return a.name.localeCompare(b.name);
      case "name-desc": return b.name.localeCompare(a.name);
      case "stock-high": return b.stockQuantity - a.stockQuantity;
      case "stock-low": return a.stockQuantity - b.stockQuantity;
      default: return 0;
    }
  });

  /* REMOVED OLD SORT CONFIG LOGIC */

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  /* FETCH PRODUCTS & CATEGORIES */
  useEffect(() => {
    // Fetch Products
    fetch("/api/admin/products")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setProducts)
      .catch((err) => setError(err.message));

    // Fetch Categories
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  };

  /* ADD PRODUCT */
  async function handleAdd(e: any) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!category) {
      setError("Category is required");
      return;
    }

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          price: form.price,
          stockQuantity: form.stockQuantity,
          weightGrams: form.weightGrams || 500, // Default 500g if missing?
          images: form.images, // secure URLs
          description: descriptionText,
          category,
          tags: form.tags,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create");
        return;
      }

      setProducts((p) => [data, ...p]);
      setForm({
        name: "",
        price: 0,
        stockQuantity: 0,
        weightGrams: "",
        images: [],
        tags: [],
      });
      setTagInput("");
      setCategory("");
      setDescriptionText("");
      setSuccess("Product added");
      setShowAddForm(false);

      // Check if this was a new category and refresh list if needed
      if (!categories.find((c) => c.slug === category)) {
        // It's a hack, effectively we'd want to properly create the category first
        // But since products just store the string, we should essentially "create" it in the category DB too
        // to make it available for future.
        await createCategory(category);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    }
  }

  // Helper to create category on the fly
  async function createCategory(name: string) {
    try {
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      fetchCategories();
    } catch (e) {
      console.error(e);
    }
  }

  // Delete category handler
  async function handleDeleteCategory(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setCategories(categories.filter((c) => c._id !== id));
        if (
          products.some(
            (p) => p.category === categories.find((c) => c._id === id)?.slug
          )
        ) {
          // Optional warning: products with this category still exist
        }
      }
    } catch (e) {
      console.error("Failed to delete category");
    }
  }

  /* UPDATE PRODUCT */
  async function handleUpdate(id: string) {
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          ...form,
          category,
          description: descriptionText,
          tags: form.tags,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update");
        return;
      }

      const updated = data.product || data;
      setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
      setSuccess("Product updated");
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || "Network error");
    }
  }

  /* DELETE PRODUCT */
  async function handleDelete(id: string) {
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setProducts(products.filter((p) => p._id !== id));
  }

  return (
    <AdminPageContainer title="Products">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        {/* ... existing alerts and header ... */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-red-600 bg-red-50 p-3 rounded-lg border border-red-100"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-green-600 bg-green-50 p-3 rounded-lg border border-green-100"
          >
            {success}
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-end gap-3 mb-6 flex-wrap">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* SORT DROPDOWN */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-soil/10 focus:bg-white/10 focus:ring-4 focus:ring-clay/5 rounded-xl px-4 py-3 bg-sand/10 backdrop-blur-sm w-full md:w-auto text-soil cursor-pointer outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="stock-high">Stock: High to Low</option>
              <option value="stock-low">Stock: Low to High</option>
            </select>

            {/* SEARCH BAR */}
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or category..."
              className="border-soil/10 focus:bg-white/10 focus:ring-4 focus:ring-clay/5 rounded-xl px-4 py-3 bg-sand/10 backdrop-blur-sm w-full md:w-80 text-soil placeholder:text-soil/30 transition-all outline-none"
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddForm(!showAddForm)}
              className={`px-6 py-3 rounded-xl font-medium shadow-md transition-all flex items-center justify-center gap-2 ${showAddForm
                ? "bg-gray-200 text-soil hover:bg-gray-300"
                : "bg-black text-white hover:bg-gray-800"
                }`}
            >
              {showAddForm ? (
                <>
                  <X size={18} /> Cancel
                </>
              ) : (
                <>
                  <Plus size={18} /> Add Product
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* ADD PRODUCT MODAL */}
        <AnimatePresence>
          {showAddForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-soil/20 backdrop-blur-md p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#EFE5D8] rounded-2xl shadow-2xl w-full max-w-4xl p-6 md:p-8 border border-white/20 max-h-[90vh] overflow-y-auto relative"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-serif font-bold text-soil flex items-center gap-2">
                    <span>✨</span> Add New Product
                  </h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="p-2 hover:bg-soil/10 rounded-full transition-colors text-soil/60 hover:text-soil"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleAdd} className="flex gap-4 flex-wrap">
                  {/* ... existing form inputs ... */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Name"
                      className="bg-white/40 border border-soil/10 p-4 rounded-xl focus:ring-4 focus:ring-clay/5 outline-none transition-all hover:bg-white/60 text-soil"
                      required
                    />
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          price:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      placeholder="Price"
                      className="bg-white/40 border border-soil/10 p-4 rounded-xl focus:ring-4 focus:ring-clay/5 outline-none transition-all hover:bg-white/60 text-soil"
                      required
                    />
                    <input
                      type="number"
                      value={form.stockQuantity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          stockQuantity:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      placeholder="Stock"
                      className="bg-white/40 border border-soil/10 p-4 rounded-xl focus:ring-4 focus:ring-clay/5 outline-none transition-all hover:bg-white/60 text-soil"
                      required
                    />
                    <input
                      type="number"
                      value={form.weightGrams}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          weightGrams:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      placeholder="Weight (g)"
                      className="bg-white/40 border border-soil/10 p-4 rounded-xl focus:ring-4 focus:ring-clay/5 outline-none transition-all hover:bg-white/60 text-soil"
                      title="Weight in grams (e.g. 500 for 0.5kg)"
                    />
                  </div>

                  {/* Tags Input */}
                  <div className="w-full bg-white/30 p-4 rounded-xl border border-soil/5">
                    <label className="block text-sm font-medium text-soil/70 mb-2">Tags</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (tagInput.trim()) {
                              if (!form.tags.includes(tagInput.trim())) {
                                setForm({ ...form, tags: [...(form.tags || []), tagInput.trim()] });
                              }
                              setTagInput("");
                            }
                          }
                        }}
                        placeholder="Type tag and press Enter..."
                        className="bg-white/50 border border-soil/10 p-3 rounded-lg flex-grow focus:ring-2 focus:ring-clay/20 outline-none text-soil"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tagInput.trim()) {
                            if (!form.tags?.includes(tagInput.trim())) {
                              setForm({ ...form, tags: [...(form.tags || []), tagInput.trim()] });
                            }
                            setTagInput("");
                          }
                        }}
                        className="bg-soil text-white px-5 rounded-lg hover:bg-soil/90 font-medium"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[30px]">
                      {form.tags?.length === 0 && <span className="text-soil/40 text-sm italic">No tags added yet</span>}
                      {form.tags?.map((tag: string, idx: number) => (
                        <span key={idx} className="bg-white text-clay px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-clay/10 flex items-center gap-2">
                          #{tag}
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, tags: form.tags.filter((t: string) => t !== tag) })}
                            className="hover:text-red-500 w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-50"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="w-full">
                    <UploadInput
                      uploadPreset={"products_unsigned"}
                      folder={"products/"}
                      onUploaded={(urls) => {
                        setForm((prev) => ({
                          ...prev,
                          images: [...(prev.images || []), ...urls],
                        }));
                      }}
                    />
                  </div>

                  {/* Thumbnails */}
                  {form.images?.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap w-full bg-white/30 p-4 rounded-xl border border-soil/5">
                      <AnimatePresence>
                        {(form.images || []).map((img, idx) => (
                          <motion.div
                            key={img}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="relative group"
                          >
                            <img
                              src={img}
                              className="w-24 h-24 object-cover rounded-lg shadow-sm bg-white"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== idx),
                                }))
                              }
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center transform hover:scale-110"
                            >
                              ×
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="flex gap-4 w-full relative">
                    {/* Custom Dropdown */}
                    <div className="relative flex-grow">
                      <div
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="border border-soil/10 p-4 rounded-xl w-full bg-white/40 focus:bg-white/60 transition-all cursor-pointer flex justify-between items-center"
                      >
                        <span
                          className={
                            category ? "text-soil font-medium" : "text-soil/40"
                          }
                        >
                          {categories.find((c) => c.slug === category)?.name ||
                            category ||
                            "Select category"}
                        </span>
                        <ChevronRight
                          className={`w-5 h-5 transition-transform text-soil/30 ${isDropdownOpen ? "rotate-90" : ""
                            }`}
                        />
                      </div>

                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#FAF7F2] border border-soil/10 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                          {categories.map((cat) => (
                            <div
                              key={cat._id}
                              className="flex items-center justify-between p-3 hover:bg-brown-50 cursor-pointer group transtion-colors"
                              onClick={() => {
                                setCategory(cat.slug);
                                setIsDropdownOpen(false);
                              }}
                            >
                              <span>{cat.name}</span>
                              <button
                                onClick={(e) => handleDeleteCategory(cat._id, e)}
                                className="p-1 hover:bg-red-100 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Category"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                          <div
                            className="p-3 hover:bg-brown-50 cursor-pointer text-clay font-medium border-t border-soil/5"
                            onClick={() => {
                              setCategory("other");
                              setIsDropdownOpen(false);
                            }}
                          >
                            + Add New Category
                          </div>
                        </div>
                      )}
                    </div>

                    {category === "other" ||
                      (!categories.find((c) => c.slug === category) &&
                        category !== "") ? (
                      <motion.input
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        value={category === "other" ? "" : category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Enter new category"
                        className="border border-soil/10 p-4 rounded-xl flex-grow focus:ring-4 focus:ring-clay/5 outline-none bg-white/40"
                      />
                    ) : null}
                  </div>

                  <textarea
                    value={descriptionText}
                    onChange={(e) => setDescriptionText(e.target.value)}
                    placeholder="Product Description"
                    rows={4}
                    className="bg-white/40 border border-soil/10 p-4 rounded-xl w-full focus:ring-4 focus:ring-clay/5 outline-none transition-all hover:bg-white/60 text-soil resize-none"
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-soil text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-soil/90 transition-all w-full flex items-center gap-2 justify-center mt-4"
                  >
                    <Plus size={24} /> Save Product
                  </motion.button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* PRODUCT TABLE and PAGINATION */}
        <div className="border border-soil/10 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed min-w-[800px] bg-white/5 backdrop-blur-xl">
              <thead className="bg-sand/20 backdrop-blur-md text-soil/60 border-b border-soil/10 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="w-4/12 p-3 text-left font-semibold">
                    Name
                  </th>
                  <th className="w-2/12 p-3 text-left font-semibold">
                    Category
                  </th>
                  <th className="w-1/12 p-3 text-left font-semibold">
                    Price
                  </th>
                  <th className="w-1/12 p-3 text-left font-semibold">
                    Stock
                  </th>
                  <th className="w-1/12 p-3 text-left font-semibold">Img</th>
                  <th className="w-3/12 p-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soil/5">
                <AnimatePresence mode="popLayout">
                  {currentProducts.map((p) => (
                    <motion.tr
                      key={p._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{
                        backgroundColor: "rgba(255, 255, 255, 0.4)",
                      }}
                      className="hover:bg-white/40 transition-colors border-b border-soil/5 last:border-0"
                    >
                      <td className="p-3 align-top break-words text-sm font-medium text-soil/90">
                        {p.name}
                      </td>
                      <td className="p-3 align-top text-sm text-soil/70 break-words">
                        {PRODUCT_CATEGORIES.find((c) => c.id === p.category)
                          ?.label || p.category}
                      </td>
                      <td className="p-3 align-top text-sm text-soil/70">
                        ₹{p.price}
                      </td>
                      <td className="p-3 align-top text-sm text-soil/70">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${p.stockQuantity > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="p-3 align-top text-sm text-soil/70">
                        {p.images?.length || 0}
                      </td>
                      <td className="p-3 align-top text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingId(p._id);
                            setForm({
                              name: p.name,
                              price: p.price,
                              stockQuantity: p.stockQuantity,
                              weightGrams: p.weightGrams || 500,
                              images: p.images || [],
                              tags: p.tags || [],
                            });
                            setCategory(p.category || "");
                            setDescriptionText(p.description || "");
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors hover:underline inline-flex items-center gap-1"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors hover:underline inline-flex items-center gap-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-soil/50">
                No products found matching your search.
              </div>
            )}
          </div>

          {filteredProducts.length > 0 && (
            <div className="bg-sand/10 backdrop-blur-md p-4 border-t border-soil/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-soil/60 text-center md:text-left">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredProducts.length}</span>{" "}
                results
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 inline-flex items-center gap-1"
                >
                  <ChevronLeft size={16} />{" "}
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <div className="flex gap-1 overflow-x-auto max-w-[200px] md:max-w-none no-scrollbar">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1 border rounded text-sm flex-shrink-0 transition-all ${currentPage === page
                          ? "bg-soil text-white shadow-md"
                          : "bg-white/40 hover:bg-white/60 border-soil/10"
                          }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 inline-flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Next</span>{" "}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        <AnimatePresence>
          {editingId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-soil/20 backdrop-blur-md p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#EFE5D8] rounded-2xl shadow-2xl w-full max-w-4xl p-6 md:p-8 border border-white/20 max-h-[90vh] overflow-y-auto relative"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-serif font-bold text-soil flex items-center gap-2">
                    Edit Product
                  </h3>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 hover:bg-soil/10 rounded-full transition-colors text-soil/60 hover:text-soil"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex gap-4 flex-wrap">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Name"
                      className="bg-white/40 border border-soil/10 p-4 rounded-xl focus:ring-4 focus:ring-clay/5 outline-none transition-all hover:bg-white/60 text-soil"
                    />
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          price:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      placeholder="Price"
                      className="bg-white/40 border border-soil/10 p-4 rounded-xl focus:ring-4 focus:ring-clay/5 outline-none transition-all hover:bg-white/60 text-soil"
                    />
                    <input
                      type="number"
                      value={form.stockQuantity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          stockQuantity:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      placeholder="Stock"
                      className="bg-white/40 border border-soil/10 p-4 rounded-xl focus:ring-4 focus:ring-clay/5 outline-none transition-all hover:bg-white/60 text-soil"
                    />
                    <input
                      type="number"
                      value={form.weightGrams}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          weightGrams:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      placeholder="Weight (g)"
                      className="bg-white/40 border border-soil/10 p-4 rounded-xl focus:ring-4 focus:ring-clay/5 outline-none transition-all hover:bg-white/60 text-soil"
                    />
                  </div>

                  {/* Category Selection */}
                  <div className="flex gap-4 w-full relative">
                    <div className="relative flex-grow">
                      <div
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="border border-soil/10 p-4 rounded-xl w-full bg-white/40 focus:bg-white/60 transition-all cursor-pointer flex justify-between items-center"
                      >
                        <span className={category ? "text-soil font-medium" : "text-soil/40"}>
                          {categories.find((c) => c.slug === category)?.name || category || "Select category"}
                        </span>
                        <ChevronRight className={`w-5 h-5 transition-transform text-soil/30 ${isDropdownOpen ? "rotate-90" : ""}`} />
                      </div>

                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#FAF7F2] border border-soil/10 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                          {categories.map((cat) => (
                            <div
                              key={cat._id}
                              className="flex items-center justify-between p-3 hover:bg-brown-50 cursor-pointer group transition-colors"
                              onClick={() => {
                                setCategory(cat.slug);
                                setIsDropdownOpen(false);
                              }}
                            >
                              <span>{cat.name}</span>
                            </div>
                          ))}
                          <div
                            className="p-3 hover:bg-brown-50 cursor-pointer text-clay font-medium border-t border-soil/5"
                            onClick={() => {
                              setCategory("other");
                              setIsDropdownOpen(false);
                            }}
                          >
                            + Add New Category
                          </div>
                        </div>
                      )}
                    </div>

                    {category === "other" || (!categories.find((c) => c.slug === category) && category !== "") ? (
                      <input
                        value={category === "other" ? "" : category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Enter new category"
                        className="border border-soil/10 p-4 rounded-xl flex-grow focus:ring-4 focus:ring-clay/5 outline-none bg-white/40"
                      />
                    ) : null}
                  </div>

                  <textarea
                    value={descriptionText}
                    onChange={(e) => setDescriptionText(e.target.value)}
                    placeholder="Product Description"
                    rows={4}
                    className="bg-white/40 border border-soil/10 p-4 rounded-xl w-full focus:ring-4 focus:ring-clay/5 outline-none transition-all hover:bg-white/60 text-soil resize-none"
                  />

                  {/* Tags Input */}
                  <div className="w-full bg-white/30 p-4 rounded-xl border border-soil/5">
                    <label className="block text-sm font-medium text-soil/70 mb-2">Tags</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (tagInput.trim()) {
                              if (!form.tags.includes(tagInput.trim())) {
                                setForm({ ...form, tags: [...(form.tags || []), tagInput.trim()] });
                              }
                              setTagInput("");
                            }
                          }
                        }}
                        placeholder="Type tag and press Enter..."
                        className="bg-white/50 border border-soil/10 p-3 rounded-lg flex-grow focus:ring-2 focus:ring-clay/20 outline-none text-soil"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tagInput.trim()) {
                            if (!form.tags?.includes(tagInput.trim())) {
                              setForm({ ...form, tags: [...(form.tags || []), tagInput.trim()] });
                            }
                            setTagInput("");
                          }
                        }}
                        className="bg-soil text-white px-5 rounded-lg hover:bg-soil/90 font-medium"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[30px]">
                      {form?.tags?.length === 0 && <span className="text-soil/40 text-sm italic">No tags added yet</span>}
                      {form?.tags?.map((tag: string, idx: number) => (
                        <span key={idx} className="bg-white text-clay px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-clay/10 flex items-center gap-2">
                          #{tag}
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, tags: form.tags.filter((t: string) => t !== tag) })}
                            className="hover:text-red-500 w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-50"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Images */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-soil/70 mb-2">Images</label>
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {(form.images || []).map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            className="w-24 h-24 object-cover rounded-lg shadow-sm bg-white"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== idx),
                              }))
                            }
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <UploadInput
                      uploadPreset={"products_unsigned"}
                      folder={"products/"}
                      onUploaded={(urls) =>
                        setForm((prev) => ({
                          ...prev,
                          images: [...(prev.images || []), ...urls],
                        }))
                      }
                    />
                  </div>

                  <div className="w-full mt-6 flex gap-3 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-6 py-3 border border-soil/10 rounded-xl hover:bg-white/40 text-soil transition-colors inline-flex items-center gap-2 font-medium"
                    >
                      <X size={18} /> Cancel
                    </button>
                    <button
                      onClick={() => editingId && handleUpdate(editingId)}
                      className="px-6 py-3 bg-clay text-white rounded-xl hover:bg-clay/90 shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2 font-medium"
                    >
                      <Save size={18} /> Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </AdminPageContainer>
  );
}
