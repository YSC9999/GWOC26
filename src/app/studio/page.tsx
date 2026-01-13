"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, hoverScale } from "@/lib/animations";
import { Calendar, MapPin, ArrowRight, Loader2, ZoomIn, X } from "lucide-react";

interface Event {
  _id: string;
  title: string;
  description: string;
  image: string;
  type: string;
  venue: string;
  address: string;
  city: string;
  startDate: string;
  endDate: string;
  timings: string;
  entryFee: number;
  registrationRequired: boolean;
  registrationLink: string;
  status: string;
}

interface GalleryItem {
  _id: string;
  title: string;
  image: string;
  category: string;
  description: string;
}

const galleryCategories = [
  { id: "all", label: "All" },
  { id: "products", label: "Collections" },
  { id: "workshops", label: "Workshops" },
  { id: "studio", label: "Studio" },
  { id: "events", label: "Events" },
  { id: "process", label: "Process" },
];

export default function Studio() {
  const [activeTab, setActiveTab] = useState<"gallery" | "events">("gallery");

  // Gallery State
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  // Events State
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState("upcoming");

  useEffect(() => {
    if (activeTab === "gallery") {
      fetchGallery();
    } else {
      fetchEvents();
    }
  }, [activeTab, selectedCategory, eventFilter]);

  const fetchGallery = async () => {
    setGalleryLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);

      const res = await fetch(`/api/gallery?${params}`);
      const data = await res.json();
      setGalleryItems(data.gallery || []);
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setGalleryLoading(false);
    }
  };

  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const res = await fetch(`/api/events?status=${eventFilter}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setEventsLoading(false);
    }
  };

  const formatDate = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);

    if (s.toDateString() === e.toDateString()) {
      return s.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "long",
      });
    }

    return `${s.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    })} - ${e.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  };

  return (
    <div className="min-h-screen py-12">
      {/* Hero */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="text-center mb-12"
      >
        <span className="inline-block text-clay font-medium mb-4 tracking-wider uppercase">
          Our Creative Space
        </span>
        <h1 className="text-4xl md:text-6xl font-bold text-soil mb-6 font-serif">
          Studio Life
        </h1>
        <p className="text-lg md:text-xl text-soil/70 max-w-2xl mx-auto px-4">
          Explore our journey through clay – from gallery moments to community
          events.
        </p>
      </motion.section>

      {/* Main Tabs */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex justify-center mb-12 px-4"
      >
        <div className="bg-sand p-1 rounded-full flex">
          <button
            onClick={() => setActiveTab("gallery")}
            className={`px-8 py-3 rounded-full font-medium transition-all ${
              activeTab === "gallery"
                ? "bg-white text-clay shadow-sm"
                : "text-soil/60 hover:text-soil"
            }`}
          >
            Gallery
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-8 py-3 rounded-full font-medium transition-all ${
              activeTab === "events"
                ? "bg-white text-clay shadow-sm"
                : "text-soil/60 hover:text-soil"
            }`}
          >
            Events
          </button>
        </div>
      </motion.div>

      {/* Gallery Tab Content */}
      {activeTab === "gallery" && (
        <div>
          {/* Gallery Filter */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-3 mb-12 px-4"
          >
            {galleryCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? "bg-clay text-white shadow-lg shadow-clay/30"
                    : "bg-white text-soil border-2 border-soil/20 hover:border-clay hover:text-clay"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </motion.div>

          {/* Gallery Grid */}
          {galleryLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-clay" />
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="text-center py-20 text-soil/60">
              No images found in this category.
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 px-4 md:px-12"
            >
              {galleryItems.map((item) => (
                <motion.div
                  key={item._id}
                  variants={fadeInUp}
                  layoutId={item._id}
                  className="break-inside-avoid relative group cursor-zoom-in"
                  onClick={() => setSelectedImage(item)}
                >
                  <div className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow bg-sand/30">
                    {item.image &&
                    (item.image.startsWith("/") ||
                      item.image.startsWith("http") ||
                      item.image.startsWith("data:")) ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-64 bg-sand flex items-center justify-center text-4xl">
                        📷
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <ZoomIn className="text-white w-8 h-8" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="font-bold text-soil">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-soil/60">{item.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Lightbox */}
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setSelectedImage(null)}
            >
              <button
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                <X size={32} />
              </button>

              <motion.div
                layoutId={selectedImage._id}
                className="relative max-w-5xl w-full max-h-[90vh] rounded-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedImage.image &&
                (selectedImage.image.startsWith("/") ||
                  selectedImage.image.startsWith("http") ||
                  selectedImage.image.startsWith("data:")) ? (
                  <img
                    src={selectedImage.image}
                    alt={selectedImage.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-96 bg-white flex items-center justify-center text-6xl">
                    📷
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <h3 className="text-2xl font-bold mb-2">
                    {selectedImage.title}
                  </h3>
                  <p className="text-white/80">{selectedImage.description}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      )}

      {/* Events Tab Content */}
      {activeTab === "events" && (
        <div>
          {/* Event Filter */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex justify-center mb-12 px-4"
          >
            <div className="bg-sand p-1 rounded-full flex">
              <button
                onClick={() => setEventFilter("upcoming")}
                className={`px-8 py-3 rounded-full font-medium transition-all ${
                  eventFilter === "upcoming"
                    ? "bg-white text-clay shadow-sm"
                    : "text-soil/60 hover:text-soil"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setEventFilter("past")}
                className={`px-8 py-3 rounded-full font-medium transition-all ${
                  eventFilter === "past"
                    ? "bg-white text-clay shadow-sm"
                    : "text-soil/60 hover:text-soil"
                }`}
              >
                Past Events
              </button>
            </div>
          </motion.div>

          {/* Events List */}
          <div className="max-w-4xl mx-auto px-4">
            {eventsLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-clay" />
              </div>
            ) : events.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-sand/30 rounded-3xl"
              >
                <div className="text-5xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-soil mb-2">
                  No {eventFilter} events found
                </h3>
                <p className="text-soil/60">
                  {eventFilter === "upcoming"
                    ? "Stay tuned! New events will be announced soon."
                    : "No past events to show."}
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="space-y-8"
              >
                {events.map((event) => (
                  <motion.div
                    key={event._id}
                    variants={fadeInUp}
                    whileHover={hoverScale}
                    className={`bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row border border-soil/10 ${
                      eventFilter === "past"
                        ? "opacity-75 grayscale hover:grayscale-0 hover:opacity-100"
                        : ""
                    }`}
                  >
                    {/* Content */}
                    <div className="p-8 flex-1">
                      <span className="inline-block bg-sand px-3 py-1 rounded-full text-xs font-bold uppercase text-soil/60 mb-3">
                        {event.type}
                      </span>
                      <h3 className="text-2xl font-bold text-soil mb-4 font-serif">
                        {event.title}
                      </h3>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-start gap-3 text-soil/70">
                          <Calendar
                            size={20}
                            className="text-clay flex-shrink-0 mt-0.5"
                          />
                          <div>
                            <div className="font-medium text-soil">
                              {formatDate(event.startDate, event.endDate)}
                            </div>
                            <div className="text-sm">{event.timings}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 text-soil/70">
                          <MapPin
                            size={20}
                            className="text-clay flex-shrink-0 mt-0.5"
                          />
                          <div>
                            <div className="font-medium text-soil">
                              {event.venue}
                            </div>
                            <div className="text-sm">
                              {event.address}, {event.city}
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-soil/60 mb-6 line-clamp-2">
                        {event.description}
                      </p>

                      {eventFilter === "upcoming" && (
                        <div className="flex gap-4">
                          {event.registrationRequired ? (
                            <a
                              href={event.registrationLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-clay text-white px-6 py-2 rounded-full font-semibold hover:bg-clay/90 transition-colors"
                            >
                              Register Now
                              <ArrowRight size={16} />
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                              Free Entry - Walk-ins Welcome
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Image */}
                    <div className="md:w-1/3 bg-sand relative min-h-[250px]">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
                          🎫
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
