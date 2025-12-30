import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnalysisForm } from '../AnalysisForm'
import { vi } from 'vitest'

const mockOnSubmit = vi.fn()

describe('AnalysisForm', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('renders form elements correctly', () => {
    render(<AnalysisForm onSubmit={mockOnSubmit} isLoading={false} />)
    
    expect(screen.getByLabelText(/رابط المستودع/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /تحليل/i })).toBeInTheDocument()
  })

  it('validates empty input', async () => {
    const user = userEvent.setup()
    render(<AnalysisForm onSubmit={mockOnSubmit} isLoading={false} />)
    
    const submitButton = screen.getByRole('button', { name: /تحليل/i })
    await user.click(submitButton)
    
    expect(screen.getByText(/الرجاء إدخال رابط المستودع/i)).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates invalid GitHub URL', async () => {
    const user = userEvent.setup()
    render(<AnalysisForm onSubmit={mockOnSubmit} isLoading={false} />)
    
    const input = screen.getByLabelText(/رابط مستودع GitHub/i)
    const submitButton = screen.getByRole('button', { name: /تحليل/i })
    
    await user.type(input, 'invalid-url')
    await user.click(submitButton)
    
    expect(screen.getByText(/الرجاء إدخال رابط المستودع/i)).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('accepts valid GitHub URL', async () => {
    const user = userEvent.setup()
    render(<AnalysisForm onSubmit={mockOnSubmit} isLoading={false} />)
    
    const input = screen.getByLabelText(/رابط مستودع GitHub/i)
    const submitButton = screen.getByRole('button', { name: /تحليل/i })
    
    await user.type(input, 'https://github.com/user/repo')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('https://github.com/user/repo')
    })
  })

  it('disables button when loading', () => {
    render(<AnalysisForm onSubmit={mockOnSubmit} isLoading={true} />)
    
    const submitButton = screen.getByRole('button', { name: /تحليل/i })
    expect(submitButton).toBeDisabled()
  })
})
