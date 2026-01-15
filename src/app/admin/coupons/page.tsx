"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Plus, Calendar, Tag, ArrowLeft } from "lucide-react";
import DatePicker from "@/components/admin/DatePicker";

interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  maxDiscountAmount?: number;
  usageLimit?: number;
  isDeleted?: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: "",
    validFromDate: "",
    validFromTime: "",
    validToDate: "",
    validToTime: "",
    maxDiscountAmount: "",
    usageLimit: "1",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (data.coupons) setCoupons(data.coupons);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const validFrom = `${formData.validFromDate}T${formData.validFromTime}`;
      const validTo = `${formData.validToDate}T${formData.validToTime}`;

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          validFrom,
          validTo,
          discountPercentage: Number(formData.discountPercentage),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCoupons([data.coupon, ...coupons]);
        setFormData({
          code: "",
          discountPercentage: "",
          validFromDate: "",
          validFromTime: "",
          validToDate: "",
          validToTime: "",
          maxDiscountAmount: "",
          usageLimit: "1",
        });
        alert("Coupon created successfully!");
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        // Soft delete: Find and update the coupon in state instead of filtering it out
        setCoupons(
          coupons.map((c) =>
            c._id === id ? { ...c, isDeleted: true, isActive: false } : c
          )
        );
      } else {
        alert("Failed to delete coupon");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [activeTab, setActiveTab] = useState<"active" | "past">("active");

  const isExpired = (dateStr: string) => new Date(dateStr) < new Date();

  const filteredCoupons = coupons.filter((coupon) => {
    if (coupon.isDeleted) return activeTab === "past"; // Deleted always in Past
    const expired = isExpired(coupon.validTo);
    return activeTab === "active" ? !expired : expired;
  });

  return (
    <div className="min-h-screen py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="flex items-center gap-2 text-soil/40 hover:text-soil transition-colors font-medium shrink-0">
          <ArrowLeft size={20} />
          <span>Admin</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-soil font-serif">
          Coupons
        </h1>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm h-fit">
          <h2 className="text-xl font-bold text-soil mb-4 flex items-center gap-2">
            <Plus size={20} /> Create New Coupon
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-soil mb-1">Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border rounded-lg uppercase text-base md:text-sm"
                placeholder="E.g. WELCOME10"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-soil mb-1">Discount %</label>
              <input
                type="number"
                value={formData.discountPercentage}
                onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg text-base md:text-sm"
                placeholder="10"
                min="1"
                max="100"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-soil mb-1">Valid From</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <DatePicker
                    value={formData.validFromDate}
                    onChange={(date) => setFormData({ ...formData, validFromDate: date })}
                    placeholder="Start date"
                  />
                  <input
                    type="time"
                    value={formData.validFromTime}
                    onChange={(e) => setFormData({ ...formData, validFromTime: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg text-base md:text-sm h-[42px]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-soil mb-1">Valid To</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <DatePicker
                    value={formData.validToDate}
                    onChange={(date) => setFormData({ ...formData, validToDate: date })}
                    placeholder="End date"
                    minDate={formData.validFromDate}
                  />
                  <input
                    type="time"
                    value={formData.validToTime}
                    onChange={(e) => setFormData({ ...formData, validToTime: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg text-base md:text-sm h-[42px]"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-soil mb-1">Max Discount</label>
                <input
                  type="number"
                  value={formData.maxDiscountAmount}
                  onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-base md:text-sm"
                  placeholder="e.g. 500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-soil mb-1">Usage Limit</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-base md:text-sm"
                  placeholder="1"
                  min="1"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full bg-clay text-white py-3 rounded-lg font-bold hover:bg-clay/90 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Coupon"}
            </button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-4 mb-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-2 px-4 font-medium transition-colors border-b-2 ${activeTab === 'active' ? 'text-clay border-clay' : 'text-soil/60 hover:text-soil border-transparent'}`}
            >
              Active Coupons
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`pb-2 px-4 font-medium transition-colors border-b-2 ${activeTab === 'past' ? 'text-clay border-clay' : 'text-soil/60 hover:text-soil border-transparent'}`}
            >
              Past Coupons
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-10 bg-sand/20 rounded-xl">No {activeTab} coupons found.</div>
          ) : (
            filteredCoupons.map((coupon) => {
              const expired = isExpired(coupon.validTo);
              let statusBadge;
              if (coupon.isDeleted) {
                statusBadge = <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">Deleted</span>;
              } else if (expired) {
                statusBadge = <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-bold">Expired</span>;
              } else if (!coupon.isActive) {
                statusBadge = <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs font-bold">Inactive</span>;
              } else {
                statusBadge = <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-xs font-bold">Active</span>;
              }

              return (
                <div
                  key={coupon._id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xl font-bold text-clay tracking-wider bg-clay/10 px-3 py-1 rounded-lg border-2 border-clay/20 border-dashed">
                        {coupon.code}
                      </span>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                        {coupon.discountPercentage}% {coupon.maxDiscountAmount ? `(Max ₹${coupon.maxDiscountAmount})` : ''} OFF • Limit: {coupon.usageLimit || 1}
                      </span>
                    </div>
                    <div className="text-sm text-soil/60 flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(coupon.validFrom).toLocaleString()} -{" "}
                        {new Date(coupon.validTo).toLocaleString()}
                      </span>
                      {statusBadge}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  );
}
