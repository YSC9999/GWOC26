"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

import OrderModal from "@/components/admin/OrderModal";
import AdminPageContainer from "@/components/admin/AdminPageContainer";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
  productId?: { tags?: string[] };
}

interface Order {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  paymentStatus: string;
  userId?: { name?: string; email?: string } | string;
  discount: number;
  couponCode?: string;
  // Extended fields
  email?: string;
  shippingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    phone?: string;
  };
  paymentMethod?: string;
  razorpayPaymentId?: string;
  customerNotes?: string;
}

export default function AdminOrdersPage() {
  /* ... inside AdminOrdersPage ... */
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [sortBy, setSortBy] = useState("newest");

  // Filter orders based on search
  const filteredOrders = useMemo(() => {
    let result = searchTerm
      ? orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof o.userId === "object" &&
            o.userId &&
            "name" in o.userId &&
            o.userId.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (o.email && o.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      : [...orders];

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "amount-high") return b.total - a.total;
      if (sortBy === "amount-low") return a.total - b.total;
      return 0;
    });

    return result;
  }, [orders, searchTerm, sortBy]);


  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  const fetchOrders = async (background = false) => {
    if (!background) setLoading(true);
    try {
      // Add timestamp to prevent caching
      const res = await fetch(`/api/admin/orders?t=${Date.now()}`, {
        cache: "no-store",
        headers: { Pragma: "no-cache" },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Orders refreshed:", data.orders?.length);
        setOrders(data.orders || []);
      } else {
        const err = await res.json().catch(() => ({}));
        console.error("Failed to fetch orders:", err.error);
        alert(`Failed to refresh orders: ${err.error || "Server Error"}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Network Error refreshing orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const stageChecked = (status: string) => ({
    confirmed: ["confirmed", "processing", "shipped", "delivered"].includes(
      status
    ),
    shipped: ["shipped", "delivered"].includes(status),
    delivered: status === "delivered",
  });

  const updateOrderStatus = async (id: string, newStatus: string) => {
    setSaving(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => (o._id === id ? data.order : o)));
      } else {
        const data = await res.json().catch(() => ({}));
        console.error("Update failed", data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const handleCheckboxChange = (
    order: Order,
    stage: "confirmed" | "shipped" | "delivered",
    checked: boolean
  ) => {
    // Determine new status based on checked boxes
    const confirmed =
      stage === "confirmed" ? checked : stageChecked(order.status).confirmed;
    const shipped =
      stage === "shipped" ? checked : stageChecked(order.status).shipped;
    const delivered =
      stage === "delivered" ? checked : stageChecked(order.status).delivered;

    let newStatus = "pending";
    if (delivered) newStatus = "delivered";
    else if (shipped) newStatus = "shipped";
    else if (confirmed) newStatus = "confirmed";

    updateOrderStatus(order._id, newStatus);
  };

  /* ... */

  if (loading)
    return <div className="py-20 text-center">Loading orders...</div>;

  const selectedOrder = orders.find((o) => o._id === selectedOrderId);

  return (
    <AdminPageContainer title="Orders">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 mb-8">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border-soil/10 focus:bg-white/10 focus:ring-4 focus:ring-clay/5 rounded-xl px-4 py-3 bg-sand/10 backdrop-blur-sm w-full md:w-auto text-soil cursor-pointer outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount-high">Amount High-Low</option>
            <option value="amount-low">Amount Low-High</option>
          </select>

          <input
            type="text"
            placeholder="Search by Order ID, Name or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-soil/10 focus:bg-white/10 focus:ring-4 focus:ring-clay/5 rounded-xl px-4 py-3 bg-sand/10 backdrop-blur-sm w-full md:w-80 text-soil placeholder:text-soil/30 transition-all outline-none"
          />
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
            <h2 className="text-xl font-bold text-soil mb-2">No orders yet</h2>
            <p className="text-soil/60">No orders found.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentOrders.map((order) => {
                const checked = stageChecked(order.status);
                const isCustomOrder = order.items.some((item) =>
                  item.productId?.tags?.includes("custom")
                );

                return (
                  <div
                    key={order._id}
                    className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                      onClick={() => setSelectedOrderId(order._id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-slate-50 text-slate-400 rounded-full group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors">
                            <span className="text-xs">👁️</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            {" "}
                            {/* min-w-0 required for text truncation/wrap in flex child */}
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                              <span className="font-bold text-lg text-soil break-all">
                                {order.orderNumber}
                              </span>
                              <span className="text-xs text-soil/50 bg-sand/30 px-2 py-1 rounded-full w-fit">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-sm text-soil/70 break-words">
                              {typeof order.userId === "object"
                                ? order.userId?.name
                                : "Guest User"}
                              {order.email && (
                                <span className="text-soil/40 ml-2 text-xs break-all hidden sm:inline">
                                  ({order.email})
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-soil/70 mt-1 sm:hidden break-all text-xs">
                              {order.email}
                            </div>
                          </div>
                          {isCustomOrder && (
                            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-bold">
                              Custom
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-soil/60 ml-10">
                          {order.userId && typeof order.userId !== "string"
                            ? order.userId.name
                            : "Guest"}
                          <span className="mx-2">•</span>
                          {order.items.length} Items
                        </div>
                        <div className="text-xs text-soil/40 mt-1 ml-10">
                          Placed on {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div
                        className="flex flex-wrap items-center justify-between gap-4 w-full md:w-auto mt-4 md:mt-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {order.status !== "cancelled" ? (
                          <div className="flex flex-wrap items-center gap-3 bg-slate-50/50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={checked.confirmed}
                                onChange={(e) =>
                                  handleCheckboxChange(
                                    order,
                                    "confirmed",
                                    e.target.checked
                                  )
                                }
                                className="rounded text-clay focus:ring-clay"
                              />
                              <span>Confirmed</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={checked.shipped}
                                onChange={(e) =>
                                  handleCheckboxChange(
                                    order,
                                    "shipped",
                                    e.target.checked
                                  )
                                }
                                className="rounded text-clay focus:ring-clay"
                              />
                              <span>Shipped</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={checked.delivered}
                                onChange={(e) =>
                                  handleCheckboxChange(
                                    order,
                                    "delivered",
                                    e.target.checked
                                  )
                                }
                                className="rounded text-clay focus:ring-clay"
                              />
                              <span>Delivered</span>
                            </label>
                          </div>
                        ) : (
                          <div className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-100 text-xs font-bold uppercase">
                            Cancelled
                          </div>
                        )}

                        <div className="text-right min-w-[100px]">
                          <div className="font-bold text-soil text-lg">
                            ₹{order.total.toLocaleString()}
                          </div>
                          <div
                            className={`text-xs font-bold uppercase tracking-wider ${order.paymentStatus === "paid"
                              ? "text-green-600"
                              : "text-amber-500"
                              }`}
                          >
                            {order.paymentStatus}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm text-soil/60">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, filteredOrders.length)}{" "}
                  of {filteredOrders.length} orders
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
                        className={`px-3 py-1 rounded-lg font-medium transition-colors ${page === currentPage
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

        {/* Modal */}
        {selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => {
              setSelectedOrderId(null);
              fetchOrders(true);
            }}
            onUpdate={(updatedOrder?: any) => {
              if (updatedOrder) {
                setOrders((prev) =>
                  prev.map((o) =>
                    o._id === updatedOrder._id ? updatedOrder : o
                  )
                );
              }
              // Still fetch in background to be safe
              fetchOrders(true);
            }}
          />
        )}
      </div>
    </AdminPageContainer>
  );
}
