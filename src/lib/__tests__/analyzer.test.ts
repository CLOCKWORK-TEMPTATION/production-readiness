import { generateProductionReport } from '../analyzer'
import { vi, beforeEach } from 'vitest'

// Mock fetch to simulate proxy server responses
global.fetch = vi.fn()

// Mock API_BASE_URL for test environment
const originalEnv = import.meta.env
vi.stubGlobal('import', {
  meta: {
    ...originalEnv,
    DEV: false,
    VITE_API_URL: 'http://test-proxy:3001'
  }
})

describe('analyzer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('generates production report successfully', async () => {
    // Mock GitHub API responses
    vi.mocked(fetch).mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('api.github.com')) {
        // GitHub API response - repository info
        return Promise.resolve({
          ok: true,
          json: async () => ({
            language: 'TypeScript',
            default_branch: 'main'
          })
        } as Response)
      } else if (typeof url === 'string' && url.includes('/api/analyze')) {
        // Proxy server response - analysis result
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              summary: 'Test summary',
              overallStatus: 'ready',
              domains: [],
              criticalIssues: [],
              recommendations: [],
              conclusion: 'Test conclusion'
            }
          })
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      } as Response)
    })

    const result = await generateProductionReport('test', 'repo', 'https://github.com/test/repo')

    expect(result).toBeDefined()
    expect(result.summary).toBe('Test summary')
    expect(result.overallStatus).toBe('ready')
  })

  it('handles analysis errors gracefully', async () => {
    // Mock GitHub API to succeed but proxy server to fail
    vi.mocked(fetch).mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('api.github.com')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            language: 'TypeScript'
          })
        } as Response)
      } else if (typeof url === 'string' && url.includes('/api/analyze')) {
        // Proxy server error
        return Promise.resolve({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Internal server error' })
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      } as Response)
    })

    const result = await generateProductionReport('test', 'repo', 'https://github.com/test/repo')

    // Should return fallback report instead of throwing
    expect(result).toBeDefined()
    expect(result.overallStatus).toBe('unknown')
    expect(result.summary).toBe('حدث خطأ أثناء تحليل المستودع')
  })

  it('handles GitHub API errors', async () => {
    // Mock GitHub API to fail
    vi.mocked(fetch).mockImplementation(() => {
      return Promise.resolve({
        ok: false,
        status: 404
      } as Response)
    })

    const result = await generateProductionReport('nonexistent', 'repo', 'https://github.com/nonexistent/repo')

    // Should still return a report with fallback data
    expect(result).toBeDefined()
    expect(result.overallStatus).toBe('unknown')
  })
})
