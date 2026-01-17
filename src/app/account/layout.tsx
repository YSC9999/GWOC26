"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Package,
  MapPin,
  Star,
  LogOut,
  Camera,
  Menu,
  X,
  Heart
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Overview", icon: <LayoutDashboard size={20} />, href: "/account" },
  { label: "My Orders", icon: <Package size={20} />, href: "/account/orders" },
  { label: "Wishlist", icon: <Heart size={20} />, href: "/account/wishlist" },
  { label: "My Workshops", icon: <Calendar size={20} />, href: "/account/workshops" },
  { label: "Custom Requests", icon: <ClipboardList size={20} />, href: "/account/custom-orders" },
  { label: "Addresses", icon: <MapPin size={20} />, href: "/account/profile" },
  { label: "My Reviews", icon: <Star size={20} />, href: "/account/reviews" },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FDF8F3] pt-20 pb-12 px-4 md:px-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#EFE5D8]/40 via-[#FDF8F3] to-[#F5EDE4]">
      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#C97C5D]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-[#5A3E36]/5 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 relative z-10">

        {/* Sidebar */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-[#EFE5D8]/40 backdrop-blur-xl rounded-[2rem] p-4 lg:p-6 shadow-xl shadow-[#5A3E36]/5 border border-[#5A3E36]/10 sticky top-24">

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex justify-between items-center mb-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4A574] to-[#C97C5D] flex items-center justify-center text-lg font-serif text-white shadow-lg overflow-hidden border-2 border-white/50">
                  {user.picture ? (
                    <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#5A3E36] font-serif leading-tight">{user.name?.split(' ')[0]}</h2>
                  <p className="text-[10px] text-[#5A3E36]/60 truncate max-w-[120px] font-medium tracking-wide">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 bg-[#5A3E36]/5 text-[#5A3E36] rounded-xl hover:bg-[#5A3E36]/10 transition-colors"
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* Desktop & Mobile Menu Content */}
            <AnimatePresence>
              {(isMenuOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className={`${isMenuOpen ? 'mt-6' : 'hidden lg:block'}`}
                >
                  <div className="overflow-hidden">
                    {/* User Profile Info (Desktop Only) */}
                    <div className="hidden lg:flex flex-col items-center text-center mb-8">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#D4A574] to-[#C97C5D] flex items-center justify-center text-3xl font-serif text-white shadow-xl shadow-[#C97C5D]/20 overflow-hidden mb-4 border-[4px] border-white">
                          {user.picture ? (
                            <img src={user.picture} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          ) : (
                            user.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <label className="absolute bottom-1 right-1 p-2 bg-[#5A3E36] text-[#EFE5D8] rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:scale-110 hover:bg-black">
                          <Camera size={14} />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onloadend = async () => {
                                try {
                                  const res = await fetch("/api/user/profile", {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ picture: reader.result }),
                                  });
                                  if (res.ok) {
                                    const data = await res.json();
                                    useAuth.getState().login({ ...user, picture: data.user.picture });
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      </div>
                      <h2 className="text-xl font-bold text-[#5A3E36] font-serif">{user.name?.split(' ')[0]}</h2>
                      <p className="text-xs text-[#5A3E36]/50 truncate w-full font-medium tracking-wide">{user.email}</p>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2 mb-6 lg:mb-10">
                      {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all relative overflow-hidden group ${isActive
                              ? "text-[#EFE5D8] shadow-lg shadow-[#5A3E36]/10"
                              : "text-[#5A3E36]/70 hover:bg-[#5A3E36]/5 hover:text-[#5A3E36]"
                              }`}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="activeAccountNav"
                                className="absolute inset-0 bg-[#5A3E36]"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              />
                            )}
                            <span className="relative z-10 flex items-center gap-3">
                              {item.icon}
                              {item.label}
                            </span>
                          </Link>
                        );
                      })}
                    </nav>

                    {/* Sign Out */}
                    <button
                      onClick={async () => {
                        try {
                          await fetch("/api/auth/logout", { method: "POST" });
                        } catch (err) {
                          console.error("Logout API failed", err);
                        }
                        logout();
                        router.push("/");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                    >
                      <LogOut size={20} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
