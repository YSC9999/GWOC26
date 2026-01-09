export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className="scroll-smooth bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
        {children}
      </body>
    </html>
  );
}
