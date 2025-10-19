// Performance optimization settings for Modern Log Viewer

// Enable React Strict Mode optimizations
export const PERFORMANCE_CONFIG = {
  // Virtual scrolling settings
  VIRTUAL_SCROLL_ITEM_HEIGHT: 100,
  VIRTUAL_SCROLL_OVERSCAN: 5,
  
  // Debounce delays (ms)
  SEARCH_DEBOUNCE_DELAY: 300,
  FILTER_DEBOUNCE_DELAY: 150,
  
  // Pagination settings
  INITIAL_LOAD_SIZE: 100,
  LOAD_MORE_SIZE: 50,
  
  // Memory management
  MAX_ENTRIES_IN_MEMORY: 10000,
  CLEANUP_INTERVAL: 60000, // 1 minute
  
  // Component optimization
  ENABLE_MEMO: true,
  ENABLE_CALLBACK_OPTIMIZATION: true,
  
  // Bundle optimization
  LAZY_LOAD_COMPONENTS: true,
  
  // Analytics
  ENABLE_PERFORMANCE_MONITORING: false
}

// Simple performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new PerformanceMonitor()
    }
    return this.instance
  }
  
  startMeasure(name: string) {
    this.metrics.set(name, performance.now())
  }
  
  endMeasure(name: string): number {
    const start = this.metrics.get(name)
    if (!start) return 0
    
    const duration = performance.now() - start
    this.metrics.delete(name)
    
    if (PERFORMANCE_CONFIG.ENABLE_PERFORMANCE_MONITORING) {
      console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`)
    }
    
    return duration
  }
  
  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasure(name)
    return fn().finally(() => this.endMeasure(name))
  }
  
  measure<T>(name: string, fn: () => T): T {
    this.startMeasure(name)
    try {
      return fn()
    } finally {
      this.endMeasure(name)
    }
  }
}

// Memory management utilities
export class MemoryManager {
  private static cleanupCallbacks: (() => void)[] = []
  
  static addCleanupCallback(callback: () => void) {
    this.cleanupCallbacks.push(callback)
  }
  
  static cleanup() {
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.warn('Cleanup callback failed:', error)
      }
    })
  }
  
  static startCleanupInterval() {
    setInterval(() => {
      this.cleanup()
      
      // Force garbage collection if available (development only)
      if (typeof window !== 'undefined' && 'gc' in window) {
        (window as any).gc()
      }
    }, PERFORMANCE_CONFIG.CLEANUP_INTERVAL)
  }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  MemoryManager.startCleanupInterval()
}