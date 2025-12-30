import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { setupGlobalErrorHandler } from './lib/global-error-handler'
import { initSentry, SentryBoundary } from './lib/sentry'
import { addMobileViewportMeta } from './utils/mobile-compatibility'
import { useAccessibility, checkMobileAccessibility } from './utils/accessibility'

import "./main.css"
import "./styles/theme.css"
import "./styles/mobile.css"
import "./index.css"

// تهيئة Sentry أولاً قبل أي شيء آخر
initSentry()

// تعطيل console.log في الإنتاج
if (import.meta.env.PROD) {
  console.log = () => {}
  console.debug = () => {}
  console.info = () => {}
  console.warn = () => {}
}

// تفعيل نظام رصد الأخطاء العام
setupGlobalErrorHandler()

// إعداد التوافق مع الأجهزة المحمولة
addMobileViewportMeta()

// فحص إمكانية الوصول بعد التحميل
if (process.env.NODE_ENV !== 'production') {
  import('@axe-core/react').then(axe => {
    axe.default(import('react'), import('react-dom'), 1000)
  })
  setTimeout(() => checkMobileAccessibility(), 1000)
}

createRoot(document.getElementById('root')!).render(
  <SentryBoundary fallback={ErrorFallback}>
    <App />
    <Toaster position="top-center" richColors dir="rtl" />
   </SentryBoundary>
)
