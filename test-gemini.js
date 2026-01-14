const https = require('https');

const apiKey = "AIzaSyCM-mfXhxOEZFzGLoLR7v5xB0dWCb3II-E";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

const data = JSON.stringify({
    contents: [
        {
            role: "user",
            parts: [{ text: "Hello" }]
        }
    ]
});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log("Testing Gemini API...");

const req = https.request(url, options, (res) => {
    let responseBody = '';

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log("Response Body:");
        console.log(responseBody);
    });
});

req.on('error', (error) => {
    console.error("Request Error:", error);
});

req.write(data);
req.end();
