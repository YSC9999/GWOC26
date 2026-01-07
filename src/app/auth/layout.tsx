// src/app/(auth)/layout.jsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Simple centered layout, with sand background
    <div className="min-h-screen flex items-center justify-center bg-sand">
      <div className="w-full max-w-md p-4">{children}</div>
    </div>
  );
}
