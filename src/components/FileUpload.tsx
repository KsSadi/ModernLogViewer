'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File as FileIcon, X, AlertCircle, CheckCircle, FileText } from 'lucide-react'
import { useLogStore } from '@/stores/logStore'
import { LogParser } from '@/utils/logParser'

export default function FileUpload() {
  const { addFile, isDarkMode } = useLogStore()
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showPasteModal, setShowPasteModal] = useState(false)
  const [pastedText, setPastedText] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    setUploadStatus(null)

    try {
      const results = await LogParser.parseMultipleFiles(acceptedFiles)

      results.forEach(({ file, entries }) => {
        const logFile = {
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          entries,
          uploadedAt: new Date()
        }
        addFile(logFile)
      })

      setUploadStatus({
        type: 'success',
        message: `Successfully uploaded ${results.length} file(s) with ${results.reduce((acc, r) => acc + r.entries.length, 0)} log entries`
      })

    } catch (error) {
      console.error('Error uploading files:', error)
      setUploadStatus({
        type: 'error',
        message: 'Failed to parse log files. Please check the format and try again.'
      })
    } finally {
      setUploading(false)
    }
  }, [addFile])

  const handlePasteSubmit = async () => {
    if (!pastedText.trim()) {
      alert('Please paste some log content')
      return
    }

    setUploading(true)
    setShowPasteModal(false)

    try {
      const blob = new Blob([pastedText], { type: 'text/plain' })
      const file = new File([blob], `pasted-logs-${Date.now()}.log`, { type: 'text/plain' })
      const results = await LogParser.parseMultipleFiles([file])

      results.forEach(({ file: f, entries }) => {
        const logFile = {
          id: `pasted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: f.name,
          size: f.size,
          entries,
          uploadedAt: new Date()
        }
        addFile(logFile)
      })

      setUploadStatus({
        type: 'success',
        message: `Successfully parsed ${results[0].entries.length} log entries from pasted content`
      })
      setPastedText('')

    } catch (error) {
      console.error('Error parsing pasted logs:', error)
      setUploadStatus({
        type: 'error',
        message: 'Failed to parse pasted logs. Please check the format and try again.'
      })
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.log', '.txt'],
      'application/json': ['.json'],
      'text/csv': ['.csv']
    },
    multiple: true,
    disabled: uploading
  })

  return (
    <>
      <div className="space-y-4">
        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200 ease-in-out
            ${isDragActive
              ? isDarkMode
                ? 'border-blue-400 bg-blue-500/10'
                : 'border-blue-500 bg-blue-50'
              : isDarkMode
                ? 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-4">
            <div className={`p-3 rounded-full ${
              isDragActive
                ? isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
            }`}>
              {uploading ? (
                <div className="animate-spin w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Upload size={24} />
              )}
            </div>

            <div>
              <p className={`text-lg font-semibold ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {uploading
                  ? 'Processing files...'
                  : isDragActive
                    ? 'Drop files here'
                    : 'Upload log files'
                }
              </p>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Drag & drop or click to select  .log, .txt, .json, .csv
              </p>
            </div>

            {!uploading && (
              <div className="flex flex-wrap gap-2 justify-center text-xs">
                {['Laravel', 'JSON Lines', 'Apache', 'Nginx', 'Custom'].map((format) => (
                  <span
                    key={format}
                    className={`px-2 py-1 rounded-full ${
                      isDarkMode
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {format}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* File List */}
        {acceptedFiles.length > 0 && (
          <div className={`p-4 rounded-lg border ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-medium mb-3 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Selected Files
            </h3>
            <div className="space-y-2">
              {acceptedFiles.map((file: File, index: number) => (
                <div key={index} className={`flex items-center gap-3 p-2 rounded ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <FileIcon size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {file.name}
                    </p>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Message */}
        {uploadStatus && (
          <div className={`flex items-center gap-3 p-4 rounded-lg ${
            uploadStatus.type === 'success'
              ? isDarkMode
                ? 'bg-green-900/30 border-green-700 text-green-300'
                : 'bg-green-50 border-green-200 text-green-800'
              : isDarkMode 
                ? 'bg-red-900/30 border-red-700 text-red-300'
                : 'bg-red-50 border-red-200 text-red-800'
          } border`}>
            {uploadStatus.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="flex-1">{uploadStatus.message}</span>
            <button
              onClick={() => setUploadStatus(null)}
              className={`p-1 rounded hover:bg-black/10 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Centered Quick Actions */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
            disabled={uploading}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300'
            } disabled:cursor-not-allowed`}
          >
            <Upload size={18} />
            Browse Files
          </button>

          <button
            onClick={() => setShowPasteModal(true)}
            disabled={uploading}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
              isDarkMode
                ? 'border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:bg-gray-800'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100'
            } disabled:cursor-not-allowed`}
          >
            <FileText size={18} />
            Paste Logs
          </button>
        </div>
      </div>

      {/* Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`relative w-full max-w-3xl rounded-xl shadow-2xl ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Paste Log Content
                </h2>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Copy and paste your log content below
                </p>
              </div>
              <button
                onClick={() => { setShowPasteModal(false); setPastedText('') }}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={'Paste your log content here...\n\nExample:\n[2024-01-15 10:30:15] local.ERROR: Database connection failed\n[2024-01-15 10:30:16] local.INFO: Retrying connection...'}
                className={`w-full h-96 p-4 rounded-lg border font-mono text-sm resize-none ${
                  isDarkMode
                    ? 'bg-gray-900 border-gray-600 text-gray-200 placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />

              <div className={`flex items-center gap-2 mt-3 text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <FileText size={16} />
                <span>Supports Laravel, JSON, Apache, Nginx, and custom log formats</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex justify-end gap-3 p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => { setShowPasteModal(false); setPastedText('') }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode
                    ? 'border border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handlePasteSubmit}
                disabled={!pastedText.trim()}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700'
                    : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300'
                } disabled:cursor-not-allowed`}
              >
                Parse Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
