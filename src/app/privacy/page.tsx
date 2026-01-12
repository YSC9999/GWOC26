"use client";
import React from "react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen py-20 bg-sand/20">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-soil mb-8 font-serif text-center">
                        Privacy Policy
                    </h1>

                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-soil/10 space-y-8 text-soil/80 leading-relaxed">

                        <section>
                            <h2 className="text-2xl font-bold text-soil mb-4 font-serif">1. Introduction</h2>
                            <p>
                                At Basho by Shivangi, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website or make a purchase.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-soil mb-4 font-serif">2. Information We Collect</h2>
                            <p>
                                We may collect the following types of information:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li><strong>Personal Information:</strong> Name, email address, phone number, shipping address, and billing address when you place an order.</li>
                                <li><strong>Payment Information:</strong> All payment transactions are processed through secure third-party gateways (Razorpay). We do not store your credit/debit card details on our servers.</li>
                                <li><strong>Usage Data:</strong> Information on how you access and use the website, including device type, browser details, and pages visited (via cookies/analytics).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-soil mb-4 font-serif">3. How We Use Your Information</h2>
                            <p>
                                We use your data for the following purposes:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li>To process and fulfill your orders (shipping, communication).</li>
                                <li>To send order confirmations and updates.</li>
                                <li>To improve our website functionality and customer service.</li>
                                <li>To send promotional emails or newsletters (only if you have opted in). You can unsubscribe at any time.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-soil mb-4 font-serif">4. Data Sharing & Third Parties</h2>
                            <p>
                                We respect your privacy and do not sell your personal data to third parties. However, we share necessary data with trusted service providers to run our business:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li><strong>Logistics Partners:</strong> To deliver your orders.</li>
                                <li><strong>Payment Gateways:</strong> To process secure payments (e.g., Razorpay).</li>
                                <li><strong>Analytics Providers:</strong> To help us understand website traffic (e.g., Google Analytics).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-soil mb-4 font-serif">5. Cookies</h2>
                            <p>
                                Our website uses cookies to enhance your browsing experience. Cookies are small data files stored on your device that help us remember your preferences and cart contents. You can choose to disable cookies through your browser settings, though some features of the site may not function properly.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-soil mb-4 font-serif">6. Security</h2>
                            <p>
                                We implement industry-standard security measures to protect your personal information. However, please be aware that no method of transmission over the internet is 100% secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-soil mb-4 font-serif">7. Your Rights</h2>
                            <p>
                                You have the right to request access to the personal data we hold about you or request its deletion. To exercise these rights, please contact us at <a href="mailto:hello@basho.com" className="text-clay hover:underline">hello@basho.com</a>.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-soil mb-4 font-serif">8. Updates to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.
                            </p>
                        </section>

                    </div>
                </motion.div>
            </div>
        </div>
    );
}
