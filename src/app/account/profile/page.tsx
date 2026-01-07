"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Settings, LogOut } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soil"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen px-4 md:px-12 pb-20">
      {/* Background accent */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sand/30 via-transparent to-clay/10"></div>

      <div className="max-w-7xl mx-auto">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-xl border border-soil/10 p-8 md:p-12 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Profile Avatar */}
            <div className="flex flex-col items-center md:col-span-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-6xl font-bold shadow-lg mb-4"
              >
                {user?.name?.charAt(0) || "U"}
              </motion.div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                👤 Member
              </div>
            </div>

            {/* User Info */}
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold text-soil mb-1">
                  {user?.name || "User"}
                </h1>
                <p className="text-gray-500 text-lg mb-6">{user?.email}</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail size={20} className="text-clay" />
                    <span>{user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone size={20} className="text-clay" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user?.address && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin size={20} className="text-clay" />
                      <span>{user.address}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Profile Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white rounded-2xl border border-soil/10 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform">
              👤
            </div>
            <h3 className="text-lg font-bold text-soil mb-1">Profile</h3>
            <p className="text-sm text-gray-500">Manage your account</p>
          </motion.div>

          {/* My Orders Option */}
          <Link href="/account/orders">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-white rounded-2xl border border-soil/10 p-6 hover:shadow-lg transition-shadow cursor-pointer group h-full"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform">
                🛒
              </div>
              <h3 className="text-lg font-bold text-soil mb-1">My Orders</h3>
              <p className="text-sm text-gray-500">Track your purchases</p>
            </motion.div>
          </Link>

          {/* My Avatars Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-white rounded-2xl border border-soil/10 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform">
              ⭐
            </div>
            <h3 className="text-lg font-bold text-soil mb-1">My Avatars</h3>
            <p className="text-sm text-gray-500">Express yourself in 3D</p>
          </motion.div>

          {/* My Blogs Option */}
          <Link href="/account/blogs">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="bg-white rounded-2xl border border-soil/10 p-6 hover:shadow-lg transition-shadow cursor-pointer group h-full"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform">
                ⚙️
              </div>
              <h3 className="text-lg font-bold text-soil mb-1">My Blogs</h3>
              <p className="text-sm text-gray-500">Your published content</p>
            </motion.div>
          </Link>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-shadow flex items-center justify-center gap-2">
            <Settings size={20} />
            Settings
          </button>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/";
            }}
            className="flex-1 bg-red-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
          >
            <LogOut size={20} />
            Log out
          </button>
        </motion.div>
      </div>
    </div>
  );
}
