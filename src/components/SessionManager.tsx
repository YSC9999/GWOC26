"use client";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export default function SessionManager() {
    const { login, logout, user } = useAuth();

    useEffect(() => {
        const checkSession = async () => {
            try {
                // We use cookies now, so no need to check localStorage for token
                // The browser sends the cookie automatically
                const res = await fetch("/api/auth/me");

                if (res.ok) {
                    const data = await res.json();

                    // The API returns the user object directly.
                    // Check if data has _id to confirm it's a user object
                    const userData = data.user || data;

                    if (userData && userData._id) {
                        // Check if data differs from current state
                        // We primarily care about wishlist being present/different
                        if (JSON.stringify(userData) !== JSON.stringify(user)) {
                            console.log("SessionManager: Updating user data");
                            login(userData);
                        }
                    }
                } else {
                    // Token invalid or User Blocked (returns 401)
                    // Token invalid or User Blocked (returns 401)
                    // Check directly against the store to avoid stale closure issues in interval
                    const currentUser = useAuth.getState().user;
                    if (currentUser) {
                        console.log("SessionManager: Session invalid or Blocked, logging out");
                        logout();
                        window.location.href = "/login"; // Force redirect to login page
                    }
                }
            } catch (err) {
                console.error("SessionManager error:", err);
            }
        };

        checkSession();

        const handleFocus = () => checkSession();
        window.addEventListener("focus", handleFocus);
        const interval = setInterval(checkSession, 5000); // Check every 5s

        return () => {
            window.removeEventListener("focus", handleFocus);
            clearInterval(interval);
        };

    }, []);

    return null;
}
