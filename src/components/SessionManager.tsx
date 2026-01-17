"use client";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export default function SessionManager() {
    const { login, logout, user } = useAuth();

    useEffect(() => {
        const checkSession = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                if (user) logout();
                return;
            }

            try {
                const res = await fetch("/api/auth/me", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();

                    // The API returns the user object directly.
                    // Check if data has _id to confirm it's a user object
                    const userData = data.user || data;

                    if (userData && userData._id) {
                        // Check if data differs from current state
                        // We primarily care about wishlist being present/different
                        if (JSON.stringify(userData) !== JSON.stringify(user)) {
                            console.log("SessionManager: Updating user data", userData);
                            login(userData);
                        }
                    }
                } else {
                    // Token invalid
                    console.log("SessionManager: Token invalid, logging out");
                    logout();
                    localStorage.removeItem("token");
                }
            } catch (err) {
                console.error("SessionManager error:", err);
            }
        };

        checkSession();

        const handleFocus = () => checkSession();
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);

    }, []);

    return null;
}
