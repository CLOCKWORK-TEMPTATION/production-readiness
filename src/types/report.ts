export type ReadinessStatus = 'ready' | 'conditional' | 'not-ready' | 'unknown'

export interface RepositoryInfo {
  url: string
  owner: string
  repo: string
  analyzedAt: string
}

export interface DomainAssessment {
  title: string
  status: ReadinessStatus
  description: string
  findings: string[]
  recommendations: string[]
}

export interface ProductionReport {
  id: string
  repository: RepositoryInfo
  summary: string
  overallStatus: ReadinessStatus
  domains: DomainAssessment[]
  criticalIssues: string[]
  recommendations: string[]
  conclusion: string
  createdAt: string
}
