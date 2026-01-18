"use client";
import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  ArrowRight,
  Loader2,
  Check,
  X,
  Phone,
  Mail,
  Send,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Carousel } from "@/components/Carousel";
import EventCalendar from "@/components/EventCalendar";

interface Workshop {
  _id: string;
  title: string;
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Refs for scrolling
  const inquiryFormRef = useRef<HTMLDivElement>(null);

  const scrollToInquiry = () => {
    inquiryFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Booking Modal State
  const [bookingWorkshop, setBookingWorkshop] = useState<Workshop | null>(null);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    numberOfParticipants: 1,
    specialRequests: "",
    gstNumber: "" // Added GST Number
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

  // Inquiry Form State
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    groupSize: 1,
    occasion: "",
    message: "",
    preferredDate: ""
  });
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Image Popup State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageWorkshop, setSelectedImageWorkshop] = useState<Workshop | null>(null);

  // Success Sound Effect
  useEffect(() => {
    if (bookingSuccess || inquirySuccess) {
      const audio = new Audio("/sounds/success.mp3");
      audio.volume = 0.5;
      audio.play().catch(err => console.log("Sound play prevented by browser:", err));
    }
  }, [bookingSuccess, inquirySuccess]);

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workshops?status=all`);
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

  // --- Derived State ---
  const now = new Date();
  const calendarEvents = workshops.map(w => ({
    _id: w._id,
    title: w.title,
    startDate: w.date,
    endDate: w.date,
    type: w.type,
  }));

  const upcomingWorkshops = workshops
    .filter(w => new Date(w.date) >= new Date(now.setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const completedWorkshops = workshops
    .filter(w => new Date(w.date) < new Date(now.setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displayedUpcoming = selectedDate
    ? upcomingWorkshops.filter(w => {
      const wDate = new Date(w.date);
      // Strip time components for accurate date comparison
      const checkDate = new Date(wDate.getFullYear(), wDate.getMonth(), wDate.getDate());
      const selected = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

      return checkDate.getTime() === selected.getTime();
    })
    : upcomingWorkshops;

  // --- Booking Logic ---
  useEffect(() => {
    if (phoneVerified) {
      setPhoneVerified(false);
      setOtpSent(false);
      setShowOtpInput(false);
      setOtp("");
    }
  }, [bookingForm.phone]);

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
      setBookingError("Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

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
      setBookingError("Failed to verify OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingWorkshop) return;
    if (!phoneVerified) {
      setBookingError("Please verify your phone number first");
      return;
    }
    setBookingLoading(true);
    setBookingError("");
    try {
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
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Basho by Shivangi",
        description: `Workshop: ${data.workshopTitle}`,
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
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
              fetchWorkshops();
            } else {
              setBookingError("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            setBookingError("Payment verification failed");
          }
          setBookingLoading(false);
        },
        modal: { ondismiss: function () { setBookingLoading(false); } },
        prefill: {
          name: bookingForm.name,
          email: bookingForm.email,
          contact: bookingForm.phone,
        },
        theme: { color: "#D97757" },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setBookingError(err.message || "Something went wrong");
      setBookingLoading(false);
    }
  };

  const closeBookingModal = () => {
    setBookingWorkshop(null);
    setBookingForm({ name: "", email: "", phone: "", numberOfParticipants: 1, specialRequests: "", gstNumber: "" });
    setBookingError("");
    setBookingSuccess(false);
    setOtp("");
    setShowOtpInput(false);
    setPhoneVerified(false);
    setOtpSent(false);
  };

  // --- Inquiry Form Logic ---
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryLoading(true);
    try {
      const res = await fetch("/api/workshops/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiryForm),
      });
      if (res.ok) {
        setInquirySuccess(true);
        setInquiryForm({
          name: "",
          email: "",
          phone: "",
          groupSize: 1,
          occasion: "",
          message: "",
          preferredDate: ""
        });
      } else {
        alert("Failed to submit inquiry");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setInquiryLoading(false);
    }
  };


  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-clay" /></div>;

  return (
    <div className="min-h-screen py-8 bg-sand/10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">

          {/* LEFT: Upcoming Workshops List & Completed Workshops */}
          <div className="lg:col-span-8 order-2 lg:order-1 pt-2">
            <h2 className="text-2xl md:text-3xl font-bold text-soil mb-6 flex items-center gap-2 font-serif">
              Upcoming Workshops
              {selectedDate && <span className="text-sm font-normal font-sans text-soil/50 bg-white px-3 py-1 rounded-full border border-soil/10">Filtered: {selectedDate.toLocaleDateString()}</span>}
              {selectedDate && (
                <button onClick={() => setSelectedDate(null)} className="text-xs text-clay hover:underline ml-2 font-sans">
                  Clear
                </button>
              )}
            </h2>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {displayedUpcoming.length > 0 ? (
                displayedUpcoming.map((workshop) => (
                  <motion.div
                    key={workshop._id}
                    variants={fadeInUp}
                    onClick={() => {
                      setSelectedImage(workshop.image || null);
                      setSelectedImageWorkshop(workshop);
                    }}
                    className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all border border-soil/5 flex flex-col md:flex-row gap-6 group cursor-pointer"
                  >
                    {/* Image */}
                    <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden bg-sand shrink-0 relative">
                      {workshop.image ? (
                        <img
                          src={workshop.image}
                          alt={workshop.title}
                          onClick={() => {
                            setSelectedImage(workshop.image);
                            setSelectedImageWorkshop(workshop);
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-4xl">🎨</div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="bg-white/90 backdrop-blur text-soil text-xs font-bold px-3 py-1 rounded-full shadow-sm">{typeLabels[workshop.type] || workshop.type}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-soil font-serif leading-tight">{workshop.title}</h3>
                          <div className="text-right shrink-0 ml-4">
                            <div className="text-base font-bold text-clay">₹{workshop.price.toLocaleString()}</div>
                          </div>
                        </div>

                        <p className="text-soil/70 text-sm mb-4 line-clamp-2">{workshop.description}</p>

                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-soil/60 mb-4 bg-sand/20 p-3 rounded-xl">
                          <div className="flex items-center gap-2"><Calendar size={14} className="text-clay" /> {formatDate(workshop.date)}</div>
                          <div className="flex items-center gap-2"><Clock size={14} className="text-clay" /> {workshop.time} ({workshop.duration})</div>
                          <div className="flex items-center gap-2"><MapPin size={14} className="text-clay" /> {workshop.location}</div>
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-clay" />
                            <span className={getAvailableSpots(workshop) < 3 ? "text-orange-600 font-bold" : ""}>
                              {getAvailableSpots(workshop)} spots left
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => getAvailableSpots(workshop) > 0 && setBookingWorkshop(workshop)}
                          disabled={getAvailableSpots(workshop) === 0}
                          className={`w-full md:w-auto px-6 py-2 rounded-full font-semibold text-xs transition-all flex items-center justify-center gap-2 ${getAvailableSpots(workshop) === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-soil text-white hover:bg-clay hover:scale-105 shadow-md hover:shadow-lg"
                            }`}
                        >
                          {getAvailableSpots(workshop) === 0 ? "Fully Booked" : "Book Now"}
                          {getAvailableSpots(workshop) > 0 && <ArrowRight size={14} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-soil/20">
                  <div className="text-4xl mb-4">🗓️</div>
                  <h3 className="text-xl font-bold text-soil mb-2">No workshops found</h3>
                  <p className="text-soil/60">
                    {selectedDate
                      ? "There are no workshops scheduled for this date."
                      : "We don't have any upcoming workshops scheduled right now."}
                  </p>
                  {selectedDate && <button onClick={() => setSelectedDate(null)} className="mt-4 text-clay font-bold hover:underline">View All</button>}
                </div>
              )}
            </motion.div>

            {/* COMPLETED WORKSHOPS SECTION (Inside Left Column) */}
            {completedWorkshops.length > 0 && (
              <div className="mt-16 border-t border-soil/10 pt-10 text-center md:text-left">
                <h2 className="text-2xl font-bold text-soil font-serif mb-6">Completed Workshops</h2>
                <Carousel
                  items={completedWorkshops.map(w => ({
                    id: w._id,
                    image: w.image,
                    title: w.title,
                    description: formatDate(w.date)
                  }))}
                />
              </div>
            )}
          </div>

          {/* RIGHT: Sticky Sidebar (Get in Touch + Calendar) */}
          <div className="lg:col-span-4 order-1 lg:order-2 h-full">
            <div className="sticky top-24 space-y-4 mt-12">
              {/* Get in Touch Card - Compact */}
              <div className="bg-clay text-white rounded-xl p-4 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10 flex flex-col gap-2">
                  <div>
                    <h3 className="text-base font-bold font-serif leading-tight">Private Workshops</h3>
                    <p className="text-white/80 text-[10px] leading-tight mt-1">
                      Custom experiences for teams and individuals.
                    </p>
                  </div>
                  <button
                    onClick={scrollToInquiry}
                    className="w-full bg-white text-clay font-bold py-1.5 rounded-lg hover:bg-soil hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 text-xs"
                  >
                    Get in Touch <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* Compact Calendar - Reduced Padding */}
              <div className="transform scale-90 origin-top -mt-2">
                <EventCalendar
                  events={calendarEvents}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </div>
            </div>
          </div>

        </div>

        {/* CUSTOM INQUIRY FORM SECTION (Full Width, Outside Grid) */}
        <div ref={inquiryFormRef} className="mt-24 max-w-4xl mx-auto">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-soil/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-clay to-sand"></div>

            <div className="text-center mb-10">
              <span className="text-clay font-bold tracking-widest text-xs uppercase mb-2 block">Custom Experience</span>
              <h2 className="text-3xl md:text-4xl font-bold text-soil font-serif mb-4">Host a Private Workshop</h2>
              <p className="text-soil/60 max-w-xl mx-auto">
                Fill out the form below to inquire about private group sessions, corporate events, or personalized one-on-one classes.
              </p>
            </div>

            {inquirySuccess ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-soil mb-2">Inquiry Sent!</h3>
                <p className="text-soil/60 mb-6">We'll get back to you shortly to plan your event.</p>
                <button
                  onClick={() => setInquirySuccess(false)}
                  className="px-6 py-2 bg-soil text-white rounded-full text-sm font-semibold hover:bg-clay transition-colors"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-soil uppercase tracking-wide">Your Name</label>
                    <input
                      required
                      type="text"
                      value={inquiryForm.name}
                      onChange={e => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                      className="w-full p-3 bg-sand/20 border border-transparent focus:border-clay focus:bg-white rounded-xl transition-all outline-none"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-soil uppercase tracking-wide">Email Address</label>
                    <input
                      required
                      type="email"
                      value={inquiryForm.email}
                      onChange={e => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      className="w-full p-3 bg-sand/20 border border-transparent focus:border-clay focus:bg-white rounded-xl transition-all outline-none"
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-soil uppercase tracking-wide">Phone Number</label>
                    <input
                      required
                      type="tel"
                      value={inquiryForm.phone}
                      onChange={e => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      className="w-full p-3 bg-sand/20 border border-transparent focus:border-clay focus:bg-white rounded-xl transition-all outline-none"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-soil uppercase tracking-wide">Group Size (Approx)</label>
                    <input
                      type="number"
                      min="1"
                      value={inquiryForm.groupSize}
                      onChange={e => setInquiryForm({ ...inquiryForm, groupSize: parseInt(e.target.value) })}
                      className="w-full p-3 bg-sand/20 border border-transparent focus:border-clay focus:bg-white rounded-xl transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-soil uppercase tracking-wide">Occasion / Event Type</label>
                  <div className="flex flex-wrap gap-2">
                    {['Birthday', 'Corporate', 'Bachelorette', 'Date Night', 'Just for Fun', 'Deep Learning'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setInquiryForm({ ...inquiryForm, occasion: opt })}
                        className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${inquiryForm.occasion === opt ? 'bg-soil text-white border-soil' : 'bg-white text-soil border-soil/20 hover:border-clay'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-soil uppercase tracking-wide">Message / Specific Requirements</label>
                  <textarea
                    rows={4}
                    value={inquiryForm.message}
                    onChange={e => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                    className="w-full p-3 bg-sand/20 border border-transparent focus:border-clay focus:bg-white rounded-xl transition-all outline-none resize-none"
                    placeholder="Tell us about the dates you have in mind or any specific requests..."
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={inquiryLoading}
                    className="bg-clay text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-soil hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {inquiryLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                    Submit Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>

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
              <button
                onClick={closeBookingModal}
                className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg text-soil hover:text-clay transition-colors"
              >
                <X size={24} />
              </button>

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
                  <button
                    onClick={closeBookingModal}
                    className="mt-6 bg-clay text-white px-6 py-3 rounded-full font-semibold hover:bg-clay/90 transition-all hover:scale-105 text-sm sm:text-base"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="bg-soil text-white text-xs font-bold px-3 py-1 rounded-full">{typeLabels[bookingWorkshop.type] || bookingWorkshop.type}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-soil font-serif">{bookingWorkshop.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-soil/70 border-b border-soil/10 pb-4">
                    <div className="flex items-center gap-1"><Calendar size={14} /> {formatDate(bookingWorkshop.date)}</div>
                    <div className="flex items-center gap-1"><Clock size={14} /> {bookingWorkshop.time}</div>
                  </div>

                  {/* Upstream/Better Booking Form Logic */}
                  <form onSubmit={handleBookingSubmit} className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-soil uppercase tracking-wide">Full Name</label>
                        <input
                          type="text"
                          required
                          value={bookingForm.name}
                          onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                          className="w-full px-4 py-3 border border-soil/20 rounded-xl focus:border-clay focus:outline-none text-sm"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-soil uppercase tracking-wide">Email</label>
                        <input
                          type="email"
                          required
                          value={bookingForm.email}
                          onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                          className="w-full px-4 py-3 border border-soil/20 rounded-xl focus:border-clay focus:outline-none text-sm"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    {/* GSTIN Field */}
                    <div>
                      <label className="text-xs font-bold text-soil uppercase tracking-wide">GST Number (Optional)</label>
                      <input
                        type="text"
                        value={bookingForm.gstNumber}
                        onChange={(e) => setBookingForm({ ...bookingForm, gstNumber: e.target.value })}
                        className="w-full px-4 py-3 border border-soil/20 rounded-xl focus:border-clay focus:outline-none text-sm uppercase"
                        placeholder="e.g. 29ABCDE1234F1Z5"
                        maxLength={15}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-soil mb-1">
                        Phone *
                        {phoneVerified && (
                          <span className="text-green-600 ml-1 inline-flex items-center gap-0.5">
                            <Check size={10} /> Verified
                          </span>
                        )}
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
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
                          className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${phoneVerified
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
                            className="px-4 py-2 bg-clay text-white text-xs rounded-lg hover:bg-clay/90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-1"
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
                        <div className="flex flex-col sm:flex-row gap-2">
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
                            className="px-4 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
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

                    <button
                      type="submit"
                      disabled={bookingLoading || !phoneVerified}
                      className="w-full bg-clay text-white py-4 rounded-xl font-bold hover:bg-clay/90 transition-colors disabled:opacity-50 text-lg shadow-lg"
                    >
                      {bookingLoading ? "Processing..." : "Proceed to Payment"}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Popup Modal */}
      <AnimatePresence>
        {selectedImage && selectedImageWorkshop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pt-20 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setSelectedImage(null);
              setSelectedImageWorkshop(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col lg:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setSelectedImageWorkshop(null);
                }}
                className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg text-soil hover:text-clay transition-colors"
              >
                <X size={24} />
              </button>

              {/* Image Container - Left Side */}
              <div className="bg-gradient-to-br from-sand to-sand/50 h-96 lg:h-auto lg:w-1/2 flex items-center justify-center overflow-hidden flex-shrink-0">
                {selectedImage ? (
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    src={selectedImage}
                    alt={selectedImageWorkshop.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-6xl">🎨</div>
                )}
              </div>

              {/* Workshop Info - Right Side */}
              <div className="p-6 lg:w-1/2 overflow-y-auto space-y-4 flex flex-col justify-between">
                <div>
                  <div>
                    <h3 className="text-2xl font-bold text-soil font-serif mb-2">
                      {selectedImageWorkshop.title}
                    </h3>
                    <span className="inline-block bg-clay/10 text-clay text-xs font-bold px-3 py-1 rounded-full mb-3">
                      {typeLabels[selectedImageWorkshop.type] || selectedImageWorkshop.type}
                    </span>
                  </div>

                  <p className="text-soil/70 text-sm mb-4">{selectedImageWorkshop.description}</p>

                  <div className="grid grid-cols-2 gap-3 text-xs text-soil/60 bg-sand/20 p-3 rounded-lg mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={13} className="text-clay" />
                      <span>{formatDate(selectedImageWorkshop.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={13} className="text-clay" />
                      <span>{selectedImageWorkshop.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={13} className="text-clay" />
                      <span>{selectedImageWorkshop.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={13} className="text-clay" />
                      <span>{selectedImageWorkshop.location}</span>
                    </div>
                  </div>

                  {selectedImageWorkshop.includes && selectedImageWorkshop.includes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-bold text-soil uppercase tracking-wide mb-2">What's Included</p>
                      <ul className="space-y-1">
                        {selectedImageWorkshop.includes.map((item, idx) => (
                          <li key={idx} className="text-xs text-soil/70 flex items-start gap-2">
                            <Check size={12} className="text-clay mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-4 border-t border-soil/10 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-soil/60">Price per person</p>
                      <p className="text-2xl font-bold text-clay">₹{selectedImageWorkshop.price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-soil/60">Available Spots</p>
                      <p className={`text-2xl font-bold ${getAvailableSpots(selectedImageWorkshop) < 3 ? 'text-orange-600' : 'text-soil'}`}>
                        {getAvailableSpots(selectedImageWorkshop)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setSelectedImageWorkshop(null);
                      if (getAvailableSpots(selectedImageWorkshop) > 0) {
                        setBookingWorkshop(selectedImageWorkshop);
                      }
                    }}
                    disabled={getAvailableSpots(selectedImageWorkshop) === 0}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${getAvailableSpots(selectedImageWorkshop) === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-soil text-white hover:bg-clay hover:scale-105 shadow-md"
                      }`}
                  >
                    {getAvailableSpots(selectedImageWorkshop) === 0 ? "Fully Booked" : "Book Now"}
                    {getAvailableSpots(selectedImageWorkshop) > 0 && <ArrowRight size={16} />}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
