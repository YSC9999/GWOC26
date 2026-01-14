import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY missing");
            return NextResponse.json({ reply: "API Key missing" }, { status: 500 });
        }

        // Using gemini-2.5-flash (visible in user's dashboard)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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
            // Return the actual error message for debugging purposes
            const errorMessage = errorData.error?.message || "Unknown error from Gemini API";
            return NextResponse.json({ reply: `Error: ${errorMessage}. Please check your API key and billing.` }, { status: 500 });
        }

        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I didn't catch that.";

        return NextResponse.json({ reply: replyText });


    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { reply: `Connection Error: ${error.message}` },
            { status: 500 }
        );
    }
}
