import dotenv from 'dotenv';
dotenv.config();

// Standard fetch is available in Node 18+
const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error('No API Key found');
    process.exit(1);
}

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    console.log(`Fetching models from: ${url.replace(API_KEY, 'HIDDEN_KEY')}`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            const text = await response.text();
            console.error('Body:', text);
            return;
        }
        const data = await response.json();
        if (data.models) {
            console.log('Available Models:');
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log('No models found in response:', data);
        }
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

listModels();
