import { NextResponse } from "next/server";
import { chatbotFAQs, fallbackResponse } from "@/data/chatbot-faqs";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const lowerMsg = message.toLowerCase();

        // 1. Check local FAQ first (faster, cheaper, and definitive for business logic)
        for (const faq of chatbotFAQs) {
            if (faq.keywords.some(k => lowerMsg.includes(k))) {
                return NextResponse.json({ reply: faq.answer, source: "faq" });
            }
        }

        // 2. Fallback to Gemini if API key exists
        if (process.env.GEMINI_API_KEY) {
            try {
                const { GoogleGenerativeAI } = await import("@google/generative-ai");
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });

                const prompt = `You are a helpful, warm, and aesthetic customer support assistant for 'Basho by Shivangi', a premium pottery studio and ceramic brand.
             Style: Wabi-sabi, calm, artistic, polite.
             Context: We sell handmade stoneware and porcelain ceramics. We also host workshops.
             User Question: ${message}
             
             Answer strictly about pottery/ceramics or the brand. If asked about code/math/politics, politely decline. Keep it short (under 3 sentences).`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                if (text) {
                    return NextResponse.json({ reply: text, source: "ai" });
                }
            } catch (err) {
                console.error("Gemini API Error:", err);
                // Continue to fallback
            }
        }

        return NextResponse.json({ reply: fallbackResponse, source: "fallback" });

    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
