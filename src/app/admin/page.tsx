"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  Package,
  ShoppingBag,
  Ticket,
  Palette,
  Users,
  Star,
  Frame,
  Building2,
  MessageSquare,
  Brush,
  Truck,
  BarChart2,
  Wallet,
  Settings,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";

export default function AdminDashboard() {
  useEffect(() => {
    document.title = "Basho";
  }, []);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const adminLinks = [
    {
      href: "/admin/analytics",
      label: "Analytics",
      desc: "View sales trends & insights",
      icon: <BarChart2 size={32} />,
    },
    {
      href: "/admin/products",
      label: "Products",
      desc: "Manage collection items",
      icon: <Package size={32} />,
    },
    {
      href: "/admin/orders",
      label: "Orders",
      desc: "View and manage customer orders",
      icon: <ShoppingBag size={32} />,
    },
    {
      href: "/admin/shipping",
      label: "Shipping",
      desc: "Manage rates & config",
      icon: <Truck size={32} />,
    },
    {
      href: "/admin/coupons",
      label: "Coupons",
      desc: "Manage discount codes",
      icon: <Ticket size={32} />,
    },
    {
      href: "/admin/custom-orders",
      label: "Custom Orders",
      desc: "Manage custom requests",
      icon: <Palette size={32} />,
    },
    {
      href: "/admin/workshops",
      label: "Workshops",
      desc: "Manage workshops & inquiries",
      icon: <Brush size={32} />,
    },
    {
      href: "/admin/users",
      label: "Users",
      desc: "Manage accounts",
      icon: <Users size={32} />,
    },

    {
      href: "/admin/collections",
      label: "Collections",
      desc: "Manage homepage featured items",
      icon: <Star size={32} />,
    },
    {
      href: "/admin/frames",
      label: "Frames",
      desc: "Edit photo frames section",
      icon: <Frame size={32} />,
    },
    {
      href: "/admin/user-contacts",
      label: "User Contacts",
      desc: "View customer messages",
      icon: <MessageSquare size={32} />,
    },
    {
      href: "/admin/contact",
      label: "Studio Info",
      desc: "Edit contact & visiting hours",
      icon: <Building2 size={32} />,
    },
    {
      href: "/admin/studio",
      label: "Studio Content",
      desc: "Manage sliders & exhibits",
      icon: <Brush size={32} />,
    },
    {
      href: "/admin/studio-visits",
      label: "Studio Visits",
      desc: "Manage tour requests",
      icon: <Calendar size={32} />,
    },
    {
      href: "/admin/settings",
      label: "Settings",
      desc: "Configure store settings",
      icon: <Settings size={32} />,
    },
    {
      href: "/admin/gallery",
      label: "Gallery",
      desc: "Manage gallery albums & media",
      icon: <ImageIcon size={32} />, // Using aliased Image icon
    },
  ];

  return (
    <div className="min-h-screen bg-white/0">
      <div
        className="bg-white relative overflow-hidden m-4 md:m-8 border-8 border-[#652810] p-6 md:p-10 min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)]"
        style={{ borderRadius: "50px 48px 52px 49px / 48px 52px 49px 50px" }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto relative z-10"
        >
          <motion.div
            variants={itemVariants}
            className="mb-8 md:mb-12 text-center px-2"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-block text-4xl md:text-6xl mb-4"
            >
              🏯
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold bg-gradient-to-r from-soil via-clay to-soil bg-clip-text text-transparent mb-3 break-words leading-tight">
              Admin Dashboard
            </h1>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {adminLinks.map((link, idx) => (
              <motion.div
                key={link.href}
                variants={itemVariants}
                whileHover={{ scale: 1.03, rotate: 0.5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link href={link.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="group h-full p-2 md:p-6 bg-gradient-to-br from-white to-sand/30 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-black/40 border-2 border-white/50 transition-shadow duration-300 relative overflow-hidden"
                  >
                    {/* Animated Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-clay/0 via-clay/0 to-clay/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-clay/5 group-hover:bg-clay/10 transition-colors duration-500 pointer-events-none rounded-full" />

                    <div className="relative z-10">
                      <motion.div
                        whileHover={{ scale: 1.08 }}
                        className="mb-5 text-clay group-hover:text-clay/90 transition-colors duration-300 bg-clay/10 group-hover:bg-clay/15 w-16 h-16 rounded-2xl flex items-center justify-center"
                      >
                        {link.icon}
                      </motion.div>

                      <h3 className="text-lg sm:text-2xl font-bold text-soil mb-2 group-hover:text-clay transition-colors duration-300">
                        {link.label}
                      </h3>

                      <p className="text-soil/60 font-medium group-hover:text-soil/90 transition-colors text-sm">
                        {link.desc}
                      </p>

                      {/* Arrow indicator */}
                      <motion.div
                        className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={{ x: -10 }}
                        whileHover={{ x: 0 }}
                      >
                        <svg
                          className="w-6 h-6 text-clay"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </motion.div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
