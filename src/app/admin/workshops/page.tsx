"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import UploadInput from "@/components/UploadInput";

const WORKSHOP_TYPES = [
  { id: "group", label: "Group" },
  { id: "one-on-one", label: "One on One" },
  { id: "couples", label: "Couples" },
  { id: "corporate", label: "Corporate" },
];

const WORKSHOP_LEVELS = [
  { id: "all-levels", label: "All Levels" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
];

const WORKSHOP_LOCATIONS = [
  { id: "studio", label: "Studio" },
  { id: "offsite", label: "Offsite" },
];

const WORKSHOP_STATUSES = [
  { id: "upcoming", label: "Upcoming" },
  { id: "full", label: "Full" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

type WorkshopForm = {
  title: string;
  description: string;
  type: string;
  level: string;
  price: number | string;
  maxParticipants: number | string;
  date: string;
  time: string;
  duration: string;
  location: string;
  address: string;
  includes: string;
  image: string;
  status: string;
};

const defaultForm: WorkshopForm = {
  title: "",
  description: "",
  type: "group",
  level: "all-levels",
  price: "",
  maxParticipants: "",
  date: "",
  time: "",
  duration: "",
  location: "studio",
  address: "",
  includes: "",
  image: "",
  status: "upcoming",
};

export default function WorkshopPage() {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WorkshopForm>(defaultForm);

  // Filtered workshops
  const filteredWorkshops = workshops.filter((w) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = w.title?.toLowerCase().includes(term);
    const typeMatch = w.type?.toLowerCase().includes(term);
    const statusMatch = w.status?.toLowerCase().includes(term);
    return titleMatch || typeMatch || statusMatch;
  });

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredWorkshops.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentWorkshops = filteredWorkshops.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Load workshops
  useEffect(() => {
    fetch("/api/admin/workshops")
      .then((res) => res.json())
      .then(setWorkshops)
      .catch(() => setError("Failed to load workshops"));
  }, []);

  // Handle create
  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("type", form.type);
    formData.append("level", form.level);
    formData.append("price", String(form.price));
    formData.append("maxParticipants", String(form.maxParticipants));
    formData.append("date", form.date);
    formData.append("time", form.time);
    formData.append("duration", form.duration);
    formData.append("location", form.location);
    formData.append("address", form.address);
    formData.append("includes", form.includes);
    formData.append("image", form.image);

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
    setForm(defaultForm);
    setSuccess("Workshop created successfully");
    setLoading(false);
  }

  // Handle update
  async function handleUpdate(id: string) {
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/workshops", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title: form.title,
          description: form.description,
          type: form.type,
          level: form.level,
          price: Number(form.price),
          maxParticipants: Number(form.maxParticipants),
          date: form.date,
          time: form.time,
          duration: form.duration,
          location: form.location,
          address: form.address,
          includes: form.includes,
          image: form.image,
          status: form.status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update");
        return;
      }

      const updated = data.workshop || data;
      setWorkshops((prev) => prev.map((w) => (w._id === id ? updated : w)));
      setSuccess("Workshop updated");
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || "Network error");
    }
  }

  // Handle delete
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this workshop?")) return;

    await fetch("/api/admin/workshops", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setWorkshops(workshops.filter((w) => w._id !== id));
    setSuccess("Workshop deleted");
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format date for input
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="text-soil/60 hover:text-clay">
          ← Admin Home
        </Link>
        <h1 className="text-3xl font-serif font-bold text-soil">Workshops</h1>
      </div>

      {/* ADD WORKSHOP FORM */}
      <form
        onSubmit={handleAdd}
        className="bg-white p-6 rounded-xl shadow-sm border space-y-4"
      >
        <h2 className="text-lg font-semibold text-soil mb-4">
          Add New Workshop
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            required
            className="border p-2 rounded"
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            required
            className="border p-2 rounded"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="border p-2 rounded"
          >
            {WORKSHOP_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            className="border p-2 rounded"
          >
            {WORKSHOP_LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="Price"
            required
            className="border p-2 rounded"
          />
          <input
            type="number"
            value={form.maxParticipants}
            onChange={(e) =>
              setForm({ ...form, maxParticipants: e.target.value })
            }
            placeholder="Max Participants"
            required
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
            className="border p-2 rounded"
          />
          <input
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            placeholder="10:00 AM - 1:00 PM"
            required
            className="border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            placeholder="3 hours"
            required
            className="border p-2 rounded"
          />
          <select
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="border p-2 rounded"
          >
            {WORKSHOP_LOCATIONS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Address (optional)"
            className="border p-2 rounded"
          />
          <input
            value={form.includes}
            onChange={(e) => setForm({ ...form, includes: e.target.value })}
            placeholder="Includes (comma separated)"
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Workshop Image
            </label>
            <UploadInput
              uploadPreset="products_unsigned"
              folder="workshops"
              onUploaded={(urls) => setForm({ ...form, image: urls[0] || "" })}
            />
          </div>
          {form.image && (
            <div className="relative">
              <img
                src={form.image}
                alt="Preview"
                className="h-16 w-16 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => setForm({ ...form, image: "" })}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
              >
                ×
              </button>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Add Workshop"}
          </button>
        </div>
      </form>

      {/* SEARCH BAR */}
      <div className="mb-4">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, type, or status..."
          className="border p-2 w-full max-w-md rounded-md"
        />
      </div>

      {/* WORKSHOP TABLE */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 text-soil/80 border-b">
              <tr>
                <th className="w-1/12 p-3 text-left font-semibold">Image</th>
                <th className="w-2/12 p-3 text-left font-semibold">Title</th>
                <th className="w-1/12 p-3 text-left font-semibold">Type</th>
                <th className="w-1/12 p-3 text-left font-semibold">Date</th>
                <th className="w-1/12 p-3 text-left font-semibold">Price</th>
                <th className="w-1/12 p-3 text-left font-semibold">Seats</th>
                <th className="w-1/12 p-3 text-left font-semibold">Status</th>
                <th className="w-2/12 p-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentWorkshops.map((w) => (
                <tr
                  key={w._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-3 align-middle">
                    {w.image ? (
                      <img
                        src={w.image}
                        className="w-12 h-12 object-cover rounded"
                        alt={w.title}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xl">
                        🎨
                      </div>
                    )}
                  </td>
                  <td className="p-3 align-middle break-words text-sm font-medium text-soil/90">
                    {w.title}
                  </td>
                  <td className="p-3 align-middle text-sm text-soil/70 capitalize">
                    {WORKSHOP_TYPES.find((t) => t.id === w.type)?.label ||
                      w.type}
                  </td>
                  <td className="p-3 align-middle text-sm text-soil/70">
                    {formatDate(w.date)}
                  </td>
                  <td className="p-3 align-middle text-sm text-soil/70">
                    ₹{w.price}
                  </td>
                  <td className="p-3 align-middle text-sm text-soil/70">
                    {w.enrolledCount || 0}/{w.maxParticipants}
                  </td>
                  <td className="p-3 align-middle">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        w.status === "upcoming"
                          ? "bg-green-100 text-green-700"
                          : w.status === "full"
                          ? "bg-orange-100 text-orange-700"
                          : w.status === "completed"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="p-3 align-middle text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingId(w._id);
                        setForm({
                          title: w.title || "",
                          description: w.description || "",
                          type: w.type || "group",
                          level: w.level || "all-levels",
                          price: w.price || "",
                          maxParticipants: w.maxParticipants || "",
                          date: formatDateForInput(w.date),
                          time: w.time || "",
                          duration: w.duration || "",
                          location: w.location || "studio",
                          address: w.address || "",
                          includes: Array.isArray(w.includes)
                            ? w.includes.join(", ")
                            : "",
                          image: w.image || "",
                          status: w.status || "upcoming",
                        });
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(w._id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredWorkshops.length === 0 && (
            <div className="text-center py-8 text-soil/50">
              No workshops found matching your search.
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredWorkshops.length > 0 && (
          <div className="bg-gray-50 p-3 border-t flex items-center justify-between">
            <div className="text-sm text-soil/60">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(startIndex + itemsPerPage, filteredWorkshops.length)}
              </span>{" "}
              of <span className="font-medium">{filteredWorkshops.length}</span>{" "}
              results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === page
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
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Edit Workshop</h3>
              <button
                onClick={() => setEditingId(null)}
                className="text-soil/60 hover:text-soil"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-soil mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="border p-2 w-full rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-soil mb-1">
                  Description
                </label>
                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-soil mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="border p-2 w-full rounded"
                >
                  {WORKSHOP_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-soil mb-1">Level</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="border p-2 w-full rounded"
                >
                  {WORKSHOP_LEVELS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-soil mb-1">Price</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="border p-2 w-full rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-soil mb-1">
                  Max Participants
                </label>
                <input
                  type="number"
                  value={form.maxParticipants}
                  onChange={(e) =>
                    setForm({ ...form, maxParticipants: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-soil mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="border p-2 w-full rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-soil mb-1">Time</label>
                <input
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="border p-2 w-full rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-soil mb-1">Duration</label>
                <input
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-soil mb-1">Location</label>
                <select
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                >
                  {WORKSHOP_LOCATIONS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-soil mb-1">Address</label>
                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-soil mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="border p-2 w-full rounded"
                >
                  {WORKSHOP_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-soil mb-1">
                  Includes (comma separated)
                </label>
                <input
                  value={form.includes}
                  onChange={(e) =>
                    setForm({ ...form, includes: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-soil mb-1">Image</label>
                <div className="flex gap-4 items-end">
                  {form.image && (
                    <div className="relative">
                      <img
                        src={form.image}
                        className="w-24 h-24 object-cover rounded"
                        alt="Preview"
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: "" })}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <UploadInput
                    uploadPreset="products_unsigned"
                    folder="workshops"
                    onUploaded={(urls) =>
                      setForm({ ...form, image: urls[0] || "" })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setEditingId(null)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => editingId && handleUpdate(editingId)}
                className="px-4 py-2 bg-clay text-white rounded hover:bg-clay/90"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
