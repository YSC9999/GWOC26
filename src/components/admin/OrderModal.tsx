"use client";
import React from "react";
import { X, MapPin, CreditCard, Package, User, Mail, Phone, Calendar } from "lucide-react";

interface OrderModalProps {
    order: any;
    onClose: () => void;
    onUpdate?: (updatedOrder?: any) => void;
}

import { createPortal } from "react-dom";

export default function OrderModal({ order, onClose, onUpdate }: OrderModalProps) {
    const [cancelling, setCancelling] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleCancelOrder = async () => {
        if (!confirm("Are you sure you want to cancel this ENTIRE order? This will initiate a refund.")) return;
        setCancelling(true);
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'cancel_order', orderId: order._id })
            });

            const data = await res.json();

            if (res.ok) {
                // Success - update parent instantly
                onUpdate?.(data.order);
            } else {
                alert(`Failed to cancel order: ${data.error || 'Unknown Error'}`);
            }
        } catch (err: any) {
            console.error(err);
            alert(`Error: ${err.message}`);
        } finally {
            setCancelling(false);
        }
    };

    const handleCancelItem = async (itemId: string) => {
        if (!confirm("Cancel this specific item? Refund will be initiated.")) return;
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'cancel_item', orderId: order._id, itemId })
            });

            const data = await res.json();

            if (res.ok) {
                // Success - update parent instantly
                onUpdate?.(data.order);
            } else {
                alert(`Failed to cancel item: ${data.error || 'Unknown Error'}`);
            }
        } catch (err) {
            console.error(err);
            alert("Network error cancelling item");
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100000] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white w-full sm:max-w-4xl max-h-[90vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 duration-200">

                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                            <h2 className="text-lg sm:text-xl font-bold text-slate-800 break-all">{order.orderNumber}</h2>
                            <span className={`w-fit px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide
                ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-800'}`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2">
                            <Calendar size={14} />
                            Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

                        {/* Left Column: Items (2 cols wide) */}
                        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                            <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm sm:text-base">
                                    <Package size={16} /> Order Items ({order.items.length})
                                </h3>
                                <div className="space-y-4">
                                    {order.items.map((item: any, i: number) => (
                                        <div key={i} className={`flex flex-col sm:flex-row gap-4 p-3 sm:p-4 rounded-xl border border-slate-100 shadow-sm ${item.status === 'cancelled' ? 'bg-red-50/50 opacity-70' : 'bg-white'}`}>
                                            <div className="flex gap-4">
                                                <div className="h-16 w-16 sm:h-20 sm:w-20 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-slate-300 text-xs">No img</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 sm:hidden">
                                                    <p className="font-bold text-slate-800 text-sm line-clamp-2">{item.name}</p>
                                                    <p className="text-xs text-slate-500 mt-1">Qty: {item.quantity}</p>
                                                </div>
                                            </div>

                                            <div className="flex-1 hidden sm:block">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-slate-800 line-clamp-2">{item.name}</p>
                                                        <p className="text-sm text-slate-500 mt-1">Qty: {item.quantity}</p>
                                                        {item.status === 'cancelled' && (
                                                            <span className="inline-block mt-2 bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                                                                Cancelled
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-slate-800">
                                                            ₹{(item.price * item.quantity).toLocaleString()}
                                                        </p>
                                                        {order.status !== 'cancelled' && item.status !== 'cancelled' && order.status !== 'delivered' && (
                                                            <button
                                                                onClick={() => {
                                                                    // Handle populated productId which might be an object
                                                                    const idToCancel = item._id || (typeof item.productId === 'object' ? item.productId._id : item.productId);
                                                                    handleCancelItem(idToCancel);
                                                                }}
                                                                className="mt-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1 rounded-lg text-xs font-bold transition-colors w-full md:w-auto"
                                                            >
                                                                Cancel Item
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mobile Item Details */}
                                            <div className="sm:hidden border-t border-slate-100 pt-3 mt-1 flex justify-between items-center">
                                                <p className="font-bold text-slate-800 text-sm">
                                                    ₹{(item.price * item.quantity).toLocaleString()}
                                                </p>
                                                {order.status !== 'cancelled' && item.status !== 'cancelled' && order.status !== 'delivered' && (
                                                    <button
                                                        onClick={() => {
                                                            // Handle populated productId which might be an object
                                                            const idToCancel = item._id || (typeof item.productId === 'object' ? item.productId._id : item.productId);
                                                            handleCancelItem(idToCancel);
                                                        }}
                                                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1 rounded-lg text-[10px] font-bold transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>


                            {/* Order Summary */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <h3 className="font-bold text-slate-700 mb-4">Payment Summary</h3>
                                <div className="space-y-2 text-sm text-slate-600">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>₹{order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0).toLocaleString()}</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                                            <span>-₹{order.discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span>₹0</span>
                                    </div>
                                    <div className="flex justify-between pt-4 mt-2 border-t border-slate-200 font-bold text-lg text-slate-800">
                                        <span>Total Content</span>
                                        <span>₹{order.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Customer & Address */}
                        <div className="space-y-6">

                            {/* Customer */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <User size={18} /> Customer
                                </h3>
                                <div className="space-y-3 text-sm text-slate-600">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                                            {(order.userId?.name || order.shippingAddress?.name || "?")[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{order.userId?.name || order.shippingAddress?.name || "Guest"}</p>
                                            <p className="text-xs text-slate-400">Customer</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                                        <Mail size={14} className="text-slate-400" />
                                        <span className="truncate">{order.userId?.email || order.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <MapPin size={18} /> Shipping Detail
                                </h3>
                                {order.shippingAddress ? (
                                    <div className="text-sm text-slate-600 space-y-1">
                                        <p className="font-bold text-slate-800">{order.shippingAddress.name}</p>
                                        <p>{order.shippingAddress.street}</p>
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                                        <p>{order.shippingAddress.country}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">No shipping address provided</p>
                                )}
                            </div>

                            {/* Payment Info */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <CreditCard size={18} /> Payment Info
                                </h3>
                                <div className="text-sm text-slate-600 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Method</span>
                                        <span className="font-bold bg-slate-100 px-2 rounded">{order.paymentMethod || 'Online'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Status</span>
                                        <span className={`font-bold capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button
                            onClick={handleCancelOrder}
                            className="px-6 py-2 bg-red-50 border border-red-200 text-red-700 font-bold rounded-xl hover:bg-red-100 transition-colors mr-auto"
                        >
                            Cancel Order (Full Refund)
                        </button>
                    )}

                    <button onClick={onClose} className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                        Close
                    </button>
                    <button
                        onClick={() => window.open(`/invoice/${order._id}`, '_blank')}
                        className="px-6 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors"
                    >
                        Download Invoice
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
}
