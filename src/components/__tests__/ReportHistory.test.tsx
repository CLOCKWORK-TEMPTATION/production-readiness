import { render, screen, fireEvent } from '@testing-library/react'
import { ReportHistory } from '../ReportHistory'
import { ProductionReport } from '@/types/report'
import { vi } from 'vitest'

// Mock the report data
const mockReports: ProductionReport[] = [
  {
    id: '1',
    repository: {
      url: 'https://github.com/test/repo',
      owner: 'test',
      repo: 'repo',
      analyzedAt: '2025-01-01'
    },
    summary: 'Test summary',
    overallStatus: 'ready',
    domains: [],
    criticalIssues: [],
    recommendations: [],
    conclusion: 'Test conclusion',
    createdAt: '2025-01-01'
  }
]

describe('ReportHistory', () => {
  it('renders report history list', () => {
    render(<ReportHistory reports={mockReports} onSelectReport={() => {}} onDeleteReport={() => {}} />)
    
    expect(screen.getByText('التقارير السابقة')).toBeInTheDocument()
    expect(screen.getByText('test/repo')).toBeInTheDocument()
  })

  it('calls onSelectReport when report is clicked', () => {
    const mockOnSelectReport = vi.fn()
    render(<ReportHistory reports={mockReports} onSelectReport={mockOnSelectReport} onDeleteReport={() => {}} />)
    
    const reportItem = screen.getByText('test/repo')
    fireEvent.click(reportItem)
    
    expect(mockOnSelectReport).toHaveBeenCalledWith(mockReports[0])
  })

  it('calls onDeleteReport when delete button is clicked', () => {
    const mockOnDeleteReport = vi.fn()
    render(<ReportHistory reports={mockReports} onSelectReport={() => {}} onDeleteReport={mockOnDeleteReport} />)
    
    const deleteButton = screen.getByRole('button')
    fireEvent.click(deleteButton)
    
    expect(mockOnDeleteReport).toHaveBeenCalledWith('1')
  })

  it('shows empty state when no reports', () => {
    render(<ReportHistory reports={[]} onSelectReport={() => {}} onDeleteReport={() => {}} />)
    
    expect(screen.queryByText('التقارير السابقة')).not.toBeInTheDocument()
  })
})
