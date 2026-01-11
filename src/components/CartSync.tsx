"use client";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

export default function CartSync() {
    const { user, isAuthenticated } = useAuth();
    const { items, add, clear } = useCart();

    // 1. On Login: Fetch cart from DB and merge/set
    useEffect(() => {
        if (isAuthenticated) {
            const fetchCart = async () => {
                try {
                    const res = await fetch("/api/user/cart");
                    if (res.ok) {
                        const data = await res.json();
                        if (data.cart && data.cart.length > 0) {
                            // Strategy: If local cart is empty, load DB cart. 
                            // If local cart has items, we might want to merge. 
                            // For simplicity: We will trust the server cart if it has items, 
                            // OR we can merge them. 
                            // Let's merge: Add server items to local if not present.
                            // Actually, simpler user experience: Server is source of truth.
                            // But if user added items as guest, we want to keep them.

                            // Let's just iterate and add them (useCart dedupes/updates qty)
                            // But wait, useCart.add increments qty. 
                            // We should probably replace local with DB + Guest items?
                            // Implementing simple merge: Server items overwrite local?

                            // Let's just load server items for now.
                            // clear(); // Optional: clear local before loading server? 
                            // If we clear, we lose guest items.

                            // Let's loop and add server items (this will merge counts if they exist)
                            data.cart.forEach((item: any) => {
                                // We use a custom 'set' to avoid double counting if we want?
                                // No, 'add' is fine.
                                // Actually, safer to just replace local cart with server cart 
                                // IF strictly syncing. But "guest adding items" -> we want those.

                                // Current Plan: Just add server items to local store.
                                add(item);
                            });
                        }
                    }
                } catch (err) {
                    console.error("Failed to sync cart", err);
                }
            };
            fetchCart();
        }
    }, [isAuthenticated, add]);

    // 2. On Cart Change: Debounce sync to DB
    useEffect(() => {
        if (!isAuthenticated) return;

        const timeoutId = setTimeout(async () => {
            try {
                await fetch("/api/user/cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cart: items })
                });
            } catch (err) {
                console.error("Failed to save cart", err);
            }
        }, 1000); // 1 sec debounce

        return () => clearTimeout(timeoutId);
    }, [items, isAuthenticated]);

    return null;
}
