"use client";
import React, { useState, useEffect } from "react";
import { Calendar, Users, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import WorkshopDetailsModal from "@/components/WorkshopDetailsModal";

export default function MyWorkshops() {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRegistration, setSelectedRegistration] = useState<any>(null);

    useEffect(() => {
        fetchWorkshops();
    }, []);

    const fetchWorkshops = async () => {
        try {
            const res = await fetch("/api/user/workshops");
            if (res.ok) {
                const data = await res.json();
                setRegistrations(data.registrations || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20">Loading workshops...</div>;

    return (
        <div className="min-h-screen py-12 px-4 md:px-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/account" className="text-soil/60 hover:text-clay flex items-center gap-2">
                    <ArrowLeft size={18} /> Back
                </Link>
                <h1 className="text-3xl font-bold text-soil font-serif">My Workshops</h1>
            </div>

            {registrations.length === 0 ? (
                <div className="bg-sand/30 rounded-3xl p-12 text-center">
                    <Calendar className="w-16 h-16 text-soil/20 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-soil mb-2">No workshops booked</h2>
                    <p className="text-soil/60 mb-6">Explore our pottery workshops and book your slot.</p>
                    <Link href="/workshops" className="bg-soil text-white px-6 py-3 rounded-xl font-bold hover:bg-soil/90 transition-colors">
                        Browse Workshops
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {registrations.map((reg) => (
                        <div key={reg._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6 flex flex-col md:flex-row items-center gap-6 cursor-pointer" onClick={() => setSelectedRegistration(reg)}>
                                {/* Image or Placeholder */}
                                <div className="w-full md:w-32 h-32 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                                    {reg.workshopId?.image ? (
                                        <img src={reg.workshopId.image} alt={reg.workshopId.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">No Img</div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-2 text-center md:text-left">
                                    <h3 className="text-xl font-bold text-slate-800">{reg.workshopId?.title || 'Unknown Workshop'}</h3>
                                    <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-slate-600">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={16} />
                                            <span>{new Date(reg.workshopId?.date).toLocaleDateString()} at {reg.workshopId?.time}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users size={16} />
                                            <span>{reg.numberOfParticipants} People</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin size={16} />
                                            <span>{reg.workshopId?.location === 'studio' ? 'Studio' : 'Offsite'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="font-bold text-slate-800 text-lg">₹{reg.totalAmount.toLocaleString()}</div>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mt-2
                                        ${reg.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                                        {reg.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedRegistration && (
                <WorkshopDetailsModal registration={selectedRegistration} onClose={() => setSelectedRegistration(null)} />
            )}
        </div>
    );
}
