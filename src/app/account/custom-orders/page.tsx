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
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-soil font-serif">My Custom Requests</h1>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-sand/30 shadow-sm">
                    <Clock className="w-16 h-16 text-soil/20 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-soil mb-2">No custom requests</h2>
                    <p className="text-soil/60 mb-6 font-medium">You haven't requested any custom pieces yet.</p>
                    <Link href="/products#custom-order" className="inline-block bg-brick text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-brick/20 transition-all">
                        Make a Request
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {orders.map((order) => (
                        <Link key={order._id} href={`/account/custom-orders/${order._id}`} className="block">
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                className="bg-white rounded-3xl shadow-sm border border-sand/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-clay/30 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getStatusColor(order.status)} bg-opacity-10`}>
                                        {getStatusIcon(order.status)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-soil text-lg truncate max-w-xs">{order.description || "Custom Request"}</div>
                                        <div className="text-xs text-soil/50 font-mono mb-0.5">#{order._id}</div>
                                        <div className="text-[10px] font-bold text-soil/40 uppercase tracking-widest">
                                            Requested on {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        {order.totalPrice ? (
                                            <div className="font-bold text-soil text-lg">Quote: ₹{order.totalPrice.toLocaleString()}</div>
                                        ) : (
                                            <div className="text-sm font-bold text-clay">Quote Pending</div>
                                        )}
                                        <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mt-2 ${getStatusColor(order.status)}`}>
                                            {order.status === 'accepted' ? 'Quote Accepted (In Cart)' : (order.status === 'completed' ? 'Order Placed' : order.status.replace('_', ' '))}
                                        </div>
                                    </div>
                                    <ArrowRight className="text-soil/20" size={18} />
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
