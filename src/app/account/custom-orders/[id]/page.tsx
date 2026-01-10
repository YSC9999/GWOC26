"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, Check, X, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";

interface CustomOrderItem {
    name: string;
    quantity: number;
    price?: number;
    status: 'pending' | 'approved' | 'rejected';
    removalReason?: string;
    images?: string[];
}

interface CustomOrder {
    _id: string;
    name: string;
    description: string;
    status: string;
    items: CustomOrderItem[];
    totalPrice?: number;
    quotation?: number; // legacy
    createdAt: string;
    referenceImages: string[];
}

export default function CustomOrderDetail({ params }: { params: Promise<{ id: string }> }) {
    const [order, setOrder] = useState<CustomOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const router = useRouter();
    const { add } = useCart(); // checking useCart signature: 'add'

    useEffect(() => {
        fetchOrder();
    }, []);

    const fetchOrder = async () => {
        try {
            const { id } = await params;
            const res = await fetch(`/api/custom-orders?id=${id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            } else {
                // Handle error
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptQuote = async () => {
        if (!order) return;
        setProcessing(true);
        try {
            const res = await fetch(`/api/custom-orders/${order._id}/accept`, {
                method: 'POST'
            });

            const data = await res.json();

            if (res.ok) {
                // Add to cart
                add({
                    id: data.productId,
                    name: `Custom Order: ${order.description.substring(0, 20)}...`,
                    price: order.totalPrice || 0,
                    qty: 1,
                    image: order.referenceImages?.[0] || '/placeholder.jpg'
                });

                router.push('/cart');
            } else {
                alert(data.error || "Failed to accept quote");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        } finally {
            setProcessing(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!confirm("Are you sure you want to cancel this request?")) return;
        setProcessing(true);
        try {
            const { id } = await params;
            const res = await fetch(`/api/custom-orders/${id}/cancel`, {
                method: 'POST'
            });
            if (res.ok) {
                fetchOrder(); // Refresh
            } else {
                alert("Failed to cancel");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="text-center py-20"><Loader2 className="animate-spin inline-block" /></div>;
    if (!order) return <div className="text-center py-20">Order not found</div>;

    return (
        <div className="min-h-screen py-12 px-4 md:px-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/account/custom-orders" className="text-soil/60 hover:text-clay flex items-center gap-2">
                    <ArrowLeft size={18} /> Back to Requests
                </Link>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 border-b border-gray-100 pb-8 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-soil font-serif mb-2">Request Details</h1>
                        <p className="text-soil/60">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                        <div className="mt-4 px-3 py-1 bg-gray-100 rounded-lg inline-block text-sm font-medium uppercase text-gray-600">
                            Status: {order.status === 'accepted' ? 'In Cart' : (order.status === 'completed' ? 'Order Placed' : order.status)}
                        </div>
                    </div>

                    {order.status === 'quoted' && (
                        <div className="flex flex-col gap-3 min-w-[200px]">
                            <button
                                onClick={handleAcceptQuote}
                                disabled={processing}
                                className="w-full bg-clay text-white py-3 rounded-xl font-bold hover:bg-clay/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-clay/20"
                            >
                                {processing ? <Loader2 className="animate-spin" /> : <ShoppingBag size={18} />}
                                Accept Quote
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={processing}
                                className="w-full border-2 border-red-100 text-red-400 py-3 rounded-xl font-bold hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                                Cancel Request
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <h3 className="text-lg font-bold text-soil mb-4">Your Request</h3>
                        <p className="text-soil/80 whitespace-pre-wrap bg-gray-50 p-6 rounded-2xl">{order.description}</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-soil mb-4">Quote Breakdown</h3>
                        {order.items && order.items.length > 0 ? (
                            <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl border ${item.status === 'rejected' ? 'bg-red-50 border-red-100' : 'bg-white border-clay/10'} flex justify-between items-center`}>
                                        <div>
                                            <div className={`font-bold ${item.status === 'rejected' ? 'text-red-800' : 'text-soil'}`}>{item.name}</div>
                                            <div className="text-sm text-soil/60">Qty: {item.quantity}</div>
                                            {item.status === 'rejected' && (
                                                <div className="text-xs text-red-600 mt-1">Request removed: {item.removalReason}</div>
                                            )}
                                        </div>
                                        {item.status !== 'rejected' && (
                                            <div className="font-bold text-soil">₹{item.price?.toLocaleString()}</div>
                                        )}
                                    </div>
                                ))}

                                {order.totalPrice && (
                                    <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200 mt-4">
                                        <span className="font-bold text-lg text-soil">Total Quote</span>
                                        <span className="font-bold text-2xl text-clay">₹{order.totalPrice?.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-soil/60 italic">Quote pending...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
