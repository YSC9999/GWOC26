import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import Link from "next/link";
import { Instagram, Mail, MapPin } from "lucide-react";

export default function Footer({ studioInfo }: { studioInfo?: any }) {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className="bg-sand/90 border-t border-soil/30 mt-10 pt-6 pb-4"
    >
      <div className="max-w-5xl mx-auto px-4 text-center">
        {/* Brand Logo */}
        <Link href="/" className="inline-block mb-3">
          <motion.img
            src="/Logo.png"
            alt="Basho Logo"
            className="h-16 w-auto mix-blend-multiply opacity-80 mx-auto"
            whileHover={{ scale: 1.1, opacity: 1 }}
            animate={{
              y: [0, -5, 0],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 0.2 },
            }}
          />
        </Link>
        {/* ... remaining footer content ... */}
        <p className="text-soil/85 text-sm max-w-md mx-auto mb-4 leading-relaxed">
          {studioInfo?.tagline || "Handcrafted ceramic art that whispers elegance. Designed to reflect your unique story with grace and intention."}
        </p>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-6 md:gap-8 mb-6 text-sm font-semibold uppercase tracking-widest text-soil">
          {["Shop", "Workshops", "Studio", "About", "Contact"].map((label, idx) => (
            <Link
              key={idx}
              href={`/${label.toLowerCase()}`}
              className="relative group"
            >
              <motion.span
                className="inline-block"
                whileHover={{ scale: 1.2, color: "#C97C5D" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {label}
              </motion.span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-clay transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Social & Contact Icons */}
        <div className="flex justify-center gap-5 mb-6">
          <motion.a
            href={studioInfo?.instagram || "https://www.instagram.com/bashobyyshivangi"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-soil p-3 bg-white/50 rounded-full backdrop-blur-sm border border-soil/10 shadow-sm"
            whileHover={{ scale: 1.25, rotate: 10, backgroundColor: "#fff", color: "#C97C5D", boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <Instagram size={24} />
          </motion.a>
          <motion.a
            href={`mailto:${studioInfo?.email || "hello@basho.com"}`}
            className="text-soil p-3 bg-white/50 rounded-full backdrop-blur-sm border border-soil/10 shadow-sm"
            whileHover={{ scale: 1.25, rotate: -10, backgroundColor: "#fff", color: "#C97C5D", boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <Mail size={24} />
          </motion.a>
          <motion.a
            href={studioInfo?.mapLink || studioInfo?.mapUrl || "/contact"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-soil p-3 bg-white/50 rounded-full backdrop-blur-sm border border-soil/10 shadow-sm"
            whileHover={{ scale: 1.25, y: -5, backgroundColor: "#fff", color: "#C97C5D", boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <MapPin size={24} />
          </motion.a>
        </div>

        {/* Copyright */}
        <div className="border-t border-soil/20 pt-4 flex flex-col md:flex-row justify-between items-center text-sm text-soil font-medium">
          <p>© {currentYear} {studioInfo?.name || "Basho"}. All Rights Reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link href="/privacy" className="hover:text-clay hover:translate-x-1 transition-all duration-300 inline-block">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-clay hover:translate-x-1 transition-all duration-300 inline-block">
              Terms and Conditions
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
