'use client'

import { useMemo, useState } from 'react'
// Virtualization removed for now - can be added back later
import { useLogStore, LogEntry } from '@/stores/logStore'
import { 
  Star, 
  Copy, 
  ExternalLink, 
  Calendar, 
  Clock, 
  Tag, 
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface LogViewerProps {
  fileId?: string
  height?: number
}

export default function LogViewer({ fileId, height = 600 }: LogViewerProps) {
  const { 
    getFilteredEntries, 
    isDarkMode, 
    toggleBookmark, 
    bookmarkedEntries,
    selectedEntries,
    toggleSelection
  } = useLogStore()
  
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null)
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [liveSearch, setLiveSearch] = useState('')
  
  const entries = useMemo(() => getFilteredEntries(fileId), [getFilteredEntries, fileId])
  
  // Live search filtering
  const filteredEntries = useMemo(() => {
    if (!liveSearch.trim()) return entries
    const searchLower = liveSearch.toLowerCase()
    return entries.filter(entry => 
      entry.message.toLowerCase().includes(searchLower) ||
      entry.channel?.toLowerCase().includes(searchLower) ||
      entry.environment?.toLowerCase().includes(searchLower)
    )
  }, [entries, liveSearch])

  const toggleExpanded = (entryId: string) => {
    const newExpanded = new Set(expandedEntries)
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId)
    } else {
      newExpanded.add(entryId)
    }
    setExpandedEntries(newExpanded)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text)
  }

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    }).format(date)
  }

  const getLevelColor = (level: LogEntry['level']) => {
    const colors = {
      DEBUG: isDarkMode ? 'bg-gray-600 text-gray-100' : 'bg-gray-500 text-white',
      INFO: isDarkMode ? 'bg-blue-600 text-blue-100' : 'bg-blue-500 text-white',
      NOTICE: isDarkMode ? 'bg-cyan-600 text-cyan-100' : 'bg-cyan-500 text-white',
      WARNING: isDarkMode ? 'bg-yellow-600 text-yellow-100' : 'bg-yellow-500 text-white',
      ERROR: isDarkMode ? 'bg-red-600 text-red-100' : 'bg-red-500 text-white',
      CRITICAL: isDarkMode ? 'bg-red-700 text-red-100' : 'bg-red-600 text-white',
      ALERT: isDarkMode ? 'bg-red-800 text-red-100' : 'bg-red-700 text-white',
      EMERGENCY: isDarkMode ? 'bg-red-900 text-red-100' : 'bg-red-800 text-white'
    }
    return colors[level] || colors.INFO
  }

  const LogEntryRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const entry = filteredEntries[index]
    if (!entry) return null
    const isExpanded = expandedEntries.has(entry.id)
    const isBookmarked = bookmarkedEntries.has(entry.id)
    const isSelected = selectedEntries.has(entry.id)

    return (
      <div style={style} className="px-2">
        <div
          className={`
            p-3 rounded-lg border transition-all duration-150 cursor-pointer
            ${isSelected 
              ? isDarkMode 
                ? 'bg-blue-900/30 border-blue-600' 
                : 'bg-blue-50 border-blue-300'
              : isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }
          `}
          onClick={() => toggleSelection(entry.id)}
        >
          <div className="flex items-start gap-3">
            {/* Expand/Collapse Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(entry.id)
              }}
              className={`mt-1 p-1 rounded transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {/* Timestamp - Date and Time on Separate Lines */}
            <div className={`flex-shrink-0 text-xs font-mono ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <div className="font-semibold">
                {new Intl.DateTimeFormat('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }).format(entry.timestamp)}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock size={10} />
                {new Intl.DateTimeFormat('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  fractionalSecondDigits: 3
                }).format(entry.timestamp)}
              </div>
            </div>

            {/* Level Badge */}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(entry.level)}`}>
              {entry.level}
            </span>

            {/* Message - Collapsible for Long Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-relaxed ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              } ${!isExpanded && entry.message.length > 150 ? 'line-clamp-2' : ''}`}>
                {entry.message}
              </p>
              {!isExpanded && entry.message.length > 150 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpanded(entry.id)
                  }}
                  className={`text-xs mt-1 ${
                    isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  Show more...
                </button>
              )}
              
              {/* Metadata */}
              {(entry.channel || entry.environment || entry.sourceFile) && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {entry.channel && (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Tag size={12} />
                      {entry.channel}
                    </span>
                  )}
                  {entry.environment && (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${
                      isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                    }`}>
                      <Calendar size={12} />
                      {entry.environment}
                    </span>
                  )}
                  {entry.sourceFile && (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${
                      isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <FileText size={12} />
                      {entry.sourceFile}:{entry.lineNumber}
                    </span>
                  )}
                </div>
              )}

              {/* Context/Extra Data */}
              {isExpanded && (entry.context || entry.extra) && (
                <div className="mt-3 space-y-2">
                  {entry.context && (
                    <div>
                      <h4 className={`text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Context:
                      </h4>
                      <pre className={`text-xs p-2 rounded overflow-x-auto ${
                        isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-700'
                      }`}>
                        {JSON.stringify(entry.context, null, 2)}
                      </pre>
                    </div>
                  )}
                  {entry.extra && (
                    <div>
                      <h4 className={`text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Extra:
                      </h4>
                      <pre className={`text-xs p-2 rounded overflow-x-auto ${
                        isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-700'
                      }`}>
                        {JSON.stringify(entry.extra, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-start gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleBookmark(entry.id)
                }}
                className={`p-1 rounded transition-colors ${
                  isBookmarked
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : isDarkMode 
                      ? 'text-gray-500 hover:text-yellow-500' 
                      : 'text-gray-400 hover:text-yellow-500'
                }`}
                title="Toggle bookmark"
              >
                <Star size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard(entry.message)
                }}
                className={`p-1 rounded transition-colors ${
                  isDarkMode 
                    ? 'text-gray-500 hover:text-gray-300' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Copy message"
              >
                <Copy size={16} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedEntry(entry)
                }}
                className={`p-1 rounded transition-colors ${
                  isDarkMode 
                    ? 'text-gray-500 hover:text-gray-300' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="View details"
              >
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 rounded-lg border-2 border-dashed ${
        isDarkMode 
          ? 'border-gray-600 text-gray-400' 
          : 'border-gray-300 text-gray-500'
      }`}>
        <div className="text-center">
          <Clock size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No log entries found</p>
          <p className="text-sm mt-1">Upload a log file or adjust your filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Live Search Box */}
      <div className={`p-4 rounded-xl ${isDarkMode ? 'glass-dark' : 'glass'} shadow-lg`}>
        <div className="relative">
          <input
            type="search"
            value={liveSearch}
            onChange={(e) => setLiveSearch(e.target.value)}
            placeholder="🔍 Live search in messages, channels, environment..."
            className={`w-full px-4 py-3 pl-10 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all ${
              isDarkMode
                ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/30'
                : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/30'
            }`}
          />
          <svg
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {liveSearch && (
            <button
              onClick={() => setLiveSearch('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className={`flex items-center justify-between p-3 rounded-lg ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'
      } backdrop-blur-sm`}>
        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Showing {filteredEntries.length.toLocaleString()} of {entries.length.toLocaleString()} entries
          {selectedEntries.size > 0 && ` • ${selectedEntries.size} selected`}
          {liveSearch && ` • Filtered by "${liveSearch}"`}
        </div>
        
        {selectedEntries.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                const selectedEntriesArray = filteredEntries.filter(e => selectedEntries.has(e.id))
                const text = selectedEntriesArray.map(e => 
                  `[${formatTimestamp(e.timestamp)}] ${e.level}: ${e.message}`
                ).join('\n')
                copyToClipboard(text)
              }}
              className={`px-3 py-1 text-xs rounded ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Copy Selected
            </button>
          </div>
        )}
      </div>

      {/* Log Entries List */}
      <div className={`rounded-xl ${isDarkMode ? 'glass-dark' : 'glass'} shadow-lg overflow-hidden`}>
        <div className="space-y-2 overflow-auto p-4" style={{ height }}>
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry, index) => (
              <LogEntryRow 
                key={entry.id}
                index={index} 
                style={{}} 
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  No results found for &quot;{liveSearch}&quot;
                </p>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Try a different search term
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <LogEntryDetail 
          entry={selectedEntry} 
          onClose={() => setSelectedEntry(null)} 
        />
      )}
    </div>
  )
}

interface LogEntryDetailProps {
  entry: LogEntry
  onClose: () => void
}

function LogEntryDetail({ entry, onClose }: LogEntryDetailProps) {
  const { isDarkMode } = useLogStore()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`max-w-4xl w-full max-h-[90vh] rounded-lg shadow-xl ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className="text-lg font-semibold">Log Entry Details</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded hover:bg-gray-100 ${
              isDarkMode ? 'hover:bg-gray-700' : ''
            }`}
          >
            ×
          </button>
        </div>
        
        <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
          <pre className={`text-sm whitespace-pre-wrap ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {JSON.stringify(entry, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}