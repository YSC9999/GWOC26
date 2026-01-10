"use client";

import { useEffect, useState } from "react";

type ProductForm = {
  name: string;
  price: number;
  stockQuantity: number;
  images: string[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>({
    name: "",
    price: 0,
    stockQuantity: 0,
    images: [],
  });
  const [error, setError] = useState("");

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

  /* CLOUDINARY UPLOAD */
  async function uploadImages(files: FileList): Promise<string[]> {
    const urls: string[] = [];

    for (const file of Array.from(files)) {
      const data = new FormData();
      data.append("file", file);
      data.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const json = await res.json();
      urls.push(json.secure_url);
    }

    return urls;
  }

  /* ADD PRODUCT */
  async function handleAdd(e: any) {
    e.preventDefault();
    const formEl = e.target;

    const images =
      formEl.images.files.length > 0
        ? await uploadImages(formEl.images.files)
        : [];

    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formEl.name.value,
        price: Number(formEl.price.value),
        stockQuantity: Number(formEl.stockQuantity.value),
        images,
      }),
    });

    location.reload();
  }

  /* UPDATE PRODUCT */
  async function handleUpdate(id: string) {
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...form }),
    });

    location.reload();
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

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-8">
      {/* ADD PRODUCT */}
      <form onSubmit={handleAdd} className="flex gap-2 flex-wrap">
        <input name="name" placeholder="Name" className="border p-2" required />
        <input
          name="price"
          type="number"
          placeholder="Price"
          className="border p-2"
          required
        />
        <input
          name="stockQuantity"
          type="number"
          placeholder="Stock"
          className="border p-2"
          required
        />
        <input
          name="images"
          type="file"
          multiple
          accept="image/*"
          className="border p-2"
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
              {editingId === p._id ? (
                <>
                  <td>
                    <input
                      className="border p-1"
                      defaultValue={p.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="border p-1"
                      defaultValue={p.price}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          price: Number(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="border p-1"
                      defaultValue={p.stockQuantity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                           stockQuantity: Number(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td>{p.images?.length || 0}</td>
                  <td>
                    <button
                      onClick={() => handleUpdate(p._id)}
                      className="text-green-600 mr-2"
                    >
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{p.name}</td>
                  <td>₹{p.price}</td>
                  <td>{p.stockQuantity}</td>
                  <td>{p.images?.length || 0}</td>
                  <td>
                    <button
                      onClick={() => {
                        setEditingId(p._id);
                        setForm(p);
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
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
