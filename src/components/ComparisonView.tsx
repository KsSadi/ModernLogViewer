'use client'

import { useState, useMemo } from 'react'
import { useLogStore } from '@/stores/logStore'
import { GitCompare, ArrowLeftRight, BarChart3, Users, Target, CheckCircle, AlertCircle } from 'lucide-react'
import LogViewer from './LogViewer'
import { compareLogFiles, ComparisonResult } from '@/utils/logComparison'

export default function ComparisonView() {
  const { files, isDarkMode, getLogStats } = useLogStore()
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'overlay'>('side-by-side')
  const [activeComparisonTab, setActiveComparisonTab] = useState<'stats' | 'matches'>('stats')

  // Compute log comparison when two files are selected
  const comparisonResult: ComparisonResult | null = useMemo(() => {
    if (selectedFiles.length !== 2) return null
    
    const file1 = files.find(f => f.id === selectedFiles[0])
    const file2 = files.find(f => f.id === selectedFiles[1])
    
    if (!file1 || !file2) return null
    
    return compareLogFiles(file1.entries, file2.entries, 0.85)
  }, [selectedFiles, files])

  const handleFileToggle = (fileId: string) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId)
      } else if (prev.length < 2) {
        return [...prev, fileId]
      } else {
        // Replace the first file with the new one
        return [prev[1], fileId]
      }
    })
  }

  const selectedFileObjects = selectedFiles.map(id => files.find(f => f.id === id)).filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          File Comparison
        </h2>
        <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Compare log files side by side to identify differences and patterns
        </p>
      </div>

      {files.length === 0 && (
        <div className={`text-center py-12 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <GitCompare size={64} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">No Files Available</h3>
          <p>Upload some log files to start comparing them</p>
        </div>
      )}

      {files.length > 0 && (
        <>
          {/* File Selection */}
          <div className={`p-4 rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-medium mb-3 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Select Files to Compare (Choose up to 2)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {files.map(file => {
                const isSelected = selectedFiles.includes(file.id)
                const stats = getLogStats(file.id)
                
                return (
                  <div
                    key={file.id}
                    onClick={() => handleFileToggle(file.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-blue-900/30 border-blue-600'
                          : 'bg-blue-50 border-blue-300'
                        : isDarkMode
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-650'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium truncate ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {file.name}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {stats.totalEntries.toLocaleString()} entries
                        </p>
                        <p className={`text-xs ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      
                      {isSelected && (
                        <div className={`ml-2 px-2 py-1 text-xs rounded ${
                          isDarkMode 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-blue-500 text-white'
                        }`}>
                          {selectedFiles.indexOf(file.id) + 1}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Comparison Controls */}
          {selectedFiles.length > 0 && (
            <div className={`p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-medium ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  Comparison Options
                </h3>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setComparisonMode('side-by-side')}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      comparisonMode === 'side-by-side'
                        ? isDarkMode 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-500 text-white'
                        : isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ArrowLeftRight size={16} className="inline mr-2" />
                    Side by Side
                  </button>
                  
                  <button
                    onClick={() => setComparisonMode('overlay')}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      comparisonMode === 'overlay'
                        ? isDarkMode 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-500 text-white'
                        : isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Users size={16} className="inline mr-2" />
                    Overlay
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Tabs */}
          {selectedFileObjects.length === 2 && comparisonResult && (
            <div className={`rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              {/* Tab Headers */}
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setActiveComparisonTab('stats')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeComparisonTab === 'stats'
                      ? isDarkMode
                        ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-400'
                        : 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                      : isDarkMode
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-600 hover:text-gray-700'
                  }`}
                >
                  <BarChart3 size={16} className="inline mr-2" />
                  File Statistics
                </button>
                <button
                  onClick={() => setActiveComparisonTab('matches')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeComparisonTab === 'matches'
                      ? isDarkMode
                        ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-400'
                        : 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                      : isDarkMode
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-600 hover:text-gray-700'
                  }`}
                >
                  <Target size={16} className="inline mr-2" />
                  Common Logs ({comparisonResult.matches.length})
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {activeComparisonTab === 'stats' ? (
                  /* File Statistics */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedFileObjects.map((file) => {
                      const stats = getLogStats(file!.id)
                      
                      return (
                        <div key={file!.id}>
                          <h4 className={`font-medium mb-3 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {file!.name}
                          </h4>
                          
                          <div className="space-y-2">
                            <div className={`flex justify-between text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <span>Total Entries:</span>
                              <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>
                                {stats.totalEntries.toLocaleString()}
                              </span>
                            </div>
                            
                            <div className={`flex justify-between text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <span>Errors:</span>
                              <span className="text-red-500">
                                {stats.levelCounts.ERROR || 0}
                              </span>
                            </div>
                            
                            <div className={`flex justify-between text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <span>Warnings:</span>
                              <span className="text-yellow-500">
                                {stats.levelCounts.WARNING || 0}
                              </span>
                            </div>
                            
                            <div className={`flex justify-between text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <span>Time Range:</span>
                              <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>
                                {Math.ceil((stats.timeRange.end.getTime() - stats.timeRange.start.getTime()) / (1000 * 60 * 60 * 24))} days
                              </span>
                            </div>
                            
                            <div className={`flex justify-between text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <span>Top Channels:</span>
                              <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>
                                {stats.topChannels.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  /* Common Logs Analysis */
                  <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-3 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Match Rate
                        </div>
                        <div className={`text-lg font-semibold ${
                          comparisonResult.stats.matchPercentage > 70 ? 'text-green-500' :
                          comparisonResult.stats.matchPercentage > 40 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {comparisonResult.stats.matchPercentage.toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className={`p-3 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Exact Matches
                        </div>
                        <div className={`text-lg font-semibold text-green-500`}>
                          {comparisonResult.stats.exactMatches}
                        </div>
                      </div>
                      
                      <div className={`p-3 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Similar Matches
                        </div>
                        <div className={`text-lg font-semibold text-blue-500`}>
                          {comparisonResult.stats.similarMatches}
                        </div>
                      </div>
                      
                      <div className={`p-3 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Unique Logs
                        </div>
                        <div className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {comparisonResult.stats.uniqueToFile1 + comparisonResult.stats.uniqueToFile2}
                        </div>
                      </div>
                    </div>

                    {/* Level Breakdown */}
                    <div>
                      <h4 className={`font-medium mb-3 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        Matches by Log Level
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(comparisonResult.stats.levelBreakdown).map(([level, data]) => (
                          <div key={level} className={`flex items-center justify-between p-2 rounded ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                          }`}>
                            <span className={`font-medium ${
                              level === 'ERROR' ? 'text-red-500' :
                              level === 'WARNING' ? 'text-yellow-500' :
                              level === 'INFO' ? 'text-blue-500' :
                              level === 'DEBUG' ? 'text-green-500' :
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {level}
                            </span>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {data.matches} matches of {Math.max(data.file1Count, data.file2Count)} total
                              <span className="ml-2 text-xs">
                                ({data.file1Count} | {data.file2Count})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Matching Logs Display */}
                    {comparisonResult.matches.length > 0 && (
                      <div>
                        <h4 className={`font-medium mb-3 ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          Matching Log Entries
                        </h4>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {comparisonResult.matches.slice(0, 20).map((match, index) => (
                            <div key={index} className={`p-3 rounded-lg border ${
                              match.matchType === 'exact'
                                ? isDarkMode
                                  ? 'bg-green-900/20 border-green-700'
                                  : 'bg-green-50 border-green-200'
                                : isDarkMode
                                  ? 'bg-blue-900/20 border-blue-700'
                                  : 'bg-blue-50 border-blue-200'
                            }`}>
                              <div className="flex items-start justify-between mb-2">
                                <div className={`flex items-center gap-2 text-xs ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {match.matchType === 'exact' ? (
                                    <CheckCircle size={14} className="text-green-500" />
                                  ) : (
                                    <AlertCircle size={14} className="text-blue-500" />
                                  )}
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    match.file1Entry.level === 'ERROR' ? 'bg-red-500 text-white' :
                                    match.file1Entry.level === 'WARNING' ? 'bg-yellow-500 text-white' :
                                    match.file1Entry.level === 'INFO' ? 'bg-blue-500 text-white' :
                                    'bg-green-500 text-white'
                                  }`}>
                                    {match.file1Entry.level}
                                  </span>
                                  <span>
                                    {match.matchType === 'exact' ? 'Exact Match' : `${(match.similarity * 100).toFixed(0)}% Similar`}
                                  </span>
                                </div>
                              </div>
                              <div className={`text-sm font-mono leading-relaxed ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {match.file1Entry.message}
                              </div>
                            </div>
                          ))}
                          {comparisonResult.matches.length > 20 && (
                            <div className={`text-center text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              ... and {comparisonResult.matches.length - 20} more matches
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comparison View */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              {comparisonMode === 'side-by-side' && selectedFiles.length === 2 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {selectedFileObjects.map((file) => (
                    <div key={file!.id}>
                      <h3 className={`font-medium mb-3 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {file!.name}
                      </h3>
                      <LogViewer fileId={file!.id} height={500} />
                    </div>
                  ))}
                </div>
              ) : (
                selectedFiles.map(fileId => {
                  const file = files.find(f => f.id === fileId)
                  return (
                    <div key={fileId}>
                      <h3 className={`font-medium mb-3 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {file?.name}
                      </h3>
                      <LogViewer fileId={fileId} height={400} />
                    </div>
                  )
                })
              )}
            </div>
          )}

          {selectedFiles.length === 0 && (
            <div className={`text-center py-12 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <GitCompare size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select Files to Compare</h3>
              <p>Choose up to 2 log files from the list above to start comparing</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}