"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on auth and verify-email pages
  const isAuthPage = pathname?.includes("/login") || pathname?.includes("/signup") || pathname?.includes("/verify-email");
  
  if (isAuthPage) {
    return null;
  }

  return <Footer />;
}
