"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { MapPin, Plus, Trash2, Save, Loader2 } from "lucide-react";

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
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/users/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
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
      const res = await fetch("/api/users/profile", {
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
    setSaving(true);
    try {
      const updatedAddresses = [...addresses, newAddr];
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updatedAddresses }),
      });
      if (res.ok) {
        const data = await res.json();
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  const handleRemoveAddress = async (id: string) => {
    if(!confirm("Delete this address?")) return;
    const updatedAddresses = addresses.filter(a => a._id !== id);
    try {
        await fetch("/api/users/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ addresses: updatedAddresses }),
        });
        setAddresses(updatedAddresses);
    } catch(err) { console.error(err); }
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

      {/* Addresses */}
      <section>
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

        {addresses.length === 0 && !showAddAddr && (
            <div className="text-center py-12 bg-sand/20 rounded-2xl text-soil/60">
                No addresses saved. Add one for faster checkout.
            </div>
        )}

        {/* Add Address Form */}
        {showAddAddr && (
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
                onChange={(e) => setNewAddr({...newAddr, label: e.target.value})}
                className="px-4 py-3 bg-sand/30 rounded-xl"
              />
              <input 
                placeholder="Receiver Name" 
                value={newAddr.name}
                onChange={(e) => setNewAddr({...newAddr, name: e.target.value})}
                className="px-4 py-3 bg-sand/30 rounded-xl"
              />
              <input 
                placeholder="Street Address" 
                value={newAddr.street}
                onChange={(e) => setNewAddr({...newAddr, street: e.target.value})}
                className="px-4 py-3 bg-sand/30 rounded-xl md:col-span-2"
              />
              <input 
                placeholder="City" 
                value={newAddr.city}
                onChange={(e) => setNewAddr({...newAddr, city: e.target.value})}
                className="px-4 py-3 bg-sand/30 rounded-xl"
              />
              <input 
                placeholder="State" 
                value={newAddr.state}
                onChange={(e) => setNewAddr({...newAddr, state: e.target.value})}
                className="px-4 py-3 bg-sand/30 rounded-xl"
              />
              <input 
                placeholder="Pincode" 
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({...newAddr, pincode: e.target.value})}
                className="px-4 py-3 bg-sand/30 rounded-xl"
              />
               <input 
                placeholder="Phone" 
                value={newAddr.phone}
                onChange={(e) => setNewAddr({...newAddr, phone: e.target.value})}
                className="px-4 py-3 bg-sand/30 rounded-xl"
              />
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
                onClick={() => setShowAddAddr(false)}
                className="text-soil/60 hover:text-soil px-4"
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
