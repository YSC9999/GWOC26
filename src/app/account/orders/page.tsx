"use client";
import React, { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, Truck, RefreshCw } from "lucide-react";
import Link from "next/link";
import OrderModal from "@/components/OrderModal";

interface Order {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  items: any[];
  paymentStatus: string;
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
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
            <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
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
                    <div className={`text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded inline-block mt-1 ${order.status === 'cancelled' || order.paymentStatus === 'refunded' ? 'text-red-600 bg-red-50' : getStatusColor(order.status)}`}>
                      {order.status === 'cancelled' || order.paymentStatus === 'refunded' ? 'CANCELLED' : order.status}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
