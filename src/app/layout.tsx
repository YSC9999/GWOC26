import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="scroll-smooth">
        {/* Global Background */}
        <div
          className="fixed inset-0 -z-50"
          style={{
            backgroundImage: "url('/background.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#efe5d8",
            backgroundBlendMode: "overlay",
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
