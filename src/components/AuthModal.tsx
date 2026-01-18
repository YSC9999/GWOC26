"use client";
import React from "react";
import { X, LogIn, UserPlus, Lock } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

export default function AuthModal({ isOpen, onClose, message = "Please login to continue" }: AuthModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                {/* Modal content */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-clay/10 text-clay rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock size={32} />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
                        <p className="text-gray-600 mb-8">{message}</p>

                        <div className="space-y-3">
                            <Link
                                href={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
                                className="block w-full py-3 px-4 bg-clay text-white font-semibold rounded-xl hover:bg-clay/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <LogIn size={18} />
                                Login
                            </Link>

                            <Link
                                href="/signup"
                                className="block w-full py-3 px-4 bg-white border-2 border-clay text-clay font-semibold rounded-xl hover:bg-clay/5 transition-colors flex items-center justify-center gap-2"
                            >
                                <UserPlus size={18} />
                                Create Account
                            </Link>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 text-center text-sm text-gray-500">
                        Join our community to access exclusive features
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
