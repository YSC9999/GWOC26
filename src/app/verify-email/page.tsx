"use client";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const { login } = useAuth();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Verify OTP
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to verify OTP");
        return;
      }

      // 2. Get signup data from sessionStorage
      const signupDataStr = sessionStorage.getItem("signupData");
      if (!signupDataStr) {
        setError("Session expired. Please signup again.");
        return;
      }

      const signupData = JSON.parse(signupDataStr);

      // 3. Create account with verified email
      const signupResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: signupData.firstName,
          lastName: signupData.lastName,
          email: signupData.email,
          password: signupData.password,
          emailVerified: true
        }),
      });

      const signupResult = await signupResponse.json();

      if (!signupResponse.ok) {
        setError(signupResult.error || "Signup failed");
        return;
      }

      // 4. Clear signup data
      sessionStorage.removeItem("signupData");

      // 5. Auto-login in local store
      if (signupResult.user) {
        login(signupResult.user);
      }

      // 6. Redirect
      if (signupResult.user && signupResult.user.role === 'admin') {
        router.push("/admin/dashboard");
      } else {
        router.push("/account?welcome=true");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);
    setResendTimer(60);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to resend OTP");
        setResendTimer(0);
        return;
      }

      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setResendTimer(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-8 shadow-xl text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Verify Email
          </h1>
          <p className="text-gray-600 mb-2">
            Please check your email inbox for a verification link sent to{" "}
            <strong>{email}</strong>.
          </p>
          <p className="text-gray-600 mb-6">
            If your email is not verified, click the link in the email.
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              ⚠️ {error}
            </div>
          )}

          {/* OTP Input Section */}
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
            <p className="text-green-700 font-semibold mb-4">
              ✓ Please verify your email. If you received a code, enter it below.
            </p>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                placeholder="000000"
                className="input-field text-center text-2xl tracking-widest w-full"
              />
              <p className="text-sm text-gray-500">
                6-digit code (OTP expires in 10 minutes)
              </p>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="btn-primary w-full"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          </div>

          {/* Resend Button */}
          <div className="mb-6">
            <p className="text-gray-600 mb-2">Didn't receive a verification email?</p>
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend OTP in {resendTimer} seconds
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={loading}
                className="text-clay hover:underline text-sm font-medium"
              >
                Resend verification email
              </button>
            )}
          </div>

          {/* Back to Login */}
          <Link
            href="/login"
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-soil animate-pulse">Loading verification...</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
