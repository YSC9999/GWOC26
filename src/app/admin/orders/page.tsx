"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

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
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('Failed to fetch orders:', err.error);
        alert(`Failed to fetch orders: ${err.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stageChecked = (status: string) => ({
    confirmed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(status),
    shipped: ['shipped', 'delivered'].includes(status),
    delivered: status === 'delivered'
  });

  const updateOrderStatus = async (id: string, newStatus: string) => {
    setSaving(id);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => (o._id === id ? data.order : o)));
      } else {
        const data = await res.json().catch(() => ({}));
        console.error('Update failed', data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const handleCheckboxChange = (order: Order, stage: 'confirmed' | 'shipped' | 'delivered', checked: boolean) => {
    // Determine new status based on checked boxes
    const confirmed = stage === 'confirmed' ? checked : stageChecked(order.status).confirmed;
    const shipped = stage === 'shipped' ? checked : stageChecked(order.status).shipped;
    const delivered = stage === 'delivered' ? checked : stageChecked(order.status).delivered;

    let newStatus = 'pending';
    if (delivered) newStatus = 'delivered';
    else if (shipped) newStatus = 'shipped';
    else if (confirmed) newStatus = 'confirmed';

    updateOrderStatus(order._id, newStatus);
  };

  if (loading) return <div className="py-20 text-center">Loading orders...</div>;

  return (
    <div className="min-h-screen py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-soil/60 hover:text-clay">← Admin Home</Link>
        <h1 className="text-3xl font-bold text-soil font-serif">Orders</h1>
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
            const isCustomOrder = order.items.some(item => item.productId?.tags?.includes('custom'));

            return (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-soil">{order.orderNumber}</div>
                    {isCustomOrder && (
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-bold">
                        Custom Request
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-soil/60">{order.userId && typeof order.userId !== 'string' ? `${order.userId.name || ''} • ${order.userId.email || ''}` : ''}</div>
                  <div className="text-sm text-soil/70 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <input type="checkbox" checked={checked.confirmed} onChange={(e) => handleCheckboxChange(order, 'confirmed', e.target.checked)} className="rounded text-clay focus:ring-clay" />
                      <span>Confirmed</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <input type="checkbox" checked={checked.shipped} onChange={(e) => handleCheckboxChange(order, 'shipped', e.target.checked)} className="rounded text-clay focus:ring-clay" />
                      <span>Shipped</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <input type="checkbox" checked={checked.delivered} onChange={(e) => handleCheckboxChange(order, 'delivered', e.target.checked)} className="rounded text-clay focus:ring-clay" />
                      <span>Delivered</span>
                    </label>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-soil">₹{order.total.toLocaleString()}</div>
                    <div className="text-xs text-soil/60">{order.paymentStatus}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}