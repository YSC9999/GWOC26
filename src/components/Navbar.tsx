"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(res => setLoggedIn(res.ok));
  }, []);

  const navLinks = (
    <>
      <Link href="/" className="hover:text-clay">Home</Link>
      <Link href="/about" className="hover:text-clay">About</Link>
      <Link href="/products" className="hover:text-clay">Products</Link>
      <Link href="/workshops" className="hover:text-clay">Workshops</Link>
      <Link href="/studio" className="hover:text-clay">Studio</Link>
      <Link href="/contact" className="hover:text-clay">Contact</Link>

      {!loggedIn && (
        <>
          <Link href="/login" className="hover:text-clay">Login</Link>
          <Link href="/signup" className="hover:text-clay">Signup</Link>
        </>
      )}

      {loggedIn && (
        <>
          <Link href="/account" className="hover:text-clay">Account</Link>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/";
            }}
            className="hover:text-clay"
          >
            Logout
          </button>
        </>
      )}
     <Link href="/cart" className="hover:text-clay">Cart</Link>



      <Link
        href="/admin/login"
        className="border border-soil px-4 py-1 rounded-full hover:bg-soil hover:text-white transition"
      >
        Admin
      </Link>
    </>
  );

  return (
    <nav className="fixed w-full top-0 bg-sand/80 backdrop-blur z-50 border-b border-soil/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-serif text-2xl text-soil">
          Basho
        </Link>

        {/* Desktop Menu */}
        <div className="hidden min-[1100px]:flex space-x-6 uppercase text-sm tracking-widest items-center">
          {navLinks}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="min-[1100px]:hidden text-2xl"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
  <div className="min-[1100px]:hidden bg-sand px-6 py-8 border-t">
    <div className="flex flex-col items-center space-y-5 uppercase tracking-widest text-sm">
      {navLinks}
    </div>
  </div>
)}

    </nav>
  );
}
