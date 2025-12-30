import logger from './logger'
import * as Sentry from '@sentry/react'

/**
 * معالج الأخطاء العام للتطبيق
 * يرصد جميع الأخطاء غير المتوقعة في المتصفح ويسجلها
 * Integrates with Sentry for production error tracking
 */
export function setupGlobalErrorHandler(): void {
  // معالج الأخطاء العامة (JavaScript errors)
  window.addEventListener('error', (event: ErrorEvent) => {
    const errorContext = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.toString(),
      stack: event.error?.stack,
    }

    logger.error('Uncaught Error', errorContext)

    // Send to Sentry if initialized
    if (event.error) {
      Sentry.captureException(event.error, {
        level: 'error',
        extra: errorContext,
      })
    }

    // منع السلوك الافتراضي للمتصفح
    event.preventDefault()
  })

  // معالج الأخطاء في Promises غير المعالجة
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const errorContext = {
      reason: event.reason,
      promise: event.promise,
      stack: event.reason?.stack,
    }

    logger.error('Unhandled Promise Rejection', errorContext)

    // Send to Sentry
    Sentry.captureException(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      {
        level: 'error',
        extra: errorContext,
      }
    )

    event.preventDefault()
  })

  // معالج أخطاء تحميل الموارد (Resource loading errors)
  window.addEventListener('error', (event: Event) => {
    const target = event.target as HTMLElement

    if (target && target.tagName) {
      const tagName = target.tagName.toLowerCase()

      if (tagName === 'img' || tagName === 'script' || tagName === 'link') {
        const context = {
          tagName,
          src: (target as any).src || (target as any).href,
          currentSrc: (target as any).currentSrc,
        }
        logger.warn('Resource Loading Error', context)

        // Send to Sentry as a breadcrumb (not an exception, as these are less critical)
        Sentry.addBreadcrumb({
          category: 'resource',
          message: `Failed to load ${tagName}`,
          level: 'warning',
          data: context,
        })
      }
    }
  }, true) // استخدام capture phase للحصول على أخطاء الموارد

  // معالج أخطاء الشبكة (Network errors)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming

            // استبعاد fetch/XHR requests لأنها تُرصد خطأً بسبب CORS
            // نركز فقط على الموارد الثابتة (صور، scripts، CSS)
            const isStaticResource = ['img', 'script', 'link', 'css'].includes(resourceEntry.initiatorType)

            // رصد الموارد الفاشلة فقط للموارد الثابتة
            if (isStaticResource && resourceEntry.transferSize === 0 && resourceEntry.decodedBodySize === 0) {
              const context = {
                name: resourceEntry.name,
                duration: resourceEntry.duration,
                initiatorType: resourceEntry.initiatorType,
              }
              logger.warn('Static Resource Failed', context)

              // Send to Sentry as a breadcrumb
              Sentry.addBreadcrumb({
                category: 'resource',
                message: `Static resource failed: ${resourceEntry.initiatorType}`,
                level: 'warning',
                data: context,
              })
            }
          }
        }
      })

      observer.observe({ entryTypes: ['resource'] })
    } catch (err) {
      console.warn('PerformanceObserver not supported:', err)
    }
  }

  // تسجيل معلومات المتصفح عند بدء التطبيق
  const startupContext = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    url: window.location.href,
  }

  logger.info('Application Started', startupContext)

  // Send startup context to Sentry
  Sentry.setContext('application', {
    ...startupContext,
    timestamp: new Date().toISOString(),
  })
}
