"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function InvoicePage() {
    const { id } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            // Fetch order details
            const response = await fetch(`/api/invoice/${id}`);
            if (response.ok) {
                const data = await response.json();
                setOrder(data.order);
                setOrder(data.order);
                // Auto-print removed to allow user to see the page first.
                // setTimeout(() => window.print(), 500); 
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Generating Invoice...</div>;
    if (!order) return <div className="p-10 text-center text-red-500">Order not found</div>;

    return (
        <div className="bg-white min-h-screen p-8 max-w-[210mm] mx-auto text-slate-800 font-sans">
            {/* Controls */}
            <div className="print:hidden flex justify-between items-center mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <button
                    onClick={() => window.close()}
                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                    Close
                </button>
                <button
                    onClick={() => window.print()}
                    className="px-6 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                >
                    <span>🖨️</span> Print / Save as PDF
                </button>
            </div>

            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">INVOICE</h1>
                    <p className="text-slate-500">#{order.orderNumber}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-[#5A3E36]">Basho</h2>
                    <p className="text-sm text-slate-500 mt-1">contact@basho.com</p>
                    <p className="text-sm text-slate-500">www.basho.com</p>
                    <p className="text-sm text-slate-500 font-bold mt-1">GSTIN: 36AAJCB1234F1Z8</p>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Billed To</h3>
                    <p className="font-bold text-lg">{order.shippingAddress?.name || order.userId?.name}</p>
                    <p className="text-slate-600 mt-1 whitespace-pre-line">
                        {order.shippingAddress?.street}<br />
                        {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                        {order.shippingAddress?.pincode}, {order.shippingAddress?.country}
                    </p>
                    <p className="text-slate-600 mt-2">{order.shippingAddress?.phone}</p>
                    {order.customerGstNumber && (
                        <p className="text-slate-600 mt-2 font-medium">GSTIN: {order.customerGstNumber}</p>
                    )}
                </div>
                <div className="text-right">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Invoice Details</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Date Issued</span>
                            <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Payment Status</span>
                            <span className="font-medium capitalize">{order.paymentStatus}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Method</span>
                            <span className="font-medium">{order.paymentMethod || 'Online'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mb-12">
                <table className="w-full min-w-[600px]">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider text-left">
                        <tr>
                            <th className="py-3 px-4 rounded-l-lg">Item</th>
                            <th className="py-3 px-4 text-center">Qty</th>
                            <th className="py-3 px-4 text-right">Price</th>
                            <th className="py-3 px-4 text-right rounded-r-lg">Total</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {order.items.map((item: any, i: number) => (
                            <tr key={i} className="border-b border-slate-50 last:border-none">
                                <td className="py-4 px-4 font-medium">
                                    {item.name}
                                    {item.status === 'cancelled' && <span className="ml-2 text-xs text-red-500">(Cancelled)</span>}
                                    {item.status === 'refunded' && <span className="ml-2 text-xs text-orange-500">(Refunded)</span>}
                                </td>
                                <td className="py-4 px-4 text-center">{item.quantity}</td>
                                <td className="py-4 px-4 text-right">₹{item.price.toLocaleString()}</td>
                                <td className="py-4 px-4 text-right font-bold">₹{(item.price * item.quantity).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-12">
                <div className="w-64 space-y-3">
                    <div className="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span>₹{order.items.reduce((acc: any, i: any) => acc + (i.price * (i.quantity || i.qty || 1)), 0).toLocaleString()}</span>
                    </div>

                    {order.shippingCost > 0 && (
                        <div className="flex justify-between text-slate-600">
                            <span>Shipping</span>
                            <span>+₹{order.shippingCost.toLocaleString()}</span>
                        </div>
                    )}
                    {(order.shippingCost === 0 || !order.shippingCost) && (
                        <div className="flex justify-between text-green-600 text-sm">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                    )}

                    {order.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                            <span>-₹{order.discount.toLocaleString()}</span>
                        </div>
                    )}

                    <div className="flex justify-between text-lg font-bold text-slate-900 pt-4 border-t border-slate-200">
                        <span>Total</span>
                        <span>₹{order.total.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-slate-400 border-t border-slate-100 pt-8">
                <p>Thank you for shopping with Basho!</p>
                <p className="mt-1">For support, email us at support@basho.com</p>
            </div>

            <style jsx global>{`
        @media print {
            body { background: white; }
            @page { margin: 0; }
        }
      `}</style>
        </div>
    );
}
