import React from "react";

export default function AdminProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin · Products</h1>
        {children}
      </div>
    </section>
  );
}
