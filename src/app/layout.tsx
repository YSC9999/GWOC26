import "./globals.css";
import ConditionalLayout from "../components/ConditionalLayout";
import ConditionalFooter from "../components/ConditionalFooter";
import ConditionalBackground from "../components/ConditionalBackground";
import CartSync from "../components/CartSync";
import PageWrapper from "../components/PageWrapper";
import Script from "next/script";
import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basho by Shivangi",
  description: "Handcrafted Japanese-inspired pottery",
  icons: {
    icon: "/website icon.png",
  },
};

import ChatBot from "../components/ChatBot";

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
      </head>
      <body className="scroll-smooth flex flex-col min-h-screen">
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
        <CartSync />
        <ConditionalBackground />
        <ConditionalLayout />

        <PageWrapper>{children}</PageWrapper>

        <ChatBot />
        <ConditionalFooter />
      </body>
    </html>
  );
}
