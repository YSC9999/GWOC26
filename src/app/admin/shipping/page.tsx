"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Trash2, Save, AlertCircle, Loader2, Upload, FileText, Settings, Truck, ArrowLeft } from "lucide-react";

interface ShippingRate {
    _id: string;
    minWeight: number;
    maxWeight: number;
    rate: number;
}

interface PincodeRate {
    _id: string;
    pincode: string;
    rate: number;
    description?: string;
}

export default function AdminShipping() {
    const [rates, setRates] = useState<ShippingRate[]>([]);
    const [pincodeRates, setPincodeRates] = useState<PincodeRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // General Settings
    const [settings, setSettings] = useState({
        shippingMode: "weight",
        freeShippingThreshold: 0,
        pincodeRateDefault: 150,
        pincodeType: "standard", // standard | specific | shiprocket_realtime | shiprocket_reference
        shiprocketReferencePincode: "110001",
        shiprocketReferencePrice: 50
    });
    const [savingSettings, setSavingSettings] = useState(false);

    // Forms
    const [newRate, setNewRate] = useState({ minWeight: "", maxWeight: "", rate: "" });

    // Pincode Form State
    const [isBulkPincode, setIsBulkPincode] = useState(false); // Toggle between Single and Bulk
    const [newPincodeRate, setNewPincodeRate] = useState({ pincode: "", rate: "", description: "" });
    const [bulkPincodesBuffer, setBulkPincodesBuffer] = useState(""); // Textarea content

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadAll = async () => {
            await Promise.all([fetchSettings(), fetchRates(), fetchPincodeRates()]);
            setLoading(false);
        };
        loadAll();
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
                    pincodeType: data.settings.pincodeType || "standard",
                    shiprocketReferencePincode: data.settings.shiprocketReferencePincode || "110001",
                    shiprocketReferencePrice: data.settings.shiprocketReferencePrice || 50
                });
            }
        } catch (err) { console.error(err); }
    };

    const fetchRates = async () => {
        try {
            const res = await fetch("/api/admin/shipping-rates");
            const data = await res.json();
            if (res.ok) setRates(data.rates);
        } catch (err) { console.error(err); }
    };

    const fetchPincodeRates = async () => {
        try {
            const res = await fetch("/api/admin/pincode-rates");
            const data = await res.json();
            if (res.ok) setPincodeRates(data.rates);
        } catch (err) { console.error(err); }
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        setSuccessMessage("");
        try {
            const res = await fetch("/api/admin/settings/general", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
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

    const handleAddRate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/shipping-rates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    minWeight: parseFloat(newRate.minWeight),
                    maxWeight: parseFloat(newRate.maxWeight),
                    rate: parseFloat(newRate.rate)
                })
            });
            const data = await res.json();
            if (res.ok) {
                setRates([...rates, data.rate].sort((a, b) => a.minWeight - b.minWeight));
                setNewRate({ minWeight: "", maxWeight: "", rate: "" });
            } else setError(data.error);
        } catch (err) { setError("Failed to add rate"); }
        finally { setSubmitting(false); }
    };

    const handleDeleteRate = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await fetch(`/api/admin/shipping-rates?id=${id}`, { method: "DELETE" });
        setRates(rates.filter(r => r._id !== id));
    };

    const handleAddPincodeRate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            let payload: any = {
                rate: parseFloat(newPincodeRate.rate),
                description: newPincodeRate.description
            };

            if (isBulkPincode) {
                // Parse Bulk Pincodes (Comma, Space, Newline)
                const codes = bulkPincodesBuffer.split(/[\s,]+/).map(s => s.trim()).filter(s => s.length > 0);
                if (codes.length === 0) {
                    setError("Please enter at least one pincode.");
                    setSubmitting(false);
                    return;
                }
                payload.pincodes = codes;
            } else {
                if (!newPincodeRate.pincode) {
                    setError("Pincode is required");
                    setSubmitting(false);
                    return;
                }
                payload.pincode = newPincodeRate.pincode;
            }

            const res = await fetch("/api/admin/pincode-rates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                if (isBulkPincode) {
                    alert(`Successfully added/updated ${data.count} pincodes.`);
                    setBulkPincodesBuffer("");
                } else {
                    setNewPincodeRate({ ...newPincodeRate, pincode: "" });
                }
                // Refresh list
                fetchPincodeRates();
            } else setError(data.error);
        } catch (err) { setError("Failed to add pincode rate"); }
        finally { setSubmitting(false); }
    };

    const handleDeletePincodeRate = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await fetch(`/api/admin/pincode-rates?id=${id}`, { method: "DELETE" });
        setPincodeRates(pincodeRates.filter(r => r._id !== id));
    };

    if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading settings...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin" className="text-soil/40 hover:text-soil transition-colors font-medium flex items-center gap-2">
                    <ArrowLeft size={18} /> Back to Admin
                </Link>
            </div>
            <h1 className="text-3xl font-bold text-soil mb-8 font-serif">Shipping Management</h1>

            {/* General Configuration Section */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-soil/10 mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-soil mb-2 flex items-center gap-2">
                            ⚙️ General Configuration
                        </h2>
                        <p className="text-sm text-soil/60">
                            Configure global shipping rules and threshold.
                        </p>
                    </div>
                    <button
                        onClick={handleSaveSettings}
                        disabled={savingSettings}
                        className="bg-clay text-white px-6 py-2 rounded-lg font-bold hover:bg-clay/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {savingSettings ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    {/* Free Shipping Threshold */}
                    <div className="bg-sand/10 p-6 rounded-xl border border-soil/10">
                        <label className="block font-bold text-soil mb-2">Free Shipping Threshold</label>
                        <p className="text-xs text-soil/60 mb-4">
                            If cart total exceeds this, shipping is FREE.
                        </p>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-soil/50 font-bold">₹</span>
                            <input
                                type="number"
                                value={settings.freeShippingThreshold}
                                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                                className="w-full pl-8 pr-4 py-3 rounded-lg border border-soil/20 focus:outline-none focus:border-clay font-bold text-lg"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Shipping Mode */}
                    <div className="bg-sand/10 p-6 rounded-xl border border-soil/10">
                        <label className="block font-bold text-soil mb-4">Calculation Mode</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${settings.shippingMode === 'weight' ? 'border-clay bg-white shadow-md' : 'border-dashed border-soil/20 hover:bg-white/50'}`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="mode"
                                        className="w-5 h-5 accent-clay"
                                        checked={settings.shippingMode === 'weight'}
                                        onChange={() => setSettings({ ...settings, shippingMode: 'weight' })}
                                    />
                                    <div>
                                        <div className="font-bold text-soil">Weight Based</div>
                                        <div className="text-xs text-soil/60 mt-1">Based on total weight.</div>
                                    </div>
                                </div>
                            </label>
                            <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${settings.shippingMode === 'pincode' ? 'border-clay bg-white shadow-md' : 'border-dashed border-soil/20 hover:bg-white/50'}`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="mode"
                                        className="w-5 h-5 accent-clay"
                                        checked={settings.shippingMode === 'pincode'}
                                        onChange={() => setSettings({ ...settings, shippingMode: 'pincode' })}
                                    />
                                    <div>
                                        <div className="font-bold text-soil">Pincode Based</div>
                                        <div className="text-xs text-soil/60 mt-1">Based on destination.</div>
                                    </div>
                                </div>
                            </label>
                        </div>
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

            {/* WEIGHT BASED UI */}
            {settings.shippingMode === 'weight' && (
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-soil/10">
                    <h2 className="text-xl font-bold text-soil mb-2 flex items-center gap-2">
                        📦 Weight Based Rates
                    </h2>
                    <p className="text-sm text-soil/60 mb-6">
                        Define costs based on total cart weight.
                    </p>

                    <div className="overflow-hidden rounded-xl border border-soil/10 mb-8">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-sand/30 text-soil font-semibold">
                                <tr>
                                    <th className="p-4">Min Weight (kg)</th>
                                    <th className="p-4">Max Weight (kg)</th>
                                    <th className="p-4">Cost (₹)</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-soil/5">
                                {rates.map((rate) => (
                                    <tr key={rate._id} className="hover:bg-sand/10">
                                        <td className="p-4">{rate.minWeight}</td>
                                        <td className="p-4">{rate.maxWeight}</td>
                                        <td className="p-4 font-bold text-clay">₹{rate.rate}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleDeleteRate(rate._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-sand/10 rounded-xl p-6 border-2 border-dashed border-soil/10">
                        <h3 className="font-bold text-soil mb-4 text-sm uppercase">Add Weight Rule</h3>
                        <form onSubmit={handleAddRate} className="flex gap-4 items-end">
                            <input type="number" step="0.1" required value={newRate.minWeight} onChange={e => setNewRate({ ...newRate, minWeight: e.target.value })} className="flex-1 p-2 rounded-lg border border-soil/20" placeholder="Min (kg)" />
                            <input type="number" step="0.1" required value={newRate.maxWeight} onChange={e => setNewRate({ ...newRate, maxWeight: e.target.value })} className="flex-1 p-2 rounded-lg border border-soil/20" placeholder="Max (kg)" />
                            <input type="number" required value={newRate.rate} onChange={e => setNewRate({ ...newRate, rate: e.target.value })} className="flex-1 p-2 rounded-lg border border-soil/20" placeholder="Cost (₹)" />
                            <button type="submit" disabled={submitting} className="bg-soil text-white px-5 py-2.5 rounded-lg hover:bg-clay">
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                            </button>
                        </form>
                    </div>
                </section>
            )}

            {/* PINCODE BASED UI */}
            {settings.shippingMode === 'pincode' && (
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-soil/10">
                    <h2 className="text-xl font-bold text-soil mb-2 flex items-center gap-2">
                        📍 Pincode Based Settings
                    </h2>

                    {/* Strategy Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {[
                            { id: 'standard', label: 'Standard Rate Only', desc: 'Flat rate for all pincodes' },
                            { id: 'specific', label: 'Specific + Fallback', desc: 'Custom rates for specific pincodes' },
                            { id: 'shiprocket_realtime', label: 'Shiprocket (Real-time)', desc: 'Actual courier rates via API', icon: <Truck size={16} /> },
                            { id: 'shiprocket_reference', label: 'Shiprocket (Reference)', desc: 'Use rate to specific city for all', icon: <Truck size={16} /> },
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setSettings({ ...settings, pincodeType: opt.id })}
                                className={`text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${settings.pincodeType === opt.id ? 'border-clay bg-sand/10 shadow-sm' : 'border-dashed border-soil/10 hover:bg-sand/5'}`}
                            >
                                <div className={`p-2 rounded-lg ${settings.pincodeType === opt.id ? 'bg-clay text-white' : 'bg-soil/10 text-soil'}`}>
                                    {opt.icon || <Settings size={16} />}
                                </div>
                                <div>
                                    <div className="font-bold text-soil text-sm">{opt.label}</div>
                                    <div className="text-xs text-soil/60">{opt.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Dynamic Context Settings */}
                    <div className="bg-sand/5 rounded-xl p-6 border border-soil/10">
                        {settings.pincodeType === 'standard' && (
                            <div>
                                <label className="block text-sm font-bold text-soil/70 mb-1">Standard Flat Rate (All Pincodes)</label>
                                <input type="number" value={settings.pincodeRateDefault} onChange={e => setSettings({ ...settings, pincodeRateDefault: parseFloat(e.target.value) })} className="p-2 border rounded-md" />
                            </div>
                        )}

                        {settings.pincodeType === 'specific' && (
                            <div>
                                <label className="block text-sm font-bold text-soil/70 mb-1">Fallback Standard Rate</label>
                                <input type="number" value={settings.pincodeRateDefault} onChange={e => setSettings({ ...settings, pincodeRateDefault: parseFloat(e.target.value) })} className="p-2 border rounded-md mb-2" />
                                <p className="text-xs text-soil/50">Used when a specific pincode is not found in the table below.</p>
                            </div>
                        )}

                        {settings.pincodeType === 'shiprocket_realtime' && (
                            <div className="flex items-center gap-3 text-soil/80">
                                <Truck className="text-clay" />
                                <p className="text-sm">Costs will be calculated automatically based on the customer's actual pincode using Shiprocket.</p>
                            </div>
                        )}

                        {settings.pincodeType === 'shiprocket_reference' && (
                            <div>
                                <label className="block text-sm font-bold text-soil/70 mb-1">Reference Pincode</label>
                                <input
                                    type="text"
                                    value={settings.shiprocketReferencePincode}
                                    onChange={(e) => setSettings({ ...settings, shiprocketReferencePincode: e.target.value })}
                                    className="w-full max-w-xs p-2 rounded-lg border border-soil/20 focus:outline-none focus:border-clay mb-4"
                                    placeholder="e.g. 110001"
                                />

                                <label className="block text-sm font-bold text-soil/70 mb-1">Your Desired Price (for 500g to Reference Pincode)</label>
                                <input
                                    type="number"
                                    value={settings.shiprocketReferencePrice || ''}
                                    onChange={(e) => setSettings({ ...settings, shiprocketReferencePrice: parseFloat(e.target.value) })}
                                    className="w-full max-w-xs p-2 rounded-lg border border-soil/20 focus:outline-none focus:border-clay"
                                    placeholder="e.g. 50"
                                />

                                <p className="text-xs text-soil/50 mt-2 bg-yellow-50 p-2 rounded border border-yellow-100">
                                    <b>How it works:</b> The system checks the actual Shiprocket cost for shipping <b>500g</b> to your Reference Pincode.
                                    <br />
                                    It calculates a multiplier: <code>(Your Price / Actual Cost)</code>.
                                    <br />
                                    This multiplier is then applied to the <b>Real-time Shiprocket Cost</b> for every customer order.
                                    <br />
                                    <i>Example: Actual=40, Your=50 → Multiplier=1.25. If Customer Actual=100, they pay 125.</i>
                                </p>
                            </div>
                        )}
                    </div>


                    {settings.pincodeType === 'specific' && (
                        <div className="mt-8">
                            <div className="overflow-hidden rounded-xl border border-soil/10 mb-8 max-h-96 overflow-y-auto">
                                <table className="w-full text-left text-sm relative">
                                    <thead className="bg-sand/30 text-soil font-semibold sticky top-0 z-10">
                                        <tr>
                                            <th className="p-4">Pincode</th>
                                            <th className="p-4">Description</th>
                                            <th className="p-4">Cost (₹)</th>
                                            <th className="p-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-soil/5">
                                        {pincodeRates.length > 0 ? (
                                            pincodeRates.map((rate) => (
                                                <tr key={rate._id} className="hover:bg-sand/10">
                                                    <td className="p-4 font-mono font-medium">{rate.pincode}</td>
                                                    <td className="p-4 text-soil/70">{rate.description || '-'}</td>
                                                    <td className="p-4 font-bold text-clay">₹{rate.rate}</td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => handleDeletePincodeRate(rate._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={4} className="p-8 text-center text-soil/40 italic">No specific rates added. Fallback rate applies to all.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-sand/10 rounded-xl p-6 border-2 border-dashed border-soil/10">
                                <h3 className="font-bold text-soil mb-4 text-sm uppercase flex items-center gap-2">
                                    Add Specific Pincode Rate
                                </h3>

                                <div className="flex gap-4 mb-4">
                                    <button
                                        onClick={() => setIsBulkPincode(false)}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isBulkPincode ? 'bg-soil text-white shadow-md' : 'bg-white text-soil border border-soil/20'}`}
                                    >
                                        Single Pincode
                                    </button>
                                    <button
                                        onClick={() => setIsBulkPincode(true)}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isBulkPincode ? 'bg-soil text-white shadow-md' : 'bg-white text-soil border border-soil/20'}`}
                                    >
                                        Bulk Upload (Multiple)
                                    </button>
                                </div>

                                <form onSubmit={handleAddPincodeRate} className="flex flex-col gap-4">
                                    {isBulkPincode ? (
                                        <div className="animate-in fade-in slide-in-from-top-2">
                                            <label className="block text-xs font-bold text-soil/70 mb-1">Pincodes (Comma, Space or Newline separated)</label>
                                            <textarea
                                                value={bulkPincodesBuffer}
                                                onChange={(e) => setBulkPincodesBuffer(e.target.value)}
                                                className="w-full p-3 rounded-lg border border-soil/20 focus:outline-none focus:border-clay min-h-[100px] font-mono text-sm"
                                                placeholder={`110001, 110002\n110003\n...`}
                                            />
                                            <p className="text-xs text-soil/50 mt-1">Paste a list of pincodes here. They will all receive the same rate specified below.</p>
                                        </div>
                                    ) : (
                                        <div className="flex gap-4 animate-in fade-in slide-in-from-top-2">
                                            <input type="text" value={newPincodeRate.pincode} onChange={e => setNewPincodeRate({ ...newPincodeRate, pincode: e.target.value })} className="flex-1 p-2 rounded-lg border border-soil/20" placeholder="Pincode (e.g. 110001)" />
                                        </div>
                                    )}

                                    <div className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-soil/70 mb-1">City/Area (Optional description)</label>
                                            <input type="text" value={newPincodeRate.description} onChange={e => setNewPincodeRate({ ...newPincodeRate, description: e.target.value })} className="w-full p-2 rounded-lg border border-soil/20" placeholder="City/Area (Optional)" />
                                        </div>
                                        <div className="w-32">
                                            <label className="block text-xs font-bold text-soil/70 mb-1">Rate (₹)</label>
                                            <input type="number" required value={newPincodeRate.rate} onChange={e => setNewPincodeRate({ ...newPincodeRate, rate: e.target.value })} className="w-full p-2 rounded-lg border border-soil/20" placeholder="Cost" />
                                        </div>
                                        <button type="submit" disabled={submitting} className="bg-soil text-white px-5 py-2.5 rounded-lg hover:bg-clay flex items-center gap-2">
                                            {submitting ? <Loader2 className="animate-spin" size={18} /> : (isBulkPincode ? <Upload size={18} /> : <Plus size={18} />)}
                                            {isBulkPincode ? "Bulk Add" : "Add"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {error && (<div className="fixed bottom-4 right-4 bg-red-100 text-red-600 px-4 py-2 rounded-lg shadow-lg border border-red-200 flex items-center gap-2"> <AlertCircle size={16} /> {error} </div>)}
        </div>
    );
}
