"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

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

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events?status=${filter}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <span className="inline-block text-clay font-medium mb-4 tracking-wider uppercase">
          Community & Culture
        </span>
        <h1 className="text-5xl md:text-6xl font-bold text-soil mb-6 font-serif">
          Events & Exhibitions
        </h1>
        <p className="text-xl text-soil/70 max-w-2xl mx-auto">
          Join us for pop-up markets, exhibitions, and special events. 
          Come meet the artist and explore our latest collections in person.
        </p>
      </motion.section>

      {/* Tabs */}
      <div className="flex justify-center mb-12">
        <div className="bg-sand p-1 rounded-full flex">
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-8 py-3 rounded-full font-medium transition-all ${
              filter === "upcoming"
                ? "bg-white text-clay shadow-sm"
                : "text-soil/60 hover:text-soil"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter("past")}
            className={`px-8 py-3 rounded-full font-medium transition-all ${
              filter === "past"
                ? "bg-white text-clay shadow-sm"
                : "text-soil/60 hover:text-soil"
            }`}
          >
            Past Events
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="max-w-4xl mx-auto px-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-clay" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-sand/30 rounded-3xl">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-soil mb-2">
              No {filter} events found
            </h3>
            <p className="text-soil/60">
              {filter === "upcoming" 
                ? "Stay tuned! New events will be announced soon."
                : "No past events to show."}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {events.map((event, idx) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row ${
                  filter === "past" ? "opacity-75 grayscale hover:grayscale-0 hover:opacity-100" : ""
                }`}
              >
                {/* Date Badge (Mobile) */}
                <div className="md:hidden bg-clay text-white p-4 text-center font-bold">
                  {formatDate(event.startDate, event.endDate)}
                </div>

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
                      <Calendar size={20} className="text-clay flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-soil">
                          {formatDate(event.startDate, event.endDate)}
                        </div>
                        <div className="text-sm">{event.timings}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-soil/70">
                      <MapPin size={20} className="text-clay flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-soil">{event.venue}</div>
                        <div className="text-sm">{event.address}, {event.city}</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-soil/60 mb-6 line-clamp-2">
                    {event.description}
                  </p>

                  {filter === "upcoming" && (
                    <div className="flex gap-4">
                      {event.registrationRequired ? (
                        <a
                          href={event.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary inline-flex items-center gap-2 px-6 py-2"
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

                {/* Image (Desktop) */}
                <div className="hidden md:block w-1/3 bg-sand relative min-h-[300px]">
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
          </div>
        )}
      </div>

      {filter === "upcoming" && (
        <div className="text-center mt-12 bg-clay/5 py-12 rounded-3xl mx-4">
          <h3 className="text-2xl font-bold text-soil mb-4 font-serif">
            Want to Host a Private Event?
          </h3>
          <p className="text-soil/70 mb-8 max-w-lg mx-auto">
            We offer private workshops and space rentals for special occasions.
          </p>
          <Link href="/corporate" className="btn-outline bg-white hover:bg-clay hover:text-white">
            View Private Options
          </Link>
        </div>
      )}
    </div>
  );
}
