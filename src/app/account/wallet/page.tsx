"use client";

import { useEffect, useState } from "react";

import { ArrowUpRight, ArrowDownLeft, Wallet, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function WalletPage() {
    const { user, login } = useAuth();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWalletData = async () => {
        try {
            const res = await fetch('/api/user/wallet');
            if (res.ok) {
                const data = await res.json();
                setTransactions(data.transactions || []);
                // Also update local user balance if changed
                if (data.balance !== undefined && user) {
                    login({ ...user, walletBalance: data.balance });
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-soil font-serif mb-8">My Wallet</h1>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-3xl p-8 mb-12 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <p className="opacity-80 mb-2 font-medium tracking-wide">Available Balance</p>
                    <h2 className="text-5xl font-bold mb-6">₹{user?.walletBalance || 0}</h2>
                    <div className="flex gap-3">
                        <span className="bg-white/10 px-4 py-2 rounded-full text-sm backdrop-blur-sm border border-white/20">
                            Safe & Secure
                        </span>
                    </div>
                </div>
                <Wallet className="absolute -bottom-8 -right-8 w-64 h-64 text-white/5" />
            </div>

            {/* History */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-soil mb-6">Transaction History</h3>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-clay" />
                    </div>
                ) : transactions.length > 0 ? (
                    <div className="space-y-4">
                        {transactions.map((tx) => (
                            <div key={tx._id} className="flex items-center justify-between p-4 hover:bg-sand/20 rounded-xl transition-colors border border-soil/5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-soil">{tx.description}</p>
                                        <p className="text-xs text-soil/50">
                                            {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className={`font-bold text-lg ${tx.type === 'credit' ? 'text-green-600' : 'text-soil'}`}>
                                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-soil/40">
                        No transactions found
                    </div>
                )}
            </div>
        </div>
    );
}
