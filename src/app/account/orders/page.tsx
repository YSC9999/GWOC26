"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Clock, CheckCircle, Truck, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  paymentStatus: string;
  discount: number;
  couponCode?: string;
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders"); // GET logic added
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "text-green-600 bg-green-50";
      case "shipped": return "text-blue-600 bg-blue-50";
      case "processing": return "text-orange-600 bg-orange-50";
      case "cancelled": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered": return <CheckCircle size={18} />;
      case "shipped": return <Truck size={18} />;
      case "processing": return <RefreshCw size={18} />;
      default: return <Clock size={18} />;
    }
  };

  if (loading) return <div className="text-center py-20">Loading orders...</div>;

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/account" className="text-soil/60 hover:text-clay">← Back</Link>
        <h1 className="text-3xl font-bold text-soil font-serif">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-sand/30 rounded-3xl p-12 text-center">
          <Package className="w-16 h-16 text-soil/20 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-soil mb-2">No orders yet</h2>
          <p className="text-soil/60 mb-6">Looks like you haven't bought anything yet.</p>
          <Link href="/products" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <div className="font-bold text-soil text-lg">{order.orderNumber}</div>
                    <div className="text-sm text-soil/60">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-bold text-soil">₹{order.total.toLocaleString()}</div>
                    <div className={`text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded inline-block mt-1 ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                  </div>
                  {expandedId === order._id ? <ChevronUp className="text-soil/40" /> : <ChevronDown className="text-soil/40" />}
                </div>
              </div>

              {/* Details */}
              {expandedId === order._id && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  className="px-6 pb-6 border-t border-gray-100 bg-gray-50/50"
                >
                  <div className="pt-6 space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 p-2 flex items-center justify-center text-2xl">
                          {item.image && item.image.startsWith("/") ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                          ) : (
                            "🏺"
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-soil">{item.name}</div>
                          <div className="text-sm text-soil/60">Qty: {item.quantity}</div>
                        </div>
                        <div className="font-medium text-soil">
                          ₹{item.price.toLocaleString()}
                        </div>
                      </div>
                    ))}

                    {/* Discount Row */}
                    {order.discount > 0 && (
                      <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-3 text-green-600">
                        <span>Discount {order.couponCode && <span className="text-xs bg-green-100 px-2 py-0.5 rounded ml-1 font-bold">{order.couponCode}</span>}</span>
                        <span>- ₹{order.discount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-sm font-medium">
                      <span>Payment Status</span>
                      <span className={order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-500 uppercase'}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
