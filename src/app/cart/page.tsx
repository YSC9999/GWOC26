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

  // Address State
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const [fetchingAddresses, setFetchingAddresses] = useState(false);

  // OTP State
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  
  // Shipping State
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState("");

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

  // Fetch addresses on mount/auth
  React.useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setFetchingAddresses(true);
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        const data = await res.json();
        setSavedAddresses(data.addresses || []);
        if (data.addresses && data.addresses.length > 0) {
          setSelectedAddressId(data.addresses[0]._id);
          fillFormWithAddress(data.addresses[0]);
          setPhoneVerified(true); // Assume saved address phone is verified? Or maybe not. Let's assume yes for UX.
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingAddresses(false);
    }
  };

  const fillFormWithAddress = (addr: any) => {
    setFormData({
      name: addr.name || "",
      email: "", // Keep current email or user email
      phone: addr.phone || "",
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      country: addr.country || "India"
    });
  };

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    if (id === "new") {
      setFormData({ ...formData, street: "", city: "", state: "", pincode: "", phone: "", name: "" });
      setPhoneVerified(false);
      setOtpSent(false);
      setShowOtpInput(false);
    } else {
      const addr = savedAddresses.find(a => a._id === id);
      if (addr) {
        fillFormWithAddress(addr);
        setPhoneVerified(true); // Saved addresses are trusted
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'phone' && selectedAddressId === 'new') {
      setPhoneVerified(false);
      setOtpSent(false);
      setShowOtpInput(false);
    }
  };

  const sendOtp = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      alert("Please enter a valid phone number");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await fetch("/api/auth/send-phone-otp", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setShowOtpInput(true);
        alert(data.message); // Use message from API (Real SMS or Mock)
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    setVerifyingOtp(true);
    try {
      const res = await fetch("/api/auth/verify-phone-otp", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, otp })
      });
      if (res.ok) {
        setPhoneVerified(true);
        setShowOtpInput(false);
        alert("Phone verified successfully!");
      } else {
        alert("Invalid OTP");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = total();
    const finalShipping = shippingCost !== null ? shippingCost : (subtotal > 2000 ? 0 : 150);
    return { subtotal, shipping: finalShipping, total: subtotal + finalShipping };
  };

  // Fetch Shipping Rates
  React.useEffect(() => {
    if (formData.pincode.length === 6) {
      updateShippingRate(formData.pincode);
    }
  }, [formData.pincode]);

  const updateShippingRate = async (pincode: string) => {
    setCalculatingShipping(true);
    setShippingError("");
    try {
      const res = await fetch(`/api/shiprocket/serviceability?pincode=${pincode}`);
      const data = await res.json();
      if (res.ok && data.data?.available_courier_companies) {
        const couriers = data.data.available_courier_companies;
        if (couriers.length > 0) {
          const cheapest = couriers.reduce((prev: any, curr: any) => 
            (Number(prev.rate) < Number(curr.rate)) ? prev : curr
          );
          setShippingCost(Math.ceil(Number(cheapest.rate)));
        } else {
          setShippingError("No delivery service for this pincode.");
          setShippingCost(150); // Fallback
        }
      } else {
        setShippingError(data.error || "Could not calculate shipping.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCalculatingShipping(false);
    }
  };

  const { subtotal, shipping, total: finalTotal } = calculateTotal();

  const handleCheckout = async () => {
    if (!phoneVerified) {
      alert("Please verify your phone number first.");
      return;
    }

    setLoading(true);
    try {
      // 0. Save Address if New
      if (selectedAddressId === "new") {
        await fetch("/api/user/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: "Home", // Default label
            name: formData.name,
            phone: formData.phone,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            country: "India",
            isDefault: savedAddresses.length === 0
          })
        });
        // Not blocking on failure, but good to know
      }

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
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">

                {/* Saved Addresses Section */}
                {savedAddresses.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr._id}
                        onClick={() => handleAddressSelect(addr._id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-clay bg-clay/5' : 'border-gray-100 hover:border-gray-200'}`}
                      >
                        <div className="font-bold text-soil mb-1">{addr.name}</div>
                        <div className="text-sm text-soil/70">{addr.street}, {addr.city}</div>
                        <div className="text-sm text-soil/70">{addr.state} - {addr.pincode}</div>
                        <div className="text-sm text-soil/70 mt-1">Phone: {addr.phone}</div>
                      </div>
                    ))}
                    <div
                      onClick={() => handleAddressSelect("new")}
                      className={`p-4 rounded-xl border-2 cursor-pointer border-dashed flex items-center justify-center gap-2 ${selectedAddressId === "new" ? 'border-clay bg-clay/5' : 'border-gray-200 text-soil/50 hover:text-clay hover:border-clay'}`}
                    >
                      <Plus size={20} /> Add New Address
                    </div>
                  </div>
                )}

                {/* Shared Form */}
                <div className={`space-y-6 ${selectedAddressId !== 'new' ? 'opacity-80 pointer-events-none grayscale' : ''}`}> {/* Disable form if saved address selected */}
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

                  {/* Phone & OTP */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-soil">Phone Number</label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-3 border-2 border-soil/10 rounded-xl focus:border-clay focus:outline-none"
                        required
                      />
                      {selectedAddressId === 'new' && (
                        <button
                          type="button"
                          onClick={sendOtp}
                          disabled={phoneVerified || sendingOtp || formData.phone.length < 10}
                          className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-colors ${phoneVerified ? 'bg-green-100 text-green-700' : 'bg-clay text-white hover:bg-clay/90 disabled:opacity-50'}`}
                        >
                          {sendingOtp ? <Loader2 className="animate-spin" /> : (phoneVerified ? "Verified" : "Verify")}
                        </button>
                      )}
                    </div>

                    {showOtpInput && !phoneVerified && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-soil mb-1">Enter OTP (Check Console)</label>
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-soil/10 rounded-xl focus:border-clay focus:outline-none"
                            placeholder="Enter 6-digit OTP"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={verifyOtp}
                          disabled={verifyingOtp}
                          className="px-6 py-3 bg-soil text-white rounded-xl font-bold hover:bg-soil/90 disabled:opacity-50"
                        >
                          {verifyingOtp ? <Loader2 className="animate-spin" /> : "Confirm"}
                        </button>
                      </motion.div>
                    )}
                    {phoneVerified && selectedAddressId === 'new' && (
                      <div className="text-green-600 text-sm flex items-center gap-1">
                        <Check size={14} /> Phone verified successfully
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>
              </motion.div>
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
                  {calculatingShipping ? (
                    <Loader2 className="animate-spin w-4 h-4 text-clay" />
                  ) : shipping === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    <span>₹{shipping}</span>
                  )}
                </div>
                {shippingError && (
                  <div className="text-[10px] text-red-500 mt-1">{shippingError}</div>
                )}
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
                  disabled={loading || !formData.email || !formData.phone || !formData.street || !phoneVerified}
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
