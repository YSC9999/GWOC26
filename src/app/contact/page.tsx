"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Instagram,
  Send,
  Check,
  Loader2,
  Info,
  ChevronDown,
} from "lucide-react";
import { fadeInUp } from "@/lib/animations";

interface StudioInfo {
  name: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
  visitingHours: Record<string, string>;
  visitPolicy: string;
  collectionPolicy: string;
  aboutText: string;
  mapUrl: string;
}

export default function Contact() {
  const [studioInfo, setStudioInfo] = useState<StudioInfo | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    companyWebsite: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Success Sound Effect
  useEffect(() => {
    if (submitted) {
      const audio = new Audio("/sounds/success.mp3");
      audio.volume = 0.5;
      audio.play().catch(err => console.log("Sound play prevented by browser:", err));
    }
  }, [submitted]);

  useEffect(() => {
    fetchStudioInfo();
  }, []);

  const fetchStudioInfo = async () => {
    try {
      const res = await fetch("/api/studio");
      const data = await res.json();
      if (data.studioInfo) {
        setStudioInfo(data.studioInfo);
      }
    } catch (error) {
      console.error("Failed to fetch studio info:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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

  const subjectOptions = [
    "General Inquiry",
    "Product Question",
    "Workshop Information",
    "Custom Order",
    "Corporate Inquiry",
    "Collaboration",
    "Other",
  ];

  // Check if company name should be required based on subject
  const isCompanyNameRequired =
    formData.subject === "Corporate Inquiry" ||
    formData.subject === "Collaboration";

  return (
    <div className="min-h-screen py-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <span className="inline-block text-clay font-medium mb-4 tracking-wider uppercase text-sm">
          Get in Touch
        </span>
        <div className="flex justify-center mb-2">
          <div
            className="relative inline-flex items-center justify-center px-8 py-6 text-center"
            style={{
              backgroundImage: "url('/Background-card.jpeg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "44px",
              border: "2px solid rgba(101, 40, 16, 0.65)",
              filter: "saturate(1.5)",
            }}
          >
            <div
              className="absolute inset-0 bg-white/65"
              style={{ borderRadius: "44px" }}
            />
            <h1 className="relative text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-soil font-serif leading-tight">
              For Collab & Corporate Inquiry
            </h1>
          </div>
        </div>
        <p className="text-base md:text-xl text-soil/70 max-w-3xl mx-auto px-4 leading-relaxed">
          Let's create something beautiful together. From corporate gifting to
          brand partnerships, we bring Japanese-inspired craftsmanship to your
          unique vision.
        </p>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl mx-auto px-4 md:px-8 mb-20">
        {/* Contact Info Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Quick Contact */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-soil/10">
            <h3 className="text-xl sm:text-2xl font-bold text-soil mb-6 font-serif">
              Contact Info
            </h3>

            <div className="space-y-6">
              <a
                href={`mailto:${studioInfo?.email || "hello@basho.com"}`}
                className="flex items-start gap-4 group"
              >
                <div className="p-3 bg-clay/10 rounded-full text-clay group-hover:bg-clay group-hover:text-white transition-colors">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="font-semibold text-soil">Email</div>
                  <div className="text-soil/60 group-hover:text-clay transition-colors break-all">
                    {studioInfo?.email || "hello@basho.com"}
                  </div>
                </div>
              </a>

              <a
                href={`tel:${studioInfo?.phone || "+919876543210"}`}
                className="flex items-start gap-4 group"
              >
                <div className="p-3 bg-clay/10 rounded-full text-clay group-hover:bg-clay group-hover:text-white transition-colors">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="font-semibold text-soil">Phone</div>
                  <div className="text-soil/60 group-hover:text-clay transition-colors">
                    {studioInfo?.phone || "+91 98765 43210"}
                  </div>
                </div>
              </a>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-clay/10 rounded-full text-clay">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="font-semibold text-soil">Studio Location</div>
                  <div className="text-soil/60 whitespace-pre-line">
                    {studioInfo ? (
                      <>
                        {studioInfo.address}
                        <br />
                        {studioInfo.city}, {studioInfo.state}
                      </>
                    ) : (
                      "Ahmedabad, Gujarat"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-3xl p-8 text-center border border-pink-100">
            <h3 className="text-lg font-bold text-soil mb-2">
              Follow Our Journey
            </h3>
            <a
              href="https://www.instagram.com/bashobyyshivangi/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-pink-600 font-semibold hover:underline mt-2"
            >
              <Instagram size={18} />
              @bashobyyshivangi
            </a>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-12 text-center shadow-lg h-full flex flex-col items-center justify-center border-2 border-green-200"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-soil mb-4 font-serif">
                Message Sent Successfully!
              </h2>
              <p className="text-soil/70 mb-8 max-w-md text-lg">
                Thank you for reaching out. We'll get back to you within 24-48
                hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    companyName: "",
                    companyWebsite: "",
                    subject: "",
                    message: "",
                  });
                }}
                className="bg-gradient-to-r from-clay to-clay/90 text-white px-10 py-4 rounded-full font-bold hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <div className="relative bg-gradient-to-br from-sand/40 via-white to-clay/5 rounded-3xl p-8 md:p-10 shadow-2xl border-2 border-soil/10 overflow-hidden">
              {/* Decorative Background Pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <svg
                  width="100%"
                  height="100%"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="pottery-pattern"
                      x="0"
                      y="0"
                      width="80"
                      height="80"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle
                        cx="20"
                        cy="20"
                        r="15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-soil"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-soil"
                      />
                      <path
                        d="M40 10 Q45 20 40 30 Q35 20 40 10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-soil"
                      />
                    </pattern>
                  </defs>
                  <rect
                    width="100%"
                    height="100%"
                    fill="url(#pottery-pattern)"
                  />
                </svg>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-clay to-clay/80 rounded-xl flex items-center justify-center">
                    <Send size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-soil font-serif">
                      Send Us a Message
                    </h2>
                    <p className="text-sm text-soil/60">
                      We'd love to hear from you
                    </p>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-xl mb-6 flex items-start gap-3"
                  >
                    <Info size={20} className="flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-soil/10">
                      <div className="w-2 h-2 bg-clay rounded-full"></div>
                      <h3 className="text-sm font-bold text-soil uppercase tracking-wide">
                        Personal Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-sm font-semibold text-soil mb-2.5 flex items-center gap-1.5">
                          <span>Your Name</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="John Doe"
                          className="w-full px-5 py-3.5 bg-white border-2 border-soil/10 rounded-xl focus:border-clay focus:ring-4 focus:ring-clay/10 transition-all duration-300 outline-none text-soil placeholder:text-soil/40 font-medium"
                        />
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-soil mb-2.5 flex items-center gap-1.5">
                          <span>Email Address</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="john@company.com"
                          className="w-full px-5 py-3.5 bg-white border-2 border-soil/10 rounded-xl focus:border-clay focus:ring-4 focus:ring-clay/10 transition-all duration-300 outline-none text-soil placeholder:text-soil/40 font-medium"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-soil mb-2.5 flex items-center gap-1.5">
                        <span>Phone Number</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+91 98765 43210"
                        className="w-full px-5 py-3.5 bg-white border-2 border-soil/10 rounded-xl focus:border-clay focus:ring-4 focus:ring-clay/10 transition-all duration-300 outline-none text-soil placeholder:text-soil/40 font-medium"
                      />
                    </div>
                  </div>

                  {/* Company Information Section */}
                  <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-soil/10">
                      <div className="w-2 h-2 bg-clay rounded-full"></div>
                      <h3 className="text-sm font-bold text-soil uppercase tracking-wide">
                        Company Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-sm font-semibold text-soil mb-2.5 flex items-center gap-1.5">
                          <span>Company Name</span>
                          {isCompanyNameRequired && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        <input
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          required={isCompanyNameRequired}
                          placeholder="Your Company Pvt. Ltd."
                          className="w-full px-5 py-3.5 bg-white border-2 border-soil/10 rounded-xl focus:border-clay focus:ring-4 focus:ring-clay/10 transition-all duration-300 outline-none text-soil placeholder:text-soil/40 font-medium"
                        />
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-soil mb-2.5">
                          Company Website
                        </label>
                        <input
                          name="companyWebsite"
                          type="url"
                          value={formData.companyWebsite}
                          onChange={handleChange}
                          placeholder="https://www.yourcompany.com"
                          className="w-full px-5 py-3.5 bg-white border-2 border-soil/10 rounded-xl focus:border-clay focus:ring-4 focus:ring-clay/10 transition-all duration-300 outline-none text-soil placeholder:text-soil/40 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Inquiry Details Section */}
                  <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-soil/10">
                      <div className="w-2 h-2 bg-clay rounded-full"></div>
                      <h3 className="text-sm font-bold text-soil uppercase tracking-wide">
                        Inquiry Details
                      </h3>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-soil mb-2.5 flex items-center gap-1.5">
                        <span>Subject</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-3.5 bg-white border-2 border-soil/10 rounded-xl focus:border-clay focus:ring-4 focus:ring-clay/10 transition-all duration-300 outline-none text-soil font-medium appearance-none cursor-pointer"
                        >
                          <option value="">Select inquiry type</option>
                          {subjectOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-soil/40 pointer-events-none"
                          size={20}
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-soil mb-2.5 flex items-center gap-1.5">
                        <span>Your Message</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Tell us about your requirements, project details, or any questions you have..."
                        className="w-full px-5 py-3.5 bg-white border-2 border-soil/10 rounded-xl focus:border-clay focus:ring-4 focus:ring-clay/10 transition-all duration-300 outline-none text-soil placeholder:text-soil/40 font-medium resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-clay to-clay/90 text-white py-4 md:py-5 rounded-xl font-bold hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg group hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={22} />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send
                          size={20}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-soil/50 mt-4">
                    We typically respond within 24-48 hours
                  </p>
                </form>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Why Partner With Us Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="max-w-6xl mx-auto px-4 md:px-8 mb-20"
      >
        <div className="relative bg-gradient-to-br from-sand/20 via-sand/10 to-transparent rounded-3xl p-8 md:p-12 overflow-hidden border border-soil/10">
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="pottery-bg-pattern"
                  x="0"
                  y="0"
                  width="60"
                  height="60"
                  patternUnits="userSpaceOnUse"
                >
                  <circle
                    cx="15"
                    cy="15"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-soil"
                  />
                  <circle
                    cx="45"
                    cy="45"
                    r="8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-soil"
                  />
                  <ellipse
                    cx="30"
                    cy="30"
                    rx="5"
                    ry="8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-soil"
                  />
                </pattern>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="url(#pottery-bg-pattern)"
              />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-soil font-serif mb-4">
                Why Partner With Basho?
              </h2>
              <p className="text-soil/70 max-w-2xl mx-auto text-base md:text-lg">
                Discover how we can elevate your brand and create memorable
                experiences through artisan pottery.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Corporate Gifting */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-soil/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-clay/10 to-clay/5 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg
                    className="w-8 h-8 text-clay"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-soil mb-3 text-center font-serif">
                  Corporate Gifting
                </h3>
                <p className="text-soil/70 text-center text-sm leading-relaxed">
                  Impress clients and reward employees with bespoke ceramic
                  gifts. Each piece tells a story of craftsmanship, making your
                  brand memorable with sustainable, handcrafted elegance.
                </p>
              </div>

              {/* Brand Partnerships */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-soil/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-clay/10 to-clay/5 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg
                    className="w-8 h-8 text-clay"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-soil mb-3 text-center font-serif">
                  Brand Partnerships
                </h3>
                <p className="text-soil/70 text-center text-sm leading-relaxed">
                  Co-create limited edition collections that blend your brand
                  vision with our artisan expertise. From concept to kiln, we
                  craft unique pieces that resonate with your audience.
                </p>
              </div>

              {/* Team Workshops */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-soil/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-clay/10 to-clay/5 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg
                    className="w-8 h-8 text-clay"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-soil mb-3 text-center font-serif">
                  Team Workshops
                </h3>
                <p className="text-soil/70 text-center text-sm leading-relaxed">
                  Foster creativity and connection through hands-on pottery
                  sessions. Perfect for team building, wellness retreats, or
                  celebrating milestones with an unforgettable tactile
                  experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-soil font-serif mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-soil/70">
            Common questions about our pottery and process.
          </p>
        </div>
        <div className="space-y-4">
          {[
            {
              q: "Are your products microwave and dishwasher safe?",
              a: "Yes, most of our high-fired stoneware is food, microwave, and dishwasher safe. However, to ensure the longevity of your handcrafted pieces, we recommend gentle hand washing with mild soap.",
            },
            {
              q: "How long does a custom order take?",
              a: "Custom orders are a labor of love! Typically, the process takes 3 to 6 weeks. This includes design consultation, throwing, trimming, drying, glazing, and multiple firings in the kiln.",
            },
            {
              q: "Do you ship internationally?",
              a: "Currently, we primarily ship within India. For special international shipping requests, please contact us directly for a quote and feasibility check.",
            },
            {
              q: "What is your return policy?",
              a: "Due to the unique, handcrafted nature of our products, we do not accept returns for change of mind. If an item arrives damaged, please contact us within 24 hours with photos/video, and we will sort it out.",
            },
            {
              q: "Can I visit the studio?",
              a: "Absolutely! We love hosting visitors. Please check our 'Visiting Hours' section below or book an appointment in advance to ensure we are available to show you around.",
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-soil/10 overflow-hidden shadow-sm"
            >
              <details className="group">
                <summary className="flex justify-between items-center w-full p-6 text-left cursor-pointer list-none">
                  <span className="font-bold text-soil text-lg font-serif">
                    {faq.q}
                  </span>
                  <span className="text-clay transition-transform duration-300 group-open:rotate-180">
                    <ChevronDown size={20} />
                  </span>
                </summary>
                <div className="px-6 pb-6 text-soil/70 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// ...existing code...
