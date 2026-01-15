"use client";
import React, { useState, useEffect } from "react";
import { Calendar, Users, MapPin, Clock } from "lucide-react";
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
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-soil font-serif">My Workshops</h1>
            </div>

            {registrations.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-sand/30 shadow-sm">
                    <Calendar className="w-16 h-16 text-soil/20 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-soil mb-2">No workshops booked</h2>
                    <p className="text-soil/60 mb-6 font-medium">Explore our pottery workshops and book your slot.</p>
                    <Link href="/workshops" className="inline-block bg-brick text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-brick/20 transition-all">
                        Browse Workshops
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {registrations.map((reg) => (
                        <div key={reg._id} className="bg-white rounded-3xl shadow-sm border border-sand/30 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6 flex flex-col md:flex-row items-center gap-6 cursor-pointer" onClick={() => setSelectedRegistration(reg)}>
                                {/* Image */}
                                <div className="w-full md:w-32 h-32 bg-sand/10 rounded-2xl overflow-hidden flex-shrink-0">
                                    {reg.workshopId?.image ? (
                                        <img src={reg.workshopId.image} alt={reg.workshopId.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-soil/20">
                                            <Calendar size={32} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-2 text-center md:text-left">
                                    <h3 className="text-xl font-bold text-soil font-serif">{reg.workshopId?.title || 'Unknown Workshop'}</h3>
                                    <div className="flex flex-wrap gap-4 justify-center md:justify-start text-xs font-bold uppercase tracking-widest text-soil/40">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-clay" />
                                            <span>{new Date(reg.workshopId?.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} className="text-clay" />
                                            <span>{reg.workshopId?.time}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Users size={14} className="text-clay" />
                                            <span>{reg.numberOfParticipants} People</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="font-bold text-soil text-xl">₹{reg.totalAmount.toLocaleString()}</div>
                                    <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mt-2
                    ${reg.paymentStatus === 'paid' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
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
