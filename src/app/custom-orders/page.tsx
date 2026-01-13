"use client";
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Send,
  Check,
  Loader2,
  Image,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Carousel } from "@/components/Carousel";

const productTypes = [
  { id: "bowl", label: "Bowl", emoji: "🥣" },
  { id: "cup", label: "Cup / Mug", emoji: "🍵" },
  { id: "plate", label: "Plate", emoji: "🍽️" },
  { id: "platter", label: "Platter", emoji: "🍱" },
  { id: "vase", label: "Vase", emoji: "🏺" },
  { id: "decor", label: "Decor Item", emoji: "🕯️" },
  { id: "set", label: "Dinnerware Set", emoji: "🎁" },
  { id: "other", label: "Other", emoji: "✨" },
];

const budgetRanges = [
  { id: "under-1000", label: "Under ₹1,000" },
  { id: "1000-3000", label: "₹1,000 - ₹3,000" },
  { id: "3000-5000", label: "₹3,000 - ₹5,000" },
  { id: "5000-10000", label: "₹5,000 - ₹10,000" },
  { id: "above-10000", label: "Above ₹10,000" },
];

export default function CustomOrders() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    budget: "",
  });
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [previousOrders, setPreviousOrders] = useState<any[]>([]);

  // OTP State
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    fetch("/api/previous-custom-orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPreviousOrders(data.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Reset phone verification if phone number changes
    if (name === "phone") {
      setPhoneVerified(false);
      setOtpSent(false);
      setOtp("");
    }
  };

  const handleSendOtp = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setSendingOtp(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone }),
      });

      const data = await res.json();

      if (res.ok) {
        setOtpSent(true);
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setVerifyingOtp(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setPhoneVerified(true);
        setOtpSent(false);
        setOtp("");
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch (err) {
      setError("Failed to verify OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          referenceImages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-12 text-center max-w-lg shadow-xl"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-soil mb-4 font-serif">
            Request Submitted!
          </h2>
          <p className="text-soil/70 mb-8">
            Thank you for your custom order request. Our team will review your
            requirements and get back to you within 24-48 hours with a
            quotation.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                name: "",
                email: "",
                phone: "",
                description: "",
                budget: "",
              });
              setReferenceImages([]);
            }}
            className="bg-clay text-white px-8 py-3 rounded-full font-semibold hover:bg-clay/90 transition-colors"
          >
            Submit Another Request
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <span className="inline-block text-clay font-medium mb-4 tracking-wider uppercase">
          Made Just for You
        </span>
        <h1 className="text-5xl md:text-6xl font-bold text-soil mb-6 font-serif">
          Custom Orders
        </h1>
        <p className="text-xl text-soil/70 max-w-2xl mx-auto">
          Have a specific vision? We'll bring it to life. From personalized
          gifts to bespoke tableware sets, every piece is crafted with care.
        </p>
      </motion.section>

      {/* Previous Custom Orders Showcase - Carousel */}
      {previousOrders.length > 0 && (
        <section className="mb-20 max-w-6xl mx-auto px-4">
          <Carousel
            items={previousOrders.flatMap((order) =>
              order.images.map((img: string) => ({
                image: img,
                description: order.description,
                id: order._id + "-" + img, // Ensure unique ID for each image in flatMap
              }))
            )}
          />
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-3"
        >
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-soil mb-6 font-serif">
              Tell Us About Your Vision
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-soil mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-soil/10 rounded-xl focus:border-clay focus:outline-none transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-soil mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-soil/10 rounded-xl focus:border-clay focus:outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-soil mb-2">
                  Phone Number *
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      disabled={phoneVerified}
                      className="flex-1 px-4 py-3 border-2 border-soil/10 rounded-xl focus:border-clay focus:outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="+91 98765 43210"
                    />
                    {!phoneVerified && !otpSent && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp || !formData.phone}
                        className="px-4 py-3 bg-clay text-white rounded-xl font-medium hover:bg-clay/90 transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {sendingOtp ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Send OTP"
                        )}
                      </button>
                    )}
                    {phoneVerified && (
                      <div className="flex items-center justify-center px-4 py-3 bg-green-100 text-green-700 rounded-xl">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {otpSent && !phoneVerified && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        className="flex-1 px-4 py-3 border-2 border-soil/10 rounded-xl focus:border-clay focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={verifyingOtp || otp.length !== 6}
                        className="px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {verifyingOtp ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Verify"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-soil mb-2">
                  Describe what you're looking for *
                </label>
                <p className="text-xs text-soil/60 mb-2">
                  Please describe the items you need, including quantities,
                  shapes, and sizes.
                </p>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-soil/10 rounded-xl focus:border-clay focus:outline-none transition-colors resize-none"
                  placeholder="Tell us about your vision: e.g., 4 Dinner Plates, 4 BOWLS, in blue glaze..."
                />
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-soil mb-3">
                  Budget Range *
                </label>
                <div className="flex flex-wrap gap-3">
                  {budgetRanges.map((range) => (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, budget: range.id }))
                      }
                      className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                        formData.budget === range.id
                          ? "border-clay bg-clay text-white"
                          : "border-soil/20 text-soil hover:border-clay"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference Images (placeholder - actual upload would need cloud storage) */}
              <div>
                <label className="block text-sm font-medium text-soil mb-2">
                  Reference Images (optional)
                </label>
                <div className="border-2 border-dashed border-soil/20 rounded-xl p-8 text-center">
                  <Image className="w-12 h-12 text-soil/30 mx-auto mb-3" />
                  <p className="text-soil/60 text-sm mb-2">
                    Share inspiration images with us
                  </p>
                  <p className="text-soil/40 text-xs">
                    You can email reference images to hello@basho.com after
                    submitting this form
                  </p>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  loading ||
                  !formData.description ||
                  !formData.budget ||
                  !phoneVerified
                }
                className="w-full flex items-center justify-center gap-3 bg-clay text-white py-4 rounded-full font-semibold text-lg hover:bg-clay/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Request
                  </>
                )}
              </button>
              {!phoneVerified && (
                <p className="text-sm text-red-500 text-center -mt-2">
                  Please verify your phone number before submitting
                </p>
              )}
            </form>
          </div>
        </motion.div>

        {/* Sidebar Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Process */}
          <div className="bg-sand/50 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-soil mb-6 font-serif">
              How Custom Orders Work
            </h3>
            <div className="space-y-4">
              {[
                {
                  step: "1",
                  title: "Submit Your Request",
                  desc: "Fill out the form with your requirements",
                },
                {
                  step: "2",
                  title: "Receive Quotation",
                  desc: "We'll send you a detailed quote within 48 hours",
                },
                {
                  step: "3",
                  title: "Confirm & Pay",
                  desc: "50% advance to begin crafting",
                },
                {
                  step: "4",
                  title: "Creation",
                  desc: "Your piece is handcrafted with care",
                },
                {
                  step: "5",
                  title: "Delivery",
                  desc: "Receive your unique creation",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 bg-clay text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <div className="font-semibold text-soil">{item.title}</div>
                    <div className="text-sm text-soil/60">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-soil mb-4 font-serif">
              Typical Timeline
            </h3>
            <p className="text-soil/60 mb-4">
              Custom pieces take approximately{" "}
              <span className="font-semibold text-clay">3-4 weeks</span> to
              complete, including:
            </p>
            <ul className="space-y-2 text-sm text-soil/70">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-500" />
                Design consultation
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-500" />
                Hand-building or wheel throwing
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-500" />
                Drying time (1 week)
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-500" />
                First firing (bisque)
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-500" />
                Glazing & final firing
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-br from-clay/10 to-sand rounded-3xl p-8 text-center">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="text-lg font-bold text-soil mb-2">
              Have Questions?
            </h3>
            <p className="text-sm text-soil/60 mb-4">
              We're happy to help with your custom order inquiry.
            </p>
            <a
              href="mailto:hello@basho.com"
              className="text-clay font-semibold hover:underline"
            >
              hello@basho.com
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
