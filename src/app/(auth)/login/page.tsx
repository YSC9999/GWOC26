"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth";
import OAuthSignin from "@/components/OAuthSignin";
import { fadeInUp, clickTap, instantSpring } from "@/lib/animations";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'login' | 'otp'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... logic same as before ... 
    setError("");

    if (step === 'login') {
      if (!email.trim() || !password) {
        setError("Email and password are required");
        return;
      }
      setLoading(true);

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Login failed");
          return;
        }

        if (data.requiredOtp) {
          setStep('otp');
          setError("");
        } else {
          login(data.user);
          if (data.user.role === 'admin') {
            router.push("/admin");
          } else {
            router.push("/");
          }
        }
      } catch (err) {
        setError("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!otp.trim()) {
        setError("Please enter OTP");
        return;
      }
      setLoading(true);

      try {
        const response = await fetch("/api/auth/verify-login-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Invalid OTP");
          return;
        }

        login(data.user);
        if (data.user.role === 'admin') {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } catch (err) {
        setError("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-8 bg-sand-50">
      <div className="w-full max-w-md mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-white p-6 md:p-8 rounded-2xl shadow-lg"
        >
          <h1 className="text-3xl font-bold text-center text-blue-700 mb-2">
            {step === 'login' ? 'Sign In' : 'Verify OTP'}
          </h1>
          <p className="text-center text-gray-500 mb-6">
            {step === 'login' ? 'Welcome back to Fashion-Hub' : `Enter OTP sent to ${email}`}
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4"
            >
              ⚠️ {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 'login' ? (
              <>
                {/* Email */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 transition-shadow">
                    <span className="text-gray-400">✉️</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="bg-transparent ml-2 flex-1 outline-none text-gray-700 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Password
                  </label>
                  <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 transition-shadow">
                    <span className="text-gray-400">🔒</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="bg-transparent ml-2 flex-1 outline-none text-gray-700 placeholder-gray-400"
                    />
                  </div>
                </div>
              </>
            ) : (
              /* OTP Input */
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <label className="block text-gray-700 font-semibold mb-2">
                  One-Time Password
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2">
                  <span className="text-gray-400">🔑</span>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    required
                    className="bg-transparent ml-2 flex-1 outline-none text-gray-700 placeholder-gray-400 tracking-widest font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="text-xs text-blue-500 mt-2 hover:underline"
                >
                  Back to Login
                </button>
              </motion.div>
            )}

            {/* Forgot Password Link - Only show in login step */}
            {step === 'login' && (
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-teal-600 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {/* Sign In Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={clickTap}
              whileHover={{ scale: 1.02 }}
              className="w-full mt-6 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Verifying..." : (step === 'login' ? "Sign In" : "Verify OTP")}
            </motion.button>

            {/* OAuth Signin - Only in login step */}
            {step === 'login' && (
              <div className="mt-6">
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or continue with</span>
                  </div>
                </div>
                <OAuthSignin />
              </div>
            )}

            {/* Signup Link */}
            <p className="text-center mt-6 text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-teal-600 font-semibold hover:underline"
              >
                Create one
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
