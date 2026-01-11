"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalLayout() {
  const pathname = usePathname();

  // Hide navbar on auth and verify-email pages
  const isAuthPage = pathname?.includes("/login") || pathname?.includes("/signup") || pathname?.includes("/verify-email") || pathname?.includes("/forgot-password");

  if (isAuthPage) {
    return null;
  }

  return <Navbar />;
}
