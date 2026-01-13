import "./globals.css";
import ConditionalLayout from "../components/ConditionalLayout";
import ConditionalFooter from "../components/ConditionalFooter";
import ConditionalBackground from "../components/ConditionalBackground";
import CartSync from "../components/CartSync";
import PageWrapper from "../components/PageWrapper";
import Script from "next/script";
import { ReactNode } from "react";
import type { Metadata } from "next";
import {
  Kaushan_Script,
  Berkshire_Swash,
  Edu_NSW_ACT_Foundation,
} from "next/font/google";

const kaushanScript = Kaushan_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-kaushan-script",
});

const berkshireSwash = Berkshire_Swash({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-berkshire-swash",
});

const eduNSWACT = Edu_NSW_ACT_Foundation({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-edu-nsw-act",
});

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
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${kaushanScript.variable} ${berkshireSwash.variable} ${eduNSWACT.variable}`}
    >
      <head></head>
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
