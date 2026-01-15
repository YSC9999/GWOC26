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
  X
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Overview", icon: <LayoutDashboard size={20} />, href: "/account" },
  { label: "My Workshops", icon: <Calendar size={20} />, href: "/account/workshops" },
  { label: "Custom Requests", icon: <ClipboardList size={20} />, href: "/account/custom-orders" },
  { label: "My Orders", icon: <Package size={20} />, href: "/account/orders" },
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
    <div className="min-h-screen bg-sand-50/50 pt-20 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-3xl p-4 lg:p-6 shadow-sm border border-sand/30 sticky top-24 z-30">

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex justify-between items-center mb-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-lg font-serif text-soil shadow-inner overflow-hidden border-2 border-white">
                  {user.picture ? (
                    <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-soil font-serif leading-tight">{user.name?.split(' ')[0]}</h2>
                  <p className="text-[10px] text-soil/50 truncate max-w-[120px]">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 bg-sand/30 text-soil rounded-xl hover:bg-sand/50 transition-colors"
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
                    <div className="hidden lg:flex flex-col items-center text-center mb-10">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-sand flex items-center justify-center text-3xl font-serif text-soil shadow-inner overflow-hidden mb-4 border-4 border-white">
                          {user.picture ? (
                            <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            user.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <label className="absolute bottom-4 right-0 p-2 bg-clay text-white rounded-full shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer">
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
                      <h2 className="text-xl font-bold text-soil font-serif">{user.name?.split(' ')[0]}</h2>
                      <p className="text-xs text-soil/50 truncate w-full">{user.email}</p>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1 mb-6 lg:mb-10">
                      {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                              ? "bg-brick text-white shadow-md shadow-brick/20"
                              : "text-soil/60 hover:bg-sand/30 hover:text-soil"
                              }`}
                          >
                            {item.icon}
                            {item.label}
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
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
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
