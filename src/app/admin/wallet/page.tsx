"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Gift, Wallet, Users, Send } from "lucide-react";

export default function AdminWalletPage() {
    const [activeTab, setActiveTab] = useState<"single" | "random">("single");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [amount, setAmount] = useState("");
    const [randomCount, setRandomCount] = useState("5");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<any>(null);

    const handleSearch = async () => {
        if (!searchQuery) return;
        const res = await fetch(`/api/admin/users/search?q=${searchQuery}&role=customer`);
        const data = await res.json();
        setSearchResults(data.users || []);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setStatus(null);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/admin/wallet/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    mode: activeTab,
                    userId: selectedUser?._id,
                    amount: Number(amount),
                    count: Number(randomCount),
                    message
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus({ type: "success", msg: data.message || "Funds added successfully!" });
                setAmount("");
                setSelectedUser(null);
            } else {
                setStatus({ type: "error", msg: data.error });
            }
        } catch (err: any) {
            setStatus({ type: "error", msg: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-4xl font-serif font-bold text-soil mb-8 flex items-center gap-3">
                <Wallet className="w-10 h-10" /> Wallet Management
            </h1>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-soil/10 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-soil/10">
                    <button
                        onClick={() => setActiveTab("single")}
                        className={`flex-1 p-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'single' ? 'bg-soil text-white' : 'text-soil hover:bg-soil/5'}`}
                    >
                        <Search size={20} /> Add to User
                    </button>
                    <button
                        onClick={() => setActiveTab("random")}
                        className={`flex-1 p-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'random' ? 'bg-clay text-white' : 'text-soil hover:bg-clay/5'}`}
                    >
                        <Gift size={20} /> Random Giveaway
                    </button>
                </div>

                <div className="p-8">
                    {activeTab === "single" ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-soil mb-2">Search User</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Name or Email..."
                                        className="flex-1 p-3 border border-soil/20 rounded-xl focus:outline-none focus:border-soil"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button onClick={handleSearch} className="bg-soil text-white px-6 rounded-xl hover:bg-soil/90">Search</button>
                                </div>
                            </div>

                            {/* Results */}
                            {searchResults.length > 0 && !selectedUser && (
                                <div className="border border-soil/10 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                                    {searchResults.map(user => (
                                        <div
                                            key={user._id}
                                            onClick={() => { setSelectedUser(user); setSearchResults([]); }}
                                            className="p-3 hover:bg-soil/5 cursor-pointer flex justify-between items-center border-b border-soil/5 last:border-0"
                                        >
                                            <div>
                                                <div className="font-bold">{user.name}</div>
                                                <div className="text-xs opacity-60">{user.email}</div>
                                            </div>
                                            <div className="text-clay font-bold">₹{user.walletBalance || 0}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedUser && (
                                <div className="bg-soil/5 p-4 rounded-xl flex justify-between items-center">
                                    <div>
                                        <span className="text-xs uppercase tracking-wider opacity-60">Selected User</span>
                                        <div className="font-bold text-xl">{selectedUser.name}</div>
                                        <div className="text-sm opacity-60">{selectedUser.email}</div>
                                    </div>
                                    <button onClick={() => setSelectedUser(null)} className="text-red-500 text-sm font-bold">Valid</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-clay/10 to-orange-100 p-6 rounded-2xl border border-clay/20 flex items-center gap-4">
                                <Gift className="w-12 h-12 text-clay" />
                                <div>
                                    <h3 className="font-bold text-clay text-lg">Giveaway Mode</h3>
                                    <p className="text-sm text-soil/70">Randomly select users and add funds to their wallet.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-soil mb-2">Number of Winners</label>
                                <div className="flex items-center gap-3">
                                    <Users className="text-soil/40" />
                                    <input
                                        type="number"
                                        className="w-full p-3 border border-soil/20 rounded-xl focus:outline-none focus:border-clay"
                                        value={randomCount}
                                        onChange={(e) => setRandomCount(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Common Fields */}
                    <div className="mt-8 space-y-6 border-t border-soil/10 pt-8">
                        <div>
                            <label className="block text-sm font-bold text-soil mb-2">Amount (₹)</label>
                            <input
                                type="number"
                                placeholder="e.g. 500"
                                className="w-full p-4 text-2xl font-bold border border-soil/20 rounded-xl focus:outline-none focus:border-green-600"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-soil mb-2">Message (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Gift for being a loyal customer!"
                                className="w-full p-3 border border-soil/20 rounded-xl focus:outline-none focus:border-soil"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>

                        <button
                            disabled={loading || (activeTab === 'single' && !selectedUser) || !amount}
                            onClick={handleSubmit}
                            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? "Processing..." : (
                                <>
                                    <Send size={20} />
                                    {activeTab === 'single' ? 'Add Funds to User' : `Distribute to ${randomCount} Users`}
                                </>
                            )}
                        </button>

                        {status && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-xl text-center font-bold ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                            >
                                {status.msg}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
