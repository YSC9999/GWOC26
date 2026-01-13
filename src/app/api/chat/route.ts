import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY missing");
            return NextResponse.json({ reply: "API Key missing" }, { status: 500 });
        }

        // Using gemini-1.5-flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `You are the AI assistant for 'Basho by Shivangi', a premium handcrafted pottery brand. 
                Your tone is warm, artistic, and sophisticated. 
                Visitor says: ${message}`
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini Raw API Error:", JSON.stringify(errorData, null, 2));
            return NextResponse.json({ reply: "I'm having trouble thinking right now. Please try again." }, { status: 500 });
        }

        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I didn't catch that.";

        return NextResponse.json({ reply: replyText });


    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { reply: "I'm having a little trouble connecting to the creative muse right now. Please try again in a moment." },
            { status: 500 }
        );
    }
}
