import { useRef, useCallback } from 'react'

/**
 * Custom hook for debouncing function calls
 * Improves performance by limiting how often expensive operations are called
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedFunction = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        func(...args)
      }, delay)
    },
    [func, delay]
  ) as T

  return debouncedFunction
}

/**
 * Custom hook for throttling function calls
 * Ensures function is called at most once per interval
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  const lastRunRef = useRef<number>(0)

  const throttledFunction = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastRunRef.current >= limit) {
        lastRunRef.current = now
        func(...args)
      }
    },
    [func, limit]
  ) as T

  return throttledFunction
}