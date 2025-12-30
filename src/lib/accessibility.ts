/**
 * Accessibility Testing Utilities
 * Uses axe-core for automated accessibility testing
 */

import axios from 'axios'

export interface AxeResult {
  violations: AxeViolation[]
  passes: AxePass[]
  incomplete: AxeIncomplete[]
  url: string
  timestamp: string
}

export interface AxeViolation {
  id: string
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  description: string
  help: string
  helpUrl: string
  nodes: AxeNode[]
}

export interface AxePass {
  id: string
  description: string
  impact: null
  nodes: AxeNode[]
}

export interface AxeIncomplete {
  id: string
  description: string
  impact: null
  nodes: AxeNode[]
}

export interface AxeNode {
  html: string
  target: string[] | null
  failureSummary?: string
}

export interface AccessibilityReport {
  score: number
  critical: number
  serious: number
  moderate: number
  minor: number
  total: number
  violations: AxeViolation['id'][]
}

/**
 * Run accessibility audit using axe-core
 * Requires the page to be loaded with axe-core library
 */
export async function runAccessibilityAudit(context?: string | Element[]): Promise<AxeResult> {
  // Check if axe is available
  if (typeof window === 'undefined' || !('axe' in window)) {
    throw new Error('axe-core is not loaded. Include the script tag or load it dynamically.')
  }

  const axe = (window as any).axe

  try {
    const results = await axe.run(context || document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      },
    })

    return {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Accessibility audit failed:', error)
    throw error
  }

  return {
    violations: [],
    passes: [],
    incomplete: [],
    url: window.location.href,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Calculate accessibility score based on violations
 */
export function calculateAccessibilityScore(results: AxeResult): AccessibilityReport {
  const weight = {
    critical: 10,
    serious: 5,
    moderate: 2,
    minor: 1,
  }

  let totalScore = 100
  const violationsByImpact: Record<string, number> = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  }

  results.violations.forEach((violation) => {
    const impact = violation.impact || 'minor'
    violationsByImpact[impact]++
    totalScore -= weight[impact] * violation.nodes.length
  })

  totalScore = Math.max(0, totalScore)

  return {
    score: Math.round((totalScore / 100) * 100),
    critical: violationsByImpact.critical,
    serious: violationsByImpact.serious,
    moderate: violationsByImpact.moderate,
    minor: violationsByImpact.minor,
    total: results.violations.length,
    violations: results.violations.map((v) => v.id),
  }
}

/**
 * Get human-readable accessibility report
 */
export function getAccessibilityReport(results: AxeResult): string {
  const report = calculateAccessibilityScore(results)

  let output = `=== Accessibility Report ===\n`
  output += `URL: ${results.url}\n`
  output += `Timestamp: ${results.timestamp}\n\n`

  output += `Score: ${report.score}/100\n\n`

  output += `Violations by Impact:\n`
  output += `  Critical: ${report.critical}\n`
  output += `  Serious: ${report.serious}\n`
  output += `  Moderate: ${report.moderate}\n`
  output += `  Minor: ${report.minor}\n`
  output += `  Total: ${report.total}\n\n`

  if (results.violations.length > 0) {
    output += `Violations:\n\n`
    results.violations.forEach((violation, index) => {
      output += `${index + 1}. ${violation.id} (${violation.impact?.toUpperCase()})\n`
      output += `   Description: ${violation.description}\n`
      output += `   Help: ${violation.help}\n`
      output += `   Help URL: ${violation.helpUrl}\n`
      output += `   Affected nodes: ${violation.nodes.length}\n\n`
    })
  }

  output += `\nPasses: ${results.passes.length}\n`

  return output
}

/**
 * Check if accessibility score meets minimum requirements
 */
export function checkAccessibilityRequirements(results: AxeResult): {
  passes: boolean
  report: AccessibilityReport
  failures: string[]
} {
  const report = calculateAccessibilityScore(results)
  const failures: string[] = []

  // Minimum requirements
  if (report.critical > 0) {
    failures.push('Critical accessibility issues found')
  }

  if (report.serious > 5) {
    failures.push('Too many serious accessibility issues (max 5 allowed)')
  }

  if (report.score < 80) {
    failures.push(`Accessibility score too low: ${report.score}/100 (minimum 80)`)
  }

  return {
    passes: failures.length === 0,
    report,
    failures,
  }
}

/**
 * Initialize axe-core dynamically (if not already loaded)
 */
export async function initializeAxe(): Promise<void> {
  if (typeof window === 'undefined') return

  if ('axe' in window) {
    console.log('axe-core already loaded')
    return
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js'
    script.integrity = 'sha512-ptrUjTLGMpcCw4SP4oHnmqvXPy0P5ZjKfZ7VQxUmMZGU/wK9HB1P9aL8S6/9BCeVqklvaGuO2N6SfP5YPLXJ+w=='
    script.crossOrigin = 'anonymous'
    script.onload = () => {
      console.log('axe-core loaded successfully')
      resolve()
    }
    script.onerror = () => {
      reject(new Error('Failed to load axe-core'))
    }
    document.head.appendChild(script)
  })
}

/**
 * Run accessibility check and log results
 */
export async function runAccessibilityCheck(context?: string | Element[]): Promise<void> {
  try {
    await initializeAxe()
    const results = await runAccessibilityAudit(context)
    const report = getAccessibilityReport(results)

    console.log(report)

    // Check requirements
    const check = checkAccessibilityRequirements(results)
    if (!check.passes) {
      console.warn('Accessibility requirements not met:', check.failures)
    }
  } catch (error) {
    console.error('Accessibility check failed:', error)
  }
}
