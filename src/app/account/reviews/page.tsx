"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, Package, Loader2 } from "lucide-react";
import Link from "next/link";

interface Review {
    _id: string;
    productId: {
        _id: string;
        name: string;
        images: string[];
    };
    rating: number;
    comment: string;
    createdAt: string;
}

export default function MyReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch("/api/user/reviews"); // Assuming this endpoint exists
            if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20 flex justify-center"><Loader2 className="animate-spin text-clay" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-soil font-serif">My Reviews</h1>
            </div>

            {reviews.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-sand/30 shadow-sm">
                    <MessageSquare className="w-16 h-16 text-soil/10 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-soil mb-2">No reviews yet</h2>
                    <p className="text-soil/60 mb-8 font-medium">You haven't shared your thoughts on any products yet.</p>
                    <Link href="/account/orders" className="inline-block bg-brick text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-brick/20 transition-all">
                        Review an Order
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review._id} className="bg-white rounded-3xl shadow-sm border border-sand/30 p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Product Image */}
                                <div className="w-20 h-20 bg-sand/10 rounded-2xl overflow-hidden flex-shrink-0">
                                    <img
                                        src={review.productId.images?.[0] || '/placeholder.png'}
                                        alt={review.productId.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-soil font-serif text-lg">{review.productId.name}</h3>
                                            <div className="flex items-center gap-1 mt-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        className={i < review.rating ? "fill-orange-400 text-orange-400" : "text-sand"}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-soil/40 uppercase tracking-widest">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-soil/70 leading-relaxed italic">"{review.comment}"</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
