"use client";
import { useState, useEffect } from "react";
import {
    Calendar, Clock, Users, Mail, Phone, CheckCircle, XCircle, AlertCircle, Loader2, ArrowRight
} from "lucide-react";

interface StudioVisit {
    _id: string;
    name: string;
    email: string;
    phone: string;
    date: string;
    guests: number;
    purpose: string;
    message: string;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    createdAt: string;
}

export default function AdminStudioVisits() {
    const [visits, setVisits] = useState<StudioVisit[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
    const [selectedVisit, setSelectedVisit] = useState<StudioVisit | null>(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        fetchVisits();
    }, []);

    const fetchVisits = async () => {
        try {
            const res = await fetch("/api/admin/studio-visits");
            const data = await res.json();
            setVisits(data.visits || []);
        } catch (error) {
            console.error("Failed to fetch visits:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setUpdateLoading(true);
        try {
            const res = await fetch("/api/admin/studio-visits", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (res.ok) {
                setVisits(prev => prev.map(v => v._id === id ? { ...v, status: newStatus as any } : v));
                if (selectedVisit?._id === id) {
                    setSelectedVisit(prev => prev ? { ...prev, status: newStatus as any } : null);
                }
            }
        } catch (error) {
            console.error("Failed to update status");
        } finally {
            setUpdateLoading(false);
        }
    };

    // Filter Logic
    const filteredVisits = visits.filter(visit => {
        const visitDate = new Date(visit.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (activeTab === "upcoming") {
            return visitDate >= today;
        } else {
            return visitDate < today;
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return "bg-green-100 text-green-700";
            case 'cancelled': return "bg-red-100 text-red-700";
            case 'completed': return "bg-blue-100 text-blue-700";
            default: return "bg-yellow-100 text-yellow-700";
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-clay" size={32} />
        </div>
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-soil font-serif">Studio Visits</h1>
                    <p className="text-stone-500 mt-1">Manage tour requests and appointments</p>
                </div>
                <div className="bg-white p-1 rounded-lg border border-stone-200 flex gap-1">
                    <button
                        onClick={() => setActiveTab("upcoming")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'upcoming' ? 'bg-[#5A3E36] text-white' : 'text-stone-600 hover:bg-stone-50'}`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab("past")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'past' ? 'bg-[#5A3E36] text-white' : 'text-stone-600 hover:bg-stone-50'}`}
                    >
                        Past
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVisits.length > 0 ? (
                    filteredVisits.map(visit => (
                        <div
                            key={visit._id}
                            onClick={() => setSelectedVisit(visit)}
                            className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
                        >
                            {/* Status Badge */}
                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(visit.status)}`}>
                                {visit.status}
                            </div>

                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-[#5A3E36]/5 flex items-center justify-center text-[#5A3E36] font-serif text-xl font-bold">
                                    {visit.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-soil">{visit.name}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                                        <Users size={12} />
                                        {visit.guests} Guest{visit.guests > 1 ? 's' : ''} • {visit.purpose}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-stone-600 bg-sand/20 p-4 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-[#5A3E36]" />
                                    {new Date(visit.date).toLocaleDateString("en-IN", { weekday: 'short', day: 'numeric', month: 'short' })}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-[#5A3E36]" />
                                    {visit.email}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center text-stone-400 bg-white rounded-3xl border border-stone-100 border-dashed">
                        <Users size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No {activeTab} visits found</p>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedVisit && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setSelectedVisit(null)}
                            className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full transition-colors"
                        >
                            <XCircle size={24} className="text-stone-400" />
                        </button>

                        <div className="p-8">
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${getStatusColor(selectedVisit.status)}`}>
                                        {selectedVisit.status}
                                    </div>
                                    <h2 className="text-3xl font-serif text-soil font-bold">{selectedVisit.name}</h2>
                                    <p className="text-stone-500">Booked on {new Date(selectedVisit.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase text-stone-400 tracking-wider mb-2">Details</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-stone-700">
                                                <Calendar className="text-[#5A3E36]" size={18} />
                                                <span className="font-medium">{new Date(selectedVisit.date).toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-stone-700">
                                                <Users className="text-[#5A3E36]" size={18} />
                                                <span>{selectedVisit.guests} Guest{selectedVisit.guests > 1 ? 's' : ''} ({selectedVisit.purpose})</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold uppercase text-stone-400 tracking-wider mb-2">Contact</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-stone-700">
                                                <Mail className="text-[#5A3E36]" size={18} />
                                                <span>{selectedVisit.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-stone-700">
                                                <Phone className="text-[#5A3E36]" size={18} />
                                                <span>{selectedVisit.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-sand/20 rounded-2xl p-6">
                                    <h4 className="text-xs font-bold uppercase text-stone-400 tracking-wider mb-2">Message</h4>
                                    <p className="text-stone-600 italic">
                                        "{selectedVisit.message || "No message provided."}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-stone-50 p-6 flex justify-end gap-3 border-t border-stone-100">
                            {selectedVisit.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedVisit._id, 'cancelled')}
                                        disabled={updateLoading}
                                        className="px-6 py-2.5 rounded-xl text-red-600 font-medium hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                                    >
                                        Cancel Request
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedVisit._id, 'confirmed')}
                                        disabled={updateLoading}
                                        className="px-8 py-2.5 rounded-xl bg-[#5A3E36] text-white font-bold hover:bg-[#4a332c] shadow-lg shadow-[#5A3E36]/20 transition-all"
                                    >
                                        {updateLoading ? <Loader2 className="animate-spin" /> : "Confirm Visit"}
                                    </button>
                                </>
                            )}

                            {selectedVisit.status === 'confirmed' && (
                                <button
                                    onClick={() => handleStatusUpdate(selectedVisit._id, 'completed')}
                                    disabled={updateLoading}
                                    className="px-8 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all"
                                >
                                    Mark Completed
                                </button>
                            )}

                            {(selectedVisit.status === 'completed' || selectedVisit.status === 'cancelled') && (
                                <span className="text-stone-400 font-medium py-2 px-4">No further actions available</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
