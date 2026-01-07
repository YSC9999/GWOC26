// src/components/Navbar.jsx
"use client"; 
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  // --- CONTROL CENTER ---
  // Change this variable to 0, 1, 2, or 3 to test the tiers!
  const currentTier = 0; 
  // ----------------------

  const [isOpen, setIsOpen] = useState(false);

  // Standard Links (Tier 0+)
  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Products", href: "/products" },
    { name: "Workshops", href: "/workshops" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      
      {/* LOGO */}
      <div className="text-xl font-bold tracking-widest text-gray-800">
        LOGO
      </div>

      {/* CENTER LINKS */}
      <ul className="hidden md:flex space-x-6 text-sm font-medium text-gray-600">
        {links.map((l) => (
          <li key={l.name}>
            <Link href={l.href} className="hover:text-black transition-colors">
              {l.name}
            </Link>
          </li>
        ))}
      </ul>

      {/* RIGHT SIDE: AUTH / PROFILE */}
      <div>
        {currentTier === 0 ? (
          // TIER 0: Guest (Login/Signup Buttons)
          <div className="flex gap-3">
            <Link href="/login" className="px-4 py-1.5 border border-black rounded text-sm hover:bg-gray-50">
              Login
            </Link>
            <Link href="/signup" className="px-4 py-1.5 bg-black text-white rounded text-sm hover:bg-gray-800">
              Signup
            </Link>
          </div>
        ) : (
          // TIER 1, 2, 3: Logged In (Profile Dropdown)
          <div className="relative">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 focus:outline-none"
            >
              {/* Profile Icon circle with 'A' */}
              <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold">
                A
              </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded-md shadow-lg py-2 animate-in fade-in slide-in-from-top-1">
                
                {/* Header inside dropdown */}
                <div className="px-4 py-2 border-b border-gray-100 mb-2">
                  <p className="font-bold text-gray-800">R YSC 9999</p>
                  <p className="text-xs text-gray-500">meow@bomb.com</p>
                </div>

                {/* Menu Items */}
                <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">
                  Profile
                </Link>
                <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">
                  My Orders
                </Link>

                {/* TIER 2 & 3: Admin Section */}
                {currentTier >= 2 && (
                   <div className="my-1 border-t border-gray-100 pt-1">
                     <p className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase">Admin</p>
                     <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50">
                       Admin Dashboard
                     </Link>
                   </div>
                )}

                {/* TIER 3 SPECIFIC: Superior Admin */}
                {currentTier === 3 && (
                  <Link href="/admin/manage-admins" className="block px-4 py-2 text-sm text-purple-600 font-semibold hover:bg-purple-50">
                    + Add/Remove Admins
                  </Link>
                )}

                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                    Log out
                  </button>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}