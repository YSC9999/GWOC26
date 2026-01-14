"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Calendar as CalendarIcon, MapPin, Clock, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Event {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    image?: string;
    startDate: string;
    endDate: string;
    timings?: string;
    venue: string;
    address?: string;
    city: string;
    entryFee?: number;
    registrationRequired?: boolean;
    registrationLink?: string;
    type: string;
}

interface EventModalProps {
    event: Event | null;
    onClose: () => void;
}

export default function EventModal({ event, onClose }: EventModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (event) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [event]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {event && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white text-soil transition-all"
                        >
                            <X size={20} />
                        </button>

                        {/* Image Section */}
                        <div className="w-full md:w-1/2 h-64 md:h-auto bg-sand relative">
                            {event.image ? (
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl">🎨</div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col">

                            <div className="mb-6">
                                <h2 className="text-3xl font-serif font-bold text-soil mb-2 leading-tight">{event.title}</h2>
                                <div className="flex flex-wrap gap-4 text-sm text-soil/70 mt-4">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon size={16} className="text-clay" />
                                        <span>
                                            {new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(event.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    {event.timings && (
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-clay" />
                                            <span>{event.timings}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-start gap-2 text-sm text-soil/70 mt-3">
                                    <MapPin size={16} className="text-clay mt-0.5 shrink-0" />
                                    <span>{event.venue}, {event.address ? `${event.address}, ` : ''}{event.city}</span>
                                </div>
                            </div>

                            <hr className="border-soil/10 mb-6" />

                            <div className="prose prose-stone prose-sm mb-8 text-soil/80 leading-relaxed whitespace-pre-wrap">
                                {event.description || "No description available."}
                            </div>

                            <div className="mt-auto">
                                {event.entryFee && event.entryFee > 0 ? (
                                    <div className="flex items-center gap-2 text-soil font-medium mb-4">
                                        <Ticket size={18} className="text-clay" />
                                        <span>Entry Fee: ₹{event.entryFee}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-green-600 font-medium mb-4">
                                        <Ticket size={18} />
                                        <span>Free Entry</span>
                                    </div>
                                )}

                                {event.registrationRequired && event.registrationLink && (
                                    <a
                                        href={event.registrationLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 font-medium"
                                    >
                                        Register Now
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
