import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'

export interface LogEntry {
  id: string
  timestamp: Date
  level: 'DEBUG' | 'INFO' | 'NOTICE' | 'WARNING' | 'ERROR' | 'CRITICAL' | 'ALERT' | 'EMERGENCY'
  message: string
  context?: Record<string, unknown>
  extra?: Record<string, unknown>
  channel?: string
  environment?: string
  sourceFile?: string
  lineNumber?: number
  isBookmarked?: boolean
}

export interface LogFile {
  id: string
  name: string
  size: number
  entries: LogEntry[]
  uploadedAt: Date
}

export interface LogFilters {
  level: string
  levels: Record<string, boolean> // Support for multiple level switches
  dateFrom: string
  dateTo: string
  searchQuery: string
  isRegex: boolean
  channel: string
  environment: string
  channels: string[]
  environments: string[]
}

export interface LogStats {
  totalEntries: number
  levelCounts: Record<string, number>
  timeRange: { start: Date; end: Date }
  entriesPerHour: Array<{ hour: string; count: number }>
  topChannels: Array<{ channel: string; count: number }>
}

interface LogStore {
  // State
  files: LogFile[]
  activeFileId: string | null
  filters: LogFilters
  bookmarkedEntries: Set<string>
  selectedEntries: Set<string>
  viewMode: 'single' | 'comparison'
  comparisonFiles: string[]
  isDarkMode: boolean

  // Actions
  addFile: (file: LogFile) => void
  removeFile: (fileId: string) => void
  setActiveFile: (fileId: string) => void
  updateFilters: (filters: Partial<LogFilters>) => void
  resetFilters: () => void
  toggleBookmark: (entryId: string) => void
  toggleSelection: (entryId: string) => void
  clearSelection: () => void
  setViewMode: (mode: 'single' | 'comparison') => void
  setComparisonFiles: (fileIds: string[]) => void
  toggleDarkMode: () => void

  // Computed
  getActiveFile: () => LogFile | null
  getFilteredEntries: (fileId?: string) => LogEntry[]
  getLogStats: (fileId?: string) => LogStats
  getBookmarkedEntries: () => LogEntry[]
}

export const useLogStore = create<LogStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        files: [],
        activeFileId: null,
        filters: {
          level: '',
          levels: {},
          dateFrom: '',
          dateTo: '',
          searchQuery: '',
          isRegex: false,
          channel: '',
          environment: '',
          channels: [],
          environments: []
        },
        bookmarkedEntries: new Set(),
        selectedEntries: new Set(),
        viewMode: 'single',
        comparisonFiles: [],
        isDarkMode: false,

        // Actions
        addFile: (file) => set((state) => ({
          files: [...state.files, file],
          activeFileId: state.activeFileId || file.id
        })),

        removeFile: (fileId) => set((state) => ({
          files: state.files.filter(f => f.id !== fileId),
          activeFileId: state.activeFileId === fileId ?
            (state.files.length > 1 ? state.files.find(f => f.id !== fileId)?.id || null : null) :
            state.activeFileId,
          comparisonFiles: state.comparisonFiles.filter(id => id !== fileId)
        })),

        setActiveFile: (fileId) => set({ activeFileId: fileId }),

        updateFilters: (newFilters) => set((state) => ({
          filters: { ...state.filters, ...newFilters }
        })),

        resetFilters: () => set({
          filters: {
            level: '',
            levels: {},
            dateFrom: '',
            dateTo: '',
            searchQuery: '',
            isRegex: false,
            channel: '',
            environment: '',
            channels: [],
            environments: []
          }
        }),

        toggleBookmark: (entryId) => set((state) => {
          const newBookmarks = new Set(state.bookmarkedEntries)
          if (newBookmarks.has(entryId)) {
            newBookmarks.delete(entryId)
          } else {
            newBookmarks.add(entryId)
          }
          return { bookmarkedEntries: newBookmarks }
        }),

        toggleSelection: (entryId) => set((state) => {
          const newSelection = new Set(state.selectedEntries)
          if (newSelection.has(entryId)) {
            newSelection.delete(entryId)
          } else {
            newSelection.add(entryId)
          }
          return { selectedEntries: newSelection }
        }),

        clearSelection: () => set({ selectedEntries: new Set() }),

        setViewMode: (mode) => set({ viewMode: mode }),

        setComparisonFiles: (fileIds) => set({ comparisonFiles: fileIds }),

        toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

        // Computed functions
        getActiveFile: () => {
          const { files, activeFileId } = get()
          return files.find(f => f.id === activeFileId) || null
        },

        getFilteredEntries: (fileId) => {
          const { files, activeFileId, filters } = get()
          const targetFileId = fileId || activeFileId
          const file = files.find(f => f.id === targetFileId)
          if (!file) return []

          return file.entries.filter(entry => {
            // Level filtering logic:
            // Check if ANY level toggles have been set (even if all are false)
            const levelsObject = filters.levels || {}
            const hasLevelFilters = Object.keys(levelsObject).length > 0
            
            if (hasLevelFilters) {
              // If level filters exist, only show entries for levels that are TRUE
              const activeLevels = Object.keys(levelsObject).filter(key => levelsObject[key])
              
              // If no levels are active (all turned OFF), show NO entries
              if (activeLevels.length === 0) {
                return false
              }
              
              // If some levels are active, only show those levels
              if (!activeLevels.includes(entry.level)) {
                return false
              }
            }
            // If no level filters have been set at all, show all entries (initial state)

            // Legacy single level filter (keep for compatibility, but lower priority)
            if (filters.level && entry.level !== filters.level) return false

            // Search query filter - MUST BE INSTANT
            if (filters.searchQuery && filters.searchQuery.trim()) {
              const searchTerm = filters.searchQuery.toLowerCase().trim()
              const searchText = [
                entry.message || '',
                entry.channel || '',
                entry.environment || '',
                entry.sourceFile || '',
                JSON.stringify(entry.context || {}),
                JSON.stringify(entry.extra || {})
              ].join(' ').toLowerCase()

              if (filters.isRegex) {
                try {
                  const regex = new RegExp(filters.searchQuery, 'i')
                  if (!regex.test(searchText)) return false
                } catch {
                  return false
                }
              } else {
                // Simple text search - should be instant
                if (!searchText.includes(searchTerm)) return false
              }
            }

            // Date range filter
            if (filters.dateFrom) {
              const fromDate = new Date(filters.dateFrom)
              if (entry.timestamp < fromDate) return false
            }
            if (filters.dateTo) {
              const toDate = new Date(filters.dateTo)
              toDate.setHours(23, 59, 59, 999)
              if (entry.timestamp > toDate) return false
            }

            // Channel filter (support both single and multiple)
            if (filters.channel && entry.channel !== filters.channel) return false
            if (filters.channels && filters.channels.length > 0 && entry.channel && !filters.channels.includes(entry.channel)) return false

            // Environment filter (support both single and multiple)
            if (filters.environment && entry.environment !== filters.environment) return false
            if (filters.environments && filters.environments.length > 0 && entry.environment && !filters.environments.includes(entry.environment)) return false

            return true
          })
        },

        getLogStats: (fileId) => {
          const { files, activeFileId } = get()
          const targetFileId = fileId || activeFileId
          const file = files.find(f => f.id === targetFileId)
          if (!file) return {
            totalEntries: 0,
            levelCounts: {},
            timeRange: { start: new Date(), end: new Date() },
            entriesPerHour: [],
            topChannels: []
          }

          const entries = file.entries
          const levelCounts: Record<string, number> = {}
          const channelCounts: Record<string, number> = {}
          const hourCounts: Record<string, number> = {}

          let minTime = new Date()
          let maxTime = new Date(0)

          entries.forEach(entry => {
            // Level counts
            levelCounts[entry.level] = (levelCounts[entry.level] || 0) + 1

            // Channel counts
            if (entry.channel) {
              channelCounts[entry.channel] = (channelCounts[entry.channel] || 0) + 1
            }

            // Time range and hourly counts
            if (entry.timestamp < minTime) minTime = entry.timestamp
            if (entry.timestamp > maxTime) maxTime = entry.timestamp

            const hourKey = entry.timestamp.toISOString().slice(0, 13) + ':00:00.000Z'
            hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1
          })

          return {
            totalEntries: entries.length,
            levelCounts,
            timeRange: { start: minTime, end: maxTime },
            entriesPerHour: Object.entries(hourCounts)
              .map(([hour, count]) => ({ hour, count }))
              .sort((a, b) => a.hour.localeCompare(b.hour)),
            topChannels: Object.entries(channelCounts)
              .map(([channel, count]) => ({ channel, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 10)
          }
        },

        getBookmarkedEntries: () => {
          const { files, bookmarkedEntries } = get()
          const allEntries = files.flatMap(f => f.entries)
          // Ensure bookmarkedEntries is a Set
          const bookmarksSet = bookmarkedEntries instanceof Set ? bookmarkedEntries : new Set(bookmarkedEntries)
          return allEntries.filter(entry => bookmarksSet.has(entry.id))
        }
      }),
      {
        name: 'log-viewer-storage',
        partialize: (state) => ({
          bookmarkedEntries: Array.from(state.bookmarkedEntries),
          isDarkMode: state.isDarkMode,
          filters: state.filters
        }),
        onRehydrateStorage: () => (state) => {
          // Convert bookmarkedEntries array back to Set after rehydration
          if (state && Array.isArray(state.bookmarkedEntries)) {
            state.bookmarkedEntries = new Set(state.bookmarkedEntries)
          }
        }
      }
    )
  )
)
