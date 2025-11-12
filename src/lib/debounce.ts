// Debounce utility for performance optimization

/**
 * Debounce function - delays execution until after wait time has elapsed
 * since the last time it was invoked
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function debounced(...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, wait)
  }
}

/**
 * Debounce with leading edge execution
 * Executes immediately on first call, then debounces subsequent calls
 */
export function debounceLeading<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastCallTime: number | null = null

  return function debounced(...args: Parameters<T>) {
    const now = Date.now()

    if (lastCallTime === null || now - lastCallTime >= wait) {
      // Execute immediately if first call or enough time has passed
      func(...args)
      lastCallTime = now
    }

    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      lastCallTime = null
      timeoutId = null
    }, wait)
  }
}

/**
 * Throttle function - ensures function is called at most once per wait period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastCallTime: number | null = null
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function throttled(...args: Parameters<T>) {
    const now = Date.now()

    if (lastCallTime === null || now - lastCallTime >= wait) {
      func(...args)
      lastCallTime = now
    } else {
      // Schedule a call at the end of the wait period
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        func(...args)
        lastCallTime = Date.now()
        timeoutId = null
      }, wait - (now - lastCallTime))
    }
  }
}

/**
 * Cancel any pending debounced function calls
 */
export function createCancellableDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): {
  debounced: (...args: Parameters<T>) => void
  cancel: () => void
  flush: () => void
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null

  const cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
      lastArgs = null
    }
  }

  const flush = () => {
    if (timeoutId !== null && lastArgs !== null) {
      clearTimeout(timeoutId)
      func(...lastArgs)
      timeoutId = null
      lastArgs = null
    }
  }

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args

    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      if (lastArgs !== null) {
        func(...lastArgs)
      }
      timeoutId = null
      lastArgs = null
    }, wait)
  }

  return { debounced, cancel, flush }
}
