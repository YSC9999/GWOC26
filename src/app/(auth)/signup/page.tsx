"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import OAuthSignin from "@/components/OAuthSignin";
import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!firstName.trim()) {
      setError("First name is required");
      return;
    }

    if (!lastName.trim()) {
      setError("Last name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Store signup data in sessionStorage to use after OTP verification
      sessionStorage.setItem(
        "signupData",
        JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        })
      );

      // First, send OTP to email
      const otpResponse = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!otpResponse.ok) {
        const data = await otpResponse.json();
        setError(data.error || "Failed to send OTP. Check email configuration.");
        sessionStorage.removeItem("signupData");
        return;
      }

      // Redirect to OTP verification page
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError("An error occurred. Please try again.");
      sessionStorage.removeItem("signupData");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-center text-blue-700 mb-2">
            Create Account
          </h1>
          <p className="text-center text-gray-500 mb-6">
            Join Fashion-Hub today and explore our collection
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  First Name
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2">
                  <span className="text-gray-400">👤</span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    required
                    className="bg-transparent ml-2 flex-1 outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Last Name
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2">
                  <span className="text-gray-400">👤</span>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    required
                    className="bg-transparent ml-2 flex-1 outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email Address
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2">
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
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2">
                <span className="text-gray-400">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  className="bg-transparent ml-2 flex-1 outline-none text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Confirm Password
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2">
                <span className="text-gray-400">🔒</span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="bg-transparent ml-2 flex-1 outline-none text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                </button>
              </div>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            {/* OAuth Signin */}
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

            {/* Login Link */}
            <p className="text-center mt-6 text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-teal-600 font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
