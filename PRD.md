# Planning Guide

إنشاء تطبيق محلل جاهزية الإنتاج - أداة تفاعلية لتقييم جاهزية تطبيقات TypeScript وPython للنشر في بيئة إنتاجية وتوليد تقارير شاملة باللغة العربية.

**Experience Qualities**:
1. Professional - يجب أن يعكس التطبيق الاحترافية والمصداقية حيث يقدم تقارير تقنية دقيقة للمطورين والمهندسين
2. Insightful - يوفر تحليلات عميقة وواضحة تساعد المستخدمين على فهم نقاط القوة والضعف في تطبيقاتهم
3. Efficient - تجربة سريعة ومباشرة تمكن المستخدمين من الحصول على تقارير شاملة بخطوات بسيطة

**Complexity Level**: Light Application (multiple features with basic state)
التطبيق يحتوي على عدة ميزات (إدخال الرابط، التحليل، عرض التقرير، حفظ التقارير) مع حالة بسيطة للإدارة، ولكنه لا يتطلب معمارية معقدة أو عرض متعدد.

## Essential Features

### 1. Repository URL Input
- **Functionality**: حقل إدخال لرابط مستودع GitHub
- **Purpose**: تمكين المستخدم من تحديد المستودع المراد تحليله
- **Trigger**: فتح التطبيق أو النقر على "تحليل جديد"
- **Progression**: المستخدم يدخل رابط GitHub → يتحقق من صحة الرابط → يضغط على زر "تحليل" → يبدأ التحليل
- **Success criteria**: التحقق من صحة رابط GitHub وقبول الروابط الصحيحة فقط

### 2. Intelligent Analysis Engine
- **Functionality**: محرك تحليل يستخدم Spark LLM API لفحص المستودع وتقييم جاهزية الإنتاج
- **Purpose**: تحليل شامل للكود والبنية والممارسات
- **Trigger**: النقر على زر "تحليل"
- **Progression**: إرسال الطلب → استخراج معلومات المستودع عبر GitHub API → تحليل الكود والملفات → توليد تقييم شامل عبر LLM → عرض التقرير
- **Success criteria**: إنتاج تقرير دقيق يغطي جميع الجوانب العشرة المطلوبة

### 3. Comprehensive Arabic Report Display
- **Functionality**: عرض تقرير تفصيلي باللغة العربية مع تقييمات لكل مجال
- **Purpose**: تقديم رؤية واضحة وشاملة عن حالة التطبيق
- **Trigger**: اكتمال التحليل
- **Progression**: استلام نتائج التحليل → تنسيق التقرير → عرض الأقسام بشكل منظم → إظهار التقييم النهائي (جاهز/جاهز بشروط/غير جاهز)
- **Success criteria**: تقرير منسق جيداً يسهل قراءته ويحتوي على جميع المعلومات المطلوبة

### 4. Report History & Persistence
- **Functionality**: حفظ التقارير السابقة وإمكانية الوصول إليها
- **Purpose**: تمكين المستخدمين من تتبع التقارير عبر الوقت
- **Trigger**: اكتمال تحليل جديد أو فتح التطبيق
- **Progression**: حفظ التقرير تلقائياً → عرض قائمة التقارير السابقة → النقر على تقرير → عرض التفاصيل الكاملة
- **Success criteria**: حفظ التقارير بشكل دائم واسترجاعها بنجاح

### 5. Export Functionality
- **Functionality**: تصدير التقرير كملف نصي أو markdown
- **Purpose**: تمكين المستخدمين من مشاركة التقارير أو حفظها خارجياً
- **Trigger**: النقر على زر "تصدير"
- **Progression**: اختيار تصدير → توليد الملف → تحميل الملف
- **Success criteria**: ملف منسق جيداً يحتوي على جميع معلومات التقرير

## Edge Case Handling

- **Invalid Repository URL**: عرض رسالة خطأ واضحة مع اقتراحات لتصحيح الرابط
- **Private Repositories**: إعلام المستخدم بأن المستودعات الخاصة غير مدعومة (أو طلب توكن الوصول في المستقبل)
- **Empty Repository**: توليد تقرير يشير إلى عدم وجود ملفات كافية للتحليل
- **Network Errors**: عرض رسالة خطأ مع خيار إعادة المحاولة
- **LLM API Failure**: عرض رسالة خطأ واضحة وحفظ حالة الطلب لإعادة المحاولة
- **Non-TypeScript/Python Projects**: تحذير المستخدم من أن التحليل مخصص لمشاريع TypeScript/Python

## Design Direction

التصميم يجب أن يعكس الاحترافية والجدية مع لمسة عصرية. استخدام ألوان تقنية هادئة مع تركيز على الوضوح والقراءة السهلة للنصوص العربية. التصميم يجب أن يكون نظيفاً وخالياً من التشتيت مع التركيز على المحتوى والبيانات.

## Color Selection

نظام ألوان تقني محترف مع لمسات من الألوان الدافئة:

- **Primary Color**: oklch(0.45 0.15 240) - أزرق داكن محترف يعكس الثقة والتقنية
- **Secondary Colors**: 
  - oklch(0.35 0.12 245) - أزرق أغمق للعناصر الثانوية
  - oklch(0.92 0.02 240) - أزرق فاتح جداً للخلفيات
- **Accent Color**: oklch(0.65 0.18 30) - برتقالي ذهبي للتحذيرات والنقاط المهمة (CTAs)
- **Foreground/Background Pairings**:
  - Background (Off-White #F8F9FB oklch(0.98 0.01 240)): Dark Text (oklch(0.25 0.02 240)) - Ratio 14.2:1 ✓
  - Primary (Deep Blue oklch(0.45 0.15 240)): White (oklch(1 0 0)) - Ratio 8.5:1 ✓
  - Accent (Warm Orange oklch(0.65 0.18 30)): White (oklch(1 0 0)) - Ratio 4.9:1 ✓
  - Card (White oklch(1 0 0)): Dark Text (oklch(0.25 0.02 240)) - Ratio 15.8:1 ✓

## Font Selection

الخطوط يجب أن تكون واضحة ومقروءة للغة العربية مع طابع تقني احترافي:

- **Arabic**: Cairo أو Tajawal - خطوط عربية عصرية واضحة
- **Latin/Code**: JetBrains Mono - لعرض روابط المستودعات والتفاصيل التقنية

- **Typographic Hierarchy**:
  - H1 (عنوان التطبيق): Cairo Bold / 32px / tight letter spacing / mb-2
  - H2 (عناوين الأقسام الرئيسية): Cairo SemiBold / 24px / normal spacing / mb-4
  - H3 (عناوين المجالات): Cairo SemiBold / 20px / normal spacing / mb-3
  - Body (النصوص الأساسية): Cairo Regular / 16px / line-height 1.7 / mb-4
  - Small (تفاصيل التاريخ): Cairo Regular / 14px / opacity 0.7
  - Code/URLs: JetBrains Mono / 14px / monospace

## Animations

الحركات يجب أن تكون هادئة ومهنية مع التركيز على تحسين تجربة المستخدم:

- **Loading States**: رسوم متحركة لطيفة عند التحليل (spinner أو progress indicator) لإعلام المستخدم بالتقدم
- **Report Sections**: fade-in تدريجي للأقسام عند ظهور التقرير
- **Transitions**: حركات ناعمة عند التنقل بين الحالات (idle → analyzing → results)
- **Hover States**: تحول لوني خفيف على الأزرار والعناصر التفاعلية
- **Success Indicators**: رسوم متحركة بسيطة عند اكتمال التحليل بنجاح

## Component Selection

- **Components**:
  - Input + Label: لحقل إدخال رابط المستودع مع validation
  - Button: للأزرار الرئيسية (تحليل، تصدير، تحليل جديد)
  - Card: لعرض التقارير والأقسام المختلفة
  - Badge: لعرض حالة الجاهزية (جاهز/جاهز بشروط/غير جاهز)
  - Separator: لفصل الأقسام
  - ScrollArea: لعرض التقارير الطويلة
  - Alert: لعرض رسائل الأخطاء والتحذيرات
  - Skeleton: لحالات التحميل
  - Accordion: لتنظيم الأقسام المختلفة من التقرير
  
- **Customizations**:
  - نمط خاص للـ Cards مع ظل خفيف وحدود ناعمة
  - Badges ملونة حسب الحالة (أخضر للجاهز، أصفر للمشروط، أحمر لغير الجاهز)
  - Custom RTL layout للنصوص العربية
  
- **States**:
  - Buttons: حالة عادية، hover (مع تغير لوني خفيف)، active (مضغوط)، disabled (شفافية منخفضة)، loading (مع spinner)
  - Input: default، focused (مع ring)، error (حدود حمراء)، success (حدود خضراء)
  
- **Icon Selection**:
  - GitBranch أو GithubLogo: لرمز المستودع
  - MagnifyingGlass أو ChartBar: لرمز التحليل
  - CheckCircle: للنجاح
  - Warning: للتحذيرات
  - XCircle: للأخطاء
  - DownloadSimple: للتصدير
  - ClockCounterClockwise: للتاريخ
  
- **Spacing**:
  - Container padding: px-6 py-8
  - Section gaps: gap-6
  - Card padding: p-6
  - Button padding: px-6 py-3
  - Margins بين العناصر: mb-4, mb-6, mb-8
  
- **Mobile**:
  - Stack layout عمودي للنماذج والمحتوى
  - تصغير الخطوط بشكل تناسبي
  - أزرار بعرض كامل على الشاشات الصغيرة
  - تقليل padding على الشاشات الصغيرة
  - Accordion مفتوحة افتراضياً على desktop، مغلقة على mobile لتوفير المساحة
