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
      <body className="bg-sand text-ink font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
