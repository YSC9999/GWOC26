import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
 
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Razorpay Checkout Script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="scroll-smooth">
        {/* Global Background */}
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

        <Navbar />

        <div className="relative z-10">
          <main className="px-4 md:px-12 pt-20">{children}</main>
          <Footer />
        </div>

         
      </body>
    </html>
  );
}
