/**
 * Mobile Browser Compatibility Utilities
 * Verifies mobile browser support and provides compatibility information
 */

export interface BrowserInfo {
  name: string
  version: string
  os: string
  isMobile: boolean
  isSupported: boolean
  features: {
    touch: boolean
    geolocation: boolean
    webGL: boolean
    localStorage: boolean
    serviceWorker: boolean
    intersectionObserver: boolean
  }
}

export interface CompatibilityIssue {
  type: 'warning' | 'error'
  message: string
  browser: string
  recommendation: string
}

/**
 * Get detailed browser information
 */
export function getBrowserInfo(): BrowserInfo {
  const ua = navigator.userAgent
  let name = 'Unknown'
  let version = 'Unknown'
  let os = 'Unknown'
  let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)

  // Detect OS
  if (/Android/i.test(ua)) os = 'Android'
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS'
  else if (/Windows/i.test(ua)) os = 'Windows'
  else if (/Mac/i.test(ua)) os = 'macOS'
  else if (/Linux/i.test(ua)) os = 'Linux'

  // Detect browser
  if (/Chrome/i.test(ua) && !/Edge|OPR/i.test(ua)) {
    name = 'Chrome'
    version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown'
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    name = 'Safari'
    version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown'
  } else if (/Firefox/i.test(ua)) {
    name = 'Firefox'
    version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown'
  } else if (/Edge/i.test(ua)) {
    name = 'Edge'
    version = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown'
  } else if (/SamsungBrowser/i.test(ua)) {
    name = 'Samsung Internet'
    version = ua.match(/SamsungBrowser\/(\d+)/)?.[1] || 'Unknown'
  }

  // Check feature support
  const features = {
    touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    geolocation: 'geolocation' in navigator,
    webGL: !!(() => {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    })(),
    localStorage: (() => {
      try {
        const test = '__test__'
        localStorage.setItem(test, test)
        localStorage.removeItem(test)
        return true
      } catch {
        return false
      }
    })(),
    serviceWorker: 'serviceWorker' in navigator,
    intersectionObserver: 'IntersectionObserver' in window,
  }

  // Determine if browser is supported
  const isSupported = checkBrowserSupport(name, parseInt(version) || 0, os)

  return { name, version, os, isMobile, isSupported, features }
}

/**
 * Check if browser version meets minimum requirements
 */
function checkBrowserSupport(name: string, version: number, os: string): boolean {
  const minVersions: Record<string, number> = {
    Chrome: 90,
    Safari: 14,
    Firefox: 88,
    Edge: 90,
    'Samsung Internet': 14,
  }

  const minVersion = minVersions[name]
  if (!minVersion) return false

  // iOS Safari has different versioning
  if (name === 'Safari' && os === 'iOS') {
    return version >= 14
  }

  return version >= minVersion
}

/**
 * Check for compatibility issues
 */
export function checkCompatibility(): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = []
  const browser = getBrowserInfo()

  // Check if browser is supported
  if (!browser.isSupported) {
    issues.push({
      type: 'error',
      message: `Your browser (${browser.name} ${browser.version}) is not supported.`,
      browser: `${browser.name} ${browser.version}`,
      recommendation: 'Please update to the latest version of your browser.',
    })
  }

  // Check for missing critical features
  if (!browser.features.localStorage) {
    issues.push({
      type: 'error',
      message: 'Local storage is not available.',
      browser: browser.name,
      recommendation: 'Enable local storage or use a different browser.',
    })
  }

  if (!browser.features.webGL) {
    issues.push({
      type: 'warning',
      message: 'WebGL is not supported. Some visual features may not work.',
      browser: browser.name,
      recommendation: 'Update your browser or enable hardware acceleration.',
    })
  }

  // Mobile-specific checks
  if (browser.isMobile) {
    if (!browser.features.touch) {
      issues.push({
        type: 'warning',
        message: 'Touch support is not detected.',
        browser: browser.name,
        recommendation: 'This may affect mobile experience.',
      })
    }

    // Viewport check
    const viewportWidth = window.innerWidth
    if (viewportWidth < 320) {
      issues.push({
        type: 'warning',
        message: 'Screen width is smaller than recommended minimum (320px).',
        browser: browser.name,
        recommendation: 'Use a larger device or rotate to landscape mode.',
      })
    }
  }

  return issues
}

/**
 * Get compatibility report as a string
 */
export function getCompatibilityReport(): string {
  const browser = getBrowserInfo()
  const issues = checkCompatibility()

  let report = `Browser: ${browser.name} ${browser.version} (${browser.os})\n`
  report += `Mobile: ${browser.isMobile ? 'Yes' : 'No'}\n`
  report += `Supported: ${browser.isSupported ? 'Yes' : 'No'}\n\n`

  report += 'Features:\n'
  Object.entries(browser.features).forEach(([key, value]) => {
    report += `  ${key}: ${value ? '✓' : '✗'}\n`
  })

  if (issues.length > 0) {
    report += '\nIssues:\n'
    issues.forEach((issue, index) => {
      report += `  ${index + 1}. [${issue.type.toUpperCase()}] ${issue.message}\n`
      report += `     Recommendation: ${issue.recommendation}\n`
    })
  }

  return report
}

/**
 * Log compatibility info to console (for debugging)
 */
export function logCompatibilityInfo(): void {
  console.log('=== Mobile Browser Compatibility ===')
  console.log(getCompatibilityReport())
  console.log('===================================')
}
