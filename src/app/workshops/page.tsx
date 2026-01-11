"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  ArrowRight,
  Loader2,
  Check,
  Search,
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {workshops.map((workshop, idx) => (
            <motion.div
              key={workshop._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                {/* Image Header */}
                <div className="relative h-48 bg-gradient-to-br from-clay/20 to-sand overflow-hidden">
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
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-soil mb-3 font-serif group-hover:text-clay transition-colors">
                    {workshop.title}
                  </h3>

                  <p className="text-soil/60 mb-4 line-clamp-2">
                    {workshop.description}
                  </p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-soil/10">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-clay" />
                      <span className="text-soil/70">
                        {formatDate(workshop.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-clay" />
                      <span className="text-soil/70">{workshop.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-clay" />
                      <span className="text-soil/70">{workshop.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={16} className="text-clay" />
                      <span className="text-soil/70">
                        {workshop.enrolledCount}/{workshop.maxParticipants}{" "}
                        enrolled
                      </span>
                    </div>
                  </div>

                  {/* Includes */}
                  {workshop.includes && workshop.includes.length > 0 && (
                    <div className="mb-6">
                      <div className="text-sm font-medium text-soil mb-2">
                        What's included:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {workshop.includes.slice(0, 4).map((item, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-xs text-soil/60 bg-sand px-2 py-1 rounded-full"
                          >
                            <Check size={12} className="text-green-500" />
                            {item}
                          </span>
                        ))}
                        {workshop.includes.length > 4 && (
                          <span className="text-xs text-clay">
                            +{workshop.includes.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-bold text-clay">
                        ₹{workshop.price.toLocaleString()}
                      </span>
                      <span className="text-soil/50 text-sm ml-1">
                        {workshop.type === "corporate"
                          ? "for group"
                          : "/person"}
                      </span>
                    </div>

                    <Link
                      href={`/workshops/${workshop.slug || workshop._id}`}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
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
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
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
    </div>
  );
}
