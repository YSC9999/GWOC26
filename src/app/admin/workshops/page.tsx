"use client";

import { useEffect, useState } from "react";

export default function WorkshopPage() {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load workshops
  useEffect(() => {
    fetch("/api/admin/workshops")
      .then((res) => res.json())
      .then(setWorkshops)
      .catch(() => setError("Failed to load workshops"));
  }, []);

  //cloud upload
async function uploadImage(file: File): Promise<string> {
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
  return json.secure_url;
}


  // Handle submit
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setLoading(true);

  const form = e.currentTarget;
  const formData = new FormData(form);

  const file = formData.get("image") as File | null;

  let imageUrl = "";

  if (file && file.size > 0) {
    imageUrl = await uploadImage(file);
  }

  // Remove file and send only URL
  formData.delete("image");
  formData.append("image", imageUrl);

  const res = await fetch("/api/admin/workshops", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    setError("Failed to create workshop");
    setLoading(false);
    return;
  }

  const newWorkshop = await res.json();
  setWorkshops((prev) => [newWorkshop, ...prev]);
  form.reset();
  setLoading(false);
}


  return (
    <div className="p-10 space-y-10">
      <h1 className="text-2xl font-bold">Workshops</h1>

      {/* CREATE WORKSHOP */}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 bg-white p-6 rounded shadow">

        <input name="title" placeholder="Title" required className="border p-2" />
        <input name="description" placeholder="Description" required className="border p-2" />

        <select name="type" className="border p-2">
          <option value="group">Group</option>
          <option value="one-on-one">One on One</option>
          <option value="couples">Couples</option>
          <option value="corporate">Corporate</option>
        </select>

        <select name="level" className="border p-2">
          <option value="all-levels">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
        </select>

        <input name="price" type="number" placeholder="Price" required className="border p-2" />
        <input name="maxParticipants" type="number" placeholder="Max Participants" required className="border p-2" />

        <input name="date" type="date" required className="border p-2" />
        <input name="time" placeholder="10:00 AM - 1:00 PM" required className="border p-2" />

        <input name="duration" placeholder="3 hours" required className="border p-2" />

        <select name="location" className="border p-2">
          <option value="studio">Studio</option>
          <option value="offsite">Offsite</option>
        </select>

        <input name="address" placeholder="Address (optional)" className="border p-2" />

        <input name="includes" placeholder="Includes (comma separated)" className="border p-2 col-span-2" />

        <input name="image" type="file" accept="image/*" className="border p-2 col-span-2" />

        <button
          disabled={loading}
          className="bg-black text-white py-2 col-span-2"
        >
          {loading ? "Creating..." : "Add Workshop"}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {/* WORKSHOP LIST */}
      <div className="grid md:grid-cols-3 gap-6">
        {workshops.map((w) => (
          <div key={w._id} className="border rounded p-4 shadow space-y-2">
            {w.image && (
              <img
                src={w.image}
                className="h-40 w-full object-cover rounded"
              />
            )}

            <h2 className="font-bold text-lg">{w.title}</h2>
            <p>{w.description}</p>

            <p className="text-sm text-gray-500">
              {new Date(w.date).toDateString()} • {w.time}
            </p>

            <p>₹{w.price}</p>

            <p className="text-sm">
              {w.enrolledCount}/{w.maxParticipants} seats
            </p>

            <span className="text-xs px-2 py-1 bg-gray-200 rounded">
              {w.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
