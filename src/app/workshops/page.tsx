"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Users, Clock, ArrowRight } from "lucide-react";

export default function Workshops() {
  const workshops = [
    {
      id: 1,
      title: "Web Development Fundamentals",
      instructor: "Sarah Chen",
      date: "Jan 15, 2024",
      time: "6:00 PM - 8:00 PM",
      duration: "8 weeks",
      participants: 45,
      level: "Beginner",
      price: 99,
      image: "💻",
      description:
        "Learn the foundations of modern web development with HTML, CSS, and JavaScript.",
    },
    {
      id: 2,
      title: "Advanced React Mastery",
      instructor: "Mike Johnson",
      date: "Jan 20, 2024",
      time: "7:00 PM - 9:00 PM",
      duration: "10 weeks",
      participants: 32,
      level: "Advanced",
      price: 149,
      image: "⚛️",
      description:
        "Master advanced React patterns, hooks, and performance optimization techniques.",
    },
    {
      id: 3,
      title: "UI/UX Design Principles",
      instructor: "Emma Wilson",
      date: "Jan 22, 2024",
      time: "5:00 PM - 7:00 PM",
      duration: "6 weeks",
      participants: 58,
      level: "Beginner",
      price: 89,
      image: "🎨",
      description:
        "Learn the principles of user interface and user experience design.",
    },
    {
      id: 4,
      title: "Full Stack Development",
      instructor: "James Brown",
      date: "Jan 25, 2024",
      time: "7:00 PM - 9:00 PM",
      duration: "12 weeks",
      participants: 28,
      level: "Intermediate",
      price: 199,
      image: "🚀",
      description:
        "Complete guide to building full-stack applications from frontend to backend.",
    },
    {
      id: 5,
      title: "Business Communication",
      instructor: "Lisa Anderson",
      date: "Feb 01, 2024",
      time: "6:00 PM - 7:30 PM",
      duration: "4 weeks",
      participants: 65,
      level: "Beginner",
      price: 59,
      image: "💬",
      description:
        "Enhance your professional communication and leadership skills.",
    },
    {
      id: 6,
      title: "Data Analytics Bootcamp",
      instructor: "David Lee",
      date: "Feb 05, 2024",
      time: "7:00 PM - 9:00 PM",
      duration: "8 weeks",
      participants: 35,
      level: "Intermediate",
      price: 129,
      image: "📊",
      description:
        "Master data analysis tools and techniques for business intelligence.",
    },
  ];

  const levelColors = {
    Beginner: "bg-green-100 text-green-800",
    Intermediate: "bg-yellow-100 text-yellow-800",
    Advanced: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-12 pt-12">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl font-bold text-soil mb-4">Expert Workshops</h1>
        <p className="text-xl text-gray-700">
          Learn from industry experts and level up your skills with our
          comprehensive workshop programs.
        </p>
      </motion.section>

      {/* Workshops Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {workshops.map((workshop, idx) => (
          <motion.div
            key={workshop.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card overflow-hidden hover:shadow-2xl group"
          >
            {/* Image */}
            <div className="bg-sand h-40 flex items-center justify-center text-5xl overflow-hidden group-hover:scale-110 transition-transform duration-300">
              {workshop.image}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-2xl font-bold text-soil mb-1">
                    {workshop.title}
                  </h3>
                  <p className="text-clay font-semibold">
                    {workshop.instructor}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    levelColors[workshop.level as keyof typeof levelColors]
                  }`}
                >
                  {workshop.level}
                </span>
              </div>

              <p className="text-gray-600 mb-4">{workshop.description}</p>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-gray-200">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-clay" />
                  <span className="text-gray-700">{workshop.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-clay" />
                  <span className="text-gray-700">{workshop.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-clay" />
                  <span className="text-gray-700">{workshop.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users size={16} className="text-clay" />
                  <span className="text-gray-700">
                    {workshop.participants} enrolled
                  </span>
                </div>
              </div>

              {/* Price and Button */}
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold text-clay">
                  ${workshop.price}
                </div>
                <button className="btn-primary">
                  Enroll Now <ArrowRight size={16} className="inline ml-2" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-soil text-white rounded-2xl p-12 text-center"
      >
        <h2 className="text-4xl font-bold mb-4">
          Can't find what you're looking for?
        </h2>
        <p className="text-lg mb-8 text-sand">
          Let us know what workshops you'd like to see and we'll make it happen!
        </p>
        <button className="btn-primary bg-clay">Request a Workshop</button>
      </motion.section>
    </div>
  );
}
