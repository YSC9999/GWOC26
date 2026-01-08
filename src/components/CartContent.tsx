"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus } from "lucide-react";

export default function CartContent() {
  // State for cart items
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Premium Basics Pack", price: 29.99, quantity: 2, image: "🎁" },
    { id: 2, name: "Pro Developer Kit", price: 79.99, quantity: 1, image: "🛠️" },
  ]);

  // Handlers
  const increaseQuantity = (id: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  // Totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  // Razorpay Checkout
  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ amount: Math.round(total), currency: "USD" }),
      });

      if (!res.ok) {
        throw new Error("Failed to create order");
      }

      const data = await res.json();

      if (!data.orderId) {
        alert("Order creation failed");
        return;
      }

            let options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY!,
        amount: total * 100,
        currency: "INR",
        name: "Basho Store",
        description: "Order Payment",
        order_id: data.orderId,
        handler: function (response: any) {
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
        },
        // prefill: {
        //   name: "Sreeshanth",
        //   email: "customer@example.com",
        //   contact: "9999999999",
        // },
        theme: { color: "#c97c5d" },
        method: {
          card: true,
          upi: true,
          netbanking: true,
          wallet: true,
          emi: true,
        },
      };



      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message || "Checkout failed");
    }
  };

  return (
    <div className="space-y-12 p-6">
      {/* Header */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-soil mb-2">Shopping Cart</h1>
        <p className="text-gray-700">Review your items and proceed to checkout</p>
      </motion.section>

      {/* Cart Items */}
      <div className="space-y-4">
        {cartItems.length === 0 ? (
          <p className="text-gray-500">Your cart is empty</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="card p-4 flex gap-4 items-center">
              <div className="bg-sand rounded-lg p-4 text-3xl">{item.image}</div>
              <div className="flex-1">
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-clay">${item.price}</p>
              </div>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => decreaseQuantity(item.id)}
                  className="px-2 py-1 hover:bg-sand"
                >
                  <Minus size={14} />
                </button>
                <span className="px-3">{item.quantity}</span>
                <button
                  onClick={() => increaseQuantity(item.id)}
                  className="px-2 py-1 hover:bg-sand"
                >
                  <Plus size={14} />
                </button>
              </div>
              <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {cartItems.length > 0 && (
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-clay">${total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="btn-primary w-full text-center mt-4"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}
