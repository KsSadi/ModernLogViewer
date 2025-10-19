'use client'

import { useMemo } from 'react'
import { useLogStore } from '@/stores/logStore'
import { Search, X, Calendar, Filter, RotateCcw } from 'lucide-react'

export default function LogFiltersImproved() {
  const { filters, updateFilters, resetFilters, isDarkMode, getActiveFile } = useLogStore()
  const activeFile = getActiveFile()

  // Get unique channels and environments for dynamic filtering
  const { channels, environments } = useMemo(() => {
    if (!activeFile) return { channels: [], environments: [] }
    
    const channelSet = new Set<string>()
    const envSet = new Set<string>()
    
    activeFile.entries.forEach(entry => {
      if (entry.channel) channelSet.add(entry.channel)
      if (entry.environment) envSet.add(entry.environment)
    })
    
    return {
      channels: Array.from(channelSet),
      environments: Array.from(envSet)
    }
  }, [activeFile])

  // All 8 Laravel log levels with colors and emojis
  const logLevels = [
    { value: 'DEBUG', label: 'Debug', emoji: '⚪', color: 'gray' },
    { value: 'INFO', label: 'Info', emoji: '🔵', color: 'blue' },
    { value: 'NOTICE', label: 'Notice', emoji: '�', color: 'green' },
    { value: 'WARNING', label: 'Warning', emoji: '🟡', color: 'yellow' },
    { value: 'ERROR', label: 'Error', emoji: '🔴', color: 'red' },
    { value: 'CRITICAL', label: 'Critical', emoji: '🟠', color: 'orange' },
    { value: 'ALERT', label: 'Alert', emoji: '🟣', color: 'purple' },
    { value: 'EMERGENCY', label: 'Emergency', emoji: '⚫', color: 'black' }
  ]

  const toggleLevel = (level: string) => {
    updateFilters({
      levels: {
        ...filters.levels,
        [level]: !filters.levels[level]
      }
    })
  }

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'levels') {
      return value && typeof value === 'object' && Object.values(value).some(v => v === true)
    }
    if (key === 'channels' || key === 'environments') {
      return Array.isArray(value) && value.length > 0
    }
    return typeof value === 'boolean' ? value : Boolean(value)
  })

  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'levels') {
      return count + (value && typeof value === 'object' ? Object.values(value).filter(v => v === true).length : 0)
    }
    if (key === 'searchQuery' && value) return count + 1
    if (key === 'isRegex' && value) return count + 1
    if (key === 'channels' && Array.isArray(value) && value.length > 0) return count + value.length
    if (key === 'environments' && Array.isArray(value) && value.length > 0) return count + value.length
    if (key === 'dateFrom' && value) return count + 1
    if (key === 'dateTo' && value) return count + 1
    return count
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Filter size={18} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
          <h3 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Filters
          </h3>
          {activeFilterCount > 0 && (
            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
              isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
            }`}>
              {activeFilterCount}
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
              isDarkMode
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            title="Reset all filters (Ctrl+R)"
          >
            <RotateCcw size={13} />
            Clear All
          </button>
        )}
      </div>

      {/* Live Search */}
      <div className="space-y-2">
        <label className={`text-sm font-medium block ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Search
        </label>
        <div className="relative">
          <Search 
            size={16} 
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} 
          />
          <input
            type="search"
            value={filters.searchQuery}
            onChange={(e) => updateFilters({ searchQuery: e.target.value })}
            placeholder="Search messages, context..."
            className={`w-full pl-9 pr-9 py-2 rounded-lg border text-sm transition-all ${
              isDarkMode
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
          />
          {filters.searchQuery && (
            <button
              onClick={() => updateFilters({ searchQuery: '' })}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <X size={14} />
            </button>
          )}
        </div>
        
        {/* Regex Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.isRegex}
            onChange={(e) => updateFilters({ isRegex: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Use regular expression
          </span>
        </label>
      </div>

      {/* Log Level Switches - All 8 Levels */}
      <div className="space-y-3">
        <label className={`text-sm font-medium block ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Log Level
        </label>
        <div className="space-y-2">
          {logLevels.map(level => {
            const isActive = filters.levels ? filters.levels[level.value] : false
            return (
              <button
                key={level.value}
                onClick={() => toggleLevel(level.value)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border-2 transition-all ${
                  isActive
                    ? isDarkMode
                      ? `bg-${level.color}-900/20 border-${level.color}-500 shadow-md shadow-${level.color}-500/20`
                      : `bg-${level.color}-50 border-${level.color}-400 shadow-md shadow-${level.color}-400/20`
                    : isDarkMode
                      ? 'bg-gray-800/30 border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                      : 'bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-gray-100/50'
                }`}
                style={{
                  boxShadow: isActive 
                    ? `0 0 0 3px ${level.color === 'gray' ? 'rgba(107, 114, 128, 0.1)' : 
                        level.color === 'blue' ? 'rgba(59, 130, 246, 0.1)' :
                        level.color === 'green' ? 'rgba(34, 197, 94, 0.1)' :
                        level.color === 'yellow' ? 'rgba(234, 179, 8, 0.1)' :
                        level.color === 'red' ? 'rgba(239, 68, 68, 0.1)' :
                        level.color === 'orange' ? 'rgba(249, 115, 22, 0.1)' :
                        level.color === 'purple' ? 'rgba(168, 85, 247, 0.1)' :
                        'rgba(0, 0, 0, 0.1)'}` 
                    : 'none'
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg flex-shrink-0">{level.emoji}</span>
                  <span className={`font-medium text-sm whitespace-nowrap ${
                    isActive
                      ? isDarkMode ? 'text-white' : 'text-gray-900'
                      : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {level.label}
                  </span>
                </div>
                
                {/* Toggle Switch */}
                <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  isActive
                    ? level.color === 'gray' ? 'bg-gray-500' :
                      level.color === 'blue' ? 'bg-blue-500' :
                      level.color === 'green' ? 'bg-green-500' :
                      level.color === 'yellow' ? 'bg-yellow-500' :
                      level.color === 'red' ? 'bg-red-500' :
                      level.color === 'orange' ? 'bg-orange-500' :
                      level.color === 'purple' ? 'bg-purple-500' :
                      'bg-gray-900'
                    : isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-md ${
                    isActive ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Date Filters */}
      <div className="space-y-3">
        <label className={`text-sm font-medium block ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          From Date
        </label>
        <div className="relative">
          <Calendar size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="date"
            value={filters.dateFrom ? new Date(filters.dateFrom).toISOString().split('T')[0] : ''}
            onChange={(e) => updateFilters({ dateFrom: e.target.value ? new Date(e.target.value).toISOString() : '' })}
            className={`w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm ${
              isDarkMode
                ? 'bg-gray-800/50 border-gray-600 text-white focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className={`text-sm font-medium block ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          To Date
        </label>
        <div className="relative">
          <Calendar size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="date"
            value={filters.dateTo ? new Date(filters.dateTo).toISOString().split('T')[0] : ''}
            onChange={(e) => updateFilters({ dateTo: e.target.value ? new Date(e.target.value).toISOString() : '' })}
            className={`w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm ${
              isDarkMode
                ? 'bg-gray-800/50 border-gray-600 text-white focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
          />
        </div>
      </div>

      {/* Channel Filter */}
      {channels.length > 0 && (
        <div className="space-y-2">
          <label className={`text-sm font-medium block ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Channel
          </label>
          <div className="flex flex-wrap gap-2">
            {channels.map((channel) => {
              const isActive = filters.channels ? filters.channels.includes(channel) : false
              return (
                <button
                  key={channel}
                  onClick={() => {
                    const currentChannels = filters.channels || []
                    const newChannels = isActive
                      ? currentChannels.filter(c => c !== channel)
                      : [...currentChannels, channel]
                    updateFilters({ channels: newChannels })
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? isDarkMode
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                      : isDarkMode
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200 border border-gray-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 border border-gray-200'
                  }`}
                >
                  {channel}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Environment Filter */}
      {environments.length > 0 && (
        <div className="space-y-2">
          <label className={`text-sm font-medium block ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Environment
          </label>
          <div className="flex flex-wrap gap-2">
            {environments.map((env) => {
              const isActive = filters.environments ? filters.environments.includes(env) : false
              return (
                <button
                  key={env}
                  onClick={() => {
                    const currentEnvs = filters.environments || []
                    const newEnvs = isActive
                      ? currentEnvs.filter(e => e !== env)
                      : [...currentEnvs, env]
                    updateFilters({ environments: newEnvs })
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? isDarkMode
                        ? 'bg-green-600 text-white shadow-md shadow-green-600/30'
                        : 'bg-green-500 text-white shadow-md shadow-green-500/30'
                      : isDarkMode
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200 border border-gray-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 border border-gray-200'
                  }`}
                >
                  {env}
                </button>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
