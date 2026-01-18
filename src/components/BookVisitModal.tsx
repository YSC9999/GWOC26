"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Users, Clock } from "lucide-react";

interface BookVisitModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BookVisitModal({ isOpen, onClose }: BookVisitModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        date: "",
        guests: 1,
        purpose: "Tour",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus("idle");
        setErrorMessage("");

        try {
            const res = await fetch("/api/studio-visits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to book visit");

            setStatus("success");
            // Play success sound
            const audio = new Audio("/sounds/success.mp3");
            audio.volume = 0.5;
            audio.play().catch(err => console.log("Sound play prevented by browser:", err));

            setTimeout(() => {
                onClose();
                setStatus("idle");
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    date: "",
                    guests: 1,
                    purpose: "Tour",
                    message: "",
                })
            }, 2000);
        } catch (error: any) {
            console.error(error);
            setStatus("error");
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        className="fixed left-1/2 top-28 -translate-x-1/2 w-full max-w-lg bg-[#FFFBF2] rounded-[2.5rem] shadow-2xl z-[100] overflow-hidden border border-stone-100 max-h-[85vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-[#5A3E36] px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-serif text-white">Book a Studio Visit</h3>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                            {status === "success" ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg
                                            className="w-8 h-8"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <h4 className="text-2xl font-serif text-[#5A3E36] mb-2">
                                        Booking Request Sent!
                                    </h4>
                                    <p className="text-stone-600">
                                        We'll confirm your visit shortly via email.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {status === "error" && (
                                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                            {errorMessage}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[#5A3E36]/70">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, name: e.target.value })
                                                }
                                                className="w-full px-5 py-3.5 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5A3E36]/20 transition-all text-[#5A3E36] placeholder:text-stone-400"
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[#5A3E36]/70">
                                                Phone
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, phone: e.target.value })
                                                }
                                                className="w-full px-5 py-3.5 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5A3E36]/20 transition-all text-[#5A3E36] placeholder:text-stone-400"
                                                placeholder="+91..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#5A3E36]/70">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({ ...formData, email: e.target.value })
                                            }
                                            className="w-full px-5 py-3.5 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5A3E36]/20 transition-all text-[#5A3E36] placeholder:text-stone-400"
                                            placeholder="you@example.com"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[#5A3E36]/70 flex items-center gap-1">
                                                <Calendar size={12} /> Date
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                min={new Date().toISOString().split("T")[0]}
                                                value={formData.date}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, date: e.target.value })
                                                }
                                                className="w-full px-5 py-3.5 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5A3E36]/20 transition-all text-[#5A3E36] placeholder:text-stone-400"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[#5A3E36]/70 flex items-center gap-1">
                                                <Users size={12} /> Guests
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="20"
                                                required
                                                value={formData.guests}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        guests: parseInt(e.target.value) || 1,
                                                    })
                                                }
                                                className="w-full px-5 py-3.5 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5A3E36]/20 transition-all text-[#5A3E36] placeholder:text-stone-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#5A3E36]/70">Purpose</label>
                                        <select
                                            value={formData.purpose}
                                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5A3E36]/20 transition-all text-[#5A3E36]"
                                        >
                                            <option>Tour</option>
                                            <option>Workshop Inquiry</option>
                                            <option>Other</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#5A3E36]/70">Message (Optional)</label>
                                        <textarea
                                            rows={3}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5A3E36]/20 transition-all text-[#5A3E36] placeholder:text-stone-400"
                                            placeholder="Any special requests?"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#5A3E36] text-white py-4 rounded-2xl font-bold mt-4 hover:bg-[#4a332c] transition-all disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-[#5A3E36]/20"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Submitting...
                                            </span>
                                        ) : "Confirm Booking Request"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
