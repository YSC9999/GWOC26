"use client";
import React from "react";
import { motion } from "framer-motion";

export default function TermsPage() {
    const [studioInfo, setStudioInfo] = React.useState<any>(null);

    React.useEffect(() => {
        fetch('/api/studio').then(res => res.json()).then(data => {
            if (data.studioInfo) setStudioInfo(data.studioInfo);
        });
    }, []);

    return (
        <div className="min-h-screen py-20 bg-sand/20">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-soil mb-8 font-serif text-center">
                        Terms and Conditions
                    </h1>

                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-soil/10 space-y-8 text-soil/80 leading-relaxed">
                        {/* Sections 1-7 remain identical, just collapsing for brevity in replacement if possible, but replace_file_content needs context. I will keep them. */}

                        <section>
                            <h2 className="text-2xl font-bold text-soil mb-4 font-serif">1. Introduction</h2>
                            <p>
                                Welcome to Basho by Shivangi. These terms and conditions outline the rules and regulations for the use of our website and purchase of our handcrafted products. By accessing this website, we assume you accept these terms and conditions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-soil mb-4 font-serif">2. Handcrafted Nature of Products</h2>
                            <p>
                                All our pottery pieces are handcrafted. This means that:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li>No two pieces are exactly alike.</li>
                                <li>There may be slight variations in size, color, texture, and glaze finish compared to the images shown on the website.</li>
                                <li>These irregularities are not defects but rather the mark of handmade artisanship.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-soil mb-4 font-serif">3. Orders & Custom Requests</h2>
                            <p>
                                <strong>Ready-made Orders:</strong> Orders for available stock are processed within 2-3 business days.
                            </p>
                            <p className="mt-2">
                                <strong>Custom Orders:</strong> Custom requests require a consultation and potentially a deposit. Timelines for custom work vary based on complexity and firing schedules, typically ranging from 3 to 6 weeks.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-soil mb-4 font-serif">4. Shipping & Delivery</h2>
                            <p>
                                Shipping costs are calculated based on the total weight of the package. We partner with reliable courier services to ensure your pottery arrives safely.
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li>Processing Time: 2-4 business days.</li>
                                <li>Delivery Time: Varies by location (typically 5-7 business days across India).</li>
                                <li>Basho is not liable for delays caused by the courier service or unforeseen circumstances.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-soil mb-4 font-serif">5. International Shipping</h2>
                            <p>
                                Currently, we primarily ship within India. For international inquiries, please contact us directly for a custom shipping quote. Customs duties, if applicable, are the responsibility of the buyer.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-soil mb-4 font-serif">6. Returns & Refunds</h2>
                            <p>
                                Due to the fragile and unique nature of our products, <strong>we do not accept returns for change of mind.</strong>
                            </p>
                            <p className="mt-2">
                                <strong>Damaged Goods:</strong> In the rare event that a piece arrives damaged, please:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li>Take a clear unboxing video (mandatory for claims).</li>
                                <li>Contact us within 24 hours of delivery.</li>
                                <li>We will offer a replacement or a refund after verifying the damage.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-soil mb-4 font-serif">7. Workshops & Experiences</h2>
                            <p>
                                Workshop slots are confirmed only upon full payment.
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li><strong>Cancellations:</strong> Cancellations made 48 hours prior to the workshop are eligible for a 50% refund or rescheduling.</li>
                                <li>Last-minute cancellations (less than 48 hours) are non-refundable.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-soil mb-4 font-serif">8. Contact Us</h2>
                            <p>
                                If you have any questions about these Terms, please contact us at <a href={`mailto:${studioInfo?.email || "hello@basho.com"}`} className="text-clay hover:underline">{studioInfo?.email || "hello@basho.com"}</a>.
                            </p>
                        </section>

                    </div>
                </motion.div>
            </div>
        </div>
    );
}
