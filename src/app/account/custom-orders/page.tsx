"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Clock, CheckCircle, XCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface CustomOrder {
    _id: string;
    description: string;
    status: string;
    totalPrice?: number;
    createdAt: string;
}

export default function MyCustomOrders() {
    const [orders, setOrders] = useState<CustomOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/custom-orders");
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
            case "accepted": return "text-green-600 bg-green-50";
            case "quoted": return "text-blue-600 bg-blue-50";
            case "in_progress": return "text-indigo-600 bg-indigo-50";
            case "completed": return "text-green-600 bg-green-50";
            case "cancelled": return "text-red-600 bg-red-50";
            case "declined": return "text-red-600 bg-red-50";
            default: return "text-yellow-600 bg-yellow-50";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "accepted": return <CheckCircle size={18} />;
            case "completed": return <Package size={18} />;
            case "cancelled": return <XCircle size={18} />;
            case "quoted": return <Clock size={18} />; // Quote ready
            default: return <Clock size={18} />;
        }
    };

    if (loading) return <div className="text-center py-20 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen py-12 px-4 md:px-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/account" className="text-soil/60 hover:text-clay">← Back</Link>
                <h1 className="text-3xl font-bold text-soil font-serif">My Custom Requests</h1>
            </div>

            {orders.length === 0 ? (
                <div className="bg-sand/30 rounded-3xl p-12 text-center">
                    <Clock className="w-16 h-16 text-soil/20 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-soil mb-2">No custom requests</h2>
                    <p className="text-soil/60 mb-6">You haven't requested any custom pieces yet.</p>
                    <Link href="/custom-orders" className="btn-primary">
                        Make a Request
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Link key={order._id} href={`/account/custom-orders/${order._id}`}>
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-clay/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-soil text-lg truncate max-w-xs">{order.description}</div>
                                        <div className="text-sm text-soil/60">
                                            Requested on {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        {order.totalPrice ? (
                                            <div className="font-bold text-soil">Quote: ₹{order.totalPrice.toLocaleString()}</div>
                                        ) : (
                                            <div className="text-sm text-soil/50">Quote Pending</div>
                                        )}
                                        <div className={`text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded inline-block mt-1 ${getStatusColor(order.status)}`}>
                                            {order.status === 'accepted' ? 'Quote Accepted (In Cart)' : (order.status === 'completed' ? 'Order Placed' : order.status.replace('_', ' '))}
                                        </div>
                                    </div>
                                    <ArrowRight className="text-soil/30" />
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
