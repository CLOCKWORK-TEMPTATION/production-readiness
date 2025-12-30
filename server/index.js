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
  return `أنت خبير هندسي متخصص في تقييم جاهزية التطبيقات للنشر في بيئات الإنتاج. مهمتك هي إجراء مراجعة هندسية شاملة وكتابة تقرير جاهزية إنتاج (Production Readiness Report) احترافي لتطبيق ويب تفاعلي.

════════════════════════════════════════════════════════════════════════════════
📋 المعلومات المتوفرة عن التطبيق
════════════════════════════════════════════════════════════════════════════════

معلومات المستودع:
- المالك: ${owner}
- اسم المستودع: ${repo}
- اللغات البرمجية: ${analysisData.languages.join(', ') || 'غير محددة'}

البنية التقنية:
- package.json: ${analysisData.hasPackageJson ? '✓ موجود' : '✗ غير موجود'}
- requirements.txt: ${analysisData.hasRequirementsTxt ? '✓ موجود' : '✗ غير موجود'}
- pyproject.toml: ${analysisData.hasPyprojectToml ? '✓ موجود' : '✗ غير موجود'}
- Dockerfile: ${analysisData.hasDockerfile ? '✓ موجود' : '✗ غير موجود'}

ضمان الجودة:
- اختبارات آلية: ${analysisData.hasTests ? '✓ موجودة' : '✗ غير موجودة'}
- CI/CD Pipeline: ${analysisData.hasCI ? '✓ موجود' : '✗ غير موجود'}

التوثيق:
- README: ${analysisData.hasReadme ? '✓ موجود' : '✗ غير موجود'}
- .gitignore: ${analysisData.hasGitignore ? '✓ موجود' : '✗ غير موجود'}

هيكل الملفات:
${analysisData.fileStructure.join('\n')}

${analysisData.packageJsonContent ? `
────────────────────────────────────────────────────────────────────────────────
📦 محتوى package.json
────────────────────────────────────────────────────────────────────────────────
${analysisData.packageJsonContent.substring(0, 2000)}
` : ''}

${analysisData.readmeContent ? `
────────────────────────────────────────────────────────────────────────────────
📄 محتوى README
────────────────────────────────────────────────────────────────────────────────
${analysisData.readmeContent.substring(0, 2000)}
` : ''}

${analysisData.requirementsContent ? `
────────────────────────────────────────────────────────────────────────────────
📋 محتوى requirements.txt
────────────────────────────────────────────────────────────────────────────────
${analysisData.requirementsContent.substring(0, 1000)}
` : ''}

════════════════════════════════════════════════════════════════════════════════
🎯 المجالات الهندسية للتقييم
════════════════════════════════════════════════════════════════════════════════

قم بتقييم التطبيق عبر المجالات الهندسية العشرة التالية:

1️⃣ **الوظائف الأساسية (Core Functionality)**
   معايير التقييم:
   • اكتمال الميزات الأساسية المطلوبة
   • استقرار الوظائف وخلوها من الأخطاء الحرجة
   • تغطية حالات الاستخدام الرئيسية
   • معالجة الأخطاء والحالات الاستثنائية

2️⃣ **الأداء (Performance)**
   معايير التقييم:
   • زمن تحميل الصفحة الأولى (< 3 ثواني)
   • زمن الاستجابة للعمليات (< 200ms)
   • كفاءة استخدام الموارد (Memory/CPU)
   • قابلية التوسع الأفقي والعمودي
   • تحسين الصور والأصول الثابتة
   • استراتيجيات التخزين المؤقت (Caching)

3️⃣ **الأمان (Security)**
   معايير التقييم:
   • آليات المصادقة والتفويض (Authentication/Authorization)
   • حماية من الثغرات الشائعة (OWASP Top 10)
   • تشفير البيانات الحساسة (في الحركة وفي الراحة)
   • إدارة الأسرار والمفاتيح (Secrets Management)
   • حماية من CSRF, XSS, SQL Injection
   • سياسات CORS و Content Security Policy
   • تحديثات أمنية للمكتبات والاعتماديات

4️⃣ **البنية التحتية (Infrastructure)**
   معايير التقييم:
   • توفر بيئات متعددة (Dev/Staging/Production)
   • آليات النشر الآلي (Deployment Automation)
   • إدارة الإعدادات البيئية (Environment Configuration)
   • استراتيجيات التوسع (Scaling Strategy)
   • التوافرية العالية (High Availability)
   • استراتيجية النسخ الاحتياطي التلقائي

5️⃣ **المراقبة والسجلات (Monitoring & Logging)**
   معايير التقييم:
   • نظام تسجيل الأحداث الشامل (Structured Logging)
   • مراقبة الأداء والموارد (APM)
   • تنبيهات الأخطاء والمشاكل الحرجة (Alerting)
   • تتبع الأخطاء (Error Tracking)
   • لوحات القياس والمقاييس (Metrics Dashboard)

6️⃣ **النسخ الاحتياطي والاستعادة (Backup & Recovery)**
   معايير التقييم:
   • استراتيجية النسخ الاحتياطي الآلي
   • نقطة استعادة الهدف (RPO - Recovery Point Objective)
   • وقت استعادة الهدف (RTO - Recovery Time Objective)
   • خطة التعافي من الكوارث (Disaster Recovery Plan)
   • اختبار دوري لعمليات الاستعادة

7️⃣ **التوثيق (Documentation)**
   معايير التقييم:
   • README شامل يوضح الغرض والاستخدام
   • توثيق التثبيت والإعداد
   • توثيق API (إن وجد)
   • توثيق البنية المعمارية
   • توثيق العمليات التشغيلية (Runbooks)
   • دليل المساهمة (Contributing Guide)

8️⃣ **الاختبار (Testing)**
   معايير التقييم:
   • اختبارات الوحدة (Unit Tests) - تغطية > 70%
   • اختبارات التكامل (Integration Tests)
   • اختبارات من النهاية للنهاية (E2E Tests)
   • اختبارات الأداء والحمل (Load/Stress Tests)
   • اختبارات الأمان (Security Tests)
   • اختبارات قبول المستخدم (UAT)

9️⃣ **التوافق (Compatibility)**
   معايير التقييم:
   • دعم المتصفحات الرئيسية (Chrome, Firefox, Safari, Edge)
   • التوافق مع الأجهزة المختلفة (Desktop, Mobile, Tablet)
   • التصميم المتجاوب (Responsive Design)
   • إمكانية الوصول (Accessibility - WCAG 2.1)
   • دعم اللغات المتعددة (إن كان مطلوباً)

🔟 **الامتثال (Compliance)**
   معايير التقييم:
   • الامتثال لـ GDPR (إن كان التطبيق يخدم الاتحاد الأوروبي)
   • سياسات الخصوصية وشروط الاستخدام
   • الامتثال للمعايير الصناعية (ISO, SOC 2, إلخ)
   • متطلبات الترخيص (License Compliance)
   • لوائح حماية البيانات المحلية

════════════════════════════════════════════════════════════════════════════════
📊 منهجية التقييم
════════════════════════════════════════════════════════════════════════════════

نظام التقييم لكل مجال:
- **ready** (جاهز): المجال يلبي جميع المعايير الأساسية ومُجهّز للإنتاج
- **conditional** (جاهز بشروط): المجال يحتاج تحسينات طفيفة أو متوسطة، لكن ليست حرجة
- **not-ready** (غير جاهز): المجال يعاني من نقص حرج يمنع النشر
- **unknown** (غير محدد): معلومات غير كافية للتقييم

نظام الأولويات للتوصيات:
- **P0 (حرج)**: يجب معالجته قبل النشر - يمنع النشر
- **P1 (عالي)**: يجب معالجته في أقرب وقت - يؤثر على الاستقرار أو الأمان
- **P2 (متوسط)**: يُنصح بمعالجته قريباً - يحسن الجودة
- **P3 (منخفض)**: يمكن معالجته لاحقاً - تحسينات اختيارية

════════════════════════════════════════════════════════════════════════════════
✍️ إرشادات كتابة التقرير
════════════════════════════════════════════════════════════════════════════════

1. **التحليل الأولي**:
   - قبل كتابة التقرير، حلل المعلومات المتوفرة بعمق
   - حدد الأنماط والعلاقات بين المجالات المختلفة
   - ابحث عن الفجوات المعلوماتية الحرجة
   - استنتج معلومات ضمنية من البيانات المتاحة

2. **الدقة والموضوعية**:
   - قدم تقييماً موضوعياً مبنياً على الأدلة
   - اذكر أي افتراضات قمت بها بوضوح
   - لا تقدم تقييمات مبنية على تخمينات إذا كانت البيانات غير كافية
   - استخدم "unknown" عندما لا تتوفر معلومات كافية

3. **القابلية للتنفيذ**:
   - اجعل كل توصية محددة وقابلة للتنفيذ
   - أضف الأولوية لكل توصية
   - اقترح خطوات عملية واضحة

4. **الشمولية**:
   - غطِ جميع المجالات العشرة حتى لو كانت المعلومات محدودة
   - اربط المجالات ببعضها عند الحاجة
   - حدد التأثيرات المتداخلة بين المجالات

════════════════════════════════════════════════════════════════════════════════
📤 هيكل الرد المطلوب (JSON)
════════════════════════════════════════════════════════════════════════════════

يجب أن يكون الرد بصيغة JSON التالية بالضبط (كل النصوص بالعربية):

{
  "metadata": {
    "reportDate": "التاريخ الحالي",
    "repository": "${owner}/${repo}",
    "primaryLanguages": ["اللغة الأساسية 1", "اللغة الأساسية 2"]
  },
  "summary": "نظرة عامة شاملة عن التطبيق وغرض التقرير والنتائج الرئيسية (3-5 جمل)",
  "overallStatus": "ready أو conditional أو not-ready",
  "overallScore": "النسبة المئوية للجاهزية الإجمالية (0-100)",
  "readinessLevel": "وصف نصي لمستوى الجاهزية (مثال: 'جاهز للإنتاج بعد معالجة 3 نقاط حرجة')",
  
  "domains": [
    {
      "id": 1,
      "title": "الوظائف الأساسية",
      "status": "ready أو conditional أو not-ready أو unknown",
      "score": "النسبة المئوية للجاهزية في هذا المجال (0-100)",
      "description": "تقييم شامل للحالة مع ذكر السياق الهندسي (2-3 جمل)",
      "strengths": ["نقطة قوة 1", "نقطة قوة 2"],
      "weaknesses": ["نقطة ضعف 1", "نقطة ضعف 2"],
      "findings": [
        "ملاحظة محددة مع دليل 1",
        "ملاحظة محددة مع دليل 2",
        "ملاحظة محددة مع دليل 3"
      ],
      "recommendations": [
        {
          "priority": "P0 أو P1 أو P2 أو P3",
          "action": "التوصية المحددة",
          "rationale": "السبب والتأثير المتوقع"
        }
      ],
      "missingInfo": ["معلومة مفقودة 1 مطلوبة للتقييم الكامل", "معلومة مفقودة 2"]
    }
    // كرر لجميع المجالات العشرة بنفس الترتيب
  ],
  
  "criticalIssues": [
    {
      "domain": "اسم المجال",
      "issue": "وصف المشكلة الحرجة",
      "impact": "التأثير على الإنتاج",
      "priority": "P0"
    }
  ],
  
  "recommendations": {
    "immediate": ["إجراء فوري 1 (P0)", "إجراء فوري 2 (P0)"],
    "shortTerm": ["إجراء قصير المدى 1 (P1)", "إجراء قصير المدى 2 (P1)"],
    "mediumTerm": ["إجراء متوسط المدى 1 (P2)", "إجراء متوسط المدى 2 (P2)"],
    "longTerm": ["إجراء طويل المدى 1 (P3)", "إجراء طويل المدى 2 (P3)"]

  "conclusion":"الخلاصة النهائية: تقييم الجاهزية الإجمالي مع توصية واضحة وحاسمة (جاهز للإنتاج / جاهز بشروط / غير جاهز) مع تبرير هندسي مفصل يستند إلى التحليل الشامل. يجب أن يتضمن: (1) ملخص الوضع الحالي (2) الخطوات الحرجة المطلوبة (3) الإطار الزمني المقترح (4) المخاطر المحتملة (5) التوصية النهائية الوا════════════════════════════════════════════════════════════════════════════ تعليمات حاسمة
════════════════════════════════════════════════════════════════════════════════

1. يجب تضمين جميع المجالات العشرة في domains بنفس الترتيب المذكور
2. جميع النصوص يجب أن تكون باللغة العربية الفصحى الاحترافية
3. لا تستخدم رموز تعبيرية (emojis) في محتوى JSON
4. كن محدداً في التوصيات - تجنب العموميات
5. أضف priority لكل توصية
6. إذا كانت المعلومات غير كافية، استخدم "unknown" واذكر ذلك في missingInfo
7. اربط التوصيات بالأدلة المستخرجة من تحليل المستودع
8. احسب score بناءً على المعايير المستوفاة من إجمالي المعايير لكل مجال

ابدأ التحليل الآن وقدم تقريراً هندسياً شاملاً واحترافياً`;
}

// Incident analysis endpoint
app.post('/api/incident-analyze', async (req, res) => {
  const startTime = Date.now()
  
  try {
    const { owner, repo, analysisData } = req.body

    if (!owner || !repo) {
      return res.status(400).json({
        error: 'Owner and repository are required'
      })
    }

    console.log(`🔍 Starting incident analysis for ${owner}/${repo}...`)

    // Build the analysis prompt
    const prompt = buildAnalysisPrompt(owner, repo, analysisData)

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