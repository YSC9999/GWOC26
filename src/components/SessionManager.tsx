"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";

export default function SessionManager() {
  const { login, logout, user } = useAuth();
  const lastCheckRef = useRef<number>(0);
  const MIN_CHECK_INTERVAL = 30000; // Minimum 30 seconds between checks

  useEffect(() => {
    const checkSession = async (force = false) => {
      const now = Date.now();
      // Skip if we checked recently (unless forced)
      if (!force && now - lastCheckRef.current < MIN_CHECK_INTERVAL) {
        return;
      }
      lastCheckRef.current = now;

      try {
        const res = await fetch("/api/auth/me");

        if (res.ok) {
          const data = await res.json();
          const userData = data.user || data;

          if (userData && userData._id) {
            // Only update if data actually changed
            const currentUser = useAuth.getState().user;
            if (JSON.stringify(userData) !== JSON.stringify(currentUser)) {
              login(userData);
            }
          }
        } else {
          const currentUser = useAuth.getState().user;
          if (currentUser) {
            logout();
            window.location.href = "/login";
          }
        }
      } catch (err: any) {
        if (err.message && err.message.includes("Failed to fetch")) {
          return;
        }
        console.warn("SessionManager error:", err);
      }
    };

    // Initial check
    checkSession(true);

    // Check on focus (but respect the interval)
    const handleFocus = () => checkSession(false);
    window.addEventListener("focus", handleFocus);

    // Check every 60 seconds instead of 5 seconds
    const interval = setInterval(() => checkSession(false), 60000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [login, logout]);

  return null;
}
