'use client'

import { useLogStore } from '@/stores/logStore'
import { Star, Copy, Trash2, Download, Search } from 'lucide-react'
import { useState } from 'react'
import { LogParser } from '@/utils/logParser'

export default function BookmarksView() {
  const { 
    getBookmarkedEntries, 
    toggleBookmark, 
    isDarkMode 
  } = useLogStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const bookmarkedEntries = getBookmarkedEntries()
  
  const filteredBookmarks = bookmarkedEntries.filter(entry => 
    searchQuery === '' || 
    entry.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.channel || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  const getLevelColor = (level: string) => {
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
    return colors[level as keyof typeof colors] || colors.INFO
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text)
  }

  const exportBookmarks = (format: 'json' | 'csv') => {
    if (filteredBookmarks.length === 0) {
      alert('No bookmarks to export')
      return
    }

    const filename = `bookmarks-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}`
    
    if (format === 'json') {
      const content = LogParser.exportToJson(filteredBookmarks)
      LogParser.downloadFile(content, `${filename}.json`, 'application/json')
    } else {
      const content = LogParser.exportToCsv(filteredBookmarks)
      LogParser.downloadFile(content, `${filename}.csv`, 'text/csv')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Bookmarked Entries
          </h2>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {filteredBookmarks.length} of {bookmarkedEntries.length} bookmarks
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => exportBookmarks('json')}
            disabled={filteredBookmarks.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isDarkMode 
                ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-700' 
                : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300'
            } disabled:cursor-not-allowed`}
          >
            <Download size={16} />
            Export JSON
          </button>
          
          <button
            onClick={() => exportBookmarks('csv')}
            disabled={filteredBookmarks.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700' 
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300'
            } disabled:cursor-not-allowed`}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search bookmarks..."
          className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
          } focus:ring-2 focus:ring-blue-500/20`}
        />
      </div>

      {/* Bookmarks List */}
      {filteredBookmarks.length === 0 ? (
        <div className={`text-center py-12 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <Star size={64} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">
            {bookmarkedEntries.length === 0 ? 'No Bookmarks Yet' : 'No Matching Bookmarks'}
          </h3>
          <p>
            {bookmarkedEntries.length === 0 
              ? 'Star log entries to bookmark them for quick access'
              : 'Try adjusting your search query'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookmarks.map((entry) => (
            <div
              key={entry.id}
              className={`p-4 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Timestamp & Level */}
                <div className="flex-shrink-0">
                  <div className={`text-xs font-mono mb-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {formatTimestamp(entry.timestamp)}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(entry.level)}`}>
                    {entry.level}
                  </span>
                </div>

                {/* Message */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed mb-2 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    {entry.message}
                  </p>
                  
                  {/* Metadata */}
                  {(entry.channel || entry.environment || entry.sourceFile) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {entry.channel && (
                        <span className={`px-2 py-1 text-xs rounded ${
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {entry.channel}
                        </span>
                      )}
                      {entry.environment && (
                        <span className={`px-2 py-1 text-xs rounded ${
                          isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {entry.environment}
                        </span>
                      )}
                      {entry.sourceFile && (
                        <span className={`px-2 py-1 text-xs rounded ${
                          isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {entry.sourceFile}:{entry.lineNumber}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Context */}
                  {entry.context && (
                    <details className="mt-3">
                      <summary className={`cursor-pointer text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        View Context
                      </summary>
                      <pre className={`text-xs mt-2 p-2 rounded overflow-x-auto ${
                        isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-700'
                      }`}>
                        {JSON.stringify(entry.context, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex gap-2">
                  <button
                    onClick={() => copyToClipboard(entry.message)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    title="Copy message"
                  >
                    <Copy size={16} />
                  </button>

                  <button
                    onClick={() => toggleBookmark(entry.id)}
                    className="p-2 rounded-lg text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10 transition-colors"
                    title="Remove bookmark"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}