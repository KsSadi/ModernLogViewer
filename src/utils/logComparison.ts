import { LogEntry } from '@/stores/logStore'
import { PerformanceMonitor } from './performance'

export interface LogMatch {
  file1Entry: LogEntry
  file2Entry: LogEntry
  matchType: 'exact' | 'similar'
  similarity: number
}

export interface ComparisonStats {
  totalFile1: number
  totalFile2: number
  exactMatches: number
  similarMatches: number
  uniqueToFile1: number
  uniqueToFile2: number
  matchPercentage: number
  levelBreakdown: {
    [level: string]: {
      file1Count: number
      file2Count: number
      matches: number
    }
  }
}

export interface ComparisonResult {
  matches: LogMatch[]
  stats: ComparisonStats
  uniqueToFile1: LogEntry[]
  uniqueToFile2: LogEntry[]
}

/**
 * Calculate text similarity using Jaro-Winkler algorithm (simplified version)
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0
  
  const len1 = str1.length
  const len2 = str2.length
  
  if (len1 === 0 || len2 === 0) return 0.0
  
  // Simple similarity based on common words and character overlap
  const words1 = str1.toLowerCase().split(/\s+/)
  const words2 = str2.toLowerCase().split(/\s+/)
  
  const commonWords = words1.filter(word => words2.includes(word))
  const totalWords = new Set([...words1, ...words2]).size
  
  const wordSimilarity = commonWords.length / Math.max(words1.length, words2.length)
  
  // Character-level similarity
  const maxLen = Math.max(len1, len2)
  const minLen = Math.min(len1, len2)
  const charSimilarity = minLen / maxLen
  
  // Levenshtein distance (simplified)
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
  const distanceSimilarity = 1 - (distance / maxLen)
  
  // Weighted average
  return (wordSimilarity * 0.4 + charSimilarity * 0.3 + distanceSimilarity * 0.3)
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

/**
 * Normalize log message for better comparison
 */
function normalizeMessage(message: string): string {
  return message
    .replace(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/g, '[TIMESTAMP]') // Remove timestamps
    .replace(/\b\d+\b/g, '[NUMBER]') // Replace numbers
    .replace(/\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g, '[UUID]') // Replace UUIDs
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Compare two log files and find matching entries - Optimized version
 */
export function compareLogFiles(
  file1Entries: LogEntry[],
  file2Entries: LogEntry[],
  similarityThreshold = 0.85
): ComparisonResult {
  const monitor = PerformanceMonitor.getInstance()
  
  return monitor.measure('compareLogFiles', () => {
    const matches: LogMatch[] = []
    const matched1 = new Set<string>()
    const matched2 = new Set<string>()
    
    // Initialize level breakdown
    const levelBreakdown: { [level: string]: { file1Count: number; file2Count: number; matches: number } } = {}
    
    // Count entries by level for both files - optimized
    const countByLevel = (entries: LogEntry[], target: 'file1Count' | 'file2Count') => {
      entries.forEach(entry => {
        if (!levelBreakdown[entry.level]) {
          levelBreakdown[entry.level] = { file1Count: 0, file2Count: 0, matches: 0 }
        }
        levelBreakdown[entry.level][target]++
      })
    }
    
    countByLevel(file1Entries, 'file1Count')
    countByLevel(file2Entries, 'file2Count')
    
    // Create lookup maps for faster searching
    const file2ByLevel = new Map<string, LogEntry[]>()
    file2Entries.forEach(entry => {
      if (!file2ByLevel.has(entry.level)) {
        file2ByLevel.set(entry.level, [])
      }
      file2ByLevel.get(entry.level)!.push(entry)
    })
    
    // Find matches - optimized with level-based lookup
    for (const entry1 of file1Entries) {
      if (matched1.has(entry1.id)) continue
      
      const candidatesForLevel = file2ByLevel.get(entry1.level)
      if (!candidatesForLevel) continue
      
      for (const entry2 of candidatesForLevel) {
        if (matched2.has(entry2.id)) continue
        
        const normalizedMsg1 = normalizeMessage(entry1.message)
        const normalizedMsg2 = normalizeMessage(entry2.message)
        
        // Check for exact match first (fastest)
        if (normalizedMsg1 === normalizedMsg2) {
          matches.push({
            file1Entry: entry1,
            file2Entry: entry2,
            matchType: 'exact',
            similarity: 1.0
          })
          matched1.add(entry1.id)
          matched2.add(entry2.id)
          levelBreakdown[entry1.level].matches++
          break
        }
        
        // Check for similar match only if exact match not found
        const similarity = calculateSimilarity(normalizedMsg1, normalizedMsg2)
        if (similarity >= similarityThreshold) {
          matches.push({
            file1Entry: entry1,
            file2Entry: entry2,
            matchType: 'similar',
            similarity
          })
          matched1.add(entry1.id)
          matched2.add(entry2.id)
          levelBreakdown[entry1.level].matches++
          break
        }
      }
    }
    
    // Get unique entries
    const uniqueToFile1 = file1Entries.filter(entry => !matched1.has(entry.id))
    const uniqueToFile2 = file2Entries.filter(entry => !matched2.has(entry.id))
    
    // Calculate statistics
    const exactMatches = matches.filter(m => m.matchType === 'exact').length
    const similarMatches = matches.filter(m => m.matchType === 'similar').length
    const totalMatches = exactMatches + similarMatches
    const totalEntries = Math.max(file1Entries.length, file2Entries.length)
    
    const stats: ComparisonStats = {
      totalFile1: file1Entries.length,
      totalFile2: file2Entries.length,
      exactMatches,
      similarMatches,
      uniqueToFile1: uniqueToFile1.length,
      uniqueToFile2: uniqueToFile2.length,
      matchPercentage: totalEntries > 0 ? (totalMatches / totalEntries) * 100 : 0,
      levelBreakdown
    }
    
    return {
      matches,
      stats,
      uniqueToFile1,
      uniqueToFile2
    }
  })
}