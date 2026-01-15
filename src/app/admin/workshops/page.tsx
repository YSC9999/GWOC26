"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import UploadInput from "@/components/UploadInput";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import DatePicker from "@/components/admin/DatePicker";
import AdminPageContainer from "@/components/admin/AdminPageContainer";

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

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  groupSize: number;
  occasion: string;
  message: string;
  preferredDate?: string;
  createdAt: string;
}

interface PreviousWorkshop {
  _id: string;
  images: string[];
  description: string;
}

export default function WorkshopPage() {
  const [activeTab, setActiveTab] = useState<
    "workshops" | "inquiries" | "previous"
  >("workshops");

  // --- Workshop State ---
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WorkshopForm>(defaultForm);

  // --- Inquiry State ---
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  // --- Previous Workshops State ---
  const [previousWorkshops, setPreviousWorkshops] = useState<
    PreviousWorkshop[]
  >([]);
  const [pImages, setPImages] = useState<string[]>([]);
  const [pDescription, setPDescription] = useState("");
  const [pLoading, setPLoading] = useState(false);

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

  // Load data
  useEffect(() => {
    fetchWorkshops();
    fetchCategories();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch specialized data on tab change to avoid unnecessary calls
  useEffect(() => {
    if (activeTab === "inquiries") {
      fetchInquiries();
    } else if (activeTab === "previous") {
      fetchPreviousWorkshops();
    }
  }, [activeTab]);

  const fetchWorkshops = () => {
    fetch("/api/admin/workshops")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setWorkshops(data);
        } else {
          setWorkshops([]);
        }
      })
      .catch(() => setError("Failed to load workshops"));
  };

  const fetchCategories = () => {
    fetch("/api/admin/workshop-categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error("Failed to load categories", err));
  };

  const createCategory = async (name: string) => {
    try {
      const res = await fetch("/api/admin/workshop-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories((prev) => [...prev, data]);
        return data; // Return the new category
      } else {
        alert(data.error || "Failed to create category");
        return null;
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleDeleteCategory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch("/api/admin/workshop-categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c._id !== id));
      } else {
        alert("Failed to delete category");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const res = await fetch("/api/admin/workshops/inquiries");
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (err) {
      console.error("Failed to load inquiries", err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  const fetchPreviousWorkshops = async () => {
    try {
      const res = await fetch("/api/admin/previous-workshops");
      const data = await res.json();
      if (data.success) {
        setPreviousWorkshops(data.data);
      }
    } catch (error) {
      console.error("Error fetching previous workshops:", error);
    }
  };

  // Handle create workshop
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

  // Handle update workshop
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

  // Handle delete workshop
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

  // Handle delete inquiry
  async function handleDeleteInquiry(id: string) {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;

    try {
      const res = await fetch(`/api/admin/workshops/inquiries?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setInquiries(inquiries.filter((i) => i._id !== id));
        alert("Inquiry deleted");
      } else {
        alert("Failed to delete");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting inquiry");
    }
  }

  // Handle Add Previous Workshop
  const handleAddPreviousWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pImages.length === 0 || !pDescription) {
      alert("Please provide both images and description");
      return;
    }

    setPLoading(true);
    try {
      const res = await fetch("/api/admin/previous-workshops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: pImages, description: pDescription }),
      });
      const data = await res.json();

      if (data.success) {
        alert("Added successfully");
        setPImages([]);
        setPDescription("");
        fetchPreviousWorkshops();
      } else {
        alert("Failed to add workshop");
      }
    } catch (error) {
      console.error("Error creating workshop:", error);
      alert("Failed to add workshop");
    } finally {
      setPLoading(false);
    }
  };

  // Handle Delete Previous Workshop
  const handleDeletePreviousWorkshop = async (id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;

    try {
      const res = await fetch(`/api/admin/previous-workshops?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert("Deleted successfully");
        fetchPreviousWorkshops();
      }
    } catch (error) {
      console.error("Error deleting workshop:", error);
      alert("Failed to delete workshop");
    }
  };

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
    <AdminPageContainer title="Workshops">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg">
            {success}
          </div>
        )}

        {/* TABS */}
        <div className="flex overflow-x-auto gap-2 mb-8 border-b border-soil/10 no-scrollbar pb-1">
          <button
            onClick={() => setActiveTab("workshops")}
            className={`pb-4 px-3 font-medium transition-colors whitespace-nowrap text-sm ${
              activeTab === "workshops"
                ? "border-b-2 border-clay text-clay"
                : "text-soil/60 hover:text-soil"
            }`}
          >
            Manage Workshops
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`pb-4 px-3 font-medium transition-colors whitespace-nowrap text-sm ${
              activeTab === "inquiries"
                ? "border-b-2 border-clay text-clay"
                : "text-soil/60 hover:text-soil"
            }`}
          >
            Custom Inquiries
          </button>
          <button
            onClick={() => setActiveTab("previous")}
            className={`pb-4 px-3 font-medium transition-colors whitespace-nowrap text-sm ${
              activeTab === "previous"
                ? "border-b-2 border-clay text-clay"
                : "text-soil/60 hover:text-soil"
            }`}
          >
            Previous Workshops
          </button>
        </div>

        {/* --- WORKSHOPS TAB --- */}
        {activeTab === "workshops" && (
          <>
            {/* ADD WORKSHOP FORM */}
            <form
              onSubmit={handleAdd}
              className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border space-y-4"
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
                  className="border p-2 rounded text-base md:text-sm"
                />
                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Description"
                  required
                  className="border p-2 rounded text-base md:text-sm"
                />
                {/* CUSTOM TYPE DROPDOWN */}
                <div className="relative" ref={dropdownRef}>
                  <div
                    className="border p-2 rounded cursor-pointer flex justify-between items-center bg-white"
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === "add-type" ? null : "add-type"
                      )
                    }
                  >
                    <span className="capitalize text-gray-700">
                      {categories.find((c) => c.slug === form.type)?.name ||
                        WORKSHOP_TYPES.find((t) => t.id === form.type)?.label ||
                        "Select Type"}
                    </span>
                    <ChevronRight
                      size={16}
                      className={`transition-transform duration-200 ${
                        openDropdown === "add-type" ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                  {openDropdown === "add-type" && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-50 max-h-60 overflow-y-auto">
                      {categories.map((cat) => (
                        <div
                          key={cat._id}
                          className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center group"
                          onClick={() => {
                            setForm({ ...form, type: cat.slug });
                            setOpenDropdown(null);
                          }}
                        >
                          <span className="capitalize">{cat.name}</span>
                          <button
                            onClick={(e) => handleDeleteCategory(cat._id, e)}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <div
                        className="p-2 border-t text-blue-600 hover:bg-blue-50 cursor-pointer flex items-center gap-2 font-medium"
                        onClick={() => {
                          const newCat = prompt("Enter new category name:");
                          if (newCat) {
                            createCategory(newCat).then((cat) => {
                              if (cat) {
                                setForm({ ...form, type: cat.slug });
                                setOpenDropdown(null);
                              }
                            });
                          }
                        }}
                      >
                        <Plus size={14} /> Add New Category
                      </div>
                    </div>
                  )}
                </div>
                {/* CUSTOM LEVEL DROPDOWN */}
                <div className="relative">
                  <div
                    className="border p-2 rounded cursor-pointer flex justify-between items-center bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(
                        openDropdown === "add-level" ? null : "add-level"
                      );
                    }}
                  >
                    <span className="text-gray-700">
                      {WORKSHOP_LEVELS.find((l) => l.id === form.level)
                        ?.label || "Select Level"}
                    </span>
                    <ChevronRight
                      size={16}
                      className={`transition-transform duration-200 ${
                        openDropdown === "add-level" ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                  {openDropdown === "add-level" && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-50">
                      {WORKSHOP_LEVELS.map((level) => (
                        <div
                          key={level.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setForm({ ...form, level: level.id });
                            setOpenDropdown(null);
                          }}
                        >
                          {level.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="Price"
                  required
                  className="bg-sand/10 focus:bg-white/10 border border-soil/10 focus:border-clay/50 rounded-xl px-4 py-3 outline-none transition-all text-base md:text-sm text-soil shadow-sm placeholder:text-soil/30"
                />
                <input
                  type="number"
                  value={form.maxParticipants}
                  onChange={(e) =>
                    setForm({ ...form, maxParticipants: e.target.value })
                  }
                  placeholder="Max Participants"
                  required
                  className="bg-sand/10 focus:bg-white/10 border border-soil/10 focus:border-clay/50 rounded-xl px-4 py-3 outline-none transition-all text-base md:text-sm text-soil shadow-sm placeholder:text-soil/30"
                />
                <DatePicker
                  value={form.date}
                  onChange={(date) => setForm({ ...form, date })}
                  placeholder="Select Date"
                  className="border-none"
                />
                <input
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="10:00 AM - 1:00 PM"
                  required
                  className="bg-sand/10 focus:bg-white/10 border border-soil/10 focus:border-clay/50 rounded-xl px-4 py-3 outline-none transition-all text-base md:text-sm text-soil shadow-sm placeholder:text-soil/30"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  placeholder="3 hours"
                  required
                  className="border p-2 rounded text-base md:text-sm w-full"
                />
                {/* CUSTOM LOCATION DROPDOWN */}
                <div className="relative w-full">
                  <div
                    className="border p-2 rounded cursor-pointer flex justify-between items-center bg-white text-base md:text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(
                        openDropdown === "add-location" ? null : "add-location"
                      );
                    }}
                  >
                    <span className="text-gray-700">
                      {WORKSHOP_LOCATIONS.find((l) => l.id === form.location)
                        ?.label || "Select Location"}
                    </span>
                    <ChevronRight
                      size={16}
                      className={`transition-transform duration-200 ${
                        openDropdown === "add-location" ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                  {openDropdown === "add-location" && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-xl border border-soil/10 rounded-2xl shadow-2xl z-50">
                      {WORKSHOP_LOCATIONS.map((loc) => (
                        <div
                          key={loc.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer text-base md:text-sm"
                          onClick={() => {
                            setForm({ ...form, location: loc.id });
                            setOpenDropdown(null);
                          }}
                        >
                          {loc.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="Address (optional)"
                  className="bg-sand/10 focus:bg-white/10 border border-soil/10 focus:border-clay/50 rounded-xl px-4 py-3 outline-none transition-all text-base md:text-sm text-soil shadow-sm placeholder:text-soil/30"
                />
                <input
                  value={form.includes}
                  onChange={(e) =>
                    setForm({ ...form, includes: e.target.value })
                  }
                  placeholder="Includes (comma separated)"
                  className="bg-sand/10 focus:bg-white/10 border border-soil/10 focus:border-clay/50 rounded-xl px-4 py-3 outline-none transition-all text-base md:text-sm text-soil shadow-sm placeholder:text-soil/30"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workshop Image
                  </label>
                  <div className="min-w-0">
                    <UploadInput
                      uploadPreset="products_unsigned"
                      folder="workshops"
                      onUploaded={(urls) =>
                        setForm({ ...form, image: urls[0] || "" })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {form.image && (
                    <div className="relative shrink-0">
                      <img
                        src={form.image}
                        alt="Preview"
                        className="h-14 w-14 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: "" })}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50 inline-flex items-center justify-center gap-2 flex-1 sm:flex-none"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Plus size={18} />
                    )}
                    {loading ? "Creating..." : "Add Workshop"}
                  </button>
                </div>
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
                      <th className="w-1/12 p-3 text-left font-semibold">
                        Image
                      </th>
                      <th className="w-2/12 p-3 text-left font-semibold">
                        Title
                      </th>
                      <th className="w-1/12 p-3 text-left font-semibold">
                        Type
                      </th>
                      <th className="w-1/12 p-3 text-left font-semibold">
                        Date
                      </th>
                      <th className="w-1/12 p-3 text-left font-semibold">
                        Price
                      </th>
                      <th className="w-1/12 p-3 text-left font-semibold">
                        Seats
                      </th>
                      <th className="w-1/12 p-3 text-left font-semibold">
                        Status
                      </th>
                      <th className="w-2/12 p-3 text-right font-semibold">
                        Actions
                      </th>
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
                          {categories.find((c) => c.slug === w.type)?.name ||
                            WORKSHOP_TYPES.find((t) => t.id === w.type)
                              ?.label ||
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
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors inline-flex items-center gap-1"
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(w._id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors inline-flex items-center gap-1"
                          >
                            <Trash2 size={14} /> Delete
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
                <div className="bg-gray-50 p-4 border-t flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-soil/60 text-center md:text-left">
                    Showing{" "}
                    <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(
                        startIndex + itemsPerPage,
                        filteredWorkshops.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredWorkshops.length}
                    </span>{" "}
                    results
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      Previous
                    </button>
                    <div className="flex gap-1 overflow-x-auto max-w-[200px] md:max-w-none no-scrollbar">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-1 border rounded text-sm flex-shrink-0 ${
                              currentPage === page
                                ? "bg-black text-white"
                                : "hover:bg-gray-200"
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
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* --- INQUIRIES TAB --- */}
        {activeTab === "inquiries" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loadingInquiries ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-clay" />
              </div>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="text-4xl mb-4">📧</div>
                <h3 className="text-xl font-bold text-soil mb-2">
                  No Inquiries Yet
                </h3>
                <p className="text-soil/60">
                  Custom workshop inquiries will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-sand/30 text-soil/70 font-medium">
                    <tr>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Details</th>
                      <th className="p-4">Occasion / Message</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inquiries.map((inquiry) => (
                      <tr
                        key={inquiry._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 align-top">
                          <div className="font-bold text-soil">
                            {inquiry.name}
                          </div>
                          <div className="text-xs text-soil/60">
                            {inquiry.email}
                          </div>
                          <div className="text-xs text-soil/60">
                            {inquiry.phone}
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="text-sm">
                            <span className="font-semibold">Group Size:</span>{" "}
                            {inquiry.groupSize}
                          </div>
                          {inquiry.preferredDate && (
                            <div className="text-sm">
                              <span className="font-semibold">Pref. Date:</span>{" "}
                              {inquiry.preferredDate}
                            </div>
                          )}
                        </td>
                        <td className="p-4 align-top">
                          <div className="text-xs font-bold uppercase tracking-wide text-clay mb-1">
                            {inquiry.occasion}
                          </div>
                          <div className="text-sm text-soil/80 max-w-sm whitespace-pre-wrap">
                            {inquiry.message}
                          </div>
                        </td>
                        <td className="p-4 align-top text-sm text-soil/70">
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 align-top text-right">
                          <button
                            onClick={() => handleDeleteInquiry(inquiry._id)}
                            className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- PREVIOUS WORKSHOPS TAB --- */}
        {activeTab === "previous" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-semibold mb-4">Add New Entry</h2>
              <form onSubmit={handleAddPreviousWorkshop} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Images
                  </label>
                  <UploadInput
                    onUploaded={(urls) => setPImages(urls)}
                    folder="previous-workshops"
                  />
                  {pImages.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {pImages.map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20">
                          <img
                            src={img}
                            alt="Preview"
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={pDescription}
                    onChange={(e) => setPDescription(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={pLoading}
                  className="bg-clay text-white px-4 py-2 rounded hover:bg-clay/90 disabled:opacity-50"
                >
                  {pLoading ? "Adding..." : "Add Entry"}
                </button>
              </form>
            </div>

            <div className="grid gap-6">
              <h2 className="text-xl font-semibold">Existing Entries</h2>
              {previousWorkshops.map((workshop) => (
                <div
                  key={workshop._id}
                  className="bg-white p-4 rounded-lg shadow border flex flex-col md:flex-row gap-4"
                >
                  <div className="w-32 h-32 relative flex-shrink-0">
                    {workshop.images[0] && (
                      <img
                        src={workshop.images[0]}
                        alt="Workshop"
                        className="w-full h-full object-cover rounded"
                      />
                    )}
                    {workshop.images.length > 1 && (
                      <span className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
                        +{workshop.images.length - 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="whitespace-pre-wrap">
                      {workshop.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePreviousWorkshop(workshop._id)}
                    className="text-red-600 hover:text-red-800 self-start"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {previousWorkshops.length === 0 && (
                <p className="text-gray-500">
                  No previous workshops added yet.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Edit Modal (Only for Workshops) */}
        {editingId && activeTab === "workshops" && (
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
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
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
                  <div className="relative">
                    <div
                      className="border p-2 w-full rounded cursor-pointer flex justify-between items-center bg-white"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "edit-type" ? null : "edit-type"
                        )
                      }
                    >
                      <span className="capitalize text-gray-700">
                        {categories.find((c) => c.slug === form.type)?.name ||
                          WORKSHOP_TYPES.find((t) => t.id === form.type)
                            ?.label ||
                          form.type}
                      </span>
                      <ChevronRight
                        size={16}
                        className={`transition-transform duration-200 ${
                          openDropdown === "edit-type" ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                    {openDropdown === "edit-type" && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-50 max-h-60 overflow-y-auto">
                        {categories.map((cat) => (
                          <div
                            key={cat._id}
                            className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center group"
                            onClick={() => {
                              setForm({ ...form, type: cat.slug });
                              setOpenDropdown(null);
                            }}
                          >
                            <span className="capitalize">{cat.name}</span>
                            <button
                              onClick={(e) => handleDeleteCategory(cat._id, e)}
                              className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <div
                          className="p-2 border-t text-blue-600 hover:bg-blue-50 cursor-pointer flex items-center gap-2 font-medium"
                          onClick={() => {
                            const newCat = prompt("Enter new category name:");
                            if (newCat) {
                              createCategory(newCat).then((cat) => {
                                if (cat) {
                                  setForm({ ...form, type: cat.slug });
                                  setOpenDropdown(null);
                                }
                              });
                            }
                          }}
                        >
                          <Plus size={14} /> Add New Category
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-soil mb-1">Level</label>
                  {/* CUSTOM LEVEL DROPDOWN (EDIT) */}
                  <div className="relative">
                    <div
                      className="border p-2 w-full rounded cursor-pointer flex justify-between items-center bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(
                          openDropdown === "edit-level" ? null : "edit-level"
                        );
                      }}
                    >
                      <span className="text-gray-700">
                        {WORKSHOP_LEVELS.find((l) => l.id === form.level)
                          ?.label || form.level}
                      </span>
                      <ChevronRight
                        size={16}
                        className={`transition-transform duration-200 ${
                          openDropdown === "edit-level" ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                    {openDropdown === "edit-level" && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-50">
                        {WORKSHOP_LEVELS.map((level) => (
                          <div
                            key={level.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setForm({ ...form, level: level.id });
                              setOpenDropdown(null);
                            }}
                          >
                            {level.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-soil mb-1">Price</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
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
                  <label className="block text-sm text-soil mb-1">
                    Duration
                  </label>
                  <input
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                    className="border p-2 w-full rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm text-soil mb-1">
                    Location
                  </label>
                  {/* CUSTOM LOCATION DROPDOWN (EDIT) */}
                  <div className="relative">
                    <div
                      className="border p-2 w-full rounded cursor-pointer flex justify-between items-center bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(
                          openDropdown === "edit-location"
                            ? null
                            : "edit-location"
                        );
                      }}
                    >
                      <span className="text-gray-700">
                        {WORKSHOP_LOCATIONS.find((l) => l.id === form.location)
                          ?.label || form.location}
                      </span>
                      <ChevronRight
                        size={16}
                        className={`transition-transform duration-200 ${
                          openDropdown === "edit-location" ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                    {openDropdown === "edit-location" && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-50">
                        {WORKSHOP_LOCATIONS.map((loc) => (
                          <div
                            key={loc.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setForm({ ...form, location: loc.id });
                              setOpenDropdown(null);
                            }}
                          >
                            {loc.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-soil mb-1">
                    Address
                  </label>
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
                  {/* CUSTOM STATUS DROPDOWN (EDIT) */}
                  <div className="relative">
                    <div
                      className="border p-2 w-full rounded cursor-pointer flex justify-between items-center bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(
                          openDropdown === "edit-status" ? null : "edit-status"
                        );
                      }}
                    >
                      <span className="text-gray-700">
                        {WORKSHOP_STATUSES.find((s) => s.id === form.status)
                          ?.label || form.status}
                      </span>
                      <ChevronRight
                        size={16}
                        className={`transition-transform duration-200 ${
                          openDropdown === "edit-status" ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                    {openDropdown === "edit-status" && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-50">
                        {WORKSHOP_STATUSES.map((status) => (
                          <div
                            key={status.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setForm({ ...form, status: status.id });
                              setOpenDropdown(null);
                            }}
                          >
                            {status.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
    </AdminPageContainer>
  );
}
