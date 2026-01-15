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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    if (orderId && orders.length > 0) {
      const order = orders.find(o => o._id === orderId);
      if (order) setSelectedOrder(order);
    }
  }, [orders]);

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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-soil font-serif">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-sand/30 shadow-sm">
          <Package className="w-16 h-16 text-soil/20 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-soil mb-2">No orders yet</h2>
          <p className="text-soil/60 mb-6 font-medium">Looks like you haven't bought anything yet.</p>
          <Link href="/products" className="inline-block bg-brick text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-brick/20 transition-all">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-3xl shadow-sm border border-sand/30 overflow-hidden hover:shadow-md transition-shadow">
              <div
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getStatusColor(order.status)} bg-opacity-10`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <div className="font-bold text-soil text-lg">{order.orderNumber}</div>
                    <div className="text-xs font-medium text-soil/40 uppercase tracking-widest">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-bold text-soil text-lg">₹{order.total.toLocaleString()}</div>
                    <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mt-2 ${order.status === 'cancelled' || order.paymentStatus === 'refunded' ? 'text-red-500 bg-red-50' : getStatusColor(order.status)}`}>
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
