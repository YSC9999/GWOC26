"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Menu, X, Search, User } from "lucide-react";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [admin,setadmin] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const userData = await res.json();
        setLoggedIn(true);
        setUser(userData);
        setadmin(userData.tier === "tier-1");
      } else {
        setLoggedIn(false);
        setUser(null);
        setadmin(false);
      }
    } catch {
      setLoggedIn(false);
      setUser(null);
      setadmin(false);
    }
  };
  fetchUser();
}, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed w-full top-1 z-50 left-0 right-0 flex justify-center">
      <div className="bg-sand/80 backdrop-blur rounded-2xl border-4 border-soil w-11/12 max-w-6xl px-6 py-4 flex justify-between items-center gap-4">
        {/* Logo - Bigger */}
        <Link
          href="/"
          className="font-serif text-3xl font-bold text-soil flex-shrink-0 whitespace-nowrap"
        >
          Basho
        </Link>

        {/* Desktop Menu */}
        <div className="hidden min-[1100px]:flex items-center gap-4 flex-1 ml-8">
          {/* Navigation Links */}
          <div className="flex gap-4 uppercase text-sm tracking-widest">
            <Link href="/" className="nav-link hover:text-clay transition">
              Home
            </Link>
            <Link
              href="/about"
              className="nav-link hover:text-clay transition"
            >
              About
            </Link>
            <Link
              href="/products"
              className="nav-link hover:text-clay transition"
            >
              Collection
            </Link>
            <Link
              href="/workshops"
              className="nav-link hover:text-clay transition"
            >
              Workshop
            </Link>
            <Link href="/blog" className="nav-link hover:text-clay transition">
              Blog
            </Link>
            <Link
              href="/contact"
              className="nav-link hover:text-clay transition"
            >
              Contact
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex items-center bg-white rounded-full px-3 py-2 border border-soil/20 flex-shrink-0 ml-2">
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-xs w-24 placeholder-gray-400"
            />
            <Search size={16} className="text-soil/60" />
          </div>

          {/* Auth Buttons / Profile - Right Side */}
          {!loggedIn && (
            <div className="flex gap-2 items-center flex-shrink-0 ml-auto">
              <Link
                href="/auth/login"
                className="text-xs uppercase tracking-widest px-3 py-2 border-2 border-soil rounded-lg hover:bg-soil hover:text-sand transition text-soil font-semibold whitespace-nowrap"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="text-xs uppercase tracking-widest px-3 py-2 bg-soil text-sand rounded-lg hover:bg-soil/80 transition font-semibold whitespace-nowrap"
              >
                Signup
              </Link>
            </div>
          )}
          {loggedIn && (
            <div className="relative flex-shrink-0 ml-auto" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-white hover:shadow-lg transition-shadow"
              >
                <User size={20} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50">
                  {
                    admin &&(
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-sm"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          🪴
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-800">Admin Panel</div>
                          <div className="text-xs text-gray-500">
                            Manage through Dashboard
                          </div>
                        </div>
                      </Link>
                    )
                  }
                  <Link
                    href="/account/profile"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      👤
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">Profile</div>
                      <div className="text-xs text-gray-500">
                        Manage your account
                      </div>
                    </div>
                  </Link>
                  <Link
                    href="/cart"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs">
                      🛒
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">My Cart</div>
                      <div className="text-xs text-gray-500">
                        View your purchases
                      </div>
                    </div>
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={async () => {
                      await fetch("/api/auth/logout", { method: "POST" });
                      window.location.href = "/";
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-sm text-red-600 font-semibold"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                      →
                    </div>
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="min-[1100px]:hidden text-2xl flex-shrink-0"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="min-[1100px]:hidden bg-sand border-4 border-soil rounded-2xl mt-1 mx-auto w-11/12 max-w-6xl px-6 py-8">
          <div className="flex flex-col items-center space-y-4 uppercase tracking-widest text-sm">
            <Link href="/" className="nav-link hover:text-clay">
              Home
            </Link>
            <Link href="/about" className="nav-link hover:text-clay">
              About
            </Link>
            <Link href="/products" className="nav-link hover:text-clay">
              Collection
            </Link>
            <Link href="/workshops" className="nav-link hover:text-clay">
              Workshop
            </Link>
            <Link href="/blog" className="nav-link hover:text-clay">
              Blog
            </Link>
            <Link href="/contact" className="nav-link hover:text-clay">
              Contact
            </Link>
            <div className="w-full flex items-center bg-white rounded-full px-4 py-2 mt-4 border border-soil/20 justify-center gap-2">
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm placeholder-gray-400"
              />
              <Search size={18} className="text-soil/60" />
            </div>
            {!loggedIn && (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm uppercase tracking-widest px-4 py-2 border-2 border-soil rounded-lg hover:bg-soil hover:text-sand transition text-soil font-semibold"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm uppercase tracking-widest px-4 py-2 bg-soil text-sand rounded-lg hover:bg-soil/80 transition font-semibold"
                >
                  Signup
                </Link>
              </>
            )}
            {loggedIn && (
              <>
                <Link
                  href="/cart"
                  className="nav-link hover:text-clay mt-4"
                >
                  Cart
                </Link>
                <Link href="/account" className="nav-link hover:text-clay">
                  Account
                </Link>
                <button
                  onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  setLoggedIn(false);
                  setUser(null);
                  setadmin(false);
                  }}
                  className="nav-link hover:text-clay"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
