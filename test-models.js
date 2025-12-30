import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!key) {
        console.error('No API key found in env');
        process.exit(1);
    }

    try {
        // Test using REST API directly (same pattern as server files)
        const models = [
            'models/gemini-2.5-flash-exp',
            'models/gemini-2.5-pro-preview-03-25',
            'models/gemini-3-pro-preview'
        ];

        for (const m of models) {
            console.log(`Testing ${m}...`);
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/${m}:generateContent?key=${key}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: 'Hello' }] }]
                    })
                });

                if (response.ok) {
                    console.log(`✅ ${m} works!`);
                } else {
                    const error = await response.json();
                    console.error(`❌ ${m} failed:`, response.status, error);
                }
            } catch (e) {
                console.error(`❌ ${m} failed:`, e.message.split('\n')[0]);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

listModels();
