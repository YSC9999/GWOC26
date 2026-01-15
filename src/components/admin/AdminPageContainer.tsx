"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface AdminPageContainerProps {
  title: string;
  children: ReactNode;
}

export default function AdminPageContainer({
  title,
  children,
}: AdminPageContainerProps) {
  return (
    <div className="min-h-screen bg-white/0 pb-8">
      <div
        className="bg-white relative overflow-visible m-4 md:m-8 border-8 border-[#652810] p-6 md:p-10"
        style={{ borderRadius: "50px 48px 52px 49px / 48px 52px 49px 50px" }}
      >
        {/* Random decorative elements */}
        <div className="absolute top-10 left-12 w-16 h-16 border-2 border-gray-300/30 rounded-full opacity-40 pointer-events-none" />
        <div className="absolute top-1/4 right-20 w-24 h-1 bg-gray-400/20 rotate-45 pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 w-20 h-20 border border-gray-300/20 rounded opacity-35 pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 w-12 h-12 border-2 border-gray-300/25 rounded-lg opacity-30 pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-32 h-2 bg-gray-400/15 rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-3 h-3 bg-gray-500/20 rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-28 h-1 bg-gray-300/20 rotate-12 pointer-events-none" />
        <div className="absolute top-2/3 left-10 w-14 h-14 border-2 border-gray-300/20 rounded-full opacity-25 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-center gap-4 pb-6 border-b border-clay/20"
          >
            <Link
              href="/admin"
              className="flex items-center gap-2 text-soil/70 hover:text-clay transition-colors p-2 hover:bg-sand/30 rounded-lg -ml-2"
              title="Back to Admin Dashboard"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Admin</span>
            </Link>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-soil">
              {title}
            </h1>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
