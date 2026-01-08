import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartButton from "../components/CartButton";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Razorpay Checkout Script */}
          <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
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
  #EDD8B4 0%,
  #EDD8B4 45%,
  #EDD8B4 100%
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

        {/* Floating Cart Button */}
        <CartButton />
      </body>
    </html>
  );
}
