"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function WorkshopInvoicePage() {
    const { id } = useParams();
    const [registration, setRegistration] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRegistration();
    }, [id]);

    const fetchRegistration = async () => {
        try {
            const response = await fetch(`/api/invoice/workshop/${id}`);
            if (response.ok) {
                const data = await response.json();
                setRegistration(data.registration);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Generating Invoice...</div>;
    if (!registration) return <div className="p-10 text-center text-red-500">Registration not found</div>;

    const { workshopId: workshop, name, email, phone, numberOfParticipants, totalAmount, createdAt, gstNumber, _id } = registration;

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

            {/* Invoice Header */}
            <div className="mb-8 border-b border-slate-900 pb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 mb-2">
                        INVOICE
                    </h1>
                    <p className="font-mono text-sm text-slate-500">#{_id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-slate-800 lowercase tracking-tighter">basho<span className="text-amber-600">.</span></h2>
                    <p className="text-sm text-slate-500 mt-1">by Shivangi</p>
                </div>
            </div>

            {/* Bill To & Date */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">Billed To</h3>
                    <p className="font-bold text-slate-800 text-lg">{name}</p>
                    <p className="text-slate-600">{email}</p>
                    <p className="text-slate-600">{phone}</p>
                    {gstNumber && <p className="text-slate-600 mt-1"><span className="font-semibold">GSTIN:</span> {gstNumber}</p>}
                </div>
                <div className="text-right">
                    <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">Date Issued</h3>
                    <p className="font-bold text-slate-800 text-lg">{new Date(createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <div className="mt-4">
                        <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-1">Status</h3>
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-xs uppercase">Paid</span>
                    </div>
                </div>
            </div>

            {/* Workshop Details */}
            <div className="bg-slate-50 rounded-lg p-6 mb-8 border border-slate-100">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    Workshop Details
                </h3>
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-xl font-bold text-slate-800">{workshop.title}</h4>
                        <p className="text-slate-600 mt-1">{new Date(workshop.date).toLocaleDateString()} at {workshop.time}</p>
                        <p className="text-slate-500 text-sm">{workshop.location === 'studio' ? 'At Basho Studio' : workshop.address}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold">₹{workshop.price.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">per person</p>
                    </div>
                </div>
            </div>

            {/* Line Items */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b border-slate-200">
                        <th className="text-left py-3 font-bold text-slate-600 text-sm w-1/2">Description</th>
                        <th className="text-center py-3 font-bold text-slate-600 text-sm">Quantity</th>
                        <th className="text-right py-3 font-bold text-slate-600 text-sm">Price</th>
                        <th className="text-right py-3 font-bold text-slate-600 text-sm">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-slate-100">
                        <td className="py-4">
                            <p className="font-bold text-slate-800">Workshop Registration</p>
                            <p className="text-sm text-slate-500">{workshop.title}</p>
                        </td>
                        <td className="text-center py-4 font-mono">{numberOfParticipants}</td>
                        <td className="text-right py-4 font-mono">₹{workshop.price.toLocaleString()}</td>
                        <td className="text-right py-4 font-bold text-slate-800">₹{totalAmount.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-12">
                <div className="w-64 space-y-3">
                    <div className="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span>₹{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                        <span>Tax (0%)</span>
                        <span>₹0</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t-2 border-slate-900 font-bold text-xl text-slate-900">
                        <span>Total Paid</span>
                        <span>₹{totalAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-slate-400 text-sm pt-8 border-t border-slate-100">
                <p className="mb-1">Thank you for joining our workshop!</p>
                <p>Basho by Shivangi &bull; Hyderabad, India &bull; contact@basho.com</p>
            </div>
        </div>
    );
}
