import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Composer } from '../Composer'

describe('Composer', () => {
  it('opens and closes', () => {
    const onClose = vi.fn()
    render(<Composer open={true} onClose={onClose} />)
    expect(screen.getByText(/New message/i)).toBeInTheDocument()
    fireEvent.click(screen.getByTitle(/Close/i))
    expect(onClose).toHaveBeenCalled()
  })
})


