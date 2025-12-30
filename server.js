import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Get API Key
const getApiKey = () => {
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('MISSING_API_KEY: Gemini API Key is not configured in .env');
  }
  return apiKey;
};

/**
 * Helper: Truncate Data for LLM Context Window
 */
const createSafePrompt = (owner, repo, data) => {
  let dataString = JSON.stringify(data, null, 2);
  const MAX_CHARS = 30000;

  if (dataString.length > MAX_CHARS) {
    console.warn(`⚠️ Truncating payload for ${owner}/${repo} from ${dataString.length} to ${MAX_CHARS} chars.`);
    dataString = dataString.substring(0, MAX_CHARS) + '\n... [TRUNCATED]';
  }

  return `Analyze the repository ${owner}/${repo} for production readiness.

Repository Data Summary:
${dataString}

Respond with strictly valid JSON using this structure:
{
  "summary": "ملخص عام",
  "overallStatus": "ready|conditional|not-ready",
  "domains": [
    {
      "title": "Security",
      "status": "ready|conditional|not-ready",
      "description": "شرح تفصيلي",
      "findings": ["مشكلة 1", "مشكلة 2"],
      "recommendations": ["حل 1", "حل 2"]
    }
  ],
  "criticalIssues": ["مشكلة حرجة 1"],
  "recommendations": ["توصية عامة"],
  "conclusion": "الخلاصة"
}
Response MUST be in Arabic. Include at least 5 domains: Security, Performance, Documentation, Testing, Infrastructure.`;
};

/**
 * Helper: Call Gemini REST API directly
 */
async function callGeminiAPI(prompt, modelName = 'gemini-3-pro-preview') {
  const apiKey = getApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Gemini API Error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// LLM endpoint
app.post('/api/llm', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    console.log(`📤 LLM Request received`);
    const response = await callGeminiAPI(prompt);
    res.json({ response });
  } catch (error) {
    console.error('❌ Error calling Gemini:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Analysis endpoint
app.post('/api/analyze', async (req, res) => {
  const { owner, repo, analysisData } = req.body;
  console.log(`📊 Analysis Request: ${owner}/${repo}`);

  try {
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repo are required' });
    }

    const prompt = createSafePrompt(owner, repo, analysisData);
    const responseText = await callGeminiAPI(prompt);

    // Parse JSON
    let analysisResult;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
      analysisResult = JSON.parse(cleanJson);
    } catch (parseError) {
      console.warn('⚠️ JSON Parse Failed.');
      throw new Error('Failed to parse AI response as JSON');
    }

    console.log(`✅ Analysis completed for ${owner}/${repo}`);
    res.json({ success: true, data: analysisResult });

  } catch (error) {
    console.error('❌ Error in analysis:', error.message);

    // Fallback
    const fallbackAnalysis = {
      summary: 'تعذر إكمال التحليل الذكي.',
      overallStatus: 'needs_work',
      domains: [
        {
          title: 'System Analysis',
          status: 'not-ready',
          description: `Error: ${error.message}`,
          findings: [`Error: ${error.message}`],
          recommendations: ['Check API Quota', 'Verify API Key', 'Try again later']
        }
      ],
      criticalIssues: ['AI Service Unavailable'],
      recommendations: ['Ensure GEMINI_API_KEY is set in .env'],
      conclusion: 'حدث خطأ أثناء الاتصال بخدمة التحليل.'
    };

    res.json({ success: true, data: fallbackAnalysis });
  }
});

// Incident Analysis Endpoint
app.post('/api/analyze-incident', async (req, res) => {
  try {
    const { debugData } = req.body;
    if (!debugData) return res.status(400).json({ error: 'Debug data is required' });

    console.log(`🕵️ Incident Analysis Request`);
    const prompt = `Analyze this incident root cause (Respond in JSON Arabic):\n${JSON.stringify(debugData).substring(0, 15000)}`;

    const text = await callGeminiAPI(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : "{}";

    res.json({ success: true, data: JSON.parse(cleanJson) });

  } catch (error) {
    console.error('❌ Error in incident analysis:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled. Max Payload: 50mb`);
  if (!process.env.VITE_GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
    console.warn(`⚠️ WARNING: GEMINI_API_KEY is missing!`);
  } else {
    console.log(`🔑 Gemini API Key detected.`);
  }
});
