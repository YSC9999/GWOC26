"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useState } from "react";

export default function Cart() {
  const [loading, setLoading] = useState(false);

  // Mock cart data
  const cartItems = [
    {
      id: 1,
      name: "Premium Basics Pack",
      price: 29.99,
      quantity: 2,
      image: "🎁",
    },
    {
      id: 2,
      name: "Pro Developer Kit",
      price: 79.99,
      quantity: 1,
      image: "🛠️",
    },
  ];

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;
 
  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }) // send INR to backend
      });
  
      const data = await res.json();
      if (!data.orderId) throw new Error("Order creation failed");
  
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: Math.round(total * 100), // INR → paisa for checkout
        currency: "INR",
        name: "My Shop",
        description: "Order Payment",
        order_id: data.orderId,
        handler: function (response: any) {
          alert("Payment Successful!");
          console.log(response);
        },
      };
  
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };
  


  if (cartItems.length === 0) {
    return (
      <div className="py-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h1 className="text-3xl font-bold text-soil mb-2">Your cart is empty</h1>
        <p className="text-gray-600 mb-8">
          Start shopping to add items to your cart
        </p>
        <Link href="/main/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 pt-12">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl font-bold text-soil mb-4">Shopping Cart</h1>
        <p className="text-xl text-gray-700">
          Review your items and proceed to checkout
        </p>
      </motion.section>

      {/* Cart Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2 space-y-4"
        >
          {cartItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card p-6 flex gap-6 items-center"
            >
              {/* Image */}
              <div className="bg-sand rounded-lg p-6 text-4xl flex-shrink-0 w-24 h-24 flex items-center justify-center">
                {item.image}
              </div>

              {/* Details */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-soil mb-1">{item.name}</h3>
                <p className="text-2xl font-bold text-clay">${item.price}</p>
              </div>

              {/* Quantity */}
              <div className="flex items-center border-2 border-soil rounded-lg">
                <button className="px-3 py-2 hover:bg-sand transition-colors">
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 border-l border-r border-soil">
                  {item.quantity}
                </span>
                <button className="px-3 py-2 hover:bg-sand transition-colors">
                  <Plus size={16} />
                </button>
              </div>

              {/* Total */}
              <div className="text-right">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-soil">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>

              {/* Remove */}
              <button className="text-red-600 hover:text-red-700 transition-colors">
                <Trash2 size={20} />
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="card p-8 h-fit sticky top-32"
        >
          <h2 className="text-2xl font-bold text-soil mb-6">Order Summary</h2>

          <div className="space-y-4 mb-6 pb-6 border-b-2 border-gray-200">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8 text-2xl font-bold">
            <span>Total</span>
            <span className="text-clay">${total.toFixed(2)}</span>
          </div>

          {/* 🔗 Razorpay Pay Now button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="btn-primary w-full text-center"
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>

          <Link
            href="/main/products"
            className="btn-outline w-full text-center mt-4"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>

      {/* Promotional Banner */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-soil text-white rounded-2xl p-8 text-center"
      >
        <h2 className="text-2xl font-bold mb-2">
          Free Shipping on Orders Over $100!
        </h2>
        <p className="text-sand">
          Add ${(100 - subtotal).toFixed(2)} more to your cart to get free
          shipping
        </p>
      </motion.section>
    </div>
  );
}
