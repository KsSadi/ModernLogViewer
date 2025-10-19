'use client'

import { useMemo } from 'react'
import { useLogStore } from '@/stores/logStore'
import { 
  ChevronDown,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Info,
  Bug,
  Zap,
  AlertOctagon
} from 'lucide-react'

export default function LogFilters() {
  // Subscribe to specific store parts that can trigger re-renders
  const filters = useLogStore(state => state.filters)
  const updateFilters = useLogStore(state => state.updateFilters)
  const isDarkMode = useLogStore(state => state.isDarkMode)
  const files = useLogStore(state => state.files)
  const activeFileId = useLogStore(state => state.activeFileId)
  
  const activeFile = useMemo(() => {
    return files.find(f => f.id === activeFileId) || null
  }, [files, activeFileId])
  
  // Make filteredEntries reactive to filter changes
  const filteredEntries = useMemo(() => {
    if (!activeFile) return []
    
    const entries = activeFile.entries
    
    return entries.filter(entry => {
      // Multi-level filter with highest priority
      if (filters.levels && Object.keys(filters.levels).length > 0) {
        const hasActiveLevels = Object.values(filters.levels).some(Boolean)
        if (hasActiveLevels && !filters.levels[entry.level]) {
          return false
        }
      }

      // Search query filter
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
          if (!searchText.includes(searchTerm)) return false
        }
      }

      return true
    })
  }, [activeFile, filters])

  // Get log level counts from the active file
  const levelCounts = useMemo(() => {
    if (!activeFile) return {}
    
    const counts: Record<string, number> = {}
    activeFile.entries.forEach(entry => {
      counts[entry.level] = (counts[entry.level] || 0) + 1
    })
    return counts
  }, [activeFile])

  // Define log levels with their UI properties
  const logLevels = [
    { 
      value: 'CRITICAL', 
      label: 'Critical', 
      icon: AlertOctagon, 
      color: 'red',
      bgActive: isDarkMode ? 'bg-red-600' : 'bg-red-500',
      bgInactive: isDarkMode ? 'bg-gray-700' : 'bg-gray-200',
      textActive: 'text-white',
      textInactive: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      borderActive: isDarkMode ? 'border-red-500' : 'border-red-400',
      borderInactive: isDarkMode ? 'border-gray-600' : 'border-gray-300'
    },
    { 
      value: 'EMERGENCY', 
      label: 'Emergency', 
      icon: Zap, 
      color: 'red',
      bgActive: isDarkMode ? 'bg-red-700' : 'bg-red-600',
      bgInactive: isDarkMode ? 'bg-gray-700' : 'bg-gray-200',
      textActive: 'text-white',
      textInactive: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      borderActive: isDarkMode ? 'border-red-600' : 'border-red-500',
      borderInactive: isDarkMode ? 'border-gray-600' : 'border-gray-300'
    },
    { 
      value: 'ERROR', 
      label: 'Error', 
      icon: XCircle, 
      color: 'red',
      bgActive: isDarkMode ? 'bg-red-600' : 'bg-red-500',
      bgInactive: isDarkMode ? 'bg-gray-700' : 'bg-gray-200',
      textActive: 'text-white',
      textInactive: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      borderActive: isDarkMode ? 'border-red-500' : 'border-red-400',
      borderInactive: isDarkMode ? 'border-gray-600' : 'border-gray-300'
    },
    { 
      value: 'ALERT', 
      label: 'Alert', 
      icon: AlertCircle, 
      color: 'red',
      bgActive: isDarkMode ? 'bg-red-600' : 'bg-red-500',
      bgInactive: isDarkMode ? 'bg-gray-700' : 'bg-gray-200',
      textActive: 'text-white',
      textInactive: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      borderActive: isDarkMode ? 'border-red-500' : 'border-red-400',
      borderInactive: isDarkMode ? 'border-gray-600' : 'border-gray-300'
    },
    { 
      value: 'WARNING', 
      label: 'Warning', 
      icon: AlertTriangle, 
      color: 'yellow',
      bgActive: isDarkMode ? 'bg-yellow-600' : 'bg-yellow-500',
      bgInactive: isDarkMode ? 'bg-gray-700' : 'bg-gray-200',
      textActive: 'text-white',
      textInactive: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      borderActive: isDarkMode ? 'border-yellow-500' : 'border-yellow-400',
      borderInactive: isDarkMode ? 'border-gray-600' : 'border-gray-300'
    },
    { 
      value: 'NOTICE', 
      label: 'Notice', 
      icon: Info, 
      color: 'yellow',
      bgActive: isDarkMode ? 'bg-yellow-600' : 'bg-yellow-500',
      bgInactive: isDarkMode ? 'bg-gray-700' : 'bg-gray-200',
      textActive: 'text-white',
      textInactive: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      borderActive: isDarkMode ? 'border-yellow-500' : 'border-yellow-400',
      borderInactive: isDarkMode ? 'border-gray-600' : 'border-gray-300'
    },
    { 
      value: 'INFO', 
      label: 'Info', 
      icon: Info, 
      color: 'blue',
      bgActive: isDarkMode ? 'bg-blue-600' : 'bg-blue-500',
      bgInactive: isDarkMode ? 'bg-gray-700' : 'bg-gray-200',
      textActive: 'text-white',
      textInactive: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      borderActive: isDarkMode ? 'border-blue-500' : 'border-blue-400',
      borderInactive: isDarkMode ? 'border-gray-600' : 'border-gray-300'
    },
    { 
      value: 'DEBUG', 
      label: 'Debug', 
      icon: Bug, 
      color: 'green',
      bgActive: isDarkMode ? 'bg-green-600' : 'bg-green-500',
      bgInactive: isDarkMode ? 'bg-gray-700' : 'bg-gray-200',
      textActive: 'text-white',
      textInactive: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      borderActive: isDarkMode ? 'border-green-500' : 'border-green-400',
      borderInactive: isDarkMode ? 'border-gray-600' : 'border-gray-300'
    }
  ]

  const toggleLevel = (level: string) => {
    const newLevels = {
      ...filters.levels,
      [level]: !filters.levels?.[level]
    }
    updateFilters({ levels: newLevels })
  }

  const totalEntries = filteredEntries.length
  const totalUnfilteredEntries = activeFile?.entries.length || 0

  return (
    <div className="space-y-4">
      {/* Smart Filters */}
      <div className={`rounded-xl border ${
        isDarkMode 
          ? 'bg-gray-800/50 border-gray-700' 
          : 'bg-white border-gray-200'
      } backdrop-blur-sm`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <ChevronDown size={16} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Smart Filters
            </h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
            }`}>
              {totalEntries} Total Entries
            </div>
          </div>
          
          <ChevronDown 
            size={16} 
            className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
          />
        </div>

        {/* Log Level Toggle Filters */}
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-3">
            {logLevels.map(level => {
              const count = levelCounts[level.value] || 0
              const isActive = filters.levels?.[level.value] || false
              const IconComponent = level.icon

              if (count === 0) return null // Don't show levels with 0 entries

              return (
                <button
                  key={level.value}
                  onClick={() => toggleLevel(level.value)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200
                    ${isActive 
                      ? `${level.bgActive} ${level.textActive} ${level.borderActive} shadow-md` 
                      : `${level.bgInactive} ${level.textInactive} border ${level.borderInactive} hover:border-gray-400`
                    }
                  `}
                >
                  <IconComponent size={16} />
                  <span className="font-medium text-sm">{level.label}</span>
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs font-bold
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : isDarkMode 
                        ? 'bg-gray-600 text-gray-200' 
                        : 'bg-gray-300 text-gray-700'
                    }
                  `}>
                    {count}
                  </span>
                  
                  {/* Toggle Switch */}
                  <div className={`
                    relative w-11 h-6 rounded-full transition-colors ml-2
                    ${isActive 
                      ? level.color === 'red' ? 'bg-red-500' :
                        level.color === 'yellow' ? 'bg-yellow-500' :
                        level.color === 'blue' ? 'bg-blue-500' :
                        'bg-green-500'
                      : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                    }
                  `}>
                    <div className={`
                      absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white 
                      transition-transform duration-200 shadow-sm
                      ${isActive ? 'translate-x-5' : 'translate-x-0'}
                    `} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Live Search */}
      <div className={`rounded-xl border ${
        isDarkMode 
          ? 'bg-gray-800/50 border-gray-700' 
          : 'bg-white border-gray-200'
      } backdrop-blur-sm`}>
        <div className="p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div className="ml-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <input
              type="text"
              value={filters.searchQuery || ''}
              onChange={(e) => updateFilters({ searchQuery: e.target.value })}
              placeholder="Live search in messages, channels, environment..."
              className={`w-full pl-16 pr-4 py-3 rounded-lg border-2 transition-all ${
                isDarkMode
                  ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
            {filters.searchQuery && (
              <button
                onClick={() => updateFilters({ searchQuery: '' })}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {totalEntries} of {totalUnfilteredEntries} entries
            {totalEntries !== totalUnfilteredEntries && (
              <span className="ml-2 text-xs text-blue-500">
                • Filtered
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}