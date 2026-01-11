"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import UploadInput from "@/components/UploadInput";
import { PRODUCT_CATEGORIES } from "@/lib/categories";

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
    images: [],
  });
  const [category, setCategory] = useState<string>('');
  const [descriptionText, setDescriptionText] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const nameMatch = p.name?.toLowerCase().includes(term);
    const catLabel = PRODUCT_CATEGORIES.find(c => c.id === p.category)?.label?.toLowerCase();
    const catMatch = p.category?.toLowerCase().includes(term) || catLabel?.includes(term);
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
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  /* FETCH PRODUCTS */
  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setProducts)
      .catch((err) => setError(err.message));
  }, []);

  /* ADD PRODUCT */
  async function handleAdd(e: any) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!category) {
      setError('Category is required');
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
          images: form.images, // secure URLs
          description: descriptionText,
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create');
        return;
      }

      setProducts((p) => [data, ...p]);
      setForm({ name: "", price: 0, stockQuantity: 0, images: [] });
      setCategory('');
      setDescriptionText('');
      setSuccess('Product added');
    } catch (err: any) {
      setError(err.message || 'Network error');
    }
  }

  /* UPDATE PRODUCT */
  async function handleUpdate(id: string) {
    setError('');
    setSuccess('');
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...form, category, description: descriptionText }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update');
        return;
      }

      const updated = data.product || data;
      setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
      setSuccess('Product updated');
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || 'Network error');
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
    <div className="space-y-8">
      {/* ... existing alerts and header ... */}
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="text-soil/60 hover:text-clay">
          ← Admin Home
        </Link>
        <h1 className="text-3xl font-serif font-bold text-soil">Products</h1>
      </div>

      {/* ADD PRODUCT FORM (omitted for brevity in replacement, kept in file) */}
      <form onSubmit={handleAdd} className="flex gap-2 flex-wrap">
        {/* ... existing form inputs ... */}
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name"
          className="border p-2"
          required
        />
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value === "" ? "" : Number(e.target.value) })}
          placeholder="Price"
          className="border p-2"
          required
        />
        <input
          type="number"
          value={form.stockQuantity}
          onChange={(e) =>
            setForm({ ...form, stockQuantity: e.target.value === "" ? "" : Number(e.target.value) })
          }
          placeholder="Stock"
          className="border p-2"
          required
        />

        <UploadInput
          uploadPreset={"products_unsigned"}
          folder={"products/"}
          onUploaded={(urls) => {
            setForm((prev) => ({ ...prev, images: [...(prev.images || []), ...urls] }));
          }}
        />

        {/* Thumbnails */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {(form.images || []).map((img, idx) => (
            <div key={idx} className="relative">
              <img src={img} className="w-20 h-20 object-cover rounded" />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 w-full">
          <select
            value={PRODUCT_CATEGORIES.some(c => c.id === category) ? category : "other"}
            onChange={(e) => {
              if (e.target.value === "other") {
                setCategory("");
              } else {
                setCategory(e.target.value);
              }
            }}
            className="border p-2 flex-grow"
          >
            <option value="">Select category</option>
            {PRODUCT_CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
            <option value="other">Other (Add New)</option>
          </select>
          {(!PRODUCT_CATEGORIES.some(c => c.id === category) && category !== "") || !PRODUCT_CATEGORIES.some(c => c.id === category) ? (
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter new category"
              className="border p-2 flex-grow"
            />
          ) : null}
        </div>

        <input
          value={descriptionText}
          onChange={(e) => setDescriptionText(e.target.value)}
          placeholder="Short description"
          className="border p-2 w-full"
        />

        <button className="bg-black text-white px-6 py-2">Add</button>
      </form>

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
          <table className="w-full table-fixed">
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
              {currentProducts.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3 align-top break-words text-sm font-medium text-soil/90">
                    {p.name}
                  </td>
                  <td className="p-3 align-top text-sm text-soil/70 break-words">
                    {PRODUCT_CATEGORIES.find(c => c.id === p.category)?.label || p.category}
                  </td>
                  <td className="p-3 align-top text-sm text-soil/70">
                    ₹{p.price}
                  </td>
                  <td className="p-3 align-top text-sm text-soil/70">
                    {p.stockQuantity}
                  </td>
                  <td className="p-3 align-top text-sm text-soil/70">
                    {p.images?.length || 0}
                  </td>
                  <td className="p-3 align-top text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingId(p._id);
                        setForm({ name: p.name, price: p.price, stockQuantity: p.stockQuantity, images: p.images || [] });
                        setCategory(p.category || '');
                        setDescriptionText(p.description || '');
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-soil/50">No products found matching your search.</div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredProducts.length > 0 && (
          <div className="bg-gray-50 p-3 border-t flex items-center justify-between">
            <div className="text-sm text-soil/60">
              Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</span> of <span className="font-medium">{filteredProducts.length}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 border rounded text-sm ${currentPage === page ? 'bg-black text-white' : 'hover:bg-gray-200'}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
              >
                Next
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
              <button onClick={() => setEditingId(null)} className="text-soil/60">Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-soil mb-1">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2 w-full" />

                <label className="block text-sm text-soil mt-3 mb-1">Price</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value === "" ? "" : Number(e.target.value) })} className="border p-2 w-full" />

                <label className="block text-sm text-soil mt-3 mb-1">Stock</label>
                <input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value === "" ? "" : Number(e.target.value) })} className="border p-2 w-full" />

                <label className="block text-sm text-soil mt-3 mb-1">Category</label>
                <div className="space-y-2">
                  <select
                    value={PRODUCT_CATEGORIES.some(c => c.id === category) ? category : "other"}
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
                    {PRODUCT_CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                    <option value="other">Other (Add New)</option>
                  </select>

                  {/* Show input if category is NOT in the predefined list (meaning it's custom or "other" selected) */}
                  {!PRODUCT_CATEGORIES.some(c => c.id === category) && (
                    <input
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Enter custom category"
                      className="border p-2 w-full"
                    />
                  )}
                </div>

                <label className="block text-sm text-soil mt-3 mb-1">Short description</label>
                <input value={descriptionText} onChange={(e) => setDescriptionText(e.target.value)} className="border p-2 w-full" />

              </div>

              <div>
                <label className="block text-sm text-soil mb-1">Images</label>
                <div className="flex gap-2 flex-wrap mb-3">
                  {(form.images || []).map((img, idx) => (
                    <div key={idx} className="relative">
                      <img src={img} className="w-24 h-24 object-cover rounded" />
                      <button type="button" onClick={() => setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs">×</button>
                    </div>
                  ))}
                </div>

                <UploadInput uploadPreset={"products_unsigned"} folder={"products/"} onUploaded={(urls) => setForm((prev) => ({ ...prev, images: [...(prev.images || []), ...urls] }))} />

                <div className="mt-6 flex gap-3 justify-end">
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 border rounded">Cancel</button>
                  <button onClick={() => editingId && handleUpdate(editingId)} className="px-4 py-2 bg-clay text-white rounded">Save</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
