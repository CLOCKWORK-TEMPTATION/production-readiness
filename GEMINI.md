# Production Readiness Analyzer

## نظرة عامة على المشروع

مشروع **Production Readiness Analyzer** عبارة عن تطبيق ويب تفاعلي متصمم عشان يقيّم مدى جاهزية تطبيقات TypeScript و Python للإنتاج (Production). التطبيق بيحلل الـ GitHub repositories وبيطلع تقارير شاملة بالعربي، بتغطي مجالات أساسية زي الوظائف الجوهرية (Core Functionality)، الأداء، الأمان، والبنية التحتية.

**التقنيات المستخدمة:**
*   **Framework:** React (TypeScript) + Vite
*   **Styling:** Tailwind CSS
*   **UI Components:** Radix UI primitives, shadcn/ui-like components
*   **State Management & Data Fetching:** React Query, React Hook Form, Zod
*   **Icons:** Lucide React, Phosphor Icons
*   **APIs:** GitHub API (عن طريق Octokit)، Spark LLM (لتوليد التقارير)

## البناء والتشغيل (Building and Running)

المشروع بيستخدم `npm` لإدارة المكتبات و `vite` لبناء وتشغيل التطبيق.

### أوامر أساسية:

*   **تسطيب المكتبات:** `npm install`
*   **تشغيل سيرفر التطوير:** `npm run dev` (بيشغل Vite dev server)
*   **البناء للإنتاج:** `npm run build` (بيعمل Compile للـ TypeScript وبيجمع الملفات بـ Vite)
*   **فحص الكود (Linting):** `npm run lint` (بيشغل ESLint)
*   **معاينة النسخة النهائية:** `npm run preview` (بيعمل Preview لنسخة الإنتاج محلياً)

## معمارية وهيكلة الكود (Architecture & Code Structure)

الكود المصدري موجود في فولدر `src/`:

*   **`src/components/`**: مكونات React.
    *   `ui/`: مكونات واجهة مستخدم قابلة لإعادة الاستخدام (زراير، inputs، كروت، إلخ)، مبنية على Radix UI.
    *   مكونات خاصة بالمزايا: `AnalysisForm.tsx`, `ReportView.tsx`, `ReportHistory.tsx`.
*   **`src/lib/`**: المنطق الأساسي والأدوات المساعدة.
    *   `analyzer.ts`: بيحتوي على منطق تحليل بيانات الـ repository والتعامل مع الـ LLM لتوليد التقارير.
    *   `github.ts`: بيتعامل مع GitHub API (بيجيب معلومات الـ repo والمحتوى).
    *   `utils.ts`: دوال مساعدة عامة.
*   **`src/types/`**: تعريفات TypeScript (مثلاً `report.ts` لهيكل التقرير).
*   **`src/hooks/`**: Custom React hooks.

## المزايا الرئيسية

1.  **تحليل المستودع (Repository Analysis):**
    *   بيجيب الـ metadata وهيكل الملفات بتاع الـ repository عن طريق GitHub API.
    *   بيكتشف الملفات المهمة زي `package.json`, `Dockerfile`, إعدادات الـ CI, والاختبارات.
2.  **توليد التقرير (Report Generation):**
    *   بيستخدم LLM (Spark) عشان يطلع تقرير مفصل بالعربي بناءً على البيانات اللي جمعها.
    *   بيقيّم 10 مجالات رئيسية: الوظائف الجوهرية، الأداء، الأمان، البنية التحتية، المراقبة، النسخ الاحتياطي، التوثيق، الاختبارات، التوافق، والامتثال.
3.  **العرض المرئي (Visualization):**
    *   بيعرض التقرير في واجهة مستخدم نظيفة واحترافية مع مؤشرات حالة واضحة (جاهز، مشروط، غير جاهز).

## قواعد التطوير (Development Conventions)

*   **اللغة:** استخدام TypeScript بشكل صارم.
*   **التنسيق (Styling):** استخدام Tailwind CSS لكل التنسيقات.
*   **المكونات:** يفضل عمل مكونات صغيرة وقابلة لإعادة الاستخدام في `src/components/ui` لعناصر الواجهة العامة.
*   **الحالة (State):** استخدام React Query للحالة غير المتزامنة (API calls) و الـ React hooks العادية لحالة الواجهة المحلية.
*   **التنسيق (Formatting):** الالتزام بإعدادات Prettier/ESLint (شغل `npm run lint` عشان تتأكد).
*   **الأيقونات:** استخدام Lucide React أو Phosphor Icons عشان التناسق.
