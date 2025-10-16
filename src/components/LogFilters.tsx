'use client'

import { useState } from 'react'
import { useLogStore } from '@/stores/logStore'
import { 
  Search, 
  Calendar, 
  Filter, 
  X, 
  RefreshCw,
  Settings,
  ChevronDown
} from 'lucide-react'

export default function LogFilters() {
  const { 
    filters, 
    updateFilters, 
    isDarkMode, 
    getActiveFile,
    getFilteredEntries 
  } = useLogStore()
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const activeFile = getActiveFile()
  const filteredEntries = getFilteredEntries()

  // Get unique values for dropdowns
  const levels = activeFile ? [...new Set(activeFile.entries.map(e => e.level))].sort() : []
  const channels = activeFile ? [...new Set(activeFile.entries.map(e => e.channel).filter(Boolean))].sort() : []
  const environments = activeFile ? [...new Set(activeFile.entries.map(e => e.environment).filter(Boolean))].sort() : []

  const clearAllFilters = () => {
    updateFilters({
      level: '',
      dateFrom: '',
      dateTo: '',
      searchQuery: '',
      isRegex: false,
      channel: '',
      environment: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    typeof value === 'boolean' ? value : Boolean(value)
  )

  return (
    <div className={`rounded-lg border ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div 
        className={`flex items-center justify-between p-4 cursor-pointer ${
          isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Filter size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
          <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Filters
          </h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
              Active
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {filteredEntries.length.toLocaleString()} entries
          </span>
          <ChevronDown 
            size={16} 
            className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''} ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          />
        </div>
      </div>

      {/* Filters Content */}
      {isExpanded && (
        <div className={`p-4 border-t space-y-4 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          {/* Quick Search */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Search
            </label>
            <div className="relative">
              <Search 
                size={16} 
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => updateFilters({ searchQuery: e.target.value })}
                placeholder="Search in messages, context, source..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500/20`}
              />
              {filters.searchQuery && (
                <button
                  onClick={() => updateFilters({ searchQuery: '' })}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <X size={16} />
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
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Use regular expression
              </span>
            </label>
          </div>

          {/* Level Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Level
              </label>
              <select
                value={filters.level}
                onChange={(e) => updateFilters({ level: e.target.value })}
                className={`w-full p-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Channel Filter */}
            {channels.length > 0 && (
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Channel
                </label>
                <select
                  value={filters.channel}
                  onChange={(e) => updateFilters({ channel: e.target.value })}
                  className={`w-full p-2 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500/20`}
                >
                  <option value="">All Channels</option>
                  {channels.map(channel => (
                    <option key={channel} value={channel}>{channel}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Environment Filter */}
            {environments.length > 0 && (
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Environment
                </label>
                <select
                  value={filters.environment}
                  onChange={(e) => updateFilters({ environment: e.target.value })}
                  className={`w-full p-2 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500/20`}
                >
                  <option value="">All Environments</option>
                  {environments.map(env => (
                    <option key={env} value={env}>{env}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                From Date
              </label>
              <div className="relative">
                <Calendar 
                  size={16} 
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                />
                <input
                  type="datetime-local"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilters({ dateFrom: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                To Date
              </label>
              <div className="relative">
                <Calendar 
                  size={16} 
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                />
                <input
                  type="datetime-local"
                  value={filters.dateTo}
                  onChange={(e) => updateFilters({ dateTo: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 text-sm ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-300' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Settings size={16} />
              Advanced Filters
              <ChevronDown 
                size={14} 
                className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <RefreshCw size={14} />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filters Content */}
          {showAdvanced && (
            <div className={`p-4 rounded-lg border space-y-4 ${
              isDarkMode 
                ? 'bg-gray-750 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Advanced Options
              </h4>
              
              {/* Quick Filters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: 'Errors Only', filter: { level: 'ERROR' } },
                  { label: 'Warnings+', filter: { level: 'WARNING' } },
                  { label: 'Today', filter: { dateFrom: new Date().toISOString().slice(0, 10) } },
                  { label: 'Last Hour', filter: { 
                    dateFrom: new Date(Date.now() - 3600000).toISOString().slice(0, 16)
                  }}
                ].map(({ label, filter }) => (
                  <button
                    key={label}
                    onClick={() => updateFilters(filter)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}