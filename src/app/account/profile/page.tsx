"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { MapPin, Plus, Trash2, Save, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Address {
  _id?: string;
  label: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}



// ... (existing helper function if any)

export default function Profile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);

  // New Address State
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddr, setNewAddr] = useState<Address>({
    label: "Home",
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false
  });

  useEffect(() => {
    fetchProfile();
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/user/wishlist");
      if (res.ok) {
        const data = await res.json();
        setProfile((prev: any) => ({ ...prev, wishlist: data.wishlist }));
      }
    } catch (err) { console.error(err); }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile((prev: any) => ({ ...prev, ...data.user }));
        setName(data.user.name);
        setPhone(data.user.phone || "");
        setAddresses(data.user.addresses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (res.ok) {
        setEditing(false);
        const data = await res.json();
        setProfile(data.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async () => {
    // Basic Client-side Validation
    if (!newAddr.name || !newAddr.street || !newAddr.city || !newAddr.pincode || !newAddr.phone) {
      alert("Please fill in all required fields.");
      return;
    }

    // Validate Pincode (simple digit check)
    if (!/^\d+$/.test(newAddr.pincode)) {
      alert("Pincode must contain only numbers.");
      return;
    }

    // Validate Phone and format (default to +91 if missing)
    let formattedPhone = newAddr.phone.replace(/[^\d+]/g, "");
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+91" + formattedPhone;
    }

    const addrToSend = { ...newAddr, phone: formattedPhone };

    setSaving(true);
    try {
      const updatedAddresses = [...addresses, addrToSend];
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updatedAddresses }),
      });

      const data = await res.json();

      if (res.ok) {
        setAddresses(data.user.addresses);
        setShowAddAddr(false);
        setNewAddr({
          label: "Home",
          name: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          pincode: "",
          country: "India",
          isDefault: false
        });
      } else {
        alert(data.error || "Failed to save address.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please check your connection.");
    } finally {
      setSaving(false);
    }
  };

  // OTP State for Address Phone
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSendAddressOtp = async () => {
    if (!newAddr.phone || newAddr.phone.length < 10) {
      alert("Please enter a valid phone number first.");
      return;
    }

    // Auto-format
    let formattedPhone = newAddr.phone.replace(/[^\d+]/g, "");
    if (!formattedPhone.startsWith("+")) formattedPhone = "+91" + formattedPhone;

    setSaving(true);
    try {
      const res = await fetch("/api/auth/send-phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowOtpInput(true);
        setOtpTimer(10);
        // Alert removed as requested
      } else {
        alert(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP.");
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyAddressOtp = async () => {
    if (!otp) {
      alert("Please enter the OTP.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/verify-phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsVerified(true);
        setShowOtpInput(false);
        setOtp("");
        alert("Phone Verified Successfully!");
      } else {
        alert(data.error || "Invalid OTP.");
      }
    } catch (err) {
      console.error(err);
      alert("Verification failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    const updatedAddresses = addresses.filter(a => a._id !== id);
    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updatedAddresses }),
      });
      setAddresses(updatedAddresses);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="text-center py-20">Loading profile...</div>;

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-soil font-serif mb-8">Profile & Addresses</h1>

      {/* Personal Info */}
      <section className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-soil">Personal Information</h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="text-clay font-medium hover:underline"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={() => setEditing(false)}
                className="text-soil/40 hover:text-soil"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                disabled={saving}
                className="flex items-center gap-2 bg-soil text-white px-4 py-2 rounded-lg text-sm"
              >
                {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />} Save
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-soil/60 mb-1">Full Name</label>
            {editing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field w-full border border-soil/20 rounded-lg px-3 py-2"
              />
            ) : (
              <div className="font-medium text-soil">{profile.name}</div>
            )}
          </div>
          <div>
            <label className="block text-sm text-soil/60 mb-1">Email</label>
            <div className="font-medium text-soil">{profile.email}</div>
          </div>
          <div>
            <label className="block text-sm text-soil/60 mb-1">Phone</label>
            {editing ? (
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field w-full border border-soil/20 rounded-lg px-3 py-2"
                placeholder="+91..."
              />
            ) : (
              <div className="font-medium text-soil">{profile.phone || "Not set"}</div>
            )}
          </div>
        </div>
      </section>



      {/* Wishlist Section */}
      <section className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
        <h2 className="text-xl font-bold text-soil mb-6">My Wishlist</h2>

        {
          profile?.wishlist?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profile.wishlist.map((item: any, index: number) => (
                <div key={item._id || index} className="border border-stone-100 rounded-lg p-3 relative group">
                  <button
                    onClick={async () => {
                      if (!confirm("Remove from wishlist?")) return;
                      try {
                        const res = await fetch("/api/user/wishlist", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ productId: item._id }),
                        });
                        if (res.ok) {
                          const data = await res.json();
                          fetchProfile();
                        }
                      } catch (err) { console.error(err); }
                    }}
                    className="absolute top-2 right-2 text-red-500 bg-white rounded-full p-1 shadow-sm hover:scale-110 transition-transform z-10"
                  >
                    <Trash2 size={16} />
                  </button>

                  {item.name ? (
                    <Link href={`/products/${item._id}`}>
                      <div className="h-32 rounded-md overflow-hidden mb-3 relative">
                        <img src={item.images?.[0] || item.image || '/placeholder.png'} alt={item.name} className={`w-full h-full object-cover ${!item.inStock ? 'opacity-50' : ''}`} />
                        {!item.inStock && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <span className="bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-sm">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-soil text-sm line-clamp-1">{item.name}</h3>
                      <p className="text-clay font-bold mt-1">₹{item.price}</p>
                    </Link>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-4">
                      <div className="h-20 w-20 bg-stone-100 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-2xl">?</span>
                      </div>
                      <p className="text-xs font-bold text-soil/60">Product Unavailable</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-soil/60 bg-sand/20 rounded-xl">
              Your wishlist is empty.
            </div>
          )
        }
      </section >

      {/* Addresses */}
      < section >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-soil">Saved Addresses</h2>
          <button
            onClick={() => setShowAddAddr(true)}
            className="flex items-center gap-2 bg-clay text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-clay/90 transition-colors"
          >
            <Plus size={16} /> Add New
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr: any, idx) => (
            <motion.div
              key={addr._id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-soil/10 relative group"
            >
              <button
                onClick={() => handleRemoveAddress(addr._id)}
                className="absolute top-4 right-4 text-soil/20 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-clay" />
                <span className="font-bold text-soil">{addr.label}</span>
                {addr.isDefault && (
                  <span className="text-[10px] bg-sand px-2 py-0.5 rounded-full uppercase tracking-wider font-bold text-soil/60">
                    Default
                  </span>
                )}
              </div>
              <p className="font-medium text-soil mb-1">{addr.name}</p>
              <p className="text-sm text-soil/70 whitespace-pre-line leading-relaxed">
                {addr.street}
                <br />
                {addr.city}, {addr.state} - {addr.pincode}
                <br />
                Ph: {addr.phone}
              </p>
            </motion.div>
          ))}
        </div>

        {
          addresses.length === 0 && !showAddAddr && (
            <div className="text-center py-12 bg-sand/20 rounded-2xl text-soil/60">
              No addresses saved. Add one for faster checkout.
            </div>
          )
        }

        {/* Add Address Form */}
        {
          showAddAddr && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-white p-8 rounded-2xl mt-6 border-2 border-clay/10"
            >
              <h3 className="font-bold text-soil mb-6">New Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  placeholder="Label (e.g. Home, Office)"
                  value={newAddr.label}
                  onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                  className="px-4 py-3 bg-sand/30 rounded-xl"
                />
                <input
                  placeholder="Receiver Name"
                  value={newAddr.name}
                  onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                  className="px-4 py-3 bg-sand/30 rounded-xl"
                />
                <input
                  placeholder="Street Address"
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="px-4 py-3 bg-sand/30 rounded-xl md:col-span-2"
                />
                <input
                  placeholder="City"
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  className="px-4 py-3 bg-sand/30 rounded-xl"
                />
                <input
                  placeholder="State"
                  value={newAddr.state}
                  onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                  className="px-4 py-3 bg-sand/30 rounded-xl"
                />
                <input
                  placeholder="Pincode (Numbers only)"
                  value={newAddr.pincode}
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value.replace(/\D/g, '') })}
                  className="px-4 py-3 bg-sand/30 rounded-xl"
                />
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      placeholder="Phone"
                      value={newAddr.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setNewAddr({ ...newAddr, phone: val });
                        setIsVerified(false); // Reset if changed
                      }}
                      className="px-4 py-3 bg-sand/30 rounded-xl flex-1"
                      disabled={isVerified}
                    />
                    {!isVerified && (
                      <button
                        onClick={handleSendAddressOtp}
                        disabled={saving || otpTimer > 0}
                        className="bg-black text-white px-3 rounded-xl text-xs font-bold whitespace-nowrap disabled:opacity-50"
                      >
                        {otpTimer > 0 ? `Retry (${otpTimer}s)` : "Verify"}
                      </button>
                    )}
                    {isVerified && (
                      <span className="flex items-center text-green-600 font-bold px-3 bg-green-50 rounded-xl border border-green-200">
                        Verified ✓
                      </span>
                    )}
                  </div>

                  {showOtpInput && !isVerified && (
                    <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                      <input
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="px-4 py-2 border-2 border-clay rounded-xl flex-1"
                      />
                      <button
                        onClick={handleVerifyAddressOtp}
                        className="bg-clay text-white px-4 rounded-xl font-bold"
                      >
                        Confirm
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleAddAddress}
                  disabled={saving}
                  className="bg-clay text-white px-6 py-3 rounded-xl font-bold hover:bg-clay/90 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="animate-spin" /> : "Save Address"}
                </button>
                <button
                  onClick={() => {
                    setShowAddAddr(false);
                    setShowOtpInput(false);
                    setOtp("");
                    setIsVerified(false);
                  }}
                  className="text-soil/60 hover:text-soil px-4"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )
        }
      </section >
    </div >
  );
}
