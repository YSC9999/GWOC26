"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter({ studioInfo }: { studioInfo?: any }) {
  const pathname = usePathname();

  // Hide footer on auth, verify-email, and invoice pages
  const isAuthPage = pathname?.includes("/login") || pathname?.includes("/signup") || pathname?.includes("/verify-email") || pathname?.includes("/forgot-password") || pathname?.includes("/invoice");

  if (isAuthPage) {
    return null;
  }

  return <Footer studioInfo={studioInfo} />;
}
