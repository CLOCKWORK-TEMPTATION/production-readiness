# استراتيجية الأداء والتخزين المؤقت (Performance & Caching Strategy)

## 1. أداء الواجهة الأمامية (Frontend Performance)

تعتمد استراتيجية الأداء في هذا المشروع على المقاييس الأساسية لـ Core Web Vitals:
- **LCP (Largest Contentful Paint)**: الهدف أقل من 2.5 ثانية.
- **FCP (First Contentful Paint)**: الهدف أقل من 1.8 ثانية.
- **TTI (Time to Interactive)**: الهدف أقل من 3.8 ثانية.

### التحسينات المطبقة:
- استخدام **Vite** لعملية البناء السريعة وتقسيم الكود (Code Splitting).
- تحسين الصور واستخدام صيغ حديثة مثل SVG.
- تقليل حجم التبعيات (Dependencies) واستخدام التثبيت النظيف `npm ci`.

## 2. استراتيجية التخزين المؤقت (Caching Strategy)

تم تنفيذ استراتيجية التخزين المؤقت على مستويين:

### أ. مستوى Nginx (للبيئات المعتمدة على Docker):
تم ضبط ملف `nginx.conf` للتعامل مع الملفات الثابتة كالتالي:
- الملفات (JS, CSS, Images, SVG): يتم تخزينها لمدة **سنة كاملة** (`expires 1y`) مع استخدام `Cache-Control: public, immutable`.
- ملفات HTML: لا يتم تخزينها مؤقتاً لضمان الحصول على أحدث نسخة من التطبيق.

### ب. مستوى Vercel:
تم ضبط `vercel.json` لتوفير أداء مثالي على شبكة CDN:
- الأصول الثابتة في `/assets/`: تخزين مؤقت لمدة سنة (`max-age=31536000`).
- ملفات HTML: تخزين مؤقت لمدة ساعة مع التحقق (`max-age=3600, must-revalidate`).

## 3. مراقبة الأداء (Performance Monitoring)

- يتم تشغيل **Lighthouse Audit** تلقائياً في كل Pull Request عبر GitHub Actions.
- يفشل البناء إذا قل تقييم الأداء عن 80% أو إمكانية الوصول عن 90%.

## 4. ضغط الملفات (Compression)

يتم استخدام ضغط **Gzip** في Nginx لتقليل حجم البيانات المنقولة لملفات النص، CSS، و JavaScript.
