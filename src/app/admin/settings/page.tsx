"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Trash2, Save, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { fadeInUp } from "@/lib/animations";
import AdminPageContainer from "@/components/admin/AdminPageContainer";

interface ShippingRate {
  _id: string;
  minWeight: number;
  maxWeight: number;
  rate: number;
}

export default function AdminSettings() {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // General Settings
  const [settings, setSettings] = useState({
    shippingMode: "weight",
    freeShippingThreshold: 0,
    pincodeRateDefault: 150,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // New Rate Form
  const [newRate, setNewRate] = useState({
    minWeight: "",
    maxWeight: "",
    rate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRates();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings/general");
      const data = await res.json();
      if (res.ok && data.settings) {
        setSettings({
          shippingMode: data.settings.shippingMode || "weight",
          freeShippingThreshold: data.settings.freeShippingThreshold || 0,
          pincodeRateDefault: data.settings.pincodeRateDefault || 150,
        });
      }
    } catch (err) {
      console.error("Failed to load settings");
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSuccessMessage("");
    try {
      const res = await fetch("/api/admin/settings/general", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSuccessMessage("Settings saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        alert("Failed to save settings");
      }
    } catch (err) {
      alert("Error saving settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const fetchRates = async () => {
    try {
      const res = await fetch("/api/admin/shipping-rates");
      const data = await res.json();
      if (res.ok) {
        setRates(data.rates);
      } else {
        setError("Failed to load rates");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/shipping-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minWeight: parseFloat(newRate.minWeight),
          maxWeight: parseFloat(newRate.maxWeight),
          rate: parseFloat(newRate.rate),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRates(
          [...rates, data.rate].sort((a, b) => a.minWeight - b.minWeight)
        );
        setNewRate({ minWeight: "", maxWeight: "", rate: "" });
      } else {
        setError(data.error || "Failed to add rate");
      }
    } catch (err) {
      setError("Failed to add rate");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRate = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      const res = await fetch(`/api/admin/shipping-rates?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setRates(rates.filter((r) => r._id !== id));
      } else {
        alert("Failed to delete");
      }
    } catch (err) {
      alert("Error deleting rate");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center">
        <Loader2 className="animate-spin inline mr-2" /> Loading settings...
      </div>
    );

  return (
    <AdminPageContainer title="Store Settings">
    <div className="space-y-8">
      {/* General Configuration Section */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-soil/10"
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-soil mb-2 flex items-center gap-2">
              ⚙️ General Configuration
            </h2>
            <p className="text-sm text-soil/60">
              Configure global shipping rules and free shipping thresholds.
            </p>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="bg-clay text-white px-6 py-2 rounded-lg font-bold hover:bg-clay/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {savingSettings ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipping Mode */}
          <div className="bg-sand/10 p-6 rounded-xl border border-soil/10">
            <label className="block font-bold text-soil mb-4">
              Shipping Calculation Mode
            </label>
            <div className="flex gap-4">
              <label
                className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${settings.shippingMode === "weight"
                  ? "border-clay bg-white shadow-md"
                  : "border-dashed border-soil/20 hover:bg-white/50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="mode"
                    className="w-5 h-5 accent-clay"
                    checked={settings.shippingMode === "weight"}
                    onChange={() =>
                      setSettings({ ...settings, shippingMode: "weight" })
                    }
                  />
                  <div>
                    <div className="font-bold text-soil">Weight Based</div>
                    <div className="text-xs text-soil/60 mt-1">
                      Calculates cost based on total weight of items.
                    </div>
                  </div>
                </div>
              </label>
              <label
                className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${settings.shippingMode === "pincode"
                  ? "border-clay bg-white shadow-md"
                  : "border-dashed border-soil/20 hover:bg-white/50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="mode"
                    className="w-5 h-5 accent-clay"
                    checked={settings.shippingMode === "pincode"}
                    onChange={() =>
                      setSettings({ ...settings, shippingMode: "pincode" })
                    }
                  />
                  <div>
                    <div className="font-bold text-soil">Pincode Based</div>
                    <div className="text-xs text-soil/60 mt-1">
                      Flat rate or per-pincode (coming soon).
                    </div>
                  </div>
                </div>
              </label>
            </div>

            {settings.shippingMode === "pincode" && (
              <div className="mt-4">
                <label className="block text-xs font-bold text-soil/70 mb-1">
                  Standard Pincode Rate (₹)
                </label>
                <input
                  type="number"
                  value={settings.pincodeRateDefault}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pincodeRateDefault: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 rounded-lg border border-soil/20 focus:outline-none focus:border-clay"
                />
              </div>
            )}
          </div>

          {/* Free Shipping Threshold */}
          <div className="bg-sand/10 p-6 rounded-xl border border-soil/10">
            <label className="block font-bold text-soil mb-2">
              Free Shipping Threshold
            </label>
            <p className="text-xs text-soil/60 mb-4">
              If the cart total exceeds this amount, shipping will be free. Set
              to 0 to disable.
            </p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-soil/50 font-bold">
                ₹
              </span>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    freeShippingThreshold: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full pl-8 pr-4 py-3 rounded-lg border border-soil/20 focus:outline-none focus:border-clay font-bold text-lg"
                placeholder="0"
              />
            </div>
            {settings.freeShippingThreshold > 0 && (
              <div className="mt-4 text-sm text-green-600 flex items-center gap-2 bg-green-50 p-2 rounded-lg border border-green-200">
                <AlertCircle size={16} /> Customers spending over ₹
                {settings.freeShippingThreshold} get FREE shipping.
              </div>
            )}
          </div>
        </div>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-green-100 text-green-800 p-4 rounded-xl text-center font-bold border border-green-200"
          >
            {successMessage}
          </motion.div>
        )}
      </section>

      {/* Shipping Rates Section */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-soil/10">
        <h2 className="text-xl font-bold text-soil mb-2 flex items-center gap-2">
          📦 Shipping Rates (By Weight)
        </h2>
        <p className="text-sm text-soil/60 mb-6">
          Define shipping costs based on order weight. The system will calculate
          the total weight of the cart and apply the matching rate.
        </p>

        {/* Existing Rates Table */}
        <div className="overflow-hidden rounded-xl border border-soil/10 mb-8">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand/30 text-soil font-semibold">
              <tr>
                <th className="p-4">Min Weight (kg)</th>
                <th className="p-4">Max Weight (kg)</th>
                <th className="p-4">Shipping Cost (₹)</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soil/5">
              {rates.length > 0 ? (
                rates.map((rate) => (
                  <tr key={rate._id} className="hover:bg-sand/10">
                    <td className="p-4 font-medium">{rate.minWeight}</td>
                    <td className="p-4 font-medium">{rate.maxWeight}</td>
                    <td className="p-4 font-bold text-clay">₹{rate.rate}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteRate(rate._id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-soil/40 italic"
                  >
                    No shipping rates defined yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add New Rate Form */}
        <div className="bg-sand/10 rounded-xl p-6 border border-2 border-dashed border-soil/10">
          <h3 className="font-bold text-soil mb-4 text-sm uppercase tracking-wide">
            Add New Rate Rule
          </h3>
          <form
            onSubmit={handleAddRate}
            className="flex flex-col md:flex-row gap-4 items-end"
          >
            <div className="flex-1">
              <label className="block text-xs font-bold text-soil/70 mb-1">
                Min Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={newRate.minWeight}
                onChange={(e) =>
                  setNewRate({ ...newRate, minWeight: e.target.value })
                }
                className="w-full p-2 rounded-lg border border-soil/20 focus:outline-none focus:border-clay"
                placeholder="0.0"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-soil/70 mb-1">
                Max Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={newRate.maxWeight}
                onChange={(e) =>
                  setNewRate({ ...newRate, maxWeight: e.target.value })
                }
                className="w-full p-2 rounded-lg border border-soil/20 focus:outline-none focus:border-clay"
                placeholder="2.0"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-soil/70 mb-1">
                Cost (₹)
              </label>
              <input
                type="number"
                required
                value={newRate.rate}
                onChange={(e) =>
                  setNewRate({ ...newRate, rate: e.target.value })
                }
                className="w-full p-2 rounded-lg border border-soil/20 focus:outline-none focus:border-clay"
                placeholder="100"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-soil text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-clay transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Plus size={18} />
              )}
              Add Rule
            </button>
          </form>
          {error && (
            <div className="mt-4 text-red-600 text-sm flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>
      </section>
    </div>
    </AdminPageContainer>
  );
}
