"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Calendar as CalendarIcon, MapPin, ArrowRight, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import EventCalendar from "@/components/EventCalendar";
import EventModal from "@/components/EventModal";

interface Event {
  _id: string;
  title: string;
  slug: string;
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

export default function Studio() {
  const [studioImages, setStudioImages] = useState<GalleryItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventFilter, setEventFilter] = useState<"upcoming" | "past">("upcoming");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState<Event | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [galleryRes, eventsRes] = await Promise.all([
          fetch("/api/gallery?category=studio"),
          fetch("/api/events?status=all") // Fetch all and filter client-side for smoother transition
        ]);

        const galleryData = await galleryRes.json();
        const eventsData = await eventsRes.json();

        setStudioImages(galleryData.gallery || []);
        setEvents(eventsData.events || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-slide logic
  useEffect(() => {
    if (studioImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % studioImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [studioImages.length]);

  // Helper to check if event is currently active (Ongoing)
  const isOngoing = (ev: Event) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const start = new Date(ev.startDate);
    const end = new Date(ev.endDate);
    const eStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const eEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    return today >= eStart && today <= eEnd;
  };

  const displayedEvents = events.filter((ev) => {
    if (selectedDate) {
      // Strip time from selectedDate
      const s = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

      const start = new Date(ev.startDate);
      const end = new Date(ev.endDate);
      const eStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const eEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());

      return s >= eStart && s <= eEnd;
    }

    const now = new Date();
    // Normalize 'now' to start of day for fairer comparison with mostly date-only DB fields
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const end = new Date(ev.endDate);
    const eEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    // "Upcoming" includes ongoing (endDate >= today)
    if (eventFilter === "upcoming") return eEnd >= today;
    // "Past" is strictly before today
    return eEnd < today;
  }).sort((a, b) => {
    // Sort logic
    if (eventFilter === "upcoming") return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
  });

  const formatDate = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    if (s.toDateString() === e.toDateString()) {
      return s.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" });
    }
    return `${s.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - ${e.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-clay" /></div>;

  return (
    <div className="min-h-screen py-12 md:py-20">

      {/* Hero Section: Text Left, Slider Right */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

          {/* Left: Text */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="order-2 lg:order-1 lg:col-span-5"
          >
            {/* Removed "Our Studio" label */}
            <h1 className="text-3xl md:text-5xl font-bold text-soil mb-6 font-serif leading-tight">
              A Space for <br /> <span className="italic text-clay">Creation & Connection</span>
            </h1>
            <div className="text-base text-soil/80 space-y-4 leading-relaxed font-light">
              <p>
                Welcome to Basho Studio, where mud meets magic. Our studio is more than just a workspace;
                it's a sanctuary for artists, learners, and clay enthusiasts.
              </p>
              <p>
                Located in the heart of the city, we offer a fully equipped facility for wheel throwing,
                hand building, and glazing. Whether you are browsing our latest collection or getting your hands dirty
                in a workshop, we invite you to experience the meditative art of pottery.
              </p>
            </div>

            <div className="mt-8 flex gap-4">
              <a href="#exhibitions" className="btn-primary px-8 py-3 rounded-full inline-flex items-center gap-2 text-sm">
                View Exhibitions <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>

          {/* Right: Slider */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2 lg:col-span-7 relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group"
          >
            <AnimatePresence mode="wait">
              {studioImages.length > 0 ? (
                <motion.img
                  key={currentSlide}
                  src={studioImages[currentSlide].image}
                  alt="Studio view"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="bg-sand/30 w-full h-full flex items-center justify-center text-soil/40">
                  No images available
                </div>
              )}
            </AnimatePresence>

            {/* Slider Controls (Admin Requirement: Admin adds, newly added is first - already handled by API sorting) */}
            {studioImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + studioImages.length) % studioImages.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % studioImages.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {studioImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Exhibitions Section */}
      <section id="exhibitions" className="bg-sand/20 py-20 px-4 md:px-12 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-soil font-serif mb-6">Exhibitions & Events</h2>

            {/* Filter Buttons */}
            <div className="flex flex-col items-center gap-6 mb-12">
              <div className="inline-flex bg-white p-1 rounded-full shadow-sm">
                <button
                  onClick={() => setEventFilter("upcoming")}
                  className={`px-8 py-3 rounded-full font-medium transition-all ${eventFilter === "upcoming" ? "bg-clay text-white shadow-md" : "text-soil/60 hover:text-soil"
                    }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setEventFilter("past")}
                  className={`px-8 py-3 rounded-full font-medium transition-all ${eventFilter === "past" ? "bg-clay text-white shadow-md" : "text-soil/60 hover:text-soil"
                    }`}
                >
                  Past
                </button>
              </div>

              {selectedDate && (
                <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-2">
                  <p className="text-soil/60 mb-2 text-sm">
                    Showing events for <span className="font-bold text-soil">{selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </p>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-clay hover:text-clay/80 text-sm font-medium underline underline-offset-4"
                  >
                    Clear Date Filter
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Left: Calendar (Sticky) */}
            <div className="lg:col-span-4 lg:sticky lg:top-32">
              <div className="hidden lg:block">
                <EventCalendar
                  events={events}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </div>
              {/* Mobile helper for calendar maybe? or just hide it on small screens if too cramped. Keeping it hidden on small for now as per "Left reference" implies desktop layout primarily. */}
            </div>

            {/* Right: Events List */}
            <motion.div
              key={eventFilter}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {displayedEvents.length > 0 ? (
                displayedEvents.map((event) => (
                  <motion.div
                    key={event._id}
                    variants={fadeInUp}
                    onClick={() => setSelectedEventDetails(event)}
                    className={`bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1 ${eventFilter === 'past' ? 'opacity-90' : ''}`}
                  >
                    <div className="h-56 overflow-hidden relative">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-sand flex items-center justify-center text-4xl">🎨</div>
                      )}

                      {/* Ongoing Badge */}
                      {isOngoing(event) && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-100 text-red-600 flex items-center gap-1.5 shadow-sm border border-red-200">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                            Ongoing
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-soil font-serif mb-2 group-hover:text-clay transition-colors">{event.title}</h3>
                        <div className="text-clay font-medium text-xs flex items-center gap-2">
                          <CalendarIcon size={14} /> {formatDate(event.startDate, event.endDate)}
                        </div>
                      </div>

                      <p className="text-soil/70 mb-4 text-sm line-clamp-2">
                        {event.description}
                      </p>

                      <div className="mt-auto space-y-3 pt-4 border-t border-soil/5">
                        <div className="flex items-start gap-2 text-xs text-soil/60">
                          <MapPin size={14} className="mt-0.5 shrink-0" />
                          <span>{event.venue}, {event.city}</span>
                        </div>
                        {eventFilter === "upcoming" && event.registrationRequired && (
                          <a
                            href={event.registrationLink}
                            target="_blank"
                            rel="noopener"
                            className="block w-full text-center py-2.5 rounded-xl bg-soil text-white font-medium text-sm hover:bg-clay transition-colors"
                          >
                            Register Now
                          </a>
                        )}
                        {eventFilter === "upcoming" && !event.registrationRequired && (
                          <div className="text-center py-2.5 text-green-600 font-medium bg-green-50 rounded-xl text-sm">
                            Open Entry
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-soil/50">
                  {selectedDate
                    ? `No exhibitions found on ${selectedDate.toLocaleDateString()}.`
                    : `No ${eventFilter} exhibitions found.`
                  }
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Event Details Modal */}
      <EventModal
        event={selectedEventDetails}
        onClose={() => setSelectedEventDetails(null)}
      />
    </div>
  );
}
