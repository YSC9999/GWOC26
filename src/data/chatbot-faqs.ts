export const chatbotFAQs = [
    // Greetings (Roboust)
    {
        keywords: ["hi", "hello", "hey", "hlo", "greetings", "good morning", "good evening", "namaste"],
        answer: "Hello! Welcome to Basho. How can I help you with our handcrafted pottery today?"
    },
    // Shipping & Delivery
    {
        keywords: ["ship", "delivery", "arrive", "long", "days", "time"],
        answer: "We typically ship orders within 2-3 business days. Delivery across India usually takes 5-7 working days. You'll receive a tracking link via email once your order is dispatched."
    },
    {
        keywords: ["international", "abroad", "overseas", "usa", "uk"],
        answer: "Currently, we only ship within India. We hope to offer international shipping in the future!"
    },
    {
        keywords: ["track", "status", "where"],
        answer: "You can track your order status in the 'My Orders' section of your account. If you checked out as a guest, please check your email for the tracking link."
    },

    // Returns & Refunds
    {
        keywords: ["return", "refund", "exchange", "broken", "damaged", "issue", "problem"],
        answer: "We have a 7-day return policy for damaged or defective items. If you receive a broken piece, please email us with photos at chiluverusreeshanth@gmail.com within 24 hours of delivery."
    },
    {
        keywords: ["cancel", "change"],
        answer: "You can cancel your order within 24 hours of placing it, provided it hasn't been shipped yet. Please contact support immediately."
    },

    // Generic Product Queries
    {
        keywords: ["material", "made of", "clay"],
        answer: "Our ceramics are handcrafted using high-quality stoneware and porcelain clay bodies, fired to 1200°C for durability and strength."
    },
    {
        keywords: ["microwave", "oven", "safe"],
        answer: "Most of our products are microwave and dishwasher safe unless specified otherwise in the product description. However, we recommend hand washing for longevity."
    },
    {
        keywords: ["food safe", "lead"],
        answer: "Yes, all our tableware is 100% food safe and lead-free. We use high-quality, non-toxic glazes."
    },

    // Workshops
    {
        keywords: ["workshop", "class", "learn", "teach", "course"],
        answer: "We host regular pottery workshops at our studio! Check out the 'Workshop' page for upcoming schedules and to book your spot."
    },
    {
        keywords: ["beginner", "experience"],
        answer: "Our workshops are beginner-friendly! You don't need any prior experience to join our hand-building or wheel-throwing sessions."
    },

    // Custom Orders & Corporate
    {
        keywords: ["custom", "bulk", "corporate", "wholesale", "wedding"],
        answer: "We accept custom and bulk orders for weddings, cafes, and corporate gifting. Please reach out to us via the Contact page with your requirements."
    },

    // Location & Contact
    {
        keywords: ["location", "where", "studio", "address", "visit"],
        answer: "Our studio is located in Hyderabad. You can find the exact location on our Contact page. We are open for visits by appointment."
    },
    {
        keywords: ["contact", "phone", "email", "support", "call"],
        answer: "You can reach us at chiluverusreeshanth@gmail.com or call us at +91 98765 43210 (Mon-Sat, 10 AM - 6 PM)."
    }
];

export const fallbackResponse = "I'm not sure about that. I can help with shipping, returns, workshops, and product care. Could you try asking in a different way?";
