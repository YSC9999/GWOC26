"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Package,
  Truck,
  Calendar,
  ChevronRight,
  Clock,
  User as UserIcon,
  CheckCircle2,
  Camera,
  Trash2,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  finalAmount: number;
  items: any[];
  createdAt: string;
}

export default function AccountDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [workshops, setWorkshops] = useState<any[]>([]);
  const [customRequests, setCustomRequests] = useState<any[]>([]);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [emailUpdates, setEmailUpdates] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, ordersRes, workshopsRes, customRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/orders"),
        fetch("/api/user/workshops"),
        fetch("/api/custom-orders")
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.user);
        setFormName(data.user.name);
        setFormEmail(data.user.email);
        setFormPhone(data.user.phone || "");
        // Default to true if undefined (for existing users who haven't set it yet, though backend defaults schema to true, existing docs might lack it)
        setEmailUpdates(data.user.acceptsMarketingEmails !== false);
      }

      const fetchedOrders = ordersRes.ok ? (await ordersRes.json()).orders || [] : [];
      setOrders(fetchedOrders);

      setWorkshops(workshopsRes.ok ? (await workshopsRes.json()).registrations || [] : []);
      setCustomRequests(customRes.ok ? (await customRes.json()).orders || [] : []);

      // SYNC PHONE: Prioritize the most recent order's phone number as requested
      if (fetchedOrders.length > 0 && fetchedOrders[0].shippingAddress?.phone) {
        setFormPhone(fetchedOrders[0].shippingAddress.phone);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          phone: formPhone,
          acceptsMarketingEmails: emailUpdates
        }),
      });
      if (res.ok) {
        // Refresh local state if needed
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdateAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simple base64 for demo/direct storage if small, normally should use S3/Cloudinary
    const reader = new FileReader();
    reader.onloadend = async () => {
      setSaving(true);
      try {
        const res = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ picture: reader.result }),
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          // Sync with global auth state
          const { login, user: authUser } = useAuth.getState();
          if (authUser) {
            login({ ...authUser, picture: data.user.picture });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const [deletionStep, setDeletionStep] = useState<'confirm' | 'otp'>('confirm');
  const [deletionOTP, setDeletionOTP] = useState("");
  const [requestingOTP, setRequestingOTP] = useState(false);
  const [deletionError, setDeletionError] = useState("");

  const handleRequestDeletionOTP = async () => {
    setRequestingOTP(true);
    setDeletionError("");
    try {
      const res = await fetch("/api/user/delete/request-otp", { method: "POST" });
      if (res.ok) {
        setDeletionStep('otp');
      } else {
        const data = await res.json();
        setDeletionError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setDeletionError("Something went wrong. Please try again.");
    } finally {
      setRequestingOTP(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletionOTP) {
      setDeletionError("Please enter the verification code");
      return;
    }
    setDeleting(true);
    setDeletionError("");
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: deletionOTP })
      });
      if (res.ok) {
        window.location.href = "/";
      } else {
        const data = await res.json();
        setDeletionError(data.error || "Invalid verification code");
      }
    } catch (err) {
      setDeletionError("Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-clay border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalOrders = orders.length;
  const activeShipmentsCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const memberYear = new Date(profile?.createdAt || Date.now()).getFullYear();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Welcome Header */}
      <section>
        <h1 className="text-4xl font-bold text-soil font-serif mb-2">
          Welcome back, {user.name?.split(' ')[0]}
        </h1>
        <p className="text-soil/60">Here is what is happening with your collection.</p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Package className="text-clay" size={24} />}
          label="TOTAL ORDERS"
          value={totalOrders}
          subtext="Clay treasures collected"
        />
        <StatCard
          icon={<Truck className="text-orange-500" size={24} />}
          label="ACTIVE SHIPMENTS"
          value={activeShipmentsCount}
          subtext="On the way"
        />
        <StatCard
          icon={<Calendar className="text-blue-500" size={24} />}
          label="MEMBER SINCE"
          value={memberYear}
          subtext="Part of our journey"
        />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Recent Activity */}
        <motion.section {...fadeInUp} className="bg-white rounded-3xl p-8 shadow-sm border border-sand/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-soil">Recent Activity</h2>
            <Link href="/account/orders" className="text-clay text-sm font-bold hover:underline">View All</Link>
          </div>

          <div className="space-y-4">
            {(() => {
              const activities = [
                ...orders.map(o => ({ ...o, type: 'order', date: o.createdAt }))
              ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

              if (activities.length === 0) {
                return <div className="text-center py-12 text-soil/40 italic">No recent activity</div>;
              }

              return activities.map((activity: any, idx) => {
                if (activity.type === 'order') {
                  const itemCount = activity.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
                  const firstImage = activity.items[0]?.image;
                  return (
                    <div key={`order-${activity._id}`} className="flex items-center justify-between p-4 rounded-2xl bg-sand/10 border border-sand/20">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
                          {firstImage ? (
                            <img src={firstImage} alt="Order" className="w-full h-full object-cover" />
                          ) : (
                            <Package size={20} className="text-soil/40" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-soil">{itemCount} Item{itemCount > 1 ? 's' : ''}</h4>
                          <p className="text-xs text-soil/50">{new Date(activity.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-soil">₹{activity.finalAmount}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${activity.status === 'delivered' ? 'text-green-500' : 'text-orange-500'}`}>{activity.status}</p>
                      </div>
                    </div>
                  );
                }
                if (activity.type === 'workshop') {
                  return (
                    <div key={`workshop-${activity._id}`} className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
                          {activity.workshopId?.image ? (
                            <img src={activity.workshopId.image} alt="Workshop" className="w-full h-full object-cover" />
                          ) : (
                            <Calendar size={20} className="text-blue-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-soil">Workshop: {activity.workshopId?.title || 'Workshop'}</h4>
                          <p className="text-xs text-soil/50">{new Date(activity.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Link href="/account/workshops" className="p-2 hover:bg-white rounded-lg transition-colors">
                        <ChevronRight size={16} className="text-blue-400" />
                      </Link>
                    </div>
                  );
                }
                if (activity.type === 'custom') {
                  return (
                    <div key={`custom-${activity._id}`} className="flex items-center justify-between p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden text-orange-400">
                          {activity.referenceImages?.[0] ? (
                            <img src={activity.referenceImages[0]} alt="Custom" className="w-full h-full object-cover" />
                          ) : (
                            <Clock size={20} />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-soil">Custom Request</h4>
                          <p className="text-xs text-soil/50">{new Date(activity.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">{activity.status}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              });
            })()}
          </div>
        </motion.section>

        {/* Account Details Form */}
        <motion.section {...fadeInUp} className="bg-white rounded-3xl p-8 shadow-sm border border-sand/30">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative group">
              <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center text-xl font-serif text-soil overflow-hidden border-2 border-white shadow-sm">
                {user.picture ? (
                  <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handleUpdateAvatar} />
              </label>
            </div>
            <div>
              <h2 className="text-xl font-bold text-soil">Account Details</h2>
              <p className="text-xs text-soil/50">Update your profile</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-soil/40 uppercase tracking-widest block mb-1">Full Name</label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sand/50 bg-sand/5 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay transition-all text-soil"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-soil/40 uppercase tracking-widest block mb-1">Email</label>
              <input
                value={formEmail}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-sand/50 bg-sand/5 opacity-50 cursor-not-allowed text-soil"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-soil/40 uppercase tracking-widest block mb-1">Phone</label>
              <input
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sand/50 bg-sand/5 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay transition-all text-soil"
              />
            </div>

            <div className="flex items-center gap-3 bg-sand/10 p-4 rounded-xl border border-sand/20">
              <input
                type="checkbox"
                id="emailUpdates"
                checked={emailUpdates}
                onChange={(e) => setEmailUpdates(e.target.checked)}
                className="w-5 h-5 accent-clay rounded cursor-pointer"
              />
              <label htmlFor="emailUpdates" className="cursor-pointer">
                <span className="block font-bold text-soil text-sm">Receive Email Updates</span>
                <span className="block text-xs text-soil/60 mt-0.5">
                  Get notified about new products, workshops, and exclusive offers.
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3 bg-brick text-white rounded-xl font-bold hover:shadow-lg hover:shadow-brick/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="text-red-400 text-xs font-bold hover:text-red-600 transition-colors flex items-center gap-1 py-2 sm:py-0"
              >
                <Trash2 size={14} /> Delete Account
              </button>
            </div>
          </form>
        </motion.section>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-sand/30"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <AlertTriangle className="text-red-500" size={32} />
              </div>

              {deletionStep === 'confirm' ? (
                <>
                  <h3 className="text-2xl font-bold text-soil text-center mb-4 font-serif">Delete Account?</h3>
                  <p className="text-soil/60 text-center mb-8">
                    This action is permanent. All your order history and profile data will be removed.
                    <br /><br />
                    <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Coupons you have used will not be available again.</span>
                  </p>

                  {deletionError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl text-center">
                      {deletionError}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeletionError("");
                      }}
                      className="flex-1 px-6 py-4 bg-sand/20 text-soil font-bold rounded-2xl hover:bg-sand/30 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRequestDeletionOTP}
                      disabled={requestingOTP}
                      className="flex-1 px-6 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {requestingOTP && <Loader2 size={18} className="animate-spin" />}
                      {requestingOTP ? "Sending OTP..." : "Request OTP"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-soil text-center mb-4 font-serif">Verify Deletion</h3>
                  <p className="text-soil/60 text-center mb-8">
                    We've sent a security code to your email. Please enter it below to confirm permanent deletion.
                  </p>

                  <div className="mb-6">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={deletionOTP}
                      onChange={(e) => setDeletionOTP(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-6 py-4 text-center text-2xl font-bold tracking-[1em] rounded-2xl border-2 border-sand/30 focus:border-red-400 focus:outline-none bg-sand/5 text-soil"
                    />
                  </div>

                  {deletionError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl text-center">
                      {deletionError}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setDeletionStep('confirm');
                        setDeletionError("");
                        setDeletionOTP("");
                      }}
                      className="flex-1 px-6 py-4 bg-sand/20 text-soil font-bold rounded-2xl hover:bg-sand/30 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="flex-1 px-6 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {deleting && <Loader2 size={18} className="animate-spin" />}
                      {deleting ? "Deleting..." : "Confirm Delete"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </div>

    </div>
  );
}

function StatCard({ icon, label, value, subtext }: { icon: React.ReactNode, label: string, value: string | number, subtext: string }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-sand/30 flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-sand/20 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-soil/40 tracking-widest uppercase mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-soil leading-tight">{value}</h3>
        <p className="text-[10px] text-soil/50 font-medium">{subtext}</p>
      </div>
    </div>
  );
}

