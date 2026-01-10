"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface CustomOrder {
  _id: string;
  name: string;
  email: string;
  description: string;
  status: string;
  totalPrice?: number;
  createdAt: string;
}

export default function AdminCustomOrdersPage() {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/custom-orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen py-12 px-4 md:px-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-soil/60 hover:text-clay">← Admin Home</Link>
          <h1 className="text-3xl font-bold text-soil font-serif">Custom Orders</h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-sand/30 rounded-3xl p-12 text-center">
          <h2 className="text-xl font-bold text-soil mb-2">No custom requests</h2>
          <p className="text-soil/60">Wait for customers to submit requests.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-soil">{order.name}</div>
                    <div className="text-xs text-soil/60">{order.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-soil max-w-xs truncate">{order.description}</div>
                  </td>
                  <td className="p-4 text-sm text-soil/70">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-soil">
                    {order.totalPrice ? `₹${order.totalPrice.toLocaleString()}` : '-'}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/custom-orders/${order._id}`}
                      className="inline-block px-4 py-2 bg-clay text-white text-sm rounded-lg hover:bg-clay/90"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}