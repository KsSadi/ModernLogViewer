'use client'

import { ReactNode } from 'react'
import { useLogStore } from '@/stores/logStore'
import { Moon, Sun, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export type TabId = 'dashboard' | 'logs' | 'bookmarks' | 'analytics' | 'comparison' | 'settings'

interface LayoutProps {
  children: ReactNode
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const { isDarkMode, toggleDarkMode } = useLogStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showShortcutsToast, setShowShortcutsToast] = useState(false)

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: () => {
      // Focus search input or show search modal
      onTabChange('logs')
      setTimeout(() => {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
          searchInput.select()
        }
      }, 100)
    },
    onToggleBookmark: () => {
      // Show toast notification
      setShowShortcutsToast(true)
      setTimeout(() => setShowShortcutsToast(false), 2000)
    },
    onExport: () => {
      onTabChange('logs')
    },
    onEscape: () => {
      setIsSidebarOpen(false)
    }
  })

  return (
    <div className="min-h-screen transition-colors duration-200 relative">
      {/* Global Animated Background */}
      <div className={`fixed inset-0 pointer-events-none ${isDarkMode ? 'bg-gradient-mesh-dark' : 'bg-gradient-mesh'}`} style={{ zIndex: -1 }}>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Content Wrapper */}
      <div className={`relative min-h-screen ${
        isDarkMode ? 'dark text-white' : 'text-gray-900'
      }`}>

      {/* Keyboard Shortcuts Toast */}
      {showShortcutsToast && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className={`px-4 py-3 rounded-lg shadow-lg border ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 text-gray-200'
              : 'bg-white border-gray-200 text-gray-800'
          }`}>
            <p className="text-sm font-medium">Keyboard shortcuts are active!</p>
            <p className="text-xs mt-1 opacity-70">Press Ctrl+K to search</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-50 border-b ${
        isDarkMode
          ? 'glass-dark border-gray-700/50'
          : 'glass border-gray-200/50'
      } shadow-lg`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-800 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Modern Log Viewer
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Keyboard Shortcuts Indicator */}
            <button
              onClick={() => onTabChange('settings')}
              className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-750'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="View all keyboard shortcuts"
            >
              <kbd className={`px-1.5 py-0.5 text-xs rounded ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                Ctrl
              </kbd>
              <span>+</span>
              <kbd className={`px-1.5 py-0.5 text-xs rounded ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                K
              </kbd>
              <span className="ml-1">Search</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDarkMode
                  ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                  : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
              }`}
              title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode (Ctrl+D)`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDarkMode ? 'glass-dark border-gray-700/50' : 'glass border-gray-200/50'
        } border-r pt-16 shadow-2xl`}>
          <nav className="p-4 space-y-2">
            <SidebarItem tabId="dashboard" icon="" label="Dashboard" activeTab={activeTab} onTabChange={onTabChange} />
            <SidebarItem tabId="logs" icon="" label="Log Files" activeTab={activeTab} onTabChange={onTabChange} />
            <SidebarItem tabId="bookmarks" icon="" label="Bookmarks" activeTab={activeTab} onTabChange={onTabChange} />
            <SidebarItem tabId="analytics" icon="" label="Analytics" activeTab={activeTab} onTabChange={onTabChange} />
            <SidebarItem tabId="comparison" icon="" label="Compare Files" activeTab={activeTab} onTabChange={onTabChange} />
            <SidebarItem tabId="settings" icon="" label="Settings" activeTab={activeTab} onTabChange={onTabChange} />
          </nav>

          {/* Keyboard Shortcuts Helper */}
          <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${
            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
          }`}>
            <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Keyboard Shortcuts
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>Search</span>
                <kbd className={`px-1.5 py-0.5 rounded text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>Ctrl+K</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>Dark Mode</span>
                <kbd className={`px-1.5 py-0.5 rounded text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>Ctrl+D</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>Reset Filters</span>
                <kbd className={`px-1.5 py-0.5 rounded text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>Ctrl+R</kbd>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content area */}
        <main className={`flex-1 transition-all duration-200 ${
          isSidebarOpen ? 'lg:ml-64' : ''
        }`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Footer with Developer Credit - Full Width at Bottom */}
      <footer className={`border-t ${
        isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white/50'
      } backdrop-blur-sm mt-12`}>
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Laravel Log Tracker Advertisement */}
            <div className={`mb-6 p-6 rounded-xl border-2 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/50' 
                : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'
            } backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300`}>
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 p-3 rounded-lg ${
                  isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                }`}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-2 ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    🚀 Are you looking for a Log Tracker for your Laravel application?
                  </h3>
                  <p className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Check out the Laravel  <strong>Log Tracker</strong> Package - A powerful, easy-to-integrate logging solution for Laravel applications.
                  </p>
                  <a
                    href="https://github.com/KsSadi/Laravel-Log-Tracker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } shadow-md hover:shadow-lg hover:scale-105`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    View on GitHub
                  </a>
                </div>
              </div>
            </div>

            {/* Developer Credit */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>© 2025 Modern Log Viewer. All rights reserved.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Developed by
                </span>
                <a
                  href="https://www.linkedin.com/in/kssadi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } shadow-md hover:shadow-lg hover:scale-105`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Sadi
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

interface SidebarItemProps {
  tabId: TabId
  icon: string
  label: string
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

function SidebarItem({ tabId, icon, label, activeTab, onTabChange }: SidebarItemProps) {
  const { isDarkMode } = useLogStore()
  const isActive = activeTab === tabId

  return (
    <button
      onClick={() => onTabChange(tabId)}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left ${
        isActive
          ? isDarkMode
            ? 'bg-blue-600 text-white'
            : 'bg-blue-500 text-white'
          : isDarkMode
            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  )
}
