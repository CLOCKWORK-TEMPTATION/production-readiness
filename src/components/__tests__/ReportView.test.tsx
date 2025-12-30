import { render, screen } from '@testing-library/react'
import { ReportView } from '../ReportView'
import { ProductionReport } from '@/types/report'

const mockReport: ProductionReport = {
  id: '1',
  repository: {
    url: 'https://github.com/test/repo',
    owner: 'test',
    repo: 'repo',
    analyzedAt: '2025-01-01'
  },
  summary: 'Test summary',
  overallStatus: 'ready',
  domains: [
    {
      title: 'Code Quality',
      status: 'ready',
      description: 'Code quality assessment',
      findings: ['No issues found'],
      recommendations: ['Keep up the good work']
    }
  ],
  criticalIssues: [],
  recommendations: [],
  conclusion: 'Test conclusion',
  createdAt: '2025-01-01'
}

describe('ReportView', () => {
  it('renders report details', () => {
    render(<ReportView report={mockReport} />)
    
    expect(screen.getByText('تقرير جاهزية الإنتاج')).toBeInTheDocument()
    expect(screen.getByText('test/repo')).toBeInTheDocument()
    expect(screen.getByText('Test summary')).toBeInTheDocument()
  })

  it('renders domain assessments', () => {
    render(<ReportView report={mockReport} />)
    
    expect(screen.getByText('Code Quality')).toBeInTheDocument()
    expect(screen.getByText('Code quality assessment')).toBeInTheDocument()
  })
})
