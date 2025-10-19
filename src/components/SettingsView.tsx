'use client'

import { useLogStore } from '@/stores/logStore'
import { Settings, Moon, Sun, Download, Trash2, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function SettingsView() {
  const { 
    isDarkMode, 
    toggleDarkMode, 
    files, 
    removeFile,
    bookmarkedEntries,
    filters,
    updateFilters
  } = useLogStore()
  
  const [showConfirmClear, setShowConfirmClear] = useState(false)

  const clearAllData = () => {
    files.forEach(file => removeFile(file.id))
    localStorage.removeItem('log-viewer-storage')
    setShowConfirmClear(false)
    window.location.reload()
  }

  const exportSettings = () => {
    const settings = {
      theme: isDarkMode ? 'dark' : 'light',
      bookmarks: Array.from(bookmarkedEntries),
      filters,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `log-viewer-settings-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const resetFilters = () => {
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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Settings size={28} />
          Settings
        </h2>
        <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Customize your log viewer experience
        </p>
      </div>

      {/* Appearance Settings */}
      <div className={`p-6 rounded-lg border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Appearance
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Theme
              </label>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Choose between light and dark mode
              </p>
            </div>
            
            <button
              onClick={toggleDarkMode}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-650' 
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className={`p-6 rounded-lg border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Data Management
        </h3>
        
        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <h4 className={`font-medium ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Loaded Files
              </h4>
              <p className={`text-2xl font-bold mt-1 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {files.length}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <h4 className={`font-medium ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Total Entries
              </h4>
              <p className={`text-2xl font-bold mt-1 ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                {files.reduce((sum, file) => sum + file.entries.length, 0).toLocaleString()}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <h4 className={`font-medium ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Bookmarks
              </h4>
              <p className={`text-2xl font-bold mt-1 ${
                isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                {bookmarkedEntries.size}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Export Settings
                </label>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Download your current settings and bookmarks
                </p>
              </div>
              
              <button
                onClick={exportSettings}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <Download size={16} />
                Export
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Reset Filters
                </label>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Clear all current filters and search queries
                </p>
              </div>
              
              <button
                onClick={resetFilters}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                <RefreshCw size={16} />
                Reset
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-600">
              <div>
                <label className={`text-sm font-medium text-red-400`}>
                  Clear All Data
                </label>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Remove all files, bookmarks, and reset settings
                </p>
              </div>
              
              <button
                onClick={() => setShowConfirmClear(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                <Trash2 size={16} />
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className={`p-6 rounded-lg border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-800'
          }`}>
            Loaded Files
          </h3>
          
          <div className="space-y-3">
            {files.map(file => (
              <div
                key={file.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}
              >
                <div>
                  <h4 className={`font-medium ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    {file.name}
                  </h4>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {file.entries.length.toLocaleString()} entries • {(file.size / 1024).toFixed(1)} KB
                    • Uploaded {file.uploadedAt.toLocaleDateString()}
                  </p>
                </div>
                
                <button
                  onClick={() => removeFile(file.id)}
                  className={`p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors`}
                  title="Remove file"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts */}
      <div className={`p-6 rounded-lg border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Keyboard Shortcuts
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { keys: ['Ctrl', 'K'], description: 'Quick search' },
            { keys: ['Ctrl', 'D'], description: 'Toggle dark mode' },
            { keys: ['Ctrl', 'B'], description: 'Toggle bookmark' },
            { keys: ['Ctrl', 'E'], description: 'Export filtered data' },
            { keys: ['Ctrl', 'R'], description: 'Reset filters' },
            { keys: ['Esc'], description: 'Close modals' }
          ].map(({ keys, description }) => (
            <div key={description} className="flex items-center justify-between">
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {description}
              </span>
              <div className="flex gap-1">
                {keys.map(key => (
                  <kbd
                    key={key}
                    className={`px-2 py-1 text-xs rounded ${
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`max-w-md w-full rounded-lg shadow-xl p-6 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <h3 className="text-lg font-semibold mb-3">Clear All Data?</h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              This will permanently remove all uploaded files, bookmarks, and reset all settings. 
              This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmClear(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={clearAllData}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}