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
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  // Ensure we mount only on client to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Calculate cart count
  const cartCount = items.reduce((acc, item) => acc + item.qty, 0);

  useEffect(() => {
    setIsMounted(true);

    // Auth check logic
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const userData = await res.json();
          login(userData);
        } else {
          logout();
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };

    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout API failed", err);
    }
    logout();
    setProfileOpen(false);
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Collection" },
    { href: "/workshops", label: "Workshop" },
    { href: "/gallery", label: "Gallery" },
    { href: "/studio", label: "Studio" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  if (
    pathname?.includes("/auth/") ||
    pathname === "/login" ||
    pathname === "/signup"
  ) {
    return null;
  }

  // Use a stable layout for server/client to avoid hydration errors
  // We use opacity: 0 and animate in to hide any initial shift

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed w-full top-1 z-40 left-0 right-0 flex justify-center"
    >
      <div className="bg-[#EFE5D8]/90 backdrop-blur-md rounded-2xl border-2 border-[#5A3E36] w-11/12 max-w-6xl px-4 py-2.5 md:px-6 md:py-4 flex justify-between items-center gap-2 lg:gap-4 transition-all duration-300 shadow-xl">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center flex-shrink-0 whitespace-nowrap"
        >
          <motion.div
            whileHover={{
              scale: 1.05,
              y: -2,
              filter: "drop-shadow(0px 8px 16px rgba(90, 62, 54, 0.15))", // Soft earthy shadow
            }}
            whileTap={{ scale: 0.95, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }} // Snappy, premium feel
            className="relative"
          >
            <img
              src="/Logo.png"
              alt="Basho Logo"
              className="h-10 md:h-12 w-auto object-contain"
            />
          </motion.div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 ml-4 lg:ml-8">
          <div
            className="flex gap-1 uppercase text-xs tracking-widest font-medium text-[#5A3E36]/80 relative flex-wrap justify-center"
            style={{ fontFamily: "var(--font-edu-nsw-act)" }}
            onMouseLeave={() => setHoveredPath(null)}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const isHovered = hoveredPath === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHoveredPath(link.href)}
                  className={`relative px-3 py-2 rounded-full transition-colors duration-200 group ${
                    isActive
                      ? "text-[#EFE5D8]"
                      : isHovered
                        ? "text-[#C97C5D]"
                        : "hover:text-[#C97C5D]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-[#C97C5D] rounded-full"
                      style={{ zIndex: -1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                  {isHovered && !isActive && (
                    <motion.div
                      layoutId="hover-nav-pill"
                      className="absolute inset-0 bg-[#C97C5D]/10 rounded-full"
                      style={{ zIndex: -1 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Scroll Up Animation Container */}
                  <div className="relative overflow-hidden h-5 flex items-center justify-center">
                    <motion.div
                      initial={{ y: 0 }}
                      animate={{ y: isHovered && !isActive ? "-100%" : "0%" }}
                      transition={{ duration: 0.15, ease: "easeInOut" }}
                      className="flex flex-col items-center"
                    >
                      <span
                        className={`block ${
                          isActive ? "font-bold" : "font-semibold"
                        }`}
                      >
                        {link.label}
                      </span>
                      <span
                        className={`block absolute top-full ${
                          isActive ? "font-bold" : "font-semibold"
                        }`}
                      >
                        {link.label}
                      </span>
                    </motion.div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 min-w-[150px] justify-end ml-auto">
            {isMounted && (
              <>
                {isAuthenticated && (
                  <>
                    <Link
                      href="/account/wishlist"
                      className="relative text-[#5A3E36] hover:text-[#C97C5D] transition-colors p-2"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Heart size={20} />
                      </motion.div>
                    </Link>

                    <Link
                      href="/cart"
                      className="relative text-[#5A3E36] hover:text-[#C97C5D] transition-colors p-2"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ShoppingBag size={20} />
                        {cartCount > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-[#C97C5D] text-white text-[10px] font-bold flex items-center justify-center rounded-full"
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
                  <div className="flex gap-2 lg:gap-3 items-center flex-shrink-0">
                    <Link href="/login">
                      <motion.button
                        whileHover={{
                          scale: 1.05,
                          backgroundColor: "rgba(90, 62, 54, 0.1)",
                          boxShadow: "0 4px 12px rgba(90, 62, 54, 0.1)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="text-xs uppercase tracking-widest px-3 py-2 border border-[#5A3E36] rounded-lg text-[#5A3E36] font-bold whitespace-nowrap transition-all"
                      >
                        LOGIN
                      </motion.button>
                    </Link>
                    <Link href="/signup">
                      <motion.button
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 4px 12px rgba(201, 124, 93, 0.3)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="text-xs uppercase tracking-widest px-3 py-2 bg-[#5A3E36] text-[#EFE5D8] rounded-lg hover:bg-[#C97C5D] transition font-bold whitespace-nowrap"
                      >
                        SIGNUP
                      </motion.button>
                    </Link>
                  </div>
                ) : (
                  <div
                    className="relative ml-2 hidden sm:block"
                    ref={profileRef}
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#C97C5D] text-white hover:shadow-lg transition-all border-4 border-[#EFE5D8] overflow-hidden"
                    >
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={16} className="md:w-[18px] md:h-[18px]" />
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-6 w-72 bg-gradient-to-b from-[#FDF8F3] to-[#F5EDE4] rounded-2xl shadow-2xl border-[3px] border-[#5A3E36] py-4 overflow-hidden z-50 sm:w-80 md:w-72"
                        >
                          {/* Profile Header */}
                          <div className="px-5 py-4 border-b-2 border-[#5A3E36]/20">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C97C5D] to-[#a85a47] flex items-center justify-center text-white text-xl font-bold shadow-lg overflow-hidden">
                                {user.picture ? (
                                  <img
                                    src={user.picture}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  user?.name?.charAt(0)?.toUpperCase() || "U"
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-base font-bold text-[#5A3E36] truncate">
                                  {user?.name?.replace(" undefined", "")}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {user?.email}
                                </p>
                                <span
                                  className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                                    user?.role === "admin"
                                      ? "bg-[#5A3E36]/10 text-[#5A3E36]"
                                      : "bg-[#C97C5D]/10 text-[#C97C5D]"
                                  }`}
                                >
                                  {user?.role === "admin" ? (
                                    "⛩️"
                                  ) : (
                                    <User size={10} />
                                  )}{" "}
                                  {user?.role === "admin" ? "Admin" : "Member"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2 px-3 space-y-1">
                            <Link
                              href="/account"
                              className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-[#5A3E36]/5 transition-colors group"
                            >
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A574] to-[#C97C5D] flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                                <User size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#5A3E36]">
                                  Account
                                </p>
                                <p className="text-xs text-[#5A3E36]/50">
                                  Manage your account
                                </p>
                              </div>
                            </Link>

                            {user?.role === "admin" && (
                              <Link
                                href="/admin"
                                className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-[#5A3E36]/5 transition-colors group"
                              >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A574] to-[#C97C5D] flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
                                  ⛩️
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[#5A3E36]">
                                    Admin Panel
                                  </p>
                                  <p className="text-xs text-[#5A3E36]/50">
                                    Manage your store
                                  </p>
                                </div>
                              </Link>
                            )}
                          </div>

                          {/* Logout */}
                          <div className="px-3 pt-2 border-t-2 border-[#5A3E36]/20 mt-2">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-[#C97C5D]/10 transition-colors group"
                            >
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A574] to-[#C97C5D] flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                                <LogOut size={18} />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-semibold text-[#5A3E36]">
                                  Log out
                                </p>
                                <p className="text-xs text-[#5A3E36]/50">
                                  Sign out of your account
                                </p>
                              </div>
                            </button>
                          </div>
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
          className="lg:hidden text-[#5A3E36] p-1"
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
            className="lg:hidden bg-[#EFE5D8] border-4 border-[#5A3E36] rounded-2xl mt-2 mx-auto w-11/12 max-w-6xl px-5 py-6 absolute top-20 md:top-24 z-40 shadow-2xl max-h-[70vh] overflow-y-auto"
          >
            <div
              className="flex flex-col space-y-2 uppercase tracking-widest text-xs text-center text-[#5A3E36]"
              style={{ fontFamily: "var(--font-edu-nsw-act)" }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link hover:text-[#C97C5D] py-3 border-b border-[#5A3E36]/10 font-bold"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {!isAuthenticated ? (
                <div className="flex flex-col gap-3 mt-6 pt-4">
                  <Link
                    href="/login"
                    className="text-xs uppercase tracking-widest px-4 py-3 border-2 border-[#5A3E36] rounded-lg hover:bg-[#5A3E36] hover:text-[#EFE5D8] transition text-[#5A3E36] font-bold"
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="text-xs uppercase tracking-widest px-4 py-3 bg-[#C97C5D] text-white rounded-lg hover:bg-[#a85a47] transition font-bold"
                    onClick={() => setOpen(false)}
                  >
                    Signup
                  </Link>
                </div>
              ) : (
                <div className="mt-6 flex flex-col space-y-0 pt-4 border-t-2 border-[#5A3E36]/20">
                  {user?.role === "admin" && (
                    <Link
                      href="/admin"
                      className="hover:text-[#C97C5D] font-bold py-3 border-b border-[#5A3E36]/10 w-full"
                      onClick={() => setOpen(false)}
                    >
                      ⛩️ Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/cart"
                    className="hover:text-[#C97C5D] font-bold py-3 border-b border-[#5A3E36]/10 w-full"
                    onClick={() => setOpen(false)}
                  >
                    🛍️ Cart
                  </Link>
                  <Link
                    href="/account"
                    className="hover:text-[#C97C5D] font-bold py-3 border-b border-[#5A3E36]/10 w-full"
                    onClick={() => setOpen(false)}
                  >
                    👤 My Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center px-4 py-3 text-[#C97C5D] font-bold text-xs mt-2 hover:bg-[#C97C5D]/10 rounded-lg transition"
                  >
                    🚪 Sign Out
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
