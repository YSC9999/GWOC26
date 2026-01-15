"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import UploadInput from "@/components/UploadInput";
import AdminPageContainer from "@/components/admin/AdminPageContainer";

interface CustomOrder {
  _id: string;
  name: string;
  email: string;
  description: string;
  status: string;
  totalPrice?: number;
  createdAt: string;
}

interface PreviousCustomOrder {
  _id: string;
  images: string[];
  description: string;
}

export default function AdminCustomOrdersPage() {
  const [activeTab, setActiveTab] = useState<"requests" | "previous">(
    "requests"
  );

  // Requests State
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Previous Orders State
  const [previousOrders, setPreviousOrders] = useState<PreviousCustomOrder[]>(
    []
  );
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [loadingPrevious, setLoadingPrevious] = useState(false);

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = orders.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchPreviousOrders();
  }, []);

  const fetchOrders = async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch("/api/admin/custom-orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchPreviousOrders = async () => {
    try {
      const res = await fetch("/api/previous-custom-orders");
      const data = await res.json();
      if (data.success) {
        setPreviousOrders(data.data);
      }
    } catch (error) {
      console.error("Error fetching previous orders:", error);
    }
  };

  const handleAddPreviousOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0 || !description) {
      alert("Please provide both images and description");
      return;
    }

    setLoadingPrevious(true);
    try {
      const res = await fetch("/api/admin/previous-custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, description }),
      });
      const data = await res.json();

      if (data.success) {
        alert("Added successfully");
        setImages([]);
        setDescription("");
        fetchPreviousOrders();
      } else {
        alert("Failed to add order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to add order");
    } finally {
      setLoadingPrevious(false);
    }
  };

  const handleDeletePreviousOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;

    try {
      const res = await fetch(`/api/admin/previous-custom-orders?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert("Deleted successfully");
        fetchPreviousOrders();
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "quoted":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-purple-100 text-purple-800";
      case "in_progress":
        return "bg-indigo-100 text-indigo-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this specific custom order request?"
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/custom-orders/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Order request deleted successfully");
        fetchOrders();
      } else {
        alert("Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order");
    }
  };

  return (
    <AdminPageContainer title="Custom Orders">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("requests")}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === "requests"
                ? "border-b-2 border-clay text-clay"
                : "text-soil/60 hover:text-soil"
            }`}
          >
            Customer Requests
          </button>
          <button
            onClick={() => setActiveTab("previous")}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === "previous"
                ? "border-b-2 border-clay text-clay"
                : "text-soil/60 hover:text-soil"
            }`}
          >
            Manage Previous Works
          </button>
        </div>

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <>
            {loadingRequests ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-sand/30 rounded-3xl p-12 text-center">
                <h2 className="text-xl font-bold text-soil mb-2">
                  No custom requests
                </h2>
                <p className="text-soil/60">
                  Wait for customers to submit requests.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-sand/30 text-soil/70 font-medium">
                      <tr>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Request</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Total</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentOrders.map((order) => (
                        <tr
                          key={order._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="font-bold text-soil">
                              {order.name}
                            </div>
                            <div className="text-xs text-soil/60">
                              {order.email}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-soil max-w-xs truncate">
                              {order.description}
                            </div>
                          </td>
                          <td className="p-4 text-sm text-soil/70">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-soil">
                            {order.totalPrice
                              ? `₹${order.totalPrice.toLocaleString()}`
                              : "-"}
                          </td>
                          <td className="p-4 text-right flex gap-2 justify-end">
                            <Link
                              href={`/admin/custom-orders/${order._id}`}
                              className="inline-block px-4 py-2 bg-clay text-white text-sm rounded-lg hover:bg-clay/90"
                            >
                              Manage
                            </Link>
                            <button
                              onClick={() => handleDeleteRequest(order._id)}
                              className="px-4 py-2 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm text-soil/60">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(startIndex + itemsPerPage, orders.length)} of{" "}
                      {orders.length} orders
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-sand/30 hover:bg-sand/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                              page === currentPage
                                ? "bg-clay text-white"
                                : "bg-sand/30 hover:bg-sand/50 text-soil"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg bg-sand/30 hover:bg-sand/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Previous Orders Tab */}
        {activeTab === "previous" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-semibold mb-4">Add New Entry</h2>
              <form onSubmit={handleAddPreviousOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Images
                  </label>
                  <UploadInput
                    onUploaded={(urls) => setImages(urls)}
                    folder="previous-custom-orders"
                  />
                  {images.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {images.map((img, idx) => (
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-base md:text-sm"
                    rows={4}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingPrevious}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingPrevious ? "Adding..." : "Add Entry"}
                </button>
              </form>
            </div>

            <div className="grid gap-6">
              <h2 className="text-xl font-semibold">Existing Entries</h2>
              {previousOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white p-4 rounded-lg shadow border flex flex-col md:flex-row gap-4"
                >
                  <div className="w-32 h-32 relative flex-shrink-0">
                    {order.images[0] && (
                      <img
                        src={order.images[0]}
                        alt="Order"
                        className="w-full h-full object-cover rounded"
                      />
                    )}
                    {order.images.length > 1 && (
                      <span className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
                        +{order.images.length - 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="whitespace-pre-wrap">{order.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeletePreviousOrder(order._id)}
                    className="text-red-600 hover:text-red-800 self-start"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {previousOrders.length === 0 && (
                <p className="text-gray-500">No previous orders added yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminPageContainer>
  );
}
