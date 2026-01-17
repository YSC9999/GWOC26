"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface AdminPageContainerProps {
  title: string;
  children: ReactNode;
  backLink?: string;
}

export default function AdminPageContainer({
  title,
  children,
  backLink = "/admin",
}: AdminPageContainerProps) {
  return (
    <div className="min-h-screen bg-white/0 pb-8">
      <div
        className="bg-white relative overflow-visible m-4 md:m-8 border-8 border-[#652810] p-6 md:p-10"
        style={{ borderRadius: "50px 48px 52px 49px / 48px 52px 49px 50px" }}
      >
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-center gap-4 pb-6 border-b border-clay/20"
          >
            <Link
              href={backLink}
              className="flex items-center gap-2 text-soil/70 hover:text-clay transition-colors p-2 hover:bg-sand/30 rounded-lg -ml-2"
              title="Back"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back</span>
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
