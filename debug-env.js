
import dotenv from 'dotenv';
import path from 'path';

const result = dotenv.config();

console.log('Dotenv parsed:', result.parsed ? Object.keys(result.parsed) : 'null');
if (result.error) console.error('Dotenv error:', result.error);

console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'FOUND' : 'MISSING');
if (process.env.GEMINI_API_KEY) {
    console.log('Key length:', process.env.GEMINI_API_KEY.length);
    console.log('First 5 chars:', process.env.GEMINI_API_KEY.substring(0, 5));
}
