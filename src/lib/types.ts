export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  source?: string;
  context?: Record<string, unknown>;
  extra?: Record<string, unknown>;
  isBookmarked?: boolean;
  channel?: string;
  environment?: string;
  lineNumber?: number;
}

export type LogLevel = 
  | 'EMERGENCY' 
  | 'ALERT' 
  | 'CRITICAL' 
  | 'ERROR' 
  | 'WARNING' 
  | 'NOTICE' 
  | 'INFO' 
  | 'DEBUG';

export interface LogFilter {
  level?: LogLevel;
  dateFrom?: Date;
  dateTo?: Date;
  searchText?: string;
  source?: string;
  environment?: string;
  showOnlyBookmarked?: boolean;
  regex?: boolean;
}

export interface LogStats {
  total: number;
  byLevel: Record<LogLevel, number>;
  byHour: Array<{ hour: string; count: number }>;
  topSources: Array<{ source: string; count: number }>;
  errorRate: number;
}

export interface ParsedLogFile {
  filename: string;
  entries: LogEntry[];
  stats: LogStats;
  parseErrors: string[];
}