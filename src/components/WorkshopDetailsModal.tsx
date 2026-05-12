import React from "react";
import { X, MapPin, Calendar, Clock, User, Download, CheckCircle, AlertCircle } from "lucide-react";
import OptimizedImage from "@/components/OptimizedImage";

interface WorkshopDetailsModalProps {
    registration: any;
    onClose: () => void;
}

export default function WorkshopDetailsModal({ registration, onClose }: WorkshopDetailsModalProps) {
    if (!registration) return null;
    const { workshopId: workshop } = registration;

    return (
        <div className="fixed inset-0 !z-[999999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm m-0 top-0 left-0 w-screen h-screen pt-24">
            <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Workshop Details</h2>
                        <p className="text-sm text-slate-500">Booking ID: {registration._id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar max-h-[70vh] space-y-6">

                    {/* Workshop Info */}
                    <div className="flex gap-4">
                        <div className="w-24 h-24 bg-slate-200 rounded-xl overflow-hidden flex-shrink-0">
                            {workshop.image ? (
                                <OptimizedImage src={workshop.image} alt={workshop.title} containerClassName="w-full h-full" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">{workshop.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                <Calendar size={14} />
                                <span>{new Date(workshop.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                <Clock size={14} />
                                <span>{workshop.time} ({workshop.duration})</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                        <span className="text-slate-600 font-medium">Status</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-2
                            ${registration.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                            {registration.paymentStatus === 'paid' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                            {registration.paymentStatus}
                        </span>
                    </div>

                    {/* Booking Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border border-slate-100 rounded-xl">
                            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Participants</p>
                            <p className="text-lg font-bold text-slate-800">{registration.numberOfParticipants}</p>
                        </div>
                        <div className="p-4 border border-slate-100 rounded-xl">
                            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Total Paid</p>
                            <p className="text-lg font-bold text-slate-800">₹{registration.totalAmount.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <h4 className="font-bold text-slate-700 flex items-center gap-2">
                            <MapPin size={18} /> Location
                        </h4>
                        <p className="text-sm text-slate-600 pl-6">
                            {workshop.location === 'studio' ? 'Basho Studio' : workshop.address}
                        </p>
                    </div>

                    {/* Participant Info */}
                    <div className="space-y-2 pt-4 border-t border-slate-100">
                        <h4 className="font-bold text-slate-700 flex items-center gap-2">
                            <User size={18} /> Participant Info
                        </h4>
                        <div className="pl-6 text-sm text-slate-600 space-y-1">
                            <p><span className="font-medium">Name:</span> {registration.name}</p>
                            <p><span className="font-medium">Email:</span> {registration.email}</p>
                            <p><span className="font-medium">Phone:</span> {registration.phone}</p>
                            {registration.gstNumber && <p><span className="font-medium">GSTIN:</span> {registration.gstNumber}</p>}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                        Close
                    </button>
                    <button
                        onClick={() => window.open(`/invoice/workshop/${registration._id}`, '_blank')}
                        className="px-6 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors flex items-center gap-2"
                    >
                        <Download size={18} /> Download Invoice
                    </button>
                </div>
            </div>
        </div>
    );
}
