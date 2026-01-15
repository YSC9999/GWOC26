"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

import OrderModal from "@/components/admin/OrderModal";

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

  useEffect(() => {
    fetchOrders();
  }, []);

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

  if (loading)
    return <div className="py-20 text-center">Loading orders...</div>;

  const selectedOrder = orders.find((o) => o._id === selectedOrderId);

  return (
    <div className="min-h-screen py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-soil/60 hover:text-clay">
          ← Admin Home
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-soil font-serif">
          Orders
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-sand/30 rounded-3xl p-12 text-center">
          <h2 className="text-xl font-bold text-soil mb-2">No orders yet</h2>
          <p className="text-soil/60">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const checked = stageChecked(order.status);
            const isCustomOrder = order.items.some((item) =>
              item.productId?.tags?.includes("custom")
            );

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow group"
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
                      <div className="font-bold text-soil text-lg group-hover:text-clay transition-colors">
                        {order.orderNumber}
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
                    className="flex items-center gap-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {order.status !== "cancelled" ? (
                      <div className="flex flex-wrap items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
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
                        className={`text-xs font-bold uppercase tracking-wider ${
                          order.paymentStatus === "paid"
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
                prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
              );
            }
            // Still fetch in background to be safe
            fetchOrders(true);
          }}
        />
      )}
    </div>
  );
}
