"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { MapPin, Plus, Trash2, Loader2 } from "lucide-react";

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

export default function Profile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  // OTP State for Address Phone
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setAddresses(data.user.addresses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddr.name || !newAddr.street || !newAddr.city || !newAddr.pincode || !newAddr.phone) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!/^\d+$/.test(newAddr.pincode)) {
      alert("Pincode must contain only numbers.");
      return;
    }

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

  const handleSendAddressOtp = async () => {
    if (!newAddr.phone || newAddr.phone.length < 10) {
      alert("Please enter a valid phone number first.");
      return;
    }

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

  if (loading) return <div className="text-center py-20 flex justify-center"><Loader2 className="animate-spin text-clay" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-soil font-serif">Saved Addresses</h2>
          {!showAddAddr && (
            <button
              onClick={() => setShowAddAddr(true)}
              className="flex items-center gap-2 bg-clay text-white px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-clay/20 transition-all border-none"
            >
              <Plus size={18} /> Add New
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr: any, idx) => (
            <motion.div
              key={addr._id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl border border-sand/30 shadow-sm relative group"
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

        {addresses.length === 0 && !showAddAddr && (
          <div className="text-center py-12 bg-white rounded-3xl border border-sand/30 shadow-sm text-soil/40 italic font-medium">
            No addresses saved. Add one for faster checkout.
          </div>
        )}

        {showAddAddr && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl mt-6 border border-sand/30 shadow-sm"
          >
            <h3 className="text-xl font-bold text-soil mb-6 font-serif">New Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                placeholder="Label (e.g. Home, Office)"
                value={newAddr.label}
                onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                className="px-4 py-3 bg-sand/10 rounded-xl border border-sand/30 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay transition-all"
              />
              <input
                placeholder="Receiver Name"
                value={newAddr.name}
                onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                className="px-4 py-3 bg-sand/10 rounded-xl border border-sand/30 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay transition-all"
              />
              <input
                placeholder="Street Address"
                value={newAddr.street}
                onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                className="px-4 py-3 bg-sand/10 rounded-xl border border-sand/30 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay transition-all md:col-span-2"
              />
              <input
                placeholder="City"
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                className="px-4 py-3 bg-sand/10 rounded-xl border border-sand/30 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay transition-all"
              />
              <input
                placeholder="State"
                value={newAddr.state}
                onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                className="px-4 py-3 bg-sand/10 rounded-xl border border-sand/30 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay transition-all"
              />
              <input
                placeholder="Pincode (Numbers only)"
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value.replace(/\D/g, '') })}
                className="px-4 py-3 bg-sand/10 rounded-xl border border-sand/30 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay transition-all"
              />
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    placeholder="Phone"
                    value={newAddr.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewAddr({ ...newAddr, phone: val });
                      setIsVerified(false);
                    }}
                    className="px-4 py-3 bg-sand/10 rounded-xl border border-sand/30 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay transition-all flex-1"
                    disabled={isVerified}
                  />
                  {!isVerified && (
                    <button
                      onClick={handleSendAddressOtp}
                      disabled={saving || otpTimer > 0}
                      className="bg-brick text-white px-4 rounded-xl text-xs font-bold whitespace-nowrap disabled:opacity-50 hover:shadow-lg transition-all border-none"
                    >
                      {otpTimer > 0 ? `Retry (${otpTimer}s)` : "Verify"}
                    </button>
                  )}
                  {isVerified && (
                    <span className="flex items-center text-green-600 font-bold px-3 bg-green-50 rounded-xl border border-green-200 text-xs">
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
                      className="px-4 py-3 border-2 border-clay rounded-xl flex-1 focus:outline-none"
                    />
                    <button
                      onClick={handleVerifyAddressOtp}
                      className="bg-clay text-white px-6 rounded-xl font-bold border-none cursor-pointer"
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-8 pt-6 border-t border-sand/30">
              <button
                onClick={handleAddAddress}
                disabled={saving}
                className="bg-brick text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-brick/20 transition-all flex items-center gap-2 border-none cursor-pointer"
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
                className="text-soil/40 hover:text-soil px-4 font-bold border-none bg-transparent cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}
