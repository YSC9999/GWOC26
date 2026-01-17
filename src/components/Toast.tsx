"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle } from "lucide-react";

interface ToastProps {
    message: string;
    type?: "error" | "success";
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type = "error", onClose, duration = 5000 }: ToastProps) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [onClose, duration]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border ${type === "error"
                        ? "bg-red-50/90 border-red-200 text-red-800"
                        : "bg-green-50/90 border-green-200 text-green-800"
                    } min-w-[300px] max-w-md`}
            >
                <div className={`p-2 rounded-full ${type === "error" ? "bg-red-100" : "bg-green-100"}`}>
                    {type === "error" ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                </div>
                <div className="flex-1 text-sm font-medium leading-relaxed">{message}</div>
                <button
                    onClick={onClose}
                    className={`p-1 rounded-lg transition-colors ${type === "error" ? "hover:bg-red-100/50" : "hover:bg-green-100/50"
                        }`}
                >
                    <X size={16} />
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
