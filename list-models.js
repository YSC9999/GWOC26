const https = require('https');

const apiKey = "AIzaSyCM-mfXhxOEZFzGLoLR7v5xB0dWCb3II-E";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("Listing available Gemini models...");

https.get(url, (res) => {
    let responseBody = '';

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        try {
            const data = JSON.parse(responseBody);
            if (data.models) {
                console.log("Available Models:");
                data.models.forEach(m => {
                    if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                        console.log(`- ${m.name}`);
                    }
                });
            } else {
                console.log("Response Body (Error?):");
                console.log(responseBody);
            }
        } catch (e) {
            console.log("Raw Response:");
            console.log(responseBody);
        }
    });
}).on('error', (error) => {
    console.error("Request Error:", error);
});
