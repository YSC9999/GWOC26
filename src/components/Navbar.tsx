"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Search, User, LogOut, ShoppingBag } from "lucide-react";
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
  if (pathname?.includes("/auth/") || pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <nav className="fixed w-full top-1 z-50 left-0 right-0 flex justify-center">
      <div className="bg-sand/80 backdrop-blur rounded-2xl border-4 border-soil w-11/12 max-w-6xl px-6 py-4 flex justify-between items-center gap-4 transition-all duration-300">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-3xl font-bold text-soil flex-shrink-0 whitespace-nowrap"
        >
          Basho
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-4 flex-1 ml-8">
          <div className="flex gap-4 uppercase text-xs tracking-widest font-medium text-soil/80">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-clay transition-colors relative group whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="flex items-center bg-white rounded-full px-3 py-2 border border-soil/20 flex-shrink-0 ml-auto">
             <input
               type="text"
               placeholder="Search..."
               className="bg-transparent outline-none text-xs w-24 placeholder-gray-400"
             />
             <Search size={16} className="text-soil/60" />
           </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Icon - Only when logged in */}
            {isAuthenticated && (
              <Link href="/cart" className="relative text-soil hover:text-clay transition-colors p-2">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-clay text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Desktop Auth */}
            {!isAuthenticated ? (
              <div className="flex gap-2 items-center flex-shrink-0">
                <Link
                  href="/login"
                  className="text-xs uppercase tracking-widest px-3 py-2 border-2 border-soil rounded-lg hover:bg-soil hover:text-sand transition text-soil font-semibold whitespace-nowrap"
                >
                  LOGIN
                </Link>
                <Link
                  href="/signup"
                  className="text-xs uppercase tracking-widest px-3 py-2 bg-soil text-sand rounded-lg hover:bg-soil/80 transition font-semibold whitespace-nowrap"
                >
                  SIGNUP
                </Link>
              </div>
            ) : (
              <div className="relative ml-2" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-white hover:shadow-lg transition-all"
                >
                    <User size={18} />
                </button>
                
                {profileOpen && (
                  <div className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="px-5 py-3 border-b border-gray-100 bg-sand/20">
                      <p className="text-sm font-bold text-soil truncate">{user?.name}</p>
                      <p className="text-xs text-soil/60 truncate">{user?.email}</p>
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
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden text-soil p-1"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {open && (
        <div className="lg:hidden bg-sand border-4 border-soil rounded-2xl mt-1 mx-auto w-11/12 max-w-6xl px-6 py-8 absolute top-20 z-40 shadow-xl">
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
        </div>
      )}
    </nav>
  );
}
