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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="text-soil/60 hover:text-clay">
          ← Admin Home
        </Link>
        <h1 className="text-3xl font-serif font-bold text-soil">Products</h1>
      </div>

      {/* ADD PRODUCT */}
      <form onSubmit={handleAdd} className="flex gap-2 flex-wrap">
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

      {/* PRODUCT TABLE */}
      <table className="w-full border">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Images</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id} className="border-t">
              <td>{p.name}</td>
              <td>₹{p.price}</td>
              <td>{p.stockQuantity}</td>
              <td>{p.images?.length || 0}</td>
              <td>
                <button
                  onClick={() => {
                    setEditingId(p._id);
                    setForm({ name: p.name, price: p.price, stockQuantity: p.stockQuantity, images: p.images || [] });
                    setCategory(p.category || '');
                    setDescriptionText(p.description || '');
                  }}
                  className="mr-3 text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
