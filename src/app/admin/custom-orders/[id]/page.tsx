"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Trash2, Plus, Save, Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface CustomOrderItem {
  _id?: string;
  name: string;
  description?: string;
  quantity: number;
  price?: number;
  removalReason?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface CustomOrder {
  _id: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  budget: string;
  referenceImages: string[];
  productType: string;
  quantity: number;
  material: string;
  glazePreference: string[];
  dimensions: { height: string; width: string; depth: string };
  colorPreferences: string;
  specialRequirements: string;
  timeline: string;
  items: CustomOrderItem[];
  status: string;
  totalPrice?: number;
  createdAt: string;
  adminNotes?: string;
}

export default function AdminCustomOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<CustomOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<CustomOrderItem[]>([]);
  const router = useRouter();

  // New Item State
  const [newItem, setNewItem] = useState({ name: "", quantity: 1, price: 0 });

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/admin/custom-orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.name) return;
    setItems([...items, { ...newItem, status: 'approved' }]);
    setNewItem({ name: "", quantity: 1, price: 0 });
  };

  const handleRemoveItem = (index: number) => {
    const reason = prompt("Enter reason for removal (e.g., 'Out of stock', 'Cannot make'):");
    if (!reason) return;

    const updatedItems = [...items];
    updatedItems[index].status = 'rejected';
    updatedItems[index].removalReason = reason;
    setItems(updatedItems);
  };

  const handleUpdateItem = (index: number, field: keyof CustomOrderItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      if (item.status === 'approved') {
        return sum + (item.price || 0) * item.quantity;
      }
      return sum;
    }, 0);
  };

  const saveOrder = async (newStatus?: string) => {
    setSaving(true);
    try {
      const { id } = await params;
      const totalPrice = calculateTotal();

      const res = await fetch(`/api/admin/custom-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          totalPrice,
          status: newStatus || order?.status
        })
      });

      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        alert(newStatus === 'quoted' ? "Quote sent to user!" : "Changes saved!");
        if (newStatus === 'quoted') router.push('/admin/custom-orders');
      } else {
        alert("Failed to save");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!order) return <div className="p-12 text-center">Order not found</div>;

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/custom-orders" className="text-soil/60 hover:text-clay">← Back</Link>
          <h1 className="text-3xl font-bold text-soil font-serif">Manage Request</h1>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => saveOrder()}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 border-2 border-clay text-clay rounded-full hover:bg-clay hover:text-white transition-colors"
          >
            <Save size={18} /> Save Draft
          </button>
          <button
            onClick={() => saveOrder('quoted')}
            disabled={saving || items.filter(i => i.status === 'approved').length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-clay text-white rounded-full hover:bg-clay/90 transition-colors disabled:opacity-50"
          >
            <Send size={18} /> Send Quote
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Info */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-soil mb-4">Customer Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-soil/50 uppercase">Name</label>
                <div className="font-medium text-soil">{order.name}</div>
              </div>
              <div>
                <label className="text-xs text-soil/50 uppercase">Email</label>
                <div className="font-medium text-soil">{order.email}</div>
              </div>
              <div>
                <label className="text-xs text-soil/50 uppercase">Phone</label>
                <div className="font-medium text-soil">{order.phone}</div>
              </div>
              <div>
                <label className="text-xs text-soil/50 uppercase">Budget</label>
                <div className="font-medium text-soil">{order.budget}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-soil mb-4">Request Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-soil/50 uppercase block">Product</label>
                <span className="font-medium text-soil">{order.productType}</span>
              </div>
              <div>
                <label className="text-xs text-soil/50 uppercase block">Material</label>
                <span className="font-medium text-soil">{order.material}</span>
              </div>
              <div>
                <label className="text-xs text-soil/50 uppercase block">Quantity</label>
                <span className="font-medium text-soil">{order.quantity}</span>
              </div>
              {order.dimensions && (
                <div>
                  <label className="text-xs text-soil/50 uppercase block">Dimensions</label>
                  <span className="font-medium text-soil">
                    {order.dimensions.height} x {order.dimensions.width} x {order.dimensions.depth} cm
                  </span>
                </div>
              )}
              {order.glazePreference?.length > 0 && (
                <div>
                  <label className="text-xs text-soil/50 uppercase block">Finishes</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {order.glazePreference.map(g => (
                      <span key={g} className="text-xs bg-gray-100 px-2 py-1 rounded">{g}</span>
                    ))}
                  </div>
                </div>
              )}
              {order.colorPreferences && (
                <div>
                  <label className="text-xs text-soil/50 uppercase block">Colors</label>
                  <p className="text-sm text-soil/80">{order.colorPreferences}</p>
                </div>
              )}
              {order.specialRequirements && (
                <div>
                  <label className="text-xs text-soil/50 uppercase block">Special Req.</label>
                  <p className="text-sm text-soil/80">{order.specialRequirements}</p>
                </div>
              )}
              {order.timeline && (
                <div>
                  <label className="text-xs text-soil/50 uppercase block">Timeline</label>
                  <span className="font-medium text-soil">{order.timeline}</span>
                </div>
              )}
              {order.referenceImages?.length > 0 && (
                <div>
                  <label className="text-xs text-soil/50 uppercase block mb-2">References</label>
                  <div className="grid grid-cols-3 gap-2">
                    {order.referenceImages.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block aspect-square relative hover:opacity-80 transition-opacity">
                        <img src={img} alt="ref" className="w-full h-full object-cover rounded-lg border border-gray-100" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-soil">Order Items</h2>
              <div className="text-xl font-bold text-clay">
                Total: ₹{calculateTotal().toLocaleString()}
              </div>
            </div>

            {/* List Items */}
            <div className="space-y-4 mb-8">
              {items.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${item.status === 'rejected' ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'} flex gap-4 items-start`}>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Item Name</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1"
                        disabled={item.status === 'rejected'}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(idx, 'quantity', parseInt(e.target.value))}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1"
                        disabled={item.status === 'rejected'}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Price (₹)</label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleUpdateItem(idx, 'price', parseInt(e.target.value))}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1"
                        disabled={item.status === 'rejected'}
                      />
                    </div>
                  </div>

                  <div>
                    {item.status !== 'rejected' ? (
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Remove Item"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <div className="text-xs text-red-600 font-medium">
                        Removed: {item.removalReason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Item */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-bold text-soil mb-4 uppercase">Add Item</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Item Name</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g. Dinner Plate"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Quantity</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Price (₹)</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <button
                onClick={handleAddItem}
                disabled={!newItem.name}
                className="mt-4 flex items-center gap-2 text-sm font-bold text-clay hover:text-clay/80"
              >
                <Plus size={16} /> Add to Order
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}