"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function PageWrapper({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    // Pages that occupy full screen and hide navbar
    const isAuthPage =
        pathname?.includes("/login") ||
        pathname?.includes("/signup") ||
        pathname?.includes("/verify-email") ||
        pathname?.includes("/forgot-password");

    return (
        <div className={`relative z-10 flex-1 ${isAuthPage ? "" : "pt-20"}`}>
            <main className={`${isAuthPage ? "p-0" : "px-4 md:px-12"}`}>
                {children}
            </main>
        </div>
    );
}
