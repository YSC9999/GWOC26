import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import Link from "next/link";
import { Instagram, Mail, MapPin } from "lucide-react";

export default function Footer() {
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
          Handcrafted ceramic art that whispers elegance. Designed to reflect
          your unique story with grace and intention.
        </p>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-6 md:gap-8 mb-6 text-sm font-semibold uppercase tracking-widest text-soil">
          <Link href="/products" className="hover:text-clay transition-colors">
            Shop
          </Link>
          <Link href="/workshops" className="hover:text-clay transition-colors">
            Workshops
          </Link>
          <Link href="/studio" className="hover:text-clay transition-colors">
            Studio
          </Link>
          <Link href="/about" className="hover:text-clay transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-clay transition-colors">
            Contact
          </Link>
        </nav>

        {/* Social & Contact Icons */}
        <div className="flex justify-center gap-5 mb-6">
          <a
            href="https://www.instagram.com/bashobyyshivangi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-soil hover:text-clay transition-colors p-2"
            aria-label="Instagram"
          >
            <Instagram size={24} />
          </a>
          <a
            href="mailto:hello@basho.com"
            className="text-soil hover:text-clay transition-colors p-2"
            aria-label="Email"
          >
            <Mail size={24} />
          </a>
          <Link
            href="/contact"
            className="text-soil hover:text-clay transition-colors p-2"
            aria-label="Visit Us"
          >
            <MapPin size={24} />
          </Link>
        </div>

        {/* Copyright */}
        <div className="border-t border-soil/20 pt-4 flex flex-col md:flex-row justify-between items-center text-sm text-soil font-medium">
          <p>© {currentYear} Basho. All Rights Reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link href="/privacy" className="hover:text-clay transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-clay transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
