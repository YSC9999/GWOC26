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
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

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
    >
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

  return (
    <div className="min-h-screen py-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <span className="inline-block text-clay font-medium mb-4 tracking-wider uppercase">
          Get in Touch
        </span>
        <h1 className="text-3xl md:text-6xl font-bold text-soil mb-4 md:mb-6 font-serif">
          Visit & Contact Us
        </h1>
        <p className="text-base md:text-xl text-soil/70 max-w-2xl mx-auto">
          We'd love to hear from you. Visit our studio or send us a message.
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
            <h3 className="text-2xl font-bold text-soil mb-6 font-serif">
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
              className="bg-white rounded-3xl p-12 text-center shadow-sm h-full flex flex-col items-center justify-center border border-soil/10"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-soil mb-4 font-serif">
                Message Sent!
              </h2>
              <p className="text-soil/70 mb-8 max-w-md">
                We'll get back to you shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData((prev) => ({
                    ...prev,
                    message: "",
                    subject: "",
                  }));
                }}
                className="bg-clay text-white px-8 py-3 rounded-full font-semibold hover:bg-clay/90 transition-colors"
              >
                Send Another
              </button>
            </motion.div>
          ) : (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-soil/10">
              <h2 className="text-2xl font-bold text-soil mb-6 font-serif">
                Send Us a Message
              </h2>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-soil mb-2">
                      Name *
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input-field w-full px-4 py-3 bg-sand/20 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-soil mb-2">
                      Email *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-field w-full px-4 py-3 bg-sand/20 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-soil mb-2">
                      Phone
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field w-full px-4 py-3 bg-sand/20 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-soil mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="input-field w-full px-4 py-3 bg-sand/20 rounded-xl"
                    >
                      <option value="">Select a topic</option>
                      {subjectOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-soil mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="input-field w-full px-4 py-3 bg-sand/20 rounded-xl resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-clay text-white py-3 md:py-4 rounded-xl font-bold hover:bg-clay/90 transition-colors disabled:opacity-50 text-sm md:text-base"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Send size={16} className="md:w-[18px]" />
                  )}
                  Send Message
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-soil font-serif mb-4">
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

      {/* Merged Studio Sections */}
      <div className="bg-sand/30 py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-soil font-serif mb-4">
              Our Studio
            </h2>
            <p className="max-w-2xl mx-auto text-soil/70">
              {studioInfo?.aboutText || "A creative space for pottery and art."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Hours */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <Clock className="w-10 h-10 text-clay mb-4" />
              <h3 className="text-xl font-bold text-soil mb-4">
                Visiting Hours
              </h3>
              <ul className="space-y-3 text-soil/70">
                {studioInfo?.visitingHours ? (
                  Object.entries(studioInfo.visitingHours).map(
                    ([day, time]) => (
                      <li
                        key={day}
                        className="flex justify-between border-b border-soil/10 pb-2"
                      >
                        <span className="capitalize">{day}</span>
                        <span className="font-medium text-soil">{time}</span>
                      </li>
                    )
                  )
                ) : (
                  <li>Loading hours...</li>
                )}
              </ul>
            </div>

            {/* Policies */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <Info className="w-10 h-10 text-clay mb-4" />
              <h3 className="text-xl font-bold text-soil mb-4">
                Space & Policies
              </h3>
              <div className="space-y-4 text-sm text-soil/70">
                <p>
                  <strong className="text-soil">Eco-Friendly:</strong> We use
                  sustainable clay and recycle materials.
                </p>
                <p>
                  <strong className="text-soil">Visit Policy:</strong>{" "}
                  {studioInfo?.visitPolicy || "By appointment."}
                </p>
                <p>
                  <strong className="text-soil">Collection:</strong>{" "}
                  {studioInfo?.collectionPolicy || "Pick up within 30 days."}
                </p>
              </div>
            </div>

            {/* Map / Directions */}
            <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col justify-center text-center">
              <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                📍
              </div>
              <h3 className="text-xl font-bold text-soil mb-2">Find Us</h3>
              <p className="text-soil/70 mb-6">
                {studioInfo?.address}, {studioInfo?.city}
              </p>
              <a
                href={studioInfo?.mapUrl || "https://maps.google.com"}
                target="_blank"
                className="inline-block bg-clay text-white px-6 py-2 rounded-full font-semibold hover:bg-clay/90"
              >
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
