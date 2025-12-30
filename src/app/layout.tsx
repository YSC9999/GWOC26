import "./globals.css";
import "@fontsource/inter/400.css";
import "@fontsource/playfair-display/600.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Basho by Shivangi",
  description: "Japanese-inspired handcrafted pottery & studio experiences",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#1f1f1f]">
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

        {/* NAVBAR fixed to viewport */}
        <Navbar />

        {/* MAIN SITE CARD */}
        <div className="max-w-[1100px] mx-auto bg-[#F4EADB] min-h-screen rounded-[40px] mt-32 overflow-hidden shadow-xl pointer-events-auto">

          {children}
        </div>
      </body>
    </html>
  );
}
