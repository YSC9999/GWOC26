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
  metadataBase: new URL("https://basho-byy-shivangi.vercel.app"),
  title: {
    default: "Basho by Shivangi",
    template: "%s | Basho by Shivangi",
  },
  description:
    "Handcrafted Japanese-inspired pottery and ceramics by Shivangi. Explore our unique collections of art and home decor.",
  keywords: [
    "Pottery",
    "Ceramics",
    "Handcrafted",
    "Japanese Art",
    "Home Decor",
    "Basho",
    "Shivangi",
    "Artisan",
    "Clay",
    "Studio Pottery",
  ],
  authors: [{ name: "Shivangi" }],
  creator: "Shivangi",
  publisher: "Basho by Shivangi",
  icons: {
    icon: "/website icon.png",
    shortcut: "/website icon.png",
    apple: "/website icon.png",
  },
  openGraph: {
    title: "Basho by Shivangi",
    description:
      "Handcrafted Japanese-inspired pottery and ceramics by Shivangi. Explore our unique collections.",
    url: "https://basho-byy-shivangi.vercel.app",
    siteName: "Basho by Shivangi",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/website icon.png",
        width: 800,
        height: 600,
        alt: "Basho by Shivangi Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Basho by Shivangi",
    description: "Handcrafted Japanese-inspired pottery and ceramics.",
    images: ["/website icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import ChatBot from "../components/ChatBot";

import ScreenSizeGuard from "../components/ScreenSizeGuard";
import SessionManager from "../components/SessionManager";
import GlobalToast from "@/components/GlobalToast";

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
        <SessionManager />
        <ScreenSizeGuard />
        <ConditionalBackground />
        <ConditionalLayout />

        <PageWrapper>{children}</PageWrapper>

        <ChatBot />
        <ConditionalFooter studioInfo={undefined} />
        <GlobalToast />
      </body>
    </html>
  );
}
