import { render, screen } from '@testing-library/react'
import { expect, describe, it } from 'vitest'
import { StatusBadge } from '../StatusBadge'

describe('StatusBadge', () => {
  it('renders with ready status and correct label', () => {
    render(<StatusBadge status="ready" />)
    
    const badge = screen.getByText('جاهز')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-success')
  })

  it('renders with conditional status and correct label', () => {
    render(<StatusBadge status="conditional" />)
    
    const badge = screen.getByText('جاهز بشروط')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-warning')
  })

  it('renders with not-ready status and correct label', () => {
    render(<StatusBadge status="not-ready" />)
    
    const badge = screen.getByText('غير جاهز')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-destructive')
  })

  it('renders with unknown status and correct label', () => {
    render(<StatusBadge status="unknown" />)
    
    const badge = screen.getByText('غير معروف')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-muted')
  })
})