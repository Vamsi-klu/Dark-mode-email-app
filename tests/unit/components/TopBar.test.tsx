import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TopBar } from 'src/components/TopBar'

describe('TopBar', () => {
  it('updates query on input', () => {
    const onChange = vi.fn()
    render(<TopBar query="" onQueryChange={onChange} />)
    const input = screen.getByPlaceholderText(/Search mail/i)
    fireEvent.change(input, { target: { value: 'hello' } })
    expect(onChange).toHaveBeenCalledWith('hello')
  })
})

