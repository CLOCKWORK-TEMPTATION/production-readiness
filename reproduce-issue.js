
async function test() {
    try {
        const response = await fetch('http://localhost:3001/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                owner: 'test',
                repo: 'test',
                analysisData: { languages: ['javascript'] }
            })
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Body:', text);
    } catch (err) {
        console.error('Error:', err);
    }
}

test();
