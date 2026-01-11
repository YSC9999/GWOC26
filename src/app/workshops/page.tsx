"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, hoverScale } from "@/lib/animations";
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  ArrowRight,
  Loader2,
  Check,
  Search,
  X,
  Minus,
  Plus,
  Shield,
  Star,
} from "lucide-react";

interface Workshop {
  _id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  image: string;
  date: string;
  time: string;
  duration: string;
  maxParticipants: number;
  enrolledCount: number;
  price: number;
  includes: string[];
  location: string;
  level: string;
  status: string;
}

const typeLabels: Record<string, string> = {
  group: "Group Workshop",
  "one-on-one": "Private Session",
  couples: "Couples Class",
  corporate: "Corporate Event",
};

const levelColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  "all-levels": "bg-blue-100 text-blue-700",
};

export default function Workshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Booking Modal State
  const [bookingWorkshop, setBookingWorkshop] = useState<Workshop | null>(null);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    numberOfParticipants: 1,
    specialRequests: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // OTP Verification State
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    fetchWorkshops();
  }, [selectedType, searchQuery]);

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== "all") params.append("type", selectedType);
      if (searchQuery) params.append("search", searchQuery);
      params.append("status", "upcoming");

      const res = await fetch(`/api/workshops?${params}`);
      const data = await res.json();
      setWorkshops(data.workshops || []);
    } catch (error) {
      console.error("Failed to fetch workshops:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAvailableSpots = (workshop: Workshop) => {
    return workshop.maxParticipants - workshop.enrolledCount;
  };

  // Reset OTP state when phone changes
  useEffect(() => {
    if (phoneVerified) {
      setPhoneVerified(false);
      setOtpSent(false);
      setShowOtpInput(false);
      setOtp("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingForm.phone]);

  // Send OTP
  const sendOtp = async () => {
    if (!bookingForm.phone || bookingForm.phone.length < 10) {
      setBookingError("Please enter a valid phone number");
      return;
    }
    setSendingOtp(true);
    setBookingError("");
    try {
      const res = await fetch("/api/auth/send-phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: bookingForm.phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setShowOtpInput(true);
      } else {
        setBookingError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      setBookingError("Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    setVerifyingOtp(true);
    setBookingError("");
    try {
      const res = await fetch("/api/auth/verify-phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: bookingForm.phone, otp }),
      });
      if (res.ok) {
        setPhoneVerified(true);
        setShowOtpInput(false);
      } else {
        setBookingError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setBookingError("Failed to verify OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Handle booking submission with Razorpay payment
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingWorkshop) return;

    // Check phone verification
    if (!phoneVerified) {
      setBookingError("Please verify your phone number first");
      return;
    }

    setBookingLoading(true);
    setBookingError("");

    try {
      // 1. Create registration and get Razorpay order
      const res = await fetch(
        `/api/workshops/${bookingWorkshop._id}/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingForm),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setBookingError(data.error || "Failed to register");
        setBookingLoading(false);
        return;
      }

      // 2. Open Razorpay checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Basho by Shivangi",
        description: `Workshop: ${data.workshopTitle}`,
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            const verifyRes = await fetch(
              `/api/workshops/${bookingWorkshop._id}/verify`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            if (verifyRes.ok) {
              setBookingSuccess(true);
              fetchWorkshops(); // Refresh to update enrolled count
            } else {
              setBookingError(
                "Payment verification failed. Please contact support."
              );
            }
          } catch (err) {
            console.error(err);
            setBookingError("Payment verification failed");
          }
          setBookingLoading(false);
        },
        modal: {
          ondismiss: function () {
            setBookingLoading(false);
          },
        },
        prefill: {
          name: bookingForm.name,
          email: bookingForm.email,
          contact: bookingForm.phone,
        },
        theme: {
          color: "#D97757", // Clay color
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setBookingError(err.message || "Something went wrong");
      setBookingLoading(false);
    }
  };

  // Reset booking modal
  const closeBookingModal = () => {
    setBookingWorkshop(null);
    setBookingForm({
      name: "",
      email: "",
      phone: "",
      numberOfParticipants: 1,
      specialRequests: "",
    });
    setBookingError("");
    setBookingSuccess(false);
    // Reset OTP state
    setOtp("");
    setShowOtpInput(false);
    setPhoneVerified(false);
    setOtpSent(false);
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBookingModal();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (bookingWorkshop) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [bookingWorkshop]);

  return (
    <div className="min-h-screen py-12">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="text-center mb-16"
      >
        <span className="inline-block text-clay font-medium mb-4 tracking-wider uppercase">
          Learn the Art
        </span>
        <h1 className="text-5xl md:text-6xl font-bold text-soil mb-6 font-serif">
          Pottery Workshops
        </h1>
        <p className="text-xl text-soil/70 max-w-3xl mx-auto leading-relaxed">
          Discover the meditative joy of working with clay. From beginner
          wheel-throwing to advanced techniques, find the perfect workshop for
          your journey.
        </p>
      </motion.section>

      {/* Search & Filter */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="mb-8"
      >
        {/* Search */}
        <div className="relative max-w-md mx-auto mb-6">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-soil/50"
            size={20}
          />
          <input
            type="text"
            placeholder="Search workshops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-soil/20 rounded-full focus:border-clay focus:outline-none transition-colors"
          />
        </div>

        {/* Type Pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { id: "all", label: "All Workshops" },
            { id: "group", label: "Group Classes" },
            { id: "one-on-one", label: "Private Sessions" },
            { id: "couples", label: "Couples" },
            { id: "corporate", label: "Corporate" },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                selectedType === type.id
                  ? "bg-clay text-white shadow-lg shadow-clay/30"
                  : "bg-white text-soil border-2 border-soil/20 hover:border-clay hover:text-clay"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Workshops Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-clay" />
          <span className="ml-3 text-soil/70">Loading workshops...</span>
        </div>
      ) : workshops.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-2xl font-bold text-soil mb-2">
            No workshops found
          </h3>
          <p className="text-soil/60">
            Try adjusting your search or filter criteria.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {workshops.map((workshop, idx) => (
            <motion.div
              key={workshop._id}
              variants={fadeInUp}
              whileHover={hoverScale}
              className="group"
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                {/* Image Header */}
                <div className="relative h-64 bg-gradient-to-br from-clay/20 to-sand overflow-hidden">
                  {workshop.image ? (
                    <img
                      src={workshop.image}
                      alt={workshop.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-50 group-hover:scale-110 transition-transform duration-500">
                      {workshop.type === "couples"
                        ? "💑"
                        : workshop.type === "corporate"
                        ? "🏢"
                        : workshop.type === "one-on-one"
                        ? "🎯"
                        : "🎨"}
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-soil text-white text-sm font-medium px-4 py-1.5 rounded-full">
                      {typeLabels[workshop.type] || workshop.type}
                    </span>
                  </div>

                  {/* Level Badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-full ${
                        levelColors[workshop.level] || levelColors["all-levels"]
                      }`}
                    >
                      {workshop.level === "all-levels"
                        ? "All Levels"
                        : workshop.level}
                    </span>
                  </div>

                  {/* Spots indicator */}
                  <div className="absolute bottom-4 right-4">
                    {getAvailableSpots(workshop) <= 3 &&
                    getAvailableSpots(workshop) > 0 ? (
                      <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                        Only {getAvailableSpots(workshop)} spots left!
                      </span>
                    ) : getAvailableSpots(workshop) === 0 ? (
                      <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                        Fully Booked
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3 className="text-lg font-bold text-soil mb-1 font-serif group-hover:text-clay transition-colors">
                    {workshop.title}
                  </h3>

                  <p className="text-soil/60 mb-2 line-clamp-1 text-xs">
                    {workshop.description}
                  </p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-1 mb-3 py-2 border-y border-soil/10 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="text-clay" />
                      <span className="text-soil/70">
                        {formatDate(workshop.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-clay" />
                      <span className="text-soil/70">{workshop.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-clay" />
                      <span className="text-soil/70">{workshop.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-clay" />
                      <span className="text-soil/70">
                        {workshop.enrolledCount}/{workshop.maxParticipants}{" "}
                        enrolled
                      </span>
                    </div>
                  </div>

                  {/* Includes */}
                  {workshop.includes && workshop.includes.length > 0 && (
                    <div className="mb-2">
                      <div className="flex flex-wrap gap-1">
                        {workshop.includes.slice(0, 2).map((item, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-0.5 text-[10px] text-soil/60 bg-sand px-1.5 py-0.5 rounded-full"
                          >
                            <Check size={10} className="text-green-500" />
                            {item}
                          </span>
                        ))}
                        {workshop.includes.length > 2 && (
                          <span className="text-[10px] text-clay">
                            +{workshop.includes.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-clay">
                        ₹{workshop.price.toLocaleString()}
                      </span>
                      <span className="text-soil/50 text-[10px] ml-0.5">
                        {workshop.type === "corporate"
                          ? "for group"
                          : "/person"}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        getAvailableSpots(workshop) > 0 &&
                        setBookingWorkshop(workshop)
                      }
                      disabled={getAvailableSpots(workshop) === 0}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-xs transition-all ${
                        getAvailableSpots(workshop) === 0
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-clay text-white hover:bg-clay/90 hover:scale-105"
                      }`}
                    >
                      {getAvailableSpots(workshop) === 0
                        ? "Sold Out"
                        : "Book Now"}
                      {getAvailableSpots(workshop) > 0 && (
                        <ArrowRight size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* CTA Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="mt-20 bg-gradient-to-br from-sand to-sand/50 rounded-3xl p-12 text-center text-soil border border-soil/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/pottery-pattern.png')] opacity-10 bg-repeat bg-[length:400px_auto]" />
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
            Looking for a private experience?
          </h2>
          <p className="text-lg text-soil/70 mb-8 max-w-2xl mx-auto">
            Book a one-on-one session tailored to your interests, or organize a
            corporate team-building event for your company.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-block bg-clay text-white font-semibold px-8 py-4 rounded-full hover:scale-105 transition-transform"
            >
              Contact Us
            </Link>
            <Link
              href="/corporate"
              className="inline-block bg-white border-2 border-clay text-clay font-semibold px-8 py-4 rounded-full hover:scale-105 transition-transform"
            >
              Corporate Inquiries
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingWorkshop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
            onClick={closeBookingModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-white rounded-2xl sm:rounded-3xl w-full max-w-md sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeBookingModal}
                className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg text-soil hover:text-clay transition-colors"
              >
                <X size={24} />
              </button>

              {/* Success State - Full Width */}
              {bookingSuccess ? (
                <div className="p-6 sm:p-10 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
                  >
                    <Check size={36} className="text-green-600" />
                  </motion.div>
                  <h4 className="text-2xl sm:text-3xl font-bold text-soil mb-2 sm:mb-3 font-serif">
                    Booking Confirmed!
                  </h4>
                  <p className="text-soil/60 mb-2 text-sm sm:text-base">
                    Thank you for registering for{" "}
                    <span className="font-semibold text-soil">
                      {bookingWorkshop.title}
                    </span>
                  </p>
                  <p className="text-soil/50 mb-6 text-sm">
                    We've sent a confirmation email with all the details.
                  </p>
                  <div className="bg-sand/50 rounded-xl p-4 max-w-sm mx-auto mb-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-clay" />
                        <span className="text-soil/70">
                          {formatDate(bookingWorkshop.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-clay" />
                        <span className="text-soil/70">
                          {bookingWorkshop.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={closeBookingModal}
                    className="bg-clay text-white px-6 py-3 rounded-full font-semibold hover:bg-clay/90 transition-all hover:scale-105 text-sm sm:text-base"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* Single Column Layout */
                <div>
                  {/* Details & Form Section */}
                  <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[75vh]">
                    {/* Type & Level Badges */}
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-soil text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full">
                        {typeLabels[bookingWorkshop.type] ||
                          bookingWorkshop.type}
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-medium px-2.5 py-1 rounded-full ${
                          levelColors[bookingWorkshop.level] ||
                          levelColors["all-levels"]
                        }`}
                      >
                        {bookingWorkshop.level === "all-levels"
                          ? "All Levels"
                          : bookingWorkshop.level}
                      </span>
                    </div>
                    {/* Title */}
                    <h2 className="text-xl sm:text-2xl font-bold text-soil font-serif">
                      {bookingWorkshop.title}
                    </h2>

                    {/* Description */}
                    <p className="text-soil/70 leading-relaxed text-sm">
                      {bookingWorkshop.description}
                    </p>

                    {/* Workshop Info Grid */}
                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-soil/10">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-clay/10 rounded-full text-clay">
                          <Calendar size={14} />
                        </div>
                        <div>
                          <div className="text-[10px] text-soil/50">Date</div>
                          <div className="font-medium text-soil text-xs">
                            {formatDate(bookingWorkshop.date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-clay/10 rounded-full text-clay">
                          <Clock size={14} />
                        </div>
                        <div>
                          <div className="text-[10px] text-soil/50">Time</div>
                          <div className="font-medium text-soil text-xs">
                            {bookingWorkshop.time}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-clay/10 rounded-full text-clay">
                          <Users size={14} />
                        </div>
                        <div>
                          <div className="text-[10px] text-soil/50">
                            Spots Left
                          </div>
                          <div className="font-medium text-soil text-xs">
                            {getAvailableSpots(bookingWorkshop)} available
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-clay/10 rounded-full text-clay">
                          <MapPin size={14} />
                        </div>
                        <div>
                          <div className="text-[10px] text-soil/50">
                            Location
                          </div>
                          <div className="font-medium text-soil text-xs capitalize">
                            {bookingWorkshop.location}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* What's Included */}
                    {bookingWorkshop.includes &&
                      bookingWorkshop.includes.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-soil mb-1.5">
                            What's included:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {bookingWorkshop.includes.map((item, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 text-[10px] text-soil/70 bg-green-50 text-green-700 px-2 py-1 rounded-full"
                              >
                                <Check size={10} />
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Price */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-clay">
                        ₹{bookingWorkshop.price.toLocaleString()}
                      </span>
                      <span className="text-soil/50 text-sm">/person</span>
                    </div>

                    {/* Error */}
                    {bookingError && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                        <X size={16} />
                        {bookingError}
                      </div>
                    )}

                    {/* Booking Form */}
                    <form
                      onSubmit={handleBookingSubmit}
                      className="space-y-3 pt-3 border-t border-soil/10"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-soil mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={bookingForm.name}
                            onChange={(e) =>
                              setBookingForm({
                                ...bookingForm,
                                name: e.target.value,
                              })
                            }
                            className="w-full border border-soil/20 rounded-lg px-3 py-2 text-sm focus:border-clay focus:outline-none transition-colors"
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-soil mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={bookingForm.email}
                            onChange={(e) =>
                              setBookingForm({
                                ...bookingForm,
                                email: e.target.value,
                              })
                            }
                            className="w-full border border-soil/20 rounded-lg px-3 py-2 text-sm focus:border-clay focus:outline-none transition-colors"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>

                      {/* Phone - Full width row */}
                      <div>
                        <label className="block text-xs font-medium text-soil mb-1">
                          Phone *
                          {phoneVerified && (
                            <span className="text-green-600 ml-1 inline-flex items-center gap-0.5">
                              <Check size={10} /> Verified
                            </span>
                          )}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            required
                            value={bookingForm.phone}
                            onChange={(e) =>
                              setBookingForm({
                                ...bookingForm,
                                phone: e.target.value,
                              })
                            }
                            disabled={phoneVerified}
                            className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${
                              phoneVerified
                                ? "bg-green-50 border-green-300 text-green-700"
                                : "border-soil/20 focus:border-clay"
                            }`}
                            placeholder="+91 98765 43210"
                          />
                          {!phoneVerified && (
                            <button
                              type="button"
                              onClick={sendOtp}
                              disabled={
                                sendingOtp || bookingForm.phone.length < 10
                              }
                              className="px-4 py-2 bg-clay text-white text-xs rounded-lg hover:bg-clay/90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1"
                            >
                              {sendingOtp ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : otpSent ? (
                                "Resend"
                              ) : (
                                "Get OTP"
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Participants - Full width row */}
                      <div>
                        <label className="block text-xs font-medium text-soil mb-1">
                          Number of Participants *
                        </label>
                        <div className="flex items-center justify-center bg-sand rounded-lg h-[42px] max-w-[200px]">
                          <button
                            type="button"
                            onClick={() =>
                              setBookingForm({
                                ...bookingForm,
                                numberOfParticipants: Math.max(
                                  1,
                                  bookingForm.numberOfParticipants - 1
                                ),
                              })
                            }
                            className="px-4 py-2 hover:text-clay transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-bold text-lg">
                            {bookingForm.numberOfParticipants}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setBookingForm({
                                ...bookingForm,
                                numberOfParticipants: Math.min(
                                  getAvailableSpots(bookingWorkshop),
                                  bookingForm.numberOfParticipants + 1
                                ),
                              })
                            }
                            className="px-4 py-2 hover:text-clay transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      {/* OTP Input - Separate row */}
                      {showOtpInput && !phoneVerified && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <label className="block text-xs font-medium text-amber-800 mb-2">
                            Enter the OTP sent to your phone
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={otp}
                              onChange={(e) =>
                                setOtp(
                                  e.target.value.replace(/\D/g, "").slice(0, 6)
                                )
                              }
                              placeholder="Enter 6-digit OTP"
                              maxLength={6}
                              className="flex-1 border border-amber-300 bg-white rounded-lg px-3 py-2 text-sm focus:border-amber-500 focus:outline-none text-center tracking-widest font-mono"
                            />
                            <button
                              type="button"
                              onClick={verifyOtp}
                              disabled={verifyingOtp || otp.length < 4}
                              className="px-4 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              {verifyingOtp ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <>
                                  <Check size={12} />
                                  Verify
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-soil mb-1">
                          Special Requests (optional)
                        </label>
                        <textarea
                          value={bookingForm.specialRequests}
                          onChange={(e) =>
                            setBookingForm({
                              ...bookingForm,
                              specialRequests: e.target.value,
                            })
                          }
                          rows={2}
                          className="w-full border border-soil/20 rounded-lg px-3 py-2 text-sm focus:border-clay focus:outline-none transition-colors resize-none"
                          placeholder="Any special requirements..."
                        />
                      </div>

                      {/* Total */}
                      <div className="bg-sand/50 rounded-lg p-3 flex items-center justify-between">
                        <span className="font-semibold text-soil text-sm">
                          Total Amount
                        </span>
                        <span className="text-xl font-bold text-clay">
                          ₹
                          {(
                            bookingWorkshop.price *
                            bookingForm.numberOfParticipants
                          ).toLocaleString()}
                        </span>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={bookingLoading || !phoneVerified}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm transition-all ${
                          bookingLoading || !phoneVerified
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-clay text-white hover:bg-clay/90 hover:scale-[1.02]"
                        }`}
                      >
                        {bookingLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Processing...
                          </>
                        ) : !phoneVerified ? (
                          <>
                            <Shield size={14} />
                            Verify Phone to Continue
                          </>
                        ) : (
                          <>
                            Pay & Book Now
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>

                      {/* Secure Payment Note */}
                      <div className="flex items-center justify-center gap-1.5 text-[10px] text-soil/50">
                        <Check size={10} /> Secure Checkout via Razorpay
                      </div>

                      {/* Benefits */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-soil/10">
                        <div className="flex items-center gap-1.5">
                          <div className="p-1.5 bg-clay/10 rounded-full text-clay">
                            <Shield size={12} />
                          </div>
                          <div className="text-[10px] text-soil/70">
                            Secure Payment
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="p-1.5 bg-clay/10 rounded-full text-clay">
                            <Check size={12} />
                          </div>
                          <div className="text-[10px] text-soil/70">
                            Instant Confirmation
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
