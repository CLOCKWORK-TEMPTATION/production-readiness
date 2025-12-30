/**
 * Production Readiness Analyzer
 *
 * This module handles repository analysis and production report generation
 * by calling the backend proxy server which communicates with Google Gemini API.
 *
 * Based on official Gemini API documentation:
 * https://ai.google.dev/api/generate-content
 */

import { ProductionReport, ReadinessStatus } from '@/types/report'
import { fetchRepositoryInfo, fetchRepositoryContents, fetchFileContent } from './github'
import logger from './logger'

// API base URL configuration
// In development with Vite proxy, use empty string for relative URLs
// In production, use the configured backend URL
const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
const API_BASE_URL = isTest
  ? 'http://test-proxy:3001'  // Mock URL for testing
  : import.meta.env.DEV
    ? ''  // Use Vite proxy in development (relative path)
    : (import.meta.env.VITE_API_URL || '')

/**
 * Repository analysis data structure
 */
interface RepoAnalysisData {
  hasPackageJson: boolean
  hasRequirementsTxt: boolean
  hasPyprojectToml: boolean
  hasDockerfile: boolean
  hasTests: boolean
  hasCI: boolean
  hasReadme: boolean
  hasGitignore: boolean
  languages: string[]
  fileStructure: string[]
  packageJsonContent?: string
  readmeContent?: string
  requirementsContent?: string
}

/**
 * Analyzes a GitHub repository and extracts key information
 * @param owner - Repository owner (user or organization)
 * @param repo - Repository name
 * @returns Analysis data containing repository structure and metadata
 */
export async function analyzeRepository(owner: string, repo: string): Promise<RepoAnalysisData> {
  const data: RepoAnalysisData = {
    hasPackageJson: false,
    hasRequirementsTxt: false,
    hasPyprojectToml: false,
    hasDockerfile: false,
    hasTests: false,
    hasCI: false,
    hasReadme: false,
    hasGitignore: false,
    languages: [],
    fileStructure: []
  }

  try {
    // Fetch basic repository information
    const repoInfo = await fetchRepositoryInfo(owner, repo)
    if (repoInfo.language) {
      data.languages.push(repoInfo.language)
    }

    // Fetch repository root contents
    const contents = await fetchRepositoryContents(owner, repo)

    if (Array.isArray(contents)) {
      for (const item of contents) {
        data.fileStructure.push(item.name)

        // Check for common project files
        if (item.name === 'package.json') {
          data.hasPackageJson = true
          const content = await fetchFileContent(owner, repo, 'package.json')
          if (content) data.packageJsonContent = content
        }
        if (item.name === 'requirements.txt') {
          data.hasRequirementsTxt = true
          const content = await fetchFileContent(owner, repo, 'requirements.txt')
          if (content) data.requirementsContent = content
        }
        if (item.name === 'pyproject.toml') data.hasPyprojectToml = true
        if (item.name === 'Dockerfile') data.hasDockerfile = true
        if (item.name.toLowerCase().includes('readme')) {
          data.hasReadme = true
          const content = await fetchFileContent(owner, repo, item.name)
          if (content) data.readmeContent = content
        }
        if (item.name === '.gitignore') data.hasGitignore = true
        if (item.type === 'dir' && (item.name === 'test' || item.name === 'tests' || item.name === '__tests__')) {
          data.hasTests = true
        }
        if (item.type === 'dir' && item.name === '.github') {
          data.hasCI = true
        }
      }
    }
  } catch (error) {
    logger.error('Error analyzing repository:', error)
  }

  return data
}

/**
 * Calls the backend proxy server to generate the production readiness report
 *
 * Based on Gemini REST API specification:
 * - Endpoint: POST /api/analyze
 * - Request: { owner, repo, analysisData }
 * - Response: { success: true, data: reportData }
 *
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param analysisData - Repository analysis data
 * @returns Generated report data from Gemini API
 */
async function callProxyAnalysis(owner: string, repo: string, analysisData: RepoAnalysisData): Promise<any> {
  // Use relative path which works with Vite proxy in dev and Nginx in prod
  const endpoint = `${API_BASE_URL}/api/analyze`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ owner, repo, analysisData }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
  }

  const result = await response.json()
  return result.data
}

/**
 * Generates a comprehensive production readiness report for a GitHub repository
 *
 * This function orchestrates the entire analysis process:
 * 1. Analyzes the repository structure
 * 2. Calls the backend proxy (which communicates with Gemini API)
 * 3. Returns a structured production report
 *
 * @param owner - Repository owner (user or organization)
 * @param repo - Repository name
 * @param url - Full GitHub repository URL
 * @returns Complete production readiness report
 */
export async function generateProductionReport(
  owner: string,
  repo: string,
  url: string
): Promise<ProductionReport> {
  const analyzedAt = new Date().toISOString()
  const analysisData = await analyzeRepository(owner, repo)

  try {
    const reportData = await callProxyAnalysis(owner, repo, analysisData)

    const report: ProductionReport = {
      id: `report-${Date.now()}`,
      repository: {
        url,
        owner,
        repo,
        analyzedAt
      },
      summary: reportData.summary || 'لم يتم توفير ملخص',
      overallStatus: reportData.overallStatus as ReadinessStatus || 'unknown',
      domains: reportData.domains || [],
      criticalIssues: reportData.criticalIssues || [],
      recommendations: reportData.recommendations || [],
      conclusion: reportData.conclusion || 'لم يتم التوصل إلى خلاصة',
      createdAt: analyzedAt
    }

    return report
  } catch (error) {
    logger.error('Error generating report:', error)

    // Return a fallback report with error information
    return {
      id: `report-${Date.now()}`,
      repository: {
        url,
        owner,
        repo,
        analyzedAt
      },
      summary: 'حدث خطأ أثناء تحليل المستودع',
      overallStatus: 'unknown',
      domains: [],
      criticalIssues: ['فشل في توليد التقرير بسبب خطأ في الخدمة'],
      recommendations: ['يرجى المحاولة مرة أخرى لاحقاً'],
      conclusion: 'لم يتم إكمال التحليل بنجاح',
      createdAt: analyzedAt
    }
  }
}
