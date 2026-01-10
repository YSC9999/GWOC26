"use client";
import Link from "next/link";
import { Instagram, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-sand/30 border-t border-soil/10 mt-20 pt-16 pb-8">
      <div className="max-w-5xl mx-auto px-4 text-center">
        {/* Brand */}
        <Link href="/" className="inline-block mb-6">
          <h3 className="font-serif text-3xl font-bold text-soil hover:opacity-80 transition-opacity">
            Basho
          </h3>
        </Link>
        
        <p className="text-soil/60 text-sm max-w-md mx-auto mb-10 leading-relaxed font-light">
          Handcrafted ceramic art that whispers elegance. 
          Designed to reflect your unique story with grace and intention.
        </p>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-8 mb-12 text-sm font-medium uppercase tracking-widest text-soil/80">
          <Link href="/products" className="hover:text-clay transition-colors">Shop</Link>
          <Link href="/workshops" className="hover:text-clay transition-colors">Workshops</Link>
          <Link href="/gallery" className="hover:text-clay transition-colors">Gallery</Link>
          <Link href="/about" className="hover:text-clay transition-colors">Story</Link>
          <Link href="/contact" className="hover:text-clay transition-colors">Contact</Link>
        </nav>

        {/* Social & Contact Icons */}
        <div className="flex justify-center gap-6 mb-12">
          <a
            href="https://www.instagram.com/bashobyyshivangi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-soil/40 hover:text-clay transition-colors p-2"
            aria-label="Instagram"
          >
            <Instagram size={22} />
          </a>
          <a
             href="mailto:hello@basho.com"
             className="text-soil/40 hover:text-clay transition-colors p-2"
             aria-label="Email"
          >
            <Mail size={22} />
          </a>
          <Link 
             href="/contact"
             className="text-soil/40 hover:text-clay transition-colors p-2"
             aria-label="Visit Us"
          >
            <MapPin size={22} />
          </Link>
        </div>

        {/* Copyright */}
        <div className="border-t border-soil/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-soil/40 font-medium">
          <p>© {currentYear} Basho. All Rights Reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link href="/privacy" className="hover:text-soil transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-soil transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
