"use client";

import { useCart } from "@/lib/cart";

export default function CartPage() {
  const { items, remove, clear } = useCart();

  const total = items.reduce((a, b) => a + b.price * b.qty, 0);

  return (
    <main className="max-w-4xl mx-auto px-6 py-32">
      <h1 className="font-serif text-4xl mb-10 text-center">Your Cart</h1>

      {items.length === 0 && (
        <p className="text-center text-gray-500">Your cart is empty.</p>
      )}

      {items.map((i) => (
        <div
          key={i.id}
          className="flex justify-between border-b py-4 items-center"
        >
          <div>
            <p className="font-medium">{i.name}</p>
            <p className="text-sm text-gray-500">
              ₹{i.price} × {i.qty}
            </p>
          </div>

          <button
            onClick={() => remove(i.id)}
            className="text-red-500 text-sm"
          >
            Remove
          </button>
        </div>
      ))}

      {items.length > 0 && (
        <div className="mt-10 text-right">
          <p className="text-xl mb-4">Total: ₹{total}</p>

          <button
            onClick={async () => {
              const res = await fetch("/api/payment", {
                method: "POST",
                body: JSON.stringify({ amount: total }),
              });

              const order = await res.json();

              const rzp = new (window as any).Razorpay({
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
                amount: order.amount,
                currency: "INR",
                name: "Basho by Shivangi",
                order_id: order.id,
                handler: () => {
                  alert("Payment Successful");
                  clear();
                },
              });

              rzp.open();
            }}
            className="bg-[#6d4c3d] text-white px-8 py-3 rounded-full hover:opacity-90"
          >
            Checkout
          </button>
        </div>
      )}
    </main>
  );
}
