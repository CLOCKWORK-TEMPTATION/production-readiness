import logger from './logger'

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const cleanUrl = url.trim()
    
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+)/,
      /^([^\/]+)\/([^\/]+)$/,
    ]

    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern)
      if (match) {
        const owner = match[1]
        let repo = match[2]
        
        repo = repo.replace(/\.git$/, '')
        
        if (owner && repo && owner !== '' && repo !== '') {
          return { owner, repo }
        }
      }
    }

    return null
  } catch {
    logger.error('Error parsing GitHub URL:', url)
    return null
  }
}

export function isValidGitHubUrl(url: string): boolean {
  return parseGitHubUrl(url) !== null
}

function getGithubHeaders() {
  const token = import.meta.env.VITE_GITHUB_TOKEN
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  }
  if (token) {
    headers['Authorization'] = `token ${token}`
  }
  return headers
}

export async function fetchRepositoryInfo(owner: string, repo: string) {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: getGithubHeaders()
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('المستودع غير موجود أو خاص')
      }
      if (response.status === 403) {
        throw new Error('تم تجاوز حد الطلبات لـ GitHub API. يرجى الانتظار أو إضافة VITE_GITHUB_TOKEN')
      }
      throw new Error(`فشل في الوصول إلى المستودع: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    logger.error('Error fetching repository info:', error)
    throw error
  }
}

export async function fetchRepositoryContents(owner: string, repo: string, path: string = '') {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: getGithubHeaders()
    })
    
    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch {
    logger.error('Error fetching repository contents:', owner, repo, path)
    return null
  }
}

export async function fetchFileContent(owner: string, repo: string, path: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: getGithubHeaders()
    })
    
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    if (data.content) {
      // Decode Base64 content (GitHub returns base64 for file content)
      // Note: atob might fail for large files or binary data, but for text files it's usually fine.
      // For full UTF-8 support: decodeURIComponent(atob(data.content).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
      try {
        return decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))))
      } catch {
        return atob(data.content.replace(/\n/g, ''))
      }
    }
    
    return null
  } catch {
    logger.error('Error fetching file content:', owner, repo, path)
    return null
  }
}
