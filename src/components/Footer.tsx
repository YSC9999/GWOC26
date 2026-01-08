"use client";
import Link from "next/link";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-sand to-sand/90 border-t-4 border-soil/30 mt-20">
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="flex flex-col">
            <h3 className="font-serif text-3xl font-bold text-soil mb-4">
              Basho
            </h3>
            <p className="text-soil/80 text-sm leading-relaxed mb-6">
              Handcrafted ceramic art that whispers elegance. Discover a curated
              collection designed to reflect your unique story with grace and
              intention.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-bold text-soil mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/main"
                  className="text-soil/80 hover:text-clay transition nav-link"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/main/products"
                  className="text-soil/80 hover:text-clay transition nav-link"
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link
                  href="/main/about"
                  className="text-soil/80 hover:text-clay transition nav-link"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/main/contact"
                  className="text-soil/80 hover:text-clay transition nav-link"
                >
                  Contact us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-soil/80 hover:text-clay transition nav-link"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* My Account */}
          <div>
            <h4 className="font-serif text-lg font-bold text-soil mb-6">
              My Account
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/auth/login"
                  className="text-soil/80 hover:text-clay transition nav-link"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/main/cart"
                  className="text-soil/80 hover:text-clay transition nav-link"
                >
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signup"
                  className="text-soil/80 hover:text-clay transition nav-link"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="text-soil/80 hover:text-clay transition nav-link"
                >
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-bold text-soil mb-6">
              Contact
            </h4>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <MapPin size={18} className="text-clay mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-soil mb-1">
                    Sales Office:
                  </p>
                  <p className="text-sm text-soil/80">
                    Handcraft Studio, Artisan Lane
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Mail size={18} className="text-clay mt-1 flex-shrink-0" />
                <p className="text-sm text-soil/80">hello@basho.com</p>
              </div>
              <div className="flex gap-3 items-start">
                <Phone size={18} className="text-clay mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-soil/80">+91 9876543210</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instagram Section */}
      <div className="border-t border-soil/20 pt-12 mb-12">
  <h4 className="font-serif text-xl font-bold text-soil mb-6 text-center">
    Follow us on Instagram
  </h4>

  <div className="flex justify-center gap-4">
    <a
      href="https://www.instagram.com/bashobyyshivangi?igsh=dzk3cTNsYTAzeGt6"
      target="_blank"
      rel="noopener noreferrer"
      className="text-clay hover:scale-110 transition inline-block"
    >
      <Instagram size={24} className="cursor-pointer" />
    </a>
  </div>
</div>


        {/* Bottom Section */}
        <div className="border-t border-soil/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-soil/70">
            © 2026 Basho. All Rights Reserved.
          </p>
          <p className="text-sm text-soil/70">We Ship Across the World</p>
        </div>
      </div>
    </footer>
  );
}
