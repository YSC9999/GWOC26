"use client";
import { usePathname } from "next/navigation";

export default function ConditionalBackground() {
  const pathname = usePathname();

  // Hide background on auth and verify-email pages
  const isAuthPage = pathname?.includes("/login") || pathname?.includes("/signup") || pathname?.includes("/verify-email") || pathname?.includes("/forgot-password");

  if (isAuthPage) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 -z-50"
      style={{
        minHeight: "100vh",
        backgroundImage: `
          url("/pottery-pattern.png"),
          radial-gradient(circle at top left,
            #f2e3cbff 0%,
            #f2e3cbff 45%,
            #f2e3cbff 100%
          )
        `,
        backgroundRepeat: "repeat, no-repeat",
        backgroundSize: "220px 220px, cover",
        backgroundPosition: "center, center",
        backgroundBlendMode: "soft-light",
      }}
    />
  );
}
