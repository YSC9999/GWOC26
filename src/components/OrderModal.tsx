"use client";
import React from "react";
import { X, MapPin, CreditCard, Package, User, Mail, Phone, Calendar } from "lucide-react";

interface OrderModalProps {
    order: any;
    onClose: () => void;
}

export default function OrderModal({ order, onClose }: OrderModalProps) {
    if (!order) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl font-bold text-slate-800">{order.orderNumber}</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-800'}`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                            <Calendar size={14} />
                            Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Items (2 cols wide) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <Package size={18} /> Order Items ({order.items.length})
                                </h3>
                                <div className="space-y-4">
                                    {order.items.map((item: any, i: number) => (
                                        <div key={i} className={`flex gap-4 p-4 rounded-xl border border-slate-100 shadow-sm ${item.status === 'cancelled' ? 'bg-red-50/50 opacity-70' : 'bg-white'}`}>
                                            <div className="h-20 w-20 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-slate-300">No img</div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-slate-800 line-clamp-2">{item.name}</p>
                                                        <p className="text-sm text-slate-500 mt-1">Qty: {item.quantity}</p>
                                                        {item.status === 'cancelled' && (
                                                            <span className="inline-block mt-2 bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                                                                Cancelled
                                                            </span>
                                                        )}
                                                        {item.productId?.tags?.includes('custom') && (
                                                            <span className="inline-block mt-2 bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ml-2">
                                                                Custom
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="font-bold text-slate-800">
                                                        ₹{(item.price * item.quantity).toLocaleString()}
                                                    </p>
                                                </div>
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
                                        <span>Total</span>
                                        <span>₹{order.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Customer & Address */}
                        <div className="space-y-6">

                            {/* Shipping Address */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <MapPin size={18} /> Delivery Address
                                </h3>
                                {order.shippingAddress ? (
                                    <div className="text-sm text-slate-600 space-y-1">
                                        <p className="font-bold text-slate-800">{order.shippingAddress.name}</p>
                                        <p>{order.shippingAddress.street}</p>
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                                        <p>{order.shippingAddress.country}</p>
                                        <p className="mt-2 text-slate-500">{order.shippingAddress.phone}</p>
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
        </div>
    );
}
