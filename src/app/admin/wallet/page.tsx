"use client";

import React, { useState } from "react";
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
    const [searching, setSearching] = useState(false);

    // Debounce Search
    React.useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setSearching(true);
                try {
                    const res = await fetch(`/api/admin/users/search?q=${searchQuery}`);
                    const data = await res.json();
                    setSearchResults(data.users || []);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSubmit = async () => {
        setLoading(true);
        setStatus(null);
        try {
            // Removed manual token header to rely on HttpOnly cookies which is more secure and reliable
            const res = await fetch("/api/admin/wallet/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
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
                setSearchQuery(""); // Clear search on success
                setSearchResults([]);
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
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
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
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Type Name or Email..."
                                        className="w-full p-3 border border-soil/20 rounded-xl focus:outline-none focus:border-soil pl-10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-soil/40" size={18} />
                                    {searching && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="animate-spin h-4 w-4 border-2 border-soil border-t-transparent rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Results */}
                            {searchQuery.length > 2 && !selectedUser && (
                                <div className="border border-soil/10 rounded-xl overflow-hidden max-h-60 overflow-y-auto bg-white">
                                    {searchResults.length === 0 && !searching ? (
                                        <div className="p-4 text-center text-soil/50 text-sm">No users found</div>
                                    ) : (
                                        searchResults.map(user => (
                                            <div
                                                key={user._id}
                                                onClick={() => { setSelectedUser(user); setSearchResults([]); setSearchQuery(""); }}
                                                className="p-3 hover:bg-soil/5 cursor-pointer flex justify-between items-center border-b border-soil/5 last:border-0 transition-colors"
                                            >
                                                <div>
                                                    <div className="font-bold text-soil">{user.name}</div>
                                                    <div className="text-xs opacity-60 text-soil">{user.email}</div>
                                                </div>
                                                <div className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded text-xs">
                                                    ₹{user.walletBalance || 0}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {selectedUser && (
                                <div className="bg-soil/5 p-4 rounded-xl flex justify-between items-center border border-soil/10">
                                    <div>
                                        <span className="text-xs uppercase tracking-wider opacity-60 font-bold text-soil">Selected User</span>
                                        <div className="font-bold text-xl text-soil">{selectedUser.name}</div>
                                        <div className="text-sm opacity-60 text-soil">{selectedUser.email}</div>
                                        <div className="text-xs text-green-600 mt-1 font-medium">Current Balance: ₹{selectedUser.walletBalance || 0}</div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded text-sm font-bold transition-all"
                                    >Change</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-clay/10 to-orange-100 p-6 rounded-2xl border border-clay/20 flex items-center gap-4">
                                <Gift className="w-12 h-12 text-clay" />
                                <div className="flex-1">
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
