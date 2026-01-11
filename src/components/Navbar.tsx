"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogOut, ShoppingBag, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

export default function Navbar() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const { items } = useCart();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Calculate cart count
  const cartCount = items.reduce((acc, item) => acc + item.qty, 0);

  // Handle client-side mounting and auth check
  useEffect(() => {
    setMounted(true);

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const userData = await res.json();
          // Always update with server state if endpoint succeeds
          login(userData);
        } else {
          // If server says not authenticated, clear local state
          logout();
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        // On error, keep local state as-is
      }
    };

    // Add small delay to let zustand hydrate from localStorage
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timer);
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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    setProfileOpen(false);
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Collection" },
    { href: "/workshops", label: "Workshop" },
    { href: "/gallery", label: "Gallery" },
    { href: "/events", label: "Events" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  // Hide navbar on auth pages (after all hooks are called)
  if (
    pathname?.includes("/auth/") ||
    pathname === "/login" ||
    pathname === "/signup"
  ) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed w-full top-1 z-50 left-0 right-0 flex justify-center"
    >
      <div className="bg-sand/80 backdrop-blur rounded-2xl border-4 border-soil w-11/12 max-w-6xl px-6 py-4 flex justify-between items-center gap-4 transition-all duration-300 shadow-xl">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center flex-shrink-0 whitespace-nowrap"
        >
          <motion.img
            whileHover={{ scale: 1.05, rotate: -2 }}
            src="/Logo.png"
            alt="Basho Logo"
            className="h-14 w-auto object-contain"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-4 flex-1 ml-8">
          <div className="flex gap-4 uppercase text-xs tracking-widest font-medium text-soil/80">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative group whitespace-nowrap overflow-hidden"
              >
                <div className="relative">
                  <span className="block group-hover:-translate-y-full transition-transform duration-300 ease-in-out">
                    {link.label}
                  </span>
                  <span className="absolute top-0 left-0 block translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out text-clay font-bold">
                    {link.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 min-w-[150px] justify-end ml-auto">
            {mounted && (
              <>
                {/* Wishlist & Cart Icons - Only when logged in */}
                {isAuthenticated && (
                  <>
                    <Link
                      href="/account/wishlist"
                      className="relative text-soil hover:text-clay transition-colors p-2"
                    >
                      <motion.div whileHover={{ scale: 1.2 }}>
                        <Heart size={20} />
                      </motion.div>
                    </Link>

                    <Link
                      href="/cart"
                      className="relative text-soil hover:text-clay transition-colors p-2"
                    >
                      <motion.div whileHover={{ scale: 1.2 }}>
                        <ShoppingBag size={20} />
                        {cartCount > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-clay text-white text-[10px] font-bold flex items-center justify-center rounded-full"
                          >
                            {cartCount}
                          </motion.span>
                        )}
                      </motion.div>
                    </Link>
                  </>
                )}

                {/* Desktop Auth */}
                {!isAuthenticated ? (
                  <div className="flex gap-2 items-center flex-shrink-0">
                    <Link
                      href="/login"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="text-xs uppercase tracking-widest px-3 py-2 border-2 border-soil rounded-lg hover:bg-soil hover:text-sand transition text-soil font-semibold whitespace-nowrap"
                      >
                        LOGIN
                      </motion.button>
                    </Link>
                    <Link
                      href="/signup"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="text-xs uppercase tracking-widest px-3 py-2 bg-soil text-sand rounded-lg hover:bg-soil/80 transition font-semibold whitespace-nowrap"
                      >
                        SIGNUP
                      </motion.button>
                    </Link>
                  </div>
                ) : (
                  <div className="relative ml-2" ref={profileRef}>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-white hover:shadow-lg transition-all"
                    >
                      <User size={18} />
                    </motion.button>

                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden"
                        >
                          <div className="px-5 py-3 border-b border-gray-100 bg-sand/20">
                            <p className="text-sm font-bold text-soil truncate">
                              {user?.name}
                            </p>
                            <p className="text-xs text-soil/60 truncate">
                              {user?.email}
                            </p>
                          </div>

                          {user?.role == "admin" && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 text-sm text-soil/80 transition-colors"
                            >
                              📊 Admin Dashboard
                            </Link>
                          )}

                          <Link
                            href="/account"
                            className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 text-sm text-soil/80 transition-colors"
                          >
                            👤 My Account
                          </Link>

                          <Link
                            href="/account/orders"
                            className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 text-sm text-soil/80 transition-colors"
                          >
                            📦 My Orders
                          </Link>

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 text-sm text-red-600 transition-colors font-medium border-t border-gray-100"
                          >
                            <LogOut size={16} /> Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(!open)}
          className="lg:hidden text-soil p-1"
        >
          {open ? <X /> : <Menu />}
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="lg:hidden bg-sand border-4 border-soil rounded-2xl mt-1 mx-auto w-11/12 max-w-6xl px-6 py-8 absolute top-20 z-40 shadow-xl"
          >
            <div className="flex flex-col space-y-4 uppercase tracking-widest text-sm text-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link hover:text-clay py-2 border-b border-soil/10"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {!isAuthenticated ? (
                <div className="flex flex-col gap-3 mt-4 pt-4">
                  <Link
                    href="/auth/login"
                    className="text-sm uppercase tracking-widest px-4 py-2 border-2 border-soil rounded-lg hover:bg-soil hover:text-sand transition text-soil font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="text-sm uppercase tracking-widest px-4 py-2 bg-soil text-sand rounded-lg hover:bg-soil/80 transition font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    Signup
                  </Link>
                </div>
              ) : (
                <div className="mt-4 space-y-3 pt-4">
                  <Link
                    href="/cart"
                    className="nav-link hover:text-clay block"
                    onClick={() => setOpen(false)}
                  >
                    Cart ({cartCount})
                  </Link>
                  <Link
                    href="/account"
                    className="nav-link hover:text-clay block"
                    onClick={() => setOpen(false)}
                  >
                    My Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center px-4 py-2 text-red-600 font-medium text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
