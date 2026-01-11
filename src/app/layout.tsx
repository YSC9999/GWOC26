import "./globals.css";
import ConditionalLayout from "../components/ConditionalLayout";
import ConditionalFooter from "../components/ConditionalFooter";
import ConditionalBackground from "../components/ConditionalBackground";
import CartSync from "../components/CartSync";
import Script from "next/script";
import { ReactNode } from "react";

export default function RootLayout({
  children,
  modal
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </head>
      <body className="scroll-smooth flex flex-col min-h-screen">
        <CartSync />
        <ConditionalBackground />
        <ConditionalLayout />

        <div className="relative z-10 flex-1">
          <main className="px-4 md:px-12 pt-20">{children}</main>
        </div>

        <ConditionalFooter />
      </body>
    </html>
  );
}
