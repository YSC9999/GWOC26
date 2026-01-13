"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalLayout() {
  const pathname = usePathname();

  // Hide navbar on auth, verify-email, and invoice pages
  const isAuthPage = pathname?.includes("/login") || pathname?.includes("/signup") || pathname?.includes("/verify-email") || pathname?.includes("/forgot-password") || pathname?.includes("/invoice");

  if (isAuthPage) {
    return null;
  }

  return <Navbar />;
}
