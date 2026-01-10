"use client";
import React, { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2, Check } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Cart() {
  const { items, updateQty, remove, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Cart, 2: Address, 3: Success
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateTotal = () => {
    const subtotal = total();
    const shipping = subtotal > 2000 ? 0 : 150;
    return { subtotal, shipping, total: subtotal + shipping };
  };

  const { subtotal, shipping, total: finalTotal } = calculateTotal();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // 1. Create Order
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress: formData,
          email: formData.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Order creation failed");

      // 2. Open Razorpay
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Basho by Shivangi",
        description: "Handcrafted Pottery",
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            const verifyRes = await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            
            if (verifyRes.ok) {
              clear(); // Clear cart
              setCheckoutStep(3); // Show success
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error(err);
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#D97757", // Clay color
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const { isAuthenticated } = useAuth(); // Assuming useAuth is available and provides this
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-20 px-4">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-3xl font-bold text-soil mb-4 font-serif">Members Only</h1>
          <p className="text-soil/60 mb-8 max-w-md mx-auto">
            Please login to view your shopping bag and checkout.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/login" className="btn-primary px-8">
              Login
            </Link>
            <Link href="/auth/signup" className="btn-outline px-8">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && checkoutStep === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-20 px-4">
          <ShoppingBag className="w-20 h-20 mx-auto text-soil/20 mb-6" />
          <h1 className="text-3xl font-bold text-soil mb-4 font-serif">Your cart is empty</h1>
          <p className="text-soil/60 mb-8 max-w-md mx-auto">
            Looks like you haven't discovered our collection yet.
          </p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-clay text-white px-8 py-3 rounded-full font-semibold hover:bg-clay/90 transition-colors">
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 max-w-7xl mx-auto">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {checkoutStep === 3 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-soil mb-4 font-serif">Order Confirmed!</h1>
          <p className="text-xl text-soil/70 mb-8">
            Thank you for shopping with Basho. We've sent a confirmation email to {formData.email}.
          </p>
          <Link href="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold text-soil mb-8 font-serif">
              {checkoutStep === 1 ? "Shopping Cart" : "Shipping Details"}
            </h1>

            {checkoutStep === 1 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm flex gap-6 items-center">
                    {/* Item Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-soil">{item.name}</h3>
                      <p className="text-clay font-semibold">₹{item.price.toLocaleString()}</p>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center bg-sand rounded-full">
                      <button 
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="p-2 hover:text-clay transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="p-2 hover:text-clay transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Total & Remove */}
                    <div className="text-right min-w-[100px]">
                      <div className="font-bold text-soil mb-1">
                        ₹{(item.price * item.qty).toLocaleString()}
                      </div>
                      <button 
                        onClick={() => remove(item.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-soil mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-soil/10 rounded-xl focus:border-clay focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-soil mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-soil/10 rounded-xl focus:border-clay focus:outline-none"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-soil mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-soil/10 rounded-xl focus:border-clay focus:outline-none"
                      required
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-soil mb-2">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-soil/10 rounded-xl focus:border-clay focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-soil mb-2">Address</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-soil/10 rounded-xl focus:border-clay focus:outline-none"
                    placeholder="Street address, flat no."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-soil mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-soil/10 rounded-xl focus:border-clay focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-soil mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-soil/10 rounded-xl focus:border-clay focus:outline-none"
                      required
                    />
                  </div>
                </div>
                
                <button 
                  type="button" 
                  onClick={() => setCheckoutStep(1)}
                  className="text-soil/60 hover:text-clay font-medium"
                >
                  ← Back to Cart
                </button>
              </motion.form>
            )}
          </div>

          {/* Checkout Summary */}
          <div>
            <div className="bg-sand/30 rounded-3xl p-8 sticky top-32">
              <h2 className="text-2xl font-bold text-soil mb-6 font-serif">Order Summary</h2>
              
              <div className="space-y-4 mb-6 pb-6 border-b border-soil/10 text-soil/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    <span>₹{shipping}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-soil mb-8">
                <span>Total</span>
                <span className="text-clay">₹{finalTotal.toLocaleString()}</span>
              </div>

              {shipping > 0 && (
                <div className="bg-white/50 p-4 rounded-xl mb-6 text-sm text-soil/70 text-center">
                  Add items worth ₹{(2000 - subtotal).toLocaleString()} more for free shipping!
                </div>
              )}

              {checkoutStep === 1 ? (
                <button
                  onClick={() => setCheckoutStep(2)}
                  className="w-full bg-clay text-white py-4 rounded-full font-bold hover:bg-clay/90 transition-colors flex items-center justify-center gap-2"
                >
                  Checkout <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={loading || !formData.email || !formData.phone || !formData.street}
                  className="w-full bg-soil text-white py-4 rounded-full font-bold hover:bg-soil/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                    </>
                  ) : (
                    "Pay Now"
                  )}
                </button>
              )}
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-soil/40">
                <Check size={12} /> Secure Checkout via Razorpay
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
