import { useEffect } from 'react'
import { useLogStore } from '@/stores/logStore'

interface KeyboardShortcutHandlers {
  onSearch?: () => void
  onToggleBookmark?: () => void
  onExport?: () => void
  onResetFilters?: () => void
  onEscape?: () => void
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers = {}) {
  const { toggleDarkMode, resetFilters } = useLogStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Only allow Escape key in inputs
        if (event.key === 'Escape' && handlers.onEscape) {
          handlers.onEscape()
        }
        return
      }

      // Ctrl/Cmd + K: Search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        if (handlers.onSearch) {
          handlers.onSearch()
        }
      }

      // Ctrl/Cmd + D: Toggle dark mode
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault()
        toggleDarkMode()
      }

      // Ctrl/Cmd + B: Toggle bookmark
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault()
        if (handlers.onToggleBookmark) {
          handlers.onToggleBookmark()
        }
      }

      // Ctrl/Cmd + E: Export
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault()
        if (handlers.onExport) {
          handlers.onExport()
        }
      }

      // Ctrl/Cmd + R: Reset filters
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault()
        resetFilters()
      }

      // Escape: Close modals
      if (event.key === 'Escape' && handlers.onEscape) {
        handlers.onEscape()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers, toggleDarkMode, resetFilters])
}
