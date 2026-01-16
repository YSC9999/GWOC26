"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fadeInUp, clickTap } from "@/lib/animations";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
import { getPasswordStrength } from "@/lib/password-utils";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                setStep(2);
                setSuccess(data.message || "OTP sent to your email");
            } else {
                setError(data.error || "Failed to send OTP");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const strength = getPasswordStrength(newPassword);
        if (strength.label === "Weak") {
            setError("Please create a stronger password (must include upper, lower, and number)");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            });
            const data = await res.json();

            if (res.ok) {
                setSuccess("Password reset successful! Redirecting to login...");
                setTimeout(() => {
                    router.push("/login"); // Redirect to /login
                }, 2000);
            } else {
                setError(data.error || "Failed to reset password");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="max-w-md w-full mx-auto bg-[#FFFBF2] rounded-2xl shadow-2xl p-4 sm:p-8 border border-sand-dark/10"
        >
            <div className="text-center mb-8">
                <h1 className="text-2xl font-serif text-soil mb-2">Reset Password</h1>
                <p className="text-stone-500 text-sm">
                    {step === 1
                        ? "Enter your email to receive a verification code"
                        : "Enter the code sent to your email"}
                </p>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center"
                >
                    {error}
                </motion.div>
            )}

            {success && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-6 text-center"
                >
                    {success}
                </motion.div>
            )}

            {step === 1 ? (
                <form onSubmit={handleSendOTP} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-soil mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full min-w-0 px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay transition-all"
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={clickTap}
                        className="w-full bg-soil text-white py-3 rounded-lg hover:bg-soil/90 transition-colors disabled:opacity-50 font-medium"
                    >
                        {loading ? "Sending..." : "Send Verification Code"}
                    </motion.button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-soil mb-2">Verification Code</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full min-w-0 px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay transition-all"
                            placeholder="Enter 6-digit code"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-soil mb-2">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full min-w-0 px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay transition-all"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                        {newPassword && <PasswordStrengthMeter feedback={getPasswordStrength(newPassword)} />}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-soil mb-2">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full min-w-0 px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={clickTap}
                        className="w-full bg-soil text-white py-3 rounded-lg hover:bg-soil/90 transition-colors disabled:opacity-50 font-medium"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </motion.button>
                </form>
            )}

            <div className="mt-8 text-center">
                <Link href="/login" className="text-sm text-clay hover:text-soil transition-colors">
                    Back to Login
                </Link>
            </div>
        </motion.div>
    );
}
