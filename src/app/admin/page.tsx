"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
} from "lucide-react";

export default function AdminDashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
      href: "/admin/users",
      label: "Users",
      desc: "Manage accounts & employees",
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
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <motion.h1
        variants={itemVariants}
        className="text-4xl font-serif font-bold text-soil mb-8 flex items-center gap-3"
      >
        <span>⚡</span> Admin Dashboard
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminLinks.map((link) => (
          <motion.div key={link.href} variants={itemVariants}>
            <Link href={link.href}>
              <motion.div
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  backgroundColor: "rgba(255, 255, 255, 1)",
                  borderColor: "rgba(200, 84, 40, 0.4)", // Clay color
                }}
                whileTap={{ scale: 0.98 }}
                className="group h-full p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-clay/20 border-2 border-soil/5 transition-all duration-300 relative overflow-hidden"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-clay/5 rounded-full blur-2xl group-hover:bg-clay/10 transition-colors" />

                <div className="relative z-10">
                  <motion.div className="mb-4 text-clay/80 group-hover:text-clay group-hover:scale-110 transition-all origin-left duration-300">
                    {link.icon}
                  </motion.div>

                  <h3 className="text-2xl font-bold text-soil mb-2 group-hover:text-clay transition-colors">
                    {link.label}
                  </h3>

                  <p className="text-soil/60 font-medium group-hover:text-soil/80 transition-colors">
                    {link.desc}
                  </p>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
