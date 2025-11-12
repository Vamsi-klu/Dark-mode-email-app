import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  debounce,
  debounceLeading,
  throttle,
  createCancellableDebounce
} from 'src/lib/debounce'

describe('debounce utility', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('debounce', () => {
    it('delays function execution', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      debounced()
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('resets timer on subsequent calls', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      debounced()
      vi.advanceTimersByTime(50)
      debounced()
      vi.advanceTimersByTime(50)
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('passes arguments correctly', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      debounced('arg1', 'arg2')
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('uses latest arguments', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      debounced('first')
      debounced('second')
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledWith('second')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('handles multiple invocations after wait', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      debounced()
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)

      debounced()
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('debounceLeading', () => {
    it('executes immediately on first call', () => {
      const fn = vi.fn()
      const debounced = debounceLeading(fn, 100)

      debounced()
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('debounces subsequent calls within wait period', () => {
      const fn = vi.fn()
      const debounced = debounceLeading(fn, 100)

      debounced()
      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(50)
      debounced()
      expect(fn).toHaveBeenCalledTimes(1) // Still only 1

      vi.advanceTimersByTime(100)
      debounced()
      expect(fn).toHaveBeenCalledTimes(2) // Now 2
    })

    it('resets after wait period', () => {
      const fn = vi.fn()
      const debounced = debounceLeading(fn, 100)

      debounced()
      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(150)
      debounced()
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('throttle', () => {
    it('executes immediately on first call', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)

      throttled()
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('limits execution to once per wait period', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)

      throttled()
      throttled()
      throttled()
      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(2) // Trailing call
    })

    it('allows execution after wait period', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)

      throttled()
      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      throttled()
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('passes latest arguments to trailing call', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)

      throttled('first')
      throttled('second')
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenLastCalledWith('second')
    })
  })

  describe('createCancellableDebounce', () => {
    it('creates debounced function', () => {
      const fn = vi.fn()
      const { debounced } = createCancellableDebounce(fn, 100)

      debounced()
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('cancels pending execution', () => {
      const fn = vi.fn()
      const { debounced, cancel } = createCancellableDebounce(fn, 100)

      debounced()
      cancel()
      vi.advanceTimersByTime(100)
      expect(fn).not.toHaveBeenCalled()
    })

    it('flushes pending execution immediately', () => {
      const fn = vi.fn()
      const { debounced, flush } = createCancellableDebounce(fn, 100)

      debounced()
      flush()
      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1) // Still only 1
    })

    it('handles multiple cancel calls', () => {
      const fn = vi.fn()
      const { debounced, cancel } = createCancellableDebounce(fn, 100)

      debounced()
      cancel()
      cancel() // Second cancel should be safe
      vi.advanceTimersByTime(100)
      expect(fn).not.toHaveBeenCalled()
    })

    it('handles flush with no pending calls', () => {
      const fn = vi.fn()
      const { flush } = createCancellableDebounce(fn, 100)

      flush() // Should not throw
      expect(fn).not.toHaveBeenCalled()
    })

    it('uses latest arguments when flushed', () => {
      const fn = vi.fn()
      const { debounced, flush } = createCancellableDebounce(fn, 100)

      debounced('arg1')
      debounced('arg2')
      flush()
      expect(fn).toHaveBeenCalledWith('arg2')
    })
  })

  describe('edge cases', () => {
    it('handles zero wait time', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 0)

      debounced()
      vi.advanceTimersByTime(0)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('handles very long wait times', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 10000)

      debounced()
      vi.advanceTimersByTime(9999)
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('handles rapid successive calls', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      for (let i = 0; i < 100; i++) {
        debounced()
      }
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })
})
