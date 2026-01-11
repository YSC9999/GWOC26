"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Plus, Calendar, Tag } from "lucide-react";

interface Coupon {
    _id: string;
    code: string;
    discountPercentage: number;
    validFrom: string;
    validTo: string;
    isActive: boolean;
}

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        code: "",
        discountPercentage: "",
        validFrom: "",
        validTo: "",
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
            const res = await fetch("/api/admin/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    discountPercentage: Number(formData.discountPercentage),
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setCoupons([data.coupon, ...coupons]);
                setFormData({ code: "", discountPercentage: "", validFrom: "", validTo: "" });
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
            const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setCoupons(coupons.filter((c) => c._id !== id));
            } else {
                alert("Failed to delete coupon");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen py-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin" className="text-soil/60 hover:text-clay">
                    ← Admin Home
                </Link>
                <h1 className="text-3xl font-bold text-soil font-serif">Coupons</h1>
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
                                className="w-full px-4 py-2 border rounded-lg uppercase"
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
                                className="w-full px-4 py-2 border rounded-lg"
                                placeholder="10"
                                min="1"
                                max="100"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-soil mb-1">Valid From</label>
                                <input
                                    type="datetime-local"
                                    value={formData.validFrom}
                                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-soil mb-1">Valid To</label>
                                <input
                                    type="datetime-local"
                                    value={formData.validTo}
                                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
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
                    <h2 className="text-xl font-bold text-soil mb-4">Active Coupons</h2>
                    {loading ? (
                        <div className="text-center py-10">Loading...</div>
                    ) : coupons.length === 0 ? (
                        <div className="text-center py-10 bg-sand/20 rounded-xl">No coupons found.</div>
                    ) : (
                        coupons.map((coupon) => (
                            <div
                                key={coupon._id}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-xl font-bold text-clay tracking-wider bg-clay/10 px-3 py-1 rounded-lg border-2 border-clay/20 border-dashed">
                                            {coupon.code}
                                        </span>
                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                                            {coupon.discountPercentage}% OFF
                                        </span>
                                    </div>
                                    <div className="text-sm text-soil/60 flex items-center gap-4 mt-2">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(coupon.validFrom).toLocaleString()} -{" "}
                                            {new Date(coupon.validTo).toLocaleString()}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${coupon.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(coupon._id)}
                                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
