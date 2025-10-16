'use client'

import { useState } from 'react'
import Layout, { TabId } from '@/components/Layout'
import FileUpload from '@/components/FileUpload'
import LogFilters from '@/components/LogFilters'
import LogViewer from '@/components/LogViewer'
import LogAnalytics from '@/components/LogAnalytics'
import BookmarksView from '@/components/BookmarksView'
import ComparisonView from '@/components/ComparisonView'
import SettingsView from '@/components/SettingsView'
import { useLogStore } from '@/stores/logStore'
import { 
  Upload, 
  BarChart3, 
  FileText, 
  Star, 
  Download, 
  Trash2,
  Eye,
  TrendingUp
} from 'lucide-react'
import { LogParser } from '@/utils/logParser'

export default function Home() {
  const { 
    files, 
    activeFileId, 
    setActiveFile, 
    removeFile, 
    getFilteredEntries,
    getBookmarkedEntries,
    selectedEntries,
    clearSelection,
    isDarkMode 
  } = useLogStore()
  
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [logViewTab, setLogViewTab] = useState<'logs' | 'analytics'>('logs')
  
  const activeFile = files.find(f => f.id === activeFileId)
  const filteredEntries = getFilteredEntries()
  const bookmarkedEntries = getBookmarkedEntries()

  const handleExport = (format: 'json' | 'csv') => {
    const entries = selectedEntries.size > 0 
      ? filteredEntries.filter(e => selectedEntries.has(e.id))
      : filteredEntries

    if (entries.length === 0) {
      alert('No entries to export')
      return
    }

    const filename = `log-export-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}`
    
    if (format === 'json') {
      const content = LogParser.exportToJson(entries)
      LogParser.downloadFile(content, `${filename}.json`, 'application/json')
    } else {
      const content = LogParser.exportToCsv(entries)
      LogParser.downloadFile(content, `${filename}.csv`, 'text/csv')
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard()
      case 'logs':
        return renderLogs()
      case 'bookmarks':
        return <BookmarksView />
      case 'analytics':
        return <LogAnalytics />
      case 'comparison':
        return <ComparisonView />
      case 'settings':
        return <SettingsView />
      default:
        return renderDashboard()
    }
  }

  const renderDashboard = () => {
    if (files.length === 0) {
      return (
        <div className="text-center py-12">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
              isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'
            }`}>
              <Upload size={32} />
            </div>
            
            <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome to Modern Log Viewer
            </h1>
            
            <p className={`text-lg mb-8 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              A powerful, modern log analysis tool with advanced filtering, analytics, and visualization capabilities. 
              Upload your log files to get started.
            </p>

            <div className="max-w-2xl mx-auto">
              <FileUpload />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
              <FeatureCard
                icon={<BarChart3 size={24} />}
                title="Analytics Dashboard"
                description="Get insights with charts, statistics, and trend analysis"
              />
              <FeatureCard
                icon={<FileText size={24} />}
                title="Multi-Format Support"
                description="Laravel, JSON, Apache, Nginx, and custom log formats"
              />
              <FeatureCard
                icon={<Star size={24} />}
                title="Advanced Features"
                description="Bookmarks, regex search, export, and keyboard shortcuts"
              />
            </div>
          </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Dashboard Overview */}
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Dashboard
          </h2>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Overview of your log files and recent activity
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickStat
            label="Total Files"
            value={files.length.toString()}
            icon={<FileText size={16} />}
          />
          <QuickStat
            label="Total Entries"
            value={files.reduce((sum, file) => sum + file.entries.length, 0).toLocaleString()}
            icon={<Eye size={16} />}
          />
          <QuickStat
            label="Bookmarked"
            value={bookmarkedEntries.length.toString()}
            icon={<Star size={16} />}
          />
          <QuickStat
            label="Active Filters"
            value={Object.values(useLogStore.getState().filters).filter(v => 
              typeof v === 'boolean' ? v : Boolean(v)
            ).length.toString()}
            icon={<TrendingUp size={16} />}
          />
        </div>

        {/* Recent Files */}
        <div className={`p-6 rounded-xl ${isDarkMode ? 'glass-dark' : 'glass'} shadow-xl hover:shadow-2xl transition-shadow`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-800'
          }`}>
            Recent Files
          </h3>
          
          <div className="space-y-3">
            {files.slice(0, 5).map(file => (
              <div
                key={file.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  activeFileId === file.id
                    ? isDarkMode 
                      ? 'bg-blue-900/30 border border-blue-600' 
                      : 'bg-blue-50 border border-blue-300'
                    : isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-650' 
                      : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => {
                  setActiveFile(file.id)
                  setActiveTab('logs')
                }}
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
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveFile(file.id)
                      setActiveTab('analytics')
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-blue-400 hover:bg-blue-900/20' 
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                    title="View analytics"
                  >
                    <BarChart3 size={16} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(file.id)
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-red-400 hover:bg-red-900/20' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    title="Remove file"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {files.length === 0 && (
            <div className="text-center py-8">
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                No files uploaded yet
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FileUpload />
          <button
            onClick={() => setActiveTab('analytics')}
            disabled={files.length === 0}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              isDarkMode 
                ? 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-700 disabled:text-gray-500' 
                : 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-300 disabled:text-gray-500'
            } disabled:cursor-not-allowed`}
          >
            <BarChart3 size={18} />
            View Analytics
          </button>
          
          <button
            onClick={() => setActiveTab('bookmarks')}
            disabled={bookmarkedEntries.length === 0}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:bg-gray-800 disabled:text-gray-600' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:bg-gray-100 disabled:text-gray-400'
            } disabled:cursor-not-allowed`}
          >
            <Star size={18} />
            View Bookmarks ({bookmarkedEntries.length})
          </button>
        </div>
      </div>
    )
  }

  const renderLogs = () => {
    if (files.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText size={64} className={`mx-auto mb-4 ${
            isDarkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-xl font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            No Log Files
          </h3>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Upload some log files to start analyzing them
          </p>
          <FileUpload />
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Header with File Selector */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Log Analysis
            </h2>
            
            {/* File Selector */}
            <div className="flex items-center gap-3 mt-2">
              <select
                value={activeFileId || ''}
                onChange={(e) => setActiveFile(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {files.map(file => (
                  <option key={file.id} value={file.id}>
                    {file.name} ({file.entries.length.toLocaleString()} entries)
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => activeFileId && removeFile(activeFileId)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-red-400 hover:bg-red-900/20' 
                    : 'text-red-600 hover:bg-red-50'
                }`}
                title="Remove file"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleExport('json')}
              disabled={filteredEntries.length === 0}
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
              onClick={() => handleExport('csv')}
              disabled={filteredEntries.length === 0}
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

        {/* Quick Stats */}
        {activeFile && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickStat
              label="Total Entries"
              value={activeFile.entries.length.toLocaleString()}
              icon={<FileText size={16} />}
            />
            <QuickStat
              label="Filtered"
              value={filteredEntries.length.toLocaleString()}
              icon={<Eye size={16} />}
            />
            <QuickStat
              label="Selected"
              value={selectedEntries.size.toString()}
              icon={<Star size={16} />}
            />
            <QuickStat
              label="Bookmarked"
              value={bookmarkedEntries.length.toString()}
              icon={<Star size={16} />}
            />
          </div>
        )}

        {/* Tab Navigation */}
        <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="flex space-x-8">
            {[
              { id: 'logs', label: 'Log Entries', icon: <FileText size={16} /> },
              { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={16} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setLogViewTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  logViewTab === tab.id
                    ? isDarkMode
                      ? 'border-blue-400 text-blue-400'
                      : 'border-blue-500 text-blue-600'
                    : isDarkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {logViewTab === 'logs' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="xl:col-span-1">
              <LogFilters />
            </div>
            
            {/* Log Viewer */}
            <div className="xl:col-span-3">
              <LogViewer height={700} />
              
              {selectedEntries.size > 0 && (
                <div className={`mt-4 p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-blue-900/20 border-blue-700' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                      {selectedEntries.size} entries selected
                    </span>
                    <button
                      onClick={clearSelection}
                      className={`text-sm underline ${
                        isDarkMode 
                          ? 'text-blue-300 hover:text-blue-200' 
                          : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      Clear selection
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {logViewTab === 'analytics' && <LogAnalytics />}
      </div>
    )
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </Layout>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const { isDarkMode } = useLogStore()
  
  return (
    <div className={`p-6 rounded-xl ${isDarkMode ? 'glass-dark' : 'glass'} hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl group`}>
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 transition-all group-hover:scale-110 ${
        isDarkMode ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
      }`}>
        {icon}
      </div>
      <h3 className={`text-lg font-semibold mb-2 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        {title}
      </h3>
      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
        {description}
      </p>
    </div>
  )
}

interface QuickStatProps {
  label: string
  value: string
  icon: React.ReactNode
}

function QuickStat({ label, value, icon }: QuickStatProps) {
  const { isDarkMode } = useLogStore()
  
  return (
    <div className={`p-4 rounded-xl ${isDarkMode ? 'glass-dark' : 'glass'} hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl`}>
      <div className="flex items-center gap-2">
        <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          {icon}
        </div>
        <div>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {label}
          </p>
          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}