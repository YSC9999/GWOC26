"use client";
import { useEffect, useState } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/orders").then(r => r.json()).then(setOrders);
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-6 py-32">
      <h1 className="text-4xl mb-10 font-serif">Orders</h1>
      {orders.map(o => (
        <div key={o._id} className="border p-6 rounded-xl mb-6">
          <p><b>Email:</b> {o.email}</p>
          <p><b>Total:</b> ₹{o.total}</p>
          <p><b>Status:</b> {o.status}</p>
          <p><b>Items:</b> {o.products.map((p:any)=>`${p.name} x${p.qty}`).join(", ")}</p>
        </div>
      ))}
    </main>
  );
}
