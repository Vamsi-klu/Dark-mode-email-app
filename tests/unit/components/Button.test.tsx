import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from 'src/components/common/Button'

describe('Button', () => {
  it('renders primary variant by default', () => {
    render(<Button>Go</Button>)
    const btn = screen.getByText('Go')
    expect(btn).toBeInTheDocument()
  })

  it('renders ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByText('Ghost')).toBeInTheDocument()
  })
})

