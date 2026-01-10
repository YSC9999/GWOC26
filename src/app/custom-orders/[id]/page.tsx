"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function CustomOrderDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRequest(); }, []);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/custom-orders/user`);
      if (res.ok) {
        const data = await res.json();
        const found = (data.requests || []).find((r: any) => r._id === id);
        setRequest(found);
      }
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const acceptQuote = async () => {
    if (!confirm('Add quoted items to cart and proceed to checkout?')) return;
    const res = await fetch(`/api/custom-orders/${id}/accept`, { method: 'POST' });
    if (!res.ok) return alert('Failed to accept');
    const data = await res.json();

    // Add items to client cart and redirect to checkout flow
    // Items format: { id, name, price, qty }
    const cartItems = data.items;
    const existing = window.localStorage.getItem('basho-cart');
    let cart = existing ? JSON.parse(existing) : { state: { items: [] } };
    cart.state.items = cart.state.items.concat(cartItems);
    window.localStorage.setItem('basho-cart', JSON.stringify(cart));

    // Redirect to cart page
    window.location.href = '/cart';
  };

  if (loading) return <div className="py-20 text-center">Loading…</div>;
  if (!request) return <div className="py-20 text-center">Not found</div>;

  return (
    <div className="min-h-screen py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/custom-orders" className="text-soil/60 hover:text-clay">← Back</Link>
        <h1 className="text-3xl font-bold text-soil font-serif">Request Details</h1>
      </div>

      <div className="bg-white rounded-2xl p-6">
        <div className="space-y-4">
          {request.requestedItems.map((it: any, idx: number) => (
            <div key={idx} className="border-t pt-4">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 overflow-hidden">
                  {it.images && it.images[0] ? <img src={it.images[0]} className="w-full h-full object-cover" /> : '🏺'}
                </div>

                <div className="flex-1">
                  <div className="font-semibold text-soil">{it.name}</div>
                  <div className="text-sm text-soil/60">{it.description}</div>

                  {it.removed ? (
                    <div className="mt-2 p-3 bg-red-50 text-red-700 rounded">Removed by admin: {it.removedReason || 'No reason provided'}</div>
                  ) : (
                    <div className="mt-2">
                      <div className="text-sm">Qty: {it.requestedQty}</div>
                      <div className="text-sm">Price: ₹{it.adminPrice ?? '—'}</div>
                      <div className="text-sm">Dimensions: {it.dimensions ?? '—'}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {request.status === 'quoted' && (
            <div className="mt-4">
              <button className="btn-primary" onClick={acceptQuote}>Accept & Add to Cart</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}