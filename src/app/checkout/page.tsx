"use client";
import { useCart } from "@/lib/cart";

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const total = items.reduce((a, b) => a + b.price * b.qty, 0);

  const payNow = async () => {
    const res = await fetch("/api/payment", {
      method: "POST",
      body: JSON.stringify({ amount: total }),
    });

    const order = await res.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: order.amount,
      currency: "INR",
      name: "Basho by Shivangi",
      description: "Order Payment",
      order_id: order.id,
      handler: async (response: any) => {
        await fetch("/api/orders", {
          method: "POST",
          body: JSON.stringify({
            email: "customer@basho.com",
            products: items,
            total,
            razorpay_order_id: order.id,
            payment_id: response.razorpay_payment_id,
            status: "paid"
          })
        });
        clear();
        window.location.href = "/success";
      },
      theme: { color: "#a56b43" },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-32">
      <h1 className="font-serif text-4xl mb-10">Checkout</h1>

      {items.map(i => (
        <div key={i.id} className="flex justify-between border-b py-3">
          <span>{i.name} × {i.qty}</span>
          <span>₹{i.price * i.qty}</span>
        </div>
      ))}

      <div className="mt-6 text-xl">Total: ₹{total}</div>

      <button
        onClick={payNow}
        className="mt-8 bg-[#a56b43] text-white px-10 py-3 rounded-full hover:bg-[#8f5634]"
      >
        Pay Now
      </button>
    </main>
  );
}
