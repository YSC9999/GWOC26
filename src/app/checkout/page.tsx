"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Truck, Lock } from "lucide-react";

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  return (
    <div className="space-y-12 pt-12">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl font-bold text-soil mb-4">Checkout</h1>
        <p className="text-xl text-gray-700">Complete your purchase securely</p>
      </motion.section>

      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-between mb-12"
      >
        {[
          { num: 1, title: "Shipping" },
          { num: 2, title: "Payment" },
          { num: 3, title: "Confirmation" },
        ].map((s) => (
          <div key={s.num} className="flex-1 flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all ${
                step >= s.num
                  ? "bg-clay text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step > s.num ? <CheckCircle size={24} /> : s.num}
            </div>
            <p className="text-sm font-semibold text-soil">{s.title}</p>
            {s.num < 3 && (
              <div
                className={`h-1 w-full mt-4 ${
                  step > s.num ? "bg-clay" : "bg-gray-200"
                }`}
              ></div>
            )}
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2"
        >
          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Shipping */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <Truck className="text-clay" size={24} />
                    <h2 className="text-2xl font-bold text-soil">
                      Shipping Address
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First Name"
                      className="input-field"
                      required
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last Name"
                      className="input-field"
                      required
                    />
                  </div>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    className="input-field"
                    required
                  />

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                    className="input-field"
                    required
                  />

                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street Address"
                    className="input-field"
                    required
                  />

                  <div className="grid grid-cols-2 gap-6">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="input-field"
                      required
                    />
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="input-field"
                      required
                    />
                  </div>

                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="Zip Code"
                    className="input-field"
                    required
                  />
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <Lock className="text-clay" size={24} />
                    <h2 className="text-2xl font-bold text-soil">
                      Payment Information
                    </h2>
                  </div>

                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="Card Number"
                    className="input-field"
                    required
                  />

                  <div className="grid grid-cols-2 gap-6">
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className="input-field"
                      required
                    />
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="CVV"
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <Lock
                      size={20}
                      className="text-blue-600 flex-shrink-0 mt-1"
                    />
                    <p className="text-sm text-blue-700">
                      Your payment information is encrypted and secure. We use
                      industry-standard SSL encryption.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center py-12"
                >
                  <CheckCircle
                    size={64}
                    className="mx-auto text-green-600 mb-4"
                  />
                  <h2 className="text-3xl font-bold text-soil mb-2">
                    Order Confirmed!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Thank you for your purchase. Your order has been
                    successfully placed.
                  </p>
                  <p className="text-sm text-gray-500 mb-8">
                    Order confirmation has been sent to your email address.
                  </p>
                  <Link href="/main" className="btn-primary">
                    Return Home
                  </Link>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              {step < 3 && (
                <div className="flex gap-4 justify-between pt-8 border-t border-gray-200">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="btn-outline"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type={step === 2 ? "submit" : "button"}
                    onClick={step < 2 ? handleNextStep : undefined}
                    className="btn-primary ml-auto"
                  >
                    {step === 2 ? "Place Order" : "Continue"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="card p-8 h-fit sticky top-32"
        >
          <h3 className="text-xl font-bold text-soil mb-6">Order Summary</h3>

          <div className="space-y-4 mb-6 pb-6 border-b-2 border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-600">Premium Basics Pack x2</span>
              <span className="font-semibold">$59.98</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pro Developer Kit x1</span>
              <span className="font-semibold">$79.99</span>
            </div>
          </div>

          <div className="space-y-3 mb-6 pb-6 border-b-2 border-gray-200">
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Subtotal</span>
              <span>$139.97</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Tax</span>
              <span>$14.00</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-2xl font-bold">
            <span>Total</span>
            <span className="text-clay">$153.97</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
