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
} from "lucide-react";
import UploadInput from "@/components/UploadInput";
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
  });
  const [categories, setCategories] = useState<any[]>([]); // Dynamic categories
  const [category, setCategory] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Custom dropdown interactions
  const [descriptionText, setDescriptionText] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = p.name?.toLowerCase().includes(term);
    const catLabel = PRODUCT_CATEGORIES.find(
      (c) => c.id === p.category
    )?.label?.toLowerCase();
    const catMatch =
      p.category?.toLowerCase().includes(term) || catLabel?.includes(term);
    return nameMatch || catMatch;
  });

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
      });
      setCategory("");
      setDescriptionText("");
      setSuccess("Product added");

      // Check if this was a new category and refresh list if needed
      if (!categories.find(c => c.slug === category)) {
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
        body: JSON.stringify({ name })
      });
      fetchCategories();
    } catch (e) { console.error(e); }
  }

  // Delete category handler
  async function handleDeleteCategory(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setCategories(categories.filter(c => c._id !== id));
        if (products.some(p => p.category === categories.find(c => c._id === id)?.slug)) {
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

      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin"
          className="text-soil/60 hover:text-clay transition-colors hover:scale-105 transform inline-block"
        >
          ← Admin Home
        </Link>
        <motion.h1
          variants={itemVariants}
          className="text-3xl font-serif font-bold text-soil"
        >
          Products
        </motion.h1>
      </div>

      {/* ADD PRODUCT FORM */}
      <motion.div
        variants={itemVariants}
        className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-soil/10"
      >
        <h2 className="text-xl font-bold text-soil mb-4 flex items-center gap-2">
          <span>✨</span> Add New Product
        </h2>
        <form onSubmit={handleAdd} className="flex gap-4 flex-wrap">
          {/* ... existing form inputs ... */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="border p-3 rounded-lg focus:ring-2 focus:ring-clay/20 outline-none transition-all hover:border-clay"
              required
            />
            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              placeholder="Price"
              className="border p-3 rounded-lg focus:ring-2 focus:ring-clay/20 outline-none transition-all hover:border-clay"
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
              className="border p-3 rounded-lg focus:ring-2 focus:ring-clay/20 outline-none transition-all hover:border-clay"
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
              placeholder="Weight (Optional, default 500g)"
              className="border p-3 rounded-lg focus:ring-2 focus:ring-clay/20 outline-none transition-all hover:border-clay"
              title="Weight in grams (e.g. 500 for 0.5kg)"
            />
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
            <div className="flex gap-2 mt-2 flex-wrap w-full">
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
                      className="w-20 h-20 object-cover rounded-lg shadow-sm"
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
                className="border p-3 rounded-lg w-full bg-white cursor-pointer flex justify-between items-center"
              >
                <span className={category ? "text-soil" : "text-gray-400"}>
                  {categories.find(c => c.slug === category)?.name || (category || "Select category")}
                </span>
                <ChevronRight className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-90' : ''}`} />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                  {categories.map((cat) => (
                    <div
                      key={cat._id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer group"
                      onClick={() => {
                        setCategory(cat.slug);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span>{cat.name}</span>
                      <button
                        onClick={(e) => handleDeleteCategory(cat._id, e)}
                        className="p-1 hover:bg-red-100 rounded text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <div
                    className="p-3 hover:bg-gray-50 cursor-pointer text-clay font-medium border-t"
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

            {category === "other" || (!categories.find(c => c.slug === category) && category !== "") ? (
              <motion.input
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                value={category === "other" ? "" : category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Enter new category"
                className="border p-3 rounded-lg flex-grow focus:ring-2 focus:ring-clay/20 outline-none"
              />
            ) : null}
          </div>

          <input
            value={descriptionText}
            onChange={(e) => setDescriptionText(e.target.value)}
            placeholder="Short description"
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-clay/20 outline-none"
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-black text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all w-full md:w-auto flex items-center gap-2 justify-center"
          >
            <Plus size={20} /> Add Product
          </motion.button>
        </form>
      </motion.div>

      {/* SEARCH BAR */}
      <div className="mb-4">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or category..."
          className="border p-2 w-full max-w-md rounded-md"
        />
      </div>

      {/* PRODUCT TABLE and PAGINATION */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed min-w-[800px]">
            <thead className="bg-gray-50 text-soil/80 border-b">
              <tr>
                <th className="w-4/12 p-3 text-left font-semibold">Name</th>
                <th className="w-2/12 p-3 text-left font-semibold">Category</th>
                <th className="w-1/12 p-3 text-left font-semibold">Price</th>
                <th className="w-1/12 p-3 text-left font-semibold">Stock</th>
                <th className="w-1/12 p-3 text-left font-semibold">Img</th>
                <th className="w-3/12 p-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {currentProducts.map((p) => (
                  <motion.tr
                    key={p._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ backgroundColor: "rgba(50, 50, 50, 0.02)" }}
                    className="hover:bg-gray-50/50 transition-colors"
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
                          });
                          setCategory(p.category || "");
                          setDescriptionText(p.description || "");
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors hover:underline inline-flex items-center gap-1"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors hover:underline inline-flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Delete
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

        {/* Pagination Controls */}
        {filteredProducts.length > 0 && (
          <div className="bg-gray-50 p-3 border-t flex items-center justify-between">
            <div className="text-sm text-soil/60">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
              </span>{" "}
              of <span className="font-medium">{filteredProducts.length}</span>{" "}
              results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 inline-flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 border rounded text-sm ${currentPage === page
                        ? "bg-black text-white"
                        : "hover:bg-gray-200"
                      }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 inline-flex items-center gap-1"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Edit Product</h3>
              <button
                onClick={() => setEditingId(null)}
                className="text-soil/60 hover:text-soil inline-flex items-center gap-1"
              >
                <X size={18} /> Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-soil mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border p-2 w-full"
                />

                <label className="block text-sm text-soil mt-3 mb-1">
                  Price
                </label>
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
                  className="border p-2 w-full"
                />

                <label className="block text-sm text-soil mt-3 mb-1">
                  Stock
                </label>
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
                  className="border p-2 w-full"
                />

                <label className="block text-sm text-soil mt-3 mb-1">
                  Weight (grams)
                </label>
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
                  className="border p-2 w-full"
                  placeholder="e.g. 500"
                />

                <label className="block text-sm text-soil mt-3 mb-1">
                  Category
                </label>
                <div className="space-y-2">
                  <select
                    value={
                      PRODUCT_CATEGORIES.some((c) => c.id === category)
                        ? category
                        : "other"
                    }
                    onChange={(e) => {
                      if (e.target.value === "other") {
                        setCategory(""); // Clear to allow typing, or keep existing if it was already custom?
                        // Better: if "other", user intends to type.
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="border p-2 w-full"
                  >
                    <option value="">Select category</option>
                    {PRODUCT_CATEGORIES.filter((c) => c.id !== "all").map(
                      (cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      )
                    )}
                    <option value="other">Other (Add New)</option>
                  </select>

                  {/* Show input if category is NOT in the predefined list (meaning it's custom or "other" selected) */}
                  {!PRODUCT_CATEGORIES.some((c) => c.id === category) && (
                    <input
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Enter custom category"
                      className="border p-2 w-full"
                    />
                  )}
                </div>

                <label className="block text-sm text-soil mt-3 mb-1">
                  Short description
                </label>
                <input
                  value={descriptionText}
                  onChange={(e) => setDescriptionText(e.target.value)}
                  className="border p-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-soil mb-1">Images</label>
                <div className="flex gap-2 flex-wrap mb-3">
                  {(form.images || []).map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={img}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== idx),
                          }))
                        }
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
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

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 border rounded hover:bg-gray-50 inline-flex items-center gap-2"
                  >
                    <X size={16} /> Cancel
                  </button>
                  <button
                    onClick={() => editingId && handleUpdate(editingId)}
                    className="px-4 py-2 bg-clay text-white rounded hover:bg-clay/90 inline-flex items-center gap-2"
                  >
                    <Save size={16} /> Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
