/**
 * Production Readiness Analyzer - Backend Proxy Server
 * Securely handles Google GenAI API calls without exposing API keys to the client
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const GENAI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))

// CORS configuration - strict in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL || '').split(',')
    : '*',
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '1mb' }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

/**
 * POST /api/analyze
 * Analyzes a GitHub repository and generates production readiness report
 */
app.post('/api/analyze', async (req, res) => {
  const startTime = Date.now()

  try {
    const { owner, repo, analysisData } = req.body

    // Validate required fields
    if (!owner || !repo) {
      return res.status(400).json({
        error: 'Missing required fields: owner and repo are required'
      })
    }

    // Validate API key (Server-side check)
    console.log('DEBUG: Handler GENAI_API_KEY status:', GENAI_API_KEY ? 'Present' : 'Missing', 'Length:', GENAI_API_KEY ? GENAI_API_KEY.length : 0)
    if (!GENAI_API_KEY) {
      console.error('CRITICAL: GEMINI_API_KEY is missing via process.env')
      return res.status(500).json({
        error: 'Configuration error: Analysis service is not available (KEY_MISSING_RUNTIME_CHECK).'
      })
    }

    // Build the prompt for the AI
    const prompt = buildAnalysisPrompt(owner, repo, analysisData)

    // Call Google GenAI REST API directly (more reliable than SDK)
    const modelName = 'models/gemini-3-pro-preview'
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${GENAI_API_KEY}`

    console.log(`🚀 Sending request to Gemini (${modelName})...`)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Gemini API error: ${response.status} ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!responseText) {
      throw new Error('Empty response received from Gemini API')
    }

    // Parse and return the response safely
    let cleanText = responseText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim()

    let reportData
    try {
      reportData = JSON.parse(cleanText)
    } catch (e) {
      console.error('JSON Parse Error. Raw text:', cleanText)
      // Attempt to salvage non-JSON response if possible, or fail gracefully
      throw new Error('AI response was not valid JSON: ' + e.message)
    }

    const duration = Date.now() - startTime
    console.log(`✅ Analysis completed in ${duration}ms`)

    res.json({
      success: true,
      data: reportData,
      meta: {
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        model: modelName
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error('❌ Analysis Fatal Error:', error)

    // Distinguish between Google API errors and internal errors
    const errorMessage = error.message || 'Unknown error occurred'
    const isGoogleError = errorMessage.includes('Google') || errorMessage.includes('400') || errorMessage.includes('404')

    res.status(500).json({
      error: 'فشل في تحليل المستودع. حدث خطأ داخلي.',
      details: {
        message: errorMessage,
        type: isGoogleError ? 'AI_SERVICE_ERROR' : 'INTERNAL_ERROR'
      },
      meta: {
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
    })
  }
})

/**
 * Build the analysis prompt for the AI
 */
function buildAnalysisPrompt(owner, repo, analysisData) {
  const data = analysisData || {}

  return `أنت خبير في تقييم جاهزية التطبيقات للإنتاج. ستقوم بكتابة تقرير جاهزية الإنتاج (تقرير جاهزية الإنتاج) لتطبيق ويب تفاعلي. هذا التقرير يجب أن يكون مكتوباً بالكامل باللغة العربية ويجب أن يقيّم ما إذا كان التطبيق جاهزاً للنشر في بيئة إنتاجية.

معلومات التطبيق:
- المالك: ${owner}
- اسم المستودع: ${repo}
- اللغات: ${(data.languages || []).join(', ') || 'غير محددة'}
- يحتوي على package.json: ${data.hasPackageJson ? 'نعم' : 'لا'}
- يحتوي على Dockerfile: ${data.hasDockerfile ? 'نعم' : 'لا'}
- يحتوي على اختبارات: ${data.hasTests ? 'نعم' : 'لا'}
- يحتوي على CI/CD: ${data.hasCI ? 'نعم' : 'لا'}

قم بإنشاء تقرير JSON بالهيكل التالي فقط:
{
  "summary": "نص",
  "overallStatus": "ready|conditional|not-ready",
  "domains": [ ... ],
  "criticalIssues": [ ... ],
  "recommendations": [ ... ],
  "conclusion": "نص"
}
`
}

// Incident Analysis Endpoint
app.post('/api/analyze-incident', async (req, res) => {
  const startTime = Date.now()
  try {
    const { debugData } = req.body;

    if (!debugData) {
      return res.status(400).json({ error: 'Debug data is required' });
    }

    // Validate API key
    if (!GENAI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured on the server')
      return res.status(500).json({
        error: 'Configuration error: Analysis service is not available.'
      })
    }

    console.log(`🕵️ Incident Analysis Request received - VERSION CHECK: gemini-3-pro-preview`);

    // Senior SRE Prompt Template
    const prompt = `أنت خبير في موثوقية المواقع (Senior SRE) ومتخصص في تشخيص الأعطال البرمجية المعقدة (Deep Debugging Specialist). مهمتك هي تحليل الخطأ المقدم، تطبيق منهجية "تحليل السبب الجذري" (Root Cause Analysis - RCA)، وتقديم حل نهائي يمنع تكرار المشكلة، وليس مجرد "رقعة" (Hotfix) مؤقتة.

════════════════════════════════════════════════════════════════════════════════
🚨 بيانات الحادث / العطل
════════════════════════════════════════════════════════════════════════════════

تفاصيل المشكلة:
- رسالة الخطأ (Error Log): ${debugData.errorLog || 'غير متوفر'}
- سلوك غير متوقع: ${debugData.symptoms}
- البيئة (OS/Env): ${debugData.environment}

${debugData.codeSnippet ? `
────────────────────────────────────────────────────────────────────────────────
💻 الكود المشتبه به
────────────────────────────────────────────────────────────────────────────────
${debugData.codeSnippet}
` : ''}

${debugData.stackTrace ? `
────────────────────────────────────────────────────────────────────────────────
محفوظات المكدس (Stack Trace)
────────────────────────────────────────────────────────────────────────────────
${debugData.stackTrace}
` : ''}

════════════════════════════════════════════════════════════════════════════════
🕵️ منهجية التحقيق والتشخيص
════════════════════════════════════════════════════════════════════════════════

قم بتحليل المشكلة عبر المراحل التشخيصية التالية:

1️⃣ **تحليل الأثر (Trace Analysis)**
   • تتبع مسار التنفيذ بدقة من الـ Stack Trace.
   • تحديد نقطة الانهيار بالضبط (The exact point of failure).
   • هل الخطأ في الكود الخاص بنا أم في مكتبة خارجية؟

2️⃣ **فحص الحالة والبيانات (State & Data Inspection)**
   • ما هي قيم المتغيرات لحظة حدوث الخطأ؟
   • هل هناك بيانات تالفة (Corrupted Data) أو Null Pointer؟
   • هل نوع البيانات غير متوقع (Type Mismatch)؟

3️⃣ **المنطق والتدفق (Logic & Flow)**
   • هل هناك خطأ في الخوارزمية (Infinite Loop, Off-by-one)؟
   • هل هناك شرط منطقي غير مغطى (Unhandled Edge Case)؟
   • هل هناك مشكلة في التحكم في التدفق (Control Flow)؟

4️⃣ **التزامن والوقت (Concurrency & Timing)**
   • هل المشكلة Race Condition؟
   • هل هناك Deadlock أو Timeout؟
   • هل يعتمد الكود على ترتيب غير مضمون للعمليات؟

5️⃣ **البيئة والتبعية (Environment & Dependencies)**
   • هل المشكلة مرتبطة بإصدار معين من مكتبة (Dependency Hell)؟
   • هل هناك اختلاف بين بيئة التطوير والإنتاج (Config Drift)؟
   • مشاكل في الشبكة أو الاتصال بقواعد البيانات.

════════════════════════════════════════════════════════════════════════════════
🧠 تقنية "الخمسة لماذا" (The 5 Whys)
════════════════════════════════════════════════════════════════════════════════
لا تتوقف عند السبب الظاهر. اسأل "لماذا" 5 مرات للوصول للجذر العميق:
1. لماذا حدث الخطأ؟ (السبب المباشر)
2. لماذا كانت الحالة تسمح بذلك؟
3. لماذا لم يتم التقاط الخطأ؟
4. لماذا وصل النظام لهذه الحالة أصلاً؟
5. ما هو الخلل في العملية الهندسية الذي سمح بذلك؟

════════════════════════════════════════════════════════════════════════════════
📤 هيكل الرد المطلوب (JSON)
════════════════════════════════════════════════════════════════════════════════

يجب أن يكون الرد بصيغة JSON التالية بالضبط (كل النصوص بالعربية):

{
  "incidentReport": {
    "severity": "Critical/High/Medium/Low",
    "errorType": "تصنيف الخطأ (مثال: RuntimeException, LogicError, ResourceExhaustion)",
    "confidenceScore": "نسبة ثقتك في التشخيص (0-100)"
  },
  
  "rootCauseAnalysis": {
    "symptom": "ما يراه المستخدم (العَرَض)",
    "directCause": "السبب التقني المباشر (ما حدث في الكود)",
    "rootCause": "السبب الجذري العميق (لماذا سمح النظام بذلك)",
    "explanation": "شرح تقني دقيق ومبسط لسلسلة الأحداث التي أدت للخطأ"
  },

  "solution": {
    "immediateFix": {
      "code": "الكود المصحح (Snippet)",
      "description": "شرح الإصلاح الفوري"
    },
    "longTermMitigation": "كيف نمنع تكرار هذا مستقبلاً (تغيير معماري أو تحسين عملية)"
  },

  "verificationSteps": [
    "خطوة 1 للتأكد من الإصلاح"
  ],

  "preventionStrategy": [
    {
      "action": "إجراء وقائي (مثال: إضافة Unit Test معين)",
      "type": "Code/Process/Infrastructure"
    }
  ],
  
  "impactAnalysis": "هل الحل المقترح له أي آثار جانبية (Side Effects) محتملة؟"
}

════════════════════════════════════════════════════════════════════════════════
⚠️ تعليمات حاسمة
════════════════════════════════════════════════════════════════════════════════

1. لا تخمن. إذا كانت المعلومات ناقصة، اطلب "Logs" أو "Code" محدد في حقل "rootCause".
2. الحل يجب أن يكون "Production Ready" وليس حلاً سريعاً قد يكسر شيئاً آخر.
3. ركز على "لماذا" حدث الخطأ بقدر تركيزك على "كيف" تصلحه.
4. افترض دائماً أن البيانات المدخلة قد تكون خبيثة أو مشوهة (Defensive Programming).

ابدأ التشخيص الآن.`;

    // Call Google GenAI REST API directly (more reliable than SDK)
    const modelName = 'models/gemini-3-pro-preview'
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${GENAI_API_KEY}`

    console.log(`🕵️ Sending incident analysis request to Gemini (${modelName})...`)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Gemini API error: ${response.status} ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    let cleanText = responseText || '{}'
    cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim()

    let analysisResult;
    try {
      analysisResult = JSON.parse(cleanText);
    } catch (parseError) {
      console.warn('Failed to parse AI response as JSON', parseError);
      // Provide raw text if JSON parse fails, packaged in a structure
      analysisResult = {
        rawResponse: responseText,
        error: "Failed to parse JSON response"
      };
    }

    const duration = Date.now() - startTime
    console.log(`✅ Incident Analysis completed`);

    res.json({
      success: true,
      data: analysisResult,
      meta: {
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime
    console.error('❌ Error in incident analysis:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      meta: {
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`)
  console.log(`🔒 Security: Helmet & CORS enabled`)
  console.log(`🔑 API Key Configured: ${!!GENAI_API_KEY ? 'Yes' : 'No'}`)
})