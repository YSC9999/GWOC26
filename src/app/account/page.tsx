"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { User, Package, MapPin, Heart, LogOut, Calendar } from "lucide-react";
import { useEffect } from "react";

export default function AccountDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not logged in, redirect to login
    // BUT checking user might need a moment, so check isAuthenticated too maybe?
    // Navbar does checkAuth on mount. 
    // Let's assume layout handles protection or we do it here.
    if (!user) {
      // router.push("/auth/login"); 
      // User might be null initially. A better way is to protect route via middleware or check loading.
      // For now, simple client-side check.
    }
  }, [user, router]);

  if (!user) {
    return <div className="min-h-screen pt-24 text-center">Loading...</div>;
  }

  const cards = [
    {
      label: "My Orders",
      desc: "View recent orders & status",
      icon: <Package size={32} />,
      href: "/account/orders",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Profile & Addresses",
      desc: "Manage account details",
      icon: <MapPin size={32} />,
      href: "/account/profile",
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Wishlist",
      desc: "Your favorite items",
      icon: <Heart size={32} />,
      href: "/account/wishlist",
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Custom Requests",
      desc: "Track bespoke orders",
      icon: <Package size={32} />,
      href: "/account/custom-orders",
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "My Workshops",
      desc: "Registered sessions",
      icon: <Calendar size={32} />,
      href: "/account/workshops",
      color: "bg-orange-50 text-orange-600",
    },

  ];

  return (
    <div className="min-h-screen pt-12 px-4 pb-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-sand/30 rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-clay text-white flex items-center justify-center text-4xl shadow-inner">
            {user.name.charAt(0)}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-soil font-serif mb-1">
              Hello, {user.name?.replace(" undefined", "")}
            </h1>
            <p className="text-soil/60">{user.email}</p>
            <span className="inline-block mt-2 bg-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-clay border border-clay/20">
              {user.role} Member
            </span>
          </div>
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
            className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-full font-medium hover:bg-red-50 transition-colors shadow-sm"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 block group"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${card.color} group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <h2 className="text-xl font-bold text-soil mb-2">{card.label}</h2>
              <p className="text-soil/60 text-sm">{card.desc}</p>
            </Link>
          ))}
        </div>

        {/* Recent Activity or Recommendations could go here */}

      </div>
    </div>
  );
}
