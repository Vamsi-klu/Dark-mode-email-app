import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AIPanel } from 'src/components/ai/AIPanel'

describe('AIPanel', () => {
  it('renders and shows overview and points', () => {
    render(<AIPanel open={true} onClose={() => {}} />)
    expect(screen.getByText(/AI Overview/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Overview/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Key Points/i)).toBeInTheDocument()
  })

  it('updates output when input changes', () => {
    render(<AIPanel open={true} onClose={() => {}} />)
    const textarea = screen.getByPlaceholderText(/Ask for an overview/i)
    fireEvent.change(textarea, { target: { value: 'Plan the sprint and identify risks.' } })
    expect(screen.getByText(/Overall context appears/i)).toBeInTheDocument()
  })
})
