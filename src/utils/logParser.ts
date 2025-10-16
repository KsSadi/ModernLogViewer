import { LogEntry } from '@/stores/logStore'

export class LogParser {
  static parseFile(content: string, fileName: string): LogEntry[] {
    const lines = content.split(/\r?\n/)
    
    // Try different parsing strategies
    const parsers = [
      this.parseLaravelLog,
      this.parseJsonLines,
      this.parseCustomLog,
      this.parseGenericLog
    ]

    for (const parser of parsers) {
      try {
        const result = parser.call(this, lines, fileName)
        if (result.length > 0) {
          return result
        }
      } catch (error) {
        console.warn(`Parser failed:`, error)
        continue
      }
    }

    // Fallback: treat each line as a simple log entry
    return this.parseGenericLog(lines, fileName)
  }

  private static parseLaravelLog(lines: string[], fileName: string): LogEntry[] {
    const entries: LogEntry[] = []
    const laravelRegex = /^\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\]\s+([\w\-\.]+)\.([A-Z]+):\s+(.*)$/

    lines.forEach((line, index) => {
      const match = line.match(laravelRegex)
      
      if (match) {
        const [, timestamp, environment, level, message] = match
        
        const entry: LogEntry = {
          id: `${fileName}-${index}-${Date.now()}`,
          timestamp: new Date(timestamp),
          level: level as LogEntry['level'],
          message: message,
          environment,
          sourceFile: fileName,
          lineNumber: index + 1
        }

        // Try to parse JSON context from message
        const jsonMatch = message.match(/^(.*?)(\{.*\})$/)
        if (jsonMatch) {
          try {
            const context = JSON.parse(jsonMatch[2])
            entry.message = jsonMatch[1].trim()
            entry.context = context
          } catch {
            // Keep original message if JSON parsing fails
          }
        }

        entries.push(entry)
      }
    })

    return entries
  }

  private static parseJsonLines(lines: string[], fileName: string): LogEntry[] {
    const entries: LogEntry[] = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('{')) return

      try {
        const json = JSON.parse(trimmed)
        
        // Common JSON log formats
        const entry: LogEntry = {
          id: `${fileName}-json-${index}-${Date.now()}`,
          timestamp: new Date(
            json.timestamp || 
            json.datetime || 
            json.time || 
            json['@timestamp'] || 
            new Date()
          ),
          level: (json.level_name || json.level || json.severity || 'INFO').toUpperCase(),
          message: json.message || json.msg || trimmed,
          context: json.context || json.extra || undefined,
          extra: json.extra || undefined,
          channel: json.channel || json.logger || undefined,
          environment: json.environment || json.env || undefined,
          sourceFile: fileName,
          lineNumber: index + 1
        }

        entries.push(entry)
      } catch {
        // Not valid JSON, skip
      }
    })

    return entries
  }

  private static parseCustomLog(lines: string[], fileName: string): LogEntry[] {
    const entries: LogEntry[] = []
    
    // Common custom log patterns
    const patterns = [
      // Apache/Nginx style: IP - - [timestamp] "request" status size
      /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"([^"]*?)"\s+(\d+)\s+(\d+)/,
      
      // Syslog style: timestamp hostname process[pid]: message
      /^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+(\S+?)(?:\[(\d+)\])?\s*:\s+(.*)$/,
      
      // Custom app log: [timestamp] [level] [component] message
      /^\[([^\]]+)\]\s*\[([^\]]+)\]\s*\[([^\]]+)\]\s+(.*)$/,
      
      // Simple timestamp + level: YYYY-MM-DD HH:mm:ss LEVEL message
      /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+([A-Z]+)\s+(.*)$/
    ]

    lines.forEach((line, index) => {
      if (!line.trim()) return

      for (const pattern of patterns) {
        const match = line.match(pattern)
        if (match) {
          let timestamp: Date
          let level: string = 'INFO'
          let message: string = line

          if (pattern.source.includes('timestamp hostname')) {
            // Syslog pattern
            timestamp = new Date(match[1])
            message = match[5]
          } else if (pattern.source.includes('component')) {
            // Custom app log
            timestamp = new Date(match[1])
            level = match[2].toUpperCase()
            message = match[4]
          } else if (pattern.source.includes('YYYY-MM-DD')) {
            // Simple timestamp + level
            timestamp = new Date(match[1])
            level = match[2]
            message = match[3]
          } else {
            // Apache/Nginx or other
            timestamp = new Date(match[2] || new Date())
            message = match[3] || line
          }

          entries.push({
            id: `${fileName}-custom-${index}-${Date.now()}`,
            timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp,
            level: level as LogEntry['level'],
            message,
            sourceFile: fileName,
            lineNumber: index + 1
          })
          
          break
        }
      }
    })

    return entries
  }

  private static parseGenericLog(lines: string[], fileName: string): LogEntry[] {
    const entries: LogEntry[] = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (!trimmed) return

      // Try to extract timestamp from beginning of line
      const timestampMatch = trimmed.match(/^(\d{4}[-\/]\d{2}[-\/]\d{2}[\s\T]\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:?\d{2})?)/)
      const timestamp = timestampMatch ? new Date(timestampMatch[1]) : new Date()

      // Try to detect log level
      const levelMatch = trimmed.match(/\b(DEBUG|INFO|NOTICE|WARNING|WARN|ERROR|CRITICAL|ALERT|EMERGENCY|FATAL)\b/i)
      const level = levelMatch ? levelMatch[1].toUpperCase() : 'INFO'

      entries.push({
        id: `${fileName}-generic-${index}-${Date.now()}`,
        timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp,
        level: level as LogEntry['level'],
        message: trimmed,
        sourceFile: fileName,
        lineNumber: index + 1
      })
    })

    return entries
  }

  static async parseMultipleFiles(files: File[]): Promise<Array<{ file: File; entries: LogEntry[] }>> {
    const results = await Promise.all(
      files.map(async (file) => {
        const content = await this.readFileContent(file)
        const entries = this.parseFile(content, file.name)
        return { file, entries }
      })
    )
    
    return results
  }

  private static readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  // Export utilities
  static exportToJson(entries: LogEntry[]): string {
    return JSON.stringify(entries, null, 2)
  }

  static exportToCsv(entries: LogEntry[]): string {
    if (entries.length === 0) return ''

    const headers = ['Timestamp', 'Level', 'Message', 'Channel', 'Environment', 'Source File', 'Line Number']
    const csvRows = [headers.join(',')]

    entries.forEach(entry => {
      const row = [
        entry.timestamp.toISOString(),
        entry.level,
        `"${entry.message.replace(/"/g, '""')}"`,
        entry.channel || '',
        entry.environment || '',
        entry.sourceFile || '',
        entry.lineNumber?.toString() || ''
      ]
      csvRows.push(row.join(','))
    })

    return csvRows.join('\n')
  }

  static downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}